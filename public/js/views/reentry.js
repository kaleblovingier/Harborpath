/**
 * Incarceration Reentry & Criminal Legal Health Specialist View (public/js/views/reentry.js)
 *
 * Comprehensive, trauma-informed clinical and statutory guidance for individuals,
 * families, case managers, and defense attorneys navigating reentry from incarceration:
 *
 * 1. Section 1115 Demonstration Waivers (CMS Guidance & SUPPORT Act § 5032):
 *    - Inmate Exclusion Exception (42 U.S.C. § 1396d(a)(31)(A)).
 *    - Up to 90 days pre-release Medicaid coverage in approved states (CA, WA, MA, IL, OR, KY, NY, etc.).
 *    - 30-day medication supply upon release, MOUD clinical continuity, and warm handoff.
 *    - Medicaid suspension vs. termination statutory rules.
 *
 * 2. Post-Release Overdose Lethality & Clinical Protocol:
 *    - 40x to 129x fatal overdose spike in first 14 days post-release due to loss of tolerance.
 *    - Continuous MOUD (Methadone, Buprenorphine, Naltrexone) mortality reduction (75-85%).
 *    - Overdose Education and Naloxone Distribution (OEND) at facility gate.
 *
 * 3. Criminal Legal & Supervision Protections:
 *    - DOJ Civil Rights Division ADA Title II Guidance (April 2022): Prescribed MOUD protection
 *      against probation/parole violations, drug court exclusion, and forced medication tapers.
 *    - 42 CFR Part 2 § 2.35 confidentiality rules for criminal justice referrals: Limiting disclosures
 *      to attendance/compliance without releasing psychotherapy notes or confidential medical records.
 *
 * 4. Interactive In-RAM Reentry Assessment & Care Plan Generator:
 *    - State 1115 waiver status finder.
 *    - Critical post-release overdose risk tier assessment.
 *    - Customized discharge preparation checklist and supervision rights briefing.
 *    - Copyable and printable discharge coordination packet.
 *
 * Strict Invariants:
 * - Zero npm dependencies (plain ES modules).
 * - Zero PII: 100% ephemeral in-RAM state. Never writes answers to URLs, device storage, or cookies.
 * - Accessible DOM construction via h() (document.createElement, textContent, setAttribute).
 *   ZERO direct markup string injection or inline style attributes.
 * - Complete bilingual parity (English / Spanish).
 */

import { h, clear, ext, tel, sms, icon, announce } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong } from './common.js';
import { t, getLang } from '../i18n.js';
import { onQuickExit } from '../state.js';
import { NEVER_USE_ALONE } from '../content/hotlines.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetReentryState);

// ============================================================================
// 1. Section 1115 Reentry Demonstration Waivers Directory
// ============================================================================

