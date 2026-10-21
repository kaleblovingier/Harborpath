# HarborPath Improvement Roadmap

Generated from parallel specialized agent review (Clinical, Accessibility, AI Integration, Data Providers, UX Flows) to make HarborPath useful to more individuals seeking addiction treatment, clinical care, medications, harm reduction, and safety-net healthcare.

All proposals preserve existing privacy guarantees: CSP default-src 'self', no third-party scripts, location coarsening to ~1 km, ASAM/safety plan 100% client-side RAM, no query logging, not a covered entity.

## 1. Clinical Expansion (highest reach impact)

Extend the pure functions in `public/js/views/navigator.js` (`scoreOpioidWithdrawal`, `scoreAlcoholSedativeRisk`, `evaluateTransitionRisk`) and the ASAM navigator view.

- **Pregnancy/postpartum**: Dedicated ACOG-aligned path (already referenced). Auto-recommend PW specialty, hospital inpatient, and Medicaid.
- **Adolescents / young adults**: Youth-specific scoring and filters (ADOL, YA). Link to age-appropriate residential/IOP.
- **Older adults**: SEN filters + medical comorbidity guidance.
- **Justice-involved / reentry**: Build on `evaluateTransitionRisk` with post-release overdose spike warnings and CJ-focused providers.
- **Stimulant use**: Contingency management (CMI), no agonist yet, telehealth options.
- **Chronic pain + OUD**: Guidance on MOUD continuity and non-opioid alternatives.
- **Xylazine / medetomidine**: Expanded alpha-2 rebound notes and clonidine/tizanidine references (already partially present).
- **Co-occurring serious mental illness**: Stronger MHSU / TRMA mapping and crisis facility links.

**Implementation**: Add population-specific scoring helpers that return recommended SAMHSA codes and pre-built `#/treatment?codes=...` search links. All remains client-side.

## 2. Accessibility & Equity

- Plain-language / low-literacy toggle (target 6th–8th grade) alongside clinical text.
- Additional languages beyond EN/ES (prioritize by SUD population prevalence).
- Stronger offline Service Worker caching of hotlines, overdose guides, and static indexes.
- Low-bandwidth / SMS fallback paths for hotlines.
- Improved screen-reader, keyboard, high-contrast, and cognitive-load progressive disclosure.
- Targeted content modules for rural/island (already 250 mi), uninsured, LGBTQ+ affirming, disabilities, and low digital literacy.

## 3. Privacy-First AI Navigator (MVP)

Conversational layer that treats existing pure functions as tools.

- **Ranked options**:
  1. Fully on-device (WebLLM / Transformers.js) — strongest privacy, offline after first load.
  2. Self-hosted small model on the same Node server (logs nothing, no external calls) — higher capability inside the privacy boundary.
- **First MVP**: Chat that walks through ASAM dimensions, calls the three scoring functions locally, returns guidance + direct provider search link, and escalates to 988 / SAMHSA 1-800-662-4357 when indicated.
- Multi-role design possible later (navigator, medication explainer, safety planner, provider matcher) while staying zero-knowledge.

Architecture must keep CSP intact and never transmit PHI.

## 4. Data & Provider Matching

- Enrich existing indexes (HRSA, VA, IHS, CMS RHC/ER, state agencies/Medicaid) with better telehealth and population filters.
- Additional public datasets where available (e.g., more SAMHSA mental health crisis, recovery housing).
- Zero-knowledge personalization: user-reported needs stay in RAM and only generate filtered search parameters.

## 5. UX Flows

- Convert hash-router views into guided multi-step journeys with progressive disclosure.
- Clearer “what happens next” after scoring that leads directly to facility results.
- Low-literacy friendly paths and reduced cognitive load in the navigator and safety plan.

## Phased Roadmap

1. **Phase 1 (immediate)**: Population scoring helpers + auto search links in navigator.js; plain-language toggle stub; docs.
2. **Phase 2**: On-device AI MVP that calls pure functions; expanded offline caching.
3. **Phase 3**: Additional languages, deeper data filters, full guided flows.

Not medical advice. HarborPath never endorses providers or accepts payment for listings.
