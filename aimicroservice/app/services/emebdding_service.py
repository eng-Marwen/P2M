import os
import httpx

from dotenv import load_dotenv


load_dotenv()

JINA_API_KEY = os.getenv("JINA_API_KEY")
JINA_EMBEDDING_MODEL = os.getenv("JINA_EMBEDDING_MODEL", "jina-embeddings-v3")
JINA_EMBEDDING_URL = os.getenv("JINA_EMBEDDING_URL", "https://api.jina.ai/v1/embeddings")


def _as_yes_no(value) -> str:
    if value is True:
        return "yes"
    if value is False:
        return "no"
    return "unknown"


def _safe_text(value, default: str = "unknown") -> str:
    if value is None:
        return default
    text = str(value).strip()
    return text if text else default


def _format_price(value) -> str:
    if value is None or value == "":
        return "not specified"
    try:
        amount = float(value)
        return f"{amount:.2f}"
    except (TypeError, ValueError):
        return _safe_text(value, default="not specified")


def house_to_text(house: dict) -> str:
    house_id = _safe_text(house.get("id") or house.get("_id"))
    title = _safe_text(house.get("name"), default="Untitled listing")
    description = _safe_text(
        house.get("description"),
        default="No additional description was provided.",
    )
    address = _safe_text(house.get("address"), default="address not specified")
    listing_type = _safe_text(house.get("type"), default="unknown")

    regular_price = _format_price(house.get("regularPrice"))
    discounted_price = _format_price(house.get("discountedPrice"))

    bedrooms = _safe_text(house.get("bedrooms"), default="not specified")
    bathrooms = _safe_text(house.get("bathrooms"), default="not specified")
    area = _safe_text(house.get("area"), default="not specified")

    parking = _as_yes_no(house.get("parking"))
    furnished = _as_yes_no(house.get("furnished"))
    offer = _as_yes_no(house.get("offer"))

    image_count = len(house.get("images") or [])

    blueprint_paragraph = (
        f"Listing {house_id} is titled '{title}'. "
        f"It is a {listing_type} property located at {address}. "
        f"The home has {bedrooms} bedroom(s), {bathrooms} bathroom(s), and an area of {area}. "
        f"Its regular price is {regular_price}, while the discounted price is {discounted_price}. "
        f"Parking availability is {parking}, furnishing status is {furnished}, and special offer status is {offer}. "
        f"This listing currently includes {image_count} image(s). "
        f"Description: {description}"
    )
    # print(blueprint_paragraph.strip())

    return blueprint_paragraph.strip()


def generate_embedding(text: str) -> list[float]:
    normalized_text = (text or "").strip()
    if not normalized_text:
        normalized_text = "empty house listing"

    if not JINA_API_KEY:
        raise ValueError("JINA_API_KEY is missing")

    headers = {
        "Authorization": f"Bearer {JINA_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": JINA_EMBEDDING_MODEL,
        "input": [normalized_text],
    }

    with httpx.Client(timeout=60.0) as client:
        response = client.post(JINA_EMBEDDING_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

    embedding = data["data"][0]["embedding"]
    print(f"[Embedding] Generated embedding with Jina model: {JINA_EMBEDDING_MODEL}")
    print(f"[Embedding] vector_dim={len(embedding)} preview={embedding[:8]}")
    return embedding