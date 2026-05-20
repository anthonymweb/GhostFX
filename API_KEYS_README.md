# GhostFX Required API Keys

This file tells the owner exactly which accounts and secrets are needed for the production GhostFX AI Agent deployment.

## Required For Production

### Supabase Postgres

1. Create a Supabase project.
2. Open Project Settings, then Database.
3. Copy the pooled Postgres connection string.
4. Set `DATABASE_URL` in Render to that value. GhostFX automatically converts `postgresql://` URLs to the async driver format used by FastAPI.

### Telegram Bot API

1. Open Telegram and message `@BotFather`.
2. Run `/newbot`.
3. Choose the bot display name and username.
4. Copy the bot token into `TELEGRAM_BOT_TOKEN` on Render.
5. Set `TELEGRAM_WEBAPP_URL` to the Vercel frontend URL.
6. After login, save the user Telegram chat id from the dashboard Telegram panel.

To find a chat id, send a message to the bot, then open:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates
```

Copy `message.chat.id`.

### Twelve Data

1. Create a Twelve Data account.
2. Open API Keys in the dashboard.
3. Copy the key into `TWELVE_DATA_API_KEY` on Render.

GhostFX uses Twelve Data quotes when the key is present and falls back to deterministic synthetic market data for local development.

### Hugging Face Inference API

1. Create a Hugging Face account.
2. Open Settings, then Access Tokens.
3. Create a read token.
4. Set `HUGGINGFACE_API_TOKEN` on Render.
5. Keep `HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.3` or replace it with another text-generation model available to your account.

### Finnhub

1. Create a Finnhub account.
2. Copy the dashboard API token.
3. Set `FINNHUB_API_KEY` on Render.

The key is reserved for news and event-risk expansion. The app boots without it.

### Stripe

1. Create a Stripe account.
2. In Developers, copy the secret key into `STRIPE_SECRET_KEY`.
3. Copy the publishable key into `STRIPE_PUBLISHABLE_KEY`.
4. Create a webhook endpoint pointing to the Render backend when billing webhooks are enabled.
5. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

### Resend

1. Create a Resend account.
2. Verify the sending domain.
3. Create an API key.
4. Set `RESEND_API_KEY`.
5. Set `RESEND_FROM_EMAIL` to a verified sender, for example `GhostFX <alerts@yourdomain.com>`.

## Required Platform Variables

Render backend:

```text
DATABASE_URL=
JWT_SECRET=
CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173,http://127.0.0.1:5173
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBAPP_URL=https://your-vercel-app.vercel.app
TWELVE_DATA_API_KEY=
HUGGINGFACE_API_TOKEN=
FINNHUB_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
```

Vercel frontend:

```text
VITE_API_URL=https://your-render-service.onrender.com/api/v1
```

Local frontend:

```text
VITE_API_URL=http://127.0.0.1:8000/api/v1
```
