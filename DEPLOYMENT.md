# Production Deployment (Ubuntu VPS, Docker, Nginx)

This guide prepares `ai-automation-portal` for a professional VPS deployment (IONOS or any Ubuntu host).

## 1) Minimal VPS Specs

Recommended minimum for production:

- 2 vCPU
- 4 GB RAM
- 40+ GB SSD
- Ubuntu 22.04 LTS
- Static public IP

## 2) SSH Key Setup

On your local machine:

```bash
ssh-keygen -t ed25519 -C "you@your-company.com"
```

Copy the public key to the server:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@YOUR_SERVER_IP
```

Login:

```bash
ssh root@YOUR_SERVER_IP
```

Optional hardening (recommended):
- Create a non-root sudo user.
- Disable password SSH login in `/etc/ssh/sshd_config`.

## 3) Firewall Setup (UFW)

```bash
sudo apt update
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

## 4) Install Docker and Compose Plugin

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
```

## 5) Install Nginx and Certbot (Host Tools)

Even with containerized nginx, keep host `nginx` and `certbot` available for certificate tooling and troubleshooting.

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

## 6) Clone and Configure the Project

```bash
git clone https://github.com/SpasibovDm/ai-automation-portal.git
cd ai-automation-portal
cp .env.prod.example .env.prod
```

Edit `.env.prod` and set at least:

- `SECRET_KEY`
- `DATABASE_URL`
- `ALLOWED_ORIGINS`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `AI_API_KEY` (optional if running without provider)

## 7) DNS Setup

In your domain provider panel:

- `A` record: `your-domain.com` -> `YOUR_SERVER_IP`
- `A` record: `www.your-domain.com` -> `YOUR_SERVER_IP`

Wait for DNS propagation before requesting certificates.

## 8) Nginx Reverse Proxy Config (Container)

Production nginx config template:

- `deploy/nginx/production.conf`

It defines:
- `/api/` -> `backend:8000`
- `/` -> `frontend:80`
- Certbot challenge path
- TLS server placeholder block (commented)

## 9) Start Production Stack

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Services started:

- `backend` (FastAPI + Uvicorn)
- `frontend` (React static app via nginx)
- `postgres`
- `redis`
- `nginx` (reverse proxy, exposed on `80/443`)

## 10) TLS with Certbot (Placeholder Workflow)

1. Ensure `deploy/nginx/production.conf` is active (HTTP only first).
2. Run certbot on host:

```bash
sudo certbot certonly --webroot -w /path/to/ai-automation-portal/deploy/certbot/www -d your-domain.com -d www.your-domain.com
```

3. Uncomment the `443` TLS block in `deploy/nginx/production.conf` and set correct certificate paths.
4. Reload nginx container:

```bash
docker compose -f docker-compose.prod.yml restart nginx
```

## 11) Health, Status, and Monitoring

Health endpoint:

```bash
curl http://YOUR_DOMAIN/health
# {"status":"ok"}
```

Operational checks:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f nginx
```

## 12) Common Rollback Procedure

```bash
git checkout <previous-tag-or-commit>
docker compose -f docker-compose.prod.yml up --build -d
```

Always keep database backups before major schema changes.
