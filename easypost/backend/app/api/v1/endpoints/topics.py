from fastapi import APIRouter, HTTPException, status

from app.schemas.carousel import TopicsRequest, TopicsResponse
from app.services.genai_service import genai_service

router = APIRouter()

@router.post("/generate-topics", response_model=TopicsResponse, status_code=status.HTTP_200_OK)
async def generate_topics(request: TopicsRequest):
    """Generate 15 engaging topics based on a niche."""
    try:
        topics = await genai_service.generate_topics(request.niche)
        return TopicsResponse(topics=topics)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
