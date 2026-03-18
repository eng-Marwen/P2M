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


class RagQueryRequest(BaseModel):
    query: str
    top_k: int = Field(default=5, ge=1, le=20)


class RagSearchHit(BaseModel):
    house_id: str
    score: float
    name: str | None = None
    address: str | None = None
    type: str | None = None
    regularPrice: float | int | None = None
    discountedPrice: float | int | None = None
    description: str | None = None


class RagQueryResponse(BaseModel):
    query: str
    answer: str
    total_hits: int
    hits: list[RagSearchHit]