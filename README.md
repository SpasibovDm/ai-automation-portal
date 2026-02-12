# AI Automation Portal

AI Automation Portal is a premium-style B2B SaaS demo for inbox automation, lead management, and AI-assisted replies.

## Why this project

This repository is designed to feel like a production SaaS product, not a developer prototype.

- Public marketing landing page at `/` (no login wall)
- Frictionless demo mode at `/demo` (no signup required)
- Authenticated workspace with protected routes under `/app/*`
- AI chat widget on the landing page for product discovery
- Role-aware dashboard surfaces for Sales, Support, and Founder workflows

## Core capabilities

- Inbox automation previews with explainable AI decisions
- Lead scoring and prioritization workflows
- AI reply suggestions with confidence indicators
- Analytics blocks focused on business outcomes
- Privacy, audit, and system status views for trust

## Demo mode

The demo is intentionally frontend-only and safe:

- Mock inbox, leads, and analytics data
- No real data saving
- No settings persistence
- No external integrations

Open `/demo` and click `Try demo` from the landing page.

## Routes

### Public

- `/` landing page
- `/demo` demo mode
- `/login` sign in
- `/register` get started free

### Protected

- `/dashboard` (alias to authenticated dashboard)
- `/inbox` (alias)
- `/ai-templates` (alias)
- `/app/*` full workspace

Unauthenticated users are redirected to `/login` for protected routes.

## Local setup (no Docker)

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

## Documentation

- `ARCHITECTURE.md`
- `LOCAL_SETUP.md`
- `docs/ARCHITECTURE.md`
- `docs/LOCAL_SETUP.md`

## Notes

- No payment flows are included.
- API contracts remain unchanged.
- Docker files remain optional for teams that prefer containerized workflows.
