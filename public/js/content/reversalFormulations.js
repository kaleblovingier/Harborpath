/**
 * Evidence-Based Opioid Overdose Reversal Formulations & Clinical Management Protocols
 *
 * Clinical reference and decision-support module detailing pharmacology,
 * dosing, pharmacokinetics, receptor affinities, and post-reversal emergency care.
 *
 * Compiled in alignment with:
 * - SAMHSA Overdose Prevention and Response Toolkit (2023)
 * - American College of Medical Toxicology (ACMT) & AACT Clinical Guidance
 * - CDC Overdose Prevention & Clinical Guidelines on Xylazine and Stimulants (2024)
 * - FDA Product Labels (Narcan, Kloxxado, Opvee, Naloxone Injection USP)
 * - American Heart Association (AHA) CPR & ECC Opioid Guidelines
 */

/**
 * Detailed Evidence-Based Reversal Formulations
 */
export const REVERSAL_FORMULATIONS = {
  naloxone_nasal_4mg: {
    id: 'naloxone_nasal_4mg',
    brandName: 'Narcan / Generic Naloxone Nasal Spray',
    genericName: 'Naloxone Hydrochloride',
    deliveryRoute: 'Intranasal (IN)',
    routeCategory: 'intranasal',
    dose: '4 mg',
    doseValueMg: 4,
    volume: '0.1 mL',
    concentration: '40 mg/mL (4 mg in 0.1 mL per spray)',
    deviceType: 'Single-dose needle-free prefilled nasal spray',
    accessStatus: 'otc',
    accessLabel: 'Over-The-Counter (OTC) & Community Bystander Distribution',
    onsetMinutes: {
      min: 2,
      max: 3,
      text: '2–3 minutes',
    },
    eliminationHalfLifeMinutes: {
      min: 30,
      max: 90,
      text: '30–90 minutes (~1.5–2 hours terminal elimination phase for intranasal spray)',
      terminalHours: 1.5,
    },
    durationOfActionMinutes: {
      min: 30,
      max: 90,
      text: '30–90 minutes',
    },
    receptorPharmacology: {
      targetReceptor: 'Mu-opioid receptor (MOR)',
      action: 'Pure competitive antagonist',
      affinityKiNm: 1.5,
      receptorSelectivity: 'Mu > Kappa > Delta (Ki mu ~1–2 nM, kappa ~3–4 nM, delta ~25–50 nM)',
      intrinsicAgonistActivity: 0,
      mechanismDetails: 'Rapidly displaces full and partial opioid agonists from mu-opioid receptors in the central nervous system without producing intrinsic agonist or respiratory depressant effects.',
    },
    bioavailabilityPct: {
      min: 46,
      max: 54,
      text: '46%–54% (relative to intramuscular/intravenous injection)',
    },
    standardRedosingIntervalMinutes: {
      min: 2,
      max: 3,
      text: '2–3 minutes if no response or spontaneous respirations remain inadequate (<10–12 breaths/min)',
    },
    precipitatedWithdrawal: {
      riskLevel: 'moderate',
      severity: 'Moderate, transient acute precipitated withdrawal in opioid-dependent individuals',
      durationHours: '0.5–1.5 hours',
      clinicalFeatures: [
        'Diaphoresis, piloerection ("cold turkey"), rhinorrhea, lacrimation',
        'Nausea, abdominal cramping, and occasional emesis',
        'Tachycardia, mild-to-moderate systolic hypertension, pupillary dilation',
        'Restlessness, generalized body aches, irritability, and intense opioid craving',
      ],
      mitigationStrategy: 'Prioritize ventilation support (1 rescue breath every 5 seconds). Standard 4 mg delivers sufficient antagonism to restore spontaneous respirations while avoiding massive sympathetic receptor overshoot.',
    },
    targetIndications: [
      'First-line bystander & community emergency reversal of known or suspected opioid respiratory depression',
      'Restoration of adequate spontaneous respiratory effort in community, prehospital, and outpatient settings',
      'Universal distribution for Syringe Services Programs (SSPs), schools, public venues, and families',
    ],
    clinicalPearls: [
      'Clinical endpoint of reversal is restoring adequate spontaneous breathing (>10–12 breaths/min)—NOT waking someone up into sudden, combative withdrawal.',
      'Completely safe if opioids are absent: naloxone has zero pharmacological activity in individuals without opioids in their system and carries zero potential for misuse.',
      'Always support breathing with rescue breaths between doses while waiting the full 2–3 minutes for mucosal absorption.',
      'FDA-approved for Over-The-Counter (OTC) sale nationwide without a prescription.',
    ],
    evidenceSources: [
      { organization: 'FDA', title: 'FDA Approves First Over-the-Counter Naloxone Nasal Spray', year: 2023, url: 'https://www.fda.gov/news-events/press-announcements/fda-approves-first-over-counter-naloxone-nasal-spray' },
      { organization: 'SAMHSA', title: 'Overdose Prevention and Response Toolkit', year: 2023, url: 'https://library.samhsa.gov/product/overdose-prevention-response-toolkit/pep23-03-00-001' },
      { organization: 'AHA', title: 'Highlights of the AHA Guidelines for CPR and ECC: Opioid Overdose Response', year: 2020, url: 'https://cpr.heart.org/' },
    ],
  },

  naloxone_nasal_8mg: {
    id: 'naloxone_nasal_8mg',
    brandName: 'Kloxxado',
    genericName: 'Naloxone Hydrochloride',
    deliveryRoute: 'Intranasal (IN)',
    routeCategory: 'intranasal',
    dose: '8 mg',
    doseValueMg: 8,
    volume: '0.1 mL',
    concentration: '80 mg/mL (8 mg in 0.1 mL per spray)',
    deviceType: 'Single-dose needle-free prefilled nasal spray',
    accessStatus: 'rx_only',
    accessLabel: 'Prescription / Targeted First-Responder Distribution',
    onsetMinutes: {
      min: 2,
      max: 3,
      text: '2–3 minutes',
    },
    eliminationHalfLifeMinutes: {
      min: 30,
      max: 90,
      text: '30–90 minutes (~1.3–2.1 hours terminal phase in healthy adult volunteers)',
      terminalHours: 1.8,
    },
    durationOfActionMinutes: {
      min: 45,
      max: 90,
      text: '45–90 minutes',
    },
    receptorPharmacology: {
      targetReceptor: 'Mu-opioid receptor (MOR)',
      action: 'Pure competitive antagonist (high concentration)',
      affinityKiNm: 1.5,
      receptorSelectivity: 'Mu > Kappa > Delta (delivers ~2x plasma Cmax of 4 mg)',
      intrinsicAgonistActivity: 0,
      mechanismDetails: 'High-concentration competitive antagonism designed to overcome receptor blockade from high-potency synthetic opioids (e.g., fentanyl, carfentanil, nitazenes).',
    },
    bioavailabilityPct: {
      min: 45,
      max: 55,
      text: 'Delivers approximately double the peak plasma concentration (Cmax) and systemic exposure (AUC) of 4 mg nasal naloxone',
    },
    standardRedosingIntervalMinutes: {
      min: 2,
      max: 3,
      text: '2–3 minutes if no response or inadequate respiratory effort persists',
    },
    precipitatedWithdrawal: {
      riskLevel: 'high',
      severity: 'Severe, abrupt precipitated withdrawal with acute sympathetic surge and high complication risk',
      durationHours: '1–2 hours',
      clinicalFeatures: [
        'Massive sympathetic catecholamine surge (tachycardia >120 bpm, severe hypertensive crisis, profuse diaphoresis)',
        'Intractable emesis / vomiting with severe risk of pulmonary aspiration in a semi-conscious patient',
        'Flash non-cardiogenic pulmonary edema triggered by acute pulmonary capillary hydrostatic hypertension',
        'Severe delirium, combative agitation, hostility, and disorientation upon sudden emergence',
        'Extreme dysphoria driving immediate attempts to consume massive doses of street opioids to override blockade',
      ],
      mitigationStrategy: 'Position immediately into recovery position to protect airway against aspiration; prepare for combative emergence delirium; monitor for pulmonary edema; do not administer repeat doses if spontaneous breathing is established.',
    },
    targetIndications: [
      'Suspected overdose involving high-potency synthetic opioids (fentanyl, carfentanil, nitazene analogues)',
      'Situations where standard 4 mg dose failed to elicit adequate respiratory improvement after 2–3 minutes',
      'Law enforcement or first-responder deployment in mass-exposure synthetic opioid incidents',
    ],
    clinicalPearls: [
      'Clinical toxicology consensus (ACMT/AACT): Higher initial naloxone doses (8 mg) do not improve survival over standard 4 mg naloxone + rescue breathing, but significantly increase acute precipitated withdrawal complications.',
      'Higher milligram strength does NOT prolong elimination half-life: half-life remains short (30–90 minutes), so risk of renarconization from lipophilic synthetic fentanyl is not prevented.',
      'Airway protection is critical immediately after administration due to high incidence of sudden vomiting and aspiration.',
    ],
    evidenceSources: [
      { organization: 'FDA', title: 'FDA Approves Higher Dose Naloxone Nasal Spray (Kloxxado)', year: 2021, url: 'https://www.fda.gov/' },
      { organization: 'ACMT', title: 'ACMT Position Statement on Naloxone Dose and Route in the Era of Synthetic Opioids', year: 2020, url: 'https://www.acmt.net/' },
      { organization: 'AACT', title: 'American Academy of Clinical Toxicology Practice Guidance: Overdose Resuscitation', year: 2022, url: 'https://www.clintox.org/' },
    ],
  },

  nalmefene_nasal_3mg: {
    id: 'nalmefene_nasal_3mg',
    brandName: 'Opvee',
    genericName: 'Nalmefene Hydrochloride',
    deliveryRoute: 'Intranasal (IN)',
    routeCategory: 'intranasal',
    dose: '3 mg (2.7 mg nalmefene free base)',
    doseValueMg: 3,
    volume: '0.1 mL',
    concentration: '30 mg/mL (3 mg in 0.1 mL per spray)',
    deviceType: 'Single-dose needle-free prefilled nasal spray',
    accessStatus: 'rx_only',
    accessLabel: 'Prescription-Only (FDA Approved May 2023)',
    onsetMinutes: {
      min: 2,
      max: 5,
      text: '2–5 minutes (median Tmax ~15 minutes)',
    },
    eliminationHalfLifeMinutes: {
      min: 480,
      max: 840,
      text: '~11.4 hours (range 8–14 hours)',
      terminalHours: 11.4,
    },
    durationOfActionMinutes: {
      min: 480,
      max: 720,
      text: '8–12+ hours of clinically meaningful receptor blockade',
    },
    receptorPharmacology: {
      targetReceptor: 'Mu-opioid receptor (MOR)',
      action: 'Long-acting competitive antagonist with partial kappa activity',
      affinityKiNm: 0.3,
      receptorSelectivity: 'Mu (Ki ~0.24–0.4 nM, ~4–5x higher affinity than naloxone), Kappa partial agonist/antagonist, Delta antagonist',
      intrinsicAgonistActivity: 0,
      mechanismDetails: '6-methylene analog of naltrexone with slow receptor dissociation kinetics and high mu-receptor affinity, maintaining competitive blockade for over 8–12 hours.',
    },
    bioavailabilityPct: {
      min: 70,
      max: 80,
      text: '70%–80% (substantially higher systemic bioavailability than intranasal naloxone)',
    },
    standardRedosingIntervalMinutes: {
      min: 2,
      max: 5,
      text: '2–5 minutes if no clinical response or inadequate breathing persists',
    },
    precipitatedWithdrawal: {
      riskLevel: 'severe_prolonged',
      severity: 'Extreme, refractory, prolonged precipitated withdrawal lasting 12–24+ hours',
      durationHours: '12–24+ hours',
      clinicalFeatures: [
        'Protracted nausea, projectile vomiting, intractable diarrhea, and severe abdominal cramping lasting 12–24+ hours',
        'Severe neuropsychiatric dysphoria, panic, terror, and heightened suicidality mediated by kappa-receptor modulation',
        'Prolonged hyperadrenergic storm: sustained tachycardia, severe hypertension, tremors, diaphoresis, and dehydration',
        'Complete refractory resistance to conventional opioid analgesics or buprenorphine palliation',
        'High risk of lethal delayed overdose if patient attempts repeated large-dose street opioid consumption after discharge',
      ],
      mitigationStrategy: 'Requires immediate emergency EMS transport and 12–24 hour hospital observation. Provide aggressive supportive medical care (IV antiemetics, clonidine/alpha-2 agonists for sympathetic tone, IV fluid rehydration). Emphatically counsel patient that taking opioids will not relieve withdrawal and will cause delayed fatal toxicity.',
    },
    targetIndications: [
      'Emergency reversal of known or suspected opioid overdose caused by natural or synthetic opioids in adults and adolescents aged 12 and older',
      'Specialized emergency medical services (EMS) and emergency department environments where prolonged opioid antagonism is desired',
    ],
    clinicalPearls: [
      'Critical clinical caveat: Because nalmefene has an 11.4-hour half-life, precipitated withdrawal cannot be quickly reversed and persists for 12–24+ hours, creating severe clinical distress.',
      'Toxicology consensus (ACMT/AACT): Harm reduction specialists caution against routine community bystander deployment because prolonged agonizing withdrawal triggers severe medical refusal and trauma.',
      'Unlike naloxone (which wears off in 60–90 minutes, enabling buprenorphine induction), nalmefene blocks opioid receptors for over 12–24 hours, completely delaying initiation of life-saving MOUD.',
    ],
    evidenceSources: [
      { organization: 'FDA', title: 'FDA Approves Opvee (Nalmefene Nasal Spray) for Opioid Overdose Reversal', year: 2023, url: 'https://www.fda.gov/' },
      { organization: 'ACMT', title: 'ACMT & AACT Position Statement on Nalmefene vs Naloxone in the Opioid Overdose Epidemic', year: 2023, url: 'https://www.acmt.net/' },
      { organization: 'Nelson et al.', title: 'Pharmacokinetics and Safety of Intranasal Nalmefene (Opvee) in Healthy Volunteers', year: 2023, url: 'https://pubmed.ncbi.nlm.nih.gov/' },
    ],
  },

  naloxone_injectable_0_4mg: {
    id: 'naloxone_injectable_0_4mg',
    brandName: 'Generic Naloxone HCl Injection, USP (Vial / Ampule 0.4 mg/mL)',
    genericName: 'Naloxone Hydrochloride',
    deliveryRoute: 'Intramuscular (IM) / Subcutaneous (SC) / Intravenous (IV)',
    routeCategory: 'injectable',
    dose: '0.4 mg',
    doseValueMg: 0.4,
    volume: '1.0 mL',
    concentration: '0.4 mg/mL',
    deviceType: 'Single-dose glass vial or ampule with 3 mL 22–25G 1–1.5 inch safety syringe',
    accessStatus: 'ssp_community',
    accessLabel: 'Syringe Services Programs (SSP) / Harm Reduction Outreach / Clinical EMS',
    onsetMinutes: {
      min: 2,
      max: 5,
      text: '2–5 minutes (IM/SC), <1–2 minutes (IV)',
    },
    eliminationHalfLifeMinutes: {
      min: 30,
      max: 90,
      text: '30–90 minutes (~60 minutes average parenterally)',
      terminalHours: 1.0,
    },
    durationOfActionMinutes: {
      min: 30,
      max: 90,
      text: '30–90 minutes',
    },
    receptorPharmacology: {
      targetReceptor: 'Mu-opioid receptor (MOR)',
      action: 'Pure competitive antagonist',
      affinityKiNm: 1.5,
      receptorSelectivity: 'Mu > Kappa > Delta',
      intrinsicAgonistActivity: 0,
      mechanismDetails: 'Pure competitive antagonism with rapid, reliable systemic distribution into brain tissue via parenteral circulation.',
    },
    bioavailabilityPct: {
      min: 100,
      max: 100,
      text: '100% systemic bioavailability (bypasses nasal mucosa entirely)',
    },
    standardRedosingIntervalMinutes: {
      min: 2,
      max: 3,
      text: '2–3 minutes (IM/SC) or 1–2 minutes (IV) if respiratory rate remains <10–12 breaths/min',
    },
    precipitatedWithdrawal: {
      riskLevel: 'low_titratable',
      severity: 'Low to moderate; uniquely titratable to restore respiration without explosive withdrawal',
      durationHours: '0.5–1.0 hours',
      clinicalFeatures: [
        'Mild diaphoresis, yawning, mild rhinorrhea',
        'Significantly lower incidence of severe emesis compared to 8 mg nasal or 3 mg nalmefene',
        'Smooth transition from apnea to adequate spontaneous respiration without emergence delirium',
      ],
      mitigationStrategy: 'Inject into outer thigh muscle (vastus lateralis) or upper arm (deltoid). In clinical/EMS settings, can be titrated in 0.04–0.1 mg IV/IM increments to restore spontaneous breathing while leaving baseline opioid tolerance intact.',
    },
    targetIndications: [
      'Syringe Services Programs (SSPs) low-cost harm reduction distribution to people who use drugs',
      'Patients with nasal trauma, epistaxis, nasal septal perforation, or vasoconstriction from insufflated cocaine/xylazine',
      'Hospital and EMS titrated resuscitation where gentle reversal of apnea without severe withdrawal is desired',
    ],
    clinicalPearls: [
      'Highest cost-effectiveness: Injectable vials typically cost $2–$5 each compared to $45–$120+ for proprietary nasal devices, maximizing public health reach.',
      'Reliable absorption regardless of nasal mucosal conditions (rhinitis, congestion, blood, structural collapse from snorting).',
      'Intramuscular injection can be performed safely directly through clothing (e.g., denim jeans or jackets) into the lateral thigh.',
      'Recognized as standard of care by the Harm Reduction Coalition and WHO Model List of Essential Medicines.',
    ],
    evidenceSources: [
      { organization: 'WHO', title: 'WHO Model List of Essential Medicines: Naloxone Injection', year: 2023, url: 'https://www.who.int/' },
      { organization: 'Harm Reduction Coalition', title: 'Intramuscular Naloxone Administration and Kit Assembly Protocols', year: 2022, url: 'https://harmreduction.org/' },
      { organization: 'CDC', title: 'Syringe Services Programs and Overdose Prevention Guidance', year: 2023, url: 'https://www.cdc.gov/' },
    ],
  },
};

