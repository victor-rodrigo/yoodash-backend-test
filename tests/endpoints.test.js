import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { build, startTransaction, rollbackTransaction } from './helper.js';

describe('Investment Goals API Endpoints', () => {
  let app;

  beforeAll(async () => {
    app = await build();
  });

  beforeEach(async () => {
    await startTransaction(app);
  });

  afterEach(async () => {
    await rollbackTransaction(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /investment-goals', () => {
    it('deve criar uma nova meta com dados válidos', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/investment-goals',
        payload: {
          name: 'Viagem para o Japão',
          months: ['january', 'february', 'march'],
          value: 3000
        }
      });

      expect(response.statusCode).toBe(201);
      const json = response.json();
      expect(json).toHaveProperty('id');
      expect(json.name).toBe('Viagem para o Japão');
      expect(json.months).toEqual(['january', 'february', 'march']);
      expect(json.value).toBe(3000);
      expect(json).toHaveProperty('created_at');
      expect(json).toHaveProperty('updated_at');
    });

    it('deve rejeitar meta sem nome', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/investment-goals',
        payload: {
          months: ['january'],
          value: 1000
        }
      });

      expect(response.statusCode).toBe(400);
      const json = response.json();
      expect(json.error).toBeDefined();
    });

    it('deve rejeitar meta sem meses', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/investment-goals',
        payload: {
          name: 'Teste',
          value: 1000
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('deve rejeitar meta sem valor', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/investment-goals',
        payload: {
          name: 'Teste',
          months: ['january']
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('deve rejeitar divisão não exata de valor', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/investment-goals',
        payload: {
          name: 'Teste',
          months: ['january', 'february', 'march'],
          value: 1000
        }
      });

      expect(response.statusCode).toBe(400);
      const json = response.json();
      expect(json.error).toContain('não pode ser dividido igualmente');
    });

    it('deve rejeitar mês inválido', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/investment-goals',
        payload: {
          name: 'Teste',
          months: ['janeiro'],
          value: 1000
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /investment-goals', () => {
    beforeEach(async () => {
      await app.inject({
        method: 'POST',
        url: '/investment-goals',
        payload: {
          name: 'Meta de Teste A',
          months: ['january', 'february'],
          value: 4000
        }
      });

      await app.inject({
        method: 'POST',
        url: '/investment-goals',
        payload: {
          name: 'Meta de Teste B',
          months: ['december'],
          value: 2500
        }
      });
    });

    it('deve listar todas as metas', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/investment-goals'
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.length).toBeGreaterThanOrEqual(2);
      
      const testGoals = json.filter(g => 
        g.name === 'Meta de Teste A' || g.name === 'Meta de Teste B'
      );
      expect(testGoals).toHaveLength(2);
    });

    it('deve filtrar por nome', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/investment-goals?name=notebook'
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.length).toBeGreaterThanOrEqual(1);
      
      json.forEach(goal => {
        expect(goal.name.toLowerCase()).toContain('notebook');
      });
    });

    it('deve filtrar por mês', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/investment-goals?month=january'
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.length).toBeGreaterThanOrEqual(1);
      
      json.forEach(goal => {
        expect(goal.months).toContain('january');
      });
    });

    it('deve retornar array vazio quando não encontrar resultados', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/investment-goals?name=inexistente'
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json).toHaveLength(0);
    });
  });

  describe('GET /investment-goals/:id', () => {
    let createdId;

    beforeEach(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/investment-goals',
        payload: {
          name: 'Meta Teste',
          months: ['january'],
          value: 1000
        }
      });
      createdId = response.json().id;
    });

    it('deve buscar meta por ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/investment-goals/${createdId}`
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.id).toBe(createdId);
      expect(json.name).toBe('Meta Teste');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/investment-goals/99999'
      });

      expect(response.statusCode).toBe(404);
      const json = response.json();
      expect(json.error).toBe('Meta de investimento não encontrada');
    });

    it('deve retornar 400 para ID inválido', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/investment-goals/abc'
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /investment-goals/:id', () => {
    let createdId;

    beforeEach(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/investment-goals',
        payload: {
          name: 'Meta Original',
          months: ['january', 'february'],
          value: 2000
        }
      });
      createdId = response.json().id;
    });

    it('deve atualizar apenas o nome', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/investment-goals/${createdId}`,
        payload: {
          name: 'Meta Atualizada'
        }
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.name).toBe('Meta Atualizada');
      expect(json.months).toEqual(['january', 'february']);
      expect(json.value).toBe(2000);
    });

    it('deve atualizar valor e meses juntos', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/investment-goals/${createdId}`,
        payload: {
          value: 3000,
          months: ['january', 'february', 'march']
        }
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.value).toBe(3000);
      expect(json.months).toEqual(['january', 'february', 'march']);
    });

    it('deve rejeitar atualização com divisão inválida', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/investment-goals/${createdId}`,
        payload: {
          value: 1000,
          months: ['january', 'february', 'march']
        }
      });

      expect(response.statusCode).toBe(400);
      const json = response.json();
      expect(json.error).toContain('não pode ser dividido igualmente');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/investment-goals/99999',
        payload: {
          name: 'Teste'
        }
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /investment-goals/:id', () => {
    let createdId;

    beforeEach(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/investment-goals',
        payload: {
          name: 'Meta para Deletar',
          months: ['january'],
          value: 1000
        }
      });
      createdId = response.json().id;
    });

    it('deve deletar meta existente', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/investment-goals/${createdId}`
      });

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');

      const getResponse = await app.inject({
        method: 'GET',
        url: `/investment-goals/${createdId}`
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/investment-goals/99999'
      });

      expect(response.statusCode).toBe(404);
    });
  });
});

