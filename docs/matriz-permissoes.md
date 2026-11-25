# Matriz de Permissões — AutoStock Intelligence

**Versão:** 0.3 
**Data da proposta:** 25/11/2026  
**Relacionados:** RF-01, RF-02, RF-13, RNF-02; AS-01, AS-03, AS-04, AS-05 e AS-09  

## 1. Objetivo

Este documento apresenta a matriz de permissões do AutoStock Intelligence, definindo quais ações estão associadas a cada papel de usuário.

O controle de acesso utiliza RBAC (Role-Based Access Control), permitindo que as permissões sejam organizadas conforme o papel atribuído ao usuário.

A implementação está centralizada no módulo:

```text
backend/app/auth/permissions.py
```

## 2. Papéis disponíveis

O sistema possui dois papéis de usuário:

| Papel    | Descrição                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------------- |
| ADMIN    | Administrador responsável pelo gerenciamento de usuários e pelas permissões administrativas configuradas. |
| OPERADOR | Usuário destinado às operações cotidianas, com acesso limitado às funcionalidades permitidas.             |

## 3. Matriz de permissões

A tabela apresenta as permissões configuradas atualmente no sistema.

| Permissão                   | ADMIN | OPERADOR |
| --------------------------- | :---: | :------: |
| `products:read`             |  Sim  |   Sim    |
| `products:write`            |  Sim  |   Sim    |
| `products:commercial:write` |  Sim  |   Não    |
| `stock:movement:create`     |  Sim  |   Sim    |
| `stock:history:read`        |  Sim  |   Sim    |
| `stock:correction:create`   |  Sim  |   Não    |
| `stock:adjustment:create`   |  Sim  |   Não    |
| `imports:run`               |  Sim  |   Não    |
| `reports:read`              |  Sim  |   Sim    |
| `sync:read`                 |  Sim  |   Não    |
| `users:manage`              |  Sim  |   Não    |

## 4. Descrição das permissões

| Permissão                   | Descrição                                      |
| --------------------------- | ---------------------------------------------- |
| `products:read`             | Consultar informações de produtos.             |
| `products:write`            | Criar ou atualizar informações de produtos.    |
| `products:commercial:write` | Alterar informações comerciais de produtos.    |
| `stock:movement:create`     | Registrar movimentações de estoque.            |
| `stock:history:read`        | Consultar o histórico de movimentações.        |
| `stock:correction:create`   | Registrar correções de estoque.                |
| `stock:adjustment:create`   | Realizar ajustes de estoque.                   |
| `imports:run`               | Executar processos de importação.              |
| `reports:read`              | Consultar relatórios.                          |
| `sync:read`                 | Consultar informações de sincronização.        |
| `users:manage`              | Gerenciar usuários e seus respectivos acessos. |

## 5. Implementação no backend

As permissões são centralizadas na estrutura `ROLE_PERMISSIONS`, permitindo associar cada papel às permissões correspondentes.

O mecanismo de autorização utiliza dependências implementadas em:

```text
backend/app/auth/dependencies.py
backend/app/auth/permissions.py
```

O controle de acesso é aplicado às rotas por meio das dependências de autenticação e autorização.

### Permissões atualmente conectadas

Na implementação atual da AS-03, a permissão `users:manage` está conectada às rotas administrativas de gerenciamento de usuários.

| Endpoint                       | Método | Permissão exigida |
| ------------------------------ | ------ | ----------------- |
| `/auth/users`                  | GET    | `users:manage`    |
| `/auth/users`                  | POST   | `users:manage`    |
| `/auth/users/{user_id}/role`   | PATCH  | `users:manage`    |
| `/auth/users/{user_id}/status` | PATCH  | `users:manage`    |

As rotas administrativas também exigem que o usuário esteja autenticado e ativo.

### Permissões ainda não conectadas aos módulos operacionais

As permissões de produtos, estoque, importações, relatórios e sincronizações já estão definidas na estrutura centralizada, mas sua aplicação depende da implementação e proteção dos respectivos endpoints.

Portanto, não se deve interpretar a presença dessas permissões na matriz como comprovação de que todos os módulos operacionais já possuem controle de acesso implementado.

Essa integração deve ocorrer conforme os módulos forem desenvolvidos.

## 6. Regras de segurança

O sistema deve respeitar as seguintes regras:

1. Todo endpoint protegido deve exigir autenticação.
2. O usuário deve possuir um token JWT válido.
3. O usuário deve estar ativo no banco de dados.
4. A permissão necessária deve estar associada ao papel do usuário.
5. Usuários sem a permissão necessária não devem executar a operação.
6. O gerenciamento de usuários deve ser restrito ao papel ADMIN.
7. O sistema deve preservar a existência de pelo menos um administrador ativo.

## 7. Respostas de autorização

A API utiliza os seguintes códigos HTTP para situações relacionadas ao controle de acesso:

| Código           | Situação                                                         |
| ---------------- | ---------------------------------------------------------------- |
| 401 Unauthorized | Usuário não autenticado, token ausente ou token inválido.        |
| 403 Forbidden    | Usuário autenticado, mas sem permissão para executar a operação. |

Outros códigos podem ser retornados conforme a validação dos dados e as regras de negócio.

## 8. Autenticação de webhooks

Os webhooks não utilizam os papéis ADMIN e OPERADOR.

O recebimento de eventos externos utiliza uma credencial independente:

```text
AUTOSTOCK_WEBHOOK_TOKEN
```

A autenticação é realizada por meio do cabeçalho:

```http
X-Webhook-Token: SEU_TOKEN
```

Endpoint:

```http
POST /webhooks/events
```

Essa separação evita que a credencial de integração externa seja confundida com os tokens JWT utilizados pelos usuários humanos.

A documentação complementar está disponível em:

```text
docs/seguranca-integracoes.md
```

## 9. Evolução da matriz

Com a implementação dos módulos operacionais, as permissões deverão ser conectadas aos respectivos endpoints.

A evolução deve considerar:

- Controle de acesso às operações de produtos.
- Restrição de correções e ajustes de estoque.
- Proteção das operações de importação.
- Controle de acesso aos relatórios.
- Restrição das consultas de sincronização.
- Revisão da matriz conforme novos papéis ou requisitos forem adicionados.

Qualquer alteração na matriz deve ser acompanhada de testes automatizados que comprovem os acessos permitidos e negados.

## 10. Referências no projeto

Arquivos relacionados:

```text
backend/app/auth/permissions.py
backend/app/auth/dependencies.py
backend/app/auth/router.py
backend/app/auth/service.py
backend/tests/test_auth.py
docs/seguranca-autenticacao.md
```
