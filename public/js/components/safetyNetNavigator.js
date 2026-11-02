/**
 * Safety-Net Navigator & Telehealth Access Component (public/js/components/safetyNetNavigator.js)
 *
 * Comprehensive, trauma-informed patient navigator for Federally Qualified Health Centers (FQHCs),
 * Title X clinics, Hill-Burton hospitals, EMTALA emergency screening, and Tele-MOUD access:
 *
 * 1. FQHC Sliding-Fee Discount Program (Public Health Service Act § 330, 42 U.S.C. § 254b):
 *    - Mandatory sliding-fee discount schedule based exclusively on income and family size.
 *    - 0% to 100% of Federal Poverty Level (FPL): Full discount / nominal charge only (no denial for inability to pay).
 *    - 101% to 200% FPL: Graduated discount tiers.
 *    - Protection against immigration discrimination: FQHCs never condition care on citizenship or legal status.
 *
 * 2. Title X Family Planning Clinics:
 *    - Confidential services (STI testing, HIV/HCV screening, pregnancy testing, contraception).
 *    - Minors and adults requesting confidential care are assessed on their OWN income (frequently $0 fee tier).
 *
 * 3. Federal EMTALA Rights (42 U.S.C. § 1395dd):
 *    - Mandatory medical screening examination (MSE) and emergency stabilization in all Medicare-participating hospitals
 *      for acute withdrawal, overdose, severe trauma, sepsis, or psychiatric emergencies regardless of payment ability.
 *
 * 4. Tele-MOUD & Telehealth Accessibility:
 *    - DEA/SAMHSA buprenorphine flexibilities permitting audio-video and audio-only clinical induction.
 *    - Lifeline & federal subsidized phone connectivity pathways for low-income telehealth.
 *
 * Strict Invariants:
 * - Zero npm dependencies (plain ES modules).
 * - Zero PII: 100% ephemeral in-RAM state. Never writes user answers to URLs, device storage, or cookies.
 * - Accessible DOM construction via h() (document.createElement, textContent, setAttribute).
 *   ZERO direct markup string injection or inline style attributes.
 * - Complete bilingual parity (English / Spanish).
 */

import { h, clear, ext, tel, sms, icon, announce } from '../dom.js';
import { p, fine, ul, strong } from '../views/common.js';
import { t, getLang } from '../i18n.js';

// ============================================================================
// 1. Statutory Frameworks & Safety-Net Programs
// ============================================================================

