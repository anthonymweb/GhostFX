from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.agent import AgentSummaryResponse, ChatRequest, ChatResponse
from app.services.agent_service import AgentService
from app.services.telegram_service import TelegramService


router = APIRouter(prefix="/agent", tags=["agent"])
agent_service = AgentService()
telegram_service = TelegramService()


@router.get("/summary", response_model=AgentSummaryResponse)
async def summary(current_user: User = Depends(get_current_user)) -> AgentSummaryResponse:
    return agent_service.build_summary()


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, current_user: User = Depends(get_current_user)) -> ChatResponse:
    return agent_service.answer_question(payload.question)


@router.get("/telegram")
async def telegram_config(current_user: User = Depends(get_current_user)) -> dict:
    return telegram_service.get_webapp_config()
