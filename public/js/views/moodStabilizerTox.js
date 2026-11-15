// public/js/views/moodStabilizerTox.js
// Wave 67 Clinical Engine B: Lithium, Valproate Hyperammonemia & Lamotrigine Mood-Stabilizer Toxicity Navigator
// ACMT, AACT, EXTRIP Workgroup, and FDA Clinical Consensus Standards.
// Ephemeral in-RAM state, zero persistent storage, zero PII, CSP default-src 'self', WCAG 2.1 AA compliant.

import { h, clear, icon, copyText, wireTablistKeyboard, syncTablists } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

const TOOL_I18N_KEYS = Object.freeze({
  title: 'tools.item.mood-stabilizer-tox.title',
  description: 'tools.item.mood-stabilizer-tox.description',
});

export const MOOD_STABILIZER_PROFILES = Object.freeze({
  lithium_chronic_acute_on_chronic: {
    id: 'lithium_chronic_acute_on_chronic',
    category: 'lithium',
    isChronic: true,
    name: 'Chronic & Acute-on-Chronic Lithium Toxicity',
    nameEs: 'Toxicidad Crónica y Aguda-sobre-Crónica por Litio',
    mechanism:
      'Slow intracellular and CNS efflux causes severe brain accumulation at lower serum levels (1.5-2.5+ mEq/L) than acute ingestion (> 3.5-4.0 mEq/L). Presents with cerebellar ataxia, coarse tremor, dysarthria, hyperreflexia, myoclonus, and coma. Frequently precipitated by Nephrogenic Diabetes Insipidus (NDI with hypernatremia and free-water depletion), AKI, NSAIDs, ACEi/ARBs, or thiazide diuretics.',
    mechanismEs:
      'La salida intracelular y del SNC lenta genera acumulación cerebral grave a niveles séricos más bajos (1.5-2.5+ mEq/L) que en ingesta aguda (> 3.5-4.0 mEq/L). Cursa con ataxia cerebelosa, temblor grueso, disartria, hiperreflexia, mioclonías y coma. Frecuentemente precipitada por Diabetes Insípida Nefrogénica (DIN con hipernatremia y deshidratación), LRA, AINEs, IECA/ARA-II o tiazidas.',
    firstLineAntidote:
      'Stop lithium & nephrotoxic precipitants (NSAIDs, ACEi/ARB, thiazides). Restore intravascular volume with 0.9% NaCl ONLY if euvolemic/dehydrated and renally able. Urgent Nephrology consult for EXTRIP Hemodialysis (CNS signs correlate poorly with serum drop; recheck rebound level 6-12h post-HD).',
    firstLineAntidoteEs:
      'Suspender litio y precipitantes nefrotóxicos (AINEs, IECA/ARA-II, tiazidas). Hidratación con NaCl 0.9% SOLO si hay deshidratación/euvolemia con diuresis conservada. Interconsulta urgente a Nefrología para Hemodiálisis EXTRIP (vigilar rebote 6-12h post-HD).',
    blackBoxContraindication:
      'NO LOOP/THIAZIDE DIURETICS, NO KAYEXALATE (SPS), MONITOR Na+ CLOSELY IN NDI',
    blackBoxContraindicationEs:
      'PROHIBIDOS DIURÉTICOS DE ASA/TIAZIDAS, NO KAYEXALATE (SPS), VIGILAR Na+ EN DIN',
    contraindicationDetail:
      'Loop and thiazide diuretics worsen volume contraction and trigger compensatory proximal tubular Na+/Li+ reabsorption, spiking toxicity. Kayexalate (SPS) causes colonic necrosis/hypernatremia and confounds management. In Nephrogenic Diabetes Insipidus (NDI), monitor serum Na+ q2-4h carefully so 0.9% NaCl does not worsen severe hypernatremia once euvolemic.',
    contraindicationDetailEs:
      'Los diuréticos de asa o tiazidas agravan la depleción de volumen y aumentan la reabsorción tubular proximal de litio. El Kayexalate (SPS) provoca necrosis colónica e hipernatremia y confunde el manejo. Si hay DIN, vigilar Na+ sérico c/2-4h para evitar empeorar la hipernatremia con NaCl 0.9% tras restaurar volemia.',
  },
  lithium_acute_naive: {
    id: 'lithium_acute_naive',
    category: 'lithium',
    isChronic: false,
    name: 'Acute Single-Ingestion Lithium Overdose (Lithium-Naive)',
    nameEs: 'Sobredosis Aguda de Litio (Ingesta Única sin Exposición Crónica)',
    mechanism:
      'Early GI distress (nausea, vomiting, diarrhea) with delayed 12-24h CNS penetration because lithium crosses the blood-brain barrier slowly. High early serum levels (3.0-4.0+ mEq/L) may look deceptively asymptomatic initially before delayed neurotoxicity emerges. Sustained-release (SR) tablets cause prolonged absorption peaks.',
    mechanismEs:
      'Síntomas gastrointestinales iniciales (náuseas, vómitos, diarrea) con penetración tardía al SNC en 12-24h por paso lento de la barrera hematoencefálica. Niveles séricos tempranos altos (3.0-4.0+ mEq/L) pueden ser inicialmente asintomáticos antes de la neurotoxicidad tardía. Las tabletas de liberación prolongada (LP) generan picos tardíos.',
    firstLineAntidote:
      'Obtain serial serum lithium levels every 4 hours (for 12-24h). Consider Whole Bowel Irrigation (WBI with PEG-ELS) for large sustained-release ingestions if airway protected (activated charcoal does NOT bind lithium). EXTRIP Hemodialysis for Li > 4.0 mEq/L with AKI, Li > 5.0 mEq/L regardless, or ANY decreased consciousness, seizures, or life-threatening dysrhythmia.',
    firstLineAntidoteEs:
      'Niveles seriados de litio cada 4 horas (durante 12-24h). Considerar Irrigación Intestinal Total (IIT con polietilenglicol) para tabletas de liberación prolongada con vía aérea protegida (el carbón activado NO adsorbe litio). Hemodiálisis EXTRIP si Li > 4.0 mEq/L con LRA, Li > 5.0 mEq/L siempre, o CUALQUIER deterioro neurológico, convulsión o arritmia grave.',
    blackBoxContraindication:
      'DO NOT RELY ON SINGLE EARLY LEVEL OR ACTIVATED CHARCOAL; NO DIURETICS',
    blackBoxContraindicationEs:
      'NO CONFIAR EN UN SOLO NIVEL TEMPRANO NI EN CARBÓN ACTIVADO; NO DIURÉTICOS',
    contraindicationDetail:
      'Never clear a lithium-naive patient from a single early asymptomatic lab draw due to 12-24h CNS distribution lag and delayed SR absorption. Activated charcoal does NOT adsorb monovalent lithium ions. Forced diuresis with loop/thiazide diuretics increases proximal lithium reabsorption and is contraindicated.',
    contraindicationDetailEs:
      'Nunca dar de alta por un nivel temprano asintomático debido al retraso de 12-24h hacia el SNC y absorción prolongada LP. El carbón activado NO adsorbe litio. La diuresis forzada con diuréticos de asa o tiazidas aumenta la reabsorción de litio y está contraindicada.',
  },
  valproate_hyperammonemia_vhe: {
    id: 'valproate_hyperammonemia_vhe',
    category: 'valproate',
    isChronic: false,
    name: 'Valproic Acid (Depakote) Toxicity & Hyperammonemic Encephalopathy (VHE)',
    nameEs: 'Toxicidad por Ácido Valproico (Depakote) y Encefalopatía Hiperamonémica (VHE)',
    mechanism:
      'Inhibits mitochondrial beta-oxidation and urea-cycle carbamoyl phosphate synthetase I (CPS-I), causing Valproate-Induced Hyperammonemic Encephalopathy (VHE) — lethargy, asterixis, or coma even with COMPLETELY NORMAL LFTs (AST/ALT). Massive ingestion (> 450-850+ mg/L) causes coma, anion-gap acidosis, hypernatremia, thrombocytopenia, acute hepatic failure, and cerebral edema.',
    mechanismEs:
      'Inhibe la beta-oxidación mitocondrial y la CPS-I del ciclo de la urea, causando Encefalopatía Hiperamonémica por Valproato (VHE) con letargo, asterixis o coma incluso con pruebas hepáticas (AST/ALT) NORMALES. Ingestas masivas (> 450-850+ mg/L) causan coma, acidosis con brecha aniónica, hipernatremia, trombocitopenia, falla hepática aguda y edema cerebral.',
    firstLineAntidote:
      'First-line antidote: IV Levocarnitine (L-Carnitine) 100 mg/kg IV loading dose (max 6 g) over 30 min, then 50 mg/kg IV q8h (max 3 g/dose) to restore urea cycle & beta-oxidation. EXTRIP Hemodialysis at > 900 mg/L with coma/shock/acidosis or > 1300 mg/L.',
    firstLineAntidoteEs:
      'Antídoto de primera línea: Levocarnitina (L-Carnitina) IV carga 100 mg/kg (máx 6 g) en 30 min, seguido de 50 mg/kg IV c/8h (máx 3 g/dosis) para restaurar ciclo de la urea y beta-oxidación. Hemodiálisis EXTRIP si > 900 mg/L con coma/choque/acidosis o > 1300 mg/L.',
    blackBoxContraindication:
      'CARBAPENEM (MEROPENEM / ERTAPENEM) SEVERE INTERACTION -> STATUS EPILEPTICUS',
    blackBoxContraindicationEs:
      'CONTRAINDICACIÓN DE CARBAPENÉMICOS (MEROPENEM / ERTAPENEM) -> ESTATUS EPILÉPTICO',
    contraindicationDetail:
      'Carbapenems (Meropenem, Ertapenem, Imipenem) irreversibly block acylpeptide hydrolase, plummeting serum valproate concentrations by 60-100% within 24 hours and precipitating refractory status epilepticus. Never administer carbapenems inadvertently to patients maintained on valproate.',
    contraindicationDetailEs:
      'Los carbapenémicos (Meropenem, Ertapenem, Imipenem) inhiben la acilpéptido hidrolasa, reduciendo los niveles de valproato entre un 60-100% en 24 horas y precipitando estatus epiléptico refractario. Evitar carbapenémicos en pacientes tratados con valproato.',
  },
  lamotrigine_cardiotox_sjs: {
    id: 'lamotrigine_cardiotox_sjs',
    category: 'lamotrigine',
    isChronic: false,
    name: 'Lamotrigine Overdose & Interrupted Titration Restart Hazard',
    nameEs: 'Sobredosis de Lamotrigina y Peligro de Reinicio tras Interrupción',
    mechanism:
      'Acute overdose causes fast voltage-gated Na+ channel blockade (QRS widening > 100 ms, rightward terminal R wave in aVR, Brugada-like ECG pattern, ventricular dysrhythmias), cerebellar ataxia, nystagmus, and seizures. Subacutely, restarting full maintenance doses after >= 4-5 half-lives (>= 4 days off) precipitates fatal Stevens-Johnson Syndrome / Toxic Epidermal Necrolysis (SJS/TEN).',
    mechanismEs:
      'La sobredosis aguda bloquea canales rápidos de sodio Na+ (ensanchamiento QRS > 100 ms, onda R terminal en aVR, patrón Brugada, arritmias ventriculares), ataxia cerebelosa, nistagmo y convulsiones. Además, reiniciar la dosis plena de mantenimiento tras >= 4 días sin tomarla precipita Síndrome de Stevens-Johnson / Necrólisis Epidérmica Tóxica (SSJ/NET) fatal.',
    firstLineAntidote:
      'For QRS > 100 ms or wide-complex arrhythmia: 8.4% Sodium Bicarbonate (NaHCO3) 1-2 mEq/kg IV bolus (repeat to QRS < 100 ms / pH 7.50-7.55) + 20% Intravenous Lipid Emulsion (ILE 1.5 mL/kg bolus) if refractory. Benzodiazepines for seizures. Restart-From-25mg Rule if >= 4 days missed.',
    firstLineAntidoteEs:
      'Si QRS > 100 ms o arritmia de complejo ancho: Bicarbonato de Sodio 8.4% (NaHCO3) bolo 1-2 mEq/kg IV (repetir hasta QRS < 100 ms / pH 7.50-7.55) + Emulsión Lipídica 20% (1.5 mL/kg bolo) si refractario. Benzodiacepinas para convulsiones. Regla de reinicio desde 25 mg si >= 4 días de pausa.',
    blackBoxContraindication:
      '4-DAY MISS RESTART-FROM-25mg RULE (SJS/TEN HAZARD); VALPROATE DOUBLES LEVELS',
    blackBoxContraindicationEs:
      'REGLA DE PAUSA >= 4 DÍAS: REINICIAR DESDE 25 mg (RIESGO SSJ/NET); VALPROATO DUPLICA NIVELES',
    contraindicationDetail:
      'If lamotrigine is missed for >= 4 consecutive days (>= 4-5 half-lives), NEVER restart at the prior maintenance dose — restart from 25 mg/day (or 25 mg every other day with concurrent valproate, which inhibits UGT1A4 glucuronidation and doubles lamotrigine levels) to prevent fatal SJS/TEN.',
    contraindicationDetailEs:
      'Si se omite lamotrigina durante >= 4 días seguidos (>= 4-5 vidas medias), NUNCA reiniciar la dosis plena previa; reiniciar desde 25 mg/día (o 25 mg cada 48h si toma valproato, que inhibe UGT1A4 y duplica niveles) para prevenir SSJ/NET mortal.',
  },
});

