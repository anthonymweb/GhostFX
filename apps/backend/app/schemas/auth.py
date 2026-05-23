from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    experience_mode: str = "beginner"


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    experience_mode: str
    broker_connected: bool
    paper_trading_enabled: bool
    telegram_connected: bool
    alert_on_buy: bool = True
    alert_on_sell: bool = True
    alert_on_hold: bool = False

    @classmethod
    def from_model(cls, user) -> "UserResponse":
        return cls(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role.value,
            experience_mode=user.experience_mode.value,
            broker_connected=user.broker_connected,
            paper_trading_enabled=user.paper_trading_enabled,
            telegram_connected=bool(user.telegram_chat_id),
            alert_on_buy=user.alert_on_buy,
            alert_on_sell=user.alert_on_sell,
            alert_on_hold=user.alert_on_hold,
        )


class UpdateUserRequest(BaseModel):
    full_name: str | None = None
    experience_mode: str | None = None
    alert_on_buy: bool | None = None
    alert_on_sell: bool | None = None
    alert_on_hold: bool | None = None
