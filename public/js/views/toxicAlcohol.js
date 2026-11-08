// public/js/views/toxicAlcohol.js
// HarborPath - Toxic Alcohol & Volatile Poisoning Navigator (Methanol, Ethylene Glycol, Isopropanol)
// Clinical Consensus: American Academy of Clinical Toxicology (AACT), European Association of Poison
// Centres and Clinical Toxicologists (EAPCCT), American College of Medical Toxicology (ACMT),
// and Extracorporeal Treatments in Poisoning (EXTRIP) Workgroup.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII, zero cookies.
// Security Invariant: Safe DOM manipulation via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// CLINICAL TAXONOMY & METABOLIC TOXICOLOGY CONSTANTS
// ============================================================================

export const TOXIC_ALCOHOL_PROFILES = Object.freeze({
  methanol: Object.freeze({
    id: 'methanol',
    nameEn: 'Methanol Poisoning (Methyl Alcohol / Wood Alcohol)',
    nameEs: 'Intoxicación por Metanol (Alcohol Metílico / Alcohol de Madera)',
    sourcesEn: 'Windshield wiper fluids, contaminated/bootleg moonshine, carburetor cleaners, solid fuel cans (Sterno).',
    sourcesEs: 'Líquidos limpiaparabrisas, alcohol adulterado / clandestino, limpiadores de carburador, latas de combustible sólido.',
    metaboliteEn: 'Formic Acid / Formate (inhibits mitochondrial cytochrome c oxidase -> histotoxic cellular hypoxia).',
    metaboliteEs: 'Ácido Fórmico / Formiato (inhibe la citocromo c oxidasa mitocondrial -> hipoxia celular histotóxica).',
    targetOrgansEn: 'Optic nerve retrolaminar axons (blindness, visual field defects, optic disc edema) and basal ganglia (bilateral putaminal necrosis).',
    targetOrgansEs: 'Axones retrolaminares del nervio óptico (ceguera, edema de papila) y ganglios basales (necrosis putaminal bilateral).',
    hallmarkSignsEn: Object.freeze([
      'Visual impairment: Blurred vision, "snowstorm vision", photophobia, constricted visual fields',
      'Optic disc hyperemia, retinal edema, sluggish or unreactive dilated pupils',
      'Severe high anion gap metabolic acidosis (HAGMA) with high lactate/formate concentrations',
      'Bilateral putaminal hemorrhagic necrosis or infarcts on brain CT/MRI',
      'Pancreatitis, severe abdominal pain, and delayed central nervous system coma'
    ]),
    hallmarkSignsEs: Object.freeze([
      'Alteración visual: Visión borrosa, «visión en tormenta de nieve», fotofobia o escotomas',
      'Hiperemia del disco óptico, edema retiniano o pupilas dilatadas poco reactivas',
      'Acidosis metabólica grave con anión gap elevado (acumulación de ácido fórmico)',
      'Necrosis o hemorragia putaminal bilateral visible en TC o RM cerebral',
      'Pancreatitis aguda, dolor abdominal intenso y coma neurológico retardado'
    ]),
    antidoteDosingEn: 'Fomepizole: Loading dose 15 mg/kg IV in 100 mL NS/D5W over 30 min; then 10 mg/kg q12h x 4 doses; then 15 mg/kg q12h. (During hemodialysis: 10 mg/kg q4h or 1.0–1.5 mg/kg/hr infusion). If fomepizole unavailable: 10% IV Ethanol target blood level 100–150 mg/dL (loading 8–10 mL/kg IV over 60 min, maintenance 1.0–1.5 mL/kg/hr; double during hemodialysis).',
    antidoteDosingEs: 'Fomepizol: Dosis de carga 15 mg/kg IV en 100 mL de SSN/D5W en 30 min; luego 10 mg/kg c/12h por 4 dosis; luego 15 mg/kg c/12h. (En hemodiálisis: 10 mg/kg c/4h o infusión de 1,0–1,5 mg/kg/h). Si no hay fomepizol: Etanol al 10% IV nivel diana 100–150 mg/dL (carga 8–10 mL/kg en 60 min, mantenimiento 1,0–1,5 mL/kg/h; duplicar en hemodiálisis).',
    cofactorsEn: 'Folinic Acid (Leucovorin) 50 mg IV q4h (or Folic Acid 50 mg IV q4h) to accelerate hepatic conversion of formic acid into non-toxic CO2 and H2O.',
    cofactorsEs: 'Ácido Folínico (Leucovorina) 50 mg IV c/4h (o Ácido Fólico 50 mg IV c/4h) para acelerar la conversión de ácido fórmico en CO2 y H2O.',
    bicarbonateDirectiveEn: 'Mandatory Sodium Bicarbonate IV for blood pH < 7.30 (target arterial pH 7.45–7.50). Alkalinization drives lipid-soluble unionized formic acid (pKa 3.75) into charged water-soluble formate ions ("ion trapping"), preventing penetration across blood-retinal and blood-brain barriers.',
    bicarbonateDirectiveEs: 'Bicarbonato de Sodio IV obligatorio para pH < 7,30 (meta pH arterial 7,45–7,50). La alcalinización convierte el ácido fórmico liposoluble (pKa 3,75) en iones de formiato cargados («atrapamiento iónico»), impidiendo su paso a la retina y al cerebro.',
    dialysisIndicationsEn: 'Intermittent Hemodialysis (IHD) is mandatory for: Visual impairment, arterial pH < 7.25, refractory metabolic acidosis, acute renal failure, or serum methanol > 50 mg/dL (> 70 mg/dL if on fomepizole).',
    dialysisIndicationsEs: 'Hemodiálisis intermitente obligatoria para: Síntomas visuales, pH arterial < 7,25, acidosis metabólica refractaria, insuficiencia renal o metanol sérico > 50 mg/dL (> 70 mg/dL con fomepizol).',
    urgencyTier: 'CRITICAL_ANTIDOTE_AND_DIALYSIS',
  }),

  ethylene_glycol: Object.freeze({
    id: 'ethylene_glycol',
    nameEn: 'Ethylene Glycol Poisoning (Automotive Antifreeze)',
    nameEs: 'Intoxicación por Etilenglicol (Anticongelante de Vehículos)',
    sourcesEn: 'Automotive radiator coolants, industrial de-icing solutions, brake fluids, solar collectors.',
    sourcesEs: 'Refrigerantes de radiador, soluciones descongelantes de aviación, fluidos hidráulicos.',
    metaboliteEn: 'Glycolic Acid (causes severe metabolic acidosis) and Oxalic Acid (chelates calcium to form insoluble calcium oxalate crystals).',
    metaboliteEs: 'Ácido Glicólico (acidosis metabólica grave) y Ácido Oxálico (quela el calcio y forma cristales insolubles de oxalato cálcico).',
    targetOrgansEn: 'Renal tubules (acute tubular necrosis and oliguric renal failure from intratubular calcium oxalate deposition) and central nervous system.',
    targetOrgansEs: 'Túbulos renales (necrosis tubular aguda e insuficiencia renal anúrica por depósito de cristales de oxalato) y sistema nervioso.',
    hallmarkSignsEn: Object.freeze([
      'Phase 1 (0.5–12 hrs): Inebriation without ethanol odor, ataxia, seizures, nausea, progressive encephalopathy',
      'Phase 2 (12–24 hrs): Cardiopulmonary failure, tachycardia, hypertension, tachypnea, pulmonary edema',
      'Phase 3 (24–72 hrs): Flank pain, oliguria, acute renal failure, hypocalcemia with tetany or QT prolongation',
      'Urinalysis: Calcium oxalate monohydrate (needle/spindle) or dihydrate (envelope) crystals under polarized light',
      'Diagnostic Pitfall ("Lactate Gap"): Glycolic acid cross-reacts on POC whole-blood lactate electrodes, falsely showing astronomical lactate'
    ]),
    hallmarkSignsEs: Object.freeze([
      'Fase 1 (0,5–12 h): Embriaguez sin aliento etílico, ataxia, convulsiones, náuseas, encefalopatía progresiva',
      'Fase 2 (12–24 h): Taquicardia, hipertensión, taquipnea, insuficiencia cardiopulmonar y edema pulmonar',
      'Fase 3 (24–72 h): Dolor en flancos, oliguria, fallo renal agudo e hipocalcemia con tetania o prolongación del QT',
      'Sedimento urinario: Cristales de oxalato cálcico monohidrato (agujas) o dihidrato (sobres) en microscopía',
      'Trampa diagnóstica («Brecha de lactato»): El ácido glicólico interfiere en analizadores POC de lactato, marcando niveles falsamente letales'
    ]),
    antidoteDosingEn: 'Fomepizole: Loading dose 15 mg/kg IV in 100 mL NS/D5W over 30 min; then 10 mg/kg q12h x 4 doses; then 15 mg/kg q12h. (During hemodialysis: 10 mg/kg q4h or 1.0–1.5 mg/kg/hr infusion). If fomepizole unavailable: 10% IV Ethanol target blood level 100–150 mg/dL.',
    antidoteDosingEs: 'Fomepizol: Dosis de carga 15 mg/kg IV en 100 mL de SSN/D5W en 30 min; luego 10 mg/kg c/12h por 4 dosis; luego 15 mg/kg c/12h. (En hemodiálisis: 10 mg/kg c/4h o 1,0–1,5 mg/kg/h). Si no hay fomepizol: Etanol al 10% IV nivel diana 100–150 mg/dL.',
    cofactorsEn: 'Thiamine 100 mg IV q6h PLUS Pyridoxine (Vitamin B6) 50 mg IV q6h. Thiamine shunts glyoxylate into harmless alpha-hydroxy-beta-ketoadipate; pyridoxine shunts glyoxylate into benign glycine, directly preventing oxalic acid formation.',
    cofactorsEs: 'Tiamina 100 mg IV c/6h MÁS Piridoxina (Vitamina B6) 50 mg IV c/6h. La tiamina deriva el glioxilato hacia alfa-hidroxi-beta-cetoadipato; la piridoxina lo desvía hacia glicina inofensiva, frenando la formación de oxalato.',
    bicarbonateDirectiveEn: 'Sodium Bicarbonate IV infusion indicated for systemic acidemia (pH < 7.30) to preserve renal perfusion and normalize physiological buffer capacity.',
    bicarbonateDirectiveEs: 'Infusión de Bicarbonato de Sodio IV indicada para acidemia sistémica (pH < 7,30) para preservar perfusión renal y corregir acidosis.',
    dialysisIndicationsEn: 'Intermittent Hemodialysis (IHD) is mandatory for: Acute renal failure (anuria/oliguria), arterial pH < 7.25, refractory hyperkalemia, or serum ethylene glycol > 50 mg/dL (> 70 mg/dL on fomepizole).',
    dialysisIndicationsEs: 'Hemodiálisis intermitente obligatoria para: Insuficiencia renal aguda (anuria/oliguria), pH arterial < 7,25, hiperpotasemia refractaria o etilenglicol sérico > 50 mg/dL (> 70 mg/dL con fomepizol).',
    urgencyTier: 'CRITICAL_ANTIDOTE_AND_DIALYSIS',
  }),

  isopropanol: Object.freeze({
    id: 'isopropanol',
    nameEn: 'Isopropanol Poisoning (Isopropyl Alcohol / Rubbing Alcohol)',
    nameEs: 'Intoxicación por Isopropanol (Alcohol Isopropílico / Alcohol de Fricción)',
    sourcesEn: 'Rubbing alcohol (70%), hand sanitizers, skin disinfectants, cleaning solvents.',
    sourcesEs: 'Alcohol de fricción al 70%, desinfectantes de manos, solventes desengrasantes.',
    metaboliteEn: 'Acetone (causes significant central nervous system depression and ketosis, but is NOT an organic acid).',
    metaboliteEs: 'Acetona (causa profunda depresión del sistema nervioso central y cetosis, pero NO es un ácido orgánico).',
    targetOrgansEn: 'Central nervous system (2x more potent inebriation and sedation than ethanol) and gastric mucosa (severe hemorrhagic gastritis).',
    targetOrgansEs: 'Sistema nervioso central (doble de potencia sedante y embriaguez que el etanol) y mucosa gástrica (gastritis hemorrágica grave).',
    hallmarkSignsEn: Object.freeze([
      'Markedly elevated serum osmolal gap WITHOUT high anion gap metabolic acidosis (ketosis without acidosis)',
      'Fruity breath odor of acetone with profound sedation, ataxia, hyporeflexia, and stupor',
      'Severe hemorrhagic gastritis: Abdominal tenderness, hematemesis, coffee-ground emesis',
      'Diagnostic Pitfall ("Pseudorenal Failure"): Acetone cross-reacts on Jaffe colorimetric assay, causing elevated creatinine (2–5 mg/dL) with completely normal BUN',
      'Hypotension and myocardial depression in massive ingestions (> 200–400 mL)'
    ]),
    hallmarkSignsEs: Object.freeze([
      'Brecha osmolal marcadamente elevada SIN acidosis metabólica con anión gap elevado (cetosis sin acidosis)',
      'Aliento frutal a acetona con sedación profunda, ataxia, hiporreflexia y estupor',
      'Gastritis hemorrágica severa: Dolor epigástrico, hematemesis o vómito en posos de café',
      'Trampa diagnóstica («Seudoinsuficiencia renal»): La acetona interfiere en la prueba de Jaffé, elevando la creatinina (2–5 mg/dL) con BUN normal',
      'Hipotensión y depresión miocárdica en ingestiones masivas (> 200–400 mL)'
    ]),
    antidoteDosingEn: 'CRITICAL DIRECTIVE: FOMEPIZOLE IS CONTRAINDICATED / UNNECESSARY. Acetone is benign compared to isopropanol; blocking ADH with fomepizole dramatically prolongs parent isopropanol half-life from ~3 hrs to >28 hrs, worsening CNS depression. Management is purely supportive: IV fluids, airway protection, and IV PPIs/H2RAs for gastritis.',
    antidoteDosingEs: 'DIRECTIVA CRÍTICA: FOMEPIZOL ESTÁ CONTRAINDICADO / ES INNECESARIO. La acetona es benigna comparada con el isopropanol; bloquear la ADH con fomepizol alarga la vida media del isopropanol de ~3 h a > 28 h, empeorando el coma. El manejo es exclusivamente de soporte: fluidos IV, vía aérea y protector gástrico.',
    cofactorsEn: 'No vitamin cofactors required. Support with IV thiamine 100 mg only if chronic malnutrition or alcohol use disorder suspected.',
    cofactorsEs: 'No requiere cofactores vitamínicos específicos. Administrar tiamina 100 mg IV solo si se sospecha desnutrición crónica.',
    bicarbonateDirectiveEn: 'Sodium Bicarbonate is NOT indicated because isopropanol does not cause significant organic acidemia.',
    bicarbonateDirectiveEs: 'El bicarbonato de sodio NO está indicado dado que el isopropanol no genera acidemia orgánica.',
    dialysisIndicationsEn: 'Hemodialysis is RARELY indicated; reserved strictly for refractory circulatory shock unresponsive to vasopressors or serum isopropanol > 400–500 mg/dL.',
    dialysisIndicationsEs: 'La hemodiálisis es RARA VEZ necesaria; se reserva exclusivamente para choque circulatorio refractario a vasopresores o niveles séricos > 400–500 mg/dL.',
    urgencyTier: 'SUPPORTIVE_CARE_ONLY',
  }),

  diethylene_glycol: Object.freeze({
    id: 'diethylene_glycol',
    nameEn: 'Diethylene Glycol Poisoning (DEG Contaminant / Counterfeits)',
    nameEs: 'Intoxicación por Dietilenglicol (Contaminante DEG / Medicamentos Falsificados)',
    sourcesEn: 'Counterfeit glycerin in cough syrups, adulterated acetaminophen elixirs, brake fluids, industrial solvents.',
    sourcesEs: 'Glicerina adulterada en jarabes para la tos, elixires falsificados, líquidos de frenos industriales.',
    metaboliteEn: '2-Hydroxyethoxyacetic acid (HEAA) and Diglycolic acid (potent nephrotoxins and neurotoxins).',
    metaboliteEs: 'Ácido 2-hidroxietoxiacético (HEAA) y Ácido Diglicólico (potentes nefrotóxicos y neurotóxicos).',
    targetOrgansEn: 'Proximal renal tubular epithelial cells (acute cortical necrosis, anuric renal failure) and peripheral/cranial nerves (delayed bilateral facial paralysis).',
    targetOrgansEs: 'Células epiteliales tubulares renales (necrosis cortical aguda, fallo anúrico) y nervios craneales/periféricos (parálisis facial bilateral tardía).',
    hallmarkSignsEn: Object.freeze([
      'Initial phase: Nausea, vomiting, diarrhea, inebriation, abdominal pain',
      'Renal phase (day 2–5): Severe oliguria progressing rapidly to complete anuria with flank pain',
      'Severe high anion gap metabolic acidosis (HAGMA) with high osmolal gap early',
      'Neurological phase (day 5–14): Progressive bilateral facial nerve palsy (facial diplegia), cranial neuropathies (CN VI, VII, IX, X, XII)',
      'Flaccid quadriparesis, encephalopathy, autonomic instability, and delayed respiratory muscle paralysis'
    ]),
    hallmarkSignsEs: Object.freeze([
      'Fase inicial: Náuseas, vómitos, diarrea, embriaguez y dolor abdominal',
      'Fase renal (días 2–5): Oliguria severa que progresa a anuria completa con dolor lumbar',
      'Acidosis metabólica grave con brecha aniónica elevada y brecha osmolal alta precoz',
      'Fase neurológica (días 5–14): Parálisis facial bilateral progresiva (diplejía facial) y neuropatías de pares craneales',
      'Tetraparesia flácida, encefalopatía, inestabilidad autonómica y parálisis de músculos respiratorios'
    ]),
    antidoteDosingEn: 'Fomepizole: Loading dose 15 mg/kg IV; then 10 mg/kg q12h x 4 doses; then 15 mg/kg q12h. Fomepizole blocks conversion of DEG into toxic diglycolic acid. Must initiate immediately upon clinical suspicion before anuria develops.',
    antidoteDosingEs: 'Fomepizol: Dosis de carga 15 mg/kg IV; luego 10 mg/kg c/12h por 4 dosis; luego 15 mg/kg c/12h. El fomepizol bloquea la conversión de DEG a ácido diglicólico. Debe iniciarse de inmediato antes de la anuria.',
    cofactorsEn: 'Supportive nutritional and antioxidant cofactors; monitor fluid balance meticulously.',
    cofactorsEs: 'Soporte nutricional y antioxidante; control estricto de balance hídrico.',
    bicarbonateDirectiveEn: 'Sodium Bicarbonate IV infusion to correct severe metabolic acidemia.',
    bicarbonateDirectiveEs: 'Infusión de Bicarbonato de Sodio IV para corregir acidemia metabólica severa.',
    dialysisIndicationsEn: 'Early intermittent hemodialysis is mandatory to clear parent diethylene glycol and toxic organic acids before irreversible cortical necrosis occurs.',
    dialysisIndicationsEs: 'Hemodiálisis precoz obligatoria para depurar el dietilenglicol y ácidos tóxicos antes de necrosis cortical irreversible.',
    urgencyTier: 'CRITICAL_ANTIDOTE_AND_DIALYSIS',
  }),
});

