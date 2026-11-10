
from fastapi import FastAPI

app = FastAPI(
    title="AutoStock Intelligence API",
    description="API de gerenciamento inteligente de estoque",
    version="0.1.0",
)


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "service": "autostock-api",
        "version": "0.1.0",
    }
