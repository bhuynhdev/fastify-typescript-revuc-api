import { Static as S, Type as t } from '@sinclair/typebox';
import { type FastifyPluginAsync } from 'fastify';
import { prisma } from 'utils/db';
import { getAgeOfHacker } from 'utils/misc';
import { HackerCreateDto, HackerResponseDto, HackerUpdateDto } from 'utils/types';

const ParamsWithId = t.Object({ id: t.String() });

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preValidation', (req, res, next) => {
    fastify.log.debug(req.body, 'parsed body');
    next();
  });

  /**
   * Get list of hackers, with filtering options
   */
  const GetHackersReply = t.Array(HackerResponseDto);
  fastify.get<{ Reply: S<typeof GetHackersReply> }>(
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
        include: { auth: true },
      });
      // Note that we don't need to explicitly remove the password field here,
      // because the AJV model does not have a "password" field; therefore will not serialize it
      return hackers;
    },
  );

  /**
   * Get single hacker by id
   */
  const GetHackerByIdReply = t.Union([HackerResponseDto, t.Null()]);
  fastify.get<{ Reply: S<typeof GetHackerByIdReply>; Params: S<typeof ParamsWithId> }>(
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
      const hackerOrNull = await prisma.hacker.findFirst({
        where: { id: request.params.id },
        include: { auth: true },
      });
      return hackerOrNull;
    },
  );

  /**
   * Update hacker info. Currently only allow update email, name, email verfied status, and check-in status
   */
  fastify.patch<{
    Params: S<typeof ParamsWithId>;
    Body: S<typeof HackerUpdateDto>;
    Reply: S<typeof HackerResponseDto>;
  }>(
    '/:id',
    {
      schema: {
        description: 'Update info of specific hacker id',
        tags: ['Hacker'],
        body: HackerUpdateDto,
        response: {
          200: HackerResponseDto,
        },
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
              emailVerified: request.body.emailVerified ?? undefined,
            },
          },
        },
        include: { auth: true },
      });
      // Flatten the howHeard field
      return reply.code(201).send(updatedHacker);
    },
  );

  /**
   * Register new hacker
   */
  fastify.post<{ Body: S<typeof HackerCreateDto>; Reply: S<typeof HackerResponseDto> }>(
    '/',
    {
      schema: {
        description: 'Register new hacker, through form-data submission',
        consumes: ['multipart/form-data'],
        tags: ['Hacker'],
        body: HackerCreateDto,
        response: {
          201: HackerResponseDto,
        },
      },
    },
    async function (request, reply) {
      const newHacker = await prisma.hacker.create({
        data: {
          ...request.body,
          isMinor: getAgeOfHacker(request.body.birthDate, fastify.config.HACKATHON_DATE) < 18,
          auth: { create: { email: request.body.email, role: 'HACKER' } },
        },
        include: { auth: true },
      });
      return reply.code(201).send(newHacker);
    },
  );
};

export default routes;
