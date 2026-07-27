CREATE TABLE roles (
    role_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    role_name NVARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE users (
    user_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    full_name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    phone NVARCHAR(30),
    blood_type NVARCHAR(10),
    birth_date DATE,
    gender NVARCHAR(20)
);

CREATE TABLE user_roles (
    user_role_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    role_id UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id),
    CONSTRAINT uq_user_roles UNIQUE (user_id, role_id)
);

CREATE TABLE hospitals (
    hospital_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    hospital_name NVARCHAR(255) NOT NULL,
    address NVARCHAR(500)
);

CREATE TABLE donation_campaigns (
    campaign_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    campaign_name NVARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

CREATE TABLE donation_locations (
    location_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    hospital_id UNIQUEIDENTIFIER NOT NULL,
    location_name NVARCHAR(255) NOT NULL,
    CONSTRAINT fk_donation_locations_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE TABLE donation_appointments (
    appointment_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    location_id UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT fk_donation_appointments_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_donation_appointments_location FOREIGN KEY (location_id) REFERENCES donation_locations(location_id)
);

CREATE TABLE health_screenings (
    screening_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    appointment_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    result NVARCHAR(100) NOT NULL,
    CONSTRAINT fk_health_screenings_appointment FOREIGN KEY (appointment_id) REFERENCES donation_appointments(appointment_id)
);

CREATE TABLE donation_history (
    donation_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    screening_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    CONSTRAINT fk_donation_history_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_donation_history_screening FOREIGN KEY (screening_id) REFERENCES health_screenings(screening_id)
);

CREATE TABLE blood_units (
    blood_unit_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    donation_id UNIQUEIDENTIFIER NOT NULL,
    blood_group NVARCHAR(10) NOT NULL,
    rh NVARCHAR(10) NOT NULL,
    CONSTRAINT fk_blood_units_donation FOREIGN KEY (donation_id) REFERENCES donation_history(donation_id)
);

CREATE TABLE blood_tests (
    test_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    blood_unit_id UNIQUEIDENTIFIER NOT NULL,
    hiv NVARCHAR(50),
    hbv NVARCHAR(50),
    hcv NVARCHAR(50),
    CONSTRAINT fk_blood_tests_blood_unit FOREIGN KEY (blood_unit_id) REFERENCES blood_units(blood_unit_id)
);

CREATE TABLE blood_inventory (
    inventory_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    blood_unit_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    hospital_id UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT fk_blood_inventory_blood_unit FOREIGN KEY (blood_unit_id) REFERENCES blood_units(blood_unit_id),
    CONSTRAINT fk_blood_inventory_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE TABLE blood_requests (
    request_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    hospital_id UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT fk_blood_requests_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE TABLE blood_request_items (
    item_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    request_id UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT fk_blood_request_items_request FOREIGN KEY (request_id) REFERENCES blood_requests(request_id)
);

CREATE TABLE blood_allocations (
    allocation_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    request_item_id UNIQUEIDENTIFIER NOT NULL,
    blood_unit_id UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT fk_blood_allocations_request_item FOREIGN KEY (request_item_id) REFERENCES blood_request_items(item_id),
    CONSTRAINT fk_blood_allocations_blood_unit FOREIGN KEY (blood_unit_id) REFERENCES blood_units(blood_unit_id)
);

CREATE TABLE emergency_requests (
    emergency_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    request_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    CONSTRAINT fk_emergency_requests_request FOREIGN KEY (request_id) REFERENCES blood_requests(request_id)
);

CREATE TABLE notifications (
    notification_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE audit_logs (
    audit_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);
