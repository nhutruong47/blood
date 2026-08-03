IF COL_LENGTH('donation_registration', 'status') IS NULL
BEGIN
    ALTER TABLE donation_registration ADD status NVARCHAR(50) NULL;
END;

UPDATE donation_registration
SET status = CASE WHEN approved = 1 THEN 'APPROVED' ELSE 'PENDING' END
WHERE status IS NULL OR status = '';

IF COL_LENGTH('donation_registration', 'approved_by_id') IS NULL
BEGIN
    ALTER TABLE donation_registration ADD approved_by_id BIGINT NULL;
END;

IF COL_LENGTH('donation_registration', 'approved_at') IS NULL
BEGIN
    ALTER TABLE donation_registration ADD approved_at DATETIME2 NULL;
END;

IF COL_LENGTH('donation_registration', 'rejected_by_id') IS NULL
BEGIN
    ALTER TABLE donation_registration ADD rejected_by_id BIGINT NULL;
END;

IF COL_LENGTH('donation_registration', 'rejected_at') IS NULL
BEGIN
    ALTER TABLE donation_registration ADD rejected_at DATETIME2 NULL;
END;

IF COL_LENGTH('donation_registration', 'completed_by_id') IS NULL
BEGIN
    ALTER TABLE donation_registration ADD completed_by_id BIGINT NULL;
END;

IF COL_LENGTH('donation_registration', 'completed_at') IS NULL
BEGIN
    ALTER TABLE donation_registration ADD completed_at DATETIME2 NULL;
END;

IF COL_LENGTH('donation_registration', 'decision_reason') IS NULL
BEGIN
    ALTER TABLE donation_registration ADD decision_reason NVARCHAR(1000) NULL;
END;

IF COL_LENGTH('donation_registration', 'inventory_recorded') IS NULL
BEGIN
    ALTER TABLE donation_registration ADD inventory_recorded BIT NOT NULL DEFAULT 0;
END;

UPDATE blood_request
SET status = 'PENDING'
WHERE status IS NULL
   OR status = ''
   OR status NOT IN ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'FULFILLED', 'CANCELLED');

UPDATE blood_request
SET urgency = 'MEDIUM'
WHERE urgency IS NULL
   OR urgency = ''
   OR urgency NOT IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');

IF COL_LENGTH('blood_request', 'amount') IS NULL
BEGIN
    ALTER TABLE blood_request ADD amount INT NOT NULL DEFAULT 1;
END;
