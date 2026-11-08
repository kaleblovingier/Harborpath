// public/js/views/inhalantToxicology.js
// Wave 65: Inhalant, Volatile Hydrocarbon & Nitrous Oxide Neuropathy / Toxicology Navigator
// ACMT, AACT, and EAPCCT Clinical Consensus Standards.
// Ephemeral in-RAM state, zero persistent storage, zero PII, WCAG 2.1 AA compliant.

import { h } from '../dom.js';
import { t, getLang } from '../i18n.js';

export const INHALANT_SUBSTANCES = Object.freeze({
  n2o: {
    id: 'n2o',
    name: 'Nitrous Oxide (N2O / Whippets / Galaxy Gas 640g)',
    nameEs: 'Óxido Nitroso (N2O / Cartuchos / Cilindros Galaxy Gas 640g)',
    category: 'gas',
    mechanism: 'Irreversible oxidation of cobalt core of active Vitamin B12 (cob[I]alamin to cob[III]alamin), inactivating methionine synthase and depleting S-adenosylmethionine (SAMe).',
    mechanismEs: 'Oxidación irreversible del núcleo de cobalto de la vitamina B12 activa (cob[I]alamina a cob[III]alamina), inactivando la metionina sintasa y agotando la S-adenosilmetionina (SAMe).',
    fatalPitfall: 'ADMINISTRATION OF FOLIC ACID BEFORE PARENTERAL B12 (FOLATE TRAP)',
    fatalPitfallEs: 'ADMINISTRACIÓN DE ÁCIDO FÓLICO ANTES DE B12 PARENTERAL (TRAMPA DE FOLATO)',
    contraindicationText: 'Strictly prohibit folic acid before or without high-dose parenteral B12; bypassing the folate trap restores RBC synthesis while accelerating irreversible subacute combined degeneration of the spinal cord.',
    contraindicationTextEs: 'Estrictamente prohibido el ácido fólico antes o sin B12 parenteral en dosis altas; eludir la trampa de folato restaura la síntesis de glóbulos rojos pero acelera la degeneración combinada subaguda irreversible de la médula espinal.',
    antidote: 'Hydroxocobalamin 1,000 mcg IM daily for 14 days, then weekly until neurologic plateau. Prohibit oral B12 as primary therapy in acute SCD.',
    antidoteEs: 'Hidroxocobalamina 1,000 mcg IM diario por 14 días, luego semanal hasta meseta neurológica. Prohibida B12 oral como terapia primaria en degeneración subaguda aguda.',
  },
  difluoroethane: {
    id: 'difluoroethane',
    name: '1,1-Difluoroethane (Air Duster / Keyboard Cleaner)',
    nameEs: '1,1-Difluoroetano (Aerosol de aire comprimido / Limpiador de teclados)',
    category: 'hydrocarbon',
    mechanism: 'Halogenated hydrocarbon dissolves into myocardial lipid bilayers, altering membrane conductance and sensitizing the myocardium to endogenous catecholamines.',
    mechanismEs: 'El hidrocarburo halogenado se disuelve en las bicapas lipídicas del miocardio, alterando la conductancia y sensibilizando el miocardio a catecolaminas endógenas.',
    fatalPitfall: 'EPINEPHRINE / CATECHOLAMINES IN RESUSCITATION (SSDS)',
    fatalPitfallEs: 'EPINEFRINA / CATECOLAMINAS EN RESUCITACIÓN (MUERTE SÚBITA POR INHALACIÓN)',
    contraindicationText: 'Epinephrine, norepinephrine, and isoproterenol are STRICTLY CONTRAINDICATED in Sudden Sniffing Death Syndrome (SSDS); exogenous adrenergic stimulation instantly triggers or refractorizes lethal ventricular fibrillation.',
    contraindicationTextEs: 'Epinefrina, norepinefrina e isoproterenol están ESTRICTAMENTE CONTRAINDICADOS en el Síndrome de Muerte Súbita por Inhalación; la estimulación adrenérgica exógena desencadena inmediatamente fibrilación ventricular refractaria.',
    antidote: 'Defibrillation + Cardioselective Beta-Blockers (IV Esmolol 500 mcg/kg load over 1 min, then 50-200 mcg/kg/min; or IV Propranolol 1 mg slow push q2-5min up to 5 mg).',
    antidoteEs: 'Desfibrilación + Betabloqueadores cardioselectivos (IV Esmolol carga de 500 mcg/kg en 1 min, luego 50-200 mcg/kg/min; o IV Propranolol 1 mg lento c/2-5min hasta 5 mg).',
  },
  toluene: {
    id: 'toluene',
    name: 'Toluene (Paint Thinners / Model Glue / Solvent Binders)',
    nameEs: 'Tolueno (Disolventes de pintura / Pegamentos / Solventes)',
    category: 'solvent',
    mechanism: 'Metabolized to benzoic and hippuric acid. Excessive distal hippurate anion excretion and direct alpha-intercalated cell cytotoxicity cripple distal H+-ATPase pumps, causing Type 1 distal RTA.',
    mechanismEs: 'Metabolizado a ácido benzoico e hipúrico. La excreción excesiva de hipurato y la citotoxicidad sobre células intercaladas alfa anulan la bomba H+-ATPasa, causando ATR distal Tipo 1.',
    fatalPitfall: 'SODIUM BICARBONATE BEFORE POTASSIUM REPLETION',
    fatalPitfallEs: 'BICARBONATO DE SODIO ANTES DE REPONER POTASIO',
    contraindicationText: 'Infusing sodium bicarbonate before correcting hypokalemia forces extracellular potassium intracellularly via H+/K+ antiporters, triggering fatal cardiac arrest or total diaphragmatic paralysis.',
    contraindicationTextEs: 'Infundir bicarbonato de sodio antes de corregir la hipopotasemia fuerza el potasio al espacio intracelular, precipitando paro cardíaco fatal o parálisis diafragmática total.',
    antidote: 'STAT central line IV KCl at 20-40 mEq/hr + oral KCl under continuous ECG monitoring. Only infuse IV Sodium Bicarbonate after serum K+ reaches >= 3.5 mEq/L.',
    antidoteEs: 'KCl IV por vía central a 20-40 mEq/h + KCl oral bajo monitorización ECG continua. Solo infundir bicarbonato de sodio IV tras alcanzar K+ sérico >= 3.5 mEq/L.',
  },
});

