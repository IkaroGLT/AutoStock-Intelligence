"""Serviço de autenticação do AutoStock Intelligence."""

from app.auth.repository import get_user_by_email
from app.auth.security import (
    create_access_token,
    verify_password,
)


def authenticate_user(email: str, password: str):
    """Valida as credenciais e retorna os dados do usuário autenticado."""

    if not email or not password:
        return None

    usuario = get_user_by_email(email)

    if usuario is None:
        return None

    if not usuario["ativo"]:
        return None

    if not verify_password(password, usuario["senha_hash"]):
        return None

    token = create_access_token(usuario["id"])

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": usuario["id"],
            "nome": usuario["nome"],
            "email": usuario["email"],
            "papel": usuario["papel"],
        },
    }