# Implementation Alignment

This note tracks code changes made to align the application with the architecture, ERD, and workflow documents.

## Implemented

- Added `identity.domain.UserProfile` as a separate profile table linked one-to-one with `users`.
- Added profile fields from the ERD/business docs:
  - `phone`
  - `birthDate`
  - `gender`
  - `address`
  - `latitude`
  - `longitude`
  - `emergencyAlertOptIn`
  - `lastDonationDate`
  - `nextEligibleDate`
- Added `GET /api/profile` and `PUT /api/profile` for authenticated users.
- New donor registration now creates a default profile.
- Local H2 seed data now includes donation locations, schedules, and user profiles.
- Test profile now runs with H2 and Flyway disabled so backend tests do not require SQL Server.
- Public donation centers have local seed data for Ho Chi Minh City and Ha Noi.
- Frontend profile page now reads real profile data from the backend.
- Frontend eligibility check now matches the backend eligibility DTO.

## Verified

- Backend: `./mvnw.cmd test`
- Frontend: `npm run build`
- Runtime API smoke:
  - `POST /api/register`
  - `POST /api/login`
  - `GET /api/profile`
  - `PUT /api/profile`

## Remaining High-Value Work

- Convert schema management from `ddl-auto` to Flyway migrations for the live SQL Server schema.
- Expand RBAC from enum-only roles to `roles`, `permissions`, `user_roles`, and `role_permissions`.
- Add appointment, examination, collection, certificate, reward, report, and analytics modules from the business workflow document.
- Add profile-aware donor matching rules using `emergencyAlertOptIn`, distance, last donation date, and eligibility state.
- Add frontend settings form support for editing the new profile fields.