export const FEDERAL_SAFETY_NET_PROGRAMS = [
  {
    id: 'fqhc_section_330',
    title: { en: 'Federally Qualified Health Centers (Section 330)', es: 'Centros de Salud Calificados a Nivel Federal (Sección 330)' },
    citation: 'Public Health Service Act § 330 (42 U.S.C. § 254b)',
    summary: {
      en: 'Community Health Centers receive federal funding to provide comprehensive primary care, MOUD, dental, and behavioral health. By law, they MUST provide care to everyone regardless of health insurance, ability to pay, or immigration status, using an income-based sliding-fee scale.',
      es: 'Los Centros de Salud Comunitarios reciben fondos federales para brindar atención médica, MOUD, dental y salud mental. Por ley, DEBEN atender a todas las personas independientemente de seguro, capacidad de pago o estatus migratorio, mediante una escala móvil de tarifas.',
    },
  },
  {
    id: 'title_x_clinics',
    title: { en: 'Title X Family Planning Clinics (Confidential Care)', es: 'Clínicas del Título X (Atención Confidencial de Salud Reproductiva)' },
    citation: 'Public Health Service Act Title X (42 U.S.C. § 300 et seq.)',
    summary: {
      en: 'Title X clinics provide confidential reproductive health, rapid HIV/HCV testing, and STI care. Patients requesting confidentiality (including adolescents or individuals seeking confidential harm reduction) are assessed solely on their personal income, often qualifying for $0 cost services.',
      es: 'Las clínicas de Título X ofrecen atención confidencial, pruebas rápidas de VIH/VHC y tratamiento de ITS. Quienes soliciten confidencialidad (incluidos jóvenes) son evaluados únicamente según sus ingresos personales, calificando con frecuencia para tarifas de $0.',
    },
  },
  {
    id: 'emtala_emergency_rights',
    title: { en: 'Federal EMTALA Emergency Screening & Stabilization', es: 'Ley Federal EMTALA: Evaluación y Estabilización de Urgencias' },
    citation: 'Emergency Medical Treatment and Labor Act (42 U.S.C. § 1395dd)',
    summary: {
      en: 'Under federal law, any hospital with an emergency department must provide an appropriate Medical Screening Examination (MSE) and stabilizing treatment for emergency conditions (including acute drug overdose, severe withdrawal, sepsis, or psychiatric distress) without regard to insurance or ability to pay.',
      es: 'Bajo la ley federal, cualquier hospital con departamento de urgencias debe realizar un Examen de Detección Médica (MSE) y estabilizar condiciones de emergencia (como sobredosis, abstinencia severa, sepsis o crisis psiquiátrica) sin importar seguro ni capacidad de pago.',
    },
  },
  {
    id: 'telehealth_moud_flexibility',
    title: { en: 'Tele-MOUD & Low-Barrier Telehealth Flexibilities', es: 'Flexibilidad de Telemedicina para MOUD y Buprenorfina' },
    citation: 'DEA / SAMHSA Telemedicine Regulations (21 CFR § 1300.04)',
    summary: {
      en: 'Federal rules allow authorized providers to prescribe buprenorphine for opioid use disorder via audio-video or audio-only telephone visits without a prior in-person visit, eliminating transportation hurdles for rural, disabled, or underinsured patients.',
      es: 'Las normativas federales permiten a proveedores autorizados recetar buprenorfina para el trastorno por uso de opioides mediante videollamada o teléfono de audio exclusivo sin examen presencial previo, eliminando barreras de transporte.',
    },
  },
];

// ============================================================================
// 2. 2026 Federal Poverty Guidelines (HHS Poverty Guidelines)
// ============================================================================

export const FPL_2026_GUIDELINES = {
  // Contiguous 48 States and DC (Baseline: $15,650 for household of 1 + $5,380 per addl)
  contiguous: {
    base1: 15650,
    perPerson: 5380,
  },
  // Alaska (Baseline: $19,570 + $6,730 per addl)
  AK: {
    base1: 19570,
    perPerson: 6730,
  },
  // Hawaii (Baseline: $18,010 + $6,190 per addl)
  HI: {
    base1: 18010,
    perPerson: 6190,
  },
};

export function getFplThreshold(householdSize = 1, stateCode = 'US') {
  const size = Math.max(1, parseInt(householdSize, 10) || 1);
  const code = (stateCode || 'US').toUpperCase();
  const rules = FPL_2026_GUIDELINES[code] || FPL_2026_GUIDELINES.contiguous;
  return rules.base1 + (size - 1) * rules.perPerson;
}

// ============================================================================
// 3. Sliding-Fee Scale Tiers
// ============================================================================