export const INHALANT_CLINICAL_FLAGS = Object.freeze([
  { id: 'sensoryAtaxia', label: 'Sensory ataxia, positive Romberg, loss of vibration / proprioception', labelEs: 'Ataxia sensitiva, signo de Romberg positivo, pérdida de vibración y propiocepción', severe: true, group: 'n2o' },
  { id: 'invertedLhermitte', label: 'Inverted Lhermitte sign (electric shock shooting down spine/limbs on neck flexion)', labelEs: 'Signo de Lhermitte invertido (descarga eléctrica por columna/extremidades al flexionar cuello)', severe: true, group: 'n2o' },
  { id: 'gloveStockingNumb', label: 'Symmetric glove-and-stocking paresthesias and distal limb numbness', labelEs: 'Parestesias simétricas en guante y calcetín y entumecimiento distal', severe: false, group: 'n2o' },
  { id: 'vteRisk', label: 'Unilateral calf swelling or acute chest pain (high risk DVT/PE from homocysteine > 50 umol/L)', labelEs: 'Hinchazón unilateral de pantorrilla o dolor torácico agudo (alto riesgo TVP/TEP por homocisteína > 50)', severe: true, group: 'n2o' },
  { id: 'folatePrescribed', label: 'Provider considering oral/IV folic acid prior to completion of 14-day B12 saturation', labelEs: 'Médico considerando ácido fólico antes de completar 14 días de saturación con B12', severe: true, fatal: true, group: 'n2o' },
  { id: 'ventricularDysrhythmia', label: 'Post-inhalant polymorphic VT, VF, or sudden cardiac collapse following excitement/fright (SSDS)', labelEs: 'TV polimórfica, FV o colapso cardíaco súbito tras sobresalto/ejercicio post-inhalación (SSDS)', severe: true, fatal: true, group: 'hydrocarbon' },
  { id: 'epinephrineConsidered', label: 'Standard ACLS epinephrine or adrenergic vasopressor considered for hydrocarbon arrest', labelEs: 'Epinefrina estándar de ACLS o vasopresor adrenérgico considerado para paro por hidrocarburos', severe: true, fatal: true, group: 'hydrocarbon' },
  { id: 'quadriparesis', label: 'Ascending flaccid weakness / quadriparesis with preserved cognition (K+ < 2.0 mEq/L)', labelEs: 'Debilidad flácida ascendente / cuadriparesia con lucidez mental (K+ < 2.0 mEq/L)', severe: true, group: 'solvent' },
  { id: 'hyperchloremicAcidosis', label: 'Severe normal anion gap acidosis (pH < 7.20, Cl- > 115, HCO3- < 10, Urine pH > 5.5)', labelEs: 'Acidosis severa con anión gap normal (pH < 7.20, Cl- > 115, HCO3- < 10, pH urinario > 5.5)', severe: true, group: 'solvent' },
  { id: 'bicarbonateFirst', label: 'Team preparing sodium bicarbonate infusion while serum potassium remains < 3.5 mEq/L', labelEs: 'Equipo preparando infusión de bicarbonato mientras el potasio sérico sigue < 3.5 mEq/L', severe: true, fatal: true, group: 'solvent' },
]);

