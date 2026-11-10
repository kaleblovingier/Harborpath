// public/js/views/nstiWoundStaging.js
// HarborPath - Complex Wound & Soft Tissue Infection Staging / Necrotizing Soft Tissue Infection (NSTI) Navigator
// Clinical Consensus: Wong et al. LRINEC Score (Crit Care Med 2004), IDSA 2014/2024 Skin & Soft Tissue Guidelines,
// POCUS Soft Tissue (STAFF) Protocol, and AAD/Burn Consensus on Tendon-Sparing Xylazine Ulcer Management.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII, zero cookies.
// Security Invariant: Safe DOM manipulation via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// CLINICAL TAXONOMY & DIAGNOSTIC CONSTANTS
// ============================================================================

export const HARD_SIGNS_NSTI = Object.freeze([
  {
    id: 'crepitus',
    nameEn: 'Subcutaneous Crepitus',
    nameEs: 'Crepitación Subcutánea Palpable',
    descEn: 'Palpable micro-gas bubbles under the skin with audible/tactile crackling. Pathognomonic for gas-forming anaerobic necrosis.',
    descEs: 'Burbujas de microgas palpables bajo la piel con crepitación táctil o audible. Patognomónico de necrosis anaerobia.',
  },
  {
    id: 'bullae',
    nameEn: 'Hemorrhagic / Violaceous Bullae',
    nameEs: 'Flictenas / Ampollas Hemorrágicas o Violáceas',
    descEn: 'Large fluid-filled blisters with dark purple, bloody, or serosanguinous fluid indicating dermal vascular plexus thrombosis.',
    descEs: 'Grandes ampollas con líquido violáceo oscuro o hemático que indican trombosis del plexo microvascular dérmico.',
  },
  {
    id: 'skin_necrosis',
    nameEn: 'Skin Necrosis, Ecchymosis & Frank Gangrene',
    nameEs: 'Necrosis Cutánea, Equimosis y Gangrena Franca',
    descEn: 'Mottled, non-blanching, black, leathery, or purplish devitalized tissue representing full-thickness cutaneous infarction.',
    descEs: 'Tejido desvitalizado negruzco, acartonado o marmóreo que no palidece, signo de infarto cutáneo transmural.',
  },
  {
    id: 'dishwater_pus',
    nameEn: '"Dishwater Pus" / Murky Exudate',
    nameEs: 'Supuración en «Agua de Fregar» (Dishwater Pus)',
    descEn: 'Thin, gray-brown, malodorous, watery transudate draining from wounds caused by liquefactive fat and fascial necrosis.',
    descEs: 'Líquido acuoso fétido gris-marrón sin pus espeso debido a licuefacción bacteriana de grasa y fascia profunda.',
  },
  {
    id: 'imaging_gas',
    nameEn: 'Soft Tissue Gas on Plain Film, CT, or POCUS',
    nameEs: 'Gas en Tejidos Blandos por Radiografía, TC o Ecografía',
    descEn: 'Linear or branched gas lucencies tracking along deep fascial planes with dirty acoustic shadowing on ultrasound.',
    descEs: 'Radiolucencias o sombras sucias ecográficas que disecan los planos fasciales profundos.',
  },
  {
    id: 'anesthesia',
    nameEn: 'Cutaneous Anesthesia / Focal Hypoesthesia',
    nameEs: 'Anestesia Cutánea / Pérdida Focal de Sensibilidad',
    descEn: 'Sudden loss of pain or sensation over erythematous skin, caused by thrombotic destruction of cutaneous sensory nerves.',
    descEs: 'Pérdida súbita del dolor en la piel eritematosa debido a necrosis isquémica de los nervios sensitivos dérmicos.',
  },
]);

export const SOFT_SIGNS_NSTI = Object.freeze([
  {
    id: 'pain_out_of_proportion',
    nameEn: 'Severe Pain Out of Proportion to Exam',
    nameEs: 'Dolor Severo Desproporcionado a la Exploración',
    descEn: 'Excruciating, deep, tearing pain extending beyond visible erythema. The single earliest warning sign of deep fascial ischemia.',
    descEs: 'Dolor lacerante insoportable que desborda el eritema visible. El signo de alerta precoz más fiable de isquemia fascial.',
  },
  {
    id: 'rapid_advancement',
    nameEn: 'Rapid Advancement (>1 cm/hour across borders)',
    nameEs: 'Avance Rápido del Eritema (>1 cm/hora sobre bordes marcados)',
    descEn: 'Erythema, swelling, or induration actively advancing across demarcated ink margins by centimeters per hour.',
    descEs: 'El enrojecimiento y edema sobrepasan las marcas de tinta en la piel en cuestión de una o dos horas.',
  },
  {
    id: 'woody_edema',
    nameEn: '"Woody" Hard, Non-Pitting Induration',
    nameEs: 'Edema Indurado «Leñoso» no Depresible',
    descEn: 'Subcutaneous tissues feel dense, tense, and board-like, extending far beyond the visible margins of skin erythema.',
    descEs: 'Tejido celular subcutáneo con consistencia pétrea o acartonada que desborda el eritema cutáneo superficial.',
  },
  {
    id: 'systemic_toxicity',
    nameEn: 'Disproportionate Systemic Toxicity / Sepsis',
    nameEs: 'Toxicidad Sistémica Desproporcionada / Sepsis',
    descEn: 'Tachycardia (HR >100), tachypnea (RR >22), hypotension (MAP <65), or hypothermia/fever disproportionate to skin appearance.',
    descEs: 'Taquicardia, taquipnea, hipotensión o alteración del estado mental desproporcionados a la apariencia superficial.',
  },
  {
    id: 'antibiotic_failure',
    nameEn: 'Progression Despite 12-24h Standard IV Antibiotics',
    nameEs: 'Progresión tras 12-24h de Antibióticos IV Estándar',
    descEn: 'Worsening pain, expanding erythema, or rising inflammatory markers despite therapeutic cefazolin or vancomycin.',
    descEs: 'Empeoramiento clínico local o analítico a pesar de cobertura antibiótica hospitalaria para celulitis ordinaria.',
  },
]);

