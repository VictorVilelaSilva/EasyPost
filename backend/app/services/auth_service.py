"""Authentication business logic layer."""

from typing import Any

from app.core.firebase import (
    InvalidTokenError,
    get_firebase_user,
    verify_firebase_token,
)
from app.schemas.auth import UserInfo


class AuthService:
    """Service for authentication operations.

    Wraps Firebase Admin SDK calls and maps results to domain schemas.
    """

    def authenticate_with_token(self, id_token: str) -> UserInfo:
        """Verify a Firebase ID token and return user info.

        Args:
            id_token: Firebase ID token from the client.

        Returns:
            UserInfo with the authenticated user's profile data.

        Raises:
            InvalidTokenError: If the token is invalid or expired.
        """
        decoded = verify_firebase_token(id_token)
        return self._build_user_info(decoded)

    def get_user_profile(self, uid: str) -> UserInfo:
        """Fetch user profile from Firebase by UID.

        Args:
            uid: Firebase user UID.

        Returns:
            UserInfo with the user's current profile data.

        Raises:
            InvalidTokenError: If the user is not found.
        """
        user_record = get_firebase_user(uid)
        return UserInfo(
            uid=user_record.uid,
            email=user_record.email,
            display_name=user_record.display_name,
            photo_url=user_record.photo_url,
            email_verified=user_record.email_verified,
            provider=self._extract_provider(user_record),
        )

    def verify_token(self, id_token: str) -> dict[str, Any]:
        """Verify a token and return the raw decoded claims.

        Args:
            id_token: Firebase ID token.

        Returns:
            Raw decoded token dictionary.

        Raises:
            InvalidTokenError: If the token is invalid.
        """
        return verify_firebase_token(id_token)

    def _build_user_info(self, decoded_token: dict[str, Any]) -> UserInfo:
        """Build a UserInfo from decoded Firebase token claims."""
        # Firebase token claims use different keys depending on provider
        firebase_claims = decoded_token.get("firebase", {})
        provider = firebase_claims.get("sign_in_provider", None)

        return UserInfo(
            uid=decoded_token["uid"],
            email=decoded_token.get("email"),
            display_name=decoded_token.get("name"),
            photo_url=decoded_token.get("picture"),
            email_verified=decoded_token.get("email_verified", False),
            provider=provider,
        )

    def _extract_provider(self, user_record: Any) -> str | None:
        """Extract the primary sign-in provider from a UserRecord."""
        if user_record.provider_data:
            return user_record.provider_data[0].provider_id
        return None


# Singleton instance for dependency injection
auth_service = AuthService()
