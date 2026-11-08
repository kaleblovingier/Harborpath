// public/js/views/adulterantHeavyMetals.js
// Wave 65: Illicit Drug Adulterants, Heavy Metals & Novel High-Potency Alpha-2 Agonist Triage
// ACMT, AACT, and CDC HAN Clinical Toxicology Standards.
// Ephemeral in-RAM state, zero persistent storage, zero PII, WCAG 2.1 AA compliant.

import { h } from '../dom.js';
import { t, getLang } from '../i18n.js';

export const ADULTERANT_TYPES = Object.freeze({
  medetomidine: {
    id: 'medetomidine',
    name: 'Medetomidine / Dexmedetomidine (Novel High-Potency Alpha-2 Agonist)',
    nameEs: 'Medetomidina / Dexmedetomidina (Agonista Alfa-2 de Alta Potencia)',
    selectivity: '1,620:1 Alpha-2 to Alpha-1 receptor selectivity (vs Xylazine 160:1, Clonidine 220:1)',
    selectivityEs: 'Selectividad de receptores Alfa-2 a Alfa-1 de 1,620:1 (vs Xilazina 160:1, Clonidina 220:1)',
    clinicalSyndrome: 'Profound refractory bradycardia (HR 25-45 bpm), core hypothermia (< 35°C), deep coma lasting 12-24 hours. Reversal of apnea with naloxone but persistent deep stupor and bradycardia.',
    clinicalSyndromeEs: 'Bradicardia refractaria severa (FC 25-45 lpm), hipotermia central (< 35°C), coma de 12-24 horas. Reversión de apnea con naloxona pero estupor y bradicardia persistentes.',
    blackBoxContraindication: 'VETERINARY ATIPAMEZOLE (ANTISEDAN) STRICTLY PROHIBITED IN HUMANS',
    blackBoxContraindicationEs: 'ATIPAMEZOL VETERINARIO (ANTISEDAN) ESTRICTAMENTE PROHIBIDO EN HUMANOS',
    contraindicationDetail: 'Atipamezole is unapproved for humans; acute alpha-2 antagonism precipitates massive catecholamine surge, malignant hypertension, intractable seizures, and acute unmanageable withdrawal shock.',
    contraindicationDetailEs: 'El atipamezol no está aprobado para humanos; el antagonismo alfa-2 agudo desencadena descarga masiva de catecolaminas, crisis hipertensiva, convulsiones refractarias y choque por abstinencia.',
    management: 'Airway support, active external rewarming to >36°C, Atropine 1 mg IV (max 3 mg) or Glycopyrrolate 0.2 mg IV for unstable bradycardia, transcutaneous pacing or Norepinephrine infusion for refractory shock. 24h monitored bed.',
    managementEs: 'Soporte de vía aérea, recalentamiento activo a >36°C, Atropina 1 mg IV (máx 3 mg) o Glicopirrolato 0.2 mg IV para bradicardia inestable, marcapasos transcutáneo o infusión de Norepinefrina para choque refractario. Cama monitorizada 24h.',
  },
  brodifacoum: {
    id: 'brodifacoum',
    name: 'Brodifacoum / Superwarfarin (Contaminated Synthetic Cannabinoids / "Spice")',
    nameEs: 'Brodifacoum / Superwarfarina (Cannabinoides Sintéticos Adulterados / "Spice")',
    selectivity: 'Irreversible inhibition of Vitamin K epoxide reductase (VKORC1); terminal half-life of 20-60+ days',
    selectivityEs: 'Inhibición irreversible de vitamina K epóxido reductasa (VKORC1); vida media de 20-60+ días',
    clinicalSyndrome: 'Spontaneous life-threatening mucosal/internal hemorrhage, painless gross hematuria, retroperitoneal hematoma, unmeasurable INR (> 10.0), normal platelets/fibrinogen.',
    clinicalSyndromeEs: 'Hemorragia mucosa/interna espontánea con riesgo vital, hematuria macroscópica indolora, hematoma retroperitoneal, INR incalculable (> 10.0), plaquetas/fibrinógeno normales.',
    blackBoxContraindication: 'PREMATURE VITAMIN K CESSATION / RAPID IV BOLUS PHYTONADIONE',
    blackBoxContraindicationEs: 'SUSPENSIÓN PREMATURA DE VITAMINA K / BOLO IV RÁPIDO DE FITONADIONA',
    contraindicationDetail: 'Never give rapid IV push phytonadione (black-box warning: fatal anaphylactoid shock; dilute in 50 mL D5W over 60 min). Never stop oral Vitamin K prematurely; brodifacoum persists in adipocytes for 3-6+ months.',
    contraindicationDetailEs: 'Nunca administrar fitonadiona en bolo IV rápido (alerta negra: choque anafilactoide fatal; diluir en 50 mL D5W en 60 min). Nunca suspender vitamina K oral prematuramente; persiste en adipocitos por 3-6+ meses.',
    management: 'STAT 4-Factor PCC (Kcentra) 25-50 units/kg IV for acute life-threatening bleeding. IV Vitamin K1 10 mg slow infusion. Long-term oral Phytonadione 50-100 mg PO daily in divided doses with fatty meals for 3-6 months.',
    managementEs: 'STAT CCP de 4 factores (Kcentra) 25-50 unidades/kg IV para hemorragia con riesgo vital. Vitamina K1 IV 10 mg infusión lenta. Fitonadiona oral a largo plazo 50-100 mg VO diario en dosis divididas con comidas grasas por 3-6 meses.',
  },
  lead: {
    id: 'lead',
    name: 'Lead Contamination (Heavy Metal Adulteration in Street Opium / Heroin)',
    nameEs: 'Contaminación por Plomo (Adulteración con Metales Pesados en Opio / Heroína)',
    selectivity: 'Dense lead oxides added to bulk up weight; blocks ALAD, ferrochelatase, pyrimidine-5-nucleotidase',
    selectivityEs: 'Óxidos densos de plomo añadidos para aumentar peso; bloquea ALAD, ferroquelatasa y pirimidina-5-nucleotidasa',
    clinicalSyndrome: 'Microcytic anemia with basophilic stippling, severe spasmodic abdominal pain ("lead colic"), pure motor peripheral neuropathy (bilateral wrist drop, foot drop), Burton blue lines on gums, encephalopathy.',
    clinicalSyndromeEs: 'Anemia microcítica con punteado basófilo, dolor abdominal espasmódico severo ("cólico saturnino"), neuropatía periférica motora pura (muñeca caída bilateral), líneas de Burton, encefalopatía.',
    blackBoxContraindication: 'CALCIUM DISODIUM EDTA BEFORE BAL / DISODIUM EDTA PROHIBITION',
    blackBoxContraindicationEs: 'EDTA CÁLCICO DISÓDICO ANTES DE BAL / PROHIBICIÓN DE EDTA DISÓDICO',
    contraindicationDetail: 'NEVER administer Calcium Disodium EDTA alone or prior to Dimercaprol (BAL) in severe plumbism (EDTA mobilizes skeletal lead into the brain, causing lethal herniation). NEVER administer Disodium EDTA (Na2EDTA; binds ionized calcium causing fatal tetany and cardiac arrest).',
    contraindicationDetailEs: 'NUNCA administrar EDTA Cálcico Disódico solo o antes de Dimercaprol (BAL) en plumbismo severo (el EDTA moviliza plomo al cerebro, causando herniación fatal). NUNCA administrar EDTA Disódico (Na2EDTA; quelata calcio causando tetania fatal y paro cardíaco).',
    management: 'If BLL >= 70 ug/dL or encephalopathy: Dimercaprol (BAL) 4 mg/kg deep IM q4h FIRST, wait 4 hours, then start Calcium Disodium EDTA 1000-1500 mg/m2/day continuous IV. If BLL 45-69 ug/dL: Oral Succimer (DMSA) 10 mg/kg PO TID x 5 days then BID x 14 days.',
    managementEs: 'Si plumbemia >= 70 ug/dL o encefalopatía: Dimercaprol (BAL) 4 mg/kg IM profundo c/4h PRIMERO, esperar 4 horas, luego iniciar EDTA Cálcico Disódico 1000-1500 mg/m2/día IV continuo. Si plumbemia 45-69 ug/dL: Succímero oral (DMSA) 10 mg/kg VO TID x 5 días luego BID x 14 días.',
  },
});

