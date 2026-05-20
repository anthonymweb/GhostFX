from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, hash_password, hash_refresh_token, verify_password
from app.models.portfolio import Portfolio
from app.models.refresh_token import RefreshToken
from app.models.subscription import Subscription
from app.models.user import ExperienceMode, User
from app.schemas.auth import LoginRequest, LogoutRequest, RefreshTokenRequest, RegisterRequest, TokenResponse, UserResponse


router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _is_expired(value: datetime) -> bool:
    expires_at = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    return expires_at <= _now()


def _expires_in_seconds() -> int:
    return settings.access_token_expire_minutes * 60


async def _issue_tokens(user: User, db: AsyncSession) -> TokenResponse:
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_refresh_token(refresh_token),
            expires_at=_now() + timedelta(days=settings.refresh_token_expire_days),
        )
    )
    await db.commit()
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, expires_in=_expires_in_seconds())


@router.post("/register", response_model=TokenResponse)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    email = _normalize_email(payload.email)
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")

    try:
        experience_mode = ExperienceMode(payload.experience_mode)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid experience mode.") from exc

    user = User(
        email=email,
        full_name=payload.full_name.strip(),
        hashed_password=hash_password(payload.password),
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
    await db.flush()
    return await _issue_tokens(user, db)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    result = await db.execute(select(User).where(User.email == _normalize_email(payload.email)))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled.")
    return await _issue_tokens(user, db)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    token_hash = hash_refresh_token(payload.refresh_token)
    result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    stored_token = result.scalar_one_or_none()
    if not stored_token or stored_token.revoked_at is not None or _is_expired(stored_token.expires_at):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or revoked.")

    user_result = await db.execute(select(User).where(User.id == stored_token.user_id))
    user = user_result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User session is invalid.")

    stored_token.revoked_at = _now()
    return await _issue_tokens(user, db)


@router.post("/logout")
async def logout(payload: LogoutRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    if payload.refresh_token:
        token_hash = hash_refresh_token(payload.refresh_token)
        result = await db.execute(
            select(RefreshToken).where(RefreshToken.user_id == current_user.id, RefreshToken.token_hash == token_hash)
        )
        stored_token = result.scalar_one_or_none()
        if stored_token and stored_token.revoked_at is None:
            stored_token.revoked_at = _now()
            await db.commit()
    return {"status": "signed_out"}


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.from_model(current_user)
