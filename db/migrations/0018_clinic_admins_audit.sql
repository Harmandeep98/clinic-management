-- migrate:up
-- Add audit columns for tracking who granted/modified admin access
ALTER TABLE clinic_admins
ADD COLUMN created_by UUID NULL REFERENCES users(id) ON DELETE
SET NULL;
ALTER TABLE clinic_admins
ADD COLUMN updated_by UUID NULL REFERENCES users(id) ON DELETE
SET NULL;
-- Index for active admins per clinic (hot path)
CREATE INDEX idx_clinic_admins_active ON clinic_admins(clinic_id)
WHERE is_active = true;
-- migrate:down
DROP INDEX IF EXISTS idx_clinic_admins_active;
ALTER TABLE clinic_admins DROP COLUMN IF EXISTS updated_by;
ALTER TABLE clinic_admins DROP COLUMN IF EXISTS created_by;