/**
 * Veterans & Military Health Care Specialist View (public/js/views/veterans.js)
 *
 * Comprehensive, trauma-informed clinical and statutory guidance for Veterans,
 * Active Duty Service Members, National Guard, Reserve, and Military Families:
 *
 * 1. VA MISSION Act of 2018 (38 U.S.C. § 1703) & Community Care Network (CCN):
 *    - Six statutory criteria for community care referrals (38 C.F.R. § 17.4010).
 *    - Access Standards:
 *      * 20 days / 30-minute average drive time for primary care, mental health, and SUD outpatient care.
 *      * 28 days / 60-minute average drive time for specialty care and residential SUD treatment.
 *    - Service unavailable at local VA facility.
 *    - Residing in a state/territory without a full-service VA medical facility.
 *    - Best medical interest / clinical hardship standard (38 U.S.C. § 1703(e)).
 *    - Urgent Care Benefit under 38 U.S.C. § 1725A (CCN walk-in clinics without prior authorization;
 *      14-day prescription drug benefit).
 *
 * 2. TRICARE Substance Use & Behavioral Health Authorization (32 C.F.R. § 199.4):
 *    - TRICARE Prime vs. TRICARE Select authorization frameworks.
 *    - Mandatory prior authorization requirements for:
 *      * Inpatient medically managed withdrawal (detox)
 *      * Substance Use Disorder Residential Treatment Facilities (SUD RTC)
 *      * Partial Hospitalization Programs (PHP)
 *      * Intensive Outpatient Programs (IOP)
 *    - Outpatient individual/group psychotherapy and Office-Based Opioid Treatment (OBOT)
 *      with network providers do not require pre-authorization under Select (or Prime for non-ADSM).
 *
 * 3. Military Sexual Trauma (MST) Rights (38 U.S.C. § 1720D & § 1720I):
 *    - 100% free medical and mental health care for conditions related to MST ($0 copay).
 *    - NO service-connected disability rating or formal VA compensation claim required.
 *    - NO incident reporting, military documentation, police report, or buddy statements required.
 *    - Other Than Honorable (OTH) administrative discharges are legally eligible under 38 U.S.C. § 1720I.
 *    - Independent, confidential Vet Centers (38 U.S.C. § 1712A) with records separate from VHA.
 *    - Dedicated MST Coordinators at every VA healthcare system.
 *    - Right to request clinician of preferred gender.
 *
 * 4. Veterans Crisis Line & Emergency Care:
 *    - Dial 988, then press 1; Text 838255; Chat at VeteransCrisisLine.net.
 *    - Veterans COMPACT Act of 2020 (38 U.S.C. § 1720J): Acute suicidal crisis emergency care is 100%
 *      free at ANY emergency department (VA or community), with VA notification within 72 hours.
 *
 * 5. Interactive In-RAM Decision Aid:
 *    - Ephemeral eligibility evaluation for VA Community Care, TRICARE, MST, and Urgent Care.
 *    - Printable, customized provider discussion checklist.
 *    - Direct link to `#/treatment` with pre-filtered federal VA provider codes (`codes=VET`).
 *
 * Strict Invariants:
 * - Zero npm dependencies (Node 20+ built-ins only, plain ES modules).
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
onQuickExit(resetVeteransState);

// ============================================================================
// 1. VA MISSION Act of 2018 (38 U.S.C. § 1703) Taxonomy & Standards
// ============================================================================

const MISSION_ACT_CRITERIA_DATA = [
  {
    id: 'service_unavailable',
    title: {
      en: 'Service Unavailable at Local VA Medical Facility',
      es: 'Servicio no disponible en el centro local de VA',
    },
    statute: '38 U.S.C. § 1703(d)(1)(A); 38 C.F.R. § 17.4010(a)(1)',
    category: 'availability',
    summary: {
      en: 'If your local VA medical center or community-based outpatient clinic (CBOC) does not provide the specific clinical service you need—such as medically supervised inpatient detox, dedicated residential dual-diagnosis PTSD/SUD care, or specialized women veterans trauma services—VA must refer you to an authorized Community Care Network (CCN) provider.',
      es: 'Si su centro médico de VA o clínica ambulatoria comunitaria (CBOC) no ofrece el servicio clínico específico que necesita (como desintoxicación hospitalaria médica, atención residencial dual TEPT/consumo o atención de trauma para mujeres veteranas), el VA debe remitirlo a un proveedor de la Red de Atención Comunitaria (CCN).',
    },
    actionAdvice: {
      en: 'Ask your VA primary care or mental health team to verify that the service line is not offered locally and submit a Community Care consult.',
      es: 'Pida a su equipo de atención primaria o salud mental de VA que verifique que el servicio no se ofrece localmente y envíe una solicitud de Atención Comunitaria.',
    },
  },
  {
    id: 'no_full_service_state',
    title: {
      en: 'Residing in a State or Territory Without a Full-Service VA Hospital',
      es: 'Residencia en estado o territorio sin hospital de VA completo',
    },
    statute: '38 U.S.C. § 1703(d)(1)(B); 38 C.F.R. § 17.4010(a)(2)',
    category: 'geography',
    summary: {
      en: 'Veterans who reside in Alaska, Hawaii, New Hampshire, or U.S. territories without a full-service VA medical facility (Guam, American Samoa, Northern Mariana Islands, and the U.S. Virgin Islands) qualify for community care for services not provided locally.',
      es: 'Los veteranos que residen en Alaska, Hawái, Nuevo Hampshire o territorios estadounidenses sin un hospital de VA con todos los servicios (Guam, Samoa Americana, Islas Marianas del Norte e Islas Vírgenes) califican para atención comunitaria en servicios no provistos localmente.',
    },
    actionAdvice: {
      en: 'Confirm your residential address with your regional VA health system enrollment office to establish immediate community care eligibility.',
      es: 'Confirme su dirección residencial con la oficina de inscripción de VA para certificar su elegibilidad inmediata de atención comunitaria.',
    },
  },
  {
    id: 'grandfathered_choice',
    title: {
      en: 'Grandfathered 40-Mile Distance Rule (Veterans Choice Program)',
      es: 'Regla de distancia de 40 millas del programa anterior Choice',
    },
    statute: '38 U.S.C. § 1703(d)(1)(C); 38 C.F.R. § 17.4010(a)(3)',
    category: 'geography',
    summary: {
      en: 'Veterans who qualified under the 40-mile distance standard under the former Veterans Choice Program as of June 6, 2018, and continue to reside in an eligible location, remain grandfathered into community care eligibility.',
      es: 'Los veteranos que calificaban bajo la regla de 40 millas de distancia del antiguo programa Veterans Choice al 6 de junio de 2018 y continúan residiendo en una zona elegible mantienen su elegibilidad adquirida.',
    },
    actionAdvice: {
      en: 'Inform your VA clinical coordinator that you maintain continuous grandfathered Choice Act eligibility status.',
      es: 'Informe a su coordinador clínico del VA que mantiene el estatus de elegibilidad adquirida bajo la Ley Choice.',
    },
  },
  {
    id: 'access_standards',
    title: {
      en: 'Designated Access Standards (Drive Time & Appointment Wait Times)',
      es: 'Estándares de acceso designados (tiempo de viaje y tiempos de espera)',
    },
    statute: '38 U.S.C. § 1703(d)(1)(D); 38 C.F.R. § 17.4010(a)(4); 38 C.F.R. § 17.4040',
    category: 'access_standards',
    summary: {
      en: 'If VA cannot offer an appointment within designated drive time or wait time standards, the veteran is entitled to seek care through the Community Care Network (CCN). For Primary Care, Mental Health, and non-residential Substance Use Disorder (SUD) care: the standard is 20 days wait time or 30 minutes average drive time. For Specialty Care and Residential SUD Treatment: the standard is 28 days wait time or 60 minutes average drive time.',
      es: 'Si el VA no puede ofrecer una cita dentro de los estándares de tiempo de manejo o de espera, el veterano tiene derecho a recibir atención comunitaria (CCN). Para Atención Primaria, Salud Mental y tratamiento ambulatorio de Adicciones: el estándar es 20 días de espera o 30 minutos de manejo promedio. Para Atención Especializada y Tratamiento Residencial de Adicciones: el estándar es 28 días de espera o 60 minutos de manejo promedio.',
    },
    actionAdvice: {
      en: 'If VA offers an appointment date beyond 20 days (or 28 days for residential), or if your drive time exceeds 30 minutes (60 min for specialty), immediately request a Community Care referral.',
      es: 'Si el VA le ofrece una cita posterior a 20 días (o 28 días para residencial), o su viaje supera los 30 minutos (60 min en especializada), solicite de inmediato la referencia a la comunidad.',
    },
  },
  {
    id: 'best_medical_interest',
    title: {
      en: 'Best Medical Interest & Clinical Hardship Standard',
      es: 'Criterio del mejor interés médico y dificultad clínica',
    },
    statute: '38 U.S.C. § 1703(e); 38 C.F.R. § 17.4010(a)(5)',
    category: 'clinical_discretion',
    summary: {
      en: 'When the veteran and referring VA clinician agree that seeking care in the community is in the veteran’s best medical interest. Factors include continuity of care with an existing doctor, severe anxiety or psychological distress associated with traveling to a VA facility, clinical vulnerability, mobility limitations, caregiving duties, or employment constraints.',
      es: 'Cuando el veterano y el médico del VA acuerdan que recibir atención en la comunidad beneficia el mejor interés médico del veterano. Los factores incluyen continuidad con un médico previo, ansiedad severa al acudir al VA, vulnerabilidad clínica, dificultades de movilidad, responsabilidades de cuidado o empleo.',
    },
    actionAdvice: {
      en: 'Discuss your specific clinical, psychological, and personal travel barriers openly with your VA doctor; their clinical concurrence is the key to this referral path.',
      es: 'Dialogue abiertamente con su médico del VA sobre sus barreras clínicas, psicológicas o de transporte; su respaldo clínico es la clave para esta autorización.',
    },
  },
  {
    id: 'quality_standards',
    title: {
      en: 'Local VA Service Line Fails Quality Standards',
      es: 'Falla en estándares de calidad del servicio local de VA',
    },
    statute: '38 U.S.C. § 1703(e)(2); 38 C.F.R. § 17.4010(a)(6)',
    category: 'quality',
    summary: {
      en: 'If VA determines that a specific clinical service line at the veteran’s local medical facility fails to meet established clinical quality metrics, enrolled veterans needing that service qualify for community care.',
      es: 'Si el VA determina que una línea de servicio clínico específica en el centro local no cumple con los estándares de calidad establecidos, los veteranos inscritos califican para atención comunitaria.',
    },
    actionAdvice: {
      en: 'Check with your facility Patient Advocate if a specific clinical department is undergoing quality remediation.',
      es: 'Consulte con el Defensor del Paciente de su centro si algún departamento clínico se encuentra bajo revisión de calidad.',
    },
  },
];

export const VA_MISSION_ACT_RULES = [...MISSION_ACT_CRITERIA_DATA];
for (const criterion of MISSION_ACT_CRITERIA_DATA) {
  VA_MISSION_ACT_RULES[criterion.id] = criterion;
}

VA_MISSION_ACT_RULES.ACCESS_STANDARDS = {
  primaryAndMentalHealth: {
    id: 'primary_mental_health',
    maxWaitDays: 20,
    maxDriveMinutes: 30,
    category: 'Primary Care, Mental Health & Outpatient Substance Use',
    citation: '38 C.F.R. § 17.4040(a)(1)',
    description: {
      en: 'Average appointment wait time ≤ 20 days from request/clinical date; average drive time ≤ 30 minutes.',
      es: 'Tiempo de espera promedio ≤ 20 días desde la fecha clínica o solicitud; tiempo promedio de manejo ≤ 30 minutos.',
    },
  },
  specialtyCare: {
    id: 'specialty_residential',
    maxWaitDays: 28,
    maxDriveMinutes: 60,
    category: 'Specialty Care, Inpatient Detox & Residential SUD Treatment',
    citation: '38 C.F.R. § 17.4040(a)(2)',
    description: {
      en: 'Average appointment wait time ≤ 28 days from request/clinical date; average drive time ≤ 60 minutes.',
      es: 'Tiempo de espera promedio ≤ 28 días desde la fecha clínica o solicitud; tiempo promedio de manejo ≤ 60 minutos.',
    },
  },
};

VA_MISSION_ACT_RULES.URGENT_CARE = {
  statute: '38 U.S.C. § 1725A; 38 C.F.R. § 17.4600',
  title: {
    en: 'VA Community Urgent Care Benefit (No Prior Authorization Required)',
    es: 'Beneficio de Urgencias Comunitarias de VA (Sin autorización previa requerida)',
  },
  summary: {
    en: 'Eligible enrolled veterans who have received VA healthcare within the past 24 months can walk into any in-network Community Care Network (CCN) urgent care clinic or retail walk-in clinic without prior authorization from the VA.',
    es: 'Los veteranos inscritos elegibles que hayan recibido atención en el VA en los últimos 24 meses pueden acudir a cualquier clínica de urgencias comunitaria o clínica ambulatoria de la red CCN sin autorización previa del VA.',
  },
  prescriptionSupplyDays: 14,
  prescriptionRules: {
    en: 'Covers up to a 14-day supply of urgently needed medications from an in-network CCN retail pharmacy or VA pharmacy with $0 or standard VA copay.',
    es: 'Cubre hasta 14 días de medicamentos de urgencia en farmacias de la red CCN o del VA con copago de $0 o tarifa estándar del VA.',
  },
  emergencyHotline: '1-844-724-7842',
  emergencyNotificationWindowHours: 72,
  emergencyRules: {
    en: 'For life-threatening emergencies or acute suicidal crisis (COMPACT Act, 38 U.S.C. § 1720J), go to ANY emergency department immediately. Notify VA within 72 hours via the 72-Hour Emergency Notification portal or 1-844-724-7842 (844-72HRVHA).',
    es: 'En emergencias que amenacen la vida o crisis aguda de suicidio (Ley COMPACT, 38 U.S.C. § 1720J), acuda a CUALQUIER sala de urgencias de inmediato. Notifique al VA dentro de las 72 horas mediante el portal de 72 horas o al 1-844-724-7842.',
  },
};

// ============================================================================
// 2. TRICARE Substance Use & Behavioral Health Care Levels
// ============================================================================

const TRICARE_CARE_LEVELS_DATA = [
  {
    id: 'outpatient_therapy',
    name: {
      en: 'Outpatient Individual, Family & Group Psychotherapy',
      es: 'Psicoterapia Ambulatoria Individual, Familiar y Grupal',
    },
    setting: 'outpatient',
    primeRequiresPreAuth: false,
    selectRequiresPreAuth: false,
    primeReferralRequired: false,
    selectReferralRequired: false,
    summary: {
      en: 'Standard outpatient behavioral health and substance use counseling visits with TRICARE network providers do not require a referral or prior authorization for non-active-duty beneficiaries under Prime or Select.',
      es: 'Las visitas ambulatorias estándar de salud mental y adicciones con proveedores de la red de TRICARE no requieren referencia ni autorización previa para beneficiarios no activos en Prime o Select.',
    },
    clinicalNotes: {
      en: 'Active Duty Service Members (ADSMs) always require a referral and military treatment facility (MTF) commander pre-authorization for non-military civilian care.',
      es: 'Los miembros en servicio activo siempre requieren referencia y autorización previa del comandante de su unidad médica militar (MTF) para atención civil.',
    },
  },
  {
    id: 'obot',
    name: {
      en: 'Office-Based Opioid Treatment (OBOT - Buprenorphine / Naltrexone)',
      es: 'Tratamiento de Opioides en Consultorio (OBOT - Buprenorfina / Naltrexona)',
    },
    setting: 'outpatient',
    primeRequiresPreAuth: false,
    selectRequiresPreAuth: false,
    primeReferralRequired: false,
    selectReferralRequired: false,
    summary: {
      en: 'Prescription buprenorphine (Suboxone, Subutex) and extended-release naltrexone (Vivitrol) provided by DEA/SAMHSA-registered clinical prescribers in outpatient offices do not require prior authorization for office visits.',
      es: 'La prescripción de buprenorfina (Suboxone) y naltrexona de liberación prolongada (Vivitrol) por médicos autorizados en consultorios no requiere autorización previa para la consulta médica.',
    },
    clinicalNotes: {
      en: 'Standard prescription drug copayments apply at TRICARE network pharmacies or express scripts home delivery.',
      es: 'Aplican copagos estándar de farmacia en la red de TRICARE o entrega a domicilio.',
    },
  },
  {
    id: 'otp',
    name: {
      en: 'Opioid Treatment Programs (OTP / Daily Methadone Dispensing)',
      es: 'Programas de Tratamiento de Opioides (OTP / Metadona Diaria)',
    },
    setting: 'outpatient',
    primeRequiresPreAuth: true,
    selectRequiresPreAuth: false,
    primeReferralRequired: true,
    selectReferralRequired: false,
    summary: {
      en: 'Daily methadone dispensing, medical surveillance, and counseling at certified OTP facilities. Under TRICARE Prime, prior authorization and referral are required. Under TRICARE Select, beneficiaries can self-refer to TRICARE-certified OTP clinics.',
      es: 'Dispensación diaria de metadona, vigilancia médica y consejería en centros OTP certificados. En TRICARE Prime se requiere autorización previa y referencia. En TRICARE Select, los beneficiarios pueden acudir directamente a clínicas OTP autorizadas.',
    },
    clinicalNotes: {
      en: 'The OTP clinic must be certified by SAMHSA and accredited by a national accrediting organization recognized by TRICARE.',
      es: 'La clínica OTP debe estar certificada por SAMHSA y acreditada por una entidad reconocida por TRICARE.',
    },
  },
  {
    id: 'iop',
    name: {
      en: 'Intensive Outpatient Programs (IOP - 9 to 19 hours/week)',
      es: 'Programas Ambulatorios Intensivos (IOP - 9 a 19 horas/semana)',
    },
    setting: 'intensive_outpatient',
    primeRequiresPreAuth: true,
    selectRequiresPreAuth: true,
    primeReferralRequired: true,
    selectReferralRequired: false,
    summary: {
      en: 'Structured multi-day outpatient treatment program. Prior authorization from the regional TRICARE contractor is MANDATORY for all beneficiaries before starting care.',
      es: 'Programa ambulatorio estructurado de varios días a la semana. La autorización previa del contratista regional de TRICARE es OBLIGATORIA para todos los beneficiarios antes de iniciar.',
    },
    clinicalNotes: {
      en: 'Humana Military (East Region: 1-800-444-5445) or TriWest Healthcare Alliance (West Region since Jan. 1, 2025: 1-888-874-9378) manages authorization.',
      es: 'Humana Military (Región Este: 1-800-444-5445) o TriWest Healthcare Alliance (Región Oeste desde el 1 de enero de 2025: 1-888-874-9378) gestionan la autorización.',
    },
  },
  {
    id: 'php',
    name: {
      en: 'Partial Hospitalization Programs (PHP - 20+ hours/week day treatment)',
      es: 'Programas de Hospitalización Parcial (PHP - Tratamiento de día 20+ horas/sem)',
    },
    setting: 'partial_hospitalization',
    primeRequiresPreAuth: true,
    selectRequiresPreAuth: true,
    primeReferralRequired: true,
    selectReferralRequired: false,
    summary: {
      en: 'Comprehensive psychiatric and substance use treatment providing daily clinical stabilization without overnight lodging. Prior authorization is STRICTLY REQUIRED across all TRICARE plans.',
      es: 'Tratamiento psiquiátrico y de adicciones diario intensivo sin alojamiento nocturno. La autorización previa es ESTRICTAMENTE REQUERIDA en todos los planes de TRICARE.',
    },
    clinicalNotes: {
      en: 'Facility must meet TRICARE institutional provider certification criteria under 32 C.F.R. § 199.6.',
      es: 'El centro debe cumplir los requisitos de certificación de proveedores institucionales bajo 32 C.F.R. § 199.6.',
    },
  },
  {
    id: 'residential_sud',
    name: {
      en: 'Substance Use Disorder Residential Treatment Facilities (SUD RTC)',
      es: 'Centros de Tratamiento Residencial para el Trastorno por Consumo (SUD RTC)',
    },
    setting: 'residential',
    primeRequiresPreAuth: true,
    selectRequiresPreAuth: true,
    primeReferralRequired: true,
    selectReferralRequired: false,
    summary: {
      en: '24/7 residential rehabilitation care in an accredited non-hospital facility. Prior authorization is MANDATORY prior to admission for all TRICARE beneficiaries.',
      es: 'Atención de rehabilitación residencial las 24 horas en centros acreditados no hospitalarios. La autorización previa es OBLIGATORIA antes del ingreso para todos los beneficiarios.',
    },
    clinicalNotes: {
      en: 'Unplanned admissions will result in claim denial unless emergency medical necessity criteria are documented and approved by the regional contractor within 24 hours.',
      es: 'Ingresos no autorizados conllevan rechazo de reclamos a menos que se documente necesidad médica de emergencia y se apruebe dentro de las 24 horas.',
    },
  },
  {
    id: 'inpatient_detox',
    name: {
      en: 'Inpatient Medically Managed Detoxification / Withdrawal Management',
      es: 'Desintoxicación Médica Hospitalaria / Manejo de Abstinencia',
    },
    setting: 'inpatient',
    primeRequiresPreAuth: true,
    selectRequiresPreAuth: true,
    primeReferralRequired: true,
    selectReferralRequired: false,
    summary: {
      en: '24-hour acute medical management of severe withdrawal symptoms (alcohol delirium tremens, benzodiazepine seizures, severe opioid withdrawal). Scheduled admissions require prior authorization; emergency admissions require notification to TRICARE within 24–72 hours.',
      es: 'Manejo médico agudo las 24 horas de síntomas graves de abstinencia (delirium tremens, convulsiones por benzodiacepinas, abstinencia severa). Ingresos programados requieren preautorización; en urgencias se debe notificar en 24 a 72 horas.',
    },
    clinicalNotes: {
      en: 'Emergency medical stabilization should never be delayed for authorization. Go directly to the nearest emergency department.',
      es: 'La estabilización médica de emergencia nunca debe retrasarse por trámites. Acuda de inmediato a la sala de urgencias más cercana.',
    },
  },
];

export const TRICARE_CARE_LEVELS = [...TRICARE_CARE_LEVELS_DATA];
for (const level of TRICARE_CARE_LEVELS_DATA) {
  TRICARE_CARE_LEVELS[level.id] = level;
}

TRICARE_CARE_LEVELS.PLANS = {
  prime: {
    id: 'prime',
    name: 'TRICARE Prime',
    type: 'Managed Care / HMO Model',
    pcmRequired: true,
    description: {
      en: 'Managed care option with an assigned Primary Care Manager (PCM). Active duty members must use military facilities first and need referrals for all civilian care. Civilian Prime beneficiaries can self-refer to network outpatient behavioral health providers without PCM referral.',
      es: 'Opción de atención administrada con médico de atención primaria (PCM). Militares activos deben usar instalaciones militares primero. Beneficiarios civiles pueden consultar especialistas ambulatorios de salud mental en la red sin referencia de su PCM.',
    },
  },
  select: {
    id: 'select',
    name: 'TRICARE Select',
    type: 'Fee-For-Service / PPO Model',
    pcmRequired: false,
    description: {
      en: 'Self-managed PPO option. Beneficiaries can see any TRICARE-authorized network or non-network provider without a referral. Outpatient therapy and OBOT visits do not require prior authorization with network providers; inpatient, residential, PHP, and IOP always require pre-authorization.',
      es: 'Opción PPO autogestionada. Los beneficiarios pueden ver a cualquier proveedor autorizado sin referencia. Las consultas ambulatorias de terapia y OBOT no requieren preautorización en red; la atención hospitalaria, residencial, PHP e IOP siempre la exigen.',
    },
  },
};

TRICARE_CARE_LEVELS.REGIONS = {
  east: {
    contractor: 'Humana Military',
    phone: '1-800-444-5445',
    url: 'https://www.humanamilitary.com/',
  },
  west: {
    // TriWest Healthcare Alliance replaced Health Net Federal Services as the
    // West Region contractor on Jan. 1, 2025 (tricare.mil/ContactUs/CallUs).
    contractor: 'TriWest Healthcare Alliance',
    phone: '1-888-874-9378',
    url: 'https://tricare.mil/west',
  },
};

// ============================================================================
// 3. Military Sexual Trauma (MST) Rights (38 U.S.C. § 1720D & § 1720I)
// ============================================================================

const MST_PROTECTIONS_DATA = [
  {
    id: 'free_of_cost',
    title: {
      en: '100% Free Care & No Copayments ($0 Cost)',
      es: 'Atención 100% Gratuita y Sin Copagos ($0 Costo)',
    },
    statute: '38 U.S.C. § 1720D(a)(1)',
    category: 'financial_protection',
    summary: {
      en: 'All medical, psychological, psychiatric, and substance use disorder treatment related to experiences of military sexual trauma is provided completely free of charge. You will never be billed, charged a copayment, or asked to pay a deductible for MST-related care.',
      es: 'Toda la atención médica, psicológica, psiquiátrica y para el uso de sustancias relacionada con experiencias de trauma sexual militar se brinda de manera totalmente gratuita. Nunca se le facturará ni se le cobrarán copagos ni deducibles.',
    },
  },
  {
    id: 'no_service_connection',
    title: {
      en: 'No Service-Connected Disability Rating Required',
      es: 'Sin Requisito de Calificación de Discapacidad Conectada al Servicio',
    },
    statute: '38 U.S.C. § 1720D(a)(2)',
    category: 'legal_access',
    summary: {
      en: 'You do NOT need a VA service-connected disability rating, do not need to file a formal VA disability claim, and do not need to receive disability compensation to be eligible for comprehensive MST healthcare.',
      es: 'NO necesita una calificación de discapacidad del VA conectada al servicio, no requiere presentar un reclamo de compensación ni recibir pagos de pensión para tener derecho a toda la atención médica por MST.',
    },
  },
  {
    id: 'no_report_required',
    title: {
      en: 'No Incident Report, Documentation, or Buddy Letters Required',
      es: 'Sin Requisito de Denuncia, Reporte Militar o Cartas de Testigos',
    },
    statute: '38 U.S.C. § 1720D(b)',
    category: 'confidentiality',
    summary: {
      en: 'You never have to have reported the sexual assault or sexual harassment while serving in the military. No police reports, military criminal investigations (CID/NCIS/OSI), JAG records, command reports, medical records, or buddy statements are ever required. The veteran’s verbal self-report to a VA healthcare clinician or MST Coordinator is legally sufficient.',
      es: 'Usted nunca tuvo que haber denunciado la agresión o el acoso sexual mientras prestaba servicio militar. No se exigen informes policiales, investigaciones militares, registros médicos ni declaraciones de testigos. Su declaración verbal ante un profesional médico del VA o coordinador de MST es legalmente suficiente.',
    },
  },
  {
    id: 'oth_discharge_eligible',
    title: {
      en: 'Other Than Honorable (OTH) Discharges Fully Eligible (38 U.S.C. § 1720I)',
      es: 'Elegibilidad Total para Licencias Menos que Honorables (OTH) (38 U.S.C. § 1720I)',
    },
    statute: '38 U.S.C. § 1720I',
    category: 'discharge_inclusivity',
    summary: {
      en: 'Under 38 U.S.C. § 1720I, former service members with Other Than Honorable (OTH) administrative discharges are legally eligible for mental and behavioral health treatment, counseling, and medical evaluations for conditions related to military sexual trauma. An OTH discharge is NOT a legal bar to MST care.',
      es: 'Bajo el artículo 38 U.S.C. § 1720I, los exmilitares con licenciamiento administrativo Menos que Honorable (OTH) son legalmente elegibles para tratamiento de salud mental y médica por trauma sexual militar. Una baja OTH NO es un impedimento legal para recibir esta atención.',
    },
  },
  {
    id: 'gender_choice',
    title: {
      en: 'Right to Choose Clinician Gender',
      es: 'Derecho a Elegir el Género del Profesional Clínico',
    },
    statute: 'VHA Directive 1115 (Military Sexual Trauma Program)',
    category: 'trauma_informed_care',
    summary: {
      en: 'Veterans have the explicit right to request and receive care from a female or male healthcare provider or therapist for all MST-related counseling, psychotherapy, and clinical examinations.',
      es: 'Los veteranos tienen el derecho explícito de solicitar y recibir atención de un terapeuta o médico de su género de preferencia (femenino o masculino) para todas las consultas y exámenes por MST.',
    },
  },
  {
    id: 'vet_centers',
    title: {
      en: 'Confidential Community-Based Vet Centers (38 U.S.C. § 1712A)',
      es: 'Centros Vet Comunitarios Confidenciales (38 U.S.C. § 1712A)',
    },
    statute: '38 U.S.C. § 1712A',
    category: 'community_privacy',
    summary: {
      en: 'Vet Centers (Readjustment Counseling Service) are small, community-based clinics located outside VA hospitals. They provide completely confidential individual and group counseling for MST. Vet Center records are held under strict independent confidentiality and are NOT merged into the main VA hospital electronic medical record system.',
      es: 'Los Centros Vet son clínicas comunitarias ubicadas fuera de los hospitales del VA. Brindan consejería individual y grupal completamente confidencial para MST. Sus registros se mantienen bajo estricta confidencialidad independiente y NO se integran al expediente hospitalario general del VA.',
    },
  },
  {
    id: 'mst_coordinators',
    title: {
      en: 'Designated MST Coordinators at Every VA Health System',
      es: 'Coordinadores de MST Designados en Cada Centro de VA',
    },
    statute: 'VHA Directive 1115',
    category: 'advocacy',
    summary: {
      en: 'Every VA medical center has a dedicated, specially trained Military Sexual Trauma (MST) Coordinator. They act as confidential patient advocates who assist veterans with accessing healthcare, finding clinicians, and navigating the system.',
      es: 'Cada centro médico del VA tiene un coordinador de Trauma Sexual Militar especialmente capacitado. Actúan como defensores confidenciales que asisten a los veteranos a ingresar a la atención y elegir profesionales de salud.',
    },
  },
];

export const MST_PROTECTIONS = [...MST_PROTECTIONS_DATA];
for (const item of MST_PROTECTIONS_DATA) {
  MST_PROTECTIONS[item.id] = item;
}

MST_PROTECTIONS.STATUTES = '38 U.S.C. § 1720D & 38 U.S.C. § 1720I';
MST_PROTECTIONS.CRISIS_LINE = {
  dial: '988',
  prompt: 'Press 1',
  text: '838255',
  chatUrl: 'https://www.veteranscrisisline.net/',
};

// ============================================================================
// 4. Ephemeral In-RAM State Management (Zero PII, Zero Storage)
// ============================================================================

const initialEphemeralVeteransState = () => ({
  activeTab: 'screener', // 'screener' | 'mission_act' | 'tricare' | 'mst' | 'checklist'
  lang: getLang() === 'es' ? 'es' : 'en',
  enrolledInVa: 'yes', // 'yes' | 'no' | 'unsure'
  militaryStatus: 'veteran', // 'veteran' | 'active_duty' | 'guard_reserve' | 'dependent' | 'other'
  dischargeStatus: 'honorable', // 'honorable' | 'general' | 'oth' | 'bad_conduct' | 'dishonorable' | 'not_applicable'
  careType: 'mental_health', // 'primary' | 'mental_health' | 'sud_outpatient' | 'sud_residential' | 'detox' | 'urgent' | 'mst'
  vaWaitDays: '',
  vaDriveMinutes: '',
  serviceUnavailableAtVa: false,
  stateWithoutFullServiceVa: false,
  bestMedicalInterest: false,
  grandfatheredChoice: false,
  insurance: 'va', // 'va' | 'tricare_prime' | 'tricare_select' | 'champva' | 'medicaid' | 'medicare' | 'private' | 'uninsured'
  experiencedMst: 'no', // 'yes' | 'no' | 'unsure'
  receivedVaCarePast24Months: true,
  checklistChecked: {},
});

let veteransState = initialEphemeralVeteransState();

export function getVeteransState() {
  return {
    ...veteransState,
    checklistChecked: { ...veteransState.checklistChecked },
  };
}

export function setVeteransState(patch) {
  if (!patch || typeof patch !== 'object') return getVeteransState();
  for (const [key, value] of Object.entries(patch)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    if (key === 'checklistChecked' && value && typeof value === 'object') {
      veteransState.checklistChecked = { ...veteransState.checklistChecked, ...value };
    } else {
      veteransState[key] = value;
    }
  }
  return getVeteransState();
}

export function resetVeteransState() {
  veteransState = initialEphemeralVeteransState();
  return getVeteransState();
}

// ============================================================================
// 5. Clinical & Statutory Eligibility Evaluation Logic
// ============================================================================

/**
 * Pure evaluation function assessing eligibility across VA MISSION Act,
 * TRICARE authorization rules, MST rights, and urgent care benefits.
 *
 * Safe against null, undefined, or missing inputs.
 */
