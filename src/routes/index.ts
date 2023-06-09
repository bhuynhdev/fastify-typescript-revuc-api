import { FastifyPluginAsync } from 'fastify';
import hackerRoutes from "./hacker.js"

const routes: FastifyPluginAsync = async (server) => {
  server.register(hackerRoutes, { prefix: "/hacker" })
}

export default routes;
