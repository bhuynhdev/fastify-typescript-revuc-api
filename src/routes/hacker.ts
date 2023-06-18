import { Static, Type as t } from '@sinclair/typebox';
import { type FastifyPluginAsync } from 'fastify';
import { prisma } from 'utils/db';
import { HackerTypeboxObject } from 'utils/types';

const ParamsWithId = t.Object({ id: t.String() })

const routes: FastifyPluginAsync = async (fastify) => {
  /**
   * Get list of hackers, with filtering options
   */
  const GetHackersReply = t.Array(HackerTypeboxObject)
  fastify.get<{ Reply: Static<typeof GetHackersReply> }>("/", {
    schema: {
      description: "Query and filter multiple hackers",
      tags: ["Hacker"],
      response: {
        200: GetHackersReply
      }
    }
  }, async function (request) {
    const filter = request.query;
    const hackers = await prisma.hacker.findMany({
      include: {
        auth: true,
        howHeard: { select: { reason: true } }
      }
    });
    // Note that we don't need to explicitly remove the password field here,
    // because the AJV model does not have a "password" field; therefore will not serialize it
    return hackers
  })

  /**
   * Get single hacker by id
   */
  const GetHackerByIdReply = t.Union([HackerTypeboxObject, t.Null()]);
  fastify.get<{ Reply: Static<typeof GetHackerByIdReply>, Params: Static<typeof ParamsWithId> }>
    ('/:id', {
      schema: {
        description: "Get a hacker from id",
        tags: ["Hacker"],
        params: ParamsWithId,
        response: {
          200: GetHackerByIdReply
        },
      },
    }, async function (request) {
      const hacker = await prisma.hacker.findFirst({ where: { id: request.params.id }, include: { auth: true, howHeard: true } });
      return hacker;
    });
}

export default routes;
