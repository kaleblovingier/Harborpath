/**
 * Pure interaction evaluation shared by the medication explorer and its chips.
 * Clinical data and existing evaluation behavior are kept together here; no DOM,
 * browser storage, network calls, timestamps, or module-level patient state.
 */

export const INTERACTIONS = [
  {
    id: 'opioids-benzos',
    substances: ['opioids', 'benzodiazepines', 'buprenorphine', 'methadone'],
    severity: 'high',
    title: 'Opioids + Benzodiazepines or Z-Drug Sleep Medicines (Xanax, Klonopin, Valium, Ambien)',
    summary: 'Synergistic respiratory depression: combining opioids with GABA-A sedatives dramatically multiplies the risk of fatal breathing arrest.',
    mechanism: 'Opioids suppress brainstem respiratory drive (mu receptors in the pre-Bötzinger complex) while benzodiazepines potentiate inhibitory GABA-A chloride channels, reducing upper airway muscle tone and hypoxic/hypercapnic arousal.',
    action: 'Avoid combining whenever possible, especially with street pressed pills (which frequently mix fentanyl and novel designer benzodiazepines like bromazolam). Importantly, the FDA and SAMHSA emphasize that having a benzodiazepine prescription or dependence is NOT a reason to withhold buprenorphine or methadone—stopping MOUD is far more dangerous than careful co-management.',
    source: ['FDA Boxed Warning & MOUD Guidance', 'https://www.fda.gov/drugs/food-and-drug-administration-overdose-prevention-framework/medications-opioid-use-disorder'],
  },
  {
    id: 'opioids-xylazine',
    substances: ['opioids', 'xylazine'],
    severity: 'high',
    title: 'Opioids (Fentanyl) + Xylazine or Medetomidine ("Tranq") & Alpha-2 Rebound',
    summary: 'Profound non-opioid sedation, bradycardia, hypotension, and severe necrotic skin ulcers; naloxone reverses fentanyl but not alpha-2 sedatives, and abrupt cessation triggers severe rebound hypertension and autonomic crisis.',
    mechanism: 'Xylazine and medetomidine are central alpha-2 adrenergic agonists that inhibit norepinephrine release in the locus coeruleus, causing heavy sedation, bradycardia, hypotension, and peripheral vasoconstriction (leading to necrotic skin wounds). Medetomidine is up to 100–200x more potent at alpha-2 receptors than xylazine. When chronic alpha-2 agonism is abruptly discontinued, unopposed sympathetic outflow causes a hyperadrenergic rebound surge (severe hypertension, tachycardia, tremors, and agitation).',
    action: 'Always give naloxone first because fentanyl is almost always present alongside xylazine. Prioritize rescue breathing (1 breath every 5 seconds). Once spontaneous breathing is restored, avoid repetitive extra naloxone—it will not reverse alpha-2 sedation and triggers violent opioid withdrawal. For withdrawal and rebound hypertension, clinical protocols use alpha-2 agonist replacement (clonidine, tizanidine, or dexmedetomidine) with structured tapering.',
    source: ['CDC Xylazine & Medetomidine Clinical Guidance', 'https://www.cdc.gov/overdose-prevention/about/what-you-should-know-about-xylazine.html'],
  },
  {
    id: 'opioids-gabapentinoids',
    substances: ['opioids', 'gabapentinoids', 'methadone', 'buprenorphine'],
    severity: 'high',
    title: 'Opioids + Gabapentinoids (Gabapentin / Neurontin, Pregabalin / Lyrica)',
    summary: 'Additive central nervous system and respiratory depression, particularly at high doses, in older adults, or in people with reduced kidney function.',
    mechanism: 'Gabapentinoids bind voltage-gated calcium channels (alpha-2-delta-1) and can reverse opioid tolerance while adding to brainstem respiratory suppression. Because gabapentin and pregabalin are cleared solely by the kidneys, any drop in renal function causes rapid drug accumulation.',
    action: 'If co-prescribed for neuropathic pain or AUD, start at low doses, adjust for kidney function, avoid taking extra unprescribed doses, and keep naloxone on hand.',
    source: ['FDA Gabapentinoid Safety Communication', 'https://www.fda.gov/safety/medical-product-safety-information/neurontin-gralise-horizant-gabapentin-and-lyrica-lyrica-cr-pregabalin-drug-safety-communication'],
  },
  {
    id: 'opioids-alcohol',
    substances: ['opioids', 'alcohol', 'methadone', 'buprenorphine'],
    severity: 'high',
    title: 'Opioids + Alcohol',
    summary: 'Alcohol compounds opioid breathing suppression, impairs gag reflexes, and accelerates overdose onset.',
    mechanism: 'Ethanol enhances inhibitory GABA-A signaling and inhibits excitatory NMDA glutamate receptors in the medulla, acting synergistically with mu-opioid receptor respiratory depression.',
    action: 'Avoid drinking alcohol when using opioids or during methadone dose titration. Note that naltrexone or acamprosate can be safely added to help reduce alcohol cravings (acamprosate is compatible with buprenorphine or methadone).',
    source: ['NIAAA Alcohol-Medication Interactions', 'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/harmful-interactions-mixing-alcohol-with-medicines'],
  },
  {
    id: 'buprenorphine-full-agonists',
    substances: ['buprenorphine', 'opioids', 'methadone'],
    severity: 'high',
    title: 'Buprenorphine + Full-Agonist Opioids (Fentanyl, Heroin, Oxycodone, Methadone)',
    summary: 'Taking a standard dose of buprenorphine while full-agonist opioids are still attached to your receptors triggers sudden, intense precipitated withdrawal.',
    mechanism: 'Buprenorphine has higher binding affinity for the mu-opioid receptor than fentanyl, heroin, or methadone, but lower intrinsic receptor activation (partial agonist). Introducing a standard 4–8 mg dose too early strips the full agonist off receptors and replaces 100% activation with ~40% activation within 30–60 minutes. Fentanyl\'s high lipophilicity causes it to leach from fat stores for days, compounding precipitated withdrawal risk.',
    action: 'Wait until objective mild-to-moderate withdrawal is present before a standard buprenorphine start, OR use a clinician-guided Low-Dose / Micro-Induction ("Bernese Method") protocol starting at 0.25–0.5 mg so receptor replacement happens gradually without withdrawal. Note: If you are already stabilized on daily buprenorphine and take a full agonist, precipitated withdrawal does NOT happen because buprenorphine already occupies the receptors.',
    source: ['ASAM Buprenorphine Initiation Guidance', 'https://www.asam.org/quality-care/clinical-guidelines/national-practice-guideline'],
  },
  {
    id: 'methadone-cyp-qtc',
    substances: ['methadone'],
    severity: 'moderate',
    title: 'Methadone + QTc-Prolonging Psychotropics (SSRIs, SNRIs, Tricyclics) & CYP3A4/2B6 Modifiers (Fluoroquinolones, Antifungals)',
    summary: 'Synergistic cardiac QTc prolongation and hERG potassium channel blockade: combining methadone with psychotropics (citalopram, escitalopram, tricyclics, venlafaxine) or fluoroquinolones/antifungals significantly raises Torsades de Pointes risk, while CYP inhibitors dangerously increase methadone levels.',
    mechanism: 'Methadone is cleared via hepatic CYP2B6, CYP3A4, and CYP2C19 and blocks cardiac hERG (IKr) potassium channels in a concentration-dependent manner (greater risk at doses > 100 mg/day). Co-administration with QTc-prolonging psychotropics (citalopram, escitalopram, TCAs like amitriptyline, venlafaxine, haloperidol, quetiapine) or fluoroquinolones (ciprofloxacin, levofloxacin, moxifloxacin) produces additive cardiac repolarization delay. CYP3A4/2B6 inhibitors (fluconazole, voriconazole, clarithromycin, fluvoxamine) decrease methadone clearance, multiplying systemic exposure.',
    action: 'Always tell every prescriber and pharmacist that you take methadone. Ask for a baseline 12-lead ECG and follow-up checks, especially if methadone dose exceeds 100 mg/day or when adding QTc-prolonging psychotropics or antibiotics. Maintain serum potassium >= 4.0 mEq/L and magnesium >= 2.0 mg/dL. If QTc exceeds 500 ms, consider methadone dose reduction, switching to buprenorphine (minimal QTc effect), or selecting non-QTc psychotropics (bupropion, duloxetine).',
    source: ['SAMHSA TIP 63 & AHA/ACC QTc Guidance', 'https://library.samhsa.gov/product/tip-63-medications-opioid-use-disorder/pep21-02-01-002'],
  },
  {
    id: 'naltrexone-opioids',
    substances: ['naltrexone', 'opioids', 'buprenorphine', 'methadone'],
    severity: 'high',
    title: 'Naltrexone (Vivitrol / Oral) + Any Opioid (7–14 Day Washout & Non-Opioid Pain Management)',
    summary: 'Starting naltrexone while opioids remain in your system triggers severe, prolonged precipitated withdrawal; stopping naltrexone leaves you with zero opioid tolerance, and managing pain while on naltrexone requires multimodal non-opioid strategies.',
    mechanism: 'Naltrexone is a potent competitive mu-opioid antagonist. Unlike naloxone (which wears off in 30–90 minutes), oral naltrexone blocks receptors for 24–72 hours and injectable Vivitrol blocks receptors for 28–30 days. Trying to "override" naltrexone with large doses of fentanyl is extremely dangerous because as plasma naltrexone levels dip or fentanyl concentrations surge, fatal respiratory arrest can occur abruptly.',
    action: 'Strictly observe the full opioid-free washout period: 7–10 days after short-acting opioids, and 10–14+ days after fentanyl, buprenorphine, or methadone before starting naltrexone. Confirm clearance with a urine drug screen and a supervised naloxone challenge test. For acute injury or surgery while taking naltrexone, use multimodal non-opioid analgesia (scheduled acetaminophen, NSAIDs like ibuprofen/ketorolac, regional nerve blocks, and subanesthetic ketamine); never take high-dose opioids to bypass the blockade.',
    source: ['FDA Vivitrol Safety Information', 'https://www.samhsa.gov/substance-use/treatment/options/naltrexone'],
  },
  {
    id: 'cocaine-alcohol',
    substances: ['stimulants', 'alcohol'],
    severity: 'high',
    title: 'Cocaine + Alcohol (Cocaethylene Formation)',
    summary: 'The liver combines cocaine and alcohol into a third chemical—cocaethylene—that carries an 18-to-25-fold higher risk of sudden cardiac death than cocaine alone.',
    mechanism: 'Hepatic carboxylesterases transesterify cocaine in the presence of ethanol to form cocaethylene, which blocks dopamine reuptake and cardiac sodium/potassium channels while having a plasma half-life 3 to 5 times longer than cocaine.',
    action: 'Avoid drinking alcohol when using powder or crack cocaine. Seek immediate emergency care for chest pain, pressure, palpitations, or shortness of breath.',
    source: ['NIDA Cocaine Research Report', 'https://nida.nih.gov/research-topics/cocaine'],
  },
  {
    id: 'stimulants-opioids',
    substances: ['stimulants', 'opioids'],
    severity: 'high',
    title: 'Stimulants (Methamphetamine, Cocaine) + Opioids (Fentanyl, Heroin — "Speedball" / "Goofball")',
    summary: 'Stimulants do NOT prevent an opioid overdose—they mask drowsiness temporarily, and if the stimulant wears off first, fatal respiratory arrest can strike without warning.',
    mechanism: 'Cocaine has a short duration (30–60 minutes) and methamphetamine increases sympathetic heart rate and oxygen demand while fentanyl simultaneously depresses brainstem ventilation, creating severe myocardial hypoxia and delayed respiratory collapse.',
    action: 'Never use a stimulant to try to "wake up" someone from an opioid overdose—always use naloxone and rescue breathing. Test stimulant supplies with fentanyl test strips and keep naloxone whenever stimulants are present.',
    source: ['CDC Stimulant Guide', 'https://www.cdc.gov/overdose-prevention/media/pdfs/2024/03/CDC-Stimulant-Guide.pdf'],
  },
  {
    id: 'alcohol-disulfiram',
    substances: ['alcohol', 'disulfiram'],
    severity: 'high',
    title: 'Alcohol + Disulfiram (Antabuse) or Metronidazole (Flagyl)',
    summary: 'Blocks aldehyde dehydrogenase, causing rapid toxic acetaldehyde buildup with severe flushing, vomiting, pounding heart, and dangerous blood pressure drops.',
    mechanism: 'Inhibition of hepatic aldehyde dehydrogenase (ALDH2) stops the conversion of acetaldehyde to harmless acetate, causing a 5-to-10-fold surge in serum acetaldehyde within 10–30 minutes of any ethanol exposure.',
    action: 'Avoid all alcohol (including mouthwash, liquid medications/elixirs, cooking wine, and kombucha) while taking disulfiram and for 14 days after your last dose (and for 3 days after finishing metronidazole or tinidazole antibiotics).',
    source: ['NIAAA Harmful Interactions Guide', 'https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/harmful-interactions-mixing-alcohol-with-medicines'],
  },
];

