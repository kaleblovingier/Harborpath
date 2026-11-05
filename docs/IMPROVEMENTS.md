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

## 13. Wave 15 Family Support, Community Reinforcement & Family Training (CRAFT) Framework

- **CRAFT (Community Reinforcement and Family Training) Framework (`#/family-support`, `familySupport.js`)**:
  - Implements the evidence-based CRAFT protocol (Dr. Robert J. Meyers), which boasts a ~70% success rate in engaging treatment-refusing loved ones into care compared to traditional confrontational interventions (10%–30%).
  - 7 Evidence-Based Communication Rules:
    1. Brevity (avoiding long speeches or rehashing past grievances)
    2. Positive focus (describing what to do rather than what to stop)
    3. Specific requests (clear, small, observable behaviors)
    4. Labeling feelings with "I" statements without accusatory blame
    5. Offering understanding statements acknowledging the loved one's pressure/pain
    6. Offering genuine, concrete shared support or company
    7. Timing (never initiating conversations when loved one or supporter is intoxicated, angry, or exhausted)
  - Natural Consequences vs. Enabling Matrix:
    - Contrasts protective enabling actions (calling in sick for them, paying legal fines/bail without conditions, cleaning up messes, hiding use) with stepping back to allow natural consequences to motivate internal readiness for change.
  - Domestic Violence, Threats & Safety Boundary Stratification:
    - Immediate clinical screening for physical violence, verbal intimidation/threats, and firearms/weapons in the home.
    - Automatic crisis escalation providing immediate safety planning, the National Domestic Violence Hotline (800-799-7233 / text START to 88788), and directives that loved ones must prioritize their own physical safety and children's safety over substance use interventions.
  - Interactive CRAFT Script Builder:
    - Step-by-step interactive script composer with customizable text areas for: Understanding Statement, Feeling ("I" statement), Specific Request, and Concrete Offer of Support.
    - Generates real-time previews, copy-to-clipboard functionality, and downloadable/printable summaries.
  - Supporter Take-Home Naloxone & Boundary Support:
    - Family and supporter harm reduction education: carrying naloxone, recognizing signs of overdose, knowing state Good Samaritan immunity protections, and accessing support groups (Al-Anon, Nar-Anon, SMART Recovery Family & Friends).
  - Architecture, Accessibility & Privacy:
    - Zero local/session storage; purely in-RAM state with deterministic resets on navigation.
    - Accessible WCAG 2.2 AA compliant tabs, screen reader announcements (`aria-live="polite"`), and bilingual English/Spanish localization (`es.js`, `es-tools.js`).
    - Service Worker elective precaching (`ELECTIVE_SHELL` in `public/sw.js`).

## 14. Wave 16 Emerging Synthetic Adulterants, Xylazine ("Tranq"), Nitazenes & Wound Care Specialist

- **Emerging Adulterants Clinical Profiles & Pharmacology (`#/adulterant-care`, `adulterantCare.js`)**:
  - Xylazine ("Tranq", "Tranq Dope"): Non-opioid central alpha-2 adrenergic receptor agonist. Induces profound sedation, central bradycardia, systemic hypotension, hypothermia, and microvascular vasoconstriction. Reversal directive: Naloxone does NOT reverse alpha-2 sedation; it must be administered to reverse the opioid (fentanyl) component. Once breathing is restored (>=8–10 bpm), excess repeated naloxone must be stopped to avoid precipitating violent opioid withdrawal while failing to wake the patient. Place in recovery position, maintain airway, and keep warm.
  - Nitazenes (Benzimidazole Opioids: Isotonitazene, Protonitazene, Metonitazene): Ultra-potent synthetic mu-opioid full agonists (10x–40x fentanyl potency, up to 1,000x morphine). Induces rapid fatal respiratory arrest and rigid chest wall syndrome ("wooden chest"). Fully responsive to naloxone but may require multiple repeated 4 mg doses every 2–3 minutes alongside sustained rescue breathing / bag-valve-mask ventilation. Standard FTS test strips do not detect nitazenes.
  - Medetomidine & Dexmedetomidine: Ultra-potent alpha-2 adrenoceptor agonist (100x–200x more potent than clonidine). Causes extreme bradycardia (<40 bpm), severe hypotension, and prolonged unresponsiveness lasting up to 12 hours. Atropine often ineffective; requires emergency EMS transport for supportive hemodynamic management.
- **Evidence-Based Harm Reduction Necrotic Wound Care Protocols**:
  - Pathophysiology: Xylazine-induced peripheral microvascular vasoconstriction produces severe necrotic ulcers anywhere on the body, not only at injection sites.
  - 4 Clinical Rules:
    1. Gentle Cleansing: Irrigate with sterile normal saline or clean tap water with mild unscented soap. Strict contraindication: NEVER use hydrogen peroxide, rubbing alcohol, iodine, or bleach (cytotoxic chemicals destroying granulating tissue).
    2. Moist Healing: Apply medical-grade petroleum jelly (Vaseline) or non-adherent dressing (Xeroform); moist environments accelerate re-epithelialization by up to 40% compared to dry scabs.
    3. Non-Adherent Covering: Sterile Telfa pads wrapped with flexible gauze (Kerlix). Never debride or cut away black necrotic tissue at home.
    4. Border Marking & Sepsis Surveillance: Trace outer red margin with pen, date, and time. Emergency ED evaluation for redness spreading >2 cm, systemic fever (>100.4°F), crepitus, or foul odor.
- **Xylazine Withdrawal & Adrenergic Rebound Protocol**:
  - Symptoms: Severe autonomic storm (hypertension, resting tachycardia, diaphoresis, tremors) and severe psychological agitation/panic occurring 8–24 hours after last use. Opioids alone do not relieve alpha-2 withdrawal.
  - Pharmacotherapy: Alpha-2 agonists (Clonidine 0.1–0.3 mg PO TID or Tizanidine 2–4 mg PO TID) titrated to blood pressure and pulse, paired with concurrent MOUD (buprenorphine or methadone).
- **Drug Checking & Test Strip Dilution Standards (XTS & FTS)**:
  - Fentanyl powder / pressed pills: 10 mg sample diluted in 5 mL (1 tsp) water, dipped for 15s, read in 3–5 min.
  - Stimulants (methamphetamine / MDMA): Requires 1 full cup (200 mL) water per 10 mg sample to prevent false positives from secondary amines.
- **Sedation vs. Overdose Triage Engine & Bilingual Reporting**:
  - Stratifies patient signs into Opioid Overdose (911 + Naloxone), Sepsis/Infection (Urgent ED), Alpha-2 Sedation (Recovery position, airway protection, avoid extra naloxone), Xylazine Rebound (Clonidine protocol), or Routine Harm Reduction.
  - Generates zero-PII bilingual plain-text clinical summaries.

## 15. Wave 17 Federal Opioid Treatment Program (OTP) Regulations, Methadone Access & Patient Rights

- **2024 SAMHSA 42 CFR Part 8 Final Rule Implementation (`#/methadone-access`, `methadoneAccess.js`)**:
  - Encodes the historic 2024 modernization of federal Opioid Treatment Program (OTP) regulations—the most comprehensive statutory overhaul in over 20 years.
  - Accelerated Take-Home Schedule Flexibilities (§ 8.12(i)):
    - Days 0–14: Up to 7 days of take-home doses based on clinical assessment (permanently eliminates the archaic 1-bottle/week restriction).
    - Days 15–30: Up to 14 days of take-home doses.
    - Days 31+: Up to 28 days of take-home doses (full monthly supply), permanently eliminating the multi-year waiting ladder.
  - 8-Point Clinical Safety Assessment Engine: Evaluates the 8 federal criteria under § 8.12(i)(2) (toxicity absence, clinic attendance, behavioral stability, absence of diversion, safe home lockbox storage, rehabilitative benefit vs risk, recovery stage, and transportation access).
  - Mandatory Lockbox Safety Gating: Enforces federal child/pet poison prevention standards, requiring a locked container before dispensing multi-day take-home doses.
- **Federal Patient Rights & Anti-Punitive Protections**:
  - Elimination of 1-Year Addiction History Rule: Programs can no longer require patients to prove a 12-month history of continuous opioid addiction before admission.
  - Anti-Punitive Toxicology Protections: Federal regulations explicitly state that positive drug toxicology screens (including cannabis/THC or isolated substance recurrence) CANNOT be the sole basis for punitive take-home bottle revocations or administrative discharge.
  - Protection Against Forced Rapid Tapers: Declares dangerous administrative "curb tapering" (3–7 day forced detox) a violation of modern clinical standards of care. Tapers must be voluntary, collaborative, and patient-paced.
  - Telehealth Initiation: Authorizes audio-visual telehealth evaluations for methadone induction in OTP settings.
- **Methadone Pharmacokinetics & Life-Safety Directives**:
  - Induction Safety & "Dose Stacking" Prevention: Standard starting dose 20–30 mg PO (maximum 30–40 mg on Day 1). Warns against rapid increases in days 2–4; methadone's long half-life (24–36+ hours) vs shorter analgesic duration (4–8 hours) leads to fatal cumulative tissue accumulation ("dose stacking") between days 3 and 7.
  - Long-Acting Naloxone Rebound Directive: Naloxone half-life is 30–90 minutes while methadone lasts 24–36+ hours. Following naloxone reversal of methadone overdose, secondary respiratory arrest is medically expected once naloxone clears. Mandatory 12–24 hour emergency department hospital monitoring.
  - Cardiac QTc Prolongation Safety: Details hERG potassium channel blockade mechanisms, risk factors (doses >100 mg/day, concomitant QT-prolonging drugs, hypokalemia/hypomagnesemia), and baseline ECG screening recommendations.
- **Guest Dosing (Courtesy Dosing) & Travel Navigator**:
  - Step-by-step advance planning checklist (3–7 business days advance notice, physician sign-off, clinic DEA/SAMHSA license verification, interstate Medicaid coordination, and guest dosing fee navigation).
- **Interactive Self-Advocacy Script Composer**:
  - Generates plain-language, legally grounded scripts for:
    1. Requesting 2024 Part 8 Take-Home schedule reviews.
    2. Advocating against punitive take-home loss following a positive drug screen.
    3. Coordinating guest dosing for travel or work.
    4. Requesting a safe, patient-paced voluntary taper.

## 16. Wave 18 Dual Diagnosis, Integrated Dual Disorder Treatment (IDDT), Psychotropic Compatibility & Crisis Planning

- **Integrated Dual Disorder Treatment (IDDT) Clinical Framework (`#/dual-diagnosis`, `dualDiagnosis.js`)**:
  - Encodes the SAMHSA & ASAM Evidence-Based Practice (EBP) IDDT model for individuals with co-occurring psychiatric and substance use disorders.
  - Core Mandates: Both conditions are primary biological disorders. Rejects outdated sequential care ("get 90 days sober before we treat depression") and siloed parallel care. Mandates simultaneous, unified care delivered by the same multidisciplinary team. Stage-wise motivational interventions adapt to each disorder independently.
- **Psychotropic Medications & MOUD Clinical Compatibility**:
  - Antidepressants (SSRIs/SNRIs: Sertraline, Escitalopram, Duloxetine): Highly compatible with buprenorphine and naltrexone; safe with standard-dose methadone (monitored for mild serotonergic additive effects). Non-addictive, zero respiratory depression risk.
  - Mood Stabilizers (Lamotrigine, Lithium, Valproate): Lamotrigine is preferred due to minimal hepatic/metabolic interactions. Critical Lithium Alert: Alcohol dehydration or NSAIDs sharply increase lithium serum concentrations, triggering neurotoxicity and renal damage.
  - ADHD Pharmacotherapy in SUD: Untreated ADHD triples relapse risk due to executive dysfunction and impulsivity. Prioritizes non-stimulants (Atomoxetine, Viloxazine, Bupropion, Guanfacine ER) and enzymatic prodrug/OROS stimulants (Vyvanse, Concerta) under strict monitoring.
  - Bupropion (Wellbutrin) Seizure Warning: Lowers seizure threshold. Strictly contraindicated during acute alcohol or benzodiazepine withdrawal, and in active bulimia/anorexia.
