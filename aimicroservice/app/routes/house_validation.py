from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas import (
	HouseBatchPredictionResponse,
	HousePredictionItem,
)
from app.services.house_classifier import predict_house_image

router = APIRouter()

@router.post("/house/validate/batch", response_model=HouseBatchPredictionResponse)
async def validate_house_images(files: list[UploadFile] = File(...)):
	results: list[HousePredictionItem] = []
	accepted = 0
	rejected = 0

	for file in files:
		filename = file.filename or "unknown"
		payload = await file.read()
		error_message: str | None = None

		try:
			prediction = predict_house_image(payload)
			is_house = bool(prediction.get("is_house"))
			accepted += int(is_house)
			rejected += int(not is_house)

			results.append(
				HousePredictionItem(
					filename=filename,
					label=prediction["label"],
					is_house=is_house,
					confidence=prediction["confidence"],
					probabilities=prediction["probabilities"],
				)
			)
		except FileNotFoundError as exc:
			raise HTTPException(status_code=500, detail=str(exc)) from exc
		except Exception as exc:
			rejected += 1
			error_message = f"Prediction failed: {exc}"

		if error_message:
			results.append(HousePredictionItem(filename=filename, error=error_message))

	return HouseBatchPredictionResponse(
		results=results,
		total=len(files),
		accepted=accepted,
		rejected=rejected,
	)