export const NALTREXONE_WASHOUT_GUIDANCE = [
  {
    id: 'short_acting',
    label: 'Short-acting opioids (heroin, oxycodone, hydrocodone, morphine, codeine)',
    washoutWindow: '7–10 days minimum',
    minDays: 7,
    maxDays: 10,
    lipophilicity: 'Low / intermediate',
    mechanism: 'Shorter elimination half-life (2–4 hours). Receptors clear within 7–10 days, allowing safe initiation without displacing residual agonists.',
    testingChecklist: [
      'Comprehensive urine drug screen negative for opioids (morphine, oxycodone, hydrocodone).',
      'Clinician-supervised Naloxone Challenge Test (0.4–0.8 mg IM/IV with 20–30 min observation) or oral naltrexone trial (12.5–25 mg) showing zero withdrawal signs before Vivitrol injection.',
    ],
    plainAdvice: 'Wait at least 7 to 10 full days after your last dose with zero opioids. Your clinic will do a urine test and a small challenge dose first to be sure you will not get sick.',
  },
  {
    id: 'fentanyl',
    label: 'Illicit / street fentanyl & novel synthetic opioids',
    washoutWindow: '10–14+ days minimum',
    minDays: 10,
    maxDays: 14,
    lipophilicity: 'Extremely high (adipose storage)',
    mechanism: 'High lipophilicity causes fentanyl and its analogs to accumulate heavily in peripheral body fat, slowly leaching into systemic circulation for up to 2 weeks even after acute withdrawal fades.',
    testingChecklist: [
      'Laboratory-confirmed urine drug screen negative for both fentanyl and norfentanyl via LC-MS.',
      'Supervised naloxone challenge test before the 380 mg extended-release injection when recent opioid use is uncertain (the FDA Vivitrol label says a challenge test may be helpful; a negative test does not fully rule out precipitated withdrawal).',
    ],
    plainAdvice: 'Street fentanyl hides in body fat for up to 2 weeks. You must wait 10 to 14+ full days without any fentanyl before starting naltrexone, or you will experience severe precipitated withdrawal.',
  },
  {
    id: 'buprenorphine',
    label: 'Buprenorphine (Suboxone, Subutex, Zubsolv sublingual)',
    washoutWindow: '7–10 days (30+ days for Sublocade / Brixadi depot)',
    minDays: 7,
    maxDays: 10,
    lipophilicity: 'High / slow receptor dissociation',
    mechanism: 'Buprenorphine binds mu receptors with sub-nanomolar affinity and dissociates very slowly. Sublingual forms require 7–10 days; monthly depot injections require 30–60+ days.',
    testingChecklist: [
      'Urine screen negative for buprenorphine and norbuprenorphine.',
      'Supervised naloxone challenge or low-dose oral naltrexone test before Vivitrol.',
    ],
    plainAdvice: 'Wait 7 to 10 days after your last sublingual film or tablet (or 30+ days if you received a monthly injection).',
  },
  {
    id: 'methadone',
    label: 'Methadone (OTP liquid or tablets)',
    washoutWindow: '10–14+ days minimum',
    minDays: 10,
    maxDays: 14,
    lipophilicity: 'High tissue binding / long half-life',
    mechanism: 'Methadone has a long elimination half-life (24–36+ hours) and hepatic reservoir. Clinical guidelines recommend gradual tapering to <= 30 mg daily before beginning the 10–14 day opioid-free washout.',
    testingChecklist: [
      'Urine screen negative for methadone and EDDP metabolite.',
      'Supervised naloxone challenge test before Vivitrol injection.',
    ],
    plainAdvice: 'Methadone stays in the body for a long time. Work with your clinic to taper down to 30 mg or less first, then wait 10 to 14+ days with zero opioids before starting naltrexone.',
  },
];

