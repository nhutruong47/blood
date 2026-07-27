# Blood Donation Community - Production Launch Roadmap
> **Audience:** Hospitals, Medical Centers, Blood Centers, Donors, Staff, Administrators
> **Goal:** Bring the platform from MVP to production-grade, ready for community rollout
> **Author:** AI Software Company Team

---

## 0. Executive Summary

This roadmap turns the current Spring Boot + React modular monolith into a **production-ready, healthcare-grade national blood donation platform**. The plan is organized into **9 sequential phases over an estimated 8–12 month timeline**, each delivering a shippable capability. The first 3 phases (≈3 months) unblock pilot deployment with 1–3 partner hospitals; later phases add the operational depth needed to serve a city or province.

### Current Maturity Snapshot

| Dimension | Current State | Production Target |
| --- | --- | --- |
| Architecture | Modular monolith, partial layering | Modular monolith with Clean/Hexagonal inside each module |
| Security | JWT + session mix, manual checks | Stateless JWT, method-level authorization, rotation, MFA for staff |
| Inventory | Basic CRUD, partial FEFO | Transactional FEFO reservation, locking, expiry jobs, full lifecycle |
| Hospital integration | Single request endpoint, no fulfillment | End-to-end request → reservation → dispatch → confirmation → audit |
| Donor flow | Eligibility check only | Eligibility → booking → examination → collection → certificate |
| Notifications | DB-only "realtime" | Multi-channel: in-app, email, SMS, push, WebSocket |
| Matching | Constant-score placeholder | Real donor matching with eligibility, distance, response history |
| Audit | Inconsistent, many null actors | Append-only audit with actor, IP, device, correlation ID |
| Observability | Minimal | Prometheus metrics, structured logs, request tracing, dashboards |
| Compliance | Minimal | HIPAA-style controls: consent, retention, PII handling, immutable logs |

### Pilot → Rollout Strategy

1. **Pilot (Phase 1–3):** 1 flagship hospital + 1 blood center in 1 city.
2. **District rollout (Phase 4–6):** Expand to all hospitals/centers in 1 province/district.
3. **National rollout (Phase 7–9):** Scale horizontally, integrate with national health data exchange.

---

## 1. Stakeholders & Their Needs

### 1.1 Donor (citizen)
- Find a nearby donation center quickly.
- Check eligibility in under 60 seconds.
- Book an appointment without phone calls.
- Get reminders before appointment.
- See donation history, certificate, badges.
- Be invited to donate in emergencies (opt-in).

### 1.2 Hospital Staff (blood bank, ER, surgery)
- Submit urgent blood requests from EHR or web portal.
- See real-time inventory availability in nearby centers.
- Track request status: submitted → triaged → approved → reserved → dispatched → delivered.
- Get SLA alerts for unfulfilled requests.
- Confirm delivery and usage of each unit (transfusion traceability).

### 1.3 Medical Center (Blood Center) Staff
- Manage donation campaigns, schedules, and slots.
- Run daily operations: check-in, examination, collection.
- Manage blood unit lifecycle: quarantine, lab test, release, destroy.
- Reserve and dispatch blood for hospital requests.
- Produce operational reports (donations, deferrals, inventory, expiry).

### 1.4 Lab Staff
- Record lab test results (serology, NAT, blood typing).
- Quarantine/reject/release units based on results.
- Audit trail for every test result.

### 1.5 Administrator (System/Province)
- Approve hospitals/centers.
- Manage roles and permissions.
- Monitor dashboards and alerts.
- Inspect audit logs.
- Export compliance reports.

### 1.6 Logistics/Courier
- Pick up packed units.
- Record temperature, location, time at each checkpoint.
- Confirm delivery to hospital.

---

## 2. Critical Production Gaps (Must-Fix Before Pilot)

These are blocking issues identified by the deep codebase audit. Every item has a concrete remediation.

### 2.1 Security

