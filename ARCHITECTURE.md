# Architecture Overview

Canonical architecture documentation lives in:
- `docs/ARCHITECTURE.md`

## Fast summary

- Frontend: React + Vite + Tailwind in `frontend/`
- Backend: FastAPI + SQLAlchemy in `app/`
- Public SaaS entry: `/`
- Protected app shell: `/app/*` (also `/dashboard`, `/inbox`, `/ai-templates` aliases)
- Local DB default: SQLite (`app.db`)
- Optional async runtime: Redis + Celery

For the full component map, layering details, and design rationale, use `docs/ARCHITECTURE.md`.
