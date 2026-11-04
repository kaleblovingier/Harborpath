// public/js/views/immigrantHealth.js
// HarborPath Immigrant, Migrant & Language Access Health Rights Specialist
// Pure ES module, 0 dependencies. 100% ephemeral in-RAM clinical & legal guidance.
// References:
// - DHS Protected Areas Policy (Oct 2021 Guidelines on Enforcement Actions at or Near Protected Areas)
// - Emergency Medicaid: Social Security Act § 1903(v), 42 U.S.C. § 1396b(v); 42 C.F.R. § 440.255
// - DHS Public Charge Rule: 8 C.F.R. § 212.21 (2022 Final Rule excluding SUD, Medicaid, and health benefits)
// - Title VI of the Civil Rights Act of 1964: 42 U.S.C. § 2000d; Executive Order 13166 (Language Access Mandates)
// - Public Health Service Act § 330: 42 U.S.C. § 254b (HRSA Community & Migrant Health Centers)

import { h, append, icon } from '../dom.js';
import { t } from '../i18n.js';

/**
 * Statutory and clinical legal framework for immigrant and language access rights.
 */
export const IMMIGRANT_HEALTH_RIGHTS = {
  PROTECTED_AREAS: {
    titleEn: 'DHS Protected Areas Policy (Oct 2021)',
    titleEs: 'Política de Áreas Protegidas del DHS (Oct 2021)',
    citation: 'DHS Policy Directive 040-08 / ICE Directive 10029.2',
    summaryEn: 'Immigration and Customs Enforcement (ICE) and Customs and Border Protection (CBP) are prohibited from conducting enforcement actions (arrests, interviews, searches, surveillance) at or near healthcare facilities. This covers hospitals, addiction treatment clinics, community health centers, mobile clinics, mental health programs, and emergency shelters.',
    summaryEs: 'El Servicio de Inmigración y Control de Aduanas (ICE) y la Patrulla Fronteriza (CBP) tienen prohibido llevar a cabo acciones de cumplimiento (arrestos, interrogatorios, allanamientos, vigilancia) en o cerca de instalaciones médicas. Esto abarca hospitales, clínicas de adicciones, centros de salud comunitarios, unidades móviles, programas de salud mental y refugios de emergencia.',
    keyRulesEn: [
      'Applies to all treatment clinics, syringe exchange programs, and mobile harm reduction units.',
      'Includes adjacent sidewalks, parking lots, and facility driveways.',
      'Urgent medical and addiction care must never be avoided due to fear of immigration enforcement.'
    ],
    keyRulesEs: [
      'Se aplica a todas las clínicas de tratamiento, programas de intercambio de jeringas y unidades móviles de reducción de daños.',
      'Incluye aceras adyacentes, estacionamientos y entradas a las instalaciones.',
      'La atención médica y de adicciones urgente nunca debe evitarse por temor a la aplicación de leyes migratorias.'
    ]
  },
  EMERGENCY_MEDICAID: {
    titleEn: 'Emergency Medicaid Coverage (42 U.S.C. § 1396b(v))',
    titleEs: 'Cobertura de Medicaid de Emergencia (42 U.S.C. § 1396b(v))',
    citation: 'Social Security Act § 1903(v); 42 C.F.R. § 440.255',
    summaryEn: 'Federal law requires states to provide Emergency Medicaid coverage for individuals who meet financial eligibility criteria but lack qualifying immigration status. Covers acute, life-threatening medical conditions including acute overdose resuscitation, life-threatening withdrawal (seizures, delirium tremens), severe soft-tissue necrosis/sepsis, and emergency psychiatric stabilization.',
    summaryEs: 'La ley federal exige que los estados proporcionen cobertura de Medicaid de Emergencia a personas que cumplen con los criterios de ingresos pero no tienen un estatus migratorio calificado. Cubre afecciones médicas agudas que ponen en peligro la vida, incluyendo reanimación por sobredosis, abstinencia severa (convulsiones, delirium tremens), necrosis de tejidos blandos/sepsis y estabilización psiquiátrica de emergencia.',
    keyRulesEn: [
      'Social Security numbers and proof of citizenship cannot be required for emergency medical claims.',
      'Emergency department medical screening and stabilization (EMTALA) is guaranteed regardless of payment or status.',
      'Hospital financial counseling offices can process retrospective Emergency Medicaid applications during inpatient or ED stays.'
    ],
    keyRulesEs: [
      'No se pueden exigir números de Seguro Social ni prueba de ciudadanía para reclamaciones médicas de emergencia.',
      'La evaluación y estabilización médica en la sala de emergencias (EMTALA) está garantizada sin importar el pago o estatus.',
      'Las oficinas de asistencia financiera hospitalaria pueden tramitar solicitudes retroactivas de Medicaid de Emergencia durante estancias en urgencias o internaciones.'
    ]
  },
  PUBLIC_CHARGE_EXCLUSION: {
    titleEn: 'DHS Public Charge Rule Protections (8 C.F.R. § 212.21)',
    titleEs: 'Protecciones de la Regla de Carga Pública del DHS (8 C.F.R. § 212.21)',
    citation: '8 C.F.R. § 212.21; DHS 2022 Final Rule (87 FR 55472)',
    summaryEn: 'Under the 2022 DHS Final Public Charge Rule, seeking substance use treatment, healthcare services, Medicaid (except long-term institutionalized care like nursing homes), food assistance (SNAP), or housing assistance does NOT count against public charge or harm green card applications.',
    summaryEs: 'Bajo la regla final de Carga Pública del DHS de 2022, buscar tratamiento para el uso de sustancias, servicios de salud, Medicaid (excepto atención institucional a largo plazo como asilos de ancianos), asistencia alimentaria (SNAP) o vivienda NO cuenta en contra de la carga pública ni perjudica las solicitudes de residencia permanente (Green Card).',
    keyRulesEn: [
      'Substance use disorder treatment and MOUD (buprenorphine, methadone) are 100% exempt from public charge review.',
      'Harm reduction services, naloxone kits, and syringe services have zero immigration consequences.',
      'Using sliding fee scales at community clinics or safety-net hospitals is completely safe for visa adjustments.'
    ],
    keyRulesEs: [
      'El tratamiento del trastorno por consumo de sustancias y el MOUD (buprenorfina, metadona) están 100% exentos de la revisión de carga pública.',
      'Los servicios de reducción de daños, kits de naloxona e intercambio de jeringas tienen cero consecuencias migratorias.',
      'El uso de tarifas reducidas según ingresos en clínicas comunitarias u hospitales públicos es completamente seguro para ajustes de visa.'
    ]
  },
  LANGUAGE_ACCESS: {
    titleEn: 'Language Access Mandates (Title VI Civil Rights Act)',
    titleEs: 'Mandatos de Acceso Lingüístico (Título VI Ley de Derechos Civiles)',
    citation: '42 U.S.C. § 2000d; Executive Order 13166; 45 C.F.R. § 80.3',
    summaryEn: 'Any healthcare provider or facility receiving federal funding (including Medicaid, Medicare, or HRSA grants) must provide free, qualified medical interpretation and translated vital documents to individuals with Limited English Proficiency (LEP).',
    summaryEs: 'Cualquier proveedor o centro médico que reciba fondos federales (incluidos Medicaid, Medicare o subvenciones de HRSA) debe proporcionar intérpretes médicos certificados gratuitos y documentos vitales traducidos a personas con Dominio Limitado del Inglés (LEP).',
    keyRulesEn: [
      'Patients have the absolute legal right to a qualified medical interpreter (in-person or video remote interpreting - VRI) at no cost.',
      'Facilities cannot require or force family members, friends, or minor children to interpret clinical encounters.',
      'Informed consent for medications, detoxification, or procedures must be explained in the patient\'s preferred language before signing.'
    ],
    keyRulesEs: [
      'Los pacientes tienen el derecho legal absoluto a un intérprete médico certificado (en persona o por video VRI) sin costo alguno.',
      'Las instalaciones no pueden exigir ni obligar a familiares, amigos o niños menores de edad a interpretar consultas clínicas.',
      'El consentimiento informado para medicamentos, desintoxicación o procedimientos debe explicarse en el idioma preferido del paciente antes de firmar.'
    ]
  },
  FQHC_SAFETY_NET: {
    titleEn: 'HRSA Community & Migrant Health Centers (§ 330)',
    titleEs: 'Centros de Salud Comunitarios y para Migrantes de HRSA (§ 330)',
    citation: 'Public Health Service Act § 330; 42 U.S.C. § 254b',
    summaryEn: 'Federally Qualified Health Centers (FQHCs) and Migrant Health Centers must provide comprehensive primary care, buprenorphine MOUD, and mental health care to all patients regardless of immigration status, insurance, or ability to pay, using sliding-scale fees.',
    summaryEs: 'Los Centros de Salud Calificados a Nivel Federal (FQHC) y los Centros de Salud para Migrantes deben brindar atención primaria integral, buprenorfina MOUD y salud mental a todos los pacientes sin importar su estatus migratorio, seguro o capacidad de pago, mediante tarifas de escala móvil.',
    keyRulesEn: [
      'Clinics cannot deny care based on lack of insurance, lack of SSN, or inability to pay.',
      'Nominal fees ($0 to $20) apply to individuals below 100% of the Federal Poverty Level with self-attestation.',
      'Patient demographic and address records are protected under medical privacy laws and not shared with immigration agencies.'
    ],
    keyRulesEs: [
      'Las clínicas no pueden negar atención médica por falta de seguro, falta de Seguro Social o incapacidad de pago.',
      'Se aplican tarifas nominales ($0 a $20) a personas por debajo del 100% del nivel federal de pobreza con autodeclaración.',
      'Los registros demográficos y de domicilio de los pacientes están protegidos por leyes de privacidad médica y no se comparten con agencias de inmigración.'
    ]
  }
};

