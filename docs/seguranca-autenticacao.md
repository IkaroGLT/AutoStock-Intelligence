# Segurança e Autenticação

## 1. Objetivo

Este documento descreve os mecanismos de autenticação e controle de acesso implementados no backend do AutoStock Intelligence.

A implementação tem como objetivos:

- Identificar os usuários que acessam a API.
- Proteger endpoints que exigem autenticação.
- Controlar o acesso conforme o papel do usuário.
- Armazenar senhas de maneira segura.
- Impedir que usuários desativados continuem acessando recursos protegidos.

## 2. Tecnologias utilizadas

| Tecnologia | Finalidade                                   |
| ---------- | -------------------------------------------- |
| JWT        | Emissão e validação de tokens de acesso.     |
| PyJWT      | Manipulação dos tokens JWT.                  |
| HS256      | Algoritmo de assinatura dos tokens.          |
| Argon2     | Hash e verificação de senhas.                |
| FastAPI    | Integração da autenticação com os endpoints. |
| SQLite     | Persistência dos usuários.                   |

## 3. Configuração de segurança

A autenticação utiliza a variável de ambiente:

```text
AUTOSTOCK_JWT_SECRET
```

Essa variável contém o segredo utilizado para assinar e validar os tokens JWT.

O backend exige que o segredo esteja configurado e tenha pelo menos 32 bytes.

Exemplo de configuração no PowerShell:

```powershell
$env:AUTOSTOCK_JWT_SECRET="SUA_CHAVE_ALEATORIA"
```

A chave deve:

- Ser gerada aleatoriamente.
- Permanecer protegida.
- Ser mantida consistente entre reinicializações da API.
- Não ser compartilhada com o token de webhook.
- Nunca ser armazenada em arquivos versionados com seu valor real.

A substituição da chave invalida os tokens emitidos com o segredo anterior.

**Importante:** o projeto utiliza leitura direta de variáveis de ambiente por `os.getenv()`. O arquivo `.env.example` é apenas um modelo de configuração e não é carregado automaticamente pela aplicação.

## 4. Armazenamento de senhas

As senhas dos usuários não são armazenadas em texto puro.

A implementação utiliza Argon2 por meio da biblioteca `pwdlib`.

No cadastro:

1. A senha é recebida pela API.
2. A senha é processada pelo algoritmo de hash.
3. O hash resultante é armazenado no banco de dados.

No login:

1. O usuário informa e-mail e senha.
2. A API localiza o usuário.
3. A senha informada é comparada com o hash armazenado.
4. O acesso é concedido somente quando as credenciais são válidas e o usuário está ativo.

A API não deve retornar o hash da senha nas respostas públicas.

## 5. Autenticação com JWT

Após um login válido, a API emite um token JWT de acesso.

### Algoritmo

```text
HS256
```

### Tempo de validade

```text
30 minutos
```

### Claims utilizados

| Claim  | Finalidade                               |
| ------ | ---------------------------------------- |
| `sub`  | Identificador do usuário.                |
| `iss`  | Identifica o emissor do token.           |
| `iat`  | Momento em que o token foi emitido.      |
| `exp`  | Momento em que o token expira.           |
| `type` | Identifica o token como token de acesso. |

O emissor configurado é:

```text
autostock-api
```

O campo `sub` contém o identificador do usuário convertido para string.

### Envio do token

Após o login, o cliente deve enviar o token nas requisições protegidas:

```http
Authorization: Bearer SEU_TOKEN_JWT
```

A API valida a assinatura, o emissor, a validade temporal e o tipo do token.

Além disso, o usuário é consultado novamente no banco de dados para verificar se continua ativo.

## 6. Fluxo de autenticação

O fluxo implementado pode ser representado da seguinte maneira:

```text
Cliente
   |
   | POST /auth/login
   | email + password
   v
API
   |
   | Localiza usuário
   | Verifica senha com Argon2
   | Verifica situação da conta
   |
   +---- Credenciais inválidas
   |          |
   |          v
   |       HTTP 401
   |
   +---- Credenciais válidas
              |
              v
        Emissão do JWT
              |
              v
        Retorno do token
              |
              v
      Cliente armazena token
              |
              | Authorization: Bearer
              v
        Endpoint protegido
              |
              v
        Validação do JWT
              |
              v
      Consulta usuário ativo
              |
              v
       Verificação de permissão
              |
              v
         Acesso autorizado
```

## 7. Endpoints de autenticação

### 7.1. Health check

```http
GET /health
```

Endpoint público utilizado para verificar a disponibilidade da API.

### 7.2. Login

```http
POST /auth/login
```

Acesso público.

Exemplo de requisição:

```json
{
  "email": "usuario@exemplo.com",
  "password": "sua_senha"
}
```

Em caso de sucesso, retorna um token de acesso e os dados públicos do usuário.

Exemplo ilustrativo:

```json
{
  "access_token": "TOKEN_JWT",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "nome": "Usuario",
    "email": "usuario@exemplo.com",
    "papel": "ADMIN",
    "ativo": true
  }
}
```

A estrutura exata da resposta deve acompanhar o schema implementado na API.

Credenciais inválidas ou usuário inexistente resultam em HTTP 401.

### 7.3. Consultar usuário autenticado

