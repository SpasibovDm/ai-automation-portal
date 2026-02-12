# Architecture Overview

## Goal

AI Automation Portal is structured as a production-style SaaS monorepo with a clear split between API and UI concerns.

## High-level system

```text
Browser (React + Vite + Tailwind)
        |
        v
FastAPI API (routes -> services -> models/schemas)
        |
        v
SQLite (local) / PostgreSQL (production)
        |
        v
Redis + Celery (optional async jobs)
```

## Backend (`/app`)

### Layering

- `app/routes`: HTTP API endpoints and request/response orchestration
- `app/services`: business logic (lead scoring, AI replies, integrations)
- `app/models`: SQLAlchemy ORM models
- `app/schemas`: Pydantic schemas for contracts
- `app/core`: configuration, DB session, security, middleware, logging

### Runtime behavior

- FastAPI app initializes middleware (CORS, rate limiting, validation formatting).
- SQLite tables are auto-created in local mode when using a SQLite `DATABASE_URL`.
- Optional async flows use Celery with Redis for background tasks.

### API contracts

The repository keeps existing API endpoints stable while improving internals (settings, CORS handling, docs).

## Frontend (`/frontend`)

### Composition

- `src/pages`: route-level views (Landing, Dashboard, Leads, Settings, Privacy, etc.)
- `src/components`: reusable UI building blocks and feature widgets
- `src/context`: app-wide state providers (auth, theme, workspace)
- `src/services`: API client helpers
- `src/data`: mock/demo datasets used by interactive previews

### UX model

- Public-first SaaS entry at `/`
- Auth routes are explicit (`/login`, `/register`) and linked from landing CTAs
- Protected workspace lives under `/app/*`
- Convenience aliases route to protected views (`/dashboard`, `/inbox`, `/ai-templates`)
- Demo mode and role-aware UI flows are frontend-driven with mockable state

## Cross-cutting concerns

- Explainability: AI decisions are surfaced with confidence and rationale in UI.
- Governance: privacy center, audit log, and system-status views improve trust.
- Multi-workspace readiness: workspace context and role-driven rendering exist in frontend state.

## Repository quality expectations

- One root Git repository only
- No checked-in virtual environments or machine artifacts
- Readable modular code over monolithic files
- Docs in `/docs` aligned with local developer onboarding
