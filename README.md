# AutoStock-Intelligence

Sistema inteligente de controle e monitoramento de estoque, desenvolvido para automatizar atividades operacionais, acompanhar indicadores e utilizar técnicas de Machine Learning para apoiar a tomada de decisões.

## Objetivo do projeto

O AutoStock-Intelligence tem como objetivo evoluir um sistema tradicional de controle de estoque para uma solução capaz de acompanhar movimentações, identificar padrões, gerar indicadores e apoiar a previsão de necessidades de reposição.

A proposta é reduzir a necessidade de verificações manuais frequentes, permitindo que o acompanhamento do estoque seja realizado por meio de informações consolidadas e indicadores.

## Estado atual do projeto

O projeto está sendo desenvolvido de forma incremental, com separação entre os módulos e responsabilidades.

| Módulo                     | Situação                                        |
| -------------------------- | ----------------------------------------------- |
| Backend — API              | Em desenvolvimento                              |
| Autenticação e autorização | Implementação iniciada                          |
| Banco de dados SQLite      | Estrutura inicial implementada                  |
| Webhooks                   | Recebimento e registro de eventos implementados |
| Frontend                   | Estrutura inicial implementada                  |
| Machine Learning           | Diretório e organização inicial preparados      |
| Integração entre módulos   | Em desenvolvimento                              |

## Tecnologias utilizadas

| Área             | Tecnologias                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| Backend          | Python, FastAPI                                                        |
| Frontend         | React, TypeScript, Vite                                                |
| Interface        | Tailwind CSS, shadcn/ui                                                |
| Banco de dados   | SQLite                                                                 |
| Autenticação     | JWT, PyJWT, Argon2                                                     |
| Machine Learning | Python e bibliotecas específicas a serem definidas conforme os modelos |
| Testes           | Pytest                                                                 |
| Versionamento    | Git e GitHub                                                           |

## Estrutura do projeto

A organização do repositório separa a aplicação principal, os recursos de Machine Learning, a documentação e os testes.

```text
AutoStock-Intelligence/
│
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── webhooks/
│   │   └── main.py
│   │
│   ├── data/
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── ml/
│   ├── data/
│   ├── preprocessing/
│   ├── training/
│   └── inference/
│
├── docs/
│   ├── matriz-permissoes.md
│   └── seguranca-autenticacao.md
│
├── .gitignore
└── README.md
```

_Observação: a estrutura representa a organização dos módulos do projeto. Novos arquivos e diretórios serão adicionados à documentação conforme forem implementados._

## Machine Learning

O diretório `ml/` faz parte da arquitetura do AutoStock-Intelligence e será utilizado para desenvolver os recursos de inteligência do sistema.

A proposta é manter os processos de tratamento de dados, treinamento e utilização dos modelos separados da API e da interface.

### Organização do módulo

