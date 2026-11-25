"""Gerenciamento de conexões com o banco SQLite."""

import sqlite3

from app.db.config import get_database_path


def connect(path=None):
    """Abre uma conexão SQLite com as configurações do projeto."""

    db_path = get_database_path() if path is None else path
    db_path = str(db_path)

    con = sqlite3.connect(
        db_path,
        timeout=10,
    )

    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    con.execute("PRAGMA busy_timeout = 10000")
    con.execute("PRAGMA journal_mode = WAL")

    return con