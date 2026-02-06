-- migrate:up
-- Add email column for clinic contact
ALTER TABLE clinics
ADD COLUMN email VARCHAR(255) NULL;
-- Unique constraint on email (if provided)
CREATE UNIQUE INDEX idx_clinics_email ON clinics(LOWER(email))
WHERE email IS NOT NULL;
-- migrate:down
DROP INDEX IF EXISTS idx_clinics_email;
ALTER TABLE clinics DROP COLUMN IF EXISTS email;