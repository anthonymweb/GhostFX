import httpx

from app.core.config import get_settings


class TelegramService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def build_trade_message(self, signal) -> str:
        return (
            f"{self._icon(signal.action.value)} {signal.action.value} {signal.symbol}\n\n"
            f"Entry: {signal.entry_price}\n"
            f"SL: {signal.stop_loss}\n"
            f"TP: {signal.take_profit}\n\n"
            f"Confidence: {signal.confidence}%\n"
            f"Risk: {signal.risk_level.value}\n\n"
            f"Reason:\n- " + "\n- ".join(signal.reasoning[:4])
        )

    def build_do_not_trade_message(self, signal) -> str:
        return (
            "WARNING: DO NOT TRADE TODAY\n\n"
            f"Market: {signal.symbol}\n"
            f"Confidence: {signal.confidence}%\n"
            f"Risk: {signal.risk_level.value}\n\n"
            "Why:\n- " + "\n- ".join(signal.reasoning[:4])
        )

    async def send_message(self, chat_id: str, text: str) -> bool:
        if not self.settings.telegram_bot_token or not chat_id:
            return False
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.post(
                f"https://api.telegram.org/bot{self.settings.telegram_bot_token}/sendMessage",
                json={"chat_id": chat_id, "text": text, "disable_web_page_preview": True},
            )
        return response.status_code < 400

    async def send_signal_alert(self, signal, user) -> bool:
        if not getattr(user, "telegram_chat_id", None):
            return False
        message = (
            self.build_do_not_trade_message(signal)
            if signal.action.value == "DO_NOT_TRADE"
            else self.build_trade_message(signal)
        )
        try:
            return await self.send_message(user.telegram_chat_id, message)
        except httpx.HTTPError:
            return False

    def get_webapp_config(self) -> dict:
        return {
            "enabled": bool(self.settings.telegram_bot_token),
            "webapp_url": self.settings.telegram_webapp_url,
            "deep_link_hint": "Use Telegram Web App buttons to open GhostFX directly inside Telegram.",
        }

    @staticmethod
    def _icon(action: str) -> str:
        return action if action in {"BUY", "SELL"} else "WAIT"
