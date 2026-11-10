// public/js/views/hyperthermicToxidrome.js
// Wave 66: Stimulant, Synthetic Cathinone & Hyperthermic Crisis Decision Engine
// ACMT, Project BETA, and WMS Severe Hyperthermia Clinical Standards.
// Ephemeral in-RAM state, zero persistent storage, zero PII, WCAG 2.1 AA compliant.

import { h, clear, icon } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

export const HYPERTHERMIC_SUBSTANCES = Object.freeze({
  synthetic_cathinones: {
    id: 'synthetic_cathinones',
    name: 'Synthetic Cathinones / "Bath Salts" (Alpha-PVP / Flakka, MDPV, Eutylone)',
    nameEs: 'Catinonas Sintéticas / "Sales de Baño" (Alfa-PVP / Flakka, MDPV, Eutilona)',
    category: 'cathinone',
    mechanism: 'Potent non-substrate inhibitor of dopamine and norepinephrine reuptake transporters (DAT and NET), with 10x-50x higher potency than cocaine. Triggers explosive hyperadrenergic storm, severe uncoupled mitochondrial oxidative phosphorylation, violent psychomotor agitation, and malignant core hyperthermia exceeding 41°C (106°F).',
    mechanismEs: 'Potente inhibidor del transportador de dopamina y norepinefrina (DAT y NET), con potencia 10 a 50 veces superior a la cocaína. Desencadena tormenta hiperadrenérgica, desacoplamiento mitocondrial, agitación violenta e hipertermia maligna mayor a 41°C (106°F).',
    coolingPriority: 'STAT Cold Water Immersion (target core temp < 38.5°C within 30 min) + STAT chemical sedation with high-dose parenteral benzodiazepines (Midazolam 5-10 mg IM).',
    coolingPriorityEs: 'Inmersión en Agua Helada STAT (meta temperatura central < 38.5°C en 30 min) + sedación química inmediata con benzodiacepinas parenterales (Midazolam 5-10 mg IM).',
    blackBoxContraindication: 'PROLONGED PHYSICAL RESTRAINT CONTRAINDICATED (LETHAL ACIDOSIS SPIKE)',
    blackBoxContraindicationEs: 'SUJECIÓN FÍSICA PROLONGADA CONTRAINDICADA (PICO DE ACIDOSIS LETAL)',
    contraindicationDetail: 'Physical or 4-point restraints without immediate chemical sedation force the patient into sustained isometric muscle contraction against resistance. This exponentially increases muscular heat production, precipitates catastrophic lactic acidosis, massive rhabdomyolysis, and sudden asystolic cardiac arrest.',
    contraindicationDetailEs: 'La sujeción física o en 4 puntos sin sedación inmediata obliga al paciente a contracción isométrica sostenida contra resistencia. Esto dispara la producción muscular de calor, precipita acidosis láctica extrema, rabdomiólisis masiva y paro en asistolia súbito.',
  },
  methamphetamine_binge: {
    id: 'methamphetamine_binge',
    name: 'Methamphetamine / Amphetamines (Massive Overdose / Binge / Body Stuffer)',
    nameEs: 'Metanfetamina / Anfetaminas (Sobredosis Masiva / Consumo Continuo / Body Stuffer)',
    category: 'methamphetamine',
    mechanism: 'Reversal of dopamine, norepinephrine, and serotonin transporters (DAT, NET, SERT) plus inhibition of monoamine oxidase (MAO). Causes profound central vasoconstriction, peripheral hyperthermia, seizures, and severe ischemic rhabdomyolysis.',
    mechanismEs: 'Inversión de los transportadores de dopamina, norepinefrina y serotonina (DAT, NET, SERT) e inhibición de la MAO. Causa vasoconstricción central severa, hipertermia periférica, convulsiones y rabdomiólisis isquémica.',
    coolingPriority: 'Rapid aggressive cooling via ice water immersion or continuous evaporative misting + cold IV crystalloids (20-30 mL/kg) + IV Lorazepam 2-4 mg or Midazolam 5-10 mg.',
    coolingPriorityEs: 'Enfriamiento agresivo rápido mediante inmersión en hielo o nebulización evaporativa continua + cristaloides fríos IV (20-30 mL/kg) + Lorazepam 2-4 mg o Midazolam 5-10 mg IV.',
    blackBoxContraindication: 'ANTIPYRETIC AGENTS (ACETAMINOPHEN / NSAIDS) STRICTLY CONTRAINDICATED',
    blackBoxContraindicationEs: 'ANTIPIRÉTICOS (ACETAMINOFÉN / AINES) ESTRICTAMENTE CONTRAINDICADOS',
    contraindicationDetail: 'Sympathomimetic hyperthermia is driven by excessive muscular kinetic energy and mitochondrial uncoupling, NOT a prostaglandin E2 alteration of the hypothalamic set-point. Antipyretics are completely ineffective, while acetaminophen accelerates toxic hepatic necrosis and NSAIDs precipitate acute renal tubular injury.',
    contraindicationDetailEs: 'La hipertermia simpaticomimética es causada por trabajo muscular y desacoplamiento mitocondrial, NO por alteración del punto hipotalámico por prostaglandina E2. Los antipiréticos son ineficaces; el acetaminofén agrava la necrosis hepática y los AINEs la insuficiencia renal.',
  },
  mdma_serotonergic: {
    id: 'mdma_serotonergic',
    name: 'MDMA / Ecstasy / "Molly" (Serotonergic Sympathomimetic Crisis)',
    nameEs: 'MDMA / Éxtasis / "Molly" (Crisis Simpaticomimética Serotoninérgica)',
    category: 'mdma',
    mechanism: 'Massive presynaptic serotonin and dopamine release with inhibition of SERT and vesicular monoamine transporter 2 (VMAT2). Combines hyperthermic toxidrome with acute hyponatremic encephalopathy (SIADH-like syndrome amplified by excessive free-water drinking at raves/dance clubs).',
    mechanismEs: 'Liberación masiva presináptica de serotonina y dopamina con inhibición de SERT y VMAT2. Combina toxidrome hiperdérmico con encefalopatía hiponatrémica aguda (secreción inadecuada de ADH exacerbada por sobreingesta de agua en clubes).',
    coolingPriority: 'STAT core cooling to < 38.5°C + 3% Hypertonic Saline (100 mL IV bolus over 10 min) if actively seizing or herniating from acute dilutional hyponatremia (serum Na < 125 mEq/L).',
    coolingPriorityEs: 'Enfriamiento STAT a < 38.5°C + Solución Salina Hipertónica al 3% (100 mL IV en 10 min) si hay convulsiones por hiponatremia dilucional aguda (Na < 125 mEq/L).',
    blackBoxContraindication: 'OVER-COOLING BELOW 38.0°C HAZARD (HYPOTHERMIC OVERSHOOT)',
    blackBoxContraindicationEs: 'PELIGRO DE SOBRE-ENFRIAMIENTO POR DEBAJO DE 38.0°C (REBOTE HIPOTÉRMICO)',
    contraindicationDetail: 'Active ice water immersion must be stopped immediately when core temperature drops to 38.5°C (101.3°F). Continued immersion past this threshold causes severe hypothermic overshoot (< 35°C), fatal ventricular arrhythmias, and coagulopathy.',
    contraindicationDetailEs: 'La inmersión en agua helada debe suspenderse al alcanzar una temperatura central de 38.5°C (101.3°F). Continuar más allá provoca rebote hipotérmico (< 35°C), arritmias ventriculares fatales y coagulopatía.',
  },
  synthetic_phenethylamines: {
    id: 'synthetic_phenethylamines',
    name: 'Synthetic Phenethylamines (2C-B, 25I-NBOMe, "Smiles")',
    nameEs: 'Fenetilaminas Sintéticas (2C-B, 25I-NBOMe, "Smiles")',
    category: 'phenethylamine',
    mechanism: 'Ultra-potent full agonists at 5-HT2A receptors with intense peripheral vasoconstriction, microvascular ischemia, limb necrosis, intractable tonic-clonic seizures, and refractory core hyperthermia.',
    mechanismEs: 'Agonistas completos de altísima afinidad en receptores 5-HT2A con vasoconstricción periférica extrema, isquemia microvascular, necrosis de extremidades, convulsiones e hipertermia refractaria.',
    coolingPriority: 'High-dose Benzodiazepines (Midazolam/Lorazepam) + Rapid Active Cooling + Direct Vasodilators (Nitroprusside/Nicardipine) for severe vasospasm.',
    coolingPriorityEs: 'Benzodiacepinas en altas dosis (Midazolam/Lorazepam) + Enfriamiento Activo Rápido + Vasodilatadores directos (Nitroprusiato/Nicardipino) para vasoespasmo severo.',
    blackBoxContraindication: 'HALOPERIDOL / PHENOTHIAZINES CONTRAINDICATED IN ACUTE HYPERTHERMIC CRISIS',
    blackBoxContraindicationEs: 'HALOPERIDOL / FENOTIAZINAS CONTRAINDICADOS EN CRISIS HIPERTÉRMICA AGUDA',
    contraindicationDetail: 'Butyrophenones and typical antipsychotics impair central thermoregulation, reduce the seizure threshold, precipitate neuroleptic malignant syndrome (NMS), and exacerbate QTc prolongation and anticholinergic anhydrosis.',
    contraindicationDetailEs: 'Las butirofenonas y antipsicóticos típicos deterioran la termorregulación central, bajan el umbral convulsivo, precipitan síndrome neuroléptico maligno (SNM) y agravan la anhidrosis.',
  },
});

