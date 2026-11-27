# AutoStock-Intelligence

Sistema inteligente de controle e monitoramento de estoque, desenvolvido para automatizar atividades operacionais, acompanhar indicadores e utilizar técnicas de Machine Learning para apoiar a tomada de decisões.

## Objetivo do projeto

O AutoStock-Intelligence tem como objetivo evoluir um sistema tradicional de controle de estoque para uma solução capaz de acompanhar movimentações, identificar padrões, gerar indicadores e apoiar a previsão de necessidades de reposição.

A proposta é reduzir a necessidade de verificações manuais frequentes, permitindo que o acompanhamento do estoque seja realizado por meio de informações consolidadas e indicadores.

## Estado atual do projeto

O projeto está sendo desenvolvido de forma incremental, com módulos separados por responsabilidade.

| Módulo                     | Situação                                                            |
| -------------------------- | ------------------------------------------------------------------- |
| Backend — FastAPI          | Estrutura e funcionalidades iniciais implementadas                  |
| Autenticação e autorização | Implementação da AS-03 realizada                                    |
| Banco de dados SQLite      | Estrutura inicial implementada                                      |
| Importação de estoque      | Importação CSV/XLSX e histórico implementados                       |
| Webhooks                   | Recebimento, autenticação e registro de eventos implementados       |
| Frontend                   | Interface demonstrativa implementada                                |
| Integração Frontend/API    | Em desenvolvimento                                                  |
| Machine Learning           | Estrutura inicial preparada                                         |
| Documentação acadêmica     | Documentos de requisitos, testes, qualidade e validação organizados |

As funcionalidades devem ser consideradas conforme seu estado real de implementação. A existência de uma estrutura ou documentação não significa que todos os recursos planejados estejam concluídos.

## Tecnologias utilizadas

| Área             | Tecnologias             |
| ---------------- | ----------------------- |
| Backend          | Python, FastAPI         |
| Frontend         | React, TypeScript, Vite |
| Interface        | Tailwind CSS, shadcn/ui |
| Banco de dados   | SQLite                  |
| Autenticação     | JWT, PyJWT, Argon2      |
| Machine Learning | Python                  |
| Testes           | Pytest, ESLint          |
| Versionamento    | Git e GitHub            |

## Estrutura do projeto

O repositório está organizado em quatro áreas principais: Backend, Frontend, Machine Learning e documentação.

```text
AutoStock-Intelligence/
│
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── bootstrap_admin.py
│   │   │   ├── dependencies.py
│   │   │   ├── permissions.py
│   │   │   ├── repository.py
│   │   │   ├── router.py
│   │   │   ├── security.py
│   │   │   └── service.py
│   │   │── imports/
│   │   │   ├── __init__.py
│   │   │   ├── router.py
│   │   │   └── service.py
│   │   │
│   │   ├── stock/
│   │   │   ├── __init__.py
│   │   │   └── service.py
│   │   ├── db/
│   │   │   ├── config.py
│   │   │   ├── connection.py
│   │   │   ├── init_db.py
│   │   │   └── schema.sql
│   │   │
│   │   ├── webhooks/
│   │   │   ├── router.py
│   │   │   └── security.py
│   │   │
│   │   └── main.py
│   │
│   ├── data/
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_database.py
│   │   ├── test_health.py
│   │   └── test_webhook_auth.py
│   │
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── MovementDialogs.tsx
│   │   │   ├── MovementTable.tsx
│   │   │   ├── ProductDialogs.tsx
│   │   │   └── common.tsx
│   │   │
│   │   ├── data/
│   │   │   └── demo.ts
│   │   │
│   │   ├── lib/
│   │   ├── pages/
│   │   │   ├── AutomationPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── MovementsPage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   └── StockPage.tsx
│   │   │
│   │   ├── services/
│   │   │   ├── README.md
│   │   │   └── demoStorage.ts
│   │   │
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   │
│   ├── components.json
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
│
├── ml/
│   ├── data/
│   ├── preprocessing/
│   ├── training/
│   ├── inference/
│   └── README.md
│
├── docs/
│   ├── academico/
│   │   ├── contextualizacao.md
│   │   ├── elicitacao-requisitos.md
│   │   ├── estrategia-testes.md
│   │   ├── historias-bdd.md
│   │   ├── matriz-rastreabilidade.md
│   │   ├── qualidade-iso25010.md
│   │   └── validacao-as11.md
│   │
│   ├── arquitetura.md
│   ├── contrato-rf13.md
│   ├── elicitacao-escopo.md
│   ├── matriz-permissoes.md
│   ├── requisitos.md
│   ├── seguranca-autenticacao.md
│   └── seguranca-integracoes.md
│
├── .env.example
├── .gitignore
└── README.md
```

_Observação: a árvore representa os principais arquivos e diretórios identificados no repositório. Novos componentes poderão ser adicionados conforme o desenvolvimento._

