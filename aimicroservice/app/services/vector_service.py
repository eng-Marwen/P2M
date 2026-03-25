from app.services.emebdding_service import generate_embedding, house_to_text
from functools import lru_cache
import os
import uuid

from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models


QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "houses_vectors")
QDRANT_RECREATE_ON_DIM_MISMATCH = (
    os.getenv("QDRANT_RECREATE_ON_DIM_MISMATCH", "true").lower() == "true"
)


@lru_cache(maxsize=1)
def _get_qdrant_client() -> QdrantClient:
    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    # lightweight connectivity check
    client.get_collections()
    print(f"[Qdrant] Connected successfully: {QDRANT_URL}")
    return client


def check_qdrant_connection() -> None:
    _get_qdrant_client()
    print("[Startup] Qdrant connectivity check passed")


def _extract_collection_vector_size(collection_info) -> int | None:
    vectors = collection_info.config.params.vectors

    # single-vector collection
    if hasattr(vectors, "size"):
        return int(vectors.size)

    # named-vectors collection (dict-like)
    if isinstance(vectors, dict) and vectors:
        first_cfg = next(iter(vectors.values()))
        if hasattr(first_cfg, "size"):
            return int(first_cfg.size)

    return None


def _ensure_collection(client: QdrantClient, vector_size: int) -> None:
    exists = False
    try:
        exists = client.collection_exists(collection_name=QDRANT_COLLECTION)
    except Exception:
        try:
            client.get_collection(collection_name=QDRANT_COLLECTION)
            exists = True
        except Exception:
            exists = False

    if not exists:
        client.create_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config=qdrant_models.VectorParams(
                size=vector_size,
                distance=qdrant_models.Distance.COSINE,
            ),
        )
        print(f"[Qdrant] Collection created: {QDRANT_COLLECTION}")
        return

    info = client.get_collection(collection_name=QDRANT_COLLECTION)
    existing_size = _extract_collection_vector_size(info)

    if existing_size is None:
        print(
            f"[Qdrant] Could not determine existing vector size for {QDRANT_COLLECTION}. "
            "Proceeding without recreation check."
        )
        return

    if existing_size == vector_size:
        return

    message = (
        f"[Qdrant] Vector dimension mismatch for {QDRANT_COLLECTION}: "
        f"existing={existing_size}, incoming={vector_size}"
    )

    if not QDRANT_RECREATE_ON_DIM_MISMATCH:
        raise ValueError(
            message
            + ". Set QDRANT_RECREATE_ON_DIM_MISMATCH=true to auto-recreate collection."
        )

    print(message + ". Recreating collection...")
    client.delete_collection(collection_name=QDRANT_COLLECTION)
    client.create_collection(
        collection_name=QDRANT_COLLECTION,
        vectors_config=qdrant_models.VectorParams(
            size=vector_size,
            distance=qdrant_models.Distance.COSINE,
        ),
    )
    print(
        f"[Qdrant] Collection recreated: {QDRANT_COLLECTION} with vector size {vector_size}"
    )


def _build_payload(house: dict) -> dict:
    return {
        "house_id": str(house.get("id") or house.get("_id") or ""),
        "name": house.get("name"),
        "description": house.get("description"),
        "address": house.get("address"),
        "type": house.get("type"),
        "offer": house.get("offer"),
        "parking": house.get("parking"),
        "furnished": house.get("furnished"),
        "regularPrice": house.get("regularPrice"),
        "discountedPrice": house.get("discountedPrice"),
        "embedding_text": house_to_text(house),
    }


def _to_qdrant_point_id(house_id: str) -> str:
    candidate = str(house_id)
    try:
        return str(uuid.UUID(candidate))
    except ValueError:
        # Deterministic UUID so update/delete target the same point for this house id.
        return str(uuid.uuid5(uuid.NAMESPACE_URL, f"house:{candidate}"))


def create_vector(house):
    embedding_text = house_to_text(house)
    house_id = house.get("id") or house.get("_id")
    if not house_id:
        raise ValueError("Missing house id for create_vector")

    embedding = generate_embedding(embedding_text)
    client = _get_qdrant_client()
    _ensure_collection(client, vector_size=len(embedding))

    point_id = _to_qdrant_point_id(str(house_id))
    print(f"[Qdrant] Upsert mapping house_id={house_id} -> point_id={point_id}")
    client.upsert(
        collection_name=QDRANT_COLLECTION,
        points=[
            qdrant_models.PointStruct(
                id=point_id,
                vector=embedding,
                payload=_build_payload(house),
            )
        ],
        wait=True,
    )
    print(f"[Qdrant] Vector created for house: {house_id}")


def update_vector(house):
    embedding_text = house_to_text(house)
    house_id = house.get("id") or house.get("_id")
    if not house_id:
        raise ValueError("Missing house id for update_vector")

    embedding = generate_embedding(embedding_text)
    client = _get_qdrant_client()
    _ensure_collection(client, vector_size=len(embedding))

    point_id = _to_qdrant_point_id(str(house_id))
    print(f"[Qdrant] Upsert mapping house_id={house_id} -> point_id={point_id}")
    client.upsert(
        collection_name=QDRANT_COLLECTION,
        points=[
            qdrant_models.PointStruct(
                id=point_id,
                vector=embedding,
                payload=_build_payload(house),
            )
        ],
        wait=True,
    )
    print(f"[Qdrant] Vector updated for house: {house_id}")


def delete_vector(house_id):
    if not house_id:
        raise ValueError("Missing house id for delete_vector")

    client = _get_qdrant_client()
    point_id = _to_qdrant_point_id(str(house_id))
    print(f"[Qdrant] Delete mapping house_id={house_id} -> point_id={point_id}")
    client.delete(
        collection_name=QDRANT_COLLECTION,
        points_selector=qdrant_models.PointIdsList(points=[point_id]),
        wait=True,
    )
    print(f"[Qdrant] Vector deleted for house: {house_id}")