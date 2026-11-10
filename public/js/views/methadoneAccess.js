// public/js/views/methadoneAccess.js
// HarborPath — Federal Opioid Treatment Program (OTP) & Methadone Access Specialist
// SAMHSA 42 CFR Part 8 Final Rule (2024), Take-Home Calculator & Patient Rights
// Strictly Zero-PII, In-RAM ephemeral state, WCAG 2.2 AA accessible DOM

import { h, clear, icon } from '../dom.js';
import { t } from '../i18n.js';

/**
 * 2024 SAMHSA 42 CFR Part 8 Final Rule Take-Home Schedule Flexibilities.
 * Section 8.12(i) establishes new accelerated, patient-centered federal maximums.
 */
export const FEDERAL_TAKE_HOME_TIERS_2024 = Object.freeze([
  {
    tierId: 'days_0_14',
    timeframeEn: 'Days 0 to 14 (First 2 Weeks of Treatment)',
    timeframeEs: 'Días 0 a 14 (Primeras 2 semanas de tratamiento)',
    maxTakeHomes: 7,
    federalStandardEn: 'Up to 7 days of take-home doses based on clinician stability assessment. Programs are no longer federally restricted to 1 bottle per week.',
    federalStandardEs: 'Hasta 7 días de dosis para llevar a casa según la evaluación clínica. Los programas ya no están limitados federalmente a 1 botella por semana.'
  },
  {
    tierId: 'days_15_30',
    timeframeEn: 'Days 15 to 30 (Weeks 3 and 4 of Treatment)',
    timeframeEs: 'Días 15 a 30 (Semanas 3 y 4 de tratamiento)',
    maxTakeHomes: 14,
    federalStandardEn: 'Up to 14 days of take-home doses based on clinical assessment of stability and safe home storage.',
    federalStandardEs: 'Hasta 14 días de dosis para llevar según la evaluación clínica de estabilidad y almacenamiento seguro en el hogar.'
  },
  {
    tierId: 'days_31_plus',
    timeframeEn: 'Day 31 and Beyond (Month 2 Onward)',
    timeframeEs: 'Día 31 en adelante (A partir del segundo mes)',
    maxTakeHomes: 28,
    federalStandardEn: 'Up to 28 days of take-home doses (a full month supply) based on clinical stability. The old multi-year waiting ladder is eliminated.',
    federalStandardEs: 'Hasta 28 días de dosis para llevar (suministro de un mes completo) según estabilidad clínica. Se eliminó la antigua escala de años de espera.'
  }
]);

/**
 * Take-home safety checklist. 42 CFR § 8.12(i)(2) (2024) lists six factors the
 * practitioner considers (active SUD/conditions raising overdose risk, attendance,
 * serious behavioral problems, recent diversion, safe transport and storage, and
 * any other relevant criteria); this checklist breaks them into 8 plain-language items.
 */
export const CRITERIA_8_POINT_ASSESSMENT = Object.freeze([
  {
    id: 'crit_toxicity',
    titleEn: '1. Absence of Recent Acute Toxicity / Impairment',
    titleEs: '1. Ausencia de toxicidad aguda o intoxicación reciente',
    descEn: 'Patient is not actively sedated, intoxicated, or experiencing acute adverse drug events.',
    descEs: 'El paciente no presenta sedación activa, intoxicación ni eventos adversos agudos por medicamentos.'
  },
  {
    id: 'crit_attendance',
    titleEn: '2. Regular Clinic Attendance',
    titleEs: '2. Asistencia regular a la clínica',
    descEn: 'Patient attends required dosing and clinical check-in appointments reliably.',
    descEs: 'El paciente asiste de manera confiable a sus citas de dosificación y chequeos clínicos requeridos.'
  },
  {
    id: 'crit_behavior',
    titleEn: '3. Absence of Serious Behavioral Problems',
    titleEs: '3. Ausencia de problemas graves de conducta en la clínica',
    descEn: 'Patient does not engage in disruptive, abusive, or dangerous conduct at the facility.',
    descEs: 'El paciente no muestra conducta agresiva, amenazante ni peligrosa en las instalaciones.'
  },
  {
    id: 'crit_diversion',
    titleEn: '4. Absence of Known Diversion Activity',
    titleEs: '4. Ausencia de actividad de desvío conocida',
    descEn: 'No known illicit diversion, selling, or sharing of dispensed medication.',
    descEs: 'No hay antecedentes comprobados de venta, desvío o intercambio ilícito de medicamentos.'
  },
  {
    id: 'crit_safe_storage',
    titleEn: '5. Safe Home Storage (Lockbox)',
    titleEs: '5. Almacenamiento seguro en el hogar (caja de seguridad)',
    descEn: 'Patient has a secure, locked container (lockbox) to protect medication from children and pets.',
    descEs: 'El paciente cuenta con una caja con llave o candado para proteger el medicamento de niños y mascotas.'
  },
  {
    id: 'crit_benefit_vs_risk',
    titleEn: '6. Rehabilitative Benefit vs. Potential Risks',
    titleEs: '6. Beneficio rehabilitador frente a riesgos potenciales',
    descEn: 'Decreased clinic visits improve employment, family stability, and recovery autonomy.',
    descEs: 'Menos visitas a la clínica mejoran el empleo, la vida familiar y la autonomía en la recuperación.'
  },
  {
    id: 'crit_recovery_stage',
    titleEn: '7. Stage of Recovery & Readiness',
    titleEs: '7. Etapa de recuperación y disposición del paciente',
    descEn: 'Patient demonstrates understanding of take-home dosing safety and willingness to adhere to medical plan.',
    descEs: 'El paciente demuestra comprensión de la seguridad de las dosis para llevar y compromiso con su plan médico.'
  },
  {
    id: 'crit_transportation',
    titleEn: '8. Access to Secure Transportation',
    titleEs: '8. Acceso a transporte seguro',
    descEn: 'Ability to transport take-home bottles directly to the home environment securely.',
    descEs: 'Capacidad para trasladar las botellas directamente al hogar de manera segura y confidencial.'
  }
]);

