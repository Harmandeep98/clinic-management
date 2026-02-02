import { FastifyInstance } from "fastify";
import { CompleteVisitSchema, StartVisitSchema } from "./visit.schemas";
import { generateId } from "../../shared/id/uuid";
import { VisitService } from "../../applications/visits/visit.service";
import { authenticate } from "../middlewares/auth/authenticate.middleware";
import { authorize } from "../middlewares/auth/authorize.middleware";
import { requirePatientAccess } from "../middlewares/ownership/patientAccess.middleware";
import { requireDoctorOwnership } from "../middlewares/ownership/doctorAccess.middleware";

export async function registerVisitRoutes(server: FastifyInstance) {
  const visitService = new VisitService();

  server.post(
    "/visits/start",
    {
      preHandler: [authenticate, authorize("visit:start")],
    },
    async (request, reply) => {
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
    },
  );

  server.post(
    "/visits/:visitId/complete",
    {
      preHandler: [
        authenticate,
        authorize("visit:complete"),
        requireDoctorOwnership,
      ],
    },
    async (request, reply) => {
      const parsed = CompleteVisitSchema.parse((request.params as any).visitId);

      await visitService.completeVisit(parsed.visit_id, request.auth.clinicId);

      reply.status(200).send();
    },
  );

  server.get(
    "/patients/:patientId/visits/",
    {
      preHandler: [authenticate, authorize("visit:view"), requirePatientAccess],
    },
    async (request, reply) => {
      const { patientId } = request.params as { patientId: string };

      const { limit = 20, cursor } = request.query as {
        limit?: number;
        cursor?: string;
      };

      const result = await visitService.getVisitsForPatients(
        patientId,
        Math.min(Number(limit), 50),
        cursor,
        request.auth.clinicId,
      );

      reply.status(200).send(result);
    },
  );

  server.get(
    "/doctors/:doctorId/visits",
    {
      preHandler: [authenticate, authorize("visit:view")],
    },
    async (request, reply) => {
      const { doctorId } = request.params as { doctorId: string };

      const { limit = 20, cursor } = request.query as {
        limit?: number;
        cursor?: string;
      };

      const result = await visitService.getVisitsForDoctors(
        doctorId,
        Math.min(Number(limit), 50),
        cursor,
        request.auth.clinicId,
      );

      reply.status(200).send(result);
    },
  );

  server.get("/clinics/:clinicId/visits", async (request, reply) => {
    const { clinicId } = request.params as { clinicId: string };

    const { limit = 20, cursor } = request.query as {
      limit?: number;
      cursor?: string;
    };

    const result = await visitService.getVisitsForClinics(
      clinicId,
      Math.min(Number(limit), 50),
      cursor,
    );

    reply.status(200).send(result);
  });

  server.post(
    "/visits/:visitId/lab-reports",
    { preHandler: [authenticate, authorize("lab:upload")] },
    async (request, reply) => {},
  );

  server.get(
    "/visits/:visitId/lab-reports",
    { preHandler: [authenticate, authorize("lab:view"), requirePatientAccess] },
    async (request, reply) => {},
  );
}
