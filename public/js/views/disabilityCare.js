/**
 * Disability, Neurodiversity & Accessible SUD Care Specialist View (public/js/views/disabilityCare.js)
 *
 * Trauma-informed clinical, statutory, and sensory accommodation guidance for
 * individuals with physical disabilities, sensory disabilities, neurodivergence
 * (Autism, ADHD), and chronic pain navigating substance use disorder care:
 *
 * 1. Federal Disability Protections:
 *    - Americans with Disabilities Act (ADA Title II & Title III; 42 U.S.C. § 12182) and Section 504 of
 *      the Rehabilitation Act (29 U.S.C. § 794) mandating physical access, auxiliary aids, and program access.
 *    - Service Animal Protections (28 C.F.R. § 35.136 & § 36.302(c)): Absolute legal right to service dogs in
 *      outpatient clinics and residential treatment. Only two questions legally permitted; no certification papers required.
 *    - Effective Communication Mandates (28 C.F.R. § 35.160): Qualified ASL interpreters, CART captioning,
 *      braille, and large print provided at zero cost to the client.
 *
 * 2. Neurodiversity & Sensory Accommodations (Autism & ADHD):
 *    - Sensory overload management in residential rehab: quiet decompression spaces, noise-canceling headphones,
 *      and modified alternatives to mandatory high-stimulus group therapy.
 *    - Executive function scaffolding: visual schedules, blister packs, and simplified intake questionnaires.
 *    - Evidence-based dual-diagnosis ADHD care: non-stimulant medications (atomoxetine, viloxazine, bupropion) or
 *      structured extended-release formulations under coordinated clinical oversight.
 *
 * 3. Chronic Pain & Intractable Physical Disability:
 *    - CDC 2022 Clinical Practice Guideline for Prescribing Opioids: Explicit warnings against rapid, involuntary,
 *      or forced opioid tapering.
 *    - Dual-action buprenorphine pharmacotherapy for concurrent chronic pain and opioid use disorder.
 *
 * Strict Invariants:
 * - Zero npm dependencies (plain ES modules).
 * - Zero PII: 100% ephemeral in-RAM state. Never writes user answers to URLs, device storage, or cookies.
 * - Accessible DOM construction via h() (document.createElement, textContent, setAttribute).
 *   ZERO direct markup string injection or inline style attributes.
 * - Complete bilingual parity (English / Spanish).
 */

import { h, clear, ext, tel, sms, icon, announce } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong } from './common.js';
import { t, getLang } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetDisabilityState);

// ============================================================================
// 1. Statutory Standards & Federal Protections
// ============================================================================

export const DISABILITY_CARE_STATUTES = [
  {
    id: 'ada_effective_communication',
    title: { en: 'Effective Communication Mandate (ASL & CART)', es: 'Mandato de Comunicación Efectiva (ASL y CART)' },
    citation: '28 C.F.R. § 35.160 / § 36.303',
    summary: {
      en: 'Healthcare and residential addiction facilities must provide qualified sign language interpreters (in-person or Video Remote Interpreting), CART realtime transcription, and accessible materials at ZERO cost to Deaf, hard of hearing, blind, or low-vision clients. Facilities cannot require family members to interpret.',
      es: 'Los centros de salud y residenciales deben proporcionar intérpretes calificados de lengua de señas (presencial o VRI), transcripción CART y materiales accesibles sin costo para personas sordas o con discapacidad visual. No pueden exigir que familiares traduzcan.',
    },
  },
  {
    id: 'ada_service_animals',
    title: { en: 'Federal Service Animal Protections in Treatment', es: 'Protección Federal para Animales de Servicio' },
    citation: '28 C.F.R. § 35.136 / § 36.302(c)',
    summary: {
      en: 'Trained service dogs must be permitted in all areas of outpatient clinics and residential rehabilitation where clients are allowed. Staff may only ask two questions: (1) Is the dog a service animal required because of a disability? and (2) What work or task has the dog been trained to perform? No special vest, registration, or medical documentation is required.',
      es: 'Los perros de servicio adiestrados tienen derecho a entrar en todas las áreas de clínicas y residencias donde se permita el paso de usuarios. El personal solo puede hacer dos preguntas: (1) ¿El perro es un animal de servicio requerido por una discapacidad? y (2) ¿Qué tarea fue entrenado para realizar? No se exige carnet ni chaleco.',
    },
  },
  {
    id: 'cdc_chronic_pain_guideline',
    title: { en: 'CDC 2022 Chronic Pain & Involuntary Tapering Protections', es: 'Pautas de los CDC 2022 sobre Dolor Crónico y Retiro Involuntario' },
    citation: 'CDC Clinical Practice Guideline (MMWR Recomm Rep 2022;71:1–95)',
    summary: {
      en: 'The CDC explicitly advises clinicians against abrupt, rapid, or involuntary tapering of long-term opioids, which triggers acute withdrawal, unmanaged pain crises, psychological distress, and elevated overdose risk. Buprenorphine is recognized as an effective, safer dual-action agent managing both chronic pain and OUD.',
      es: 'Los CDC desaconsejan explícitamente la reducción rápida o involuntaria de opioides a largo plazo, que desencadena abstinencia severa, dolor insoportable y sobredosis. La buprenorfina se reconoce como tratamiento eficaz de doble acción para dolor crónico y OUD.',
    },
  },
];

