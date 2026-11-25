# AutoStock Intelligence — Histórias de Usuário e Cenários BDD

**Issue:** AS-11 — Documentação Técnica e Acadêmica
**Versão:** 0.1 — Minuta para revisão técnica e acadêmica
**Data:** 10/11/2026
**Estado:** especificação de comportamentos esperados; **não constitui evidência de testes executados**.

## 1. Objetivo

Documentar necessidades dos atores do AutoStock Intelligence por meio de histórias de usuário e cenários verificáveis no estilo BDD (_Behavior-Driven Development_), utilizando a sintaxe Gherkin em português. As histórias devem servir de referência para implementação, planejamento de testes, homologação e matriz de rastreabilidade da AS-11.

## 2. Fontes e premissas

Este documento consolida os requisitos RF-01 a RF-13 já especificados em [`../requisitos.md`](../requisitos.md), respeitando a [matriz de permissões](../matriz-permissoes.md), o [contrato RF-13](../contrato-rf13.md) e a [arquitetura](../arquitetura.md).

Os cinco cenários preliminares de `docs/requisitos.md` (entrada, saída excessiva, correção de entrada, webhook duplicado e estoque mínimo) foram aproveitados e detalhados. Os demais cenários são **propostas adicionais de especificação** para revisão com os responsáveis pelas respectivas Issues.

**Situação do projeto na redação:** a AS-02 fornece a estrutura inicial do sistema. As histórias descritas aqui representam comportamento **planejado**; aprovação de documentação não significa implementação concluída ou teste aprovado.

**Atores:** Administrador, Operador e Cliente de Integração (autenticado separadamente). O frontend React não acessa o SQLite diretamente; o backend FastAPI é responsável por autenticação, autorização, validações e transações.

## 3. Como ler e validar os cenários

- **Dado** estabelece o estado inicial e as pré-condições.
- **Quando** descreve a ação do usuário ou a ocorrência de um evento.
- **Então** define o resultado observável e verificável.
- **E** complementa o resultado esperado.
- Dados de produtos, quantidades e IDs são **exemplos fictícios de teste**, não evidência de uso real.
- Os cenários precisam ser revisados e ligados a testes com resultado observado antes da homologação.

## 4. Histórias de usuário e cenários

### US-01 — Entrar no sistema com credenciais válidas

**Requisitos:** RF-01, RF-02. **Issues relacionadas:** AS-03, AS-04, AS-05 e AS-09.

**História:** Como **Administrador ou Operador**, quero autenticar-me com minhas credenciais para acessar somente as funções permitidas ao meu perfil.

**Critérios de aceite:** credenciais válidas dão acesso; credenciais incorretas são recusadas; operações protegidas exigem identidade válida; a API diferencia falta de autenticação (`401`) de falta de permissão (`403`).

```gherkin
Funcionalidade: Autenticação de usuário

  Cenário: Login com credenciais válidas
    Dado que existe uma conta ativa de Operador com senha cadastrada de forma segura
    Quando o Operador informar suas credenciais válidas
    Então o sistema deve autenticar a conta
    E disponibilizar somente as funcionalidades autorizadas ao perfil

  Cenário: Login com senha incorreta
    Dado que existe uma conta ativa de Operador
    Quando o Operador informar uma senha incorreta
    Então a autenticação deve ser recusada
    E nenhuma operação protegida deve ser liberada
```

### US-02 — Cadastrar produtos sem duplicar SKU

**Requisito:** RF-03. **Issues relacionadas:** AS-04, AS-05 e AS-09.

**História:** Como **Operador**, quero cadastrar produtos com seus dados essenciais para organizar o catálogo de estoque.

**Critérios de aceite:** SKU único e não vazio; dados essenciais obrigatórios; estoque inicial coerente com a regra de negócio; cadastro duplicado rejeitado sem criação parcial.

