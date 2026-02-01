import { FastifyInstance } from "fastify";

export function registerAuthRoutes(server: FastifyInstance) {
  server.post("/user/login", async (request, reply) => {
    
  });
}
