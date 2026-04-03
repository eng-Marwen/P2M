from functools import lru_cache
from pathlib import Path
import os
import re
from typing import Any, Literal

import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder


ROOT_DIR = Path(__file__).resolve().parents[2]
PriceModelType = Literal["sale", "rent"]


def _train_data_path() -> Path:
    return ROOT_DIR / "models-training" / "price_prediction_model" / "data" / "train.csv"


def _price_model_path(model_type: PriceModelType) -> Path:
    return (
        ROOT_DIR
        / "models-training"
        / "price_prediction_model"
        / "models"
        / f"{model_type}_model.joblib"
    )


def _normalize_model_type(model_type: str | None) -> PriceModelType:
    normalized = _text(model_type or "sale")
    return "rent" if normalized == "rent" else "sale"


def _feature_columns_from_train_data(model_type: PriceModelType) -> list[str]:
    train_path = _train_data_path()
    if not train_path.exists():
        return []

    df = pd.read_csv(train_path)

    possible_targets = {
        "price_tnd",
        "price",
        "target",
        "sale_price",
        "rent_price",
        "rent_tnd",
    }
    if model_type == "sale":
        possible_targets.update({"rent", "is_rent"})
    else:
        possible_targets.update({"sale", "is_sale"})

    return [col for col in df.columns if col not in possible_targets]


@lru_cache(maxsize=2)
def _load_price_artifact(model_type: PriceModelType) -> dict[str, Any]:
    model_path = _price_model_path(model_type)

    if not model_path.exists():
        raise FileNotFoundError(f"Price model file not found at: {model_path}")

    artifact = joblib.load(model_path)

    if isinstance(artifact, dict):
        model = artifact.get("model")
        if model is None:
            raise ValueError("Invalid model artifact: missing `model`")

        feature_columns = (
            artifact.get("feature_columns")
            or artifact.get("features")
            or artifact.get("columns")
            or []
        )
    else:
        model = artifact
        feature_columns = []

    if not feature_columns and hasattr(model, "feature_names_in_"):
        feature_columns = [str(col) for col in model.feature_names_in_]

    if not feature_columns:
        feature_columns = _feature_columns_from_train_data(model_type)

    if not feature_columns:
        raise ValueError(
            f"Could not determine feature columns for `{model_type}` model at: {model_path}"
        )

    return {
        "model": model,
        "feature_columns": list(feature_columns),
    }


def get_price_feature_columns(model_type: str | None = "sale") -> list[str]:
    artifact = _load_price_artifact(_normalize_model_type(model_type))
    return list(artifact["feature_columns"])


@lru_cache(maxsize=1)
def _load_label_mappings() -> dict[str, dict[str, int]]:
    train_path = _train_data_path()
    if not train_path.exists():
        return {}

    df = pd.read_csv(train_path).dropna()
    object_cols = [col for col in df.columns if df[col].dtype == "object" and col != "price_tnd"]

    mappings: dict[str, dict[str, int]] = {}
    for col in object_cols:
        series = df[col].astype(str).str.strip().str.lower()
        encoder = LabelEncoder()
        encoder.fit(series)
        mappings[col] = {label: int(idx) for idx, label in enumerate(encoder.classes_)}

    return mappings


def _text(value: str | None) -> str:
    return (value or "").strip().lower()


def _as_bool_feature(value: bool) -> int:
    return 1 if bool(value) else 0


def _extract_age(description: str) -> int:
    match = re.search(r"(\d{1,2})\s*(year|years|ans|an)", description, flags=re.IGNORECASE)
    if not match:
        return 0
    return int(match.group(1))


def _detect_state(description: str) -> str:
    text = _text(description)
    if any(keyword in text for keyword in ["new", "brand new", "neuf", "neuve"]):
        return "new"
    if any(keyword in text for keyword in ["renovated", "renove", "refait"]):
        return "renovated"
    if any(keyword in text for keyword in ["old", "ancien", "needs work"]):
        return "old"
    return "good"


def _extract_location_parts(address: str) -> tuple[str, str, str]:
    parts = [part.strip() for part in re.split(r"[,\-/]+", address) if part.strip()]
    if len(parts) >= 3:
        location = parts[-1]
        city = parts[-1]
        governorate = parts[-2]
    elif len(parts) == 2:
        location = parts[-1]
        city = parts[-1]
        governorate = parts[0]
    elif len(parts) == 1:
        location = parts[0]
        city = parts[0]
        governorate = parts[0]
    else:
        location = "unknown"
        city = "unknown"
        governorate = "unknown"
    return location, city, governorate


def _keyword_flag(text: str, keywords: list[str]) -> int:
    return 1 if any(keyword in text for keyword in keywords) else 0


def _infer_rent_category(listing: dict, description_text: str) -> str:
    name_text = _text(str(listing.get("name", "")))
    combined = f"{name_text} {description_text}"
    apartment_keywords = ["apartment", "appartement", "studio", "flat"]
    if any(keyword in combined for keyword in apartment_keywords):
        return "Appartements"
    return "Maisons et Villas"


