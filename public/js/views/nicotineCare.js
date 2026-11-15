// public/js/views/nicotineCare.js
// HarborPath - Tobacco, Nicotine, Vaping & Smoking Cessation Specialist
// Clinical standards: CDC Surgeon General Report on Cessation, ASAM/SAMHSA TIP 45, FTND, EAGLES Trial
// Privacy invariant: zero device storage, zero PII, in-RAM ephemeral state only.

import { h, clear, icon, copyText } from '../dom.js';
import { getLang } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY & PROTOCOLS
// ============================================================================

export const RECOVERY_TOBACCO_MANDATE = {
  titleEn: 'Concurrent Tobacco Treatment in Addiction Recovery: Evidence vs. Myths',
  titleEs: 'Tratamiento Concurrente del Tabaquismo en Recuperación: Evidencia vs. Mitos',
  mandateEn: 'CRITICAL CLINICAL CONSENSUS: Treating tobacco and nicotine use disorder CONCURRENTLY during treatment for opioids, alcohol, or stimulants INCREASES long-term abstinence from all substances by 25% or more. More individuals in recovery die from tobacco-related cardiovascular disease and lung cancer than from their primary drug of choice. Nicotine cross-sensitizes brain dopamine pathways, meaning continuing to smoke acts as a powerful conditioned trigger for drug relapse.',
  mandateEs: 'CONSENSO CLÍNICO FUNDAMENTAL: Tratar el tabaquismo y la dependencia a la nicotina DE FORMA CONCURRENTE con la adicción a opioides, alcohol o estimulantes AUMENTA la abstinencia a largo plazo de todas las sustancias en un 25% o más. Mueren más personas en recuperación por enfermedades cardiovasculares y cáncer de pulmón asociados al tabaco que por su droga principal. La nicotina genera sensibilización cruzada en las vías de dopamina, actuando como un potente detonante de recaídas.',
  coreFacts: [
    {
      topicEn: 'Sobriety Protection',
      topicEs: 'Protección de la Sobriedad',
      detailEn: 'Quitting smoking DOES NOT jeopardize recovery; it strengthens it by uncoupling ritualized hand-to-mouth and stress-response habit loops.',
      detailEs: 'Dejar de fumar NO pone en riesgo la recuperación; la consolida al romper bucles de hábitos ritualizados y de respuesta al estrés.'
    },
    {
      topicEn: 'Mortality Disparity',
      topicEs: 'Disparidad de Mortalidad',
      detailEn: 'Over 50% of people with alcohol or opioid use disorder die from tobacco-caused disease, often decades earlier than expected.',
      detailEs: 'Más del 50% de las personas con adicción al alcohol o a opioides mueren por enfermedades causadas por el tabaco, con frecuencia décadas antes de lo esperado.'
    },
    {
      topicEn: 'Medicaid $0 Copay Mandate',
      topicEs: 'Mandato Medicaid Copago $0',
      detailEn: 'Under ACA guidelines, nearly all state Medicaid and private insurance plans must cover both prescription (varenicline, bupropion) and OTC nicotine replacement at $0 copay with a prescription.',
      detailEs: 'Bajo la ley ACA, casi todos los planes de Medicaid y seguros privados cubren tratamientos con receta (vareniclina, bupropión) y parches/chicles con copago de $0.'
    }
  ]
};

export const FAGERSTROM_QUESTIONS = [
  {
    id: 'time_to_first',
    promptEn: '1. How soon after you wake up do you smoke your first cigarette or vape?',
    promptEs: '1. ¿Cuánto tiempo después de despertarse fuma su primer cigarrillo o vapea?',
    options: [
      { textEn: 'Within 5 minutes (3 points)', textEs: 'En los primeros 5 minutos (3 puntos)', points: 3 },
      { textEn: '6 to 30 minutes (2 points)', textEs: 'De 6 a 30 minutos (2 puntos)', points: 2 },
      { textEn: '31 to 60 minutes (1 point)', textEs: 'De 31 a 60 minutos (1 punto)', points: 1 },
      { textEn: 'After 60 minutes (0 points)', textEs: 'Después de 60 minutos (0 puntos)', points: 0 }
    ]
  },
  {
    id: 'forbidden_places',
    promptEn: '2. Do you find it difficult to refrain from smoking in places where it is forbidden (e.g. clinic, bus, cinema)?',
    promptEs: '2. ¿Le resulta difícil no fumar en lugares donde está prohibido (clínicas, autobús, cine)?',
    options: [
      { textEn: 'Yes (1 point)', textEs: 'Sí (1 punto)', points: 1 },
      { textEn: 'No (0 points)', textEs: 'No (0 puntos)', points: 0 }
    ]
  },
  {
    id: 'hate_to_give_up',
    promptEn: '3. Which cigarette or vape session would you hate most to give up?',
    promptEs: '3. ¿Qué cigarrillo o momento de vapeo le costaría más dejar?',
    options: [
      { textEn: 'The first one in the morning (1 point)', textEs: 'El primero de la mañana (1 punto)', points: 1 },
      { textEn: 'Any other (0 points)', textEs: 'Cualquier otro (0 puntos)', points: 0 }
    ]
  },
  {
    id: 'cigs_per_day',
    promptEn: '4. How many cigarettes per day do you smoke (or pod/cartridge equivalent)?',
    promptEs: '4. ¿Cuántos cigarrillos fuma al día (o equivalente en cartucho/cápsula de vapeo)?',
    options: [
      { textEn: '10 or fewer (0 points)', textEs: '10 o menos (0 puntos)', points: 0 },
      { textEn: '11 to 20 (1 point)', textEs: '11 a 20 (1 punto)', points: 1 },
      { textEn: '21 to 30 (2 points)', textEs: '21 a 30 (2 puntos)', points: 2 },
      { textEn: '31 or more (3 points)', textEs: '31 o más (3 puntos)', points: 3 }
    ]
  },
  {
    id: 'morning_cluster',
    promptEn: '5. Do you smoke or vape more frequently during the first hours after waking than during the rest of the day?',
    promptEs: '5. ¿Fuma o vapea con mayor frecuencia en las primeras horas tras despertar que en el resto del día?',
    options: [
      { textEn: 'Yes (1 point)', textEs: 'Sí (1 punto)', points: 1 },
      { textEn: 'No (0 points)', textEs: 'No (0 puntos)', points: 0 }
    ]
  },
  {
    id: 'smoke_when_ill',
    promptEn: '6. Do you smoke or vape even if you are so ill that you are in bed most of the day?',
    promptEs: '6. ¿Fuma o vapea incluso si está tan enfermo que pasa en cama la mayor parte del día?',
    options: [
      { textEn: 'Yes (1 point)', textEs: 'Sí (1 punto)', points: 1 },
      { textEn: 'No (0 points)', textEs: 'No (0 puntos)', points: 0 }
    ]
  }
];

