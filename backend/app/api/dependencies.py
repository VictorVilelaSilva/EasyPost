"""Shared FastAPI dependencies for authentication."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.firebase import InvalidTokenError
from app.schemas.auth import UserInfo
from app.services.auth_service import auth_service

# Bearer token security scheme — shows the lock icon in Swagger UI
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> UserInfo:
    """Extract and verify the Firebase ID token from the Authorization header.

    Usage in endpoints:
        @router.get("/protected")
        async def protected(user: UserInfo = Depends(get_current_user)):
            return {"uid": user.uid}

    Raises:
        HTTPException 401: If no token is provided or token is invalid.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user = auth_service.authenticate_with_token(credentials.credentials)
        return user
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.detail,
            headers={"WWW-Authenticate": "Bearer"},
        )
