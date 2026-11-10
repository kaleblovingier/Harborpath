// public/js/views/periOverdosePulmonary.js
// Wave 65: Peri-Overdose Pulmonary Syndromes & Non-Cardiogenic Pulmonary Edema (NCPE) Navigator
// ATS, IDSA, and ACMT Clinical Consensus Standards.
// Ephemeral in-RAM state, zero persistent storage, zero PII, WCAG 2.1 AA compliant.

import { h, clear } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

export const PULMONARY_SYNDROMES = Object.freeze({
  ncpe: {
    id: 'ncpe',
    name: 'Post-Naloxone Non-Cardiogenic Pulmonary Edema (NCPE)',
    nameEs: 'Edema Pulmonar No Cardiogénico Post-Naloxona (EPNC)',
    pathophysiology: 'Centrally mediated sympathetic storm triggers massive catecholamine surge, abrupt peripheral vasoconstriction, translocating blood into low-resistance pulmonary capillaries. Hydrostatic pressures exceed 40 mmHg, causing mechanical stress failure of alveolar-capillary membranes and proteinaceous alveolar flooding.',
    pathophysiologyEs: 'La tormenta simpática central desencadena una descarga masiva de catecolaminas y vasoconstricción periférica, desplazando sangre hacia los capilares pulmonares. La presión hidrostática supera los 40 mmHg, causando falla mecánica por estrés capilar e inundación alveolar proteinácea.',
    hallmarks: 'Onset within 5-60 minutes after naloxone; copious pink frothy sputum; severe tachypnea; diffuse crackles; refractory hypoxia (SpO2 < 88%); CXR shows bilateral infiltrates with NORMAL cardiac silhouette.',
    hallmarksEs: 'Inicio entre 5 y 60 minutos tras naloxona; esputo rosado espumoso abundante; taquipnea severa; estertores difusos; hipoxia refractaria (SpO2 < 88%); radiografía muestra infiltrados bilaterales con silueta cardíaca NORMAL.',
    blackBoxContraindication: 'AGGRESSIVE LOOP DIURETICS (FUROSEMIDE / BUMETANIDE) CONTRAINDICATED',
    blackBoxContraindicationEs: 'DIURÉTICOS DE ASA AGRESIVOS (FUROSEMIDA / BUMETANIDA) CONTRAINDICADOS',
    contraindicationText: 'NCPE is an alveolar-capillary permeability leak and catecholaminergic fluid shift, NOT total-body volume overload. The patient is intravascularly euvolemic or contracted. Aggressive loop diuretics drop effective arterial volume, precipitating severe systemic hypotension, circulatory collapse, and prerenal AKI.',
    contraindicationTextEs: 'El EPNC es una fuga por permeabilidad alveolo-capilar y redistribución de volumen, NO una sobrecarga hídrica corporal. El paciente está euvolémico o deshidratado. Los diuréticos de asa disminuyen el volumen circulante efectivo, precipitando colapso circulatorio y lesión renal aguda.',
    firstLineManagement: 'Non-invasive positive pressure ventilation (CPAP or BiPAP with PEEP 8-12 cmH2O and 100% FiO2) to mechanically recruit alveoli. Endotracheal intubation with lung-protective ventilation (Vt 6 mL/kg PBW, PEEP 10-14 cmH2O) if somnolent or exhausted. Typically resolves in 12-24 to 48 hours.',
    firstLineManagementEs: 'Ventilación con presión positiva no invasiva (CPAP o BiPAP con PEEP 8-12 cmH2O y FiO2 100%) para reclutar alvéolos. Intubación endotraqueal con ventilación de protección pulmonar (Vt 6 mL/kg peso predicho, PEEP 10-14 cmH2O) si está somnoliento o agotado. Resuelve típicamente en 12-48 horas.',
  },
  aspiration: {
    id: 'aspiration',
    name: "Mendelson Chemical Pneumonitis vs Secondary Aspiration Pneumonia",
    nameEs: "Neumonitis Química de Mendelson vs Neumonía por Aspiración Secundaria",
    pathophysiology: 'Macro-aspiration of acidic gastric contents (pH < 2.5) causes rapid sterile chemical burn of bronchial epithelium within 1-2 hours. In contrast, secondary bacterial infection involves microbial colonization and replication manifesting 48-72 hours later.',
    pathophysiologyEs: 'La macroaspiración de contenido gástrico ácido (pH < 2.5) causa una quemadura química estéril del epitelio bronquial en 1-2 horas. En contraste, la infección bacteriana secundaria involucra colonización y replicación microbiana manifestada 48-72 horas después.',
    hallmarks: 'Acute bronchospasm, dependent infiltrates within 2 hours, mild fever. Bacterial pneumonia manifests at > 48 hours with persistent fever > 38.3°C, purulent foul sputum, and rising leukocytosis (> 15,000/uL).',
    hallmarksEs: 'Broncoespasmo agudo, infiltrados dependientes en 2 horas, febrícula. La neumonía bacteriana se manifiesta a las > 48 horas con fiebre persistente > 38.3°C, esputo purulento y leucocitosis progresiva (> 15,000/uL).',
    blackBoxContraindication: 'PROPHYLACTIC ANTIBIOTICS STRICTLY PROHIBITED IN FIRST 48 HOURS',
    blackBoxContraindicationEs: 'ANTIBIÓTICOS PROFILÁCTICOS ESTRICTAMENTE PROHIBIDOS EN LAS PRIMERAS 48 HORAS',
    contraindicationText: 'ATS/IDSA guidelines: Prophylactic antibiotics do NOT prevent pneumonia or improve survival in chemical pneumonitis, but breed lethal multi-drug resistant superinfections (MRSA, Pseudomonas). Antibiotics are indicated ONLY if bacterial pneumonia develops after 48 hours.',
    contraindicationTextEs: 'Guías ATS/IDSA: Los antibióticos profilácticos NO previenen neumonía ni mejoran la sobrevida en neumonitis química, pero seleccionan superinfecciones multirresistentes letales (MRSA, Pseudomonas). Se indican ÚNICAMENTE si surge neumonía bacteriana después de 48 horas.',
    firstLineManagement: 'Supportive airway toilet: suctioning, nebulized albuterol/ipratropium for bronchospasm, supplemental oxygen. Re-evaluate at 48 hours: if fever > 38.3°C and purulent sputum appear, initiate Ampicillin-Sulbactam 3g IV q6h or Ceftriaxone + Metronidazole.',
    firstLineManagementEs: 'Aseo de vía aérea: aspiración, albuterol/ipratropio nebulizado para broncoespasmo, oxígeno suplementario. Reevaluar a las 48 horas: si surge fiebre > 38.3°C y esputo purulento, iniciar Ampicilina-Sulbactam 3g IV c/6h o Ceftriaxona + Metronidazol.',
  },
  crackLung: {
    id: 'crackLung',
    name: '"Crack Lung" / Cocaine Diffuse Alveolar Hemorrhage (DAH)',
    nameEs: '"Pulmón de Crack" / Hemorragia Alveolar Difusa por Cocaína (HAD)',
    pathophysiology: 'Inhalation of pyrolyzed freebase cocaine vapor containing anhydroecgonine methyl ester (AEME) causes direct alveolar cytotoxicity, severe endothelial permeability, intense microvascular vasospasm followed by rebound hyperemic capillary rupture, and acute eosinophilic alveolar injury.',
    pathophysiologyEs: 'La inhalación de vapor de cocaína base pirolizada con éster metílico de anhidroecgonina (AEME) produce citotoxicidad alveolar directa, permeabilidad endotelial y vasoespasmo capilar intenso seguido de rotura hiperémica y lesión eosinofílica alveolar.',
    hallmarks: 'Classic clinical triad: Hemoptysis (or melanoptysis / black sputum), acute dyspnea, and bilateral diffuse ground-glass infiltrates with subpleural sparing on CT. Bronchoalveolar lavage shows progressive blood return and >= 20% hemosiderin-laden macrophages (siderophages).',
    hallmarksEs: 'Tríada clásica: Hemoptisis (o melanoptisis / esputo negruzco), disnea aguda e infiltrados alveolares difusos en vidrio deslustrado en TC. El lavado broncoalveolar muestra alícuotas progresivamente más hemáticas y >= 20% de macrófagos con hemosiderina (siderófagos).',
    blackBoxContraindication: 'BETA-ADRENERGIC BLOCKERS STRICTLY CONTRAINDICATED IN COCAINE TOXICITY',
    blackBoxContraindicationEs: 'BETABLOQUEADORES ESTRICTAMENTE CONTRAINDICADOS EN TOXICIDAD POR COCAÍNA',
    contraindicationText: 'Beta-blockers (propranolol, metoprolol, labetalol) block beta-2 vasodilatory receptors while leaving alpha-1 vasoconstriction completely unopposed. This triggers catastrophic hypertensive spikes, refractory coronary vasospasm, acute myocardial infarction, and aortic dissection.',
    contraindicationTextEs: 'Los betabloqueadores bloquean los receptores vasodilatadores beta-2 dejando la vasoconstricción alfa-1 sin oposición. Esto desencadena crisis hipertensiva catastrófica, vasoespasmo coronario severo, infarto agudo de miocardio y disección aórtica.',
    firstLineManagement: 'High-flow humidified oxygen, inhaled bronchodilators, systemic IV Methylprednisolone 60-125 mg IV q6h (1-2 mg/kg/day) for severe hypoxemic DAH. For tachycardia/hypertension, use high-dose IV Benzodiazepines (Lorazepam 2-4 mg IV), NOT beta-blockers.',
    firstLineManagementEs: 'Oxígeno humidificado de alto flujo, broncodilatadores inhalados, Metilprednisolona IV sistémica 60-125 mg c/6h (1-2 mg/kg/día) para HAD hipoxémica grave. Para taquicardia/hipertensión, use benzodiazepinas IV en dosis altas (Lorazepam 2-4 mg IV), NO betabloqueadores.',
  },
});