export const REENTRY_MEDICAID_WAIVERS = [
  {
    state: 'CA',
    name: { en: 'California (CalAIM Reentry Waiver)', es: 'California (Exención de Reingreso CalAIM)' },
    status: 'approved',
    coverageWindowDays: 90,
    effectiveDate: '2023-01-26',
    cmsApprovalUrl: 'https://www.medicaid.gov/medicaid/section-1115-demonstrations/approved-demonstrations/index.html',
    keyServices: {
      en: [
        'Full MOUD access (Buprenorphine, Methadone, Naltrexone) starting 90 days before release',
        'Physical and behavioral health clinical consultations',
        '30-day supply of physical and behavioral health medications in-hand at the gate upon release',
        'Targeted pre-release case management and warm handoff to Enhanced Care Management (ECM) providers',
        'Durable medical equipment (DME) upon release if clinically indicated',
      ],
      es: [
        'Acceso completo a MOUD (buprenorfina, metadona, naltrexona) 90 días antes de la liberación',
        'Consultas clínicas de salud física y conductual',
        'Suministro de 30 días de medicamentos en mano en la puerta al momento de la liberación',
        'Gestión de casos previa a la liberación y transferencia cálida a proveedores de ECM',
        'Equipo médico duradero (DME) al salir si está clínicamente indicado',
      ],
    },
    suspensionPolicy: {
      en: 'California law (WIC § 14011.10) mandates Medicaid suspension rather than termination during incarceration. Coverage is reactivated immediately upon release without a new application.',
      es: 'La ley de California (WIC § 14011.10) exige la suspensión de Medicaid en lugar de la terminación durante el encarcelamiento. La cobertura se reactiva de inmediato al salir sin nueva solicitud.',
    },
  },
  {
    state: 'WA',
    name: { en: 'Washington (Health Care Authority 1115)', es: 'Washington (Autoridad de Atención Médica 1115)' },
    status: 'approved',
    coverageWindowDays: 90,
    effectiveDate: '2023-06-30',
    cmsApprovalUrl: 'https://www.hca.wa.gov/about-hca/programs-and-initiatives/medicaid-transformation-project-mtp',
    keyServices: {
      en: [
        'Pre-release case management and transition planning up to 90 days prior to release',
        'MOUD continuity with warm handoff to community Opioid Treatment Programs (OTPs) and OBOTs',
        'Direct release prescription bridge and take-home naloxone kits',
        'Peer recovery navigation linkage through state Apple Health managed care organizations',
      ],
      es: [
        'Gestión de casos previa y planificación de transición hasta 90 días antes de la liberación',
        'Continuidad de MOUD con transferencia cálida a programas de tratamiento comunitario',
        'Puente de recetas al salir y kits de naloxona para llevar a casa',
        'Enlace de navegación de pares a través de las organizaciones Apple Health',
      ],
    },
    suspensionPolicy: {
      en: 'RCW 74.09.670 requires Apple Health suspension instead of cancellation, allowing immediate reactivation on day of release.',
      es: 'RCW 74.09.670 exige la suspensión de Apple Health en lugar de cancelación, permitiendo reactivación inmediata el día de la liberación.',
    },
  },
  {
    state: 'MA',
    name: { en: 'Massachusetts (MassHealth 1115 Demonstration)', es: 'Massachusetts (Demostración MassHealth 1115)' },
    status: 'approved',
    coverageWindowDays: 90,
    effectiveDate: '2022-09-28',
    cmsApprovalUrl: 'https://www.mass.gov/service-details/masshealth-1115-demonstration',
    keyServices: {
      en: [
        'Targeted transitional case management 90 days pre-release',
        'Continuous clinical MOUD maintenance across prisons and houses of correction',
        '30-day medication supply upon release and naloxone rescue kit',
        'Direct connection to Community Partners (CPs) for social determinants and housing stabilization',
      ],
      es: [
        'Gestión de casos transicional dirigida 90 días antes de la liberación',
        'Mantenimiento clínico continuo de MOUD en prisiones y casas de corrección',
        'Suministro de 30 días de medicamentos y kit de rescate con naloxona',
        'Conexión directa con Socios Comunitarios para vivienda y determinantes sociales',
      ],
    },
    suspensionPolicy: {
      en: 'MassHealth suspends coverage for up to 3 years of incarceration and automatically restores full coverage upon verified release date.',
      es: 'MassHealth suspende la cobertura por hasta 3 años y restaura automáticamente los beneficios al confirmar la fecha de salida.',
    },
  },
  {
    state: 'IL',
    name: { en: 'Illinois (HFS 1115 Post-Incarceration Waiver)', es: 'Illinois (Exención HFS 1115 Post-Encarcelamiento)' },
    status: 'approved',
    coverageWindowDays: 90,
    effectiveDate: '2024-04-15',
    cmsApprovalUrl: 'https://hfs.illinois.gov/medicalproviders/cc/1115waiver.html',
    keyServices: {
      en: [
        'Pre-release SUD clinical consultation and MOUD induction or maintenance',
        '90-day pre-release care coordination with certified recovery support specialists',
        'Medication bridge at discharge plus take-home naloxone',
        'Seamless Medicaid managed care organization enrollment prior to release date',
      ],
      es: [
        'Consulta clínica de SUD previa a la liberación e inducción o mantenimiento de MOUD',
        'Coordinación de atención de 90 días antes de la liberación con especialistas de apoyo',
        'Puente de medicamentos al alta más naloxona para llevar a casa',
        'Inscripción fluida en organizaciones de Medicaid administrado antes de la fecha de salida',
      ],
    },
    suspensionPolicy: {
      en: '305 ILCS 5/5-5.26 requires suspension of medical assistance eligibility rather than termination during incarceration.',
      es: '305 ILCS 5/5-5.26 exige suspender la elegibilidad de asistencia médica en lugar de cancelarla durante el encarcelamiento.',
    },
  },
  {
    state: 'OR',
    name: { en: 'Oregon (Health Share 1115 Reentry Demonstration)', es: 'Oregón (Demostración de Reingreso Health Share 1115)' },
    status: 'approved',
    coverageWindowDays: 90,
    effectiveDate: '2024-02-01',
    cmsApprovalUrl: 'https://www.oregon.gov/oha/hsd/ohp/pages/1115-waiver.aspx',
    keyServices: {
      en: [
        'Coordinated Care Organization (CCO) reach-in services 90 days pre-release',
        'Uninterrupted MOUD dispensing and harm reduction education',
        '30-day medication take-home supply upon release',
        'Health-Related Social Needs (HRSN) climate, housing, and food transitions',
      ],
      es: [
        'Servicios de alcance de Organizaciones de Atención Coordinada (CCO) 90 días antes',
        'Dispensación ininterrumpida de MOUD y educación para la reducción de daños',
        'Suministro de 30 días de medicamentos para llevar a casa',
        'Transición de necesidades sociales relacionadas con la salud (HRSN: vivienda, nutrición)',
      ],
    },
    suspensionPolicy: {
      en: 'Oregon suspends Oregon Health Plan (OHP) enrollment so community benefits reactivate automatically upon discharge notification.',
      es: 'Oregón suspende el Plan de Salud de Oregón (OHP) para que los beneficios se reactiven de inmediato con la notificación de salida.',
    },
  },
  {
    state: 'KY',
    name: { en: 'Kentucky (TEAM 1115 Reentry Initiative)', es: 'Kentucky (Iniciativa de Reingreso TEAM 1115)' },
    status: 'approved',
    coverageWindowDays: 60,
    effectiveDate: '2024-06-01',
    cmsApprovalUrl: 'https://chfs.ky.gov/agencies/dms/member/Pages/1115-waiver.aspx',
    keyServices: {
      en: [
        '60-day pre-release screening, MOUD continuation, and medical assessments',
        '30-day prescription medication bridge provided at facility discharge',
        'Linkage to regional Community Mental Health Centers (CMHCs)',
        'Take-home nasal naloxone distribution upon release',
      ],
      es: [
        'Evaluación previa de 60 días, continuación de MOUD y valoraciones médicas',
        'Puente de medicamentos de 30 días entregado al momento del alta del centro',
        'Enlace con Centros Comunitarios de Salud Mental (CMHC) regionales',
        'Distribución de naloxona nasal para llevar a casa al salir',
      ],
    },
    suspensionPolicy: {
      en: 'KRS 205.6334 provides for Medicaid suspension during periods of incarceration to facilitate rapid post-release reinstatement.',
      es: 'KRS 205.6334 contempla la suspensión de Medicaid durante el encarcelamiento para facilitar el restablecimiento rápido.',
    },
  },
  {
    state: 'NY',
    name: { en: 'New York (1115 Reentry Demonstration Proposal)', es: 'Nueva York (Demostración de Reingreso 1115)' },
    status: 'approved',
    coverageWindowDays: 30,
    effectiveDate: '2024-01-09',
    cmsApprovalUrl: 'https://www.health.ny.gov/health_care/medicaid/redesign/medicaid_waiver_1115.htm',
    keyServices: {
      en: [
        'Pre-release behavioral health case management and MOUD linkage',
        'State correctional facility-wide MOUD access mandated under NY Correction Law § 626',
        'Discharge medication supply and direct appointment scheduling with Health Homes',
        'Naloxone distribution upon release from all state and county facilities',
      ],
      es: [
        'Gestión de casos de salud conductual previa a la salida y vinculación con MOUD',
        'Acceso a MOUD en todas las cárceles exigido por la Ley Penitenciaria de NY § 626',
        'Suministro de medicamentos al alta y programación con Health Homes comunitarios',
        'Distribución de naloxona al salir de todas las cárceles estatales y de condado',
      ],
    },
    suspensionPolicy: {
      en: 'NY Social Services Law § 366.1-a mandates Medicaid suspension rather than termination during incarceration up to 2 years.',
      es: 'La Ley de Servicios Sociales de NY § 366.1-a exige suspender Medicaid en lugar de cancelarlo durante el encarcelamiento hasta 2 años.',
    },
  },
  {
    state: 'UT',
    name: { en: 'Utah (Medicaid 1115 Targeted Reentry)', es: 'Utah (Reingreso Focalizado Medicaid 1115)' },
    status: 'approved',
    coverageWindowDays: 30,
    effectiveDate: '2023-11-01',
    cmsApprovalUrl: 'https://medicaid.utah.gov/1115-waiver/',
    keyServices: {
      en: [
        'Pre-release case management for individuals with serious mental illness or SUD',
        '30-day bridge supply of essential medications including MOUD',
        'Direct warm handoff to designated Local Mental Health Authorities (LMHAs)',
      ],
      es: [
        'Gestión de casos previa para personas con enfermedad mental grave o SUD',
        'Suministro puente de 30 días de medicamentos esenciales, incluido MOUD',
        'Transferencia cálida directa a las Autoridades Locales de Salud Mental (LMHA)',
      ],
    },
    suspensionPolicy: {
      en: 'Utah suspends Medicaid enrollment for eligible incarcerated adults to expedite immediate post-release care.',
      es: 'Utah suspende la inscripción de Medicaid para adultos elegibles para acelerar la atención inmediata tras la liberación.',
    },
  },
  {
    state: 'NM',
    name: { en: 'New Mexico (Centennial Care 1115 Reentry)', es: 'Nuevo México (Reingreso Centennial Care 1115)' },
    status: 'approved',
    coverageWindowDays: 30,
    effectiveDate: '2024-03-01',
    cmsApprovalUrl: 'https://www.hsd.state.nm.us/centennial-care-1115-waiver/',
    keyServices: {
      en: [
        'Pre-release MOUD continuity across county detention facilities',
        'Coordinated peer recovery support transitions',
        'Take-home naloxone and overdose education at facility release',
      ],
      es: [
        'Continuidad de MOUD previa a la liberación en centros de detención de condado',
        'Transiciones coordinadas con apoyo de pares de recuperación',
        'Naloxona para llevar a casa y educación contra sobredosis al salir',
      ],
    },
    suspensionPolicy: {
      en: 'NMSA 1978 § 27-2-12.22 provides for Medicaid suspension during incarceration.',
      es: 'NMSA 1978 § 27-2-12.22 estipula la suspensión de Medicaid durante el encarcelamiento.',
    },
  },
  {
    state: 'RI',
    name: { en: 'Rhode Island (Statewide Correctional MOUD Standard)', es: 'Rhode Island (Estándar Penitenciario Estatal MOUD)' },
    status: 'approved',
    coverageWindowDays: 90,
    effectiveDate: '2024-07-01',
    cmsApprovalUrl: 'https://eohhs.ri.gov/initiatives/medicaid-demonstration-waiver',
    keyServices: {
      en: [
        'Universal correctional MOUD model: all three FDA-approved medications (methadone, buprenorphine, naltrexone) available to all incarcerated individuals',
        'Demonstrated 61% post-incarceration overdose mortality reduction in statewide trials',
        'Pre-release warm handoff directly to CODAC and community OTP/OBOT clinics',
        'Take-home naloxone distributed to 100% of released individuals with SUD history',
      ],
      es: [
        'Modelo universal penitenciario MOUD: los tres medicamentos aprobados por la FDA disponibles para todos',
        'Reducción demostrada del 61% en la mortalidad por sobredosis posterior a la liberación',
        'Transferencia cálida directa a clínicas comunitarias CODAC y OTP/OBOT',
        'Naloxona distribuida al 100% de las personas liberadas con historial de SUD',
      ],
    },
    suspensionPolicy: {
      en: 'RIGL § 40-8-32 mandates suspension of Medicaid during periods of incarceration.',
      es: 'RIGL § 40-8-32 exige la suspensión de Medicaid durante períodos de reclusión.',
    },
  },
];

// Helper to lookup waiver status
export function getReentryWaiver(stateCode) {
  if (!stateCode) return null;
  const upper = String(stateCode).trim().toUpperCase();
  const match = REENTRY_MEDICAID_WAIVERS.find((w) => w.state === upper);
  if (match) return match;

  // General fallback for states without approved 1115 demonstration
  return {
    state: upper,
    name: {
      en: `${upper} (Standard Medicaid Rules - No 1115 Demonstration Active)`,
      es: `${upper} (Reglas estándar de Medicaid - Sin demostración 1115 activa)`,
    },
    status: 'standard_rules',
    coverageWindowDays: 0,
    effectiveDate: null,
    cmsApprovalUrl: 'https://www.medicaid.gov/medicaid/section-1115-demonstrations/index.html',
    keyServices: {
      en: [
        'Federal Medicaid Inmate Exclusion prevents pre-release Medicaid billing',
        'Individuals must apply for or reactivate Medicaid immediately upon release',
        'Direct referral to Federally Qualified Health Centers (FQHCs) for sliding-fee scale MOUD and care',
        'Access community harm reduction programs for free naloxone and sterile supplies upon release',
      ],
      es: [
        'La exclusión federal de reclusos de Medicaid impide facturar Medicaid antes de la salida',
        'Las personas deben solicitar o reactivar Medicaid de inmediato al ser liberadas',
        'Remisión directa a Centros de Salud Calificados a Nivel Federal (FQHC) para MOUD con escala móvil',
        'Acceso a programas comunitarios de reducción de daños para naloxona gratuita al salir',
      ],
    },
    suspensionPolicy: {
      en: 'Federal law encourages suspension over termination. Inquire with county discharge planners or local legal aid whether enrollment was suspended or terminated.',
      es: 'La ley federal promueve la suspensión en vez de la cancelación. Consulte con planificadores de alta o ayuda legal si la cobertura fue suspendida o cancelada.',
    },
  };
}

// ============================================================================
// 2. Post-Release Overdose Risk Timeline & Clinical Standards
// ============================================================================

