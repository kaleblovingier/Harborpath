# QA report

Run date: 2026-10-27, on Node 22.22. Run with `npm test`; the browser walkthrough is `node scripts/e2e-match.mjs`.

## Results

| Suite | Tests | Result |
|---|---|---|
| Existing suites (API, privacy headers, geocoding, providers, regions, clinical modules, i18n, SW) | 93 | ✅ pass |
| `test/match.test.js`: matching engine scenarios | 18 | ✅ pass |
| `test/virtualProviders.test.js`: registry validation, review gate, endpoint | 6 | ✅ pass |
| `test/security.test.js`: regressions for audit findings H-1 and L-9 | 3 | ✅ pass |
| **Total** | **120** | **120 pass, 0 fail** |

The headless Chromium walkthrough (375×800, English and Spanish) passed. It uses the recorded FindTreatment fixture in place of the live API:

- The landing page shows the new headline and the four calls to action.
- Choosing "anyone in danger?" shows the emergency panel and moves focus to it; "Everyone is safe" returns to the flow.
- The full assessment works: opioids, outpatient, buprenorphine, ZIP 98101, Medicaid, evening hours, transportation help.
- Results are ranked with reasons. Medicaid is shown as "Listed as accepted (provider-reported)", and hours appear under "Still needs confirming".
- Comparing two programs builds a side-by-side table; the action plan has 5 steps.
- There is no horizontal scroll at 375px.
- **Privacy:** no answer (medicaid, opioid, evening, transport, buprenorphine) appears in any request URL. The hash stays `#/match` and localStorage stays empty.
- The Spanish UI renders, and there are no console errors.

`node scripts/smoke.mjs <url>` against a local server: 10 of 11 checks pass. The `/api/treatment` check fails only because this sandbox cannot reach findtreatment.gov; the server answered with its designed 502 fallback.

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

- An automated accessibility scan (axe-core), since there is no dependency budget for it in CI yet. Manual checks so far:
  - fieldsets with legends for every question;
  - focus moves to each step heading;
  - visible focus rings;
  - an `aria-live` results count;
  - the comparison table uses `th` with `scope`.
- Screen readers (NVDA, VoiceOver), real devices, and Safari or Firefox.
- The live FindTreatment.gov API from the new flow. Only the fixture has been used; this sandbox has no outbound access.
- Load and performance testing.
- Authentication and authorization: the app has no accounts, so there is nothing to test.
