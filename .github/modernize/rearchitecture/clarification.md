---
schema: clarification/v1
generated_at: "2026-11-11T21:08:07.334Z"
scope:
  - frontend
  - backend
  - generic
clarity_score: 1.00
rounds: 1
gaps: []
blocking_gaps: []
---

# Scenario Clarification

## Frontend

- **Target framework**: Keep the existing browser-native JavaScript; no framework change.
- **Component library**: Keep the existing dependency-free UI; add no component library.
- **Screenshots**: None available; use the current UI as the reference.
- **Design system**: Match the existing visual system pixel-by-pixel using extracted CSS custom properties.
- **Accessibility**: WCAG 2.1 AA.
- **Browser targets**: Modern evergreen browsers (default explicitly selected).
- **Responsive strategy**: Mobile-first, preserving existing breakpoints.
- **i18n locales**: English (`en`) and Spanish (`es`).
- **State management**: Preserve the existing in-memory state pattern. Clinical state stays in browser RAM and must never enter URLs, storage, network requests, or logs.
- **Routing**: Preserve existing hash-based routes and URL contracts; do not encode clinical state in URLs.

## Backend

- **Target framework**: Keep the existing dependency-free Node.js server; retain Node.js 20/22 compatibility.
- **API contract preservation**: Must preserve existing routes, payloads, and status-code contracts.
- **Data migration strategy**: TBD; assess during the research phase. No migration decision is made here.
- **Auth framework**: Preserve the existing authentication/authorization behavior (default explicitly selected).
- **SLA targets**: Match the current production baseline (default explicitly selected).

## Generic

- **Success definition**: Preserve current system behavior as the baseline while delivering the requested in-place improvements to platform information, features, and usability. Existing documentation identifies pathway-card usability, approved-resource discovery, and freshness communication as opportunity areas.
- **Out of scope**: No speculative clinical or legal claims. Do not add clinical content unless it is supported by authoritative primary sources, framed bilingually with limitations, and includes emergency escalation. Do not change CSP/security headers. Do not add npm dependencies. Preserve coarse location quantization and local-only geocoding. Quick Exit must remain a deterministic synchronous reset of state registered through the shared state registry and remain resilient to failures and in-flight work. Preserve English/Spanish, accessibility, and print parity. Do not modify user MCP configuration or the recovery bundle.
- **Existing test posture**: The existing test suite must pass.
- **Output location**: In-place enhancement of the existing HarborPath repository; no separate rewrite/extract destination.
- **Additional constraints**: None beyond the decisions listed in this specification.

## Gaps & Defaults Applied

No unanswered in-scope fields. The user explicitly selected the catalog defaults for browser targets, authentication behavior, SLA targets, and the general success definition. The data/schema decision is explicitly deferred to the research phase.

## Downstream Usage Notes

- Treat all recorded choices as user-resolved; do not re-ask them.
- Treat the data/schema strategy as intentionally deferred to research, not as approval for a migration.
- Preserve the security, privacy, localization, accessibility, print, dependency, and Quick Exit guardrails above in all downstream work.
