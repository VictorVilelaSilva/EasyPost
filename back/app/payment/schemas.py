from decimal import Decimal

from pydantic import BaseModel, Field


class WithdrawRequest(BaseModel):
    amount: Decimal = Field(gt=0)
    pix_key: str
