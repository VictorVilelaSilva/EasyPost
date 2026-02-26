"""Integration tests for authentication API endpoints."""

import pytest
from unittest.mock import patch

from firebase_admin import auth as firebase_auth


# ---------------------------------------------------------------------------
# POST /api/v1/auth/login
# ---------------------------------------------------------------------------


class TestLogin:
    """Tests for the login endpoint."""

    async def test_login_with_valid_token(self, client, mock_firebase_verify):
        """Should return user profile on valid Firebase token."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"id_token": "valid-firebase-token"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Login successful"
        assert data["user"]["uid"] == "firebase-uid-123"
        assert data["user"]["email"] == "testuser@gmail.com"
        assert data["user"]["display_name"] == "Test User"
        assert data["user"]["provider"] == "google.com"

    async def test_login_with_invalid_token(self, client, mock_firebase_verify_invalid):
        """Should return 401 on invalid Firebase token."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"id_token": "invalid-token"},
        )

        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()

    async def test_login_without_token(self, client, mock_firebase_init):
        """Should return 422 when id_token is missing from body."""
        response = await client.post(
            "/api/v1/auth/login",
            json={},
        )

        assert response.status_code == 422


# ---------------------------------------------------------------------------
# POST /api/v1/auth/verify
# ---------------------------------------------------------------------------


class TestVerifyToken:
    """Tests for the token verification endpoint."""

    async def test_verify_valid_token(self, client, mock_firebase_verify):
        """Should return valid=True for a valid token."""
        response = await client.post(
            "/api/v1/auth/verify",
            json={"id_token": "valid-firebase-token"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["uid"] == "firebase-uid-123"

    async def test_verify_invalid_token(self, client, mock_firebase_verify_invalid):
        """Should return valid=False for an invalid token (not 401)."""
        response = await client.post(
            "/api/v1/auth/verify",
            json={"id_token": "invalid-token"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert data["uid"] is None


# ---------------------------------------------------------------------------
# GET /api/v1/auth/me
# ---------------------------------------------------------------------------


class TestGetMe:
    """Tests for the get-current-user endpoint."""

    async def test_get_me_authenticated(
        self, client, auth_headers, mock_firebase_verify
    ):
        """Should return user profile when authenticated."""
        response = await client.get("/api/v1/auth/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["uid"] == "firebase-uid-123"
        assert data["email"] == "testuser@gmail.com"

    async def test_get_me_unauthenticated(self, client, mock_firebase_init):
        """Should return 401 without Authorization header."""
        response = await client.get("/api/v1/auth/me")

        assert response.status_code == 401
        assert "authentication required" in response.json()["detail"].lower()

    async def test_get_me_invalid_token(
        self, client, auth_headers, mock_firebase_verify_invalid
    ):
        """Should return 401 with an invalid Bearer token."""
        response = await client.get("/api/v1/auth/me", headers=auth_headers)

        assert response.status_code == 401


# ---------------------------------------------------------------------------
# GET /api/v1/users/me
# ---------------------------------------------------------------------------


class TestUsersMe:
    """Tests for the users/me endpoint (alias)."""

    async def test_users_me_authenticated(
        self, client, auth_headers, mock_firebase_verify
    ):
        """Should return user profile via /users/me."""
        response = await client.get("/api/v1/users/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["uid"] == "firebase-uid-123"

    async def test_users_me_unauthenticated(self, client, mock_firebase_init):
        """Should return 401 without auth."""
        response = await client.get("/api/v1/users/me")

        assert response.status_code == 401


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------


class TestHealthCheck:
    """Tests for the health endpoint."""

    async def test_health_check(self, client):
        """Should return healthy status without auth."""
        response = await client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}
