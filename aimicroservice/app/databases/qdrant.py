import os
from functools import lru_cache

from dotenv import load_dotenv
from qdrant_client import QdrantClient

load_dotenv()

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

    return client

def check_qdrant_connection() -> None:
    get_qdrant_client()
    print("connected to qdrant")
