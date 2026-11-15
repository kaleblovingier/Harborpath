# Quick Exit Escape Hint Context

When Escape dismisses an open navigation region before the Quick Exit shortcut, explain that ordering in the bilingual shortcut hint.

## What Happened

During HarborPath task t3, review of the keyboard journey found that the existing English and Spanish hints say Escape twice without noting that an open navigation menu consumes the first press. The underlying behavior correctly resets the pending Escape state to avoid accidental exit.

## Takeaway

When Escape has layered meanings, make the shortcut instructions state which keypresses count. Keep the localized hint consistent with the implemented menu-dismissal and exit sequence.

## History
- 2026-11-12 (HarborPath/t3): initial
