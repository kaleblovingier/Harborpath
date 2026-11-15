# t5 — Focused keyboard tests and validation

## Summary

Added two behavioral Node tests that execute the actual Escape key listener from `public/js/app.js` with a minimal injected DOM and a deterministic clock. They verify that dismissing either the More tools disclosure or mobile navigation returns focus, clears a pending Escape press, and prevents that dismissal from triggering Quick Exit. No production source was changed by this task.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t4-frontend.md` — the delivered Escape/Quick Exit behavior, intended keyboard focus, and prior validation/failure evidence.

## Evidence Mapping

- `t4-frontend.md#Summary` — “navigation dismissal takes precedence” and focus restoration → listener-level sequence tests in `test/navigation.test.js`.
- `t4-frontend.md#Test Results` — focused test and full-suite expectations → current focused and full-suite results below.
- `t4-frontend.md#Remaining full-suite failures` → comparison for current residual failure scenarios.

## Files Changed

- `test/navigation.test.js` — added `node:vm` harness and two deterministic event-sequence tests.

## Test Results

| Check | Command / action | Result |
|---|---|---|
| Focused navigation tests | `node --test test/navigation.test.js` | Exit 0; 25 passed, 0 failed, 0 skipped |
| Full Node suite | `npm test` | Exit 1; 2,070 passed, 17 failed, 0 skipped (2,087 total) |
| Lint | `npm run lint` | Exit 0; build-check summary 21/21 passed |
| Build | `npm run build` | Exit 0; build-check summary 21/21 passed |
| Startup smoke | `npm start`; `GET http://127.0.0.1:3000/` and `/js/app.js` | Server started; both returned HTTP 200. Home response retained the strict same-origin CSP (`default-src 'self'`, `script-src 'self'`, `connect-src 'self'`, etc.). Server was stopped after probing. |
| Browser checks | Playwright browser at 390px and desktop viewport | 2 interactions passed: Escape closed More tools and restored focus to its summary; Escape closed mobile navigation and restored focus to Menu. URL remained on `/` in both cases. |
| Diff hygiene | `git diff --check` | Exit 0 |

### Full-suite failures

The following 17 named tests failed in the current `npm test` run:

1. `a naloxone challenge before Vivitrol is not described as always mandatory`
2. `intercepts crisis and overdose red flags and surfaces 988, 911, Never Use Alone, SafeSpot (800-972-0590), and #/overdose`
3. `exports GOOD_SAMARITAN_STEPS covering core 911 protections, immunities, and limitations`
4. `support route renders in Spanish`
5. `Wave 6: overdosePacer renders authentic clinical Spanish strings when lang is es`
6. `every module the app can load is precached; everything loaded up front is in the critical tier`
7. `overdose pacer registers resetOverdosePacer for Quick Exit and app.js imports nothing on exit`
8. `every module with a reset registers it for Quick Exit (lazy loader or onQuickExit)`
9. `lazy views are not all downloaded on page load`
10. `filters in the URL hash are read once and stripped from the address bar`
11. `counseling program selections use a RAM handoff with no clinical URL query`
12. `every module reachable from app.js is precached in one of the offline tiers`
13. `critical tier is self-contained: static imports of critical modules are also critical`
14. `provider search expands a sparse area and renders HRSA / IHS safety-net cards`
15. `all island territories widen immediately; sparse searches widen once and fetch federal safety nets`
16. `Wave 15: Guides Navigation Integration`
17. `Wave 18: Guides Cross-Module Navigation Links`

The t4 artifact reports these 17 residual scenarios in its post-fix run and says they were present in its before-fix run (which also included the two Escape regressions). The current run adds two passing tests and still has 17 failures; this validation did not re-run the clean-HEAD baseline. No unrelated failures were changed.

## Environment and Runtime Verdict

```text
environment:
  docker: UNAVAILABLE — Docker CLI 29.9.2 is present; `docker info` reported the daemon is not responding
  node: AVAILABLE — v26.2.0
  playwright: AVAILABLE — used the provided Playwright browser against the local app; no install or download
  infra-tier: NOT APPLICABLE — the assigned test scope uses built-in Node tests and a local HTTP server; no external infra was required
  browser-tier: PRIMARY(Playwright) — two Escape dismissal/focus flows exercised
startup: PASS — `npm start`; home and client entrypoint returned HTTP 200; strict same-origin CSP present
integration: FAIL — exit_code: 1, passed: 2070, failed: 17, skipped: 0; full `npm test` suite; failures listed above
e2e: PASS — exit_code: 0 (browser actions/assertion observations succeeded), passed: 2, failed: 0; More tools and mobile Menu Escape dismissal; focus restoration and unchanged URL verified
overall: FAIL — the full Node test command exited 1 with 17 residual failures; this task's focused tests, lint, build, startup, and browser checks passed
```

## Repository State

At validation start, the repository was `main` and ahead of `origin/main` by two commits, but the working tree already contained uncommitted t4 and orchestration changes despite the initial clean-tree description. This task only modified `test/navigation.test.js` and did not commit, push, deploy, amend, or rewrite history.
