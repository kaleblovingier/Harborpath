# HarborPath

A free, privacy-first platform for finding **addiction treatment**, **harm reduction tools**, and **related health services** in the United States.

- **Find treatment:** live search of SAMHSA’s [FindTreatment.gov](https://findtreatment.gov/), the federal directory of state-licensed facilities. Filter by medication (buprenorphine, methadone, naltrexone, OTPs, alcohol use disorder medication), type of care, payment (Medicaid, sliding scale, free), population served, language, and extras like naloxone or HIV testing.
- **Harm reduction:** naloxone access, Never Use Alone and SafeSpot lines, fentanyl and xylazine test strip instructions, a cited table of dangerous combinations, safer-use and wound care guidance, and Good Samaritan law resources.
- **Overdose response:** step-by-step opioid and stimulant guides with a 2-minute naloxone re-dose timer.
- **Health services:** distance search over every HRSA-funded community health center (sliding-fee primary care), mental health facilities including walk-in and mobile crisis care, HIV, hepatitis C, and PrEP resources, and help with coverage.
- **Recovery & family:** peer support and meeting finders, recovery housing, CRAFT and family support, and the NIDA language guide.
- **Choosing care:** signs of quality treatment, questions to ask, and red flags for patient brokering.

## Privacy by design

Searching for substance use help is sensitive health information, so HarborPath:

- loads **no third-party scripts, fonts, maps, analytics, or cookies**, enforced by a `default-src 'self'` Content Security Policy;
- **rounds every location to about 1 km** before it leaves the browser and again on the server, and never writes locations to logs, storage, or the URL;
- geocodes ZIP codes and cities **on its own server** from Census data, so no third-party geocoder sees what people type;
- keeps saved places in memory unless the visitor opts in to keeping them on the device;
- has a **Quick exit** (button or Esc twice) that erases local state and replaces the page, and occupies a single back-history entry.

## Run it

Requires Node.js 20 or newer. There are no npm dependencies.

```bash
npm start            # http://localhost:3000
npm test             # 31 tests: API, privacy guarantees, geocoding, data pipeline
npm run data:build   # refresh data/ from SAMHSA, Census, and HRSA
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
| `src/` | HTTP app, FindTreatment.gov client, offline geocoder, health center index, cache and rate limiter |
| `public/` | The web app: plain ES modules and CSS, no build step |
| `data/` | Compacted public datasets (service codes, ZIP and place centroids, health centers), built by `scripts/build-data.mjs` |
| `test/` | `node:test` suites, plus a recorded FindTreatment.gov fixture |
| `docs/ARCHITECTURE.md` | Data flow, API reference, and design decisions |
| `legacy/` | The earlier single-file prototype, kept for reference |

## Data sources

All datasets are U.S. federal government works in the public domain.

- [SAMHSA FindTreatment.gov API](https://findtreatment.gov/), queried live (cached up to 1 hour)
- [HRSA Health Center Service Delivery Sites](https://data.hrsa.gov/), snapshot in `data/health-centers.json`
- [Census Gazetteer](https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html) ZCTA and place centroids, snapshot in `data/`

Hotline numbers and guidance were verified against each organization’s own site in October 2026. Sources are cited inline in the app.

## Not medical advice

HarborPath shares public health information and does not endorse providers. It never accepts payment for listings or referrals.
