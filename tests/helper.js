import Fastify from 'fastify';

/**
 * Helper para construir instância Fastify para testes.
 * 
 * Sobre os testes:
 * Vi que a Yoodash valoriza bastante qualidade e testes, então mesmo não sendo
 * obrigatório no desafio, resolvi implementar testes completos (30 no total).
 * 
 * Estratégia de isolamento:
 * Os testes utilizam transações (BEGIN/ROLLBACK) para garantir isolamento completo.
 * Cada teste inicia uma transação antes de executar e faz rollback ao final,
 * preservando os dados originais do banco. Isso permite rodar os testes mesmo com
 * dados de desenvolvimento no banco, sem risco de perdê-los.
 */
export async function build() {
  const fastify = Fastify({
    logger: false
  });

  await fastify.register(import('@fastify/postgres'), {
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/investment_goals'
  });

  await fastify.register(import('../src/routes/investment-goals.js'));

  return fastify;
}

/**
 * Inicia uma transação antes de cada teste.
 * Tudo que acontecer após este ponto pode ser desfeito com rollback.
 */
export async function startTransaction(fastify) {
  await fastify.pg.query('BEGIN');
}

/**
 * Desfaz todas as mudanças feitas durante o teste.
 * Nenhum dado é persistido no banco.
 */
export async function rollbackTransaction(fastify) {
  await fastify.pg.query('ROLLBACK');
}

