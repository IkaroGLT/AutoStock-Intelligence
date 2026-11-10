
"""Inicializacao e verificacao do banco SQLite."""

import argparse
import sqlite3
from pathlib import Path

from app.db.config import get_database_path

SCHEMA = Path(__file__).with_name("schema.sql")


def connect(path):
    db_path = Path(path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(path, timeout=10)

    con.execute("PRAGMA foreign_keys = ON")
    con.execute("PRAGMA busy_timeout = 10000")
    con.execute("PRAGMA journal_mode = WAL")

    return con


def initialize(path):
    con = connect(path)

    try:
        schema_sql = SCHEMA.read_text(
            encoding="utf-8"
        )

        con.executescript(schema_sql)

        result = con.execute(
            "PRAGMA integrity_check"
        ).fetchone()[0]

        if result != "ok":
            raise RuntimeError(
                f"Falha de integridade: {result}"
            )

        con.commit()

    finally:
        con.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--db",
        default=str(get_database_path())
    )

    args = parser.parse_args()

    initialize(args.db)

    print(
        f"Banco inicializado e validado: {args.db}"
    )
