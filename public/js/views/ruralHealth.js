/**
 * Rural & Frontier Health Specialist View (public/js/views/ruralHealth.js)
 *
 * Trauma-informed clinical and navigation guidance for individuals in rural,
 * frontier, and geographically isolated communities seeking substance use disorder
 * care, harm reduction, and healthcare transportation:
 *
 * 1. Rural Health Clinic (RHC) & Migrant Health Center Framework:
 *    - Rural Health Clinics authorized under Social Security Act § 1861(aa) (42 U.S.C. § 1395x(aa)).
 *    - Migrant Health Centers under Public Health Service Act § 330(g) (42 U.S.C. § 254b(g)) serving
 *      seasonal and migratory agricultural workers regardless of permanent address or immigration status.
 *
 * 2. Medicaid Non-Emergency Medical Transportation (NEMT) Rights:
 *    - Mandatory federal assurance under 42 C.F.R. § 431.53 requiring states to ensure necessary transportation
 *      to and from covered medical appointments, MOUD clinics, and pharmacies.
 *    - Protocols for booking (48-72 hour advance scheduling), gas mileage reimbursement, and transit passes.
 *
 * 3. Mail-Order Harm Reduction & Remote Overdose Prevention:
 *    - Free, discrete mail delivery of naloxone and drug-checking test strips (NextDistro model).
 *    - Telephone-based virtual spotters: Never Use Alone (1-800-484-3731) and SafeSpot (1-800-972-0590).
 *
 * 4. Agricultural & Farmworker Substance Safety:
 *    - Heat stress, severe dehydration, and hyperthermia risks when stimulants are used in agricultural labor.
 *    - Organophosphate pesticide interactions with sedatives and cholinergic pathways.
 *
 * Strict Invariants:
 * - Zero npm dependencies (Node 20+ built-ins only, plain ES modules).
 * - Zero PII: 100% ephemeral in-RAM state. Never writes user answers to URLs, device storage, or cookies.
 * - Accessible DOM construction via h() (document.createElement, textContent, setAttribute).
 *   ZERO direct markup string injection or inline style attributes.
 * - Complete bilingual parity (English / Spanish).
 */

import { h, clear, ext, tel, sms, icon, copyText, syncTablists, wireTablistKeyboard } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong } from './common.js';
import { t, getLang } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetRuralHealthState);

// ============================================================================
// 1. Statutory Frameworks & Rural Standards
// ============================================================================

export const RURAL_HEALTH_STATUTES = [
  {
    id: 'rhc_statute',
    title: { en: 'Rural Health Clinics Act (RHC Program)', es: 'Ley de Centros de Salud Rurales (Programa RHC)' },
    citation: 'Social Security Act § 1861(aa) (42 U.S.C. § 1395x(aa))',
    summary: {
      en: 'Rural Health Clinics receive specialized Medicare and Medicaid reimbursement to provide primary healthcare and outpatient MOUD in non-urbanized Health Professional Shortage Areas (HPSAs). RHCs must utilize physician assistants or nurse practitioners for at least 50% of operating hours.',
      es: 'Los Centros de Salud Rurales reciben reembolsos especiales de Medicare y Medicaid para brindar atención primaria y MOUD ambulatorio en áreas con escasez de profesionales. Deben contar con asistentes médicos o enfermeros de práctica avanzada al menos el 50% del tiempo.',
    },
  },
  {
    id: 'nemt_statute',
    title: { en: 'Mandatory Medicaid Transportation (NEMT)', es: 'Transporte Médico No Urgente Obligatorio de Medicaid (NEMT)' },
    citation: '42 C.F.R. § 431.53',
    summary: {
      en: 'Federal regulations legally obligate all state Medicaid programs to guarantee Non-Emergency Medical Transportation (NEMT) to covered medical appointments, daily OTP methadone dosing, and pharmacies. States offer gas mileage reimbursement, taxi/rideshare vouchers, or volunteer driver programs.',
      es: 'Las regulaciones federales obligan a todos los programas estatales de Medicaid a garantizar transporte médico no urgente (NEMT) para citas médicas, dosificación de metadona y farmacias. Incluye reembolso de gasolina, vales de taxi o conductores voluntarios.',
    },
  },
  {
    id: 'migrant_health_statute',
    title: { en: 'Migrant & Seasonal Agricultural Worker Health', es: 'Salud para Trabajadores Agrícolas Migrantes y de Temporada' },
    citation: 'Public Health Service Act § 330(g) (42 U.S.C. § 254b(g))',
    summary: {
      en: 'Federally funded Migrant Health Centers provide comprehensive medical, dental, and addiction services to farmworkers and their families regardless of permanent residence, agricultural season, or immigration status, using sliding-fee discount scales.',
      es: 'Los Centros de Salud para Migrantes financiados con fondos federales ofrecen atención médica, dental y de adicciones a trabajadores agrícolas y sus familias, sin importar residencia fija, temporada laboral ni estatus migratorio.',
    },
  },
];

