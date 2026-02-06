-- migrate:up
CREATE TABLE IF NOT EXISTS clinic_admins (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('DOCTOR', 'STAFF')),
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_clinic_admin UNIQUE (clinic_id, user_id)
);
CREATE INDEX idx_clinic_admins_clinic_id ON clinic_admins(clinic_id);
CREATE INDEX idx_clinic_admins_user_id ON clinic_admins(user_id);
CREATE INDEX idx_clinic_admins_primary ON clinic_admins(clinic_id, is_primary)
WHERE is_primary = true;
-- migrate:down
DROP INDEX IF EXISTS idx_clinic_admins_primary;
DROP INDEX IF EXISTS idx_clinic_admins_user_id;
DROP INDEX IF EXISTS idx_clinic_admins_clinic_id;
DROP TABLE IF EXISTS clinic_admins;