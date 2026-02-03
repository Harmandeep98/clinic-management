-- migrate:up
ALTER TABLE patients DROP COLUMN IF EXISTS external_ref;
-- migrate:down
ALTER TABLE patients
ADD COLUMN external_ref VARCHAR