/**
 * Perinatal Substance Use Care Pathways View (public/js/views/perinatal.js)
 *
 * Comprehensive, trauma-informed clinical guidance for perinatal substance use:
 * 1. ACOG & SMFM Clinical Guidelines:
 *    - MOUD Standard of Care: Methadone and Buprenorphine maintenance during pregnancy.
 *      Why medically supervised withdrawal/detox is strictly contraindicated (uterine
 *      contractions, placental abruption, fetal distress, high relapse/overdose mortality).
 *    - Third Trimester Pharmacokinetics: CYP3A4 metabolic induction and 50% blood volume
 *      expansion requiring split-dosing (q12h) or dose escalation.
 *    - Labor & Delivery Pain Protocols: Multimodal analgesia (epidurals, scheduled NSAIDs,
 *      full-agonist opioids); strict contraindication of mixed agonist-antagonists
 *      (butorphanol [Stadol], nalbuphine [Nubain]).
 *    - Postpartum Vulnerability Window: Precipitous loss of opioid tolerance postpartum;
 *      fatal overdose risk mitigation; take-home naloxone; early 1–3 week clinical follow-up.
 *    - Lactation Guidance: Breastfeeding encouraged and safe with MOUD (minimal breastmilk
 *      transfer). HIV: replacement feeding if not virally suppressed on ART; shared decision-making
 *      for people on ART with sustained viral suppression (HHS Perinatal HIV Guidelines).
 *      Hepatitis C: avoid only with cracked/bleeding nipples.
 * 2. Neonatal Opioid Withdrawal Syndrome (NOWS / NAS) & Eat, Sleep, Console (ESC) Model:
 *    - Shift from traditional Finnegan scoring to family-centered ESC approach.
 *    - Functional assessment pillars: Eat, Sleep, Console.
 *    - Non-pharmacological care bundle: 24/7 rooming-in, skin-to-skin holding, quiet low-stimulation
 *      environment, ad libitum feeding, swaddling and non-nutritive sucking.
 * 3. CAPTA (Child Abuse Prevention and Treatment Act) Plans of Safe Care:
 *    - Non-punitive healthcare and community support plans vs. punitive child welfare reports.
 *    - Knowing your rights, state statutory variations, informed consent for toxicology, HIPAA access.
 * 4. Interactive Pregnancy Care Checklist & OB/GYN Discussion Guide:
 *    - Trimester-by-trimester interactive checklist with in-RAM state tracking.
 *    - Targeted questions for OB/GYN and hospital delivery team.
 *    - Printable, high-contrast, WCAG 2.2 AA compliant clinical handout.
 *
 * Strict Invariants:
 * - Zero npm dependencies (Node 20+ built-ins only).
 * - Zero raw markup injections (uses h() builder from dom.js).
 * - 100% ephemeral in-RAM state (answers exist strictly in temporary browser RAM).
 * - Quick Exit (resetPerinatalState()) cleanly wipes all in-RAM state.
 * - Complete en/es bilingual parity.
 */

import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong } from './common.js';
import { getLang } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetPerinatalState);

// ============================================================================
// 1. Evidence-Based Clinical Guidelines (ACOG & SMFM)
// ============================================================================

const GUIDELINES_DATA = [
  {
    id: 'moud_standard_of_care',
    title: {
      en: 'MOUD Maintenance as the First-Line Standard of Care (ACOG & SMFM)',
      es: 'MOUD como Estándar de Atención de Primera Línea en el Embarazo (ACOG y SMFM)',
    },
    summary: {
      en: 'Opioid agonist pharmacotherapy with methadone or buprenorphine is the established standard of care for opioid use disorder during pregnancy. Maintenance stabilizes maternal opioid plasma levels, protects against peaks and troughs, eliminates cycles of fetal withdrawal, and dramatically reduces maternal overdose mortality and fetal demise.',
      es: 'La farmacoterapia agonista con metadona o buprenorfina es el estándar de atención establecido para el trastorno por uso de opioides en el embarazo. El mantenimiento estabiliza los niveles plasmáticos maternos, protege contra picos y valles, previene la abstinencia fetal y reduce drásticamente la mortalidad materna.',
    },
    keyPoints: [
      {
        topic: {
          en: 'Medically Supervised Withdrawal (Detox) is Contraindicated',
          es: 'La desintoxicación o retirada médica está contraindicada',
        },
        detail: {
          en: 'ACOG and SMFM strongly advise against medically supervised withdrawal or detoxification during pregnancy. Abrupt withdrawal precipitates uterine hypertonicity, premature contractions, placental abruption, fetal distress, and carries a maternal relapse rate exceeding 80–90% with severe fatal overdose risks.',
          es: 'ACOG y SMFM desaconsejan enérgicamente la desintoxicación o suspensión abrupta de opioides durante el embarazo. La abstinencia aguda provoca contracciones uterinas, desprendimiento de placenta, sufrimiento fetal y una tasa de recaída superior al 80–90% con alto riesgo de muerte por sobredosis.',
        },
      },
      {
        topic: {
          en: 'Buprenorphine vs. Methadone',
          es: 'Buprenorfina frente a Metadona',
        },
        detail: {
          en: 'Both buprenorphine (partial mu-agonist) and methadone (full mu-agonist) are first-line agents. Buprenorphine is associated with shorter NOWS duration, less severe neonatal withdrawal, and lower medication needs for the neonate. Methadone offers superior treatment retention and can be started immediately without precipitated withdrawal risk.',
          es: 'Tanto la buprenorfina (agonista parcial) como la metadona (agonista completo) son de primera línea. La buprenorfina se asocia con un NOWS más breve y menos medicación neonatal. La metadona ofrece mayor retención terapéutica y puede iniciarse de inmediato sin riesgo de abstinencia precipitada.',
        },
      },
      {
        topic: {
          en: 'Combination Buprenorphine/Naloxone Safety',
          es: 'Seguridad de la combinación buprenorfina/naloxona',
        },
        detail: {
          en: 'While buprenorphine monotherapy was historically standard, current clinical guidelines confirm combination buprenorphine/naloxone (Suboxone) is safe, effective, and does not increase adverse maternal or neonatal outcomes due to negligible sublingual bioavailability of naloxone.',
          es: 'Aunque históricamente se prefería la monoterapia, las directrices actuales de ACOG confirman que la combinación buprenorfina/naloxona es segura y eficaz, ya que la naloxona por vía sublingual prácticamente no se absorbe.',
        },
      },
    ],
    clinicalCitations: [
      'ACOG Committee Opinion No. 711: Opioid Use and Opioid Use Disorder in Pregnancy',
      'SMFM Consult Series #43: Providing Antenatal and Intrapartum Care to Pregnant Persons with Opioid Use Disorder',
      'SAMHSA TIP 52: Clinical Guidance for Treating Pregnant and Parenting Women With Opioid Use Disorder',
    ],
  },
  {
    id: 'third_trimester_pk',
    title: {
      en: 'Third Trimester Pharmacokinetics & Split-Dosing Adjustments',
      es: 'Farmacocinética del Tercer Trimestre y Ajustes de Dosis Dividida',
    },
    summary: {
      en: 'Major physiological adaptations during the second half of pregnancy accelerate drug clearance. Expanded circulating plasma volume (up to +50%), increased renal glomerular filtration, and progesterone-mediated CYP3A4/CYP2B6 hepatic enzyme induction cause steep drops in maternal methadone and buprenorphine serum trough levels.',
      es: 'Las adaptaciones fisiológicas en la segunda mitad del embarazo aceleran la eliminación de fármacos. El aumento del volumen plasmático (+50%), mayor filtrado renal y la inducción de enzimas hepáticas CYP3A4/CYP2B6 por progesterona reducen drásticamente los niveles de metadona y buprenorfina.',
    },
    keyPoints: [
      {
        topic: {
          en: 'Split Dosing (q12h) & Dose Increases',
          es: 'Dosificación dividida (cada 12 horas) y aumento de dosis',
        },
        detail: {
          en: 'Late pregnancy withdrawal symptoms (abdominal cramping, diaphoresis, restless legs, insomnia, tachycardia) are often mistaken for normal pregnancy discomforts. Dose escalation and divided/split dosing (taking medication every 12 hours rather than once daily) maintain therapeutic trough levels and protect the fetus from withdrawal stress.',
          es: 'Los síntomas de abstinencia tardía (cólicos, sudoración, insomnio, taquicardia) suelen confundirse con achaques normales. El aumento de dosis y la dosificación dividida (cada 12 horas) mantienen niveles estables y protegen al feto del estrés de abstinencia.',
        },
      },
      {
        topic: {
          en: 'No Correlation Between Maternal Dose & NOWS Severity',
          es: 'Sin correlación entre dosis materna y severidad de NOWS',
        },
        detail: {
          en: 'Extensive clinical research demonstrates NO linear correlation between maternal MOUD dose and the severity or incidence of Neonatal Opioid Withdrawal Syndrome. Arbitrarily restricting maternal dosing to "protect the newborn" harms the mother and exposes the fetus to repeated withdrawal cycles.',
          es: 'La investigación clínica demuestra que NO existe correlación lineal entre la dosis materna de MOUD y la gravedad del NOWS. Restringir artificialmente la dosis materna para "proteger al bebé" perjudica a la madre y somete al feto a ciclos repetidos de abstinencia.',
        },
      },
    ],
    clinicalCitations: [
      'SMFM Consult Series #43 (2017/2021)',
      'ACOG Practice Bulletin No. 182: Gestational Diabetes and Opioid Pharmacokinetics',
    ],
  },
  {
    id: 'labor_delivery_pain',
    title: {
      en: 'Labor & Delivery Pain Management Protocols',
      es: 'Protocolos de Manejo del Dolor en Trabajo de Parto y Nacimiento',
    },
    summary: {
      en: 'MOUD maintenance does NOT provide analgesia for acute labor, delivery, or postpartum surgical pain. Patients on methadone or buprenorphine require aggressive, multimodal, non-punitive pain management without bias or undertreatment.',
      es: 'El mantenimiento con MOUD NO provee analgesia para el dolor agudo de parto, cesárea o posparto. Las pacientes en metadona o buprenorfina requieren analgesia multimodal oportuna, suficiente y sin prejuicios.',
    },
    keyPoints: [
      {
        topic: {
          en: 'Continuation of Baseline Maintenance',
          es: 'Continuidad de la dosis basal de mantenimiento',
        },
        detail: {
          en: 'Continue the patient’s regular buprenorphine or methadone dose on schedule throughout labor and delivery. Never withhold or delay maintenance medication during active labor.',
          es: 'Mantenga la dosis habitual de buprenorfina o metadona puntualmente durante el trabajo de parto. Nunca suspenda ni retrase la medicación de mantenimiento.',
        },
      },
      {
        topic: {
          en: 'Multimodal Analgesia Strategy',
          es: 'Estrategia de analgesia multimodal',
        },
        detail: {
          en: 'Combine early neuraxial analgesia (epidural, spinal block) with scheduled non-opioid medications (acetaminophen, oral/IV NSAIDs postpartum unless contraindicated). Full-agonist opioids (fentanyl, morphine, hydromorphone) must be provided for breakthrough pain; patients may require higher doses due to mu-receptor tolerance.',
          es: 'Combine anestesia regional temprana (epidural) con analgésicos no opioides programados (paracetamol, AINE posparto). Se deben suministrar opioides agonistas completos para el dolor agudo; la tolerancia previa puede requerir dosis superiores.',
        },
      },
      {
        topic: {
          en: 'CRITICAL CONTRAINDICATION: Mixed Agonist-Antagonists',
          es: 'CONTRAINDICACIÓN CRÍTICA: Agonistas-antagonistas mixtos',
        },
        detail: {
          en: 'Mixed opioid agonist-antagonists (butorphanol [Stadol], nalbuphine [Nubain], pentazocine [Talwin]) are strictly contraindicated. Administering these medications displaces buprenorphine/methadone from mu-receptors and precipitates immediate, violent acute opioid withdrawal in both parent and fetus.',
          es: 'Los agonistas-antagonistas mixtos (butorfanol [Stadol], nalbufina [Nubain], pentazocina) están estrictamente contraindicados. Desplazan el fármaco de los receptores mu y causan una abstinencia aguda y violenta en madre y feto.',
        },
      },
    ],
    clinicalCitations: [
      'ASAM National Practice Guideline for the Treatment of Opioid Use Disorder (2020)',
      'ACOG Obstetric Care Consensus No. 8: Interpregnancy Care and Intrapartum Analgesia',
    ],
  },
  {
    id: 'postpartum_vulnerability',
    title: {
      en: 'Postpartum Overdose Vulnerability Window',
      es: 'Ventana de Vulnerabilidad y Riesgo de Sobredosis Posparto',
    },
    summary: {
      en: 'The postpartum period—particularly the first 12 months—is the single highest-risk window for fatal maternal opioid overdose. Postpartum physiological resolution of CYP enzyme induction, rapid contraction of blood volume, severe sleep deprivation, mood disorders, and loss of receptor tolerance make harm reduction essential.',
      es: 'El periodo posparto (especialmente los primeros 12 meses) es la ventana de mayor riesgo de sobredosis materna mortal. La normalización enzimática, la reducción del volumen sanguíneo, la falta de sueño y la pérdida de tolerancia exigen medidas proactivas.',
    },
    keyPoints: [
      {
        topic: {
          en: 'Loss of Opioid Tolerance',
          es: 'Pérdida de tolerancia a opioides',
        },
        detail: {
          en: 'If a patient experienced any dose interruptions or stopped taking medication during or after delivery, opioid tolerance drops rapidly. Resuming pre-pregnancy illicit opioid doses carries an extreme risk of immediate respiratory arrest and death.',
          es: 'Cualquier interrupción o reducción del tratamiento reduce drásticamente la tolerancia. Reanudar dosis previas de la calle conlleva un riesgo extremo de paro respiratorio inmediato y fallecimiento.',
        },
      },
      {
        topic: {
          en: 'Harm Reduction & Early Clinical Follow-Up',
          es: 'Reducción de daños y seguimiento clínico temprano',
        },
        detail: {
          en: 'Co-prescribe take-home naloxone (Narcan) to all perinatal patients and train household partners. Schedule postpartum visits within 1–3 weeks (not the traditional 6 weeks) to verify mental health, social support, and MOUD stability.',
          es: 'Recete naloxona (Narcan) para llevar a casa y capacite a la familia. Programe consultas de seguimiento a las 1 a 3 semanas (no esperar a las 6 semanas) para evaluar salud mental, apoyo y estabilidad del tratamiento.',
        },
      },
    ],
    clinicalCitations: [
      'ACOG Committee Opinion No. 736: Optimizing Postpartum Care',
      'CDC Perinatal Quality Collaboratives: Maternal Mortality Review Committees (MMRCs)',
    ],
  },
  {
    id: 'lactation_guidance',
    title: {
      en: 'Lactation & Breastfeeding Clinical Guidance',
      es: 'Guía Clínica de Lactancia Materna y Alimentación Infantil',
    },
    summary: {
      en: 'Breastfeeding is strongly encouraged and safe for individuals stabilized on buprenorphine or methadone, regardless of maternal dose. Only minuscule concentrations transfer into human breast milk. Breastfeeding promotes maternal-infant bonding, reduces NOWS symptom severity, and significantly decreases newborn hospital length of stay.',
      es: 'La lactancia materna es muy recomendada y segura para personas en buprenorfina o metadona, independientemente de la dosis. Solo concentraciones mínimas pasan a la leche materna. Amamantar reduce la severidad del NOWS y acorta la estancia hospitalaria.',
    },
    keyPoints: [
      {
        topic: {
          en: 'Minimal Breastmilk Transfer & Oral Bioavailability',
          es: 'Mínima transferencia a la leche y baja biodisponibilidad oral',
        },
        detail: {
          en: 'Buprenorphine and methadone concentrations in human breast milk are clinically negligible (<1–3% of maternal weight-adjusted dose) with poor infant GI absorption. Maternal dose should NEVER be reduced to "allow" breastfeeding.',
          es: 'Las concentraciones en leche materna son clínicamente despreciables (<1–3% de la dosis materna ajustada por peso) con absorción mínima en el intestino del bebé. NUNCA se debe reducir la dosis materna para autorizar la lactancia.',
        },
      },
      {
        topic: {
          en: 'Specific Medical Contraindications',
          es: 'Contraindicaciones médicas específicas',
        },
        detail: {
          en: 'Breastfeeding is not recommended in: 1) Maternal HIV that is not virally suppressed on antiretroviral therapy (ART), where formula or banked pasteurized donor milk is recommended. Under current HHS Perinatal HIV Guidelines, people with HIV on ART with a sustained undetectable viral load should get patient-centered counseling and shared decision-making about formula, donor milk, or breastfeeding (transmission risk is under 1% but not zero), and those who choose to breastfeed should be supported by their HIV care team; 2) Active untreated tuberculosis; 3) Active untreated Hepatitis C ONLY IF nipples are visibly cracked or bleeding (intact breastmilk does NOT transmit Hep C); or 4) Active illicit street drug use (street fentanyl, methamphetamine, cocaine) due to neonatal toxicity.',
          es: 'La lactancia no se recomienda en: 1) VIH materno sin supresión viral con tratamiento antirretroviral (TAR), en cuyo caso se recomienda fórmula o leche humana donada pasteurizada. Según las guías perinatales de VIH del HHS vigentes, las personas con VIH en TAR con carga viral indetectable sostenida deben recibir asesoramiento centrado en la persona y una decisión compartida sobre fórmula, leche donada o lactancia (el riesgo de transmisión es menor del 1 %, pero no cero), y quienes elijan amamantar deben recibir apoyo de su equipo de atención del VIH; 2) Tuberculosis activa no tratada; 3) Hepatitis C activa SOLO si los pezones están agrietados o sangran (la leche intacta NO transmite hepatitis C); o 4) Consumo activo de drogas ilícitas de la calle.',
        },
      },
    ],
    clinicalCitations: [
      'Academy of Breastfeeding Medicine Protocol #21: Guidelines for Breastfeeding and Substance Use',
      'ACOG Clinical Consensus No. 2: General Approaches to Medical Management of Menstrual Disorders and Lactation',
    ],
  },
];

