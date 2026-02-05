# AI Automation Portal

Full-stack B2B SaaS Business Automation Portal for managing inbound leads, incoming emails, and automated responses. The backend uses FastAPI + PostgreSQL + Redis + Celery, while the frontend uses React + Vite + TailwindCSS.

## Local development (Docker)

```bash
cp .env.example .env
docker compose up --build
```

The API will be available at `http://127.0.0.1:8000/docs` and the frontend at `http://127.0.0.1:5173`.

The Docker stack uses PostgreSQL and Redis by default. SQLite is not used in Docker.

## Backend (FastAPI)

### Local development (venv)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`, and Swagger docs at `http://127.0.0.1:8000/docs`.

### Database migrations (Alembic)

```bash
alembic upgrade head
```

### API examples (curl)

#### Register

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operator@example.com",
    "password": "change-me",
    "company_name": "Acme Widgets"
  }'
```

The first user registered for a new company is promoted to the `admin` role automatically.

#### Login

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=operator@example.com&password=change-me"
```

#### Create a response template (admin only)

```bash
curl -X POST http://127.0.0.1:8000/templates \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Inbound sales follow-up",
    "category": "sales",
    "tone": "Professional",
    "trigger_type": "lead",
    "subject_template": "Thanks, {name}!",
    "body_template": "We received your inquiry about {source}."
  }'
```

#### Receive a lead (public)

```bash
curl -X POST "http://127.0.0.1:8000/public/lead" \
  -H "X-Company-Key: <COMPANY_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Taylor",
    "email": "taylor@example.com",
    "phone": "555-0100",
    "message": "I want to learn more",
    "source": "website"
  }'
```

#### Receive an email (webhook)

```bash
curl -X POST http://127.0.0.1:8000/webhook/email \
  -H "X-Company-Key: <COMPANY_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "from_email": "taylor@example.com",
    "subject": "Pricing question",
    "body": "Can you share pricing details?"
  }'
```

#### Connect Gmail or Microsoft 365

```bash
curl -X POST http://127.0.0.1:8000/integrations/email/connect \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gmail",
    "email_address": "inbox@example.com",
    "access_token": "oauth-access-token",
    "refresh_token": "oauth-refresh-token",
    "scopes": ["https://mail.google.com/"]
  }'
```

```bash
curl -X GET http://127.0.0.1:8000/integrations/email/status \
  -H "Authorization: Bearer <TOKEN>"
```

OAuth tokens are stored in the database for now; replace the placeholder storage with your preferred KMS/encryption strategy for production.

## Frontend (React)

### Local development

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at `http://127.0.0.1:5173`. Configure the backend URL by creating `frontend/.env`:

```bash
VITE_API_URL="http://127.0.0.1:8000"
```

You can also start from the provided example file:

```bash
cp frontend/.env.example frontend/.env
```

## Multi-tenant scoping

Auto-reply templates, leads, and emails are scoped to a company. Template creation and retrieval always use the requesting admin's `company_id`, and auto-replies are generated only when a matching template exists for the lead/email's company.

## Auto-reply workflow

1. Incoming emails are received via the `/webhook/email` endpoint.
2. Celery generates an AI reply in the background using the active template.
3. The reply is sent through the connected Gmail or Microsoft 365 integration.
4. Delivery status, message ID, and timestamps are stored with the reply record.

## Health & monitoring

- Health check: `GET /health`
- Structured logging is enabled in the API middleware.
- Sentry can be enabled by setting `SENTRY_DSN` and `SENTRY_ENVIRONMENT`.

## Production deployment

Use the production compose file to run Postgres, Redis, API, Celery worker, and the Nginx-served frontend:

```bash
docker compose -f docker-compose.prod.yml up --build
```

Set `ALLOWED_ORIGINS` to your frontend domain and update the `.env` secrets before deploying. The production frontend is built with `VITE_API_URL=/api`, which is proxied to the FastAPI container by Nginx.

## Environment variables

Create a `.env` file from `.env.example` and update secrets as needed:

```bash
APP_NAME=Business Automation Portal
SECRET_KEY=change-this-secret
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/automation
REDIS_URL=redis://redis:6379/0
AI_API_KEY=change-this-key
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## AI Chat Assistant

The portal now ships with a floating AI chat widget that can be embedded in any React page.

### Endpoints

- `POST /api/chat/message`
- `POST /api/chat/lead`

### Embed the widget

1. Ensure `VITE_API_URL` points at your backend (for example, `http://127.0.0.1:8000`).
2. Import and render the widget once in your layout:

```tsx
import ChatWidget from "./components/ChatWidget";

<ChatWidget />
```

The widget opens from the bottom-right corner, responds to messages, and submits a lead when an email is provided.