// Enable iteration over formulations via for..of or spread syntax
Object.defineProperty(REVERSAL_FORMULATIONS, Symbol.iterator, {
  value: function* iterateFormulations() {
    yield* Object.values(this);
  },
  enumerable: false,
});

/**
 * Clinical Scenario Guide: Wooden Chest Syndrome (Fentanyl-Induced Muscle Rigidity)
 */
export const WOODEN_CHEST_SYNDROME = {
  id: 'wooden_chest_syndrome',
  title: 'Wooden Chest Syndrome (Fentanyl-Induced Muscle Rigidity & Laryngospasm)',
  alternateNames: ['Fentanyl-induced chest wall rigidity', 'Lead-pipe chest', 'Opioid-induced thoracic rigidity'],
  pathophysiology: {
    mechanism: 'Central mu-opioid receptor-mediated hypertonicity originating in the striatum/basal ganglia, locus coeruleus, and spinal cord interneurons, triggering massive sustained contraction of chest wall, intercostal, and abdominal musculature.',
    glotticInvolvement: 'Simultaneous acute vocal cord closure (laryngospasm/glottic adduction) that mechanically seals the upper airway.',
    ventilationImpact: 'Bag-valve-mask (BVM) and rescue breathing become physically impossible due to insurmountable thoracic impedance and vocal cord closure, producing rapid fatal anoxia within minutes.',
    triggers: [
      'Rapid intravenous injection or concentrated inhalation of illicit synthetic fentanyl or potent analogues (e.g., alfentanil, sufentanil, carfentanil)',
      'High dose or high rate of administration overwhelming central inhibitory interneurons',
      'Polysubstance use with other central depressants or stimulants modifying monoaminergic tone',
    ],
    onsetSpeed: 'Ultra-rapid; occurs within seconds to 1–2 minutes of exposure, often before cyanosis or miosis is noticed.',
  },
  clinicalPresentation: [
    'Rigid, non-compliant, board-like chest wall and abdomen',
    'Inability to depress chest or deliver positive-pressure rescue ventilations (high pressure bag resistance / bag-valve pop-off)',
    'Immediate apnea or agonizing gasping with closed glottis',
    'Profound cyanosis (blue/gray lips and nailbeds) developing within seconds',
    'Jaw clenching and generalized skeletal muscle hypertonicity',
  ],
  immediateClinicalResponse: {
    priorityOrder: [
      '1. Emergency 911 / EMS Activation immediately (request Advanced Life Support for rigid airway/anoxia)',
      '2. Immediate High-Dose Naloxone Administration (repeat immediately if chest wall remains rigid)',
      '3. Rapid Airway Positioning & Aggressive Airway Maneuvers (jaw thrust, prepare for rescue breaths)',
      '4. Ongoing Continuous Ventilation Attempts & ALS Neuromuscular Blockade if refractory',
    ],
    naloxoneDosing: 'Administer high-dose naloxone: give 4 mg intranasal or 0.4–2 mg IV/IM naloxone immediately. If chest wall remains rigid and rescue breaths cannot be delivered after 60–90 seconds, IMMEDIATELY repeat naloxone dose. High central opioid receptor occupancy requires prompt, aggressive displacement.',
    airwayManagement: 'Perform vigorous two-handed jaw thrust to open the supraglottic space. Attempt bag-valve-mask ventilation with a tight two-person mask seal. Do not delay repeat naloxone while struggling with airway.',
    emsRole: 'Paramedics / ALS must be informed of acute wooden chest syndrome. In prehospital/ED refractory cases, definitive management requires neuromuscular blockade (e.g., succinylcholine or rocuronium) with rapid sequence endotracheal intubation (RSI) to relax the chest wall.',
    contraindications: 'Do not rely solely on rescue breathing without naloxone, as physical chest wall rigidity and closed vocal cords prevent air from entering lungs.',
  },
  evidenceBase: [
    { organization: 'AHA', title: 'Cardiac Arrest in Opioid Overdose and Chest Wall Rigidity Guidelines', year: 2023 },
    { organization: 'ACMT', title: 'Fentanyl-Induced Chest Wall Rigidity: Clinical Toxicologic Mechanisms', year: 2022 },
    { organization: 'SAMHSA', title: 'Overdose Prevention and Response Toolkit', year: 2023 },
  ],
};

