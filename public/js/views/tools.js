import { h, clear } from '../dom.js';
import { t } from '../i18n.js';
import { pageHeader, emergencyCallout } from './common.js';
import { sourceContext } from '../components/sourceContext.js';

// This catalog contains only public links and copy. Search and audience choices
// stay in memory: never send them to the API, history, or device storage.
const entries = [
  ['match', 'care', 'Find care that fits', 'Compare treatment options, payment information, distance, and questions to ask before an appointment.', ['individual', 'supporter', 'care-team']],
  ['guided', 'care', 'Help me choose a starting point', 'Follow short, skippable questions to find relevant resources. Your answers stay on this device.', ['individual', 'supporter']],
  ['workspace', 'planning', 'Care team workspace', 'Prepare a visit, verify a referral, and organize follow-up with an anonymous handoff checklist.', ['care-team']],
  ['overdose', 'emergency', 'Overdose response', 'Open emergency steps and the optional response timer. Call 911 for a suspected overdose.', ['individual', 'supporter', 'care-team']],
  ['crisis', 'emergency', 'Talk to someone now', 'Find crisis support, confidential helplines, and someone to talk with about next steps.', ['individual', 'supporter', 'care-team']],
  ['harm-reduction', 'planning', 'Stay safer', 'Find naloxone, test-strip instructions, safer-use information, and support without a requirement to quit.', ['individual', 'supporter', 'care-team']],
  ['navigator', 'care', 'Clinical care navigator', 'Explore care needs across withdrawal, physical health, mental health, and daily living. A guide for discussion, not a diagnosis.', ['individual', 'care-team']],
  ['clinical-scores', 'care', 'COWS & CIWA-Ar withdrawal reference', 'Review withdrawal symptoms with a clinician and recognize emergency warning signs. Scores do not establish safety.', ['individual', 'supporter', 'care-team']],
  ['withdrawal-planner', 'planning', 'Low-dose buprenorphine reference', 'Explore a six-day educational reference and questions for a prescriber, with pregnancy and wound care guidance.', ['individual', 'supporter', 'care-team']],
  ['assessment', 'care', 'Withdrawal assessment tools', 'Review structured withdrawal screening tools with a trained healthcare professional.', ['care-team']],
  ['medications', 'care', 'Medications and interactions', 'Explore treatment medications and interaction information to discuss with a pharmacist or prescriber.', ['individual', 'supporter', 'care-team']],
  ['health', 'care', 'Low-cost and community health care', 'Search health centers, mental health care, VA, IHS, rural clinics, and emergency hospitals.', ['individual', 'supporter', 'care-team']],
  ['plan', 'planning', 'Safety plan and first appointment', 'Prepare questions, explore what an intake visit is like, and create a private printable plan.', ['individual', 'supporter', 'care-team']],
  ['support', 'planning', 'Recovery and family support', 'Explore peer groups, recovery housing, and ways to support someone without pressure or judgment.', ['individual', 'supporter', 'care-team']],
  ['recovery-support', 'planning', 'Life after treatment', 'Recovery housing and NARR levels, staying on medication (MOUD), peer recovery coaches, a plan for a return to use, and recovery-ready workplaces.', ['individual', 'supporter', 'care-team']],
  ['overdose-loss', 'planning', 'After an overdose death', 'First practical steps, toxicology and death certificates, keeping others safe, talking with children, and grief support for families and friends.', ['supporter', 'care-team']],
  ['choosing-care', 'planning', 'Questions to ask a treatment program', 'Check treatment quality, ask about costs and medications, and recognize referral red flags.', ['individual', 'supporter', 'care-team']],
  ['post-overdose', 'planning', 'Care after an overdose', 'Explore follow-up support, treatment connections, and planning after an overdose.', ['individual', 'supporter', 'care-team']],
  ['readiness', 'planning', 'Explore readiness for change', 'Think through your goals and next steps at your own pace.', ['individual', 'supporter', 'care-team']],
  ['states', 'care', 'State and territory resources', 'Find behavioral health agencies, Medicaid links, and local support by jurisdiction.', ['individual', 'supporter', 'care-team']],
  ['perinatal', 'populations', 'Pregnancy and postpartum support', 'Explore pregnancy, postpartum, treatment, and family support resources.', ['individual', 'supporter', 'care-team']],
  ['adolescent', 'populations', 'Youth and family care', 'Find youth-focused care information, consent considerations, and family support.', ['individual', 'supporter', 'care-team']],
  ['veterans', 'populations', 'Veterans and military families', 'Explore VA care, military health coverage, and veteran-specific support.', ['individual', 'supporter', 'care-team']],
  ['reentry', 'populations', 'Support after incarceration', 'Plan treatment connections, safer transitions, and practical support after release.', ['individual', 'supporter', 'care-team']],
  ['older-adults', 'populations', 'Older adults and Medicare', 'Explore medication, coverage, and care considerations for older adults.', ['individual', 'supporter', 'care-team']],
  ['tribal-health', 'populations', 'Indigenous and tribal health', 'Explore IHS, tribal, and urban Indian health resources.', ['individual', 'supporter', 'care-team']],
  ['lgbtq-care', 'populations', 'LGBTQ+ care', 'Explore affirming care, medication considerations, and support resources.', ['individual', 'supporter', 'care-team']],
  ['wound-care', 'care', 'Wound care and infection warning signs', 'Review wound-care information, when to seek urgent help, and infection testing resources.', ['individual', 'supporter', 'care-team']],
  ['rural-health', 'populations', 'Rural and frontier care', 'Explore transportation, remote care, and low-cost options farther from a city.', ['individual', 'supporter', 'care-team']],
  ['disability-care', 'populations', 'Accessible and disability-informed care', 'Explore communication supports, sensory needs, and accessible care options.', ['individual', 'supporter', 'care-team']],
  ['street-medicine', 'populations', 'Care without stable housing', 'Explore street medicine, shelter-related support, and low-barrier health care.', ['individual', 'supporter', 'care-team']],
  ['immigrant-health', 'populations', 'Immigrant health and language access', 'Explore language assistance, health-care access, and coverage information.', ['individual', 'supporter', 'care-team']],
  ['stimulant-care', 'care', 'Stimulant care and support', 'Explore stimulant-related risks, support options, and treatment information.', ['individual', 'supporter', 'care-team']],
  ['workplace-rights', 'populations', 'Work and professional support', 'Explore workplace accommodation, leave, and professional support considerations.', ['individual', 'supporter', 'care-team']],
  ['chronic-pain', 'care', 'Chronic pain and sedative tapering', 'Review CDC 2022 pain guidance, buprenorphine analgesia split-dosing, and safe Ashton benzodiazepine tapering.', ['individual', 'supporter', 'care-team']],
  ['alcohol-care', 'care', 'Alcohol care and medical withdrawal', 'Evaluate alcohol withdrawal risk (PAWSS), Wernicke-Korsakoff prevention, and FDA-approved medications (MAUD).', ['individual', 'supporter', 'care-team']],
  ['family-support', 'planning', 'Family support and CRAFT guide', 'Use Community Reinforcement and Family Training (CRAFT) to improve communication, set boundaries, and support a loved one.', ['supporter', 'care-team']],
  ['adulterant-care', 'care', 'Emerging adulterants, xylazine and tranq wound care', 'Evidence-based guidance for xylazine (tranq), nitazenes, alpha-2 sedation triage, necrotic wound management, and test strip standards.', ['individual', 'supporter', 'care-team']],
  ['methadone-access', 'care', 'Methadone clinic access and 2024 Part 8 rules', 'Explore 2024 SAMHSA Part 8 rules, calculate take-home bottle eligibility, prevent dangerous rapid tapers, and advocate for patient rights.', ['individual', 'supporter', 'care-team']],
  ['dual-diagnosis', 'care', 'Dual diagnosis and integrated mental health', 'Explore integrated dual disorder treatment (IDDT), psychotropic and MOUD compatibility, false-positive toxicology rights, and crisis safety planning.', ['individual', 'supporter', 'care-team']],
  ['polysubstance-care', 'harm', 'Polysubstance overdose synergy and interactions', 'Evaluate multi-substance interactions, depressant respiratory arrest risks, naloxone limits, airway rescue breathing, and serotonin toxicity.', ['individual', 'supporter', 'care-team']],
  ['nightlife-care', 'harm', 'Nightlife, club drugs and festival harm reduction', 'Evidence-based harm reduction for MDMA, ketamine, GHB/GBL, nitrous oxide, reagent testing, hyponatremia prevention, and bladder health.', ['individual', 'supporter', 'care-team']],
  ['sleep-care', 'health', 'Sleep restoration and insomnia in recovery', 'Evidence-based sleep restoration, CBT-I protocols, non-controlled sleep pharmacotherapy, and post-acute withdrawal sleep architecture.', ['individual', 'supporter', 'care-team']],
  ['dental-care', 'health', 'Dental, oral health and endocarditis prevention', 'FDA 2022 buprenorphine oral safety protocol, meth mouth harm reduction, endocarditis bacteremia prevention, and low-cost dental clinic navigation.', ['individual', 'supporter', 'care-team']],
  ['cannabis-care', 'health', 'Cannabinoid hyperemesis (CHS) and concentrates care', 'Rome IV diagnostic criteria, cyclic vomiting triage, topical capsaicin protocols, why Zofran fails, and 90-day CB1 receptor recovery.', ['individual', 'supporter', 'care-team']],
  ['viral-hepatitis', 'health', 'Hepatitis C cure, DAA regimens, FIB-4 & HIV PrEP/PEP', 'AASLD/IDSA 8-to-12-week DAA cure protocols, non-invasive FIB-4 scoring, HBV screening, HIV 72-hour PEP, and patient rights without sobriety barriers.', ['individual', 'supporter', 'care-team']],
  ['nicotine-care', 'health', 'Tobacco, nicotine, vaping and smoking cessation', 'Fagerström dependence scoring, combination NRT dosing protocols, varenicline guidance, vape salt down-titration, and craving defusal.', ['individual', 'supporter', 'care-team']],
  ['benzodiazepine-care', 'care', 'Benzodiazepines, Ashton tapering and BIND care', 'Diazepam equivalence calculator, Ashton Manual crossover schedules, flumazenil toxicity alerts, protracted withdrawal (BIND) validation, and seizure safety.', ['individual', 'supporter', 'care-team']],
  ['adhd-care', 'care', 'ADHD, neurodiversity and stimulant harm reduction', 'ASRS v1.1 clinical screener, non-stimulant pharmacotherapy in SUD recovery, counterfeit pill FTS dilution, and executive function tools.', ['individual', 'supporter', 'care-team']],
  ['toxicology-triage', 'emergency', 'Acute toxicology triage & Project BETA crisis de-escalation', 'Multi-toxidrome differential engine across 5 conditions, Project BETA 10-domain verbal de-escalation, RASS scoring, restraint-avoidance pharmacotherapy, and SBAR clinical handoffs.', ['individual', 'supporter', 'care-team']],
  ['hospital-care', 'care', 'Hospital addiction care, pain on MOUD & patient rights', 'CA Bridge high-dose ED buprenorphine induction, acute surgical pain on MOUD, precipitated withdrawal rescue, and patient-directed discharge (AMA) harm reduction.', ['individual', 'supporter', 'care-team']],
  ['needle-exposure', 'harm-reduction', 'Needle stick, sharps injury & bloodborne pathogen PEP protocol', 'CDC/USPHS 72-hour golden window PEP regimens (Biktarvy/Truvada), HBV titer algorithms, OSHA 1910.1030 100% employer-paid care, and safe community sharps disposal.', ['individual', 'supporter', 'care-team']],
  ['sexual-health', 'harm-reduction', 'Sexual health, Doxy-PEP, HIV PrEP & emergency contraception', 'CDC 2024 Doxy-PEP bacterial STI protocol (doxycycline 200 mg < 72h), HIV PrEP options (Truvada/Descovy/Apretude), seamless PEP-to-PrEP transition, and emergency contraception weight thresholds.', ['individual', 'supporter', 'care-team']],
  ['novel-substances', 'emergency', 'Novel substances, kratom, tianeptine & OTC misuse', 'ACMT/ASAM/FDA clinical decision support for tianeptine cardiotoxicity (ZaZa), kratom alkaloids (7-OH), phenibut GABA-B withdrawal baclofen tapers, and urine drug screen immunoassay blindspots.', ['individual', 'supporter', 'care-team']],
  ['gabapentinoid-care', 'care', 'Gabapentinoids, respiratory synergy & deprescribing', 'FDA 2019 opioid respiratory synergy alerts, Gabapentin and Pregabalin (Lyrica) Horowitz-Taylor hyperbolic deprescribing calculator, Cockcroft-Gault renal CrCl dosing ceilings, and withdrawal syndrome prevention.', ['individual', 'supporter', 'care-team']],
  ['psychedelic-care', 'care', 'Psychedelic care, 5-HT2A crisis de-escalation & HPPD', 'Fireside Project peer support protocols, 4 Pillars of compassionate crisis de-escalation, sensory grounding, Lithium seizure contraindications, bitter NBOMe adulterant alerts, and HPPD neuro-ophthalmology guidance.', ['individual', 'supporter', 'care-team']],
  ['ghb-care', 'emergency', 'GHB, GBL & 1,4-BDO harm reduction, coma triage & withdrawal', 'Evidence-based clinical guidelines for GHB/GBL G-out coma triage, lateral recovery position, 1,4-BDO alcohol dehydrogenase trap, severe withdrawal delirium, and BAP Baclofen substitution protocols.', ['individual', 'supporter', 'care-team']],
  ['vein-care', 'harm-reduction', 'Vein care, vascular health & injection anatomy', 'Anatomical injection risk zones (green vs red), inadvertent arterial puncture emergency triage, DVT and pseudoaneurysm prevention, 0.22-micron filtration, and vein rehabilitation.', ['individual', 'supporter', 'care-team']],
  ['inhalant-care', 'harm-reduction', 'Inhalants, solvents & nitrous oxide safety', 'Clinical guidance for nitrous oxide B12 inactivation, Subacute Combined Degeneration, Sudden Sniffing Death Syndrome (SSDS), alkyl nitrite methemoglobinemia, and cryogenic freeze injury prevention.', ['individual', 'supporter', 'care-team']],
  ['ketamine-care', 'harm-reduction', 'Ketamine harm reduction & uropathy navigator', 'Clinical guidance for Ketamine-Induced Uropathy (KIU / "K-Bladder") staging, biliary "K-cramps" management, EGCG antioxidant protection, and water drowning safety.', ['individual', 'supporter', 'care-team']],
  ['weather-care', 'emergency', 'Weather care, hypothermia, frostbite & heat stroke safety navigator', 'Evidence-based protocols for accidental hypothermia (Swiss Stages I–IV), "warm and dead" CPR rule, frostbite tissue preservation, trench foot care, and emergency heat stroke cooling.', ['individual', 'supporter', 'care-team']],
  ['liver-care', 'clinical-support', 'Liver health, APAP toxicity & cirrhosis safety navigator', 'AASLD/ACMT consensus for acetaminophen (APAP) toxicity, Rumack-Matthew nomogram, 21-hour IV NAC protocol, Child-Pugh cirrhosis staging, MOUD in hepatic failure (Suboxone vs Subutex), and hepatic encephalopathy triage.', ['individual', 'supporter', 'care-team']],
  ['renal-care', 'clinical-support', 'Renal health, rhabdomyolysis, AKI & dialysis MOUD navigator', 'KDIGO and ASN consensus for overdose down time rhabdomyolysis, hyperkalemia ECG stabilization, compartment syndrome 6 P’s, buprenorphine/methadone dialyzability, and strict morphine/NSAID toxicity prohibitions.', ['individual', 'supporter', 'care-team']],
  ['pulmonary-care', 'emergency', 'Pulmonary health, post-overdose lung injury & inhalation safety', 'ATS/ERS and CHEST consensus for post-naloxone non-cardiogenic pulmonary edema (NCPE), "Crack Lung" diffuse alveolar hemorrhage, chemical aspiration pneumonitis, pulmonary talcosis, and safer smoking equipment.', ['individual', 'supporter', 'care-team']],
  ['neurology-care', 'emergency', 'Neurological health, post-overdose brain injury & neuroprotection', 'AAN and Neurocritical Care consensus for hypoxic-ischemic encephalopathy (HIE), delayed post-hypoxic leukoencephalopathy (DPHL), PRES, osmotic demyelination syndrome (ODS), and Wernicke thiamine emergencies.', ['individual', 'supporter', 'care-team']],
  ['metabolic-care', 'emergency', 'Metabolic emergencies, alcoholic ketoacidosis & adrenal crisis', 'ADA, Endocrine Society & ASAM consensus for alcoholic ketoacidosis (AKA), stimulant-induced DKA/HHS, SGLT2 euglycemic DKA (euDKA), masked hypoglycemia, and opioid-induced adrenal crisis (OIAI).', ['individual', 'supporter', 'care-team']],
  ['gi-care', 'emergency', 'GI & mesenteric emergencies, acute pancreatitis & opioid constipation', 'ACG, AGA, NEJM WATERFALL & WSES consensus for acute pancreatitis, cocaine mesenteric ischemia, opioid-induced constipation (PAMORAs), narcotic bowel syndrome, Boerhaave rupture, and body packing.', ['individual', 'supporter', 'care-team']],
  ['hematology-care', 'emergency', 'Hematology, coagulopathy, levamisole vasculitis & toxic hemolysis', 'ASH, ACMT, AASLD & AGA consensus for levamisole cocaine agranulocytosis, brodifacoum (K2/Spice) superwarfarin coagulopathy, G6PD methemoglobinemia, IV tablet TMA/TTP, and cirrhosis hemostasis.', ['individual', 'supporter', 'care-team']],
  ['orthopedic-care', 'emergency', 'Spinal epidural abscess, septic arthritis, pyomyositis & OVIVA bone/joint navigator', 'IDSA, AAOS & NEJM OVIVA consensus for spinal epidural abscess (SEA), vertebral osteomyelitis, sternoclavicular/sacroiliac septic arthritis, psoas abscess, clostridial myonecrosis, OVIVA oral/dalbavancin step-down, and femoral head AVN.', ['individual', 'supporter', 'care-team']],
  ['ocular-care', 'emergency', 'Ophthalmology, endogenous endophthalmitis, methanol blindness & ocular toxicology', 'AAO, IDSA & ACMT consensus for methanol formic acid optic neuropathy, intravitreal fungal/bacterial endophthalmitis, "crack cornea" keratopathy, central retinal artery occlusion (CRAO), topiramate glaucoma, and poppers maculopathy.', ['individual', 'supporter', 'care-team']],
  ['urology-care', 'emergency', 'Urologic emergencies, ischemic priapism, Fournier gangrene & urinary retention navigator', 'AUA, EAU & IDSA consensus for trazodone/cocaine/antipsychotic low-flow ischemic priapism (phenylephrine & 19G aspiration), Fournier gangrene, opioid/anticholinergic urinary retention, dorsal penile vein thrombosis, and ketamine obstructive uropathy.', ['individual', 'supporter', 'care-team']],
  ['ent-care', 'emergency', 'Otolaryngology, Ludwig angina, Lemierre syndrome, septal perforation & airway navigator', 'AAO-HNS & IDSA consensus for Ludwig angina & deep neck infections (awake fiberoptic airway), Lemierre internal jugular thrombophlebitis, cocaine midline destructive lesions (CIMDL septal button/obturator), crack-pipe thermal epiglottitis, N2O airway frostbite, and safer insufflation.', ['individual', 'supporter', 'care-team']],
  ['dermatology-care', 'emergency', 'Dermatology, xylazine necrotic eschar, Stevens-Johnson (SJS/TEN) & DRESS navigator', 'AAD, Burn ICU & IDSA consensus for tendon-sparing xylazine eschar care, lamotrigine/anticonvulsant SJS/TEN (SCORTEN), vancomycin DRESS syndrome, skin-popping cutaneous anthrax & wound botulism (HBAT), Nicolau syndrome, and stimulant formication.', ['individual', 'supporter', 'care-team']],
  ['cardiology-care', 'emergency', 'Cardiology, stimulant chest pain, sodium-channel QRS blockade & Torsades (QTc) navigator', 'AHA/ACC & ACMT consensus for cocaine/methamphetamine ACS (IV benzodiazepines + nitroglycerin; beta-blocker prohibition), sodium-channel wide-QRS blockade (8.4% sodium bicarbonate), methadone/loperamide Torsades de Pointes (2g IV MgSO4), aortic dissection, Takotsubo LVOT obstruction, and Meth-PAH.', ['individual', 'supporter', 'care-team']],
  ['oncology-palliative', 'care', 'Oncology, palliative care, sickle cell crisis & complex cancer pain on MOUD navigator', 'ASCO, NCCN & ASH consensus for cancer pain on buprenorphine/methadone (split TID/QID MOUD + full-agonist layering), sickle cell vaso-occlusive crisis <= 30-min parenteral analgesia & acute chest syndrome, opioid-induced neurotoxicity (M3G/H3G rotation), CIPN duloxetine, cord compression, and fentanyl patch heat safety.', ['individual', 'supporter', 'care-team']],
  ['pediatric-exposures', 'emergency', 'Pediatric accidental exposures, child toxicology & safe storage navigator', 'AAP, ACMT & Poison Control consensus for toddler buprenorphine film/methadone ingestion, counterfeit pill/fentanyl exposure, pediatric naloxone, cannabis edible look-alikes, nicotine/vape poisoning, clonidine/guanfacine toxicity, and child lockboxes.', ['individual', 'supporter', 'care-team']],
  ['geriatric-care', 'care', 'Geriatric addiction medicine, Beers Criteria, anticholinergic cognitive burden & fall risk navigator', 'AGS Beers Criteria 2023, Anticholinergic Cognitive Burden (ACB score >= 3), geriatric MOUD renal/hepatic clearance & QTc monitoring, CDC STEADI orthostatic fall/hip fracture prevention, severe OIC fecal impaction, and caregiver-supported dosing.', ['individual', 'supporter', 'care-team']],
  ['obstetric-emergencies', 'emergency', 'Obstetric emergencies, 3rd-trimester split MOUD, Cesarean analgesia & Eat-Sleep-Console navigator', 'ACOG, SMFM, ASAM & AAP consensus for stimulant severe preeclampsia & concealed placental abruption, 3rd-trimester CYP3A4 split-dosing of methadone/buprenorphine, intrapartum Nalbuphine/Butorphanol prohibition, postpartum hemorrhage (no Methergine in HTN/stimulants), NEJM Eat-Sleep-Console (ESC) NOWS care, and 4th-trimester overdose prevention.', ['individual', 'supporter', 'care-team']],
  ['icu-perioperative', 'emergency', 'Critical care (ICU), safe RSI intubation, fentanyl/xylazine sedation & perioperative MOUD navigator', 'SCCM, ASA, ASRA & ACMT consensus for overdose rhabdomyolysis Succinylcholine prohibition, alpha-2 replacement (Dexmedetomidine/Clonidine) in xylazine ventilator dyssynchrony, Propofol Infusion Syndrome (PRIS), IV Lorazepam propylene glycol toxicity, perioperative Buprenorphine/Methadone/Vivitrol anesthesia, and extubation bridges.', ['individual', 'supporter', 'care-team']],
  ['endocarditis-care', 'emergency', 'Infective endocarditis, valve destruction & POET protocol navigator', 'AHA/IDSA consensus for right-sided tricuspid septic pulmonary emboli vs. left-sided aortic root abscess, 3-blood-culture rule, 2023 Duke criteria, POET oral step-down, dalbavancin, and ethical valve surgery.', ['individual', 'supporter', 'care-team']],
  ['burn-toxicology', 'emergency', 'Burn, inhalation & chemical toxicology navigator', 'ABA resuscitation fluid formula (2 mL/kg/% TBSA), hydrofluoric acid calcium gluconate, anhydrous ammonia, BHO flash burns, carbon monoxide/cyanide inhalation, and CHS scald care.', ['individual', 'supporter', 'care-team']],
  ['embed', 'planning', 'Embeddable public health widgets & partner badges', 'Generate zero-cookie, sandbox-isolated iframe tools and SVG partner seals for municipal health departments, clinics, and harm reduction coalitions.', ['supporter', 'care-team']],
  ['outreach', 'harm-reduction', 'Community street outreach materials & pocket handouts', 'Printable wallet-sized pocket reference guides for street teams: 5-step naloxone, 10:1 test strip dilution, Good Samaritan script, and hospital MOUD rights.', ['individual', 'supporter', 'care-team']],
  ['encampment-medicine', 'care', 'Encampment medicine, street zoonoses & vector-borne diseases', 'NHCHC and CDC field protocols for Bartonella trench fever, murine typhus, leptospirosis, crusted scabies, and animal bites with rabies & tetanus PEP.', ['individual', 'supporter', 'care-team']],
  ['street-trauma', 'emergency', 'Street trauma, tourniquets & life-threatening hemorrhage control', 'ACS Stop the Bleed & CoTCCC field directives: windlass tourniquet application, junctional wound packing with hemostatic gauze, and dual-bone entrapment warnings.', ['individual', 'supporter', 'care-team']],
  ['fhir-export', 'planning', 'FHIR R4 referral & EHR interoperability generator', 'Generate standardized, privacy-preserving HL7 FHIR R4 US Core bundles (ServiceRequest, Consent, HealthcareService) with 42 CFR Part 2 statutory clauses and zero PII.', ['care-team']],
  ['toxic-alcohol', 'emergency', 'Toxic alcohol poisoning, fomepizole & osmolal gap navigator', 'AACT, EAPCCT and EXTRIP consensus for methanol (formic acid blindness), ethylene glycol (calcium oxalate crystals), diethylene glycol, and isopropanol (pseudorenal failure without acidosis) with fomepizole/ethanol dosing.', ['individual', 'supporter', 'care-team']],
  ['mass-overdose-mci', 'emergency', 'Mass overdose cluster, contaminated supply & SALT triage navigator', 'CDC spike response and NAEMT TECC protocols for synthetic opioid super-agonists (carfentanil, nitazenes), xylazine/medetomidine, wooden chest rigidity, and ventilation-first SALT mass casualty triage.', ['individual', 'supporter', 'care-team']],
  ['moud-directive', 'planning', 'Offline emergency MOUD directive & verifiable inpatient rights pass', 'Zero-PII verifiable treatment rights pass and printable wallet card enforcing Title II ADA, DEA 21 CFR § 1306.07(c) hospital continuation, acute pain co-prescribing, and 42 CFR Part 2 privacy notices.', ['individual', 'supporter', 'care-team']],
  ['nsti-wound-staging', 'emergency', 'Necrotizing fasciitis (NSTI), LRINEC score, POCUS & xylazine ulcer navigator', 'IDSA and Wong et al. consensus for necrotizing soft tissue infections (NSTI), hard signs of necrosis (crepitus, bullae, dishwater pus), STAFF ultrasound criteria, LRINEC lab calculator, and tendon-sparing xylazine ulcer care.', ['individual', 'supporter', 'care-team']],
  ['pediatric-ingestion-decon', 'emergency', 'Pediatric ingestion, One Pill Can Kill & decontamination decision engine', 'AAP, ACMT and Poison Control consensus for toddler lethal single-dose ingestions (methadone, buprenorphine, clonidine, CCBs, sulfonylureas), activated charcoal eligibility vs contraindications, WBI, and weight-based naloxone.', ['individual', 'supporter', 'care-team']],
  ['carceral-moud-reentry', 'populations', 'Carceral MOUD continuity, Section 1115 Medicaid & safe reentry directives', 'DOJ Title II ADA settlements, Tri-Medication Carceral Mandates (methadone, buprenorphine, Vivitrol), Section 1115 Medicaid 30-90 day enrollment, 30-day bridge prescriptions, and gate naloxone exit kits preventing the 40x-129x overdose spike.', ['individual', 'supporter', 'care-team']],
  ['disaster-moud-climate', 'emergency', 'Disaster MOUD continuity, wildfire smoke & climate resilience navigator', 'SAMHSA 42 CFR Part 8 disaster flexibilities (up to 28-day take-home supply), interstate guest dosing, MMU muster redeployment, PM2.5 wildfire harm reduction, Corsi-Rosenthal filtration, and floodwater leptospirosis & tetanus triage.', ['individual', 'supporter', 'care-team']],
  ['movement-disorders-eps', 'emergency', 'Stimulant movement disorders, choreoathetosis & acute dystonia / EPS decision engine', 'ACMT and Project BETA consensus: Differential staging of choreoathetosis ("meth dance"), acute dystonic reaction (laryngeal airway stridor), akathisia, NMS, and Hunter serotonin criteria, with anticholinergic reversal and black-box haloperidol prohibition.', ['individual', 'supporter', 'care-team']],
  ['fungal-opportunistic-care', 'health', 'Opportunistic deep fungal infections, endemic mycoses & MOUD navigator', 'IDSA guidelines for Blastomycosis (verrucous plaques, steroid monotherapy danger), Valley Fever, Histoplasmosis, angioinvasive molds (Mucorales black eschars), disc-sparing spondylitis, and lethal Azole-Methadone CYP3A4 inhibition & QTc prolongation.', ['individual', 'supporter', 'care-team']],
  ['inhalant-toxicology', 'health', 'Inhalant, volatile solvent & nitrous oxide neuropathy navigator', 'ACMT consensus protocols for Nitrous Oxide (Galaxy Gas) SCD and folate trap prohibition, volatile hydrocarbon sudden sniffing death syndrome (epinephrine prohibition), and toluene Type 1 distal RTA hypokalemic quadriparesis.', ['individual', 'supporter', 'care-team']],
  ['adulterant-heavy-metals', 'emergency', 'Illicit drug adulterants, heavy metals & alpha-2 agonist triage', 'Clinical triage for Medetomidine refractory bradycardia (atipamezole prohibition), Brodifacoum superwarfarin coagulopathy (4F-PCC and oral Vitamin K bridge), and street drug Lead plumbism chelation sequencing.', ['individual', 'supporter', 'care-team']],
  ['peri-overdose-pulmonary', 'emergency', 'Peri-overdose pulmonary syndromes & non-cardiogenic edema navigator', 'Clinical triage for Post-Naloxone NCPE (PEEP recruitment vs loop diuretic prohibition), Mendelson chemical pneumonitis (48-hour prophylactic antibiotic prohibition), and "Crack Lung" DAH (corticosteroids vs beta-blocker prohibition).', ['individual', 'supporter', 'care-team']],
  ['cardiogenic-toxin-hiet', 'emergency', 'Cardiogenic toxin & high-dose insulin euglycemia (HIET) navigator', 'ACMT/EAPCCT consensus protocols for calcium channel blocker and beta-blocker severe toxicity, weight-based HIET dosing (1 U/kg bolus, 1-10 U/kg/hr infusion, D10W/D50W titration), permissive hypokalemia rules, and calcium/glucagon/lipid rescue.', ['individual', 'supporter', 'care-team']],
  ['wooden-chest-rigidity', 'emergency', 'Synthetic opioid "wooden chest" rigidity & rapid airway rescue protocol', 'ASA/ACEP consensus protocols for fentanyl-induced chest wall and vocal cord rigidity (FIMR), failed BVM rescue, high-dose naloxone vs immediate non-depolarizing neuromuscular blockade (Rocuronium/Vecuronium), and succinylcholine black-box hyperkalemic cardiac arrest prohibition.', ['individual', 'supporter', 'care-team']],
  ['hyperthermic-toxidrome', 'emergency', 'Stimulant, synthetic cathinone & hyperthermic crisis decision engine', 'ACMT and Wilderness Medical Society consensus for synthetic cathinones (Flakka, bath salts) and methamphetamine hyperthermia (>104°F / 40°C), rapid ice-water immersion targeting <38.5°C in <30 min, high-dose parenteral benzodiazepine / ketamine sedation, antipyretic futility, and physical restraint prohibition.', ['individual', 'supporter', 'care-team']],
  ['salicylate-nsaid-tox', 'emergency', 'Salicylate, aspirin & NSAID toxicity, urine alkalinization & dialysis navigator', 'AACT/ACMT/EXTRIP consensus for acute and chronic salicylate toxicity, methyl salicylate (wintergreen oil), pre-intubation hyperventilation protection, K+-gated NaHCO3 urine alkalinization, CSF neuroglycopenia dextrose dosing, and hemodialysis triggers.', ['individual', 'supporter', 'care-team']],
  ['mood-stabilizer-tox', 'emergency', 'Lithium, valproate hyperammonemia & lamotrigine toxicity navigator', 'ACMT and EXTRIP protocols for acute vs. chronic lithium neurotoxicity and dialysis, valproate hyperammonemic encephalopathy (IV L-carnitine), meropenem seizure alerts, and lamotrigine QRS sodium-channel / 4-day SJS restart guardrails.', ['individual', 'supporter', 'care-team']],
  ['antimuscarinic-toxidrome', 'emergency', 'Antimuscarinic, diphenhydramine street-cut & delirium navigator', 'Clinical decision support for diphenhydramine fentanyl-cut hybrid overdoses, Datura/scopolamine delirium, QRS >= 100 ms NaHCO3 rescue, bladder retention decompression, and rivastigmine/physostigmine contraindication gates.', ['individual', 'supporter', 'care-team']],
];

