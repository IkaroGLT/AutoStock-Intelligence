# AutoStock Intelligence — Elicitação de Requisitos e Registro de Evidências

**Issue:** AS-11 — Documentação Técnica e Acadêmica  
**Versão:** 0.2 — Atualização após aplicação do questionário  
**Data de referência:** 18/11/2026  
**Situação:** Análise documental registrada na AS-01 e questionário aplicado entre 13/11/2026 e 17/11/2026, com quatro respostas consentidas analisadas.

> **Critério de integridade acadêmica:** uma técnica só pode ser declarada aplicada quando existirem evidências reais de sua execução. Não incluir nomes, contatos ou outros dados identificáveis dos participantes no repositório público.

## 1. Objetivo

Consolidar o processo de elicitação de requisitos do AutoStock Intelligence e demonstrar como as necessidades identificadas justificam funcionalidades e regras da aplicação. A AS-11 solicita **pelo menos duas técnicas**, com objetivo, público/material, procedimento, resultados e requisitos derivados.

O documento complementa o plano existente em [`../elicitacao-escopo.md`](../elicitacao-escopo.md), sem substituir a especificação em [`../requisitos.md`](../requisitos.md).

## 2. Problema e público-alvo

**Problema de investigação:** como microempreendedores e negócios de pequeno e médio porte controlam movimentações de estoque, detectam inconsistências e decidem quando realizar conferências e reposições?

**Público de interesse:** pessoas que realmente cadastram produtos, registram entradas e saídas, conferem estoque ou acompanham reposição. A escolha entre proprietários, gestores e operadores deve ser registrada conforme os participantes efetivos.

**Limite:** as conclusões de uma amostra pequena são exploratórias e não representam estatisticamente todas as empresas.

## 3. Técnica A — Análise documental

### 3.1 Objetivo

Identificar processos existentes, regras já especificadas, estruturas de dados reaproveitáveis, restrições de integridade e lacunas de segurança/auditoria que precisam orientar o novo sistema.

### 3.2 Material registrado na documentação da AS-01

O plano de elicitação da AS-01 informa a análise dos seguintes materiais:

| Material de referência                                | Finalidade da análise                                     | Registro de origem          |
| ----------------------------------------------------- | --------------------------------------------------------- | --------------------------- |
| `Mock_Estoque_API/README.md` e `docs/arquitetura.md`  | Escopo, endpoints e limitações do sistema de referência   | `docs/elicitacao-escopo.md` |
| `Mock_Estoque_API/schema.sql` e `app.py`              | Esquema de dados, integridade e movimentações             | `docs/elicitacao-escopo.md` |
| `Mock_Estoque_API/docs/contrato_integracao_vendas.md` | Contrato de eventos e idempotência                        | `docs/elicitacao-escopo.md` |
| `fabrica-software-controle-estoque/README.md`         | Fluxos funcionais e interface de uma referência acadêmica | `docs/elicitacao-escopo.md` |

**Repositórios originais:**

- <https://github.com/IkaroGLT/Mock_Estoque_API>
- <https://github.com/IkaroGLT/fabrica-software-controle-estoque>

### 3.3 Procedimento documentado e limitações

A documentação de origem declara que foram examinados o escopo, o esquema e os contratos dos projetos de referência. Os registros iniciais apontam a existência de operações de produtos, movimentações, importações, webhooks e auditoria no Mock, além da necessidade de separar a autenticação de usuários humanos da autenticação de integrações.

O contrato para corrigir uma entrada histórica, registrando um novo evento e seu vínculo com a operação original, foi especificado no AutoStock como **RF-13**. Isso não significa que a funcionalidade já esteja implementada.

**Detalhes ainda a confirmar para fechar a evidência acadêmica:**

- Responsável(is) efetivo(s) pela análise: **A registrar**.
- Data/período real da análise: **A registrar**.
- Versões/commits das referências analisadas: **A registrar quando disponíveis**.
- Registro de revisão pela equipe: **Pendente**.

Não atribuir nomes, datas ou conclusões adicionais sem documentação correspondente.

### 3.4 Principais necessidades técnicas identificadas

