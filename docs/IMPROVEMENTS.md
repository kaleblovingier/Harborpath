# HarborPath Improvement Roadmap

Generated from parallel specialized agent review (Clinical, Accessibility, Insurance & Safety-Net Matching, Guided Navigation, QA & Privacy Verification) to make HarborPath useful to more individuals seeking addiction treatment, clinical care, medications, harm reduction, and safety-net healthcare.

All implementations preserve HarborPath's core privacy guarantees: CSP `default-src 'self'` (100% identical between `src/app.js` and `vercel.json`), no third-party scripts, location coarsening to ~1 km, ASAM/insurance/guided triage/safety plan 100% client-side in browser RAM, zero query logging, and not a covered entity.

## 1. Clinical Expansion & Phase 1 Population Care Pathways (`#/navigator`, `populationHelpers.js`)

Extended the pure functions in `public/js/views/navigator.js` (`evaluateAsamCare`, `scoreOpioidWithdrawal`, `scoreAlcoholSedativeRisk`, `evaluateTransitionRisk`, `formatAsamHandoffText`) and integrated the Phase 1 population recommenders in `public/js/views/populationHelpers.js` (`ALL_POPULATION_RECOMMENDERS`):

- **Pregnancy / postpartum (`recommendForPregnancy`)**: Dedicated ACOG-aligned perinatal path prioritizing specialty programs (`PW`), agonist MOUD maintenance (`BU`, `MU`/`OTP`) over abrupt detox, hospital inpatient (`HI` / `DT`) when medically indicated, Medicaid (`MD`), and sliding scale (`SS`), plus federal CAPTA Plans of Safe Care guidance.
- **Adolescents / young adults (`recommendForYouth`)**: Youth-specific scoring and filters (`ADOL`, `YA`) linked to age-appropriate intensive outpatient (`IOP`), residential (`RES`), and telehealth (`TELE`) care, with consent and family policy guidance.
- **Justice-involved / reentry (`recommendForJusticeInvolved`)**: Integrated with `evaluateTransitionRisk` (`post_release`) to flag acute post-incarceration opioid receptor tolerance loss and fatal fentanyl overdose spikes in the first 7–14 days after release, routing to `CJ`, `OTP`, `BU`, `OP`, `NOE`, and `PEER`.
- **Xylazine / medetomidine exposure (`recommendForXylazine`)**: Addresses non-opioid alpha-2 adrenergic rebound hypertension/autonomic instability with clonidine/tizanidine/dexmedetomidine guidance alongside MOUD (`BU`, `OTP`, `DT`, `NOE`) and necrotic wound care (`HI`, `#/health`).
- **Older adults (`recommendForOlderAdults`)**: `SEN`, `OP`, `MD`, and `MHSU` filters with medical comorbidity and Medicare/Medicaid guidance.
- **Stimulant use (`recommendForStimulants`)**: Contingency Management (`CMI`), outpatient (`OP`), telehealth (`TELE`), and dual-diagnosis (`MHSU`) support.
- **Co-occurring serious mental illness (`recommendForCoOccurring`)**: Integrated dual-diagnosis (`MHSU`) and trauma-informed (`TRMA`) care with 988 and walk-in/mobile crisis (`WI`, `PEOFF`) escalation.

## 2. Zero-PII In-RAM Insurance & Safety-Net Compatibility Engine (`public/js/match/engine.js`, `insuranceHelpers.js`)

Evaluates insurance and safety-net affordability in browser RAM without transmitting coverage details to any server:

- **Deterministic Coverage Tiers**:
  - `EMTALA_PROTECTED`: Federal Emergency Medical Treatment and Labor Act (`42 U.S.C. § 1395dd`) emergency screening and stabilization rights at hospital Emergency Departments regardless of insurance or ability to pay, paired with the DEA 72-Hour Rule (`21 CFR § 1306.07(b)`) for immediate buprenorphine or methadone administration.
  - `CONFIRMED_MATCH`: Explicitly sourced and dated network verification (`confirmed`).
  - `VERIFY_NETWORK`: Provider-reported SAMHSA payer match (`MD`, `MC`, `PI`, `TRICARE`, `VAF`, `ITU`) paired with an interactive insurer/clinic verification script covering **MHPAEA (Mental Health Parity and Addiction Equity Act)** parity rights and **EKRA (`18 U.S.C. § 220`)** anti-patient-brokering warnings.
  - `SAFETY_NET_FALLBACK`: Sliding fee scale (`SS`), payment assistance (`PA`), free care (`NP`), HRSA FQHCs (`FQHC`), SAMHSA block grants (`SAMHSA`), and IHS/Tribal/Urban (`ITU`) safety-net options.
  - `UNVERIFIED_OR_MISMATCH`: Out-of-network or unlisted payment information with transparent verification prompts.
- **Distance-Preserving Ranking & State Medicaid Integration**: Preserves finite mileage (`miles`) across merged local and statewide telehealth listings, never allows paid or sponsored flags to influence scores, and links directly to all 56 state, DC, and U.S. territory Medicaid agencies in `data/state-medicaid.json`.

