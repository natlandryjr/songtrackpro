-- Migration: 001-create-extensions
-- Description: Create necessary PostgreSQL extensions
-- Date: 2025-09-29

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable advanced text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable case-insensitive text operations
CREATE EXTENSION IF NOT EXISTS "citext";