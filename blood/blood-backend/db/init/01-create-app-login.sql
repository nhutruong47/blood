-- =============================================================================
-- 01-create-app-login.sql
-- Provisions the dedicated SQL Server login that the Spring Boot app uses to
-- connect to the BLOOD database. Runs once per cold start of the SQL container
-- (via the `init-db` one-shot compose service), so this script MUST be safe to
-- re-run. Every statement is guarded with IF NOT EXISTS / IF SUSER_ID IS NULL.
--
-- Why this exists: previously the application connected as `sa`, which is the
-- SQL Server system administrator principal. That is both a security and a
-- portability problem. This script replaces that with a least-privilege login
-- (`blood_app`) that only owns the BLOOD database.
--
-- Variable substitution:
--   $(BLOOD_APP_PASSWORD) is supplied by `sqlcmd -v` from the init-db service,
--   so the password is never committed to this file or to docker-compose.
-- =============================================================================

USE master;
GO

-- Server-level login. CHECK_POLICY keeps Windows password complexity rules on
-- (MSSQL_SA_PASSWORD already complies, so this is a no-op for compliance);
-- CHECK_EXPIRATION OFF stops the password from silently expiring under the app
-- and breaking every request that hits the DB.
IF SUSER_ID(N'blood_app') IS NULL
BEGIN
    CREATE LOGIN blood_app
        WITH PASSWORD = N'$(BLOOD_APP_PASSWORD)',
             CHECK_POLICY = ON,
             CHECK_EXPIRATION = OFF,
             DEFAULT_DATABASE = BLOOD;
END
GO

-- Database-level user mapped to the login above. We tolerate the database
-- not existing yet on the very first run (init-db may execute before BLOOD
-- is created); in that case we create it, then re-create the user.
IF DB_ID(N'BLOOD') IS NULL
BEGIN
    CREATE DATABASE BLOOD;
END
GO

USE BLOOD;
GO

IF SUSER_ID(N'blood_app') IS NULL
BEGIN
    -- The login was created in master above; this branch only triggers if the
    -- login disappeared between scripts (e.g. a hot admin drop). Re-create it
    -- so we always end up with a working pair.
    CREATE LOGIN blood_app
        WITH PASSWORD = N'$(BLOOD_APP_PASSWORD)',
             CHECK_POLICY = ON,
             CHECK_EXPIRATION = OFF,
             DEFAULT_DATABASE = BLOOD;
END
GO

IF USER_ID(N'blood_app') IS NULL
BEGIN
    CREATE USER blood_app FOR LOGIN blood_app
        WITH DEFAULT_SCHEMA = dbo;
END
GO

-- Least-privilege baseline. db_owner is currently needed because Flyway runs
-- DDL during deployment (CREATE TABLE, ALTER TABLE, CREATE INDEX, etc.). The
-- follow-up hardening pass (tracked separately) will introduce a custom
-- db_app_role that grants the exact DDL subset Flyway actually needs and
-- demote blood_app to db_datareader + db_datawriter for application traffic.
ALTER ROLE db_owner ADD MEMBER blood_app;
GO