export const COMBINATION_NRT_STANDARDS = {
  titleEn: 'Combination Nicotine Replacement Therapy (NRT): Basal Controller + Acute Reliever',
  titleEs: 'Terapia Combinada de Reemplazo de Nicotina (TRN): Controlador Basal + Aliviador Agudo',
  overviewEn: 'Combining a 24-hour transdermal patch (which supplies steady background nicotine) with a fast-acting oral product (gum, lozenge, or inhaler for sudden peak cravings) nearly DOUBLES cessation success compared to single-agent monotherapy. It safely mimics natural nicotine pharmacokinetics.',
  overviewEs: 'Combinar un parche transdérmico de 24 horas (que provee un nivel basal constante) con un producto oral de acción rápida (chicle, pastilla o inhalador para picos de deseo) casi DUPLICA el éxito de cesación respecto a un solo producto. Reproduce de forma segura la farmacocinética de la nicotina.',
  controllerPatch: [
    {
      dose: '21 mg / 24 hr (Step 1)',
      criteriaEn: 'For individuals smoking > 10 cigarettes/day (or waking to smoke within 30 min). Use for 4 to 6 weeks.',
      criteriaEs: 'Para quienes fuman > 10 cigarrillos al día (o fuman en los primeros 30 min). Usar de 4 a 6 semanas.'
    },
    {
      dose: '14 mg / 24 hr (Step 2)',
      criteriaEn: 'For individuals smoking ≤ 10 cigarettes/day, or as step-down taper from 21 mg. Use for 2 to 4 weeks.',
      criteriaEs: 'Para quienes fuman ≤ 10 cigarrillos al día, o como reducción de 21 mg. Usar de 2 a 4 semanas.'
    },
    {
      dose: '7 mg / 24 hr (Step 3)',
      criteriaEn: 'Final step-down taper before stopping patch therapy. Use for 2 to 4 weeks.',
      criteriaEs: 'Paso final de reducción gradual antes de suspender el parche. Usar de 2 a 4 semanas.'
    }
  ],
  relieverOral: [
    {
      product: 'Nicotine Gum (2 mg vs 4 mg)',
      usageEn: '"Chew and Park" technique: Chew slowly until peppery tingle is felt, then park between cheek and gum for 15–30 minutes to allow transmucosal buccal absorption. Do NOT chew continuously like regular gum (swallowing nicotine causes hiccups, nausea, and heartburn).',
      usageEs: 'Técnica de "Masticar y Aparcar": Mastique despacio hasta notar un cosquilleo picante, luego apárquelo entre la mejilla y la encía 15-30 minutos para absorción bucal. NO mastique continuamente (tragar la saliva con nicotina causa hipo, náuseas y acidez).'
    },
    {
      product: 'Nicotine Lozenges (2 mg vs 4 mg)',
      usageEn: 'Place in mouth and allow to dissolve slowly over 20–30 minutes, shifting occasionally. Do not chew or swallow whole. Use 4 mg if first cigarette is within 30 min of waking; use 2 mg if after 30 min.',
      usageEs: 'Coloque en la boca y deje disolver lentamente durante 20-30 minutos, moviéndola de vez en cuando. No la mastique ni la trague entera. Use 4 mg si fuma en los primeros 30 min al despertar; use 2 mg si es después.'
    }
  ]
};

