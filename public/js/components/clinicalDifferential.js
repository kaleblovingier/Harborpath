/**
 * Toxicology & Clinical Differential Decision Support Assistant
 *
 * Evidence-based clinical differential triage engine for poly-substance adulteration
 * (fentanyl, xylazine, medetomidine, methamphetamine, synthetic cathinones, adulterated pressed pills).
 *
 * Evaluates and differentiates 4 core toxicological and medical emergencies:
 * 1. Opioid & Xylazine / Medetomidine Toxicity (respiratory depression vs alpha-2 sedation)
 * 2. Stimulant Overamping (life-threatening physical overamping vs distressing psychological overamping)
 * 3. Serotonin Toxicity / Syndrome (Hunter Serotonin Toxicity Criteria with clonus as hallmark)
 * 4. Soft Tissue Sepsis / Severe Necrotic Infection / Endocarditis (xylazine necrotic skin ulcers vs necrotizing fasciitis)
 *
 * Clinical sources:
 * - Hunter Serotonin Toxicity Criteria (Dunkley et al., 2003)
 * - SAMHSA Opioid Overdose Prevention & Xylazine Response Guidelines (2023-2024)
 * - CDC Clinical Guidance on Xylazine & Synthetic Opioid Adulteration (2024)
 * - American College of Medical Toxicology (ACMT) Stimulant Toxicity & Hyperthermia Guidance
 * - Emergency Medical Treatment and Labor Act (EMTALA, 42 U.S.C. § 1395dd)
 * - Infectious Diseases Society of America (IDSA) Skin and Soft Tissue Infection Guidelines
 */

import { h, clear, icon, tel, announce } from '../dom.js';
import { getLang } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetDifferentialState);

const tr = (en, es) => (getLang() === 'es' ? es : en);

/**
 * Emergency Tier Severity Constants
 */
export const EMERGENCY_TIERS = {
  EMERGENCY_911: 'EMERGENCY_911',
  URGENT_EVAL: 'URGENT_EVAL',
  DE_ESCALATION: 'DE_ESCALATION',
  NONE: 'NONE',
};

/**
 * The 4 Core Differential Conditions
 */
export const DIFFERENTIAL_CONDITIONS = {
  opioid_xylazine: {
    id: 'opioid_xylazine',
    name: 'Opioid & Xylazine / Medetomidine Toxicity',
    nameEs: 'Toxicidad por opioides y xilacina / medetomidina',
    category: 'opioid_sedative',
    categoryLabel: 'Opioid & Alpha-2 Adrenergic Sedative',
    categoryLabelEs: 'Sedante opioide y agonista alfa-2 adrenérgico',
    emergencyTier: EMERGENCY_TIERS.EMERGENCY_911,
    keySigns: [
      'Slow, shallow, or absent breathing (< 8 breaths/minute, agonal gasping, snoring/death rattle)',
      'Cyanosis (blue, purple, or pale/gray lips, gums, and fingernails)',
      'Profound unresponsiveness to loud shouting or firm sternal knuckle rub',
      'Pinpoint pupils (miosis, though pupils may be normal or dilated if co-ingested with stimulants)',
      'Extreme bradycardia (< 50-60 bpm) and severe hypotension (faint or absent peripheral pulse)',
      'Hypothermia (cold, clammy skin)',
    ],
    mechanism: 'Mu-opioid receptor agonism (fentanyl, carfentanil, nitazenes) coupled with central alpha-2 adrenergic receptor agonism (xylazine, medetomidine). Xylazine and medetomidine cause severe central nervous system depression, profound bradycardia, peripheral vasoconstriction, and prolonged refractory sedation that does not respond to naloxone.',
    adulterants: ['fentanyl', 'xylazine', 'medetomidine', 'carfentanil', 'nitazenes'],
    protocol: [
      'Call 911 / EMTALA emergency immediately. Inform dispatch of suspected opioid and tranq/sedative overdose.',
      'Administer Naloxone immediately: 4 mg intranasal spray in one nostril, or 0.4–2 mg intramuscular injection.',
      'Begin rescue breathing immediately: 1 slow breath every 5 seconds (12 breaths/minute). Ensure chest visibly rises with each breath.',
      'CRITICAL CLINICAL NOTE: Naloxone reverses opioid respiratory depression by displacing opioids from mu-opioid receptors, but will NOT reverse alpha-2 adrenergic sedative or bradycardic effects of xylazine or medetomidine.',
      'Continue rescue breathing until spontaneous respirations resume (> 10–12 breaths/minute). Do NOT administer endless repeat naloxone doses if patient is breathing spontaneously despite continued deep sedation.',
      'Place in recovery position once adequate spontaneous breathing resumes to prevent airway occlusion and aspiration.',
      'Stay with the individual continuously; monitor for renarconization as naloxone duration (30–90 min) is shorter than many synthetic opioids.',
    ],
    clinicalNotes: 'Xylazine and medetomidine are non-opioid veterinary alpha-2 adrenergic agonists. Naloxone is completely ineffective against alpha-2 sedative mechanisms. Ventilatory support via rescue breathing is the primary life-saving intervention. Responders should expect the patient to remain unconscious or deeply sedated even after adequate spontaneous respiration is restored.',
    symptoms: [
      'resp_depression',
      'cyanosis',
      'unresponsive',
      'pinpoint_pupils',
      'bradycardia_hypotension',
      'hypothermia',
      'known_xylazine_medetomidine',
    ],
  },

  stimulant_overamp: {
    id: 'stimulant_overamp',
    name: 'Stimulant Overamping (Physical vs Psychological)',
    nameEs: 'Sobreestimulación por estimulantes (física vs psicológica)',
    category: 'stimulant',
    categoryLabel: 'Sympathomimetic Stimulant Toxicity',
    categoryLabelEs: 'Toxicidad simpaticomimética por estimulantes',
    emergencyTier: EMERGENCY_TIERS.EMERGENCY_911,
    keySigns: [
      'Physical Overamping (Life-Threatening): Hyperthermia (core temp > 104°F / 40°C), crushing chest pain, severe tachycardia (> 140 bpm), active seizures, muscle rigidity (suspected rhabdomyolysis), acute stroke signs',
      'Psychological Overamping (Non-Life-Threatening but Distressing): Severe paranoia, agitation, panic attack, hypervigilance, insomnia, racing thoughts, auditory hallucinations without chest pain, extreme fever, or seizures',
    ],
    mechanism: 'Massive catecholaminergic surge (dopamine, norepinephrine, serotonin release and reuptake blockade) from methamphetamine, cocaine, synthetic cathinones ("bath salts"), or adulterated presses. Induces profound peripheral vasoconstriction, end-organ ischemia, hypermetabolic malignant hyperthermia, acute rhabdomyolysis, or severe neuropsychiatric distress.',
    adulterants: ['methamphetamine', 'cocaine', 'synthetic cathinones', 'adulterated pressed counterfeit pills'],
    protocol: [
      'Triage Physical Red Flags: Check core temperature, chest pain, heart rate (> 140 bpm), seizures, and muscle rigidity.',
      'If Physical Overamping is present: Call 911 immediately for EMTALA hospital transfer.',
      'Initiate rapid physical cooling: Apply ice packs or cold wet towels to axillae (armpits), groin, and neck. Fan skin and mist with cool water.',
      'Offer small sips of cool water or electrolyte drink ONLY if the person is fully alert and swallowing safely without choking risk.',
      'Avoid physical restraints: Struggling against physical restraints exponentially accelerates muscle breakdown, hyperthermia, and fatal rhabdomyolysis.',
      'If Psychological Overamping (no physical red flags): Move to a cool, quiet, low-stimulation environment with dim lighting. Remove crowds and spectators.',
      'Provide calm, non-judgmental grounding presence. Guide through slow box-breathing (inhale 4s, hold 4s, exhale 4s, hold 4s). Reassure them that the substance will wear off.',
    ],
    clinicalNotes: 'Physical overamping carries acute mortality from malignant hyperthermia (> 104°F) and rhabdomyolysis-induced renal failure. Psychological overamping, while terrifying to the individual, is self-limited and non-life-threatening; it responds to sensory reduction, quiet dim spaces, hydration, and compassionate non-confrontational grounding.',
    symptoms: [
      'hyperthermia_extreme',
      'chest_pain',
      'extreme_tachycardia',
      'seizures',
      'muscle_rigidity',
      'acute_confusion_stroke',
      'paranoia_panic',
      'hypervigilance_agitation',
      'insomnia_racing_thoughts',
      'auditory_hallucinations',
    ],
  },

  serotonin_syndrome: {
    id: 'serotonin_syndrome',
    name: 'Serotonin Toxicity / Syndrome (Hunter Serotonin Toxicity Criteria)',
    nameEs: 'Toxicidad serotoninérgica / Síndrome serotoninérgico (Criterios de Hunter)',
    category: 'serotonergic',
    categoryLabel: 'Serotonergic Hyperactivity & Clonus',
    categoryLabelEs: 'Hiperactividad serotoninérgica y clono',
    emergencyTier: EMERGENCY_TIERS.EMERGENCY_911,
    keySigns: [
      'Clonus is the hallmark diagnostic sign (Hunter Criteria): spontaneous clonus, inducible clonus, or ocular clonus',
      'Inducible clonus WITH agitation OR diaphoresis',
      'Ocular clonus WITH agitation OR diaphoresis',
      'Tremor PLUS hyperreflexia (brisk, exaggerated deep tendon reflexes)',
      'Hyperthermia (> 38°C / 100.4°F) WITH ocular clonus OR inducible clonus',
      'Autonomic storm: drenching diaphoresis (sweating), tachycardia, dilated pupils, shivering, goosebumps (piloerection)',
    ],
    mechanism: 'Severe intrasynaptic serotonin (5-HT) receptor overstimulation (predominantly 5-HT2A and 5-HT1A receptors). Triggered by concomitant use of prescription serotonergic medications (SSRIs, SNRIs, MAOIs, tricyclics, trazodone, dextromethorphan) with recreational substances or adulterants (MDMA/ecstasy, methamphetamine, cocaine, tramadol, fentanyl, synthetic cathinones).',
    adulterants: ['MDMA', 'methamphetamine', 'tramadol', 'fentanyl', 'synthetic cathinones', 'dextromethorphan'],
    protocol: [
      'Discontinue all serotonergic medications and recreational substances immediately.',
      'Call 911 / seek EMTALA hospital emergency evaluation immediately.',
      'Perform rapid bedside neuromuscular assessment: Dorsiflex ankle to test for rhythmic inducible ankle clonus; inspect eyes for continuous ocular roving/clonus.',
      'Administer benzodiazepines (in clinical setting) to control neuromuscular hyperactivity, clonus, and agitation.',
      'Initiate active external physical cooling for elevated core temperature.',
      'Avoid physical restraints: Isometric resistance against restraints markedly exacerbates muscle breakdown, hyperthermia, and rhabdomyolysis.',
      'Hospital ICU treatment may include specific 5-HT2A antagonist therapy (cyproheptadine) and neuromuscular blockade in severe hyperthermic cases.',
    ],
    clinicalNotes: 'The Hunter Serotonin Toxicity Criteria is the gold standard diagnostic decision rule (84% sensitivity, 97% specificity). Clonus (spontaneous, inducible, or ocular) is the single most specific clinical feature distinguishing serotonin toxicity from neuroleptic malignant syndrome (NMS) or anticholinergic crisis.',
    symptoms: [
      'clonus_spontaneous',
      'clonus_inducible',
      'ocular_clonus',
      'tremor_hyperreflexia',
      'hyperthermia_extreme',
      'fever_moderate',
      'diaphoresis_shivering',
      'paranoia_panic',
      'hypervigilance_agitation',
      'serotonergic_meds',
    ],
  },

  soft_tissue_sepsis: {
    id: 'soft_tissue_sepsis',
    name: 'Soft Tissue Sepsis / Severe Necrotic Infection / Endocarditis',
    nameEs: 'Sepsis de tejidos blandos / Infección necrótica grave / Endocarditis',
    category: 'infectious_vascular',
    categoryLabel: 'Infectious & Necrotic Vascular Emergency',
    categoryLabelEs: 'Emergencia infecciosa y vascular necrótica',
    emergencyTier: EMERGENCY_TIERS.URGENT_EVAL,
    keySigns: [
      'Spreading skin redness (erythema), intense local warmth, and swelling around injection or wound site',
      'Severe pain out of proportion to physical exam findings (cardinal warning sign of necrotizing fasciitis)',
      'Foul-smelling purulent drainage, tissue breakdown, or crackling feeling under skin (crepitus from gas-forming bacteria)',
      'Necrotic, black eschar skin ulcers (characteristic of xylazine-induced alpha-2 microvascular vasoconstriction and tissue ischemia)',
      'High fevers accompanied by violent shaking chills (rigors)',
      'Profound low blood pressure, dizziness, confusion, cold mottled skin (septic shock)',
      'New heart murmur, dark splinter hemorrhages under fingernails (infective endocarditis)',
    ],
    mechanism: 'Invasive bacterial infection (Staphylococcus aureus, MRSA, Streptococcus pyogenes, polymicrobial anaerobes) secondary to non-sterile injection practices, compromised skin barrier, or severe xylazine-induced alpha-2 peripheral vasoconstriction causing local tissue ischemia, cutaneous ulceration, necrotizing fasciitis, systemic bacteremia, sepsis, and endocardial valve infection.',
    adulterants: ['xylazine-induced necrotic skin ulcers', 'adulterated black tar heroin', 'non-sterile injection diluents'],
    protocol: [
      'Triage for Critical Red Flags: Check for severe pain out of proportion (necrotizing fasciitis), fever with violent shaking chills (rigors), or hypotension/dizziness (septic shock).',
      'If critical red flags are present: Call 911 / seek EMTALA hospital emergency evaluation immediately.',
      'If localized spreading erythema, foul drainage, or necrotic ulcer without systemic shock: Seek urgent medical evaluation within hours.',
      'Hospital medical management requires IV broad-spectrum antibiotics, fluid resuscitation, and immediate surgical consult for operative debridement if necrotizing fasciitis is suspected.',
      'Obtain blood cultures (2 sets from separate venipuncture sites) prior to antibiotic infusion if feasible; perform echocardiography to evaluate for heart valve endocarditis.',
      'EMTALA Legal Protection: Under federal law (42 U.S.C. § 1395dd), all hospital emergency departments must provide medical screening and stabilizing treatment regardless of ability to pay, insurance, or substance use history.',
    ],
    clinicalNotes: 'Xylazine-induced skin ulcers frequently develop at sites distant from injection points due to profound systemic peripheral vasoconstriction and severe microvascular hypoxia. These necrotic wounds carry severe risk of polymicrobial secondary infection, osteomyelitis, and amputation if debridement and appropriate wound management are delayed.',
    symptoms: [
      'spreading_redness',
      'pain_disproportion',
      'foul_drainage',
      'necrotic_ulcers',
      'rigors_chills',
      'sepsis_hypotension',
      'splinter_murmur',
    ],
  },
};

