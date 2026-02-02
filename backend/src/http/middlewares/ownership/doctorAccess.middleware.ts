import { FastifyRequest } from "fastify";
import { AppError } from "../../../shared/errors/app-errors";
import { visitRepo } from "../../../repositories/visits/visit.repository";

export async function requireDoctorOwnership(request: FastifyRequest) {
  const { visitId } = request.params as { visitId: string };
  const { role, doctorId } = request.auth;
  if (role === "ADMIN") {
    return;
  }

  if (role !== "DOCTOR" || !doctorId) {
    throw new AppError("Forbidden", 403, "DOCTOR_REQUIRED");
  }

  const visitDoctorId = await visitRepo.getDoctorIdByVisitId(visitId);

  if (!visitDoctorId || visitDoctorId !== doctorId) {
    throw new AppError("Forbidden", 403, "DOCTOR_OWNERSHIP_REQUIRED");
  }
}
