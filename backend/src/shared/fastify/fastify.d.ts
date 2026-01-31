import "fastify";
import { Role } from "../shared/auth.types";

declare module "fastify" {
  interface FastifyRequest {
    auth: {
      userId: string;
      clinicId: string;
      role: Role;
      doctorId: string | null;
    };
  }
}
