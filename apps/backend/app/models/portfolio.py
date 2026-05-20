from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import JsonDict, TimestampMixin, UUIDMixin


class Portfolio(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "portfolios"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    mode: Mapped[str] = mapped_column(String(20), default="paper")
    balance: Mapped[float] = mapped_column(Float, default=10000.0)
    equity: Mapped[float] = mapped_column(Float, default=10000.0)
    max_daily_loss: Mapped[float] = mapped_column(Float, default=300.0)
    max_risk_per_trade: Mapped[float] = mapped_column(Float, default=0.01)
    stats: Mapped[dict] = mapped_column(JsonDict, default=dict)

    user = relationship("User", back_populates="portfolios")
    trades = relationship("Trade", backref="portfolio", cascade="all, delete-orphan")
