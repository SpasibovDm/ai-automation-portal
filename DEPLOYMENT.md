# Deployment Guide

This project is deployable on Docker, Ubuntu VPS, and Nginx reverse-proxy setups.

## 1) Environment Variables

Use `.env.example` as your baseline.

Minimum production variables:

- `ENVIRONMENT=production`
- `SECRET_KEY=<strong-random-value>`
- `DATABASE_URL=postgresql+psycopg2://...`
- `REDIS_URL=redis://...`
- `ALLOWED_ORIGINS=https://your-domain.example`
- `AI_API_KEY=<provider-key>` (optional but recommended)

## 2) Docker Compose (Production Baseline)

Use `docker-compose.prod.yml`:

```bash
cp .env.example .env
# edit .env for production values

docker compose -f docker-compose.prod.yml up -d --build
```

Services started:
- `api` (FastAPI)
- `worker` (Celery)
- `db` (PostgreSQL)
- `redis`
- `frontend` (Nginx serving React build)

By default this compose maps frontend to `http://<server-ip>:8080`.

## 3) VPS (Ubuntu) Quick Path

### Install dependencies

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git nginx
sudo systemctl enable --now docker
```

### Deploy app

```bash
git clone https://github.com/SpasibovDm/ai-automation-portal.git
cd ai-automation-portal
cp .env.example .env
# edit .env

docker compose -f docker-compose.prod.yml up -d --build
```

### Configure Nginx reverse proxy

Use the template in `deploy/nginx/ai-automation-portal.conf`:

```bash
sudo cp deploy/nginx/ai-automation-portal.conf /etc/nginx/sites-available/ai-automation-portal
sudo ln -s /etc/nginx/sites-available/ai-automation-portal /etc/nginx/sites-enabled/ai-automation-portal
sudo nginx -t
sudo systemctl reload nginx
```

### TLS (recommended)

Use Certbot for HTTPS certificates after DNS points to your VPS.

## 4) IONOS-ready Notes

IONOS VPS deployment is the same as any Ubuntu VM:
- Provision Ubuntu server
- Open ports `80`, `443`, and optionally `22`
- Deploy with Docker Compose
- Place Nginx in front of app
- Attach TLS certificate

## 5) Health Checks and Operations

- API health: `GET /health`
- API runtime status: `GET /status`
- Include container restart policy (`unless-stopped`) and health checks (already in compose)

Recommended operational checks:
- Validate app after deploy with `/health`
- Check `docker compose ps`
- Inspect logs with `docker compose logs -f api`

## 6) Rollback Strategy

- Keep previous git tag/commit available
- Rebuild and redeploy previous known-good version
- Run DB backup before schema changes

Example:

```bash
git checkout <previous-tag-or-commit>
docker compose -f docker-compose.prod.yml up -d --build
```