export const NON_NICOTINE_PHARMACOTHERAPY = [
  {
    drugId: 'varenicline',
    name: 'Varenicline (Chantix / Generic)',
    classEn: 'Alpha-4 Beta-2 Nicotinic Acetylcholine Receptor Partial Agonist',
    classEs: 'Agonista Parcial de Receptores Nicotínicos Alfa-4 Beta-2',
    mechanismEn: 'Binds with high affinity to nicotinic receptors: generates moderate baseline dopamine release to relieve withdrawal, while simultaneously blocking inhaled nicotine from binding (preventing pleasure if a slip occurs).',
    mechanismEs: 'Se une con alta afinidad a receptores nicotínicos: estimula una liberación basal moderada de dopamina aliviando la abstinencia, mientras bloquea la unión de la nicotina inhalada (evita el refuerzo si hay un desliz).',
    titrationEn: 'Start 1 to 4 weeks BEFORE quit date ("Reduce to Quit"): Days 1–3: 0.5 mg once daily; Days 4–7: 0.5 mg twice daily; Day 8 onward: 1 mg twice daily. Take with a full glass of water AFTER meals to minimize nausea.',
    titrationEs: 'Iniciar 1 a 4 semanas ANTES del día de cese: Días 1-3: 0.5 mg al día; Días 4-7: 0.5 mg dos veces al día; Día 8 en adelante: 1 mg dos veces al día. Tomar con un vaso lleno de agua DESPUÉS de comer para evitar náuseas.',
    safetyEn: 'The landmark 8,000-patient EAGLES trial proved varenicline does NOT increase neuropsychiatric adverse events in people with mental health or substance use disorders. It is the single most effective monotherapy.',
    safetyEs: 'El ensayo clínico EAGLES (8,000 pacientes) demostró que la vareniclina NO aumenta eventos neuropsiquiátricos en personas con trastornos de salud mental o adicciones. Es la monoterapia más eficaz.'
  },
  {
    drugId: 'bupropion',
    name: 'Bupropion SR (Zyban / Wellbutrin SR)',
    classEn: 'Norepinephrine-Dopamine Reuptake Inhibitor (NDRI) & Nicotinic Antagonist',
    classEs: 'Inhibidor de Recaptación de Dopamina-Noradrenalina (IRDN) y Antagonista Nicotínico',
    mechanismEn: 'Enhances central dopaminergic and noradrenergic tone to ease dysphoria and cravings. Also helps reduce post-cessation weight gain and treats co-occurring depression or ADHD.',
    mechanismEs: 'Aumenta el tono dopaminérgico y noradrenérgico central mitigando la disforia y el deseo compulsivo. Ayuda a atenuar la ganancia de peso y trata la depresión o el TDAH comórbido.',
    titrationEn: 'Start 1 to 2 weeks before quit date: 150 mg once daily for 3 days, then 150 mg twice daily (separated by at least 8 hours).',
    titrationEs: 'Iniciar 1 a 2 semanas antes del cese: 150 mg una vez al día por 3 días, luego 150 mg dos veces al día (separadas por al menos 8 horas).',
    safetyEn: 'BOXED CONTRAINDICATION: Do NOT use in individuals with active seizure disorders, anorexia/bulimia, or undergoing abrupt alcohol or benzodiazepine withdrawal (lowers seizure threshold).',
    safetyEs: 'CONTRAINDICACIÓN FORMAL: NO usar en personas con epilepsia/convulsiones, anorexia/bulimia o en abstinencia abrupta de alcohol/benzodiacepinas (disminuye el umbral convulsivo).'
  }
];

export const VAPING_HARM_REDUCTION = {
  titleEn: 'High-Concentration Nicotine Salts & Modern Pouches Harm Reduction',
  titleEs: 'Sales de Nicotina de Alta Concentración y Bolsas Modernas: Reducción de Daños',
  nicotineSaltsEn: 'Modern pod-based vapes utilize protonated nicotine salts (35–50+ mg/mL) formed with benzoic acid. Nicotine salts allow higher concentrations to be inhaled smoothly without harsh throat burn, delivering arterial nicotine spikes rivaling combustible cigarettes and creating rapid physiological dependence.',
  nicotineSaltsEs: 'Los vapeadores de cartucho modernos utilizan sales de nicotina protonadas (35 a 50+ mg/mL) con ácido benzoico. Esto permite inhalar concentraciones muy altas sin irritación de garganta, provocando picos arteriales similares al tabaco quemado y generando dependencia rápida.',
  taperingLadderEn: [
    'Stage 1: 50 mg/mL (5.0%) -> High-potency salt baseline',
    'Stage 2: 35 mg/mL (3.5%) -> First step-down (maintain puff count)',
    'Stage 3: 20 mg/mL (2.0%) -> Transition to lower salt concentration',
    'Stage 4: 6 mg/mL (0.6%) -> Switch to freebase liquid (harsh throat feel naturally limits overuse)',
    'Stage 5: 3 mg/mL (0.3%) -> Minimal pharmacologic dose before zero-nicotine (0 mg)'
  ],
  taperingLadderEs: [
    'Nivel 1: 50 mg/mL (5.0%) -> Nivel basal de sal de alta potencia',
    'Nivel 2: 35 mg/mL (3.5%) -> Primer paso de reducción gradual',
    'Nivel 3: 20 mg/mL (2.0%) -> Transición a menor concentración',
    'Nivel 4: 6 mg/mL (0.6%) -> Cambio a nicotina base libre (el picor de garganta autolimita el uso)',
    'Nivel 5: 3 mg/mL (0.3%) -> Dosis mínima antes de pasar a líquido sin nicotina (0 mg)'
  ],
  pouchesEn: 'Tobacco-Free Nicotine Pouches (3–9 mg): Provide oral harm reduction without inhaled combustion carcinogens or carbon monoxide, but can cause localized gum recession, gingival sloughing, and perpetuate dependence. Recommend rotating placement and planning a structured downward taper.',
  pouchesEs: 'Bolsas de Nicotina sin Tabaco (3 a 9 mg): Ofrecen reducción de daños oral sin carcinógenos inhalados ni monóxido de carbono, pero pueden provocar retracción gingival y perpetuar la dependencia. Se recomienda rotar la ubicación y planificar una reducción gradual.'
};

