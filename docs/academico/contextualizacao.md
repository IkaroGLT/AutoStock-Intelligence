# AutoStock Intelligence — Contextualização do Projeto

**Issue:** AS-11 — Documentação Técnica e Acadêmica
**Versão:** 0.2 — Atualização após validação qualitativa
**Data:** 18/11/2026
**Status:** Problema e proposta fundamentados por pesquisa exploratória; implementação e eficácia da solução ainda dependem de validação técnica.

## 1. Introdução

O gerenciamento de estoque é uma atividade essencial para a organização operacional de empresas, especialmente para negócios que precisam acompanhar entradas, saídas, quantidades disponíveis e necessidades de reposição.

A falta de informações centralizadas, os registros inconsistentes e a dependência de conferências físicas frequentes podem dificultar o acompanhamento das mercadorias e a identificação de situações que exigem intervenção.

Em operações que utilizam planilhas, sistemas internos ou procedimentos manuais, o responsável precisa acompanhar diferentes informações para compreender a situação real do estoque. Esse processo pode consumir tempo e aumentar a possibilidade de divergências entre os registros e as quantidades físicas.

Nesse contexto, o projeto **AutoStock Intelligence** propõe o desenvolvimento de uma aplicação web de gerenciamento inteligente de estoque, integrando operações administrativas, registro de movimentações, mecanismos de auditoria, monitoramento por indicadores e análise de dados.

A proposta busca transformar os registros operacionais em informações úteis para o acompanhamento do estoque e para a tomada de decisões, reduzindo a dependência de conferências manuais diárias como único mecanismo de controle.

O projeto também contempla um módulo acadêmico de Machine Learning destinado à investigação de métodos de previsão de demanda, condicionado à disponibilidade e à qualidade dos dados históricos utilizados.

## 2. Problema identificado

Microempreendedores e empresas de pequeno e médio porte podem enfrentar dificuldades para manter registros de estoque atualizados, acompanhar movimentações e identificar divergências entre as quantidades registradas e as mercadorias fisicamente disponíveis.

Entre os problemas investigados estão:

- Dependência de conferências físicas frequentes.
- Registros manuais ou distribuídos entre diferentes ferramentas.
- Erros no lançamento de entradas e saídas.
- Divergências entre estoque físico e informações do sistema.
- Dificuldade para identificar produtos que precisam de reposição.
- Necessidade de procedimentos adicionais para investigar e corrigir inconsistências.
- Falta de indicadores que facilitem a compreensão da situação operacional do estoque.

Essas dificuldades motivaram a investigação de uma solução que permita organizar os registros, acompanhar movimentações e identificar situações que necessitem de atenção.

### 2.1. Validação inicial do problema

Para verificar se as dificuldades identificadas também aparecem em situações reais de trabalho, foi aplicado um questionário com pessoas que possuem experiência direta com controle de estoque.

A coleta ocorreu entre 13 e 17 de novembro de 2026.

Foram recebidos cinco registros de participação, dos quais quatro apresentaram consentimento para utilização acadêmica das respostas. O registro sem consentimento foi desconsiderado.

Entre os quatro participantes consentidos, todos declararam realizar conferências físicas diariamente.

Também foram identificados relatos sobre:

- Contagem manual e necessidade de conferir o estoque frequentemente.
- Divergências entre o estoque físico e os registros dos sistemas.
- Problemas relacionados às saídas de produtos.
- Erros no cadastro de grades e quantidades.
- Organização inadequada de produtos e tamanhos.
- Necessidade de novas contagens e comparação com notas fiscais para corrigir divergências.
- Utilidade de acompanhar estoque mínimo, quantidades disponíveis e produtos que precisam de reposição.

Os participantes também mencionaram diferentes ferramentas e processos de controle, incluindo planilhas, sistemas internos, SAP associado ao Disklog e DataCash.

Esses resultados indicam que as dificuldades investigadas não estão limitadas a operações exclusivamente manuais. Mesmo em contextos que utilizam sistemas informatizados, ainda existem necessidades relacionadas à conferência, consistência dos registros e acompanhamento das movimentações.

A análise detalhada está documentada em [`validacao-as11.md`](validacao-as11.md).

### 2.2. Interpretação dos resultados

A pesquisa fornece evidências qualitativas de que o controle de estoque exige acompanhamento operacional frequente e que falhas nos registros podem gerar consequências para a rotina das empresas.

A conferência física diária relatada pelos participantes demonstra a necessidade de acompanhar constantemente as quantidades disponíveis. Os relatos de divergências, erros de cadastro e procedimentos de correção reforçam a importância da confiabilidade e da rastreabilidade das informações.

As respostas relacionadas ao estoque mínimo, aos produtos que precisam de reposição e aos indicadores desejados também apresentam relação direta com a proposta de monitoramento do AutoStock Intelligence.

A pesquisa possui caráter exploratório e amostra reduzida. Portanto, seus resultados fundamentam a necessidade investigada, mas não representam estatisticamente todas as empresas.

## 3. Questão norteadora

Diante do problema identificado, estabelece-se a seguinte questão:

