
"""Testes de autenticação e autorização RBAC."""

import pytest

from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.auth.router import router as auth_router
from app.auth.permissions import require_permission
from app.auth.security import create_access_token
from app.db.init_db import initialize

from app.auth.repository import (
    create_user,
    list_users,
    update_user_role,
    update_user_status,
    LastActiveAdminError,
)


@pytest.fixture
def client(tmp_path, monkeypatch):
    """Prepara uma API e um banco SQLite temporário para os testes."""

    db_path = tmp_path / "autostock_test.db"

    monkeypatch.setenv(
        "AUTOSTOCK_DB_PATH",
        str(db_path),
    )

    monkeypatch.setenv(
        "AUTOSTOCK_JWT_SECRET",
        "chave-temporaria-de-teste-com-mais-de-32-bytes",
    )

    initialize(db_path)

    admin = create_user(
        nome="Administrador Teste",
        email="admin@teste.local",
        password="SenhaAdmin123!",
        papel="ADMIN",
    )

    operador = create_user(
        nome="Operador Teste",
        email="operador@teste.local",
        password="SenhaOperador123!",
        papel="OPERADOR",
    )

    app = FastAPI()

    # Registra as rotas reais de autenticação e usuários.
    app.include_router(auth_router)

    @app.get("/teste/correcao")
    def testar_correcao(
        usuario=Depends(
            require_permission("stock:correction:create")
        ),
    ):
        return {
            "mensagem": "Acesso autorizado",
            "papel": usuario["papel"],
        }

    test_client = TestClient(app)

    return {
        "client": test_client,
        "admin": admin,
        "operador": operador,
    }


def obter_headers(usuario):
    """Gera o cabeçalho de autenticação de um usuário."""

    token = create_access_token(usuario["id"])

    return {
        "Authorization": f"Bearer {token}"
    }


# =========================================================
# TESTES DE AUTORIZAÇÃO RBAC
# =========================================================

def test_admin_pode_corrigir_estoque(client):
    """ADMIN deve conseguir acessar a rota de correção."""

    response = client["client"].get(
        "/teste/correcao",
        headers=obter_headers(client["admin"]),
    )

    assert response.status_code == 200
    assert response.json()["papel"] == "ADMIN"