export const ADULTERANT_CLINICAL_FLAGS = Object.freeze([
  { id: 'profoundBradycardia', label: 'Profound bradycardia (HR < 45 bpm) following opioid reversal', labelEs: 'Bradicardia severa (FC < 45 lpm) tras reversión de opioide', severe: true, group: 'medetomidine' },
  { id: 'hypothermiaCore', label: 'Core body temperature < 35°C (< 95°F) with prolonged stupor (12-24h)', labelEs: 'Temperatura corporal central < 35°C con estupor prolongado (12-24h)', severe: true, group: 'medetomidine' },
  { id: 'atipamezoleConsidered', label: 'Provider considering veterinary Atipamezole (Antisedan) for sedation reversal', labelEs: 'Médico considerando Atipamezol veterinario (Antisedan) para revertir sedación', severe: true, fatal: true, group: 'medetomidine' },
  { id: 'unmeasurableInr', label: 'INR > 10.0 or unmeasurable with normal platelet count after synthetic cannabinoid use', labelEs: 'INR > 10.0 o incalculable con recuento plaquetario normal tras uso de cannabinoides sintéticos', severe: true, group: 'brodifacoum' },
  { id: 'spontaneousBleeding', label: 'Active spontaneous bleeding (gross hematuria, flank ecchymosis, retroperitoneal)', labelEs: 'Hemorragia espontánea activa (hematuria macroscópica, equimosis en flancos, retroperitoneal)', severe: true, fatal: true, group: 'brodifacoum' },
  { id: 'rapidVitKBolus', label: 'Team preparing rapid IV bolus push of Vitamin K1 (Phytonadione)', labelEs: 'Equipo preparando bolo IV rápido de Vitamina K1 (Fitonadiona)', severe: true, fatal: true, group: 'brodifacoum' },
  { id: 'bilateralWristDrop', label: 'Bilateral radial nerve motor neuropathy (wrist drop) or foot drop', labelEs: 'Neuropatía motora bilateral del nervio radial (muñeca caída) o pie caído', severe: true, group: 'lead' },
  { id: 'basophilicStipplingColic', label: 'Severe paroxysmal abdominal colic + microcytic anemia with basophilic stippling', labelEs: 'Cólico abdominal paroxístico severo + anemia microcítica con punteado basófilo', severe: true, group: 'lead' },
  { id: 'leadEncephalopathy', label: 'Altered mental status, delirium, seizures with suspected heavy metal exposure (BLL >= 70)', labelEs: 'Estado mental alterado, delirio, convulsiones con sospecha de metales pesados (BLL >= 70)', severe: true, fatal: true, group: 'lead' },
  { id: 'edtaAloneOrdered', label: 'Calcium Disodium EDTA ordered alone or before Dimercaprol (BAL) for severe plumbism', labelEs: 'EDTA Cálcico Disódico ordenado solo o antes de Dimercaprol (BAL) para plumbismo severo', severe: true, fatal: true, group: 'lead' },
]);

