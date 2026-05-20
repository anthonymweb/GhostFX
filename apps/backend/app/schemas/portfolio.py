from pydantic import BaseModel


class PortfolioResponse(BaseModel):
    id: str
    name: str
    mode: str
    balance: float
    equity: float
    max_daily_loss: float
    max_risk_per_trade: float
    stats: dict


class PaperTradeRequest(BaseModel):
    symbol: str
    side: str
    quantity: float
    entry_price: float
    stop_loss: float
    take_profit: float