// Make DIFFERENTIAL_CONDITIONS iterable so Array.from(DIFFERENTIAL_CONDITIONS) or for...of works
Object.defineProperty(DIFFERENTIAL_CONDITIONS, Symbol.iterator, {
  enumerable: false,
  value: function* () {
    yield DIFFERENTIAL_CONDITIONS.opioid_xylazine;
    yield DIFFERENTIAL_CONDITIONS.stimulant_overamp;
    yield DIFFERENTIAL_CONDITIONS.serotonin_syndrome;
    yield DIFFERENTIAL_CONDITIONS.soft_tissue_sepsis;
  },
});

/**
 * Diagnostic Categories for Symptoms
 */
export const SYMPTOM_CATEGORIES = [
  {
    id: 'respiratory',
    label: 'Respiratory & Airway Status (Opioid / Sedative)',
    labelEs: 'Estado respiratorio y vía aérea (opioides / sedantes)',
  },
  {
    id: 'cardiovascular',
    label: 'Cardiovascular & Core Temperature',
    labelEs: 'Cardiovascular y temperatura corporal',
  },
  {
    id: 'neurological',
    label: 'Neuromuscular & Reflexes (Hunter Serotonin Criteria)',
    labelEs: 'Neuromuscular y reflejos (Criterios de Hunter)',
  },
  {
    id: 'behavioral',
    label: 'Psychological & Behavioral State',
    labelEs: 'Estado psicológico y conductual',
  },
  {
    id: 'soft_tissue',
    label: 'Skin, Soft Tissue & Sepsis Indicators',
    labelEs: 'Piel, tejidos blandos e infección / sepsis',
  },
  {
    id: 'context',
    label: 'Medication & Adulterant Exposure Context',
    labelEs: 'Contexto de medicamentos y adulterantes',
  },
];

/**
 * All Clinically Vetted Differential Symptoms
 */
