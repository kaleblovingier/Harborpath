// public/js/views/pediatricIngestionDecon.js
// HarborPath - Pediatric & Adolescent Polysubstance Ingestion & Decontamination Decision Engine
// Clinical Consensus: AAP, ACMT, and Regional Poison Control Center Clinical Toxicological Directives.
// Special Focus: "One Pill Can Kill" Toddler Toxins, Activated Charcoal Window & Contraindications,
// Whole Bowel Irrigation (WBI), Weight-Based Pediatric Naloxone Titration, and Mandatory Observation Windows.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII, zero cookies.
// Security Invariant: Safe DOM manipulation via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// CLINICAL TOXICOLOGY TAXONOMY & CONSTANTS
// ============================================================================

export const ONE_PILL_CAN_KILL_LIST = Object.freeze({
  methadone: Object.freeze({
    id: 'methadone',
    nameEn: 'Methadone (Tablets or Oral Concentrate 10 mg/mL)',
    nameEs: 'Metadona (Comprimidos o Concentrado Oral 10 mg/mL)',
    fatalThresholdEn: 'As little as 5–10 mg (or 0.5–1.0 mL of 10 mg/mL solution) in a 10–15 kg toddler.',
    fatalThresholdEs: 'Tan solo 5-10 mg (o 0,5-1,0 mL de solución de 10 mg/mL) en un niño de 10-15 kg.',
    mechanismEn: 'Long-acting synthetic mu-opioid agonist with extensive tissue binding, large volume of distribution, and delayed terminal elimination half-life (up to 30–60 hours in pediatrics).',
    mechanismEs: 'Agonista opioide mu sintético de acción prolongada, alta liposolubilidad y semivida de eliminación retrasada (hasta 30-60 horas en pediatría).',
    syndromeEn: 'Progressive coma, severe bradypnea/apnea, pinpoint miosis, hypothermia, and delayed secondary respiratory arrest 12–24 hours post-ingestion as peak absorption completes.',
    syndromeEs: 'Coma progresivo, bradipnea o apnea grave, miosis puntiforme, hipotermia y paro respiratorio secundario tardío 12-24 horas después por absorción diferida.',
    minObsHours: 24,
    charcoalApplicable: true,
  }),

  buprenorphine: Object.freeze({
    id: 'buprenorphine',
    nameEn: 'Buprenorphine / Naloxone (Suboxone / Subutex Films/Tablets)',
    nameEs: 'Buprenorfina / Naloxona (Suboxone / Subutex Películas/Comprimidos)',
    fatalThresholdEn: 'A single 2 mg or 8 mg sublingual film or tablet.',
    fatalThresholdEs: 'Una sola película o comprimido sublingual de 2 mg u 8 mg.',
    mechanismEn: 'High-affinity partial mu-opioid agonist and kappa antagonist. The adult "ceiling effect" on respiratory depression DOES NOT reliably protect opioid-naive toddlers.',
    mechanismEs: 'Agonista parcial mu de muy alta afinidad. El «efecto techo» de adultos NO protege a niños pequeños no expuestos a opioides.',
    syndromeEn: 'Profound lethargy, delayed respiratory depression, and prolonged somnolence persisting for 24+ hours due to extremely slow receptor dissociation kinetics.',
    syndromeEs: 'Letargo profundo, depresión respiratoria tardía y somnolencia prolongada durante más de 24 horas por disociación lenta del receptor.',
    minObsHours: 24,
    charcoalApplicable: true,
  }),

  clonidine: Object.freeze({
    id: 'clonidine',
    nameEn: 'Clonidine & Central Alpha-2 Agonists (Tablets, Patches, Eye Drops)',
    nameEs: 'Clonidina y Agonistas Alfa-2 Centrales (Comprimidos, Parches, Colirios)',
    fatalThresholdEn: 'A single 0.1 mg tablet, 1–2 drops of 0.1% eye drop/nasal spray, or a discarded transdermal patch.',
    fatalThresholdEs: 'Un solo comprimido de 0,1 mg, 1-2 gotas de colirio/spray nasal, o un parche transdérmico usado.',
    mechanismEn: 'Stimulates presynaptic central alpha-2 adrenergic and imidazoline receptors, suppressing systemic sympathetic outflow.',
    mechanismEs: 'Estimula receptores presinápticos alfa-2 adrenérgicos e imidazolínicos centrales, anulando el tono simpático periférico.',
    syndromeEn: 'Pseudo-opioid toxidrome: Pinpoint pupils (miosis), profound coma, severe bradycardia (HR 40–60), alternating hypotension/hypertension, hypothermia, and periodic central apnea.',
    syndromeEs: 'Toxidrome pseudo-opioide: Miosis puntiforme, coma profundo, bradicardia grave (FC 40-60 lpm), tensión oscilante, hipotermia y apnea central periódica.',
    minObsHours: 24,
    charcoalApplicable: true,
  }),

  calcium_channel_blockers: Object.freeze({
    id: 'calcium_channel_blockers',
    nameEn: 'Calcium Channel Blockers (Verapamil / Diltiazem Extended-Release)',
    nameEs: 'Antagonistas del Calcio (Verapamilo / Diltiazem de Liberación Prolongada)',
    fatalThresholdEn: 'A single adult sustained-release tablet (e.g., Verapamil SR 120–240 mg).',
    fatalThresholdEs: 'Un solo comprimido para adultos de liberación prolongada (ej. Verapamilo Retard 120-240 mg).',
    mechanismEn: 'Blockade of L-type voltage-gated calcium channels in myocardium, conducting nodal tissue, peripheral arterioles, and pancreatic beta cells.',
    mechanismEs: 'Bloqueo de canales de calcio dependientes de voltaje tipo L en miocardio, tejido nodal, arteriolas y células beta pancreáticas.',
    syndromeEn: 'Profound refractory cardiogenic shock, complete heart block, marked vasoplegia, and severe hyperglycemia (due to inhibited insulin exocytosis). High pediatric mortality.',
    syndromeEs: 'Shock cardiogénico refractario grave, bloqueo AV completo, vasoplejía e hiperglucemia marcada (por inhibición de insulina). Alta mortalidad pediátrica.',
    minObsHours: 24,
    charcoalApplicable: true,
  }),

  sulfonylureas: Object.freeze({
    id: 'sulfonylureas',
    nameEn: 'Sulfonylureas (Glipizide, Glyburide, Glimepiride)',
    nameEs: 'Sulfonilureas (Glipizida, Glibenclamida, Glimepirida)',
    fatalThresholdEn: 'A single adult tablet (e.g., Glipizide 5 mg, Glyburide 2.5–5 mg).',
    fatalThresholdEs: 'Un solo comprimido para adultos (ej. Glipizida 5 mg, Glibenclamida 2,5-5 mg).',
    mechanismEn: 'Closes ATP-sensitive potassium channels in pancreatic beta cells, triggering autonomous, unregulated, persistent insulin exocytosis.',
    mechanismEs: 'Cierre de canales de potasio sensibles a ATP en células beta pancreáticas, provocando liberación masiva y autónoma de insulina.',
    syndromeEn: 'Severe, prolonged, refractory hypoglycemia (blood glucose < 40 mg/dL). Onset is insidiously delayed up to 8–18 hours; can cause irreversible neuroglycopenic brain injury or seizures.',
    syndromeEs: 'Hipoglucemia grave, prolongada y refractaria (<40 mg/dL). Su inicio suele retrasarse 8-18 horas; riesgo de coma neuroglucopénico irreversible o convulsiones.',
    minObsHours: 24,
    charcoalApplicable: true,
  }),

  tca: Object.freeze({
    id: 'tca',
    nameEn: 'Tricyclic Antidepressants (Amitriptyline, Nortriptyline)',
    nameEs: 'Antidepresivos Tricíclicos (Amitriptilina, Nortriptilina)',
    fatalThresholdEn: 'A single 50–100 mg adult tablet (toxic threshold 5–10 mg/kg in a toddler).',
    fatalThresholdEs: 'Un solo comprimido para adultos de 50-100 mg (umbral tóxico 5-10 mg/kg en niños).',
    mechanismEn: 'Fast sodium-channel blockade (Phase 0 depolarization), central muscarinic M1 blockade, peripheral alpha-1 antagonism, and potassium IKr inhibition.',
    mechanismEs: 'Bloqueo de canales rápidos de sodio (despolarización Fase 0), antagonismo muscarínico M1, bloqueo alfa-1 periférico e inhibición IKr.',
    syndromeEn: 'Hyperpyrexia, dilated pupils, rapid progression from delirium to coma, intractable status epilepticus, QRS widening (>100 ms), terminal R in aVR, and fatal ventricular arrhythmias.',
    syndromeEs: 'Hiperpirexia, midriasis, progresión rápida a coma, convulsiones refractarias, ensanchamiento de QRS (>100 ms), onda R terminal en aVR y arritmias ventriculares letales.',
    minObsHours: 24,
    charcoalApplicable: true,
  }),

  camphor: Object.freeze({
    id: 'camphor',
    nameEn: 'Camphor (Camphorated Oil, Topical Rubs, Solid Camphor Blocks)',
    nameEs: 'Alcanfor (Aceite Alcanforado, Pomadas Mentoladas, Bloques Sólidos)',
    fatalThresholdEn: '1 teaspoon of 20% camphorated oil (~1000 mg) or a single 1-gram solid block.',
    fatalThresholdEs: '1 cucharadita de aceite alcanforado al 20% (~1000 mg) o un solo bloque sólido de 1 g.',
    mechanismEn: 'Lipophilic terpene neurotoxin that rapidly crosses blood-brain barrier causing widespread uncontrolled central neuronal excitation.',
    mechanismEs: 'Neurotoxina lipofílica terpénica que atraviesa de inmediato la barrera hematoencefálica causando hiperexcitación neuronal masiva.',
    syndromeEn: 'Explosive onset of generalized tonic-clonic status epilepticus and respiratory arrest within 5–20 minutes of ingestion. Charcoal is strictly contraindicated if airway is compromised.',
    syndromeEs: 'Aparición fulminante de estatus epiléptico tónico-clónico y apnea en solo 5-20 minutos. El carbón está contraindicado si hay alteración neurológica.',
    minObsHours: 12,
    charcoalApplicable: false, // rapid absorption, high seizure risk
  }),
});

