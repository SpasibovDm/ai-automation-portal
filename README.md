# AI Automation Portal

## Local development (venv)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### Database migrations (Alembic)

```bash
alembic upgrade head
```

## Docker

A Dockerfile is not currently included in this repository. If one is added later, you can build and run the API with:

```bash
docker build -t ai-automation-portal .
docker run -p 8000:8000 ai-automation-portal
```

## API examples (curl)

### Register

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operator@example.com",
    "password": "change-me",
    "company_name": "Acme Widgets"
  }'
```

### Login

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=operator@example.com&password=change-me"
```

### Create an auto-reply template (admin only)

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

### Receive a lead (public)

```bash
curl -X POST "http://127.0.0.1:8000/leads/public?company_id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Taylor",
    "email": "taylor@example.com",
    "phone": "555-0100",
    "message": "I want to learn more",
    "source": "web"
  }'
```

### Receive an email

```bash
curl -X POST http://127.0.0.1:8000/emails/receive \
  -H "Content-Type: application/json" \
  -d '{
    "from_email": "taylor@example.com",
    "subject": "Pricing question",
    "body": "Can you share pricing details?"
  }'
```

## Multi-tenant scoping

Auto-reply templates are scoped to a company. Template creation and retrieval always use the requesting admin's `company_id`, and auto-replies are generated only when a matching template exists for the lead/email's company.
