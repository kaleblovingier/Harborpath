// public/js/views/cardiogenicToxinHiet.js
// Wave 66: Cardiogenic Toxin, Calcium Channel Blocker & Beta-Blocker Overdose / HIET Protocol
// ACMT, AACT, and EAPCCT Clinical Consensus Standards.
// Ephemeral in-RAM state, zero persistent storage, zero PII, WCAG 2.1 AA compliant.

import { h, clear, icon } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

export const CARDIOGENIC_SUBSTANCES = Object.freeze({
  ccb_dihydropyridine: {
    id: 'ccb_dihydropyridine',
    name: 'Dihydropyridine CCB (Amlodipine, Nifedipine, Nicardipine)',
    nameEs: 'BCC Dihidropiridínico (Amlodipino, Nifedipino, Nicardipino)',
    category: 'ccb',
    lipophilic: true,
    mechanism: 'Potent peripheral arterial L-type calcium channel antagonism causing severe refractory vasoplegic vasodilatory shock; reflex tachycardia initially, transitioning to bradycardia and myocardial depression as selectivity is lost at massive supratherapeutic doses.',
    mechanismEs: 'Potente antagonismo de canales de calcio tipo L arteriales periféricos que causa choque vasodilatador vasopléjico refractario; taquicardia refleja inicial que progresa a bradicardia y depresión miocárdica a dosis masivas.',
    pancreaticEffect: 'Inhibits L-type calcium channels on pancreatic beta-islet cells, halting endogenous insulin exocytosis -> severe hyperglycemia with lactic acidosis.',
    pancreaticEffectEs: 'Inhibe canales de calcio tipo L en células beta pancreáticas, frenando la secreción de insulina endógena -> hiperglucemia severa con acidosis láctica.',
    firstLineAntidote: 'High-Dose Insulin Euglycemia Therapy (HIET) + IV Calcium Chloride 10% (1-2 g IV) + Norepinephrine / Vasopressin for vasoplegia.',
    firstLineAntidoteEs: 'Terapia con Insulina en Altas Dosis y Euglucemia (HIET) + Cloruro de Calcio 10% IV (1-2 g) + Norepinefrina / Vasopresina para vasoplejía.',
    blackBoxContraindication: 'PURE ALPHA-1 AGONIST MONOTHERAPY (PHENYLEPHRINE) CONTRAINDICATED',
    blackBoxContraindicationEs: 'MONOTERAPIA CON AGONISTAS ALFA-1 PUROS (FENILEFRINA) CONTRAINDICADA',
    contraindicationDetail: 'Phenylephrine dramatically increases systemic vascular resistance against an already poisoned and failing myocardium without providing inotropy, precipitating acute left ventricular failure, severe pulmonary edema, and cardiogenic collapse.',
    contraindicationDetailEs: 'La fenilefrina aumenta drásticamente la resistencia vascular sistémica contra un miocardio intoxicado y deprimido sin aportar inotropismo, precipitando falla ventricular izquierda aguda y colapso cardiogénico.',
  },
  ccb_non_dihydropyridine: {
    id: 'ccb_non_dihydropyridine',
    name: 'Non-Dihydropyridine CCB (Verapamil, Diltiazem)',
    nameEs: 'BCC No Dihidropiridínico (Verapamilo, Diltiazem)',
    category: 'ccb',
    lipophilic: true,
    mechanism: 'Direct cardiac L-type calcium channel blockade at SA node, AV node, and ventricular myocytes. Causes profound bradycardia, high-grade AV block (2nd/3rd degree), electromechanical dissociation, and cardiogenic shock.',
    mechanismEs: 'Bloqueo directo de canales de calcio tipo L en nodo SA, nodo AV y miocitos ventriculares. Causa bradicardia severa, bloqueo AV avanzado (2°/3° grado), disociación electromecánica y choque cardiogénico.',
    pancreaticEffect: 'Marked suppression of pancreatic insulin release resulting in prominent hyperglycemia (blood glucose often > 250-400 mg/dL), serving as a diagnostic hallmark of severe toxicity.',
    pancreaticEffectEs: 'Marcada supresión de liberación de insulina resultando en hiperglucemia prominente (glucosa a menudo > 250-400 mg/dL), marcador diagnóstico de toxicidad severa.',
    firstLineAntidote: 'STAT HIET (1 unit/kg bolus + 1-2 units/kg/hr infusion) + IV Calcium Chloride 1-2 g + 20% Intravenous Lipid Emulsion (ILE) for refractory shock.',
    firstLineAntidoteEs: 'HIET STAT (bolo 1 U/kg + infusión 1-2 U/kg/h) + Cloruro de Calcio IV 1-2 g + Emulsión Lipídica Intravenosa al 20% (ELI) en choque refractario.',
    blackBoxContraindication: 'PREMATURE DISCONTINUATION OF HIET INFUSION CONTRAINDICATED',
    blackBoxContraindicationEs: 'SUSPENSIÓN PREMATURA DE LA INFUSIÓN DE HIET CONTRAINDICADA',
    contraindicationDetail: 'Insulin-mediated metabolic myocyte recruitment has an onset of 15-45 minutes and a long biological half-life. Abrupt cessation of insulin when vitals temporarily stabilize leads to precipitous rebound cardiovascular collapse and fatal cardiac arrest.',
    contraindicationDetailEs: 'El reclutamiento metabólico de miocitos por insulina tiene latencia de 15-45 min y vida biológica prolongada. La suspensión abrupta de insulina al estabilizar transitoriamente los signos vitales produce colapso cardiocirculatorio de rebote y paro fatal.',
  },
  beta_blocker_lipophilic: {
    id: 'beta_blocker_lipophilic',
    name: 'Lipophilic Beta-Blocker (Propranolol, Carvedilol, Labetalol)',
    nameEs: 'Betabloqueador Lipofílico (Propranolol, Carvedilol, Labetalol)',
    category: 'bb',
    lipophilic: true,
    mechanism: 'Crosses blood-brain barrier causing central seizures and coma; possesses sodium channel-blocking (quinidine-like membrane stabilizing) activity causing QRS prolongation and ventricular dysrhythmias.',
    mechanismEs: 'Cruza la barrera hematoencefálica causando convulsiones centrales y coma; posee actividad bloqueadora de canales de sodio causando ensanchamiento del QRS y arritmias ventriculares.',
    pancreaticEffect: 'Unlike CCBs, blood glucose in beta-blocker overdose is typically normal or severely hypoglycemic (due to inhibition of beta-2 mediated glycogenolysis and gluconeogenesis).',
    pancreaticEffectEs: 'A diferencia de los BCC, la glucemia en intoxicación por betabloqueadores suele ser normal o hipoglucémica (por inhibición de glucogenólisis y gluconeogénesis mediada por beta-2).',
    firstLineAntidote: 'HIET + IV Glucagon (3.5-5 mg IV push over 1 min, bypasses beta-receptors via Gs/adenylate cyclase) + Sodium Bicarbonate (for QRS > 100 ms) + 20% ILE.',
    firstLineAntidoteEs: 'HIET + Glucagón IV (3.5-5 mg en bolo, elude receptores beta activando adenilato ciclasa) + Bicarbonato de Sodio (si QRS > 100 ms) + ELI al 20%.',
    blackBoxContraindication: 'STANDARD ACLS HIGH-DOSE EPINEPHRINE ESCALATION PITFALL',
    blackBoxContraindicationEs: 'TRAMPA DE ESCALADA DE DOSIS MASIVAS DE EPINEFRINA EN ACLS ESTÁNDAR',
    contraindicationDetail: 'Escalating standard ACLS epinephrine/norepinephrine to massive doses fails to overcome competitive receptor blockade and precipitates severe peripheral limb gangrene, mesenteric ischemia, and fatal tachyarrhythmias without improving stroke volume.',
    contraindicationDetailEs: 'Escalar epinefrina/norepinefrina estándar a dosis masivas no vence el bloqueo competitivo y desencadena isquemia periférica grave, isquemia mesentérica y arritmias fatales sin mejorar el volumen sistólico.',
  },
  beta_blocker_hydrophilic: {
    id: 'beta_blocker_hydrophilic',
    name: 'Hydrophilic / Cardioselective Beta-Blocker (Atenolol, Metoprolol, Sotalol)',
    nameEs: 'Betabloqueador Hidrofílico / Cardioselectivo (Atenolol, Metoprolol, Sotalol)',
    category: 'bb',
    lipophilic: false,
    mechanism: 'Cardioselective beta-1 antagonism causing sinus bradycardia, AV nodal blockade, hypotension. Sotalol uniquely possesses Class III potassium channel blockade causing prominent QTc prolongation and Torsades de Pointes.',
    mechanismEs: 'Antagonismo beta-1 cardioselectivo que causa bradicardia sinusal, bloqueo AV e hipotensión. Sotalol bloquea canales de potasio (Clase III) provocando prolongación del QTc y Torsades de Pointes.',
    pancreaticEffect: 'Impaired counter-regulatory glucose mobilization; hypoglycemia is common in pediatric or fasting patients.',
    pancreaticEffectEs: 'Alteración de la movilización compensatoria de glucosa; hipoglucemia frecuente en niños o ayuno.',
    firstLineAntidote: 'HIET + IV Calcium + Glucagon (3.5-5 mg IV). Magnesium Sulfate 2 g IV and overdrive pacing for Sotalol-induced Torsades de Pointes. Hemodialysis for Atenolol.',
    firstLineAntidoteEs: 'HIET + Calcio IV + Glucagón (3.5-5 mg IV). Sulfato de Magnesio 2 g IV y marcapasos transitorio para Torsades por Sotalol. Hemodiálisis para Atenolol.',
    blackBoxContraindication: 'ISOPROTERENOL MONOTHERAPY IN CARDIOGENIC SHOCK CONTRAINDICATED',
    blackBoxContraindicationEs: 'MONOTERAPIA CON ISOPROTERENOL EN CHOQUE CARDIOGÉNICO CONTRAINDICADA',
    contraindicationDetail: 'Isoproterenol stimulates peripheral beta-2 receptors, causing catastrophic vasodilation and sudden loss of diastolic coronary perfusion pressure in severe cardiogenic shock.',
    contraindicationDetailEs: 'El isoproterenol estimula receptores beta-2 periféricos, causando vasodilatación catastrófica y pérdida de perfusión coronaria diastólica en choque cardiogénico.',
  },
});