// ============================================================================
// 2. Sensory & Neurodivergent Accommodations Framework
// ============================================================================

export const SENSORY_ACCOMMODATION_STANDARDS = [
  {
    domain: { en: 'Sensory Decompression & Sound Management', es: 'Descompresión Sensorial y Manejo Acústico' },
    strategies: {
      en: [
        'Permission to use noise-canceling headphones or earplugs during free time and quiet hours.',
        'Access to a low-stimulation quiet room (dim lighting, minimal auditory noise) when overwhelmed.',
        'Fluorescent lighting mitigations (natural daylight, lamps, or light-filtering glasses).',
      ],
      es: [
        'Permiso para usar auriculares con cancelación de ruido o tapones en tiempo libre.',
        'Acceso a una sala tranquila de baja estimulación (luz tenue, sin ruido) ante sobrecarga sensorial.',
        'Atenuación de luz fluorescente (luz natural, lámparas cálidas o lentes con filtro).',
      ],
    },
  },
  {
    domain: { en: 'Modified Group Therapy & Communication', es: 'Terapia Grupal Modificada y Comunicación' },
    strategies: {
      en: [
        'Option for written reflection or 1-on-1 counselor check-ins when large group discussions induce shutdown.',
        'Clear, literal communication without ambiguous idioms or unspoken social expectations.',
        'Advance notice before daily routine changes, fire drills, or unexpected room changes.',
      ],
      es: [
        'Opción de reflexiones escritas o sesiones 1 a 1 cuando el grupo grande cause agotamiento o bloqueo.',
        'Comunicación clara y literal, evitando expresiones ambiguas o expectativas no explícitas.',
        'Aviso anticipado antes de cambios en la rutina, simulacros o cambios de habitación.',
      ],
    },
  },
  {
    domain: { en: 'Executive Function & Medication Scaffolding', es: 'Función Ejecutiva y Apoyo en Medicación' },
    strategies: {
      en: [
        'Blister packaging (bingo cards) or daily dose organizers to prevent missed doses or double-dosing.',
        'Visual schedules and alarm-based digital or peer reminders for group times and medication rounds.',
        'Assistance breaking down multi-step intake paperwork into manageable, bite-sized tasks.',
      ],
      es: [
        'Empaque en blíster o pastilleros diarios para evitar olvidos o duplicación de dosis.',
        'Horarios visuales y alarmas digitales o recordatorios para grupos y tomas de medicamentos.',
        'Apoyo para dividir formularios extensos de ingreso en pasos manejables y breves.',
      ],
    },
  },
];

// ============================================================================
// 3. In-RAM Decision Aid Engine: evaluateDisabilityCarePlan(inputs)
// ============================================================================

