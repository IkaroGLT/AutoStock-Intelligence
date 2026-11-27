
import pytest
from fastapi.testclient import TestClient

from app.db.connection import connect
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


def criar_produto(db_path, sku="SKU-WEBHOOK", quantidade=10):
    con = connect(db_path)

    try:
        cursor = con.execute(
            """
            INSERT INTO produtos (
                sku, nome, categoria,
                preco_custo_centavos, preco_venda_centavos, ativo
            )
            VALUES (?, 'Produto Webhook', 'Geral', 100, 200, 1)
            """,
            (sku,),
        )

        con.execute(
            """
            INSERT INTO estoque (
                produto_id, quantidade_atual, estoque_minimo
            )
            VALUES (?, ?, 2)
            """,
            (cursor.lastrowid, quantidade),
        )

        con.commit()
    finally:
        con.close()


def obter_saldo(db_path, sku="SKU-WEBHOOK"):
    con = connect(db_path)

    try:
        resultado = con.execute(
            """
            SELECT e.quantidade_atual
            FROM estoque e
            JOIN produtos p ON p.id = e.produto_id
            WHERE p.sku = ?
            """,
            (sku,),
        ).fetchone()

        return resultado["quantidade_atual"]
    finally:
        con.close()


def obter_quantidade_movimentacoes(db_path):
    con = connect(db_path)

    try:
        return con.execute(
            "SELECT COUNT(*) FROM movimentacoes_estoque"
        ).fetchone()[0]
    finally:
        con.close()


def headers():
    return {"X-Webhook-Token": TOKEN}


def evento(
    evento_id="evento-001",
    tipo_evento="ENTRADA",
    sku="SKU-WEBHOOK",
    quantidade=5,
    motivo="Reposição de estoque",
):
    return {
        "origem": "sistema-teste",
        "evento_id": evento_id,
        "tipo_evento": tipo_evento,
        "payload": {
            "sku": sku,
            "quantidade": quantidade,
            "motivo": motivo,
        },
    }


def test_webhook_processa_entrada_autenticada(
    webhook_client, monkeypatch, tmp_path
):
    db_path = tmp_path / "webhook_test.db"
    criar_produto(db_path, quantidade=10)

    response = webhook_client.post(
        "/webhooks/events",
        headers=headers(),
        json=evento(),
    )

    assert response.status_code == 201
    assert response.json()["duplicado"] is False
    assert response.json()["status"] == "PROCESSADO"
    assert obter_saldo(db_path) == 15


def test_webhook_processa_saida(
    webhook_client, tmp_path
):
    db_path = tmp_path / "webhook_test.db"
    criar_produto(db_path, quantidade=10)

    response = webhook_client.post(
        "/webhooks/events",
        headers=headers(),
        json=evento(
            evento_id="evento-saida",
            tipo_evento="SAIDA",
            quantidade=3,
            motivo="Venda realizada",
        ),
    )

    assert response.status_code == 201
    assert response.json()["status"] == "PROCESSADO"
    assert obter_saldo(db_path) == 7


def test_webhook_nao_duplica_movimentacao(
    webhook_client, tmp_path
):
    db_path = tmp_path / "webhook_test.db"
    criar_produto(db_path, quantidade=10)

    dados = evento(
        evento_id="evento-002",
        quantidade=5,
    )

    primeira = webhook_client.post(
        "/webhooks/events",
        headers=headers(),
        json=dados,
    )

    segunda = webhook_client.post(
        "/webhooks/events",
        headers=headers(),
        json=dados,
    )

    assert primeira.status_code == 201
    assert primeira.json()["status"] == "PROCESSADO"

    assert segunda.status_code == 200
    assert segunda.json()["duplicado"] is True
    assert segunda.json()["id"] == primeira.json()["id"]
    assert segunda.json()["status"] == "PROCESSADO"

    assert obter_saldo(db_path) == 15
    assert obter_quantidade_movimentacoes(db_path) == 1


def test_webhook_registra_erro_para_sku_inexistente(webhook_client):
    response = webhook_client.post(
        "/webhooks/events",
        headers=headers(),
        json=evento(
            evento_id="evento-sku-inexistente",
            sku="SKU-NAO-EXISTE",
        ),
    )

    assert response.status_code == 201
    assert response.json()["status"] == "ERRO"
    assert response.json()["mensagem_erro"] is not None


def test_webhook_rejeita_token_ausente(webhook_client):
    response = webhook_client.post(
        "/webhooks/events",
        json=evento(),
    )

    assert response.status_code == 401


def test_webhook_rejeita_token_incorreto(webhook_client):
    response = webhook_client.post(
        "/webhooks/events",
        headers={"X-Webhook-Token": "token-incorreto"},
        json=evento(),
    )

    assert response.status_code == 401


def test_webhook_nao_aceita_jwt_humano(webhook_client):
    response = webhook_client.post(
        "/webhooks/events",
        headers={"Authorization": "Bearer jwt-humano"},
        json=evento(),
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
        headers=headers(),
        json={
            "origem": "sistema-teste",
            "payload": {},
        },
    )

    assert response.status_code == 422
