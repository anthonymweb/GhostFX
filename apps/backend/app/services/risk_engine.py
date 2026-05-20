from __future__ import annotations

from dataclasses import dataclass


@dataclass
class RiskAssessment:
    approved: bool
    warnings: list[str]
    suggested_size_percent: float


class RiskEngine:
    def assess(self, *, confidence: int, risk_level: str, mode: str, daily_drawdown: float = 0.0) -> RiskAssessment:
        warnings: list[str] = []
        suggested_size_percent = 0.01

        if mode == "beginner":
            suggested_size_percent = 0.005
        elif mode == "advanced":
            suggested_size_percent = 0.015

        if confidence < 55:
            warnings.append("Confidence is below the preferred threshold.")
        if risk_level == "HIGH":
            warnings.append("Volatility or setup quality makes this trade unsafe for most users.")
        if daily_drawdown < -2.5:
            warnings.append("Daily loss limit is close. A cooldown is recommended.")

        approved = not warnings or (len(warnings) == 1 and confidence >= 70 and risk_level != "HIGH")
        return RiskAssessment(approved=approved, warnings=warnings, suggested_size_percent=suggested_size_percent)
