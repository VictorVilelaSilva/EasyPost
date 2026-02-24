from fastapi import APIRouter, HTTPException, status

from app.schemas.carousel import CarouselRequest, CarouselResponse
from app.services.genai_service import genai_service

router = APIRouter()

@router.post("/generate-carousel", response_model=CarouselResponse, status_code=status.HTTP_200_OK)
async def generate_carousel(request: CarouselRequest):
    """Generate a 5-slide carousel outline based on a topic and niche."""
    try:
        response = await genai_service.generate_carousel(request.topic, request.niche)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
