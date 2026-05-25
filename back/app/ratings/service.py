import logging
from math import floor

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.models import User
from app.common.exceptions import BadRequestError, ConflictError, ForbiddenError, NotFoundError
from app.ratings.models import Rating
from app.trade.models import Transaction

logger = logging.getLogger(__name__)


async def submit_rating(
    db: AsyncSession,
    current_user: User,
    transaction_id: int,
    stars: int,
    comment: str | None,
) -> Rating:
    result = await db.execute(select(Transaction).where(Transaction.id == transaction_id))
    tx = result.scalar_one_or_none()
    if tx is None:
        raise NotFoundError("Transaction not found")

    if tx.status != "completed":
        raise BadRequestError("Ratings can only be submitted for completed transactions")

    if current_user.id not in (tx.buyer_id, tx.seller_id):
        raise ForbiddenError("You are not a participant of this transaction")

    rater_id = current_user.id
    ratee_id = tx.seller_id if rater_id == tx.buyer_id else tx.buyer_id

    rating = Rating(
        transaction_id=transaction_id,
        rater_id=rater_id,
        ratee_id=ratee_id,
        stars=stars,
        comment=comment,
    )
    db.add(rating)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise ConflictError("You have already rated this transaction")

    await _recalculate_reputation(db, ratee_id)
    await db.commit()
    result = await db.execute(
        select(Rating).options(selectinload(Rating.rater)).where(Rating.id == rating.id)
    )
    return result.scalar_one()


async def _recalculate_reputation(db: AsyncSession, ratee_id: int) -> None:
    total_result = await db.execute(
        select(func.count()).where(Rating.ratee_id == ratee_id)
    )
    total = total_result.scalar_one()
    if total == 0:
        return

    positive_result = await db.execute(
        select(func.count()).where(Rating.ratee_id == ratee_id, Rating.stars >= 4)
    )
    positives = positive_result.scalar_one()

    ratee_result = await db.execute(select(User).where(User.id == ratee_id))
    ratee = ratee_result.scalar_one()
    ratee.reputation = floor(positives / total * 100)


async def get_user_ratings(db: AsyncSession, user_id: int) -> list[Rating]:
    user_result = await db.execute(select(User).where(User.id == user_id))
    if user_result.scalar_one_or_none() is None:
        raise NotFoundError("User not found")

    result = await db.execute(
        select(Rating)
        .options(selectinload(Rating.rater))
        .where(Rating.ratee_id == user_id)
        .order_by(Rating.created_at.desc())
    )
    return list(result.scalars().all())
