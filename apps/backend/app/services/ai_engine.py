from __future__ import annotations

from dataclasses import dataclass

import httpx
import numpy as np

from app.core.config import get_settings
from app.services.market_data import MarketSnapshot


@dataclass
class DecisionPayload:
    action: str
    confidence: int
    risk_level: str
    entry_price: float
    stop_loss: float
    take_profit: float
    reasoning: list[str]
    indicators: dict
    market_context: dict
    agent_summary: str


class AIEngine:
    def __init__(self) -> None:
        self.settings = get_settings()

    def evaluate_snapshot(self, snapshot: MarketSnapshot) -> DecisionPayload:
        latest = snapshot.candles.iloc[-1]
        previous = snapshot.candles.iloc[-2]
        reasons: list[str] = []
        score = 0

        bullish = latest["ema_50"] > latest["ema_200"]
        bearish = latest["ema_50"] < latest["ema_200"]
        stable_volatility = latest["volatility"] < 0.012
        rsi = float(latest["rsi"])
        macd_cross_up = previous["macd"] <= previous["macd_signal"] and latest["macd"] > latest["macd_signal"]
        macd_cross_down = previous["macd"] >= previous["macd_signal"] and latest["macd"] < latest["macd_signal"]

        if bullish:
            score += 25
            reasons.append("EMA 50 remains above EMA 200, showing higher timeframe bullish alignment.")
        if bearish:
            score += 25
            reasons.append("EMA 50 remains below EMA 200, showing higher timeframe bearish alignment.")
        if 35 <= rsi <= 65:
            score += 20
            reasons.append("RSI is balanced enough to avoid overstretched entries.")
        elif rsi < 30:
            score += 15
            reasons.append("RSI shows oversold recovery potential.")
        elif rsi > 70:
            score += 15
            reasons.append("RSI shows overbought exhaustion risk.")
        if stable_volatility:
            score += 20
            reasons.append("ATR-based volatility is stable enough for structured risk placement.")
        else:
            reasons.append("Volatility is elevated, which reduces position quality.")
        if macd_cross_up or macd_cross_down:
            score += 20
            reasons.append("MACD crossover confirms directional momentum.")

        action = "WAIT"
        if bullish and macd_cross_up and rsi < 68 and stable_volatility:
            action = "BUY"
        elif bearish and macd_cross_down and rsi > 32 and stable_volatility:
            action = "SELL"
        elif not stable_volatility or (45 <= rsi <= 55 and not (macd_cross_up or macd_cross_down)):
            action = "DO_NOT_TRADE"

        confidence = int(max(5, min(97, score + (5 if action in {"BUY", "SELL"} else -5))))
        atr = float(latest["atr"])
        entry = float(latest["close"])
        direction = 1 if action == "BUY" else -1
        stop_loss = entry - atr * 1.5 * direction
        take_profit = entry + atr * 2.5 * direction
        risk_level = "LOW" if stable_volatility and confidence >= 75 else "MEDIUM" if confidence >= 55 else "HIGH"

        if action == "DO_NOT_TRADE":
            reasons = [
                "Conditions are weak or noisy today.",
                "The setup lacks enough alignment between trend, momentum, and controlled volatility.",
                "Staying out protects the account from low-quality trades.",
            ]
        elif action == "WAIT":
            reasons.append("The market is not dangerous, but the setup is incomplete. Patience is preferred.")

        context = {
            "volatility": round(float(latest["volatility"] * 100), 2),
            "trend_strength": round(float(abs(latest["ema_50"] - latest["ema_200"])), 5),
            "liquidity_state": "healthy",
            "regime": "trend" if abs(latest["ema_50"] - latest["ema_200"]) > np.std(snapshot.candles["close"]) * 0.05 else "range",
        }
        summary = self._enhance_summary(
            fallback=self._summarize(action, confidence, risk_level),
            action=action,
            confidence=confidence,
            risk_level=risk_level,
            symbol=snapshot.symbol,
            reasons=reasons,
        )
        return DecisionPayload(
            action=action,
            confidence=confidence,
            risk_level=risk_level,
            entry_price=round(entry, 5 if entry < 20 else 2),
            stop_loss=round(stop_loss, 5 if entry < 20 else 2),
            take_profit=round(take_profit, 5 if entry < 20 else 2),
            reasoning=reasons,
            indicators={
                "rsi": round(rsi, 2),
                "ema_50": round(float(latest["ema_50"]), 5),
                "ema_200": round(float(latest["ema_200"]), 5),
                "macd": round(float(latest["macd"]), 6),
                "macd_signal": round(float(latest["macd_signal"]), 6),
                "atr": round(atr, 5),
                "bb_upper": round(float(latest["bb_upper"]), 5),
                "bb_lower": round(float(latest["bb_lower"]), 5),
            },
            market_context=context,
            agent_summary=summary,
        )

    def _summarize(self, action: str, confidence: int, risk_level: str) -> str:
        if action == "DO_NOT_TRADE":
            return "Conditions are weak today. Avoid trading and preserve capital."
        if action == "WAIT":
            return "The market is being monitored, but there is not enough confluence to justify action yet."
        return (
            f"{action} setup detected with {confidence}% confidence. "
            f"Risk is currently assessed as {risk_level.lower()} if position sizing stays disciplined."
        )

    def _enhance_summary(
        self,
        *,
        fallback: str,
        action: str,
        confidence: int,
        risk_level: str,
        symbol: str,
        reasons: list[str],
    ) -> str:
        if not self.settings.huggingface_api_token:
            return fallback

        prompt = (
            "You are GhostFX, a protective forex trading co-pilot. "
            "Write one concise user-facing signal explanation. Avoid profit promises. "
            f"Symbol: {symbol}. Action: {action}. Confidence: {confidence}. Risk: {risk_level}. "
            f"Reasons: {' | '.join(reasons[:4])}"
        )
        try:
            response = httpx.post(
                f"https://api-inference.huggingface.co/models/{self.settings.huggingface_model}",
                headers={"Authorization": f"Bearer {self.settings.huggingface_api_token}"},
                json={"inputs": prompt, "parameters": {"max_new_tokens": 80, "temperature": 0.35}},
                timeout=8,
            )
            response.raise_for_status()
            payload = response.json()
            text = ""
            if isinstance(payload, list) and payload:
                text = str(payload[0].get("generated_text", ""))
            elif isinstance(payload, dict):
                text = str(payload.get("generated_text", ""))
            cleaned = text.replace(prompt, "").strip()
            return cleaned[:420] if cleaned else fallback
        except (httpx.HTTPError, KeyError, TypeError, ValueError):
            return fallback