/**
 * Clinical Scenario Guide: Renarconization Risk & Post-Reversal Observation Protocol
 */
export const RENARCONIZATION_RISK = {
  id: 'renarconization_risk',
  title: 'Renarconization Risk & Post-Reversal Observation Protocol',
  alternateNames: ['Re-narcotization', 'Recurrent opioid toxicity', 'Rebound opioid overdose'],
  pathophysiology: {
    mechanism: 'Pharmacokinetic mismatch between short-acting antagonist (naloxone t1/2 ~30–90 minutes) and lipophilic synthetic fentanyl or ultra-potent analogues (large volume of distribution, extensive peripheral adipose tissue storage).',
    redistributionDynamics: 'Following initial reversal, naloxone rapidly clears from plasma and dissociates from mu-opioid receptors. Massive depots of fentanyl stored in adipose tissue continuously leach and redistribute back into systemic circulation and brain tissue, restoring toxic central receptor occupancy.',
    highRiskOpioids: [
      'Illicit synthetic fentanyl and fentanyl analogues (carfentanil, fluorofentanyl, acetylfentanyl)',
      'Methadone (elimination half-life 15–60 hours)',
      'Extended-release, long-acting prescription formulations (OxyContin, MS Contin, transdermal fentanyl patches)',
      'Massive overdose or polysubstance co-ingestion with sedatives slowing clearance',
    ],
    timeToReboundMinutes: {
      min: 30,
      max: 120,
      text: '30–90 minutes (up to 2–4+ hours with ultra-potent analogues)',
    },
  },
  clinicalProtocol: {
    minimumObservationHours: 2,
    recommendedObservationHours: '2–4 hours for short-acting/fentanyl; 6–12+ hours for methadone or extended-release opioids',
    monitoringParameters: [
      'Continuous pulse oximetry (SpO2 target >= 92%)',
      'Continuous respiratory rate monitoring (flag alert if <10–12 breaths/min)',
      'Level of consciousness / sedation assessment (AVPU or GCS score)',
      'Capnography (end-tidal CO2) to detect hypoventilation before hypoxia occurs',
      'Pupillary diameter and responsiveness',
    ],
    managementOfRecurrence: [
      'Re-administer bolus naloxone (4 mg nasal or 0.4–1.0 mg IV/IM) at first sign of recurrent respiratory depression',
      'For recurrent renarconization in hospital/EMS, initiate continuous IV naloxone infusion titrated at two-thirds the effective reversal dose per hour',
      'Never allow patient to leave unobserved within the initial 2-hour window',
    ],
    patientEducationAndRefusal: [
      'Strongly emphasize to patient that waking up does NOT mean the drug has left their body',
      'Warn that using additional opioids to relieve withdrawal symptoms will cause immediate fatal toxicity when naloxone wears off',
      'Provide take-home naloxone kits (minimum 2–4 doses) and connect with harm reduction peer support or local SSP',
    ],
  },
  evidenceBase: [
    { organization: 'ACEP', title: 'Clinical Policy: Critical Issues in the Management of Opioid Overdose and Observation Duration', year: 2021 },
    { organization: 'SAMHSA', title: 'Overdose Prevention and Response Toolkit', year: 2023 },
  ],
};