export const PERINATAL_GUIDELINES = [...GUIDELINES_DATA];
for (const item of GUIDELINES_DATA) {
  PERINATAL_GUIDELINES[item.id] = item;
}

// ============================================================================
// 2. NOWS & Eat, Sleep, Console (ESC) Model
// ============================================================================

const ESC_PILLARS_DATA = [
  {
    id: 'eat',
    title: {
      en: 'Eat (Nutritional Assessment)',
      es: 'Eat / Alimentación (Evaluación Nutricional)',
    },
    plainLanguage: {
      en: 'Can the baby feed effectively without distress?',
      es: '¿Puede el bebé alimentarse bien sin angustia?',
    },
    benchmark: {
      en: 'Breastfeeding for ≥ 10–15 minutes with coordinated suck/swallow, or bottle-feeding age-appropriate volumes (e.g. ≥ 10–15 mL/feed on Day 1, ≥ 30 mL by Day 3) within 30 minutes without vomiting or tachypnea.',
      es: 'Lactancia materna de al menos 10–15 minutos con succión/deglución coordinada, o biberón con volumen adecuado (ej. ≥10–15 mL el día 1, ≥30 mL para el día 3) en menos de 30 minutos sin vómitos ni taquipnea.',
    },
    supportStrategies: {
      en: 'Feed on demand; respond to early rooting hunger cues; offer small, frequent feeds; gentle burping; feed in an upright, semi-elevated position.',
      es: 'Alimentar a libre demanda; responder a las primeras señales de hambre; tomas pequeñas y frecuentes; eructos suaves; posición erguida.',
    },
  },
  {
    id: 'sleep',
    title: {
      en: 'Sleep (Neuro-Behavioral Rest)',
      es: 'Sleep / Sueño (Descanso Neuroconductual)',
    },
    plainLanguage: {
      en: 'Can the baby sleep comfortably after feeding?',
      es: '¿Puede el bebé dormir tranquilo después de comer?',
    },
    benchmark: {
      en: 'Infant sleeps uninterrupted for at least 1 hour following a feeding, either held skin-to-skin in a safe position or in a bassinet/crib.',
      es: 'El bebé duerme de forma continua durante al menos 1 hora tras alimentarse, ya sea en contacto piel con piel seguro o en su cuna.',
    },
    supportStrategies: {
      en: 'Snug swaddling with hands near face; skin-to-skin holding; dim lighting; quiet room with white noise; gentle rhythmic rocking.',
      es: 'Fajado seguro con manos cerca de la cara; contacto piel con piel; luces tenues; habitación tranquila con ruido blanco; balanceo rítmico suave.',
    },
  },
  {
    id: 'console',
    title: {
      en: 'Console (Soothability & Self-Regulation)',
      es: 'Console / Consuelo (Capacidad de Calmarse)',
    },
    plainLanguage: {
      en: 'Can the baby be comforted within 10 minutes?',
      es: '¿Se puede calmar al bebé en menos de 10 minutos?',
    },
    benchmark: {
      en: 'Infant is consoled within 10 minutes when crying or distressed, using progressive non-pharmacological caregiver soothing techniques.',
      es: 'El bebé logra calmarse en menos de 10 minutos cuando llora o se inquieta, utilizando técnicas no farmacológicas progresivas de consuelo familiar.',
    },
    supportStrategies: {
      en: 'Non-pharmacological soothing ladder: gentle voice, eye contact, hand placed firmly on chest, skin-to-skin contact, swaddling, rhythmic swaying, non-nutritive sucking (pacifier or clean finger).',
      es: 'Escalera de consuelo no farmacológico: voz suave, contacto visual, mano suave en el pecho, piel con piel, fajado, balanceo y succión no nutritiva (chupete).',
    },
  },
  {
    id: 'rooming_in',
    title: {
      en: '24/7 Rooming-In (Parent-Infant Dyad)',
      es: 'Alojamiento Conjunto 24/7 (Madre-Hijo)',
    },
    plainLanguage: {
      en: 'Keeping parent and baby together in the same room',
      es: 'Mantener a la madre y al bebé juntos en la misma habitación',
    },
    benchmark: {
      en: 'Parent and newborn remain in the same hospital room 24 hours a day rather than routine separation or NICU admission.',
      es: 'La madre y el recién nacido permanecen en la misma habitación las 24 horas del día, evitando la separación o el ingreso innecesario a la UCIN.',
    },
    supportStrategies: {
      en: 'Enables immediate response to infant cues; empowers parents as primary caregivers; reduces neonatal stress hormones and physiological instability.',
      es: 'Permite responder de inmediato a las necesidades del bebé, empodera a la familia y disminuye las hormonas de estrés neonatal.',
    },
  },
  {
    id: 'skin_to_skin',
    title: {
      en: 'Skin-to-Skin Kangaroo Care',
      es: 'Contacto Piel con Piel (Método Canguro)',
    },
    plainLanguage: {
      en: 'Direct chest-to-chest holding for natural comfort',
      es: 'Sostener al bebé pecho con pecho para confort natural',
    },
    benchmark: {
      en: 'Direct ventral skin-to-skin contact between parent and infant for multiple hours daily, especially after feeds and during fussy periods.',
      es: 'Contacto directo pecho con pecho entre la madre/padre y el bebé durante varias horas al día, especialmente tras las tomas y en momentos de inquietud.',
    },
    supportStrategies: {
      en: 'Stabilizes infant body temperature, autonomic heart rate, respiratory cadence, and blood glucose; stimulates oxytocin and maternal milk letdown.',
      es: 'Estabiliza la temperatura corporal, frecuencia cardíaca y respiratoria del bebé; regula la glucosa y estimula la bajada de leche materna.',
    },
  },
  {
    id: 'low_stimulation',
    title: {
      en: 'Low-Stimulation Healing Environment',
      es: 'Entorno Tranquilo de Baja Estimulación',
    },
    plainLanguage: {
      en: 'Quiet space with soft light to protect baby’s senses',
      es: 'Espacio silencioso con luz tenue para proteger los sentidos del bebé',
    },
    benchmark: {
      en: 'Dedicated quiet environment: dimmed room lights, muted monitor alarms, whispered conversations, limited visitors, clustered caregiving.',
      es: 'Ambiente tranquilo: luces atenuadas, alarmas silenciadas, conversaciones en voz baja, visitas limitadas y cuidados médicos agrupados.',
    },
    supportStrategies: {
      en: 'Protects the fragile newborn nervous system from sensory overload, minimizing autonomic hyperarousal, tremors, and crying.',
      es: 'Protege el sistema nervioso inmaduro del recién nacido contra la sobrecarga sensorial, reduciendo la irritabilidad y el llanto.',
    },
  },
];

