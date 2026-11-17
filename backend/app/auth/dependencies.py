
"""Dependências de autenticação e proteção de rotas."""

import jwt

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.repository import get_user_by_id
from app.auth.security import decode_access_token


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """Identifica e valida o usuário autenticado pelo token JWT."""

    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Autenticação obrigatória.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido ou expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    subject = payload.get("sub")

    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Token inválido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    usuario = get_user_by_id(user_id)

    if usuario is None or not usuario["ativo"]:
        raise HTTPException(
            status_code=401,
            detail="Usuário inexistente ou inativo.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return usuario
