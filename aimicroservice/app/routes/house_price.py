from fastapi import APIRouter, HTTPException

from app.schemas import (
    HousePriceListingPredictRequest,
    HousePricePredictResponse,
)
from app.services.price_prediction_service.house_price_inference import predict_house_price
from app.services.price_prediction_service.house_price_processing import process_house_listing_for_model

router = APIRouter()


@router.post("/house/price/sale/predict/listing", response_model=HousePricePredictResponse)
async def predict_sale_price_from_listing(data: HousePriceListingPredictRequest):
    try:
        features = process_house_listing_for_model(data.model_dump(), model_type="sale")
        result = predict_house_price(features, model_type="sale")
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(exc)}") from exc


@router.post("/house/price/rent/predict/listing", response_model=HousePricePredictResponse)
async def predict_rent_price_from_listing(data: HousePriceListingPredictRequest):
    try:
        features = process_house_listing_for_model(data.model_dump(), model_type="rent")
        result = predict_house_price(features, model_type="rent")
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(exc)}") from exc