export const ESC_MODEL_PILLARS = [...ESC_PILLARS_DATA];
for (const pillar of ESC_PILLARS_DATA) {
  ESC_MODEL_PILLARS[pillar.id] = pillar;
}

// ============================================================================
// 3. CAPTA Plans of Safe Care & Legal Rights
// ============================================================================

const CAPTA_RIGHTS_DATA = [
  {
    id: 'posc_vs_cps',
    category: {
      en: 'Understanding Your Rights',
      es: 'Comprender sus Derechos',
    },
    title: {
      en: 'Plan of Safe Care vs. Child Welfare / CPS Report',
      es: 'Plan de Cuidado Seguro frente a Reporte de Bienestar Infantil (CPS)',
    },
    description: {
      en: 'Federal CAPTA (Child Abuse Prevention and Treatment Act as amended by CARA) requires states to have policies for notification when an infant is substance-exposed. Federal guidance from HHS explicitly clarifies that notification to develop a supportive Plan of Safe Care (POSC) is NOT synonymous with a child abuse or neglect report. Compliant MOUD alone is never child maltreatment.',
      es: 'La ley federal CAPTA exige que los estados tengan políticas de notificación para recién nacidos expuestos a sustancias. Las directrices federales aclaran explícitamente que un Plan de Cuidado Seguro (POSC) es un plan de apoyo médico y comunitario, NO un reporte de abuso o negligencia infantil. El cumplimiento con MOUD nunca constituye maltrato.',
    },
    actionAdvice: {
      en: 'Ask your care team: "Will the hospital notification be handled as a supportive public health Plan of Safe Care, or does your facility make an automatic report to Child Protective Services?"',
      es: 'Pregunte a su equipo médico: "¿El aviso del hospital se gestionará como un Plan de Cuidado Seguro de apoyo en salud pública, o el hospital realiza un reporte automático a servicios infantiles?"',
    },
  },
  {
    id: 'proactive_prenatal_posc',
    category: {
      en: 'Prenatal Planning',
      es: 'Planificación Prenatal',
    },
    title: {
      en: 'Draft Your Plan of Safe Care Prenatally',
      es: 'Redactar su Plan de Cuidado Seguro Durante el Embarazo',
    },
    description: {
      en: 'Creating a written Plan of Safe Care with your OB/GYN, addiction medicine provider, or clinic social worker during your 2nd or 3rd trimester demonstrates protective capacity and preparation. Having a completed plan already in your chart at delivery prevents confusion and unnecessary emergency interventions.',
      es: 'Elaborar un Plan de Cuidado Seguro por escrito con su obstetra o trabajador social durante el segundo o tercer trimestre demuestra capacidad de protección y compromiso familiar. Contar con un plan previo en el historial previene intervenciones de emergencia al nacer.',
    },
    actionAdvice: {
      en: 'Include pediatric care provider details, safe sleep arrangements, MOUD clinic confirmation, postpartum depression screening plan, and names of trusted family support persons.',
      es: 'Incluya el pediatra asignado, condiciones de sueño seguro, confirmación de su clínica de MOUD, apoyo para depresión posparto y contactos de familiares de confianza.',
    },
  },
  {
    id: 'informed_consent_testing',
    category: {
      en: 'Legal & Healthcare Advocacy',
      es: 'Abogacía Legal y Sanitaria',
    },
    title: {
      en: 'Informed Consent for Maternal & Newborn Drug Testing',
      es: 'Consentimiento Informado para Pruebas Toxicológicas Maternas y Neonatales',
    },
    description: {
      en: 'Under standard medical ethics and law, healthcare providers generally require informed patient consent to perform drug screening on pregnant individuals or newborns, except under specific court orders. Testing without consent or without clinical indication raises civil rights and privacy concerns.',
      es: 'Conforme a la ética médica y la ley, los profesionales de salud generalmente requieren el consentimiento informado del paciente para realizar pruebas de drogas a la madre o al bebé, salvo orden judicial. Hacer pruebas sin consentimiento vulnera la privacidad y los derechos civiles.',
    },
    actionAdvice: {
      en: 'You have the right to ask: "What lab tests are you ordering today? Is a toxicology screen included? Why is this test recommended, and what are the hospital’s reporting policies?"',
      es: 'Usted tiene derecho a preguntar: "¿Qué pruebas de laboratorio se ordenan hoy? ¿Se incluye detección de drogas? ¿Cuál es la indicación médica y cuál es la política de notificación del hospital?"',
    },
  },
  {
    id: 'moud_prescription_documentation',
    category: {
      en: 'Documentation & Evidence',
      es: 'Documentación y Pruebas',
    },
    title: {
      en: 'Prescription MOUD Documentation in Hospital Bag',
      es: 'Documentación Oficial de Prescripción MOUD en la Maleta del Hospital',
    },
    description: {
      en: 'Carry an official letter or current medical records from your MOUD prescriber (buprenorphine provider or Opioid Treatment Program/OTP methadone clinic) specifying that your treatment is prescribed, compliant, and clinically monitored.',
      es: 'Lleve una carta oficial o historial médico actualizado de su médico o clínica de metadona/buprenorfina que certifique que su tratamiento está recetado, supervisado y en cumplimiento.',
    },
    actionAdvice: {
      en: 'Prevent misinterpretations: hospital labor and delivery urine drug screens that detect methadone or buprenorphine should be matched immediately to your active prescription rather than flagged as illicit use.',
      es: 'Evite confusiones: si el examen toxicológico en el parto detecta metadona o buprenorfina, la carta médica demuestra de inmediato el cumplimiento terapéutico prescrito.',
    },
  },
  {
    id: 'hospital_advocate_access',
    category: {
      en: 'Patient Rights',
      es: 'Derechos del Paciente',
    },
    title: {
      en: 'Access to Hospital Social Work & Patient Advocacy',
      es: 'Acceso a Trabajo Social Hospitalario y Defensores del Paciente',
    },
    description: {
      en: 'Every hospital has patient advocates, ombudsmen, and licensed clinical social workers whose duty is to support patient dignity, coordinate non-punitive community referrals, and prevent discriminatory treatment.',
      es: 'Todo hospital cuenta con trabajadores sociales clínicos y defensores del paciente cuya función es proteger su dignidad, coordinar recursos de apoyo comunitarios y evitar el trato discriminatorio.',
    },
    actionAdvice: {
      en: 'Request a consultation with a hospital social worker or doula who specializes in perinatal substance use and trauma-informed care before delivery.',
      es: 'Solicite una consulta con el trabajador social o acompañante (doula) especializado en salud perinatal y atención informada en trauma antes del parto.',
    },
  },
  {
    id: 'state_policy_variation',
    category: {
      en: 'Policy Landscape',
      es: 'Panorama de Leyes Estatales',
    },
    title: {
      en: 'State Policy Variations: Supportive vs. Punitive States',
      es: 'Variaciones Estatales: Estados de Apoyo frente a Estados Punitivos',
    },
    description: {
      en: 'States implement CAPTA/CARA through widely varying statutory frameworks. Some states have "differential response" paths where MOUD-maintained families receive supportive public health services with zero child welfare involvement. In contrast, other states treat any positive infant toxicology as mandatory child welfare reports.',
      es: 'Los estados aplican CAPTA de formas muy distintas. Algunos ofrecen "respuesta diferenciada" canalizando a las familias hacia salud pública sin intervención de protección infantil. En contraste, otros estados consideran cualquier sustancia motivo de reporte obligatorio.',
    },
    actionAdvice: {
      en: 'Consult with local legal aid, perinatal advocates (e.g., Pregnancy Justice, National Advocates for Pregnant Women), or your state harm reduction coalition to know your jurisdiction’s exact reporting threshold.',
      es: 'Consulte con asistencia legal comunitaria o defensores perinatales para conocer las leyes exactas y los umbrales de reporte en su estado.',
    },
  },
  {
    id: 'medical_records_access',
    category: {
      en: 'Patient Rights',
      es: 'Derechos del Paciente',
    },
    title: {
      en: 'Right to Inspect & Receive Medical Records (HIPAA)',
      es: 'Derecho a Inspeccionar y Obtener Expedientes Médicos (HIPAA)',
    },
    description: {
      en: 'Under HIPAA federal privacy law, you have the absolute legal right to inspect and obtain electronic or paper copies of your medical records and your baby’s chart, including nursing notes, lab results, and social work assessments.',
      es: 'Bajo la ley federal HIPAA, usted tiene el derecho legal absoluto de revisar y obtener copias de su expediente médico y el de su bebé, incluyendo notas de enfermería y evaluaciones de trabajo social.',
    },
    actionAdvice: {
      en: 'If hospital staff suggest a report has been or will be filed, politely request: "Please provide me with a copy of the notification or document that was submitted, and note my request in the medical chart."',
      es: 'Si el personal indica que se envió o enviará una notificación, solicite amablemente: "Por favor, entrégueme una copia del documento remitido y registre mi solicitud en el expediente."',
    },
  },
];