export const CARDIOGENIC_CLINICAL_FLAGS = Object.freeze([
  { id: 'flag_hypotension', label: 'Profound Hypotension: SBP < 80 mmHg or MAP < 60 mmHg refractory to 20-30 mL/kg crystalloids', labelEs: 'Hipotensión Severa: PAS < 80 mmHg o PAM < 60 mmHg refractaria a cristaloides', fatal: true },
  { id: 'flag_bradycardia', label: 'Severe Bradycardia: Heart Rate < 45 bpm or junctional escape rhythm', labelEs: 'Bradicardia Severa: Frecuencia Cardíaca < 45 lpm o ritmo de escape nodal', fatal: true },
  { id: 'flag_av_block', label: 'Advanced Conduction Defect: 2nd or 3rd Degree Complete Heart Block', labelEs: 'Defecto de Conducción Avanzado: Bloqueo AV Completo de 2° o 3° Grado', fatal: true },
  { id: 'flag_hyperglycemia', label: 'Severe Hyperglycemia (> 250 mg/dL): Diagnostic hallmark of severe CCB-mediated insulin arrest', labelEs: 'Hiperglucemia Severa (> 250 mg/dL): Marcador patognomónico de inhibición insulínica por BCC', fatal: false },
  { id: 'flag_hypoglycemia', label: 'Hypoglycemia (< 70 mg/dL): Characteristic of beta-blocker toxicity or excessive insulin shift', labelEs: 'Hipoglucemia (< 70 mg/dL): Característica de intoxicación por betabloqueadores', fatal: false },
  { id: 'flag_qrs_prolongation', label: 'QRS Prolongation > 120 ms: Membrane-stabilizing sodium channel blockade (Propranolol/Carvedilol)', labelEs: 'Ensanchamiento QRS > 120 ms: Bloqueo de canales de sodio estabilizador de membrana', fatal: true },
  { id: 'flag_qtc_torsades', label: 'QTc Prolongation > 500 ms or polymorphic VT / Torsades (Sotalol toxicity)', labelEs: 'Prolongación QTc > 500 ms o TV polimórfica / Torsades de Pointes (Sotalol)', fatal: true },
  { id: 'flag_altered_mental', label: 'Altered Mental Status / Seizures / Coma: Cerebral hypoperfusion or lipophilic CNS toxicity', labelEs: 'Estado Mental Alterado / Convulsiones / Coma: Hipoperfusión cerebral o toxicidad SNC', fatal: true },
]);

