# HarborPath

A free, privacy-first platform for finding **addiction treatment**, **clinical care navigation**, **evidence-based medications**, **harm reduction tools**, and **safety-net health services** across the United States and U.S. territories (in **English and Español**).

- **Find treatment (`#/treatment`):** live search of SAMHSA’s [FindTreatment.gov](https://findtreatment.gov/), the federal directory of state-licensed facilities. Filter by medication (buprenorphine, methadone, naltrexone, OTPs, alcohol use disorder medication), type of care, payment (Medicaid, sliding scale, free), population served, language, and extras like naloxone or HIV/HCV testing. Includes rural/island reach expansion (up to 250 miles) and statewide telehealth listings.
- **Clinical Care Navigator (`#/navigator`):** zero-knowledge, 6-dimension **ASAM Criteria (4th Edition)** clinical self-check authored from an Addiction Medicine (MD) perspective. Evaluates withdrawal risk (including alcohol/benzodiazepine seizure risk, opioid stabilization, and xylazine/medetomidine alpha-2 rebound), biomedical conditions (pregnancy/postpartum ACOG standards, acute infections), co-occurring mental health, and housing/recovery environment entirely in browser RAM, and maps directly to SAMHSA service codes. Covers EMTALA and the DEA 72-Hour Rule (`21 CFR § 1306.07(b)`).
- **Medications & Pharmacology Guide (`#/medications`):** clinical pharmacist (PharmD) guide to FDA-approved Medications for Opioid Use Disorder (buprenorphine, methadone with 2024 `42 CFR Part 8` take-home/telehealth updates, extended-release naltrexone), Buprenorphine Low-Dose Micro-Induction ("Bernese Method") for fentanyl transitions, Medications for Alcohol Use Disorder, stimulant & nicotine pharmacotherapy, overdose reversal pharmacology (4 mg vs 8 mg naloxone, nalmefene, xylazine rescue breathing), and an interactive **Drug & Medication Interaction Explorer**.
- **Personal Safety Plan & First Appointment Guide (`#/plan`):** Substance Use Disorder Professional (SUDP) zero-knowledge interactive safety and return-to-use action plan builder (printable and copyable, stored only in browser RAM), step-by-step demystification of what happens at a first intake assessment, evidence-based therapy modalities (`CBT`, `MI`, `CMI`, `TRC`, `CRAFT`), and patient confidentiality rights under the **42 CFR Part 2 Final Rule (89 FR 12472)**.
- **Harm reduction (`#/harm-reduction`) & Overdose response (`#/overdose`):** naloxone access, Never Use Alone and SafeSpot lines, fentanyl and xylazine test strip instructions, dangerous drug combination table, safer-use and xylazine wound care guidance, Good Samaritan law trackers, and step-by-step opioid and stimulant overdose guides with a 2-minute naloxone re-dose timer and opt-in offline storage.
- **Health, VA, IHS & Emergency Services (`#/health`) & State Directories (`#/states`):** distance search over HRSA-funded Community Health Centers (sliding-fee primary care), SAMHSA mental health & crisis facilities, **VA Medical Centers & Vet Centers**, **Indian Health Service (IHS) & Tribal facilities**, **CMS Rural Health Clinics**, **CMS Emergency Response Hospitals**, and all **56+ State & Territory Behavioral Health Agencies and Medicaid directories**.
- **Recovery & family (`#/support`) & Choosing care (`#/choosing-care`):** peer support and meeting finders, NARR recovery housing, CRAFT family support, NIDA Words Matter language guide, questions to ask providers, and EKRA (`18 U.S.C. § 220`) patient-brokering red flags.

## Privacy by design

Searching for substance use help is sensitive health information, so HarborPath:

- loads **no third-party scripts, fonts, maps, analytics, or cookies**, enforced by a `default-src 'self'` Content Security Policy;
- **rounds every location to about 1 km** before it leaves the browser and again on the server, and never writes locations to logs, storage, or the URL;
- geocodes ZIP codes and cities (across all 50 states, DC, Puerto Rico, Guam, USVI, American Samoa, and the Northern Mariana Islands) **on its own server** from Census data, so no third-party geocoder sees what people type;
- evaluates the **ASAM Care Navigator** and **Personal Safety Plan** 100% in browser RAM, never transmitting answers to any server;
- keeps saved places and offline copies off by default unless the visitor explicitly opts in on their device;
- has a **Quick exit** (button or `Esc` twice) that erases local state, language preferences, and any offline Service Worker cache, and occupies a single back-history entry.

## Run it

Requires Node.js 20 or newer. There are no npm dependencies.

```bash
npm start            # http://localhost:3000
npm test             # 71 tests: API, privacy guarantees, geocoding, providers, regions, clinical modules
npm run data:build   # refresh data/ from SAMHSA, Census, HRSA, VA, IHS, CMS, and Medicaid
```

Environment variables: `PORT` (default `3000`), `HOST` (default `0.0.0.0`), and `TRUST_PROXY=1` when running behind a load balancer, so rate limiting sees client IPs.

### Deploy

HarborPath needs a small Node server, because FindTreatment.gov does not allow browser (CORS) requests, so static hosting such as GitHub Pages will not work. Any Node or container host will:

```bash
docker build -t harborpath .
docker run -p 3000:3000 harborpath
```

Platforms that detect `npm start` (Render, Railway, Fly.io, Heroku-style hosts) work without the Dockerfile.

**Vercel:** `npx vercel deploy --prod`. `vercel.json` selects the Node server preset and applies the same security headers to files Vercel serves from its CDN (a test keeps them identical to the server’s). Data files are loaded through literal `new URL()` paths in `src/data.js` so Vercel bundles them with the server.

## Project layout

| Path | What it is |
| --- | --- |
| `server.js` | Entry point |
| `src/` | HTTP app, FindTreatment.gov client with stale-while-revalidate cache, offline geocoder, spatial grid & columnar tables, HRSA/VA/IHS/RHC/ER provider indexes, state/region directory, and rate limiter |
| `public/` | The web app: plain ES modules, bilingual `i18n` (`en`/`es`), opt-in offline Service Worker (`sw.js`), and WCAG 2.2 AA+ CSS with `@media print` clinical handout styles |
| `data/` | Compacted public datasets (SAMHSA service codes, Census ZCTAs/places/island places, HRSA health centers, VA facilities, IHS facilities, CMS rural health clinics & emergency hospitals, state agencies & Medicaid), built by `scripts/build-data.mjs` |
| `test/` | `node:test` suites covering API, privacy headers, geocoding, federal providers, regional directories, and MD/PharmD/SUDP clinical modules |
| `docs/ARCHITECTURE.md` | Data flow, API reference, and design decisions |
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
