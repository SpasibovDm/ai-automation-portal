import importlib

from fastapi.testclient import TestClient


def _create_client(monkeypatch, db_path: str) -> TestClient:
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("SECRET_KEY", "test-secret")
    monkeypatch.setenv("AI_API_KEY", "")

    from app import main

    importlib.reload(main)
    return TestClient(main.app)


def test_chat_message_returns_reply(monkeypatch) -> None:
    client = _create_client(monkeypatch, "./test_chat_message.db")

    response = client.post("/api/chat/message", json={"message": "Hello there"})

    assert response.status_code == 200
    assert "reply" in response.json()


def test_chat_message_alias_returns_reply(monkeypatch) -> None:
    client = _create_client(monkeypatch, "./test_chat_alias.db")

    response = client.post("/chat/message", json={"message": "Hello there"})

    assert response.status_code == 200
    assert "reply" in response.json()


def test_chat_lead_creates_lead(monkeypatch) -> None:
    client = _create_client(monkeypatch, "./test_chat_lead.db")

    payload = {
        "name": "Taylor",
        "email": "taylor@example.com",
        "message": "Interested in pricing",
        "company": "Acme Inc",
    }
    response = client.post("/api/chat/lead", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert "id" in data

    from app.core.database import SessionLocal
    from app.models.lead import Lead

    session = SessionLocal()
    try:
        lead = session.query(Lead).filter(Lead.id == data["id"]).first()
        assert lead is not None
        assert lead.email == payload["email"]
        assert lead.source == "chat"
    finally:
        session.close()
