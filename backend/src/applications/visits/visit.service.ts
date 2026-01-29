import { withTransaction } from "../../infrastructure/db/transaction";
import { AppError } from "../../shared/errors/app-errors";
import { VisitRepository } from "../../repositories/visits/visit.repository";
import { ClinicReadRepository } from "../../repositories/clinics/clinic-read.repository.js";
import { ClinicCounterRepository } from "../../repositories/clinics/clinic-counter.repository.js";
import { decodeCursor } from "../../shared/pagination/cursor.js";

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
  private visitRepo = new VisitRepository();
  private clinicRepo = new ClinicReadRepository();
  private counterRepo = new ClinicCounterRepository();

  async startVisit(input: StartVisitInput): Promise<void> {
    await withTransaction(async (client) => {
      const existingVisit = await this.visitRepo.findByAppointmentIdForUpdate(
        client,
        input.appointment_id,
      );

      if (existingVisit) {
        throw new AppError("Visit already exists for this appointment", 409);
      }

      // 1️⃣ get clinic short code
      const shortCode = await this.clinicRepo.getShortCode(
        client,
        input.clinic_id,
      );

      // 2️⃣ atomic increment
      const seq = await this.counterRepo.incrementVisitSeq(
        client,
        input.clinic_id,
      );

      // 3️⃣ generate short readable ref
      const visitRef = `${shortCode}-${seq}`;

      await this.visitRepo.create(client, {
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
    });
  }

  async completeVisit(visitId: string): Promise<void> {
    await withTransaction(async (client) => {
      const visit = await this.visitRepo.findByIdForUpdate(client, visitId);

      if (!visit) {
        throw new AppError("Visit not found", 404);
      }

      if (visit.visit_status === "COMPLETED") {
        return;
      }

      if (visit.visit_status != "IN_PROGRESS") {
        throw new AppError("Visit cannot be completed in current status", 409);
      }

      await this.visitRepo.markCompleted(client, visitId, new Date());
    });
  }

  async getVisitsByPatient(patientId: string, limit: number, cursor?: string) {
    const decodedCursor = cursor ? decodeCursor<{started_at: string, id: string}>(cursor) : undefined;

    const visits =  await this.visitRepo.findVsistsForPatient(patientId, limit, decodedCursor)
  }
}
