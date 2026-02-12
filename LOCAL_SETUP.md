# Local Setup Guide

Canonical local setup documentation lives in:
- `docs/LOCAL_SETUP.md`

## Quick run (no Docker)

### Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open:
- Frontend: `http://127.0.0.1:5173`
- API docs: `http://127.0.0.1:8000/docs`

For troubleshooting and optional Celery setup, see `docs/LOCAL_SETUP.md`.