export function evaluateVeteransEligibility(inputs = {}) {
  const safe = inputs && typeof inputs === 'object' ? inputs : {};

  const enrolledInVa = safe.enrolledInVa === true || safe.enrolledInVa === 'yes';
  const isEnrolledOrUnsure = enrolledInVa || safe.enrolledInVa === 'unsure';
  const militaryStatus = String(safe.militaryStatus || 'veteran').toLowerCase();
  const dischargeStatus = String(safe.dischargeStatus || 'honorable').toLowerCase();
  const careType = String(safe.careType || 'mental_health').toLowerCase();
  const insurance = String(safe.insurance || 'va').toLowerCase();
  const experiencedMst = safe.experiencedMst === true || safe.experiencedMst === 'yes';
  const receivedVaCare24m = safe.receivedVaCarePast24Months === true || safe.receivedVaCarePast24Months === 'yes' || safe.receivedVaCarePast24Months === undefined;

  const waitDays = safe.vaWaitDays !== '' && safe.vaWaitDays !== null && safe.vaWaitDays !== undefined
    ? Number(safe.vaWaitDays)
    : null;
  const driveMinutes = safe.vaDriveMinutes !== '' && safe.vaDriveMinutes !== null && safe.vaDriveMinutes !== undefined
    ? Number(safe.vaDriveMinutes)
    : null;

  const serviceUnavailable = Boolean(safe.serviceUnavailableAtVa);
  const stateNoFullService = Boolean(safe.stateWithoutFullServiceVa);
  const bestInterest = Boolean(safe.bestMedicalInterest);
  const grandfathered = Boolean(safe.grandfatheredChoice);

  // 1. Determine VA MISSION Act Access Standards based on care category
  const isSpecialty = ['sud_residential', 'detox', 'specialty'].includes(careType);
  const standardWaitDays = isSpecialty ? 28 : 20;
  const standardDriveMinutes = isSpecialty ? 60 : 30;

  const waitTimeExceeded = waitDays !== null && !Number.isNaN(waitDays) && waitDays > standardWaitDays;
  const driveTimeExceeded = driveMinutes !== null && !Number.isNaN(driveMinutes) && driveMinutes > standardDriveMinutes;

  const criteriaMatched = [];
  const vaCommunityCareReasons = [];

  if (serviceUnavailable) {
    criteriaMatched.push('service_unavailable');
    vaCommunityCareReasons.push('Specific clinical service is not offered at your local VA medical facility (38 U.S.C. § 1703(d)(1)(A)).');
  }
  if (stateNoFullService) {
    criteriaMatched.push('no_full_service_state');
    vaCommunityCareReasons.push('You reside in a state or territory without a full-service VA medical center (AK, HI, NH, GU, AS, MP, VI) (38 U.S.C. § 1703(d)(1)(B)).');
  }
  if (grandfathered) {
    criteriaMatched.push('grandfathered_choice');
    vaCommunityCareReasons.push('You qualify under the grandfathered 40-mile distance rule from the Veterans Choice Program (38 U.S.C. § 1703(d)(1)(C)).');
  }
  if (waitTimeExceeded) {
    criteriaMatched.push('access_standards_wait_time');
    vaCommunityCareReasons.push(`VA appointment wait time (${waitDays} days) exceeds the legal access standard (${standardWaitDays} days) for ${isSpecialty ? 'specialty/residential' : 'primary/mental health/SUD'} care (38 C.F.R. § 17.4040).`);
  }
  if (driveTimeExceeded) {
    criteriaMatched.push('access_standards_drive_time');
    vaCommunityCareReasons.push(`Drive time to nearest VA facility (${driveMinutes} min) exceeds the legal access standard (${standardDriveMinutes} min) for ${isSpecialty ? 'specialty/residential' : 'primary/mental health/SUD'} care (38 C.F.R. § 17.4040).`);
  }
  if (bestInterest) {
    criteriaMatched.push('best_medical_interest');
    vaCommunityCareReasons.push('Receiving care in the community is in your best medical interest or necessary due to clinical/travel hardship (38 U.S.C. § 1703(e)).');
  }

  const isVaCommunityCareEligible = isEnrolledOrUnsure && criteriaMatched.length > 0;

  // 2. TRICARE Evaluation
  const isTricare = insurance.includes('tricare');
  const isPrime = insurance === 'tricare_prime' || (isTricare && insurance.includes('prime'));
  const isSelect = insurance === 'tricare_select' || (isTricare && insurance.includes('select'));
  const isADSM = militaryStatus === 'active_duty';

  let tricareRequiresPreAuth = false;
  let tricareRequiresReferral = false;
  const tricareGuidelines = [];

  if (isTricare) {
    const isHighIntensity = ['sud_residential', 'detox', 'php', 'iop'].includes(careType);

    if (isHighIntensity) {
      tricareRequiresPreAuth = true;
      tricareGuidelines.push('Mandatory Prior Authorization: All residential SUD treatment, inpatient detox, partial hospitalization (PHP), and intensive outpatient (IOP) care require formal pre-authorization from your regional TRICARE contractor before admission.');
    } else {
      // Outpatient therapy or OBOT
      if (isADSM) {
        tricareRequiresPreAuth = true;
        tricareRequiresReferral = true;
        tricareGuidelines.push('Active Duty Requirement: Active duty service members must receive a referral from their military provider and military treatment facility commander pre-authorization for civilian care.');
      } else if (isPrime) {
        tricareRequiresPreAuth = false;
        tricareRequiresReferral = false;
        tricareGuidelines.push('TRICARE Prime Outpatient: Non-active-duty beneficiaries can self-refer to TRICARE network providers for outpatient therapy and OBOT without a referral or prior authorization.');
      } else {
        // TRICARE Select
        tricareRequiresPreAuth = false;
        tricareRequiresReferral = false;
        tricareGuidelines.push('TRICARE Select Flexibility: No referral or prior authorization is required for outpatient psychotherapy or OBOT office visits with network providers.');
      }
    }
  }

  // 3. Military Sexual Trauma (MST) Evaluation (38 U.S.C. § 1720D & § 1720I)
  const isMstEligible = experiencedMst;
  const isOthDischarge = dischargeStatus === 'oth';
  const isDishonorable = dischargeStatus === 'dishonorable';

  const mstGuidelines = [];
  if (isMstEligible) {
    mstGuidelines.push('100% Free Care: All MST-related physical and mental healthcare is completely free ($0 copay, no deductibles).');
    mstGuidelines.push('No Service Connection Required: You do NOT need a VA disability rating or to file a disability compensation claim.');
    mstGuidelines.push('No Incident Report Needed: No police report, military justice report, or documentation of the incident is required. Your word is legally sufficient.');
    if (isOthDischarge) {
      mstGuidelines.push('Other Than Honorable (OTH) Protected: Under 38 U.S.C. § 1720I, veterans with OTH administrative discharges are legally eligible for MST-related treatment and counseling.');
    }
    if (isDishonorable) {
      mstGuidelines.push('Discharge Notice: Dishonorable discharges from a general court-martial may require a VA character of discharge review, but community Vet Centers and the Veterans Crisis Line remain 100% accessible immediately.');
    }
    mstGuidelines.push('Vet Centers: Completely confidential individual and group counseling is available at community-based Vet Centers with records kept separate from VA hospital charts.');
  }

  // 4. Urgent Care Benefit (38 U.S.C. § 1725A)
  const isUrgentCareEligible = isEnrolledOrUnsure && receivedVaCare24m;

  // 5. Build Comprehensive Question Checklist
  const questions = [];

  if (isVaCommunityCareEligible) {
    questions.push({
      topic: 'VA Community Care Referral',
      question: 'Since my care meets statutory access standards under the VA MISSION Act (38 U.S.C. § 1703), will you submit an authorized Community Care Network (CCN) referral today?',
    });
  } else if (isEnrolledOrUnsure) {
    questions.push({
      topic: 'VA Care & Wait Times',
      question: 'What is the earliest available appointment for this service at the VA, and does it exceed the 20-day (or 28-day specialty) MISSION Act access standard?',
    });
  }

  if (careType === 'sud_residential' || careType === 'detox') {
    questions.push({
      topic: 'Inpatient / Residential Care Placement',
      question: 'What specialized medical detoxification or residential substance use rehabilitation beds are currently available at the VA or through in-network community partner facilities?',
    });
  }

  if (isTricare) {
    if (tricareRequiresPreAuth) {
      questions.push({
        topic: 'TRICARE Prior Authorization',
        question: 'Has my provider submitted the clinical pre-authorization request to the regional TRICARE contractor (Humana Military or TriWest Healthcare Alliance) to prevent out-of-pocket costs?',
      });
    } else {
      questions.push({
        topic: 'TRICARE Network Participation',
        question: 'Are you an in-network TRICARE-authorized provider, and are any office-based addiction medications (buprenorphine / naltrexone) covered under standard outpatient benefit rules?',
      });
    }
  }

  if (isMstEligible) {
    questions.push({
      topic: 'Military Sexual Trauma Specialized Care',
      question: 'Can I be connected directly with the facility Military Sexual Trauma (MST) Coordinator, and may I request a clinician of my preferred gender for all appointments?',
    });
    questions.push({
      topic: 'Confidential Vet Center Option',
      question: 'Can you provide the contact information for the nearest Vet Center for confidential readjustment and MST counseling held separately from my hospital record?',
    });
  }

  questions.push({
    topic: 'Harm Reduction & Naloxone',
    question: 'Can you provide a take-home naloxone (Narcan) kit and fentanyl/xylazine test strips today, which are provided free to veterans at VA pharmacies and clinics?',
  });

  return {
    vaCommunityCare: {
      eligible: isVaCommunityCareEligible,
      enrolledInVa: isEnrolledOrUnsure,
      criteriaMatched,
      reasons: vaCommunityCareReasons,
      standards: {
        waitDaysLimit: standardWaitDays,
        driveMinutesLimit: standardDriveMinutes,
        actualWaitDays: waitDays,
        actualDriveMinutes: driveMinutes,
        isSpecialty,
      },
      nextSteps: isVaCommunityCareEligible
        ? [
            'Request a Community Care Network (CCN) consult from your VA primary care or mental health team.',
            'Contact your local VA Medical Center Office of Community Care.',
            'Confirm the community provider is active in the VA Community Care Network (Optum Region 1–3 or TriWest Region 4–5).',
          ]
        : [
            'If you are not yet enrolled in VA Health Care, apply online at VA.gov/health-care/apply or call 1-877-222-8387.',
            'If your wait time or travel distance increases, you can request an updated community care determination at any time.',
          ],
    },
    tricareAuth: {
      applies: isTricare,
      plan: isPrime ? 'prime' : isSelect ? 'select' : isTricare ? 'tricare_other' : 'none',
      requiresPreAuth: tricareRequiresPreAuth,
      requiresReferral: tricareRequiresReferral,
      guidelines: tricareGuidelines,
      nextSteps: isTricare
        ? tricareRequiresPreAuth
          ? [
              'Verify that your treating facility is TRICARE-certified.',
              'Ensure the facility submits the prior authorization clinical packet to your regional contractor prior to admission.',
              'Keep the authorization letter number on file for all billing.',
            ]
          : [
              'Verify the outpatient provider is active in the TRICARE network.',
              'Schedule your appointment directly; no referral is needed under Select or for civilian Prime outpatient mental health.',
            ]
        : [],
    },
    mstCare: {
      applies: isMstEligible,
      eligible: isMstEligible,
      freeOfCost: true,
      noServiceConnectionRequired: true,
      noReportNeeded: true,
      othEligible: true,
      dischargeStatus,
      isOthDischarge,
      isDishonorable,
      guidelines: mstGuidelines,
      nextSteps: isMstEligible
        ? [
            'Contact the MST Coordinator at your nearest VA Medical Center (ask the hospital operator for the "MST Coordinator").',
            'Find your local community Vet Center at VA.gov/find-locations or call 1-877-927-8387 for 24/7 confidential readjustment counseling.',
            'Remember: You never have to recount details of the trauma to receive immediate, free care.',
          ]
        : [],
    },
    urgentCare: {
      eligible: isUrgentCareEligible,
      noPriorAuthRequired: true,
      prescriptionBenefit: 'Up to 14-day supply of urgent prescription medications dispensed through in-network CCN pharmacy.',
      rules: [
        'Must be enrolled in VA Health Care and have received care from VA within the past 24 months (or meet priority group exemption).',
        'Find an in-network CCN urgent care provider at VA.gov/find-locations.',
        'Present your VA health ID card and state that you are using your VA Community Urgent Care benefit.',
      ],
    },
    crisisNotice: {
      dial: '988',
      press: '1',
      text: '838255',
      chatUrl: 'https://www.veteranscrisisline.net/',
      compactAct: 'Under 38 U.S.C. § 1720J (COMPACT Act), acute suicidal crisis care is 100% free at ANY emergency room regardless of VA enrollment or discharge characterization.',
    },
    checklistQuestions: questions,
    summaryNotes: [
      'All screener answers are strictly ephemeral in temporary browser RAM and vanish on refresh.',
      'Veterans Crisis Line is available 24/7: Dial 988, then press 1, or text 838255.',
      'Emergency room care for acute suicidal crisis is free under the COMPACT Act.',
    ],
  };
}

