import io
from functools import lru_cache
from pathlib import Path
from typing import Any
import numpy as np
import torch
import torch.nn as nn
from PIL import Image, UnidentifiedImageError
from torchvision import models

ROOT_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = ROOT_DIR / "ai_models" / "house_model_snd.pth"
CLASS_NAMES = ["house", "not_house"]
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

@lru_cache(maxsize=1)
def _load_model() -> torch.nn.Module:
    checkpoint = torch.load(MODEL_PATH, map_location="cpu")

    if isinstance(checkpoint, torch.nn.Module):
        model = checkpoint
    elif isinstance(checkpoint, dict):
        model = models.resnet18(weights=None)
        model.fc = nn.Linear(model.fc.in_features, len(CLASS_NAMES))
        model.load_state_dict(checkpoint)
    else:
        raise ValueError("Invalid model file format")

    model.eval()
    return model

def _preprocess_image(image: Image.Image) -> torch.Tensor:
    img = image.resize((224, 224))

    arr = np.asarray(img, dtype=np.float32) / 255.0
    arr = (arr - IMAGENET_MEAN) / IMAGENET_STD
    arr = np.transpose(arr, (2, 0, 1)).copy()  # ensure contiguous

    return torch.from_numpy(arr).unsqueeze(0)  # ZERO COPY


def predict_house_image(image_bytes: bytes) -> dict[str, Any]:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError as exc:
        raise ValueError("Invalid image file") from exc

    x = _preprocess_image(image)
    model = _load_model()

    with torch.inference_mode():  
        logits = model(x)
        probs = torch.softmax(logits, dim=1)[0]  # avoid squeeze

        pred_idx = int(torch.argmax(probs))
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