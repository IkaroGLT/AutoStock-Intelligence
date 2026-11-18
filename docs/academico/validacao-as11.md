# AutoStock Intelligence — Relatório de Validação da Necessidade

**Issue:** AS-11 — Documentação Técnica e Acadêmica  
**Versão:** 1.0 — Relatório de validação qualitativa  
**Data:** 18/11/2026  
**Período de coleta:** 13/11/2026 a 17/11/2026  
**Status:** Pesquisa aplicada e resultados analisados.

## 1. Objetivo

Este documento apresenta os resultados da pesquisa realizada para validar a necessidade da aplicação AutoStock Intelligence.

A investigação teve como objetivo compreender as dificuldades enfrentadas por pessoas que trabalham ou já trabalharam diretamente com controle de estoque, identificando práticas operacionais, problemas recorrentes e informações consideradas úteis para o acompanhamento das mercadorias.

Os resultados são utilizados para verificar a coerência entre o problema identificado pelo projeto, as necessidades relatadas pelos participantes e a solução proposta.

A pesquisa possui caráter exploratório e qualitativo. Seu propósito não é representar estatisticamente todas as empresas, mas reunir evidências de experiências práticas relacionadas ao controle de estoque.

## 2. Metodologia

Foi utilizado um questionário eletrônico composto por oito perguntas, além de uma pergunta inicial de consentimento para participação voluntária.

As perguntas abordaram:

1. Registro de entradas e saídas.
2. Frequência de conferência física.
3. Erros comuns no controle de estoque.
4. Procedimentos utilizados para corrigir entradas incorretas.
5. Alertas considerados úteis para evitar falta de mercadorias.
6. Ferramentas utilizadas no controle de estoque.
7. Informações desejadas em um dashboard.
8. Utilidade da análise de vendas anteriores para estimar necessidades futuras de reposição.

A coleta foi realizada entre 13 e 17 de novembro de 2026.

As respostas foram analisadas de maneira agregada, sem utilização de nomes ou informações pessoais dos participantes.

## 3. Caracterização da participação

Foram recebidos cinco registros de participação.

| Situação                          | Quantidade |
| --------------------------------- | ---------: |
| Respostas recebidas               |          5 |
| Participantes que consentiram     |          4 |
| Participante que não consentiu    |          1 |
| Respostas consideradas na análise |          4 |

A resposta sem consentimento foi integralmente excluída da análise.

Todos os quatro participantes consentidos declararam possuir experiência direta com controle de estoque.

Quanto às funções informadas, foram identificados dois participantes que atuam como operadores ou responsáveis pelo estoque, um participante que atua como gerente/gestor e um participante que preferiu não informar sua função.

A amostra é reduzida e não permite generalização estatística dos resultados.

## 4. Análise das respostas

### 4.1. Registro de entradas e saídas

As respostas demonstraram diferentes formas de controle operacional.

Foram mencionados:

- Planilhas e registros auxiliares.
- Sistema SAP associado ao Disklog para acompanhamento de divergências físicas.
- Sistema interno utilizado pela empresa.
- Ferramenta DataCash, utilizada para cadastro de produtos, quantidades e grades, com relação ao sistema de vendas.

Uma resposta apresentou apenas a palavra "teste" no campo sobre registro de entradas e saídas. Por esse motivo, esse campo não foi considerado uma descrição válida do processo utilizado pelo participante.

A diversidade das ferramentas demonstra que o controle de estoque pode ocorrer por diferentes estruturas operacionais.

**Relação com o projeto:** reforça a proposta de centralizar e organizar informações operacionais, sem pressupor que todas as empresas utilizam exclusivamente registros manuais ou que precisam substituir integralmente seus sistemas atuais.

### 4.2. Frequência de conferência física

Todos os quatro participantes consentidos declararam realizar conferências físicas diariamente.

| Frequência informada | Participantes |
| -------------------- | ------------: |
| Diariamente          |             4 |
| Outras frequências   |             0 |

