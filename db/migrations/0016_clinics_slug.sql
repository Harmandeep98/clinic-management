-- migrate:up
-- Add slug column for subdomain-based clinic URLs
ALTER TABLE clinics
ADD COLUMN slug VARCHAR(50) NOT NULL DEFAULT '';
-- Unique constraint on slug (subdomains must be unique)
CREATE UNIQUE INDEX idx_clinics_slug ON clinics(slug)
WHERE slug != '';
-- migrate:down
DROP INDEX IF EXISTS idx_clinics_slug;
ALTER TABLE clinics DROP COLUMN IF EXISTS slug;