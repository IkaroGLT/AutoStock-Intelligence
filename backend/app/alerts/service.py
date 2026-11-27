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


def resumo_semanal_excecoes():
    """Resume falhas operacionais registradas nos últimos 7 dias."""
    con = connect()
    try:
        webhooks = con.execute(
            """
            SELECT id, origem, evento_id, tipo_evento, recebido_em, mensagem_erro
            FROM eventos_webhook
            WHERE status = 'ERRO'
              AND recebido_em >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-7 days')
            ORDER BY recebido_em DESC
            """
        ).fetchall()

        sincronizacoes = con.execute(
            """
            SELECT id, tipo, arquivo_nome, status, total_erros,
                   iniciada_em, finalizada_em, detalhes_erro
            FROM sincronizacoes
            WHERE (status = 'ERRO' OR total_erros > 0)
              AND iniciada_em >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-7 days')
            ORDER BY iniciada_em DESC
            """
        ).fetchall()

        return {
            "periodo_dias": 7,
            "total_webhooks_com_erro": len(webhooks),
            "total_sincronizacoes_com_erro": len(sincronizacoes),
            "webhooks": [dict(registro) for registro in webhooks],
            "sincronizacoes": [dict(registro) for registro in sincronizacoes],
        }
    finally:
        con.close()