export const PULMONARY_CLINICAL_FLAGS = Object.freeze([
  { id: 'pinkFrothySputum', label: 'Copious pink, frothy sputum within 5-60 min of naloxone administration (NCPE)', labelEs: 'Esputo rosado espumoso abundante entre 5-60 min tras administrar naloxona (EPNC)', severe: true, group: 'ncpe' },
  { id: 'refractoryHypoxia', label: 'Severe refractory hypoxia (SpO2 < 88%) with diffuse bilateral crackles / rales', labelEs: 'Hipoxia severa refractaria (SpO2 < 88%) con estertores crepitantes bilaterales difusos', severe: true, group: 'ncpe' },
  { id: 'furosemideOrdered', label: 'Team preparing IV Furosemide / loop diuretics for post-naloxone pulmonary edema', labelEs: 'Equipo médico preparando Furosemida IV / diuréticos de asa para edema post-naloxona', severe: true, fatal: true, group: 'ncpe' },
  { id: 'aspirationObserved', label: 'Witnessed aspiration / emesis during opioid overdose or rapid naloxone awakening', labelEs: 'Aspiración o vómito presenciado durante sobredosis o despertar brusco con naloxona', severe: false, group: 'aspiration' },
  { id: 'under48Hours', label: 'Current presentation is within the first 0-48 hours of aspiration event (sterile acid burn phase)', labelEs: 'El cuadro actual ocurre dentro de las primeras 0-48 horas de la aspiración (fase química estéril)', severe: false, group: 'aspiration' },
  { id: 'prophylacticAbxPlanned', label: 'Provider ordering prophylactic empiric antibiotics during the first 48 hours of chemical pneumonitis', labelEs: 'Médico ordenando antibióticos profilácticos empíricos durante las primeras 48h de neumonitis química', severe: true, fatal: true, group: 'aspiration' },
  { id: 'hemoptysisMelanoptysis', label: 'Hemoptysis or melanoptysis (black/carbonaceous sputum) after smoking crack cocaine', labelEs: 'Hemoptisis o melanoptisis (esputo negro o carbonáceo) tras fumar crack', severe: true, group: 'crackLung' },
  { id: 'diffuseGroundGlass', label: 'Chest CT shows diffuse bilateral ground-glass opacities / consolidations with subpleural sparing', labelEs: 'TC de tórax muestra opacidades difusas bilaterales en vidrio deslustrado con respeto subpleural', severe: true, group: 'crackLung' },
  { id: 'betaBlockerPlanned', label: 'Provider planning beta-blockers (Metoprolol / Labetalol) for cocaine-induced tachycardia/hypertension', labelEs: 'Médico planeando betabloqueadores (Metoprolol / Labetalol) para taquicardia/hipertensión por cocaína', severe: true, fatal: true, group: 'crackLung' },
]);

