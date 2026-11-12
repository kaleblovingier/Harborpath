# t4 — Keyboard menu dismissal and Quick Exit

## Summary

Fixed an existing keyboard-navigation edge case: Escape used to dismiss an open mobile navigation menu or its “More tools” disclosure could be counted as one of the two Escapes for Quick Exit. Menu dismissal now takes precedence, clears the pending Escape timestamp, and returns focus to the control that was dismissed. A menu-closing Escape therefore cannot contribute to an accidental Quick Exit.

The change is limited to the existing client-side navigation behavior in `public/js/app.js`; the generated service-worker build hash was refreshed in `public/sw.js`. No routes, API contracts, user-facing copy, clinical content, stored state, or dependencies were added.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t2-architect.md` — followed the Quick Exit, keyboard/focus, client-only, and service-worker-stamping constraints.

## Evidence Mapping

- `t2-architect.md#Ephemeral state / Quick Exit` and `#Styling, accessibility, and print` → Escape dismissal is handled before Quick Exit timing, and focus returns to the dismissed control; verified by `test/navigation.test.js` and browser interaction.
- `t2-architect.md#Offline shell / static assets` → refreshed generated service-worker hash with the repository `npm run stamp:sw` workflow.

## Files Changed

- `public/js/app.js` — prioritize open navigation disclosure/menu dismissal over Quick Exit timing; reset pending Escape timing; restore focus.
- `public/sw.js` — updated generated build hash after the app script changed.

## Test Results

- Focused before-fix command: `node --test test/navigation.test.js` — 21 passed, 2 failed; reproduced the two Escape-menu regressions.
- Focused after-fix command: `node --test test/navigation.test.js` — 23 passed, 0 failed.
- Full suite command: `npm test` — 2,085 total; 2,068 passed, 17 failed. The 17 residual failure scenarios were present in the pre-change run; that run had 2,066 passed and 19 failed, including the two Escape regressions now fixed.
- `npm run stamp:sw` — 21/21 checks passed.
- `npm run lint` — 21/21 checks passed.
- `npm run build` — 21/21 checks passed.
- `git diff --check` — passed.
- Browser check at `http://127.0.0.1:3000/` — Escape closed the open More tools disclosure, focus returned to “More tools,” and the URL remained on the page; Escape closed the mobile menu and restored focus to “Menu.” Neither dismissal navigated away or activated Quick Exit.

### Remaining full-suite failures

1. Vivitrol naloxone-challenge wording
2. Crisis/overdose interception
3. Good Samaritan steps
4. Spanish support route
5. Spanish overdose pacer
6. Offline precache/critical-tier checks
7. Overdose pacer Quick Exit registration
8. Reset registration
9. Lazy-view loading
10. Hash filter stripping
11. Counseling RAM handoff
12. Reachable-module precache
13. Critical-shell self-containment
14. Sparse-area provider search
15. Island-territory widening
16. Wave 15 navigation
17. Wave 18 cross-module links

The residual failures are reported, not changed as part of this bounded frontend task.

## Constraints and Delivery

- No new dependencies, third-party assets, UI text, storage, URLs, requests, or logs were introduced.
- No commit, push, deployment, amend, or history rewrite was performed.
- The repository had other already-modified/untracked orchestration files outside this task; they were not edited.
- Coordinator completion status remains blocked because the full test suite is not green; see the task notification.
