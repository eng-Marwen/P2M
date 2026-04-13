import uuid

from qdrant_client.http import models as qdrant_models
from app.services.rag_service.emebdding_service import generate_embedding, house_to_text
from app.databases.qdrant import get_qdrant_client

QDRANT_COLLECTION = "houses_vectors"

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
        return str(uuid.uuid5(uuid.NAMESPACE_URL, f"house:{candidate}"))

def _upsert_house_vector(house: dict) -> None:
    house_id = house.get("id") or house.get("_id")
    if not house_id:
        raise ValueError("Missing house id for vector upsert")

    embedding = generate_embedding(house_to_text(house))
    client = get_qdrant_client()

    point_id = _to_qdrant_point_id(str(house_id))
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
    print(f"Upserted vector for house_id: {house_id}")

def create_vector(house):
    _upsert_house_vector(house)

def update_vector(house):
    _upsert_house_vector(house)

def delete_vector(house_id):
    if not house_id:
        raise ValueError("Missing house id for delete_vector")

    client = get_qdrant_client()
    point_id = _to_qdrant_point_id(str(house_id))
    client.delete(
        collection_name=QDRANT_COLLECTION,
        points_selector=qdrant_models.PointIdsList(points=[point_id]),
        wait=True,
    )