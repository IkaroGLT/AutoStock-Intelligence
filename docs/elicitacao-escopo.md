# AutoStock Intelligence — Plano de elicitação e escopo

**Versão:** 0.1  
**Issue:** AS-01  
**Importante:** este arquivo distingue evidências verificadas, atividades propostas e atividades ainda não realizadas.

## 1. Problema

Microempreendedores e empresas de médio porte frequentemente enfrentam dificuldade de acompanhar saldos, movimentações e necessidade de reposição em períodos de alta demanda. O projeto propõe centralizar registros e alertas para reduzir conferências manuais recorrentes, sem eliminar a necessidade de verificações físicas periódicas.

## 2. Técnica A — Análise documental

**Objetivo:** identificar regras implementadas, riscos conhecidos, contratos existentes e funções reaproveitáveis.

**Materiais examinados na preparação deste documento:**
- `Mock_Estoque_API/README.md` e `docs/arquitetura.md` (escopo, endpoints, arquitetura e limitações).
- `Mock_Estoque_API/schema.sql` e `app.py` (tabelas e regras de saldo/movimentações).
- `Mock_Estoque_API/docs/contrato_integracao_vendas.md` (evento e idempotência).
- `fabrica-software-controle-estoque/README.md` (funcionalidades e interface acadêmica anterior).

**Resultados técnicos iniciais:** existe uma API REST com operações de produtos, saldo, importação, movimentações, webhooks e auditoria; o esquema possui cinco tabelas; a autenticação atual cobre integrações e deve ser ampliada para operações de usuários; a correção histórica com vínculo e identidade do usuário exige nova especificação. Ambos os repositórios originais serão preservados.

**Evidência acadêmica a organizar:** referências dos arquivos, registro de quem fez a análise, data, síntese das conclusões, decisões e confirmação pela equipe.

## 3. Técnica B — Questionário com potenciais usuários

**Objetivo:** validar problemas reais e priorizar funcionalidades com pessoas que executam ou acompanham controle de estoque.

**Amostra proposta:** entre 3 e 5 participantes com experiência prática; número final e perfil devem ser declarados no relatório. Não afirmar representatividade estatística.

**Perguntas sugeridas:**
1. Como você registra hoje entradas e saídas de estoque?
2. Com que frequência confere fisicamente o estoque?
3. Quais são os três erros mais comuns no processo?
4. Quando uma entrada é lançada incorretamente, como realiza a correção?
5. Quais alertas seriam mais úteis para evitar falta de mercadoria?
6. Costuma utilizar planilhas, sistema de vendas ou anotações manuais?
7. Qual informação do dashboard ajudaria sua rotina?
8. A previsão de demanda seria útil? Que dados históricos estão disponíveis?

**Evidências esperadas:** formulário utilizado, participantes anonimizados, respostas reais, data de aplicação, resumo por tema e decisões derivadas das respostas.

**Status:** questionário planejado; **não aplicado ou validado neste documento**.

## 4. Escopo aprovado para revisão

**Dentro do MVP:** usuários/permissões; cadastro de produtos; entrada, saída e RF-13; histórico; importação; webhooks simulados; alertas; dashboard; dados/ML com avaliação; testes e documentação.

**Fora do MVP:** ERP real de terceiros, pagamentos, múltiplas filiais, aplicação mobile nativa, reconciliação totalmente autônoma sem revisão humana e previsão de alta confiança sem histórico suficiente.

## 5. Registro de aprovação

- [ ] Revisar escopo e requisitos com a equipe.
- [ ] Decidir prioridades e ajustes com base nos resultados de elicitação.
- [ ] Registrar data e pessoa responsável pela aprovação.
- [ ] Anexar ou vincular evidências na AS-01/AS-11, respeitando privacidade dos participantes.
