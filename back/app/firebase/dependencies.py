import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.firebase.admin import admin_auth

logger = logging.getLogger(__name__)
_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação ausente",
        )
    try:
        decoded = admin_auth.verify_id_token(credentials.credentials)
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Firebase ID token verification failed: %s: %s",
            exc.__class__.__name__,
            exc,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação inválido",
        ) from exc

    return {"uid": decoded["uid"], "email": decoded.get("email")}
