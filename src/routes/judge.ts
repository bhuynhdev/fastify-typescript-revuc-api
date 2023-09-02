import { Static as S, Type as t } from '@sinclair/typebox';
import { type FastifyPluginAsync } from 'fastify';
import { prisma } from 'utils/db';
import { JudgeCreateDto, JudgeReplyDto, JudgeUpdateDto } from 'utils/types';

const ParamsWithId = t.Object({ id: t.String() });

const routes: FastifyPluginAsync = async (fastify) => {
  /**
   * Register new judge
   */
  fastify.post<{ Body: S<typeof JudgeCreateDto>, Reply: S<typeof JudgeReplyDto> }>('/', {
    schema: {
      description: "Register new judge",
      tags: ['Judge'],
      body: JudgeCreateDto,
      response: {
        201: JudgeReplyDto
      }
    },
  },
    async function (request, reply) {
      const newJudge = await prisma.judge.create({
        data: { ...request.body, auth: { create: { email: request.body.email, role: "JUDGE" } } },
        include: { auth: true }
      });
      return reply.code(201).send(newJudge);
    },
  );

  /**
   * Update judge info. Currently only allow update name and category
   */
  fastify.patch<{ Params: S<typeof ParamsWithId>, Body: S<typeof JudgeCreateDto>, Reply: S<typeof JudgeReplyDto> }>('/:id', {
    schema: {
      description: "Register new judge",
      tags: ['Judge'],
      params: ParamsWithId,
      body: JudgeUpdateDto,
      response: {
        200: JudgeReplyDto
      }
    },
  },
    async function (request, reply) {
      const updatedJudge = await prisma.judge.update({
        where: { id: request.params.id },
        data: { ...request.body },
        include: { auth: true }
      });
      return reply.code(201).send(updatedJudge);
    },
  );
}

export default routes;