export function evaluateDisabilityCarePlan(inputs = {}) {
  const {
    disabilityTypes = [],            // ['mobility_physical', 'deaf_hard_of_hearing', 'blind_low_vision', 'autism_sensory', 'adhd_executive', 'chronic_pain']
    hasServiceAnimal = false,        // boolean
    seekingResidential = false,      // boolean
    currentPainStatus = 'none',      // 'none' | 'prescribed_opioids' | 'unmanaged_pain' | 'buprenorphine_dual'
    needsAuxiliaryCommunication = false, // boolean
  } = inputs;

  const rightsAlerts = [];
  const accommodations = [];
  const chronicPainAdvice = [];

  // 1. Service Animal Legal Rights
  if (hasServiceAnimal) {
    rightsAlerts.push({
      priority: 'high',
      title: { en: 'Absolute Right to Service Dog in Clinic & Residential Care', es: 'Derecho Absoluto a Perro de Servicio en Clínicas y Residencias' },
      detail: {
        en: 'Under 28 C.F.R. § 35.136, treatment facilities CANNOT exclude a trained service dog or charge extra cleaning deposits. Staff may only ask the two statutory questions and cannot demand proof of training or medical letters.',
        es: 'Bajo 28 C.F.R. § 35.136, los centros NO pueden excluir un perro de servicio ni cobrar depósitos adicionales. El personal solo puede hacer las dos preguntas de ley y no puede exigir certificados.',
      },
    });
  }

  // 2. Auxiliary Communication Rights (ASL / CART)
  const isDeafOrHardOfHearing = disabilityTypes.includes('deaf_hard_of_hearing');
  const isBlindOrLowVision = disabilityTypes.includes('blind_low_vision');

  if (needsAuxiliaryCommunication || isDeafOrHardOfHearing || isBlindOrLowVision) {
    rightsAlerts.push({
      priority: 'high',
      title: { en: 'Right to Free Auxiliary Aids & Qualified Medical Interpreters', es: 'Derecho a Intérpretes Médicos y Medios Auxiliares Gratuitos' },
      detail: {
        en: 'Under 28 C.F.R. § 35.160, you have the legal right to a qualified ASL interpreter (in-person or high-speed VRI) or accessible digital documents (screen-reader accessible, large print) at zero cost to you.',
        es: 'Bajo 28 C.F.R. § 35.160, tiene derecho legal a un intérprete calificado de ASL o documentos digitales accesibles (lectores de pantalla o letra grande) a costo cero.',
      },
    });
  }

  // 3. Neurodivergence & Sensory Accommodations (Autism & ADHD)
  const isAutistic = disabilityTypes.includes('autism_sensory');
  const hasAdhd = disabilityTypes.includes('adhd_executive');

  if (isAutistic || hasAdhd) {
    accommodations.push(...SENSORY_ACCOMMODATION_STANDARDS);

    if (hasAdhd) {
      rightsAlerts.push({
        priority: 'medium',
        title: { en: 'Coordinated ADHD Pharmacotherapy & SUD Treatment', es: 'Tratamiento Coordinado de TDAH y Adicciones' },
        detail: {
          en: 'Untreated ADHD is a major driver of substance use relapse. Discuss non-stimulant medications (atomoxetine, viloxazine, bupropion) or structured extended-release stimulants with tamper resistance under coordinated medical monitoring.',
          es: 'El TDAH no tratado es un factor importante de recaída. Valore medicamentos no estimulantes (atomoxetina, viloxazina, bupropión) o estimulantes de liberación prolongada bajo control médico.',
        },
      });
    }
  }

  // 4. Chronic Pain & Involuntary Tapering Protections
  const hasChronicPain = disabilityTypes.includes('chronic_pain') || currentPainStatus !== 'none';
  if (hasChronicPain) {
    if (currentPainStatus === 'prescribed_opioids') {
      chronicPainAdvice.push({
        title: { en: 'Protection Against Involuntary Rapid Tapering', es: 'Protección contra el Retiro Rápido o Involuntario de Opioides' },
        detail: {
          en: 'Per the CDC 2022 Clinical Practice Guideline, doctors should never abruptly cut off or rapidly taper patients on long-term opioids. If transitioning to MOUD, consider buprenorphine micro-induction ("Bernese Method") which treats both pain and addiction without agonizing withdrawal.',
          es: 'Según las pautas de los CDC 2022, los médicos nunca deben suspender o reducir bruscamente los opioides. Si hace transición a MOUD, considere la microinducción con buprenorfina (Método Bernés) para dolor y adicción sin abstinencia severa.',
        },
      });
    } else if (currentPainStatus === 'unmanaged_pain' || currentPainStatus === 'buprenorphine_dual') {
      chronicPainAdvice.push({
        title: { en: 'Buprenorphine Dual-Indication for Pain & OUD', es: 'Buprenorfina con Doble Indicación para Dolor y OUD' },
        detail: {
          en: 'Buprenorphine provides potent analgesic efficacy with a ceiling on respiratory depression. Taking divided doses (e.g., three or four times daily) often provides superior 24-hour chronic pain relief compared to once-daily dosing.',
          es: 'La buprenorfina ofrece potente alivio analgésico con un techo seguro en la depresión respiratoria. Dividir la dosis (tres o cuatro veces al día) suele brindar mejor control del dolor que una toma única.',
        },
      });
    }
  }

  // 5. Discussion Checklist for Intake / Clinical Staff
  const discussionItems = [
    {
      topic: { en: 'Service Animal Protocol', es: 'Protocolo de Animal de Servicio' },
      question: {
        en: 'I have a trained service dog. Can we document my dog’s presence and verify that rooming and common areas accommodate my service animal without extra fees?',
        es: 'Tengo un perro de servicio entrenado. ¿Podemos registrar su estancia y confirmar que la habitación y áreas comunes no cobrarán tarifas extras?',
      },
    },
    {
      topic: { en: 'Sensory Decompression & Group Therapy', es: 'Descompresión Sensorial y Terapia Grupal' },
      question: {
        en: 'Due to sensory processing / neurodivergence, can I have permission to use noise-canceling headphones during quiet periods and access a designated low-stimulus space?',
        es: 'Por sensibilidad sensorial / neurodivergencia, ¿puedo usar auriculares con cancelación de ruido y contar con un espacio de baja estimulación si me saturo?',
      },
    },
    {
      topic: { en: 'Chronic Pain & Dual MOUD Plan', es: 'Plan para Dolor Crónico y MOUD' },
      question: {
        en: 'Can we establish a coordinated pain and MOUD management plan (such as split-dose buprenorphine) ensuring my chronic pain is not ignored during addiction treatment?',
        es: '¿Podemos acordar un plan coordinado para dolor y MOUD (como buprenorfina dividida) asegurando que mi dolor crónico no sea ignorado?',
      },
    },
  ];

  return {
    evaluatedAt: new Date().toISOString(),
    inputs: {
      disabilityTypes,
      hasServiceAnimal,
      seekingResidential,
      currentPainStatus,
      needsAuxiliaryCommunication,
    },
    rightsAlerts,
    accommodations,
    chronicPainAdvice,
    discussionItems,
    statutes: DISABILITY_CARE_STATUTES,
  };
}

