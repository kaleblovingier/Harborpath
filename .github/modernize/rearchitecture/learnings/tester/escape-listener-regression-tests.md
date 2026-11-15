# Escape Listener Regression Tests

Use the built-in Node `vm` module to execute an extracted browser event-listener registration with injected DOM collaborators and a deterministic clock when testing a closure-bound UI handler without changing production exports.

## What Happened

For HarborPath task t5, existing Escape tests asserted source structure only. Added a narrow harness around the real `keydown` registration in `public/js/app.js`, injecting navigation state, focus controls, Quick Exit counters, and `Date.now()`. This verified the multi-event behavior without adding dependencies or editing application code. A line-ending-sensitive blank-line boundary failed; using the following stable listener identifier fixed extraction.

## Takeaway

Keep the harness limited to the exact listener and dependencies it uses. Sequence assertions should cover dismissal, focus restoration, pending-timestamp reset, and the next valid two-Escape Quick Exit sequence.

## History
- 2026-11-12 (HarborPath/t5): initial
