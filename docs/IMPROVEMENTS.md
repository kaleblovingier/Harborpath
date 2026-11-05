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

## 8. Wave 10 Specialized Equity, Tribal Health, LGBTQ+ Care & Infection Harm Reduction

- **Indigenous & Tribal Health Care Guidance (`#/tribal-health`, `tribalHealth.js`)**:
  - Implements the statutory framework of the Indian Health Care Improvement Act (IHCIA, `25 U.S.C. § 1601` et seq.), Indian Self-Determination and Education Assistance Act (P.L. 93-638 compacts and contracts), and Title V Urban Indian Health Organizations (UIHOs).
  - Enforces the absolute Medicaid $0 cost-sharing exemption under Social Security Act § 1916(j) (`42 U.S.C. § 1396o(j)`): eligible American Indians and Alaska Natives are legally exempt from all copayments, deductibles, and coinsurance.
  - Purchased/Referred Care (PRC, `42 C.F.R. Part 136`) notification rules distinguishing emergency 72-hour notice windows from the 30-day notice window for elders and individuals with disabilities.
  - Indian Child Welfare Act (ICWA, `25 U.S.C. § 1912(d)`) active efforts standards mandating culturally competent family preservation services prior to child removal.
  - Cultural harmony integration affirming that FDA-approved MOUD (buprenorphine, methadone) operates in complete harmony with traditional healing, talking circles, sweat lodge ceremonies, and sacred plant medicines.

- **LGBTQ+ & Gender-Affirming Substance Use Disorder Care (`#/lgbtq-care`, `lgbtqCare.js`)**:
  - WPATH SOC 8 clinical integration affirming 100% pharmacokinetic and clinical compatibility between gender-affirming hormone therapy (estrogens, spironolactone, testosterone) and MOUD (buprenorphine, methadone, extended-release naltrexone).
  - Chemsex & Party-and-Play harm reduction protocols: critical life-safety warnings on the lethal interaction between alkyl nitrites ("poppers") and PDE5 inhibitors (Viagra/Cialis) causing catastrophic irreversible vasodilation and circulatory collapse; GHB/GBL dosing intervals and medical detox management; ketamine urinary bladder toxicity protection; and methamphetamine harm reduction.
  - Biomedical HIV and STI prevention pathways integrating daily oral or long-acting injectable PrEP, emergency PEP within 72 hours, and Doxy-PEP bacterial STI prophylaxis.
  - Inpatient and residential rehabilitation civil rights under ACA § 1557 (`42 U.S.C. § 18116`) and HUD Equal Access Rules guaranteeing rooming and bathroom accommodations corresponding with affirmed gender identity.