/**
 * Clinical Scenario Guide: Stimulant Overamping (Psychological vs Physical)
 */
export const STIMULANT_OVERAMPING_GUIDE = {
  id: 'stimulant_overamping_guide',
  title: 'Stimulant Overamping Clinical Guide (Cocaine, Methamphetamine, Prescription Stimulants)',
  substances: ['Methamphetamine', 'Cocaine', 'Crack', 'MDMA', 'Prescription stimulants (Adderall, Vyvanse)'],
  overview: 'Overamping is stimulant toxicity resulting from high dose, rapid administration, chronic bingeing, sleep deprivation, or adulteration. Unlike depressants, stimulant toxicity presents along two distinct clinical axes: psychological and physical.',
  classification: {
    psychologicalOveramping: {
      definition: 'Severe neuropsychiatric distress resulting from intense dopamine/norepinephrine surge and sleep deprivation, without acute organ failure.',
      symptoms: [
        'Extreme paranoia, persecutory delusions, feeling watched or followed',
        'Severe panic attacks, terror, racing catastrophic thoughts',
        'Visual, auditory, or tactile hallucinations (e.g., "crank bugs" / formication)',
        'Profound agitation, pacing, disorganized speech, hypervigilance',
      ],
      interventions: [
        'Calm, quiet, low-stimulation environment with dimmed lighting and reduced noise',
        'Non-threatening, calm interpersonal de-escalation: speak slowly, sit at eye level, avoid crowding',
        'Never physically restrain the person (restraints drastically increase struggle, hyperthermia, and fatal cardiac collapse)',
        'Offer sips of cool water or electrolyte beverages; encourage slow deep breathing',
        'Stay with the person and provide reality-grounding reassurance',
      ],
    },
    physicalOveramping: {
      definition: 'Life-threatening physiological crisis involving autonomic hyperactivity, hyperpyrexia, cardiovascular collapse, and neuromuscular breakdown.',
      symptoms: [
        'Severe hyperthermia (body temperature > 104°F / 40°C) — critical medical emergency',
        'Generalized tonic-clonic seizures or status epilepticus',
        'Acute chest pain, severe crushing angina, hypertensive emergency (BP > 180/120)',
        'Dangerous tachyarrhythmias (ventricular tachycardia, ventricular fibrillation, severe supraventricular tachycardia)',
        'Rhabdomyolysis (muscle necrosis, extreme muscle pain, dark brown/cola-colored urine)',
        'Acute stroke signs (facial droop, hemiparesis, dysarthria)',
      ],
      interventions: [
        'Immediate Emergency 911 / EMS activation with request for ALS/paramedic response',
        'Aggressive active external cooling: ice packs or cool wet towels placed at neck, axillae, and groin; cold water misting with fan circulation',
        'Seizure precautions: clear surrounding hazards, pad head, do NOT insert anything into mouth, roll into recovery position once convulsions stop',
        'EMS / Hospital treatment: IV benzodiazepines (e.g., lorazepam, midazolam) for sedation, seizure control, and reduction of hyperadrenergic crisis; IV crystalloid hydration for rhabdomyolysis',
      ],
    },
  },
  naloxoneAdministrationRule: {
    pharmacologicalFact: 'Naloxone is a pure mu-opioid receptor antagonist. It has ZERO pharmacological effect on amphetamines, methamphetamine, cocaine, or other central nervous system stimulants.',
    clinicalMandate: 'ALWAYS ADMINISTER NALOXONE if there is ANY suspicion of opioid adulteration or unresponsiveness.',
    rationale: [
      'Illicit cocaine, methamphetamine, and counterfeit stimulant pills are extensively contaminated with fentanyl and synthetic opioids.',
      'Stimulant users frequently lack opioid tolerance, making even minuscule fentanyl cross-contamination fatal.',
      'If an overamping patient displays slow/shallow breathing, cyanosis, unresponsiveness, or pinpoint pupils, administer naloxone immediately. It will do zero harm if opioids are absent, but will save their life if opioids are present.',
    ],
  },
  evidenceBase: [
    { organization: 'CDC', title: 'Stimulant Overdose and Harm Reduction Clinical Guide', year: 2024 },
    { organization: 'Harm Reduction Coalition', title: 'Overamping: Prevention, Recognition, and Response', year: 2022 },
    { organization: 'ASAM/AAAP', title: 'Clinical Practice Guideline on the Management of Stimulant Use Disorders', year: 2023 },
  ],
};