// ============================================================================
// 4. In-RAM Ephemeral State Management
// ============================================================================

let disabilityState = {
  disabilityTypes: ['mobility_physical', 'autism_sensory'],
  hasServiceAnimal: false,
  seekingResidential: false,
  currentPainStatus: 'prescribed_opioids',
  needsAuxiliaryCommunication: false,
  activeTab: 'decision_aid', // 'decision_aid' | 'service_animals' | 'neurodiversity' | 'ada_rights'
  lastEvaluation: null,
};

export function getDisabilityState() {
  return { ...disabilityState, disabilityTypes: [...disabilityState.disabilityTypes] };
}

export function setDisabilityState(partial) {
  disabilityState = { ...disabilityState, ...partial };
  return getDisabilityState();
}

export function resetDisabilityState() {
  disabilityState = {
    disabilityTypes: ['mobility_physical', 'autism_sensory'],
    hasServiceAnimal: false,
    seekingResidential: false,
    currentPainStatus: 'prescribed_opioids',
    needsAuxiliaryCommunication: false,
    activeTab: 'decision_aid',
    lastEvaluation: null,
  };
  return getDisabilityState();
}

// ============================================================================
// 5. Summary Text Formatter (Bilingual Copy/Print)
// ============================================================================

export function formatDisabilitySummaryText(plan, lang = 'en') {
  if (!plan) return '';
  const isEs = lang === 'es';
  const divider = '======================================================================';
  const subDivider = '----------------------------------------------------------------------';

  const lines = [
    divider,
    isEs
      ? 'PLAN DE ACCESIBILIDAD, NEURODIVERSIDAD Y DOLOR CRÓNICO - HARBORPATH'
      : 'ACCESSIBLE CARE, NEURODIVERSITY & CHRONIC PAIN PLAN - HARBORPATH',
    isEs
      ? 'Asistencia epímera en memoria | Cero rastreo | Confidencial'
      : 'In-RAM Ephemeral Decision Support | Zero Tracking | Confidential',
    divider,
    '',
    `${isEs ? 'Discapacidades reportadas' : 'Reported Accommodations'}: ${plan.inputs.disabilityTypes.join(', ') || (isEs ? 'Ninguna' : 'None')}`,
    `${isEs ? 'Animal de servicio' : 'Service Animal'}: ${plan.inputs.hasServiceAnimal ? (isEs ? 'Sí' : 'Yes') : (isEs ? 'No' : 'No')}`,
    `${isEs ? 'Estado de dolor crónico' : 'Chronic Pain Status'}: ${plan.inputs.currentPainStatus}`,
    '',
  ];

  if (plan.rightsAlerts.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'ALERTAS DE DERECHOS LEGALES (ADA Y SECCIÓN 504):' : 'LEGAL RIGHTS ALERTS (ADA & SECTION 504):');
    lines.push(subDivider);
    plan.rightsAlerts.forEach((alt) => {
      lines.push(`[${alt.priority.toUpperCase()}] ${isEs ? alt.title.es : alt.title.en}`);
      lines.push(`  ${isEs ? alt.detail.es : alt.detail.en}`);
    });
    lines.push('');
  }

  if (plan.chronicPainAdvice.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'ORIENTACIÓN SOBRE DOLOR CRÓNICO (PAUTAS CDC 2022):' : 'CHRONIC PAIN GUIDANCE (CDC 2022 GUIDELINE):');
    lines.push(subDivider);
    plan.chronicPainAdvice.forEach((cp) => {
      lines.push(`* ${isEs ? cp.title.es : cp.title.en}`);
      lines.push(`  ${isEs ? cp.detail.es : cp.detail.en}`);
    });
    lines.push('');
  }

  lines.push(subDivider);
  lines.push(isEs ? 'PREGUNTAS SUGERIDAS PARA EL CENTRO DE TRATAMIENTO:' : 'SUGGESTED CLINIC DISCUSSION QUESTIONS:');
  lines.push(subDivider);
  plan.discussionItems.forEach((d) => {
    lines.push(`- [ ] (${isEs ? d.topic.es : d.topic.en}) ${isEs ? d.question.es : d.question.en}`);
  });

  lines.push('');
  lines.push(divider);
  lines.push(
    isEs
      ? 'Línea de Información ADA del Departamento de Justicia: 1-800-514-0301'
      : 'DOJ ADA Information Line: 1-800-514-0301 (Free, federal disability guidance)'
  );
  lines.push(divider);

  return lines.join('\n');
}

