
"""Serviço central de movimentações de estoque."""

import sqlite3

from app.db.connection import connect


class MovimentacaoError(Exception):
    """Erro base das operações de movimentação."""


class ProdutoNaoEncontradoError(MovimentacaoError):
    """Produto inexistente."""


class EstoqueNaoEncontradoError(MovimentacaoError):
    """Produto sem registro correspondente na tabela estoque."""


class SaldoInsuficienteError(MovimentacaoError):
    """A saída ultrapassa o saldo disponível."""


class ReferenciaExternaDuplicadaError(MovimentacaoError):
    """Referência externa já utilizada pela mesma origem."""


class MovimentacaoConcorrenteError(MovimentacaoError):
    """O saldo foi alterado durante a operação."""

class ProdutoInativoError(MovimentacaoError):
    """Produto inativo não pode receber movimentações."""

def _validar_dados(
    produto_id,
    tipo,
    quantidade,
    motivo,
    origem,
    referencia_externa,
):
    if (
        not isinstance(produto_id, int)
        or isinstance(produto_id, bool)
        or produto_id <= 0
    ):
        raise ValueError("produto_id deve ser um inteiro positivo.")

    if not isinstance(tipo, str):
        raise ValueError("Tipo de movimentação inválido.")

    tipo = tipo.strip().upper()

    if tipo not in {"ENTRADA", "SAIDA", "AJUSTE"}:
        raise ValueError("Tipo deve ser ENTRADA, SAIDA ou AJUSTE.")

    if (
        not isinstance(quantidade, int)
        or isinstance(quantidade, bool)
    ):
        raise ValueError("Quantidade deve ser um número inteiro.")

    if tipo in {"ENTRADA", "SAIDA"} and quantidade <= 0:
        raise ValueError(
            "Entrada e saída exigem quantidade inteira positiva."
        )

    if tipo == "AJUSTE" and quantidade < 0:
        raise ValueError("O saldo final do ajuste não pode ser negativo.")

    if not isinstance(motivo, str) or not motivo.strip():
        raise ValueError("O motivo da movimentação é obrigatório.")

    if not isinstance(origem, str) or not origem.strip():
        raise ValueError("A origem da movimentação é obrigatória.")

    if referencia_externa is not None:
        if (
            not isinstance(referencia_externa, str)
            or not referencia_externa.strip()
        ):
            raise ValueError("A referência externa não pode ser vazia.")

        referencia_externa = referencia_externa.strip()

    return (
        tipo,
        quantidade,
        motivo.strip(),
        origem.strip(),
        referencia_externa,
    )


def registrar_movimentacao_em_transacao(
    con,
    *,
    produto_id,
    tipo,
    quantidade,
    motivo,
    origem="manual",
    referencia_externa=None,
):
    """
    Registra uma movimentação dentro de uma transação existente.

    O chamador deve iniciar a transação com BEGIN IMMEDIATE
    e será responsável pelo commit ou rollback externo.

    Um SAVEPOINT protege a operação para permitir que o chamador
    trate uma falha sem perder outras operações da transação.
    """

    if not con.in_transaction:
        raise RuntimeError(
            "A conexão precisa possuir uma transação ativa."
        )

    (
        tipo,
        quantidade,
        motivo,
        origem,
        referencia_externa,
    ) = _validar_dados(
        produto_id,
        tipo,
        quantidade,
        motivo,
        origem,
        referencia_externa,
    )

    savepoint = "sp_movimentacao_estoque"
    con.execute(f"SAVEPOINT {savepoint}")

    try:
        produto = con.execute(
            """
            SELECT p.id, p.ativo, e.quantidade_atual
            FROM produtos p
            LEFT JOIN estoque e ON e.produto_id = p.id
            WHERE p.id = ?
            """,
            (produto_id,),
        ).fetchone()

        if produto is None:
            raise ProdutoNaoEncontradoError(
                "Produto não encontrado."
            )

        if not produto["ativo"]:
            raise ProdutoInativoError(
                "Não é permitido movimentar estoque de um produto inativo."
            )

        if produto["quantidade_atual"] is None:
            raise EstoqueNaoEncontradoError(
                "Produto não possui registro de estoque."
            )

        saldo_anterior = produto["quantidade_atual"]

        if referencia_externa is not None:
            existente = con.execute(
                """
                SELECT id
                FROM movimentacoes_estoque
                WHERE origem = ?
                  AND referencia_externa = ?
                """,
                (origem, referencia_externa),
            ).fetchone()

            if existente is not None:
                raise ReferenciaExternaDuplicadaError(
                    "Referência externa já utilizada."
                )

        if tipo == "ENTRADA":
            saldo_novo = saldo_anterior + quantidade

        elif tipo == "SAIDA":
            if quantidade > saldo_anterior:
                raise SaldoInsuficienteError(
                    "Saldo insuficiente para realizar a saída."
                )

            saldo_novo = saldo_anterior - quantidade

        else:
            # AJUSTE representa o saldo final desejado.
            saldo_novo = quantidade

        quantidade_movimentada = abs(
            saldo_novo - saldo_anterior
        )

        atualizado = con.execute(
            """
            UPDATE estoque
            SET quantidade_atual = ?,
                atualizado_em = strftime(
                    '%Y-%m-%dT%H:%M:%fZ', 'now'
                )
            WHERE produto_id = ?
              AND quantidade_atual = ?
            """,
            (saldo_novo, produto_id, saldo_anterior),
        )

        if atualizado.rowcount != 1:
            raise MovimentacaoConcorrenteError(
                "Não foi possível confirmar a atualização do saldo."
            )

        cursor = con.execute(
            """
            INSERT INTO movimentacoes_estoque (
                produto_id,
                tipo,
                quantidade_anterior,
                quantidade_nova,
                quantidade_movimentada,
                motivo,
                origem,
                referencia_externa
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                produto_id,
                tipo,
                saldo_anterior,
                saldo_novo,
                quantidade_movimentada,
                motivo,
                origem,
                referencia_externa,
            ),
        )

        movimentacao = con.execute(
            """
            SELECT
                id,
                produto_id,
                tipo,
                quantidade_anterior,
                quantidade_nova,
                quantidade_movimentada,
                motivo,
                origem,
                referencia_externa,
                criado_em
            FROM movimentacoes_estoque
            WHERE id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()

        con.execute(f"RELEASE SAVEPOINT {savepoint}")

        return dict(movimentacao)

    except Exception as erro:
        con.execute(f"ROLLBACK TO SAVEPOINT {savepoint}")
        con.execute(f"RELEASE SAVEPOINT {savepoint}")

        if (
            isinstance(erro, sqlite3.IntegrityError)
            and referencia_externa is not None
            and "UNIQUE constraint failed" in str(erro)
            and "movimentacoes_estoque.origem" in str(erro)
        ):
            raise ReferenciaExternaDuplicadaError(
                "Referência externa já utilizada."
            ) from erro

        raise


def movimentar_estoque(
    *,
    produto_id,
    tipo,
    quantidade,
    motivo,
    origem="manual",
    referencia_externa=None,
    db_path=None,
):
    """
    Executa uma movimentação completa com transação própria.
    """

    con = connect(path=db_path)

    try:
        con.execute("BEGIN IMMEDIATE")

        resultado = registrar_movimentacao_em_transacao(
            con,
            produto_id=produto_id,
            tipo=tipo,
            quantidade=quantidade,
            motivo=motivo,
            origem=origem,
            referencia_externa=referencia_externa,
        )

        con.commit()
        return resultado

    except Exception:
        con.rollback()
        raise

    finally:
        con.close()
