// public/js/views/woodenChestRigidity.js
// Wave 66: Synthetic Opioid Chest Wall Rigidity ("Wooden Chest") & Rapid Airway Rescue Protocol
// ASA, ACEP, and SAMHSA Emergency Overdose Guidelines.
// Ephemeral in-RAM state, zero persistent storage, zero PII, WCAG 2.1 AA compliant.

import { h, clear, icon, copyText } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

export const WOODEN_CHEST_EXPOSURES = Object.freeze({
  fentanyl_rapid_iv: {
    id: 'fentanyl_rapid_iv',
    name: 'Rapid IV Fentanyl Push (Fentanyl-Induced Muscle Rigidity / FIMR)',
    nameEs: 'Inyección IV Rápida de Fentanilo (Rigidez Muscular Inducida por Fentanilo)',
    onset: 'Immediate (within 10-90 seconds of intravenous administration)',
    onsetEs: 'Inmediato (entre 10 y 90 segundos tras administración intravenosa)',
    mechanism: 'Central stimulation of mu-opioid receptors in the striatum and substantia nigra, leading to abrupt GABA-ergic and dopaminergic motor uncoupling. Triggers severe tonic contraction of thoracic cage intercostal muscles, abdominal rectus wall, and glottic vocal cord adduction.',
    mechanismEs: 'Estimulación central de receptores mu-opioides en cuerpo estriado y sustancia negra, causando desacoplamiento motor GABAérgico y dopaminérgico. Desencadena contracción tónica severa de intercostales torácicos, pared abdominal y aducción glótica.',
    bvmPresentation: 'Rock-hard chest wall; impossible to depress bag-valve-mask (peak inspiratory pressure > 50 cmH2O); zero bilateral chest rise; rapid profound arterial desaturation and bradycardia.',
    bvmPresentationEs: 'Tórax leñoso pétreo; imposible comprimir la bolsa-válvula-mascarilla (presión pico > 50 cmH2O); nula expansión torácica bilateral; desaturación arterial y bradicardia fulminantes.',
    blackBoxWarning: 'SUCCINYLCHOLINE HYPERKALEMIA HAZARD IN CRITICAL DOWNTIME',
    blackBoxWarningEs: 'PELIGRO DE HIPERPOTASEMIA POR SUCCINILCOLINA TRAS PARO PROLONGADO',
    blackBoxDetail: 'Succinylcholine (depolarizing paralytic) is relatively contraindicated in patients with unknown downtime, severe acidemia, or crush/rhabdomyolysis due to massive potassium release and fatal cardiac arrest. Use non-depolarizing Rocuronium (1.2 mg/kg) or Vecuronium (0.1 mg/kg).',
    blackBoxDetailEs: 'La succinilcolina está contraindicada si el tiempo de paro es desconocido, hay acidosis severa o rabdomiólisis, por riesgo de hiperpotasemia fatal. Use agentes no despolarizantes como Rocuronio (1.2 mg/kg) o Vecuronio (0.1 mg/kg).',
  },
  synthetic_analog_carfentanil: {
    id: 'synthetic_analog_carfentanil',
    name: 'High-Potency Synthetic Analogs (Carfentanil, Sufentanil, Furanylfentanyl)',
    nameEs: 'Análogos Sintéticos de Alta Potencia (Carfentanilo, Sufentanilo, Furanilfentanilo)',
    onset: 'Instantaneous; binds with extreme affinity (Carfentanil is 10,000x morphine potency)',
    onsetEs: 'Instantáneo; unión con afinidad extrema (Carfentanilo posee 10,000 veces la potencia de morfina)',
    mechanism: 'Massive receptor occupancy with protracted lipophilic tissue redistribution. Binds central striatal motor control pathways, producing prolonged woody chest wall rigidity resistant to standard low-dose naloxone.',
    mechanismEs: 'Ocupación masiva de receptores con redistribución lipofílica prolongada. Bloquea vías motoras estriadas causando rigidez leñosa prolongada resistente a dosis estándar bajas de naloxona.',
    bvmPresentation: 'Complete mechanical chest wall lock with severe trismus / masseter spasm and complete vocal cord closure. BVM attempt produces zero ventilation and forces air into stomach.',
    bvmPresentationEs: 'Bloqueo mecánico torácico completo con trismo severo y cierre total de cuerdas vocales. El BVM no ventila y desvía aire al estómago.',
    blackBoxWarning: 'FORCED BVM VENTILATION GASTRIC RUPTURE & ASPIRATION HAZARD',
    blackBoxWarningEs: 'RIESGO DE RUPTURA GÁSTRICA Y ASPIRACIÓN MASIVA POR BVM FORZADO',
    blackBoxDetail: 'Forcefully squeezing a BVM bag against a completely rigid glottis and chest wall exceeds lower esophageal sphincter pressure (> 20 cmH2O), forcing high-pressure gas into the stomach. This precipitates massive gastric distension, regurgitation of acidic stomach contents, pulmonary aspiration, or acute gastric rupture.',
    blackBoxDetailEs: 'Comprimir con fuerza extrema el BVM contra una glotis cerrada y tórax rígido supera el esfínter esofágico (> 20 cmH2O), forzando gas al estómago. Esto provoca distensión masiva, regurgitación de contenido gástrico, aspiración pulmonar o ruptura gástrica aguda.',
  },
  fentanyl_inhalation: {
    id: 'fentanyl_inhalation',
    name: 'Aerosolized / Inhaled Street Fentanyl ("Blues" / Pressed Pills / Vaped Powder)',
    nameEs: 'Fentanilo Callejero Inhalado / Vaporizado ("M30" / Pastillas / Polvo)',
    onset: 'Rapid (within 30 seconds to 2 minutes of deep inhalation)',
    onsetEs: 'Rápido (entre 30 segundos y 2 minutos tras inhalación profunda)',
    mechanism: 'Rapid alveolar-capillary absorption bypassing first-pass hepatic metabolism. Delivers high peak arterial concentration directly to carotid and cerebral circulation, causing sudden neuro-motor freeze.',
    mechanismEs: 'Absorción alveolo-capilar veloz que elude metabolismo hepático. Entrega alta concentración arterial a circulación carotídea y cerebral, causando colapso neuromotor súbito.',
    bvmPresentation: 'Profound hypoventilation with high chest compliance resistance. SpO2 < 70% with dusky cyanosis.',
    bvmPresentationEs: 'Hipoventilación extrema con alta resistencia elástica torácica. SpO2 < 70% con cianosis marcada.',
    blackBoxWarning: 'SUSTAINED CHEST COMPRESSIONS AGAINST CLOSED GLOTTIS PITFALL',
    blackBoxWarningEs: 'TRAMPA DE COMPRESIONES TORÁCICAS AISLADAS SIN ALIVIO DE LA VÍA AÉREA',
    blackBoxDetail: 'Performing chest compressions without relieving the severe glottic and chest wall rigidity fails to generate systemic forward blood flow. Rapid neuromuscular paralysis or high-dose naloxone is mandatory to permit effective chest compressions and ventilation.',
    blackBoxDetailEs: 'Comprimir el tórax sin aliviar la rigidez de glotis y pared torácica no genera flujo anterógrado efectivo. Es indispensable revertir el espasmo con naloxona o relajación neuromuscular inmediata.',
  },
});

