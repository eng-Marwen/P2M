from pydantic import BaseModel

class DescriptionRequest(BaseModel):
    description: str

class DescriptionResponse(BaseModel):
    enhanced_description: str