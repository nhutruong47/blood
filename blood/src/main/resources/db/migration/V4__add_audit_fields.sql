IF COL_LENGTH('blood_request', 'processed_by_id') IS NULL
BEGIN
    ALTER TABLE blood_request ADD processed_by_id BIGINT NULL;
END;

IF COL_LENGTH('blood_request', 'processed_at') IS NULL
BEGIN
    ALTER TABLE blood_request ADD processed_at DATETIME2 NULL;
END;

IF COL_LENGTH('blood_request', 'rejection_reason') IS NULL
BEGIN
    ALTER TABLE blood_request ADD rejection_reason NVARCHAR(1000) NULL;
END;

IF COL_LENGTH('blood_request', 'fulfilled_at') IS NULL
BEGIN
    ALTER TABLE blood_request ADD fulfilled_at DATETIME2 NULL;
END;

IF COL_LENGTH('blood_request', 'cancelled_at') IS NULL
BEGIN
    ALTER TABLE blood_request ADD cancelled_at DATETIME2 NULL;
END;

IF COL_LENGTH('blood_request', 'fulfilled_blood_group') IS NULL
BEGIN
    ALTER TABLE blood_request ADD fulfilled_blood_group NVARCHAR(10) NULL;
END;

IF OBJECT_ID('audit_log', 'U') IS NULL
BEGIN
    CREATE TABLE audit_log (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        actor_user_id BIGINT NULL,
        action NVARCHAR(100) NOT NULL,
        entity_type NVARCHAR(100) NOT NULL,
        entity_id BIGINT NULL,
        old_value NVARCHAR(1000),
        new_value NVARCHAR(1000),
        timestamp DATETIME2,
        ip_address NVARCHAR(100)
    );
END;
