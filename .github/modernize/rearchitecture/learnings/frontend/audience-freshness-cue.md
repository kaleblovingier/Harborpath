# Audience and freshness cue

For HarborPath care-tools UX changes, reuse the existing audience/category select state and local filtering pipeline; quick buttons should update that control and synchronize `aria-pressed` in the same control-sync function.

## What Happened
For HarborPath task t1, one-tap audience choices were added without introducing new state or network behavior. The catalog freshness card reuses the source-context date validator and formatter, presents live SAMHSA search separately from bundled data, and links to the detailed disclosure. Missing or invalid metadata uses the existing unavailable-date translation.

## Takeaway
Keep quick controls as accessible `type="button"` elements that drive existing form controls and filtering. For freshness UI, share date validation/formatting and distinguish build timestamps from individual resource verification. Add Spanish strings and keep the concise cue visible when printed.

## History
- 2026-11-11 (Harborpath/t1): initial