export const CAPTA_RIGHTS_CHECKLIST = [...CAPTA_RIGHTS_DATA];
for (const item of CAPTA_RIGHTS_DATA) {
  CAPTA_RIGHTS_CHECKLIST[item.id] = item;
}

// ============================================================================
// 4. Interactive Pregnancy Care Checklist & OB/GYN Questions
// ============================================================================

export const PRENATAL_CHECKLIST_ITEMS = [
  // First Trimester
  {
    id: 'moud_continuation',
    trimester: 'first',
    title: {
      en: 'Maintain continuous daily MOUD dosing (never abruptly detox)',
      es: 'Mantener dosis diaria continua de MOUD (nunca desintoxicarse abruptamente)',
    },
    detail: {
      en: 'Stay on your prescribed dose of buprenorphine or methadone. Do not attempt unassisted withdrawal, which endangers pregnancy viability.',
      es: 'Mantenga su dosis recetada de buprenorfina o metadona. No intente la abstinencia sin apoyo, lo cual pone en peligro el embarazo.',
    },
  },
  {
    id: 'first_prenatal_visit',
    trimester: 'first',
    title: {
      en: 'Schedule initial prenatal appointment and disclose MOUD openly',
      es: 'Programar primera consulta prenatal y comunicar el tratamiento MOUD',
    },
    detail: {
      en: 'Partner with an OB/GYN or midwife experienced in high-risk perinatal care and supportive addiction medicine.',
      es: 'Establezca una alianza con un obstetra o partera con experiencia en atención perinatal de alto riesgo y medicina de adicciones compasiva.',
    },
  },
  {
    id: 'folic_acid_vitamins',
    trimester: 'first',
    title: {
      en: 'Start daily prenatal vitamins with 400–800 mcg folic acid',
      es: 'Iniciar vitaminas prenatales diarias con 400–800 mcg de ácido fólico',
    },
    detail: {
      en: 'Protects fetal neural tube development during the earliest weeks of gestation.',
      es: 'Protege el desarrollo del tubo neural fetal durante las primeras semanas de gestación.',
    },
  },
  {
    id: 'baseline_screening_labs',
    trimester: 'first',
    title: {
      en: 'Complete routine infectious disease screening (HIV, Hep B, Hep C, Syphilis)',
      es: 'Realizar pruebas rutinarias de detección infecciosa (VIH, Hep B, Hep C, Sífilis)',
    },
    detail: {
      en: 'Early detection enables interventions to prevent vertical transmission to the baby.',
      es: 'La detección temprana permite intervenciones médicas para prevenir la transmisión al bebé.',
    },
  },

  // Second Trimester
  {
    id: 'anatomy_ultrasound',
    trimester: 'second',
    title: {
      en: 'Complete 18–20 week fetal anatomy ultrasound scan',
      es: 'Realizar ecografía de anatomía fetal de las 18–20 semanas',
    },
    detail: {
      en: 'Detailed evaluation of fetal growth, organ structures, and placental position.',
      es: 'Evaluación detallada del crecimiento fetal, estructuras anatómicas y posición placentaria.',
    },
  },
  {
    id: 'monitor_withdrawal_symptoms',
    trimester: 'second',
    title: {
      en: 'Monitor for emerging withdrawal as blood volume expands',
      es: 'Monitorear síntomas de abstinencia ante la expansión del volumen sanguíneo',
    },
    detail: {
      en: 'Report sleep disruptions, cramping, or sweating to your prescriber for possible split-dosing.',
      es: 'Informe insomnio, cólicos o sudoración a su médico para evaluar la dosificación dividida.',
    },
  },
  {
    id: 'oral_health_care',
    trimester: 'second',
    title: {
      en: 'Maintain dental hygiene (rinse mouth after sublingual buprenorphine)',
      es: 'Mantener higiene dental (enjuagar la boca tras buprenorfina sublingual)',
    },
    detail: {
      en: 'Swish water after sublingual tablet/film dissolves and wait 1 hour before brushing teeth to preserve dental enamel.',
      es: 'Enjuague la boca con agua tras disolver la tableta/película sublingual y espere 1 hora antes de cepillarse.',
    },
  },
  {
    id: 'connect_peer_doula',
    trimester: 'second',
    title: {
      en: 'Connect with a perinatal peer specialist, doula, or nurse home-visitor',
      es: 'Conectar con un especialista de apoyo de pares, doula o enfermera visitante',
    },
    detail: {
      en: 'Non-judgmental emotional support, birth preparation, and postpartum advocacy.',
      es: 'Apoyo emocional sin prejuicios, preparación para el parto y defensa de sus derechos.',
    },
  },

  // Third Trimester
  {
    id: 'evaluate_cyp3a4_split_dosing',
    trimester: 'third',
    title: {
      en: 'Discuss CYP3A4 metabolic induction & split-dosing with your prescriber',
      es: 'Evaluar inducción metabólica CYP3A4 y dosis dividida con su médico',
    },
    detail: {
      en: 'Accelerated metabolism in the 3rd trimester frequently requires split-dosing (every 12 hours) to avoid end-of-dose withdrawal.',
      es: 'El metabolismo acelerado en el 3.er trimestre a menudo requiere dosis dividida (cada 12h) para evitar la abstinencia tardía.',
    },
  },
  {
    id: 'birth_pain_plan',
    trimester: 'third',
    title: {
      en: 'Formulate labor and postpartum pain plan (avoid mixed agonist-antagonists)',
      es: 'Elaborar plan de dolor de parto y posparto (evitar agonistas-antagonistas mixtos)',
    },
    detail: {
      en: 'Ensure anesthesia team plans epidural analgesia, scheduled NSAIDs, and avoids Stadol/Nubain.',
      es: 'Asegúrese de que el equipo planifique analgesia epidural, AINE y evite terminantemente Stadol/Nubain.',
    },
  },
  {
    id: 'verify_hospital_esc_policy',
    trimester: 'third',
    title: {
      en: 'Confirm hospital implements the Eat, Sleep, Console (ESC) model & rooming-in',
      es: 'Confirmar que el hospital aplique el modelo Eat, Sleep, Console (ESC) y alojamiento conjunto',
    },
    detail: {
      en: 'Ask whether your hospital prioritizes rooming-in and non-pharmacological care over routine NICU stays.',
      es: 'Pregunte si el hospital prioriza el alojamiento conjunto y el cuidado no farmacológico sobre la UCIN.',
    },
  },
  {
    id: 'draft_prenatal_posc',
    trimester: 'third',
    title: {
      en: 'Draft and finalize written CAPTA Plan of Safe Care with clinic team',
      es: 'Redactar y finalizar el Plan de Cuidado Seguro CAPTA con el equipo clínico',
    },
    detail: {
      en: 'Document pediatrician contact, safe sleep setup, MOUD verification, and family support.',
      es: 'Documente pediatra asignado, cuna segura, carta de MOUD y red de apoyo familiar.',
    },
  },

  // Labor & Delivery
  {
    id: 'hospital_bag_moud_letter',
    trimester: 'labor',
    title: {
      en: 'Pack hospital bag with MOUD prescription letter and medical records',
      es: 'Empacar maleta con carta médica oficial de MOUD e historial clínico',
    },
    detail: {
      en: 'Proves compliant medical care immediately if hospital toxicology screens detect buprenorphine or methadone.',
      es: 'Demuestra cumplimiento médico inmediato si las pruebas toxicológicas detectan buprenorfina o metadona.',
    },
  },
  {
    id: 'continue_baseline_labor',
    trimester: 'labor',
    title: {
      en: 'Ensure regular MOUD dose is continued without delay during active labor',
      es: 'Asegurar que la dosis regular de MOUD se continúe sin retraso durante el parto',
    },
    detail: {
      en: 'Never skip maintenance doses. Baseline medication manages baseline dependency, not labor pain.',
      es: 'Nunca omita la dosis de mantenimiento. La medicación basal cubre la dependencia, no el dolor de parto.',
    },
  },
  {
    id: 'immediate_skin_to_skin',
    trimester: 'labor',
    title: {
      en: 'Initiate immediate skin-to-skin kangaroo care and 24/7 rooming-in',
      es: 'Iniciar contacto piel con piel inmediato y alojamiento conjunto 24/7',
    },
    detail: {
      en: 'Promotes bonding, autonomic stabilization, and lowers newborn withdrawal stress.',
      es: 'Favorece el apego, estabiliza los signos vitales y disminuye el estrés del recién nacido.',
    },
  },
  {
    id: 'early_lactation_support',
    trimester: 'labor',
    title: {
      en: 'Initiate breastfeeding within 1 hour with lactation consultant guidance',
      es: 'Iniciar lactancia materna dentro de la primera hora con apoyo de una consultora',
    },
    detail: {
      en: 'Early colostrum transfer provides critical maternal antibodies and soothes the newborn.',
      es: 'El calostro temprano aporta anticuerpos esenciales y calma profundamente al recién nacido.',
    },
  },

  // Postpartum & Newborn
  {
    id: 'esc_soothing_at_home',
    trimester: 'postpartum',
    title: {
      en: 'Practice non-pharmacological ESC soothing bundle (swaddle, low lights, on-demand feeding)',
      es: 'Practicar el paquete de consuelo ESC (fajado, luz suave, tomas a demanda)',
    },
    detail: {
      en: 'Consistent gentle routines help newborn self-regulation and reduce neuro-irritability.',
      es: 'Las rutinas suaves y constantes ayudan a la autorregulación del bebé y reducen la irritabilidad.',
    },
  },
  {
    id: 'naloxone_kit_home',
    trimester: 'postpartum',
    title: {
      en: 'Ensure take-home naloxone (Narcan) is stocked and household is trained',
      es: 'Asegurar naloxona (Narcan) en casa y capacitar a la familia en su uso',
    },
    detail: {
      en: 'Crucial overdose safety net during the vulnerable postpartum transition.',
      es: 'Red de seguridad vital contra sobredosis durante el periodo vulnerable del posparto.',
    },
  },
  {
    id: 'early_postpartum_visit_1to3w',
    trimester: 'postpartum',
    title: {
      en: 'Attend early 1–3 week postpartum clinical visit (not waiting 6 weeks)',
      es: 'Asistir a consulta posparto temprana a las 1–3 semanas (no esperar 6 semanas)',
    },
    detail: {
      en: 'Check maternal mood, incision healing, MOUD dose stability, and social support.',
      es: 'Revisión de estado de ánimo, cicatrización, estabilidad de dosis y apoyo social.',
    },
  },
  {
    id: 'pediatric_newborn_checkup',
    trimester: 'postpartum',
    title: {
      en: 'Attend pediatrician appointment within 2–4 days after hospital discharge',
      es: 'Llevar al bebé al pediatra dentro de los 2–4 días tras el alta hospitalaria',
    },
    detail: {
      en: 'Monitor weight, jaundice, feeding efficiency, and delayed onset of mild withdrawal.',
      es: 'Monitorear peso, ictericia, eficacia de alimentación y posible aparición tardía de síntomas.',
    },
  },
];