// Plain-language search words for each topic, in English and Spanish:
// everyday terms, common slang, and brand names people type instead of the
// clinical title. They are only matched, never shown. A topic without an entry
// here is still searchable by its title and summary.
export const TOOL_KEYWORDS = Object.freeze({
  match: ['treatment', 'rehab', 'detox', 'program', 'clinic', 'near me', 'insurance', 'medicaid', 'cost', 'outpatient', 'inpatient', 'residential',
    'tratamiento', 'rehabilitación', 'desintoxicación', 'programa', 'clínica', 'cerca de mí', 'seguro', 'costo'],
  guided: ['where to start', 'not sure', 'help me', 'questions', 'first step', 'empezar', 'no sé', 'ayúdeme', 'preguntas', 'primer paso'],
  workspace: ['clinician', 'nurse', 'social worker', 'case manager', 'peer worker', 'referral', 'handoff', 'provider',
    'profesional de salud', 'enfermería', 'trabajador social', 'derivación', 'personal'],
  overdose: ['od', 'narcan', 'naloxone', 'fentanyl', 'not breathing', 'unresponsive', 'won\'t wake up', 'blue lips', 'rescue breathing', '911',
    'sobredosis', 'naloxona', 'fentanilo', 'no respira', 'no despierta', 'inconsciente', 'labios azules'],
  crisis: ['988', 'suicide', 'suicidal', 'hotline', 'helpline', 'talk to someone', 'panic', 'depressed', 'hopeless', 'text line',
    'suicidio', 'línea de ayuda', 'hablar con alguien', 'pánico', 'deprimido', 'deprimida', 'sin esperanza'],
  'harm-reduction': ['narcan', 'naloxone', 'fentanyl', 'fentanyl test strips', 'test strips', 'safer use', 'syringes', 'needle exchange', 'ssp', 'never use alone', 'xylazine',
    'reducción de daños', 'naloxona', 'fentanilo', 'tiras reactivas', 'jeringas', 'agujas', 'uso más seguro'],
  navigator: ['asam', 'level of care', 'what care do i need', 'detox', 'withdrawal', 'self-check',
    'nivel de atención', 'qué atención necesito', 'desintoxicación', 'abstinencia', 'autoevaluación'],
  assessment: ['cows', 'ciwa', 'withdrawal', 'detox', 'dope sick', 'the shakes', 'abstinencia', 'desintoxicación', 'síntomas', 'temblores'],
  medications: ['suboxone', 'buprenorphine', 'subutex', 'sublocade', 'brixadi', 'methadone', 'naltrexone', 'vivitrol', 'narcan', 'mat', 'moud', 'pills', 'prescription', 'pharmacist',
    'medicamentos', 'buprenorfina', 'metadona', 'naltrexona', 'naloxona', 'pastillas', 'receta', 'farmacéutico'],
  health: ['doctor', 'clinic', 'free clinic', 'sliding fee', 'no insurance', 'uninsured', 'va', 'ihs', 'hospital', 'emergency room', 'mental health', 'therapist', 'counseling',
    'médico', 'clínica', 'clínica gratuita', 'sin seguro', 'salud mental', 'terapia', 'consejería'],
  plan: ['safety plan', 'first visit', 'intake', 'appointment', 'relapse', 'print', 'plan de seguridad', 'primera cita', 'cita', 'recaída', 'imprimir'],
  support: ['family', 'friend', 'loved one', 'aa', 'na', 'smart recovery', 'meetings', 'peer support', 'sober living', 'recovery housing', 'al-anon', 'nar-anon',
    'familia', 'amigo', 'ser querido', 'reuniones', 'apoyo entre pares', 'vivienda de recuperación'],
  'choosing-care': ['quality', 'scam', 'patient brokering', 'red flags', 'good rehab', 'accreditation', 'calidad', 'estafa', 'señales de alerta', 'acreditación'],
  'post-overdose': ['after an overdose', 'survived an overdose', 'nonfatal overdose', 'follow-up', 'naloxone', 'después de una sobredosis', 'sobrevivió', 'seguimiento'],
  readiness: ['ready to quit', 'quit', 'cut back', 'cut down', 'motivation', 'stages of change', 'not sure i want to stop',
    'dejar', 'reducir', 'motivación', 'listo para cambiar', 'lista para cambiar'],
  states: ['my state', 'medicaid', 'local', 'county', 'territory', 'puerto rico', 'mi estado', 'condado', 'territorio'],
  perinatal: ['pregnant', 'pregnancy', 'expecting', 'baby', 'newborn', 'postpartum', 'breastfeeding', 'prenatal', 'mom', 'mother',
    'embarazada', 'embarazo', 'bebé', 'recién nacido', 'posparto', 'lactancia', 'mamá', 'madre'],
  adolescent: ['teen', 'teenager', 'youth', 'kid', 'child', 'son', 'daughter', 'minor', 'school', 'young adult', 'under 18',
    'adolescente', 'joven', 'niño', 'hijo', 'hija', 'menor de edad', 'escuela'],
  veterans: ['veteran', 'vet', 'military', 'va', 'tricare', 'service member', 'ptsd', 'veterano', 'veterana', 'militar', 'tept'],
  reentry: ['jail', 'prison', 'incarceration', 'released', 'getting out', 'parole', 'probation', 'court', 'drug court', 'criminal record',
    'cárcel', 'prisión', 'salir de la cárcel', 'libertad condicional', 'tribunal', 'antecedentes penales'],
  'older-adults': ['senior', 'elderly', 'older adult', 'medicare', 'retired', 'aging parent', 'grandparent',
    'persona mayor', 'adulto mayor', 'anciano', 'jubilado', 'abuelo', 'abuela'],
  'tribal-health': ['native', 'native american', 'american indian', 'alaska native', 'indigenous', 'ihs', 'tribe', 'tribal',
    'nativo', 'nativa', 'indígena', 'tribu'],
  'lgbtq-care': ['gay', 'lesbian', 'bisexual', 'trans', 'transgender', 'queer', 'nonbinary', 'gender affirming', 'chemsex',
    'lesbiana', 'transgénero', 'no binario', 'afirmación de género'],
  'wound-care': ['wound', 'abscess', 'infection', 'sore', 'skin infection', 'cellulitis', 'xylazine wound',
    'herida', 'absceso', 'infección', 'llaga', 'infección de la piel'],
  'rural-health': ['rural', 'farm', 'small town', 'far from a clinic', 'no ride', 'transportation', 'telehealth', 'frontier',
    'zona rural', 'campo', 'pueblo', 'transporte', 'telesalud'],
  'disability-care': ['disability', 'deaf', 'hard of hearing', 'blind', 'low vision', 'autism', 'autistic', 'wheelchair', 'asl', 'sign language', 'sensory',
    'discapacidad', 'sordo', 'sorda', 'ciego', 'ciega', 'autismo', 'silla de ruedas', 'lengua de señas'],
  'street-medicine': ['homeless', 'unhoused', 'houseless', 'shelter', 'living outside', 'sleeping outside', 'street', 'encampment', 'no home',
    'sin hogar', 'sin techo', 'refugio', 'albergue', 'calle', 'vivir en la calle'],
  'immigrant-health': ['immigrant', 'undocumented', 'interpreter', 'translator', 'language help', 'refugee', 'asylum', 'daca', 'spanish',
    'inmigrante', 'indocumentado', 'intérprete', 'idioma', 'refugiado', 'asilo', 'español'],
  'stimulant-care': ['meth', 'crystal', 'ice', 'speed', 'cocaine', 'coke', 'crack', 'adderall', 'uppers', 'tweaking', 'overamping', 'stimulants',
    'metanfetamina', 'cristal', 'cocaína', 'perico', 'estimulantes'],
  'workplace-rights': ['work', 'job', 'employer', 'boss', 'fmla', 'ada', 'medical leave', 'fired', 'nursing license', 'professional license',
    'trabajo', 'empleo', 'empleador', 'jefe', 'licencia médica', 'despido'],
  'chronic-pain': ['pain', 'pain pills', 'opioids', 'oxy', 'oxycodone', 'percocet', 'hydrocodone', 'vicodin', 'taper',
    'dolor', 'analgésicos', 'opioides', 'oxicodona', 'pastillas para el dolor'],
  'alcohol-care': ['alcohol', 'drinking', 'drink', 'drunk', 'beer', 'wine', 'liquor', 'alcoholism', 'shakes', 'dts', 'delirium tremens', 'detox', 'naltrexone', 'acamprosate', 'antabuse', 'disulfiram',
    'beber', 'bebida', 'tomar', 'borracho', 'cerveza', 'vino', 'licor', 'alcoholismo', 'temblores', 'desintoxicación'],
  'family-support': ['family', 'parent', 'spouse', 'partner', 'loved one', 'craft', 'al-anon', 'boundaries', 'enabling',
    'familia', 'padres', 'pareja', 'esposo', 'esposa', 'ser querido', 'límites'],
  'adulterant-care': ['xylazine', 'tranq', 'fentanyl', 'nitazenes', 'medetomidine', 'cut', 'contaminated', 'test strips', 'tranq wounds',
    'xilacina', 'fentanilo', 'nitazenos', 'medetomidina', 'adulterado', 'tiras reactivas'],
  'methadone-access': ['methadone', 'methadone clinic', 'otp', 'take-homes', 'dosing', 'metadona', 'clínica de metadona', 'dosis para llevar'],
  'dual-diagnosis': ['mental health', 'depression', 'anxiety', 'bipolar', 'schizophrenia', 'ptsd', 'psychiatrist', 'co-occurring',
    'salud mental', 'depresión', 'ansiedad', 'bipolar', 'esquizofrenia', 'psiquiatra'],
  'polysubstance-care': ['mixing drugs', 'mixing', 'combining', 'alcohol and pills', 'benzos and opioids', 'speedball', 'goofball',
    'mezclar drogas', 'mezclar', 'combinar'],
  'nightlife-care': ['party', 'club', 'rave', 'festival', 'molly', 'ecstasy', 'mdma', 'ketamine', 'ghb', 'poppers',
    'fiesta', 'discoteca', 'éxtasis', 'ketamina'],
  'sleep-care': ['sleep', 'insomnia', "can't sleep", 'nightmares', 'sleeping pills', 'dormir', 'insomnio', 'no puedo dormir', 'pesadillas', 'sueño'],
  'dental-care': ['teeth', 'tooth', 'dentist', 'dental', 'meth mouth', 'mouth', 'cavities', 'dientes', 'muela', 'dentista', 'boca', 'caries'],
  'cannabis-care': ['weed', 'marijuana', 'pot', 'cannabis', 'thc', 'dabs', 'wax', 'edibles', 'vomiting', 'chs', 'hyperemesis',
    'marihuana', 'mota', 'hierba', 'comestibles', 'vómitos'],
  'viral-hepatitis': ['hep c', 'hcv', 'hepatitis', 'hiv', 'prep', 'pep', 'liver', 'testing', 'vih', 'hígado', 'prueba'],
  'nicotine-care': ['smoking', 'cigarettes', 'vape', 'vaping', 'juul', 'zyn', 'nicotine pouches', 'chew', 'quit smoking', 'nicotine patch', 'chantix',
    'fumar', 'cigarrillos', 'vapear', 'dejar de fumar', 'parche de nicotina'],
  'benzodiazepine-care': ['xanax', 'valium', 'klonopin', 'ativan', 'benzos', 'bars', 'alprazolam', 'diazepam', 'clonazepam', 'lorazepam', 'taper',
    'benzodiacepinas', 'pastillas para la ansiedad'],
  'adhd-care': ['adhd', 'add', 'adderall', 'ritalin', 'vyvanse', 'focus', 'attention', 'tdah', 'déficit de atención', 'concentración'],
  'toxicology-triage': ['agitation', 'psychosis', 'delirium', 'poisoning', 'intoxicated', 'de-escalation', 'agitación', 'psicosis', 'intoxicación', 'envenenamiento'],
  'hospital-care': ['hospital', 'er', 'emergency room', 'surgery', 'ama', 'leaving against medical advice', 'discharge',
    'urgencias', 'sala de emergencias', 'cirugía', 'alta voluntaria'],
  'needle-exposure': ['needle stick', 'needlestick', 'poked', 'sharps', 'used needle', 'pep', 'hiv exposure', 'pinchazo', 'aguja usada', 'exposición al vih'],
  'sexual-health': ['sex', 'std', 'sti', 'condoms', 'prep', 'pep', 'doxy', 'plan b', 'morning after pill', 'birth control', 'hiv',
    'sexo', 'ets', 'its', 'condones', 'anticonceptivos', 'píldora del día después', 'vih'],
  'novel-substances': ['kratom', 'tianeptine', 'zaza', 'gas station heroin', 'phenibut', '7-oh', 'dxm', 'loperamide', 'tianeptina', 'fenibut', 'loperamida'],
  'gabapentinoid-care': ['gabapentin', 'neurontin', 'pregabalin', 'lyrica', 'gabapentina', 'pregabalina'],
  'psychedelic-care': ['lsd', 'acid', 'mushrooms', 'shrooms', 'psilocybin', 'dmt', 'bad trip', 'hppd', 'hongos', 'ácido', 'psilocibina', 'mal viaje'],
  'ghb-care': ['ghb', 'gbl', 'liquid ecstasy', 'bdo', 'chemsex', 'éxtasis líquido'],
  'vein-care': ['veins', 'injecting', 'shooting', 'iv', 'missed shot', 'artery', 'filter', 'venas', 'inyectarse', 'inyección', 'arteria'],
  'inhalant-care': ['huffing', 'whippets', 'nitrous', 'laughing gas', 'poppers', 'aerosol', 'solvents', 'inhalantes', 'gas de la risa', 'óxido nitroso', 'solventes'],
  'ketamine-care': ['ketamine', 'special k', 'bladder', 'k-cramps', 'ketamina', 'vejiga'],
  'weather-care': ['cold', 'freezing', 'hypothermia', 'frostbite', 'heat', 'heat stroke', 'sleeping outside', 'winter', 'summer',
    'frío', 'hipotermia', 'congelación', 'calor', 'golpe de calor', 'invierno', 'verano'],
  'liver-care': ['liver', 'tylenol', 'acetaminophen', 'cirrhosis', 'jaundice', 'yellow skin', 'hígado', 'paracetamol', 'acetaminofén', 'cirrosis', 'ictericia'],
  'renal-care': ['kidney', 'kidneys', 'rhabdo', 'dialysis', 'dark urine', 'riñón', 'riñones', 'diálisis', 'rabdomiólisis', 'orina oscura'],
  'pulmonary-care': ['lungs', 'breathing', 'crack lung', 'cough', 'smoking', 'pneumonia', 'pulmones', 'respirar', 'tos', 'neumonía'],
  'neurology-care': ['brain', 'brain injury', 'brain damage', 'memory', 'seizure', 'hypoxia', 'cerebro', 'lesión cerebral', 'memoria', 'convulsión'],
  'metabolic-care': ['diabetes', 'blood sugar', 'low blood sugar', 'ketoacidosis', 'dka', 'adrenal', 'azúcar en la sangre', 'cetoacidosis', 'suprarrenal'],
  'gi-care': ['stomach', 'stomach pain', 'belly pain', 'constipation', 'pancreatitis', 'ischemic colitis', 'mesenteric ischemia', 'pamora', 'boerhaave', 'body packing', 'estómago', 'dolor de estómago', 'estreñimiento', 'pancreatitis', 'colitis'],
  'hematology-care': ['blood', 'bleeding', 'anemia', 'platelets', 'inr', 'levamisole', 'brodifacoum', 'superwarfarin', 'k2', 'spice', 'g6pd', 'methemoglobinemia', 'methylene blue', 'ttp', 'tma', 'zieve', 'sangre', 'sangrado', 'plaquetas', 'levamisol'],
  'orthopedic-care': ['back pain', 'spine', 'epidural abscess', 'osteomyelitis', 'bone infection', 'septic arthritis', 'joint infection', 'collarbone', 'psoas abscess', 'pyomyositis', 'gas gangrene', 'oviva', 'dalbavancin', 'osteonecrosis', 'avn', 'dolor de espalda', 'columna', 'osteomielitis', 'artritis séptica'],
  'ocular-care': ['eye', 'eyes', 'vision', 'blindness', 'blurry vision', 'floaters', 'methanol', 'moonshine', 'endophthalmitis', 'crack cornea', 'glaucoma', 'topiramate', 'poppers', 'maculopathy', 'crao', 'ojo', 'ojos', 'visión', 'ceguera', 'metanol', 'endoftalmitis'],
  'urology-care': ['urology', 'priapism', 'erection', 'trazodone', 'fournier', 'fournier gangrene', 'scrotum', 'perineum', 'urinary retention', 'bladder', 'foley', 'catheter', 'paraphimosis', 'cock ring', 'constriction ring', 'hydronephrosis', 'ketamine bladder', 'urología', 'priapismo', 'erección', 'retención urinaria', 'vejiga', 'sonda', 'parafimosis'],
  'ent-care': ['ent', 'ear nose throat', 'ludwig', 'ludwig angina', 'lemierre', 'jugular', 'neck abscess', 'stridor', 'epiglottitis', 'chore boy', 'septal perforation', 'nosebleed', 'epistaxis', 'sinus', 'straw', 'naegleria', 'otorrinolaringología', 'angina de ludwig', 'tabique nasal', 'epiglotitis', 'estridor'],
  'dermatology-care': ['skin', 'rash', 'dermatology', 'xylazine wound', 'tranq wound', 'eschar', 'stevens-johnson', 'sjs', 'ten', 'nikolsky', 'lamotrigine', 'dress syndrome', 'vancomycin rash', 'anthrax', 'wound botulism', 'nicolau', 'meth mites', 'formication', 'piel', 'dermatología', 'escara', 'xilacina', 'botulismo', 'ántrax'],
  'cardiology-care': ['cardiology', 'heart', 'chest pain', 'heart attack', 'cocaine chest pain', 'beta blocker', 'unopposed alpha', 'qrs', 'sodium bicarbonate', 'cocaethylene', 'torsades', 'qtc', 'magnesium', 'aortic dissection', 'takotsubo', 'meth cardiomyopathy', 'pulmonary hypertension', 'pah', 'cardiología', 'corazón', 'dolor de pecho', 'infarto', 'bicarbonato', 'disección aórtica'],
  'oncology-palliative': ['oncology', 'cancer', 'cancer pain', 'palliative', 'palliative care', 'hospice', 'sickle cell', 'vaso-occlusive', 'voc', 'acute chest syndrome', 'neurotoxicity', 'myoclonus', 'allodynia', 'cipn', 'duloxetine', 'mucositis', 'cord compression', 'hypercalcemia', 'fentanyl patch', 'oncología', 'cáncer', 'dolor por cáncer', 'cuidados paliativos', 'células falciformes', 'drepanocitosis', 'parche de fentanilo'],
  'pediatric-exposures': ['pediatric', 'child', 'toddler', 'baby', 'poison control', '1-800-222-1222', 'accidental ingestion', 'suboxone film', 'methadone ingestion', 'counterfeit pill', 'edible', 'gummy', 'gummies', 'vape juice', 'nicotine pouch', 'lockbox', 'safe storage', 'pediátrico', 'niño', 'bebé', 'intoxicación infantil', 'centro de toxicología', 'ingestión accidental', 'gominola', 'almacenamiento seguro'],
  'geriatric-care': ['geriatric', 'older adults', 'elderly', 'beers criteria', 'polypharmacy', 'anticholinergic', 'acb score', 'fall risk', 'steadi', 'hip fracture', 'delirium', 'dementia', 'moud', 'oic', 'constipation', 'fecal impaction', 'caregiver', 'geriátrico', 'ancianos', 'criterios beers', 'polifarmacia', 'anticolinérgico', 'riesgo de caídas', 'delirio', 'demencia', 'estreñimiento', 'cuidador'],
  'obstetric-emergencies': ['obstetrics', 'obstetric emergency', 'preeclampsia', 'eclampsia', 'placental abruption', 'split dosing', 'third trimester', 'cesarean', 'c-section', 'nalbuphine', 'nubain', 'butorphanol', 'stadol', 'postpartum hemorrhage', 'methergine', 'nows', 'nas', 'eat sleep console', 'esc', 'fourth trimester', 'obstetricia', 'preeclampsia', 'desprendimiento de placenta', 'cesárea', 'hemorragia posparto', 'comer dormir consolar'],
  'icu-perioperative': ['icu', 'critical care', 'intubation', 'rsi', 'ventilator', 'succinylcholine', 'rocuronium', 'dexmedetomidine', 'precedex', 'propofol', 'pris', 'propylene glycol', 'lorazepam drip', 'anesthesia', 'perioperative', 'vivitrol surgery', 'extubation', 'malignant hyperthermia', 'nms', 'dantrolene', 'cyproheptadine', 'cuidados intensivos', 'uci', 'intubación', 'ventilador', 'anestesia', 'succinilcolina', 'propofol'],
  'endocarditis-care': ['heart infection', 'heart valve', 'endocarditis', 'fever', 'infección del corazón', 'válvula del corazón', 'fiebre'],
  'burn-toxicology': ['burns', 'fire', 'chemical burn', 'hydrofluoric acid', 'ammonia', 'bho', 'butane blast', 'cyanide', 'smoke inhalation', 'carbon monoxide', 'scald', 'capsaicin', 'fluid resuscitation', 'parkland', 'aba', 'quemaduras', 'fuego', 'quemadura química', 'ácido fluorhídrico', 'amoníaco', 'cianuro', 'inhalación de humo', 'monóxido de carbono'],
  embed: ['widget', 'embed', 'iframe', 'badge', 'seal', 'partner', 'html snippet', 'integration', 'banner', 'integración', 'código de inserción', 'insignia', 'sello'],
  outreach: ['pocket card', 'handout', 'street outreach', 'printable', 'wallet card', 'field guide', 'tarjeta de bolsillo', 'folleto', 'materiales de campo', 'imprimible', 'promotores'],
  'encampment-medicine': ['encampment', 'homeless', 'street medicine', 'zoonosis', 'bartonella', 'trench fever', 'body lice', 'typhus', 'rickettsia', 'leptospirosis', 'scabies', 'norwegian scabies', 'crusted scabies', 'ivermectin', 'rabies', 'animal bite', 'dog bite', 'tetanus', 'campamento', 'personas sin hogar', 'zoonosis', 'piojos', 'tifo', 'sarna', 'rabia', 'mordedura'],
  'street-trauma': ['trauma', 'bleeding', 'hemorrhage', 'tourniquet', 'stop the bleed', 'cat tourniquet', 'windlass', 'wound packing', 'hemostatic gauze', 'quikclot', 'arterial bleed', 'spurting', 'knife wound', 'stab', 'gunshot', 'hemorragia', 'torniquete', 'sangrado', 'gasa hemostática', 'herida'],
  'fhir-export': ['fhir', 'hl7', 'interoperability', 'ehr', 'epic', 'cerner', 'referral', 'bundle', 'servicerequest', 'consent', '42 cfr part 2', 'ndjson', 'json export', 'interoperabilidad', 'derivación', 'historia clínica'],
  'toxic-alcohol': ['methanol', 'ethylene glycol', 'antifreeze', 'isopropanol', 'rubbing alcohol', 'wood alcohol', 'moonshine', 'fomepizole', 'antidote', 'osmolal gap', 'anion gap', 'snowstorm vision', 'blindness', 'hemodialysis', 'leucovorin', 'metanol', 'etilenglicol', 'anticongelante', 'isopropanol', 'ceguera', 'hemodiálisis'],
  'mass-overdose-mci': ['mass overdose', 'cluster', 'spike', 'contaminated batch', 'adulterant', 'carfentanil', 'nitazene', 'isotonitazene', 'xylazine', 'medetomidine', 'wooden chest', 'bvm', 'salt triage', 'mci', 'sobredosis masiva', 'brote', 'lote contaminado', 'xilacina', 'tórax de madera', 'triaje'],
  'moud-directive': ['directive', 'rights', 'wallet card', 'pass', 'qr code', 'methadone continuation', 'buprenorphine continuation', 'hospital rights', 'ada title ii', 'dea 1306.07', 'pain on moud', 'directiva', 'derechos', 'tarjeta de bolsillo', 'metadona en hospital', 'buprenorfina en hospital'],
  'nsti-wound-staging': ['necrotizing fasciitis', 'nsti', 'flesh eating', 'lrinec', 'pocus', 'crepitus', 'dishwater pus', 'bullae', 'gas', 'soft tissue infection', 'xylazine ulcer', 'tranq wound', 'tendon', 'santyl', 'fascitis necrosante', 'bacteria carnívora', 'úlceras por xilacina', 'tendón', 'empedrado'],
  'pediatric-ingestion-decon': ['pediatric', 'child', 'toddler', 'accidental ingestion', 'one pill can kill', 'poisoning', 'activated charcoal', 'contraindication', 'whole bowel irrigation', 'wbi', 'pediatric naloxone', 'swallowed pill', 'ingesta pediátrica', 'niño', 'intoxicación', 'carbón activado', 'naloxona pediátrica'],
  'carceral-moud-reentry': ['carceral', 'jail', 'prison', 'booking', 'reentry', 'release', 'moud in jail', 'methadone in jail', 'buprenorphine in prison', 'section 1115', 'medicaid waiver', 'gate exit', 'bridge prescription', 'ada title ii', 'prisión', 'cárcel', 'reingreso', 'excarcelación', 'metadona en prisión'],
  'disaster-moud-climate': ['disaster', 'wildfire', 'smoke', 'pm2.5', 'moud in disaster', 'take-home', 'guest dosing', 'mmu', 'mobile clinic', 'flood', 'leptospirosis', 'tetanus', 'trench foot', 'corsi-rosenthal', 'n95', 'desastre', 'incendio forestal', 'humo', 'metadona en desastres', 'inundación'],
  'movement-disorders-eps': ['movement disorder', 'eps', 'dystonia', 'oculogyric crisis', 'torticollis', 'stridor', 'choreoathetosis', 'meth dance', 'crack dancing', 'tweaking', 'akathisia', 'parkinsonism', 'nms', 'serotonin syndrome', 'hunter criteria', 'benztropine', 'diphenhydramine', 'haloperidol', 'trastorno del movimiento', 'distonía', 'acatisia'],
  'fungal-opportunistic-care': ['fungal', 'deep mycosis', 'blastomycosis', 'valley fever', 'coccidioidomycosis', 'histoplasmosis', 'aspergillus', 'mucor', 'mucormycosis', 'verrucous plaque', 'pyoderma gangrenosum', 'amphotericin b', 'itraconazole', 'voriconazole', 'azole methadone interaction', 'cyp3a4', 'qtc', 'micosis', 'hongo profundo', 'blastomicosis'],
  'inhalant-toxicology': ['inhalant', 'whippets', 'whippits', 'galaxy gas', 'nitrous oxide', 'n2o', 'duster', 'air duster', 'difluoroethane', 'toluene', 'solvent', 'sniffing', 'sudden sniffing death', 'ssds', 'folate trap', 'subacute combined degeneration', 'scd', 'lhermitte', 'inhalante', 'óxido nitroso', 'gas de la risa'],
  'adulterant-heavy-metals': ['adulterant', 'medetomidine', 'dexmedetomidine', 'tranq', 'atipamezole', 'brodifacoum', 'superwarfarin', 'spice', 'k2', 'bleeding', 'lead', 'plumbism', 'lead colic', 'wrist drop', 'dimercaprol', 'bal', 'succimer', 'edta', 'adulterante', 'medetomidina', 'veneno para ratas'],
  'peri-overdose-pulmonary': ['pulmonary', 'ncpe', 'pulmonary edema', 'non-cardiogenic', 'pink frothy sputum', 'peep', 'furosemide', 'mendelson', 'chemical pneumonitis', 'aspiration', 'crack lung', 'diffuse alveolar hemorrhage', 'dah', 'hemoptysis', 'edema pulmonar', 'esputo rosado', 'pulmón de crack'],
  'cardiogenic-toxin-hiet': ['cardiogenic', 'calcium channel blocker', 'beta blocker', 'hiet', 'high dose insulin', 'euglycemia', 'amlodipine', 'diltiazem', 'verapamil', 'metoprolol', 'atenolol', 'propranolol', 'intralipid', 'lipid emulsion', 'calcium chloride', 'glucagon', 'hypoglycemia', 'hypokalemia', 'bloqueador de canales de calcio', 'betabloqueante', 'insulina a dosis altas'],
  'wooden-chest-rigidity': ['wooden chest', 'chest wall rigidity', 'fimr', 'fentanyl rigidity', 'stiff chest', 'airway rescue', 'bvm failure', 'rocuronium', 'vecuronium', 'succinylcholine contraindication', 'bag valve mask failure', 'intubation', 'peep', 'rigidez torácica', 'tórax de madera', 'rigidez por fentanilo', 'vía aérea'],
  'hyperthermic-toxidrome': ['hyperthermia', 'bath salts', 'flakka', 'synthetic cathinone', 'a-pvp', 'methamphetamine', 'excited delirium', 'hyperpyrexia', 'ice water immersion', 'chemical restraint', 'midazolam', 'ketamine', 'rhabdomyolysis', 'antipyretic contraindication', 'physical restraint prohibition', 'hipertermia', 'sales de baño', 'inmersión en agua con hielo'],
  'salicylate-nsaid-tox': ['salicylate', 'aspirin', 'asa', 'wintergreen', 'methyl salicylate', 'pepto bismol', 'bismuth subsalicylate', 'nsaid', 'ibuprofen', 'urine alkalinization', 'sodium bicarbonate', 'neuroglycopenia', 'hemodialysis', 'salicilato', 'aspirina', 'gaulteria', 'alcalinización urinaria', 'hemodiálisis'],
  'mood-stabilizer-tox': ['lithium', 'valproate', 'depakote', 'divalproex', 'hyperammonemia', 'ammonia', 'carnitine', 'levocarnitine', 'meropenem', 'lamotrigine', 'lamictal', 'sjs', 'nephrogenic diabetes insipidus', 'litio', 'valproato', 'amonio', 'carnitina', 'lamotrigina'],
  'antimuscarinic-toxidrome': ['anticholinergic', 'antimuscarinic', 'diphenhydramine', 'benadryl', 'sleep aid', 'sleepy powder', 'datura', 'scopolamine', 'jimsonweed', 'physostigmine', 'rivastigmine', 'urinary retention', 'qrs sodium bicarbonate', 'difenhidramina', 'anticolinérgico', 'escopolamina', 'fisostigmina', 'retención urinaria'],
  'recovery-support': ['sober living', 'sober house', 'recovery housing', 'recovery residence', 'halfway house', 'oxford house', 'peer coach', 'peer support', 'relapse', 'aftercare', 'after rehab',
    'vivienda sobria', 'casa de recuperación', 'recaída', 'coach de recuperación', 'apoyo entre pares', 'después del tratamiento'],
  'overdose-loss': ['grief', 'bereavement', 'died', 'death', 'loss', 'funeral', 'death certificate', 'toxicology', 'grasp', 'compassionate friends',
    'duelo', 'murió', 'muerte', 'pérdida', 'acta de defunción', 'toxicología'],
});

