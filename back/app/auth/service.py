import re
from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode

import httpx
from jose import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.config import settings

STEAM_OPENID_URL = "https://steamcommunity.com/openid/login"
STEAM_ID_PATTERN = re.compile(r"https://steamcommunity.com/openid/id/(\d+)")


def build_steam_login_url(callback_url: str) -> str:
    params = {
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.return_to": callback_url,
        "openid.realm": callback_url.rsplit("/", 1)[0],
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    }
    return f"{STEAM_OPENID_URL}?{urlencode(params)}"


async def verify_steam_login(params: dict[str, str]) -> str | None:
    validation_params = dict(params)
    validation_params["openid.mode"] = "check_authentication"

    async with httpx.AsyncClient() as client:
        resp = await client.post(STEAM_OPENID_URL, data=validation_params)

    if "is_valid:true" not in resp.text:
        return None

    claimed_id = params.get("openid.claimed_id", "")
    match = STEAM_ID_PATTERN.match(claimed_id)
    return match.group(1) if match else None


async def fetch_steam_profile(steam_id: str) -> dict:
    url = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/"
    params = {"key": settings.steam_api_key, "steamids": steam_id}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        data = resp.json()
    players = data.get("response", {}).get("players", [])
    return players[0] if players else {}


async def get_or_create_user(db: AsyncSession, steam_id: str) -> User:
    result = await db.execute(select(User).where(User.steam_id == steam_id))
    user = result.scalar_one_or_none()

    profile = await fetch_steam_profile(steam_id)

    if user is None:
        user = User(
            steam_id=steam_id,
            display_name=profile.get("personaname", steam_id),
            avatar_url=profile.get("avatarfull"),
        )
        db.add(user)
    else:
        user.display_name = profile.get("personaname", user.display_name)
        user.avatar_url = profile.get("avatarfull", user.avatar_url)

    await db.commit()
    await db.refresh(user)
    return user


def create_access_token(user_id: int) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire, "type": "access"},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def create_refresh_token(user_id: int) -> str:
    expire = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire, "type": "refresh"},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )
