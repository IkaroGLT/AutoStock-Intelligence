
from fastapi import FastAPI
from app.auth.router import router as auth_router

app = FastAPI(
    title="AutoStock Intelligence API",
    description="API de gerenciamento inteligente de estoque",
    version="0.1.0",
)

app.include_router(auth_router)


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "service": "autostock-api",
        "version": "0.1.0",
    }