/**
 * Clinical Scenario Guide: Xylazine ("Tranq") Sedation Management
 */
export const XYLAZINE_SEDATION_MANAGEMENT = {
  id: 'xylazine_sedation_management',
  title: 'Xylazine ("Tranq") Sedation & Clinical Overdose Management',
  alternateNames: ['Tranq', 'Tranq-dope', 'Xylazine-induced sedation'],
  pathophysiology: {
    mechanism: 'Potent, selective central and peripheral alpha-2 adrenergic receptor agonist (clonidine analog) approved solely for veterinary sedation and analgesia.',
    receptorTarget: 'Presynaptic alpha-2 adrenergic receptors in the locus coeruleus and brainstem, inhibiting central norepinephrine release.',
    clinicalEffects: [
      'Profound, prolonged central nervous system depression and deep coma',
      'Severe peripheral vasoconstriction with marked central bradycardia and hypotension',
      'Central hypothermia and impaired autonomic thermoregulation',
      'Synergistic potentiation of opioid respiratory depression and airway collapse',
    ],
    durationOfSedationHours: '1–4+ hours (significantly outlasts fentanyl and naloxone)',
  },
  coreClinicalPriorities: {
    priority1_rescueBreathing: {
      action: 'Airway maintenance and rescue breathing are the definitive life-saving interventions.',
      guidelines: [
        'If patient is not breathing or taking slow/shallow breaths (<10–12 breaths/min), administer 1 dose of naloxone for the opioid component and immediately begin rescue breathing (1 breath every 5 seconds).',
        'Open and maintain airway using head-tilt chin-lift or jaw thrust maneuver.',
        'Use bag-valve-mask or pocket mask with one-way valve if available; continue rescue breaths until patient breathes adequately on their own.',
      ],
    },
    priority2_avoidNaloxoneDumping: {
      warning: 'CRITICAL WARNING: Avoid repeated naloxone administration ("naloxone dumping") when the patient has adequate spontaneous breathing.',
      rationale: [
        'Xylazine is NOT an opioid. Naloxone has zero affinity for alpha-2 adrenergic receptors and CANNOT reverse xylazine-induced sedation.',
        'The clinical endpoint of naloxone is restoring adequate spontaneous respiration (respiratory rate >= 10–12 breaths/min, good chest rise, normal skin color)—NOT consciousness or alertness.',
        'If the patient has resumed spontaneous breathing (>10–12 breaths/min) but remains unresponsive/sedated, STOP GIVING NALOXONE.',
        'Giving extra doses of naloxone ("naloxone dumping") will NOT wake the patient from xylazine sedation. Instead, it precipitates severe, explosive opioid withdrawal, intractable vomiting with fatal pulmonary aspiration in a sedated patient with depressed airway reflexes, acute catecholamine crisis, and non-cardiogenic pulmonary edema.',
      ],
    },
    priority3_recoveryPositionAndMonitoring: {
      action: 'Recovery position and continuous monitoring until emergency transport arrives.',
      guidelines: [
        'Roll the breathing patient onto their side into the lateral recovery position (top leg bent, head tilted back and rested on arm) to prevent tongue obstruction and vomit aspiration.',
        'Continuously observe breathing rate and chest rise every 1–2 minutes.',
        'Keep patient warm with blankets (xylazine impairs thermoregulation and causes severe hypothermia).',
        'Activate 911 / EMS for medical transport and prolonged emergency department monitoring.',
      ],
    },
    priority4_woundCareAwareness: {
      action: 'Address chronic xylazine-induced necrotic skin ulcerations.',
      guidelines: [
        'Xylazine causes severe, necrotic skin lesions, deep ulcers, and tissue ischemia at both injection and non-injection sites (due to severe peripheral alpha-2 vasoconstriction).',
        'Clean wounds gently with sterile saline or mild soap and clean water; cover with clean, non-adherent sterile dressing.',
        'Never debride necrotic tissue outside surgical settings; connect patient with specialized harm reduction wound care clinics.',
      ],
    },
  },
  evidenceBase: [
    { organization: 'CDC', title: 'What You Should Know About Xylazine', year: 2024 },
    { organization: 'FDA', title: 'Alert on Xylazine in Illicit Drug Supply and Clinical Management', year: 2023 },
    { organization: 'ACMT', title: 'Position Statement: Xylazine in the Illicit Drug Supply', year: 2023 },
  ],
};

