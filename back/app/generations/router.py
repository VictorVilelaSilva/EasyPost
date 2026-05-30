from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request

from app.firebase.dependencies import get_current_user
from app.generations.schemas import (
    GenerationCreate,
    GenerationListResponse,
    GenerationResponse,
)
from app.generations.storage import list_recent_generations, save_generation

router = APIRouter(prefix="/generations", tags=["generations"])


@router.post("", response_model=GenerationResponse)
async def create_generation(
    payload: GenerationCreate,
    request: Request,
    current_user: dict = Depends(get_current_user),
) -> GenerationResponse:
    return save_generation(current_user=current_user, payload=payload, request=request)


@router.get("/recent", response_model=GenerationListResponse)
async def recent_generations(
    request: Request,
    limit: Annotated[int, Query(ge=1, le=50)] = 3,
    current_user: dict = Depends(get_current_user),
) -> GenerationListResponse:
    return GenerationListResponse(
        generations=list_recent_generations(
            current_user=current_user,
            limit=limit,
            request=request,
        )
    )