/**
 * Ephemeral browser-RAM state for immigrant health guidance.
 */
let immigrantState = {
  activeTab: 'overview',
  needType: 'all',
  immigrationConcern: 'ice_safety',
  englishProficiency: 'interpreter_needed',
  emergencyCondition: false
};

export function getImmigrantState() {
  return { ...immigrantState };
}

export function setImmigrantState(patch) {
  immigrantState = { ...immigrantState, ...patch };
}

export function resetImmigrantState() {
  immigrantState = {
    activeTab: 'overview',
    needType: 'all',
    immigrationConcern: 'ice_safety',
    englishProficiency: 'interpreter_needed',
    emergencyCondition: false
  };
}

/**
 * Pure evaluation function for immigrant and language access rights.
 */
export function evaluateImmigrantHealthRights({
  needType = 'all',
  immigrationConcern = 'ice_safety',
  englishProficiency = 'interpreter_needed',
  emergencyCondition = false
} = {}) {
  const recommendations = [];
  const protections = [];
  const citations = [];
  const urgentDirectives = [];

  // Emergency medical condition evaluation
  if (emergencyCondition) {
    urgentDirectives.push({
      priority: 'CRITICAL',
      titleEn: 'Immediate EMTALA & Emergency Medicaid Protections',
      titleEs: 'Protecciones Inmediatas de EMTALA y Medicaid de Emergencia',
      textEn: 'Under EMTALA (42 U.S.C. § 1395dd) and Emergency Medicaid (42 U.S.C. § 1396b(v)), hospital emergency rooms are legally required to evaluate and stabilize life-threatening overdoses, severe withdrawal, and severe infections regardless of immigration status, lack of SSN, or insurance.',
      textEs: 'Bajo EMTALA (42 U.S.C. § 1395dd) y Medicaid de Emergencia (42 U.S.C. § 1396b(v)), las salas de emergencias hospitalarias están legalmente obligadas a evaluar y estabilizar sobredosis, abstinencia severa e infecciones graves sin importar el estatus migratorio, falta de Seguro Social o seguro.'
    });
    protections.push('EMTALA Emergency Screening (42 U.S.C. § 1395dd)');
    protections.push('Emergency Medicaid (42 U.S.C. § 1396b(v))');
    citations.push('42 U.S.C. § 1395dd');
    citations.push('42 U.S.C. § 1396b(v)');
  }

  // Language Access evaluation
  if (englishProficiency === 'interpreter_needed') {
    recommendations.push({
      topic: 'language_access',
      titleEn: 'Request a Free Qualified Medical Interpreter',
      titleEs: 'Solicite un Intérprete Médico Certificado Gratuito',
      textEn: 'Under Title VI of the Civil Rights Act, you have the legal right to a free, qualified interpreter in your preferred language. Do not permit clinics to use minor children or uncertified staff to translate clinical consent.',
      textEs: 'Bajo el Título VI de la Ley de Derechos Civiles, usted tiene el derecho legal a un intérprete profesional gratuito en su idioma de preferencia. No permita que las clínicas utilicen a niños menores o personal no certificado para traducir consentimientos clínicos.',
      actionPromptEn: 'State to staff: "I have the right to a qualified medical interpreter at no cost to me under Title VI."',
      actionPromptEs: 'Dígale al personal: "Tengo derecho a un intérprete médico certificado sin costo alguno según el Título VI."'
    });
    protections.push('Title VI Civil Rights Act (42 U.S.C. § 2000d)');
    citations.push('42 U.S.C. § 2000d');
    citations.push('Executive Order 13166');
  }

  // Immigration concern evaluation
  if (immigrationConcern === 'ice_safety') {
    recommendations.push({
      topic: 'dhs_protected_areas',
      titleEn: 'Safe Access: DHS Protected Areas Directive',
      titleEs: 'Acceso Seguro: Directiva de Áreas Protegidas del DHS',
      textEn: 'Hospitals, outpatient MOUD clinics, harm reduction centers, and mobile outreach teams are DHS Protected Areas. ICE and CBP are strictly prohibited from conducting enforcement actions at or near these locations.',
      textEs: 'Los hospitales, clínicas ambulatorias de MOUD, centros de reducción de daños y equipos móviles son Áreas Protegidas del DHS. ICE y CBP tienen estrictamente prohibido realizar acciones de captura o vigilancia en o cerca de estos lugares.',
      actionPromptEn: 'Medical facilities are safe zones for healthcare. Seeking addiction care or naloxone does not trigger immigration enforcement.',
      actionPromptEs: 'Los centros médicos son zonas seguras para la salud. Buscar atención de adicciones o naloxona no activa la aplicación de leyes migratorias.'
    });
    protections.push('DHS Protected Areas Policy (Directive 040-08)');
    citations.push('DHS Policy Directive 040-08');
  } else if (immigrationConcern === 'public_charge') {
    recommendations.push({
      topic: 'public_charge_exemption',
      titleEn: 'Zero Public Charge Penalty for Addiction Care',
      titleEs: 'Cero Penalización por Carga Pública para Tratamiento de Adicciones',
      textEn: 'Under the 2022 DHS Final Rule (8 C.F.R. § 212.21), substance use disorder treatment, harm reduction, and healthcare clinics are explicitly excluded from public charge determinations and will not harm legal residency or visa applications.',
      textEs: 'Bajo la Regla Final del DHS de 2022 (8 C.F.R. § 212.21), el tratamiento del trastorno por uso de sustancias, la reducción de daños y las clínicas de salud están explícitamente excluidos de la carga pública y no perjudicarán la residencia legal ni visas.',
      actionPromptEn: 'Receiving buprenorphine, methadone, or sliding scale care does not prevent obtaining a green card.',
      actionPromptEs: 'Recibir buprenorfina, metadona o atención con tarifas reducidas no impide obtener la residencia permanente.'
    });
    protections.push('DHS Public Charge Exemption (8 C.F.R. § 212.21)');
    citations.push('8 C.F.R. § 212.21');
  } else if (immigrationConcern === 'payment_and_fqhc') {
    recommendations.push({
      topic: 'fqhc_sliding_fee',
      titleEn: 'Community Health Centers Provide Care Regardless of Status',
      titleEs: 'Los Centros de Salud Comunitarios Brindan Atención Sin Importar el Estatus',
      textEn: 'HRSA-funded community health centers (FQHCs) provide primary care and addiction treatment to everyone, with sliding-scale discounts based on income. Proof of legal status or Social Security numbers are never required.',
      textEs: 'Los centros de salud comunitarios financiados por HRSA (FQHC) brindan atención médica y tratamiento de adicciones a todas las personas con tarifas según ingresos. Nunca se requiere prueba de estatus legal ni número de Seguro Social.',
      actionPromptEn: 'Request sliding-fee scale ($0 to $20) with a self-declaration of income letter.',
      actionPromptEs: 'Solicite la escala de tarifas reducidas ($0 a $20) con una carta de autodeclaración de ingresos.'
    });
    protections.push('Public Health Service Act § 330 (42 U.S.C. § 254b)');
    citations.push('42 U.S.C. § 254b');
  }

  // Need type recommendations
  if (needType === 'moud' || needType === 'all') {
    recommendations.push({
      topic: 'confidential_moud',
      titleEn: 'Confidentiality of Addiction Records (42 C.F.R. Part 2)',
      titleEs: 'Confidencialidad de Registros de Adicciones (42 C.F.R. Parte 2)',
      textEn: 'Substance use treatment records are protected by strict federal confidentiality laws (42 C.F.R. Part 2) that prohibit clinics from disclosing patient records or presence to law enforcement or immigration agencies without a specialized court order.',
      textEs: 'Los registros de tratamiento de adicciones están protegidos por estrictas leyes federales de confidencialidad (42 C.F.R. Parte 2) que prohíben a las clínicas divulgar información o presencia del paciente a la policía o agencias de inmigración sin una orden judicial especializada.'
    });
    protections.push('Federal Confidentiality Regulations (42 C.F.R. Part 2)');
    citations.push('42 C.F.R. Part 2');
  }

  return {
    recommendations,
    protections: Array.from(new Set(protections)),
    citations: Array.from(new Set(citations)),
    urgentDirectives
  };
}

