/**
 * Adolescent & Youth Substance Use Care Pathways & Legal Guide (public/js/views/adolescentCare.js)
 *
 * Comprehensive, trauma-informed, developmentally adapted clinical and legal guidance
 * for adolescents (ages 12–17) and young adults (ages 18–25):
 *
 * 1. Minor Consent Laws for Substance Use Disorder Treatment:
 *    - In many U.S. states, minors have statutory authority to consent to confidential
 *      outpatient substance use disorder counseling, diagnosis, and medical care without
 *      parental notification or consent.
 *    - Jurisdictional variations: age 12 (CA, IL, CO, MA), age 13 (WA), age 14 (OR, ID, MI, PA),
 *      age 16 (TX, MD), and mature minor doctrine states.
 *    - Inpatient/residential treatment almost universally requires parental/guardian consent
 *      or a court order.
 *    - Emergency care exception for life-threatening intoxication or acute overdose.
 *
 * 2. Federal Confidentiality Protections under 42 CFR Part 2 § 2.14 & HIPAA 45 CFR § 164.522:
 *    - Under 42 CFR Part 2 § 2.14, when a minor has legal capacity under state law to obtain
 *      treatment, the minor's written consent is mandatory before any disclosure can be made
 *      to parents or guardians.
 *    - Insurance Explanation of Benefits (EOB) risk: commercial billing statements sent to the
 *      primary policyholder (parent) can inadvertently disclose sensitive SUD diagnostic and
 *      procedure codes.
 *    - Mitigation rights: requesting confidential communications under HIPAA 45 CFR § 164.522(b)
 *      or utilizing Title X, HRSA Federally Qualified Health Centers (FQHCs), or sliding-fee
 *      safety-net clinics that bypass private insurance entirely.
 *
 * 3. Youth-Adapted ASAM Criteria (Dimensions 1–6):
 *    - Dimension 1: Acute withdrawal risk & intoxication (adolescent physiology, rapid progression,
 *      polysubstance dynamics masking withdrawal).
 *    - Dimension 2: Biomedical conditions (neurodevelopment, prefrontal cortex maturation until ~25,
 *      nutritional status, sleep architecture).
 *    - Dimension 3: Emotional, behavioral, and cognitive conditions (high prevalence of ADHD,
 *      trauma/PTSD from ACEs, conduct challenges, depression, anxiety, suicidality).
 *    - Dimension 4: Readiness to change (developmentally adapted stages of change, meeting youth
 *      where they are without punitive mandates, non-confrontational harm reduction).
 *    - Dimension 5: Relapse / continued use potential (peer pressure, impulsivity, social media craving cues).
 *    - Dimension 6: Recovery environment (school, family conflict, juvenile justice, housing instability).
 *
 * 4. Evidence-Based Interventions for Adolescents & Young Adults:
 *    - Adolescent Community Reinforcement Approach (A-CRA)
 *    - Multidimensional Family Therapy (MDFT)
 *    - Brief Intervention and Motivational Interviewing (SBIRT / MET / CRAFFT / S2BI)
 *    - Youth Contingency Management
 *    - Youth Peer Support, MARA & SMART Recovery Youth
 *    - Medications for Opioid Use Disorder (MOUD) in Adolescents (AAP & ASAM recommendations)
 *
 * 5. Youth Harm Reduction & Crisis Intervention:
 *    - Fentanyl test strip (FTS) dilution protocols for counterfeit pills ("blues") and stimulants
 *      (1 tsp / 5 mL water per 10 mg substance to prevent false positives).
 *    - Naloxone possession rights (OTC in all 50 states) and Good Samaritan 911 protections for youth.
 *    - Never Use Alone (1-877-696-1996) and crisis texting (Crisis Text Line: 741741, 988, Trevor Project: 866-488-7386).
 *
 * 6. Interactive Ephemeral Assessment / Decision Aid & Printable Handout:
 *    - Ephemeral in-RAM state tracking (zero device storage, session storage, or cookies).
 *    - evaluateYouthCarePathway(inputs) decision logic engine.
 *    - Appointment preparation checklist and notes.
 *    - Printable, high-contrast, WCAG 2.2 AA compliant clinical handout.
 *
 * Strict Invariants:
 * - Zero npm dependencies (Node 20+ built-ins only).
 * - Zero raw markup injections (uses h() builder from dom.js).
 * - 100% ephemeral in-RAM state (answers exist strictly in temporary browser RAM).
 * - Quick Exit (resetAdolescentState()) cleanly wipes all in-RAM state.
 * - Complete en/es bilingual parity.
 */

import { h, clear, ext, tel, sms, icon, announce } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong } from './common.js';
import { getLang } from '../i18n.js';

// ============================================================================
// 1. Minor Consent Standards & State Legal Registry Data
// ============================================================================

const MINOR_CONSENT_DATA = [
  {
    id: 'federal_framework',
    category: 'federal',
    title: {
      en: 'Federal Framework: Intersecting State Consent & Federal Privacy (42 CFR Part 2)',
      es: 'Marco Federal: Intersección entre Consentimiento Estatal y Privacidad (42 CFR Parte 2)',
    },
    summary: {
      en: 'Under federal law, authority to consent to substance use disorder treatment is governed primarily by state statute. However, once a state confers capacity to consent upon a minor, federal regulations under 42 CFR Part 2 § 2.14 provide strict confidentiality protections: no records or treatment details may be disclosed to parents or legal guardians without the minor’s explicit written consent.',
      es: 'Según la ley federal, la capacidad legal de un menor para consentir tratamiento depende de las leyes estatales. Sin embargo, una vez que el estado otorga esa capacidad, el reglamento federal 42 CFR Parte 2 § 2.14 prohíbe revelar registros o información a los padres o tutores sin el consentimiento por escrito del menor.',
    },
    keyPoints: [
      {
        topic: {
          en: 'State Authority Sets Capacity',
          es: 'La ley estatal determina la capacidad',
        },
        detail: {
          en: 'Every state determines the age threshold (typically 12–16) at which minors can independently consent to outpatient diagnosis, counseling, and medical treatment for substance use.',
          es: 'Cada estado determina la edad mínima (generalmente entre 12 y 16 años) a partir de la cual los menores pueden consentir de forma independiente a diagnóstico, terapia y atención médica ambulatoria por uso de sustancias.',
        },
      },
      {
        topic: {
          en: 'Outpatient vs. Inpatient Admission',
          es: 'Atención ambulatoria frente a internamiento residencial',
        },
        detail: {
          en: 'Minor consent statutes almost universally apply to voluntary outpatient therapy and ambulatory medical care. Residential or inpatient rehabilitation almost always requires parental/guardian consent or a court order.',
          es: 'Las leyes de consentimiento de menores aplican primordialmente a terapia ambulatoria voluntaria. El internamiento residencial casi siempre requiere el consentimiento de los padres, tutores o una orden judicial.',
        },
      },
      {
        topic: {
          en: 'Emergency Medical Care Doctrine',
          es: 'Doctrina de atención médica de emergencia',
        },
        detail: {
          en: 'In acute life-threatening emergencies (e.g. opioid overdose, severe acute poisoning, altered mental status), healthcare providers are legally mandated to render emergency medical treatment immediately without prior parental consent.',
          es: 'En emergencias que amenazan la vida (sobredosis por opioides, intoxicación aguda severa), los profesionales de la salud tienen la obligación legal de brindar atención de inmediato sin requerir consentimiento parental previo.',
        },
      },
    ],
    citation: '42 CFR § 2.14; Emergency Medical Treatment and Labor Act (EMTALA) 42 U.S.C. § 1395dd',
  },
  {
    id: 'CA',
    category: 'state',
    stateCode: 'CA',
    stateName: { en: 'California', es: 'California' },
    minAge: 12,
    statuteCitation: 'Cal. Health & Safety Code § 124260; Cal. Family Code § 6929',
    title: {
      en: 'California: Age 12+ Independent Outpatient Consent',
      es: 'California: Consentimiento Ambulatorio Independiente a partir de los 12 años',
    },
    summary: {
      en: 'A minor age 12 or older may consent to outpatient medical care and counseling related to the diagnosis and treatment of a drug or alcohol-related problem if the professional determines the minor is mature enough to participate intelligently. Parental consent is not required.',
      es: 'Los menores de 12 años o más pueden consentir a atención médica y asesoramiento ambulatorio para el diagnóstico y tratamiento de problemas relacionados con drogas o alcohol si el profesional determina que tienen madurez para participar de manera inteligente. No se requiere consentimiento de los padres.',
    },
    inpatientRule: {
      en: 'Inpatient or residential treatment requires parental or guardian consent or juvenile court authorization.',
      es: 'El internamiento o tratamiento residencial requiere el consentimiento de los padres, tutores o una orden judicial juvenil.',
    },
    parentalNotice: {
      en: 'Parental involvement is encouraged only if clinically appropriate and safe; notice cannot be given without minor consent unless necessary to avert serious harm.',
      es: 'La participación de los padres se alienta solo si es clínicamente apropiada y segura; no se puede notificar a los padres sin el consentimiento del menor salvo riesgo inminente de daño grave.',
    },
  },
  {
    id: 'WA',
    category: 'state',
    stateCode: 'WA',
    stateName: { en: 'Washington', es: 'Washington' },
    minAge: 13,
    statuteCitation: 'RCW 71.34.500; RCW 71.34.530',
    title: {
      en: 'Washington: Age 13+ Independent Behavioral Health Consent',
      es: 'Washington: Consentimiento en Salud Mental y Adicciones a partir de los 13 años',
    },
    summary: {
      en: 'Under Washington law (RCW 71.34.530), any minor age 13 or older may consent on their own behalf to outpatient substance use disorder treatment and mental health counseling. Parental consent is not required.',
      es: 'Bajo la ley de Washington (RCW 71.34.530), cualquier menor de 13 años o más puede consentir por sí mismo a tratamiento ambulatorio de trastornos por uso de sustancias y salud mental sin necesidad de consentimiento parental.',
    },
    inpatientRule: {
      en: 'Inpatient residential treatment generally requires parental application, adolescent consent, or Family Initiated Treatment (FIT) protocols.',
      es: 'El internamiento residencial generalmente requiere solicitud de los padres, consentimiento del adolescente o protocolos de Tratamiento Iniciado por la Familia (FIT).',
    },
    parentalNotice: {
      en: 'Clinics cannot disclose treatment to parents without the minor’s explicit written release under RCW 71.34 and 42 CFR Part 2.',
      es: 'Las clínicas no pueden revelar el tratamiento a los padres sin la autorización escrita explícita del menor.',
    },
  },
  {
    id: 'OR',
    category: 'state',
    stateCode: 'OR',
    stateName: { en: 'Oregon', es: 'Oregón' },
    minAge: 14,
    statuteCitation: 'ORS 109.675',
    title: {
      en: 'Oregon: Age 14+ Outpatient Mental Health & Chemical Dependency Consent',
      es: 'Oregón: Consentimiento a partir de los 14 años en Salud Mental y Dependencia Química',
    },
    summary: {
      en: 'A minor 14 years of age or older may obtain, without parental knowledge or consent, outpatient diagnosis and treatment of a mental or emotional disorder or chemical dependency provided by a physician, physician assistant, nurse practitioner, or licensed mental health professional.',
      es: 'Un menor de 14 años o más puede obtener, sin el conocimiento ni consentimiento de los padres, diagnóstico y tratamiento ambulatorio por dependencia química o problemas emocionales con un médico o profesional de salud mental autorizado.',
    },
    inpatientRule: {
      en: 'Parental consent is required for inpatient hospitalization unless admitted under independent youth crisis statutes.',
      es: 'Se requiere consentimiento parental para hospitalización residencial salvo bajo leyes de crisis juvenil independiente.',
    },
    parentalNotice: {
      en: 'Provider may not disclose records without written consent of the minor, unless there is clear risk of suicide or imminent bodily harm.',
      es: 'El proveedor no puede revelar expedientes sin consentimiento escrito del menor, salvo riesgo inminente de suicidio o daño físico grave.',
    },
  },
  {
    id: 'IL',
    category: 'state',
    stateCode: 'IL',
    stateName: { en: 'Illinois', es: 'Illinois' },
    minAge: 12,
    statuteCitation: '410 ILCS 210/4 (Consent by Minors to Medical Operations Act)',
    title: {
      en: 'Illinois: Age 12+ Medical Care & Counseling for Substance Use',
      es: 'Illinois: Atención Médica y Asesoramiento a partir de los 12 años para Uso de Sustancias',
    },
    summary: {
      en: 'Any minor 12 years of age or older who is an alcoholic or has a drug addiction may give consent to the furnishing of medical care or counseling related to diagnosis or treatment by a licensed physician or healthcare facility.',
      es: 'Cualquier menor de 12 años o más con problemas de alcohol o drogas puede otorgar consentimiento para recibir atención médica o asesoramiento relacionado con el diagnóstico o tratamiento por un médico o centro de salud.',
    },
    inpatientRule: {
      en: 'Inpatient admission for minors typically requires parental consent or judicial review under 405 ILCS 5/3-503.',
      es: 'La admisión a internamiento para menores requiere típicamente consentimiento parental o revisión judicial.',
    },
    parentalNotice: {
      en: 'Physician may not disclose treatment without minor consent, except when life or health is seriously jeopardized.',
      es: 'El médico no puede revelar el tratamiento sin el consentimiento del menor, excepto cuando la vida o la salud estén en peligro grave.',
    },
  },
  {
    id: 'NY',
    category: 'state',
    stateCode: 'NY',
    stateName: { en: 'New York', es: 'Nueva York' },
    minAge: 12,
    statuteCitation: 'NY Mental Hygiene Law § 22.11',
    title: {
      en: 'New York: Age 12+ / Mature Minor Outpatient Chemical Dependence Services',
      es: 'Nueva York: Servicios Ambulatorios a partir de los 12 años / Menor Maduro',
    },
    summary: {
      en: 'In New York, a minor may consent to outpatient chemical dependence services. A physician or provider may provide care if the minor has capacity and seeking parental consent would be detrimental or if parents are unavailable.',
      es: 'En Nueva York, un menor puede consentir a servicios ambulatorios por dependencia química si tiene capacidad y la participación parental sería perjudicial o los padres no están disponibles.',
    },
    inpatientRule: {
      en: 'Inpatient treatment requires parental consent or specialized clinical waiver under OASAS regulations.',
      es: 'El tratamiento de internamiento requiere consentimiento de los padres o exención clínica bajo normativas de OASAS.',
    },
    parentalNotice: {
      en: 'Notice prohibited without minor’s written consent under NY MHL § 22.11 and 42 CFR Part 2.',
      es: 'La notificación a los padres está prohibida sin el consentimiento escrito del menor.',
    },
  },
  {
    id: 'TX',
    category: 'state',
    stateCode: 'TX',
    stateName: { en: 'Texas', es: 'Texas' },
    minAge: 16,
    statuteCitation: 'Tex. Family Code § 32.003(a)(3)–(4)',
    title: {
      en: 'Texas: Age 16+ or Chemical Addiction Outpatient Consent',
      es: 'Texas: Consentimiento a partir de los 16 años o Dependencia Química',
    },
    summary: {
      en: 'Under Texas Family Code § 32.003, a child may consent to medical treatment related to chemical addiction or dependency, or if the minor is 16 years of age or older and managing their own affairs. Licensed programs can provide outpatient SUD care directly.',
      es: 'Bajo el Código Familiar de Texas § 32.003, un menor puede consentir al tratamiento de adicción o dependencia química, o si tiene 16 años o más y vive de forma independiente.',
    },
    inpatientRule: {
      en: 'Inpatient rehabilitation requires parental/guardian consent or court commitment under Texas Health & Safety Code Chapter 462.',
      es: 'La rehabilitación en régimen de internamiento requiere el consentimiento de los padres o tutores.',
    },
    parentalNotice: {
      en: 'Healthcare provider cannot disclose without minor consent under federal 42 CFR Part 2 rules.',
      es: 'El proveedor de salud no puede divulgar información sin el consentimiento del menor bajo 42 CFR Parte 2.',
    },
  },
  {
    id: 'FL',
    category: 'state',
    stateCode: 'FL',
    stateName: { en: 'Florida', es: 'Florida' },
    minAge: 12,
    statuteCitation: 'Fla. Stat. § 397.601 (Marchman Act Voluntary Outpatient Provision)',
    title: {
      en: 'Florida: Voluntary Outpatient Services Without Parental Consent',
      es: 'Florida: Servicios Ambulatorios Voluntarios sin Consentimiento Parental',
    },
    summary: {
      en: 'Under Florida Statute § 397.601, any minor may give consent to voluntary outpatient services for substance abuse impairment without the consent of parents or legal guardians.',
      es: 'Bajo el Estatuto de Florida § 397.601, cualquier menor puede otorgar consentimiento para servicios ambulatorios voluntarios por abuso de sustancias sin el consentimiento de sus padres o tutores legales.',
    },
    inpatientRule: {
      en: 'Residential or inpatient placement under the Marchman Act requires parental application or court proceeding.',
      es: 'La colocación residencial o internamiento bajo la Ley Marchman requiere solicitud de los padres o procedimiento judicial.',
    },
    parentalNotice: {
      en: 'Service providers are bound by 42 CFR Part 2; minor written consent is required for disclosure.',
      es: 'Los proveedores están obligados por 42 CFR Parte 2; se requiere consentimiento del menor.',
    },
  },
  {
    id: 'MD',
    category: 'state',
    stateCode: 'MD',
    stateName: { en: 'Maryland', es: 'Maryland' },
    minAge: 12,
    statuteCitation: 'Md. Code Ann., Health-Gen. § 20-102(c)(1)',
    title: {
      en: 'Maryland: Minor Capacity to Consent to Drug & Alcohol Treatment',
      es: 'Maryland: Capacidad del Menor para Consentir a Tratamiento de Alcohol y Drogas',
    },
    summary: {
      en: 'Under Maryland law, a minor has the same capacity as an adult to consent to medical treatment or advice about drug abuse or alcoholism. The minor can receive confidential outpatient care.',
      es: 'Bajo la ley de Maryland, un menor tiene la misma capacidad que un adulto para consentir a tratamiento o asesoramiento médico sobre abuso de drogas o alcohol.',
    },
    inpatientRule: {
      en: 'Inpatient admission of minors generally requires parental consent or administrative hearing.',
      es: 'El internamiento generalmente requiere consentimiento parental o audiencia administrativa.',
    },
    parentalNotice: {
      en: 'Physician may inform parent only if needed for treatment and after advising minor, but 42 CFR Part 2 federal rule preempts state permissive disclosure if clinic is federally assisted.',
      es: 'La norma federal 42 CFR Parte 2 prevalece y prohíbe divulgar sin el consentimiento del menor si la clínica recibe asistencia federal.',
    },
  },
  {
    id: 'MA',
    category: 'state',
    stateCode: 'MA',
    stateName: { en: 'Massachusetts', es: 'Massachusetts' },
    minAge: 12,
    statuteCitation: 'M.G.L. c. 112 § 12E',
    title: {
      en: 'Massachusetts: Age 12+ Drug Dependency Treatment Consent',
      es: 'Massachusetts: Consentimiento para Dependencia de Drogas a partir de los 12 años',
    },
    summary: {
      en: 'A minor 12 years of age or older who is found to be drug dependent by a physician may consent to medical care and counseling for diagnosis or treatment of such drug dependency without parental consent.',
      es: 'Un menor de 12 años o más diagnosticado con dependencia de drogas puede consentir a atención médica y asesoramiento para diagnóstico o tratamiento sin el consentimiento de sus padres.',
    },
    inpatientRule: {
      en: 'Inpatient rehabilitation requires parental/guardian consent or juvenile court order.',
      es: 'La rehabilitación en régimen de internamiento requiere consentimiento de los padres o una orden judicial.',
    },
    parentalNotice: {
      en: 'Strictly confidential under federal 42 CFR Part 2 and Massachusetts privacy law.',
      es: 'Estrictamente confidencial bajo la ley federal 42 CFR Parte 2 y la ley de Massachusetts.',
    },
  },
  {
    id: 'PA',
    category: 'state',
    stateCode: 'PA',
    stateName: { en: 'Pennsylvania', es: 'Pensilvania' },
    minAge: 14,
    statuteCitation: '35 P.S. § 10101.1; Act 147',
    title: {
      en: 'Pennsylvania: Age 14+ Outpatient Mental Health & SUD Consent',
      es: 'Pensilvania: Consentimiento a partir de los 14 años en Salud Mental y Adicciones',
    },
    summary: {
      en: 'Under Act 147, minors age 14 or older may independently consent to outpatient examination and treatment for mental health and substance use disorders without parental consent.',
      es: 'Bajo la Ley 147, los menores de 14 años o más pueden consentir de forma independiente a evaluación y tratamiento ambulatorio sin consentimiento de los padres.',
    },
    inpatientRule: {
      en: 'Inpatient admission can be initiated by parents or minors age 14+ with independent medical review.',
      es: 'El internamiento puede ser iniciado por los padres o por menores de 14 años con revisión médica independiente.',
    },
    parentalNotice: {
      en: 'Parents cannot access outpatient records without minor written authorization.',
      es: 'Los padres no pueden acceder a los registros ambulatorios sin autorización escrita del menor.',
    },
  },
  {
    id: 'CO',
    category: 'state',
    stateCode: 'CO',
    stateName: { en: 'Colorado', es: 'Colorado' },
    minAge: 12,
    statuteCitation: 'C.R.S. § 27-80-109; C.R.S. § 12-245-203.5',
    title: {
      en: 'Colorado: Age 12+ Outpatient Addiction & Psychotherapy Consent',
      es: 'Colorado: Consentimiento a partir de los 12 años para Adicciones y Psicoterapia',
    },
    summary: {
      en: 'Minors age 12 and older may consent to outpatient addiction treatment and mental health counseling without the consent of a parent or guardian.',
      es: 'Los menores de 12 años o más pueden consentir a tratamiento ambulatorio de adicciones y asesoramiento de salud mental sin consentimiento de sus padres.',
    },
    inpatientRule: {
      en: 'Inpatient admission requires parental consent or emergency mental health hold.',
      es: 'El internamiento requiere consentimiento parental o retención de emergencia en salud mental.',
    },
    parentalNotice: {
      en: 'Parental notification is restricted unless minor consents or there is severe risk of death or self-harm.',
      es: 'La notificación a los padres está restringida salvo consentimiento del menor o riesgo inminente de muerte.',
    },
  },
  {
    id: 'MI',
    category: 'state',
    stateCode: 'MI',
    stateName: { en: 'Michigan', es: 'Míchigan' },
    minAge: 14,
    statuteCitation: 'MCL 333.6121',
    title: {
      en: 'Michigan: Age 14+ Outpatient Substance Abuse Treatment Consent',
      es: 'Míchigan: Consentimiento a partir de los 14 años para Tratamiento de Sustancias',
    },
    summary: {
      en: 'A minor 14 years of age or older may consent to outpatient substance abuse treatment and rehabilitation services provided by an approved program without parental consent.',
      es: 'Un menor de 14 años o más puede consentir a servicios ambulatorios de tratamiento y rehabilitación por abuso de sustancias sin consentimiento parental.',
    },
    inpatientRule: {
      en: 'Residential services require parental consent or court order.',
      es: 'Los servicios residenciales requieren consentimiento parental o una orden judicial.',
    },
    parentalNotice: {
      en: 'Treatment provider cannot notify parents without minor’s written consent under MCL 333.6121(4).',
      es: 'El proveedor de tratamiento no puede notificar a los padres sin el consentimiento escrito del menor.',
    },
  },
  {
    id: 'default',
    category: 'national',
    title: {
      en: 'General U.S. Standards: Mature Minor Doctrine & Inpatient Thresholds',
      es: 'Estándares Generales en EE. UU.: Doctrina del Menor Maduro y Umbrales Residenciales',
    },
    summary: {
      en: 'In jurisdictions without explicit statutory age floors for substance use treatment, courts recognize the Mature Minor Doctrine: minors demonstrating sufficient intelligence, maturity, and understanding of the risks and benefits can consent to necessary outpatient medical care. Regardless of state, inpatient residential care almost universally requires legal guardian consent.',
      es: 'En estados sin una edad mínima estipulada explícitamente para tratamiento de adicciones, los tribunales reconocen la Doctrina del Menor Maduro: los menores con suficiente discernimiento y comprensión de los riesgos y beneficios pueden consentir a la atención ambulatoria necesaria. En casi todos los estados, el internamiento residencial exige consentimiento legal de los tutores.',
    },
    keyPoints: [
      {
        topic: {
          en: 'Mature Minor Doctrine',
          es: 'Doctrina del Menor Maduro',
        },
        detail: {
          en: 'Clinicians assess the adolescent’s developmental capacity, comprehension of treatment options, and rationale before accepting minor consent in common-law jurisdictions.',
          es: 'Los médicos evalúan la capacidad de desarrollo del adolescente, la comprensión de las opciones de tratamiento y el razonamiento antes de aceptar el consentimiento del menor.',
        },
      },
      {
        topic: {
          en: 'Inpatient / Residential Care Safeguards',
          es: 'Salvaguardas de internamiento residencial',
        },
        detail: {
          en: 'Because residential treatment involves physical custody, bed placement, and round-the-clock detention, parents or legal guardians must be involved unless emancipated or court-ordered.',
          es: 'Dado que el tratamiento residencial implica custodia física y permanencia las 24 horas, los padres o tutores legales deben participar, a menos que el menor esté emancipado o exista orden judicial.',
        },
      },
    ],
    citation: 'American Academy of Pediatrics Policy: Consent for Emergency Medical Services for Children and Adolescents',
  },
];