- **Immunoassay Toxicology False-Positive Registry & Patient Rights**:
  - Documents widespread cross-reactivity on point-of-care rapid urine cups:
    * Bupropion -> Amphetamine / Methamphetamine
    * Sertraline -> Benzodiazepines
    * Quetiapine -> Methadone
    * Venlafaxine -> Phencyclidine (PCP)
    * Diphenhydramine / Doxylamine -> Methadone, Opiates, or PCP
  - Mandatory Advocacy Directive: Rapid screens are presumptive only. Under ASAM, SAMHSA, and CLIA federal laboratory standards, any disputed screen must be confirmed with Gas Chromatography-Mass Spectrometry (GC-MS) or LC-MS/MS before punitive consequences are imposed.
- **Trauma & Seeking Safety Grounding Protocols**:
  - Sensory Grounding (5-4-3-2-1 technique).
  - Cognitive Orientation ("The trauma happened in the past; I am safe in this room right now").
  - Physiological Vagal Calming (4-4-6 diaphragmatic box breathing, mammalian dive reflex ice reset).
- **Columbia-Suicide Severity Rating Scale (C-SSRS) Screener & Crisis Safety Planning**:
  - Stratifies risk: Imminent Emergency (Intent with Plan -> 988, 911 under EMTALA, lethal means lockup), Moderate Risk (Thoughts with method -> urgent psychiatric linkage), Passive Ideation (Supportive crisis text line), and Routine Care.
  - 24/7 Crisis Access: 988 Suicide & Crisis Lifeline, Veterans Crisis Line (988 press 1), The Trevor Project (866-488-7386), Trans Lifeline (877-565-8860).
- **Self-Advocacy Script Composer**:
  - Plain-language scripts for requesting IDDT care, demanding confirmatory GC-MS testing, seeking adult ADHD evaluation, and setting trauma-informed care boundaries.


## 17. Wave 19 — Polysubstance Overdose Synergy, Depressant Stacking & Interaction Navigator

### Clinical, Pharmacological & Public Health Objectives
- **Polysubstance Overdose Synergy**: Addresses the epidemiological reality that over 80% of accidental overdose deaths in the United States involve multi-substance combinations (CDC Overdose Data to Action).
- **Depressant Stacks (Opioids + Benzodiazepines + Alcohol + Gabapentinoids + Alpha-2 Agonists)**:
  - Details the fatal pharmacodynamic mechanism: Opioids blunt hypoxic ventilatory drive; Benzodiazepines and Alcohol blunt hypercapnic respiratory arousal reflexes; Gabapentinoids impair compensatory ventilatory mechanics.
  - Multiplies risk of fatal central and obstructive apnea at fractional doses.
- **Speedballs & Goofballs (Opioids + Stimulants)**:
  - Explains the pharmacokinetic half-life mismatch: Short-acting cocaine (0.5-1.5h) masks the severe respiratory depression of long-acting opioids (fentanyl, methadone). When the stimulant rapidly wears off, the patient lapses into sudden respiratory arrest.
  - Cardiac arrhythmia and acute coronary vasospasm risks from simultaneous adrenergic drive and hypoxia.
- **Airway & Resuscitation Algorithm (The "Naloxone-Resistant" Overdose Protocol)**:
  - Clarifies that naloxone **only** reverses mu-opioid receptor binding, having zero affinity for GABA-A (benzos, alcohol), GABA-B (GHB), alpha-2 (xylazine), or voltage-gated calcium channels (gabapentin).
  - Establishes the clinical rule: If adequate spontaneous respirations (> 10-12 breaths/min) are restored, **do NOT** administer continuous massive naloxone doses that induce violent precipitated withdrawal, projectile vomiting with asphyxiation risk, and flash pulmonary edema.
  - Emphasizes the Recovery Position and immediate rescue breathing (1 breath every 5 seconds) as the primary life-saving interventions while calling 911.
- **Hunter Serotonin Toxicity Criteria Evaluation**:
  - Implements the international gold standard for Serotonin Syndrome: spontaneous clonus, inducible clonus + agitation/diaphoresis, ocular clonus + agitation/diaphoresis, tremor + hyperreflexia, and hyperthermia (> 38°C / 100.4°F) + hypertonia.
  - Explains why muscular hyperthermia is non-hypothalamic and non-responsive to acetaminophen, requiring urgent physical cooling and emergency hospital admission.
- **In-RAM Ephemeral State & Export**:
  - Zero device storage (`localStorage`, `sessionStorage`, `document.cookie`).
  - Bilingual plain-text summary generator for patient-peer communication without PII.
  - WCAG 2.2 AA compliant tabbed interface with full keyboard navigation and accessible headings.


## 18. Wave 20 — Nightlife, Club Drugs, Dissociatives & Festival Harm Reduction

### Clinical, Toxicological & Harm Reduction Objectives
- **Dance Culture & Festival Grounding**: Addresses critical harm reduction for party environments, festivals, and nightlife venues using DanceSafe, American College of Medical Toxicology (ACMT), and Crew 2000 evidence-based clinical standards.
- **Ketamine Bladder Health & K-Cystitis Protocol**:
  - Explains the pathophysiology of Ketamine-Induced Ulcerative Cystitis: norketamine urothelial cytotoxicity, micro-ulcerations, mucosal sloughing, severe bladder contraction, frequency (>60 times/day), and hematuria.
  - Actionable harm reduction: regular breaks, spitting the drip (preventing non-psychoactive gastrointestinal and biliary irritation), abundant isotonic hydration, and Epigallocatechin Gallate (EGCG / green tea extract 400-800 mg) polyphenolic urothelial shielding.
- **MDMA Fluid Balance Protocol & Dilutional Hyponatremia**:
  - Highlights SIADH (syndrome of inappropriate antidiuretic hormone) induced by MDMA, impairing renal water excretion.
  - Establishes precise fluid limits: no more than 250 mL/hour when resting, or 500 mL/hour when actively dancing in hot spaces.
  - Mandates isotonic electrolyte fluids over plain water to prevent fatal acute cerebral edema and hyponatremic seizures.
  - Details hyperthermia prevention (cool-down chill rooms), 3-month spacing rule, and weight-based dosing `[body weight kg + 50 = max mg]`.
  - Enforces the strict rule that 5-HTP must **never** be taken on the same day as MDMA due to severe Serotonin Syndrome risks.
- **GHB/GBL/1,4-BD Precision Dosing & Dependence Emergency**:
  - Highlights the steep non-linear dose-response curve (0.5 mL margin between euphoria and comatose "G-out").
  - Absolute prohibition of alcohol co-ingestion (multiplied synergistic GABA-B respiratory arrest).
  - Volumetric oral syringe dosing and food-coloring safety precautions.
  - Outlines the life-threatening medical emergency of abrupt round-the-clock GHB withdrawal (delirium, seizures, autonomic collapse) requiring inpatient medical detoxification with high-dose baclofen and benzodiazepines.
- **Nitrous Oxide Neuropathy & Vitamin B12 Inactivation**:
  - Details the chemical mechanism: oxidation of the cobalt core of cobalamin from Co+ to Co3+, rendering Vitamin B12 permanently inactive and shutting down methionine synthase.
  - Identifies early warning signs of Subacute Combined Degeneration of the Spinal Cord (SCD): paresthesias, foot drop, ataxia, and loss of proprioception.
  - Cryogenic freeze burn prevention (mandatory balloon use) and high-dose intramuscular Vitamin B12 protocol.
- **Reagent Testing Matrix**:
  - Qualitative chemical reaction tables for Marquis, Simon's (A + B), Froehde, and Morris (A + B) across MDMA, Meth, 2C-B, Cathinones, and Ketamine.
  - Emphasizes that reagents confirm substance identity but do not rule out trace fentanyl or xylazine, mandating dual testing with test strips.
- **In-RAM Ephemeral State & Plain-Text Export**:
  - Zero device storage (`localStorage`, `sessionStorage`, `document.cookie`).
  - Bilingual export without PII.
  - WCAG 2.2 AA compliant accessible DOM structure.


## 19. Wave 21 — Sleep Restoration, Insomnia & Post-Acute Withdrawal (PAWS) Navigator

### Clinical, Neurobiological & Behavioral Objectives
- **Relapse Prevention Through Sleep Stabilization**: Insomnia is the #1 neurobiological predictor of relapse in early addiction recovery across opioids, alcohol, and stimulants (SAMHSA TIP 63 / TIP 45, ASAM Guidelines).
- **Substance-Specific Sleep Architectures**:
  - **Opioids**: Loss of restorative slow-wave delta sleep and REM sleep; acute rebound insomnia lasting 1-14 days; post-acute withdrawal (PAWS) sleep fragmentation persisting 6-12 months due to depleted endogenous endorphinergic tone. Explains why split-dose buprenorphine stabilizes nocturnal withdrawal.
  - **Alcohol**: Severe REM rebound with autonomic nightmares and diaphoresis; protracted slow-wave sleep impairment lasting up to 2 years post-cessation. Recommends acamprosate to re-balance GABA/glutamate neurotransmission.
  - **Stimulants**: Initial hypersomnia crash (14-20 hrs/day) transitioning to delayed sleep phase, circadian inversion, and nighttime anhedonia lasting 1-6 months.
  - **Benzodiazepines**: Catastrophic rebound insomnia, seizure vulnerability, and nocturnal panic requiring gradual Ashton Protocol tapering over 12-24+ weeks.
  - **Cannabis**: REM suppression; acute withdrawal triggers intense sleep latency and vivid bizarre rebound dreams for 2-4 weeks. Normalizing REM rebound prevents panic and relapse.
- **Evidence-Based Non-Controlled Pharmacotherapy**:
  - Trazodone (25-100 mg): 5-HT2A and H1 antagonist; increases slow-wave sleep without addiction or respiratory depression with MOUD.
  - Mirtazapine (7.5-15 mg): Paradoxical dosing effect (lower doses 7.5-15 mg are vastly more sedating than 30-45 mg); ideal for co-occurring anorexia/depression.
  - Hydroxyzine (25-50 mg): Rapid-onset peripheral/central H1 blocker; calms somatic withdrawal restlessness without habituation.
  - Low-Dose Doxepin (3-6 mg, Silenor): Highly selective nanomolar H1 blockade; FDA-approved specifically for middle-of-the-night sleep maintenance awakenings.
  - Prazosin (1-5 mg): Central alpha-1 adrenergic antagonist; evidence-based treatment for PTSD trauma nightmares and nocturnal hyperarousal.
  - Ramelteon (8 mg): High-affinity melatonin MT1/MT2 agonist; resets circadian phase with zero abuse potential.
  - Strict Boxed Warnings against Benzodiazepines and Z-drugs (Ambien/Lunesta) with MOUD due to fatal synergistic central respiratory arrest.