export function calculateHietDosing(patientWeightKg = 70, currentGlucoseMgDl = 180) {
  const weight = Math.max(10, Math.min(250, Number(patientWeightKg) || 70));
  const glucose = Number(currentGlucoseMgDl) || 180;

  // Regular Insulin Loading Bolus: 1 unit/kg IV push
  const insulinBolusUnits = Math.round(weight * 1);

  // Initial Maintenance Infusion: 1 unit/kg/hr
  const initialInfusionUnitsPerHr = Math.round(weight * 1);

  // Maximum Titration Ceiling: up to 10 units/kg/hr
  const maxInfusionUnitsPerHr = Math.round(weight * 10);

  // Dextrose Bolus requirement
  const needsDextroseBolus = glucose < 200;
  const dextroseBolusMlD50 = needsDextroseBolus ? Math.round(Math.min(50, weight * 0.5)) : 0;

  // Dextrose Maintenance Infusion: 0.5 - 1.0 g/kg/hr (typically D10W at 200-400 mL/hr or D20W centrally)
  const dextroseMaintenanceGramsHr = Math.round(weight * 0.5);
  const d10wRateMlHr = Math.round(dextroseMaintenanceGramsHr * 10);

  return {
    weightKg: weight,
    insulinBolusUnits,
    initialInfusionUnitsPerHr,
    maxInfusionUnitsPerHr,
    needsDextroseBolus,
    dextroseBolusMlD50,
    dextroseMaintenanceGramsHr,
    d10wRateMlHr,
    glucoseTargetMgDl: '100 - 250 mg/dL',
    potassiumTargetMeqL: '2.8 - 3.5 mEq/L (Permissive hypokalemia; do NOT over-replace unless < 2.8)',
  };
}

