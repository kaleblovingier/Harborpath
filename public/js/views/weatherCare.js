// public/js/views/weatherCare.js
// HarborPath - Environmental Temperature Extremes, Hypothermia, Frostbite & Heat Stroke Safety Navigator
// Clinical Consensus: Wilderness Medical Society (WMS) Clinical Practice Guidelines for the Out-of-Hospital Evaluation & Treatment of Accidental Hypothermia,
// WMS Guidelines for the Prevention & Treatment of Frostbite & Non-Freezing Cold Injury (Trench Foot),
// American College of Emergency Physicians (ACEP) Heat Illness & Heat Stroke Consensus,
// CDC Extreme Cold & Heat Response Standards for Unhoused & Substance Using Populations.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII.

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: SUBSTANCE INTERACTIONS WITH THERMOREGULATION
// ============================================================================

export const THERMAL_SUBSTANCE_PROFILES = Object.freeze({
  depressantsAlcohol: Object.freeze({
    id: 'depressants_alcohol',
    nameEn: 'Alcohol, Opioids & Sedatives (Extreme Cold & Hypothermia Hazard)',
    nameEs: 'Alcohol, Opioides y Sedantes (Peligro de Frío Extremo e Hipotermia)',
    mechanismEn: 'Ethanol causes cutaneous vasodilation (creating a false subjective sensation of warmth while rapidly dumping core heat to the environment) and impairs hepatic gluconeogenesis, producing profound hypoglycemia. Opioids directly suppress hypothalamic thermal setpoints and abolish shivering thermogenesis. Sedatives induce prolonged immobility on freezing ground or wet concrete.',
    mechanismEs: 'El alcohol produce vasodilatación cutánea (falsa sensación de calor mientras disipa el calor central) e inhibe la gluconeogénesis causando hipoglucemia severa. Los opioides anulan los escalofríos y deprimen el termostato hipotalámico. Los sedantes causan inmovilidad prolongada en suelo congelado.',
    clinicalHazardsEn: 'Fatal accidental hypothermia can develop in hours, even at moderate ambient temperatures (40–55°F / 4–13°C), especially if clothes are damp. Hypothermic myocardium is extremely irritable; rough movement can trigger fatal Ventricular Fibrillation.',
    clinicalHazardsEs: 'La hipotermia mortal puede ocurrir en horas, incluso con frío moderado (4–13°C) si la ropa está húmeda. El corazón frío es sumamente irritable; movimientos bruscos pueden desencadenar fibrilación ventricular mortal.',
  }),

  stimulantsPsychotropics: Object.freeze({
    id: 'stimulants_psychotropics',
    nameEn: 'Stimulants, Anticholinergics & Antipsychotics (Extreme Heat & Hyperthermia Hazard)',
    nameEs: 'Estimulantes, Anticolinérgicos y Antipsicóticos (Peligro de Calor Extremo e Hipertermia)',
    mechanismEn: 'Stimulants (methamphetamine, cocaine, MDMA) stimulate central alpha-1 and beta-adrenergic receptors, uncouple mitochondrial oxidative phosphorylation, and induce severe hyperlocomotion, generating massive endogenous metabolic heat. Anticholinergics and typical/atypical antipsychotics block muscarinic receptors on sweat glands, causing anhidrosis (inability to dissipate heat via sweating).',
    mechanismEs: 'Los estimulantes (metanfetamina, cocaína, MDMA) aumentan la producción metabólica de calor y desacoplan la fosforilación oxidativa mitocondrial. Los anticolinérgicos y antipsicóticos bloquean la sudoración (anhidrosis), impidiendo disipar el calor.',
    clinicalHazardsEn: 'Rapid progression to Heat Stroke (core temp > 40°C / 104°F) with delirium, seizures, rhabdomyolysis, disseminated intravascular coagulation (DIC), and acute renal failure. Antipyretics (acetaminophen/aspirin) are completely ineffective and worsen liver injury.',
    clinicalHazardsEs: 'Evolución rápida a Golpe de Calor (temperatura central > 40°C) con delirio, convulsiones, rabdomiólisis y fallo renal. Los antipiréticos (paracetamol/aspirina) son ineficaces y agravan el daño hepático.',
  }),
});

// ============================================================================
// CLINICAL STAGING: ACCIDENTAL HYPOTHERMIA (SWISS STAGING SYSTEM I–IV)
// ============================================================================

