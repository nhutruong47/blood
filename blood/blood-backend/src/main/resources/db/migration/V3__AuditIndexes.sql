-- V3__AuditIndexes.sql
-- Adds indexes to Hibernate Envers audit tables and revinfo for read-heavy
-- audit queries (every audited write issues SELECT ... FROM {entity}_aud
-- WHERE rev = ? and SELECT MAX(rev) FROM revinfo).

CREATE INDEX idx_users_aud_rev          ON users_aud(rev);
CREATE INDEX idx_blood_units_aud_rev    ON blood_units_aud(rev);
CREATE INDEX idx_blood_requests_aud_rev ON blood_requests_aud(rev);
CREATE INDEX idx_revinfo_tstmp          ON revinfo(revtstmp);