export const POCUS_DIFFERENTIALS = Object.freeze({
  cellulitis: {
    id: 'cellulitis',
    nameEn: 'Cellulitis ("Cobblestoning")',
    nameEs: 'Celulitis («Empedrado» / Cobblestoning)',
    findingsEn: 'Anechoic/hypoechoic fluid channels interdigitating between hyperechoic subcutaneous fat globules. No discrete drainable fluid collection.',
    findingsEs: 'Canales de líquido anecoico que disecan entre los lobulillos grasos hiperecoicos en forma de empedrado. Sin cavidad fluctuante.',
    managementEn: 'Medical management with IV/oral antibiotics; surgical incision and drainage is not indicated.',
    managementEs: 'Tratamiento médico con antibióticos. La incisión y drenaje está contraindicada.',
  },
  abscess: {
    id: 'abscess',
    nameEn: 'Subcutaneous Abscess (Drainable Fluid Pocket)',
    nameEs: 'Absceso Subcutáneo (Colección Drenable)',
    findingsEn: 'Well-circumscribed hypoechoic or mixed-echogenicity fluid pocket with posterior acoustic enhancement, peripheral hypervascular rim, and "squish sign" (swirling debris on gentle compression).',
    findingsEs: 'Colección anecoica/hipoecoica delimitada con refuerzo acústico posterior, borde hipervascular y remolino de pus al comprimir («signo del squish»).',
    managementEn: 'Bedside incision and drainage (I&D), culture of purulence, packing with non-adherent gauze, and targeted antibiotics.',
    managementEs: 'Incisión y drenaje (I&D), cultivo, mecha de gasa no adherente y antibióticos dirigidos.',
  },
  nsti_staff: {
    id: 'nsti_staff',
    nameEn: 'Necrotizing Fasciitis (STAFF Ultrasound Criteria)',
    nameEs: 'Fascitis Necrosante (Criterios Ecográficos STAFF)',
    findingsEn: 'STAFF Mnemonic: Subcutaneous Thickening, Air (subcutaneous gas reflectors with "dirty acoustic shadowing" and comet-tails), and Fluid layer >=2-4 mm tracking continuously along deep Fascial planes.',
    findingsEs: 'Mnemotecnia STAFF: Subcutaneous Thickening (engrosamiento subcutáneo), Air (gas con sombra sucia), Fluid (lámina líquida >=2-4 mm que diseca la Fascia profunda).',
    managementEn: 'IMMEDIATE OPERATING ROOM MOBILIZATION FOR SURGICAL DEBRIDEMENT. Zero delay for additional imaging or lab tests.',
    managementEs: 'TRASLADO QUIRÚRGICO INMEDIATO PARA DESBRIDAMIENTO. Prohibido retrasar por analíticas o pruebas adicionales.',
  },
});

export const XYLAZINE_ULCER_STAGES = Object.freeze([
  {
    stage: 1,
    nameEn: 'Stage 1: Superficial Violaceous Erythema / Bullae',
    nameEs: 'Estadio 1: Eritema Violáceo Superficial / Flictenas',
    characteristicsEn: 'Intact skin with non-blanching dark violaceous or dusky patches; superficial vesicles/bullae filled with serous fluid; dermis intact beneath blister roof.',
    characteristicsEs: 'Piel intacta con placas violáceas oscuras que no palidecen; flictenas superficiales con líquido seroso; dermis íntegra.',
    protocolEn: 'Leave blister roofs intact if possible; protect with non-adherent silicone dressing; oral clonidine for alpha-2 withdrawal vasoconstriction.',
    protocolEs: 'Mantener el techo de la ampolla; apósito de silicona no adherente; clonidina oral para la vasoconstricción por abstinencia alfa-2.',
  },
  {
    stage: 2,
    nameEn: 'Stage 2: Partial-Thickness Dermal Loss ("Punched-Out")',
    nameEs: 'Estadio 2: Pérdida Dérmica Parcial («Sacabocados»)',
    characteristicsEn: 'Loss of epidermis exposing superficial-to-mid dermis; shallow "punched-out" crater with stringy yellow/gray fibrinous base; sharp non-undermined wound margins.',
    characteristicsEs: 'Pérdida epidérmica con exposición dérmica; cráter poco profundo en sacabocados con base fibrinosa amarillenta y bordes netos.',
    protocolEn: 'Gentle low-pressure saline irrigation (no hydrogen peroxide/Betadine); hydrogel or medical honey to promote autolysis; barrier cream around periwound.',
    protocolEs: 'Lavado suave con suero salino a baja presión (sin agua oxigenada ni Betadine); hidrogel o miel médica para autólisis; crema barrera perilesional.',
  },
  {
    stage: 3,
    nameEn: 'Stage 3: Full-Thickness Subcutaneous Loss with Adherent Eschar',
    nameEs: 'Estadio 3: Pérdida Subcutánea Completa con Escara Adherente',
    characteristicsEn: 'Full-thickness skin loss extending through dermis into subcutaneous fat; covered by thick, leathery, adherent black/brown necrotic eschar; surrounded by violaceous inflammatory rim.',
    characteristicsEs: 'Pérdida transmural hasta tejido adiposo subcutáneo; cubierta por escara necrótica dura negruzca adherente con halo inflamatorio violáceo.',
    protocolEn: 'CRITICAL INVARIANT: Aggressive sharp surgical excision is CONTRAINDICATED (causes tissue conversion and necrosis). Apply enzymatic collagenase (Santyl) with cross-hatching or saturated hydrogel for autolytic debridement.',
    protocolEs: 'REGLA ESTRICTA: El desbridamiento quirúrgico cortante agresivo está CONTRAINDICADO (provoca necrosis secundaria). Aplicar colagenasa enzimática (Santyl) con escarificación o hidrogel saturado para autólisis.',
  },
  {
    stage: 4,
    nameEn: 'Stage 4: Deep Cavitating Ulcer with Exposed Tendon / Bone',
    nameEs: 'Estadio 4: Úlcera Cavitaria Profunda con Tendón o Hueso Expuesto',
    characteristicsEn: 'Deep destruction extending through deep fascia into muscle, tendons, joint capsules, or periosteum; glistening white or desiccating extensor/flexor tendons visibly exposed.',
    characteristicsEs: 'Destrucción tisular que atraviesa la fascia profunda exponiendo tendones extensores/flexores, cápsulas articulares o hueso perióstico.',
    protocolEn: 'TENDON-SPARING MANDATE: Exposed tendons MUST NEVER DESICCATE. Maintain continuous saturated moisture using petrolatum gauze (Adaptic/Xeroform) or amorphous hydrogel. Splint extremity in neutral function position. Sharp tendon debridement strictly prohibited.',
    protocolEs: 'MANDATO DE PRESERVACIÓN TENDINOSA: Los tendones expuestos NUNCA DEBEN SECARSE. Mantener humedad continua con gasa parafinada (Adaptic/Xeroform) o hidrogel. Férula en posición funcional. Desbridamiento cortante de tendón estrictamente prohibido.',
  },
]);

