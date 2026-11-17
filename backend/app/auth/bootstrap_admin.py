
"""Criação segura do primeiro administrador do AutoStock Intelligence."""

import getpass
import sqlite3

from app.auth.security import hash_password
from app.db.connection import connect


def create_first_admin(nome: str, email: str, password: str):
    """Cria o primeiro ADMIN somente quando não existem usuários."""

    nome = nome.strip()
    email = email.strip()

    if not nome:
        raise ValueError("O nome é obrigatório.")

    if not email:
        raise ValueError("O e-mail é obrigatório.")

    if len(password) < 12:
        raise ValueError("A senha deve ter pelo menos 12 caracteres.")

    senha_hash = hash_password(password)
    con = connect()

    try:
        con.execute("BEGIN IMMEDIATE")

        quantidade = con.execute(
            "SELECT COUNT(*) FROM usuarios"
        ).fetchone()[0]

        if quantidade > 0:
            raise RuntimeError(
                "Já existem usuários cadastrados. "
                "O primeiro ADMIN não pode ser criado novamente."
            )

        cursor = con.execute(
            """
            INSERT INTO usuarios (nome, email, senha_hash, papel)
            VALUES (?, ?, ?, 'ADMIN')
            """,
            (nome, email, senha_hash),
        )

        usuario = con.execute(
            """
            SELECT id, nome, email, papel, ativo, criado_em
            FROM usuarios
            WHERE id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()

        con.commit()
        return usuario

    except Exception:
        con.rollback()
        raise

    finally:
        con.close()


def main():
    print("\n=== AutoStock Intelligence ===")
    print("Configuração do primeiro administrador\n")

    nome = input("Nome do administrador: ").strip()
    email = input("E-mail do administrador: ").strip()

    senha = getpass.getpass("Crie uma senha (mínimo 12 caracteres): ")
    confirmacao = getpass.getpass("Confirme a senha: ")

    if senha != confirmacao:
        print("\nErro: as senhas não coincidem.")
        return

    try:
        usuario = create_first_admin(nome, email, senha)

        print("\nPrimeiro administrador criado com sucesso!")
        print(f"ID: {usuario['id']}")
        print(f"Nome: {usuario['nome']}")
        print(f"E-mail: {usuario['email']}")
        print(f"Papel: {usuario['papel']}")

    except (ValueError, RuntimeError, sqlite3.IntegrityError) as erro:
        print(f"\nNão foi possível criar o administrador: {erro}")


if __name__ == "__main__":
    main()