export const MINOR_CONSENT_STANDARDS = [...MINOR_CONSENT_DATA];
for (const item of MINOR_CONSENT_DATA) {
  MINOR_CONSENT_STANDARDS[item.id] = item;
}

// ============================================================================
// 2. Federal Confidentiality Rights under 42 CFR Part 2 § 2.14 & HIPAA
// ============================================================================

const CONFIDENTIALITY_DATA = [
  {
    id: 'part2_section14',
    title: {
      en: '42 CFR Part 2 § 2.14: Mandatory Minor Consent for Disclosures',
      es: '42 CFR Parte 2 § 2.14: Consentimiento Obligatorio del Menor para Divulgaciones',
    },
    summary: {
      en: 'Federal confidentiality regulations under 42 CFR Part 2 § 2.14 apply to any substance use disorder program that receives federal assistance. Under § 2.14, if a minor has the legal capacity under state law to consent to their own treatment, the minor’s written consent is mandatory before any disclosure can be made to parents, guardians, schools, or law enforcement.',
      es: 'Las normas federales de confidencialidad bajo 42 CFR Parte 2 § 2.14 aplican a programas de adicciones con asistencia federal. Bajo § 2.14, si un menor tiene capacidad bajo la ley estatal para consentir su propio tratamiento, su consentimiento escrito es obligatorio antes de realizar cualquier divulgación a padres, tutores, escuelas o autoridades.',
    },
    keyRules: [
      {
        topic: {
          en: 'No Parental Confirmation or Denial',
          es: 'Prohibido confirmar o negar a los padres',
        },
        detail: {
          en: 'Even if parents call the clinic or suspect treatment, clinical staff cannot confirm, deny, or acknowledge the minor is receiving services without the minor’s explicit written release.',
          es: 'Incluso si los padres llaman o sospechan del tratamiento, el personal clínico no puede confirmar, negar ni reconocer que el menor recibe servicios sin su autorización escrita explícita.',
        },
      },
      {
        topic: {
          en: 'Emergency Medical Exception Only',
          es: 'Excepción exclusiva para emergencia médica',
        },
        detail: {
          en: 'Under 42 CFR § 2.51, disclosures without consent are permitted only to medical personnel treating a bona fide medical emergency where immediate life is at stake.',
          es: 'Bajo 42 CFR § 2.51, las divulgaciones sin consentimiento se permiten únicamente al personal médico que atienda una emergencia de vida o muerte.',
        },
      },
    ],
    citation: '42 CFR § 2.14 (Minor Patients); 42 CFR § 2.51 (Medical Emergencies)',
  },
  {
    id: 'eob_insurance_risk',
    title: {
      en: 'The Explanation of Benefits (EOB) Risk: Unintentional Parental Disclosures',
      es: 'El Riesgo del Resumen de Beneficios (EOB): Divulgaciones Involuntarias a Padres',
    },
    summary: {
      en: 'Even when clinicians strictly follow 42 CFR Part 2, commercial health insurance companies routinely mail or email an Explanation of Benefits (EOB) statement directly to the primary policyholder (usually a parent or guardian). EOBs detail service dates, diagnostic codes (such as F11.20 Opioid Dependence), procedure codes, and provider specialties, which can breach youth privacy without the clinic’s knowledge.',
      es: 'A pesar de que los médicos cumplan rigurosamente con 42 CFR Parte 2, las compañías de seguros de salud comerciales envían rutinariamente un Resumen de Beneficios (EOB) por correo postal o electrónico al titular principal de la póliza (el padre o tutor). El EOB detalla fechas, diagnósticos de adicciones, códigos de procedimiento y nombres de proveedores, lo que puede vulnerar la privacidad del menor.',
    },
    keyRules: [
      {
        topic: {
          en: 'Primary Policyholder Receives the EOB',
          es: 'El titular de la póliza recibe el EOB',
        },
        detail: {
          en: 'Minors covered under a parent’s employer plan do not control standard billing mailings unless an explicit confidential communication request is established.',
          es: 'Los menores asegurados bajo el plan laboral de sus padres no controlan los envíos postales de facturación a menos que establezcan una solicitud de comunicación confidencial.',
        },
      },
      {
        topic: {
          en: 'Pharmacy Benefits Managers (PBMs)',
          es: 'Administradores de beneficios de farmacia (PBM)',
        },
        detail: {
          en: 'Filling prescriptions (such as buprenorphine or naloxone) through parental insurance triggers pharmacy claims and online portal alerts viewable by policyholders.',
          es: 'Surtir recetas (como buprenorfina o naloxona) a través del seguro familiar activa alertas en portales digitales visibles para los padres.',
        },
      },
    ],
    citation: 'SAMHSA & Legal Action Center: Protecting Minor Confidentiality in Private Insurance Billing',
  },
  {
    id: 'hipaa_164_522_mitigation',
    title: {
      en: 'HIPAA 45 CFR § 164.522: Right to Request Confidential Communications',
      es: 'HIPAA 45 CFR § 164.522: Derecho a Solicitar Comunicaciones Confidenciales',
    },
    summary: {
      en: 'Under the HIPAA Privacy Rule 45 CFR § 164.522(b), individuals have the federal right to request that health plans send communications (including EOBs, claim letters, and denial notices) to an alternative location, address, email, or telephone number, or to withhold communications entirely if disclosure could endanger the individual.',
      es: 'Bajo la Norma de Privacidad de HIPAA 45 CFR § 164.522(b), toda persona tiene el derecho federal de solicitar a los planes de salud que envíen sus comunicaciones (incluidos EOBs y avisos de reclamaciones) a una dirección alternativa, correo seguro o teléfono móvil personal, o que se retengan si la divulgación pudiera poner en peligro a la persona.',
    },
    keyRules: [
      {
        topic: {
          en: 'State Automatic EOB Suppression Laws',
          es: 'Leyes estatales de supresión automática de EOB',
        },
        detail: {
          en: 'States including CA (Confidentiality of Medical Information Act / SB 138), WA, OR, CO, NY, and MD provide statutory protections requiring insurers to redirect or suppress EOBs for sensitive services (substance use, mental health, reproductive care) upon member request.',
          es: 'Estados como CA (Ley SB 138), WA, OR, CO, NY y MD obligan por ley a las aseguradoras a suprimir o redirigir los EOBs para servicios confidenciales de adicciones y salud mental si el usuario lo solicita.',
        },
      },
      {
        topic: {
          en: 'How to Submit a Confidential Communication Request',
          es: 'Cómo presentar una solicitud de comunicación confidencial',
        },
        detail: {
          en: 'Call member services on the insurance card, ask for the Privacy Officer, state that disclosure of communications could endanger safety, and designate a private email or postal address.',
          es: 'Llame a atención a miembros en la tarjeta del seguro, pida hablar con el Oficial de Privacidad, declare que recibir correspondencia en casa pone en riesgo su seguridad y proporcione un correo o dirección privada.',
        },
      },
    ],
    citation: '45 CFR § 164.522(b); California Civil Code § 56.107',
  },
  {
    id: 'safetynet_titlex_fqhc',
    title: {
      en: 'Safety-Net Care: Zero-Trace Care via FQHCs, Title X & Public Health',
      es: 'Centros de Red de Seguridad: Atención sin Rastro en FQHCs y Clínicas Title X',
    },
    summary: {
      en: 'The most reliable way for adolescents to prevent insurance EOB disclosures is to access care through safety-net health centers that do not bill private parental insurance. Federally Qualified Health Centers (FQHCs), Title X family planning clinics, and county public health departments operate sliding-fee discount schedules ($0 or nominal copays for youth with zero independent income) and federal block grant programs.',
      es: 'La forma más segura para que los adolescentes eviten notificaciones de facturación es acudir a centros comunitarios de la red de seguridad que no facturen a seguros privados de los padres. Los Centros de Salud Calificados a Nivel Federal (FQHC), las clínicas Title X y los departamentos de salud pública ofrecen tarifas según ingresos (a menudo $0 para jóvenes sin ingresos propios).',
    },
    keyRules: [
      {
        topic: {
          en: 'Sliding Fee Scale Assessment on Minor’s Own Income',
          es: 'Tarifa según ingresos evaluada exclusivamente con el ingreso del menor',
        },
        detail: {
          en: 'At HRSA-funded health centers, minors applying independently are assessed based on their own personal income, qualifying most teens for 100% sliding-fee discount ($0 cost).',
          es: 'En centros HRSA, los menores que solicitan atención de forma confidencial son evaluados según sus propios ingresos, calificando casi siempre a tarifa de $0.',
        },
      },
      {
        topic: {
          en: 'No Insurance Claim Filed',
          es: 'Cero reclamaciones al seguro de los padres',
        },
        detail: {
          en: 'Because no private insurance claim is filed, zero EOB statements or billing letters are generated, eliminating insurance breach risks completely.',
          es: 'Al no facturar al seguro privado familiar, no se genera ningún documento ni aviso postal a la casa.',
        },
      },
    ],
    citation: 'Section 330 of the Public Health Service Act (42 U.S.C. § 254b); Title X 42 CFR § 59.5',
  },
];

