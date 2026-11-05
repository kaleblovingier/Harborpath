// public/js/views/adulterantCare.js
// HarborPath — Emerging Adulterants, Xylazine ("Tranq"), Nitazenes & Wound Care Specialist
// Clinical Harm Reduction, Sedation Triage, and Alpha-2 Adrenergic Rebound Engine
// Strictly Zero-PII, In-RAM ephemeral state, WCAG 2.2 AA accessible DOM

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

/**
 * Clinical profiles of major adulterants and novel synthetic substances.
 */
export const ADULTERANT_PROFILES = Object.freeze([
  {
    id: 'xylazine',
    nameEn: 'Xylazine ("Tranq", "Tranq Dope")',
    nameEs: 'Xilacina ("Tranq", "Tranq Dope")',
    classEn: 'Non-opioid central alpha-2 adrenergic receptor agonist (veterinary sedative)',
    classEs: 'Agonista adrenérgico alfa-2 central no opioide (sedante veterinario)',
    mechanismEn: 'Stimulates central presynaptic alpha-2 receptors, decreasing norepinephrine and dopamine release. Induces profound sedation, central bradycardia, hypotension, and systemic microvascular vasoconstriction.',
    mechanismEs: 'Estimula receptores alfa-2 presinápticos centrales, disminuyendo la liberación de noradrenalina y dopamina. Induce sedación profunda, bradicardia central, hipotensión y vasoconstricción microvascular sistémica.',
    naloxoneReversible: false,
    keyClinicalPearlsEn: [
      'Naloxone does NOT reverse xylazine sedation. However, always administer naloxone first because xylazine is virtually always combined with illicit fentanyl.',
      'If spontaneous breathing is restored (>=8–10 bpm with adequate tidal volume) but the person remains deeply asleep or unarousable, STOP giving extra naloxone.',
      'Repeated naloxone doses precipitate violent acute opioid withdrawal while failing to wake the patient from xylazine sedation.',
      'Place in recovery position, maintain an open airway, keep warm, and monitor respirations until normal responsiveness returns.'
    ],
    keyClinicalPearlsEs: [
      'La naloxona NO revierte la sedación por xilacina. Sin embargo, siempre aplique naloxona primero porque la xilacina casi siempre está mezclada con fentanilo.',
      'Si se restablece la respiración espontánea (>=8–10 respiraciones/min) pero la persona permanece profundamente dormida, NO administre más naloxona.',
      'Las dosis repetidas precipitan una abstinencia aguda severa de opioides sin despertar al paciente de la sedación por xilacina.',
      'Coloque a la persona en posición de recuperación, mantenga la vía aérea despejada, abríguela y vigile su respiración.'
    ]
  },
  {
    id: 'nitazenes',
    nameEn: 'Nitazenes (Benzimidazole Opioids: Isotonitazene, Protonitazene, Metonitazene)',
    nameEs: 'Nitazenos (Opioides benzimidazoles: Isotonitazeno, Protonitazeno, Metonitazeno)',
    classEn: 'Ultra-potent synthetic benzimidazole mu-opioid receptor full agonists',
    classEs: 'Agonistas completos de receptores opioides mu sintéticos ultra-potentes',
    mechanismEn: 'High-affinity mu-opioid receptor binding with potency 10x to 40x that of fentanyl and up to 1,000x that of morphine. Rapid onset of profound central respiratory depression and rigid chest wall syndrome ("wooden chest").',
    mechanismEs: 'Unión de alta afinidad a receptores opioides mu con una potencia 10 a 40 veces mayor que el fentanilo y hasta 1,000 veces mayor que la morfina. Provoca depresión respiratoria rápida y síndrome de tórax rígido.',
    naloxoneReversible: true,
    keyClinicalPearlsEn: [
      'Fully responsive to naloxone, but requires rapid, aggressive intervention due to extreme receptor potency.',
      'May require multiple repeated 4 mg doses of naloxone every 2 to 3 minutes along with sustained rescue breathing / bag-valve-mask ventilation.',
      'Can cause chest wall rigidity ("wooden chest"), preventing spontaneous chest expansion until naloxone displaces the ligand.',
      'Standard fentanyl test strips (FTS) do NOT detect nitazenes; laboratory GC-MS or specialized nitazene test strips are required.'
    ],
    keyClinicalPearlsEs: [
      'Completamente reversible con naloxona, pero requiere intervención inmediata y enérgica debido a su extrema potencia.',
      'Puede requerir dosis repetidas de 4 mg de naloxona cada 2 a 3 minutos junto con respiración de rescate continua.',
      'Puede causar rigidez de la pared torácica ("tórax de madera"), impidiendo la expansión torácica hasta que la naloxona actúe.',
      'Las tiras reactivas estándar para fentanilo NO detectan nitazenos; se requieren pruebas especializadas o análisis de laboratorio.'
    ]
  },
  {
    id: 'medetomidine',
    nameEn: 'Medetomidine & Dexmedetomidine',
    nameEs: 'Medetomidina y Dexmedetomidina',
    classEn: 'Ultra-potent central alpha-2 adrenergic agonist (100x–200x more potent than clonidine)',
    classEs: 'Agonista adrenérgico alfa-2 central ultra-potente (100 a 200 veces más potente que la clonidina)',
    mechanismEn: 'Extreme selectivity for alpha-2 adrenoceptors causing profound peripheral and central sympatholysis. Results in marked bradycardia (heart rates <40 bpm), severe hypotension, hypothermia, and prolonged unresponsiveness lasting up to 12 hours.',
    mechanismEs: 'Selectividad extrema por receptores adrenérgicos alfa-2 que causa simpaticólisis profunda. Provoca bradicardia marcada (<40 lpm), hipotensión severa, hipotermia e inconsciencia prolongada de hasta 12 horas.',
    naloxoneReversible: false,
    keyClinicalPearlsEn: [
      'Emerging rapidly in adulterated fentanyl supplies across multiple regions, often producing deeper and longer sedation than xylazine.',
      'Like xylazine, medetomidine is NOT reversed by naloxone. Administer naloxone for the fentanyl component, then protect the airway.',
      'Bradycardia can be profound; prehospital atropine is often ineffective due to persistent central alpha-2 agonism.',
      'Requires emergency medical evaluation (911 / EMS) for hemodynamic monitoring and supportive care.'
    ],
    keyClinicalPearlsEs: [
      'Emergiendo rápidamente en mezclas con fentanilo, produciendo una sedación aún más profunda y duradera que la xilacina.',
      'Al igual que la xilacina, NO se revierte con naloxona. Dé naloxona para revertir el fentanilo y proteja la vía aérea.',
      'La bradicardia puede ser severa; la atropina prehospitalaria a menudo es ineficaz debido al agonismo alfa-2 persistente.',
      'Requiere traslado médico de emergencia (911) para monitoreo hemodinámico y soporte vital.'
    ]
  }
]);