| # | Gap | Impact | Remediation |
|---|---|---|---|
| S-1 | `SecurityConfig` permits `/api/auth/**` but controllers use `/api/login`, `/api/register`, `/api/refresh` | Login may be blocked in production | Add explicit permit for `/api/login`, `/api/register`, `/api/refresh`, `/api/logout`, `/api/me`; add integration test |
| S-2 | Stateless JWT mixed with `HttpSession` | Inconsistent auth source, logout doesn't revoke | Remove `HttpSession` use; inject `@AuthenticationPrincipal`; use `@PreAuthorize` |
| S-3 | No refresh-token rotation/revocation | Stolen tokens usable until expiry | Rotate refresh token on every `/refresh`; revoke old; support token family reuse detection |
| S-4 | Logout doesn't revoke refresh tokens | Security regression | Delete refresh tokens on logout; optional denylist for access tokens |
| S-5 | `canReserve` uses exact blood group, `reserve` uses compatible groups | Emergency falsely routes to donor matching | Unify compatibility policy in a shared service |
| S-6 | No MFA for staff/admin accounts | Account takeover risk | Add TOTP MFA flow for STAFF, HOSPITAL_STAFF, MEDICALCENTER_STAFF, ADMIN |
| S-7 | JWT secret falls back to random per-restart | Tokens invalidated on every restart, masks misconfig | Hard-fail startup if `app.jwt-secret` is missing or < 256 bits |
| S-8 | Generic exception class name leaked in error response | Information disclosure | Replace with sanitized code/message in production profile |
| S-9 | Rate limiter trusts `X-Forwarded-For` | Spoofable per-IP limit | Restrict rate limiting to a configurable trusted-proxy list |
| S-10 | No password reset / email verification | Can't recover accounts | Build email-based verification and password reset flows |

### 2.2 Inventory & Reservations

| # | Gap | Remediation |
|---|---|---|
| I-1 | Reservation race condition (query-then-update) | Use `SELECT … FOR UPDATE SKIP LOCKED` or optimistic version check on `BloodUnit` |
| I-2 | `InventoryService` overloaded (6 responsibilities) | Split into `CollectionService`, `LabService`, `ReservationService`, `DispatchService`, `StockQueryService` |
| I-3 | No reservation expiry/release | Add `Reservation.release(reason)` + scheduled job that releases reservations older than configurable TTL |
| I-4 | Cache `bloodStock` not invalidated on mutation | Either remove the cache for stock counts or add `@CacheEvict` on every unit mutation |
| I-5 | No expired-unit job | Scheduled `@Scheduled` job: `AVAILABLE → EXPIRED` when `expiry_date < today` |
| I-6 | FEFO not globally ordered across compatible groups | Compute a single union query ordered by `expiry_date ASC` after compatibility expansion |
| I-7 | No transfusion traceability from hospital back to donor bag | Add `BloodUnitUsage` aggregate linking `BloodUnit` to recipient/patient when hospital confirms usage |

### 2.3 Identity & Access Control

| # | Gap | Remediation |
|---|---|---|
| A-1 | Single global role on `User` | Move to organization-scoped memberships (`OrganizationMember`) with multiple role assignments |
| A-2 | No permission policies | Introduce `Permission` entity + `Policy` evaluator; use `@PreAuthorize("hasAuthority('BLOOD_REQUEST_APPROVE')")` |
| A-3 | Organization ownership missing | `DonationLocation`, `BloodRequest` should reference `Organization` (not free-text name) |
| A-4 | No staff role specialization | Add roles: `DONOR`, `RECIPIENT`, `HOSPITAL_STAFF`, `MEDICALCENTER_STAFF`, `LAB_STAFF`, `COURIER`, `VOLUNTEER`, `ADMIN`, `SUPER_ADMIN` |
| A-5 | Audit actor is `null` in many calls | Pass `Authentication` everywhere; create audit context filter to capture IP, user-agent, device ID, request ID |

### 2.4 Donor Lifecycle

| # | Gap | Remediation |
|---|---|---|
| D-1 | No appointment booking | Build `Appointment` aggregate: schedule → slot → appointment → check-in |
| D-2 | No medical examination | Build `Examination` aggregate: vitals, questionnaire, decision |
| D-3 | No blood collection | Build `Collection` aggregate: links donor + appointment + staff + bag → creates `BloodUnit` |
| D-4 | Eligibility not persisted | Persist `EligibilityCheck` results and link to appointments |
| D-5 | No certificate / reward | Build `Certificate`, `RewardAccount`, `Badge` aggregates |

### 2.5 Blood Request & Emergency

