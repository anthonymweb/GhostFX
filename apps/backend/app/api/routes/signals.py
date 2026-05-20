from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.signal import SignalResponse
from app.services.agent_service import AgentService


router = APIRouter(prefix="/signals", tags=["signals"])
agent_service = AgentService()


@router.get("/latest", response_model=SignalResponse)
async def latest_signal(
    symbol: str = Query("EURUSD"),
    timeframe: str = Query("M15"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SignalResponse:
    signal = await agent_service.generate_signal(db, current_user, symbol, timeframe)
    return SignalResponse.from_model(signal)


@router.get("/feed", response_model=list[SignalResponse])
async def signal_feed(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SignalResponse]:
    signals = await agent_service.feed(db)
    return [SignalResponse.from_model(signal) for signal in signals]
