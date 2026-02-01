import { FastifyInstance } from "fastify";

export function registerAuthRoutes(server: FastifyInstance) {
  server.post("/user/signup/patient", async (request, reply) => {});

  server.post("/user/signup/clinic", async (request, reply) => {});

  server.post("/user/signup/doctor", async (request, reply) => {});

  server.post("/user/signup/staff", async (request, reply) => {});
}
