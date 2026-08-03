IF OBJECT_ID('users', 'U') IS NULL
BEGIN
    CREATE TABLE users (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL,
        password NVARCHAR(255) NOT NULL,
        first_name NVARCHAR(255),
        last_name NVARCHAR(255),
        blood_group NVARCHAR(10),
        role NVARCHAR(50)
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uk_users_email' AND object_id = OBJECT_ID('users'))
BEGIN
    CREATE UNIQUE INDEX uk_users_email ON users(email);
END;

IF OBJECT_ID('donation_location', 'U') IS NULL
BEGIN
    CREATE TABLE donation_location (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255),
        address NVARCHAR(500),
        created_by_id BIGINT NULL,
        CONSTRAINT fk_donation_location_created_by FOREIGN KEY (created_by_id) REFERENCES users(id)
    );
END;

IF OBJECT_ID('donation_schedule', 'U') IS NULL
BEGIN
    CREATE TABLE donation_schedule (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        donation_time DATETIME2,
        location_id BIGINT NULL,
        CONSTRAINT fk_donation_schedule_location FOREIGN KEY (location_id) REFERENCES donation_location(id)
    );
END;

IF OBJECT_ID('donation_registration', 'U') IS NULL
BEGIN
    CREATE TABLE donation_registration (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        medical_center NVARCHAR(255),
        donation_date DATE,
        blood_group NVARCHAR(10),
        health_status NVARCHAR(1000),
        weight FLOAT,
        amount INT,
        age INT,
        donor_id BIGINT NULL,
        approved BIT NOT NULL DEFAULT 0,
        CONSTRAINT fk_donation_registration_donor FOREIGN KEY (donor_id) REFERENCES users(id)
    );
END;

IF OBJECT_ID('blood_request', 'U') IS NULL
BEGIN
    CREATE TABLE blood_request (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        blood_group NVARCHAR(10),
        urgency NVARCHAR(50),
        recipient_info NVARCHAR(1000),
        medical_center_id BIGINT NULL,
        status NVARCHAR(50),
        staff_response NVARCHAR(1000),
        approved_by_id BIGINT NULL,
        CONSTRAINT fk_blood_request_medical_center FOREIGN KEY (medical_center_id) REFERENCES users(id),
        CONSTRAINT fk_blood_request_approved_by FOREIGN KEY (approved_by_id) REFERENCES users(id)
    );
END;