export const CONFIDENTIALITY_RIGHTS_42CFR = [...CONFIDENTIALITY_DATA];
for (const item of CONFIDENTIALITY_DATA) {
  CONFIDENTIALITY_RIGHTS_42CFR[item.id] = item;
}

// ============================================================================
// 3. Youth-Adapted ASAM Criteria (Dimensions 1–6)
// ============================================================================

const YOUTH_ASAM_DATA = [
  {
    id: 'dimension_1',
    dimensionNumber: 1,
    title: {
      en: 'Dimension 1: Acute Withdrawal Risk & Intoxication',
      es: 'Dimensión 1: Riesgo de Abstinencia Aguda e Intoxicación',
    },
    summary: {
      en: 'Adolescent physiology features lower body mass, immature metabolic pathways, and rapid progression from experimental use to severe physical tolerance. High prevalence of polysubstance co-ingestion (counterfeit fentanyl-pressed pills, high-potency THC vapes, stimulants, and alcohol) frequently masks classical withdrawal signs while exponentially increasing fatal overdose risk.',
      es: 'La fisiología adolescente presenta menor masa corporal, rutas metabólicas inmaduras y progresión acelerada del uso experimental a tolerancia física severa. La alta prevalencia de polisustancias (pastillas prensadas con fentanilo, vaporizadores de THC de alta potencia, estimulantes y alcohol) enmascara los signos clásicos de abstinencia mientras eleva exponencialmente el riesgo mortal.',
    },
    clinicalFocus: [
      {
        topic: {
          en: 'Rapid Progression & Compressed Timelines',
          es: 'Progresión rápida y cronogramas comprimidos',
        },
        detail: {
          en: 'Adolescents can develop severe physical dependence within weeks of regular opioid or sedative use, far faster than adults.',
          es: 'Los adolescentes pueden desarrollar dependencia física grave en cuestión de semanas tras el uso habitual de opioides o sedantes, mucho más rápido que los adultos.',
        },
      },
      {
        topic: {
          en: 'Polysubstance Masking Effects',
          es: 'Efectos de enmascaramiento por polisustancias',
        },
        detail: {
          en: 'Stimulant use (methamphetamine, cocaine) or high-dose nicotine/cannabis can conceal early opioid withdrawal tremors, nausea, or tachycardia.',
          es: 'Los estimulantes o dosis altas de nicotina/cannabis pueden ocultar temblores, náuseas o taquicardia de abstinencia inicial de opioides.',
        },
      },
      {
        topic: {
          en: 'Withdrawal Protocols & Vital Signs',
          es: 'Protocolos de abstinencia y signos vitales',
        },
        detail: {
          en: 'Adolescent withdrawal scoring must account for baseline pediatric vital signs (resting heart rate and blood pressure variations by age).',
          es: 'Las escalas de abstinencia pediátricas deben ajustarse a los valores basales de frecuencia cardíaca y presión arterial según la edad.',
        },
      },
    ],
    asamAssessmentNote: 'Evaluate current intoxication, 24-48h withdrawal trajectory, and immediate need for medically supervised stabilization.',
  },
  {
    id: 'dimension_2',
    dimensionNumber: 2,
    title: {
      en: 'Dimension 2: Biomedical Conditions & Complications',
      es: 'Dimensión 2: Condiciones Biomédicas y Complicaciones',
    },
    summary: {
      en: 'The human brain undergoes massive neurodevelopmental restructuring through age ~25, particularly synaptic pruning and myelination in the prefrontal cortex. Early substance exposure perturbs developing dopamine, GABA, and endocannabinoid receptors. Physical health screening must address malnutrition, sleep fragmentation, sexual health, and traumatic brain injury (TBI).',
      es: 'El cerebro humano experimenta una reestructuración neuroevolutiva masiva hasta los 25 años, especialmente la poda sináptica y mielinización en la corteza prefrontal. La exposición temprana altera los receptores de dopamina, GABA y endocannabinoides. La evaluación médica debe incluir nutrición, sueño, salud sexual y traumatismos craneoencefálicos.',
    },
    clinicalFocus: [
      {
        topic: {
          en: 'Ongoing Prefrontal Cortex Maturation',
          es: 'Maduración continua de la corteza prefrontal',
        },
        detail: {
          en: 'Executive function, long-term consequence processing, and impulse inhibition remain biologically incomplete throughout the teenage years.',
          es: 'Las funciones ejecutivas, la evaluación de consecuencias futuras y la inhibición de impulsos son biológicamente inmaduras en la adolescencia.',
        },
      },
      {
        topic: {
          en: 'Infectious Disease & Sexual Health',
          es: 'Enfermedades infecciosas y salud sexual',
        },
        detail: {
          en: 'Screening for viral hepatitis (HCV), HIV, STIs, pregnancy, and injection site soft-tissue infections is mandatory.',
          es: 'Es mandatorio realizar pruebas de detección de hepatitis C (VHC), VIH, ITS, embarazo e infecciones dérmicas por inyección.',
        },
      },
      {
        topic: {
          en: 'Sleep Architecture & Nutritional Depletion',
          es: 'Arquitectura del sueño y depleción nutricional',
        },
        detail: {
          en: 'Chronic stimulant or sedative use severely deranges circadian sleep cycles and growth hormone release during critical adolescent growth spurts.',
          es: 'El uso crónico de estimulantes o sedantes altera gravemente los ciclos circadianos y la liberación de la hormona del crecimiento.',
        },
      },
    ],
    asamAssessmentNote: 'Document chronic medical diagnoses, growth markers, sexual and reproductive risks, and history of concussions.',
  },
  {
    id: 'dimension_3',
    dimensionNumber: 3,
    title: {
      en: 'Dimension 3: Emotional, Behavioral & Cognitive Conditions',
      es: 'Dimensión 3: Condiciones Emocionales, Conductuales y Cognitivas',
    },
    summary: {
      en: 'Over 60–75% of adolescents entering substance use treatment meet criteria for co-occurring mental health disorders. ADHD (present in 30–50%), complex trauma / PTSD from adverse childhood experiences (ACEs), major depressive episodes, anxiety, conduct challenges, and self-harm require integrated, dual-diagnosis psychiatric care rather than sequential treatment.',
      es: 'Más del 60–75% de los adolescentes en tratamiento por adicciones presentan trastornos de salud mental concurrentes. El TDAH (presente en 30–50%), trauma complejo / TEPT por experiencias adversas infantiles, depresión mayor, ansiedad y autolesiones exigen atención psiquiátrica dual integrada.',
    },
    clinicalFocus: [
      {
        topic: {
          en: 'ADHD & Executive Dysfunction',
          es: 'TDAH y disfunción ejecutiva',
        },
        detail: {
          en: 'Untreated ADHD significantly accelerates substance experimentation as youth self-medicate restlessness, inattention, or affective dysregulation.',
          es: 'El TDAH no tratado acelera la experimentación con sustancias cuando los jóvenes buscan automedicar inquietud, desatención o desregulación emocional.',
        },
      },
      {
        topic: {
          en: 'Trauma & Adverse Childhood Experiences (ACEs)',
          es: 'Trauma y experiencias infantiles adversas (ACE)',
        },
        detail: {
          en: 'Physical, emotional, or sexual abuse, witnessing domestic violence, or family separation directly fuel neurobiological hypersensitivity to stress.',
          es: 'El abuso físico, emocional o sexual, la violencia intrafamiliar o la separación familiar provocan hipersensibilidad neurobiológica al estrés.',
        },
      },
      {
        topic: {
          en: 'Suicide & Self-Harm Screening',
          es: 'Detección de suicidio y autolesiones',
        },
        detail: {
          en: 'Adolescent substance intoxication dramatically heightens lethal suicide risk; ongoing Columbia-Suicide Severity Rating Scale (C-SSRS) screening is essential.',
          es: 'La intoxicación eleva drásticamente el riesgo de suicidio impulsivo; la evaluación continua con la escala C-SSRS es imprescindible.',
        },
      },
    ],
    asamAssessmentNote: 'Assess emotional stability, impulse control, cognitive processing, trauma history, and immediate self-harm safety.',
  },
  {
    id: 'dimension_4',
    dimensionNumber: 4,
    title: {
      en: 'Dimension 4: Readiness to Change (Developmentally Tailored)',
      es: 'Dimensión 4: Disposición al Cambio (Adaptada al Desarrollo)',
    },
    summary: {
      en: 'Developmentally adapted readiness to change recognizes that youth rarely seek treatment voluntarily with a goal of total lifelong abstinence. Referrals are overwhelmingly externalized (prompted by parents, school truancy officers, or juvenile diversion). Clinicians must meet youth where they are, utilizing motivational interviewing and collaborative harm reduction rather than confrontational, punitive mandates.',
      es: 'La disposición al cambio adaptada al desarrollo reconoce que los jóvenes rara vez buscan tratamiento voluntariamente con el objetivo de abstinencia total de por vida. Las derivaciones son casi siempre externas (padres, escuela, justicia juvenil). Los médicos deben acoger a los jóvenes en su etapa real mediante entrevista motivacional y reducción de daños, sin tácticas punitivas ni confrontacionales.',
    },
    clinicalFocus: [
      {
        topic: {
          en: 'Autonomy-Supportive Framing',
          es: 'Enfoque de apoyo a la autonomía',
        },
        detail: {
          en: 'Confrontational tactics induce psychological reactance and immediate treatment dropout; affirming youth autonomy fosters genuine therapeutic engagement.',
          es: 'Las tácticas confrontacionales provocan reactancia y abandono del tratamiento; validar la autonomía juvenil fomenta un compromiso terapéutico real.',
        },
      },
      {
        topic: {
          en: 'Harm Reduction as an Entry Point',
          es: 'La reducción de daños como punto de entrada',
        },
        detail: {
          en: 'Agreeing to pragmatic goals—such as avoiding fentanyl contamination, carrying naloxone, and keeping grades stable—builds trust before addressing abstinence.',
          es: 'Pactar metas pragmáticas (evitar fentanilo, portar naloxona, mantener notas escolares) genera confianza antes de exigir abstinencia total.',
        },
      },
      {
        topic: {
          en: 'Developmental Stages of Change',
          es: 'Etapas de cambio adaptadas al desarrollo',
        },
        detail: {
          en: 'Precontemplation and ambivalence are standard developmental realities, not treatment failures or moral deficits.',
          es: 'La precontemplación y la ambivalencia son realidades normales del desarrollo, no fracasos terapéuticos ni fallas morales.',
        },
      },
    ],
    asamAssessmentNote: 'Assess intrinsic vs extrinsic motivators, perceived benefits of substance use, and willingness to collaborate on safety goals.',
  },
  {
    id: 'dimension_5',
    dimensionNumber: 5,
    title: {
      en: 'Dimension 5: Relapse, Continued Use & Craving Potential',
      es: 'Dimensión 5: Potencial de Recaída, Uso Continuo y Antojo (Craving)',
    },
    summary: {
      en: 'Adolescent neurobiology features a hyper-reactive limbic reward system paired with an immature prefrontal control network. Relapse triggers are intensely social: peer networks, social media platforms (Snapchat, Telegram), high school hallways, and acute distress states. Craving management must focus on experiential distress tolerance and pro-social alternative reinforcers.',
      es: 'La neurobiología adolescente presenta un sistema límbico de recompensa hiperactivo combinado con una red prefrontal de control inmadura. Los detonantes de recaída son intensamente sociales: grupos de amigos, redes sociales, la escuela y el malestar afectivo agudo. El manejo del deseo intenso debe enfocarse en tolerancia al malestar y alternativas prosociales placenteras.',
    },
    clinicalFocus: [
      {
        topic: {
          en: 'Social Media & Smartphone Triggers',
          es: 'Detonantes en redes sociales y teléfonos',
        },
        detail: {
          en: 'Drug availability via digital messaging apps creates instant, 24/7 access that bypasses adult supervision and traditional physical dealer networks.',
          es: 'La disponibilidad de drogas a través de aplicaciones de mensajería genera acceso las 24 horas sin supervisión de adultos.',
        },
      },
      {
        topic: {
          en: 'Peer Group Conformity Pressures',
          es: 'Presión de conformidad del grupo de pares',
        },
        detail: {
          en: 'Adolescents prioritize immediate peer approval over remote future risks; refusal skills must be practiced through realistic role-play.',
          es: 'Los adolescentes priorizan la aprobación de sus pares sobre riesgos futuros; las habilidades de rechazo deben ensayarse con juegos de rol realistas.',
        },
      },
      {
        topic: {
          en: 'Distress Tolerance Deficits',
          es: 'Déficit en tolerancia al malestar',
        },
        detail: {
          en: 'Substances frequently function as the youth’s sole tool to regulate unbearable sadness, shame, or anxiety; replacement coping skills are critical.',
          es: 'Las sustancias suelen funcionar como la única herramienta para regular tristeza o ansiedad; desarrollar habilidades alternativas es crucial.',
        },
      },
    ],
    asamAssessmentNote: 'Identify high-risk social settings, craving intensity, digital triggers, and coping responses to negative affect.',
  },
  {
    id: 'dimension_6',
    dimensionNumber: 6,
    title: {
      en: 'Dimension 6: Recovery Environment & Systemic Factors',
      es: 'Dimensión 6: Entorno de Recuperación y Factores Sistémicos',
    },
    summary: {
      en: 'Adolescents are embedded within interdependent micro-systems: family home, school, peer group, juvenile court, and neighborhood. Environmental recovery depends on addressing parental substance use, domestic conflict, LGBTQ+ family rejection, school discipline policies (expulsion vs 504/IEP behavioral support), and housing stability.',
      es: 'Los adolescentes viven inmersos en microsistemas interdependientes: familia, escuela, amistades, tribunales juveniles y vecindario. La recuperación depende de abordar el uso parental de sustancias, el conflicto doméstico, el rechazo familiar a jóvenes LGBTQ+, políticas disciplinarias escolares y la estabilidad habitacional.',
    },
    clinicalFocus: [
      {
        topic: {
          en: 'Family Systems Dynamics',
          es: 'Dinámicas de sistemas familiares',
        },
        detail: {
          en: 'Active parental substance use, unaddressed parental mental illness, or severe domestic conflict dramatically degrades outpatient treatment retention.',
          es: 'El consumo activo en padres o el conflicto doméstico severo disminuyen dramáticamente la retención en el tratamiento ambulatorio.',
        },
      },
      {
        topic: {
          en: 'School Stability & Academic Accommodations',
          es: 'Estabilidad escolar y adaptaciones académicas',
        },
        detail: {
          en: 'Punitive suspensions push youth toward street networks; coordinating 504 accommodation plans or recovery high schools protects educational continuity.',
          es: 'Las suspensiones punitivas empujan a los jóvenes a la calle; coordinar planes 504 o escuelas secundarias de recuperación protege sus estudios.',
        },
      },
      {
        topic: {
          en: 'Housing Instability & LGBTQ+ Rejection',
          es: 'Inestabilidad de vivienda y rechazo LGBTQ+',
        },
        detail: {
          en: 'LGBTQ+ youth experience disproportional housing displacement and family estrangement; safe transitional shelter navigation is a life-saving prerequisite.',
          es: 'Los jóvenes LGBTQ+ sufren desalojo y rechazo familiar desproporcionado; coordinar refugios seguros es un prerrequisito vital.',
        },
      },
    ],
    asamAssessmentNote: 'Evaluate family safety, school status, peer network toxicity, juvenile probation conditions, and housing stability.',
  },
];