export const WOODEN_CHEST_CLINICAL_FLAGS = Object.freeze([
  { id: 'flag_bvm_impossible', label: 'Impossible BVM Ventilation: Bag cannot be depressed, zero chest rise, airway pressure > 50 cmH2O', labelEs: 'Ventilación BVM Imposible: Bolsa rígida, nula expansión torácica, presión de vía aérea > 50 cmH2O', fatal: true },
  { id: 'flag_vocal_adduction', label: 'Vocal Cord Adduction / Severe Laryngospasm: Complete glottic closure preventing airflow', labelEs: 'Aducción de Cuerdas Vocales / Laringoespasmo Severo: Cierre glótico completo', fatal: true },
  { id: 'flag_masseter_spasm', label: 'Severe Trismus / Masseter Spasm: Inability to open mouth or insert basic oral/nasal airway', labelEs: 'Trismo Severo / Espasmo de Maseteros: Imposibilidad de abrir la boca o insertar cánula', fatal: true },
  { id: 'flag_critical_hypoxia', label: 'Critical Hypoxia: SpO2 < 70% with dusky central cyanosis and impending bradycardia', labelEs: 'Hipoxia Crítica: SpO2 < 70% con cianosis central y bradicardia inminente', fatal: true },
  { id: 'flag_gastric_distension', label: 'Abdominal Rigidity & Gastric Distension from prior high-pressure BVM attempts', labelEs: 'Rigidez Abdominal y Distensión Gástrica por intentos previos de BVM forzado', fatal: false },
  { id: 'flag_unknown_downtime', label: 'Unknown Downtime / Acidosis / Suspected Rhabdomyolysis: Absolute succinylcholine contraindication', labelEs: 'Tiempo de Paro Desconocido / Acidosis / Rabdomiólisis: Contraindicación absoluta de succinilcolina', fatal: true },
]);