export const MOOD_STABILIZER_RED_FLAGS = Object.freeze([
  {
    id: 'flag_lithium_neurotox',
    label: 'Confusion, cerebellar ataxia, coarse tremor, dysarthria, or myoclonus / clonus',
    labelEs: 'Confusión, ataxia cerebelosa, temblor grueso, disartria o mioclonías / clono',
    fatal: true,
  },
  {
    id: 'flag_lithium_extrip_level',
    label: 'Serum Li+ > 4.0 mEq/L with AKI/elevated creatinine, OR > 5.0 mEq/L (EXTRIP HD trigger)',
    labelEs: 'Litio sérico > 4.0 mEq/L con LRA/creatinina elevada, o > 5.0 mEq/L (criterio EXTRIP HD)',
    fatal: true,
  },
  {
    id: 'flag_valproate_normal_lft_coma',
    label: 'Lethargy, asterixis, or coma on Valproate even with NORMAL LFTs (Check STAT Ammonia!)',
    labelEs: 'Letargo, asterixis o coma con Valproato incluso con pruebas hepáticas NORMALES (¡Pedir Amonio STAT!)',
    fatal: true,
  },
  {
    id: 'flag_lamotrigine_qrs_seizure',
    label: 'Wide QRS > 100 ms, Brugada/aVR R-wave pattern, or seizure on Lamotrigine',
    labelEs: 'QRS ancho > 100 ms, patrón Brugada/R en aVR o convulsión por Lamotrigina',
    fatal: true,
  },
  {
    id: 'flag_renal_precipitants',
    label: 'Active NSAID, ACEi/ARB, thiazide diuretic, or dehydration / NDI hypernatremia',
    labelEs: 'Uso activo de AINE, IECA/ARA-II, diurético tiazídico o deshidratación / hipernatremia por DIN',
    fatal: false,
  },
  {
    id: 'flag_lamotrigine_restart_4days',
    label: 'Restarting Lamotrigine at full maintenance dose after >= 4 days off (SJS/TEN hazard)',
    labelEs: 'Reinicio de Lamotrigina a dosis plena tras >= 4 días sin tomarla (riesgo de SSJ/NET)',
    fatal: true,
  },
]);

export const MOOD_STABILIZER_TABS = Object.freeze([
  { id: 'triage', labelEn: 'Triage & Calculator', labelEs: 'Triaje y Calculadora' },
  { id: 'profiles', labelEn: 'Agent Profiles & Prohibitions', labelEs: 'Perfiles y Prohibiciones' },
  { id: 'antidotes', labelEn: 'EXTRIP HD, L-Carnitine & 4-Day Rule', labelEs: 'EXTRIP HD, L-Carnitina y Regla 4 Días' },
  { id: 'sbar', labelEn: 'Zero-PII SBAR Handoff', labelEs: 'Entrega SBAR (Cero PII)' },
]);

