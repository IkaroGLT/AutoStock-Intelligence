# AutoStock Intelligence — Estratégia de Testes e Validação

**Issue:** AS-11 — Documentação Técnica e Acadêmica
**Versão:** 0.1 — Proposta para revisão técnica e acadêmica
**Data de referência:** 10/11/2026
**Estado:** planejamento de testes; não representa testes executados ou resultados aprovados.

> **Regra de evidência:** os cenários, casos, métricas e comandos aqui descritos são um plano. Apenas uma execução verificável, vinculada a commit, ambiente, resultados observados e responsável, poderá ser registrada como aprovada.

## 1. Objetivo

Estabelecer como a equipe pretende verificar os requisitos funcionais RF-01 a RF-13, os requisitos não funcionais RNF-01 a RNF-05 e as regras de negócio RN-01 a RN-07 do AutoStock Intelligence. O documento complementa `docs/requisitos.md`, `docs/academico/historias-bdd.md` e `docs/academico/matriz-rastreabilidade.md`, sem substituir os respectivos contratos.

A AS-09 é responsável pela implementação e pela consolidação dos testes automatizados. A AS-10 será responsável pela automação de CI e avaliação não funcional. A AS-11 documenta a estratégia, os critérios e **somente as evidências realmente obtidas**.

## 2. Referências e versão de base