export function evaluatePulmonaryRisk(state) {
  const flags = new Set(state.checkedFlags || []);
  const syndrome = state.syndrome || 'ncpe';
  const spo2 = parseInt(state.spo2Value, 10);
  const hoursPostAsp = parseInt(state.hoursPostAspiration, 10);
  const actions = [];
  const alerts = [];
  let priority = 'standard';

  // 1. Black Box & Fatal Pitfalls Checks First
  if (flags.has('furosemideOrdered') || (syndrome === 'ncpe' && state.diureticPlanned)) {
    priority = 'critical-fatal';
    alerts.push({
      type: 'fatal-alert',
      title: 'FATAL MEDICATION CONTRAINDICATION: LOOP DIURETICS PROHIBITED IN NCPE',
      titleEs: 'CONTRAINDICACIÓN FATAL: DIURÉTICOS DE ASA PROHIBIDOS EN EPNC',
      body: 'Post-naloxone NCPE is a high-permeability capillary stress leak, NOT cardiogenic hypervolemia. IV Furosemide causes severe intravascular volume collapse, profound hypotension, and acute kidney injury. Use PEEP.',
      bodyEs: 'El EPNC post-naloxona es una fuga capilar por estrés de alta permeabilidad, NO hipervolemia cardiogénica. La furosemida IV causa colapso intravascular grave, hipotensión severa y falla renal aguda. Use PEEP.',
    });
    actions.push({
      priority: 'stat',
      text: 'CANCEL IV furosemide/bumetanide orders immediately. Apply positive pressure ventilation (PEEP 8-12 cmH2O via CPAP/BiPAP).',
      textEs: 'CANCELE las órdenes de furosemida/bumetanida IV de inmediato. Aplique ventilación con presión positiva (PEEP 8-12 cmH2O por CPAP/BiPAP).',
    });
  }

  if (flags.has('prophylacticAbxPlanned') || (syndrome === 'aspiration' && state.prophylacticAbxGiven)) {
    priority = 'critical-fatal';
    alerts.push({
      type: 'fatal-alert',
      title: 'ANTIBIOTIC STEWARDSHIP VIOLATION: PROPHYLACTIC ANTIBIOTICS PROHIBITED (0-48h)',
      titleEs: 'VIOLACIÓN DE STEWARDSHIP: ANTIBIÓTICOS PROFILÁCTICOS PROHIBIDOS (0-48h)',
      body: 'Chemical pneumonitis is a sterile acid burn. ATS/IDSA guidelines: Prophylactic antibiotics do NOT prevent pneumonia or improve survival, but select for deadly multi-drug resistant superinfections (MRSA, Pseudomonas).',
      bodyEs: 'La neumonitis química es una quemadura ácida estéril. Guías ATS/IDSA: Los antibióticos profilácticos NO previenen neumonía ni mejoran sobrevida, pero seleccionan superinfecciones multirresistentes letales (MRSA, Pseudomonas).',
    });
    actions.push({
      priority: 'urgent',
      text: 'WITHHOLD all prophylactic antibiotics during the first 48 hours. Provide supportive airway suctioning and inhaled bronchodilators.',
      textEs: 'SUSPENDA todos los antibióticos profilácticos durante las primeras 48 horas. Brinde aspiración de vía aérea y broncodilatadores inhalados.',
    });
  }

  if (flags.has('betaBlockerPlanned') || (syndrome === 'crackLung' && state.betaBlockerConsidered)) {
    priority = 'critical-fatal';
    alerts.push({
      type: 'fatal-alert',
      title: 'FATAL CARDIOVASCULAR PITFALL: UNOPPOSED ALPHA-ADRENERGIC CRISIS',
      titleEs: 'TRAMPA CARDIOVASCULAR FATAL: CRISIS ALFA-ADRENÉRGICA SIN OPOSICIÓN',
      body: 'Beta-blockers (propranolol, metoprolol, labetalol) in acute cocaine toxicity block vasodilatory beta-2 receptors, causing unopposed alpha-1 coronary vasoconstriction, catastrophic hypertensive crisis, and transmural MI.',
      bodyEs: 'Los betabloqueadores en toxicidad por cocaína bloquean los receptores vasodilatadores beta-2, causando vasoconstricción coronaria alfa-1 sin oposición, crisis hipertensiva catastrófica e infarto transmural.',
    });
    actions.push({
      priority: 'stat',
      text: 'CANCEL all beta-blocker orders. Treat cocaine-associated tachycardia/hypertension with IV Benzodiazepines (Lorazepam 2-4 mg IV q5-10min).',
      textEs: 'CANCELE todas las órdenes de betabloqueadores. Trate la taquicardia/hipertensión asociada a cocaína con benzodiazepinas IV (Lorazepam 2-4 mg IV c/5-10min).',
    });
  }

  // 2. Specific Syndrome Management Directives
  if (syndrome === 'ncpe') {
    if (flags.has('pinkFrothySputum') || flags.has('refractoryHypoxia') || (!isNaN(spo2) && spo2 < 88)) {
      if (priority !== 'critical-fatal') priority = 'urgent';
      actions.push({
        priority: 'stat',
        text: 'Alveolar Recruitment Directive: Initiate non-invasive ventilation (CPAP or BiPAP with PEEP 8-12 cmH2O and 100% FiO2). Target SpO2 92-96%.',
        textEs: 'Directiva de Reclutamiento Alveolar: Iniciar ventilación no invasiva (CPAP o BiPAP con PEEP 8-12 cmH2O y FiO2 100%). Meta SpO2 92-96%.',
      });
      actions.push({
        priority: 'high',
        text: 'Prepare for endotracheal intubation with lung-protective ventilation (Vt 6 mL/kg PBW, PEEP 10-14 cmH2O) if somnolent, exhausted, or vomiting.',
        textEs: 'Preparar intubación endotraqueal con ventilación de protección pulmonar (Vt 6 mL/kg peso predicho, PEEP 10-14 cmH2O) si presenta somnolencia, agotamiento o vómitos.',
      });
    }
  } else if (syndrome === 'aspiration') {
    if (!isNaN(hoursPostAsp) && hoursPostAsp >= 48) {
      actions.push({
        priority: 'high',
        text: 'Delayed Secondary Infection Assessment (> 48h): Evaluate for bacterial pneumonia (fever > 38.3°C, purulent sputum, WBC > 15,000/uL). If criteria met, initiate Ampicillin-Sulbactam 3g IV q6h.',
        textEs: 'Evaluación de Infección Secundaria Tardía (> 48h): Evaluar neumonía bacteriana (fiebre > 38.3°C, esputo purulento, leucocitos > 15,000/uL). Si cumple criterios, iniciar Ampicilina-Sulbactam 3g IV c/6h.',
      });
    } else {
      actions.push({
        priority: 'routine',
        text: 'Early Chemical Pneumonitis Supportive Phase (0-48h): Perform airway suctioning, administer nebulized Albuterol 2.5 mg for bronchospasm, and monitor SpO2 without antibiotics.',
        textEs: 'Fase de Soporte de Neumonitis Química Temprana (0-48h): Realizar aspiración de vía aérea, nebulizar Albuterol 2.5 mg para broncoespasmo y monitorizar SpO2 sin antibióticos.',
      });
    }
  } else if (syndrome === 'crackLung') {
    if (flags.has('hemoptysisMelanoptysis') || flags.has('diffuseGroundGlass')) {
      if (priority !== 'critical-fatal') priority = 'urgent';
      actions.push({
        priority: 'stat',
        text: 'Diffuse Alveolar Hemorrhage (DAH) Protocol: High-flow humidified oxygen, inhaled short-acting beta-agonists, and initiate IV Methylprednisolone 60-125 mg IV q6h (1-2 mg/kg/day).',
        textEs: 'Protocolo de Hemorragia Alveolar Difusa (HAD): Oxígeno humidificado de alto flujo, beta-agonistas inhalados e iniciar Metilprednisolona IV 60-125 mg c/6h (1-2 mg/kg/día).',
      });
      actions.push({
        priority: 'high',
        text: 'Pulmonology Consultation for bronchoscopy with serial bronchoalveolar lavage (BAL) to confirm hemosiderin-laden macrophages and rule out active endobronchial lesions.',
        textEs: 'Interconsulta a Neumología para broncoscopia con lavado broncoalveolar seriado para confirmar macrófagos con hemosiderina y descartar lesiones endobronquiales activas.',
      });
    }
  }

  if (actions.length === 0) {
    actions.push({
      priority: 'routine',
      text: 'Routine pulmonary observation, continuous pulse oximetry, and post-overdose harm reduction linkage.',
      textEs: 'Observación pulmonar de rutina, oximetría de pulso continua y vinculación a reducción de daños post-sobredosis.',
    });
  }

  return { priority, alerts, actions };
}