- **Core CBT-I Behavioral Protocols**:
  - Stimulus Control Therapy (Bootzin technique): Bed is for sleep only; the 20-minute rule (leave bed if awake after 20 minutes); fixed wake time 7 days a week.
  - Sleep Restriction Therapy: Calculating Sleep Efficiency = `(Time Asleep / Time in Bed) * 100`; restricting window if <85% to rebuild homeostatic sleep pressure.
  - Circadian Entrainment: 10,000 lux natural morning sunlight anchor within 45 minutes of waking; evening blue light curfew.
  - Using Dreams Psychoeducation: Reframing vivid dreams of using as healthy REM neuro-regeneration, not relapse.
- **In-RAM Ephemeral State & Export**:
  - Zero device storage (`localStorage`, `sessionStorage`, `document.cookie`).
  - Bilingual plain-text summary generator for patient-clinician sleep dialogue without PII.
  - WCAG 2.2 AA compliant accessible DOM structure.

## 20. Wave 22 — Dental & Oral Health, Buprenorphine Enamel Protocol & Endocarditis Prevention

### Clinical, Stomatological & Systemic Objectives
- **FDA 2022 Drug Safety Communication on Transmucosal Buprenorphine**:
  - Addresses acidic oral dissolution (Suboxone/Subutex tablets and buccal/sublingual films, pKa ~3.5–4.5) causing severe dental decay, cervical caries, tooth fractures, and enamel erosion.
  - Implements the critical 6-step oral harm reduction protocol:
    1. Pre-rinse and moisten mouth with water before dose placement to optimize salivary buffer capacity.
    2. Complete dissolution sublingually or buccally without talking, eating, or drinking.
    3. Swish a full glass of water thoroughly across all teeth and swallow after complete dissolution.
    4. **Mandatory 1-Hour Brushing Delay**: Strictly avoid brushing teeth for at least 60 minutes post-dose. Brushing while enamel is acid-softened mechanically abrades the demineralized hydroxyapatite prism structure.
    5. High-concentration neutral sodium fluoride: Prescribe 1.1% Neutral Sodium Fluoride toothpaste (Prevident 5000 / 5,000 ppm F-) nightly for remineralization.
    6. Depot Alternative Consideration: Discuss subcutaneous extended-release buprenorphine depots (Sublocade / Brixadi) to completely bypass oral acid exposure while maintaining full MOUD therapeutic efficacy.
- **Stimulant-Induced Xerostomia & Bruxism/Clenching**:
  - Pathophysiology: Sympathetic alpha-1/alpha-2 adrenergic salivary vasoconstriction dramatically reduces protective salivary flow, precipitating rapid rampant smooth-surface decay ("meth mouth").
  - Salivary stimulation: 100% xylitol lozenges and chewing gum (inhibits *Streptococcus mutans* enzymatic glycolysis) and carboxymethylcellulose/biotène artificial saliva substitutes.
  - Bruxism and clenching: Magnesium glycinate supplementation (200–400 mg elemental magnesium) for masseter muscle relaxation, custom or boiling-water vacuum nightguards, and warm compresses.
  - Avoidance of sugary/acidic carbonated beverages and acidic sports drinks.
- **Infective Endocarditis (IE) & Oral Bacteremic Portals**:
  - Highlights *Streptococcus viridans* and oral flora bacteremia colonizing cardiac endothelium and tricuspid/mitral valves, particularly in individuals with pre-existing valvular disease, prosthetic valves, or history of injection drug use.
  - Endocarditis symptom screening: Unexplained prolonged fevers, night sweats, petechiae on oral mucosa or conjunctivae, Osler's nodes, Janeway lesions, and splinter hemorrhages.
  - Ludwig's Angina Red-Flag Triage: Immediate life-threatening floor-of-mouth deep neck infection causing airway obstruction (elevated tongue, bull neck swelling, stridor, drooling/inability to swallow secretions) requiring immediate emergency 911 activation and awake fiberoptic intubation.
- **Community Dental Resource Navigation**:
  - Guidance on locating Federally Qualified Health Centers (FQHCs) offering sliding-fee scale dental clinics regardless of insurance.
  - Ryan White Part A & Part B Dental Programs for individuals living with HIV.
  - Dental School and Dental Hygiene teaching clinics for low-cost comprehensive care.
  - Clear advice on self-advocacy and non-stigmatizing dental communication.
- **In-RAM Ephemeral State & Export**:
  - Zero persistent storage (`localStorage`, `sessionStorage`, `document.cookie`).
  - Bilingual exportable plain-text summary for dental visits without PII.
  - WCAG 2.2 AA compliant accessible DOM structure.


## 21. Wave 23 — Cannabinoid Hyperemesis Syndrome (CHS), High-Potency Concentrates & Cannabis Harm Reduction

### Clinical, Gastroenterological & Toxicological Objectives
- **Rome IV Diagnostic Framework & Pathophysiological Staging**:
  - Addresses the paradoxical phenomenon where chronic, supraphysiological stimulation of central and enteric Cannabinoid-1 (CB1) receptors induces severe downregulation, uncoupling, and gastrointestinal dysmotility.
  - Diagnostic criteria: Regular cannabinoid exposure (>1 year, high-frequency/concentrate use), cyclic violent vomiting (5–15+ episodes/hour), pathognomonic compulsive hot bathing ("scald-seeking" behavior through TRPV1 vanilloid cutaneous activation), and permanent symptom resolution post-cessation.
  - Clinical phase staging: Prodromal phase (early morning nausea, paradoxical self-medication trap where increasing cannabis intake exacerbates receptor saturation), Hyperemetic phase (acute cyclic crisis), and Recovery phase (normalization across weeks to months).
- **The Antiemetic Failure Paradox & Evidence-Based Acute Interventions**:
  - Clarifies why conventional 5-HT3 antagonists (Ondansetron / Zofran), dopamine antagonists (Metoclopramide / Reglan), and antihistamines (Promethazine / Phenergan) fail to abort acute CHS crises.
  - **First-Line Topical Capsaicin 0.025%–0.075% Cream**: TRPV1 vanilloid receptor agonist. Activates and desensitizes peripheral cutaneous vanilloid receptors on abdominal sensory nerves, mimicking hot shower relief without burn risks. Strict application and glove safety guidance.
  - **Dopamine D2 & 5-HT2A Antagonists (Haloperidol / Droperidol)**: Central dopamine blockade in the chemoreceptor trigger zone (CTZ) and area postrema; clinical trial-backed efficacy in aborting cyclic emesis and significantly shortening emergency room length of stay.
  - **Aggressive IV Rehydration & Electrolyte Replacement**: Rapid volume expansion with Lactated Ringer's or Normal Saline, with urgent potassium/magnesium repletion to reverse hypokalemic metabolic alkalosis.
- **Emergency Red-Flag Complications & Triage**:
  - Pre-renal Acute Kidney Injury (AKI) from profound volume loss and elevated creatinine.
  - Hypokalemic metabolic alkalosis with lethal ventricular arrhythmia vulnerability.
  - Mallory-Weiss mucosal lacerations and Boerhaave syndrome (esophageal rupture) from violent retching.
  - Severe thermal scald burns from prolonged scalding water exposure.
  - Synthetic Cannabinoids ("K2", "Spice", Pinaca/Fubinaca families) toxidrome: full high-affinity CB1 agonists with severe cardiovascular toxicity (myocardial infarction, malignant tachycardia), seizures, catatonia, and acute psychosis requiring immediate 911 activation.
- **The 90-Day CB1 Receptor Upregulation Timeline & Withdrawal Management**:
  - Detailed recovery phases: Days 1–3 (acute rebound & BRAT re-feeding), Days 4–14 (peak withdrawal, insomnia, vivid REM dreams, hyperhidrosis), Weeks 3–6 (motility normalization & natural appetite return), Weeks 6–12 (full central and enteric CB1 receptor density recovery).
  - Non-controlled supportive pharmacotherapy: Trazodone / Melatonin for insomnia, Hydroxyzine for somatic restlessness and sweating, N-acetylcysteine (NAC 1,200 mg BID) for craving attenuation and glutamate homeostasis.
- **In-RAM Ephemeral State & Export**:
  - Zero device storage (`localStorage`, `sessionStorage`, `document.cookie`).
  - Bilingual exportable plain-text summary for Emergency Department or Gastroenterology encounters to prevent unnecessary invasive procedures (cholecystectomies, repeated CTs) and advocate for evidence-based capsaicin and haloperidol therapy without stigma.
  - WCAG 2.2 AA compliant accessible DOM structure.


## 22. Wave 24 — Viral Hepatitis (HCV/HBV), Direct-Acting Antivirals (DAAs), FIB-4 Fibrosis Scoring & HIV PrEP/PEP

### Clinical, Hepatological & Infectious Disease Objectives
- **AASLD / IDSA Simplified Treatment Guidance & Patient Rights**:
  - Establishes the clear, non-negotiable clinical standard: **Active substance use, ongoing injection, or engagement in MOUD (methadone/buprenorphine) is NEVER a reason to withhold, delay, or deny Hepatitis C curative treatment.**
  - Overcomes historical Medicaid sobriety restrictions with evidence-based patient self-advocacy tools.
  - Modern pan-genotypic Direct-Acting Antivirals (DAAs) achieve >95–98% Sustained Virologic Response (SVR12) with once-daily oral pills for 8 to 12 weeks:
    - *Mavyret (glecaprevir/pibrentasvir)*: 8-week course, 3 tablets once daily taken WITH FOOD. Active against genotypes 1–6. Contraindicated in decompensated cirrhosis (Child-Pugh B or C).
    - *Epclusa (sofosbuvir/velpatasvir)*: 12-week course, 1 tablet once daily with or without food. Crucial PPI drug interaction warning: Omeprazole decreases velpatasvir absorption by 50%—Epclusa must be taken 4 hours before omeprazole (≤ 20 mg).
    - 100% pharmacokinetic compatibility with buprenorphine and methadone maintenance without dose alterations.
- **The 4-Step HCV Diagnostic Cascade**:
  - Step 1: HCV Antibody Screen (Anti-HCV) detects lifetime exposure (20–25% clear spontaneously).
  - Step 2: Reflex HCV RNA Quantitative PCR / Viral Load confirms active replicating infection.
  - Step 3: FDA Black Box Hepatitis B Reactivation Screen (HBsAg and anti-HBc prior to DAA start to avoid fatal fulminant reactivation).
  - Step 4: Non-invasive fibrosis staging via the FIB-4 index.
- **In-RAM Ephemeral FIB-4 Liver Fibrosis Calculator**:
  - Formula: FIB-4 = (Age × AST) / (Platelets × √ALT).
  - Tri-level risk stratification:
    - FIB-4 < 1.45 (or < 2.0 if age > 65): Low risk of advanced fibrosis (>90% negative predictive value); candidate for simplified primary care DAA treatment.
    - FIB-4 1.45–3.25: Indeterminate; secondary non-invasive elastography (FibroScan) or APRI indicated.
    - FIB-4 > 3.25: High risk of advanced fibrosis or cirrhosis (F3–F4); requires hepatology referral and lifelong bi-annual abdominal ultrasound surveillance for hepatocellular carcinoma (HCC) even post-cure.
- **HIV PrEP & 72-Hour Emergency Post-Exposure Prophylaxis (PEP)**:
  - CDC clinical guidelines on PrEP for PWID (daily oral Truvada or bi-monthly injectable Apretude).
  - Emergency 72-hour PEP window: Urgent initiation within 72 hours of needle-stick or shared syringe exposure with a full 28-day antiretroviral course.
  - HCV environmental resilience: Educates that Hepatitis C survives in dried blood on cookers, filters, and water for up to 3 to 6 weeks (unlike HIV). Clarifies that SVR12 cure does not confer immunity and reinforces sterile point-of-use equipment.
- **Emergency Red Flags & Hepatic Decompensation**:
  - Ascites, jaundice, asterixis, hepatic encephalopathy, and esophageal variceal bleeding -> Immediate 911 activation.
