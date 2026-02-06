import { FastifyInstance } from "fastify";
import { clinicRegisterSchema } from "./clinic.schemas";

export function registerClinicRoutes(server: FastifyInstance) {
  server.post("/user/signup/clinic", async (request, reply) => {
    const parsed = clinicRegisterSchema.parse(request.body);
  });
}