export const CHARCOAL_CONTRAINDICATIONS = Object.freeze([
  {
    id: 'unprotected_airway',
    nameEn: 'Depressed Mental Status / Unprotected Airway (No Intubation)',
    nameEs: 'Estado Mental Deprimido / Vía Aérea no Protegida (Sin Intubación)',
    reasonEn: 'Massive risk of pulmonary aspiration of activated charcoal, causing mechanical airway plugging, necrotizing chemical pneumonitis, and fatal asphyxiation.',
    reasonEs: 'Riesgo crítico de broncoaspiración masiva de carbón activado, neumonitis química necrosante y asfixia fatal.',
  },
  {
    id: 'hydrocarbons',
    nameEn: 'Hydrocarbons (Gasoline, Kerosene, Lighter Fluid, Lamp Oils)',
    nameEs: 'Hidrocarburos (Gasolina, Queroseno, Líquido de Mechero, Aceites)',
    reasonEn: 'Charcoal does NOT adsorb hydrocarbons; inducing vomiting triggers immediate volatile aspiration, leading to chemical pneumonitis and fatal ARDS.',
    reasonEs: 'El carbón NO absorbe hidrocarburos; el vómito induce aspiración inmediata y distrés respiratorio agudo grave.',
  },
  {
    id: 'corrosives',
    nameEn: 'Corrosives (Strong Acids & Alkalis, Drain Cleaners, Lye)',
    nameEs: 'Cáusticos (Ácidos Fuertes y Álcalis, Desatascadores, Lejía, Sosa)',
    reasonEn: 'Charcoal does NOT bind mineral acids/alkalis; causes emesis that re-injures the esophagus and coats mucosa in black residue, preventing emergent endoscopy.',
    reasonEs: 'El carbón NO fija ácidos ni álcalis; provoca vómitos que re-queman el esófago e impregna de negro la mucosa impidiendo la endoscopia.',
  },
  {
    id: 'bowel_obstruction',
    nameEn: 'Gastrointestinal Obstruction, Perforation, or Paralytic Ileus',
    nameEs: 'Obstrucción Intestinal, Perforación o Íleo Paralítico',
    reasonEn: 'Risk of charcoal bezoar formation, gastrointestinal inspissation, or leakage into peritoneal cavity causing chemical peritonitis.',
    reasonEs: 'Riesgo de formación de bezoar de carbón, impactación intestinal o paso al peritoneo con peritonitis química.',
  },
  {
    id: 'phails_substances',
    nameEn: 'PHAILS Subtances (Pesticides, Heavy Metals, Alcohols, Iron, Lithium)',
    nameEs: 'Sustancias Regla PHAILS (Pesticidas, Metales Pesados, Alcoholes, Hierro, Litio)',
    reasonEn: 'Charcoal has negligible or zero adsorption for PHAILS xenobiotics: Pesticides/Potassium, Heavy metals, Acids/Alkalis/Alcohols, Iron, Lithium, Solvents.',
    reasonEs: 'El carbón activado no absorbe sustancias de la regla PHAILS: Pesticidas, Metales pesados, Ácidos/Bases/Alcoholes, Hierro, Litio, Solventes.',
  },
]);

