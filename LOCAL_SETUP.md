# Local Setup (No Docker Required)

This guide gets the app running locally in minutes.

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm

Optional:
- Redis (only if you plan to run background worker tasks)

## 1) Clone and configure env

```bash
git clone https://github.com/SpasibovDm/ai-automation-portal.git
cd ai-automation-portal
cp .env.example .env
```

## 2) Start backend (FastAPI)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend URLs:
- API: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`
- Status: `http://127.0.0.1:8000/status`

## 3) Start frontend (Vite)

Open a new terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend URL:
- `http://127.0.0.1:5173`

## 4) Verify core flow

1. Open `/` and confirm public landing is first page.
2. Click `Try demo` and verify demo UI works without login.
3. Click `Sign in` or `Get started free` to reach auth pages.
4. Sign in and confirm `/app/*` pages are protected.

## 5) Optional: run tests

From repo root:

```bash
pytest
```

## 6) Optional: run worker (Celery)

If you have Redis available:

```bash
celery -A app.tasks worker --loglevel=info
```

## Troubleshooting

- CORS error in browser:
  - Ensure frontend origin is in `ALLOWED_ORIGINS` in `.env`.
- Backend unreachable:
  - Confirm backend runs on `127.0.0.1:8000`.
- Login/API issues:
  - Check browser network calls and backend logs.
- AI chat fallback appears:
  - This is expected when AI provider is unavailable or not configured.
