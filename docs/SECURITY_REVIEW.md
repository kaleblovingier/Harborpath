# Security, privacy, clinical safety & compliance review

> **Remediation status: round 1 findings (updated 2026-10-27)**
>
> All 14 findings are now closed. Findings 2–8 and 14 were fixed in round 2 by the clinical-safety and privacy/compliance swarms. Every fix has a regression test.
>
> | # | Severity | Status |
> |---|---|---|
> | 1 | High | **Fixed.** Rate-limit key uses the trusted hop from the right of `X-Forwarded-For`; `TRUST_PROXY` is opt-in (`test/security.test.js`). |
> | 2 | Medium | **Fixed.** Navigator output is framed as the person's own self-reported answers, with a "not a diagnosis" disclaimer and no clinician-document wording (`test/clinical-safety.test.js`). |
> | 3 | Medium | **Fixed.** Uncited mortality percentages are replaced with qualitative wording; the naltrexone claim is corrected (EN + ES). |
> | 4 | Medium | **Fixed.** A "For prescribers. Not for self-dosing." callout sits above the micro-induction table. |
> | 5 | Medium | **Fixed.** A self-harm answer shows a crisis-first 988/911 card above any level-of-care result. |
> | 6 | Medium | **Fixed.** Privacy claims are rewritten to match real data flows, including host access logs. A test bans absolute claims in both languages (`test/privacy.test.js`). |
> | 7 | Medium | **Fixed.** Filters in links (`?codes=`, `?tab=`) are kept in memory and stripped from the address bar, history, and session restore. Clipboard notes are added. |
> | 8 | Medium | **Fixed in code.** A consumer health data notice is on the privacy page. It makes no compliance claim. *Legal review by the owner is still recommended.* |
> | 9 | Low | **Fixed.** Limiter caps keys; see round 2 finding R2-1 for the overflow redesign. |
> | 10 | Low | **Fixed.** No upstream body text in logs. |
> | 11 | Low | **Fixed.** HSTS. |
> | 12 | Low | **Fixed.** `safeHref` guards every data-driven external link (round 2 extended it to facility, provider, and state links). |
> | 13 | Info | **Fixed.** New modules are in the offline shell. |
> | 14 | Info | **Fixed.** Legacy files carry a "not deployed, no compliance claim" banner. |
>
> **Round 2 adversarial review (security swarm H2): all findings fixed**
>
> | # | Severity | Finding | Fix |
> |---|---|---|---|
> | R2-1 | Medium | One shared overflow bucket let ~10k distinct keys lock out every new visitor, and could fail container health checks. | 1024 salted overflow buckets; `/api/health` exempt from limiting (`src/cache.js`, `src/app.js`). |
> | R2-2 | Medium | IPv6 clients could rotate through 2^64 keys in their /64. | Keys are IPv6 /64 prefixes; IPv4-mapped addresses are keyed as IPv4 (`networkKey`). |
> | R2-3 | Low | One fixed trusted hop; empty `X-Forwarded-For` entries produced the key `''`. | `TRUST_PROXY` is a hop count; empty entries fall back to the socket address. |
> | R2-4 | Low | Malformed registry fields could throw in the validator or the browser engine. | Every field is type-checked, the validator never throws, and lookups use own properties. |
> | R2-5 | Low | `normalizeProfile` accepted prototype keys (`toString`, `constructor`). | `Object.hasOwn` checks. |
> | R2-6 | Low | Some external links skipped the scheme check. | `safeHref` everywhere data supplies a URL. |
> | R2-7 | Info | Registry responses included internal review notes. The handler had no top-level catch. | Only public fields are served; a last-resort catch returns 500. |
>
> **Accessibility audit (QA swarm I2, axe-core 4.14, 120 page states): all findings fixed except one noted below**
>
> | Severity | Finding | Fix |
> |---|---|---|
> | High | Focus dropped to `<body>` whenever match results re-rendered (filters, compare, results load, "Everyone is safe"). | `rerender(focusId)` restores focus to the control, or to the results or step heading. |
> | Medium | Arrow keys on the "anyone in danger?" radio opened the emergency panel (WCAG 3.2.2). | The question is now a button. |
> | High | `#/navigator` and `#/plan` overflowed horizontally at 320–375px. A round-2 check also found a long URL overflowing `#/privacy`. | `.select` max-width, `min-width: 0` on flex/fieldset children, `overflow-wrap` on views. |
> | Medium | `aria-current="null"` on 22 medication buttons. | `removeAttribute`, plus a repo-wide test that `setAttribute` is never passed null. |
> | Serious | Two scrollable tables could not be reached by keyboard. | `tabindex="0"`, `role="region"`, and a label. |
> | Medium | Safety-bar links were under 24px tall. | `min-height: 24px`. |
> | Low | Disabled Compare box gave no reason; filter count changes were not announced; `aria-labelledby` pointed at a missing id; timer `aria-label` on a role-less div. | All fixed. |
> | Known | When the page is scrolled to certain offsets, the sticky emergency bar can partly cover the language links, and axe flags `target-size`. | Not changed. The always-visible emergency bar is a safety feature; revisit with a design change. |
>
> The original review follows unchanged. It covered the code at `bb502ba`, before these fixes.