// ============================================================================
// 6. Clinical & Legal Handout Generator (Print & Clipboard)
// ============================================================================

export function formatVeteransSummaryText(state = getVeteransState(), lang = state.lang || getLang()) {
  const isEs = lang === 'es';
  const evalResult = evaluateVeteransEligibility(state);
  const lines = [];

  lines.push('================================================================================');
  lines.push(isEs
    ? 'HARBORPATH: GUÍA DE NAVEGACIÓN DE SALUD PARA VETERANOS Y FUERZAS ARMADAS'
    : 'HARBORPATH: VETERANS & MILITARY HEALTH CARE NAVIGATION GUIDE');
  lines.push('================================================================================');
  lines.push(isEs
    ? 'Sesión: Memoria RAM Efímera (Cero almacenamiento persistente o identificadores PII)'
    : 'Session: Ephemeral In-RAM (Zero persistent storage or PII identifiers)');
  lines.push('');

  // Crisis Banner
  lines.push(isEs ? '--- LÍNEA DE CRISIS PARA VETERANOS (24/7/365) ---' : '--- VETERANS CRISIS LINE (24/7/365) ---');
  lines.push(isEs
    ? '• Llame al 988 y presione 1 | Envíe un mensaje de texto al 838255 | Chat en VeteransCrisisLine.net'
    : '• Dial 988, then press 1 | Text 838255 | Chat at VeteransCrisisLine.net');
  lines.push(isEs
    ? '• Ley COMPACT (38 U.S.C. § 1720J): Atención de emergencia por crisis suicida 100% gratuita en CUALQUIER hospital.'
    : '• COMPACT Act (38 U.S.C. § 1720J): Acute suicidal crisis emergency care is 100% free at ANY hospital.');
  lines.push('');

  // VA Community Care
  lines.push(isEs ? '--- LEY VA MISSION ACT DE 2018 (38 U.S.C. § 1703) ---' : '--- VA MISSION ACT OF 2018 (38 U.S.C. § 1703) ---');
  if (evalResult.vaCommunityCare.eligible) {
    lines.push(isEs
      ? '• ESTADO: Cumple con los criterios legales para referencia a la Red de Atención Comunitaria (CCN).'
      : '• STATUS: Likely qualifies for VA Community Care Network (CCN) referral.');
    lines.push(isEs ? '• Criterios cumplidos:' : '• Matched statutory criteria:');
    for (const reason of evalResult.vaCommunityCare.reasons) {
      lines.push(`  - ${reason}`);
    }
  } else {
    lines.push(isEs
      ? '• Estándares de Acceso: 20 días de espera / 30 minutos de manejo para atención primaria, salud mental y adicciones.'
      : '• Access Standards: 20 days wait / 30 min drive for primary care, mental health, and SUD outpatient.');
    lines.push(isEs
      ? '• Atención Especializada / Residencial: 28 días de espera / 60 minutos de manejo.'
      : '• Specialty / Residential Care: 28 days wait / 60 min drive.');
  }
  lines.push('');

  // TRICARE
  if (evalResult.tricareAuth.applies) {
    lines.push(isEs ? '--- PAUTAS DE AUTORIZACIÓN DE TRICARE ---' : '--- TRICARE AUTHORIZATION GUIDELINES ---');
    lines.push(isEs
      ? `• Plan identificado: ${evalResult.tricareAuth.plan.toUpperCase()}`
      : `• Identified Plan: ${evalResult.tricareAuth.plan.toUpperCase()}`);
    lines.push(isEs
      ? `• Requiere preautorización: ${evalResult.tricareAuth.requiresPreAuth ? 'SÍ (Obligatoria)' : 'NO (Para consultas en red)'}`
      : `• Requires Pre-Authorization: ${evalResult.tricareAuth.requiresPreAuth ? 'YES (Mandatory)' : 'NO (For network outpatient visits)'}`);
    for (const g of evalResult.tricareAuth.guidelines) {
      lines.push(`  - ${g}`);
    }
    lines.push('');
  }

  // MST Protections
  if (evalResult.mstCare.applies) {
    lines.push(isEs ? '--- DERECHOS POR TRAUMA SEXUAL MILITAR (MST) (38 U.S.C. § 1720D & § 1720I) ---' : '--- MILITARY SEXUAL TRAUMA (MST) RIGHTS (38 U.S.C. § 1720D & § 1720I) ---');
    lines.push(isEs
      ? '• Atención 100% Gratuita: $0 copago para cualquier condición médica o psicológica relacionada con MST.'
      : '• 100% Free Care: $0 copay for all physical and mental conditions related to MST.');
    lines.push(isEs
      ? '• Sin calificación de discapacidad: No requiere reclamo de servicio ni porcentaje de pensión.'
      : '• No Disability Rating Required: No compensation claim or service-connected rating needed.');
    lines.push(isEs
      ? '• Sin reporte militar previo: No se exigen denuncias, reportes policiales ni cartas de compañeros.'
      : '• No Incident Report Required: No military, police, or buddy documentation needed.');
    lines.push(isEs
      ? '• Licencias Menos que Honorables (OTH): Plenamente elegibles bajo el artículo 38 U.S.C. § 1720I.'
      : '• Other Than Honorable (OTH) Discharges: Fully eligible under 38 U.S.C. § 1720I.');
    lines.push(isEs
      ? '• Centros Vet: Consejería comunitaria confidencial separada del expediente médico de VA.'
      : '• Vet Centers: Confidential community counseling separate from VA hospital charts.');
    lines.push('');
  }

  // Question Checklist
  lines.push(isEs ? '--- PREGUNTAS CLAVE PARA SU EQUIPO MÉDICO ---' : '--- KEY QUESTIONS FOR YOUR HEALTHCARE TEAM ---');
  for (const q of evalResult.checklistQuestions) {
    lines.push(`[ ] ${q.topic}: ${q.question}`);
  }
  lines.push('');
  lines.push(isEs
    ? 'Consulte centros comunitarios y federales en línea en: #/treatment?codes=VET'
    : 'Search verified federal and community treatment locations at: #/treatment?codes=VET');
  lines.push('================================================================================');

  return lines.join('\n');
}