| # | Gap | Remediation |
|---|---|---|
| R-1 | No request state machine (SUBMITTED → TRIAGED → APPROVED → RESERVED → DISPATCHING → DELIVERED → CLOSED) | Implement explicit transitions with validation |
| R-2 | Approval does not trigger reservation | Auto-reserve on approval; reserve transactionally with inventory |
| R-3 | No cancellation flow | Add `BloodRequest.cancel(reason)`; release reservation if any |
| R-4 | No dispatch batch / partial fulfillment | Add `Shipment` aggregate with `Package` units and `RouteCheckpoint`s |
| R-5 | No hospital confirmation of receipt | Add `DeliveryConfirmation` API; transition to `DELIVERED` only after hospital confirms |
| R-6 | No emergency escalation | Add `Emergency.escalate()` after configurable TTL without fulfillment |

### 2.6 Donor Matching

| # | Gap | Remediation |
|---|---|---|
| M-1 | Constant score (90) for every donor | Real scoring per audit §17.2 of `ENTERPRISE_BUSINESS_WORKFLOW_DESIGN.md` |
| M-2 | Doesn't compute distance | Use `GeoService` with Haversine or Google Distance Matrix |
| M-3 | Doesn't check eligibility / last donation | Reuse `EligibilityService` rules + read `DonationRegistration.history` |
| M-4 | Only exact blood group | Respect `BloodCompatibilityService` rules for component-aware matching |
| M-5 | Synchronous, in-transaction | Move to async with `@Async` + run with pagination for large donor bases |
| M-6 | No recommendation status / donor response | Add `DonorMatchRecommendation.status` and `POST /api/matching/{id}/respond` |

### 2.7 Notifications

| # | Gap | Remediation |
|---|---|---|
| N-1 | Notifications are DB-only | Add delivery adapters: in-app polling API, WebSocket/SSE, email, SMS, push |
| N-2 | No read API | Add `GET /api/notifications`, `POST /api/notifications/{id}/read` |
| N-3 | No retry/dead-letter | Outbox pattern + scheduled retry; dead-letter table for poison messages |
| N-4 | No templates / localization | Thymeleaf/Freemarker templates + i18n bundles |
| N-5 | No opt-in/opt-out | `NotificationPreference` per user/channel |

### 2.8 Observability & Operations

| # | Gap | Remediation |
|---|---|---|
| O-1 | No correlation/request IDs | Add `MDC` filter, propagate through logs and events |
| O-2 | Minimal metrics | Spring Boot Actuator + Micrometer + Prometheus; business metrics for reservation, donation, emergency |
| O-3 | No tracing | OpenTelemetry SDK; auto-instrument JDBC, HTTP, async |
| O-4 | No structured logging | Logback JSON encoder; ship to ELK/Loki |
| O-5 | No SLA alerting | Alerts on emergency request age, low stock, failed deliveries |

### 2.9 Compliance & Audit

| # | Gap | Remediation |
|---|---|---|
| C-1 | Audit actor `null` everywhere | Audit context filter captures real principal + IP + device + correlation ID |
| C-2 | Free-form text fields hold medical info | Move to structured models; encrypt at rest where sensitive |
| C-3 | No retention policy | Define retention per aggregate; scheduled job purges |
| C-4 | No consent | Add `Consent` aggregate for marketing comms, emergency matching opt-in |
| C-5 | Audit mutable | Append-only at DB level (revoke UPDATE/DELETE permissions on `audit_events`) |

---

## 3. Target Architecture

### 3.1 Modular Monolith with Hexagonal Layers

Each module follows the same internal structure:

```text
module/
├── api/             # Inbound adapters (REST controllers, request/response DTOs)
├── application/     # Use cases, commands/queries, orchestrators
│   ├── command/     # Write use cases
│   ├── query/       # Read use cases (CQRS-lite)
│   ├── event/       # Internal domain event handlers
│   └── mapper/      # DTO ↔ domain mapping
├── domain/          # Pure business model (no Spring/JPA annotations beyond JPA on entities)
│   ├── model/       # Aggregates, entities, value objects
│   ├── policy/      # Business rules (eligibility, compatibility, FEFO, scoring)
│   ├── event/       # Domain events
│   └── exception/   # Domain exceptions
└── infrastructure/  # Outbound adapters (JPA repositories, external integrations)
    ├── persistence/ # Spring Data repositories, query objects
    ├── messaging/  # Event publishers, outbox
    └── integration/ # Email/SMS/push, payment, etc.
```