// ============================================================================
// LRINEC SCORING ALGORITHM & CLINICAL EVALUATION ENGINE
// ============================================================================

/**
 * Calculates the Laboratory Risk Indicator for Necrotizing Fasciitis (LRINEC) score.
 * @param {Object} labs
 * @param {number} [labs.crp=0] - C-reactive protein (mg/L)
 * @param {number} [labs.wbc=10] - White blood cell count (x10^3/uL)
 * @param {number} [labs.hemoglobin=14] - Hemoglobin (g/dL)
 * @param {number} [labs.sodium=138] - Serum sodium (mmol/L)
 * @param {number} [labs.creatinine=1.0] - Serum creatinine (mg/dL)
 * @param {number} [labs.glucose=110] - Blood glucose (mg/dL)
 * @returns {Object} LRINEC points breakdown and total score
 */
export function calculateLrinecScore(labs = {}) {
  const crp = Number(labs.crp) || 0;
  const wbc = Number(labs.wbc) || 0;
  const hb = Number(labs.hemoglobin) || 0;
  const na = Number(labs.sodium) || 0;
  const cr = Number(labs.creatinine) || 0;
  const glu = Number(labs.glucose) || 0;

  let crpPts = 0;
  if (crp >= 150) crpPts = 4;

  let wbcPts = 0;
  if (wbc > 25) wbcPts = 2;
  else if (wbc >= 15) wbcPts = 1;

  let hbPts = 0;
  if (hb > 0 && hb < 11.0) hbPts = 2;
  else if (hb >= 11.0 && hb <= 13.5) hbPts = 1;

  let naPts = 0;
  if (na > 0 && na < 135) naPts = 2;

  let crPts = 0;
  if (cr > 1.6) crPts = 2;

  let gluPts = 0;
  if (glu > 180) gluPts = 1;

  const totalScore = crpPts + wbcPts + hbPts + naPts + crPts + gluPts;

  let riskTier = 'low';
  let riskTierEn = 'Low Risk (<50% probability)';
  let riskTierEs = 'Riesgo Bajo (<50% probabilidad)';
  let actionEn = 'LRINEC <6: Lower probability, BUT cannot rule out NSTI if clinical soft/hard signs exist (false-negative rate up to 30%). Continue serial monitored exams.';
  let actionEs = 'LRINEC <6: Menor probabilidad, PERO no descarta fascitis si hay signos clínicos (falsos negativos hasta 30%). Mantener reevaluación seriada.';

  if (totalScore >= 8) {
    riskTier = 'high';
    riskTierEn = 'High Risk (>=75% probability, PPV 92%)';
    riskTierEs = 'Riesgo Alto (>=75% probabilidad, VPP 92%)';
    actionEn = 'STRONGLY PREDICTIVE OF NECROTIZING FASCIITIS. Immediate surgical consultation for operative exploration and emergent debridement.';
    actionEs = 'ALTA PROBABILIDAD DE FASCITIS NECROSANTE. Consulta quirúrgica inmediata para exploración en quirófano y desbridamiento urgente.';
  } else if (totalScore >= 6) {
    riskTier = 'moderate';
    riskTierEn = 'Moderate Risk (50-75% probability)';
    riskTierEs = 'Riesgo Moderado (50-75% probabilidad)';
    actionEn = 'SUSPICIOUS FOR NSTI. Urgent surgical evaluation, broad-spectrum IV antibiotics (Vancomycin + Pip/Tazo + Clindamycin), and bedside POCUS.';
    actionEs = 'SOSPECHA ELEVADA DE FASCITIS. Evaluación quirúrgica urgente, antibióticos IV de amplio espectro (Vancomicina + Pip/Tazo + Clindamicina) y ecografía a pie de cama.';
  }

  return {
    crp,
    wbc,
    hb,
    na,
    cr,
    glu,
    crpPts,
    wbcPts,
    hbPts,
    naPts,
    crPts,
    gluPts,
    totalScore,
    riskTier,
    riskTierEn,
    riskTierEs,
    actionEn,
    actionEs,
  };
}