export const SLIDING_FEE_TIERS = [
  {
    id: 'nominal_tier',
    minFpl: 0,
    maxFpl: 100,
    name: { en: 'Nominal Fee Tier (0 - 100% FPL)', es: 'Nivel de Tarifa Nominal (0 - 100% FPL)' },
    copaySummary: {
      en: 'Nominal charge only (e.g. $0 to $15). Under federal law (PHSA § 330), care CANNOT be denied if you are unable to pay the nominal fee.',
      es: 'Cobro nominal mínimo (ej. de $0 a $15). Por ley federal (PHSA § 330), NO se puede negar la atención si no puede pagar la tarifa nominal.',
    },
    zeroIncomeAffidavit: true,
  },
  {
    id: 'tier_a',
    minFpl: 101,
    maxFpl: 138,
    name: { en: 'Sliding Fee Tier A (101 - 138% FPL)', es: 'Escala Móvil Nivel A (101 - 138% FPL)' },
    copaySummary: {
      en: 'Deep discount. Also falls within Medicaid expansion income eligibility limits in 41 states and DC.',
      es: 'Descuento profundo. También califica para la expansión de Medicaid en 41 estados y Washington D.C.',
    },
    zeroIncomeAffidavit: false,
  },
  {
    id: 'tier_b',
    minFpl: 139,
    maxFpl: 175,
    name: { en: 'Sliding Fee Tier B (139 - 175% FPL)', es: 'Escala Móvil Nivel B (139 - 175% FPL)' },
    copaySummary: {
      en: 'Substantial discount on medical visits, lab diagnostics, and MOUD pharmacotherapy.',
      es: 'Descuento sustancial en visitas médicas, análisis de laboratorio y farmacoterapia MOUD.',
    },
    zeroIncomeAffidavit: false,
  },
  {
    id: 'tier_c',
    minFpl: 176,
    maxFpl: 200,
    name: { en: 'Sliding Fee Tier C (176 - 200% FPL)', es: 'Escala Móvil Nivel C (176 - 200% FPL)' },
    copaySummary: {
      en: 'Partial discount. Clinic charges a reduced percentage of full customary fee.',
      es: 'Descuento parcial. La clínica cobra un porcentaje reducido de la tarifa habitual completa.',
    },
    zeroIncomeAffidavit: false,
  },
  {
    id: 'full_fee_tier',
    minFpl: 201,
    maxFpl: Infinity,
    name: { en: 'Standard Fee with Payment Plan (> 200% FPL)', es: 'Tarifa Estándar con Plan de Pago (> 200% FPL)' },
    copaySummary: {
      en: 'Full standard fee applies, but clinics offer interest-free hardship payment plans.',
      es: 'Aplica tarifa regular, pero los centros ofrecen planes de pago fraccionados sin intereses.',
    },
    zeroIncomeAffidavit: false,
  },
];

// ============================================================================
// 4. In-RAM Eligibility Engine: evaluateSafetyNetEligibility(inputs)
// ============================================================================

