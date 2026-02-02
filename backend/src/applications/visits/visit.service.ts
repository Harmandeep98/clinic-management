import { withTransaction } from "../../infrastructure/db/transaction";
import { AppError } from "../../shared/errors/app-errors";
import { visitRepo } from "../../repositories/visits/visit.repository";
import { clinicRepo } from "../../repositories/clinics/clinic-read.repository";
import { counterRepo } from "../../repositories/clinics/clinic-counter.repository";
import { decodeCursor, encodeCursor } from "../../shared/pagination/cursor";
import { visitWhere } from "../../repositories/visits/visit.types";
import { UserPatientLinksRepository } from "../../repositories/userPatientLinks/userPatientLinks.repository";

type StartVisitInput = {
  id: string;
  clinic_id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  started_at: Date;
  visit_ref: string;
  notes?: string | null;
};

export class VisitService {
  async startVisit(input: StartVisitInput): Promise<void> {
    await withTransaction(async (client) => {
      const existingVisit = await visitRepo.findByAppointmentIdForUpdate(
        client,
        input.appointment_id,
        input.clinic_id,
      );

      if (existingVisit) {
        throw new AppError("Visit already exists for this appointment", 409);
      }

      // 1️⃣ get clinic short code
      const shortCode = await clinicRepo.getShortCode(client, input.clinic_id);

      // 2️⃣ atomic increment
      const seq = await counterRepo.incrementVisitSeq(client, input.clinic_id);

      // 3️⃣ generate short readable ref
      const visitRef = `${shortCode}-${seq}`;

      await visitRepo.create(client, {
        id: input.id,
        clinic_id: input.clinic_id,
        appointment_id: input.appointment_id,
        patient_id: input.patient_id,
        doctor_id: input.doctor_id,
        visit_status: "IN_PROGRESS",
        started_at: input.started_at,
        visit_ref: visitRef,
        notes: input.notes ?? null,
      });

      await UserPatientLinksRepository.createUserPatientLink(
        client,
        input.doctor_id,
        input.patient_id,
      );
    });
  }

  async completeVisit(visitId: string, clinicId: string): Promise<void> {
    await withTransaction(async (client) => {
      const visit = await visitRepo.findByIdForUpdate(
        client,
        visitId,
        clinicId,
      );

      if (!visit) {
        throw new AppError("Visit not found", 404);
      }

      if (visit.visit_status === "COMPLETED") {
        return;
      }

      if (visit.visit_status != "IN_PROGRESS") {
        throw new AppError("Visit cannot be completed in current status", 409);
      }

      await visitRepo.markCompleted(client, visitId, new Date(), clinicId);
    });
  }

  async getVisits(
    where: visitWhere,
    limit: number,
    cursor?: string,
    clinicId?: string | null,
  ) {
    const decodedCursor = cursor
      ? decodeCursor<{ started_at: string; id: string }>(cursor)
      : undefined;

    const visits = await visitRepo.findVsists(
      where,
      limit,
      decodedCursor,
      clinicId,
    );

    const nextCursor =
      visits.length === limit
        ? encodeCursor({
            started_at: visits[visits.length - 1].started_at,
            id: visits[visits.length - 1].id,
          })
        : null;

    return { visits, nextCursor };
  }

  async getVisitsForPatients(
    patientId: string,
    limit: number,
    cursor?: string,
    clinicId?: string,
  ) {
    return this.getVisits({ patient_id: patientId }, limit, cursor, clinicId);
  }

  async getVisitsForClinics(clinicId: string, limit: number, cursor?: string) {
    return this.getVisits({ clinic_id: clinicId }, limit, cursor);
  }

  async getVisitsForDoctors(
    doctorId: string,
    limit: number,
    cursor?: string,
    clinicId?: string,
  ) {
    return this.getVisits({ doctor_id: doctorId }, limit, cursor, clinicId);
  }
}