# HarborPath security, privacy, clinical-safety and compliance review (Swarm H)

- Date: 2026-10-27. Commit reviewed: `bb502ba`.
- Scope: the existing code in `src/`, `public/`, `server.js`, `vercel.json`, `Dockerfile`, `sw.js`, and the docs that describe compliance. New in-flight files under `public/js/match/` were left out on purpose.
- Method: a read-only code review. Every finding below was checked against the source. Two of them were also reproduced with scratch scripts that ran outside the repo.
- Tests: `npm test` ran **93 tests in 8 suites, 93 pass, 0 fail** (about 1.4 s).

## Summary

| # | Sev | Area | Finding |
|---|-----|------|---------|
| 1 | High | API | The rate limit can be bypassed by sending a fake `X-Forwarded-For` header. The Docker image trusts that header by default. |
| 2 | Medium | Clinical | The navigator produces an "ASAM 4th Edition Clinical Care Summary & Provider Handoff Note" with "Physician clinical notes" and a "Recommended level of care", built from self-report. |
| 3 | Medium | Clinical | The navigator says extended-release naltrexone cuts fatal overdose risk "by more than half". Several other mortality percentages in the navigator have no source. |
| 4 | Medium | Clinical | The navigator gives a patient-facing micro-induction dosing table (medications view). |
| 5 | Medium | Clinical | A person who reports self-harm thoughts is given "IOP/PHP (Level 2.1/2.5)" as the headline result. |
| 6 | Medium | Privacy/Compliance | Privacy claims go further than what the code and hosting actually guarantee ("never saved to disk", "erases everything", "does not record"). Search parameters, including typed address text, travel in URL query strings that host or proxy access logs can record. |
| 7 | Medium | Privacy | Health-revealing service codes go into the URL hash, which ends up in browser history and session restore. Navigator output and clipboard copies outlive Quick Exit. |
| 8 | Medium | Compliance | No consumer-health-data privacy policy, rights process, or contact point exists, as WA MHMDA and similar laws require for IP-linked SUD search data. |
| 9 | Low | Privacy | The rate limiter keeps client IPs in memory without limit when traffic is idle. This contradicts its own comment. |
| 10 | Low | Logging | Error logs include up to 80 characters of the upstream response body. |
| 11 | Low | Headers | There is no HSTS header in the app or in `vercel.json`. Docker and self-hosted deployments depend on the proxy to add it. |
| 12 | Low | XSS (defense in depth) | Client link helpers do not check the URL scheme. They rely on the server's `normalizeWebsite` and on CSP. |
| 13 | Info | Offline safety | The SW `APP_SHELL` is a hand-kept list. New modules, such as `public/js/match/`, will break the offline overdose page unless they are added to it. |
| 14 | Info | Compliance docs | `legacy/ARCHITECTURE_AND_COMPLIANCE.md` claims "Full compliance with ... HIPAA". It is not deployed but is still in the repo. |

