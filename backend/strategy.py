"""Rule-based forex signal strategy.

The rules are intentionally transparent for beginner education:
- BUY when RSI is oversold, trend is bullish, and MACD crosses upward.
- SELL when RSI is overbought, trend is bearish, and MACD crosses downward.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Literal

import pandas as pd


SignalAction = Literal["BUY", "SELL", "HOLD"]


@dataclass(frozen=True)
class Signal:
    symbol: str
    action: SignalAction
    confidence: int
    reason: list[str]
    price: float
    timestamp: datetime
    rsi: float
    ema_50: float
    ema_200: float
    macd: float
    macd_signal: float

    def to_dict(self) -> dict:
        return {
            "symbol": self.symbol,
            "action": self.action,
            "confidence": self.confidence,
            "reason": self.reason,
            "price": self.price,
            "timestamp": self.timestamp.isoformat(),
            "indicators": {
                "rsi": round(self.rsi, 4),
                "ema_50": round(self.ema_50, 5),
                "ema_200": round(self.ema_200, 5),
                "macd": round(self.macd, 6),
                "macd_signal": round(self.macd_signal, 6),
            },
        }


def _is_bullish_macd_crossover(previous: pd.Series, latest: pd.Series) -> bool:
    return previous["macd"] <= previous["macd_signal"] and latest["macd"] > latest["macd_signal"]


def _is_bearish_macd_crossover(previous: pd.Series, latest: pd.Series) -> bool:
    return previous["macd"] >= previous["macd_signal"] and latest["macd"] < latest["macd_signal"]


def _score_conditions(conditions: list[tuple[bool, str]]) -> tuple[int, list[str]]:
    matched = [label for passed, label in conditions if passed]
    confidence = round((len(matched) / len(conditions)) * 100)
    return confidence, matched


def generate_signal(candles: pd.DataFrame, symbol: str) -> Signal:
    """Generate the latest trading signal from indicator-enhanced candles."""

    if len(candles) < 2:
        raise ValueError("At least two candles are required to detect MACD crossovers.")

    clean = candles.dropna(subset=["rsi", "ema_50", "ema_200", "macd", "macd_signal"])
    if len(clean) < 2:
        raise ValueError("Not enough indicator-ready candles. Fetch more historical candles.")

    previous = clean.iloc[-2]
    latest = clean.iloc[-1]

    buy_conditions = [
        (latest["rsi"] < 30, "RSI below 30"),
        (latest["ema_50"] > latest["ema_200"], "EMA50 above EMA200"),
        (_is_bullish_macd_crossover(previous, latest), "MACD bullish crossover"),
    ]
    sell_conditions = [
        (latest["rsi"] > 70, "RSI above 70"),
        (latest["ema_50"] < latest["ema_200"], "EMA50 below EMA200"),
        (_is_bearish_macd_crossover(previous, latest), "MACD bearish crossover"),
    ]

    buy_confidence, buy_reasons = _score_conditions(buy_conditions)
    sell_confidence, sell_reasons = _score_conditions(sell_conditions)

    if buy_confidence == 100:
        action: SignalAction = "BUY"
        confidence = buy_confidence
        reasons = buy_reasons
    elif sell_confidence == 100:
        action = "SELL"
        confidence = sell_confidence
        reasons = sell_reasons
    elif buy_confidence > sell_confidence:
        action = "HOLD"
        confidence = buy_confidence
        reasons = [f"Partial BUY setup: {reason}" for reason in buy_reasons]
    elif sell_confidence > buy_confidence:
        action = "HOLD"
        confidence = sell_confidence
        reasons = [f"Partial SELL setup: {reason}" for reason in sell_reasons]
    else:
        action = "HOLD"
        confidence = max(buy_confidence, sell_confidence)
        reasons = ["No clear strategy agreement"]

    timestamp = latest.name.to_pydatetime() if hasattr(latest.name, "to_pydatetime") else datetime.utcnow()

    return Signal(
        symbol=symbol,
        action=action,
        confidence=confidence,
        reason=reasons,
        price=float(latest["close"]),
        timestamp=timestamp,
        rsi=float(latest["rsi"]),
        ema_50=float(latest["ema_50"]),
        ema_200=float(latest["ema_200"]),
        macd=float(latest["macd"]),
        macd_signal=float(latest["macd_signal"]),
    )
