-- migrate:up
-- 1️⃣ Drop constraints FIRST
ALTER TABLE doctors DROP CONSTRAINT IF EXISTS doctors_clinic_fk;
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_clinic_fk;
-- 2️⃣ Drop columns
ALTER TABLE doctors DROP COLUMN IF EXISTS clinic_id;
ALTER TABLE patients DROP COLUMN IF EXISTS clinic_id;
-- 3️⃣ Create patient ↔ clinic link
CREATE TABLE patient_clinic_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_patient_clinic UNIQUE (patient_id, clinic_id),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);
-- 4️⃣ Create doctor ↔ clinic link
CREATE TABLE doctor_clinic_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_doctor_clinic UNIQUE (doctor_id, clinic_id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- migrate:down
-- 1️⃣ Drop link tables
DROP TABLE IF EXISTS doctor_clinic_link;
DROP TABLE IF EXISTS patient_clinic_link;
-- 2️⃣ Re-add columns
ALTER TABLE patients
ADD COLUMN clinic_id UUID;
ALTER TABLE doctors
ADD COLUMN clinic_id UUID;
-- 3️⃣ Re-add constraints
ALTER TABLE patients
ADD CONSTRAINT patients_clinic_fk FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT;
ALTER TABLE doctors
ADD CONSTRAINT doctors_clinic_fk FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT;