**Como desenvolver uma solução web que centralize as informações de estoque, automatize registros e integrações, preserve a rastreabilidade das movimentações e utilize indicadores e análise de dados para facilitar o acompanhamento operacional e apoiar decisões de reposição, reduzindo a dependência de conferências manuais diárias?**

## 4. Objetivo geral

Desenvolver uma aplicação web de gerenciamento inteligente de estoque que integre cadastro de produtos, registro de movimentações, automação operacional, rastreabilidade, monitoramento por indicadores e recursos de análise de dados, contribuindo para melhorar a organização e o acompanhamento dos processos de estoque.

## 5. Objetivos específicos

- Implementar mecanismos de autenticação e autorização para diferentes perfis de usuários.
- Permitir o cadastro, a consulta e a atualização de informações de produtos.
- Registrar entradas e saídas com atualização consistente dos saldos.
- Manter histórico auditável das movimentações de estoque.
- Disponibilizar procedimentos seguros para correção de lançamentos incorretos.
- Automatizar a importação de produtos por arquivos CSV e XLSX.
- Processar eventos de integração por webhooks com controle de duplicidade.
- Identificar produtos com estoque mínimo, zerado e outras exceções operacionais.
- Apresentar indicadores operacionais em um dashboard web.
- Investigar a aplicação de Machine Learning para estimar demanda futura.
- Aplicar práticas de Engenharia de Requisitos, testes e qualidade de software durante o desenvolvimento.

## 6. Justificativa

O desenvolvimento do AutoStock Intelligence é justificado pela necessidade de melhorar a organização, a confiabilidade e a visibilidade das informações utilizadas no controle de estoque.

A pesquisa realizada na AS-11 apresentou relatos de conferências físicas diárias, erros de registro, divergências entre quantidades físicas e informações dos sistemas, além de dificuldades relacionadas à reposição de mercadorias.

Essas evidências demonstram que o acompanhamento do estoque envolve mais do que registrar entradas e saídas. É necessário compreender a situação dos produtos, identificar inconsistências e disponibilizar informações que auxiliem os responsáveis na tomada de decisões.

A proposta do AutoStock Intelligence busca atender a essas necessidades por meio da centralização dos registros, da rastreabilidade das movimentações, da identificação de exceções e da apresentação de indicadores operacionais.

A intenção é evoluir de um acompanhamento baseado principalmente em conferências manuais frequentes para um modelo orientado por informações e indicadores, permitindo que os responsáveis acompanhem o comportamento do estoque e direcionem suas verificações às situações que realmente exigem atenção.

O modelo conceitual considera o acompanhamento contínuo dos registros e indicadores, com conferências físicas periódicas, planejadas inicialmente como semanais, e verificações adicionais quando houver divergências ou situações excepcionais. Essa frequência não deve ser tratada como uma regra universal, pois depende das características e dos riscos de cada operação.

Outro aspecto relevante é a possibilidade de utilizar registros históricos de vendas para investigar padrões de demanda e estimar necessidades futuras de reposição. Essa abordagem depende da disponibilidade e da qualidade dos dados, não representando uma garantia de precisão.

Sob a perspectiva acadêmica, o projeto permite aplicar conhecimentos de Engenharia de Software, Engenharia de Requisitos, desenvolvimento web, bancos de dados, integração de sistemas, testes, qualidade de software e Machine Learning em uma solução integrada.

## 7. Público-alvo

O projeto tem como público-alvo principal microempreendedores e empresas de pequeno e médio porte que realizam operações de estoque e necessitam acompanhar produtos, movimentações e necessidades de reposição.

Na aplicação, os usuários humanos previstos inicialmente são:

**Administrador:** responsável por operações administrativas, gerenciamento de usuários, parâmetros e correções autorizadas de estoque.

**Operador:** responsável por consultas e movimentações operacionais, respeitando as permissões definidas para seu perfil.

O sistema também prevê clientes de integração não humanos, autenticados por mecanismos próprios para o envio de eventos externos.

## 8. Solução proposta

O AutoStock Intelligence propõe uma aplicação web que reúne informações operacionais e oferece mecanismos de acompanhamento e análise do estoque.

A solução está organizada nos seguintes eixos:

### 8.1. Gestão e centralização das informações

Disponibilizar um ambiente para cadastro de produtos, consulta de quantidades, registro de entradas e saídas e acompanhamento das movimentações.

A centralização busca reduzir a fragmentação das informações e facilitar a compreensão do estado do estoque.

### 8.2. Integridade e rastreabilidade

Manter registros das movimentações realizadas, preservar o histórico das operações e disponibilizar procedimentos de correção auditáveis.

O objetivo é permitir que divergências sejam investigadas sem apagar o histórico original das movimentações.

### 8.3. Automação e monitoramento

Utilizar importações e integrações para reduzir tarefas repetitivas de registro e sincronização.

O sistema também deverá identificar situações relevantes, como produtos que atingiram o estoque mínimo, produtos sem saldo e outras ocorrências que exijam atenção.

### 8.4. Indicadores operacionais

Disponibilizar informações que facilitem o acompanhamento do estoque, incluindo:

- Quantidades disponíveis.
- Entradas e saídas recentes.
- Produtos que precisam de reposição.
- Situações de estoque mínimo ou zerado.
- Informações relevantes para acompanhamento da operação.

### 8.5. Análise histórica e previsão de demanda

Investigar o uso de dados históricos para compreender o comportamento dos produtos e estimar necessidades futuras de reposição.

A previsão será apresentada como recurso de apoio à decisão, não como substituição da análise humana ou como garantia de disponibilidade futura.

## 9. Escopo da solução

O escopo inicial do AutoStock Intelligence contempla uma aplicação web desenvolvida com React e TypeScript, integrada a uma API FastAPI e a um banco de dados SQLite.

As funcionalidades planejadas estão especificadas nos requisitos RF-01 a RF-13 e incluem:

- Autenticação e autorização de usuários.
- Cadastro, consulta e atualização de produtos.
- Registro de entradas e saídas.
- Histórico de movimentações.
- Importação de planilhas CSV e XLSX.
- Processamento de webhooks idempotentes.
- Alertas de estoque.
- Dashboard com indicadores operacionais.
- Correção auditável de lançamentos.
- Módulo experimental de previsão de demanda.

O desenvolvimento dessas funcionalidades é distribuído entre as Issues correspondentes. Sua descrição neste documento não significa que todas estejam implementadas ou homologadas.

## 10. Benefícios esperados

Os benefícios pretendidos com o desenvolvimento do sistema incluem:

- Maior centralização das informações operacionais.
- Melhor rastreabilidade das movimentações.
- Redução da dependência de conferências manuais diárias como único mecanismo de acompanhamento.
- Identificação mais acessível de produtos que exigem reposição.
- Melhor visualização de divergências e exceções operacionais.
- Redução de tarefas repetitivas por meio de importações e integrações.
- Disponibilidade de indicadores para apoiar decisões de estoque.
- Investigação do uso de métodos preditivos como apoio ao planejamento de demanda.

Esses benefícios representam objetivos da solução. Eventuais ganhos de eficiência, redução de tempo ou precisão das previsões deverão ser demonstrados por evidências obtidas durante os testes e avaliações.

## 11. Limitações do projeto

O AutoStock Intelligence será desenvolvido inicialmente como um sistema acadêmico, com funcionalidades implementadas de forma progressiva.

A primeira versão não contempla integração produtiva com ERPs de terceiros, processamento de pagamentos, aplicativo móvel nativo ou gerenciamento complexo de múltiplos depósitos.

O sistema não pretende eliminar completamente inventários físicos, auditorias ou procedimentos de reconciliação.

A confiabilidade das informações depende da qualidade dos registros e eventos processados. A ausência de registro de uma movimentação ou um erro na informação de origem pode comprometer a interpretação do saldo.

Da mesma forma, a utilidade das previsões de demanda depende da disponibilidade, representatividade e qualidade dos dados históricos utilizados.

A pesquisa realizada na AS-11 possui quatro respostas consentidas e caráter exploratório. Alguns campos apresentaram respostas ambíguas ou limitações de formatação, de modo que os resultados não podem ser generalizados para todo o mercado.

## 12. Estado de implementação e validação

A validação realizada na AS-11 está relacionada à necessidade do produto e à coerência entre o problema investigado e a solução proposta.

Essa validação não representa comprovação de que todos os requisitos funcionais foram implementados, nem de que os requisitos não funcionais foram atendidos.

O estado de implementação de cada funcionalidade deverá ser acompanhado pelas respectivas Issues, Pull Requests, commits e evidências de testes.

As avaliações de desempenho, segurança, confiabilidade, capacidade de interação, manutenibilidade e Machine Learning deverão utilizar resultados efetivamente obtidos durante o desenvolvimento.

## 13. Referências internas

- Especificação de requisitos: [`../requisitos.md`](../requisitos.md).
- Arquitetura projetada: [`../arquitetura.md`](../arquitetura.md).
- Plano de elicitação e escopo: [`../elicitacao-escopo.md`](../elicitacao-escopo.md).
- Matriz de permissões: [`../matriz-permissoes.md`](../matriz-permissoes.md).
- Contrato técnico RF-13: [`../contrato-rf13.md`](../contrato-rf13.md).
- Elicitação de requisitos: [`elicitacao-requisitos.md`](elicitacao-requisitos.md).
- Relatório de validação da AS-11: [`validacao-as11.md`](validacao-as11.md).
- Histórias de usuário e BDD: [`historias-bdd.md`](historias-bdd.md).
- Matriz de rastreabilidade: [`matriz-rastreabilidade.md`](matriz-rastreabilidade.md).
- Estratégia de testes: [`estrategia-testes.md`](estrategia-testes.md).
- Qualidade de software: [`qualidade-iso25010.md`](qualidade-iso25010.md).
- Issue [AS-11](https://github.com/IkaroGLT/AutoStock-Intelligence/issues/11).

---

**Observação:** este documento apresenta a fundamentação e a proposta do AutoStock Intelligence após a validação qualitativa inicial. Não representa comprovação de implementação integral, resultados de testes ou eficácia operacional.