/**
 * Pharmacokinetics, Dosing Safety, and Clinical Directives for Methadone.
 */
export const METHADONE_PHARMACOKINETICS_SAFETY = Object.freeze({
  inductionEn: {
    title: 'Induction & Initial Dosing Safety',
    startDose: 'Initial dose: many clinicians start conservatively at 20 mg to 30 mg PO and observe before any extra Day 1 dose, especially without recent fentanyl or high-dose opioid use. Federal rule (42 CFR § 8.12(h)(3)(ii), as revised in 2024): the total first-day dose should not exceed 50 mg unless the OTP practitioner finds sufficient medical rationale and documents in the patient record that a higher dose was clinically indicated.',
    titration: 'Dose increases should not exceed 5 mg to 10 mg every 3 to 7 days, allowing tissue equilibrium.',
    doseStackingWarning: 'CRITICAL: Methadone has a long elimination half-life (24 to 36+ hours) but a shorter analgesic/sedating duration (4 to 8 hours). Patients may feel withdrawal returning on Day 2 or 3 and assume the dose is too low. Increasing the dose too quickly leads to fatal cumulative tissue accumulation ("dose stacking") around Days 3 to 7.',
    naloxoneReboundWarning: 'LONG-ACTING REBOUND DIRECTIVE: Naloxone half-life is 30 to 90 minutes. Methadone half-life is 24 to 36+ hours. Following naloxone reversal of methadone overdose, the patient WILL experience recurrent respiratory depression once naloxone wears off. Continuous hospital ED monitoring for at least 12 to 24 hours is non-negotiable.'
  },
  inductionEs: {
    title: 'Seguridad en la Inducción y Dosificación Inicial',
    startDose: 'Dosis inicial: muchos clínicos empiezan de forma conservadora con 20 mg a 30 mg vía oral y observan antes de dar cualquier dosis adicional el Día 1, sobre todo sin consumo reciente de fentanilo u opioides en dosis altas. Norma federal (42 CFR § 8.12(h)(3)(ii), revisada en 2024): la dosis total del primer día no debe superar 50 mg, salvo que el profesional del OTP tenga una justificación médica suficiente y documente en el expediente del paciente que una dosis mayor estaba clínicamente indicada.',
    titration: 'Los incrementos no deben superar 5 mg a 10 mg cada 3 a 7 días para permitir equilibrio tisular.',
    doseStackingWarning: 'CRÍTICO: La metadona tiene una vida media prolongada (24 a 36+ horas) pero una duración analgésica más corta (4 a 8 horas). Los pacientes pueden sentir molestias en el Día 2 o 3 y pensar que la dosis es insuficiente. Aumentar la dosis con demasiada rapidez provoca una acumulación tisular acumulativa mortal ("apilamiento de dosis") entre los Días 3 y 7.',
    naloxoneReboundWarning: 'DIRECTIVA DE REBOTE POR EFECTO PROLONGADO: La naloxona dura 30 a 90 minutos. La metadona dura 24 a 36+ horas. Tras revertir una sobredosis de metadona con naloxona, la persona volverá a dejar de respirar cuando la naloxona se disipe. La observación hospitalaria durante al menos 12 a 24 horas es indispensable.'
  },
  cardiacEn: {
    title: 'Cardiac Safety & QTc Prolongation',
    mechanism: 'Methadone blocks the hERG potassium channel in cardiac myocytes, which can prolong the QTc interval and create risk for Torsades de Pointes (TdP) ventricular arrhythmia.',
    riskFactors: [
      'High daily doses (>100 mg to 120 mg/day).',
      'Concomitant QT-prolonging medications (azoles, macrolides, fluoroquinolones, citalopram, ondansetron).',
      'Electrolyte disturbances (hypokalemia or hypomagnesemia from vomiting, diarrhea, or diuretics).',
      'Underlying congenital long QT syndrome or severe structural heart disease.'
    ],
    management: 'Baseline ECG is recommended when risk factors exist or prior to exceeding 100 mg/day. If QTc exceeds 500 ms, clinicians should discuss dose reduction, split-dosing, or transitioning to buprenorphine.'
  },
  cardiacEs: {
    title: 'Seguridad Cardíaca y Prolongación del QTc',
    mechanism: 'La metadona bloquea el canal de potasio hERG en el corazón, lo que puede prolongar el intervalo QTc y generar riesgo de arritmia ventricular (Torsades de Pointes).',
    riskFactors: [
      'Dosis diarias elevadas (>100 mg a 120 mg/día).',
      'Medicamentos concomitantes que prolongan el QT (antifúngicos, macrólidos, citalopram, ondansetrón).',
      'Alteraciones de electrolitos (hipopotasemia o hipomagnesemia por vómitos, diarrea o diuréticos).',
      'Síndrome de QT largo congénito o cardiopatía estructural previa.'
    ],
    management: 'Se recomienda un electrocardiograma basal si existen factores de riesgo o antes de superar 100 mg/día. Si el QTc supera 500 ms, se debe evaluar reducción de dosis o cambio a buprenorfina.'
  }
});