export function evaluateAdulterantRisk(state) {
  const flags = new Set(state.checkedFlags || []);
  const adulterant = state.adulterantType || 'medetomidine';
  const hr = parseInt(state.heartRate, 10);
  const inr = parseFloat(state.inrValue);
  const bll = parseFloat(state.bllValue);
  const actions = [];
  const alerts = [];
  let priority = 'standard';

  // 1. Black Box & Fatal Pitfall Checks First
  if (flags.has('atipamezoleConsidered') || (adulterant === 'medetomidine' && state.atipamezolePlanned)) {
    priority = 'critical-fatal';
    alerts.push({
      type: 'fatal-alert',
      title: 'FATAL VETERINARY DRUG CONTRAINDICATION: ATIPAMEZOLE PROHIBITED',
      titleEs: 'CONTRAINDICACIÓN FATAL DE FÁRMACO VETERINARIO: ATIPAMEZOL PROHIBIDO',
      body: 'Veterinary Atipamezole (Antisedan) is strictly unapproved in humans. In medetomidine toxicity, it triggers massive catecholamine surge, malignant hypertension, seizures, and fatal acute withdrawal shock.',
      bodyEs: 'El Atipamezol veterinario (Antisedan) está estrictamente desaprobado en humanos. En toxicidad por medetomidina, desencadena tormenta adrenérgica, hipertensión maligna, convulsiones y choque por abstinencia fatal.',
    });
    actions.push({
      priority: 'stat',
      text: 'CANCEL all atipamezole orders immediately. Provide supportive care: airway management, active rewarming, and Atropine/Pacing for bradycardia.',
      textEs: 'CANCELE todas las órdenes de atipamezol de inmediato. Brinde soporte: vía aérea, recalentamiento activo y Atropina/Marcapasos para bradicardia.',
    });
  }

  if (flags.has('rapidVitKBolus') || (adulterant === 'brodifacoum' && state.rapidVitKPlanned)) {
    priority = 'critical-fatal';
    alerts.push({
      type: 'fatal-alert',
      title: 'FATAL ADMINISTRATION ROUTE: RAPID IV VITAMIN K BLACK-BOX ALERT',
      titleEs: 'VÍA FATAL DE ADMINISTRACIÓN: ALERTA NEGRA POR VITAMINA K IV RÁPIDA',
      body: 'Rapid IV push phytonadione carries a black-box warning for fatal anaphylactoid shock and cardiac arrest. It MUST be diluted in 50 mL D5W and infused over at least 60 minutes.',
      bodyEs: 'La fitonadiona en bolo IV rápido tiene advertencia de caja negra por choque anafilactoide fatal y paro cardíaco. DEBE diluirse en 50 mL D5W e infundirse en al menos 60 minutos.',
    });
    actions.push({
      priority: 'stat',
      text: 'STOP rapid IV push. Dilute Phytonadione 10 mg in 50 mL D5W or NS and infuse over 60 minutes with continuous monitoring.',
      textEs: 'DETENGA el bolo IV rápido. Diluya Fitonadiona 10 mg en 50 mL D5W o SF e infunda en 60 minutos con monitorización continua.',
    });
  }

  if (flags.has('edtaAloneOrdered') || (adulterant === 'lead' && state.edtaAlonePlanned)) {
    priority = 'critical-fatal';
    alerts.push({
      type: 'fatal-alert',
      title: 'FATAL CHELATION SEQUENCING: NEVER ADMINISTER EDTA BEFORE BAL',
      titleEs: 'SECUENCIA FATAL DE QUELACIÓN: NUNCA ADMINISTRAR EDTA ANTES DE BAL',
      body: 'Administering Calcium Disodium EDTA alone or before Dimercaprol (BAL) mobilizes bone lead into the cerebral cortex, triggering catastrophic encephalopathy and brain herniation. BAL MUST be given 4 hours prior to EDTA.',
      bodyEs: 'Administrar EDTA Cálcico Disódico solo o antes de Dimercaprol (BAL) moviliza el plomo óseo a la corteza cerebral, desencadenando encefalopatía catastrófica y herniación. BAL DEBE administrarse 4 horas antes que EDTA.',
    });
    actions.push({
      priority: 'stat',
      text: 'HOLD Calcium Disodium EDTA infusion. Administer Dimercaprol (BAL) 4 mg/kg deep IM first; wait 4 hours before starting IV EDTA.',
      textEs: 'DETENGA la infusión de EDTA Cálcico Disódico. Administre Dimercaprol (BAL) 4 mg/kg IM profundo primero; espere 4 horas antes de iniciar EDTA IV.',
    });
  }

  // 2. Specific Adulterant Pathways
  if (adulterant === 'medetomidine') {
    if (flags.has('profoundBradycardia') || (!isNaN(hr) && hr < 45) || flags.has('hypothermiaCore')) {
      if (priority !== 'critical-fatal') priority = 'urgent';
      actions.push({
        priority: 'stat',
        text: 'Hemodynamic Support: Maintain airway and ventilations. For unstable bradycardia (MAP < 65), give Atropine 1 mg IV push (max 3 mg); prepare transcutaneous pacing or Norepinephrine infusion (2-20 mcg/min).',
        textEs: 'Soporte Hemodinámico: Mantener vía aérea y ventilación. Para bradicardia inestable (PAM < 65), administrar Atropina 1 mg IV (máx 3 mg); preparar marcapasos transcutáneo o infusión de Norepinefrina (2-20 mcg/min).',
      });
      actions.push({
        priority: 'high',
        text: 'Active External Rewarming: Forced-air warming blankets and warmed IV crystalloids to target core rectal temperature > 36°C.',
        textEs: 'Recalentamiento Activo Externo: Mantas de aire forzado y cristaloides IV tibios para alcanzar temperatura rectal > 36°C.',
      });
    }
  } else if (adulterant === 'brodifacoum') {
    if (flags.has('spontaneousBleeding') || flags.has('unmeasurableInr') || (!isNaN(inr) && inr > 5.0)) {
      if (priority !== 'critical-fatal') priority = 'urgent';
      actions.push({
        priority: 'stat',
        text: 'Emergent Hemostasis: STAT 4-Factor Prothrombin Complex Concentrate (4F-PCC / Kcentra) 25-50 units/kg IV infusion for active severe bleeding.',
        textEs: 'Hemostasia Emergente: STAT Concentrado de Complejo Protrombínico de 4 Factores (CCP-4 / Kcentra) 25-50 unidades/kg IV para hemorragia activa grave.',
      });
      actions.push({
        priority: 'high',
        text: 'Antidote Maintenance: High-dose oral Phytonadione 50-100 mg PO daily divided TID-QID with high-fat meals. Brodifacoum half-life is 20-60+ days; therapy required for 3-6+ months.',
        textEs: 'Mantenimiento del Antídoto: Fitonadiona oral en dosis altas 50-100 mg VO diario dividido TID-QID con comidas grasas. Vida media de brodifacoum es 20-60+ días; terapia requerida por 3-6+ meses.',
      });
    }
  } else if (adulterant === 'lead') {
    if (flags.has('leadEncephalopathy') || (!isNaN(bll) && bll >= 70)) {
      if (priority !== 'critical-fatal') priority = 'urgent';
      actions.push({
        priority: 'stat',
        text: 'Severe Plumbism Dual Chelation: Administer Dimercaprol (BAL) 4 mg/kg deep IM q4h. After 4 hours, start Calcium Disodium EDTA 1000-1500 mg/m2/day continuous IV infusion x 5 days.',
        textEs: 'Quelación Doble para Plumbismo Severo: Administrar Dimercaprol (BAL) 4 mg/kg IM profundo c/4h. A las 4 horas, iniciar infusión continua de EDTA Cálcico Disódico 1000-1500 mg/m2/día IV x 5 días.',
      });
    } else if (flags.has('bilateralWristDrop') || flags.has('basophilicStipplingColic') || (!isNaN(bll) && bll >= 45)) {
      if (priority !== 'critical-fatal') priority = 'high';
      actions.push({
        priority: 'high',
        text: 'Moderate Plumbism Chelation: Oral Succimer (DMSA) 10 mg/kg PO TID for 5 days, then 10 mg/kg PO BID for 14 days (19-day total course). Notify Regional Poison Center.',
        textEs: 'Quelación para Plumbismo Moderado: Succímero oral (DMSA) 10 mg/kg VO TID por 5 días, luego 10 mg/kg VO BID por 14 días (curso total de 19 días). Notificar a centro toxicológico.',
      });
    }
  }

  if (actions.length === 0) {
    actions.push({
      priority: 'routine',
      text: 'Routine clinical monitoring, comprehensive adulterant urine screen (GC/MS or LC-MS), and regional poison center notification.',
      textEs: 'Monitoreo clínico de rutina, tamizaje toxicológico completo de adulterantes por espectrometría de masas y notificación a centro de toxicología.',
    });
  }

  return { priority, alerts, actions };
}

