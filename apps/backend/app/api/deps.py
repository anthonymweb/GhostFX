from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_supabase_token
from app.models.portfolio import Portfolio
from app.models.subscription import Subscription
from app.models.user import User, UserRole
from app.services.notification_service import NotificationService


bearer_scheme = HTTPBearer(auto_error=False)
notification_service = NotificationService()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    try:
        payload = decode_supabase_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.") from exc

    supabase_id = payload.get("sub")
    if not supabase_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload.")

    result = await db.execute(select(User).where(User.id == supabase_id))
    user = result.scalar_one_or_none()
    if user:
        return user

    # First login — auto-create local user record
    email = payload.get("email", "")
    full_name = payload.get("user_metadata", {}).get("full_name", email.split("@")[0])
    user = User(id=supabase_id, email=email, full_name=full_name)
    db.add(user)
    await db.flush()

    db.add(Portfolio(user_id=user.id, name="Primary Paper Portfolio", mode="paper"))
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
            "Start by checking your dashboard for the latest signal."
        ),
        metadata_json={"type": "welcome", "persistent": True},
    )

    await db.commit()
    await db.refresh(user)
    return user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return current_user
