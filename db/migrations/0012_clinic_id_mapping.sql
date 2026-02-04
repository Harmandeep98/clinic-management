-- migrate:up
CREATE TABLE clinics_mapping (
  id UUID PRIMARY KEY,
  clinic_id UUID NOT NULL,
  slug_hash UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE clinics_mapping
ADD CONSTRAINT clinics_mapping_unique UNIQUE (slug_hash, clinic_id);
CREATE INDEX clinics_mapping_search_idx ON clinics_mapping (slug_hash, clinic_id);

-- migrate:down
DROP INDEX IF EXISTS clinics_mapping_search_idx;
DROP TABLE IF EXISTS clinics_mapping;