```gherkin
Funcionalidade: Cadastro de produtos

  Cenário: Cadastrar produto com SKU novo
    Dado que o Operador está autenticado e autorizado a cadastrar produtos
    E que o SKU "PROD-001" ainda não existe
    Quando cadastrar um produto com nome, categoria e SKU válidos
    Então o produto deve ser registrado com o SKU "PROD-001"
    E o sistema deve permitir a consulta de seus dados

  Cenário: Impedir cadastro com SKU duplicado
    Dado que já existe um produto com SKU "PROD-001"
    Quando o Operador tentar cadastrar outro produto com o mesmo SKU
    Então o sistema deve rejeitar o cadastro
    E não deve criar um segundo produto com esse SKU
```

### US-03 — Consultar e editar dados respeitando permissões

**Requisitos:** RF-02, RF-04. **Issues relacionadas:** AS-03, AS-04, AS-05 e AS-09.

**História:** Como **Operador**, quero consultar produtos e atualizar dados cadastrais permitidos, sem modificar saldo ou informações comerciais reservadas ao Administrador.

**Critérios de aceite:** consultas e alterações cadastrais autorizadas funcionam; preço e estoque mínimo ficam restritos ao Administrador; edição cadastral não altera quantidade física.

```gherkin
Funcionalidade: Atualização cadastral e controle de permissões

  Cenário: Alterar nome do produto sem mudar o saldo
    Dado que o Operador está autenticado
    E que o produto "PROD-001" possui saldo 12
    Quando alterar apenas o nome cadastral desse produto
    Então o novo nome deve ser salvo
    E o saldo deve continuar igual a 12

  Cenário: Bloquear mudança de preço por Operador
    Dado que o Operador está autenticado
    Quando tentar alterar o preço de venda de um produto
    Então a API deve negar a operação com HTTP 403
    E o preço registrado deve permanecer inalterado
```

### US-04 — Registrar entrada de mercadorias

**Requisito:** RF-05. **Issues relacionadas:** AS-04, AS-05 e AS-09.

**História:** Como **Operador**, quero registrar entradas de produtos para que o saldo e o histórico reflitam as quantidades recebidas.

**Critérios de aceite:** quantidade de entrada positiva; atualização de saldo e registro de movimentação atômicos; origem e motivo registrados.

```gherkin
Funcionalidade: Registro de entrada de estoque

  Cenário: Registrar entrada válida de 10 unidades
    Dado que o Operador está autenticado e autorizado
    E que o produto possui saldo 5
    Quando registrar uma entrada de 10 unidades com motivo válido
    Então o saldo do produto deve passar para 15
    E uma movimentação de entrada deve ser registrada no histórico
    E a movimentação deve informar os saldos anterior e posterior
```

### US-05 — Registrar saída sem permitir estoque negativo

**Requisito:** RF-06. **Issues relacionadas:** AS-04, AS-05 e AS-09.

**História:** Como **Operador**, quero registrar saídas de mercadorias para manter os saldos corretos, sem retirar mais unidades que as disponíveis.

**Critérios de aceite:** saída válida diminui saldo; saída excessiva é rejeitada; operação recusada não altera saldo nem cria movimentação de saída.

```gherkin
Funcionalidade: Registro de saída de estoque

  Cenário: Registrar saída dentro do saldo disponível
    Dado que o produto possui 8 unidades disponíveis
    E que o Operador está autenticado e autorizado
    Quando registrar a saída de 3 unidades
    Então o saldo deve passar para 5
    E a saída deve constar no histórico

  Cenário: Bloquear saída superior ao saldo
    Dado que o produto possui 5 unidades disponíveis
    E que o Operador está autenticado e autorizado
    Quando solicitar uma saída de 6 unidades
    Então a API deve rejeitar a operação por conflito de estoque
    E o saldo deve permanecer em 5
    E nenhuma saída correspondente deve ser registrada
```

### US-06 — Consultar histórico de movimentações

**Requisito:** RF-07. **Issues relacionadas:** AS-04, AS-05 e AS-09.

**História:** Como **Operador**, quero consultar o histórico de movimentações para conferir quando e por que o saldo mudou.