// ============================================================================
// 2. Rural Transportation & Harm Reduction Frameworks
// ============================================================================

export const NEMT_SCHEDULING_RULES = {
  standardAdvanceHours: 48,
  urgentWaiverHours: 24,
  coveredDestinations: [
    { en: 'Daily Opioid Treatment Programs (OTPs) for Methadone dosing', es: 'Programas de Tratamiento de Opioides (OTP) para dosificación de metadona' },
    { en: 'Office-Based Opioid Treatment (OBOT) for Buprenorphine', es: 'Consultas médicas para receta de buprenorfina' },
    { en: 'Pharmacy prescription pick-ups for MOUD and Naloxone', es: 'Recogida de medicamentos MOUD y naloxona en farmacias' },
    { en: 'Residential inpatient admissions and discharge transit', es: 'Ingresos y traslados de alta en centros residenciales' },
  ],
  mileageReimbursementGuidance: {
    en: 'If you have a personal vehicle or a friend/family member who can drive you, Medicaid will reimburse mileage (often 20-30 cents per mile) through a simple driver trip-log signed by your clinic.',
    es: 'Si tiene vehículo propio o un amigo o familiar que pueda llevarle, Medicaid reembolsa el kilometraje mediante una hoja de registro de viajes firmada por su clínica.',
  },
};

export const MAIL_HARM_REDUCTION_STANDARDS = [
  {
    service: 'NEXT Distro (NextDistro.org)',
    type: 'Naloxone & Drug Checking by Mail',
    availability: {
      en: 'Delivers free injectable or nasal naloxone and fentanyl/xylazine test strips discreetly by US Postal Service to rural and underserved ZIP codes where in-person syringe programs are unavailable.',
      es: 'Envía naloxona inyectable o nasal y tiras reactivas de fentanilo/xilazina de forma gratuita y discreta por correo a códigos postales rurales sin programas presenciales.',
    },
  },
  {
    service: 'Never Use Alone (1-800-484-3731)',
    type: 'Virtual Peer Overdose Spotter',
    availability: {
      en: 'Trained peer operators remain on an open phone line while you use. If you become unresponsive, they immediately alert local county EMS to your physical coordinates.',
      es: 'Operadores pares permanecen en la línea telefónica mientras usted consume. Si deja de responder, alertan de inmediato a los servicios de emergencia (EMS) locales.',
    },
  },
  {
    service: 'SafeSpot Overdose Prevention Line (1-800-972-0590)',
    type: '24/7 Peer Safety Line',
    availability: {
      en: 'Confidential 24/7 peer support hotline that dispatches chosen emergency contacts or EMS if a caller stops answering during drug consumption.',
      es: 'Línea confidencial 24/7 con personas con experiencia vivida que contactan a un allegado o al 911 si la persona deja de responder.',
    },
  },
];

// ============================================================================
// 3. In-RAM Decision Aid Engine: evaluateRuralCarePlan(inputs)
// ============================================================================

