-- Benchmark tables for performance testing
-- All benchmark tables have the same structure
CREATE TABLE t1 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t2 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t3 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t4 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t5 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t7 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t8 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t9 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t10 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t11 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t11_source (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t12 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t13 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t14 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t15 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);
CREATE TABLE t16 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), a INTEGER, b INTEGER, c TEXT);

-- Create a role/user with replication privileges for PowerSync
-- Note: This will fail on reset if the role already exists, but that's okay
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'powersync_role') THEN
        CREATE ROLE powersync_role WITH REPLICATION BYPASSRLS LOGIN PASSWORD 'myhighlyrandompassword';
    END IF;
END
$$;

-- Set up permissions for the newly created role
-- Read-only (SELECT) access is required
GRANT SELECT ON ALL TABLES IN SCHEMA public TO powersync_role;

-- Update the publication to include all tables
-- Drop and recreate to ensure all tables are included
DROP PUBLICATION IF EXISTS powersync;
CREATE PUBLICATION powersync FOR ALL TABLES;

