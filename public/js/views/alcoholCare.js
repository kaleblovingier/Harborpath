// public/js/views/alcoholCare.js
// HarborPath Alcohol Care, Medical Withdrawal & MAUD Specialist
// Pure ES module, 0 dependencies. 100% ephemeral in-RAM clinical guidance.
// References:
// - Maldonado JR et al. The Prediction of Alcohol Withdrawal Severity Scale (PAWSS). Alcohol Alcohol. 2014;49(6):629-637.
// - ASAM Clinical Practice Guideline on Alcohol Withdrawal Management (2020)
// - SAMHSA TIP 49: Incorporating Alcohol Pharmacotherapies into Medical Practice (HHS Pub No. SMA 13-4380)
// - Sinclair JD. Evidence about the use of naltrexone and for different ways of using it in the treatment of alcoholism. Alcohol Alcohol. 2001;36(1):2-10.
// - Wernicke-Korsakoff Syndrome Prevention & Thiamine Protocols (Royal College of Physicians / EFNS Guidelines)

import { h, append, icon } from '../dom.js';
import { t } from '../i18n.js';

/**
 * Validated PAWSS 10-Item Risk Scale for complicated withdrawal / Delirium Tremens.
 */
export const PAWSS_ITEMS = Object.freeze([
  { id: 'p1_alcohol_recent', part: 'A', textEn: 'Alcohol consumed within the last 30 days', textEs: 'Consumo de alcohol en los últimos 30 días', points: 1 },
  { id: 'p2_prior_withdrawal', part: 'A', textEn: 'History of previous alcohol withdrawal episodes', textEs: 'Historial de episodios previos de abstinencia de alcohol', points: 1 },
  { id: 'p3_prior_seizure', part: 'A', textEn: 'History of alcohol withdrawal seizures', textEs: 'Historial de convulsiones por abstinencia de alcohol', points: 1 },
  { id: 'p4_prior_dt', part: 'A', textEn: 'History of Delirium Tremens (DTs)', textEs: 'Historial de Delirium Tremens (DT)', points: 1 },
  { id: 'p5_prior_rehab', part: 'A', textEn: 'History of inpatient detox, rehabilitation, or SUD treatment', textEs: 'Historial de desintoxicación hospitalaria o rehabilitación', points: 1 },
  { id: 'p6_high_tolerance', part: 'B', textEn: 'High physiological tolerance (drinks heavily without appearing intoxicated)', textEs: 'Alta tolerancia fisiológica (bebe grandes cantidades sin aparentar intoxicación)', points: 1 },
  { id: 'p7_autonomic_hyper', part: 'B', textEn: 'Current autonomic hyperactivity (pulse >100 bpm, tremor, sweating, agitation)', textEs: 'Hiperactividad autonómica actual (pulso >100 lpm, temblores, sudoración)', points: 1 },
  { id: 'p8_concurrent_sedative', part: 'B', textEn: 'Concurrent use of sedatives, benzodiazepines, or sleep aids', textEs: 'Uso concurrente de sedantes, benzodiazepinas o inductores del sueño', points: 1 },
  { id: 'p9_medical_comorbidity', part: 'B', textEn: 'Concurrent psychiatric disorder, head trauma, or serious medical condition', textEs: 'Trastorno psiquiátrico concurrente, traumatismo craneal o enfermedad médica grave', points: 1 },
  { id: 'p10_high_bal', part: 'C', textEn: 'Elevated blood alcohol level (BAL >= 200 mg/dL) or chronic heavy binge pattern', textEs: 'Nivel elevado de alcohol en sangre (>=200 mg/dL) o patrón de atracón crónico', points: 1 }
]);

/**
 * Clinical standards for Medications for Alcohol Use Disorder (MAUD).
 */
