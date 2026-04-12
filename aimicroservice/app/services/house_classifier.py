import io
from functools import lru_cache
from pathlib import Path
from typing import Any
import numpy as np
import onnxruntime as ort
from PIL import Image, UnidentifiedImageError

ROOT_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = ROOT_DIR / "ai_models" / "house_model.onnx"
CLASS_NAMES = ["house", "not_house"]
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

@lru_cache(maxsize=1)
def _load_model() -> ort.InferenceSession:
    return ort.InferenceSession(str(MODEL_PATH), providers=["CPUExecutionProvider"])

def _preprocess_image(image: Image.Image) -> np.ndarray:
    img = image.resize((224, 224))
    arr = np.asarray(img, dtype=np.float32) / 255.0
    arr = (arr - IMAGENET_MEAN) / IMAGENET_STD
    arr = np.transpose(arr, (2, 0, 1)).copy()  # ensure contiguous
    return arr[None, ...]

def _softmax(x: np.ndarray, axis: int = -1) -> np.ndarray:
    x = x - np.max(x, axis=axis, keepdims=True)
    ex = np.exp(x)
    return ex / np.sum(ex, axis=axis, keepdims=True)


def predict_house_image(image_bytes: bytes) -> dict[str, Any]:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError as exc:
        raise ValueError("Invalid image file") from exc

    x = _preprocess_image(image)
    model = _load_model()

    input_name = model.get_inputs()[0].name
    logits = model.run(None, {input_name: x})[0]
    probs = _softmax(logits, axis=1)[0]

    pred_idx = int(np.argmax(probs))
    confidence = float(probs[pred_idx])

    # Convert to Python dict efficiently
    probabilities = dict(zip(CLASS_NAMES, probs.tolist()))

    label = CLASS_NAMES[pred_idx]

    return {
        "label": label,
        "is_house": label == "house",
        "confidence": confidence,
        "probabilities": probabilities,
    }