/**
 * Formats a plain-text clinical and legal rights summary.
 */
export function formatImmigrantSummaryText(state, lang = 'en') {
  const isEs = lang === 'es';
  const result = evaluateImmigrantHealthRights(state);
  const divider = '==================================================';

  const lines = [
    divider,
    isEs
      ? 'GUÍA DE DERECHOS DE SALUD Y ACCESO LINGÜÍSTICO PARA INMIGRANTES'
      : 'IMMIGRANT HEALTH RIGHTS & LANGUAGE ACCESS CLINICAL GUIDE',
    isEs
      ? 'Apoyo de Decisión en Memoria RAM - Sin Registro de Datos Personales'
      : 'In-RAM Ephemeral Decision Support - Zero Tracking',
    divider,
    ''
  ];

  if (result.urgentDirectives.length > 0) {
    lines.push(isEs ? '--- DIRECTIVAS DE URGENCIA ---' : '--- URGENT DIRECTIVES ---');
    result.urgentDirectives.forEach(d => {
      lines.push(`[!ALERT] ${isEs ? d.titleEs : d.titleEn}`);
      lines.push(isEs ? d.textEs : d.textEn);
      lines.push('');
    });
  }

  lines.push(isEs ? '--- RECOMENDACIONES CLÍNICAS Y LEGALES ---' : '--- CLINICAL & LEGAL RECOMMENDATIONS ---');
  result.recommendations.forEach(r => {
    lines.push(`* ${isEs ? r.titleEs : r.titleEn}`);
    lines.push(`  ${isEs ? r.textEs : r.textEn}`);
    if (r.actionPromptEn) {
      lines.push(`  -> ${isEs ? r.actionPromptEs : r.actionPromptEn}`);
    }
    lines.push('');
  });

  lines.push(isEs ? '--- PROTECCIONES Y CITAS ESTATUTARIAS ---' : '--- STATUTORY PROTECTIONS & CITATIONS ---');
  result.protections.forEach(p => lines.push(`- ${p}`));
  lines.push('');
  lines.push(isEs ? 'Citas Legales Federales:' : 'Federal Statutory Citations:');
  lines.push(result.citations.join(', '));
  lines.push('');
  lines.push(divider);
  lines.push(isEs
    ? 'Aviso Educativo: Este resumen es para fines de orientación. HarborPath no almacena datos de los usuarios.'
    : 'Educational Disclaimer: This summary is for guidance purposes. HarborPath does not store user data.'
  );

  return lines.join('\n');
}