## Backend

O Backend é responsável pelo processamento das requisições, regras de negócio, autenticação, autorização e comunicação com o banco de dados.

### Tecnologias

- Python
- FastAPI
- SQLite
- PyJWT
- Argon2
- Pytest

### Inicialização do ambiente

Na raiz do projeto:

```powershell
cd backend
```

Crie e ative o ambiente virtual:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Instale as dependências:

```powershell
pip install -r requirements.txt
```

### Configuração das variáveis de ambiente

O arquivo `.env.example` apresenta as variáveis necessárias como referência. As configurações devem ser disponibilizadas no ambiente de execução.

Gere uma chave JWT:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Configure a chave:

```powershell
$env:AUTOSTOCK_JWT_SECRET="SUA_CHAVE_GERADA"
```

Gere e configure um segredo independente para Webhooks:

```powershell
$env:AUTOSTOCK_WEBHOOK_TOKEN="OUTRO_SEGREDO_GERADO"
```

As duas credenciais devem ser diferentes e nunca devem ser versionadas no Git.

Para configurar um caminho personalizado para o banco:

```powershell
$env:AUTOSTOCK_DB_PATH="data"
```

### Inicialização do banco de dados

```powershell
python -m app.db.init_db
```

### Criação do primeiro administrador

```powershell
python -m app.auth.bootstrap_admin
```

O procedimento permite cadastrar o primeiro usuário administrador quando ainda não existem usuários registrados.

### Execução da API

```powershell
uvicorn app.main:app --reload
```

Documentação interativa:

http://127.0.0.1:8000/docs

## Autenticação e autorização

A autenticação de usuários utiliza JWT, com controle de acesso baseado em papéis e permissões.

### Endpoints

| Método | Endpoint                       | Acesso      |
| ------ | ------------------------------ | ----------- |
| POST   | `/auth/login`                  | Público     |
| GET    | `/auth/me`                     | Autenticado |
| GET    | `/auth/users`                  | ADMIN       |
| POST   | `/auth/users`                  | ADMIN       |
| PATCH  | `/auth/users/{user_id}/role`   | ADMIN       |
| PATCH  | `/auth/users/{user_id}/status` | ADMIN       |
| GET    | `/health`                      | Público     |

### Mecanismos de segurança

- Tokens JWT assinados com HS256.
- Validade de acesso de 30 minutos.
- Senhas protegidas com hash Argon2.
- Verificação do estado ativo dos usuários.
- Controle de acesso por papéis e permissões.
- Segredo JWT fornecido por variável de ambiente.
- Proteção independente para autenticação de Webhooks.

## Importação de estoque

O módulo de importações permite cadastrar e atualizar produtos por arquivos CSV e XLSX.

### Endpoint de importação

`POST /importacoes`

Requer autenticação e permissão `imports:run`.

### Endpoint de histórico

`GET /importacoes`

Requer autenticação e permissão `sync:read`.

Permite consultar o histórico das importações CSV e XLSX, com paginação por meio dos parâmetros `limite` e `deslocamento`.

### Regras da importação

- Arquivos CSV com codificação UTF-8.
- Arquivos XLSX com leitura da primeira planilha.
- Limite máximo de 5 MB.
- Colunas obrigatórias: `sku`, `nome`, `categoria`, `preco_custo`, `preco_venda`, `quantidade`, `estoque_minimo` e `ativo`.
- SKUs duplicados no mesmo arquivo são rejeitados.
- Produtos existentes têm seus dados cadastrais atualizados, mas preservam o saldo atual.
- Produtos novos recebem seu estoque inicial por meio do serviço central de movimentações.
- A importação é transacional: falhas provocam rollback.
- O histórico é registrado na tabela `sincronizacoes`.

## Webhooks

Os eventos recebidos são registrados e processados conforme o contrato de integração. Eventos válidos podem gerar movimentações de entrada ou saída, com prevenção de duplicidade e registro do resultado do processamento.

### Endpoint

```text
POST /webhooks/events
```

A autenticação utiliza o cabeçalho:

```text
X-Webhook-Token
```

Os eventos recebidos são registrados no banco de dados.

A prevenção de duplicidade utiliza a combinação entre origem e identificador do evento.

Atualmente, o módulo contempla autenticação, recebimento e persistência dos eventos. O processamento posterior das movimentações deverá ser desenvolvido em etapas futuras.

## Frontend

O Frontend é responsável pela interface de interação com os usuários e pela apresentação das informações do estoque.

### Funcionalidades da interface

- Dashboard.
- Visualização de estoque.
- Cadastro e gerenciamento demonstrativo de produtos.
- Registro e visualização de movimentações.
- Relatórios.
- Interface de automação.
- Tela de login.

### Estado da integração

A interface possui uma estrutura funcional demonstrativa, utilizando dados locais e persistência por `localStorage`.

Os dados demonstrativos permanecem no navegador e ainda não são sincronizados com o Backend.