- **In-RAM Ephemeral State & Export**:
  - Zero device storage (`localStorage`, `sessionStorage`, `document.cookie`).
  - Bilingual exportable plain-text clinical summary for primary care or hepatology consultations without PII.
  - WCAG 2.2 AA compliant accessible DOM structure.


## 23. Wave 25 — Tobacco, Nicotine, Vaping & Smoking Cessation in Recovery

### Clinical, Behavioral & Pharmacological Objectives
- **Concurrent Tobacco Treatment in Addiction Recovery**:
  - Dispels the harmful clinical myth that quitting smoking during substance use treatment threatens sobriety.
  - Implements the ASAM/SAMHSA consensus: **Concurrent smoking cessation during treatment for opioids, alcohol, or stimulants increases overall long-term abstinence by 25% or more.**
  - Directly addresses the leading cause of death in recovery: more than 50% of individuals with opioid or alcohol use disorder die from preventable tobacco-related cardiovascular and pulmonary diseases.
  - Details the ACA / Medicaid $0-copay mandate covering both prescription and OTC cessation medications with zero cost-sharing.
- **Fagerström Test for Nicotine Dependence (FTND) Interactive Assessment**:
  - Full 6-question validated clinical screener calculating dependence scores (0–10) and stratifying into Very Low (0–2), Low-Moderate (3–4), Moderate (5), High (6–7), and Very High (8–10) physiological dependence tiers with tailored treatment recommendations.
- **Combination Nicotine Replacement Therapy (NRT) Protocols**:
  - Explains the basal controller + acute reliever mechanism: pairing a 24-hour transdermal patch (21 mg, 14 mg, 7 mg) with short-acting oral NRT (gum, lozenges, inhaler 2 mg or 4 mg) nearly doubles quit success over single-agent therapy.
  - Clinical guidance on the "Chew and Park" gum technique to ensure transmucosal buccal absorption and avoid dyspepsia/hiccups from swallowed nicotine.
- **Non-Nicotine Pharmacotherapy Guidance**:
  - *Varenicline (Chantix)*: Alpha-4 beta-2 partial agonist. Reviews the 8,000-patient EAGLES trial proving neuropsychiatric safety in individuals with substance use and psychiatric disorders; pre-loading ("reduce to quit") titration schedules.
  - *Bupropion SR (Zyban)*: NDRI mechanism, benefits for co-occurring depression/ADHD, and strict boxed contraindications for seizure disorders, eating disorders, or acute alcohol/benzo withdrawal.
- **High-Potency Vape Salts & Nicotine Pouches Harm Reduction**:
  - Explains the pharmacokinetics of protonated nicotine salts (35–50 mg/mL benzoic acid salts) and provides a structured 5-stage down-titration ladder to freebase and zero-nicotine liquids.
  - Guidance on oral synthetic pouches (gum recession prevention and tapering).
- **The "4 D's" Acute Craving Defusal Protocol**:
  - Interactive behavioral guide: Delay (3–5 min), Deep breathing (parasympathetic vagal activation), Drink cold water, and Distract (breaking motor cue loops).
  - Direct connection to free state quitlines (1-800-QUIT-NOW and Spanish 1-855-DÉJALO-YA) for mailed free NRT.
- **In-RAM Ephemeral State & Export**:
  - Zero device storage (`localStorage`, `sessionStorage`, `document.cookie`).
  - Bilingual exportable plain-text summary for clinician/quitline consultation without PII.
  - WCAG 2.2 AA compliant accessible DOM structure.


## 24. Wave 26 — Benzodiazepine & Z-Drug Deprescribing, Ashton Manual Tapering, Flumazenil Toxicity Alerts & Protracted Withdrawal (BIND) Navigator

### Clinical, Behavioral & Pharmacological Objectives
- **Evidence-Based Ashton Manual Deprescribing Protocols**:
  - Implements the gold-standard Ashton Manual (Heather Ashton DM, FRCP) gradual tapering and crossover methodology.
  - Formulates multi-stage substitution schedules into Diazepam (Valium) for high-potency, short-half-life agents (Alprazolam/Xanax, Lorazepam/Ativan, Clonazepam/Klonopin, Triazolam/Halcion) to eliminate interdose peak-and-valley rebound panic attacks.
  - Highlights Diazepam's unique pharmacokinetics ($t_{1/2} = 20\text{--}100\text{ hours}$ plus active desmethyldiazepam $36\text{--}200\text{ hours}$), providing a smooth, continuous pharmacokinetic plateau.
  - Enforces patient-led pacing: conservative 5% to 10% reductions of current dose every 2 to 4 weeks with explicit "hold" rules if withdrawal symptoms flare.
  - Incorporates micro-tapering guidance in the final low-dose stages ($< 5\text{ mg}$ Diazepam) using scored 2 mg tablets and oral liquid solutions (1 mg/mL).
- **Comprehensive Diazepam Milligram Equivalence (DME) Matrix**:
  - Covers 12 benzodiazepines and non-benzodiazepine Z-drugs: Alprazolam, Clonazepam, Lorazepam, Diazepam, Temazepam, Chlordiazepoxide, Oxazepam, Clorazepate, Triazolam, Zolpidem (Ambien), Eszopiclone (Lunesta), and Zaleplon (Sonata).
  - Pharmacokinetic profiles detailing elimination half-life, onset, receptor affinity, interdose rebound risk, and stage-by-stage substitution steps.
- **FDA Black Box Warning & Flumazenil Contraindication Alert**:
  - Highlights the FDA 2020 Drug Safety Communication and updated Boxed Warning on abuse, misuse, addiction, physical dependence, and withdrawal reactions for the entire benzodiazepine class.
  - **CRITICAL LIFE SAFETY MANDATE: Flumazenil (Romazicon) is strictly CONTRAINDICATED in patients with chronic benzodiazepine tolerance or suspected polysubstance overdose.**
  - Educates that Flumazenil instantaneously strips GABA-A receptor occupancy, precipitating unstoppable, refractory status epilepticus (grand mal seizures) and death.
  - Contrasts Flumazenil with Naloxone: in suspected polysubstance depressant overdoses (opioid + benzodiazepine), **ALWAYS ADMINISTER NALOXONE TO RESTORE BREATHING, BUT NEVER GIVE FLUMAZENIL.**
- **Benzodiazepine-Induced Neurological Dysfunction (BIND) & Protracted Withdrawal**:
  - Formally validates BIND symptoms acknowledged in the FDA 2020 warning: tinnitus, sensory hyperacusis (sound/light sensitivity), paresthesias ("burning skin", electric shock sensations), fasciculations (muscle twitches), akathisia, depersonalization/derealization, gastrointestinal dysmotility ("benzo belly"), and morning cortisol awakening spikes.
  - Normalizes the "windows and waves" nonlinear neuro-recovery pattern, validating that symptoms represent physical receptor recalibration rather than permanent brain damage or psychiatric relapse.
  - Interactive BIND symptom validator providing neurobiological psychoeducation and coping strategies.
- **Evidence-Based Non-Controlled Adjunctive Comfort Medications & Drug Interactions**:
  - Reviews non-controlled supportive agents that do not act on GABA receptors: Propranolol (peripheral adrenergic autonomic tremor/tachycardia blockade), Melatonin (circadian reset), Hydroxyzine (non-scheduled H1 anxiolysis), and Trazodone (delta slow-wave sleep restoration).
  - Critical Drug Interaction Warning: **Fluoroquinolone antibiotics (Ciprofloxacin, Levofloxacin)** act as competitive GABA-A receptor antagonists and must be strictly avoided during tapering or recovery due to severe withdrawal flare and seizure risk.
- **Bilingual Clinician Discussion Brief Generator (Zero PII)**:
  - Generates comprehensive, respectful, plain-text proposals in English and Spanish for patients to present to their prescribers to negotiate safe, patient-controlled tapering schedules.
  - 1-click clipboard export with polite live ARIA status notifications.
- **In-RAM Ephemeral State & Export**:
  - Zero device storage (`localStorage`, `sessionStorage`, `document.cookie`).
  - Strict compliance with WCAG 2.2 AA accessibility and responsive design.


## 25. Wave 27 — ADHD, Neurodiversity, Counterfeit Pill FTS Protocols & Stimulant Pharmacotherapy Navigator

### Clinical, Behavioral & Pharmacological Objectives
- **ADHD & Substance Use Disorder (SUD) Clinical Consensus**:
  - Highlights that 25% to 30% of adults seeking SUD treatment meet criteria for ADHD, frequently remaining undiagnosed or untreated due to clinical stigma.
  - Deconstructs the "Self-Medication Hypothesis": unmanaged prefrontal dopamine ($D_1/D_2$) and norepinephrine hypofunction leads individuals to intuitive self-medication with street stimulants (methamphetamine, cocaine) or excessive caffeine to achieve cognitive focus and emotional calm.
  - Implements the ASAM/AAP clinical consensus: **Treating ADHD concurrently during addiction treatment reduces substance use relapse by 30% to 50% and dramatically improves treatment retention.**
  - Clarifies full compatibility with Medications for Opioid Use Disorder (MOUD): Buprenorphine, Methadone, and Naltrexone are fully compatible with ADHD pharmacotherapy under clinical monitoring.
- **Validated WHO Adult ADHD Self-Report Scale (ASRS v1.1 Part A)**:
  - Full 6-question clinical screener assessing executive dysfunction and inattention frequency over the preceding 6 months.
  - Implements validated threshold scoring (Q1-Q3 significant at $\ge 2$; Q4-Q6 significant at $\ge 3$); scoring $\ge 4$ significant symptoms establishes a high-probability clinical cutoff for adult ADHD.
- **Three-Tier Medication Selection Framework in Active / Remission SUD**:
  - *Tier 1: Non-Controlled Non-Stimulants (Zero Abuse Liability)*:
    - Atomoxetine (Strattera - selective NRI, 40–100 mg/day, zero euphoria, 24-hour coverage).
    - Viloxazine ER (Qelbree - selective serotonin-norepinephrine modulator, 200–600 mg/day).
    - Guanfacine ER (Intuniv - selective alpha-2A agonist, strengthens prefrontal networks, alleviates rejection sensitivity and autonomic hyperarousal).
    - Clonidine ER (Kapvay - alpha-2 adrenergic agonist).
    - Bupropion XL (Wellbutrin - dual NDRI; contraindication reminder for seizure threshold).
  - *Tier 2: Tamper-Resistant Prodrugs & Long-Acting Stimulants (Low Misuse Potential)*:
    - Lisdexamfetamine (Vyvanse - red blood cell enzymatic cleavage prodrug; resist snorting/injection euphoria).
    - OROS Methylphenidate (Concerta - laser-drilled osmotic delivery system resisting crushing).
  - *Tier 3 / High-Risk: Immediate-Release Stimulants (AVOID in Early Recovery)*:
    - Adderall IR, Ritalin IR (steep ventral striatum dopamine spikes, binge-crash patterns, and diversion risk).
- **DEA Counterfeit Prescription Pill Alert & FTS Testing Protocols**:
  - DEA Public Safety Alert: over 7 out of 10 fake prescription pills seized contain potentially lethal fentanyl or nitazenes.
  - Counterfeit orange/peach "Adderall" pills (stamped "d 30", "dp 30") bought from street markets or social media almost universally contain illicit fentanyl or high-purity methamphetamine.
  - Exact pill testing dilution protocol: crush tablet completely (preventing "chocolate chip cookie" hot spots) and dissolve each 10 mg of pill mass in at least 1 teaspoon (5 mL) of clean water to eliminate false positives from binders/methamphetamine.
  - Universal Naloxone access mandate for stimulant and pill users.