def test_operador_nao_pode_corrigir_estoque(client):
    """OPERADOR deve receber 403 ao acessar a rota de correção."""

    response = client["client"].get(
        "/teste/correcao",
        headers=obter_headers(client["operador"]),
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Permissão insuficiente."


def test_usuario_sem_token_nao_pode_acessar(client):
    """Requisições sem autenticação devem receber 401."""

    response = client["client"].get(
        "/teste/correcao"
    )

    assert response.status_code == 401


# =========================================================
# TESTES DE LISTAGEM E PROTEÇÃO DE DADOS
# =========================================================

def test_list_users_nao_expoe_hash_da_senha(client):
    """A listagem do repositório não deve retornar hashes de senha."""

    usuarios = list_users()

    assert len(usuarios) == 2

    for usuario in usuarios:
        assert "senha_hash" not in usuario.keys()


def test_admin_pode_listar_usuarios_pela_api(client):
    """ADMIN deve conseguir listar usuários pela API."""

    response = client["client"].get(
        "/auth/users",
        headers=obter_headers(client["admin"]),
    )

    assert response.status_code == 200
    assert len(response.json()) == 2

    for usuario in response.json():
        assert "senha_hash" not in usuario


def test_operador_nao_pode_listar_usuarios(client):
    """OPERADOR não pode acessar o gerenciamento de usuários."""

    response = client["client"].get(
        "/auth/users",
        headers=obter_headers(client["operador"]),
    )

    assert response.status_code == 403


def test_usuario_sem_token_nao_pode_listar_usuarios(client):
    """A listagem deve exigir autenticação."""

    response = client["client"].get(
        "/auth/users"
    )

    assert response.status_code == 401


# =========================================================
# TESTES DE CRIAÇÃO DE USUÁRIOS
# =========================================================

def test_admin_pode_criar_usuario(client):
    """ADMIN deve conseguir cadastrar um novo usuário."""

    response = client["client"].post(
        "/auth/users",
        headers=obter_headers(client["admin"]),
        json={
            "nome": "Novo Operador",
            "email": "novo@teste.local",
            "password": "SenhaNova123!",
            "papel": "OPERADOR",
        },
    )

    assert response.status_code == 201
    assert response.json()["nome"] == "Novo Operador"
    assert response.json()["email"] == "novo@teste.local"
    assert response.json()["papel"] == "OPERADOR"
    assert "senha_hash" not in response.json()


def test_operador_nao_pode_criar_usuario(client):
    """OPERADOR não pode cadastrar outros usuários."""

    response = client["client"].post(
        "/auth/users",
        headers=obter_headers(client["operador"]),
        json={
            "nome": "Outro Operador",
            "email": "outro@teste.local",
            "password": "SenhaNova123!",
            "papel": "OPERADOR",
        },
    )

    assert response.status_code == 403


def test_nao_pode_criar_usuario_com_email_duplicado(client):
    """O cadastro deve rejeitar e-mails já existentes."""

    response = client["client"].post(
        "/auth/users",
        headers=obter_headers(client["admin"]),
        json={
            "nome": "Administrador Duplicado",
            "email": "admin@teste.local",
            "password": "SenhaNova123!",
            "papel": "OPERADOR",
        },
    )

    assert response.status_code == 409


def test_nao_pode_criar_usuario_com_senha_curta(client):
    """A senha deve possuir pelo menos oito caracteres."""

    response = client["client"].post(
        "/auth/users",
        headers=obter_headers(client["admin"]),
        json={
            "nome": "Usuário Inválido",
            "email": "invalido@teste.local",
            "password": "123",
            "papel": "OPERADOR",
        },
    )

    assert response.status_code == 422


# =========================================================
# TESTES DE ALTERAÇÃO DE PAPEL
# =========================================================

def test_admin_pode_alterar_papel_de_usuario(client):
    """Deve ser possível alterar o papel de um usuário."""

    usuario = update_user_role(
        client["operador"]["id"],
        "ADMIN",
    )

    assert usuario["papel"] == "ADMIN"


def test_admin_pode_alterar_papel_pela_api(client):
    """ADMIN deve conseguir alterar o papel pela API."""

    response = client["client"].patch(
        f"/auth/users/{client['operador']['id']}/role",
        headers=obter_headers(client["admin"]),
        json={
            "papel": "ADMIN",
        },
    )

    assert response.status_code == 200
    assert response.json()["papel"] == "ADMIN"


def test_operador_nao_pode_alterar_papel(client):
    """OPERADOR não pode alterar o papel de outros usuários."""

    response = client["client"].patch(
        f"/auth/users/{client['admin']['id']}/role",
        headers=obter_headers(client["operador"]),
        json={
            "papel": "OPERADOR",
        },
    )

    assert response.status_code == 403


def test_nao_pode_rebaixar_ultimo_admin_ativo(client):
    """O último ADMIN ativo não pode virar OPERADOR."""

    with pytest.raises(LastActiveAdminError):
        update_user_role(
            client["admin"]["id"],
            "OPERADOR",
        )


def test_api_nao_pode_rebaixar_ultimo_admin_ativo(client):
    """A API deve impedir o rebaixamento do último ADMIN."""

    response = client["client"].patch(
        f"/auth/users/{client['admin']['id']}/role",
        headers=obter_headers(client["admin"]),
        json={
            "papel": "OPERADOR",
        },
    )

    assert response.status_code == 409


def test_nao_pode_alterar_papel_para_valor_invalido(client):
    """Somente ADMIN e OPERADOR são papéis permitidos."""

    with pytest.raises(ValueError):
        update_user_role(
            client["operador"]["id"],
            "GERENTE",
        )


# =========================================================
# TESTES DE ATIVAÇÃO E DESATIVAÇÃO
# =========================================================

def test_admin_pode_desativar_e_ativar_usuario(client):
    """Deve ser possível desativar e reativar uma conta."""

    user_id = client["operador"]["id"]

    desativado = update_user_status(user_id, False)
    assert desativado["ativo"] == 0

    ativado = update_user_status(user_id, True)
    assert ativado["ativo"] == 1


def test_admin_pode_alterar_status_pela_api(client):
    """ADMIN deve conseguir desativar e ativar um usuário pela API."""

    user_id = client["operador"]["id"]
    headers = obter_headers(client["admin"])

    response = client["client"].patch(
        f"/auth/users/{user_id}/status",
        headers=headers,
        json={
            "ativo": False,
        },
    )

    assert response.status_code == 200
    assert response.json()["ativo"] == 0

    response = client["client"].patch(
        f"/auth/users/{user_id}/status",
        headers=headers,
        json={
            "ativo": True,
        },
    )

    assert response.status_code == 200
    assert response.json()["ativo"] == 1


def test_operador_nao_pode_alterar_status(client):
    """OPERADOR não pode ativar ou desativar usuários."""

    response = client["client"].patch(
        f"/auth/users/{client['admin']['id']}/status",
        headers=obter_headers(client["operador"]),
        json={
            "ativo": False,
        },
    )

    assert response.status_code == 403


def test_nao_pode_desativar_ultimo_admin_ativo(client):
    """O sistema deve preservar pelo menos um ADMIN ativo."""

    with pytest.raises(LastActiveAdminError):
        update_user_status(
            client["admin"]["id"],
            False,
        )


def test_api_nao_pode_desativar_ultimo_admin_ativo(client):
    """A API deve impedir a desativação do último ADMIN."""

    response = client["client"].patch(
        f"/auth/users/{client['admin']['id']}/status",
        headers=obter_headers(client["admin"]),
        json={
            "ativo": False,
        },
    )

    assert response.status_code == 409

# =========================================================
# TESTES DE LOGIN E VALIDACAO DE TOKENS
# =========================================================

def test_login_com_credenciais_validas(client):
    response = client["client"].post(
        "/auth/login",
        json={
            "email": "admin@teste.local",
            "password": "SenhaAdmin123!",
        },
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]
    assert response.json()["user"]["papel"] == "ADMIN"


@pytest.mark.parametrize(
    "email,password",
    [
        ("admin@teste.local", "SenhaErrada123!"),
        ("inexistente@teste.local", "SenhaAdmin123!"),
    ],
)
def test_login_com_credenciais_invalidas(client, email, password):
    response = client["client"].post(
        "/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "E-mail ou senha inválidos."


def test_acesso_com_jwt_malformado_retorna_401(client):
    response = client["client"].get(
        "/auth/me",
        headers={
            "Authorization": "Bearer token-invalido",
        },
    )

    assert response.status_code == 401


def test_acesso_com_jwt_expirado_retorna_401(client):
    from datetime import timedelta

    token = create_access_token(
        client["admin"]["id"],
        expires_delta=timedelta(seconds=-1),
    )

    response = client["client"].get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 401
