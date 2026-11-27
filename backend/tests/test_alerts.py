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
    db_path = tmp_path / "autostock_alerts_test.db"

    monkeypatch.setenv("AUTOSTOCK_DB_PATH", str(db_path))
    monkeypatch.setenv(
        "AUTOSTOCK_JWT_SECRET",
        "chave-temporaria-de-teste-com-mais-de-32-bytes",
    )

    initialize(db_path)

    admin = create_user(
        nome="Administrador Teste",
        email="admin-alerts@teste.local",
        password="SenhaAdmin123!",
        papel="ADMIN",
    )
    operador = create_user(
        nome="Operador Teste",
        email="operador-alerts@teste.local",
        password="SenhaOperador123!",
        papel="OPERADOR",
    )

    con = connect(db_path)
    try:
        produtos = [
            ("SKU001", "Produto abaixo", 2, 5, 1),
            ("SKU002", "Produto no mínimo", 5, 5, 1),
            ("SKU003", "Produto acima", 8, 5, 1),
            ("SKU004", "Produto inativo", 0, 5, 0),
        ]

        for sku, nome, quantidade, minimo, ativo in produtos:
            cursor = con.execute(
                """
                INSERT INTO produtos (sku, nome, categoria, ativo)
                VALUES (?, ?, 'Teste', ?)
                """,
                (sku, nome, ativo),
            )
            con.execute(
                """
                INSERT INTO estoque (produto_id, quantidade_atual, estoque_minimo)
                VALUES (?, ?, ?)
                """,
                (cursor.lastrowid, quantidade, minimo),
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


def test_alertas_incluem_estoque_abaixo_e_no_minimo(ambiente):
    response = ambiente["client"].get(
        "/alertas/estoque-baixo",
        headers=headers(ambiente["admin"]),
    )

    assert response.status_code == 200
    assert {item["sku"] for item in response.json()} == {"SKU001", "SKU002"}


def test_operador_pode_consultar_alertas(ambiente):
    response = ambiente["client"].get(
        "/alertas/estoque-baixo",
        headers=headers(ambiente["operador"]),
    )

    assert response.status_code == 200


def test_alertas_exigem_autenticacao(ambiente):
    response = ambiente["client"].get("/alertas/estoque-baixo")

    assert response.status_code == 401
