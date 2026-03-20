import asyncio
import json
import os
import threading
import time
import uuid
from functools import lru_cache
from urllib.parse import urlparse

from dotenv import load_dotenv
from groq import Groq
from qdrant_client import QdrantClient

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
RAG_MEMORY_MAX_TURNS = int(os.getenv("RAG_MEMORY_MAX_TURNS", "8"))
RAG_MEMORY_SESSION_TTL_SECONDS = int(os.getenv("RAG_MEMORY_SESSION_TTL_SECONDS", "7200"))
RAG_MEMORY_MAX_SESSIONS = int(os.getenv("RAG_MEMORY_MAX_SESSIONS", "1000"))


_session_memory: dict[str, dict] = {}
_session_memory_lock = threading.Lock()


def _prune_sessions_locked(now: float) -> None:
    expired_ids = [
        sid
        for sid, data in _session_memory.items()
        if now - float(data.get("updated_at", 0.0)) > RAG_MEMORY_SESSION_TTL_SECONDS
    ]
    for sid in expired_ids:
        _session_memory.pop(sid, None)

    if len(_session_memory) > RAG_MEMORY_MAX_SESSIONS:
        oldest_ids = sorted(
            _session_memory.keys(),
            key=lambda sid: float(_session_memory[sid].get("updated_at", 0.0)),
        )
        overflow = len(_session_memory) - RAG_MEMORY_MAX_SESSIONS
        for sid in oldest_ids[:overflow]:
            _session_memory.pop(sid, None)


def _ensure_session(session_id: str | None) -> str:
    now = time.time()
    with _session_memory_lock:
        _prune_sessions_locked(now)

        sid = (session_id or "").strip()
        if not sid:
            sid = str(uuid.uuid4())

        session = _session_memory.get(sid)
        if not session:
            _session_memory[sid] = {"updated_at": now, "messages": []}
        else:
            session["updated_at"] = now

    return sid


def _get_session_messages(session_id: str) -> list[dict[str, str]]:
    with _session_memory_lock:
        session = _session_memory.get(session_id)
        if not session:
            return []
        return list(session.get("messages", []))


def _append_session_messages(session_id: str, user_query: str, assistant_answer: str) -> None:
    now = time.time()
    with _session_memory_lock:
        session = _session_memory.setdefault(session_id, {"updated_at": now, "messages": []})
        messages = session.setdefault("messages", [])

        messages.append({"role": "user", "content": user_query})
        messages.append({"role": "assistant", "content": assistant_answer})

        max_items = max(RAG_MEMORY_MAX_TURNS * 2, 2)
        if len(messages) > max_items:
            del messages[:-max_items]

        session["updated_at"] = now


def _history_to_text(history: list[dict[str, str]]) -> str:
    if not history:
        return "(empty)"

    lines = []
    for item in history[-(RAG_MEMORY_MAX_TURNS * 2):]:
        role = item.get("role", "user")
        content = (item.get("content") or "").strip()
        if not content:
            continue
        speaker = "User" if role == "user" else "Assistant"
        lines.append(f"{speaker}: {content}")
    return "\n".join(lines) if lines else "(empty)"


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

    context_json = json.dumps(hits, ensure_ascii=False, indent=2)
    history_text = _history_to_text(history)

    prompt = (
        "You are a real-estate assistant. Use the retrieved listing context to answer the user query. "
        "If context is insufficient, say what is missing. Be concise and practical.\n\n"
        f"Conversation history:\n{history_text}\n\n"
        f"User query:\n{query}\n\n"
        f"Retrieved context:\n{context_json}"
    )

    response = client.chat.completions.create(
        model=RAG_LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "Answer only using the provided retrieval context. "
                    "Do not invent unavailable listing details."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=600,
    )

    return (response.choices[0].message.content or "").strip()


async def run_rag_query(query: str, top_k: int, session_id: str | None = None) -> dict:
    session_id = _ensure_session(session_id)
    history = _get_session_messages(session_id)
    retrieval_query = _build_retrieval_query(query, history)

    hits = await asyncio.to_thread(_search_houses, retrieval_query, top_k)
    answer = await asyncio.to_thread(_generate_answer_sync, query, hits, history)
    _append_session_messages(session_id, query, answer)

    return {
        "session_id": session_id,
        "query": query,
        "answer": answer,
        "total_hits": len(hits),
        "hits": [
            {
                "house_id": h["house_id"],
                "score": h["score"],
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