export const HYPERTHERMIC_CLINICAL_FLAGS = Object.freeze([
  { id: 'flag_temp_critical', label: 'Core Temp >= 40.0°C (104.0°F) or Anhydrosis: True hyperthermic medical emergency', labelEs: 'Temperatura Central >= 40.0°C (104.0°F) o Anhidrosis: Emergencia médica hiperdérmica crítica', fatal: true },
  { id: 'flag_violent_agitation', label: 'Violent Psychomotor Agitation / Excited Delirium: Inability to cooperate, extreme physical struggle', labelEs: 'Agitación Psicomotora Violenta / Delirio Agitado: Lucha física extrema e incoercible', fatal: true },
  { id: 'flag_rhabdomyolysis', label: 'Rhabdomyolysis / Cola-Colored Urine: Massive muscle breakdown (CK > 20,000 U/L)', labelEs: 'Rabdomiólisis / Orina Color Refresco: Destrucción muscular masiva (CK > 20,000 U/L)', fatal: true },
  { id: 'flag_seizures', label: 'Status Epilepticus / Generalized Seizures: Continuous seizure activity amplifying thermal generation', labelEs: 'Estado Epiléptico / Convulsiones Generalizadas: Actividad convulsiva continua generadora de calor', fatal: true },
  { id: 'flag_hyponatremia_coma', label: 'Acute Dilutional Hyponatremia / Free Water Ingestion (Ecstasy/MDMA encephalopathy)', labelEs: 'Hiponatremia Dilucional Aguda / Sobreingesta de Agua (Encefalopatía por Éxtasis/MDMA)', fatal: true },
  { id: 'flag_disseminated_dic', label: 'Coagulopathy / DIC: Petechiae, spontaneous bleeding, elevated INR/PTT from thermal endothelial injury', labelEs: 'Coagulopatía / CID: Petequias, sangrado espontáneo por daño endotelial térmico masivo', fatal: true },
]);

