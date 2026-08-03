# API Endpoints

All protected endpoints use session authentication. Public endpoints are `POST /api/register` and `POST /api/login`.

## Authentication

| Method | Path | Role | Notes |
| --- | --- | --- | --- |
| POST | `/api/register` | Public | Creates a DONOR account. Client cannot choose role. |
| POST | `/api/login` | Public | Creates/regenerates session and returns safe user DTO. |
| GET | `/api/me` | Authenticated | Returns current user without password/hash. |
| POST | `/api/logout` | Authenticated | Invalidates session. |

## Donor

| Method | Path | Role | Notes |
| --- | --- | --- | --- |
| POST | `/api/donate/register` | DONOR | Creates donation registration with PENDING status. |
| GET | `/api/donate/my-registrations` | DONOR | Lists only current donor registrations. |
| GET | `/api/donate/my-registrations/{id}` | DONOR | Returns only current donor registration; other owners get 403. |

## Medical Center

| Method | Path | Role | Notes |
| --- | --- | --- | --- |
| POST | `/api/medicalcenter/request` | MEDICALCENTER | Creates blood request with PENDING status. |
| GET | `/api/medicalcenter/my-requests` | MEDICALCENTER | Lists only current center requests. |
| POST | `/api/medicalcenter/locations` | MEDICALCENTER | Creates owned donation location. |
| POST | `/api/medicalcenter/locations/{id}/schedules` | MEDICALCENTER | Adds schedule only to owned location. |

## Staff

| Method | Path | Role | Notes |
| --- | --- | --- | --- |
| GET | `/api/staff/donations` | STAFF | Lists donation registrations. |
| PATCH | `/api/staff/donations/{id}/approve` | STAFF | PENDING -> APPROVED. |
| PATCH | `/api/staff/donations/{id}/reject` | STAFF | PENDING -> REJECTED; reason required. |
| PATCH | `/api/staff/donations/{id}/complete` | STAFF | APPROVED -> COMPLETED and creates DONATION_IN. |
| GET | `/api/staff/requests` | STAFF | Lists PENDING blood requests. |
| PATCH | `/api/staff/requests/{id}/approve` | STAFF | PENDING -> APPROVED. |
| PATCH | `/api/staff/requests/{id}/reject` | STAFF | PENDING -> REJECTED; reason required. |
| PATCH | `/api/staff/requests/{id}/fulfill` | STAFF | APPROVED/PROCESSING -> FULFILLED and creates REQUEST_OUT. |
| POST | `/api/staff/process-request/{id}` | STAFF | Deprecated compatibility endpoint. |

## Inventory

| Method | Path | Role | Notes |
| --- | --- | --- | --- |
| GET | `/api/staff/inventory` | STAFF/ADMIN | Lists current inventory. |
| GET | `/api/staff/inventory/transactions` | STAFF/ADMIN | Lists inventory transaction history. |
| POST | `/api/staff/inventory/adjustments` | STAFF/ADMIN | Manual adjustment; reason required. |

## Admin

| Method | Path | Role | Notes |
| --- | --- | --- | --- |
| GET | `/api/admin/users` | ADMIN | Lists users without password/hash. |
| GET | `/api/admin/users/{id}` | ADMIN | User detail without password/hash. |
| PATCH | `/api/admin/users/{id}/role` | ADMIN | Updates role; protects last active admin. |
| PATCH | `/api/admin/users/{id}/status` | ADMIN | ACTIVE/DISABLED/LOCKED; protects last active admin. |
| GET | `/api/admin/audit-logs` | ADMIN | Lists audit logs. |

## Deprecated Endpoint

| Method | Path | Replacement |
| --- | --- | --- |
| POST | `/api/request-blood` | `POST /api/medicalcenter/request` |

## HTTP Status Rules

```text
400 validation error
401 unauthenticated
403 wrong role or ownership violation
404 missing resource
409 conflict
422 business rule violation
500 unexpected server error without stack trace
```