## 3. Privacy-First Deterministic Guided Navigator (`#/guided`, `guidedNavigator.js`)

Step-by-step guided triage that walks visitors through care needs in plain language using pure on-device functions:

- **Instant Crisis & Overdose Red-Flag Interception**: Immediately intercepts life-threatening withdrawal, overdose, or mental health crisis signals and routes to **988** (Suicide & Crisis Lifeline), **911**, **Never Use Alone (`877-696-1996` / `800-484-3731`)**, **SafeSpot (`800-972-0590`)**, and `#/overdose` before any routine directory search.
- **Zero Network Leakage**: Executes 100% locally in browser RAM with zero `fetch()` calls, zero external URLs, and zero persistent storage.

## 4. Rural & U.S. Territory Equity & `@media print` Clinical Handouts

- **Rural & U.S. Territory Reach**: Offline Census geocoding (`src/geo.js`, `src/regions.js`), up to 250-mile search radius expansion, and regional Medicaid/behavioral health directories covering all 50 states, DC, **Puerto Rico (`PR`)**, **Guam (`GU`)**, **U.S. Virgin Islands (`VI`)**, **American Samoa (`AS`)**, and the **Northern Mariana Islands (`MP`)**.
- **Print-Ready Handouts (`@media print`)**: Dedicated print stylesheets in `public/styles.css` for clinical ASAM self-check handoff summaries (`#/navigator`), personal safety & recovery action plans (`#/plan`), and side-by-side treatment comparison plans (`#/match`).

## 5. Global Quick Exit (`Esc` x2) Deterministic State Orchestration

- Pressing the **Quick exit** button or `Esc` twice within 1 second deterministically wipes all in-memory and device state (`wipeAll()`, plus `resetNavigatorState`, `resetInsuranceState`, `resetGuidedNavigatorState`, `resetVeteransState`, `resetAdolescentState`, `resetDifferentialState`, and `resetBookmarksViewState`), clears any opt-in Service Worker offline cache (`public/sw.js`), replaces the DOM and document title with `'Weather'`, and redirects via `location.replace('https://www.weather.gov/')` while occupying a single back-history slot.

## 6. Wave 8 Specialized Care Pathways & Clinical Differentials

- **Veterans & Military Health Care Navigation (`#/veterans`, `veterans.js`)**:
  - Implements the VA MISSION Act of 2018 (`38 U.S.C. § 1703` / `38 C.F.R. § 17.4010`) designated access standards (20 days wait / 30 minutes drive time for primary & mental health / outpatient SUD; 28 days / 60 minutes for specialty & residential SUD), service unavailability, and best medical interest pathways.
  - Urgent care benefit under `38 U.S.C. § 1725A` (eligible enrolled veterans can receive walk-in urgent care with 14-day prescription drug benefit without prior authorization) and Veterans COMPACT Act (`38 U.S.C. § 1720J`) emergency crisis care.
  - TRICARE level-of-care pre-authorization matrix (`32 C.F.R. § 199.4`) comparing Prime and Select across inpatient detox, residential SUD, PHP, IOP, and outpatient therapy/OBOT.
  - Military Sexual Trauma (MST) rights under `38 U.S.C. § 1720D` & `§ 1720I`: 100% free care ($0 copay), zero disability rating required, zero incident reporting required, and full Other Than Honorable (OTH) discharge eligibility.
  - Veterans Crisis Line (Dial 988 Press 1, Text 838255) and direct linking to `#/treatment?codes=VET`.

- **Adolescent & Youth Substance Use Care Pathways & Legal Guide (`#/adolescent`, `adolescentCare.js`)**:
  - Comprehensive statutory minor consent guide for SUD outpatient counseling and medical diagnosis without parental notification (CA age 12, WA age 13, OR age 14, IL age 12, NY age 12, TX age 16, and mature minor doctrine).
  - Federal confidentiality mandates under `42 CFR Part 2 § 2.14`: written minor consent is legally required before disclosing treatment records to parents when the minor has legal capacity.
  - Explanation of Benefits (EOB) privacy leak mitigations via HIPAA `45 CFR § 164.522(b)` confidential communication requests and HRSA FQHC / Title X sliding-fee ($0) safety-net routing.
  - Developmentally adapted ASAM Criteria (Dimensions 1–6) and evidence-based interventions: Adolescent Community Reinforcement Approach (A-CRA), Multidimensional Family Therapy (MDFT), SBIRT / MET, Youth Contingency Management, and AAP pediatric MOUD recommendations.

- **Toxicology & Poly-Substance Clinical Differential Decision Support (`clinicalDifferential.js`)**:
  - Evidence-based differential engine distinguishing 4 emergencies: 1) Opioid & Xylazine / Medetomidine toxicity, 2) Stimulant overamping (life-threatening physical vs distressing psychological), 3) Serotonin toxicity (Hunter Serotonin Toxicity Criteria with clonus as hallmark), and 4) Soft tissue sepsis / necrotic ulcers / necrotizing fasciitis / endocarditis.
  - Immediate emergency directives: Naloxone + rescue breathing (1 breath every 5s / 12 bpm) for opioid/tranq depression, active external cooling and avoiding physical restraints for hyperthermic overamping, and EMTALA (`42 U.S.C. § 1395dd`) emergency hospital evaluations.

