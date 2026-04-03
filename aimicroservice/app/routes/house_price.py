from fastapi import APIRouter, HTTPException

from app.schemas import (
    HousePriceBatchItem,
    HousePriceBatchPredictRequest,
    HousePriceBatchPredictResponse,
    HousePriceFeaturesResponse,
    HousePriceListingPredictRequest,
    HousePricePredictRequest,
    HousePricePredictResponse,
)
from app.services.house_price_predictor import (
    get_price_feature_columns,
    predict_house_price,
    predict_house_price_from_listing,
)

router = APIRouter()


@router.get("/house/price/sale/features", response_model=HousePriceFeaturesResponse)
async def get_required_sale_features():
    try:
        features = get_price_feature_columns(model_type="sale")
        return {"feature_columns": features, "total": len(features)}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not load sale model features: {str(exc)}") from exc


@router.get("/house/price/rent/features", response_model=HousePriceFeaturesResponse)
async def get_required_rent_features():
    try:
        features = get_price_feature_columns(model_type="rent")
        return {"feature_columns": features, "total": len(features)}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not load rent model features: {str(exc)}") from exc


@router.get("/house/price/features", response_model=HousePriceFeaturesResponse)
async def get_required_features():
    try:
        features = get_price_feature_columns(model_type="sale")
        return {"feature_columns": features, "total": len(features)}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not load model features: {str(exc)}") from exc


@router.post("/house/price/sale/predict", response_model=HousePricePredictResponse)
async def predict_sale_price(data: HousePricePredictRequest):
    try:
        return predict_house_price(data.features, model_type="sale")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(exc)}") from exc


@router.post("/house/price/rent/predict", response_model=HousePricePredictResponse)
async def predict_rent_price(data: HousePricePredictRequest):
    try:
        return predict_house_price(data.features, model_type="rent")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(exc)}") from exc


@router.post("/house/price/predict", response_model=HousePricePredictResponse)
async def predict_price(data: HousePricePredictRequest):
    try:
        return predict_house_price(data.features, model_type="sale")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(exc)}") from exc


@router.post("/house/price/sale/predict/listing", response_model=HousePricePredictResponse)
async def predict_sale_price_from_listing(data: HousePriceListingPredictRequest):
    try:
        result = predict_house_price_from_listing(data.model_dump(), model_type="sale")
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
        result = predict_house_price_from_listing(data.model_dump(), model_type="rent")
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(exc)}") from exc


@router.post("/house/price/predict/listing", response_model=HousePricePredictResponse)
async def predict_price_from_listing(data: HousePriceListingPredictRequest):
    try:
        result = predict_house_price_from_listing(data.model_dump())
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(exc)}") from exc


@router.post("/house/price/predict/batch", response_model=HousePriceBatchPredictResponse)
async def predict_price_batch(data: HousePriceBatchPredictRequest):
    if not data.items:
        raise HTTPException(status_code=400, detail="Please provide at least one item")

    results: list[HousePriceBatchItem] = []
    succeeded = 0
    failed = 0

    for index, item in enumerate(data.items):
        try:
            prediction = predict_house_price(item)
            succeeded += 1
            results.append(
                HousePriceBatchItem(
                    index=index,
                    predicted_price_tnd=prediction["predicted_price_tnd"],
                    ignored_features=prediction["ignored_features"],
                )
            )
        except Exception as exc:
            failed += 1
            results.append(
                HousePriceBatchItem(
                    index=index,
                    error=str(exc),
                )
            )

    return {
        "results": results,
        "total": len(data.items),
        "succeeded": succeeded,
        "failed": failed,
    }
