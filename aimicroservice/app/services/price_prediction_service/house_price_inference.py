from functools import lru_cache
from pathlib import Path
import os
from typing import Any, Literal

import joblib
import numpy as np
import pandas as pd
from app.services.price_prediction_service.house_price_processing import (
    get_model_feature_columns,
    text_normalize,
    to_numeric_features,
)

ROOT_DIR = Path(__file__).resolve().parents[3]
AI_MODELS_DIR = ROOT_DIR / "ai_models"
PriceModelType = Literal["sale", "rent"]

MODEL_FILENAMES: dict[PriceModelType, str] = {
    "sale": "sale_model.joblib",
    "rent": "rent_model.joblib",
}

def resolve_price_model(model_type: str | None = "sale") -> tuple[PriceModelType, Path]:
    resolved_type: PriceModelType = "sale" if text_normalize(model_type or "sale") == "sale" else "rent"
    return resolved_type, AI_MODELS_DIR / MODEL_FILENAMES[resolved_type]

@lru_cache(maxsize=2)
def _load_price_artifact(model_type: str | None = "sale") -> dict[str, Any]:
    resolved_type, model_path = resolve_price_model(model_type)
    artifact = joblib.load(model_path)
    feature_columns = get_model_feature_columns(resolved_type)

    if resolved_type == "sale":
        if not isinstance(artifact, dict) or "model" not in artifact:
            raise ValueError("Invalid sale model artifact format")
        return {
            "model": artifact["model"],
            "feature_columns": feature_columns,
            "label_mappings": artifact.get("label_mappings") or {},
        }

    return {
        "model": artifact,
        "feature_columns": feature_columns,
        "label_mappings": {},
    }

def get_price_feature_columns(model_type: str | None = "sale") -> list[str]:
    return get_model_feature_columns(model_type)

def predict_house_price(
    features: dict[str, int | float | str | bool], model_type: str | None = "sale"
) -> dict:
    if not features:
        raise ValueError("Features payload is required")

    artifact = _load_price_artifact(model_type)
    model = artifact["model"]
    feature_columns: list[str] = artifact["feature_columns"]

    missing = [col for col in feature_columns if col not in features]
    if missing:
        raise ValueError(f"Missing required features: {missing}")

    ignored = [key for key in features.keys() if key not in feature_columns]
    used = {col: features[col] for col in feature_columns}
    resolved_type, _ = resolve_price_model(model_type)

    model_input = (
        used
        if resolved_type == "rent"
        else to_numeric_features(used, feature_columns, artifact.get("label_mappings") or {})
    )

    row = pd.DataFrame([model_input], columns=feature_columns)
    prediction = float(model.predict(row)[0])

    if resolved_type == "rent" and prediction < 50:
        prediction = float(np.expm1(prediction))
    if resolved_type == "rent":
        min_monthly_rent_tnd = float(os.getenv("RENT_MIN_MONTHLY_TND", "300"))
        prediction = max(min_monthly_rent_tnd, prediction)

    return {
        "predicted_price_tnd": prediction,
        "used_features": model_input,
        "ignored_features": ignored,
    }