**Critérios de aceite:** consultar operações registradas; identificar tipo, motivo, data e quantidades; histórico original não pode ser editado ou excluído pela aplicação.

```gherkin
Funcionalidade: Consulta ao histórico de movimentações

  Cenário: Visualizar os detalhes de uma entrada
    Dado que existe uma movimentação de entrada registrada para um produto
    Quando o Operador consultar o histórico desse produto
    Então a movimentação deve aparecer na listagem
    E os campos de tipo, motivo e saldos anterior e posterior devem ser exibidos
```

### US-07 — Importar planilha sem sobrescrever saldo existente

**Requisito:** RF-08. **Issues relacionadas:** AS-06, AS-04 e AS-09.

**História:** Como **Administrador**, quero importar arquivos CSV e XLSX para cadastrar ou atualizar produtos sem perder a consistência dos saldos já registrados.

**Critérios de aceite:** validar cabeçalhos, valores e duplicidades; incluir novos produtos; atualizar dados cadastrais existentes por SKU; preservar saldo físico de produtos existentes; registrar a sincronização.

```gherkin
Funcionalidade: Importação controlada de produtos

  Cenário: Reimportar produto existente sem redefinir o saldo
    Dado que o Administrador está autenticado
    E que o produto "PROD-001" já possui saldo 12
    E que a planilha contém o mesmo SKU com quantidade informada igual a 50
    Quando o Administrador importar a planilha válida
    Então os campos cadastrais permitidos devem ser atualizados
    E o saldo físico do produto deve permanecer em 12
    E a importação deve ser registrada no histórico de sincronizações

  Cenário: Rejeitar planilha com SKU duplicado no arquivo
    Dado que o Administrador está autenticado
    E que o arquivo de importação contém duas linhas com o mesmo SKU
    Quando o Administrador tentar importar esse arquivo
    Então a importação deve ser rejeitada com indicação da inconsistência
    E não devem ocorrer alterações parciais no estoque
```

### US-08 — Receber webhook sem aplicar evento duplicado

**Requisito:** RF-09. **Issues relacionadas:** AS-06, AS-03 e AS-09.

**História:** Como **Cliente de Integração**, quero enviar eventos autenticados de entrada ou saída para sincronizar operações sem provocar movimentações repetidas.

**Critérios de aceite:** autenticação de integração independente do login humano; identificação do evento por origem e ID; evento repetido não movimenta novamente; payload divergente para a mesma identidade gera conflito; falhas são registradas para análise e possível reprocessamento controlado.

```gherkin
Funcionalidade: Processamento idempotente de webhooks

  Cenário: Reenviar o mesmo evento já processado
    Dado que um evento de entrada com origem "integracao-a" e ID "evt-001" já foi processado
    Quando a integração reenviar o evento com a mesma identidade e conteúdo
    Então o sistema deve reconhecer que o evento é duplicado
    E o saldo não deve ser movimentado novamente
    E não deve surgir uma segunda movimentação para o mesmo evento

  Cenário: Bloquear evento sem credencial de integração
    Dado que a rota de webhook exige credencial de integração
    Quando um cliente enviar um evento sem essa credencial
    Então a API deve rejeitar a requisição com HTTP 401
    E o saldo não deve ser modificado
```

### US-09 — Identificar produtos em situação de atenção

**Requisito:** RF-10. **Issues relacionadas:** AS-04, AS-06 e AS-09.

**História:** Como **Operador**, quero visualizar produtos que atingiram o estoque mínimo ou ficaram zerados para priorizar a conferência e a reposição.

**Critérios de aceite:** identificar produto ativo com saldo menor ou igual ao mínimo; distinguir saldo zerado; consulta reflete o estado registrado no backend.

