import asyncio
import json
import os
import re
import uuid
from functools import lru_cache
from urllib.parse import urlparse

from dotenv import load_dotenv
from groq import Groq
from qdrant_client import QdrantClient
from redis.asyncio import Redis

from app.services.emebdding_service import generate_embedding


load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "houses_vectors")
QDRANT_ALLOW_INSECURE_API_KEY = (
    os.getenv("QDRANT_ALLOW_INSECURE_API_KEY", "false").lower() == "true"
)

RAG_LLM_MODEL = os.getenv("RAG_LLM_MODEL", "llama-3.3-70b-versatile")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
RAG_MEMORY_KEY_PREFIX = os.getenv("RAG_MEMORY_KEY_PREFIX", "rag:session")
RAG_MEMORY_MAX_TURNS = int(os.getenv("RAG_MEMORY_MAX_TURNS", "8"))
RAG_MEMORY_SESSION_TTL_SECONDS = int(os.getenv("RAG_MEMORY_SESSION_TTL_SECONDS", "7200"))


def _session_key(session_id: str) -> str:
    return f"{RAG_MEMORY_KEY_PREFIX}:{session_id}:messages"


@lru_cache(maxsize=1)
def _get_redis_client() -> Redis:
    if not REDIS_URL:
        raise ValueError("REDIS_URL is missing")
    return Redis.from_url(REDIS_URL, decode_responses=True)


async def _ensure_session(session_id: str | None) -> str:
    sid = (session_id or "").strip() or str(uuid.uuid4())
    key = _session_key(sid)
    redis = _get_redis_client()

    await redis.expire(key, RAG_MEMORY_SESSION_TTL_SECONDS)
    return sid


async def _get_session_messages(session_id: str) -> list[dict[str, str]]:
    redis = _get_redis_client()
    key = _session_key(session_id)

    raw_items = await redis.lrange(key, 0, -1)
    messages: list[dict[str, str]] = []

    for raw in raw_items:
        try:
            item = json.loads(raw)
            role = item.get("role")
            content = item.get("content")
            if role in {"user", "assistant"} and isinstance(content, str):
                messages.append({"role": role, "content": content})
        except (TypeError, json.JSONDecodeError):
            continue

    await redis.expire(key, RAG_MEMORY_SESSION_TTL_SECONDS)
    return messages


async def _append_session_messages(session_id: str, user_query: str, assistant_answer: str) -> None:
    redis = _get_redis_client()
    key = _session_key(session_id)

    entries = [
        json.dumps({"role": "user", "content": user_query}, ensure_ascii=False),
        json.dumps({"role": "assistant", "content": assistant_answer}, ensure_ascii=False),
    ]

    max_items = max(RAG_MEMORY_MAX_TURNS * 2, 2)

    pipeline = redis.pipeline(transaction=True)
    pipeline.rpush(key, *entries)
    pipeline.ltrim(key, -max_items, -1)
    pipeline.expire(key, RAG_MEMORY_SESSION_TTL_SECONDS)
    await pipeline.execute()


def _history_to_text(history: list[dict[str, str]]) -> str:
    if not history:
        return "(empty)"

    lines = []
    for item in history[-(RAG_MEMORY_MAX_TURNS * 2):]:
        role = item.get("role", "user")
        content = _sanitize_text_for_llm((item.get("content") or "").strip())
        if not content:
            continue
        speaker = "User" if role == "user" else "Assistant"
        lines.append(f"{speaker}: {content}")
    return "\n".join(lines) if lines else "(empty)"


