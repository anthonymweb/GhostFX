"""Application configuration loaded from environment variables.

This file keeps credentials and runtime settings out of the source code.
For local development, export the variables in your shell before starting
FastAPI, or use your process manager's environment configuration.
"""

from dataclasses import dataclass
import os
from pathlib import Path

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env")


@dataclass(frozen=True)
class Settings:
    app_name: str = "AI Forex Signal Platform"
    symbol: str = os.getenv("FOREX_SYMBOL", "EURUSD")
    timeframe: str = os.getenv("FOREX_TIMEFRAME", "M15")
    candles: int = int(os.getenv("FOREX_CANDLES", "300"))

    telegram_bot_token: str | None = os.getenv("TELEGRAM_BOT_TOKEN")
    telegram_chat_id: str | None = os.getenv("TELEGRAM_CHAT_ID")
    telegram_enabled: bool = os.getenv("TELEGRAM_ENABLED", "true").lower() == "true"
    demo_data_enabled: bool = os.getenv("DEMO_DATA_ENABLED", "true").lower() == "true"
    signal_monitor_enabled: bool = os.getenv("SIGNAL_MONITOR_ENABLED", "true").lower() == "true"
    signal_check_interval_seconds: int = int(os.getenv("SIGNAL_CHECK_INTERVAL_SECONDS", "60"))

    mt5_login: int | None = int(os.getenv("MT5_LOGIN")) if os.getenv("MT5_LOGIN") else None
    mt5_password: str | None = os.getenv("MT5_PASSWORD")
    mt5_server: str | None = os.getenv("MT5_SERVER")

    demo_only: bool = True


settings = Settings()


def reload_environment() -> None:
    """Reload local environment files so credentials can be edited while developing."""

    load_dotenv(ROOT_DIR / ".env", override=True)
    load_dotenv(Path(__file__).resolve().parent / ".env", override=True)


def telegram_credentials_configured() -> bool:
    reload_environment()
    return bool(os.getenv("TELEGRAM_BOT_TOKEN") and os.getenv("TELEGRAM_CHAT_ID"))


def telegram_credentials() -> tuple[str | None, str | None, bool]:
    reload_environment()
    enabled = os.getenv("TELEGRAM_ENABLED", "true").lower() == "true"
    return os.getenv("TELEGRAM_BOT_TOKEN"), os.getenv("TELEGRAM_CHAT_ID"), enabled
