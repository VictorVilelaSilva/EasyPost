from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Listing(Base):
    __tablename__ = "listings"
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'reserved', 'sold', 'cancelled')",
            name="listings_status_check",
        ),
        CheckConstraint(
            "delivery_type IN ('trade', 'gift')",
            name="listings_delivery_type_check",
        ),
        Index("listings_seller_id_idx", "seller_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    asset_id: Mapped[str] = mapped_column(String, nullable=False)
    class_id: Mapped[str] = mapped_column(String, nullable=False)
    item_name: Mapped[str] = mapped_column(String, nullable=False)
    icon_url: Mapped[str | None] = mapped_column(String)
    rarity: Mapped[str | None] = mapped_column(String)
    hero: Mapped[str | None] = mapped_column(String)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(String, default="active", nullable=False)
    delivery_type: Mapped[str] = mapped_column(String, default="trade", server_default="trade", nullable=False)
    tradable_after: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    seller: Mapped["User"] = relationship(back_populates="listings", foreign_keys=[seller_id])  # noqa: F821

    @property
    def seller_display_name(self) -> str | None:
        return self.seller.display_name if self.seller else None

    @property
    def seller_avatar_url(self) -> str | None:
        return self.seller.avatar_url if self.seller else None

    @property
    def seller_reputation(self) -> int:
        return self.seller.reputation if self.seller else 0

    @property
    def seller_steam_id(self) -> str | None:
        return self.seller.steam_id if self.seller else None