export function generateAdulterantSbar(state, lang = 'en') {
  const isEs = lang === 'es';
  const type = ADULTERANT_TYPES[state.adulterantType] || ADULTERANT_TYPES.medetomidine;
  const evalResult = evaluateAdulterantRisk(state);
  const flags = Array.from(state.checkedFlags || []);

  const flagLabels = flags.map((fId) => {
    const f = ADULTERANT_CLINICAL_FLAGS.find((x) => x.id === fId);
    return f ? (isEs ? f.labelEs : f.label) : fId;
  });

  const alertsText = evalResult.alerts
    .map((a) => `• [${isEs ? a.titleEs : a.title}]: ${isEs ? a.bodyEs : a.body}`)
    .join('\n');

  const actionsText = evalResult.actions
    .map((a) => `• [${a.priority.toUpperCase()}]: ${isEs ? a.textEs : a.text}`)
    .join('\n');

  if (isEs) {
    return `[S] SITUACIÓN:
Evaluación de toxicidad por adulterante ilícito / metales pesados de alta gravedad. Agente sospechoso: ${type.nameEs}. Nivel de urgencia: ${evalResult.priority.toUpperCase()}. Monitorización clínica estricta sin almacenamiento de PII.

[B] ANTECEDENTES:
Exposición a ${type.nameEs}.
Características farmacodinámicas / toxicológicas: ${type.selectivityEs}
Banderas de alerta clínica activadas:
${flagLabels.length ? flagLabels.map((l) => `  - ${l}`).join('\n') : '  - Sin banderas de alarma agudas seleccionadas.'}
Frecuencia Cardíaca: ${state.heartRate ? state.heartRate + ' lpm' : 'N/D'} | INR: ${state.inrValue || 'N/D'} | Plumbemia: ${state.bllValue ? state.bllValue + ' ug/dL' : 'N/D'}.

[A] EVALUACIÓN TOXICOLÓGICA Y CONTRAINDICACIONES:
${alertsText || '• Sin alertas de contraindicación fatal inmediata.'}
ALERTA NEGRA: ${type.blackBoxContraindicationEs}
${type.contraindicationDetailEs}

[R] DIRECTIVAS TERAPÉUTICAS Y PLAN DE MANEJO:
${actionsText}
Manejo de Primera Línea: ${type.managementEs}
Contacto: Centro Regional de Intoxicaciones (1-800-222-1222).`;
  }

  return `[S] SITUATION:
Patient evaluation for high-acuity illicit drug adulterant / heavy metal poisoning. Suspected agent: ${type.name}. Triage acuity: ${evalResult.priority.toUpperCase()}. Zero persistent PII retained in RAM.

[B] BACKGROUND:
Exposure to ${type.name}.
Toxicological profile: ${type.selectivity}
Active clinical flags and diagnostic triggers:
${flagLabels.length ? flagLabels.map((l) => `  - ${l}`).join('\n') : '  - No acute emergency flags selected.'}
Heart Rate: ${state.heartRate ? state.heartRate + ' bpm' : 'N/A'} | INR: ${state.inrValue || 'N/A'} | Blood Lead Level (BLL): ${state.bllValue ? state.bllValue + ' ug/dL' : 'N/A'}.

[A] CLINICAL TOXICOLOGY ASSESSMENT & BLACK-BOX CONTRAINDICATIONS:
${alertsText || '• No immediate black-box contraindications triggered.'}
BLACK-BOX WARNING: ${type.blackBoxContraindication}
${type.contraindicationDetail}

[R] RECOMMENDED RESUSCITATION & MANAGEMENT DIRECTIVES:
${actionsText}
First-Line Management: ${type.management}
Emergency Consultation: Regional Poison Center (1-800-222-1222).`;
}

