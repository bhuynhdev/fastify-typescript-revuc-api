import dotenv from 'dotenv'
import fastifyPlugin from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import Ajv from 'ajv'

dotenv.config({ path: `.env.local` })

const ConfigSchema = Type.Strict(
	Type.Object({
		NODE_ENV: Type.Union([Type.Literal('production'), Type.Literal('development'), Type.Literal('test')]),
		LOG_LEVEL: Type.String(),
		API_HOST: Type.String(),
		API_PORT: Type.String(),
		DATABASE_URL: Type.String(),
		HACKATHON_DATE: Type.String(),
	}),
)

export type Config = Static<typeof ConfigSchema>

const ajv = new Ajv({
	allErrors: true,
	removeAdditional: true,
	useDefaults: true,
	coerceTypes: true,
	allowUnionTypes: true,
})


const configPlugin: FastifyPluginAsync = async (server) => {
	const validate = ajv.compile(ConfigSchema)
	const valid = validate(process.env)
	if (!valid) {
		throw new Error(`.env.local file validation failed - ${JSON.stringify(validate.errors, null, 2)}`)
	}
	server.decorate('config', process.env)
}

declare module 'fastify' {
	interface FastifyInstance {
		config: Config
	}
}

export default fastifyPlugin(configPlugin)