- **Zero-Knowledge Session Bookmarks Organizer (`sessionBookmarks.js`)**:
  - Universal resource organizer managing saved items across 6 types (`treatment`, `health-center`, `provider`, `mutual-aid`, `hotline`, `guide`).
  - Filterable category tabs (`all`, `clinical`, `mutual-aid`, `crisis-hotline`, `guide`), print layouts, clipboard copy, and unified educational disclaimer header.

## 7. Wave 9 Clinical Systems & Community Reintegration

- **Incarceration Reentry & Criminal Legal Health (`#/reentry`, `reentry.js`)**:
  - Implements Section 1115 Demonstration Waivers (CMS guidance & SUPPORT Act § 5032) across approved states (CA CalAIM 90-day, WA 90-day, MA 90-day, IL, OR, KY, NY, UT, NM, RI) waiving the Medicaid Inmate Exclusion (`42 U.S.C. § 1396d(a)(31)(A)`) for 30-day MOUD bridges, transitional case management, and immediate Medicaid reinstatement upon release.
  - Mitigates post-release fatal overdose spike (40x to 129x elevated mortality in first 14 days due to tolerance loss) via take-home naloxone kits at the facility gate and continuous MOUD retention.
  - U.S. DOJ Civil Rights Division ADA Title II Guidance (April 2022) enforcing civil rights protections for prescribed MOUD against probation/parole revocation or drug court exclusions.
  - Strict confidentiality of treatment records under `42 C.F.R. Part 2 § 2.35` for supervision referrals, limiting disclosure to basic attendance and compliance.

- **Older Adults & Medicare SUD Clinical Specialist (`#/older-adults`, `olderAdults.js`)**:
  - Comprehensive Medicare SUD benefit navigator: Medicare Part B Opioid Treatment Program (OTP) bundled benefit (`SUPPORT Act § 2005` / `42 C.F.R. § 410.67`) guaranteeing $0 copayment for methadone, buprenorphine, counseling, and toxicology; Office-Based Opioid Treatment (OBOT) codes (HCPCS G2086–G2088); and Medicare Advantage network adequacy mandates (`42 C.F.R. § 422.116`).
  - AGS Beers Criteria® (2023) polypharmacy interaction screener: Opioid + Benzodiazepine (FDA Black Box), Opioid + Gabapentinoid renal accumulation, Sedative-Hypnotics (Z-drugs) fall/fracture/delirium risks, Anticholinergic cognitive burden, and Methadone QTc interval prolongation with cardiac medications.
  - Geriatric pharmacokinetics: Glomerular filtration decline (eGFR), diminished hepatic CYP450 first-pass clearance, expanded lipophilic distribution volume, and buprenorphine's protective respiratory depression ceiling.
  - Age-adapted drinking guidelines and AUDIT-C geriatric cutoffs (>= 3 points for adults 65+).

- **Workplace Rights, FMLA & Professional Licensure (`#/workplace-rights`, `workplaceRights.js`)**:
  - Family and Medical Leave Act (FMLA, `29 U.S.C. § 2612`; `29 C.F.R. § 825.119`): Up to 12 weeks of job-protected leave for substance use disorder treatment; statutory distinction protecting leave *for treatment* vs. non-protected absence for *substance use/impairment*; anti-retaliation rules; and confidential medical certification files (`29 C.F.R. § 825.500(g)`).
  - Americans with Disabilities Act (ADA, `42 U.S.C. § 12101` et seq.; `29 C.F.R. § 1630.3`): "In Recovery" Safe Harbor (`42 U.S.C. § 12114(b)`) protecting individuals in or completed supervised treatment; DOJ/EEOC civil rights protections for prescribed MOUD; Medical Review Officer (MRO) prescription verification rules; and Reasonable Accommodations.
  - Alternative to Discipline (ATD) programs for licensed healthcare professionals (nursing peer assistance, Physician Health Programs) and DOT safety-sensitive Return-to-Duty protocols (`49 C.F.R. Part 40`).

- **Recovery Capital Index & Strengths Assessment (`recoveryCapital.js`)**:
  - Psychometrically validated Brief Assessment of Recovery Capital (BARC-10; Groshkova, Best, & White, 2013) measuring internal and community assets across 10 empirical domains (score 10 to 60; 47+ validated threshold for sustained 1-year recovery stability).
  - Mapped to SAMHSA's Four Dimensions of Recovery: Health, Home, Purpose, and Community.
  - Strengths-based action planning leveraging top recovery assets and providing tailored referrals for growth opportunities.

Not medical advice. HarborPath never endorses providers or accepts payment for listings.
