# Architecture Overview

## 1. System Summary

AI Automation Portal is a monorepo SaaS application with a clear frontend/backend split.

```text
Browser (React SPA)
    |
    v
FastAPI API (routes -> services -> models/schemas)
    |
    v
SQLite (local) / PostgreSQL (production)
    |
    v
Redis + Celery (optional async/background)
```

## 2. Repository Structure

- `app/` FastAPI backend
- `frontend/` React + Tailwind frontend
- `docs/` project docs and assets
- `scripts/` runtime helper scripts
- `tests/` backend tests

## 3. Frontend Architecture

### Routing model

- Public pages:
  - `/` marketing landing
  - `/demo` product demo with mock data
  - `/login`
  - `/register`
- Auth-only pages:
  - `/app/*` (dashboard, inbox, leads, templates, analytics, settings, trust pages)
- Route aliases (`/dashboard`, `/inbox`, etc.) redirect into protected `/app/*` routes.

### Frontend layers

- `frontend/src/pages/` route-level screens
- `frontend/src/components/` reusable UI modules
- `frontend/src/context/` global app state (auth/theme/workspace)
- `frontend/src/hooks/` UI behavior hooks
- `frontend/src/services/` API and chat clients
- `frontend/src/data/` mock/demo datasets
- `frontend/src/utils/` shared utility functions

### UX principles implemented

- Public-first SaaS entry with clear value proposition
- Demo-first onboarding path with no registration friction
- Loading states (skeletons), empty states, and human-readable error messages
- Role-aware and workspace-aware rendering
- Persistent theme toggle (light/dark)

## 4. Backend Architecture

### Backend layers

- `app/routes/`: HTTP layer, request validation, response models
- `app/services/`: business logic and orchestration
- `app/models/`: SQLAlchemy ORM models
- `app/schemas/`: Pydantic request/response contracts
- `app/core/`: settings, DB session, middleware, security, logging

### Runtime concerns

- Config from environment using `pydantic-settings`
- CORS origin parsing supports comma, semicolon, newline, and JSON list formats
- Request middleware emits request ID and structured logs
- Validation errors returned in a UI-friendly structure
- Health endpoints:
  - `/health`
  - `/status`

### API stability

- Existing routes remain compatible.
- Chat API now supports both:
  - `/api/chat/*` (legacy)
  - `/chat/*` (clean alias)

## 5. Data and State

### Backend persistence

- Local default: SQLite (`app.db`)
- Production target: PostgreSQL
- Async optional: Redis-backed Celery workers

### Frontend state

- Auth state: token/session in local storage
- Workspace state: active workspace, role permissions, UI modes
- Consent state: AI-assistance and automation toggles

## 6. Deployment View

- API container: FastAPI + Alembic migrations on startup (configurable)
- Frontend container: static Vite build served by Nginx
- Compose stacks:
  - `docker-compose.yml` for local containerized run
  - `docker-compose.prod.yml` for production baseline
- External reverse proxy (Nginx) is supported for VPS deployments

## 7. Quality and Trust Surfaces

- Privacy Center
- Audit logs (read-only visual)
- System status view
- Explainable AI rationale blocks
- Role/permission-aware UI controls