export const TOOL_CATALOG = Object.freeze(entries.map(([id, category, title, description, audiences]) => Object.freeze({
  id, path: `#/${id}`, category, titleKey: `tools.item.${id}.title`, title,
  descriptionKey: `tools.item.${id}.description`, description, audiences: Object.freeze(audiences),
  keywords: Object.freeze([...(TOOL_KEYWORDS[id] ?? [])]),
})));

// The dropdown groups related catalog categories so every topic can be reached
// from it. A new catalog category must be added to one of these groups
// (test/navigation.test.js checks this).
export const CATEGORY_GROUPS = Object.freeze([
  { id: 'emergency', key: 'tools.category.emergency', label: 'Urgent support', categories: ['emergency'] },
  { id: 'care', key: 'tools.category.care', label: 'Find and understand care', categories: ['care'] },
  { id: 'harm-reduction', key: 'tools.category.harmReduction', label: 'Stay safer (harm reduction)', categories: ['harm', 'harm-reduction'] },
  { id: 'health', key: 'tools.category.health', label: 'Physical health and medical guides', categories: ['health', 'clinical-support'] },
  { id: 'planning', key: 'tools.category.planning', label: 'Planning and support', categories: ['planning'] },
  { id: 'populations', key: 'tools.category.populations', label: 'Care for your circumstances', categories: ['populations'] },
].map((group) => Object.freeze({ ...group, categories: Object.freeze(group.categories) })));