export const NON_OPIOID_PAIN_ALTERNATIVES = [
  {
    category: 'Scheduled Multimodal Non-Opioid Oral / IV Analgesia',
    agents: 'Acetaminophen (650–1,000 mg PO q6h, max 3,000–4,000 mg/day) + Ibuprofen (400–800 mg PO q6–8h with food) or IV Ketorolac (15 mg IV q6h, max 5 days)',
    clinicalMechanism: 'Combines central antinociception (acetaminophen) with peripheral COX-1/COX-2 prostaglandin inhibition (NSAIDs) for synergistic baseline pain control.',
    safetyGuidance: 'Check total daily acetaminophen from all medications to prevent hepatotoxicity; avoid NSAIDs in active gastrointestinal ulceration, severe renal impairment, or high bleeding risk.',
  },
  {
    category: 'Regional Anesthesia & Peripheral Nerve Blocks',
    agents: 'Targeted nerve blocks (bupivacaine, ropivacaine, liposomal bupivacaine Exparel), spinal/epidural anesthesia, local surgical infiltration',
    clinicalMechanism: 'Blocks voltage-gated sodium channels in peripheral nerves, completely arresting nociceptive transmission from operative or fracture sites without activating central opioid receptors.',
    safetyGuidance: 'Gold-standard approach for acute fractures, dental surgery, and inpatient surgery for patients on Vivitrol.',
  },
  {
    category: 'Neuropathic & Adjuvant Analgesics',
    agents: 'Gabapentin (300–600 mg PO TID) or Pregabalin (75–150 mg PO BID); topical Lidocaine 5% patches; Duloxetine (30–60 mg PO daily)',
    clinicalMechanism: 'Modulates alpha-2-delta calcium channels and descending inhibitory serotonergic/noradrenergic pathways to blunt surgical hyperalgesia and neuropathic pain.',
    safetyGuidance: 'Dose-adjust gabapentinoids for kidney function; monitor for additive sedation with sleep aids.',
  },
  {
    category: 'Non-Opioid Systemic / Procedural Anesthetics',
    agents: 'Subanesthetic IV Ketamine infusion (0.1–0.3 mg/kg/hr), IV Dexmedetomidine, Nitrous oxide',
    clinicalMechanism: 'NMDA receptor antagonism (ketamine) prevents central sensitization and provides potent analgesia; alpha-2 agonism (dexmedetomidine) blunts sympathetic pain signals.',
    safetyGuidance: 'Administered in monitored emergency, surgical, or ICU settings under clinical observation.',
  },
];