/**
 * Pure evaluation function for soft tissue wound acuity, NSTI signs, POCUS, and xylazine staging.
 * @param {Object} input
 * @param {Array<string>} [input.hardSigns=[]] - Checked IDs from HARD_SIGNS_NSTI
 * @param {Array<string>} [input.softSigns=[]] - Checked IDs from SOFT_SIGNS_NSTI
 * @param {string} [input.pocusCategory='cellulitis'] - Key from POCUS_DIFFERENTIALS
 * @param {Object} [input.labs={}] - Labs passed to calculateLrinecScore
 * @param {boolean} [input.isXylazineWound=false] - Xylazine necrotic ulcer present
 * @param {number} [input.xylazineStage=2] - 1 to 4
 * @returns {Object} Comprehensive evaluation output with clinical directives
 */
export function evaluateNstiWoundRisk(input = {}) {
  const hardSigns = Array.isArray(input.hardSigns) ? input.hardSigns : [];
  const softSigns = Array.isArray(input.softSigns) ? input.softSigns : [];
  const pocusCategory = POCUS_DIFFERENTIALS[input.pocusCategory] ? input.pocusCategory : 'cellulitis';
  const pocus = POCUS_DIFFERENTIALS[pocusCategory];
  const lrinec = calculateLrinecScore(input.labs || {});
  const isXylazine = Boolean(input.isXylazineWound);
  const xylazineStage = Math.max(1, Math.min(4, Number(input.xylazineStage) || 2));
  const xylazineProfile = XYLAZINE_ULCER_STAGES.find((s) => s.stage === xylazineStage) || XYLAZINE_ULCER_STAGES[1];

  const hasHardSigns = hardSigns.length > 0;
  const hasSoftSigns = softSigns.length > 0;
  const isPocusNsti = pocusCategory === 'nsti_staff';

  const isEmergentSurge = hasHardSigns || isPocusNsti;
  const isUrgentSurgical = !isEmergentSurge && (lrinec.totalScore >= 6 || hasSoftSigns);

  let triageLevel = 'routine';
  let triageTitleEn = 'Routine / Outpatient Wound Management';
  let triageTitleEs = 'Manejo de Heridas de Rutina / Ambulatorio';

  if (isEmergentSurge) {
    triageLevel = 'emergent_or';
    triageTitleEn = 'EMERGENT OPERATING ROOM MOBILIZATION (Immediate Debridement Mandate)';
    triageTitleEs = 'MOVILIZACIÓN QUIRÚRGICA DE EMERGENCIA (Mandato de Desbridamiento Inmediato)';
  } else if (isUrgentSurgical) {
    triageLevel = 'urgent_surgical_eval';
    triageTitleEn = 'URGENT SURGICAL EVALUATION & INPATIENT BEDSIDE TRIAGE';
    triageTitleEs = 'EVALUACIÓN QUIRÚRGICA URGENTE Y TRIAJE HOSPITALARIO';
  }

  // Antimicrobial recommendation
  const empiricAbxEn = isEmergentSurge || isUrgentSurgical
    ? 'Empiric Triple Coverage: Vancomycin (25-30 mg/kg IV loading) + Piperacillin-Tazobactam (4.5g IV q6h or Meropenem 1g IV q8h) + Clindamycin (900 mg IV q8h to inhibit streptococcal/staphylococcal toxin protein synthesis).'
    : 'Localized wound cleansing; oral antibiotics (Cephalexin or TMP-SMX for MRSA) only if systemic cellulitis spreading.';

  const empiricAbxEs = isEmergentSurge || isUrgentSurgical
    ? 'Triple Terapia Empírica: Vancomicina (dosis de carga 25-30 mg/kg IV) + Piperacilina-Tazobactam (4,5g IV c/6h o Meropenem 1g IV c/8h) + Clindamicina (900 mg IV c/8h para frenar la síntesis de exotoxinas bacterianas).'
    : 'Limpieza local con suero; antibióticos orales (Cefalexina o TMP-SMX para cobertura de SAMR) solo si hay celulitis expansiva.';

  // Tendon preservation advisory
  const tendonAdvisoryEn = isXylazine && xylazineStage === 4
    ? 'CRITICAL TENDON PRESERVATION MANDATE: Extensor/flexor tendons exposed. Keep continuously saturated with sterile hydrogel or petrolatum gauze (Adaptic/Xeroform). Desiccation causes irreversible necrosis and rupture within 24-48 hours. Radical surgical debridement strictly contraindicated.'
    : null;

  const tendonAdvisoryEs = isXylazine && xylazineStage === 4
    ? 'MANDATO CRÍTICO DE PRESERVACIÓN TENDINOSA: Tendones extensores/flexores expuestos. Mantener saturados de humedad continuamente con hidrogel o gasa parafinada. La sequedad causa necrosis y rotura en 24-48h. El desbridamiento quirúrgico radical está contraindicado.'
    : null;

  // SBAR Clinical Handoff Note
  const hardSignNames = hardSigns.map((id) => HARD_SIGNS_NSTI.find((s) => s.id === id)?.nameEn).filter(Boolean);
  const softSignNames = softSigns.map((id) => SOFT_SIGNS_NSTI.find((s) => s.id === id)?.nameEn).filter(Boolean);

  const sbarEn = [
    `[S] SITUATION: Patient presenting with high-acuity soft tissue infection. Triage Status: ${triageTitleEn}.`,
    `[B] BACKGROUND: POCUS Finding: ${pocus.nameEn}. Xylazine Involvement: ${isXylazine ? `Yes, ${xylazineProfile.nameEn}` : 'No'}.`,
    `[A] ASSESSMENT: LRINEC Score: ${lrinec.totalScore}/13 (${lrinec.riskTierEn}).`,
    `  • Hard Signs (${hardSigns.length}): ${hardSignNames.length ? hardSignNames.join(', ') : 'None'}.`,
    `  • Soft Signs (${softSigns.length}): ${softSignNames.length ? softSignNames.join(', ') : 'None'}.`,
    `  • POCUS Details: ${pocus.findingsEn}`,
    `  • Antibiotic Recommendation: ${empiricAbxEn}`,
    ...(tendonAdvisoryEn ? [`  • Tendon Protection: ${tendonAdvisoryEn}`] : []),
    `[R] RECOMMENDATION: ${isEmergentSurge ? 'STAT Emergent Surgical Debridement in the Operating Room. Zero delay for imaging or further labs.' : isUrgentSurgical ? 'Urgent surgical consult, admission to monitored unit, broad-spectrum IV antibiotics, and serial hourly exams.' : 'Outpatient local wound care with non-adherent dressings and oral follow-up.'}`,
  ].join('\n');

  const sbarEs = [
    `[S] SITUACIÓN: Paciente con infección de partes blandas de alta agudeza. Nivel de Triaje: ${triageTitleEs}.`,
    `[B] ANTECEDENTES: Hallazgo POCUS: ${pocus.nameEs}. Presencia de Xilacina: ${isXylazine ? `Sí, ${xylazineProfile.nameEs}` : 'No'}.`,
    `[A] EVALUACIÓN: Puntuación LRINEC: ${lrinec.totalScore}/13 (${lrinec.riskTierEs}).`,
    `  • Signos Duros (${hardSigns.length}): ${hardSigns.length ? hardSigns.join(', ') : 'Ninguno'}.`,
    `  • Signos Blandos (${softSigns.length}): ${softSigns.length ? softSigns.join(', ') : 'Ninguno'}.`,
    `  • Detalles POCUS: ${pocus.findingsEs}`,
    `  • Terapia Antibiótica: ${empiricAbxEs}`,
    ...(tendonAdvisoryEs ? [`  • Preservación Tendinosa: ${tendonAdvisoryEs}`] : []),
    `[R] RECOMENDACIÓN: ${isEmergentSurge ? 'Desbridamiento quirúrgico emergente INMEDIATO en quirófano. Prohibido retrasar por pruebas complementarias.' : isUrgentSurgical ? 'Interconsulta urgente con cirugía, ingreso en unidad monitorizada, antibióticos IV y reevaluación seriada.' : 'Cuidado local ambulatorio con apósitos no adherentes y seguimiento clínico.'}`,
  ].join('\n');

  return {
    hardSigns,
    softSigns,
    pocusCategory,
    pocus,
    lrinec,
    isXylazine,
    xylazineStage,
    xylazineProfile,
    isEmergentSurge,
    isUrgentSurgical,
    triageLevel,
    triageTitleEn,
    triageTitleEs,
    empiricAbxEn,
    empiricAbxEs,
    tendonAdvisoryEn,
    tendonAdvisoryEs,
    sbarEn,
    sbarEs,
  };
}

