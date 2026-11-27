
import io

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from openpyxl import Workbook

from app.auth.repository import create_user
from app.auth.security import create_access_token
from app.db.connection import connect
from app.db.init_db import initialize
from app.imports.router import router as imports_router


CABECALHO = (
    "sku,nome,categoria,preco_custo,preco_venda,"
    "quantidade,estoque_minimo,ativo\n"
)


@pytest.fixture
def ambiente(tmp_path, monkeypatch):
    db_path = tmp_path / "autostock_import_test.db"

    monkeypatch.setenv("AUTOSTOCK_DB_PATH", str(db_path))
    monkeypatch.setenv(
        "AUTOSTOCK_JWT_SECRET",
        "chave-temporaria-de-teste-com-mais-de-32-bytes",
    )

    initialize(db_path)

    admin = create_user(
        nome="Administrador Teste",
        email="admin-import@teste.local",
        password="SenhaAdmin123!",
        papel="ADMIN",
    )

    operador = create_user(
        nome="Operador Teste",
        email="operador-import@teste.local",
        password="SenhaOperador123!",
        papel="OPERADOR",
    )

    app = FastAPI()
    app.include_router(imports_router)

    return {
        "client": TestClient(app),
        "admin": admin,
        "operador": operador,
        "db_path": db_path,
    }


def headers(usuario):
    token = create_access_token(usuario["id"])
    return {"Authorization": f"Bearer {token}"}


def csv_file(linhas):
    return (
        CABECALHO + linhas
    ).encode("utf-8-sig")


def test_admin_importa_csv_e_registra_entrada(ambiente):
    arquivo = csv_file(
        "SKU001,Produto Teste,Alimentos,10.50,15.90,8,2,sim\n"
    )

    response = ambiente["client"].post(
        "/importacoes",
        headers=headers(ambiente["admin"]),
        files={"arquivo": ("produtos.csv", arquivo, "text/csv")},
    )

    assert response.status_code == 201
    assert response.json()["total_criados"] == 1

    con = connect(ambiente["db_path"])
    try:
        produto = con.execute(
            """
            SELECT p.id, p.preco_custo_centavos,
                   p.preco_venda_centavos, e.quantidade_atual
            FROM produtos p
            JOIN estoque e ON e.produto_id = p.id
            WHERE p.sku = 'SKU001'
            """
        ).fetchone()

        movimento = con.execute(
            """
            SELECT tipo, quantidade_movimentada, origem
            FROM movimentacoes_estoque
            WHERE produto_id = ?
            """,
            (produto["id"],),
        ).fetchone()

        assert produto["preco_custo_centavos"] == 1050
        assert produto["preco_venda_centavos"] == 1590
        assert produto["quantidade_atual"] == 8
        assert movimento["tipo"] == "ENTRADA"
        assert movimento["quantidade_movimentada"] == 8
        assert movimento["origem"] == "importacao"
    finally:
        con.close()


def test_importacao_xlsx(ambiente):
    workbook = Workbook()
    sheet = workbook.active

    sheet.append([
        "sku", "nome", "categoria", "preco_custo",
        "preco_venda", "quantidade", "estoque_minimo", "ativo",
    ])
    sheet.append([
        "SKU-XLSX", "Produto XLSX", "Geral",
        12.50, 20.00, 0, 3, True,
    ])

    arquivo = io.BytesIO()
    workbook.save(arquivo)

    response = ambiente["client"].post(
        "/importacoes",
        headers=headers(ambiente["admin"]),
        files={
            "arquivo": (
                "produtos.xlsx",
                arquivo.getvalue(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        },
    )

    assert response.status_code == 201
    assert response.json()["total_criados"] == 1


def test_produto_existente_preserva_saldo(ambiente):
    con = connect(ambiente["db_path"])
    try:
        cursor = con.execute(
            """
            INSERT INTO produtos (
                sku, nome, categoria,
                preco_custo_centavos, preco_venda_centavos, ativo
            )
            VALUES ('SKU-EXISTENTE', 'Nome antigo', 'Geral', 100, 200, 1)
            """
        )

        con.execute(
            """
            INSERT INTO estoque (
                produto_id, quantidade_atual, estoque_minimo
            )
            VALUES (?, 25, 2)
            """,
            (cursor.lastrowid,),
        )
        con.commit()
    finally:
        con.close()

    arquivo = csv_file(
        "SKU-EXISTENTE,Nome atualizado,Geral,3.50,5.00,999,7,sim\n"
    )

    response = ambiente["client"].post(
        "/importacoes",
        headers=headers(ambiente["admin"]),
        files={"arquivo": ("produtos.csv", arquivo, "text/csv")},
    )

    assert response.status_code == 201
    assert response.json()["total_atualizados"] == 1

    con = connect(ambiente["db_path"])
    try:
        produto = con.execute(
            """
            SELECT p.nome, e.quantidade_atual, e.estoque_minimo
            FROM produtos p
            JOIN estoque e ON e.produto_id = p.id
            WHERE p.sku = 'SKU-EXISTENTE'
            """
        ).fetchone()

        assert produto["nome"] == "Nome atualizado"
        assert produto["quantidade_atual"] == 25
        assert produto["estoque_minimo"] == 7
    finally:
        con.close()


def test_sku_duplicado_rejeita_arquivo(ambiente):
    arquivo = csv_file(
        "SKU-DUP,Produto 1,Geral,1,2,0,1,sim\n"
        "SKU-DUP,Produto 2,Geral,1,2,0,1,sim\n"
    )

    response = ambiente["client"].post(
        "/importacoes",
        headers=headers(ambiente["admin"]),
        files={"arquivo": ("produtos.csv", arquivo, "text/csv")},
    )

    assert response.status_code == 422
    assert "SKU duplicado" in response.json()["detail"]


def test_operador_nao_pode_importar(ambiente):
    arquivo = csv_file(
        "SKU001,Produto,Geral,1,2,0,1,sim\n"
    )

    response = ambiente["client"].post(
        "/importacoes",
        headers=headers(ambiente["operador"]),
        files={"arquivo": ("produtos.csv", arquivo, "text/csv")},
    )

    assert response.status_code == 403


def test_importacao_exige_autenticacao(ambiente):
    arquivo = csv_file(
        "SKU001,Produto,Geral,1,2,0,1,sim\n"
    )

    response = ambiente["client"].post(
        "/importacoes",
        files={"arquivo": ("produtos.csv", arquivo, "text/csv")},
    )

    assert response.status_code == 401


def test_produto_novo_inativo_com_quantidade_reverte_tudo(ambiente):
    arquivo = csv_file(
        "SKU-VALIDO,Produto válido,Geral,1,2,0,1,sim\n"
        "SKU-INATIVO,Produto inativo,Geral,1,2,5,1,nao\n"
    )

    response = ambiente["client"].post(
        "/importacoes",
        headers=headers(ambiente["admin"]),
        files={"arquivo": ("produtos.csv", arquivo, "text/csv")},
    )

    assert response.status_code == 422

    con = connect(ambiente["db_path"])
    try:
        quantidade = con.execute(
            "SELECT COUNT(*) FROM produtos"
        ).fetchone()[0]

        sincronizacoes = con.execute(
            "SELECT COUNT(*) FROM sincronizacoes"
        ).fetchone()[0]

        assert quantidade == 0
        assert sincronizacoes == 0
    finally:
        con.close()


def test_formato_nao_suportado(ambiente):
    response = ambiente["client"].post(
        "/importacoes",
        headers=headers(ambiente["admin"]),
        files={"arquivo": ("produtos.txt", b"teste", "text/plain")},
    )

    assert response.status_code == 415
