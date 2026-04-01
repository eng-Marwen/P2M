from pydantic import BaseModel, Field

class DescriptionRequest(BaseModel):
    description: str

class DescriptionResponse(BaseModel):
    enhanced_description: str


class HousePredictionResponse(BaseModel):
    label: str
    is_house: bool
    confidence: float = Field(..., ge=0, le=1)
    probabilities: dict[str, float]


class HousePredictionItem(BaseModel):
    filename: str
    label: str | None = None
    is_house: bool | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    probabilities: dict[str, float] | None = None
    error: str | None = None


class HouseBatchPredictionResponse(BaseModel):
    results: list[HousePredictionItem]
    total: int
    accepted: int
    rejected: int


class HousePricePredictRequest(BaseModel):
    features: dict[str, int | float]


class HousePricePredictResponse(BaseModel):
    predicted_price_tnd: float
    used_features: dict[str, int | float]
    ignored_features: list[str] = []


class HousePriceBatchItem(BaseModel):
    index: int
    predicted_price_tnd: float | None = None
    ignored_features: list[str] = []
    error: str | None = None


class HousePriceBatchPredictRequest(BaseModel):
    items: list[dict[str, int | float]]


class HousePriceBatchPredictResponse(BaseModel):
    results: list[HousePriceBatchItem]
    total: int
    succeeded: int
    failed: int


class HousePriceFeaturesResponse(BaseModel):
    feature_columns: list[str]
    total: int


class HousePriceListingPredictRequest(BaseModel):
    name: str
    description: str
    address: str
    regularPrice: float
    discountedPrice: float | None = None
    images: list[str] = []
    bedrooms: int
    bathrooms: int
    furnished: bool
    parking: bool
    type: str
    offer: bool
    userRef: str
    area: float | None = None


class RagQueryRequest(BaseModel):
    query: str
    top_k: int = Field(default=5, ge=1, le=20)
    session_id: str | None = Field(default=None, max_length=128)


class RagSearchHit(BaseModel):
    score: float
    listing_url: str | None = None
    name: str | None = None
    address: str | None = None
    type: str | None = None
    regularPrice: float | int | None = None
    discountedPrice: float | int | None = None
    description: str | None = None


class RagQueryResponse(BaseModel):
    session_id: str
    query: str
    answer: str
    total_hits: int
    hits: list[RagSearchHit]