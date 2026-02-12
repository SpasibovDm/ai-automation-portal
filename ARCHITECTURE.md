# Architecture Overview

## Stack

- Frontend: React + Vite + Tailwind (`frontend/`)
- Backend: FastAPI + SQLAlchemy (`app/`)
- Optional async: Redis + Celery
- Local DB default: SQLite (`app.db`)

## Product surfaces

- Public landing (`/`) with SaaS storytelling and CTA flow
- Public demo (`/demo`) with mock operational data
- Auth flow (`/login`, `/register`)
- Protected app shell (`/app/*`) plus aliases (`/dashboard`, `/inbox`, `/ai-templates`)

## Frontend architecture

- `frontend/src/pages`: route-level views (Landing, Demo, Dashboard, Leads, etc.)
- `frontend/src/components`: reusable UI primitives and feature modules
- `frontend/src/context`: auth, theme, workspace state
- `frontend/src/services`: API adapters
- `frontend/src/data`: mock/demo datasets

### UX patterns

- Public-first entry (no auth required to understand value)
- Protected routes for operational workspace
- Role-aware rendering for Sales, Support, Founder
- Skeletons, empty states, badges, and toast feedback for SaaS-grade UX
- Persisted dark/light theme

## Backend architecture

- `app/routes`: API endpoints and request handling
- `app/services`: domain logic
- `app/models`: SQLAlchemy models
- `app/schemas`: API payload models
- `app/core`: config, database, security, middleware, logging

### Config and runtime

- Environment-driven settings via `pydantic-settings`
- Robust `ALLOWED_ORIGINS` parsing for local CORS safety
- No API contract changes introduced by frontend/product polish

## Trust and demo strategy

- Demo mode is frontend-only and does not write business data
- AI chat widget is available on landing with graceful fallback messaging
- Privacy, audit, and status pages are included in app shell for enterprise trust narrative
