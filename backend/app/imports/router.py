
import sqlite3

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
)

from app.auth.permissions import require_permission
from app.imports.service import (
    ErroImportacao,
    LIMITE_ARQUIVO,
    importar_produtos,
    listar_importacoes,
)


router = APIRouter(
    tags=["Importações"],
)


@router.post("/importacoes", status_code=201)
async def importar(
    arquivo: UploadFile = File(...),
    usuario=Depends(require_permission("imports:run")),
):
    nome_arquivo = arquivo.filename or ""

    if not nome_arquivo.lower().endswith((".csv", ".xlsx")):
        raise HTTPException(
            status_code=415,
            detail="Formato aceito: CSV ou XLSX.",
        )

    conteudo = await arquivo.read(LIMITE_ARQUIVO + 1)
    await arquivo.close()

    if len(conteudo) > LIMITE_ARQUIVO:
        raise HTTPException(
            status_code=413,
            detail="Arquivo maior que 5 MB.",
        )

    try:
        return importar_produtos(nome_arquivo, conteudo)

    except ErroImportacao as erro:
        raise HTTPException(
            status_code=422,
            detail=str(erro),
        ) from erro

    except sqlite3.IntegrityError as erro:
        raise HTTPException(
            status_code=409,
            detail=(
                "Importação cancelada sem alterações "
                f"por conflito de integridade: {erro}"
            ),
        ) from erro

@router.get("/importacoes")
def consultar_importacoes(
    limite: int = Query(default=50, ge=1, le=100),
    deslocamento: int = Query(default=0, ge=0),
    usuario=Depends(require_permission("sync:read")),
):
    return listar_importacoes(
        limite=limite,
        deslocamento=deslocamento,
    )