export function evaluateInhalantRisk(state) {
  const flags = new Set(state.checkedFlags || []);
  const sub = state.substance || 'n2o';
  const kVal = parseFloat(state.serumPotassium);
  const actions = [];
  const alerts = [];
  let priority = 'standard';

  // 1. Check for Absolute Contraindications / Fatal Pitfalls First
  if (flags.has('folatePrescribed') || (sub === 'n2o' && state.folicAcidGiven)) {
    priority = 'critical-fatal';
    alerts.push({
      type: 'fatal-alert',
      title: 'FATAL CONTRAINDICATION: FOLIC ACID PROHIBITION',
      titleEs: 'CONTRAINDICACIÓN FATAL: PROHIBICIÓN DE ÁCIDO FÓLICO',
      body: 'Do NOT administer folic acid before or without 14 days of parenteral B12. Bypassing the folate trap corrects anemia but precipitates explosive, permanent Subacute Combined Degeneration of the spinal cord.',
      bodyEs: 'NO administre ácido fólico antes o sin 14 días de B12 parenteral. Eludir la trampa de folato corrige la anemia pero desencadena degeneración combinada subaguda permanente de la médula espinal.',
    });
    actions.push({
      priority: 'urgent',
      text: 'CANCEL all folic acid orders immediately. Saturate tissue cobalamin with Hydroxocobalamin 1,000 mcg IM STAT.',
      textEs: 'CANCELE todas las órdenes de ácido fólico de inmediato. Sature cobalamina tisular con Hidroxocobalamina 1,000 mcg IM STAT.',
    });
  }

  if (flags.has('epinephrineConsidered') || flags.has('ventricularDysrhythmia')) {
    priority = 'critical-fatal';
    alerts.push({
      type: 'fatal-alert',
      title: 'FATAL RESUSCITATION PITFALL: EPINEPHRINE CONTRAINDICATED (SSDS)',
      titleEs: 'TRAMPA FATAL DE RESUCITACIÓN: EPINEFRINA CONTRAINDICADA (SSDS)',
      body: 'Myocardial sensitization from halogenated hydrocarbons causes lethal VF upon catecholamine exposure. Epinephrine 1 mg IV has near 100% mortality in SSDS. Use defibrillation + IV Esmolol (500 mcg/kg load) or Propranolol.',
      bodyEs: 'La sensibilización miocárdica por hidrocarburos halogenados causa FV letal con catecolaminas. Epinefrina 1 mg IV tiene casi 100% de mortalidad en SSDS. Use desfibrilación + IV Esmolol (carga 500 mcg/kg) o Propranolol.',
    });
    actions.push({
      priority: 'stat',
      text: 'Withhold all epinephrine/norepinephrine/dopamine. Administer IV Esmolol 500 mcg/kg over 1 min, then 50-200 mcg/kg/min for dysrhythmias.',
      textEs: 'Retenga toda epinefrina/norepinefrina/dopamina. Administre IV Esmolol 500 mcg/kg en 1 min, luego 50-200 mcg/kg/min para disritmias.',
    });
  }

  if (flags.has('bicarbonateFirst') || (!isNaN(kVal) && kVal < 3.5 && state.bicarbonatePlanned)) {
    priority = 'critical-fatal';
    alerts.push({
      type: 'fatal-alert',
      title: 'FATAL ORDER OF OPERATIONS: REPLETE POTASSIUM BEFORE BICARBONATE',
      titleEs: 'ORDEN FATAL DE OPERACIONES: REPONER POTASIO ANTES DE BICARBONATO',
      body: 'Bicarbonate infusion shifts potassium into cells, turning severe hypokalemia into fatal asystole or respiratory arrest. Serum potassium MUST reach >= 3.5 mEq/L before sodium bicarbonate is started.',
      bodyEs: 'La infusión de bicarbonato desplaza potasio al interior celular, convirtiendo hipopotasemia severa en asistolia fatal o paro respiratorio. El potasio DEBE alcanzar >= 3.5 mEq/L antes de iniciar bicarbonato.',
    });
    actions.push({
      priority: 'stat',
      text: 'STOP sodium bicarbonate infusion immediately. Place central line and infuse IV KCl at 20-40 mEq/hr under continuous telemetry.',
      textEs: 'DETENGA infusión de bicarbonato inmediatamente. Coloque vía central e infunda KCl IV a 20-40 mEq/h con telemetría continua.',
    });
  }

  // 2. Specific Substance Protocols
  if (sub === 'n2o') {
    if (flags.has('sensoryAtaxia') || flags.has('invertedLhermitte') || flags.has('gloveStockingNumb')) {
      if (priority !== 'critical-fatal') priority = 'urgent';
      actions.push({
        priority: 'high',
        text: 'Initiate Hydroxocobalamin 1,000 mcg IM daily for 14 consecutive days. Do NOT rely on normal serum B12 (false-negative in >30% due to inactive cob[III]alamin).',
        textEs: 'Iniciar Hidroxocobalamina 1,000 mcg IM diario por 14 días consecutivos. NO confiar en B12 sérica normal (falso negativo en >30% por cob[III]alamina inactiva).',
      });
      actions.push({
        priority: 'high',
        text: 'STAT Labs: Total Homocysteine and Methylmalonic Acid (MMA). Order contrast-free Cervical/Thoracic MRI to evaluate inverted V-sign.',
        textEs: 'Laboratorios STAT: Homocisteína total y Ácido Metilmalónico (MMA). Solicitar RM cervical/torácica sin contraste para evaluar signo de V invertida.',
      });
    }
    if (flags.has('vteRisk')) {
      actions.push({
        priority: 'urgent',
        text: 'Hyperhomocysteinemia thrombophilia workup: STAT D-Dimer, bilateral lower extremity venous duplex ultrasound, and chest CT-PE if dyspneic.',
        textEs: 'Estudio de trombofilia por hiperhomocisteinemia: D-Dímero STAT, ecografía dúplex venosa bilateral y angio-TC de tórax si hay disnea.',
      });
    }
  } else if (sub === 'toluene') {
    if (flags.has('quadriparesis') || (!isNaN(kVal) && kVal < 2.5) || flags.has('hyperchloremicAcidosis')) {
      if (priority !== 'critical-fatal') priority = 'urgent';
      actions.push({
        priority: 'stat',
        text: 'Distal RTA (Type 1) Quadriparesis Emergency: Central venous catheter placement for aggressive IV KCl (20-40 mEq/hr) + oral KCl 40 mEq q2-4h.',
        textEs: 'Emergencia de cuadriparesia por ATR distal (Tipo 1): Vía venosa central para KCl IV agresivo (20-40 mEq/h) + KCl oral 40 mEq c/2-4h.',
      });
      actions.push({
        priority: 'high',
        text: 'Check and aggressively replate concurrent hypophosphatemia and hypomagnesemia. Continuous cardiac rhythm monitoring for malignant U-waves and Torsades.',
        textEs: 'Verificar y reponer agresivamente hipofosfatemia e hipomagnesemia concurrentes. Monitorización continua de ritmo por ondas U malignas y Torsades.',
      });
    }
  }

  if (actions.length === 0) {
    actions.push({
      priority: 'routine',
      text: 'Supportive monitoring, assess for exposure cessation, evaluate mental health, and provide harm reduction counseling.',
      textEs: 'Monitoreo de soporte, evaluar cese de exposición, salud mental y consejería de reducción de daños.',
    });
  }

  return { priority, alerts, actions };
}

