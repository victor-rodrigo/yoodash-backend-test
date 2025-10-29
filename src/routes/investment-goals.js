
export default async function investmentGoalsRoutes(fastify, options) {
  fastify.get('/investment-goals', {
    schema: {
      description: 'Listar todas as metas de investimento',
      tags: ['investment-goals'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              nome: { type: 'string' },
              meses: { type: 'array', items: { type: 'string' } },
              valor: { type: 'number' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { rows } = await fastify.pg.query('SELECT * FROM investment_goals ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });
}
