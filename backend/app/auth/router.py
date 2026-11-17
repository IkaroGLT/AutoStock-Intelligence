
"""Rotas de autenticação e gerenciamento de usuários do AutoStock Intelligence."""

import sqlite3
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.auth.service import authenticate_user
from app.auth.dependencies import get_current_user
from app.auth.permissions import require_permission

from app.auth.repository import (
    create_user,
    list_users,
    update_user_role,
    update_user_status,
    UserNotFoundError,
    LastActiveAdminError,
)


router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"],
)


# =========================================================
# MODELOS DE REQUISIÇÃO
# =========================================================

class LoginRequest(BaseModel):
    email: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=128)


class CreateUserRequest(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=8, max_length=128)
    papel: Literal["ADMIN", "OPERADOR"]


class UpdateRoleRequest(BaseModel):
    papel: Literal["ADMIN", "OPERADOR"]


class UpdateStatusRequest(BaseModel):
    ativo: bool


# =========================================================
# AUTENTICAÇÃO
# =========================================================

@router.post("/login")
def login(dados: LoginRequest):
    """Autentica o usuário e retorna um token JWT."""

    resultado = authenticate_user(
        dados.email,
        dados.password,
    )

    if resultado is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return resultado


@router.get("/me")
def get_me(usuario=Depends(get_current_user)):
    """Retorna os dados do usuário autenticado."""

    return {
        "id": usuario["id"],
        "nome": usuario["nome"],
        "email": usuario["email"],
        "papel": usuario["papel"],
    }


# =========================================================
# GERENCIAMENTO DE USUÁRIOS - ADMIN
# =========================================================

@router.get("/users")
def get_users(
    usuario=Depends(require_permission("users:manage")),
):
    """Lista os usuários cadastrados."""

    return [
        dict(user)
        for user in list_users()
    ]


@router.post("/users", status_code=status.HTTP_201_CREATED)
def post_user(
    dados: CreateUserRequest,
    usuario=Depends(require_permission("users:manage")),
):
    """Cria um novo usuário."""

    try:
        novo_usuario = create_user(
            nome=dados.nome,
            email=dados.email,
            password=dados.password,
            papel=dados.papel,
        )

        return dict(novo_usuario)

    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um usuário com esse e-mail.",
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(erro),
        )


@router.patch("/users/{user_id}/role")
def patch_user_role(
    user_id: int,
    dados: UpdateRoleRequest,
    usuario=Depends(require_permission("users:manage")),
):
    """Altera o papel de um usuário."""

    try:
        usuario_atualizado = update_user_role(
            user_id=user_id,
            papel=dados.papel,
        )

        return dict(usuario_atualizado)

    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )

    except LastActiveAdminError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não é possível rebaixar o último ADMIN ativo.",
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(erro),
        )


@router.patch("/users/{user_id}/status")
def patch_user_status(
    user_id: int,
    dados: UpdateStatusRequest,
    usuario=Depends(require_permission("users:manage")),
):
    """Ativa ou desativa um usuário."""

    try:
        usuario_atualizado = update_user_status(
            user_id=user_id,
            ativo=dados.ativo,
        )

        return dict(usuario_atualizado)

    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )

    except LastActiveAdminError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não é possível desativar o último ADMIN ativo.",
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(erro),
        )
