"""Authentication API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user
from app.core.firebase import InvalidTokenError
from app.schemas.auth import (
    ErrorResponse,
    LoginRequest,
    LoginResponse,
    TokenVerifyRequest,
    TokenVerifyResponse,
    UserInfo,
)
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=LoginResponse,
    responses={401: {"model": ErrorResponse}},
    summary="Login with Firebase ID token",
    description="Verify a Firebase ID token and return the authenticated user's profile.",
)
async def login(request: LoginRequest) -> LoginResponse:
    """Authenticate a user with their Firebase ID token.

    The client obtains this token from Firebase client SDK after
    signing in with Google (or any other provider).
    """
    try:
        user = auth_service.authenticate_with_token(request.id_token)
        return LoginResponse(user=user)
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.detail,
        )


@router.post(
    "/verify",
    response_model=TokenVerifyResponse,
    summary="Verify a Firebase ID token",
    description="Check if a Firebase ID token is still valid without performing full login.",
)
async def verify_token(request: TokenVerifyRequest) -> TokenVerifyResponse:
    """Verify whether a Firebase ID token is valid.

    Useful for the frontend to check token validity before making
    authenticated requests.
    """
    try:
        decoded = auth_service.verify_token(request.id_token)
        return TokenVerifyResponse(
            valid=True,
            uid=decoded["uid"],
            message="Token is valid",
        )
    except InvalidTokenError as e:
        return TokenVerifyResponse(
            valid=False,
            uid=None,
            message=e.detail,
        )


@router.get(
    "/me",
    response_model=UserInfo,
    responses={401: {"model": ErrorResponse}},
    summary="Get current authenticated user",
    description="Returns the profile of the currently authenticated user.",
)
async def get_me(current_user: UserInfo = Depends(get_current_user)) -> UserInfo:
    """Return the authenticated user's profile.

    Requires a valid Firebase ID token in the Authorization header.
    """
    return current_user