- **Cardiovascular Emergency Triggers**:
  - Hypertensive crisis, angina/crushing chest pressure, malignant hyperthermia ($> 103^\circ\text{F}$), and stimulant-induced psychosis -> immediate 911 emergency escalation.
- **Neurodivergent Recovery & Executive Function Toolkit**:
  - Time-blindness aids, "body doubling" co-working strategies, the "5-minute dopamine micro-step" for initiation paralysis, sensory overload decompression, and meeting accommodations.
- **Bilingual Clinician Discussion Brief Generator (Zero PII)**:
  - Generates structured, respectful, plain-text proposals in English and Spanish for patients to present to their prescribers to negotiate safe, non-stimulant ADHD evaluations without fear of discriminatory "drug-seeking" labels.
- **In-RAM Ephemeral State & Export**:
  - Zero device storage (`localStorage`, `sessionStorage`, `document.cookie`).
  - Strict compliance with WCAG 2.2 AA accessibility and responsive design.


## 26. Wave 28 — Acute Toxicology Triage, Project BETA Verbal De-Escalation, Restraint Avoidance & SBAR Clinical Handoff

### Clinical, Behavioral & Pharmacological Objectives
- **Multi-Toxidrome Differential Engine (5 Conditions)**:
  - Expands acute clinical differential diagnosis to 5 life-threatening toxicological and psychiatric crises:
    1. *Opioid & Alpha-2 Adrenergic (Xylazine / Medetomidine) Toxicity*: Distinguishes opioid-induced mu-receptor respiratory depression from central alpha-2 adrenergic refractory sedation and bradycardia; guides rescue breathing and clarifies why naloxone does not reverse alpha-2 sedation.
    2. *Stimulant Overamping (Physical Malignant vs Psychological Panic)*: Distinguishes life-threatening malignant hyperthermia (> 104°F / 40°C), crushing chest pain, active seizures, and rhabdomyolysis from distressing, self-limiting psychological overamping (paranoia, hypervigilance, racing thoughts).
    3. *Serotonin Toxicity / Syndrome (Hunter Criteria with Clonus)*: Implements Dunkley et al.'s Hunter Serotonin Toxicity Criteria (84% sensitivity, 97% specificity) establishing clonus (spontaneous, inducible, or ocular roving clonus) as the hallmark distinguishing serotonin toxicity from pure sympathomimetic toxicity and NMS.
    4. *Soft Tissue Sepsis, Severe Necrotic Ulcers & Endocarditis*: Triages severe pain out of proportion (necrotizing fasciitis surgical emergency), septic shock (hypotension, mottled skin, confusion), bacteremic violent shaking chills (rigors), and necrotic xylazine ulcers.
    5. *Acute Substance-Induced Agitation, Delirium & Psychosis*: Evaluates acute behavioral agitation, persecutory paranoia, tactile hallucinations ("formication"), and disorientation across sympathomimetic, anticholinergic, dissociative (PCP/ketamine), and sedative/alcohol withdrawal delirium etiologies.
- **Dual Mode Switcher (Clinician / Healthcare Worker Mode vs Patient / Bystander Mode)**:
  - *Clinician / Healthcare Worker Mode*: Tailored for ED physicians, triage nurses, EMTs, street medicine clinicians, and crisis response teams; features formal RASS agitation scoring, Hunter criteria diagnostic rules, receptor mechanisms, pharmacokinetics, EMTALA federal mandates (42 U.S.C. § 1395dd), and 1-click exportable SBAR clinical handoff notes.
  - *Patient / Bystander Mode*: Tailored for families, friends, and community bystanders; provides plain-language warning signs, crisis calming steps, compassionate grounding, emergency low-conflict 911 dispatch scripts, and tranq rescue breathing instructions.
- **Richmond Agitation-Sedation Scale (RASS) Bedside Integration**:
  - Full 10-tier bedside scale from +4 (Combative, violent, immediate danger) down to -5 (Unarousable, deep coma).
  - Dynamically links RASS scores to clinical intervention urgency (RASS >= +3 triggers high-acuity de-escalation; RASS <= -3 triggers opioid/tranq respiratory depression protocols).
- **American Association for Emergency Psychiatry (AAEP) Project BETA 10-Domain Verbal De-Escalation Consensus**:
  - Encapsulates the landmark consensus (Richmond et al., 2012) across all 10 evidence-based verbal de-escalation domains:
    1. *Respect Personal Space*: Maintain at least 2 arm's lengths (6 feet) distance; keep exit paths clear; never corner the patient.
    2. *Do Not Be Provocative*: Keep hands open and visible at waist level; avoid defensive, closed, or staring posture.
    3. *Establish Verbal Contact*: Designate ONE speaker to avoid sensory and cognitive overload.
    4. *Be Concise & Use Simple Language*: Short, calm sentences repeating core reassurances.
    5. *Identify Wants & Feelings*: Validate emotional distress without disputing delusional reality.
    6. *Listen Closely (Active Listening)*: Paraphrase concerns to drop sympathetic fight-or-flight output.
    7. *Agree or Agree to Disagree*: Never argue against hallucinations or persecutory delusions.
    8. *Set Clear, Safe Boundaries*: Establish non-punitive external boundaries calmly.
    9. *Offer Choices & Genuine Optimism*: Restore patient autonomy (seating choices, water, oral calming medications).
    10. *Debrief Patient & Care Team*: Post-crisis reflection to identify future triggers and support staff.
- **Calming Pharmacotherapy Matrix & Restraint Avoidance Mandate**:
  - *Restraint Avoidance Consensus*: Physical restraints are strictly contraindicated for substance-induced agitation unless immediate lethal violence is occurring and all verbal/pharmacologic options failed; isometric struggling against physical restraints in hyperadrenergic states is the primary cause of fatal rhabdomyolysis, severe hyperthermia, and cardiac arrest.
  - *Tier 1: Oral Non-Coercive Second-Generation Antipsychotics (SGAs) - Preferred First-Line*:
    - Olanzapine Zydis (ODT, 5–10 mg PO/sublingual): Rapid onset (15–30 min), low EPS, excellent calming.
    - Risperidone M-Tab (ODT, 1–2 mg PO/sublingual): Targeted calming for paranoid agitation.
    - Quetiapine (25–50 mg PO): Gentle, respectful calming for anxiety and mild agitation.
  - *Tier 2: Oral / Sublingual Benzodiazepines (Sympathomimetic & Withdrawal)*:
    - Lorazepam (Ativan, 1–2 mg SL/PO): Drug of choice for pure sympathomimetic overamping, hyperthermia, seizures, or alcohol/benzo withdrawal agitation.
    - Diazepam (Valium, 5–10 mg PO): Long-acting coverage for protracted withdrawal.
  - *Tier 3: Emergency Parenteral Regimens (Hospital Setting - Absolute Last Resort)*:
    - Haloperidol 5 mg IM + Lorazepam 2 mg IM + Diphenhydramine 50 mg IM ("B52" protocol).
    - Ketamine (3–4 mg/kg IM): Reserved for severe excited delirium with extreme hyperthermia under continuous pulse oximetry.
- **1-Click Clinical SBAR Handoff Note Generator (Zero PII)**:
  - Formats structured Situation, Background, Assessment (differential ranking + RASS score + Hunter criteria), and Recommendation sections ready for clipboard export with Zero PII.
- **1-Click Bystander 911 Dispatch Script Generator (Zero PII)**:
  - Formats a calm, low-conflict script requesting emergency medical paramedics and a Crisis Intervention Team (CIT) while reassuring dispatch of non-violent posture to minimize police confrontation risks.
- **In-RAM Ephemeral State & Export**:
  - Zero device storage (`localStorage`, `sessionStorage`, `document.cookie`).
  - Strict compliance with WCAG 2.2 AA accessibility and responsive design.


## 27. Wave 29 — Inpatient Addiction Medicine, Acute Hospital Care, Pain on MOUD & Patient-Directed Discharge ("AMA") Navigator

### Clinical, Behavioral & Pharmacological Objectives
- **CA Bridge High-Dose Emergency & Inpatient Buprenorphine Rapid Induction Protocol**:
  - Implements the landmark CA Bridge protocol (Herring et al., 2021) for acute hospital and emergency settings:
    - Step 1: Objective withdrawal confirmation (COWS >= 8).
    - Step 2: Immediate 8 mg sublingual test dose (held 10 min under tongue without swallowing).
    - Step 3: Reassessment at 45–60 minutes: if withdrawal persists, immediately administer second 8 mg or 16 mg dose.
    - Step 4: High-dose consolidation reaching 16 mg to 24 mg (up to 32 mg/day) on Day 1.
    - Pathophysiology: Fentanyl's lipophilic volume of distribution causes prolonged clearance; high-dose buprenorphine rapidly achieves > 80% mu-receptor occupancy, suppressing cravings and preventing precipitated withdrawal rebound.
- **Precipitated Opioid Withdrawal Recognition & Rescue Protocol**:
  - Definition: Rapid displacement of full agonists by buprenorphine causing severe acute withdrawal within 30–60 minutes.
  - Core Mandate: Never abandon the patient; leaving them without relief leads to hospital flight and fatal overdose.
  - Three-tier rescue strategy:
    1. High-Dose Buprenorphine Override (preferred first-line: additional 8–16 mg SL every 45–60 min up to 32 mg total to saturate receptors).
    2. Full-Agonist Opioid Rescue (monitored inpatient setting: IV hydromorphone or fentanyl under continuous pulse oximetry).
    3. Multimodal Comfort Medication Bundle (clonidine, ondansetron, loperamide, ketorolac/ibuprofen, lorazepam).
- **Inpatient Acute Pain & Surgical Analgesia in Patients on MOUD**:
  - ASAM / ACOG / American Pain Society consensus: **NEVER STOP BUPRENORPHINE OR METHADONE FOR ACUTE PAIN OR SURGERY.**
  - Buprenorphine split-dosing: Divide total daily dose into every 6 to 8 hours (q6–8h) to recruit its 6-to-8-hour analgesic duration.
  - Titrating full-agonist opioids: Add short-acting full agonists (hydromorphone, oxycodone, fentanyl) titrated to higher required doses due to tolerance and receptor occupancy.
  - Methadone inpatient verification: Confirm daily dose with OTP and maintain once daily; treat surgical pain with short-acting full agonists.
  - Contraindicated analgesics: Mixed agonist-antagonists (nalbuphine [Nubain], butorphanol [Stadol], pentazocine) strictly avoided due to violent precipitated withdrawal; tramadol avoided due to seizure risk and erratic metabolism.
- **Patient-Directed Discharge ("AMA") Harm Reduction & Rights Consensus**:
  - **Debunking the Destructive Insurance Billing Myth**:
    - Over 65% of clinicians and patients mistakenly believe insurers deny hospital payment if a patient leaves AMA.
    - Landmark evidence (Schaefer et al., *J Gen Intern Med*; Alfandre et al., *Ann Intern Med*): **0% of insurance claims are denied solely due to leaving against medical advice.** Insurers pay for all medically necessary care delivered prior to departure.
  - **Harm Reduction "Discharge with Dignity" Care Bundle**:
    1. *Oral Step-Down Antibiotic Therapy*: If a patient with bacteremia, endocarditis, osteomyelitis, or abscess cannot stay for 4–6 weeks of IV antibiotics, prescribe oral step-down regimens (Linezolid 600 mg bid, Cefpodoxime, or single-dose Dalbavancin 1500 mg IV prior to departure). Partial antibiotic therapy is vastly superior to zero treatment.
    2. *7-to-14-Day Bridge MOUD Prescription*: Provide bridge buprenorphine prescription to prevent acute withdrawal and fatal overdose.
    3. *Naloxone & Sterile Supplies*: Dispense two doses of naloxone nasal spray (Narcan 4 mg) and sterile wound care supplies.
    4. *Unconditional Open-Door Reassurance*: Explicitly tell the patient that hospital doors remain open without penalty if they need to return.
