import { FastifyInstance } from "fastify";
import { UserWhere } from "../../repositories/users/user.types";
import { patientLoginSchema, patientOtpVerifySchema } from "./auth.schemas";
import { authService } from "../../applications/auth/auth.service";

export function registerAuthRoutes(server: FastifyInstance) {
  server.post("/auth/patient/request-otp", async (request, reply) => {
    const parsed = patientLoginSchema.parse(request.body);
    const result = authService.patientLogin(parsed.phoneNumber);
    reply.status(200).send(result);
  });

  server.post("/auth/login/clinic", async (request, reply) => {
    const { phoneNumber, email } = request.body as UserWhere;
  });

  server.post("/auth/patient/request-otp", async (request, reply) => {
    const parsed = patientOtpVerifySchema.parse(request.body);
    const result = authService.patientOtpVerify(parsed.phoneNumber, parsed.otp);
    reply.status(200).send(result);
  });
}