/**
 * Generate clinical comparative recommendation between two formulations
 */
function generateClinicalComparisonRecommendation(formA, formB) {
  // Nalmefene vs Naloxone
  if (formA.id === 'nalmefene_nasal_3mg' || formB.id === 'nalmefene_nasal_3mg') {
    const nalmefene = formA.id === 'nalmefene_nasal_3mg' ? formA : formB;
    const other = formA.id === 'nalmefene_nasal_3mg' ? formB : formA;
    return `Clinical Guidance: Standard naloxone (${other.dose}) is strongly preferred for community bystander reversal over nalmefene (${nalmefene.dose}). While nalmefene offers extended terminal half-life (~11.4h), it causes severe, intractable precipitated withdrawal lasting 12–24+ hours that cannot be relieved with opioids, drastically increasing medical distress and trauma. Reserve nalmefene for specialized clinical settings with confirmed continuous inpatient monitoring.`;
  }

  // 8mg vs 4mg Naloxone
  if ((formA.id === 'naloxone_nasal_8mg' && formB.id === 'naloxone_nasal_4mg') ||
      (formA.id === 'naloxone_nasal_4mg' && formB.id === 'naloxone_nasal_8mg')) {
    return 'Clinical Guidance: ACMT and harm reduction toxicologists recommend initial resuscitation with 4 mg naloxone plus rescue breathing. 8 mg naloxone doubles the dose and significantly increases acute emesis, aspiration risk, and severe sympathetic agitation without increasing survival rates. Support spontaneous breathing with rescue breaths before redosing.';
  }

  // Injectable vs Nasal
  if (formA.routeCategory !== formB.routeCategory) {
    return 'Clinical Guidance: Injectable naloxone (0.4 mg/mL) offers 100% systemic bioavailability, bypasses compromised nasal passages (severe epistaxis, septal perforation, or cocaine/xylazine vasoconstriction), and allows gentle titration to restore breathing without severe withdrawal. Nasal sprays offer needle-free simplicity for untrained bystanders.';
  }

  return `Clinical Guidance: Both ${formA.brandName} and ${formB.brandName} are effective mu-opioid antagonists. Prioritize restoring adequate spontaneous respirations (>10–12 breaths/min) and maintain airway positioning.`;
}

/**
 * Compare two reversal formulations side-by-side
 *
 * @param {string} idA - ID of first formulation
 * @param {string} idB - ID of second formulation
 * @returns {object} Structured comparative clinical pharmacology data
 */