/**
 * Xylazine Necrotic Wound Care Protocols and Clinical Directives.
 */
export const WOUND_CARE_PRINCIPLES = Object.freeze([
  {
    category: 'cleansing',
    titleEn: '1. Gentle Cleansing (Saline or Soap & Water)',
    titleEs: '1. Limpieza Suave (Solución Salina o Agua y Jabón)',
    instructionsEn: 'Irrigate gently with sterile normal saline or clean tap water with mild unscented soap. Rinse thoroughly without rubbing aggressively.',
    instructionsEs: 'Irrigue suavemente con solución salina normal o agua limpia y jabón suave sin perfume. Enjuague bien sin frotar con fuerza.',
    doNotDoEn: 'NEVER use hydrogen peroxide, rubbing alcohol, iodine/Betadine, or bleach. These chemicals destroy fragile granulating cells and worsen tissue necrosis.',
    doNotDoEs: 'NUNCA use agua oxigenada, alcohol, yodo ni blanqueador. Estos químicos destruyen las células de cicatrización y empeoran la necrosis.'
  },
  {
    category: 'moisture',
    titleEn: '2. Moist Healing Environment',
    titleEs: '2. Ambiente Húmedo de Cicatrización',
    instructionsEn: 'Apply a generous layer of sterile petroleum jelly (Vaseline/Aquaphor) or non-adherent dressing (Xeroform / petrolatum gauze). Moist wound beds re-epithelialize up to 40% faster than dry crusting beds.',
    instructionsEs: 'Aplique una capa generosa de vaselina estéril o apósito no adherente (gasa con petrolato). Un ambiente húmedo cicatriza hasta 40% más rápido.',
    doNotDoEn: 'DO NOT allow the wound to dry out into a hard black scab. Hard scabs trap bacteria and adhere to bandages, tearing healing tissue when changed.',
    doNotDoEs: 'NO permita que la herida se seque formando una costra dura. Las costras duras atrapan bacterias y desgarran el tejido al cambiar las vendas.'
  },
  {
    category: 'dressing',
    titleEn: '3. Non-Adherent Covering & Wrapping',
    titleEs: '3. Vendaje y Cobertura No Adherente',
    instructionsEn: 'Cover with non-stick sterile pads (Telfa) and wrap gently with rolled gauze (Kerlix) or flexible tubular bandage. Change daily or whenever soiled/wet.',
    instructionsEs: 'Cubra con gasa estéril no adherente y envuelva suavemente con rollo de gasa elástica. Cambie el vendaje diariamente o cuando esté sucio/húmedo.',
    doNotDoEn: 'DO NOT wrap tightly or apply adhesive tape directly to fragile skin margins. Never debride or cut away black tissue at home.',
    doNotDoEs: 'NO envuelva con demasiada fuerza ni pegue cinta adhesiva en la piel frágil. NUNCA corte ni retire tejido negro en casa.'
  },
  {
    category: 'monitoring',
    titleEn: '4. Border Marking & Infection Surveillance',
    titleEs: '4. Marcado de Bordes y Vigilancia de Infección',
    instructionsEn: 'Use a ballpoint pen to trace the outer edge of redness with the current date and time. Check twice daily for outward spread.',
    instructionsEs: 'Use un bolígrafo para trazar el borde exterior del enrojecimiento con la fecha y hora. Revise dos veces al día para detectar expansión.',
    doNotDoEn: 'DO NOT ignore systemic signs. Immediate hospital ED evaluation is needed if redness spreads >2 cm, or if fever, chills, or foul odor occurs.',
    doNotDoEs: 'NO ignore signos sistémicos. Vaya a urgencias de inmediato si el enrojecimiento se expande más de 2 cm, o si hay fiebre, escalofríos o mal olor.'
  }
]);

/**
 * Xylazine Withdrawal & Adrenergic Rebound Clinical Framework.
 */