// ============================================================================
// EVALUATION ENGINE (PURE FUNCTION)
// ============================================================================

/**
 * Pure evaluation function for pediatric poison ingestion, decontamination eligibility,
 * naloxone weight titration, and observation duration.
 * @param {Object} input
 * @param {string} [input.substanceId='methadone'] - Key from ONE_PILL_CAN_KILL_LIST
 * @param {number} [input.weightKg=12] - Child weight in kg (toddler typical 10-15 kg)
 * @param {boolean} [input.isAlert=true] - Patient alert with intact protective airway
 * @param {number} [input.minutesSinceIngestion=45] - Minutes since ingestion
 * @param {Array<string>} [input.activeContraindications=[]] - Checked IDs from CHARCOAL_CONTRAINDICATIONS
 * @param {boolean} [input.isSustainedRelease=false] - Sustained-release or enteric-coated tablet
 * @param {boolean} [input.isApneic=false] - Child is in respiratory arrest or severe bradypnea
 * @param {boolean} [input.isNeonatalExposure=false] - In utero chronic opioid exposure history
 * @returns {Object} Comprehensive evaluation output
 */
export function evaluatePediatricIngestion(input = {}) {
  const substanceId = ONE_PILL_CAN_KILL_LIST[input.substanceId] ? input.substanceId : 'methadone';
  const substance = ONE_PILL_CAN_KILL_LIST[substanceId];
  const weightKg = Math.max(2, Math.min(60, Number(input.weightKg) || 12));
  const isAlert = Boolean(input.isAlert);
  const minutesSince = Math.max(0, Number(input.minutesSinceIngestion) || 0);
  const contraindications = Array.isArray(input.activeContraindications) ? input.activeContraindications : [];
  const isSustainedRelease = Boolean(input.isSustainedRelease);
  const isApneic = Boolean(input.isApneic);
  const isNeonatal = Boolean(input.isNeonatalExposure);

  // Activated Charcoal Eligibility
  const withinCharcoalWindow = minutesSince <= 120; // Up to 2 hours for delayed gastric emptying
  const hasContraindications = contraindications.length > 0 || !isAlert || !substance.charcoalApplicable;

  let charcoalEligible = false;
  let charcoalDoseGrams = 0;
  let charcoalRecommendationEn = '';
  let charcoalRecommendationEs = '';

  if (hasContraindications) {
    charcoalEligible = false;
    charcoalRecommendationEn = 'CHARCOAL STRICTLY CONTRAINDICATED. Do NOT administer activated charcoal or induce emesis due to high risk of pulmonary aspiration or lack of adsorption efficacy.';
    charcoalRecommendationEs = 'CARBÓN ACTIVADO ESTRICTAMENTE CONTRAINDICADO. NO administre carbón ni induzca el vómito por riesgo crítico de broncoaspiración o ineficacia de absorción.';
  } else if (!withinCharcoalWindow) {
    charcoalEligible = false;
    charcoalRecommendationEn = `CHARCOAL WINDOW CLOSED (${minutesSince} minutes elapsed > 120 min threshold). Xenobiotic has passed stomach into small bowel; activated charcoal is no longer clinically indicated.`;
    charcoalRecommendationEs = `VENTANA DE CARBÓN ACTIVADO CERRADA (${minutesSince} min transcurridos > umbral de 120 min). El tóxico ha pasado al intestino delgado; el carbón ya no está indicado.`;
  } else {
    charcoalEligible = true;
    charcoalDoseGrams = Math.min(50, Math.round(weightKg * 1.0)); // 1 g/kg, max 50g
    charcoalRecommendationEn = `ADMINISTER ACTIVATED CHARCOAL: ${charcoalDoseGrams} grams PO or via NG tube (1 g/kg for ${weightKg} kg child). Verify patient maintains intact protective airway reflexes throughout.`;
    charcoalRecommendationEs = `ADMINISTRAR CARBÓN ACTIVADO: ${charcoalDoseGrams} gramos VO o por sonda nasogástrica (1 g/kg para niño de ${weightKg} kg). Comprobar reflejos de vía aérea presentes en todo momento.`;
  }

  // Whole Bowel Irrigation (WBI) Assessment
  const wbiIndicated = isSustainedRelease && isAlert && !contraindications.includes('bowel_obstruction');
  const wbiRateMlHr = Math.round(weightKg * 30); // 25-40 mL/kg/hr for toddlers (approx 30 mL/kg)

  // Pediatric Naloxone Resuscitation Dosing
  let naloxoneDoseMg = 0;
  let naloxoneProtocolEn = '';
  let naloxoneProtocolEs = '';

  if (isNeonatal) {
    // Neonatal micro-titration to avoid precipitated withdrawal convulsions
    naloxoneDoseMg = Number((weightKg * 0.002).toFixed(3)); // 0.001 - 0.005 mg/kg
    naloxoneProtocolEn = `NEONATAL MICRO-TITRATION: ${naloxoneDoseMg} mg IV/IO (0.002 mg/kg). Avoid standard boluses which precipitate violent seizures, hypertension, and pulmonary hemorrhage in infants with in-utero exposure. Focus primarily on bag-valve-mask ventilation.`;
    naloxoneProtocolEs = `MICRO-TITULACIÓN NEONATAL: ${naloxoneDoseMg} mg IV/IO (0,002 mg/kg). Evite bolos estándar que provocan convulsiones graves y hemorragia pulmonar en lactantes con exposición intrauterina. Priorice ventilación con bolsa-mascarilla.`;
  } else if (isApneic) {
    // Cardiac arrest / Full Apnea: 0.1 mg/kg (max 2.0 mg)
    naloxoneDoseMg = Number(Math.min(2.0, weightKg * 0.1).toFixed(2));
    naloxoneProtocolEn = `RESUSCITATION BOLUS: ${naloxoneDoseMg} mg IV/IO (0.1 mg/kg for severe apnea/arrest). Deliver immediate 2-person bag-valve-mask ventilations with 100% O2.`;
    naloxoneProtocolEs = `BOLO DE REANIMACIÓN: ${naloxoneDoseMg} mg IV/IO (0,1 mg/kg en apnea/paro). Ventilación inmediata con bolsa-válvula-mascarilla y O2 al 100%.`;
  } else {
    // Titrated Hypoventilation: 0.01 mg/kg
    naloxoneDoseMg = Number(Math.min(0.4, weightKg * 0.01).toFixed(3));
    naloxoneProtocolEn = `TITRATED REVERSAL: ${naloxoneDoseMg} mg IV/IO/IM (0.01 mg/kg). Dilute 0.4 mg vial in 9 mL NS (40 mcg/mL) and administer slow aliquots q2min. Target: Spontaneous RR 12–20/min, NOT combative wakefulness.`;
    naloxoneProtocolEs = `REVERSIÓN TITULADA: ${naloxoneDoseMg} mg IV/IO/IM (0,01 mg/kg). Diluir ampolla de 0,4 mg en 9 mL de SSF (40 mcg/mL) e inyectar alícuotas lentas cada 2 min. Meta: FR 12-20 rpm, NO despertar combativo.`;
  }

  // Minimum Inpatient Observation Window
  const minObsHours = substance.minObsHours;

  // SBAR Clinical Handoff Note
  const sbarEn = [
    `[S] SITUATION: Pediatric ingestion of dangerous xenobiotic ("One Pill Can Kill"): ${substance.nameEn}. Patient weight: ${weightKg} kg.`,
    `[B] BACKGROUND: Ingestion occurred ~${minutesSince} minutes ago. Airway Status: ${isAlert ? 'Alert with intact reflexes' : 'DEPRESSED MENTATION / AIRWAY AT RISK'}. Sustained-Release: ${isSustainedRelease ? 'Yes' : 'No'}. Neonatal in-utero exposure: ${isNeonatal ? 'Yes' : 'No'}.`,
    `[A] ASSESSMENT: Toxic Potential: ${substance.fatalThresholdEn}`,
    `  • Clinical Toxidrome: ${substance.syndromeEn}`,
    `  • Decontamination Directive: ${charcoalRecommendationEn}`,
    ...(wbiIndicated ? [`  • Whole Bowel Irrigation: Indicated at ${wbiRateMlHr} mL/hr PEG-ELS via NG tube until clear rectal effluent.`] : []),
    `  • Naloxone Resuscitation: ${naloxoneProtocolEn}`,
    `  • Mandatory Observation: Minimum ${minObsHours} hours monitored inpatient telemetry. Naloxone half-life (60-90 min) is far shorter than methadone/buprenorphine.`,
    `[R] RECOMMENDATION: Admit to Pediatric ICU / Stepdown Telemetry. Consult Regional Poison Control Center (1-800-222-1222). Do NOT discharge early even if patient appears fully alert after initial naloxone reversal.`,
  ].join('\n');

  const sbarEs = [
    `[S] SITUACIÓN: Ingestión pediátrica de xenobiótico de alta letalidad («Una Pastilla Puede Matar»): ${substance.nameEs}. Peso del paciente: ${weightKg} kg.`,
    `[B] ANTECEDENTES: Ingesta hace ~${minutesSince} minutos. Estado de vía aérea: ${isAlert ? 'Alerta con reflejos presentes' : 'ESTADO MENTAL DEPRIMIDO / VÍA AÉREA EN RIESGO'}. Liberación prolongada: ${isSustainedRelease ? 'Sí' : 'No'}. Exposición intrauterina neonatal: ${isNeonatal ? 'Sí' : 'No'}.`,
    `[A] EVALUACIÓN: Umbral de Letalidad: ${substance.fatalThresholdEs}`,
    `  • Toxidrome Clínico: ${substance.syndromeEs}`,
    `  • Directiva de Descontaminación: ${charcoalRecommendationEs}`,
    ...(wbiIndicated ? [`  • Irrigación Intestinal Total: Indicada a ${wbiRateMlHr} mL/h de PEG-ELS por sonda hasta efluente rectal claro.`] : []),
    `  • Resucitación con Naloxona: ${naloxoneProtocolEs}`,
    `  • Observación Obligatoria: Mínimo ${minObsHours} horas de monitorización hospitalaria continua. La vida media de la naloxona (60-90 min) es mucho más corta que la de metadona o buprenorfina.`,
    `[R] RECOMENDACIÓN: Ingreso en UCIP / Telemetría Pediátrica. Contactar con Centro de Toxicología (1-800-222-1222). PROHIBIDO el alta precoz aunque el niño parezca despierto tras revertir con naloxona.`,
  ].join('\n');

  return {
    substanceId,
    substance,
    weightKg,
    isAlert,
    minutesSince,
    contraindications,
    isSustainedRelease,
    isApneic,
    isNeonatal,
    withinCharcoalWindow,
    hasContraindications,
    charcoalEligible,
    charcoalDoseGrams,
    charcoalRecommendationEn,
    charcoalRecommendationEs,
    wbiIndicated,
    wbiRateMlHr,
    naloxoneDoseMg,
    naloxoneProtocolEn,
    naloxoneProtocolEs,
    minObsHours,
    sbarEn,
    sbarEs,
  };
}

