from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.signal import RiskLevel, Signal, SignalAction
from app.models.user import User
from app.schemas.agent import AgentSummaryResponse, ChatResponse
from app.services.ai_engine import AIEngine
from app.services.market_data import MarketDataService
from app.services.risk_engine import RiskEngine
from app.services.telegram_service import TelegramService


class AgentService:
    def __init__(self) -> None:
        self.market_service = MarketDataService()
        self.ai_engine = AIEngine()
        self.risk_engine = RiskEngine()
        self.telegram_service = TelegramService()

    async def generate_signal(self, db: AsyncSession, user: User | None, symbol: str, timeframe: str) -> Signal:
        snapshot = self.market_service.generate_market_snapshot(symbol=symbol, timeframe=timeframe)
        decision = self.ai_engine.evaluate_snapshot(snapshot)
        mode = user.experience_mode.value if user else "beginner"
        risk = self.risk_engine.assess(confidence=decision.confidence, risk_level=decision.risk_level, mode=mode)

        summary = decision.agent_summary
        if risk.warnings:
            summary += " " + " ".join(risk.warnings)

        signal = Signal(
            user_id=user.id if user else None,
            symbol=snapshot.symbol,
            asset_class=snapshot.asset_class,
            timeframe=timeframe,
            action=SignalAction(decision.action),
            confidence=decision.confidence,
            risk_level=RiskLevel(decision.risk_level),
            entry_price=decision.entry_price,
            stop_loss=decision.stop_loss,
            take_profit=decision.take_profit,
            reasoning=decision.reasoning + risk.warnings,
            indicators=decision.indicators,
            market_context=decision.market_context | {"risk_approved": risk.approved, "position_size": risk.suggested_size_percent},
            agent_summary=summary,
        )
        db.add(signal)
        await db.commit()
        await db.refresh(signal)
        if user:
            await self.telegram_service.send_signal_alert(signal, user)
        return signal

    async def feed(self, db: AsyncSession, limit: int = 20) -> list[Signal]:
        result = await db.execute(select(Signal).order_by(Signal.created_at.desc()).limit(limit))
        return list(result.scalars().all())

    def build_summary(self) -> AgentSummaryResponse:
        quotes = self.market_service.list_quotes(self.market_service.get_watchlist())
        strongest = [quote["symbol"] for quote in sorted(quotes, key=lambda item: item["change_percent"], reverse=True)[:3]]
        weakest = [quote["symbol"] for quote in sorted(quotes, key=lambda item: item["change_percent"])[:2]]
        return AgentSummaryResponse(
            status="monitoring",
            protection_mode="active",
            market_posture="selective",
            guidance="The AI is scanning for clean opportunities and filtering weak conditions before recommending action.",
            alerts=[
                "Avoid trading during choppy conditions unless confluence improves.",
                "Respect stop losses and keep risk per trade small.",
            ],
            strongest_markets=strongest,
            avoid_markets=weakest,
        )

    def answer_question(self, question: str) -> ChatResponse:
        lower = question.lower()
        if "risky" in lower or "avoid" in lower:
            answer = "Risk is elevated whenever volatility expands faster than trend quality. Today, the safest approach is to wait for clean alignment before acting."
        elif "strongest" in lower:
            answer = "The strongest markets are the ones showing the clearest EMA trend alignment with controlled volatility. Check the market overview for the current leaders."
        elif "why" in lower:
            answer = "Signals are only recommended when trend, momentum, and volatility conditions align well enough to justify a defined stop loss and take profit."
        else:
            answer = "The agent focuses on protecting capital first, then highlighting high-quality opportunities with clear explanations and risk controls."
        return ChatResponse(
            answer=answer,
            follow_up=[
                "Should I avoid trading right now?",
                "Which markets are strongest today?",
                "Why did the AI reject this setup?",
            ],
        )