export function calculateNaltrexoneWashout(input = {}) {
  const opioidId = typeof input === 'string'
    ? input.trim().toLowerCase()
    : String(input?.opioid || input?.substance || 'fentanyl').trim().toLowerCase();

  const normalized = opioidId.includes('fentanyl')
    ? 'fentanyl'
    : opioidId.includes('methadone')
      ? 'methadone'
      : opioidId.includes('bup') || opioidId.includes('suboxone')
        ? 'buprenorphine'
        : 'short_acting';

  const entry = NALTREXONE_WASHOUT_GUIDANCE.find((g) => g.id === normalized) || NALTREXONE_WASHOUT_GUIDANCE[0];

  return {
    opioidId: entry.id,
    label: entry.label,
    washoutWindow: entry.washoutWindow,
    minDays: entry.minDays,
    maxDays: entry.maxDays,
    lipophilicity: entry.lipophilicity,
    mechanism: entry.mechanism,
    testingChecklist: entry.testingChecklist,
    plainAdvice: entry.plainAdvice,
    nonOpioidAlternatives: NON_OPIOID_PAIN_ALTERNATIVES,
  };
}


export const REGIMEN_AGENTS = [
  {
    id: 'opioids_fentanyl',
    label: 'Opioids (fentanyl, heroin, oxycodone)',
    interactionTag: 'opioids',
    isDepressant: true,
    isFullOpioid: true,
    depressantWeight: 3.0,
  },
  {
    id: 'buprenorphine',
    label: 'Buprenorphine (Suboxone, Sublocade, Brixadi)',
    interactionTag: 'buprenorphine',
    isDepressant: true,
    isPartialAgonist: true,
    depressantWeight: 1.5,
  },
  {
    id: 'methadone',
    label: 'Methadone',
    interactionTag: 'methadone',
    isDepressant: true,
    isFullOpioid: true,
    isQtc: true,
    depressantWeight: 3.0,
  },
  {
    id: 'naltrexone',
    label: 'Naltrexone (Vivitrol / oral ReVia)',
    interactionTag: 'naltrexone',
    isAntagonist: true,
  },
  {
    id: 'alcohol',
    label: 'Alcohol',
    interactionTag: 'alcohol',
    isDepressant: true,
    depressantWeight: 2.5,
  },
  {
    id: 'benzos_sedatives',
    label: 'Benzodiazepines / sleep meds (Xanax, Klonopin, Ambien)',
    interactionTag: 'benzodiazepines',
    isDepressant: true,
    depressantWeight: 2.5,
  },
  {
    id: 'xylazine_medetomidine',
    label: 'Xylazine / Medetomidine ("Tranq")',
    interactionTag: 'xylazine',
    isDepressant: true,
    depressantWeight: 2.0,
  },
  {
    id: 'stimulants',
    label: 'Stimulants (cocaine, methamphetamine)',
    interactionTag: 'stimulants',
    isQtc: true,
  },
  {
    id: 'gabapentinoids',
    label: 'Gabapentinoids (gabapentin, pregabalin)',
    interactionTag: 'gabapentinoids',
    isDepressant: true,
    depressantWeight: 1.5,
  },
  {
    id: 'disulfiram',
    label: 'Disulfiram (Antabuse) / Metronidazole',
    interactionTag: 'disulfiram',
  },
  {
    id: 'qtc_meds',
    label: 'QTc / CYP3A4 meds (ondansetron, citalopram, fluconazole, macrolides, fluoroquinolones, TCAs)',
    interactionTag: 'methadone',
    isQtc: true,
  },
];

