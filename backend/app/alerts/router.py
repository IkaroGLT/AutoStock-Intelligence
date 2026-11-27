
from fastapi import APIRouter, Depends

from app.alerts.service import (
    listar_alertas_estoque_baixo,
    resumo_semanal_excecoes,
)
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






@router.get("/resumo-semanal")
def consultar_resumo_semanal(
    usuario=Depends(require_permission("reports:read")),
):
    return resumo_semanal_excecoes()
