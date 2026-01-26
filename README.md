# AI Automation Portal

Full-stack B2B SaaS Business Automation Portal for managing inbound leads, incoming emails, and automated responses. The backend is built with FastAPI + SQLite, while the frontend uses React + Vite + TailwindCSS.

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

#### Create an auto-reply template (admin only)

```bash
curl -X POST http://127.0.0.1:8000/auto-replies \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "trigger_type": "lead",
    "subject_template": "Thanks, {name}!",
    "body_template": "We received your inquiry about {source}."
  }'
```

#### Receive a lead (public)

```bash
curl -X POST "http://127.0.0.1:8000/public/lead?company_id=1" \
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
  -H "Content-Type: application/json" \
  -d '{
    "from_email": "taylor@example.com",
    "subject": "Pricing question",
    "body": "Can you share pricing details?",
    "company_id": 1
  }'
```

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

## Multi-tenant scoping

Auto-reply templates, leads, and emails are scoped to a company. Template creation and retrieval always use the requesting admin's `company_id`, and auto-replies are generated only when a matching template exists for the lead/email's company.
