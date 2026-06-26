-- Capa database initialization
-- This runs once when the Docker container is first created.
-- Prisma migrations handle schema creation.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create application role with limited privileges (optional hardening)
-- DO $$ BEGIN
--   IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'capa_app') THEN
--     CREATE ROLE capa_app LOGIN PASSWORD 'changeme';
--   END IF;
-- END $$;

-- Grant schema access
-- GRANT ALL PRIVILEGES ON DATABASE capa TO capa;

-- Log startup
DO $$ BEGIN RAISE NOTICE 'Capa DB initialized at %', NOW(); END $$;
