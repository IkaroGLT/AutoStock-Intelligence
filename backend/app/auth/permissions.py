
"""Controle centralizado de permissões (RBAC) do AutoStock Intelligence."""

from fastapi import Depends, HTTPException

from app.auth.dependencies import get_current_user


# Permissões disponíveis para usuários humanos.
# A autenticação de integrações externas é independente.
ROLE_PERMISSIONS = {
    "ADMIN": frozenset({
        "products:read",
        "products:write",
        "products:commercial:write",
        "stock:movement:create",
        "stock:history:read",
        "stock:correction:create",
        "stock:adjustment:create",
        "imports:run",
        "reports:read",
        "sync:read",
        "users:manage",
    }),

    "OPERADOR": frozenset({
        "products:read",
        "products:write",
        "stock:movement:create",
        "stock:history:read",
        "reports:read",
    }),
}


def has_permission(role: str, permission: str) -> bool:
    """Verifica se determinado papel possui uma permissão."""

    return permission in ROLE_PERMISSIONS.get(role, frozenset())


def require_permission(permission: str):
    """Cria uma dependência para proteger uma rota por permissão."""

    def permission_dependency(
        usuario=Depends(get_current_user),
    ):
        role = usuario["papel"]

        if not has_permission(role, permission):
            raise HTTPException(
                status_code=403,
                detail="Permissão insuficiente.",
            )

        return usuario

    return permission_dependency