export const THE_FOUR_DS_PROTOCOL = [
  {
    dId: 'delay',
    titleEn: '1. DELAY (3 to 5 Minutes)',
    titleEs: '1. DEMORAR (3 a 5 Minutos)',
    descEn: 'Cravings are neurochemical waves that peak sharply and naturally subside within 3 to 5 minutes. Promise yourself to wait 5 minutes before acting.',
    descEs: 'Los deseos intensos son ondas neuroquímicas que alcanzan un pico y descienden solas en 3 a 5 minutos. Comprométase a esperar 5 minutos antes de actuar.'
  },
  {
    dId: 'deep_breath',
    titleEn: '2. DEEP BREATHING',
    titleEs: '2. RESPIRACIÓN PROFUNDA',
    descEn: 'Take 5 slow, deep diaphragmatic breaths (inhale for 4 seconds, hold for 4, exhale for 6). This activates the parasympathetic vagus nerve and relieves chest tightness.',
    descEs: 'Tome 5 respiraciones diafragmáticas lentas (inhalar en 4 seg, sostener en 4, exhalar en 6). Activa el nervio vago parasimpático y calma la opresión torácica.'
  },
  {
    dId: 'drink_water',
    titleEn: '3. DRINK WATER',
    titleEs: '3. BEBER AGUA',
    descEn: 'Slowly sip a tall glass of ice-cold water. Cold oral sensory stimulation interrupts the physical hand-to-mouth craving reflex and flushes residual metabolites.',
    descEs: 'Beba despacio un vaso de agua helada a pequeños sorbos. La estimulación oral fría interrumpe el reflejo motor mano-boca y calma la urgencia.'
  },
  {
    dId: 'distract',
    titleEn: '4. DISTRACT YOURSELF',
    titleEs: '4. DISTRAERSE',
    descEn: 'Engage hands and mind in an active task (walk briskly, text a recovery peer, chew crunchy carrots or gum, do 10 pushups). Break the mental associative loop.',
    descEs: 'Ocupe las manos y la mente en otra actividad (camine a paso ligero, escriba a un compañero de apoyo, mastique chicle o zanahoria, haga 10 flexiones).'
  }
];

// ============================================================================
// CLINICAL EVALUATION FUNCTIONS & IN-RAM STATE
// ============================================================================

/**
 * Calculates Fagerström dependence score (0–10).
 */
export function calculateFagerstromScore(answers = {}) {
  let score = 0;
  if (answers.time_to_first !== undefined) score += Number(answers.time_to_first) || 0;
  if (answers.forbidden_places !== undefined) score += Number(answers.forbidden_places) || 0;
  if (answers.hate_to_give_up !== undefined) score += Number(answers.hate_to_give_up) || 0;
  if (answers.cigs_per_day !== undefined) score += Number(answers.cigs_per_day) || 0;
  if (answers.morning_cluster !== undefined) score += Number(answers.morning_cluster) || 0;
  if (answers.smoke_when_ill !== undefined) score += Number(answers.smoke_when_ill) || 0;

  let level = 'low';
  let titleEn = 'Low Nicotine Dependence (Score 1–2)';
  let titleEs = 'Baja Dependencia a la Nicotina (Puntuación 1–2)';
  let recommendationEn = 'Single-agent NRT (patch 14 mg or oral gum/lozenge 2 mg) or behavioral support is typically sufficient.';
  let recommendationEs = 'Monoterapia con TRN (parche de 14 mg o chicle/pastilla de 2 mg) o apoyo conductual suele ser suficiente.';

  if (score >= 8) {
    level = 'very_high';
    titleEn = 'Very High Nicotine Dependence (Score 8–10)';
    titleEs = 'Dependencia Muy Alta a la Nicotina (Puntuación 8–10)';
    recommendationEn = 'Combination NRT (Patch 21 mg PLUS acute 4 mg gum/lozenge) or Varenicline is strongly recommended. Severe withdrawal vulnerability during early cessation.';
    recommendationEs = 'Se recomienda fuertemente Terapia Combinada de TRN (Parche 21 mg MÁS chicle/pastilla de 4 mg) o Vareniclina. Alto riesgo de abstinencia intensa.';
  } else if (score >= 6) {
    level = 'high';
    titleEn = 'High Nicotine Dependence (Score 6–7)';
    titleEs = 'Dependencia Alta a la Nicotina (Puntuación 6–7)';
    recommendationEn = 'Combination NRT (Patch 21 mg + acute gum/lozenge 4 mg) or Varenicline offers the highest success rates. Pre-loading 1–2 weeks prior to quit date is advised.';
    recommendationEs = 'TRN combinada (Parche 21 mg + chicle/pastilla de 4 mg) o Vareniclina ofrece la mayor tasa de éxito. Se aconseja iniciar 1-2 semanas antes del cese.';
  } else if (score >= 5) {
    level = 'moderate';
    titleEn = 'Moderate Nicotine Dependence (Score 5)';
    titleEs = 'Dependencia Moderada a la Nicotina (Puntuación 5)';
    recommendationEn = 'Combination NRT (Patch 14–21 mg + acute 2 mg gum) or Bupropion/Varenicline under clinical supervision.';
    recommendationEs = 'TRN combinada (Parche 14-21 mg + chicle de 2 mg) o Bupropión/Vareniclina bajo supervisión clínica.';
  } else if (score >= 3) {
    level = 'low_moderate';
    titleEn = 'Low to Moderate Nicotine Dependence (Score 3–4)';
    titleEs = 'Dependencia Baja a Moderada (Puntuación 3–4)';
    recommendationEn = 'Patch 14 mg or oral NRT 2 mg as needed. Prepare craving defusal strategies.';
    recommendationEs = 'Parche de 14 mg o TRN oral de 2 mg según necesidad. Prepare técnicas de control del deseo.';
  }

  return { score, level, titleEn, titleEs, recommendationEn, recommendationEs };
}

// In-RAM Ephemeral State (Zero PII, Zero Device Storage)
let nicotineState = {
  currentTab: 'fagerstrom',
  fagerstromAnswers: {
    time_to_first: 2,
    forbidden_places: 1,
    hate_to_give_up: 1,
    cigs_per_day: 1,
    morning_cluster: 1,
    smoke_when_ill: 0
  },
  productType: 'cigarettes',
  selectedStrategy: 'combo_nrt',
  checklistQuitDate: false,
  checklistMedicaidCoverage: false,
  checklistComboNrt: false,
  checklistFourDs: false
};

