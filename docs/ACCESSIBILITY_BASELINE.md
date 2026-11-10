# Accessibility baseline (2026-11-10)

These are **existing** findings from the first Chromium/axe-core scan on
HarborPath's new quality branch. The scan used viewport widths 390px and
1280px; the counts below were the same at both widths. They have **not**
been fixed, and a green regression check is **not** proof of WCAG compliance.

| Route | Existing serious axe issues |
| --- | --- |
| `/` | color-contrast: 33 nodes |
| `/#/treatment` | color-contrast: 24 nodes; label-content-name-mismatch: 2 nodes |
| `/#/match` | color-contrast: 6 nodes |
| `/#/overdose` | color-contrast: 13 nodes |
| `/#/plan` | color-contrast: 23 nodes |

The CI browser check fails when an existing category increases its affected
node count or a new serious/critical violation category appears. This is an
incremental guard, **not** a complete no-regression guarantee: an old issue
replaced by a new issue in the same category may leave the count unchanged.

Next review should inspect individual affected elements, repair contrast
tokens/components and accessible label names, test keyboard and assistive
technologies manually, and reduce the permitted counts to zero.