---

## Findings

### 1. HIGH: Spoofed `X-Forwarded-For` bypasses the rate limit, and the Docker image trusts it by default
- **Where**
  - `src/app.js:115-121` (`clientKey` takes the leftmost XFF entry).
  - `Dockerfile` (`ENV TRUST_PROXY=1`).
  - `server.js:10`.
  - `src/cache.js:62-76`.
- **What happens**
  - When `trustProxy` is on, the client key is `fwd.split(',')[0]`. That is the leftmost entry, and the client controls it whenever a proxy appends to the header instead of replacing it. Most proxies append: nginx `$proxy_add_x_forwarded_for`, AWS ALB, and GCP LB all do.
  - The Docker image turns `TRUST_PROXY=1` on unconditionally, so a container that is reachable directly also trusts the header.
- **Reproduced** with a scratch script (`trustProxy: true`, `max: 3`):
  - Six requests, each with a different spoofed XFF, all returned `200`.
  - Six requests without XFF returned `200,200,200,429,429,429`.
- **How it fails**
  - An attacker sends unlimited `/api/treatment` and `/api/telehealth` requests with random XFF values and changing coordinates or codes.
  - Each request misses the cache and makes 1 to 2 upstream calls to `findtreatment.gov`, which retries up to 2 times. HarborPath becomes an amplifier against SAMHSA's API, and the server's egress IP can get throttled or blocked. That breaks treatment search for every user.
  - Each spoofed key also adds an entry to the limiter `Map` for the window, so memory grows with attacker request rate.
- **Fix**
  - Use the **rightmost** XFF entry, or the entry that is N hops from the right for a configured number of trusted proxies. Alternatively, read a header the platform sets itself, such as `x-vercel-forwarded-for` or `x-real-ip` from a trusted proxy.
  - Remove `TRUST_PROXY=1` from the Dockerfile default and document it as an opt-in.
  - Cap the limiter map size: refuse or evict once it holds more than N keys.
  - On serverless platforms the per-instance in-memory limiter is weak. Add a platform WAF or rate-limit rule for `/api/treatment` and `/api/telehealth`.

### 2. MEDIUM (clinical safety): A self-report screen is presented as a clinician-grade ASAM assessment and handoff note
- **Where**
  - `public/js/views/navigator.js:495-560` (`formatAsamHandoffText`): the headers are "ASAM 4TH EDITION CLINICAL CARE SUMMARY & PROVIDER HANDOFF NOTE", "RECOMMENDED LEVEL OF CARE", "Clinical Rationale", and "PHYSICIAN CLINICAL NOTES".
  - `:1206` ("ASAM Criteria (4th Edition) Clinical Care Pathway").
  - `:1233-1236` (copied to the clipboard as a "Clinical handoff note").
  - `:1649` ("zero-knowledge clinical self-check").
- **How it fails**
  - A user pastes or prints the note for an intake worker or ED. It reads like a document a clinician wrote, with a level-of-care determination.
  - The receiving staff could anchor on it, or the user could rely on it to skip a real assessment.
  - Using the "ASAM Criteria" name suggests ASAM endorsement. ASAM licenses the Criteria and its software implementations.
  - The navigator and medications views contain no "not a diagnosis / not medical advice" statement. A grep found none. The only disclaimers are the global footer and the Privacy page.