export const MAUD_STANDARDS = Object.freeze({
  NALTREXONE: {
    id: 'naltrexone',
    name: 'Naltrexone (ReVia / Vivitrol)',
    type: 'Mu-Opioid Receptor Antagonist',
    dosingEn: 'Oral tablet 50 mg daily, OR monthly extended-release intramuscular injection (Vivitrol 380 mg)',
    dosingEs: 'Tableta oral de 50 mg al día, O inyección intramuscular mensual de liberación prolongada (Vivitrol 380 mg)',
    mechanismEn: 'Blocks mu-opioid endorphin reward pathways, significantly reducing cravings and heavy drinking days. Does NOT make the person sick if alcohol is consumed.',
    mechanismEs: 'Bloquea los receptores opioides mu reduciendo las endorfinas placenteras, las ansias y los días de consumo excesivo. NO enferma a la persona si consume alcohol.',
    tsmProtocolEn: 'The Sinclair Method (TSM): Targeted dosing of 50 mg oral naltrexone taken 1 hour before anticipated drinking to uncouple conditioned reward pathways over time (pharmacological extinction).',
    tsmProtocolEs: 'El Método Sinclair (TSM): Dosis dirigida de 50 mg de naltrexona 1 hora antes de beber para desacoplar el refuerzo positivo progresivamente (extinción farmacológica).',
    contraindicationsEn: [
      'CRITICAL: Concurrent opioid use, buprenorphine, methadone, or prescription pain relievers. Must be completely opioid-free for 7–14 days before starting to avoid acute precipitated opioid withdrawal.',
      'Acute hepatitis or end-stage liver failure (requires baseline and periodic liver function monitoring).'
    ],
    contraindicationsEs: [
      'CRÍTICO: Uso concurrente de opioides, buprenorfina, metadona o analgésicos opioides. Debe estar libre de opioides de 7 a 14 días para evitar abstinencia precipitada severa.',
      'Hepatitis aguda o insuficiencia hepática terminal (requiere monitoreo hepático periódico).'
    ]
  },
  ACAMPROSATE: {
    id: 'acamprosate',
    name: 'Acamprosate (Campral)',
    type: 'GABA / NMDA Glutamatergic Modulator',
    dosingEn: 'Oral tablet 666 mg three times daily (two 333 mg delayed-release tablets TID) with meals',
    dosingEs: 'Tableta oral de 666 mg tres veces al día (dos tabletas de 333 mg TID) con las comidas',
    mechanismEn: 'Modulates hyperactive NMDA glutamate neurotransmission and restores GABA balance post-cessation. Substantially reduces post-acute withdrawal dysphoria, protracted anxiety, and cravings.',
    mechanismEs: 'Modula la hiperactividad del glutamato NMDA y restablece el equilibrio GABA tras la cesación. Disminuye la disforia post-abstinencia, la ansiedad prolongada y las ansias.',
    advantagesEn: [
      '100% excreted unchanged by kidneys with ZERO liver metabolism: the gold standard for individuals with alcohol-associated liver disease, hepatitis, or cirrhosis.',
      '100% compatible with concurrent opioids, buprenorphine, and methadone (no opioid receptor activity).'
    ],
    advantagesEs: [
      'Excreción 100% renal sin metabolismo hepático: el estándar de oro en enfermedad hepática, hepatitis o cirrosis.',
      'Completamente compatible con opioides, buprenorfina y metadona (sin actividad en receptores opioides).'
    ],
    contraindicationsEn: [
      'Severe renal impairment (Creatinine Clearance CrCl < 30 mL/min). Moderate impairment (CrCl 30–50 mL/min) requires dose reduction to 333 mg TID.'
    ],
    contraindicationsEs: [
      'Insuficiencia renal grave (Aclaramiento de creatinina CrCl < 30 mL/min). En insuficiencia moderada (30–50 mL/min), reducir dosis a 333 mg TID.'
    ]
  },
  DISULFIRAM: {
    id: 'disulfiram',
    name: 'Disulfiram (Antabuse)',
    type: 'Aldehyde Dehydrogenase (ALDH) Inhibitor (Deterrent)',
    dosingEn: 'Oral tablet 250 mg to 500 mg once daily',
    dosingEs: 'Tableta oral de 250 mg a 500 mg una vez al día',
    mechanismEn: 'Irreversibly blocks aldehyde dehydrogenase. If alcohol is consumed, toxic acetaldehyde accumulates rapidly, producing violent nausea, flushing, throbbing headache, chest pain, and hypotension within 10–30 minutes.',
    mechanismEs: 'Inhibe irreversiblemente la aldehído deshidrogenasa. Si se consume alcohol, el acetaldehído se acumula rápidamente provocando náuseas severas, taquicardia, dolor torácico e hipotensión en 10–30 minutos.',
    contraindicationsEn: [
      'Cardiovascular disease, coronary artery disease, heart failure, or severe hypertension.',
      'Active drinking or unintended alcohol exposure (including mouthwash, kombucha, alcohol-based cooking extracts).',
      'Cognitive impairment or lack of informed consent (never administer without patient knowledge).'
    ],
    contraindicationsEs: [
      'Enfermedad cardiovascular, insuficiencia cardíaca o hipertensión grave.',
      'Consumo activo de alcohol o exposición inadvertida (enjuagues bucales, kombucha, salsas con alcohol).',
      'Deterioro cognitivo o ausencia de consentimiento informado (nunca administrar sin el conocimiento del paciente).'
    ]
  }
});

/**
 * Wernicke-Korsakoff Syndrome Prevention Protocol.
 */
export const WERNICKE_PREVENTION = Object.freeze({
  titleEn: 'Wernicke-Korsakoff Syndrome: The Thiamine-Before-Glucose Mandate',
  titleEs: 'Síndrome de Wernicke-Korsakoff: Mandato de Tiamina Antes de Glucosa',
  triadEn: 'Classic Triad: Acute Confusion / Delirium, Ataxia (unsteady gait), and Ophthalmoplegia / Nystagmus (abnormal eye movements).',
  triadEs: 'Tríada Clásica: Confusión aguda / delirio, ataxia (marcha inestable) y oftalmoplejía / nistagmo.',
  emergencyDirectivesEn: [
    'CRITICAL PROTOCOL: Administer high-dose parenteral thiamine (Vitamin B1, 200–500 mg IV/IM) BEFORE administering any intravenous dextrose, glucose, or high-carbohydrate meals.',
    'Biochemical rationale: Glucose metabolism rapidly consumes remaining cerebral thiamine cofactors during pyruvate decarboxylation, triggering acute irreversible hemorrhagic necrosis of the mammillary bodies and thalamus.',
    'Prophylaxis is mandatory for any patient with chronic alcohol use, malnutrition, or significant withdrawal.'
  ],
  emergencyDirectivesEs: [
    'PROTOCOLO CRÍTICO: Administrar tiamina parenteral en dosis altas (Vitamina B1, 200 a 500 mg IV/IM) ANTES de administrar sueros glucosados, dextrosa o comidas ricas en carbohidratos.',
    'Fundamento bioquímico: El metabolismo de la glucosa agota rápidamente los cofactores residuales de tiamina, desencadenando necrosis hemorrágica irreversible en los cuerpos mamilares y tálamo.',
    'La profilaxis es obligatoria para cualquier paciente con consumo crónico de alcohol, desnutrición o abstinencia importante.'
  ]
});