export function getNicotineState() {
  return { ...nicotineState, fagerstromAnswers: { ...nicotineState.fagerstromAnswers } };
}

export function setNicotineState(updates) {
  if (updates.fagerstromAnswers) {
    nicotineState.fagerstromAnswers = { ...nicotineState.fagerstromAnswers, ...updates.fagerstromAnswers };
    delete updates.fagerstromAnswers;
  }
  nicotineState = { ...nicotineState, ...updates };
  return getNicotineState();
}

export function resetNicotineState() {
  nicotineState = {
    currentTab: 'fagerstrom',
    fagerstromAnswers: {
      time_to_first: 2,
      forbidden_places: 1,
      hate_to_give_up: 1,
      cigs_per_day: 1,
      morning_cluster: 1,
      smoke_when_ill: 0
    },
    productType: 'cigarettes',
    selectedStrategy: 'combo_nrt',
    checklistQuitDate: false,
    checklistMedicaidCoverage: false,
    checklistComboNrt: false,
    checklistFourDs: false
  };
  return getNicotineState();
}

/**
 * Formats a privacy-first, zero-PII plain text summary for quitline or clinician consultation.
 */
export function formatNicotineSummaryText(state, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = calculateFagerstromScore(state.fagerstromAnswers || {});

  const lines = [];
  lines.push(isEs
    ? '=== HARBORPATH: RESUMEN DE CESACIÓN TABÁQUICA Y APOYO EN RECUPERACIÓN ==='
    : '=== HARBORPATH: TOBACCO & NICOTINE CESSATION RECOVERY SUMMARY ===');
  lines.push(isEs
    ? 'Aviso de Privacidad: 100% en memoria RAM. Cero persistencia en disco ni rastreo de PII.'
    : 'Privacy Notice: 100% ephemeral in-RAM. Zero device storage, zero PII.');
  lines.push('');

  lines.push(isEs ? '--- 1. EVALUACIÓN DE DEPENDENCIA (FAGERSTRÖM) ---' : '--- 1. FAGERSTRÖM DEPENDENCE ASSESSMENT ---');
  lines.push(`${isEs ? 'Puntuación Total' : 'Total Score'}: ${evalResult.score}/10 (${isEs ? evalResult.titleEs : evalResult.titleEn})`);
  lines.push(`${isEs ? 'Orientación' : 'Clinical Recommendation'}: ${isEs ? evalResult.recommendationEs : evalResult.recommendationEn}`);
  lines.push('');

  lines.push(isEs ? '--- 2. ESTRATEGIA FARMACOLÓGICA PREFERIDA ---' : '--- 2. PREFERRED TREATMENT STRATEGY ---');
  lines.push(`${isEs ? 'Tipo de Producto' : 'Product Type'}: ${state.productType}`);
  lines.push(`${isEs ? 'Estrategia Seleccionada' : 'Selected Strategy'}: ${state.selectedStrategy}`);
  lines.push('');

  lines.push(isEs ? '--- 3. PERLAS CLÍNICAS Y DERECHOS DE COBERTURA ---' : '--- 3. CLINICAL PEARLS & COVERAGE RIGHTS ---');
  lines.push(isEs
    ? '- Dejar de fumar de forma concurrente con MOUD o alcohol aumenta la sobriedad a largo plazo en un 25% o más.'
    : '- Concurrent smoking cessation during MOUD or alcohol recovery increases overall long-term abstinence by 25% or more.');
  lines.push(isEs
    ? '- La Terapia Combinada de TRN (parche basal + chicle/pastilla para picos) casi duplica el éxito respecto a un solo producto.'
    : '- Combination NRT (basal patch + acute gum/lozenge) nearly doubles success compared to single-agent monotherapy.');
  lines.push(isEs
    ? '- Técnica de chicle: "Masticar y aparcar" entre mejilla y encía; no tragar continuamente para evitar náuseas e hipo.'
    : '- "Chew and park" gum technique: park between cheek and gum; do not chew continuously to avoid dyspepsia and hiccups.');
  lines.push(isEs
    ? '- Línea de Ayuda Gratuita: Llame al 1-855-DÉJELO-YA (855-335-3569) o 1-800-QUIT-NOW (800-784-8669) para parches gratis por correo.'
    : '- Free State Quitlines: Call 1-800-QUIT-NOW (1-855-DÉJELO-YA in Spanish) for free coaching and NRT mailed to your home.');
  lines.push('');

  lines.push('================================================================');
  lines.push(isEs
    ? 'Documento educativo para diálogo clínico. No reemplaza el juicio de su equipo de salud.'
    : 'Clinical dialogue summary for healthcare appointments. Does not replace individualized medical advice.');

  return lines.join('\n');
}

// ============================================================================
// VIEW COMPONENT & DOM RENDERING
// ============================================================================

export function nicotineCareView() {
  const container = h('div', { class: 'view nicotine-care-view' });

  function reRender() {
    clear(container);
    container.appendChild(renderNicotineCareContent());
  }

  container.appendChild(renderNicotineCareContent());
  return container;
}

