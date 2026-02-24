from fastapi import APIRouter

from app.api.v1.endpoints import carousel, images, topics

api_router = APIRouter()
api_router.include_router(topics.router, tags=["topics"])
api_router.include_router(carousel.router, tags=["carousel"])
api_router.include_router(images.router, tags=["images"])
