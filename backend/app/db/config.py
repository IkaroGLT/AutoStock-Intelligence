
"""Configuracoes de acesso ao banco de dados."""

import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[2]


def get_database_path() -> Path:
    configured = os.getenv("AUTOSTOCK_DB_PATH")

    path = Path(
        configured or "data/autostock.db"
    )

    if not path.is_absolute():
        path = BACKEND_DIR / path

    return path.resolve()
