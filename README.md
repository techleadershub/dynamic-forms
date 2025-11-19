# SmartForms

**Intelligent Forms That Adapt in Real-Time**

SmartForms is an intelligent discovery platform that creates dynamic, adaptive forms. Unlike static forms, it asks intelligent follow-up questions, adapts to responses in real-time, and discovers insights through contextual conversations.

**Powered by AI to make every question count. Adapts in real-time, asks smart follow-ups, and uncovers insights static forms miss.**

Backend is powered by FastAPI and OpenAI (GPT-4o-mini). Frontend is a Next.js chat UI with an admin view to review captured sessions.

## Project Layout

```
backend/        # FastAPI app, AI service, session storage helpers
frontend/       # Next.js 14 app with chat + admin pages
data/sessions/  # JSON transcripts (auto-created)
config.json     # Survey purpose + AI settings
```

## Prerequisites

- Python 3.11+
- `uv` package manager (`pip install uv`)
- Node.js 18+
- OpenAI API key (GPT-4o-mini access)

Copy `.env.example` to `.env` (root) for the backend and `frontend/.env.example` to `frontend/.env.local` for the frontend, then fill in secrets/base URLs:

```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
USE_FAKE_AI=0         # set to 1 to bypass OpenAI with deterministic prompts (useful for tests)
```

## Backend Setup

```bash
cd backend
uv sync
uv run uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

Configuration lives in `config.json`. Edit the survey purpose, context, and question limits there.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` for the chat interface and `http://localhost:3000/admin` for session review.

## Testing

| Layer     | Command | Notes |
|-----------|---------|-------|
| Backend   | `cd backend && uv run pytest` | Mocks OpenAI; covers session storage + API flow |
| Frontend  | `cd frontend && npm test` | Jest + RTL, MSW-mocked API client |
| E2E (UI)  | `cd frontend && npm run test:e2e` | Requires backend + frontend running; see below |

### Running Playwright E2E tests

1. Start the backend in fake-AI mode (no OpenAI key needed):
   ```bash
   uv sync
   USE_FAKE_AI=1 uv run uvicorn backend.app:app --port 8000
   ```
2. Start the frontend (in another shell):
   ```bash
   cd frontend
   npm run dev
   ```
3. Install browsers once: `npx playwright install`
4. Execute tests: `npm run test:e2e`

Each run walks through the chat flow (radio → checkbox → free text), verifies the thank-you message, then checks that `/admin` lists the captured session.

## Data

Each survey session is stored as `data/sessions/{session_id}.json`. This acts as both the short-term chat memory and the audit log for admins.

## Deployment to Railway

This project is configured for deployment on [Railway](https://railway.app). 

**📖 For detailed step-by-step instructions, see [RAILWAY_DEPLOYMENT_STEPS.md](./RAILWAY_DEPLOYMENT_STEPS.md)**

For technical reference, see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md).

**Quick Start:**
1. Deploy backend service from `backend/` directory
2. Deploy frontend service from `frontend/` directory
3. Set environment variables (see deployment guide)
4. Connect frontend to backend URL

The project includes:
- `backend/Procfile` and `backend/railway.json` for backend deployment
- `frontend/railway.json` for frontend deployment
- Automatic PORT detection (Railway sets `$PORT`)