// ============================================================================
// 6. Accessible DOM View: disabilityCareView(containerOrOptions, maybeOptions)
// ============================================================================

export function disabilityCareView(containerOrOptions = {}, maybeOptions = {}) {
  let container = null;
  let options = maybeOptions;
  if (containerOrOptions && (typeof containerOrOptions.append === 'function' || containerOrOptions.nodeType || containerOrOptions.tagName)) {
    container = containerOrOptions;
  } else {
    options = containerOrOptions || {};
  }
  if (container) clear(container);

  const lang = getLang();
  const isEs = lang === 'es';

  // Evaluate current state
  const plan = evaluateDisabilityCarePlan(getDisabilityState());
  setDisabilityState({ lastEvaluation: plan });

  const root = h('div', { class: 'disability-care-view' });

  // Page Header
  const header = pageHeader(
    isEs ? 'Accesibilidad, Neurodiversidad y Dolor Crónico en Adicciones' : 'Disability, Neurodiversity & Accessible SUD Care',
    isEs
      ? 'Derechos bajo la ley ADA para personas con discapacidad física, sordas o ciegas, animales de servicio, adaptaciones sensoriales para Autismo/TDAH y manejo no punitivo del dolor crónico.'
      : 'Federal ADA rights, service animal protections, sensory accommodations for Autism and ADHD, and non-abandonment chronic pain management in addiction care.'
  );
  root.append(header);

  // In-RAM Privacy Banner
  const privacyAlert = h(
    'div',
    { class: 'panel alert-panel', role: 'note', 'aria-label': isEs ? 'Privacidad' : 'Privacy' },
    h('div', { class: 'panel-header' },
      icon('shield', { class: 'panel-icon' }),
      h('h2', { class: 'panel-title' }, isEs ? 'Asistencia Epímera en Memoria' : 'In-RAM Ephemeral Decision Support')
    ),
    h('p', { class: 'panel-body' },
      isEs
        ? 'Todas las opciones de discapacidad y salud se procesan exclusivamente en la memoria del navegador. No se guardan datos en el disco ni se comparten. Se restablecen con Salida Rápida.'
        : 'All disability and accommodation selections are evaluated in temporary browser memory only without persistence. Cleared immediately upon Quick Exit.'
    )
  );
  root.append(privacyAlert);

  // Tab Navigation Bar
  const tabNav = h('div', { class: 'tab-bar', role: 'tablist', 'aria-label': isEs ? 'Secciones de accesibilidad' : 'Accessibility sections' });
  const tabs = [
    { id: 'decision_aid', label: isEs ? 'Evaluador de Adaptaciones' : 'Accommodations Screener' },
    { id: 'service_animals', label: isEs ? 'Animales de Servicio' : 'Service Animals' },
    { id: 'neurodiversity', label: isEs ? 'Autismo y TDAH' : 'Sensory & ADHD' },
    { id: 'ada_rights', label: isEs ? 'Derechos ADA y Dolor' : 'ADA Rights & Pain' },
  ];

  const currentTab = disabilityState.activeTab;

  tabs.forEach((tab) => {
    const isSelected = tab.id === currentTab;
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `tab-btn-dc-${tab.id}`,
      'data-tab': tab.id,
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-controls': `tab-panel-dc-${tab.id}`,
      class: isSelected ? 'tab active' : 'tab',
    }, tab.label);

    btn.addEventListener('click', () => {
      setDisabilityState({ activeTab: tab.id });
      disabilityCareView(container, options);
    });

    tabNav.append(btn);
  });
  root.append(tabNav);

  // Active Tab Panel
  const tabPanel = h('div', {
    id: `tab-panel-dc-${currentTab}`,
    role: 'tabpanel',
    'aria-labelledby': `tab-btn-dc-${currentTab}`,
    class: 'tab-content-panel',
  });

  // --------------------------------------------------------------------------
  // TAB 1: Decision Aid
  // --------------------------------------------------------------------------
  if (currentTab === 'decision_aid') {
    const formCard = h('div', { class: 'card assessment-card' });
    formCard.append(h('h3', { class: 'card-title' }, isEs ? 'Configuración de Necesidades y Adaptaciones' : 'Accommodation & Access Needs Assessment'));

    const formGrid = h('div', { class: 'form-grid' });

    // Service Animal
    const saGroup = h('div', { class: 'form-group' });
    saGroup.append(h('label', { for: 'dc-sa-select' }, isEs ? '¿Utiliza un perro de servicio entrenado?' : 'Do you use a trained service dog?'));
    const saSelect = h('select', { id: 'dc-sa-select', class: 'input-select' });
    [
      { val: 'false', label: isEs ? 'No' : 'No' },
      { val: 'true', label: isEs ? 'Sí, perro de servicio para discapacidad' : 'Yes, service dog for disability' },
    ].forEach((opt) => {
      const optionEl = h('option', { value: opt.val }, opt.label);
      if (String(disabilityState.hasServiceAnimal) === opt.val) optionEl.setAttribute('selected', 'selected');
      saSelect.append(optionEl);
    });
    saSelect.addEventListener('change', (e) => {
      setDisabilityState({ hasServiceAnimal: e.target.value === 'true' });
      disabilityCareView(container, options);
    });
    saGroup.append(saSelect);
    formGrid.append(saGroup);

    // Pain Status
    const painGroup = h('div', { class: 'form-group' });
    painGroup.append(h('label', { for: 'dc-pain-select' }, isEs ? 'Estado actual de dolor crónico:' : 'Current chronic pain management status:'));
    const painSelect = h('select', { id: 'dc-pain-select', class: 'input-select' });
    [
      { val: 'none', label: isEs ? 'Sin dolor crónico significativo' : 'No significant chronic pain' },
      { val: 'prescribed_opioids', label: isEs ? 'Opioides recetados a largo plazo (Riesgo de retiro involuntario)' : 'Prescribed long-term opioids (Risk of forced taper)' },
      { val: 'unmanaged_pain', label: isEs ? 'Dolor crónico severo no controlado' : 'Severe unmanaged chronic pain' },
      { val: 'buprenorphine_dual', label: isEs ? 'Tratamiento con buprenorfina para dolor y adicción' : 'Buprenorphine dual-indication for pain & OUD' },
    ].forEach((opt) => {
      const optionEl = h('option', { value: opt.val }, opt.label);
      if (disabilityState.currentPainStatus === opt.val) optionEl.setAttribute('selected', 'selected');
      painSelect.append(optionEl);
    });
    painSelect.addEventListener('change', (e) => {
      setDisabilityState({ currentPainStatus: e.target.value });
      disabilityCareView(container, options);
    });
    painGroup.append(painSelect);
    formGrid.append(painGroup);

    // Auxiliary communication
    const auxGroup = h('div', { class: 'form-group' });
    auxGroup.append(h('label', { for: 'dc-aux-select' }, isEs ? '¿Requiere intérprete de ASL o comunicación adaptada?' : 'Need ASL interpreter or accessible communication?'));
    const auxSelect = h('select', { id: 'dc-aux-select', class: 'input-select' });
    [
      { val: 'false', label: isEs ? 'No' : 'No' },
      { val: 'true', label: isEs ? 'Sí, ASL, CART o subtítulos en tiempo real' : 'Yes, ASL interpreter, CART or captioning' },
    ].forEach((opt) => {
      const optionEl = h('option', { value: opt.val }, opt.label);
      if (String(disabilityState.needsAuxiliaryCommunication) === opt.val) optionEl.setAttribute('selected', 'selected');
      auxSelect.append(optionEl);
    });
    auxSelect.addEventListener('change', (e) => {
      setDisabilityState({ needsAuxiliaryCommunication: e.target.value === 'true' });
      disabilityCareView(container, options);
    });
    auxGroup.append(auxSelect);
    formGrid.append(auxGroup);

    formCard.append(formGrid);
    tabPanel.append(formCard);

    // Results Box
    const resBox = h('div', { class: 'card results-box' });
    resBox.append(h('h4', { class: 'card-title' }, isEs ? 'Pautas de Adaptación y Derechos' : 'Identified Rights & Accommodations'));

    if (plan.rightsAlerts.length > 0) {
      plan.rightsAlerts.forEach((alt) => {
        const altCard = h('div', { class: 'panel alert-panel alert-warning' });
        altCard.append(h('h5', { class: 'alert-title' }, icon('shield', { class: 'alert-icon' }), isEs ? alt.title.es : alt.title.en));
        altCard.append(p(isEs ? alt.detail.es : alt.detail.en));
        resBox.append(altCard);
      });
    }

    if (plan.chronicPainAdvice.length > 0) {
      plan.chronicPainAdvice.forEach((cp) => {
        const cpBox = h('div', { class: 'card pain-card' });
        cpBox.append(h('h5', { class: 'pain-title' }, icon('check', { class: 'check-icon' }), isEs ? cp.title.es : cp.title.en));
        cpBox.append(p(isEs ? cp.detail.es : cp.detail.en));
        resBox.append(cpBox);
      });
    }

    // Discussion Checklist
    const discBox = h('div', { class: 'checklist-stack' });
    discBox.append(h('h5', { class: 'stack-title' }, isEs ? 'Preguntas de Adaptación para su Clínica:' : 'Accommodation Questions for Your Clinic:'));
    plan.discussionItems.forEach((d) => {
      const itemEl = h('div', { class: 'checklist-item' });
      itemEl.append(h('span', { class: 'topic-badge' }, isEs ? d.topic.es : d.topic.en));
      itemEl.append(p(isEs ? d.question.es : d.question.en));
      discBox.append(itemEl);
    });
    resBox.append(discBox);

    tabPanel.append(resBox);
  }

  // --------------------------------------------------------------------------
  // TAB 2: Service Animals
  // --------------------------------------------------------------------------
  if (currentTab === 'service_animals') {
    const saCard = h('div', { class: 'card info-card' });
    saCard.append(h('h3', { class: 'card-title' }, isEs ? 'Derechos de Animales de Servicio en Centros de Salud (28 C.F.R. § 35.136)' : 'Federal Service Animal Rights in Treatment Facilities'));
    saCard.append(p(
      isEs
        ? 'Bajo el Título II y III de la ley ADA, los centros de tratamiento para adicciones (ambulatorios y residenciales) están legalmente obligados a permitir la entrada de perros de servicio entrenados.'
        : 'Under ADA Titles II & III, addiction treatment centers (both outpatient and residential) are legally required to admit trained service dogs accompanying individuals with disabilities.'
    ));

    const rulesGrid = h('div', { class: 'rules-grid' });
    rulesGrid.append(h('div', { class: 'rule-card' },
      h('h4', {}, isEs ? 'Las Únicas 2 Preguntas Permitidas' : 'The Only Two Legally Permitted Questions'),
      p(isEs
        ? 'El personal solo puede preguntar: (1) ¿El perro es un animal de servicio requerido por una discapacidad? y (2) ¿Qué tarea o trabajo fue entrenado para realizar?'
        : 'Staff may only ask: (1) Is the dog a service animal required because of a disability? and (2) What work or task has the dog been trained to perform?'
      )
    ));
    rulesGrid.append(h('div', { class: 'rule-card' },
      h('h4', {}, isEs ? 'Prohibido Exigir Documentos o Cuotas' : 'Prohibited Demands & Fees'),
      p(isEs
        ? 'Los centros NO pueden exigir certificados de entrenamiento, carnets, chalecos especiales ni cobrar depósitos o tarifas adicionales por el perro.'
        : 'Facilities CANNOT require certification paperwork, special vests, medical proof, or charge surcharges/cleaning fees.'
      )
    ));
    saCard.append(rulesGrid);
    tabPanel.append(saCard);
  }

  // --------------------------------------------------------------------------
  // TAB 3: Neurodiversity & Sensory
  // --------------------------------------------------------------------------
  if (currentTab === 'neurodiversity') {
    const sensCard = h('div', { class: 'card info-card' });
    sensCard.append(h('h3', { class: 'card-title' }, isEs ? 'Adaptaciones Sensoriales y Neurodiversidad (Autismo y TDAH)' : 'Sensory Accommodations & Neurodiversity (Autism & ADHD)'));

    SENSORY_ACCOMMODATION_STANDARDS.forEach((sec) => {
      const box = h('div', { class: 'strategy-box' });
      box.append(h('h4', { class: 'strategy-title' }, isEs ? sec.domain.es : sec.domain.en));
      const uList = h('ul', { class: 'bullet-list' });
      (isEs ? sec.strategies.es : sec.strategies.en).forEach((st) => {
        uList.append(h('li', {}, st));
      });
      box.append(uList);
      sensCard.append(box);
    });

    tabPanel.append(sensCard);
  }

  // --------------------------------------------------------------------------
  // TAB 4: ADA Rights & Pain
  // --------------------------------------------------------------------------
  if (currentTab === 'ada_rights') {
    const statutesCard = h('div', { class: 'card info-card' });
    statutesCard.append(h('h3', { class: 'card-title' }, isEs ? 'Estatutos Federales de Accesibilidad y Pautas de Dolor CDC' : 'Federal Accessibility Statutes & CDC Pain Guidelines'));

    DISABILITY_CARE_STATUTES.forEach((st) => {
      const sBox = h('div', { class: 'statute-box' });
      sBox.append(h('h4', { class: 'statute-title' }, isEs ? st.title.es : st.title.en));
      sBox.append(h('span', { class: 'statute-cite' }, st.citation));
      sBox.append(p(isEs ? st.summary.es : st.summary.en));
      statutesCard.append(sBox);
    });

    tabPanel.append(statutesCard);
  }

  root.append(tabPanel);

  // Summary Actions (Print/Copy/Reset)
  const actions = h('div', { class: 'actions-row' });
  const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' }, isEs ? 'Copiar Plan de Accesibilidad' : 'Copy Accessibility Plan');
  copyBtn.addEventListener('click', async () => {
    const text = formatDisabilitySummaryText(plan, lang);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = isEs ? '¡Copiado!' : 'Copied!';
        announce(isEs ? 'Plan copiado' : 'Plan copied to clipboard');
        setTimeout(() => {
          copyBtn.textContent = isEs ? 'Copiar Plan de Accesibilidad' : 'Copy Accessibility Plan';
        }, 2500);
      } catch {
        // Fallback or ignore
      }
    }
  });
  actions.append(copyBtn);

  const resetBtn = h('button', { type: 'button', class: 'btn btn-ghost' }, isEs ? 'Restablecer' : 'Reset');
  resetBtn.addEventListener('click', () => {
    resetDisabilityState();
    disabilityCareView(container, options);
  });
  actions.append(resetBtn);

  root.append(actions);

  if (container) {
    container.append(root);
  }
  return root;
}

