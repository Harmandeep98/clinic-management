import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../../shared/errors/app-errors.js";
import { Role } from "../../../shared/auth/auth.types.js";

type JwtPayload = {
  sub: string;
  clinic_id: string;
  role: Role;
  doctor_id?: string | null;
};

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const decoded = await request.jwtVerify<JwtPayload>();

    if (decoded.role != "PATIENT" && !decoded.clinic_id) {
      request.log.error("UNAUTHRISED ACCESS TRIED");
      throw new AppError("Unauthorized", 401, "AUTH_UNAUTHORIZED");
    }

    request.auth = {
      userId: decoded.sub,
      clinicId: decoded.clinic_id,
      role: decoded.role,
      doctorId: decoded.doctor_id ?? null,
    };
  } catch (error) {
    request.log.warn(error, "JWT AUTHENTICATION FAILED");
    throw new AppError("Unauthorized", 401, "AUTH_UNAUTHORIZED");
  }
}
