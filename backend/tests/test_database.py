
import sqlite3

from app.db.init_db import initialize


def test_database_initialization(tmp_path):
    db_path = tmp_path / "autostock_test.db"

    # Inicializa duas vezes para verificar
    # que o esquema pode ser reaplicado.
    initialize(db_path)
    initialize(db_path)

    con = sqlite3.connect(db_path)

    try:
        rows = con.execute(
            """
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
            AND name NOT LIKE 'sqlite_%'
            """
        ).fetchall()

        tables = {row[0] for row in rows}

        expected = {
            "produtos",
            "estoque",
            "movimentacoes_estoque",
            "eventos_webhook",
            "sincronizacoes",
        }

        assert tables == expected

        integrity = con.execute(
            "PRAGMA integrity_check"
        ).fetchone()[0]

        assert integrity == "ok"

        foreign_keys = con.execute(
            "PRAGMA foreign_key_check"
        ).fetchall()

        assert foreign_keys == []

    finally:
        con.close()
