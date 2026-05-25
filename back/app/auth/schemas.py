from datetime import datetime

from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    steam_id: str
    display_name: str
    avatar_url: str | None
    trade_url: str | None
    is_trade_banned: bool
    reputation: int
    balance: float
    email: str | None
    cpf: str | None
    asaas_customer_id: str | None
    pix_key: str | None
    pix_key_type: str | None

    model_config = {"from_attributes": True}


class PublicUserResponse(BaseModel):
    id: int
    steam_id: str
    display_name: str
    avatar_url: str | None
    reputation: int
    is_trade_banned: bool
    created_at: datetime

    model_config = {"from_attributes": True}