```gherkin
Funcionalidade: Alertas de estoque

  Cenário: Identificar produto que atingiu o mínimo
    Dado que um produto ativo possui estoque mínimo igual a 5
    E que seu saldo atual é 5
    Quando o Operador consultar os alertas
    Então esse produto deve aparecer na lista de atenção

  Cenário: Identificar produto com estoque zerado
    Dado que um produto ativo possui saldo igual a zero
    Quando o Operador consultar a situação de estoque
    Então o sistema deve identificar esse produto como sem estoque
```

### US-10 — Consultar indicadores do dashboard

**Requisito:** RF-11. **Issues relacionadas:** AS-04, AS-05 e AS-09.

**História:** Como **Administrador ou Operador**, quero consultar indicadores atualizados para compreender a situação operacional do estoque.

**Critérios de aceite:** indicadores derivados de dados da API; total de produtos e unidades coerentes com consultas; gráficos identificados quando dados forem demonstrativos.

```gherkin
Funcionalidade: Dashboard de estoque

  Cenário: Atualizar indicadores após movimentação confirmada
    Dado que o usuário autenticado está visualizando o dashboard
    E que uma entrada de 4 unidades foi registrada com sucesso
    Quando atualizar os indicadores operacionais
    Então a quantidade total de unidades deve refletir a entrada registrada
    E os números exibidos devem ser obtidos de dados da API
```

### US-11 — Consultar previsão de demanda quando disponível

**Requisito:** RF-12. **Issues relacionadas:** AS-07, AS-08, AS-04 e AS-09.

**História:** Como **Administrador**, quero consultar a previsão de demanda por produto para apoiar o planejamento de reposição, conhecendo as limitações dos resultados.

**Critérios de aceite propostos:** previsões exibidas somente quando houver modelo aprovado e dados adequados; indicar indisponibilidade quando não existirem resultados válidos; registrar metodologia e métricas na documentação experimental.

```gherkin
Funcionalidade: Consulta a previsões de demanda

  Cenário: Exibir previsão produzida por modelo validado
    Dado que existe uma previsão disponível para determinado produto
    E que o modelo e o período da previsão estão identificados
    Quando o Administrador consultar a previsão
    Então o sistema deve apresentar o valor estimado e seu período de referência
    E a interface deve distinguir uma estimativa de um saldo efetivamente registrado
```

**Nota:** este cenário é uma proposta adicional a validar com AS-07 e AS-08. Não comprova precisão ou existência de modelo treinado.

### US-12 — Corrigir entrada manual com rastreabilidade (RF-13)

**Requisitos:** RF-13, RF-02, RF-07. **Issues relacionadas:** AS-03, AS-04, AS-05 e AS-09.

**História:** Como **Administrador**, quero corrigir uma quantidade de entrada manual registrada incorretamente por meio de movimentação compensatória, mantendo a entrada original e a justificativa para auditoria.

**Critérios de aceite:** apenas Administrador; corrigir entrada manual elegível; exigir justificativa; calcular `delta = quantidade_correta - quantidade_original`; aplicar delta ao saldo **atual**; rejeitar saldo negativo; manter movimento original; permitir uma correção por movimento original; impedir duplicação por chave idempotente; gravar usuário autenticado, data e vínculo histórico de forma atômica.

```gherkin
Funcionalidade: Correção auditável de entrada manual

  Cenário: Corrigir entrada após uma saída posterior
    Dado que o Administrador está autenticado e autorizado a corrigir lançamentos
    E que uma entrada manual original de 15 unidades foi registrada
    E que posteriormente ocorreu uma saída de 3 unidades
    E que o saldo atual do produto é 12
    Quando o Administrador confirmar a correção da entrada para 10 unidades com justificativa válida
    Então o sistema deve registrar uma movimentação compensatória de menos 5 unidades
    E o saldo atualizado deve ser 7
    E a entrada original de 15 unidades deve permanecer inalterada no histórico
    E o registro compensatório deve identificar o usuário, o motivo e a entrada original

  Cenário: Impedir correção por Operador
    Dado que o Operador está autenticado sem permissão de correção
    Quando tentar confirmar a correção de uma entrada manual
    Então a API deve negar a operação com HTTP 403
    E nenhuma alteração de saldo ou histórico deve ocorrer

  Cenário: Rejeitar correção que tornaria o estoque negativo
    Dado que o Administrador está autenticado
    E que existe uma entrada manual original de 15 unidades
    E que o saldo atual do produto é 3
    Quando solicitar a correção dessa entrada para 10 unidades
    Então o sistema deve rejeitar a operação por conflito de saldo
    E o saldo deve permanecer em 3
    E nenhuma movimentação compensatória deve ser gravada
```