/**
 * 2024 SAMHSA Part 8 Patient Rights & Anti-Punitive Regulations.
 */
export const PATIENT_RIGHTS_2024 = Object.freeze([
  {
    topicEn: 'Elimination of the 1-Year Addiction History Rule',
    topicEs: 'Eliminación del Requisito de 1 Año de Historial de Adicción',
    ruleEn: 'Under the 2024 Final Rule, patients no longer need to prove an active 1-year history of continuous opioid addiction. Anyone meeting clinical criteria for moderate-to-severe OUD can be admitted immediately.',
    ruleEs: 'Bajo la regla final de 2024, los pacientes ya no necesitan demostrar 1 año continuo de adicción a opioides. Cualquier persona que cumpla criterios clínicos para OUD moderado a severo puede ingresar de inmediato.'
  },
  {
    topicEn: 'Protection Against Punitive Toxicology Actions',
    topicEs: 'Protección Frente a Sanciones Punitivas por Toxicología',
    ruleEn: 'The 2024 Part 8 rule removed the old requirement that take-home eligibility rest on toxicology results showing sustained abstinence; take-home decisions now rest on the practitioner\'s clinical judgment of the factors in 42 CFR § 8.12(i)(2). In the rule\'s preamble, SAMHSA states that toxicology testing is a clinical tool to inform treatment and should never be used punitively, and discharge decisions must be patient-centered and documented. The regulation text does not expressly bar a program from considering a positive test, so ask for any change to be explained in clinical terms, and use the program\'s required grievance process if you disagree.',
    ruleEs: 'La regla de la Parte 8 de 2024 eliminó el antiguo requisito de que la elegibilidad para dosis para llevar dependiera de pruebas toxicológicas que demostraran abstinencia sostenida; ahora depende del criterio clínico del profesional según los factores de 42 CFR § 8.12(i)(2). En el preámbulo de la regla, SAMHSA afirma que las pruebas toxicológicas son una herramienta clínica para orientar el tratamiento y nunca deben usarse de forma punitiva, y que las decisiones de alta deben centrarse en el paciente y documentarse. El texto del reglamento no prohíbe expresamente que el programa tome en cuenta una prueba positiva; pida que cualquier cambio se le explique en términos clínicos y use el proceso de quejas obligatorio del programa si no está de acuerdo.'
  },
  {
    topicEn: 'Right to Safe, Patient-Paced Voluntary Tapers',
    topicEs: 'Derecho a Reducciones Graduales Voluntarias y Seguras',
    ruleEn: 'Rapid forced administrative tapers ("curb tapering" over 3–7 days) are clinically dangerous, dramatically spike fatal overdose rates, and violate modern standards of care. Tapers must be voluntary and clinically supported.',
    ruleEs: 'Las reducciones forzadas rápidas ("detox administrativa" en 3 a 7 días) son peligrosas, aumentan drásticamente el riesgo de muerte por sobredosis y violan los estándares de atención. La reducción debe ser voluntaria y acompañada médicamente.'
  },
  {
    topicEn: 'Telehealth Initiation Rights in OTPs',
    topicEs: 'Derechos de Inicio por Telemedicina en Clínicas OTP',
    ruleEn: 'OTPs can initiate buprenorphine via audio-visual or audio-only telehealth. Methadone initiation is permitted via audio-visual telehealth following clinical assessment by an authorized OTP practitioner.',
    ruleEs: 'Las clínicas OTP pueden iniciar buprenorfina por telemedicina de audio y video o solo audio. El inicio de metadona está autorizado por telemedicina con audio y video tras evaluación clínica.'
  }
]);

/**
 * Evaluates patient take-home eligibility under 2024 Part 8 guidelines.
 *
 * @param {Object} params
 * @param {number} [params.daysInTreatment=0]
 * @param {Array<string>} [params.selectedCriteria=[]]
 * @param {boolean} [params.hasLockbox=true]
 * @returns {Object} Evaluation result with max federal take-homes and advocacy recommendations.
 */
