
from fastapi import FastAPI

from app.auth.router import router as auth_router
from app.imports.router import router as imports_router
from app.webhooks.router import router as webhook_router
from app.alerts.router import router as alerts_router


app = FastAPI(
    title="AutoStock Intelligence API",
    description="API de gerenciamento inteligente de estoque",
    version="0.1.0",
)

app.include_router(auth_router)
app.include_router(imports_router)
app.include_router(webhook_router)
app.include_router(alerts_router)


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "service": "autostock-api",
        "version": "0.1.0",
    }

