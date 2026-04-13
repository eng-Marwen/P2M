import os
from functools import lru_cache
from dotenv import load_dotenv
from qdrant_client import QdrantClient

load_dotenv()

def _ensure_collection(client: QdrantClient) -> None:
    collections = client.get_collections().collections
    exists = any(c.name == "houses_vectors" for c in collections)
    if exists:
        return

    client.create_collection(
        collection_name="houses_vectors",
        vectors_config={"size": 1024, "distance": "Cosine"}
    )
    
@lru_cache(maxsize=1)
def get_qdrant_client() -> QdrantClient:
    client = QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY"),
    )
    try:
        client.get_collections()
    except Exception as exc:
        raise RuntimeError(f"Qdrant connectivity check failed: {exc}") from exc

    _ensure_collection(client)
    return client

def check_qdrant_connection() -> None:
    get_qdrant_client()
    print("connected to qdrant")