export function evaluateRuralCarePlan(inputs = {}) {
  const {
    countyType = 'rural',                 // 'frontier' (<6 people/sq mi) | 'rural' | 'small_town'
    distanceToClinicMiles = 25,           // distance in miles
    hasPersonalVehicle = true,            // boolean
    medicaidEnrolled = true,              // boolean
    needsMailOrderHarmReduction = false,  // boolean
    isAgriculturalWorker = false,         // boolean
    interestedInTeleMoud = true,          // boolean
  } = inputs;

  const validMiles = Math.max(0, parseFloat(distanceToClinicMiles) || 0);
  const isFrontier = countyType === 'frontier' || validMiles >= 50;
  const transitHurdle = !hasPersonalVehicle || validMiles >= 30;

  const alerts = [];
  const transportationSolutions = [];
  const harmReductionPlan = [];

  // 1. Distance & Transportation Analysis
  if (transitHurdle) {
    if (medicaidEnrolled) {
      transportationSolutions.push({
        priority: 'high',
        title: { en: 'Medicaid NEMT Transit & Mileage Reimbursement', es: 'Transporte NEMT y Reembolso de Gasolina de Medicaid' },
        detail: {
          en: `Under 42 C.F.R. § 431.53, Medicaid MUST provide transit or pay mileage for your ${validMiles}-mile trip. Call your Medicaid plan transport broker 48 to 72 hours before your appointment. If a neighbor or family member drives you, request a Mileage Reimbursement Form.`,
          es: `Bajo 42 C.F.R. § 431.53, Medicaid DEBE brindarle transporte o pagar kilometraje para su trayecto de ${validMiles} millas. Llame a la central de transporte 48 a 72 horas antes de su cita o solicite el formulario de reembolso para quien le transporte.`,
        },
      });
    } else {
      transportationSolutions.push({
        priority: 'medium',
        title: { en: 'Rural Health Clinic (RHC) Community Transit Assistance', es: 'Asistencia de Transporte en Clínicas Rurales (RHC)' },
        detail: {
          en: 'Many Rural Health Clinics and Community Action Agencies offer volunteer driver programs, local gas card vouchers, or mobile health van services for patients lacking transportation.',
          es: 'Muchas Clínicas de Salud Rural y agencias comunitarias ofrecen conductores voluntarios, tarjetas de gasolina o unidades móviles para pacientes sin transporte propio.',
        },
      });
    }
  }

  // 2. Frontier Isolation & Tele-MOUD
  if (isFrontier && interestedInTeleMoud) {
    alerts.push({
      type: 'telehealth_priority',
      title: { en: 'Frontier Tele-MOUD Flexibility (Audio/Video Buprenorphine)', es: 'Telemedicina para MOUD en Zonas Aisladas (Buprenorfina)' },
      detail: {
        en: 'Federal DEA/SAMHSA telemedicine rules allow authorized clinicians to initiate and maintain buprenorphine through audio-video or telephone-only visits. This eliminates long-distance round trips to distant regional medical centers.',
        es: 'Las normativas federales de la DEA y SAMHSA permiten recetar buprenorfina por videollamada o teléfono, eliminando viajes agotadores a centros médicos lejanos.',
      },
    });
  }

  // 3. Agricultural Worker Health Protections
  if (isAgriculturalWorker) {
    alerts.push({
      type: 'farmworker_safety',
      title: { en: 'Migrant Health Center Rights & Farm Labor Safety', es: 'Derechos en Centros para Migrantes y Seguridad Laboral Agrícola' },
      detail: {
        en: 'Under Public Health Service Act § 330(g), Migrant Health Centers serve agricultural workers without requiring permanent local residency or immigration papers. CLINICAL SAFETY ALERT: Stimulant use during high-heat field labor dramatically elevates risk of fatal heat stroke and rhabdomyolysis; ensure constant hydration and scheduled shaded rest.',
        es: 'Bajo la ley § 330(g), los centros atienden a campesinos sin exigir residencia fija ni papeles. ADVERTENCIA CLÍNICA: El consumo de estimulantes bajo calor extremo eleva exponencialmente el riesgo de golpe de calor mortal; mantenga hidratación constante y descansos a la sombra.',
      },
    });
  }

  // 4. Mail-Order Harm Reduction Guidance
  if (needsMailOrderHarmReduction || isFrontier) {
    harmReductionPlan.push({
      title: { en: 'Discreet Naloxone & Test Strips by Mail (NEXT Distro)', es: 'Naloxona y Tiras Reactivas por Correo (NEXT Distro)' },
      detail: {
        en: 'If your rural county lacks a physical syringe exchange, order free intramuscular or nasal naloxone and fentanyl/xylazine test strips delivered in plain packaging to your mailbox via nextdistro.org.',
        es: 'Si su condado carece de programa presencial, solicite naloxona y tiras reactivas gratis enviadas en paquetes discretos a su buzón a través de nextdistro.org.',
      },
    });
  }

  // Always include virtual spotter lines for isolated areas
  harmReductionPlan.push({
    title: { en: 'Virtual Spotter: Never Use Alone (1-800-484-3731)', es: 'Acompañamiento Virtual: Never Use Alone (1-800-484-3731)' },
    detail: {
      en: 'Using substances alone in remote areas is the leading contributor to fatal overdose. Call Never Use Alone; a peer will stay on the line and send EMS to your location if you stop responding.',
      es: 'Consumir en soledad en zonas remotas es la causa principal de sobredosis mortales. Llame a Never Use Alone; un operador se mantendrá en línea y enviará ayuda si no responde.',
    },
  });

  // 5. Discussion Checklist for Rural Providers
  const discussionItems = [
    {
      topic: { en: 'Multi-Week Prescription Refills', es: 'Surtidos de Receta por Varias Semanas' },
      question: {
        en: 'Because I travel long rural distances, can we prescribe a 28-to-30 day supply of buprenorphine or medication to minimize travel frequency?',
        es: 'Dado que viajo largas distancias, ¿podemos programar recetas de 28 a 30 días para reducir la frecuencia de viajes?',
      },
    },
    {
      topic: { en: 'Medicaid Transportation Trip Log', es: 'Hoja de Registro de Viajes NEMT' },
      question: {
        en: 'Can your front desk sign my Medicaid NEMT trip-log or schedule my return transport so my transportation costs are covered?',
        es: '¿Puede recepción firmar mi hoja de registro de viajes de Medicaid para que se cubran mis gastos de transporte?',
      },
    },
    {
      topic: { en: 'Telehealth Hybrid Appointments', es: 'Citas Híbridas de Telemedicina' },
      question: {
        en: 'Can we conduct intermediate follow-up check-ins via video or phone, reserving in-person visits for quarterly assessments?',
        es: '¿Podemos realizar consultas de seguimiento intermedias por teléfono o video, dejando visitas presenciales solo para revisiones trimestrales?',
      },
    },
  ];

  return {
    evaluatedAt: new Date().toISOString(),
    inputs: {
      countyType,
      distanceToClinicMiles: validMiles,
      hasPersonalVehicle,
      medicaidEnrolled,
      needsMailOrderHarmReduction,
      isAgriculturalWorker,
      interestedInTeleMoud,
    },
    isFrontier,
    transitHurdle,
    alerts,
    transportationSolutions,
    harmReductionPlan,
    discussionItems,
    statutes: RURAL_HEALTH_STATUTES,
    schedulingRules: NEMT_SCHEDULING_RULES,
  };
}

