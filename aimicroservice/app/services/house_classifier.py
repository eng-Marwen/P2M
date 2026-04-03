import io
import os
from functools import lru_cache
from pathlib import Path

import torch
import torch.nn as nn
from PIL import Image, UnidentifiedImageError
from torchvision import models, transforms


IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

ROOT_DIR = Path(__file__).resolve().parents[2]

TEST_TRANSFORM = transforms.Compose([
	transforms.Resize((224, 224)),
	transforms.ToTensor(),
	transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])


def _default_model_path() -> Path:
	# Prefer current location under CNN_training, keep legacy fallback for compatibility.
	cnn_training_model = ROOT_DIR / "models-training" / "CNN_training" / "house_model_snd.pth"
	legacy_model = ROOT_DIR / "models-training" / "house_model_snd.pth"
	return cnn_training_model if cnn_training_model.exists() else legacy_model


def _class_names() -> list[str]:
	raw = os.getenv("HOUSE_CLASS_NAMES", "house,not_house")
	return [name.strip() for name in raw.split(",") if name.strip()]


def _build_model(num_classes: int) -> nn.Module:
	model = models.resnet18(weights=None)
	num_features = model.fc.in_features
	model.fc = nn.Linear(num_features, num_classes)
	return model


@lru_cache(maxsize=1)
def _load_model() -> nn.Module:
	model_path = Path(os.getenv("HOUSE_MODEL_PATH", str(_default_model_path()))).resolve()
	if not model_path.exists():
		raise FileNotFoundError(f"Model file not found at: {model_path}")

	class_names = _class_names()
	model = _build_model(num_classes=len(class_names))
	state_dict = torch.load(model_path, map_location=torch.device("cpu"))
	model.load_state_dict(state_dict)
	model.eval()
	return model


def predict_house_image(image_bytes: bytes) -> dict:
	if not image_bytes:
		raise ValueError("Empty image payload")

	try:
		image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
	except UnidentifiedImageError as exc:
		raise ValueError("Invalid image file") from exc

	x = TEST_TRANSFORM(image).unsqueeze(0)
	model = _load_model()
	class_names = _class_names()

	with torch.no_grad():
		logits = model(x)
		probs = torch.softmax(logits, dim=1).squeeze(0)
		pred_idx = int(torch.argmax(probs).item())

	label = class_names[pred_idx]
	probabilities = {
		class_names[i]: float(probs[i].item())
		for i in range(len(class_names))
	}

	return {
		"label": label,
		"is_house": label.lower() == "house",
		"confidence": float(probs[pred_idx].item()),
		"probabilities": probabilities,
	}