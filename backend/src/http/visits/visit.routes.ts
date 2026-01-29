import { FastifyInstance } from "fastify";
import { CompleteVisitSchema, StartVisitSchema } from "./visit.schemas";
import { generateId } from "../../shared/id/uuid";
import { VisitService } from "../../applications/visits/visit.service";

export async function registerVisitRoutes(server: FastifyInstance) {
  const visitService = new VisitService();

  server.post("/visits/start", async (request, reply) => {
    const parsed = StartVisitSchema.parse(request.body);

    const visitId = generateId();

    await visitService.startVisit({
      id: visitId,
      clinic_id: parsed.clinic_id,
      appointment_id: parsed.appointment_id,
      patient_id: parsed.patient_id,
      doctor_id: parsed.doctor_id,
      visit_ref: parsed.visit_ref,
      notes: parsed.notes,
      started_at: new Date(),
    });

    reply.status(201).send({ visit_id: visitId });
  });

  server.post("/visits/:visitId/complete", async (request, reply) => {
    const parsed = CompleteVisitSchema.parse((request.params as any).visitId);

    await visitService.completeVisit(parsed.visit_id);

    reply.status(200).send();
  });
}
