
import {
  InvestmentGoalQuery
} from '../schemas/investment-goals.js';

export default async function investmentGoalsRoutes(fastify, options) {
  fastify.get('/investment-goals', {
    schema: {
      description: 'Listar todas as metas de investimento com filtros opcionais',
      tags: ['investment-goals'],
      querystring: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          month: { type: 'string', enum: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'] }
        }
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              months: { type: 'array', items: { type: 'string' } },
              value: { type: 'number' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const queryParams = InvestmentGoalQuery.parse(request.query);

      let query = 'SELECT * FROM investment_goals WHERE 1=1';
      const values = [];
      let paramIndex = 1;

      if (queryParams.name) {
        query += ` AND name ILIKE $${paramIndex}`;
        values.push(`%${queryParams.name}%`);
        paramIndex++;
      }

      if (queryParams.month) {
        query += ` AND $${paramIndex} = ANY(months)`;
        values.push(queryParams.month);
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC';

      const { rows } = await fastify.pg.query(query, values);
      return rows;
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({
          error: 'Parâmetros de consulta inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      fastify.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  });
}
