import sys
from pathlib import Path

import httpx
import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import app.main as main
import app.routes.enhance as enhance_routes
import app.routes.house_price as house_price_routes
import app.routes.house_validation as house_validation_routes
import app.routes.rag as rag_routes


@pytest.fixture(autouse=True)
def _patch_lifespan_dependencies(monkeypatch):
    async def _noop_async():
        return None

    monkeypatch.setattr(main, "ensure_all_models_available", lambda: None)
    monkeypatch.setattr(main, "check_rabbitmq_connection", lambda: None)
    monkeypatch.setattr(main, "check_qdrant_connection", lambda: None)
    monkeypatch.setattr(main, "check_redis_connection", _noop_async)
    monkeypatch.setattr(main, "start_consumer", lambda: None)


@pytest.fixture
async def async_client():
    transport = httpx.ASGITransport(app=main.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.mark.anyio
async def test_enhance_description(async_client, monkeypatch):
    async def _enhance(description: str) -> str:
        return f"enhanced: {description}"

    monkeypatch.setattr(enhance_routes, "enhance_description", _enhance)

    response = await async_client.post("/api/enhance", json={"description": "nice house"})

    assert response.status_code == 200
    assert response.json() == {"enhanced_description": "enhanced: nice house"}


@pytest.mark.anyio
async def test_house_price_sale_prediction(async_client, monkeypatch):
    monkeypatch.setattr(
        house_price_routes,
        "process_house_listing_for_model",
        lambda payload, model_type: {"features": 1, "model_type": model_type},
    )
    monkeypatch.setattr(
        house_price_routes,
        "predict_house_price",
        lambda features, model_type: {
            "predicted_price_tnd": 123.0,
            "used_features": features,
            "ignored_features": [],
        },
    )

    payload = {
        "name": "villa",
        "description": "sea view",
        "address": "beach road",
        "regularPrice": 200000,
        "discountedPrice": None,
        "images": [],
        "bedrooms": 3,
        "bathrooms": 2,
        "furnished": True,
        "parking": True,
        "type": "sale",
        "offer": False,
        "userRef": "user",
        "area": 120,
    }

    response = await async_client.post("/api/house/price/sale/predict/listing", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["predicted_price_tnd"] == 123.0
    assert body["used_features"]["model_type"] == "sale"


@pytest.mark.anyio
async def test_house_price_value_error(async_client, monkeypatch):
    def _raise_value_error(payload, model_type):
        raise ValueError("bad input")

    monkeypatch.setattr(house_price_routes, "process_house_listing_for_model", _raise_value_error)

    response = await async_client.post("/api/house/price/rent/predict/listing", json={})

    assert response.status_code == 400
    assert response.json()["detail"] == "bad input"


@pytest.mark.anyio
async def test_house_validation_batch(async_client, monkeypatch):
    def _predict_house_image(payload: bytes):
        if payload == b"house":
            return {
                "label": "house",
                "is_house": True,
                "confidence": 0.9,
                "probabilities": {"house": 0.9, "not_house": 0.1},
            }
        return {
            "label": "not_house",
            "is_house": False,
            "confidence": 0.8,
            "probabilities": {"house": 0.2, "not_house": 0.8},
        }

    monkeypatch.setattr(house_validation_routes, "predict_house_image", _predict_house_image)

    files = [
        ("files", ("house.jpg", b"house", "image/jpeg")),
        ("files", ("other.jpg", b"other", "image/jpeg")),
    ]

    response = await async_client.post("/api/house/validate/batch", files=files)

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    assert body["accepted"] == 1
    assert body["rejected"] == 1
    assert body["results"][0]["filename"] == "house.jpg"


@pytest.mark.anyio
async def test_rag_query_sets_cookie(async_client, monkeypatch):
    async def _run_rag_query(query, top_k, session_id):
        return {
            "session_id": "session-1",
            "query": query,
            "answer": "ok",
            "total_hits": 0,
            "hits": [],
        }

    monkeypatch.setattr(rag_routes, "run_rag_query", _run_rag_query)

    response = await async_client.post("/api/rag/query", json={"query": "hello"})

    assert response.status_code == 200
    assert response.json()["session_id"] == "session-1"
    assert response.cookies.get("rag_session_id") == "session-1"


@pytest.mark.anyio
async def test_rag_query_requires_query(async_client):
    response = await async_client.post("/api/rag/query", json={"query": " "})

    assert response.status_code == 400
    assert response.json()["detail"] == "Query is required"


@pytest.mark.anyio
async def test_rag_clear_history(async_client, monkeypatch):
    async def _clear_rag_session_history(session_id):
        return True

    monkeypatch.setattr(rag_routes, "clear_rag_session_history", _clear_rag_session_history)

    response = await async_client.post("/api/rag/history/clear", json={"session_id": "session-1"})

    assert response.status_code == 200
    assert response.json()["cleared"] is True