export function compareFormulations(idA, idB) {
  const formA = REVERSAL_FORMULATIONS[idA];
  const formB = REVERSAL_FORMULATIONS[idB];

  if (!formA || !formB) {
    const missing = !formA ? idA : idB;
    throw new Error(`Invalid formulation ID provided: "${missing}" not found in REVERSAL_FORMULATIONS`);
  }

  const halfLifeA = formA.eliminationHalfLifeMinutes.terminalHours ?? (formA.eliminationHalfLifeMinutes.max / 60);
  const halfLifeB = formB.eliminationHalfLifeMinutes.terminalHours ?? (formB.eliminationHalfLifeMinutes.max / 60);
  const halfLifeRatio = parseFloat((halfLifeA / halfLifeB).toFixed(2));
  const doseRatio = parseFloat((formA.doseValueMg / formB.doseValueMg).toFixed(2));

  const riskSeverityRank = { low_titratable: 1, moderate: 2, high: 3, severe_prolonged: 4 };
  const rankA = riskSeverityRank[formA.precipitatedWithdrawal.riskLevel] ?? 2;
  const rankB = riskSeverityRank[formB.precipitatedWithdrawal.riskLevel] ?? 2;

  let withdrawalComparisonSummary = '';
  if (rankA > rankB) {
    withdrawalComparisonSummary = `${formA.brandName} carries significantly higher and more prolonged precipitated withdrawal risk than ${formB.brandName}.`;
  } else if (rankA < rankB) {
    withdrawalComparisonSummary = `${formB.brandName} carries higher precipitated withdrawal risk than ${formA.brandName}.`;
  } else {
    withdrawalComparisonSummary = `${formA.brandName} and ${formB.brandName} share comparable precipitated withdrawal severity.`;
  }

  let affinitySummary = '';
  if (formA.receptorPharmacology.affinityKiNm < formB.receptorPharmacology.affinityKiNm) {
    affinitySummary = `${formA.brandName} has higher mu-opioid receptor binding affinity (lower Ki: ${formA.receptorPharmacology.affinityKiNm} nM vs ${formB.receptorPharmacology.affinityKiNm} nM).`;
  } else if (formA.receptorPharmacology.affinityKiNm > formB.receptorPharmacology.affinityKiNm) {
    affinitySummary = `${formB.brandName} has higher mu-opioid receptor binding affinity (lower Ki: ${formB.receptorPharmacology.affinityKiNm} nM vs ${formA.receptorPharmacology.affinityKiNm} nM).`;
  } else {
    affinitySummary = `${formA.brandName} and ${formB.brandName} have equivalent mu-opioid receptor binding affinity (Ki: ${formA.receptorPharmacology.affinityKiNm} nM).`;
  }

  return {
    formulationA: formA,
    formulationB: formB,
    doseComparison: {
      doseA: formA.dose,
      doseB: formB.dose,
      ratio: doseRatio,
    },
    onsetComparison: {
      onsetA: formA.onsetMinutes.text,
      onsetB: formB.onsetMinutes.text,
      summary: formA.onsetMinutes.min <= formB.onsetMinutes.min
        ? `${formA.brandName} has equal or faster onset`
        : `${formB.brandName} has faster onset`,
    },
    halfLifeComparison: {
      halfLifeA: formA.eliminationHalfLifeMinutes.text,
      halfLifeB: formB.eliminationHalfLifeMinutes.text,
      ratioAtoB: halfLifeRatio,
      summary: halfLifeA > halfLifeB
        ? `${formA.brandName} has ~${halfLifeRatio}x longer elimination half-life than ${formB.brandName}, extending receptor blockade.`
        : `${formB.brandName} has ~${(1 / halfLifeRatio).toFixed(1)}x longer elimination half-life than ${formA.brandName}.`,
    },
    receptorAffinityComparison: {
      affinityA: formA.receptorPharmacology.affinityKiNm,
      affinityB: formB.receptorPharmacology.affinityKiNm,
      summary: affinitySummary,
    },
    precipitatedWithdrawalComparison: {
      riskA: formA.precipitatedWithdrawal.riskLevel,
      riskB: formB.precipitatedWithdrawal.riskLevel,
      durationA: formA.precipitatedWithdrawal.durationHours,
      durationB: formB.precipitatedWithdrawal.durationHours,
      summary: withdrawalComparisonSummary,
    },
    accessComparison: {
      accessA: formA.accessLabel,
      accessB: formB.accessLabel,
    },
    clinicalRecommendation: generateClinicalComparisonRecommendation(formA, formB),
  };
}

/**
 * Retrieve reversal protocols with optional filtering
 *
 * @param {object} [filter={}] - Filter options
 * @param {string} [filter.routeCategory] - 'intranasal' | 'injectable'
 * @param {string} [filter.accessStatus] - 'otc' | 'rx_only' | 'ssp_community'
 * @param {boolean} [filter.otcOnly] - Filter for OTC formulations only
 * @param {string} [filter.search] - Case-insensitive text search
 * @returns {Array} Array of formulation objects
 */
