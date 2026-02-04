-- migrate:up
-- Staff table (entity for staff-specific data)
CREATE TABLE staff (
  id UUID PRIMARY KEY,
  full_name VARCHAR NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Link staff to user_clinic_roles (optional - only set when role is STAFF)
ALTER TABLE user_clinic_roles
ADD COLUMN staff_id UUID NULL;
-- Link doctor to user_clinic_roles (optional - only set when role is DOCTOR)
ALTER TABLE user_clinic_roles
ADD COLUMN doctor_id UUID NULL;
-- Foreign key constraints
ALTER TABLE user_clinic_roles
ADD CONSTRAINT user_clinic_roles_staff_fk FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE
SET NULL;
ALTER TABLE user_clinic_roles
ADD CONSTRAINT user_clinic_roles_doctor_fk FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE
SET NULL;
-- Indexes for faster lookups
CREATE INDEX user_clinic_roles_staff_idx ON user_clinic_roles (staff_id)
WHERE staff_id IS NOT NULL;
CREATE INDEX user_clinic_roles_doctor_idx ON user_clinic_roles (doctor_id)
WHERE doctor_id IS NOT NULL;
-- migrate:down
DROP INDEX IF EXISTS user_clinic_roles_doctor_idx;
DROP INDEX IF EXISTS user_clinic_roles_staff_idx;
ALTER TABLE user_clinic_roles DROP CONSTRAINT IF EXISTS user_clinic_roles_doctor_fk;
ALTER TABLE user_clinic_roles DROP CONSTRAINT IF EXISTS user_clinic_roles_staff_fk;
ALTER TABLE user_clinic_roles DROP COLUMN IF EXISTS doctor_id;
ALTER TABLE user_clinic_roles DROP COLUMN IF EXISTS staff_id;
DROP TABLE IF EXISTS staff;