export const DIFFERENTIAL_SYMPTOMS = {
  // Category 1: Respiratory & Airway Status
  resp_depression: {
    id: 'resp_depression',
    category: 'respiratory',
    label: 'Slow, shallow, or absent breathing (< 8 breaths/min, agonal gasping, snoring/death rattle)',
    labelEs: 'Respiración lenta, superficial o ausente (< 8 resp/min, jadeos agónicos, estertor)',
    conditions: ['opioid_xylazine'],
    critical911: true,
  },
  cyanosis: {
    id: 'cyanosis',
    category: 'respiratory',
    label: 'Blue, purple, or gray lips, gums, skin, or nail beds (cyanosis)',
    labelEs: 'Labios, encías, piel o uñas azules, moradas o grises (cianosis)',
    conditions: ['opioid_xylazine'],
    critical911: true,
  },
  unresponsive: {
    id: 'unresponsive',
    category: 'respiratory',
    label: 'Unresponsive to loud shouting or firm knuckle rub on breastbone (sternal rub)',
    labelEs: 'No responde a gritos fuertes ni a frotamiento de nudillos en el esternón',
    conditions: ['opioid_xylazine'],
    critical911: true,
  },
  pinpoint_pupils: {
    id: 'pinpoint_pupils',
    category: 'respiratory',
    label: 'Constricted pinpoint pupils (may be normal or dilated if co-ingested with stimulants)',
    labelEs: 'Pupilas puntiformes contraídas (pueden ser normales o dilatadas si hay estimulantes)',
    conditions: ['opioid_xylazine'],
    critical911: false,
  },
  bradycardia_hypotension: {
    id: 'bradycardia_hypotension',
    category: 'respiratory',
    label: 'Extreme slow heart rate (< 50 bpm) and faint, thready pulse (severe hypotension)',
    labelEs: 'Frecuencia cardíaca muy lenta (< 50 lpm) y pulso débil (hipotensión severa)',
    conditions: ['opioid_xylazine'],
    critical911: true,
  },
  hypothermia: {
    id: 'hypothermia',
    category: 'respiratory',
    label: 'Cold, clammy skin or low body temperature (< 95°F / 35°C)',
    labelEs: 'Piel fría y pegajosa o temperatura corporal baja (< 35°C / 95°F)',
    conditions: ['opioid_xylazine'],
    critical911: false,
  },

  // Category 2: Cardiovascular & Core Temperature
  hyperthermia_extreme: {
    id: 'hyperthermia_extreme',
    category: 'cardiovascular',
    label: 'Burning high core fever (> 104°F / 40°C), skin hot to the touch',
    labelEs: 'Fiebre muy alta (> 40°C / 104°F), piel caliente al tacto',
    conditions: ['stimulant_overamp', 'serotonin_syndrome'],
    critical911: true,
  },
  chest_pain: {
    id: 'chest_pain',
    category: 'cardiovascular',
    label: 'Crushing chest pain, severe tightness, or radiating pressure in chest',
    labelEs: 'Dolor opresivo en el pecho, opresión severa o dolor irradiado',
    conditions: ['stimulant_overamp'],
    critical911: true,
  },
  extreme_tachycardia: {
    id: 'extreme_tachycardia',
    category: 'cardiovascular',
    label: 'Extreme rapid heart rate (> 140 bpm), irregular pounding or skipped beats',
    labelEs: 'Frecuencia cardíaca extrema (> 140 lpm), palpitaciones o latidos irregulares',
    conditions: ['stimulant_overamp', 'serotonin_syndrome'],
    critical911: true,
  },
  fever_moderate: {
    id: 'fever_moderate',
    category: 'cardiovascular',
    label: 'Elevated body temperature / fever (> 100.4°F / 38°C)',
    labelEs: 'Temperatura corporal elevada / fiebre (> 38°C / 100.4°F)',
    conditions: ['serotonin_syndrome', 'soft_tissue_sepsis'],
    critical911: false,
  },

  // Category 3: Neuromuscular & Reflexes (Hunter Criteria)
  clonus_spontaneous: {
    id: 'clonus_spontaneous',
    category: 'neurological',
    label: 'Spontaneous clonus (continuous involuntary rhythmic muscle twitching/bouncing without touch)',
    labelEs: 'Clono espontáneo (sacudidas rítmicas involuntarias continuas sin tocar)',
    conditions: ['serotonin_syndrome'],
    critical911: true,
  },
  clonus_inducible: {
    id: 'clonus_inducible',
    category: 'neurological',
    label: 'Inducible clonus (rhythmic bouncing when foot/ankle is briskly flexed upward)',
    labelEs: 'Clono inducible (sacudidas rítmicas al flexionar el pie/tobillo hacia arriba)',
    conditions: ['serotonin_syndrome'],
    critical911: true,
  },
  ocular_clonus: {
    id: 'ocular_clonus',
    category: 'neurological',
    label: 'Ocular clonus (rapid, continuous involuntary rolling or jerking eye movements)',
    labelEs: 'Clono ocular (movimientos oculares involuntarios continuos rápidos)',
    conditions: ['serotonin_syndrome'],
    critical911: true,
  },
  tremor_hyperreflexia: {
    id: 'tremor_hyperreflexia',
    category: 'neurological',
    label: 'Marked muscle tremor PLUS hyperactive deep tendon reflexes (exaggerated knee-jerk)',
    labelEs: 'Temblor muscular marcado MÁS hiperreflexia tendinosa profunda aumentada',
    conditions: ['serotonin_syndrome'],
    critical911: true,
  },
  muscle_rigidity: {
    id: 'muscle_rigidity',
    category: 'neurological',
    label: 'Severe muscle rigidity, stiffness, or locked jaw (suspected rhabdomyolysis)',
    labelEs: 'Rigidez muscular severa o mandíbula trabada (sospecha de rabdomiólisis)',
    conditions: ['stimulant_overamp', 'serotonin_syndrome'],
    critical911: true,
  },
  seizures: {
    id: 'seizures',
    category: 'neurological',
    label: 'Active convulsions or grand mal seizures',
    labelEs: 'Convulsiones activas o crisis de gran mal',
    conditions: ['stimulant_overamp'],
    critical911: true,
  },
  acute_confusion_stroke: {
    id: 'acute_confusion_stroke',
    category: 'neurological',
    label: 'Acute delirium, slurred speech, facial droop, or focal weakness (stroke signs)',
    labelEs: 'Delirio agudo, dificultad para hablar, caída facial o debilidad focal (signos de ACV)',
    conditions: ['stimulant_overamp'],
    critical911: true,
  },
  diaphoresis_shivering: {
    id: 'diaphoresis_shivering',
    category: 'neurological',
    label: 'Drenching diaphoresis (sweating) with shivering or goosebumps (piloerection)',
    labelEs: 'Sudoración profusa (diaforesis) con temblores o piel de gallina (piloerección)',
    conditions: ['serotonin_syndrome'],
    critical911: false,
  },

  // Category 4: Psychological & Behavioral State
  paranoia_panic: {
    id: 'paranoia_panic',
    category: 'behavioral',
    label: 'Severe paranoia, panic attack, intense distress, feeling watched or hunted',
    labelEs: 'Paranoia severa, ataque de pánico, angustia extrema, sensación de persecución',
    conditions: ['stimulant_overamp', 'serotonin_syndrome'],
    critical911: false,
  },
  hypervigilance_agitation: {
    id: 'hypervigilance_agitation',
    category: 'behavioral',
    label: 'Marked motor agitation, pacing, restlessness, defensive hypervigilance',
    labelEs: 'Agitación motora marcada, caminar constante, inquietud, hipervigilancia',
    conditions: ['stimulant_overamp', 'serotonin_syndrome'],
    critical911: false,
  },
  insomnia_racing_thoughts: {
    id: 'insomnia_racing_thoughts',
    category: 'behavioral',
    label: 'Prolonged insomnia, rapid racing thoughts, non-stop pressured speech',
    labelEs: 'Insomnio prolongado, pensamientos acelerados, habla rápida continua',
    conditions: ['stimulant_overamp'],
    critical911: false,
  },
  auditory_hallucinations: {
    id: 'auditory_hallucinations',
    category: 'behavioral',
    label: 'Auditory hallucinations, sensory overwhelm, hearing hostile voices',
    labelEs: 'Alucinaciones auditivas, sobrecarga sensorial, escuchar voces hostiles',
    conditions: ['stimulant_overamp'],
    critical911: false,
  },

  // Category 5: Skin, Soft Tissue & Sepsis
  spreading_redness: {
    id: 'spreading_redness',
    category: 'soft_tissue',
    label: 'Spreading redness, intense heat, or swelling around injection or wound site',
    labelEs: 'Enrojecimiento progresivo, calor intenso o hinchazón en sitio de herida/inyección',
    conditions: ['soft_tissue_sepsis'],
    critical911: false,
  },
  pain_disproportion: {
    id: 'pain_disproportion',
    category: 'soft_tissue',
    label: 'Severe, excruciating pain out of proportion to skin exam (necrotizing fasciitis alert)',
    labelEs: 'Dolor severo y desproporcionado al examen visible (alerta de fascitis necrosante)',
    conditions: ['soft_tissue_sepsis'],
    critical911: true,
  },
  foul_drainage: {
    id: 'foul_drainage',
    category: 'soft_tissue',
    label: 'Foul-smelling pus, purulent drainage, or crackling feeling under skin (crepitus)',
    labelEs: 'Pus o drenaje con mal olor, o sensación crepitante bajo la piel (crepitación)',
    conditions: ['soft_tissue_sepsis'],
    critical911: false,
  },
  necrotic_ulcers: {
    id: 'necrotic_ulcers',
    category: 'soft_tissue',
    label: 'Black, necrotic, dying skin ulcers (characteristic of xylazine vasoconstriction)',
    labelEs: 'Úlceras cutáneas negras, necróticas (características de xilacina)',
    conditions: ['soft_tissue_sepsis'],
    critical911: false,
  },
  rigors_chills: {
    id: 'rigors_chills',
    category: 'soft_tissue',
    label: 'High fevers accompanied by violent shaking chills (rigors)',
    labelEs: 'Fiebre alta acompañada de escalofríos intensos y temblores violentos (rigores)',
    conditions: ['soft_tissue_sepsis'],
    critical911: true,
  },
  sepsis_hypotension: {
    id: 'sepsis_hypotension',
    category: 'soft_tissue',
    label: 'Severe low blood pressure, dizziness, confusion, cold mottled skin with infection (septic shock)',
    labelEs: 'Presión arterial muy baja, mareo, confusión, piel fría y moteada con infección (shock séptico)',
    conditions: ['soft_tissue_sepsis'],
    critical911: true,
  },
  splinter_murmur: {
    id: 'splinter_murmur',
    category: 'soft_tissue',
    label: 'New heart murmur, dark splinter hemorrhages under nail beds (infective endocarditis)',
    labelEs: 'Nuevo soplo cardíaco, hemorragias en astilla bajo las uñas (endocarditis)',
    conditions: ['soft_tissue_sepsis'],
    critical911: false,
  },

  // Category 6: Medication & Substance Exposure Context
  serotonergic_meds: {
    id: 'serotonergic_meds',
    category: 'context',
    label: 'Concomitant use of serotonergic medication (SSRI, SNRI, MAOI, TCA, trazodone, DXM)',
    labelEs: 'Uso concomitante de medicamentos serotoninérgicos (ISRS, IRSN, IMAO, ATC, trazodona, DXM)',
    conditions: ['serotonin_syndrome'],
    critical911: false,
  },
  known_xylazine_medetomidine: {
    id: 'known_xylazine_medetomidine',
    category: 'context',
    label: 'Known or suspected xylazine or medetomidine exposure ("tranq", adulterated supply)',
    labelEs: 'Exposición conocida o sospechada a xilacina o medetomidina ("tranq", adulteración)',
    conditions: ['opioid_xylazine'],
    critical911: false,
  },
};