- Especificação de requisitos: [`../requisitos.md`](../requisitos.md).
- Histórias de usuário e BDD: [`historias-bdd.md`](historias-bdd.md).
- Matriz de rastreabilidade e IDs de teste: [`matriz-rastreabilidade.md`](matriz-rastreabilidade.md).
- Matriz RBAC: [`../matriz-permissoes.md`](../matriz-permissoes.md).
- Contrato RF-13: [`../contrato-rf13.md`](../contrato-rf13.md).
- Arquitetura: [`../arquitetura.md`](../arquitetura.md).
- Issue [AS-09](https://github.com/IkaroGLT/AutoStock-Intelligence/issues/9) e Issue [AS-10](https://github.com/IkaroGLT/AutoStock-Intelligence/issues/10).

**Baseline documentada:** a AS-02 disponibilizou `backend/tests/test_database.py`, `backend/tests/test_health.py`, API inicial com `/health`, SQLite e projeto React. Essas verificações iniciais **não comprovam** os fluxos de negócio das Issues ainda em desenvolvimento. O repositório `Mock_Estoque_API` serve como referência independente, não como evidência de teste do AutoStock.

## 3. Níveis de teste

| Nível                   | Propósito                                    | Exemplos                                                         | Responsabilidade principal                           |
| ----------------------- | -------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| Unitário                | Verificar funções e regras isoladas          | Validação de SKU; cálculo de delta RF-13; regras de permissão    | Desenvolvedores das Issues, com consolidação AS-09   |
| Integração              | Verificar componentes em conjunto            | FastAPI + SQLite; importação + transação; webhook + auditoria    | AS-05/06 e AS-09                                     |
| Contrato de API         | Verificar entradas, respostas e status HTTP  | Autenticação 401/403, validação 422, conflito 409                | AS-03/05/06 e AS-09                                  |
| Interface / componentes | Verificar renderização e estados             | Formulários; erro/vazio/carregamento; navegação                  | AS-04/05 e AS-09                                     |
| Ponta a ponta (E2E)     | Validar fluxo real do usuário pelo navegador | Login → produto → entrada → histórico                            | AS-05/09, quando as interfaces estiverem disponíveis |
| Não funcional           | Avaliar metas mensuráveis                    | p95, integridade, cobertura, usabilidade                         | AS-09/10/12                                          |
| Experimental de ML      | Avaliar dados, baseline, modelo e inferência | Separação temporal, MAE/RMSE e vazamento de dados, se aplicáveis | AS-07/08 e AS-09                                     |

A seleção de `pytest`, `TestClient`, ferramentas frontend/E2E e ferramentas de carga deverá ser confirmada com os responsáveis. As tecnologias citadas aqui são propostas, não comprovações de uso.

## 4. Ambientes, massa de dados e isolamento

1. Registrar sistema operacional, versão do Python, Node.js, dependências instaladas e commit SHA.
2. Utilizar banco SQLite **temporário e isolado** para cada conjunto de testes, sem modificar `backend/data/autostock.db` do desenvolvimento.
3. Executar `PRAGMA foreign_keys=ON` em cada conexão utilizada nos testes e confirmar as restrições pertinentes.
4. Utilizar dados de teste sintéticos, identificados como tal; não armazenar senhas reais, tokens ou dados pessoais em logs/evidências.
5. Reinicializar os cenários de forma reproduzível; não depender de um banco previamente preenchido por outro teste.
6. Executar testes concorrentes com cuidado para não confundir contenção esperada do SQLite com aplicação incorreta de saldo.
7. Para testes de usabilidade, registrar autorização/consentimento quando cabível e usar resultados anonimizados.

### 4.1. Execução básica existente na AS-02

No PowerShell, **dentro de `backend/`**, com o ambiente preparado:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

O comando executa os testes disponíveis no checkout atual; **não implica** que testes futuros da AS-09 já existam. Registrar saída, data, commit e quantidade real de testes ao obter resultados.

No frontend, **dentro de `frontend/`**:

```powershell
npm run lint
npm run build
```

Essas verificações são de qualidade estática/compilação, e não substituem testes de comportamento ou E2E.

## 5. Abordagem para requisitos funcionais

A matriz de rastreabilidade possui IDs de `CT-RF01-01` até `CT-RF13-05`. **Esses identificadores são a fonte única para relacionar execução, automação e evidências.** Não renumerar ou substituir por nomes novos sem atualizar a matriz.

| Área               | IDs previstos          | O que demonstrar                                                    | Issue principal |
| ------------------ | ---------------------- | ------------------------------------------------------------------- | --------------- |
| Autenticação       | CT-RF01-01/02          | Login válido e senha inválida                                       | AS-03           |
| Autorização        | CT-RF02-01/02          | 401 sem autenticação, 403 sem permissão                             | AS-03           |
| Cadastro           | CT-RF03-01/02          | SKU novo aceito; SKU duplicado rejeitado                            | AS-05           |
| Atualização        | CT-RF04-01/02          | Alteração cadastral preserva saldo; preço restrito                  | AS-05           |
| Entrada            | CT-RF05-01             | Saldo e histórico mudam na mesma transação                          | AS-05           |
| Saída              | CT-RF06-01/02          | Saída válida e bloqueio de saldo insuficiente                       | AS-05           |
| Histórico          | CT-RF07-01/02          | Consulta e imutabilidade do lançamento                              | AS-05           |
| Importação         | CT-RF08-01/02          | Reimportação mantém saldo; arquivo inválido não altera parcialmente | AS-06           |
| Webhook            | CT-RF09-01/02/03       | Recebimento, deduplicação e credencial independente                 | AS-06           |
| Alertas            | CT-RF10-01/02          | Estoque mínimo e saldo zerado                                       | AS-06           |
| Dashboard          | CT-RF11-01             | Indicadores obtidos da API                                          | AS-05           |
| Previsões          | CT-RF12-01/02          | Valor identificado e indisponibilidade segura                       | AS-07/08        |
| Correção auditável | CT-RF13-01/02/03/04/05 | Delta, RBAC, saldo, idempotência e concorrência                     | AS-05           |

**Não concluir que todos os testes estão implementados:** a tabela define a cobertura pretendida a partir dos requisitos.

## 6. Projeto de testes: particionamento de equivalência

O particionamento de equivalência divide entradas em classes de comportamento semelhante. A equipe deverá selecionar casos de cada classe válida e inválida, incluindo respostas HTTP e estado persistido no banco quando aplicável.

| Campo/fluxo           | Classe válida                                                | Classes inválidas                                                                           | Vinculação inicial                |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------- |
| SKU                   | Texto não vazio e ainda não cadastrado                       | Vazio, espaços, duplicado                                                                   | CT-RF03-01/02                     |
| Quantidade de entrada | Inteiro >= 1                                                 | Zero, negativa, não inteira, texto                                                          | CT-RF05-01 + complementares AS-09 |
| Quantidade de saída   | Inteiro entre 1 e saldo disponível                           | Zero, negativa, saldo+1, tipo incorreto                                                     | CT-RF06-01/02                     |
| Importação CSV/XLSX   | Cabeçalho completo, SKU único, valores válidos               | Campo ausente, SKU duplicado, preço negativo, tipo inválido                                 | CT-RF08-01/02                     |
| Webhook               | Credencial correta, origem e ID válidos                      | Sem credencial; mesmo ID com payload diferente                                              | CT-RF09-01/02/03 + complementar   |
| RF-13                 | Correção manual elegível; motivo não vazio; delta admissível | Entrada inelegível, motivo vazio, valor negativo, replay incompatível, falta de autorização | CT-RF13-01 a 05 + complementares  |

**Expectativa:** a validação de frontend pode auxiliar na usabilidade, mas a rejeição definitiva deve ocorrer no FastAPI; a ausência de dados gravados após falha também deve ser verificada.

## 7. Projeto de testes: análise de valor-limite

| Domínio                                    | Valores sugeridos                             | Resultado esperado                                                                                               |
| ------------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Entrada em estoque                         | `-1`, `0`, `1`                                | `-1` e `0` rejeitados; `1` aceito                                                                                |
| Saída com saldo 5                          | `0`, `1`, `5`, `6`                            | `0` e `6` rejeitados; `1` e `5` aceitos                                                                          |
| SKU obrigatório                            | `""`, `" "`, `"P"`                            | Duas primeiras formas rejeitadas; terceira aceita se única                                                       |
| Estoque mínimo 5                           | Saldos `4`, `5`, `6`                          | Alertar 4 e 5; não alertar 6, para produto ativo                                                                 |
| RF-13: entrada original 15; saldo atual 12 | Quantidade correta `-1`, `0`, `3`, `15`, `16` | `-1` inválida; `0` e `3` gerariam saldo negativo; `15` sem efeito; `16` gera delta +1 se demais regras cumpridas |
| RNF de usabilidade                         | Tempos próximos de 5 minutos por tarefa       | Medir tempo exato e sucesso sem assistência, sem arredondar para aprovar                                         |

A lista é ilustrativa; a AS-09 deverá revisar cenários, pré-condições, estados de banco e contratos de status HTTP antes de implementar os testes.

## 8. Estratégias para situações críticas

### 8.1. Segurança e autorização — AS-03

- Confirmar `401` para requisição sem autenticação ou com credencial inválida.
- Confirmar `403` para pessoa autenticada sem a permissão exigida.
- Verificar que uma tentativa proibida **não altera o banco**.
- Validar operações administrativas separadas das ações operacionais de Operador.
- Não aceitar `usuario_id` fornecido pelo navegador como fonte da identidade autenticada.
- Verificar que credenciais de webhooks são independentes de sessões/tokens humanos.
- Não registrar senhas, tokens ou segredos em logs.

### 8.2. Consistência e rollback — AS-05/06

- Confirmar que cada entrada/saída grava saldo e histórico de maneira atômica.
- Forçar falhas antes do `COMMIT` e verificar rollback completo.
- Reenviar `origem+evento_id` e confirmar que somente uma movimentação é aplicada.
- Confirmar rejeição de saída acima do estoque disponível.
- Simular conflitos/concorrência com registros idênticos e verificar idempotência.
- Importar planilha repetida sem redefinir o saldo de SKU existente.

### 8.3. Correção RF-13 — AS-05

Contrato: `docs/contrato-rf13.md`. A correção altera o **saldo atual** por diferença em relação à entrada original, sem apagar ou atualizar o lançamento anterior.

Exemplo de referência: entrada de 15, saída posterior de 3, saldo atual de 12, entrada correta de 10. Delta `10-15=-5`, saldo novo `12-5=7`.

Verificar especialmente:

1. Administrador autorizado; Operador proibido (`CT-RF13-02`).
2. Histórico original permanece imutável (`CT-RF13-01`).
3. Se o saldo ficar negativo, rejeitar sem compensação (`CT-RF13-03`).
4. Repetição idêntica da chave não gera segundo lançamento (`CT-RF13-04`).
5. Mudança de saldo desde a prévia retorna conflito (`CT-RF13-05`).
6. Justificativa e vínculo histórico são obrigatórios.
7. Correção do tipo `AJUSTE` de inventário físico **não é** equivalente à compensação RF-13.

### 8.4. Fluxos de interface — AS-04/05

- Estados de carregamento, erro, vazio e sucesso legíveis.
- Após entrada/saída confirmada, saldo, histórico e dashboard coerentes.
- Erros `401`, `403`, `404`, `409`, `422` e de rede tratados sem mensagens internas sensíveis.
- Operações proibidas não devem ser executáveis mesmo por chamadas diretas à API, independentemente de botões ocultos no React.
- Testar navegação por teclado, rótulos dos formulários e responsividade como parte da qualidade de interação.

### 8.5. Machine Learning — AS-07/08

- Identificar origem e natureza (real/sintética) do dataset.
- Evitar vazamento temporal: treinar com dados anteriores ao período de avaliação.
- Separar demanda observada de `SAIDA` genérica, que pode incluir perdas ou ajustes.
- Comparar modelo com baseline sob as mesmas métricas e partição.
- Registrar quantidade de registros, período, MAE/RMSE ou métricas efetivamente adotadas, sem inventar valores.
- Exibir previsões apenas se houver resultados válidos; identificar horizonte e incertezas/limitações.

## 9. Requisitos não funcionais e plano de medição

As metas são as mesmas da especificação aprovada para o MVP; **não equivalem a resultados já medidos**.

| ID do teste | RNF                     | Critério planejado                                                                         | Procedimento e evidência                                                                                        |
| ----------- | ----------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| CT-RNF01-01 | RNF-01 — Desempenho     | `GET /produtos`: p95 <= 1 s com 1.000 produtos e 10 usuários concorrentes                  | Fixar ambiente, população, duração, amostragem, taxas de erro, relatórios de latência e commit                  |
| CT-RNF02-01 | RNF-02 — Segurança      | 100% das operações críticas protegidas                                                     | Inventariar endpoints críticos, matriz de papéis e resultados 401/403; testar acesso não autorizado sem mutação |
| CT-RNF03-01 | RNF-03 — Confiabilidade | Zero saldos negativos, duplicidades ou gravações parciais em 100 cenários controlados      | Numerar os 100 cenários e guardar dados iniciais, ação, falha simulada, resultado, estado final e log           |
| CT-RNF04-01 | RNF-04 — Testabilidade  | Cobertura automatizada >= 70% dos serviços centrais de negócio                             | Definir módulos incluídos/excluídos e medir relatório de cobertura por commit                                   |
| CT-RNF05-01 | RNF-05 — Usabilidade    | Ao menos 4 de 5 participantes concluem 3 tarefas sem assistência, até 5 minutos por tarefa | Definir roteiro, critérios, participantes, tempos, observações e resultados anonimizados                        |

**Nota:** se a equipe alterar uma meta, o requisito deve ser revisado formalmente em `docs/requisitos.md` e os documentos de rastreabilidade devem acompanhar a decisão.

## 10. Qualidade de software: ligação à ISO/IEC 25010

A análise detalhada será consolidada no documento `qualidade-iso25010.md` (a produzir). O vínculo inicial para o planejamento é:

| Característica a analisar             | Evidência planejada no AutoStock                      |
| ------------------------------------- | ----------------------------------------------------- |
| Adequação funcional                   | Cobertura dos RFs, aceite e casos de teste            |
| Eficiência de desempenho              | RNF-01 e relatórios de carga                          |
| Segurança                             | RNF-02, RBAC e resultados negativos 401/403           |
| Confiabilidade                        | RNF-03, idempotência, rollback e resiliência a falhas |
| Capacidade de interação / usabilidade | RNF-05, acessibilidade e testes com usuários          |
| Manutenibilidade                      | Organização modular, revisões PR, automação e testes  |

Trata-se de uma **matriz orientadora de características**, não de uma certificação ISO nem de uma avaliação concluída.

## 11. Critérios de entrada e saída por fluxo

### Entrada para execução

- Contrato funcional revisado pelo responsável pela Issue.
- Versão de código identificada por commit.
- Ambiente e dados de teste reproduzíveis.
- Dependências necessárias disponíveis ou declaradas como impedimento (`BLOCKED`).
- Resultado esperado explicitado em ID de caso de teste.

### Saída para aprovação técnica

- Testes previstos para o escopo da entrega executados com resultado observável.
- Defeitos críticos e violações de integridade tratados antes do merge.
- Falhas conhecidas documentadas com impacto e plano de ação.
- PR revisado por integrante responsável e alterações integradas conforme processo do projeto.
- Matriz de rastreabilidade atualizada com IDs, commits e links das evidências.
- Metas RNF declaradas como atendidas **somente se medidas e verificadas**.

## 12. Registro de execução: modelo obrigatório

Preencher uma linha **após** cada execução de caso de teste. Nunca colocar `PASS` antecipadamente.

| Campo                   | Como preencher                                              |
| ----------------------- | ----------------------------------------------------------- |
| ID                      | `CT-RFxx-yy` ou `CT-RNFxx-yy` já previsto na matriz         |
| Issue/US/RF             | Correspondência com especificação e história                |
| Commit                  | SHA exato testado                                           |
| Data/hora               | Data e horário reais da execução                            |
| Executor                | Responsável efetivo pela validação                          |
| Ambiente                | SO, Python/Node, versões importantes, base/dados sintéticos |
| Entrada e pré-condições | Estado inicial do sistema e requisição/ação                 |
| Resultado esperado      | Critério da matriz, versão contratual                       |
| Resultado observado     | Saída, HTTP, saldo, log e estado persistido                 |
| Estado                  | `PASS`, `FAIL`, `BLOCKED` ou `NOT_RUN`                      |
| Evidência               | Link de relatório, PR, Actions ou artefato verificável      |
| Defeito relacionado     | Issue/identificador, quando houver                          |

**Modelo preenchível:**

```text
ID:
Requisito / História:
Issue:
Commit:
Executado em:
Executor:
Ambiente e massa de dados:
Pré-condições:
Ação / entrada:
Resultado esperado:
Resultado observado: PENDENTE
Estado: NOT_RUN
Evidência: EV-PENDENTE
Defeito relacionado: Nenhum registrado / A preencher
```

## 13. Estratégia de defeitos e regressão

1. Registrar defeito com comportamento observado, pré-condições, passos para reproduzir e severidade.
2. Associar o defeito à Issue/PR e aos casos de teste afetados.
3. Corrigir no escopo autorizado da branch responsável; evitar mudanças diretamente na `main`.
4. Reexecutar o cenário que falhou e os testes de regressão relacionados.
5. Atualizar status e evidência somente com a saída real da nova execução.
6. Se o contrato for alterado, atualizar requisitos, histórias, matriz, testes e instruções operacionais.

**Priorização proposta:** crítico (perda de dados, estoque incorreto, violação de acesso), alto (fluxo essencial indisponível), médio (fluxo parcial/degradação com alternativa), baixo (ajuste visual/documental). A equipe deve aprovar essa classificação antes de utilizá-la como política formal.

## 14. Checklist para revisão da estratégia

- [ ] Responsável pela AS-09 revisou os casos e as ferramentas escolhidas.
- [ ] Responsável pela AS-10 definiu ambientes e critérios da execução automatizada.
- [ ] Responsáveis pelas AS-03/04/05/06 validaram as regras dos fluxos sob sua responsabilidade.
- [ ] Responsáveis pelas AS-07/08 confirmaram o protocolo experimental de ML.
- [ ] Casos de equivalência e limites foram refinados e implementados quando necessário.
- [ ] Os 100 cenários de RNF-03 foram catalogados e executados, quando aplicável.
- [ ] Cobertura, carga e usabilidade foram medidas; resultados reais vinculados.
- [ ] PR da AS-11 revisado, mantendo matrizes e testes consistentes.

## 15. Próximas atualizações previstas

- **Durante AS-03 a AS-08:** atualizar contratos, casos e decisões, sem inventar evidências.
- **Durante AS-09:** registrar implementação dos testes, resultados, regressões e cobertura.
- **Durante AS-10:** anexar relatórios de GitHub Actions e avaliações não funcionais.
- **Durante AS-11:** consolidar a análise de qualidade ISO/IEC 25010 e relatórios acadêmicos.
- **Durante AS-12:** apresentar os resultados verificados e as limitações restantes.

---

**Status deste documento:** minuta para revisão. **Não há resultados novos de testes, cobertura, segurança, carga, usabilidade ou ML declarados como executados neste arquivo.**
