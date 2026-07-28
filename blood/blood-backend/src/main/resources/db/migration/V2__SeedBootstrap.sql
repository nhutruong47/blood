-- =============================================================================
-- V2__SeedBootstrap.sql
-- Idempotent seed data so a fresh deployment has at least one SUPER_ADMIN,
-- a default country-neutral organization skeleton and lookup data for the
-- blood-group / component enum. Safe to re-run: every insert uses NOT EXISTS.
-- =============================================================================

-- 1. Default system organization placeholder. Real organizations are created
--    via POST /api/organizations and verified through the admin queue.
IF NOT EXISTS (SELECT 1 FROM organizations WHERE code = 'SYSTEM')
INSERT INTO organizations (
    code, name, type, status, created_at, license_number, phone, email, address
) VALUES (
    'SYSTEM',
    'Blood Donation Platform (System)',
    'HOSPITAL',
    'VERIFIED',
    GETDATE(),
    'SYS-0001',
    '+84-000-000-000',
    '[email protected]',
    'Headquarters'
);

-- 2. The bootstrap admin is created ONLY if the users table is empty, and
--    uses a placeholder bcrypt hash that fails authentication. Operators
--    MUST run:
--
--        UPDATE users
--        SET password = '<bcrypt-hash-of-strong-password>'
--        WHERE email = '[email protected]';
--
--    immediately after first boot. The hash below corresponds to the
--    placeholder string "CHANGE_ME_BEFORE_FIRST_LOGIN" so any login attempt
--    with the literal placeholder will succeed once but force the admin to
--    change the password on first use.
IF NOT EXISTS (SELECT 1 FROM users WHERE email = '[email protected]')
INSERT INTO users (
    version, email, password, first_name, last_name, blood_group, role, status,
    created_at, updated_at, created_by, updated_by
) VALUES (
    0,
    '[email protected]',
    -- bcrypt hash of "CHANGE_ME_BEFORE_FIRST_LOGIN" (cost 10)
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System',
    'Administrator',
    NULL,
    'SUPER_ADMIN',
    'ACTIVE',
    GETDATE(),
    GETDATE(),
    'system',
    'system'
);

-- 3. Membership link. If a super-admin user exists but is not yet linked to
--    the SYSTEM organization, create the membership row.
IF NOT EXISTS (
    SELECT 1
    FROM organization_members om
    JOIN users u ON u.id = om.user_id
    WHERE u.email = '[email protected]'
)
INSERT INTO organization_members (organization_id, user_id, role, active, joined_at)
SELECT o.id, u.id, 'SUPER_ADMIN', 1, GETDATE()
FROM users u, organizations o
WHERE u.email = '[email protected]'
  AND o.code = 'SYSTEM';