- **Federal EMTALA (42 U.S.C. § 1395dd) & Patient Rights in the Hospital**:
  - Federal legal entitlement to Medical Screening Examination (MSE) and stabilizing treatment regardless of ability to pay or substance use.
  - Strict confidentiality under HIPAA and 42 CFR Part 2 (hospital staff prohibited from reporting drug use to law enforcement).
  - Legal right to receive evidence-based withdrawal and pain management as a medical emergency.
- **Inpatient Addiction Consult SBAR Clinical Note Generator (Zero PII)**:
  - Formats structured Situation, Background, Assessment (MOUD status, infection, COWS score, AMA risk), and Recommendation sections ready for EHR documentation or warm handoff with Zero PII.
- **In-RAM Ephemeral State & Export**:
  - Zero device storage (`localStorage`, `sessionStorage`, `document.cookie`).
  - Strict compliance with WCAG 2.2 AA accessibility and responsive design.




## 28. Wave 30 — Needle Stick, Sharps Injury & Bloodborne Pathogen Post-Exposure Prophylaxis (PEP) Navigator

### Clinical, Behavioral & Pharmacological Objectives
- **CDC / USPHS Antiretroviral Post-Exposure Prophylaxis (PEP) Protocols (oPEP & nPEP)**:
  - Implements CDC / USPHS Guidelines for Occupational Exposures to HIV and Recommendations for Postexposure Prophylaxis (Kuhar et al., Updated) and Nonoccupational PEP (nPEP):
    - **72-Hour Golden Window**: PEP must be initiated immediately (< 2 hours ideal window, up to 72 hours maximum post-exposure). Beyond 72 hours, animal and human trials show no preventive benefit.
    - **Full 28-Day Regimen**: Unbroken once-daily adherence for 28 consecutive days is required to abort viral replication and eliminate cellular reservoirs.
    - **Preferred Regimen (1-Pill Once Daily)**: Biktarvy (Bictegravir 50 mg / Emtricitabine 200 mg / Tenofovir Alafenamide 25 mg) once daily PO with or without food. Favorable bone/renal safety profile via TAF.
    - **Alternative Regimen**: Tivicay (Dolutegravir 50 mg) once daily + Truvada (TDF 300 mg / FTC 200 mg) once daily.
    - **Immediate Starter Pack Strategy**: Emergency departments and urgent care clinics dispense a 3-to-7-day starter pack immediately on site with rapid follow-up arranged within 72 hours.
- **Hepatitis B Post-Exposure Management (CDC MMWR)**:
  - Titer-based risk stratification:
    - *Vaccinated Responder (anti-HBs >= 10 mIU/mL)*: Fully protected; no treatment or HBIG needed.
    - *Vaccinated Non-Responder (2 completed series, anti-HBs < 10 mIU/mL)*: Administer Hepatitis B Immune Globulin (HBIG 0.06 mL/kg IM) immediately (< 24 hours) + repeat second dose in 1 month.
    - *Vaccinated, Response Unknown*: Draw anti-HBs immediately + administer 1 vaccine booster dose. If source confirmed HBsAg-positive, administer HBIG.
    - *Unvaccinated*: Administer HBIG (0.06 mL/kg IM) immediately (< 24 hours) + initiate standard 3-dose Hepatitis B vaccine series.
- **Hepatitis C (HCV) Management Post-Exposure**:
  - Crucial clinical rule: Prophylactic antivirals, immunoglobulins, and corticosteroids are **NOT recommended for HCV post-exposure prophylaxis**.
  - Protocol: Baseline anti-HCV and HCV RNA; follow-up HCV RNA at 4–6 weeks post-exposure (detects acute viremia). If positive, initiate direct-acting antivirals (DAAs, e.g. Epclusa or Mavyret), which achieve > 98% cure rates.
- **Tetanus Toxoid Prophylaxis**:
  - Clean minor wound: Td/Tdap booster if > 10 years since last dose.
  - Contaminated/deep wound or outdoor discarded sharps: Tdap booster if > 5 years since last dose. If < 3 lifetime doses, administer Tdap + Tetanus Immune Globulin (TIG 250 units IM).
- **Immediate Decontamination & Banned Harmful Actions**:
  - Mechanical washing with soap and running water for >= 30–60 seconds; 15-minute continuous eye flush for mucous splashes.
  - Strict Contraindications: **DO NOT squeeze, press, or "milk" the wound** (suctions viral particles deeper into capillaries); **DO NOT pour caustic chemicals (bleach, iodine, alcohol)** (causes chemical tissue necrosis); **DO NOT suck wound by mouth** (introduces oral bacteria).
- **OSHA Bloodborne Pathogens Standard (29 CFR § 1910.1030) Worker Rights**:
  - 100% employer-paid confidential medical evaluation, laboratory testing, and 28-day PEP medications at **zero financial cost to the employee** (no copays, no deductibles).
  - Absolute legal protection against retaliation, discipline, or demotion under OSH Act Section 11(c).
  - Mandatory Sharps Injury Log documentation to isolate defective safety devices.
- **Community Needle Safety & Parental Panic De-escalation**:
  - Epidemiological reality: Global health tracking of thousands of accidental community needle sticks shows **0 confirmed cases of HIV seroconversion**. Ambient sunlight and rapid evaporation inactivate HIV within hours. HBV is the only hardy virus, and HBV immunization neutralizes risk.
  - 5-step safe syringe pickup protocol into rigid heavy-duty containers (detergent bottles), sealed with duct tape and labeled "SHARPS - DO NOT RECYCLE".
- **Zero-PII Exposure SBAR Generator**:
  - Instant clipboard export of structured Situation, Background, Assessment, and Recommendation notes for Emergency Department triage and Employee Health handoffs.




## 29. Wave 31 — Sexual Health, STI Post-Exposure Prophylaxis (Doxy-PEP), HIV PrEP Navigation & Emergency Contraception

### Clinical, Behavioral & Pharmacological Objectives
- **CDC 2024 Doxycycline Post-Exposure Prophylaxis (Doxy-PEP) Guidelines**:
  - Implements the CDC 2024 clinical guidelines for bacterial STI post-exposure prophylaxis:
    - Regimen: Doxycycline 200 mg orally as a single dose, taken as soon as possible within 72 hours of condomless sex (max 200 mg per 24 hours).
    - Esophagitis Prevention: Must be taken with a full 8 oz (240 mL) glass of water and remain upright for at least 30 minutes to prevent chemical esophageal ulceration.
    - Pathogen Efficacy: Syphilis (~70%–87% risk reduction), Chlamydia (~70%–88% reduction), Gonorrhea (~50%–55% reduction).
    - Black-Box Education: Explicitly clarifies that Doxy-PEP has **ZERO activity against viral STIs** (HIV, HSV, HPV, Hepatitis B/C, Mpox).
- **Comprehensive HIV PrEP Modalities & PEP-to-PrEP Continuity**:
  - Stratifies all modern PrEP modalities:
    - *Daily Oral Truvada (TDF/FTC)*: Approved for all populations (anal sex, vaginal sex, injection drug use).
    - *Daily Oral Descovy (TAF/FTC)*: Favorable bone/renal safety profile; approved for sexual exposure EXCEPT receptive vaginal sex (due to lack of cisgender female data).
    - *Long-Acting Injectable Apretude (Cabotegravir 600 mg IM)*: Gluteal injection every 2 months; ideal for adherence barriers; requires bi-monthly HIV RNA testing.
    - *Event-Driven "2-1-1" PrEP (Truvada Only)*: For cisgender MSM with planned, infrequent sex (2 pills 2–24h before sex, 1 pill 24h later, 1 pill 48h later).
    - *Seamless PEP-to-PrEP Transition*: Mandates Day 28 HIV testing and immediate PrEP initiation with **zero unmedicated lapse days** to maintain protective tissue saturation.
- **Emergency Contraception (EC) Timing & Weight Threshold Matrix (ACOG Practice Bulletin No. 152)**:
  - Clinical decision tree based on hours elapsed (0–72h vs 72–120h) and patient body weight:
    - *Levonorgestrel 1.5 mg (Plan B One-Step)*: OTC access, effective up to 72 hours; **steep weight limitation** (reduced efficacy at >= 165 lbs / 75 kg, ineffective at >= 175 lbs / 80 kg or BMI >= 30).
    - *Ulipristal Acetate 30 mg (Ella)*: Prescription required, effective up to 120 hours (5 days) with consistent efficacy across all 5 days; superior weight ceiling maintaining efficacy up to 195 lbs (88 kg) or BMI <= 35.
    - *Copper IUD / 52 mg LNG IUD*: Gold standard emergency contraception (> 99.9% effective) placed within 120 hours; **zero weight restrictions**; provides 8–12 years of ongoing reversible contraception.
- **Barrier & Lubricant Chemical Harm Reduction**:
  - Critical warning: Oil-based lubricants (vaseline, mineral oil, baby oil, coconut oil, lotion) dissolve and rupture latex condoms within 60 seconds.
  - Safe alternatives: Water-based or pure silicone-based lubricants with latex; polyurethane/polyisoprene for latex allergies; internal condoms (FC2 nitrile) compatible with all lubricants and insertable up to 8 hours prior.
- **Zero-PII Sexual Health Consultation & SBAR Note Generator**:
  - Instant clipboard export of structured Situation, Background, Assessment, and Recommendation notes for urgent care, telehealth, or primary care consultations.

### 30. Wave 32: Novel Psychoactive Substances, Kratom, Tianeptine & Emerging OTC Misuse Navigator (`#/novel-substances`)
- **Tianeptine ("Gas Station Heroin", ZaZa, Tianaa, Pegasus, TD Red)**:
  - Clinical consensus: ACMT, ASAM, and FDA Public Health Alerts.
  - Pharmacology: Atypical tricyclic antidepressant operating as a full mu-opioid receptor agonist and glutamatergic modulator at supra-therapeutic doses (1,000–5,000+ mg/day vs 37.5 mg therapeutic).
  - Cardiotoxicity Hazard: Severe cardiac potassium (hERG) and sodium channel blockade causing profound QTc prolongation (> 500 ms), Torsades de Pointes, and ventricular arrhythmias.
  - Urine Drug Screen Blindspot: 100% negative on standard hospital 5-to-12 panel urine immunoassay drug cups; requires send-out LC-MS/MS.
  - Clinical Treatment: CA Bridge rapid high-dose buprenorphine induction once COWS >= 8; continuous ECG telemetry; IV magnesium sulfate (2 g) for ventricular arrhythmias.
- **Kratom Alkaloids & Concentrated 7-Hydroxymitragynine (7-OH)**:
  - Mitragyna speciosa leaves contain mitragynine (partial mu-agonist, alpha-2 adrenergic agonist) and 7-hydroxymitragynine (7-OH, isolated semi-synthetic alkaloid up to 13-fold more potent than morphine).
  - Urine Drug Screen Reality: Routine hospital immunoassay cups are 100% negative for kratom/7-OH; requires dedicated mitragynine panel.
  - Clinical Management: ASAM Clinical Guidelines support buprenorphine induction for moderate-to-severe kratom use disorder; comfort medications (clonidine, gabapentin).