// ============================================================================
// 4. In-RAM Ephemeral State Management
// ============================================================================

let ruralHealthState = {
  countyType: 'rural',
  distanceToClinicMiles: 25,
  hasPersonalVehicle: false,
  medicaidEnrolled: true,
  needsMailOrderHarmReduction: true,
  isAgriculturalWorker: false,
  interestedInTeleMoud: true,
  activeTab: 'decision_aid', // 'decision_aid' | 'nemt_transit' | 'mail_harm_reduction' | 'rhc_standards'
  lastEvaluation: null,
};

export function getRuralHealthState() {
  return { ...ruralHealthState };
}

export function setRuralHealthState(partial) {
  ruralHealthState = { ...ruralHealthState, ...partial };
  return getRuralHealthState();
}

export function resetRuralHealthState() {
  ruralHealthState = {
    countyType: 'rural',
    distanceToClinicMiles: 25,
    hasPersonalVehicle: false,
    medicaidEnrolled: true,
    needsMailOrderHarmReduction: true,
    isAgriculturalWorker: false,
    interestedInTeleMoud: true,
    activeTab: 'decision_aid',
    lastEvaluation: null,
  };
  return getRuralHealthState();
}

// ============================================================================
// 5. Summary Text Formatter (Bilingual Copy/Print)
// ============================================================================

