
"""Funções de segurança para autenticação do AutoStock Intelligence."""

import os
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash


password_hasher = PasswordHash.recommended()

JWT_ALGORITHM = "HS256"
JWT_ISSUER = "autostock-api"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def get_jwt_secret() -> str:
    """Obtém a chave secreta JWT das variáveis de ambiente."""

    secret = os.getenv("AUTOSTOCK_JWT_SECRET")

    if not secret:
        raise RuntimeError(
            "A variável AUTOSTOCK_JWT_SECRET não foi configurada."
        )

    if len(secret.encode("utf-8")) < 32:
        raise RuntimeError(
            "AUTOSTOCK_JWT_SECRET deve possuir pelo menos 32 bytes."
        )

    return secret


def hash_password(password: str) -> str:
    """Gera um hash seguro para armazenar a senha."""

    if not password:
        raise ValueError("A senha não pode ser vazia.")

    return password_hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verifica se a senha corresponde ao hash armazenado."""

    if not password or not hashed_password:
        return False

    return password_hasher.verify(password, hashed_password)


def create_access_token(
    user_id: int | str,
    expires_delta: timedelta | None = None,
) -> str:
    """Cria um token JWT de acesso."""

    if user_id is None or not str(user_id).strip():
        raise ValueError("O identificador do usuário é obrigatório.")

    now = datetime.now(timezone.utc)

    expiration = now + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    payload = {
        "sub": str(user_id),
        "iss": JWT_ISSUER,
        "iat": now,
        "exp": expiration,
        "type": "access",
    }

    return jwt.encode(
        payload,
        get_jwt_secret(),
        algorithm=JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> dict:
    """Valida e decodifica um token JWT."""

    payload = jwt.decode(
        token,
        get_jwt_secret(),
        algorithms=[JWT_ALGORITHM],
        issuer=JWT_ISSUER,
        options={
            "require": ["sub", "iss", "iat", "exp", "type"],
        },
    )

    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Tipo de token inválido.")

    return payload
