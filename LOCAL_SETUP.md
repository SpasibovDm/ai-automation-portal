# Local Setup

Run the project locally in a few minutes without Docker.

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm

Optional:

- Redis (for Celery/background jobs)

## 1) Start backend

From repo root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend endpoints:

- API: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

## 2) Start frontend

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend:

- `http://127.0.0.1:5173`

## 3) Verify product flow

1. Open `/` and confirm public landing loads first.
2. Click `Try demo` and verify interactive mock data.
3. Click `Sign in` or `Get started free` for auth routes.
4. Sign in and verify protected routes (`/dashboard`, `/inbox`, `/ai-templates`) require auth.

## 4) Optional worker

If using async tasks:

```bash
celery -A app.core.celery_app worker --loglevel=info
```

## Troubleshooting

- CORS issues:
  - Ensure frontend origin is in `ALLOWED_ORIGINS`.
  - Defaults include `http://127.0.0.1:5173` and `http://localhost:5173`.
- DB issues:
  - Use local default `DATABASE_URL=sqlite:///./app.db`.
- Chat API issues:
  - Landing widget shows fallback guidance when backend is unavailable.