A integração real com a API FastAPI será desenvolvida na AS-05, incluindo autenticação, comunicação HTTP, tratamento de respostas e substituição do armazenamento demonstrativo.

### Inicialização

Em um novo terminal, na raiz do projeto:

```powershell
cd frontend
```

Instale as dependências:

```powershell
npm install
```

Execute a aplicação:

```powershell
npm run dev
```

### Verificações

Lint:

```powershell
npm run lint
```

Build:

```powershell
npm run build
```

## Machine Learning

O diretório `ml/` integra a arquitetura do AutoStock-Intelligence e será responsável pelos recursos de análise de dados e previsão de demanda.

O desenvolvimento do módulo ocorre de forma independente das operações transacionais do Backend.

### Organização

| Diretório           | Responsabilidade                                     |
| ------------------- | ---------------------------------------------------- |
| `ml/data/`          | Organização dos conjuntos de dados.                  |
| `ml/preprocessing/` | Limpeza, transformação e preparação dos dados.       |
| `ml/training/`      | Treinamento e avaliação dos modelos.                 |
| `ml/inference/`     | Execução dos modelos treinados para gerar previsões. |

### Evolução planejada

- Preparação e análise dos dados históricos.
- Identificação de padrões de consumo.
- Desenvolvimento de modelos de previsão de demanda.
- Avaliação dos resultados dos modelos.
- Apoio à identificação de necessidades de reposição.
- Integração das inferências aprovadas com a API.

**Estado atual:** estrutura inicial preparada. A implementação dos modelos e sua integração com o Backend ainda estão em desenvolvimento.

O detalhamento do módulo está disponível em `ml/README.md`.

## Banco de dados

O projeto utiliza SQLite para persistência dos dados.

A estrutura inicial contempla entidades relacionadas a:

- Usuários.
- Produtos.
- Movimentações de estoque.
- Eventos recebidos por Webhooks.
- Registros auxiliares necessários ao funcionamento da aplicação.

A estrutura pode evoluir conforme os requisitos funcionais e a integração dos módulos forem implementados.

## Testes

Os testes automatizados do Backend utilizam Pytest.

Para executar:

```powershell
cd backend
python -m pytest -q
```

O Frontend utiliza ESLint para análise estática e Vite para compilação de produção.

```powershell
cd frontend
npm run lint
npm run build
```

## Documentação

A documentação do projeto está organizada no diretório `docs/`.

### Documentação acadêmica

| Arquivo                                    | Conteúdo                                         |
| ------------------------------------------ | ------------------------------------------------ |
| `docs/academico/contextualizacao.md`       | Contextualização do projeto.                     |
| `docs/academico/elicitacao-requisitos.md`  | Processo de elicitação de requisitos.            |
| `docs/academico/estrategia-testes.md`      | Estratégia de testes.                            |
| `docs/academico/historias-bdd.md`          | Histórias e cenários BDD.                        |
| `docs/academico/matriz-rastreabilidade.md` | Rastreabilidade dos requisitos.                  |
| `docs/academico/qualidade-iso25010.md`     | Avaliação da qualidade baseada na ISO/IEC 25010. |
| `docs/academico/validacao-as11.md`         | Documentação da validação da AS-11.              |

### Documentação técnica

| Arquivo                          | Conteúdo                                               |
| -------------------------------- | ------------------------------------------------------ |
| `docs/arquitetura.md`            | Arquitetura projetada do sistema.                      |
| `docs/contrato-rf13.md`          | Contrato da correção de estoque relacionada ao RF-013. |
| `docs/elicitacao-escopo.md`      | Elicitação e definição do escopo.                      |
| `docs/matriz-permissoes.md`      | Matriz de papéis e permissões.                         |
| `docs/requisitos.md`             | Requisitos do sistema.                                 |
| `docs/seguranca-autenticacao.md` | Mecanismos e decisões de segurança da autenticação.    |
| `docs/seguranca-integracoes.md`  | Segurança das integrações externas e Webhooks.         |

## Desenvolvimento e versionamento

O desenvolvimento é realizado de forma incremental, utilizando branches para separar funcionalidades, correções e melhorias.

Convenção de commits:

```text
feat: nova funcionalidade
fix: correção de comportamento
docs: atualização da documentação
refactor: reorganização de código
test: inclusão ou alteração de testes
```

## Evolução do projeto

A evolução do AutoStock-Intelligence contempla:

1. Consolidação da autenticação e autorização.
2. Desenvolvimento e integração das funcionalidades de estoque.
3. Evolução da interface e comunicação com a API.
4. Preparação e análise dos dados para Machine Learning.
5. Treinamento e avaliação dos modelos.
6. Integração das inferências com a aplicação.
7. Validação funcional, técnica e acadêmica.

---

**AutoStock-Intelligence**

Sistema inteligente de controle, monitoramento e análise de estoque.
