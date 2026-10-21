# Phase 1 Clinical Helpers

Added `public/js/views/populationHelpers.js` with pure functions that return recommended SAMHSA codes and direct `#/treatment?codes=...` links for:

- Pregnancy/postpartum (ACOG-aligned)
- Adolescents / young adults
- Justice-involved / reentry
- Older adults
- Stimulant use
- Xylazine / medetomidine
- Co-occurring serious mental illness

These can be imported into the navigator view to expand reach without transmitting any PHI. All logic stays client-side.

Next: wire them into the ASAM navigator UI and add plain-language variants.
