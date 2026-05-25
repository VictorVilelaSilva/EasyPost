from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, Field


class RateTransactionRequest(BaseModel):
    stars: Annotated[int, Field(ge=0, le=5)]
    comment: str | None = None


class RatingResponse(BaseModel):
    id: int
    transaction_id: int
    rater_id: int
    ratee_id: int
    stars: int
    comment: str | None
    created_at: datetime
    rater_display_name: str
    rater_avatar_url: str | None

    model_config = {"from_attributes": True}