function parseOptionalNumber(val) {
  if (val === null || val === undefined || val === '') return 0;
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Pure clinical calculator for IV L-Carnitine dosing (capped), EXTRIP hemodialysis eligibility,
 * and Lamotrigine wide-QRS NaHCO3 / ILE dosing.
 */
export function calculateCarnitineAndDialysis(
  weightKg = 70,
  agentId = 'lithium_chronic_acute_on_chronic',
  lithiumMeq = 0,
  valproateMgL = 0,
  creatinineElevated = false,
  cnsImpaired = false,
) {
  const rawWeight = Number(weightKg);
  const weight = Number.isFinite(rawWeight) && rawWeight > 0
    ? Math.max(5, Math.min(250, rawWeight))
    : 70;

  const profile = MOOD_STABILIZER_PROFILES[agentId] || MOOD_STABILIZER_PROFILES.lithium_chronic_acute_on_chronic;
  const li = parseOptionalNumber(lithiumMeq);
  const vpa = parseOptionalNumber(valproateMgL);
  const aki = Boolean(creatinineElevated);
  const cns = Boolean(cnsImpaired);

  // IV Levocarnitine: 100 mg/kg loading dose (max 6000 mg / 6 g) over 30 min,
  // then 50 mg/kg IV q8h maintenance (max 3000 mg / 3 g per dose).
  const rawLoadMg = Math.round(weight * 100);
  const carnitineLoadMg = Math.min(6000, rawLoadMg);
  const carnitineLoadCapped = rawLoadMg > 6000;

  const rawMaintMg = Math.round(weight * 50);
  const carnitineMaintMgQ8h = Math.min(3000, rawMaintMg);
  const carnitineMaintCapped = rawMaintMg > 3000;

  // 8.4% Sodium Bicarbonate bolus for Lamotrigine fast Na+ channel blockade (1-2 mEq/kg IV)
  const nahco3MinMeq = Math.round(weight * 1);
  const nahco3MaxMeq = Math.round(weight * 2);
  const ileBolusMl = Math.round(weight * 1.5);

  let hdRecommendation = 'saline_rehydration';
  let hdReasonEn = 'No mandatory EXTRIP hemodialysis trigger met; focus on targeted antidote/hydration and serial monitoring.';
  let hdReasonEs = 'Sin criterio obligatorio de hemodiálisis EXTRIP; priorizar antídoto/hidratación dirigida y monitoreo seriado.';

  if (profile.category === 'lithium') {
    if (li > 5.0 || (li > 4.0 && aki) || cns) {
      hdRecommendation = 'recommend_hd';
      if (cns) {
        hdReasonEn = 'EXTRIP RECOMMENDED HD: Decreased consciousness, ataxia/seizures, or life-threatening dysrhythmia in lithium poisoning.';
        hdReasonEs = 'HD EXTRIP RECOMENDADA: Deterioro del estado de conciencia, ataxia/convulsiones o arritmia grave en toxicidad por litio.';
      } else if (li > 5.0) {
        hdReasonEn = `EXTRIP RECOMMENDED HD: Serum Lithium (${li} mEq/L) exceeds 5.0 mEq/L threshold regardless of renal function.`;
        hdReasonEs = `HD EXTRIP RECOMENDADA: Litio sérico (${li} mEq/L) supera 5.0 mEq/L independientemente de la función renal.`;
      } else {
        hdReasonEn = `EXTRIP RECOMMENDED HD: Serum Lithium (${li} mEq/L) > 4.0 mEq/L with impaired renal function / AKI.`;
        hdReasonEs = `HD EXTRIP RECOMENDADA: Litio sérico (${li} mEq/L) > 4.0 mEq/L con lesión renal aguda / creatinina elevada.`;
      }
    } else if (li > 4.0 || (profile.isChronic && (li >= 2.5 || (li >= 1.5 && aki)))) {
      hdRecommendation = 'consider_hd';
      hdReasonEn = profile.isChronic
        ? `EXTRIP CONSIDER HD: Chronic lithium accumulation (${li} mEq/L) with slow CNS efflux or AKI; nephrology consult if time to < 1.0 mEq/L exceeds 36h.`
        : `EXTRIP CONSIDER HD: Acute serum Lithium (${li} mEq/L) > 4.0 mEq/L with preserved renal function; prepare HD if delayed clearance or neurotoxicity emerges.`;
      hdReasonEs = profile.isChronic
        ? `CONSIDERAR HD EXTRIP: Toxicidad crónica por litio (${li} mEq/L) con salida lenta del SNC o LRA; consultar Nefrología si el descenso a < 1.0 mEq/L supera 36h.`
        : `CONSIDERAR HD EXTRIP: Litio agudo (${li} mEq/L) > 4.0 mEq/L con función renal conservada; preparar HD si el aclaramiento se retrasa o aparece neurotoxicidad.`;
    } else {
      hdRecommendation = 'saline_rehydration';
      hdReasonEn = profile.isChronic
        ? '0.9% NaCl volume restoration ONLY if dehydrated/euvolemic and renally able (NO diuretics); serial Li+ q4h and strict Na+ monitoring if NDI present.'
        : '0.9% NaCl hydration if dehydrated + serial 4h serum lithium levels (12-24h CNS lag); consider WBI for large sustained-release ingestions.';
      hdReasonEs = profile.isChronic
        ? 'Rehidratación con NaCl 0.9% SOLO si hay deshidratación con diuresis conservada (SIN diuréticos); litio seriado c/4h y vigilancia de Na+ si hay DIN.'
        : 'Hidratación con NaCl 0.9% si hay deshidratación + niveles seriados de litio c/4h (retraso SNC 12-24h); considerar IIT si ingesta masiva LP.';
    }
  } else if (profile.category === 'valproate') {
    if (vpa > 1300 || (vpa > 900 && (cns || aki))) {
      hdRecommendation = 'recommend_hd';
      hdReasonEn = vpa > 1300
        ? `EXTRIP RECOMMENDED HD: Valproate (${vpa} mg/L) > 1300 mg/L; combine immediate hemodialysis with STAT IV L-Carnitine.`
        : `EXTRIP RECOMMENDED HD: Valproate (${vpa} mg/L) > 900 mg/L with coma, shock, acidosis, or AKI; combine HD with STAT IV L-Carnitine.`;
      hdReasonEs = vpa > 1300
        ? `HD EXTRIP RECOMENDADA: Valproato (${vpa} mg/L) > 1300 mg/L; combinar hemodiálisis inmediata con L-Carnitina IV STAT.`
        : `HD EXTRIP RECOMENDADA: Valproato (${vpa} mg/L) > 900 mg/L con coma, choque, acidosis o LRA; combinar HD con L-Carnitina IV STAT.`;
    } else if (vpa > 900 || (vpa >= 450 && cns)) {
      hdRecommendation = 'consider_hd';
      hdReasonEn = `EXTRIP CONSIDER HD: Valproate (${vpa} mg/L) with high cerebral edema/acidosis risk; initiate STAT IV L-Carnitine and consult Nephrology.`;
      hdReasonEs = `CONSIDERAR HD EXTRIP: Valproato (${vpa} mg/L) con alto riesgo de edema cerebral/acidosis; iniciar L-Carnitina IV STAT e interconsultar a Nefrología.`;
    } else {
      hdRecommendation = 'saline_rehydration';
      hdReasonEn = 'Hemodialysis criteria not met; treat VHE/hyperammonemia aggressively with IV L-Carnitine, supportive hydration, and serial ammonia/VPA levels.';
      hdReasonEs = 'Sin criterio actual de hemodiálisis; tratar VHE/hiperamonemia con L-Carnitina IV, hidratación de soporte y niveles seriados de amonio/valproato.';
    }
  } else if (profile.category === 'lamotrigine') {
    hdRecommendation = 'saline_rehydration';
    hdReasonEn = 'Hemodialysis is NOT first-line for Lamotrigine (large Vd / ~55% protein bound); prioritize 8.4% NaHCO3 (1-2 mEq/kg) for QRS > 100 ms, benzodiazepines, and 20% ILE.';
    hdReasonEs = 'La hemodiálisis NO es primera línea en Lamotrigina; priorizar NaHCO3 8.4% (1-2 mEq/kg) si QRS > 100 ms, benzodiacepinas y ELI 20%.';
  }

  return {
    weightKg: weight,
    agentId: profile.id,
    lithiumMeq: li,
    valproateMgL: vpa,
    creatinineElevated: aki,
    cnsImpaired: cns,
    carnitineLoadMg,
    carnitineLoadGrams: Number((carnitineLoadMg / 1000).toFixed(2)),
    carnitineLoadCapped,
    carnitineMaintMgQ8h,
    carnitineMaintGramsQ8h: Number((carnitineMaintMgQ8h / 1000).toFixed(2)),
    carnitineMaintCapped,
    nahco3MinMeq,
    nahco3MaxMeq,
    ileBolusMl,
    hdRecommendation,
    hdTriggered: hdRecommendation === 'recommend_hd' || hdRecommendation === 'consider_hd',
    hdReasonEn,
    hdReasonEs,
  };
}

const TIER_METADATA = Object.freeze({
  emergency_hemodialysis: {
    labelEn: 'EMERGENCY HEMODIALYSIS (EXTRIP TRIGGERED)',
    labelEs: 'HEMODIÁLISIS DE EMERGENCIA (CRITERIO EXTRIP)',
    summaryEn: 'STAT Nephrology activation for extracorporeal clearance alongside resuscitation and black-box precipitant cessation.',
    summaryEs: 'Activación STAT de Nefrología para depuración extracorpórea junto con reanimación y retiro de precipitantes.',
  },
  emergency_antidote: {
    labelEn: 'EMERGENCY ANTIDOTE RESUSCITATION',
    labelEs: 'RESUCITACIÓN CON ANTÍDOTO DE EMERGENCIA',
    summaryEn: 'Immediate weight-based antidote administration (IV L-Carnitine for VHE or 8.4% NaHCO3 / ILE for wide-QRS Na+ blockade).',
    summaryEs: 'Administración inmediata de antídoto por peso (L-Carnitina IV en VHE o NaHCO3 8.4% / ELI en bloqueo Na+).',
  },
  urgent_monitoring: {
    labelEn: 'URGENT TOXICOLOGY & MONITORING DIRECTIVE',
    labelEs: 'MONITOREO URGENTE Y PREVENCIÓN DE RIESGOS',
    summaryEn: 'Active toxicologic hazard, nephrotoxic precipitant, NDI sodium risk, or interrupted Lamotrigine SJS/TEN restart hazard.',
    summaryEs: 'Riesgo toxicológico activo, precipitante nefrotóxico, hipernatremia por DIN o peligro de SSJ/NET por reinicio de lamotrigina.',
  },
  baseline: {
    labelEn: 'BASELINE PROTOCOL REFERENCE',
    labelEs: 'REFERENCIA CLÍNICA BASE',
    summaryEn: 'Enter serum levels, weight, or clinical red flags to stratify EXTRIP dialysis, IV L-Carnitine, NaHCO3, and restart rules.',
    summaryEs: 'Ingrese niveles séricos, peso o banderas clínicas para estratificar diálisis EXTRIP, L-Carnitina IV, NaHCO3 y reglas de reinicio.',
  },
});

export function evaluateMoodStabilizerRisk(rawState = {}) {
  const state = rawState || {};
  const profile = MOOD_STABILIZER_PROFILES[state.agentId] || MOOD_STABILIZER_PROFILES.lithium_chronic_acute_on_chronic;
  const flags = state.checkedFlags instanceof Set
    ? state.checkedFlags
    : new Set(Array.isArray(state.checkedFlags) ? state.checkedFlags : []);

  const li = parseOptionalNumber(state.lithiumMeq);
  const vpa = parseOptionalNumber(state.valproateMgL);
  const ammonia = parseOptionalNumber(state.ammoniaUmolL);
  const qrsMs = parseOptionalNumber(state.qrsMs);
  const daysMissed = parseOptionalNumber(state.daysMissedLamotrigine);

  const aki = Boolean(state.creatinineElevated);
  const ndiPresent = Boolean(state.ndiPresent);
  const cnsImpaired = Boolean(state.cnsImpaired)
    || flags.has('flag_lithium_neurotox')
    || (profile.category === 'valproate' && flags.has('flag_valproate_normal_lft_coma'))
    || (profile.category === 'lamotrigine' && flags.has('flag_lamotrigine_qrs_seizure'));

  const dosing = calculateCarnitineAndDialysis(
    state.weightKg,
    profile.id,
    li,
    vpa,
    aki,
    cnsImpaired,
  );

  const lamotrigineRestartHazard = daysMissed >= 4 || flags.has('flag_lamotrigine_restart_4days');
  const valproateVheTriggered = flags.has('flag_valproate_normal_lft_coma')
    || vpa >= 450
    || ammonia >= 80
    || (profile.category === 'valproate' && cnsImpaired);
  const lamotrigineCardiotoxTriggered = flags.has('flag_lamotrigine_qrs_seizure')
    || qrsMs > 100
    || (profile.category === 'lamotrigine' && cnsImpaired);
  const lithiumEmergencyHd = dosing.hdRecommendation === 'recommend_hd'
    || flags.has('flag_lithium_extrip_level')
    || (profile.category === 'lithium' && flags.has('flag_lithium_neurotox'));

  let riskTier = 'baseline';
  if (dosing.hdRecommendation === 'recommend_hd' || lithiumEmergencyHd) {
    riskTier = 'emergency_hemodialysis';
  } else if (valproateVheTriggered || lamotrigineCardiotoxTriggered) {
    riskTier = 'emergency_antidote';
  } else if (
    dosing.hdRecommendation === 'consider_hd'
    || lamotrigineRestartHazard
    || flags.has('flag_renal_precipitants')
    || ndiPresent
    || (profile.category === 'lithium' && li >= 1.5)
    || (profile.category === 'valproate' && (vpa >= 150 || ammonia >= 50))
    || (profile.category === 'lamotrigine' && (qrsMs > 0 && qrsMs <= 100))
    || aki
    || cnsImpaired
  ) {
    riskTier = 'urgent_monitoring';
  }

  const tierMeta = TIER_METADATA[riskTier];
  const alerts = [];
  const actions = [];
  const prohibitions = [
    {
      titleEn: profile.blackBoxContraindication,
      titleEs: profile.blackBoxContraindicationEs,
      detailEn: profile.contraindicationDetail,
      detailEs: profile.contraindicationDetailEs,
    },
  ];

  // 1. Lithium Alerts & Directives
  if (dosing.hdRecommendation === 'recommend_hd' || lithiumEmergencyHd) {
    const isVpaHd = profile.category === 'valproate';
    alerts.push({
      type: 'critical',
      title: isVpaHd ? 'EXTRIP HEMODIALYSIS INDICATED (SEVERE VPA TOXICITY)' : 'STAT EXTRIP HEMODIALYSIS TRIGGERED (LITHIUM)',
      titleEn: isVpaHd ? 'EXTRIP HEMODIALYSIS INDICATED (SEVERE VPA TOXICITY)' : 'STAT EXTRIP HEMODIALYSIS TRIGGERED (LITHIUM)',
      titleEs: isVpaHd ? 'HEMODIÁLISIS EXTRIP INDICADA (TOXICIDAD GRAVE POR VALPROATO)' : 'HEMODIÁLISIS EXTRIP STAT ACTIVADA (LITIO)',
      body: dosing.hdReasonEn,
      bodyEn: dosing.hdReasonEn,
      bodyEs: dosing.hdReasonEs,
    });
    actions.push({
      priority: 'stat',
      text: isVpaHd
        ? `STAT Nephrology / Hemodialysis Consult (${dosing.hdReasonEn}) + recheck serum VPA & ammonia post-HD for rebound.`
        : `STAT Nephrology / Intermittent Hemodialysis Consult: ${dosing.hdReasonEn} Recheck serum Li+ 6-12h post-dialysis for CNS/tissue rebound.`,
      textEn: isVpaHd
        ? `STAT Nephrology / Hemodialysis Consult (${dosing.hdReasonEn}) + recheck serum VPA & ammonia post-HD for rebound.`
        : `STAT Nephrology / Intermittent Hemodialysis Consult: ${dosing.hdReasonEn} Recheck serum Li+ 6-12h post-dialysis for CNS/tissue rebound.`,
      textEs: isVpaHd
        ? `Interconsulta STAT a Nefrología / Hemodiálisis (${dosing.hdReasonEs}) + controlar valproato y amonio post-HD por rebote.`
        : `Interconsulta STAT a Nefrología / Hemodiálisis intermitente: ${dosing.hdReasonEs} Controlar Li+ 6-12h post-HD por rebote tisular.`,
    });
  } else if (dosing.hdRecommendation === 'consider_hd') {
    alerts.push({
      type: 'warning',
      title: 'EXTRIP HEMODIALYSIS CONSIDERATION',
      titleEn: 'EXTRIP HEMODIALYSIS CONSIDERATION',
      titleEs: 'CONSIDERAR HEMODIÁLISIS EXTRIP',
      body: dosing.hdReasonEn,
      bodyEn: dosing.hdReasonEn,
      bodyEs: dosing.hdReasonEs,
    });
    actions.push({
      priority: 'urgent',
      text: `Urgent Nephrology Consult (Consider HD): ${dosing.hdReasonEn}`,
      textEn: `Urgent Nephrology Consult (Consider HD): ${dosing.hdReasonEn}`,
      textEs: `Interconsulta urgente a Nefrología (Considerar HD): ${dosing.hdReasonEs}`,
    });
  }

  if (profile.category === 'lithium') {
    if (profile.id === 'lithium_chronic_acute_on_chronic' && li >= 1.5 && li <= 3.0) {
      alerts.push({
        type: 'warning',
        title: 'CHRONIC CNS EFFLUX LAG ALERT (TOXIC AT 1.5-2.5+ mEq/L)',
        titleEn: 'CHRONIC CNS EFFLUX LAG ALERT (TOXIC AT 1.5-2.5+ mEq/L)',
        titleEs: 'ALERTA DE SALIDA LENTA EN SNC (TÓXICO DESDE 1.5-2.5+ mEq/L)',
        body: 'Chronic lithium toxicity causes severe ataxia, coarse tremor, dysarthria, and coma at modest serum concentrations (1.5-2.5+ mEq/L) because brain clearance lags far behind serum.',
        bodyEn: 'Chronic lithium toxicity causes severe ataxia, coarse tremor, dysarthria, and coma at modest serum concentrations (1.5-2.5+ mEq/L) because brain clearance lags far behind serum.',
        bodyEs: 'La toxicidad crónica por litio causa ataxia grave, temblor grueso, disartria y coma a niveles moderados (1.5-2.5+ mEq/L) porque el aclaramiento cerebral es mucho más lento que el sérico.',
      });
    }
    if (profile.id === 'lithium_acute_naive') {
      actions.push({
        priority: li > 3.5 ? 'stat' : 'urgent',
        text: 'Serial serum lithium levels every 4 hours for 12-24h (delayed CNS penetration). Consider Whole Bowel Irrigation (PEG-ELS) for sustained-release tablets; activated charcoal is ineffective.',
        textEn: 'Serial serum lithium levels every 4 hours for 12-24h (delayed CNS penetration). Consider Whole Bowel Irrigation (PEG-ELS) for sustained-release tablets; activated charcoal is ineffective.',
        textEs: 'Niveles seriados de litio cada 4 horas durante 12-24h (penetración tardía al SNC). Considerar Irrigación Intestinal Total (PEG-ELS) en tabletas LP; el carbón activado NO funciona.',
      });
    }
    if (flags.has('flag_renal_precipitants') || ndiPresent || aki) {
      alerts.push({
        type: 'warning',
        title: 'NEPHROTOXIC PRECIPITANT / NDI HYPERNATREMIA GUARDRAIL',
        titleEn: 'NEPHROTOXIC PRECIPITANT / NDI HYPERNATREMIA GUARDRAIL',
        titleEs: 'ALERTA DE PRECIPITANTE NEFROTÓXICO / HIPERNATREMIA POR DIN',
        body: 'Hold NSAIDs, ACEi/ARBs, and thiazide/loop diuretics immediately. NO Kayexalate (SPS). Hydrate with 0.9% NaCl ONLY if dehydrated and renally able; check Na+ q2-4h if Nephrogenic Diabetes Insipidus is present.',
        bodyEn: 'Hold NSAIDs, ACEi/ARBs, and thiazide/loop diuretics immediately. NO Kayexalate (SPS). Hydrate with 0.9% NaCl ONLY if dehydrated and renally able; check Na+ q2-4h if Nephrogenic Diabetes Insipidus is present.',
        bodyEs: 'Suspender AINEs, IECA/ARA-II y diuréticos (tiazidas/asa). NO Kayexalate (SPS). Hidratar con NaCl 0.9% SOLO si hay deshidratación y diuresis conservada; vigilar Na+ c/2-4h si hay DIN.',
      });
    }
    actions.push({
      priority: aki ? 'urgent' : 'routine',
      text: '0.9% NaCl IV hydration ONLY if euvolemic/dehydrated and renally able to produce urine (avoid fluid overload in oliguric AKI). Strictly avoid loop/thiazide diuretics and Kayexalate (SPS).',
      textEn: '0.9% NaCl IV hydration ONLY if euvolemic/dehydrated and renally able to produce urine (avoid fluid overload in oliguric AKI). Strictly avoid loop/thiazide diuretics and Kayexalate (SPS).',
      textEs: 'Hidratación con NaCl 0.9% IV SOLO si hay deshidratación y función renal capaz de orinar (evitar sobrecarga en LRA oligúrica). Prohibidos diuréticos de asa/tiazidas y Kayexalate (SPS).',
    });
  }

  // 2. Valproate VHE & L-Carnitine Alerts & Directives
  if (profile.category === 'valproate' || valproateVheTriggered) {
    if (valproateVheTriggered) {
      alerts.push({
        type: 'critical',
        title: 'VALPROATE HYPERAMMONEMIC ENCEPHALOPATHY (VHE) — NORMAL LFTs POSSIBLE',
        titleEn: 'VALPROATE HYPERAMMONEMIC ENCEPHALOPATHY (VHE) — NORMAL LFTs POSSIBLE',
        titleEs: 'ENCEFALOPATÍA HIPERAMONÉMICA POR VALPROATO (VHE) — POSIBLE CON PFH NORMALES',
        body: 'Check STAT venous/arterial ammonia immediately regardless of normal AST/ALT. Administer IV Levocarnitine immediately and avoid all carbapenem antibiotics (60-100% VPA drop -> status epilepticus).',
        bodyEn: 'Check STAT venous/arterial ammonia immediately regardless of normal AST/ALT. Administer IV Levocarnitine immediately and avoid all carbapenem antibiotics (60-100% VPA drop -> status epilepticus).',
        bodyEs: 'Solicitar amonio STAT de inmediato aunque AST/ALT estén normales. Administrar Levocarnitina IV de inmediato y evitar carbapenémicos (caída del 60-100% de valproato -> estatus epiléptico).',
      });
    }
    actions.push({
      priority: valproateVheTriggered ? 'stat' : 'urgent',
      text: `IV Levocarnitine (L-Carnitine): Load ${dosing.carnitineLoadMg} mg (${dosing.carnitineLoadGrams} g; 100 mg/kg, max 6 g) IV over 30 min, then ${dosing.carnitineMaintMgQ8h} mg (${dosing.carnitineMaintGramsQ8h} g; 50 mg/kg, max 3 g) IV q8h until ammonia normalizes.`,
      textEn: `IV Levocarnitine (L-Carnitine): Load ${dosing.carnitineLoadMg} mg (${dosing.carnitineLoadGrams} g; 100 mg/kg, max 6 g) IV over 30 min, then ${dosing.carnitineMaintMgQ8h} mg (${dosing.carnitineMaintGramsQ8h} g; 50 mg/kg, max 3 g) IV q8h until ammonia normalizes.`,
      textEs: `Levocarnitina (L-Carnitina) IV: Carga ${dosing.carnitineLoadMg} mg (${dosing.carnitineLoadGrams} g; 100 mg/kg, máx 6 g) IV en 30 min, luego ${dosing.carnitineMaintMgQ8h} mg (${dosing.carnitineMaintGramsQ8h} g; 50 mg/kg, máx 3 g) IV c/8h hasta normalizar amonio.`,
    });
    actions.push({
      priority: 'stat',
      text: 'CARBAPENEM BLACK-BOX GUARDRAIL: Do NOT give Meropenem, Ertapenem, or Imipenem to patients maintained on valproate (rapid 60-100% VPA drop triggers refractory status epilepticus).',
      textEn: 'CARBAPENEM BLACK-BOX GUARDRAIL: Do NOT give Meropenem, Ertapenem, or Imipenem to patients maintained on valproate (rapid 60-100% VPA drop triggers refractory status epilepticus).',
      textEs: 'ALERTA NEGRA CARBAPENÉMICOS: NO administrar Meropenem, Ertapenem ni Imipenem con valproato (caída rápida de 60-100% desencadena estatus epiléptico).',
    });
  }

  // 3. Lamotrigine Cardiotox & 4-Day Restart Alerts & Directives
  if (profile.category === 'lamotrigine' || lamotrigineCardiotoxTriggered || lamotrigineRestartHazard) {
    if (lamotrigineCardiotoxTriggered) {
      alerts.push({
        type: 'critical',
        title: 'LAMOTRIGINE FAST Na+ CHANNEL BLOCKADE / WIDE QRS > 100 ms',
        titleEn: 'LAMOTRIGINE FAST Na+ CHANNEL BLOCKADE / WIDE QRS > 100 ms',
        titleEs: 'BLOQUEO DE CANALES DE Na+ POR LAMOTRIGINA / QRS ANCHO > 100 ms',
        body: `Administer 8.4% Sodium Bicarbonate (${dosing.nahco3MinMeq}-${dosing.nahco3MaxMeq} mEq IV bolus; 1-2 mEq/kg) immediately for QRS > 100 ms or Brugada/ventricular dysrhythmia, plus 20% Lipid Emulsion (${dosing.ileBolusMl} mL IV) if refractory.`,
        bodyEn: `Administer 8.4% Sodium Bicarbonate (${dosing.nahco3MinMeq}-${dosing.nahco3MaxMeq} mEq IV bolus; 1-2 mEq/kg) immediately for QRS > 100 ms or Brugada/ventricular dysrhythmia, plus 20% Lipid Emulsion (${dosing.ileBolusMl} mL IV) if refractory.`,
        bodyEs: `Administrar Bicarbonato de Sodio 8.4% (${dosing.nahco3MinMeq}-${dosing.nahco3MaxMeq} mEq IV en bolo; 1-2 mEq/kg) de inmediato si QRS > 100 ms o patrón Brugada/arritmia, más Emulsión Lipídica 20% (${dosing.ileBolusMl} mL IV) si refractario.`,
      });
      actions.push({
        priority: 'stat',
        text: `8.4% NaHCO3 Bolus: ${dosing.nahco3MinMeq}-${dosing.nahco3MaxMeq} mEq IV push (1-2 mEq/kg); repeat until QRS < 100 ms (target arterial pH 7.50-7.55). Add 20% ILE (${dosing.ileBolusMl} mL bolus) for refractory shock/dysrhythmia; benzodiazepines for seizures.`,
        textEn: `8.4% NaHCO3 Bolus: ${dosing.nahco3MinMeq}-${dosing.nahco3MaxMeq} mEq IV push (1-2 mEq/kg); repeat until QRS < 100 ms (target arterial pH 7.50-7.55). Add 20% ILE (${dosing.ileBolusMl} mL bolus) for refractory shock/dysrhythmia; benzodiazepines for seizures.`,
        textEs: `Bolo NaHCO3 8.4%: ${dosing.nahco3MinMeq}-${dosing.nahco3MaxMeq} mEq IV directa (1-2 mEq/kg); repetir hasta QRS < 100 ms (pH 7.50-7.55). Añadir ELI 20% (${dosing.ileBolusMl} mL bolo) si refractario; benzodiacepinas para convulsiones.`,
      });
    }

    if (lamotrigineRestartHazard) {
      alerts.push({
        type: 'critical',
        title: '4-DAY MISS RESTART-FROM-25mg RULE (FATAL SJS/TEN PREVENTION)',
        titleEn: '4-DAY MISS RESTART-FROM-25mg RULE (FATAL SJS/TEN PREVENTION)',
        titleEs: 'REGLA DE PAUSA >= 4 DÍAS: REINICIAR DESDE 25 mg (PREVENIR SSJ/NET FATAL)',
        body: 'Patient has missed >= 4 consecutive days (>= 4-5 half-lives). NEVER restart full maintenance lamotrigine! Must restart at 25 mg/day (or 25 mg every other day if co-prescribed with valproate) and re-titrate slowly to prevent Stevens-Johnson Syndrome / TEN.',
        bodyEn: 'Patient has missed >= 4 consecutive days (>= 4-5 half-lives). NEVER restart full maintenance lamotrigine! Must restart at 25 mg/day (or 25 mg every other day if co-prescribed with valproate) and re-titrate slowly to prevent Stevens-Johnson Syndrome / TEN.',
        bodyEs: 'El paciente omitió >= 4 días consecutivos (>= 4-5 vidas medias). ¡NUNCA reiniciar la dosis plena previa! Reiniciar desde 25 mg/día (o 25 mg cada 48h con valproato) y retitular lentamente para evitar Síndrome de Stevens-Johnson / NET fatal.',
      });
      prohibitions.push({
        titleEn: 'DO NOT RESTART FULL MAINTENANCE LAMOTRIGINE AFTER >= 4 DAYS OFF',
        titleEs: 'PROHIBIDO REINICIAR DOSIS PLENA DE LAMOTRIGINA TRAS >= 4 DÍAS DE PAUSA',
        detailEn: 'Restart from 25 mg/day (25 mg q48h if on valproate) per FDA SJS/TEN titration schedule.',
        detailEs: 'Reiniciar desde 25 mg/día (25 mg c/48h con valproato) según esquema FDA para prevenir SSJ/NET.',
      });
    }

    actions.push({
      priority: lamotrigineRestartHazard ? 'stat' : 'urgent',
      text: 'Enforce 4-Day Miss Restart-From-25mg Rule: If >= 4 days off lamotrigine, restart at 25 mg/day (25 mg every other day if taking valproate). Inspect skin/mucosa for SJS/TEN.',
      textEn: 'Enforce 4-Day Miss Restart-From-25mg Rule: If >= 4 days off lamotrigine, restart at 25 mg/day (25 mg every other day if taking valproate). Inspect skin/mucosa for SJS/TEN.',
      textEs: 'Aplicar Regla de Reinicio desde 25 mg (>= 4 días sin dosis): reiniciar a 25 mg/día (25 mg c/48h si toma valproato). Vigilar piel y mucosas por SSJ/NET.',
    });
  }

  actions.push({
    priority: 'routine',
    text: 'Consult Medical Toxicology / Poison Control Center at 1-800-222-1222 (24/7) for complex co-ingestions, rebound dialysis timing, or SJS/TEN dermatology transfer.',
    textEn: 'Consult Medical Toxicology / Poison Control Center at 1-800-222-1222 (24/7) for complex co-ingestions, rebound dialysis timing, or SJS/TEN dermatology transfer.',
    textEs: 'Consultar a Toxicología Médica / Control de Envenenamientos al 1-800-222-1222 (24/7) para coingestiones complejas, rebote post-diálisis o manejo de SSJ/NET.',
  });

  return {
    profile,
    riskTier,
    tierLabelEn: tierMeta.labelEn,
    tierLabelEs: tierMeta.labelEs,
    tierSummaryEn: tierMeta.summaryEn,
    tierSummaryEs: tierMeta.summaryEs,
    dosing,
    lamotrigineRestartHazard,
    valproateVheTriggered,
    lamotrigineCardiotoxTriggered,
    alerts,
    prohibitions,
    actions,
  };
}

export function formatMoodStabilizerSbarText(state = {}, lang = getLang()) {
  const isEs = lang === 'es';
  const evaluation = evaluateMoodStabilizerRisk(state);
  const { profile, dosing } = evaluation;
  const now = new Date().toISOString();
  const flags = state?.checkedFlags instanceof Set
    ? Array.from(state.checkedFlags)
    : Array.isArray(state?.checkedFlags) ? state.checkedFlags : [];

  const ammoniaText = state?.ammoniaUmolL ? `${state.ammoniaUmolL} umol/L` : (isEs ? 'Pendiente (Pedir STAT si VHE)' : 'Pending (Order STAT if VPA lethargy)');
  const qrsText = state?.qrsMs ? `${state.qrsMs} ms` : (isEs ? 'Pendiente (ECG 12 derivaciones)' : 'Pending (12-lead ECG)');
  const missedText = state?.daysMissedLamotrigine ? `${state.daysMissedLamotrigine} ${isEs ? 'días' : 'days'}` : (isEs ? 'No reportado' : 'Not reported');

  if (isEs) {
    return [
      '=== REPORTE CLÍNICO SBAR: TOXICIDAD POR ESTABILIZADORES DEL ÁNIMO ===',
      `Fecha/Hora: ${now}`,
      'Privacidad: Cero PII / Entrega Clínica Desidentificada (Cumplimiento HIPAA / RAM Epímera)',
      '',
      'S (SITUACIÓN):',
      `Perfil Tóxico: ${profile.nameEs}`,
      `Nivel de Severidad: ${evaluation.tierLabelEs}`,
      `Peso: ${dosing.weightKg} kg | Litio Sérico: ${dosing.lithiumMeq || 'Pendiente'} mEq/L | Valproato: ${dosing.valproateMgL || 'Pendiente'} mg/L`,
      `Amonio: ${ammoniaText} | QRS ECG: ${qrsText} | Días sin Lamotrigina: ${missedText}`,
      `LRA / Creatinina Elevada: ${dosing.creatinineElevated ? 'SÍ' : 'No'} | Deterioro SNC / Convulsión: ${dosing.cnsImpaired ? 'SÍ' : 'No'} | DIN / Hipernatremia: ${state?.ndiPresent ? 'SÍ' : 'No'}`,
      '',
      'B (ANTECEDENTES):',
      `Mecanismo: ${profile.mechanismEs}`,
      `Banderas Activas: ${flags.length ? flags.join(', ') : 'Ninguna marcada'}`,
      '',
      'A (EVALUACIÓN Y CÁLCULOS CLÍNICOS):',
      `• Decisión EXTRIP Hemodiálisis: ${dosing.hdRecommendation.toUpperCase()} — ${dosing.hdReasonEs}`,
      `• Levocarnitina (L-Carnitina) IV: Carga ${dosing.carnitineLoadMg} mg (${dosing.carnitineLoadGrams} g; 100 mg/kg, máx 6 g) en 30 min; luego ${dosing.carnitineMaintMgQ8h} mg (${dosing.carnitineMaintGramsQ8h} g; 50 mg/kg, máx 3 g) c/8h`,
      `• NaHCO3 8.4% (QRS > 100 ms): ${dosing.nahco3MinMeq}-${dosing.nahco3MaxMeq} mEq IV en bolo (1-2 mEq/kg) | ELI 20%: ${dosing.ileBolusMl} mL bolo`,
      `• Regla de Reinicio Lamotrigina (>= 4 días pausa): ${evaluation.lamotrigineRestartHazard ? 'PELIGRO ACTIVO DE SSJ/NET — Reiniciar estrictamente desde 25 mg/día (25 mg c/48h con valproato)' : 'Verificar adherencia; reiniciar desde 25 mg si pausa >= 4 días'}`,
      '',
      'R (RECOMENDACIONES Y CONTRAINDICACIONES NEGRAS):',
      `1. ALERTA NEGRA: ${profile.blackBoxContraindicationEs}`,
      `   ${profile.contraindicationDetailEs}`,
      `2. Protocolo Primario: ${profile.firstLineAntidoteEs}`,
      '3. Control de Envenenamientos / Toxicología Médica 24/7: 1-800-222-1222.',
      '========================================================================',
    ].join('\n');
  }

  return [
    '=== SBAR CLINICAL HANDOFF REPORT: MOOD-STABILIZER TOXICOLOGY ===',
    `Timestamp: ${now}`,
    'Privacy: Zero PII / De-identified Clinical Handoff (HIPAA / Ephemeral RAM Compliant)',
    '',
    'S (SITUATION):',
    `Toxicologic Profile: ${profile.name}`,
    `Severity Stratification: ${evaluation.tierLabelEn}`,
    `Weight: ${dosing.weightKg} kg | Serum Lithium: ${dosing.lithiumMeq || 'Pending'} mEq/L | Serum Valproate: ${dosing.valproateMgL || 'Pending'} mg/L`,
    `Serum Ammonia: ${ammoniaText} | ECG QRS: ${qrsText} | Days Off Lamotrigine: ${missedText}`,
    `AKI / Elevated Creatinine: ${dosing.creatinineElevated ? 'YES' : 'No'} | CNS Impairment / Seizure: ${dosing.cnsImpaired ? 'YES' : 'No'} | NDI / Hypernatremia: ${state?.ndiPresent ? 'YES' : 'No'}`,
    '',
    'B (BACKGROUND):',
    `Pathophysiologic Mechanism: ${profile.mechanism}`,
    `Active Clinical Flags: ${flags.length ? flags.join(', ') : 'None checked'}`,
    '',
    'A (ASSESSMENT & CALCULATED DOSING):',
    `• EXTRIP Hemodialysis Triage: ${dosing.hdRecommendation.toUpperCase()} — ${dosing.hdReasonEn}`,
    `• IV Levocarnitine (L-Carnitine): Load ${dosing.carnitineLoadMg} mg (${dosing.carnitineLoadGrams} g; 100 mg/kg, max 6 g) IV over 30 min; then ${dosing.carnitineMaintMgQ8h} mg (${dosing.carnitineMaintGramsQ8h} g; 50 mg/kg, max 3 g) IV q8h`,
    `• 8.4% NaHCO3 (QRS > 100 ms): ${dosing.nahco3MinMeq}-${dosing.nahco3MaxMeq} mEq IV bolus (1-2 mEq/kg) | 20% ILE: ${dosing.ileBolusMl} mL bolus`,
    `• Lamotrigine 4-Day Restart-From-25mg Rule: ${evaluation.lamotrigineRestartHazard ? 'ACTIVE SJS/TEN HAZARD — Strictly restart at 25 mg/day (25 mg q48h if on valproate)' : 'Confirm missed days; restart at 25 mg if >= 4 days off'}`,
    '',
    'R (RECOMMENDATIONS & BLACK-BOX PROHIBITIONS):',
    `1. BLACK-BOX GUARDRAIL: ${profile.blackBoxContraindication}`,
    `   ${profile.contraindicationDetail}`,
    `2. Primary Resuscitation Protocol: ${profile.firstLineAntidote}`,
    '3. Medical Toxicology / Poison Control 24/7 Consult: 1-800-222-1222.',
    '========================================================================',
  ].join('\n');
}

// ============================================================================
// Ephemeral In-RAM State Lifecycle (Zero Persistence)
// ============================================================================

function createInitialState() {
  return {
    activeTab: 'triage',
    agentId: 'lithium_chronic_acute_on_chronic',
    weightKg: '70',
    lithiumMeq: '',
    valproateMgL: '',
    ammoniaUmolL: '',
    qrsMs: '',
    daysMissedLamotrigine: '',
    creatinineElevated: false,
    cnsImpaired: false,
    ndiPresent: false,
    checkedFlags: new Set(),
  };
}

let moodStabilizerState = createInitialState();
const listeners = new Set();

export function getMoodStabilizerToxState() {
  return moodStabilizerState;
}

export function updateMoodStabilizerToxState(partial = {}) {
  moodStabilizerState = { ...moodStabilizerState, ...partial };
  const snapshot = getMoodStabilizerToxState();
  listeners.forEach((fn) => fn(snapshot));
}

export function resetMoodStabilizerToxState() {
  moodStabilizerState = createInitialState();
  const snapshot = getMoodStabilizerToxState();
  listeners.forEach((fn) => fn(snapshot));
}

export function subscribeMoodStabilizerToxState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// WAI-ARIA Accessible View Renderer
// ============================================================================

function isDomContainer(value) {
  return Boolean(
    value
    && (typeof value.append === 'function'
      || typeof value.appendChild === 'function'
      || value.nodeType
      || value.tagName),
  );
}

export function moodStabilizerToxView(containerOrOptions = {}) {
  const hostContainer = isDomContainer(containerOrOptions) ? containerOrOptions : null;
  const lang = getLang();
  const isEs = lang === 'es';

  const root = h('section', {
    class: 'view-section mood-stabilizer-tox-view mst-view',
    'aria-labelledby': 'page-title',
  });

  const headerTitle = t(
    TOOL_I18N_KEYS.title,
    isEs
      ? 'Navegador de Toxicidad por Litio, Valproato (VHE) y Lamotrigina'
      : 'Lithium, Valproate Hyperammonemia & Lamotrigine Toxicity Navigator',
  );
  const headerDesc = t(
    TOOL_I18N_KEYS.description,
    isEs
      ? 'Protocolos EXTRIP de hemodiálisis para litio crónico/agudo, rescate con L-carnitina IV para encefalopatía hiperamonémica por valproato, bicarbonato 8.4% para QRS por lamotrigina y regla de reinicio desde 25 mg tras 4 días de pausa.'
      : 'EXTRIP hemodialysis triggers for acute/chronic lithium toxicity, weight-based IV L-carnitine for valproate hyperammonemic encephalopathy (VHE), 8.4% NaHCO3 for lamotrigine QRS widening, and the 4-day interruption restart-from-25 mg SJS/TEN guardrail.',
  );

  root.append(
    h('div', { class: 'view-header mst-header' }, [
      pageHeader(headerTitle, headerDesc),
    ]),
  );

  const blackboxBannerSlot = h('div', { class: 'mst-banner-slot' });
  root.append(blackboxBannerSlot);

  // WAI-ARIA Tablist
  const tabNav = h('div', {
    class: 'tab-nav mst-tab-nav',
    role: 'tablist',
    'aria-label': isEs ? 'Secciones de toxicología de estabilizadores del ánimo' : 'Mood-stabilizer toxicology sections',
  });
  const tabButtons = new Map();
  MOOD_STABILIZER_TABS.forEach((tab) => {
    const isSelected = getMoodStabilizerToxState().activeTab === tab.id;
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `mst-tab-${tab.id}`,
      'data-tab': tab.id,
      class: `tab mst-tab${isSelected ? ' active' : ''}`,
      'aria-selected': String(isSelected),
      'aria-controls': `mst-panel-${tab.id}`,
      tabindex: isSelected ? '0' : '-1',
      onclick: () => updateMoodStabilizerToxState({ activeTab: tab.id }),
    }, isEs ? tab.labelEs : tab.labelEn);
    tabButtons.set(tab.id, btn);
    tabNav.append(btn);
  });
  root.append(tabNav);

  // Persistent Inputs in Tab 1 (never rebuilt on state change so typing never loses focus)
  const initial = getMoodStabilizerToxState();

  const agentSelect = h(
    'select',
    {
      id: 'mst-agent-select',
      class: 'select nsti-select mst-select',
      'aria-label': isEs ? 'Seleccionar perfil de estabilizador del ánimo' : 'Select mood-stabilizer profile',
      onchange: (e) => updateMoodStabilizerToxState({ agentId: e.target.value }),
    },
    Object.values(MOOD_STABILIZER_PROFILES).map((p) =>
      h('option', { value: p.id, selected: p.id === initial.agentId }, isEs ? p.nameEs : p.name),
    ),
  );

  const weightInput = h('input', {
    id: 'mst-weight-input',
    type: 'number',
    min: '5',
    max: '250',
    step: '1',
    class: 'input nsti-num-input mst-input',
    placeholder: '70',
    value: initial.weightKg,
    oninput: (e) => updateMoodStabilizerToxState({ weightKg: e.target.value }),
  });

  const lithiumInput = h('input', {
    id: 'mst-lithium-input',
    type: 'number',
    min: '0',
    max: '15',
    step: '0.1',
    class: 'input nsti-num-input mst-input',
    placeholder: isEs ? 'ej. 2.2 o 4.5' : 'e.g. 2.2 or 4.5',
    value: initial.lithiumMeq,
    oninput: (e) => updateMoodStabilizerToxState({ lithiumMeq: e.target.value }),
  });

  const valproateInput = h('input', {
    id: 'mst-valproate-input',
    type: 'number',
    min: '0',
    max: '3000',
    step: '10',
    class: 'input nsti-num-input mst-input',
    placeholder: isEs ? 'ej. 650 o 950' : 'e.g. 650 or 950',
    value: initial.valproateMgL,
    oninput: (e) => updateMoodStabilizerToxState({ valproateMgL: e.target.value }),
  });

  const ammoniaInput = h('input', {
    id: 'mst-ammonia-input',
    type: 'number',
    min: '0',
    max: '1000',
    step: '5',
    class: 'input nsti-num-input mst-input',
    placeholder: isEs ? 'ej. 120 (pedir STAT aunque PFH normales)' : 'e.g. 120 (order STAT even if LFTs normal)',
    value: initial.ammoniaUmolL,
    oninput: (e) => updateMoodStabilizerToxState({ ammoniaUmolL: e.target.value }),
  });

  const qrsInput = h('input', {
    id: 'mst-qrs-input',
    type: 'number',
    min: '40',
    max: '300',
    step: '2',
    class: 'input nsti-num-input mst-input',
    placeholder: isEs ? 'ej. 116 (NaHCO3 si > 100 ms)' : 'e.g. 116 (NaHCO3 if > 100 ms)',
    value: initial.qrsMs,
    oninput: (e) => updateMoodStabilizerToxState({ qrsMs: e.target.value }),
  });

  const daysMissedInput = h('input', {
    id: 'mst-lamotrigine-missed-input',
    type: 'number',
    min: '0',
    max: '60',
    step: '1',
    class: 'input nsti-num-input mst-input',
    placeholder: isEs ? 'ej. 5 (regla reinicio >= 4 días)' : 'e.g. 5 (>= 4-day restart rule)',
    value: initial.daysMissedLamotrigine,
    oninput: (e) => updateMoodStabilizerToxState({ daysMissedLamotrigine: e.target.value }),
  });

  const creatinineCheck = h('input', {
    id: 'mst-chk-creatinine',
    type: 'checkbox',
    checked: initial.creatinineElevated,
    onchange: (e) => updateMoodStabilizerToxState({ creatinineElevated: e.target.checked }),
  });

  const cnsCheck = h('input', {
    id: 'mst-chk-cns',
    type: 'checkbox',
    checked: initial.cnsImpaired,
    onchange: (e) => updateMoodStabilizerToxState({ cnsImpaired: e.target.checked }),
  });

  const ndiCheck = h('input', {
    id: 'mst-chk-ndi',
    type: 'checkbox',
    checked: initial.ndiPresent,
    onchange: (e) => updateMoodStabilizerToxState({ ndiPresent: e.target.checked }),
  });

  const flagCheckboxes = MOOD_STABILIZER_RED_FLAGS.map((flag) => {
    const input = h('input', {
      id: `mst-${flag.id}`,
      type: 'checkbox',
      checked: initial.checkedFlags.has(flag.id),
      onchange: (e) => {
        const nextSet = new Set(getMoodStabilizerToxState().checkedFlags);
        if (e.target.checked) nextSet.add(flag.id);
        else nextSet.delete(flag.id);
        updateMoodStabilizerToxState({ checkedFlags: nextSet });
      },
    });
    return { id: flag.id, input, flag };
  });

  const profileDetailSlot = h('div', { class: 'nsti-stage-info mst-profile-summary' });
  const evaluationOutputSlot = h('div', { class: 'mst-evaluation-slot' });
  const directivesOutputSlot = h('div', { class: 'mst-directives-slot' });

  const quickResetBtn = h('button', {
    type: 'button',
    class: 'btn btn-secondary mst-reset-btn',
    onclick: () => resetMoodStabilizerToxState(),
  }, isEs ? 'Reiniciar Calculadora' : 'Reset Calculator');

  const quickCopySbarBtn = h('button', {
    type: 'button',
    class: 'btn btn-primary mst-copy-quick-btn',
    onclick: () => copyText(formatMoodStabilizerSbarText(getMoodStabilizerToxState(), getLang()), { trigger: quickCopySbarBtn }),
  }, isEs ? 'Copiar SBAR (Cero PII)' : 'Copy Zero-PII SBAR');

  const leftCol = h('div', { class: 'nsti-col mst-col' }, [
    h('div', { class: 'card nsti-card mst-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? '1. Perfil de Estabilizador del Ánimo' : '1. Mood-Stabilizer Toxin Profile'),
      h('div', { class: 'form-group mst-form-group' }, [
        h('label', { for: 'mst-agent-select', class: 'mst-label' }, isEs ? 'Agente o Síndrome Clínico:' : 'Clinical Agent / Syndrome:'),
        agentSelect,
      ]),
      profileDetailSlot,
    ]),
    h('div', { class: 'card nsti-card mst-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? '2. Peso, Laboratorios, ECG y Días Omitidos' : '2. Weight, Serum Labs, ECG & Titration Gap'),
      h('div', { class: 'form-group mst-form-group' }, [
        h('label', { for: 'mst-weight-input' }, isEs ? 'Peso del Paciente (kg - L-Carnitina y NaHCO3):' : 'Patient Weight (kg - for L-Carnitine & NaHCO3):'),
        weightInput,
      ]),
      h('div', { class: 'form-group mst-form-group' }, [
        h('label', { for: 'mst-lithium-input' }, isEs ? 'Litio Sérico (mEq/L - EXTRIP > 4.0+LRA o > 5.0):' : 'Serum Lithium (mEq/L - EXTRIP > 4.0+AKI or > 5.0):'),
        lithiumInput,
      ]),
      h('div', { class: 'form-group mst-form-group' }, [
        h('label', { for: 'mst-valproate-input' }, isEs ? 'Ácido Valproico Sérico (mg/L - HD > 900+coma o > 1300):' : 'Serum Valproate (mg/L - HD > 900+coma or > 1300):'),
        valproateInput,
      ]),
      h('div', { class: 'form-group mst-form-group' }, [
        h('label', { for: 'mst-ammonia-input' }, isEs ? 'Amonio Sérico (µmol/L - VHE posible con PFH normales):' : 'Serum Ammonia (µmol/L - VHE possible with normal LFTs):'),
        ammoniaInput,
      ]),
      h('div', { class: 'form-group mst-form-group' }, [
        h('label', { for: 'mst-qrs-input' }, isEs ? 'Duración del QRS (ms - NaHCO3 8.4% si > 100 ms):' : 'ECG QRS Duration (ms - 8.4% NaHCO3 if > 100 ms):'),
        qrsInput,
      ]),
      h('div', { class: 'form-group mst-form-group' }, [
        h('label', { for: 'mst-lamotrigine-missed-input' }, isEs ? 'Días Consecutivos sin Lamotrigina (Regla >= 4 días):' : 'Consecutive Days Off Lamotrigine (>= 4-day rule):'),
        daysMissedInput,
      ]),
      h('div', { class: 'decon-checkbox-group mst-status-checks' }, [
        h('label', { for: 'mst-chk-creatinine', class: 'checkbox-row disaster-check-row' }, [
          creatinineCheck,
          h('span', { class: 'disaster-check-label' }, isEs ? 'Lesión Renal Aguda (LRA) / Creatinina Elevada' : 'Impaired Renal Function / Elevated Creatinine (AKI)'),
        ]),
        h('label', { for: 'mst-chk-cns', class: 'checkbox-row disaster-check-row emergency-row' }, [
          cnsCheck,
          h('span', { class: 'disaster-check-label' }, isEs ? 'Deterioro del SNC (Ataxia, Confusión, Coma, Convulsión o Arritmia)' : 'Impaired Consciousness / Cerebellar Ataxia / Seizures / Dysrhythmia'),
        ]),
        h('label', { for: 'mst-chk-ndi', class: 'checkbox-row disaster-check-row' }, [
          ndiCheck,
          h('span', { class: 'disaster-check-label' }, isEs ? 'Diabetes Insípida Nefrogénica (DIN) / Hipernatremia' : 'Nephrogenic Diabetes Insipidus (NDI) / Hypernatremia Present'),
        ]),
      ]),
    ]),
    h('div', { class: 'card nsti-card mst-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? '3. Banderas Rojas Clínicas' : '3. Mood-Stabilizer Clinical Red Flags'),
      h('div', { class: 'decon-checkbox-group mst-flags-group' }, flagCheckboxes.map(({ id, input, flag }) =>
        h('label', {
          for: `mst-${id}`,
          class: `checkbox-row disaster-check-row ${flag.fatal ? 'emergency-row' : ''}`,
        }, [
          input,
          h('span', { class: 'disaster-check-label' }, isEs ? flag.labelEs : flag.label),
        ]),
      )),
    ]),
  ]);

  const rightCol = h('div', { class: 'nsti-col mst-col' }, [
    evaluationOutputSlot,
    directivesOutputSlot,
    h('div', { class: 'card nsti-card mst-card mst-quick-actions-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? 'Acciones Rápidas' : 'Quick Actions'),
      h('div', { class: 'actions nsti-btn-row mst-actions' }, [quickCopySbarBtn, quickResetBtn]),
    ]),
  ]);

  const triagePanel = h('section', {
    id: 'mst-panel-triage',
    role: 'tabpanel',
    'aria-labelledby': 'mst-tab-triage',
    class: 'mst-tabpanel',
  }, [
    h('div', { class: 'nsti-grid mst-grid' }, [leftCol, rightCol]),
  ]);

  // Tab 2: Agent Profiles & Prohibitions
  const profilesPanel = h('section', {
    id: 'mst-panel-profiles',
    role: 'tabpanel',
    'aria-labelledby': 'mst-tab-profiles',
    class: 'mst-tabpanel',
  }, [
    h('div', { class: 'mst-profiles-grid' }, Object.values(MOOD_STABILIZER_PROFILES).map((p) =>
      h('article', { class: 'card nsti-card mst-profile-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? p.nameEs : p.name),
        h('p', {}, [
          h('strong', {}, isEs ? 'Mecanismo y Presentación: ' : 'Mechanism & Clinical Pearls: '),
          isEs ? p.mechanismEs : p.mechanism,
        ]),
        h('p', {}, [
          h('strong', {}, isEs ? 'Protocolo de Primera Línea: ' : 'First-Line Resuscitation: '),
          isEs ? p.firstLineAntidoteEs : p.firstLineAntidote,
        ]),
        h('div', { class: 'callout callout-emergency mst-prohibition-callout' }, [
          h('p', { class: 'callout-title' }, [
            icon('alert'),
            h('span', {}, isEs ? ` ${p.blackBoxContraindicationEs}` : ` ${p.blackBoxContraindication}`),
          ]),
          h('p', {}, isEs ? p.contraindicationDetailEs : p.contraindicationDetail),
        ]),
      ]),
    )),
  ]);

  // Tab 3: EXTRIP HD, L-Carnitine & 4-Day SJS Rule Reference
  const antidotesPanel = h('section', {
    id: 'mst-panel-antidotes',
    role: 'tabpanel',
    'aria-labelledby': 'mst-tab-antidotes',
    class: 'mst-tabpanel',
  }, [
    h('div', { class: 'card nsti-card mst-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? 'Criterios EXTRIP de Hemodiálisis y Dosificación de Antídotos' : 'EXTRIP Hemodialysis Triggers & Antidote Dosing Matrix'),
      h('div', { class: 'table-wrap mst-table-wrap', tabindex: '0', 'aria-label': isEs ? 'Tabla comparativa de antídotos y hemodiálisis EXTRIP' : 'EXTRIP hemodialysis and antidote dosing table' }, [
        h('table', { class: 'schedule-table mst-table' }, [
          h('thead', {}, [
            h('tr', {}, [
              h('th', {}, isEs ? 'Fármaco / Síndrome' : 'Agent / Syndrome'),
              h('th', {}, isEs ? 'Umbrales EXTRIP Hemodiálisis' : 'EXTRIP Hemodialysis Triggers'),
              h('th', {}, isEs ? 'Antídoto / Rescate Específico' : 'Targeted Antidote / Resuscitation'),
              h('th', {}, isEs ? 'Trampa Crítica / Prohibición' : 'Critical Pitfall / Black-Box Rule'),
            ]),
          ]),
          h('tbody', {}, [
            h('tr', {}, [
              h('td', {}, h('strong', {}, isEs ? 'Litio Crónico / Agudo-sobre-Crónico' : 'Chronic / Acute-on-Chronic Lithium')),
              h('td', {}, isEs
                ? 'Recomendada: Li > 4.0 con LRA, > 5.0 siempre, o cualquier coma/convulsión/arritmia. Considerar si >= 2.5 con LRA o > 36h a < 1.0.'
                : 'Recommended: Li > 4.0 with AKI, > 5.0 regardless, or ANY decreased consciousness/seizure/dysrhythmia. Consider at >= 2.5 with slow clearance.'),
              h('td', {}, isEs
                ? 'NaCl 0.9% solo si deshidratado con diuresis conservada; vigilar rebote 6-12h post-HD.'
                : '0.9% NaCl ONLY if euvolemic/dehydrated and renally able; check 6-12h post-HD rebound.'),
              h('td', {}, isEs
                ? 'NO diuréticos de asa/tiazidas, NO Kayexalate (SPS); vigilar Na+ si hay DIN.'
                : 'NO loop/thiazide diuretics, NO Kayexalate (SPS); monitor Na+ carefully in NDI.'),
            ]),
            h('tr', {}, [
              h('td', {}, h('strong', {}, isEs ? 'Litio Agudo (Ingesta Única)' : 'Acute Naive Lithium Overdose')),
              h('td', {}, isEs
                ? 'Recomendada: Li > 4.0 con LRA, > 5.0 siempre, o coma/convulsión/arritmia. Considerar > 4.0 sin LRA.'
                : 'Recommended: Li > 4.0 with AKI, > 5.0 regardless, or decreased consciousness/seizures/dysrhythmia. Consider > 4.0 even with intact kidneys.'),
              h('td', {}, isEs
                ? 'Litio seriado c/4h (retraso SNC 12-24h) + Irrigación Intestinal Total (IIT) en tabletas LP.'
                : 'Serial 4h Li+ levels (12-24h CNS penetration lag) + WBI (PEG-ELS) for sustained-release tablets.'),
              h('td', {}, isEs
                ? 'Carbón activado INEFICAZ; un nivel temprano asintomático NO descarta toxicidad.'
                : 'Activated charcoal INEFFECTIVE; asymptomatic high early level still poses delayed CNS hazard.'),
            ]),
            h('tr', {}, [
              h('td', {}, h('strong', {}, isEs ? 'Ácido Valproico (VHE)' : 'Valproate Toxicity & VHE')),
              h('td', {}, isEs
                ? 'Recomendada: VPA > 1300 mg/L o > 900 mg/L con coma/choque/acidosis. Considerar > 900 mg/L o edema cerebral.'
                : 'Recommended: VPA > 1300 mg/L or > 900 mg/L with coma/shock/acidosis. Consider > 900 mg/L or refractory VHE/cerebral edema.'),
              h('td', {}, isEs
                ? 'L-Carnitina IV: 100 mg/kg carga (máx 6 g) en 30 min, luego 50 mg/kg c/8h (máx 3 g).'
                : 'IV L-Carnitine: 100 mg/kg load (max 6 g) over 30 min, then 50 mg/kg q8h (max 3 g).'),
              h('td', {}, isEs
                ? 'Amonio STAT aun con PFH normales; PROHIBIDOS carbapenémicos (caída VPA 60-100% -> estatus).'
                : 'Order STAT ammonia even with NORMAL LFTs; Carbapenems drop VPA 60-100% -> status epilepticus.'),
            ]),
            h('tr', {}, [
              h('td', {}, h('strong', {}, isEs ? 'Lamotrigina (Cardiotoxicidad y SSJ)' : 'Lamotrigine Cardiotox & SJS/TEN')),
              h('td', {}, isEs
                ? 'Hemodiálisis NO es primera línea; el rescate es alcalinización y emulsión lipídica.'
                : 'Hemodialysis NOT first-line; prioritize Na+ channel blockade rescue and seizure control.'),
              h('td', {}, isEs
                ? 'NaHCO3 8.4% 1-2 mEq/kg IV si QRS > 100 ms + ELI 20% 1.5 mL/kg + benzodiacepinas.'
                : '8.4% NaHCO3 1-2 mEq/kg IV for QRS > 100 ms + 20% ILE 1.5 mL/kg + benzodiazepines.'),
              h('td', {}, isEs
                ? 'Regla 4 días: si pausa >= 4 días, reiniciar desde 25 mg/día (25 mg c/48h con valproato) por riesgo de SSJ/NET.'
                : '4-Day Miss Rule: if >= 4 days off, restart from 25 mg/day (25 mg q48h on valproate) to prevent fatal SJS/TEN.'),
            ]),
          ]),
        ]),
      ]),
    ]),
    h('div', { class: 'mst-rules-grid' }, [
      h('div', { class: 'rule-card mst-rule-card' }, [
        h('h3', {}, isEs ? 'Regla de Reinicio de Lamotrigina (>= 4 Días)' : 'Lamotrigine 4-Day Interruption Restart Rule'),
        h('p', {}, isEs
          ? 'La vida media sin inductores/valproato es ~25-33h. Tras >= 4 días sin dosis (>= 4-5 vidas medias), la tolerancia cutánea se pierde. Reiniciar la dosis plena de mantenimiento dispara SSJ/NET mortal; reiniciar desde 25 mg/día (o 25 mg cada 48h si toma valproato).'
          : 'Elimination half-life averages ~25-33h. Missing >= 4 consecutive days (>= 4-5 half-lives) erases dermatologic desensitization. Restarting full maintenance triggers fatal SJS/TEN; restart strictly from 25 mg/day (25 mg every other day with valproate).'),
      ]),
      h('div', { class: 'rule-card mst-rule-card' }, [
        h('h3', {}, isEs ? 'Trampa de DIN e Hipernatremia en Litio' : 'Lithium NDI & Hypernatremia Fluid Trap'),
        h('p', {}, isEs
          ? 'El litio antagoniza los canales de acuaporina-2 en el túbulo colector (Diabetes Insípida Nefrogénica). Si el paciente pierde agua libre rápidamente, la infusión continua de NaCl 0.9% tras corregir la hipovolemia puede elevar peligrosamente el Na+ sérico. Monitorear Na+ c/2-4h.'
          : 'Lithium downregulates collecting-duct aquaporin-2 (Nephrogenic Diabetes Insipidus). Once volume depletion is corrected, excessive 0.9% NaCl against ongoing free-water polyuria can worsen severe hypernatremia; monitor Na+ q2-4h and adjust tonicity carefully.'),
      ]),
    ]),
  ]);

  // Tab 4: Zero-PII SBAR Panel (persistent textarea without value in h() props)
  const sbarTextarea = h('textarea', {
    id: 'mst-sbar-textarea',
    class: 'input nsti-sbar-textarea mst-sbar-textarea',
    rows: '16',
    readonly: true,
    'aria-label': isEs ? 'Nota clínica SBAR sin datos personales' : 'Zero-PII SBAR clinical handoff summary',
  });
  const initialSbar = formatMoodStabilizerSbarText(initial, lang);
  sbarTextarea.value = initialSbar;
  sbarTextarea.textContent = initialSbar;

  const copySbarEnBtn = h('button', {
    type: 'button',
    class: 'btn btn-primary',
    onclick: () => copyText(formatMoodStabilizerSbarText(getMoodStabilizerToxState(), 'en'), { trigger: copySbarEnBtn }),
  }, isEs ? 'Copiar SBAR (Inglés)' : 'Copy SBAR (English)');

  const copySbarEsBtn = h('button', {
    type: 'button',
    class: 'btn btn-secondary',
    onclick: () => copyText(formatMoodStabilizerSbarText(getMoodStabilizerToxState(), 'es'), { trigger: copySbarEsBtn }),
  }, isEs ? 'Copiar SBAR (Español)' : 'Copy SBAR (Spanish)');

  const sbarResetBtn = h('button', {
    type: 'button',
    class: 'btn btn-ghost',
    onclick: () => resetMoodStabilizerToxState(),
  }, isEs ? 'Reiniciar Formulario' : 'Reset Form');

  const sbarPanel = h('section', {
    id: 'mst-panel-sbar',
    role: 'tabpanel',
    'aria-labelledby': 'mst-tab-sbar',
    class: 'mst-tabpanel',
  }, [
    h('div', { class: 'card nsti-card mst-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? 'Entrega Clínica SBAR (Cero PII en RAM)' : 'Zero-PII SBAR Clinical Handoff (In-RAM Only)'),
      h('p', {}, isEs
        ? 'Resumen estructurado anónimo para Nefrología, UCI, Toxicología o Psiquiatría. No contiene nombres, fechas de nacimiento ni identificadores.'
        : 'De-identified structured handoff for Nephrology, ICU, Toxicology, or Psychiatry. Zero PII, zero cookies, zero persistent device storage.'),
      h('div', { class: 'form-group mst-form-group' }, [
        h('label', { for: 'mst-sbar-textarea' }, isEs ? 'Texto SBAR Listo para Copiar:' : 'Generated SBAR Summary Text:'),
        sbarTextarea,
      ]),
      h('div', { class: 'actions nsti-btn-row mst-actions' }, [copySbarEnBtn, copySbarEsBtn, sbarResetBtn]),
    ]),
  ]);

  const panels = new Map([
    ['triage', triagePanel],
    ['profiles', profilesPanel],
    ['antidotes', antidotesPanel],
    ['sbar', sbarPanel],
  ]);

  root.append(triagePanel, profilesPanel, antidotesPanel, sbarPanel);

  function syncTabs(activeTabId) {
    for (const [id, btn] of tabButtons.entries()) {
      const selected = id === activeTabId;
      btn.setAttribute('aria-selected', String(selected));
      btn.setAttribute('tabindex', selected ? '0' : '-1');
      btn.className = `tab mst-tab${selected ? ' active' : ''}`;
    }
    for (const [id, panel] of panels.entries()) {
      const selected = id === activeTabId;
      panel.hidden = !selected;
      if (selected) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    }
    syncTablists(root);
  }

  function syncControls(state) {
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    if (active !== agentSelect) agentSelect.value = state.agentId;
    if (active !== weightInput) weightInput.value = String(state.weightKg ?? '');
    if (active !== lithiumInput) lithiumInput.value = String(state.lithiumMeq ?? '');
    if (active !== valproateInput) valproateInput.value = String(state.valproateMgL ?? '');
    if (active !== ammoniaInput) ammoniaInput.value = String(state.ammoniaUmolL ?? '');
    if (active !== qrsInput) qrsInput.value = String(state.qrsMs ?? '');
    if (active !== daysMissedInput) daysMissedInput.value = String(state.daysMissedLamotrigine ?? '');
    if (active !== creatinineCheck) creatinineCheck.checked = Boolean(state.creatinineElevated);
    if (active !== cnsCheck) cnsCheck.checked = Boolean(state.cnsImpaired);
    if (active !== ndiCheck) ndiCheck.checked = Boolean(state.ndiPresent);
    for (const item of flagCheckboxes) {
      if (active !== item.input) item.input.checked = state.checkedFlags.has(item.id);
    }
  }

  function renderDynamic() {
    const state = getMoodStabilizerToxState();
    const evaluation = evaluateMoodStabilizerRisk(state);
    const { profile, dosing } = evaluation;

    syncTabs(state.activeTab);
    syncControls(state);

    // Top Black-Box Banner
    clear(blackboxBannerSlot);
    blackboxBannerSlot.append(
      h('div', {
        class: 'clinical-alert-banner movement-blackbox-banner mst-blackbox-banner',
        role: 'region',
        'aria-label': isEs ? 'Alerta negra toxicológica' : 'Toxicology black-box guardrail',
      }, [
        h('div', { class: 'movement-banner-header' }, [
          icon('alert'),
          h('strong', {}, isEs
            ? ` ALERTA NEGRA: ${profile.blackBoxContraindicationEs}`
            : ` BLACK-BOX ALERT: ${profile.blackBoxContraindication}`),
        ]),
        h('p', {}, isEs ? profile.contraindicationDetailEs : profile.contraindicationDetail),
      ]),
    );

    // Selected Profile Details
    clear(profileDetailSlot);
    profileDetailSlot.append(
      h('p', {}, [
        h('strong', {}, isEs ? 'Mecanismo: ' : 'Mechanism: '),
        isEs ? profile.mechanismEs : profile.mechanism,
      ]),
      h('p', {}, [
        h('strong', {}, isEs ? 'Primera Línea: ' : 'First-Line Protocol: '),
        isEs ? profile.firstLineAntidoteEs : profile.firstLineAntidote,
      ]),
    );

    // Evaluation & Dosing Readout Card
    clear(evaluationOutputSlot);
    const hdBadgeClass = dosing.hdRecommendation === 'recommend_hd'
      ? 'badge-danger'
      : dosing.hdRecommendation === 'consider_hd'
        ? 'badge-warning'
        : 'badge-low';

    const hdLabel = dosing.hdRecommendation === 'recommend_hd'
      ? (isEs ? 'HEMODIÁLISIS EXTRIP RECOMENDADA' : 'RECOMMEND EXTRIP HEMODIALYSIS')
      : dosing.hdRecommendation === 'consider_hd'
        ? (isEs ? 'CONSIDERAR HEMODIÁLISIS EXTRIP' : 'CONSIDER EXTRIP HEMODIALYSIS')
        : (isEs ? 'HIDRATACIÓN / ANTÍDOTO SIN HD OBLIGATORIA' : 'SALINE / TARGETED ANTIDOTE (NO MANDATORY HD)');

    const tierCalloutClass = evaluation.riskTier === 'emergency_hemodialysis' || evaluation.riskTier === 'emergency_antidote'
      ? 'callout callout-emergency'
      : evaluation.riskTier === 'urgent_monitoring'
        ? 'callout callout-warn'
        : 'callout callout-info';

    evaluationOutputSlot.append(
      h('div', { class: 'card nsti-card mst-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? '4. Estratificación EXTRIP y Dosis Calculadas' : '4. EXTRIP Stratification & Calculated Antidotes'),
        h('div', { class: `${tierCalloutClass} mst-tier-box` }, [
          h('p', { class: 'callout-title' }, [
            icon('alert'),
            h('span', {}, isEs ? ` ${evaluation.tierLabelEs}` : ` ${evaluation.tierLabelEn}`),
          ]),
          h('p', {}, isEs ? evaluation.tierSummaryEs : evaluation.tierSummaryEn),
        ]),
        h('div', { class: 'decon-directive-box mst-dosing-box' }, [
          h('p', {}, [
            h('strong', {}, isEs ? '• Decisión EXTRIP Hemodiálisis: ' : '• EXTRIP Hemodialysis Status: '),
            h('span', { class: `disaster-badge ${hdBadgeClass}` }, hdLabel),
          ]),
          h('p', {}, isEs ? dosing.hdReasonEs : dosing.hdReasonEn),
          h('p', {}, [
            h('strong', {}, isEs ? '• L-Carnitina IV (Carga 100 mg/kg, máx 6 g): ' : '• IV L-Carnitine Load (100 mg/kg, max 6 g): '),
            h('span', {}, `${dosing.carnitineLoadMg} mg (${dosing.carnitineLoadGrams} g) IV ${isEs ? 'en 30 min' : 'over 30 min'}${dosing.carnitineLoadCapped ? (isEs ? ' [Tope 6 g]' : ' [Capped at 6 g]') : ''}`),
          ]),
          h('p', {}, [
            h('strong', {}, isEs ? '• L-Carnitina IV Mantenimiento (50 mg/kg c/8h, máx 3 g): ' : '• IV L-Carnitine Maint (50 mg/kg q8h, max 3 g): '),
            h('span', {}, `${dosing.carnitineMaintMgQ8h} mg (${dosing.carnitineMaintGramsQ8h} g) IV q8h${dosing.carnitineMaintCapped ? (isEs ? ' [Tope 3 g]' : ' [Capped at 3 g]') : ''}`),
          ]),
          h('p', {}, [
            h('strong', {}, isEs ? '• NaHCO3 8.4% (QRS > 100 ms) y ELI 20%: ' : '• 8.4% NaHCO3 (QRS > 100 ms) & 20% ILE: '),
            h('span', {}, `${dosing.nahco3MinMeq}-${dosing.nahco3MaxMeq} mEq IV ${isEs ? 'bolo (1-2 mEq/kg)' : 'bolus (1-2 mEq/kg)'} | 20% ILE: ${dosing.ileBolusMl} mL (1.5 mL/kg)`),
          ]),
        ]),
      ]),
    );

    // Alerts & Bedside Directives Card
    clear(directivesOutputSlot);
    directivesOutputSlot.append(
      h('div', { class: 'card nsti-card mst-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? '5. Alertas Críticas y Directivas Clínicas' : '5. Critical Alerts & Resuscitation Directives'),
        evaluation.alerts.length > 0
          ? h(
              'div',
              {
                class: 'disaster-alert-box alert-critical mst-alerts-list',
                role: evaluation.riskTier === 'emergency_hemodialysis' || evaluation.riskTier === 'emergency_antidote' ? 'alert' : 'status',
              },
              evaluation.alerts.map((al) =>
                h('div', { class: 'mst-alert-item' }, [
                  h('strong', {}, isEs ? al.titleEs : al.titleEn),
                  h('p', {}, isEs ? al.bodyEs : al.bodyEn),
                ]),
              ),
            )
          : null,
        h('div', { class: 'disaster-action-list mst-actions-list' }, evaluation.actions.map((act) =>
          h('div', { class: 'disaster-action-item' }, [
            h('span', {
              class: `disaster-badge badge-${act.priority === 'stat' ? 'danger' : act.priority === 'urgent' ? 'warning' : 'low'}`,
            }, act.priority.toUpperCase()),
            h('span', {}, isEs ? act.textEs : act.textEn),
          ]),
        )),
      ]),
    );

    // Update SBAR textarea value in-place without unmounting textarea
    const sbarText = formatMoodStabilizerSbarText(state, lang);
    sbarTextarea.value = sbarText;
    sbarTextarea.textContent = sbarText;
  }

  let wasConnected = false;
  const unsubscribe = subscribeMoodStabilizerToxState(() => {
    wasConnected = wasConnected || Boolean(root.isConnected);
    if (wasConnected && root.isConnected === false) {
      unsubscribe();
      return;
    }
    renderDynamic();
  });

  renderDynamic();
  wireTablistKeyboard(root);
  syncTablists(root);
  root._cleanup = unsubscribe;

  if (hostContainer) {
    clear(hostContainer);
    hostContainer.append(root);
  }
  return root;
}

export default moodStabilizerToxView;
