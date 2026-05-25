from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.models import User
from app.common.exceptions import BadRequestError, ForbiddenError, NotFoundError
from app.listings.models import Listing


async def get_active_listings(
    db: AsyncSession,
    page: int = 1,
    limit: int = 24,
    rarity: list[str] | None = None,
    name: str | None = None,
) -> tuple[list[Listing], int]:
    """Returns (items, total_count)"""
    base_query = select(Listing).where(Listing.status == "active")

    if rarity:
        base_query = base_query.where(Listing.rarity.in_(rarity))
    if name:
        base_query = base_query.where(Listing.item_name.ilike(f"%{name}%"))

    # Count total (without selectinload to keep count query simple)
    count_query = select(func.count()).select_from(base_query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Paginated items — eager-load seller to avoid MissingGreenlet on serialization
    offset = (page - 1) * limit
    items_query = (
        base_query
        .options(selectinload(Listing.seller))
        .order_by(Listing.id.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(items_query)
    items = list(result.scalars().all())

    return items, total


async def search_listings(
    db: AsyncSession, q: str, cursor: int | None = None, limit: int = 20
) -> tuple[list[Listing], int | None]:
    query = (
        select(Listing)
        .options(selectinload(Listing.seller))
        .where(Listing.status == "active")
        .where(Listing.item_name.ilike(f"%{q}%"))
        .order_by(Listing.id.desc())
        .limit(limit + 1)
    )
    if cursor is not None:
        query = query.where(Listing.id < cursor)

    result = await db.execute(query)
    items = list(result.scalars().all())

    next_cursor = None
    if len(items) > limit:
        items = items[:limit]
        next_cursor = items[-1].id

    return items, next_cursor


async def get_listing_by_id(db: AsyncSession, listing_id: int) -> Listing:
    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.seller))
        .where(Listing.id == listing_id)
    )
    listing = result.scalar_one_or_none()
    if listing is None:
        raise NotFoundError("Listing not found")
    return listing


async def get_active_user_listings(
    db: AsyncSession,
    user_id: int,
    page: int = 1,
    limit: int = 24,
) -> tuple[list[Listing], int]:
    base_query = select(Listing).where(
        Listing.seller_id == user_id,
        Listing.status == "active",
    )

    count_query = select(func.count()).select_from(base_query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * limit
    items_query = (
        base_query
        .options(selectinload(Listing.seller))
        .order_by(Listing.id.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(items_query)
    return list(result.scalars().all()), total


async def get_user_listings(db: AsyncSession, user_id: int) -> list[Listing]:
    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.seller))
        .where(Listing.seller_id == user_id)
        .order_by(Listing.id.desc())
    )
    return list(result.scalars().all())


async def create_listing(db: AsyncSession, user: User, asset_id: str, class_id: str, item_name: str, icon_url: str | None, rarity: str | None, hero: str | None, price: float, delivery_type: str) -> Listing:
    if not user.trade_url:
        raise BadRequestError("Trade URL is required to create listings")
    if not user.pix_key:
        raise BadRequestError("pix_key_required")

    existing = await db.execute(
        select(Listing).where(
            Listing.seller_id == user.id,
            Listing.asset_id == asset_id,
            Listing.status == "active",
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise BadRequestError("Item already listed")

    listing = Listing(
        seller_id=user.id,
        asset_id=asset_id,
        class_id=class_id,
        item_name=item_name,
        icon_url=icon_url,
        rarity=rarity,
        hero=hero,
        price=price,
        delivery_type=delivery_type,
    )
    db.add(listing)
    await db.commit()
    # Re-fetch with seller eagerly loaded so ListingResponse serializes correctly
    return await get_listing_by_id(db, listing.id)


async def cancel_listing(db: AsyncSession, user: User, listing_id: int) -> Listing:
    listing = await get_listing_by_id(db, listing_id)
    if listing.seller_id != user.id:
        raise ForbiddenError("Not your listing")
    if listing.status != "active":
        raise BadRequestError("Can only cancel active listings")
    listing.status = "cancelled"
    await db.commit()
    await db.refresh(listing)
    return listing


async def update_listing_price(db: AsyncSession, user: User, listing_id: int, price: float) -> Listing:
    if price <= 0:
        raise ValueError("Price must be greater than 0")
    listing = await get_listing_by_id(db, listing_id)
    if listing.seller_id != user.id:
        raise ForbiddenError("Not your listing")
    if listing.status != "active":
        raise BadRequestError("Can only edit active listings")
    listing.price = price
    await db.commit()
    await db.refresh(listing)
    return listing


async def get_grouped_listings(
    db: AsyncSession,
    page: int = 1,
    limit: int = 24,
    rarity: list[str] | None = None,
    name: str | None = None,
) -> tuple[list[dict], int]:
    """Returns (grouped_rows, total_distinct_class_ids)."""
    active_filter = [Listing.status == "active"]
    if rarity:
        active_filter.append(Listing.rarity.in_(rarity))
    if name:
        active_filter.append(Listing.item_name.ilike(f"%{name}%"))

    # Count distinct class_ids matching filters
    count_subquery = (
        select(Listing.class_id)
        .where(*active_filter)
        .group_by(Listing.class_id)
        .subquery()
    )
    count_query = select(func.count()).select_from(count_subquery)
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Grouped query — use func.max for string fields since same class_id
    # always has identical item_name/icon_url/rarity/hero values
    items_query = (
        select(
            Listing.class_id,
            func.max(Listing.item_name).label("item_name"),
            func.max(Listing.icon_url).label("icon_url"),
            func.max(Listing.rarity).label("rarity"),
            func.max(Listing.hero).label("hero"),
            func.avg(Listing.price).label("avg_price"),
            func.count(Listing.id).label("offer_count"),
        )
        .where(*active_filter)
        .group_by(Listing.class_id)
        .order_by(Listing.class_id)
        .limit(limit)
        .offset((page - 1) * limit)
    )
    result = await db.execute(items_query)
    rows = [dict(r) for r in result.mappings().all()]
    # Ensure avg_price is float
    for row in rows:
        row["avg_price"] = float(row["avg_price"])
    return rows, total


async def get_listings_by_class(
    db: AsyncSession,
    class_id: str,
    page: int = 1,
    limit: int = 12,
) -> tuple[list[tuple], int]:
    """Returns ([(listing, seller), ...], total) ordered by price ASC."""
    base_filter = [Listing.status == "active", Listing.class_id == class_id]

    count_result = await db.execute(select(func.count()).select_from(Listing).where(*base_filter))
    total = count_result.scalar_one()

    query = (
        select(Listing, User)
        .join(User, User.id == Listing.seller_id)
        .where(*base_filter)
        .order_by(Listing.price.asc())
        .limit(limit)
        .offset((page - 1) * limit)
    )
    result = await db.execute(query)
    return list(result.all()), total
