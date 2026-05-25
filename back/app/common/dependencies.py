from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.common.exceptions import UnauthorizedError
from app.config import settings
from app.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/steam/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        sub = payload.get("sub")
        if sub is None:
            raise UnauthorizedError()
        try:
            user_id = int(sub)
        except (TypeError, ValueError):
            raise UnauthorizedError()
    except JWTError:
        raise UnauthorizedError()

    result = await db.execute(select(User).where(User.id == user_id))  # pragma: no cover
    user = result.scalar_one_or_none()  # pragma: no cover
    if user is None:  # pragma: no cover
        raise UnauthorizedError()  # pragma: no cover
    return user  # pragma: no cover


CurrentUser = Annotated[User, Depends(get_current_user)]
DbSession = Annotated[AsyncSession, Depends(get_db)]
