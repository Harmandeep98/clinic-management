-- migrate:up
ALTER TABLE clinics_mapping
ADD CONSTRAINT clinics_mapping_fk FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT;
ALTER TABLE user_refresh_tokens
ADD CONSTRAINT user_refresh_tokens_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
-- migrate:down
ALTER TABLE clinics_mapping DROP CONSTRAINT clinics_mapping_fk IF EXISTS;
ALTER TABLE user_refresh_tokens DROP CONSTRAINT user_refresh_tokens_fk IF EXISTS;