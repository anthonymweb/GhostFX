from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.portfolio import Portfolio
from app.models.subscription import Subscription
from app.models.user import ExperienceMode, User
from app.schemas.auth import RegisterRequest, UpdateUserRequest, UserResponse
from app.services.notification_service import NotificationService


router = APIRouter(prefix="/auth", tags=["auth"])
notification_service = NotificationService()


@router.post("/register", response_model=UserResponse)
async def register(
    payload: RegisterRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    result = await db.execute(select(User).where(User.id == current_user.id))
    existing = result.scalar_one_or_none()
    if existing:
        return UserResponse.from_model(existing)

    try:
        experience_mode = ExperienceMode(payload.experience_mode)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid experience mode.") from exc

    user = User(
        id=current_user.id,
        email=payload.email,
        full_name=payload.full_name.strip(),
        experience_mode=experience_mode,
    )
    db.add(user)
    await db.flush()

    db.add(
        Portfolio(
            user_id=user.id,
            name="Primary Paper Portfolio",
            mode="paper",
        )
    )
    db.add(Subscription(user_id=user.id, plan="free"))

    await notification_service.create(
        db,
        user,
        channel="in_app",
        title="Welcome to GhostFX",
        body=(
            "GhostFX is your AI-powered trading co-pilot. "
            "The agent scans the markets, generates protective signals, "
            "and alerts you via Telegram. "
            "Start by checking your dashboard for the latest signal — "
            "the agent will guide you on whether to trade or sit tight. "
            "You can customize alert preferences and link Telegram in Settings."
        ),
        metadata_json={"type": "welcome", "persistent": True},
    )

    await db.commit()
    await db.refresh(user)
    return UserResponse.from_model(user)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.from_model(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    payload: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.experience_mode is not None:
        current_user.experience_mode = ExperienceMode(payload.experience_mode)
    if payload.alert_on_buy is not None:
        current_user.alert_on_buy = payload.alert_on_buy
    if payload.alert_on_sell is not None:
        current_user.alert_on_sell = payload.alert_on_sell
    if payload.alert_on_hold is not None:
        current_user.alert_on_hold = payload.alert_on_hold
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.from_model(current_user)