// ============================================================================
// EPHEMERAL IN-RAM STATE & VIEW CONTROLLER
// ============================================================================

const woundState = {
  hardSigns: ['crepitus'],
  softSigns: ['pain_out_of_proportion', 'rapid_advancement'],
  pocusCategory: 'nsti_staff',
  crp: 165,
  wbc: 18.5,
  hemoglobin: 10.4,
  sodium: 131,
  creatinine: 1.8,
  glucose: 195,
  isXylazineWound: true,
  xylazineStage: 3,
  copied: false,
};

const listeners = new Set();
function notifyState() {
  for (const fn of listeners) fn();
}

export function getNstiState() {
  return { ...woundState, hardSigns: [...woundState.hardSigns], softSigns: [...woundState.softSigns] };
}

export function setNstiState(patch) {
  Object.assign(woundState, patch);
  notifyState();
}

export function resetNstiState() {
  Object.assign(woundState, {
    hardSigns: ['crepitus'],
    softSigns: ['pain_out_of_proportion', 'rapid_advancement'],
    pocusCategory: 'nsti_staff',
    crp: 165,
    wbc: 18.5,
    hemoglobin: 10.4,
    sodium: 131,
    creatinine: 1.8,
    glucose: 195,
    isXylazineWound: true,
    xylazineStage: 3,
    copied: false,
  });
  notifyState();
}

export function subscribeNstiState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// DOM VIEW IMPLEMENTATION (ZERO INNERHTML / ZERO INLINE STYLES)
// ============================================================================

