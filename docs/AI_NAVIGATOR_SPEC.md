# Privacy-First AI Navigator Spec for HarborPath

## Goal
Make the existing clinical tools useful to more individuals by adding a conversational navigator that still routes people to real treatment providers while preserving all privacy guarantees.

## Constraints (must not break)
- CSP: `default-src 'self'` — no third-party origins
- No PHI storage or transmission
- Location coarsened to ~1 km
- ASAM navigator and safety plan 100% in browser RAM
- No query logging
- Not a HIPAA covered entity or 42 CFR Part 2 program

## MVP Design
A chat interface (new view or modal in `#/navigator`) that:

1. Collects user description or guided answers (still client-side).
2. Calls the existing pure functions:
   - `scoreOpioidWithdrawal`
   - `scoreAlcoholSedativeRisk`
   - `evaluateTransitionRisk`
3. Returns plain-language guidance + recommended SAMHSA service codes.
4. Generates a direct link: `#/treatment?codes=BU,DT,MD` (example).
5. Surfaces hotlines (988, SAMHSA 1-800-662-4357) when risk is high.
6. Includes clear “not medical advice / not an emergency service” framing.

## Implementation Options (ranked by privacy)

| Rank | Approach | Privacy | Capability | Notes |
|------|----------|---------|------------|-------|
| 1 | Fully on-device (WebLLM or Transformers.js) | Highest | Moderate | Works offline after model load; stays inside CSP if model is bundled or self-hosted |
| 2 | Self-hosted small model on HarborPath Node server | High | Higher | Same process, zero external calls, no logging of inputs |
| 3 | External API | Lowest | Highest | **Rejected** — violates CSP and privacy model |

## Multi-Agent Roles (future)
- Navigator (scoring + level of care)
- Medication explainer (Bernese method, interactions)
- Safety-plan builder
- Provider matcher (local indexes only)

All coordination stays client-side or zero-knowledge.

## Code Touchpoints
- `public/js/views/navigator.js` — export and call pure functions
- New `public/js/views/aiNavigator.js` or extension of existing view
- `public/js/content/hotlines.js` — reuse for escalation
- Tests in `test/` to verify no data leaves the browser

This keeps HarborPath as a connector to providers, not a replacement for clinical care.