const AGENT_ALIAS_MAP = {
  opioid: 'opioids_fentanyl',
  opioids: 'opioids_fentanyl',
  fentanyl: 'opioids_fentanyl',
  heroin: 'opioids_fentanyl',
  oxycodone: 'opioids_fentanyl',
  morphine: 'opioids_fentanyl',
  hydrocodone: 'opioids_fentanyl',
  opioids_fentanyl: 'opioids_fentanyl',
  buprenorphine: 'buprenorphine',
  suboxone: 'buprenorphine',
  subutex: 'buprenorphine',
  sublocade: 'buprenorphine',
  brixadi: 'buprenorphine',
  methadone: 'methadone',
  dolophine: 'methadone',
  methadose: 'methadone',
  naltrexone: 'naltrexone',
  revia: 'naltrexone',
  vivitrol: 'naltrexone',
  alcohol: 'alcohol',
  ethanol: 'alcohol',
  benzodiazepines: 'benzos_sedatives',
  benzos: 'benzos_sedatives',
  benzos_sedatives: 'benzos_sedatives',
  sedatives: 'benzos_sedatives',
  xanax: 'benzos_sedatives',
  klonopin: 'benzos_sedatives',
  valium: 'benzos_sedatives',
  ativan: 'benzos_sedatives',
  ambien: 'benzos_sedatives',
  xylazine: 'xylazine_medetomidine',
  medetomidine: 'xylazine_medetomidine',
  tranq: 'xylazine_medetomidine',
  xylazine_medetomidine: 'xylazine_medetomidine',
  stimulant: 'stimulants',
  stimulants: 'stimulants',
  cocaine: 'stimulants',
  methamphetamine: 'stimulants',
  meth: 'stimulants',
  gabapentin: 'gabapentinoids',
  neurontin: 'gabapentinoids',
  pregabalin: 'gabapentinoids',
  lyrica: 'gabapentinoids',
  gabapentinoids: 'gabapentinoids',
  disulfiram: 'disulfiram',
  antabuse: 'disulfiram',
  qtc: 'qtc_meds',
  qtc_meds: 'qtc_meds',
};


