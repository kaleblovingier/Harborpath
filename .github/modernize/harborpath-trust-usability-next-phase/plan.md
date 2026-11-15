# Modernization Plan: HarborPath Trust, Usability & Release Confidence

**Project**: HarborPath

## Technical Framework

- **Application**: Vanilla browser ES modules and Node.js 20+ server, with a Python backend/test suite.
- **Build and tests**: npm scripts and Node.js built-ins; no npm dependencies.
- **Data**: Bundled public datasets and existing same-origin APIs; no new external services.

## Overview

This bounded next phase improves trust in the information HarborPath presents, makes existing care pathways easier to discover, and raises confidence in privacy, accessibility, and release quality. It is organized as exactly five workstreams for a five-agent team. The first four can begin in parallel after ownership is agreed; the fifth integrates their changes and gates release readiness.

The phase prioritizes the evidence supplied with the assessment: clinical/source claims need review; VA data provenance appears older than the most recent data build; all six online-provider records remain pending human review; the large catalog and roadmap create discoverability burden; and serious contrast/label issues conflict with broad accessibility claims. The supplied test baseline reports 17 failures among 2,087 npm tests while lint/build checks pass and the Python backend suite passes 15 tests.

The AppCAT report itself contains one AWS-credential finding. Its scope is inconsistent with HarborPath's primary JavaScript/Python application and the accompanying assessment notes identify Java findings under `.venv`; this plan does not treat that signal as confirmed application code or prioritize it without a focused rescan.

## Migration Impact Summary

| Area | Current state | Planned outcome | Boundary |
|---|---|---|---|
| Clinical information | Source/date review needs; EN/ES parity | Review bounded high-risk guides and mark uncertainty honestly | No diagnosis or treatment claims beyond sources |
| Provider data | VA age/provenance mismatch; 6 online providers pending | Clear dates, source provenance, and human review status | No automatic provider approval |
| Discovery | 163 client modules and a large roadmap | Task-first navigation to existing features | No broad feature expansion |
| Privacy | Clinical state is ephemeral and client-side | Regression-verify existing privacy and Quick Exit invariants | No persistent clinical data or new service |
| Accessibility/release | Contrast/label concerns; npm test failures | Focused remediation and repeatable release evidence | No new npm dependencies or deployment |

No Azure migration, infrastructure, deployment, new persistence, external service, referral workflow, account system, or FHIR integration is part of this phase.

## Delivery Model and Integration

1. The five owners agree on the file boundaries recorded in `.metadata/tasks.json` before parallel edits. Workstreams 001–004 then proceed independently.
2. Workstream 005 consumes the four lane handoffs, owns shared accessibility/test/release files, and runs the integrated verification gate. It does not edit another lane's owned application modules; it routes findings to that owner.
3. New English UI strings are contributed by their feature owner; only workstream 005 edits the shared Spanish locale dictionary. Feature owners remain responsible for their own bilingual content and source accuracy.
4. No commit, push, production release, provider approval, or legal sign-off is authorized by this plan.

## Repository Guardrails

- Keep `package.json` dependency-free and preserve identical strict CSP/security headers.
- Keep clinical answers in browser RAM only: never put them in URLs, storage, network requests, or logs. Keep saved places/offline public data opt-in and separate from clinical answers.
- Preserve same-origin-only geocoding, no external geocoder, no coordinate logging/persistence, and approximately 1 km quantization on client and server.
- Keep Quick Exit deterministic and synchronous across stateful modules, including clearing pending handoffs, callbacks, timers, inputs, and detached sensitive DOM; do not let in-flight work repopulate state after reset.
- Preserve English/Spanish parity, keyboard and screen-reader access, visible focus, WCAG 2.2 AA+ contrast/target sizes, and clean print output. Printed/copied clinical summaries must explain that copies are outside Quick Exit's control.
- Clinical and legal facts require authoritative primary sources, current dates, accurate limitations, bilingual framing, and emergency escalation independent of a calculated score. Unknown facts stay unknown.
- Read `README.md`, `docs/ARCHITECTURE.md`, `docs/IMPROVEMENTS.md`, `docs/AI_NAVIGATOR_SPEC.md`, and `docs/PHASE1_HELPERS.md` before architecture changes. These were reviewed while preparing this plan; older clinical query-link examples do not override the current privacy guardrails.