- **Fix**
  - Retitle the output, for example "Self-reported answers to share with a clinician (not an assessment)".
  - Remove "Physician clinical notes" and "Clinical rationale".
  - Phrase the level as "Programs that may fit: …" and add "Only a licensed clinician can determine level of care."
  - Add a visible "Not a diagnosis or medical advice" note at the top of the navigator and in the copied text.
  - Change "ASAM Criteria (4th Edition)" to "informed by the six ASAM dimensions", or get permission from ASAM.

### 3. MEDIUM (clinical accuracy): An inaccurate mortality claim for naltrexone, and unsourced percentages
- **Where**
  - `navigator.js:643`: "buprenorphine (BU), methadone (MU/OTP), and extended-release naltrexone (NU)—cut fatal overdose risk by more than half".
  - `navigator.js:374`: "cuts fatal overdose risk by 60–80%".
  - `navigator.js:403`: "reduces post-release overdose mortality by up to 75%".
  - `core.js:186`: lists naltrexone among "the most effective treatment".
  - `navigator.js` has 0 source URLs. `medications.js` has 30.
- **How it fails**
  - The observational evidence (for example, Larochelle et al., Ann Intern Med 2018) shows lower overdose mortality for methadone and buprenorphine but **no** significant association for naltrexone.
  - A person choosing between medications could pick XR-naltrexone believing it protects equally against death. They would also face the overdose risk of losing tolerance after detox.
- **Fix**
  - Limit the mortality claim to methadone and buprenorphine.
  - Cite a source (SAMHSA TIP 63, NASEM 2019, or the relevant cohort studies) for every numeric effect size, or remove the numbers.
  - Have a clinician review all clinical strings in the navigator.

### 4. MEDIUM (clinical safety): A patient-facing buprenorphine micro-induction dosing schedule
- **Where**
  - `public/js/views/medications.js:1253-1281`: the Bernese table (`BERNESE_EXAMPLE_SCHEDULE`) shows doses from 0.25–0.5 mg up to 12–24 mg/day while the person keeps using a full agonist.
  - `medications.js:354`.
- **How it fails**
  - A person without a prescriber follows the "illustrative" table using street fentanyl and split films, because the doses are not practical to measure. The result is precipitated or unmanaged withdrawal, or continued fentanyl use with a false sense of protection.
  - The caveat appears only as `fine` print *after* the table.
- **Fix**
  - Move a prominent "Only with a prescriber; do not self-start" callout *above* the table.
  - Consider replacing exact milligram amounts with a description of the phases plus a "ask your prescriber or a bridge clinic" CTA and the SAMHSA helpline.

### 5. MEDIUM (clinical safety): Reported self-harm thoughts produce a headline of outpatient-level care
- **Where**
  - `navigator.js:773-780`: `mentalHealth === 'severe_crisis'` only sets `needsLevel2IOPOrPHP`.
  - `:726-733`: the crisis text is shown as a red flag.
  - `:1084`: the option label is "In severe emotional distress, thoughts of self-harm, or feeling unsafe right now".
- **Good:** the red-flag callout includes `tel:911` and `tel:988` buttons (`:1168-1173`).
- **How it fails**
  - The main `<h3>` heading still says "Intensive Outpatient (IOP) or Partial Hospitalization", and the primary CTA is "Search matching treatment near me".
  - For someone who is actively unsafe, the most prominent message is a non-urgent program search.
- **Fix**
  - When `severe_crisis` is chosen, put a crisis-first card *above* the level card ("Right now: call/text 988, or 911 if in immediate danger"). Make 988 the primary CTA and the treatment search secondary.

### 6. MEDIUM (privacy/compliance): Privacy claims go beyond what the system guarantees
- **Claims**
  - `core.js` Privacy page: "Our server does not record search terms, ZIP codes, or coordinates."
  - `navigator.js:1649-1655`: "never sent to a server, saved to disk… Closing this tab or pressing Quick Exit erases everything immediately", and "100% private, zero-knowledge".
