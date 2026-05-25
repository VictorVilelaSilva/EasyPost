from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Rating(Base):
    __tablename__ = "ratings"
    __table_args__ = (
        CheckConstraint("stars >= 0 AND stars <= 5", name="ratings_stars_check"),
        UniqueConstraint("transaction_id", "rater_id", name="ratings_transaction_rater_uc"),
        Index("ratings_ratee_id_idx", "ratee_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    transaction_id: Mapped[int] = mapped_column(ForeignKey("transactions.id"), nullable=False)
    rater_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    ratee_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    stars: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    rater: Mapped["User"] = relationship(foreign_keys=[rater_id])  # noqa: F821
    ratee: Mapped["User"] = relationship(foreign_keys=[ratee_id])  # noqa: F821
    transaction: Mapped["Transaction"] = relationship(foreign_keys=[transaction_id])  # noqa: F821

    @property
    def rater_display_name(self) -> str:
        return self.rater.display_name if self.rater else ""

    @property
    def rater_avatar_url(self) -> str | None:
        return self.rater.avatar_url if self.rater else None
