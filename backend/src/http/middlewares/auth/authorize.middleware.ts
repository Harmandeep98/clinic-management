import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../../shared/errors/app-errors";
import { Role } from "../../../shared/auth/auth.types";

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: [
    "visit:view",
    "visit:complete",
    "appointment:create",
    "appointment:cancel",
    "appointment:view",
  ],
  STAFF: [
    "visit:view",
    "visit:start",
    "appointment:create",
    "appointment:cancel",
    "appointment:view",
    "lab:upload",
  ],
  DOCTOR: [
    "visit:view",
    "visit:complete",
    "prescription:view",
    "prescription:create",
    "appointment:create",
    "appointment:cancel",
    "appointment:view",
    "lab:upload",
    "lab:view",
  ],
  PATIENT: ["appointment:create", "appointment:view", "visit:view", "lab:view"],
};

export function authorize(action: string) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const role: Role = request.auth.role;

    const permissions = ROLE_PERMISSIONS[role];

    if (!permissions) {
      throw new AppError("Forbidden", 403, "AUTH_ROLE_UNKNOWN");
    }

    if (!permissions.includes(action)) {
      throw new AppError("Forbidden", 403, "AUTH_FORBIDDEN");
    }
  };
}
