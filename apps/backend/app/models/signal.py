import enum

from sqlalchemy import Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.mixins import JsonDict, TimestampMixin, UUIDMixin


class SignalAction(str, enum.Enum):
    buy = "BUY"
    sell = "SELL"
    wait = "WAIT"
    do_not_trade = "DO_NOT_TRADE"


class RiskLevel(str, enum.Enum):
    low = "LOW"
    medium = "MEDIUM"
    high = "HIGH"


class Signal(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "signals"

    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    symbol: Mapped[str] = mapped_column(String(20), index=True)
    asset_class: Mapped[str] = mapped_column(String(20), default="forex")
    timeframe: Mapped[str] = mapped_column(String(10), default="M15")
    action: Mapped[SignalAction] = mapped_column(Enum(SignalAction), index=True)
    confidence: Mapped[int] = mapped_column(Integer)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel))
    entry_price: Mapped[float] = mapped_column(Float)
    stop_loss: Mapped[float] = mapped_column(Float)
    take_profit: Mapped[float] = mapped_column(Float)
    reasoning: Mapped[list[str]] = mapped_column(JsonDict)
    indicators: Mapped[dict] = mapped_column(JsonDict)
    market_context: Mapped[dict] = mapped_column(JsonDict)
    agent_summary: Mapped[str] = mapped_column(Text)