- **Phenibut & Fluorophenibut (GABA-B Receptor Agonists)**:
  - Pharmacology: Synthetic GABA derivative crossing blood-brain barrier; high-affinity agonist at GABAB receptors and alpha-2-delta VGCC blocker.
  - Life-Threatening Withdrawal: Mimics severe Delirium Tremens or GHB withdrawal (visual/auditory hallucinations, acute delirium, psychosis, autonomic tremors, status epilepticus).
  - Baclofen Substitution Protocol: 10 mg oral baclofen roughly bio-equivalent to 1,000 mg oral phenibut; cross-titration over 3–5 days, stabilization, and gradual taper over 2–4 weeks; ICU benzodiazepines for acute delirium.
- **ZaZa Silver Dual-Dependence Hazard**:
  - Co-formulates tianeptine (opioid) PLUS phenibut (GABA-B agonist).
  - Abrupt cessation causes simultaneous severe opioid withdrawal and life-threatening GABAergic delirium/seizures.
  - Dual Protocol: Concurrent buprenorphine induction AND baclofen cross-titration.
- **High-Dose Loperamide Megadosing ("Poor Man's Methadone")**:
  - Megadoses (50–300+ mg/day vs 16 mg therapeutic) saturate intestinal P-glycoprotein efflux pumps, crossing blood-brain barrier.
  - Severe hERG potassium channel (IKr) blockade causing massive QTc prolongation (> 600 ms), QRS widening, Torsades de Pointes, and cardiac arrest.
  - Emergency Management: Continuous telemetry, IV Magnesium Sulfate (2 g IV over 15 min), isoproterenol/pacing, avoidance of QTc-prolonging antiarrhythmics, monitored buprenorphine transition.
- **DXM & Diphenhydramine (DPH) Overuse**:
  - NMDA receptor antagonism, serotonin syndrome risk with antidepressants, anticholinergic toxidrome.
  - False positive urine screens: DXM triggers false positives for PCP and opioids; DPH triggers false positives for TCAs and methadone.
- **Immunoassay Blindspot Matrix**:
  - Educational table comparing standard UDS results, clinical realities, and required confirmatory testing to prevent withholding care or misdiagnosing patients as malingering.
- **Zero-PII SBAR Clinical Handoff Generator**:
  - 1-click clipboard export in English and Spanish for Emergency Department triage, inpatient addiction consultation, and primary care.

### 31. Wave 33: Gabapentinoid Misuse, Respiratory Depression Synergy & Deprescribing Navigator (`#/gabapentinoid-care`)
- **Comparative Pharmacology: Gabapentin (Neurontin) vs. Pregabalin (Lyrica)**:
  - Gabapentin: Saturable L-amino acid transporter (LAT1) absorption; non-linear bioavailability drops sharply from ~60% at 300 mg to < 27% at 4,800 mg/day; short half-life (5–7 hours) requiring TID dosing.
  - Pregabalin: Linear, rapid absorption throughout GI tract (> 90% bioavailability across all doses); ~6-fold higher binding affinity at alpha-2-delta subunits; higher euphoric reinforcement; Schedule V controlled substance.
- **FDA 2019 Drug Safety Communication & Synergistic Respiratory Arrest**:
  - Opioids suppress hypoxic ventilatory drive; gabapentinoids independently blunt hypercapnic ventilatory compensation and upper airway muscle tone.
  - Presence in 20% to 30% of all fatal opioid overdoses; co-prescription increases overdose mortality risk by 49% to 60%.
  - High-risk cohorts: Concurrent opioids, COPD/asthma, Obstructive Sleep Apnea (OSA), age >= 65, and sedative co-ingestion (benzodiazepines, alcohol, Z-drugs).
  - Immediate Take-Home Naloxone co-prescription protocol.
- **Gabapentinoid Withdrawal Syndrome (GWS) Triad**:
  - *Autonomic Dysregulation*: Profuse diaphoresis, tachycardia, flushing, labile blood pressure, nausea, loose stools.
  - *Neurological & Sensory*: Severe tactile paresthesias ("crawling skin"), akathisia, intention tremors, myoclonic jerks, and seizure risk / status epilepticus after abrupt cessation.
  - *Psychological*: Severe panic, terror, rebound generalized anxiety, dysphoria, depersonalization, and intractable multi-night insomnia.
- **Horowitz & Taylor Hyperbolic Deprescribing Protocol**:
  - Addresses the non-linear hyperbolic receptor occupancy curve: linear milligram reductions cause catastrophic receptor occupancy drops at low doses.
  - Speed tiers: Conservative (10% drop of previous dose every 3–4 weeks), Standard (15% drop every 2–3 weeks), Accelerated (20%–25% weekly inpatient).
  - Mandatory commercial oral liquid solution transition (Gabapentin 250 mg/5 mL; Pregabalin 20 mg/mL) for the final sensitive tail below 300 mg / 50 mg.
- **Cockcroft-Gault Renal Creatinine Clearance (CrCl) Dosing & Neurotoxicity Calculator**:
  - Gabapentinoids are eliminated 100% unchanged in urine; age-related decline in CrCl causes massive drug accumulation, leading to asterixis, myoclonus, ataxia, falls, and toxic encephalopathy.
  - Real-time CrCl calculation and renal dose ceiling adjustments (CrCl >= 60, 30–59, 15–29, < 15 mL/min and hemodialysis).
- **Zero-PII Clinical SBAR Note Generator**:
  - 1-click clipboard export in English and Spanish for Primary Care, Pain Specialists, Neurology, and Emergency Department handoffs.

### 32. Wave 34: Psychedelic Harm Reduction, 5-HT2A Pharmacology, Crisis De-Escalation & HPPD Navigator (`#/psychedelic-care`)
- **5-HT2A Pharmacology & Substance Duration Profiles**:
  - *Psilocybin / Psilocin*: Prodrug dephosphorylated to psilocin; 5-HT2A partial agonist; temporary disintegration of default mode network (DMN); 4–6 hour duration.
  - *LSD (Lysergic Acid Diethylamide)*: 5-HT2A agonist with molecular "lid" trapping compound in receptor pocket; microgram potency (25–100+ mcg); protracted 8–14 hour duration.
  - *DMT & 5-MeO-DMT*: Short-acting tryptamines (15–30 min inhaled). 5-MeO-DMT induces profound non-visual ego dissolution with transient apnea risk requiring physical supervision.
  - *Mescaline & 2C-B*: Phenethylamines with steep non-linear dose-response curves (e.g. 2C-B: 25 mg vastly stronger than 18 mg).
- **Toxic Adulterant Alert & 25I-NBOMe Identification ("Bitter Blotter")**:
  - Synthetic high-potency full 5-HT2A agonists sold on blotters disguised as LSD.
  - Hallmark warning: Intense chemical, metallic, bitter numbing taste ("If it's bitter, it's a spitter").
  - Severe peripheral vasoconstriction (cyanosis, necrosis), hyperpyrexia, rhabdomyolysis, and fatal seizures at microgram doses; negative on Ehrlich reagent.
- **Dangerous Pharmacological Contraindications**:
  - *Lithium + Psychedelics*: Fatal contraindication. Literature documents near-100% incidence of grand mal seizures, non-convulsive status epilepticus, severe fugue states, coma, and cardiac arrest.
  - *MAOIs (Ayahuasca Harmala Alkaloids) + SSRIs/SNRIs/MDMA/Tramadol/DXM*: Catastrophic hyperpyrexic Serotonin Syndrome and hypertensive crisis; requires 2–5 week washout period.
  - *SSRIs/SNRIs + Classical Psychedelics*: 5-HT2A downregulation causes blunted visual/mystical effects; risk of dangerous dose escalation.
  - *Tramadol / Bupropion + Psychedelics*: Severe lowering of seizure threshold.
- **Fireside Project & Zendo Project 4 Pillars of Compassionate Crisis Support**:
  - *Pillar 1: Create a safe, quiet space* (remove noise, crowds, police; provide dim lighting, warm blanket).
  - *Pillar 2: Sitting, not guiding* (be a calm anchor, eye-level posture, slow rhythmic breathing).
  - *Pillar 3: Talk through, not down* (validate experience, reassure that effects are chemical and temporary).
  - *Pillar 4: Difficult is not necessarily bad* (cathartic reframing of grief or repressed emotion).
  - 62-FIRESIDE Peer Support Integration (Call/Text 623-473-7433).
- **5-4-3-2-1 Sensory Grounding Tool & Restraint Reduction**:
  - Step-by-step sensory grounding sequence for acute panic and ego dissolution.
  - Restraint Warning: Physical restraints trigger violent panic-induced resistance, rhabdomyolysis, hyperthermia, and cardiac arrest. Haloperidol is contraindicated due to lowering seizure thresholds.
