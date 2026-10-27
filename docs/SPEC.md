# HarborPath shared specification

This is the single source of truth that every workstream builds against. If a change alters a contract below, update this file in the same commit.

## Product goal

Help a person in the U.S. find addiction or mental health care that fits their needs, coverage, and life, and take the next step. HarborPath does this without collecting more than it needs, without inventing facts, and without delaying emergency care.

**Non-negotiables** (enforced by tests where possible):

1. **Never invent anything.** No made-up provider, insurance acceptance, price, hours, or availability. Unknown stays labeled "unknown".
2. **Evidence is graded.** The coverage tiers are `confirmed`, `provider-reported`, `possible`, `not-listed`, and `unknown`. A tier is never upgraded beyond its evidence.
3. **No pay-to-rank.** Nothing paid can affect a score. Sponsored placement does not exist today. If it is ever added, it must be labeled and kept outside the scoring path.
4. **Demographics never exclude.** They only add points or a "to verify" note.
5. **Answers stay on the device.** Needs-assessment answers are never sent to the server, stored, or put in a URL.
6. **Emergency first.** Every page shows 911, 988, and overdose steps. The match flow asks about danger before anything else.
7. **Nothing is a referral.** No one is contacted, and the UI says so.

## Architecture (as built)

```
Browser                                         Server (Node, no deps)            External
public/js/views/match.js  ── coarse lat/lng ──► /api/treatment  ───────────────► FindTreatment.gov (live)
  │  needs answers stay here                    /api/telehealth (statewide)  ──► FindTreatment.gov (live)
  │                                             /api/virtual-providers ◄──────── data/virtual-providers.json
  ▼                                             /api/geocode (Census, local)
public/js/match/engine.js  (rankMatches: pure, runs on device)
```

## Workstreams ("swarms")

Two workstreams ran as genuinely parallel background agents: Swarm A/E research and the Swarm H audit. The rest were done sequentially by the orchestrator, because they edit the same files. In the table, ✅ means done and verified; ◐ means partial, with what remains written out.

| Swarm | Mission | Lead | Delivered | Status |
|---|---|---|---|---|
| A: Provider intelligence | Provider data model and ingestion | Research agent | Virtual-provider registry schema, validator, review gate, and 6 researched records ([PROVIDER_DATA.md](PROVIDER_DATA.md)) | ◐ Records are held in `pending-review` because the sources were read only through search excerpts |
| B: Insurance & affordability | Coverage-aware ranking | Orchestrator | `assessCoverage()`: five evidence tiers, affordability flags, plan-verification prompts, insurer question script | ✅ |
| C: Location & availability | Geographic search | Orchestrator (existing app) | Radius 5–250 mi plus a custom distance, statewide telehealth, virtual programs filtered by state; list view | ◐ No map view (see below) |
| D: Personalized matching | Explainable ranking | Orchestrator | `rankMatches()` with reason codes, skippable preferences, and a no-exclusion rule | ✅ |
| E: Virtual treatment | Online programs alongside local care | Research agent + orchestrator | Unified ranking of facilities, statewide telehealth, and online programs; official enrollment links | ◐ Gated on human review |
| F: UX & conversion | End-to-end journey | Orchestrator | New landing CTAs and the `#/match` flow: assessment → results → compare → next-steps plan (EN + ES) | ✅ |
| G: Backend | Services and data quality | Orchestrator | `/api/virtual-providers`, registry validation at load time and in CI | ✅ |
| H: Security & safety | Audit and remediate | Audit agent + orchestrator | [SECURITY_REVIEW.md](SECURITY_REVIEW.md): 14 findings; the High and five Low/Info fixed | ◐ Medium items open |
| I: QA | Prove it works | Orchestrator | 27 new tests (120 total) plus a headless-browser e2e run ([QA_REPORT.md](QA_REPORT.md)) | ✅ |
| J: Deployment | Ship safely | Orchestrator | [DEPLOYMENT.md](DEPLOYMENT.md): checks, smoke tests, rollback | ◐ Not deployed from this session (no credentials) |

## Interface contracts

### Matching engine: `public/js/match/engine.js`

```js
rankMatches(profile, candidates, { now }) -> { profile, matches: Match[], excluded: { id, name, reason }[] }
searchPlan(profile) -> { kind, radius, local, localPages, telehealth, virtualProviders }   // no sensitive fields
fromFacility(findTreatmentListing, { via: 'local' | 'telehealth', state }) -> Candidate
fromVirtualProvider(registryRecord) -> Candidate
```

**Profile.** Every field is optional, and unknown values are dropped by `normalizeProfile`:

