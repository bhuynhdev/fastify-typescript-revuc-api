import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const GetHackerReply = Type.Object({ hello: Type.String() })
const GetHackerParams = Type.String();

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Reply: Static<typeof GetHackerReply>, Params: Static<typeof GetHackerParams> }>('/:id', {
    schema: {
      description: "Get a hacker from id",
      tags: ["Hacker"],
      params: {
        id: Type.String()
      },
      response: {
        200: GetHackerReply
      },
    },
  }, async function () {
    return { hello: 'world' };
  });

}

export default routes;
