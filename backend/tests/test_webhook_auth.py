import pytest
from fastapi.testclient import TestClient

from app.db.init_db import initialize
from app.main import app


TOKEN = "token-de-integracao-teste-com-mais-de-32-bytes"


@pytest.fixture
def webhook_client(tmp_path, monkeypatch):
    db_path = tmp_path / "webhook_test.db"

    monkeypatch.setenv("AUTOSTOCK_DB_PATH", str(db_path))
    monkeypatch.setenv("AUTOSTOCK_WEBHOOK_TOKEN", TOKEN)

    initialize(db_path)

    return TestClient(app)


def test_webhook_recebe_evento_autenticado(webhook_client):
    response = webhook_client.post(
        "/webhooks/events",
        headers={"X-Webhook-Token": TOKEN},
        json={
            "origem": "sistema-teste",
            "evento_id": "evento-001",
            "tipo_evento": "estoque.atualizado",
            "payload": {"produto_id": 10, "quantidade": 25},
        },
    )

    assert response.status_code == 201
    assert response.json()["duplicado"] is False
    assert response.json()["status"] == "RECEBIDO"


def test_webhook_nao_duplica_evento(webhook_client):
    dados = {
        "origem": "sistema-teste",
        "evento_id": "evento-002",
        "tipo_evento": "estoque.atualizado",
        "payload": {"produto_id": 20, "quantidade": 15},
    }
    headers = {"X-Webhook-Token": TOKEN}

    primeira = webhook_client.post(
        "/webhooks/events",
        headers=headers,
        json=dados,
    )
    segunda = webhook_client.post(
        "/webhooks/events",
        headers=headers,
        json=dados,
    )

    assert primeira.status_code == 201
    assert segunda.status_code == 200
    assert segunda.json()["duplicado"] is True
    assert segunda.json()["id"] == primeira.json()["id"]


def test_webhook_rejeita_token_ausente(webhook_client):
    response = webhook_client.post(
        "/webhooks/events",
        json={
            "origem": "sistema-teste",
            "evento_id": "evento-003",
            "tipo_evento": "estoque.atualizado",
            "payload": {},
        },
    )

    assert response.status_code == 401


def test_webhook_rejeita_token_incorreto(webhook_client):
    response = webhook_client.post(
        "/webhooks/events",
        headers={"X-Webhook-Token": "token-incorreto"},
        json={
            "origem": "sistema-teste",
            "evento_id": "evento-004",
            "tipo_evento": "estoque.atualizado",
            "payload": {},
        },
    )

    assert response.status_code == 401


def test_webhook_nao_aceita_jwt_humano(webhook_client):
    response = webhook_client.post(
        "/webhooks/events",
        headers={"Authorization": "Bearer jwt-humano"},
        json={
            "origem": "sistema-teste",
            "evento_id": "evento-005",
            "tipo_evento": "estoque.atualizado",
            "payload": {},
        },
    )

    assert response.status_code == 401


def test_webhook_rejeita_configuracao_ausente(
    webhook_client, monkeypatch
):
    monkeypatch.delenv("AUTOSTOCK_WEBHOOK_TOKEN")

    response = webhook_client.post("/webhooks/events")

    assert response.status_code == 503


def test_webhook_rejeita_token_configurado_curto(
    webhook_client, monkeypatch
):
    monkeypatch.setenv("AUTOSTOCK_WEBHOOK_TOKEN", "token-curto")

    response = webhook_client.post("/webhooks/events")

    assert response.status_code == 503


def test_webhook_rejeita_evento_sem_campos_obrigatorios(webhook_client):
    response = webhook_client.post(
        "/webhooks/events",
        headers={"X-Webhook-Token": TOKEN},
        json={
            "origem": "sistema-teste",
            "payload": {},
        },
    )

    assert response.status_code == 422