def build_model_features_from_listing(listing: dict) -> dict[str, int | float | str]:
    address = str(listing.get("address", ""))
    description = str(listing.get("description", ""))
    bedrooms = int(listing.get("bedrooms", 0) or 0)
    bathrooms = int(listing.get("bathrooms", 0) or 0)
    area = float(listing.get("area", 0) or 0)

    location, city, governorate = _extract_location_parts(address)
    desc_text = _text(description)

    return {
        "location": location,
        "city": city,
        "governorate": governorate,
        "region": governorate,
        "category": _infer_rent_category(listing, desc_text),
        "Area": area,
        "size": area,
        "pieces": max(1, bedrooms + bathrooms),
        "room": max(1, bedrooms),
        "room_count": max(1, bedrooms),
        "bathroom": max(1, bathrooms),
        "bathroom_count": max(1, bathrooms),
        "age": _extract_age(description),
        "state": _detect_state(description),
        "latt": 0.0,
        "long": 0.0,
        "distance_to_capital": 0.0,
        "garage": _as_bool_feature(bool(listing.get("parking", False))),
        "garden": _keyword_flag(desc_text, ["garden", "jardin"]),
        "concierge": _keyword_flag(desc_text, ["concierge"]),
        "beach_view": _keyword_flag(desc_text, ["beach", "sea view", "vue mer"]),
        "mountain_view": _keyword_flag(desc_text, ["mountain", "vue montagne"]),
        "pool": _keyword_flag(desc_text, ["pool", "piscine"]),
        "elevator": _keyword_flag(desc_text, ["elevator", "ascenseur", "lift"]),
        "furnished": _as_bool_feature(bool(listing.get("furnished", False))),
        "equipped_kitchen": _keyword_flag(desc_text, ["equipped kitchen", "cuisine equipee", "kitchen"]),
        "central_heating": _keyword_flag(desc_text, ["central heating", "chauffage central"]),
        "air_conditioning": _keyword_flag(desc_text, ["air conditioning", "clim", "ac"]),
    }


def _to_numeric_features(features: dict[str, int | float | str], feature_columns: list[str]) -> dict[str, int | float]:
    mappings = _load_label_mappings()
    numeric_features: dict[str, int | float] = {}

    for col in feature_columns:
        value = features[col]

        if col in mappings:
            normalized = _text(str(value))
            numeric_features[col] = mappings[col].get(normalized, 0)
            continue

        if isinstance(value, (bool, np.bool_)):
            numeric_features[col] = int(value)
            continue

        try:
            numeric_features[col] = float(value)
        except (TypeError, ValueError):
            # If model expects numeric values and we still have text,
            # default to 0 to keep inference resilient.
            numeric_features[col] = 0.0

    return numeric_features


def predict_house_price(
    features: dict[str, int | float | str | bool], model_type: str | None = "sale"
) -> dict:
    if not features:
        raise ValueError("Features payload is required")

    artifact = _load_price_artifact(_normalize_model_type(model_type))
    model = artifact["model"]
    feature_columns: list[str] = artifact["feature_columns"]

    missing = [col for col in feature_columns if col not in features]
    if missing:
        raise ValueError(f"Missing required features: {missing}")

    ignored = [key for key in features.keys() if key not in feature_columns]
    used = {col: features[col] for col in feature_columns}

    row = pd.DataFrame([used], columns=feature_columns)
    resolved_type = _normalize_model_type(model_type)
    prediction = float(model.predict(row)[0])

    # Rent model was trained on log(price), so convert back to real price space
    # when output looks like log-scale values.
    if resolved_type == "rent" and prediction < 50:
        prediction = float(np.expm1(prediction))

    # Keep rent output realistic and configurable for business constraints.
    if resolved_type == "rent":
        min_monthly_rent_tnd = float(os.getenv("RENT_MIN_MONTHLY_TND", "300"))
        prediction = max(min_monthly_rent_tnd, prediction)

    return {
        "predicted_price_tnd": prediction,
        "used_features": used,
        "ignored_features": ignored,
    }


def predict_house_price_from_listing(listing: dict, model_type: str | None = None) -> dict:
    resolved_type = _normalize_model_type(model_type or str(listing.get("type", "sale")))
    artifact = _load_price_artifact(resolved_type)
    feature_columns: list[str] = artifact["feature_columns"]

    raw_features = build_model_features_from_listing(listing)
    missing = [col for col in feature_columns if col not in raw_features]
    if missing:
        raise ValueError(f"Could not build required features from listing: {missing}")

    if resolved_type == "rent":
        model_ready = {col: raw_features[col] for col in feature_columns}
    else:
        model_ready = _to_numeric_features(raw_features, feature_columns)
    prediction_result = predict_house_price(model_ready, model_type=resolved_type)

    return {
        **prediction_result,
        "used_features": model_ready,
    }