export const XYLAZINE_WITHDRAWAL_PROTOCOL = Object.freeze({
  onsetEn: 'Starts 8 to 24 hours after last use (often concurrent with or shortly following opioid withdrawal).',
  onsetEs: 'Inicia entre 8 y 24 horas después del último consumo (a menudo concurrente con el síndrome de abstinencia de opioides).',
  symptomsEn: [
    'Severe autonomic rebound: marked hypertension, resting tachycardia, diaphoresis, and tremors.',
    'Severe psychological agitation: profound anxiety, panic, emotional lability, and intractable restlessness.',
    'Intense muscular aches, chills, and severe insomnia.',
    'Note: Standard opioids (buprenorphine / methadone) relieve the opioid component but DO NOT satisfy the alpha-2 adrenergic deficit.'
  ],
  symptomsEs: [
    'Rebote autonómico severo: hipertensión marcada, taquicardia en reposo, diaforesis y temblores.',
    'Agitación psicológica severa: ansiedad extrema, pánico, labilidad emocional e inquietud intensa.',
    'Dolores musculares intensos, escalofríos e insomnio persistente.',
    'Nota: Los opioides estándar (buprenorfina / metadona) alivian la abstinencia de opioides pero NO corrigen el déficit adrenérgico alfa-2.'
  ],
  pharmacotherapyEn: [
    'Alpha-2 Agonist: Clonidine 0.1 mg to 0.3 mg PO every 6–8 hours (titrated to blood pressure and pulse; hold if SBP < 90 mmHg or HR < 50 bpm).',
    'Alpha-2 Agonist alternative: Guanfacine 1 mg to 2 mg PO daily.',
    'Muscle Relaxant / Adrenergic modulator: Tizanidine 2 mg to 4 mg PO every 8 hours for muscular spasm and autonomic calming.',
    'Adjunctive symptom relief: Hydroxyzine (anxiety/nausea), gabapentin (neuropathic dysesthesias), acetaminophen/NSAIDs for pain.',
    'Concurrent MOUD: Initiate buprenorphine (micro-induction or standard) or methadone simultaneously to treat the opioid dependence.'
  ],
  pharmacotherapyEs: [
    'Agonista alfa-2: Clonidina 0.1 mg a 0.3 mg vía oral cada 6–8 horas (titulado según presión y pulso; suspender si PAS < 90 mmHg o FC < 50 lpm).',
    'Alternativa alfa-2: Guanfacina 1 mg a 2 mg vía oral al día.',
    'Relajante muscular / modulador: Tizanidina 2 mg a 4 mg vía oral cada 8 horas para espasmos y calma autonómica.',
    'Alivio complementario: Hidroxizina (ansiedad/náuseas), gabapentina (disestesias neuropáticas), acetaminofén/AINEs.',
    'MOUD concurrente: Iniciar buprenorfina o metadona simultáneamente para tratar la dependencia a opioides.'
  ]
});

/**
 * Test Strip Dilution Standards for XTS & FTS to prevent false positives and the hook effect.
 */
export const TEST_STRIP_STANDARDS = Object.freeze([
  {
    substanceId: 'fentanyl_powder',
    nameEn: 'Powder Fentanyl / "Tranq Dope"',
    nameEs: 'Fentanilo en Polvo / "Tranq Dope"',
    waterRatioEn: 'Mix 10 mg of residue (about the size of a match head) with 5 mL (1 full teaspoon / medicine cup) of water.',
    waterRatioEs: 'Mezcle 10 mg de residuo (tamaño de la cabeza de un fósforo) con 5 mL (1 cucharadita de agua).',
    dipTimeSeconds: 15,
    waitTimeMinutes: '3 to 5 minutes',
    interpretationEn: '1 line = Positive (adulterant detected). 2 lines = Negative. No line = Invalid.',
    interpretationEs: '1 línea = Positivo (adulterante detectado). 2 líneas = Negativo. Sin líneas = Inválido.'
  },
  {
    substanceId: 'counterfeit_pills',
    nameEn: 'Counterfeit Pressed Pills (fake M30s, fake Xanax)',
    nameEs: 'Pastillas Falsificadas (falsas M30, falso Xanax)',
    waterRatioEn: 'Crush the entire pill or scrape a small 10 mg portion, dissolve in 5 mL (1 teaspoon) of water.',
    waterRatioEs: 'Triture la pastilla o raspe 10 mg, disuelva en 5 mL (1 cucharadita) de agua.',
    dipTimeSeconds: 15,
    waitTimeMinutes: '3 to 5 minutes',
    interpretationEn: '1 line = Positive. 2 lines = Negative (even a faint second line is negative).',
    interpretationEs: '1 línea = Positivo. 2 líneas = Negativo (incluso una segunda línea tenue es negativo).'
  },
  {
    substanceId: 'stimulants_meth_cocaine',
    nameEn: 'Stimulants (Methamphetamine / MDMA / Cocaine)',
    nameEs: 'Estimulantes (Metanfetamina / MDMA / Cocaína)',
    waterRatioEn: 'CRITICAL: High concentration causes false positives on XTS and FTS. Use 1 full cup (200 mL / 8 oz) of water for every 10 mg of methamphetamine or MDMA.',
    waterRatioEs: 'CRÍTICO: La alta concentración causa falsos positivos. Use 1 taza completa (200 mL) de agua por cada 10 mg de metanfetamina o MDMA.',
    dipTimeSeconds: 15,
    waitTimeMinutes: '3 to 5 minutes',
    interpretationEn: 'Proper dilution is essential to prevent false positives from secondary amines.',
    interpretationEs: 'La dilución adecuada es esencial para evitar falsos positivos por aminas secundarias.'
  }
]);

