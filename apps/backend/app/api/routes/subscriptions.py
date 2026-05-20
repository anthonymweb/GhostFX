from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.subscription import Subscription
from app.models.user import User


router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("/me")
async def my_subscription(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Subscription).where(Subscription.user_id == current_user.id))
    subscription = result.scalar_one_or_none()
    return {
        "plan": subscription.plan if subscription else "free",
        "billing": "stripe",
        "features": {
            "free": ["paper trading", "daily summary", "basic alerts"],
            "pro": ["live monitoring", "telegram co-pilot", "risk analytics"],
            "elite": ["multi-market agent", "priority automation", "strategy lab"],
        },
    }
