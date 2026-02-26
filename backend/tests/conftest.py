"""Shared test fixtures for the EasyPost auth backend."""

from collections.abc import AsyncGenerator
from unittest.mock import MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


# ---------------------------------------------------------------------------
# Sample Firebase token data
# ---------------------------------------------------------------------------


@pytest.fixture
def valid_token_payload() -> dict:
    """Decoded Firebase ID token payload for a Google user."""
    return {
        "uid": "firebase-uid-123",
        "email": "testuser@gmail.com",
        "name": "Test User",
        "picture": "https://lh3.googleusercontent.com/photo.jpg",
        "email_verified": True,
        "firebase": {
            "sign_in_provider": "google.com",
            "identities": {
                "google.com": ["1234567890"],
                "email": ["testuser@gmail.com"],
            },
        },
        "iss": "https://securetoken.google.com/test-project",
        "aud": "test-project",
        "auth_time": 1700000000,
        "sub": "firebase-uid-123",
        "iat": 1700000000,
        "exp": 1700003600,
    }


@pytest.fixture
def mock_firebase_verify(valid_token_payload):
    """Patch firebase_admin.auth.verify_id_token to return valid payload."""
    with patch("app.core.firebase.auth.verify_id_token") as mock_verify:
        mock_verify.return_value = valid_token_payload
        yield mock_verify


@pytest.fixture
def mock_firebase_verify_invalid():
    """Patch firebase_admin.auth.verify_id_token to raise an error."""
    from firebase_admin import auth

    with patch("app.core.firebase.auth.verify_id_token") as mock_verify:
        mock_verify.side_effect = auth.InvalidIdTokenError("Token is invalid")
        yield mock_verify


@pytest.fixture
def mock_firebase_init():
    """Patch Firebase initialization so it doesn't need real credentials."""
    with patch("app.core.firebase.firebase_admin.get_app") as mock_get:
        mock_get.return_value = MagicMock()
        yield mock_get


@pytest.fixture
def auth_headers() -> dict[str, str]:
    """Authorization headers with a mock Bearer token."""
    return {"Authorization": "Bearer mock-firebase-id-token"}


# ---------------------------------------------------------------------------
# Async HTTP client
# ---------------------------------------------------------------------------


@pytest.fixture
async def client(mock_firebase_init) -> AsyncGenerator[AsyncClient, None]:
    """Async test client for the FastAPI application.

    Firebase initialization is mocked so tests don't need real credentials.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
