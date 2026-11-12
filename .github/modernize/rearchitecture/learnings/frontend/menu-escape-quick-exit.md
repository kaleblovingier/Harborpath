# Menu Escape and Quick Exit

When Escape dismisses an open navigation disclosure or mobile menu, it should not also count as an Escape toward the global double-Escape Quick Exit.

## What Happened

In HarborPath task t4, the shared keyboard handler checked its Quick Exit timer before consuming Escape for open menus. Reordering the menu dismissal first, clearing the pending Escape timestamp, and restoring focus to the dismissed control resolved two navigation regressions. Browser verification confirmed the menu remained the only effect of the dismissal key.

## Takeaway

In shared keyboard handlers, process local component dismissals before global shortcuts. Clear shortcut timing when a local interaction consumes the key, and return focus to the control whose disclosure/menu was dismissed. Run the existing keyboard tests and refresh the service-worker hash after changing `public/js/app.js`.

## History
- 2026-11-12 (HarborPath/t4): initial