Esse foi um dos resultados mais relevantes da pesquisa.

A necessidade de conferir fisicamente o estoque todos os dias demonstra o nível de atenção operacional exigido nos contextos investigados.

O resultado apresenta relação direta com o problema que motivou o AutoStock Intelligence: a dependência de acompanhamento manual frequente para compreender a situação das mercadorias.

**Relação com o projeto:** fundamenta a proposta de utilizar registros, indicadores e alertas para tornar o acompanhamento mais organizado e direcionado.

A pesquisa não demonstra que a conferência física pode ser eliminada. O objetivo da solução é reduzir sua utilização como único mecanismo de acompanhamento, mantendo verificações físicas periódicas e validações adicionais quando necessário.

### 4.3. Erros e dificuldades relatados

Os participantes apresentaram problemas de naturezas diferentes.

Entre os relatos, foram identificados:

**Contagem e acompanhamento manual:**

- Contabilidade manual.
- Grande quantidade de produtos para conferir.
- Necessidade de verificar o estoque frequentemente.

**Validade e organização:**

- Preocupações relacionadas à validade e ao método PEPS.
- Acondicionamento e segregação dos produtos.

**Movimentações:**

- Problemas recorrentes nas saídas de produtos.
- Erros no lançamento de quantidades.

**Cadastro e organização de mercadorias:**

- Cadastro incorreto de grades.
- Quantidades de peças registradas incorretamente.
- Mistura de tamanhos e produtos em setores diferentes.

Um participante relatou que erros na grade ou na quantidade podem gerar divergências entre o estoque registrado e o produto procurado pelo cliente, causando situações em que o sistema indica uma quantidade diferente daquela efetivamente disponível.

Também foi relatado que a desorganização dos tamanhos e a mistura de peças entre setores podem provocar perdas de vendas.

**Relação com o projeto:** os relatos reforçam a importância de manter registros consistentes, acompanhar movimentações e disponibilizar mecanismos de rastreabilidade para facilitar a identificação de inconsistências.

### 4.4. Procedimentos de correção

As respostas demonstraram que a correção de divergências pode envolver procedimentos manuais e verificações adicionais.

Um participante descreveu um processo que envolve:

1. Solicitar uma nova conferência às cegas.
2. Comparar a quantidade física com a quantidade efetivamente faturada na nota fiscal.
3. Identificar a divergência.
4. Realizar o ajuste do estoque mediante auditoria interna.

Outro participante informou que realiza uma correção na entrada quando identifica um problema.

Uma resposta indicou que a situação não se aplicava ao participante, enquanto outro registro não permitiu identificar com segurança o procedimento utilizado.

Esses relatos demonstram que a correção de informações incorretas exige atenção e pode envolver investigação, conferência e justificativa.

**Relação com o projeto:** apresenta sustentação qualitativa para a necessidade de histórico e rastreabilidade das movimentações, especialmente para o requisito RF-13, que especifica a correção auditável de lançamentos.

A pesquisa não determina a implementação técnica da correção. O comportamento esperado permanece definido no contrato RF-13.

### 4.5. Alertas e necessidades de reposição

Dois participantes mencionaram diretamente o estoque mínimo como informação relevante para evitar falta de mercadorias.

Outro participante descreveu uma prática de conferência por amostragem, abrindo caixas e verificando no SAP os registros de entrada referentes ao dia do recebimento.

Essa última resposta representa um procedimento manual de conferência, e não um alerta automatizado.

Os resultados indicam que acompanhar os limites de estoque e identificar produtos que precisam de reposição são atividades relevantes nos contextos investigados.

**Relação com o projeto:** sustenta a proposta de alertas de estoque mínimo e identificação de produtos que exigem atenção.

### 4.6. Ferramentas utilizadas

As planilhas foram mencionadas em três respostas legíveis à pergunta sobre ferramentas utilizadas.

Além disso, nas descrições dos processos de registro, apareceram referências a:

- SAP e Disklog.
- Sistema interno.
- DataCash.

