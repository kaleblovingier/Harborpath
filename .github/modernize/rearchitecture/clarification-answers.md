---
schema: clarification-answers/v1
status: submitted
generated_at: "2026-11-11T21:04:10.891Z"
scope: [frontend, backend, generic]
questions_file: clarification-questions.json
---

# Rearchitecture Clarification Answers

## 🖥️ Frontend

- **F1** For this in-place enhancement, should the current browser-native JavaScript frontend remain as-is, or should a target framework and version be specified?
  - answer: Keep existing browser-native JavaScript (no framework change)
  - source: user
- **F2** Should the current dependency-free UI remain without a component library, or should a specific component/UI library and version be introduced?
  - answer: Keep existing dependency-free UI (no component library)
  - source: user
- **F3** Provide screenshot/screen-recording paths or URLs for the existing UI in scope, or state that the current UI is the reference and no screenshots are available.
  - answer: no screenshot available
  - source: user
- **F4** Which design-system or token source should guide the enhancement? You may confirm reuse of the current visual system or provide a specific source.
  - answer: match existing pixel-by-pixel using extracted CSS custom properties
  - source: user
- **F5** Which accessibility standard should the work target while preserving current accessibility behavior?
  - answer: WCAG 2.1 AA
  - source: user
- **F6** List required browsers/runtime versions, or confirm the recommended modern-evergreen target.
  - answer: default
  - source: user
- **F7** Which responsive strategy should be preserved or applied?
  - answer: Mobile-first using existing breakpoints
  - source: user
- **F8** Which locales should remain in scope? English and Spanish are documented current requirements; add any others if desired.
  - answer: en, es
  - source: user
- **F9** Confirm or specify the client-side state approach. Clinical state must remain in browser RAM only and must not enter URLs, storage, network requests, or logs.
  - answer: Preserve the existing in-memory state pattern; clinical state remains in browser RAM only.
  - source: user
- **F10** Confirm the current routing/URL behavior or specify a different preference. Clinical state must not be encoded in URLs.
  - answer: Preserve existing hash-based routes and URL contracts; do not encode clinical state in URLs.
  - source: user

## ⚙️ Backend

- **B1** Should the existing dependency-free Node.js server remain unchanged, or should a target backend framework and version be specified?
  - answer: Keep existing Node.js server; retain Node 20/22 compatibility
  - source: user
- **B2** What API contract policy should apply to existing routes, payloads, and status codes?
  - answer: must preserve
  - source: user
- **B3** Should this work avoid database/schema changes and preserve the existing data arrangement, or is a migration in scope?
  - answer: TBD / assess in research phase
  - source: user
- **B4** Specify the authentication/authorization framework or policy to preserve, or confirm that no new authentication work is in scope.
  - answer: default
  - source: user
- **B5** Provide latency, throughput, or availability targets, or state that the current production baseline should be preserved.
  - answer: default
  - source: user

## 📋 General

- **G1** Which bounded improvement should be prioritized, and what observable user-facing result should count as success?
  - answer: default
  - source: user
- **G2** List any areas or behaviors to exclude. Current constraints are prefilled; refine them if needed.
  - answer: Do not add speculative clinical/legal claims or new clinical content unless supported by authoritative primary sources, framed bilingually with limitations and emergency escalation. Preserve identical CSP/security headers; RAM-only clinical state (never URL/storage/network/logs); coarse location quantization and local geocoding; deterministic synchronous registry-based Quick Exit resilient across failures/in-flight work; English/Spanish, accessibility, and print parity. Do not touch user MCP configuration or the recovery bundle.
  - source: user
- **G3** What must-pass policy should apply to the existing test suite once implementation is approved?
  - answer: must pass
  - source: user
- **G5** Add any requirements, exclusions, dependencies, compliance rules, or operational constraints not covered above.
  - answer: None beyond the decisions listed in this specification.
  - source: user
