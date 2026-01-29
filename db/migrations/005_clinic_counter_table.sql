-- TABEL CLINIC COUNTER
-- migrate:up
CREATE TABLE clinic_counters (
  clinic_id UUID PRIMARY KEY REFERENCES clinics(id) ON DELETE CASCADE,
  visit_seq BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);