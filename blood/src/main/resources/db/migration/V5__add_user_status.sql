IF COL_LENGTH('users', 'status') IS NULL
BEGIN
    ALTER TABLE users ADD status NVARCHAR(50) NULL;
END;

UPDATE users
SET status = 'ACTIVE'
WHERE status IS NULL OR status = '';

IF COL_LENGTH('donation_schedule', 'start_time') IS NULL
BEGIN
    ALTER TABLE donation_schedule ADD start_time DATETIME2 NULL;
END;

IF COL_LENGTH('donation_schedule', 'end_time') IS NULL
BEGIN
    ALTER TABLE donation_schedule ADD end_time DATETIME2 NULL;
END;

IF COL_LENGTH('donation_schedule', 'capacity') IS NULL
BEGIN
    ALTER TABLE donation_schedule ADD capacity INT NULL;
END;

UPDATE donation_schedule
SET start_time = donation_time
WHERE start_time IS NULL AND donation_time IS NOT NULL;
