import math

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select

from app.auth.models import User
from app.auth.schemas import PublicUserResponse, UserResponse
from app.common.dependencies import CurrentUser, DbSession
from app.common.exceptions import NotFoundError
from app.common.utils import validate_cpf
from app.listings.schemas import ListingListResponse, ListingResponse
from app.listings.service import get_active_user_listings

router = APIRouter(prefix="/users", tags=["users"])


PIX_KEY_TYPES = {"CPF", "CNPJ", "EMAIL", "PHONE", "EVP"}


class UpdateProfileRequest(BaseModel):
    trade_url: str | None = None
    email: str | None = None
    cpf: str | None = None
    pix_key: str | None = None
    pix_key_type: str | None = None


@router.get("/me", response_model=UserResponse)
async def get_me(user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(user)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    body: UpdateProfileRequest,
    user: CurrentUser,
    db: DbSession,
) -> UserResponse:
    if body.trade_url is not None:
        user.trade_url = body.trade_url
    if body.email is not None:
        user.email = body.email
    if body.cpf is not None:
        cleaned_cpf = "".join(c for c in body.cpf if c.isdigit())
        if not validate_cpf(cleaned_cpf):
            raise HTTPException(status_code=422, detail="CPF inválido")
        user.cpf = cleaned_cpf
    if body.pix_key is not None or body.pix_key_type is not None:
        if not body.pix_key or not body.pix_key_type:
            raise HTTPException(status_code=422, detail="pix_key e pix_key_type devem ser informados juntos")
        if body.pix_key_type not in PIX_KEY_TYPES:
            raise HTTPException(status_code=422, detail=f"pix_key_type inválido. Use: {', '.join(PIX_KEY_TYPES)}")
        user.pix_key = body.pix_key
        user.pix_key_type = body.pix_key_type

    # Create Asaas customer on first save when both email and cpf are present
    if user.email and user.cpf and user.asaas_customer_id is None:
        try:
            from app.payment.service import create_asaas_customer
            asaas_id = await create_asaas_customer(user.display_name, user.email, user.cpf)
            user.asaas_customer_id = asaas_id
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc))

    await db.commit()
    await db.refresh(user)  # pragma: no cover
    return UserResponse.model_validate(user)  # pragma: no cover


@router.get("/{user_id}/listings", response_model=ListingListResponse)
async def get_user_listings_public(
    user_id: int,
    db: DbSession,
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
) -> ListingListResponse:
    result = await db.execute(select(User).where(User.id == user_id))
    if result.scalar_one_or_none() is None:
        raise NotFoundError("User not found")
    items, total = await get_active_user_listings(db, user_id, page, limit)
    total_pages = max(1, math.ceil(total / limit))
    return ListingListResponse(
        items=[ListingResponse.model_validate(i) for i in items],
        total=total,
        page=page,
        total_pages=total_pages,
    )


@router.get("/{user_id}", response_model=PublicUserResponse)
async def get_user_profile(user_id: int, db: DbSession) -> PublicUserResponse:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise NotFoundError("User not found")
    return PublicUserResponse.model_validate(user)