function renderNicotineCareContent() {
  const isEs = getLang() === 'es';
  const localState = getNicotineState();

  const wrapper = h('div', { class: 'nicotine-care-container' });

  // Header
  const header = h('header', { class: 'view-header' }, [
    h('div', { class: 'view-header-badge' }, [
      icon('heart'),
      h('span', {}, isEs ? 'Cesación Tabáquica y Recuperación' : 'Tobacco & Nicotine Recovery')
    ]),
    h('h1', { class: 'view-title' }, isEs
      ? 'Cesación de Tabaco, Vaping y Nicotina en Recuperación'
      : 'Tobacco, Nicotine & Vaping Recovery Navigator'),
    h('p', { class: 'view-description text-muted' }, isEs
      ? 'Orientación clínica basada en evidencia (ASAM, SAMHSA y CDC): evaluación Fagerström, terapia combinada de parches y chicles, vareniclina, reducción de sales de vapeo y desescalada de deseos.'
      : 'Evidence-based ASAM, SAMHSA & CDC guidance: Fagerström dependence scoring, combination NRT dosing, varenicline protocols, high-potency vape salt tapering, and craving defusal.')
  ]);
  wrapper.appendChild(header);

  // Tabs Navigation
  const tabList = [
    { id: 'fagerstrom', labelEn: 'Fagerström Assessment', labelEs: 'Evaluación Fagerström', iconName: 'activity' },
    { id: 'medications', labelEn: 'Combination NRT & Meds', labelEs: 'TRN Combinada y Fármacos', iconName: 'pill' },
    { id: 'vaping', labelEn: 'Vape & Pouch Harm Reduction', labelEs: 'Vapeo y Bolsas de Nicotina', iconName: 'shield' },
    { id: 'craving_plan', labelEn: 'Craving Plan & Export', labelEs: 'Plan de Deseos y Resumen', iconName: 'file-text' }
  ];

  const tabsNav = h('nav', { class: 'tabs-nav', role: 'tablist', 'aria-label': isEs ? 'Pestañas de Cesación' : 'Nicotine Care Tabs' });
  for (const tInfo of tabList) {
    const isActive = localState.currentTab === tInfo.id;
    const tabBtn = h('button', {
      type: 'button',
      class: `tab-btn ${isActive ? 'active' : ''}`,
      role: 'tab',
      'aria-selected': isActive ? 'true' : 'false',
      onclick: () => {
        setNicotineState({ currentTab: tInfo.id });
        const parent = tabsNav.closest('.nicotine-care-view');
        if (parent) {
          clear(parent);
          parent.appendChild(renderNicotineCareContent());
        }
      }
    }, [
      icon(tInfo.iconName),
      h('span', {}, isEs ? tInfo.labelEs : tInfo.labelEn)
    ]);
    tabsNav.appendChild(tabBtn);
  }
  wrapper.appendChild(tabsNav);

  // Tab Content Area
  const contentArea = h('div', { class: 'tab-content-area', role: 'tabpanel' });

  if (localState.currentTab === 'fagerstrom') {
    contentArea.appendChild(renderFagerstromTab(localState, isEs));
  } else if (localState.currentTab === 'medications') {
    contentArea.appendChild(renderMedicationsTab(localState, isEs));
  } else if (localState.currentTab === 'vaping') {
    contentArea.appendChild(renderVapingTab(localState, isEs));
  } else {
    contentArea.appendChild(renderCravingPlanTab(localState, isEs));
  }

  wrapper.appendChild(contentArea);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 1: FAGERSTRÖM ASSESSMENT & RISK STRATIFICATION
// ----------------------------------------------------------------------------

function renderFagerstromTab(localState, isEs) {
  const wrapper = h('div', { class: 'fagerstrom-tab' });

  function reRender() {
    const parent = wrapper.closest('.nicotine-care-view');
    if (parent) {
      clear(parent);
      parent.appendChild(renderNicotineCareContent());
    }
  }

  // Clinical Mandate Banner
  const mandateCard = h('section', { class: 'card mandate-card' }, [
    h('div', { class: 'mandate-header' }, [
      icon('check-circle'),
      h('h2', {}, isEs ? RECOVERY_TOBACCO_MANDATE.titleEs : RECOVERY_TOBACCO_MANDATE.titleEn)
    ]),
    h('p', { class: 'mandate-text' }, isEs ? RECOVERY_TOBACCO_MANDATE.mandateEs : RECOVERY_TOBACCO_MANDATE.mandateEn)
  ]);
  wrapper.appendChild(mandateCard);

  // Fagerström Questions Form
  const formCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('help-circle'),
      h('span', {}, isEs ? 'Test de Fagerström para Dependencia de Nicotina (FTND)' : 'Fagerström Test for Nicotine Dependence (FTND)')
    ]),
    h('p', { class: 'text-muted' }, isEs
      ? 'Responda las 6 preguntas clínicas estandarizadas para calcular su nivel de dependencia física:'
      : 'Answer the 6 standardized clinical questions to calculate your level of physiological dependence:')
  ]);

  const questionsContainer = h('div', { class: 'fagerstrom-questions-list' });

  for (const q of FAGERSTROM_QUESTIONS) {
    const selectedPoints = localState.fagerstromAnswers[q.id] || 0;
    const selectId = `fagerstrom-${q.id}`;
    const qBox = h('div', { class: 'question-box' }, [
      h('label', { class: 'question-prompt', for: selectId }, isEs ? q.promptEs : q.promptEn),
      h('select', {
        id: selectId,
        class: 'form-select',
        value: selectedPoints,
        onchange: (e) => {
          const updated = { ...localState.fagerstromAnswers };
          updated[q.id] = Number(e.target.value);
          setNicotineState({ fagerstromAnswers: updated });
          reRender();
        }
      }, q.options.map(opt => h('option', { value: opt.points }, isEs ? opt.textEs : opt.textEn)))
    ]);
    questionsContainer.appendChild(qBox);
  }

  formCard.appendChild(questionsContainer);

  // Score Output Box
  const result = calculateFagerstromScore(localState.fagerstromAnswers);
  const resultCard = h('div', { class: `fagerstrom-result-card ftn-${result.level}` }, [
    h('div', { class: 'result-header' }, [
      icon(result.level === 'very_high' || result.level === 'high' ? 'alert-triangle' : 'info'),
      h('h3', {}, `${isEs ? 'Puntuación Fagerström' : 'Fagerström Score'}: ${result.score}/10 — ${isEs ? result.titleEs : result.titleEn}`)
    ]),
    h('p', { class: 'result-rec' }, isEs ? result.recommendationEs : result.recommendationEn)
  ]);
  formCard.appendChild(resultCard);

  wrapper.appendChild(formCard);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 2: COMBINATION NRT & PHARMACOTHERAPY
