# yoodash-backend-test

Projeto desenvolvido como parte do teste técnico para a vaga de desenvolvedor backend na Yoodash. A aplicação consiste em uma API RESTful para gerenciamento de metas de investimento, permitindo criar, listar, atualizar e excluir metas, com validação de dados, divisão automática de valores por mês e filtros de busca.

## Tecnologias utilizadas

- **Node.js** - Ambiente de execução
- **Fastify** - Framework web de alta performance
- **PostgreSQL** - Banco de dados relacional
- **Docker** - Containerização do banco de dados
- **Zod** - Validação de schemas e tipagem
- **Swagger/OpenAPI** - Documentação automática da API

## Estrutura do projeto

```
yoodash-backend-test/
├── database/           # Scripts SQL
│   └── init.sql       # Criação de tabelas e índices
├── src/
│   ├── routes/        # Rotas da API
│   │   └── investment-goals.js
│   ├── schemas/       # Schemas Zod para validação
│   │   └── investment-goals.js
│   └── server.js      # Configuração do servidor Fastify
├── docker-compose.yml # Configuração do PostgreSQL
├── package.json
└── README.md
```

## Endpoints da API

| Método | Endpoint                | Descrição                                     |
| ------ | ----------------------- | --------------------------------------------- |
| GET    | `/investment-goals`     | Listar todas as metas (com filtros opcionais) |
| GET    | `/investment-goals/:id` | Buscar meta específica por ID                 |
| POST   | `/investment-goals`     | Criar nova meta de investimento               |
| PUT    | `/investment-goals/:id` | Atualizar meta existente                      |
| DELETE | `/investment-goals/:id` | Deletar meta de investimento                  |

### Filtros disponíveis (GET)

- `name` - Filtrar por nome (busca parcial, case-insensitive)
- `month` - Filtrar por mês específico

### Estrutura de dados

```json
{
  "id": 1,
  "name": "Viagem para o Japão",
  "months": ["january", "february", "march"],
  "value": 3000,
  "created_at": "2025-10-29T22:21:37.270Z",
  "updated_at": "2025-10-29T22:35:47.701Z"
}
```

### Validações

- Nome é obrigatório (1-255 caracteres)
- Meses devem ser válidos em inglês (january-december)
- Valor deve ser positivo
- **Regra de negócio:** O valor deve ser divisível igualmente pelos meses (máximo 2 casas decimais)

## Como executar o projeto

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose

### Instalação

1. Instalar dependências:

```bash
npm install
```

2. Iniciar banco de dados:

```bash
docker-compose up -d
```

3. Criar arquivo `.env` baseado no `env.example`:

```bash
cp env.example .env
```

4. Executar aplicação:

```bash
npm run dev
```

### Acessos

- API: http://localhost:3000
- Documentação: http://localhost:3000/docs
- Health check: http://localhost:3000/health

### Comandos úteis

- `docker-compose down` - parar containers
- `docker-compose logs postgres` - ver logs do banco
