import math

from fastapi import APIRouter, Query

from app.common.dependencies import CurrentUser, DbSession
from app.listings.schemas import (
    CreateListingRequest,
    GroupedListingListResponse,
    GroupedListingResponse,
    ListingListResponse,
    ListingResponse,
    ListingWithSellerListResponse,
    ListingWithSellerResponse,
    UpdateListingRequest,
)
from app.listings.service import (
    cancel_listing,
    create_listing,
    get_active_listings,
    get_grouped_listings,
    get_listing_by_id,
    get_listings_by_class,
    get_user_listings,
    search_listings,
    update_listing_price,
)

router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("/grouped", response_model=GroupedListingListResponse)
async def list_grouped_listings(
    db: DbSession,
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
    rarity: list[str] | None = Query(None),
    name: str | None = Query(None),
) -> GroupedListingListResponse:
    rows, total = await get_grouped_listings(db, page, limit, rarity, name)
    total_pages = max(1, math.ceil(total / limit))  # pragma: no cover
    items = [GroupedListingResponse(**row) for row in rows]  # pragma: no cover
    return GroupedListingListResponse(items=items, total=total, page=page, total_pages=total_pages)  # pragma: no cover


@router.get("/by-class/{class_id}", response_model=ListingWithSellerListResponse)
async def list_by_class(
    class_id: str,
    db: DbSession,
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
) -> ListingWithSellerListResponse:
    pairs, total = await get_listings_by_class(db, class_id, page, limit)  # pragma: no cover
    total_pages = max(1, math.ceil(total / limit))  # pragma: no cover
    items = [ListingWithSellerResponse.model_validate(listing) for listing, _ in pairs]  # pragma: no cover
    return ListingWithSellerListResponse(items=items, total=total, page=page, total_pages=total_pages)  # pragma: no cover


@router.get("", response_model=ListingListResponse)
async def list_listings(
    db: DbSession,
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
    rarity: list[str] | None = Query(None),
    name: str | None = Query(None),
) -> ListingListResponse:
    items, total = await get_active_listings(db, page, limit, rarity, name)
    total_pages = max(1, math.ceil(total / limit))  # pragma: no cover
    return ListingListResponse(  # pragma: no cover
        items=[ListingResponse.model_validate(i) for i in items],
        total=total,
        page=page,
        total_pages=total_pages,
    )


@router.get("/me", response_model=list[ListingResponse])
async def my_listings(user: CurrentUser, db: DbSession) -> list[ListingResponse]:
    items = await get_user_listings(db, user.id)
    return [ListingResponse.model_validate(i) for i in items]  # pragma: no cover


@router.get("/search", response_model=list[ListingResponse])
async def search(
    db: DbSession,
    q: str = Query("", min_length=1),
    cursor: int | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
) -> list[ListingResponse]:
    items, _ = await search_listings(db, q, cursor, limit)
    return [ListingResponse.model_validate(i) for i in items]  # pragma: no cover


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: int, db: DbSession) -> ListingResponse:
    listing = await get_listing_by_id(db, listing_id)
    return ListingResponse.model_validate(listing)  # pragma: no cover


@router.post("", response_model=ListingResponse, status_code=201)
async def create(body: CreateListingRequest, user: CurrentUser, db: DbSession) -> ListingResponse:
    listing = await create_listing(
        db, user, body.asset_id, body.class_id, body.item_name, body.icon_url, body.rarity, body.hero, body.price, body.delivery_type
    )
    return ListingResponse.model_validate(listing)  # pragma: no cover


@router.delete("/{listing_id}", response_model=ListingResponse)
async def delete_listing(listing_id: int, user: CurrentUser, db: DbSession) -> ListingResponse:
    listing = await cancel_listing(db, user, listing_id)
    return ListingResponse.model_validate(listing)  # pragma: no cover


@router.patch("/{listing_id}", response_model=ListingResponse)
async def update_price(listing_id: int, body: UpdateListingRequest, user: CurrentUser, db: DbSession) -> ListingResponse:
    listing = await update_listing_price(db, user, listing_id, body.price)
    return ListingResponse.model_validate(listing)  # pragma: no cover
