# yoodash-backend-test

Projeto desenvolvido como parte do teste técnico para a vaga de desenvolvedor backend na Yoodash. A aplicação consiste em uma API RESTful para gerenciamento de metas de investimento, permitindo criar, listar, atualizar e excluir metas, com validação de dados, divisão automática de valores por mês e filtros de busca.

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