export function evaluateTakeHomeEligibility({ daysInTreatment = 0, selectedCriteria = [], hasLockbox = true } = {}) {
  // Determine theoretical federal tier cap
  let tierMax = 7;
  let currentTier = FEDERAL_TAKE_HOME_TIERS_2024[0];

  if (daysInTreatment >= 31) {
    tierMax = 28;
    currentTier = FEDERAL_TAKE_HOME_TIERS_2024[2];
  } else if (daysInTreatment >= 15) {
    tierMax = 14;
    currentTier = FEDERAL_TAKE_HOME_TIERS_2024[1];
  }

  // Safety gating: lockbox is mandatory for all multi-day take-homes
  if (!hasLockbox) {
    return {
      eligibleTakeHomes: 0,
      tierMax,
      currentTier,
      isBlockedByLockbox: true,
      summaryEn: 'A secure locked container (lockbox) is mandatory for take-home medication dispensing under federal safety standards.',
      summaryEs: 'Se requiere obligatoriamente una caja con llave o candado para el suministro de dosis para llevar según las normas de seguridad federales.',
      recommendationEn: 'Acquire a lockbox (available free at many syringe services programs or under $15 at retail stores) to unlock take-home eligibility.',
      recommendationEs: 'Consiga una caja de seguridad con llave (disponible gratis en muchos programas de reducción de daños o por menos de $15 en tiendas).'
    };
  }

  const criteriaCount = selectedCriteria.length;
  const totalCriteria = CRITERIA_8_POINT_ASSESSMENT.length;
  const isFullySupported = criteriaCount >= 6;

  let eligibleTakeHomes = tierMax;
  if (!isFullySupported) {
    // If fewer than 6 criteria are met, clinical guidance supports a conservative step-up
    eligibleTakeHomes = Math.min(tierMax, Math.max(1, Math.floor((criteriaCount / totalCriteria) * tierMax)));
  }

  return {
    eligibleTakeHomes,
    tierMax,
    currentTier,
    criteriaCount,
    totalCriteria,
    isBlockedByLockbox: false,
    isFullySupported,
    summaryEn: `Under the 2024 SAMHSA Part 8 Final Rule, based on ${daysInTreatment} days in treatment and meeting ${criteriaCount} of ${totalCriteria} clinical criteria, you are federally eligible for up to ${eligibleTakeHomes} take-home doses (Federal maximum cap for your timeframe: ${tierMax} bottles).`,
    summaryEs: `Bajo la Regla Final de 2024 de SAMHSA Parte 8, con ${daysInTreatment} días en tratamiento y cumpliendo ${criteriaCount} de ${totalCriteria} criterios clínicos, es elegible federalmente para hasta ${eligibleTakeHomes} botellas para llevar (Tope federal para su etapa: ${tierMax} botellas).`,
    recommendationEn: isFullySupported
      ? 'Your clinical profile strongly supports maximum federal take-home flexibilities. Use the advocacy script below if your clinic continues enforcing outdated pre-2024 schedules.'
      : 'You meet key stability indicators. Discuss with your counselor which specific remaining areas (e.g., attendance consistency or medical check-ins) will help unlock the next step in your take-home schedule.'
  };
}

/**
 * Builds patient self-advocacy scripts for common clinic challenges.
 *
 * @param {Object} params
 * @param {string} params.scriptType - 'takehome_request' | 'toxicology_advocacy' | 'guest_dosing' | 'voluntary_taper'
 * @param {string} [params.patientName='']
 * @param {string} [params.destinationCity='']
 * @returns {string} Script text
 */
export function buildAdvocacyScript({ scriptType = 'takehome_request', patientName = '', destinationCity = '' } = {}) {
  if (scriptType === 'takehome_request') {
    return '“Hello. I am requesting a clinical review of my take-home medication schedule under the 2024 SAMHSA 42 CFR Part 8 Final Rule flexibilities. I have maintained regular attendance, have a secure lockbox at home, and have no acute safety concerns. Decreasing my clinic visits will directly support my employment and family stability. I would like to establish an updated take-home plan with my doctor.”';
  }

  if (scriptType === 'toxicology_advocacy') {
    return '“I understand that my recent drug screen showed a positive result. The 2024 federal Part 8 rule (42 CFR § 8.12) bases take-home decisions on my clinician\'s overall clinical judgment rather than on toxicology results alone, and SAMHSA has stated that drug testing is a clinical tool that should never be used punitively. I am committed to my recovery, and I would like to discuss what clinical supports or dose adjustments we can put in place rather than destabilizing my progress. If my take-homes or enrollment change, please explain the clinical reasons and how I can use the grievance process.”';
  }

  if (scriptType === 'guest_dosing') {
    const dest = destinationCity.trim() ? destinationCity.trim() : '[Destination City/State]';
    return `“Hello. I will be traveling to ${dest} from [Start Date] to [End Date] for personal/work reasons. Under federal courtesy dosing rules, I am requesting that our clinic send my verified guest dosing paperwork, dosing records, and medical sign-off to a certified OTP clinic in that area. Please let me know what documents you need from me so we can complete this at least 5 business days in advance.”`;
  }

  if (scriptType === 'voluntary_taper') {
    return '“I am interested in discussing a gradual, voluntary dose reduction plan. Under modern evidence-based guidelines and federal standards, tapers must be patient-paced, collaborative, and monitored for withdrawal symptoms. If at any point I experience intense cravings, insomnia, or instability, I reserve the right to pause the reduction or return to my stable holding dose.”';
  }

  return '';
}

/**
 * In-RAM Ephemeral State for Methadone Access View.
 */
let methadoneState = {
  activeTab: 'takehome-calc', // 'takehome-calc' | 'patient-rights' | 'pharmacokinetics' | 'guest-dosing' | 'advocacy-scripts'
  daysInTreatment: 45,
  hasLockbox: true,
  selectedCriteria: [
    'crit_toxicity',
    'crit_attendance',
    'crit_behavior',
    'crit_diversion',
    'crit_safe_storage',
    'crit_benefit_vs_risk'
  ],
  selectedScriptType: 'takehome_request',
  guestDestination: ''
};

