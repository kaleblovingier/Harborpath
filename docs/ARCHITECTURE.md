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

All responses are JSON with `Cache-Control: no-store`.

| Endpoint | Parameters | Notes |
| --- | --- | --- |
| `GET /api/geocode` | `q`: a ZIP, "City, ST", or "City State" | Up to 8 matches. PO-box-only ZIPs fall back to a nearby ZIP with the same 3-digit prefix. |
| `GET /api/treatment` | `lat`, `lng`, `radius` (5, 10, 25, 50, or 100), `kind` (`sa` or `mh`), `codes` (comma-separated, up to 8), `page` | Codes are combined with AND by SAMHSA. 25 results per page. |
| `GET /api/health-centers` | `lat`, `lng`, `radius` | The 30 nearest sites plus the total count in range. |
| `GET /api/meta` | | Dataset dates for the footer |
| `GET /api/health` | | Liveness |

Errors use `400` for bad input (with a readable `error`), `429` when rate limited, and `502` when FindTreatment.gov fails. A `502` includes `fallbackUrl` and the SAMHSA helpline number so the UI can still offer a path to help.

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
