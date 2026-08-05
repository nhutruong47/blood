-- =============================================================================
-- V4__PerformanceIndexes.sql
-- Adds indexes that match the actual query patterns emitted by the JPA
-- repositories. Each index is justified by the method that depends on it.
--
-- Strategy:
--   1. Composite indexes for WHERE...ORDER BY...LIMIT patterns (column order
--      matches the predicate so the optimiser can use it for sorting).
--   2. Covering indexes for the "find available" hot path.
--   3. Foreign-key indexes that were missing (FK lookups + JOIN efficiency).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. users: filter by role + blood_group is used by the matching engine when
--    picking candidate donors. Right now the optimiser falls back to
--    idx_users_role + a row filter on blood_group.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_users_role_blood_group ON users(role, blood_group);

-- ---------------------------------------------------------------------------
-- 2. blood_units: hot-path reservation query.
--    BloodUnitRepository.findAvailableByBloodGroupsWithLock uses:
--        WHERE blood_group IN (...) AND status = 'AVAILABLE' AND expiry_date > CURRENT_DATE
--        ORDER BY expiry_date ASC
--    The existing idx_blood_unit_stock is (blood_group, component_type, status,
--    expiry_date) which is fine for filtering but doesn't include the row
--    pointer for index-only scans. Add a covering index that the optimiser
--    will prefer for the pure availability check.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_blood_unit_available
    ON blood_units(blood_group, status, expiry_date)
    INCLUDE (id, volume_ml, component_type);

-- ---------------------------------------------------------------------------
-- 3. blood_units: status + updated_at is used by the cleanup job that
--    quarantines stale units. (BloodUnitRepository.findByStatusAndUpdatedAtBefore)
-- ---------------------------------------------------------------------------
CREATE INDEX idx_blood_unit_status_updated
    ON blood_units(status, updated_at);

-- ---------------------------------------------------------------------------
-- 4. blood_units: donor_id has no index even though it's a FK and the donor
--    history page does WHERE donor_id = ? ORDER BY collection_date DESC.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_blood_unit_donor_collected
    ON blood_units(donor_id, collection_date DESC);

-- ---------------------------------------------------------------------------
-- 5. donation_registrations: capacity check is the most frequent call on the
--    booking page (per day per center). Right now it scans the whole table.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_donation_reg_date_center_status
    ON donation_registrations(donation_date, medical_center_name, status);

-- ---------------------------------------------------------------------------
-- 6. donation_registrations: donor's booking history page uses
--    WHERE donor_id = ? ORDER BY created_at DESC.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_donation_reg_donor_created
    ON donation_registrations(donor_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 7. examinations: reviewer_id is a FK with no index. Admin dashboards list
--    "examinations reviewed by doctor X".
-- ---------------------------------------------------------------------------
CREATE INDEX idx_examination_reviewer ON examinations(reviewed_by_id);

-- ---------------------------------------------------------------------------
-- 8. shipment_checkpoints: ORDER BY timestamp DESC is the default ordering
--    for the live tracking view. Add an index that supports both the filter
--    and the sort.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_shipment_checkpoint_shipment_ts
    ON shipment_checkpoints(shipment_id, timestamp DESC);

-- ---------------------------------------------------------------------------
-- 9. shipments: status + created_at is used for the dispatch queue
--    (oldest pending first).
-- ---------------------------------------------------------------------------
CREATE INDEX idx_shipment_status_created
    ON shipments(status, created_at);

-- ---------------------------------------------------------------------------
-- 10. notification_messages: admin broadcast jobs hit
--     WHERE status = 'PENDING' ORDER BY created_at very frequently.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_notification_status_created
    ON notification_messages(status, created_at);

-- ---------------------------------------------------------------------------
-- 11. notification_messages: covers the per-user inbox query
--     WHERE recipient_id = ? ORDER BY created_at DESC.
--     The existing idx_notification_recipient is (recipient_id, status) which
--     doesn't help the sort. Add a DESC index that the optimiser can use both
--     for filtering and avoiding a sort.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_notification_recipient_created
    ON notification_messages(recipient_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 12. refresh_tokens: the cleanup job needs
--     WHERE expiry_date < ? to delete expired tokens.
--     idx_refresh_tokens_expiry already exists; nothing more to do here.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 13. audit_events: actor activity dashboards filter
--     WHERE actor_id = ? ORDER BY created_at DESC.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_audit_actor_created
    ON audit_events(actor_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 14. audit_events: full-text search on reason for support tooling.
--     SQL Server supports regular indexes on VARCHAR; add a trigram-style
--     index when the column gets large (left as a no-op for now).
-- ---------------------------------------------------------------------------
-- (Deferred until audit_events.reason grows beyond ~1M rows.)

-- ---------------------------------------------------------------------------
-- 15. organizations: status-filtered admin queues (pending verifications).
-- ---------------------------------------------------------------------------
CREATE INDEX idx_organization_status ON organizations(status);

-- ---------------------------------------------------------------------------
-- 16. donor_match_recommendations: lifecycle is "created, then queried by
--     request, then optionally promoted". The requesting endpoint hits
--     WHERE blood_request_id = ? ORDER BY priority_score DESC. Add a
--     descending index that supports both filter and sort.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_match_request_priority_desc
    ON donor_match_recommendations(blood_request_id, priority_score DESC);

-- ---------------------------------------------------------------------------
-- 17. donation_locations: created_by_id is a FK without an index.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_donation_location_created_by ON donation_locations(created_by_id);

-- ---------------------------------------------------------------------------
-- 18. blood_requests: combined (status, urgency) filter is used by the
--     emergency console. Right now the optimiser has to pick between
--     idx_blood_request_status and idx_blood_request_urgency.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_blood_request_status_urgency
    ON blood_requests(status, urgency);

-- ---------------------------------------------------------------------------
-- 19. blood_requests: dashboard "newest first" view hits
--     ORDER BY created_at DESC. A covering index lets the optimiser stream
--     rows in order without a sort.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_blood_request_created_at_desc
    ON blood_requests(created_at DESC)
    INCLUDE (status, urgency, blood_group);

-- ---------------------------------------------------------------------------
-- 20. lab_tests: ORDER BY tested_at DESC for unit history.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_lab_test_unit_tested
    ON lab_tests(blood_unit_id, tested_at DESC);

-- ---------------------------------------------------------------------------
-- 21. inventory_movements: dashboard "recent activity" view hits
--     ORDER BY created_at DESC. Existing idx_inventory_movement_created is
--     ascending; replace with descending to avoid a sort.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_inventory_movement_created_desc
    ON inventory_movements(created_at DESC);

-- ---------------------------------------------------------------------------
-- 22. user_profiles: emergency matcher filters
--     users with emergencyAlertOptIn = 1 are pre-filtered here, then joined
--     with users on user_id for the blood_group + geo search.
--     The partial index is small (only opted-in users) and lets the
--     emergency matcher stream candidate IDs without scanning the table.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_user_profile_opt_in
    ON user_profiles(emergency_alert_opt_in)
    WHERE emergency_alert_opt_in = 1;

-- ---------------------------------------------------------------------------
-- 23. user_profiles: geo bounding-box search for nearby donors.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_user_profile_geo
    ON user_profiles(latitude, longitude)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