/**
 * Mounts the Immigrant Health Rights view.
 */
export function immigrantHealthView(container) {
  const currentLang = (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) === 'es' ? 'es' : 'en';
  const isEs = currentLang === 'es';

  container.textContent = '';

  const wrapper = h('div', { class: 'immigrant-health-view clinical-view-wrapper' });

  // Header
  const header = h('header', { class: 'clinical-header' }, [
    h('div', { class: 'clinical-badge' }, [
      icon('shield', { class: 'badge-icon', 'aria-hidden': 'true' }),
      h('span', { class: 'badge-text' }, isEs ? 'Derechos de Salud para Inmigrantes' : 'Immigrant & Language Access Rights')
    ]),
    h('h1', { class: 'clinical-title' }, isEs ? 'Atención Médica, MOUD y Protección Legal para Inmigrantes' : 'Immigrant Health, MOUD & Language Access Rights'),
    h('p', { class: 'clinical-subtitle' }, isEs
      ? 'Orientación legal y clínica sobre áreas protegidas por el DHS, Medicaid de Emergencia, exclusión de carga pública y derechos de intérpretes médicos sin costo.'
      : 'Legal and clinical protections covering DHS Protected Areas, Emergency Medicaid, 2022 Public Charge exemptions, and federal language access rights.'
    ),
    h('div', { class: 'privacy-notice' }, [
      icon('lock', { class: 'privacy-icon', 'aria-hidden': 'true' }),
      h('span', {}, isEs
        ? 'Herramienta en memoria RAM. Ninguna respuesta se registra ni se envía a agencias gubernamentales.'
        : 'In-RAM ephemeral tool. No responses are stored or shared with any government agency.'
      )
    ])
  ]);
  wrapper.appendChild(header);

  // Tab navigation
  const tabNav = h('nav', { class: 'clinical-tabs-nav', role: 'tablist', 'aria-label': isEs ? 'Pestañas de navegación' : 'View tabs' });
  const tabs = [
    { id: 'overview', labelEn: 'Rights Overview', labelEs: 'Resumen de Derechos' },
    { id: 'decision-aid', labelEn: 'Rights Decision Aid', labelEs: 'Evaluador de Derechos' },
    { id: 'language-rights', labelEn: 'Language Access (Title VI)', labelEs: 'Acceso Lingüístico (Título VI)' },
    { id: 'faq', labelEn: 'Immigration FAQ', labelEs: 'Preguntas Frecuentes' }
  ];

  tabs.forEach(tab => {
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      class: `tab-button ${immigrantState.activeTab === tab.id ? 'active' : ''}`,
      'aria-selected': String(immigrantState.activeTab === tab.id),
      'aria-controls': `tab-content-${tab.id}`,
      id: `tab-${tab.id}`
    }, isEs ? tab.labelEs : tab.labelEn);

    btn.addEventListener('click', () => {
      immigrantState.activeTab = tab.id;
      immigrantHealthView(container);
    });
    tabNav.appendChild(btn);
  });
  wrapper.appendChild(tabNav);

  // Content Area
  const contentArea = h('div', {
    class: 'tab-content-area',
    id: `tab-content-${immigrantState.activeTab}`,
    role: 'tabpanel',
    'aria-labelledby': `tab-${immigrantState.activeTab}`
  });

  if (immigrantState.activeTab === 'overview') {
    renderOverviewTab(contentArea, isEs);
  } else if (immigrantState.activeTab === 'decision-aid') {
    renderDecisionAidTab(contentArea, isEs, container);
  } else if (immigrantState.activeTab === 'language-rights') {
    renderLanguageRightsTab(contentArea, isEs);
  } else if (immigrantState.activeTab === 'faq') {
    renderFaqTab(contentArea, isEs);
  }

  wrapper.appendChild(contentArea);
  container.appendChild(wrapper);
}

