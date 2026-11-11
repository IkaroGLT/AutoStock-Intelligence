# AutoStock Intelligence — Elicitação de Requisitos e Registro de Evidências

**Issue:** AS-11 — Documentação Técnica e Acadêmica
**Versão:** 0.1 — Minuta para revisão
**Data de referência:** 11/11/2026
**Situação:** análise documental descrita na AS-01; questionário planejado e sem resultados registrados neste documento.
**Destino proposto:** `docs/academico/elicitacao-requisitos.md`

> **Critério de integridade acadêmica:** uma técnica só pode ser declarada aplicada quando existirem evidências reais de sua execução. Campos não preenchidos são pendências, não resultados. Não incluir nomes, contatos ou outros dados identificáveis dos participantes no repositório público.

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

Investigar práticas reais de registro, frequência de conferência, falhas mais comuns e funcionalidades de maior utilidade para pessoas envolvidas em controle de estoque.

**Amostra inicialmente proposta na AS-01:** 3 a 5 pessoas com experiência prática, sujeita à quantidade efetivamente alcançada. A amostra deve ser intencional/por conveniência, caso assim seja recrutada, e sem alegar representatividade estatística.

**Meio sugerido:** Google Forms, Microsoft Forms ou formulário equivalente. A ferramenta efetivamente utilizada deve ser registrada após a aplicação. O questionário pode ser aplicado em entrevista assistida, desde que essa modalidade seja declarada corretamente.

**Orientação de privacidade:** explicar a finalidade acadêmica, a voluntariedade e o uso agregado/anônimo das respostas. Evitar coletar nome, CPF, telefone, e-mail, estabelecimento identificável ou segredos comerciais, pois não são necessários para estas perguntas. Antes de divulgar respostas textuais, revisar possíveis identificadores.

**Estado atual:** **PLANEJADO — SEM RESPOSTAS DOCUMENTADAS**.

### 4.2 Roteiro de perguntas

O roteiro abaixo preserva as oito perguntas previstas em `docs/elicitacao-escopo.md`.

| ID   | Pergunta                                                                  | Formato sugerido               | Requisitos a investigar |
| ---- | ------------------------------------------------------------------------- | ------------------------------ | ----------------------- |
| Q-01 | Como você registra hoje entradas e saídas de estoque?                     | Resposta aberta                | RF-05, RF-06, RF-07     |
| Q-02 | Com que frequência confere fisicamente o estoque?                         | Escolha única + campo opcional | RF-10, RF-11            |
| Q-03 | Quais são os três erros mais comuns no processo?                          | Resposta aberta                | RF-07, RF-10, RF-13     |
| Q-04 | Quando uma entrada é lançada incorretamente, como realiza a correção?     | Resposta aberta                | RF-13                   |
| Q-05 | Quais alertas seriam mais úteis para evitar falta de mercadoria?          | Resposta aberta                | RF-10, RF-11            |
| Q-06 | Costuma utilizar planilhas, sistema de vendas ou anotações manuais?       | Múltipla escolha               | RF-08, RF-09            |
| Q-07 | Qual informação do dashboard ajudaria sua rotina?                         | Resposta aberta                | RF-11                   |
| Q-08 | A previsão de demanda seria útil? Que dados históricos estão disponíveis? | Resposta aberta em duas partes | RF-12                   |

**Opções sugeridas para Q-02:** diariamente, algumas vezes por semana, semanalmente, quinzenalmente, mensalmente, outra frequência (informar).

**Opções sugeridas para Q-06:** planilha eletrônica; software de vendas/ERP; anotações em papel; aplicativos de mensagens; outro; mais de uma opção. Não presumir que o entrevistado usa alguma dessas ferramentas.

**Metadados mínimos a registrar fora das respostas públicas:** data de aplicação, quantidade de participantes e perfis profissionais agregados. Não inventar nenhum desses valores.

### 4.3 Procedimento de aplicação

1. Revisar perguntas com a equipe e confirmar a finalidade acadêmica.
2. Selecionar voluntários com vivência no controle de estoque; registrar critério de seleção e número real de participantes.
3. Informar a finalidade, o caráter voluntário e a forma de tratamento das respostas.
4. Aplicar as oito perguntas com redação consistente entre participantes.
5. Exportar respostas ou preservar registros em local de acesso restrito quando houver conteúdo pessoal ou empresarial sensível.
6. Produzir um **resumo anônimo**, sem inserir dados identificáveis ou respostas brutas sensíveis no repositório público.
7. Identificar temas recorrentes e divergências sem atribuir representatividade estatística.
8. Vincular achados reais aos RFs e registrar se geram inclusão, alteração ou confirmação de requisito.
9. Registrar decisões da equipe, autores da validação e data.

### 4.4 Ficha de execução — preencher após a aplicação

