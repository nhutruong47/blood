# Database Migration Guide

This project now uses Flyway for versioned database changes.

## Before Running Migrations

1. Back up the target database.
2. Confirm the application is pointed at the intended database.
3. Set environment variables instead of committing credentials:

```powershell
$env:DB_URL="jdbc:sqlserver://localhost:1433;databaseName=blood;encrypt=true;trustServerCertificate=true"
$env:DB_USERNAME="your_database_user"
$env:DB_PASSWORD="your_database_password"
$env:JPA_DDL_AUTO="validate"
$env:FLYWAY_ENABLED="true"
```

## Migration Files

```text
V1__baseline_schema.sql
V2__add_status_enums.sql
V3__add_inventory_tables.sql
V4__add_audit_fields.sql
V5__add_user_status.sql
```

## Legacy Data Handling

`DonationRegistration.approved` is preserved temporarily for compatibility, but the source of truth is now:

```text
DonationRegistration.status
```

Migration behavior:

```text
approved false/null -> PENDING
approved true       -> APPROVED
old/unknown blood_request.status -> PENDING
old/unknown blood_request.urgency -> MEDIUM
```

## Password Migration

New passwords are stored with BCrypt. For existing development/local data that still contains plaintext passwords, run the application once with:

```powershell
$env:PASSWORD_MIGRATION_ENABLED="true"
```

The migration service hashes any user password that does not look like a BCrypt value. Turn this flag back off after the one-time run.

## Test Profile

Tests use:

```text
src/test/resources/application-test.properties
```

The test profile uses H2 in-memory and does not connect to SQL Server.

## Production Notes

- Keep `JPA_DDL_AUTO=validate`.
- Keep secrets in environment variables or a secrets manager.
- Do not enable Swagger publicly unless protected by network/auth controls.
- Do not run destructive SQL against real data without a tested backup and rollback plan.