export const HYPOTHERMIA_SWISS_STAGES = Object.freeze([
  {
    stageNum: 1,
    stageId: 'stage_1_mild',
    titleEn: 'Stage I: Mild Hypothermia (Core Temp: 32°C – 35°C / 90°F – 95°F)',
    titleEs: 'Estadio I: Hipotermia Leve (Temp. Central: 32°C – 35°C / 90°F – 95°F)',
    severity: 'mild_caution',
    mentalStatusEn: 'Conscious, alert, may be slightly apathetic or shivering vigorously.',
    symptomsEn: [
      'Vigorous, uncontrollable shivering (body’s primary active defense mechanism).',
      'Cold, pale, vasoconstricted skin with mild tachycardia and tachypnea.',
      'Normal or slightly slurred speech; normal cardiac rhythm.',
      'Core temperature remains between 32°C and 35°C.',
    ],
    symptomsEs: [
      'Escalofríos vigorosos e incontrolables (mecanismo principal de defensa térmica).',
      'Piel fría y pálida con taquicardia y taquipnea leve.',
      'Habla normal o ligeramente torpe; ritmo cardíaco normal.',
      'Temperatura central entre 32°C y 35°C.',
    ],
    managementEn: 'Passive external rewarming: move to shelter, remove wet clothing immediately, dress in warm dry layers, cover head and neck, provide warm sweet non-alcoholic drinks and high-calorie food if swallowing safely.',
    managementEs: 'Recalentamiento pasivo: trasladar a refugio, retirar ropa mojada, abrigar con mantas secas, cubrir cabeza y dar bebidas calientes azucaradas sin alcohol.',
  },
  {
    stageNum: 2,
    stageId: 'stage_2_moderate',
    titleEn: 'Stage II: Moderate Hypothermia (Core Temp: 28°C – 32°C / 82°F – 90°F)',
    titleEs: 'Estadio II: Hipotermia Moderada (Temp. Central: 28°C – 32°C / 82°F – 90°F)',
    severity: 'moderate_warning',
    mentalStatusEn: 'Impaired consciousness, confusion, lethargy, slurred speech, ataxia.',
    symptomsEn: [
      'SHIVERING CESSATION: Shivering stops completely as glycogen stores exhaust (CRITICAL RED FLAG!).',
      'Muscle stiffness, hyporeflexia, dilated sluggish pupils.',
      'Bradycardia, hypoventilation, hypotension, cold diuresis.',
      'Paradoxical undressing may occur (erroneously feeling burning hot due to terminal vasodilation).',
    ],
    symptomsEs: [
      'CESE DE ESCALOFRÍOS: El cuerpo deja de temblar al agotarse el glucógeno (¡BANDERA ROJA CRÍTICA!).',
      'Rigidez muscular, confusión, pupilas lentas y dilatadas.',
      'Bradicardia, respiración lenta y desnudamiento paradójico.',
      'Temperatura central entre 28°C y 32°C.',
    ],
    managementEn: 'Active external rewarming of trunk (chemical warm packs to axillae, groin, and chest; warm blankets; heated humidified oxygen). GENTLE HANDLING: keep patient strictly horizontal; avoid rough movement to prevent triggering Ventricular Fibrillation.',
    managementEs: 'Recalentamiento activo del tronco (compresas térmicas en axilas e ingles, mantas térmicas, oxígeno caliente humidificado). MANEJO SUAVE: mantener horizontal y evitar sacudidas para no inducir fibrilación ventricular.',
  },
  {
    stageNum: 3,
    stageId: 'stage_3_severe',
    titleEn: 'Stage III: Severe Hypothermia (Core Temp: 24°C – 28°C / 75°F – 82°F)',
    titleEs: 'Estadio III: Hipotermia Grave (Temp. Central: 24°C – 28°C / 75°F – 82°F)',
    severity: 'severe_danger',
    mentalStatusEn: 'Unconscious, comatose, non-responsive to verbal or painful stimuli.',
    symptomsEn: [
      'Profound bradycardia, barely palpable carotid pulse, shallow infrequent respirations.',
      'Osborn J-waves visible on 12-lead ECG at the junction of QRS and ST segments.',
      'Extreme myocardial irritability: slightest mechanical jostling triggers refractory V-Fib or asystole.',
      'Areflxia, fixed dilated pupils, cold marble-like skin.',
    ],
    symptomsEs: [
      'Bradicardia extrema, pulso carotídeo casi imperceptible y respiraciones agónicas.',
      'Ondas J de Osborn en el ECG en la unión QRS-ST.',
      'Extrema irritabilidad cardíaca: cualquier movimiento brusco provoca FV refractaria.',
      'Coma profundo, arreflexia y piel marmórea helada.',
    ],
    managementEn: 'CRITICAL EMERGENCY: Active internal rewarming in ICU (warmed IV crystalloids at 42°C, bladder/thoracic lavage, or ECMO). Endotracheal intubation with pre-oxygenation. Maintain gentle handling and strict immobilization.',
    managementEs: 'EMERGENCIA CRÍTICA: Recalentamiento interno activo en UCI (sueros IV calientes a 42°C, lavado vesical o ECMO). Intubación suave e inmovilización absoluta.',
  },
  {
    stageNum: 4,
    stageId: 'stage_4_apparent_death',
    titleEn: 'Stage IV: Apparent Death / Cardiac Arrest (Core Temp < 24°C / < 75°F)',
    titleEs: 'Estadio IV: Muerte Aparente / Parada Cardíaca (Temp. Central < 24°C / < 75°F)',
    severity: 'critical_emergency',
    mentalStatusEn: 'No signs of life, pulseless, apneic, body rigid and ice-cold.',
    symptomsEn: [
      'Asystole or fine low-amplitude Ventricular Fibrillation.',
      'Stiff chest wall and extremities mimicking rigor mortis.',
      'Pupils fixed, non-reactive, and corneal reflexes absent.',
      'CARDIAC ARREST IN THE COLD: Metabolism is reduced by 50% for every 10°C drop in core temperature.',
    ],
    symptomsEs: [
      'Asistolia o fibrilación ventricular de bajo voltaje.',
      'Rigidez torácica y muscular que simula rigor mortis.',
      'Pupilas fijas y midriáticas sin reflejos.',
      'El metabolismo cerebral se reduce un 50% por cada 10°C de caída térmica.',
    ],
    managementEn: 'RESUSCITATION RULE: "NO ONE IS DEAD UNTIL WARM AND DEAD!" Continue high-quality continuous CPR during rapid transport to an Extracorporeal Life Support (ECLS / ECMO) center. Full intact neurological recovery has occurred after hours of hypothermic cardiac arrest once rewarmed above 32°C.',
    managementEs: 'REGLA DE ORO DE RCP: «¡NADIE ESTÁ MUERTO HASTA ESTAR CALIENTE Y MUERTO!». Mantener RCP continua hasta llegar a centro con ECMO. Se han documentado recuperaciones neurológicas completas tras horas de parada al recalentar por encima de 32°C.',
  },
]);

// ============================================================================
// CLINICAL DIFFERENTIAL ENGINES: FROSTBITE, TRENCH FOOT & HEAT STROKE
// ============================================================================

export const ENVIRONMENTAL_CLINICAL_DIFFERENTIALS = Object.freeze({
  frostbite: Object.freeze({
    id: 'frostbite',
    titleEn: 'Frostbite: Freezing Tissue Injury (Superficial vs Deep Staging)',
    titleEs: 'Congelación: Lesión Tisular por Frío (Estadificación Superficial vs Profunda)',
    severity: 'emergency_hospital',
    hallmarksEn: 'Ice crystals form within extracellular fluid. Clear blisters (superficial: Stage 2) have good prognosis; dark hemorrhagic/purple blisters (deep: Stage 3) indicate microvascular thrombosis and dermal necrosis; rock-hard frozen digits with dry gangrene (Stage 4) threaten total limb loss.',
    hallmarksEs: 'Cristales de hielo en el tejido. Ampollas claras (Estadio 2) tienen buen pronóstico; ampollas hemorrágicas oscuras/violáceas (Estadio 3) indican trombosis microvascular y necrosis; tejido congelado pétreo y gangrena (Estadio 4) amenazan con amputación.',
    actionEn: 'PROTOCOL: 1) NEVER rub or massage frozen skin (ice crystals lacerate cells); 2) NEVER rewarm if there is any risk of refreezing (refreezing causes 100% necrosis); 3) Rapid water bath rewarming at 37°C–39°C (99°F–102°F) for 15–30 min; 4) Ibuprofen 12 mg/kg/day to block thromboxane A₂ microvascular thrombosis; 5) Urgent hospital evaluation for IV iloprost or intra-arterial tPA within 24 hours of thawing.',
    actionEs: 'PROTOCOLO: 1) NUNCA frotar la piel congelada (desgarra el tejido); 2) NUNCA recalentar si hay riesgo de recongelación (causa necrosis total); 3) Recalentamiento en baño de agua a 37°C-39°C durante 15-30 min; 4) Ibuprofeno para frenar el tromboxano A₂; 5) Valoración hospitalaria de iloprost o tPA antes de 24 horas.',
  }),

  trenchFoot: Object.freeze({
    id: 'trench_foot',
    titleEn: 'Non-Freezing Cold Injury (Trench Foot / Immersion Foot)',
    titleEs: 'Pie de Trinchera / Lesión por Frío no Congelante (Pie de Inmersión)',
    severity: 'urgent_care',
    hallmarksEn: 'Develops after prolonged exposure (12 hours to days) of feet to wet, damp, non-freezing conditions (0°C–15°C / 32°F–59°F), common in encampments, wet boots, and unhoused individuals. Chronic neurovascular vasospasm causes wrinkled, white/gray, cold, numb, macerated skin followed by severe hyperemic throbbing pain, paresthesias, edema, and ulceration.',
    hallmarksEs: 'Aparece tras exponer los pies a humedad y frío sin congelación (0°C-15°C) durante más de 12 horas (calzado mojado en campamentos o personas sin hogar). Piel blanca arrugada y entumecida, seguida de dolor pulsátil ardiente, hinchazón y maceración.',
    actionEn: 'PROTOCOL: 1) Clean, carefully dry, and aerate feet; 2) Change into fresh, clean, dry wool/synthetic socks twice daily; 3) Keep feet strictly dry and elevated above heart level; 4) Apply topical mupirocin or petroleum jelly to prevent secondary bacterial cellulitis; 5) Avoid walking on numb, macerated feet.',
    actionEs: 'PROTOCOLO: 1) Lavar, secar suavemente y airear los pies; 2) Cambiar a calcetines secos limpios dos veces al día; 3) Mantener los pies secos y elevados; 4) Tratar con pomadas antisépticas para evitar celulitis bacteriana; 5) Evitar caminar sobre pies macerados.',
  }),

  heatStroke: Object.freeze({
    id: 'heat_stroke',
    titleEn: 'Exertional & Stimulant Heat Stroke (CRITICAL MEDICAL EMERGENCY)',
    titleEs: 'Golpe de Calor por Esfuerzo y Estimulantes (EMERGENCIA MÉDICA CRÍTICA)',
    severity: 'emergency_911',
    hallmarksEn: 'CLASSIC TRIAD: Core body temperature > 40°C (104°F) + Central Nervous System Dysfunction (confusion, delirium, combativeness, ataxia, seizures, or coma) + Hot flushed skin (anhidrosis or profuse sweating). Exacerbated by methamphetamine, cocaine, MDMA, or antipsychotic muscarinic blockade.',
    hallmarksEs: 'TRÍADA CLÁSICA: Temperatura central > 40°C (104°F) + Disfunción del Sistema Nervioso Central (delirio, confusión, agitación, convulsiones o coma) + Piel caliente (con o sin sudor). Agravado por metanfetamina, cocaína o antipsicóticos.',
    actionEn: 'TIME IS BRAIN: CALL 911 IMMEDIATELY. Rapid aggressive cooling is mandatory: 1) Cold/ice water immersion or continuous cold water misting with high-speed fans; 2) Target core temp < 39°C (102°F) within 30 minutes; 3) NEVER GIVE ACETAMINOPHEN OR ASPIRIN (ineffective for environmental heat stroke; worsens fulminant hepatic failure and coagulopathy!).',
    actionEs: 'EL TIEMPO ES CEREBRO: LLAME AL 911 DE INMEDIATO. Enfriamiento agresivo urgente: 1) Inmersión en agua helada o pulverización de agua fría con ventiladores potentes; 2) Bajar la temperatura a < 39°C en 30 minutos; 3) NUNCA DAR PARACETAMOL NI ASPIRINA (ineficaces en golpe de calor; agravan el fallo hepático).',
  }),

  rhabdomyolysis: Object.freeze({
    id: 'rhabdomyolysis',
    titleEn: 'Rhabdomyolysis & Myoglobinuric Acute Kidney Injury',
    titleEs: 'Rabdomiólisis y Fallo Renal Agudo por Mioglobinuria',
    severity: 'emergency_hospital',
    hallmarksEn: 'Hyperthermia, prolonged pressure immobilization (sedative coma on concrete), or stimulant muscle hyperactivity causes skeletal muscle necrosis. Myoglobin enters circulation, presenting as muscle weakness, swelling, and characteristic DARK "TEA-COLORED" OR "COLA-COLORED" URINE.',
    hallmarksEs: 'El calor extremo, la compresión muscular por coma o la agitación por estimulantes rompen las fibras musculares. La mioglobina liberada tiñe la orina de un característico COLOR TÉ OSCURO O COCA-COLA y bloquea los túbulos renales.',
    actionEn: 'EMERGENCY ROOM TRANSPORT: Stat serum Creatine Kinase (CK > 5,000–10,000 IU/L diagnostic), serum potassium (fatal hyperkalemia risk), and creatinine. Aggressive IV isotonic crystalloid resuscitation (200–300 mL/hr) targeting urine output > 200 mL/hr; urinary alkalinization with sodium bicarbonate.',
    actionEs: 'TRASLADO A URGENCIAS: Medir Creatina Quinasa (CK), potasio sérico (riesgo de parada por hiperpotasemia) y creatinina. Sueroterapia intravenosa intensiva para forzar diuresis > 200 mL/h y bicarbonato para alcalinizar la orina.',
  }),
});

