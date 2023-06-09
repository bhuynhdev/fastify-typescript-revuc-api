import fastify from 'fastify';
import config from './plugins/config.js';
import routes from './routes/index.js';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

const server = fastify({
  ajv: {
    customOptions: {
      removeAdditional: "all",
      coerceTypes: true,
      useDefaults: true,
    }
  },
  logger: {
    level: process.env.LOG_LEVEL,
  },
}).withTypeProvider<TypeBoxTypeProvider>();

await server.register(config);
await server.register(import('@fastify/swagger'), {
  swagger: {
    info: {
      title: 'Test swagger',
      description: 'testing the fastify swagger api',
      version: '0.1.0'
    },
    host: 'localhost:5050',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  },
});
await server.register(import('@fastify/swagger-ui'), {
  routePrefix: '/doc',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  staticCSP: true,
  transformSpecificationClone: true
})
await server.register(routes)


await server.ready();
server.swagger();

export default server;
