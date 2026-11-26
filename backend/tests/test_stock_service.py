
import sqlite3

import pytest

from app.db.connection import connect
from app.db.init_db import initialize
from app.stock.service import (
    ProdutoInativoError,
    ReferenciaExternaDuplicadaError,
    SaldoInsuficienteError,
    movimentar_estoque,
    registrar_movimentacao_em_transacao,
)


@pytest.fixture
def estoque_teste(tmp_path):
    db_path = tmp_path / "stock_test.db"
    initialize(db_path)

    con = connect(db_path)

    try:
        cursor = con.execute(
            """
            INSERT INTO produtos (sku, nome, categoria)
            VALUES (?, ?, ?)
            """,
            ("PROD-001", "Produto de teste", "Geral"),
        )

        produto_id = cursor.lastrowid

        con.execute(
            """
            INSERT INTO estoque (
                produto_id,
                quantidade_atual,
                estoque_minimo
            )
            VALUES (?, ?, ?)
            """,
            (produto_id, 10, 2),
        )

        con.commit()

    finally:
        con.close()

    return db_path, produto_id


def consultar_saldo(db_path, produto_id):
    con = connect(db_path)

    try:
        resultado = con.execute(
            """
            SELECT quantidade_atual
            FROM estoque
            WHERE produto_id = ?
            """,
            (produto_id,),
        ).fetchone()

        return resultado["quantidade_atual"]

    finally:
        con.close()


def test_entrada_saida_e_ajuste(estoque_teste):
    db_path, produto_id = estoque_teste

    entrada = movimentar_estoque(
        db_path=db_path,
        produto_id=produto_id,
        tipo="ENTRADA",
        quantidade=5,
        motivo="Reposição",
    )

    assert entrada["quantidade_anterior"] == 10
    assert entrada["quantidade_nova"] == 15
    assert entrada["quantidade_movimentada"] == 5

    saida = movimentar_estoque(
        db_path=db_path,
        produto_id=produto_id,
        tipo="SAIDA",
        quantidade=3,
        motivo="Venda",
    )

    assert saida["quantidade_anterior"] == 15
    assert saida["quantidade_nova"] == 12

    ajuste = movimentar_estoque(
        db_path=db_path,
        produto_id=produto_id,
        tipo="AJUSTE",
        quantidade=20,
        motivo="Conferência de inventário",
    )

    assert ajuste["quantidade_anterior"] == 12
    assert ajuste["quantidade_nova"] == 20
    assert consultar_saldo(db_path, produto_id) == 20


def test_saida_nao_permite_saldo_negativo(estoque_teste):
    db_path, produto_id = estoque_teste

    with pytest.raises(SaldoInsuficienteError):
        movimentar_estoque(
            db_path=db_path,
            produto_id=produto_id,
            tipo="SAIDA",
            quantidade=11,
            motivo="Teste de saldo insuficiente",
        )

    assert consultar_saldo(db_path, produto_id) == 10


def test_referencia_externa_nao_pode_ser_reutilizada(
    estoque_teste,
):
    db_path, produto_id = estoque_teste

    movimentar_estoque(
        db_path=db_path,
        produto_id=produto_id,
        tipo="ENTRADA",
        quantidade=2,
        motivo="Entrada externa",
        origem="sistema_vendas",
        referencia_externa="evento-001",
    )

    with pytest.raises(ReferenciaExternaDuplicadaError):
        movimentar_estoque(
            db_path=db_path,
            produto_id=produto_id,
            tipo="ENTRADA",
            quantidade=5,
            motivo="Tentativa duplicada",
            origem="sistema_vendas",
            referencia_externa="evento-001",
        )

    assert consultar_saldo(db_path, produto_id) == 12


def test_falha_no_historico_reverte_atualizacao(
    estoque_teste,
):
    db_path, produto_id = estoque_teste

    con = connect(db_path)

    try:
        con.execute(
            """
            CREATE TRIGGER falhar_historico_teste
            BEFORE INSERT ON movimentacoes_estoque
            BEGIN
                SELECT RAISE(ABORT, 'falha simulada');
            END;
            """
        )
        con.commit()

    finally:
        con.close()

    with pytest.raises(sqlite3.IntegrityError):
        movimentar_estoque(
            db_path=db_path,
            produto_id=produto_id,
            tipo="ENTRADA",
            quantidade=5,
            motivo="Teste de rollback",
        )

    assert consultar_saldo(db_path, produto_id) == 10

    con = connect(db_path)

    try:
        total = con.execute(
            "SELECT COUNT(*) FROM movimentacoes_estoque"
        ).fetchone()[0]

        assert total == 0

    finally:
        con.close()


@pytest.mark.parametrize(
    ("tipo", "quantidade"),
    [
        ("ENTRADA", 0),
        ("SAIDA", 0),
        ("AJUSTE", -1),
        ("ENTRADA", 1.5),
        ("SAIDA", True),
    ],
)
def test_rejeita_quantidades_invalidas(
    estoque_teste,
    tipo,
    quantidade,
):
    db_path, produto_id = estoque_teste

    with pytest.raises(ValueError):
        movimentar_estoque(
            db_path=db_path,
            produto_id=produto_id,
            tipo=tipo,
            quantidade=quantidade,
            motivo="Teste de validação",
        )

    assert consultar_saldo(db_path, produto_id) == 10

def test_produto_inativo_nao_permite_movimentacao(estoque_teste):
    db_path, produto_id = estoque_teste

    con = connect(db_path)

    try:
        con.execute(
            "UPDATE produtos SET ativo = 0 WHERE id = ?",
            (produto_id,),
        )
        con.commit()
    finally:
        con.close()

    with pytest.raises(ProdutoInativoError):
        movimentar_estoque(
            db_path=db_path,
            produto_id=produto_id,
            tipo="ENTRADA",
            quantidade=5,
            motivo="Teste de produto inativo",
        )

    assert consultar_saldo(db_path, produto_id) == 10

    con = connect(db_path)

    try:
        total = con.execute(
            "SELECT COUNT(*) FROM movimentacoes_estoque"
        ).fetchone()[0]

        assert total == 0
    finally:
        con.close()

def test_movimentacao_em_transacao_externa_nao_faz_commit(
    estoque_teste,
):
    db_path, produto_id = estoque_teste

    con = connect(db_path)

    try:
        con.execute("BEGIN IMMEDIATE")

        resultado = registrar_movimentacao_em_transacao(
            con,
            produto_id=produto_id,
            tipo="ENTRADA",
            quantidade=5,
            motivo="Teste de transação externa",
        )

        assert resultado is not None
        assert con.in_transaction is True

        con.rollback()

    finally:
        con.close()

    assert consultar_saldo(db_path, produto_id) == 10
    
def test_falha_em_transacao_externa_preserva_transacao(
    estoque_teste,
):
    db_path, produto_id = estoque_teste

    con = connect(db_path)

    try:
        con.execute("BEGIN IMMEDIATE")

        with pytest.raises(SaldoInsuficienteError):
            registrar_movimentacao_em_transacao(
                con,
                produto_id=produto_id,
                tipo="SAIDA",
                quantidade=100,
                motivo="Teste de rollback parcial",
            )

        assert con.in_transaction is True

        # A transação externa continua utilizável.
        con.execute(
            "UPDATE produtos SET nome = nome WHERE id = ?",
            (produto_id,),
        )

        con.commit()

    finally:
        con.close()

    assert consultar_saldo(db_path, produto_id) == 10
