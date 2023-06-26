import { Static, Type as t } from '@sinclair/typebox';
import { type FastifyPluginAsync } from 'fastify';
import { prisma } from 'utils/db';
import { HackerCreateDto, HackerResponseDto } from 'utils/types';

const ParamsWithId = t.Object({ id: t.String() });

const routes: FastifyPluginAsync = async (fastify) => {
  /**
   * Get list of hackers, with filtering options
   */
  const GetHackersReply = t.Array(HackerResponseDto);
  fastify.get<{ Reply: Static<typeof GetHackersReply> }>(
    '/',
    {
      schema: {
        description: 'Query and filter multiple hackers',
        tags: ['Hacker'],
        response: {
          200: GetHackersReply,
        },
      },
    },
    async function (request) {
      const filter = request.query;
      const hackers = await prisma.hacker.findMany({
        include: {
          auth: true,
          howHeard: { select: { reason: true } },
        },
      });
      // Note that we don't need to explicitly remove the password field here,
      // because the AJV model does not have a "password" field; therefore will not serialize it
      return hackers.map((hacker) => {
        return {
          ...hacker,
          howHeard: hacker.howHeard.map(({ reason }) => reason), // Flatten the howHeard field
        };
      });
    },
  );

  /**
   * Get single hacker by id
   */
  const GetHackerByIdReply = t.Union([HackerResponseDto, t.Null()]);
  fastify.get<{ Reply: Static<typeof GetHackerByIdReply>; Params: Static<typeof ParamsWithId> }>(
    '/:id',
    {
      schema: {
        description: 'Get a hacker from id',
        tags: ['Hacker'],
        params: ParamsWithId,
        response: {
          200: GetHackerByIdReply,
        },
      },
    },
    async function (request) {
      const hacker = await prisma.hacker.findFirst({
        where: { id: request.params.id },
        include: { auth: true, howHeard: true },
      });
      // Flatten the howHeard field
      let toReturn = null;
      if (hacker) {
        toReturn = { ...hacker, howHeard: hacker.howHeard.map(({ reason }) => reason) };
      }
      return toReturn;
    },
  );

  /**
   * Register new hacker
   */
  fastify.post<{ Body: Static<typeof HackerCreateDto>, Reply: Static<typeof HackerResponseDto> }>(
    '/',
    {
      schema: {
        consumes: ['multipart/form-data'],
        body: HackerCreateDto,
        response: {
          201: HackerResponseDto
        }
      },
    },
    async function (request, reply) {
      const newHacker = await prisma.hacker.create({
        data: {
          ...request.body,
          auth: { create: { email: request.body.email, role: 'HACKER' } },
          howHeard: { create: request.body.howHeard.map(reason => ({ reason })) }
        },
        include: { howHeard: true, auth: true }
      });
      // Flatten the howHeard field
      let toReturn = null;
      toReturn = { ...newHacker, howHeard: newHacker.howHeard.map(({ reason }) => reason) };
      return reply.code(201).send(toReturn);
    },
  );
};

export default routes;
