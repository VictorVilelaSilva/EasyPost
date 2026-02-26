"""Firebase Admin SDK initialization and token verification."""

from typing import Any

import firebase_admin
from firebase_admin import auth, credentials

from app.core.config import get_settings


class InvalidTokenError(Exception):
    """Raised when a Firebase ID token is invalid or expired."""

    def __init__(self, detail: str = "Invalid or expired token"):
        self.detail = detail
        super().__init__(self.detail)


_firebase_app: firebase_admin.App | None = None


def initialize_firebase() -> firebase_admin.App:
    """Initialize the Firebase Admin SDK.

    Uses the service account credentials path from settings.
    Safe to call multiple times — returns existing app if already initialized.
    """
    global _firebase_app

    if _firebase_app is not None:
        return _firebase_app

    settings = get_settings()

    try:
        # Try to get existing app first
        _firebase_app = firebase_admin.get_app()
    except ValueError:
        # No app exists, create one
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        _firebase_app = firebase_admin.initialize_app(cred)

    return _firebase_app


def verify_firebase_token(id_token: str) -> dict[str, Any]:
    """Verify a Firebase ID token and return the decoded claims.

    Args:
        id_token: The Firebase ID token string from the client.

    Returns:
        Decoded token payload containing uid, email, name, picture, etc.

    Raises:
        InvalidTokenError: If the token is invalid, expired, or revoked.
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except auth.ExpiredIdTokenError:
        raise InvalidTokenError("Token has expired")
    except auth.RevokedIdTokenError:
        raise InvalidTokenError("Token has been revoked")
    except auth.InvalidIdTokenError:
        raise InvalidTokenError("Token is invalid")
    except Exception as e:
        raise InvalidTokenError(f"Token verification failed: {str(e)}")


def get_firebase_user(uid: str) -> auth.UserRecord:
    """Fetch a user record from Firebase Auth by UID.

    Args:
        uid: The Firebase user UID.

    Returns:
        Firebase UserRecord with user details.

    Raises:
        InvalidTokenError: If the user is not found.
    """
    try:
        return auth.get_user(uid)
    except auth.UserNotFoundError:
        raise InvalidTokenError(f"User not found: {uid}")
    except Exception as e:
        raise InvalidTokenError(f"Failed to fetch user: {str(e)}")
