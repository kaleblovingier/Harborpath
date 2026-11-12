## [t3] Reviewed Escape navigation dismissal and Quick Exit
- Codebase/domain discoveries: The frontend change is isolated to keyboard handling; native `<details>` and `aria-expanded` retain their existing disclosure semantics. The bilingual Quick Exit hint does not explain that an open navigation menu consumes the first Escape.
- Wrong assumptions and corrections: Menu-dismissal is intentionally excluded from the two-press Quick Exit sequence, which can require three Escape presses total when a menu begins open.
- Debugging dead-ends and what actually worked: `node --test test/navigation.test.js` passed all 23 focused checks; the test suite uses source-structure assertions for this behavior, while t4 reported an additional manual browser check.
- Techniques/patterns worth reusing: Review a keyboard shortcut together with any open disclosures and its accessible bilingual hint; verify focus return and announced state rather than treating event handling alone as the UX.
- Learnings consumed: [(none)]
