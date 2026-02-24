from fastapi import APIRouter, HTTPException, status

from app.schemas.carousel import ImagesRequest, ImagesResponse
from app.services.image_service import image_service

router = APIRouter()

@router.post("/generate-images", response_model=ImagesResponse, status_code=status.HTTP_200_OK)
async def generate_images(request: ImagesRequest):
    """Generate the actual 1080x1080 slide images from the text components."""
    try:
        images = await image_service.generate_images(request)
        return ImagesResponse(images=images)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
