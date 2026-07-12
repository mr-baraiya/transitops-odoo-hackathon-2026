-- ============================================================
-- TRANSITOPS - DATABASE CREATION (PostgreSQL)
-- Run this once while connected to a maintenance DB (e.g. 'postgres'),
-- NOT inside the same session/script as the schema file.
-- Example:
--   psql -U postgres -f 01_create_database.sql
--   psql -U postgres -d transitops_db -f 02_schema_and_seed.sql
-- ============================================================

DROP DATABASE IF EXISTS transitops_db;

-- Postgres has no CHARACTER SET/COLLATE-per-DB syntax like MySQL's utf8mb4;
-- UTF8 is the standard encoding and Postgres collations are locale-based.
CREATE DATABASE transitops_db
    WITH ENCODING 'UTF8'
    TEMPLATE template0;
