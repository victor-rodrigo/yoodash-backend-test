import Fastify from 'fastify';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

await fastify.register(import('@fastify/swagger'), {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Investment Goals API',
      description: 'API para gerenciamento de metas de investimento',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'investment-goals', description: 'Metas de investimento' }
    ]
  }
});

await fastify.register(import('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  staticCSP: true,
  transformStaticCSP: (header) => header
});

await fastify.register(import('@fastify/postgres'), {
  connectionString: process.env.DATABASE_URL
});

await fastify.register(import('./routes/investment-goals.js'));

fastify.get('/health', async function (request, reply) {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

fastify.get('/', async function (request, reply) {
  return {
    message: 'Investment Goals API',
    docs: '/docs',
    health: '/health'
  };
});

const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`Server running at http://${host}:${port}`);
    console.log(`Documentation at http://${host}:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
