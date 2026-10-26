import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_EMBEDDING_MODEL = os.getenv(
    "GEMINI_EMBEDDING_MODEL",
    "gemini-embedding-001",
)
GEMINI_EMBEDDING_DIMENSIONS = int(
    os.getenv("GEMINI_EMBEDDING_DIMENSIONS", "768")
)

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing from .env")

client = genai.Client(api_key=GEMINI_API_KEY)

def house_to_text(house: dict) -> str:
    def safe_text(value, default: str = "unknown") -> str:
        if value is None:
            return default
        text = str(value).strip()
        return text if text else default

    def format_price(value) -> str:
        if value is None or value == "":
            return "not specified"
        try:
            return f"{float(value):.2f}"
        except (TypeError, ValueError):
            return safe_text(value, default="not specified")

    def yes_no(value) -> str:
        if value is True:
            return "yes"
        if value is False:
            return "no"
        return "unknown"

    house_id = safe_text(house.get("id") or house.get("_id"))
    title = safe_text(house.get("name"), default="Untitled listing")
    description = safe_text(
        house.get("description"),
        default="No additional description was provided.",
    )
    address = safe_text(house.get("address"), default="address not specified")
    listing_type = safe_text(house.get("type"), default="unknown")

    regular_price = format_price(house.get("regularPrice"))
    discounted_price = format_price(house.get("discountedPrice"))

    bedrooms = safe_text(house.get("bedrooms"), default="not specified")
    bathrooms = safe_text(house.get("bathrooms"), default="not specified")
    area = safe_text(house.get("area"), default="not specified")

    parking = yes_no(house.get("parking"))
    furnished = yes_no(house.get("furnished"))
    offer = yes_no(house.get("offer"))

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

    return blueprint_paragraph.strip()


def generate_embedding(text: str) -> list[float]:
    normalized_text = (text or "").strip()
    if not normalized_text:
        normalized_text = "empty house listing"

    result = client.models.embed_content(
        model=GEMINI_EMBEDDING_MODEL,
        contents=normalized_text,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=GEMINI_EMBEDDING_DIMENSIONS,
        ),
    )

    if not result.embeddings or result.embeddings[0].values is None:
        raise RuntimeError("Gemini returned no embedding")

    return list(result.embeddings[0].values)