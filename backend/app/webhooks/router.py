"""Recebimento autenticado de eventos externos."""

import json
import sqlite3
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.db.connection import connect
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


@router.post(
    "/events",
    dependencies=[Depends(require_webhook_token)],
    status_code=status.HTTP_201_CREATED,
)
def receive_event(event: WebhookEvent):
    """Registra um evento externo sem duplicar sua origem e identificador."""

    origem = event.origem.strip()
    evento_id = event.evento_id.strip()
    tipo_evento = event.tipo_evento.strip()

    if not origem or not evento_id or not tipo_evento:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Origem, identificador e tipo do evento são obrigatórios.",
        )

    payload_json = json.dumps(
        event.payload,
        ensure_ascii=False,
        separators=(",", ":"),
    )

    con = None

    try:
        con = connect()

        cursor = con.execute(
            """
            INSERT OR IGNORE INTO eventos_webhook
                (origem, evento_id, tipo_evento, payload)
            VALUES (?, ?, ?, ?)
            """,
            (origem, evento_id, tipo_evento, payload_json),
        )

        criado = cursor.rowcount == 1

        registro = con.execute(
            """
            SELECT id, status
            FROM eventos_webhook
            WHERE origem = ? AND evento_id = ?
            """,
            (origem, evento_id),
        ).fetchone()

        if registro is None:
            con.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Não foi possível registrar o evento.",
            )

        con.commit()

        return JSONResponse(
            status_code=(
                status.HTTP_201_CREATED
                if criado
                else status.HTTP_200_OK
            ),
            content={
                "id": registro["id"],
                "origem": origem,
                "evento_id": evento_id,
                "status": registro["status"],
                "duplicado": not criado,
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