- **Wound Care & Infectious Disease Harm Reduction Specialist (`#/wound-care`, `woundInfectious.js`)**:
  - Evidence-based moist wound healing protocols tailored for xylazine-associated necrosis and soft tissue lesions: gentle saline/potable water irrigation, moist wound bed maintenance with petroleum jelly or amorphous hydrogel, and non-adherent Telfa dressings.
  - Strict clinical directives to avoid cytotoxic antiseptics (hydrogen peroxide, rubbing alcohol, bleach/Dakin's solution, strong iodine) that destroy healthy granulation fibroblasts and capillary buds.
  - Life-threatening soft tissue and systemic infection escalation: emergency 911 triggers for necrotizing fasciitis (severe pain out of proportion, subcutaneous crepitus, violaceous bullae, cutaneous numbness) and systemic sepsis (fever/hypothermia + tachycardia or acute confusion) under federal EMTALA protection.
  - Infective endocarditis (Modified Duke Criteria) symptom screening for people who inject drugs (persistent unexplained fevers, night sweats, Janeway lesions, Osler nodes, splinter hemorrhages, new heart murmurs).
  - AASLD / IDSA universal Hepatitis C Direct-Acting Antiviral (DAA) treatment standards affirming active drug use is never an exclusion criterion, with >95% cure rates and TasP community viral suppression.
  - Safer injection and vein care protocols (bevel-up technique, releasing tourniquet prior to plunging, rotating puncture sites, single-use filters preventing Pantoea agglomerans cotton fever).

- **Safety-Net Navigator & Telehealth Access Component (`safetyNetNavigator.js`)**:
  - Public Health Service Act § 330 (`42 U.S.C. § 254b`) sliding-fee discount schedule estimator based on 2026 Federal Poverty Guidelines (contiguous US, Alaska, and Hawaii adjustments).
  - Nominal fee tiers (0-100% FPL) with statutory protections guaranteeing non-denial for inability to pay and zero-income self-declaration forms.
  - Title X family planning confidentiality protections allowing adolescents and individuals to be assessed solely on personal income.
  - Federal EMTALA emergency medical screening rights and DEA/SAMHSA tele-MOUD flexibilities paired with federal Lifeline phone connectivity.

- **Culturally Centered Helplines Integration (`hotlines.js`)**:
  - Integrated StrongHearts Native Helpline (`1-844-762-8483` / `1-844-7NATIVE`), providing free, confidential 24/7 domestic and sexual violence advocacy for Native Americans and Alaska Natives.

## 9. Wave 11 Rural Health, Disability Rights, Street Medicine & Syringe Program Equipment

- **Rural & Frontier Health Care Specialist (`#/rural-health`, `ruralHealth.js`)**:
  - Implements the statutory framework of the Rural Health Clinics Act (Social Security Act § 1861(aa), `42 U.S.C. § 1395x(aa)`) and Migrant Health Centers (Public Health Service Act § 330(g)).
  - Enforces mandatory Medicaid Non-Emergency Medical Transportation (NEMT, `42 C.F.R. § 431.53`) rights: advance scheduling windows (48-72 hours), driver mileage reimbursement, and transit passes to daily OTP methadone clinics, OBOT visits, and pharmacies.
  - Frontier health protocols (<6 people/sq mile) prioritizing DEA/SAMHSA tele-MOUD buprenorphine flexibilities to overcome extreme geographic isolation.
  - Agricultural and farmworker substance safety alerts: heat stroke, dehydration, and rhabdomyolysis risks from stimulant use in high-heat field labor, paired with pesticide neurotoxicity awareness.
  - Mail-order harm reduction pathways (NEXT Distro) and virtual peer spotter hotlines (Never Use Alone, SafeSpot).

- **Disability, Neurodiversity & Accessible SUD Care Specialist (`#/disability-care`, `disabilityCare.js`)**:
  - Americans with Disabilities Act (ADA Title II & Title III, `42 U.S.C. § 12182`) and Section 504 of the Rehabilitation Act (`29 U.S.C. § 794`) compliance.
  - Federal service animal rights (`28 C.F.R. § 35.136` & `§ 36.302(c)`): absolute legal right to service dogs in all outpatient and residential facilities; limits staff inquiries to the two statutory questions with zero certification papers or extra fees permitted.
  - Effective Communication Mandates (`28 C.F.R. § 35.160`): qualified ASL interpreters, high-speed VRI, CART real-time transcription, and screen-reader accessible documents at zero cost to the patient.
  - Sensory processing accommodations for Autism and ADHD: sensory decompression quiet spaces, noise-canceling headphones during quiet hours, alternatives to high-stimulus group therapy, executive function visual scaffolding, and non-stimulant ADHD pharmacotherapy coordination.
  - CDC 2022 Clinical Practice Guideline for Prescribing Opioids: explicit protections against rapid, forced, or involuntary opioid tapering; promotes split-dose buprenorphine for concurrent chronic pain and opioid use disorder.

- **Homelessness & Street Medicine Harm Reduction (`#/street-medicine`, `streetMedicine.js`)**:
  - Low-barrier street medicine MOUD protocols: field-based buprenorphine induction in encampments and drop-in centers without permanent address, phone, or photo ID requirements.
  - Weather exposure clinical warnings: cold-weather hypothermia risks caused by sedative/opioid vasodilation and shivering suppression; extreme heat stroke risks caused by stimulant hyperthermia and psychotropic thirst suppression.
  - Encampment sweep medication recovery protocols under the Fourth Amendment and ADA Title II: protecting vital prescriptions, naloxone kits, and mobility devices from municipal confiscation.
  - HUD Equal Access Rule & Fair Housing Act (`42 U.S.C. § 3604`): federal protections prohibiting emergency shelters and transitional housing from excluding or evicting individuals on prescribed MOUD.

- **Syringe Services Program (SSP) & Equipment Tracker Component (`sspEquipmentTracker.js`)**:
  - Evidence-based harm reduction supply calculator based on CDC SSP standards and consumption frequency.
  - Low dead-space fixed-needle syringe technology (27G–31G): cuts residual blood volume tenfold and reduces HIV/HCV transmission by over 90% while preventing vein sclerosis.
  - Chemical and infection safety directives: single-use sterile water ampoules (preventing *Candida albicans* and *Pseudomonas* fungal endophthalmitis); pure ascorbic acid packets for crack/tar (warning against lemon juice or vinegar); and critical clinical directives on alcohol prep pads (clean skin BEFORE puncture only, NEVER press onto bleeding puncture sites).
  - Safer inhalation supplies (Pyrex glass stems, brass screens, silicone mouthpieces, lip balm) and community sharps disposal guidelines.

## 10. Wave 12 Immigrant Rights, Post-Overdose Response, Stimulant Overamping & Medical Respite

- **Immigrant, Migrant & Language Access Health Rights (`#/immigrant-health`, `immigrantHealth.js`)**:
  - DHS Protected Areas Policy (Oct 2021 Guidelines): ICE and CBP are legally prohibited from conducting enforcement actions at or near healthcare facilities, hospitals, addiction treatment clinics, community health centers, mobile clinics, and emergency shelters.
  - Emergency Medicaid (`42 U.S.C. § 1396b(v)`): Federal requirement for states to cover acute emergency medical conditions (including acute overdose resuscitation, severe life-threatening withdrawal, and serious infections) regardless of immigration status or SSN.
  - Public Charge Rule Exclusions (`8 C.F.R. § 212.21`, 2022 Final DHS Rule): Substance use treatment, outpatient healthcare, Medicaid (except long-term institutionalization), and emergency food/shelter are exempt from public charge review and do not jeopardize green card applications.
  - Title VI Civil Rights Act (`42 U.S.C. § 2000d` & E.O. 13166): Guarantees free, qualified medical interpretation and translated vital documents for Limited English Proficiency (LEP) patients; prohibits forcing minor children or family members to interpret clinical consent.
  - HRSA Health Centers (§ 330): Mandates care to all individuals with sliding-scale discounts without requiring proof of legal residency or Social Security numbers.

- **Post-Overdose Response Teams & Community Paramedicine (`#/post-overdose`, `postOverdose.js`)**:
  - The Critical Vulnerability Window: Post-overdose risk is dramatically heightened in the first 48 hours to 30 days after non-fatal overdose due to tolerance loss and precipitated withdrawal.
  - PORT / Mobile Response: Certified peer recovery specialists and community paramedics conducting outreach within 24–72 hours to deliver naloxone, test strips, and warm handoffs.
  - Naloxone pharmacokinetics: Half-life of 30–90 minutes vs long-acting synthetic opioids; protocol for close observation for 2–4 hours post-reversal to prevent fatal rebound respiratory depression.
  - Precipitated withdrawal safety: Life-safety warnings against using street fentanyl to relieve post-naloxone withdrawal symptoms; comfort medication directives (ondansetron, clonidine, hydration).
  - DEA 72-Hour Emergency Bridge (`21 C.F.R. § 1306.07(b)`): Immediate hospital ED and clinic buprenorphine induction while linking to outpatient care.

- **Stimulant Care, Overamping Differential & Contingency Management (`#/stimulant-care`, `stimulantCare.js`)**:
  - Differentiating Physical Overamping (core hyperthermia >103°F / 39.5°C, chest pain, arrhythmias, rhabdomyolysis) requiring immediate 911 activation vs. Psychological Overamping (extreme paranoia, panic, 48hr+ sleep deprivation psychosis) requiring low-stimulus de-escalation.
  - Critical clinical imperative: Strict prohibition against physical restraints during stimulant agitation, which triggers catastrophic rhabdomyolysis and sudden cardiac death.
  - Active cooling protocols: Ice packs to neck, axillae, groin, cool water mists, hydration with electrolytes.
  - Contingency Management (CMI): The gold-standard evidence-based behavioral intervention for stimulant use disorders.
  - Safer inhalation and equipment: Pyrex heat-resistant glass, silicone mouthpieces to prevent lip cuts transmitting HCV/HIV, brass screens over copper pads, and 10:1 water dilution rules for fentanyl test strips.

- **Medical Respite & Recuperative Care for Unhoused Individuals (`medicalRespiteFinder.js`)**:
  - National Health Care for the Homeless Council (NHCHC) standards: Post-acute recuperative care for unhoused individuals too ill to recover on the streets or shelters but not requiring inpatient hospital care.
  - Essential services: Clean bed, meals, locked medication storage (MOUD lockboxes and refrigerated insulin), wound care, transportation to follow-up visits, and SSI/SSDI SOAR case management.
  - Safe hospital discharge protections (EMTALA) prohibiting unsafe discharges to the street ("patient dumping").


## 11. Wave 13 Chronic Pain, Buprenorphine Analgesia, Benzodiazepine Deprescribing & Care Team Documentation

- **Chronic Pain Management & Buprenorphine Analgesia Specialist (`#/chronic-pain`, `chronicPain.js`)**:
  - Implements the CDC 2022 Clinical Practice Guideline for Prescribing Opioids for Pain (MMWR 2022;71(No. RR-3):1–95): explicit statutory and clinical mandate against rapid, forced, or involuntary opioid tapers and clinician abandonment.
  - Pharmacokinetic Split-Dosing Optimization: Explains and calculates split dosing (TID or QID: every 6 to 8 hours) for buprenorphine in persistent pain. While buprenorphine's withdrawal and craving suppression lasts 24 to 36 hours, its analgesic duration of action lasts only 6 to 8 hours. Formulations include buccal films (Belbuca, mcg-dosed), transdermal patches (Butrans, mcg/hr), and sublingual tablets/films (Subutex, Suboxone, Zubsolv, mg-dosed).
  - Bernese Method Low-Dose Micro-Induction: Provides protocols for initiating buprenorphine without precipitating acute withdrawal, overlapping micro-doses while maintaining baseline full agonists.
  - Multimodal Non-Opioid Synergy: Categorizes evidence-based non-opioid strategies targeting specific pain physiology: SNRIs (duloxetine) for neuropathic/centralized pain, topical lidocaine 5% and diclofenac gel for localized musculoskeletal pain, and restorative graded motor therapy.

- **Benzodiazepine & Sedative-Hypnotic Deprescribing Safety Engine (`chronicPain.js`)**:
  - Implements the Ashton Protocol (Prof. C. Heather Ashton) and FDA 2020 Benzodiazepine Class Boxed Warning updates.
  - Oral Diazepam Equivalence Calculator: Converts alprazolam, clonazepam, lorazepam, temazepam, chlordiazepoxide, and oxazepam to approximate diazepam equivalents (10 mg oral reference).
  - Seizure Risk Stratification & Escalation: Triggers emergency 911 / ED evaluation under EMTALA for acute abrupt cessation of high-dose or long-term sedatives to prevent fatal status epilepticus and autonomic collapse. Identifies candidates for supervised inpatient medical detox vs. gradual 16-to-24+ week outpatient Ashton tapering schedules.
  - Stepwise Ashton Schedule Generator: Generates individualized 5%–10% biweekly decrement milestones and monitors the 10 Clinical Institute Withdrawal Assessment for Benzodiazepines (CIWA-B) domains. Strict clinical contraindication against flumazenil in chronic benzodiazepine users.

- **Care Team Workspace Post-Visit Documentation & Harm Reduction Summary (`#/workspace`, `workspace.js`)**:
  - Stage 4 Documentation and Harm Reduction Integration: Adds tasks for EHR checklist documentation, take-home naloxone/test-strip provisioning, transportation/NEMT verification, and 24/7 crisis resource handoffs.
  - Generates zero-PII plain text summary exports for care teams with date stamp, checklist verification states, and medical disclaimers.

- **Care Tools Catalog Expansion (`#/tools`, `tools.js`)**:
  - Adds `chronic-pain` to the searchable tools directory across individual, supporter, and care-team audiences.


## 12. Wave 14 Alcohol Care, Medical Withdrawal Risk (PAWSS) & MAUD Specialist

- **Alcohol Withdrawal Risk Stratification & Delirium Tremens Prediction (`#/alcohol-care`, `alcoholCare.js`)**:
  - Implements the Prediction of Alcohol Withdrawal Severity Scale (PAWSS, Maldonado et al., 2014): 10-item validated clinical screening instrument across threshold/historic factors, acute autonomic hyperactivity, and laboratory biomarkers.
  - Emergency Escalation & Hospital Disposition: Scores >= 4 identify patients at high statistical risk for complicated withdrawal (delirium tremens, grand mal withdrawal seizures, autonomic instability), triggering directives for inpatient medically supervised detoxification or emergency department hospital admission under federal EMTALA protections. Scores 0–3 guide ambulatory detoxification eligibility with close social/medical monitoring.

- **Wernicke-Korsakoff Syndrome Prevention & Thiamine Protocol (`alcoholCare.js`)**:
  - Clinical Mandate: High-dose parenteral thiamine (Vitamin B1, 200–500 mg IV/IM) administered BEFORE any intravenous dextrose/glucose or carbohydrate-rich food.
  - Biochemical Rationale: Unopposed glucose administration rapidly exhausts residual cerebral thiamine cofactors in pyruvate decarboxylation, triggering acute irreversible hemorrhagic necrosis of the mammillary bodies and thalamus.

- **Medications for Alcohol Use Disorder (MAUD) Compatibility Engine (`alcoholCare.js`)**:
  - Naltrexone (oral 50 mg daily or monthly Vivitrol 380 mg IM): First-line evidence for reducing heavy drinking and cravings. Features The Sinclair Method (TSM) targeted dosing (50 mg oral 1 hour prior to drinking for progressive pharmacological extinction). Enforces critical life-safety warning: 100% contraindicated with active opioid use, methadone, or buprenorphine (must be opioid-free for 7–14 days).
  - Acamprosate (Campral, 666 mg TID): NMDA glutamate modulator restoring GABA balance. Excreted 100% renally with zero hepatic metabolism — the gold standard for individuals with alcohol-associated liver disease, hepatitis, or cirrhosis. Contraindicated in severe renal impairment (CrCl < 30 mL/min).
  - Disulfiram (Antabuse, 250–500 mg daily): Irreversible aldehyde dehydrogenase (ALDH) inhibitor creating toxic acetaldehyde accumulation. Requires strict informed consent; contraindicated with cardiovascular disease or active drinking.

- **Care Tools Catalog & Shell Integration (`#/tools`, `tools.js`, `app.js`, `sw.js`)**:
  - Registered `alcohol-care` in `TOOL_CATALOG`, lazy loaders, route titles, preloading, and elective service worker caching.
  - Full bilingual Spanish translations in `es.js` and `es-tools.js`.

Not medical advice. HarborPath never endorses providers or accepts payment for listings.
