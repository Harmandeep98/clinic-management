-- migrate:up
-- Auth & membership check
CREATE INDEX idx_patient_clinic_active ON patient_clinic_link (patient_id, clinic_id)
WHERE is_active = true;
-- Reverse lookup (clinic → patients)
CREATE INDEX idx_patient_clinic_clinic_active ON patient_clinic_link (clinic_id)
WHERE is_active = true;
-- Auth & membership check
CREATE INDEX idx_doctor_clinic_active ON doctor_clinic_link (doctor_id, clinic_id)
WHERE is_active = true;
-- Reverse lookup (clinic → doctors)
CREATE INDEX idx_doctor_clinic_clinic_active ON doctor_clinic_link (clinic_id)
WHERE is_active = true;
-- migrate:down
DROP INDEX IF EXISTS idx_patient_clinic_active;
DROP INDEX IF EXISTS idx_patient_clinic_clinic_active;
DROP INDEX IF EXISTS idx_doctor_clinic_active;
DROP INDEX IF EXISTS idx_doctor_clinic_clinic_active;