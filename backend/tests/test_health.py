from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
LIST = Path(__file__).resolve().parents[2] / "docs" / "privacy" / "forbidden-fields.yml"


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ready_skips_postgres_in_dev() -> None:
    response = client.get("/ready")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["postgres"] == "skipped"


def test_health_schema_has_no_ledger_fields() -> None:
    payload_keys = set(client.get("/health").json().keys())
    blocked = {
        line[2:].strip()
        for line in LIST.read_text().splitlines()
        if line.strip().startswith("- ")
    }
    assert payload_keys.isdisjoint(blocked)