/**
 * Rapid Clinical Scenario Presets
 */
export const DIFFERENTIAL_PRESETS = [
  {
    id: 'preset_opioid_xylazine',
    label: 'Opioid + Xylazine Overdose',
    labelEs: 'Sobredosis de opioide + xilacina',
    symptoms: [
      'resp_depression',
      'cyanosis',
      'unresponsive',
      'pinpoint_pupils',
      'bradycardia_hypotension',
      'known_xylazine_medetomidine',
    ],
  },
  {
    id: 'preset_physical_overamp',
    label: 'Physical Overamping (Critical)',
    labelEs: 'Sobreestimulación física (crítica)',
    symptoms: [
      'hyperthermia_extreme',
      'chest_pain',
      'extreme_tachycardia',
      'muscle_rigidity',
    ],
  },
  {
    id: 'preset_psych_overamp',
    label: 'Psychological Overamping (Distress)',
    labelEs: 'Sobreestimulación psicológica (angustia)',
    symptoms: [
      'paranoia_panic',
      'hypervigilance_agitation',
      'insomnia_racing_thoughts',
    ],
  },
  {
    id: 'preset_serotonin_syndrome',
    label: 'Serotonin Toxicity (Hunter Criteria)',
    labelEs: 'Toxicidad serotoninérgica (Criterios de Hunter)',
    symptoms: [
      'clonus_spontaneous',
      'hyperthermia_extreme',
      'diaphoresis_shivering',
      'serotonergic_meds',
    ],
  },
  {
    id: 'preset_soft_tissue_sepsis',
    label: 'Soft Tissue Sepsis & Ulcers',
    labelEs: 'Sepsis de tejidos blandos y úlceras',
    symptoms: [
      'necrotic_ulcers',
      'spreading_redness',
      'foul_drainage',
      'rigors_chills',
    ],
  },
];

/**
 * Diagnostic Evaluation for Hunter Serotonin Toxicity Criteria
 *
 * Hunter Criteria algorithm:
 * Patient has taken a serotonergic agent AND one of the following:
 * 1. Spontaneous clonus
 * 2. Inducible clonus AND (agitation OR diaphoresis)
 * 3. Ocular clonus AND (agitation OR diaphoresis)
 * 4. Tremor AND hyperreflexia
 * 5. Hyperthermia (> 38°C) AND (ocular clonus OR inducible clonus)
 *
 * @param {Iterable<string>} symptomKeys
 * @returns {Object} Hunter evaluation result
 */
export function checkHunterCriteria(symptomKeys) {
  const set = symptomKeys instanceof Set ? symptomKeys : new Set(symptomKeys || []);
  const hasSpontaneousClonus = set.has('clonus_spontaneous');
  const hasInducibleClonus = set.has('clonus_inducible');
  const hasOcularClonus = set.has('ocular_clonus');
  const hasTremorHyperreflexia = set.has('tremor_hyperreflexia');
  const hasAgitation = set.has('hypervigilance_agitation') || set.has('paranoia_panic');
  const hasDiaphoresis = set.has('diaphoresis_shivering');
  const hasHyperthermia = set.has('hyperthermia_extreme') || set.has('fever_moderate');

  const rule1 = hasSpontaneousClonus;
  const rule2 = hasInducibleClonus && (hasAgitation || hasDiaphoresis);
  const rule3 = hasOcularClonus && (hasAgitation || hasDiaphoresis);
  const rule4 = hasTremorHyperreflexia;
  const rule5 = hasHyperthermia && (hasOcularClonus || hasInducibleClonus);

  const met = rule1 || rule2 || rule3 || rule4 || rule5;

  return {
    met,
    rules: {
      spontaneousClonus: rule1,
      inducibleClonusWithAgitationOrDiaphoresis: rule2,
      ocularClonusWithAgitationOrDiaphoresis: rule3,
      tremorPlusHyperreflexia: rule4,
      hyperthermiaWithClonus: rule5,
    },
  };
}

/**
 * Pure Evaluation Function
 *
 * Evaluates checked symptoms against the 4 core clinical conditions,
 * calculates emergency tier, and returns prioritized actionable recommendations.
 *
 * @param {Iterable<string>} [symptomKeys=[]] Array or Set of symptom keys
 * @returns {Object} Complete differential evaluation object
 */
