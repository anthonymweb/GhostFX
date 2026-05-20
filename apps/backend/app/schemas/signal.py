from pydantic import BaseModel


class SignalResponse(BaseModel):
    id: str
    symbol: str
    asset_class: str
    timeframe: str
    action: str
    confidence: int
    risk_level: str
    entry_price: float
    stop_loss: float
    take_profit: float
    reasoning: list[str]
    indicators: dict
    market_context: dict
    agent_summary: str
    created_at: str

    @classmethod
    def from_model(cls, signal) -> "SignalResponse":
        return cls(
            id=signal.id,
            symbol=signal.symbol,
            asset_class=signal.asset_class,
            timeframe=signal.timeframe,
            action=signal.action.value,
            confidence=signal.confidence,
            risk_level=signal.risk_level.value,
            entry_price=signal.entry_price,
            stop_loss=signal.stop_loss,
            take_profit=signal.take_profit,
            reasoning=signal.reasoning,
            indicators=signal.indicators,
            market_context=signal.market_context,
            agent_summary=signal.agent_summary,
            created_at=signal.created_at.isoformat(),
        )