export function evaluateSafetyNetEligibility(inputs = {}) {
  const {
    householdSize = 1,
    annualIncome = 0,
    stateCode = 'US',
    insuranceStatus = 'uninsured', // 'uninsured' | 'underinsured' | 'medicaid' | 'private'
    seekingConfidentiality = false,
    interestedInTelehealth = true,
  } = inputs;

  const validSize = Math.max(1, parseInt(householdSize, 10) || 1);
  const validIncome = Math.max(0, parseFloat(annualIncome) || 0);

  const fplThreshold = getFplThreshold(validSize, stateCode);
  const fplPercentage = Math.round((validIncome / fplThreshold) * 100);

  // Match Sliding-Fee Tier
  let matchedTier = SLIDING_FEE_TIERS[SLIDING_FEE_TIERS.length - 1];
  for (const tier of SLIDING_FEE_TIERS) {
    if (fplPercentage >= tier.minFpl && fplPercentage <= tier.maxFpl) {
      matchedTier = tier;
      break;
    }
  }

  // Key Checklist Items for Safety-Net Clinic Visits
  const documentationChecklist = [];

  if (matchedTier.id === 'nominal_tier' && validIncome === 0) {
    documentationChecklist.push({
      item: { en: 'Zero-Income Self-Attestation Form', es: 'Declaración Jurada de Cero Ingresos' },
      detail: {
        en: 'FQHCs provide a simple 1-page form where you self-attest to zero income if you have no paystubs or tax returns. No third-party tax document is mandatory.',
        es: 'Los FQHC tienen un formulario de 1 página donde usted declara no percibir ingresos si no cuenta con talones de pago ni impuestos.',
      },
    });
  } else if (matchedTier.minFpl <= 200) {
    documentationChecklist.push({
      item: { en: 'Proof of Income (or Self-Declaration)', es: 'Comprobante de Ingresos (o Autodeclaración)' },
      detail: {
        en: '1-2 recent pay stubs, W-2, unemployment benefit letter, or a simple handwritten self-attestation letter if paid in cash.',
        es: '1-2 talones de pago recientes, carta de desempleo o una carta de autodeclaración si recibe pagos en efectivo.',
      },
    });
  }

  documentationChecklist.push({
    item: { en: 'Any Form of Identification (Photo or Non-Photo)', es: 'Cualquier Identificación (Con o Sin Foto)' },
    detail: {
      en: 'A state ID, driver license, foreign passport, consular ID (matrícula), school ID, or work badge. You cannot be turned away for lack of a state driver license.',
      es: 'Identificación estatal, licencia, pasaporte extranjero, matrícula consular o credencial de trabajo. No pueden rechazarle por no tener licencia local.',
    },
  });

  documentationChecklist.push({
    item: { en: 'Proof of Address / Residency (Shelter Letter OK)', es: 'Comprobante de Domicilio (Carta de Refugio Válida)' },
    detail: {
      en: 'Utility bill, lease, mail piece, or a letter from a shelter/outreach worker. If unhoused, clinics have homeless self-certification.',
      es: 'Factura de servicios, contrato, correo o carta de un refugio. Si carece de vivienda fija, el centro tiene autocertificación.',
    },
  });

  // Actionable Statutory Guidance
  const statutoryGuidance = [];

  if (seekingConfidentiality) {
    statutoryGuidance.push({
      title: { en: 'Title X Confidential Rating Protection', es: 'Protección de Confidencialidad bajo el Título X' },
      detail: {
        en: 'When receiving reproductive health, STI, or HIV testing at a Title X site, your fee is calculated based SOLELY on your own income, protecting your privacy from parents, partners, or household members.',
        es: 'Al recibir servicios de salud reproductiva, ITS o VIH en Título X, su tarifa se calcula ÚNICAMENTE sobre sus propios ingresos, protegiendo su privacidad.',
      },
    });
  }

  if (fplPercentage <= 138) {
    statutoryGuidance.push({
      title: { en: 'Presumptive Medicaid Expansion Eligibility', es: 'Elegibilidad Probable para la Expansión de Medicaid' },
      detail: {
        en: 'With income under 138% FPL, you are likely eligible for full Medicaid coverage in expansion states, which covers 100% of MOUD, hospital, and primary care with $0 copays.',
        es: 'Con ingresos menores al 138% del FPL, probablemente califica para Medicaid completo en estados con expansión, cubriendo el 100% de MOUD sin copagos.',
      },
    });
  }

  if (interestedInTelehealth) {
    statutoryGuidance.push({
      title: { en: 'Tele-MOUD Access & Connectivity Programs', es: 'Acceso a Tele-MOUD y Programas de Conectividad' },
      detail: {
        en: 'DEA/SAMHSA rules permit audio-video or phone-only buprenorphine starts. If you need a phone or data plan, FQHC financial counselors can enroll you in the federal Lifeline program.',
        es: 'Las reglas federales permiten iniciar buprenorfina por videollamada o teléfono. Si necesita teléfono o plan de datos, los asesores del FQHC pueden inscribirle en Lifeline.',
      },
    });
  }

  return {
    evaluatedAt: new Date().toISOString(),
    inputs: {
      householdSize: validSize,
      annualIncome: validIncome,
      stateCode,
      insuranceStatus,
      seekingConfidentiality,
      interestedInTelehealth,
    },
    fplThreshold,
    fplPercentage,
    matchedTier,
    documentationChecklist,
    statutoryGuidance,
    programs: FEDERAL_SAFETY_NET_PROGRAMS,
  };
}

// ============================================================================
// 5. In-RAM Ephemeral State Management
// ============================================================================

let safetyNetState = {
  householdSize: 1,
  annualIncome: 12000,
  stateCode: 'US',
  insuranceStatus: 'uninsured',
  seekingConfidentiality: false,
  interestedInTelehealth: true,
  activeTab: 'calculator', // 'calculator' | 'programs' | 'checklist' | 'rights'
  lastEvaluation: null,
};

export function getSafetyNetState() {
  return { ...safetyNetState };
}

export function setSafetyNetState(partial) {
  safetyNetState = { ...safetyNetState, ...partial };
  return getSafetyNetState();
}

export function resetSafetyNetState() {
  safetyNetState = {
    householdSize: 1,
    annualIncome: 12000,
    stateCode: 'US',
    insuranceStatus: 'uninsured',
    seekingConfidentiality: false,
    interestedInTelehealth: true,
    activeTab: 'calculator',
    lastEvaluation: null,
  };
  return getSafetyNetState();
}