// ============================================================================
// CLINICAL EVALUATION ENGINE (PURE FUNCTION)
// ============================================================================

/**
 * Pure evaluation function for toxic alcohol risk, formulas, and treatment directives.
 * @param {Object} input
 * @param {string} [input.agentId='methanol'] - Key in TOXIC_ALCOHOL_PROFILES
 * @param {number} [input.sodium=140] - Serum Na+ in mEq/L
 * @param {number} [input.glucose=100] - Serum Glucose in mg/dL
 * @param {number} [input.bun=14] - Serum BUN in mg/dL
 * @param {number} [input.ethanol=0] - Serum Ethanol in mg/dL
 * @param {number} [input.measuredOsm=290] - Measured serum osmolality in mOsm/kg
 * @param {string} [input.osmMethod='freezing_point'] - 'freezing_point' | 'vapor_pressure'
 * @param {number} [input.chloride=102] - Serum Cl- in mEq/L
 * @param {number} [input.bicarbonate=24] - Serum HCO3- in mEq/L
 * @param {number} [input.ph=7.40] - Arterial blood pH
 * @param {boolean} [input.hasVisualSymptoms=false] - Blurred/snowstorm vision
 * @param {boolean} [input.hasRenalFailure=false] - Oliguria, anuria, rising Cr
 * @param {boolean} [input.hasHemodialysis=false] - Currently receiving hemodialysis
 * @returns {Object} Comprehensive diagnostic calculations, alerts, and therapeutic orders
 */
