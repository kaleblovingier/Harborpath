# t1 — Care-tools discovery and freshness cues

## Summary

Added one-tap audience filters synchronized with the existing audience select, plus a visible freshness card that distinguishes live SAMHSA treatment searches from bundled data, displays a validated build date when available, and links to the detailed source disclosure. Added Spanish copy, responsive styling, tests, and directly related documentation. Refreshed the service-worker shell hash. No API, security-header, dependency, clinical-state, or Quick Exit behavior was changed.

## Upstream Artifacts Consumed
- `.github/modernize/rearchitecture/clarification.md` — implementation scope and privacy, localization, accessibility, print, CSP, dependency, and Quick Exit constraints.

## Evidence Mapping
- `clarification.md#Frontend` and `clarification.md#Generic` → audience controls keep the existing browser-native in-memory filter state; date rendering is metadata-only; English/Spanish coverage and print-visible freshness are preserved; CSP and Quick Exit code paths are unchanged.
- `clarification.md#Generic` → no new packages, API changes, clinical/legal claims, or changes to the recovery bundle or user MCP configuration.

## Changes
- `public/js/views/tools.js`: added audience quick-filter buttons and synchronized their pressed state with the existing audience select.
- `public/js/components/sourceContext.js`: added a visible, metadata-driven freshness cue and optional source-disclosure anchor ID; invalid or missing dates remain unavailable rather than being formatted as dates.
- `public/js/app.js`: refreshes the freshness cue and source disclosure when metadata arrives, without replacing the whole view.
- `public/js/locales/es-tools.js`, `public/js/locales/es-evidence.js`: added Spanish audience and freshness strings.
- `public/styles.css`: styled the discovery groups and freshness card; the freshness card is not hidden in print.
- `README.md`, `docs/ARCHITECTURE.md`: clarified catalog discovery and the meaning/limits of the bundled-data build date.
- `test/tools-ux.test.js`, `test/source-context.test.js`: added audience-filter synchronization, date, missing/invalid metadata, source-link, and Spanish coverage.
- `public/sw.js`: refreshed the asset hash using the repository stamping script.

## Test Results
- Focused command: `node --test test/source-context.test.js test/tools-ux.test.js`
  - Passed: 17; Failed: 0; Skipped: 0; exit code: 0.
- Full command: `npm test`
  - Passed: 2066; Failed: 19; Skipped: 0; exit code: 1.
  - No failures were reported in the changed care-tools UX or source-context test suites. The 19 failures are in other existing clinical content, navigation, provider-search, service-worker coverage, and Quick Exit test areas; they remain unresolved and block task completion.
- `npm run stamp:sw`: exit code 0; updated `public/sw.js` build hash and all 21 static/build checks passed.
- `npm run lint`: exit code 0; 21/21 static/build checks passed.
- `npm run build`: exit code 0; 21/21 static/build checks passed.
- Local runtime smoke command: `node scripts/smoke.mjs http://127.0.0.1:3117`
  - Passed: 11; Failed: 0; exit code: 0. Root page returned HTTP 200; CSP, HSTS, no-referrer, key modules, health, ZIP geocoding, virtual-provider response, no-store API header, and live treatment-search reachability passed.

### Full-suite failures (19)
1. Naloxone challenge before Vivitrol wording.
2. Crisis/overdose red-flag interception.
3. Good Samaritan coverage wording.
4. Spanish support-route rendering.
5. Spanish overdose-pacer strings.
6. Escape handling for the More tools menu.
7. Escape handling for the mobile menu.
8. App-loadable modules missing from service-worker precache.
9. Overdose-pacer Quick Exit reset registration.
10. Stateful module Quick Exit reset registration.
11. Lazy-view precache assertion.
12. URL-hash filter stripping assertion.
13. Counseling-program RAM handoff assertion.
14. App-reachable modules missing from service-worker tiers.
15. Critical service-worker tier self-containment.
16. Sparse-area provider search rendering.
17. Island-territory and sparse-search provider widening.
18. Guides navigation integration.
19. Guides cross-module navigation links.

## Smoke Test Verdict
- install_command: `n/a (no dependency or package-manifest changes)`
- install_returncode: n/a
- build_command: `npm run build`
- returncode: 0
- covers_all_modules: yes (the build checker validated 20 server and 163 client modules)
- startup_http_status: 200
- test_script_present: yes
- test_returncode: 1

## Issues for Coordinator
- **BLOCKER:** `npm test` exits 1 with 19 failures outside the changed care-tools/source-context test suites. Per the task gate, this implementation cannot be marked complete until these failures are addressed or explicitly waived.
