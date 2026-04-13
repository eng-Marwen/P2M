import re
from typing import Any, Literal

import numpy as np


RENT_CATEGORY_KEYWORDS = ("apartment", "appartement", "studio", "flat")
PriceModelType = Literal["sale", "rent"]
SALE_FEATURE_COLUMNS: list[str] = [
    "location",
    "city",
    "governorate",
    "Area",
    "pieces",
    "room",
    "bathroom",
    "age",
    "state",
    "latt",
    "long",
    "distance_to_capital",
    "garage",
    "garden",
    "concierge",
    "beach_view",
    "mountain_view",
    "pool",
    "elevator",
    "furnished",
    "equipped_kitchen",
    "central_heating",
    "air_conditioning",
]
RENT_FEATURE_COLUMNS: list[str] = ["room_count", "bathroom_count", "size", "city", "region", "category"]
MODEL_FEATURE_COLUMNS: dict[PriceModelType, list[str]] = {
    "sale": SALE_FEATURE_COLUMNS,
    "rent": RENT_FEATURE_COLUMNS,
}

STATE_KEYWORDS: dict[str, tuple[str, ...]] = {
    "new": ("new", "brand new", "neuf", "neuve"),
    "renovated": ("renovated", "renove", "refait"),
    "old": ("old", "ancien", "needs work"),
}


def text_normalize(value: str | None) -> str:
    return (value or "").strip().lower()


def bool_to_int(value: bool) -> int:
    return 1 if bool(value) else 0


def extract_age(description: str) -> int:
    match = re.search(r"(\d{1,2})\s*(year|years|ans|an)", description, flags=re.IGNORECASE)
    return int(match.group(1)) if match else 0


def detect_state(description: str) -> str:
    text = text_normalize(description)
    for state, keywords in STATE_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            return state
    return "good"


def extract_location_parts(address: str) -> tuple[str, str, str]:
    parts = [part.strip() for part in re.split(r"[,\-/]+", address) if part.strip()]
    if not parts:
        return "unknown", "unknown", "unknown"
    if len(parts) == 1:
        return parts[0], parts[0], parts[0]
    if len(parts) == 2:
        return parts[-1], parts[-1], parts[0]
    return parts[-1], parts[-1], parts[-2]


def keyword_flag(text: str, keywords: list[str] | tuple[str, ...]) -> int:
    return 1 if any(keyword in text for keyword in keywords) else 0


def infer_rent_category(listing: dict, description_text: str) -> str:
    combined = f"{text_normalize(str(listing.get('name', '')))} {description_text}"
    if any(keyword in combined for keyword in RENT_CATEGORY_KEYWORDS):
        return "Appartements"
    return "Maisons et Villas"


def _resolve_model_type(model_type: str | None = "sale") -> PriceModelType:
    return "sale" if text_normalize(model_type or "sale") == "sale" else "rent"


def get_model_feature_columns(model_type: str | None = "sale") -> list[str]:
    return list(MODEL_FEATURE_COLUMNS[_resolve_model_type(model_type)])


def build_feature_items_from_listing(listing: dict) -> list[dict[str, int | float | str]]:
    features = build_model_features_from_listing(listing)
    return [{"name": key, "value": value} for key, value in features.items()]


def feature_items_to_dict(feature_items: list[dict[str, Any]]) -> dict[str, int | float | str]:
    return {
        str(item.get("name", "")): item.get("value")
        for item in feature_items
        if item.get("name")
    }


def build_model_features_from_listing(listing: dict) -> dict[str, int | float | str]:
    address = str(listing.get("address", ""))
    description = str(listing.get("description", ""))
    bedrooms = int(listing.get("bedrooms", 0) or 0)
    bathrooms = int(listing.get("bathrooms", 0) or 0)
    area = float(listing.get("area", 0) or 0)

    location, city, governorate = extract_location_parts(address)
    desc_text = text_normalize(description)

    return {
        "location": location,
        "city": city,
        "governorate": governorate,
        "region": governorate,
        "category": infer_rent_category(listing, desc_text),
        "Area": area,
        "size": area,
        "pieces": max(1, bedrooms + bathrooms),
        "room": max(1, bedrooms),
        "room_count": max(1, bedrooms),
        "bathroom": max(1, bathrooms),
        "bathroom_count": max(1, bathrooms),
        "age": extract_age(description),
        "state": detect_state(description),
        "latt": 0.0,
        "long": 0.0,
        "distance_to_capital": 0.0,
        "garage": bool_to_int(bool(listing.get("parking", False))),
        "garden": keyword_flag(desc_text, ["garden", "jardin"]),
        "concierge": keyword_flag(desc_text, ["concierge"]),
        "beach_view": keyword_flag(desc_text, ["beach", "sea view", "vue mer"]),
        "mountain_view": keyword_flag(desc_text, ["mountain", "vue montagne"]),
        "pool": keyword_flag(desc_text, ["pool", "piscine"]),
        "elevator": keyword_flag(desc_text, ["elevator", "ascenseur", "lift"]),
        "furnished": bool_to_int(bool(listing.get("furnished", False))),
        "equipped_kitchen": keyword_flag(desc_text, ["equipped kitchen", "cuisine equipee", "kitchen"]),
        "central_heating": keyword_flag(desc_text, ["central heating", "chauffage central"]),
        "air_conditioning": keyword_flag(desc_text, ["air conditioning", "clim", "ac"]),
    }


def process_house_listing_for_model(
    listing: dict,
    model_type: str | None = "sale",
) -> dict[str, int | float | str]:
    all_features = build_model_features_from_listing(listing)
    feature_columns = get_model_feature_columns(model_type)
    return {col: all_features[col] for col in feature_columns}


def to_numeric_features(
    features: dict[str, int | float | str],
    feature_columns: list[str],
    mappings: dict[str, Any] | None = None,
) -> dict[str, int | float]:
    mappings = mappings or {}
    numeric_features: dict[str, int | float] = {}

    for col in feature_columns:
        value = features[col]
        col_mapping = mappings.get(col)
        if isinstance(col_mapping, dict):
            normalized = text_normalize(str(value))
            numeric_features[col] = col_mapping.get(normalized, 0)
            continue
        if isinstance(value, (bool, np.bool_)):
            numeric_features[col] = int(value)
            continue
        try:
            numeric_features[col] = float(value)
        except (TypeError, ValueError):
            numeric_features[col] = 0.0

    return numeric_features
