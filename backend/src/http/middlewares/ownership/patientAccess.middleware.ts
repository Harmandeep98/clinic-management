import { FastifyRequest } from "fastify";
import { UserPatientLinksRepository } from "../../../repositories/userPatientLinks/userPatientLinks.repository";
import { AppError } from "../../../shared/errors/app-errors";

export async function requirePatientAccess(request: FastifyRequest) {
  const { patientId } = request.params as { patientId: string };
  const { userId, role } = request.auth;

  if (role === "ADMIN" || role === "STAFF") {
    return;
  }

  const hasAccess = await UserPatientLinksRepository.existsActiveLink(
    userId,
    patientId,
  );

  if (!hasAccess) {
    throw new AppError("Forbidden", 403, "PATIENT_ACCESS_DENIED");
  }
}
