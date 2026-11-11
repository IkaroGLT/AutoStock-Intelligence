# AutoStock Intelligence — Matriz de Rastreabilidade de Requisitos

**Issue:** AS-11 — Documentação Técnica e Acadêmica

**Versão:** 0.1 — Minuta de planejamento e rastreabilidade

**Data de referência:** 10/11/2026

**Estado:** documento para revisão; **não representa implementação integral nem testes aprovados**.

**Branch de trabalho:** `docs/as11-documentacao`

## 1. Objetivo e alcance

Estabelecer a ligação verificável entre **requisitos (RF/RNF)**, **histórias de usuário (US)**, **Issues de implementação**, **componentes**, **casos de teste propostos** e **evidências de execução**. A matriz permite identificar lacunas de cobertura e acompanhar a evolução do AutoStock Intelligence até a homologação.

### 1.1 Fontes consultadas

- [Especificação de requisitos](../requisitos.md) — RF-01 a RF-13, RNF-01 a RNF-05, RN-01 a RN-07 e MoSCoW.
- [Histórias de usuário e BDD](historias-bdd.md) — US-01 a US-12 e cenários Gherkin.
- [Arquitetura](../arquitetura.md) — limites de frontend, backend, SQLite, automações e ML.
- [Matriz de permissões](../matriz-permissoes.md) — acesso por Administrador, Operador e Cliente de Integração.
- [Contrato técnico RF-13](../contrato-rf13.md) — correção compensatória auditável.
- [Issue AS-11](https://github.com/IkaroGLT/AutoStock-Intelligence/issues/11) e demais Issues citadas nas tabelas.

**Nota de origem:** os documentos da AS-01 estão integrados à `main`, mas alguns ainda se identificam como propostas e contêm registros de aprovação não preenchidos. Este documento não pressupõe validação que não esteja comprovada.

### 1.2 Convenções

| Código                       | Significado                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `RF-xx`                      | Requisito funcional do documento de requisitos                                             |
| `RNF-xx`                     | Requisito não funcional do documento de requisitos                                         |
| `RN-xx`                      | Regra de negócio                                                                           |
| `US-xx`                      | História de usuário do arquivo de BDD                                                      |
| `CT-RFxx-yy` / `CT-RNFxx-yy` | **Identificadores propostos** de casos de teste, ainda não vinculados a testes executáveis |
| `AS-xx`                      | Issue do projeto no GitHub                                                                 |
| `P`                          | Planejado; execução e comprovação ainda não registradas                                    |
| `EV-PENDENTE`                | Evidência real ainda precisa ser anexada ou vinculada                                      |

**Critério para marcar "Validado":** só depois de um teste de fato executado, com versão/commit, data, ambiente, resultado observado e link ou arquivo verificável. Não confundir um cenário Gherkin escrito com teste automatizado executado.

## 2. Situação inicial para rastreabilidade

Em 10/11/2026, a **AS-01** (arquitetura/requisitos) e a **AS-02** (estrutura inicial) já haviam sido integradas à `main`. O commit da integração AS-02 é `f48a071`.

**Componentes comprovadamente presentes na base AS-02:** `backend/app/main.py` (API inicial e health), `backend/app/db/schema.sql` (esquema inicial com cinco tabelas), `backend/tests/test_database.py`, `backend/tests/test_health.py`, `frontend/` (base React/TypeScript/Vite), `ml/` (esqueleto de diretórios) e `docs/` (documentação da AS-01).

**Limite importante:** a existência dessas estruturas **não comprova** autenticação de usuários, CRUD completo, importações, webhooks funcionais no novo projeto, dashboard integrado ou previsão de demanda. O Mock Estoque API é uma **referência independente**, não evidência de implementação no AutoStock.

Na consulta inicial desta matriz, as Issues [AS-03](https://github.com/IkaroGLT/AutoStock-Intelligence/issues/3) a [AS-12](https://github.com/IkaroGLT/AutoStock-Intelligence/issues/12) estavam abertas; o status deverá ser atualizado durante as sprints.

## 3. Matriz principal — Requisitos funcionais

**Todos os RF-01 a RF-13 estão classificados como Must Have** em [`requisitos.md`](../requisitos.md). Os componentes nesta tabela descrevem a **implementação esperada**, não arquivos confirmadamente existentes. Cada caso de teste é proposto; nenhum foi marcado como executado.

| RF    | Descrição resumida                                     | US                  | Issues de implementação / validação | Componente ou fluxo esperado                                          | Caso(s) de teste proposto(s)       | Evidência / situação |
| ----- | ------------------------------------------------------ | ------------------- | ----------------------------------- | --------------------------------------------------------------------- | ---------------------------------- | -------------------- |
| RF-01 | Autenticação de usuários                               | US-01               | AS-03, AS-04, AS-05, AS-09          | Login React + serviço de autenticação FastAPI                         | CT-RF01-01, CT-RF01-02             | EV-PENDENTE / P      |
| RF-02 | Autorização por perfil (RBAC)                          | US-01, US-03, US-12 | AS-03, AS-05, AS-09                 | Dependências de permissão no backend; UI respeitando perfis           | CT-RF02-01, CT-RF02-02             | EV-PENDENTE / P      |
| RF-03 | Cadastro de produtos com SKU único                     | US-02               | AS-04, AS-05, AS-09                 | Formulário + API de produtos + SQLite                                 | CT-RF03-01, CT-RF03-02             | EV-PENDENTE / P      |
| RF-04 | Consulta e atualização cadastral sem alterar saldo     | US-03               | AS-04, AS-05, AS-09                 | Listagem, consulta e edição de produtos; controle de campos sensíveis | CT-RF04-01, CT-RF04-02             | EV-PENDENTE / P      |
| RF-05 | Registro de entrada com histórico                      | US-04               | AS-04, AS-05, AS-09                 | Formulário/API de movimentação; serviço transacional                  | CT-RF05-01                         | EV-PENDENTE / P      |
| RF-06 | Registro de saída sem estoque negativo                 | US-05               | AS-04, AS-05, AS-09                 | API de movimentação, regra de saldo e histórico                       | CT-RF06-01, CT-RF06-02             | EV-PENDENTE / P      |
| RF-07 | Consulta ao histórico auditável                        | US-06, US-12        | AS-04, AS-05, AS-09                 | API de histórico + visualização das movimentações                     | CT-RF07-01, CT-RF07-02             | EV-PENDENTE / P      |
| RF-08 | Importação CSV/XLSX preservando saldo                  | US-07               | AS-06, AS-04, AS-09                 | Upload validado; sincronização por SKU; serviço transacional          | CT-RF08-01, CT-RF08-02             | EV-PENDENTE / P      |
| RF-09 | Webhooks autenticados e idempotentes                   | US-08               | AS-06, AS-03, AS-09                 | API de webhook; controle de evento/duplicidade; credencial própria    | CT-RF09-01, CT-RF09-02, CT-RF09-03 | EV-PENDENTE / P      |
| RF-10 | Alertas de estoque e exceções                          | US-09               | AS-04, AS-06, AS-09                 | Consulta de saldos, alertas e monitoramento operacional               | CT-RF10-01, CT-RF10-02             | EV-PENDENTE / P      |
| RF-11 | Dashboard com indicadores reais                        | US-10               | AS-04, AS-05, AS-09                 | Consultas de indicadores e gráficos React                             | CT-RF11-01                         | EV-PENDENTE / P      |
| RF-12 | Previsão de demanda                                    | US-11               | AS-07, AS-08, AS-04, AS-09          | Dataset, baseline, modelo avaliado, inferência e UI                   | CT-RF12-01, CT-RF12-02             | EV-PENDENTE / P      |
| RF-13 | Correção compensatória de entrada manual com auditoria | US-12               | AS-01, AS-03, AS-04, AS-05, AS-09   | Prévia + confirmação autenticada, transação, vínculo de correção      | CT-RF13-01 a CT-RF13-05            | EV-PENDENTE / P      |

**Observação:** a AS-01 é a origem do contrato RF-13, não a etapa de implementação da funcionalidade. As Issues AS-03/04/05/09 tratam de suas partes de autorização, interface, API e testes.

## 4. Catálogo inicial de testes funcionais (proposto)

### 4.1 Autenticação, RBAC e produtos

| ID         | Entrada / ação                                     | Resultado esperado                         | Condição a verificar                |
| ---------- | -------------------------------------------------- | ------------------------------------------ | ----------------------------------- |
| CT-RF01-01 | Usuário ativo informa credenciais válidas          | Login aceito e acesso ao perfil autorizado | Identidade autenticada              |
| CT-RF01-02 | Usuário informa senha incorreta                    | Login rejeitado; acesso não concedido      | `401`, sem vazamento de credenciais |
| CT-RF02-01 | Chamar operação protegida sem autenticação         | Rejeição da API                            | `401 Unauthorized`                  |
| CT-RF02-02 | Operador tenta operação exclusiva do Administrador | Rejeição sem mutação de dados              | `403 Forbidden`                     |
| CT-RF03-01 | Cadastrar produto com SKU novo e campos válidos    | Produto persistido e consultável           | SKU único                           |
| CT-RF03-02 | Cadastrar produto com SKU já existente             | Rejeição; nenhum duplicado criado          | `409` ou contrato validado          |
| CT-RF04-01 | Alterar nome de produto com saldo 12               | Nome alterado; saldo permanece 12          | Separação cadastro/saldo            |
| CT-RF04-02 | Operador tenta alterar preço                       | Rejeição; preço não muda                   | RBAC de campo comercial             |

### 4.2 Movimentações, histórico e importação

| ID         | Entrada / ação                                             | Resultado esperado                                                   | Condição a verificar              |
| ---------- | ---------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------- |
| CT-RF05-01 | Saldo 5; entrada válida de 10                              | Saldo 15 e movimentação auditada                                     | Atualização e histórico atômicos  |
| CT-RF06-01 | Saldo 8; saída de 3                                        | Saldo 5 e saída registrada                                           | Histórico consistente             |
| CT-RF06-02 | Saldo 5; saída de 6                                        | Rejeição; saldo 5; nenhuma saída gravada                             | Sem estoque negativo              |
| CT-RF07-01 | Consultar produto com entrada registrada                   | Exibir tipo, motivo, data e saldos                                   | Rastreabilidade                   |
| CT-RF07-02 | Tentar modificar ou apagar movimento original              | Operação negada                                                      | Imutabilidade                     |
| CT-RF08-01 | SKU existente com saldo 12; planilha informa quantidade 50 | Atualizar cadastro permitido; manter saldo 12                        | Reimportação sem reset de estoque |
| CT-RF08-02 | Arquivo com SKU duplicado ou valor inválido                | Rejeitar ou sinalizar erro segundo contrato; sem alterações parciais | Validação e rollback              |

### 4.3 Webhooks, alertas, dashboard, ML e RF-13

| ID         | Entrada / ação                                                       | Resultado esperado                                | Condição a verificar                  |
| ---------- | -------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------- |
| CT-RF09-01 | Enviar evento externo válido e autenticado                           | Uma movimentação; evento registrado               | Origem, ID e transação                |
| CT-RF09-02 | Reenviar evento com mesma origem, ID e conteúdo                      | Nenhuma segunda movimentação                      | Idempotência                          |
| CT-RF09-03 | Enviar evento sem credencial de integração                           | Rejeição sem alteração de saldo                   | `401`, credencial separada do usuário |
| CT-RF10-01 | Produto ativo com saldo = mínimo                                     | Exibir na lista de atenção                        | Comparação `<= estoque_minimo`        |
| CT-RF10-02 | Produto ativo com saldo zero                                         | Identificar como sem estoque                      | Alerta de ruptura                     |
| CT-RF11-01 | Registrar entrada e atualizar dashboard                              | Indicadores refletem valores da API               | Sem contagem fictícia não sinalizada  |
| CT-RF12-01 | Modelo validado e previsão disponível                                | Exibir valor, horizonte e identificação do modelo | Estimativa distinta de saldo real     |
| CT-RF12-02 | Não existe modelo aprovado/previsão válida                           | Informar indisponibilidade; não inventar previsão | Falha segura                          |
| CT-RF13-01 | Entrada 15; saída 3; correção autorizada para 10                     | Delta −5; saldo 7; original preservado            | Compensação auditável                 |
| CT-RF13-02 | Operador tenta confirmar correção                                    | API retorna `403`; saldo/histórico inalterados    | RBAC específico                       |
| CT-RF13-03 | Entrada original 15; saldo atual 3; corrigir para 10                 | Conflito; saldo 3; não gravar compensação         | Rejeitar saldo negativo               |
| CT-RF13-04 | Repetir solicitação de correção com mesma chave e payload            | Não gerar nova compensação                        | Idempotência da correção              |
| CT-RF13-05 | Saldo mudou depois da prévia; confirmar usando saldo esperado antigo | Rejeitar conflito e exigir nova prévia            | Concorrência/`409`                    |

**Padrão de execução a preencher para cada CT:** `ID | commit | data | ambiente | executor | resultado esperado | resultado observado | PASS/FAIL/BLOCKED | link da evidência`. Até que isso seja feito, os casos acima são **roteiros**, não evidências.

## 5. Matriz dos requisitos não funcionais

Todos os RNF-01 a RNF-05 constam como **Must Have** na especificação. A métrica abaixo foi **copiada da meta planejada**; não há resultados medidos registrados nesta minuta.

| RNF                     | Meta verificável definida                                                                                          | Issues              | Método proposto / caso                                                        | Evidência real esperada                                        | Situação        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------- |
| RNF-01 — Desempenho     | `GET /produtos`: p95 ≤ 1 s com 1.000 produtos e 10 usuários concorrentes, em ambiente documentado                  | AS-09, AS-10        | CT-RNF01-01: teste de carga, repetição e cálculo de p95                       | Relatório de latência, máquina, configuração e commit          | P / EV-PENDENTE |
| RNF-02 — Segurança      | 100% das operações críticas com autenticação e autorização adequadas, incluindo RF-13                              | AS-03, AS-09        | CT-RNF02-01: matriz de cenários autenticado/não autenticado/perfil inadequado | Relatório de `401/403`, endpoints e permissões                 | P / EV-PENDENTE |
| RNF-03 — Confiabilidade | Nenhum saldo negativo, duplicidade ou gravação parcial em 100 cenários controlados de erro, reenvio e concorrência | AS-05, AS-06, AS-09 | CT-RNF03-01: bateria de 100 cenários de rollback, repetição e concorrência    | Planilha/log dos cenários, valores observados e versão         | P / EV-PENDENTE |
| RNF-04 — Testabilidade  | Cobertura automatizada ≥ 70% dos serviços centrais de negócio                                                      | AS-09, AS-10        | CT-RNF04-01: medir cobertura com escopo dos módulos explicitado               | Relatório de cobertura por módulo e commit                     | P / EV-PENDENTE |
| RNF-05 — Usabilidade    | Pelo menos 4 de 5 participantes completam 3 tarefas essenciais sem assistência, até 5 min por tarefa               | AS-04, AS-09, AS-12 | CT-RNF05-01: teste moderado com roteiro fixo, tarefas e tempos                | Consentimento quando cabível; resultados anonimizados e tempos | P / EV-PENDENTE |

**Atenção:** sem executar os testes e obter dados, não registrar os RNFs como atendidos. Se as metas mudarem, atualizar primeiro a especificação `docs/requisitos.md`, mantendo histórico e justificativa da decisão.

## 6. Rastreabilidade das regras de negócio

| Regra | Restrição                                                  | RF relacionado             | Testes propostos                               |
| ----- | ---------------------------------------------------------- | -------------------------- | ---------------------------------------------- |
| RN-01 | SKU único e não vazio                                      | RF-03, RF-08               | CT-RF03-01/02, CT-RF08-02                      |
| RN-02 | Saldo de estoque não negativo                              | RF-06, RF-13               | CT-RF06-02, CT-RF13-03                         |
| RN-03 | Alterações de saldo exigem histórico                       | RF-05, RF-06, RF-07, RF-13 | CT-RF05-01, CT-RF06-01, CT-RF07-01, CT-RF13-01 |
| RN-04 | Webhook duplicado não aplica duas vezes                    | RF-09                      | CT-RF09-02                                     |
| RN-05 | Ações administrativas/correção exigem permissão            | RF-02, RF-04, RF-13        | CT-RF02-02, CT-RF04-02, CT-RF13-02             |
| RN-06 | Importações validam cabeçalho, tipos e duplicidades        | RF-08                      | CT-RF08-02                                     |
| RN-07 | Histórico original preservado; correção gera novo registro | RF-07, RF-13               | CT-RF07-02, CT-RF13-01/04                      |

## 7. Particionamento de equivalência e análise de valor-limite

Estes são **exemplos de técnicas de projeto de teste**, e ainda não foram executados.

| Domínio            | Classe/limite válido                                                      | Classe/limite inválido                                                        | Teste associado                                    |
| ------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------- |
| Entrada de estoque | Quantidade inteira `>= 1`                                                 | `0`, negativo, texto                                                          | CT-RF05-01 + casos complementares a criar na AS-09 |
| Saída              | `1 <= quantidade <= saldo_atual`                                          | `saldo_atual + 1`, quantidade não positiva                                    | CT-RF06-01/02                                      |
| SKU de produto     | String não vazia, não duplicada                                           | Vazia, apenas espaços ou já cadastrada                                        | CT-RF03-01/02                                      |
| Importação         | CSV/XLSX com cabeçalho e valores válidos                                  | Coluna obrigatória ausente, SKU repetido, preço inválido                      | CT-RF08-01/02                                      |
| Webhook            | Evento com credencial válida e ID único                                   | Sem credencial, repetido com payload divergente                               | CT-RF09-01/02/03; adicionar divergência à AS-09    |
| RF-13              | `quantidade_correta >= 0`, diferente da original, saldo novo não negativo | Quantidade negativa, sem efeito, saldo projetado negativo, replay conflitante | CT-RF13-01/03/04/05 + limites a detalhar           |

Em cada teste de valor-limite, verificar _o valor na borda_ e valores imediatamente abaixo/acima quando aplicáveis; não assumir que apenas um cenário por classe esgota os testes.

## 8. Registro de evidências — modelo a preencher

**Não inventar** participantes, testes, métricas, capturas de tela, logs ou resultados. Usar links permanentes para PR, commit, relatório de execução ou artefato quando estiver disponível.

| CT / RNF    | Data/hora   | Commit      | Ambiente/dados | Resultado observado | Estado | Evidência (link/caminho) |
| ----------- | ----------- | ----------- | -------------- | ------------------- | ------ | ------------------------ |
| CT-RF01-01  | A registrar | A registrar | A registrar    | Não executado       | P      | EV-PENDENTE              |
| CT-RF08-01  | A registrar | A registrar | A registrar    | Não executado       | P      | EV-PENDENTE              |
| CT-RF13-01  | A registrar | A registrar | A registrar    | Não executado       | P      | EV-PENDENTE              |
| CT-RNF01-01 | A registrar | A registrar | A registrar    | Não medido          | P      | EV-PENDENTE              |
| CT-RNF04-01 | A registrar | A registrar | A registrar    | Não medido          | P      | EV-PENDENTE              |

**Exemplos de fontes aceitáveis:** saída de `pytest` com commit e ambiente, relatório de cobertura, resultados do GitHub Actions, gravação/captura do teste de interface (sem dados sensíveis), relatório experimental de ML, registro de teste de usabilidade com participantes anonimizados e relatório de carga.

## 9. Fluxo de atualização da matriz

1. **Antes da implementação:** confirmar RF/RNF, US, Issue, critério de aceite e CT planejado; corrigir inconsistências na fonte antes de criar novos identificadores.
2. **Na implementação:** identificar módulo/rota/componente efetivamente alterado e vincular PR ou commit aprovado.
3. **Na revisão de PR:** conferir aderência ao contrato, autorização, segurança, rollback e cobertura pertinente; atualizar somente evidências reais.
4. **Após testes:** vincular artefatos e registrar `PASS`, `FAIL` ou `BLOCKED` com ambiente e versão.
5. **Na homologação (AS-12):** verificar cobertura completa de cada Must Have, pendências, limitações e concordância entre implementação e relatórios acadêmicos.
6. **Quando houver mudança de escopo:** alterar `requisitos.md`, histórias, Issues, testes e esta matriz de maneira coerente, registrando a decisão.

### 9.1 Critérios de completude para a AS-11

- [x] RF-01 a RF-13 vinculados a pelo menos uma história e Issue na **minuta**.
- [x] RNF-01 a RNF-05 vinculados a critérios mensuráveis e testes propostos na **minuta**.
- [x] RN-01 a RN-07 relacionados a testes propostos.
- [ ] Responsáveis pelas Issues validaram os vínculos.
- [ ] Componentes **realmente implementados** associados aos requisitos e respectivos commits.
- [ ] Casos de teste reais/automatizados receberam IDs rastreáveis e foram executados.
- [ ] Evidências e resultados observados preenchidos.
- [ ] Requisitos obrigatórios têm validação e tratamento explícito de pendências.
- [ ] Matriz revisada e aprovada no Pull Request da AS-11.

## 10. Referências de execução e links

- **Repositório:** https://github.com/IkaroGLT/AutoStock-Intelligence
- **Branch documental:** https://github.com/IkaroGLT/AutoStock-Intelligence/tree/docs/as11-documentacao
- **Issue AS-11:** https://github.com/IkaroGLT/AutoStock-Intelligence/issues/11
- **AS-01 (fonte de escopo):** https://github.com/IkaroGLT/AutoStock-Intelligence/issues/1
- **AS-02 (base inicial):** https://github.com/IkaroGLT/AutoStock-Intelligence/issues/2
- **Referência independente:** https://github.com/IkaroGLT/Mock_Estoque_API

---

**Próxima revisão prevista:** após integração de AS-03, AS-04, AS-05 e AS-06; depois complementar com resultados das AS-07 a AS-10 e evidências da AS-12. Toda referência a implementação ou teste validado deve ser apoiada por evidência verificável.
