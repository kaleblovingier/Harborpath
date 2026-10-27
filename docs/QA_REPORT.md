# QA report

Run date: 2026-10-27, on Node 22.22. Run with `npm test`; the browser walkthrough is `node scripts/e2e-match.mjs`.

## Results (round 2)

| Suite | Tests | Result |
|---|---|---|
| Existing suites (API, privacy headers, geocoding, providers, regions, clinical modules, i18n, SW) | 93 | ✅ pass |
| `test/match.test.js`: matching-engine scenarios, Medicaid state rules, hostile input | 21 | ✅ pass |
| `test/virtualProviders.test.js`: registry validation, review gate, public fields, endpoint | 7 | ✅ pass |
| `test/security.test.js`: proxy key, IPv6 /64, overflow-bucket lockout, hop count | 6 | ✅ pass |
| `test/clinical-safety.test.js`: self-report framing, crisis-first card, prescriber warning | 8 | ✅ pass |
| `test/privacy.test.js`: no absolute privacy claims (EN + ES), health data notice, URL filter stripping | 8 | ✅ pass |
| `test/accessibility.test.js`: focus restoration, no `setAttribute(…, null)`, keyboard-reachable tables | 5 | ✅ pass |
| **Total** | **148 tests, 12 suites** | **148 pass, 0 fail, 0 todo** |

**Browser verification** (headless Chromium):

- **axe-core 4.14, WCAG 2.0/2.1/2.2 A + AA:** the QA swarm scanned 120 page states. That covered every route, every match step, the emergency panel, and results with comparison, at 375 and 1280px, in light and dark, and in English and Spanish. After the fixes, a re-scan of the affected routes at 320px in both languages shows no violations. The one exception is the documented sticky-bar `target-size` flag ([SECURITY_REVIEW.md](SECURITY_REVIEW.md)).
- **Reflow:** no horizontal scroll at 320px on `#/`, `#/match`, `#/navigator`, `#/plan`, `#/medications`, `#/treatment`, or `#/privacy`, in both languages.
- **Keyboard and focus:**
  - Arrow keys no longer open the emergency panel.
  - Focus lands on the step heading after "Everyone is safe", on the results heading after loading, and stays on a filter after toggling it.
  - Checking a compare box moves focus to the comparison; unchecking keeps focus on the box; clearing the comparison moves it to the results heading.
  - The 4th compare box is disabled and says why.
- **Functional:** with an 8-listing fixture, the filters show 8 → 4 / 4 / 2 results. "Change answers" round-trips. A preset link restarts the questions. The empty state never invents results.
- **Navigation:** hash-only route changes render correctly. This check caught and fixed a focus crash on the first render of `#/match` before anything was pushed.
- **`scripts/e2e-match.mjs`:** passes. No sensitive answer appears in any request URL, nothing is written to localStorage, and there are no console errors.
- **`scripts/smoke.mjs`:** 10 of 11 checks pass locally. The `/api/treatment` check can't pass in this sandbox (no outbound network); the server returns its designed 502 fallback.

## Scenario coverage (from the brief)

| Scenario | Covered by |
|---|---|
| WA, Medicaid, stimulant use, outpatient, telehealth, limited transportation, evening hours | `match.test.js` "WA Medicaid stimulant scenario" |
| Uninsured | "uninsured: free and sliding-scale programs rank above cash-only" |
| Opioid use | "facilities stating they do not treat OUD are excluded", "requested medication … reported as missing" |
| Co-occurring mental health | "co-occurring mental health needs favor integrated programs" |
| Prefers in-person care | "in-person preference: distance dominates and virtual-only programs are excluded" |
| Never invent a provider | "no candidates gives no matches", plus the UI empty state |
| Geographic eligibility | "virtual programs respect state availability" |
| Payment cannot change rank | "payment or sponsorship fields cannot change a score" |
| Demographics never exclude | "demographic preferences never exclude anyone" |
| Stale verification dates | "stale or undated registry records are flagged" |
| Incomplete provider info | "incomplete listings stay visible but ask for verification" |
| API failures | Existing `app.test.js` (upstream down → stale cache or 502 fallback); the match UI shows a partial-results warning |
| Empty results | UI empty state (helpline, widen radius); engine returns `[]` |
| Privacy | `searchPlan` test, plus the e2e request-URL scan |
| Official enrollment links | Registry validator (https only); `ext()` scheme guard |

## Not yet tested

- Accessibility scans in CI. axe was run as a one-off audit, not on every push, because it is not a project dependency.
- Screen readers (NVDA, VoiceOver), real devices, and Safari or Firefox.
- The live FindTreatment.gov API from the new flow. Only the fixture has been used; this sandbox has no outbound access.
- Load and performance testing.
- Authentication and authorization: the app has no accounts, so there is nothing to test.