### 3.2 Cross-Cutting Concerns

```text
shared/
├── api/             # ApiResponse, PageResponse, ProblemDetail
├── config/          # SecurityConfig, JpaConfig, AsyncConfig, CacheConfig, OpenApiConfig
├── domain/          # BaseAuditEntity, common enums
├── exception/       # BusinessException, ErrorCode, GlobalExceptionHandler
├── security/        # JwtAuthenticationFilter, JwtTokenProvider, SecurityAuditorAware
├── web/             # CorrelationIdFilter, AuditContextFilter, RequestLoggingFilter
├── observability/   # MetricsConfig, TracingConfig, StructuredLoggingConfig
└── outbox/          # Outbox pattern for reliable event delivery
```

### 3.3 Module Dependencies (target)

```text
identity ← (used by) all
organization ← (used by) hospital, medicalcenter, donation, bloodrequest
hospital ← bloodrequest, emergency
medicalcenter ← donation, inventory, bloodrequest
donation → inventory (creates BloodUnit)
inventory → bloodrequest (reservation), shipment
bloodrequest → emergency, matching, notification
emergency → inventory, matching, notification, shipment
matching → notification
notification → identity
audit ← all
geo ← donation, matching, shipment
seo ← donation, organization
```

Rule: **dependencies flow inward only** (toward the domain). No module can access another's JPA entities directly — they go through application services and shared event payloads.

---

## 4. 9-Phase Roadmap

Each phase is **independently shippable** but builds on the previous. Estimated effort is shown for a 4-person team.

### Phase 1 — Foundation & Security Hardening (Month 1)

**Goal:** Make the platform deployable safely.

**Deliverables:**
- S-1 to S-10 from §2.1 completed.
- `@PreAuthorize` migration: remove `SessionUser` from controllers.
- Add correlation/request ID filter and MDC propagation.
- Add Spring Boot Actuator + Micrometer + Prometheus.
- Add structured JSON logging.
- Hardened `SecurityConfig` with environment-driven CORS, JWT secret validation, denied-by-default policy.
- Refresh-token rotation with family detection.
- Backend integration tests for: auth flow, role enforcement, concurrent reservation safety net (mocked).

**Acceptance criteria:**
- Auth fails closed if `JWT_SECRET` is missing or weak.
- `/refresh` returns new refresh token; old is rejected after rotation.
- All controllers return 403 (not 401) for forbidden, 401 for unauthenticated.
- Prometheus endpoint exposes `http_server_requests_seconds`, custom business metrics.

**Effort:** 3 weeks.

---

### Phase 2 — Inventory Hardening & Lab Workflow (Month 2)

**Goal:** Inventory becomes transactional, auditable, lifecycle-complete.

**Deliverables:**
- I-1 to I-7 from §2.2 completed.
- Split `InventoryService` into 5 services.
- New `LabTest` flow: record test → finalization policy → release/reject/destroy.
- Add `BloodUnitUsage` for transfusion traceability.
- Add `Reservation.expireAt` + scheduled expiry job.
- Add `@CacheEvict` on every inventory mutation.
- Concurrency tests: 50 concurrent reservations, only correct count succeeds.

**Acceptance criteria:**
- 50 concurrent `/api/inventory/reserve` requests for 10 units result in exactly 10 reserved units, 40 fail with proper error.
- Expired units automatically transition to `EXPIRED` status nightly.
- Lab test panel finalization requires all required tests passed before `RELEASED`.

**Effort:** 4 weeks.

---

### Phase 3 — Hospital & Medical Center Organization (Month 3)

**Goal:** Hospitals and blood centers have real organizational identity.

**Deliverables:**
- A-1 to A-5 from §2.3 completed.
- New `Organization` aggregate with verification lifecycle (`PENDING_VERIFICATION → VERIFIED / REJECTED / SUSPENDED`).
- New `OrganizationMember` with role assignment per organization.
- Hospital registration + verification flow with admin approval.
- Medical center registration + capability declaration.
- Replace free-text `medicalCenterName` in `DonationRegistration` and `BloodRequest` with `organizationId`.
- Add organization-scoped permissions.

