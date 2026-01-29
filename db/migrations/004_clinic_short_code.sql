-- migrate:up
ALTER TABLE clinics
ADD COLUMN short_code VARCHAR(5) NOT NULL;

CREATE UNIQUE INDEX clinics_short_code_unique
ON clinics (short_code);

-- migrate:down
DROP INDEX IF EXISTS clinics_short_code_unique;
ALTER TABLE clinics DROP COLUMN short_code;