export function generatePulmonarySbar(state, lang = 'en') {
  const isEs = lang === 'es';
  const synd = PULMONARY_SYNDROMES[state.syndrome] || PULMONARY_SYNDROMES.ncpe;
  const evalResult = evaluatePulmonaryRisk(state);
  const flags = Array.from(state.checkedFlags || []);

  const flagLabels = flags.map((fId) => {
    const f = PULMONARY_CLINICAL_FLAGS.find((x) => x.id === fId);
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
Evaluación de síndrome pulmonar agudo peri-sobredosis. Cuadro clínico: ${synd.nameEs}. Nivel de urgencia: ${evalResult.priority.toUpperCase()}. Monitorización estricta sin persistencia de datos PII.

[B] ANTECEDENTES:
Contexto clínico: ${synd.pathophysiologyEs}
Banderas de alerta respiratoria y clínica:
${flagLabels.length ? flagLabels.map((l) => `  - ${l}`).join('\n') : '  - Sin banderas agudas activadas.'}
SpO2: ${state.spo2Value ? state.spo2Value + '%' : 'N/D'} | Horas post-aspiración: ${state.hoursPostAspiration || 'N/D'}.

[A] EVALUACIÓN RESPIRATORIA Y CONTRAINDICACIONES CRÍTICAS:
${alertsText || '• Sin contraindicaciones críticas inmediatas activadas.'}
ALERTA NEGRA: ${synd.blackBoxContraindicationEs}
${synd.contraindicationTextEs}

[R] DIRECTIVAS VENTILATORIAS Y PLAN DE MANEJO:
${actionsText}
Manejo de Primera Línea: ${synd.firstLineManagementEs}
Interconsulta de Emergencia: Cuidados Críticos / Neumología (Línea de soporte HarborPath).`;
  }

  return `[S] SITUATION:
Patient evaluated for high-acuity peri-overdose pulmonary syndrome. Clinical syndrome: ${synd.name}. Triage acuity: ${evalResult.priority.toUpperCase()}. Zero persistent PII stored in RAM.

[B] BACKGROUND:
Clinical context: ${synd.pathophysiology}
Active pulmonary and clinical trigger flags:
${flagLabels.length ? flagLabels.map((l) => `  - ${l}`).join('\n') : '  - No acute emergency flags selected.'}
SpO2: ${state.spo2Value ? state.spo2Value + '%' : 'N/A'} | Hours Post-Aspiration: ${state.hoursPostAspiration || 'N/A'}.

[A] PULMONARY ASSESSMENT & BLACK-BOX CONTRAINDICATIONS:
${alertsText || '• No immediate critical contraindications triggered.'}
BLACK-BOX WARNING: ${synd.blackBoxContraindication}
${synd.contraindicationText}

[R] RECOMMENDED VENTILATORY & MANAGEMENT DIRECTIVES:
${actionsText}
First-Line Management: ${synd.firstLineManagement}
Critical Consultation: Critical Care / Pulmonary Service.`;
}

// In-RAM Ephemeral State Controller
const createInitialState = () => ({
  syndrome: 'ncpe',
  checkedFlags: new Set(),
  spo2Value: '',
  hoursPostAspiration: '',
  diureticPlanned: false,
  prophylacticAbxGiven: false,
  betaBlockerConsidered: false,
});

let pulmonaryState = createInitialState();
const listeners = new Set();

export function getPulmonaryState() {
  return {
    ...pulmonaryState,
    checkedFlags: new Set(pulmonaryState.checkedFlags),
  };
}

export function updatePulmonaryState(patch) {
  pulmonaryState = {
    ...pulmonaryState,
    ...patch,
    checkedFlags: patch.checkedFlags ? new Set(patch.checkedFlags) : pulmonaryState.checkedFlags,
  };
  listeners.forEach((fn) => fn(getPulmonaryState()));
}

export function resetPulmonaryState() {
  pulmonaryState = createInitialState();
  listeners.forEach((fn) => fn(getPulmonaryState()));
}

export function subscribePulmonaryState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Accessible DOM View
export function periOverdosePulmonaryView() {
  const container = h('div', { class: 'pulmonary-view specialized-clinical-view' });
  const lang = getLang();
  const isEs = lang === 'es';

  // Header via common pageHeader
  const header = pageHeader(
    t('tools.item.peri-overdose-pulmonary.title', 'Peri-Overdose Pulmonary Syndromes & Non-Cardiogenic Edema Navigator'),
    t(
      'tools.item.peri-overdose-pulmonary.description',
      'Clinical triage for Post-Naloxone NCPE (PEEP recruitment vs loop diuretic prohibition), Mendelson chemical pneumonitis (48-hour prophylactic antibiotic prohibition), and "Crack Lung" DAH (corticosteroids vs beta-blocker prohibition).',
    ),
  );
  container.appendChild(header);

  // Dynamic Warning Banner Container
  const warningBannerContainer = h('div');
  container.appendChild(warningBannerContainer);

  // Grid
  const grid = h('div', { class: 'nsti-grid' });
  const leftCol = h('div', { class: 'nsti-col' });
  const rightCol = h('div', { class: 'nsti-col' });
  grid.appendChild(leftCol);
  grid.appendChild(rightCol);
  container.appendChild(grid);

  // Syndrome Card
  const syndSelect = h(
    'select',
    {
      class: 'nsti-select',
      'aria-label': isEs ? 'Seleccionar síndrome pulmonar' : 'Select pulmonary syndrome',
      onchange: (e) => updatePulmonaryState({ syndrome: e.target.value }),
    },
    Object.values(PULMONARY_SYNDROMES).map((item) =>
      h('option', { value: item.id, selected: item.id === getPulmonaryState().syndrome }, isEs ? item.nameEs : item.name),
    ),
  );
  const pathophysContainer = h('div', { class: 'nsti-stage-info' });
  const syndCard = h('div', { class: 'nsti-card' }, [
    h('h2', { class: 'nsti-card-title' }, isEs ? '1. Síndrome Pulmonar Peri-Sobredosis' : '1. Peri-Overdose Pulmonary Syndrome'),
    syndSelect,
    pathophysContainer,
  ]);
  leftCol.appendChild(syndCard);

  // Vitals Card
  const spo2Input = h('input', {
    id: 'spo2-input',
    type: 'number',
    class: 'nsti-num-input',
    placeholder: 'e.g. 84',
    value: getPulmonaryState().spo2Value,
    oninput: (e) => updatePulmonaryState({ spo2Value: e.target.value }),
  });
  const hoursInput = h('input', {
    id: 'hours-input',
    type: 'number',
    class: 'nsti-num-input',
    placeholder: 'e.g. 12',
    value: getPulmonaryState().hoursPostAspiration,
    oninput: (e) => updatePulmonaryState({ hoursPostAspiration: e.target.value }),
  });
  const vitalsCard = h('div', { class: 'nsti-card' }, [
    h('h2', { class: 'nsti-card-title' }, isEs ? '2. Signos Vitales y Parámetros Respiratorios' : '2. Key Respiratory Parameters'),
    h('div', { class: 'decon-input-group' }, [
      h('label', { for: 'spo2-input' }, isEs ? 'Oximetría SpO2 (% - Alerta si < 88% o < 92%):' : 'Pulse Oximetry SpO2 (% - Alert if < 88% or < 92%):'),
      spo2Input,
    ]),
    h('div', { class: 'decon-input-group' }, [
      h('label', { for: 'hours-input' }, isEs ? 'Horas Transcurridas Desde Aspiración (Regla de 48h):' : 'Hours Elapsed Since Aspiration Event (48h Rule):'),
      hoursInput,
    ]),
  ]);
  leftCol.appendChild(vitalsCard);

  // Flags Card
  const flagCheckboxes = [];
  const flagsCard = h('div', { class: 'nsti-card' }, [
    h('h2', { class: 'nsti-card-title' }, isEs ? '3. Banderas Clínicas y Riesgos de Resucitación' : '3. Clinical Flags & Resuscitation Risks'),
    h(
      'div',
      { class: 'decon-checkbox-group' },
      PULMONARY_CLINICAL_FLAGS.map((f) => {
        const cb = h('input', {
          type: 'checkbox',
          checked: getPulmonaryState().checkedFlags.has(f.id),
          onchange: (e) => {
            const set = new Set(getPulmonaryState().checkedFlags);
            if (e.target.checked) set.add(f.id);
            else set.delete(f.id);
            updatePulmonaryState({ checkedFlags: set });
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
  const directivesCardContainer = h('div');
  const sbarCardContainer = h('div');
  rightCol.appendChild(directivesCardContainer);
  rightCol.appendChild(sbarCardContainer);

  function renderDynamic() {
    const state = getPulmonaryState();
    const synd = PULMONARY_SYNDROMES[state.syndrome] || PULMONARY_SYNDROMES.ncpe;
    const evalResult = evaluatePulmonaryRisk(state);

    // Update Warning Banner
    clear(warningBannerContainer);
    warningBannerContainer.appendChild(
      h('div', { class: 'movement-blackbox-banner' }, [
        h('div', { class: 'movement-banner-header' }, [
          h('strong', {}, isEs ? 'ALERTA NEGRA RESPIRATORIA: ' + synd.blackBoxContraindicationEs : 'BLACK-BOX RESPIRATORY ALERT: ' + synd.blackBoxContraindication),
        ]),
        h('p', {}, isEs ? synd.contraindicationTextEs : synd.contraindicationText),
      ]),
    );

    // Update Pathophys Info
    clear(pathophysContainer);
    pathophysContainer.appendChild(h('strong', {}, isEs ? 'Fisiopatología: ' : 'Pathophysiology: '));
    pathophysContainer.appendChild(h('span', {}, isEs ? synd.pathophysiologyEs : synd.pathophysiology));

    // Update Directives Card
    clear(directivesCardContainer);
    directivesCardContainer.appendChild(
      h('div', { class: 'nsti-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? '4. Directivas Ventilatorias y Farmacológicas' : '4. Ventilatory & Pharmacologic Directives'),
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
          h('strong', {}, isEs ? 'Manejo Ventilatorio de Primera Línea: ' : 'First-Line Ventilatory Management: '),
          h('p', { class: 'decon-directive-text' }, isEs ? synd.firstLineManagementEs : synd.firstLineManagement),
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

    // Update SBAR Handoff Card
    const sbarText = generatePulmonarySbar(state, lang);
    clear(sbarCardContainer);
    const sbarTextarea = h(
      'textarea',
      {
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
          resetPulmonaryState();
          spo2Input.value = '';
          hoursInput.value = '';
          syndSelect.value = 'ncpe';
          flagCheckboxes.forEach((f) => { f.input.checked = false; });
        },
      },
      isEs ? 'Reiniciar Formulario' : 'Reset Form',
    );

    sbarCardContainer.appendChild(
      h('div', { class: 'nsti-card' }, [
        h('h2', { class: 'nsti-card-title' }, isEs ? '5. Nota SBAR de Transferencia Respiratoria (Cero PII)' : '5. Zero-PII SBAR Respiratory Handoff Note'),
        sbarTextarea,
        h('div', { class: 'nsti-btn-row' }, [copyBtn, resetBtn]),
      ]),
    );
  }

  const unsubscribe = subscribePulmonaryState(() => {
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