// ============================================================================
// HARM REDUCTION STANDARDS & FIELD PROTOCOLS
// ============================================================================

export const ENVIRONMENTAL_HARM_REDUCTION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'Gentle Handling Mandate in Moderate & Severe Hypothermia',
    titleEs: 'Manejo Suave Obligatorio en Hipotermia Moderada y Grave',
    detailEn: 'The hypothermic myocardium is exquisitely irritable. Rough movement, aggressive repositioning, or sudden jostling can trigger instantaneous refractory Ventricular Fibrillation or cardiac arrest. Always handle patients with extreme gentleness and keep them horizontal.',
    detailEs: 'El corazón frío es sumamente irritable. Movimientos bruscos, incorporaciones rápidas o sacudidas pueden disparar una fibrilación ventricular mortal instantánea. Maneje a la persona con extrema suavidad y en posición horizontal.',
  },
  {
    ruleNum: 2,
    titleEn: '"No One is Dead Until Warm and Dead": Prolonged Resuscitation Rule',
    titleEs: '«Nadie está Muerto hasta estar Caliente y Muerto»: Regla de RCP',
    detailEn: 'Hypothermia dramatically reduces cerebral oxygen consumption. A cold, stiff, pulseless person with fixed dilated pupils may appear completely dead, but intact neurological survival is documented after hours of CPR once rewarmed above 32°C (90°F) in an ECMO center.',
    detailEs: 'El frío protege el cerebro reduciendo el consumo de oxígeno. Una persona helada, rígida y sin pulso aparente puede sobrevivir neurológicamente íntegra tras horas de RCP una vez recalentada por encima de 32°C en un centro con ECMO.',
  },
  {
    ruleNum: 3,
    titleEn: 'Frostbite: Never Rub Tissue and Never Rewarm if Refreezing is Possible',
    titleEs: 'Congelación: Jamás Frotar y Nunca Recalentar si hay Riesgo de Recongelar',
    detailEn: 'Rubbing frostbitten skin forces microscopic ice crystals to slice through cell membranes. Furthermore, rewarming frozen feet and walking on them before they refreeze causes catastrophic 100% full-thickness necrosis. Only rewarm in warm water (37–39°C) in a stable shelter.',
    detailEs: 'Frotar la piel congelada hace que los cristales de hielo corten las células. Además, recalentar los pies y volver a caminar con frío provoca congelación recurrente y pérdida total del miembro. Recaliente solo en agua templada si ya está a salvo.',
  },
  {
    ruleNum: 4,
    titleEn: 'Heat Stroke: Rapid Ice-Water Cooling and Strict Antipyretic Prohibition',
    titleEs: 'Golpe de Calor: Enfriamiento con Agua Helada y Prohibición de Antipiréticos',
    detailEn: 'Heat stroke is a medical emergency requiring immediate whole-body cooling with cold water immersion or misting fans to bring core temperature below 39°C (102°F) within 30 minutes. NEVER give acetaminophen or aspirin: they fail to reduce environmental heat and poison the liver.',
    detailEs: 'El golpe de calor requiere enfriamiento inmediato con agua helada o pulverización con ventiladores para bajar de 39°C en 30 minutos. NUNCA dé paracetamol ni aspirina: no bajan la temperatura en este caso y provocan fallo hepático fulminante.',
  },
  {
    ruleNum: 5,
    titleEn: 'Trench Foot Prevention: The 12-Hour Dry Sock Rule',
    titleEs: 'Prevención de Pie de Trinchera: Regla de los Calcetines Secos de 12 Horas',
    detailEn: 'Non-freezing cold injury develops when feet stay wet for over 12 hours. Always carry a dry spare pair of wool or synthetic socks in a waterproof plastic bag. Clean, dry, and air out feet whenever resting to preserve microvascular blood supply.',
    detailEs: 'El pie de trinchera aparece si los pies permanecen húmedos más de 12 horas. Lleve siempre calcetines secos en una bolsa hermética. Seque y airee los pies al descansar para evitar la maceración y daño neurológico permanente.',
  },
  {
    ruleNum: 6,
    titleEn: 'Alcohol & Sedatives in Cold: The False Warmth & Gluconeogenesis Trap',
    titleEs: 'Alcohol y Sedantes con Frío: La Falsa Sensación de Calor y Bloqueo Hepático',
    detailEn: 'Alcohol induces peripheral cutaneous vasodilation that creates a deceptive subjective flush of warmth while catastrophic heat loss drains the core. Furthermore, alcohol blocks hepatic gluconeogenesis, plunging core-chilled individuals into life-threatening hypoglycemia. Never rely on alcohol for warmth in freezing temperatures.',
    detailEs: 'El alcohol vasodilata los vasos cutáneos dando una falsa sensación de calor mientras la temperatura central se desploma rápidamente. Además, bloquea la producción hepática de glucosa causando hipoglucemia mortal. Nunca use alcohol para «entrar en calor».',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE PRIVACY)