export function formatRuralHealthSummaryText(plan, lang = 'en') {
  if (!plan) return '';
  const isEs = lang === 'es';
  const divider = '======================================================================';
  const subDivider = '----------------------------------------------------------------------';

  const lines = [
    divider,
    isEs
      ? 'PLAN DE SALUD RURAL Y ACCESO A TRANSPORTE - HARBORPATH'
      : 'RURAL & FRONTIER HEALTH CARE ACCESS PLAN - HARBORPATH',
    isEs
      ? 'Asistencia epímera en memoria | Cero rastreo | Confidencial'
      : 'In-RAM Ephemeral Decision Support | Zero Tracking | Confidential',
    divider,
    '',
    `${isEs ? 'Tipo de comunidad' : 'Community Type'}: ${plan.inputs.countyType.toUpperCase()}`,
    `${isEs ? 'Distancia a la clínica' : 'Distance to Clinic'}: ${plan.inputs.distanceToClinicMiles} miles`,
    `${isEs ? 'Vehículo personal' : 'Personal Vehicle'}: ${plan.inputs.hasPersonalVehicle ? (isEs ? 'Sí' : 'Yes') : (isEs ? 'No' : 'No')}`,
    `${isEs ? 'Inscrito/a en Medicaid' : 'Medicaid Enrolled'}: ${plan.inputs.medicaidEnrolled ? (isEs ? 'Sí' : 'Yes') : (isEs ? 'No' : 'No')}`,
    '',
  ];

  if (plan.alerts.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'ALERTAS DE ATENCIÓN Y SEGURIDAD:' : 'CARE & SAFETY ALERTS:');
    lines.push(subDivider);
    plan.alerts.forEach((alt) => {
      lines.push(`* ${isEs ? alt.title.es : alt.title.en}`);
      lines.push(`  ${isEs ? alt.detail.es : alt.detail.en}`);
    });
    lines.push('');
  }

  if (plan.transportationSolutions.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'SOLUCIONES DE TRANSPORTE RECOMENDADAS:' : 'RECOMMENDED TRANSPORTATION SOLUTIONS:');
    lines.push(subDivider);
    plan.transportationSolutions.forEach((sol) => {
      lines.push(`[${sol.priority.toUpperCase()}] ${isEs ? sol.title.es : sol.title.en}`);
      lines.push(`  ${isEs ? sol.detail.es : sol.detail.en}`);
    });
    lines.push('');
  }

  lines.push(subDivider);
  lines.push(isEs ? 'REDUCCIÓN DE DAÑOS Y PREVENCIÓN REMOTA:' : 'REMOTE HARM REDUCTION & OVERDOSE SAFETY:');
  lines.push(subDivider);
  plan.harmReductionPlan.forEach((hr) => {
    lines.push(`* ${isEs ? hr.title.es : hr.title.en}`);
    lines.push(`  ${isEs ? hr.detail.es : hr.detail.en}`);
  });
  lines.push('');

  lines.push(subDivider);
  lines.push(isEs ? 'PREGUNTAS SUGERIDAS PARA SU EQUIPO MÉDICO:' : 'RURAL CLINIC DISCUSSION CHECKLIST:');
  lines.push(subDivider);
  plan.discussionItems.forEach((d) => {
    lines.push(`- [ ] (${isEs ? d.topic.es : d.topic.en}) ${isEs ? d.question.es : d.question.en}`);
  });

  lines.push('');
  lines.push(divider);
  lines.push(
    isEs
      ? 'Never Use Alone: 1-800-484-3731 (Acompañamiento telefónico seguro 24/7)'
      : 'Never Use Alone: 1-800-484-3731 (Confidential phone spotter line 24/7)'
  );
  lines.push(divider);

  return lines.join('\n');
}

// ============================================================================
// 6. Accessible DOM View: ruralHealthView(containerOrOptions, maybeOptions)
// ============================================================================