/**
 * Evaluates patient presentation for sedation triage, overdose emergency, or sepsis.
 *
 * @param {Object} observations
 * @param {boolean} [observations.breathingAbsentOrSlow=false]
 * @param {boolean} [observations.cyanosisLipsFingers=false]
 * @param {boolean} [observations.deepSedationWithBreathing=false]
 * @param {boolean} [observations.woundSpreadingOrFever=false]
 * @param {boolean} [observations.autonomicStormWithdrawal=false]
 * @returns {Object} Evaluation with clinical urgency and life-safety instructions.
 */
export function evaluateAdulterantRisk(observations = {}) {
  const {
    breathingAbsentOrSlow = false,
    cyanosisLipsFingers = false,
    deepSedationWithBreathing = false,
    woundSpreadingOrFever = false,
    autonomicStormWithdrawal = false
  } = observations;

  // Level 1: Acute Opioid Overdose & Respiratory Arrest
  if (breathingAbsentOrSlow || cyanosisLipsFingers) {
    return {
      severity: 'emergency_911_overdose',
      urgencyEn: 'CRITICAL EMERGENCY: Opioid Overdose & Respiratory Arrest',
      urgencyEs: 'EMERGENCIA CRÍTICA: Sobredosis de Opioides y Paro Respiratorio',
      summaryEn: 'Patient is not breathing adequately or exhibits blue/gray lips or fingers. Immediate resuscitation is required.',
      summaryEs: 'La persona no respira adecuadamente o tiene labios/dedos azules o grises. Se requiere reanimación inmediata.',
      actionStepsEn: [
        'Call 911 immediately. State your exact location and say "A person is unresponsive and not breathing."',
        'Administer 4 mg naloxone (Narcan) nasal spray into 1 nostril immediately.',
        'Provide rescue breathing: 1 breath every 5 seconds using a barrier device or bag-valve-mask.',
        'If breathing does not resume after 2–3 minutes, give a second naloxone dose in the other nostril.',
        'Even if tranq is suspected, naloxone is mandatory to reverse the fatal fentanyl component.'
      ],
      actionStepsEs: [
        'Llame al 911 de inmediato. Diga su ubicación exacta y que una persona no respira.',
        'Aplique 4 mg de naloxona (Narcan) en una fosa nasal de inmediato.',
        'Dé respiraciones de rescate: 1 respiración cada 5 segundos.',
        'Si no respira normalmente después de 2 a 3 minutos, aplique una segunda dosis en la otra fosa nasal.',
        'Incluso si sospecha tranq, la naloxona es obligatoria para revertir el fentanilo.'
      ]
    };
  }

  // Level 2: Sepsis / Severe Necrotic Infection
  if (woundSpreadingOrFever) {
    return {
      severity: 'urgent_medical_sepsis',
      urgencyEn: 'URGENT: Sepsis or Deep Tissue Infection Risk',
      urgencyEs: 'URGENTE: Riesgo de Sepsis o Infección de Tejidos Profundos',
      summaryEn: 'Presence of spreading erythema, systemic fever, chills, crepitus, or foul wound discharge indicates systemic infection.',
      summaryEs: 'El enrojecimiento expansivo, fiebre sistémica, escalofríos o supuración fétida indican una infección grave o sepsis.',
      actionStepsEn: [
        'Seek emergency department medical evaluation immediately under EMTALA protections.',
        'Do not squeeze, lance, or debride the wound at home.',
        'Request hospital wound care and non-judgmental inpatient or outpatient parenteral antibiotic therapy.',
        'Ask about concurrent MOUD (buprenorphine or methadone) so withdrawal does not prevent completing antibiotic treatment.'
      ],
      actionStepsEs: [
        'Busque atención médica de urgencias de inmediato bajo las protecciones de EMTALA.',
        'No exprima, corte ni desbride la herida en casa.',
        'Solicite antibióticos y curación profesional sin discriminación.',
        'Pida inicio concurrente de buprenorfina o metadona para que la abstinencia no impida completar los antibióticos.'
      ]
    };
  }

  // Level 3: Alpha-2 Sedation ("Tranq Sleep" with Adequate Respirations)
  if (deepSedationWithBreathing) {
    return {
      severity: 'alpha2_prolonged_sedation',
      urgencyEn: 'Alpha-2 Sedation ("Tranq Sleep") — Airway & Monitoring Priority',
      urgencyEs: 'Sedación Alfa-2 ("Sueño por Tranq") — Prioridad de Vía Aérea y Monitoreo',
      summaryEn: 'Patient is breathing spontaneously and adequately (>=8–10 bpm with normal color) but remains unresponsive due to xylazine or medetomidine.',
      summaryEs: 'La persona respira de manera espontánea y suficiente (>=8–10 respiraciones/min) pero permanece inconsciente debido a xilacina o medetomidina.',
      actionStepsEn: [
        'DO NOT administer extra naloxone if breathing is adequate. Excess naloxone causes violent opioid withdrawal without waking the patient.',
        'Roll into the RECOVERY POSITION on their side to prevent fatal vomit aspiration.',
        'Tilt head slightly back to keep the airway open. Clear any vomit or obstructions from mouth.',
        'Keep them warm with blankets (alpha-2 sedatives impair thermoregulation and cause hypothermia).',
        'Re-check respirations every 2 minutes. If breathing drops below 8 bpm or stops, give naloxone and call 911 immediately.'
      ],
      actionStepsEs: [
        'NO administre más naloxona si respira adecuadamente. El exceso causa abstinencia severa sin despertar a la persona.',
        'Coloque a la persona en POSICIÓN DE RECUPERACIÓN de lado para evitar asfixia por vómito.',
        'Incline la cabeza hacia atrás para mantener la vía aérea abierta.',
        'Manténgala abrigada con mantas (la xilacina altera la temperatura y causa hipotermia).',
        'Revise la respiración cada 2 minutos. Si baja de 8 respiraciones o se detiene, dé naloxona y llame al 911.'
      ]
    };
  }

  // Level 4: Autonomic Rebound / Xylazine Withdrawal
  if (autonomicStormWithdrawal) {
    return {
      severity: 'xylazine_autonomic_withdrawal',
      urgencyEn: 'Xylazine Rebound & Autonomic Storm',
      urgencyEs: 'Rebote de Xilacina y Tormenta Autonómica',
      summaryEn: 'Severe rebound hypertension, tachycardia, tremors, and intense anxiety unresponsive to opioids alone.',
      summaryEs: 'Hipertensión de rebote severa, taquicardia, temblores y ansiedad intensa que no responden solo a opioides.',
      actionStepsEn: [
        'Consult a clinician for alpha-2 agonist pharmacotherapy: Clonidine 0.1–0.3 mg PO TID or Tizanidine 2–4 mg PO TID.',
        'Pair alpha-2 pharmacotherapy with MOUD (buprenorphine or methadone) to resolve dual physical dependence.',
        'Monitor resting pulse and blood pressure before each clonidine dose (hold if SBP < 90 mmHg or HR < 50 bpm).',
        'Stay hydrated with electrolyte solutions and rest in a low-stimulus environment.'
      ],
      actionStepsEs: [
        'Consulte a un médico para tratamiento con agonistas alfa-2: Clonidina 0.1–0.3 mg o Tizanidina 2–4 mg cada 8 horas.',
        'Combine la terapia alfa-2 con buprenorfina o metadona para tratar la dependencia dual.',
        'Monitoree la presión y pulso antes de cada dosis de clonidina (suspender si PAS < 90 o FC < 50).',
        'Hidrátese con suero o electrolitos y descanse en un ambiente tranquilo.'
      ]
    };
  }

  // Default: Stable / Routine Harm Reduction
  return {
    severity: 'routine_harm_reduction',
    urgencyEn: 'Routine Adulterant Harm Reduction & Drug Checking',
    urgencyEs: 'Reducción de Daños Rutinaria y Pruebas de Sustancias',
    summaryEn: 'No acute emergency identified. Continue proactive test strip verification, sterile supplies, and skin protection.',
    summaryEs: 'No se identifica emergencia aguda. Continúe con pruebas de sustancias, insumos estériles y cuidado de la piel.',
    actionStepsEn: [
      'Test all street supplies with xylazine and fentanyl test strips prior to use.',
      'Never use alone: use with a trusted peer, stagger use, or call Never Use Alone at 877-696-1996.',
      'Always carry at least 2 doses of naloxone (Narcan).',
      'Practice gentle wound care with saline and petroleum jelly on any developing skin breaks.'
    ],
    actionStepsEs: [
      'Pruebe sus sustancias con tiras para xilacina y fentanilo antes de consumir.',
      'Nunca consuma a solas: alterne el consumo o llame a Never Use Alone al 877-696-1996.',
      'Lleve siempre consigo al menos 2 dosis de naloxona.',
      'Cuide cualquier herida suavemente con solución salina y vaselina.'
    ]
  };
}

