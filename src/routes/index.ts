import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const IndexResponse = Type.Object({
  hello: Type.String(),
})

type Index = Static<typeof IndexResponse>

const routes: FastifyPluginAsync = async (server) => {
  server.get<{ Body: Index }>('/', {
    schema: {
      response: {
        200: IndexResponse
      },
    },
  }, async function () {
    return { po: 'world' };
  });
}

export default routes;