/**
 * Calculate total PAWSS score from selected items.
 *
 * @param {Array<string>} selectedItemIds Array of checked PAWSS item IDs.
 * @returns {number} Score from 0 to 10.
 */
export function calculatePawssScore(selectedItemIds = []) {
  if (!Array.isArray(selectedItemIds)) return 0;
  const validIds = new Set(PAWSS_ITEMS.map((item) => item.id));
  return selectedItemIds.filter((id) => validIds.has(id)).length;
}

/**
 * Evaluates PAWSS score risk level and clinical disposition.
 *
 * @param {number} score
 * @returns {Object} Risk evaluation with severity, disposition, and protocols.
 */
export function evaluatePawssRisk(score = 0) {
  const s = Math.max(0, Math.min(10, Number(score) || 0));

  if (s >= 4) {
    return {
      score: s,
      severity: 'high_complicated_withdrawal',
      isHighRisk: true,
      titleEn: 'High Risk for Complicated Withdrawal / Delirium Tremens (PAWSS >= 4)',
      titleEs: 'Alto Riesgo de Abstinencia Complicada / Delirium Tremens (PAWSS >= 4)',
      textEn: 'A PAWSS score of 4 or higher indicates significant risk of severe, life-threatening alcohol withdrawal complications including delirium tremens, grand mal seizures, and profound autonomic collapse. Medically supervised inpatient detoxification or emergency department hospital admission is clinically indicated under federal EMTALA emergency stabilization protections.',
      textEs: 'Una puntuación PAWSS de 4 o más indica un riesgo significativo de complicaciones potencialmente mortales por abstinencia de alcohol, incluyendo delirium tremens, convulsiones y colapso autonómico. Se requiere desintoxicación hospitalaria supervisada o atención de urgencias bajo protección federal EMTALA.',
      disposition: 'inpatient_medical_detox',
      thiamineRequired: true
    };
  }

  return {
    score: s,
    severity: 'low_to_moderate_risk',
    isHighRisk: false,
    titleEn: 'Lower Acute Complication Risk (PAWSS 0–3)',
    titleEs: 'Menor Riesgo de Complicación Aguda (PAWSS 0–3)',
    textEn: 'Score suggests lower immediate likelihood of delirium tremens, but withdrawal symptoms can evolve. Outpatient medical detoxification with close clinical monitoring, supportive medications, and oral thiamine prophylaxis may be suitable if social support and daily follow-up are assured.',
    textEs: 'La puntuación sugiere menor probabilidad inmediata de delirium tremens, pero los síntomas pueden evolucionar. La desintoxicación médica ambulatoria con seguimiento estrecho, medicamentos de apoyo y profilaxis con tiamina oral puede ser adecuada si se cuenta con apoyo social.',
    disposition: 'outpatient_with_monitoring',
    thiamineRequired: true
  };
}

/**
 * Evaluates MAUD compatibility based on patient organ function, opioid use, and goals.
 *
 * @param {Object} profile
 * @param {boolean} [profile.liverDisease=false]
 * @param {boolean} [profile.kidneyDisease=false]
 * @param {boolean} [profile.opioidUse=false]
 * @param {string} [profile.treatmentGoal='abstinence'] 'abstinence' | 'harm_reduction' | 'undecided'
 * @returns {Object} Tailored medication guidance and contraindication warnings.
 */
