import { FastifyInstance } from "fastify";
import { patientRegistarionSchema } from "./user.schemas";
import { generateId } from "../../shared/id/uuid";
import { patientService } from "../../applications/users/user.service";
import { authService } from "../../applications/auth/auth.service";

export function registerUserRoutes(server: FastifyInstance) {
  server.post("/user/signup/patient", async (request, reply) => {
    const parsed = patientRegistarionSchema.parse(request.body);
    const userId = generateId();
    await patientService.registerNewPatient({
      id: userId,
      ...parsed,
    });
    const result = await authService.patientLogin(
      parsed.phoneNumber as string,
    );

    reply.status(201).send(result);
  });

  server.post("/user/signup/clinic", async (request, reply) => {});

  server.post("/user/signup/doctor", async (request, reply) => {});

  server.post("/user/signup/staff", async (request, reply) => {});
}
