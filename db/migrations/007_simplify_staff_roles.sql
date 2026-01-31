-- migrate:up
ALTER TABLE user_clinic_roles DROP CONSTRAINT IF EXISTS user_clinic_roles_role_check;
ALTER TABLE user_clinic_roles
ADD CONSTRAINT user_clinic_roles_role_check CHECK (user_role IN ('ADMIN', 'DOCTOR', 'STAFF'));
-- migrate:down
ALTER TABLE user_clinic_roles DROP CONSTRAINT IF EXISTS user_clinic_roles_role_check;
ALTER TABLE user_clinic_roles
ADD CONSTRAINT user_clinic_roles_role_check CHECK (
    user_role IN ('ADMIN', 'DOCTOR', 'STAFF', 'RECEPTIONIST')
  );