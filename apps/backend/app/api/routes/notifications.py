from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.telegram_service import TelegramService


router = APIRouter(prefix="/notifications", tags=["notifications"])
telegram_service = TelegramService()


class TelegramConnectRequest(BaseModel):
    chat_id: str


@router.get("/channels")
async def channels(current_user: User = Depends(get_current_user)) -> dict:
    return {
        "web": True,
        "telegram": telegram_service.get_webapp_config() | {"connected": bool(current_user.telegram_chat_id)},
        "email": {"enabled": True},
    }


@router.post("/telegram/connect")
async def connect_telegram(
    payload: TelegramConnectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    current_user.telegram_chat_id = payload.chat_id.strip()
    await db.commit()
    return {"status": "connected", "telegram_connected": True}


@router.post("/telegram/test")
async def test_telegram(current_user: User = Depends(get_current_user)) -> dict:
    sent = await telegram_service.send_message(
        current_user.telegram_chat_id or "",
        "GhostFX Telegram alerts are connected. The agent will send protective signal updates here.",
    )
    return {"sent": sent}


@router.post("/telegram/webhook")
async def telegram_webhook(payload: dict) -> dict:
    return {"status": "received", "update_type": list(payload.keys())}
