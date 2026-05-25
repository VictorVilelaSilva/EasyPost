from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    steam_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String)
    trade_url: Mapped[str | None] = mapped_column(String)
    steam_api_key: Mapped[str | None] = mapped_column(String)
    is_trade_banned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reputation: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    email: Mapped[str | None] = mapped_column(String, unique=True)
    cpf: Mapped[str | None] = mapped_column(String)
    asaas_customer_id: Mapped[str | None] = mapped_column(String, unique=True)
    pix_key: Mapped[str | None] = mapped_column(String)
    pix_key_type: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    listings: Mapped[list["Listing"]] = relationship(back_populates="seller", foreign_keys="Listing.seller_id")  # noqa: F821
