from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt

from app.auth.schemas import TokenResponse
from app.auth.service import (
    build_steam_login_url,
    create_access_token,
    create_refresh_token,
    get_or_create_user,
    verify_steam_login,
)
from app.common.dependencies import DbSession
from app.common.exceptions import BadRequestError, UnauthorizedError
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/steam/login")
async def steam_login(request: Request) -> RedirectResponse:
    if settings.backend_public_url:
        callback_url = f"{settings.backend_public_url}/auth/steam/callback"
    else:
        callback_url = str(request.url_for("steam_callback"))
    return RedirectResponse(url=build_steam_login_url(callback_url))


@router.get("/steam/callback", name="steam_callback")
async def steam_callback(request: Request, db: DbSession) -> RedirectResponse:
    params = dict(request.query_params)
    steam_id = await verify_steam_login(params)
    if steam_id is None:
        raise BadRequestError("Steam login verification failed")

    user = await get_or_create_user(db, steam_id)
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    response = RedirectResponse(url=f"{settings.frontend_url}/auth/callback")
    cookie_domain = settings.cookie_domain or None
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=False,
        secure=True,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        domain=cookie_domain,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 86400,
        domain=cookie_domain,
    )
    return response


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: Request, db: DbSession) -> TokenResponse:
    token = request.cookies.get("refresh_token")
    if token is None:
        raise UnauthorizedError("No refresh token")

    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        if payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid token type")
        user_id = payload.get("sub")
    except JWTError:
        raise UnauthorizedError("Invalid refresh token")

    return TokenResponse(access_token=create_access_token(user_id))


@router.post("/logout")
async def logout(response: Response) -> dict:
    cookie_domain = settings.cookie_domain or None
    response.delete_cookie("refresh_token", secure=True, samesite="lax", domain=cookie_domain)
    response.delete_cookie("access_token", secure=True, samesite="lax", domain=cookie_domain)
    return {"detail": "Logged out"}