export const REENTRY_POST_RELEASE_TIMELINE = [
  {
    stageId: 'immediate_gate',
    hours: '0-24 Hours (Gate / Discharge)',
    title: { en: 'Day 0: Discharge Gate & Immediate Safety', es: 'Día 0: Puerta de Salida y Seguridad Inmediata' },
    mortalityMultiplier: 'Up to 129x standard population risk',
    clinicalFocus: {
      en: 'Loss of pharmacological tolerance is absolute if not maintained on MOUD during incarceration. Even a fraction of previous dose can be fatal. Take-home naloxone (minimum 2 doses) and a confirmed 30-day medication bridge must be in hand before stepping outside the facility.',
      es: 'La pérdida de tolerancia farmacológica es total si no se mantuvo MOUD durante el encarcelamiento. Incluso una fracción de la dosis previa puede ser mortal. La naloxona para llevar a casa (mínimo 2 dosis) y un suministro puente confirmado de 30 días deben estar en mano antes de cruzar la puerta.',
    },
    priorityChecklist: {
      en: [
        'Confirm at least 2 doses of nasal naloxone (Narcan) are in your personal belongings upon discharge',
        'Ensure you have your 30-day medication supply or written bridge prescriptions with exact pharmacy addresses',
        'Receive official discharge paperwork and Medicaid reactivation verification',
        'Connect with pre-arranged transportation; avoid accepting rides from active substance use settings',
        'Call the Never Use Alone hotline (' + NEVER_USE_ALONE.label + ') if consuming any substance alone after release',
      ],
      es: [
        'Confirme al menos 2 dosis de naloxona nasal (Narcan) en sus pertenencias al momento del alta',
        'Asegúrese de tener su suministro de medicamentos de 30 días o recetas puente por escrito con farmacia exacta',
        'Reciba documentos oficiales de liberación y verificación de reactivación de Medicaid',
        'Conéctese con transporte coordinado previamente; evite viajes con entornos de consumo activo',
        'Llame a la línea Never Use Alone (' + NEVER_USE_ALONE.label + ') si consume cualquier sustancia a solas tras la liberación',
      ],
    },
  },
  {
    stageId: 'acute_window',
    hours: 'Days 1-7 (Critical Lethality Spike)',
    title: { en: 'Days 1-7: Peak Overdose Lethality Window', es: 'Días 1-7: Ventana de Mayor Mortalidad por Sobredosis' },
    mortalityMultiplier: '40x to 80x elevated risk',
    clinicalFocus: {
      en: 'Epidemiological studies (NEJM, Lancet) identify days 1 through 14 as the highest mortality period in the entire criminal legal continuum. Key drivers are fentanyl contamination, unmanaged withdrawal, acute emotional distress, and lack of immediate housing.',
      es: 'Estudios epidemiológicos (NEJM, Lancet) señalan los días 1 al 14 como el período de mayor mortalidad en todo el sistema penal. Los factores clave son contaminación con fentanilo, abstinencia no tratada, estrés agudo y falta de vivienda.',
    },
    priorityChecklist: {
      en: [
        'Attend your initial community MOUD appointment (OTP methadone or office buprenorphine) within 48 hours',
        'Report to probation or parole officer with verification of treatment enrollment (without sharing clinical notes)',
        'Obtain state ID or driver license replacement using prison discharge identification paperwork',
        'Access local Syringe Services Program (SSP) for free fentanyl test strips (FTS) and xylazine test strips',
        'Connect with a certified peer recovery specialist who has lived experience of reentry',
      ],
      es: [
        'Asista a su cita comunitaria inicial de MOUD (metadona en OTP o buprenorfina en consulta) dentro de 48 horas',
        'Preséntese ante su oficial de libertad condicional con certificado de inscripción en tratamiento (sin compartir notas clínicas)',
        'Obtenga reemplazo de identificación estatal o licencia con los documentos de liberación del penal',
        'Acuda a un Programa de Servicios de Jeringas (SSP) local para tiras reactivas de fentanilo y xilazina gratis',
        'Conéctese con un especialista par certificado con experiencia propia en reingreso',
      ],
    },
  },
  {
    stageId: 'stabilization_window',
    hours: 'Days 8-30 (Community Stabilization)',
    title: { en: 'Days 8-30: Healthcare & Benefits Stabilization', es: 'Días 8-30: Estabilización de Salud y Beneficios' },
    mortalityMultiplier: 'Substantially elevated without continuous MOUD',
    clinicalFocus: {
      en: 'Establishing sustainable community primary care, dental care, mental health counseling, and SNAP/TANF food benefits. Ongoing MOUD therapy reduces mortality by over 75% compared to untreated withdrawal.',
      es: 'Establecer atención primaria comunitaria sostenible, atención dental, asesoramiento en salud mental y beneficios de alimentos SNAP/TANF. La terapia continua con MOUD reduce la mortalidad en más del 75% en comparación con la abstinencia sin tratamiento.',
    },
    priorityChecklist: {
      en: [
        'Confirm active Medicaid managed care plan assignment and choose a primary care provider (PCP)',
        'Enroll in Supplemental Nutrition Assistance Program (SNAP/food stamps)',
        'Establish stable recovery housing (Oxford House or certified sober living) that permits prescribed MOUD',
        'Review FMLA and ADA workplace rights before beginning employment or job applications',
        'Establish an emergency peer support backup plan for cravings or psychological stress triggers',
      ],
      es: [
        'Confirme la asignación del plan de Medicaid administrado y elija un proveedor de atención primaria (PCP)',
        'Inscríbase en el Programa de Asistencia Nutricional Suplementaria (SNAP/estampillas de comida)',
        'Establezca vivienda de recuperación estable (Oxford House o residencia certificada) que acepte MOUD prescrito',
        'Revise los derechos laborales de FMLA y ADA antes de solicitar empleo o empezar a trabajar',
        'Establezca un plan de respaldo de apoyo de pares para momentos de antojo o estrés psicológico',
      ],
    },
  },
  {
    stageId: 'long_term',
    hours: 'Days 31-90+ (Sustained Community Reintegration)',
    title: { en: 'Days 31-90+: Sustained Reintegration & Legal Compliance', es: 'Días 31-90+: Reintegración Sostenida y Cumplimiento Legal' },
    mortalityMultiplier: 'Protective baseline when engaged in continuous care',
    clinicalFocus: {
      en: 'Transition from crisis stabilization to personal capital building: education, vocational rehabilitation, record sealing/expungement where eligible, and permanent independent housing.',
      es: 'Transición de la estabilización de crisis al fortalecimiento del capital personal: educación, rehabilitación vocacional, cancelación de antecedentes donde aplique y vivienda permanente.',
    },
    priorityChecklist: {
      en: [
        'Maintain uninterrupted MOUD prescription refills and regular clinical follow-ups',
        'Obtain annual Medicaid redetermination notice updates to prevent inadvertent benefit lapses',
        'Explore record expungement, sealing, or Certificate of Rehabilitation opportunities with legal aid',
        'Engage in mutual aid peer communities (SMART Recovery, MARA, LifeRing, 12-Step) aligned with your values',
      ],
      es: [
        'Mantenga surtidos ininterrumpidos de recetas MOUD y seguimiento clínico regular',
        'Actualice la dirección para avisos de redeterminación anual de Medicaid para evitar lapsos involuntarios',
        'Explore opciones de cancelación de antecedentes penales o Certificado de Rehabilitación con ayuda legal',
        'Participe en comunidades de ayuda mutua (SMART Recovery, MARA, LifeRing, 12 Pasos) acordes con sus valores',
      ],
    },
  },
];

// ============================================================================
// 3. Criminal Legal & Supervision Protections (DOJ ADA & 42 CFR Part 2)
// ============================================================================