export function evaluateHyperthermicRisk(state) {
  const substance = HYPERTHERMIC_SUBSTANCES[state.substance] || HYPERTHERMIC_SUBSTANCES.synthetic_cathinones;
  const tempC = Number(state.tempCelsius) || 39.5;
  const flags = state.checkedFlags;

  const alerts = [];
  const actions = [];

  const isLethalThermal = tempC >= 40.0 || flags.has('flag_temp_critical');
  const isSevereThermal = tempC >= 39.0 && tempC < 40.0;
  const hasAgitation = flags.has('flag_violent_agitation');
  const hasSeizures = flags.has('flag_seizures');
  const hasRhabdo = flags.has('flag_rhabdomyolysis');
  const hasHyponatremia = flags.has('flag_hyponatremia_coma');

  if (isLethalThermal) {
    alerts.push({
      type: 'critical',
      title: 'LIFE-THREATENING HYPERTHERMIC CRISIS (CORE TEMP >= 40°C / 104°F)',
      titleEs: 'CRISIS HIPERTÉRMICA LETAL (TEMPERATURA CENTRAL >= 40°C / 104°F)',
      body: 'Core temperature exceeds critical cellular denaturation threshold. Mortality exceeds 50% without immediate rapid immersion cooling. Target: Cool to < 38.5°C (101.3°F) within 30 minutes ("Cool first, transport second").',
      bodyEs: 'La temperatura central supera el umbral de desnaturalización celular. Mortalidad > 50% sin enfriamiento inmediato por inmersión. Meta: Enfriar a < 38.5°C en 30 minutos ("Enfriar primero, trasladar después").',
    });
  } else if (isSevereThermal) {
    alerts.push({
      type: 'warning',
      title: 'SEVERE SYMATHOMIMETIC HYPERTHERMIA (39.0°C - 39.9°C)',
      titleEs: 'HIPERTERMIA SIMPATICOMIMÉTICA SEVERA (39.0°C - 39.9°C)',
      body: 'Patient is rapidly approaching malignant hyperthermic threshold. Initiate active cooling and aggressive parenteral benzodiazepine sedation to halt muscular heat production.',
      bodyEs: 'El paciente se aproxima rápidamente al umbral hiperdérmico maligno. Inicie enfriamiento activo y sedación agresiva con benzodiacepinas para frenar la termogénesis muscular.',
    });
  }

  // Cooling Protocol
  actions.push({
    priority: 'stat',
    text: 'STAT Cold Water / Ice Immersion Cooling: Immerse torso and limbs in agitated ice-water bath (1°C-10°C). Cooling rate: ~0.2°C-0.35°C/min. STOP active cooling immediately when core temperature reaches 38.5°C (101.3°F) to prevent severe hypothermic overshoot.',
    textEs: 'Enfriamiento STAT por Inmersión en Agua Helada: Sumergir torso y extremidades en agua con hielo agitada (1°C-10°C). Tasa de enfriamiento: 0.2-0.35°C/min. DETENER el enfriamiento al llegar a 38.5°C para evitar rebote hipotérmico.',
  });

  // Chemical Sedation Protocol
  actions.push({
    priority: 'stat',
    text: 'Rapid Chemical De-escalation (Benzodiazepines): Midazolam 5-10 mg IM (or 2-4 mg IV q5min) or Lorazepam 2-4 mg IV. Sedation halts central adrenergic drive and abolishes excessive muscular shivering and thermal generation. Avoid physical restraints without sedation.',
    textEs: 'Desescalada Química Inmediata (Benzodiacepinas): Midazolam 5-10 mg IM (o 2-4 mg IV c/5min) o Lorazepam 2-4 mg IV. La sedación frena la descarga adrenérgica y elimina la termogénesis muscular. Prohibida la contención mecánica sin sedación.',
  });

  if (hasAgitation) {
    actions.push({
      priority: 'urgent',
      text: 'Dissociative Sedation for Severe Violent Delirium: Ketamine 4-5 mg/kg IM (or 1-2 mg/kg IV) if patient is combative and refractory to initial benzodiazepine boluses. Produces rapid behavioral control within 2-4 minutes without respiratory depression.',
      textEs: 'Sedación Disociativa para Delirio Violento: Ketamina 4-5 mg/kg IM (o 1-2 mg/kg IV) si el paciente es combativo y refractario a benzodiacepinas. Provee control conductual en 2-4 minutos sin depresión respiratoria.',
    });
  }

  if (hasSeizures) {
    actions.push({
      priority: 'stat',
      text: 'Status Epilepticus Control: Midazolam 10 mg IM or Lorazepam 4 mg IV. If seizures persist past 10 minutes, proceed to Propofol 1-2 mg/kg IV bolus + 20-50 mcg/kg/min infusion or Levetiracetam 60 mg/kg IV (max 4.5 g).',
      textEs: 'Control de Estado Epiléptico: Midazolam 10 mg IM o Lorazepam 4 mg IV. Si persiste más de 10 min, administrar Propofol 1-2 mg/kg IV + infusión continua o Levetiracetam 60 mg/kg IV.',
    });
  }

  if (hasHyponatremia) {
    actions.push({
      priority: 'stat',
      text: 'Hypertonic Saline (3% NaCl) for MDMA Hyponatremic Encephalopathy: 100 mL IV bolus over 10 minutes; repeat twice q10min if comatose or seizing (elevates serum sodium by 4-6 mEq/L, aborting cerebral herniation). Prohibit hypotonic fluids.',
      textEs: 'Solución Salina Hipertónica al 3% para Encefalopatía por MDMA: Bolo de 100 mL IV en 10 min; repetir hasta 2 veces c/10min en coma o convulsiones (eleva sodio 4-6 mEq/L revirtiendo herniación cerebral). Prohibir líquidos hipotónicos.',
    });
  }

  if (hasRhabdo) {
    actions.push({
      priority: 'urgent',
      text: 'Rhabdomyolysis & Renal Protection: Chilled Normal Saline 20-30 mL/kg IV bolus, followed by 200-300 mL/hr to maintain target urine output 200-300 mL/hr (2-3 mL/kg/hr). Check serum K+ and CK every 2 hours.',
      textEs: 'Protección Renal y Rabdomiólisis: Solución Salina fría 20-30 mL/kg en bolo, luego 200-300 mL/h para mantener diuresis meta de 200-300 mL/h. Monitorear potasio sérico y CK cada 2 horas.',
    });
  }

  return {
    substance,
    tempC,
    isLethalThermal,
    isSevereThermal,
    alerts,
    actions,
  };
}