/**
 * Ephemeral In-RAM state for Adulterant Care view.
 */
let adulterantState = {
  activeTab: 'profiles', // 'profiles' | 'sedation-triage' | 'wound-care' | 'withdrawal' | 'test-strips'
  breathingAbsentOrSlow: false,
  cyanosisLipsFingers: false,
  deepSedationWithBreathing: false,
  woundSpreadingOrFever: false,
  autonomicStormWithdrawal: false,
  selectedTestSubstance: 'fentanyl_powder'
};

export function getAdulterantState() {
  return { ...adulterantState };
}

export function setAdulterantState(patch) {
  adulterantState = { ...adulterantState, ...patch };
}

export function resetAdulterantState() {
  adulterantState = {
    activeTab: 'profiles',
    breathingAbsentOrSlow: false,
    cyanosisLipsFingers: false,
    deepSedationWithBreathing: false,
    woundSpreadingOrFever: false,
    autonomicStormWithdrawal: false,
    selectedTestSubstance: 'fentanyl_powder'
  };
}

/**
 * Formats a plain text summary report for care teams or patient records.
 *
 * @param {Object} state
 * @param {string} [lang='en']
 * @returns {string} Plain text summary
 */
export function formatAdulterantSummaryText(state = adulterantState, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateAdulterantRisk(state);

  const lines = [
    isEs ? 'HARBORPATH — REPORTE CLÍNICO DE ADULTERANTES Y XILACINA' : 'HARBORPATH — CLINICAL ADULTERANT & XYLAZINE CARE REPORT',
    isEs ? `Fecha y hora: ${new Date().toISOString()}` : `Generated: ${new Date().toISOString()}`,
    '------------------------------------------------------------',
    isEs ? `ESTADO CLÍNICO: ${evalResult.urgencyEs}` : `CLINICAL STATUS: ${evalResult.urgencyEn}`,
    isEs ? `Resumen: ${evalResult.summaryEs}` : `Summary: ${evalResult.summaryEn}`,
    '',
    isEs ? 'DIRECTIVAS DE ACCIÓN CLÍNICA:' : 'CLINICAL ACTION DIRECTIVES:',
    ...(isEs ? evalResult.actionStepsEs : evalResult.actionStepsEn).map((step, idx) => `${idx + 1}. ${step}`),
    '',
    isEs ? 'PRINCIPIOS ESENCIALES DE CUIDADO DE HERIDAS:' : 'ESSENTIAL WOUND CARE PRINCIPLES:',
    isEs
      ? '- Limpieza suave con solución salina o agua y jabón; NUNCA usar agua oxigenada ni alcohol.'
      : '- Gentle cleansing with saline or soap & water; NEVER use hydrogen peroxide, alcohol, or bleach.',
    isEs
      ? '- Mantener la herida húmeda con vaselina estéril y apósito no adherente.'
      : '- Maintain a moist healing environment with petroleum jelly and non-adherent dressing.',
    isEs
      ? '- Marcar bordes con bolígrafo para vigilar expansión; ir a urgencias si hay fiebre o celulitis.'
      : '- Mark red borders with pen to monitor spread; seek ED care for fever or spreading cellulitis.',
    '',
    isEs ? 'PROTOCOLO DE ABSTINENCIA DE XILACINA:' : 'XYLAZINE WITHDRAWAL PROTOCOL:',
    isEs
      ? '- Requiere agonistas alfa-2 (Clonidina 0.1–0.3 mg c/8h o Tizanidina 2–4 mg c/8h) junto con MOUD.'
      : '- Requires alpha-2 adrenergic agonists (Clonidine 0.1–0.3 mg TID or Tizanidine 2–4 mg TID) alongside MOUD.',
    '------------------------------------------------------------',
    isEs
      ? 'Aviso: Esta herramienta es una guía educativa clínica y de reducción de daños. No sustituye el juicio médico profesional.'
      : 'Disclaimer: This tool provides clinical harm reduction and educational guidance. It does not substitute professional medical judgment.'
  ];

  return lines.join('\n');
}