export function evaluateWoodenChestRisk(state) {
  const exposure = WOODEN_CHEST_EXPOSURES[state.exposure] || WOODEN_CHEST_EXPOSURES.fentanyl_rapid_iv;
  const weight = Number(state.weightKg) || 75;
  const flags = state.checkedFlags;

  const alerts = [];
  const actions = [];

  const bvmImpossible = flags.has('flag_bvm_impossible') || flags.has('flag_vocal_adduction');
  const criticalHypoxia = flags.has('flag_critical_hypoxia');

  // Paralyzing & Sedation Dosing Calculations
  const rocuroniumDoseMg = Math.round(weight * 1.2); // 1.2 mg/kg RSI dose
  const vecuroniumDoseMg = Math.round(weight * 0.1 * 10) / 10; // 0.1 mg/kg
  const etomidateDoseMg = Math.round(weight * 0.3); // 0.3 mg/kg
  const ketamineDoseMg = Math.round(weight * 1.5); // 1.5 mg/kg

  if (bvmImpossible || criticalHypoxia) {
    alerts.push({
      type: 'critical',
      title: 'LIFE-THREATENING WOODEN CHEST AIRWAY EMERGENCY',
      titleEs: 'EMERGENCIA RESPIRATORIA CRÍTICA: TÓRAX LEÑOSO INTRATABLE',
      body: 'Patient has complete thoracic muscle lock and glottic closure. Manual BVM ventilation is physically impossible. Immediate high-dose naloxone and preparation for rapid neuromuscular paralysis (Rocuronium) is required to restore chest compliance.',
      bodyEs: 'El paciente presenta bloqueo muscular torácico completo y cierre glótico. La ventilación manual BVM es físicamente imposible. Se requiere naloxona en altas dosis y preparación para parálisis neuromuscular inmediata (Rocuronio).',
    });
  }

  // Emergency Resuscitation Steps
  actions.push({
    priority: 'stat',
    text: 'STAT High-Dose Naloxone: Administer 2.0 - 4.0 mg IV push (or IM/IO). Repeat at 2 minutes if chest wall remains rigid. Naloxone displaces central striatal mu-receptors mediating muscle rigidity.',
    textEs: 'Naloxona STAT en Dosis Altas: Administrar 2.0 - 4.0 mg IV rápida (o IM/IO). Repetir a los 2 minutos si el tórax sigue rígido. La naloxona desplaza receptores mu estriados mediadores de la rigidez.',
  });

  if (bvmImpossible) {
    actions.push({
      priority: 'stat',
      text: `Immediate Neuromuscular Paralysis (RSI): If BVM is impossible and patient is hypoxic, administer Rocuronium ${rocuroniumDoseMg} mg IV (1.2 mg/kg) or Vecuronium ${vecuroniumDoseMg} mg IV (0.1 mg/kg). Paralyzes rigid intercostal and laryngeal striated muscles within 45-60 seconds, restoring chest compliance.`,
      textEs: `Parálisis Neuromuscular Inmediata (ISR): Si el BVM es imposible e hipóxico, administrar Rocuronio ${rocuroniumDoseMg} mg IV (1.2 mg/kg) o Vecuronio ${vecuroniumDoseMg} mg IV (0.1 mg/kg). Relaja la pared torácica y laringe en 45-60 segundos permitiendo la ventilación.`,
    });

    actions.push({
      priority: 'urgent',
      text: `Concomitant Sedation: Administer Etomidate ${etomidateDoseMg} mg IV (0.3 mg/kg) or Ketamine ${ketamineDoseMg} mg IV (1.5 mg/kg) prior to paralysis if patient exhibits any residual awareness or partial movement.`,
      textEs: `Sedación Concomitante: Administrar Etomidato ${etomidateDoseMg} mg IV (0.3 mg/kg) o Ketamina ${ketamineDoseMg} mg IV (1.5 mg/kg) antes del bloqueo si el paciente conserva alguna reactividad.`,
    });
  }

  actions.push({
    priority: 'stat',
    text: 'Laryngeal Airway & Gastric Decompression: Insert endotracheal tube immediately following neuromuscular relaxation. Place orogastric/nasogastric tube to decompress stomach and prevent aspiration from prior BVM attempts.',
    textEs: 'Vía Aérea Laringea y Descompresión Gástrica: Intubación orotraqueal inmediata tras la relajación neuromuscular. Colocar sonda orogástrica para descomprimir el estómago y evitar broncoaspiración.',
  });

  return {
    exposure,
    bvmImpossible,
    criticalHypoxia,
    rocuroniumDoseMg,
    vecuroniumDoseMg,
    etomidateDoseMg,
    ketamineDoseMg,
    alerts,
    actions,
  };
}

