-- migrate:up
CREATE TABLE user_refresh_tokens (
  id UUID PRIMARY KEY NOT NULL,
  token_hash TEXT NOT NULL,
  user_id UUID NOT NULL,
  user_type VARCHAR NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- UNIQUE TOKEN HASH CONSTRAINT
ALTER TABLE user_refresh_tokens
ADD CONSTRAINT unique_refresh_token UNIQUE (token_hash);
-- ADD Index on token
CREATE INDEX user_hashed_token ON user_refresh_tokens (token_hash);
-- migrate:down
DROP TABLE IF EXISTS user_refresh_tokens;
ALTER TABLE user_refresh_tokens DROP CONSTRAINT IF EXISTS unique_refresh_token;
DROP INDEX IF EXISTS user_hashed_token;