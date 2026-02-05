import importlib

from fastapi.testclient import TestClient


def _create_client(monkeypatch, db_path: str) -> TestClient:
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("SECRET_KEY", "test-secret")
    monkeypatch.setenv("AI_API_KEY", "")
    monkeypatch.setenv("CELERY_TASK_ALWAYS_EAGER", "true")

    from app import main

    importlib.reload(main)
    from app.services import llm_service

    llm_service.generate_ai_reply = lambda *args, **kwargs: "Test reply"
    return TestClient(main.app)


def _register_and_login(client: TestClient) -> str:
    response = client.post(
        "/auth/register",
        json={
            "email": "admin@example.com",
            "password": "StrongPassword1!",
            "company_name": "Test Company",
        },
    )
    assert response.status_code == 200

    login = client.post(
        "/auth/login",
        data={"username": "admin@example.com", "password": "StrongPassword1!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert login.status_code == 200
    return login.json()["access_token"]


def test_auth_and_dashboard(monkeypatch) -> None:
    client = _create_client(monkeypatch, "./test_auth.db")
    token = _register_and_login(client)

    response = client.get("/dashboard/stats", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    data = response.json()
    assert "total_leads" in data


def test_lead_creation(monkeypatch) -> None:
    client = _create_client(monkeypatch, "./test_leads.db")
    token = _register_and_login(client)

    response = client.post(
        "/leads",
        json={"name": "Sam", "email": "sam@example.com", "source": "manual"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "sam@example.com"


def test_email_processing_flow(monkeypatch) -> None:
    client = _create_client(monkeypatch, "./test_emails.db")
    token = _register_and_login(client)

    company = client.get("/companies/me", headers={"Authorization": f"Bearer {token}"}).json()
    api_key = company["api_key"]

    connect = client.post(
        "/integrations/email/connect",
        json={
            "provider": "gmail",
            "email_address": "inbox@example.com",
            "access_token": "token",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert connect.status_code == 201

    template = client.post(
        "/templates",
        json={
            "name": "Email template",
            "category": "support",
            "tone": "Professional",
            "trigger_type": "email",
            "subject_template": "Re: {subject}",
            "body_template": "Thanks {email}",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert template.status_code == 201

    webhook = client.post(
        "/webhook/email",
        headers={"X-Company-Key": api_key},
        json={"from_email": "lead@example.com", "subject": "Pricing", "body": "Info"},
    )
    assert webhook.status_code == 200

    emails = client.get("/emails", headers={"Authorization": f"Bearer {token}"})
    assert emails.status_code == 200
    data = emails.json()
    assert data
    replies = data[0]["replies"]
    assert replies
    assert replies[0]["send_status"] in {"sent", "failed"}