export const REENTRY_SUPERVISION_PROTECTIONS = [
  {
    topicId: 'ada_moud_protection',
    title: {
      en: 'DOJ ADA Title II Protections: Prescribed MOUD Under Court & Probation Supervision',
      es: 'Protecciones ADA Título II del DOJ: MOUD Recetado bajo Supervisión Judicial y de Libertad Condicional',
    },
    authority: '42 U.S.C. § 12132; U.S. Dept of Justice Civil Rights Division Guidance (April 5, 2022)',
    summary: {
      en: 'Under the Americans with Disabilities Act (ADA), state and local government entities—including probation departments, parole boards, drug treatment courts, and correctional facilities—CANNOT discriminate against individuals who take medications for opioid use disorder (MOUD: methadone, buprenorphine, naltrexone) as prescribed by a licensed healthcare professional.',
      es: 'Bajo la Ley para Estadounidenses con Discapacidades (ADA), las entidades gubernamentales estatales y locales (incluyendo departamentos de libertad condicional, juntas de libertad bajo palabra, tribunales de drogas y centros penitenciarios) NO PUEDEN discriminar a personas que toman medicamentos para el trastorno por uso de opioides (MOUD: metadona, buprenorfina, naltrexona) recetados por un profesional de la salud con licencia.',
    },
    actionableRules: {
      en: [
        'A probation or parole officer CANNOT legally order you to stop taking, taper off, or switch your prescribed MOUD medication.',
        'You CANNOT be violated, revoked, or returned to jail or prison solely because a toxicology screen tests positive for your lawfully prescribed MOUD.',
        'A drug court or diversion program CANNOT deny you admission, mandate forced tapering, or penalize you for taking prescribed MOUD.',
        'If a supervision officer threatens revocation for prescribed MOUD, this is a violation of federal civil rights law under Title II of the ADA.',
      ],
      es: [
        'Un oficial de libertad condicional NO PUEDE legalmente ordenarle dejar de tomar, reducir gradualmente ni cambiar su MOUD recetado.',
        'NO PUEDE ser sancionado, revocado ni devuelto a prisión únicamente porque un examen toxicológico resulte positivo para su MOUD legalmente prescrito.',
        'Un tribunal de drogas o programa de desvío NO PUEDE negarle la admisión, forzarlo a reducir la dosis ni penalizarlo por tomar MOUD recetado.',
        'Si un oficial de supervisión amenaza con revocación por tomar MOUD prescrito, constituye una violación de los derechos civiles federales bajo el Título II de la ADA.',
      ],
    },
  },
  {
    topicId: 'confidentiality_42cfr',
    title: {
      en: '42 CFR Part 2 & HIPAA: Disclosure Boundaries with Probation and Parole Officers',
      es: '42 CFR Parte 2 y HIPAA: Límites de Divulgación con Oficiales de Libertad Condicional',
    },
    authority: '42 C.F.R. Part 2 § 2.35 (Criminal Justice System Referrals); 45 C.F.R. § 164.512',
    summary: {
      en: 'Federal law strictly protects the confidentiality of substance use disorder treatment records. When treatment enrollment is a condition of probation, parole, or pre-trial release, a specialized disclosure consent (under 42 C.F.R. § 2.35) can be used, but the scope must be strictly limited to compliance and attendance—NOT clinical psychotherapy details.',
      es: 'La ley federal protege estrictamente la confidencialidad de los expedientes de tratamiento de adicciones. Cuando la inscripción en tratamiento es condición de libertad condicional o supervisión, se puede emplear un consentimiento especializado (42 CFR § 2.35), pero su alcance debe limitarse estrictamente al cumplimiento y asistencia, NO a detalles psicoterapéuticos.',
    },
    actionableRules: {
      en: [
        'Permissible disclosures to supervision officers: Whether you are enrolled, your attendance record, whether you are in general compliance, and date of discharge.',
        'Protected clinical information that SHOULD NOT be shared: Detailed session notes, trauma disclosures, psychotherapy discussions, or specific medical diagnoses.',
        'Self-incrimination protection: Admissions of past substance use made in clinical counseling cannot be turned over to prosecutors to initiate new criminal charges without a specialized court order under 42 C.F.R. § 2.65.',
        'Always ask your healthcare clinic to execute a limited 42 CFR § 2.35 Criminal Justice Consent specifying that only attendance and compliance status may be reported.',
      ],
      es: [
        'Divulgaciones permitidas a oficiales de supervisión: Si está inscrito, registro de asistencia, si cumple en general y fecha de alta.',
        'Información clínica protegida que NO DEBE compartirse: Notas detalladas de sesiones, revelaciones de trauma, discusiones psicoterapéuticas o diagnósticos médicos específicos.',
        'Protección contra autoincriminación: Las declaraciones de consumo pasado hechas en consejería clínica no pueden entregarse a fiscales para abrir nuevos cargos sin orden judicial según 42 CFR § 2.65.',
        'Siempre solicite a su clínica de salud redactar un consentimiento limitado de 42 CFR § 2.35 que restrinja el reporte únicamente a asistencia y estado de cumplimiento.',
      ],
    },
  },
  {
    topicId: 'court_ordered_treatment',
    title: {
      en: 'Court-Ordered Treatment vs. Clinical Evidence-Based Autonomy',
      es: 'Tratamiento por Orden Judicial vs. Autonomía Clínica Basada en Evidencia',
    },
    authority: 'SAMHSA TIP 44 (Substance Abuse Treatment for Adults in the Criminal Justice System)',
    summary: {
      en: 'Judges and probation officers determine legal conditions, but medical decisions—such as the exact dose of buprenorphine or methadone, frequency of counseling, and medical withdrawal timelines—are exclusively the professional domain of licensed healthcare providers.',
      es: 'Los jueces y oficiales de supervisión determinan las condiciones legales, pero las decisiones médicas (como la dosis exacta de buprenorfina o metadona, frecuencia de consejería y tiempos de desintoxicación) pertenecen exclusivamente a los profesionales de la salud con licencia.',
    },
    actionableRules: {
      en: [
        'A court cannot prescribe or alter clinical medications. Only a licensed physician, NP, or PA can adjust your medical treatment.',
        'If a court orders an "abstinence-only" program that bans MOUD, your defense attorney can cite the DOJ ADA Title II guidance to request a modification to an MOUD-affirming program.',
        'You have the right to request treatment at an FQHC or certified Opioid Treatment Program (OTP) that follows national medical standards.',
      ],
      es: [
        'Un tribunal no puede prescribir ni alterar medicamentos clínicos. Solo un médico, enfermero practicante o asistente médico puede ajustar su tratamiento.',
        'Si un tribunal ordena un programa de "solo abstinencia" que prohíbe MOUD, su abogado defensor puede citar la guía ADA Título II del DOJ para solicitar una modificación a un programa que acepte MOUD.',
        'Tiene derecho a solicitar tratamiento en un FQHC o Programa de Tratamiento de Opioides (OTP) certificado que siga estándares médicos nacionales.',
      ],
    },
  },
];

// ============================================================================
// 4. In-RAM Reentry Assessment Engine: evaluateReentryPlan(inputs)
// ============================================================================

