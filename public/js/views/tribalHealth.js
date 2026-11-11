/**
 * Indigenous & Tribal Health Specialist View (public/js/views/tribalHealth.js)
 *
 * Comprehensive, culturally grounded clinical and statutory guidance for
 * American Indian and Alaska Native (AI/AN) individuals, families, tribal leaders,
 * community health representatives (CHRs), and clinical care navigators:
 *
 * 1. Indian Health Care Improvement Act (IHCIA, 25 U.S.C. § 1601 et seq.; P.L. 94-437 / ACA § 10221):
 *    - Permanent reauthorization of IHCIA under the Affordable Care Act.
 *    - Tripartite Indian Health System: Direct IHS facilities, Tribally operated (P.L. 93-638 compacts
 *      and contracts), and Title V Urban Indian Health Organizations (UIHOs).
 *
 * 2. Purchased/Referred Care (PRC, 42 C.F.R. Part 136):
 *    - Medical priority frameworks (Priority I: emergent/acutely urgent life/limb/sensory care;
 *      Priority II: preventive care; Priority III: primary/secondary care).
 *    - Statutory notification timelines: 72 hours for emergent non-IHS admissions;
 *      extended 30-day notification standard for elders (age 55+) and individuals with disabilities.
 *
 * 3. Special Medicaid & Medicare Cost-Sharing Protections:
 *    - Social Security Act § 1916(j) (42 U.S.C. § 1396o(j)): Absolute federal exemption from Medicaid
 *      copayments, coinsurance, and deductibles for AI/AN individuals who are eligible to receive or
 *      have ever received services through an IHS or tribal 638 facility.
 *    - Social Security Act § 1905(b): 100% Federal Medical Assistance Percentage (FMAP) for services
 *      received through an IHS or tribal 638 facility.
 *
 * 4. Indian Child Welfare Act (ICWA, 25 U.S.C. § 1901 et seq.):
 *    - Active efforts standard (higher than "reasonable efforts") required in child custody/dependency
 *      proceedings involving parental substance use.
 *    - Tribal jurisdiction, culturally competent family preservation, and Qualified Expert Witnesses (QEW).
 *
 * 5. Culturally Grounded & Traditional Healing Integration:
 *    - Harmonious integration of FDA-approved MOUD (Buprenorphine, Methadone, Naltrexone) with
 *      Indigenous lifeways: Talking Circles, smudging (sage, sweetgrass, cedar), sweat lodge ceremonies,
 *      and Native American Community Reinforcement Approach (NA-CRA).
 *    - StrongHearts Native Helpline (1-844-762-8483) and 988 Indigenous peer support.
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
onQuickExit(resetTribalHealthState);

// ============================================================================
// 1. Statutory Frameworks & Benefit Rules
// ============================================================================

export const TRIBAL_HEALTH_STATUTES = [
  {
    id: 'ihcia_framework',
    title: {
      en: 'Indian Health Care Improvement Act (IHCIA, 25 U.S.C. § 1601 et seq.)',
      es: 'Ley de Mejora de la Atención Médica Indígena (IHCIA, 25 U.S.C. § 1601 y ss.)',
    },
    authority: '25 U.S.C. § 1601 et seq.; P.L. 94-437; Permanently Reauthorized under ACA § 10221',
    summary: {
      en: 'Federal statutory commitment recognizing the unique legal and trust responsibility of the United States to ensure highest possible health status for American Indians and Alaska Natives. Authorizes comprehensive behavioral health, youth regional treatment centers, and traditional healing integration.',
      es: 'Compromiso legal federal que reconoce la responsabilidad fiduciaria de EE. UU. de asegurar el nivel de salud más alto a indígenas estadounidenses y nativos de Alaska. Autoriza salud conductual integral, centros regionales para jóvenes e integración de sanación tradicional.',
    },
    actionAdvice: {
      en: 'AI/AN individuals have the right to seek healthcare at direct Indian Health Service (IHS) clinics, tribally operated P.L. 93-638 facilities, or Title V Urban Indian Health Organizations nationwide.',
      es: 'Las personas AI/AN tienen derecho a recibir atención médica en clínicas directas de IHS, centros tribales 638 u organizaciones de salud urbana de Título V en todo el país.',
    },
  },
  {
    id: 'medicaid_cost_sharing_exemption',
    title: {
      en: 'Social Security Act § 1916(j): $0 Medicaid Cost-Sharing Exemption for AI/AN',
      es: 'Ley del Seguro Social § 1916(j): Exención de Costos Compartidos de $0 en Medicaid para AI/AN',
    },
    authority: '42 U.S.C. § 1396o(j); ARRA § 5006; 42 C.F.R. § 447.56(a)(1)(x)',
    summary: {
      en: 'Federal law strictly prohibits state Medicaid programs from charging copayments, coinsurance, deductibles, or enrollment premiums to any American Indian or Alaska Native who has ever received a service through IHS, a tribal 638 facility, or an Urban Indian organization (or is eligible to receive one).',
      es: 'La ley federal prohíbe estrictamente a Medicaid estatal cobrar copagos, coseguros, deducibles o primas a personas indígenas o nativas de Alaska que hayan recibido o sean elegibles para recibir servicios en IHS, centros 638 u organizaciones urbanas.',
    },
    actionAdvice: {
      en: 'When enrolling in state Medicaid or receiving care at outside hospitals or pharmacies, inform eligibility staff of your AI/AN status under Section 1916(j) to have all copays and pharmacy charges waived ($0 copay).',
      es: 'Al inscribirse en Medicaid o acudir a farmacias y hospitales externos, notifique su condición AI/AN bajo la Sección 1916(j) para que se anulen todos los copagos ($0 copago).',
    },
  },
  {
    id: 'icwa_protections',
    title: {
      en: 'Indian Child Welfare Act (ICWA, 25 U.S.C. § 1901 et seq.): "Active Efforts" in SUD Care',
      es: 'Ley de Bienestar de Menores Indígenas (ICWA, 25 U.S.C. § 1901 y ss.): "Esfuerzos Activos" en SUD',
    },
    authority: '25 U.S.C. § 1901 et seq.; 25 C.F.R. Part 23; Haaland v. Brackeen, 599 U.S. 255 (2023)',
    summary: {
      en: 'Under ICWA, state child welfare agencies must demonstrate that "active efforts" have been made to provide remedial services and rehabilitative programs designed to prevent the breakup of the Indian family. This is a significantly higher standard than standard "reasonable efforts" and requires culturally appropriate substance use treatment.',
      es: 'Bajo ICWA, las agencias de bienestar infantil deben demostrar "esfuerzos activos" para proporcionar servicios terapéuticos y rehabilitación para evitar la desintegración de la familia indígena. Es un estándar superior a "esfuerzos razonables" y exige tratamiento con pertinencia cultural.',
    },
    actionAdvice: {
      en: 'If navigating custody or child welfare proceedings, immediately notify your tribal government ICWA caseworker and defense attorney. Request that all recommended SUD treatment programs incorporate culturally grounded tribal practices.',
      es: 'Si enfrenta procesos de custodia o protección infantil, notifique de inmediato al trabajador de ICWA de su gobierno tribal y a su abogado defensor, solicitando programas con pertinencia cultural.',
    },
  },
];

// ============================================================================
// 2. Purchased/Referred Care (PRC) Priorities & Timelines
// ============================================================================

export const IHS_PRC_PRIORITY_LEVELS = [
  {
    level: 'Priority I',
    title: { en: 'Emergent or Acutely Urgent Care', es: 'Atención de Emergencia o Urgente Aguda' },
    summary: {
      en: 'Medical conditions that are immediate threats to life, limb, or sensory organ function. Includes severe acute opioid/sedative overdose, acute alcohol withdrawal delirium (DTs), acute surgical emergencies, and severe sepsis.',
      es: 'Afecciones médicas que amenazan de inmediato la vida, extremidades o sentidos. Incluye sobredosis aguda grave de opioides/sedantes, delirio por abstinencia alcohólica (DT), emergencias quirúrgicas y sepsis.',
    },
    coveragePolicy: {
      en: 'PRC funds are highest priority for these conditions. If an emergency occurs at a non-IHS hospital, you or a family member must notify the local IHS or tribal PRC office within the designated notification window.',
      es: 'Los fondos PRC tienen máxima prioridad para estas afecciones. Si ocurre una emergencia en hospital no perteneciente al IHS, debe notificar a la oficina de PRC dentro del plazo legal.',
    },
  },
  {
    level: 'Priority II',
    title: { en: 'Preventive Care Services', es: 'Servicios de Atención Preventiva' },
    summary: {
      en: 'Preventive services, prenatal care, high-risk screening, routine immunizations, and standard mammography/colonoscopy screenings.',
      es: 'Servicios preventivos, atención prenatal, detección de alto riesgo, vacunas de rutina y exámenes de mamografía o colonoscopia.',
    },
    coveragePolicy: {
      en: 'Funded based on annual tribal or IHS facility PRC budget availability; prenatal care is generally maintained at high priority.',
      es: 'Financiado según disponibilidad presupuestaria anual de PRC del centro tribal o IHS; la atención prenatal suele mantenerse como alta prioridad.',
    },
  },
  {
    level: 'Priority III',
    title: { en: 'Primary & Secondary Care Services', es: 'Servicios de Atención Primaria y Secundaria' },
    summary: {
      en: 'Scheduled outpatient visits, routine specialty consultations, elective evaluations, and non-emergent dental or vision care.',
      es: 'Consultas ambulatorias programadas, interconsultas con especialistas, valoraciones electivas y atención dental o visual no urgente.',
    },
    coveragePolicy: {
      en: 'Requires advance authorization from the facility PRC committee prior to receiving non-IHS community care.',
      es: 'Requiere autorización previa del comité de PRC antes de recibir atención comunitaria fuera del IHS.',
    },
  },
  {
    level: 'Priority IV & V',
    title: { en: 'Chronic Care & Excluded Services', es: 'Atención Crónica y Servicios Excluidos' },
    summary: {
      en: 'Rehabilitative therapies, cosmetic procedures, experimental medications, and chronic maintenance services not meeting urgency criteria.',
      es: 'Terapias de rehabilitación, procedimientos cosméticos, tratamientos experimentales y mantenimiento crónico sin criterio de urgencia.',
    },
    coveragePolicy: {
      en: 'Rarely funded by PRC unless specialized medical exceptions or specific tribal council supplemental allocations exist.',
      es: 'Rara vez financiado por PRC salvo excepciones médicas especiales o asignaciones suplementarias del consejo tribal.',
    },
  },
];

export const PRC_NOTIFICATION_TIMELINES = {
  standardWindow: {
    hours: 72,
    rule: {
      en: 'Under 42 C.F.R. § 136.24, notice of emergency admission to a non-IHS hospital must be provided to the IHS or tribal facility within 72 hours of admission.',
      es: 'Bajo 42 C.F.R. § 136.24, la notificación de ingreso de emergencia en hospital no perteneciente al IHS debe realizarse dentro de las 72 horas posteriores al ingreso.',
    },
  },
  elderAndDisabledWindow: {
    days: 30,
    rule: {
      en: 'Under the Indian Health Care Improvement Act (25 U.S.C. § 1621s), elders (aged 55+) and individuals with physical or mental disabilities have an extended 30-day window to report emergency admissions to PRC.',
      es: 'Bajo IHCIA (25 U.S.C. § 1621s), las personas mayores (55+ años) y con discapacidades tienen un plazo ampliado de 30 días para notificar admisiones de emergencia a PRC.',
    },
  },
};

// ============================================================================
// 3. Culturally Grounded Healing & MOUD Harmony
// ============================================================================

export const CULTURALLY_GROUNDED_PRACTICES = [
  {
    id: 'talking_circles',
    title: { en: 'Talking Circles & Community Connection', es: 'Círculos de Diálogo y Conexión Comunitaria' },
    description: {
      en: 'Sacred, egalitarian sharing circles where each person speaks from the heart without interruption or judgment. Fosters relational accountability, emotional release, and spiritual solidarity.',
      es: 'Círculos sagrados e igualitarios de intercambio donde cada participante habla desde el corazón sin interrupciones. Promueve contención emocional y solidaridad comunitaria.',
    },
  },
  {
    id: 'smudging_medicines',
    title: { en: 'Sacred Plant Medicines (Smudging)', es: 'Plantas Sagradas y Sahumado (Smudging)' },
    description: {
      en: 'The burning of sacred medicines (white sage, sweetgrass, cedar, tobacco) to cleanse heavy energies, reset the nervous system, and center personal intentions for healing.',
      es: 'El sahumado con plantas sagradas (salvia blanca, hierba dulce, cedro, tabaco) para purificar energías densas, reconectar el sistema nervioso y enfocar la sanación.',
    },
  },
  {
    id: 'sweat_lodge',
    title: { en: 'Sweat Lodge (Inipi / Purification Ceremonies)', es: 'Temazcal / Ceremonias de Purificación (Inipi)' },
    description: {
      en: 'Deep physical and spiritual purification led by experienced cultural leaders, reconnecting the individual to Mother Earth, ancestors, and renewed purpose.',
      es: 'Purificación física y espiritual profunda guiada por líderes culturales experimentados, reconectando con la Madre Tierra, ancestros y un propósito renovado.',
    },
  },
  {
    id: 'na_cra_model',
    title: { en: 'Native American Community Reinforcement Approach (NA-CRA)', es: 'Enfoque de Refuerzo Comunitario para Nativos Americanos (NA-CRA)' },
    description: {
      en: 'Evidence-based behavioral therapy adapted by Indigenous clinicians to reinforce sobriety through family ties, traditional crafts, cultural celebrations (powwows), and community roles.',
      es: 'Terapia conductual basada en evidencia adaptada por médicos indígenas para reforzar la sobriedad mediante lazos familiares, ceremonias tradicionales y roles comunitarios.',
    },
  },
  {
    id: 'moud_harmony',
    title: { en: 'Harmony of FDA-Approved MOUD & Indigenous Healing', es: 'Armonía de MOUD Aprobado por FDA y Medicina Tradicional' },
    description: {
      en: 'National tribal health leaders and elders affirm that taking buprenorphine or methadone is modern physical medicine—no different than medicine for diabetes—that works in harmony with traditional ceremonies and spiritual healing.',
      es: 'Líderes y ancianos tribales afirman que tomar buprenorfina o metadona es medicina física moderna (igual que para la diabetes) que convive en armonía con las ceremonias tradicionales.',
    },
  },
];

// ============================================================================
// 4. In-RAM Decision Aid Engine: evaluateTribalHealthPlan(inputs)
// ============================================================================

export function evaluateTribalHealthPlan(inputs = {}) {
  const {
    affiliation = 'federally_recognized_tribe', // 'federally_recognized_tribe' | 'state_recognized_tribe' | 'urban_indian_off_reservation' | 'descendant_lineal' | 'non_tribal'
    locationType = 'reservation_trust_land',    // 'reservation_trust_land' | 'urban_city' | 'rural_non_reservation'
    facilityAccess = 'direct_ihs_facility',     // 'direct_ihs_facility' | 'tribal_638_compact' | 'urban_indian_health_center' | 'no_ihs_nearby'
    medicaidStatus = 'none',                    // 'active' | 'potential_applicant' | 'none'
    emergencyVisitPast72h = false,              // boolean: visited non-IHS ER in past 72h
    isElderOrDisabled = false,                  // boolean: age 55+ or disabled
    hasFamilyChildren = false,                  // boolean: child custody or dependency involvement
  } = inputs;

  const isEligibleAIAN = affiliation === 'federally_recognized_tribe' || affiliation === 'urban_indian_off_reservation' || affiliation === 'descendant_lineal';

  // 1. Evaluate PRC Emergency Notification
  let prcAdvice = null;
  if (emergencyVisitPast72h) {
    const windowText = isElderOrDisabled ? '30 days (Elder / Disability standard)' : '72 hours (Standard PRC rule)';
    prcAdvice = {
      priority: 'immediate',
      title: {
        en: `CRITICAL: Notify Tribal / IHS PRC Office Within ${windowText}`,
        es: `CRÍTICO: Notifique a la Oficina de PRC del IHS o Tribu dentro del Plazo de ${windowText}`,
      },
      detail: {
        en: `Under 42 C.F.R. § 136.24, emergency visits to non-IHS hospitals must be reported to your home facility's Purchased/Referred Care office within ${isElderOrDisabled ? '30 days (elder/disabled standard)' : '72 hours'} to ensure bills are covered under Priority I emergency funds. Contact your tribal PRC coordinator immediately.`,
        es: `Bajo 42 C.F.R. § 136.24, las visitas de emergencia a hospitales no pertenecientes al IHS deben reportarse a la oficina de PRC dentro de ${isElderOrDisabled ? '30 días (estándar para mayores/discapacitados)' : '72 horas'} para asegurar que los costos se cubran bajo fondos de Emergencia Prioridad I.`,
      },
    };
  }

  // 2. Evaluate Medicaid $0 Cost-Sharing Protection
  const costSharingProtection = {
    isExempt: isEligibleAIAN,
    statute: 'Social Security Act § 1916(j) (42 U.S.C. § 1396o(j))',
    summary: isEligibleAIAN
      ? {
          en: 'You are legally exempt from ALL Medicaid copayments, deductibles, coinsurance, and premiums ($0 copays on all covered healthcare and prescriptions).',
          es: 'Está legalmente exento de TODOS los copagos, deducibles, coseguros y primas de Medicaid ($0 copagos en todas las consultas y recetas cubiertas).',
        }
      : {
          en: 'Standard state Medicaid cost-sharing rules apply unless verified as eligible for IHS or tribal healthcare.',
          es: 'Aplican las reglas estándar de costos compartidos de Medicaid a menos que se verifique elegibilidad para IHS o salud tribal.',
        },
  };

  // 3. Facility Pathway Guidance
  const facilityRecommendations = [];

  if (facilityAccess === 'urban_indian_health_center' || locationType === 'urban_city') {
    facilityRecommendations.push({
      type: 'urban_health',
      title: {
        en: 'Connect with Title V Urban Indian Health Organizations (UIHOs)',
        es: 'Conéctese con Organizaciones de Salud Indígena Urbana de Título V (UIHO)',
      },
      text: {
        en: 'Over 70% of American Indians and Alaska Natives live in urban areas off reservations. Title V UIHOs provide culturally affirming medical care, MOUD, peer support, and traditional healing without requiring residence on tribal trust lands.',
        es: 'Más del 70% de indígenas y nativos de Alaska viven en zonas urbanas fuera de reservaciones. Las UIHO de Título V brindan atención médica, MOUD, apoyo de pares y sanación tradicional.',
      },
    });
  } else if (facilityAccess === 'tribal_638_compact') {
    facilityRecommendations.push({
      type: 'tribal_compact',
      title: {
        en: 'Tribally Operated P.L. 93-638 Health Centers & Compacts',
        es: 'Centros de Salud Tribales Autogestionados bajo P.L. 93-638',
      },
      text: {
        en: 'Tribally operated programs design services around tribal sovereignty, community values, and local traditions, offering comprehensive outpatient and residential MOUD.',
        es: 'Los programas tribales 638 diseñan sus servicios en torno a la soberanía tribal y tradiciones comunitarias, ofreciendo MOUD ambulatorio y residencial.',
      },
    });
  } else if (facilityAccess === 'direct_ihs_facility') {
    facilityRecommendations.push({
      type: 'direct_ihs',
      title: {
        en: 'Direct Indian Health Service Medical Centers & Clinics',
        es: 'Hospitales y Clínicas Directas del Indian Health Service',
      },
      text: {
        en: 'Direct federal IHS facilities provide comprehensive primary care, pharmacy, emergency stabilization, and referrals to Youth Regional Treatment Centers (YRTCs).',
        es: 'Los centros federales directos del IHS brindan atención primaria, farmacia, estabilización de urgencia y referencias a centros juveniles (YRTC).',
      },
    });
  } else {
    facilityRecommendations.push({
      type: 'safety_net_fallback',
      title: {
        en: 'Locate HRSA Community Health Centers with AI/AN Competency',
        es: 'Localice Centros de Salud HRSA con Competencia Cultural AI/AN',
      },
      text: {
        en: 'When geographically distant from an IHS or 638 clinic, Federally Qualified Health Centers (FQHCs) offer sliding-scale fees, MOUD, and coordination with tribal PRC programs.',
        es: 'Si reside lejos de un centro del IHS o tribal, los FQHC comunitarios ofrecen escala móvil de tarifas, MOUD y coordinación con programas PRC.',
      },
    });
  }

  // 4. ICWA Guidance if family/children involved
  let icwaAdvice = null;
  if (hasFamilyChildren) {
    icwaAdvice = {
      priority: 'high',
      title: {
        en: 'ICWA Active Efforts Standard & Tribal Family Preservation',
        es: 'Estándar de Esfuerzos Activos de ICWA y Preservación Familiar',
      },
      detail: {
        en: 'Under 25 U.S.C. § 1912(d), child welfare agencies cannot remove an Indian child without proving that active efforts were made to assist the parent with culturally competent SUD treatment and family preservation services. Inform your tribe and attorney immediately.',
        es: 'Bajo 25 U.S.C. § 1912(d), las agencias de protección no pueden separar a un menor indígena sin demostrar que se realizaron esfuerzos activos con tratamiento culturalmente pertinente. Notifique a su tribu y abogado de inmediato.',
      },
    };
  }

  // 5. Discussion Checklist
  const discussionItems = [
    {
      topic: { en: 'Medicaid $0 Cost-Sharing', es: 'Medicaid con $0 Costo Compartido' },
      question: {
        en: 'Can you verify my AI/AN exemption under Social Security Act § 1916(j) so all copayments, coinsurance, and prescription fees are set to $0?',
        es: '¿Puede registrar mi exención AI/AN bajo la Sección 1916(j) para que todos los copagos y tarifas de farmacia sean de $0?',
      },
    },
    {
      topic: { en: 'Traditional Healing Integration', es: 'Integración de Medicina Tradicional' },
      question: {
        en: 'Does your clinical team collaborate with traditional healers, cultural coordinators, or facilitate access to sacred plant medicines and Talking Circles?',
        es: '¿Su equipo colabora con sanadores tradicionales, coordinadores culturales o facilita acceso a plantas sagradas y Círculos de Diálogo?',
      },
    },
    {
      topic: { en: 'PRC Emergency Authorization', es: 'Autorización de Emergencia PRC' },
      question: {
        en: 'If I require non-IHS emergency hospital care or specialty residential treatment, what is the exact phone number and email for the facility PRC coordinator?',
        es: 'Si requiero hospitalización de emergencia o tratamiento residencial externo, ¿cuál es el teléfono y correo de la coordinación de PRC?',
      },
    },
  ];

  return {
    evaluatedAt: new Date().toISOString(),
    inputs,
    isEligibleAIAN,
    prcAdvice,
    costSharingProtection,
    facilityRecommendations,
    icwaAdvice,
    discussionItems,
    statutes: TRIBAL_HEALTH_STATUTES,
    culturalPractices: CULTURALLY_GROUNDED_PRACTICES,
    prcPriorities: IHS_PRC_PRIORITY_LEVELS,
  };
}

// ============================================================================
// 5. Ephemeral In-RAM State Management
// ============================================================================

let tribalHealthState = {
  affiliation: 'federally_recognized_tribe',
  locationType: 'reservation_trust_land',
  facilityAccess: 'direct_ihs_facility',
  medicaidStatus: 'none',
  emergencyVisitPast72h: false,
  isElderOrDisabled: false,
  hasFamilyChildren: false,
  activeTab: 'decision_aid', // 'decision_aid' | 'prc_rules' | 'statutes' | 'cultural'
  lastEvaluation: null,
};

export function getTribalHealthState() {
  return { ...tribalHealthState };
}

export function setTribalHealthState(partial) {
  tribalHealthState = { ...tribalHealthState, ...partial };
  return getTribalHealthState();
}

export function resetTribalHealthState() {
  tribalHealthState = {
    affiliation: 'federally_recognized_tribe',
    locationType: 'reservation_trust_land',
    facilityAccess: 'direct_ihs_facility',
    medicaidStatus: 'none',
    emergencyVisitPast72h: false,
    isElderOrDisabled: false,
    hasFamilyChildren: false,
    activeTab: 'decision_aid',
    lastEvaluation: null,
  };
  return getTribalHealthState();
}

// ============================================================================
// 6. Summary Text Formatter (Bilingual Copy/Print)
// ============================================================================

export function formatTribalHealthSummaryText(plan, lang = 'en') {
  if (!plan) return '';
  const isEs = lang === 'es';
  const divider = '======================================================================';
  const subDivider = '----------------------------------------------------------------------';

  const lines = [
    divider,
    isEs
      ? 'PLAN DE SALUD INDÍGENA Y TRIBAL (IHS / 638 / TÍTULO V) - HARBORPATH'
      : 'INDIGENOUS & TRIBAL HEALTH CARE PLAN (IHS / 638 / TITLE V) - HARBORPATH',
    isEs
      ? 'Asistencia epímera en memoria | Cero rastreo | Confidencial'
      : 'In-RAM Ephemeral Decision Support | Zero Tracking | Confidential',
    divider,
    '',
    `${isEs ? 'Afiliación declarada' : 'Tribal Affiliation'}: ${plan.inputs.affiliation}`,
    `${isEs ? 'Ubicación' : 'Location'}: ${plan.inputs.locationType}`,
    `${isEs ? 'Exención de copagos Medicaid (§ 1916(j))' : 'Medicaid $0 Cost-Sharing Protection'}: ${plan.costSharingProtection.isExempt ? (isEs ? 'ELEGIBLE ($0 COPAGOS)' : 'ELIGIBLE ($0 COPAYS)') : (isEs ? 'ESTÁNDAR' : 'STANDARD')}`,
    '',
  ];

  if (plan.prcAdvice) {
    lines.push(subDivider);
    lines.push(isEs ? 'AVISO URGENTE DE PURCHASING/REFERRED CARE (PRC):' : 'URGENT PURCHASED/REFERRED CARE (PRC) NOTICE:');
    lines.push(subDivider);
    lines.push(`[${plan.prcAdvice.priority.toUpperCase()}] ${isEs ? plan.prcAdvice.title.es : plan.prcAdvice.title.en}`);
    lines.push(`  ${isEs ? plan.prcAdvice.detail.es : plan.prcAdvice.detail.en}`);
    lines.push('');
  }

  if (plan.icwaAdvice) {
    lines.push(subDivider);
    lines.push(isEs ? 'PROTECCIÓN DE BIENESTAR FAMILIAR E ICWA:' : 'ICWA & FAMILY PRESERVATION RIGHTS:');
    lines.push(subDivider);
    lines.push(`* ${isEs ? plan.icwaAdvice.title.es : plan.icwaAdvice.title.en}`);
    lines.push(`  ${isEs ? plan.icwaAdvice.detail.es : plan.icwaAdvice.detail.en}`);
    lines.push('');
  }

  lines.push(subDivider);
  lines.push(isEs ? 'RECOMENDACIONES DE CENTROS DE SALUD:' : 'HEALTHCARE FACILITY RECOMMENDATIONS:');
  lines.push(subDivider);
  plan.facilityRecommendations.forEach((rec) => {
    lines.push(`* ${isEs ? rec.title.es : rec.title.en}`);
    lines.push(`  ${isEs ? rec.text.es : rec.text.en}`);
  });

  lines.push('');
  lines.push(subDivider);
  lines.push(isEs ? 'PREGUNTAS SUGERIDAS PARA SU EQUIPO MÉDICO:' : 'PROVIDER DISCUSSION CHECKLIST:');
  lines.push(subDivider);
  plan.discussionItems.forEach((it) => {
    lines.push(`- [ ] (${isEs ? it.topic.es : it.topic.en}) ${isEs ? it.question.es : it.question.en}`);
  });

  lines.push('');
  lines.push(subDivider);
  lines.push(isEs ? 'LÍNEAS DE AYUDA PERTINENTES:' : 'CULTURALLY CENTERED HELPLINES:');
  lines.push(subDivider);
  lines.push(
    isEs
      ? 'StrongHearts Native Helpline (Apoyo indígena 24/7): 1-844-762-8483'
      : 'StrongHearts Native Helpline (24/7 Native peer support): 1-844-762-8483'
  );
  lines.push(
    isEs
      ? 'Línea de Crisis y Suicidio: Llame al 988 (En WA y áreas participantes presione 4 para apoyo indígena)'
      : '988 Suicide & Crisis Lifeline (In WA and participating areas press 4 for Native and Strong Lifeline)'
  );
  lines.push('');
  lines.push(divider);

  return lines.join('\n');
}

// ============================================================================
// 7. Accessible DOM View: tribalHealthView(containerOrOptions, maybeOptions)
// ============================================================================

export function tribalHealthView(containerOrOptions = {}, maybeOptions = {}) {
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
  const plan = evaluateTribalHealthPlan(getTribalHealthState());
  setTribalHealthState({ lastEvaluation: plan });

  const root = h('div', { class: 'tribal-health-view' });

  // Page Header
  const header = pageHeader(
    isEs ? 'Salud Indígena y Tribal (IHS, 638 y Título V)' : 'Indigenous & Tribal Health Specialist (IHS / 638 / Title V)',
    isEs
      ? 'Orientación clínica, estatutaria y cultural sobre la Ley IHCIA, Purchased/Referred Care (PRC), exención de copagos de Medicaid (§ 1916(j)), ICWA e integración de medicina tradicional con MOUD.'
      : 'Statutory and culturally grounded guidance on IHCIA, Purchased/Referred Care (PRC), Medicaid $0 cost-sharing (§ 1916(j)), ICWA family preservation, and traditional healing integration with MOUD.'
  );
  root.append(header);

  // In-RAM Ephemeral Privacy Banner
  const privacyAlert = h(
    'div',
    { class: 'panel alert-panel', role: 'note', 'aria-label': isEs ? 'Privacidad' : 'Privacy' },
    h('div', { class: 'panel-header' },
      icon('shield', { class: 'panel-icon' }),
      h('h2', { class: 'panel-title' }, isEs ? 'Asistencia Epímera en Memoria' : 'In-RAM Ephemeral Decision Support')
    ),
    h('p', { class: 'panel-body' },
      isEs
        ? 'Toda la información se procesa temporalmente en la memoria del navegador sin persistencia. No se registra información en el disco ni en servidores. Se restablece al activar Salida Rápida.'
        : 'All selections are processed in temporary browser memory only without persistence. No data is stored on disk or transmitted to servers. Cleared immediately upon Quick Exit.'
    )
  );
  root.append(privacyAlert);

  // Navigation Tabs
  const tabNav = h('div', { class: 'tab-bar', role: 'tablist', 'aria-label': isEs ? 'Secciones de salud tribal' : 'Tribal health sections' });
  const tabs = [
    { id: 'decision_aid', label: isEs ? 'Evaluador y Plan Tribal' : 'Decision Aid & Care Plan' },
    { id: 'prc_rules', label: isEs ? 'Reglas de PRC y Plazos' : 'PRC Priorities & Timelines' },
    { id: 'statutes', label: isEs ? 'Estatutos Federales (IHCIA / ICWA)' : 'Federal Statutes (IHCIA / ICWA)' },
    { id: 'cultural', label: isEs ? 'Medicina Tradicional y MOUD' : 'Traditional Healing & MOUD' },
  ];

  const currentTab = tribalHealthState.activeTab;

  tabs.forEach((tab) => {
    const isSelected = tab.id === currentTab;
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `tab-btn-th-${tab.id}`,
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-controls': 'tab-panel-th',
      tabindex: isSelected ? '0' : '-1',
      class: isSelected ? 'tab active' : 'tab',
    }, tab.label);

    btn.addEventListener('click', () => {
      setTribalHealthState({ activeTab: tab.id });
      tribalHealthView(container, options);
    });

    tabNav.append(btn);
  });
  root.append(tabNav);

  // Panel Content
  const tabPanel = h('div', {
    id: 'tab-panel-th',
    role: 'tabpanel',
    'aria-labelledby': `tab-btn-th-${currentTab}`,
    class: 'tab-content-panel',
  });

  // --------------------------------------------------------------------------
  // TAB 1: Decision Aid
  // --------------------------------------------------------------------------
  if (currentTab === 'decision_aid') {
    const formCard = h('div', { class: 'card assessment-card' });
    formCard.append(h('h3', { class: 'card-title' }, isEs ? 'Parámetros de Salud Tribal y Comunidad' : 'Tribal Affiliation & Healthcare Access Parameters'));

    const formGrid = h('div', { class: 'form-grid' });

    // 1. Affiliation Select
    const affGroup = h('div', { class: 'form-group' });
    affGroup.append(h('label', { for: 'th-affil-select' }, isEs ? 'Afiliación o Identidad Tribal:' : 'Tribal Affiliation or Identity:'));
    const affSelect = h('select', { id: 'th-affil-select', class: 'input-select' });

    const affOpts = [
      { id: 'federally_recognized_tribe', label: isEs ? 'Miembro de tribu reconocida a nivel federal' : 'Enrolled citizen of federally recognized Tribe' },
      { id: 'urban_indian_off_reservation', label: isEs ? 'Indígena urbano (residente fuera de reservación)' : 'Urban Indian (living off-reservation)' },
      { id: 'descendant_lineal', label: isEs ? 'Descendiente de primera o segunda generación' : 'First/second generation lineal descendant' },
      { id: 'state_recognized_tribe', label: isEs ? 'Tribu reconocida a nivel estatal' : 'State-recognized Tribe member' },
      { id: 'non_tribal', label: isEs ? 'Defensor / No indígena' : 'Ally / Non-tribal advocate' },
    ];

    affOpts.forEach((ao) => {
      const opt = h('option', { value: ao.id }, ao.label);
      if (ao.id === tribalHealthState.affiliation) opt.selected = true;
      affSelect.append(opt);
    });

    affSelect.addEventListener('change', (e) => {
      setTribalHealthState({ affiliation: e.target.value });
      tribalHealthView(container, options);
    });
    affGroup.append(affSelect);
    formGrid.append(affGroup);

    // 2. Location Type
    const locGroup = h('div', { class: 'form-group' });
    locGroup.append(h('label', { for: 'th-loc-select' }, isEs ? 'Ubicación Residencial:' : 'Residential Location:'));
    const locSelect = h('select', { id: 'th-loc-select', class: 'input-select' });

    const locOpts = [
      { id: 'reservation_trust_land', label: isEs ? 'Tierras de reservación o fideicomiso tribal' : 'Reservation / Tribal Trust Land' },
      { id: 'urban_city', label: isEs ? 'Ciudad o área metropolitana' : 'Urban / Metropolitan area' },
      { id: 'rural_non_reservation', label: isEs ? 'Área rural fuera de reservación' : 'Rural non-reservation area' },
    ];

    locOpts.forEach((lo) => {
      const opt = h('option', { value: lo.id }, lo.label);
      if (lo.id === tribalHealthState.locationType) opt.selected = true;
      locSelect.append(opt);
    });

    locSelect.addEventListener('change', (e) => {
      setTribalHealthState({ locationType: e.target.value });
      tribalHealthView(container, options);
    });
    locGroup.append(locSelect);
    formGrid.append(locGroup);

    // 3. Facility Access
    const facGroup = h('div', { class: 'form-group' });
    facGroup.append(h('label', { for: 'th-fac-select' }, isEs ? 'Tipo de Centro Más Cercano:' : 'Nearest Health Facility Type:'));
    const facSelect = h('select', { id: 'th-fac-select', class: 'input-select' });

    const facOpts = [
      { id: 'direct_ihs_facility', label: isEs ? 'Hospital o clínica directa del IHS' : 'Direct IHS Hospital or Clinic' },
      { id: 'tribal_638_compact', label: isEs ? 'Centro de salud tribal P.L. 93-638' : 'Tribally operated P.L. 93-638 health center' },
      { id: 'urban_indian_health_center', label: isEs ? 'Organización de salud urbana de Título V (UIHO)' : 'Title V Urban Indian Health Organization (UIHO)' },
      { id: 'no_ihs_nearby', label: isEs ? 'Sin instalaciones de IHS/tribu cercanas' : 'No IHS / Tribal facilities nearby' },
    ];

    facOpts.forEach((fo) => {
      const opt = h('option', { value: fo.id }, fo.label);
      if (fo.id === tribalHealthState.facilityAccess) opt.selected = true;
      facSelect.append(opt);
    });

    facSelect.addEventListener('change', (e) => {
      setTribalHealthState({ facilityAccess: e.target.value });
      tribalHealthView(container, options);
    });
    facGroup.append(facSelect);
    formGrid.append(facGroup);

    // 4. Emergency Visit Check
    const emGroup = h('div', { class: 'form-group' });
    emGroup.append(h('label', { for: 'th-emergency-select' }, isEs ? '¿Atención de Urgencia en Hospital No-IHS Reciente?' : 'Non-IHS Emergency Hospital Visit Recently?'));
    const emSelect = h('select', { id: 'th-emergency-select', class: 'input-select' });

    const emOpts = [
      { val: false, label: isEs ? 'No / Ninguna reciente' : 'No / None recently' },
      { val: true, label: isEs ? 'Sí (Atención en hospital comunitario)' : 'Yes (Emergency visit at community hospital)' },
    ];

    emOpts.forEach((eo) => {
      const opt = h('option', { value: String(eo.val) }, eo.label);
      if (tribalHealthState.emergencyVisitPast72h === eo.val) opt.selected = true;
      emSelect.append(opt);
    });

    emSelect.addEventListener('change', (e) => {
      setTribalHealthState({ emergencyVisitPast72h: e.target.value === 'true' });
      tribalHealthView(container, options);
    });
    emGroup.append(emSelect);
    formGrid.append(emGroup);

    // 5. Elder / Disability Check
    const elderGroup = h('div', { class: 'form-group' });
    elderGroup.append(h('label', { for: 'th-elder-select' }, isEs ? '¿Adulto Mayor (55+) o con Discapacidad?' : 'Elder (Age 55+) or Disabled?'));
    const elderSelect = h('select', { id: 'th-elder-select', class: 'input-select' });

    const elderOpts = [
      { val: false, label: isEs ? 'No' : 'No' },
      { val: true, label: isEs ? 'Sí (Plazo ampliado de 30 días para PRC)' : 'Yes (Extended 30-day PRC window applies)' },
    ];

    elderOpts.forEach((eo) => {
      const opt = h('option', { value: String(eo.val) }, eo.label);
      if (tribalHealthState.isElderOrDisabled === eo.val) opt.selected = true;
      elderSelect.append(opt);
    });

    elderSelect.addEventListener('change', (e) => {
      setTribalHealthState({ isElderOrDisabled: e.target.value === 'true' });
      tribalHealthView(container, options);
    });
    elderGroup.append(elderSelect);
    formGrid.append(elderGroup);

    // 6. Child Welfare Check
    const childGroup = h('div', { class: 'form-group' });
    childGroup.append(h('label', { for: 'th-child-select' }, isEs ? '¿Custodia de Menores o Proceso Familiar?' : 'Child Custody or Dependency Case?'));
    const childSelect = h('select', { id: 'th-child-select', class: 'input-select' });

    const childOpts = [
      { val: false, label: isEs ? 'No' : 'No' },
      { val: true, label: isEs ? 'Sí (Protecciones de ICWA aplican)' : 'Yes (ICWA protections apply)' },
    ];

    childOpts.forEach((co) => {
      const opt = h('option', { value: String(co.val) }, co.label);
      if (tribalHealthState.hasFamilyChildren === co.val) opt.selected = true;
      childSelect.append(opt);
    });

    childSelect.addEventListener('change', (e) => {
      setTribalHealthState({ hasFamilyChildren: e.target.value === 'true' });
      tribalHealthView(container, options);
    });
    childGroup.append(childSelect);
    formGrid.append(childGroup);

    formCard.append(formGrid);
    tabPanel.append(formCard);

    // Results Box
    const resultsCard = h('div', { class: 'card results-card' });

    // Urgent PRC Warning Banner if applicable
    if (plan.prcAdvice) {
      const prcBox = h('div', { class: 'panel alert-panel alert-warning' });
      prcBox.append(h('strong', {}, isEs ? plan.prcAdvice.title.es : plan.prcAdvice.title.en));
      prcBox.append(h('p', {}, isEs ? plan.prcAdvice.detail.es : plan.prcAdvice.detail.en));
      resultsCard.append(prcBox);
    }

    // Medicaid $0 Exemption Highlight
    const medBox = h('div', { class: 'medicaid-exemption-box' });
    const badge = h('span', { class: `badge badge-${plan.costSharingProtection.isExempt ? 'approved' : 'neutral'}` },
      plan.costSharingProtection.isExempt
        ? (isEs ? '✓ EXENCIÓN DE COPAGOS DE MEDICAID (§ 1916(j))' : '✓ MEDICAID $0 COST-SHARING EXEMPTION (§ 1916(j))')
        : (isEs ? 'REGLAS ESTÁNDAR' : 'STANDARD RULES')
    );
    medBox.append(badge);
    medBox.append(h('p', {}, isEs ? plan.costSharingProtection.summary.es : plan.costSharingProtection.summary.en));
    resultsCard.append(medBox);

    // ICWA Rights if applicable
    if (plan.icwaAdvice) {
      const icwaBox = h('div', { class: 'icwa-rights-box' });
      icwaBox.append(h('h4', {}, isEs ? plan.icwaAdvice.title.es : plan.icwaAdvice.title.en));
      icwaBox.append(h('p', {}, isEs ? plan.icwaAdvice.detail.es : plan.icwaAdvice.detail.en));
      resultsCard.append(icwaBox);
    }

    // Facility Recommendations
    const recBox = h('div', { class: 'recommendations-box' });
    recBox.append(h('h4', {}, isEs ? 'Ruta de Atención Recomendada:' : 'Recommended Healthcare Facility Pathway:'));
    plan.facilityRecommendations.forEach((rec) => {
      const rItem = h('div', { class: 'rec-item' });
      rItem.append(h('strong', {}, isEs ? rec.title.es : rec.title.en));
      rItem.append(h('p', {}, isEs ? rec.text.es : rec.text.en));
      recBox.append(rItem);
    });
    resultsCard.append(recBox);

    // Action Buttons
    const btnRow = h('div', { class: 'btn-row' });
    const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' },
      icon('copy'),
      isEs ? ' Copiar Plan de Salud Tribal' : ' Copy Tribal Care Plan'
    );
    copyBtn.addEventListener('click', async () => {
      const text = formatTribalHealthSummaryText(plan, lang);
      await copyText(text, {
        trigger: copyBtn,
        copiedLabel: isEs ? '✓ ¡Copiado!' : '✓ Copied!',
        announceSuccess: isEs ? 'Plan copiado al portapapeles' : 'Plan copied to clipboard',
        announceFailure: isEs ? 'Error al copiar' : 'Clipboard write failed',
      });
    });
    btnRow.append(copyBtn);

    const treatLink = h('a', {
      href: '#/treatment?codes=ITU',
      class: 'btn btn-primary',
    }, icon('map-pin'), isEs ? ' Buscar Centros IHS, 638 y Urbanos' : ' Find IHS, 638 & Urban Centers');
    btnRow.append(treatLink);

    resultsCard.append(btnRow);
    tabPanel.append(resultsCard);
  }

  // --------------------------------------------------------------------------
  // TAB 2: PRC Priorities & Timelines
  // --------------------------------------------------------------------------
  else if (currentTab === 'prc_rules') {
    const prcCard = h('div', { class: 'card prc-card' });
    prcCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Prioridades Médicas de Purchased/Referred Care (PRC) y Plazos' : 'Purchased/Referred Care (PRC) Priorities & Timelines'
    ));

    const noticeBanner = h('div', { class: 'panel alert-panel' });
    noticeBanner.append(h('h4', {}, isEs ? 'Plazos Estatutarios para Notificar Emergencias Fuera del IHS:' : 'Statutory Deadlines to Report Non-IHS Emergencies:'));
    noticeBanner.append(h('p', {},
      h('strong', {}, isEs ? 'Regla Estándar (72 Horas): ' : 'Standard Rule (72 Hours): '),
      isEs ? PRC_NOTIFICATION_TIMELINES.standardWindow.rule.es : PRC_NOTIFICATION_TIMELINES.standardWindow.rule.en
    ));
    noticeBanner.append(h('p', {},
      h('strong', {}, isEs ? 'Regla para Mayores de 55+ o Personas con Discapacidad (30 Días): ' : 'Elder (55+) & Disability Standard (30 Days): '),
      isEs ? PRC_NOTIFICATION_TIMELINES.elderAndDisabledWindow.rule.es : PRC_NOTIFICATION_TIMELINES.elderAndDisabledWindow.rule.en
    ));
    prcCard.append(noticeBanner);

    IHS_PRC_PRIORITY_LEVELS.forEach((lvl) => {
      const sec = h('div', { class: 'prc-level-section' });
      sec.append(h('h4', {}, `${lvl.level}: ${isEs ? lvl.title.es : lvl.title.en}`));
      sec.append(h('p', {}, isEs ? lvl.summary.es : lvl.summary.en));
      sec.append(h('p', { class: 'coverage-policy' },
        h('strong', {}, isEs ? 'Política de Cobertura: ' : 'Coverage Policy: '),
        isEs ? lvl.coveragePolicy.es : lvl.coveragePolicy.en
      ));
      prcCard.append(sec);
    });

    tabPanel.append(prcCard);
  }

  // --------------------------------------------------------------------------
  // TAB 3: Federal Statutes
  // --------------------------------------------------------------------------
  else if (currentTab === 'statutes') {
    const statCard = h('div', { class: 'card statutes-card' });
    statCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Estatutos Federales y Derechos Legales Indígenas' : 'Federal Statutes & Indigenous Healthcare Rights'
    ));

    TRIBAL_HEALTH_STATUTES.forEach((st) => {
      const sec = h('div', { class: 'statute-section' });
      sec.append(h('h4', {}, isEs ? st.title.es : st.title.en));
      sec.append(h('span', { class: 'legal-citation' }, st.authority));
      sec.append(h('p', {}, isEs ? st.summary.es : st.summary.en));
      sec.append(h('p', { class: 'action-advice' },
        h('strong', {}, isEs ? 'Consejo Práctico: ' : 'Actionable Guidance: '),
        isEs ? st.actionAdvice.es : st.actionAdvice.en
      ));
      statCard.append(sec);
    });

    tabPanel.append(statCard);
  }

  // --------------------------------------------------------------------------
  // TAB 4: Cultural Practices & MOUD
  // --------------------------------------------------------------------------
  else if (currentTab === 'cultural') {
    const cultCard = h('div', { class: 'card cultural-card' });
    cultCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Sanación Tradicional Indígena y Armonía con MOUD' : 'Indigenous Traditional Healing & MOUD Harmony'
    ));
    cultCard.append(h('p', { class: 'card-description' },
      isEs
        ? 'Las comunidades indígenas han practicado la medicina y la sanación holística durante milenios. Los líderes y ancianos afirman que los medicamentos basados en evidencia (MOUD) y las ceremonias espirituales tradicionales se fortalecen mutuamente.'
        : 'Indigenous nations have practiced holistic healing for millennia. Tribal leaders and elders affirm that modern evidence-based medications (MOUD) and spiritual ceremonies reinforce one another.'
    ));

    const cGrid = h('div', { class: 'cultural-grid' });

    CULTURALLY_GROUNDED_PRACTICES.forEach((cp) => {
      const item = h('div', { class: 'cultural-item-card' });
      item.append(h('h4', {}, isEs ? cp.title.es : cp.title.en));
      item.append(h('p', {}, isEs ? cp.description.es : cp.description.en));
      cGrid.append(item);
    });

    cultCard.append(cGrid);
    tabPanel.append(cultCard);
  }

  root.append(tabPanel);

  // Footer Helplines
  const hotlineBar = h('div', { class: 'emergency-hotline-bar' },
    h('div', { class: 'hotline-item' },
      h('strong', {}, isEs ? 'StrongHearts Native Helpline (24/7):' : 'StrongHearts Native Helpline:'),
      h('span', {}, ' '),
      tel('1-844-762-8483', null, { class: 'hotline-link' })
    ),
    h('div', { class: 'hotline-item' },
      h('strong', {}, isEs ? 'Línea 988 (Presione 4 para apoyo indígena):' : '988 Lifeline (Press 4 for Native Line):'),
      h('span', {}, ' '),
      tel('988', null, { class: 'hotline-link' })
    )
  );
  root.append(hotlineBar);

  syncTablists(root);
  if (container) container.append(root);
  wireTablistKeyboard(container ?? root);
  return root;
}

