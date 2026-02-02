import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../../shared/errors/app-errors";
import { verifyJwt } from "../../../infrastructure/auth/jwt";
import {
  clinicUserJwtPayload,
  patientJwtPayload,
} from "../../../shared/auth/auth.types";

type JwtPayload = patientJwtPayload | clinicUserJwtPayload;

/** Type guard to check if payload is from a clinic user */
function isClinicUser(payload: JwtPayload): payload is clinicUserJwtPayload {
  return payload.role !== "PATIENT";
}

/** Type guard to check if payload is from a patient */
function isPatient(payload: JwtPayload): payload is patientJwtPayload {
  return payload.role === "PATIENT";
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authHeaders = request.headers.authorization;

    if (!authHeaders) {
      throw new AppError("Unauthorized", 401, "AUTH_UNAUTHORIZED");
    }

    const [scheme, token] = authHeaders.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError("Unauthorized", 401, "AUTH_UNAUTHORIZED");
    }

    const decoded = verifyJwt<JwtPayload>(token);

    // Clinic users must have a clinic ID
    if (isClinicUser(decoded) && !decoded.cid) {
      request.log.error("UNAUTHORIZED ACCESS TRIED - clinic user without cid");
      throw new AppError("Unauthorized", 401, "AUTH_UNAUTHORIZED");
    }

    // Build auth object based on user type
    if (isPatient(decoded)) {
      request.auth = {
        userId: decoded.sub,
        clinicId: null,
        role: decoded.role,
        patientId: decoded.pid ?? null,
        doctorId: null,
      };
    } else {
      request.auth = {
        userId: decoded.sub,
        clinicId: decoded.cid,
        role: decoded.role,
        patientId: null,
        doctorId: decoded.doctor_id ?? null,
      };
    }
  } catch (error) {
    request.log.warn(error, "JWT AUTHENTICATION FAILED");
    throw new AppError("Unauthorized", 401, "AUTH_UNAUTHORIZED");
  }
}