export function evaluateDifferentialSymptoms(symptomKeys = []) {
  const rawKeys = Array.isArray(symptomKeys)
    ? symptomKeys
    : symptomKeys instanceof Set
      ? Array.from(symptomKeys)
      : [];
  const normalizedKeys = rawKeys.filter((k) => typeof k === 'string' && Object.hasOwn(DIFFERENTIAL_SYMPTOMS, k));
  const symptomSet = new Set(normalizedKeys);

  // Default empty result
  if (symptomSet.size === 0) {
    const emptyConditions = Object.values(DIFFERENTIAL_CONDITIONS).map((cond) => ({
      ...cond,
      matchScore: 0,
      matchPercentage: 0,
      matchedSymptoms: [],
      isSuspected: false,
      subType: null,
    }));

    return {
      symptomKeys: [],
      symptomCount: 0,
      emergencyTier: EMERGENCY_TIERS.NONE,
      rankedConditions: emptyConditions,
      recommendedActions: [],
      redFlags: [],
      hunterCriteriaMet: false,
      isPhysicalOveramping: false,
      isPsychologicalOveramping: false,
      isOpioidSedativeEmergency: false,
      isSepsisEmergency: false,
      isPolySubstanceSuspected: false,
    };
  }

  // 1. Condition Evaluation: Opioid & Xylazine / Medetomidine Toxicity
  const opioidDef = DIFFERENTIAL_CONDITIONS.opioid_xylazine;
  const matchedOpioidSymptoms = opioidDef.symptoms.filter((k) => symptomSet.has(k));
  const isOpioidCritical =
    symptomSet.has('resp_depression') ||
    symptomSet.has('cyanosis') ||
    symptomSet.has('unresponsive');
  const isOpioidSedativeEmergency = isOpioidCritical || symptomSet.has('bradycardia_hypotension');
  const isOpioidSuspected = matchedOpioidSymptoms.length > 0;
  const opioidTier = isOpioidSedativeEmergency
    ? EMERGENCY_TIERS.EMERGENCY_911
    : isOpioidSuspected
      ? EMERGENCY_TIERS.URGENT_EVAL
      : EMERGENCY_TIERS.NONE;

  // 2. Condition Evaluation: Stimulant Overamping (Physical vs Psychological)
  const stimDef = DIFFERENTIAL_CONDITIONS.stimulant_overamp;
  const matchedStimSymptoms = stimDef.symptoms.filter((k) => symptomSet.has(k));
  const physicalOverampSymptoms = [
    'hyperthermia_extreme',
    'chest_pain',
    'extreme_tachycardia',
    'seizures',
    'muscle_rigidity',
    'acute_confusion_stroke',
  ];
  const psychOverampSymptoms = [
    'paranoia_panic',
    'hypervigilance_agitation',
    'insomnia_racing_thoughts',
    'auditory_hallucinations',
  ];
  const matchedPhysicalStim = physicalOverampSymptoms.filter((k) => symptomSet.has(k));
  const matchedPsychStim = psychOverampSymptoms.filter((k) => symptomSet.has(k));

  const isPhysicalOveramping = matchedPhysicalStim.length > 0;
  const isPsychologicalOveramping = !isPhysicalOveramping && matchedPsychStim.length > 0;
  const isStimSuspected = matchedStimSymptoms.length > 0;

  let stimTier = EMERGENCY_TIERS.NONE;
  let stimSubType = null;
  if (isPhysicalOveramping) {
    stimTier = EMERGENCY_TIERS.EMERGENCY_911;
    stimSubType = 'physical';
  } else if (isPsychologicalOveramping) {
    stimTier = EMERGENCY_TIERS.DE_ESCALATION;
    stimSubType = 'psychological';
  }

  // 3. Condition Evaluation: Serotonin Toxicity (Hunter Criteria)
  const serotoninDef = DIFFERENTIAL_CONDITIONS.serotonin_syndrome;
  const matchedSerotoninSymptoms = serotoninDef.symptoms.filter((k) => symptomSet.has(k));
  const hunterResult = checkHunterCriteria(symptomSet);
  const hasNeuromuscularFeature =
    symptomSet.has('clonus_spontaneous') ||
    symptomSet.has('clonus_inducible') ||
    symptomSet.has('ocular_clonus') ||
    symptomSet.has('tremor_hyperreflexia');

  const isHunterEmergency =
    hunterResult.met ||
    symptomSet.has('clonus_spontaneous') ||
    (symptomSet.has('hyperthermia_extreme') && hasNeuromuscularFeature);

  const isSerotoninSuspected =
    isHunterEmergency ||
    (symptomSet.has('serotonergic_meds') && (hasNeuromuscularFeature || symptomSet.has('diaphoresis_shivering') || symptomSet.has('fever_moderate'))) ||
    (hasNeuromuscularFeature && matchedSerotoninSymptoms.length >= 2);

  const serotoninTier = isHunterEmergency
    ? EMERGENCY_TIERS.EMERGENCY_911
    : isSerotoninSuspected
      ? EMERGENCY_TIERS.URGENT_EVAL
      : EMERGENCY_TIERS.NONE;

  // 4. Condition Evaluation: Soft Tissue Sepsis / Severe Necrotic Infection
  const sepsisDef = DIFFERENTIAL_CONDITIONS.soft_tissue_sepsis;
  const matchedSepsisSymptoms = sepsisDef.symptoms.filter((k) => symptomSet.has(k));
  const isSepsisShockOrNecrotizing =
    symptomSet.has('pain_disproportion') ||
    symptomSet.has('sepsis_hypotension') ||
    (symptomSet.has('rigors_chills') && (symptomSet.has('fever_moderate') || symptomSet.has('sepsis_hypotension')));
  const isSepsisSuspected = matchedSepsisSymptoms.length > 0;
  const sepsisTier = isSepsisShockOrNecrotizing
    ? EMERGENCY_TIERS.EMERGENCY_911
    : isSepsisSuspected
      ? EMERGENCY_TIERS.URGENT_EVAL
      : EMERGENCY_TIERS.NONE;

  // Red Flags Compilation
  const redFlags = [];
  if (symptomSet.has('resp_depression')) redFlags.push('Severe Respiratory Depression (< 8 breaths/min or agonal breathing)');
  if (symptomSet.has('cyanosis')) redFlags.push('Cyanosis (hypoxemia evidenced by blue/gray skin/lips/nails)');
  if (symptomSet.has('unresponsive')) redFlags.push('Profound Unresponsiveness to loud shouting or sternal rub');
  if (symptomSet.has('hyperthermia_extreme')) redFlags.push('Life-Threatening Core Hyperthermia (> 104°F / 40°C)');
  if (symptomSet.has('chest_pain')) redFlags.push('Crushing Chest Pain (suspected myocardial ischemia / infarction)');
  if (symptomSet.has('extreme_tachycardia')) redFlags.push('Extreme Tachycardia (> 140 bpm with dysrhythmia risk)');
  if (symptomSet.has('seizures')) redFlags.push('Active Convulsions / Grand Mal Seizure Activity');
  if (symptomSet.has('muscle_rigidity')) redFlags.push('Severe Muscle Rigidity (high risk of malignant rhabdomyolysis)');
  if (hunterResult.met) redFlags.push('Hunter Serotonin Toxicity Criteria Met (Clonus / Neuromuscular Storm)');
  if (symptomSet.has('pain_disproportion')) redFlags.push('Severe Pain Out of Proportion (high suspicion of Necrotizing Fasciitis)');
  if (symptomSet.has('sepsis_hypotension')) redFlags.push('Profound Hypotension with Infection (Suspected Septic Shock)');
  if (symptomSet.has('acute_confusion_stroke')) redFlags.push('Acute Delirium or Focal Neurological Deficit (Stroke Signs)');

  // Overall Emergency Tier Hierarchy
  let overallTier = EMERGENCY_TIERS.NONE;
  if (
    opioidTier === EMERGENCY_TIERS.EMERGENCY_911 ||
    stimTier === EMERGENCY_TIERS.EMERGENCY_911 ||
    serotoninTier === EMERGENCY_TIERS.EMERGENCY_911 ||
    sepsisTier === EMERGENCY_TIERS.EMERGENCY_911 ||
    redFlags.length > 0
  ) {
    overallTier = EMERGENCY_TIERS.EMERGENCY_911;
  } else if (
    opioidTier === EMERGENCY_TIERS.URGENT_EVAL ||
    serotoninTier === EMERGENCY_TIERS.URGENT_EVAL ||
    sepsisTier === EMERGENCY_TIERS.URGENT_EVAL
  ) {
    overallTier = EMERGENCY_TIERS.URGENT_EVAL;
  } else if (stimTier === EMERGENCY_TIERS.DE_ESCALATION) {
    overallTier = EMERGENCY_TIERS.DE_ESCALATION;
  }

  // Build evaluated condition items
  const evaluatedConditions = [
    {
      ...opioidDef,
      emergencyTier: opioidTier,
      matchScore: matchedOpioidSymptoms.length,
      matchPercentage: Math.round((matchedOpioidSymptoms.length / opioidDef.symptoms.length) * 100),
      matchedSymptoms: matchedOpioidSymptoms,
      isSuspected: isOpioidSuspected,
      subType: null,
    },
    {
      ...stimDef,
      emergencyTier: stimTier,
      matchScore: matchedStimSymptoms.length,
      matchPercentage: Math.round((matchedStimSymptoms.length / stimDef.symptoms.length) * 100),
      matchedSymptoms: matchedStimSymptoms,
      isSuspected: isStimSuspected,
      subType: stimSubType,
    },
    {
      ...serotoninDef,
      emergencyTier: serotoninTier,
      matchScore: matchedSerotoninSymptoms.length,
      matchPercentage: Math.round((matchedSerotoninSymptoms.length / serotoninDef.symptoms.length) * 100),
      matchedSymptoms: matchedSerotoninSymptoms,
      isSuspected: isSerotoninSuspected,
      subType: hunterResult.met ? 'hunter_criteria_positive' : null,
    },
    {
      ...sepsisDef,
      emergencyTier: sepsisTier,
      matchScore: matchedSepsisSymptoms.length,
      matchPercentage: Math.round((matchedSepsisSymptoms.length / sepsisDef.symptoms.length) * 100),
      matchedSymptoms: matchedSepsisSymptoms,
      isSuspected: isSepsisSuspected,
      subType: isSepsisShockOrNecrotizing ? 'shock_or_necrotizing' : 'localized_or_ulcer',
    },
  ];

  // Sorting weight for emergency tiers
  const tierWeight = {
    [EMERGENCY_TIERS.EMERGENCY_911]: 3,
    [EMERGENCY_TIERS.URGENT_EVAL]: 2,
    [EMERGENCY_TIERS.DE_ESCALATION]: 1,
    [EMERGENCY_TIERS.NONE]: 0,
  };

  // Rank conditions: suspected first, then by tier weight, then by match score
  const rankedConditions = evaluatedConditions.sort((a, b) => {
    if (a.isSuspected !== b.isSuspected) {
      return a.isSuspected ? -1 : 1;
    }
    const weightDiff = (tierWeight[b.emergencyTier] || 0) - (tierWeight[a.emergencyTier] || 0);
    if (weightDiff !== 0) return weightDiff;
    return b.matchScore - a.matchScore;
  });

  const suspectedCount = evaluatedConditions.filter((c) => c.isSuspected).length;
  const isPolySubstanceSuspected = suspectedCount >= 2;

  // Build recommended clinical actions
  const recommendedActions = [];

  if (overallTier === EMERGENCY_TIERS.EMERGENCY_911) {
    recommendedActions.push({
      priority: 'CRITICAL',
      title: 'Call 911 / EMTALA Emergency Transfer Immediately',
      description: 'Activate Emergency Medical Services. Put dispatch on speakerphone so hands remain free. Report exact location and observed physical red flags.',
      phone: '911',
    });
  }

  if (isOpioidSedativeEmergency || isOpioidSuspected) {
    recommendedActions.push({
      priority: isOpioidSedativeEmergency ? 'CRITICAL' : 'HIGH',
      title: 'Administer Naloxone (4mg Nasal or IM) & Provide Rescue Breathing',
      description: 'Tilt head back, pinch nose, deliver 1 breath every 5 seconds (12 breaths/min). NOTE: Naloxone reverses opioid respiratory depression but will NOT reverse xylazine or medetomidine alpha-2 sedation. Continue rescue breathing until spontaneous respirations resume.',
    });
  }

  if (isPhysicalOveramping) {
    recommendedActions.push({
      priority: 'CRITICAL',
      title: 'Initiate Active Physical Cooling & Prepare Rapid Hospital Transfer',
      description: 'Apply ice packs or cold wet cloths to armpits, groin, and neck. Fan skin and mist with cool water. Offer fluids ONLY if conscious and swallowing safely. Avoid physical restraints as struggling accelerates fatal rhabdomyolysis.',
    });
  }

  if (hunterResult.met || isSerotoninSuspected) {
    recommendedActions.push({
      priority: hunterResult.met ? 'CRITICAL' : 'HIGH',
      title: 'Hunter Serotonin Criteria Protocol: Discontinue Serotonergics & Hospital Evaluation',
      description: 'Discontinue all serotonergic agents immediately. Assess for ankle and ocular clonus. Hospital evaluation required for IV benzodiazepines and external cooling. Avoid restraints.',
    });
  }

  if (isSepsisShockOrNecrotizing || isSepsisSuspected) {
    recommendedActions.push({
      priority: isSepsisShockOrNecrotizing ? 'CRITICAL' : 'HIGH',
      title: isSepsisShockOrNecrotizing
        ? 'Emergency Department Evaluation for Necrotizing Infection / Septic Shock'
        : 'Urgent Medical Evaluation for Spreading Infection / Xylazine Ulcer',
      description: 'Hospital emergency departments are mandated under EMTALA (42 U.S.C. § 1395dd) to provide medical screening and stabilizing treatment. Requires blood cultures, IV antibiotics, and surgical consultation if necrotizing fasciitis is suspected.',
    });
  }

  if (overallTier === EMERGENCY_TIERS.DE_ESCALATION && isPsychologicalOveramping) {
    recommendedActions.push({
      priority: 'DE_ESCALATION',
      title: 'Initiate Sensory De-escalation & Calming Protocol',
      description: 'Move to a cool, quiet, low-stimulation environment with dim lighting. Remove crowds and spectators. Offer cool water or electrolytes. Provide non-judgmental presence, guide through slow box-breathing (4s in, 4s hold, 4s out, 4s hold), and reassure them that the drug will wear off.',
    });
  }

  return {
    symptomKeys: normalizedKeys,
    symptomCount: normalizedKeys.length,
    emergencyTier: overallTier,
    rankedConditions,
    recommendedActions,
    redFlags,
    hunterCriteriaMet: hunterResult.met,
    isPhysicalOveramping,
    isPsychologicalOveramping,
    isOpioidSedativeEmergency,
    isSepsisEmergency: isSepsisShockOrNecrotizing,
    isPolySubstanceSuspected,
  };
}

