import { Static as S } from '@sinclair/typebox';
import { type FastifyPluginAsync } from 'fastify';
import { prisma } from 'utils/db';
import { SponsorCreateDto, SponsorReplyDto } from 'utils/types';

const routes: FastifyPluginAsync = async (fastify) => {
  /**
   * Register new judge
   */
  fastify.post<{ Body: S<typeof SponsorCreateDto>, Reply: S<typeof SponsorReplyDto> }>('/', {
    schema: {
      description: "Register new sponsor",
      tags: ['Sponsor'],
      body: SponsorCreateDto,
      response: {
        201: SponsorReplyDto
      }
    },
  },
    async function (request, reply) {
      const newSponsor = await prisma.sponsor.create({
        data: { ...request.body, auth: { create: { email: request.body.email, role: "SPONSOR" } } },
        include: { auth: true }
      });
      return reply.code(201).send(newSponsor);
    },
  );
}

export default routes;