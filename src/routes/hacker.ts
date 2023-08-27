import { Static as S, Type as t } from '@sinclair/typebox';
import { type FastifyPluginAsync } from 'fastify';
import { prisma } from 'utils/db';
import { getAgeOfHacker } from 'utils/misc';
import { HackerCreateDto, HackerResponseDto, HackerUpdateDto } from 'utils/types';

const ParamsWithId = t.Object({ id: t.String() });

const routes: FastifyPluginAsync = async (fastify) => {

  fastify.addHook("preValidation", (req, res, next) => {
    fastify.log.debug(req.body, "parsed body")
    next();
  })

  /**
   * Get list of hackers, with filtering options
   */
  const GetHackersReply = t.Array(HackerResponseDto);
  fastify.get<{ Reply: S<typeof GetHackersReply> }>(
    '/', {
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
  fastify.get<{ Reply: S<typeof GetHackerByIdReply>; Params: S<typeof ParamsWithId> }>(
    '/:id', {
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
   * Update hacker info. Currently only allow update email, name, email verfied status, and check-in status
   */
  fastify.patch<{ Params: S<typeof ParamsWithId>, Body: S<typeof HackerUpdateDto>, Reply: S<typeof HackerResponseDto> }>(
    '/:id', {
    schema: {
      description: 'Update info of specific hacker id',
      tags: ['Hacker'],
      body: HackerUpdateDto,
      response: {
        200: HackerResponseDto
      }
    },
  },
    async function (request, reply) {
      // undefined means "do nothing" in prisma
      const updatedHacker = await prisma.hacker.update({
        where: {
          id: request.params.id,
        },
        data: {
          firstName: request.body.firstName || undefined, // Use || instead of ?? to account for empty strings
          lastName: request.body.firstName || undefined,
          auth: {
            update: {
              email: request.body.email ?? undefined,
              checkedIn: request.body.checkedIn ?? undefined,
              emailVerified: request.body.emailVerified ?? undefined
            }
          },
        },
        include: { howHeard: true, auth: true }
      });
      // Flatten the howHeard field
      let toReturn = null;
      toReturn = { ...updatedHacker, howHeard: updatedHacker.howHeard.map(({ reason }) => reason) };
      return reply.code(201).send(toReturn);
    },
  );

  /**
   * Register new hacker
   */
  fastify.post<{ Body: S<typeof HackerCreateDto>, Reply: S<typeof HackerResponseDto> }>('/', {
    schema: {
      description: "Register new hacker, through form-data submission",
      consumes: ['multipart/form-data'],
      tags: ['Hacker'],
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
          isMinor: getAgeOfHacker(request.body.birthDate, fastify.config.HACKATHON_DATE) < 18,
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
