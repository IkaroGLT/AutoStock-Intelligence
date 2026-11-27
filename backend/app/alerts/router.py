from fastapi import APIRouter, Depends

from app.alerts.service import listar_alertas_estoque_baixo
from app.auth.permissions import require_permission


router = APIRouter(
    prefix="/alertas",
    tags=["Alertas"],
)


@router.get("/estoque-baixo")
def consultar_estoque_baixo(
    usuario=Depends(require_permission("products:read")),
):
    return listar_alertas_estoque_baixo()
