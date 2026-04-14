from pydantic import BaseModel, Field

class DescriptionRequest(BaseModel):
    description: str

class DescriptionResponse(BaseModel):
    enhanced_description: str

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

class RagClearHistoryRequest(BaseModel):
    session_id: str | None = Field(default=None, max_length=128)

class RagClearHistoryResponse(BaseModel):
    session_id: str | None = None
    cleared: bool

class HousePricePredictResponse(BaseModel):
    predicted_price_tnd: float
    used_features: dict[str, int | float | str | bool]
    ignored_features: list[str]

class HousePriceListingPredictRequest(BaseModel):
    name: str = ""
    description: str = ""
    address: str = ""
    regularPrice: float | int = 0
    discountedPrice: float | int | None = None
    images: list[str] = Field(default_factory=list)
    bedrooms: int = 0
    bathrooms: int = 0
    furnished: bool = False
    parking: bool = False
    type: str = "sale"
    offer: bool = False
    userRef: str = ""
    area: float | int | None = None