/**
 * In-RAM Ephemeral State Management
 *
 * Ephemeral memory only. Never writes symptom checks or differential results
 * to device storage, session storage, cookies, or URL parameters.
 */
let inMemoryDifferentialState = {
  selectedSymptoms: new Set(),
  activePreset: null,
};

const subscribers = new Set();

function notifySubscribers() {
  const current = getDifferentialState();
  for (const fn of subscribers) {
    try {
      fn(current);
    } catch {
      // guard subscriber errors
    }
  }
}

/**
 * Returns current in-RAM differential state.
 *
 * @returns {Object} Snapshot of current in-RAM state
 */
export function getDifferentialState() {
  return {
    selectedSymptoms: Array.from(inMemoryDifferentialState.selectedSymptoms),
    activePreset: inMemoryDifferentialState.activePreset,
  };
}

/**
 * Sets selected symptoms in RAM.
 *
 * @param {Array<string>} keys Array of symptom key strings
 * @returns {Object} Updated state
 */
export function setDifferentialSymptoms(keys) {
  inMemoryDifferentialState.selectedSymptoms = new Set(
    (keys || []).filter((k) => Object.hasOwn(DIFFERENTIAL_SYMPTOMS, k)),
  );
  inMemoryDifferentialState.activePreset = null;
  notifySubscribers();
  return getDifferentialState();
}

/**
 * Toggles a single symptom key in RAM.
 *
 * @param {string} key Symptom key
 * @returns {Object} Updated state
 */
export function toggleDifferentialSymptom(key) {
  if (!Object.hasOwn(DIFFERENTIAL_SYMPTOMS, key)) return getDifferentialState();
  if (inMemoryDifferentialState.selectedSymptoms.has(key)) {
    inMemoryDifferentialState.selectedSymptoms.delete(key);
  } else {
    inMemoryDifferentialState.selectedSymptoms.add(key);
  }
  inMemoryDifferentialState.activePreset = null;
  notifySubscribers();
  return getDifferentialState();
}

/**
 * Applies a pre-packaged clinical scenario preset.
 *
 * @param {string} presetId Preset identifier
 * @returns {Object} Updated state
 */
export function applyDifferentialPreset(presetId) {
  const preset = DIFFERENTIAL_PRESETS.find((p) => p.id === presetId);
  if (preset) {
    inMemoryDifferentialState.selectedSymptoms = new Set(preset.symptoms);
    inMemoryDifferentialState.activePreset = presetId;
    notifySubscribers();
  }
  return getDifferentialState();
}

/**
 * Subscribes a listener callback to in-RAM state mutations.
 *
 * @param {Function} listener Callback receiving state snapshot
 * @returns {Function} Unsubscribe cleanup function
 */
export function subscribeDifferentialState(listener) {
  if (typeof listener === 'function') {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  }
  return () => {};
}

/**
 * Deterministic wipe of interactive component state.
 *
 * Clears all checked symptoms and active presets from browser RAM.
 *
 * @returns {Object} Wiped state snapshot
 */
export function resetDifferentialState() {
  inMemoryDifferentialState.selectedSymptoms.clear();
  inMemoryDifferentialState.activePreset = null;
  notifySubscribers();
  return getDifferentialState();
}

/**
 * Clinical Differential DOM Component
 *
 * Accessible, zero-dependency interactive differential decision support tool.
 *
 * @param {Object} [options]
 * @param {Function} [options.onNavigate] Optional routing callback
 * @returns {HTMLElement} Root component element
 */