export function getMethadoneState() {
  return { ...methadoneState };
}

export function setMethadoneState(patch) {
  methadoneState = { ...methadoneState, ...patch };
}

export function resetMethadoneState() {
  methadoneState = {
    activeTab: 'takehome-calc',
    daysInTreatment: 45,
    hasLockbox: true,
    selectedCriteria: [
      'crit_toxicity',
      'crit_attendance',
      'crit_behavior',
      'crit_diversion',
      'crit_safe_storage',
      'crit_benefit_vs_risk'
    ],
    selectedScriptType: 'takehome_request',
    guestDestination: ''
  };
}

/**
 * Formats a plain text clinical & patient rights summary report.
 *
 * @param {Object} state
 * @param {string} [lang='en']
 * @returns {string} Plain text summary
 */
export function formatMethadoneSummaryText(state = methadoneState, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateTakeHomeEligibility({
    daysInTreatment: state.daysInTreatment,
    selectedCriteria: state.selectedCriteria,
    hasLockbox: state.hasLockbox
  });

  const lines = [
    isEs ? 'HARBORPATH — REPORTE DE DERECHOS Y METADONA (42 CFR PARTE 8)' : 'HARBORPATH — METHADONE ACCESS & 42 CFR PART 8 REPORT',
    isEs ? `Fecha y hora: ${new Date().toISOString()}` : `Generated: ${new Date().toISOString()}`,
    '------------------------------------------------------------',
    isEs ? 'EVALUACIÓN DE DOSIS PARA LLEVAR (2024 FINAL RULE):' : 'TAKE-HOME MEDICATION EVALUATION (2024 FINAL RULE):',
    isEs ? evalResult.summaryEs : evalResult.summaryEn,
    isEs ? `Recomendación: ${evalResult.recommendationEn}` : `Recommendation: ${evalResult.recommendationEn}`,
    '',
    isEs ? 'PUNTOS CLAVE DE SEGURIDAD FARMACOCINÉTICA:' : 'PHARMACOKINETIC SAFETY PEARLS:',
    isEs
      ? '- La metadona tarda 3 a 7 días en acumularse en tejidos (evitar aumentos rápidos para prevenir sobredosis).'
      : '- Methadone takes 3 to 7 days to reach steady-state tissue equilibrium (avoid rapid dose increases).',
    isEs
      ? '- Tras revertir con naloxona, la persona DEBE observarse en hospital 12 a 24 horas por riesgo de rebote respiratorio.'
      : '- After naloxone reversal, 12 to 24 hour hospital ED monitoring is required due to methadone long half-life.',
    isEs
      ? '- Electrocardiograma (ECG) recomendado si la dosis supera 100 mg/día o con fármacos que alargan el QTc.'
      : '- ECG monitoring recommended for daily doses >100 mg or with concomitant QT-prolonging medications.',
    '',
    isEs ? 'DERECHOS FEDERALES DEL PACIENTE:' : 'FEDERAL PATIENT RIGHTS (2024 FINAL RULE):',
    isEs
      ? '- Se eliminó el requisito de 1 año de historial de adicción para el ingreso a la clínica.'
      : '- The 1-year opioid addiction history requirement is permanently eliminated for clinic admission.',
    isEs
      ? '- SAMHSA indica que las pruebas toxicológicas son una herramienta clínica y nunca deben usarse de forma punitiva; las decisiones sobre dosis para llevar se basan en el criterio clínico.'
      : '- SAMHSA states toxicology testing is a clinical tool that should never be used punitively; take-home decisions rest on clinical judgment.',
    isEs
      ? '- Las reducciones forzadas rápidas están prohibidas; los tapers deben ser voluntarios y acordados.'
      : '- Forced rapid administrative tapers violate clinical standards; reductions must be patient-paced.',
    '------------------------------------------------------------',
    isEs
      ? 'Aviso: Esta herramienta es una guía educativa clínica y de derechos. No sustituye el asesoramiento legal ni médico.'
      : 'Disclaimer: This tool provides educational and statutory guidance. It does not substitute professional medical or legal advice.'
  ];

  return lines.join('\n');
}

/**
 * Main View Renderer for Methadone Access.
 *
 * @returns {HTMLElement}
 */