export const OBGYN_VISIT_QUESTIONS = [
  {
    id: 'q_moud_labor',
    question: {
      en: 'How will my daily methadone or buprenorphine dose be administered on schedule while I am in labor?',
      es: '¿Cómo se garantizará que mi dosis diaria de metadona o buprenorfina se administre a tiempo durante el parto?',
    },
    clinicalRationale: {
      en: 'Establishes baseline maintenance continuity so that labor is not disrupted by preventable withdrawal.',
      es: 'Garantiza la continuidad del tratamiento de mantenimiento para evitar una abstinencia innecesaria en el parto.',
    },
  },
  {
    id: 'q_multimodal_pain',
    question: {
      en: 'What multimodal pain relief (epidural, scheduled NSAIDs, full-agonist opioids) will be available to manage my labor and postpartum pain?',
      es: '¿Qué opciones de analgesia multimodal (epidural, AINE programados, opioides agonistas completos) tendré para el dolor de parto y posparto?',
    },
    clinicalRationale: {
      en: 'Ensures equitable, non-punitive pain management tailored for patients with pre-existing opioid receptor tolerance.',
      es: 'Asegura un control del dolor equitativo y sin prejuicios adaptado a la tolerancia previa de receptores opioides.',
    },
  },
  {
    id: 'q_no_mixed_agonists',
    question: {
      en: 'Can we note prominently in my chart that mixed agonist-antagonists like butorphanol (Stadol) or nalbuphine (Nubain) must NEVER be given, as they cause acute withdrawal?',
      es: '¿Podemos dejar registrado en mi expediente que NUNCA se me deben administrar agonistas-antagonistas mixtos como Stadol o Nubain, ya que causan abstinencia aguda?',
    },
    clinicalRationale: {
      en: 'Prevents catastrophic iatrogenic precipitated withdrawal during intrapartum care.',
      es: 'Previene una abstinencia precipitada grave provocada inadvertidamente por medicación inadecuada.',
    },
  },
  {
    id: 'q_third_tri_split',
    question: {
      en: 'If I experience withdrawal symptoms in my third trimester as my blood volume expands, will you collaborate with my prescriber to evaluate split-dosing (twice daily)?',
      es: 'Si tengo síntomas de abstinencia en el 3.er trimestre por aumento del volumen sanguíneo, ¿colaborará con mi médico para evaluar dosis dividida (dos veces al día)?',
    },
    clinicalRationale: {
      en: 'Addresses CYP3A4 metabolic acceleration and expanded plasma volume in late pregnancy.',
      es: 'Atiende la aceleración metabólica por CYP3A4 y la expansión plasmática al final de la gestación.',
    },
  },
  {
    id: 'q_esc_model',
    question: {
      en: 'Does your hospital use the Eat, Sleep, Console (ESC) model for newborn withdrawal, and will my baby be able to room-in with me 24/7?',
      es: '¿Su hospital utiliza el modelo Eat, Sleep, Console (ESC) para el recién nacido y podré tener alojamiento conjunto las 24 horas?',
    },
    clinicalRationale: {
      en: 'Confirms family-centered, non-pharmacological care and avoids unnecessary NICU parent-infant separation.',
      es: 'Confirma un enfoque de atención familiar no farmacológico y previene la separación evitable en la UCIN.',
    },
  },
  {
    id: 'q_breastfeeding_support',
    question: {
      en: 'What lactation support does your unit provide to help me establish breastfeeding while taking buprenorphine or methadone?',
      es: '¿Qué apoyo de lactancia ofrece su servicio para ayudarme a amamantar mientras tomo buprenorfina o metadona?',
    },
    clinicalRationale: {
      en: 'Ensures hospital nursing and lactation staff align with ACOG/ABM guidelines supporting breastfeeding on MOUD.',
      es: 'Asegura que el personal de enfermería y lactancia aplique las guías que respaldan amamantar con MOUD.',
    },
  },
  {
    id: 'q_capta_posc',
    question: {
      en: 'How does your hospital coordinate CAPTA notifications, and can we develop my supportive Plan of Safe Care together now before delivery?',
      es: '¿Cómo coordina su hospital los avisos de CAPTA y podemos elaborar juntos mi Plan de Cuidado Seguro de apoyo antes del parto?',
    },
    clinicalRationale: {
      en: 'Clarifies supportive public health pathways versus child welfare reporting and documents prenatal preparedness.',
      es: 'Aclara la vía de salud pública de apoyo frente a reportes infantiles y documenta la preparación prenatal.',
    },
  },
  {
    id: 'q_early_postpartum',
    question: {
      en: 'Can we schedule an early postpartum follow-up visit 1 to 2 weeks after birth to monitor my recovery, mental health, and medication stability?',
      es: '¿Podemos programar una cita de seguimiento posparto a las 1 a 2 semanas tras el parto para vigilar mi recuperación, salud mental y estabilidad farmacológica?',
    },
    clinicalRationale: {
      en: 'Protects the vulnerable postpartum window and mitigates maternal overdose mortality risk.',
      es: 'Protege la ventana de vulnerabilidad del posparto y previene el riesgo de mortalidad materna.',
    },
  },
];

// ============================================================================
// 5. Ephemeral In-RAM State Management
// ============================================================================

const initialEphemeralState = () => ({
  activeTab: 'guidelines', // 'guidelines' | 'esc' | 'capta' | 'checklist' | 'obgyn'
  lang: getLang() === 'es' ? 'es' : 'en',
  trimester: 'all', // 'first' | 'second' | 'third' | 'labor' | 'postpartum' | 'all'
  checklist: {}, // { [itemId]: boolean }
  selectedEscPillar: null,
  activeGuideline: null,
  notes: '',
});

let perinatalState = initialEphemeralState();

export function getPerinatalState() {
  return {
    ...perinatalState,
    checklist: { ...perinatalState.checklist },
  };
}

export function setPerinatalState(patch) {
  if (!patch || typeof patch !== 'object') return getPerinatalState();
  for (const [key, value] of Object.entries(patch)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    if (key === 'checklist' && value && typeof value === 'object') {
      perinatalState.checklist = { ...perinatalState.checklist, ...value };
    } else {
      perinatalState[key] = value;
    }
  }
  return getPerinatalState();
}

export function resetPerinatalState() {
  perinatalState = initialEphemeralState();
  return getPerinatalState();
}

// ============================================================================
// 6. Summary Text Generator (Print & Clipboard)
// ============================================================================

