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