function renderOverviewTab(container, isEs) {
  const grid = h('div', { class: 'rights-cards-grid' });

  Object.values(IMMIGRANT_HEALTH_RIGHTS).forEach(right => {
    const card = h('article', { class: 'rights-card card' }, [
      h('h2', { class: 'rights-card-title' }, isEs ? right.titleEs : right.titleEn),
      h('div', { class: 'rights-citation' }, right.citation),
      h('p', { class: 'rights-summary' }, isEs ? right.summaryEs : right.summaryEn),
      h('h3', { class: 'rights-rules-heading' }, isEs ? 'Reglas Clave:' : 'Key Rules:'),
      h('ul', { class: 'rights-rules-list' }, (isEs ? right.keyRulesEs : right.keyRulesEn).map(rule => h('li', {}, rule)))
    ]);
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function renderDecisionAidTab(container, isEs, rootContainer) {
  const formCard = h('div', { class: 'decision-aid-card card' });

  formCard.appendChild(h('h2', {}, isEs ? 'Evaluador de Derechos de Salud y Acceso' : 'Health Rights & Access Evaluator'));
  formCard.appendChild(h('p', { class: 'aid-description' }, isEs
    ? 'Seleccione su situación para conocer las protecciones legales y derechos clínicos específicos.'
    : 'Select your situation to view tailored clinical and statutory protections.'
  ));

  // Emergency condition toggle
  const emergencyGroup = h('div', { class: 'form-group emergency-toggle-group' });
  const emergencyLabel = h('label', { class: 'checkbox-label' });
  const emergencyCheckbox = h('input', {
    type: 'checkbox',
    name: 'emergencyCondition',
    checked: immigrantState.emergencyCondition
  });
  emergencyCheckbox.addEventListener('change', (e) => {
    immigrantState.emergencyCondition = e.target.checked;
    immigrantHealthView(rootContainer);
  });
  emergencyLabel.appendChild(emergencyCheckbox);
  emergencyLabel.appendChild(h('span', { class: 'checkbox-text' }, isEs
    ? '¿Situación de emergencia médica aguda (sobredosis reciente, abstinencia severa, infección grave)?'
    : 'Acute emergency condition (recent overdose, severe withdrawal, severe infection)?'
  ));
  emergencyGroup.appendChild(emergencyLabel);
  formCard.appendChild(emergencyGroup);

  // Immigration concern select
  const concernGroup = h('div', { class: 'form-group' });
  const concernLabel = h('label', { for: 'concern-select' }, isEs ? 'Preocupación Principal:' : 'Primary Concern:');
  const concernSelect = h('select', { id: 'concern-select', class: 'select-input' });
  const concernOptions = [
    { value: 'ice_safety', labelEn: 'Fear of ICE / Immigration Enforcement', labelEs: 'Temor a ICE / Cumplimiento Migratorio' },
    { value: 'public_charge', labelEn: 'Public Charge / Impact on Green Card', labelEs: 'Carga Pública / Impacto en Residencia Legal' },
    { value: 'payment_and_fqhc', labelEn: 'Paying for Care Without Insurance or SSN', labelEs: 'Pagar por Atención sin Seguro ni Seguro Social' }
  ];
  concernOptions.forEach(opt => {
    const optionEl = h('option', { value: opt.value }, isEs ? opt.labelEs : opt.labelEn);
    if (immigrantState.immigrationConcern === opt.value) optionEl.selected = true;
    concernSelect.appendChild(optionEl);
  });
  concernSelect.addEventListener('change', (e) => {
    immigrantState.immigrationConcern = e.target.value;
    immigrantHealthView(rootContainer);
  });
  concernGroup.appendChild(concernLabel);
  concernGroup.appendChild(concernSelect);
  formCard.appendChild(concernGroup);

  // English proficiency select
  const langGroup = h('div', { class: 'form-group' });
  const langLabel = h('label', { for: 'lang-select' }, isEs ? 'Preferencia de Idioma / Dominio de Inglés:' : 'Language Preference / English Proficiency:');
  const langSelect = h('select', { id: 'lang-select', class: 'select-input' });
  const langOptions = [
    { value: 'interpreter_needed', labelEn: 'Need Free Medical Interpreter (LEP)', labelEs: 'Necesito Intérprete Médico Gratuito (LEP)' },
    { value: 'fluent_english', labelEn: 'Fluent in English / No Interpreter Required', labelEs: 'Fluidez en Inglés / No Requiere Intérprete' }
  ];
  langOptions.forEach(opt => {
    const optionEl = h('option', { value: opt.value }, isEs ? opt.labelEs : opt.labelEn);
    if (immigrantState.englishProficiency === opt.value) optionEl.selected = true;
    langSelect.appendChild(optionEl);
  });
  langSelect.addEventListener('change', (e) => {
    immigrantState.englishProficiency = e.target.value;
    immigrantHealthView(rootContainer);
  });
  langGroup.appendChild(langLabel);
  langGroup.appendChild(langSelect);
  formCard.appendChild(langGroup);

  container.appendChild(formCard);

  // Results Section
  const results = evaluateImmigrantHealthRights(immigrantState);
  const resultsCard = h('div', { class: 'results-card card' });
  resultsCard.appendChild(h('h2', {}, isEs ? 'Sus Derechos y Recomendaciones' : 'Your Legal Protections & Recommendations'));

  if (results.urgentDirectives.length > 0) {
    results.urgentDirectives.forEach(d => {
      const urgentBox = h('div', { class: 'urgent-box alert alert-danger' }, [
        h('h3', {}, isEs ? d.titleEs : d.titleEn),
        h('p', {}, isEs ? d.textEs : d.textEn)
      ]);
      resultsCard.appendChild(urgentBox);
    });
  }

  const recList = h('div', { class: 'recommendations-list' });
  results.recommendations.forEach(r => {
    const item = h('div', { class: 'recommendation-item' }, [
      h('h3', { class: 'recommendation-title' }, isEs ? r.titleEs : r.titleEn),
      h('p', { class: 'recommendation-text' }, isEs ? r.textEs : r.textEn),
      r.actionPromptEn ? h('div', { class: 'action-prompt callout' }, [
        h('strong', {}, isEs ? 'Qué decir: ' : 'What to say: '),
        h('span', {}, isEs ? r.actionPromptEs : r.actionPromptEn)
      ]) : null
    ]);
    recList.appendChild(item);
  });
  resultsCard.appendChild(recList);

  // Print & Copy Actions
  const actionRow = h('div', { class: 'action-row' });
  const copyBtn = h('button', { type: 'button', class: 'button secondary-button' }, isEs ? 'Copiar Resumen' : 'Copy Summary');
  copyBtn.addEventListener('click', async () => {
    const text = formatImmigrantSummaryText(immigrantState, isEs ? 'es' : 'en');
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = isEs ? '¡Copiado!' : 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = isEs ? 'Copiar Resumen' : 'Copy Summary';
        }, 2000);
      }
    } catch {
      // Fallback
    }
  });

  const printBtn = h('button', { type: 'button', class: 'button primary-button' }, isEs ? 'Imprimir Resumen' : 'Print Summary');
  printBtn.addEventListener('click', () => {
    if (typeof window !== 'undefined' && window.print) {
      window.print();
    }
  });

  actionRow.appendChild(copyBtn);
  actionRow.appendChild(printBtn);
  resultsCard.appendChild(actionRow);

  container.appendChild(resultsCard);
}

