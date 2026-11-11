# AutoStock Intelligence — Avaliação de Qualidade de Software com base na ISO/IEC 25010

**Issue:** AS-11 — Documentação Técnica e Acadêmica
**Versão:** 0.1 — Plano de avaliação, sujeito à revisão técnica e acadêmica
**Data de referência:** 10/11/2026
**Situação:** critérios e procedimentos propostos; **não representa auditoria ISO, certificação ou resultados de testes concluídos**.

> **Regra de evidência:** não declarar um requisito não funcional como atendido sem uma execução identificável por versão/commit, ambiente, dados, método, resultado observado, responsável e evidência verificável. A existência de um documento ou de um teste planejado não comprova qualidade operacional.

## 1. Objetivo e escopo

Organizar a avaliação de qualidade do **AutoStock Intelligence**, um sistema acadêmico de controle de estoque construído com frontend React/TypeScript, API FastAPI, SQLite e um módulo planejado de Machine Learning. A avaliação pretende demonstrar, com evidências, o atendimento dos requisitos de produto, o comportamento seguro e a capacidade de evolução da aplicação.

Esta análise prioriza as dimensões solicitadas na [Issue AS-11](https://github.com/IkaroGLT/AutoStock-Intelligence/issues/11):

1. Adequação funcional.
2. Eficiência de desempenho.
3. Segurança.
4. Confiabilidade.
5. Capacidade de interação (incluindo aspectos de usabilidade).
6. Manutenibilidade.

Também registra, de forma complementar e sem pretender comprovação integral, aspectos de compatibilidade, flexibilidade e segurança operacional (_safety_).

**Fronteira da avaliação:** o produto AutoStock Intelligence, e não o projeto independente [Mock_Estoque_API](https://github.com/IkaroGLT/Mock_Estoque_API). O Mock é uma referência técnica; testes executados nele não são automaticamente evidência do AutoStock.

## 2. Base normativa e terminologia

A [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) define um modelo de qualidade de produto com **nove características**. A edição de 2023 substitui a edição de 2011 e emprega **interaction capability** (capacidade de interação) no lugar da característica denominada _usability_ na versão anterior. A categoria **flexibility** substitui o nome _portability_, e **safety** passa a integrar o modelo de produto.

| Característica da edição 2023 (tradução de trabalho) | Aplicação ao AutoStock                                           | Abordagem nesta AS-11                       |
| ---------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------- |
| Adequação funcional (_functional suitability_)       | Fluxos de usuários e requisitos RF-01 a RF-13                    | Avaliação prioritária                       |
| Eficiência de desempenho (_performance efficiency_)  | Latência e carga da API                                          | Avaliação prioritária                       |
| Compatibilidade (_compatibility_)                    | Comunicação React–FastAPI, API/webhooks e ambientes              | Registro complementar                       |
| Capacidade de interação (_interaction capability_)   | Interface compreensível, acessível e operável                    | Avaliação prioritária                       |
| Confiabilidade (_reliability_)                       | Integridade, transações, tolerância a falhas e recuperação       | Avaliação prioritária                       |
| Segurança (_security_)                               | Autenticação, RBAC, isolamento de credenciais, proteção de dados | Avaliação prioritária                       |
| Manutenibilidade (_maintainability_)                 | Modularidade, testabilidade e modificabilidade                   | Avaliação prioritária                       |
| Flexibilidade (_flexibility_)                        | Adaptação e implantação em ambientes compatíveis                 | Registro complementar                       |
| Segurança operacional (_safety_)                     | Prevenção de efeitos operacionais indesejáveis                   | Registro complementar, conforme pertinência |

**Limite de interpretação:** o teste de usuários estabelecido no RNF-05 fornece evidência prática sobre uso da interface; ele não substitui a totalidade das avaliações de capacidade de interação nem uma avaliação formal de qualidade em uso. A classificação das seis dimensões acima é um **recorte do projeto**, não a lista completa da norma.

## 3. Documentos e rastreabilidade

**Fontes de escopo do AutoStock:**

- [Especificação de requisitos](../requisitos.md) — RF-01 a RF-13, RNF-01 a RNF-05 e RN-01 a RN-07.
- [Arquitetura](../arquitetura.md) — componentes e decisões de design.
- [Matriz de permissões](../matriz-permissoes.md) — Administrador, Operador e integração.
- [Contrato RF-13](../contrato-rf13.md) — correção compensatória, autorização e idempotência.
- [Histórias e BDD](historias-bdd.md) — US-01 a US-12 e cenários propostos.
- [Matriz de rastreabilidade](matriz-rastreabilidade.md) — IDs `CT-RFxx-yy` e `CT-RNFxx-yy`.
- [Estratégia de testes](estrategia-testes.md) — métodos e requisitos para evidências.
- [Contextualização](contextualizacao.md) — problema, escopo, público e limitações.

**Status do projeto na referência inicial (10/11/2026):** AS-01 e AS-02 integradas à `main`; a AS-02 disponibilizou a estrutura React/FastAPI/SQLite, endpoint `/health`, testes básicos e diretórios de ML. Funcionalidades de autenticação, operações completas, dashboard integrado, automação e inferência pertencem a Issues posteriores, até que haja implementação e validação verificadas.

A aprovação dos textos acadêmicos **não equivale** à aprovação técnica dos requisitos funcionais ou não funcionais.

## 4. Critérios de qualidade adotados pelo projeto

Os valores abaixo foram definidos em `docs/requisitos.md`. Não são limites impostos universalmente pela ISO/IEC 25010.

| Requisito                  | Meta mensurável previamente especificada                                                                                       | Caso de verificação | Equipe/Issues       | Estado inicial |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ------------------- | -------------- |
| **RNF-01 — Desempenho**    | `GET /produtos` com **p95 ≤ 1 segundo**, base de **1.000 produtos**, **10 usuários concorrentes** e ambiente definido          | `CT-RNF01-01`       | AS-09, AS-10        | Não medido     |
| **RNF-02 — Segurança**     | **100% das operações críticas** exigem autenticação e autorização corretas, inclusive RF-13                                    | `CT-RNF02-01`       | AS-03, AS-09        | Não comprovado |
| **RNF-03 — Integridade**   | **Zero** saldo negativo, movimento duplicado ou gravação parcial em **100 cenários controlados** de falha/reenvio/concorrência | `CT-RNF03-01`       | AS-05, AS-06, AS-09 | Não medido     |
| **RNF-04 — Testabilidade** | Cobertura automatizada de **pelo menos 70%** dos serviços centrais de negócio                                                  | `CT-RNF04-01`       | AS-09, AS-10        | Não medida     |
| **RNF-05 — Usabilidade**   | **Ao menos 4 de 5 participantes** completam **3 tarefas essenciais** sem ajuda, em até **5 minutos por tarefa**                | `CT-RNF05-01`       | AS-04, AS-09, AS-12 | Não avaliado   |

Se qualquer meta for alterada, registrar decisão da equipe e atualizar primeiro `docs/requisitos.md`, depois `matriz-rastreabilidade.md`, `estrategia-testes.md` e este documento.

## 5. Método de avaliação e estados permitidos

### 5.1. Procedimento geral

1. **Definir a versão:** registrar commit SHA da aplicação e versões das dependências relevantes.
2. **Confirmar o contrato:** identificar RNF/RF/US/CT e pré-condições da avaliação.
3. **Preparar ambiente reproduzível:** sistema operacional, hardware quando pertinente, versão Python/Node, configuração de serviço e banco de teste isolado.
4. **Preparar massa de dados:** registrar tamanho, origem, caráter real ou sintético e condições iniciais do estoque; evitar dados pessoais nos artefatos públicos.
5. **Executar:** registrar ferramenta, comandos, duração/repetições e condições de observação.
6. **Comparar:** confrontar o valor observado com o limite previamente especificado.
7. **Guardar evidência:** relatório, log sanitizado, captura ou artefato com localização estável e acesso apropriado.
8. **Registrar conclusão:** `PASS`, `FAIL`, `BLOCKED` ou `NOT_RUN` por caso, nunca por impressão subjetiva.
9. **Revisar:** a equipe responsável valida a metodologia e anota ressalvas, limitações e defeitos.

### 5.2. Significado dos estados

| Estado         | Utilização permitida                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| `NOT_RUN`      | Planejado, mas ainda não executado                                                         |
| `BLOCKED`      | Execução impedida por dependência/ambiente; registrar motivo                               |
| `PASS`         | Execução reproduzível satisfez o critério definido; incluir evidência                      |
| `FAIL`         | Execução realizada não satisfez o critério; abrir ou referenciar defeito                   |
| `INCONCLUSIVE` | Dados de execução insuficientes para afirmar sucesso/falha; não contabilizar como aprovado |

**Não transformar ausência de erro observado em comprovação de 100% de segurança ou confiabilidade.** Metas condicionais aplicam-se às operações inventariadas e ao conjunto de cenários explicitamente testado.

## 6. Adequação funcional

### 6.1. Objetivo

Verificar se os recursos implementados correspondem ao comportamento solicitado pelos atores e cobrem corretamente os requisitos funcionais. A avaliação deve considerar disponibilidade, exatidão das operações e pertinência das funcionalidades.

### 6.2. Critérios do AutoStock

- Mapear todos os **RF-01 a RF-13** a pelo menos uma história, um módulo/rota e um caso de teste com resultado observado.
- Confirmar entradas e saídas com histórico e saldo correto (**RF-05, RF-06, RF-07**).
- Confirmar importação sem redefinir saldo existente (**RF-08**).
- Confirmar processamento idempotente de eventos (**RF-09**).
- Confirmar indicadores de dashboard derivados da API (**RF-11**) e previsões identificadas como estimativas (**RF-12**), quando implementados.
- Verificar **RF-13** como **nova movimentação compensatória**, e não substituição do saldo, preservando o registro original.

### 6.3. Procedimento e evidências

1. Na matriz de rastreabilidade, revisar cada `RF` e os casos `CT-RFxx-yy`.
2. Identificar quais componentes e commits **realmente** implementam cada requisito; manter pendente o que não existe.
3. Executar casos positivos, negativos e de fronteira. Quando houver efeitos no banco, inspecionar o estado persistido.
4. Registrar o resultado observado por caso e vincular PR/commit/relatório.
5. Reportar separadamente: **RFs especificados**, **RFs implementados** e **RFs validados**; não confundir essas contagens.

**Métrica de acompanhamento (proposta):** `RFs com critérios de aceite validados / 13`. Não usar o indicador como única prova da adequação funcional; cenários relevantes precisam estar aprovados.

**Risco principal:** afirmar que o Mock anterior já comprova os RFs no AutoStock.

**Estado em 10/11/2026:** cobertura planejada documentalmente, sem validação integral dos RFs.

## 7. Eficiência de desempenho — RNF-01

### 7.1. Objetivo

Verificar a latência do endpoint de listagem de produtos sob a condição especificada: `GET /produtos`, **1.000 produtos** no banco, **10 usuários concorrentes**, **p95 ≤ 1 segundo**.

### 7.2. Método sugerido — `CT-RNF01-01`

1. Aguardar a implementação e a proteção adequada do endpoint `GET /produtos`.
2. Preparar banco isolado com 1.000 produtos válidos; registrar procedimento e características dos registros.
3. Configurar autenticação de teste, se exigida, sem divulgar credenciais.
4. Definir e documentar hardware, SO, Python, servidor ASGI, quantidade de workers, duração, aquecimento, ferramenta de carga e rede usada.
5. Simular **10 clientes concorrentes** realizando a requisição sob um perfil de carga documentado.
6. Coletar durações de todas as requisições válidas, erros HTTP, volume total e **p95**; informar unidade e método de cálculo.
7. Confrontar o p95 medido com 1.000 ms e declarar as condições reais do experimento. Reportar também taxa de erros; não esconder falhas ao calcular somente requisições bem-sucedidas.
8. Repetir a avaliação quando mudanças relevantes afetarem consultas, índices ou autenticação.

**Critério de aprovação:** p95 ≤ 1 s **nas condições especificadas**, sem omitir erro ou ambiente. Se duração/carga amostral não forem suficientes, classificar como inconclusivo.

**Evidência esperada:** relatório de carga com configuração, commit, tamanho do banco, duração, número de chamadas, p50/p95/p99 quando disponível, erros, gráficos e conclusão.

**Responsáveis:** AS-09 e AS-10, com colaboração de AS-05.

**Estado:** `NOT_RUN` — nenhuma medição de carga documentada neste relatório.

## 8. Segurança — RNF-02

### 8.1. Objetivo

Avaliar se as ações críticas são restringidas conforme a identidade do solicitante e a [matriz de permissões](../matriz-permissoes.md), mantendo **webhooks com credencial separada** de usuários humanos.

### 8.2. Procedimento — `CT-RNF02-01`

1. Inventariar todas as rotas e ações críticas efetivamente implementadas; indicar método HTTP, ator autorizado e permissão.
2. Testar sem autenticação: resposta **401**, sem mudança no banco.
3. Testar identidade válida, porém sem permissão: resposta **403**, sem mudança no banco.
4. Testar identidade válida e autorizada: operação executada conforme regras de negócio.
5. Avaliar permissão em nível de campo: Operador não pode alterar preços ou parâmetros reservados ao Administrador.
6. Avaliar RF-13: somente Administrador pode confirmar correções; ID do usuário deve vir do backend autenticado.
7. Validar hashes de senha e gerenciamento de sessões/tokens conforme decisão AS-03; não armazenar senhas em texto puro nem segredos em logs ou commits.
8. Testar webhooks sem credencial, com credencial incorreta e com credencial própria válida; rejeitar tentativa de usar login humano como autorização para ingestão.
9. Documentar todas as operações inventariadas, respectivas verificações e os resultados; reavaliar após inclusão de novos endpoints.

**Métrica:** `ações críticas cuja matriz de acesso foi comprovada / total de ações críticas inventariadas`, com **meta 100%**. Só usar 100% se todas as operações inventariadas tiverem cenários relevantes aprovados.

**Casos funcionais relacionados:** `CT-RF01-01/02`, `CT-RF02-01/02`, `CT-RF04-02`, `CT-RF09-03`, `CT-RF13-02`.

**Evidência esperada:** inventário de rotas, matriz usuário/permissão/resultado esperado/observado, testes e evidências sanitizadas, inclusive dados preservados após negativas.

**Estado:** `NOT_RUN` para o conjunto completo — autenticação e RBAC da AS-03 não foram comprovados neste documento.

## 9. Confiabilidade e integridade — RNF-03

### 9.1. Objetivo

Verificar que operações, reenvios e falhas controladas não geram **saldo negativo**, **movimentações duplicadas** ou **gravações parciais** em um conjunto documentado de **100 cenários**.

### 9.2. Procedimento — `CT-RNF03-01`

1. Planejar 100 cenários numerados, com entradas, saídas, importações, eventos repetidos, concorrência, falhas antes do `COMMIT`, reprocessamentos e correção RF-13.
2. Preparar banco isolado; registrar estado anterior, quantidade e histórico de cada produto.
3. Executar cada cenário, inclusive as falhas simuladas, sem modificar dados de desenvolvimento ou produção.
4. Verificar, após cada operação, restrições do banco, saldo, histórico, evento e resultado HTTP.
5. Inspecionar rollback: uma falha não pode atualizar apenas o saldo ou apenas o histórico.
6. Validar idempotência por `origem + evento_id` e por chave da correção RF-13 conforme seus contratos, inclusive reenvio concorrente.
7. Garantir que o histórico de correção registra a compensação e preserva a entrada original.
8. Consolidar os 100 resultados com situação, ambiente, efeito persistido, evidência e defeito correspondente.

**Critério:** nenhum caso do conjunto controlado pode produzir os três tipos de violação descritos no RNF-03. O resultado se limita aos cenários testados e não comprova ausência absoluta de falhas em produção.

**Casos relacionados:** `CT-RF05-01`, `CT-RF06-02`, `CT-RF08-01/02`, `CT-RF09-01/02`, `CT-RF13-01/03/04/05`.

**Evidência esperada:** planilha/relatório dos 100 cenários, logs sanitizados, resultados de transação, snapshots ou consultas de estado e histórico, commits.

**Estado:** `NOT_RUN` — suíte de 100 cenários ainda sem comprovação.

## 10. Capacidade de interação e usabilidade — RNF-05

### 10.1. Objetivo

Avaliar se usuários representativos conseguem compreender e operar as telas principais em condições definidas. A AS-11 mede o critério operacional previamente fixado, sem atribuir ao sistema um selo formal de usabilidade.

### 10.2. Roteiro proposto — `CT-RNF05-01`

1. Confirmar que a AS-04/05 dispõe de interface navegável e que os fluxos a testar funcionam.
2. Recrutar **5 participantes reais** compatíveis com o público-alvo; registrar perfil geral anonimizado e consentimento quando cabível.
3. Definir previamente **3 tarefas essenciais iguais para todos**, por exemplo: encontrar um produto, registrar uma entrada de teste e identificar produto abaixo do mínimo. Validar tarefas finais com a equipe antes do teste.
4. Apresentar instruções padronizadas, sem ensinar a sequência de cliques.
5. Cronometrar individualmente cada tarefa e registrar conclusão, erros, dúvidas e solicitações de ajuda.
6. Considerar um participante bem-sucedido no RNF somente se concluir **as 3 tarefas sem assistência, cada uma em até 5 minutos**.
7. Contar participantes que cumpriram o conjunto completo; a meta é **pelo menos 4 de 5**.
8. Documentar limitações da amostra, versão da interface, dispositivo/navegador, roteiro e evidências anonimizadas.

**Complementos qualitativos:** legibilidade, rótulos, foco visível, navegação por teclado, feedback de erro, estados vazios e responsividade. Não declarar conformidade formal com WCAG sem auditoria própria e escopo definido.

**Evidência esperada:** roteiro, tabela anonimizada com 5 linhas, três durações e sucesso/ajuda por pessoa, capturas autorizadas, síntese de dificuldades e revisão da interface.

**Estado:** `NOT_RUN` — nenhuma sessão de teste com usuários registrada neste documento.

## 11. Manutenibilidade e testabilidade — RNF-04

### 11.1. Objetivo

Avaliar a capacidade de compreender, testar, modularizar e modificar o sistema sem criar regressões. O RNF-04 cobre diretamente **testabilidade**, enquanto a avaliação de manutenibilidade também considera organização e facilidade de modificação.

### 11.2. Plano de avaliação — `CT-RNF04-01`

1. Delimitar os **serviços centrais de negócio**: autenticação/permissões, produtos/estoque, movimentações/correções, importações e webhooks, conforme os módulos efetivamente implementados.
2. Registrar os módulos incluídos e as exclusões justificadas do cálculo de cobertura.
3. Medir cobertura por ferramenta apropriada após instalar as dependências de teste aprovadas (`pytest-cov` ou equivalente, se adotado).
4. Executar testes isolados e verificar taxa de cobertura reportada, por arquivo e total agregado.
5. Comparar o valor apurado com **70%**; indicar explicitamente se a cobertura mede linhas, branches ou outro critério.
6. Inspecionar módulos críticos com pouca cobertura, duplicações evidentes, acoplamento inadequado e ausência de testes negativos.
7. Registrar `npm run lint` e `npm run build` quando o frontend estiver no escopo de revisão; não confundi-los com cobertura de serviços centrais Python.
8. Atualizar medições a cada integração relevante e preservar relatórios vinculados ao commit.

**Critério quantitativo:** cobertura automatizada ≥ 70% do escopo de serviços centrais especificado. **Complementos qualitativos:** arquitetura modular, nomes claros, limites entre rotas/serviços/dados, revisão por Pull Request e documentação atualizada.

**Comando ilustrativo (executar somente se `pytest-cov` for dependência instalada e o escopo for validado, dentro de `backend/`):**

```powershell
.\.venv\Scripts\python.exe -m pytest --cov=app --cov-report=term-missing
```

Esse comando **não é evidência** de que a meta tenha sido atendida e pode precisar ser ajustado ao pacote e às exclusões definidos pela AS-09.

**Evidência esperada:** relatório por arquivo, comando, versão da ferramenta, commit, relação de arquivos excluídos, revisão de PR e defeitos de regressão.

**Estado:** `NOT_RUN` — cobertura central ainda não medida neste documento.

## 12. Características complementares da edição 2023

Estas características pertencem ao modelo de nove dimensões, porém não têm **metas numéricas próprias** definidas entre RNF-01 a RNF-05. Sua avaliação formal exige escopo e critérios adicionais aprovados.

| Característica                       | Evidência a considerar no projeto                                                                                                                    | Situação                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Compatibilidade**                  | CORS e contrato React ↔ FastAPI; interoperabilidade de eventos e arquivos CSV/XLSX; coexistência com ferramentas de desenvolvimento                  | Aspectos planejados; sem homologação específica                   |
| **Flexibilidade**                    | Possibilidade de executar localmente com configuração por ambiente, reorganizar módulos e adaptar a implantação quando necessário                    | Aspectos planejados; sem medição específica                       |
| **Segurança operacional (_safety_)** | Regras que evitem danos operacionais decorrentes de saídas inválidas, corrupção de saldo ou processamento incorreto; avisos e recuperação controlada | Aspectos pertinentes ao estoque; sem avaliação normativa completa |

**Cuidado conceitual:** _safety_ (segurança frente a efeitos danosos) não é a mesma característica que _security_ (proteção contra acessos/ações indevidas). No AutoStock, há interseções práticas, mas os objetivos não se confundem.

## 13. Registro consolidado de riscos de qualidade

| Risco                                                | Característica afetada                          | Prevenção/avaliação                                | Situação                   |
| ---------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------- | -------------------------- |
| Usuário Operador altera preço ou confirma RF-13      | Segurança, adequação funcional                  | RBAC no backend; cenários 401/403 e auditoria      | A verificar na AS-03/05/09 |
| Reimportação redefine saldo existente                | Confiabilidade, adequação funcional             | Testes `CT-RF08-01/02`; transação por importação   | A verificar na AS-06/09    |
| Webhook repetido movimenta estoque duas vezes        | Confiabilidade                                  | Deduplicação e testes de concorrência              | A verificar na AS-06/09    |
| Correção histórica sobrescreve saldo e ignora saídas | Adequação funcional, confiabilidade             | Contrato RF-13; compensação por delta              | A verificar na AS-05/09    |
| Dashboard exibe dados fictícios como reais           | Adequação funcional, capacidade de interação    | Contrato de API e identificação de demonstrações   | A verificar na AS-04/05    |
| APIs degradam com aumento de registros               | Desempenho                                      | Ensaio RNF-01, análise de consultas/índices        | A verificar na AS-09/10    |
| ML é apresentado sem avaliação temporal adequada     | Adequação funcional, confiança na interpretação | Baseline, divisão temporal e métricas verificáveis | A verificar na AS-07/08    |
| Documentação relata testes não executados            | Qualidade da evidência acadêmica                | Tabela de estado + vínculo a log/commit            | Controle contínuo AS-11    |

## 14. Modelo de ficha de medição e evidência

Copiar a ficha somente **após** executar cada verificação. Não publicar segredos, dados pessoais identificáveis ou tokens de autenticação.

```text
Título da verificação:
Característica ISO/IEC 25010:2023:
Requisito: RNF-__ / RF-__
ID do teste: CT-RNF__-__ / CT-RF__-__
Issue e responsável:
Commit / PR da versão testada:
Data, horário e executor:
Ambiente: SO, hardware, ferramentas, versões, configurações
Banco/dataset: tamanho, origem e natureza (real/sintético)
Condições, preparação e duração:
Passos/comandos realmente executados:
Critério esperado (meta do requisito):
Resultado observado: PENDENTE
Estado: NOT_RUN
Evidência verificável: EV-PENDENTE
Limitações e defeitos conhecidos:
Revisão e aprovação:
```

### 14.1. Quadro de resultados para preenchimento posterior

| Característica           | Requisito / caso             | Meta                                           | Resultado observado          | Situação          | Evidência     |
| ------------------------ | ---------------------------- | ---------------------------------------------- | ---------------------------- | ----------------- | ------------- |
| Adequação funcional      | RF-01 a RF-13 / `CT-RFxx-yy` | Critérios de aceite e cenários correspondentes | Não consolidado              | `NOT_RUN`/parcial | `EV-PENDENTE` |
| Eficiência de desempenho | RNF-01 / `CT-RNF01-01`       | p95 ≤ 1 s; 1.000 itens; 10 concorrentes        | Não medido                   | `NOT_RUN`         | `EV-PENDENTE` |
| Segurança                | RNF-02 / `CT-RNF02-01`       | 100% operações críticas protegidas             | Não verificado integralmente | `NOT_RUN`         | `EV-PENDENTE` |
| Confiabilidade           | RNF-03 / `CT-RNF03-01`       | 0 violação em 100 cenários controlados         | Não medido                   | `NOT_RUN`         | `EV-PENDENTE` |
| Capacidade de interação  | RNF-05 / `CT-RNF05-01`       | ≥ 4/5 pessoas; 3 tarefas; ≤ 5 min cada         | Não avaliado                 | `NOT_RUN`         | `EV-PENDENTE` |
| Manutenibilidade         | RNF-04 / `CT-RNF04-01`       | ≥ 70% cobertura dos serviços centrais          | Não medido                   | `NOT_RUN`         | `EV-PENDENTE` |

Não use `PASS` ou `FAIL` nas colunas acima antes da execução documentada. Durante a evolução, desdobrar o resumo por caso e incluir o link da evidência correspondente, sem transformar resultados parciais em aprovação global.

## 15. Integração com as outras Issues e responsabilidades

| Issue         | Contribuição para esta avaliação                     | Artefatos esperados                                      |
| ------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| AS-03         | Autenticação, RBAC e proteção de rotas               | Matriz de endpoints e testes 401/403                     |
| AS-04         | Interface, componentes e estados                     | Evidências de interação, acessibilidade e responsividade |
| AS-05         | API de produtos/estoque, dashboard integrado, RF-13  | Testes de fluxo, histórico e correção                    |
| AS-06         | Importação, webhooks, idempotência, alertas e falhas | Testes e relatórios de integridade                       |
| AS-07 / AS-08 | Preparação do dataset e previsão de demanda          | Metodologia, dataset identificado, métricas e limitações |
| AS-09         | Implementar e consolidar testes                      | Casos, resultados, cobertura e defeitos                  |
| AS-10         | CI e validações não funcionais                       | Logs de Actions e relatórios de medição                  |
| AS-11         | Consolidar avaliação e documentação acadêmica        | Matriz, resultados e textos coerentes                    |
| AS-12         | Homologação e apresentação                           | Aceite final, pendências e evidências de uso             |

**Fluxo sugerido:** responsáveis geram evidências durante o desenvolvimento → AS-09/AS-10 consolidam testes e métricas → AS-11 atualiza tabela com fatos verificáveis → AS-12 revisa o conjunto antes da entrega acadêmica.

## 16. Etapas de revisão deste documento

- [x] Relacionar as seis características prioritárias à AS-11, aos RFs e aos RNFs **no plano documental**.
- [x] Preservar os IDs de casos de teste da matriz de rastreabilidade.
- [x] Diferenciar metas acadêmicas propostas, implementação e medição efetivamente realizada.
- [ ] Conferir método e ferramentas com os responsáveis pelas AS-09/10.
- [ ] Confirmar com a equipe quais aspectos complementares terão avaliação adicional.
- [ ] Executar avaliações RNF-01 a RNF-05 e catalogar evidências.
- [ ] Consolidar resultados dos RFs realmente implementados e validados.
- [ ] Atualizar versão/commit, resultados observados e limitações.
- [ ] Submeter documento à revisão técnica e acadêmica no PR da AS-11.

## 17. Referências

### Fontes normativas e de qualidade

- **ISO/IEC 25010:2023** — _Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model_. Página oficial: <https://www.iso.org/standard/78176.html>.
- **IEC** — registro da ISO/IEC 25010:2023: <https://webstore.iec.ch/en/publication/90024>.

**Nota:** o documento faz uma interpretação aplicada do modelo de qualidade. Não reproduz o texto integral da norma nem representa certificação ou auditoria por entidade acreditada.

### Fontes internas do AutoStock

- [AS-11 — Issue #11](https://github.com/IkaroGLT/AutoStock-Intelligence/issues/11).
- [Repositório AutoStock Intelligence](https://github.com/IkaroGLT/AutoStock-Intelligence).
- `docs/requisitos.md`, `docs/arquitetura.md`, `docs/matriz-permissoes.md`, `docs/contrato-rf13.md`.
- `docs/academico/historias-bdd.md`, `docs/academico/matriz-rastreabilidade.md` e `docs/academico/estrategia-testes.md`.

---

**Próxima atualização:** incorporar medições verificáveis e resultados das AS-03 a AS-10, acompanhando o cronograma e a preparação da entrega AS-12. A análise permanece um **plano de qualidade** até que as verificações sejam executadas.
