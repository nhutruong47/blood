IF OBJECT_ID('blood_inventory', 'U') IS NULL
BEGIN
    CREATE TABLE blood_inventory (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        blood_group NVARCHAR(10) NOT NULL,
        available_amount INT NOT NULL DEFAULT 0,
        reserved_amount INT NOT NULL DEFAULT 0,
        updated_at DATETIME2 NULL,
        version BIGINT NULL
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uk_blood_inventory_group' AND object_id = OBJECT_ID('blood_inventory'))
BEGIN
    CREATE UNIQUE INDEX uk_blood_inventory_group ON blood_inventory(blood_group);
END;

IF OBJECT_ID('blood_inventory_transaction', 'U') IS NULL
BEGIN
    CREATE TABLE blood_inventory_transaction (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        blood_group NVARCHAR(10) NOT NULL,
        transaction_type NVARCHAR(50) NOT NULL,
        amount INT NOT NULL,
        balance_before INT NOT NULL,
        balance_after INT NOT NULL,
        reference_type NVARCHAR(100),
        reference_id BIGINT,
        created_by_id BIGINT NULL,
        created_at DATETIME2,
        note NVARCHAR(1000),
        CONSTRAINT fk_inventory_transaction_created_by FOREIGN KEY (created_by_id) REFERENCES users(id)
    );
END;
