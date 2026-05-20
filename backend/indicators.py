"""Technical indicator calculation utilities."""

import pandas as pd
from ta.momentum import RSIIndicator
from ta.trend import EMAIndicator, MACD


REQUIRED_COLUMNS = {"open", "high", "low", "close", "tick_volume"}


def add_indicators(candles: pd.DataFrame) -> pd.DataFrame:
    """Return candles with RSI, EMA 50, EMA 200, and MACD columns.

    The strategy needs enough candles for a 200-period EMA. If fewer candles
    are supplied, the output will contain NaN values until each indicator has
    enough history.
    """

    missing = REQUIRED_COLUMNS.difference(candles.columns)
    if missing:
        raise ValueError(f"Missing required candle columns: {sorted(missing)}")

    data = candles.copy()
    close = data["close"]

    data["rsi"] = RSIIndicator(close=close, window=14).rsi()
    data["ema_50"] = EMAIndicator(close=close, window=50).ema_indicator()
    data["ema_200"] = EMAIndicator(close=close, window=200).ema_indicator()

    macd = MACD(close=close, window_slow=26, window_fast=12, window_sign=9)
    data["macd"] = macd.macd()
    data["macd_signal"] = macd.macd_signal()
    data["macd_histogram"] = macd.macd_diff()

    return data