export function evaluateReentryPlan(inputs = {}) {
  const {
    stateCode = '',
    releaseWindow = 'within_30_days', // 'within_90_days' | 'within_30_days' | 'released_within_14_days' | 'released_over_14_days' | 'advocate_family'
    currentMoud = 'none_interested',   // 'buprenorphine' | 'methadone' | 'naltrexone' | 'none_interested' | 'none_not_interested'
    supervisionStatus = 'probation',   // 'probation' | 'parole' | 'drug_court' | 'none' | 'unclear'
    housingStatus = 'unknown',         // 'stable' | 'transitional_reentry' | 'unhoused_shelter' | 'unknown'
    hasMedicaid = 'unknown',           // 'active' | 'suspended' | 'terminated' | 'unknown'
  } = inputs;

  const waiver = getReentryWaiver(stateCode);
  const isWaiverActive = waiver && waiver.status === 'approved';

  // Determine Overdose Risk Tier
  let riskTier = 'high';
  let riskScore = 0;
  const riskFactors = [];

  if (releaseWindow === 'released_within_14_days') {
    riskScore += 4;
    riskFactors.push({
      en: 'First 14 days post-release: Up to 129x fatal overdose spike due to rapid loss of tolerance during incarceration.',
      es: 'Primeros 14 días tras la salida: Riesgo hasta 129x de sobredosis mortal por pérdida rápida de tolerancia.',
    });
  } else if (releaseWindow === 'within_30_days') {
    riskScore += 2;
    riskFactors.push({
      en: 'Approaching release within 30 days: Critical window to coordinate 30-day medication bridge and discharge naloxone.',
      es: 'Liberación en menos de 30 días: Ventana crítica para coordinar suministro de 30 días y naloxona al alta.',
    });
  }

  if (currentMoud === 'none_interested') {
    riskScore += 3;
    riskFactors.push({
      en: 'No active MOUD: Lack of pharmacological stabilization creates extreme vulnerability to fatal fentanyl exposure upon community return.',
      es: 'Sin MOUD activo: La falta de estabilización farmacológica genera vulnerabilidad extrema ante exposición a fentanilo en la comunidad.',
    });
  } else if (currentMoud === 'buprenorphine' || currentMoud === 'methadone') {
    riskFactors.push({
      en: 'Currently on MOUD: Continuity is essential. Discontinuation at discharge triggers acute withdrawal and severe overdose risk.',
      es: 'Actualmente en MOUD: La continuidad es vital. La interrupción al salir desencadena abstinencia aguda y grave riesgo de sobredosis.',
    });
  }

  if (housingStatus === 'unhoused_shelter') {
    riskScore += 2;
    riskFactors.push({
      en: 'Unstable or unhoused living situation: Higher environmental stress, lack of safe storage for medications, and elevated overdose vulnerability.',
      es: 'Situación de vivienda inestable o sin hogar: Mayor estrés ambiental, falta de almacenamiento seguro y riesgo elevado de sobredosis.',
    });
  }

  if (hasMedicaid === 'terminated' || hasMedicaid === 'unknown') {
    riskScore += 2;
    riskFactors.push({
      en: 'Medicaid gap or termination: Potential delay in accessing community clinic prescriptions and counseling upon release.',
      es: 'Falta o cancelación de Medicaid: Posible retraso para acceder a recetas en clínicas comunitarias y consejería al salir.',
    });
  }

  if (riskScore >= 5 || releaseWindow === 'released_within_14_days') {
    riskTier = 'critical';
  } else if (riskScore >= 2) {
    riskTier = 'high';
  } else {
    riskTier = 'moderate';
  }

  // Generate Personalized Discharge & Reentry Checklist
  const checklist = [];

  // MOUD & Health Checklist Items
  if (currentMoud === 'buprenorphine' || currentMoud === 'methadone' || currentMoud === 'naltrexone') {
    checklist.push({
      category: 'health_moud',
      priority: 'immediate',
      title: {
        en: 'Secure 30-Day Medication Bridge at the Gate',
        es: 'Asegurar Suministro Puente de 30 Días en la Puerta',
      },
      detail: {
        en: `Ensure the facility medical department provides a 30-day physical supply or e-prescribes a 30-day bridge of ${currentMoud} to a community pharmacy located near your release destination. In ${waiver.name.en}, 1115 rules support pre-release transitional coverage.`,
        es: `Asegúrese de que el departamento médico del penal proporcione suministro físico de 30 días o envíe receta electrónica de 30 días de ${currentMoud} a una farmacia comunitaria cercana a su destino. En ${waiver.name.es}, las reglas 1115 respaldan la cobertura de transición.`,
      },
    });
  } else {
    checklist.push({
      category: 'health_moud',
      priority: 'immediate',
      title: {
        en: 'Request Pre-Release MOUD Evaluation or Immediate Community Intake',
        es: 'Solicitar Evaluación de MOUD Previa o Ingreso Comunitario Inmediato',
      },
      detail: {
        en: 'Ask the correctional medical unit for buprenorphine or methadone initiation before release, or schedule an intake at a community Federally Qualified Health Center (FQHC) for your first 48 hours post-release.',
        es: 'Solicite a la unidad médica penitenciaria el inicio de buprenorfina o metadona antes de salir, o programe cita en un Centro de Salud FQHC dentro de sus primeras 48 horas de libertad.',
      },
    });
  }

  // Overdose Prevention & Harm Reduction
  checklist.push({
    category: 'harm_reduction',
    priority: 'immediate',
    title: {
      en: 'Obtain Take-Home Naloxone (Narcan) Kits & Fentanyl Test Strips',
      es: 'Obtener Kits de Naloxona (Narcan) para Llevar y Tiras de Fentanilo',
    },
    detail: {
      en: 'Request at least 2 doses of nasal naloxone directly upon discharge. Locate your nearest Syringe Services Program (SSP) or mutual aid distributor for additional free naloxone and test strips. Save the Never Use Alone number (' + NEVER_USE_ALONE.label + ') in your phone.',
      es: 'Solicite al menos 2 dosis de naloxona nasal directamente al salir. Localice el Programa de Jeringas (SSP) o distribuidor de ayuda mutua más cercano para naloxona adicional y tiras reactivas gratuitas. Guarde el número de Never Use Alone (' + NEVER_USE_ALONE.label + ') en su teléfono.',
    },
  });

  // Medicaid & Benefits
  if (hasMedicaid === 'suspended') {
    checklist.push({
      category: 'benefits',
      priority: 'high',
      title: {
        en: 'Reactivate Suspended Medicaid Coverage',
        es: 'Reactivar Cobertura Suspendida de Medicaid',
      },
      detail: {
        en: `Provide your release verification letter to your state Medicaid office or regional social services department. Under ${waiver.state} suspension rules, benefits can be restored without submitting a brand-new application.`,
        es: `Presente su carta de verificación de salida a la oficina estatal de Medicaid o servicios sociales. Con las normas de suspensión de ${waiver.state}, los beneficios se restablecen sin presentar una nueva solicitud completa.`,
      },
    });
  } else if (hasMedicaid === 'terminated' || hasMedicaid === 'unknown') {
    checklist.push({
      category: 'benefits',
      priority: 'high',
      title: {
        en: 'Submit Rapid Post-Release Medicaid Application',
        es: 'Presentar Solicitud Rápida de Medicaid tras la Salida',
      },
      detail: {
        en: 'Visit a certified Application Counselor at a local FQHC or county social services agency. Low-income individuals returning from incarceration qualify for Medicaid under ACA expansion in most states without waiting for open enrollment.',
        es: 'Visite a un orientador de solicitudes en un FQHC o agencia de servicios sociales del condado. Las personas de bajos ingresos que reingresan califican para Medicaid bajo la expansión de la ACA en la mayoría de los estados.',
      },
    });
  }

  // Legal & Supervision Protection
  if (supervisionStatus === 'probation' || supervisionStatus === 'parole' || supervisionStatus === 'drug_court') {
    checklist.push({
      category: 'legal_supervision',
      priority: 'high',
      title: {
        en: 'Deliver MOUD Prescription Verification Letter to Supervision Officer',
        es: 'Entregar Carta de Verificación de Receta MOUD al Oficial de Supervisión',
      },
      detail: {
        en: `Provide your ${supervisionStatus} officer with a formal verification letter from your licensed clinician confirming your prescribed MOUD medication. Remind them of federal DOJ ADA Title II guidance prohibiting adverse actions or revocation for prescribed MOUD.`,
        es: `Entregue a su oficial de ${supervisionStatus} una carta formal de su médico con licencia que certifique su tratamiento con MOUD recetado. Recuerde la guía federal ADA Título II del DOJ que prohíbe acciones adversas o revocación por MOUD prescrito.`,
      },
    });
    checklist.push({
      category: 'legal_supervision',
      priority: 'moderate',
      title: {
        en: 'Sign a Limited 42 CFR Part 2 Attendance-Only Consent',
        es: 'Firmar Consentimiento Limitado de 42 CFR Parte 2 Solo para Asistencia',
      },
      detail: {
        en: 'Instruct your treatment provider to use a limited 42 CFR § 2.35 consent that authorizes reporting only attendance, enrollment, and discharge status—strictly withholding detailed counseling notes and medical records.',
        es: 'Indique a su proveedor que utilice un consentimiento limitado de 42 CFR § 2.35 que autorice únicamente informar asistencia, inscripción y estado de alta, reteniendo notas de consejería y expedientes médicos detallados.',
      },
    });
  }

  // Housing & Community
  checklist.push({
    category: 'housing_community',
    priority: housingStatus === 'unhoused_shelter' ? 'immediate' : 'moderate',
    title: {
      en: 'Connect with MOUD-Affirming Recovery Housing or Shelter',
      es: 'Conectar con Vivienda de Recuperación o Refugio que Acepte MOUD',
    },
    detail: {
      en: 'Look for Oxford Houses (democratically run, self-supporting recovery homes that accept MOUD under federal Fair Housing Act rules) or transitional reentry housing providers funded through local reentry task forces.',
      es: 'Busque residencias Oxford House (hogares de recuperación autogestionados que aceptan MOUD bajo la Ley de Vivienda Justa) o proveedores de vivienda de reingreso financiados por comités locales.',
    },
  });

  return {
    evaluatedAt: new Date().toISOString(),
    inputs,
    waiver,
    isWaiverActive,
    riskTier,
    riskScore,
    riskFactors,
    checklist,
    timeline: REENTRY_POST_RELEASE_TIMELINE,
    supervisionProtections: REENTRY_SUPERVISION_PROTECTIONS,
  };
}

// ============================================================================
// 5. In-RAM Ephemeral State Management
// ============================================================================

let reentryState = {
  stateCode: 'CA',
  releaseWindow: 'within_30_days',
  currentMoud: 'none_interested',
  supervisionStatus: 'probation',
  housingStatus: 'unknown',
  hasMedicaid: 'unknown',
  activeTab: 'assessment', // 'assessment' | 'timeline' | 'rights' | 'waivers'
  lastEvaluation: null,
};

export function getReentryState() {
  return { ...reentryState };
}

export function setReentryState(partial) {
  reentryState = { ...reentryState, ...partial };
  return getReentryState();
}

export function resetReentryState() {
  reentryState = {
    stateCode: 'CA',
    releaseWindow: 'within_30_days',
    currentMoud: 'none_interested',
    supervisionStatus: 'probation',
    housingStatus: 'unknown',
    hasMedicaid: 'unknown',
    activeTab: 'assessment',
    lastEvaluation: null,
  };
  return getReentryState();
}

// ============================================================================
// 6. Text Formatter for Printing and Sharing
// ============================================================================

