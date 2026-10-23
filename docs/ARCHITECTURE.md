# HarborPath architecture

## Request flow

```
Browser (public/)                     HarborPath server (src/)                External
─────────────────                     ────────────────────────                ────────
ZIP / city typed ──► /api/geocode ──► Census centroids in memory
"Use my location" (rounded on device)
                     /api/treatment ─► validate, coarsen to 0.01°, cache ──► findtreatment.gov
                     /api/health-centers ─► HRSA sites in memory
                     /api/meta ──────► data build dates
```

The server is a single Node `http` handler with no dependencies. It loads `data/*.json` and every file in `public/` into memory at startup, gzips compressible static files once, and serves them with ETags.

## Why a server at all

FindTreatment.gov sends no CORS headers, so browsers cannot call it directly. The proxy also lets HarborPath:

- coarsen coordinates before they reach SAMHSA,
- validate service codes against SAMHSA’s own taxonomy,
- normalize listings into a compact shape and map each listed service back to its code (100% of 6,844 service entries in a four-city sample matched),
- cache results for an hour and rate-limit clients, protecting the upstream API.

## API

All responses are JSON with `Cache-Control: no-store` and the same security headers as static files.

| Endpoint | Parameters | Notes |
| --- | --- | --- |
| `GET /api/geocode` | `q` (required, up to 200 characters): a ZIP, "City, ST", or "City State" | Up to 8 matches. PO-box-only ZIPs fall back to a nearby ZIP with the same 3-digit prefix. |
| `GET /api/treatment` | `lat`, `lng`, `radius`, `kind` (`sa` or `mh`), `codes` (comma-separated, up to 8), `page` (1 to 40) | Codes are combined with AND by SAMHSA. 25 results per page. `stale: true` marks an answer served from cache while FindTreatment.gov is down. With 2+ codes and no results, `relaxed` lists near-matches. |
| `GET /api/telehealth` | `state` (required), optional `lat` + `lng`, `kind`, `codes` (up to 7 besides `TELE`), `page` | Statewide telehealth programs. Without coordinates, results are sorted by name with `miles: null`. Same `stale` behavior as treatment. |
| `GET /api/health-centers` | `lat`, `lng`, `radius` | The 30 nearest HRSA sites plus the total count in range. |
| `GET /api/providers` | `lat`, `lng`, `type` (`va`, `ihs`, `er`, `rhc`), `radius`, optional `filter` (`va`: `health`/`vetcenter`; `ihs`: `bh`/`sud`) | The 30 nearest sites plus the total count. |
| `GET /api/nearby-summary` | `lat`, `lng`, `radius` | Counts and the nearest site per network, plus the state agency and Medicaid contacts. No upstream calls. |
| `GET /api/region` | `zip` (5 digits, optional `-1234`), or `lat` + `lng` | `{ region, nearby }`: the state or territory, plus neighbors near a border. |
| `GET /api/states` | | Every state and territory with resources. |
| `GET /api/state` | `code` (two letters) | One jurisdiction's agency, Medicaid, and harm reduction links. `404` for an unknown code. |
| `GET /api/freshness` | | When each bundled dataset was last updated (see below). |
| `GET /api/meta` | | Dataset dates for the footer (older shape, kept for the current client; now also has `directoryUpdated`). |
| `GET /api/health` | | Liveness |

**Parameter rules.** `lat` and `lng` must be plain decimal degrees within range (no hex, exponents, or `Infinity`); missing or blank is an error, never 0. Every endpoint reads them through `readLatLng` in `src/geo.js`, which rounds to 0.01° (about 1 km) before anything else sees them. `radius` must be exactly one of 5, 10, 25, 50, 100, 200, or 250, written as a plain integer (default 25).

### Errors

Error messages are fixed text. They never repeat what was sent, so a response cannot echo a location or search back.

