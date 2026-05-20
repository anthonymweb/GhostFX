# GhostFX AI Agent

GhostFX AI Agent is a production-oriented AI forex intelligence SaaS. It gives users a protected paper-trading workspace, AI-generated market signals, live monitoring loops, Telegram alerts, and beginner risk guardrails.

This is decision-support software, not a profit guarantee or an unattended real-money execution engine.

## Architecture

```text
apps/
  frontend/     React, Vite, TypeScript, TailwindCSS, Zustand, React Query, Axios
  backend/      FastAPI, SQLAlchemy async, JWT auth, Redis-ready rate limiting

packages/
  shared-types/ Shared TypeScript contracts
  ui/           Reusable shadcn-style UI primitives

infrastructure/
  docker/       Dockerfiles and compose services
  nginx/        Local reverse proxy config
```

## What Works

- Register, login, logout, `/auth/me`, JWT access tokens, refresh-token rotation, and persisted frontend sessions.
- Protected dashboard routes with automatic session bootstrap and silent token refresh.
- CORS configured for local development, Render, and Vercel preview domains.
- Local SQLite by default, Supabase Postgres in production via `DATABASE_URL`.
- AI signal generation with risk-aware `BUY`, `SELL`, `WAIT`, and `DO_NOT_TRADE` behavior.
- Paper portfolios and paper trade creation.
- Market monitoring with Twelve Data quotes when configured and deterministic local fallback data.
- Hugging Face signal-summary enhancement when configured.
- Telegram chat-id connection, test alerts, and automatic signal alerts.
- Vercel frontend config, Render backend config, Docker Compose, health checks, CI, favicon, and environment examples.

## Local Development

Install frontend dependencies:

```bash
npm install
```

Create backend environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r apps/backend/requirements-local.txt
```

Create local env files:

```bash
cp .env.example .env
cp apps/frontend/.env.example apps/frontend/.env.local
```

Run the backend:

```bash
source .venv/bin/activate
npm run dev:backend
```

Run the frontend in another terminal:

```bash
npm run dev:frontend
```

Open:

```text
Frontend: http://localhost:5173
Backend health: http://127.0.0.1:8000/api/v1/health
```

The auth connection-refused error is fixed when the backend is running and `VITE_API_URL=http://127.0.0.1:8000/api/v1`.

## Docker

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Nginx gateway: `http://localhost`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

## Environment Variables

Backend `.env`:

```text
APP_NAME=GhostFX AI Agent
ENVIRONMENT=development
DEBUG=true
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CORS_ORIGIN_REGEX=https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+
DATABASE_URL=sqlite+aiosqlite:///./ghostfx.db
REDIS_URL=redis://localhost:6379/0
ENABLE_RATE_LIMITER=false
JWT_SECRET=change-me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=30
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_WEBAPP_URL=http://localhost:5173
TWELVE_DATA_API_KEY=
FINNHUB_API_KEY=
HUGGINGFACE_API_TOKEN=
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.3
RESEND_API_KEY=
RESEND_FROM_EMAIL=GhostFX <alerts@ghostfx.ai>
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

Frontend `.env.local`:

```text
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

The owner-facing key acquisition process is in [API_KEYS_README.md](API_KEYS_README.md).

## Deploy Backend To Render

1. Push this repo to GitHub.
2. In Render, create a Blueprint or Web Service from the repo.
3. Use `render.yaml` or these values:
   - Build: `pip install -r apps/backend/requirements.txt`
   - Start: `uvicorn app.main:app --app-dir apps/backend --host 0.0.0.0 --port $PORT`
   - Health check: `/api/v1/health`
4. Add `DATABASE_URL` from Supabase.
5. Add `CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173,http://127.0.0.1:5173`.
6. Add the API keys listed in [API_KEYS_README.md](API_KEYS_README.md).

## Deploy Frontend To Vercel

1. Import the GitHub repo into Vercel.
2. Vercel reads `vercel.json`.
3. Add `VITE_API_URL=https://your-render-service.onrender.com/api/v1`.
4. Deploy.

## Supabase Setup

1. Create a Supabase project.
2. Copy the pooled Postgres connection string.
3. Set it as `DATABASE_URL` in Render.
4. The app creates tables on startup for this deployment profile.

## Telegram Setup

1. Create a bot with `@BotFather`.
2. Set `TELEGRAM_BOT_TOKEN` in Render.
3. Set `TELEGRAM_WEBAPP_URL` to the Vercel URL.
4. Send any message to the bot.
5. Visit `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates`.
6. Copy `message.chat.id`.
7. Login to GhostFX and save that chat id in the Telegram agent panel.
8. Use "Send test alert" to verify delivery.

## GitHub Setup

```bash
git init
git add .
git commit -m "Productionize GhostFX AI Agent"
git branch -M main
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

## Key API Routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/health`
- `GET /api/v1/market/overview`
- `GET /api/v1/signals/latest`
- `GET /api/v1/signals/feed`
- `GET /api/v1/agent/summary`
- `POST /api/v1/agent/chat`
- `GET /api/v1/portfolios/me`
- `POST /api/v1/portfolios/{portfolio_id}/paper-trades`
- `POST /api/v1/notifications/telegram/connect`
- `POST /api/v1/notifications/telegram/test`
- `WS /ws/agent`

## Troubleshooting

- `ERR_CONNECTION_REFUSED`: start the backend with `npm run dev:backend` and confirm `VITE_API_URL`.
- CORS error: add the exact frontend origin to `CORS_ORIGINS` in Render.
- Login works then refresh signs out: check `JWT_SECRET` stability and `DATABASE_URL`.
- Supabase connection fails: use the pooled connection string and confirm SSL is enabled by Supabase.
- Telegram test returns `sent: false`: verify `TELEGRAM_BOT_TOKEN`, chat id, and that the user messaged the bot first.
- Vercel cannot reach API: set `VITE_API_URL` to the Render `/api/v1` URL and redeploy frontend.