export function clinicalDifferential({ onNavigate } = {}) {
  const isEs = getLang() === 'es';

  const root = h('section', {
    class: 'differential-container',
    id: 'clinical-differential',
    'aria-label': tr('Toxicology & Clinical Differential Assistant', 'Asistente de diferencial clínico y toxicología'),
  });

  // Header
  const header = h('div', { class: 'facility-head' },
    h('h3', { class: 'facility-name' },
      icon('shield'), ' ',
      tr('Toxicology & Clinical Differential Assistant', 'Asistente de diferencial clínico y toxicología'),
    ),
    h('span', { class: 'chip chip-extra' }, tr('In-RAM Clinical Tool', 'Herramienta clínica en RAM')),
  );

  const introText = h('p', null,
    tr(
      'Rapid differential decision support for poly-substance adulteration (fentanyl, xylazine, medetomidine, synthetic stimulants, pressed counterfeit pills). Differentiates opioid/sedative toxicity, physical vs psychological overamping, serotonin toxicity (Hunter Criteria), and severe soft tissue sepsis.',
      'Soporte rápido de decisión diferencial para adulteración polisustancia (fentanilo, xilacina, medetomidina, estimulantes sintéticos, pastillas prensadas). Diferencia toxicidad por opioides/sedantes, sobreestimulación física vs psicológica, toxicidad serotoninérgica (Criterios de Hunter) y sepsis de tejidos blandos.',
    ),
  );

  const privacyNotice = h('div', { class: 'callout callout-info fine' },
    icon('shield'), ' ',
    tr(
      'Ephemeral In-RAM Tool: Selected symptoms and differential calculations exist strictly in temporary browser memory and are wiped when clicking Reset or closing the browser. No cookies, URLs, or local storage are used.',
      'Herramienta en memoria volátil: Los síntomas seleccionados y los cálculos existen únicamente en la memoria temporal del navegador y se borran al hacer clic en Reiniciar o cerrar el navegador. No se utilizan cookies, URLs ni almacenamiento local.',
    ),
  );

  // Preset Navigation
  const presetButtons = DIFFERENTIAL_PRESETS.map((preset) => {
    const isCurrent = inMemoryDifferentialState.activePreset === preset.id;
    const btn = h('button', {
      type: 'button',
      class: 'preset diff-preset-btn',
      id: `diff-preset-${preset.id}`,
      'aria-pressed': String(isCurrent),
      onclick: () => {
        applyDifferentialPreset(preset.id);
        announce(tr(`Loaded preset: ${preset.label}`, `Preajuste cargado: ${preset.labelEs}`));
      },
    }, isEs ? preset.labelEs : preset.label);
    if (isCurrent) btn.setAttribute('aria-current', 'true');
    return btn;
  });

  const clearPresetBtn = h('button', {
    type: 'button',
    class: 'btn btn-ghost btn-small diff-reset-btn',
    id: 'btn-reset-differential-top',
    onclick: () => {
      resetDifferentialState();
      announce(tr('Differential checklist cleared.', 'Lista de verificación diferencial borrada.'));
    },
  }, icon('refresh'), ' ', tr('Clear Checklist', 'Borrar lista'));

  const presetsNav = h('nav', {
    class: 'presets differential-presets no-print',
    'aria-label': tr('Rapid Clinical Scenario Presets', 'Preajustes rápidos de escenarios clínicos'),
  }, ...presetButtons, clearPresetBtn);

  // Checklist Form
  const form = h('form', {
    id: 'differential-symptom-form',
    class: 'differential-form',
    onsubmit: (e) => e.preventDefault(),
  });

  // Map of checkbox DOM nodes keyed by symptom id
  const checkboxNodes = new Map();

  for (const cat of SYMPTOM_CATEGORIES) {
    const catSymptoms = Object.values(DIFFERENTIAL_SYMPTOMS).filter((s) => s.category === cat.id);
    if (catSymptoms.length === 0) continue;

    const fieldset = h('fieldset', {
      class: 'differential-fieldset',
      id: `diff-fs-${cat.id}`,
    });

    const legend = h('legend', { class: 'differential-legend' },
      isEs ? cat.labelEs : cat.label,
    );
    fieldset.append(legend);

    const symptomList = h('div', { class: 'differential-symptom-list' });

    for (const sym of catSymptoms) {
      const isChecked = inMemoryDifferentialState.selectedSymptoms.has(sym.id);

      const input = document.createElement('input');
      input.setAttribute('type', 'checkbox');
      input.setAttribute('id', `sym-${sym.id}`);
      input.setAttribute('name', 'differential_symptoms');
      input.setAttribute('value', sym.id);
      if (isChecked) {
        input.setAttribute('checked', '');
        input.checked = true;
      }
      input.addEventListener('change', () => {
        toggleDifferentialSymptom(sym.id);
        if (input.checked && sym.critical911) {
          announce(tr('Emergency red flag selected. Review 911 emergency protocol below.', 'Alerta de emergencia seleccionada. Revise el protocolo 911 abajo.'));
        }
      });
      checkboxNodes.set(sym.id, input);

      const label = document.createElement('label');
      label.setAttribute('for', `sym-${sym.id}`);
      label.setAttribute('class', 'checkbox-label differential-checkbox-label');

      const labelText = document.createElement('span');
      labelText.setAttribute('class', 'symptom-label-text');
      labelText.textContent = isEs ? sym.labelEs : sym.label;

      label.append(input, labelText);

      if (sym.critical911) {
        const flagChip = h('span', { class: 'chip chip-emergency chip-small' },
          tr('Critical 911 Alert', 'Alerta crítica 911'),
        );
        label.append(flagChip);
      }

      const itemDiv = h('div', { class: 'differential-symptom-item' }, label);
      symptomList.append(itemDiv);
    }

    fieldset.append(symptomList);
    form.append(fieldset);
  }

  // Live Results Container
  const resultsContainer = h('div', {
    id: 'differential-evaluation-results',
    class: 'differential-results-container',
    'aria-live': 'polite',
    'aria-atomic': 'true',
  });

  // Render Live Evaluation
  function renderEvaluation() {
    clear(resultsContainer);

    const evaluation = evaluateDifferentialSymptoms(inMemoryDifferentialState.selectedSymptoms);

    // Synchronize checkboxes
    for (const [symId, inputNode] of checkboxNodes.entries()) {
      const checked = inMemoryDifferentialState.selectedSymptoms.has(symId);
      inputNode.checked = checked;
      if (checked) {
        inputNode.setAttribute('checked', '');
      } else {
        inputNode.removeAttribute('checked');
      }
    }

    // Synchronize preset button states
    for (const btn of presetButtons) {
      const pId = btn.id.replace('diff-preset-', '');
      const active = inMemoryDifferentialState.activePreset === pId;
      btn.setAttribute('aria-pressed', String(active));
      if (active) {
        btn.setAttribute('aria-current', 'true');
      } else {
        btn.removeAttribute('aria-current');
      }
    }

    // Empty state
    if (evaluation.symptomCount === 0) {
      resultsContainer.append(
        h('div', { class: 'callout callout-info', id: 'diff-empty-prompt' },
          h('h4', { class: 'callout-title' },
            icon('shield'), ' ',
            tr('Interactive Differential Ready', 'Diferencial interactivo listo'),
          ),
          h('p', null,
            tr(
              'Select observed symptoms above or click a scenario preset to run live differential triage, evaluate Hunter Serotonin Criteria, and view actionable emergency protocols.',
              'Seleccione los síntomas observados arriba o haga clic en un preajuste de escenario para ejecutar el triaje diferencial en vivo, evaluar los Criterios de Hunter y ver protocolos de emergencia.',
            ),
          ),
        ),
      );
      return;
    }

    // 1. Emergency Alert Tier Banner
    let bannerClass = 'callout callout-info';
    let bannerTitle = tr('Evaluation Active', 'Evaluación activa');
    let bannerBadgeClass = 'chip';

    if (evaluation.emergencyTier === EMERGENCY_TIERS.EMERGENCY_911) {
      bannerClass = 'callout callout-emergency';
      bannerTitle = tr('EMERGENCY: CALL 911 / SEEK IMMEDIATE HOSPITAL TRANSFER', 'EMERGENCIA: LLAME AL 911 / TRANSFERENCIA HOSPITALARIA INMEDIATA');
      bannerBadgeClass = 'chip chip-emergency';
    } else if (evaluation.emergencyTier === EMERGENCY_TIERS.URGENT_EVAL) {
      bannerClass = 'callout callout-warn';
      bannerTitle = tr('URGENT MEDICAL EVALUATION REQUIRED', 'EVALUACIÓN MÉDICA URGENTE REQUERIDA');
      bannerBadgeClass = 'chip chip-warn';
    } else if (evaluation.emergencyTier === EMERGENCY_TIERS.DE_ESCALATION) {
      bannerClass = 'callout callout-info';
      bannerTitle = tr('NON-LIFE-THREATENING PSYCHOLOGICAL OVERAMPING', 'SOBREESTIMULACIÓN PSICOLÓGICA NO MORTAL');
      bannerBadgeClass = 'chip chip-ok';
    }

    const alertBanner = h('div', {
      class: `${bannerClass} diff-alert-banner`,
      id: 'differential-alert-banner',
      role: evaluation.emergencyTier === EMERGENCY_TIERS.EMERGENCY_911 ? 'alert' : 'region',
      'aria-label': tr('Emergency Alert Status', 'Estado de alerta de emergencia'),
    },
      h('div', { class: 'facility-head' },
        h('h4', { class: 'callout-title' },
          icon('shield'), ' ',
          bannerTitle,
        ),
        h('span', { class: bannerBadgeClass }, evaluation.emergencyTier),
      ),
      h('p', null,
        evaluation.emergencyTier === EMERGENCY_TIERS.EMERGENCY_911
          ? tr(
              'Life-threatening toxicological or medical emergency detected. Immediate 911 activation, ventilatory support, cooling, and EMTALA hospital transfer are required.',
              'Se detectó una emergencia toxicológica o médica potencialmente mortal. Se requiere activación inmediata del 911, soporte respiratorio, enfriamiento y traslado bajo EMTALA.',
            )
          : evaluation.emergencyTier === EMERGENCY_TIERS.URGENT_EVAL
            ? tr(
                'Severe or spreading clinical condition requiring medical evaluation within hours at a hospital emergency department or clinic under EMTALA.',
                'Condición clínica severa o en expansión que requiere evaluación médica en cuestión de horas en urgencias o clínica bajo EMTALA.',
              )
            : tr(
                'High psychological distress without life-threatening physical signs. Initiate calming, low-stimulation sensory de-escalation protocol.',
                'Angustia psicológica alta sin signos físicos mortales. Inicie protocolo de desescalada sensorial en ambiente de bajo estímulo.',
              ),
      ),
    );

    // Render Red Flags if present
    if (evaluation.redFlags.length > 0) {
      const redFlagsList = h('ul', { class: 'differential-red-flags-list' },
        evaluation.redFlags.map((flag) =>
          h('li', { class: 'red-flag-item' },
            icon('alert'), ' ',
            h('strong', null, flag),
          ),
        ),
      );
      alertBanner.append(
        h('div', { class: 'red-flags-block' },
          h('h5', null, tr('Identified Critical Red Flags:', 'Alertas críticas identificadas:')),
          redFlagsList,
        ),
      );
    }

    // Call 911 Action Button inside banner if 911 tier
    if (evaluation.emergencyTier === EMERGENCY_TIERS.EMERGENCY_911) {
      alertBanner.append(
        h('div', { class: 'actions emergency-call-actions no-print' },
          tel('911', tr('📞 Call 911 Now', '📞 Llamar al 911 ahora'), {
            class: 'btn btn-danger',
            id: 'btn-call-911-differential',
          }),
          h('span', { class: 'fine' },
            tr('Protected under federal EMTALA emergency care requirements.', 'Protegido bajo requisitos federales de atención de emergencia EMTALA.'),
          ),
        ),
      );
    }

    resultsContainer.append(alertBanner);

    // Poly-substance adulteration notice
    if (evaluation.isPolySubstanceSuspected) {
      resultsContainer.append(
        h('div', { class: 'callout callout-warn poly-adulteration-card', id: 'diff-poly-card' },
          h('h4', { class: 'callout-title' },
            icon('alert'), ' ',
            tr('Poly-Substance Adulteration Suspected', 'Sospecha de adulteración polisustancia'),
          ),
          h('p', null,
            tr(
              'Observed symptoms match multiple distinct toxicological conditions simultaneously (e.g., opioid/sedative plus stimulant or serotonergic agent). Illicit drug supplies frequently contain co-adulterants (fentanyl, xylazine, medetomidine, synthetic cathinones, methamphetamine). Address respiratory depression and airway FIRST before stimulant cooling or de-escalation.',
              'Los síntomas observados coinciden con múltiples condiciones toxicológicas simultáneamente (ej. opioide/sedante más estimulante o agente serotoninérgico). El suministro ilícito con frecuencia contiene coadulterantes. Atienda la depresión respiratoria y vía aérea PRIMERO antes del enfriamiento o desescalada.',
            ),
          ),
        ),
      );
    }

    // 2. Ranked Suspected Conditions Cards
    const suspectedConditions = evaluation.rankedConditions.filter((c) => c.isSuspected);

    if (suspectedConditions.length > 0) {
      const conditionsSection = h('div', { class: 'differential-conditions-section' },
        h('h4', { class: 'section-heading' },
          tr('Ranked Clinical Differential Considerations', 'Consideraciones diferenciales clínicas jerarquizadas'),
        ),
      );

      for (const cond of suspectedConditions) {
        let condBadgeClass = 'chip';
        if (cond.emergencyTier === EMERGENCY_TIERS.EMERGENCY_911) condBadgeClass = 'chip chip-emergency';
        else if (cond.emergencyTier === EMERGENCY_TIERS.URGENT_EVAL) condBadgeClass = 'chip chip-warn';
        else if (cond.emergencyTier === EMERGENCY_TIERS.DE_ESCALATION) condBadgeClass = 'chip chip-ok';

        const card = h('article', {
          class: 'card differential-condition-card',
          id: `diff-card-${cond.id}`,
        },
          h('div', { class: 'facility-head' },
            h('h5', { class: 'facility-name' },
              icon('shield'), ' ',
              isEs ? cond.nameEs : cond.name,
            ),
            h('span', { class: condBadgeClass }, cond.emergencyTier),
          ),
          h('div', { class: 'condition-meta' },
            h('span', { class: 'chip chip-secondary' }, isEs ? cond.categoryLabelEs : cond.categoryLabel),
            h('span', { class: 'match-score-pill' },
              tr(`Matched symptoms: ${cond.matchScore}`, `Síntomas coincidentes: ${cond.matchScore}`),
            ),
          ),
          h('p', { class: 'condition-mechanism' },
            h('strong', null, tr('Pharmacological Mechanism: ', 'Mecanismo farmacológico: ')),
            cond.mechanism,
          ),
          h('div', { class: 'condition-protocol-block' },
            h('h6', null, tr('Immediate Clinical Protocol & Actions:', 'Protocolo y acciones clínicas inmediatas:')),
            h('ol', { class: 'protocol-steps' },
              cond.protocol.map((step) => h('li', null, step)),
            ),
          ),
          h('div', { class: 'callout callout-info condition-caveat' },
            h('p', null,
              h('strong', null, tr('Critical Clinical Caveat: ', 'Advertencia clínica crítica: ')),
              cond.clinicalNotes,
            ),
          ),
        );

        conditionsSection.append(card);
      }

      resultsContainer.append(conditionsSection);
    }

    // 3. Recommended Actions Summary
    if (evaluation.recommendedActions.length > 0) {
      const actionsSection = h('div', { class: 'differential-recommended-actions' },
        h('h4', { class: 'section-heading' },
          tr('Prioritized Actionable Clinical Directives', 'Directivas clínicas procesables priorizadas'),
        ),
        h('div', { class: 'actions-list' },
          evaluation.recommendedActions.map((act) => {
            let priorityBadge = 'chip chip-primary';
            if (act.priority === 'CRITICAL') priorityBadge = 'chip chip-emergency';
            else if (act.priority === 'HIGH') priorityBadge = 'chip chip-warn';
            else if (act.priority === 'DE_ESCALATION') priorityBadge = 'chip chip-ok';

            return h('div', { class: 'action-card card' },
              h('div', { class: 'facility-head' },
                h('strong', null, act.title),
                h('span', { class: priorityBadge }, act.priority),
              ),
              h('p', null, act.description),
              act.phone
                ? h('div', { class: 'action-button-row no-print' },
                    tel(act.phone, tr(`Call ${act.phone}`, `Llamar al ${act.phone}`), { class: 'btn btn-danger btn-small' }),
                  )
                : null,
            );
          }),
        ),
      );

      resultsContainer.append(actionsSection);
    }

    // 4. Clinical Navigation Cross-Links (if onNavigate is supplied)
    if (typeof onNavigate === 'function') {
      const navLinks = h('div', { class: 'differential-cross-nav no-print' },
        h('h5', null, tr('Related HarborPath Clinical Tools:', 'Herramientas clínicas relacionadas de HarborPath:')),
        h('div', { class: 'actions' },
          h('button', {
            type: 'button',
            class: 'btn btn-secondary btn-small',
            id: 'btn-nav-pacer',
            onclick: () => onNavigate('pacing'),
          }, icon('clock'), ' ', tr('Overdose Rescue Pacing Assistant', 'Asistente de ritmo de rescate de sobredosis')),
          h('button', {
            type: 'button',
            class: 'btn btn-secondary btn-small',
            id: 'btn-nav-strip-calc',
            onclick: () => onNavigate('checking'),
          }, icon('shield'), ' ', tr('Test Strip Dilution Simulator', 'Simulador de tiras reactivas')),
          h('button', {
            type: 'button',
            class: 'btn btn-secondary btn-small',
            id: 'btn-nav-facilities',
            onclick: () => onNavigate('treatment'),
          }, icon('pin'), ' ', tr('Emergency Medical & Treatment Centers', 'Centros médicos de emergencia y tratamiento')),
        ),
      );
      resultsContainer.append(navLinks);
    }

    // 5. EMTALA Hospital Screening Legal Notice
    resultsContainer.append(
      h('div', { class: 'callout callout-info fine emtala-notice' },
        h('strong', null, tr('EMTALA Legal Protection: ', 'Protección legal EMTALA: ')),
        tr(
          'Under federal law (Emergency Medical Treatment and Labor Act, 42 U.S.C. § 1395dd), any person presenting to an emergency department with an emergency medical condition or severe withdrawal is legally entitled to a medical screening examination and stabilizing treatment, regardless of health insurance, citizenship, ability to pay, or substance use history.',
          'Bajo la ley federal (Ley de Tratamiento Médico de Emergencia y Trabajo de Parto, 42 U.S.C. § 1395dd), cualquier persona que acuda a una sala de emergencias con una condición médica de emergencia tiene derecho legal a un examen médico y estabilización, independientemente de seguro, ciudadanía, capacidad de pago o historial de consumo.',
        ),
      ),
    );
  }

  // Subscribe to state changes
  const unsubscribe = subscribeDifferentialState(() => {
    renderEvaluation();
  });

  // Initial render
  renderEvaluation();

  // Bottom Reset Button & Disclaimer
  const bottomResetBtn = h('button', {
    type: 'button',
    class: 'btn btn-ghost btn-small',
    id: 'btn-reset-differential-bottom',
    onclick: () => {
      resetDifferentialState();
      announce(tr('Differential checklist cleared.', 'Lista de verificación diferencial borrada.'));
    },
  }, icon('refresh'), ' ', tr('Reset All Symptoms', 'Restablecer todos los síntomas'));

  const footer = h('footer', { class: 'differential-footer actions no-print' },
    bottomResetBtn,
    h('span', { class: 'fine' },
      tr(
        'Differential assessments are evaluated purely in local browser memory. Zero responses are saved or transmitted.',
        'Las evaluaciones diferenciales se ejecutan puramente en la memoria local del navegador. No se guarda ni transmite ninguna respuesta.',
      ),
    ),
  );

  root.append(
    header,
    introText,
    privacyNotice,
    presetsNav,
    form,
    resultsContainer,
    footer,
  );

  return root;
}