Esse resultado demonstra que diferentes ferramentas podem coexistir na rotina de controle de estoque.

**Relação com o projeto:** reforça a importância da organização das informações e da possibilidade de integração de registros.

Entretanto, as respostas não comprovam uma necessidade específica de integração com determinado ERP, nem validam isoladamente a implementação de webhooks ou de importações CSV/XLSX.

### 4.7. Informações desejadas em um dashboard

Entre as respostas legíveis, foram mencionadas:

- Quantidades disponíveis.
- Saídas recentes.
- Quantidade de produtos que precisam de reposição.
- Quantidades solicitadas.
- Verificação de produtos por categorias e subcategorias.

Uma resposta relacionada à organização por categorias e subcategorias não descreveu claramente uma informação de dashboard. Por isso, ela deve ser interpretada com cautela.

**Relação com o projeto:** demonstra a pertinência de apresentar indicadores que facilitem a visualização das quantidades e das necessidades operacionais.

### 4.8. Análise de vendas anteriores e previsão de demanda

Dois participantes responderam explicitamente de forma favorável à possibilidade de utilizar registros anteriores para estimar quais produtos precisarão ser repostos.

Uma resposta mencionou a utilização do sistema SAP, mas não respondeu claramente se a previsão seria útil.

Outro registro não apresentou informação suficiente para uma interpretação segura.

Os resultados indicam interesse na possibilidade de utilizar dados históricos para apoiar o planejamento de reposição, mas não permitem afirmar que todos os participantes possuem históricos de vendas estruturados ou disponíveis para treinamento.

**Relação com o projeto:** fornece sustentação qualitativa inicial ao requisito RF-12, que prevê a investigação de métodos de previsão de demanda.

A efetividade desse recurso dependerá da disponibilidade, da qualidade e da representatividade dos dados utilizados. A pesquisa não comprova a precisão de qualquer modelo preditivo.

## 5. Consolidação dos achados

| Achado                          | Evidência observada                                                | Relação com o AutoStock                 |
| ------------------------------- | ------------------------------------------------------------------ | --------------------------------------- |
| Conferência física frequente    | 4 de 4 participantes relataram conferência diária                  | Monitoramento por indicadores e alertas |
| Problemas de registro           | Relatos de contagem manual e erros de lançamento                   | Consistência das movimentações          |
| Divergências de estoque         | Relatos de diferença entre registros e quantidades físicas         | Histórico e rastreabilidade             |
| Correções operacionais          | Conferência às cegas, comparação com nota fiscal e ajuste          | RF-13                                   |
| Necessidade de reposição        | Duas menções explícitas ao estoque mínimo                          | RF-10                                   |
| Informações para acompanhamento | Quantidades disponíveis, saídas recentes e produtos para reposição | RF-11                                   |
| Interesse em previsão           | Duas respostas explicitamente favoráveis                           | RF-12                                   |
| Diversidade de ferramentas      | Planilhas, SAP/Disklog, sistema interno e DataCash                 | Contextualização da solução             |

## 6. Relação entre a pesquisa e a solução proposta

Os resultados obtidos apresentam relação direta com os principais eixos do AutoStock Intelligence.

### 6.1. Centralização e organização

A utilização de diferentes ferramentas e os relatos de dificuldades no acompanhamento reforçam a importância de reunir informações operacionais em um ambiente organizado.

### 6.2. Consistência e rastreabilidade

Os relatos de divergências, erros de cadastro e procedimentos de correção demonstram a importância de manter registros confiáveis e históricos que permitam investigar alterações no estoque.

### 6.3. Monitoramento e indicadores

A conferência diária relatada pelos participantes e o interesse em acompanhar estoque mínimo demonstram a pertinência de mecanismos que facilitem a identificação de situações que exigem atenção.

### 6.4. Análise histórica

As respostas favoráveis à previsão de demanda sustentam a investigação de métodos de Machine Learning como recurso de apoio ao planejamento de reposição, condicionada à disponibilidade de dados adequados.

