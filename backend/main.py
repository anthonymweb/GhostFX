"""FastAPI application for beginner-friendly forex signal generation."""

import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
import logging

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

try:
    from .config import settings, telegram_credentials_configured
    from .indicators import add_indicators
    from .strategy import generate_signal
    from .trader import mt5_client, send_telegram_alert, send_telegram_message
except ImportError:
    from config import settings, telegram_credentials_configured
    from indicators import add_indicators
    from strategy import generate_signal
    from trader import mt5_client, send_telegram_alert, send_telegram_message


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

monitor_state = {
    "enabled": settings.signal_monitor_enabled,
    "interval_seconds": settings.signal_check_interval_seconds,
    "last_checked_at": None,
    "last_signal": None,
    "last_alert_key": None,
    "last_alert_sent_at": None,
    "last_error": None,
}


def _latest_signal(symbol: str, timeframe: str, candles: int):
    raw = mt5_client.fetch_candles(symbol=symbol, timeframe=timeframe, count=candles)
    enriched = add_indicators(raw)
    return generate_signal(enriched, symbol=symbol)


async def signal_monitor_loop() -> None:
    """Continuously watch for BUY/SELL signals and send Telegram alerts."""

    while True:
        try:
            signal = _latest_signal(settings.symbol, settings.timeframe, settings.candles)
            monitor_state["last_checked_at"] = datetime.utcnow().isoformat()
            monitor_state["last_signal"] = signal.to_dict()
            monitor_state["last_error"] = None

            if signal.action in {"BUY", "SELL"}:
                alert_key = f"{signal.symbol}:{signal.action}:{signal.timestamp.isoformat()}"
                if monitor_state["last_alert_key"] != alert_key:
                    alert_sent = await send_telegram_alert(signal)
                    if alert_sent:
                        monitor_state["last_alert_key"] = alert_key
                        monitor_state["last_alert_sent_at"] = datetime.utcnow().isoformat()
                        logger.info("Sent %s Telegram alert for %s.", signal.action, signal.symbol)
                    else:
                        logger.warning("Signal was actionable, but Telegram alert was not sent.")
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            monitor_state["last_error"] = str(exc)
            logger.exception("Signal monitor failed.")

        await asyncio.sleep(settings.signal_check_interval_seconds)


@asynccontextmanager
async def lifespan(app: FastAPI):
    mt5_client.connect()
    monitor_task = None
    if settings.signal_monitor_enabled:
        monitor_task = asyncio.create_task(signal_monitor_loop())
    try:
        yield
    finally:
        if monitor_task:
            monitor_task.cancel()
            try:
                await monitor_task
            except asyncio.CancelledError:
                pass
        mt5_client.shutdown()


app = FastAPI(
    title=settings.app_name,
    description="Educational forex signal API using MetaTrader 5, technical indicators, and Telegram alerts.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/status")
def status() -> dict:
    """Check API, MT5, and safety status."""

    return {
        "api": "online",
        "symbol": settings.symbol,
        "timeframe": settings.timeframe,
        "data_mode": "mt5_live_if_available_else_demo" if settings.demo_data_enabled else "mt5_live_only",
        "mt5": mt5_client.status(),
        "telegram_configured": telegram_credentials_configured(),
        "signal_monitor": monitor_state,
        "real_money_trading_enabled": False,
    }


@app.get("/market-data")
def market_data(
    symbol: str = Query(default=settings.symbol),
    timeframe: str = Query(default=settings.timeframe),
    candles: int = Query(default=settings.candles, ge=50, le=2000),
) -> dict:
    """Fetch candles from MetaTrader 5 and return indicator-enhanced data."""

    try:
        raw = mt5_client.fetch_candles(symbol=symbol, timeframe=timeframe, count=candles)
        enriched = add_indicators(raw)
    except Exception as exc:
        logger.exception("Failed to fetch market data.")
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    latest_rows = enriched.tail(50).reset_index()
    if "time" not in latest_rows.columns:
        latest_rows = latest_rows.rename(columns={latest_rows.columns[0]: "time"})
    latest_rows["time"] = latest_rows["time"].dt.strftime("%Y-%m-%dT%H:%M:%S")
    latest_rows = latest_rows.astype(object).where(latest_rows.notna(), None)

    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "candles_returned": len(latest_rows),
        "data": latest_rows.to_dict(orient="records"),
    }


@app.get("/signals")
async def signals(
    symbol: str = Query(default=settings.symbol),
    timeframe: str = Query(default=settings.timeframe),
    candles: int = Query(default=settings.candles, ge=220, le=2000),
    send_alert: bool = Query(default=True),
) -> dict:
    """Generate the current BUY, SELL, or HOLD signal."""

    try:
        signal = _latest_signal(symbol=symbol, timeframe=timeframe, candles=candles)
        alert_sent = await send_telegram_alert(signal) if send_alert else False
    except Exception as exc:
        logger.exception("Failed to generate signal.")
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    response = signal.to_dict()
    response["timeframe"] = timeframe
    response["data_mode"] = "demo_or_mt5"
    response["telegram_alert_sent"] = alert_sent
    response["paper_trading_notice"] = "Educational signal only. Do not use for autonomous real-money trading."
    return response


@app.get("/monitor/status")
def monitor_status() -> dict:
    """Show automatic signal monitor state."""

    return {
        "monitor": monitor_state,
        "notice": "Telegram alerts are sent automatically only for BUY or SELL signals.",
    }


@app.post("/telegram/test")
async def telegram_test() -> dict:
    """Send an immediate Telegram test message."""

    message = (
        "Telegram test message from AI Forex Signal Platform\n"
        f"Symbol: {settings.symbol}\n"
        "Mode: demo/paper trading only"
    )
    sent = await send_telegram_message(message)
    if not sent:
        raise HTTPException(
            status_code=503,
            detail="Telegram message was not sent. Check TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, and that you started the bot chat.",
        )
    return {"telegram_alert_sent": True, "message": "Test message sent."}


@app.post("/telegram/test-signal")
async def telegram_test_signal(action: str = Query(default="BUY", pattern="^(BUY|SELL)$")) -> dict:
    """Send a sample BUY or SELL alert so you can preview the phone message."""

    message = (
        f"{action} signal for {settings.symbol}\n"
        "Confidence: 100/100\n"
        "Price: 1.08500\n"
        "Reasons: Telegram signal alert test\n"
        "Mode: demo/paper trading only"
    )
    sent = await send_telegram_message(message)
    if not sent:
        raise HTTPException(status_code=503, detail="Telegram test signal was not sent.")
    return {"telegram_alert_sent": True, "action": action, "message": "Sample signal sent."}
