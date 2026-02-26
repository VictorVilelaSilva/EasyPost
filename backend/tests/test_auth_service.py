"""Unit tests for AuthService business logic."""

import pytest
from unittest.mock import patch, MagicMock

from firebase_admin import auth as firebase_auth

from app.core.firebase import InvalidTokenError
from app.services.auth_service import AuthService


@pytest.fixture
def auth_svc() -> AuthService:
    """Fresh AuthService instance."""
    return AuthService()


class TestAuthenticateWithToken:
    """Tests for AuthService.authenticate_with_token."""

    def test_returns_user_info_on_valid_token(
        self, auth_svc, valid_token_payload
    ):
        """Should return UserInfo with correct fields from decoded token."""
        with patch(
            "app.services.auth_service.verify_firebase_token",
            return_value=valid_token_payload,
        ):
            user = auth_svc.authenticate_with_token("valid-token")

        assert user.uid == "firebase-uid-123"
        assert user.email == "testuser@gmail.com"
        assert user.display_name == "Test User"
        assert user.photo_url == "https://lh3.googleusercontent.com/photo.jpg"
        assert user.email_verified is True
        assert user.provider == "google.com"

    def test_raises_on_invalid_token(self, auth_svc):
        """Should propagate InvalidTokenError for bad tokens."""
        with patch(
            "app.services.auth_service.verify_firebase_token",
            side_effect=InvalidTokenError("Token is invalid"),
        ):
            with pytest.raises(InvalidTokenError, match="Token is invalid"):
                auth_svc.authenticate_with_token("bad-token")

    def test_handles_token_without_optional_fields(self, auth_svc):
        """Should handle tokens missing name, picture, etc."""
        minimal_payload = {
            "uid": "uid-minimal",
            "email": "min@test.com",
            "firebase": {"sign_in_provider": "password"},
        }

        with patch(
            "app.services.auth_service.verify_firebase_token",
            return_value=minimal_payload,
        ):
            user = auth_svc.authenticate_with_token("minimal-token")

        assert user.uid == "uid-minimal"
        assert user.email == "min@test.com"
        assert user.display_name is None
        assert user.photo_url is None
        assert user.email_verified is False
        assert user.provider == "password"


class TestGetUserProfile:
    """Tests for AuthService.get_user_profile."""

    def test_returns_profile_from_firebase(self, auth_svc):
        """Should build UserInfo from Firebase UserRecord."""
        mock_record = MagicMock()
        mock_record.uid = "uid-456"
        mock_record.email = "profile@test.com"
        mock_record.display_name = "Profile User"
        mock_record.photo_url = "https://example.com/photo.jpg"
        mock_record.email_verified = True
        mock_record.provider_data = [MagicMock(provider_id="google.com")]

        with patch(
            "app.services.auth_service.get_firebase_user",
            return_value=mock_record,
        ):
            user = auth_svc.get_user_profile("uid-456")

        assert user.uid == "uid-456"
        assert user.email == "profile@test.com"
        assert user.display_name == "Profile User"
        assert user.provider == "google.com"

    def test_raises_on_user_not_found(self, auth_svc):
        """Should raise InvalidTokenError when user doesn't exist."""
        with patch(
            "app.services.auth_service.get_firebase_user",
            side_effect=InvalidTokenError("User not found: uid-999"),
        ):
            with pytest.raises(InvalidTokenError, match="User not found"):
                auth_svc.get_user_profile("uid-999")


class TestVerifyToken:
    """Tests for AuthService.verify_token."""

    def test_returns_decoded_claims(self, auth_svc, valid_token_payload):
        """Should return raw decoded token dict."""
        with patch(
            "app.services.auth_service.verify_firebase_token",
            return_value=valid_token_payload,
        ):
            result = auth_svc.verify_token("valid-token")

        assert result["uid"] == "firebase-uid-123"
        assert "firebase" in result