export function evaluateMaudCompatibility({
  liverDisease = false,
  kidneyDisease = false,
  opioidUse = false,
  treatmentGoal = 'abstinence'
} = {}) {
  const recommendations = [];
  const contraindications = [];

  // Opioid Interaction Check (Life-Safety Contraindication)
  if (opioidUse) {
    contraindications.push({
      drug: 'naltrexone',
      titleEn: 'ABSOLUTE CONTRAINDICATION: Naltrexone With Opioids',
      titleEs: 'CONTRAINDICACIÓN ABSOLUTA: Naltrexona con Opioides',
      textEn: 'Naltrexone is a powerful opioid antagonist. Taking naltrexone while taking opioids (heroin, fentanyl, oxycodone, buprenorphine, or methadone) precipitates immediate, severe, and potentially life-threatening withdrawal. The individual must be opioid-free for 7–14 days before considering naltrexone.',
      textEs: 'La naltrexona es un potente antagonista opioide. Tomar naltrexona mientras consume opioides (fentanilo, oxicodona, buprenorfina o metadona) desencadena abstinencia precipitada grave e inmediata. Debe estar libre de opioides de 7 a 14 días antes de considerar naltrexona.'
    });
  }

  // Liver Disease Evaluation
  if (liverDisease) {
    recommendations.push({
      drug: 'acamprosate',
      preferred: true,
      titleEn: 'Preferred First-Line: Acamprosate in Liver Disease',
      titleEs: 'Primera Línea Preferida: Acamprosato en Enfermedad Hepática',
      textEn: 'Acamprosate is cleared 100% renally without hepatic metabolism, making it exceptionally safe for patients with hepatitis, cirrhosis, or elevated liver transaminases.',
      textEs: 'El acamprosato se elimina 100% por vía renal sin metabolismo hepático, siendo excepcionalmente seguro en pacientes con hepatitis, cirrosis o enzimas hepáticas elevadas.'
    });

    contraindications.push({
      drug: 'disulfiram',
      titleEn: 'Disulfiram Not Recommended in Liver Impairment',
      titleEs: 'Disulfiram No Recomendado en Insuficiencia Hepática',
      textEn: 'Disulfiram carries a risk of drug-induced hepatotoxicity and should be avoided in significant liver dysfunction.',
      textEs: 'El disulfiram conlleva riesgo de hepatotoxicidad inducida por fármacos y debe evitarse en disfunción hepática significativa.'
    });
  } else if (!opioidUse) {
    // Normal liver, no opioids
    recommendations.push({
      drug: 'naltrexone',
      preferred: true,
      titleEn: 'First-Line Recommendation: Naltrexone (Oral or Monthly Vivitrol)',
      titleEs: 'Recomendación de Primera Línea: Naltrexona (Oral o Vivitrol Mensual)',
      textEn: 'Strongest evidence for reducing heavy drinking and cravings. Can be started while still drinking and supports both complete abstinence and targeted harm-reduction reduction goals.',
      textEs: 'Mayor evidencia para reducir el consumo compulsivo y las ansias. Puede iniciarse aun si la persona sigue bebiendo y apoya tanto la abstinencia como la moderación.'
    });
  }

  // Kidney Disease Evaluation
  if (kidneyDisease) {
    contraindications.push({
      drug: 'acamprosate',
      titleEn: 'Caution / Contraindication: Acamprosate in Renal Disease',
      titleEs: 'Precaución / Contraindicación: Acamprosato en Enfermedad Renal',
      textEn: 'Acamprosate accumulates in renal failure. Contraindicated if CrCl < 30 mL/min; requires 50% dose reduction (333 mg TID) if CrCl is 30–50 mL/min.',
      textEs: 'El acamprosato se acumula en falla renal. Contraindicado si CrCl < 30 mL/min; requiere reducción al 50% (333 mg TID) si CrCl está entre 30 y 50 mL/min.'
    });
  }

  // Goal: Harm Reduction / Moderation
  if (treatmentGoal === 'harm_reduction' && !opioidUse && !liverDisease) {
    recommendations.push({
      drug: 'tsm_naltrexone',
      preferred: true,
      titleEn: 'Harm Reduction Pathway: The Sinclair Method (TSM)',
      titleEs: 'Vía de Reducción de Daños: El Método Sinclair (TSM)',
      textEn: 'Taking oral naltrexone 50 mg precisely 1 hour before consuming alcohol induces progressive pharmacological extinction, gradually uncoupling the brain’s dopamine reward association with alcohol.',
      textEs: 'Tomar naltrexona oral de 50 mg exactamente 1 hora antes de beber genera extinción farmacológica progresiva, desacoplando la recompensa de dopamina asociada al alcohol.'
    });
  }

  return {
    recommendations,
    contraindications,
    treatmentGoal,
    liverDisease,
    kidneyDisease,
    opioidUse
  };
}

/**
 * Format complete bilingual summary report of alcohol care evaluation.
 *
 * @param {Object} state In-RAM state object.
 * @param {string} [lang='en'] 'en' | 'es'.
 * @returns {string} Plain-text summary for clinical handoff or consultation.
 */
