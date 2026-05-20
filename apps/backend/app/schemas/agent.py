from pydantic import BaseModel


class AgentSummaryResponse(BaseModel):
    status: str
    protection_mode: str
    market_posture: str
    guidance: str
    alerts: list[str]
    strongest_markets: list[str]
    avoid_markets: list[str]


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    follow_up: list[str]