export function formatReentrySummaryText(plan, lang = 'en') {
  if (!plan) return '';
  const isEs = lang === 'es';
  const divider = '======================================================================';
  const subDivider = '----------------------------------------------------------------------';

  const lines = [
    divider,
    isEs
      ? 'GUÍA CLÍNICA Y LEGAL DE REINGRESO PENITENCIARIO - HARBORPATH'
      : 'INCARCERATION REENTRY CLINICAL & LEGAL CARE PLAN - HARBORPATH',
    isEs
      ? 'Asistencia ephemera en memoria | Cero rastreo | Confidencial'
      : 'In-RAM Ephemeral Decision Support | Zero Tracking | Confidential',
    divider,
    '',
    `${isEs ? 'Estado evaluado' : 'Jurisdiction'}: ${plan.waiver ? (isEs ? plan.waiver.name.es : plan.waiver.name.en) : 'N/A'}`,
    `${isEs ? 'Nivel de riesgo de sobredosis' : 'Overdose Risk Tier'}: ${plan.riskTier.toUpperCase()}`,
    `${isEs ? 'Estado de exención 1115' : '1115 Waiver Status'}: ${plan.isWaiverActive ? (isEs ? 'APROBADA POR CMS (Cobertura previa de 90 días)' : 'CMS APPROVED (Pre-release coverage)') : (isEs ? 'REGLAS ESTÁNDAR' : 'STANDARD MEDICAID RULES')}`,
    '',
    subDivider,
    isEs ? 'FACTORES DE RIESGO IDENTIFICADOS:' : 'IDENTIFIED OVERDOSE RISK FACTORS:',
    subDivider,
  ];

  for (const factor of plan.riskFactors) {
    lines.push(`* ${isEs ? factor.es : factor.en}`);
  }

  lines.push('');
  lines.push(subDivider);
  lines.push(isEs ? 'LISTA DE ACCIONES PRIORITARIAS PARA EL ALTA:' : 'PRIORITY DISCHARGE & REENTRY ACTION ITEMS:');
  lines.push(subDivider);

  for (const item of plan.checklist) {
    const title = isEs ? item.title.es : item.title.en;
    const detail = isEs ? item.detail.es : item.detail.en;
    lines.push(`[${item.priority.toUpperCase()}] ${title}`);
    lines.push(`  ${detail}`);
    lines.push('');
  }

  lines.push(subDivider);
  lines.push(isEs ? 'PROTECCIONES LEGALES CLAVE (ADA TÍTULO II Y 42 CFR PARTE 2):' : 'KEY LEGAL PROTECTIONS (DOJ ADA TITLE II & 42 CFR PART 2):');
  lines.push(subDivider);
  lines.push(
    isEs
      ? '1. Oficiales de libertad condicional NO PUEDEN ordenarle dejar MOUD ni revocar su libertad por tomar MOUD prescrito (DOJ ADA Guía 2022).'
      : '1. Probation/parole officers CANNOT order you to taper or revoke you for lawfully prescribed MOUD (DOJ ADA Title II 2022).'
  );
  lines.push(
    isEs
      ? '2. Expedientes de tratamiento están protegidos por 42 CFR Parte 2. Solo informe cumplimiento y asistencia básica.'
      : '2. Clinical treatment notes are strictly protected under 42 CFR Part 2. Only attendance and compliance should be reported.'
  );
  lines.push(
    isEs
      ? '3. Línea Never Use Alone si consume a solas: ' + NEVER_USE_ALONE.label + ' | En emergencia por sobredosis llame al 911.'
      : '3. Never Use Alone line if consuming alone: ' + NEVER_USE_ALONE.label + ' | In overdose emergency call 911.'
  );
  lines.push('');
  lines.push(divider);

  return lines.join('\n');
}

// ============================================================================
// 7. Interactive Reentry DOM View: reentryView(container, options)
// ============================================================================

