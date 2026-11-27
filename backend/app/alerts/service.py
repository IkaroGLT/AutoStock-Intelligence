from app.db.connection import connect


def listar_alertas_estoque_baixo():
    """Lista produtos ativos cuja quantidade está no mínimo ou abaixo dele."""

    con = connect()
    try:
        linhas = con.execute(
            """
            SELECT
                p.id AS produto_id,
                p.sku,
                p.nome,
                e.quantidade_atual,
                e.estoque_minimo
            FROM produtos p
            JOIN estoque e ON e.produto_id = p.id
            WHERE p.ativo = 1
              AND e.quantidade_atual <= e.estoque_minimo
            ORDER BY
                (e.estoque_minimo - e.quantidade_atual) DESC,
                p.nome COLLATE NOCASE
            """
        ).fetchall()

        return [dict(linha) for linha in linhas]
    finally:
        con.close()