export function evaluateCardiogenicRisk(state) {
  const substance = CARDIOGENIC_SUBSTANCES[state.substance] || CARDIOGENIC_SUBSTANCES.ccb_non_dihydropyridine;
  const weight = Number(state.weightKg) || 70;
  const sbp = Number(state.sbpValue);
  const hr = Number(state.hrValue);
  const glucose = Number(state.glucoseValue) || 180;
  const potassium = Number(state.potassiumValue);

  const flags = state.checkedFlags;
  const alerts = [];
  const actions = [];

  const hiet = calculateHietDosing(weight, glucose);

  // Shock Evaluation
  const inShock = (sbp > 0 && sbp < 85) || flags.has('flag_hypotension') || (hr > 0 && hr < 45) || flags.has('flag_bradycardia');
  const hasConductionBlock = flags.has('flag_av_block') || flags.has('flag_qrs_prolongation') || flags.has('flag_qtc_torsades');

  if (inShock) {
    alerts.push({
      type: 'critical',
      title: 'CRITICAL CARDIOGENIC SHOCK / IMPENDING ARREST',
      titleEs: 'CHOQUE CARDIOGÉNICO CRÍTICO / PARO INMINENTE',
      body: 'Patient exhibits severe refractory hypotension and/or bradycardia. Initiate STAT High-Dose Insulin Euglycemia Therapy (HIET) immediately alongside calcium chloride and vasopressors.',
      bodyEs: 'El paciente presenta hipotensión y/o bradicardia refractaria severa. Inicie de inmediato Terapia con Insulina en Altas Dosis (HIET) junto con cloruro de calcio y vasopresores.',
    });
  }

  // Potassium Safety Check
  if (potassium > 0 && potassium < 2.8) {
    alerts.push({
      type: 'warning',
      title: 'SEVERE HYPOKALEMIA (< 2.8 mEq/L) ALERT',
      titleEs: 'ALERTA DE HIPOPOTASEMIA SEVERA (< 2.8 mEq/L)',
      body: 'While permissive hypokalemia (2.8-3.5 mEq/L) is expected during HIET due to intracellular shift, K+ < 2.8 mEq/L increases ventricular arrhythmia risk. Administer 10-20 mEq/hr IV KCl replacement while maintaining insulin infusion.',
      bodyEs: 'Aunque la hipopotasemia permisiva (2.8-3.5 mEq/L) es esperada por desplazamiento intracelular, K+ < 2.8 mEq/L aumenta el riesgo de arritmias. Administre KCl 10-20 mEq/h IV manteniendo la infusión de insulina.',
    });
  } else if (potassium >= 5.5) {
    alerts.push({
      type: 'warning',
      title: 'HYPERKALEMIA / CELLULAR LEAK ALERT',
      titleEs: 'ALERTA DE HIPERPOTASEMIA / FUGA CELULAR',
      body: 'Hyperkalemia in beta-blocker or CCB poisoning signals profound metabolic acidosis or acute renal failure. HIET will drive extracellular potassium back into cells rapidly.',
      bodyEs: 'La hiperpotasemia en intoxicación por betabloqueadores o BCC indica acidosis metabólica profunda o falla renal. HIET reintroducirá rápidamente el potasio a las células.',
    });
  }

  // High Priority Resuscitation Actions
  actions.push({
    priority: 'stat',
    text: `STAT HIET Bolus: Regular Insulin ${hiet.insulinBolusUnits} units IV push (1 unit/kg) over 1-2 minutes.`,
    textEs: `Bolo STAT de HIET: Insulina Regular ${hiet.insulinBolusUnits} unidades IV directa (1 U/kg) en 1-2 minutos.`,
  });

  actions.push({
    priority: 'stat',
    text: `Continuous HIET Infusion: Regular Insulin at ${hiet.initialInfusionUnitsPerHr} units/hr (1 unit/kg/hr), titrate q15-30min up to ${hiet.maxInfusionUnitsPerHr} units/hr (10 units/kg/hr) until MAP >= 65 mmHg.`,
    textEs: `Infusión Continua de HIET: Insulina Regular a ${hiet.initialInfusionUnitsPerHr} U/h (1 U/kg/h), titular c/15-30min hasta ${hiet.maxInfusionUnitsPerHr} U/h (10 U/kg/h) hasta PAM >= 65 mmHg.`,
  });

  if (hiet.needsDextroseBolus) {
    actions.push({
      priority: 'stat',
      text: `Dextrose Bolus: Administer ${hiet.dextroseBolusMlD50} mL D50W IV STAT (blood glucose < 200 mg/dL). Initiate D10W at ${hiet.d10wRateMlHr} mL/hr to maintain target 100-250 mg/dL.`,
      textEs: `Bolo de Dextrosa: Administrar ${hiet.dextroseBolusMlD50} mL de D50W IV STAT (glucemia < 200 mg/dL). Iniciar D10W a ${hiet.d10wRateMlHr} mL/h para mantener meta 100-250 mg/dL.`,
    });
  } else {
    actions.push({
      priority: 'urgent',
      text: `Euglycemia Maintenance: Blood glucose >= 200 mg/dL. Start D10W infusion at ${hiet.d10wRateMlHr} mL/hr when glucose trends below 200 mg/dL. Check fingerstick glucose every 15-30 min.`,
      textEs: `Mantenimiento de Euglucemia: Glucosa >= 200 mg/dL. Iniciar infusión de D10W a ${hiet.d10wRateMlHr} mL/h cuando baje de 200 mg/dL. Monitorear glucemia capilar c/15-30 min.`,
    });
  }

  // Calcium Antagonism
  actions.push({
    priority: 'stat',
    text: 'Calcium Chloride 10%: 1-2 g (10-20 mL) IV via central line (or peripheral in life-threatening arrest) over 5-10 min; repeat q10-15min up to 3 doses to overcome competitive L-type channel blockade.',
    textEs: 'Cloruro de Calcio al 10%: 1-2 g (10-20 mL) IV por vía central (o periférica en paro) en 5-10 min; repetir c/10-15min hasta 3 dosis para superar el bloqueo de canales L.',
  });

  // Substance-Specific Directives
  if (substance.category === 'bb') {
    actions.push({
      priority: 'urgent',
      text: 'IV Glucagon: 3.5-5 mg IV push over 1-2 min (bypasses blocked beta-receptors via myocardial Gs adenylate cyclase). If MAP improves, run infusion at 1-5 mg/hr. Pre-treat with antiemetic.',
      textEs: 'Glucagón IV: 3.5-5 mg en bolo IV en 1-2 min (elude receptores beta bloqueados estimulando adenilato ciclasa Gs). Si la PAM mejora, infusión a 1-5 mg/h. Premedicar con antiemético.',
    });
    if (flags.has('flag_qrs_prolongation')) {
      actions.push({
        priority: 'stat',
        text: 'Sodium Bicarbonate: 1-2 mEq/kg IV push for QRS > 120 ms (membrane-stabilizing sodium channel blockade from lipophilic propranolol). Maintain serum pH 7.45-7.55.',
        textEs: 'Bicarbonato de Sodio: 1-2 mEq/kg IV en bolo por QRS > 120 ms (bloqueo de canales de sodio por propranolol). Mantener pH 7.45-7.55.',
      });
    }
    if (flags.has('flag_qtc_torsades')) {
      actions.push({
        priority: 'stat',
        text: 'Magnesium Sulfate 2 g IV over 10 min + Overdrive transvenous pacing (90-110 bpm) for Sotalol-induced Torsades de Pointes. Avoid amiodarone/procainamide.',
        textEs: 'Sulfato de Magnesio 2 g IV en 10 min + Marcapasos transvenoso de sobreestimulación (90-110 lpm) para Torsades por Sotalol. Evitar amiodarona/procainamida.',
      });
    }
  }

  if (substance.lipophilic && (inShock || hasConductionBlock)) {
    actions.push({
      priority: 'urgent',
      text: '20% Intravenous Lipid Emulsion (ILE / Intralipid): Bolus 1.5 mL/kg IV over 2-3 min, followed by 0.25 mL/kg/min infusion (max 12 mL/kg over 24h) as a "lipid sink" for lipophilic cardiotoxins in peri-arrest shock.',
      textEs: 'Emulsión Lipídica al 20% (ELI / Intralipid): Bolo de 1.5 mL/kg IV en 2-3 min, seguido de infusión a 0.25 mL/kg/min (máx 12 mL/kg en 24h) como trampa lipídica en peri-paro.',
    });
  }

  return {
    substance,
    inShock,
    hasConductionBlock,
    hiet,
    alerts,
    actions,
  };
}