export function generateWoodenChestSbar(state, lang = 'en') {
  const isEs = lang === 'es';
  const exp = WOODEN_CHEST_EXPOSURES[state.exposure] || WOODEN_CHEST_EXPOSURES.fentanyl_rapid_iv;
  const evalResult = evaluateWoodenChestRisk(state);
  const now = new Date().toISOString();

  if (isEs) {
    return [
      '=== REPORTE CLÍNICO SBAR: RIGIDEZ TORÁCICA POR FENTANILO ("TÓRAX LEÑOSO") ===',
      `Fecha/Hora: ${now}`,
      'Privacidad: Cero PII / Identificadores Anonimizados (Cumplimiento HIPAA / 42 CFR Parte 2)',
      '',
      'SITUATION (SITUACIÓN):',
      `Paciente en paro respiratorio agudo con Tórax Leñoso ("Wooden Chest") tras exposición a ${exp.nameEs}.`,
      `Peso Estimado: ${state.weightKg || '75'} kg. SpO2: ${state.spo2Value || 'Pendiente'}%. Estado de BVM: ${evalResult.bvmImpossible ? 'IMPOSIBLE VENTILAR / CAGE TORÁCICO PÉTREO' : 'Resistencia Ventilatoria Severa'}.`,
      '',
      'BACKGROUND (ANTECEDENTES):',
      `Inicio del Cuadro: ${exp.onsetEs}`,
      `Fisiopatología: ${exp.mechanismEs}`,
      `Banderas Clínicas: ${Array.from(state.checkedFlags).join(', ') || 'Ninguna registrada'}`,
      '',
      'ASSESSMENT (EVALUACIÓN Y DOSIS CALCULADAS DE RESCATE):',
      `• Naloxona STAT: 2.0 a 4.0 mg IV/IM directa`,
      `• Rocuronio (Relajante No Despolarizante 1.2 mg/kg): ${evalResult.rocuroniumDoseMg} mg IV`,
      `• Vecuronio (Alternativa 0.1 mg/kg): ${evalResult.vecuroniumDoseMg} mg IV`,
      `• Sedación con Etomidato (0.3 mg/kg): ${evalResult.etomidateDoseMg} mg IV`,
      '',
      'RECOMMENDATIONS & CRITICAL DIRECTIVES (RECOMENDACIONES Y DIRECTIVAS CRÍTICAS):',
      `1. ADVERTENCIA NEGRA: ${exp.blackBoxWarningEs}`,
      `   ${exp.blackBoxDetailEs}`,
      '2. NO forzar el BVM contra glotis cerrada para evitar ruptura gástrica y aspiración ácida masiva.',
      '3. Si la ventilación manual es imposible, proceder de inmediato con secuencia de intubación rápida utilizando Rocuronio/Vecuronio.',
      '4. Descomprimir estómago mediante sonda orogástrica tras asegurar el tubo endotraqueal.',
      '====================================================================',
    ].join('\n');
  }

  return [
    '=== SBAR CLINICAL HANDOFF REPORT: FENTANYL WOODEN CHEST RIGIDITY ===',
    `Timestamp: ${now}`,
    'Privacy: Zero PII / Redacted Identifiers (HIPAA / 42 CFR Part 2 Compliant)',
    '',
    'SITUATION:',
    `Patient in acute respiratory arrest with Wooden Chest Syndrome following exposure to ${exp.name}.`,
    `Estimated Weight: ${state.weightKg || '75'} kg. SpO2: ${state.spo2Value || 'Pending'}%. BVM Status: ${evalResult.bvmImpossible ? 'IMPOSSIBLE BVM VENTILATION / THORACIC LOCK' : 'High Airway Resistance'}.`,
    '',
    'BACKGROUND:',
    `Onset: ${exp.onset}`,
    `Pathophysiology: ${exp.mechanism}`,
    `Active Clinical Flags: ${Array.from(state.checkedFlags).join(', ') || 'None selected'}`,
    '',
    'ASSESSMENT & CALCULATED RESCUE DOSES:',
    `• STAT Naloxone Dose: 2.0 - 4.0 mg IV/IM push`,
    `• Rocuronium (Non-depolarizing RSI Dose 1.2 mg/kg): ${evalResult.rocuroniumDoseMg} mg IV`,
    `• Vecuronium (Alternative 0.1 mg/kg): ${evalResult.vecuroniumDoseMg} mg IV`,
    `• Induction Etomidate (0.3 mg/kg): ${evalResult.etomidateDoseMg} mg IV`,
    '',
    'RECOMMENDATIONS & LIFE-SAVING DIRECTIVES:',
    `1. BLACK-BOX ALERT: ${exp.blackBoxWarning}`,
    `   ${exp.blackBoxDetail}`,
    '2. PROHIBIT forceful BVM bag compression against closed glottis; prevents gastric rupture and massive aspiration.',
    '3. If BVM is mechanically impossible and hypoxia is severe, execute rapid neuromuscular paralysis with Rocuronium to restore chest compliance.',
    '4. Place orogastric tube immediately post-intubation to decompress insufflated stomach gas.',
    '====================================================================',
  ].join('\n');
}