export const YOUTH_ASAM_DIMENSIONS = [...YOUTH_ASAM_DATA];
for (const item of YOUTH_ASAM_DATA) {
  YOUTH_ASAM_DIMENSIONS[item.id] = item;
}

// ============================================================================
// 4. Evidence-Based Interventions for Adolescents & Young Adults
// ============================================================================

const INTERVENTIONS_DATA = [
  {
    id: 'acra',
    name: {
      en: 'Adolescent Community Reinforcement Approach (A-CRA)',
      es: 'Enfoque de Refuerzo Comunitario para Adolescentes (A-CRA)',
    },
    evidenceTier: 'Level 1: High Empirical Support (SAMHSA / NIDA)',
    summary: {
      en: 'A-CRA is an intensive behavioral therapy that systematically modifies the adolescent’s social, family, and recreational ecology. It aims to make a substance-free lifestyle considerably more rewarding than substance use by developing pro-social reinforcers, relationship satisfaction, vocational/educational achievements, and assertive communication.',
      es: 'A-CRA es una terapia conductual intensiva que modifica la ecología social, familiar y recreativa del adolescente. Busca hacer que la vida libre de sustancias sea mucho más gratificante que el consumo mediante refuerzos prosociales placenteros, comunicación asertiva y logros educativos.',
    },
    keyElements: [
      'Functional analysis of substance-using behavior vs. pro-social activities',
      'Communication skills training & assertive refusal role-playing',
      'Systematic problem-solving technique for daily stressors',
      'Pleasure/recreational sampling of drug-free hobbies and peer groups',
      'Caregiver and relationship happiness scale evaluations',
    ],
  },
  {
    id: 'mdft',
    name: {
      en: 'Multidimensional Family Therapy (MDFT)',
      es: 'Terapia Familiar Multidimensional (MDFT)',
    },
    evidenceTier: 'Level 1: High Empirical Support (SAMHSA / NIDA)',
    summary: {
      en: 'MDFT is an intensive, integrative family-centered therapy targeting four interdependent systems simultaneously: (1) youth individual emotional regulation, (2) parent individual coping and parenting style, (3) parent-youth dyadic interactions and attachment, and (4) extrafamilial systems (school, juvenile justice, and peer networks).',
      es: 'MDFT es una terapia familiar intensiva que interviene simultáneamente en cuatro dominios interconectados: (1) regulación emocional individual del joven, (2) estilo de crianza y bienestar de los padres, (3) comunicación y apego familiar, y (4) sistemas externos como escuela, justicia juvenil y amigos.',
    },
    keyElements: [
      'Individual sessions with the adolescent to build coping and future identity',
      'Individual sessions with parents to strengthen parental monitoring and stress management',
      'Conjoint family sessions to heal emotional injuries and improve problem-solving',
      'Extrafamilial advocacy with probation officers, judges, and high school staff',
    ],
  },
  {
    id: 'sbirt_met',
    name: {
      en: 'Brief Intervention & Motivational Enhancement (SBIRT / MET)',
      es: 'Intervención Breve y Mejora Motivacional (SBIRT / MET)',
    },
    evidenceTier: 'Level 1: High Empirical Support (AAP / ASAM)',
    summary: {
      en: 'Developmentally adapted Motivational Enhancement Therapy (MET) and Screening, Brief Intervention, and Referral to Treatment (SBIRT, utilizing youth-validated screeners like CRAFFT or S2BI). This non-confrontational approach explores the youth’s own goals, highlights discrepancies between current use and life values, and elicits change talk.',
      es: 'Terapia de Mejora Motivacional (MET) y detección con intervención breve (SBIRT usando herramientas como CRAFFT o S2BI). Este enfoque colaborativo examina las metas del adolescente, resalta discrepancias entre el consumo y sus valores de vida, y estimula el compromiso propio de cambio.',
    },
    keyElements: [
      'Screening with validated pediatric tools (CRAFFT 2.1, S2BI)',
      'Eliciting youth perspectives on pros and cons of substance use',
      'Exploring discrepancy between current habits and personal dreams',
      'Providing non-judgmental, objective health and safety feedback',
      'Collaborative harm reduction goal-setting without pressure',
    ],
  },
  {
    id: 'youth_cm',
    name: {
      en: 'Youth Contingency Management (Incentive-Based Reinforcement)',
      es: 'Manejo de Contingencias para Jóvenes (Refuerzo Basado en Incentivos)',
    },
    evidenceTier: 'Level 1: Strong Behavioral Evidence',
    summary: {
      en: 'Contingency Management utilizes operant behavioral principles by providing immediate, tangible positive reinforcers (gift cards, privileges, retail vouchers) contingent upon verified target behaviors, such as negative urine/saliva toxicology screens or verified session attendance. It directly activates the developing adolescent dopamine reward system.',
      es: 'El Manejo de Contingencias emplea principios conductuales ofreciendo incentivos positivos tangibles e inmediatos (tarjetas de regalo, vales o privilegios) tras comprobar conductas objetivo, como pruebas toxicológicas negativas o asistencia puntual a sesiones.',
    },
    keyElements: [
      'Frequent, objective verification (toxicology or attendance tracking)',
      'Immediate delivery of positive reinforcement vouchers or rewards',
      'Escalating reward values for consecutive sustained target behaviors',
      'Reset contingencies following missed sessions or positive tests without punitive measures',
    ],
  },
  {
    id: 'youth_peer_aid',
    name: {
      en: 'Youth Peer Support & SMART Recovery / MARA Youth',
      es: 'Apoyo de Pares Juveniles y Grupos SMART Recovery / MARA para Jóvenes',
    },
    evidenceTier: 'Community Best Practice & Peer Advocacy',
    summary: {
      en: 'Youth-specific mutual aid and peer recovery specialist support provide a non-stigmatizing counterweight to substance-using peer networks. SMART Recovery for Youth focuses on self-empowering CBT tools, while Medication-Assisted Recovery Anonymous (MARA) provides a safe space for youth taking buprenorphine or naltrexone without 12-step judgment.',
      es: 'Los grupos de ayuda mutua juvenil y especialistas pares certificados ofrecen un contrapeso no estigmatizante a los círculos de consumo. SMART Recovery para jóvenes enseña herramientas cognitivo-conductuales, y MARA ofrece un espacio seguro para quienes usan buprenorfina o naltrexona sin discriminación.',
    },
    keyElements: [
      'Certified Youth Peer Support Specialists with shared lived experience',
      'Non-dogmatic, secular mutual aid options (SMART Recovery Teens)',
      'Affirmation of MOUD medications (MARA for youth on buprenorphine)',
      'Digital online peer meetings for rural and geographically isolated teens',
    ],
  },
  {
    id: 'moud_adolescents',
    name: {
      en: 'Medications for Opioid Use Disorder (MOUD) in Adolescents (AAP & ASAM)',
      es: 'Medicamentos para Trastorno por Uso de Opioides en Adolescentes (AAP y ASAM)',
    },
    evidenceTier: 'Standard of Care (AAP Policy Statement & ASAM Guidelines)',
    summary: {
      en: 'The American Academy of Pediatrics (AAP) and ASAM strongly recommend that pediatricians and addiction specialists offer pharmacotherapy (buprenorphine, methadone, or naltrexone) to adolescents and young adults with opioid use disorder. Buprenorphine is FDA-approved for youth age 16+, and off-label initiation is clinically recommended for younger adolescents with moderate-to-severe OUD.',
      es: 'La Academia Americana de Pediatría (AAP) y ASAM recomiendan enérgicamente que los pediatras y especialistas ofrezcan farmacoterapia (buprenorfina, metadona o naltrexona) a adolescentes y jóvenes con adicción a opioides. La buprenorfina está aprobada por la FDA a partir de los 16 años, y su uso clínico se recomienda en menores de 16 con OUD moderado a severo.',
    },
    keyElements: [
      'Buprenorphine/Naloxone sublingual: FDA-approved age 16+, reduces mortality by >50%',
      'Methadone in Opioid Treatment Programs (OTPs) under federal 42 CFR § 8.12 guidelines',
      'Extended-Release Naltrexone (Vivitrol) monthly injection for motivated youth post-detox',
      'Co-prescribing take-home naloxone (Narcan) to every youth and household member',
    ],
  },
];

export const EVIDENCE_BASED_INTERVENTIONS = [...INTERVENTIONS_DATA];
for (const item of INTERVENTIONS_DATA) {
  EVIDENCE_BASED_INTERVENTIONS[item.id] = item;
}

// ============================================================================
// 5. Youth Harm Reduction & Crisis Intervention Protocols
// ============================================================================

const HARM_REDUCTION_DATA = [
  {
    id: 'fts_dilution_protocol',
    title: {
      en: 'Fentanyl Test Strip (FTS) Dilution Protocols: Counterfeit Pills & Stimulants',
      es: 'Protocolos de Dilución de Tiras de Fentanilo: Pastillas Falsificadas y Estimulantes',
    },
    summary: {
      en: 'Nearly all counterfeit pills ("M30" / "blues", fake Xanax, counterfeit Adderall) contain illicit fentanyl pressed unevenly (the "chocolate chip cookie effect"). Testing a small scraped corner can result in a fatal false negative; the entire pill or powder must be crushed and dissolved in clean water. For stimulants (methamphetamine, cocaine, MDMA), improper dilution causes chemical cross-reactivity and false positives: use 1 teaspoon (5 mL) of water per 10 mg of substance.',
      es: 'Casi todas las pastillas falsificadas ("M30", Xanax falso, Adderall adulterado) contienen fentanilo distribuido desigualmente ("efecto galleta con chispas"). Raspar solo una esquina puede causar un falso negativo mortal; toda la pastilla debe triturarse y disolverse en agua limpia. Para estimulantes (metanfetamina, cocaína, MDMA), use 1 cucharadita (5 mL) de agua por cada 10 mg para evitar falsos positivos.',
    },
    stepByStep: [
      'Crush the entire pill or measure the powder sample thoroughly on a clean surface.',
      'For pressed pills/powders: Dissolve in 5–10 mL (1–2 teaspoons) of clean water.',
      'For stimulants (meth/MDMA): Use exactly 1 teaspoon (5 mL) of water per 10 mg (prevents false positive strip saturation).',
      'Dip the test strip into the liquid up to the MAX line for 15 full seconds.',
      'Place strip flat on a clean dry non-absorbent surface and read results at 2 to 5 minutes.',
      'Result Interpretation: 1 line = POSITIVE for fentanyl (danger); 2 lines = NEGATIVE (fentanyl not detected, but analogs/other toxins may still exist).',
    ],
  },
  {
    id: 'naloxone_good_samaritan',
    title: {
      en: 'Naloxone (Narcan) Possession Rights & 911 Good Samaritan Protections for Youth',
      es: 'Derecho a Portar Naloxona y Protecciones del Buen Samaritano 911 para Jóvenes',
    },
    summary: {
      en: 'Naloxone is non-scheduled, non-addictive, and available over-the-counter (OTC). Minors can legally purchase, carry, and administer naloxone in all 50 U.S. states without a prescription. Good Samaritan 911 laws protect minors who call for emergency medical help during an overdose from criminal prosecution for drug possession, paraphernalia, or underage alcohol use.',
      es: 'La naloxona es de venta libre (OTC) y no genera adicción. Los menores pueden comprar, portar y administrar naloxona legalmente en los 50 estados de EE. UU. sin receta. Las leyes del Buen Samaritano protegen a los jóvenes que llamen al 911 en una sobredosis de cargos penales por posesión o consumo de alcohol en menores.',
    },
    stepByStep: [
      'Call 911 immediately if someone won’t wake up, has blue/gray lips, or is breathing slowly/gasping.',
      'Administer 1 spray of Naloxone (Narcan) into one nostril. Peel package, place nozzle in nose, press plunger firmly.',
      'Perform rescue breathing if trained, or turn person onto their side into the Recovery Position to keep airway clear.',
      'If no response after 2 to 3 minutes, give a second dose of naloxone in the opposite nostril.',
      'Stay with the person until paramedics arrive. You are legally shielded by state Good Samaritan immunity.',
    ],
  },
  {
    id: 'crisis_text_and_hotlines',
    title: {
      en: '24/7 Free, Confidential Youth Crisis Texting & Overdose Lifelines',
      es: 'Líneas de Texto en Crisis y Apoyo Gratuito 24/7 para Jóvenes',
    },
    summary: {
      en: 'Adolescents often prefer texting over phone calls to maintain privacy from family members. Free, confidential, zero-trace crisis lines are available around the clock via SMS and dedicated phone lines.',
      es: 'Los adolescentes suelen preferir mensajes de texto por privacidad. Existen líneas de crisis confidenciales y gratuitas disponibles las 24 horas por SMS y teléfono.',
    },
    resources: [
      {
        name: 'Crisis Text Line',
        action: 'Text HOME to 741741',
        desc: {
          en: 'Free, 24/7, confidential text support with a trained crisis counselor.',
          es: 'Apoyo por texto gratuito, confidencial y 24/7 con un consejero de crisis.',
        },
      },
      {
        name: 'Suicide & Crisis Lifeline',
        action: 'Call or Text 988',
        desc: {
          en: 'National 24/7 emergency mental health and substance crisis hotline.',
          es: 'Línea nacional 24/7 de crisis de salud mental y uso de sustancias.',
        },
      },
      {
        name: 'The Trevor Project (LGBTQ+ Youth)',
        action: 'Call 1-866-488-7386 or Text START to 678-678',
        desc: {
          en: '24/7 specialized crisis intervention and suicide prevention for LGBTQ+ young people.',
          es: 'Intervención en crisis y prevención del suicidio para jóvenes LGBTQ+ 24/7.',
        },
      },
      {
        name: 'Never Use Alone Inc.',
        action: 'Call 1-877-696-1996',
        desc: {
          en: 'A compassionate operator stays on the phone while you use; dispatches EMS only if you stop responding.',
          es: 'Un operador capacitado permanece en la línea mientras consumes; llama al 911 solo si dejas de responder.',
        },
      },
      {
        name: 'Love is Respect (Teen Safety)',
        action: 'Text LOVEIS to 22522 or Call 1-866-331-9474',
        desc: {
          en: 'Support for healthy relationships, relationship trauma, and safety planning for teens.',
          es: 'Apoyo sobre relaciones saludables y planes de seguridad para adolescentes.',
        },
      },
      {
        name: 'SAMHSA National Helpline',
        action: 'Call 1-800-662-4357',
        desc: {
          en: 'Treatment referral service for individuals and families facing mental and substance disorders.',
          es: 'Servicio de derivación a tratamiento para individuos y familias.',
        },
      },
    ],
  },
];