export function formatPerinatalSummaryText(state = getPerinatalState()) {
  const isEs = state.lang === 'es';
  const lines = [];

  lines.push('================================================================================');
  lines.push(isEs
    ? 'HARBORPATH: GUÍA CLÍNICA DE SALUD PERINATAL Y PLAN DE DIÁLOGO OBSTÉTRICO'
    : 'HARBORPATH: PERINATAL SUBSTANCE USE CARE PATHWAYS & OB/GYN DISCUSSION GUIDE');
  lines.push('================================================================================');
  lines.push(isEs
    ? `Sesión: Memoria RAM Efímera (Sin retención de identificadores personales)`
    : `Session: Ephemeral In-RAM (Zero persistent personal identifiers)`);
  lines.push(isEs
    ? `Idioma seleccionado: ${isEs ? 'Español' : 'English'}`
    : `Selected Language: ${isEs ? 'Español' : 'English'}`);
  lines.push(isEs
    ? `Filtro de Trimestre: ${state.trimester}`
    : `Trimester Filter: ${state.trimester}`);
  lines.push('');

  // 1. Core Clinical Reminders
  lines.push(isEs ? '--- PAUTAS CLÍNICAS FUNDAMENTALES (ACOG & SMFM) ---' : '--- CORE CLINICAL GUIDELINES (ACOG & SMFM) ---');
  lines.push(isEs
    ? '• Mantenimiento MOUD: Metadona o buprenorfina son el estándar de oro en el embarazo.'
    : '• MOUD Standard of Care: Methadone or buprenorphine maintenance is the standard of care in pregnancy.');
  lines.push(isEs
    ? '• Desintoxicación Contraindicada: La retirada médica forzada conlleva >80% de recaída, desprendimiento placentario y sufrimiento fetal.'
    : '• Detox Contraindicated: Medically supervised detox carries >80% relapse, placental abruption, and acute fetal distress.');
  lines.push(isEs
    ? '• Tercer Trimestre: La inducción de CYP3A4 y la expansión plasmática requieren dosis dividida (cada 12h) o aumentos de dosis.'
    : '• Third Trimester: CYP3A4 induction and blood volume expansion require split-dosing (q12h) or dose increases.');
  lines.push(isEs
    ? '• Analgesia de Parto: Analgesia multimodal (epidural, AINE). NUNCA usar agonistas-antagonistas mixtos (Stadol/Nubain).'
    : '• Labor Pain Relief: Multimodal analgesia (epidural, scheduled NSAIDs). NEVER administer mixed agonist-antagonists (Stadol/Nubain).');
  lines.push(isEs
    ? '• Vulnerabilidad Posparto: Pérdida marcada de tolerancia tras el parto; alto riesgo de sobredosis; recetar naloxona y cita temprana (1-3 sem).'
    : '• Postpartum Window: Loss of opioid tolerance postpartum; elevated overdose mortality; co-prescribe naloxone; follow-up at 1–3 weeks.');
  lines.push(isEs
    ? '• Lactancia Materna: Recomendada y segura; mínima excreción en leche materna. No se recomienda con VIH sin supresión viral (con VIH suprimido en TAR: decisión compartida), tuberculosis activa no tratada o Hep C con pezones sangrantes.'
    : '• Lactation: Encouraged and safe; minimal milk transfer. Not recommended with HIV that is not virally suppressed (HIV suppressed on ART: shared decision-making), active untreated TB, or active Hep C with cracked/bleeding nipples.');
  lines.push('');

  // 2. ESC Newborn Care Model
  lines.push(isEs ? '--- MODELO EAT, SLEEP, CONSOLE (ESC) PARA RECIÉN NACIDOS ---' : '--- EAT, SLEEP, CONSOLE (ESC) MODEL FOR NEWBORNS ---');
  lines.push(isEs
    ? '• Evaluación Funcional: Evalúa comer bien (≥10-15 min o volumen adecuado), dormir continuo (≥1 hora) y calmarse (≤10 min).'
    : '• Functional Assessment: Evaluates eating (≥10–15 min or volume), sleeping (≥1 hour uninterrupted), and consoling (≤10 min).');
  lines.push(isEs
    ? '• Paquete No Farmacológico: Alojamiento conjunto 24/7, contacto piel con piel, ambiente de baja estimulación y tomas a demanda.'
    : '• Non-Pharmacological Bundle: 24/7 rooming-in, skin-to-skin holding, low-stimulation environment, and on-demand feeding.');
  lines.push(isEs
    ? '• Finnegan vs ESC: Reemplaza escalas subjetivas por bienestar funcional, reduciendo medicación neonatal (>50%) y días de hospitalización.'
    : '• Finnegan vs ESC: Replaces subjective Finnegan scoring with functional wellness; reduces neonatal medication (>50%) and length of stay.');
  lines.push('');

  // 3. CAPTA Rights
  lines.push(isEs ? '--- PLANES DE CUIDADO SEGURO CAPTA Y DERECHOS ---' : '--- CAPTA PLANS OF SAFE CARE & ADVOCACY ---');
  lines.push(isEs
    ? '• Plan de Salud de Apoyo: Una notificación de CAPTA para un Plan de Cuidado Seguro NO es un reporte de maltrato infantil.'
    : '• Supportive Health Plan: A CAPTA notification for a Plan of Safe Care is NOT an allegation of child abuse or neglect.');
  lines.push(isEs
    ? '• Consentimiento Informado: Se requiere consentimiento para pruebas toxicológicas maternas y neonatales.'
    : '• Informed Consent: Required for maternal and neonatal toxicology screening.');
  lines.push(isEs
    ? '• Documentación MOUD: Lleve consigo carta oficial del médico o clínica de metadona/buprenorfina.'
    : '• Documentation: Keep official MOUD prescriber verification letter in your hospital bag.');
  lines.push('');

  // 4. Checklist Progress
  const relevantChecklist = PRENATAL_CHECKLIST_ITEMS.filter((item) =>
    state.trimester === 'all' || item.trimester === state.trimester
  );
  const completedCount = relevantChecklist.filter((item) => state.checklist[item.id]).length;
  lines.push(isEs
    ? `--- LISTA DE PREPARACIÓN PRENATAL (${completedCount} de ${relevantChecklist.length} completados) ---`
    : `--- PRENATAL CHECKLIST PROGRESS (${completedCount} of ${relevantChecklist.length} completed) ---`);

  for (const item of relevantChecklist) {
    const done = !!state.checklist[item.id];
    const mark = done ? '[X]' : '[ ]';
    const text = isEs ? item.title.es : item.title.en;
    lines.push(`${mark} ${text}`);
  }
  lines.push('');

  // 5. Discussion Questions for OB/GYN
  lines.push(isEs ? '--- PREGUNTAS PRIORITARIAS PARA SU OBSTETRA / EQUIPO DE PARTO ---' : '--- PRIORITY QUESTIONS FOR YOUR OB/GYN & DELIVERY TEAM ---');
  for (let i = 0; i < OBGYN_VISIT_QUESTIONS.length; i++) {
    const q = OBGYN_VISIT_QUESTIONS[i];
    const qText = isEs ? q.question.es : q.question.en;
    lines.push(`${i + 1}. ${qText}`);
  }
  lines.push('');

  // 6. Emergency & Hotlines
  lines.push(isEs ? '--- LÍNEAS DE AYUDA Y RECURSOS DE EMERGENCIA ---' : '--- EMERGENCY & HELPLINE RESOURCES ---');
  lines.push(isEs
    ? '• Línea Nacional de Salud Mental Materna: 1-833-852-6262 (1-833-TLC-MAMA) - 24/7, Llamada o Texto, Inglés y Español'
    : '• National Maternal Mental Health Hotline: 1-833-852-6262 (1-833-TLC-MAMA) - 24/7, Call or Text, Voice & SMS');
  lines.push(isEs
    ? '• Línea de Prevención del Suicidio y Crisis: 988 (Llamada o Texto)'
    : '• 988 Suicide & Crisis Lifeline: Call or Text 988');
  lines.push(isEs
    ? '• Línea Nacional SAMHSA: 1-800-662-4357 (1-800-662-HELP)'
    : '• SAMHSA National Helpline: 1-800-662-4357 (1-800-662-HELP)');
  lines.push(isEs
    ? '• Never Use Alone (Prevención de sobredosis): 800-484-3731'
    : '• Never Use Alone (Overdose prevention): 800-484-3731');

  // 7. Ephemeral User Notes
  if (state.notes && state.notes.trim()) {
    lines.push('');
    lines.push(isEs ? '--- NOTAS EFÍMERAS DE LA SESIÓN ---' : '--- EPHEMERAL SESSION NOTES ---');
    lines.push(state.notes.trim());
  }

  lines.push('');
  lines.push('================================================================================');
  lines.push(isEs
    ? 'Aviso Clínico: Este documento es una herramienta educativa y de preparación para el diálogo con profesionales de salud. No sustituye el diagnóstico ni el consejo médico formal.'
    : 'Clinical Notice: This document is an educational and communication guide. It does not replace individualized clinical evaluation or formal medical advice.');
  lines.push('================================================================================');

  return lines.join('\n');
}

// ============================================================================
// 7. Interactive Perinatal Care Pathways View (DOM Component)
// ============================================================================