- **Actual flows**
  - Every search sends parameters as **URL query strings** to the app origin (`api.js:13-21`):
    - `/api/geocode?q=<whatever the user types>` on each debounced keystroke. Users may type a full home address. The server truncates to 80 characters (`geo.js:293`), but the full URL has already been received.
    - `/api/treatment?lat&lng&codes=OTP,PW…`
    - `/api/region?zip=`
  - The app code does not log these. `app.js:280,324` log only the route, which is good. However, the hosting platform (Vercel request/runtime logs) and any reverse proxy in front of Docker record request URLs together with the client IP, and the app cannot control those logs.
  - The result is IP + ZIP or typed address + SUD service codes sitting in a third party's logs. The codes reveal things like pregnancy (`PW`), adolescent care (`ADOL`), or methadone (`OTP`).
  - The "saved to disk" and "erases everything" claims are also false because of finding 7.
- **How it fails**
  - FTC Act §5 treats inaccurate privacy promises in a health context as deceptive. The FTC enforced this against GoodRx (2023, under HBNR + §5), BetterHelp (2023), and Flo (2021).
- **Fix**
  1. Configure or confirm host log retention so query strings are dropped or redacted, and document the hosting provider as a processor.
  2. Better: send search parameters in a `POST` JSON body, or at least keep `q` and `codes` out of the URL. CSP and the method allow-list would need updating.
  3. Rewrite the claims to be exact: "HarborPath's code does not log…; our host keeps standard access logs for N days"; "erases what HarborPath stored in this browser". Remove "zero-knowledge" and "never saved to disk".

### 7. MEDIUM (privacy, shared-device threat model): Health-revealing state survives in history, session restore, and the clipboard
- **Where**
  - `navigator.js:379,483,914-915`: navigator results become `#/treatment?codes=…` links.
  - `views/populationHelpers.js:12-60` (`PW,HI,DT…` pregnancy, `CJ` justice-involved).
  - `medications.js:28-274`.
  - `app.js:85`: `location.replace` keeps only one history slot, but that slot holds the current URL, and same-document fragment URLs can still be written to the browser's global history and session-restore data.
  - Quick Exit (`app.js:90-95`, `state.js:83-90`) does not touch the clipboard. `navigator.js:1235`, `plan.js:651,847`, and `core.js:437` copy the handoff note (substances and mental-health answers), the safety plan, and the saved list to the system clipboard. Clipboard history can sync across devices on Windows, iOS, and Android keyboards.
- **How it fails**
  - On a shared or monitored phone, address-bar autocomplete or history shows `…/#/treatment?codes=OTP,PW,DT`. The tab title is also "Find treatment · HarborPath".
  - After Quick Exit, pasting reveals the handoff note.
  - The Privacy page does mention history (`privacy.safety.3`), but the navigator promises that "everything" is erased.
- **Fix**
  - Pass navigator and preset codes through in-memory state (for example, `setPendingCodes()` followed by `location.replace('#/treatment')`) instead of the hash. Alternatively, use opaque preset IDs that do not encode conditions.
  - Before copying, warn that "copied text stays on your clipboard".
  - In Quick Exit, try `navigator.clipboard.writeText('')`. It is best effort and needs focus.
  - Make the navigator's privacy text match what actually happens.

### 8. MEDIUM (compliance): Consumer-health-data law obligations are not addressed
See the **Compliance analysis** section below. The short version:
- The server receives the IP address together with SUD service selections and a location close to 1 km. Under WA MHMDA, that is "consumer health data", because it identifies a consumer seeking health care services and is reasonably linkable through the IP.
- Missing pieces:
  - a separate Consumer Health Data Privacy Policy linked from the homepage;
  - a process for access and deletion requests and a contact point;
  - a processor contract with the host;
  - disclosure that rounded searches are shared with SAMHSA.

