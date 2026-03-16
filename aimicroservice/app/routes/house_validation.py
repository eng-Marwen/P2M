from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas import (
	HouseBatchPredictionResponse,
	HousePredictionItem,
	HousePredictionResponse,
)
from app.services.house_classifier import predict_house_image

router = APIRouter()


@router.post("/house/validate", response_model=HousePredictionResponse)
async def validate_house_image(file: UploadFile = File(...)):
	if not file.content_type or not file.content_type.startswith("image/"):
		raise HTTPException(status_code=400, detail="Please upload a valid image file")

	payload = await file.read()

	try:
		result = predict_house_image(payload)
	except ValueError as exc:
		raise HTTPException(status_code=400, detail=str(exc)) from exc
	except FileNotFoundError as exc:
		raise HTTPException(status_code=500, detail=str(exc)) from exc
	except Exception as exc:
		raise HTTPException(status_code=500, detail=f"Prediction failed: {str(exc)}") from exc

	return result


@router.post("/house/validate/batch", response_model=HouseBatchPredictionResponse)
async def validate_house_images(files: list[UploadFile] = File(...)):
	if not files:
		raise HTTPException(status_code=400, detail="Please upload at least one image file")

	results: list[HousePredictionItem] = []
	accepted = 0
	rejected = 0

	for file in files:
		if not file.content_type or not file.content_type.startswith("image/"):
			rejected += 1
			results.append(
				HousePredictionItem(
					filename=file.filename or "unknown",
					error="Please upload a valid image file",
				)
			)
			continue

		payload = await file.read()

		try:
			prediction = predict_house_image(payload)
			is_house = bool(prediction.get("is_house"))
			accepted += int(is_house)
			rejected += int(not is_house)

			results.append(
				HousePredictionItem(
					filename=file.filename or "unknown",
					label=prediction["label"],
					is_house=is_house,
					confidence=prediction["confidence"],
					probabilities=prediction["probabilities"],
				)
			)
		except ValueError as exc:
			rejected += 1
			results.append(
				HousePredictionItem(
					filename=file.filename or "unknown",
					error=str(exc),
				)
			)
		except FileNotFoundError as exc:
			raise HTTPException(status_code=500, detail=str(exc)) from exc
		except Exception as exc:
			rejected += 1
			results.append(
				HousePredictionItem(
					filename=file.filename or "unknown",
					error=f"Prediction failed: {str(exc)}",
				)
			)

	return {
		"results": results,
		"total": len(files),
		"accepted": accepted,
		"rejected": rejected,
	}
