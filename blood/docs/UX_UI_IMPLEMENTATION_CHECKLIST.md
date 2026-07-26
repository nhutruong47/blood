# Blood Donation Community - UX/UI Implementation Checklist

This checklist tracks execution of the UX improvement list. It separates product/design work from backend prerequisites so the platform can move from architecture to shippable user experience.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked / needs decision

## P0 Checklist

| Status | Item | Owner track | Acceptance criteria |
| --- | --- | --- | --- |
| `[~]` | Make "Find donation center" the strongest public CTA. | Product + Frontend + Backend | Landing hero CTA routes to donation location discovery; backend supports public location list, slug detail, nearby search, SEO metadata and sitemap. |
| `[~]` | Add eligibility checker before booking. | Product + Backend + Frontend | Backend API is available; frontend must place it before appointment creation and add medical review UX. |
| `[~]` | Add emergency request path for hospitals and public users. | Product + Backend + Frontend | Hospital blood request exists; public emergency request path still needs requester verification and triage UX. |
| `[x]` | Add map based center discovery. | Backend prerequisite | Public APIs support published locations, lat/lng, radius search, slug detail and distance in kilometers. |
| `[~]` | Add accessibility from the foundation. | Design + Frontend + QA | Design checklist exists; frontend implementation still needs keyboard, screen reader, focus, contrast and responsive QA. |

## P1 Checklist

| Status | Item | Owner track | Acceptance criteria |
| --- | --- | --- | --- |
| `[~]` | Add blood compatibility education. | Product + Backend + Frontend | Backend API is available; frontend still needs interactive compatibility card and education page. |
| `[ ]` | Add donor impact tracking. | Product + Backend + Frontend | Donor dashboard shows donation count, estimated lives supported, milestones, certificates and badges. |
| `[ ]` | Add hospital shortage visibility. | Product + Backend + Frontend | Hospital dashboard shows inventory shortage by blood group, component, expiry and urgency. |
| `[ ]` | Add staff workflow optimized for speed. | Product + Frontend + Backend | Staff can check in, screen, approve/defer and collect blood with minimal clicks and keyboard support. |
| `[ ]` | Add audit logs and role clarity for enterprise trust. | Backend + Admin UX | Sensitive actions generate searchable audit events; roles and permissions are visible in admin UI. |

## Current Backend Support

- Public donation location list: `GET /api/public/locations`
- Public donation location detail: `GET /api/public/locations/{slug}`
- Nearby location search: `GET /api/public/locations/nearby?lat={lat}&lng={lng}&radiusKm={radiusKm}`
- SEO metadata: `GET /api/public/seo/metadata`
- Location SEO metadata: `GET /api/public/locations/{slug}/seo`
- Sitemap: `GET /sitemap.xml`
- Robots: `GET /robots.txt`
- Eligibility checker: `POST /api/donate/eligibility-check`
- Blood compatibility list: `GET /api/public/blood-compatibility`
- Blood compatibility detail: `GET /api/public/blood-compatibility/{bloodGroup}`

## Next Execution Order

1. Finish eligibility checker API and wire it before appointment booking.
2. Finish blood compatibility education API.
3. Add public emergency request triage flow.
4. Add frontend landing page CTA and map/list center discovery.
5. Add donor dashboard impact tracking.
6. Add hospital inventory shortage module.
7. Add staff daily workflow screens and keyboard-first interactions.
8. Add audit log and role visibility in admin portal.
