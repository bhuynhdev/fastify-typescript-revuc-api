import { FastifyPluginAsync } from 'fastify';
import hackerRoutes from "./hacker.js"
import authRecordRoutes from "./auth.js"
import judgeRoutes from "./judge.js"

const routes: FastifyPluginAsync = async (server) => {
  server.register(hackerRoutes, { prefix: "/hacker" })
  server.register(authRecordRoutes, { prefix: "/auth" })
  server.register(judgeRoutes, { prefix: "/judge" })
}

export default routes;
