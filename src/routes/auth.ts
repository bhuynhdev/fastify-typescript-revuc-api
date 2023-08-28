import { Static as S, Type as t } from '@sinclair/typebox';
import { type FastifyPluginAsync } from 'fastify';
import { prisma } from 'utils/db';
import { AuthRecordReplyDto } from 'utils/types';

const checkInDto = t.Object({
  email: t.String({ format: 'email', examples: ['test@email.com'] }),
})

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: S<typeof checkInDto> }>("/checkin", {
    schema: {
      description: "Check-in someone through email",
      tags: ["Auth"],
      body: checkInDto,
      response: {
        200: AuthRecordReplyDto
      }
    }
  }, async function (request, reply) {
    const person = await prisma.authRecord.update({
      where: { email: request.body.email }, data: {
        checkedIn: true
      }
    })
    return reply.status(200).send(person)
  })
}

export default routes;