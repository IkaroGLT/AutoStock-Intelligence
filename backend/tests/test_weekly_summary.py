import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.alerts.router import router as alerts_router
from app.auth.repository import create_user
from app.auth.security import create_access_token
from app.db.connection import connect
from app.db.init_db import initialize


@pytest.fixture
def ambiente(tmp_path, monkeypatch):
    db_path = tmp_path / "autostock_weekly_test.db"

    monkeypatch.setenv("AUTOSTOCK_DB_PATH", str(db_path))
    monkeypatch.setenv(
        "AUTOSTOCK_JWT_SECRET",
        "chave-temporaria-de-teste-com-mais-de-32-bytes",
    )

    initialize(db_path)

    admin = create_user(
        nome="Administrador Teste",
        email="admin-weekly@teste.local",
        password="SenhaAdmin123!",
        papel="ADMIN",
    )
    operador = create_user(
        nome="Operador Teste",
        email="operador-weekly@teste.local",
        password="SenhaOperador123!",
        papel="OPERADOR",
    )

    con = connect(db_path)
    try:
        # Webhook com erro recente: deve aparecer no resumo.
        con.execute(
            """
            INSERT INTO eventos_webhook (
                origem, evento_id, tipo_evento, payload, status,
                recebido_em, mensagem_erro
            )
            VALUES (
                'teste', 'evt-recente', 'ENTRADA',
                '{"sku":"SKU001","quantidade":1}',
                'ERRO',
                strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 days'),
                'Falha de teste'
            )
            """
        )

        # Webhook antigo: não deve aparecer no resumo.
        con.execute(
            """
            INSERT INTO eventos_webhook (
                origem, evento_id, tipo_evento, payload, status,
                recebido_em, mensagem_erro
            )
            VALUES (
                'teste', 'evt-antigo', 'ENTRADA',
                '{"sku":"SKU002","quantidade":1}',
                'ERRO',
                strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-10 days'),
                'Falha antiga'
            )
            """
        )

        # Sincronização com erro recente: deve aparecer no resumo.
        con.execute(
            """
            INSERT INTO sincronizacoes (
                tipo, arquivo_nome, status, total_erros,
                iniciada_em, finalizada_em, detalhes_erro
            )
            VALUES (
                'CSV', 'teste.csv', 'ERRO', 1,
                strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 days'),
                strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
                'Falha de teste'
            )
            """
        )

        # Sincronização concluída sem erros: não deve aparecer.
        con.execute(
            """
            INSERT INTO sincronizacoes (
                tipo, arquivo_nome, status, total_erros,
                iniciada_em, finalizada_em
            )
            VALUES (
                'CSV', 'sucesso.csv', 'CONCLUIDA', 0,
                strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 days'),
                strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
            )
            """
        )

        con.commit()
    finally:
        con.close()

    app = FastAPI()
    app.include_router(alerts_router)

    return {
        "client": TestClient(app),
        "admin": admin,
        "operador": operador,
    }


def headers(usuario):
    token = create_access_token(usuario["id"])
    return {"Authorization": f"Bearer {token}"}


def test_resumo_semanal_inclui_falhas_recentes_e_exclui_antigas(ambiente):
    response = ambiente["client"].get(
        "/alertas/resumo-semanal",
        headers=headers(ambiente["admin"]),
    )

    assert response.status_code == 200

    dados = response.json()
    assert dados["periodo_dias"] == 7
    assert dados["total_webhooks_com_erro"] == 1
    assert dados["total_sincronizacoes_com_erro"] == 1
    assert dados["webhooks"][0]["evento_id"] == "evt-recente"
    assert dados["sincronizacoes"][0]["arquivo_nome"] == "teste.csv"


def test_operador_pode_consultar_resumo_semanal(ambiente):
    response = ambiente["client"].get(
        "/alertas/resumo-semanal",
        headers=headers(ambiente["operador"]),
    )

    assert response.status_code == 200


def test_resumo_semanal_exige_autenticacao(ambiente):
    response = ambiente["client"].get("/alertas/resumo-semanal")

    assert response.status_code == 401