export function generateInhalantSbar(state, lang = 'en') {
  const isEs = lang === 'es';
  const sub = INHALANT_SUBSTANCES[state.substance] || INHALANT_SUBSTANCES.n2o;
  const evalResult = evaluateInhalantRisk(state);
  const flags = Array.from(state.checkedFlags || []);

  const flagLabels = flags.map((fId) => {
    const f = INHALANT_CLINICAL_FLAGS.find((x) => x.id === fId);
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
Paciente evaluado por toxicidad severa por inhalantes / solventes volátiles. Agente implicado: ${sub.nameEs}. Nivel de urgencia: ${evalResult.priority.toUpperCase()}. Estado neurológico y respiratorio bajo monitoreo estricto sin PII almacenada.

[B] ANTECEDENTES:
Exposición a ${sub.nameEs}. Mecanismo toxicológico: ${sub.mechanismEs}.
Hallazgos clínicos y alertas activadas:
${flagLabels.length ? flagLabels.map((l) => `  - ${l}`).join('\n') : '  - Sin banderas de alarma agudas seleccionadas.'}
Potasio sérico: ${state.serumPotassium ? state.serumPotassium + ' mEq/L' : 'No registrado'}.

[A] EVALUACIÓN TOXICOLÓGICA Y CONTRAINDICACIONES:
${alertsText || '• No se detectaron contraindicaciones letales inmediatas.'}
${sub.fatalPitfallEs}: ${sub.contraindicationTextEs}

[R] RECOMENDACIONES CLÍNICAS Y PLAN DE ACCIÓN:
${actionsText}
Antídoto / Manejo de primera línea: ${sub.antidoteEs}
Consulte a toxicología médica / centro de intoxicaciones regional (1-800-222-1222).`;
  }

  return `[S] SITUATION:
Patient evaluated for high-acuity volatile inhalant / solvent neurotoxicology. Implicated agent: ${sub.name}. Triage acuity: ${evalResult.priority.toUpperCase()}. Zero persistent PII retained in RAM.

[B] BACKGROUND:
Exposure to ${sub.name}. Toxicological mechanism: ${sub.mechanism}.
Active clinical signs and trigger flags:
${flagLabels.length ? flagLabels.map((l) => `  - ${l}`).join('\n') : '  - No acute emergency flags selected.'}
Serum Potassium: ${state.serumPotassium ? state.serumPotassium + ' mEq/L' : 'Not recorded'}.

[A] TOXICOLOGICAL ASSESSMENT & BLACK-BOX CONTRAINDICATIONS:
${alertsText || '• No immediate lethal contraindications triggered.'}
${sub.fatalPitfall}: ${sub.contraindicationText}

[R] DIRECTIVES & FIRST-LINE INTERVENTIONS:
${actionsText}
First-Line Antidote / Resuscitation: ${sub.antidote}
Consult Medical Toxicology / Regional Poison Center (1-800-222-1222).`;
}

// In-RAM Ephemeral State Controller
const createInitialState = () => ({
  substance: 'n2o',
  checkedFlags: new Set(),
  serumPotassium: '',
  folicAcidGiven: false,
  bicarbonatePlanned: false,
});

let inhalantState = createInitialState();
const listeners = new Set();

export function getInhalantState() {
  return {
    ...inhalantState,
    checkedFlags: new Set(inhalantState.checkedFlags),
  };
}

export function updateInhalantState(patch) {
  inhalantState = {
    ...inhalantState,
    ...patch,
    checkedFlags: patch.checkedFlags ? new Set(patch.checkedFlags) : inhalantState.checkedFlags,
  };
  listeners.forEach((fn) => fn(getInhalantState()));
}

export function resetInhalantState() {
  inhalantState = createInitialState();
  listeners.forEach((fn) => fn(getInhalantState()));
}

export function subscribeInhalantState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Accessible DOM View
export function inhalantToxicologyView() {
  const container = h('div', { class: 'inhalant-view specialized-clinical-view' });

  function render() {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const state = getInhalantState();
    const lang = getLang();
    const isEs = lang === 'es';
    const sub = INHALANT_SUBSTANCES[state.substance] || INHALANT_SUBSTANCES.n2o;
    const evalResult = evaluateInhalantRisk(state);

    // Header
    const header = h('header', { class: 'tool-header' }, [
      h('h1', { id: 'page-title' }, [
        t('tools.item.inhalant-toxicology.title', 'Inhalant, Volatile Solvent & Nitrous Oxide Neuropathy Navigator'),
      ]),
      h('p', { class: 'tool-desc' }, [
        t(
          'tools.item.inhalant-toxicology.description',
          'ACMT consensus protocols for Nitrous Oxide (Galaxy Gas) SCD and folate trap prohibition, volatile hydrocarbon sudden sniffing death syndrome (epinephrine prohibition), and toluene Type 1 distal RTA hypokalemic quadriparesis.',
        ),
      ]),
    ]);

    // Lethal Pitfall Warning Banner
    const warningBanner = h('div', { class: 'movement-blackbox-banner' }, [
      h('div', { class: 'movement-banner-header' }, [
        h('strong', {}, isEs ? 'ALERTA NEGRA TOXICOLÓGICA: ' + sub.fatalPitfallEs : 'BLACK-BOX TOXICOLOGY ALERT: ' + sub.fatalPitfall),
      ]),
      h('p', {}, isEs ? sub.contraindicationTextEs : sub.contraindicationText),
    ]);

    // Grid Layout
    const grid = h('div', { class: 'nsti-grid' });

    // Left Column: Inputs & Flags
    const leftCol = h('div', { class: 'nsti-col' });

    // Substance Select Card
    const subCard = h('div', { class: 'nsti-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? '1. Agente Inhalante Implicado' : '1. Implicated Inhalant / Solvent'),
      h(
        'select',
        {
          class: 'nsti-select',
          'aria-label': isEs ? 'Seleccionar sustancia inhalada' : 'Select inhaled substance',
          onchange: (e) => updateInhalantState({ substance: e.target.value }),
        },
        Object.values(INHALANT_SUBSTANCES).map((item) =>
          h('option', { value: item.id, selected: item.id === state.substance }, isEs ? item.nameEs : item.name),
        ),
      ),
      h('div', { class: 'nsti-stage-info' }, [
        h('strong', {}, isEs ? 'Mecanismo Bioquímico: ' : 'Biochemical Mechanism: '),
        h('span', {}, isEs ? sub.mechanismEs : sub.mechanism),
      ]),
    ]);

    // Lab Inputs Card
    const labCard = h('div', { class: 'nsti-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? '2. Parámetros de Laboratorio y Pruebas POC' : '2. Point-of-Care & Lab Values'),
      h('div', { class: 'decon-input-group' }, [
        h('label', { for: 'potassium-input' }, isEs ? 'Potasio Sérico (mEq/L - Alerta si < 3.5 o < 2.0):' : 'Serum Potassium (mEq/L - Alert if < 3.5 or < 2.0):'),
        h('input', {
          id: 'potassium-input',
          type: 'number',
          step: '0.1',
          class: 'nsti-num-input',
          placeholder: 'e.g. 1.8',
          value: state.serumPotassium,
          oninput: (e) => updateInhalantState({ serumPotassium: e.target.value }),
        }),
      ]),
    ]);

    // Clinical Flags Card
    const flagsCard = h('div', { class: 'nsti-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? '3. Evaluación de Síntomas y Riesgos' : '3. Clinical Flags & Risk Assessment'),
      h(
        'div',
        { class: 'decon-checkbox-group' },
        INHALANT_CLINICAL_FLAGS.map((f) => {
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
                  updateInhalantState({ checkedFlags: set });
                },
              }),
              h('span', { class: 'disaster-check-label' }, isEs ? f.labelEs : f.label),
            ],
          );
        }),
      ),
    ]);

    leftCol.appendChild(subCard);
    leftCol.appendChild(labCard);
    leftCol.appendChild(flagsCard);

    // Right Column: Directives & SBAR Note
    const rightCol = h('div', { class: 'nsti-col' });

    // Triage Directives Card
    const directivesCard = h('div', { class: 'nsti-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? '4. Protocolos y Directivas de Manejo' : '4. Triage & Resuscitation Directives'),
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
        h('strong', {}, isEs ? 'Tratamiento de Primera Línea: ' : 'First-Line Antidote / Resuscitation: '),
        h('p', { class: 'decon-directive-text' }, isEs ? sub.antidoteEs : sub.antidote),
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

    // Zero-PII SBAR Handoff Card
    const sbarText = generateInhalantSbar(state, lang);
    const sbarCard = h('div', { class: 'nsti-card' }, [
      h('h2', { class: 'nsti-card-title' }, isEs ? '5. Nota de Transferencia Clínica SBAR (Cero PII)' : '5. Zero-PII SBAR Clinical Handoff Note'),
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
            onclick: () => resetInhalantState(),
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

  const unsubscribe = subscribeInhalantState(() => render());
  render();
  container._cleanup = unsubscribe;
  return container;
}