// ============================================================================
// EPHEMERAL IN-RAM STATE & VIEW CONTROLLER
// ============================================================================

const deconState = {
  substanceId: 'methadone',
  weightKg: 12,
  isAlert: true,
  minutesSinceIngestion: 40,
  activeContraindications: [],
  isSustainedRelease: false,
  isApneic: false,
  isNeonatalExposure: false,
  copied: false,
};

const listeners = new Set();
function notifyState() {
  for (const fn of listeners) fn();
}

export function getPediatricDeconState() {
  return { ...deconState, activeContraindications: [...deconState.activeContraindications] };
}

export function setPediatricDeconState(patch) {
  Object.assign(deconState, patch);
  notifyState();
}

export function resetPediatricDeconState() {
  Object.assign(deconState, {
    substanceId: 'methadone',
    weightKg: 12,
    isAlert: true,
    minutesSinceIngestion: 40,
    activeContraindications: [],
    isSustainedRelease: false,
    isApneic: false,
    isNeonatalExposure: false,
    copied: false,
  });
  notifyState();
}

export function subscribePediatricDeconState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// DOM VIEW IMPLEMENTATION (ZERO INNERHTML / ZERO INLINE STYLES)
// ============================================================================

export function pediatricIngestionDeconView() {
  const container = h('div', { class: 'pediatric-decon-view', role: 'region', 'aria-label': 'Pediatric Polysubstance Ingestion & Decontamination Decision Engine' });
  const isEs = getLang() === 'es';

  // Static Header & Emergency Callout
  container.append(
    pageHeader(
      isEs ? 'Navegador de Ingestas Pediátricas, Tóxicos Letales («Una Pastilla Puede Matar») y Descontaminación' : 'Pediatric & Adolescent Ingestion, "One Pill Can Kill" & Decontamination Decision Engine',
      isEs ? 'Guía de decisión clínica toxicológica (AAP/ACMT) para ingestas accidentales en niños: umbrales letales, ventana y contraindicaciones de carbón activado, irrigación intestinal total, titulación de naloxona por peso y observación obligatoria de 24 horas.' : 'AAP/ACMT clinical toxicological decision engine for accidental ingestions in toddlers and adolescents: lethal thresholds, activated charcoal eligibility and contraindications, whole bowel irrigation, weight-based naloxone resuscitation, and mandatory inpatient observation.'
    ),
    h('div', { class: 'decon-emergency-bar' },
      h('div', { class: 'decon-emergency-header' },
        icon('phone-call'),
        h('strong', null, isEs ? 'Centro de Control de Intoxicaciones y Toxicología (24 Horas):' : 'Regional Poison Control Center (24/7 National Hotline):'),
        tel('1-800-222-1222', '1-800-222-1222', { class: 'btn btn-danger btn-sm' })
      ),
      h('p', { class: 'text-sm text-muted' },
        isEs ? 'Servicio gratuito, confidencial y disponible 24/7 por toxicólogos clínicos. Llame de inmediato en caso de sospecha de ingesta tóxica.' : 'Free, confidential, 24/7 expert clinical toxicologist support. Call immediately for all suspected toddler and pediatric exposures.'
      )
    )
  );

  const grid = h('div', { class: 'decon-grid' });
  const leftCol = h('div', { class: 'decon-col' });
  const rightCol = h('div', { class: 'decon-col' });
  grid.append(leftCol, rightCol);
  container.append(grid);

  // Persistent controls (never rebuilt on keystroke)
  const substanceSel = h('select', { id: 'substance-select', class: 'decon-select' },
    Object.keys(ONE_PILL_CAN_KILL_LIST).map((k) => {
      const item = ONE_PILL_CAN_KILL_LIST[k];
      return h('option', { value: k, selected: deconState.substanceId === k }, isEs ? item.nameEs : item.nameEn);
    })
  );
  substanceSel.addEventListener('change', (e) => setPediatricDeconState({ substanceId: e.target.value }));
  const toxDetailsSlot = h('div', { class: 'decon-tox-details' });

  leftCol.append(
    h('div', { class: 'card decon-card' },
      h('h2', { class: 'decon-card-title' },
        icon('alert-octagon'),
        isEs ? '1. Sustancia Ingerida («Una Pastilla Puede Matar»)' : '1. Ingested Substance ("One Pill Can Kill")'
      ),
      h('label', { for: 'substance-select', class: 'decon-label' },
        isEs ? 'Seleccione el fármaco o toxina ingerida:' : 'Select ingested medication or xenobiotic:'
      ),
      substanceSel,
      toxDetailsSlot
    )
  );

  const weightInp = h('input', {
    id: 'weight-input',
    type: 'number',
    class: 'decon-num-input',
    value: String(deconState.weightKg),
    min: '2',
    max: '60',
    step: '0.5',
    'aria-label': isEs ? 'Peso en kg' : 'Weight in kg',
  });
  const timeInp = h('input', {
    id: 'time-input',
    type: 'number',
    class: 'decon-num-input',
    value: String(deconState.minutesSinceIngestion),
    min: '0',
    max: '1440',
    step: '5',
    'aria-label': isEs ? 'Minutos transcurridos' : 'Minutes elapsed',
  });
  weightInp.addEventListener('input', (e) => setPediatricDeconState({ weightKg: Number(e.target.value) || 12 }));
  timeInp.addEventListener('input', (e) => setPediatricDeconState({ minutesSinceIngestion: Number(e.target.value) || 0 }));

  const paramCheckDefs = [
    { id: 'is-alert', key: 'isAlert', label: isEs ? 'Paciente ALERTA con reflejos de tos y deglución intactos' : 'Patient ALERT with intact protective airway reflexes' },
    { id: 'is-sr', key: 'isSustainedRelease', label: isEs ? 'Formulación de liberación prolongada / cubierta entérica' : 'Sustained-release or enteric-coated formulation' },
    { id: 'is-apneic', key: 'isApneic', label: isEs ? 'Paro respiratorio o bradipnea crítica (<8 rpm o cianosis)' : 'Respiratory arrest or critical bradypnea (<8 bpm or cyanosis)' },
    { id: 'is-neonatal', key: 'isNeonatalExposure', label: isEs ? 'Recién nacido con exposición intrauterina crónica a opioides' : 'Neonate with chronic in-utero opioid exposure history' },
  ];
  const paramCheckRows = paramCheckDefs.map((def) => {
    const chk = h('input', { type: 'checkbox', id: def.id, checked: deconState[def.key], 'aria-label': def.label });
    chk.addEventListener('change', (e) => setPediatricDeconState({ [def.key]: e.target.checked }));
    return { def, chk, row: h('div', { class: 'decon-check-row' }, chk, h('label', { for: def.id }, def.label)) };
  });

  leftCol.append(
    h('div', { class: 'card decon-card' },
      h('h2', { class: 'decon-card-title' },
        icon('user'),
        isEs ? '2. Parámetros del Paciente Pediátrico' : '2. Pediatric Patient Parameters'
      ),
      h('div', { class: 'decon-input-group' },
        h('label', { class: 'decon-label', for: 'weight-input' }, isEs ? 'Peso del Niño (kg):' : 'Child Weight (kg):'),
        weightInp
      ),
      h('div', { class: 'decon-input-group' },
        h('label', { class: 'decon-label', for: 'time-input' }, isEs ? 'Tiempo Transcurrido desde la Ingesta (minutos):' : 'Minutes Elapsed Since Ingestion:'),
        timeInp
      ),
      h('div', { class: 'decon-checkbox-group' }, ...paramCheckRows.map((p) => p.row))
    )
  );

  // Contraindications card (persistent checkboxes)
  const contraCheckRows = CHARCOAL_CONTRAINDICATIONS.map((c) => {
    const chk = h('input', {
      type: 'checkbox',
      id: `contra-${c.id}`,
      checked: deconState.activeContraindications.includes(c.id),
      'aria-label': isEs ? c.nameEs : c.nameEn,
    });
    chk.addEventListener('change', (e) => {
      const next = new Set(deconState.activeContraindications);
      if (e.target.checked) next.add(c.id);
      else next.delete(c.id);
      setPediatricDeconState({ activeContraindications: Array.from(next) });
    });
    const row = h('div', { class: 'decon-check-row' },
      chk,
      h('label', { for: `contra-${c.id}`, class: 'decon-check-label' },
        h('strong', null, isEs ? c.nameEs : c.nameEn),
        h('span', { class: 'decon-subtext' }, isEs ? c.reasonEs : c.reasonEn)
      )
    );
    return { id: c.id, chk, row };
  });
  rightCol.append(
    h('div', { class: 'card decon-card' },
      h('h2', { class: 'decon-card-title text-warning' },
        icon('shield-alert'),
        isEs ? '3. Contraindicaciones de Carbón Activado (Comprobar)' : '3. Activated Charcoal Contraindications Checklist'
      ),
      h('p', { class: 'text-sm text-muted' },
        isEs ? 'Marque si existe alguna de las siguientes contraindicaciones absolutas:' : 'Check if any of the following absolute contraindications are present:'
      ),
      ...contraCheckRows.map((r) => r.row)
    )
  );

  const dynamicOutputSlot = h('div');
  rightCol.append(dynamicOutputSlot);

  function syncControls() {
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    if (active !== substanceSel) substanceSel.value = deconState.substanceId;
    if (active !== weightInp) weightInp.value = String(deconState.weightKg);
    if (active !== timeInp) timeInp.value = String(deconState.minutesSinceIngestion);
    paramCheckRows.forEach(({ def, chk }) => {
      if (active !== chk) chk.checked = Boolean(deconState[def.key]);
    });
    contraCheckRows.forEach(({ id, chk }) => {
      if (active !== chk) chk.checked = deconState.activeContraindications.includes(id);
    });
  }

  function renderDynamic() {
    syncControls();
    const evaluation = evaluatePediatricIngestion({
      substanceId: deconState.substanceId,
      weightKg: deconState.weightKg,
      isAlert: deconState.isAlert,
      minutesSinceIngestion: deconState.minutesSinceIngestion,
      activeContraindications: deconState.activeContraindications,
      isSustainedRelease: deconState.isSustainedRelease,
      isApneic: deconState.isApneic,
      isNeonatalExposure: deconState.isNeonatalExposure,
    });

    clear(toxDetailsSlot);
    toxDetailsSlot.append(
      h('p', null, h('strong', { class: 'text-danger' }, isEs ? 'Umbral Letal: ' : 'Lethal Threshold: '), isEs ? evaluation.substance.fatalThresholdEs : evaluation.substance.fatalThresholdEn),
      h('p', null, h('strong', null, isEs ? 'Mecanismo: ' : 'Mechanism: '), isEs ? evaluation.substance.mechanismEs : evaluation.substance.mechanismEn),
      h('p', null, h('strong', null, isEs ? 'Presentación Clínica: ' : 'Clinical Presentation: '), isEs ? evaluation.substance.syndromeEs : evaluation.substance.syndromeEn),
      h('div', { class: 'decon-obs-pill' },
        icon('clock'),
        h('span', null, `${isEs ? 'Observación Hospitalaria Mínima: ' : 'Mandatory Monitored Observation: '} ${evaluation.substance.minObsHours} ${isEs ? 'Horas' : 'Hours'}`)
      )
    );

    clear(dynamicOutputSlot);

    const deconCard = h('div', { class: `card decon-card ${evaluation.charcoalEligible ? 'card-success' : 'card-alert'}` },
      h('h2', { class: 'decon-card-title' },
        icon(evaluation.charcoalEligible ? 'check-circle' : 'alert-triangle'),
        isEs ? '4. Directiva de Descontaminación Gastrointestinal' : '4. Gastrointestinal Decontamination Directive'
      ),
      h('div', { class: 'decon-directive-box' },
        h('p', { class: 'decon-directive-text' }, isEs ? evaluation.charcoalRecommendationEs : evaluation.charcoalRecommendationEn)
      )
    );

    if (evaluation.wbiIndicated) {
      deconCard.append(
        h('div', { class: 'decon-wbi-box' },
          h('strong', null, isEs ? 'Irrigación Intestinal Total (WBI) Indicada:' : 'Whole Bowel Irrigation (WBI) Indicated:'),
          h('p', null, isEs
            ? `Administrar solución de polietilenglicol (PEG-ELS / GoLYTELY) por sonda nasogástrica a ${evaluation.wbiRateMlHr} mL/hora (25-40 mL/kg/h) hasta que el efluente rectal sea completamente claro y acuoso.`
            : `Administer polyethylene glycol electrolyte solution (PEG-ELS / GoLYTELY) via NG tube at ${evaluation.wbiRateMlHr} mL/hour (25-40 mL/kg/hr) continuously until rectal effluent is completely clear and watery.`)
        )
      );
    }

    const naloxCard = h('div', { class: 'card decon-card' },
      h('h2', { class: 'decon-card-title' },
        icon('zap'),
        isEs ? '5. Dosificación Pediátrica de Naloxona Titulada por Peso' : '5. Weight-Based Pediatric Naloxone Titration'
      ),
      h('div', { class: 'decon-nalox-badge' },
        h('strong', null, `${isEs ? 'Dosis Calculada: ' : 'Calculated Dose: '} ${evaluation.naloxoneDoseMg} mg IV / IO / IM`)
      ),
      h('p', { class: 'decon-nalox-desc' }, isEs ? evaluation.naloxoneProtocolEs : evaluation.naloxoneProtocolEn)
    );

    const copyBtn = h('button', {
      type: 'button',
      class: 'btn btn-primary',
      'aria-label': isEs ? 'Copiar Nota SBAR' : 'Copy SBAR Note',
    }, icon('copy'), isEs ? (deconState.copied ? '¡Copiado!' : 'Copiar Nota SBAR') : (deconState.copied ? 'Copied!' : 'Copy SBAR Note'));
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(isEs ? evaluation.sbarEs : evaluation.sbarEn);
        setPediatricDeconState({ copied: true });
        announce(isEs ? 'Nota SBAR copiada' : 'SBAR note copied');
        setTimeout(() => setPediatricDeconState({ copied: false }), 2500);
      } catch {
        announce(isEs ? 'Error al copiar' : 'Failed to copy');
      }
    });

    const resetBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary',
      'aria-label': isEs ? 'Restablecer' : 'Reset Form',
    }, icon('rotate-ccw'), isEs ? 'Restablecer' : 'Reset');
    resetBtn.addEventListener('click', () => {
      resetPediatricDeconState();
      announce(isEs ? 'Valores restablecidos' : 'State reset');
    });

    const sbarCard = h('div', { class: 'card decon-card' },
      h('h2', { class: 'decon-card-title' },
        icon('file-text'),
        isEs ? '6. Nota de Interconsulta SBAR para Centro de Toxicología / UCIP' : '6. SBAR Pediatric Toxicology Consultation Note'
      ),
      h('textarea', {
        class: 'decon-sbar-textarea',
        readonly: true,
        rows: 8,
        'aria-label': isEs ? 'Nota SBAR Pediátrica' : 'Pediatric SBAR Note',
      }, isEs ? evaluation.sbarEs : evaluation.sbarEn),
      h('div', { class: 'decon-btn-row' }, copyBtn, resetBtn)
    );

    dynamicOutputSlot.append(deconCard, naloxCard, sbarCard);
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

  const unsubscribe = subscribePediatricDeconState(onStateChange);
  renderDynamic();
  return container;
}
