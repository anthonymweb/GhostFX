import enum

from sqlalchemy import Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import JsonDict, TimestampMixin, UUIDMixin


class TradeStatus(str, enum.Enum):
    open = "OPEN"
    closed = "CLOSED"
    cancelled = "CANCELLED"


class Trade(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "trades"

    portfolio_id: Mapped[str] = mapped_column(ForeignKey("portfolios.id"), index=True)
    signal_id: Mapped[str | None] = mapped_column(ForeignKey("signals.id"), nullable=True)
    symbol: Mapped[str] = mapped_column(String(20), index=True)
    side: Mapped[str] = mapped_column(String(8))
    quantity: Mapped[float] = mapped_column(Float)
    entry_price: Mapped[float] = mapped_column(Float)
    stop_loss: Mapped[float] = mapped_column(Float)
    take_profit: Mapped[float] = mapped_column(Float)
    exit_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    pnl: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[TradeStatus] = mapped_column(Enum(TradeStatus), default=TradeStatus.open)
    metadata_json: Mapped[dict] = mapped_column(JsonDict, default=dict)

    portfolio = relationship("Portfolio", back_populates="trades")