export function formatAlcoholSummaryText(state = {}, lang = 'en') {
  const isEs = lang === 'es';
  const pawssScore = calculatePawssScore(state.pawssItems);
  const pawssRisk = evaluatePawssRisk(pawssScore);
  const maud = evaluateMaudCompatibility({
    liverDisease: state.hasLiverDisease,
    kidneyDisease: state.hasKidneyDisease,
    opioidUse: state.hasOpioidUse,
    treatmentGoal: state.treatmentGoal || 'abstinence'
  });

  const lines = [
    '================================================================',
    isEs
      ? 'HARBORPATH: CONSULTA DE ATENCIÓN DE ALCOHOL Y FARMACOTERAPIA'
      : 'HARBORPATH: ALCOHOL CARE & PHARMACOTHERAPY CONSULTATION',
    '================================================================',
    isEs
      ? 'Privado, confidencial, 100% en memoria RAM. Sin datos transmitidos.'
      : 'Private, confidential, 100% in-RAM. Zero data transmitted.',
    '',
    isEs ? '1. RIESGO DE ABSTINENCIA COMPLICADA (ESCALA PAWSS):' : '1. COMPLICATED WITHDRAWAL RISK (PAWSS SCALE):',
    `   ${isEs ? 'Puntuación PAWSS' : 'PAWSS Score'}: ${pawssScore} / 10`,
    `   ${isEs ? 'Nivel de riesgo' : 'Risk level'}: ${isEs ? pawssRisk.titleEs : pawssRisk.titleEn}`,
    `   ${isEs ? 'Directiva' : 'Directive'}: ${isEs ? pawssRisk.textEs : pawssRisk.textEn}`,
    '',
    isEs ? '2. PREVENCIÓN DE SÍNDROME DE WERNICKE-KORSAKOFF:' : '2. WERNICKE-KORSAKOFF SYNDROME PREVENTION:',
    `   * ${isEs ? WERNICKE_PREVENTION.emergencyDirectivesEs[0] : WERNICKE_PREVENTION.emergencyDirectivesEn[0]}`,
    '',
    isEs ? '3. EVALUACIÓN DE MEDICAMENTOS PARA EL ALCOHOL (MAUD):' : '3. MEDICATIONS FOR ALCOHOL USE DISORDER (MAUD) EVALUATION:',
    `   ${isEs ? 'Meta declarada' : 'Stated goal'}: ${state.treatmentGoal || 'abstinence'}`,
    `   ${isEs ? 'Enfermedad hepática' : 'Liver disease'}: ${state.hasLiverDisease ? (isEs ? 'Sí' : 'Yes') : (isEs ? 'No' : 'No')}`,
    `   ${isEs ? 'Enfermedad renal' : 'Kidney disease'}: ${state.hasKidneyDisease ? (isEs ? 'Sí' : 'Yes') : (isEs ? 'No' : 'No')}`,
    `   ${isEs ? 'Uso de opioides' : 'Opioid use'}: ${state.hasOpioidUse ? (isEs ? 'SÍ (CONTRAINDICACIÓN)' : 'YES (CONTRAINDICATION)') : (isEs ? 'No' : 'No')}`,
    ''
  ];

  if (maud.contraindications.length > 0) {
    lines.push(isEs ? '   ALERTAS Y CONTRAINDICACIONES:' : '   ALERTS & CONTRAINDICATIONS:');
    for (const c of maud.contraindications) {
      lines.push(`   ! ${isEs ? c.titleEs : c.titleEn}`);
      lines.push(`     ${isEs ? c.textEs : c.textEn}`);
    }
    lines.push('');
  }

  if (maud.recommendations.length > 0) {
    lines.push(isEs ? '   OPCIONES RECOMENDADAS:' : '   RECOMMENDED PHARMACOTHERAPIES:');
    for (const r of maud.recommendations) {
      lines.push(`   * ${isEs ? r.titleEs : r.titleEn}`);
      lines.push(`     ${isEs ? r.textEs : r.textEn}`);
    }
  }

  lines.push('');
  lines.push('----------------------------------------------------------------');
  lines.push(
    isEs
      ? 'Aviso: Esta herramienta es educativa y no sustituye el juicio médico profesional.'
      : 'Disclaimer: This tool is educational and does not replace clinical judgment.'
  );
  lines.push('================================================================');

  return lines.join('\n');
}

// In-RAM Ephemeral State Management (Deterministic Reset for Quick Exit)
const defaultState = () => ({
  pawssItems: [],
  hasLiverDisease: false,
  hasKidneyDisease: false,
  hasOpioidUse: false,
  treatmentGoal: 'abstinence',
  activeTab: 'pawss'
});

let inMemoryState = defaultState();

export function getAlcoholState() {
  return {
    ...inMemoryState,
    pawssItems: [...inMemoryState.pawssItems]
  };
}

export function setAlcoholState(partial = {}) {
  inMemoryState = {
    ...inMemoryState,
    ...partial,
    pawssItems: partial.pawssItems ? [...partial.pawssItems] : inMemoryState.pawssItems
  };
  return getAlcoholState();
}

export function resetAlcoholState() {
  inMemoryState = defaultState();
  return getAlcoholState();
}

/**
 * Renders the accessible WCAG 2.2 AA compliant Alcohol Care View.
 *
 * @returns {HTMLElement}
 */