export const categoryGroupFor = (category) => CATEGORY_GROUPS.find((group) => group.categories.includes(category)) ?? null;

// Short, touch-friendly pill & card-badge labels for each category group so
// chips wrap cleanly without horizontal overflow at 320px viewports.
const CATEGORY_PILL_META = Object.freeze({
  emergency: Object.freeze({ key: 'tools.pill.emergency', label: 'Urgent support', chipClass: 'chip-emergency' }),
  care: Object.freeze({ key: 'tools.pill.care', label: 'Find care', chipClass: 'chip-care' }),
  'harm-reduction': Object.freeze({ key: 'tools.pill.harmReduction', label: 'Stay safer', chipClass: 'chip-warn' }),
  health: Object.freeze({ key: 'tools.pill.health', label: 'Medical guides', chipClass: 'chip-primary' }),
  planning: Object.freeze({ key: 'tools.pill.planning', label: 'Plans & support', chipClass: 'chip-ok' }),
  populations: Object.freeze({ key: 'tools.pill.populations', label: 'By situation', chipClass: 'chip-secondary' }),
});

const POPULAR_SUGGESTIONS = Object.freeze([
  { id: 'naloxone', key: 'tools.suggestion.naloxone', label: 'Naloxone' },
  { id: 'buprenorphine', key: 'tools.suggestion.buprenorphine', label: 'Buprenorphine' },
  { id: 'methadone', key: 'tools.suggestion.methadone', label: 'Methadone' },
  { id: 'xylazine', key: 'tools.suggestion.xylazine', label: 'Xylazine' },
  { id: 'alcohol', key: 'tools.suggestion.alcohol', label: 'Alcohol' },
  { id: 'pregnancy', key: 'tools.suggestion.pregnancy', label: 'Pregnancy' },
  { id: 'housing', key: 'tools.suggestion.housing', label: 'Housing' },
].map(Object.freeze));