**Acceptance criteria:**
- A hospital user can only create blood requests under their own organization.
- Admin can verify, reject (with reason), or suspend an organization.
- Membership changes are audited.

**Effort:** 4 weeks. **Pilot launch possible at end of Phase 3.**

---

### Phase 4 — Donor Booking, Examination & Collection (Month 4)

**Goal:** Donors can complete the full appointment-to-bag flow.

**Deliverables:**
- D-1 to D-5 from §2.4 completed.
- New `Appointment` aggregate with state machine (DRAFT → BOOKED → CHECKED_IN → SCREENING → APPROVED/DEFERRED → COLLECTED → COMPLETED).
- New `MedicalExamination` aggregate (vitals, questionnaire, deferral reasons).
- New `BloodCollection` aggregate that creates a `BloodUnit`.
- Schedule capacity enforcement and booking conflict prevention.
- Donor dashboard: history, upcoming appointments, certificates.
- Eligibility persistence + linking to appointments.
- Email/SMS confirmation and reminder (24h, 2h before).

**Acceptance criteria:**
- A donor can book, receive reminders, check in, complete examination, donate, and receive a certificate — all in one session.
- Schedule capacity is enforced atomically; overbooking is impossible.

**Effort:** 5 weeks.

---

### Phase 5 — Blood Request Lifecycle & Fulfillment (Month 5)

**Goal:** End-to-end hospital request flow with shipment.

**Deliverables:**
- R-1 to R-6 from §2.5 completed.
- New `Shipment` aggregate with `RouteCheckpoint` and cold-chain temperature tracking.
- Blood request state machine fully enforced.
- Auto-reservation on request approval.
- Hospital confirmation of receipt → `DELIVERED`.
- Courier role + courier app/portal.
- Transfusion traceability: hospital links received unit to patient outcome.

**Acceptance criteria:**
- Hospital submits request → system reserves units → courier picks up → hospital confirms receipt → audit chain complete.
- SLA alerts fire when critical request exceeds configurable age.

**Effort:** 4 weeks.

---

### Phase 6 — Donor Matching & Emergency Workflow (Month 6)

**Goal:** Real donor matching engine and full emergency lifecycle.

**Deliverables:**
- M-1 to M-6 from §2.6 completed.
- Real scoring using audit §17.2 weighting.
- Distance calculation via `GeoService` (Haversine MVP, Google Distance Matrix in Phase 7).
- Eligibility-aware filtering (re-use `EligibilityService`).
- Donor response workflow: `POST /api/matching/{id}/respond` with accept/decline.
- Emergency state machine: `EMERGENCY_RECEIVED → INVENTORY_CHECK → RESERVED | MATCHING_DONOR → DONOR_CONFIRMED → COLLECTION_PENDING → RESERVED → DISPATCHING → DELIVERED → CLOSED`.
- Emergency escalation timer.

**Acceptance criteria:**
- An emergency with no stock automatically ranks donors by distance, eligibility, last donation interval.
- Top 20 donors receive SMS + push + in-app notification within 60 seconds.
- Donor response updates the emergency in real time.

**Effort:** 5 weeks.

---

### Phase 7 — Notification Platform (Month 7)

**Goal:** Multi-channel notifications with delivery guarantees.

**Deliverables:**
- N-1 to N-5 from §2.7 completed.
- Outbox pattern + scheduled dispatcher.
- Email adapter (SendGrid/AWS SES/SMTP).
- SMS adapter (Twilio/VNPT local provider).
- WebSocket/SSE for in-app realtime.
- Push notification adapter (Firebase).
- Notification preference center.
- Delivery status tracking with retry and dead-letter.

**Acceptance criteria:**
- 99% of notifications delivered within 5 minutes.
- Failed notifications retry up to 3 times then dead-letter.
- Users can configure opt-in per channel.

**Effort:** 4 weeks.

---

### Phase 8 — Observability, Reporting & Analytics (Month 8)

**Goal:** Operational visibility and insights.

**Deliverables:**
- O-1 to O-5 from §2.8 completed.
- OpenTelemetry tracing across HTTP, JDBC, async.
- Grafana dashboards: donations, inventory, requests, emergencies, audits.
- Reports: donation, inventory, hospital, donor, emergency, transportation, audit.
- Analytics aggregations: national blood availability, critical shortage heatmap, donor retention, response time, expiry forecast, geo demand/supply.
- Scheduled exports (CSV/PDF) for compliance.

