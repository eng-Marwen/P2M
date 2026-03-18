import asyncio
import json
import os
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


def _generate_answer_sync(query: str, hits: list[dict]) -> str:
    client = _get_groq_client()

    if not hits:
        return "I could not find relevant listings in the knowledge base for your query."

    context_json = json.dumps(hits, ensure_ascii=False, indent=2)

    prompt = (
        "You are a real-estate assistant. Use the retrieved listing context to answer the user query. "
        "If context is insufficient, say what is missing. Be concise and practical.\n\n"
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


async def run_rag_query(query: str, top_k: int) -> dict:
    hits = await asyncio.to_thread(_search_houses, query, top_k)
    answer = await asyncio.to_thread(_generate_answer_sync, query, hits)

    return {
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
