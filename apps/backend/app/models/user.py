import enum

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin, UUIDMixin


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class ExperienceMode(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.user)
    experience_mode: Mapped[ExperienceMode] = mapped_column(Enum(ExperienceMode), default=ExperienceMode.beginner)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    telegram_chat_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    broker_connected: Mapped[bool] = mapped_column(Boolean, default=False)
    paper_trading_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
