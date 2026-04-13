import asyncio
import json
import os
import re
import uuid
from dotenv import load_dotenv
from groq import Groq
from functools import lru_cache
from app.databases.qdrant import get_qdrant_client
from app.databases.redis import get_redis_client
from app.services.rag_service.emebdding_service import generate_embedding

load_dotenv()

COLLECTION = "houses_vectors"
MODEL = "llama-3.3-70b-versatile"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SESSION_PREFIX = "rag:session"
MAX_TURNS = 8
SESSION_TTL = 7200

# --Redis helpers--
def _key(sid: str) -> str:
    return f"{SESSION_PREFIX}:{sid}:messages"

async def _load_history(session_id: str | None) -> tuple[str, list[dict]]:
    sid = (session_id or "").strip() or str(uuid.uuid4())
    redis = get_redis_client()
    raw = await redis.lrange(_key(sid), 0, -1)
    await redis.expire(_key(sid), SESSION_TTL)
    history = []
    for item in raw:
        try:
            msg = json.loads(item)
            if msg.get("role") in {"user", "assistant"} and isinstance(msg.get("content"), str):
                history.append(msg)
        except (TypeError, json.JSONDecodeError):
            continue
    return sid, history

async def _save_history(sid: str, query: str, answer: str) -> None:
    redis = get_redis_client()
    key = _key(sid)
    entries = [
        json.dumps({"role": "user", "content": query}, ensure_ascii=False),
        json.dumps({"role": "assistant", "content": answer}, ensure_ascii=False),
    ]
    pipe = redis.pipeline(transaction=True)
    pipe.rpush(key, *entries)
    pipe.ltrim(key, -(MAX_TURNS * 2), -1)
    pipe.expire(key, SESSION_TTL)
    await pipe.execute()

async def clear_rag_session_history(session_id: str | None) -> bool:
    sid = (session_id or "").strip()
    return bool(sid and await get_redis_client().delete(_key(sid)))

# --Utilities--

def _sanitize(text: str) -> str:
    text = re.sub(r"\(\s*ID\s*:\s*[a-f0-9]{24}\s*\)", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\bID\s*:\s*[a-f0-9]{24}\b", "ID: [hidden]", text, flags=re.IGNORECASE)
    text = re.sub(r"\b[a-f0-9]{24}\b", "[hidden-id]", text, flags=re.IGNORECASE)
    return text

def _history_to_text(history: list[dict]) -> str:
    if not history:
        return "(empty)"
    lines = []
    for msg in history[-(MAX_TURNS * 2):]:
        role = "User" if msg.get("role") == "user" else "Assistant"
        content = _sanitize((msg.get("content") or "").strip())
        if content:
            lines.append(f"{role}: {content}")
    return "\n".join(lines) or "(empty)"

# --Core RAG--

@lru_cache(maxsize=1)
def _groq_client() -> Groq:
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing")
    return Groq(api_key=GROQ_API_KEY)

def _search(query: str, top_k: int) -> list[dict]:
    embedding = generate_embedding(query)
    client = get_qdrant_client()

    try:
        points = client.search(
            collection_name=COLLECTION, query_vector=embedding,
            limit=top_k, with_payload=True, with_vectors=False,
        )
    except AttributeError:
        result = client.query_points(
            collection_name=COLLECTION, query=embedding,
            limit=top_k, with_payload=True, with_vectors=False,
        )
        points = getattr(result, "points", result)

    return [
        {
            "house_id": str((p.payload or {}).get("house_id") or p.id),
            "score": float(p.score),
            **{k: (p.payload or {}).get(k) for k in ("name", "address", "type", "regularPrice", "discountedPrice", "description")},
        }
        for p in points
    ]

def _generate_answer(query: str, hits: list[dict], history: list[dict]) -> str:
    if not hits:
        return "I could not find relevant listings for your query."
    context = json.dumps([
        {k: h.get(k) for k in ("score", "name", "address", "type", "regularPrice", "discountedPrice", "description")}
        for h in hits
    ], ensure_ascii=False, indent=2)
    prompt = (
        "You are a real-estate assistant. Use the retrieved listing context to answer the user query. "
        "If context is insufficient, say what is missing. Be concise and practical.\n\n"
        f"Conversation history:\n{_history_to_text(history)}\n\n"
        f"User query:\n{_sanitize(query)}\n\n"
        f"Retrieved context:\n{context}"
    )
    response = _groq_client().chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": (
                "Answer only using the provided retrieval context. "
                "Do not invent unavailable listing details. "
                "Never reveal or mention internal IDs."
            )},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=600,
    )
    return (response.choices[0].message.content or "").strip()

async def run_rag_query(query: str, top_k: int, session_id: str | None = None) -> dict:
    sid, history = await _load_history(session_id)
    hits = await asyncio.to_thread(_search, query, top_k)
    answer = await asyncio.to_thread(_generate_answer, query, hits, history)
    await _save_history(sid, query, answer)
    return {
        "session_id": sid,
        "query": query,
        "answer": answer,
        "total_hits": len(hits),
        "hits": [
            {
                "score": h["score"],
                "listing_url": f"/listing/{h['house_id']}" if h.get("house_id") else None,
                **{k: h.get(k) for k in ("name", "address", "type", "regularPrice", "discountedPrice", "description")},
            }
            for h in hits
        ],
    }