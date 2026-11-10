PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS produtos (
 id INTEGER PRIMARY KEY,
 sku TEXT NOT NULL UNIQUE CHECK(length(trim(sku)) > 0),
 ean TEXT UNIQUE CHECK(ean IS NULL OR length(trim(ean)) > 0),
 nome TEXT NOT NULL CHECK(length(trim(nome)) > 0),
 categoria TEXT NOT NULL CHECK(length(trim(categoria)) > 0),
 descricao TEXT,
 preco_custo_centavos INTEGER NOT NULL DEFAULT 0 CHECK(preco_custo_centavos >= 0),
 preco_venda_centavos INTEGER NOT NULL DEFAULT 0 CHECK(preco_venda_centavos >= 0),
 ativo INTEGER NOT NULL DEFAULT 1 CHECK(ativo IN (0,1)),
 criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 atualizado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS estoque (
 id INTEGER PRIMARY KEY,
 produto_id INTEGER NOT NULL UNIQUE REFERENCES produtos(id) ON DELETE RESTRICT,
 quantidade_atual INTEGER NOT NULL DEFAULT 0 CHECK(quantidade_atual >= 0),
 estoque_minimo INTEGER NOT NULL DEFAULT 0 CHECK(estoque_minimo >= 0),
 atualizado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
 id INTEGER PRIMARY KEY,
 produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
 tipo TEXT NOT NULL CHECK(tipo IN ('ENTRADA','SAIDA','AJUSTE')),
 quantidade_anterior INTEGER NOT NULL CHECK(quantidade_anterior >= 0),
 quantidade_nova INTEGER NOT NULL CHECK(quantidade_nova >= 0),
 quantidade_movimentada INTEGER NOT NULL CHECK(quantidade_movimentada >= 0),
 motivo TEXT NOT NULL CHECK(length(trim(motivo)) > 0),
 origem TEXT NOT NULL CHECK(length(trim(origem)) > 0),
 referencia_externa TEXT,
 criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 CHECK(quantidade_movimentada = abs(quantidade_nova - quantidade_anterior)),
 CHECK(tipo = 'AJUSTE' OR (tipo = 'ENTRADA' AND quantidade_nova > quantidade_anterior) OR (tipo = 'SAIDA' AND quantidade_nova < quantidade_anterior))
);
CREATE INDEX IF NOT EXISTS idx_mov_produto_data ON movimentacoes_estoque(produto_id, criado_em);
CREATE UNIQUE INDEX IF NOT EXISTS ux_mov_referencia ON movimentacoes_estoque(origem, referencia_externa) WHERE referencia_externa IS NOT NULL;

CREATE TABLE IF NOT EXISTS eventos_webhook (
 id INTEGER PRIMARY KEY,
 origem TEXT NOT NULL CHECK(length(trim(origem)) > 0),
 evento_id TEXT NOT NULL CHECK(length(trim(evento_id)) > 0),
 tipo_evento TEXT NOT NULL CHECK(length(trim(tipo_evento)) > 0),
 payload TEXT NOT NULL CHECK(json_valid(payload)),
 status TEXT NOT NULL DEFAULT 'RECEBIDO' CHECK(status IN ('RECEBIDO','PROCESSADO','ERRO')),
 recebido_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 processado_em TEXT,
 mensagem_erro TEXT,
 UNIQUE(origem, evento_id),
 CHECK(status <> 'PROCESSADO' OR processado_em IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_webhook_status ON eventos_webhook(status, recebido_em);

CREATE TABLE IF NOT EXISTS sincronizacoes (
 id INTEGER PRIMARY KEY,
 tipo TEXT NOT NULL CHECK(tipo IN ('CSV','EXCEL','API')),
 arquivo_nome TEXT,
 status TEXT NOT NULL DEFAULT 'EM_ANDAMENTO' CHECK(status IN ('EM_ANDAMENTO','CONCLUIDA','ERRO')),
 total_lidos INTEGER NOT NULL DEFAULT 0 CHECK(total_lidos >= 0),
 total_criados INTEGER NOT NULL DEFAULT 0 CHECK(total_criados >= 0),
 total_atualizados INTEGER NOT NULL DEFAULT 0 CHECK(total_atualizados >= 0),
 total_erros INTEGER NOT NULL DEFAULT 0 CHECK(total_erros >= 0),
 iniciada_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 finalizada_em TEXT,
 detalhes_erro TEXT,
 CHECK(status = 'EM_ANDAMENTO' OR finalizada_em IS NOT NULL)
);

-- Saldos só podem mudar por operações que registrem histórico na mesma transação.
-- A camada de operações deve cumprir esse contrato.
-- Bloqueia exclusões de registros de auditoria.
CREATE TRIGGER IF NOT EXISTS bloquear_delete_mov BEFORE DELETE ON movimentacoes_estoque BEGIN SELECT RAISE(ABORT, 'historico imutavel'); END;
CREATE TRIGGER IF NOT EXISTS bloquear_update_mov BEFORE UPDATE ON movimentacoes_estoque BEGIN SELECT RAISE(ABORT, 'historico imutavel'); END;
CREATE TRIGGER IF NOT EXISTS bloquear_delete_webhook BEFORE DELETE ON eventos_webhook BEGIN SELECT RAISE(ABORT, 'eventos nao podem ser excluidos'); END;