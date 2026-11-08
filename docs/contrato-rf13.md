# AutoStock Intelligence — Contrato técnico RF-13

**Versão:** 0.2 — proposta para revisão e aprovação na AS-01  
**Data da proposta:** 08/11/2026  
**Requisitos relacionados:** RF-02, RF-05, RF-07, RF-13, RNF-02 e RNF-03  
**Issues:** AS-01 (especificação), AS-03 (permissões), AS-04 (interface), AS-05 (API/integração), AS-09 (testes)  
**Status:** contrato projetado; os endpoints abaixo **ainda não estão implementados**.

## 1. Problema e resultado esperado

Uma entrada manual com quantidade incorreta precisa ser corrigida sem editar ou excluir a movimentação original. O sistema gera uma **nova movimentação compensatória**, identificando quem corrigiu, quando, por que e qual lançamento foi corrigido.

**Exemplo com movimentação posterior:** foi registrada entrada de 15, seguida por saída de 3; saldo atual 12. A entrada correta era 10. `delta = 10 - 15 = -5`; saldo após a correção `12 + (-5) = 7`.

A operação **não** deve definir o saldo como 10. Isso apagaria o efeito da saída posterior.

## 2. Decisões de escopo para o MVP

- Corrigir apenas entradas **manuais** (`tipo=ENTRADA`, `origem=manual`). Registros originados de webhooks ou importações devem ser tratados inicialmente pelo fluxo de origem, fora do RF-13.
- Somente o perfil **Administrador** pode executar correções. Operador consulta histórico, mas não corrige.
- Permitir **uma correção por movimento original** nesta versão. Uma nova retificação deverá ser objeto de outro processo especificado futuramente.
- A `quantidade_correta` pode ser zero (anular economicamente a entrada pela compensação), mas nunca negativa.
- A quantidade correta deve ser diferente da registrada; caso contrário, rejeitar como operação sem efeito.
- Correções não podem resultar em saldo negativo, mesmo quando houver saídas posteriores.
- Não confundir **correção de lançamento histórico** com **ajuste de inventário físico**.
- Todas as respostas e erros seguem o mesmo padrão JSON adotado na API, a formalizar na AS-05.

## 3. Contrato HTTP proposto

### 3.1. Simular correção — sem alterar dados

`GET /movimentacoes/{movimentacao_id}/correcao/previa?quantidade_correta=10`

**Autorização:** Administrador. Retorna a diferença proposta e saldo projetado no instante da consulta. A prévia não grava nada e pode ficar obsoleta se houver movimento concorrente.

**Exemplo de resposta `200 OK`:**

```json
{
  "movimentacao_original_id": 123,
  "produto_id": 46,
  "quantidade_original": 15,
  "quantidade_correta": 10,
  "diferenca": -5,
  "saldo_atual": 12,
  "saldo_projetado": 7,
  "permitida": true
}
```

### 3.2. Confirmar correção — transacional

`POST /movimentacoes/{movimentacao_id}/correcao`

**Autorização:** Administrador.  
**Cabeçalhos:** `Authorization: Bearer <token-de-usuario>` e `Idempotency-Key: <identificador-unico>`.

**Exemplo de corpo JSON:**

```json
{
  "quantidade_correta": 10,
  "justificativa": "Entrada lançada como 15; conferência da nota indica 10 unidades",
  "saldo_esperado": 12
}
```

`saldo_esperado` é o saldo apresentado pela prévia. Na confirmação, o backend deve verificar se o saldo ainda corresponde ao esperado; em caso contrário, responder `409` e exigir uma nova prévia, evitando uma confirmação baseada em informação desatualizada.

**Exemplo de resposta `201 Created`:**

```json
{
  "correcao_id": 87,
  "movimentacao_original_id": 123,
  "movimentacao_compensatoria_id": 208,
  "produto_id": 46,
  "quantidade_original": 15,
  "quantidade_correta": 10,
  "diferenca": -5,
  "saldo_anterior": 12,
  "saldo_novo": 7,
  "justificativa": "Entrada lançada como 15; conferência da nota indica 10 unidades",
  "usuario_id": 2,
  "criado_em": "2026-11-08T15:00:00Z"
}
```

**Importante:** `usuario_id` deve ser obtido pelo backend a partir da autenticação, e não enviado no corpo da requisição. Os IDs e horários acima são fictícios, usados somente para demonstrar o contrato.

## 4. Respostas e erros

| Código HTTP | Situação |
|---|---|
| `200` | Prévia válida ou repetição **idêntica** de solicitação já concluída com mesma `Idempotency-Key` (sem novo ajuste) |
| `201` | Correção efetivamente registrada |
| `401` | Ausência ou invalidade de autenticação humana |
| `403` | Usuário autenticado sem `stock:correction:create` |
| `404` | Movimentação original inexistente ou não acessível |
| `409` | Saldo insuficiente; saldo desatualizado; entrada já corrigida; chave idempotente usada com outro conteúdo; concorrência/conflicto |
| `422` | Quantidade inválida, justificativa vazia, tipo/origem inelegíveis, correção sem efeito ou campo obrigatório ausente |
| `500` | Falha interna inesperada, sem exposição de detalhes sensíveis ao cliente |

Repetições com mesma chave e **conteúdo idêntico** devem retornar o resultado previamente persistido, após validar a identidade e autorização; nunca produzir segunda movimentação. Chave reutilizada com conteúdo diferente gera `409`. Outra chave tentando corrigir o mesmo lançamento já corrigido gera `409`.