def _sanitize_text_for_llm(text: str) -> str:
    if not text:
        return text

    # Remove explicit "ID: <mongodb-objectid>" mentions
    text = re.sub(r"\(\s*ID\s*:\s*[a-f0-9]{24}\s*\)", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\bID\s*:\s*[a-f0-9]{24}\b", "ID: [hidden]", text, flags=re.IGNORECASE)

    # Remove standalone MongoDB ObjectId-like values
    text = re.sub(r"\b[a-f0-9]{24}\b", "[hidden-id]", text, flags=re.IGNORECASE)

    return text


def _build_retrieval_query(query: str, history: list[dict[str, str]]) -> str:
    short_query = len(query.split()) <= 4
    if not short_query:
        return query

    latest_user_message = ""
    for item in reversed(history):
        if item.get("role") == "user":
            latest_user_message = (item.get("content") or "").strip()
            if latest_user_message:
                break

    if not latest_user_message:
        return query

    return f"Previous user intent: {latest_user_message}\nCurrent follow-up: {query}"


@lru_cache(maxsize=1)
def _get_qdrant_client() -> QdrantClient:
    scheme = urlparse(QDRANT_URL).scheme.lower()
    use_api_key = bool(QDRANT_API_KEY)

    if use_api_key and scheme == "http" and not QDRANT_ALLOW_INSECURE_API_KEY:
        print(
            "[RAG] QDRANT_API_KEY is set but QDRANT_URL uses HTTP. "
            "Skipping API key to avoid insecure-connection warning. "
            "Set QDRANT_ALLOW_INSECURE_API_KEY=true to force it."
        )
        use_api_key = False

    client = QDRANT_API_KEY if use_api_key else None
    return QdrantClient(url=QDRANT_URL, api_key=client)


@lru_cache(maxsize=1)
def _get_groq_client() -> Groq:
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing")
    return Groq(api_key=GROQ_API_KEY)


def _search_houses(query: str, top_k: int) -> list[dict]:
    embedding = generate_embedding(query)
    client = _get_qdrant_client()

    points = []
    try:
        # Older qdrant-client API
        points = client.search(
            collection_name=QDRANT_COLLECTION,
            query_vector=embedding,
            limit=top_k,
            with_payload=True,
            with_vectors=False,
        )
    except AttributeError:
        # Newer qdrant-client API
        result = client.query_points(
            collection_name=QDRANT_COLLECTION,
            query=embedding,
            limit=top_k,
            with_payload=True,
            with_vectors=False,
        )
        points = getattr(result, "points", result)

    hits: list[dict] = []
    for point in points:
        payload = point.payload or {}
        hits.append(
            {
                "house_id": str(payload.get("house_id") or point.id),
                "score": float(point.score),
                "name": payload.get("name"),
                "address": payload.get("address"),
                "type": payload.get("type"),
                "regularPrice": payload.get("regularPrice"),
                "discountedPrice": payload.get("discountedPrice"),
                "description": payload.get("description"),
                "embedding_text": payload.get("embedding_text"),
            }
        )

    return hits


def _generate_answer_sync(query: str, hits: list[dict], history: list[dict[str, str]]) -> str:
    client = _get_groq_client()

    if not hits:
        return "I could not find relevant listings in the knowledge base for your query."

    context_hits = [
        {
            "score": h.get("score"),
            "name": h.get("name"),
            "address": h.get("address"),
            "type": h.get("type"),
            "regularPrice": h.get("regularPrice"),
            "discountedPrice": h.get("discountedPrice"),
            "description": h.get("description"),
        }
        for h in hits
    ]
    context_json = json.dumps(context_hits, ensure_ascii=False, indent=2)
    history_text = _history_to_text(history)

    safe_query = _sanitize_text_for_llm(query)

    prompt = (
        "You are a real-estate assistant. Use the retrieved listing context to answer the user query. "
        "If context is insufficient, say what is missing. Be concise and practical.\n\n"
        f"Conversation history:\n{history_text}\n\n"
        f"User query:\n{safe_query}\n\n"
        f"Retrieved context:\n{context_json}"
    )

    response = client.chat.completions.create(
        model=RAG_LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "Answer only using the provided retrieval context. "
                    "Do not invent unavailable listing details. "
                    "Never reveal or mention internal IDs (house IDs, database IDs, object IDs)."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=600,
    )

    return (response.choices[0].message.content or "").strip()


async def run_rag_query(query: str, top_k: int, session_id: str | None = None) -> dict:
    session_id = await _ensure_session(session_id)
    history = await _get_session_messages(session_id)
    retrieval_query = _build_retrieval_query(query, history)

    hits = await asyncio.to_thread(_search_houses, retrieval_query, top_k)
    answer = await asyncio.to_thread(_generate_answer_sync, query, hits, history)
    await _append_session_messages(session_id, query, answer)

    return {
        "session_id": session_id,
        "query": query,
        "answer": answer,
        "total_hits": len(hits),
        "hits": [
            {
                "score": h["score"],
                "listing_url": f"/listing/{h['house_id']}" if h.get("house_id") else None,
                "name": h.get("name"),
                "address": h.get("address"),
                "type": h.get("type"),
                "regularPrice": h.get("regularPrice"),
                "discountedPrice": h.get("discountedPrice"),
                "description": h.get("description"),
            }
            for h in hits
        ],
    }