const initialState = () => ({ query: '', audience: 'all', category: 'all' });
let filters = initialState();
const resetListeners = new Set();
let activeKeydownCleanup = null;
export const getCareToolsState = () => ({ ...filters });
export function resetCareToolsState() {
  filters = initialState();
  for (const reset of resetListeners) reset();
}
/** Start the directory with a search typed elsewhere (home or not-found page). Memory only. */
export function setCareToolsQuery(query) {
  filters = { ...initialState(), query: String(query ?? '').slice(0, 200) };
}

export const normalizeSearchText = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const normalize = normalizeSearchText;

// A word matches when it appears in the topic's text; a plural ("teens",
// "wounds") also matches its singular.
const wordMatches = (text, word) => text.includes(word)
  || (word.length > 3 && word.endsWith('s') && text.includes(word.slice(0, -1)));

export function filterCareTools({ query = '', audience = 'all', category = 'all' } = {}) {
  const words = normalize(query).trim().split(/[\s,]+/).filter(Boolean);
  const group = CATEGORY_GROUPS.find((g) => g.id === category);
  const allowed = group ? group.categories : [category];
  return TOOL_CATALOG.filter((tool) => {
    if (audience !== 'all' && !tool.audiences.includes(audience)) return false;
    if (category !== 'all' && !allowed.includes(tool.category)) return false;
    const searchable = normalize([tool.title, tool.description, t(tool.titleKey, tool.title), t(tool.descriptionKey, tool.description), ...tool.keywords].join(' '));
    return words.every((word) => wordMatches(searchable, word));
  });
}