// ============================================================================
// 6. Summary Text Formatter (Bilingual Copy/Print)
// ============================================================================

export function formatSafetyNetSummaryText(plan, lang = 'en') {
  if (!plan) return '';
  const isEs = lang === 'es';
  const divider = '======================================================================';
  const subDivider = '----------------------------------------------------------------------';

  const lines = [
    divider,
    isEs
      ? 'PLAN DE ACCESO A RED DE SEGURIDAD Y FQHC - HARBORPATH'
      : 'SAFETY-NET NAVIGATOR & FQHC ACCESS PLAN - HARBORPATH',
    isEs
      ? 'Asistencia epímera en memoria | Cero rastreo | Confidencial'
      : 'In-RAM Ephemeral Decision Support | Zero Tracking | Confidential',
    divider,
    '',
    `${isEs ? 'Tamaño del hogar' : 'Household Size'}: ${plan.inputs.householdSize}`,
    `${isEs ? 'Ingreso anual reportado' : 'Reported Annual Income'}: $${plan.inputs.annualIncome.toLocaleString()}`,
    `${isEs ? 'Línea de pobreza federal (100% FPL)' : '100% Federal Poverty Line'}: $${plan.fplThreshold.toLocaleString()}`,
    `${isEs ? 'Porcentaje de FPL' : 'FPL Percentage'}: ${plan.fplPercentage}%`,
    `${isEs ? 'Nivel de escala móvil asignado' : 'Assigned Sliding Fee Tier'}: ${isEs ? plan.matchedTier.name.es : plan.matchedTier.name.en}`,
    `${isEs ? 'Resumen de costo' : 'Cost Summary'}: ${isEs ? plan.matchedTier.copaySummary.es : plan.matchedTier.copaySummary.en}`,
    '',
  ];

  lines.push(subDivider);
  lines.push(isEs ? 'LISTA DE DOCUMENTOS PARA LLEVAR A LA CLÍNICA:' : 'SAFETY-NET APPOINTMENT DOCUMENTATION CHECKLIST:');
  lines.push(subDivider);
  plan.documentationChecklist.forEach((doc) => {
    lines.push(`- [ ] ${isEs ? doc.item.es : doc.item.en}`);
    lines.push(`      ${isEs ? doc.detail.es : doc.detail.en}`);
  });
  lines.push('');

  lines.push(subDivider);
  lines.push(isEs ? 'DERECHOS LEGALES Y ORIENTACIÓN:' : 'STATUTORY RIGHTS & PROGRAM GUIDANCE:');
  lines.push(subDivider);
  plan.statutoryGuidance.forEach((g) => {
    lines.push(`* ${isEs ? g.title.es : g.title.en}`);
    lines.push(`  ${isEs ? g.detail.es : g.detail.en}`);
  });
  lines.push('');

  lines.push(divider);
  lines.push(
    isEs
      ? 'Línea Nacional SAMHSA: 1-800-662-4357 (Gratis, 24/7, confidencial)'
      : 'SAMHSA National Helpline: 1-800-662-4357 (Free, 24/7, confidential)'
  );
  lines.push(divider);

  return lines.join('\n');
}

// ============================================================================
// 7. Accessible DOM Component: safetyNetNavigatorComponent(containerOrOptions, maybeOptions)
// ============================================================================