export const YOUTH_HARM_REDUCTION_GUIDELINES = [...HARM_REDUCTION_DATA];
for (const item of HARM_REDUCTION_DATA) {
  YOUTH_HARM_REDUCTION_GUIDELINES[item.id] = item;
}

// ============================================================================
// 6. Appointment Preparation Checklist Items
// ============================================================================

const CHECKLIST_ITEMS_DATA = [
  {
    id: 'verify_state_minor_consent',
    topic: 'legal',
    text: {
      en: 'Verify your state’s minor consent age threshold for outpatient counseling (typically ages 12–16).',
      es: 'Verifique la edad mínima legal de su estado para consentimiento ambulatorio (entre 12 y 16 años).',
    },
  },
  {
    id: 'request_hipaa_eob_suppression',
    topic: 'confidentiality',
    text: {
      en: 'Request confidential communications under HIPAA 45 CFR § 164.522 to suppress or redirect insurance EOB mailings away from the home address.',
      es: 'Solicite comunicaciones confidenciales bajo HIPAA 45 CFR § 164.522 para suprimir o redirigir el EOB del seguro.',
    },
  },
  {
    id: 'ask_clinic_about_42cfr_part2',
    topic: 'confidentiality',
    text: {
      en: 'Ask the clinic how they implement 42 CFR Part 2 § 2.14 minor confidentiality protocols and confirm that no disclosure will occur without written consent.',
      es: 'Pregunte a la clínica cómo aplican 42 CFR Parte 2 § 2.14 y confirme que no habrá divulgaciones sin su consentimiento escrito.',
    },
  },
  {
    id: 'inquire_sliding_fee_zero_cost',
    topic: 'payment',
    text: {
      en: 'Inquire about sliding-fee discounts at an FQHC or Title X clinic based solely on the minor’s personal income ($0 cost) to avoid insurance billing completely.',
      es: 'Consulte sobre tarifas según ingresos en un FQHC o clínica Title X basadas solo en los ingresos del menor ($0 costo).',
    },
  },
  {
    id: 'ask_about_acra_mdft_programs',
    topic: 'clinical',
    text: {
      en: 'Ask if the program offers youth-tailored evidence-based modalities like A-CRA, MDFT, or youth contingency management.',
      es: 'Pregunte si el programa ofrece modalidades basadas en evidencia como A-CRA, MDFT o manejo de contingencias juvenil.',
    },
  },
  {
    id: 'evaluate_moud_buprenorphine',
    topic: 'medical',
    text: {
      en: 'If opioids or counterfeit pressed pills are involved, ask the doctor about buprenorphine pharmacotherapy and obtain take-home naloxone.',
      es: 'Si hay opioides o pastillas prensadas, pregunte sobre buprenorfina y obtenga naloxona para llevar a casa.',
    },
  },
  {
    id: 'dual_diagnosis_screening',
    topic: 'mental_health',
    text: {
      en: 'Request integrated dual-diagnosis evaluation for ADHD, anxiety, depression, or trauma/PTSD alongside substance use care.',
      es: 'Solicite una evaluación integrada de diagnóstico dual para TDAH, ansiedad, depresión o TEPT.',
    },
  },
  {
    id: 'save_crisis_contacts',
    topic: 'safety',
    text: {
      en: 'Save Crisis Text Line (Text HOME to 741741) and 988 in mobile phone contacts for instant private support.',
      es: 'Guarde la línea de texto (HOME al 741741) y el 988 en sus contactos móviles para apoyo inmediato.',
    },
  },
];

export const APPOINTMENT_CHECKLIST_ITEMS = [...CHECKLIST_ITEMS_DATA];
for (const item of CHECKLIST_ITEMS_DATA) {
  APPOINTMENT_CHECKLIST_ITEMS[item.id] = item;
}

// ============================================================================
// 7. Clinical Decision Engine: evaluateYouthCarePathway(inputs)
// ============================================================================

/**
 * Deterministic clinical decision logic evaluating youth care pathways in ephemeral RAM.
 *
 * @param {Object} inputs
 * @param {number} [inputs.age=16]
 * @param {string} [inputs.state='CA']
 * @param {string[]} [inputs.substances=[]] - e.g. ['opioids', 'cannabis', 'stimulants', 'alcohol', 'benzodiazepines']
 * @param {string} [inputs.familyInvolvement='supportive'] - 'supportive' | 'conflicted' | 'hostile_unsafe' | 'uninvolved'
 * @param {string} [inputs.confidentialityPriority='strict_confidential'] - 'strict_confidential' | 'open_family' | 'exploring'
 * @param {string} [inputs.withdrawalRisk='low'] - 'low' | 'moderate' | 'high_severe'
 * @param {string[]} [inputs.coOccurringConditions=[]] - e.g. ['adhd', 'trauma', 'depression_anxiety', 'conduct', 'none']
 * @param {boolean} [inputs.schoolOrLegalInvolvement=false]
 * @param {string} [inputs.housingStatus='stable'] - 'stable' | 'unstable' | 'runaway_unhoused'
 * @returns {Object} Evaluated care pathway recommendation
 */
export function evaluateYouthCarePathway(inputs = {}) {
  const age = typeof inputs.age === 'number' && !isNaN(inputs.age) ? inputs.age : 16;
  const stateCode = (inputs.state || 'CA').toUpperCase();
  const substances = Array.isArray(inputs.substances) ? inputs.substances : [];
  const familyInvolvement = inputs.familyInvolvement || 'supportive';
  const confidentialityPriority = inputs.confidentialityPriority || 'strict_confidential';
  const withdrawalRisk = inputs.withdrawalRisk || 'low';
  const coOccurring = Array.isArray(inputs.coOccurringConditions) ? inputs.coOccurringConditions : [];
  const schoolOrLegal = Boolean(inputs.schoolOrLegalInvolvement);
  const housingStatus = inputs.housingStatus || 'stable';

  const isMinor = age < 18;

  // 1. Determine Minor Consent Eligibility for Outpatient Care
  const stateStandard = MINOR_CONSENT_STANDARDS[stateCode] || MINOR_CONSENT_STANDARDS['default'];
  const minAgeThreshold = stateStandard.minAge || 14;

  let canConsentAloneOutpatient = false;
  if (!isMinor) {
    canConsentAloneOutpatient = true;
  } else if (age >= minAgeThreshold) {
    canConsentAloneOutpatient = true;
  } else {
    canConsentAloneOutpatient = false;
  }

  // 2. Recommended ASAM Level of Care
  let recommendedLevel;
  if (withdrawalRisk === 'high_severe') {
    recommendedLevel = {
      asamLevel: 'Level 3.7 / 4',
      code: 'MED_MANAGED_WITHDRAWAL',
      name: {
        en: 'Medically Managed Inpatient Withdrawal & Crisis Stabilization',
        es: 'Manejo Médico de Abstinencia en Régimen de Internamiento y Estabilización de Crisis',
      },
      description: {
        en: '24-hour pediatric/adolescent medical and nursing monitoring to safely manage potentially life-threatening acute withdrawal symptoms from sedatives, alcohol, or high-potency opioids.',
        es: 'Monitoreo médico y de enfermería pediátrica las 24 horas para controlar de manera segura síntomas graves de abstinencia de sedantes, alcohol u opioides de alta potencia.',
      },
      clinicalRationale: {
        en: 'High acute withdrawal risk in adolescent physiology requires immediate clinical stabilization to prevent seizures, respiratory failure, or severe complications.',
        es: 'El riesgo elevado de abstinencia aguda en adolescentes exige estabilización clínica inmediata para evitar convulsiones o paro respiratorio.',
      },
    };
  } else if (housingStatus === 'runaway_unhoused' || (familyInvolvement === 'hostile_unsafe' && (withdrawalRisk === 'moderate' || substances.length >= 2))) {
    recommendedLevel = {
      asamLevel: 'Level 3.5',
      code: 'CLINICALLY_MANAGED_RESIDENTIAL',
      name: {
        en: 'Clinically Managed Medium-to-High-Intensity Residential Youth Care',
        es: 'Atención Residencial de Mediana a Alta Intensidad para Jóvenes',
      },
      description: {
        en: 'Safe, structured 24-hour therapeutic living environment integrating trauma-informed counseling, education continuity, and life-skills development away from an unsafe recovery environment.',
        es: 'Entorno de vida terapéutico estructurado las 24 horas con terapia informada en trauma, continuidad educativa y desarrollo de habilidades en un ambiente seguro.',
      },
      clinicalRationale: {
        en: 'Dimension 6 environmental hazards (housing instability or abusive home environment) make safe recovery impossible in an ambulatory outpatient setting.',
        es: 'Los riesgos del entorno (inestabilidad de vivienda o ambiente hostil) imposibilitan la recuperación segura en un entorno ambulatorio.',
      },
    };
  } else if (withdrawalRisk === 'moderate' || (coOccurring.length >= 2 && schoolOrLegal)) {
    recommendedLevel = {
      asamLevel: 'Level 2.1',
      code: 'INTENSIVE_OUTPATIENT',
      name: {
        en: 'Intensive Outpatient Program (IOP) for Adolescents',
        es: 'Programa Ambulatorio Intensivo (IOP) para Adolescentes',
      },
      description: {
        en: 'Comprehensive outpatient care meeting 6 to 12 hours per week after school. Includes individual counseling, multidimensional family therapy (or youth group therapy), psychiatric medication management, and academic coordination.',
        es: 'Atención ambulatoria integral de 6 a 12 horas semanales después de la escuela con terapia individual, familiar, manejo psiquiátrico y apoyo escolar.',
      },
      clinicalRationale: {
        en: 'Balances intensive therapeutic dosing with the preservation of school attendance, peer connections, and home routines.',
        es: 'Equilibra terapia intensiva manteniendo asistencia a clases, apoyo de pares y vida en el hogar.',
      },
    };
  } else {
    recommendedLevel = {
      asamLevel: 'Level 1',
      code: 'OUTPATIENT_COUNSELING',
      name: {
        en: 'Outpatient Adolescent Counseling & Behavioral Health Care',
        es: 'Consejería y Atención Ambulatoria para Adolescentes',
      },
      description: {
        en: 'Weekly or bi-weekly scheduled visits focusing on evidence-based therapies (A-CRA, MET, CBT), contingency management, and harm reduction safety planning.',
        es: 'Sesiones semanales o quincenales enfocadas en terapias basadas en evidencia (A-CRA, MET, TCC), manejo de contingencias y plan de seguridad.',
      },
      clinicalRationale: {
        en: 'Appropriate for mild-to-moderate substance use with low acute withdrawal risk and adequate environmental stability.',
        es: 'Apropiado para uso leve a moderado con bajo riesgo de abstinencia y estabilidad ambiental adecuada.',
      },
    };
  }

  // 3. Evidence-Based Interventions Matching
  const evidenceBasedModalities = [];
  evidenceBasedModalities.push({
    id: 'acra',
    name: { en: 'Adolescent Community Reinforcement Approach (A-CRA)', es: 'Enfoque de Refuerzo Comunitario (A-CRA)' },
    suitability: { en: 'First-line behavioral modality for youth outpatient care', es: 'Modalidad de primera línea para atención ambulatoria juvenil' },
    description: { en: 'Builds positive pro-social reinforcers to make a healthy lifestyle more enjoyable than substance use.', es: 'Genera refuerzos prosociales positivos para que una vida saludable sea más atractiva que consumir sustancias.' },
  });

  if (familyInvolvement === 'supportive' || familyInvolvement === 'conflicted') {
    evidenceBasedModalities.push({
      id: 'mdft',
      name: { en: 'Multidimensional Family Therapy (MDFT)', es: 'Terapia Familiar Multidimensional (MDFT)' },
      suitability: { en: 'Highly recommended: supportive or conflicted family system present', es: 'Altamente recomendada: presencia de familia comprensiva o en conflicto' },
      description: { en: 'Heals family communication, strengthens parenting practices, and addresses school or legal stressors.', es: 'Restaura la comunicación familiar, fortalece pautas de crianza y aborda tensiones escolares o legales.' },
    });
  }

  if (substances.includes('stimulants') || substances.includes('cannabis') || schoolOrLegal) {
    evidenceBasedModalities.push({
      id: 'youth_cm',
      name: { en: 'Youth Contingency Management (Incentive Reinforcement)', es: 'Manejo de Contingencias Juvenil' },
      suitability: { en: 'High efficacy for stimulant/cannabis reduction and attendance', es: 'Alta eficacia para reducción de estimulantes/cannabis y asistencia' },
      description: { en: 'Provides immediate tangible rewards (vouchers/privileges) for verified negative screens and milestones.', es: 'Brinda recompensas tangibles inmediatas (vales/incentivos) por metas y pruebas negativas.' },
    });
  }

  if (substances.includes('opioids')) {
    evidenceBasedModalities.push({
      id: 'moud_adolescents',
      name: { en: 'MOUD Pharmacotherapy (Buprenorphine / Naltrexone)', es: 'Farmacoterapia MOUD (Buprenorfina / Naltrexona)' },
      suitability: { en: 'Standard of care for opioid use disorder (AAP & ASAM Guidelines)', es: 'Estándar de atención para adicción a opioides (Guías AAP y ASAM)' },
      description: { en: 'Buprenorphine stabilizes opioid cravings and cuts overdose mortality by over 50%.', es: 'La buprenorfina estabiliza el deseo y reduce la mortalidad por sobredosis en más del 50%.' },
    });
  }

  if (coOccurring.some((c) => ['adhd', 'trauma', 'depression_anxiety'].includes(c))) {
    evidenceBasedModalities.push({
      id: 'dual_diagnosis_cbt',
      name: { en: 'Integrated Dual-Diagnosis Trauma-Informed CBT / DBT Skills', es: 'TCC / TCD Integrada con Enfoque en Trauma' },
      suitability: { en: 'Targeted for co-occurring emotional, trauma, or attentional needs', es: 'Dirigida a necesidades emocionales, de trauma o de atención concurrentes' },
      description: { en: 'Teaches distress tolerance, emotional regulation, and symptom coping for ADHD, trauma, and anxiety.', es: 'Enseña tolerancia al malestar, autorregulación y manejo de síntomas de TDAH, trauma y ansiedad.' },
    });
  }

  // 4. Confidentiality Guidance & Action Steps
  const confidentialityGuidance = {
    applies42CFRPart2: canConsentAloneOutpatient && isMinor,
    summary: {
      en: canConsentAloneOutpatient && isMinor
        ? `Under state law (${stateStandard.statuteCitation || stateStandard.citation}) and federal 42 CFR Part 2 § 2.14, you have legal capacity to consent to confidential outpatient care. The clinic cannot notify parents or disclose records without your written permission.`
        : isMinor
        ? `In ${stateCode}, the minimum statutory age for independent minor consent is ${minAgeThreshold}. Because you are age ${age}, parental or legal guardian consent is generally required for non-emergency treatment.`
        : 'As an adult (age 18+), you possess full legal capacity to consent to medical care. 42 CFR Part 2 and HIPAA strictly protect your privacy from parents or third parties.',
      es: canConsentAloneOutpatient && isMinor
        ? `Bajo la ley estatal (${stateStandard.statuteCitation || stateStandard.citation}) y 42 CFR Parte 2 § 2.14, usted tiene capacidad legal para consentir a atención ambulatoria confidencial. La clínica no puede avisar a sus padres sin su autorización escrita.`
        : isMinor
        ? `En ${stateCode}, la edad mínima legal para consentimiento independiente es ${minAgeThreshold}. Al tener ${age} años, generalmente se requiere el consentimiento de los padres para atención no urgente.`
        : 'Como adulto (18+ años), usted tiene plena capacidad legal para consentir a su tratamiento. 42 CFR Parte 2 y HIPAA protegen su privacidad de forma estricta.',
    },
    eobRiskWarning: {
      en: 'Warning: If parental private health insurance is billed, the insurance company will send an Explanation of Benefits (EOB) statement home detailing diagnostic and billing codes.',
      es: 'Advertencia: Si se factura al seguro de salud de sus padres, la aseguradora enviará un Resumen de Beneficios (EOB) a casa detallando diagnósticos y códigos médicos.',
    },
    actionSteps: [
      {
        en: 'Ask the clinic to verify their 42 CFR Part 2 minor privacy protocol before signing any documents.',
        es: 'Pida a la clínica verificar su protocolo de privacidad bajo 42 CFR Parte 2 antes de firmar cualquier documento.',
      },
      {
        en: 'Request confidential communications under HIPAA 45 CFR § 164.522(b) to suppress or redirect mailings away from the home address.',
        es: 'Solicite comunicaciones confidenciales bajo HIPAA 45 CFR § 164.522(b) para redirigir o suprimir correspondencia a casa.',
      },
      {
        en: 'Opt for Title X or HRSA Federally Qualified Health Centers (FQHCs) offering sliding-scale ($0) care assessed on your personal income to avoid insurance billing.',
        es: 'Consulte en centros FQHC o clínicas Title X con tarifa según ingresos ($0) para evitar facturar al seguro.',
      },
    ],
  };

  // 5. Red Flags & Urgent Safety Alerts
  const redFlags = [];
  if (withdrawalRisk === 'high_severe') {
    redFlags.push({
      severity: 'emergency',
      title: { en: 'Acute Medical Withdrawal Hazard', es: 'Riesgo Agudo de Abstinencia Médica' },
      detail: {
        en: 'Severe acute withdrawal can cause seizures, cardiovascular collapse, or profound dehydration. Seek immediate evaluation at a pediatric emergency department.',
        es: 'La abstinencia aguda grave puede provocar convulsiones o deshidratación severa. Acuda de inmediato a emergencias pediátricas.',
      },
    });
  }

  if (housingStatus === 'runaway_unhoused' || familyInvolvement === 'hostile_unsafe') {
    redFlags.push({
      severity: 'warning',
      title: { en: 'Recovery Environment & Housing Vulnerability', es: 'Vulnerabilidad de Vivienda y Entorno' },
      detail: {
        en: 'Unsafe or hostile home environment presents an extreme risk of relapse and trauma. Prioritize confidential youth shelter and legal advocacy.',
        es: 'Un entorno hostil o inseguro eleva el riesgo de recaída y trauma. Priorice navegación a un refugio juvenil seguro.',
      },
    });
  }

  if (substances.includes('opioids')) {
    redFlags.push({
      severity: 'warning',
      title: { en: 'Fentanyl & Overdose Poisoning Risk', es: 'Riesgo Mortal de Fentanilo y Sobredosis' },
      detail: {
        en: 'Counterfeit pressed pills ("blues", fake prescription pills) are heavily contaminated with lethal fentanyl. Always test with test strips and carry Naloxone.',
        es: 'Las pastillas falsificadas están contaminadas con dosis letales de fentanilo. Use tiras reactivas y porte siempre naloxona.',
      },
    });
  }

  if (coOccurring.includes('trauma') && coOccurring.includes('depression_anxiety')) {
    redFlags.push({
      severity: 'advisory',
      title: { en: 'Dual-Diagnosis Mental Health Vulnerability', es: 'Vulnerabilidad de Diagnóstico Dual' },
      detail: {
        en: 'High co-morbidity of depression and trauma increases impulsive self-harm risk during substance withdrawal. Ensure 988 and 741741 are programmed into your phone.',
        es: 'La depresión y el trauma elevan el riesgo de autolesiones impulsivas. Guarde el 988 y el 741741 en sus contactos.',
      },
    });
  }

  // 6. Harm Reduction Plan
  const harmReductionPlan = {
    ftsProtocol: {
      en: substances.includes('stimulants')
        ? 'Stimulant Alert: High concentrations of methamphetamine or MDMA cause false positives on test strips. Dissolve completely using 1 teaspoon (5 mL) of water per 10 mg of substance.'
        : 'Counterfeit Pill Alert: Never test just a small scraped corner. Fentanyl is unevenly distributed; crush the entire pill, dissolve in water, and test the full mixture.',
      es: substances.includes('stimulants')
        ? 'Alerta Estimulantes: La metanfetamina o MDMA provocan falsos positivos si no se diluyen bien. Use 1 cucharadita (5 mL) de agua por cada 10 mg de sustancia.'
        : 'Alerta Pastillas Falsificadas: No raspe solo una esquina; el fentanilo está distribuido de forma desigual. Triture toda la pastilla, disuélvala en agua y pruebe la mezcla completa.',
    },
    naloxoneGuidance: {
      en: 'Minors can legally carry over-the-counter Naloxone (Narcan) in all 50 states without a prescription. Good Samaritan laws provide immunity from drug possession charges when calling 911 for an overdose.',
      es: 'Los menores pueden portar naloxona (Narcan) legalmente en los 50 estados sin receta. Las leyes del Buen Samaritano otorgan inmunidad al llamar al 911 en una sobredosis.',
    },
    crisisContacts: HARM_REDUCTION_DATA.find((h) => h.id === 'crisis_text_and_hotlines')?.resources || [],
  };

  return {
    age,
    isMinor,
    stateCode,
    canConsentAloneOutpatient,
    minAgeThreshold,
    statuteCitation: stateStandard.statuteCitation || stateStandard.citation || 'State Behavioral Health Minor Consent Statutes',
    statutorySummary: stateStandard.summary,
    inpatientRule: stateStandard.inpatientRule || {
      en: 'Inpatient and residential rehabilitation almost universally requires parental/guardian consent or a juvenile court order.',
      es: 'El internamiento y rehabilitación residencial casi siempre exige consentimiento de los padres, tutores o una orden judicial.',
    },
    recommendedLevel,
    evidenceBasedModalities,
    confidentialityGuidance,
    harmReductionPlan,
    redFlags,
  };
}

