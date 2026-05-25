from fastapi import APIRouter
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.common.dependencies import CurrentUser, DbSession
from app.common.exceptions import NotFoundError
from app.ratings.models import Rating
from app.ratings.schemas import RateTransactionRequest, RatingResponse
from app.ratings.service import get_user_ratings, submit_rating

router = APIRouter(tags=["ratings"])


@router.post("/transactions/{transaction_id}/rate", response_model=RatingResponse, status_code=201)
async def rate_transaction(
    transaction_id: int,
    body: RateTransactionRequest,
    user: CurrentUser,
    db: DbSession,
) -> RatingResponse:
    rating = await submit_rating(db, user, transaction_id, body.stars, body.comment)
    return RatingResponse.model_validate(rating)


@router.get("/transactions/{transaction_id}/my-rating", response_model=RatingResponse)
async def get_my_rating(transaction_id: int, user: CurrentUser, db: DbSession) -> RatingResponse:
    result = await db.execute(
        select(Rating)
        .options(selectinload(Rating.rater))
        .where(Rating.transaction_id == transaction_id, Rating.rater_id == user.id)
    )
    rating = result.scalar_one_or_none()
    if rating is None:
        raise NotFoundError("Rating not found")
    return RatingResponse.model_validate(rating)


@router.get("/users/{user_id}/ratings", response_model=list[RatingResponse])
async def get_ratings(user_id: int, db: DbSession) -> list[RatingResponse]:
    ratings = await get_user_ratings(db, user_id)
    return [RatingResponse.model_validate(r) for r in ratings]
