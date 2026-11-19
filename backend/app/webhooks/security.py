"""Autenticacao independente para integracoes externas via webhook."""

import hmac
import os

from fastapi import Header, HTTPException, status


WEBHOOK_TOKEN_ENV = "AUTOSTOCK_WEBHOOK_TOKEN"
WEBHOOK_TOKEN_HEADER = "X-Webhook-Token"
MIN_WEBHOOK_TOKEN_BYTES = 32


def require_webhook_token(
    token: str | None = Header(default=None, alias=WEBHOOK_TOKEN_HEADER),
) -> None:
    """Exige o token exclusivo da integracao, sem aceitar JWT humano."""

    configured_token = os.getenv(WEBHOOK_TOKEN_ENV)

    if (
        not configured_token
        or len(configured_token.encode("utf-8")) < MIN_WEBHOOK_TOKEN_BYTES
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Autenticacao da integracao indisponivel.",
        )

    if token is None or not hmac.compare_digest(
        token.encode("utf-8"),
        configured_token.encode("utf-8"),
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credencial de integracao invalida.",
            headers={"WWW-Authenticate": "Webhook"},
        )
