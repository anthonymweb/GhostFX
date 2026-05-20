from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.portfolio import Portfolio
from app.models.trade import Trade, TradeStatus
from app.models.user import User
from app.schemas.portfolio import PaperTradeRequest, PortfolioResponse


router = APIRouter(prefix="/portfolios", tags=["portfolios"])


@router.get("/me", response_model=list[PortfolioResponse])
async def list_portfolios(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[PortfolioResponse]:
    result = await db.execute(select(Portfolio).where(Portfolio.user_id == current_user.id))
    portfolios = result.scalars().all()
    return [
        PortfolioResponse(
            id=item.id,
            name=item.name,
            mode=item.mode,
            balance=item.balance,
            equity=item.equity,
            max_daily_loss=item.max_daily_loss,
            max_risk_per_trade=item.max_risk_per_trade,
            stats=item.stats,
        )
        for item in portfolios
    ]


@router.post("/{portfolio_id}/paper-trades")
async def create_paper_trade(
    portfolio_id: str,
    payload: PaperTradeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(select(Portfolio).where(Portfolio.id == portfolio_id, Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")

    trade = Trade(
        portfolio_id=portfolio.id,
        symbol=payload.symbol,
        side=payload.side,
        quantity=payload.quantity,
        entry_price=payload.entry_price,
        stop_loss=payload.stop_loss,
        take_profit=payload.take_profit,
        status=TradeStatus.open,
        metadata_json={"source": "paper-trading"},
    )
    db.add(trade)
    await db.commit()
    return {"status": "submitted", "message": "Paper trade created successfully."}
