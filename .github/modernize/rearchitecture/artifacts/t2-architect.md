# t2 — HarborPath technical seams and safety constraints

## Scope and disposition

Read the required HarborPath guidance and inspected the SPA router, reset registry, state boundary, current Care Tools / Care Team Workspace patterns, and the relevant built-in Node tests. This is an implementation-facing seam map, not a feature selection: PM task t1 owns the WHAT; the frontend task should apply this map after t1 identifies the bounded journey. Do not repeat the prior Care Tools audience-filter or freshness/source-cue changes from commit `0a871ce`.

The project is a dependency-free Node HTTP server plus a native-ES-module browser SPA. Preserve the existing request and data contracts unless the selected feature cannot be delivered through current client-side behavior.

## Upstream Artifacts Consumed

- None — no dependency artifacts were provided.

## Evidence Mapping

- None — no dependency artifacts were provided.

## Technical seams

| Concern | Existing boundary and evidence | Integration rule |
|---|---|---|
| Route and view | `public/js/app.js` defines synchronously available core views, lazy view loaders (including `tools` and `workspace`), route titles, `preloadRoute()`, route focus behavior, and lazy-load failure handling. `parseHash()` and `prepareRouteNavigation()` strip visible hash queries and retain permitted route state in memory. | Prefer improving an existing route/view. If a new route is essential, update its `ROUTE_TITLES` and `LAZY_LOADERS` entries together; preserve `viewCache`, cleanup, route focus/announcement, and stale-render token behavior. Do not place clinical answers in a route query or browser history. |
| View construction and lifecycle | Views use `public/js/dom.js` helpers and are mounted/unmounted by the router; `cleanupMountedView()` invokes a view's `_cleanup`/`onUnmount` hooks. `public/js/views/tools.js` is the current simple catalog precedent. | Build DOM with safe helpers (`h`, `textContent`-based construction); do not introduce `innerHTML`, inline event/script execution, or third-party assets. Remove listeners/timers on unmount. |
| Localization | `public/js/i18n.js` provides `t()` and dynamically loads Spanish dictionaries. Feature dictionaries are split under `public/js/locales/` (the workspace uses `es-workspace.js`; Care Tools has its own Spanish entries). `test/i18n.test.js` checks translation-key parity. | Add every new visible string, validation/status message, and accessible name to English fallback and Spanish locale. Keep interpolation placeholders identical. Include new locale modules in offline assets when they are not already reachable from the shell. |
| Ephemeral state / Quick Exit | `public/js/state.js` owns the shared `onQuickExit()` registry and `wipeAll()`. `public/js/quickExitRegistry.js` registers named synchronous handlers. `app.js` calls `runQuickExitResets()`, which wipes common state, invokes loaded route resets and global handlers, then unmounts without fetching new modules. The workspace precedent exports `resetCareWorkspaceState()` and increments a revision to invalidate prior UI callbacks. | Any new per-view answer/progress state remains in module RAM and exports a synchronous idempotent `reset*State()`. Clear mounted controls, queued timers, callbacks, and handoffs. Guard async completions with an invalidation/revision token (or equivalent cancellation) so an operation started before reset cannot repopulate cleared state. Do not await a request during Quick Exit. |
| Provider/data requests | `docs/ARCHITECTURE.md` documents the current same-origin `/api/*` boundary; the app server is `src/app.js`, geocoding is Census-backed through `src/geo.js`, and `public/js/api.js` is the browser API client. | A usability improvement with no new public data need should stay client-side and avoid API/schema changes. If a request is essential, use only the existing same-origin API pattern, keep error text fixed/non-echoing, and preserve input validation and privacy-safe logging. Never add a third-party client call or geocoder. |
| Security / privacy | `src/app.js` and `vercel.json` hold matching `default-src 'self'` security headers. Coordinates are rounded to about 1 km on client and server. Clinical answers and profiles remain in browser RAM; only explicit saved-place/offline features use opt-in storage. | Do not add a third-party origin, script, font, map, analytics, cookie, storage write, URL field, request parameter, or log entry for clinical state. Preserve ~1 km coordinate quantization and local Census geocoding. |
| Offline shell / static assets | `public/sw.js` separates the core and elective offline shells; `docs/ARCHITECTURE.md` describes module-integrity and shell checks. `npm run stamp:sw` runs the existing service-worker stamping workflow. | If adding a client module or locale, include it in the appropriate offline shell and run the prescribed stamping workflow; do not make offline mode fetch all elective modules on startup. |
| Styling, accessibility, and print | Shared styles are in `public/styles.css`; route rendering moves focus to the page heading and announces the route. `test/accessibility.test.js`, `test/ux-accessibility.test.js`, and `test/design-system.test.js` cover shared semantics and design constraints. Print styles support clinical summaries. | Use semantic controls, explicit labels, keyboard-operable interactions, visible focus, and appropriate live regions. Preserve WCAG 2.2 AA+ contrast and target sizes. Any clinical summary introduced or altered must retain clean print parity and omit hidden clinical URLs/query strings. |

