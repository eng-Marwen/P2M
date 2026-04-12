from __future__ import annotations
import os
from pathlib import Path
import gdown

ROOT_DIR = Path(__file__).resolve().parents[2]
AI_MODELS_DIR = ROOT_DIR / "ai_models"
MODEL_SPECS: tuple[tuple[str, Path, str], ...] = (
    ("sale", AI_MODELS_DIR / "sale_model.joblib", "SALE_MODEL_URL"),
    ("rent", AI_MODELS_DIR / "rent_model.joblib", "RENT_MODEL_URL"),
    ("validation", AI_MODELS_DIR / "house_model.onnx", "VALIDATION_MODEL_URL"),
)

def _download_file(url: str, destination: Path) -> None:
    downloaded_path = gdown.download(
        url=url,
        output=str(destination),
        quiet=True,
        resume=False,
    )
    if not downloaded_path:
        raise RuntimeError(f"Failed to download model from URL: {url}")

def _ensure_model(model_name: str, model_path: Path, url_env: str) -> None:
    if model_path.exists():
        print(f"[Startup] {model_name} model found: {model_path}")
        return

    model_url = os.getenv(url_env, "").strip()
    print(f"[Startup] Downloading missing {model_name} model...")
    _download_file(model_url, model_path)
    size_mb = model_path.stat().st_size / (1024 * 1024)
    print(f"[Startup] {model_name} model ready ({size_mb:.2f} MB): {model_path}")

def ensure_all_models_available() -> None:
    for model_name, model_path, url_env in MODEL_SPECS:
        _ensure_model(model_name=model_name, model_path=model_path, url_env=url_env)