export function nstiWoundStagingView() {
  const container = h('div', { class: 'nsti-staging-view', role: 'region', 'aria-label': 'Complex Wound & NSTI LRINEC / POCUS Navigator' });
  const isEs = getLang() === 'es';

  // Static Header
  container.append(
    pageHeader(
      isEs ? 'Navegador de Infecciones Graves de Partes Blandas, Fascitis Necrosante (LRINEC), POCUS y Xilacina' : 'Complex Wound & Necrotizing Soft Tissue Infection (NSTI) LRINEC & POCUS Navigator',
      isEs ? 'Herramienta clínica de estratificación para diferenciar celulitis, absceso drenable y fascitis necrosante mediante signos duros, criterios ecográficos STAFF, puntuación LRINEC y protocolo de preservación tendinosa en úlceras por xilacina.' : 'Clinical decision support to differentiate cellulitis, drainable abscess, and emergent necrotizing fasciitis using hard physical signs, STAFF ultrasound criteria, LRINEC laboratory scoring, and tendon-sparing xylazine ulcer staging.'
    )
  );

  const emergentBannerSlot = h('div');
  const grid = h('div', { class: 'nsti-grid' });
  const leftCol = h('div', { class: 'nsti-col' });
  const rightCol = h('div', { class: 'nsti-col' });
  grid.append(leftCol, rightCol);
  container.append(emergentBannerSlot, grid);

  // Left Col: Hard signs, Soft signs, POCUS (persistent checkboxes/select)
  const hardCard = h('div', { class: 'card nsti-card' },
    h('h2', { class: 'nsti-card-title text-danger' },
      icon('alert-octagon'),
      isEs ? '1. Signos Duros de Necrosis (Quirófano Inmediato)' : '1. Hard Signs of Necrosis (Immediate OR)'
    ),
    h('p', { class: 'text-sm text-muted' },
      isEs ? 'La presencia de UN SOLO signo duro exige traslado quirúrgico inmediato sin esperar analíticas.' : 'Presence of ANY SINGLE hard sign mandates emergent surgical consultation without waiting for labs.'
    )
  );
  const hardCheckRows = HARD_SIGNS_NSTI.map((sign) => {
    const isChecked = woundState.hardSigns.includes(sign.id);
    const checkbox = h('input', {
      type: 'checkbox',
      id: `hard-${sign.id}`,
      checked: isChecked,
      'aria-label': isEs ? sign.nameEs : sign.nameEn,
    });
    checkbox.addEventListener('change', (e) => {
      const next = new Set(woundState.hardSigns);
      if (e.target.checked) next.add(sign.id);
      else next.delete(sign.id);
      setNstiState({ hardSigns: Array.from(next) });
    });
    const row = h('div', { class: `nsti-check-row ${isChecked ? 'active-hard' : ''}` },
      checkbox,
      h('label', { for: `hard-${sign.id}`, class: 'nsti-check-label' },
        h('strong', null, isEs ? sign.nameEs : sign.nameEn),
        h('span', { class: 'nsti-check-desc' }, isEs ? sign.descEs : sign.descEn)
      )
    );
    hardCard.append(row);
    return { id: sign.id, checkbox, row };
  });
  leftCol.append(hardCard);

  const softCard = h('div', { class: 'card nsti-card' },
    h('h2', { class: 'nsti-card-title text-warning' },
      icon('alert-circle'),
      isEs ? '2. Signos Blandos de Alerta Temprana' : '2. Soft Signs of Early Deep Tissue Threat'
    ),
    h('p', { class: 'text-sm text-muted' },
      isEs ? 'Signos clínicos de alta sospecha que exigen vigilancia intensiva y cálculo de LRINEC.' : 'High-suspicion signs requiring intensive monitoring and laboratory LRINEC calculation.'
    )
  );
  const softCheckRows = SOFT_SIGNS_NSTI.map((sign) => {
    const isChecked = woundState.softSigns.includes(sign.id);
    const checkbox = h('input', {
      type: 'checkbox',
      id: `soft-${sign.id}`,
      checked: isChecked,
      'aria-label': isEs ? sign.nameEs : sign.nameEn,
    });
    checkbox.addEventListener('change', (e) => {
      const next = new Set(woundState.softSigns);
      if (e.target.checked) next.add(sign.id);
      else next.delete(sign.id);
      setNstiState({ softSigns: Array.from(next) });
    });
    const row = h('div', { class: `nsti-check-row ${isChecked ? 'active-soft' : ''}` },
      checkbox,
      h('label', { for: `soft-${sign.id}`, class: 'nsti-check-label' },
        h('strong', null, isEs ? sign.nameEs : sign.nameEn),
        h('span', { class: 'nsti-check-desc' }, isEs ? sign.descEs : sign.descEn)
      )
    );
    softCard.append(row);
    return { id: sign.id, checkbox, row };
  });
  leftCol.append(softCard);

  const pocusSelect = h('select', { class: 'nsti-select', 'aria-label': isEs ? 'Hallazgo POCUS' : 'POCUS Finding' },
    Object.keys(POCUS_DIFFERENTIALS).map((k) =>
      h('option', { value: k, selected: woundState.pocusCategory === k }, isEs ? POCUS_DIFFERENTIALS[k].nameEs : POCUS_DIFFERENTIALS[k].nameEn)
    )
  );
  pocusSelect.addEventListener('change', (e) => setNstiState({ pocusCategory: e.target.value }));
  const pocusDescSlot = h('div', { class: 'nsti-pocus-details' });
  leftCol.append(
    h('div', { class: 'card nsti-card' },
      h('h2', { class: 'nsti-card-title' },
        icon('activity'),
        isEs ? '3. Ecografía a Pie de Cama (POCUS / STAFF)' : '3. Point-of-Care Ultrasound (POCUS / STAFF)'
      ),
      h('p', { class: 'text-sm text-muted' },
        isEs ? 'Seleccione los hallazgos con sonda lineal de alta frecuencia (7.5-15 MHz):' : 'Select bedside high-frequency linear transducer ultrasound findings:'
      ),
      pocusSelect,
      pocusDescSlot
    )
  );

  // Right Col: LRINEC Calculator (persistent 6 numeric inputs + dynamic pts badges)
  const lrinecBadgeEl = h('span', { class: 'nsti-badge' });
  const lrinecActionEl = h('p', { class: 'text-sm text-muted' });

  function makeLabRow(key, labelTxt, val, min, max, ptsKey) {
    const input = h('input', {
      type: 'number',
      class: 'nsti-num-input',
      value: String(val),
      min: String(min),
      max: String(max),
      step: 'any',
      'aria-label': labelTxt,
    });
    input.addEventListener('input', (e) => {
      setNstiState({ [key]: Number(e.target.value) || 0 });
    });
    const ptsBadge = h('span', { class: 'nsti-pts-badge' }, '+0 pts');
    const row = h('div', { class: 'nsti-lab-row' },
      h('label', { class: 'nsti-lab-label' }, labelTxt),
      input,
      ptsBadge
    );
    return { key, ptsKey, input, ptsBadge, row };
  }

  const labRows = [
    makeLabRow('crp', isEs ? 'Proteína C Reactiva (mg/L):' : 'C-Reactive Protein (CRP, mg/L):', woundState.crp, 0, 500, 'crpPts'),
    makeLabRow('wbc', isEs ? 'Leucocitos (x10³/µL):' : 'WBC Count (x10³/µL):', woundState.wbc, 0, 100, 'wbcPts'),
    makeLabRow('hemoglobin', isEs ? 'Hemoglobina (g/dL):' : 'Hemoglobin (g/dL):', woundState.hemoglobin, 0, 25, 'hbPts'),
    makeLabRow('sodium', isEs ? 'Sodio Sérico (mmol/L):' : 'Serum Sodium (mmol/L):', woundState.sodium, 100, 180, 'naPts'),
    makeLabRow('creatinine', isEs ? 'Creatinina Sérica (mg/dL):' : 'Serum Creatinine (mg/dL):', woundState.creatinine, 0, 15, 'crPts'),
    makeLabRow('glucose', isEs ? 'Glucemia (mg/dL):' : 'Blood Glucose (mg/dL):', woundState.glucose, 0, 1000, 'gluPts'),
  ];

  const lrinecCard = h('div', { class: 'card nsti-card' },
    h('div', { class: 'nsti-card-header-flex' },
      h('h2', { class: 'nsti-card-title' },
        icon('clipboard'),
        isEs ? '4. Calculadora de Puntuación LRINEC' : '4. LRINEC Score Calculator'
      ),
      lrinecBadgeEl
    ),
    lrinecActionEl,
    h('div', { class: 'nsti-lab-inputs' }, ...labRows.map((r) => r.row))
  );

  // Xylazine card (checkbox persistent, stage selector/info dynamic)
  const xylCheck = h('input', {
    type: 'checkbox',
    id: 'is-xylazine',
    checked: woundState.isXylazineWound,
    'aria-label': isEs ? 'Herida por consumo de xilacina' : 'Xylazine-associated wound',
  });
  xylCheck.addEventListener('change', (e) => setNstiState({ isXylazineWound: e.target.checked }));
  const xylDynamicSlot = h('div');
  const xylazineCard = h('div', { class: 'card nsti-card' },
    h('h2', { class: 'nsti-card-title' },
      icon('shield'),
      isEs ? '5. Úlcera por Xilacina («Tranq») y Preservación Tendinosa' : '5. Xylazine ("Tranq") Ulcer Staging & Tendon Protection'
    ),
    h('div', { class: 'nsti-check-row' },
      xylCheck,
      h('label', { for: 'is-xylazine' },
        h('strong', null, isEs ? '¿Úlcera inducida o complicada por xilacina?' : 'Xylazine-associated necrotic wound present?')
      )
    ),
    xylDynamicSlot
  );

  const sbarCardSlot = h('div');
  rightCol.append(lrinecCard, xylazineCard, sbarCardSlot);

  function syncControls() {
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    hardCheckRows.forEach(({ id, checkbox, row }) => {
      const checked = woundState.hardSigns.includes(id);
      if (active !== checkbox) checkbox.checked = checked;
      row.className = `nsti-check-row ${checked ? 'active-hard' : ''}`;
    });
    softCheckRows.forEach(({ id, checkbox, row }) => {
      const checked = woundState.softSigns.includes(id);
      if (active !== checkbox) checkbox.checked = checked;
      row.className = `nsti-check-row ${checked ? 'active-soft' : ''}`;
    });
    if (active !== pocusSelect) pocusSelect.value = woundState.pocusCategory;
    labRows.forEach(({ key, input }) => {
      if (active !== input) input.value = String(woundState[key]);
    });
    if (active !== xylCheck) xylCheck.checked = Boolean(woundState.isXylazineWound);
  }

  function renderDynamic() {
    syncControls();
    const evaluation = evaluateNstiWoundRisk({
      hardSigns: woundState.hardSigns,
      softSigns: woundState.softSigns,
      pocusCategory: woundState.pocusCategory,
      labs: {
        crp: woundState.crp,
        wbc: woundState.wbc,
        hemoglobin: woundState.hemoglobin,
        sodium: woundState.sodium,
        creatinine: woundState.creatinine,
        glucose: woundState.glucose,
      },
      isXylazineWound: woundState.isXylazineWound,
      xylazineStage: woundState.xylazineStage,
    });

    clear(emergentBannerSlot);
    if (evaluation.isEmergentSurge) {
      emergentBannerSlot.append(
        h('div', { class: 'nsti-emergent-banner', role: 'alert' },
          h('div', { class: 'nsti-banner-header' },
            icon('alert-triangle'),
            h('strong', null, isEs ? '¡ALERTA QUIRÚRGICA INMEDIATA: FASCITIS NECROSANTE DETECTADA!' : 'CRITICAL SURGICAL ALERT: NECROTIZING SOFT TISSUE INFECTION SUSPECTED!')
          ),
          h('p', null, isEs ? 'Se han identificado signos patognomónicos (signos duros o ecografía STAFF positiva). TRASLADE DE INMEDIATO A QUIRÓFANO. Está formalmente contraindicado retrasar la cirugía para obtener analíticas adicionales o TC.' : 'Pathognomonic hard signs or STAFF ultrasound criteria are present. MOBILIZE OPERATING ROOM FOR IMMEDIATE SURGICAL DEBRIDEMENT. Do not delay surgery for further laboratory or CT imaging.')
        )
      );
    }

    clear(pocusDescSlot);
    pocusDescSlot.append(
      h('p', null, h('strong', null, isEs ? 'Hallazgos Sonográficos: ' : 'Sonographic Findings: '), isEs ? evaluation.pocus.findingsEs : evaluation.pocus.findingsEn),
      h('p', null, h('strong', null, isEs ? 'Conducta Clínica: ' : 'Clinical Action: '), isEs ? evaluation.pocus.managementEs : evaluation.pocus.managementEn)
    );

    lrinecBadgeEl.className = `nsti-badge badge-${evaluation.lrinec.riskTier}`;
    lrinecBadgeEl.textContent = `${evaluation.lrinec.totalScore} / 13 pts (${isEs ? evaluation.lrinec.riskTierEs : evaluation.lrinec.riskTierEn})`;
    lrinecActionEl.textContent = isEs ? evaluation.lrinec.actionEs : evaluation.lrinec.actionEn;
    labRows.forEach(({ ptsKey, ptsBadge }) => {
      ptsBadge.textContent = `+${evaluation.lrinec[ptsKey]} pts`;
    });

    clear(xylDynamicSlot);
    if (woundState.isXylazineWound) {
      const stageSelect = h('select', { class: 'nsti-select', 'aria-label': isEs ? 'Estadio de xilacina' : 'Xylazine Stage' },
        XYLAZINE_ULCER_STAGES.map((s) =>
          h('option', { value: s.stage, selected: woundState.xylazineStage === s.stage }, isEs ? s.nameEs : s.nameEn)
        )
      );
      stageSelect.addEventListener('change', (e) => setNstiState({ xylazineStage: Number(e.target.value) }));

      const stageInfo = h('div', { class: 'nsti-stage-info' },
        h('p', null, h('strong', null, isEs ? 'Características: ' : 'Characteristics: '), isEs ? evaluation.xylazineProfile.characteristicsEs : evaluation.xylazineProfile.characteristicsEn),
        h('p', { class: 'nsti-protocol-text' }, h('strong', null, isEs ? 'Protocolo Recomendado: ' : 'Clinical Protocol: '), isEs ? evaluation.xylazineProfile.protocolEs : evaluation.xylazineProfile.protocolEn)
      );
      xylDynamicSlot.append(stageSelect, stageInfo);

      if (evaluation.tendonAdvisoryEn) {
        xylDynamicSlot.append(
          h('div', { class: 'nsti-tendon-alert', role: 'alert' },
            icon('alert-octagon'),
            h('span', null, isEs ? evaluation.tendonAdvisoryEs : evaluation.tendonAdvisoryEn)
          )
        );
      }
    }

    clear(sbarCardSlot);
    const copyBtn = h('button', {
      type: 'button',
      class: 'btn btn-primary',
      'aria-label': isEs ? 'Copiar Nota SBAR' : 'Copy SBAR Note',
    }, icon('copy'), isEs ? (woundState.copied ? '¡Copiado!' : 'Copiar Nota SBAR') : (woundState.copied ? 'Copied!' : 'Copy SBAR Note'));
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(isEs ? evaluation.sbarEs : evaluation.sbarEn);
        setNstiState({ copied: true });
        announce(isEs ? 'Nota SBAR copiada al portapapeles' : 'SBAR note copied to clipboard');
        setTimeout(() => setNstiState({ copied: false }), 2500);
      } catch {
        announce(isEs ? 'Error al copiar' : 'Failed to copy');
      }
    });

    const resetBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary',
      'aria-label': isEs ? 'Restablecer Valores' : 'Reset Form',
    }, icon('rotate-ccw'), isEs ? 'Restablecer' : 'Reset');
    resetBtn.addEventListener('click', () => {
      resetNstiState();
      announce(isEs ? 'Valores restablecidos' : 'State reset');
    });

    sbarCardSlot.append(
      h('div', { class: 'card nsti-card' },
        h('h2', { class: 'nsti-card-title' },
          icon('file-text'),
          isEs ? '6. Nota de Interconsulta SBAR para Cirugía / Urgencias' : '6. SBAR Surgical Consultation & Handoff Note'
        ),
        h('textarea', {
          class: 'nsti-sbar-textarea',
          readonly: true,
          rows: 9,
          'aria-label': isEs ? 'Nota SBAR' : 'SBAR Note',
        }, isEs ? evaluation.sbarEs : evaluation.sbarEn),
        h('div', { class: 'nsti-btn-row' }, copyBtn, resetBtn)
      )
    );
  }

  let wasConnected = false;
  const onStateChange = () => {
    wasConnected = wasConnected || Boolean(container.isConnected);
    if (wasConnected && container.isConnected === false) {
      unsubscribe();
      return;
    }
    renderDynamic();
  };

  const unsubscribe = subscribeNstiState(onStateChange);
  renderDynamic();
  return container;
}