## 7. Relação com os requisitos existentes

A pesquisa oferece evidências qualitativas de necessidade para requisitos já definidos no projeto.

| Requisito     | Relação com os resultados                                                        |
| ------------- | -------------------------------------------------------------------------------- |
| RF-05 e RF-06 | Problemas relatados nas entradas, saídas e registros de quantidades              |
| RF-07         | Necessidade de acompanhar movimentações e investigar divergências                |
| RF-10         | Interesse em estoque mínimo e identificação de produtos que exigem atenção       |
| RF-11         | Interesse em quantidades disponíveis, saídas recentes e informações de reposição |
| RF-12         | Respostas favoráveis à análise histórica e à previsão de demanda                 |
| RF-13         | Relatos de correção de lançamentos e procedimentos de auditoria                  |

Os resultados também contextualizam a diversidade de ferramentas utilizadas, mas não são suficientes para confirmar individualmente todos os requisitos de importação e integração.

**Não foram criados novos requisitos funcionais a partir desta pesquisa.** O objetivo foi verificar a coerência da especificação existente com as necessidades relatadas.

## 8. Limitações e ameaças à validade

A interpretação dos resultados considera as seguintes limitações:

1. A amostra contém apenas quatro respostas consentidas.
2. Os participantes não representam estatisticamente todas as empresas.
3. Uma resposta utilizou a palavra "teste" no campo de registro de entradas e saídas.
4. Algumas respostas sobre dashboard e previsão não foram suficientemente claras.
5. A exportação apresentou problemas de quebra de linha no registro relacionado ao DataCash, dificultando a interpretação dos campos posteriores.
6. As informações representam relatos dos participantes, não auditorias independentes dos estabelecimentos.
7. A pesquisa valida necessidades relatadas, mas não comprova a eficácia da aplicação.

As respostas devem ser utilizadas como evidência exploratória, preservando suas limitações e evitando conclusões que ultrapassem os dados disponíveis.

## 9. Conclusão

A pesquisa realizada na AS-11 cumpriu seu objetivo de investigar dificuldades relacionadas ao controle de estoque e verificar a coerência entre essas necessidades e a proposta do AutoStock Intelligence.

Os resultados demonstraram que os quatro participantes consentidos realizam conferências físicas diariamente e relataram problemas relacionados à organização, contagem, movimentação, divergências e correção de informações.

Também foram identificadas necessidades relacionadas ao acompanhamento de estoque mínimo, à visualização de quantidades disponíveis, às saídas recentes e aos produtos que precisam de reposição.

Além disso, houve manifestação favorável à possibilidade de utilizar dados históricos para apoiar estimativas de demanda futura.

Dessa forma, os resultados fornecem sustentação qualitativa à proposta do AutoStock Intelligence, especialmente nos aspectos de centralização das informações, consistência dos registros, rastreabilidade, monitoramento por indicadores e análise histórica.

Conclui-se que existe coerência entre o problema identificado, as dificuldades relatadas pelos participantes e a solução planejada.

A pesquisa não comprova que a aplicação já resolve essas dificuldades, nem que os benefícios pretendidos foram alcançados. Ela fundamenta a necessidade da solução e oferece justificativa para a continuidade do desenvolvimento e das avaliações técnicas do projeto.

## 10. Referências

- [`contextualizacao.md`](contextualizacao.md) — contextualização e justificativa do projeto.
- [`elicitacao-requisitos.md`](elicitacao-requisitos.md) — técnicas de elicitação e registro de evidências.
- [`../requisitos.md`](../requisitos.md) — requisitos funcionais e não funcionais.
- [`matriz-rastreabilidade.md`](matriz-rastreabilidade.md) — relação entre achados e requisitos.
- [Issue AS-11](https://github.com/IkaroGLT/AutoStock-Intelligence/issues/11).

**Observação:** a exportação original do questionário deve permanecer sob acesso restrito da equipe. Este relatório apresenta uma síntese acadêmica, sem identificação dos participantes.