export function safetyNetNavigatorComponent(containerOrOptions = {}, maybeOptions = {}) {
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
  const plan = evaluateSafetyNetEligibility(getSafetyNetState());
  setSafetyNetState({ lastEvaluation: plan });

  const root = h('div', { class: 'safety-net-navigator-component' });

  // In-RAM Privacy Banner
  const privacyAlert = h(
    'div',
    { class: 'panel alert-panel', role: 'note', 'aria-label': isEs ? 'Privacidad' : 'Privacy' },
    h('div', { class: 'panel-header' },
      icon('shield', { class: 'panel-icon' }),
      h('h3', { class: 'panel-title' }, isEs ? 'Calculadora Epímera en Memoria' : 'In-RAM Ephemeral Calculator')
    ),
    h('p', { class: 'panel-body' },
      isEs
        ? 'Los datos de ingresos y hogar se procesan temporalmente en la memoria del navegador. No se guardan datos en el disco ni se transmiten a terceros.'
        : 'Income and household numbers are processed in temporary browser memory only. No answers are stored on disk or transmitted to third parties.'
    )
  );
  root.append(privacyAlert);

  // Tab Navigation Bar
  const tabNav = h('div', { class: 'tab-bar', role: 'tablist', 'aria-label': isEs ? 'Secciones de la red de seguridad' : 'Safety net sections' });
  const tabs = [
    { id: 'calculator', label: isEs ? 'Calculadora de Escala Móvil' : 'Sliding Fee Calculator' },
    { id: 'checklist', label: isEs ? 'Qué Llevar a la Cita' : 'Appointment Checklist' },
    { id: 'programs', label: isEs ? 'Programas Federales' : 'Federal Safety-Net' },
    { id: 'rights', label: isEs ? 'Derechos del Paciente' : 'Patient Rights' },
  ];

  const currentTab = safetyNetState.activeTab;

  tabs.forEach((tab) => {
    const isSelected = tab.id === currentTab;
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `tab-btn-sn-${tab.id}`,
      'data-tab': tab.id,
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-controls': `tab-panel-sn-${tab.id}`,
      class: isSelected ? 'tab active' : 'tab',
    }, tab.label);

    btn.addEventListener('click', () => {
      setSafetyNetState({ activeTab: tab.id });
      safetyNetNavigatorComponent(container, options);
    });

    tabNav.append(btn);
  });
  root.append(tabNav);

  // Active Tab Content
  const tabPanel = h('div', {
    id: `tab-panel-sn-${currentTab}`,
    role: 'tabpanel',
    'aria-labelledby': `tab-btn-sn-${currentTab}`,
    class: 'tab-content-panel',
  });

  // --------------------------------------------------------------------------
  // TAB 1: Calculator
  // --------------------------------------------------------------------------
  if (currentTab === 'calculator') {
    const calcCard = h('div', { class: 'card assessment-card' });
    calcCard.append(h('h4', { class: 'card-title' }, isEs ? 'Calculadora de Descuento en Centros FQHC' : 'FQHC Sliding-Fee Discount Estimator'));

    const formGrid = h('div', { class: 'form-grid' });

    // Household Size
    const sizeGroup = h('div', { class: 'form-group' });
    sizeGroup.append(h('label', { for: 'sn-size-select' }, isEs ? 'Número de personas en su hogar:' : 'Number of people in your household:'));
    const sizeSelect = h('select', { id: 'sn-size-select', class: 'input-select' });
    for (let i = 1; i <= 8; i++) {
      const opt = h('option', { value: String(i) }, `${i} ${isEs ? (i === 1 ? 'persona' : 'personas') : (i === 1 ? 'person' : 'people')}`);
      if (safetyNetState.householdSize === i) opt.setAttribute('selected', 'selected');
      sizeSelect.append(opt);
    }
    sizeSelect.addEventListener('change', (e) => {
      setSafetyNetState({ householdSize: parseInt(e.target.value, 10) || 1 });
      safetyNetNavigatorComponent(container, options);
    });
    sizeGroup.append(sizeSelect);
    formGrid.append(sizeGroup);

    // Annual Income
    const incGroup = h('div', { class: 'form-group' });
    incGroup.append(h('label', { for: 'sn-income-select' }, isEs ? 'Ingreso anual aproximado del hogar:' : 'Approximate household annual income:'));
    const incSelect = h('select', { id: 'sn-income-select', class: 'input-select' });
    const incomeOptions = [
      { val: 0, label: isEs ? '$0 (Sin ingresos / Declaración Jurada)' : '$0 (Zero income / Self-attestation)' },
      { val: 10000, label: '$10,000 / yr' },
      { val: 15000, label: '$15,000 / yr' },
      { val: 20000, label: '$20,000 / yr' },
      { val: 25000, label: '$25,000 / yr' },
      { val: 35000, label: '$35,000 / yr' },
      { val: 50000, label: '$50,000 / yr' },
    ];
    incomeOptions.forEach((io) => {
      const opt = h('option', { value: String(io.val) }, io.label);
      if (safetyNetState.annualIncome === io.val) opt.setAttribute('selected', 'selected');
      incSelect.append(opt);
    });
    incSelect.addEventListener('change', (e) => {
      setSafetyNetState({ annualIncome: parseFloat(e.target.value) || 0 });
      safetyNetNavigatorComponent(container, options);
    });
    incGroup.append(incSelect);
    formGrid.append(incGroup);

    // State selection
    const stateGroup = h('div', { class: 'form-group' });
    stateGroup.append(h('label', { for: 'sn-state-select' }, isEs ? 'Ubicación para pauta de pobreza:' : 'Location (Poverty Guideline):'));
    const stateSelect = h('select', { id: 'sn-state-select', class: 'input-select' });
    [
      { code: 'US', label: isEs ? '48 Estados Contiguos y DC' : '48 Contiguous States & DC' },
      { code: 'AK', label: 'Alaska (AK)' },
      { code: 'HI', label: 'Hawaii (HI)' },
    ].forEach((s) => {
      const opt = h('option', { value: s.code }, s.label);
      if (safetyNetState.stateCode === s.code) opt.setAttribute('selected', 'selected');
      stateSelect.append(opt);
    });
    stateSelect.addEventListener('change', (e) => {
      setSafetyNetState({ stateCode: e.target.value });
      safetyNetNavigatorComponent(container, options);
    });
    stateGroup.append(stateSelect);
    formGrid.append(stateGroup);

    calcCard.append(formGrid);

    // Results Card
    const resultBox = h('div', { class: 'card result-tier-box', role: 'region', 'aria-label': isEs ? 'Resultado de escala móvil' : 'Sliding scale result' });
    resultBox.append(h('h4', { class: 'tier-title' }, isEs ? plan.matchedTier.name.es : plan.matchedTier.name.en));

    const metaRow = h('div', { class: 'tier-meta-row' });
    metaRow.append(h('span', { class: 'pill fpl-pill' }, `${plan.fplPercentage}% FPL`));
    metaRow.append(h('span', { class: 'pill threshold-pill' }, `${isEs ? 'Umbral 100%:' : '100% Threshold:'} $${plan.fplThreshold.toLocaleString()}`));
    resultBox.append(metaRow);

    resultBox.append(h('p', { class: 'tier-desc' }, isEs ? plan.matchedTier.copaySummary.es : plan.matchedTier.copaySummary.en));

    if (plan.matchedTier.id === 'nominal_tier') {
      resultBox.append(
        h('p', { class: 'callout callout-success' },
          strong(isEs ? 'Protección Legal § 330: ' : 'PHSA § 330 Protection: '),
          isEs
            ? 'Los centros FQHC tienen prohibido por ley federal rechazar a un paciente por no poder pagar la tarifa nominal.'
            : 'FQHC health centers are legally forbidden under federal law from turning away patients who are unable to pay the nominal charge.'
        )
      );
    }

    calcCard.append(resultBox);
    tabPanel.append(calcCard);
  }

  // --------------------------------------------------------------------------
  // TAB 2: Checklist
  // --------------------------------------------------------------------------
  if (currentTab === 'checklist') {
    const checkCard = h('div', { class: 'card checklist-card' });
    checkCard.append(h('h4', { class: 'card-title' }, isEs ? 'Documentos Recomendados para su Cita' : 'What to Bring to Your Safety-Net Clinic'));
    checkCard.append(p(
      isEs
        ? 'Si le falta algún documento, ¡acuda a su cita de todos modos! Los centros FQHC cuentan con consejeros financieros para ayudarle a tramitar autodeclaraciones.'
        : 'If you are missing any document, go to your appointment anyway! FQHC centers have navigators to help you complete self-attestations.'
    ));

    const docList = h('div', { class: 'checklist-stack' });
    plan.documentationChecklist.forEach((doc) => {
      const itemBox = h('div', { class: 'checklist-item' });
      itemBox.append(h('h5', { class: 'item-title' }, icon('check', { class: 'check-icon' }), isEs ? doc.item.es : doc.item.en));
      itemBox.append(p(isEs ? doc.detail.es : doc.detail.en));
      docList.append(itemBox);
    });
    checkCard.append(docList);
    tabPanel.append(checkCard);
  }

  // --------------------------------------------------------------------------
  // TAB 3: Federal Programs
  // --------------------------------------------------------------------------
  if (currentTab === 'programs') {
    const progCard = h('div', { class: 'card programs-card' });
    progCard.append(h('h4', { class: 'card-title' }, isEs ? 'Programas Federales de Red de Seguridad' : 'Federal Safety-Net Programs'));

    plan.programs.forEach((pr) => {
      const pBox = h('div', { class: 'program-box' });
      pBox.append(h('h5', { class: 'prog-name' }, isEs ? pr.title.es : pr.title.en));
      pBox.append(h('span', { class: 'prog-cite' }, pr.citation));
      pBox.append(p(isEs ? pr.summary.es : pr.summary.en));
      progCard.append(pBox);
    });
    tabPanel.append(progCard);
  }

  // --------------------------------------------------------------------------
  // TAB 4: Patient Rights
  // --------------------------------------------------------------------------
  if (currentTab === 'rights') {
    const rightsCard = h('div', { class: 'card rights-card' });
    rightsCard.append(h('h4', { class: 'card-title' }, isEs ? 'Sus Derechos en el Centro de Salud' : 'Your Legal Rights as a Safety-Net Patient'));

    const rightsList = h('ul', { class: 'rights-bullets' });
    rightsList.append(h('li', {},
      strong(isEs ? 'Sin barreras migratorias: ' : 'No immigration status barriers: '),
      isEs
        ? 'Los centros FQHC no solicitan ni registran estatus migratorio. No reportan a autoridades migratorias.'
        : 'FQHC health centers do not require proof of citizenship and do not report patients to immigration authorities.'
    ));
    rightsList.append(h('li', {},
      strong(isEs ? 'Derecho a intérprete gratuito: ' : 'Right to free medical interpretation: '),
      isEs
        ? 'Bajo el Título VI de la Ley de Derechos Civiles, tiene derecho a un intérprete profesional calificado en su idioma.'
        : 'Under Title VI of the Civil Rights Act, you have the legal right to a qualified medical interpreter in your primary language at zero cost.'
    ));
    rightsList.append(h('li', {},
      strong(isEs ? 'Acceso de urgencia EMTALA: ' : 'EMTALA Emergency Care: '),
      isEs
        ? 'Todo departamento de emergencias hospitalario debe estabilizar sobredosis, abstinencia severa o emergencias médicas sin importar su seguro ni dinero.'
        : 'Any hospital emergency department must evaluate and stabilize severe withdrawal, overdose, or emergencies regardless of funds or insurance.'
    ));
    rightsCard.append(rightsList);
    tabPanel.append(rightsCard);
  }

  root.append(tabPanel);

  // Summary Actions (Print/Copy)
  const actions = h('div', { class: 'actions-row' });
  const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' }, isEs ? 'Copiar Resumen de Ayuda' : 'Copy Safety-Net Plan');
  copyBtn.addEventListener('click', async () => {
    const text = formatSafetyNetSummaryText(plan, lang);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = isEs ? '¡Copiado!' : 'Copied!';
        announce(isEs ? 'Resumen copiado' : 'Plan copied to clipboard');
        setTimeout(() => {
          copyBtn.textContent = isEs ? 'Copiar Resumen de Ayuda' : 'Copy Safety-Net Plan';
        }, 2500);
      } catch {
        // Fallback or ignore
      }
    }
  });
  actions.append(copyBtn);

  const resetBtn = h('button', { type: 'button', class: 'btn btn-ghost' }, isEs ? 'Restablecer' : 'Reset');
  resetBtn.addEventListener('click', () => {
    resetSafetyNetState();
    safetyNetNavigatorComponent(container, options);
  });
  actions.append(resetBtn);

  root.append(actions);

  if (container) {
    container.append(root);
  }
  return root;
}

