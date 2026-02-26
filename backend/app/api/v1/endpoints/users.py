"""User profile API endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user
from app.schemas.auth import ErrorResponse, UserInfo

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserInfo,
    responses={401: {"model": ErrorResponse}},
    summary="Get current user profile",
    description="Returns the profile of the currently authenticated user.",
)
async def get_user_profile(
    current_user: UserInfo = Depends(get_current_user),
) -> UserInfo:
    """Return the authenticated user's profile.

    This is an alias for /auth/me, placed under /users for RESTful consistency.
    """
    return current_user
