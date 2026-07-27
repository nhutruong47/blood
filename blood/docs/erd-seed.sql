SET NOCOUNT ON;

BEGIN TRANSACTION;

-- 1. ROLES
INSERT INTO roles (role_id, role_name) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', N'Donor'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', N'Hospital Admin'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', N'Lab Technician');

-- 2. USERS
INSERT INTO users (user_id, full_name, email, phone, blood_type, birth_date, gender) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', N'Nguyễn Văn A', 'nguyenvana@gmail.com', '0901234567', 'O', '1995-05-15', 'Male'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', N'Trần Thị B', 'tranthib@gmail.com', '0912345678', 'A', '1998-08-20', 'Female'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', N'Lê Văn C', 'levanc@gmail.com', '0923456789', 'B', '1990-12-10', 'Male');

-- 3. USER_ROLES
INSERT INTO user_roles (user_role_id, user_id, role_id) VALUES
(NEWID(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(NEWID(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(NEWID(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');

-- 4. HOSPITALS
INSERT INTO hospitals (hospital_id, hospital_name, address) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', N'Bệnh viện Chợ Rẫy', N'201B Nguyễn Chí Thanh, P.12, Q.5, TP.HCM'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', N'Bệnh viện Truyền máu Huyết học', N'1 Trần Hữu Trang, P.11, Q.Phú Nhuận, TP.HCM');

-- 5. DONATION_CAMPAIGNS
INSERT INTO donation_campaigns (campaign_id, campaign_name, start_date, end_date) VALUES
(NEWID(), N'Giọt Hồng Tri Ân 2026', '2026-08-01', '2026-08-15'),
(NEWID(), N'Hành Trình Đỏ 2026', '2026-09-01', '2026-09-30');

-- 6. DONATION_LOCATIONS
INSERT INTO donation_locations (location_id, hospital_id, location_name) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', N'Trung tâm Huyết học - Chợ Rẫy'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', N'Điểm Hiến Máu Cố Định Phú Nhuận');

-- 7. DONATION_APPOINTMENTS
INSERT INTO donation_appointments (appointment_id, user_id, location_id) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42');

-- 8. HEALTH_SCREENINGS
INSERT INTO health_screenings (screening_id, appointment_id, result) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51', N'PASSED - Đủ điều kiện hiến máu'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a62', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52', N'PASSED - Đủ điều kiện hiến máu');

-- 9. DONATION_HISTORY
INSERT INTO donation_history (donation_id, user_id, screening_id) VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61'),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a72', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a62');

-- 10. BLOOD_UNITS
INSERT INTO blood_units (blood_unit_id, donation_id, blood_group, rh) VALUES
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a81', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', 'O', '+'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a82', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a72', 'A', '+');

-- 11. BLOOD_TESTS
INSERT INTO blood_tests (test_id, blood_unit_id, hiv, hbv, hcv) VALUES
(NEWID(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a81', 'Negative', 'Negative', 'Negative'),
(NEWID(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a82', 'Negative', 'Negative', 'Negative');

-- 12. BLOOD_INVENTORY
INSERT INTO blood_inventory (inventory_id, blood_unit_id, hospital_id) VALUES
(NEWID(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a81', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31'),
(NEWID(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a82', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32');

-- 13. BLOOD_REQUESTS
INSERT INTO blood_requests (request_id, hospital_id) VALUES
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380a91', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31');

-- 14. BLOOD_REQUEST_ITEMS
INSERT INTO blood_request_items (item_id, request_id) VALUES
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '30eebc99-9c0b-4ef8-bb6d-6bb9bd380a91');

-- 15. BLOOD_ALLOCATIONS
INSERT INTO blood_allocations (allocation_id, request_item_id, blood_unit_id) VALUES
(NEWID(), '40eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a81');

-- 16. EMERGENCY_REQUESTS
INSERT INTO emergency_requests (emergency_id, request_id) VALUES
(NEWID(), '30eebc99-9c0b-4ef8-bb6d-6bb9bd380a91');

-- 17. NOTIFICATIONS
INSERT INTO notifications (notification_id, user_id) VALUES
(NEWID(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21'),
(NEWID(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');

-- 18. AUDIT_LOGS
INSERT INTO audit_logs (audit_id, user_id) VALUES
(NEWID(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23');

COMMIT TRANSACTION;