export function generateHyperthermicSbar(state, lang = 'en') {
  const isEs = lang === 'es';
  const sub = HYPERTHERMIC_SUBSTANCES[state.substance] || HYPERTHERMIC_SUBSTANCES.synthetic_cathinones;
  const evalResult = evaluateHyperthermicRisk(state);
  const now = new Date().toISOString();

  if (isEs) {
    return [
      '=== REPORTE CLÍNICO SBAR: CRISIS HIPERTÉRMICA POR ESTIMULANTES / CATINONAS ===',
      `Fecha/Hora: ${now}`,
      'Privacidad: Cero PII / Identificadores Anonimizados (Cumplimiento HIPAA / 42 CFR Parte 2)',
      '',
      'SITUATION (SITUACIÓN):',
      `Paciente con crisis hiperdérmica aguda secundaria a toxicidad por ${sub.nameEs}.`,
      `Temperatura Central: ${state.tempCelsius || '39.5'} °C (${((Number(state.tempCelsius) || 39.5) * 9 / 5 + 32).toFixed(1)} °F). Frecuencia Cardíaca: ${state.hrValue || 'Pendiente'} lpm. Estado Mental: ${state.checkedFlags.has('flag_violent_agitation') ? 'DELIRIO AGITADO VIOLENTO' : 'Coma / Depresión'}.`,
      `Clasificación de Severidad: ${evalResult.isLethalThermal ? 'EMERGENCIA HIPERTÉRMICA LETAL (>= 40.0°C)' : 'Hipertermia Simpaticomimética Severa'}.`,
      '',
      'BACKGROUND (ANTECEDENTES):',
      `Mecanismo Fisiopatológico: ${sub.mechanismEs}`,
      `Banderas Clínicas Activas: ${Array.from(state.checkedFlags).join(', ') || 'Ninguna registrada'}`,
      '',
      'ASSESSMENT (EVALUACIÓN Y PRIORIDADES DE RESCATE):',
      '• Meta de Enfriamiento: Reducir temperatura central a < 38.5°C en menos de 30 minutos',
      '• Modalidad de Elección: Inmersión en agua con hielo (tasa 0.2-0.35°C/min) o nebulización evaporativa continua con ventilador de alta velocidad',
      '• Sedación Química: Midazolam 5-10 mg IM o Lorazepam 2-4 mg IV STAT para apagar la termogénesis muscular',
      '',
      'RECOMMENDATIONS & CRITICAL DIRECTIVES (RECOMENDACIONES Y DIRECTIVAS CRÍTICAS):',
      `1. ADVERTENCIA NEGRA: ${sub.blackBoxContraindicationEs}`,
      `   ${sub.contraindicationDetailEs}`,
      '2. PROHIBIDO el uso de antipiréticos (acetaminofén / AINEs); son ineficaces y causan daño hepático/renal.',
      '3. PROHIBIDA la contención mecánica física sin sedación química inmediata (desencadena paro por acidosis láctica extrema).',
      '4. DETENER la inmersión activa en hielo cuando la temperatura central alcance los 38.5°C para evitar rebote hipotérmico.',
      '5. Hidratación vigorosa con cristaloides fríos para prevenir insuficiencia renal por rabdomiólisis.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '=== SBAR CLINICAL HANDOFF REPORT: STIMULANT & CATHINONE HYPERTHERMIC CRISIS ===',
    `Timestamp: ${now}`,
    'Privacy: Zero PII / Redacted Identifiers (HIPAA / 42 CFR Part 2 Compliant)',
    '',
    'SITUATION:',
    `Patient presenting in acute hyperthermic crisis secondary to severe toxicity from ${sub.name}.`,
    `Core Temperature: ${state.tempCelsius || '39.5'} °C (${((Number(state.tempCelsius) || 39.5) * 9 / 5 + 32).toFixed(1)} °F). Heart Rate: ${state.hrValue || 'Pending'} bpm. Mental Status: ${state.checkedFlags.has('flag_violent_agitation') ? 'EXCITED DELIRIUM / VIOLENT AGITATION' : 'Coma / Stupor'}.`,
    `Thermal Classification: ${evalResult.isLethalThermal ? 'LIFE-THREATENING EMERGENCY (CORE TEMP >= 40.0°C)' : 'Severe Sympathomimetic Hyperthermia'}.`,
    '',
    'BACKGROUND:',
    `Toxicological Mechanism: ${sub.mechanism}`,
    `Active Clinical Flags: ${Array.from(state.checkedFlags).join(', ') || 'None selected'}`,
    '',
    'ASSESSMENT & RESUSCITATION PRIORITIES:',
    '• Rapid Cooling Target: Lower core temperature to < 38.5°C (< 101.3°F) within 30 minutes',
    '• Modality of Choice: Agitated ice water immersion (~0.2-0.35°C/min) or continuous evaporative misting with high-velocity fan',
    '• Chemical Sedation: Midazolam 5-10 mg IM or Lorazepam 2-4 mg IV STAT to arrest muscular heat generation',
    '',
    'RECOMMENDATIONS & LIFE-SAVING DIRECTIVES:',
    `1. BLACK-BOX ALERT: ${sub.blackBoxContraindication}`,
    `   ${sub.contraindicationDetail}`,
    '2. PROHIBIT antipyretics (acetaminophen / NSAIDs); completely ineffective and exacerbate liver/kidney failure.',
    '3. PROHIBIT physical restraints without immediate chemical sedation (triggers fatal lactic acidosis surge).',
    '4. STOP active ice immersion cooling when core temperature reaches 38.5°C to prevent hypothermic overshoot.',
    '5. Infuse cold crystalloids (20-30 mL/kg) and maintain brisk urine output for rhabdomyolysis renal protection.',
    '====================================================================',
  ].join('\n');
}

// In-RAM Ephemeral State Lifecycle
function createInitialState() {
  return {
    substance: 'synthetic_cathinones',
    tempCelsius: '40.6',
    hrValue: '148',
    checkedFlags: new Set(['flag_temp_critical', 'flag_violent_agitation', 'flag_rhabdomyolysis']),
  };
}

let hyperthermicState = createInitialState();
const listeners = new Set();

export function getHyperthermicState() {
  return hyperthermicState;
}

export function updateHyperthermicState(partial) {
  hyperthermicState = { ...hyperthermicState, ...partial };
  listeners.forEach((fn) => fn(getHyperthermicState()));
}

export function resetHyperthermicState() {
  hyperthermicState = createInitialState();
  listeners.forEach((fn) => fn(getHyperthermicState()));
}

export function subscribeHyperthermicState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Accessible DOM View
export function hyperthermicToxidromeView() {
  const container = h('div', { class: 'hyperthermic-view specialized-clinical-view' });
  const lang = getLang();
  const isEs = lang === 'es';

  const header = pageHeader(
    t('tools.item.hyperthermic-toxidrome.title', 'Stimulant, Synthetic Cathinone & Hyperthermic Crisis Decision Engine'),
    t(
      'tools.item.hyperthermic-toxidrome.description',
      'Clinical emergency protocols for synthetic cathinones (Flakka/Bath Salts), methamphetamine hyperthermia (>= 40°C), rapid ice immersion cooling, parenteral chemical sedation, and black-box physical restraint & antipyretic prohibitions.',
    ),
  );
  container.appendChild(header);

  // Dynamic Blackbox Warning Banner Container
  const warningBannerContainer = h('div');
  container.appendChild(warningBannerContainer);

  // Grid Layout
  const grid = h('div', { class: 'nsti-grid' });
  const leftCol = h('div', { class: 'nsti-col' });
  const rightCol = h('div', { class: 'nsti-col' });
  grid.appendChild(leftCol);
  grid.appendChild(rightCol);
  container.appendChild(grid);

  // Substance Selection Card
  const subSelect = h(
    'select',
    {
      class: 'nsti-select',
      'aria-label': isEs ? 'Seleccionar sustancia implicada' : 'Select implicated substance',
      onchange: (e) => updateHyperthermicState({ substance: e.target.value }),
    },
    Object.values(HYPERTHERMIC_SUBSTANCES).map((item) =>
      h('option', { value: item.id, selected: item.id === getHyperthermicState().substance }, isEs ? item.nameEs : item.name),
    ),
  );
  const mechanismContainer = h('div', { class: 'nsti-stage-info' });
  const subCard = h('div', { class: 'nsti-card' }, [
    h('h2', { class: 'nsti-card-title' }, isEs ? '1. Agente Simpaticomimético Implicado' : '1. Implicated Sympathomimetic Agent'),
    subSelect,
    mechanismContainer,
  ]);
  leftCol.appendChild(subCard);

  // Vitals & Thermal Inputs Card
  const tempInput = h('input', {
    id: 'temp-input',
    type: 'number',
    step: '0.1',
    class: 'nsti-num-input',
    placeholder: '40.6',
    value: getHyperthermicState().tempCelsius,
    oninput: (e) => updateHyperthermicState({ tempCelsius: e.target.value }),
  });
  const hrInput = h('input', {
    id: 'hr-input',
    type: 'number',
    class: 'nsti-num-input',
    placeholder: '148',
    value: getHyperthermicState().hrValue,
    oninput: (e) => updateHyperthermicState({ hrValue: e.target.value }),
  });

  const vitalsCard = h('div', { class: 'nsti-card' }, [
    h('h2', { class: 'nsti-card-title' }, isEs ? '2. Temperatura Central y Signos Vitales' : '2. Core Temperature & Vitals'),
    h('div', { class: 'decon-input-group' }, [
      h('label', { for: 'temp-input' }, isEs ? 'Temperatura Central (°C - Alerta Crítica si >= 40.0°C):' : 'Core Temperature (°C - Critical Alert if >= 40.0°C):'),
      tempInput,
    ]),
    h('div', { class: 'decon-input-group' }, [
      h('label', { for: 'hr-input' }, isEs ? 'Frecuencia Cardíaca (lpm):' : 'Heart Rate (bpm):'),
      hrInput,
    ]),
  ]);
  leftCol.appendChild(vitalsCard);

  // Clinical Flags Card
  const flagCheckboxes = [];
  const flagsCard = h('div', { class: 'nsti-card' }, [
    h('h2', { class: 'nsti-card-title' }, isEs ? '3. Banderas de Emergencia Hipertérmica' : '3. Hyperthermic Emergency Flags'),
    h(
      'div',
      { class: 'decon-checkbox-group' },
      HYPERTHERMIC_CLINICAL_FLAGS.map((f) => {
        const cb = h('input', {
          type: 'checkbox',
          checked: getHyperthermicState().checkedFlags.has(f.id),
          onchange: (e) => {
            const set = new Set(getHyperthermicState().checkedFlags);
            if (e.target.checked) set.add(f.id);
            else set.delete(f.id);
            updateHyperthermicState({ checkedFlags: set });
          },
        });
        flagCheckboxes.push({ id: f.id, input: cb });
        return h(
          'label',
          { class: `disaster-check-row ${f.fatal ? 'emergency-row' : ''}` },
          [
            cb,
            h('span', { class: 'disaster-check-label' }, isEs ? f.labelEs : f.label),
          ],
        );
      }),
    ),
  ]);
  leftCol.appendChild(flagsCard);

  // Dynamic Right Column Containers
  const coolingDirectivesCardContainer = h('div');
  const directivesCardContainer = h('div');
  const sbarCardContainer = h('div');
  rightCol.appendChild(coolingDirectivesCardContainer);
  rightCol.appendChild(directivesCardContainer);
  rightCol.appendChild(sbarCardContainer);

  function renderDynamic() {
    const state = getHyperthermicState();
    const sub = HYPERTHERMIC_SUBSTANCES[state.substance] || HYPERTHERMIC_SUBSTANCES.synthetic_cathinones;
    const evalResult = evaluateHyperthermicRisk(state);

    // Update Warning Banner
    clear(warningBannerContainer);
    warningBannerContainer.appendChild(
      h('div', { class: 'movement-blackbox-banner' }, [
        h('div', { class: 'movement-banner-header' }, [
          icon('alert'),
          h('strong', {}, isEs ? ' ADVERTENCIA NEGRA TOXICOLÓGICA: ' + sub.blackBoxContraindicationEs : ' BLACK-BOX TOXICOLOGY ALERT: ' + sub.blackBoxContraindication),
        ]),
        h('p', {}, isEs ? sub.contraindicationDetailEs : sub.contraindicationDetail),
      ]),
    );

    // Update Mechanism Info
    clear(mechanismContainer);
    mechanismContainer.appendChild(h('strong', {}, isEs ? 'Fisiopatología de la Hipertermia: ' : 'Hyperthermia Pathophysiology: '));
    mechanismContainer.appendChild(h('p', {}, isEs ? sub.mechanismEs : sub.mechanism));
    mechanismContainer.appendChild(h('strong', {}, isEs ? 'Prioridad de Enfriamiento: ' : 'Cooling Priority: '));
    mechanismContainer.appendChild(h('p', {}, isEs ? sub.coolingPriorityEs : sub.coolingPriority));

    // Update Cooling Targets Card
    clear(coolingDirectivesCardContainer);
    coolingDirectivesCardContainer.appendChild(
      h('div', { class: 'nsti-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? '4. Metas y Protocolo de Enfriamiento Activo' : '4. Active Cooling Targets & Protocol'),
        h('div', { class: 'decon-directive-box' }, [
          h('p', {}, [
            h('strong', {}, isEs ? '• Regla de Oro: ' : '• Golden Rule: '),
            h('span', { class: 'font-bold' }, isEs ? '"Enfriar Primero, Trasladar Después" ' : '"Cool First, Transport Second" '),
            h('span', {}, isEs ? '- Bajar temperatura central a < 38.5°C en menos de 30 minutos.' : '- Lower core temperature to < 38.5°C in under 30 minutes.'),
          ]),
          h('p', {}, [
            h('strong', {}, isEs ? '• Tasa de Inmersión en Hielo: ' : '• Ice Immersion Rate: '),
            h('span', {}, isEs ? '0.2°C a 0.35°C por minuto en tina de agua helada con agitación constante.' : '0.2°C to 0.35°C per minute in stirred ice water bath.'),
          ]),
          h('p', {}, [
            h('strong', {}, isEs ? '• Umbral de Detención: ' : '• Stopping Threshold: '),
            h('span', { class: 'font-bold' }, '38.5°C (101.3°F) '),
            h('span', {}, isEs ? '- Suspender enfriamiento activo al llegar aquí para evitar choque por rebote hipotérmico.' : '- Cease active immersion at this point to prevent severe hypothermic overshoot.'),
          ]),
        ]),
      ]),
    );

    // Update Directives Card
    clear(directivesCardContainer);
    directivesCardContainer.appendChild(
      h('div', { class: 'nsti-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? '5. Directivas de Manejo Farmacológico y Sedación' : '5. Pharmacologic Sedation & Resuscitation Directives'),
        evalResult.alerts.length > 0
          ? h(
              'div',
              { class: 'disaster-alert-box alert-critical' },
              evalResult.alerts.map((a) =>
                h('div', {}, [
                  h('strong', {}, isEs ? a.titleEs : a.title),
                  h('p', {}, isEs ? a.bodyEs : a.body),
                ]),
              ),
            )
          : null,
        h(
          'div',
          { class: 'disaster-action-list' },
          evalResult.actions.map((act) =>
            h('div', { class: 'disaster-action-item' }, [
              h('span', { class: `disaster-badge badge-${act.priority === 'stat' ? 'danger' : act.priority === 'urgent' ? 'warning' : 'low'}` }, act.priority.toUpperCase()),
              h('span', {}, isEs ? act.textEs : act.text),
            ]),
          ),
        ),
      ]),
    );

    // Update SBAR Note Card
    const sbarText = generateHyperthermicSbar(state, lang);
    clear(sbarCardContainer);
    const sbarTextarea = h(
      'textarea',
      {
        id: 'hyperthermic-sbar-text',
        class: 'nsti-sbar-textarea',
        rows: '14',
        readonly: true,
        'aria-label': isEs ? 'Nota clínica SBAR generada' : 'Generated SBAR clinical handoff note',
      },
      sbarText,
    );
    sbarTextarea.value = sbarText;

    const copyBtn = h(
      'button',
      {
        type: 'button',
        class: 'btn btn-primary',
        onclick: async () => {
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(sbarTextarea.value);
            } else {
              sbarTextarea.select();
              document.execCommand('copy');
            }
            copyBtn.textContent = isEs ? '¡Copiado!' : 'Copied!';
            setTimeout(() => {
              copyBtn.textContent = isEs ? 'Copiar Nota SBAR' : 'Copy SBAR Note';
            }, 2000);
          } catch {
            sbarTextarea.select();
          }
        },
      },
      isEs ? 'Copiar Nota SBAR' : 'Copy SBAR Note',
    );

    const resetBtn = h(
      'button',
      {
        type: 'button',
        class: 'btn btn-secondary',
        onclick: () => {
          resetHyperthermicState();
          tempInput.value = '40.6';
          hrInput.value = '148';
          subSelect.value = 'synthetic_cathinones';
          flagCheckboxes.forEach((f) => {
            f.input.checked = ['flag_temp_critical', 'flag_violent_agitation', 'flag_rhabdomyolysis'].includes(f.id);
          });
        },
      },
      isEs ? 'Reiniciar Formulario' : 'Reset Form',
    );

    sbarCardContainer.appendChild(
      h('div', { class: 'nsti-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? '6. Nota SBAR de Transferencia Toxicológica (Cero PII)' : '6. Zero-PII SBAR Toxicology Handoff Note'),
        sbarTextarea,
        h('div', { class: 'nsti-btn-row' }, [copyBtn, resetBtn]),
      ]),
    );
  }

  const unsubscribe = subscribeHyperthermicState(() => {
    if (!container.isConnected) {
      unsubscribe();
      return;
    }
    renderDynamic();
  });
  renderDynamic();
  container._cleanup = unsubscribe;
  return container;
}