// ============================================================================

const initialWeatherState = () => ({
  activeTab: 'triage', // 'triage' | 'hypothermia' | 'frostbite' | 'heatStroke' | 'harmReduction'
  viewMode: 'community', // 'community' | 'clinical'
  hasConfusionOrLossOfShivering: false,
  hasOsbornOrPulselessColdBody: false,
  hasHemorrhagicFrostbiteBlisters: false,
  hasMaceratedTrenchFoot: false,
  hasCoreTempOver104Delirium: false,
  hasTeaColoredUrineMusclePain: false,
  coIngestedAlcoholOrSedativesInCold: false,
});

let currentWeatherState = initialWeatherState();
const stateSubscribers = new Set();

export function getWeatherState() {
  return { ...currentWeatherState };
}

export function setWeatherState(patch) {
  currentWeatherState = { ...currentWeatherState, ...patch };
  for (const fn of stateSubscribers) {
    try {
      fn(currentWeatherState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function resetWeatherState() {
  currentWeatherState = initialWeatherState();
  for (const fn of stateSubscribers) {
    try {
      fn(currentWeatherState);
    } catch {
      // ignore subscriber exceptions
    }
  }
}

export function subscribeWeatherState(fn) {
  stateSubscribers.add(fn);
  return () => stateSubscribers.delete(fn);
}

// ============================================================================
// CLINICAL EVALUATION ENGINE
// ============================================================================

export function evaluateWeatherRisk(state) {
  const {
    hasConfusionOrLossOfShivering,
    hasOsbornOrPulselessColdBody,
    hasHemorrhagicFrostbiteBlisters,
    hasMaceratedTrenchFoot,
    hasCoreTempOver104Delirium,
    hasTeaColoredUrineMusclePain,
    coIngestedAlcoholOrSedativesInCold,
  } = state;

  // 1. Critical Apparent Death / Severe Hypothermia (Stage III-IV)
  if (hasOsbornOrPulselessColdBody) {
    return {
      tier: 'emergency_hypothermia_cardiac',
      titleEn: 'CRITICAL HYPOTHERMIA EMERGENCY: Stage III–IV Hypothermia / Apparent Death',
      titleEs: 'EMERGENCIA CRÍTICA DE HIPOTERMIA: Hipotermia Estadio III–IV / Parada Cardíaca',
      isEmergency: true,
      actionEn: 'CALL 911 IMMEDIATELY. GENTLE HANDLING MANDATE: Keep patient strictly horizontal; rough movement triggers fatal Ventricular Fibrillation. RESUSCITATION RULE: "No one is dead until warm and dead!" Perform continuous CPR during transport to an ECMO rewarming center. Do not cease resuscitation until core temperature is rewarmed above 32°C (90°F).',
      actionEs: 'LLAME AL 911 DE INMEDIATO. MANEJO SUAVE: Mantenga a la persona horizontal; cualquier sacudida desencadena fibrilación ventricular mortal. REGLA: «¡Nadie está muerto hasta estar caliente y muerto!». Realice RCP continua hasta llegar a centro con ECMO.',
      interventionEn: 'Continuous high-quality CPR, transport to Extracorporeal Life Support (ECLS/ECMO) center, gentle airway management, active internal rewarming (42°C IV fluids).',
      interventionEs: 'RCP continua, traslado a centro con ECMO, intubación suave y recalentamiento interno con sueros a 42°C.',
    };
  }

  // 2. Critical Heat Stroke (Hyperthermia > 104°F & Delirium)
  if (hasCoreTempOver104Delirium) {
    return {
      tier: 'emergency_heat_stroke',
      titleEn: 'CRITICAL HYPERTHERMIA EMERGENCY: Suspected Heat Stroke (Core Temp > 40°C / 104°F)',
      titleEs: 'EMERGENCIA CRÍTICA DE HIPERTERMIA: Sospecha de Golpe de Calor (> 40°C y Delirio)',
      isEmergency: true,
      actionEn: 'CALL 911 IMMEDIATELY. TIME IS BRAIN. Rapid aggressive cooling is mandatory: immerse in ice water or spray cold water with high-velocity fans to bring temperature below 39°C (102°F) within 30 minutes. NEVER GIVE ACETAMINOPHEN OR ASPIRIN (ineffective and causes acute liver failure). Lie patient flat in shade.',
      actionEs: 'LLAME AL 911 DE INMEDIATO. Enfriamiento agresivo inmediato: inmersión en agua con hielo o pulverización continua con ventiladores. Objetivo: bajar de 39°C en 30 minutos. NUNCA DAR PARACETAMOL NI ASPIRINA (provocan fallo hepático mortal).',
      interventionEn: 'Whole-body ice-water immersion, aggressive airway protection, IV crystalloids (room temperature, not chilled if shivering occurs), stat CK, renal panel, and liver enzymes.',
      interventionEs: 'Inmersión en agua helada, protección de vía aérea, sueroterapia y control urgente de CK, función renal y hepática.',
    };
  }

  // 3. Rhabdomyolysis & Cola Urine
  if (hasTeaColoredUrineMusclePain) {
    return {
      tier: 'emergency_rhabdomyolysis',
      titleEn: 'CRITICAL METABOLIC ALERT: Suspected Rhabdomyolysis & Renal Damage (Cola-Colored Urine)',
      titleEs: 'ALERTA METABÓLICA CRÍTICA: Sospecha de Rabdomiólisis y Daño Renal (Orina Color Cola)',
      isEmergency: true,
      actionEn: 'EMERGENCY ROOM TRANSPORT REQUIRED. Dark tea-colored or cola-colored urine combined with extreme muscle soreness or hyperthermia indicates skeletal muscle necrosis and myoglobinuria. Left untreated, myoglobin precipitates in renal tubules, causing acute kidney injury and fatal hyperkalemia. Immediate high-volume IV hydration is mandatory.',
      actionEs: 'TRASLADO URGENTE A URGENCIAS. La orina color té oscuro o coca-cola y el dolor muscular alertan de rotura masiva de fibras musculares (rabdomiólisis). Provoca fallo renal agudo y parada por potasio alto. Requiere sueros IV masivos.',
      interventionEn: 'Stat serum Creatine Kinase (CK), serum electrolytes (potassium), creatinine, aggressive IV isotonic saline (200–300 mL/hr) targeting urine output > 200 mL/hr, urine alkalinization.',
      interventionEs: 'Analítica de CK, potasio urgente, creatinina y sueroterapia intensiva para forzar diuresis > 200 mL/h.',
    };
  }

  // 4. Severe / Hemorrhagic Frostbite
  if (hasHemorrhagicFrostbiteBlisters) {
    return {
      tier: 'emergency_frostbite_deep',
      titleEn: 'SEVERE COLD INJURY ALERT: Deep Frostbite with Hemorrhagic Blisters (Stage 3–4)',
      titleEs: 'ALERTA DE LESIÓN POR FRÍO GRAVE: Congelación Profunda con Ampollas Hemorrágicas (Estadios 3-4)',
      isEmergency: true,
      actionEn: 'EMERGENCY HOSPITAL EVALUATION REQUIRED. Dark purple, black, or blood-filled blisters indicate deep dermal freezing and microvascular thrombosis with extreme amputation risk. PROTOCOL: 1) NEVER rub the tissue; 2) DO NOT rewarm if refreezing is possible; 3) Rewarm in 37°C–39°C warm water bath; 4) Administer Ibuprofen 12 mg/kg/day; 5) Emergency hospital evaluation for IV iloprost or tPA.',
      actionEs: 'VALORACIÓN HOSPITALARIA URGENTE. Las ampollas de sangre oscura indican congelación profunda y alto riesgo de amputación. NUNCA frote la zona. No recaliente si hay riesgo de recongelación. Baño de agua a 37°C-39°C, ibuprofeno y hospital para iloprost/tPA.',
      interventionEn: 'Rapid warm water bath rewarming, bulky dry sterile dressings, high-dose ibuprofen, evaluation for IV prostacyclin (iloprost) or catheter-directed tPA within 24 hours of thawing.',
      interventionEs: 'Baño de agua templada, vendajes estériles almohadillados, ibuprofeno y valoración de iloprost o tPA antes de 24 h.',
    };
  }

  // 5. Moderate Hypothermia (Loss of Shivering & Confusion)
  if (hasConfusionOrLossOfShivering) {
    return {
      tier: 'urgent_hypothermia_moderate',
      titleEn: 'URGENT COLD ALERT: Moderate Hypothermia (Stage II - Loss of Shivering & Confusion)',
      titleEs: 'ALERTA DE FRÍO URGENTE: Hipotermia Moderada (Estadio II - Cese de Escalofríos y Confusión)',
      isEmergency: true,
      actionEn: 'URGENT MEDICAL TRANSPORT REQUIRED. Shivering stopping while still cold is a CRITICAL WARNING that glycogen stores are exhausted and core temperature has dropped below 32°C (90°F). GENTLE HANDLING: Keep patient horizontal; do not let them walk. Remove wet clothing and apply chemical heat packs to groin, axillae, and chest. Call 911.',
      actionEs: 'TRASLADO MÉDICO URGENTE. El cese de escalofríos con frío persistente es una ALERTA CRÍTICA de agotamiento metabólico (temp. < 32°C). MANEJO SUAVE: mantener horizontal sin caminar. Retirar ropa mojada y poner calor en axilas e ingles.',
      interventionEn: 'Active external trunk rewarming, horizontal positioning, gentle extrication, warmed humidified oxygen, core temperature monitoring.',
      interventionEs: 'Recalentamiento activo del tronco, posición horizontal, traslado suave y oxígeno caliente humidificado.',
    };
  }

  // 6. Trench Foot / Immersion Foot
  if (hasMaceratedTrenchFoot) {
    return {
      tier: 'urgent_trench_foot',
      titleEn: 'NON-FREEZING COLD INJURY ALERT: Trench Foot / Immersion Foot',
      titleEs: 'ALERTA DE FRÍO NO CONGELANTE: Pie de Trinchera / Pie de Inmersión',
      isEmergency: false,
      actionEn: 'TREAT AND DRY FEET IMMEDIATELY. Prolonged wet footwear causes neurovascular vasospasm, maceration, and severe throbbing pain. Protocol: 1) Remove wet shoes/socks; 2) Gently wash, air-dry, and elevate feet above heart level; 3) Change into clean, dry wool/synthetic socks; 4) Do not walk on numb feet; 5) Seek medical care if blisters, red streaking, or foul odor develop.',
      actionEs: 'TRATE Y SEQUE LOS PIES DE INMEDIATO. El calzado mojado prolongado causa daño neurovascular y maceración. Protocolo: 1) Quitar calcetines mojados; 2) Lavar suavemente, secar al aire y elevar los pies; 3) Poner calcetines secos; 4) No caminar con pies entumecidos.',
      interventionEn: 'Air drying, elevation, clean dry sock exchange, warm dry shelter referral, topical antibacterial barrier, avoidance of weight-bearing on macerated tissue.',
      interventionEs: 'Secado al aire, elevación, calcetines secos limpios, refugio seco y pomada antiséptica.',
    };
  }

  // 7. Alcohol/Sedatives in Cold Weather (High Risk Warning)
  if (coIngestedAlcoholOrSedativesInCold) {
    return {
      tier: 'high_hazard_cold_intoxication',
      titleEn: 'HIGH HAZARD ENVIRONMENT: Intoxication & Cold Weather Exposure Risk',
      titleEs: 'ENTORNO DE ALTO PELIGRO: Intoxicación y Exposición a Frío Extremo',
      isEmergency: false,
      actionEn: 'SEEK WARM SHELTER IMMEDIATELY. Alcohol and sedatives trick the body into feeling warm by dilating surface blood vessels while rapidly dropping your internal core temperature. Shivering is suppressed, and falling asleep outdoors on concrete leads to fatal hypothermia within hours. Transition to an emergency warming shelter or warm building immediately.',
      actionEs: 'BUSQUE REFUGIO CÁLIDO DE INMEDIATO. El alcohol y los sedantes engañan al cerebro dando falsa sensación de calor mientras bajan la temperatura interna. Quedarse dormido en la calle con frío conduce a la muerte en pocas horas. Acuda a un albergue de calor.',
      interventionEn: 'Emergency warming center navigation, peer accompaniment, provision of thermal blankets, hot sweet beverages, harm reduction outreach engagement.',
      interventionEs: 'Derivación a centro de acogida o albergue con calefacción, mantas térmicas y bebidas calientes.',
    };
  }

  // 8. Standard Thermal Harm Reduction Guidance
  return {
    tier: 'standard_thermal_guidance',
    titleEn: 'Standard Weather, Thermal Protection & Harm Reduction Guidance',
    titleEs: 'Pautas Estándar de Protección Térmica y Reducción de Daños Climáticos',
    isEmergency: false,
    actionEn: 'No acute emergency flags detected. Harm reduction standards: In cold weather, wear moisture-wicking layers, always carry dry spare socks, and avoid alcohol/opioids which accelerate heat loss. In hot weather or when using stimulants, drink 500 mL water with electrolytes hourly, rest in the shade, and never take acetaminophen for heat exhaustion.',
    actionEs: 'No se detectan banderas rojas críticas. Pautas de reducción de daños: en frío, use ropa por capas, lleve calcetines secos de repuesto y evite el alcohol. En calor o con estimulantes, beba agua con electrolitos cada hora, descanse a la sombra y no tome paracetamol si hay golpe de calor.',
    interventionEn: 'Harm reduction education, seasonal supply distribution (thermal blankets, hand warmers, electrolyte packets, dry socks), non-judgmental community support.',
    interventionEs: 'Educación en reducción de daños, distribución de insumos (mantas térmicas, calentadores, electrolitos, calcetines secos) y apoyo comunitario.',
  };
}

// ============================================================================
// ZERO-PII SBAR HANDOFF NOTE GENERATOR
// ============================================================================

export function buildWeatherSbarText(state, evaluation, lang = 'en') {
  const isEs = lang === 'es';
  const now = new Date().toISOString();

  if (isEs) {
    return [
      '====================================================================',
      'INFORME CLÍNICO SBAR: EVALUACIÓN DE EMERGENCIAS TÉRMICAS Y CLIMÁTICAS',
      'Plataforma Clínica HarborPath - Estándar Estricto Cero PII',
      `Fecha y Hora: ${now}`,
      '====================================================================',
      '',
      'S (SITUACIÓN):',
      'Evaluación clínica por exposición a temperaturas extremas (frío/calor).',
      `Diagnóstico de riesgo evaluado: ${evaluation.titleEs}.`,
      `Urgencia médica: ${evaluation.isEmergency ? 'EMERGENCIA MÉDICA CRÍTICA / VITAL' : 'REDUCCIÓN DE DAÑOS Y PREVENCIÓN'}.`,
      '',
      'B (ANTECEDENTES / FACTORES AMBIENTALES Y TÓXICOS):',
      `- Parada cardíaca / cuerpo helado / ondas de Osborn (Hipotermia III-IV): ${state.hasOsbornOrPulselessColdBody ? 'SÍ (REGLA: NO ESTÁ MUERTO HASTA ESTAR CALIENTE Y MUERTO)' : 'No'}.`,
      `- Temperatura > 40°C y delirio/convulsiones (Golpe de calor crítico): ${state.hasCoreTempOver104Delirium ? 'SÍ (ENFRIAMIENTO INMEDIATO - NO PARACETAMOL)' : 'No'}.`,
      `- Orina color cola / dolor muscular intenso (Sospecha rabdomiólisis): ${state.hasTeaColoredUrineMusclePain ? 'SÍ (FORZAR DIURESIS CON SUERO IV)' : 'No'}.`,
      `- Ampollas hemorrágicas oscuras por frío (Congelación profunda): ${state.hasHemorrhagicFrostbiteBlisters ? 'SÍ (RIESGO DE AMPUTACIÓN - RECALENTAR EN AGUA TEMPLADA)' : 'No'}.`,
      `- Confusión y cese de escalofríos con frío (Hipotermia estadio II): ${state.hasConfusionOrLossOfShivering ? 'SÍ (MANEJO SUAVE HORIZONTAL)' : 'No'}.`,
      `- Pies blancos macerados tras humedad > 12h (Pie de trinchera): ${state.hasMaceratedTrenchFoot ? 'SÍ (SECAR, AIREAR Y ELEVAR PIES)' : 'No'}.`,
      `- Consumo de alcohol o sedantes a la intemperie con frío: ${state.coIngestedAlcoholOrSedativesInCold ? 'SÍ (FALSA SENSACIÓN DE CALOR Y PÉRDIDA RÁPIDA)' : 'No'}.`,
      '',
      'A (EVALUACIÓN CLÍNICA):',
      `- Análisis: ${evaluation.actionEs}`,
      `- Intervención propuesta: ${evaluation.interventionEs}`,
      '',
      'R (RECOMENDACIONES Y MANEJO EN EL TERRENO):',
      '1. En hipotermia moderada/grave: Mantener al paciente estrictamente horizontal; movimientos bruscos disparan FV mortal.',
      '2. En parada por frío: Continuar RCP prolongada hasta recalentar por encima de 32°C en centro con ECMO.',
      '3. En golpe de calor: Enfriar activamente con agua helada hasta < 39°C en < 30 min; NUNCA administrar paracetamol.',
      '4. En congelación: Jamás frotar con nieve ni recalentar si hay riesgo de que vuelva a congelarse.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '====================================================================',
    'ENVIRONMENTAL THERMAL EXTREMES & WEATHER CLINICAL SBAR HANDOFF NOTE',
    'HarborPath Clinical CDS Platform - Strict Zero-PII Standard',
    `Timestamp: ${now}`,
    '====================================================================',
    '',
    'S (SITUATION):',
    'Clinical evaluation for environmental temperature extreme exposure (hypothermia/hyperthermia).',
    `Assessed Presentation: ${evaluation.titleEn}.`,
    `Safety Urgency: ${evaluation.isEmergency ? 'LIFE-THREATENING MEDICAL EMERGENCY' : 'HARM REDUCTION & THERMAL PROTECTION'}.`,
    '',
    'B (BACKGROUND / ENVIRONMENTAL & SUBSTANCE RISK FACTORS):',
    `- Pulseless ice-cold body / Osborn waves (Stage III-IV Hypothermia): ${state.hasOsbornOrPulselessColdBody ? 'YES (RULE: NO ONE IS DEAD UNTIL WARM AND DEAD)' : 'No'}.`,
    `- Core temp > 104°F (40°C) with delirium/coma (Critical Heat Stroke): ${state.hasCoreTempOver104Delirium ? 'YES (IMMEDIATE AGGRESSIVE COOLING - NO ACETAMINOPHEN)' : 'No'}.`,
    `- Cola-colored urine / severe muscle pain (Suspected Rhabdomyolysis): ${state.hasTeaColoredUrineMusclePain ? 'YES (HIGH-VOLUME IV SALINE RESUSCITATION)' : 'No'}.`,
    `- Dark hemorrhagic blisters on digits (Deep Frostbite Stage 3-4): ${state.hasHemorrhagicFrostbiteBlisters ? 'YES (AMPUTATION THREAT - RAPID WATER BATH REWARMING)' : 'No'}.`,
    `- Confusion & cessation of shivering in cold (Moderate Hypothermia Stage II): ${state.hasConfusionOrLossOfShivering ? 'YES (GENTLE HORIZONTAL HANDLING MANDATE)' : 'No'}.`,
    `- Macerated, wrinkled feet wet for > 12 hours (Trench Foot): ${state.hasMaceratedTrenchFoot ? 'YES (CLEAN, DRY & ELEVATE FEET)' : 'No'}.`,
    `- Alcohol or sedative use outdoors in cold weather: ${state.coIngestedAlcoholOrSedativesInCold ? 'YES (VASODILATION & RAPID CORE HEAT LOSS)' : 'No'}.`,
    '',
    'A (CLINICAL ASSESSMENT):',
    `- Assessment: ${evaluation.actionEn}`,
    `- Proposed Clinical Intervention: ${evaluation.interventionEn}`,
    '',
    'R (RECOMMENDATIONS & ENVIRONMENTAL MANAGEMENT):',
    '1. In moderate/severe hypothermia: Keep patient horizontal; rough movement triggers fatal Ventricular Fibrillation.',
    '2. In hypothermic cardiac arrest: Maintain continuous CPR during transport to ECMO center; do not pronounce until warm.',
    '3. In heat stroke: Cool aggressively with ice-water immersion to < 39°C within 30 min; NEVER give acetaminophen/aspirin.',
    '4. In frostbite: Never rub tissue and never rewarm if there is any chance of refreezing.',
    '====================================================================',
  ].join('\n');
}

// ============================================================================
// MAIN VIEW RENDERER (WCAG 2.2 AA COMPLIANT DOM TREE)
// ============================================================================

export function weatherCareView() {
  const container = h('div', { class: 'weather-care-view' });

  function render() {
    clear(container);
    const state = getWeatherState();
    const evaluation = evaluateWeatherRisk(state);

    // Header Banner
    const header = h('header', { class: 'wc-header' }, [
      h('div', { class: 'wc-header-badge' }, [
        icon('activity'),
        h('span', {}, t('wc.header.badge', 'Environmental Harm Reduction & Extreme Weather Safety')),
      ]),
      h('h1', { class: 'wc-header-title' }, t('wc.header.title', 'Hypothermia, Frostbite & Heat Stroke Safety Navigator')),
      h('p', { class: 'wc-header-desc' }, t('wc.header.desc', 'Evidence-based clinical decision support and harm reduction standards from the Wilderness Medical Society (WMS) and ACEP: Swiss Hypothermia Staging, the "Warm and Dead" resuscitation rule, gentle handling to prevent V-Fib, frostbite and trench foot preservation, and emergency heat stroke cooling.')),
    ]);

    // Mode Switcher
    const modeSwitcher = h('div', { class: 'wc-mode-switcher', role: 'group', 'aria-label': 'Audience Mode Switcher' }, [
      h('button', {
        class: `wc-mode-btn ${state.viewMode === 'community' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'community' ? 'true' : 'false',
        onclick: () => setWeatherState({ viewMode: 'community' }),
      }, [
        icon('check'),
        h('span', {}, t('wc.mode.community', 'Community & Street Mode (Warmth, Hydration & Cold Safety)')),
      ]),
      h('button', {
        class: `wc-mode-btn ${state.viewMode === 'clinical' ? 'active' : ''}`,
        'aria-pressed': state.viewMode === 'clinical' ? 'true' : 'false',
        onclick: () => setWeatherState({ viewMode: 'clinical' }),
      }, [
        icon('alert'),
        h('span', {}, t('wc.mode.clinical', 'Clinician & Paramedic Mode (Swiss Staging, ECMO & SBAR)')),
      ]),
    ]);

    // Tabs Nav
    const tabsList = h('div', { class: 'wc-tabs-nav', role: 'tablist', 'aria-label': 'Weather Care Tabs' }, [
      h('button', {
        class: `wc-tab-btn ${state.activeTab === 'triage' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'triage' ? 'true' : 'false',
        onclick: () => setWeatherState({ activeTab: 'triage' }),
      }, t('wc.tabs.triage', 'Weather Emergency Triage')),
      h('button', {
        class: `wc-tab-btn ${state.activeTab === 'hypothermia' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'hypothermia' ? 'true' : 'false',
        onclick: () => setWeatherState({ activeTab: 'hypothermia' }),
      }, t('wc.tabs.hypothermia', 'Hypothermia Staging (Swiss I–IV)')),
      h('button', {
        class: `wc-tab-btn ${state.activeTab === 'frostbite' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'frostbite' ? 'true' : 'false',
        onclick: () => setWeatherState({ activeTab: 'frostbite' }),
      }, t('wc.tabs.frostbite', 'Frostbite & Trench Foot Care')),
      h('button', {
        class: `wc-tab-btn ${state.activeTab === 'heatStroke' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'heatStroke' ? 'true' : 'false',
        onclick: () => setWeatherState({ activeTab: 'heatStroke' }),
      }, t('wc.tabs.heatStroke', 'Heat Stroke & Stimulant Hyperthermia')),
      h('button', {
        class: `wc-tab-btn ${state.activeTab === 'harmReduction' ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': state.activeTab === 'harmReduction' ? 'true' : 'false',
        onclick: () => setWeatherState({ activeTab: 'harmReduction' }),
      }, t('wc.tabs.harmReduction', 'Seasonal Directives & Rules')),
    ]);

    let tabContent;
    switch (state.activeTab) {
      case 'hypothermia':
        tabContent = renderHypothermiaTab();
        break;
      case 'frostbite':
        tabContent = renderFrostbiteTab();
        break;
      case 'heatStroke':
        tabContent = renderHeatStrokeTab();
        break;
      case 'harmReduction':
        tabContent = renderHarmReductionTab();
        break;
      case 'triage':
      default:
        tabContent = renderTriageTab(state, evaluation);
        break;
    }

    container.appendChild(header);
    container.appendChild(modeSwitcher);
    container.appendChild(tabsList);
    container.appendChild(tabContent);
  }

  // --- SUB-RENDERERS ---

  function renderTriageTab(state, evaluation) {
    const section = h('section', { class: 'wc-triage-section', role: 'tabpanel' });

    // Inputs Grid
    const inputsGrid = h('div', { class: 'wc-inputs-grid' }, [
      // 1. Stage III-IV Pulseless Ice-Cold Body
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasOsbornOrPulselessColdBody,
            onchange: (e) => setWeatherState({ hasOsbornOrPulselessColdBody: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('wc.check.osbornStrong', 'Unconscious, Pulseless, Stiff Ice-Cold Body or Osborn J-Waves? ')),
            t('wc.check.osbornDetail', '(Critical: Stage III–IV Hypothermia - "Warm and Dead" rule)'),
          ]),
        ]),
      ]),

      // 2. Heat Stroke > 104°F and Delirium
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasCoreTempOver104Delirium,
            onchange: (e) => setWeatherState({ hasCoreTempOver104Delirium: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('wc.check.heatStrong', 'Burning Hot (>104°F / 40°C) with Confusion, Delirium or Seizures? ')),
            t('wc.check.heatDetail', '(Critical emergency: Exertional / stimulant Heat Stroke)'),
          ]),
        ]),
      ]),

      // 3. Cola-Colored Urine / Rhabdomyolysis
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasTeaColoredUrineMusclePain,
            onchange: (e) => setWeatherState({ hasTeaColoredUrineMusclePain: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('wc.check.rhabdoStrong', 'Dark Tea- or Cola-Colored Urine with Extreme Muscle Soreness? ')),
            t('wc.check.rhabdoDetail', '(Suspected Rhabdomyolysis & myoglobinuric renal shutdown)'),
          ]),
        ]),
      ]),

      // 4. Hemorrhagic Deep Frostbite Blisters
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasHemorrhagicFrostbiteBlisters,
            onchange: (e) => setWeatherState({ hasHemorrhagicFrostbiteBlisters: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('wc.check.frostStrong', 'Dark Purple/Blood-Filled Blisters or Rock-Hard Frozen Digits? ')),
            t('wc.check.frostDetail', '(Deep Frostbite Stage 3–4: High amputation risk)'),
          ]),
        ]),
      ]),

      // 5. Stage II Hypothermia (Loss of Shivering & Confusion)
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasConfusionOrLossOfShivering,
            onchange: (e) => setWeatherState({ hasConfusionOrLossOfShivering: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('wc.check.shiverStrong', 'Shivering Has Completely Stopped Despite Severe Cold & Confusion? ')),
            t('wc.check.shiverDetail', '(Stage II Moderate Hypothermia: Glycogen exhaustion alert)'),
          ]),
        ]),
      ]),

      // 6. Trench Foot / Immersion Foot
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.hasMaceratedTrenchFoot,
            onchange: (e) => setWeatherState({ hasMaceratedTrenchFoot: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('wc.check.trenchStrong', 'Feet Cold, Numb, White & Wrinkled from Wet Socks > 12 Hours? ')),
            t('wc.check.trenchDetail', '(Non-Freezing Cold Injury / Trench Foot)'),
          ]),
        ]),
      ]),

      // 7. Alcohol or Sedatives in Cold
      h('div', { class: 'input-card checkbox-card' }, [
        h('label', { class: 'checkbox-label' }, [
          h('input', {
            type: 'checkbox',
            checked: state.coIngestedAlcoholOrSedativesInCold,
            onchange: (e) => setWeatherState({ coIngestedAlcoholOrSedativesInCold: e.target.checked }),
          }),
          h('span', {}, [
            h('strong', {}, t('wc.check.etohStrong', 'Alcohol, Opioids, or Sedatives Used Outdoors in Cold Weather? ')),
            t('wc.check.etohDetail', '(Vasodilation & shivering inhibition accelerate hypothermia)'),
          ]),
        ]),
      ]),
    ]);

    // Results Box
    const resultBox = h('div', { class: `wc-result-card ${evaluation.isEmergency ? 'emergency' : 'standard'}` }, [
      h('div', { class: 'wc-result-header' }, [
        icon(evaluation.isEmergency ? 'alert' : 'check'),
        h('h3', {}, evaluation.titleEn),
      ]),
      h('div', { class: 'wc-result-details' }, [
        h('div', { class: 'wc-rec-item' }, [
          h('strong', {}, t('wc.res.action', 'Clinical & First Responder Action: ')),
          h('p', {}, evaluation.actionEn),
        ]),
        h('div', { class: 'wc-rec-item' }, [
          h('strong', {}, t('wc.res.intervention', 'Recommended Medical Intervention: ')),
          h('p', {}, evaluation.interventionEn),
        ]),
      ]),
    ]);

    // SBAR Export Card
    const sbarCard = h('div', { class: 'wc-sbar-card' }, [
      h('div', { class: 'sbar-header' }, [
        h('h3', {}, t('wc.sbar.title', 'Zero-PII Environmental & Weather Clinical SBAR Note Generator')),
        h('div', { class: 'sbar-actions' }, [
          h('button', {
            class: 'btn btn-secondary',
            onclick: () => {
              const text = buildWeatherSbarText(state, evaluation, 'en');
              navigator.clipboard?.writeText(text);
            },
          }, [icon('copy'), h('span', {}, t('wc.sbar.copyEn', 'Copy Clinical SBAR (English)'))]),
          h('button', {
            class: 'btn btn-secondary',
            onclick: () => {
              const text = buildWeatherSbarText(state, evaluation, 'es');
              navigator.clipboard?.writeText(text);
            },
          }, [icon('copy'), h('span', {}, t('wc.sbar.copyEs', 'Copiar SBAR (Español)'))]),
        ]),
      ]),
      h('pre', { class: 'sbar-pre', 'aria-label': 'SBAR Preview' }, buildWeatherSbarText(state, evaluation, 'en')),
    ]);

    section.appendChild(inputsGrid);
    section.appendChild(resultBox);
    section.appendChild(sbarCard);
    return section;
  }

  function renderHypothermiaTab() {
    const section = h('section', { class: 'wc-hypothermia-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'wc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('wc.hypo.heading', 'Swiss Clinical Staging of Accidental Hypothermia (Stages I–IV)')),
      h('p', { class: 'tab-subtitle' }, t('wc.hypo.subtitle', 'Standardized out-of-hospital triage based on shivering, level of consciousness, and vital signs when core temperature measurement is unavailable.')),
    ]);

    const stagesGrid = h('div', { class: 'wc-stages-grid' }, HYPOTHERMIA_SWISS_STAGES.map((stg) => h('div', { class: `wc-stage-card ${stg.severity}` }, [
      h('div', { class: `stage-badge ${stg.severity}` }, `Swiss Stage ${stg.stageNum}`),
      h('h3', { class: 'stage-title' }, stg.titleEn),
      h('p', { class: 'stage-mental' }, [h('strong', {}, 'Mental Status: '), stg.mentalStatusEn]),
      h('div', { class: 'stage-section' }, [
        h('strong', {}, 'Clinical Signs & Symptoms:'),
        h('ul', {}, stg.symptomsEn.map((sym) => h('li', {}, sym))),
      ]),
      h('div', { class: 'stage-section management-box' }, [
        h('strong', {}, 'Rewarming & Handling Protocol:'),
        h('p', {}, stg.managementEn),
      ]),
    ])));

    section.appendChild(introCard);
    section.appendChild(stagesGrid);
    return section;
  }

  function renderFrostbiteTab() {
    const section = h('section', { class: 'wc-frostbite-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'wc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('wc.frost.heading', 'Frostbite Staging, Trench Foot & Tissue Salvage Protocols')),
      h('p', { class: 'tab-subtitle' }, t('wc.frost.subtitle', 'Critical differentiation between freezing tissue injury (frostbite) and non-freezing cold injury (trench foot), rapid water bath rewarming, and thromboxane inhibition.')),
    ]);

    const diffsGrid = h('div', { class: 'wc-diffs-grid' }, [
      ENVIRONMENTAL_CLINICAL_DIFFERENTIALS.frostbite,
      ENVIRONMENTAL_CLINICAL_DIFFERENTIALS.trenchFoot,
    ].map((diff) => h('div', { class: `wc-diff-card ${diff.severity}` }, [
      h('div', { class: `diff-badge ${diff.severity}` }, diff.severity.toUpperCase().replace('_', ' ')),
      h('h3', { class: 'diff-title' }, diff.titleEn),
      h('div', { class: 'diff-field' }, [
        h('strong', {}, 'Pathological Hallmarks & Staging: '),
        h('p', {}, diff.hallmarksEn),
      ]),
      h('div', { class: 'diff-field action-field' }, [
        h('strong', {}, 'Clinical Protocol & Management: '),
        h('p', {}, diff.actionEn),
      ]),
    ])));

    section.appendChild(introCard);
    section.appendChild(diffsGrid);
    return section;
  }

  function renderHeatStrokeTab() {
    const section = h('section', { class: 'wc-heat-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'wc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('wc.heat.heading', 'Exertional & Stimulant Heat Stroke vs. Rhabdomyolysis')),
      h('p', { class: 'tab-subtitle' }, t('wc.heat.subtitle', 'Management of life-threatening core hyperthermia, rapid ice-water immersion cooling, stimulant thermogenesis, and acute renal protection.')),
    ]);

    const diffsGrid = h('div', { class: 'wc-diffs-grid' }, [
      ENVIRONMENTAL_CLINICAL_DIFFERENTIALS.heatStroke,
      ENVIRONMENTAL_CLINICAL_DIFFERENTIALS.rhabdomyolysis,
    ].map((diff) => h('div', { class: `wc-diff-card ${diff.severity}` }, [
      h('div', { class: `diff-badge ${diff.severity}` }, diff.severity.toUpperCase().replace('_', ' ')),
      h('h3', { class: 'diff-title' }, diff.titleEn),
      h('div', { class: 'diff-field' }, [
        h('strong', {}, 'Pathological Hallmarks & Triad: '),
        h('p', {}, diff.hallmarksEn),
      ]),
      h('div', { class: 'diff-field action-field' }, [
        h('strong', {}, 'Emergency Action & Protocol: '),
        h('p', {}, diff.actionEn),
      ]),
    ])));

    section.appendChild(introCard);
    section.appendChild(diffsGrid);
    return section;
  }

  function renderHarmReductionTab() {
    const section = h('section', { class: 'wc-harm-tab', role: 'tabpanel' });

    const introCard = h('div', { class: 'wc-intro-card' }, [
      h('h2', { class: 'tab-heading' }, t('wc.hr.heading', 'Environmental Harm Reduction & Seasonal Life-Saving Directives')),
      h('p', { class: 'tab-subtitle' }, t('wc.hr.subtitle', 'Essential field directives to prevent sudden hypothermic cardiac arrest, frostbite tissue loss, and fatal heat stroke.')),
    ]);

    const rulesGrid = h('div', { class: 'wc-rules-grid' }, ENVIRONMENTAL_HARM_REDUCTION_RULES.map((rule) => h('div', { class: 'wc-rule-card' }, [
      h('div', { class: 'rule-badge' }, `Rule ${rule.ruleNum}`),
      h('h3', {}, rule.titleEn),
      h('p', {}, rule.detailEn),
    ])));

    section.appendChild(introCard);
    section.appendChild(rulesGrid);
    return section;
  }

  // Initial render
  const unsubscribe = subscribeWeatherState(() => render());
  render();

  return container;
}
