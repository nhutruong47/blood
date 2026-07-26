# Blood Donation Community - Product UX/UI Design System

## UX Improvement List

This checklist defines the product-level UX priorities for the national blood donation platform. It should guide frontend design, user research, product backlog refinement, and QA acceptance.

| Priority | Improvement | Target users | Primary surfaces | Acceptance criteria |
| --- | --- | --- | --- | --- |
| P0 | Make "Find donation center" the strongest public CTA. | Donors, first-time visitors | Landing page, mobile home, navbar | CTA appears above the fold, uses primary visual hierarchy, supports location permission and manual search fallback. |
| P0 | Add eligibility checker before booking. | Donors | Landing page, donor dashboard, appointment flow | Users answer health/safety questions before appointment selection; result is clear, accessible, and explains next steps. |
| P0 | Add emergency request path for hospitals and public users. | Hospitals, recipients, caregivers | Landing page, emergency request page, hospital dashboard | Emergency path is visible, fast, and separates verified hospital requests from public assistance requests. |
| P0 | Add map based center discovery. | Donors, recipients | Donation locations, landing page, donor dashboard | Users can search by current location, address, radius, blood center type, open hours, and availability. |
| P1 | Add blood compatibility education. | Donors, recipients, public users | Landing page, education, request flow | Compatibility information is interactive, plain-language, and available near donation/request decisions. |
| P1 | Add donor impact tracking. | Donors | Donor dashboard, history, notifications | Dashboard shows donation count, estimated impact, badges, certificates, and follow-up milestones. |
| P1 | Add hospital shortage visibility. | Hospitals, staff, admins | Hospital dashboard, admin analytics | Inventory shortage states are visible by blood group, urgency, expiry, and trend. |
| P1 | Add staff workflow optimized for speed. | Medical staff | Staff dashboard, daily appointments, check-in, screening | Common tasks require minimal clicks, support keyboard navigation, and expose clear next actions. |
| P1 | Add audit logs and role clarity for enterprise trust. | Admins, hospitals, compliance teams | Admin dashboard, user management, settings | Every sensitive action has actor/time/entity metadata; users can understand permissions and role boundaries. |
| P0 | Add accessibility from the foundation, not as cleanup later. | All users | Entire product | WCAG AA contrast, keyboard support, focus states, semantic labels, reduced motion, and responsive behavior are included in design review. |

## UX Principles

- The public experience must always answer: where can I donate, am I eligible, and what should I do next?
- Clinical/staff experiences should prioritize speed, accuracy, and low cognitive load.
- Emergency states must be highly visible but not visually chaotic.
- Trust signals should be present near high-risk decisions: verification, hospital identity, privacy, audit, and medical guidance.
- Accessibility is a design constraint, not a post-release task.

## Primary CTA Hierarchy

Public pages:

1. Find donation center
2. Check eligibility
3. Request emergency blood
4. Learn blood compatibility

Authenticated donor:

1. Book appointment
2. Check eligibility
3. View nearby emergency requests
4. Update health profile

Hospital:

1. Create blood request
2. Review inventory shortage
3. Match nearby donors
4. Schedule campaign

Medical staff:

1. Check in donor
2. Start screening
3. Approve or defer donation
4. Track blood bag

Admin:

1. Review alerts
2. Approve organizations/campaigns
3. Inspect audit logs
4. Manage roles and settings

## UX Backlog Mapping

### Epic: Public Donation Discovery

- Hero CTA points to donation center search.
- Location search supports browser geolocation, manual address search, and radius filters.
- Map/list split view on desktop.
- List-first view on mobile.
- Location cards show address, distance, open status, next schedule, and booking CTA.

### Epic: Eligibility Before Booking

- Short eligibility checker appears before appointment confirmation.
- Result states: likely eligible, may need review, temporarily not eligible.
- Use plain-language explanations and medical disclaimer.
- Store result timestamp for donor dashboard.

### Epic: Emergency Request

- Separate flows for verified hospitals and public requesters.
- Hospital request includes blood group, component, urgency, quantity, required time, and location.
- Public request includes contact verification and disclaimer that staff review is required.
- Emergency requests can be matched against nearby eligible donors.

### Epic: Staff Speed Workflow

- Daily appointments sorted by time and status.
- Check-in supports QR/code/manual lookup.
- Screening forms use grouped questions, keyboard navigation, and clear defer reasons.
- Blood collection captures bag ID, volume, timestamp, and collector.

### Epic: Trust, Audit, and Roles

- Role labels visible in admin user detail.
- Permission explanations appear before destructive or sensitive actions.
- Audit log supports search by actor, role, entity, action, date, and IP/device.
- Export is restricted to authorized roles.

## Accessibility Acceptance Checklist

- All interactive controls have visible focus states.
- Color is never the only signal for urgency, eligibility, or inventory status.
- Minimum touch target is 44px on mobile.
- Text contrast meets WCAG AA.
- Forms have labels, helper text, and accessible error summaries.
- Modals trap focus and close with Escape.
- Map features have list alternatives.
- Animations respect reduced-motion settings.
- Tables support screen-reader-friendly headers and captions.

