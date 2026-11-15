// public/js/views/antimuscarinicTox.js
// Wave 67 Clinical Engine C: Antimuscarinic, Diphenhydramine Street-Cut & Psychotropic Delirium Navigator
// Clinical Consensus: ACMT, AACT, ACEP, and Regional Poison Control Clinical Toxicology Guidelines.
// Ephemeral in-RAM state ONLY (zero persistent browser storage, zero cookies, zero network calls, zero PII), CSP-safe DOM, WAI-ARIA AA.

import { h, clear, icon, copyText, announce, syncTablists, wireTablistKeyboard, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// 1. CLINICAL TAXONOMY & CONSENSUS DATA CONSTANTS
// ============================================================================

export const ANTIMUSCARINIC_PROFILES = Object.freeze({
  diphenhydramine_fentanyl_cut: Object.freeze({
    id: 'diphenhydramine_fentanyl_cut',
    nameEn: 'Diphenhydramine ("Sleep-Aid", Benadryl) & Fentanyl/Opioid Street-Cut Hybrid Overdose',
    nameEs: 'Sobredosis Híbrida por Difenhidramina ("Sleep-Aid", Benadryl) y Corte Callejero con Fentanilo/Opioides',
    streetNamesEn: '"Sleepy" / pink-powder cut, OTC "Sleep-Aid" or Benadryl blended with illicit fentanyl/nitazenes.',
    streetNamesEs: 'Corte "Sleepy" / polvo rosado ("pink dope"), "Sleep-Aid" o Benadryl mezclado con fentanilo/nitazenos.',
    mechanismEn: 'Dual toxidrome: (1) Street fentanyl/mu-opioid respiratory depression initially masks profound M1-M5 antimuscarinic toxicity. Once naloxone restores ventilation, acute anticholinergic delirium unmasks ("mad as a hatter, red as a beet, dry as a bone, blind as a bat, full as a flask"). (2) High-dose diphenhydramine causes direct myocardial Class Ia fast sodium-channel blockade (QRS > 100 ms, terminal R-wave in aVR, Brugada phenocopy, seizures, ventricular dysrhythmias) and hERG QTc prolongation.',
    mechanismEs: 'Toxidrome dual: (1) La depresión respiratoria por fentanilo enmascara inicialmente la toxicidad antimuscarínica M1-M5; tras revertir con naloxona emerge delirio anticolinérgico agudo. (2) Dosis altas de difenhidramina causan bloqueo directo Clase Ia de canales rápidos de sodio miocárdicos (QRS > 100 ms, onda R terminal en aVR, fenocopia Brugada, convulsiones, arritmias ventriculares) y prolongación del QTc.',
    hallmarksEn: Object.freeze([
      'Alternating or sequential opioid apnea (RR < 12) followed by post-naloxone agitated anticholinergic delirium',
      'Wide QRS >= 100 ms, terminal R > 3 mm in aVR, sinus tachycardia, or generalized tonic-clonic seizures',
      'Dry axillae/mucosa, absent bowel sounds, mydriasis (after naloxone), and acute urinary retention',
    ]),
    hallmarksEs: Object.freeze([
      'Apnea opioide inicial (FR < 12) seguida de delirio anticolinérgico agitado tras administrar naloxona',
      'QRS ancho >= 100 ms, onda R terminal > 3 mm en aVR, taquicardia sinusal o convulsiones tónico-clónicas',
      'Axilas y mucosas secas, ausencia de ruidos intestinales, midriasis (post-naloxona) y retención urinaria aguda',
    ]),
    antidoteSummaryEn: 'Airway/Rescue Breathing + Naloxone FIRST for apnea; STAT 8.4% Sodium Bicarbonate (1-2 mEq/kg IV) if QRS >= 100 ms or terminal R in aVR; IV Benzodiazepines + Foley bladder decompression for post-naloxone delirium. Avoid physostigmine in wide-QRS or sodium-channel diphenhydramine toxicity.',
    antidoteSummaryEs: 'Vía aérea/respiración de rescate + Naloxona PRIMERO ante apnea; Bicarbonato de Sodio 8.4% (1-2 mEq/kg IV) STAT si QRS >= 100 ms o R terminal en aVR; Benzodiacepinas IV + sonda vesical para el delirio post-naloxona. Evitar fisostigmina en QRS ancho o cardiotoxicidad por difenhidramina.',
    blackBoxEn: 'DUAL-RESCUE PRIORITY & NA+ CHANNEL CARDIOTOXICITY ALERT',
    blackBoxEs: 'PRIORIDAD DE RESCATE DUAL Y ALERTA DE CARDIOTOXICIDAD POR CANALES DE NA+',
    blackBoxDetailEn: 'Naloxone reverses fentanyl apnea but unmasks severe antimuscarinic agitation. Never administer physostigmine if QRS >= 100 ms or high-dose diphenhydramine Na+-channel cardiotoxicity is present; use 8.4% NaHCO3 + parenteral benzodiazepines.',
    blackBoxDetailEs: 'La naloxona revierte la apnea por fentanilo pero desenmascara agitación antimuscarínica severa. Nunca administre fisostigmina si hay QRS >= 100 ms o cardiotoxicidad por canales de Na+; use NaHCO3 8.4% + benzodiacepinas parenterales.',
    hasSodiumChannelRisk: true,
    isPureAnticholinergic: false,
    opioidCoingestionRisk: true,
    qtcRisk: true,
    physostigmineStrictlyForbidden: false,
  }),

  plant_alkaloid_scopolamine_datura: Object.freeze({
    id: 'plant_alkaloid_scopolamine_datura',
    nameEn: 'Scopolamine, Atropine, Jimsonweed (Datura) & Angel\'s Trumpet ("Borrachero") Alkaloid Toxicity',
    nameEs: 'Toxicidad por Alcaloides de Escopolamina, Atropina, Estramonio (Datura) y Floripondio ("Borrachero")',
    streetNamesEn: 'Jimsonweed seeds/tea (Datura stramonium), Angel\'s Trumpet (Brugmansia / "Borrachero"), "Burundanga" scopolamine, transdermal scopolamine patches.',
    streetNamesEs: 'Semillas/té de estramonio (Datura), floripondio ("Borrachero"), "Burundanga" (escopolamina), parches transdérmicos de escopolamina.',
    mechanismEn: 'Prolonged (24-72 hr) competitive central and peripheral M1-M5 muscarinic receptor antagonism WITHOUT intrinsic Class Ia sodium-channel cardiotoxicity. Severe anticholinergic ileus delays gastric emptying of seeds/plant matter, sustaining delirium, anhidrotic hyperthermia, dehydration, rhabdomyolysis, and traumatic self-injury from vivid tactile/Lilliputian hallucinations.',
    mechanismEs: 'Antagonismo competitivo prolongado (24-72 h) de receptores muscarínicos centrales y periféricos M1-M5 SIN cardiotoxicidad intrínseca en canales de sodio Clase Ia. El íleo retarda el vaciamiento gástrico de semillas, manteniendo delirio, hipertermia anhidrótica, deshidratación y autolesión traumática.',
    hallmarksEn: Object.freeze([
      'Protracted 24-72h fluctuating delirium ("picking at invisible threads", carphologia, visual hallucinations)',
      'Narrow QRS (< 100 ms) with sinus tachycardia, hot dry anhidrotic skin (hyperthermia risk), and marked mydriasis',
      'Silent bowel sounds, acute urinary retention ("full as a flask"), and risk of retained transdermal patch or plant bezoar',
    ]),
    hallmarksEs: Object.freeze([
      'Delirio fluctuante prolongado de 24-72 h (carfología, alucinaciones visuales/táctiles, riesgo de traumatismo)',
      'QRS estrecho (< 100 ms) con taquicardia sinusal, piel caliente y seca sin sudoración (hipertermia) y midriasis',
      'Íleo sin ruidos intestinales, retención urinaria aguda y posible parche retenido o bezoar vegetal gástrico',
    ]),
    antidoteSummaryEn: 'Ideal candidate for slow titrated IV Physostigmine (0.5-2 mg over 5 min on continuous cardiac telemetry + bedside atropine) — or oral/transdermal Rivastigmine (3-6 mg PO + patch protocol) during shortages — ONLY when ECG QRS < 100 ms and TCA/Na+-channel co-ingestion is excluded! Always inspect skin/mouth for retained patches or seeds, cool hyperthermia, and scan bladder.',
    antidoteSummaryEs: 'Candidato ideal para Fisostigmina IV titulada lenta (0.5-2 mg en 5 min bajo telemetría continua + atropina a la cabecera) — o Rivastigmina (3-6 mg VO + parche) durante desabastecimiento — ÚNICAMENTE con QRS < 100 ms y sin co-ingestión de ATC. Inspeccionar piel/boca por parches o semillas, enfriar hipertermia y escanear vejiga.',
    blackBoxEn: 'PROLONGED 24-72H ANHIDROTIC HYPERTHERMIA & STRICT NARROW-QRS (< 100 MS) REVERSAL GATE',
    blackBoxEs: 'HIPERTERMIA ANHIDRÓTICA PROLONGADA (24-72 H) Y PUERTA ESTRICTA DE QRS ESTRECHO (< 100 MS)',
    blackBoxDetailEn: 'Cholinergic reversal (Physostigmine 0.5-2 mg IV over 5 min or Rivastigmine shortage protocol) is permitted ONLY when QRS < 100 ms, TCA co-ingestion is absent, continuous cardiac telemetry is active, and atropine is at bedside. Rapidly cool hyperthermia > 39.5 C and protect from self-injury.',
    blackBoxDetailEs: 'La reversión colinérgica (Fisostigmina 0.5-2 mg IV en 5 min o protocolo con Rivastigmina) solo se permite con QRS < 100 ms, sin sospecha de ATC, bajo telemetría cardíaca continua y con atropina a la cabecera. Enfriar hipertermia > 39.5 C y prevenir autolesiones.',
    hasSodiumChannelRisk: false,
    isPureAnticholinergic: true,
    opioidCoingestionRisk: false,
    qtcRisk: false,
    physostigmineStrictlyForbidden: false,
  }),

  tca_doxepin_cyclobenzaprine: Object.freeze({
    id: 'tca_doxepin_cyclobenzaprine',
    nameEn: 'Tricyclic Antidepressant (Amitriptyline, Nortriptyline, Doxepin) & Cyclobenzaprine Sodium-Channel Hybrid',
    nameEs: 'Antidepresivos Tricíclicos (Amitriptilina, Nortriptilina, Doxepina) e Híbrido de Ciclobenzaprina en Canales de Sodio',
    streetNamesEn: 'Amitriptyline (Elavil), Nortriptyline, Doxepin, Imipramine, Cyclobenzaprine (Flexeril), Orphenadrine.',
    streetNamesEs: 'Amitriptilina, Nortriptilina, Doxepina, Imipramina, Ciclobenzaprina (Flexeril), Orfenadrina.',
    mechanismEn: 'Four-pathway lethal toxicity: (1) Potent fast cardiac sodium-channel blockade (QRS > 100 ms predicts ~34% seizure risk; QRS > 160 ms predicts ~50% ventricular arrhythmia/VF risk; terminal R > 3 mm in aVR); (2) Alpha-1 adrenergic antagonism causing refractory hypotension; (3) GABA-A antagonism triggering sudden status epilepticus (acidemia worsens TCA unbinding); (4) M1-M5 antimuscarinic delirium rapidly deteriorating into coma.',
    mechanismEs: 'Toxicidad letal en cuatro vías: (1) Bloqueo potente de canales rápidos de sodio (QRS > 100 ms predice convulsiones; QRS > 160 ms predice arritmias ventriculares letales; R terminal > 3 mm en aVR); (2) Bloqueo alfa-1 con hipotensión refractaria; (3) Antagonismo GABA-A con estatus epiléptico (la acidemia agrava el bloqueo); (4) Delirio antimuscarínico que evoluciona velozmente a coma.',
    hallmarksEn: Object.freeze([
      'QRS > 100 ms (seizure threshold), QRS > 160 ms (ventricular arrhythmia threshold), terminal R > 3 mm in aVR',
      'Rapid deterioration from anticholinergic delirium to coma, refractory seizures, and hypotension',
      'Acidemia exacerbates free unbound TCA fraction, creating a lethal vicious cycle unless alkalinized',
    ]),
    hallmarksEs: Object.freeze([
      'QRS > 100 ms (umbral de convulsiones), QRS > 160 ms (umbral de arritmia ventricular), R terminal > 3 mm en aVR',
      'Deterioro rápido desde delirio anticolinérgico a coma, convulsiones refractarias e hipotensión',
      'La acidemia aumenta la fracción libre de ATC, agravando el colapso cardíaco sin alcalinización',
    ]),
    antidoteSummaryEn: 'STAT 8.4% Sodium Bicarbonate (1-2 mEq/kg IV bolus, target QRS < 100 ms & arterial pH 7.45-7.55) + Benzodiazepines for seizures + Norepinephrine for alpha-1 hypotension + Lidocaine second-line if refractory arrhythmia (avoid Class Ia/Ic & flumazenil). ABSOLUTE CONTRAINDICATION TO PHYSOSTIGMINE & RIVASTIGMINE.',
    antidoteSummaryEs: 'Bicarbonato de Sodio 8.4% STAT (bolo 1-2 mEq/kg IV, meta QRS < 100 ms y pH 7.45-7.55) + Benzodiacepinas para convulsiones + Norepinefrina para hipotensión alfa-1 + Lidocaína en segunda línea si arritmia refractaria (evitar Clase Ia/Ic y flumazenilo). CONTRAINDICACIÓN ABSOLUTA DE FISOSTIGMINA Y RIVASTIGMINA.',
    blackBoxEn: 'ABSOLUTE CONTRAINDICATION TO PHYSOSTIGMINE — FATAL ASYSTOLE & STATUS EPILEPTICUS',
    blackBoxEs: 'CONTRAINDICACIÓN ABSOLUTA DE FISOSTIGMINA — ASISTOLIA FATAL Y ESTATUS EPILÉPTICO',
    blackBoxDetailEn: 'NEVER administer physostigmine or rivastigmine in suspected TCA or cyclobenzaprine overdose (even if initial QRS is still narrow!). Unopposed cholinergic surge during cardiac conduction blockade precipitates fatal asystole, complete AV block, and refractory status epilepticus.',
    blackBoxDetailEs: 'NUNCA administre fisostigmina ni rivastigmina ante sospecha de ATC o ciclobenzaprina (aun con QRS inicialmente estrecho). El estímulo colinérgico durante el bloqueo de conducción precipita asistolia mortal, bloqueo AV completo y estatus epiléptico refractario.',
    hasSodiumChannelRisk: true,
    isPureAnticholinergic: false,
    opioidCoingestionRisk: false,
    qtcRisk: true,
    physostigmineStrictlyForbidden: true,
  }),

  antipsychotic_antihistamine_polysubstance: Object.freeze({
    id: 'antipsychotic_antihistamine_polysubstance',
    nameEn: 'Atypical Antipsychotic (Quetiapine/Olanzapine/Chlorpromazine) & OTC Antihistamine Co-Ingestion',
    nameEs: 'Co-Ingestión de Antipsicótico Atípico (Quetiapina/Olanzapina/Clorpromazina) y Antihistamínico OTC',
    streetNamesEn: 'Quetiapine ("Suzie-Q", "Baby Heroin"), Olanzapine, Clozapine, Chlorpromazine + Diphenhydramine, Doxylamine, Hydroxyzine.',
    streetNamesEs: 'Quetiapina, Olanzapina, Clozapina, Clorpromazina + Difenhidramina, Doxilamina, Hidroxicina.',
    mechanismEn: 'Synergistic M1 antimuscarinic delirium and H1 coma combined with (1) hERG potassium-channel (IKr) blockade driving QTc prolongation >= 500 ms and Torsades de Pointes, (2) peripheral alpha-1 adrenergic blockade causing severe orthostatic and vasodilatory hypotension, and (3) neuroleptic dopamine/thermoregulatory synergy.',
    mechanismEs: 'Sinergia de delirio antimuscarínico M1 y sedación H1 combinada con (1) bloqueo de canales de potasio hERG causando QTc >= 500 ms y Torsades de Pointes, (2) bloqueo alfa-1 con hipotensión ortostática/vasodilatadora severa y (3) sinergia neuroléptica.',
    hallmarksEn: Object.freeze([
      'QTc >= 500 ms or polymorphic ventricular tachycardia (Torsades de Pointes); massive quetiapine may also widen QRS',
      'Refractory vasodilatory/orthostatic hypotension from alpha-1 blockade (epinephrine can worsen hypotension via beta-2)',
      'Fluctuating agitated delirium ("olanzapine/quetiapine delirium") alternating with deep CNS depression and urinary retention',
    ]),
    hallmarksEs: Object.freeze([
      'QTc >= 500 ms o taquicardia ventricular polimórfica (Torsades de Pointes); dosis masivas de quetiapina pueden ensanchar QRS',
      'Hipotensión vasodilatadora/ortostática por bloqueo alfa-1 (la epinefrina empeora la hipotensión por efecto beta-2)',
      'Delirio agitado fluctuante alternando con depresión profunda del SNC y retención urinaria aguda',
    ]),
    antidoteSummaryEn: 'IV Magnesium Sulfate 2 g over 10 min + K+ > 4.0-4.5 mEq/L for QTc >= 500 ms / Torsades; Norepinephrine (avoid epinephrine) for alpha-1 hypotension; 8.4% NaHCO3 if QRS >= 100 ms. Manage agitation with parenteral Benzodiazepines + Bladder Scan/Foley decompression. STRICTLY PROHIBIT haloperidol, droperidol, or chlorpromazine.',
    antidoteSummaryEs: 'Sulfato de Magnesio 2 g IV en 10 min + K+ > 4.0-4.5 mEq/L si QTc >= 500 ms / Torsades; Norepinefrina (evitar epinefrina) para hipotensión alfa-1; NaHCO3 8.4% si QRS >= 100 ms. Manejar agitación con Benzodiacepinas parenterales + sonda vesical. PROHIBIR ESTRICTAMENTE haloperidol, droperidol o clorpromazina.',
    blackBoxEn: 'QTC >= 500 MS / TORSADES, ALPHA-1 HYPOTENSION & NEUROLEPTIC SYNERGY ALERT',
    blackBoxEs: 'ALERTA DE QTC >= 500 MS / TORSADES, HIPOTENSIÓN ALFA-1 Y SINERGIA NEUROLÉPTICA',
    blackBoxDetailEn: 'NEVER give haloperidol, droperidol, or chlorpromazine for antimuscarinic agitation — they stack QTc prolongation (precipitating Torsades de Pointes) and add antimuscarinic burden. Avoid epinephrine in alpha-1 blocked quetiapine/chlorpromazine hypotension (use norepinephrine). Avoid physostigmine in mixed polysubstance conduction toxicity.',
    blackBoxDetailEs: 'NUNCA administre haloperidol, droperidol ni clorpromazina para la agitación — suman prolongación del QTc (Torsades de Pointes) y carga antimuscarínica. Evite epinefrina en hipotensión alfa-1 (use norepinefrina). Evite fisostigmina en co-ingestiones mixtas.',
    hasSodiumChannelRisk: true,
    isPureAnticholinergic: false,
    opioidCoingestionRisk: false,
    qtcRisk: true,
    physostigmineStrictlyForbidden: false,
  }),
});

export const ANTIMUSCARINIC_RED_FLAGS = Object.freeze([
  Object.freeze({
    id: 'flag_qrs_wide_avr',
    fatal: true,
    labelEn: 'ECG QRS >= 100 ms OR terminal R wave > 3 mm in lead aVR (Na+-channel blockade / NaHCO3 trigger)',
    labelEs: 'ECG QRS >= 100 ms U onda R terminal > 3 mm en aVR (bloqueo canales Na+ / disparo de NaHCO3)',
  }),
  Object.freeze({
    id: 'flag_qtc_500',
    fatal: true,
    labelEn: 'QTc >= 500 ms OR polymorphic VT / Torsades de Pointes (MgSO4 2 g IV; prohibit antipsychotics)',
    labelEs: 'QTc >= 500 ms O TV polimórfica / Torsades de Pointes (MgSO4 2 g IV; prohibir antipsicóticos)',
  }),
  Object.freeze({
    id: 'flag_seizure_hyperthermia',
    fatal: true,
    labelEn: 'Active seizures OR hyperthermia > 39.5 C (103.1 F) with dry, hot, anhidrotic skin',
    labelEs: 'Convulsiones activas O hipertermia > 39.5 C (103.1 F) con piel seca, caliente y sin sudoración',
  }),
  Object.freeze({
    id: 'flag_delirium_bladder_retention',
    fatal: false,
    labelEn: 'Severe agitated delirium + inability to void / suprapubic bladder distension (Bladder Scan Trigger!)',
    labelEs: 'Delirio agitado severo + incapacidad de orinar / globo vesical suprapúbico (¡Disparo de Escaneo Vesical!)',
  }),
  Object.freeze({
    id: 'flag_tca_suspected',
    fatal: true,
    labelEn: 'Suspected TCA (amitriptyline, nortriptyline, doxepin) or cyclobenzaprine co-ingestion (ABSOLUTE Physostigmine Block)',
    labelEs: 'Sospecha de co-ingestión con ATC (amitriptilina, nortriptilina, doxepina) o ciclobenzaprina (Bloqueo ABSOLUTO de Fisostigmina)',
  }),
  Object.freeze({
    id: 'flag_fentanyl_apnea',
    fatal: true,
    labelEn: 'Co-ingested street fentanyl / suppressed respiratory rate (RR < 12 or SpO2 < 92%) needing Naloxone FIRST',
    labelEs: 'Fentanilo callejero co-ingerido / depresión respiratoria (FR < 12 o SpO2 < 92%) que requiere Naloxona PRIMERO',
  }),
]);

export const TOXIDROME_DIFFERENTIAL_ROWS = Object.freeze([
  Object.freeze({
    domainEn: 'Skin & Sweat (Axillae Check)',
    domainEs: 'Piel y Sudoración (Revisar Axilas)',
    anticholinergicEn: 'DRY as a bone, hot, flushed ("red as a beet"); completely dry axillae (anhidrosis)',
    anticholinergicEs: 'SECA como un hueso, caliente y enrojecida; axilas completamente secas (anhidrosis)',
    sympathomimeticEn: 'DIAPHORETIC (drenched, sweaty skin, wet axillae)',
    sympathomimeticEs: 'DIAFORÉTICA (sudoración profusa, piel húmeda, axilas mojadas)',
  }),
  Object.freeze({
    domainEn: 'Bowel Sounds & GI Motility',
    domainEs: 'Ruidos Intestinales y Motilidad GI',
    anticholinergicEn: 'NO BOWEL SOUNDS / markedly hypoactive ileus (delays pill/seed absorption)',
    anticholinergicEs: 'SIN RUIDOS INTESTINALES / íleo hipoactivo marcado (retrasa absorción)',
    sympathomimeticEn: 'Normal or HYPERACTIVE bowel sounds',
    sympathomimeticEs: 'Ruidos intestinales normales o HIPERACTIVOS',
  }),
  Object.freeze({
    domainEn: 'Bladder / Urinary Status',
    domainEs: 'Vejiga / Estado Urinario',
    anticholinergicEn: 'Acute urinary retention ("full as a flask" — silent driver of severe agitation!)',
    anticholinergicEs: 'Retención urinaria aguda (globo vesical — ¡causa silenciosa de agitación severa!)',
    sympathomimeticEn: 'Voiding intact / bladder not distended',
    sympathomimeticEs: 'Micción conservada / sin globo vesical',
  }),
  Object.freeze({
    domainEn: 'Pupils',
    domainEs: 'Pupilas',
    anticholinergicEn: 'Marked mydriasis, sluggish/unreactive ("blind as a bat"; pinpoint if opioid-cut BEFORE naloxone!)',
    anticholinergicEs: 'Midriasis marcada poco reactiva (¡puede verse miosis si hay corte con fentanilo ANTES de naloxona!)',
    sympathomimeticEn: 'Mydriasis, typically briskly reactive to light',
    sympathomimeticEs: 'Midriasis, habitualmente reactiva a la luz',
  }),
  Object.freeze({
    domainEn: 'Delirium & Speech',
    domainEs: 'Delirio y Lenguaje',
    anticholinergicEn: 'Mumbling incoherent speech, picking at invisible threads/insects (carphologia), visual hallucinations',
    anticholinergicEs: 'Habla farfullante incoherente, carfología (recoger hilos invisibles), alucinaciones visuales',
    sympathomimeticEn: 'Pressured speech, hypervigilance, paranoia, goal-directed motor agitation',
    sympathomimeticEs: 'Verborrea, hipervigilancia, paranoia, agitación motora intensa',
  }),
  Object.freeze({
    domainEn: 'Temperature & Cardiovascular',
    domainEs: 'Temperatura y Cardiovascular',
    anticholinergicEn: 'Tachycardia, anhidrotic hyperthermia ("hot as a hare"); wide QRS if Na+-channel blocker (diphenhydramine/TCA)',
    anticholinergicEs: 'Taquicardia, hipertermia anhidrótica; QRS ancho si bloquea Na+ (difenhidramina/ATC)',
    sympathomimeticEn: 'Tachycardia, marked hypertension, exertional/metabolic hyperthermia',
    sympathomimeticEs: 'Taquicardia, hipertensión marcada, hipertermia por actividad muscular',
  }),
]);

// ============================================================================
// 2. PURE CLINICAL EVALUATORS & CALCULATORS
// ============================================================================

function parseFiniteNumber(val, fallback) {
  if (val === '' || val === null || val === undefined) return fallback;
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeFlagSet(checkedFlags) {
  if (checkedFlags instanceof Set) return checkedFlags;
  if (Array.isArray(checkedFlags)) return new Set(checkedFlags);
  return new Set();
}

/**
 * Pure calculator for 8.4% Sodium Bicarbonate dosing (wide QRS Na+-channel blockade)
 * and the strict Cholinergic Reversal Eligibility Gate (Physostigmine / Rivastigmine).
 */
export function calculateBicarbonateAndReversal(
  weightKg = 70,
  qrsMs = 90,
  tcaSuspected = false,
  isolatedPureAnticholinergic = false,
) {
  const safeWeightKg = Math.max(5, Math.min(250, parseFiniteNumber(weightKg, 70)));
  const safeQrsMs = Math.max(40, Math.min(350, parseFiniteNumber(qrsMs, 90)));
  const isTca = Boolean(tcaSuspected);
  const isIsolatedPure = Boolean(isolatedPureAnticholinergic);

  // 8.4% Sodium Bicarbonate (1 mEq/mL): 1-2 mEq/kg IV push when QRS >= 100 ms
  const bicarbonateIndicated = safeQrsMs >= 100;
  const bicarbonateMinMeq = Math.round(safeWeightKg * 1);
  const bicarbonateMaxMeq = Math.round(safeWeightKg * 2);

  let qrsRiskTier = 'narrow';
  if (safeQrsMs >= 160) {
    qrsRiskTier = 'critical_ventricular_arrhythmia';
  } else if (safeQrsMs >= 100) {
    qrsRiskTier = 'wide_seizure_and_na_block';
  }

  const bicarbonateDoseTextEn = bicarbonateIndicated
    ? `STAT 8.4% Sodium Bicarbonate Bolus: ${bicarbonateMinMeq}-${bicarbonateMaxMeq} mEq IV push (1-2 mEq/kg for ${safeWeightKg} kg; ${bicarbonateMinMeq}-${bicarbonateMaxMeq} mL of 8.4% NaHCO3) over 1-2 min; repeat q3-5min until QRS < 100 ms, then infuse 150 mEq NaHCO3 in 1 L D5W at 150-250 mL/hr.`
    : `8.4% NaHCO3 Standby (${bicarbonateMinMeq}-${bicarbonateMaxMeq} mEq if QRS widens >= 100 ms): Current QRS ${safeQrsMs} ms is < 100 ms. Obtain serial 12-lead ECGs every 15-30 minutes.`;

  const bicarbonateDoseTextEs = bicarbonateIndicated
    ? `Bolo STAT de Bicarbonato de Sodio 8.4%: ${bicarbonateMinMeq}-${bicarbonateMaxMeq} mEq IV directo (1-2 mEq/kg para ${safeWeightKg} kg; ${bicarbonateMinMeq}-${bicarbonateMaxMeq} mL de NaHCO3 8.4%) en 1-2 min; repetir c/3-5 min hasta QRS < 100 ms, luego infusión (150 mEq en 1 L D5W a 150-250 mL/h).`
    : `NaHCO3 8.4% en Reserva (${bicarbonateMinMeq}-${bicarbonateMaxMeq} mEq si QRS >= 100 ms): QRS actual ${safeQrsMs} ms < 100 ms. Realizar ECG seriados cada 15-30 minutos.`;

  const bicarbonateTargetEn = 'Target QRS < 100 ms & arterial pH 7.45-7.55 (monitor serum K+ and avoid pH > 7.55)';
  const bicarbonateTargetEs = 'Meta QRS < 100 ms y pH arterial 7.45-7.55 (vigilar K+ sérico y evitar pH > 7.55)';

  const antiarrhythmicRuleEn = 'AVOID Class Ia/Ic antiarrhythmics (procainamide, quinidine, flecainide, propafenone) — they worsen sodium-channel blockade. Use Lidocaine (1-1.5 mg/kg IV bolus, then 1-4 mg/min) second-line if ventricular arrhythmia is refractory to NaHCO3 and hyperventilation.';
  const antiarrhythmicRuleEs = 'EVITAR antiarrítmicos Clase Ia/Ic (procainamida, quinidina, flecainida, propafenona) — agravan el bloqueo de canales de Na+. Usar Lidocaína (bolo 1-1.5 mg/kg IV, luego 1-4 mg/min) en segunda línea si la arritmia es refractaria a NaHCO3 e hiperventilación.';

  // Strict Cholinergic Antidote Eligibility Gate
  const isWideQrs = safeQrsMs >= 100;
  const physostigmineEligible = !isWideQrs && !isTca && isIsolatedPure;
  const physostigmineBlocked = !physostigmineEligible;

  let blockReason = null;
  let blackBoxWarningEn = '';
  let blackBoxWarningEs = '';
  let physostigmineDoseEn = '';
  let physostigmineDoseEs = '';
  let rivastigmineGuidanceEn = '';
  let rivastigmineGuidanceEs = '';
  let monitoringRequirementsEn = '';
  let monitoringRequirementsEs = '';

  if (isTca || isWideQrs) {
    blockReason = 'fatal_tca_or_wide_qrs';
    blackBoxWarningEn = `BLACK-BOX ABSOLUTE BLOCK: Physostigmine & Rivastigmine are STRICTLY CONTRAINDICATED (${isTca ? 'TCA/cyclobenzaprine suspected' : ''}${isTca && isWideQrs ? ' + ' : ''}${isWideQrs ? `QRS ${safeQrsMs} ms >= 100 ms` : ''}) due to risk of FATAL ASYSTOLE, complete AV block, and refractory status epilepticus!`;
    blackBoxWarningEs = `BLOQUEO ABSOLUTO DE CAJA NEGRA: Fisostigmina y Rivastigmina ESTRICTAMENTE CONTRAINDICADAS (${isTca ? 'sospecha de ATC/ciclobenzaprina' : ''}${isTca && isWideQrs ? ' + ' : ''}${isWideQrs ? `QRS ${safeQrsMs} ms >= 100 ms` : ''}) por riesgo de ASISTOLIA FATAL, bloqueo AV completo y estatus epiléptico refractario.`;
    physostigmineDoseEn = 'STRICTLY BLOCKED — Do NOT administer physostigmine. Manage agitation/seizures with parenteral benzodiazepines and treat wide QRS with 8.4% NaHCO3.';
    physostigmineDoseEs = 'ESTRICTAMENTE BLOQUEADA — NO administrar fisostigmina. Manejar agitación/convulsiones con benzodiacepinas parenterales y QRS ancho con NaHCO3 8.4%.';
    rivastigmineGuidanceEn = 'BLOCKED: Do NOT initiate oral or transdermal rivastigmine when TCA co-ingestion is suspected or QRS >= 100 ms.';
    rivastigmineGuidanceEs = 'BLOQUEADA: NO iniciar rivastigmina oral ni transdérmica ante sospecha de ATC o QRS >= 100 ms.';
    monitoringRequirementsEn = 'Continuous cardiac telemetry, serial 12-lead ECGs q15min, arterial/venous pH 7.45-7.55 during NaHCO3 therapy.';
    monitoringRequirementsEs = 'Telemetría cardíaca continua, ECG de 12 derivaciones cada 15 min, pH 7.45-7.55 durante terapia con NaHCO3.';
  } else if (!isIsolatedPure) {
    blockReason = 'unconfirmed_or_polysubstance';
    blackBoxWarningEn = 'CHOLINERGIC REVERSAL HELD: Exposure is not confirmed as isolated pure antimuscarinic delirium (possible diphenhydramine Na+ risk, opioid cut, or antipsychotic co-ingestion). Default to parenteral benzodiazepines + bladder decompression.';
    blackBoxWarningEs = 'REVERSIÓN COLINÉRGICA RETENIDA: No confirmado como delirio antimuscarínico puro aislado (posible riesgo Na+ por difenhidramina, corte opioide o antipsicótico). Usar benzodiacepinas parenterales + descompresión vesical.';
    physostigmineDoseEn = 'HELD — Confirm isolated pure antimuscarinic poisoning (e.g., scopolamine/Datura) with narrow QRS < 100 ms and zero TCA/Na+-channel risk before cholinergic reversal.';
    physostigmineDoseEs = 'RETENIDA — Confirmar intoxicación antimuscarínica pura aislada (ej. escopolamina/Datura) con QRS < 100 ms y sin riesgo de ATC/Na+ antes de revertir.';
    rivastigmineGuidanceEn = 'HELD — Rivastigmine shortage protocol (3-6 mg PO + transdermal patch) applies ONLY once isolated pure antimuscarinic delirium with QRS < 100 ms and no TCA is confirmed.';
    rivastigmineGuidanceEs = 'RETENIDA — El protocolo con rivastigmina (3-6 mg VO + parche) aplica SOLO tras confirmar delirio antimuscarínico puro aislado con QRS < 100 ms y sin ATC.';
    monitoringRequirementsEn = 'Serial 12-lead ECGs, continuous cardiac telemetry, and respiratory monitoring.';
    monitoringRequirementsEs = 'ECG seriados, telemetría cardíaca continua y monitoreo respiratorio.';
  } else {
    physostigmineDoseEn = 'ELIGIBLE (Narrow QRS < 100 ms & NO TCA): Slow titrated IV Physostigmine 0.5-2 mg (pediatric 0.02 mg/kg, max 0.5 mg) over 5 minutes ONLY on continuous cardiac telemetry with Atropine (0.5-1 mg IV) at bedside!';
    physostigmineDoseEs = 'ELEGIBLE (QRS estrecho < 100 ms y SIN ATC): Fisostigmina IV titulada lenta 0.5-2 mg (pediátrica 0.02 mg/kg, máx 0.5 mg) en 5 minutos ÚNICAMENTE bajo telemetría cardíaca continua con Atropina (0.5-1 mg IV) a la cabecera.';
    rivastigmineGuidanceEn = 'Physostigmine Shortage Protocol (Rivastigmine): Administer Rivastigmine 3-6 mg PO (if airway protected) + transdermal Rivastigmine patch (4.6-9.5 mg/24h; slower 1-2h PO / 8-12h patch onset) with serial ECG monitoring and parenteral benzodiazepines for breakthrough agitation.';
    rivastigmineGuidanceEs = 'Protocolo ante Escasez de Fisostigmina (Rivastigmina): Administrar Rivastigmina 3-6 mg VO (con vía aérea protegida) + parche transdérmico de Rivastigmina (4.6-9.5 mg/24h; inicio más lento 1-2 h VO / 8-12 h parche) con ECG seriados y benzodiacepinas para agitación.';
    monitoringRequirementsEn = 'Mandatory Safeguards: Continuous 5-lead cardiac telemetry, Atropine 0.5-1 mg IV drawn up at bedside (for cholinergic bradycardia/bronchorrhea), and continuous SpO2.';
    monitoringRequirementsEs = 'Resguardos Obligatorios: Telemetría cardíaca continua de 5 derivaciones, Atropina 0.5-1 mg IV preparada a la cabecera (por bradicardia/broncorrea colinérgica) y SpO2 continua.';
  }

  return {
    weightKg: safeWeightKg,
    qrsMs: safeQrsMs,
    tcaSuspected: isTca,
    isolatedPureAnticholinergic: isIsolatedPure,
    qrsRiskTier,
    bicarbonateIndicated,
    bicarbonateMinMeq,
    bicarbonateMaxMeq,
    bicarbonateDoseTextEn,
    bicarbonateDoseTextEs,
    bicarbonateTargetEn,
    bicarbonateTargetEs,
    antiarrhythmicRuleEn,
    antiarrhythmicRuleEs,
    physostigmineEligible,
    physostigmineBlocked,
    blockReason,
    blackBoxWarningEn,
    blackBoxWarningEs,
    physostigmineDoseEn,
    physostigmineDoseEs,
    rivastigmineGuidanceEn,
    rivastigmineGuidanceEs,
    monitoringRequirementsEn,
    monitoringRequirementsEs,
  };
}

/**
 * Pure risk evaluation engine returning triage severity, bedside differential,
 * bladder scan + Foley decompression rule, antipsychotic prohibition rule, alerts, and actions.
 */
export function evaluateAntimuscarinicRisk(state = {}) {
  const rawProfileId = state.profileId || state.profile || state.substance;
  const profile = ANTIMUSCARINIC_PROFILES[rawProfileId] || ANTIMUSCARINIC_PROFILES.diphenhydramine_fentanyl_cut;
  const flags = normalizeFlagSet(state.checkedFlags);

  const safeWeightKg = Math.max(5, Math.min(250, parseFiniteNumber(state.weightKg, 70)));
  const safeQrsMs = Math.max(40, Math.min(350, parseFiniteNumber(state.qrsMs, 90)));
  const safeQtcMs = Math.max(250, Math.min(800, parseFiniteNumber(state.qtcMs, 440)));
  const safeTempC = Math.max(32, Math.min(44, parseFiniteNumber(state.tempC, 38.0)));
  const safeRespRate = Math.max(0, Math.min(60, parseFiniteNumber(state.respRate, 16)));

  const hasWideQrsFlag = flags.has('flag_qrs_wide_avr');
  const effectiveQrsForBicarb = hasWideQrsFlag && safeQrsMs < 100 ? 100 : safeQrsMs;
  const effectiveTcaSuspected = Boolean(state.tcaSuspected)
    || flags.has('flag_tca_suspected')
    || profile.id === 'tca_doxepin_cyclobenzaprine';

  const opioidRescueNeeded = Boolean(state.opioidApneaPresent)
    || safeRespRate < 12
    || flags.has('flag_fentanyl_apnea');

  const qtcEmergency = safeQtcMs >= 500 || flags.has('flag_qtc_500');
  const hyperthermiaSeizureRisk = safeTempC >= 39.5 || flags.has('flag_seizure_hyperthermia');
  const bladderRuleTriggered = Boolean(state.agitationPresent)
    || Boolean(state.urinaryRetentionSuspected)
    || flags.has('flag_delirium_bladder_retention');

  const explicitPure = state.isolatedPureAnticholinergic !== undefined
    ? Boolean(state.isolatedPureAnticholinergic)
    : Boolean(profile.isPureAnticholinergic);
  const effectiveIsolatedPure = explicitPure && !opioidRescueNeeded && !effectiveTcaSuspected;

  const bicarbonateAndReversal = calculateBicarbonateAndReversal(
    safeWeightKg,
    effectiveQrsForBicarb,
    effectiveTcaSuspected,
    effectiveIsolatedPure,
  );

  // Determine exact severity enum
  let severity = 'baseline';
  if (bicarbonateAndReversal.bicarbonateIndicated || qtcEmergency || effectiveTcaSuspected) {
    severity = 'emergency_cardiotox_bicarb';
  } else if (opioidRescueNeeded) {
    severity = 'emergency_opioid_hybrid';
  } else if (bladderRuleTriggered || hyperthermiaSeizureRisk) {
    severity = 'urgent_delirium_bladder_rule';
  }

  const alerts = [];
  const actions = [];

  // 1. Airway / Naloxone Unmasking Priority (ABCs first!)
  if (opioidRescueNeeded) {
    alerts.push({
      type: 'critical',
      titleEn: 'OPIOID STREET-CUT RESPIRATORY DEPRESSION & NALOXONE UNMASKING ALERT',
      titleEs: 'DEPRESIÓN RESPIRATORIA POR CORTE OPIOIDE Y DESENMASCARAMIENTO POST-NALOXONA',
      bodyEn: `Suppressed ventilation (RR ${safeRespRate}/min) indicates fentanyl/opioid co-ingestion masking antimuscarinic delirium. Give Naloxone + rescue breathing FIRST; anticipate abrupt post-naloxone antimuscarinic agitation ("mad as a hatter, red as a beet, dry as a bone, blind as a bat, full as a flask").`,
      bodyEs: `Ventilación deprimida (FR ${safeRespRate}/min) indica co-ingestión con fentanilo que enmascara el delirio antimuscarínico. Administre Naloxona + respiración de rescate PRIMERO; anticipe agitación antimuscarínica súbita tras despertar.`,
    });
    actions.push({
      priority: 'stat',
      textEn: 'STAT Airway & Naloxone First: Administer Naloxone (0.4-2 mg IV/IM or 4 mg IN) + BVM rescue breathing (1 breath q5s) until spontaneous RR >= 12/min. Prepare verbal de-escalation, parenteral benzodiazepines, and bladder scan for post-reversal anticholinergic delirium.',
      textEs: 'STAT Vía Aérea y Naloxona Primero: Administrar Naloxona (0.4-2 mg IV/IM o 4 mg nasal) + ventilación BVM (1 c/5 s) hasta FR >= 12/min. Preparar desescalada, benzodiacepinas parenterales y escaneo vesical para el delirio anticolinérgico desenmascarado.',
    });
  }

  // 2. Sodium Channel Cardiotoxicity & Bicarbonate
  if (bicarbonateAndReversal.bicarbonateIndicated) {
    const isVentricularRisk = safeQrsMs >= 160;
    alerts.push({
      type: 'critical',
      titleEn: isVentricularRisk
        ? 'CRITICAL QRS >= 160 MS: IMMINENT VENTRICULAR DYSRHYTHMIA RISK — STAT 8.4% NaHCO3'
        : 'WIDE QRS >= 100 MS / TERMINAL R IN aVR: FAST NA+-CHANNEL CARDIOTOXICITY',
      titleEs: isVentricularRisk
        ? 'QRS CRÍTICO >= 160 MS: RIESGO INMINENTE DE ARRITMIA VENTRICULAR — NaHCO3 8.4% STAT'
        : 'QRS ANCHO >= 100 MS / R TERMINAL EN aVR: CARDIOTOXICIDAD EN CANALES DE NA+',
      bodyEn: `${bicarbonateAndReversal.bicarbonateDoseTextEn} ${bicarbonateAndReversal.bicarbonateTargetEn}.`,
      bodyEs: `${bicarbonateAndReversal.bicarbonateDoseTextEs} ${bicarbonateAndReversal.bicarbonateTargetEs}.`,
    });
    actions.push({
      priority: 'stat',
      textEn: `${bicarbonateAndReversal.bicarbonateDoseTextEn} ${bicarbonateAndReversal.bicarbonateTargetEn}.`,
      textEs: `${bicarbonateAndReversal.bicarbonateDoseTextEs} ${bicarbonateAndReversal.bicarbonateTargetEs}.`,
    });
    actions.push({
      priority: 'stat',
      textEn: bicarbonateAndReversal.antiarrhythmicRuleEn,
      textEs: bicarbonateAndReversal.antiarrhythmicRuleEs,
    });
  }

  // 3. QTc >= 500 ms / Torsades
  if (qtcEmergency) {
    alerts.push({
      type: 'critical',
      titleEn: `CRITICAL QTc >= 500 MS (${safeQtcMs} ms) — TORSADES DE POINTES HAZARD`,
      titleEs: `QTc CRÍTICO >= 500 MS (${safeQtcMs} ms) — RIESGO DE TORSADES DE POINTES`,
      bodyEn: 'Administer Magnesium Sulfate 2 g IV over 10 min, replete K+ > 4.0-4.5 mEq/L, and strictly prohibit haloperidol, droperidol, chlorpromazine, and Class Ia/III antiarrhythmics.',
      bodyEs: 'Administrar Sulfato de Magnesio 2 g IV en 10 min, reponer K+ > 4.0-4.5 mEq/L y prohibir estrictamente haloperidol, droperidol, clorpromazina y antiarrítmicos Clase Ia/III.',
    });
    actions.push({
      priority: 'stat',
      textEn: 'STAT QTc Stabilization: Administer Magnesium Sulfate 2 g IV over 10 min (repeat for Torsades de Pointes) + K+ repletion > 4.0-4.5 mEq/L. If hypotensive from alpha-1 blockade, use Norepinephrine (AVOID Epinephrine).',
      textEs: 'Estabilización STAT del QTc: Sulfato de Magnesio 2 g IV en 10 min (repetir si Torsades) + reposición de K+ > 4.0-4.5 mEq/L. Si hay hipotensión por bloqueo alfa-1, usar Norepinefrina (EVITAR Epinefrina).',
    });
  }

  // 4. Black-Box TCA / Wide-QRS Physostigmine Block OR Eligible Cholinergic Reversal
  if (bicarbonateAndReversal.blockReason === 'fatal_tca_or_wide_qrs') {
    alerts.push({
      type: 'critical',
      titleEn: 'BLACK-BOX CONTRAINDICATION: PHYSOSTIGMINE / RIVASTIGMINE STRICTLY BLOCKED',
      titleEs: 'CONTRAINDICACIÓN DE CAJA NEGRA: FISOSTIGMINA / RIVASTIGMINA BLOQUEADAS',
      bodyEn: bicarbonateAndReversal.blackBoxWarningEn,
      bodyEs: bicarbonateAndReversal.blackBoxWarningEs,
    });
    actions.push({
      priority: 'stat',
      textEn: bicarbonateAndReversal.physostigmineDoseEn,
      textEs: bicarbonateAndReversal.physostigmineDoseEs,
    });
  } else if (bicarbonateAndReversal.physostigmineEligible) {
    actions.push({
      priority: 'urgent',
      textEn: `${bicarbonateAndReversal.physostigmineDoseEn} ${bicarbonateAndReversal.rivastigmineGuidanceEn}`,
      textEs: `${bicarbonateAndReversal.physostigmineDoseEs} ${bicarbonateAndReversal.rivastigmineGuidanceEs}`,
    });
  }

  // 5. Hyperthermia / Seizures
  if (hyperthermiaSeizureRisk) {
    alerts.push({
      type: 'critical',
      titleEn: `ANHIDROTIC HYPERTHERMIA (${safeTempC.toFixed(1)} C) / SEIZURE EMERGENCY`,
      titleEs: `HIPERTERMIA ANHIDRÓTICA (${safeTempC.toFixed(1)} C) / EMERGENCIA CONVULSIVA`,
      bodyEn: 'Anhidrotic patients cannot sweat to dissipate heat. Initiate immediate evaporative cooling (mist + fan, ice packs to groin/axillae/neck) + parenteral benzodiazepines (Lorazepam 2-4 mg IV or Midazolam 5-10 mg IM/IV). Avoid physical restraints.',
      bodyEs: 'Los pacientes anhidróticos no pueden sudar para disipar calor. Iniciar enfriamiento evaporativo inmediato (nebulización + ventilador, hielo en ingles/axilas/cuello) + benzodiacepinas parenterales. Evitar sujeción física.',
    });
    actions.push({
      priority: 'stat',
      textEn: 'STAT Seizure & Hyperthermia Control: Lorazepam 2-4 mg IV (or Midazolam 5-10 mg IM) + active evaporative cooling to < 38.5 C; avoid antipyretics (ineffective) and avoid physical restraints (rhabdomyolysis risk).',
      textEs: 'Control STAT de Convulsiones e Hipertermia: Lorazepam 2-4 mg IV (o Midazolam 5-10 mg IM) + enfriamiento evaporativo activo a < 38.5 C; evitar antipiréticos y sujeciones físicas.',
    });
  }

  // 6. Bladder Scan + Foley Decompression Rule (Always surfaced, upgraded to urgent if triggered)
  const bladderDecompressionRule = {
    triggered: bladderRuleTriggered,
    titleEn: 'Bladder Scan + Foley Decompression Rule ("Full as a Flask")',
    titleEs: 'Regla de Escaneo Vesical + Descompresión con Sonda Foley ("Lleno como Frasco")',
    summaryEn: 'Acute anticholinergic urinary retention causes severe painful bladder distension that drives refractory agitation and delirium. Perform bedside bladder ultrasound scan and insert a Foley catheter — relieving silent urinary retention frequently resolves severe agitation rapidly WITHOUT risky extra chemical sedation!',
    summaryEs: 'La retención urinaria aguda anticolinérgica produce distensión dolorosa que desencadena agitación y delirio refractarios. Realice un escaneo vesical por ultrasonido e inserte sonda Foley — aliviar la retención silenciosa suele resolver la agitación rápidamente SIN sedación química adicional riesgosa.',
    stepsEn: Object.freeze([
      'Perform immediate bedside bladder scan or suprapubic palpation in every agitated antimuscarinic patient.',
      'If post-void residual >= 300-400 mL or unable to void, place Foley catheter for prompt decompression.',
      'Re-assess agitation 10-15 minutes post-decompression before escalating parenteral sedatives.',
    ]),
    stepsEs: Object.freeze([
      'Realizar escaneo vesical o palpación suprapúbica inmediata en todo paciente antimuscarínico agitado.',
      'Si el volumen residual >= 300-400 mL o no puede orinar, colocar sonda Foley para descompresión rápida.',
      'Reevaluar la agitación 10-15 minutos después de descomprimir antes de escalar sedantes parenterales.',
    ]),
  };

  actions.push({
    priority: bladderRuleTriggered ? 'urgent' : 'routine',
    textEn: bladderRuleTriggered
      ? 'URGENT Bladder Scan & Foley Decompression: Patient shows agitation and/or suprapubic retention signs. Perform bedside bladder scan now and decompress with Foley catheter — relieving silent retention often resolves agitation without extra sedation.'
      : 'Bladder Scan Check: Screen for silent urinary retention ("full as a flask") before escalating sedatives; decompress via Foley if distended.',
    textEs: bladderRuleTriggered
      ? 'URGENTE Escaneo Vesical y Sonda Foley: Paciente con agitación y/o signos de retención urinaria. Escanear vejiga ahora y descomprimir con Foley — aliviar la retención silenciosa suele resolver la agitación sin más sedación.'
      : 'Control de Vejiga: Descartar retención urinaria silenciosa antes de escalar sedantes; descomprimir con sonda Foley si hay globo vesical.',
  });

  // 7. Antipsychotic Prohibition Rule (Always surfaced)
  const antipsychoticProhibitionRule = {
    titleEn: 'Antipsychotic Prohibition Rule (Avoid Haloperidol / Chlorpromazine / Droperidol)',
    titleEs: 'Regla de Prohibición de Antipsicóticos (Evitar Haloperidol / Clorpromazina / Droperidol)',
    summaryEn: 'STRICTLY AVOID haloperidol, chlorpromazine, droperidol, and phenothiazines for antimuscarinic delirium. They add severe peripheral/central antimuscarinic burden, prolong the QTc interval (precipitating Torsades de Pointes), impair sweating/thermoregulation, and lower the seizure threshold. Use titrated parenteral benzodiazepines (Lorazepam 1-2 mg IV/IM or Diazepam/Midazolam) plus bladder decompression and quiet environmental de-escalation.',
    summaryEs: 'EVITAR ESTRICTAMENTE haloperidol, clorpromazina, droperidol y fenotiazinas en el delirio antimuscarínico. Suman carga anticolinérgica, prolongan el intervalo QTc (riesgo de Torsades de Pointes), deterioran la termorregulación y reducen el umbral convulsivo. Usar benzodiacepinas parenterales tituladas (Lorazepam 1-2 mg IV/IM o Midazolam) junto con sonda vesical y desescalada ambiental tranquila.',
    prohibitedAgentsEn: Object.freeze(['Haloperidol', 'Chlorpromazine', 'Droperidol', 'Olanzapine/Quetiapine stacking']),
    prohibitedAgentsEs: Object.freeze(['Haloperidol', 'Clorpromazina', 'Droperidol', 'Acumulación con Olanzapina/Quetiapina']),
    safeAlternativeEn: 'Titrated Benzodiazepines (Lorazepam 1-2 mg IV/IM or Midazolam 2-5 mg IV/IM) + Bladder Decompression + Calm Dim Environment.',
    safeAlternativeEs: 'Benzodiacepinas tituladas (Lorazepam 1-2 mg IV/IM o Midazolam 2-5 mg IV/IM) + Descompresión vesical + Entorno tranquilo.',
  };

  actions.push({
    priority: 'urgent',
    textEn: 'Antipsychotic Prohibition Rule: Strictly AVOID haloperidol, chlorpromazine, and droperidol (stack antimuscarinic & QTc burden and lower seizure threshold). Use parenteral benzodiazepines (Lorazepam/Midazolam) for agitation.',
    textEs: 'Prohibición de Antipsicóticos: EVITAR haloperidol, clorpromazina y droperidol (suman carga antimuscarínica, prolongan QTc y bajan umbral convulsivo). Usar benzodiacepinas parenterales (Lorazepam/Midazolam).',
  });

  return {
    severity,
    profile,
    qrsMs: safeQrsMs,
    qtcMs: safeQtcMs,
    tempC: safeTempC,
    respRate: safeRespRate,
    weightKg: safeWeightKg,
    effectiveTcaSuspected,
    opioidRescueNeeded,
    qtcEmergency,
    hyperthermiaSeizureRisk,
    bladderRuleTriggered,
    bicarbonateAndReversal,
    toxidromeDifferential: TOXIDROME_DIFFERENTIAL_ROWS,
    bladderDecompressionRule,
    antipsychoticProhibitionRule,
    alerts,
    actions,
  };
}

/**
 * Zero-PII bilingual EN/ES SBAR clinical handoff note generator.
 */
export function formatAntimuscarinicSbarText(state = {}, lang = getLang()) {
  const isEs = lang === 'es';
  const ev = evaluateAntimuscarinicRisk(state);
  const br = ev.bicarbonateAndReversal;
  const flags = Array.from(normalizeFlagSet(state.checkedFlags));
  const now = new Date().toISOString();

  if (isEs) {
    const severityLabelsEs = {
      emergency_cardiotox_bicarb: 'EMERGENCIA CARDIOTÓXICA (NaHCO3 / BLOQUEO NA+ / QTC)',
      emergency_opioid_hybrid: 'EMERGENCIA HÍBRIDA OPIOIDE (NALOXONA PRIMERO + DESENMASCARAMIENTO)',
      urgent_delirium_bladder_rule: 'DELIRIO ANTIMUSCARÍNICO URGENTE (ESCANEO VESICAL Y BENZODIACEPINAS)',
      baseline: 'VIGILANCIA CLÍNICA BASAL Y TELEMETRÍA',
    };
    return [
      '=== ENTREGA CLÍNICA SBAR: TOXICOLOGÍA ANTIMUSCARÍNICA, DIFENHIDRAMINA Y DELIRIO PSICOTRÓPICO ===',
      `Fecha/Hora: ${now}`,
      'Privacidad: CERO PII / Sin identificadores personales (Cumplimiento HIPAA / 42 CFR Parte 2)',
      '',
      '[S] SITUACIÓN:',
      `• Perfil de Exposición: ${ev.profile.nameEs}`,
      `• Severidad de Triaje: ${severityLabelsEs[ev.severity]}`,
      `• Parámetros: Peso ${ev.weightKg} kg | QRS ${ev.qrsMs} ms | QTc ${ev.qtcMs} ms | Temp ${ev.tempC.toFixed(1)} C | FR ${ev.respRate}/min`,
      '',
      '[B] ANTECEDENTES:',
      `• Mecanismo: ${ev.profile.mechanismEs}`,
      `• Banderas Rojas Activas: ${flags.length ? flags.join(', ') : 'Ninguna marcada'}`,
      `• Sospecha de ATC/Ciclobenzaprina: ${ev.effectiveTcaSuspected ? 'SÍ (BLOQUEO ABSOLUTO DE FISOSTIGMINA)' : 'No'}`,
      `• Apnea Opioide Híbrida Presente: ${ev.opioidRescueNeeded ? 'SÍ (Naloxona + ventilación primero)' : 'No'}`,
      '',
      '[A] EVALUACIÓN TOXICOLÓGICA Y PUERTA DE ANTÍDOTOS:',
      `• Bicarbonato de Sodio 8.4%: ${br.bicarbonateDoseTextEs}`,
      `• Meta Electrofisiológica / pH: ${br.bicarbonateTargetEs}`,
      `• Regla Antiarrítmica: ${br.antiarrhythmicRuleEs}`,
      `• Puerta de Reversión Colinérgica (Fisostigmina / Rivastigmina): ${br.physostigmineEligible ? br.physostigmineDoseEs : br.blackBoxWarningEs}`,
      `• Protocolo en Escasez (Rivastigmina): ${br.rivastigmineGuidanceEs}`,
      `• Regla Vesical: ${ev.bladderDecompressionRule.summaryEs}`,
      `• Prohibición de Antipsicóticos: ${ev.antipsychoticProhibitionRule.summaryEs}`,
      '',
      '[R] RECOMENDACIONES Y ACCIONES PRIORITARIAS:',
      ...ev.actions.map((a, idx) => `${idx + 1}. [${a.priority.toUpperCase()}] ${a.textEs}`),
      '===============================================================================================',
    ].join('\n');
  }

  const severityLabelsEn = {
    emergency_cardiotox_bicarb: 'EMERGENCY CARDIOTOXICITY (8.4% NaHCO3 / NA+ BLOCK / QTC)',
    emergency_opioid_hybrid: 'EMERGENCY OPIOID HYBRID APNEA (NALOXONE FIRST + DELIRIUM UNMASKING)',
    urgent_delirium_bladder_rule: 'URGENT ANTIMUSCARINIC DELIRIUM (BLADDER SCAN & BENZODIAZEPINE PROTOCOL)',
    baseline: 'BASELINE TELEMETRY & SERIAL ECG MONITORING',
  };

  return [
    '=== ZERO-PII SBAR HANDOFF: ANTIMUSCARINIC, DIPHENHYDRAMINE STREET-CUT & PSYCHOTROPIC DELIRIUM ===',
    `Timestamp: ${now}`,
    'Privacy: ZERO PII / No Personal Identifiers (HIPAA / 42 CFR Part 2 Compliant)',
    '',
    '[S] SITUATION:',
    `• Exposure Profile: ${ev.profile.nameEn}`,
    `• Triage Severity: ${severityLabelsEn[ev.severity]}`,
    `• Vitals & ECG: Weight ${ev.weightKg} kg | QRS ${ev.qrsMs} ms | QTc ${ev.qtcMs} ms | Temp ${ev.tempC.toFixed(1)} C | RR ${ev.respRate}/min`,
    '',
    '[B] BACKGROUND:',
    `• Mechanism: ${ev.profile.mechanismEn}`,
    `• Active Red Flags: ${flags.length ? flags.join(', ') : 'None checked'}`,
    `• Suspected TCA / Cyclobenzaprine: ${ev.effectiveTcaSuspected ? 'YES (ABSOLUTE PHYSOSTIGMINE BLOCK)' : 'No'}`,
    `• Hybrid Opioid Respiratory Depression: ${ev.opioidRescueNeeded ? 'YES (Naloxone + rescue breathing FIRST)' : 'No'}`,
    '',
    '[A] TOXICOLOGY ASSESSMENT & ANTIDOTE GATE:',
    `• 8.4% Sodium Bicarbonate: ${br.bicarbonateDoseTextEn}`,
    `• QRS / Arterial pH Target: ${br.bicarbonateTargetEn}`,
    `• Antiarrhythmic Rule: ${br.antiarrhythmicRuleEn}`,
    `• Cholinergic Reversal Gate (Physostigmine / Rivastigmine): ${br.physostigmineEligible ? br.physostigmineDoseEn : br.blackBoxWarningEn}`,
    `• Rivastigmine Shortage Protocol: ${br.rivastigmineGuidanceEn}`,
    `• Bladder Scan + Foley Rule: ${ev.bladderDecompressionRule.summaryEn}`,
    `• Antipsychotic Prohibition Rule: ${ev.antipsychoticProhibitionRule.summaryEn}`,
    '',
    '[R] RECOMMENDATIONS & PRIORITY ACTIONS:',
    ...ev.actions.map((a, idx) => `${idx + 1}. [${a.priority.toUpperCase()}] ${a.textEn}`),
    '===============================================================================================',
  ].join('\n');
}

// ============================================================================
// 3. EPHEMERAL IN-RAM STATE LIFECYCLE
// ============================================================================

function createInitialState() {
  return {
    activeTab: 'navigator',
    profileId: 'diphenhydramine_fentanyl_cut',
    weightKg: '70',
    qrsMs: '90',
    qtcMs: '440',
    tempC: '38.0',
    respRate: '16',
    tcaSuspected: false,
    isolatedPureAnticholinergic: false,
    opioidApneaPresent: false,
    agitationPresent: false,
    urinaryRetentionSuspected: false,
    checkedFlags: new Set(),
  };
}

let antimuscarinicState = createInitialState();
const listeners = new Set();

export function getAntimuscarinicToxState() {
  return antimuscarinicState;
}

export function updateAntimuscarinicToxState(partial = {}) {
  const next = { ...antimuscarinicState, ...partial };
  if (partial.checkedFlags !== undefined) {
    next.checkedFlags = normalizeFlagSet(partial.checkedFlags);
  }
  antimuscarinicState = next;
  listeners.forEach((fn) => fn(getAntimuscarinicToxState()));
  return antimuscarinicState;
}

export function resetAntimuscarinicToxState() {
  antimuscarinicState = createInitialState();
  listeners.forEach((fn) => fn(getAntimuscarinicToxState()));
  return antimuscarinicState;
}

export function subscribeAntimuscarinicToxState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// 4. ACCESSIBLE, FOCUS-PRESERVING DOM VIEW (CSP & WAI-ARIA AA)
// ============================================================================

function getActiveElement() {
  return typeof document !== 'undefined' ? document.activeElement : null;
}

export function antimuscarinicToxView(containerOrOptions = {}, maybeOptions = {}) {
  const isMountContainer = Boolean(
    containerOrOptions
      && typeof containerOrOptions === 'object'
      && (
        typeof containerOrOptions.append === 'function'
        || typeof containerOrOptions.appendChild === 'function'
        || containerOrOptions.nodeType
        || containerOrOptions.tagName
      ),
  );
  const mountTarget = isMountContainer ? containerOrOptions : null;
  if (mountTarget) clear(mountTarget);

  const isEs = getLang() === 'es';
  const pick = (en, es) => (isEs ? es : en);

  const root = h('div', {
    class: 'view-section antimuscarinic-tox-view',
    'data-view': 'antimuscarinic-tox',
  });

  // Page Header
  const header = h('div', { class: 'view-header antimuscarinic-header' },
    pageHeader(
      pick(
        'Antimuscarinic, Diphenhydramine Street-Cut & Psychotropic Delirium Navigator',
        'Navegador de Toxicidad Antimuscarínica, Difenhidramina Callejera y Delirio Psicotrópico',
      ),
      pick(
        'ACMT/AACT clinical decision support for diphenhydramine-fentanyl street cuts, plant alkaloid delirium (Datura/scopolamine), TCA sodium-channel blockade (8.4% NaHCO3), strict physostigmine/rivastigmine gating, bladder decompression, and antipsychotic avoidance. Ephemeral in-RAM only.',
        'Soporte clínico ACMT/AACT para cortes de difenhidramina con fentanilo, delirio por alcaloides (Datura/escopolamina), bloqueo de Na+ por ATC (NaHCO3 8.4%), puerta estricta de fisostigmina/rivastigmina, descompresión vesical y prohibición de antipsicóticos. Exclusivamente en RAM.',
      ),
    ),
  );
  root.appendChild(header);

  // Top Emergency Hotline & Safety Callout
  const emergencyBar = h('div', {
    class: 'callout callout-emergency antimuscarinic-emergency-bar',
    role: 'region',
    'aria-label': pick('Emergency Toxicology & Poison Control', 'Toxicología de Emergencia y Control de Intoxicaciones'),
  },
    h('p', { class: 'callout-title' },
      icon('alert'),
      ' ',
      pick(
        'Life-Threatening Overdose, Wide QRS >= 100 ms, or Apnea?',
        '¿Sobredosis Mortal, QRS Ancho >= 100 ms o Apnea?',
      ),
    ),
    h('p', null, pick(
      'Give Naloxone + rescue breathing FIRST for apnea; give 8.4% IV Sodium Bicarbonate for QRS >= 100 ms; NEVER give physostigmine in suspected TCA or wide-QRS poisoning.',
      'Administre Naloxona + respiración de rescate PRIMERO en apnea; NaHCO3 8.4% IV para QRS >= 100 ms; NUNCA dé fisostigmina en sospecha de ATC o QRS ancho.',
    )),
    h('p', { class: 'actions' },
      tel('911', [icon('phone'), ' ', t('common.call911', 'Call 911')], {
        class: 'btn btn-emergency',
        'aria-label': t('common.call911', 'Call 911'),
      }),
      tel('1-800-222-1222', [icon('phone'), ' ', pick('Poison Control 1-800-222-1222', 'Control de Intoxicaciones 1-800-222-1222')], {
        class: 'btn btn-secondary',
        'aria-label': pick('Call Poison Control at 1-800-222-1222', 'Llamar a Control de Intoxicaciones al 1-800-222-1222'),
      }),
    ),
  );
  root.appendChild(emergencyBar);

  // Dynamic Black-Box Banner Slot
  const bannerSlot = h('div', {
    class: 'antimuscarinic-banner-slot',
    role: 'region',
    'aria-live': 'polite',
    'aria-label': pick('Active Toxicology Risk Banner', 'Banner de Riesgo Toxicológico Activo'),
  });
  root.appendChild(bannerSlot);

  // WAI-ARIA Tablist
  const tabDefs = [
    {
      id: 'navigator',
      label: pick('1. Triage, NaHCO3 & Reversal Gate', '1. Triaje, NaHCO3 y Puerta de Antídotos'),
    },
    {
      id: 'differential',
      label: pick('2. Dry vs Diaphoretic & Bladder/Sedation Rules', '2. Seco vs Diaforético y Reglas Vesical/Sedación'),
    },
    {
      id: 'sbar',
      label: pick('3. Zero-PII SBAR Handoff', '3. Entrega SBAR Cero-PII'),
    },
  ];

  const tabNav = h('div', {
    class: 'tab-nav antimuscarinic-tab-nav',
    role: 'tablist',
    'aria-label': pick('Antimuscarinic Toxicology Sections', 'Secciones de Toxicología Antimuscarínica'),
  });

  const tabButtons = {};
  const tabPanels = {};

  tabDefs.forEach((tab) => {
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `antimuscarinic-tab-${tab.id}`,
      class: 'tab',
      'data-tab': tab.id,
      'aria-selected': getAntimuscarinicToxState().activeTab === tab.id ? 'true' : 'false',
      'aria-controls': `antimuscarinic-panel-${tab.id}`,
      onclick: () => {
        updateAntimuscarinicToxState({ activeTab: tab.id });
        announce(tab.label);
      },
    }, tab.label);
    tabButtons[tab.id] = btn;
    tabNav.appendChild(btn);
  });
  root.appendChild(tabNav);

  // --------------------------------------------------------------------------
  // PANEL 1: Triage, NaHCO3 Calculator & Reversal Eligibility Gate
  // --------------------------------------------------------------------------
  const panelNavigator = h('div', {
    id: 'antimuscarinic-panel-navigator',
    role: 'tabpanel',
    'aria-labelledby': 'antimuscarinic-tab-navigator',
    class: 'antimuscarinic-tabpanel',
  });

  const navGrid = h('div', { class: 'antimuscarinic-grid' });
  const leftCol = h('div', { class: 'antimuscarinic-col' });
  const rightCol = h('div', { class: 'antimuscarinic-col' });
  navGrid.append(leftCol, rightCol);
  panelNavigator.appendChild(navGrid);

  // Persistent Controls (created ONCE, never rebuilt on state change!)
  const profileSelect = h('select', {
    id: 'antimuscarinic-profile-select',
    class: 'select antimuscarinic-select',
    'aria-label': pick('Select suspected antimuscarinic or hybrid exposure', 'Seleccionar exposición antimuscarínica o híbrida sospechada'),
    onchange: (e) => {
      const nextId = e.target.value;
      const patch = { profileId: nextId };
      if (nextId === 'tca_doxepin_cyclobenzaprine') {
        patch.tcaSuspected = true;
        patch.isolatedPureAnticholinergic = false;
        patch.opioidApneaPresent = false;
      } else if (nextId === 'plant_alkaloid_scopolamine_datura') {
        patch.tcaSuspected = false;
        patch.isolatedPureAnticholinergic = true;
        patch.opioidApneaPresent = false;
      } else if (nextId === 'diphenhydramine_fentanyl_cut') {
        patch.tcaSuspected = false;
        patch.isolatedPureAnticholinergic = false;
      } else {
        patch.tcaSuspected = false;
        patch.isolatedPureAnticholinergic = false;
        patch.opioidApneaPresent = false;
      }
      updateAntimuscarinicToxState(patch);
    },
  },
  Object.values(ANTIMUSCARINIC_PROFILES).map((prof) =>
    h('option', { value: prof.id, selected: prof.id === getAntimuscarinicToxState().profileId }, pick(prof.nameEn, prof.nameEs)),
  ));

  const profileDetailsSlot = h('div', { class: 'antimuscarinic-profile-details' });

  const profileCard = h('section', { class: 'card antimuscarinic-card', 'aria-labelledby': 'antimuscarinic-profile-heading' },
    h('h2', { id: 'antimuscarinic-profile-heading', class: 'antimuscarinic-card-title' },
      icon('pill'),
      ' ',
      pick('1. Suspected Exposure / Street-Cut Profile', '1. Perfil de Exposición o Corte Callejero Sospechado'),
    ),
    h('div', { class: 'form-group' },
      h('label', { for: 'antimuscarinic-profile-select' }, pick('Clinical Scenario:', 'Escenario Clínico:')),
      profileSelect,
    ),
    profileDetailsSlot,
  );
  leftCol.appendChild(profileCard);

  // Vitals & ECG Inputs (created ONCE)
  const weightInput = h('input', {
    id: 'antimuscarinic-weight-input',
    type: 'number',
    class: 'input antimuscarinic-num-input',
    min: '5',
    max: '250',
    step: '1',
    value: getAntimuscarinicToxState().weightKg,
    oninput: (e) => updateAntimuscarinicToxState({ weightKg: e.target.value }),
  });

  const qrsInput = h('input', {
    id: 'antimuscarinic-qrs-input',
    type: 'number',
    class: 'input antimuscarinic-num-input',
    min: '40',
    max: '350',
    step: '2',
    value: getAntimuscarinicToxState().qrsMs,
    oninput: (e) => updateAntimuscarinicToxState({ qrsMs: e.target.value }),
  });

  const qtcInput = h('input', {
    id: 'antimuscarinic-qtc-input',
    type: 'number',
    class: 'input antimuscarinic-num-input',
    min: '250',
    max: '800',
    step: '5',
    value: getAntimuscarinicToxState().qtcMs,
    oninput: (e) => updateAntimuscarinicToxState({ qtcMs: e.target.value }),
  });

  const tempInput = h('input', {
    id: 'antimuscarinic-temp-input',
    type: 'number',
    class: 'input antimuscarinic-num-input',
    min: '32',
    max: '44',
    step: '0.1',
    value: getAntimuscarinicToxState().tempC,
    oninput: (e) => updateAntimuscarinicToxState({ tempC: e.target.value }),
  });

  const respInput = h('input', {
    id: 'antimuscarinic-rr-input',
    type: 'number',
    class: 'input antimuscarinic-num-input',
    min: '0',
    max: '60',
    step: '1',
    value: getAntimuscarinicToxState().respRate,
    oninput: (e) => updateAntimuscarinicToxState({ respRate: e.target.value }),
  });

  // Clinical Context Toggles (created ONCE)
  const toggleDefs = [
    {
      id: 'toggle-tca-suspected',
      key: 'tcaSuspected',
      label: pick('TCA / Cyclobenzaprine suspected (ABSOLUTE Physostigmine block)', 'Sospecha de ATC / Ciclobenzaprina (Bloqueo ABSOLUTO de Fisostigmina)'),
    },
    {
      id: 'toggle-isolated-pure',
      key: 'isolatedPureAnticholinergic',
      label: pick('Confirmed isolated pure antimuscarinic delirium (e.g., Datura/scopolamine; NO TCA/opioid)', 'Delirio antimuscarínico puro aislado confirmado (ej. Datura/escopolamina; SIN ATC/opioide)'),
    },
    {
      id: 'toggle-opioid-apnea',
      key: 'opioidApneaPresent',
      label: pick('Co-ingested fentanyl / opioid apnea present (Naloxone FIRST)', 'Apnea por fentanilo / opioide co-ingerido presente (Naloxona PRIMERO)'),
    },
    {
      id: 'toggle-agitation',
      key: 'agitationPresent',
      label: pick('Severe agitated delirium present (Screen bladder + avoid haloperidol)', 'Delirio agitado severo presente (Escanear vejiga + evitar haloperidol)'),
    },
    {
      id: 'toggle-urinary-retention',
      key: 'urinaryRetentionSuspected',
      label: pick('Unable to void / suprapubic fullness (Bladder Scan + Foley trigger)', 'Incapaz de orinar / globo vesical suprapúbico (Disparo de Escaneo + Foley)'),
    },
  ];

  const toggleControls = toggleDefs.map((def) => {
    const cb = h('input', {
      type: 'checkbox',
      id: def.id,
      checked: Boolean(getAntimuscarinicToxState()[def.key]),
      onchange: (e) => updateAntimuscarinicToxState({ [def.key]: e.target.checked }),
    });
    const row = h('label', { class: 'checkbox-row antimuscarinic-check-row', for: def.id },
      cb,
      h('span', null, def.label),
    );
    return { key: def.key, cb, row };
  });

  const vitalsCard = h('section', { class: 'card antimuscarinic-card', 'aria-labelledby': 'antimuscarinic-vitals-heading' },
    h('h2', { id: 'antimuscarinic-vitals-heading', class: 'antimuscarinic-card-title' },
      icon('activity'),
      ' ',
      pick('2. Bedside ECG, Vitals & Clinical Context', '2. ECG, Signos Vitales y Contexto Clínico'),
    ),
    h('div', { class: 'antimuscarinic-inputs-grid' },
      h('div', { class: 'form-group' },
        h('label', { for: 'antimuscarinic-weight-input' }, pick('Weight (kg — NaHCO3 dosing):', 'Peso (kg — dosis NaHCO3):')),
        weightInput,
      ),
      h('div', { class: 'form-group' },
        h('label', { for: 'antimuscarinic-qrs-input' }, pick('ECG QRS Duration (ms — Alert >= 100):', 'Duración QRS ECG (ms — Alerta >= 100):')),
        qrsInput,
      ),
      h('div', { class: 'form-group' },
        h('label', { for: 'antimuscarinic-qtc-input' }, pick('ECG QTc Interval (ms — Alert >= 500):', 'Intervalo QTc ECG (ms — Alerta >= 500):')),
        qtcInput,
      ),
      h('div', { class: 'form-group' },
        h('label', { for: 'antimuscarinic-temp-input' }, pick('Core Temp (C — Alert >= 39.5):', 'Temp Central (C — Alerta >= 39.5):')),
        tempInput,
      ),
      h('div', { class: 'form-group' },
        h('label', { for: 'antimuscarinic-rr-input' }, pick('Respiratory Rate (breaths/min — Alert < 12):', 'Frecuencia Respiratoria (rpm — Alerta < 12):')),
        respInput,
      ),
    ),
    h('div', { class: 'antimuscarinic-toggle-list' }, ...toggleControls.map((tItem) => tItem.row)),
  );
  leftCol.appendChild(vitalsCard);

  // Red Flags Checklist Card (created ONCE)
  const redFlagControls = ANTIMUSCARINIC_RED_FLAGS.map((flag) => {
    const cb = h('input', {
      type: 'checkbox',
      id: flag.id,
      checked: getAntimuscarinicToxState().checkedFlags.has(flag.id),
      onchange: (e) => {
        const nextSet = new Set(getAntimuscarinicToxState().checkedFlags);
        if (e.target.checked) nextSet.add(flag.id);
        else nextSet.delete(flag.id);
        updateAntimuscarinicToxState({ checkedFlags: nextSet });
      },
    });
    const row = h('label', {
      class: `checkbox-row antimuscarinic-check-row ${flag.fatal ? 'antimuscarinic-fatal-row' : ''}`,
      for: flag.id,
    },
      cb,
      h('span', null, pick(flag.labelEn, flag.labelEs)),
    );
    return { id: flag.id, cb, row };
  });

  const redFlagsCard = h('section', { class: 'card antimuscarinic-card', 'aria-labelledby': 'antimuscarinic-flags-heading' },
    h('h2', { id: 'antimuscarinic-flags-heading', class: 'antimuscarinic-card-title' },
      icon('shield'),
      ' ',
      pick('3. Antimuscarinic Red-Flag Checklist', '3. Lista de Banderas Rojas Antimuscarínicas'),
    ),
    h('div', { class: 'antimuscarinic-flag-list' }, ...redFlagControls.map((r) => r.row)),
  );
  leftCol.appendChild(redFlagsCard);

  // Dynamic Right Column Slot
  const navigatorOutputSlot = h('div', { class: 'antimuscarinic-output-slot', 'aria-live': 'polite' });
  rightCol.appendChild(navigatorOutputSlot);

  // --------------------------------------------------------------------------
  // PANEL 2: Dry vs Diaphoretic Differential & Bladder/Antipsychotic Rules
  // --------------------------------------------------------------------------
  const panelDifferential = h('div', {
    id: 'antimuscarinic-panel-differential',
    role: 'tabpanel',
    'aria-labelledby': 'antimuscarinic-tab-differential',
    class: 'antimuscarinic-tabpanel',
  });

  const diffTable = h('table', { class: 'antimuscarinic-diff-table' },
    h('caption', null, pick(
      'Bedside Toxidrome Differential: Anticholinergic (DRY / NO BOWEL SOUNDS) vs Sympathomimetic (DIAPHORETIC)',
      'Diferencial Clínico a la Cabecera: Anticolinérgico (SECO / SIN RUIDOS INTESTINALES) vs Simpaticomimético (DIAFORÉTICO)',
    )),
    h('thead', null,
      h('tr', null,
        h('th', { scope: 'col' }, pick('Clinical Domain', 'Dominio Clínico')),
        h('th', { scope: 'col' }, pick('Anticholinergic (DRY / NO BOWEL SOUNDS)', 'Anticolinérgico (SECO / SIN RUIDOS INTESTINALES)')),
        h('th', { scope: 'col' }, pick('Sympathomimetic (DIAPHORETIC)', 'Simpaticomimético (DIAFORÉTICO)')),
      ),
    ),
    h('tbody', null,
      TOXIDROME_DIFFERENTIAL_ROWS.map((row) =>
        h('tr', null,
          h('th', { scope: 'row' }, pick(row.domainEn, row.domainEs)),
          h('td', null, pick(row.anticholinergicEn, row.anticholinergicEs)),
          h('td', null, pick(row.sympathomimeticEn, row.sympathomimeticEs)),
        ),
      ),
    ),
  );

  const diffCard = h('section', { class: 'card antimuscarinic-card', 'aria-labelledby': 'antimuscarinic-diff-heading' },
    h('h2', { id: 'antimuscarinic-diff-heading', class: 'antimuscarinic-card-title' },
      icon('eye'),
      ' ',
      pick('Bedside Differential: Anticholinergic DRY vs Sympathomimetic DIAPHORETIC', 'Diferencial a la Cabecera: Anticolinérgico SECO vs Simpaticomimético DIAFORÉTICO'),
    ),
    h('p', { class: 'fine' }, pick(
      'Clinical Pearl: Check the patient\'s axillae and auscultate bowel sounds. Completely dry axillae + absent bowel sounds + urinary retention distinguish anticholinergic delirium from diaphoretic stimulant toxicity.',
      'Perla Clínica: Palpe las axilas y ausculte ruidos intestinales. Axilas secas + silencio abdominal + retención urinaria distinguen el delirio anticolinérgico de la toxicidad simpaticomimética diaforética.',
    )),
    h('div', { class: 'table-wrap', tabindex: '0' }, diffTable),
  );

  const rulesDynamicSlot = h('div', { class: 'antimuscarinic-rules-slot' });
  panelDifferential.append(diffCard, rulesDynamicSlot);

  // --------------------------------------------------------------------------
  // PANEL 3: Zero-PII SBAR Handoff Export
  // --------------------------------------------------------------------------
  const panelSbar = h('div', {
    id: 'antimuscarinic-panel-sbar',
    role: 'tabpanel',
    'aria-labelledby': 'antimuscarinic-tab-sbar',
    class: 'antimuscarinic-tabpanel',
  });

  // NEVER pass `value:` inside h('textarea', props, ...) props!
  const sbarTextarea = h('textarea', {
    id: 'antimuscarinic-sbar-text',
    class: 'input antimuscarinic-sbar-textarea',
    rows: '16',
    readonly: true,
    'aria-label': pick('Zero-PII SBAR clinical handoff note', 'Nota clínica SBAR cero-PII para entrega'),
  });

  const copyBtn = h('button', {
    type: 'button',
    id: 'antimuscarinic-copy-sbar-btn',
    class: 'btn btn-primary',
    onclick: () => {
      copyText(sbarTextarea.value, {
        trigger: copyBtn,
        copiedLabel: pick('Copied SBAR Note', 'Nota SBAR Copiada'),
        failedLabel: pick('Copy failed — select text manually', 'Error al copiar — seleccione manualmente'),
        announceSuccess: pick('Zero-PII SBAR note copied to clipboard.', 'Nota SBAR cero-PII copiada al portapapeles.'),
        announceFailure: pick('Clipboard unavailable. Select SBAR text manually.', 'Portapapeles no disponible. Copie el texto manualmente.'),
      });
    },
  }, pick('Copy Zero-PII SBAR Note', 'Copiar Nota SBAR (Cero PII)'));

  const resetBtn = h('button', {
    type: 'button',
    id: 'antimuscarinic-reset-btn',
    class: 'btn btn-secondary',
    onclick: () => {
      resetAntimuscarinicToxState();
      announce(pick('Antimuscarinic toxicology navigator reset to baseline.', 'Navegador antimuscarínico restablecido a valores basales.'));
    },
  }, pick('Reset All Fields', 'Restablecer Campos'));

  const sbarCard = h('section', { class: 'card antimuscarinic-card', 'aria-labelledby': 'antimuscarinic-sbar-heading' },
    h('h2', { id: 'antimuscarinic-sbar-heading', class: 'antimuscarinic-card-title' },
      icon('clipboard'),
      ' ',
      pick('Zero-PII SBAR Toxicology Handoff Summary', 'Resumen SBAR Cero-PII para Entrega Toxicológica'),
    ),
    h('p', { class: 'fine' }, pick(
      'Contains zero personal identifiers (no name, DOB, MRN). Updates live from bedside inputs and checklist selections.',
      'Contiene cero identificadores personales (sin nombre, fecha de nacimiento ni historia). Se actualiza en vivo.',
    )),
    h('div', { class: 'form-group' },
      h('label', { for: 'antimuscarinic-sbar-text' }, pick('Generated SBAR Handoff Text:', 'Texto SBAR Generado:')),
      sbarTextarea,
    ),
    h('div', { class: 'actions' }, copyBtn, resetBtn),
  );
  panelSbar.appendChild(sbarCard);

  root.append(panelNavigator, panelDifferential, panelSbar);
  wireTablistKeyboard(root);

  // --------------------------------------------------------------------------
  // SYNC CONTROLS & DYNAMIC OUTPUT RENDERING (PRESERVES INPUT FOCUS!)
  // --------------------------------------------------------------------------
  function syncControls(state) {
    const active = getActiveElement();
    if (active !== profileSelect) profileSelect.value = state.profileId;
    if (active !== weightInput) weightInput.value = String(state.weightKg);
    if (active !== qrsInput) qrsInput.value = String(state.qrsMs);
    if (active !== qtcInput) qtcInput.value = String(state.qtcMs);
    if (active !== tempInput) tempInput.value = String(state.tempC);
    if (active !== respInput) respInput.value = String(state.respRate);

    for (const item of toggleControls) {
      if (active !== item.cb) item.cb.checked = Boolean(state[item.key]);
    }
    for (const rf of redFlagControls) {
      if (active !== rf.cb) rf.cb.checked = state.checkedFlags.has(rf.id);
    }

    for (const tab of tabDefs) {
      const isSelected = state.activeTab === tab.id;
      tabButtons[tab.id].setAttribute('aria-selected', isSelected ? 'true' : 'false');
      const panel = tab.id === 'navigator' ? panelNavigator : tab.id === 'differential' ? panelDifferential : panelSbar;
      if (isSelected) {
        panel.removeAttribute('hidden');
        panel.hidden = false;
      } else {
        panel.setAttribute('hidden', '');
        panel.hidden = true;
      }
    }
    syncTablists(root);
  }

  function renderDynamic() {
    const state = getAntimuscarinicToxState();
    syncControls(state);

    const ev = evaluateAntimuscarinicRisk(state);
    const br = ev.bicarbonateAndReversal;

    // 1. Top Black-Box Banner
    clear(bannerSlot);
    bannerSlot.appendChild(
      h('div', {
        class: `clinical-alert-banner antimuscarinic-alert-banner severity-${ev.severity}`,
        role: ev.severity.startsWith('emergency') ? 'alert' : 'note',
      },
        h('div', { class: 'antimuscarinic-banner-title' },
          icon('alert'),
          ' ',
          h('strong', null, pick(ev.profile.blackBoxEn, ev.profile.blackBoxEs)),
        ),
        h('p', null, pick(ev.profile.blackBoxDetailEn, ev.profile.blackBoxDetailEs)),
      ),
    );

    // 2. Profile Mechanism Details
    clear(profileDetailsSlot);
    profileDetailsSlot.append(
      h('p', { class: 'fine' }, h('strong', null, pick('Street / Product Names: ', 'Nombres / Productos: ')), pick(ev.profile.streetNamesEn, ev.profile.streetNamesEs)),
      h('p', null, h('strong', null, pick('Pathophysiology: ', 'Fisiopatología: ')), pick(ev.profile.mechanismEn, ev.profile.mechanismEs)),
      h('ul', { class: 'antimuscarinic-hallmarks-list' },
        (isEs ? ev.profile.hallmarksEs : ev.profile.hallmarksEn).map((item) => h('li', null, item)),
      ),
    );

    // 3. Navigator Output Cards (Right Column)
    clear(navigatorOutputSlot);

    const severityBadgeLabels = {
      emergency_cardiotox_bicarb: pick('EMERGENCY: CARDIOTOXICITY / NaHCO3 PROTOCOL', 'EMERGENCIA: CARDIOTOXICIDAD / PROTOCOLO NaHCO3'),
      emergency_opioid_hybrid: pick('EMERGENCY: OPIOID HYBRID APNEA — NALOXONE FIRST', 'EMERGENCIA: APNEA HÍBRIDA OPIOIDE — NALOXONA PRIMERO'),
      urgent_delirium_bladder_rule: pick('URGENT: DELIRIUM, BLADDER SCAN & BENZODIAZEPINES', 'URGENTE: DELIRIO, ESCANEO VESICAL Y BENZODIACEPINAS'),
      baseline: pick('BASELINE MONITORING & TELEMETRY', 'VIGILANCIA BASAL Y TELEMETRÍA'),
    };

    const statusCard = h('section', { class: 'card antimuscarinic-card', 'aria-labelledby': 'antimuscarinic-status-heading' },
      h('h2', { id: 'antimuscarinic-status-heading', class: 'antimuscarinic-card-title' },
        icon('heart'),
        ' ',
        pick('4. Severity Stratification & Active Alerts', '4. Estratificación de Severidad y Alertas Activas'),
      ),
      h('div', { class: `antimuscarinic-severity-pill pill-${ev.severity}` },
        h('strong', null, severityBadgeLabels[ev.severity]),
      ),
      ev.alerts.length > 0
        ? h('div', { class: 'antimuscarinic-alerts-stack' },
            ev.alerts.map((al) =>
              h('div', { class: 'callout callout-emergency antimuscarinic-alert-item' },
                h('p', { class: 'callout-title' }, icon('alert'), ' ', pick(al.titleEn, al.titleEs)),
                h('p', null, pick(al.bodyEn, al.bodyEs)),
              ),
            ),
          )
        : h('p', { class: 'fine' }, pick(
            'No wide-QRS, QTc >= 500 ms, or respiratory arrest triggers active. Continue serial ECGs and bedside telemetry.',
            'Sin disparos activos de QRS ancho, QTc >= 500 ms ni paro respiratorio. Continuar ECG seriados y telemetría.',
          )),
    );

    const bicarbCard = h('section', { class: 'card antimuscarinic-card', 'aria-labelledby': 'antimuscarinic-bicarb-heading' },
      h('h2', { id: 'antimuscarinic-bicarb-heading', class: 'antimuscarinic-card-title' },
        icon('activity'),
        ' ',
        pick('5. 8.4% Sodium Bicarbonate & Antiarrhythmic Gate', '5. Bicarbonato de Sodio 8.4% y Regla Antiarrítmica'),
      ),
      h('div', { class: `rule-card ${br.bicarbonateIndicated ? 'antimuscarinic-rule-danger' : ''}` },
        h('strong', null, br.bicarbonateIndicated
          ? pick(`STAT 8.4% NaHCO3 Bolus: ${br.bicarbonateMinMeq}-${br.bicarbonateMaxMeq} mEq IV`, `Bolo STAT NaHCO3 8.4%: ${br.bicarbonateMinMeq}-${br.bicarbonateMaxMeq} mEq IV`)
          : pick('8.4% NaHCO3 Standby (QRS < 100 ms)', 'NaHCO3 8.4% en Reserva (QRS < 100 ms)')),
        h('p', null, pick(br.bicarbonateDoseTextEn, br.bicarbonateDoseTextEs)),
        h('p', { class: 'fine' }, pick(br.bicarbonateTargetEn, br.bicarbonateTargetEs)),
      ),
      h('div', { class: 'rule-card' },
        h('strong', null, pick('Avoid Class Ia/Ic — Lidocaine Second-Line', 'Evitar Clase Ia/Ic — Lidocaína Segunda Línea')),
        h('p', null, pick(br.antiarrhythmicRuleEn, br.antiarrhythmicRuleEs)),
      ),
    );

    const reversalCard = h('section', { class: 'card antimuscarinic-card', 'aria-labelledby': 'antimuscarinic-reversal-heading' },
      h('h2', { id: 'antimuscarinic-reversal-heading', class: 'antimuscarinic-card-title' },
        icon(br.physostigmineEligible ? 'check-circle' : 'ban'),
        ' ',
        pick('6. Cholinergic Antidote Eligibility Gate (Physostigmine / Rivastigmine)', '6. Puerta de Elegibilidad Colinérgica (Fisostigmina / Rivastigmina)'),
      ),
      br.physostigmineBlocked
        ? h('div', { class: 'callout callout-emergency antimuscarinic-reversal-blocked' },
            h('p', { class: 'callout-title' },
              icon('ban'),
              ' ',
              br.blockReason === 'fatal_tca_or_wide_qrs'
                ? pick('STRICTLY BLOCKED — BLACK-BOX FATAL ASYSTOLE WARNING', 'ESTRICTAMENTE BLOQUEADA — ALERTA DE ASISTOLIA FATAL')
                : pick('CHOLINERGIC REVERSAL HELD (NOT ISOLATED PURE ANTIMUSCARINIC)', 'REVERSIÓN COLINÉRGICA RETENIDA (NO ANTIMUSCARÍNICO PURO AISLADO)'),
            ),
            h('p', null, pick(br.blackBoxWarningEn, br.blackBoxWarningEs)),
            h('p', { class: 'fine' }, pick(br.rivastigmineGuidanceEn, br.rivastigmineGuidanceEs)),
          )
        : h('div', { class: 'rule-card antimuscarinic-reversal-eligible' },
            h('strong', null, pick('ELIGIBLE: Slow Titrated IV Physostigmine 0.5-2 mg over 5 min', 'ELEGIBLE: Fisostigmina IV Titulada Lenta 0.5-2 mg en 5 min')),
            h('p', null, pick(br.physostigmineDoseEn, br.physostigmineDoseEs)),
            h('p', null, pick(br.rivastigmineGuidanceEn, br.rivastigmineGuidanceEs)),
            h('p', { class: 'fine' }, pick(br.monitoringRequirementsEn, br.monitoringRequirementsEs)),
          ),
    );

    const actionsCard = h('section', { class: 'card antimuscarinic-card', 'aria-labelledby': 'antimuscarinic-actions-heading' },
      h('h2', { id: 'antimuscarinic-actions-heading', class: 'antimuscarinic-card-title' },
        icon('check-circle'),
        ' ',
        pick('7. Prioritized Bedside Resuscitation & Sedation Rules', '7. Directivas Priorizadas de Reanimación y Sedación'),
      ),
      h('ul', { class: 'antimuscarinic-actions-list' },
        ev.actions.map((act) =>
          h('li', { class: `antimuscarinic-action-item priority-${act.priority}` },
            h('span', { class: `antimuscarinic-priority-badge badge-${act.priority}` }, act.priority.toUpperCase()),
            ' ',
            h('span', null, pick(act.textEn, act.textEs)),
          ),
        ),
      ),
    );

    navigatorOutputSlot.append(statusCard, bicarbCard, reversalCard, actionsCard);

    // 4. Panel 2 Dynamic Rule Cards (Bladder Scan + Antipsychotic Prohibition)
    clear(rulesDynamicSlot);
    const bladderCard = h('section', {
      class: `card rule-card antimuscarinic-rule-card ${ev.bladderDecompressionRule.triggered ? 'antimuscarinic-rule-active' : ''}`,
      'aria-labelledby': 'antimuscarinic-bladder-rule-heading',
    },
      h('h3', { id: 'antimuscarinic-bladder-rule-heading' },
        icon('info'),
        ' ',
        pick(ev.bladderDecompressionRule.titleEn, ev.bladderDecompressionRule.titleEs),
      ),
      h('p', null, pick(ev.bladderDecompressionRule.summaryEn, ev.bladderDecompressionRule.summaryEs)),
      h('ul', null,
        (isEs ? ev.bladderDecompressionRule.stepsEs : ev.bladderDecompressionRule.stepsEn).map((st) => h('li', null, st)),
      ),
    );

    const antipsychoticCard = h('section', {
      class: 'card rule-card antimuscarinic-rule-card antimuscarinic-rule-danger',
      'aria-labelledby': 'antimuscarinic-antipsychotic-rule-heading',
    },
      h('h3', { id: 'antimuscarinic-antipsychotic-rule-heading' },
        icon('ban'),
        ' ',
        pick(ev.antipsychoticProhibitionRule.titleEn, ev.antipsychoticProhibitionRule.titleEs),
      ),
      h('p', null, pick(ev.antipsychoticProhibitionRule.summaryEn, ev.antipsychoticProhibitionRule.summaryEs)),
      h('p', null,
        h('strong', null, pick('Prohibited Agents: ', 'Agentes Prohibidos: ')),
        (isEs ? ev.antipsychoticProhibitionRule.prohibitedAgentsEs : ev.antipsychoticProhibitionRule.prohibitedAgentsEn).join(', '),
      ),
      h('p', null,
        h('strong', null, pick('Preferred Alternative: ', 'Alternativa Segura: ')),
        pick(ev.antipsychoticProhibitionRule.safeAlternativeEn, ev.antipsychoticProhibitionRule.safeAlternativeEs),
      ),
    );
    rulesDynamicSlot.append(bladderCard, antipsychoticCard);

    // 5. Update persistent SBAR textarea (preserving element identity)
    const sbarText = formatAntimuscarinicSbarText(state, getLang());
    if (getActiveElement() !== sbarTextarea) {
      sbarTextarea.value = sbarText;
      sbarTextarea.textContent = sbarText;
    }
  }

  // Subscribe with wasConnected unmount cleanup
  let wasConnected = false;
  const onStateChange = () => {
    const connected = Boolean(root.isConnected || mountTarget?.isConnected);
    wasConnected = wasConnected || connected;
    if (wasConnected && !connected) {
      unsubscribe();
      return;
    }
    renderDynamic();
  };

  const unsubscribe = subscribeAntimuscarinicToxState(onStateChange);
  renderDynamic();
  root._cleanup = unsubscribe;

  if (mountTarget) {
    mountTarget.appendChild(root);
    mountTarget._cleanup = unsubscribe;
    return mountTarget;
  }

  return root;
}

export default antimuscarinicToxView;