- **Hallucinogen Persisting Perception Disorder (HPPD) Neuro-Ophthalmology Framework**:
  - DSM-5 292.89 diagnostic criteria.
  - HPPD Type 1 (benign flashbacks) vs Type 2 (persistent visual snow, trailing/palinopsia, halos).
  - Cardinal Reassurances: HPPD is NOT progressive psychosis, NOT schizophrenia, NOT brain damage (normal MRI).
  - Trigger cessation (cannabis is #1 trigger), lamotrigine/clonazepam under psychiatric care, CBT for hyper-focus anxiety.
- **Zero-PII SBAR Clinical Handoff & Dispatch Note Generator**:
  - 1-click clipboard export in English and Spanish for Emergency Department triage, festival medical teams, or crisis intervention responders.

### 33. Wave 35: GHB, GBL & 1,4-BDO Harm Reduction, Coma Triage & Severe Withdrawal Navigator (`#/ghb-care`)
- **Substance Science & Comparative Kinetics**:
  - *GHB (Gamma-Hydroxybutyrate / Sodium Oxybate)*: Full agonist at inhibitory GABA-B and excitatory GHB receptors; steep, non-linear dose-response curve (1.0–1.5 g euphoria, 2.0–2.5 g heavy sedation, > 3.0 g coma). Rapid half-life of 30–50 minutes.
  - *GBL (Gamma-Butyrolactone)*: Highly lipophilic chemical prodrug converted into GHB within 60 seconds by serum lactonase; ~2x potency by volume (1 mL GBL equates to ~1.6–2.0 g GHB); acrid chemical taste, corrosive to plastics.
  - *1,4-BDO (1,4-Butanediol) & The Alcohol Dehydrogenase (ADH) Metabolic Trap*: Metabolized to GHB by ADH. Ethanol has a higher binding affinity for ADH than 1,4-BDO, completely blocking its breakdown. Once alcohol clears hours later, accumulated BDO is rapidly metabolized all at once, triggering sudden delayed catastrophic coma and respiratory arrest hours after alcohol consumption.
- **Coma ("G-Out") Airway Triage & Lateral Recovery Position**:
  - Airway collapse danger: GHB paralyzes upper airway muscle tone and protective laryngeal gag reflexes; snoring or gurgling indicates upper airway obstruction and impending asphyxiation.
  - Step-by-step lateral recovery position guide to prevent fatal vomit aspiration.
  - Emergency 911 triggers: Respiratory rate < 8 breaths/min, cyanosis, vomiting while unconscious, co-ingested alcohol or sedatives.
- **GHB Withdrawal Syndrome (GWS) Staging**:
  - *Stage 1: Mild Early Withdrawal (1–4 hours)*: Severe anxiety, insomnia, tremor, tachycardia (rapid onset due to short half-life).
  - *Stage 2: Moderate Autonomic Hyperactivity (4–12 hours)*: Tachycardia (> 110–130 bpm), hypertension, nausea, marked agitation, early perceptual distortions.
  - *Stage 3: Severe Delirium, Psychosis & Status Epilepticus (12–72+ hours)*: Life-threatening paranoid delirium, vivid hallucinations, hyperpyrexia (> 102°F / 39°C), rhabdomyolysis, seizures, and cardiovascular collapse.
- **Evidence-Based Clinical Pharmacotherapy (BAP & Dutch National Guidelines)**:
  - *Baclofen Protocol (GABA-B Specific Substitution)*: 10 mg PO TID titrated up to 15–20 mg TID. Directly substitutes at the depleted GABA-B receptor site, preventing delirium and cutting benzodiazepine requirements by > 75%.
  - *Diazepam Sedation Protocol*: Symptom-triggered loading (10–20 mg PO/IV every 1–2 hours).
  - *Phenobarbital / ICU Escalation*: For benzodiazepine-refractory agitation or status epilepticus.
  - *Black-Box Contraindication*: Outpatient "cold turkey" cessation is strictly contraindicated in round-the-clock users; requires inpatient medical stabilization.
- **Community, Nightlife & Chemsex Harm Reduction Rules**:
  - Rule 1: Exact 0.1 mL oral syringe measurement only (never dose from bottle caps or drinking cups).
  - Rule 2: Mandatory smartphone dosing timers (minimum 2–3 hours between doses; prevents anterograde amnesia dose stacking).
  - Rule 3: Food coloring dye mandate (dye liquid blue or red to prevent accidental ingestion of clear liquid).
  - Rule 4: Absolute prohibition on alcohol, ketamine, benzodiazepines, and opioids.
- **Zero-PII SBAR Clinical Handoff Generator**:
  - 1-click clipboard export in English and Spanish for Emergency Department triage, ICU transfer, or addiction consultation.

### 34. Wave 36: Vein Care, Vascular Health, Arterial Puncture Triage & Safer Injection Anatomy Navigator (`#/vein-care`)
- **Anatomical Injection Risk Stratification (Green, Yellow & Red Zones)**:
  - *Green Zone (Safer)*: Forearm & inside elbow (cephalic, basilic, median cubital veins). Superficial, prominent, robust valves, high blood flow velocity, separated from deep arteries by muscular fascial planes.
  - *Yellow Zone (Caution - Fragility & Sclerosis)*: Dorsum of hands and wrists. Thin-walled, fragile veins that roll; sluggish flow; rapid sclerosis and chemical phlebitis; high risk of missed shots and deep abscesses.
  - *Red Zone (Extreme Hazard - Life & Limb Threat)*:
    - *Neck & Throat (Internal/External Jugular)*: Proximity to carotid artery and vagus nerve; accidental carotid injection causes catastrophic cerebral infarction (stroke) or status epilepticus; deep neck space hematomas/abscesses compress trachea causing suffocating airway collapse within minutes; extreme air embolism risk.
    - *Groin & Inguinal Canal (Femoral Vein / "Femoral Hit")*: NAVEL bundle anatomy (femoral vein, artery, nerve); high risk of femoral artery puncture, massive exsanguinating hemorrhage, and false aneurysm (pseudoaneurysm); chronic femoral injection destroys venous return causing severe deep vein thrombosis (DVT) and limb loss.
    - *Legs, Ankles & Feet (Saphenous Veins & Dorsal Pedis)*: Sluggish venous return against gravity; valve destruction; ankle extravasations degenerate into chronic, necrotic, non-healing venous stasis ulcers and osteomyelitis.
- **Arterial Puncture vs. Venous Access Bedside Differential**:
  - *Venous (Safe Target)*: Dark crimson red blood, steady non-pulsatile draw, painless or mild pressure.
  - *Arterial (Critical Emergency)*: Bright scarlet red, frothy, high pressure; blood pushes the syringe plunger back out without drawing; excruciating burning electric-shock pain radiating down limb into digits; immediate pale blanching or purple discoloration.
  - *Immediate Arterial Action*: DO NOT INJECT. Withdraw needle immediately. Apply firm, continuous direct manual pressure with clean gauze/cloth for AT LEAST 15 MINUTES uninterrupted (do not peek). Elevate limb above heart level. NEVER APPLY A TOURNIQUET AFTER AN ARTERIAL HIT. If bleeding persists beyond 15 minutes or limb is cold/numb/pulseless, call 911 / seek emergency vascular surgery.
- **Vascular Complications & Infection Differential Engine**:
  - *Deep Vein Thrombosis (DVT)*: Unilateral arm/leg swelling, persistent dull aching pain, erythema, warmth. Emergency duplex ultrasound and anticoagulation (DOAC/enoxaparin). Strict contraindication: NEVER massage or rub a swollen extremity (dislodges clot into pulmonary circulation, causing fatal pulmonary embolism).
  - *Infected Arterial Pseudoaneurysm*: Tender, expanding, pulsatile mass with audible bruit. Misdiagnosis hazard: often mistaken for an abscess; attempting bedside incision and drainage (I&D) triggers fatal exsanguination. Mandatory emergency vascular surgery consultation and Doppler ultrasound / CT angiography before any intervention.
  - *Acute Compartment Syndrome*: The 6 Ps (Pain out of proportion, Pain on passive stretch, Pallor, Paresthesias, Paralysis, Pulselessness); rock-hard "wooden" compartment. Emergency surgical fasciotomy required within 6 hours to prevent irreversible muscle necrosis and amputation.
  - *Cotton Fever vs. Sepsis/Endocarditis*: Cotton fever is an endotoxin reaction (*Pantoea agglomerans*) from cotton filters causing shaking rigors 15–30 min post-injection, resolving within 12–24 hours. Critical rule: Fever or chills persisting beyond 24 hours is NOT cotton fever—it is bacteremia, sepsis, or infective endocarditis requiring blood cultures and IV antibiotics.
- **Vein Preservation & Biomechanical Protocols**:
  - *Rule 1*: Release tourniquet BEFORE depressing plunger (prevents high venous back-pressure blowout and missed shot abscesses).
  - *Rule 2*: Bevel up at 15° to 45° angle pointing toward the heart.
  - *Rule 3*: Never "boot" or pump blood back and forth (causes rapid platelet activation and thrombophlebitis).
  - *Rule 4*: Single-use sterile needles only (electron microscopy reveals blunted fishhook barbs after a single puncture).
  - *Rule 5*: 0.22-micron sterile wheel filtration (eliminates 100% of bacteria, fungal spores, and insoluble pill binders/talc).
- **Vein Healing & Non-Injection Transition**:
  - Warm compresses (10–15 min twice daily) and systemic hydration (2 L water daily) to stimulate vasodilation.
  - 48-Hour Rotation Rule: Move 1 inch upward toward heart; allow 48–72 hours of uninterrupted endothelial healing.
  - Transition to smoking, boofing/rectal (~80% bioavailability), or snorting to allow damaged veins to recover.
- **Zero-PII SBAR Clinical Handoff & Vascular Triage Note Generator**:
  - 1-click clipboard export in English and Spanish for Emergency Department triage, vascular surgery consultations, and street medicine teams.

### 35. Wave 37: Inhalants, Solvents & Nitrous Oxide Safety Navigator (`#/inhalant-care`)
- **Substance Science & Molecular Mechanisms**:
  - *Nitrous Oxide (N₂O / Whippets, Cylinders, "Galaxy Gas")*: Irreversibly oxidizes cobalt core of Vitamin B12 (cobalamin) from active Co⁺ to inactive Co³⁺, shutting down methionine synthase and arresting myelin sheath synthesis.
  - *Volatile Hydrocarbons, Aerosols & Dusters (Butane, Difluoroethane [DFE], Propane, Toluene)*: Highly lipophilic membrane disrupters. Halogenated hydrocarbons sensitize myocardial beta-adrenergic receptors to endogenous catecholamines (epinephrine).
  - *Alkyl Nitrites ("Poppers" / Isobutyl, Isopentyl, Amyl Nitrite)*: Release nitric oxide to generate cGMP, causing profound vasodilation. In erythrocytes, nitrites oxidize ferrous iron (Fe²⁺) in hemoglobin to ferric iron (Fe³⁺), producing methemoglobin.
- **Diagnostic Paradoxes & ACLS Modifications**:
  - *N₂O B12 Diagnostic Trap*: Standard serum B12 assays are deceptively NORMAL or elevated because immunoassays detect inactive oxidized cobalamin. Diagnosis requires measuring serum Methylmalonic Acid (MMA) and Homocysteine (both markedly elevated).
  - *ACLS Hydrocarbon Modification*: Epinephrine and isoproterenol are RELATIVELY CONTRAINDICATED in cardiac arrest from volatile hydrocarbons; exogenous catecholamines worsen myocardial sensitization and refractory ventricular fibrillation. Short-acting beta-blockers (esmolol) and lidocaine are preferred.
  - *Pulse Oximetry Methemoglobin Artifact*: Pulse oximeter SpO₂ values plateau at ~85% regardless of true arterial PaO₂. Arterial blood gas with Co-Oximetry is mandatory.
- **Clinical Differential Engines & Syndromes**:
  - *Subacute Combined Degeneration (SCD) of Spinal Cord*: Glove-and-stocking paresthesias, sensory ataxia, foot drop, positive Lhermitte’s sign. High-dose IM Hydroxocobalamin (1,000 mcg IM daily x 7 days). Contraindication: never administer folic acid alone (precipitates spinal degeneration).
  - *Sudden Sniffing Death Syndrome (SSDS)*: Fatal ventricular fibrillation or asystole triggered by adrenaline surges during panic, fright, or exertion. Mandatory first responder directive: never chase, startle, or physically restrain someone actively inhaling hydrocarbons.
  - *Acquired Methemoglobinemia*: "Chocolate brown" blood that fails to turn scarlet on room air exposure; refractory cyanosis. Antidote: Methylene Blue (1–2 mg/kg IV over 5 min). Strict contraindication: G6PD deficiency triggers fatal hemolytic anemia (use high-dose IV ascorbic acid instead).
  - *Toluene Distal Renal Tubular Acidosis (Type 1 RTA)*: Impaired tubular proton excretion and massive urinary potassium wasting causing severe hypokalemia (K⁺ < 2.0 mEq/L), flaccid quadriparesis, and paradoxical alkaline urine (pH > 5.5). Urgent IV potassium and bicarbonate.
  - *Popper Maculopathy*: Foveal photoreceptor phototoxicity causing central scotoma and yellow foveal spot on OCT. Immediate permanent cessation.
  - *Lethal PDE-5 Inhibitor Synergy*: Poppers + sildenafil (Viagra) / tadalafil (Cialis) causes unchecked cGMP accumulation and catastrophic, fatal vasodilatory shock. Trendelenburg position, rapid IV crystalloids, and direct alpha-1 vasopressors (norepinephrine).
- **Harm Reduction & Administration Safety Directives**:
  - *Rule 1*: Always use balloons for N₂O (never inhale directly from tanks or crackers to prevent cryogenic freeze burns at -40°C to -60°C and tension pneumothorax).
  - *Rule 2*: Never use masks, bags, or straps over face or head (causes silent anoxic loss of consciousness and suffocating death in 3–5 min).
  - *Rule 3*: Never combine alkyl nitrites with erectile dysfunction medications.
  - *Rule 4*: Never chase, startle, or physically restrain someone inhaling solvents.
  - *Rule 5*: B12 replacement requires high-dose intramuscular hydroxocobalamin only (oral B12 pills are ineffective).
- **Zero-PII SBAR Clinical Handoff Note Generator**:
  - 1-click clipboard export in English and Spanish for Emergency Department triage, neurology consultation, and poison center handoffs.

Not medical advice. HarborPath never endorses providers or accepts payment for listings.