export function generateCardiogenicSbar(state, lang = 'en') {
  const isEs = lang === 'es';
  const sub = CARDIOGENIC_SUBSTANCES[state.substance] || CARDIOGENIC_SUBSTANCES.ccb_non_dihydropyridine;
  const evalResult = evaluateCardiogenicRisk(state);
  const now = new Date().toISOString();

  if (isEs) {
    return [
      '=== REPORTE CLÍNICO SBAR: TOXICOLOGÍA CARDIOVASCULAR Y PROTOCOLO HIET ===',
      `Fecha/Hora: ${now}`,
      'Privacidad: Cero PII / Identificadores Anonimizados (Cumplimiento HIPAA / 42 CFR Parte 2)',
      '',
      'SITUATION (SITUACIÓN):',
      `Paciente con sospecha o confirmación de intoxicación por ${sub.nameEs}.`,
      `Peso Corporal Estimado: ${state.weightKg || '70'} kg. Presión Arterial: ${state.sbpValue || 'Pendiente'} mmHg. FC: ${state.hrValue || 'Pendiente'} lpm. Glucemia Capilar: ${state.glucoseValue || 'Pendiente'} mg/dL.`,
      `Estado Hemodinámico: ${evalResult.inShock ? 'CHOQUE CARDIOGÉNICO REFRACTARIO' : 'Monitoreo Cardiovascular Intensivo'}.`,
      '',
      'BACKGROUND (ANTECEDENTES):',
      `Mecanismo Toxicológico: ${sub.mechanismEs}`,
      `Efecto Endocrino/Pancreático: ${sub.pancreaticEffectEs}`,
      `Banderas Clínicas Activas: ${Array.from(state.checkedFlags).join(', ') || 'Ninguna registrada'}`,
      '',
      'ASSESSMENT (EVALUACIÓN Y CÁLCULOS HIET):',
      `• Bolo de Carga de Insulina Regular: ${evalResult.hiet.insulinBolusUnits} Unidades IV (1 U/kg)`,
      `• Infusión Continua Inicial de Insulina: ${evalResult.hiet.initialInfusionUnitsPerHr} U/h (1 U/kg/h) - Titulable hasta ${evalResult.hiet.maxInfusionUnitsPerHr} U/h (10 U/kg/h)`,
      `• Meta de Glucemia: ${evalResult.hiet.glucoseTargetMgDl} (D10W a ${evalResult.hiet.d10wRateMlHr} mL/h)`,
      `• Manejo de Potasio: Meta 2.8 - 3.5 mEq/L (Hipopotasemia permisiva por desplazamiento celular)`,
      '',
      'RECOMMENDATIONS & CRITICAL DIRECTIVES (RECOMENDACIONES Y DIRECTIVAS CRÍTICAS):',
      `1. ADVERTENCIA NEGRA: ${sub.blackBoxContraindicationEs}`,
      `   ${sub.contraindicationDetailEs}`,
      '2. Administrar Cloruro de Calcio al 10% 1-2 g IV por vía central.',
      sub.category === 'bb' ? '3. Glucagón 3.5-5 mg IV en bolo para eludir el bloqueo de receptores beta.' : '3. Mantener infusión de norepinefrina/vasopresina para tono vascular si hay vasoplejía.',
      '4. Monitoreo estricto de glucosa capilar cada 15-30 min y potasio sérico cada hora.',
      '5. PROHIBIDO suspender bruscamente la insulina cuando mejore la presión; el efecto inotrópico de la insulina tiene latencia y persistencia.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '=== SBAR CLINICAL HANDOFF REPORT: CARDIOGENIC TOXIN & HIET PROTOCOL ===',
    `Timestamp: ${now}`,
    'Privacy: Zero PII / Redacted Identifiers (HIPAA / 42 CFR Part 2 Compliant)',
    '',
    'SITUATION:',
    `Patient presenting with confirmed or suspected acute poisoning from ${sub.name}.`,
    `Estimated Weight: ${state.weightKg || '70'} kg. SBP: ${state.sbpValue || 'Pending'} mmHg. Heart Rate: ${state.hrValue || 'Pending'} bpm. Capillary Glucose: ${state.glucoseValue || 'Pending'} mg/dL.`,
    `Hemodynamic Status: ${evalResult.inShock ? 'REFRACTORY CARDIOGENIC SHOCK / IMPENDING ARREST' : 'Intensive Hemodynamic Monitoring'}.`,
    '',
    'BACKGROUND:',
    `Toxicological Mechanism: ${sub.mechanism}`,
    `Endocrine/Pancreatic Effect: ${sub.pancreaticEffect}`,
    `Active Clinical Flags: ${Array.from(state.checkedFlags).join(', ') || 'None selected'}`,
    '',
    'ASSESSMENT & HIET DOSING CALCULATIONS:',
    `• Regular Insulin STAT Loading Bolus: ${evalResult.hiet.insulinBolusUnits} Units IV (1 unit/kg)`,
    `• Initial Continuous Insulin Infusion: ${evalResult.hiet.initialInfusionUnitsPerHr} units/hr (1 unit/kg/hr) - Titrate up to ${evalResult.hiet.maxInfusionUnitsPerHr} units/hr (10 units/kg/hr)`,
    `• Dextrose Target: ${evalResult.hiet.glucoseTargetMgDl} (D10W infusion at ${evalResult.hiet.d10wRateMlHr} mL/hr)`,
    `• Potassium Safety Target: ${evalResult.hiet.potassiumTargetMeqL}`,
    '',
    'RECOMMENDATIONS & LIFE-SAVING DIRECTIVES:',
    `1. BLACK-BOX ALERT: ${sub.blackBoxContraindication}`,
    `   ${sub.contraindicationDetail}`,
    '2. Administer Calcium Chloride 10% 1-2 g IV push via central line over 5-10 min.',
    sub.category === 'bb' ? '3. Administer Glucagon 3.5-5 mg IV push over 1-2 min to bypass beta-receptors.' : '3. Titrate norepinephrine/vasopressin for peripheral vasoplegia in dihydropyridine poisoning.',
    '4. Check point-of-care capillary glucose every 15-30 min; check serum potassium every 1-2 hours.',
    '5. STRICTLY PROHIBIT premature cessation of insulin infusion upon hemodynamic stabilization.',
    '====================================================================',
  ].join('\n');
}

// In-RAM Ephemeral State Lifecycle
function createInitialState() {
  return {
    substance: 'ccb_non_dihydropyridine',
    weightKg: '70',
    sbpValue: '',
    hrValue: '',
    glucoseValue: '210',
    potassiumValue: '3.6',
    checkedFlags: new Set(),
  };
}

let cardiogenicState = createInitialState();
const listeners = new Set();

export function getCardiogenicState() {
  return cardiogenicState;
}

export function updateCardiogenicState(partial) {
  cardiogenicState = { ...cardiogenicState, ...partial };
  listeners.forEach((fn) => fn(getCardiogenicState()));
}

export function resetCardiogenicState() {
  cardiogenicState = createInitialState();
  listeners.forEach((fn) => fn(getCardiogenicState()));
}

export function subscribeCardiogenicState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Accessible DOM View
export function cardiogenicToxinHietView() {
  const container = h('div', { class: 'cardiogenic-view specialized-clinical-view' });
  const lang = getLang();
  const isEs = lang === 'es';

  const header = pageHeader(
    t('tools.item.cardiogenic-toxin-hiet.title', 'Cardiogenic Toxin & High-Dose Insulin Euglycemia (HIET) Navigator'),
    t(
      'tools.item.cardiogenic-toxin-hiet.description',
      'Clinical consensus protocols for Calcium Channel Blocker (CCB) and Beta-Blocker (BB) poisoning, weight-based High-Dose Insulin (HIET) titration, euglycemia glucose bridging, permissive hypokalemia, and black-box phenylephrine/abrupt cessation prohibitions.',
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
      'aria-label': isEs ? 'Seleccionar toxina cardiogénica' : 'Select cardiogenic toxin',
      onchange: (e) => updateCardiogenicState({ substance: e.target.value }),
    },
    Object.values(CARDIOGENIC_SUBSTANCES).map((item) =>
      h('option', { value: item.id, selected: item.id === getCardiogenicState().substance }, isEs ? item.nameEs : item.name),
    ),
  );
  const mechanismContainer = h('div', { class: 'nsti-stage-info' });
  const subCard = h('div', { class: 'nsti-card' }, [
    h('h2', { class: 'nsti-card-title' }, isEs ? '1. Toxina Cardiogénica Involucrada' : '1. Implicated Cardiogenic Toxin'),
    subSelect,
    mechanismContainer,
  ]);
  leftCol.appendChild(subCard);

  // Vitals & Lab Card
  const weightInput = h('input', {
    id: 'weight-input',
    type: 'number',
    class: 'nsti-num-input',
    placeholder: '70',
    value: getCardiogenicState().weightKg,
    oninput: (e) => updateCardiogenicState({ weightKg: e.target.value }),
  });
  const sbpInput = h('input', {
    id: 'sbp-input',
    type: 'number',
    class: 'nsti-num-input',
    placeholder: '75',
    value: getCardiogenicState().sbpValue,
    oninput: (e) => updateCardiogenicState({ sbpValue: e.target.value }),
  });
  const hrInput = h('input', {
    id: 'hr-input',
    type: 'number',
    class: 'nsti-num-input',
    placeholder: '38',
    value: getCardiogenicState().hrValue,
    oninput: (e) => updateCardiogenicState({ hrValue: e.target.value }),
  });
  const glucoseInput = h('input', {
    id: 'glucose-input',
    type: 'number',
    class: 'nsti-num-input',
    placeholder: '220',
    value: getCardiogenicState().glucoseValue,
    oninput: (e) => updateCardiogenicState({ glucoseValue: e.target.value }),
  });
  const potassiumInput = h('input', {
    id: 'potassium-input',
    type: 'number',
    step: '0.1',
    class: 'nsti-num-input',
    placeholder: '3.6',
    value: getCardiogenicState().potassiumValue,
    oninput: (e) => updateCardiogenicState({ potassiumValue: e.target.value }),
  });

  const vitalsCard = h('div', { class: 'nsti-card' }, [
    h('h2', { class: 'nsti-card-title' }, isEs ? '2. Parámetros Hemodinámicos y Laboratorio' : '2. Hemodynamics & Lab Values'),
    h('div', { class: 'decon-input-group' }, [
      h('label', { for: 'weight-input' }, isEs ? 'Peso del Paciente (kg - para cálculo HIET):' : 'Patient Weight (kg - for HIET dosing):'),
      weightInput,
    ]),
    h('div', { class: 'decon-input-group' }, [
      h('label', { for: 'sbp-input' }, isEs ? 'Presión Arterial Sistólica PAS (mmHg - Alerta si < 85):' : 'Systolic Blood Pressure SBP (mmHg - Alert if < 85):'),
      sbpInput,
    ]),
    h('div', { class: 'decon-input-group' }, [
      h('label', { for: 'hr-input' }, isEs ? 'Frecuencia Cardíaca (lpm - Alerta si < 45):' : 'Heart Rate (bpm - Alert if < 45):'),
      hrInput,
    ]),
    h('div', { class: 'decon-input-group' }, [
      h('label', { for: 'glucose-input' }, isEs ? 'Glucemia Capilar (mg/dL - Alerta si < 200 para bolo dextrosa):' : 'Capillary Glucose (mg/dL - Alert if < 200 for D50W bolus):'),
      glucoseInput,
    ]),
    h('div', { class: 'decon-input-group' }, [
      h('label', { for: 'potassium-input' }, isEs ? 'Potasio Sérico (mEq/L - Meta 2.8 - 3.5):' : 'Serum Potassium (mEq/L - Target 2.8 - 3.5):'),
      potassiumInput,
    ]),
  ]);
  leftCol.appendChild(vitalsCard);

  // Clinical Flags Card
  const flagCheckboxes = [];
  const flagsCard = h('div', { class: 'nsti-card' }, [
    h('h2', { class: 'nsti-card-title' }, isEs ? '3. Banderas de Riesgo Cardiovascular' : '3. Cardiovascular Risk Flags'),
    h(
      'div',
      { class: 'decon-checkbox-group' },
      CARDIOGENIC_CLINICAL_FLAGS.map((f) => {
        const cb = h('input', {
          type: 'checkbox',
          checked: getCardiogenicState().checkedFlags.has(f.id),
          onchange: (e) => {
            const set = new Set(getCardiogenicState().checkedFlags);
            if (e.target.checked) set.add(f.id);
            else set.delete(f.id);
            updateCardiogenicState({ checkedFlags: set });
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
  const hietDosingCardContainer = h('div');
  const directivesCardContainer = h('div');
  const sbarCardContainer = h('div');
  rightCol.appendChild(hietDosingCardContainer);
  rightCol.appendChild(directivesCardContainer);
  rightCol.appendChild(sbarCardContainer);

  function renderDynamic() {
    const state = getCardiogenicState();
    const sub = CARDIOGENIC_SUBSTANCES[state.substance] || CARDIOGENIC_SUBSTANCES.ccb_non_dihydropyridine;
    const evalResult = evaluateCardiogenicRisk(state);

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
    mechanismContainer.appendChild(h('strong', {}, isEs ? 'Mecanismo Fisiopatológico: ' : 'Pathophysiologic Mechanism: '));
    mechanismContainer.appendChild(h('p', {}, isEs ? sub.mechanismEs : sub.mechanism));
    mechanismContainer.appendChild(h('strong', {}, isEs ? 'Efecto Pancreático / Insulínico: ' : 'Pancreatic / Endocrine Effect: '));
    mechanismContainer.appendChild(h('p', {}, isEs ? sub.pancreaticEffectEs : sub.pancreaticEffect));

    // Update HIET Dosing Calculation Card
    clear(hietDosingCardContainer);
    hietDosingCardContainer.appendChild(
      h('div', { class: 'nsti-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? '4. Protocolo y Cálculo de Dosis HIET' : '4. Calculated HIET Dosing Protocol'),
        h('div', { class: 'decon-directive-box' }, [
          h('p', {}, [
            h('strong', {}, isEs ? '• Bolo de Carga Inicial: ' : '• Initial Loading Bolus: '),
            h('span', { class: 'font-bold' }, `${evalResult.hiet.insulinBolusUnits} Unidades `),
            h('span', {}, isEs ? 'de Insulina Regular IV directa (1 U/kg en 1-2 min).' : 'of Regular Insulin IV push (1 unit/kg over 1-2 min).'),
          ]),
          h('p', {}, [
            h('strong', {}, isEs ? '• Infusión de Mantenimiento: ' : '• Maintenance Infusion: '),
            h('span', { class: 'font-bold' }, `${evalResult.hiet.initialInfusionUnitsPerHr} Unidades/hora `),
            h('span', {}, isEs ? `(1 U/kg/h). Titulable cada 15-30 min hasta ${evalResult.hiet.maxInfusionUnitsPerHr} U/h (10 U/kg/h) según PAM >= 65 mmHg.` : `(1 unit/kg/hr). Titrate q15-30min up to ${evalResult.hiet.maxInfusionUnitsPerHr} units/hr (10 units/kg/hr) until MAP >= 65 mmHg.`),
          ]),
          h('p', {}, [
            h('strong', {}, isEs ? '• Puente de Euglucemia: ' : '• Euglycemia Glucose Support: '),
            h('span', {}, isEs
              ? `Meta de glucemia 100-250 mg/dL. Si glucosa < 200 mg/dL, pasar bolo de ${evalResult.hiet.dextroseBolusMlD50} mL de D50W IV STAT. Mantener D10W a ${evalResult.hiet.d10wRateMlHr} mL/h.`
              : `Target blood glucose 100-250 mg/dL. If glucose < 200 mg/dL, bolus ${evalResult.hiet.dextroseBolusMlD50} mL D50W IV STAT. Infuse D10W at ${evalResult.hiet.d10wRateMlHr} mL/hr.`),
          ]),
          h('p', {}, [
            h('strong', {}, isEs ? '• Regla de Potasio Sérico: ' : '• Permissive Potassium Rule: '),
            h('span', {}, isEs
              ? 'Mantener K+ 2.8 - 3.5 mEq/L. No corregir agresivamente el potasio desplazado intracelularmente por la insulina a menos que K+ < 2.8 mEq/L.'
              : 'Target K+ 2.8 - 3.5 mEq/L. Permissive hypokalemia is expected; do not aggressively replace intracellular shifted potassium unless K+ < 2.8 mEq/L.'),
          ]),
        ]),
      ]),
    );

    // Update Directives Card
    clear(directivesCardContainer);
    directivesCardContainer.appendChild(
      h('div', { class: 'nsti-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? '5. Directivas de Resucitación y Antídotos' : '5. Resuscitation & Antidote Directives'),
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
        h('div', { class: 'decon-directive-box' }, [
          h('strong', {}, isEs ? 'Antídoto de Primera Línea: ' : 'First-Line Antidote Protocol: '),
          h('p', { class: 'decon-directive-text' }, isEs ? sub.firstLineAntidoteEs : sub.firstLineAntidote),
        ]),
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
    const sbarText = generateCardiogenicSbar(state, lang);
    clear(sbarCardContainer);
    const sbarTextarea = h(
      'textarea',
      {
        id: 'cardiogenic-sbar-text',
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
          resetCardiogenicState();
          weightInput.value = '70';
          sbpInput.value = '';
          hrInput.value = '';
          glucoseInput.value = '210';
          potassiumInput.value = '3.6';
          subSelect.value = 'ccb_non_dihydropyridine';
          flagCheckboxes.forEach((f) => { f.input.checked = false; });
        },
      },
      isEs ? 'Reiniciar Formulario' : 'Reset Form',
    );

    sbarCardContainer.appendChild(
      h('div', { class: 'nsti-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? '6. Nota SBAR de Transferencia Crítica (Cero PII)' : '6. Zero-PII SBAR Resuscitation Handoff Note'),
        sbarTextarea,
        h('div', { class: 'nsti-btn-row' }, [copyBtn, resetBtn]),
      ]),
    );
  }

  const unsubscribe = subscribeCardiogenicState(() => {
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