| Field | Values |
|---|---|
| `helpWith` | `substance` \| `mental-health` \| `both` |
| `substances[]` | `opioid`, `alcohol`, `stimulant`, `benzodiazepine`, `cannabis`, `other` |
| `settings[]` | `detox`, `residential`, `inpatient`, `php`, `iop`, `outpatient`, `medication`, `counseling`, `psychiatry`, `recovery-support` |
| `medications[]` | `buprenorphine`, `methadone`, `naltrexone`, `alcohol-medication` |
| `modality` | `in-person` \| `virtual` \| `either` |
| `coverage` | `private` \| `medicaid` \| `medicare` \| `military` \| `va` \| `ihs` \| `uninsured` \| `unsure` |
| `needsFinancialHelp` | boolean |
| `timing` | `daytime` \| `evening` \| `weekend` |
| `ageGroup` | `youth` \| `young-adult` \| `adult` \| `senior` |
| `language` | ISO-ish code, e.g. `es` or `asl` |
| `populations[]` | `veteran`, `pregnant`, `women`, `men`, `lgbtq`, `co-occurring`, `trauma`, `justice`, `hiv`, `pain`, `faith-based`, `secular` |
| `barriers[]` | `transportation`, `childcare`, `housing` |
| `state` | 2-letter code |
| `maxMiles` | number |

**Match.** `{ id, candidate, score 0–100, components: { clinical, coverage, access, preferences }, coverage: { tier, affordability[], payerCodes[] }, reasons[], missing[], verify[], stale }`. Every reason is `{ code, params }`, and the UI translates codes (`describe()` in `views/match.js`).

**Weights.** Clinical 40, coverage 25, access 20, preferences 15 (`WEIGHTS`).

**Coverage evidence:**

| Tier | Evidence required |
|---|---|
| `confirmed` | A record carries `networkVerifications: [{ payer, source, verifiedAt, state? }]`. No current data source supplies this. |
| `provider-reported` | A SAMHSA payment code (`MD`, `MC`, `PI`, `TRICARE`, `VAF`, `ITU`). For online programs, the program's own sourced claim for the visitor's state. For uninsured visitors, a listed free, sliding-fee, assistance, or public-funding option. |
| `possible` | An alternative route: a state-financed plan (`SI`), sliding fee or assistance when the visitor's payer isn't listed, or self-pay. |
| `not-listed` | Payment info is listed, but none of it fits. |
| `unknown` | No payment info, or the visitor is unsure. |

**Exclusions** are allowed only for:

- the provider's own statement (`NOOP`, `NAUT`, `DUIO`, `OUDO`, `AUDO`);
- an online-only program when the visitor asked for in-person care;
- a program that lists states which don't include the visitor's.

### HTTP API (additions)

| Endpoint | Params | Response |
|---|---|---|
| `GET /api/virtual-providers` | `state` (optional) | `{ state, generatedAt, pendingReview, disclosure, results[] }`. Returns only valid, human-approved records; programs with unknown state coverage come back as `statesUnknown: true`. |

Existing endpoints are unchanged; see [ARCHITECTURE.md](ARCHITECTURE.md).

## Integration checklist

- [x] Engine is pure and runs in the browser; unit tests run in Node (`test/match.test.js`)
- [x] Search plan sends no sensitive fields (unit test, plus an e2e scan of every request URL)
- [x] Registry validated at server start and in CI (`test/virtualProviders.test.js`)
- [x] Unreviewed records are never served
- [x] Every new UI string has a Spanish translation (i18n contract test)
- [x] New modules are in the offline Service Worker shell (SW test)
- [x] Security headers stay identical between the server and `vercel.json` (existing test)
- [x] Mobile width 375px with no horizontal scroll (e2e)
- [ ] Human review of the 6 pending registry records ([PROVIDER_DATA.md](PROVIDER_DATA.md#review-workflow))
- [ ] Open Medium findings in [SECURITY_REVIEW.md](SECURITY_REVIEW.md)
- [ ] Automated accessibility scan (axe) in CI. Only manual checks have been done so far.
- [ ] Production deploy and smoke test ([DEPLOYMENT.md](DEPLOYMENT.md))

## Deliberate omissions

- **Map view.** Map tiles would come from a third party (Google, Mapbox, OSM), which reveals a visitor's area and interest in addiction care and breaks the `default-src 'self'` CSP. Each card links out to directions instead. Two acceptable future options: self-hosted vector tiles, or a schematic distance plot without a basemap.
- **Travel time and transit.** No routing data is available without sending location to a third party.
- **Hours and intake availability.** No federal source publishes them, so the engine always lists them under "to verify".
- **Accounts and saved preferences on a server.** Not needed for the core journey. Adding them would bring HarborPath under the FTC Health Breach Notification Rule and expand its obligations under state consumer health data laws. See SECURITY_REVIEW.md.