// In-RAM Ephemeral State Lifecycle
function createInitialState() {
  return {
    exposure: 'fentanyl_rapid_iv',
    weightKg: '75',
    spo2Value: '68',
    checkedFlags: new Set(['flag_bvm_impossible', 'flag_vocal_adduction', 'flag_critical_hypoxia']),
  };
}

let woodenChestState = createInitialState();
const listeners = new Set();

export function getWoodenChestState() {
  return woodenChestState;
}

export function updateWoodenChestState(partial) {
  woodenChestState = { ...woodenChestState, ...partial };
  listeners.forEach((fn) => fn(getWoodenChestState()));
}

export function resetWoodenChestState() {
  woodenChestState = createInitialState();
  listeners.forEach((fn) => fn(getWoodenChestState()));
}

export function subscribeWoodenChestState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Accessible DOM View
export function woodenChestRigidityView() {
  const container = h('div', { class: 'woodenchest-view specialized-clinical-view' });
  const lang = getLang();
  const isEs = lang === 'es';

  const header = pageHeader(
    t('tools.item.wooden-chest-rigidity.title', 'Synthetic Opioid Wooden Chest Rigidity & Airway Protocol'),
    t(
      'tools.item.wooden-chest-rigidity.description',
      'Clinical triage for Fentanyl-Induced Muscle Rigidity (FIMR / Wooden Chest), failed bag-valve-mask (BVM) ventilation, weight-based Rocuronium/Vecuronium paralysis dosing, and black-box succinylcholine/gastric distension prohibitions.',
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

  // Exposure Selection Card
  const expSelect = h(
    'select',
    {
      class: 'nsti-select',
      'aria-label': isEs ? 'Seleccionar vía de exposición' : 'Select exposure route',
      onchange: (e) => updateWoodenChestState({ exposure: e.target.value }),
    },
    Object.values(WOODEN_CHEST_EXPOSURES).map((item) =>
      h('option', { value: item.id, selected: item.id === getWoodenChestState().exposure }, isEs ? item.nameEs : item.name),
    ),
  );
  const mechanismContainer = h('div', { class: 'nsti-stage-info' });
  const expCard = h('div', { class: 'nsti-card' }, [
    h('h2', { class: 'nsti-card-title' }, isEs ? '1. Vía de Exposición al Fentanilo' : '1. Fentanyl Exposure Route'),
    expSelect,
    mechanismContainer,
  ]);
  leftCol.appendChild(expCard);

  // Vitals Card
  const weightInput = h('input', {
    id: 'weight-input',
    type: 'number',
    class: 'nsti-num-input',
    placeholder: '75',
    value: getWoodenChestState().weightKg,
    oninput: (e) => updateWoodenChestState({ weightKg: e.target.value }),
  });
  const spo2Input = h('input', {
    id: 'spo2-input',
    type: 'number',
    class: 'nsti-num-input',
    placeholder: '68',
    value: getWoodenChestState().spo2Value,
    oninput: (e) => updateWoodenChestState({ spo2Value: e.target.value }),
  });

  const vitalsCard = h('div', { class: 'nsti-card' }, [
    h('h2', { class: 'nsti-card-title' }, isEs ? '2. Parámetros del Paciente' : '2. Patient Parameters'),
    h('div', { class: 'decon-input-group' }, [
      h('label', { for: 'weight-input' }, isEs ? 'Peso del Paciente (kg - para dosis de relajante):' : 'Patient Weight (kg - for paralytic dosing):'),
      weightInput,
    ]),
    h('div', { class: 'decon-input-group' }, [
      h('label', { for: 'spo2-input' }, isEs ? 'Oximetría SpO2 (% - Alerta si < 70%):' : 'Pulse Oximetry SpO2 (% - Alert if < 70%):'),
      spo2Input,
    ]),
  ]);
  leftCol.appendChild(vitalsCard);

  // Clinical Flags Card
  const flagCheckboxes = [];
  const flagsCard = h('div', { class: 'nsti-card' }, [
    h('h2', { class: 'nsti-card-title' }, isEs ? '3. Banderas Clínicas de Tórax Leñoso' : '3. Wooden Chest Clinical Flags'),
    h(
      'div',
      { class: 'decon-checkbox-group' },
      WOODEN_CHEST_CLINICAL_FLAGS.map((f) => {
        const cb = h('input', {
          type: 'checkbox',
          checked: getWoodenChestState().checkedFlags.has(f.id),
          onchange: (e) => {
            const set = new Set(getWoodenChestState().checkedFlags);
            if (e.target.checked) set.add(f.id);
            else set.delete(f.id);
            updateWoodenChestState({ checkedFlags: set });
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
  const rsiDosingCardContainer = h('div');
  const directivesCardContainer = h('div');
  const sbarCardContainer = h('div');
  rightCol.appendChild(rsiDosingCardContainer);
  rightCol.appendChild(directivesCardContainer);
  rightCol.appendChild(sbarCardContainer);

  function renderDynamic() {
    const state = getWoodenChestState();
    const exp = WOODEN_CHEST_EXPOSURES[state.exposure] || WOODEN_CHEST_EXPOSURES.fentanyl_rapid_iv;
    const evalResult = evaluateWoodenChestRisk(state);

    // Update Warning Banner
    clear(warningBannerContainer);
    warningBannerContainer.appendChild(
      h('div', { class: 'movement-blackbox-banner' }, [
        h('div', { class: 'movement-banner-header' }, [
          icon('alert'),
          h('strong', {}, isEs ? ' ADVERTENCIA NEGRA RESPIRATORIA: ' + exp.blackBoxWarningEs : ' BLACK-BOX AIRWAY ALERT: ' + exp.blackBoxWarning),
        ]),
        h('p', {}, isEs ? exp.blackBoxDetailEs : exp.blackBoxDetail),
      ]),
    );

    // Update Mechanism Info
    clear(mechanismContainer);
    mechanismContainer.appendChild(h('strong', {}, isEs ? 'Fisiopatología de la Rigidez: ' : 'Rigidity Pathophysiology: '));
    mechanismContainer.appendChild(h('p', {}, isEs ? exp.mechanismEs : exp.mechanism));
    mechanismContainer.appendChild(h('strong', {}, isEs ? 'Presentación al BVM: ' : 'BVM Presentation: '));
    mechanismContainer.appendChild(h('p', {}, isEs ? exp.bvmPresentationEs : exp.bvmPresentation));

    // Update RSI Dosing Card
    clear(rsiDosingCardContainer);
    rsiDosingCardContainer.appendChild(
      h('div', { class: 'nsti-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? '4. Dosis Calculadas de Relajación Neuromuscular (ISR)' : '4. Calculated Neuromuscular Paralysis Doses (RSI)'),
        h('div', { class: 'decon-directive-box' }, [
          h('p', {}, [
            h('strong', {}, isEs ? '• Rocuronio (1ra Línea 1.2 mg/kg): ' : '• Rocuronium (1st Line 1.2 mg/kg): '),
            h('span', { class: 'font-bold' }, `${evalResult.rocuroniumDoseMg} mg IV `),
            h('span', {}, isEs ? '(Relaja pared torácica en 45-60 s; sin riesgo de hiperpotasemia).' : '(Relaxes chest wall in 45-60 sec; zero hyperkalemia hazard).'),
          ]),
          h('p', {}, [
            h('strong', {}, isEs ? '• Vecuronio (Alternativa 0.1 mg/kg): ' : '• Vecuronium (Alternative 0.1 mg/kg): '),
            h('span', { class: 'font-bold' }, `${evalResult.vecuroniumDoseMg} mg IV `),
            h('span', {}, isEs ? '(Relajante no despolarizante de segunda línea).' : '(Second-line non-depolarizing paralytic).'),
          ]),
          h('p', {}, [
            h('strong', {}, isEs ? '• Sedación / Amnesia (Etomidato 0.3 mg/kg): ' : '• Induction Sedation (Etomidate 0.3 mg/kg): '),
            h('span', { class: 'font-bold' }, `${evalResult.etomidateDoseMg} mg IV `),
            h('span', {}, isEs ? '(o Ketamina 1.5 mg/kg si hemodinámicamente estable).' : '(or Ketamine 1.5 mg/kg if hemodynamically stable).'),
          ]),
        ]),
      ]),
    );

    // Update Directives Card
    clear(directivesCardContainer);
    directivesCardContainer.appendChild(
      h('div', { class: 'nsti-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? '5. Directivas de Manejo y Rescate Ventilatorio' : '5. Ventilatory Rescue Directives'),
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
    const sbarText = generateWoodenChestSbar(state, lang);
    clear(sbarCardContainer);
    const sbarTextarea = h(
      'textarea',
      {
        id: 'woodenchest-sbar-text',
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
          const ok = await copyText(sbarTextarea.value, {
            trigger: copyBtn,
            copiedLabel: isEs ? '¡Copiado!' : 'Copied!',
          });
          if (!ok && typeof sbarTextarea.select === 'function') sbarTextarea.select();
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
          resetWoodenChestState();
          weightInput.value = '75';
          spo2Input.value = '68';
          expSelect.value = 'fentanyl_rapid_iv';
          flagCheckboxes.forEach((f) => {
            f.input.checked = ['flag_bvm_impossible', 'flag_vocal_adduction', 'flag_critical_hypoxia'].includes(f.id);
          });
        },
      },
      isEs ? 'Reiniciar Formulario' : 'Reset Form',
    );

    sbarCardContainer.appendChild(
      h('div', { class: 'nsti-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? '6. Nota SBAR de Rescate Respiratorio (Cero PII)' : '6. Zero-PII SBAR Airway Handoff Note'),
        sbarTextarea,
        h('div', { class: 'nsti-btn-row' }, [copyBtn, resetBtn]),
      ]),
    );
  }

  const unsubscribe = subscribeWoodenChestState(() => {
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