export function reentryView(containerOrOptions = {}, maybeOptions = {}) {
  let container = null;
  let options = maybeOptions;
  if (containerOrOptions && (typeof containerOrOptions.append === 'function' || containerOrOptions.nodeType || containerOrOptions.tagName)) {
    container = containerOrOptions;
  } else {
    options = containerOrOptions || {};
  }
  if (container) 
  clear(container);
  const lang = getLang();
  const isEs = lang === 'es';

  // Evaluate current state
  const plan = evaluateReentryPlan(getReentryState());
  setReentryState({ lastEvaluation: plan });

  // Main wrapper
  const root = h('div', { class: 'reentry-view' });

  // Header
  const header = pageHeader(
    isEs ? 'Reingreso Penitenciario y Salud Legal' : 'Incarceration Reentry & Criminal Legal Health',
    isEs
      ? 'Orientación clínica y legal basada en la exención 1115 de Medicaid, prevención de sobredosis mortal tras la liberación y protecciones de la ADA para medicamentos MOUD.'
      : 'Clinical and statutory guidance on Section 1115 Reentry Medicaid waivers, post-release fatal overdose prevention, and DOJ ADA Title II protections for MOUD.'
  );
  root.append(header);

  // Privacy Alert Banner
  const privacyAlert = h(
    'div',
    { class: 'panel alert-panel', role: 'note', 'aria-label': isEs ? 'Privacidad' : 'Privacy' },
    h('div', { class: 'panel-header' },
      icon('shield', { class: 'panel-icon' }),
      h('h2', { class: 'panel-title' }, isEs ? 'Asistencia Epímera en Memoria' : 'In-RAM Ephemeral Decision Support')
    ),
    h('p', { class: 'panel-body' },
      isEs
        ? 'Toda la información se procesa exclusivamente en la memoria temporal del navegador. Ninguna respuesta se escribe en el disco, ni en URLs, ni se envía a servidores. Se restablece al activar Salida Rápida.'
        : 'All selections are processed exclusively in temporary browser RAM. No answers are written to device storage, URLs, or servers. State is wiped upon Quick Exit.'
    )
  );
  root.append(privacyAlert);

  // Navigation Tabs
  const tabNav = h('div', { class: 'tab-bar', role: 'tablist', 'aria-label': isEs ? 'Secciones de reingreso' : 'Reentry sections' });
  const tabs = [
    { id: 'assessment', label: isEs ? 'Evaluación y Plan' : 'Assessment & Plan' },
    { id: 'timeline', label: isEs ? 'Cronograma de Riesgo' : 'Overdose Timeline' },
    { id: 'rights', label: isEs ? 'Derechos ADA y Supervisión' : 'DOJ ADA Rights' },
    { id: 'waivers', label: isEs ? 'Directorio Exenciones 1115' : '1115 Waiver Directory' },
  ];

  const currentTab = reentryState.activeTab;

  tabs.forEach((tab) => {
    const isSelected = tab.id === currentTab;
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `tab-btn-${tab.id}`,
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-controls': `tab-panel-${tab.id}`,
      class: isSelected ? 'tab active' : 'tab',
    }, tab.label);

    btn.addEventListener('click', () => {
      setReentryState({ activeTab: tab.id });
      reentryView(container, options);
    });

    tabNav.append(btn);
  });
  root.append(tabNav);

  // Tab Panels Container
  const tabPanel = h('div', {
    id: `tab-panel-${currentTab}`,
    role: 'tabpanel',
    'aria-labelledby': `tab-btn-${currentTab}`,
    class: 'tab-content-panel',
  });

  // --------------------------------------------------------------------------
  // TAB 1: Assessment & Personalized Action Plan
  // --------------------------------------------------------------------------
  if (currentTab === 'assessment') {
    // Form Container
    const formCard = h('div', { class: 'card assessment-card' });
    formCard.append(h('h3', { class: 'card-title' }, isEs ? 'Parámetros de Reingreso y Situación' : 'Reentry Situation & Risk Assessment'));

    const formGrid = h('div', { class: 'form-grid' });

    // 1. State Selector
    const stateGroup = h('div', { class: 'form-group' });
    stateGroup.append(h('label', { for: 'reentry-state-select' }, isEs ? 'Estado o Territorio:' : 'State or Territory:'));
    const stateSelect = h('select', { id: 'reentry-state-select', class: 'input-select' });

    const supportedStates = [
      { code: 'CA', name: 'California (CalAIM 90-day 1115)' },
      { code: 'WA', name: 'Washington (90-day 1115)' },
      { code: 'MA', name: 'Massachusetts (MassHealth 90-day 1115)' },
      { code: 'IL', name: 'Illinois (90-day 1115)' },
      { code: 'OR', name: 'Oregon (90-day 1115)' },
      { code: 'KY', name: 'Kentucky (60-day 1115)' },
      { code: 'NY', name: 'New York (30-day 1115)' },
      { code: 'UT', name: 'Utah (30-day 1115)' },
      { code: 'NM', name: 'New Mexico (30-day 1115)' },
      { code: 'RI', name: 'Rhode Island (90-day 1115)' },
      { code: 'TX', name: 'Texas (Standard Rules)' },
      { code: 'FL', name: 'Florida (Standard Rules)' },
      { code: 'OH', name: 'Ohio (Standard Rules)' },
      { code: 'PA', name: 'Pennsylvania (Standard Rules)' },
      { code: 'NC', name: 'North Carolina (Standard Rules)' },
      { code: 'GA', name: 'Georgia (Standard Rules)' },
      { code: 'MI', name: 'Michigan (Standard Rules)' },
      { code: 'AZ', name: 'Arizona (Standard Rules)' },
    ];

    supportedStates.forEach((st) => {
      const opt = h('option', { value: st.code }, st.name);
      if (st.code === reentryState.stateCode) opt.selected = true;
      stateSelect.append(opt);
    });

    stateSelect.addEventListener('change', (e) => {
      setReentryState({ stateCode: e.target.value });
      reentryView(container, options);
    });
    stateGroup.append(stateSelect);
    formGrid.append(stateGroup);

    // 2. Release Window
    const releaseGroup = h('div', { class: 'form-group' });
    releaseGroup.append(h('label', { for: 'release-window-select' }, isEs ? 'Fecha o Ventana de Liberación:' : 'Release Timeline Window:'));
    const releaseSelect = h('select', { id: 'release-window-select', class: 'input-select' });

    const windows = [
      { id: 'within_90_days', label: isEs ? 'Próximos 90 días (Elegible 1115)' : 'Within 90 days (1115 waiver eligible)' },
      { id: 'within_30_days', label: isEs ? 'Próximos 30 días (Crítico para puente de medicamentos)' : 'Within 30 days (Bridge supply critical)' },
      { id: 'released_within_14_days', label: isEs ? 'Liberado en los últimos 14 días (Pico máximo de riesgo)' : 'Released within past 14 days (Peak risk window)' },
      { id: 'released_over_14_days', label: isEs ? 'Liberado hace más de 14 días (Comunidad)' : 'Released > 14 days ago (Community stabilization)' },
      { id: 'advocate_family', label: isEs ? 'Apoyo familiar / Defensor legal' : 'Family member or advocate preparing support' },
    ];

    windows.forEach((w) => {
      const opt = h('option', { value: w.id }, w.label);
      if (w.id === reentryState.releaseWindow) opt.selected = true;
      releaseSelect.append(opt);
    });

    releaseSelect.addEventListener('change', (e) => {
      setReentryState({ releaseWindow: e.target.value });
      reentryView(container, options);
    });
    releaseGroup.append(releaseSelect);
    formGrid.append(releaseGroup);

    // 3. Current MOUD Status
    const moudGroup = h('div', { class: 'form-group' });
    moudGroup.append(h('label', { for: 'moud-status-select' }, isEs ? 'Estado con Medicamentos MOUD:' : 'MOUD Medication Status:'));
    const moudSelect = h('select', { id: 'moud-status-select', class: 'input-select' });

    const moudOpts = [
      { id: 'none_interested', label: isEs ? 'Sin medicación / Desea MOUD al salir' : 'Not on MOUD / Interested in starting' },
      { id: 'buprenorphine', label: isEs ? 'Buprenorfina / Suboxone en el penal' : 'Currently on Buprenorphine / Suboxone' },
      { id: 'methadone', label: isEs ? 'Metadona en el penal (OTP)' : 'Currently on Methadone (OTP)' },
      { id: 'naltrexone', label: isEs ? 'Naltrexona / Vivitrol' : 'Currently on Naltrexone / Vivitrol' },
      { id: 'none_not_interested', label: isEs ? 'Sin medicación / No interesado' : 'Not on MOUD / Not currently interested' },
    ];

    moudOpts.forEach((m) => {
      const opt = h('option', { value: m.id }, m.label);
      if (m.id === reentryState.currentMoud) opt.selected = true;
      moudSelect.append(opt);
    });

    moudSelect.addEventListener('change', (e) => {
      setReentryState({ currentMoud: e.target.value });
      reentryView(container, options);
    });
    moudGroup.append(moudSelect);
    formGrid.append(moudGroup);

    // 4. Supervision Status
    const superGroup = h('div', { class: 'form-group' });
    superGroup.append(h('label', { for: 'supervision-status-select' }, isEs ? 'Tipo de Supervisión Legal:' : 'Legal Supervision Status:'));
    const superSelect = h('select', { id: 'supervision-status-select', class: 'input-select' });

    const superOpts = [
      { id: 'probation', label: isEs ? 'Libertad condicional (Probation)' : 'Probation supervision' },
      { id: 'parole', label: isEs ? 'Libertad bajo palabra (Parole)' : 'Parole supervision' },
      { id: 'drug_court', label: isEs ? 'Tribunal de drogas / Desvío' : 'Drug court / Diversion program' },
      { id: 'none', label: isEs ? 'Sin supervisión / Fin de condena' : 'No supervision (maxed out sentence)' },
      { id: 'unclear', label: isEs ? 'No está seguro' : 'Uncertain / Pending' },
    ];

    superOpts.forEach((s) => {
      const opt = h('option', { value: s.id }, s.label);
      if (s.id === reentryState.supervisionStatus) opt.selected = true;
      superSelect.append(opt);
    });

    superSelect.addEventListener('change', (e) => {
      setReentryState({ supervisionStatus: e.target.value });
      reentryView(container, options);
    });
    superGroup.append(superSelect);
    formGrid.append(superGroup);

    // 5. Housing Status
    const houseGroup = h('div', { class: 'form-group' });
    houseGroup.append(h('label', { for: 'housing-status-select' }, isEs ? 'Situación de Vivienda al Salir:' : 'Post-Release Housing Status:'));
    const houseSelect = h('select', { id: 'housing-status-select', class: 'input-select' });

    const houseOpts = [
      { id: 'unknown', label: isEs ? 'Por determinar / Incierta' : 'Undetermined / Uncertain' },
      { id: 'stable', label: isEs ? 'Vivienda estable con familia / Propia' : 'Stable housing (own home / supportive family)' },
      { id: 'transitional_reentry', label: isEs ? 'Casa de transición / Hogar Oxford' : 'Transitional reentry housing / Oxford House' },
      { id: 'unhoused_shelter', label: isEs ? 'Sin hogar / Refugio de emergencia' : 'Unhoused / Emergency shelter / Unsheltered' },
    ];

    houseOpts.forEach((ho) => {
      const opt = h('option', { value: ho.id }, ho.label);
      if (ho.id === reentryState.housingStatus) opt.selected = true;
      houseSelect.append(opt);
    });

    houseSelect.addEventListener('change', (e) => {
      setReentryState({ housingStatus: e.target.value });
      reentryView(container, options);
    });
    houseGroup.append(houseSelect);
    formGrid.append(houseGroup);

    // 6. Medicaid Status
    const medGroup = h('div', { class: 'form-group' });
    medGroup.append(h('label', { for: 'medicaid-status-select' }, isEs ? 'Estado de Cobertura Medicaid:' : 'Medicaid Coverage Status:'));
    const medSelect = h('select', { id: 'medicaid-status-select', class: 'input-select' });

    const medOpts = [
      { id: 'unknown', label: isEs ? 'Desconocido' : 'Unknown / Not sure' },
      { id: 'suspended', label: isEs ? 'Suspendido (Reactivable sin nueva solicitud)' : 'Suspended (Reactivatable upon release)' },
      { id: 'terminated', label: isEs ? 'Cancelado / Requiere nueva solicitud' : 'Terminated / Needs full new application' },
      { id: 'active', label: isEs ? 'Activo (En exención 1115)' : 'Active (Under 1115 waiver coverage)' },
    ];

    medOpts.forEach((mo) => {
      const opt = h('option', { value: mo.id }, mo.label);
      if (mo.id === reentryState.hasMedicaid) opt.selected = true;
      medSelect.append(opt);
    });

    medSelect.addEventListener('change', (e) => {
      setReentryState({ hasMedicaid: e.target.value });
      reentryView(container, options);
    });
    medGroup.append(medSelect);
    formGrid.append(medGroup);

    formCard.append(formGrid);
    tabPanel.append(formCard);

    // Results Box: Risk Tier & Highlights
    const resultsCard = h('div', { class: `card results-card risk-${plan.riskTier}` });

    const riskHeader = h('div', { class: 'results-header' });
    const riskBadge = h('span', { class: `badge badge-${plan.riskTier}` },
      `${isEs ? 'NIVEL DE RIESGO' : 'OVERDOSE RISK'}: ${plan.riskTier.toUpperCase()}`
    );
    riskHeader.append(riskBadge);

    const waiverBadge = h('span', { class: `badge badge-${plan.isWaiverActive ? 'approved' : 'neutral'}` },
      plan.isWaiverActive
        ? (isEs ? `Exención 1115 Aprobada (${plan.waiver.coverageWindowDays} días)` : `1115 Waiver Approved (${plan.waiver.coverageWindowDays}-Day Reach-In)`)
        : (isEs ? 'Reglas Estándar de Medicaid' : 'Standard Medicaid Rules')
    );
    riskHeader.append(waiverBadge);
    resultsCard.append(riskHeader);

    // Risk factors list
    if (plan.riskFactors.length > 0) {
      const rfBox = h('div', { class: 'risk-factors-box' });
      rfBox.append(h('h4', {}, isEs ? 'Factores Críticos de Riesgo:' : 'Identified Critical Risk Factors:'));
      const rList = h('ul', { class: 'bullet-list' });
      plan.riskFactors.forEach((rf) => {
        rList.append(h('li', {}, isEs ? rf.es : rf.en));
      });
      rfBox.append(rList);
      resultsCard.append(rfBox);
    }

    // Action Checklist
    const clBox = h('div', { class: 'checklist-box' });
    clBox.append(h('h4', {}, isEs ? 'Plan de Acción y Lista para la Salida:' : 'Personalized Discharge Action Plan:'));

    plan.checklist.forEach((item) => {
      const itemRow = h('div', { class: `checklist-item priority-${item.priority}` });
      const topRow = h('div', { class: 'checklist-item-header' });
      topRow.append(h('span', { class: `priority-tag priority-tag-${item.priority}` }, item.priority.toUpperCase()));
      topRow.append(h('strong', {}, isEs ? item.title.es : item.title.en));
      itemRow.append(topRow);
      itemRow.append(h('p', { class: 'checklist-item-detail' }, isEs ? item.detail.es : item.detail.en));
      clBox.append(itemRow);
    });

    resultsCard.append(clBox);

    // Action Buttons: Copy Plan & Link to Treatment Directory
    const btnRow = h('div', { class: 'btn-row' });

    const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' },
      icon('copy'),
      isEs ? ' Copiar Plan al Portapapeles' : ' Copy Reentry Plan'
    );
    copyBtn.addEventListener('click', async () => {
      const text = formatReentrySummaryText(plan, lang);
      try {
        await navigator.clipboard.writeText(text);
        announce(isEs ? 'Plan copiado al portapapeles' : 'Plan copied to clipboard');
        copyBtn.textContent = isEs ? '✓ ¡Copiado!' : '✓ Copied!';
        setTimeout(() => {
          copyBtn.textContent = isEs ? ' Copiar Plan al Portapapeles' : ' Copy Reentry Plan';
        }, 3000);
      } catch {
        // Fallback
        announce(isEs ? 'No se pudo copiar automáticamente' : 'Clipboard write failed');
      }
    });
    btnRow.append(copyBtn);

    const treatLink = h('a', {
      href: '#/treatment',
      class: 'btn btn-primary',
    }, icon('map-pin'), isEs ? ' Buscar Clínicas FQHC y MOUD' : ' Find Community FQHC & MOUD');
    btnRow.append(treatLink);

    resultsCard.append(btnRow);
    tabPanel.append(resultsCard);
  }

  // --------------------------------------------------------------------------
  // TAB 2: Post-Release Overdose Lethality Timeline
  // --------------------------------------------------------------------------
  else if (currentTab === 'timeline') {
    const timelineCard = h('div', { class: 'card timeline-card' });
    timelineCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Cronograma Clínico de Mortalidad por Sobredosis' : 'Post-Release Fatal Overdose Risk Timeline'
    ));
    timelineCard.append(h('p', { class: 'card-description' },
      isEs
        ? 'La evidencia científica (NEJM, Binswanger et al.) demuestra que las personas liberadas de prisión o cárcel enfrentan un riesgo de muerte por sobredosis entre 40 y 129 veces mayor en los primeros 14 días en comparación con la población general debido a la pérdida de tolerancia a opioides.'
        : 'Scientific evidence (NEJM, Binswanger et al.) demonstrates individuals released from prison or jail face a fatal overdose risk 40x to 129x higher in the first 14 days compared to the general public due to absolute loss of opioid tolerance.'
    ));

    REENTRY_POST_RELEASE_TIMELINE.forEach((stage, idx) => {
      const stepItem = h('div', { class: 'timeline-step' });

      const stepHeader = h('div', { class: 'timeline-step-header' });
      stepHeader.append(h('span', { class: 'timeline-badge' }, `${idx + 1}`));
      stepHeader.append(h('h4', { class: 'timeline-title' }, isEs ? stage.title.es : stage.title.en));
      stepHeader.append(h('span', { class: 'timeline-multiplier' }, stage.mortalityMultiplier));
      stepItem.append(stepHeader);

      stepItem.append(h('p', { class: 'timeline-focus' }, isEs ? stage.clinicalFocus.es : stage.clinicalFocus.en));

      const stepList = h('ul', { class: 'timeline-checklist' });
      const items = isEs ? stage.priorityChecklist.es : stage.priorityChecklist.en;
      items.forEach((it) => {
        stepList.append(h('li', {}, it));
      });
      stepItem.append(stepList);

      timelineCard.append(stepItem);
    });

    tabPanel.append(timelineCard);
  }

  // --------------------------------------------------------------------------
  // TAB 3: Criminal Legal & Supervision Rights (DOJ ADA & 42 CFR Part 2)
  // --------------------------------------------------------------------------
  else if (currentTab === 'rights') {
    const rightsCard = h('div', { class: 'card rights-card' });
    rightsCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Derechos Federales bajo Supervisión (DOJ ADA y 42 CFR Parte 2)' : 'Federal Legal Protections: DOJ ADA Title II & 42 CFR Part 2'
    ));

    REENTRY_SUPERVISION_PROTECTIONS.forEach((prot) => {
      const protSection = h('div', { class: 'protection-section' });
      protSection.append(h('h4', { class: 'protection-title' }, isEs ? prot.title.es : prot.title.en));
      protSection.append(h('span', { class: 'legal-citation' }, prot.authority));
      protSection.append(h('p', { class: 'protection-summary' }, isEs ? prot.summary.es : prot.summary.en));

      const rulesList = h('ul', { class: 'actionable-rules-list' });
      const rules = isEs ? prot.actionableRules.es : prot.actionableRules.en;
      rules.forEach((rule) => {
        rulesList.append(h('li', {}, rule));
      });
      protSection.append(rulesList);

      rightsCard.append(protSection);
    });

    // Sample Provider Letter Template
    const templateBox = h('div', { class: 'template-box' });
    templateBox.append(h('h4', {}, isEs ? 'Modelo de Carta para Oficial de Libertad Condicional:' : 'Sample Provider Verification Letter for Supervision:'));
    const templateText = h('pre', { class: 'code-snippet' },
      isEs
        ? `A la atención del Oficial de Libertad Condicional:
Certifico que [Nombre del Paciente] se encuentra bajo atención clínica continua en nuestro centro recibiendo tratamiento para el trastorno por uso de sustancias con medicamentos recetados por un proveedor con licencia (MOUD).
De conformidad con las normas de derechos civiles del Departamento de Justicia bajo el Título II de la ADA (42 U.S.C. § 12132), este tratamiento médico prescrito no constituye una infracción de las condiciones de supervisión y no puede ser motivo de revocación o suspensión de beneficios.
Bajo 42 C.F.R. Parte 2, esta confirmación certifica la inscripción activa y el cumplimiento regular del paciente.`
        : `To the Supervision Officer:
I certify that [Patient Name] is actively enrolled in clinical care at our facility receiving prescribed medication for opioid use disorder (MOUD) under the care of a licensed healthcare clinician.
Pursuant to the U.S. Department of Justice Civil Rights Division guidance under Title II of the Americans with Disabilities Act (42 U.S.C. § 12132), individuals under community supervision cannot be prohibited from taking prescribed MOUD, nor may supervision be revoked solely due to adherence to prescribed medication.
In compliance with 42 C.F.R. Part 2, this document confirms active attendance and treatment compliance.`
    );
    templateBox.append(templateText);
    rightsCard.append(templateBox);

    tabPanel.append(rightsCard);
  }

  // --------------------------------------------------------------------------
  // TAB 4: Section 1115 Demonstration Waivers Directory
  // --------------------------------------------------------------------------
  else if (currentTab === 'waivers') {
    const waiverCard = h('div', { class: 'card waiver-card' });
    waiverCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Directorio Estatal de Exenciones de Reingreso 1115 de Medicaid' : 'State Section 1115 Medicaid Reentry Demonstration Waivers'
    ));
    waiverCard.append(h('p', { class: 'card-description' },
      isEs
        ? 'Históricamente, la "Exclusión de Reclusos" de Medicaid impedía el financiamiento federal para la salud de personas encarceladas. Las exenciones de demostración de la Sección 1115 aprobadas por los CMS permiten a los estados participantes cubrir servicios médicos y MOUD hasta 90 días antes de la liberación.'
        : 'Historically, the federal Medicaid "Inmate Exclusion" barred Medicaid funding for incarcerated individuals. Section 1115 demonstration waivers approved by CMS authorize participating states to cover pre-release health services, MOUD continuity, and 30-day medication supplies up to 90 days before release.'
    ));

    const waiverGrid = h('div', { class: 'waiver-grid' });

    REENTRY_MEDICAID_WAIVERS.forEach((w) => {
      const wCard = h('div', { class: 'waiver-item-card' });

      const wHeader = h('div', { class: 'waiver-item-header' });
      wHeader.append(h('strong', {}, isEs ? w.name.es : w.name.en));
      wHeader.append(h('span', { class: 'badge badge-approved' }, `${w.coverageWindowDays} ${isEs ? 'Días Previos' : 'Days Pre-Release'}`));
      wCard.append(wHeader);

      const sList = h('ul', { class: 'waiver-services-list' });
      const services = isEs ? w.keyServices.es : w.keyServices.en;
      services.forEach((s) => {
        sList.append(h('li', {}, s));
      });
      wCard.append(sList);

      const suspBox = h('p', { class: 'waiver-suspension-text' },
        h('strong', {}, isEs ? 'Política de Suspensión: ' : 'Suspension Policy: '),
        isEs ? w.suspensionPolicy.es : w.suspensionPolicy.en
      );
      wCard.append(suspBox);

      waiverGrid.append(wCard);
    });

    waiverCard.append(waiverGrid);
    tabPanel.append(waiverCard);
  }

  root.append(tabPanel);

  // Emergency Hotlines Footer
  const hotlineBar = h('div', { class: 'emergency-hotline-bar' },
    h('div', { class: 'hotline-item' },
      h('strong', {}, isEs ? 'Never Use Alone (Si consume a solas):' : 'Never Use Alone Hotline:'),
      h('span', {}, ' '),
      tel(NEVER_USE_ALONE.number, NEVER_USE_ALONE.label, { class: 'hotline-link' })
    ),
    h('div', { class: 'hotline-item' },
      h('strong', {}, isEs ? 'Línea de Crisis y Suicidio:' : 'Suicide & Crisis Lifeline:'),
      h('span', {}, ' '),
      tel('988', null, { class: 'hotline-link' })
    ),
    h('div', { class: 'hotline-item' },
      h('strong', {}, isEs ? 'Emergencia por Sobredosis:' : 'Overdose Emergency:'),
      h('span', {}, ' '),
      tel('911', null, { class: 'hotline-link text-danger' })
    )
  );
  root.append(hotlineBar);

  if (container) container.append(root);
  return root;
}
