from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import math
import random

import httpx
import numpy as np
import pandas as pd

from app.core.config import get_settings


@dataclass
class MarketSnapshot:
    symbol: str
    asset_class: str
    timeframe: str
    candles: pd.DataFrame


class MarketDataService:
    def __init__(self) -> None:
        self.settings = get_settings()

    instruments = {
        "EURUSD": ("forex", 1.0872),
        "GBPUSD": ("forex", 1.2684),
        "USDJPY": ("forex", 155.48),
        "XAUUSD": ("gold", 2364.5),
        "BTCUSD": ("crypto", 67125.0),
        "NAS100": ("index", 18420.0),
    }

    def get_watchlist(self) -> list[str]:
        return list(self.instruments.keys())

    def _twelve_data_symbol(self, symbol: str) -> str:
        mapping = {
            "EURUSD": "EUR/USD",
            "GBPUSD": "GBP/USD",
            "USDJPY": "USD/JPY",
            "XAUUSD": "XAU/USD",
            "BTCUSD": "BTC/USD",
            "NAS100": "IXIC",
        }
        return mapping.get(symbol, symbol)

    def _external_quote(self, symbol: str) -> dict | None:
        if not self.settings.twelve_data_api_key:
            return None
        try:
            response = httpx.get(
                "https://api.twelvedata.com/quote",
                params={"symbol": self._twelve_data_symbol(symbol), "apikey": self.settings.twelve_data_api_key},
                timeout=5,
            )
            response.raise_for_status()
            payload = response.json()
            close = float(payload.get("close") or payload.get("price"))
            percent_change = float(payload.get("percent_change") or 0)
            return {
                "symbol": symbol,
                "asset_class": self.instruments.get(symbol, ("forex", 1.0))[0],
                "price": round(close, 5 if close < 20 else 2),
                "change_percent": round(percent_change, 2),
                "volatility": round(abs(percent_change), 2),
                "sentiment": "bullish" if percent_change >= 0 else "bearish",
            }
        except (httpx.HTTPError, TypeError, ValueError, KeyError):
            return None

    def generate_market_snapshot(self, symbol: str, timeframe: str = "M15", candles: int = 220) -> MarketSnapshot:
        asset_class, base_price = self.instruments.get(symbol, ("forex", 1.0))
        rng = np.random.default_rng(abs(hash(symbol)) % (2**32))
        timestamps = [datetime.now(timezone.utc) - timedelta(minutes=15 * (candles - i)) for i in range(candles)]
        price_path = []
        last = base_price

        for index in range(candles):
            drift = math.sin(index / 9) * base_price * 0.0008
            noise = rng.normal(0, base_price * (0.0015 if base_price > 50 else 0.0007))
            open_price = last
            close_price = max(0.0001, open_price + drift + noise)
            high = max(open_price, close_price) + abs(noise * 0.45)
            low = min(open_price, close_price) - abs(noise * 0.35)
            volume = int(abs(noise) * 100000) + random.randint(400, 1800)
            price_path.append([timestamps[index], open_price, high, low, close_price, volume])
            last = close_price

        df = pd.DataFrame(price_path, columns=["time", "open", "high", "low", "close", "volume"])
        df["ema_50"] = df["close"].ewm(span=50, adjust=False).mean()
        df["ema_200"] = df["close"].ewm(span=200, adjust=False).mean()
        delta = df["close"].diff()
        gain = delta.clip(lower=0).rolling(14).mean()
        loss = -delta.clip(upper=0).rolling(14).mean()
        rs = gain / loss.replace(0, np.nan)
        df["rsi"] = 100 - (100 / (1 + rs))
        ema_12 = df["close"].ewm(span=12, adjust=False).mean()
        ema_26 = df["close"].ewm(span=26, adjust=False).mean()
        df["macd"] = ema_12 - ema_26
        df["macd_signal"] = df["macd"].ewm(span=9, adjust=False).mean()
        df["atr"] = (df["high"] - df["low"]).rolling(14).mean().bfill()
        mid = df["close"].rolling(20).mean()
        std = df["close"].rolling(20).std().bfill()
        df["bb_upper"] = mid + (std * 2)
        df["bb_lower"] = mid - (std * 2)
        df["volatility"] = (df["atr"] / df["close"]).fillna(0)
        return MarketSnapshot(symbol=symbol, asset_class=asset_class, timeframe=timeframe, candles=df.bfill())

    def list_quotes(self, symbols: list[str]) -> list[dict]:
        quotes = []
        for symbol in symbols:
            external = self._external_quote(symbol)
            if external:
                quotes.append(external)
                continue
            snapshot = self.generate_market_snapshot(symbol, candles=60)
            latest = snapshot.candles.iloc[-1]
            previous = snapshot.candles.iloc[-2]
            change = ((latest["close"] - previous["close"]) / previous["close"]) * 100
            quotes.append(
                {
                    "symbol": symbol,
                    "asset_class": snapshot.asset_class,
                    "price": round(float(latest["close"]), 5 if latest["close"] < 20 else 2),
                    "change_percent": round(float(change), 2),
                    "volatility": round(float(latest["volatility"] * 100), 2),
                    "sentiment": "bullish" if latest["ema_50"] > latest["ema_200"] else "bearish",
                }
            )
        return quotes
