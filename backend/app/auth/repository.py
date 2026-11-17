
"""Acesso aos dados dos usuários do AutoStock Intelligence."""

from app.auth.security import hash_password
from app.db.connection import connect


PAPEIS_VALIDOS = {"ADMIN", "OPERADOR"}


class UserNotFoundError(Exception):
    """Indica que o usuário solicitado não existe."""


class LastActiveAdminError(Exception):
    """Indica uma tentativa de remover o último ADMIN ativo."""


def get_user_by_email(email: str):
    """Busca um usuário pelo e-mail, incluindo o hash para autenticação."""

    if not email or not email.strip():
        return None

    con = connect()

    try:
        return con.execute(
            """
            SELECT id, nome, email, senha_hash, papel, ativo,
                   criado_em, atualizado_em
            FROM usuarios
            WHERE email = ?
            """,
            (email.strip(),),
        ).fetchone()
    finally:
        con.close()


def get_user_by_id(user_id: int):
    """Busca um usuário pelo ID sem retornar o hash da senha."""

    if user_id is None:
        return None

    con = connect()

    try:
        return con.execute(
            """
            SELECT id, nome, email, papel, ativo,
                   criado_em, atualizado_em
            FROM usuarios
            WHERE id = ?
            """,
            (user_id,),
        ).fetchone()
    finally:
        con.close()


def list_users():
    """Lista usuários sem expor hashes de senha."""

    con = connect()

    try:
        return con.execute(
            """
            SELECT id, nome, email, papel, ativo,
                   criado_em, atualizado_em
            FROM usuarios
            ORDER BY nome COLLATE NOCASE, id
            """
        ).fetchall()
    finally:
        con.close()


def create_user(nome: str, email: str, password: str, papel: str):
    """Cadastra um usuário com senha protegida por hash."""

    nome = nome.strip() if nome else ""
    email = email.strip() if email else ""
    papel = papel.strip().upper() if papel else ""

    if not nome:
        raise ValueError("O nome do usuário é obrigatório.")

    if not email:
        raise ValueError("O e-mail é obrigatório.")

    if papel not in PAPEIS_VALIDOS:
        raise ValueError("Papel de usuário inválido.")

    senha_hash = hash_password(password)

    con = connect()

    try:
        con.execute("BEGIN IMMEDIATE")

        cursor = con.execute(
            """
            INSERT INTO usuarios (nome, email, senha_hash, papel)
            VALUES (?, ?, ?, ?)
            """,
            (nome, email, senha_hash, papel),
        )

        user_id = cursor.lastrowid

        usuario = con.execute(
            """
            SELECT id, nome, email, papel, ativo,
                   criado_em, atualizado_em
            FROM usuarios
            WHERE id = ?
            """,
            (user_id,),
        ).fetchone()

        con.commit()
        return usuario

    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


def update_user_role(user_id: int, papel: str):
    """Altera o papel sem remover o último ADMIN ativo."""

    papel = papel.strip().upper() if papel else ""

    if papel not in PAPEIS_VALIDOS:
        raise ValueError("Papel de usuário inválido.")

    con = connect()

    try:
        con.execute("BEGIN IMMEDIATE")

        usuario = con.execute(
            """
            SELECT id, papel, ativo
            FROM usuarios
            WHERE id = ?
            """,
            (user_id,),
        ).fetchone()

        if usuario is None:
            raise UserNotFoundError("Usuário não encontrado.")

        if (
            usuario["papel"] == "ADMIN"
            and usuario["ativo"] == 1
            and papel != "ADMIN"
        ):
            quantidade_admins = con.execute(
                """
                SELECT COUNT(*)
                FROM usuarios
                WHERE papel = 'ADMIN' AND ativo = 1
                """
            ).fetchone()[0]

            if quantidade_admins <= 1:
                raise LastActiveAdminError(
                    "Não é possível remover o papel do último ADMIN ativo."
                )

        con.execute(
            """
            UPDATE usuarios
            SET papel = ?,
                atualizado_em = strftime('%Y-%m-%dT%H:%M:%fZ','now')
            WHERE id = ?
            """,
            (papel, user_id),
        )

        atualizado = get_user_by_id_in_transaction(con, user_id)

        con.commit()
        return atualizado

    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


def update_user_status(user_id: int, ativo: bool):
    """Ativa ou desativa um usuário sem remover o último ADMIN ativo."""

    if not isinstance(ativo, bool):
        raise ValueError("O status deve ser verdadeiro ou falso.")

    con = connect()

    try:
        con.execute("BEGIN IMMEDIATE")

        usuario = con.execute(
            """
            SELECT id, papel, ativo
            FROM usuarios
            WHERE id = ?
            """,
            (user_id,),
        ).fetchone()

        if usuario is None:
            raise UserNotFoundError("Usuário não encontrado.")

        if (
            usuario["papel"] == "ADMIN"
            and usuario["ativo"] == 1
            and not ativo
        ):
            quantidade_admins = con.execute(
                """
                SELECT COUNT(*)
                FROM usuarios
                WHERE papel = 'ADMIN' AND ativo = 1
                """
            ).fetchone()[0]

            if quantidade_admins <= 1:
                raise LastActiveAdminError(
                    "Não é possível desativar o último ADMIN ativo."
                )

        con.execute(
            """
            UPDATE usuarios
            SET ativo = ?,
                atualizado_em = strftime('%Y-%m-%dT%H:%M:%fZ','now')
            WHERE id = ?
            """,
            (int(ativo), user_id),
        )

        atualizado = get_user_by_id_in_transaction(con, user_id)

        con.commit()
        return atualizado

    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


def get_user_by_id_in_transaction(con, user_id: int):
    """Busca os dados públicos do usuário usando a conexão existente."""

    return con.execute(
        """
        SELECT id, nome, email, papel, ativo,
               criado_em, atualizado_em
        FROM usuarios
        WHERE id = ?
        """,
        (user_id,),
    ).fetchone()
