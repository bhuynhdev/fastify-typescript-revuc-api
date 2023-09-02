import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastify from 'fastify';
import config from './plugins/config.js';
import routes from './routes/index.js';

const server = fastify({
  ajv: {
    customOptions: {
      verbose: true,
      keywords: ['explode', 'encoding', 'collectionFormat'], // Support for Multipart body encoding: https://swagger.io/docs/specification/describing-request-body/multipart-requests/
    },
  },
  logger: {
    level: process.env.LOG_LEVEL,
  },
}).withTypeProvider<TypeBoxTypeProvider>();

await server.register(config);

/**
 * CORS
 */
await server.register(import('@fastify/cors'), { origin: true, credentials: true });

/**
 * MULTIPART
 */
await server.register(import('@fastify/multipart'), { attachFieldsToBody: 'keyValues' });

/**
 * SWAGGER
 */
await server.register(import('@fastify/swagger'), {
  openapi: {
    openapi: '3.1.0',
    info: {
      title: 'RevolutionUC API',
      description: 'OpenAPI documentation for RevUC API',
      version: '0.1.0',
    },
    servers: [{ url: 'http://localhost:5050' }],
  },
});
await server.register(import('@fastify/swagger-ui'), {
  routePrefix: '/doc',
  uiConfig: {
    deepLinking: false,
  },
  theme: {
    title: 'RevUC API',
  },
  staticCSP: true,
  transformSpecificationClone: true,
});

/**
 * ROUTES
 */
await server.register(routes);

await server.ready();
server.swagger();

export default server;
