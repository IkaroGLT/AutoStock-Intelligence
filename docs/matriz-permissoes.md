# AutoStock Intelligence — Matriz de permissões (RBAC)

**Versão:** 0.2 — proposta para revisão e aprovação na AS-01  
**Data da proposta:** 08/11/2026  
**Relacionados:** RF-01, RF-02, RF-13, RNF-02; AS-01, AS-03, AS-04, AS-05 e AS-09  
**Status:** especificado para revisão; ainda não implementado.

## 1. Objetivo

Definir quais operações cada perfil pode executar, protegendo alterações críticas de estoque e garantindo que as permissões sejam verificadas **no backend**. Ocultar botões no React é apenas medida de usabilidade, não uma barreira de segurança.

## 2. Atores

- **Administrador:** gerencia usuários e parâmetros, executa operações de estoque e realiza correções auditáveis.
- **Operador:** consulta informações, cadastra produtos e registra entradas e saídas de rotina, sem privilégios administrativos.
- **Cliente de integração (não humano):** envia eventos autenticados por credencial própria, distinta do login humano. Não herda o papel de Administrador ou Operador.

Não haverá cadastro público de usuários nesta primeira versão. Contas são provisionadas por um Administrador, conforme projeto da AS-03. O mecanismo de sessão/token do login humano será detalhado na AS-03.

## 3. Matriz proposta

**Legenda:** ✅ permitido, ❌ negado, 🔑 credencial exclusiva de integração.

| Permissão / ação | Administrador | Operador | Integração externa |
|---|:---:|:---:|:---:|
| Entrar no sistema com credenciais de usuário | ✅ | ✅ | ❌ |
| Consultar produtos e estoque | ✅ | ✅ | ❌ |
| Cadastrar produtos e editar dados cadastrais | ✅ | ✅ | ❌ |
| Modificar preços e parâmetros de estoque mínimo | ✅ | ❌ | ❌ |
| Registrar entrada manual | ✅ | ✅ | ❌ |
| Registrar saída manual | ✅ | ✅ | ❌ |
| Consultar histórico e auditoria operacional | ✅ | ✅ | ❌ |
| **Corrigir lançamento manual de entrada (RF-13)** | **✅** | **❌** | **❌** |
| Ajustar saldo após inventário físico | ✅ | ❌ | ❌ |
| Importar CSV/XLSX | ✅ | ❌ | ❌ |
| Consultar dashboard, alertas e previsões | ✅ | ✅ | ❌ |
| Consultar estado e erros de sincronização | ✅ | ❌ | ❌ |
| Gerenciar usuários e perfis | ✅ | ❌ | ❌ |
| Receber/enviar eventos pelo endpoint de webhook | ❌ | ❌ | 🔑 |
| Editar ou apagar movimentos históricos | ❌ | ❌ | ❌ |

A permissão de correção RF-13 é propositalmente distinta da permissão de registrar entradas/saídas. Não permitir que um perfil sem `stock:correction:create` altere o saldo usando caminhos alternativos de ajuste ou exclusão.

## 4. Permissões técnicas sugeridas

| Permissão interna | Ação |
|---|---|
| `products:read` | Consultar produtos e saldos |
| `products:write` | Cadastrar e editar campos cadastrais |
| `products:commercial:write` | Alterar preços e parâmetros sensíveis |
| `stock:movement:create` | Registrar entradas e saídas manuais |
| `stock:history:read` | Consultar histórico |
| `stock:correction:create` | Corrigir lançamento de entrada (RF-13) |
| `stock:adjustment:create` | Ajuste de inventário físico |
| `imports:run` | Importar planilhas |
| `reports:read` | Consultar indicadores, alertas e previsões |
| `sync:read` | Consultar detalhes de integrações |
| `users:manage` | Gerenciar contas e perfis |
| `webhook:ingest` | Enviar evento autenticado por token de integração |

Estas strings são **identificadores propostos**, não código já implementado.

## 5. Controles obrigatórios

1. O backend identifica o usuário a partir da sessão/token autenticado, **nunca** de um `usuario_id` informado pelo navegador.
2. Falta de autenticação → `401`; usuário autenticado sem permissão → `403`.
3. Toda rota que altera estoque verifica também as regras de negócio, saldo e auditoria.
4. `RF-13` é permitido somente para **Administrador** no MVP.
5. Endpoints de integração mantêm autenticação independente e escopo específico, sem reutilização do login humano.
6. Segredos e tokens reais não devem entrar no Git, logs ou exemplos publicados.
7. O Administrador também está sujeito a regras de saldo, integridade, idempotência e preservação de histórico.

## 6. Rastreabilidade e testes

| Regra | Issue | Validação prevista |
|---|---|---|
| Autenticação e papéis | AS-03 | 401/403; perfis válidos/inválidos |
| Visibilidade de ações na UI | AS-04 | Testes de interface por papel |
| Proteção da API de correção | AS-05 | Administrador autorizado; Operador 403 |
| Integridade e não exclusão | AS-05, AS-09 | Testes de saldo, auditoria e duplicidade |
| Credencial separada de webhook | AS-03, AS-06 | Rejeição de credencial incorreta |

## 7. Decisão e aprovação

- **Decisão proposta:** correção de lançamento e ajuste por inventário físico restritos ao Administrador; Operador pode registrar entradas/saídas comuns.
- [ ] Revisada com o responsável do projeto.
- [ ] Revisada com o responsável pela AS-03.
- [ ] Aprovada no Pull Request de documentação da AS-01.
- [ ] Registrado o nome e a data da aprovação.

**Observação:** qualquer mudança de permissões depois desta aprovação deverá atualizar este documento, os testes e as Issues correspondentes.