// ----------------------------------------------------------------------------

function renderMedicationsTab(localState, isEs) {
  const wrapper = h('div', { class: 'medications-tab' });

  // Combo NRT Overview Card
  const nrtCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('layers'),
      h('span', {}, isEs ? COMBINATION_NRT_STANDARDS.titleEs : COMBINATION_NRT_STANDARDS.titleEn)
    ]),
    h('p', {}, isEs ? COMBINATION_NRT_STANDARDS.overviewEs : COMBINATION_NRT_STANDARDS.overviewEn)
  ]);

  // Patch Steps Table
  const patchGrid = h('div', { class: 'patch-grid' });
  for (const p of COMBINATION_NRT_STANDARDS.controllerPatch) {
    const card = h('div', { class: 'patch-card' }, [
      h('h3', { class: 'patch-dose' }, p.dose),
      h('p', { class: 'patch-criteria' }, isEs ? p.criteriaEs : p.criteriaEn)
    ]);
    patchGrid.appendChild(card);
  }
  nrtCard.appendChild(patchGrid);

  // Oral Relievers Box
  const relieversBox = h('div', { class: 'relievers-box' }, [
    h('h3', { class: 'relievers-heading' }, isEs ? 'Aliviadores de Acción Rápida (Chicles y Pastillas)' : 'Rapid-Acting Oral Relievers (Gum & Lozenges)')
  ]);
  for (const r of COMBINATION_NRT_STANDARDS.relieverOral) {
    const item = h('div', { class: 'reliever-item' }, [
      h('strong', { class: 'reliever-title' }, r.product),
      h('p', { class: 'reliever-usage' }, isEs ? r.usageEs : r.usageEn)
    ]);
    relieversBox.appendChild(item);
  }
  nrtCard.appendChild(relieversBox);
  wrapper.appendChild(nrtCard);

  // Non-Nicotine Pharmacotherapy Card (Varenicline & Bupropion)
  const nonNicCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('pill'),
      h('span', {}, isEs ? 'Fármacos Orales con Receta: Vareniclina y Bupropión' : 'Prescription Oral Medications: Varenicline & Bupropion')
    ])
  ]);

  const nonNicGrid = h('div', { class: 'non-nic-grid' });
  for (const drug of NON_NICOTINE_PHARMACOTHERAPY) {
    const item = h('div', { class: 'non-nic-card' }, [
      h('div', { class: 'drug-header' }, [
        h('h3', { class: 'drug-name' }, drug.name),
        h('span', { class: 'drug-class' }, isEs ? drug.classEs : drug.classEn)
      ]),
      h('p', { class: 'drug-mech' }, [
        h('strong', {}, isEs ? 'Mecanismo: ' : 'Mechanism: '),
        h('span', {}, isEs ? drug.mechanismEs : drug.mechanismEn)
      ]),
      h('p', { class: 'drug-titration' }, [
        h('strong', {}, isEs ? 'Pauta de inicio: ' : 'Titration schedule: '),
        h('span', {}, isEs ? drug.titrationEs : drug.titrationEn)
      ]),
      h('div', { class: 'drug-safety' }, [
        icon('shield'),
        h('span', {}, isEs ? drug.safetyEs : drug.safetyEn)
      ])
    ]);
    nonNicGrid.appendChild(item);
  }
  nonNicCard.appendChild(nonNicGrid);
  wrapper.appendChild(nonNicCard);

  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 3: VAPING & POUCHES HARM REDUCTION
// ----------------------------------------------------------------------------

function renderVapingTab(localState, isEs) {
  const wrapper = h('div', { class: 'vaping-tab' });

  const vapeCard = h('section', { class: 'card' }, [
    h('h2', { class: 'card-title' }, [
      icon('trending-up'),
      h('span', {}, isEs ? VAPING_HARM_REDUCTION.titleEs : VAPING_HARM_REDUCTION.titleEn)
    ]),
    h('p', {}, isEs ? VAPING_HARM_REDUCTION.nicotineSaltsEs : VAPING_HARM_REDUCTION.nicotineSaltsEn)
  ]);

  // Tapering Ladder
  const ladderBox = h('div', { class: 'tapering-box' }, [
    h('h3', {}, isEs ? 'Escalera de Desescalada de Concentración de Vapeo:' : 'Vape Nicotine Down-Titration Ladder:')
  ]);
  const list = isEs ? VAPING_HARM_REDUCTION.taperingLadderEs : VAPING_HARM_REDUCTION.taperingLadderEn;
  const ol = h('ol', { class: 'ladder-list' });
  for (const step of list) {
    ol.appendChild(h('li', {}, step));
  }
  ladderBox.appendChild(ol);
  vapeCard.appendChild(ladderBox);

  // Modern Pouches Note
  const pouchBox = h('div', { class: 'pouch-box' }, [
    h('h3', {}, isEs ? 'Bolsas de Nicotina Orales sin Tabaco (Zyn, etc.):' : 'Tobacco-Free Oral Nicotine Pouches:'),
    h('p', {}, isEs ? VAPING_HARM_REDUCTION.pouchesEs : VAPING_HARM_REDUCTION.pouchesEn)
  ]);
  vapeCard.appendChild(pouchBox);

  wrapper.appendChild(vapeCard);
  return wrapper;
}

