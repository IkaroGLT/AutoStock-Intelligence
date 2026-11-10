# AutoStock Intelligence

Sistema acadêmico de gerenciamento inteligente de estoque, desenvolvido para apoiar o controle operacional, a rastreabilidade das movimentações e a futura previsão de demanda.

## Status do projeto

**Em desenvolvimento — AS-02: estrutura inicial.**

Nesta etapa, o projeto possui:

- Backend FastAPI com endpoint de saúde.
- Frontend React + TypeScript + Vite.
- Configuração inicial de Tailwind CSS.
- Banco SQLite com esquema inicial.
- Estrutura reservada para Machine Learning.
- Testes automatizados básicos.

**Atenção:** o frontend ainda não está integrado à API. Autenticação, gestão completa de produtos, automações e previsões serão implementadas em etapas posteriores.

## Tecnologias

| Camada             | Tecnologias                                               |
| ------------------ | --------------------------------------------------------- |
| Frontend           | React, TypeScript, Vite, Tailwind CSS                     |
| Backend            | Python, FastAPI, Pydantic                                 |
| Banco de dados     | SQLite                                                    |
| Machine Learning   | Python; bibliotecas e modelos a definir nas AS-07 e AS-08 |
| Testes backend     | pytest                                                    |
| Qualidade frontend | ESLint e TypeScript                                       |

## Estrutura do repositório

```text
AutoStock-Intelligence/
├── backend/
│   ├── app/
│   │   ├── db/
│   │   └── main.py
│   ├── data/
│   ├── tests/
│   └── requirements.txt
├── frontend/
├── ml/
│   ├── data/
│   ├── preprocessing/
│   ├── training/
│   └── inference/
├── docs/
├── .env.example
├── .gitignore
└── README.md
```

## Pré-requisitos

- Git
- Python compatível com as dependências do backend
- Node.js compatível com a versão instalada do Vite
- npm
- VS Code ou editor equivalente

Os comandos abaixo consideram Windows com PowerShell.

## 1. Configurar o backend

Na raiz do repositório:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Inicializar o SQLite

```powershell
.\.venv\Scripts\python.exe -m app.db.init_db
```

O banco local será criado em:

`backend/data/autostock.db`

Esse arquivo não deve ser enviado ao GitHub.

### Iniciar a API

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Endereços locais:

- Health: http://127.0.0.1:8000/health
- Documentação Swagger: http://127.0.0.1:8000/docs

### Executar os testes

Em outro terminal, dentro de `backend`:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

## 2. Configurar o frontend

Abra um terminal na raiz do repositório:

```powershell
cd frontend
npm install
npm run dev
```

Acesse o endereço informado pelo Vite, geralmente:

http://localhost:5173/

### Verificações do frontend

```powershell
npm run lint
npm run build
```

O comando de build gera a pasta `dist/`, que não deve ser versionada.

### Componentes de interface — shadcn/ui

O frontend utiliza shadcn/ui com Base UI e Tailwind CSS.

Os componentes adicionados ao projeto ficam em:

`frontend/src/components/ui/`

O primeiro componente configurado é o Button.

Para adicionar outros componentes:

```powershell
npx shadcn@latest add nome-do-componente
```

Os componentes serão personalizados na AS-04,
seguindo a identidade visual preto, dourado e branco.

## 3. Banco de dados

O esquema inicial foi adaptado do projeto Mock Estoque API.

Tabelas:

- `produtos`
- `estoque`
- `movimentacoes_estoque`
- `eventos_webhook`
- `sincronizacoes`

O banco de desenvolvimento é local e independente do repositório original.

A evolução do esquema deverá preservar a integridade do estoque e o histórico das operações.

## 4. Machine Learning

O diretório `ml/` está reservado para preparação de dados, treinamento, avaliação e inferência.

Nenhum modelo preditivo foi implementado na AS-02.

## 5. Configurações de ambiente

O arquivo `.env.example` documenta variáveis configuráveis.

Variável prevista:

`AUTOSTOCK_DB_PATH`

O backend possui um caminho padrão para o SQLite. O arquivo `.env.example` não é carregado automaticamente.

Não versionar senhas, tokens, arquivos `.env` privados ou bancos de dados locais.

## 6. Documentação

Os documentos técnicos estão em `docs/`:

- `arquitetura.md`
- `requisitos.md`
- `elicitacao-escopo.md`
- `matriz-permissoes.md`
- `contrato-rf13.md`

## 7. Organização do desenvolvimento

O trabalho é gerenciado por Issues, branches e Pull Requests.

Cada implementação deverá ser desenvolvida em sua própria branch, revisada e testada antes da integração à `main`.

## 8. Projetos de referência

- Mock Estoque API: https://github.com/IkaroGLT/Mock_Estoque_API
- Controle de Estoque: https://github.com/IkaroGLT/fabrica-software-controle-estoque

Os repositórios originais são referências e permanecem independentes.
