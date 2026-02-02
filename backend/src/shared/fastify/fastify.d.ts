import "fastify";
import { Role } from "../shared/auth.types";

declare module "fastify" {
  interface FastifyRequest {
    auth: {
      userId: string;
      clinicId: string | null;
      role: Role;
      doctorId: string | null;
      patientId: string | null;
    };
  }
}