export function perinatalView({ query } = {}) {
  // Synchronize initial query overrides safely without mutating browser state
  if (query) {
    if (query.tab && ['guidelines', 'esc', 'capta', 'checklist', 'obgyn'].includes(query.tab)) {
      setPerinatalState({ activeTab: query.tab });
    }
    if (query.trimester && ['first', 'second', 'third', 'labor', 'postpartum', 'all'].includes(query.trimester)) {
      setPerinatalState({ trimester: query.trimester });
    }
    if (query.lang && (query.lang === 'es' || query.lang === 'en')) {
      setPerinatalState({ lang: query.lang });
    }
  }

  const container = h('div', { class: 'view view-perinatal view-prose' });

  function render() {
    clear(container);
    const state = getPerinatalState();
    const isEs = state.lang === 'es';

    // Helper for bilingual strings
    const tr = (enText, esText) => (isEs ? esText : enText);

    // ------------------------------------------------------------------------
    // Header & Ephemeral Privacy Notice
    // ------------------------------------------------------------------------
    const title = tr(
      'Perinatal Substance Use Care Pathways & OB/GYN Guide',
      'Rutas de Atención Perinatal para Uso de Sustancias y Guía Obstétrica'
    );
    const lede = tr(
      'Evidence-based clinical pathways for pregnancy, delivery, and postpartum care. Grounded in ACOG & SMFM guidelines, the Eat, Sleep, Console (ESC) newborn care model, and CAPTA legal rights.',
      'Rutas clínicas basadas en evidencia para el embarazo, parto y posparto. Fundamentadas en guías de ACOG y SMFM, el modelo neonatal Eat, Sleep, Console (ESC) y derechos legales bajo CAPTA.'
    );

    const header = pageHeader(title, lede);

    // High-contrast Action & Language Bar
    const langBtnEn = h('button', {
      type: 'button',
      class: `btn btn-small ${!isEs ? 'btn-primary' : 'btn-ghost'}`,
      'aria-pressed': !isEs ? 'true' : 'false',
      onclick: () => {
        setPerinatalState({ lang: 'en' });
        announce('Switched language to English');
        render();
      },
    }, 'English');

    const langBtnEs = h('button', {
      type: 'button',
      class: `btn btn-small ${isEs ? 'btn-primary' : 'btn-ghost'}`,
      'aria-pressed': isEs ? 'true' : 'false',
      onclick: () => {
        setPerinatalState({ lang: 'es' });
        announce('Cambiado el idioma a Español');
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
    }, icon('print'), tr('Print Clinical Guide', 'Imprimir Guía Clínica'));

    const copyBtn = h('button', {
      type: 'button',
      class: 'btn btn-small btn-secondary',
      onclick: async () => {
        const text = formatPerinatalSummaryText(getPerinatalState());
        try {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            announce(tr('Clinical guide copied to clipboard.', 'Guía clínica copiada al portapapeles.'));
          }
        } catch {
          announce(tr('Could not copy report.', 'No se pudo copiar el informe.'));
        }
      },
    }, icon('clipboard'), tr('Copy Summary', 'Copiar Resumen'));

    const resetBtn = h('button', {
      type: 'button',
      class: 'btn btn-small btn-ghost',
      'aria-label': tr('Quick Exit & Reset All Answers', 'Salida Rápida y Reiniciar Respuestas'),
      onclick: () => {
        resetPerinatalState();
        announce(tr('Perinatal session cleanly reset from RAM.', 'Sesión perinatal reiniciada limpiamente de la memoria RAM.'));
        render();
      },
    }, icon('x'), tr('Quick Exit / Reset', 'Salida Rápida / Reiniciar'));

    const controlsBar = h('div', { class: 'actions perinatal-controls no-print', role: 'toolbar', 'aria-label': tr('Session tools', 'Herramientas de sesión') },
      h('div', { class: 'lang-selector-group' }, langBtnEn, langBtnEs),
      h('div', { class: 'tool-actions-group' }, printBtn, copyBtn, resetBtn)
    );

    // Ephemeral Privacy Callout
    const privacyNotice = h('div', { class: 'callout callout-info no-print' },
      h('strong', null, icon('lock'), tr(' Ephemeral In-RAM Privacy: ', ' Privacidad en Memoria RAM Efímera: ')),
      tr(
        'All checklist selections, notes, and questions exist strictly in your temporary browser memory and are not written to device storage or URL queries. They are cleared upon clicking Quick Exit or closing this tab.',
        'Las respuestas de la lista, notas y preguntas existen estrictamente en la memoria RAM temporal de su navegador y no se escriben en el almacenamiento del dispositivo ni en consultas de URL. Se limpian al pulsar Salida Rápida o cerrar esta pestaña.'
      )
    );

    // Hotline Callout
    const hotlineBanner = h('aside', { class: 'callout callout-emergency perinatal-hotlines', 'aria-label': tr('Maternal crisis hotlines', 'Líneas de ayuda materna en crisis') },
      h('p', { class: 'callout-title' }, icon('heart'), tr('24/7 Free, Confidential Perinatal & Crisis Support', 'Apoyo Perinatal y de Crisis 24/7 Gratuito y Confidencial')),
      h('div', { class: 'hotline-pills-row' },
        h('span', { class: 'hotline-item' },
          strong(tr('Maternal Mental Health Hotline: ', 'Línea de Salud Mental Materna: ')),
          tel('18338526262', '1-833-852-6262 (1-833-TLC-MAMA)', { class: 'tel' }),
          tr(' (Call/Text, 24/7, EN/ES)', ' (Llamada/Texto, 24/7, EN/ES)')
        ),
        h('span', { class: 'hotline-item' },
          strong(tr('Suicide & Crisis Lifeline: ', 'Línea de Prevención de Crisis: ')),
          tel('988', '988', { class: 'tel' }),
          tr(' (Call or Text)', ' (Llamada o Texto)')
        ),
        h('span', { class: 'hotline-item' },
          strong(tr('SAMHSA National Helpline: ', 'Línea Nacional de SAMHSA: ')),
          tel('18006624357', '1-800-662-4357', { class: 'tel' })
        )
      )
    );

    // ------------------------------------------------------------------------
    // Tab Navigation Bar
    // ------------------------------------------------------------------------
    const tabsData = [
      { id: 'guidelines', label: tr('ACOG & SMFM Guidelines', 'Pautas ACOG y SMFM') },
      { id: 'esc', label: tr('Eat, Sleep, Console (NOWS)', 'Eat, Sleep, Console (NOWS)') },
      { id: 'capta', label: tr('CAPTA Plans of Safe Care', 'Planes de Cuidado Seguro CAPTA') },
      { id: 'checklist', label: tr('Pregnancy Checklist', 'Lista Prenatal') },
      { id: 'obgyn', label: tr('Questions for OB/GYN', 'Preguntas para el Obstetra') },
    ];

    const tabList = h('div', { class: 'tabs no-print', role: 'tablist', 'aria-label': tr('Perinatal care pathways', 'Rutas de atención perinatal') });

    for (const tab of tabsData) {
      const isActive = state.activeTab === tab.id;
      const tabBtn = h('button', {
        type: 'button',
        role: 'tab',
        id: `tab-${tab.id}`,
        class: `tab-btn ${isActive ? 'active' : ''}`,
        'aria-selected': isActive ? 'true' : 'false',
        'aria-controls': `panel-${tab.id}`,
        onclick: () => {
          setPerinatalState({ activeTab: tab.id });
          announce(tr(`Switched to ${tab.label}`, `Cambiado a ${tab.label}`));
          render();
        },
      }, tab.label);
      tabList.append(tabBtn);
    }

    // ------------------------------------------------------------------------
    // Tab Panels
    // ------------------------------------------------------------------------

    // PANEL 1: ACOG & SMFM Guidelines
    const guidelinesPanel = h('div', {
      role: 'tabpanel',
      id: 'panel-guidelines',
      'aria-labelledby': 'tab-guidelines',
      class: `tab-panel ${state.activeTab === 'guidelines' ? 'active' : 'hidden'}`,
      tabindex: '0',
    });

    guidelinesPanel.append(
      section('clinical-guidelines-intro',
        tr('Clinical Standards: ACOG & SMFM Perinatal Recommendations', 'Estándares Clínicos: Recomendaciones Perinatales de ACOG y SMFM'),
        p(tr(
          'Evidence-based guidelines established by the American College of Obstetricians and Gynecologists (ACOG) and the Society for Maternal-Fetal Medicine (SMFM) prioritize maternal-fetal stability, harm reduction, and continuity of pharmacotherapy.',
          'Las guías basadas en evidencia establecidas por el Colegio Americano de Obstetras y Ginecólogos (ACOG) y la Sociedad de Medicina Materno-Fetal (SMFM) priorizan la estabilidad materno-fetal, la reducción de daños y la continuidad farmacológica.'
        ))
      )
    );

    for (const guide of PERINATAL_GUIDELINES) {
      const card = h('article', { class: 'card guideline-card' },
        h('h3', null, tr(guide.title.en, guide.title.es)),
        p(tr(guide.summary.en, guide.summary.es)),
        h('div', { class: 'key-points-list' },
          guide.keyPoints.map((pt) =>
            h('div', { class: 'key-point-item' },
              h('h4', { class: 'key-point-title' }, tr(pt.topic.en, pt.topic.es)),
              p(tr(pt.detail.en, pt.detail.es))
            )
          )
        ),
        h('div', { class: 'citations-box fine' },
          strong(tr('Clinical Sources: ', 'Fuentes Clínicas: ')),
          guide.clinicalCitations.join(' • ')
        )
      );
      guidelinesPanel.append(card);
    }

    // PANEL 2: Eat, Sleep, Console (ESC) Model
    const escPanel = h('div', {
      role: 'tabpanel',
      id: 'panel-esc',
      'aria-labelledby': 'tab-esc',
      class: `tab-panel ${state.activeTab === 'esc' ? 'active' : 'hidden'}`,
      tabindex: '0',
    });

    escPanel.append(
      section('esc-intro',
        tr('Neonatal Opioid Withdrawal Syndrome (NOWS) & The ESC Model', 'Síndrome de Abstinencia Neonatal (NOWS) y el Modelo ESC'),
        p(tr(
          'The Eat, Sleep, Console (ESC) approach shifts newborn opioid withdrawal assessment away from subjective symptom lists (like traditional Finnegan scoring) toward functional wellness and family-centered non-pharmacological care.',
          'El modelo Eat, Sleep, Console (ESC) transforma la evaluación de la abstinencia neonatal, abandonando las escalas de síntomas subjetivas (como la escala Finnegan tradicional) para centrarse en el bienestar funcional y el cuidado no farmacológico familiar.'
        ))
      ),
      h('div', { class: 'table-wrap comparison-table-wrap', role: 'region', 'aria-label': tr('Finnegan vs ESC comparison', 'Comparación Finnegan frente a ESC'), tabindex: '0' },
        h('table', { class: 'data-table' },
          h('thead', null,
            h('tr', null,
              h('th', { scope: 'col' }, tr('Dimension', 'Dimensión')),
              h('th', { scope: 'col' }, tr('Traditional Finnegan (FNASS)', 'Finnegan Tradicional (FNASS)')),
              h('th', { scope: 'col' }, tr('Eat, Sleep, Console (ESC) Model', 'Modelo Eat, Sleep, Console (ESC)'))
            )
          ),
          h('tbody', null,
            h('tr', null,
              h('td', null, strong(tr('Clinical Focus', 'Enfoque Clínico'))),
              h('td', null, tr('21 discrete signs (sneezing, yawning, loose stools, tremors, Moro reflex)', '21 signos aislados (estornudos, bostezos, heces sueltas, temblores)')),
              h('td', null, strong(tr('3 core functional abilities: Eat adequately, Sleep ≥1 hour, Console within 10 min', '3 funciones esenciales: Comer bien, Dormir ≥1h, Calmarse en ≤10 min')))
            ),
            h('tr', null,
              h('td', null, strong(tr('Primary Caregiver', 'Cuidador Principal'))),
              h('td', null, tr('NICU nursing staff; parent often separated in nursery', 'Personal de UCIN; padres con frecuencia separados del bebé')),
              h('td', null, strong(tr('Parent/Family at bedside (empowered as primary treatment dyad)', 'Padre/Madre junto a la cuna (empoderados como tratamiento esencial)')))
            ),
            h('tr', null,
              h('td', null, strong(tr('First-Line Therapy', 'Terapia de Primera Línea'))),
              h('td', null, tr('Frequent escalation to neonatal opioids (morphine, methadone)', 'Escalación rápida a opioides neonatales (morfina, metadona)')),
              h('td', null, strong(tr('Non-pharmacological bundle: 24/7 rooming-in, kangaroo care, low lights, ad lib feeding', 'Paquete no farmacológico: alojamiento conjunto 24/7, piel con piel, luz tenue, libre demanda')))
            ),
            h('tr', null,
              h('td', null, strong(tr('Hospital Stay', 'Estancia Hospitalaria'))),
              h('td', null, tr('Prolonged NICU stay (typically 20 to 30+ days)', 'Estancia prolongada en UCIN (habitualmente 20 a 30+ días)')),
              h('td', null, strong(tr('Substantially shorter hospital stay (average 5 to 8 days)', 'Estancia significativamente más corta (promedio de 5 a 8 días)')))
            )
          )
        )
      )
    );

    const pillarsHeading = h('h3', null, tr('The Core Functional Pillars & Non-Pharmacological Bundle', 'Los Pilares Funcionales y el Paquete No Farmacológico'));
    escPanel.append(pillarsHeading);

    const escGrid = h('div', { class: 'cards-grid esc-grid' });
    for (const pillar of ESC_MODEL_PILLARS) {
      const card = h('article', { class: 'card esc-pillar-card' },
        h('h4', null, tr(pillar.title.en, pillar.title.es)),
        p(h('em', null, tr(pillar.plainLanguage.en, pillar.plainLanguage.es))),
        h('div', { class: 'esc-benchmark' },
          strong(tr('Functional Target: ', 'Meta Funcional: ')),
          tr(pillar.benchmark.en, pillar.benchmark.es)
        ),
        h('div', { class: 'esc-support-strategies' },
          strong(tr('Caregiver Strategies: ', 'Estrategias de Cuidado: ')),
          tr(pillar.supportStrategies.en, pillar.supportStrategies.es)
        )
      );
      escGrid.append(card);
    }
    escPanel.append(escGrid);

    // PANEL 3: CAPTA Plans of Safe Care & Legal Rights
    const captaPanel = h('div', {
      role: 'tabpanel',
      id: 'panel-capta',
      'aria-labelledby': 'tab-capta',
      class: `tab-panel ${state.activeTab === 'capta' ? 'active' : 'hidden'}`,
      tabindex: '0',
    });

    captaPanel.append(
      section('capta-intro',
        tr('CAPTA Plans of Safe Care & Family Rights Advocacy', 'Planes de Cuidado Seguro CAPTA y Defensa de Derechos Familiares'),
        p(tr(
          'Understanding the legal framework under the Child Abuse Prevention and Treatment Act (CAPTA) and the 2016 Comprehensive Addiction and Recovery Act (CARA) is critical to protecting parental autonomy, preventing punitive child welfare separation, and ensuring family-centered support.',
          'Comprender el marco legal bajo la ley CAPTA y las reformas de CARA 2016 es fundamental para proteger la autonomía familiar, evitar separaciones punitivas innecesarias y garantizar apoyo centrado en la familia.'
        ))
      )
    );

    for (const right of CAPTA_RIGHTS_CHECKLIST) {
      const rightCard = h('article', { class: 'card capta-card' },
        h('div', { class: 'chip chip-category' }, tr(right.category.en, right.category.es)),
        h('h3', null, tr(right.title.en, right.title.es)),
        p(tr(right.description.en, right.description.es)),
        h('div', { class: 'action-advice-box' },
          strong(tr('Empowered Advocacy Step: ', 'Paso Práctico de Abogacía: ')),
          tr(right.actionAdvice.en, right.actionAdvice.es)
        )
      );
      captaPanel.append(rightCard);
    }

    // PANEL 4: Interactive Pregnancy Checklist
    const checklistPanel = h('div', {
      role: 'tabpanel',
      id: 'panel-checklist',
      'aria-labelledby': 'tab-checklist',
      class: `tab-panel ${state.activeTab === 'checklist' ? 'active' : 'hidden'}`,
      tabindex: '0',
    });

    checklistPanel.append(
      section('checklist-intro',
        tr('Interactive Perinatal Substance Use Care Checklist', 'Lista Interactiva de Atención Perinatal para Uso de Sustancias'),
        p(tr(
          'Track your essential medical, pharmacotherapy, and social milestones from first trimester through newborn care. All progress is kept strictly in-RAM.',
          'Lleve el control de los hitos médicos, farmacológicos y sociales esenciales desde el primer trimestre hasta el cuidado del recién nacido. Su progreso se mantiene estrictamente en memoria RAM.'
        ))
      )
    );

    // Trimester Filter Buttons
    const trimesterFilters = [
      { id: 'all', label: tr('All Stages', 'Todas las Etapas') },
      { id: 'first', label: tr('1st Trimester', '1.er Trimestre') },
      { id: 'second', label: tr('2nd Trimester', '2.º Trimestre') },
      { id: 'third', label: tr('3rd Trimester', '3.er Trimestre') },
      { id: 'labor', label: tr('Labor & Birth', 'Parto y Nacimiento') },
      { id: 'postpartum', label: tr('Postpartum & Baby', 'Posparto y Bebé') },
    ];

    const filterGroup = h('div', { class: 'filter-group no-print', role: 'group', 'aria-label': tr('Filter checklist by trimester', 'Filtrar lista por trimestre') });
    for (const tf of trimesterFilters) {
      const isSelected = state.trimester === tf.id;
      const btn = h('button', {
        type: 'button',
        class: `btn btn-small ${isSelected ? 'btn-primary' : 'btn-ghost'}`,
        'aria-pressed': isSelected ? 'true' : 'false',
        onclick: () => {
          setPerinatalState({ trimester: tf.id });
          announce(tr(`Filtered to ${tf.label}`, `Filtrado a ${tf.label}`));
          render();
        },
      }, tf.label);
      filterGroup.append(btn);
    }
    checklistPanel.append(filterGroup);

    // Checklist Items List
    const filteredItems = PRENATAL_CHECKLIST_ITEMS.filter((item) =>
      state.trimester === 'all' || item.trimester === state.trimester
    );

    const completedInFilter = filteredItems.filter((item) => state.checklist[item.id]).length;
    const progressSummary = h('p', { class: 'progress-summary' },
      strong(tr(
        `Completed: ${completedInFilter} of ${filteredItems.length} items (${Math.round((completedInFilter / (filteredItems.length || 1)) * 100)}%)`,
        `Completados: ${completedInFilter} de ${filteredItems.length} elementos (${Math.round((completedInFilter / (filteredItems.length || 1)) * 100)}%)`
      ))
    );
    checklistPanel.append(progressSummary);

    const itemsList = h('ul', { class: 'checklist-items-list', 'aria-label': tr('Checklist items', 'Elementos de la lista') });
    for (const item of filteredItems) {
      const isChecked = !!state.checklist[item.id];
      const checkboxId = `chk-${item.id}`;

      const checkbox = h('input', {
        type: 'checkbox',
        id: checkboxId,
        class: 'checklist-checkbox',
        checked: isChecked,
        onchange: (e) => {
          const checked = e.target.checked;
          setPerinatalState({ checklist: { [item.id]: checked } });
          announce(tr(
            `${tr(item.title.en, item.title.es)} marked ${checked ? 'completed' : 'uncompleted'}`,
            `${tr(item.title.en, item.title.es)} marcado como ${checked ? 'completado' : 'pendiente'}`
          ));
          render();
        },
      });

      const label = h('label', { for: checkboxId, class: 'checklist-label' },
        h('span', { class: 'checklist-title' }, tr(item.title.en, item.title.es)),
        h('span', { class: 'checklist-detail fine' }, tr(item.detail.en, item.detail.es))
      );

      const listItem = h('li', { class: `checklist-item ${isChecked ? 'completed' : ''}` },
        checkbox,
        label
      );
      itemsList.append(listItem);
    }
    checklistPanel.append(itemsList);

    // Notes textarea
    const notesHeading = h('h3', null, tr('Personal Notes & Care Questions (Ephemeral)', 'Notas Personales y Dudas (Efímeras)'));
    const notesTextarea = h('textarea', {
      class: 'perinatal-notes-input',
      rows: '4',
      placeholder: tr(
        'Type any questions, dose history, or reminders here. Kept only in browser memory...',
        'Escriba aquí sus preguntas, historial de dosis o recordatorios. Se mantiene solo en memoria...'
      ),
      'aria-label': tr('Ephemeral notes for your obstetrician', 'Notas efímeras para su obstetra'),
      oninput: (e) => {
        setPerinatalState({ notes: e.target.value });
      },
    }, state.notes);

    checklistPanel.append(notesHeading, notesTextarea);

    // PANEL 5: OB/GYN Visit Questions
    const obgynPanel = h('div', {
      role: 'tabpanel',
      id: 'panel-obgyn',
      'aria-labelledby': 'tab-obgyn',
      class: `tab-panel ${state.activeTab === 'obgyn' ? 'active' : 'hidden'}`,
      tabindex: '0',
    });

    obgynPanel.append(
      section('obgyn-intro',
        tr('Discussion Guide: Questions for Your OB/GYN & Delivery Team', 'Guía de Diálogo: Preguntas para su Obstetra y Equipo de Parto'),
        p(tr(
          'Take these validated questions to your prenatal visits to ensure your care team collaborates on MOUD dosing adjustments, non-punitive pain management, and supportive hospital policies.',
          'Lleve estas preguntas a sus consultas prenatales para asegurarse de que su equipo colabore en los ajustes de dosis de MOUD, manejo del dolor sin prejuicios y políticas hospitalarias de apoyo.'
        ))
      )
    );

    const questionsList = h('ol', { class: 'obgyn-questions-list' });
    for (const qItem of OBGYN_VISIT_QUESTIONS) {
      const qLi = h('li', { class: 'card obgyn-question-card' },
        h('p', { class: 'question-text' }, strong(tr(qItem.question.en, qItem.question.es))),
        h('p', { class: 'rationale-text fine' },
          strong(tr('Why this matters: ', 'Por qué es importante: ')),
          tr(qItem.clinicalRationale.en, qItem.clinicalRationale.es)
        ),
        h('div', { class: 'actions no-print' },
          h('button', {
            type: 'button',
            class: 'btn btn-small btn-ghost',
            onclick: async () => {
              const text = tr(qItem.question.en, qItem.question.es);
              try {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  await navigator.clipboard.writeText(text);
                  announce(tr('Question copied to clipboard.', 'Pregunta copiada al portapapeles.'));
                }
              } catch {
                announce(tr('Could not copy question.', 'No se pudo copiar la pregunta.'));
              }
            },
          }, icon('clipboard'), tr('Copy Question', 'Copiar Pregunta'))
        )
      );
      questionsList.append(qLi);
    }
    obgynPanel.append(questionsList);

    // ------------------------------------------------------------------------
    // Printable Clinical Handout Summary Box
    // ------------------------------------------------------------------------
    const printHandoutBox = h('section', {
      class: 'print-handout perinatal-print-handout',
      'aria-label': tr('Printable Perinatal Clinical Summary', 'Resumen Clínico Perinatal Imprimible'),
    },
      h('h2', { class: 'print-handout-title' }, tr('HarborPath Perinatal Care Pathway Handout', 'Folleto Clínico Perinatal de HarborPath')),
      h('p', { class: 'fine' }, tr(
        'Printable clinical and self-advocacy summary. 100% ephemeral in-RAM session; zero PII retained.',
        'Resumen clínico y de abogacía imprimible. Sesión 100% efímera en memoria RAM; sin retención de datos personales.'
      )),
      h('pre', { class: 'summary-text-box' }, formatPerinatalSummaryText(state)),
      h('div', { class: 'actions no-print' },
        printBtn,
        copyBtn
      )
    );

    // Assemble View
    
    const ecBanner = h('div', { class: 'info-callout', role: 'note' }, [
      h('strong', {}, isEs ? '¿Necesita anticoncepción de emergencia o prevención de ITS? ' : 'Need emergency contraception or STI post-exposure care? '),
      h('span', {}, isEs
        ? 'Consulte la guía de anticoncepción de emergencia (Plan B vs Ella vs DIU según peso) y Doxy-PEP: '
        : 'Consult the emergency contraception guide (Plan B vs Ella vs IUD weight thresholds) and Doxy-PEP: '),
      h('a', { href: '#/sexual-health' }, isEs
        ? 'Abrir Navegador de Salud Sexual y Anticoncepción de Emergencia →'
        : 'Open Sexual Health & Emergency Contraception Navigator →')
    ]);
    container.append(ecBanner);

    const obEmergBanner = h('div', { class: 'info-callout mt-2', role: 'note' }, [
      h('strong', {}, isEs ? '¿Urgencia Obstétrica, Dosis Fraccionada en 3.er Trimestre, Cesárea en TMO o Modelo Comer-Dormir-Consolar (ESC)? ' : 'Acute Obstetric Emergency, 3rd-Trimester Split-Dosing, Cesarean Analgesia on MOUD, or Eat-Sleep-Console (ESC)? '),
      h('span', {}, isEs
        ? 'Protocolos ACOG/SMFM/ASAM/AAP para preeclampsia/desprendimiento placentario, prohibición de Nalbufina/Butorfanol, hemorragia posparto (sin Metilergonovina en HTA) y cuidados neonatales ESC: '
        : 'ACOG/SMFM/ASAM/AAP protocols for preeclampsia/placental abruption, Nalbuphine/Butorphanol prohibition, postpartum hemorrhage (no Methergine in HTN/stimulants), and neonatal ESC care: '),
      h('a', { href: '#/obstetric-emergencies' }, isEs
        ? 'Abrir Navegador de Emergencias Obstétricas, TMO Periparto y Modelo ESC →'
        : 'Open Obstetric Emergencies, Peripartum MOUD & Eat-Sleep-Console Navigator →')
    ]);
    container.append(obEmergBanner);

    const pedExposureBanner = h('div', { class: 'info-callout mt-2', role: 'note' }, [
      h('strong', {}, isEs ? '¿Ingestión Accidental Pediátrica, Almacenamiento Seguro o Toxicología Infantil? ' : 'Pediatric Accidental Exposure, Safe Storage or Child Toxicology? '),
      h('span', {}, isEs
        ? 'Protocolos de emergencia AAP/ACMT para ingestión de buprenorfina/metadona en niños, naloxona pediátrica, comestibles de cannabis y cajas de seguridad: '
        : 'AAP/ACMT emergency protocols for toddler buprenorphine/methadone ingestion, pediatric naloxone, cannabis edibles, and lockboxes: '),
      h('a', { href: '#/pediatric-exposures' }, isEs
        ? 'Abrir Navegador de Exposiciones Pediátricas y Almacenamiento Seguro →'
        : 'Open Pediatric Accidental Exposures & Safe Storage Navigator →')
    ]);
    container.append(pedExposureBanner);

    container.append(
      header,
      controlsBar,
      privacyNotice,
      hotlineBanner,
      tabList,
      guidelinesPanel,
      escPanel,
      captaPanel,
      checklistPanel,
      obgynPanel,
      printHandoutBox
    );
  }

  render();
  return container;
}