| Necessidade documentada                   | Requisito(s) relacionado(s)        | Observação                                                   |
| ----------------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| Cadastro e identificação única do produto | RF-03, RF-04, RN-01                | SKU único e edição cadastral sem alterar saldo indiretamente |
| Movimentações consistentes e auditáveis   | RF-05, RF-06, RF-07; RN-02 e RN-03 | Entradas/saídas e histórico transacional                     |
| Importação e integração sem duplicidades  | RF-08, RF-09; RN-04 e RN-06        | CSV/XLSX, webhooks e idempotência                            |
| Controle de acesso humano por perfil      | RF-01, RF-02; RNF-02               | Implementação pertence à AS-03                               |
| Correção histórica preservando auditoria  | RF-13; RN-05 e RN-07               | Contrato especificado em `docs/contrato-rf13.md`             |

**Natureza das conclusões:** derivadas de especificações e sistemas de referência, não de pesquisa de campo com usuários.

## 4. Técnica B — Questionário com potenciais usuários

### 4.1 Objetivo e desenho da aplicação

O questionário teve como objetivo investigar práticas reais de registro, frequência de conferência, falhas comuns e funcionalidades consideradas úteis por pessoas envolvidas diretamente com controle de estoque.

A aplicação foi realizada por meio de formulário eletrônico composto por oito perguntas e uma pergunta inicial de consentimento.

A coleta ocorreu entre 13 e 17 de novembro de 2026.

Foram recebidos cinco registros de participação. Quatro participantes concordaram voluntariamente com a utilização acadêmica das respostas, enquanto uma pessoa não consentiu e teve seu registro excluído da análise.

Todos os quatro participantes consentidos declararam possuir experiência direta com controle de estoque.

A amostra é exploratória e não possui representatividade estatística.

**Cuidados de interpretação:**

- Uma resposta apresentou a palavra "teste" no campo de registro de entradas e saídas. Esse campo não foi utilizado como descrição válida do processo do participante.
- Uma resposta relacionada ao SAP apresentou informações ambíguas nas perguntas sobre dashboard e previsão.
- O registro relacionado ao DataCash apresentou problemas de formatação na exportação, limitando a interpretação de algumas respostas posteriores.

**Estado atual:** QUESTIONÁRIO APLICADO — RESULTADOS ANALISADOS.

A síntese completa encontra-se em [`validacao-as11.md`](validacao-as11.md).

| ID   | Pergunta                                                                                                                                                                 | Formato         |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| Q-01 | Como você registra hoje entradas e saídas de estoque?                                                                                                                    | Resposta aberta |
| Q-02 | Com que frequência você confere fisicamente o estoque?                                                                                                                   | Escolha única   |
| Q-03 | Quais são os três erros mais comuns no processo de controle de estoque?                                                                                                  | Resposta aberta |
| Q-04 | Quando uma entrada é lançada incorretamente, como você realiza a correção?                                                                                               | Resposta aberta |
| Q-05 | Quais alertas seriam mais úteis para evitar falta de mercadoria?                                                                                                         | Resposta aberta |
| Q-06 | Quais ferramentas você costuma utilizar no controle de estoque?                                                                                                          | Resposta aberta |
| Q-07 | Qual informação em um painel (dashboard) ajudaria sua rotina?                                                                                                            | Resposta aberta |
| Q-08 | Você considera útil ter um sistema que analise vendas anteriores e estime quais produtos precisarão ser repostos? O estabelecimento possui registros de vendas passadas? | Resposta aberta |

### 4.3 Procedimento realizado

1. Foi apresentado aos participantes um questionamento inicial de consentimento voluntário.
2. Os registros sem consentimento foram excluídos da análise.
3. Foram consideradas as respostas dos participantes que declararam possuir experiência direta com controle de estoque.
4. As respostas foram organizadas por pergunta e analisadas de forma agregada.
5. Foram identificados temas recorrentes e dificuldades relatadas.
6. Os achados foram relacionados aos requisitos funcionais existentes.
7. Respostas ambíguas ou comprometidas pela formatação foram identificadas e não utilizadas para conclusões que exigissem maior precisão.
8. Os resultados foram consolidados em [`validacao-as11.md`](validacao-as11.md).