## 5. Persistência e atomicidade

O esquema existente `movimentacoes_estoque` já contém tipo `AJUSTE`, saldo anterior/novo, motivo e referência externa. O serviço de correção poderá reaproveitar esse mecanismo **passando o saldo final calculado**, e não a diferença diretamente, pois `AJUSTE` na API anterior significa *definir saldo final*.

**Evolução proposta do esquema (a implementar na AS-05/AS-03):** tabela `correcoes_movimentacao` contendo:

| Campo | Finalidade |
|---|---|
| `id` | Identificador único da correção |
| `movimentacao_original_id` | FK e UNIQUE, impedindo nova correção no mesmo lançamento |
| `movimentacao_compensatoria_id` | FK e UNIQUE, vinculando o novo registro de saldo |
| `usuario_id` | FK para o usuário que confirmou a correção |
| `quantidade_original` | Valor que foi registrado inicialmente |
| `quantidade_correta` | Valor correto informado |
| `diferenca` | Compensação aplicada (pode ser negativa) |
| `justificativa` | Texto obrigatório |
| `chave_idempotencia` | Identificador único do pedido para deduplicação |
| `criado_em` | Instante da execução, gerado no servidor |

O fluxo de gravação deve ocorrer em **uma transação SQLite** com bloqueio de escrita adequado (`BEGIN IMMEDIATE`, se mantido esse padrão), verificando saldo, elegibilidade e duplicidade antes da atualização. Na mesma transação: (1) registrar o ajuste compensatório de saldo; (2) registrar o vínculo da correção; (3) confirmar a transação. Em falha, executar rollback completo.

Não alterar/deletar a entrada original. Garantir integridade também diante de operações concorrentes, com restrições UNIQUE e verificações no banco.

## 6. Regras de validação

1. O lançamento de origem existe, é do tipo `ENTRADA`, possui origem `manual` e tem `quantidade_movimentada > 0`.
2. A correção não foi anteriormente confirmada para a mesma movimentação.
3. O usuário é Administrador (a permissão é conferida na API).
4. `quantidade_correta` é inteiro ≥ 0 e diferente de `quantidade_original`.
5. `justificativa` é uma string não vazia após `trim`, limitada conforme validação definida na implementação (proposta: até 500 caracteres).
6. `Idempotency-Key` é obrigatório e deve identificar unicamente a tentativa lógica da operação.
7. `saldo_esperado` é inteiro não negativo, e corresponde ao saldo atual sob a transação de escrita.
8. `saldo_novo = saldo_atual + (quantidade_correta - quantidade_original)` deve ser ≥ 0.
9. Eventos posteriores permanecem no histórico e não são recalculados ou apagados.

## 7. Critérios de aceite e testes BDD

```gherkin
Cenário: Corrigir uma entrada manual registrada com quantidade maior
  Dado que o Administrador está autenticado
  E a entrada manual de ID 123 registrou 15 unidades
  E uma saída posterior de 3 deixou o saldo em 12
  Quando ele corrigir a entrada para 10 unidades com justificativa
  Então uma movimentação compensatória de -5 deve ser registrada
  E o saldo atual deve passar para 7
  E a entrada original e a saída posterior devem permanecer no histórico
  E a correção deve registrar o Administrador e o lançamento original

Cenário: Impedir saldo negativo
  Dado que o saldo atual é 3 e a compensação necessária é -5
  Quando o Administrador tentar confirmar a correção
  Então a API deve responder 409
  E o saldo e o histórico devem permanecer inalterados

Cenário: Bloquear usuário sem permissão
  Dado que um Operador está autenticado
  Quando ele tentar corrigir um lançamento
  Então a API deve responder 403
  E nenhuma alteração deve ser gravada

Cenário: Repetir a mesma operação
  Dado que uma correção já foi confirmada com determinada chave idempotente
  Quando a mesma solicitação for repetida com a mesma chave e conteúdo
  Então a API deve devolver o resultado anterior
  E não deve registrar outra movimentação

Cenário: Evitar confirmação baseada em saldo desatualizado
  Dado que a prévia indicou saldo atual 12
  E outra movimentação alterou o saldo para 11
  Quando o Administrador confirmar usando saldo_esperado 12
  Então a API deve responder 409
  E exigir atualização da prévia
```

## 8. Dependências, limitações e aprovação

- **AS-03:** autenticação de Administrador/Operador, obtenção do usuário logado, autorização em backend.
- **AS-04:** tela de seleção da entrada, prévia e confirmação; esconder ação para quem não tem permissão.
- **AS-05:** persistência do vínculo, endpoints, transação, integração e tratamento de erros.
- **AS-09:** testes de idempotência, concorrência, autorização, saldo negativo, rollback e E2E.

Esta especificação é restrita a **correções de entradas manuais**. Correções de vendas externas, importações, múltiplos locais e operações automáticas serão avaliadas separadamente, caso entrem no escopo.

- [ ] Revisão técnica pelo responsável da AS-05.
- [ ] Revisão de segurança pelo responsável da AS-03.
- [ ] Revisão de testes pelo responsável da AS-09.
- [ ] Aprovação formal no PR da AS-01.

**Nenhum endpoint, tabela, arquivo de código ou teste foi implementado por este documento.**
