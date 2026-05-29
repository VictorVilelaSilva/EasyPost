import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.firebase import dependencies


@pytest.mark.asyncio
async def test_get_current_user_valid_token(monkeypatch):
    monkeypatch.setattr(
        dependencies.admin_auth,
        "verify_id_token",
        lambda token: {"uid": "abc123", "email": "user@example.com"},
    )
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="valid-token")

    result = await dependencies.get_current_user(credentials=creds)

    assert result == {"uid": "abc123", "email": "user@example.com"}


@pytest.mark.asyncio
async def test_get_current_user_missing_header():
    with pytest.raises(HTTPException) as exc:
        await dependencies.get_current_user(credentials=None)
    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_invalid_token(monkeypatch):
    def _raise(token):
        raise ValueError("invalid")

    monkeypatch.setattr(dependencies.admin_auth, "verify_id_token", _raise)
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="bad-token")

    with pytest.raises(HTTPException) as exc:
        await dependencies.get_current_user(credentials=creds)
    assert exc.value.status_code == 401