```http
GET /auth/me
```

Exige JWT válido.

Retorna os dados do usuário associado ao token.

### 7.4. Listar usuários

```http
GET /auth/users
```

Exige autenticação e permissão `users:manage`.

Disponível para ADMIN.

### 7.5. Criar usuário

```http
POST /auth/users
```

Exige autenticação e permissão `users:manage`.

Exemplo:

```json
{
  "nome": "Novo Operador",
  "email": "operador@exemplo.com",
  "password": "senha_segura",
  "papel": "OPERADOR"
}
```

A senha deve possuir pelo menos 8 caracteres, conforme a validação da API.

Os papéis aceitos são:

- `ADMIN`
- `OPERADOR`

O e-mail duplicado resulta em HTTP 409.

### 7.6. Alterar papel do usuário

```http
PATCH /auth/users/{user_id}/role
```

Exige permissão `users:manage`.

Permite alterar o papel do usuário conforme as regras implementadas no serviço de autenticação.

### 7.7. Alterar situação do usuário

```http
PATCH /auth/users/{user_id}/status
```

Exige permissão `users:manage`.

Exemplo para desativar:

```json
{
  "ativo": false
}
```

Exemplo para ativar:

```json
{
  "ativo": true
}
```

A implementação também protege a existência do último administrador ativo, impedindo que ele seja desativado de forma a deixar o sistema sem administrador.

## 8. Controle de permissões

O controle de acesso utiliza uma estrutura centralizada de permissões por papel.

As permissões são verificadas por dependências da API.

### ADMIN

Possui as permissões configuradas:

- `products:read`
- `products:write`
- `products:commercial:write`
- `stock:movement:create`
- `stock:history:read`
- `stock:correction:create`
- `stock:adjustment:create`
- `imports:run`
- `reports:read`
- `sync:read`
- `users:manage`

### OPERADOR

Possui as permissões configuradas:

- `products:read`
- `products:write`
- `stock:movement:create`
- `stock:history:read`
- `reports:read`

A matriz completa está documentada em `docs/matriz-permissoes.md`.

**Atenção:** a existência de uma permissão na estrutura centralizada não garante que uma funcionalidade esteja implementada ou que seus endpoints já utilizem essa permissão. A proteção deve ser conectada aos respectivos endpoints durante a implementação de cada módulo.

Atualmente, `users:manage` é utilizada nas rotas administrativas de gerenciamento de usuários.

## 9. Códigos HTTP relacionados à autenticação

| Código | Significado                                             |
| ------ | ------------------------------------------------------- |
| 200    | Requisição realizada com sucesso.                       |
| 201    | Recurso criado com sucesso.                             |
| 401    | Credenciais inválidas ou autenticação ausente/inválida. |
| 403    | Usuário autenticado sem permissão suficiente.           |
| 409    | Conflito, como e-mail já cadastrado.                    |
| 422    | Dados enviados não passaram pela validação.             |

## 10. Primeiro administrador

O projeto possui um procedimento de bootstrap:

```powershell
python -m app.auth.bootstrap_admin
```

Esse procedimento solicita os dados do administrador e cria a primeira conta administrativa somente quando ainda não existem usuários cadastrados.

A senha deve ter pelo menos 12 caracteres nesse procedimento.

O bootstrap não substitui o gerenciamento normal de usuários pela API.

## 11. Testes de segurança

A implementação possui testes automatizados para os seguintes cenários:

- Login com credenciais válidas.
- Login com senha incorreta.
- Login com usuário inexistente.
- Acesso a endpoint protegido sem token.
- Acesso com token válido.
- Consulta do usuário autenticado.
- Restrição de acesso por papel.
- Criação de usuários.
- Rejeição de e-mail duplicado.
- Validação de tamanho mínimo da senha.
- Gerenciamento da situação dos usuários.
- Proteção do último administrador ativo.
- Autenticação dos webhooks.

A execução reportada durante a validação da AS-03 foi:

```text
37 passed
```

Os testes devem ser executados novamente após alterações na implementação ou sincronização com outras branches.

Comando:

```powershell
python -m pytest -q
```

## 12. Limitações atuais e evoluções futuras

A implementação atual possui algumas limitações que devem ser consideradas:

- Não há endpoint de renovação de token (refresh token).
- Não há endpoint de logout com revogação individual de JWT.
- O encerramento de sessão no cliente depende de descartar o token armazenado.
- Os tokens permanecem válidos até a expiração, a menos que o usuário seja desativado ou a chave de assinatura seja alterada.
- A configuração de CORS deve ser considerada durante a integração com o frontend.
- As permissões operacionais precisam ser conectadas aos endpoints correspondentes conforme os módulos forem implementados.

Esses pontos devem ser tratados em etapas futuras, conforme os requisitos do projeto.

## 13. Boas práticas

- Não compartilhar tokens JWT.
- Não armazenar senhas em texto puro.
- Não versionar segredos.
- Utilizar HTTPS em ambientes de produção.
- Manter a chave JWT protegida.
- Utilizar uma chave diferente para webhooks.
- Não conceder papel ADMIN sem necessidade.
- Desativar contas que não devem mais acessar o sistema.
- Executar testes após alterações nos mecanismos de autenticação.