export function evaluateToxicAlcoholRisk(input = {}) {
  const agentId = TOXIC_ALCOHOL_PROFILES[input.agentId] ? input.agentId : 'methanol';
  const profile = TOXIC_ALCOHOL_PROFILES[agentId];

  const na = Number(input.sodium) || 140;
  const glucose = Number(input.glucose) || 100;
  const bun = Number(input.bun) || 14;
  const ethanol = Math.max(0, Number(input.ethanol) || 0);
  const measuredOsm = Number(input.measuredOsm) || 290;
  const osmMethod = input.osmMethod === 'vapor_pressure' ? 'vapor_pressure' : 'freezing_point';

  const cl = Number(input.chloride) || 102;
  const hco3 = Number(input.bicarbonate) || 24;
  const ph = Number(input.ph) || 7.40;

  const hasVisualSymptoms = Boolean(input.hasVisualSymptoms);
  const hasRenalFailure = Boolean(input.hasRenalFailure);
  const isDialysis = Boolean(input.hasHemodialysis);

  // 1. Osmolal Gap Calculation
  // Standard formula: 2*Na + Glucose/18 + BUN/2.8 + Ethanol/4.6
  const calculatedOsm = Math.round((2 * na + (glucose / 18) + (bun / 2.8) + (ethanol / 4.6)) * 10) / 10;
  const osmolalGap = Math.round((measuredOsm - calculatedOsm) * 10) / 10;

  // 2. Anion Gap Calculation
  // Standard formula: Na - (Cl + HCO3)
  const anionGap = Math.round((na - (cl + hco3)) * 10) / 10;

  // 3. Flags and Severity Assessment
  const emergencyFlagsEn = [];
  const emergencyFlagsEs = [];

  if (osmMethod === 'vapor_pressure') {
    emergencyFlagsEn.push('METHODOLOGY WARNING: Vapor pressure osmometry heats the sample, vaporizing volatile alcohols (methanol/ethanol/isopropanol) into the gas phase. A normal gap by vapor pressure is INVALID. Re-order measured osmolality specifically by FREEZING POINT DEPRESSION.');
    emergencyFlagsEs.push('ADVERTENCIA METODOLÓGICA: La osmometría por presión de vapor evapora los alcoholes volátiles. Una brecha normal con este método es INVÁLIDA. Exija determinación por DESCENSO CRIOSCÓPICO (punto de congelación).');
  }

  if (osmolalGap > 20) {
    emergencyFlagsEn.push(`CRITICALLY ELEVATED OSMOLAL GAP (${osmolalGap} mOsm/kg): Strong evidence of unmeasured low-molecular-weight exogenous alcohol or glycol.`);
    emergencyFlagsEs.push(`BRECHA OSMOLAL CRÍTICAMENTE ELEVADA (${osmolalGap} mOsm/kg): Fuerte sospecha de alcohol o glicol tóxico exógeno no medido.`);
  } else if (osmolalGap > 10 && osmolalGap <= 20) {
    emergencyFlagsEn.push(`BORDERLINE OSMOLAL GAP (${osmolalGap} mOsm/kg): May reflect early low-dose ingestion or late-stage presentation where parent alcohol has metabolized into organic acid.`);
    emergencyFlagsEs.push(`BRECHA OSMOLAL LIMÍTROFE (${osmolalGap} mOsm/kg): Posible ingestión precoz o presentación tardía donde el alcohol ya se transformó en metabolitos ácidos.`);
  }

  if (anionGap > 16) {
    emergencyFlagsEn.push(`HIGH ANION GAP METABOLIC ACIDOSIS (AG = ${anionGap} mEq/L): Demonstrates accumulation of toxic organic acids (formic, glycolic, or diglycolic acid).`);
    emergencyFlagsEs.push(`ACIDOSIS METABÓLICA CON BRECHA ANIÓNICA ALTA (AG = ${anionGap} mEq/L): Demuestra acumulación de ácidos orgánicos tóxicos.`);
  }

  if (ph < 7.30) {
    emergencyFlagsEn.push(`SEVERE ACIDEMIA (pH ${ph.toFixed(2)}): Mandates continuous Sodium Bicarbonate IV infusion (target pH 7.45–7.50) to prevent formic acid retinal penetration (ion-trapping).`);
    emergencyFlagsEs.push(`ACIDEMIA SEVERA (pH ${ph.toFixed(2)}): Exige infusión continua de Bicarbonato de Sodio IV (meta pH 7,45–7,50) para evitar penetración retiniana por formiato.`);
  }

  // Dialysis Evaluation
  let requiresHemodialysis = false;
  const dialysisReasonsEn = [];
  const dialysisReasonsEs = [];

  if (ph < 7.25) {
    requiresHemodialysis = true;
    dialysisReasonsEn.push(`Severe refractory acidemia (pH ${ph.toFixed(2)} < 7.25)`);
    dialysisReasonsEs.push(`Acidemia refractaria severa (pH ${ph.toFixed(2)} < 7,25)`);
  }

  if (hasVisualSymptoms && (agentId === 'methanol')) {
    requiresHemodialysis = true;
    dialysisReasonsEn.push('Subjective or objective visual impairment (optic disc edema/snowstorm vision)');
    dialysisReasonsEs.push('Síntomas visuales objetivos o subjetivos (visión en tormenta de nieve / edema papilar)');
  }

  if (hasRenalFailure && (agentId === 'ethylene_glycol' || agentId === 'diethylene_glycol')) {
    requiresHemodialysis = true;
    dialysisReasonsEn.push('Acute renal failure / anuria from calcium oxalate or diglycolate nephrotoxicity');
    dialysisReasonsEs.push('Fallo renal agudo / anuria por nefrotoxicidad de oxalato o diglicolato');
  }

  if (osmolalGap > 50 && ph < 7.30) {
    requiresHemodialysis = true;
    dialysisReasonsEn.push(`Massive osmolal gap (${osmolalGap} mOsm/kg) with metabolic acidemia`);
    dialysisReasonsEs.push(`Brecha osmolal masiva (${osmolalGap} mOsm/kg) con acidemia metabólica`);
  }

  if (requiresHemodialysis) {
    emergencyFlagsEn.push(`EXTRIP DIALYSIS CRITERIA MET: ${dialysisReasonsEn.join('; ')}.`);
    emergencyFlagsEs.push(`CRITERIOS DE HEMODIÁLISIS EXTRIP CUMPLIDOS: ${dialysisReasonsEs.join('; ')}.`);
  }

  const isEmergency911 = emergencyFlagsEn.length > 0;

  // Specific Antidote Regimen Generation
  let antidoteRegimenEn = profile.antidoteDosingEn;
  let antidoteRegimenEs = profile.antidoteDosingEs;

  if (agentId === 'isopropanol') {
    antidoteRegimenEn = 'FOMEPIZOLE CONTRAINDICATED. Supportive therapy only (IV crystalloids, airway protection, IV pantoprazole 40 mg for hemorrhagic gastritis).';
    antidoteRegimenEs = 'FOMEPIZOL CONTRAINDICADO. Terapia de soporte exclusiva (cristaloides IV, vía aérea, pantoprazol 40 mg IV por gastritis).';
  } else if (isDialysis) {
    antidoteRegimenEn = 'DIALYSIS DOSE ADJUSTMENT: Fomepizole is cleared by hemodialysis. Administer 10 mg/kg IV q4h throughout hemodialysis (or continuous 1.0–1.5 mg/kg/hr infusion). If using 10% IV ethanol, increase infusion rate to 2.5–4.0 mL/kg/hr.';
    antidoteRegimenEs = 'AJUSTE POR HEMODIÁLISIS: El dializador depura el fomepizol. Administrar 10 mg/kg IV cada 4 h durante la diálisis (o infusión de 1,0–1,5 mg/kg/h). Con etanol al 10%, aumentar infusión a 2,5–4,0 mL/kg/h.';
  }

  // SBAR Clinical Handoff Note
  const sbarEn = [
    `[S] SITUATION: Patient presenting with suspected acute ${profile.nameEn}.`,
    `[B] BACKGROUND: Source risk: ${profile.sourcesEn}. Measured Osm: ${measuredOsm} mOsm/kg (${osmMethod.replace('_', ' ')}). Na: ${na}, Glu: ${glucose}, BUN: ${bun}, EtOH: ${ethanol} mg/dL.`,
    `[A] ASSESSMENT: Calculated Osmolality = ${calculatedOsm} mOsm/kg | Osmolal Gap = ${osmolalGap} mOsm/kg (Normal < 10). Serum Anion Gap = ${anionGap} mEq/L (Normal 8–12). Arterial pH = ${ph.toFixed(2)}.`,
    `  • Clinical Flags: ${isEmergency911 ? emergencyFlagsEn.join('; ') : 'No acute metabolic decomposition flags.'}`,
    `  • Dialysis Threshold: ${requiresHemodialysis ? `EMERGENT HEMODIALYSIS INDICATED (${dialysisReasonsEn.join(', ')})` : 'Does not meet emergent dialysis criteria currently.'}`,
    `[R] RECOMMENDATION: ${antidoteRegimenEn}`,
    `  • Cofactors: ${profile.cofactorsEn}`,
    `  • Bicarbonate Directive: ${profile.bicarbonateDirectiveEn}`,
    `  • Poison Control: Immediately consult Regional Poison Center (1-800-222-1222).`,
  ].join('\n');

  const sbarEs = [
    `[S] SITUACIÓN: Paciente con sospecha de intoxicación aguda por ${profile.nameEs}.`,
    `[B] ANTECEDENTES: Fuente sospechosa: ${profile.sourcesEs}. Osmolalidad medida: ${measuredOsm} mOsm/kg (${osmMethod === 'freezing_point' ? 'descenso crioscópico' : 'presión de vapor'}). Na: ${na}, Glu: ${glucose}, BUN: ${bun}, EtOH: ${ethanol} mg/dL.`,
    `[A] EVALUACIÓN: Osmolalidad Calculada = ${calculatedOsm} mOsm/kg | Brecha Osmolal = ${osmolalGap} mOsm/kg (Normal < 10). Brecha Aniónica = ${anionGap} mEq/L (Normal 8–12). pH arterial = ${ph.toFixed(2)}.`,
    `  • Alertas Clínicas: ${isEmergency911 ? emergencyFlagsEs.join('; ') : 'Sin signos de descompensación metabólica crítica.'}`,
    `  • Criterio de Diálisis: ${requiresHemodialysis ? `HEMODIÁLISIS DE EMERGENCIA INDICADA (${dialysisReasonsEs.join(', ')})` : 'No cumple criterios de hemodiálisis urgente por el momento.'}`,
    `[R] RECOMENDACIÓN: ${antidoteRegimenEs}`,
    `  • Cofactores: ${profile.cofactorsEs}`,
    `  • Directiva de Bicarbonato: ${profile.bicarbonateDirectiveEs}`,
    `  • Centro de Toxicología: Notificar inmediatamente al Centro de Toxicología (1-800-222-1222).`,
  ].join('\n');

  return {
    agentId,
    profile,
    calculatedOsm,
    osmolalGap,
    anionGap,
    ph,
    osmMethod,
    isEmergency911,
    emergencyFlagsEn,
    emergencyFlagsEs,
    requiresHemodialysis,
    dialysisReasonsEn,
    dialysisReasonsEs,
    antidoteRegimenEn,
    antidoteRegimenEs,
    sbarEn,
    sbarEs,
  };
}

