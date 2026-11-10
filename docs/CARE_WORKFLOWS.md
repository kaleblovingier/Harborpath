# Care discovery and team workflows

The homepage offers starting points for people seeking help, supporters, and
healthcare/community workers. `#/tools` makes the existing guides discoverable
through local, translated text search and audience/topic filters. It is a guide
directory, not a clinical triage or diagnostic engine.

`#/workspace` supports three stages: a brief visit, a referral or warm handoff,
and follow-up. Only 11 allowlisted boolean task marks enter memory. The summary
includes checked and unchecked tasks and does not represent an accepted referral,
clinical order, assessment, discharge clearance, or verification of availability
or coverage. Personal information belongs in the worker’s approved care systems.

Neither workflow sends its choices to an API, URL, or persistent storage. New
route resets are registered when their modules load and run synchronously on
Quick Exit. Clipboard and print exports require explicit action and cannot be
erased by Quick Exit.

Source disclosures use the existing `/api/meta` payload. A snapshot build date
does not verify that a listing or law is current. Live treatment searches,
bundled directories, unverified legal summaries, and excluded pending-review
program listings are described separately.

Offline caching remains opt-in. New route modules are warmed in the elective
tier; dictionaries imported by the critical Spanish entry point remain in the
critical tier. API responses never enter the service-worker cache. The saved
indicator waits for page control so an immediate offline navigation can use the
worker. Opening tools offline depends on those elective files having been saved.

Emergency guidance was aligned across the drawer and overdose pacer using the
official FDA NARCAN instructions, SAMHSA toolkit, and AHA lay-responder algorithm
linked in `public/js/components/overdosePacing.js`. The interface defers to 911,
CPR training, and the product label. Difficulty ventilating is not presented as a
definite diagnosis, and breathing rather than wakefulness drives reassessment.

Verification includes `test/care-workspace.test.js`,
`test/platform-workflows.test.js`, `test/source-context.test.js`,
`test/offline.test.js`, the overdose suites, and existing i18n/accessibility,
privacy, source-integrity, and API suites. Browser checks cover phone/desktop
layout, language switching, checklist updates/reset, print visibility, offline
reload, and Quick Exit cache/state clearing.