export function alcoholCareView() {
  const container = h('div', { class: 'view alcohol-care-view' });

  // Header
  const header = h('header', { class: 'view-header' },
    h('h1', null, t('alcohol.title', 'Alcohol Care, Medical Withdrawal & MAUD Specialist')),
    h('p', { class: 'lead' }, t('alcohol.lead', 'Evidence-based guidance on alcohol withdrawal risk stratification (PAWSS), Wernicke prevention, and FDA-approved medications (MAUD). Zero tracking, zero storage.'))
  );
  container.append(header);

  // Tab Navigation
  const tabList = h('div', { class: 'tab-nav', role: 'tablist', 'aria-label': 'Alcohol Care Sections' });
  const tabPawssBtn = h('button', {
    class: `tab-btn ${inMemoryState.activeTab === 'pawss' ? 'active' : ''}`,
    role: 'tab',
    id: 'tab-pawss-btn',
    'aria-selected': String(inMemoryState.activeTab === 'pawss'),
    'aria-controls': 'tab-pawss-panel'
  }, t('alcohol.tab.pawss', 'Withdrawal Risk (PAWSS)'));

  const tabMaudBtn = h('button', {
    class: `tab-btn ${inMemoryState.activeTab === 'maud' ? 'active' : ''}`,
    role: 'tab',
    id: 'tab-maud-btn',
    'aria-selected': String(inMemoryState.activeTab === 'maud'),
    'aria-controls': 'tab-maud-panel'
  }, t('alcohol.tab.maud', 'Medications (MAUD)'));

  const tabWernickeBtn = h('button', {
    class: `tab-btn ${inMemoryState.activeTab === 'wernicke' ? 'active' : ''}`,
    role: 'tab',
    id: 'tab-wernicke-btn',
    'aria-selected': String(inMemoryState.activeTab === 'wernicke'),
    'aria-controls': 'tab-wernicke-panel'
  }, t('alcohol.tab.wernicke', 'Wernicke Prevention'));

  tabList.append(tabPawssBtn, tabMaudBtn, tabWernickeBtn);
  container.append(tabList);

  const panelsContainer = h('div', { class: 'tab-panels' });

  // ---------------- Tab 1: PAWSS Withdrawal Risk ----------------
  const panelPawss = h('div', {
    class: `tab-panel ${inMemoryState.activeTab === 'pawss' ? 'active' : ''}`,
    role: 'tabpanel',
    id: 'tab-pawss-panel',
    'aria-labelledby': 'tab-pawss-btn',
    hidden: inMemoryState.activeTab !== 'pawss'
  });

  const pawssIntro = h('article', { class: 'card' },
    h('h2', null, 'Prediction of Alcohol Withdrawal Severity Scale (PAWSS)'),
    h('p', null, 'The PAWSS is a validated 10-item clinical screening instrument designed to identify patients at high risk for complicated alcohol withdrawal (delirium tremens, withdrawal seizures, severe autonomic instability) prior to the onset of severe symptoms.'),
    h('p', { class: 'fine' }, 'Reference: Maldonado JR et al. Alcohol Alcohol. 2014;49(6):629-637.')
  );

  const pawssForm = h('div', { class: 'card interactive-calc' },
    h('h3', null, 'Check All Applicable Risk Criteria'),
    h('ul', { class: 'list checklist pawss-checklist' },
      ...PAWSS_ITEMS.map((item) => {
        const input = h('input', {
          type: 'checkbox',
          id: `pawss-${item.id}`,
          checked: inMemoryState.pawssItems.includes(item.id)
        });
        input.addEventListener('change', (e) => {
          if (e.target.checked) {
            inMemoryState.pawssItems = [...new Set([...inMemoryState.pawssItems, item.id])];
          } else {
            inMemoryState.pawssItems = inMemoryState.pawssItems.filter((id) => id !== item.id);
          }
          updatePawssResults();
        });
        return h('li', null,
          h('label', { for: `pawss-${item.id}`, class: 'check' },
            input,
            h('span', null, ` [Part ${item.part}] ${item.textEn}`)
          )
        );
      })
    )
  );

  const pawssResults = h('div', { class: 'pawss-results-region', 'aria-live': 'polite' });

  function updatePawssResults() {
    const score = calculatePawssScore(inMemoryState.pawssItems);
    const risk = evaluatePawssRisk(score);

    pawssResults.replaceChildren();
    pawssResults.append(
      h('div', { class: `alert-callout ${risk.isHighRisk ? 'danger' : 'info'}` },
        h('h4', null, `${risk.titleEn} (Score: ${score}/10)`),
        h('p', null, risk.textEn),
        risk.isHighRisk
          ? h('p', { class: 'badge' }, 'Urgent Action: Inpatient Medical Detox / Hospital ED Required')
          : h('p', { class: 'badge' }, 'Candidate for Closely Monitored Ambulatory Detox')
      )
    );
  }

  updatePawssResults();
  panelPawss.append(pawssIntro, pawssForm, pawssResults);

  // ---------------- Tab 2: MAUD Medications ----------------
  const panelMaud = h('div', {
    class: `tab-panel ${inMemoryState.activeTab === 'maud' ? 'active' : ''}`,
    role: 'tabpanel',
    id: 'tab-maud-panel',
    'aria-labelledby': 'tab-maud-btn',
    hidden: inMemoryState.activeTab !== 'maud'
  });

  const maudIntro = h('article', { class: 'card' },
    h('h2', null, 'FDA-Approved Medications for Alcohol Use Disorder (MAUD)'),
    h('p', null, 'Medications are heavily underutilized in alcohol recovery. Naltrexone and Acamprosate are evidence-based first-line options that reduce cravings and heavy drinking days.')
  );

  const maudForm = h('div', { class: 'card interactive-calc' },
    h('h3', null, 'Patient Profile & Safety Compatibility Evaluator'),
    h('div', { class: 'form-group' },
      h('label', { for: 'maud-goal-select' }, 'Recovery Goal:'),
      h('select', { id: 'maud-goal-select', class: 'select' },
        h('option', { value: 'abstinence' }, 'Complete Abstinence / Quitting'),
        h('option', { value: 'harm_reduction' }, 'Harm Reduction / Cutting Down (The Sinclair Method)'),
        h('option', { value: 'undecided' }, 'Undecided / Exploring Options')
      )
    ),
    h('div', { class: 'form-group checkbox-group' },
      h('label', null,
        h('input', { type: 'checkbox', id: 'maud-liver-check', checked: inMemoryState.hasLiverDisease }),
        ' History of Liver Disease, Hepatitis, or Cirrhosis'
      )
    ),
    h('div', { class: 'form-group checkbox-group' },
      h('label', null,
        h('input', { type: 'checkbox', id: 'maud-kidney-check', checked: inMemoryState.hasKidneyDisease }),
        ' History of Kidney Disease / Renal Impairment (CrCl < 50)'
      )
    ),
    h('div', { class: 'form-group checkbox-group' },
      h('label', null,
        h('input', { type: 'checkbox', id: 'maud-opioid-check', checked: inMemoryState.hasOpioidUse }),
        ' Current Opioid Use, Buprenorphine, Methadone, or Pain Relievers'
      )
    )
  );

  const maudResults = h('div', { class: 'maud-results-region', 'aria-live': 'polite' });

  function updateMaudResults() {
    const evalResult = evaluateMaudCompatibility({
      liverDisease: inMemoryState.hasLiverDisease,
      kidneyDisease: inMemoryState.hasKidneyDisease,
      opioidUse: inMemoryState.hasOpioidUse,
      treatmentGoal: inMemoryState.treatmentGoal
    });

    maudResults.replaceChildren();

    for (const c of evalResult.contraindications) {
      maudResults.append(
        h('div', { class: 'alert-callout danger' },
          h('h4', null, c.titleEn),
          h('p', null, c.textEn)
        )
      );
    }

    for (const r of evalResult.recommendations) {
      maudResults.append(
        h('div', { class: 'alert-callout info' },
          h('h4', null, r.titleEn),
          h('p', null, r.textEn)
        )
      );
    }
  }

  updateMaudResults();
  const liverCareLink = h('div', { class: 'alert-callout info mt-2' },
    h('h4', null, 'Advanced Hepatic Cirrhosis or Liver Impairment?'),
    h('p', null, 'Consult Child-Pugh staging (Classes A–C), APAP daily limits, and safe MOUD/MAUD pharmacokinetics: '),
    h('a', { href: '#/liver-care' }, 'Open Liver Health, Cirrhosis & APAP Safety Navigator →')
  );
  panelMaud.append(maudIntro, maudForm, maudResults, liverCareLink);

  // ---------------- Tab 3: Wernicke Prevention ----------------
  const panelWernicke = h('div', {
    class: `tab-panel ${inMemoryState.activeTab === 'wernicke' ? 'active' : ''}`,
    role: 'tabpanel',
    id: 'tab-wernicke-panel',
    'aria-labelledby': 'tab-wernicke-btn',
    hidden: inMemoryState.activeTab !== 'wernicke'
  });

  const wernickeCard = h('article', { class: 'card' },
    h('h2', null, WERNICKE_PREVENTION.titleEn),
    h('p', null, WERNICKE_PREVENTION.triadEn),
    h('ul', { class: 'guideline-list' },
      ...WERNICKE_PREVENTION.emergencyDirectivesEn.map((d) => h('li', null, d))
    )
  );
  panelWernicke.append(wernickeCard);
  const neuroLinkCard = h('div', { class: 'info-card mt-3' }, [
    h('strong', null, 'Advanced Neurological Evaluation & Osmotic Demyelination (ODS): '),
    h('span', null, 'Explore full Caine criteria for Wernicke encephalopathy, the 8 mEq/L/24hr hyponatremia correction limit in beer potomania, and post-hypoxic brain protection: '),
    h('a', { href: '#/neurology-care' }, 'Open Neurological Health & Neuroprotection Navigator →')
  ]);
  panelWernicke.append(neuroLinkCard);
  const akaLinkCard = h('div', { class: 'info-card mt-3' }, [
    h('strong', null, 'Alcoholic Ketoacidosis (AKA) & Hypoglycemia Warning: '),
    h('span', null, 'Heavy drinking followed by persistent vomiting causes alcoholic ketoacidosis (severe acidosis with normal/low glucose). Requires IV Dextrose + Saline + Thiamine; INSULIN IS CONTRAINDICATED: '),
    h('a', { href: '#/metabolic-care' }, 'Open Alcoholic Ketoacidosis & Metabolic Care Navigator →')
  ]);
  panelWernicke.append(akaLinkCard);
  const giLinkCard = h('div', { class: 'info-card mt-3' }, [
    h('strong', null, 'Alcohol-Induced Acute Pancreatitis & Boerhaave Esophageal Rupture: '),
    h('span', null, 'Severe epigastric pain radiating to the back requires Lipase testing and WATERFALL moderate Lactated Ringer’s resuscitation. Violent retching with neck crepitus requires water-soluble contrast (never barium): '),
    h('a', { href: '#/gi-care' }, 'Open GI Emergencies, Pancreatitis & Boerhaave Navigator →')
  ]);
  panelWernicke.append(giLinkCard);
  const ocularLinkCard = h('div', { class: 'info-card mt-3' }, [
    h('strong', null, 'Methanol ("Moonshine") Optic Neuropathy & Topiramate Angle-Closure Glaucoma: '),
    h('span', null, '"Snowstorm vision" after adulterated alcohol requires immediate Fomepizole, IV Leucovorin, and dialysis. Bilateral blurry vision on Topiramate requires stopping Topiramate and avoiding Pilocarpine: '),
    h('a', { href: '#/ocular-care' }, 'Open Ophthalmology, Methanol Blindness & Ocular Toxicology Navigator →')
  ]);
  panelWernicke.append(ocularLinkCard);

  panelsContainer.append(panelPawss, panelMaud, panelWernicke);
  container.append(panelsContainer);

  // Actions Card
  const actionsCard = h('div', { class: 'card action-bar' },
    h('h3', null, 'Consultation Summary & Physician Discussion'),
    h('p', null, 'Copy an anonymous, zero-PII plain text summary of your withdrawal assessment and medication compatibility.'),
    h('div', { class: 'btn-group' },
      h('button', { type: 'button', class: 'btn btn-primary', id: 'btn-copy-alcohol-summary' }, 'Copy Plain-Text Summary'),
      h('button', { type: 'button', class: 'btn btn-secondary', id: 'btn-reset-alcohol' }, 'Reset In-Memory Data')
    ),
    h('span', { id: 'alcohol-copy-status', class: 'sr-only', role: 'status', 'aria-live': 'polite' })
  );
  container.append(actionsCard);

  // Tab switching logic
  function switchTab(newTab) {
    inMemoryState.activeTab = newTab;
    tabPawssBtn.classList.toggle('active', newTab === 'pawss');
    tabPawssBtn.setAttribute('aria-selected', String(newTab === 'pawss'));
    panelPawss.hidden = newTab !== 'pawss';
    panelPawss.classList.toggle('active', newTab === 'pawss');

    tabMaudBtn.classList.toggle('active', newTab === 'maud');
    tabMaudBtn.setAttribute('aria-selected', String(newTab === 'maud'));
    panelMaud.hidden = newTab !== 'maud';
    panelMaud.classList.toggle('active', newTab === 'maud');

    tabWernickeBtn.classList.toggle('active', newTab === 'wernicke');
    tabWernickeBtn.setAttribute('aria-selected', String(newTab === 'wernicke'));
    panelWernicke.hidden = newTab !== 'wernicke';
    panelWernicke.classList.toggle('active', newTab === 'wernicke');
  }

  tabPawssBtn.addEventListener('click', () => switchTab('pawss'));
  tabMaudBtn.addEventListener('click', () => switchTab('maud'));
  tabWernickeBtn.addEventListener('click', () => switchTab('wernicke'));

  // Form listeners
  panelMaud.querySelector('#maud-goal-select').addEventListener('change', (e) => {
    inMemoryState.treatmentGoal = e.target.value;
    updateMaudResults();
  });
  panelMaud.querySelector('#maud-liver-check').addEventListener('change', (e) => {
    inMemoryState.hasLiverDisease = e.target.checked;
    updateMaudResults();
  });
  panelMaud.querySelector('#maud-kidney-check').addEventListener('change', (e) => {
    inMemoryState.hasKidneyDisease = e.target.checked;
    updateMaudResults();
  });
  panelMaud.querySelector('#maud-opioid-check').addEventListener('change', (e) => {
    inMemoryState.hasOpioidUse = e.target.checked;
    updateMaudResults();
  });

  // Action listeners
  const copyBtn = actionsCard.querySelector('#btn-copy-alcohol-summary');
  const copyStatus = actionsCard.querySelector('#alcohol-copy-status');
  copyBtn.addEventListener('click', async () => {
    const text = formatAlcoholSummaryText(inMemoryState, 'en');
    try {
      await navigator.clipboard.writeText(text);
      copyStatus.textContent = 'Summary copied to clipboard.';
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy Plain-Text Summary'; }, 2000);
    } catch {
      copyStatus.textContent = 'Unable to access clipboard.';
    }
  });

  const resetBtn = actionsCard.querySelector('#btn-reset-alcohol');
  resetBtn.addEventListener('click', () => {
    resetAlcoholState();
    panelPawss.querySelectorAll('input[type="checkbox"]').forEach((box) => { box.checked = false; });
    panelMaud.querySelector('#maud-goal-select').value = 'abstinence';
    panelMaud.querySelector('#maud-liver-check').checked = false;
    panelMaud.querySelector('#maud-kidney-check').checked = false;
    panelMaud.querySelector('#maud-opioid-check').checked = false;
    updatePawssResults();
    updateMaudResults();
  });

  return container;
}