| Status | When | Body |
| --- | --- | --- |
| `400` | Missing, malformed, or out-of-range parameter | `{ error }` |
| `404` | Unknown route or state code | `{ error }` |
| `429` | Rate limited (per client, per minute) | `{ error }`, with a `Retry-After` header |
| `502` | FindTreatment.gov failed and no recent cached copy exists | `{ error, reason, fallbackUrl, helpline, alternatives }` |
| `503` | FindTreatment.gov failed several times in a row, so HarborPath stops calling it for a short cooldown | as `502`, plus `retryAfterSeconds` and a `Retry-After` header |
| `500` | An unexpected server error | `{ error, reason: "internal", fallbackUrl, helpline, alternatives }` |

`reason` is one of `timeout`, `network`, `http`, `rate-limited`, `malformed`, `too-large`, `circuit-open`, or `internal`. `alternatives` lists phone options (SAMHSA National Helpline, 988, Never Use Alone) as `{ name, phone, tel, hours }`, so the UI can always offer a path to help.

### Upstream resilience

Treatment and telehealth searches share one client (`fetchListingPage` in `src/findtreatment.js`):

- **Hard deadline.** Each search gets 15 seconds in total, including retries. The timer aborts the fetch and also rejects on its own, so a response that never ends cannot hang a request.
- **Retries.** Network errors and `5xx` responses are retried up to twice with jittered exponential backoff, only while time remains. `4xx`, `429`, and malformed bodies are not retried.
- **Validation.** The body must parse as JSON with a `rows` array (or an empty `recordCount: 0`) and be under 4 MB. Rows that are not objects or that fail to normalize are skipped; counts that are negative or not numbers are ignored.
- **Stale while erroring.** Results are fresh for 30 minutes. For 30 minutes after that they are only used when FindTreatment.gov fails, marked `stale: true`. Nothing is kept longer than an hour.
- **Circuit breaker.** After 3 consecutive outages (timeouts, network errors, `5xx`, `429`), searches stop calling upstream for 30 seconds and answer from the stale cache or with `503`. Then one probe request is let through; success closes the breaker. A `4xx` or malformed answer means the upstream is reachable, so it does not count.
- **Sharing.** Identical concurrent searches share one upstream call.

### Data freshness: `GET /api/freshness`

```json
{
  "directoryUpdated": "2026-10-21T00:21:17.460Z",
  "directoryAgeDays": 2,
  "datasets": {
    "healthCenters": {
      "count": 13255,
      "sourceUpdated": "2026-10-20T11:05:09.000Z",
      "sourceAgeDays": 3,
      "builtAt": "2026-10-21T00:11:50.727Z",
      "updateCadence": null
    },
    "vaFacilities": { "count": 1784, "sourceUpdated": "2025-04-17T15:12:55.000Z", "sourceAgeDays": 554, "builtAt": "…", "updateCadence": "Monthly snapshot per VHA (check MONTHYEAR)" }
  },
  "treatment": { "live": true, "source": "SAMHSA FindTreatment.gov", "maxCacheMinutes": 60 }
}
```

- `directoryUpdated` is `data/meta.json` `builtAt`: when `npm run data:build` last ran. This is the date for "directory data last updated <date>".
- One entry per source in `data/meta.json`: `serviceCodes`, `zcta`, `places`, `healthCenters`, `zipStates`, `islandPlaces`, `stateAgencies`, `stateMedicaid`, `vaFacilities`, `ihsFacilities`, `erHospitals`, `ruralHealthClinics`.
- `sourceUpdated` is when the publisher last changed the data (its `Last-Modified` header, else its own modified or fetched date); `builtAt` is when HarborPath downloaded it. Either may be `null`. All dates are ISO 8601 in UTC, and ages are whole days.
- Treatment listings are not bundled. They are searched live and cached for at most `maxCacheMinutes`.

### Rate limiting and proxies

Each client gets 120 API requests a minute. The limiter tracks at most 50,000 addresses per window; past that, new addresses share one bucket. Keys stay in memory for one window and are never logged.

Behind a load balancer, set `TRUST_PROXY` to the number of proxies in front of the server (`1` for one; Vercel counts as one automatically). The client address is then the entry that many places from the **right** of `X-Forwarded-For`, which the trusted proxies wrote. Entries further left came from the client and could be forged, so they are never used. Without `TRUST_PROXY`, the header is ignored.