// In-RAM Ephemeral State Controller
const createInitialState = () => ({
  adulterantType: 'medetomidine',
  checkedFlags: new Set(),
  heartRate: '',
  inrValue: '',
  bllValue: '',
  atipamezolePlanned: false,
  rapidVitKPlanned: false,
  edtaAlonePlanned: false,
});

let adulterantState = createInitialState();
const listeners = new Set();

export function getAdulterantState() {
  return {
    ...adulterantState,
    checkedFlags: new Set(adulterantState.checkedFlags),
  };
}

export function updateAdulterantState(patch) {
  adulterantState = {
    ...adulterantState,
    ...patch,
    checkedFlags: patch.checkedFlags ? new Set(patch.checkedFlags) : adulterantState.checkedFlags,
  };
  listeners.forEach((fn) => fn(getAdulterantState()));
}

export function resetAdulterantState() {
  adulterantState = createInitialState();
  listeners.forEach((fn) => fn(getAdulterantState()));
}

export function subscribeAdulterantState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Accessible DOM View
export function adulterantHeavyMetalsView() {
  const container = h('div', { class: 'adulterant-view specialized-clinical-view' });

  function render() {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const state = getAdulterantState();
    const lang = getLang();
    const isEs = lang === 'es';
    const type = ADULTERANT_TYPES[state.adulterantType] || ADULTERANT_TYPES.medetomidine;
    const evalResult = evaluateAdulterantRisk(state);

    // Header
    const header = h('header', { class: 'tool-header' }, [
      h('h1', { id: 'page-title' }, [
        t('tools.item.adulterant-heavy-metals.title', 'Illicit Drug Adulterants, Heavy Metals & Alpha-2 Agonist Triage'),
      ]),
      h('p', { class: 'tool-desc' }, [
        t(
          'tools.item.adulterant-heavy-metals.description',
          'Clinical triage for Medetomidine refractory bradycardia (atipamezole prohibition), Brodifacoum superwarfarin coagulopathy (4F-PCC and oral Vitamin K bridge), and street drug Lead plumbism chelation sequencing.',
        ),
      ]),
    ]);

    // Lethal Pitfall Warning Banner
    const warningBanner = h('div', { class: 'movement-blackbox-banner' }, [
      h('div', { class: 'movement-banner-header' }, [
        h('strong', {}, isEs ? 'ALERTA NEGRA TOXICOLÓGICA: ' + type.blackBoxContraindicationEs : 'BLACK-BOX TOXICOLOGY ALERT: ' + type.blackBoxContraindication),
      ]),
      h('p', {}, isEs ? type.contraindicationDetailEs : type.contraindicationDetail),
    ]);

    // Grid Layout
    const grid = h('div', { class: 'nsti-grid' });

    // Left Column
    const leftCol = h('div', { class: 'nsti-col' });

    // Adulterant Select Card
    const typeCard = h('div', { class: 'nsti-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? '1. Adulterante o Contaminante Sospechoso' : '1. Suspected Adulterant or Contaminant'),
      h(
        'select',
        {
          class: 'nsti-select',
          'aria-label': isEs ? 'Seleccionar tipo de adulterante' : 'Select adulterant type',
          onchange: (e) => updateAdulterantState({ adulterantType: e.target.value }),
        },
        Object.values(ADULTERANT_TYPES).map((item) =>
          h('option', { value: item.id, selected: item.id === state.adulterantType }, isEs ? item.nameEs : item.name),
        ),
      ),
      h('div', { class: 'nsti-stage-info' }, [
        h('strong', {}, isEs ? 'Perfil Toxicológico: ' : 'Toxicological Profile: '),
        h('span', {}, isEs ? type.selectivityEs : type.selectivity),
      ]),
    ]);

    // Vitals & Lab Card
    const vitalsCard = h('div', { class: 'nsti-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? '2. Signos Vitales y Laboratorio Clave' : '2. Key Vitals & Diagnostic Values'),
      h('div', { class: 'decon-input-group' }, [
        h('label', { for: 'hr-input' }, isEs ? 'Frecuencia Cardíaca (lpm - Alerta si < 45):' : 'Heart Rate (bpm - Alert if < 45):'),
        h('input', {
          id: 'hr-input',
          type: 'number',
          class: 'nsti-num-input',
          placeholder: 'e.g. 34',
          value: state.heartRate,
          oninput: (e) => updateAdulterantState({ heartRate: e.target.value }),
        }),
      ]),
      h('div', { class: 'decon-input-group' }, [
        h('label', { for: 'inr-input' }, isEs ? 'INR (Coagulopatía por Brodifacoum - Alerta si > 5.0 o incalculable):' : 'INR (Brodifacoum Coagulopathy - Alert if > 5.0 or > 10.0):'),
        h('input', {
          id: 'inr-input',
          type: 'number',
          step: '0.1',
          class: 'nsti-num-input',
          placeholder: 'e.g. 10.5',
          value: state.inrValue,
          oninput: (e) => updateAdulterantState({ inrValue: e.target.value }),
        }),
      ]),
      h('div', { class: 'decon-input-group' }, [
        h('label', { for: 'bll-input' }, isEs ? 'Plumbemia BLL (ug/dL - Alerta si >= 45 o >= 70):' : 'Blood Lead Level BLL (ug/dL - Alert if >= 45 or >= 70):'),
        h('input', {
          id: 'bll-input',
          type: 'number',
          class: 'nsti-num-input',
          placeholder: 'e.g. 78',
          value: state.bllValue,
          oninput: (e) => updateAdulterantState({ bllValue: e.target.value }),
        }),
      ]),
    ]);

    // Clinical Flags Card
    const flagsCard = h('div', { class: 'nsti-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? '3. Banderas de Riesgo Clínico' : '3. Clinical Risk Flags'),
      h(
        'div',
        { class: 'decon-checkbox-group' },
        ADULTERANT_CLINICAL_FLAGS.map((f) => {
          const checked = state.checkedFlags.has(f.id);
          return h(
            'label',
            { class: `disaster-check-row ${f.fatal ? 'emergency-row' : ''}` },
            [
              h('input', {
                type: 'checkbox',
                checked,
                onchange: (e) => {
                  const set = new Set(state.checkedFlags);
                  if (e.target.checked) set.add(f.id);
                  else set.delete(f.id);
                  updateAdulterantState({ checkedFlags: set });
                },
              }),
              h('span', { class: 'disaster-check-label' }, isEs ? f.labelEs : f.label),
            ],
          );
        }),
      ),
    ]);

    leftCol.appendChild(typeCard);
    leftCol.appendChild(vitalsCard);
    leftCol.appendChild(flagsCard);

    // Right Column
    const rightCol = h('div', { class: 'nsti-col' });

    // Directives Card
    const directivesCard = h('div', { class: 'nsti-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? '4. Directivas de Resucitación y Quelación' : '4. Resuscitation & Chelation Directives'),
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
        h('strong', {}, isEs ? 'Manejo de Primera Línea: ' : 'First-Line Management Protocol: '),
        h('p', { class: 'decon-directive-text' }, isEs ? type.managementEs : type.management),
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
    ]);

    // SBAR Handoff Card
    const sbarText = generateAdulterantSbar(state, lang);
    const sbarCard = h('div', { class: 'nsti-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? '5. Nota SBAR de Transferencia Toxicológica (Cero PII)' : '5. Zero-PII SBAR Toxicology Handoff Note'),
      h('textarea', {
        class: 'nsti-sbar-textarea',
        rows: '14',
        readonly: true,
        'aria-label': isEs ? 'Nota clínica SBAR generada' : 'Generated SBAR clinical handoff note',
        value: sbarText,
      }),
      h('div', { class: 'nsti-btn-row' }, [
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-primary',
            onclick: () => {
              if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(sbarText);
              }
            },
          },
          isEs ? 'Copiar Nota SBAR' : 'Copy SBAR Note',
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-secondary',
            onclick: () => resetAdulterantState(),
          },
          isEs ? 'Reiniciar Formulario' : 'Reset Form',
        ),
      ]),
    ]);

    rightCol.appendChild(directivesCard);
    rightCol.appendChild(sbarCard);

    grid.appendChild(leftCol);
    grid.appendChild(rightCol);

    container.appendChild(header);
    container.appendChild(warningBanner);
    container.appendChild(grid);
  }

  const unsubscribe = subscribeAdulterantState(() => render());
  render();
  container._cleanup = unsubscribe;
  return container;
}