// ============================================================================
// 8. Ephemeral State Management (100% In-RAM)
// ============================================================================

function initialEphemeralState() {
  return {
    activeTab: 'overview',
    lang: getLang() === 'es' ? 'es' : 'en',
    inputs: {
      age: 16,
      state: 'CA',
      substances: ['opioids'],
      familyInvolvement: 'supportive',
      confidentialityPriority: 'strict_confidential',
      withdrawalRisk: 'low',
      coOccurringConditions: [],
      schoolOrLegalInvolvement: false,
      housingStatus: 'stable',
    },
    checklist: {},
    notes: '',
  };
}

let adolescentState = initialEphemeralState();

export function getAdolescentState() {
  return {
    ...adolescentState,
    inputs: {
      ...adolescentState.inputs,
      substances: [...adolescentState.inputs.substances],
      coOccurringConditions: [...adolescentState.inputs.coOccurringConditions],
    },
    checklist: { ...adolescentState.checklist },
  };
}

export function setAdolescentState(patch) {
  if (!patch || typeof patch !== 'object') return getAdolescentState();
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'inputs' && typeof value === 'object' && value !== null) {
      adolescentState.inputs = { ...adolescentState.inputs, ...value };
    } else if (key === 'checklist' && typeof value === 'object' && value !== null) {
      adolescentState.checklist = { ...adolescentState.checklist, ...value };
    } else {
      adolescentState[key] = value;
    }
  }
  return getAdolescentState();
}

export function resetAdolescentState() {
  adolescentState = initialEphemeralState();
  return getAdolescentState();
}

// ============================================================================
// 9. Plaintext Handout Formatter: formatAdolescentSummaryText(state)
// ============================================================================

export function formatAdolescentSummaryText(state = getAdolescentState()) {
  const isEs = state.lang === 'es';
  const tr = (enText, esText) => (isEs ? esText : enText);

  const evaluation = evaluateYouthCarePathway(state.inputs);
  const lines = [];

  lines.push('================================================================================');
  lines.push(
    isEs
      ? 'HARBORPATH: GUIA CLINICA Y DERECHOS LEGALES EN SALUD JUVENIL'
      : 'HARBORPATH: ADOLESCENT & YOUTH SUBSTANCE USE CARE & LEGAL RIGHTS GUIDE'
  );
  lines.push('================================================================================');
  lines.push(tr('Session Mode: 100% Ephemeral In-RAM (Zero Tracking, Zero Storage)', 'Modo de Sesion: 100% Efimero en Memoria RAM (Sin Rastreo, Sin Almacenamiento)'));
  lines.push(tr(`Target Patient Profile: Age ${state.inputs.age} | State Jurisdiction: ${state.inputs.state}`, `Perfil Evaluado: Edad ${state.inputs.age} | Jurisdiccion Estatal: ${state.inputs.state}`));
  lines.push('');

  lines.push(tr('--- 1. MINOR CONSENT LAWS & LEGAL CAPACITY ---', '--- 1. LEYES DE CONSENTIMIENTO DE MENORES Y CAPACIDAD LEGAL ---'));
  lines.push(tr(
    `Outpatient Consent Capacity: ${evaluation.canConsentAloneOutpatient ? 'ELIGIBLE TO CONSENT INDEPENDENTLY' : 'PARENTAL / GUARDIAN CONSENT REQUIRED'}`,
    `Capacidad de Consentimiento Ambulatorio: ${evaluation.canConsentAloneOutpatient ? 'ELEGIBLE PARA CONSENTIR DE FORMA INDEPENDIENTE' : 'REQUIERE CONSENTIMIENTO PARENTAL'}`
  ));
  lines.push(tr(`Statutory Authority: ${evaluation.statuteCitation}`, `Autoridad Estatutaria: ${evaluation.statuteCitation}`));
  lines.push(tr(`Summary: ${evaluation.statutorySummary[state.lang] || evaluation.statutorySummary.en}`, `Resumen: ${evaluation.statutorySummary[state.lang] || evaluation.statutorySummary.en}`));
  lines.push(tr(`Inpatient Standard: ${evaluation.inpatientRule[state.lang] || evaluation.inpatientRule.en}`, `Norma de Internamiento: ${evaluation.inpatientRule[state.lang] || evaluation.inpatientRule.en}`));
  lines.push('');

  lines.push(tr('--- 2. FEDERAL CONFIDENTIALITY (42 CFR PART 2 § 2.14 & HIPAA) ---', '--- 2. CONFIDENCIALIDAD FEDERAL (42 CFR PARTE 2 § 2.14 Y HIPAA) ---'));
  lines.push(tr(
    `Federal 42 CFR Part 2 Protection: ${evaluation.confidentialityGuidance.applies42CFRPart2 ? 'STRICT CONFIDENTIALITY APPLIES' : 'STANDARD PRIVACY SAFEGUARDS'}`,
    `Proteccion Federal 42 CFR Parte 2: ${evaluation.confidentialityGuidance.applies42CFRPart2 ? 'APLICA CONFIDENCIALIDAD ESTRICTA' : 'SALVAGUARDAS DE PRIVACIDAD ESTANDAR'}`
  ));
  lines.push(evaluation.confidentialityGuidance.summary[state.lang] || evaluation.confidentialityGuidance.summary.en);
  lines.push('');
  lines.push(tr('CRITICAL EOB INSURANCE WARNING:', 'ADVERTENCIA CRITICA DE EOB DEL SEGURO:'));
  lines.push(evaluation.confidentialityGuidance.eobRiskWarning[state.lang] || evaluation.confidentialityGuidance.eobRiskWarning.en);
  lines.push(tr('Safeguard Action Steps:', 'Pasos de Accion Preventiva:'));
  for (const step of evaluation.confidentialityGuidance.actionSteps) {
    lines.push(`  * ${step[state.lang] || step.en}`);
  }
  lines.push('');

  lines.push(tr('--- 3. RECOMMENDED ASAM LEVEL OF CARE ---', '--- 3. NIVEL DE ATENCION ASAM RECOMENDADO ---'));
  lines.push(`${evaluation.recommendedLevel.asamLevel}: ${evaluation.recommendedLevel.name[state.lang] || evaluation.recommendedLevel.name.en}`);
  lines.push(evaluation.recommendedLevel.description[state.lang] || evaluation.recommendedLevel.description.en);
  lines.push(tr(`Clinical Rationale: ${evaluation.recommendedLevel.clinicalRationale[state.lang] || evaluation.recommendedLevel.clinicalRationale.en}`, `Justificacion Clinica: ${evaluation.recommendedLevel.clinicalRationale[state.lang] || evaluation.recommendedLevel.clinicalRationale.en}`));
  lines.push('');

  lines.push(tr('--- 4. EVIDENCE-BASED INTERVENTIONS FOR YOUTH ---', '--- 4. INTERVENCIONES BASADAS EN EVIDENCIA PARA JOVENES ---'));
  for (const mod of evaluation.evidenceBasedModalities) {
    lines.push(`* ${mod.name[state.lang] || mod.name.en} [${mod.suitability[state.lang] || mod.suitability.en}]`);
    lines.push(`  ${mod.description[state.lang] || mod.description.en}`);
  }
  lines.push('');

  lines.push(tr('--- 5. YOUTH HARM REDUCTION & OVERDOSE SAFETY PROTOCOLS ---', '--- 5. REDUCCION DE DANOS Y SEGURIDAD ANTE SOBREDOSIS ---'));
  lines.push(tr('Fentanyl Test Strip (FTS) Protocol:', 'Protocolo de Tiras de Fentanilo (FTS):'));
  lines.push(`  ${evaluation.harmReductionPlan.ftsProtocol[state.lang] || evaluation.harmReductionPlan.ftsProtocol.en}`);
  lines.push(tr('Naloxone Rights & Good Samaritan Protection:', 'Derechos de Naloxona y Proteccion del Buen Samaritano:'));
  lines.push(`  ${evaluation.harmReductionPlan.naloxoneGuidance[state.lang] || evaluation.harmReductionPlan.naloxoneGuidance.en}`);
  lines.push('');

  lines.push(tr('24/7 Free & Confidential Crisis Lines:', 'Lineas de Crisis Gratuitas y Confidenciales 24/7:'));
  lines.push('  * Crisis Text Line: Text HOME to 741741');
  lines.push('  * Suicide & Crisis Lifeline: Call or Text 988');
  lines.push('  * The Trevor Project (LGBTQ+ Youth): Call 1-866-488-7386 or Text START to 678-678');
  lines.push('  * Never Use Alone: Call 1-877-696-1996');
  lines.push('');

  if (evaluation.redFlags.length > 0) {
    lines.push(tr('--- URGENT CLINICAL & SAFETY ALERTS ---', '--- ALERTAS CLINICAS Y DE SEGURIDAD URGENTES ---'));
    for (const rf of evaluation.redFlags) {
      lines.push(`[${rf.severity.toUpperCase()}] ${rf.title[state.lang] || rf.title.en}: ${rf.detail[state.lang] || rf.detail.en}`);
    }
    lines.push('');
  }

  lines.push(tr('--- APPOINTMENT PREPARATION CHECKLIST ---', '--- LISTA DE PREPARACION DE CITA ---'));
  for (const item of APPOINTMENT_CHECKLIST_ITEMS) {
    const checked = Boolean(state.checklist[item.id]);
    const marker = checked ? '[X]' : '[ ]';
    lines.push(`${marker} ${item.text[state.lang] || item.text.en}`);
  }
  lines.push('');

  if (state.notes && state.notes.trim()) {
    lines.push(tr('--- CONFIDENTIAL USER QUESTIONS & NOTES (EPHEMERAL RAM) ---', '--- PREGUNTAS Y NOTAS CONFIDENCIALES (RAM EFIMERA) ---'));
    lines.push(state.notes.trim());
    lines.push('');
  }

  lines.push('================================================================================');
  lines.push(tr('END OF HARBORPATH ADOLESCENT CLINICAL REPORT', 'FIN DEL REPORTE CLINICO JUVENIL DE HARBORPATH'));
  lines.push('================================================================================');

  return lines.join('\n');
}

// ============================================================================
// 10. Interactive Adolescent Care Pathways View (DOM Component)
// ============================================================================

