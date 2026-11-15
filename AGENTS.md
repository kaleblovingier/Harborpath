# HarborPath engineering guardrails

These rules apply to every contributor and agent throughout this repository.

1. **Zero npm dependencies.** Keep `package.json` free of runtime and development dependencies. Use Node.js 20+ built-ins (`node:test`, `node:assert/strict`, `node:http`, `node:fs`) and vanilla browser ES modules.
2. **Strict CSP and identical security headers.** Preserve `default-src 'self'`, without external scripts, fonts, maps, analytics, or client-view network calls to third parties. Keep the security headers used by `server.js` (defined in `src/app.js`) and `vercel.json` identical. Provider/geocoder requests use the existing same-origin API boundary only.
3. **Clinical state stays in browser RAM.** Assessments, guided triage, withdrawal and induction tools, interaction checks, insurance profiles, and safety plans must never enter URLs (including hash queries), cookies, local/session storage, IndexedDB, network requests, or logs. Use the in-memory navigator handoff for clinical service selections. Saved places and public offline caches require explicit opt-in and must never contain clinical answers. User-requested printing/copying must explain that exported copies are outside Quick Exit's control.
4. **Coarse location only.** Preserve approximately 1 km coordinate quantization on both client and server. Use the local Census geocoder in `src/` and `data/`; never add external geocoding. Do not log or persist coordinates.
5. **Deterministic Quick Exit.** Every stateful module must export a deterministic `reset*State()` function and register it through `public/js/quickExitRegistry.js` (which shares the existing `state.js` registry). Reset must synchronously clear RAM, inputs, detached sensitive DOM, handoffs, callbacks, and timers. The Quick Exit button (`.hp-quick-exit-btn`) and Escape twice must run all resets even if one fails. In-flight operations must not repopulate state after reset.
6. **English, Spanish, accessibility, and print parity.** Every new UI string, badge, tool, guide, status, and validation message must support `en` and `es`. Use semantic accessible DOM, explicit labels, keyboard controls, visible focus, appropriate live regions, and WCAG 2.2 AA+ contrast/target sizes. Clinical summaries must print cleanly with `@media print`; never append hidden URLs or clinical query strings to printed links.

## Workflow

- Read `README.md`, `docs/ARCHITECTURE.md`, `docs/IMPROVEMENTS.md`, `docs/AI_NAVIGATOR_SPEC.md`, and `docs/PHASE1_HELPERS.md` before architecture changes. Older docs may show clinical query links; rule 3 supersedes those examples.
- Inspect existing exports, routes, tests, and `git log -n 10 --oneline`. Commit `50893bc` reverted a broken navigator push: preserve existing APIs and verify imports, syntax, DOM mounting, and clinical handoff before integrating navigator changes.
- Clinical and legal content requires authoritative primary sources, accurate limitations, bilingual framing, and emergency escalation independent of a calculated score. A self-check is not a diagnosis, prescription, or validated substitute for clinician assessment.
- Assign explicit file ownership before parallel edits. Do not overwrite another workstream's files; coordinate shared router, registry, and stylesheet changes with the integration lead.
- Use meaningful built-in Node tests for clinical logic, privacy boundaries, reset behavior, asynchronous cancellation, and route integration. Run `npm test`, `npm run lint`, and `npm run build` before reporting completion. Use the existing service-worker stamping workflow when static assets change.
- Do not commit, push, publish, or deploy unless authorized. Report material verification gaps accurately.
