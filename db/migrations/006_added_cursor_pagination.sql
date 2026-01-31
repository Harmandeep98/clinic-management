--migrate:up
CREATE INDEX visits_patient_started_id_idx ON visits (patient_id, started_at DESC, id DESC);
-- migrate:down
DROP INDEX IF EXISTS visits_patient_started_id_idx;