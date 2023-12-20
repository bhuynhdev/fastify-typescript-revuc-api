import { FastifyPluginAsync } from 'fastify'
import hackerRoutes from './hacker'
import identityRoutes from './identity'
import judgeRoutes from './judge'
import sponsorRoutes from './sponsor'

const routes: FastifyPluginAsync = async (server) => {
	server.register(hackerRoutes, { prefix: '/hacker' })
	server.register(identityRoutes, { prefix: '/identity' })
	server.register(judgeRoutes, { prefix: '/judge' })
	server.register(sponsorRoutes, { prefix: '/sponsor' })
}

export default routes