## Privacy decisions

| Decision | Where |
| --- | --- |
| No third-party origins. CSP is `default-src 'self'` with no external hosts. | `src/app.js` `SECURITY_HEADERS`, tested in `test/app.test.js` |
| Coordinates rounded to 0.01° on the device and again on the server | `public/js/api.js`, `src/geo.js` `readLatLng` |
| Missing coordinates are rejected, never treated as 0 | `src/geo.js` `readLatLng` |
| Error logs include only the route, never the query string | `src/app.js` `handleApi` |
| `Referrer-Policy: no-referrer` and `rel="noopener noreferrer"` on outbound links | headers and `public/js/dom.js` `ext()` |
| Location stays in memory only; saved list is opt-in persistent | `public/js/state.js` |
| Quick exit wipes state and calls `location.replace()`; internal navigation also uses `replace()`, so the site holds one history entry | `public/js/app.js` |
| All DOM text set through `textContent`, never `innerHTML` | `public/js/dom.js` `h()` |

HarborPath stores no personal health information, so it is not a HIPAA covered entity or a 42 CFR Part 2 program. The consent-vault design in `legacy/` is not part of this build.

## Data refresh

`npm run data:build` downloads and compacts:

- `service-codes.json`: SAMHSA service taxonomy (33 categories)
- `zcta.json`: about 33,800 ZIP code centroids
- `places.json`: about 32,000 cities, towns, and CDPs, with Census suffixes removed (`"Indianapolis city (balance)"` becomes `"Indianapolis"`, and aliases like `"San Buenaventura (Ventura)"` are indexed under both names)
- `health-centers.json`: about 13,000 active HRSA service sites, excluding administrative-only sites and closed-population settings (schools, correctional facilities, nursing homes, DV shelters)

HRSA updates its file daily. Re-running the build monthly keeps health center data current. Treatment data is always live.

## Front end

There is no build step: native ES modules under `public/js/`.

- `app.js`: hash router, quick exit, mobile nav
- `components/`: location picker (an ARIA combobox), finders, facility cards, overdose guide and timer
- `views/`: page content. Guidance is sourced inline from SAMHSA, CDC, FDA, NIDA, NIAAA, and HRSA.
- `content/hotlines.js`: national support lines, the single source for every page that lists them
- `codes.js`: plain-language filter groups and badge rules on top of SAMHSA service codes

## Safety checks

The client has no build step, so one missing module or misspelled import stops the whole app from loading in the browser, even while every server test passes. That once happened when a commit replaced `public/js/views/navigator.js` with the literal text `$(cat /tmp/navigator_updated.js)`. These `npm test` suites guard against it, and CI (`.github/workflows/ci.yml`) runs them on every push to `main` and every pull request against `main`, on Node 20 and 22:

| Suite | What it checks |
| --- | --- |
| `test/client-modules.test.js` | Walks every module under `public/js`, parses static `import … from`, `export … from`, and literal dynamic `import('…')`, and fails if a relative target file is missing, if a specifier is bare or lacks `.js`, or if a named import (or `default`) is not exported by its target. Also checks that `index.html` loads `/js/app.js`. |
| `test/file-integrity.test.js` | For tracked text files under `public/`, `src/`, `test/`, and `scripts/`: fails on files that start with an unexpanded shell substitution (`$(cat …`, a backtick `cat`, a bare `$VAR`, a heredoc marker), on empty files, on any imported `.js` module under 50 bytes, and on `.js`/`.json` files in `public/` or `src/` that do not parse (`node --check`, `JSON.parse`). |
| `test/smoke.test.js` | Boots the real app handler on a random port and requests `index.html` plus every path in `APP_SHELL` in `public/sw.js`, requiring HTTP 200, a non-trivial body, and a JavaScript content type for `.js` files. It also walks the import graph from `app.js` and fails if a reachable module is missing from `APP_SHELL`, because offline mode would then break. |

The checks use regexes and Node built-ins only, with no dependencies. When you add a client module, import it with a relative `.js` path and add it to `APP_SHELL` if the app imports it.