**Fix:** add a short MHMDA-style policy page and link it from the home page and footer. List the categories (IP, rounded location, ZIP or typed place, service filters), purposes, the third parties (the hosting provider as processor, and SAMHSA FindTreatment.gov as the recipient of rounded location and codes *without* IP), retention (in-memory cache ≤ 1 h, limiter 1 window, host logs N days), and how to contact the operator. Sign a DPA with the host.

### 9. LOW: Limiter IPs stay in memory when there is no traffic
- **Where:** `src/cache.js:60-76`. The comment says "Keys live only in memory for one window", but the `Map` is replaced only inside `allow()`.
- **How it fails:** after a burst, if no `/api/` request arrives, the last window's client IPs stay in process memory indefinitely and appear in heap dumps or crash dumps.
- **Fix:** clear the map on an `unref()`'d `setInterval(windowMs)`, the same way `createCache` sweeps.

### 10. LOW: Upstream body text is logged
- **Where:** `findtreatment.js:149` and `telehealth.js:111` put `text.slice(0, 80)` into `err.message`, and `app.js:324` logs `err.message`.
- **How it fails:** if FindTreatment.gov echoes the request parameters in its plain-text error, the coarse coordinates and codes reach the logs, against the "never logged" promise. The current known message ("Invalid request. Please verify the parameters.") does not echo them.
- **Fix:** log a fixed message plus the HTTP status, and keep upstream text out of logs.

### 11. LOW: No HSTS header
- **Where:** `src/app.js:31-41` and `vercel.json:6-37`.
- **What happens:**
  - Vercel adds HSTS on its own domains. Docker and self-hosted deployments behind a TLS proxy get none unless the proxy adds it.
  - A first visit over plain HTTP on hostile Wi-Fi can be downgraded, and the attacker can then see the routes and query strings described in finding 6.
- **Fix:** add `Strict-Transport-Security: max-age=63072000; includeSubDomains` in both places. Send it only over HTTPS, or put it in the proxy documentation.

### 12. LOW (defense in depth): Client link helpers trust the `href`
- **Where:**
  - `dom.js:45-49` (`ext`);
  - `facilityCard.js:105,166,298` (`f.website`, `web`);
  - `stateResources.js:222-266`;
  - `common.js:60`;
  - `core.js:452` (`renderSavedCard` renders entries from `localStorage` when persistence is on).
- **Current status:**
  - `normalizeWebsite` (`src/util.js:8-21`) blocks `javascript:` and `data:`. I tested `javascript:alert(1)`, `javascript://x.y/%0aalert(1)` and `data:` and all returned `null`.
  - CSP `script-src 'self'` with no `'unsafe-inline'` blocks `javascript:` URL execution.
  - There are no `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `document.write` or `eval` sinks in existing code, and `h()` creates text nodes only.
  - Remaining gaps: `normalizeWebsite` still allows `http:` and `user:pass@` URLs. The saved list read from `localStorage` is not re-validated.
- **How it fails:** a future upstream field or a new view (for example, the new `match/` engine) passes an unnormalized URL to `href`. On a CSP-less host (a misconfigured CDN), that becomes XSS on a health site.
- **Fix:**
  - Add a `safeHref()` guard in `dom.js` (an allow-list of `https:`, `http:`, `tel:`, `sms:` and `#/`) and use it in `h()` for `href`.
  - Optionally add `require-trusted-types-for 'script'` to the CSP. The app has no HTML sinks, so this costs nothing.
  - Strip credentials in `normalizeWebsite`.

### 13. INFO (offline safety): `APP_SHELL` must list every module
- **Where:** `public/sw.js:9-40`.
- **What happens:**
  - The install step pre-caches a fixed list.
  - A module imported by `app.js` that is missing from the list is cached only if it was fetched *after* the SW took control. Otherwise, offline loading of the whole module graph fails, and with it the overdose steps that the offline feature promises.
  - Every current import is covered. `views/populationHelpers.js` is not imported.
