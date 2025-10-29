
import {
  InvestmentGoalQuery,
  InvestmentGoalParams,
  InvestmentGoalCreate,
  validateValueDivision
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

  fastify.get('/investment-goals/:id', {
    schema: {
      description: 'Buscar meta de investimento por ID',
      tags: ['investment-goals'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            months: { type: 'array', items: { type: 'string' } },
            value: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const params = InvestmentGoalParams.parse(request.params);

      const query = 'SELECT * FROM investment_goals WHERE id = $1';
      const { rows } = await fastify.pg.query(query, [params.id]);

      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Meta de investimento não encontrada' });
      }

      return rows[0];
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({
          error: 'ID inválido',
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

  fastify.post('/investment-goals', {
    schema: {
      description: 'Criar nova meta de investimento',
      tags: ['investment-goals'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          months: { type: 'array', items: { type: 'string' } },
          value: { type: 'number' }
        },
        required: ['name', 'months', 'value']
      },
      response: {
        201: {
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
  }, async (request, reply) => {
    try {
      const validatedData = InvestmentGoalCreate.parse(request.body);

      const divisionValidation = validateValueDivision(validatedData.value, validatedData.months);
      if (!divisionValidation.isValid) {
        return reply.code(400).send({ error: divisionValidation.error });
      }

      const query = `
        INSERT INTO investment_goals (name, months, value)
        VALUES ($1, $2, $3)
        RETURNING id, name, months, value, created_at, updated_at
      `;

      const values = [validatedData.name, validatedData.months, validatedData.value];
      const { rows } = await fastify.pg.query(query, values);

      return reply.code(201).send(rows[0]);
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({
          error: 'Dados inválidos',
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
