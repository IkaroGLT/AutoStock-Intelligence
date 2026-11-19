# Segurança das integrações externas

## 1. Autenticação independente de webhook

As integrações externas utilizam uma credencial própria, separada da autenticação de usuários humanos da API.

### Configuração

- Variável de ambiente: `AUTOSTOCK_WEBHOOK_TOKEN`
- Cabeçalho HTTP: `X-Webhook-Token`
- Tamanho mínimo: 32 bytes
- Comparação segura: `hmac.compare_digest`

O token real deve ser configurado no ambiente de execução. Não deve ser versionado no Git, registrado em logs ou incluído em exemplos públicos.

### Respostas de autenticação

| Situação | HTTP |
|---|---:|
| Token válido | Requisição autorizada |
| Token ausente | 401 |
| Token incorreto | 401 |
| Configuração ausente | 503 |
| Token configurado abaixo do mínimo | 503 |

A autenticação do webhook não aceita o JWT utilizado no login de usuários humanos. As permissões ADMIN e OPERADOR não são herdadas pelas integrações externas.

## 2. Endpoint implementado

- Método: `POST`
- Rota: `/webhooks/events`
- Autenticação: cabeçalho `X-Webhook-Token`
- Implementação: `backend/app/webhooks/router.py`
- Segurança: `backend/app/webhooks/security.py`

O endpoint recebe eventos externos com os campos:

| Campo | Descrição |
|---|---|
| `origem` | Sistema que enviou o evento |
| `evento_id` | Identificador do evento na origem |
| `tipo_evento` | Tipo do evento recebido |
| `payload` | Dados do evento em formato JSON |

## 3. Persistência e idempotência

Os eventos recebidos são armazenados na tabela `eventos_webhook`.

A combinação de `origem` e `evento_id` identifica unicamente um evento, evitando registros duplicados.

| Situação | HTTP | Comportamento |
|---|---:|---|
| Novo evento válido | 201 | Evento registrado |
| Evento já recebido | 200 | Registro existente retornado |
| Dados obrigatórios ausentes ou inválidos | 422 | Requisição rejeitada |
| Falha de armazenamento | 503 | Serviço indisponível |

O evento é registrado inicialmente com status `RECEBIDO`. O endpoint realiza a recepção e persistência; o processamento posterior do evento não está incluído nesta implementação.

## 4. Proteção de credenciais

- Segredos reais devem permanecer em variáveis de ambiente.
- Arquivos `.env` e `.env.local` não devem ser versionados.
- O arquivo `.env.example` contém somente orientações e nomes de variáveis, sem credenciais reais.
- Tokens não devem ser expostos em respostas ou logs.

## 5. Testes automatizados

O arquivo `backend/tests/test_webhook_auth.py` verifica:

- Recepção de evento com token válido.
- Prevenção de duplicidade.
- Rejeição de token ausente.
- Rejeição de token incorreto.
- Rejeição de JWT humano como credencial de webhook.
- Rejeição de configuração ausente.
- Rejeição de token configurado abaixo do tamanho mínimo.
- Rejeição de evento sem campos obrigatórios.