export function adolescentCareView({ query } = {}) {
  // Parse query params safely without mutating browser history or persistent state
  if (query) {
    if (query.tab && ['overview', 'consent_legal', 'confidentiality', 'asam', 'interventions', 'harm_reduction', 'navigator', 'checklist', 'handout'].includes(query.tab)) {
      setAdolescentState({ activeTab: query.tab });
    }
    if (query.state && typeof query.state === 'string') {
      setAdolescentState({ inputs: { state: query.state.toUpperCase() } });
    }
    if (query.lang && (query.lang === 'es' || query.lang === 'en')) {
      setAdolescentState({ lang: query.lang });
    }
  }
  // Follow the site language on every mount unless the link asked for one.
  // The in-view toggle below still switches for this visit.
  if (!(query?.lang === 'es' || query?.lang === 'en')) {
    setAdolescentState({ lang: getLang() === 'es' ? 'es' : 'en' });
  }

  const container = h('div', { class: 'view view-adolescent view-prose' });

  function render() {
    clear(container);
    const state = getAdolescentState();
    const isEs = state.lang === 'es';
    const tr = (enText, esText) => (isEs ? esText : enText);

    // ------------------------------------------------------------------------
    // Header & Privacy Callout
    // ------------------------------------------------------------------------
    const title = tr(
      'Adolescent & Youth Substance Use Care Pathways & Legal Guide',
      'Rutas de Atención y Guía Legal para Jóvenes y Adolescentes'
    );
    const lede = tr(
      'Developmentally adapted clinical standards, state minor consent laws (ages 12–17), federal 42 CFR Part 2 & HIPAA EOB confidentiality safeguards, youth-adapted ASAM criteria, and evidence-based care.',
      'Estándares clínicos adaptados al desarrollo juvenil, leyes estatales de consentimiento de menores (12–17 años), salvaguardas de confidencialidad federal (42 CFR Parte 2 e HIPAA), criterios ASAM y tratamientos basados en evidencia.'
    );

    const header = pageHeader(title, lede);

    // Language buttons
    const langBtnEn = h('button', {
      type: 'button',
      class: `btn btn-small ${!isEs ? 'btn-primary' : 'btn-ghost'}`,
      'aria-pressed': !isEs ? 'true' : 'false',
      onclick: () => {
        setAdolescentState({ lang: 'en' });
        announce('Language switched to English');
        render();
      },
    }, 'English');

    const langBtnEs = h('button', {
      type: 'button',
      class: `btn btn-small ${isEs ? 'btn-primary' : 'btn-ghost'}`,
      'aria-pressed': isEs ? 'true' : 'false',
      onclick: () => {
        setAdolescentState({ lang: 'es' });
        announce('Idioma cambiado a Español');
        render();
      },
    }, 'Español');

    const printBtn = h('button', {
      type: 'button',
      class: 'btn btn-small btn-secondary',
      onclick: () => {
        if (typeof window !== 'undefined' && typeof window.print === 'function') {
          window.print();
        }
      },
    }, icon('print'), tr(' Print Handout', ' Imprimir Folleto'));

    const copyBtn = h('button', {
      type: 'button',
      class: 'btn btn-small btn-ghost',
      onclick: async () => {
        const text = formatAdolescentSummaryText(getAdolescentState());
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(text);
            announce(tr('Clinical report copied to clipboard.', 'Reporte clínico copiado al portapapeles.'));
          } catch {
            // fallback
          }
        }
      },
    }, icon('copy'), tr(' Copy Summary', ' Copiar Resumen'));

    const resetBtn = h('button', {
      type: 'button',
      class: 'btn btn-small btn-emergency',
      'aria-label': tr('Quick Exit & Clear in-RAM Session', 'Salida Rápida y Borrar Sesión en RAM'),
      onclick: () => {
        resetAdolescentState();
        announce(tr('Adolescent session cleanly wiped from RAM.', 'Sesión juvenil borrada limpiamente de la memoria RAM.'));
        render();
      },
    }, icon('close'), tr(' Quick Exit / Reset RAM', ' Salida Rápida / Reiniciar RAM'));

    const controlsBar = h('div', { class: 'actions adolescent-controls no-print', role: 'toolbar', 'aria-label': tr('Session tools', 'Herramientas de sesión') },
      langBtnEn,
      langBtnEs,
      printBtn,
      copyBtn,
      resetBtn
    );

    // Privacy Banner
    const privacyBanner = h('div', { class: 'callout callout-info adolescent-privacy-banner' },
      h('p', { class: 'callout-title' }, icon('shield'), tr('In-RAM Ephemeral Decision Support', 'Herramienta en Memoria RAM Efímera')),
      h('p', null, tr(
        'HarborPath does not track you, does not use tracking cookies, and answers are held in temporary browser memory only. Your selected age, state, and answers clear when you close or refresh this tab.',
        'HarborPath no rastrea a los usuarios, no usa cookies de rastreo y sus respuestas se mantienen solo en la memoria temporal del navegador. Sus datos se limpian al cerrar o actualizar la pestaña.'
      ))
    );

    // Crisis Hotline Callout Banner
    const crisisBanner = h('aside', { class: 'callout callout-emergency adolescent-hotlines', 'aria-label': tr('Youth crisis hotlines', 'Líneas de crisis juvenil') },
      h('p', { class: 'callout-title' }, icon('heart'), tr('24/7 Free, Confidential Youth Crisis Support', 'Líneas de Ayuda Confidenciales y Gratuitas 24/7')),
      h('ul', { class: 'list' },
        h('li', null, strong(tr('Crisis Text Line: ', 'Línea de Texto en Crisis: ')), sms('741741', 'HOME', 'Text HOME to 741741', { class: 'btn btn-small btn-secondary' }), tr(' - Free, 24/7 confidential crisis texting.', ' - Mensajes de texto confidenciales 24/7.')),
        h('li', null, strong(tr('Suicide & Crisis Lifeline: ', 'Línea 988: ')), tel('988', 'Call/Text 988', { class: 'btn btn-small btn-primary' }), tr(' - Mental health & substance crisis.', ' - Crisis de salud mental y sustancias.')),
        h('li', null, strong(tr('The Trevor Project (LGBTQ+ Youth): ', 'The Trevor Project (Jóvenes LGBTQ+): ')), tel('18664887386', '1-866-488-7386', { class: 'btn btn-small btn-secondary' }), tr(' or text START to 678-678.', ' o envíe START al 678-678.')),
        h('li', null, strong(tr('Never Use Alone: ', 'Never Use Alone: ')), tel('18776961996', '1-877-696-1996', { class: 'btn btn-small btn-ghost' }), tr(' - Overdose detection lifeline.', ' - Línea de prevención de sobredosis.'))
      )
    );

    // ------------------------------------------------------------------------
    // Tab Navigation
    // ------------------------------------------------------------------------
    const TABS = [
      { id: 'overview', label: { en: 'Overview', es: 'General' } },
      { id: 'consent_legal', label: { en: 'Minor Consent Laws', es: 'Leyes de Consentimiento' } },
      { id: 'confidentiality', label: { en: '42 CFR & EOB Privacy', es: '42 CFR y Privacidad EOB' } },
      { id: 'asam', label: { en: 'Youth ASAM Dimensions', es: 'Dimensiones ASAM' } },
      { id: 'interventions', label: { en: 'Evidence-Based Treatments', es: 'Tratamientos Basados en Evidencia' } },
      { id: 'harm_reduction', label: { en: 'Youth Harm Reduction', es: 'Reducción de Daños' } },
      { id: 'navigator', label: { en: 'Pathway Navigator', es: 'Navegador de Rutas' } },
      { id: 'checklist', label: { en: 'Appointment Checklist', es: 'Lista de Preparación' } },
      { id: 'handout', label: { en: 'Printable Handout', es: 'Folleto Imprimible' } },
    ];

    const tabList = h('div', { class: 'tabs no-print', role: 'tablist', 'aria-label': tr('Adolescent care tabs', 'Pestañas de atención juvenil') });
    for (const tab of TABS) {
      const isActive = state.activeTab === tab.id;
      const btn = h('button', {
        type: 'button',
        role: 'tab',
        class: `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`,
        id: `tab-${tab.id}`,
        'aria-selected': isActive ? 'true' : 'false',
        'aria-controls': `panel-${tab.id}`,
        onclick: () => {
          setAdolescentState({ activeTab: tab.id });
          announce(tr(`Switched to tab: ${tab.label.en}`, `Cambiado a pestaña: ${tab.label.es}`));
          render();
        },
      }, tab.label[state.lang] || tab.label.en);
      tabList.append(btn);
    }

    // ------------------------------------------------------------------------
    // Tab Panel 1: Overview
    // ------------------------------------------------------------------------
    const overviewPanel = section('panel-overview', tr('Clinical & Legal Foundations for Youth Care', 'Fundamentos Clínicos y Legales para la Atención Juvenil'));
    overviewPanel.setAttribute('role', 'tabpanel');
    overviewPanel.setAttribute('aria-labelledby', 'tab-overview');
    overviewPanel.hidden = state.activeTab !== 'overview';

    overviewPanel.append(
      p(tr(
        'Adolescents and transitional-aged youth (ages 12–25) require developmentally tailored substance use care that respects autonomy, protects confidentiality from parents when requested, and addresses complex systemic factors like peer groups, school, and family dynamics.',
        'Los adolescentes y jóvenes en transición (12–25 años) requieren atención adaptada a su desarrollo que respete su autonomía, proteja la confidencialidad frente a los padres cuando se solicite y atienda factores complejos como amigos, escuela y familia.'
      )),
      h('div', { class: 'card' },
        h('h3', null, tr('Key Principles of Adolescent Substance Use Care', 'Principios Clave de la Atención Juvenil en Adicciones')),
        ul([
          tr('Minor Consent Authority: In many U.S. states, youth ages 12–17 can independently consent to confidential outpatient counseling, diagnosis, and medical treatment without parental knowledge or consent.', 'Autoridad de Consentimiento del Menor: En muchos estados, jóvenes de 12–17 años pueden consentir de forma independiente a terapia y atención ambulatoria sin conocimiento de sus padres.'),
          tr('Federal Confidentiality under 42 CFR Part 2: If a minor has state legal capacity to consent to treatment, disclosure of records or confirmation of care to parents is strictly prohibited without the youth’s written release.', 'Confidencialidad Federal bajo 42 CFR Parte 2: Si el menor tiene capacidad estatal de consentimiento, la divulgación a padres está prohibida sin autorización por escrito del joven.'),
          tr('The EOB Insurance Threat: Private insurance Explanation of Benefits (EOB) statements sent home are the leading source of unintentional privacy breaches. Request HIPAA § 164.522 confidential communications or utilize safety-net FQHC / Title X clinics.', 'Riesgo de EOB del Seguro Privado: Los estados de cuenta enviados a casa son la mayor causa de filtración de privacidad. Solicite comunicaciones confidenciales bajo HIPAA o use clínicas FQHC/Title X.'),
          tr('Developmentally Adapted ASAM Criteria: Evaluating withdrawal risks, ongoing prefrontal cortex maturation, high rates of co-occurring ADHD and trauma, and environmental systems.', 'Criterios ASAM Adaptados al Desarrollo: Evaluación de riesgos de abstinencia, maduración de la corteza prefrontal, TDAH, trauma y factores del entorno.'),
          tr('Youth-Centered Harm Reduction: Precise FTS dilution for counterfeit pressed pills ("blues") and stimulants, OTC naloxone carrying rights, and 24/7 crisis texting.', 'Reducción de Daños Centrada en Jóvenes: Dilución exacta de tiras de fentanilo en pastillas falsas, derecho a portar naloxona y líneas de texto 24/7.'),
        ])
      )
    );

    // ------------------------------------------------------------------------
    // Tab Panel 2: Minor Consent Laws
    // ------------------------------------------------------------------------
    const consentPanel = section('panel-consent_legal', tr('State Minor Consent Laws for Substance Use Treatment', 'Leyes Estatales de Consentimiento de Menores para Tratamiento'));
    consentPanel.setAttribute('role', 'tabpanel');
    consentPanel.setAttribute('aria-labelledby', 'tab-consent_legal');
    consentPanel.hidden = state.activeTab !== 'consent_legal';

    const consentList = h('div', { class: 'accordion' });
    for (const guide of MINOR_CONSENT_DATA) {
      const card = h('article', { class: 'card consent-card' },
        h('h3', null, guide.title[state.lang] || guide.title.en),
        guide.statuteCitation && h('p', { class: 'fine' }, strong(tr('Statute: ', 'Estatuto: ')), guide.statuteCitation),
        guide.minAge && h('p', { class: 'chips' }, h('span', { class: 'chip chip-extra' }, tr(`Minimum Age: ${guide.minAge}+`, `Edad Mínima: ${guide.minAge}+ años`))),
        p(guide.summary[state.lang] || guide.summary.en),
        guide.keyPoints && ul(guide.keyPoints.map((kp) => `${kp.topic[state.lang] || kp.topic.en}: ${kp.detail[state.lang] || kp.detail.en}`)),
        guide.inpatientRule && p(strong(tr('Inpatient Rule: ', 'Regla de Internamiento: ')), guide.inpatientRule[state.lang] || guide.inpatientRule.en),
        guide.parentalNotice && p(strong(tr('Parental Notification: ', 'Notificación a Padres: ')), guide.parentalNotice[state.lang] || guide.parentalNotice.en)
      );
      consentList.append(card);
    }
    consentPanel.append(consentList);

    // ------------------------------------------------------------------------
    // Tab Panel 3: Confidentiality & 42 CFR Part 2
    // ------------------------------------------------------------------------
    const confPanel = section('panel-confidentiality', tr('Federal Confidentiality Protections & Insurance EOB Safeguards', 'Protección Federal de Confidencialidad y Salvaguardas EOB'));
    confPanel.setAttribute('role', 'tabpanel');
    confPanel.setAttribute('aria-labelledby', 'tab-confidentiality');
    confPanel.hidden = state.activeTab !== 'confidentiality';

    for (const item of CONFIDENTIALITY_DATA) {
      const card = h('article', { class: 'card confidentiality-card' },
        h('h3', null, item.title[state.lang] || item.title.en),
        p(item.summary[state.lang] || item.summary.en),
        item.keyRules && ul(item.keyRules.map((kr) => `${kr.topic[state.lang] || kr.topic.en}: ${kr.detail[state.lang] || kr.detail.en}`)),
        item.citation && p(fine(strong(tr('Legal Citation: ', 'Cita Legal: ')), item.citation))
      );
      confPanel.append(card);
    }

    // ------------------------------------------------------------------------
    // Tab Panel 4: Youth ASAM Dimensions
    // ------------------------------------------------------------------------
    const asamPanel = section('panel-asam', tr('Youth-Adapted ASAM Criteria (Dimensions 1–6)', 'Criterios ASAM Adaptados a Jóvenes (Dimensiones 1–6)'));
    asamPanel.setAttribute('role', 'tabpanel');
    asamPanel.setAttribute('aria-labelledby', 'tab-asam');
    asamPanel.hidden = state.activeTab !== 'asam';

    for (const dim of YOUTH_ASAM_DATA) {
      const card = h('article', { class: 'card asam-dimension-card' },
        h('h3', null, `${dim.title[state.lang] || dim.title.en}`),
        p(dim.summary[state.lang] || dim.summary.en),
        ul(dim.clinicalFocus.map((cf) => `${cf.topic[state.lang] || cf.topic.en}: ${cf.detail[state.lang] || cf.detail.en}`)),
        p(fine(strong(tr('Clinical Assessment Target: ', 'Objetivo de Evaluación Clínica: ')), dim.asamAssessmentNote))
      );
      asamPanel.append(card);
    }

    // ------------------------------------------------------------------------
    // Tab Panel 5: Evidence-Based Interventions
    // ------------------------------------------------------------------------
    const interventionsPanel = section('panel-interventions', tr('Evidence-Based Treatments for Adolescents & Young Adults', 'Tratamientos Basados en Evidencia para Jóvenes y Adolescentes'));
    interventionsPanel.setAttribute('role', 'tabpanel');
    interventionsPanel.setAttribute('aria-labelledby', 'tab-interventions');
    interventionsPanel.hidden = state.activeTab !== 'interventions';

    for (const item of INTERVENTIONS_DATA) {
      const card = h('article', { class: 'card intervention-card' },
        h('h3', null, item.name[state.lang] || item.name.en),
        h('p', { class: 'chips' }, h('span', { class: 'chip chip-extra' }, item.evidenceTier)),
        p(item.summary[state.lang] || item.summary.en),
        h('h4', null, tr('Core Clinical Components:', 'Componentes Clínicos Principales:')),
        ul(item.keyElements)
      );
      interventionsPanel.append(card);
    }

    // ------------------------------------------------------------------------
    // Tab Panel 6: Youth Harm Reduction
    // ------------------------------------------------------------------------
    const harmReductionPanel = section('panel-harm_reduction', tr('Youth Harm Reduction, Test Strips & Crisis Texting', 'Reducción de Daños, Tiras Reactivas y Líneas de Texto en Crisis'));
    harmReductionPanel.setAttribute('role', 'tabpanel');
    harmReductionPanel.setAttribute('aria-labelledby', 'tab-harm_reduction');
    harmReductionPanel.hidden = state.activeTab !== 'harm_reduction';

    for (const hr of HARM_REDUCTION_DATA) {
      const card = h('article', { class: 'card harm-reduction-card' },
        h('h3', null, hr.title[state.lang] || hr.title.en),
        p(hr.summary[state.lang] || hr.summary.en),
        hr.stepByStep && h('ol', { class: 'list-ordered' }, hr.stepByStep.map((s) => h('li', null, s))),
        hr.resources && h('ul', { class: 'list' }, hr.resources.map((r) => h('li', null,
          strong(r.name), ': ', strong(r.action), ' - ', r.desc[state.lang] || r.desc.en
        )))
      );
      harmReductionPanel.append(card);
    }

    // ------------------------------------------------------------------------
    const inhalantAdolescentCard = h('article', { class: 'card harm-reduction-card' },
      h('h3', null, tr('Volatile Substances, Inhalants & Nitrous Oxide Safety', 'Sustancias Volátiles, Inhalantes y Seguridad con Óxido Nitroso')),
      p(tr(
        'Youth and young adults face severe risks from pressurized nitrous oxide tanks (B12 spinal degeneration and frostbite) and aerosol computer dusters (Sudden Sniffing Death Syndrome from adrenaline spikes). Access clinical decision support and harm reduction directives:',
        'Los jóvenes enfrentan graves riesgos por el óxido nitroso presurizado (degeneración medular y congelación) y aerosoles/dusters (síndrome de muerte súbita por descarga de adrenalina). Acceda a pautas clínicas de reducción de daños:'
      )),
      h('p', { class: 'cross-nav-p' },
        h('a', { class: 'btn btn-secondary', href: '#/inhalant-care' }, tr('Inhalants, Solvents & Nitrous Oxide Navigator →', 'Navegador de Inhalantes, Solventes y Óxido Nitroso →'))
      )
    );
    harmReductionPanel.append(inhalantAdolescentCard);

    // Tab Panel 7: Interactive Youth Pathway Decision Aid (Navigator)
    // ------------------------------------------------------------------------
    const navPanel = section('panel-navigator', tr('Interactive Ephemeral Pathway Navigator & Decision Aid', 'Navegador de Rutas y Asistente de Decisión Efímero'));
    navPanel.setAttribute('role', 'tabpanel');
    navPanel.setAttribute('aria-labelledby', 'tab-navigator');
    navPanel.hidden = state.activeTab !== 'navigator';

    const evaluation = evaluateYouthCarePathway(state.inputs);

    // Interactive Form Controls
    const form = h('div', { class: 'card pathway-form no-print' },
      h('h3', null, tr('Youth Clinical & Confidentiality Assessment Inputs', 'Datos Clínicos y de Confidencialidad del Joven')),
      p(fine(tr(
        'Adjust the parameters below to explore state consent rules, 42 CFR Part 2 privacy protections, and recommended levels of care in ephemeral RAM.',
        'Ajuste los parámetros para explorar reglas de consentimiento, privacidad bajo 42 CFR Parte 2 y niveles de atención en la memoria RAM.'
      ))),

      // Age and State Row
      h('div', { class: 'actions form-row' },
        h('label', { for: 'input-age' }, tr('Age: ', 'Edad: '),
          h('select', {
            id: 'input-age',
            class: 'select',
            onchange: (e) => {
              setAdolescentState({ inputs: { age: parseInt(e.target.value, 10) } });
              render();
            },
          }, [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 24].map((a) => {
            const opt = h('option', { value: String(a) }, String(a));
            if (a === state.inputs.age) opt.setAttribute('selected', '');
            return opt;
          }))
        ),
        h('label', { for: 'input-state' }, tr('State Jurisdiction: ', 'Estado: '),
          h('select', {
            id: 'input-state',
            class: 'select',
            onchange: (e) => {
              setAdolescentState({ inputs: { state: e.target.value } });
              render();
            },
          }, ['CA', 'WA', 'OR', 'IL', 'NY', 'TX', 'FL', 'MD', 'MA', 'PA', 'CO', 'MI', 'OTHER'].map((st) => {
            const opt = h('option', { value: st }, st);
            if (st === state.inputs.state) opt.setAttribute('selected', '');
            return opt;
          }))
        )
      ),

      // Withdrawal Risk and Family Support
      h('div', { class: 'actions form-row' },
        h('label', { for: 'input-withdrawal' }, tr('Withdrawal Risk: ', 'Riesgo de Abstinencia: '),
          h('select', {
            id: 'input-withdrawal',
            class: 'select',
            onchange: (e) => {
              setAdolescentState({ inputs: { withdrawalRisk: e.target.value } });
              render();
            },
          }, [
            { id: 'low', label: { en: 'Low (Mild discomfort/anxiety)', es: 'Bajo (Malestar leve/ansiedad)' } },
            { id: 'moderate', label: { en: 'Moderate (Tremors, vomiting, sweating)', es: 'Moderado (Temblores, vómitos, sudor)' } },
            { id: 'high_severe', label: { en: 'Severe (Seizure risk, altered vitals)', es: 'Grave (Riesgo convulsivo, signos alterados)' } },
          ].map((w) => {
            const opt = h('option', { value: w.id }, w.label[state.lang] || w.label.en);
            if (w.id === state.inputs.withdrawalRisk) opt.setAttribute('selected', '');
            return opt;
          }))
        ),
        h('label', { for: 'input-family' }, tr('Family Environment: ', 'Entorno Familiar: '),
          h('select', {
            id: 'input-family',
            class: 'select',
            onchange: (e) => {
              setAdolescentState({ inputs: { familyInvolvement: e.target.value } });
              render();
            },
          }, [
            { id: 'supportive', label: { en: 'Supportive / Receptive to help', es: 'Comprensivo / Receptivo a ayudar' } },
            { id: 'conflicted', label: { en: 'Conflicted / Frequent arguments', es: 'En conflicto / Discusiones continuas' } },
            { id: 'hostile_unsafe', label: { en: 'Hostile / Abusive / Unsafe', es: 'Hostil / Violento / Inseguro' } },
            { id: 'uninvolved', label: { en: 'Uninvolved / Estranged', es: 'Ausente / Distanciado' } },
          ].map((f) => {
            const opt = h('option', { value: f.id }, f.label[state.lang] || f.label.en);
            if (f.id === state.inputs.familyInvolvement) opt.setAttribute('selected', '');
            return opt;
          }))
        )
      ),

      // Housing Status
      h('div', { class: 'actions form-row' },
        h('label', { for: 'input-housing' }, tr('Housing Status: ', 'Vivienda: '),
          h('select', {
            id: 'input-housing',
            class: 'select',
            onchange: (e) => {
              setAdolescentState({ inputs: { housingStatus: e.target.value } });
              render();
            },
          }, [
            { id: 'stable', label: { en: 'Stable Home Housing', es: 'Vivienda Estable' } },
            { id: 'unstable', label: { en: 'Unstable / Couch Surfing', es: 'Inestable / Quedándose con amigos' } },
            { id: 'runaway_unhoused', label: { en: 'Runaway / Unhoused / Shelter', es: 'En situación de calle / Albergue' } },
          ].map((hOpt) => {
            const opt = h('option', { value: hOpt.id }, hOpt.label[state.lang] || hOpt.label.en);
            if (hOpt.id === state.inputs.housingStatus) opt.setAttribute('selected', '');
            return opt;
          }))
        )
      )
    );

    // Results Display
    const resultsCard = h('div', { class: 'card results-card' },
      h('h3', null, tr('Tailored Care Pathway & Legal Analysis', 'Ruta de Atención Personalizada y Análisis Legal')),

      // Legal status badge
      h('div', { class: 'callout callout-info' },
        h('p', { class: 'callout-title' }, icon('check'),
          evaluation.canConsentAloneOutpatient
            ? tr('Outpatient Minor Consent Authority: ELIGIBLE', 'Autoridad de Consentimiento del Menor: ELEGIBLE')
            : tr('Outpatient Minor Consent Authority: PARENTAL CONSENT REQUIRED', 'Autoridad de Consentimiento del Menor: REQUIERE CONSENTIMIENTO DE PADRES')
        ),
        p(evaluation.statutorySummary[state.lang] || evaluation.statutorySummary.en),
        p(fine(strong(tr('Statutory Citation: ', 'Cita Legal: ')), evaluation.statuteCitation))
      ),

      // Recommended ASAM Level
      h('div', { class: 'card asam-result-card' },
        h('h4', null, tr(`Recommended ASAM Level: ${evaluation.recommendedLevel.asamLevel} - ${evaluation.recommendedLevel.name[state.lang] || evaluation.recommendedLevel.name.en}`, `Nivel ASAM Recomendado: ${evaluation.recommendedLevel.asamLevel} - ${evaluation.recommendedLevel.name[state.lang] || evaluation.recommendedLevel.name.en}`)),
        p(evaluation.recommendedLevel.description[state.lang] || evaluation.recommendedLevel.description.en),
        p(fine(strong(tr('Rationale: ', 'Justificación: ')), evaluation.recommendedLevel.clinicalRationale[state.lang] || evaluation.recommendedLevel.clinicalRationale.en))
      ),

      // Confidentiality & EOB Guidance
      h('div', { class: 'card eob-guidance-card' },
        h('h4', null, icon('shield'), ' ', tr('Confidentiality & EOB Protections', 'Confidencialidad y Protecciones de Facturación EOB')),
        p(evaluation.confidentialityGuidance.summary[state.lang] || evaluation.confidentialityGuidance.summary.en),
        p(strong(evaluation.confidentialityGuidance.eobRiskWarning[state.lang] || evaluation.confidentialityGuidance.eobRiskWarning.en)),
        ul(evaluation.confidentialityGuidance.actionSteps.map((s) => s[state.lang] || s.en))
      ),

      // Evidence-Based Modalities
      h('div', { class: 'card modalities-card' },
        h('h4', null, tr('Recommended Evidence-Based Programs', 'Programas Basados en Evidencia Recomendados')),
        ul(evaluation.evidenceBasedModalities.map((m) => `${m.name[state.lang] || m.name.en}: ${m.description[state.lang] || m.description.en}`))
      ),

      // Red Flags
      evaluation.redFlags.length > 0 && h('div', { class: 'callout callout-emergency red-flags-card' },
        h('p', { class: 'callout-title' }, icon('alert'), tr('Urgent Clinical & Safety Alerts', 'Alertas Clínicas y de Seguridad Urgentes')),
        ul(evaluation.redFlags.map((rf) => `${rf.title[state.lang] || rf.title.en}: ${rf.detail[state.lang] || rf.detail.en}`))
      )
    );

    navPanel.append(form, resultsCard);

    // ------------------------------------------------------------------------
    // Tab Panel 8: Appointment Preparation Checklist & Notes
    // ------------------------------------------------------------------------
    const checklistPanel = section('panel-checklist', tr('Appointment Preparation Checklist & Questions for the Doctor', 'Lista de Preparación para la Cita y Preguntas para el Médico'));
    checklistPanel.setAttribute('role', 'tabpanel');
    checklistPanel.setAttribute('aria-labelledby', 'tab-checklist');
    checklistPanel.hidden = state.activeTab !== 'checklist';

    const checklistForm = h('div', { class: 'card checklist-card' },
      h('h3', null, tr('Interactive Checklist (Stored 100% in Browser RAM)', 'Lista Interactiva (Guardada 100% en Memoria RAM)')),
      p(fine(tr(
        'Check off items as you prepare for your clinical appointment. Your answers exist solely in temporary RAM and will be cleared when you reset or close the browser.',
        'Marque los puntos al preparar su consulta. Sus respuestas solo existen en la memoria RAM y se borrarán al reiniciar o cerrar el navegador.'
      )))
    );

    for (const item of APPOINTMENT_CHECKLIST_ITEMS) {
      const isChecked = Boolean(state.checklist[item.id]);
      const cb = h('input', {
        type: 'checkbox',
        id: `check-${item.id}`,
        class: 'checkbox',
        checked: isChecked,
        onchange: (e) => {
          setAdolescentState({ checklist: { [item.id]: e.target.checked } });
          announce(tr(`Checklist item updated: ${item.text.en}`, `Elemento actualizado: ${item.text.es}`));
        },
      });

      const label = h('label', { for: `check-${item.id}`, class: 'checkbox-label' },
        cb,
        ' ',
        item.text[state.lang] || item.text.en
      );

      checklistForm.append(h('div', { class: 'checkbox-row' }, label));
    }

    // Notes textarea
    const notesCard = h('div', { class: 'card notes-card' },
      h('h3', null, tr('Private Questions & Notes for the Doctor / Counselor', 'Preguntas y Notas Privadas para el Médico o Consejero')),
      p(fine(tr(
        'Jot down questions about buprenorphine, confidentiality, school coordination, or therapy options. (Ephemeral RAM only).',
        'Anote dudas sobre buprenorfina, confidencialidad, apoyo escolar o terapias. (Memoria RAM efímera).'
      ))),
      h('textarea', {
        class: 'textarea adolescent-notes-input',
        rows: '4',
        placeholder: tr('e.g., Ask about HIPAA EOB suppression, ask if buprenorphine is available, ask about A-CRA...', 'ej., Preguntar sobre supresión de EOB bajo HIPAA, disponibilidad de buprenorfina...'),
        value: state.notes,
        oninput: (e) => {
          setAdolescentState({ notes: e.target.value });
        },
      })
    );

    checklistPanel.append(checklistForm, notesCard);

    // ------------------------------------------------------------------------
    // Tab Panel 9: Printable Handout View
    // ------------------------------------------------------------------------
    const handoutPanel = section('panel-handout', tr('Printable Clinical & Legal Summary Handout', 'Folleto Imprimible de Resumen Clínico y Legal'));
    handoutPanel.setAttribute('role', 'tabpanel');
    handoutPanel.setAttribute('aria-labelledby', 'tab-handout');
    handoutPanel.hidden = state.activeTab !== 'handout';

    const handoutCard = h('div', { class: 'print-handout adolescent-print-handout' },
      h('h2', { class: 'print-handout-title' }, tr('HarborPath Adolescent Care Pathway Handout', 'Folleto Clínico de Salud Juvenil de HarborPath')),
      p(fine(tr(
        'This printable summary contains your evaluated ASAM recommendations, legal minor consent citations, confidentiality safeguards, and appointment notes.',
        'Este resumen imprimible contiene sus recomendaciones ASAM, citas legales de consentimiento, salvaguardas de confidencialidad y notas.'
      ))),
      h('pre', { class: 'summary-text-box' }, formatAdolescentSummaryText(state))
    );

    handoutPanel.append(handoutCard);

    // Append all panels to container
    container.append(
      header,
      controlsBar,
      privacyBanner,
      crisisBanner,
      tabList,
      overviewPanel,
      consentPanel,
      confPanel,
      asamPanel,
      interventionsPanel,
      harmReductionPanel,
      navPanel,
      checklistPanel,
      handoutPanel
    );
  }

  render();
  return container;
}