function renderLanguageRightsTab(container, isEs) {
  const card = h('article', { class: 'card language-rights-card' }, [
    h('h2', {}, isEs ? 'Derechos de Acceso Lingüístico bajo el Título VI' : 'Language Access Rights Under Title VI'),
    h('p', {}, isEs
      ? 'La Ley de Derechos Civiles de 1964 garantiza que ninguna persona con dominio limitado del inglés sea excluida o discriminada en centros de atención médica financiados con fondos federales.'
      : 'Title VI of the Civil Rights Act ensures individuals with Limited English Proficiency (LEP) are not excluded or discriminated against in federally funded healthcare settings.'
    ),
    h('div', { class: 'rights-checklist' }, [
      h('h3', {}, isEs ? 'Puntos Clave para Exigir su Intérprete:' : 'Key Points When Requesting Your Interpreter:'),
      h('ul', { class: 'checklist' }, [
        h('li', {}, isEs
          ? 'Intérprete Profesional: Tiene derecho a un intérprete médico certificado en persona o por video (VRI). No es aceptable que el personal use traductores automáticos de baja calidad para información médica compleja.'
          : 'Professional Interpreter: You have the right to a qualified medical interpreter in person or via Video Remote Interpreting (VRI). Machine translation is unacceptable for clinical consent.'
        ),
        h('li', {}, isEs
          ? 'Proteja a su Familia: Las clínicas NUNCA pueden obligar a sus hijos menores o familiares a interpretar diagnósticos, medicamentos o trámites.'
          : 'Protect Your Family: Clinics can NEVER require your children or family members to interpret clinical diagnoses, prescriptions, or consent forms.'
        ),
        h('li', {}, isEs
          ? 'Documentos en su Idioma: Documentos esenciales (consentimiento informado, advertencias de medicamentos, instrucciones de alta) deben ser traducidos o leídos por un intérprete.'
          : 'Vital Documents: Informed consent forms, medication warnings, and discharge instructions must be provided in your language.'
        )
      ])
    ])
  ]);
  container.appendChild(card);
}

