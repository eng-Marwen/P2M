from fastapi import APIRouter
from app.schemas import DescriptionRequest, DescriptionResponse
from app.services.enhancer import enhance_description

router = APIRouter()

@router.post("/enhance", response_model=DescriptionResponse)
async def enhance(data: DescriptionRequest):

    result = await enhance_description(data.description)
    print("enhanced res",result)

    return {"enhanced_description": result}