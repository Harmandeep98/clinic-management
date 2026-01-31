--migrate:up
CREATE INDEX visits_patient_started_id_idx ON visits (patient_id, started_at DESC, id DESC);
CREATE INDEX visits_doctor_started_id_idx ON visits (doctor_id, started_at DESC, id DESC);
CREATE INDEX visits_clinic_started_id_idx ON visits (clinic_id, started_at DESC, id DESC);

-- migrate:down
DROP INDEX IF EXISTS visits_patient_started_id_idx;
DROP INDEX IF EXISTS visits_doctor_started_id_idx;
DROP INDEX IF EXISTS visits_clinic_started_id_idx;