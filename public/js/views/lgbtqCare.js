/**
 * LGBTQ+ & Gender-Affirming SUD Specialist View (public/js/views/lgbtqCare.js)
 *
 * Comprehensive, trauma-informed clinical and harm reduction guidance for
 * Lesbian, Gay, Bisexual, Transgender, Queer, and Two-Spirit (LGBTQ+/2S) individuals:
 *
 * 1. Gender-Affirming Hormone Therapy (HRT) & MOUD Clinical Compatibility:
 *    - WPATH Standards of Care (SOC 8) & SAMHSA Clinical Guidance: Providers must NEVER
 *      withhold, taper, or pause gender-affirming hormone therapy as a condition of SUD care.
 *    - Pharmacokinetic non-interference: Sublingual buprenorphine, methadone, and naltrexone
 *      do not diminish the endocrine efficacy of estrogens, spironolactone, or testosterone.
 *
 * 2. Specialized Harm Reduction (Chemsex / Party & Play Protocols):
 *    - GHB / GBL: Steep dose-response curve, dosing timers, avoiding G-outs, and medically
 *      supervised inpatient detoxification for severe GABA-B autonomic withdrawal.
 *    - Alkyl Nitrites ("Poppers") + PDE5 Inhibitors (Viagra/Cialis): Fatal hypotension contraindication.
 *    - Crystal Methamphetamine: Overamping prevention, neuroprotection, hydration, and sleep hygiene.
 *    - Ketamine: Bladder protection (ketamine-induced ulcerative cystitis) and respiratory safety.
 *
 * 3. Sexual Health & Biomedical Prevention Integration:
 *    - Pre-Exposure Prophylaxis (PrEP) and Post-Exposure Prophylaxis (PEP within 72 hours).
 *    - Doxy-PEP (200 mg doxycycline within 72 hours post-exposure) for STI prevention.
 *    - Take-home naloxone and fentanyl test strips (FTS) distributed in nightlife spaces.
 *
 * 4. Transgender-Affirming Facility Selection & Civil Rights:
 *    - ACA Section 1557 & HUD Equal Access Rule: Right to rooming aligned with gender identity.
 *    - Zero deadnaming/misgendering policies and private bathroom accommodations.
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

// ============================================================================
// 1. Clinical Standards & Hormone Therapy Compatibility
// ============================================================================

export const LGBTQ_CARE_STANDARDS = [
  {
    id: 'hrt_moud_continuity',
    title: {
      en: 'Uninterrupted Hormone Replacement Therapy (HRT) During SUD Care',
      es: 'Continuidad Ininterrumpida de Terapia Hormonal (TRH) Durante el Tratamiento',
    },
    authority: 'WPATH Standards of Care Version 8 (2022); SAMHSA TIP 59; Endocrine Society Guidelines',
    summary: {
      en: 'Withholding or pausing gender-affirming hormone therapy (estradiol, testosterone, spironolactone, progesterone) during addiction treatment or detoxification is medically contraindicated. Abrupt cessation precipitates severe dysphoria, acute depression, emotional instability, and elevated relapse risk.',
      es: 'Suspender o pausar la terapia hormonal de afirmación de género (estradiol, testosterona, espironolactona, progesterona) durante el tratamiento o desintoxicación está médicamente contraindicado. La interrupción súbita provoca disforia severa, depresión aguda y alto riesgo de recaída.',
    },
    actionAdvice: {
      en: 'Inform your intake team that your hormone therapy is essential maintenance medical care. Providers must continue your prescribed hormone regimen throughout outpatient and residential care.',
      es: 'Informe al equipo de ingreso que su terapia hormonal es un tratamiento médico esencial de mantenimiento. Los proveedores deben continuar su régimen hormonal durante toda la atención.',
    },
  },
  {
    id: 'trans_facility_rights',
    title: {
      en: 'Residential Facility Housing & Privacy Rights (ACA § 1557 & HUD)',
      es: 'Derechos de Alojamiento y Privacidad en Centros Residenciales (ACA § 1557 y HUD)',
    },
    authority: 'ACA Section 1557 (45 C.F.R. Part 92); HUD Equal Access Rule (24 C.F.R. § 5.106)',
    summary: {
      en: 'Federal regulations prohibit healthcare and residential programs receiving federal assistance from discriminating based on gender identity. Transgender and non-binary individuals have the right to rooming that corresponds with their affirmed gender identity, access to private bathrooms/showers, and freedom from deadnaming or misgendering.',
      es: 'Las normas federales prohíben a programas residenciales que reciben fondos federales discriminar por identidad de género. Las personas transgénero y no binarias tienen derecho a ser asignadas a habitaciones según su identidad de género afirmada y acceso a duchas privadas.',
    },
    actionAdvice: {
      en: 'Ask residential facilities prior to admission about their explicit written transgender housing policy, private bathroom access, and staff cultural competency training.',
      es: 'Pregunte a los centros residenciales antes del ingreso sobre su política escrita de alojamiento para personas trans, acceso a baños privados y capacitación del personal.',
    },
  },
  {
    id: 'minority_stress_validation',
    title: {
      en: 'Minority Stress Framework & Trauma-Informed Counseling',
      es: 'Marco de Estrés de Minorías y Consejería Informada en Trauma',
    },
    authority: 'Meyer (2003) Minority Stress Theory; SAMHSA Culturally Responsive Care',
    summary: {
      en: 'Higher rates of substance use in LGBTQ+ communities are not individual moral failings, but physiological and psychological responses to chronic minority stress: family rejection, harassment, societal stigma, employment discrimination, and trauma.',
      es: 'Las mayores tasas de consumo en comunidades LGBTQ+ no son fallas morales, sino respuestas psicofisiológicas al estrés crónico de minorías: rechazo familiar, discriminación, violencia y trauma.',
    },
    actionAdvice: {
      en: 'Seek treatment programs that employ LGBTQ+-identifying clinicians or explicitly advertise trauma-informed affirmative behavioral therapies.',
      es: 'Busque programas que cuenten con terapeutas de la comunidad LGBTQ+ o que ofrezcan terapias afirmativas e informadas en trauma.',
    },
  },
];

export const HRT_MOUD_SAFETY_INTERACTIONS = [
  {
    medication: 'Sublingual Buprenorphine (Suboxone / Subutex)',
    hrtCompatibility: 'Completely Safe & Compatible',
    interactionSummary: {
      en: 'No adverse metabolic or receptor interactions with feminizing (estradiol, spironolactone) or masculinizing (testosterone) hormones. Does not alter serum hormone levels.',
      es: 'Sin interacciones metabólicas ni de receptores adversas con hormonas feminizantes (estradiol, espironolactona) o masculinizantes (testosterona). No altera los niveles hormonales séricos.',
    },
  },
  {
    medication: 'Methadone',
    hrtCompatibility: 'Compatible with Routine Endocrine Monitoring',
    interactionSummary: {
      en: 'Safe to co-administer with HRT. High doses of full opioid agonists can mildly suppress endogenous gonadal axis, but exogenous HRT maintains stable affirmed hormone concentrations. Regular endocrine laboratory follow-ups recommended.',
      es: 'Seguro de coadministrar con TRH. Dosis altas de agonistas opioides completos pueden atenuar levemente el eje gonadal endógeno, pero la TRH exógena mantiene estables los niveles hormonales afirmados.',
    },
  },
  {
    medication: 'Naltrexone (Oral or Vivitrol Injections)',
    hrtCompatibility: 'Completely Safe & Compatible',
    interactionSummary: {
      en: 'Pure opioid antagonist with zero endocrine disruption. 100% compatible with all forms of estrogens, anti-androgens, progestins, and testosterone.',
      es: 'Antagonista opioide puro sin disrupción endocrina. 100% compatible con todas las formas de estrógenos, antiandrógenos, progestinas y testosterona.',
    },
  },
  {
    medication: 'Gender-Affirming Surgery & Acute Pain Management',
    hrtCompatibility: 'MOUD Maintenance Standard',
    interactionSummary: {
      en: 'Patients on MOUD undergoing gender-affirming surgeries (chest reconstruction, vaginoplasty, phalloplasty) should maintain their baseline MOUD dose and receive multimodal non-opioid analgesia paired with short-acting full agonist opioids as needed under close clinical supervision.',
      es: 'Pacientes en MOUD sometidos a cirugías de afirmación deben mantener su dosis base de MOUD y recibir analgesia multimodal complementada con opioides de acción corta bajo supervisión.',
    },
  },
];

// ============================================================================
// 2. Chemsex / Party & Play (P&P) Harm Reduction Protocols
// ============================================================================

export const CHEMSEX_HARM_REDUCTION_PROTOCOLS = [
  {
    substanceId: 'ghb_gbl',
    name: 'GHB / GBL (G, Liquid G, Gina)',
    riskTier: 'critical',
    keyRisks: {
      en: 'Extreme overdose risk: Steep non-linear dose-response curve where a minute increase (0.5 mL) can cause respiratory arrest, deep unarousable coma ("G-out"), and death. Compounding risk: Physical dependence can develop with around-the-clock use, triggering life-threatening autonomic withdrawal (severe delirium, tremors, hallucinations, seizures) within 2-4 hours of the last dose.',
      es: 'Riesgo extremo de sobredosis: Curva de dosis-respuesta no lineal muy pronunciada donde un leve incremento (0.5 mL) provoca paro respiratorio, coma profundo ("G-out") y muerte. La dependencia física tras uso continuo genera abstinencia autonómica potencialmente mortal en 2 a 4 horas.',
    },
    harmReductionRules: {
      en: [
        'NEVER mix GHB/GBL with alcohol, benzodiazepines, ketamine, or opioids (synergistic respiratory arrest).',
        'Use strict dosing timers: Set an alarm on your phone and wait at least 2 to 3 hours before considering any redose.',
        'Always measure doses with an accurate 1 mL oral syringe; never drink directly from bottles or caps.',
        'Color your G liquid with food dye to prevent accidental ingestion by yourself or others.',
        'Withdrawal warning: Never stop GHB/GBL "cold turkey" if using daily/around the clock; seek specialized inpatient medical detoxification using benzodiazepines and phenobarbital.',
      ],
      es: [
        'NUNCA mezcle GHB/GBL con alcohol, benzodiacepinas, ketamina ni opioides (paro respiratorio sinérgico).',
        'Use temporizadores de dosis estrictos: Ponga alarma en su teléfono y espere al menos 2 a 3 horas antes de redosificar.',
        'Mida siempre con jeringa oral de 1 mL calibrada; nunca beba de tapas o botellas.',
        'Tiña el líquido con colorante de alimentos para evitar ingestas accidentales.',
        'Alerta de abstinencia: Nunca suspenda de golpe si consume diariamente las 24 horas; requiere desintoxicación hospitalaria con benzodiacepinas y fenobarbital.',
      ],
    },
  },
  {
    substanceId: 'poppers_nitrites',
    name: 'Alkyl Nitrites ("Poppers" / Amyl / Isobutyl / Isoamyl)',
    riskTier: 'critical_interaction',
    keyRisks: {
      en: 'Black box contraindication with Phosphodiesterase-5 (PDE5) Inhibitors: Combining poppers with erectile dysfunction medications (sildenafil / Viagra, tadalafil / Cialis, vardenafil) causes catastrophic, refractory vasodilation, profound hypotension, heart attack, and fatal cardiovascular collapse.',
      es: 'Contraindicación de caja negra con inhibidores de la PDE5: Combinar poppers con fármacos para la erección (sildenafil / Viagra, tadalafil / Cialis) provoca vasodilatación catastrófica, hipotensión profunda, infarto y colapso cardiovascular mortal.',
    },
    harmReductionRules: {
      en: [
        'NEVER combine poppers with Viagra, Cialis, or Levitra. Wait at least 24-48 hours after PDE5 inhibitor use before any nitrite exposure.',
        'Never ingest or swallow popper liquids; swallowed nitrites cause fatal methemoglobinemia and severe chemical burns.',
        'Avoid skin and mucosal contact; keep bottle capped when not actively inhaling.',
        'If chest pain, severe dizziness, or blue/gray discoloration of the lips occurs, call 911 immediately.',
      ],
      es: [
        'NUNCA combine poppers con Viagra, Cialis o Levitra. Espere al menos 24 a 48 horas tras tomar PDE5 antes de usar nitritos.',
        'Nunca trague el líquido de popper; ingerirlo provoca metahemoglobinemia mortal y quemaduras químicas severas.',
        'Evite contacto con la piel; mantenga la botella tapada cuando no la inhale.',
        'Si siente dolor en el pecho, mareo severo o labios azulados/grises, llame al 911 de inmediato.',
      ],
    },
  },
  {
    substanceId: 'methamphetamine',
    name: 'Crystal Methamphetamine (Tina, T, Crystal, Ice)',
    riskTier: 'high',
    keyRisks: {
      en: 'Severe acute hyperthermia, tachycardia, hypertensive emergency, rhabdomyolysis, and stimulant-induced psychosis ("overamping"). Prolonged sleep deprivation accelerates psychological decompensation.',
      es: 'Hipertermia severa, taquicardia, emergencia hipertensiva, rabdomiólisis y psicosis por sobreestimulación ("overamping"). La falta prolongada de sueño acelera la descompensación psicológica.',
    },
    harmReductionRules: {
      en: [
        'Enforce sleep intervals: Plan sleep within every 24-36 hour window to prevent dopaminergic exhaustion and psychosis.',
        'Hydrate with water and electrolytes (1 cup per hour of active movement or sex).',
        'Avoid slamming (injecting) if possible; if injecting, use a brand-new sterile syringe every time and never share water, cookers, or cottons.',
        'Always test baggies with fentanyl test strips (counterfeit and cross-contaminated supplies are widespread).',
      ],
      es: [
        'Respete intervalos de sueño: Duerma dentro de cada 24 a 36 horas para prevenir agotamiento dopaminérgico y psicosis.',
        'Hidrátese con agua y electrolitos (1 vaso por hora de actividad física o sexual).',
        'Evite inyectarse si es posible; si se inyecta, use siempre jeringa estéril nueva y nunca comparta recipientes ni filtros.',
        'Compruebe siempre con tiras reactivas de fentanilo para detectar contaminación cruzada.',
      ],
    },
  },
];

// ============================================================================
// 3. In-RAM LGBTQ+ Assessment Engine: evaluateLgbtqCarePathway(inputs)
// ============================================================================

export function evaluateLgbtqCarePathway(inputs = {}) {
  const {
    genderIdentity = 'transgender_woman', // 'transgender_woman' | 'transgender_man' | 'non_binary' | 'cisgender_gay_bi' | 'queer_other'
    takingHrt = true,                      // boolean: currently on hormone therapy
    moudInterest = 'buprenorphine',        // 'buprenorphine' | 'methadone' | 'naltrexone' | 'none'
    chemsexSubstances = [],                // ['ghb_gbl', 'poppers', 'methamphetamine', 'ketamine']
    usingPde5Inhibitors = false,           // boolean: taking Viagra, Cialis, etc.
    needsPrepPep = true,                   // boolean: interested in HIV prophylaxis
    seekingResidential = false,            // boolean: exploring inpatient/residential rehab
  } = inputs;

  const alerts = [];
  const harmReductionAdvice = [];

  // 1. Critical Interaction: Poppers + PDE5 Inhibitors
  const hasPoppers = chemsexSubstances.includes('poppers');
  if (hasPoppers && usingPde5Inhibitors) {
    alerts.push({
      priority: 'critical',
      title: {
        en: 'CRITICAL WARNING: Poppers + PDE5 Inhibitor (Viagra/Cialis) Lethal Interaction',
        es: 'ADVERTENCIA CRÍTICA: Interacción Mortal de Poppers + Inhibidor PDE5 (Viagra/Cialis)',
      },
      text: {
        en: 'Co-administering alkyl nitrites ("poppers") with sildenafil (Viagra), tadalafil (Cialis), or vardenafil causes profound, irreversible vasodilation, catastrophic blood pressure drops, heart attack, and death. Never take poppers within 48 hours of an erectile medication.',
        es: 'Coadministrar nitritos de alquilo ("poppers") con sildenafil (Viagra) o tadalafil (Cialis) causa vasodilatación irreversible, hipotensión catastrófica, infarto y muerte. Nunca use poppers dentro de las 48 horas tras tomar medicación para la erección.',
      },
    });
  }

  // 2. GHB/GBL Protocols
  const hasGhb = chemsexSubstances.includes('ghb_gbl');
  if (hasGhb) {
    harmReductionAdvice.push(CHEMSEX_HARM_REDUCTION_PROTOCOLS.find((p) => p.substanceId === 'ghb_gbl'));
  }

  // 3. Methamphetamine Protocols
  const hasMeth = chemsexSubstances.includes('methamphetamine');
  if (hasMeth) {
    harmReductionAdvice.push(CHEMSEX_HARM_REDUCTION_PROTOCOLS.find((p) => p.substanceId === 'methamphetamine'));
  }

  // 4. HRT & MOUD Affirmation
  let hrtAdvice = null;
  if (takingHrt) {
    hrtAdvice = {
      status: 'fully_compatible',
      title: {
        en: 'Gender-Affirming Hormone Therapy (HRT) & MOUD are 100% Compatible',
        es: 'Terapia Hormonal (TRH) y MOUD son 100% Compatibles',
      },
      detail: {
        en: 'Under WPATH SOC 8 guidelines, your hormone therapy must be maintained without interruption. Buprenorphine, methadone, and naltrexone do not interfere with estrogen, spironolactone, or testosterone therapy.',
        es: 'Bajo las normas WPATH SOC 8, su terapia hormonal debe mantenerse sin interrupción. La buprenorfina, metadona y naltrexona no interfieren con estrógenos, espironolactona ni testosterona.',
      },
    };
  }

  // 5. Residential Trans Rights Guidance
  let residentialAdvice = null;
  if (seekingResidential) {
    residentialAdvice = {
      title: {
        en: 'Residential Rehab Civil Rights (ACA § 1557 & HUD Equal Access)',
        es: 'Derechos Civiles en Rehabilitación Residencial (ACA § 1557 y HUD)',
      },
      detail: {
        en: 'You have the legal right to rooming corresponding with your affirmed gender identity and private bathroom accommodations. Inquire about facility policies prior to admission.',
        es: 'Tiene el derecho legal a ser alojado/a según su identidad de género afirmada y contar con baños privados. Consulte las políticas del centro antes del ingreso.',
      },
    };
  }

  // 6. PrEP, PEP & Doxy-PEP Next Steps
  const biomedicalAdvice = [];
  if (needsPrepPep) {
    biomedicalAdvice.push({
      topic: { en: 'HIV PrEP / PEP Integration', es: 'Integración de PrEP / PEP contra VIH' },
      detail: {
        en: 'Daily oral or bimonthly injectable PrEP provides >99% protection against sexual HIV transmission. If a high-risk exposure occurred within the past 72 hours, initiate emergency Post-Exposure Prophylaxis (PEP) immediately.',
        es: 'La PrEP oral diaria o inyectable bimestral ofrece >99% de protección contra VIH por vía sexual. Si hubo exposición de alto riesgo en las últimas 72 horas, inicie PEP de emergencia de inmediato.',
      },
    });
    biomedicalAdvice.push({
      topic: { en: 'Doxy-PEP for STI Prevention', es: 'Doxy-PEP para Prevención de ITS' },
      detail: {
        en: 'Take a single dose of doxycycline 200 mg within 72 hours after condomless sex (ideally within 24h) to reduce bacterial STIs (syphilis, chlamydia, gonorrhea) by up to 85%.',
        es: 'Tome una dosis única de doxiciclina 200 mg dentro de 72 horas tras relaciones sexuales sin condón para reducir ITS bacterianas hasta en un 85%.',
      },
    });
  }

  // 7. Clinical Discussion Items
  const discussionItems = [
    {
      topic: { en: 'HRT Prescription Verification', es: 'Verificación de Receta de TRH' },
      question: {
        en: 'Can we confirm that my gender-affirming hormone medications will be continued without interruption or dosage changes while enrolled in this program?',
        es: '¿Podemos confirmar que mis medicamentos hormonales de afirmación de género continuarán sin interrupción ni cambios de dosis mientras esté en el programa?',
      },
    },
    {
      topic: { en: 'Transgender Housing Policy', es: 'Política de Alojamiento para Personas Trans' },
      question: {
        en: 'What is your formal policy regarding residential rooming alignment with gender identity, chosen names/pronouns, and private hygiene facilities?',
        es: '¿Cuál es su política formal sobre alojamiento residencial acorde con la identidad de género, pronombres y privacidad en duchas?',
      },
    },
    {
      topic: { en: 'Harm Reduction & PrEP Co-Location', es: 'Reducción de Daños y PrEP Integrada' },
      question: {
        en: 'Does your facility provide on-site PrEP/PEP navigation, fentanyl test strips, and nasal naloxone rescue kits?',
        es: '¿Su centro cuenta con orientación para PrEP/PEP, tiras reactivas de fentanilo y kits de rescate de naloxona en el lugar?',
      },
    },
  ];

  return {
    evaluatedAt: new Date().toISOString(),
    inputs,
    alerts,
    harmReductionAdvice,
    hrtAdvice,
    residentialAdvice,
    biomedicalAdvice,
    discussionItems,
    standards: LGBTQ_CARE_STANDARDS,
    hrtMatrix: HRT_MOUD_SAFETY_INTERACTIONS,
  };
}

// ============================================================================
// 4. Ephemeral In-RAM State Management
// ============================================================================

let lgbtqState = {
  genderIdentity: 'transgender_woman',
  takingHrt: true,
  moudInterest: 'buprenorphine',
  chemsexSubstances: ['methamphetamine'],
  usingPde5Inhibitors: false,
  needsPrepPep: true,
  seekingResidential: false,
  activeTab: 'decision_aid', // 'decision_aid' | 'standards' | 'chemsex' | 'hrt_moud'
  lastEvaluation: null,
};

export function getLgbtqState() {
  return { ...lgbtqState, chemsexSubstances: [...lgbtqState.chemsexSubstances] };
}

export function setLgbtqState(partial) {
  lgbtqState = { ...lgbtqState, ...partial };
  return getLgbtqState();
}

export function resetLgbtqState() {
  lgbtqState = {
    genderIdentity: 'transgender_woman',
    takingHrt: true,
    moudInterest: 'buprenorphine',
    chemsexSubstances: ['methamphetamine'],
    usingPde5Inhibitors: false,
    needsPrepPep: true,
    seekingResidential: false,
    activeTab: 'decision_aid',
    lastEvaluation: null,
  };
  return getLgbtqState();
}

// ============================================================================
// 5. Summary Text Formatter (Bilingual Copy/Print)
// ============================================================================

export function formatLgbtqSummaryText(plan, lang = 'en') {
  if (!plan) return '';
  const isEs = lang === 'es';
  const divider = '======================================================================';
  const subDivider = '----------------------------------------------------------------------';

  const lines = [
    divider,
    isEs
      ? 'PLAN CLÍNICO Y DE REDUCCIÓN DE DAÑOS LGBTQ+ - HARBORPATH'
      : 'LGBTQ+ & GENDER-AFFIRMING CLINICAL CARE PLAN - HARBORPATH',
    isEs
      ? 'Asistencia epímera en memoria | Cero rastreo | Confidencial'
      : 'In-RAM Ephemeral Decision Support | Zero Tracking | Confidential',
    divider,
    '',
    `${isEs ? 'Identidad de género' : 'Affirmed Identity'}: ${plan.inputs.genderIdentity}`,
    `${isEs ? 'Terapia hormonal (TRH)' : 'Hormone Therapy (HRT)'}: ${plan.inputs.takingHrt ? (isEs ? 'ACTIVA (Debe continuarse sin pausa)' : 'ACTIVE (Must be maintained)') : (isEs ? 'No reportada' : 'Not reported')}`,
    `${isEs ? 'Sustancias reportadas' : 'Substances'}: ${plan.inputs.chemsexSubstances.join(', ') || (isEs ? 'Ninguna' : 'None')}`,
    '',
  ];

  if (plan.alerts.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'ALERTAS CRÍTICAS DE SEGURIDAD:' : 'CRITICAL SAFETY ALERTS:');
    lines.push(subDivider);
    plan.alerts.forEach((al) => {
      lines.push(`[${al.priority.toUpperCase()}] ${isEs ? al.title.es : al.title.en}`);
      lines.push(`  ${isEs ? al.text.es : al.text.en}`);
      lines.push('');
    });
  }

  if (plan.hrtAdvice) {
    lines.push(subDivider);
    lines.push(isEs ? 'PAUTA DE TERAPIA HORMONAL Y MOUD:' : 'HRT & MOUD COMPATIBILITY:');
    lines.push(subDivider);
    lines.push(`* ${isEs ? plan.hrtAdvice.title.es : plan.hrtAdvice.title.en}`);
    lines.push(`  ${isEs ? plan.hrtAdvice.detail.es : plan.hrtAdvice.detail.en}`);
    lines.push('');
  }

  if (plan.biomedicalAdvice.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'PREVENCIÓN BIOMÉDICA (PrEP / PEP / Doxy-PEP):' : 'BIOMEDICAL PREVENTION (PrEP / PEP / Doxy-PEP):');
    lines.push(subDivider);
    plan.biomedicalAdvice.forEach((bio) => {
      lines.push(`* ${isEs ? bio.topic.es : bio.topic.en}: ${isEs ? bio.detail.es : bio.detail.en}`);
    });
    lines.push('');
  }

  lines.push(subDivider);
  lines.push(isEs ? 'PREGUNTAS PARA EL EQUIPO DE INGRESO:' : 'INTAKE PROVIDER DISCUSSION CHECKLIST:');
  lines.push(subDivider);
  plan.discussionItems.forEach((it) => {
    lines.push(`- [ ] (${isEs ? it.topic.es : it.topic.en}) ${isEs ? it.question.es : it.question.en}`);
  });

  lines.push('');
  lines.push(subDivider);
  lines.push(isEs ? 'LÍNEAS DE APOYO LGBTQ+ 24/7:' : '24/7 LGBTQ+ CRISIS HELPLINES:');
  lines.push(subDivider);
  lines.push(
    isEs
      ? 'The Trevor Project (Jóvenes LGBTQ+ 24/7): 1-866-488-7386 | Mensaje START al 678-678'
      : 'The Trevor Project (24/7 LGBTQ+ youth support): 1-866-488-7386 | Text START to 678-678'
  );
  lines.push(
    isEs
      ? 'Trans Lifeline (Operada por y para personas trans): 1-877-565-8860'
      : 'Trans Lifeline (Peer support by and for trans peers): 1-877-565-8860'
  );
  lines.push('');
  lines.push(divider);

  return lines.join('\n');
}

// ============================================================================
// 6. Accessible DOM View: lgbtqCareView(containerOrOptions, maybeOptions)
// ============================================================================

export function lgbtqCareView(containerOrOptions = {}, maybeOptions = {}) {
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
  const plan = evaluateLgbtqCarePathway(getLgbtqState());
  setLgbtqState({ lastEvaluation: plan });

  const root = h('div', { class: 'lgbtq-care-view' });

  // Page Header
  const header = pageHeader(
    isEs ? 'Salud y Reducción de Daños LGBTQ+' : 'LGBTQ+ & Gender-Affirming Clinical Care Specialist',
    isEs
      ? 'Orientación afirmativa sobre compatibilidad de terapia hormonal (TRH) y MOUD, reducción de daños en chemsex / party & play, PrEP/PEP y derechos civiles en rehabilitación residencial.'
      : 'Gender-affirming clinical guidance on HRT and MOUD compatibility, chemsex / party & play harm reduction, biomedical PrEP/PEP, and residential treatment civil rights.'
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
        ? 'Todas las respuestas se procesan temporalmente en la memoria del navegador sin persistencia. No se registra información en el disco ni en servidores. Se borra al activar Salida Rápida.'
        : 'All selections are processed in temporary browser memory only without persistence. No answers are stored on disk or transmitted to servers. Cleared immediately upon Quick Exit.'
    )
  );
  root.append(privacyAlert);

  // Navigation Tabs
  const tabNav = h('div', { class: 'tab-bar', role: 'tablist', 'aria-label': isEs ? 'Secciones de salud LGBTQ+' : 'LGBTQ+ health sections' });
  const tabs = [
    { id: 'decision_aid', label: isEs ? 'Evaluador y Plan Afirmativo' : 'Decision Aid & Care Plan' },
    { id: 'standards', label: isEs ? 'Estándares WPATH y Derechos' : 'WPATH Standards & Rights' },
    { id: 'chemsex', label: isEs ? 'Reducción de Daños (Chemsex)' : 'Chemsex Protocols' },
    { id: 'hrt_moud', label: isEs ? 'Compatibilidad TRH y MOUD' : 'HRT & MOUD Matrix' },
  ];

  const currentTab = lgbtqState.activeTab;

  tabs.forEach((tab) => {
    const isSelected = tab.id === currentTab;
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `tab-btn-lg-${tab.id}`,
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-controls': `tab-panel-lg-${tab.id}`,
      class: isSelected ? 'tab active' : 'tab',
    }, tab.label);

    btn.addEventListener('click', () => {
      setLgbtqState({ activeTab: tab.id });
      lgbtqCareView(container, options);
    });

    tabNav.append(btn);
  });
  root.append(tabNav);

  // Tab Panel
  const tabPanel = h('div', {
    id: `tab-panel-lg-${currentTab}`,
    role: 'tabpanel',
    'aria-labelledby': `tab-btn-lg-${currentTab}`,
    class: 'tab-content-panel',
  });

  // --------------------------------------------------------------------------
  // TAB 1: Decision Aid
  // --------------------------------------------------------------------------
  if (currentTab === 'decision_aid') {
    const formCard = h('div', { class: 'card assessment-card' });
    formCard.append(h('h3', { class: 'card-title' }, isEs ? 'Parámetros Clínicos y de Identidad' : 'Clinical & Affirming Care Parameters'));

    const formGrid = h('div', { class: 'form-grid' });

    // 1. Gender Identity
    const gidGroup = h('div', { class: 'form-group' });
    gidGroup.append(h('label', { for: 'lg-gid-select' }, isEs ? 'Identidad de Género:' : 'Affirmed Gender Identity:'));
    const gidSelect = h('select', { id: 'lg-gid-select', class: 'input-select' });

    const gidOpts = [
      { id: 'transgender_woman', label: isEs ? 'Mujer transgénero' : 'Transgender woman' },
      { id: 'transgender_man', label: isEs ? 'Hombre transgénero' : 'Transgender man' },
      { id: 'non_binary', label: isEs ? 'No binario / Género no conforme' : 'Non-binary / Gender expansive' },
      { id: 'cisgender_gay_bi', label: isEs ? 'Cisgénero gay o bisexual' : 'Cisgender gay or bisexual' },
      { id: 'queer_other', label: isEs ? 'Queer / Otra identidad' : 'Queer / Other identity' },
    ];

    gidOpts.forEach((go) => {
      const opt = h('option', { value: go.id }, go.label);
      if (go.id === lgbtqState.genderIdentity) opt.selected = true;
      gidSelect.append(opt);
    });

    gidSelect.addEventListener('change', (e) => {
      setLgbtqState({ genderIdentity: e.target.value });
      lgbtqCareView(container, options);
    });
    gidGroup.append(gidSelect);
    formGrid.append(gidGroup);

    // 2. HRT Check
    const hrtGroup = h('div', { class: 'form-group' });
    hrtGroup.append(h('label', { for: 'lg-hrt-select' }, isEs ? '¿Toma Terapia Hormonal (TRH)?' : 'Current Hormone Therapy (HRT)?'));
    const hrtSelect = h('select', { id: 'lg-hrt-select', class: 'input-select' });

    const hrtOpts = [
      { val: true, label: isEs ? 'Sí (Estrógenos, T, bloqueadores, etc.)' : 'Yes (Estrogen, Testosterone, Blockers)' },
      { val: false, label: isEs ? 'No / No actualmente' : 'No / Not currently taking HRT' },
    ];

    hrtOpts.forEach((ho) => {
      const opt = h('option', { value: String(ho.val) }, ho.label);
      if (lgbtqState.takingHrt === ho.val) opt.selected = true;
      hrtSelect.append(opt);
    });

    hrtSelect.addEventListener('change', (e) => {
      setLgbtqState({ takingHrt: e.target.value === 'true' });
      lgbtqCareView(container, options);
    });
    hrtGroup.append(hrtSelect);
    formGrid.append(hrtGroup);

    // 3. Chemsex Substances
    const csGroup = h('div', { class: 'form-group' });
    csGroup.append(h('label', { for: 'lg-substance-select' }, isEs ? 'Sustancia Principal Utilizada:' : 'Primary Party / Chemsex Substance:'));
    const csSelect = h('select', { id: 'lg-substance-select', class: 'input-select' });

    const csOpts = [
      { id: 'methamphetamine', label: isEs ? 'Metanfetamina / Tina / T' : 'Crystal Methamphetamine (Tina/T)' },
      { id: 'ghb_gbl', label: isEs ? 'GHB / GBL (Líquido G)' : 'GHB / GBL (Liquid G/Gina)' },
      { id: 'poppers', label: isEs ? 'Nitritos de alquilo ("Poppers")' : 'Alkyl Nitrites ("Poppers")' },
      { id: 'ketamine', label: isEs ? 'Ketamina (Special K)' : 'Ketamine (Special K)' },
      { id: 'none', label: isEs ? 'Ninguna de estas' : 'None of these' },
    ];

    csOpts.forEach((co) => {
      const opt = h('option', { value: co.id }, co.label);
      if (lgbtqState.chemsexSubstances.includes(co.id)) opt.selected = true;
      csSelect.append(opt);
    });

    csSelect.addEventListener('change', (e) => {
      setLgbtqState({ chemsexSubstances: e.target.value === 'none' ? [] : [e.target.value] });
      lgbtqCareView(container, options);
    });
    csGroup.append(csSelect);
    formGrid.append(csGroup);

    // 4. PDE5 Inhibitor Check
    const pdeGroup = h('div', { class: 'form-group' });
    pdeGroup.append(h('label', { for: 'lg-pde-select' }, isEs ? '¿Toma Medicamentos para la Erección (Viagra/Cialis)?' : 'Taking Erectile Meds (Viagra/Cialis)?'));
    const pdeSelect = h('select', { id: 'lg-pde-select', class: 'input-select' });

    const pdeOpts = [
      { val: false, label: isEs ? 'No' : 'No' },
      { val: true, label: isEs ? 'Sí (Sildenafil / Tadalafil / etc.)' : 'Yes (Sildenafil, Tadalafil, etc.)' },
    ];

    pdeOpts.forEach((po) => {
      const opt = h('option', { value: String(po.val) }, po.label);
      if (lgbtqState.usingPde5Inhibitors === po.val) opt.selected = true;
      pdeSelect.append(opt);
    });

    pdeSelect.addEventListener('change', (e) => {
      setLgbtqState({ usingPde5Inhibitors: e.target.value === 'true' });
      lgbtqCareView(container, options);
    });
    pdeGroup.append(pdeSelect);
    formGrid.append(pdeGroup);

    // 5. Residential Facility Interest
    const resGroup = h('div', { class: 'form-group' });
    resGroup.append(h('label', { for: 'lg-res-select' }, isEs ? '¿Explorando Tratamiento Residencial?' : 'Considering Residential Treatment?'));
    const resSelect = h('select', { id: 'lg-res-select', class: 'input-select' });

    const resOpts = [
      { val: false, label: isEs ? 'No / Solo ambulatorio' : 'No / Outpatient only' },
      { val: true, label: isEs ? 'Sí (Revisar derechos de alojamiento trans)' : 'Yes (Check trans housing civil rights)' },
    ];

    resOpts.forEach((ro) => {
      const opt = h('option', { value: String(ro.val) }, ro.label);
      if (lgbtqState.seekingResidential === ro.val) opt.selected = true;
      resSelect.append(opt);
    });

    resSelect.addEventListener('change', (e) => {
      setLgbtqState({ seekingResidential: e.target.value === 'true' });
      lgbtqCareView(container, options);
    });
    resGroup.append(resSelect);
    formGrid.append(resGroup);

    formCard.append(formGrid);
    tabPanel.append(formCard);

    // Results Box
    const resultsCard = h('div', { class: 'card results-card' });

    // Critical Alerts
    if (plan.alerts.length > 0) {
      plan.alerts.forEach((al) => {
        const alBox = h('div', { class: `panel alert-panel alert-${al.priority}` });
        alBox.append(h('strong', {}, isEs ? al.title.es : al.title.en));
        alBox.append(h('p', {}, isEs ? al.text.es : al.text.en));
        resultsCard.append(alBox);
      });
    }

    // HRT Status Box
    if (plan.hrtAdvice) {
      const hrtBox = h('div', { class: 'hrt-status-box' });
      hrtBox.append(h('span', { class: 'badge badge-approved' }, isEs ? 'TRH 100% COMPATIBLE CON MOUD' : 'HRT 100% COMPATIBLE WITH MOUD'));
      hrtBox.append(h('p', {}, isEs ? plan.hrtAdvice.detail.es : plan.hrtAdvice.detail.en));
      resultsCard.append(hrtBox);
    }

    // Residential Rights Box
    if (plan.residentialAdvice) {
      const resBox = h('div', { class: 'residential-rights-box' });
      resBox.append(h('h4', {}, isEs ? plan.residentialAdvice.title.es : plan.residentialAdvice.title.en));
      resBox.append(h('p', {}, isEs ? plan.residentialAdvice.detail.es : plan.residentialAdvice.detail.en));
      resultsCard.append(resBox);
    }

    // Biomedical PrEP / PEP Box
    if (plan.biomedicalAdvice.length > 0) {
      const bioBox = h('div', { class: 'biomedical-box' });
      bioBox.append(h('h4', {}, isEs ? 'Prevención Biomédica Integrada:' : 'Biomedical HIV & STI Prevention:'));
      plan.biomedicalAdvice.forEach((bio) => {
        const item = h('div', { class: 'bio-item' });
        item.append(h('strong', {}, isEs ? bio.topic.es : bio.topic.en));
        item.append(h('p', {}, isEs ? bio.detail.es : bio.detail.en));
        bioBox.append(item);
      });
      resultsCard.append(bioBox);
    }

    // Action Buttons
    const btnRow = h('div', { class: 'btn-row' });
    const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' },
      icon('copy'),
      isEs ? ' Copiar Plan Afirmativo' : ' Copy Affirming Plan'
    );
    copyBtn.addEventListener('click', async () => {
      const text = formatLgbtqSummaryText(plan, lang);
      try {
        await navigator.clipboard.writeText(text);
        announce(isEs ? 'Plan copiado al portapapeles' : 'Plan copied to clipboard');
        copyBtn.textContent = isEs ? '✓ ¡Copiado!' : '✓ Copied!';
        setTimeout(() => {
          copyBtn.textContent = isEs ? ' Copiar Plan Afirmativo' : ' Copy Affirming Plan';
        }, 3000);
      } catch {
        announce(isEs ? 'Error al copiar' : 'Clipboard write failed');
      }
    });
    btnRow.append(copyBtn);

    const treatLink = h('a', {
      href: '#/treatment?codes=GL',
      class: 'btn btn-primary',
    }, icon('map-pin'), isEs ? ' Buscar Centros Afirmativos LGBTQ+' : ' Find LGBTQ+ Affirming Care');
    btnRow.append(treatLink);

    resultsCard.append(btnRow);
    tabPanel.append(resultsCard);
  }

  // --------------------------------------------------------------------------
  // TAB 2: Standards & Rights
  // --------------------------------------------------------------------------
  else if (currentTab === 'standards') {
    const stdCard = h('div', { class: 'card standards-card' });
    stdCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Estándares Clínicos WPATH y Derechos Civiles' : 'WPATH Standards & Healthcare Civil Rights'
    ));

    LGBTQ_CARE_STANDARDS.forEach((std) => {
      const sec = h('div', { class: 'standard-section' });
      sec.append(h('h4', {}, isEs ? std.title.es : std.title.en));
      sec.append(h('span', { class: 'legal-citation' }, std.authority));
      sec.append(h('p', {}, isEs ? std.summary.es : std.summary.en));
      sec.append(h('p', { class: 'action-advice' },
        h('strong', {}, isEs ? 'Recomendación Práctica: ' : 'Actionable Advice: '),
        isEs ? std.actionAdvice.es : std.actionAdvice.en
      ));
      stdCard.append(sec);
    });

    tabPanel.append(stdCard);
  }

  // --------------------------------------------------------------------------
  // TAB 3: Chemsex Harm Reduction
  // --------------------------------------------------------------------------
  else if (currentTab === 'chemsex') {
    const csCard = h('div', { class: 'card chemsex-card' });
    csCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Protocolos de Reducción de Daños en Chemsex / Party & Play' : 'Chemsex & Party/Play Harm Reduction Protocols'
    ));

    CHEMSEX_HARM_REDUCTION_PROTOCOLS.forEach((proto) => {
      const pSec = h('div', { class: 'protocol-section' });
      pSec.append(h('h4', {}, proto.name));
      pSec.append(h('p', { class: 'key-risks' },
        h('strong', {}, isEs ? 'Riesgos Principales: ' : 'Critical Risks: '),
        isEs ? proto.keyRisks.es : proto.keyRisks.en
      ));

      const rList = h('ul', { class: 'rules-list' });
      const rules = isEs ? proto.harmReductionRules.es : proto.harmReductionRules.en;
      rules.forEach((r) => rList.append(h('li', {}, r)));
      pSec.append(rList);

      csCard.append(pSec);
    });

    tabPanel.append(csCard);
  }

  // --------------------------------------------------------------------------
  // TAB 4: HRT & MOUD Compatibility Matrix
  // --------------------------------------------------------------------------
  else if (currentTab === 'hrt_moud') {
    const hrtCard = h('div', { class: 'card hrt-card' });
    hrtCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Matriz de Compatibilidad: Terapia Hormonal (TRH) y MOUD' : 'Hormone Therapy (HRT) & MOUD Compatibility Matrix'
    ));

    const hGrid = h('div', { class: 'hrt-grid' });

    HRT_MOUD_SAFETY_INTERACTIONS.forEach((item) => {
      const box = h('div', { class: 'hrt-interaction-card' });
      box.append(h('h4', {}, item.medication));
      box.append(h('span', { class: 'badge badge-approved' }, item.hrtCompatibility));
      box.append(h('p', {}, isEs ? item.interactionSummary.es : item.interactionSummary.en));
      hGrid.append(box);
    });

    hrtCard.append(hGrid);
    tabPanel.append(hrtCard);
  }

  root.append(tabPanel);

  // Footer Helplines
  const hotlineBar = h('div', { class: 'emergency-hotline-bar' },
    h('div', { class: 'hotline-item' },
      h('strong', {}, isEs ? 'The Trevor Project (LGBTQ+ 24/7):' : 'The Trevor Project:'),
      h('span', {}, ' '),
      tel('1-866-488-7386', { class: 'hotline-link' }),
      h('span', {}, ' | '),
      sms('678678', { class: 'hotline-link' }, isEs ? 'Texto START al 678678' : 'Text START to 678678')
    ),
    h('div', { class: 'hotline-item' },
      h('strong', {}, isEs ? 'Trans Lifeline (Pares trans 24/7):' : 'Trans Lifeline:'),
      h('span', {}, ' '),
      tel('1-877-565-8860', { class: 'hotline-link' })
    )
  );
  root.append(hotlineBar);

  if (container) container.append(root);
  return root;
}