const SEVERITY_RANK = { none: 0, info: 1, moderate: 2, high: 3, critical: 4 };

export const evaluateRegimenSafety = evaluatePolypharmacyRegimen;

export function evaluatePolypharmacyRegimen(substances = []) {
  const list = Array.isArray(substances)
    ? substances
    : substances instanceof Set
      ? [...substances]
      : substances
        ? [substances]
        : [];

  const validMap = new Map(REGIMEN_AGENTS.map((a) => [a.id, a]));
  const rawIds = list.map((item) => {
    if (!item) return '';
    if (typeof item === 'object' && item.id) return String(item.id).trim().toLowerCase();
    return String(item).trim().toLowerCase();
  }).filter(Boolean);

  const chosenIds = [...new Set(rawIds.map((id) => AGENT_ALIAS_MAP[id] || id))]
    .filter((id) => validMap.has(id));

  if (chosenIds.length < 2) {
    return {
      riskLevel: 'none',
      depressantCount: chosenIds.length === 1 && validMap.get(chosenIds[0])?.isDepressant ? 1 : 0,
      depressantScore: 0,
      alerts: [],
      matchedInteractions: [],
      actionSteps: [],
      alpha2ReboundRisk: false,
      washoutGuidance: null,
      nonOpioidPainGuidance: NON_OPIOID_PAIN_ALTERNATIVES,
    };
  }

  const has = (id) => chosenIds.includes(id);
  const chosenAgents = chosenIds.map((id) => validMap.get(id));
  const hasAnyOpioidAgonist = has('opioids_fentanyl') || has('buprenorphine') || has('methadone');
  const hasFullOpioid = has('opioids_fentanyl') || has('methadone');

  // Pairwise interaction matching
  const matchedIds = new Set();
  if (has('benzos_sedatives') && hasAnyOpioidAgonist) matchedIds.add('opioids-benzos');
  if (has('xylazine_medetomidine') && hasAnyOpioidAgonist) matchedIds.add('opioids-xylazine');
  if (has('gabapentinoids') && hasAnyOpioidAgonist) matchedIds.add('opioids-gabapentinoids');
  if (has('alcohol') && hasAnyOpioidAgonist) matchedIds.add('opioids-alcohol');
  if (has('buprenorphine') && hasFullOpioid) matchedIds.add('buprenorphine-full-agonists');
  if (has('methadone') && (has('qtc_meds') || has('stimulants'))) matchedIds.add('methadone-cyp-qtc');
  if (has('naltrexone') && hasAnyOpioidAgonist) matchedIds.add('naltrexone-opioids');
  if (has('stimulants') && has('alcohol')) matchedIds.add('cocaine-alcohol');
  if (has('stimulants') && hasAnyOpioidAgonist) matchedIds.add('stimulants-opioids');
  if (has('alcohol') && has('disulfiram')) matchedIds.add('alcohol-disulfiram');

  const matchedInteractions = INTERACTIONS.filter((ix) => matchedIds.has(ix.id));
  const alerts = [];
  const actionSteps = new Set();

  // 1. CNS / Respiratory Depressant Synergy Scoring
  const depressants = chosenAgents.filter((a) => a.isDepressant);
  let depressantScore = 0;
  for (const dep of depressants) {
    depressantScore += dep.depressantWeight || 1.5;
  }

  if (depressants.length >= 3) {
    alerts.push({
      id: 'triple-depressant-synergy',
      severity: 'critical',
      title: `Critical Polypharmacy Alert: ${depressants.length} CNS & Respiratory Depressants Combined`,
      detail: `Combining ${depressants.map((d) => d.label.split(' (')[0]).join(' + ')} creates compounding, non-linear suppression of brainstem breathing drive and upper airway reflexes.`,
      score: depressantScore,
    });
    actionSteps.add('Keep multiple 4 mg naloxone nasal sprays immediately accessible and never use alone (or call Never Use Alone at 800-484-3731).');
    actionSteps.add('If an overdose occurs, give naloxone AND perform rescue breathing (1 breath every 5 seconds)—naloxone reverses opioids, but rescue breaths are essential for alcohol, benzodiazepines, xylazine, or gabapentinoids.');
  }

  if (has('opioids_fentanyl') && has('benzos_sedatives') && has('alcohol') && has('gabapentinoids')) {
    alerts.push({
      id: 'quadruple-depressant-synergy',
      severity: 'critical',
      title: 'Quadruple Depressant Synergy: Opioid + Benzodiazepine + Alcohol + Gabapentinoid',
      detail: 'Quadruple depressant polypharmacy produces severe, life-threatening medullary respiratory arrest and loss of protective airway reflexes through concurrent mu-opioid, GABA-A, and voltage-gated calcium channel inhibition.',
      score: depressantScore,
    });
    actionSteps.add('Gabapentinoids depend 100% on renal clearance: verify kidney function (eGFR/CrCl) with your prescriber to prevent toxic accumulation, and avoid taking extra unprescribed doses.');
    actionSteps.add('Per FDA Boxed Warning and SAMHSA clinical guidance: concurrent sedative or alcohol use is NOT a valid reason to discontinue buprenorphine or methadone; co-manage with gradual sedative tapering, frequent follow-up, and naloxone co-prescription.');
  }

  // 2. Alpha-2 Adrenergic Sedative Polypharmacy & Rebound Risk
  const alpha2ReboundRisk = has('xylazine_medetomidine');
  if (alpha2ReboundRisk) {
    alerts.push({
      id: 'xylazine-alpha2-rebound-alert',
      severity: depressants.length >= 3 ? 'critical' : 'high',
      title: 'Alpha-2 Adrenergic Sedative Polypharmacy & Rebound Risk (Xylazine / Medetomidine)',
      detail: 'Xylazine and medetomidine are non-opioid alpha-2 adrenergic sedatives. Chronic exposure followed by abrupt cessation triggers severe alpha-2 withdrawal: a life-threatening sympathetic hyperadrenergic surge (severe hypertension, tachycardia, intense tremors, chills, diaphoresis, and agitation).',
    });
    actionSteps.add('In tranq overdose emergencies, prioritize rescue breathing (1 breath every 5 seconds) after giving 1 dose of 4 mg naloxone; once spontaneous breathing is restored, do not give repetitive extra naloxone doses since it will not reverse alpha-2 sedation.');
    actionSteps.add('For xylazine/medetomidine withdrawal and severe rebound hypertension, clinical protocols use scheduled alpha-2 agonist replacement (oral clonidine, tizanidine, or dexmedetomidine) followed by a gradual taper.');
    actionSteps.add('Inspect skin regularly for necrotic tranq ulcers, which develop at injection and non-injection sites due to severe peripheral vasoconstriction; seek prompt clinical wound care.');
  }

  // 3. Precipitated Opioid Withdrawal Risks
  if (has('buprenorphine') && hasFullOpioid) {
    alerts.push({
      id: 'precipitated-withdrawal-buprenorphine',
      severity: 'high',
      title: 'Precipitated Opioid Withdrawal Risk (Full-Agonist Opioid + Buprenorphine)',
      detail: 'Because buprenorphine has higher mu-receptor binding affinity but partial activation, taking a standard 4–8 mg dose while fentanyl, heroin, or methadone is still attached to receptors will rapidly strip the full agonist and trigger acute precipitated withdrawal.',
    });
    actionSteps.add('To transition from fentanyl or methadone to buprenorphine without precipitated withdrawal, discuss a Low-Dose / Micro-Induction ("Bernese Method") cross-taper starting at 0.25–0.5 mg, or wait until objective withdrawal is clearly established.');
  }

  let washoutGuidance = null;
  if (has('naltrexone')) {
    if (has('opioids_fentanyl')) washoutGuidance = calculateNaltrexoneWashout('fentanyl');
    else if (has('methadone')) washoutGuidance = calculateNaltrexoneWashout('methadone');
    else if (has('buprenorphine')) washoutGuidance = calculateNaltrexoneWashout('buprenorphine');
    else if (hasAnyOpioidAgonist) washoutGuidance = calculateNaltrexoneWashout('short_acting');
  }

  if (has('naltrexone') && hasAnyOpioidAgonist) {
    alerts.push({
      id: 'precipitated-withdrawal-naltrexone',
      severity: 'critical',
      title: 'Severe Precipitated Withdrawal & Receptor Blockade (Naltrexone + Opioid)',
      detail: 'Naltrexone is a potent competitive mu-opioid antagonist that displaces fentanyl, buprenorphine, and methadone—causing prolonged, severe precipitated withdrawal. Trying to override naltrexone blockade with high-dose opioids can cause sudden fatal overdose.',
    });
    actionSteps.add('Ensure a full 7–10 day opioid-free interval after short-acting opioids (10–14+ days after fentanyl, buprenorphine, or methadone) before starting oral naltrexone or Vivitrol.');
    actionSteps.add('Confirm opioid clearance with a comprehensive urine drug screen (including fentanyl metabolite LC-MS) and a supervised naloxone challenge test before intramuscular Vivitrol injection.');
    actionSteps.add('For acute pain while on naltrexone, use multimodal non-opioid analgesics (acetaminophen, NSAIDs, regional nerve blocks, IV ketamine); never attempt to override the blockade with massive opioid doses.');
  }

  // 4. QTc Prolongation & Hepatic/Metabolic Alerts
  if (has('methadone') && (has('qtc_meds') || has('stimulants'))) {
    alerts.push({
      id: 'methadone-qtc-cyp-synergy',
      severity: 'high',
      title: 'QTc Prolongation & CYP3A4/2B6 Metabolic Interaction (Methadone + QTc/CYP Meds)',
      detail: 'Combining methadone with CYP3A4 inhibitors (e.g., fluconazole, macrolides) or QTc-prolonging psychotropics (e.g., citalopram, escitalopram, tricyclics, fluoroquinolones, antipsychotics) raises serum methadone and prolongs the cardiac QT interval, increasing Torsades de Pointes risk.',
    });
    actionSteps.add('Ask your pharmacist or prescriber to check for CYP3A4/2B6 interactions and consider a baseline/follow-up ECG and electrolyte check (potassium & magnesium).');
    actionSteps.add('Maintain serum potassium >= 4.0 mEq/L and magnesium >= 2.0 mg/dL; obtain follow-up ECG if methadone dose exceeds 100 mg/day or when adding QTc-prolonging psychotropics.');
  } else if (chosenAgents.filter((a) => a.isQtc).length >= 2) {
    alerts.push({
      id: 'cardiac-qtc-strain',
      severity: 'moderate',
      title: 'Additive Cardiac Rhythm (QTc) & Sympathetic Strain',
      detail: 'Combining stimulants, methadone, or QTc-prolonging medications increases cardiac conduction stress and arrhythmia risk, especially during dehydration or electrolyte depletion.',
    });
    actionSteps.add('Stay hydrated, replenish electrolytes, and seek immediate medical care for palpitations, dizziness, fainting, or chest pain.');
  }

  if (has('alcohol') && has('disulfiram')) {
    alerts.push({
      id: 'disulfiram-acetaldehyde-reaction',
      severity: 'critical',
      title: 'Acute Acetaldehyde Toxicity (Disulfiram / Metronidazole + Alcohol)',
      detail: 'Disulfiram blocks aldehyde dehydrogenase, causing toxic acetaldehyde accumulation within 10–30 minutes of any alcohol intake (flushing, throbbing headache, severe vomiting, tachycardia, and hypotension).',
    });
    actionSteps.add('Strictly avoid all alcohol sources (including mouthwash, liquid medications, cooking wine, and kombucha) while taking disulfiram and for 14 days after stopping.');
  }

  if (has('naltrexone') && has('alcohol') && !hasAnyOpioidAgonist) {
    alerts.push({
      id: 'naltrexone-alcohol-therapeutic',
      severity: 'info',
      title: 'Evidence-Based AUD Combination (Naltrexone + Alcohol)',
      detail: 'Unlike disulfiram, naltrexone does NOT make you sick if you drink alcohol. It safely blocks endorphin reward signaling to reduce cravings and heavy drinking days.',
    });
    actionSteps.add('Continue taking naltrexone as prescribed (daily or 1 hour prior to drinking per your care plan) and have periodic liver enzyme checks.');
  }

  for (const ix of matchedInteractions) {
    actionSteps.add(ix.action);
  }

  let riskLevel = 'info';
  for (const a of alerts) {
    if (SEVERITY_RANK[a.severity] > SEVERITY_RANK[riskLevel]) riskLevel = a.severity;
  }
  for (const ix of matchedInteractions) {
    if (SEVERITY_RANK[ix.severity] > SEVERITY_RANK[riskLevel]) riskLevel = ix.severity;
  }

  if (actionSteps.size === 0) {
    actionSteps.add('Review your full medication list with a clinical pharmacist or prescriber to check for kidney/liver dose adjustments.');
  }

  return {
    riskLevel,
    depressantCount: depressants.length,
    depressantScore,
    alerts,
    matchedInteractions,
    actionSteps: [...actionSteps],
    alpha2ReboundRisk,
    washoutGuidance,
    nonOpioidPainGuidance: NON_OPIOID_PAIN_ALTERNATIVES,
  };
}



/** Evaluate an in-memory combination using the existing pharmacist rules. */
export const evaluateDrugInteractions = evaluatePolypharmacyRegimen;
