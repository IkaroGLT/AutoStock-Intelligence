
"""Recebimento autenticado e processamento de eventos externos."""

import json
import sqlite3
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.db.connection import connect
from app.stock.service import (
    MovimentacaoError,
    ProdutoNaoEncontradoError,
    registrar_movimentacao_em_transacao,
)
from app.webhooks.security import require_webhook_token


router = APIRouter(
    prefix="/webhooks",
    tags=["Webhooks"],
)


class WebhookEvent(BaseModel):
    origem: str = Field(min_length=1, max_length=100)
    evento_id: str = Field(min_length=1, max_length=150)
    tipo_evento: str = Field(min_length=1, max_length=100)
    payload: dict[str, Any]


def _json_canonico(dados: dict[str, Any]) -> str:
    """Gera representação estável para comparação de payloads."""
    return json.dumps(
        dados,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )


def _processar_evento(con, evento) -> dict:
    """
    Processa o evento dentro da transação já aberta pelo chamador.

    Erros de negócio são registrados como ERRO.
    Falhas de banco são propagadas para provocar rollback externo.
    """

    try:
        tipo = evento["tipo_evento"].strip().upper()

        if tipo not in {"ENTRADA", "SAIDA"}:
            raise ValueError(
                "O tipo do evento deve ser ENTRADA ou SAIDA."
            )

        payload = json.loads(evento["payload"])

        if not isinstance(payload, dict):
            raise ValueError("O payload deve ser um objeto JSON.")

        sku = payload.get("sku")
        quantidade = payload.get("quantidade")
        motivo = payload.get("motivo")

        if not isinstance(sku, str) or not sku.strip():
            raise ValueError("O SKU do produto é obrigatório.")

        if (
            not isinstance(quantidade, int)
            or isinstance(quantidade, bool)
            or quantidade <= 0
        ):
            raise ValueError(
                "A quantidade deve ser um inteiro positivo."
            )

        if not isinstance(motivo, str) or not motivo.strip():
            raise ValueError("O motivo da movimentação é obrigatório.")

        produto = con.execute(
            """
            SELECT id
            FROM produtos
            WHERE sku = ?
            """,
            (sku.strip(),),
        ).fetchone()

        if produto is None:
            raise ProdutoNaoEncontradoError(
                f"Produto com SKU '{sku.strip()}' não encontrado."
            )

        movimentacao = registrar_movimentacao_em_transacao(
            con,
            produto_id=produto["id"],
            tipo=tipo,
            quantidade=quantidade,
            motivo=motivo.strip(),
            origem=evento["origem"],
            referencia_externa=f"webhook:{evento['evento_id']}",
        )

    except (MovimentacaoError, ValueError, KeyError, TypeError) as erro:
        con.execute(
            """
            UPDATE eventos_webhook
            SET status = 'ERRO',
                processado_em = NULL,
                mensagem_erro = ?
            WHERE id = ?
            """,
            (str(erro), evento["id"]),
        )

        return {
            "status": "ERRO",
            "mensagem_erro": str(erro),
            "movimentacao": None,
        }

    con.execute(
        """
        UPDATE eventos_webhook
        SET status = 'PROCESSADO',
            processado_em = strftime(
                '%Y-%m-%dT%H:%M:%fZ', 'now'
            ),
            mensagem_erro = NULL
        WHERE id = ?
        """,
        (evento["id"],),
    )

    return {
        "status": "PROCESSADO",
        "mensagem_erro": None,
        "movimentacao": movimentacao,
    }


def _obter_evento(con, origem: str, evento_id: str):
    return con.execute(
        """
        SELECT
            id,
            origem,
            evento_id,
            tipo_evento,
            payload,
            status,
            mensagem_erro
        FROM eventos_webhook
        WHERE origem = ? AND evento_id = ?
        """,
        (origem, evento_id),
    ).fetchone()


@router.post(
    "/events",
    dependencies=[Depends(require_webhook_token)],
    status_code=status.HTTP_201_CREATED,
)
def receive_event(event: WebhookEvent):
    """Recebe, valida a identidade e processa um evento externo."""

    origem = event.origem.strip()
    evento_id = event.evento_id.strip()
    tipo_evento = event.tipo_evento.strip().upper()

    if not origem or not evento_id or not tipo_evento:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Origem, identificador e tipo do evento são obrigatórios.",
        )

    payload_json = _json_canonico(event.payload)

    con = None

    try:
        con = connect()
        con.execute("BEGIN IMMEDIATE")

        existente = _obter_evento(con, origem, evento_id)

        if existente is not None:
            payload_existente = _json_canonico(
                json.loads(existente["payload"])
            )

            if (
                existente["tipo_evento"] != tipo_evento
                or payload_existente != payload_json
            ):
                con.rollback()
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "O identificador do evento já foi utilizado "
                        "com conteúdo diferente."
                    ),
                )

            resultado = None

            # Recupera eventos antigos que ainda estejam RECEBIDO.
            if existente["status"] == "RECEBIDO":
                resultado = _processar_evento(con, existente)

            registro = _obter_evento(con, origem, evento_id)
            con.commit()

            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "id": registro["id"],
                    "origem": origem,
                    "evento_id": evento_id,
                    "status": registro["status"],
                    "duplicado": True,
                    "mensagem_erro": registro["mensagem_erro"],
                },
            )

        con.execute(
            """
            INSERT INTO eventos_webhook (
                origem,
                evento_id,
                tipo_evento,
                payload
            )
            VALUES (?, ?, ?, ?)
            """,
            (origem, evento_id, tipo_evento, payload_json),
        )

        registro = _obter_evento(con, origem, evento_id)
        resultado = _processar_evento(con, registro)

        registro = _obter_evento(con, origem, evento_id)
        con.commit()

        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "id": registro["id"],
                "origem": origem,
                "evento_id": evento_id,
                "status": resultado["status"],
                "duplicado": False,
                "mensagem_erro": resultado["mensagem_erro"],
                "movimentacao": resultado["movimentacao"],
            },
        )

    except sqlite3.Error:
        if con is not None:
            con.rollback()

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço de armazenamento de eventos indisponível.",
        )

    finally:
        if con is not None:
            con.close()


@router.post(
    "/events/{origem}/{evento_id}/reprocess",
    dependencies=[Depends(require_webhook_token)],
)
def reprocess_event(origem: str, evento_id: str):
    """Reprocessa manualmente um evento que esteja com status ERRO."""

    origem = origem.strip()
    evento_id = evento_id.strip()

    if not origem or not evento_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Origem e identificador do evento são obrigatórios.",
        )

    con = None

    try:
        con = connect()
        con.execute("BEGIN IMMEDIATE")

        evento = _obter_evento(con, origem, evento_id)

        if evento is None:
            con.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento não encontrado.",
            )

        if evento["status"] != "ERRO":
            con.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Somente eventos com status ERRO podem ser reprocessados.",
            )

        resultado = _processar_evento(con, evento)
        registro = _obter_evento(con, origem, evento_id)

        con.commit()

        return {
            "id": registro["id"],
            "origem": origem,
            "evento_id": evento_id,
            "status": resultado["status"],
            "mensagem_erro": resultado["mensagem_erro"],
            "movimentacao": resultado["movimentacao"],
        }

    except sqlite3.Error:
        if con is not None:
            con.rollback()

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço de armazenamento de eventos indisponível.",
        )

    finally:
        if con is not None:
            con.close()
