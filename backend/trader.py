"""MetaTrader 5 data access and Telegram alert helpers.

This platform is intentionally signal-only. It does not place orders and should
be used with a paper trading or demo account for education and research.
"""

from __future__ import annotations

from contextlib import contextmanager
import logging
import socket
from typing import Any

import httpx
import numpy as np
import pandas as pd

try:
    from .config import settings, telegram_credentials
    from .strategy import Signal
except ImportError:
    from config import settings, telegram_credentials
    from strategy import Signal


logger = logging.getLogger(__name__)


@contextmanager
def force_ipv4_dns():
    """Temporarily filter DNS results to IPv4.

    Some networks return Telegram IPv6 addresses even when the machine has no
    usable IPv6 route, causing the Telegram client to fail with
    "Network is unreachable". This keeps Telegram requests on IPv4.
    """

    original_getaddrinfo = socket.getaddrinfo

    def ipv4_only_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
        results = original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
        return results

    socket.getaddrinfo = ipv4_only_getaddrinfo
    try:
        yield
    finally:
        socket.getaddrinfo = original_getaddrinfo

try:
    import MetaTrader5 as mt5

    MT5_IMPORT_ERROR = None
except ImportError as exc:
    mt5 = None
    MT5_IMPORT_ERROR = exc


def _timeframes() -> dict[str, int]:
    if mt5 is None:
        return {}

    return {
        "M1": mt5.TIMEFRAME_M1,
        "M5": mt5.TIMEFRAME_M5,
        "M15": mt5.TIMEFRAME_M15,
        "M30": mt5.TIMEFRAME_M30,
        "H1": mt5.TIMEFRAME_H1,
        "H4": mt5.TIMEFRAME_H4,
        "D1": mt5.TIMEFRAME_D1,
    }


class MT5Client:
    """Small wrapper around the MetaTrader5 package with safe errors."""

    def __init__(self) -> None:
        self.connected = False

    def connect(self) -> bool:
        if self.connected:
            return True

        if mt5 is None:
            logger.error("MetaTrader5 package is unavailable: %s", MT5_IMPORT_ERROR)
            self.connected = False
            return False

        if settings.mt5_login and settings.mt5_password and settings.mt5_server:
            initialized = mt5.initialize(
                login=settings.mt5_login,
                password=settings.mt5_password,
                server=settings.mt5_server,
            )
        else:
            initialized = mt5.initialize()

        if not initialized:
            error = mt5.last_error()
            logger.error("MT5 initialization failed: %s", error)
            self.connected = False
            return False

        self.connected = True
        return True

    def shutdown(self) -> None:
        if self.connected and mt5 is not None:
            mt5.shutdown()
        self.connected = False

    def status(self) -> dict[str, Any]:
        connected = self.connect()
        account = mt5.account_info() if connected and mt5 is not None else None
        terminal = mt5.terminal_info() if connected and mt5 is not None else None

        return {
            "mt5_package_available": mt5 is not None,
            "mt5_connected": connected,
            "terminal_connected": bool(terminal.connected) if terminal else False,
            "account_login": account.login if account else None,
            "server": account.server if account else None,
            "error": str(MT5_IMPORT_ERROR) if MT5_IMPORT_ERROR else None,
            "demo_data_enabled": settings.demo_data_enabled,
            "demo_only": settings.demo_only,
        }

    def fetch_candles(self, symbol: str, timeframe: str, count: int) -> pd.DataFrame:
        if mt5 is None:
            if settings.demo_data_enabled:
                logger.warning("Using generated demo candles because MetaTrader5 is unavailable.")
                return generate_demo_candles(count=count)
            raise RuntimeError(f"MetaTrader5 package is unavailable: {MT5_IMPORT_ERROR}")

        timeframes = _timeframes()
        if timeframe not in timeframes:
            raise ValueError(f"Unsupported timeframe '{timeframe}'. Choose from {sorted(timeframes)}.")

        if not self.connect():
            error = MT5_IMPORT_ERROR or mt5.last_error()
            raise ConnectionError(f"Could not connect to MetaTrader 5: {error}")

        if not mt5.symbol_select(symbol, True):
            raise ValueError(f"Could not select symbol '{symbol}' in MetaTrader 5.")

        rates = mt5.copy_rates_from_pos(symbol, timeframes[timeframe], 0, count)
        if rates is None or len(rates) == 0:
            raise RuntimeError(f"No candle data returned for {symbol} {timeframe}: {mt5.last_error()}")

        candles = pd.DataFrame(rates)
        candles["time"] = pd.to_datetime(candles["time"], unit="s")
        candles = candles.set_index("time")
        return candles


def generate_demo_candles(count: int) -> pd.DataFrame:
    """Generate realistic-looking candles for local development.

    This keeps the API useful on Linux or any machine without MT5 installed.
    It is not market data and should only be used for development demos.
    """

    rng = np.random.default_rng(seed=42)
    index = pd.date_range(end=pd.Timestamp.utcnow().floor("15min"), periods=count, freq="15min")
    returns = rng.normal(loc=0.00001, scale=0.00045, size=count)
    close = 1.0850 + np.cumsum(returns)
    open_ = np.roll(close, 1)
    open_[0] = close[0] - returns[0]
    spread = rng.uniform(0.00008, 0.00035, size=count)
    high = np.maximum(open_, close) + spread
    low = np.minimum(open_, close) - spread

    candles = pd.DataFrame(
        {
            "open": open_,
            "high": high,
            "low": low,
            "close": close,
            "tick_volume": rng.integers(200, 1200, size=count),
            "spread": rng.integers(5, 20, size=count),
            "real_volume": 0,
        },
        index=index,
    )
    candles.index.name = "time"
    return candles


async def send_telegram_message(message: str) -> bool:
    """Send a plain Telegram message using configured bot credentials."""

    bot_token, chat_id, enabled = telegram_credentials()

    if not enabled:
        return False

    if not bot_token or not chat_id:
        logger.info("Telegram credentials are not configured; skipping alert.")
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message}

    try:
        with force_ipv4_dns():
            async with httpx.AsyncClient(timeout=30, trust_env=False, http2=False) as client:
                response = await client.post(url, data=payload)
        data = response.json()
        if response.status_code != 200 or not data.get("ok"):
            logger.error("Telegram API rejected message: %s", data.get("description", response.text))
            return False
        return True
    except Exception:
        logger.exception("Failed to send Telegram message.")
        return False


async def send_telegram_alert(signal: Signal) -> bool:
    """Send Telegram alert for actionable BUY/SELL signals."""

    if signal.action not in {"BUY", "SELL"}:
        return False

    message = (
        f"{signal.action} signal for {signal.symbol}\n"
        f"Confidence: {signal.confidence}/100\n"
        f"Price: {signal.price:.5f}\n"
        f"Reasons: {', '.join(signal.reason)}\n"
        "Mode: demo/paper trading only"
    )
    return await send_telegram_message(message)


mt5_client = MT5Client()