// ----------------------------------------------------------------------------
// TAB 4: CRAVING PLAN, FREE QUITLINES & ZERO-PII EXPORT
// ----------------------------------------------------------------------------

function renderCravingPlanTab(localState, isEs) {
  const wrapper = h('div', { class: 'craving-tab' });

  function reRender() {
    const parent = wrapper.closest('.nicotine-care-view');
    if (parent) {
      clear(parent);
      parent.appendChild(renderNicotineCareContent());
    }
  }

  // 4 D's Protocol Card
  const fourDsCard = h('section', { class: 'card four-ds-card' }, [
    h('h2', { class: 'card-title' }, [
      icon('clock'),
      h('span', {}, isEs ? 'El Protocolo de las 4 D para Desactivar Deseos Intensos' : 'The 4 D’s Craving Defusal Protocol')
    ]),
    h('p', { class: 'text-muted' }, isEs
      ? 'Cuando sienta un impulso repentino e intenso de fumar o vapear, aplique estas 4 técnicas inmediatas:'
      : 'When sudden peak cravings strike, apply these 4 rapid behavioral interventions:')
  ]);

  const fourDsGrid = h('div', { class: 'four-ds-grid' });
  for (const d of THE_FOUR_DS_PROTOCOL) {
    const item = h('div', { class: 'four-d-card' }, [
      h('h3', { class: 'four-d-title' }, isEs ? d.titleEs : d.titleEn),
      h('p', { class: 'four-d-desc' }, isEs ? d.descEs : d.descEn)
    ]);
    fourDsGrid.appendChild(item);
  }
  fourDsCard.appendChild(fourDsGrid);
  wrapper.appendChild(fourDsCard);

  // Free Quitline Access Card
  const quitlineCard = h('section', { class: 'card quitline-card' }, [
    h('h2', { class: 'card-title' }, [
      icon('phone-call'),
      h('span', {}, isEs ? 'Líneas de Ayuda Telefónicas Gratuitas y Parches por Correo' : 'Free State Quitlines & Mailed Nicotine Patches')
    ]),
    h('p', {}, isEs
      ? 'En todos los estados de EE. UU., las líneas telefónicas oficiales de cesación proporcionan asesoramiento telefónico confidencial gratuito y envían de 4 a 8 semanas de parches o chicles sin costo directamente a su domicilio:'
      : 'In every US state, official quitlines provide free confidential coaching and mail 4 to 8 weeks of free nicotine patches or gum directly to your home:'),
    h('div', { class: 'quitline-contacts' }, [
      h('div', { class: 'contact-pill' }, [
        h('strong', {}, isEs ? 'Línea Nacional (Inglés):' : 'National Quitline (English):'),
        h('a', { href: 'tel:18007848669', class: 'tel-link' }, ' 1-800-QUIT-NOW (800-784-8669)')
      ]),
      h('div', { class: 'contact-pill' }, [
        h('strong', {}, isEs ? 'Línea Nacional en Español:' : 'National Quitline (Spanish):'),
        h('a', { href: 'tel:18553353569', class: 'tel-link' }, ' 1-855-DÉJELO-YA (855-335-3569)')
      ])
    ])
  ]);
  wrapper.appendChild(quitlineCard);

  // Export Section
  const exportSection = h('section', { class: 'card export-section' }, [
    h('h3', {}, isEs ? 'Copia y Exportación de Resumen Seguro (Sin PII)' : 'Secure Clinical Dialogue Export (Zero PII)'),
    h('p', { class: 'text-muted' }, isEs
      ? 'Genere y copie un resumen en texto plano para dialogar sobre prescripción de TRN combinada o vareniclina con su médico:'
      : 'Generate and copy a privacy-safe text summary to discuss Combination NRT or varenicline coverage with your care team:')
  ]);

  const summaryText = formatNicotineSummaryText(localState, isEs ? 'es' : 'en');
  const textArea = h('textarea', {
    class: 'summary-textarea',
    readonly: 'readonly',
    rows: 14,
    'aria-label': isEs ? 'Resumen de Cesación Tabáquica' : 'Tobacco Cessation Summary'
  }, summaryText);

  const copyStatus = h('span', { class: 'copy-status', 'aria-live': 'polite' }, '');
  const copyBtn = h('button', {
    type: 'button',
    class: 'btn btn-primary',
    onclick: async () => {
      const ok = await copyText(summaryText, {
        trigger: copyBtn,
        copiedLabel: isEs ? '¡Copiado!' : 'Copied!',
        failedLabel: isEs ? 'Error al copiar' : 'Copy failed',
      });
      copyStatus.textContent = ok
        ? (isEs ? ' ¡Copiado con éxito!' : ' Copied successfully!')
        : (isEs ? ' Error al copiar' : ' Copy failed');
      if (ok) setTimeout(() => { copyStatus.textContent = ''; }, 3000);
    }
  }, [
    icon('copy'),
    h('span', {}, isEs ? 'Copiar Resumen Clínico' : 'Copy Clinical Summary')
  ]);

  const resetBtn = h('button', {
    type: 'button',
    class: 'btn btn-secondary',
    onclick: () => {
      resetNicotineState();
      reRender();
    }
  }, [
    icon('refresh-cw'),
    h('span', {}, isEs ? 'Restablecer Estado' : 'Reset State')
  ]);

  const btnRow = h('div', { class: 'btn-row' }, [copyBtn, resetBtn, copyStatus]);
  exportSection.appendChild(textArea);
  exportSection.appendChild(btnRow);
  wrapper.appendChild(exportSection);

  return wrapper;
}
