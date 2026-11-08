# AutoStock Intelligence — Especificação de requisitos

**Versão:** 0.2 — proposta para revisão na AS-01  
**Status:** requisitos propostos, sujeitos a revisão e validação pela equipe.  
**Issue de origem:** https://github.com/IkaroGLT/AutoStock-Intelligence/issues/1

## 1. Objetivo

Definir e rastrear funcionalidades, regras de negócio e critérios mensuráveis de qualidade para o MVP do AutoStock Intelligence, sistema de controle de estoque com automação e módulo acadêmico de previsão de demanda.

**Atores iniciais:** Administrador e Operador, com cliente de integração autenticado separadamente. A **matriz proposta de permissões** consta em [`matriz-permissoes.md`](matriz-permissoes.md); a AS-03 implementará o controle após aprovação.

## 2. Requisitos funcionais

Todos abaixo têm classificação **Must Have (Obrigatório)** no escopo projetado. A prioridade pode ser reavaliada pela equipe caso o prazo exija redução negociada de escopo.

| ID | Nome | Descrição | Issue(s) |
|---|---|---|---|
| RF-01 | Autenticação | Permitir identificação e autenticação de usuários para acesso ao sistema. | AS-03, AS-04, AS-05 |
| RF-02 | Autorização por perfil | Restringir funcionalidades e operações críticas conforme papel/permissão do usuário. | AS-03, AS-05 |
| RF-03 | Cadastro de produtos | Cadastrar produto com SKU único, nome, categoria, preços e mínimo de estoque. | AS-04, AS-05 |
| RF-04 | Consulta e atualização cadastral | Consultar, pesquisar e atualizar dados cadastrais do produto, sem modificar saldo de forma indireta. | AS-04, AS-05 |
| RF-05 | Registro de entrada | Registrar quantidade recebida e atualizar saldo com histórico auditável. | AS-04, AS-05 |
| RF-06 | Registro de saída | Registrar retirada e impedir saída superior à quantidade disponível. | AS-04, AS-05 |
| RF-07 | Histórico | Consultar entradas, saídas, ajustes e correções com datas, motivos e saldos. | AS-04, AS-05 |
| RF-08 | Importação | Importar arquivos CSV e XLSX com validação e preservação do saldo de produtos existentes. | AS-06, AS-04 |
| RF-09 | Webhooks idempotentes | Receber eventos de integração autenticados, processar e impedir duplicidades. | AS-06 |
| RF-10 | Alertas de estoque | Identificar estoque mínimo/zerado e ocorrências operacionais relevantes. | AS-04, AS-06 |
| RF-11 | Dashboard | Exibir indicadores e gráficos operacionais derivados da API. | AS-04, AS-05 |
| RF-12 | Previsão de demanda | Gerar estimativas futuras de demanda por produto com modelo treinado e avaliado. | AS-07, AS-08 |
| **RF-13** | **Correção auditável de lançamentos** | **Corrigir quantidade de entrada registrada incorretamente por movimentação compensatória, mantendo lançamento original, usuário, motivo, data e vínculo histórico.** | **AS-01, AS-04, AS-05, AS-09** |

### 2.1. Regras de negócio fundamentais

- **RN-01:** SKU deve ser único e não vazio.
- **RN-02:** quantidades em estoque não podem ficar negativas.
- **RN-03:** mudanças de saldo exigem uma movimentação registrada no histórico.
- **RN-04:** eventos externos duplicados não podem movimentar estoque novamente.
- **RN-05:** operações administrativas e de correção exigem autorização.
- **RN-06:** arquivos importados devem validar cabeçalhos, tipos e duplicidades.
- **RN-07:** histórico de movimentação original deve ser preservado; correção gera novo evento.

### 2.2. Detalhamento especial — RF-13

**Contrato técnico proposto:** [`contrato-rf13.md`](contrato-rf13.md). **Permissão proposta:** apenas Administrador pode confirmar a correção; Operador não tem esse acesso. Para o MVP, a correção aplica-se apenas a entradas manuais e admite uma correção por lançamento original.

**Ator:** usuário autenticado com permissão de correção.  
**Pré-condição:** lançamento original de entrada identificado e produto existente.  
**Entrada:** ID da movimentação original, quantidade correta, motivo e identificador idempotente da solicitação.  
**Processamento:** validação do ator, cálculo da diferença, conferência do saldo atual e operação atômica de compensação.  
**Saída:** novo registro auditável, saldo atualizado e vínculo com original.  
**Pós-condição:** lançamento original permanece imutável.

**Cálculo:** `delta = quantidade_correta - quantidade_original`; `saldo_novo = saldo_atual + delta`. Se o novo saldo for negativo, a operação será rejeitada. Se já houve movimentações posteriores, preservá-las e aplicar apenas o delta. A API deve evitar reaplicação da mesma correção em reenvios.

**Exemplo:** entrada original 15; saída posterior 3; saldo atual 12; entrada correta 10; delta −5; saldo atualizado 7.