export function methadoneAccessView() {
  const container = h('div', { class: 'methadone-access-view container' });

  // Header Section
  const header = h('header', { class: 'view-header' },
    h('div', { class: 'badge-pill' }, icon('shield'), t('methadone.badge', 'Federal OTP Regulations & Patient Rights')),
    h('h1', null, t('methadone.title', 'Methadone Clinic Access, 2024 Part 8 Rules & Patient Rights')),
    h('p', { class: 'lead' },
      t('methadone.lead', 'Understand your federal rights under the landmark 2024 SAMHSA 42 CFR Part 8 Final Rule, calculate take-home bottle eligibility, prevent dangerous rapid tapers, and advocate for respectful care.')
    )
  );

  // Accessible Tab Navigation
  const tabNav = h('div', { class: 'tab-nav', role: 'tablist', 'aria-label': t('methadone.tablist', 'Methadone Access Navigation') });

  const tabs = [
    { id: 'takehome-calc', label: t('methadone.tab.calc', 'Take-Home Calculator') },
    { id: 'patient-rights', label: t('methadone.tab.rights', '2024 Patient Rights') },
    { id: 'pharmacokinetics', label: t('methadone.tab.safety', 'Dosing Safety & QTc') },
    { id: 'guest-dosing', label: t('methadone.tab.travel', 'Guest Dosing & Travel') },
    { id: 'advocacy-scripts', label: t('methadone.tab.scripts', 'Self-Advocacy Scripts') }
  ];

  const tabButtons = new Map();
  const contentArea = h('div', { class: 'tab-content-area', id: 'methadone-content-slot', 'aria-live': 'polite' });

  function switchTab(newTabId) {
    methadoneState.activeTab = newTabId;
    for (const [id, btn] of tabButtons) {
      const isActive = id === newTabId;
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
    renderActiveTab();
  }

  for (const tab of tabs) {
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      class: 'tab-btn' + (methadoneState.activeTab === tab.id ? ' active' : ''),
      id: `tab-methadone-${tab.id}`,
      'aria-selected': methadoneState.activeTab === tab.id ? 'true' : 'false',
      'aria-controls': `panel-methadone-${tab.id}`,
      tabindex: methadoneState.activeTab === tab.id ? '0' : '-1'
    }, tab.label);

    btn.addEventListener('click', () => switchTab(tab.id));
    tabButtons.set(tab.id, btn);
    tabNav.appendChild(btn);
  }

  // Keyboard navigation for tablist (roving tabindex)
  tabNav.addEventListener('keydown', (e) => {
    const tabIds = tabs.map((t) => t.id);
    const currIndex = tabIds.indexOf(methadoneState.activeTab);
    let nextIndex = currIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currIndex + 1) % tabIds.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currIndex - 1 + tabIds.length) % tabIds.length;
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextIndex = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextIndex = tabIds.length - 1;
      e.preventDefault();
    }

    if (nextIndex !== currIndex) {
      const nextId = tabIds[nextIndex];
      switchTab(nextId);
      const nextBtn = tabButtons.get(nextId);
      if (nextBtn) nextBtn.focus();
    }
  });

  // Render Tab Content
  function renderActiveTab() {
    clear(contentArea);
    const activeTab = methadoneState.activeTab;
    const panel = h('section', {
      role: 'tabpanel',
      id: `panel-methadone-${activeTab}`,
      'aria-labelledby': `tab-methadone-${activeTab}`,
      class: 'tab-panel'
    });

    if (activeTab === 'takehome-calc') {
      renderTakeHomeCalculator(panel);
    } else if (activeTab === 'patient-rights') {
      renderPatientRights(panel);
    } else if (activeTab === 'pharmacokinetics') {
      renderPharmacokinetics(panel);
    } else if (activeTab === 'guest-dosing') {
      renderGuestDosing(panel);
    } else if (activeTab === 'advocacy-scripts') {
      renderAdvocacyScripts(panel);
    }

    contentArea.appendChild(panel);
  }

  // TAB 1: Take-Home Calculator & 8-Point Assessment
  function renderTakeHomeCalculator(panel) {
    panel.appendChild(h('h2', null, t('methadone.calc.title', 'Take-Home Bottle Eligibility Calculator')));
    panel.appendChild(h('p', null, t('methadone.calc.intro', 'The 2024 SAMHSA Part 8 Final Rule eliminated the outdated multi-year waiting ladder. Calculate the federal maximum take-home bottles you are eligible for based on your timeframe and the clinical safety checklist below.')));

    const form = h('div', { class: 'form-card' });

    // Days in Treatment Input
    const daysLabel = h('label', { for: 'input-treatment-days', class: 'field-label' },
      h('strong', null, t('methadone.daysLabel', 'Days in Treatment: '))
    );
    const daysInput = h('input', {
      type: 'number',
      id: 'input-treatment-days',
      min: '0',
      max: '3650',
      value: String(methadoneState.daysInTreatment),
      class: 'input-field'
    });
    daysInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      methadoneState.daysInTreatment = isNaN(val) ? 0 : Math.max(0, val);
      updateCalcResult();
    });

    form.appendChild(daysLabel);
    form.appendChild(daysInput);

    // Lockbox Checkbox
    const lockboxLabel = h('label', { class: 'checkbox-label' },
      h('input', {
        type: 'checkbox',
        id: 'chk-lockbox',
        ...(methadoneState.hasLockbox ? { checked: 'checked' } : {})
      }),
      h('span', null, t('methadone.lockboxLabel', 'I have a secure locked container (lockbox) at home (Mandatory under federal safety standards)'))
    );
    lockboxLabel.querySelector('input').addEventListener('change', (e) => {
      methadoneState.hasLockbox = e.target.checked;
      updateCalcResult();
    });
    form.appendChild(lockboxLabel);

    // 8-Point Criteria Checkboxes
    form.appendChild(h('h3', null, t('methadone.criteriaTitle', 'Take-home safety checklist (based on the factors in 42 CFR § 8.12(i)(2)):')));

    for (const crit of CRITERIA_8_POINT_ASSESSMENT) {
      const isChecked = methadoneState.selectedCriteria.includes(crit.id);
      const critLabel = h('label', { class: 'checkbox-label' },
        h('input', {
          type: 'checkbox',
          id: crit.id,
          ...(isChecked ? { checked: 'checked' } : {})
        }),
        h('span', null, h('strong', null, crit.titleEn), ' — ', crit.descEn)
      );
      critLabel.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!methadoneState.selectedCriteria.includes(crit.id)) {
            methadoneState.selectedCriteria.push(crit.id);
          }
        } else {
          methadoneState.selectedCriteria = methadoneState.selectedCriteria.filter((id) => id !== crit.id);
        }
        updateCalcResult();
      });
      form.appendChild(critLabel);
    }

    panel.appendChild(form);

    // Output Result Card
    const resultCard = h('div', { class: 'script-preview-card', id: 'takehome-calc-output' });
    panel.appendChild(resultCard);

    function updateCalcResult() {
      clear(resultCard);
      const res = evaluateTakeHomeEligibility({
        daysInTreatment: methadoneState.daysInTreatment,
        selectedCriteria: methadoneState.selectedCriteria,
        hasLockbox: methadoneState.hasLockbox
      });

      resultCard.appendChild(h('h3', null,
        res.isBlockedByLockbox
          ? t('methadone.lockboxRequired', 'Action Required: Lockbox Missing')
          : t('methadone.eligibleTitle', `Federal Maximum Eligibility: Up to ${res.eligibleTakeHomes} Take-Home Doses`)
      ));
      resultCard.appendChild(h('p', { class: 'lead' }, res.summaryEn));
      resultCard.appendChild(h('p', null, h('strong', null, t('methadone.recHeader', 'Clinical Guidance: ')), res.recommendationEn));

      resultCard.appendChild(h('h4', null, t('methadone.federalTiersHeader', '2024 Federal Part 8 Maximum Schedule:')));
      const tierList = h('ul', null,
        FEDERAL_TAKE_HOME_TIERS_2024.map((tier) => h('li', null,
          h('strong', null, tier.timeframeEn), ': ', `Up to ${tier.maxTakeHomes} doses — `, tier.federalStandardEn
        ))
      );
      resultCard.appendChild(tierList);
    }

    updateCalcResult();

    // Export Button
    const exportBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary'
    }, icon('share'), t('methadone.copySummary', 'Copy Take-Home Evaluation Report'));

    exportBtn.addEventListener('click', () => {
      const summary = formatMethadoneSummaryText(methadoneState);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(summary).then(() => {
          exportBtn.textContent = t('methadone.copied', 'Report Copied to Clipboard!');
          setTimeout(() => {
            exportBtn.textContent = t('methadone.copySummary', 'Copy Take-Home Evaluation Report');
          }, 2500);
        });
      }
    });

    panel.appendChild(exportBtn);
  }

  // TAB 2: 2024 Patient Rights & Anti-Punitive Regulations
  function renderPatientRights(panel) {
    panel.appendChild(h('h2', null, t('methadone.rights.title', '2024 SAMHSA Part 8 Patient Rights')));
    panel.appendChild(h('p', null, t('methadone.rights.intro', 'The 2024 Final Rule represents the most significant update to federal OTP regulations in over 20 years. Know your statutory protections:')));

    const grid = h('div', { class: 'pathway-cards-grid' });
    for (const right of PATIENT_RIGHTS_2024) {
      const card = h('article', { class: 'action-card' },
        h('h3', null, right.topicEn),
        h('p', null, right.ruleEn)
      );
      grid.appendChild(card);
    }
    panel.appendChild(grid);
  }

  // TAB 3: Dosing Safety, Pharmacokinetics & QTc
  function renderPharmacokinetics(panel) {
    panel.appendChild(h('h2', null, t('methadone.safety.title', 'Pharmacokinetics, Induction Safety & Cardiac QTc')));
    panel.appendChild(h('p', null, t('methadone.safety.intro', 'Methadone has unique pharmacology. Understanding tissue accumulation ("dose stacking") and cardiac safety protects patient health.')));

    const indCard = h('article', { class: 'action-card' },
      h('h3', null, METHADONE_PHARMACOKINETICS_SAFETY.inductionEn.title),
      h('p', null, h('strong', null, 'Initial Dosing: '), METHADONE_PHARMACOKINETICS_SAFETY.inductionEn.startDose),
      h('p', null, h('strong', null, 'Titration Rate: '), METHADONE_PHARMACOKINETICS_SAFETY.inductionEn.titration),
      h('p', { class: 'danger-text' }, METHADONE_PHARMACOKINETICS_SAFETY.inductionEn.doseStackingWarning),
      h('p', { class: 'danger-text' }, METHADONE_PHARMACOKINETICS_SAFETY.inductionEn.naloxoneReboundWarning)
    );
    panel.appendChild(indCard);

    const cardCard = h('article', { class: 'action-card' },
      h('h3', null, METHADONE_PHARMACOKINETICS_SAFETY.cardiacEn.title),
      h('p', null, METHADONE_PHARMACOKINETICS_SAFETY.cardiacEn.mechanism),
      h('h4', null, 'QTc Risk Factors:'),
      h('ul', null,
        METHADONE_PHARMACOKINETICS_SAFETY.cardiacEn.riskFactors.map((r) => h('li', null, r))
      ),
      h('p', null, h('strong', null, 'Clinical Management: '), METHADONE_PHARMACOKINETICS_SAFETY.cardiacEn.management)
    );
    panel.appendChild(cardCard);

    const cardioOncLinkCard = h('article', { class: 'action-card' },
      h('h3', null, 'Advanced QTc / Torsades Protocols & Split-Dose Cancer Analgesia on Methadone'),
      h('p', null, 'Need emergency bedside management for QTc > 500 ms / Torsades de Pointes (2g IV MgSO4 + K+ > 4.5 mEq/L while preserving MOUD) or ASCO/NCCN TID/QID split-dosing of methadone for severe cancer or sickle cell pain?'),
      h('p', null,
        h('a', { href: '#/cardiology-care', class: 'btn btn-secondary' }, 'Open Cardiology & QTc / Torsades Navigator →'),
        ' ',
        h('a', { href: '#/oncology-palliative', class: 'btn btn-secondary' }, 'Open Oncology, Palliative & Sickle Cell Pain Navigator →')
      )
    );
    panel.appendChild(cardioOncLinkCard);
  }

  // TAB 4: Guest Dosing & Travel Navigator
  function renderGuestDosing(panel) {
    panel.appendChild(h('h2', null, t('methadone.travel.title', 'Guest Dosing & Travel Rights Navigator')));
    panel.appendChild(h('p', null, t('methadone.travel.intro', 'Traveling while on methadone requires coordination between your home clinic and a host OTP clinic in your destination city.')));

    const card = h('article', { class: 'action-card' },
      h('h3', null, 'Guest Dosing Checklist & Step-by-Step Procedure'),
      h('ul', null,
        h('li', null, h('strong', null, '1. Plan in Advance: '), 'Inform your home counselor at least 1 to 2 weeks before travel (minimum 5 business days required).'),
        h('li', null, h('strong', null, '2. Identify Host OTP: '), 'Find a certified SAMHSA OTP clinic in your destination area using the HarborPath Treatment Directory.'),
        h('li', null, h('strong', null, '3. Confirm Guest Fee: '), 'Call the host clinic in advance to confirm their guest dosing fee (some Medicaid plans cover guest dosing, others require cash/sliding fee).'),
        h('li', null, h('strong', null, '4. Required Paperwork: '), 'Home medical director must fax or securely transmit your verified dose, photo ID, last dosing date/time, and clinic DEA license.'),
        h('li', null, h('strong', null, '5. Clinic Hours: '), 'Host OTPs often have limited dosing hours (e.g. 5:30 AM to 11:00 AM); arrive during morning dosing windows with government photo ID.')
      )
    );
    panel.appendChild(card);
  }

  // TAB 5: Self-Advocacy Scripts
  function renderAdvocacyScripts(panel) {
    panel.appendChild(h('h2', null, t('methadone.scripts.title', 'Patient Self-Advocacy Script Composer')));
    panel.appendChild(h('p', null, t('methadone.scripts.intro', 'Use these respectful, legally grounded scripts to advocate with your clinic counselor, supervisor, or doctor.')));

    const form = h('div', { class: 'form-card' });

    const selectLabel = h('label', { for: 'select-script-type', class: 'field-label' },
      h('strong', null, 'Select Conversation Goal: ')
    );
    const select = h('select', { id: 'select-script-type', class: 'input-field' },
      h('option', { value: 'takehome_request' }, 'Requesting Take-Home Schedule Review (2024 Rules)'),
      h('option', { value: 'toxicology_advocacy' }, 'Advocating Against Punitive Toxicology Loss of Bottles'),
      h('option', { value: 'guest_dosing' }, 'Requesting Guest Dosing for Travel / Work'),
      h('option', { value: 'voluntary_taper' }, 'Discussing a Patient-Paced Voluntary Taper')
    );
    select.value = methadoneState.selectedScriptType;

    select.addEventListener('change', (e) => {
      methadoneState.selectedScriptType = e.target.value;
      updateScriptText();
    });

    form.appendChild(selectLabel);
    form.appendChild(select);
    panel.appendChild(form);

    const scriptPreview = h('div', { class: 'script-preview-card' });
    const scriptBox = h('blockquote', { class: 'script-text', id: 'methadone-script-output' });
    scriptPreview.appendChild(h('h3', null, 'Script Preview:'));
    scriptPreview.appendChild(scriptBox);

    const copyBtn = h('button', {
      type: 'button',
      class: 'btn btn-secondary'
    }, icon('share'), 'Copy Script to Clipboard');

    copyBtn.addEventListener('click', () => {
      const txt = scriptBox.textContent;
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(() => {
          copyBtn.textContent = 'Script Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy Script to Clipboard';
          }, 2000);
        });
      }
    });

    scriptPreview.appendChild(copyBtn);
    panel.appendChild(scriptPreview);

    function updateScriptText() {
      const script = buildAdvocacyScript({
        scriptType: methadoneState.selectedScriptType,
        destinationCity: methadoneState.guestDestination
      });
      scriptBox.textContent = script;
    }

    updateScriptText();
  }

  // Initial render
  renderActiveTab();

  container.appendChild(header);
  container.appendChild(tabNav);
  container.appendChild(contentArea);

  return container;
}