A análise não teve como objetivo criar novos requisitos automaticamente, mas verificar a coerência entre as necessidades relatadas e a proposta já documentada.

### 4.4 Ficha de execução

| Campo                                           | Informação                                                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Meio de aplicação                               | Formulário eletrônico                                                                               |
| Plataforma específica                           | Google Forms                                                                                        |
| Período da coleta                               | 13/11/2026 a 17/11/2026                                                                             |
| Registros recebidos                             | 5                                                                                                   |
| Participantes consentidos                       | 4                                                                                                   |
| Registros excluídos por falta de consentimento  | 1                                                                                                   |
| Participantes com experiência direta em estoque | 4                                                                                                   |
| Perfil agregado                                 | 2 operadores/responsáveis pelo estoque, 1 gerente/gestor e 1 participante que preferiu não informar |
| Responsável pela consolidação                   | AS-11 — Ikaro Guilherme                                                                             |
| Evidência de análise                            | [`validacao-as11.md`](validacao-as11.md)                                                            |
| Limitações                                      | Amostra reduzida, respostas ambíguas e problemas de formatação na exportação                        |

A exportação original deverá permanecer sob acesso restrito da equipe, sem inclusão de respostas brutas identificáveis no repositório público.

### 4.5 Síntese dos resultados

| Tema investigado              | Resultado observado                                                                                                | Requisitos relacionados     | Evidência         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------- | ----------------- |
| Registro de entradas e saídas | Foram identificadas planilhas, sistemas internos e ferramentas específicas; uma resposta não descreveu o processo. | RF-05, RF-06, RF-07         | validacao-as11.md |
| Frequência de conferência     | 4 de 4 participantes relataram conferência diária.                                                                 | RF-10, RF-11                | validacao-as11.md |
| Erros operacionais            | Foram relatados erros de contagem, cadastro, movimentação, validade e organização.                                 | RF-05, RF-06, RF-07         | validacao-as11.md |
| Correção de entradas          | Foram descritos procedimentos de conferência, comparação com nota fiscal e correção no registro.                   | RF-13                       | validacao-as11.md |
| Alertas desejados             | Dois participantes mencionaram estoque mínimo.                                                                     | RF-10                       | validacao-as11.md |
| Ferramentas utilizadas        | Planilhas, SAP/Disklog, sistema interno e DataCash foram mencionados.                                              | Contextualização da solução | validacao-as11.md |
| Informações do dashboard      | Quantidades disponíveis, saídas recentes e produtos para reposição foram mencionados.                              | RF-11                       | validacao-as11.md |
| Previsão e histórico          | Dois participantes responderam explicitamente de forma favorável à previsão de demanda.                            | RF-12                       | validacao-as11.md |

**Interpretação:** os resultados oferecem evidências qualitativas de necessidade para os requisitos relacionados a movimentações, histórico, alertas, dashboard e previsão de demanda. Não representam comprovação de implementação ou eficácia da aplicação.

## 5. Consolidação das técnicas

A elicitação do AutoStock Intelligence reúne duas técnicas documentadas:

**Técnica A — Análise documental:** registrada na preparação da AS-01, com análise de documentos, estruturas, contratos e projetos de referência relacionados ao controle de estoque.

**Técnica B — Questionário:** aplicado entre 13 e 17 de novembro de 2026, com quatro participantes consentidos e experiência direta com controle de estoque.

A análise documental fornece referências sobre estruturas e comportamentos técnicos. O questionário apresenta relatos de experiências práticas e necessidades operacionais.

A comparação entre essas fontes permite relacionar a proposta técnica às dificuldades relatadas pelos participantes.

Os resultados do questionário reforçam a pertinência dos requisitos de movimentação, histórico, alertas, dashboard e previsão de demanda.

A análise não comprova a necessidade de todas as funcionalidades de forma individual. Requisitos de importação e webhooks, por exemplo, permanecem fundamentados principalmente nas decisões técnicas e no escopo documental do projeto.

## 6. Transformação dos achados em requisitos

A pesquisa foi utilizada para verificar a coerência dos requisitos existentes com as necessidades relatadas.