| Campo                                                  | Informação real |
| ------------------------------------------------------ | --------------- |
| Meio de aplicação                                      | PENDENTE        |
| Data ou período da coleta                              | PENDENTE        |
| Participantes convidados                               | PENDENTE        |
| Respostas válidas obtidas                              | PENDENTE        |
| Critério de seleção                                    | PENDENTE        |
| Perfil agregado dos participantes                      | PENDENTE        |
| Responsável pela coleta                                | PENDENTE        |
| Local seguro de armazenamento das respostas brutas     | PENDENTE        |
| Evidência pública anonimizável (arquivo/link/registro) | PENDENTE        |
| Limitações da coleta                                   | PENDENTE        |

### 4.5 Quadro de síntese dos resultados — não preencher antes da coleta

| Tema investigado                 | Resultado observado | Nº de participantes que citaram, quando aplicável | RF(s) associado(s) | Decisão tomada | Evidência   |
| -------------------------------- | ------------------- | ------------------------------------------------- | ------------------ | -------------- | ----------- |
| Registro de entradas e saídas    | NÃO COLETADO        | PENDENTE                                          | RF-05/06/07        | PENDENTE       | EV-PENDENTE |
| Frequência da conferência        | NÃO COLETADO        | PENDENTE                                          | RF-10/11           | PENDENTE       | EV-PENDENTE |
| Erros de lançamento              | NÃO COLETADO        | PENDENTE                                          | RF-07/13           | PENDENTE       | EV-PENDENTE |
| Correção de entradas             | NÃO COLETADO        | PENDENTE                                          | RF-13              | PENDENTE       | EV-PENDENTE |
| Alertas desejados                | NÃO COLETADO        | PENDENTE                                          | RF-10              | PENDENTE       | EV-PENDENTE |
| Ferramentas atualmente usadas    | NÃO COLETADO        | PENDENTE                                          | RF-08/09           | PENDENTE       | EV-PENDENTE |
| Informação prioritária no painel | NÃO COLETADO        | PENDENTE                                          | RF-11              | PENDENTE       | EV-PENDENTE |
| Previsão e histórico disponível  | NÃO COLETADO        | PENDENTE                                          | RF-12              | PENDENTE       | EV-PENDENTE |

## 5. Consolidação das técnicas

**Análise documental:** fornece evidências sobre contratos e comportamentos existentes nas referências. Limite: não comprova que potenciais usuários valorizem essas funcionalidades ou as utilizem de determinada maneira.

**Questionário:** poderá oferecer dados exploratórios da experiência de usuários, mas sua interpretação depende de aplicação real. Limite: uma amostra pequena, especialmente por conveniência, não autoriza conclusões gerais sobre o mercado.

**Triangulação prevista:** comparar necessidades apontadas por usuários com os requisitos baseados na análise documental. Divergências deverão ser registradas e discutidas; não forçar resultados a confirmar uma solução predefinida.

## 6. Transformação dos achados em requisitos

Quando houver respostas reais, registrar cada achado relevante neste formato:

| ID do achado | Técnica     | Resumo objetivo do dado observado | Requisito relacionado | Ação (manter/alterar/criar/descartar) | Decisão e justificativa | Responsável/data |
| ------------ | ----------- | --------------------------------- | --------------------- | ------------------------------------- | ----------------------- | ---------------- |
| ACH-001      | A preencher | A preencher                       | A preencher           | A preencher                           | A preencher             | A preencher      |

**Controle de mudanças:** novas necessidades devem ser comparadas aos RF-01 a RF-13, RNF-01 a RNF-05 e à priorização MoSCoW já documentada. Quando aprovadas, atualizar a especificação, as histórias de usuário, as Issues e a matriz de rastreabilidade, preservando a justificativa da alteração.

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
- [ ] Autor, data, referências e evidências da análise documental confirmados.
- [ ] Questionário efetivamente aplicado ou segunda técnica efetivamente executada.
- [ ] Quantidade real e perfil agregado dos participantes registrados.
- [ ] Respostas resumidas anonimamente, com fonte verificável.
- [ ] Achados relacionados a RFs e decisões da equipe.
- [ ] Revisão e validação acadêmica/documental pela equipe.
- [ ] Matriz de rastreabilidade atualizada conforme as decisões aprovadas.

A primeira versão deste arquivo é uma **minuta de planejamento e consolidação**. Não declarar a exigência de duas técnicas realizadas como concluída antes da obtenção das evidências.

## 9. Referências internas

- [`docs/elicitacao-escopo.md`](../elicitacao-escopo.md) — plano original da AS-01, análise documental e questionário proposto.
- [`docs/requisitos.md`](../requisitos.md) — catálogo RF-01 a RF-13, RNF-01 a RNF-05 e regras RN-01 a RN-07.
- [`docs/academico/historias-bdd.md`](historias-bdd.md) — histórias de usuário e comportamento esperado.
- [`docs/academico/matriz-rastreabilidade.md`](matriz-rastreabilidade.md) — vínculos a casos de teste e evidências.
- [AS-11](https://github.com/IkaroGLT/AutoStock-Intelligence/issues/11) — critérios acadêmicos da documentação.

**Situação do arquivo:** preparado para revisão; nenhuma entrevista, resposta ou medição foi produzida por esta minuta.
