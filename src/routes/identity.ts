import { Static as S, Type as t } from '@sinclair/typebox'
import { type FastifyPluginAsync } from 'fastify'
// import { prisma } from 'utils/db'
import { db } from 'drizzle/db'
import { HttpError, IdentityRecordResponseDto } from 'utils/types'
import { identity } from 'drizzle/schema'
import { eq } from 'drizzle-orm'

const checkInDto = t.Object({
	email: t.String({ format: 'email' }),
})

const routes: FastifyPluginAsync = async (fastify) => {
	fastify.post<{
		Body: S<typeof checkInDto>
		Reply: { 200: S<typeof IdentityRecordResponseDto>; 404: { message: string } }
	}>(
		'/checkin',
		{
			schema: {
				description: 'Check-in someone through email',
				tags: ['Identity'],
				body: checkInDto,
				response: {
					200: IdentityRecordResponseDto,
					404: HttpError.NotFound('Email not found'),
				},
			},
		},
		async function (request, reply) {
			const [person] = await db
				.update(identity)
				.set({ checkedIn: true })
				.where(eq(identity.email, request.body.email))
				.returning()

			if (!person) {
				return reply.status(404).send({ message: 'Email not found' })
			}
			return reply.status(200).send(person)
		},
	)
}

export default routes