export function ruralHealthView(containerOrOptions = {}, maybeOptions = {}) {
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
  const plan = evaluateRuralCarePlan(getRuralHealthState());
  setRuralHealthState({ lastEvaluation: plan });

  const root = h('div', { class: 'rural-health-view' });

  // Page Header
  const header = pageHeader(
    isEs ? 'Acceso a Salud Rural, Transporte y Reducción de Daños' : 'Rural & Frontier Health Care, Transit & Harm Reduction',
    isEs
      ? 'Orientación para superar barreras de distancia geográfica: transporte médico de Medicaid (NEMT), clínicas rurales RHC, tele-MOUD y distribución de naloxona por correo.'
      : 'Navigation guidance for rural and frontier communities: Medicaid transportation rights (NEMT), Rural Health Clinics (RHCs), tele-MOUD, and mail-order harm reduction.'
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
        ? 'Todas las opciones de distancia y transporte se evalúan en la memoria temporal del navegador sin persistencia. No se guarda información en el disco ni se comparte con terceros.'
        : 'All distance and transportation answers are evaluated in temporary browser memory only without persistence. Cleared immediately upon Quick Exit.'
    )
  );
  root.append(privacyAlert);

  // Tab Navigation Bar
  const tabNav = h('div', { class: 'tab-bar', role: 'tablist', 'aria-label': isEs ? 'Secciones de salud rural' : 'Rural health sections' });
  const tabs = [
    { id: 'decision_aid', label: isEs ? 'Evaluador de Acceso' : 'Access Screener' },
    { id: 'nemt_transit', label: isEs ? 'Transporte NEMT (Medicaid)' : 'Medicaid NEMT' },
    { id: 'mail_harm_reduction', label: isEs ? 'Naloxona por Correo' : 'Mail-Order Harm Reduction' },
    { id: 'rhc_standards', label: isEs ? 'Leyes y Clínicas RHC' : 'RHC Laws & Farmworkers' },
  ];

  const currentTab = ruralHealthState.activeTab;

  tabs.forEach((tab) => {
    const isSelected = tab.id === currentTab;
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `tab-btn-rh-${tab.id}`,
      'data-tab': tab.id,
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-controls': 'tab-panel-rh',
      tabindex: isSelected ? '0' : '-1',
      class: isSelected ? 'tab active' : 'tab',
    }, tab.label);

    btn.addEventListener('click', () => {
      setRuralHealthState({ activeTab: tab.id });
      ruralHealthView(container, options);
    });

    tabNav.append(btn);
  });
  root.append(tabNav);

  // Active Tab Panel
  const tabPanel = h('div', {
    id: 'tab-panel-rh',
    role: 'tabpanel',
    'aria-labelledby': `tab-btn-rh-${currentTab}`,
    class: 'tab-content-panel',
  });

  // --------------------------------------------------------------------------
  // TAB 1: Decision Aid
  // --------------------------------------------------------------------------
  if (currentTab === 'decision_aid') {
    const formCard = h('div', { class: 'card assessment-card' });
    formCard.append(h('h3', { class: 'card-title' }, isEs ? 'Evaluación de Barreras Geográficas y Transporte' : 'Rural Geographic & Transit Screener'));

    const formGrid = h('div', { class: 'form-grid' });

    // County Type
    const countyGroup = h('div', { class: 'form-group' });
    countyGroup.append(h('label', { for: 'rh-county-select' }, isEs ? 'Entorno de su comunidad:' : 'Community geographic setting:'));
    const countySelect = h('select', { id: 'rh-county-select', class: 'input-select' });
    [
      { id: 'rural', label: isEs ? 'Condado rural estándar' : 'Standard rural county' },
      { id: 'frontier', label: isEs ? 'Condado fronterizo aislado (<6 personas/milla²)' : 'Frontier county (<6 people/sq mile)' },
      { id: 'small_town', label: isEs ? 'Pueblo pequeño / no metropolitano' : 'Small town / micropolitan' },
    ].forEach((opt) => {
      const optionEl = h('option', { value: opt.id }, opt.label);
      if (ruralHealthState.countyType === opt.id) optionEl.setAttribute('selected', 'selected');
      countySelect.append(optionEl);
    });
    countySelect.addEventListener('change', (e) => {
      setRuralHealthState({ countyType: e.target.value });
      ruralHealthView(container, options);
    });
    countyGroup.append(countySelect);
    formGrid.append(countyGroup);

    // Distance to Clinic
    const distGroup = h('div', { class: 'form-group' });
    distGroup.append(h('label', { for: 'rh-dist-select' }, isEs ? 'Distancia a la clínica o farmacia más cercana:' : 'Distance to nearest MOUD clinic / pharmacy:'));
    const distSelect = h('select', { id: 'rh-dist-select', class: 'input-select' });
    [
      { val: 10, label: 'Under 15 miles' },
      { val: 25, label: '25 miles (approx. 30-40 min drive)' },
      { val: 50, label: '50 miles (approx. 1 hour drive)' },
      { val: 80, label: '80+ miles (Frontier isolation)' },
    ].forEach((opt) => {
      const optionEl = h('option', { value: String(opt.val) }, opt.label);
      if (ruralHealthState.distanceToClinicMiles === opt.val) optionEl.setAttribute('selected', 'selected');
      distSelect.append(optionEl);
    });
    distSelect.addEventListener('change', (e) => {
      setRuralHealthState({ distanceToClinicMiles: parseFloat(e.target.value) || 0 });
      ruralHealthView(container, options);
    });
    distGroup.append(distSelect);
    formGrid.append(distGroup);

    // Personal Vehicle
    const vehGroup = h('div', { class: 'form-group' });
    vehGroup.append(h('label', { for: 'rh-veh-select' }, isEs ? '¿Dispone de vehículo propio confiable?' : 'Do you have reliable personal vehicle access?'));
    const vehSelect = h('select', { id: 'rh-veh-select', class: 'input-select' });
    [
      { val: 'true', label: isEs ? 'Sí, tengo vehículo' : 'Yes, personal vehicle available' },
      { val: 'false', label: isEs ? 'No tengo vehículo (dependo de terceros)' : 'No vehicle (rely on others or transit)' },
    ].forEach((opt) => {
      const optionEl = h('option', { value: opt.val }, opt.label);
      if (String(ruralHealthState.hasPersonalVehicle) === opt.val) optionEl.setAttribute('selected', 'selected');
      vehSelect.append(optionEl);
    });
    vehSelect.addEventListener('change', (e) => {
      setRuralHealthState({ hasPersonalVehicle: e.target.value === 'true' });
      ruralHealthView(container, options);
    });
    vehGroup.append(vehSelect);
    formGrid.append(vehGroup);

    // Agricultural Worker
    const farmGroup = h('div', { class: 'form-group' });
    farmGroup.append(h('label', { for: 'rh-farm-select' }, isEs ? '¿Trabaja en agricultura o labores del campo?' : 'Are you a farmworker or agricultural laborer?'));
    const farmSelect = h('select', { id: 'rh-farm-select', class: 'input-select' });
    [
      { val: 'false', label: isEs ? 'No' : 'No' },
      { val: 'true', label: isEs ? 'Sí, trabajo agrícola o temporal' : 'Yes, farmworker / agricultural labor' },
    ].forEach((opt) => {
      const optionEl = h('option', { value: opt.val }, opt.label);
      if (String(ruralHealthState.isAgriculturalWorker) === opt.val) optionEl.setAttribute('selected', 'selected');
      farmSelect.append(optionEl);
    });
    farmSelect.addEventListener('change', (e) => {
      setRuralHealthState({ isAgriculturalWorker: e.target.value === 'true' });
      ruralHealthView(container, options);
    });
    farmGroup.append(farmSelect);
    formGrid.append(farmGroup);

    formCard.append(formGrid);
    tabPanel.append(formCard);

    // Results Box
    const resBox = h('div', { class: 'card results-box' });
    resBox.append(h('h4', { class: 'card-title' }, isEs ? 'Plan de Navegación Rural Recomendado' : 'Customized Rural Navigation Strategy'));

    if (plan.alerts.length > 0) {
      plan.alerts.forEach((alt) => {
        const altCard = h('div', { class: 'panel alert-panel alert-warning' });
        altCard.append(h('h5', { class: 'alert-title' }, icon('alert', { class: 'alert-icon' }), isEs ? alt.title.es : alt.title.en));
        altCard.append(p(isEs ? alt.detail.es : alt.detail.en));
        resBox.append(altCard);
      });
    }

    if (plan.transportationSolutions.length > 0) {
      const transStack = h('div', { class: 'trans-stack' });
      plan.transportationSolutions.forEach((sol) => {
        const sBox = h('div', { class: 'card trans-card' });
        sBox.append(h('h5', { class: 'trans-title' }, icon('map-pin', { class: 'pin-icon' }), isEs ? sol.title.es : sol.title.en));
        sBox.append(p(isEs ? sol.detail.es : sol.detail.en));
        transStack.append(sBox);
      });
      resBox.append(transStack);
    }

    // Provider Discussion Checklist
    const discBox = h('div', { class: 'checklist-stack' });
    discBox.append(h('h5', { class: 'stack-title' }, isEs ? 'Preguntas para Coordinar con su Clínica Rural:' : 'Questions for Your Rural Clinic:'));
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
  // TAB 2: NEMT Transit
  // --------------------------------------------------------------------------
  if (currentTab === 'nemt_transit') {
    const nemtCard = h('div', { class: 'card info-card' });
    nemtCard.append(h('h3', { class: 'card-title' }, isEs ? 'Transporte Médico No Urgente de Medicaid (NEMT)' : 'Medicaid Non-Emergency Medical Transportation (NEMT)'));
    nemtCard.append(p(
      isEs
        ? 'Bajo la ley federal 42 C.F.R. § 431.53, Medicaid tiene la obligación legal de garantizar que las personas inscritas puedan llegar a sus citas médicas y de salud mental.'
        : 'Under federal regulation 42 C.F.R. § 431.53, every state Medicaid program must guarantee that beneficiaries have transportation to and from covered healthcare appointments.'
    ));

    const rulesGrid = h('div', { class: 'rules-grid' });
    rulesGrid.append(h('div', { class: 'rule-card' },
      h('h4', {}, isEs ? 'Regla de Anticipación (48 a 72 Horas)' : 'Advance Booking Window (48-72 Hours)'),
      p(isEs
        ? 'Llame a la línea de transporte de su plan de Medicaid con al menos 2 a 3 días hábiles de anticipación. Tenga a mano la fecha, hora, dirección de la clínica y nombre del médico.'
        : 'Call your Medicaid health plan transportation broker at least 2 to 3 business days in advance. Have the date, appointment time, facility address, and provider name ready.'
      )
    ));

    rulesGrid.append(h('div', { class: 'rule-card' },
      h('h4', {}, isEs ? 'Reembolso de Gasolina por Kilometraje' : 'Driver Gas Mileage Reimbursement'),
      p(plan.schedulingRules.mileageReimbursementGuidance[lang] || plan.schedulingRules.mileageReimbursementGuidance.en)
    ));
    nemtCard.append(rulesGrid);

    const destBox = h('div', { class: 'covered-dests' });
    destBox.append(h('h4', {}, isEs ? 'Destinos Cubiertos por NEMT:' : 'Eligible Covered Healthcare Destinations:'));
    const ulList = h('ul', { class: 'bullet-list' });
    plan.schedulingRules.coveredDestinations.forEach((dest) => {
      ulList.append(h('li', {}, isEs ? dest.es : dest.en));
    });
    destBox.append(ulList);
    nemtCard.append(destBox);

    tabPanel.append(nemtCard);
  }

  // --------------------------------------------------------------------------
  // TAB 3: Mail Harm Reduction
  // --------------------------------------------------------------------------
  if (currentTab === 'mail_harm_reduction') {
    const mailCard = h('div', { class: 'card info-card' });
    mailCard.append(h('h3', { class: 'card-title' }, isEs ? 'Reducción de Daños por Correo y Acompañamiento Telefónico' : 'Mail-Order Harm Reduction & Remote Overdose Spotters'));

    MAIL_HARM_REDUCTION_STANDARDS.forEach((item) => {
      const box = h('div', { class: 'harm-box' });
      box.append(h('h4', { class: 'harm-title' }, item.service));
      box.append(h('span', { class: 'harm-pill' }, item.type));
      box.append(p(isEs ? item.availability.es : item.availability.en));
      mailCard.append(box);
    });

    tabPanel.append(mailCard);
  }

  // --------------------------------------------------------------------------
  // TAB 4: RHC Laws & Farmworkers
  // --------------------------------------------------------------------------
  if (currentTab === 'rhc_standards') {
    const statutesCard = h('div', { class: 'card info-card' });
    statutesCard.append(h('h3', { class: 'card-title' }, isEs ? 'Leyes Federales para Clínicas Rurales y Trabajadores Agrícolas' : 'Federal Statutes for Rural Clinics & Agricultural Labor'));

    RURAL_HEALTH_STATUTES.forEach((st) => {
      const sBox = h('div', { class: 'statute-box' });
      sBox.append(h('h4', { class: 'statute-title' }, isEs ? st.title.es : st.title.en));
      sBox.append(h('span', { class: 'statute-cite' }, st.citation));
      sBox.append(p(isEs ? st.summary.es : st.summary.en));
      statutesCard.append(sBox);
    });

    tabPanel.append(statutesCard);
  }

  root.append(tabPanel);

  // Actions Row (Copy / Print / Reset)
  const actions = h('div', { class: 'actions-row' });
  const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' }, isEs ? 'Copiar Plan Rural' : 'Copy Rural Health Plan');
  copyBtn.addEventListener('click', async () => {
    const text = formatRuralHealthSummaryText(plan, lang);
    await copyText(text, {
      trigger: copyBtn,
      copiedLabel: isEs ? '¡Copiado!' : 'Copied!',
      announceSuccess: isEs ? 'Plan copiado al portapapeles' : 'Plan copied to clipboard',
    });
  });
  actions.append(copyBtn);

  const resetBtn = h('button', { type: 'button', class: 'btn btn-ghost' }, isEs ? 'Restablecer' : 'Reset');
  resetBtn.addEventListener('click', () => {
    resetRuralHealthState();
    ruralHealthView(container, options);
  });
  actions.append(resetBtn);

  root.append(actions);

  syncTablists(root);
  if (container) {
    container.append(root);
  }
  wireTablistKeyboard(container ?? root);
  return root;
}

