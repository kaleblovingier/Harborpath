# HarborPath

**Live platform:** [https://harborpath.vercel.app](https://harborpath.vercel.app)

A free, privacy-first platform for finding **addiction treatment**, **clinical care navigation**, **evidence-based medications**, **harm reduction tools**, and **safety-net health services** across the United States and U.S. territories (in **English and Español**).

- **Find care that fits (`#/match`) & Insurance Compatibility Engine:** a short, skippable needs assessment (help type, care setting, medications, location, in-person or online, coverage, cost, and optional preferences), then options ranked by an explainable on-device matching engine (`public/js/match/engine.js` and `public/js/views/insuranceHelpers.js`). Classifies coverage into deterministic tiers (`EMTALA_PROTECTED`, `CONFIRMED_MATCH`, `VERIFY_NETWORK`, `SAFETY_NET_FALLBACK`, `UNVERIFIED_OR_MISMATCH`) with MHPAEA parity questions, EMTALA (`42 U.S.C. § 1395dd`) emergency stabilization rights, and EKRA (`18 U.S.C. § 220`) anti-patient-brokering warnings. Coverage is graded by evidence (confirmed, provider-reported, possible, not listed, unknown) and is never promised. Includes side-by-side comparison, distance-preserving facility ranking, state Medicaid links (`data/state-medicaid.json`), and a printable (`@media print`) next-steps plan with insurer questions. Answers never leave the browser. See [docs/SPEC.md](docs/SPEC.md).
- **Find treatment (`#/treatment`):** live search of SAMHSA’s [FindTreatment.gov](https://findtreatment.gov/), the federal directory of state-licensed facilities. Filter by medication (buprenorphine, methadone, naltrexone, OTPs, alcohol use disorder medication), type of care, payment (Medicaid, sliding scale, free), population served, language, and extras like naloxone or HIV/HCV testing. Includes rural and U.S. territory equity reach expansion (up to 250 miles across all 50 states, DC, Puerto Rico, Guam, U.S. Virgin Islands, American Samoa, and the Northern Mariana Islands) and statewide telehealth listings.
- **Clinical Care Navigator (`#/navigator`) & Phase 1 Population Pathways (`populationHelpers.js`):** 6-dimension **ASAM Criteria (4th Edition)** clinical self-check and Phase 1 population recommenders (`recommendForPregnancy`, `recommendForYouth`, `recommendForJusticeInvolved`, `recommendForOlderAdults`, `recommendForStimulants`, `recommendForXylazine`, `recommendForCoOccurring`) authored from an Addiction Medicine (MD) perspective. Evaluates withdrawal risk (including alcohol/benzodiazepine seizure risk, opioid stabilization, and xylazine/medetomidine alpha-2 rebound), biomedical conditions (pregnancy/postpartum ACOG standards, acute infections), co-occurring mental health, justice reentry tolerance loss, and housing/recovery environment entirely in browser RAM, and maps directly to SAMHSA service codes. Covers EMTALA (`42 U.S.C. § 1395dd`) and the DEA 72-Hour Rule (`21 CFR § 1306.07(b)`), with `@media print` clinical handoff sheets.
- **Privacy-First Deterministic Guided Navigator (`#/guided`, `guidedNavigator.js`):** step-by-step conversational triage that runs in browser RAM with zero network calls, calls the pure ASAM and population scoring functions locally, and enforces instant crisis/overdose red-flag interception routing to **988**, **911**, **Never Use Alone (`877-696-1996` / `800-484-3731`)**, **SafeSpot (`800-972-0590`)**, and `#/overdose`.
- **Medications & Pharmacology Guide (`#/medications`):** clinical pharmacist (PharmD) guide to FDA-approved Medications for Opioid Use Disorder (buprenorphine, methadone with 2024 `42 CFR Part 8` take-home/telehealth updates, extended-release naltrexone), Buprenorphine Low-Dose Micro-Induction ("Bernese Method") for fentanyl transitions, Medications for Alcohol Use Disorder, stimulant & nicotine pharmacotherapy, overdose reversal pharmacology (4 mg vs 8 mg naloxone, nalmefene, xylazine rescue breathing), and an interactive **Drug & Medication Interaction Explorer**.
- **Personal Safety Plan & First Appointment Guide (`#/plan`):** Substance Use Disorder Professional (SUDP) interactive safety and return-to-use action plan builder (printable via `@media print` and copyable, kept in browser RAM), step-by-step demystification of what happens at a first intake assessment, evidence-based therapy modalities (`CBT`, `MI`, `CMI`, `TRC`, `CRAFT`), and patient confidentiality rights under the **42 CFR Part 2 Final Rule (89 FR 12472)**.
- **Harm reduction (`#/harm-reduction`) & Overdose response (`#/overdose`):** naloxone access, Never Use Alone (`877-696-1996` / `800-484-3731`) and SafeSpot (`800-972-0590`) lines, fentanyl and xylazine test strip instructions, dangerous drug combination table, safer-use and xylazine wound care guidance, Good Samaritan law trackers, and step-by-step opioid and stimulant overdose guides with a 2-minute naloxone re-dose timer and opt-in offline storage.
- **Health, VA, IHS & Emergency Services (`#/health`) & State Directories (`#/states`):** distance search over HRSA-funded Community Health Centers (sliding-fee primary care), SAMHSA mental health & crisis facilities, **VA Medical Centers & Vet Centers**, **Indian Health Service (IHS) & Tribal facilities**, **CMS Rural Health Clinics**, **CMS Emergency Response Hospitals**, and all **56+ State & Territory Behavioral Health Agencies and Medicaid directories** (`data/state-medicaid.json`).
- **Recovery & family (`#/support`) & Choosing care (`#/choosing-care`):** peer support and meeting finders, NARR recovery housing, CRAFT family support, NIDA Words Matter language guide, questions to ask providers, and EKRA (`18 U.S.C. § 220`) patient-brokering red flags.

## Improvement roadmap

A parallel agent swarm reviewed the platform and implemented key clinical, insurance, and guided-navigation expansions while preserving privacy. See:

- [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md) — clinical expansion, insurance compatibility engine, deterministic guided navigator, accessibility/equity, and UX flows
- [docs/AI_NAVIGATOR_SPEC.md](docs/AI_NAVIGATOR_SPEC.md) — privacy-first conversational navigator MVP that uses the existing pure functions
- [docs/PHASE1_HELPERS.md](docs/PHASE1_HELPERS.md) — population helper functions in `public/js/views/populationHelpers.js`

## Privacy by design

Searching for substance use help is sensitive health information, so HarborPath:

- loads **no third-party scripts, fonts, maps, analytics, or cookies**, enforced by an identical `default-src 'self'` Content Security Policy in `src/app.js` and `vercel.json`;
- **rounds every location to about 1 km** before it leaves the browser and again on the server, and never writes locations to logs, storage, or the URL;
- geocodes ZIP codes and cities (across all 50 states, DC, Puerto Rico, Guam, USVI, American Samoa, and the Northern Mariana Islands) **on its own server** from Census data, so no third-party geocoder sees what people type;
- evaluates the **ASAM Care Navigator**, **Phase 1 Population Pathways**, **Insurance Compatibility Engine**, **Guided Navigator**, **Personal Safety Plan**, **Perinatal Care**, **Veterans Health Care**, **Adolescent Legal Care**, and **Poly-Substance Clinical Differential** in browser RAM without transmitting answers to any server;
- keeps saved places and offline copies off by default unless the visitor explicitly opts in on their device;
- has a **Quick exit** (button or `Esc` twice) that deterministically resets in-RAM state across all stateful modules (`runQuickExitResets()`), clears language preferences and any offline Service Worker cache, and occupies a single back-history entry.

## Run it

Requires Node.js 20 or newer. There are no npm dependencies.

```bash
npm start            # http://localhost:3000
npm test             # node:test suites: API, privacy, security, accessibility, geocoding, providers, regions, clinical safety, navigator integration, insurance engine, guided navigator, matching engine, registry
node scripts/smoke.mjs <url>   # post-deploy smoke test (see docs/DEPLOYMENT.md)
npm run data:build   # refresh data/ from SAMHSA, Census, HRSA, VA, IHS, CMS, and Medicaid
```

Environment variables: `PORT` (default `3000`), `HOST` (default `0.0.0.0`), and `TRUST_PROXY=<number of proxies>` (usually `1`) when running behind a load balancer, so rate limiting sees client IPs.

### Deploy

HarborPath needs a small Node server, because FindTreatment.gov does not allow browser (CORS) requests, so static hosting such as GitHub Pages will not work. Any Node or container host will:

```bash
docker build -t harborpath .
docker run -p 3000:3000 harborpath
```

Platforms that detect `npm start` (Render, Railway, Fly.io, Heroku-style hosts) work without the Dockerfile.

**Vercel:** Live at https://harborpath.vercel.app. `npx vercel deploy --prod`. `vercel.json` selects the Node server preset and applies the same security headers to files Vercel serves from its CDN (a test keeps them identical to the server’s). Data files are loaded through literal `new URL()` paths in `src/data.js` so Vercel bundles them with the server.

## Project layout

| Path | What it is |
| --- | --- |
| `server.js` | Entry point |
| `src/` | HTTP app, FindTreatment.gov client with stale-while-revalidate cache, offline geocoder, spatial grid & columnar tables, HRSA/VA/IHS/RHC/ER provider indexes, state/region directory, and rate limiter |
| `public/` | The web app: plain ES modules, bilingual `i18n` (`en`/`es`), opt-in offline Service Worker (`sw.js`), and WCAG 2.2 AA+ CSS with `@media print` clinical handout styles |
| `public/js/views/populationHelpers.js` | Phase 1 pure functions for population-specific provider matching (pregnancy, youth, justice reentry, older adults, stimulants, xylazine, co-occurring MH) |
| `public/js/views/navigator.js` | 6-dimension ASAM Criteria (4th Edition) Care Navigator, COWS/SOWS & CIWA/PAWSS withdrawal calculators, transition risk evaluator, and clinician handoff formatter |
| `public/js/match/engine.js` | Shared matching & insurance compatibility engine: coverage tiers, distance-preserving explainable ranking (pure; runs in the browser) |
| `data/` | Compacted public datasets (SAMHSA service codes, Census ZCTAs/places/island places, HRSA health centers, VA facilities, IHS facilities, CMS rural health clinics & emergency hospitals, state agencies & Medicaid), built by `scripts/build-data.mjs` |
| `test/` | `node:test` suites covering API, privacy headers, geocoding, federal providers, regional directories, MD/PharmD/SUDP clinical modules, navigator integration, insurance engine, and guided triage |
| `data/virtual-providers.json` | Online treatment program registry, served only after human review |
| `docs/SPEC.md` | Shared spec, interface contracts, workstream status, integration checklist |
| `docs/PROVIDER_DATA.md` | Provider data model, sources, and review workflow |
| `docs/SECURITY_REVIEW.md` | Security, privacy, clinical safety, and compliance review, with remediation status |
| `docs/QA_REPORT.md` / `docs/DEPLOYMENT.md` | Test results and coverage gaps / release, smoke test, and rollback |
| `docs/ARCHITECTURE.md` | Data flow, API reference, and design decisions |
| `docs/IMPROVEMENTS.md` | Ranked roadmap to serve more individuals |
| `docs/AI_NAVIGATOR_SPEC.md` | Privacy-first AI navigator design |
| `docs/PHASE1_HELPERS.md` | Population helper functions |
| `legacy/` | The earlier single-file prototype, kept for reference |

## Data sources

All datasets are U.S. federal government works in the public domain:

- [SAMHSA FindTreatment.gov API](https://findtreatment.gov/), queried live (cached up to 1 hour with stale-while-revalidate resilience) and state agency directory
- [HRSA Health Center Service Delivery Sites](https://data.hrsa.gov/), snapshot in `data/health-centers.json`
- [U.S. Department of Veterans Affairs (VA.gov)](https://www.va.gov/find-locations/), VHA medical centers, clinics, RRTPs, and Vet Centers in `data/va-facilities.json`
- [Indian Health Service (IHS)](https://www.ihs.gov/findhealthcare/), IHS, Tribal, and Urban Indian health facilities in `data/ihs-facilities.json`
- [CMS Provider Data](https://data.cms.gov/), Rural Health Clinics (`data/rural-health-clinics.json`) and Emergency Response Hospitals (`data/er-hospitals.json`)
- [Medicaid.gov](https://www.medicaid.gov/), state Medicaid behavioral health and eligibility directory (`data/state-medicaid.json`)
- [Census Gazetteer & TIGER](https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html) ZCTA, place, and U.S. territory centroids in `data/`

Hotline numbers and guidance were verified against each organization’s own site in October 2026. Sources are cited inline in the app.

## Not medical advice

HarborPath shares public health and clinical reference information and does not endorse providers. It never accepts payment for listings or referrals.
