from pydantic import BaseModel


class InstrumentQuote(BaseModel):
    symbol: str
    asset_class: str
    price: float
    change_percent: float
    volatility: float
    sentiment: str


class MarketOverviewResponse(BaseModel):
    scan_status: str
    opportunities: int
    do_not_trade_count: int
    strongest_pairs: list[str]
    quotes: list[InstrumentQuote]