function renderFaqTab(container, isEs) {
  const faqs = [
    {
      qEn: 'Can ICE arrest me inside a drug treatment clinic or detox center?',
      qEs: '¿Puede ICE arrestarme dentro de una clínica de tratamiento de adicciones o centro de desintoxicación?',
      aEn: 'No. Under the DHS Protected Areas Policy, medical treatment facilities, detox centers, and harm reduction programs are strictly off-limits to enforcement actions. Enforcement actions at these locations are prohibited absent extraordinary circumstances.',
      aEs: 'No. Bajo la Política de Áreas Protegidas del DHS, los centros de tratamiento médico, centros de desintoxicación y programas de reducción de daños están estrictamente protegidos. Las acciones de captura en estos lugares están prohibidas salvo circunstancias extraordinarias.'
    },
    {
      qEn: 'Will taking buprenorphine or methadone prevent me from getting a green card?',
      qEs: '¿Tomar buprenorfina o metadona me impedirá obtener la residencia permanente (Green Card)?',
      aEn: 'No. The 2022 DHS Final Public Charge Rule explicitly excludes substance use treatment, outpatient medical care, and Medicaid benefits (other than long-term institutionalization). MOUD is standard medical care and does not trigger public charge.',
      aEs: 'No. La Regla Final de Carga Pública del DHS de 2022 excluye explícitamente el tratamiento de adicciones, la atención ambulatoria y los beneficios de Medicaid (salvo internación a largo plazo en asilos). El MOUD es atención médica estándar y no activa la carga pública.'
    },
    {
      qEn: 'Can I get treatment if I don\'t have a Social Security number?',
      qEs: '¿Puedo recibir tratamiento si no tengo número de Seguro Social?',
      aEn: 'Yes. Federally Qualified Health Centers (FQHCs) and Emergency Medicaid programs provide care without requiring a Social Security number. You can provide an income self-declaration to qualify for sliding-scale fees ($0 to $20).',
      aEs: 'Sí. Los Centros de Salud Calificados Federalmente (FQHC) y los programas de Medicaid de Emergencia brindan atención sin requerir número de Seguro Social. Puede presentar una autodeclaración de ingresos para calificar para la escala móvil ($0 a $20).'
    }
  ];

  const faqContainer = h('div', { class: 'faq-list' });
  faqs.forEach(faq => {
    const item = h('details', { class: 'faq-item card' }, [
      h('summary', { class: 'faq-question' }, isEs ? faq.qEs : faq.qEn),
      h('p', { class: 'faq-answer' }, isEs ? faq.aEs : faq.aEn)
    ]);
    faqContainer.appendChild(item);
  });
  container.appendChild(faqContainer);
}
