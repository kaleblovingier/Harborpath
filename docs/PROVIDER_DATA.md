# Provider data: model, sources, and review

## Sources in use

| Source | What | How | Trust level |
|---|---|---|---|
| SAMHSA FindTreatment.gov API | State-licensed SUD and mental health facilities, with services, payment accepted, populations, and languages | Live query per search, cached ≤ 1 hour (`src/findtreatment.js`) | Facility-reported to a federal survey. Shown as "provider-reported", never "confirmed". |
| HRSA, VA, IHS, CMS, Medicaid.gov | Health centers, VA, tribal facilities, rural clinics, ER hospitals, state Medicaid directories | `npm run data:build` snapshots (`scripts/sources/`) | Official federal datasets |
| `data/virtual-providers.json` | Online-only treatment programs | Researched from each program's own public pages | Provider-reported; served only after human review |

HarborPath does not scrape provider websites. Registry entries cite the public pages a person reads; no automated crawler collects them.

## Virtual-provider record

The validator (`validateProvider` in `src/virtualProviders.js`) enforces every rule below, both at server start and in CI.

| Field | Rule |
|---|---|
| `id`, `name` | Required; `id` is kebab-case and unique |
| `officialUrl`, `enrollUrl` | https only |
| `conditions[]`, `services[]` | From a fixed vocabulary |
| `serviceStates` | Valid state codes, or `null` when the program does not publish them. `null` is shown as "check whether they serve your state". |
| `insurance.claims[]` | `{ payer, detail, states, sourceIndex }`. Each claim must cite a source. The word "in-network" is rejected unless a specific `plan` is named. |
| `insurance.selfPay` | A price must cite a source |
| `sources[]` | https URL, `accessedAt` (YYYY-MM-DD), type `official` or `third-party`. At least one `official` source is required. |
| `verificationStatus` | Always `provider-reported`. HarborPath does not independently verify providers. |
| `reviewStatus` | `pending-review` or `approved`. Only `approved` records are served. |
| `reviewedBy`, `reviewedAt` | Required when approved |
| `unknowns[]`, `notes` | What could not be confirmed, and any source conflicts |

The engine treats records more than 365 days past their most recent `accessedAt` as stale, and records with no date as stale too. The UI then asks the visitor to check the information.

## Current registry: 6 programs, all `pending-review`

The programs are Affect Therapeutics, Bicycle Health, Boulder Care, Ophelia, Workit Health, and Monument.

The research agent could not load the provider pages directly from this environment, because DNS and egress were blocked. It read them through search-engine excerpts restricted to each provider's own domain. That is not strong enough to show as fact, so **no online-only programs are shown to visitors yet**. Instead, the match flow tells visitors that program information is being checked, and it still includes SAMHSA-listed telehealth programs.

Known conflicts to resolve during review (details are in each record's `notes`):

- **Affect:** official pages list different state sets (15, 17, and "20" states). `serviceStates` is left `null`.
- **Bicycle Health:** state counts conflict (26, 27, or 28 states). Medicaid acceptance varies by state.
- **Boulder Care:** four different phone numbers appear. Minimum age is unclear for WA.
- **Ophelia:** "licensed in 49 states" is not the same as actively serving them. The 15 listed states are used.
- **Workit Health:** "coming soon" states and contradictory Medicaid statements.
- **Monument:** the indexed pages are 500–1,000 days old. Re-verify everything before approving.

## Review workflow

Use the review tool. It refuses incomplete or invalid approvals and writes nothing when it refuses.

```bash
node scripts/registry-review.mjs                      # list records and status
node scripts/registry-review.mjs show boulder-care    # the checklist: every source and field
# Open every source URL in a browser. Edit data/virtual-providers.json to correct
# or null anything the pages do not say (move it to "unknowns").
node scripts/registry-review.mjs approve boulder-care --by "Your Name" --sources-checked
npm test                                               # validator must pass; then commit
node scripts/registry-review.mjs revoke boulder-care  # hide a record again at any time
```

Approval sets `reviewStatus`, `reviewedBy`, and `reviewedAt`, and updates each source's `accessedAt` to the review date. Re-review every record at least every 12 months, or whenever a visitor reports a problem. Stale records are flagged automatically.

## Reporting inaccurate listings

- **SAMHSA facilities:** the facility updates its own listing through SAMHSA's N-SUMHSS survey. Point visitors to FindTreatment.gov.
- **Registry entries:** open an issue on this repository. The issue template should warn people not to include personal or health information.

## Adding a source later

Add a new module under `scripts/sources/` for snapshots, or a new `src/*.js` client for live APIs. Each module should:

- produce records with `source` and `verifiedAt`;
- map payer data to the engine's coverage vocabulary;
- convert records to engine candidates through a `from<Source>()` adapter in `public/js/match/engine.js`.

A true `confirmed` in-network status needs a payer-directory or eligibility source with a data-use agreement. When one exists, populate `networkVerifications` on the record; the engine already supports it.
