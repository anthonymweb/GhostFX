from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from redis import asyncio as redis_asyncio
from fastapi_limiter import FastAPILimiter

from app.api.routes import agent, auth, health, market, notifications, portfolios, signals, subscriptions, ws
from app.core.config import get_settings
from app.core.database import Base, engine
import app.models  # noqa: F401 - ensure SQLAlchemy metadata includes every model.


settings = get_settings()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    limiter_enabled = False
    if settings.enable_rate_limiter:
        try:
            redis = redis_asyncio.from_url(settings.redis_url, encoding="utf8", decode_responses=True)
            await FastAPILimiter.init(redis)
            limiter_enabled = True
        except Exception as exc:
            logger.warning("Rate limiter disabled because Redis is unavailable: %s", exc)
    yield
    if limiter_enabled:
        await FastAPILimiter.close()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(market.router, prefix=settings.api_prefix)
app.include_router(signals.router, prefix=settings.api_prefix)
app.include_router(agent.router, prefix=settings.api_prefix)
app.include_router(portfolios.router, prefix=settings.api_prefix)
app.include_router(notifications.router, prefix=settings.api_prefix)
app.include_router(subscriptions.router, prefix=settings.api_prefix)
app.include_router(ws.router)