// ============================================================================
// EPHEMERAL IN-RAM STATE & VIEW CONTROLLER
// ============================================================================

const toxicAlcoholState = {
  agentId: 'methanol',
  sodium: 140,
  glucose: 100,
  bun: 14,
  ethanol: 0,
  measuredOsm: 315,
  osmMethod: 'freezing_point',
  chloride: 102,
  bicarbonate: 12,
  ph: 7.22,
  hasVisualSymptoms: true,
  hasRenalFailure: false,
  hasHemodialysis: false,
  copied: false,
};

const listeners = new Set();
function notifyState() {
  for (const fn of listeners) fn();
}

export function getToxicAlcoholState() {
  return { ...toxicAlcoholState };
}

export function setToxicAlcoholState(patch) {
  Object.assign(toxicAlcoholState, patch);
  notifyState();
}

export function resetToxicAlcoholState() {
  Object.assign(toxicAlcoholState, {
    agentId: 'methanol',
    sodium: 140,
    glucose: 100,
    bun: 14,
    ethanol: 0,
    measuredOsm: 315,
    osmMethod: 'freezing_point',
    chloride: 102,
    bicarbonate: 12,
    ph: 7.22,
    hasVisualSymptoms: true,
    hasRenalFailure: false,
    hasHemodialysis: false,
    copied: false,
  });
  notifyState();
}