- **Fix:** whoever adds `public/js/match/*` or new views must add them to `APP_SHELL`. Better, add a test that walks imports from `app.js` and checks that each one appears in `APP_SHELL`.

### 14. INFO: The legacy compliance document overclaims
- **Where:** `legacy/ARCHITECTURE_AND_COMPLIANCE.md:7,14` ("Full compliance with … HIPAA Privacy & Security Rules …").
- **Status:**
  - `.vercelignore` and `.dockerignore` exclude `legacy/`, and `legacy/README.md` says it is not served.
  - The UI never claims HIPAA compliance, which is correct.
  - `docs/ARCHITECTURE.md:53` correctly says HarborPath is not a covered entity or a Part 2 program.
- **Fix:** add a banner to the legacy document ("historical; claims do not apply"), or delete it, so nobody copies it into marketing.

---

## Controls verified as good
- **Static serving:** an exact-match lookup in a `Map` built at startup (`app.js:48-63`, `:205-232`). There is no filesystem access per request, so path traversal is not possible. Unknown paths return `index.html` with status 404.
- **Methods:** only GET and HEAD are accepted, anything else gets 405 with an `Allow` header (`:334-337`). A bad URL gets 400.
- **Input validation:**
  - lat/lng must be finite and in range, and are coarsened to 0.01° on the server (`geo.js:44-50`) and on the client (`api.js`, `locationPicker.js:146-148`).
  - radius, kind, page and codes are checked against allow-lists (max 8 codes).
  - provider `type` and `filter` use `Object.hasOwn`.
  - state codes use `isRegionCode`.
  - The geocode `q` is truncated to 80 characters.
- **Cache keys** are upstream URLs built only from validated, coarsened, sorted parameters. Treatment and telehealth keys cannot collide (`stateCode` differs). Entries hold no user identifiers. TTL ≤ 1 h with a sweep timer, and LRU capped at 1000.
- **Upstream requests are server-to-server.** The visitor's IP and user agent are never forwarded to SAMHSA.
- **API responses use `Cache-Control: no-store`.** The SW never caches `/api/`, the SW is opt-in, and Quick Exit removes the SW and its caches.
- **Location** is never written to storage or the URL. `localStorage` holds only an opt-in saved list, the opt-in flag, and the language. `wipeAll` clears these plus `sessionStorage`.
- **Headers:**
  - `SECURITY_HEADERS` and `vercel.json` match exactly (a test enforces this).
  - The CSP is strict with no third-party origins (`object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`).
  - `Referrer-Policy: no-referrer` plus the meta tag.
  - COOP and CORP are set.
  - `Permissions-Policy` restricts geolocation to self.
- **Outbound links** all use `rel="noopener noreferrer"`.
- **The 502 response** includes `findtreatment.gov` and the SAMHSA helpline.
- **Emergency pathways:**
  - A persistent safety bar on every page (`index.html:19-37`) with 911, Overdose steps, 988, All support lines, and Quick exit.
  - A `<noscript>` fallback with 911, 988, 1-800-662-4357 and Never Use Alone.
  - The overdose guide follows SAMHSA/CDC guidance: call 911, naloxone with re-dosing after 2–3 minutes, recovery position, the xylazine/medetomidine note, and stimulant overamping.
  - `emergencyCallout` appears on the home and navigator pages.
  - Hotline numbers were checked: 988, Veterans press 1 / text 838255, 741741, 1-800-662-4357, NUA 1-800-484-3731, SafeSpot 1-800-972-0590, Poison 1-800-222-1222, Trevor, Trans Lifeline, DV, Maternal 1-833-852-6262.
- **No text implies that HarborPath sent a referral.** It says "no referral fees" and its EKRA guidance is accurate.

---

## Compliance analysis (based on actual data flows)