**Acceptance criteria:**
- Dashboards render real-time data with < 30s freshness.
- All scheduled reports run nightly without operator intervention.

**Effort:** 4 weeks.

---

### Phase 9 — Compliance, Hardening & National Rollout (Month 9–12)

**Goal:** Production-grade security, compliance, and scale.

**Deliverables:**
- C-1 to C-5 from §2.9 completed.
- MFA (TOTP) for all staff/admin accounts.
- Append-only audit at DB level.
- Consent management for donors.
- Data retention policies and scheduled purge jobs.
- PII encryption at rest (column-level or TDE).
- GDPR / Vietnamese Personal Data Protection Act (PDPA) compliance review.
- Penetration test + remediation.
- Disaster recovery plan + backups (RPO ≤ 1h, RTO ≤ 4h).
- Multi-region deployment (active-passive).
- Load test: 10,000 concurrent users, 1,000 RPS.

**Acceptance criteria:**
- Pen test report shows no critical/high vulnerabilities.
- Backup/restore drill passes.
- Load test passes target SLOs.

**Effort:** 8–12 weeks.

---

## 5. Frontend Roadmap (parallel to backend)

### F-1 (Month 1): Foundation
- Wire all public pages to backend APIs (already started).
- Authentication state management with refresh-token rotation.
- Role-based routing.
- Accessibility audit (WCAG AA).

### F-2 (Month 2): Donor Experience
- Appointment booking flow with slot picker.
- Profile & health history.
- Eligibility result persistence.
- Notification inbox.

### F-3 (Month 3): Hospital Portal
- Hospital dashboard with inventory visibility.
- Request submission form (with typeahead for inventory check).
- Request tracking with real-time status.
- Delivery confirmation form.

### F-4 (Month 4): Medical Center Portal
- Daily appointment board.
- Check-in screen.
- Examination form (vitals, questionnaire).
- Collection form with bag code entry.
- Lab test result entry.
- Inventory management UI.

### F-5 (Month 5): Admin Portal
- Organization approval queue.
- User management with role assignment.
- Audit log search/export.
- Dashboard with KPIs.

### F-6 (Month 6): Emergency & Matching
- Emergency console for staff.
- Donor matching visualization.
- Donor response UI.

### F-7 (Month 7): Notifications
- Real-time notification toasts.
- Notification preferences.
- Push notification opt-in.

### F-8 (Month 8): Analytics
- Dashboards (donations, inventory, emergencies).
- Report download center.

---

## 6. Operational Readiness

### 6.1 Infrastructure

- **Compute:** 2× backend instances behind load balancer, 2× frontend instances, sticky sessions disabled.
- **Database:** SQL Server Always On or PostgreSQL with Patroni; daily full + hourly incremental backups.
- **Cache:** Redis Cluster (replaces Caffeine for distributed cache).
- **Object storage:** For certificates, reports, lab PDFs.
- **Message broker:** RabbitMQ or Kafka for outbox dispatch + async work.

### 6.2 Environments

| Env | Purpose | Data |
|---|---|---|
| Local | Developer machine | Seeded |
| Dev | Shared dev | Synthetic |
| Staging | Pre-prod pilot | Anonymized prod-like |
| Pilot | 1 hospital + 1 center | Real |
| Prod | Production | Real, encrypted, backed up |

### 6.3 CI/CD

- GitHub Actions or GitLab CI.
- Pipeline: lint → unit test → integration test (Testcontainers) → build → scan (Trivy/Snyk) → deploy.
- Database migrations via Flyway, gated by approval.
- Blue-green deployment.

### 6.4 SLOs

| Metric | Target |
|---|---|
| API availability | 99.9% (43.2 min downtime/month) |
| P95 latency (public) | < 500 ms |
| P95 latency (authenticated) | < 800 ms |
| Emergency request triage | < 60 s |
| Inventory reservation | < 200 ms |
| Notification delivery | 95% within 5 min |

---

