/**
 * Workplace Rights, FMLA & Professional Licensure Specialist View (public/js/views/workplaceRights.js)
 *
 * Comprehensive, trauma-informed statutory and clinical guidance for employees,
 * healthcare professionals, commercial workers, and legal advocates navigating employment:
 *
 * 1. Family and Medical Leave Act (FMLA, 29 U.S.C. § 2612; 29 CFR § 825.119):
 *    - Substance use disorder as a serious health condition (inpatient care or continuing healthcare provider treatment).
 *    - Statutory boundary: Leave *for treatment* is protected; absence due to substance *use/intoxication* is not.
 *    - Anti-retaliation protections (29 CFR § 825.119(b)): Employer cannot retaliate for exercising leave rights.
 *    - 12 weeks of job-protected, unpaid leave with health benefits continuation.
 *    - Confidentiality of medical certifications (29 CFR § 825.500(g)): kept separate from personnel files.
 *
 * 2. Americans with Disabilities Act (ADA, 42 U.S.C. § 12101; 29 CFR § 1630.3):
 *    - "In Recovery" Safe Harbor (42 U.S.C. § 12114(b)): Completed or currently participating in supervised rehab.
 *    - Prescribed MOUD Protections (DOJ/EEOC Guidance April 2022): Methadone and Buprenorphine as lawful medical treatments.
 *    - Drug Testing & Medical Review Officer (MRO) rules: Prescription verification converts positive screen to negative.
 *    - Reasonable Accommodations: Shift adjustments for clinic dosing, leave for treatment.
 *    - Direct Threat Defense standard (42 U.S.C. § 12113(b)): Requires individualized objective medical assessment.
 *
 * 3. Professional Licensure & Alternative to Discipline (ATD):
 *    - Healthcare professionals (Physicians, Nurses, Pharmacists): Physician Health Programs (PHPs) and ATDs.
 *    - DOT Safety-Sensitive Regulations (49 CFR Part 40 / FMCSA / FAA HIMS).
 *
 * 4. Interactive In-RAM Workplace Rights Evaluator:
 *    - FMLA eligibility calculator (50+ employees, 12 months tenure, 1,250 hours).
 *    - ADA MOUD protection status screener.
 *    - Disclosure scripts for Human Resources without over-revealing sensitive clinical details.
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

// ============================================================================
// 1. Statutory Frameworks & Legal Standards
// ============================================================================

export const FMLA_REGULATORY_RULES = [
  {
    id: 'fmla_treatment_coverage',
    title: {
      en: 'FMLA Coverage for Substance Use Disorder Treatment',
      es: 'Cobertura de FMLA para el Tratamiento del Trastorno por Uso de Sustancias',
    },
    statute: '29 U.S.C. § 2612; 29 C.F.R. § 825.119(a)',
    ruleType: 'statutory_protection',
    summary: {
      en: 'Substance use disorder qualifies as a serious health condition under FMLA if treatment involves inpatient care or continuing treatment by a healthcare provider. An eligible employee may take up to 12 weeks of job-protected, unpaid leave for treatment.',
      es: 'El trastorno por uso de sustancias califica como afección médica grave bajo FMLA si el tratamiento incluye atención hospitalaria o tratamiento continuo por un proveedor médico. El empleado elegible tiene derecho a hasta 12 semanas de licencia sin goce de sueldo con protección de empleo.',
    },
    keyDistinction: {
      en: 'Crucial distinction: Absence caused by an employee’s *use* of the substance (intoxication, hangover) does NOT qualify for FMLA leave. Absence *for treatment* of substance use disorder by a healthcare provider or referral DOES qualify.',
      es: 'Distinción crucial: La ausencia por el *consumo* de sustancias (intoxicación, resaca) NO califica para FMLA. La ausencia *para tratamiento* médico o por derivación médica SÍ califica.',
    },
  },
  {
    id: 'fmla_anti_retaliation',
    title: {
      en: 'FMLA Anti-Retaliation & Employer Disciplinary Boundaries',
      es: 'Protección contra Represalias y Límites Disciplinarios del Empleador bajo FMLA',
    },
    statute: '29 C.F.R. § 825.119(b); 29 U.S.C. § 2615',
    ruleType: 'anti_retaliation',
    summary: {
      en: 'An employer may not retaliate, discriminate, or take adverse employment action against an employee for requesting or taking FMLA leave for substance use disorder treatment.',
      es: 'El empleador no puede tomar represalias, discriminar ni aplicar medidas adversas contra un empleado por solicitar o tomar licencia FMLA para tratamiento de adicciones.',
    },
    keyDistinction: {
      en: 'An employer may only take adverse action (e.g. termination) if they maintain an established, uniformly applied, written policy prohibiting substance use, communicated to all employees, and the termination is executed pursuant to that policy rather than in retaliation for seeking treatment.',
      es: 'El empleador solo puede aplicar medidas adversas si cuenta con una política escrita establecida, comunicada y aplicada uniformemente que prohíba el consumo, y el despido se deba a dicha política y no a la solicitud de tratamiento.',
    },
  },
  {
    id: 'fmla_medical_confidentiality',
    title: {
      en: 'FMLA Medical Certification Confidentiality Standards',
      es: 'Normas de Confidencialidad de la Certificación Médica FMLA',
    },
    statute: '29 C.F.R. § 825.500(g); ADA 42 U.S.C. § 12112(d)',
    ruleType: 'privacy_confidentiality',
    summary: {
      en: 'Records and documents relating to medical certifications, recertifications, or medical histories of employees created for FMLA must be maintained as confidential medical records in separate files from standard personnel files.',
      es: 'Los expedientes y documentos de certificación médica FMLA deben mantenerse como expedientes médicos confidenciales en archivos separados de los expedientes de personal regulares.',
    },
    keyDistinction: {
      en: 'Employees are NOT required to disclose their exact psychiatric or addiction diagnosis to their direct supervisors. Human Resources only needs healthcare provider certification that a serious health condition requires inpatient or continuing care.',
      es: 'Los empleados NO están obligados a revelar su diagnóstico exacto a supervisores directos. Recursos Humanos solo requiere certificación de que una condición grave exige atención médica.',
    },
  },
];

export const ADA_PROTECTION_STANDARDS = [
  {
    id: 'ada_in_recovery_safe_harbor',
    title: {
      en: 'ADA "In Recovery" Safe Harbor: Protection Against Disability Discrimination',
      es: 'Refugio Seguro "En Recuperación" de la ADA: Protección contra Discriminación',
    },
    statute: '42 U.S.C. § 12114(b); 29 C.F.R. § 1630.3(b)',
    summary: {
      en: 'While current illegal use of drugs is excluded from ADA protection, an individual who has successfully completed a supervised rehabilitation program, is currently participating in supervised rehab, and is no longer engaging in illegal drug use IS protected as a qualified individual with a disability.',
      es: 'Aunque el consumo ilegal activo de drogas está excluido de la ADA, una persona que ha completado un programa supervisado de rehabilitación, o que participa en él y ya no consume drogas ilegales, SÍ está protegida como persona calificada con discapacidad.',
    },
    actionAdvice: {
      en: 'If you are participating in outpatient counseling, IOP, or residential treatment and not using illicit substances, you are protected against disability discrimination in hiring, promotions, and termination.',
      es: 'Si participa en consejería ambulatoria, IOP o residencial y no consume sustancias ilícitas, está protegido contra discriminación por discapacidad en contratación, ascensos y despidos.',
    },
  },
  {
    id: 'ada_prescribed_moud',
    title: {
      en: 'DOJ & EEOC Civil Rights Protections for Prescribed MOUD (Methadone & Buprenorphine)',
      es: 'Protecciones de Derechos Civiles del DOJ y EEOC para MOUD Recetado (Metadona y Buprenorfina)',
    },
    statute: 'U.S. DOJ Civil Rights Division (April 2022); EEOC Guidance on the ADA and Opioid Use Disorder',
    summary: {
      en: 'Taking lawfully prescribed medication for opioid use disorder (buprenorphine, methadone, naltrexone) does NOT constitute illegal drug use. Employers cannot adopt blanket policies that disqualify or terminate workers solely because they take prescribed MOUD.',
      es: 'Tomar medicamentos recetados para el trastorno por uso de opioides (buprenorfina, metadona, naltrexona) NO constituye consumo ilegal de drogas. Los empleadores no pueden aplicar políticas generales que descalifiquen o despidan trabajadores solo por tomar MOUD prescrito.',
    },
    actionAdvice: {
      en: 'If a workplace drug test detects buprenorphine or methadone, the Medical Review Officer (MRO) must verify your prescription. Once verified, the MRO must report the test as negative to your employer, keeping the medication private unless safety clearance is specifically required.',
      es: 'Si una prueba de drogas detecta buprenorfina o metadona, el Oficial de Revisión Médica (MRO) debe verificar su receta. Verificada esta, el MRO debe reportar la prueba como negativa al empleador, manteniendo la medicación privada.',
    },
  },
  {
    id: 'ada_reasonable_accommodations',
    title: {
      en: 'Reasonable Accommodations for Substance Use Disorder Care',
      es: 'Ajustes Razonables para la Atención del Trastorno por Uso de Sustancias',
    },
    statute: '42 U.S.C. § 12112(b)(5); 29 C.F.R. § 1630.9',
    summary: {
      en: 'Employers must provide reasonable accommodations to employees in recovery, such as modified work schedules to attend daily Opioid Treatment Program (OTP) dosing, leave for medical appointments, or reassignments away from trigger environments, provided it does not create undue hardship.',
      es: 'Los empleadores deben proporcionar ajustes razonables a empleados en recuperación, como horarios modificados para acudir a dosificación en OTP, permisos para citas médicas o reasignación de tareas, siempre que no implique una carga excesiva.',
    },
    actionAdvice: {
      en: 'Submit accommodation requests through Human Resources accompanied by a clinician note confirming schedule requirements without over-sharing personal psychological records.',
      es: 'Presente solicitudes de ajustes razonables a través de Recursos Humanos con una nota médica que justifique los horarios requeridos sin revelar notas psicológicas personales.',
    },
  },
];

export const PROFESSIONAL_LICENSURE_FRAMEWORKS = [
  {
    profession: 'nursing',
    title: { en: 'Registered Nurses & Licensed Practical Nurses (RN / LPN)', es: 'Enfermeros Registrados y Prácticos (RN / LPN)' },
    programType: 'Nurse Alternative to Discipline (ATD) / Peer Assistance',
    statute: 'National Council of State Boards of Nursing (NCSBN) ATD Standards',
    guidance: {
      en: 'Nearly all state nursing boards maintain confidential Alternative to Discipline programs. Voluntary self-referral prior to employer complaints or patient harm allows nurses to receive comprehensive treatment and monitoring without public license suspension or disciplinary records.',
      es: 'Casi todas las juntas estatales de enfermería cuentan con programas confidenciales Alternativos a la Disciplina (ATD). La autoreferencia voluntaria previa a quejas o daños al paciente permite recibir tratamiento y monitoreo sin suspensión pública de la licencia.',
    },
    keyAdvice: {
      en: 'Contact your state nursing peer assistance program confidentially before an employer investigation initiates formal board disciplinary proceedings.',
      es: 'Comuníquese confidencialmente con el programa de asistencia de pares de enfermería de su estado antes de que una investigación laboral inicie un proceso disciplinario formal.',
    },
  },
  {
    profession: 'physicians',
    title: { en: 'Physicians & Surgeons (MD / DO)', es: 'Médicos y Cirujanos (MD / DO)' },
    programType: 'Physician Health Programs (PHPs)',
    statute: 'Federation of State Physician Health Programs (FSPHP) Guidelines',
    guidance: {
      en: 'State Physician Health Programs provide confidential assessment, referral, and multi-year monitoring agreements. Successful completion protects medical licenses and hospital credentialing privileges.',
      es: 'Los Programas de Salud Médica (PHP) estatales ofrecen evaluación confidencial, referencia y acuerdos de monitoreo. Su cumplimiento satisfactorio protege la licencia médica y privilegios hospitalarios.',
    },
    keyAdvice: {
      en: 'Self-referral into a recognized PHP establishes a confidential advocate relationship with the medical licensing board.',
      es: 'La autoreferencia a un PHP reconocido establece una relación de respaldo confidencial ante la junta de licencias médicas.',
    },
  },
  {
    profession: 'commercial_transport',
    title: { en: 'Commercial Drivers & Transportation Workers (DOT / FMCSA / FAA)', es: 'Conductores Comerciales y Trabajadores del Transporte (DOT / FMCSA / FAA)' },
    programType: 'Substance Abuse Professional (SAP) / Return-to-Duty Protocol',
    statute: '49 C.F.R. Part 40 (DOT Testing & Return-to-Duty Process)',
    guidance: {
      en: 'Workers in safety-sensitive DOT positions (truck drivers, pilots, transit operators) who test positive or disclose substance use must complete the formal DOT Return-to-Duty process with a qualified Substance Abuse Professional (SAP) before resuming safety-sensitive duties.',
      es: 'Trabajadores en puestos de seguridad crítica de DOT (camioneros, pilotos) que den positivo deben completar el proceso formal de Regreso al Trabajo con un Profesional de Abuso de Sustancias (SAP) calificado.',
    },
    keyAdvice: {
      en: 'Under 49 C.F.R. § 391.41(b)(12), methadone is disqualifying for interstate commercial driving; buprenorphine requires individualized medical examiner clearance and prescribing doctor attestation of safety.',
      es: 'Bajo 49 CFR § 391.41(b)(12), la metadona es descalificante para conducción comercial interestatal; la buprenorfina requiere autorización médica individualizada del examinador certificado.',
    },
  },
];

// ============================================================================
// 2. In-RAM Workplace Rights Evaluation Engine: evaluateWorkplaceRights(inputs)
// ============================================================================

export function evaluateWorkplaceRights(inputs = {}) {
  const {
    employerSize = '50_plus',              // '50_plus' | 'under_50' | 'public_agency'
    tenureMonths = 14,                     // number of months worked
    hoursWorkedLast12Months = 1300,        // number of hours worked in past 12 mos
    treatmentStage = 'planning_treatment', // 'planning_treatment' | 'currently_inpatient_iop' | 'in_recovery_moud' | 'active_impairment'
    prescribedMoud = true,                 // boolean: taking prescribed buprenorphine/methadone/naltrexone
    jobCategory = 'general_office_service', // 'general_office_service' | 'healthcare_licensed' | 'dot_safety_sensitive' | 'safety_sensitive_other'
  } = inputs;

  const numTenure = Number(tenureMonths) || 0;
  const numHours = Number(hoursWorkedLast12Months) || 0;

  // 1. Evaluate FMLA Eligibility
  const isEmployerCovered = employerSize === '50_plus' || employerSize === 'public_agency';
  const hasTenure = numTenure >= 12;
  const hasHours = numHours >= 1250;
  const isFmlaQualified = isEmployerCovered && hasTenure && hasHours;

  let fmlaStatus = 'qualified';
  const fmlaBarriers = [];

  if (!isEmployerCovered) {
    fmlaStatus = 'employer_exempt';
    fmlaBarriers.push({
      en: 'Private employer with fewer than 50 employees within 75 miles is exempt from federal FMLA requirements (check state family leave laws).',
      es: 'Empleador privado con menos de 50 empleados en 75 millas está exento de FMLA federal (consulte leyes estatales de licencia médica).',
    });
  }
  if (!hasTenure) {
    fmlaStatus = 'tenure_insufficient';
    fmlaBarriers.push({
      en: `Tenure is ${numTenure} months; FMLA requires at least 12 months with the current employer.`,
      es: `Su antigüedad es de ${numTenure} meses; FMLA exige al menos 12 meses con el empleador actual.`,
    });
  }
  if (!hasHours) {
    fmlaStatus = 'hours_insufficient';
    fmlaBarriers.push({
      en: `Hours worked in past 12 months is ${numHours}; FMLA requires at least 1,250 hours.`,
      es: `Horas trabajadas en los últimos 12 meses son ${numHours}; FMLA exige al menos 1,250 horas.`,
    });
  }
  if (isFmlaQualified) {
    fmlaStatus = 'qualified';
  }

  // 2. Evaluate ADA Status & MOUD Protections
  let adaProtectionTier = 'full_protection';
  const adaNotes = [];

  if (treatmentStage === 'active_impairment') {
    adaProtectionTier = 'excluded_current_use';
    adaNotes.push({
      en: 'Current illegal use of drugs is explicitly excluded from ADA protection (42 U.S.C. § 12114(a)). Immediate entry into supervised treatment establishes "in recovery" protection.',
      es: 'El consumo ilegal activo está excluido de la protección ADA (42 U.S.C. § 12114(a)). El ingreso inmediato a tratamiento supervisado establece la protección "en recuperación".',
    });
  } else if (treatmentStage === 'planning_treatment' || treatmentStage === 'currently_inpatient_iop' || treatmentStage === 'in_recovery_moud') {
    adaProtectionTier = 'protected_in_recovery';
    adaNotes.push({
      en: 'Protected under 42 U.S.C. § 12114(b) as an individual in recovery participating in or completed supervised treatment without illicit drug use.',
      es: 'Protegido bajo 42 U.S.C. § 12114(b) como persona en recuperación que participa o completó tratamiento supervisado sin consumo de drogas ilícitas.',
    });
  }

  if (prescribedMoud) {
    adaNotes.push({
      en: 'Prescribed MOUD (Buprenorphine / Methadone): Fully protected under DOJ Civil Rights guidance; employer cannot disqualify you solely for lawful prescription adherence.',
      es: 'MOUD prescrito (buprenorfina / metadona): Totalmente protegido bajo la guía de derechos civiles del DOJ; el empleador no puede descalificarlo solo por tomar su medicación recetada.',
    });
  }

  // 3. Professional Licensure / Safety Guidance
  let licensureFramework = null;
  if (jobCategory === 'healthcare_licensed') {
    licensureFramework = PROFESSIONAL_LICENSURE_FRAMEWORKS.find((f) => f.profession === 'nursing' || f.profession === 'physicians');
  } else if (jobCategory === 'dot_safety_sensitive') {
    licensureFramework = PROFESSIONAL_LICENSURE_FRAMEWORKS.find((f) => f.profession === 'commercial_transport');
  }

  // 4. Actionable Next Steps
  const nextSteps = [];

  if (isFmlaQualified) {
    nextSteps.push({
      priority: 'immediate',
      title: { en: 'Request FMLA Leave Forms from Human Resources', es: 'Solicitar Formularios de Licencia FMLA a Recursos Humanos' },
      detail: {
        en: 'Contact your Human Resources department (not your immediate supervisor) to request the FMLA Medical Certification form (WH-380-E). Have your treatment facility clinician complete it stating you require care for a serious health condition.',
        es: 'Contacte a Recursos Humanos (no a su supervisor directo) para solicitar el formulario de certificación médica FMLA (WH-380-E). Pida al médico del centro completarlo indicando que requiere atención por afección grave.',
      },
    });
  } else {
    nextSteps.push({
      priority: 'high',
      title: { en: 'Request ADA Medical Leave as a Reasonable Accommodation', es: 'Solicitar Licencia Médica ADA como Ajuste Razonable' },
      detail: {
        en: 'Even when not eligible for FMLA, employees in treatment can request unpaid medical leave or modified scheduling as a Reasonable Accommodation under the Americans with Disabilities Act.',
        es: 'Incluso sin calificar para FMLA, los empleados en tratamiento pueden solicitar licencia médica o ajuste de horario como Ajuste Razonable bajo la Ley ADA.',
      },
    });
  }

  if (prescribedMoud) {
    nextSteps.push({
      priority: 'high',
      title: { en: 'Prepare Prescription Documentation for Medical Review Officer', es: 'Preparar Documentación de Receta para el Oficial de Revisión Médica' },
      detail: {
        en: 'Keep your pharmacy bottle or doctor verification letter accessible. In the event of a workplace drug test, present this directly to the Medical Review Officer (MRO), who is required to report the result as negative once verified.',
        es: 'Tenga a mano el envase de su farmacia o carta del médico. En caso de prueba de drogas laboral, preséntela directamente al Oficial de Revisión Médica (MRO), quien debe certificarla como negativa.',
      },
    });
  }

  if (licensureFramework) {
    nextSteps.push({
      priority: 'immediate',
      title: { en: 'Confidential Consultation with State Alternative to Discipline Program', es: 'Consulta Confidencial con el Programa Alternativo a la Disciplina Estatal' },
      detail: {
        en: `Engage with your professional assistance program (${licensureFramework.programType}) before any formal disciplinary notice occurs. Self-referrals generally protect license records.`,
        es: `Consulte con el programa de asistencia profesional (${licensureFramework.programType}) antes de que surja una queja disciplinaria formal. Las autoreferencias suelen proteger la licencia.`,
      },
    });
  }

  return {
    evaluatedAt: new Date().toISOString(),
    inputs: { ...inputs, numTenure, numHours },
    fmla: {
      isQualified: isFmlaQualified,
      status: fmlaStatus,
      barriers: fmlaBarriers,
      maxWeeks: 12,
    },
    ada: {
      tier: adaProtectionTier,
      notes: adaNotes,
      hasMoudProtection: prescribedMoud,
    },
    licensureFramework,
    nextSteps,
  };
}

// ============================================================================
// 3. Ephemeral In-RAM State Management
// ============================================================================

let workplaceState = {
  employerSize: '50_plus',
  tenureMonths: 14,
  hoursWorkedLast12Months: 1300,
  treatmentStage: 'planning_treatment',
  prescribedMoud: true,
  jobCategory: 'general_office_service',
  activeTab: 'evaluator', // 'evaluator' | 'fmla_rules' | 'ada_rights' | 'licensure'
  lastEvaluation: null,
};

export function getWorkplaceState() {
  return { ...workplaceState };
}

export function setWorkplaceState(partial) {
  workplaceState = { ...workplaceState, ...partial };
  return getWorkplaceState();
}

export function resetWorkplaceState() {
  workplaceState = {
    employerSize: '50_plus',
    tenureMonths: 14,
    hoursWorkedLast12Months: 1300,
    treatmentStage: 'planning_treatment',
    prescribedMoud: true,
    jobCategory: 'general_office_service',
    activeTab: 'evaluator',
    lastEvaluation: null,
  };
  return getWorkplaceState();
}

// ============================================================================
// 4. Summary Text Formatter (Bilingual Copy/Print)
// ============================================================================

export function formatWorkplaceSummaryText(plan, lang = 'en') {
  if (!plan) return '';
  const isEs = lang === 'es';
  const divider = '======================================================================';
  const subDivider = '----------------------------------------------------------------------';

  const lines = [
    divider,
    isEs
      ? 'EVALUACIÓN DE DERECHOS LABORALES, FMLA Y ADA - HARBORPATH'
      : 'WORKPLACE RIGHTS, FMLA & ADA EVALUATION - HARBORPATH',
    isEs
      ? 'Asistencia epímera en memoria | Cero rastreo | Confidencial'
      : 'In-RAM Ephemeral Decision Support | Zero Tracking | Confidential',
    divider,
    '',
    `${isEs ? 'Elegibilidad FMLA' : 'FMLA Status'}: ${plan.fmla.isQualified ? (isEs ? 'ELEGIBLE (Hasta 12 semanas con protección laboral)' : 'QUALIFIED (Up to 12 weeks job-protected leave)') : (isEs ? 'NO ELEGIBLE FMLA (Consulte Ajustes Razonables ADA)' : 'NOT FMLA QUALIFIED (Use ADA Reasonable Accommodation)')}`,
    `${isEs ? 'Protección ADA' : 'ADA Protection Tier'}: ${plan.ada.tier.toUpperCase()}`,
    `${isEs ? 'MOUD Prescrito' : 'Prescribed MOUD'}: ${plan.ada.hasMoudProtection ? (isEs ? 'PROTEGIDO POR DERECHOS CIVILES DEL DOJ' : 'PROTECTED BY DOJ CIVIL RIGHTS GUIDANCE') : (isEs ? 'NO REPORTADO' : 'NOT REPORTED')}`,
    '',
    subDivider,
    isEs ? 'NOTAS CLÍNICAS Y LEGALES IDENTIFICADAS:' : 'LEGAL & CLINICAL ASSESSMENTS:',
    subDivider,
  ];

  plan.ada.notes.forEach((note) => {
    lines.push(`* ${isEs ? note.es : note.en}`);
  });

  if (plan.fmla.barriers.length > 0) {
    lines.push('');
    lines.push(isEs ? 'BARRERAS FMLA DETECTADAS:' : 'FMLA BARRIERS DETECTED:');
    plan.fmla.barriers.forEach((b) => {
      lines.push(`! ${isEs ? b.es : b.en}`);
    });
  }

  lines.push('');
  lines.push(subDivider);
  lines.push(isEs ? 'PLAN DE ACCIÓN RECOMENDADO:' : 'RECOMMENDED ACTION STEPS:');
  lines.push(subDivider);

  plan.nextSteps.forEach((st) => {
    lines.push(`[${st.priority.toUpperCase()}] ${isEs ? st.title.es : st.title.en}`);
    lines.push(`  ${isEs ? st.detail.es : st.detail.en}`);
    lines.push('');
  });

  lines.push(subDivider);
  lines.push(isEs ? 'GUÍA DE COMUNICACIÓN CON RECURSOS HUMANOS:' : 'HUMAN RESOURCES DISCLOSURE GUIDELINES:');
  lines.push(subDivider);
  lines.push(
    isEs
      ? '1. Comuníquese directamente con Recursos Humanos, no con su supervisor directo.'
      : '1. Contact Human Resources directly rather than your direct supervisor.'
  );
  lines.push(
    isEs
      ? '2. No está obligado a revelar su diagnóstico exacto; solo certifique la necesidad de tratamiento médico.'
      : '2. You are not required to disclose your exact diagnosis; certified medical need for treatment is sufficient.'
  );
  lines.push(
    isEs
      ? '3. Los expedientes médicos FMLA deben guardarse en archivos separados y confidenciales (29 CFR § 825.500(g)).'
      : '3. FMLA medical documentation must be kept in separate confidential files (29 CFR § 825.500(g)).'
  );
  lines.push('');
  lines.push(divider);

  return lines.join('\n');
}

// ============================================================================
// 5. DOM View: workplaceRightsView(containerOrOptions, maybeOptions)
// ============================================================================

export function workplaceRightsView(containerOrOptions = {}, maybeOptions = {}) {
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
  const plan = evaluateWorkplaceRights(getWorkplaceState());
  setWorkplaceState({ lastEvaluation: plan });

  const root = h('div', { class: 'workplace-rights-view' });

  // Page Header
  const header = pageHeader(
    isEs ? 'Derechos Laborales, FMLA y Licencias Profesionales' : 'Workplace Rights, FMLA & Professional Licensure',
    isEs
      ? 'Orientación legal sobre la Ley de Licencia Médica y Familiar (FMLA), protecciones de la ADA para medicamentos MOUD y programas alternativos a la disciplina para profesionales de la salud.'
      : 'Statutory guidance on FMLA job-protected medical leave, DOJ ADA Title I protections for prescribed MOUD, and confidential Alternative to Discipline programs.'
  );
  root.append(header);

  // In-RAM Privacy Callout
  const privacyAlert = h(
    'div',
    { class: 'panel alert-panel', role: 'note', 'aria-label': isEs ? 'Privacidad' : 'Privacy' },
    h('div', { class: 'panel-header' },
      icon('shield', { class: 'panel-icon' }),
      h('h2', { class: 'panel-title' }, isEs ? 'Asistencia Epímera en Memoria' : 'In-RAM Ephemeral Decision Support')
    ),
    h('p', { class: 'panel-body' },
      isEs
        ? 'Todas las selecciones se evalúan en la memoria temporal del navegador sin persistencia. No se registra información en el disco ni se envían datos a servidores externos.'
        : 'All selections are processed in temporary browser memory only without persistence. No answers are stored on disk or transmitted to external servers.'
    )
  );
  root.append(privacyAlert);

  // Tab Navigation
  const tabNav = h('div', { class: 'tab-bar', role: 'tablist', 'aria-label': isEs ? 'Secciones de derechos laborales' : 'Workplace rights sections' });
  const tabs = [
    { id: 'evaluator', label: isEs ? 'Evaluador de Derechos' : 'Rights Evaluator' },
    { id: 'fmla_rules', label: isEs ? 'Reglas FMLA' : 'FMLA Regulations' },
    { id: 'ada_rights', label: isEs ? 'Protecciones ADA y MOUD' : 'ADA & MOUD Rights' },
    { id: 'licensure', label: isEs ? 'Licencias Profesionales' : 'Professional Licensure' },
  ];

  const currentTab = workplaceState.activeTab;

  tabs.forEach((tab) => {
    const isSelected = tab.id === currentTab;
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `tab-btn-wr-${tab.id}`,
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-controls': `tab-panel-wr-${tab.id}`,
      class: isSelected ? 'tab active' : 'tab',
    }, tab.label);

    btn.addEventListener('click', () => {
      setWorkplaceState({ activeTab: tab.id });
      workplaceRightsView(container, options);
    });

    tabNav.append(btn);
  });
  root.append(tabNav);

  // Tab Panel
  const tabPanel = h('div', {
    id: `tab-panel-wr-${currentTab}`,
    role: 'tabpanel',
    'aria-labelledby': `tab-btn-wr-${currentTab}`,
    class: 'tab-content-panel',
  });

  // --------------------------------------------------------------------------
  // TAB 1: Rights Evaluator & Interactive Calculator
  // --------------------------------------------------------------------------
  if (currentTab === 'evaluator') {
    const formCard = h('div', { class: 'card assessment-card' });
    formCard.append(h('h3', { class: 'card-title' }, isEs ? 'Calculadora de Elegibilidad FMLA y ADA' : 'FMLA & ADA Workplace Rights Evaluator'));

    const formGrid = h('div', { class: 'form-grid' });

    // 1. Employer Size
    const empGroup = h('div', { class: 'form-group' });
    empGroup.append(h('label', { for: 'wr-employer-select' }, isEs ? 'Tamaño del Empleador:' : 'Employer Size / Entity:'));
    const empSelect = h('select', { id: 'wr-employer-select', class: 'input-select' });

    const empOpts = [
      { id: '50_plus', label: isEs ? '50+ empleados en 75 millas (Cubierto FMLA)' : '50+ employees within 75 miles (FMLA covered)' },
      { id: 'under_50', label: isEs ? 'Menos de 50 empleados (Exento FMLA federal)' : 'Under 50 employees (Exempt from federal FMLA)' },
      { id: 'public_agency', label: isEs ? 'Agencia Pública / Gobierno (Cubierto FMLA)' : 'Public Agency / Government (FMLA covered)' },
    ];

    empOpts.forEach((eo) => {
      const opt = h('option', { value: eo.id }, eo.label);
      if (eo.id === workplaceState.employerSize) opt.selected = true;
      empSelect.append(opt);
    });

    empSelect.addEventListener('change', (e) => {
      setWorkplaceState({ employerSize: e.target.value });
      workplaceRightsView(container, options);
    });
    empGroup.append(empSelect);
    formGrid.append(empGroup);

    // 2. Tenure Months
    const tenureGroup = h('div', { class: 'form-group' });
    tenureGroup.append(h('label', { for: 'wr-tenure-input' }, isEs ? 'Meses de Antigüedad Laboral:' : 'Months with Employer:'));
    const tenureInput = h('input', {
      type: 'number',
      id: 'wr-tenure-input',
      class: 'input-text',
      value: String(workplaceState.tenureMonths),
      min: '0',
      max: '480',
    });
    tenureInput.addEventListener('change', (e) => {
      setWorkplaceState({ tenureMonths: Number(e.target.value) || 0 });
      workplaceRightsView(container, options);
    });
    tenureGroup.append(tenureInput);
    formGrid.append(tenureGroup);

    // 3. Hours Worked
    const hoursGroup = h('div', { class: 'form-group' });
    hoursGroup.append(h('label', { for: 'wr-hours-input' }, isEs ? 'Horas Trabajadas en los Últimos 12 Meses:' : 'Hours in Past 12 Months:'));
    const hoursInput = h('input', {
      type: 'number',
      id: 'wr-hours-input',
      class: 'input-text',
      value: String(workplaceState.hoursWorkedLast12Months),
      min: '0',
      max: '4000',
    });
    hoursInput.addEventListener('change', (e) => {
      setWorkplaceState({ hoursWorkedLast12Months: Number(e.target.value) || 0 });
      workplaceRightsView(container, options);
    });
    hoursGroup.append(hoursInput);
    formGrid.append(hoursGroup);

    // 4. Treatment Stage
    const stageGroup = h('div', { class: 'form-group' });
    stageGroup.append(h('label', { for: 'wr-stage-select' }, isEs ? 'Etapa de Tratamiento Actual:' : 'Current Treatment Stage:'));
    const stageSelect = h('select', { id: 'wr-stage-select', class: 'input-select' });

    const stages = [
      { id: 'planning_treatment', label: isEs ? 'Planificando tratamiento / Evaluación médica' : 'Planning treatment / Medical evaluation' },
      { id: 'currently_inpatient_iop', label: isEs ? 'En tratamiento hospitalario o ambulatorio intensivo (IOP)' : 'Inpatient detox or intensive outpatient (IOP)' },
      { id: 'in_recovery_moud', label: isEs ? 'En recuperación / Tomando MOUD recetado' : 'In recovery / Taking prescribed MOUD' },
      { id: 'active_impairment', label: isEs ? 'Consumo activo (Aún sin ingresar a tratamiento)' : 'Active substance use (Not yet in treatment)' },
    ];

    stages.forEach((st) => {
      const opt = h('option', { value: st.id }, st.label);
      if (st.id === workplaceState.treatmentStage) opt.selected = true;
      stageSelect.append(opt);
    });

    stageSelect.addEventListener('change', (e) => {
      setWorkplaceState({ treatmentStage: e.target.value });
      workplaceRightsView(container, options);
    });
    stageGroup.append(stageSelect);
    formGrid.append(stageGroup);

    // 5. Job Category
    const catGroup = h('div', { class: 'form-group' });
    catGroup.append(h('label', { for: 'wr-cat-select' }, isEs ? 'Sector o Categoría Laboral:' : 'Job Sector / Profession:'));
    const catSelect = h('select', { id: 'wr-cat-select', class: 'input-select' });

    const cats = [
      { id: 'general_office_service', label: isEs ? 'General (Oficina, Servicios, Comercio)' : 'General (Office, Retail, Industry, Tech)' },
      { id: 'healthcare_licensed', label: isEs ? 'Salud con Licencia (Médico, Enfermero, Farmacéutico)' : 'Licensed Healthcare (MD, RN, Pharmacist)' },
      { id: 'dot_safety_sensitive', label: isEs ? 'Transporte DOT Crítico (Camionero, Conductor, Piloto)' : 'DOT Safety-Sensitive (CDL, Pilot, Transit)' },
    ];

    cats.forEach((c) => {
      const opt = h('option', { value: c.id }, c.label);
      if (c.id === workplaceState.jobCategory) opt.selected = true;
      catSelect.append(opt);
    });

    catSelect.addEventListener('change', (e) => {
      setWorkplaceState({ jobCategory: e.target.value });
      workplaceRightsView(container, options);
    });
    catGroup.append(catSelect);
    formGrid.append(catGroup);

    formCard.append(formGrid);
    tabPanel.append(formCard);

    // Results Box
    const resultsCard = h('div', { class: 'card results-card' });

    // FMLA Badge & Summary
    const fmlaBox = h('div', { class: 'fmla-status-box' });
    const fmlaBadge = h('span', { class: `badge badge-${plan.fmla.isQualified ? 'approved' : 'neutral'}` },
      plan.fmla.isQualified
        ? (isEs ? '✓ ELEGIBLE PARA LICENCIA FMLA (12 SEMANAS)' : '✓ FMLA QUALIFIED (UP TO 12 WEEKS)')
        : (isEs ? 'NO ELEGIBLE FMLA (USAR AJUSTE RAZONABLE ADA)' : 'NOT FMLA ELIGIBLE (USE ADA REASONABLE ACCOMMODATION)')
    );
    fmlaBox.append(fmlaBadge);

    if (plan.fmla.barriers.length > 0) {
      const bList = h('ul', { class: 'barrier-list' });
      plan.fmla.barriers.forEach((b) => bList.append(h('li', {}, isEs ? b.es : b.en)));
      fmlaBox.append(bList);
    }
    resultsCard.append(fmlaBox);

    // ADA & MOUD Highlights
    const adaBox = h('div', { class: 'ada-status-box' });
    adaBox.append(h('h4', {}, isEs ? 'Protecciones de la ADA e Indicaciones de Derechos Civiles:' : 'ADA & Civil Rights Guidance:'));
    const aList = h('ul', { class: 'bullet-list' });
    plan.ada.notes.forEach((note) => aList.append(h('li', {}, isEs ? note.es : note.en)));
    adaBox.append(aList);
    resultsCard.append(adaBox);

    // Recommended Action Steps
    const stepsBox = h('div', { class: 'action-steps-box' });
    stepsBox.append(h('h4', {}, isEs ? 'Pasos de Acción Recomendados:' : 'Recommended Action Steps:'));

    plan.nextSteps.forEach((st) => {
      const sRow = h('div', { class: `action-step-item priority-${st.priority}` });
      sRow.append(h('strong', {}, isEs ? st.title.es : st.title.en));
      sRow.append(h('p', {}, isEs ? st.detail.es : st.detail.en));
      stepsBox.append(sRow);
    });
    resultsCard.append(stepsBox);

    // Buttons
    const btnRow = h('div', { class: 'btn-row' });
    const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' },
      icon('copy'),
      isEs ? ' Copiar Plan de Derechos Laborales' : ' Copy Workplace Plan'
    );
    copyBtn.addEventListener('click', async () => {
      const text = formatWorkplaceSummaryText(plan, lang);
      try {
        await navigator.clipboard.writeText(text);
        announce(isEs ? 'Plan copiado al portapapeles' : 'Plan copied to clipboard');
        copyBtn.textContent = isEs ? '✓ ¡Copiado!' : '✓ Copied!';
        setTimeout(() => {
          copyBtn.textContent = isEs ? ' Copiar Plan de Derechos Laborales' : ' Copy Workplace Plan';
        }, 3000);
      } catch {
        announce(isEs ? 'Error al copiar' : 'Clipboard write failed');
      }
    });
    btnRow.append(copyBtn);

    resultsCard.append(btnRow);
    tabPanel.append(resultsCard);
  }

  // --------------------------------------------------------------------------
  // TAB 2: FMLA Regulations
  // --------------------------------------------------------------------------
  else if (currentTab === 'fmla_rules') {
    const fmlaCard = h('div', { class: 'card fmla-card' });
    fmlaCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Reglamentación Federal de la Ley FMLA para Tratamiento de Adicciones' : 'Federal FMLA Regulations for Substance Use Treatment'
    ));

    FMLA_REGULATORY_RULES.forEach((rule) => {
      const sec = h('div', { class: 'regulatory-section' });
      sec.append(h('h4', {}, isEs ? rule.title.es : rule.title.en));
      sec.append(h('span', { class: 'legal-citation' }, rule.statute));
      sec.append(h('p', {}, isEs ? rule.summary.es : rule.summary.en));

      const distBox = h('p', { class: 'key-distinction' },
        h('strong', {}, isEs ? 'Distinción Esencial: ' : 'Key Statutory Distinction: '),
        isEs ? rule.keyDistinction.es : rule.keyDistinction.en
      );
      sec.append(distBox);

      fmlaCard.append(sec);
    });

    tabPanel.append(fmlaCard);
  }

  // --------------------------------------------------------------------------
  // TAB 3: ADA Protections & MOUD Rights
  // --------------------------------------------------------------------------
  else if (currentTab === 'ada_rights') {
    const adaCard = h('div', { class: 'card ada-card' });
    adaCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Protecciones de la ADA para Personas en Recuperación y MOUD' : 'ADA Disability Protections for Recovery & MOUD'
    ));

    ADA_PROTECTION_STANDARDS.forEach((std) => {
      const sec = h('div', { class: 'regulatory-section' });
      sec.append(h('h4', {}, isEs ? std.title.es : std.title.en));
      sec.append(h('span', { class: 'legal-citation' }, std.statute));
      sec.append(h('p', {}, isEs ? std.summary.es : std.summary.en));

      const adviceBox = h('p', { class: 'key-advice' },
        h('strong', {}, isEs ? 'Consejo Práctico: ' : 'Practical Guidance: '),
        isEs ? std.actionAdvice.es : std.actionAdvice.en
      );
      sec.append(adviceBox);

      adaCard.append(sec);
    });

    // Sample MRO Script Template
    const scriptBox = h('div', { class: 'template-box' });
    scriptBox.append(h('h4', {}, isEs ? 'Guía para Comunicación con el Oficial de Revisión Médica (MRO):' : 'Medical Review Officer (MRO) Verification Script:'));
    const scriptText = h('pre', { class: 'code-snippet' },
      isEs
        ? `Al Oficial de Revisión Médica (MRO):
"Estoy proporcionando verificación de una receta médica válida y actual emitida por un profesional de la salud con licencia para buprenorfina / metadona para el tratamiento del trastorno por uso de opioides.
De acuerdo con las directrices de la ADA y la EEOC, solicito la verificación de esta prescripción para que el resultado de la prueba de detección se reporte como NEGATIVO a mi empleador."`
        : `To the Medical Review Officer (MRO):
"I am providing verification of a valid, active prescription issued by a licensed medical clinician for buprenorphine / methadone for opioid use disorder treatment.
In accordance with ADA Title I and EEOC enforcement guidance, I request verification of this legitimate prescription so that this drug screen is reported as a NEGATIVE result to my employer."`
    );
    scriptBox.append(scriptText);
    adaCard.append(scriptBox);

    tabPanel.append(adaCard);
  }

  // --------------------------------------------------------------------------
  // TAB 4: Professional Licensure & Alternative to Discipline (ATD)
  // --------------------------------------------------------------------------
  else if (currentTab === 'licensure') {
    const licCard = h('div', { class: 'card licensure-card' });
    licCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Programas Alternativos a la Disciplina (ATD) para Profesionales con Licencia' : 'Alternative to Discipline (ATD) & Safety-Sensitive Protocols'
    ));

    PROFESSIONAL_LICENSURE_FRAMEWORKS.forEach((fw) => {
      const sec = h('div', { class: 'regulatory-section' });
      sec.append(h('h4', {}, isEs ? fw.title.es : fw.title.en));
      sec.append(h('span', { class: 'legal-citation' }, `${fw.programType} | ${fw.statute}`));
      sec.append(h('p', {}, isEs ? fw.guidance.es : fw.guidance.en));

      const advBox = h('p', { class: 'key-advice' },
        h('strong', {}, isEs ? 'Consejo Esencial: ' : 'Critical Advice: '),
        isEs ? fw.keyAdvice.es : fw.keyAdvice.en
      );
      sec.append(advBox);

      licCard.append(sec);
    });

    tabPanel.append(licCard);
  }

  root.append(tabPanel);

  // Crisis / Help Line Footer
  const oshaSharpsCard = h('div', { class: 'info-callout', role: 'note' },
    h('strong', {}, isEs ? '¿Lesión por objeto cortopunzante o pinchazo de aguja en el trabajo? ' : 'Workplace needle stick or sharps injury? '),
    h('span', {}, isEs
      ? 'La Norma OSHA 29 CFR § 1910.1030 garantiza evaluación médica inmediata y PEP completa sin ningún costo para el trabajador: '
      : 'OSHA 29 CFR § 1910.1030 mandates immediate medical evaluation and complete 28-day PEP at 100% employer cost: '),
    h('a', { href: '#/needle-exposure' }, isEs
      ? 'Abrir Protocolo de Pinchazos y Derechos OSHA →'
      : 'Open Needle Stick & OSHA PEP Rights →')
  );
  root.append(oshaSharpsCard);

  const hotlineBar = h('div', { class: 'emergency-hotline-bar' },
    h('div', { class: 'hotline-item' },
      h('strong', {}, isEs ? 'Línea de Ayuda SAMHSA:' : 'SAMHSA National Helpline:'),
      h('span', {}, ' '),
      tel('800-662-4357', null, { class: 'hotline-link' })
    ),
    h('div', { class: 'hotline-item' },
      h('strong', {}, isEs ? 'Línea de Crisis 988:' : '988 Suicide & Crisis Lifeline:'),
      h('span', {}, ' '),
      tel('988', null, { class: 'hotline-link' })
    )
  );
  root.append(hotlineBar);

  if (container) container.append(root);
  return root;
}