**Data flows.** Browser → HarborPath origin: IP, user agent, query strings (typed place or ZIP, location rounded to about 1 km, SUD/MH service codes). The server holds them transiently in memory: the limiter keeps the IP for one window (finding 9), and the treatment cache keeps the rounded URL for ≤ 1 h. HarborPath server → SAMHSA FindTreatment.gov: rounded coordinates and codes, without the IP. Browser → Google/Apple Maps: facility address when the user clicks a link (disclosed). Device: the opt-in saved list (facility names), the language, and the opt-in SW cache of static files. There are no accounts, no server-side PHI storage, and no analytics.

| Regime | Applies? | Why / what to do |
|---|---|---|
| **HIPAA** | **No** | HarborPath is not a health plan, clearinghouse, or provider doing standard transactions, and not a business associate of one. The UI correctly never claims HIPAA compliance. It must not be added to marketing. Fix the legacy document (finding 14). If HarborPath ever integrates with a provider (for example, sending intake data to a clinic on its behalf), BA status could attach. |
| **42 CFR Part 2** | **Not currently** | Part 2 covers *federally assisted* programs that *hold themselves out* as providing SUD diagnosis, treatment, or **referral for treatment**, and it protects *patient records*. HarborPath creates no patient records. Two cautions. (a) The navigator's "clinical care pathway / provider handoff" language (finding 2) leans toward "holding out" as referral or diagnosis. (b) "Federal assistance" in §2.12(b) includes IRS tax-exempt status and federal grants, so a nonprofit operator that later stores navigator answers or sends handoffs server-side could become a Part 2 program. Keep all clinical data on the client and keep the "information, not referral" framing. |
| **FTC Act §5 / Health Breach Notification Rule (16 CFR 318, as amended 2024)** | **§5: yes. HBNR: probably not today, but close** | HBNR covers vendors of personal health records: apps with health information that can be drawn from multiple sources (the 2024 amendments say an API counts) and is managed by or for the user. A "breach" includes *unauthorized disclosure*, not only hacks. HarborPath combines SAMHSA, HRSA and CMS data with user input, but it keeps no identifiable record server-side, and the saved list stays on the device. If the operator ever adds server-side saved lists, accounts, or analytics or pixels, HBNR applies (precedent: GoodRx, Easy Healthcare/Premom). §5 already applies: privacy statements must be accurate (finding 6). |
| **Washington My Health My Data Act (RCW 19.373)** | **Likely yes for WA visitors** | There is no revenue threshold. "Consumer health data" includes data that identifies a consumer *seeking health care services*, and data that is reasonably linkable, such as IP plus a "find methadone near me" query. Precise location is defined as within 1,750 ft (about 533 m). The 0.01° rounding (cell about 1.1 × 0.8 km, worst-case error about 650–700 m) sits just outside that threshold, but very close to it, and a typed address in `q` is precise. Obligations: a separate Consumer Health Data Privacy Policy linked from the homepage (§19.373.020); collection only with consent *or as necessary to provide the requested service*, which covers the searches; separate consent to *share*, unless sharing is necessary for the service (the SAMHSA lookup is necessary and has no IP); a processor contract with the host; and access and deletion rights (§19.373.040). Also avoid any geofencing (§19.373.080), which the code does not do. **Gaps:** the policy, the rights process, and the host DPA (finding 8). |
| **Similar state laws** | Partly | Nevada SB 370 is close to MHMDA: privacy policy, consent, rights. Connecticut CTDPA as amended by SB 3 (2023) covers consumer health data with *no threshold* for consent to process and limits on geofencing. California CCPA/CPRA covers "sensitive personal information" only if the operator meets the thresholds, which is unlikely. Colorado, Oregon, Texas and others treat health data as sensitive (opt-in) but apply thresholds. **Recommendation:** one policy written to the MHMDA standard satisfies most of these. Keep collection minimal. Strip query strings from host logs (finding 6). |

---

## Test run
```
$ npm test
# tests 93
# suites 8
# pass 93
# fail 0
# duration_ms ~1391
```
