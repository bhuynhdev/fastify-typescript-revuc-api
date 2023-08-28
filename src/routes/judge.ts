import { Static as S } from '@sinclair/typebox';
import { type FastifyPluginAsync } from 'fastify';
import { prisma } from 'utils/db';
import { JudgeCreateDto, JudgeReplyDto } from 'utils/types';

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
}

export default routes;