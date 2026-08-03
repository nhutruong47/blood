# Blood Project Fix Report

## 1. Executive Summary

Before the fix, the project was a Spring Boot prototype with session auth, plaintext password comparison, SQL Server credentials committed in `application.properties`, controller responses returning strings/entities, no independent test profile, incomplete donor/request workflows, no inventory, and no versioned database migrations.

After the fix, the backend has session-based Spring Security, BCrypt password storage, DTO-based APIs, validation, standardized exceptions, enum statuses, donor/staff/medical-center/admin workflows, blood inventory with transaction history, Flyway migrations, API documentation, and 14 passing tests using H2 in-memory.

## 2. Baseline

Initial dirty files that existed before this work:

```text
blood/src/main/java/com/nhutruong/blood/BloodApplication.java
blood/src/main/java/com/nhutruong/blood/entity/DonationRegistration.java
```

Baseline commands:

| Command | Result | Notes |
| --- | --- | --- |
| `.\mvnw.cmd -DskipTests package` | PASS | Source compiled before fixes. |
| `.\mvnw.cmd test` | FAILED | SQL Server login failed for local `sa` credential. |

See `docs/BASELINE_BEFORE_FIX.md`.

## 3. Security Fixes

- Removed hard-coded database password from tracked config.
- Added `.env.example` with placeholders only.
- Added Spring Security with session authentication.
- Added `PasswordEncoder` using BCrypt.
- New registrations store BCrypt hashes.
- Existing plaintext passwords can be migrated once with `PASSWORD_MIGRATION_ENABLED=true`.
- Login regenerates the session id.
- Protected endpoints return `401` if unauthenticated and `403` for wrong roles.
- `User.password` and `User.confirmPassword` are ignored in JSON.
- API responses use `UserResponse` instead of returning `User` entity directly.

## 4. API and DTO Changes

Added DTOs for auth, donation registration, blood request, location, schedule, inventory, admin user management, audit log and standard API responses.

Deprecated endpoint:

```text
POST /api/request-blood
```

Replacement endpoint:

```text
POST /api/medicalcenter/request
```

The deprecated endpoint now delegates to the same service logic.

## 5. Validation

Implemented validation for:

- Email/password/register fields.
- Blood group format.
- Donation date not in the past.
- Donation age/weight/amount thresholds.
- Blood request urgency enum and positive amount.
- Location name/address.
- Schedule start/end/capacity.
- Admin role/status payloads.

Medical rules still need confirmation by an authorized medical/business stakeholder before real-world use.

## 6. Donation Workflow

Implemented:

```text
DONOR creates donation registration
-> status PENDING
-> STAFF approves or rejects
-> STAFF completes approved donation
-> system creates DONATION_IN inventory transaction
-> system increases inventory exactly once
```

Statuses:

```text
PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED
```

## 7. Blood Request Workflow

Implemented:

```text
MEDICALCENTER creates request
-> status PENDING
-> STAFF approves or rejects
-> STAFF fulfills approved/processing request
-> system checks compatible inventory
-> system creates REQUEST_OUT transaction
-> system decreases inventory
-> request becomes FULFILLED
```

Statuses:

```text
PENDING, APPROVED, REJECTED, PROCESSING, FULFILLED, CANCELLED
```

## 8. Inventory

Added:

- `BloodInventory`
- `BloodInventoryTransaction`
- `BloodInventoryService`

Controls:

- Unique inventory row per blood group.
- Optimistic lock field through `@Version`.
- No negative inventory.
- Donation completion is idempotent through transaction reference checks.
- Blood request fulfillment is idempotent through transaction reference checks.
- Every inventory change creates transaction history.

## 9. Database Migration

Added Flyway migrations:

```text
V1__baseline_schema.sql
V2__add_status_enums.sql
V3__add_inventory_tables.sql
V4__add_audit_fields.sql
V5__add_user_status.sql
```

See `docs/DATABASE_MIGRATION_GUIDE.md`.

## 10. Tests

| Test Group | Count | Passed | Failed |
| --- | ---: | ---: | ---: |
| Context | 1 | 1 | 0 |
| Compatibility unit | 3 | 3 | 0 |
| Auth service | 3 | 3 | 0 |
| API security/validation | 4 | 4 | 0 |
| Workflow/inventory service | 3 | 3 | 0 |
| Total | 14 | 14 | 0 |

## 11. Build Results

| Command | Result | Notes |
| --- | --- | --- |
| `.\mvnw.cmd test` | PASS | 14 tests, H2 test profile. |
| `.\mvnw.cmd clean package` | PASS | Full package with tests. |

## 12. Changed Files

Major changed areas:

| Area | Files |
| --- | --- |
| Config | `pom.xml`, `application.properties`, `.gitignore`, `.env.example`, `application-test.properties` |
| Security | `security/SecurityConfig.java`, `security/SessionAuthenticationFilter.java` |
| DTO | `dto/*` |
| Entity/enums | `User`, `DonationRegistration`, `BloodRequest`, `DonationSchedule`, inventory/audit entities, `enums/*` |
| Repository | Added inventory/audit repositories and query methods |
| Service | Auth, donation, blood request, inventory, location, admin, audit, compatibility, current user |
| Controller | Auth, donor, medical center, staff, location, admin |
| Migration | `src/main/resources/db/migration/*` |
| Tests | `ApiSecurityTests`, `AuthServiceTests`, `BloodCompatibilityServiceTests`, `WorkflowServiceTests`, updated `BloodApplicationTests` |
| Docs | `docs/BASELINE_BEFORE_FIX.md`, `docs/API_ENDPOINTS.md`, `docs/DATABASE_MIGRATION_GUIDE.md`, `PROJECT_FIX_REPORT.md` |

## 13. Remaining Risks

- Blood compatibility rules are implemented as a centralized service but must be verified by authorized medical stakeholders.
- Flyway migrations are SQL Server oriented and should be tested against a backup/staging copy before production.
- Existing plaintext passwords require one-time migration with `PASSWORD_MIGRATION_ENABLED=true`.
- There is still no frontend in this repository.
- Pagination/filtering is documented as a future improvement for list endpoints.
- Concurrent fulfillment has optimistic locking support, but a heavier multi-thread integration test should be added before high-traffic production use.

## 14. Manual Setup

Required environment variables:

```powershell
$env:DB_URL="jdbc:sqlserver://localhost:1433;databaseName=blood;encrypt=true;trustServerCertificate=true"
$env:DB_USERNAME="your_database_user"
$env:DB_PASSWORD="your_database_password"
$env:JPA_DDL_AUTO="validate"
$env:FLYWAY_ENABLED="true"
```

Run tests:

```powershell
.\mvnw.cmd test
```

Run app:

```powershell
.\mvnw.cmd spring-boot:run
```

Swagger:

```text
/swagger-ui/index.html
/v3/api-docs
```

## 15. Final Git Status

Two original dirty changes were preserved:

```text
BloodApplication.java: removed debug print
DonationRegistration.java: original blank-line change
```

New changes from this implementation are the security/config/workflow/test/docs updates listed above.