## Test seams for the implementation / validation roles

- Add focused behavior and privacy/reset tests in `test/` using built-in `node:test` and `node:assert/strict`; do not add npm dependencies.
- Reuse only the applicable existing suites: `test/app.test.js` / `test/navigation.test.js` for route integration, `test/privacy.test.js` for URL/storage/network/log invariants, `test/i18n.test.js` and relevant feature tests for locale parity, `test/accessibility.test.js` / `test/ux-accessibility.test.js` for semantics, and `test/client-modules.test.js`, `test/offline.test.js`, and `test/smoke.test.js` when modules or offline-shell entries change.
- A reset test should check both in-memory state and mounted UI. For stateful asynchronous work, resolve a pre-reset deferred callback after reset and prove it cannot restore prior values. Do not claim a reset test passes unless that delayed-completion case is exercised when applicable.
- Final validation remains the tester task's responsibility: run the focused tests, then `npm test`, `npm run lint`, and `npm run build`; report actual counts and distinguish observed baseline failures from failures introduced by the change.

## File ownership for the five-role handoff

| Role | Exclusive output ownership |
|---|---|
| PM (t1) | Product selection/spec artifact only; no application-source edits. |
| Architect (t2) | This technical-seam artifact and architect session log/learning only. |
| UX (t3) | UX/design artifact only; no route, CSS, locale, or application-source edits. |
| Frontend (t4, integration lead) | All application-source files for the selected feature, including any shared router, state/reset registry, locale, stylesheet, or service-worker updates. No other role edits these files. |
| Tester (t5) | `test/**` additions/updates and validation execution/reporting. If a production defect is exposed, send it to the frontend integration lead rather than editing production source. |

The coordinator retains ownership of `board.md` and workflow state. Do not modify shared planning artifacts from this task.

## Risks to carry into implementation

- **Critical — Quick Exit race:** delayed callbacks can undo a synchronous reset unless state mutations are invalidated; test this explicitly for a stateful change.
- **High — data exposure:** using the visible hash/query or a network request as a handoff for private answers violates the stated model even if the router strips some current filter queries.
- **High — offline regression:** a newly imported module omitted from the service-worker shell may work online but fail for visitors using the opt-in offline copy.
- **Medium — localization/accessibility drift:** untranslated fallbacks, missing labels, or focus loss are easy to miss in a single-language happy-path check; include both languages and keyboard/screen-reader semantics.
- **Medium — clinical/legal scope creep:** the improvement should reuse existing source-backed content and avoid adding clinical claims. Any emergency guidance must retain direct emergency escalation independent of a calculated score.

## Required guidance reviewed

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/IMPROVEMENTS.md` (existing roadmap sections and latest entries reviewed; it contains many historical/specialty content waves, not a reason to add another clinical content wave)
- `docs/AI_NAVIGATOR_SPEC.md`
- `docs/PHASE1_HELPERS.md`
- `AGENTS.md`
- `.github/modernize/rearchitecture/board.md` (read-only)
- `.github/modernize/rearchitecture/team/architect/log.md`

`.github/modernize/rearchitecture/context.md`, `decisions.md`, and `team/architect/inbox.md` were not present at preflight. No API/server/schema change is recommended by this seam review.

## Verification

- Repository status was inspected before editing. The worktree already contained changes outside this task; they were not edited.
- No source files or tests were changed in this architecture task, so runtime tests were not run here. The tester task owns validation after t4.
- No commit, push, deployment, amend, or history rewrite was performed.