/**
 * Main View Renderer for Adulterant Care.
 *
 * @returns {HTMLElement}
 */
export function adulterantCareView() {
  const container = h('div', { class: 'adulterant-care-view container' });

  // Header Section
  const header = h('header', { class: 'view-header' },
    h('div', { class: 'badge-pill' }, icon('shield'), t('adulterant.badge', 'Clinical Toxicology & Harm Reduction')),
    h('h1', null, t('adulterant.title', 'Emerging Adulterants, Xylazine & Wound Care')),
    h('p', { class: 'lead' },
      t('adulterant.lead', 'Evidence-based clinical guidelines for xylazine ("tranq"), nitazenes, alpha-2 sedation triage, necrotic wound management, and test strip standards.')
    )
  );

  // Accessible Tab Navigation
  const tabNav = h('div', { class: 'tab-nav', role: 'tablist', 'aria-label': t('adulterant.tablist', 'Adulterant Care Navigation') });

  const tabs = [
    { id: 'profiles', label: t('adulterant.tab.profiles', 'Adulterant Profiles') },
    { id: 'sedation-triage', label: t('adulterant.tab.triage', 'Sedation vs. Overdose Triage') },
    { id: 'wound-care', label: t('adulterant.tab.wounds', 'Necrotic Wound Care') },
    { id: 'withdrawal', label: t('adulterant.tab.withdrawal', 'Withdrawal & Rebound') },
    { id: 'test-strips', label: t('adulterant.tab.strips', 'Test Strip Standards') }
  ];

  const tabButtons = new Map();
  const contentArea = h('div', { class: 'tab-content-area', id: 'adulterant-content-slot', 'aria-live': 'polite' });

  function switchTab(newTabId) {
    adulterantState.activeTab = newTabId;
    for (const [id, btn] of tabButtons) {
      const isActive = id === newTabId;
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
    renderActiveTab();
  }

  for (const tab of tabs) {
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      class: 'tab-btn' + (adulterantState.activeTab === tab.id ? ' active' : ''),
      id: `tab-adulterant-${tab.id}`,
      'aria-selected': adulterantState.activeTab === tab.id ? 'true' : 'false',
      'aria-controls': `panel-adulterant-${tab.id}`,
      tabindex: adulterantState.activeTab === tab.id ? '0' : '-1'
    }, tab.label);

    btn.addEventListener('click', () => switchTab(tab.id));
    tabButtons.set(tab.id, btn);
    tabNav.appendChild(btn);
  }

  // Keyboard navigation for tablist (roving tabindex)
  tabNav.addEventListener('keydown', (e) => {
    const tabIds = tabs.map((t) => t.id);
    const currIndex = tabIds.indexOf(adulterantState.activeTab);
    let nextIndex = currIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currIndex + 1) % tabIds.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currIndex - 1 + tabIds.length) % tabIds.length;
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextIndex = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextIndex = tabIds.length - 1;
      e.preventDefault();
    }

    if (nextIndex !== currIndex) {
      const nextId = tabIds[nextIndex];
      switchTab(nextId);
      const nextBtn = tabButtons.get(nextId);
      if (nextBtn) nextBtn.focus();
    }
  });

  // Render Tab Content
  function renderActiveTab() {
    clear(contentArea);
    const activeTab = adulterantState.activeTab;
    const panel = h('section', {
      role: 'tabpanel',
      id: `panel-adulterant-${activeTab}`,
      'aria-labelledby': `tab-adulterant-${activeTab}`,
      class: 'tab-panel'
    });

    if (activeTab === 'profiles') {
      renderProfilesTab(panel);
    } else if (activeTab === 'sedation-triage') {
      renderTriageTab(panel);
    } else if (activeTab === 'wound-care') {
      renderWoundCareTab(panel);
    } else if (activeTab === 'withdrawal') {
      renderWithdrawalTab(panel);
    } else if (activeTab === 'test-strips') {
      renderTestStripsTab(panel);
    }

    contentArea.appendChild(panel);
  }

  // TAB 1: Adulterant Profiles
  function renderProfilesTab(panel) {
    panel.appendChild(h('h2', null, t('adulterant.profiles.title', 'Profiles of Major Synthetic Adulterants')));
    panel.appendChild(h('p', null, t('adulterant.profiles.intro', 'Illicit drug supplies in the United States and North America frequently contain non-opioid adulterants or ultra-potent synthetic opioids.')));

    const grid = h('div', { class: 'pathway-cards-grid' });
    for (const profile of ADULTERANT_PROFILES) {
      const card = h('article', { class: 'action-card' },
        h('h3', null, profile.nameEn),
        h('p', { class: 'sub-header' }, h('strong', null, t('adulterant.classLabel', 'Class: ')), profile.classEn),
        h('p', null, profile.mechanismEn),
        h('div', { class: 'badge-pill' + (profile.naloxoneReversible ? ' bg-success' : ' bg-warning') },
          profile.naloxoneReversible
            ? t('adulterant.naloxoneYes', 'Naloxone Reversible (Mu-Opioid)')
            : t('adulterant.naloxoneNo', 'NOT Naloxone Reversible (Alpha-2 Agonist)')
        ),
        h('h4', null, t('adulterant.pearlsHeader', 'Key Clinical Pearls & Actions:')),
        h('ul', null,
          profile.keyClinicalPearlsEn.map((pearl) => h('li', null, pearl))
        )
      );
      grid.appendChild(card);
    }
    panel.appendChild(grid);
  }

  // TAB 2: Sedation vs Overdose Triage Calculator
  function renderTriageTab(panel) {
    panel.appendChild(h('h2', null, t('adulterant.triage.title', 'Alpha-2 Sedation vs. Acute Opioid Overdose Triage')));
    panel.appendChild(h('p', null, t('adulterant.triage.intro', 'Select the patient’s observed clinical signs to determine whether immediate 911 / naloxone resuscitation, airway protection in the recovery position, or urgent hospital care is required.')));

    const form = h('div', { class: 'form-card' });

    function createCheckbox(id, labelEn, isChecked, onChange) {
      const wrap = h('label', { class: 'checkbox-label' },
        h('input', {
          type: 'checkbox',
          id,
          name: id,
          ...(isChecked ? { checked: 'checked' } : {})
        }),
        h('span', null, labelEn)
      );
      wrap.querySelector('input').addEventListener('change', (e) => onChange(e.target.checked));
      return wrap;
    }

    form.appendChild(h('h3', null, t('adulterant.triage.checklistTitle', 'Observed Clinical Signs:')));

    form.appendChild(createCheckbox(
      'chk-breathing',
      'Breathing is absent, slow (<8 bpm), irregular, or choking / gurgling sounds (acute opioid overdose sign)',
      adulterantState.breathingAbsentOrSlow,
      (val) => {
        adulterantState.breathingAbsentOrSlow = val;
        updateTriageResult();
      }
    ));

    form.appendChild(createCheckbox(
      'chk-cyanosis',
      'Lips, fingernails, or skin are blue, gray, or ashen (hypoxia / respiratory arrest sign)',
      adulterantState.cyanosisLipsFingers,
      (val) => {
        adulterantState.cyanosisLipsFingers = val;
        updateTriageResult();
      }
    ));

    form.appendChild(createCheckbox(
      'chk-sedation',
      'Breathing is spontaneous & regular (>=8–10 bpm, normal skin color) but patient remains in deep, unarousable sleep ("tranq sleep")',
      adulterantState.deepSedationWithBreathing,
      (val) => {
        adulterantState.deepSedationWithBreathing = val;
        updateTriageResult();
      }
    ));

    form.appendChild(createCheckbox(
      'chk-wound',
      'Wound shows spreading redness (>2 cm), black necrotic eschar, foul discharge, or patient has fever/chills (sepsis risk)',
      adulterantState.woundSpreadingOrFever,
      (val) => {
        adulterantState.woundSpreadingOrFever = val;
        updateTriageResult();
      }
    ));

    form.appendChild(createCheckbox(
      'chk-rebound',
      'Severe autonomic storm: high blood pressure, racing pulse, tremors, diaphoresis, and panic 8–24h after last use',
      adulterantState.autonomicStormWithdrawal,
      (val) => {
        adulterantState.autonomicStormWithdrawal = val;
        updateTriageResult();
      }
    ));

    panel.appendChild(form);

    const resultCard = h('div', { class: 'script-preview-card', id: 'adulterant-triage-output' });
    panel.appendChild(resultCard);

    function updateTriageResult() {
      clear(resultCard);
      const evalResult = evaluateAdulterantRisk(adulterantState);

      resultCard.appendChild(h('h3', null, evalResult.urgencyEn));
      resultCard.appendChild(h('p', { class: 'lead' }, evalResult.summaryEn));
      resultCard.appendChild(h('h4', null, t('adulterant.actionDirectives', 'Immediate Action Directives:')));
      resultCard.appendChild(h('ul', null,
        evalResult.actionStepsEn.map((step) => h('li', null, step))
      ));
    }

    updateTriageResult();

    // Export Button
    const exportBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary'
    }, icon('share'), t('adulterant.copySummary', 'Copy Clinical Assessment Summary'));

    exportBtn.addEventListener('click', () => {
      const summary = formatAdulterantSummaryText(adulterantState);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(summary).then(() => {
          exportBtn.textContent = t('adulterant.copied', 'Summary Copied to Clipboard!');
          setTimeout(() => {
            exportBtn.textContent = t('adulterant.copySummary', 'Copy Clinical Assessment Summary');
          }, 2500);
        });
      }
    });

    panel.appendChild(exportBtn);
  }

  // TAB 3: Necrotic Wound Care Protocols
  function renderWoundCareTab(panel) {
    panel.appendChild(h('h2', null, t('adulterant.wounds.title', 'Xylazine Necrotic Wound Care & Harm Reduction')));
    panel.appendChild(h('p', null, t('adulterant.wounds.intro', 'Xylazine causes systemic microvascular vasoconstriction, causing necrotic ulcers to appear anywhere on the body—not just at injection sites. Follow evidence-based wound care principles:')));

    const grid = h('div', { class: 'pathway-cards-grid' });

    for (const rule of WOUND_CARE_PRINCIPLES) {
      const card = h('article', { class: 'rule-card' },
        h('h3', null, rule.titleEn),
        h('p', null, h('strong', null, t('adulterant.instructionsLabel', 'What to do: ')), rule.instructionsEn),
        h('p', { class: 'danger-text' }, h('strong', null, t('adulterant.doNotDoLabel', 'CRITICAL WHAT NOT TO DO: ')), rule.doNotDoEn)
      );
      grid.appendChild(card);
    }

    panel.appendChild(grid);

    // Sepsis warning box
    const sepsisBox = h('div', { class: 'script-preview-card' },
      h('h3', null, icon('alert'), t('adulterant.sepsisHeader', 'Emergency Sepsis & Infection Red Flags')),
      h('p', null, t('adulterant.sepsisDesc', 'If you observe any of the following, seek emergency medical care (ED / 911) immediately:')),
      h('ul', null,
        h('li', null, 'Redness or swelling spreading rapidly (>2 cm) beyond wound margins'),
        h('li', null, 'Fever (>100.4°F / 38°C), body chills, shivers, or profuse sweats'),
        h('li', null, 'Brown dishwater fluid, foul pungent odor, or exposed tendon / bone'),
        h('li', null, 'Crepitus (crackling feeling under the skin caused by gas-producing bacteria)'),
        h('li', null, 'Rapid heart rate (>100 bpm), low blood pressure, severe dizziness, or confusion')
      )
    );
    panel.appendChild(sepsisBox);
  }

  // TAB 4: Withdrawal & Autonomic Storm Protocol
  function renderWithdrawalTab(panel) {
    panel.appendChild(h('h2', null, t('adulterant.withdrawal.title', 'Xylazine Withdrawal & Adrenergic Rebound Protocol')));
    panel.appendChild(h('p', null, t('adulterant.withdrawal.intro', 'Abrupt cessation of chronic xylazine causes a severe rebound adrenergic storm. Standard MOUD (buprenorphine/methadone) alone does not relieve alpha-2 withdrawal.')));

    const card = h('article', { class: 'action-card' },
      h('h3', null, t('adulterant.withdrawal.symptomsHeader', 'Clinical Presentation & Timeline')),
      h('p', null, h('strong', null, t('adulterant.withdrawal.onsetLabel', 'Onset: ')), XYLAZINE_WITHDRAWAL_PROTOCOL.onsetEn),
      h('ul', null,
        XYLAZINE_WITHDRAWAL_PROTOCOL.symptomsEn.map((s) => h('li', null, s))
      ),
      h('h3', null, t('adulterant.withdrawal.pharmaHeader', 'Targeted Pharmacotherapy & Management')),
      h('ul', null,
        XYLAZINE_WITHDRAWAL_PROTOCOL.pharmacotherapyEn.map((p) => h('li', null, p))
      )
    );

    panel.appendChild(card);
  }

  // TAB 5: Test Strip Standards
  function renderTestStripsTab(panel) {
    panel.appendChild(h('h2', null, t('adulterant.strips.title', 'Drug Checking & Test Strip Standards (XTS & FTS)')));
    panel.appendChild(h('p', null, t('adulterant.strips.intro', 'Proper dilution is critical. High drug concentrations cause false positives on xylazine test strips (XTS) and fentanyl test strips (FTS).')));

    const grid = h('div', { class: 'pathway-cards-grid' });

    for (const standard of TEST_STRIP_STANDARDS) {
      const card = h('article', { class: 'action-card' },
        h('h3', null, standard.nameEn),
        h('p', null, h('strong', null, t('adulterant.waterRatio', 'Dilution Ratio: ')), standard.waterRatioEn),
        h('p', null, h('strong', null, t('adulterant.dipTime', 'Dip Time: ')), `${standard.dipTimeSeconds} seconds`),
        h('p', null, h('strong', null, t('adulterant.waitTime', 'Wait Time: ')), standard.waitTimeMinutes),
        h('p', null, h('strong', null, t('adulterant.interpretation', 'Interpretation: ')), standard.interpretationEn)
      );
      grid.appendChild(card);
    }

    panel.appendChild(grid);
  }

  // Initial tab render
  renderActiveTab();

  container.appendChild(header);
  container.appendChild(tabNav);
  container.appendChild(contentArea);

  return container;
}
