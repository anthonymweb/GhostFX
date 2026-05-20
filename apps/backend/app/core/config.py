from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "GhostFX AI Agent"
    environment: str = "development"
    debug: bool = True
    api_prefix: str = "/api/v1"
    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"])
    cors_origin_regex: str | None = r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+"

    database_url: str = "sqlite+aiosqlite:///./ghostfx.db"
    redis_url: str = "redis://localhost:6379/0"
    enable_rate_limiter: bool = False

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    refresh_token_expire_days: int = 30

    telegram_bot_token: str = ""
    telegram_webhook_secret: str = ""
    telegram_webapp_url: str = "https://app.ghostfx.local"
    twelve_data_api_key: str = ""
    finnhub_api_key: str = ""
    huggingface_api_token: str = ""
    huggingface_model: str = "mistralai/Mistral-7B-Instruct-v0.3"
    resend_api_key: str = ""
    resend_from_email: str = "GhostFX <alerts@ghostfx.ai>"
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    stripe_webhook_secret: str = ""

    default_watchlist: List[str] = Field(
        default_factory=lambda: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "BTCUSD", "NAS100"]
    )
    market_refresh_seconds: int = 30
    signal_scan_seconds: int = 60
    paper_starting_balance: float = 10000.0

    @field_validator("debug", mode="before")
    @classmethod
    def normalize_debug(cls, value):
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"true", "1", "yes", "on", "development", "dev"}:
                return True
            if normalized in {"false", "0", "no", "off", "production", "prod", "release"}:
                return False
        return value

    @field_validator("cors_origins", mode="before")
    @classmethod
    def normalize_cors_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