// ============================================================================
// 7. Interactive DOM View: veteransView({ query } = {})
// ============================================================================

export function veteransView({ query = new URLSearchParams() } = {}) {
  const getQueryParam = (key) => {
    if (!query) return null;
    if (typeof query.get === 'function') return query.get(key);
    if (typeof query === 'object' && key in query) return query[key];
    return null;
  };

  const initialTab = getQueryParam('tab') || veteransState.activeTab || 'screener';
  const initialCare = getQueryParam('care') || veteransState.careType;
  const initialMst = getQueryParam('mst') || veteransState.experiencedMst;

  setVeteransState({
    activeTab: ['screener', 'mission_act', 'tricare', 'mst', 'checklist'].includes(initialTab) ? initialTab : 'screener',
    careType: initialCare || veteransState.careType,
    experiencedMst: initialMst || veteransState.experiencedMst,
  });

  const root = h('div', { class: 'view view-veterans' });

  function renderView() {
    clear(root);
    const state = getVeteransState();
    const isEs = state.lang === 'es';
    const tr = (en, es) => (isEs ? es : en);

    // 1. Header
    root.append(
      pageHeader(
        tr('Veterans & Military Health Care Navigation', 'Navegación de Salud para Veteranos y Fuerzas Armadas'),
        tr(
          'Confidential guidance on the VA MISSION Act of 2018 (38 U.S.C. § 1703), Community Care Network access standards, TRICARE behavioral health authorization, Military Sexual Trauma (MST) legal rights under 38 U.S.C. § 1720D & § 1720I, and immediate crisis support.',
          'Orientación confidencial sobre la Ley VA MISSION Act de 2018 (38 U.S.C. § 1703), estándares de la Red de Atención Comunitaria, autorizaciones de TRICARE, derechos legales por Trauma Sexual Militar (MST) bajo 38 U.S.C. § 1720D y § 1720I, y apoyo de crisis inmediato.'
        )
      )
    );

    // 2. High-Priority Veterans Crisis Line Callout
    const crisisCard = h('aside', {
      class: 'callout callout-emergency veterans-crisis-callout',
      role: 'region',
      'aria-label': tr('Veterans Crisis Support', 'Apoyo de Crisis para Veteranos'),
    },
      h('div', { class: 'callout-title' },
        icon('phone'),
        strong(tr('Veterans Crisis Line: Free, Confidential Support 24/7/365', 'Línea de Crisis para Veteranos: Apoyo Gratuito y Confidencial 24/7/365'))
      ),
      p(tr(
        'You do NOT need to be enrolled in VA health care or have a service-connected rating to connect. Open to all veterans, service members, National Guard, Reserve, and their loved ones.',
        'NO necesita estar inscrito en el VA ni tener una calificación de discapacidad para comunicarse. Abierto a todos los veteranos, militares activos, Guardia Nacional, Reserva y sus seres queridos.'
      )),
      h('div', { class: 'actions crisis-actions' },
        tel('988', [icon('phone'), tr('Dial 988, then Press 1', 'Llame al 988 y presione 1')], { class: 'btn btn-emergency btn-large' }),
        sms('838255', '', [icon('message'), tr('Text 838255', 'Mensaje de texto al 838255')], { class: 'btn btn-secondary' }),
        ext('https://www.veteranscrisisline.net/', tr('Chat Online (VeteransCrisisLine.net)', 'Chat en Línea (VeteransCrisisLine.net)'), { class: 'btn btn-ghost' })
      ),
      h('div', { class: 'fine compact-act-note' },
        strong(tr('Veterans COMPACT Act (38 U.S.C. § 1720J): ', 'Ley COMPACT para Veteranos (38 U.S.C. § 1720J): ')),
        tr(
          'Emergency room care for acute suicidal crisis is 100% free at ANY hospital emergency department (VA or non-VA). Notify the VA 72-Hour Hotline at 1-844-724-7842 within 72 hours of admission.',
          'La atención en salas de urgencias por crisis suicida aguda es 100% gratuita en CUALQUIER hospital (del VA o no). Notifique a la línea de 72 horas del VA al 1-844-724-7842 dentro de las 72 horas del ingreso.'
        )
      )
    );
    root.append(crisisCard);

    // 3. Ephemeral In-RAM Privacy Callout
    const privacyCallout = h('div', { class: 'callout callout-info veterans-privacy-callout' },
      h('div', { class: 'callout-title' },
        icon('shield'),
        strong(tr('In-RAM Decision Support & Ephemeral Privacy', 'Asistencia en Memoria RAM y Privacidad Efímera'))
      ),
      p(tr(
        'Your eligibility questions, military status, and answers exist temporarily in browser RAM. No personal data, tracking cookies, or answers are written to device storage, or sent to server logs. Refreshing the browser or clicking Quick Exit clears in-RAM state immediately.',
        'Sus respuestas y datos militares existen de manera temporal en la memoria RAM del navegador. Ningún dato personal o respuesta se escribe en el almacenamiento del dispositivo ni en los registros del servidor. Recargar la página o hacer clic en Salida Rápida limpia el estado de la memoria RAM inmediatamente.'
      )),
      h('div', { class: 'actions' },
        h('button', {
          type: 'button',
          class: 'btn btn-small btn-ghost btn-quick-exit',
          onclick: () => {
            resetVeteransState();
            announce(tr('All in-RAM data has been wiped cleanly.', 'Todos los datos en memoria RAM han sido borrados.'));
            renderView();
          },
        }, tr('Quick Exit & Wipe State', 'Salida Rápida y Borrar Datos'))
      )
    );
    root.append(privacyCallout);

    // 4. Federal VA Treatment Directory Direct Link
    const treatmentButtonSection = h('div', { class: 'callout callout-accent veterans-directory-cta' },
      h('div', { class: 'cta-layout' },
        h('div', null,
          strong(tr('Looking for VA Medical Centers & Military-Friendly Facilities?', '¿Busca Centros Médicos de VA e Instalaciones Militares?')),
          p(tr(
            'Explore state-licensed addiction medicine, buprenorphine providers, and VA Medical Centers pre-filtered for Veterans and Military insurance.',
            'Explore centros autorizados de adicciones, médicos de buprenorfina y hospitales del VA filtrados para cobertura de Veteranos y Militares.'
          ))
        ),
        h('div', { class: 'cta-action' },
          h('a', {
            href: '#/treatment?codes=VET',
            class: 'btn btn-primary btn-large btn-find-va-treatment',
          }, tr('Find VA & Military Treatment Facilities', 'Buscar Centros del VA y Militares'))
        )
      )
    );
    root.append(treatmentButtonSection);

    // 5. Accessible Tab Navigation
    const tabsList = [
      { id: 'screener', label: tr('Interactive Decision Aid', 'Guía de Decisión Interactiva') },
      { id: 'mission_act', label: tr('VA MISSION Act & Community Care', 'Ley VA MISSION Act y Atención Comunitaria') },
      { id: 'tricare', label: tr('TRICARE Substance Use Rules', 'Normas de TRICARE para Adicciones') },
      { id: 'mst', label: tr('Military Sexual Trauma (MST) Rights', 'Derechos por Trauma Sexual Militar (MST)') },
      { id: 'checklist', label: tr('Provider Discussion Checklist', 'Lista para Diálogo con el Médico') },
    ];

    const tabNav = h('nav', {
      class: 'tabs-container',
      'aria-label': tr('Veterans health care sections', 'Secciones de salud para veteranos'),
    },
      h('div', { class: 'tabs', role: 'tablist' },
        tabsList.map((tab) => h('button', {
          type: 'button',
          role: 'tab',
          class: 'tab',
          id: `tab-${tab.id}`,
          'aria-controls': `panel-${tab.id}`,
          'aria-selected': state.activeTab === tab.id ? 'true' : 'false',
          tabindex: state.activeTab === tab.id ? '0' : '-1',
          onclick: () => {
            setVeteransState({ activeTab: tab.id });
            renderView();
            const panel = document.getElementById(`panel-${tab.id}`);
            if (panel) panel.focus();
          },
        }, tab.label))
      )
    );
    root.append(tabNav);

    // ------------------------------------------------------------------------
    // TAB PANEL 1: Interactive Screener & Decision Aid
    // ------------------------------------------------------------------------
    const screenerPanel = h('div', {
      role: 'tabpanel',
      id: 'panel-screener',
      'aria-labelledby': 'tab-screener',
      class: `tab-panel ${state.activeTab === 'screener' ? 'active' : 'hidden'}`,
      tabindex: '0',
    });

    screenerPanel.append(
      section('screener-intro',
        tr('In-RAM Eligibility Decision Aid', 'Guía de Decisión de Elegibilidad en RAM'),
        p(tr(
          'Answer a few confidential questions to see whether you likely qualify for an authorized referral to the VA Community Care Network (CCN), what pre-authorization rules apply to your TRICARE coverage, and your statutory rights for free Military Sexual Trauma care.',
          'Responda algunas preguntas confidenciales para evaluar si califica para una referencia a la Red de Atención Comunitaria (CCN) del VA, qué autorizaciones exige TRICARE y sus derechos de atención gratuita por MST.'
        ))
      )
    );

    const form = h('form', {
      class: 'screener-form card',
      onsubmit: (e) => e.preventDefault(),
    });

    // Question 1: VA Enrollment
    const q1 = h('div', { class: 'form-group' },
      h('label', { for: 'screener-enrolled' }, strong(tr('Are you enrolled in VA Health Care?', '¿Está inscrito en el Sistema de Salud de VA?'))),
      h('select', {
        id: 'screener-enrolled',
        class: 'form-select',
        onchange: (e) => {
          setVeteransState({ enrolledInVa: e.target.value });
          renderView();
        },
      },
        h('option', { value: 'yes', selected: state.enrolledInVa === 'yes' ? '' : null }, tr('Yes, currently enrolled in VA Health Care', 'Sí, actualmente inscrito en VA')),
        h('option', { value: 'no', selected: state.enrolledInVa === 'no' ? '' : null }, tr('No, not currently enrolled', 'No, no estoy inscrito')),
        h('option', { value: 'unsure', selected: state.enrolledInVa === 'unsure' ? '' : null }, tr('Unsure / Need to verify enrollment', 'No estoy seguro / Necesito verificar'))
      )
    );
    form.append(q1);

    // Question 2: Military Status
    const q2 = h('div', { class: 'form-group' },
      h('label', { for: 'screener-status' }, strong(tr('Military Affiliation:', 'Afiliación Militar:'))),
      h('select', {
        id: 'screener-status',
        class: 'form-select',
        onchange: (e) => {
          setVeteransState({ militaryStatus: e.target.value });
          renderView();
        },
      },
        h('option', { value: 'veteran', selected: state.militaryStatus === 'veteran' ? '' : null }, tr('Veteran (Honorably discharged, separated, or retired)', 'Veterano (Licenciado con honores, separado o retirado)')),
        h('option', { value: 'active_duty', selected: state.militaryStatus === 'active_duty' ? '' : null }, tr('Active Duty Service Member (ADSM)', 'Servicio Activo Militar (ADSM)')),
        h('option', { value: 'guard_reserve', selected: state.militaryStatus === 'guard_reserve' ? '' : null }, tr('National Guard or Reserve Component', 'Guardia Nacional o Reserva')),
        h('option', { value: 'dependent', selected: state.militaryStatus === 'dependent' ? '' : null }, tr('Military Spouse, Child, or Family Dependent', 'Cónyuge, hijo o dependiente militar'))
      )
    );
    form.append(q2);

    // Question 3: Discharge Status
    const q3 = h('div', { class: 'form-group' },
      h('label', { for: 'screener-discharge' }, strong(tr('Discharge Characterization (if separated):', 'Carácter del Licenciamiento (si aplica):'))),
      h('select', {
        id: 'screener-discharge',
        class: 'form-select',
        onchange: (e) => {
          setVeteransState({ dischargeStatus: e.target.value });
          renderView();
        },
      },
        h('option', { value: 'honorable', selected: state.dischargeStatus === 'honorable' ? '' : null }, tr('Honorable', 'Honorable')),
        h('option', { value: 'general', selected: state.dischargeStatus === 'general' ? '' : null }, tr('General Under Honorable Conditions', 'General Bajo Condiciones Honorables')),
        h('option', { value: 'oth', selected: state.dischargeStatus === 'oth' ? '' : null }, tr('Other Than Honorable (OTH)', 'Menos que Honorable (OTH)')),
        h('option', { value: 'bad_conduct', selected: state.dischargeStatus === 'bad_conduct' ? '' : null }, tr('Bad Conduct Discharge (BCD)', 'Mala Conducta (BCD)')),
        h('option', { value: 'dishonorable', selected: state.dischargeStatus === 'dishonorable' ? '' : null }, tr('Dishonorable Discharge', 'Deshonrosa')),
        h('option', { value: 'not_applicable', selected: state.dischargeStatus === 'not_applicable' ? '' : null }, tr('Not Applicable / Still Serving', 'No aplica / En servicio activo'))
      )
    );
    form.append(q3);

    // Question 4: Care Type Needed
    const q4 = h('div', { class: 'form-group' },
      h('label', { for: 'screener-care-type' }, strong(tr('Type of Care or Treatment Needed:', 'Tipo de Atención o Tratamiento Requerido:'))),
      h('select', {
        id: 'screener-care-type',
        class: 'form-select',
        onchange: (e) => {
          setVeteransState({ careType: e.target.value });
          renderView();
        },
      },
        h('option', { value: 'mental_health', selected: state.careType === 'mental_health' ? '' : null }, tr('Mental Health / PTSD Counseling (Access std: 20 days / 30 min)', 'Salud Mental / TEPT (Estándar: 20 días / 30 min)')),
        h('option', { value: 'sud_outpatient', selected: state.careType === 'sud_outpatient' ? '' : null }, tr('Outpatient Substance Use Treatment / MOUD (Access std: 20 days / 30 min)', 'Adicciones Ambulatorio / MOUD (Estándar: 20 días / 30 min)')),
        h('option', { value: 'sud_residential', selected: state.careType === 'sud_residential' ? '' : null }, tr('Residential Substance Use Rehabilitation (Access std: 28 days / 60 min)', 'Rehabilitación Residencial de Adicciones (Estándar: 28 días / 60 min)')),
        h('option', { value: 'detox', selected: state.careType === 'detox' ? '' : null }, tr('Inpatient Medically Managed Detox (Access std: 28 days / 60 min)', 'Desintoxicación Médica Hospitalaria (Estándar: 28 días / 60 min)')),
        h('option', { value: 'primary', selected: state.careType === 'primary' ? '' : null }, tr('Primary Medical Care (Access std: 20 days / 30 min)', 'Atención Médica Primaria (Estándar: 20 días / 30 min)')),
        h('option', { value: 'urgent', selected: state.careType === 'urgent' ? '' : null }, tr('Urgent Care (Walk-in clinic / acute symptoms)', 'Urgencias (Clínica ambulatoria / síntomas agudos)'))
      )
    );
    form.append(q4);

    // Question 5: Insurance / Coverage
    const q5 = h('div', { class: 'form-group' },
      h('label', { for: 'screener-insurance' }, strong(tr('Health Insurance / Payer Coverage:', 'Seguro Médico / Cobertura:'))),
      h('select', {
        id: 'screener-insurance',
        class: 'form-select',
        onchange: (e) => {
          setVeteransState({ insurance: e.target.value });
          renderView();
        },
      },
        h('option', { value: 'va', selected: state.insurance === 'va' ? '' : null }, tr('VA Health Care (Primary)', 'Atención Médica de VA (Principal)')),
        h('option', { value: 'tricare_prime', selected: state.insurance === 'tricare_prime' ? '' : null }, tr('TRICARE Prime (HMO Managed Care)', 'TRICARE Prime (Modelo HMO)')),
        h('option', { value: 'tricare_select', selected: state.insurance === 'tricare_select' ? '' : null }, tr('TRICARE Select (PPO Fee-for-Service)', 'TRICARE Select (Modelo PPO)')),
        h('option', { value: 'champva', selected: state.insurance === 'champva' ? '' : null }, tr('CHAMPVA (Spouse / Dependent of 100% Disabled Veteran)', 'CHAMPVA (Dependientes de veterano con 100% discapacidad)')),
        h('option', { value: 'medicaid', selected: state.insurance === 'medicaid' ? '' : null }, tr('Medicaid', 'Medicaid')),
        h('option', { value: 'private', selected: state.insurance === 'private' ? '' : null }, tr('Private Health Insurance', 'Seguro Médico Privado')),
        h('option', { value: 'uninsured', selected: state.insurance === 'uninsured' ? '' : null }, tr('No Insurance / Self-Pay', 'Sin seguro / Pago propio'))
      )
    );
    form.append(q5);

    // Question 6: Travel & Wait Time metrics
    const travelFieldset = h('fieldset', { class: 'form-fieldset' },
      h('legend', null, strong(tr('VA Availability, Wait Times & Travel Distance:', 'Disponibilidad, Tiempos de Espera y Distancia de VA:'))),
      h('div', { class: 'form-row grid-2' },
        h('div', { class: 'form-group' },
          h('label', { for: 'screener-wait' }, tr('Estimated VA appointment wait time (days):', 'Tiempo estimado de espera en VA (días):')),
          h('input', {
            type: 'number',
            id: 'screener-wait',
            class: 'form-input',
            min: '0',
            max: '365',
            placeholder: 'e.g. 25',
            value: state.vaWaitDays,
            oninput: (e) => {
              setVeteransState({ vaWaitDays: e.target.value });
              renderLiveResults();
            },
          })
        ),
        h('div', { class: 'form-group' },
          h('label', { for: 'screener-drive' }, tr('Average one-way drive time to nearest VA offering this care (minutes):', 'Tiempo promedio de manejo al VA más cercano con este servicio (minutos):')),
          h('input', {
            type: 'number',
            id: 'screener-drive',
            class: 'form-input',
            min: '0',
            max: '480',
            placeholder: 'e.g. 45',
            value: state.vaDriveMinutes,
            oninput: (e) => {
              setVeteransState({ vaDriveMinutes: e.target.value });
              renderLiveResults();
            },
          })
        )
      ),
      h('div', { class: 'form-checkboxes' },
        h('label', { class: 'checkbox-label' },
          h('input', {
            type: 'checkbox',
            checked: state.serviceUnavailableAtVa ? '' : null,
            onchange: (e) => {
              setVeteransState({ serviceUnavailableAtVa: e.target.checked });
              renderLiveResults();
            },
          }),
          tr('This specific clinical service is NOT offered at my local VA facility.', 'Este servicio clínico NO se ofrece en mi centro de VA local.')
        ),
        h('label', { class: 'checkbox-label' },
          h('input', {
            type: 'checkbox',
            checked: state.stateWithoutFullServiceVa ? '' : null,
            onchange: (e) => {
              setVeteransState({ stateWithoutFullServiceVa: e.target.checked });
              renderLiveResults();
            },
          }),
          tr('I live in a state/territory without a full-service VA hospital (AK, HI, NH, GU, AS, MP, VI).', 'Vivo en un estado/territorio sin hospital completo de VA (AK, HI, NH, GU, AS, MP, VI).')
        ),
        h('label', { class: 'checkbox-label' },
          h('input', {
            type: 'checkbox',
            checked: state.bestMedicalInterest ? '' : null,
            onchange: (e) => {
              setVeteransState({ bestMedicalInterest: e.target.checked });
              renderLiveResults();
            },
          }),
          tr('Community care is in my best medical interest or necessary due to clinical hardship.', 'La atención comunitaria conviene a mi mejor interés médico o dificultad de viaje.')
        )
      )
    );
    form.append(travelFieldset);

    // Question 7: Military Sexual Trauma (MST)
    const q7 = h('div', { class: 'form-group' },
      h('label', { for: 'screener-mst' }, strong(tr('Did you experience Military Sexual Trauma (MST)?', '¿Experimentó Trauma Sexual Militar (MST)?'))),
      p({ class: 'fine' }, tr(
        'Includes sexual assault, battery, or repeated sexual harassment during active duty, active duty for training, or inactive duty training. Answer is 100% confidential and ephemeral in RAM.',
        'Incluye agresión sexual o acoso sexual reiterado durante el servicio activo o entrenamientos de reserva/guardia. La respuesta es 100% confidencial en RAM.'
      )),
      h('select', {
        id: 'screener-mst',
        class: 'form-select',
        onchange: (e) => {
          setVeteransState({ experiencedMst: e.target.value });
          renderView();
        },
      },
        h('option', { value: 'no', selected: state.experiencedMst === 'no' ? '' : null }, tr('No', 'No')),
        h('option', { value: 'yes', selected: state.experiencedMst === 'yes' ? '' : null }, tr('Yes, I experienced MST', 'Sí, experimenté MST')),
        h('option', { value: 'unsure', selected: state.experiencedMst === 'unsure' ? '' : null }, tr('Unsure / Prefer not to specify', 'No estoy seguro / Prefiero no especificar'))
      )
    );
    form.append(q7);

    screenerPanel.append(form);

    // Live Evaluation Results Container
    const resultsContainer = h('div', {
      class: 'screener-results-container',
      id: 'screener-results-live',
      'aria-live': 'polite',
    });
    screenerPanel.append(resultsContainer);

    function renderLiveResults() {
      clear(resultsContainer);
      const curr = getVeteransState();
      const evaluation = evaluateVeteransEligibility(curr);

      const card = h('article', { class: 'card results-summary-card' },
        h('h3', null, tr('Your Health Care Eligibility Assessment', 'Evaluación de Elegibilidad de Salud')),

        // VA Community Care Status
        h('div', { class: 'result-section' },
          h('h4', null, tr('VA MISSION Act Community Care (38 U.S.C. § 1703):', 'Atención Comunitaria de la Ley VA MISSION Act (38 U.S.C. § 1703):')),
          evaluation.vaCommunityCare.eligible
            ? h('div', { class: 'badge-callout badge-success' },
                strong(tr('Likely Eligible for Community Care Referral', 'Probablemente Elegible para Referencia Comunitaria')),
                ul(evaluation.vaCommunityCare.reasons)
              )
            : h('div', { class: 'badge-callout badge-info' },
                p(tr(
                  `Designated Access Standard for this care: wait time ≤ ${evaluation.vaCommunityCare.standards.waitDaysLimit} days, drive time ≤ ${evaluation.vaCommunityCare.standards.driveMinutesLimit} minutes. If VA cannot meet these benchmarks, you qualify for Community Care.`,
                  `Estándar de acceso para este servicio: espera ≤ ${evaluation.vaCommunityCare.standards.waitDaysLimit} días, manejo ≤ ${evaluation.vaCommunityCare.standards.driveMinutesLimit} minutos. Si el VA no cumple estos tiempos, califica para Atención Comunitaria.`
                ))
              ),
          evaluation.vaCommunityCare.nextSteps.length > 0 && h('div', { class: 'next-steps' },
            strong(tr('Recommended Next Steps: ', 'Próximos Pasos Recomendados: ')),
            ul(evaluation.vaCommunityCare.nextSteps)
          )
        ),

        // TRICARE Status (if applicable)
        evaluation.tricareAuth.applies && h('div', { class: 'result-section' },
          h('h4', null, tr('TRICARE Authorization Guidelines:', 'Pautas de Autorización de TRICARE:')),
          evaluation.tricareAuth.requiresPreAuth
            ? h('div', { class: 'badge-callout badge-warn' },
                strong(tr('Pre-Authorization MANDATORY Before Treatment', 'Preautorización OBLIGATORIA Antes del Tratamiento')),
                ul(evaluation.tricareAuth.guidelines)
              )
            : h('div', { class: 'badge-callout badge-success' },
                strong(tr('No Pre-Authorization Required for Outpatient Network Visits', 'Sin Preautorización para Consultas Ambulatorias en Red')),
                ul(evaluation.tricareAuth.guidelines)
              )
        ),

        // MST Protections (if applicable)
        evaluation.mstCare.applies && h('div', { class: 'result-section' },
          h('h4', null, tr('Military Sexual Trauma (MST) Rights (38 U.S.C. § 1720D & § 1720I):', 'Derechos por Trauma Sexual Militar (MST) (38 U.S.C. § 1720D y § 1720I):')),
          h('div', { class: 'badge-callout badge-mst' },
            strong(tr('Guaranteed 100% Free Confidential Care ($0 Copay)', 'Atención Confidencial Garantizada 100% Gratuita ($0 Copago)')),
            ul(evaluation.mstCare.guidelines)
          ),
          h('div', { class: 'next-steps' },
            strong(tr('How to Access MST Services: ', 'Cómo Acceder a Servicios de MST: ')),
            ul(evaluation.mstCare.nextSteps)
          )
        ),

        // Urgent Care Benefit
        evaluation.urgentCare.eligible && h('div', { class: 'result-section' },
          h('h4', null, tr('VA Urgent Care Benefit (38 U.S.C. § 1725A):', 'Beneficio de Urgencias de VA (38 U.S.C. § 1725A):')),
          p(tr(
            'You are eligible for walk-in urgent care at in-network Community Care Network (CCN) clinics WITHOUT prior authorization. Up to 14 days of urgent prescriptions are covered.',
            'Es elegible para acudir a clínicas de urgencias en la red CCN SIN autorización previa. Se cubren hasta 14 días de medicamentos urgentes.'
          ))
        ),

        // Actions
        h('div', { class: 'actions' },
          h('button', {
            type: 'button',
            class: 'btn btn-primary',
            onclick: () => {
              setVeteransState({ activeTab: 'checklist' });
              renderView();
            },
          }, tr('View & Print Doctor Discussion Checklist', 'Ver e Imprimir Lista de Preguntas para el Médico'))
        )
      );

      resultsContainer.append(card);
    }

    renderLiveResults();
    root.append(screenerPanel);

    // ------------------------------------------------------------------------
    // TAB PANEL 2: VA MISSION Act & Community Care Network (CCN)
    // ------------------------------------------------------------------------
    const missionActPanel = h('div', {
      role: 'tabpanel',
      id: 'panel-mission_act',
      'aria-labelledby': 'tab-mission_act',
      class: `tab-panel ${state.activeTab === 'mission_act' ? 'active' : 'hidden'}`,
      tabindex: '0',
    });

    missionActPanel.append(
      section('mission-act-intro',
        tr('VA MISSION Act of 2018 (38 U.S.C. § 1703) Standards', 'Estándares de la Ley VA MISSION Act de 2018 (38 U.S.C. § 1703)'),
        p(tr(
          'Under federal law, enrolled veterans can receive VA-authorized healthcare from private community providers in the VA Community Care Network (CCN) with zero or low copayments if any of six statutory criteria are satisfied.',
          'Bajo la ley federal, los veteranos inscritos pueden recibir atención médica autorizada por el VA con proveedores comunitarios privados en la red CCN con copagos mínimos o nulos si cumplen cualquiera de seis criterios legales.'
        ))
      )
    );

    // Comparison Table of Access Standards
    const standardsTableWrap = h('div', {
      class: 'table-wrap standards-table-wrap',
      role: 'region',
      'aria-label': tr('VA Access Standards comparison', 'Comparación de Estándares de Acceso de VA'),
      tabindex: '0',
    },
      h('table', { class: 'data-table' },
        h('thead', null,
          h('tr', null,
            h('th', { scope: 'col' }, tr('Care Category', 'Categoría de Atención')),
            h('th', { scope: 'col' }, tr('Maximum Drive Time', 'Tiempo Máximo de Manejo')),
            h('th', { scope: 'col' }, tr('Maximum Wait Time', 'Tiempo Máximo de Espera')),
            h('th', { scope: 'col' }, tr('Statutory Citation', 'Cita Legal'))
          )
        ),
        h('tbody', null,
          h('tr', null,
            h('td', null, strong(tr('Primary Care, Mental Health & Outpatient SUD', 'Atención Primaria, Salud Mental y Adicciones Ambulatorias'))),
            h('td', null, tr('30-minute average drive time', '30 minutos de manejo promedio')),
            h('td', null, tr('20 days from request/clinical date', '20 días desde solicitud o fecha clínica')),
            h('td', null, '38 C.F.R. § 17.4040(a)(1)')
          ),
          h('tr', null,
            h('td', null, strong(tr('Specialty Care & Residential SUD Rehabilitation', 'Atención Especializada y Rehabilitación Residencial de Adicciones'))),
            h('td', null, tr('60-minute average drive time', '60 minutos de manejo promedio')),
            h('td', null, tr('28 days from request/clinical date', '28 días desde solicitud o fecha clínica')),
            h('td', null, '38 C.F.R. § 17.4040(a)(2)')
          ),
          h('tr', null,
            h('td', null, strong(tr('Urgent Care (Walk-In Clinics)', 'Urgencias (Clínicas Ambulatorias)'))),
            h('td', null, tr('Immediate walk-in at CCN provider', 'Atención inmediata sin cita en red CCN')),
            h('td', null, tr('No prior authorization needed', 'Sin autorización previa requerida')),
            h('td', null, '38 U.S.C. § 1725A')
          )
        )
      )
    );
    missionActPanel.append(standardsTableWrap);

    // 6 Statutory Criteria Cards
    const criteriaHeading = h('h3', null, tr('The Six Statutory Community Care Pathways (38 C.F.R. § 17.4010)', 'Las Seis Vías Legales de Atención Comunitaria (38 C.F.R. § 17.4010)'));
    missionActPanel.append(criteriaHeading);

    const criteriaGrid = h('div', { class: 'cards-grid criteria-grid' });
    for (const crit of MISSION_ACT_CRITERIA_DATA) {
      const card = h('article', { class: 'card criterion-card' },
        h('h4', null, tr(crit.title.en, crit.title.es)),
        h('div', { class: 'statute-tag' }, crit.statute),
        p(tr(crit.summary.en, crit.summary.es)),
        h('div', { class: 'action-tip' },
          strong(tr('How to Assert: ', 'Cómo Solicitarlo: ')),
          tr(crit.actionAdvice.en, crit.actionAdvice.es)
        )
      );
      criteriaGrid.append(card);
    }
    missionActPanel.append(criteriaGrid);
    root.append(missionActPanel);

    // ------------------------------------------------------------------------
    // TAB PANEL 3: TRICARE Substance Use & Behavioral Health
    // ------------------------------------------------------------------------
    const tricarePanel = h('div', {
      role: 'tabpanel',
      id: 'panel-tricare',
      'aria-labelledby': 'tab-tricare',
      class: `tab-panel ${state.activeTab === 'tricare' ? 'active' : 'hidden'}`,
      tabindex: '0',
    });

    tricarePanel.append(
      section('tricare-intro',
        tr('TRICARE Substance Use Disorder & Mental Health Authorizations', 'Autorizaciones de TRICARE para Adicciones y Salud Mental'),
        p(tr(
          'Understanding when TRICARE requires prior authorization is critical to avoiding unexpected medical bills. Below is the level-of-care authorization matrix for TRICARE Prime and TRICARE Select beneficiaries under 32 C.F.R. § 199.4.',
          'Comprender cuándo TRICARE exige autorización previa es fundamental para evitar facturas inesperadas. A continuación se detalla la matriz de autorizaciones para TRICARE Prime y TRICARE Select bajo 32 C.F.R. § 199.4.'
        ))
      )
    );

    // Prime vs Select Summary
    const plansGrid = h('div', { class: 'cards-grid plans-grid' });
    for (const [key, plan] of Object.entries(TRICARE_CARE_LEVELS.PLANS)) {
      plansGrid.append(
        h('article', { class: 'card plan-card' },
          h('h4', null, `${plan.name} (${plan.type})`),
          p(tr(plan.description.en, plan.description.es))
        )
      );
    }
    tricarePanel.append(plansGrid);

    // Care Levels Table
    const careLevelsTable = h('div', {
      class: 'table-wrap care-levels-table-wrap',
      role: 'region',
      'aria-label': tr('TRICARE Authorization Requirements', 'Requisitos de Autorización de TRICARE'),
      tabindex: '0',
    },
      h('table', { class: 'data-table' },
        h('thead', null,
          h('tr', null,
            h('th', { scope: 'col' }, tr('Care Level / Service', 'Nivel de Atención / Servicio')),
            h('th', { scope: 'col' }, tr('TRICARE Prime Pre-Auth', 'Preautorización TRICARE Prime')),
            h('th', { scope: 'col' }, tr('TRICARE Select Pre-Auth', 'Preautorización TRICARE Select')),
            h('th', { scope: 'col' }, tr('Clinical Rule', 'Norma Clínica'))
          )
        ),
        h('tbody', null,
          TRICARE_CARE_LEVELS_DATA.map((lvl) =>
            h('tr', null,
              h('td', null, strong(tr(lvl.name.en, lvl.name.es))),
              h('td', null, lvl.primeRequiresPreAuth ? tr('YES (Mandatory)', 'SÍ (Obligatoria)') : tr('NO (Network visits)', 'NO (Consultas en red)')),
              h('td', null, lvl.selectRequiresPreAuth ? tr('YES (Mandatory)', 'SÍ (Obligatoria)') : tr('NO (Network visits)', 'NO (Consultas en red)')),
              h('td', null, tr(lvl.summary.en, lvl.summary.es))
            )
          )
        )
      )
    );
    tricarePanel.append(careLevelsTable);

    // Regional Contractors Info
    const contractorsCard = h('div', { class: 'card contractors-card' },
      h('h4', null, tr('TRICARE Regional Contractors for Authorizations', 'Contratistas Regionales de TRICARE para Autorizaciones')),
      h('div', { class: 'contractors-grid grid-2' },
        h('div', null,
          strong('TRICARE East Region (Humana Military):'),
          p(tr('Phone: 1-800-444-5445 | Web: HumanaMilitary.com', 'Teléfono: 1-800-444-5445 | Web: HumanaMilitary.com'))
        ),
        h('div', null,
          strong('TRICARE West Region (TriWest Healthcare Alliance):'),
          p(tr('Phone: 1-888-TRIWEST (1-888-874-9378) | Web: tricare.mil/west', 'Teléfono: 1-888-TRIWEST (1-888-874-9378) | Web: tricare.mil/west'))
        )
      )
    );
    tricarePanel.append(contractorsCard);
    root.append(tricarePanel);

    // ------------------------------------------------------------------------
    // TAB PANEL 4: Military Sexual Trauma (MST) Rights
    // ------------------------------------------------------------------------
    const mstPanel = h('div', {
      role: 'tabpanel',
      id: 'panel-mst',
      'aria-labelledby': 'tab-mst',
      class: `tab-panel ${state.activeTab === 'mst' ? 'active' : 'hidden'}`,
      tabindex: '0',
    });

    mstPanel.append(
      section('mst-intro',
        tr('Military Sexual Trauma (MST) Statutory Protections', 'Protecciones Legales por Trauma Sexual Militar (MST)'),
        p(tr(
          'Federal law guarantees comprehensive, free, and confidential healthcare for mental and physical conditions related to experiences of Military Sexual Trauma under 38 U.S.C. § 1720D and 38 U.S.C. § 1720I.',
          'La ley federal garantiza atención médica completa, gratuita y confidencial para afecciones físicas y mentales derivadas de Trauma Sexual Militar bajo 38 U.S.C. § 1720D y 38 U.S.C. § 1720I.'
        ))
      )
    );

    const mstKeyPoints = h('div', { class: 'cards-grid mst-grid' });
    for (const item of MST_PROTECTIONS_DATA) {
      mstKeyPoints.append(
        h('article', { class: 'card mst-protection-card' },
          h('h4', null, tr(item.title.en, item.title.es)),
          h('div', { class: 'statute-tag' }, item.statute),
          p(tr(item.summary.en, item.summary.es))
        )
      );
    }
    mstPanel.append(mstKeyPoints);

    const vetCentersCallout = h('div', { class: 'callout callout-info vet-centers-callout' },
      h('h4', null, tr('Vet Centers: Independent & Strictly Confidential', 'Centros Vet: Independientes y Estrictamente Confidenciales')),
      p(tr(
        'If you do not feel comfortable going to a VA hospital or medical center, community Vet Centers provide free individual and group readjustment counseling. Your records at a Vet Center are held under independent confidentiality and are never merged with VA hospital records without your written consent.',
        'Si no se siente cómodo acudiendo a un hospital del VA, los Centros Vet comunitarios ofrecen consejería gratuita individual y grupal. Sus expedientes en un Centro Vet están protegidos por confidencialidad independiente y nunca se integran a los registros hospitalarios sin su consentimiento escrito.'
      )),
      h('div', { class: 'actions' },
        tel('18779278387', [icon('phone'), tr('Call 24/7 Vet Center Line: 1-877-927-8387', 'Línea de Centros Vet 24/7: 1-877-927-8387')], { class: 'btn btn-secondary' }),
        ext('https://www.va.gov/find-locations/?facilityType=vet_center', tr('Find Nearest Vet Center', 'Buscar Centro Vet Más Cercano'), { class: 'btn btn-ghost' })
      )
    );
    mstPanel.append(vetCentersCallout);
    root.append(mstPanel);

    // ------------------------------------------------------------------------
    // TAB PANEL 5: Provider Discussion Checklist
    // ------------------------------------------------------------------------
    const checklistPanel = h('div', {
      role: 'tabpanel',
      id: 'panel-checklist',
      'aria-labelledby': 'tab-checklist',
      class: `tab-panel ${state.activeTab === 'checklist' ? 'active' : 'hidden'}`,
      tabindex: '0',
    });

    checklistPanel.append(
      section('checklist-intro',
        tr('Personalized Health Care Discussion Checklist', 'Lista Personalizada para Diálogo con el Médico'),
        p(tr(
          'Use this customized checklist when speaking with your VA primary care provider, Community Care coordinator, or civilian doctor. Check off items as you discuss them.',
          'Utilice esta lista personalizada al dialogar con su médico de atención primaria de VA, coordinador de atención comunitaria o médico civil.'
        ))
      )
    );

    const evalResult = evaluateVeteransEligibility(state);
    const questionsList = h('div', { class: 'checklist-questions-list' });

    evalResult.checklistQuestions.forEach((q, idx) => {
      const qId = `q_${idx}`;
      const isChecked = Boolean(state.checklistChecked[qId]);
      const row = h('div', { class: `checklist-item ${isChecked ? 'completed' : ''}` },
        h('label', { class: 'checkbox-label' },
          h('input', {
            type: 'checkbox',
            checked: isChecked ? '' : null,
            onchange: (e) => {
              setVeteransState({
                checklistChecked: {
                  ...state.checklistChecked,
                  [qId]: e.target.checked,
                },
              });
              renderView();
            },
          }),
          h('div', { class: 'question-content' },
            strong(`${q.topic}: `),
            q.question
          )
        )
      );
      questionsList.append(row);
    });
    checklistPanel.append(questionsList);

    // Handout Actions (Print / Copy)
    const handoutCard = h('div', { class: 'card handout-actions-card' },
      h('h4', null, tr('Save or Share Your Care Plan', 'Guarde o Comparta su Plan de Atención')),
      p(tr(
        'Generate a clean, high-contrast, zero-PII clinical handout you can print or copy to your clipboard.',
        'Genere una copia clínica de alto contraste sin datos personales para imprimir o copiar a su portapapeles.'
      )),
      h('div', { class: 'actions' },
        h('button', {
          type: 'button',
          class: 'btn btn-primary',
          onclick: () => {
            if (typeof window !== 'undefined' && typeof window.print === 'function') {
              window.print();
            }
          },
        }, tr('Print Clinical Handout', 'Imprimir Documento Clínico')),
        h('button', {
          type: 'button',
          class: 'btn btn-secondary',
          onclick: async () => {
            const text = formatVeteransSummaryText(state, state.lang);
            try {
              if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                announce(tr('Discussion checklist copied to clipboard.', 'Lista de preguntas copiada al portapapeles.'));
              }
            } catch {
              // fallback
            }
          },
        }, tr('Copy Checklist to Clipboard', 'Copiar Lista al Portapapeles'))
      )
    );
    checklistPanel.append(handoutCard);
    root.append(checklistPanel);

    return root;
  }

  return renderView();
}
