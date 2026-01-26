import importlib

from fastapi.testclient import TestClient


def test_root(monkeypatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "sqlite:///./test.db")
    monkeypatch.setenv("SECRET_KEY", "test-secret")

    from app import main

    importlib.reload(main)
    client = TestClient(main.app)

    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