**Nota técnica:** a correção compensatória não é equivalente ao `AJUSTE` de inventário físico que estabelece um saldo final. O contrato detalhado está em [`../contrato-rf13.md`](../contrato-rf13.md).

## 5. Matriz inicial de vinculação entre requisitos, histórias e Issues

| Requisito(s)        | História | Comportamento principal            | Implementação / teste      |
| ------------------- | -------- | ---------------------------------- | -------------------------- |
| RF-01, RF-02        | US-01    | Autenticação e acesso              | AS-03, AS-04, AS-05, AS-09 |
| RF-03               | US-02    | Cadastro por SKU                   | AS-04, AS-05, AS-09        |
| RF-02, RF-04        | US-03    | Atualização cadastral com RBAC     | AS-03, AS-04, AS-05, AS-09 |
| RF-05               | US-04    | Entrada de mercadorias             | AS-04, AS-05, AS-09        |
| RF-06               | US-05    | Saída e bloqueio de saldo negativo | AS-04, AS-05, AS-09        |
| RF-07               | US-06    | Histórico de movimentações         | AS-04, AS-05, AS-09        |
| RF-08               | US-07    | Importações CSV/XLSX               | AS-06, AS-04, AS-09        |
| RF-09               | US-08    | Webhooks idempotentes              | AS-06, AS-03, AS-09        |
| RF-10               | US-09    | Alertas de estoque                 | AS-04, AS-06, AS-09        |
| RF-11               | US-10    | Dashboard real                     | AS-04, AS-05, AS-09        |
| RF-12               | US-11    | Previsão de demanda                | AS-07, AS-08, AS-04, AS-09 |
| RF-13, RF-02, RF-07 | US-12    | Correção compensatória auditável   | AS-03, AS-04, AS-05, AS-09 |

Esta é uma **matriz inicial de cobertura documental**, não substitui a matriz completa de rastreabilidade, que também deverá associar componentes, IDs dos casos de teste, execução, resultados e evidências.

## 6. Critérios para aprovação desta minuta

- [ ] Conferir que os textos das histórias correspondem ao escopo aprovado da AS-01.
- [ ] Validar autenticação, permissões e restrições com o responsável pela AS-03.
- [ ] Validar telas e interações com o responsável pela AS-04.
- [ ] Validar contratos de importação/webhook com o responsável pela AS-06.
- [ ] Validar a apresentação de previsões com os responsáveis pelas AS-07 e AS-08.
- [ ] Confirmar com a equipe o contrato RF-13 para prévia, correção e idempotência.
- [ ] Converter cenários prioritários em casos automatizados ou roteiros de teste na AS-09.
- [ ] Registrar evidências reais na matriz de rastreabilidade durante a homologação.

## 7. Referências internas

- [`docs/requisitos.md`](../requisitos.md) — RF-01 a RF-13, RNFs, MoSCoW e cinco cenários preliminares.
- [`docs/matriz-permissoes.md`](../matriz-permissoes.md) — RBAC de Administrador, Operador e integração externa.
- [`docs/contrato-rf13.md`](../contrato-rf13.md) — correção de entrada manual, restrições, transações e idempotência.
- [`docs/arquitetura.md`](../arquitetura.md) — arquitetura projetada e divisão por camadas.
- [Issue AS-11](https://github.com/IkaroGLT/AutoStock-Intelligence/issues/11).

**Repositório:** <https://github.com/IkaroGLT/AutoStock-Intelligence>
