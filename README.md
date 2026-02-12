# AI Automation Portal

AI Automation Portal is a demo-ready SaaS workspace for AI-assisted inbox operations, lead qualification, and explainable automation.

It is built as a full-stack project:
- Backend: FastAPI + SQLAlchemy
- Frontend: React + Vite + Tailwind CSS
- Local-first workflow with no Docker requirement

## What this project demonstrates

- Public SaaS landing page as the default entry (`/`)
- Interactive product preview with role-aware demo data
- Explainable AI UX (confidence, reasons, and action visibility)
- Workspace, role, privacy, audit, and system status surfaces
- Clean backend API structure with predictable local setup

## Repository structure

```text
/app        FastAPI backend (routes, services, models, schemas)
/frontend   React + Tailwind frontend (pages, components, context)
/docs       Architecture and local setup documentation
/scripts    Helper scripts for local/prod startup
```

## Screenshots

![Dashboard](docs/screenshots/dashboard.svg)
![Inbox](docs/screenshots/inbox.svg)

## Quick start (no Docker)

### 1) Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend runs at [http://127.0.0.1:8000](http://127.0.0.1:8000).
Open API docs at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at [http://127.0.0.1:5173](http://127.0.0.1:5173).

## App entry points

- `/` public landing page (no login wall)
- `/demo` interactive demo preview
- `/login` sign-in page
- `/register` get-started page
- `/app/*` authenticated workspace

## Environment defaults

The provided `.env.example` is configured for local development:
- SQLite database (`sqlite:///./app.db`)
- Local Redis URL (`redis://localhost:6379/0`)
- Local frontend origins for CORS

## Additional documentation

- Architecture overview: `docs/ARCHITECTURE.md`
- Local setup guide: `docs/LOCAL_SETUP.md`

## Optional Docker flow

Docker files are kept for convenience, but local development does not require Docker.

```bash
docker compose up --build
```