export function subscribeToxicAlcoholState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// DOM VIEW IMPLEMENTATION (ZERO INNERHTML / ZERO INLINE STYLES)
// ============================================================================

export function toxicAlcoholView() {
  const container = h('div', { class: 'toxic-alcohol-view', role: 'region', 'aria-label': 'Toxic Alcohol Poisoning Navigator' });

  function render() {
    clear(container);
    const isEs = getLang() === 'es';
    const evalResult = evaluateToxicAlcoholRisk({
      agentId: toxicAlcoholState.agentId,
      sodium: toxicAlcoholState.sodium,
      glucose: toxicAlcoholState.glucose,
      bun: toxicAlcoholState.bun,
      ethanol: toxicAlcoholState.ethanol,
      measuredOsm: toxicAlcoholState.measuredOsm,
      osmMethod: toxicAlcoholState.osmMethod,
      chloride: toxicAlcoholState.chloride,
      bicarbonate: toxicAlcoholState.bicarbonate,
      ph: toxicAlcoholState.ph,
      hasVisualSymptoms: toxicAlcoholState.hasVisualSymptoms,
      hasRenalFailure: toxicAlcoholState.hasRenalFailure,
      hasHemodialysis: toxicAlcoholState.hasHemodialysis,
    });

    // Page Header
    container.appendChild(
      pageHeader(
        isEs ? 'Navegador de Alcoholes Tóxicos, Fomepizol y Brecha Osmolal' : 'Toxic Alcohol Poisoning, Fomepizole & Osmolal Gap Navigator',
        isEs
          ? 'Consenso clínico AACT, EAPCCT y EXTRIP para metanol (ceguera por formiato), etilenglicol (oxalato cálcico), dietilenglicol e isopropanol (seudoinsuficiencia renal sin acidosis).'
          : 'AACT, EAPCCT, and EXTRIP clinical consensus for methanol (formate blindness), ethylene glycol (oxalate crystals), diethylene glycol, and isopropanol differentiation.',
        'clinical'
      )
    );

    // Emergency 911 / Dialysis Alert Banner if critical
    if (evalResult.isEmergency911) {
      container.appendChild(
        h('aside', { class: 'toxic-alert-urgent', role: 'alert' },
          h('div', { class: 'toxic-alert-title' },
            icon('alert-triangle'),
            h('strong', {}, isEs ? 'ALERTA TOXICOLÓGICA CRÍTICA: RIESGO DE CEGUERA O FALLO MULTIORGÁNICO' : 'CRITICAL TOXICOLOGY ALERT: HIGH RISK OF BLINDNESS OR ORGAN FAILURE')
          ),
          h('ul', { class: 'toxic-alert-list' },
            (isEs ? evalResult.emergencyFlagsEs : evalResult.emergencyFlagsEn).map((msg) =>
              h('li', {}, msg)
            )
          )
        )
      );
    }

    // Protocol Selector Tabs
    const tabNav = h('div', { class: 'tabs', role: 'tablist', 'aria-label': isEs ? 'Alcoholes Tóxicos' : 'Toxic Alcohol Agents' },
      Object.values(TOXIC_ALCOHOL_PROFILES).map((p) => {
        const isSelected = p.id === toxicAlcoholState.agentId;
        const btn = h('button', {
          role: 'tab',
          class: `tab ${isSelected ? 'active' : ''}`,
          'aria-selected': isSelected ? 'true' : 'false',
        }, isEs ? p.nameEs : p.nameEn);
        btn.addEventListener('click', () => {
          toxicAlcoholState.agentId = p.id;
          render();
        });
        return btn;
      })
    );
    container.appendChild(tabNav);

    // Two Column Layout
    const grid = h('div', { class: 'toxic-layout-grid' });

    // LEFT COLUMN: Lab Inputs & Diagnostic Calculator
    const leftCol = h('div', { class: 'toxic-col' });

    // Card 1: Diagnostic Calculations
    const calcCard = h('section', { class: 'toxic-card' },
      h('h2', { class: 'toxic-card-title' },
        icon('activity'),
        h('span', {}, isEs ? '1. Cálculo de Brecha Osmolal y Aniónica' : '1. Osmolal Gap & Anion Gap Calculator')
      ),
      h('p', { class: 'toxic-card-desc' },
        isEs
          ? 'Introduzca los valores de laboratorio para calcular la brecha osmolal por descenso crioscópico y la brecha aniónica.'
          : 'Enter serum laboratory values to calculate freezing-point osmolal gap and anion gap metabolic acidosis.'
      ),
      h('div', { class: 'toxic-form-grid' },
        // Measured Osmolality
        h('div', { class: 'toxic-form-group' },
          h('label', { for: 'inp-measured-osm', class: 'toxic-form-label' },
            isEs ? 'Osmolalidad Medida (mOsm/kg)' : 'Measured Osmolality (mOsm/kg)'
          ),
          (() => {
            const inp = h('input', {
              id: 'inp-measured-osm',
              type: 'number',
              class: 'toxic-input',
              value: String(toxicAlcoholState.measuredOsm),
            });
            inp.addEventListener('input', (e) => {
              toxicAlcoholState.measuredOsm = Number(e.target.value) || 0;
              render();
            });
            return inp;
          })()
        ),
        // Osmometry Method
        h('div', { class: 'toxic-form-group' },
          h('label', { for: 'sel-osm-method', class: 'toxic-form-label' },
            isEs ? 'Método de Osmometría' : 'Osmometry Method'
          ),
          (() => {
            const sel = h('select', { id: 'sel-osm-method', class: 'toxic-select' },
              h('option', { value: 'freezing_point', selected: toxicAlcoholState.osmMethod === 'freezing_point' },
                isEs ? 'Descenso Crioscópico (Válido)' : 'Freezing Point Depression (Valid)'
              ),
              h('option', { value: 'vapor_pressure', selected: toxicAlcoholState.osmMethod === 'vapor_pressure' },
                isEs ? 'Presión de Vapor (Inválido: evapora alcoholes)' : 'Vapor Pressure (Invalid: vaporizes alcohols)'
              )
            );
            sel.addEventListener('change', (e) => {
              toxicAlcoholState.osmMethod = e.target.value;
              render();
            });
            return sel;
          })()
        ),
        // Sodium
        h('div', { class: 'toxic-form-group' },
          h('label', { for: 'inp-na', class: 'toxic-form-label' }, 'Na+ (mEq/L)'),
          (() => {
            const inp = h('input', {
              id: 'inp-na',
              type: 'number',
              class: 'toxic-input',
              value: String(toxicAlcoholState.sodium),
            });
            inp.addEventListener('input', (e) => {
              toxicAlcoholState.sodium = Number(e.target.value) || 0;
              render();
            });
            return inp;
          })()
        ),
        // Glucose
        h('div', { class: 'toxic-form-group' },
          h('label', { for: 'inp-glu', class: 'toxic-form-label' }, isEs ? 'Glucosa (mg/dL)' : 'Glucose (mg/dL)'),
          (() => {
            const inp = h('input', {
              id: 'inp-glu',
              type: 'number',
              class: 'toxic-input',
              value: String(toxicAlcoholState.glucose),
            });
            inp.addEventListener('input', (e) => {
              toxicAlcoholState.glucose = Number(e.target.value) || 0;
              render();
            });
            return inp;
          })()
        ),
        // BUN
        h('div', { class: 'toxic-form-group' },
          h('label', { for: 'inp-bun', class: 'toxic-form-label' }, 'BUN (mg/dL)'),
          (() => {
            const inp = h('input', {
              id: 'inp-bun',
              type: 'number',
              class: 'toxic-input',
              value: String(toxicAlcoholState.bun),
            });
            inp.addEventListener('input', (e) => {
              toxicAlcoholState.bun = Number(e.target.value) || 0;
              render();
            });
            return inp;
          })()
        ),
        // Ethanol
        h('div', { class: 'toxic-form-group' },
          h('label', { for: 'inp-etoh', class: 'toxic-form-label' }, isEs ? 'Etanol Sérico (mg/dL)' : 'Serum Ethanol (mg/dL)'),
          (() => {
            const inp = h('input', {
              id: 'inp-etoh',
              type: 'number',
              class: 'toxic-input',
              value: String(toxicAlcoholState.ethanol),
            });
            inp.addEventListener('input', (e) => {
              toxicAlcoholState.ethanol = Number(e.target.value) || 0;
              render();
            });
            return inp;
          })()
        ),
        // Chloride
        h('div', { class: 'toxic-form-group' },
          h('label', { for: 'inp-cl', class: 'toxic-form-label' }, 'Cl- (mEq/L)'),
          (() => {
            const inp = h('input', {
              id: 'inp-cl',
              type: 'number',
              class: 'toxic-input',
              value: String(toxicAlcoholState.chloride),
            });
            inp.addEventListener('input', (e) => {
              toxicAlcoholState.chloride = Number(e.target.value) || 0;
              render();
            });
            return inp;
          })()
        ),
        // Bicarbonate
        h('div', { class: 'toxic-form-group' },
          h('label', { for: 'inp-hco3', class: 'toxic-form-label' }, 'HCO3- (mEq/L)'),
          (() => {
            const inp = h('input', {
              id: 'inp-hco3',
              type: 'number',
              class: 'toxic-input',
              value: String(toxicAlcoholState.bicarbonate),
            });
            inp.addEventListener('input', (e) => {
              toxicAlcoholState.bicarbonate = Number(e.target.value) || 0;
              render();
            });
            return inp;
          })()
        ),
        // pH
        h('div', { class: 'toxic-form-group' },
          h('label', { for: 'inp-ph', class: 'toxic-form-label' }, isEs ? 'pH Arterial' : 'Arterial pH'),
          (() => {
            const inp = h('input', {
              id: 'inp-ph',
              type: 'number',
              step: '0.01',
              class: 'toxic-input',
              value: String(toxicAlcoholState.ph),
            });
            inp.addEventListener('input', (e) => {
              toxicAlcoholState.ph = Number(e.target.value) || 7.4;
              render();
            });
            return inp;
          })()
        )
      ),

      // Diagnostic Metrics Badges
      h('div', { class: 'toxic-stats-bar' },
        h('div', { class: 'toxic-stat-chip' },
          h('span', { class: 'toxic-stat-label' }, isEs ? 'Osm Calculada:' : 'Calc Osm:'),
          h('strong', {}, ` ${evalResult.calculatedOsm} mOsm/kg`)
        ),
        h('div', { class: `toxic-stat-chip ${evalResult.osmolalGap > 10 ? 'urgent' : ''}` },
          h('span', { class: 'toxic-stat-label' }, isEs ? 'Brecha Osmolal:' : 'Osmolal Gap:'),
          h('strong', {}, ` ${evalResult.osmolalGap} mOsm/kg`)
        ),
        h('div', { class: `toxic-stat-chip ${evalResult.anionGap > 14 ? 'urgent' : ''}` },
          h('span', { class: 'toxic-stat-label' }, isEs ? 'Brecha Aniónica:' : 'Anion Gap:'),
          h('strong', {}, ` ${evalResult.anionGap} mEq/L`)
        )
      )
    );
    leftCol.appendChild(calcCard);

    // Card 2: Clinical Severity & Dialysis Modifiers
    const modCard = h('section', { class: 'toxic-card' },
      h('h2', { class: 'toxic-card-title' },
        icon('alert-circle'),
        h('span', {}, isEs ? '2. Signos Críticos y Modificadores de Diálisis' : '2. Critical Signs & Dialysis Modifiers')
      ),
      h('div', { class: 'toxic-checkbox-list' },
        h('label', { class: 'toxic-checkbox-label' },
          (() => {
            const chk = h('input', {
              id: 'chk-visual',
              type: 'checkbox',
              checked: toxicAlcoholState.hasVisualSymptoms,
            });
            chk.addEventListener('change', (e) => {
              toxicAlcoholState.hasVisualSymptoms = e.target.checked;
              render();
            });
            return chk;
          })(),
          h('span', {}, isEs ? 'Alteración visual / «Visión en tormenta de nieve» / Edema papilar (Metanol)' : 'Visual impairment / "Snowstorm vision" / Optic disc edema (Methanol)')
        ),
        h('label', { class: 'toxic-checkbox-label' },
          (() => {
            const chk = h('input', {
              id: 'chk-renal',
              type: 'checkbox',
              checked: toxicAlcoholState.hasRenalFailure,
            });
            chk.addEventListener('change', (e) => {
              toxicAlcoholState.hasRenalFailure = e.target.checked;
              render();
            });
            return chk;
          })(),
          h('span', {}, isEs ? 'Insuficiencia renal aguda / Oliguria / Cristales de oxalato (Etilenglicol)' : 'Acute renal failure / Oliguria / Calcium oxalate crystals (Ethylene Glycol)')
        ),
        h('label', { class: 'toxic-checkbox-label' },
          (() => {
            const chk = h('input', {
              id: 'chk-dialysis',
              type: 'checkbox',
              checked: toxicAlcoholState.hasHemodialysis,
            });
            chk.addEventListener('change', (e) => {
              toxicAlcoholState.hasHemodialysis = e.target.checked;
              render();
            });
            return chk;
          })(),
          h('span', {}, isEs ? 'Paciente en hemodiálisis activa (Requiere aumento de dosis de fomepizol/etanol)' : 'Patient currently on active hemodialysis (Requires fomepizole/ethanol dose adjustment)')
        )
      )
    );
    leftCol.appendChild(modCard);

    grid.appendChild(leftCol);

    // RIGHT COLUMN: Protocols, Regimens, Cofactors & SBAR Handoff
    const rightCol = h('div', { class: 'toxic-col' });

    // Card 3: Antidote & Cofactors Orders
    const txCard = h('section', { class: 'toxic-card' },
      h('h2', { class: 'toxic-card-title' },
        icon('check-circle'),
        h('span', {}, isEs ? '3. Órdenes Farmacológicas de Antídoto y Cofactores' : '3. Antidote & Cofactor Medical Orders')
      ),
      h('div', { class: `toxic-order-block ${toxicAlcoholState.agentId === 'isopropanol' ? 'warning' : 'primary'}` },
        h('strong', {}, isEs ? 'Pauta de Antídoto:' : 'Antidote Regimen:'),
        h('p', { class: 'toxic-order-text' }, isEs ? evalResult.antidoteRegimenEs : evalResult.antidoteRegimenEn)
      ),
      h('div', { class: 'toxic-order-block' },
        h('strong', {}, isEs ? 'Cofactores Vitamínicos:' : 'Vitamin Cofactor Therapy:'),
        h('p', { class: 'toxic-order-text' }, isEs ? evalResult.profile.cofactorsEs : evalResult.profile.cofactorsEn)
      ),
      h('div', { class: 'toxic-order-block' },
        h('strong', {}, isEs ? 'Directiva de Bicarbonato de Sodio (Atrapamiento Iónico):' : 'Sodium Bicarbonate Directive (Ion Trapping):'),
        h('p', { class: 'toxic-order-text' }, isEs ? evalResult.profile.bicarbonateDirectiveEs : evalResult.profile.bicarbonateDirectiveEn)
      ),
      h('div', { class: 'toxic-order-block' },
        h('strong', {}, isEs ? 'Criterios de Hemodiálisis de Emergencia (EXTRIP):' : 'Emergent Hemodialysis Criteria (EXTRIP):'),
        h('p', { class: 'toxic-order-text' }, isEs ? evalResult.profile.dialysisIndicationsEs : evalResult.profile.dialysisIndicationsEn)
      )
    );
    rightCol.appendChild(txCard);

    // Card 4: SBAR Clinical Toxicology Handoff
    const sbarCard = h('section', { class: 'toxic-card' },
      h('h2', { class: 'toxic-card-title' },
        icon('file-text'),
        h('span', {}, isEs ? '4. Resumen SBAR para Toxicología / UCI (Cero-PII)' : '4. Zero-PII SBAR Clinical Handoff Note')
      ),
      h('pre', { class: 'toxic-sbar-block', tabindex: '0' },
        isEs ? evalResult.sbarEs : evalResult.sbarEn
      ),
      h('div', { class: 'toxic-actions' },
        (() => {
          const btn = h('button', {
            type: 'button',
            class: 'btn btn-primary',
          },
            icon('copy'),
            h('span', {}, toxicAlcoholState.copied
              ? (isEs ? '¡Copiado!' : 'Copied!')
              : (isEs ? 'Copiar Resumen SBAR' : 'Copy SBAR Note'))
          );
          btn.addEventListener('click', async () => {
            const text = isEs ? evalResult.sbarEs : evalResult.sbarEn;
            try {
              if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
              }
              toxicAlcoholState.copied = true;
              announce(isEs ? 'Resumen copiado al portapapeles' : 'SBAR note copied to clipboard');
              render();
              setTimeout(() => {
                toxicAlcoholState.copied = false;
                render();
              }, 2500);
            } catch {
              announce(isEs ? 'Error al copiar' : 'Failed to copy');
            }
          });
          return btn;
        })(),
        (() => {
          const btn = h('button', {
            type: 'button',
            class: 'btn btn-ghost',
          }, isEs ? 'Restablecer Valores' : 'Reset Values');
          btn.addEventListener('click', () => {
            resetToxicAlcoholState();
          });
          return btn;
        })(),
        tel('1-800-222-1222', isEs ? 'Llamar a Toxicología (24/7)' : 'Call Poison Control (24/7)', 'btn btn-secondary')
      )
    );
    rightCol.appendChild(sbarCard);

    grid.appendChild(rightCol);
    container.appendChild(grid);
  }

  render();
  const unsubscribe = subscribeToxicAlcoholState(render);
  return container;
}