**Diferença importante:** o ajuste de inventário por contagem física estabelece um novo saldo contado e deve ser distinguido da correção compensatória de um lançamento histórico.

**Critérios de aceite RF-13:**

- [ ] Usuário com permissão consegue solicitar correção e confirmar operação.
- [ ] Usuário sem permissão não consegue executar a operação.
- [ ] Justificativa e quantidade correta são obrigatórias e validadas.
- [ ] Saldo projetado é verificado antes de gravar; saldo negativo é rejeitado.
- [ ] A operação usa transação atômica e registra usuário, data, motivo e vínculo original.
- [ ] Movimento original permanece inalterado e visível no histórico.
- [ ] Retransmissão idêntica não gera nova compensação.
- [ ] Casos de correção após saídas, conflito, duplicidade e rollback têm testes.

## 3. Requisitos não funcionais

| ID | Categoria ISO/qualidade | Descrição e meta verificável | Evidência esperada | Issue(s) |
|---|---|---|---|---|
| RNF-01 | Eficiência de desempenho | `GET /produtos` com p95 ≤ 1 segundo com 1.000 produtos e 10 usuários concorrentes, sob ambiente definido e documentado. | Relatório de carga/latência | AS-09, AS-10 |
| RNF-02 | Segurança | 100% das operações críticas exigindo autenticação e autorização adequadas; incluir RF-13. | Testes de 401/403 e matriz de permissões | AS-03, AS-09 |
| RNF-03 | Confiabilidade e integridade | Nenhum saldo negativo, duplicidade ou gravação parcial em 100 cenários controlados de erro, reenvio e concorrência. | Testes de integração, rollback e idempotência | AS-05, AS-06, AS-09 |
| RNF-04 | Testabilidade | Cobertura automatizada de pelo menos 70% dos serviços centrais de negócio. | Relatório de cobertura com módulos incluídos | AS-09, AS-10 |
| RNF-05 | Usabilidade | Ao menos 4 de 5 participantes completam 3 tarefas essenciais sem assistência, em até 5 minutos por tarefa. | Roteiro de teste e registro das sessões | AS-04, AS-09, AS-12 |

As metas são critérios projetados; **não foram ainda medidas ou comprovadas**.

## 4. Priorização MoSCoW

- **Must Have (Obrigatório):** RF-01 a RF-13; RNF-01 a RNF-05 conforme metas revisadas.
- **Should Have (Importante):** filtros avançados de relatório e histórico, se houver capacidade.
- **Could Have (Desejável):** notificações configuráveis e exportações adicionais.
- **Won't Have nesta versão (Fora do escopo):** ERP real em produção, pagamentos, aplicativo nativo, operação offline complexa, múltiplos depósitos, promessa de não realizar inventário físico.

## 5. Exemplos de histórias de usuário / BDD para posterior detalhamento

### US-01 — Registrar entrada
```gherkin
Dado que o operador autorizado está autenticado
Quando registrar uma entrada válida de 10 unidades
Então o saldo do produto deve aumentar em 10
E uma movimentação deve ser registrada no histórico
```

### US-02 — Bloquear saída excessiva
```gherkin
Dado que o produto possui 5 unidades disponíveis
Quando o operador solicitar uma saída de 6 unidades
Então o sistema deve rejeitar a operação
E o saldo deve permanecer em 5
```

### US-03 — Correção de entrada
```gherkin
Dado que uma entrada de 15 unidades foi registrada e deveria ser de 10
E o saldo atual permite uma compensação de 5 unidades
Quando o usuário autorizado corrigir o lançamento informando o motivo
Então o sistema deve registrar uma nova movimentação compensatória de menos 5 unidades
E a entrada original deve permanecer no histórico
```

### US-04 — Webhook duplicado
```gherkin
Dado que um evento externo já foi processado
Quando o mesmo evento for reenviado com a mesma identidade e conteúdo
Então o saldo não deve ser movimentado novamente
```

### US-05 — Estoque mínimo
```gherkin
Dado que um produto ativo atingiu seu estoque mínimo
Quando o usuário consultar os alertas
Então o produto deve aparecer na lista de atenção
```

Essas histórias são **rascunhos** para revisão, implementação e execução real de testes; não constituem evidências de testes realizados.

## 6. Rastreabilidade e alterações

A implementação é organizada em Issues `AS-01` a `AS-12`. Novos requisitos devem ser atualizados primeiro neste catálogo, depois refletidos nas Issues de interface, API e teste. O RF-13 afeta principalmente AS-01, AS-04, AS-05 e AS-09, além de demandar autorização definida na AS-03.

**Pontos pendentes:** revisão e aprovação formal da matriz de permissões e do contrato RF-13 (já redigidos em documentos separados), validação das metas de desempenho durante testes, e execução das técnicas reais de elicitação antes da entrega acadêmica. Nenhum endpoint ou permissão está implementado apenas por existir esta documentação.
