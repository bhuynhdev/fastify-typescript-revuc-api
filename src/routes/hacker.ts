import { Static as S, Type as t } from '@sinclair/typebox'
import { eq } from 'drizzle-orm'
import { db } from 'drizzle/db'
import { hacker, identity } from 'drizzle/schema'
import { type FastifyPluginAsync } from 'fastify'
import { HackerCreateDto, HackerResponseDto, HttpError } from 'utils/types'

const ParamsWithId = t.Object({ id: t.String() })

const routes: FastifyPluginAsync = async (fastify) => {
	fastify.addHook('preValidation', (req, res, next) => {
		fastify.log.debug(req.body, 'parsed body')
		next()
	})

	/**
	 * Get list of hackers, with filtering options
	 */
	const GetHackersReply = t.Array(HackerResponseDto)
	fastify.get<{ Reply: { 200: S<typeof GetHackersReply> } }>(
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
		async function (request, reply) {
			// const filter = request.query
			const hackers = await db.query.hacker.findMany({ with: { identity: true } })
			// Note that we don't need to explicitly remove the `password` field here,
			// because the AJV model does not have a "password" field; therefore will not serialize it
			return reply.status(200).send(hackers)
		},
	)

	/**
	 * Get single hacker by id
	 */
	const GetHackerByIdReply = t.Union([HackerResponseDto, t.Null()])
	fastify.get<{ Reply: { 200: S<typeof GetHackerByIdReply> }; Params: S<typeof ParamsWithId> }>(
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
		async function (request, reply) {
			const hackerOrUndefined = await db.query.hacker.findFirst({
				where: eq(hacker.id, request.params.id),
				with: { identity: true },
			})
			return reply.status(200).send(hackerOrUndefined || null)
		},
	)

	/**
	 * Register new hacker
	 */
	fastify.post<{
		Body: S<typeof HackerCreateDto>
		Reply: { 201: S<typeof HackerResponseDto>; 409: { message: string } }
	}>(
		'/',
		{
			schema: {
				description: 'Register new hacker, through form-data submission',
				consumes: ['multipart/form-data'],
				tags: ['Hacker'],
				body: HackerCreateDto,
				response: {
					201: HackerResponseDto,
					409: HttpError.Conflict('Email already exists'),
				},
			},
		},
		async function (request, reply) {
			const newHacker = await db.transaction(async (tx) => {
				// Create or Find new Identity
				const [identityRecord] = await tx
					.insert(identity)
					.values({ email: request.body.email, role: 'HACKER' })
					.onConflictDoNothing({ target: identity.email })
					.returning()

				if (identityRecord) {
					const [newHacker] = await tx
						.insert(hacker)
						.values({ ...request.body, identityId: identityRecord.id })
						.returning()

					return { ...newHacker, identity: identityRecord }
				}
				// Else, no hacker or identity created, meaning email already exists
				return null
			})
			if (!newHacker) {
				return reply.status(409).send({ message: 'Email already exists' })
			}
			return reply.status(201).send(newHacker)
		},
	)
}

export default routes
