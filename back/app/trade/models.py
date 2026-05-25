from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

TRANSACTION_STATUSES = (
    "pending_payment",
    "paid",
    "trade_pending",
    "trade_sent",
    "offer_confirmed",
    "completed",
    "cancelled",
    "refunded",
    # Gift-specific
    "seller_confirming",
    "friend_pending",
    "friendship_cooling",
    "gift_pending",
    "gift_sent",
)


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending_payment','paid','trade_pending','trade_sent','offer_confirmed','completed','cancelled','refunded',"
            "'seller_confirming','friend_pending','friendship_cooling','gift_pending','gift_sent')",
            name="transactions_status_check",
        ),
        CheckConstraint(
            "delivery_type IN ('trade', 'gift')",
            name="transactions_delivery_type_check",
        ),
        Index("transactions_listing_id_idx", "listing_id"),
        Index("transactions_buyer_id_idx", "buyer_id"),
        Index("transactions_seller_id_idx", "seller_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id"), nullable=False)
    buyer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    platform_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    seller_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(String, default="pending_payment", nullable=False)
    delivery_type: Mapped[str] = mapped_column(String, default="trade", server_default="trade", nullable=False)
    security_code: Mapped[str] = mapped_column(String, nullable=False)
    trade_offer_id: Mapped[str | None] = mapped_column(String)
    payment_id: Mapped[str | None] = mapped_column(String)
    pix_qr_code: Mapped[str | None] = mapped_column(String)
    pix_copy_paste: Mapped[str | None] = mapped_column(String)
    payout_transfer_id: Mapped[str | None] = mapped_column(String)
    trade_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    seller_payout_after: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    friendship_accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    listing: Mapped["Listing"] = relationship(foreign_keys=[listing_id])  # noqa: F821
    buyer: Mapped["User"] = relationship(foreign_keys=[buyer_id])  # noqa: F821
    seller: Mapped["User"] = relationship(foreign_keys=[seller_id])  # noqa: F821

    @property
    def buyer_steam_id(self) -> str | None:
        return self.buyer.steam_id if self.buyer else None

    @property
    def buyer_display_name(self) -> str | None:
        return self.buyer.display_name if self.buyer else None

    @property
    def buyer_avatar_url(self) -> str | None:
        return self.buyer.avatar_url if self.buyer else None

    @property
    def buyer_reputation(self) -> int:
        return self.buyer.reputation if self.buyer else 0

    @property
    def buyer_trade_url(self) -> str | None:
        return self.buyer.trade_url if self.buyer else None
