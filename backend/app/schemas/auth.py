"""Pydantic schemas for authentication requests and responses."""

from pydantic import BaseModel, EmailStr, Field


class UserInfo(BaseModel):
    """Core user profile data returned after authentication."""

    uid: str = Field(..., description="Firebase user UID")
    email: str | None = Field(None, description="User email address")
    display_name: str | None = Field(None, description="User display name")
    photo_url: str | None = Field(None, description="User profile photo URL")
    email_verified: bool = Field(False, description="Whether email is verified")
    provider: str | None = Field(None, description="Auth provider (google.com, password, etc.)")


class LoginRequest(BaseModel):
    """Request body for login endpoint (alternative to Bearer token)."""

    id_token: str = Field(..., description="Firebase ID token from client SDK")


class LoginResponse(BaseModel):
    """Response after successful authentication."""

    user: UserInfo
    message: str = "Login successful"


class TokenVerifyRequest(BaseModel):
    """Request body for token verification."""

    id_token: str = Field(..., description="Firebase ID token to verify")


class TokenVerifyResponse(BaseModel):
    """Response for token verification."""

    valid: bool
    uid: str | None = None
    message: str = ""


class ErrorResponse(BaseModel):
    """Standard error response."""

    detail: str
    error_code: str | None = None