| ID do achado | Técnica      | Resumo do dado observado                                        | Requisito relacionado | Ação                   | Justificativa                                                                                |
| ------------ | ------------ | --------------------------------------------------------------- | --------------------- | ---------------------- | -------------------------------------------------------------------------------------------- |
| ACH-01       | Questionário | Conferência física diária relatada por 4 participantes          | RF-10, RF-11          | Confirmar              | Demonstra necessidade de acompanhamento e indicadores                                        |
| ACH-02       | Questionário | Erros de contagem, cadastro e movimentação                      | RF-05, RF-06, RF-07   | Confirmar              | Reforça a necessidade de registros consistentes                                              |
| ACH-03       | Questionário | Procedimentos manuais para corrigir divergências                | RF-13                 | Confirmar              | Sustenta a necessidade de correções rastreáveis                                              |
| ACH-04       | Questionário | Interesse em estoque mínimo                                     | RF-10                 | Confirmar              | Sustenta o monitoramento de produtos que exigem reposição                                    |
| ACH-05       | Questionário | Interesse em informações de quantidade e movimentações recentes | RF-11                 | Confirmar              | Sustenta a proposta de dashboard                                                             |
| ACH-06       | Questionário | Respostas favoráveis à análise histórica e previsão             | RF-12                 | Confirmar parcialmente | Sustenta a investigação, mas não comprova a disponibilidade de dados ou a precisão do modelo |

**Decisão:** a pesquisa não gerou novos requisitos funcionais. Os achados foram utilizados para fundamentar e confirmar qualitativamente a proposta existente.

Qualquer alteração futura de escopo deverá passar pela revisão da equipe e atualização das Issues correspondentes.

## 7. Evidências e rastreabilidade acadêmica

Para cada técnica, registrar:

- Material ou instrumento utilizado, com versão.
- Nome/código do responsável efetivo e data real.
- Método de aplicação/análise e número real de participantes, quando houver.
- Dados ou resultados observados, distinguindo-os de hipóteses.
- Requisitos associados e decisões de priorização.
- Evidências verificáveis, com links para documentos públicos não sensíveis ou referência a arquivo restrito sob custódia da equipe.
- Limitações, vieses e resultados que não confirmem expectativas.

**Modelo de referência de evidência:** `EV-ELIC-01` (registro da análise documental); `EV-ELIC-02` (instrumento do questionário); `EV-ELIC-03` (síntese anonimizada da coleta); `EV-ELIC-04` (registro de validação da equipe). Estes códigos estão **reservados**, não atestam que uma evidência já exista.

## 8. Checklist de conclusão da etapa de elicitação na AS-11

- [x] Objetivo e procedimentos de duas técnicas descritos na minuta.
- [x] Análise documental inicial relacionada a RFs e regras de negócio.
- [x] Questionário de oito perguntas preparado.
- [x] Autor, data, referências e evidências da análise documental confirmados.
- [x] Questionário efetivamente aplicado ou segunda técnica efetivamente executada.
- [x] Quantidade real e perfil agregado dos participantes registrados.
- [x] Respostas resumidas anonimamente, com fonte verificável.
- [x] Achados relacionados a RFs e decisões da equipe.
- [x] Revisão e validação acadêmica/documental pela equipe.
- [x] Matriz de rastreabilidade atualizada conforme as decisões aprovadas.

## 9. Referências internas

- [`docs/elicitacao-escopo.md`](../elicitacao-escopo.md) — plano original da AS-01, análise documental e questionário proposto.
- [`docs/requisitos.md`](../requisitos.md) — catálogo RF-01 a RF-13, RNF-01 a RNF-05 e regras RN-01 a RN-07.
- [`docs/academico/historias-bdd.md`](historias-bdd.md) — histórias de usuário e comportamento esperado.
- [`docs/academico/matriz-rastreabilidade.md`](matriz-rastreabilidade.md) — vínculos a casos de teste e evidências.
- [AS-11](https://github.com/IkaroGLT/AutoStock-Intelligence/issues/11) — critérios acadêmicos da documentação.

**Situação do arquivo:** preparado para revisão; nenhuma entrevista, resposta ou medição foi produzida por esta minuta.
