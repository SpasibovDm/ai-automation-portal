# Local Setup Guide

This guide runs the project locally without Docker.

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm

Optional for background jobs:
- Redis 6+

## 1) Backend setup

From repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Start API:

```bash
uvicorn app.main:app --reload
```

API endpoints:
- Base URL: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Swagger: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

## 2) Frontend setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend URL: [http://127.0.0.1:5173](http://127.0.0.1:5173)

## 3) Verify app flow

- Open `/` and confirm landing page is public.
- Use `Sign in` or `Get started free` from landing navigation.
- Open `/demo` to inspect interactive product preview.
- Sign in and confirm `/dashboard` resolves to the protected app shell.

## 4) Optional background workers (Celery)

If you want async task execution, run Redis and a worker.

```bash
celery -A app.core.celery_app worker --loglevel=info
```

If Redis is not running, keep UI/API development workflows and avoid queue-dependent paths.

## Common issues

- CORS errors:
  - Ensure frontend uses `http://127.0.0.1:5173` or `http://localhost:5173`.
  - Verify `ALLOWED_ORIGINS` in `.env`.
- DB connection errors:
  - Keep local default `DATABASE_URL=sqlite:///./app.db`.
- Missing frontend API URL:
  - Check `frontend/.env` has `VITE_API_URL=http://127.0.0.1:8000`.