## 7. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Pilot hospital data leak | Low | Critical | MFA + audit + encryption + pen test before pilot |
| Concurrency bug in reservation | Medium | High | Comprehensive concurrency tests; pessimistic lock + optimistic version |
| SMS/Email provider outage | Medium | Medium | Multi-provider failover; outbox retry |
| Donor matching returns unsafe donors | Medium | Critical | Reuse `EligibilityService`; never override medical safety |
| Vietnam PDPA non-compliance | Medium | High | Consent management; data retention; legal review in Phase 9 |
| Donor emergency opt-out backlash | Low | Medium | Clear opt-in UI; opt-out respected; legal basis documented |
| Hospital staff adoption resistance | Medium | High | On-site training; integration with hospital EHR where possible |

---

## 8. Budget & Team (indicative)

### Team
- 1 Tech Lead / Architect
- 2 Backend Engineers (Java/Spring)
- 2 Frontend Engineers (React/TypeScript)
- 1 DevOps / SRE
- 1 QA / SDET
- 1 Product Owner / Business Analyst (healthcare domain)
- 0.5 Security Engineer (Phase 9)

### Indicative monthly run-rate
- Salaries + benefits: dominant cost.
- Cloud infra (prod): $500–2,000/month.
- Third-party services (SMS, email, maps): $200–1,000/month at pilot scale.

---

## 9. Success Metrics

### Pilot (after Phase 3, Month 3)
- 1 hospital onboarded.
- 50+ donor registrations.
- 100+ appointment bookings.
- 80+ successful donations.
- 10+ hospital requests fulfilled.

### District rollout (after Phase 6, Month 6)
- 5+ hospitals, 3+ centers.
- 1,000+ active donors.
- 500+ monthly donations.
- < 5% appointment no-show rate.
- 100% SLA compliance for emergency requests.

### National rollout (after Phase 9, Month 12)
- 100+ hospitals, 30+ centers.
- 100,000+ active donors.
- 10,000+ monthly donations.
- 99.9% API availability.
- < 1% data quality defect rate.

---

## 10. Immediate Next Steps (this week)

1. **S-1 + S-7:** Fix `SecurityConfig` permit list and hard-fail on missing JWT secret. ✅ Add integration test.
2. **S-5:** Unify `canReserve` and `reserve` compatibility policy.
3. **I-1:** Add pessimistic lock on reservation path.
4. **A-5:** Add audit context filter capturing IP, user-agent, device ID.
5. **O-1:** Add correlation ID filter and MDC propagation.
6. **F-1:** Finish wiring all public pages to backend APIs (in progress).
7. **Docs:** Lock the architecture decisions; create ADR (architecture decision records).
8. **Pilot partner:** Identify the flagship hospital and blood center for pilot.

---

## Appendix A — Mapping to Existing Code

| Existing file | Phase | Action |
|---|---|---|
| `AuthService.java` | 1 | Refresh rotation, MFA |
| `JwtTokenProvider.java` | 1 | Hard-fail on missing secret |
| `SecurityConfig.java` | 1 | Add explicit permits for `/api/login`, `/api/register`, `/api/refresh`; remove `SessionUser` use |
| `SessionUser.java` | 1 | Delete |
| `EmergencyRequestService.java` | 1, 6 | Fix compatibility; orchestrate async |
| `InventoryService.java` | 2 | Split into 5 services; add locking |
| `DonationRegistration.java` | 4 | Link to Organization; add state machine |
| `BloodRequest.java` | 5 | State machine; auto-reservation |
| `DonorMatchingService.java` | 6 | Real scoring; async |
| `NotificationService.java` | 7 | Add outbox + adapters |
| `AuditService.java` | 1, 9 | Capture full context; append-only |
| `SeoService.java` | ongoing | Trust proxy headers; add `lastmod` |

---

## Appendix B — Suggested Team Working Agreements

- **Domain language:** use ubiquitous language in code (e.g., `DonationAppointment`, not `Booking`).
- **Tests:** every PR requires unit tests; every state transition needs an integration test.
- **Migrations:** Flyway only, never `ddl-auto=update` in prod.
- **No silent failures:** all catch blocks log + audit + (where appropriate) notify.
- **Security:** every endpoint has explicit permission; deny by default.
- **Observability:** every service emits metrics for happy + error paths.

---

**End of roadmap. Next milestone: end of Phase 1 (Month 1) — pilot launch decision gate.**