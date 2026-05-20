from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.market import InstrumentQuote, MarketOverviewResponse
from app.services.market_data import MarketDataService


router = APIRouter(prefix="/market", tags=["market"])
market_service = MarketDataService()


@router.get("/overview", response_model=MarketOverviewResponse)
async def market_overview(current_user: User = Depends(get_current_user)) -> MarketOverviewResponse:
    quotes = [InstrumentQuote(**quote) for quote in market_service.list_quotes(market_service.get_watchlist())]
    sorted_quotes = sorted(quotes, key=lambda item: item.change_percent, reverse=True)
    return MarketOverviewResponse(
        scan_status="active",
        opportunities=len([quote for quote in quotes if quote.sentiment == "bullish"]),
        do_not_trade_count=len([quote for quote in quotes if quote.volatility > 1.5]),
        strongest_pairs=[quote.symbol for quote in sorted_quotes[:3]],
        quotes=quotes,
    )


@router.get("/candles")
async def candles(
    symbol: str = Query("EURUSD"),
    timeframe: str = Query("M15"),
    candles: int = Query(120, ge=60, le=500),
    current_user: User = Depends(get_current_user),
) -> dict:
    snapshot = market_service.generate_market_snapshot(symbol, timeframe, candles)
    data = snapshot.candles.tail(candles).to_dict(orient="records")
    serialized = []
    for row in data:
        serialized.append({key: value.isoformat() if hasattr(value, "isoformat") else float(value) if hasattr(value, "item") else value for key, value in row.items()})
    return {"symbol": symbol, "asset_class": snapshot.asset_class, "timeframe": timeframe, "data": serialized}