| Diretório           | Responsabilidade                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ml/data/`          | Organização e armazenamento dos conjuntos de dados utilizados no desenvolvimento e treinamento dos modelos. |
| `ml/preprocessing/` | Tratamento, limpeza, transformação e preparação dos dados para utilização pelos modelos.                    |
| `ml/training/`      | Desenvolvimento, treinamento e avaliação dos modelos de Machine Learning.                                   |
| `ml/inference/`     | Execução dos modelos treinados para gerar previsões e resultados utilizados pelo sistema.                   |

### Aplicações previstas

O módulo de Machine Learning poderá apoiar funcionalidades como:

- Análise do histórico de movimentações do estoque.
- Identificação de padrões de consumo.
- Previsão de demanda de produtos.
- Identificação de possíveis necessidades de reposição.
- Geração de informações para apoiar decisões de gerenciamento.

Essas funcionalidades serão desenvolvidas e validadas progressivamente. A presença dos diretórios não significa que os modelos já estejam implementados ou integrados à aplicação.

## Backend

O backend é responsável pelas regras de negócio, processamento das requisições, autenticação, autorização e comunicação com o banco de dados.

### Inicialização do ambiente

No terminal, acesse o diretório do backend:

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

O arquivo `.env.example` serve como referência para as configurações necessárias. As variáveis devem ser disponibilizadas no ambiente de execução.

Gere uma chave JWT:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Configure a chave na sessão atual do PowerShell:

```powershell
$env:AUTOSTOCK_JWT_SECRET="SUA_CHAVE_GERADA"
```

Configure também um segredo independente para os Webhooks:

```powershell
$env:AUTOSTOCK_WEBHOOK_TOKEN="OUTRO_SEGREDO_GERADO"
```

As duas chaves devem ser diferentes. Não compartilhe ou versione valores reais de segredos.

Para configurar um caminho personalizado para o banco de dados:

```powershell
$env:AUTOSTOCK_DB_PATH="data"
```

Caso não seja informado, a aplicação utiliza o caminho padrão configurado para o banco SQLite.

### Inicialização do banco de dados

```powershell
python -m app.db.init_db
```

### Criação do primeiro administrador

```powershell
python -m app.auth.bootstrap_admin
```

O procedimento cria o primeiro usuário administrador quando ainda não existem usuários cadastrados.

### Execução da API

```powershell
uvicorn app.main:app --reload
```

Documentação interativa da API:

```text
http://127.0.0.1:8000/docs
```

## Autenticação e autorização

O sistema utiliza autenticação baseada em JWT, com validação de usuários e controle de permissões.

### Endpoints de autenticação

| Método | Endpoint                       | Acesso      |
| ------ | ------------------------------ | ----------- |
| POST   | `/auth/login`                  | Público     |
| GET    | `/auth/me`                     | Autenticado |
| GET    | `/auth/users`                  | ADMIN       |
| POST   | `/auth/users`                  | ADMIN       |
| PATCH  | `/auth/users/{user_id}/role`   | ADMIN       |
| PATCH  | `/auth/users/{user_id}/status` | ADMIN       |
| GET    | `/health`                      | Público     |

### Segurança

- Tokens JWT assinados com HS256.
- Validade do token de acesso de 30 minutos.
- Senhas armazenadas com hash Argon2.
- Verificação do estado ativo do usuário.
- Controle de acesso por papel e permissões.
- Segredo JWT configurado por variável de ambiente.
- Segredo dos Webhooks independente da autenticação de usuários.

## Webhooks

O módulo de Webhooks permite receber eventos externos relacionados às movimentações do sistema.

O endpoint de recebimento é:

```text
POST /webhooks/events
```

A autenticação é realizada por meio do cabeçalho:

```text
X-Webhook-Token
```

Os eventos recebidos são registrados no banco de dados e possuem controle de duplicidade utilizando a combinação de origem e identificador do evento.

Atualmente, o recebimento e o registro dos eventos estão implementados. O processamento posterior das movimentações deverá evoluir conforme o desenvolvimento das próximas etapas.

## Frontend

O frontend é responsável pela interface de interação com os usuários e pela apresentação das informações do estoque.

### Inicialização

Em um novo terminal, acesse a raiz do projeto e entre no frontend:

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

Executar o lint:

```powershell
npm run lint
```

Gerar a versão de produção:

```powershell
npm run build
```

## Banco de dados

O projeto utiliza SQLite para persistência dos dados.

A estrutura inicial contempla tabelas relacionadas a:

- Produtos.
- Movimentações de estoque.
- Usuários.
- Eventos recebidos por Webhooks.
- Registros auxiliares necessários ao funcionamento da aplicação.

A estrutura do banco poderá evoluir conforme os requisitos funcionais e a integração dos módulos forem implementados.

## Testes

Os testes automatizados do backend utilizam Pytest.

Para executar:

```powershell
python -m pytest -q
```

Os testes devem ser atualizados conforme novas funcionalidades forem desenvolvidas, incluindo autenticação, permissões, operações de estoque, integração e processamento de eventos.

## Documentação

A documentação técnica e acadêmica do projeto está organizada no diretório `docs/`.

| Arquivo                          | Descrição                                                            |
| -------------------------------- | -------------------------------------------------------------------- |
| `docs/matriz-permissoes.md`      | Matriz de papéis e permissões do sistema.                            |
| `docs/seguranca-autenticacao.md` | Documentação das decisões e mecanismos de segurança da autenticação. |

Novos documentos deverão ser adicionados conforme a evolução da arquitetura, dos requisitos e dos módulos de Machine Learning.

## Desenvolvimento e versionamento

O desenvolvimento é realizado de forma incremental, utilizando branches para separar funcionalidades e correções.

Convenção sugerida para commits:

```text
feat: nova funcionalidade
fix: correção de comportamento
docs: atualização da documentação
refactor: reorganização de código
test: inclusão ou alteração de testes
```

## Evolução do projeto

O AutoStock-Intelligence continuará evoluindo com a implementação e integração dos seguintes componentes:

1. Consolidação dos recursos de autenticação e autorização.
2. Desenvolvimento das funcionalidades de gerenciamento de estoque.
3. Evolução da interface e integração com o backend.
4. Desenvolvimento dos processos de preparação e análise de dados.
5. Treinamento e avaliação dos modelos de Machine Learning.
6. Integração das inferências dos modelos com a aplicação.
7. Validação do sistema e documentação dos resultados.

---

**AutoStock-Intelligence**
Sistema inteligente de controle, monitoramento e análise de estoque.