export function getReversalProtocols(filter = {}) {
  let list = Object.values(REVERSAL_FORMULATIONS);

  if (filter.routeCategory) {
    list = list.filter((f) => f.routeCategory === filter.routeCategory);
  }
  if (filter.accessStatus) {
    list = list.filter((f) => f.accessStatus === filter.accessStatus);
  }
  if (filter.otcOnly) {
    list = list.filter((f) => f.accessStatus === 'otc');
  }
  if (filter.search) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter((f) =>
      f.id.toLowerCase().includes(q) ||
      f.brandName.toLowerCase().includes(q) ||
      f.genericName.toLowerCase().includes(q) ||
      f.deliveryRoute.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Clinical evaluation engine for acute overdose scenarios
 *
 * Analyzes patient presentation flags, vital signs, or scenario identifiers
 * and outputs actionable emergency clinical management recommendations.
 *
 * @param {object|string} scenario - Scenario descriptor object or string key
 * @returns {object} Actionable clinical guidance and protocol reference
 */
export function evaluateOverdoseRiskScenario(scenario) {
  const norm = typeof scenario === 'string'
    ? { type: scenario.toLowerCase().trim() }
    : (scenario && typeof scenario === 'object' ? scenario : {});

  // Detect Wooden Chest Syndrome
  if (
    norm.type === 'wooden_chest' ||
    norm.type === 'wooden_chest_syndrome' ||
    norm.chestRigidity ||
    norm.inabilityToVentilate ||
    norm.leadPipeChest ||
    norm.vocalCordClosure
  ) {
    return {
      scenarioId: 'wooden_chest_syndrome',
      scenarioTitle: 'Wooden Chest Syndrome (Fentanyl-Induced Muscle Rigidity)',
      severity: 'critical',
      emergencyEMSRequired: true,
      primaryAction: 'Administer naloxone immediately and activate 911/EMS requesting Advanced Life Support for severe chest wall rigidity. If chest wall remains rigid and rescue breaths cannot be delivered, repeat naloxone within 60–90 seconds.',
      naloxoneGuidance: 'High-dose naloxone: give 4 mg intranasal or 0.4–2 mg IV/IM immediately. Repeat immediately if rigidity persists and positive-pressure ventilation remains blocked.',
      airwayGuidance: 'Perform vigorous jaw thrust. Attempt bag-valve-mask ventilation with high inspiratory pressures. Prepare for emergency ALS neuromuscular blockade (succinylcholine/rocuronium) and endotracheal intubation if unresponsive to naloxone.',
      warnings: [
        'Do not delay repeat naloxone to struggle with rescue breathing alone: vocal cord closure and rigid intercostals physically block positive pressure airflow.',
        'Typically triggered by rapid IV injection or high-concentration inhalation of synthetic fentanyl.',
      ],
      monitoringProtocol: 'Continuous intensive care monitoring post-resuscitation. High risk of immediate hypoxic brain injury if rigidity is not reversed in <3 minutes.',
      recommendedFormulation: 'naloxone_nasal_4mg',
      referenceGuide: WOODEN_CHEST_SYNDROME,
    };
  }

  // Detect Xylazine Sedation
  if (
    norm.type === 'xylazine' ||
    norm.type === 'xylazine_sedation' ||
    norm.suspectedXylazine ||
    norm.tranq ||
    (norm.adequateBreathing && norm.persistentSedation) ||
    (typeof norm.respiratoryRate === 'number' && norm.respiratoryRate >= 10 && norm.persistentSedation)
  ) {
    return {
      scenarioId: 'xylazine_sedation_management',
      scenarioTitle: 'Xylazine ("Tranq") Co-Ingestion Sedation Management',
      severity: 'high',
      emergencyEMSRequired: true,
      primaryAction: 'Support breathing and place in recovery position. If respiratory rate is adequate (>10–12 breaths/min), STOP GIVING NALOXONE.',
      naloxoneGuidance: 'Administer 1 standard dose of naloxone initially to reverse any opioid-induced respiratory depression. ONCE RESPIRATORY RATE IS >= 10–12 BREATHS/MIN, CEASE NALOXONE ADMINISTRATION even if patient remains comatose.',
      airwayGuidance: 'Place in lateral recovery position with top knee bent to maintain airway and prevent aspiration. Continuously observe chest rise.',
      warnings: [
        'DO NOT DUMP REPEATED NALOXONE: Xylazine is an alpha-2 adrenergic agonist, not an opioid. Naloxone cannot wake someone from xylazine sedation.',
        'Excessive naloxone triggers explosive acute opioid withdrawal, intractable vomiting, and fatal aspiration in a sedated patient with depressed airway reflexes.',
        'Patient may remain sedated for 1–4+ hours from xylazine while breathing adequately on their own.',
      ],
      monitoringProtocol: 'Continuous observation of respiratory rate, pulse oximetry, heart rate (bradycardia risk), and temperature (hypothermia risk) until transport arrives.',
      recommendedFormulation: 'naloxone_nasal_4mg',
      referenceGuide: XYLAZINE_SEDATION_MANAGEMENT,
    };
  }

  // Detect Renarconization Risk
  if (
    norm.type === 'renarconization' ||
    norm.type === 'renarconization_risk' ||
    norm.recurrentDepression ||
    (typeof norm.timeSinceReversalMinutes === 'number' && norm.timeSinceReversalMinutes >= 30) ||
    norm.postReversalSomnolence
  ) {
    return {
      scenarioId: 'renarconization_risk',
      scenarioTitle: 'Renarconization Risk (Secondary Opioid Resurgence)',
      severity: 'critical',
      emergencyEMSRequired: true,
      primaryAction: 'Re-administer naloxone immediately for recurring respiratory depression. Maintain strict 2–4 hour post-reversal observation protocol.',
      naloxoneGuidance: 'Re-administer 4 mg intranasal or 0.4–1 mg IV/IM naloxone at first sign of recurrent respiratory rate slowdown (<10–12 breaths/min). In hospital settings, initiate continuous IV naloxone infusion at 2/3 the effective reversal dose per hour.',
      airwayGuidance: 'Reposition airway, provide rescue ventilations if breathing is shallow or stopped, and place in recovery position.',
      warnings: [
        'Synthetic fentanyl and long-acting opioids outlast naloxone (naloxone t1/2 = 30–90 min). Fentanyl redistributes from adipose tissue into blood after naloxone clears.',
        'Never allow patient to leave unobserved within the initial 2-hour post-reversal window.',
        'Patient must be strictly warned that using opioids to treat withdrawal will cause instant fatal overdose once naloxone wears off.',
      ],
      monitoringProtocol: 'Minimum 2–4 hours continuous medical observation for short-acting/fentanyl; 6–12+ hours for methadone or extended-release opioids.',
      recommendedFormulation: 'naloxone_nasal_4mg',
      referenceGuide: RENARCONIZATION_RISK,
    };
  }

  // Detect Stimulant Overamping
  if (
    norm.type === 'stimulant_overamping' ||
    norm.type === 'overamping' ||
    norm.stimulant ||
    norm.hyperthermia ||
    norm.seizure ||
    norm.cocaine ||
    norm.methamphetamine
  ) {
    const isPhysicalEmergency = Boolean(norm.hyperthermia || norm.seizure || norm.chestPain || norm.severe);

    return {
      scenarioId: 'stimulant_overamping_guide',
      scenarioTitle: 'Stimulant Overamping Management',
      severity: isPhysicalEmergency ? 'critical' : 'moderate',
      emergencyEMSRequired: true,
      primaryAction: isPhysicalEmergency
        ? 'Call 911 immediately for physical stimulant crisis. Initiate active external cooling (wet cool cloths/ice packs at neck, axillae, groin) and clear space for seizure safety.'
        : 'Move to quiet, low-stimulation environment with dimmed lighting. Speak calmly, do not physically restrain, offer sips of water, and stay with the person.',
      naloxoneGuidance: 'Naloxone does NOT reverse stimulants. However, ALWAYS administer naloxone if the person is unresponsive, breathing slowly (<10–12 breaths/min), or if opioid adulteration (fentanyl cross-contamination) is suspected.',
      airwayGuidance: 'If seizure occurs, do not put anything in mouth; pad head and place in recovery position once convulsions cease.',
      warnings: [
        'NEVER physically restrain someone who is overamping: struggle against physical restraints rapidly worsens rhabdomyolysis, hyperpyrexia, and cardiac arrest.',
        'Fentanyl is frequently present in illicit stimulant supplies; treat unresponsiveness or hypoventilation as an opioid emergency.',
      ],
      monitoringProtocol: 'Monitor body temperature, heart rate, and mental status. Seek immediate emergency medical care for chest pain, seizures, or fever > 104°F (40°C).',
      recommendedFormulation: 'naloxone_nasal_4mg',
      referenceGuide: STIMULANT_OVERAMPING_GUIDE,
    };
  }

  // Default Standard Opioid Overdose Presentation
  return {
    scenarioId: 'standard_opioid_overdose',
    scenarioTitle: 'Standard Opioid Overdose Emergency Protocol',
    severity: 'critical',
    emergencyEMSRequired: true,
    primaryAction: 'Call 911 immediately, administer first dose of naloxone, support breathing (1 breath every 5 seconds), and place in recovery position once breathing resumes.',
    naloxoneGuidance: 'Give 1 spray (4 mg) of naloxone into one nostril. If no response after 2–3 minutes, give a second dose in the other nostril while continuing rescue breaths.',
    airwayGuidance: 'Open airway (head-tilt chin-lift). Provide rescue breathing (1 breath every 5 seconds). Place in lateral recovery position once spontaneous respirations exceed 10–12 breaths/min.',
    warnings: [
      'Naloxone wears off in 30–90 minutes. Stay with the person until emergency medical services arrive.',
      'If fentanyl or xylazine is present, multiple doses or extended observation may be necessary.',
    ],
    monitoringProtocol: 'Continuous observation for minimum 2–4 hours post-reversal due to renarconization risk.',
    recommendedFormulation: 'naloxone_nasal_4mg',
    referenceGuide: RENARCONIZATION_RISK,
  };
}