export function careToolsView({ meta } = {}) {
  // Only the most recently rendered directory needs a reset callback and '/' listener.
  resetListeners.clear();
  activeKeydownCleanup?.();
  activeKeydownCleanup = null;

  const search = h('input', { id: 'care-tools-search', type: 'search', value: filters.query,
    autocomplete: 'off', spellcheck: 'false', 'aria-describedby': 'care-tools-shortcut care-tools-privacy' });
  const audience = h('select', { id: 'care-tools-audience' },
    h('option', { value: 'all' }, t('tools.audience.all', 'Everyone')),
    h('option', { value: 'individual' }, t('tools.audience.individual', 'For me')),
    h('option', { value: 'supporter' }, t('tools.audience.supporter', 'Supporting someone')),
    h('option', { value: 'care-team' }, t('tools.audience.team', 'Healthcare and community workers')));
  const category = h('select', { id: 'care-tools-category' },
    h('option', { value: 'all' }, t('tools.category.all', 'All topics')),
    CATEGORY_GROUPS.map((group) => h('option', { value: group.id }, t(group.key, group.label))));
  audience.value = filters.audience;
  category.value = filters.category;
  const count = h('p', { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true', class: 'tools-count' });
  const list = h('div', { class: 'tools-grid', id: 'care-tools-results' });

  const pillDefs = [
    { id: 'all', key: 'tools.category.all', label: 'All topics' },
    ...CATEGORY_GROUPS.map((group) => {
      const metaEntry = CATEGORY_PILL_META[group.id];
      return { id: group.id, key: metaEntry?.key ?? group.key, label: metaEntry?.label ?? group.label };
    }),
  ];
  const categoryPills = pillDefs.map((item) => h('button', {
    type: 'button',
    class: 'preset tools-category-pill',
    dataset: { category: item.id },
    'aria-pressed': String(filters.category === item.id),
    onclick: () => {
      category.value = item.id;
      update();
    },
  }, t(item.key, item.label)));

  const suggestionEntries = POPULAR_SUGGESTIONS.map((item) => {
    const button = h('button', {
      type: 'button',
      class: 'preset tools-suggestion-chip',
      dataset: { suggestion: item.id },
      'aria-pressed': 'false',
      onclick: () => {
        const term = t(item.key, item.label);
        const isActive = normalize(search.value.trim()) === normalize(term);
        search.value = isActive ? '' : term;
        update();
      },
    }, t(item.key, item.label));
    return { ...item, button };
  });

  function syncControls() {
    for (const pill of categoryPills) {
      pill.setAttribute('aria-pressed', String(pill.dataset.category === filters.category));
    }
    const qNorm = normalize(filters.query.trim());
    for (const entry of suggestionEntries) {
      const term = t(entry.key, entry.label);
      const active = Boolean(qNorm) && qNorm === normalize(term);
      entry.button.setAttribute('aria-pressed', String(active));
    }
  }

  function show() {
    const tools = filterCareTools(filters);
    count.textContent = t('tools.count', '{n} tools and guides', { n: tools.length });
    clear(list);
    if (!tools.length) {
      list.append(h('p', { class: 'card' }, t('tools.empty', 'No tools match these filters. Try a broader word or clear the filters.')));
      return;
    }
    for (const tool of tools) {
      const group = categoryGroupFor(tool.category);
      const badgeMeta = group ? CATEGORY_PILL_META[group.id] : null;
      list.append(h('article', { class: 'card tool-card' },
        h('h2', null, h('a', { href: tool.path }, t(tool.titleKey, tool.title))),
        group && h('div', { class: 'chips' },
          h('span', { class: `chip ${badgeMeta?.chipClass ?? 'chip-secondary'} tool-category-badge` },
            t(badgeMeta?.key ?? group.key, badgeMeta?.label ?? group.label))),
        h('p', null, t(tool.descriptionKey, tool.description))));
    }
  }
  const update = () => {
    filters = { query: search.value.slice(0, 200), audience: audience.value, category: category.value };
    syncControls();
    show();
  };
  search.maxLength = 200;
  search.addEventListener('input', update);
  audience.addEventListener('change', update);
  category.addEventListener('change', update);
  const reset = () => {
    search.value = ''; audience.value = 'all'; category.value = 'all'; syncControls(); show();
  };
  resetListeners.add(reset);
  syncControls();
  show();

  const root = h('div', { class: 'view care-tools' },
    pageHeader(t('tools.title', 'Find the right tool for your next step'),
      t('tools.lede', 'Practical guides for your own care, supporting someone, or working with patients. Choose what is useful and skip the rest.')),
    emergencyCallout(),
    h('section', { class: 'card tools-filters no-print', 'aria-label': t('tools.filters', 'Filter care tools') },
      h('div', { class: 'field' },
        h('label', { for: 'care-tools-search' }, t('tools.search', 'Search tools and guides')),
        search,
        h('p', { id: 'care-tools-shortcut', class: 'help' }, t('tools.searchShortcut', 'Press / anytime to jump to search.'))),
      h('div', { class: 'field' }, h('label', { for: 'care-tools-audience' }, t('tools.audience', 'Who are you helping?')), audience),
      h('div', { class: 'field' }, h('label', { for: 'care-tools-category' }, t('tools.category', 'What would help?')), category),
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { resetCareToolsState(); search.focus(); } }, t('tools.clear', 'Clear filters')),
      h('p', { id: 'care-tools-privacy', class: 'small muted' }, t('tools.privacy', 'Search stays in this browser. It is not sent, saved, or added to the address bar. Quick exit clears it.'))),
    h('section', {
      class: 'hero-search tools-discovery no-print',
      'aria-label': t('tools.discovery.region', 'Quick topic filters and popular searches'),
    },
      h('div', { class: 'tools-discovery-group' },
        h('p', { class: 'label', id: 'care-tools-pills-label' }, t('tools.categoryPills.heading', 'Quick topic filter')),
        h('div', { class: 'presets tools-category-pills', role: 'group', 'aria-labelledby': 'care-tools-pills-label' }, categoryPills)),
      h('div', { class: 'tools-discovery-group' },
        h('p', { class: 'label', id: 'care-tools-suggestions-label' }, t('tools.suggestions.heading', 'Popular searches')),
        h('div', { class: 'presets tools-suggestion-chips', role: 'group', 'aria-labelledby': 'care-tools-suggestions-label' },
          suggestionEntries.map((entry) => entry.button)))),
    count, list, sourceContext({ meta }));

  const onKeydown = (e) => {
    if (!e || e.defaultPrevented || e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    const target = e.target;
    const tag = target?.tagName?.toUpperCase?.() ?? '';
    const editableAttr = target?.getAttribute?.('contenteditable');
    const editable = Boolean(
      target?.isContentEditable
      || editableAttr === ''
      || editableAttr === 'true'
      || editableAttr === 'plaintext-only',
    );
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || editable) return;
    e.preventDefault?.();
    search.focus?.();
  };

  const onDocumentKeydown = (e) => {
    if (root.isConnected === false) {
      cleanup();
      return;
    }
    onKeydown(e);
  };

  const cleanup = () => {
    if (typeof document?.removeEventListener === 'function') {
      document.removeEventListener('keydown', onDocumentKeydown);
    }
    if (activeKeydownCleanup === cleanup) activeKeydownCleanup = null;
  };

  root.addEventListener('keydown', onKeydown);
  if (typeof document?.addEventListener === 'function') {
    document.addEventListener('keydown', onDocumentKeydown);
    activeKeydownCleanup = cleanup;
  }

  return root;
}
