/**
 * Wound Care & Infectious Disease Harm Reduction Specialist View (public/js/views/woundInfectious.js)
 *
 * Comprehensive, trauma-informed clinical and harm reduction guidance for
 * individuals managing soft tissue wounds, xylazine-associated ulcers, and infectious risks:
 *
 * 1. Evidence-Based Moist Wound Healing Protocols:
 *    - Gentle saline/water cleansing and moist wound bed maintenance (petroleum jelly / hydrogel).
 *    - Non-adherent dressings (Telfa) and flexible gauze retention without harsh tape on fragile skin.
 *    - Explicit avoidance of cytotoxic agents (hydrogen peroxide, rubbing alcohol, bleach/Dakin's solution)
 *      which destroy healthy granulation fibroblasts and capillary buds.
 *
 * 2. Life-Threatening Soft Tissue & Systemic Infection Escalations:
 *    - Necrotizing Fasciitis: Pain out of proportion to exam, rapid spread, subcutaneous crepitus,
 *      violaceous hemorrhagic bullae, and cutaneous numbness -> Immediate 911 / surgical emergency.
 *    - Systemic Sepsis (SIRS): Fever/hypothermia, tachycardia >90, tachypnea >20, acute confusion.
 *    - Infective Endocarditis (Modified Duke Criteria): Persistent fever, night sweats, splinter
 *      hemorrhages, Osler nodes, Janeway lesions, and new heart murmurs in PWID.
 *
 * 3. Viral Hepatitis (HCV/HBV) & Direct-Acting Antiviral (DAA) Access:
 *    - AASLD / IDSA Clinical Guidelines: Active substance use is NEVER an exclusion criterion for
 *      Hepatitis C treatment. Direct-acting antivirals achieve >95% cure rates in active PWID.
 *
 * 4. Safer Injection & Vein Preservation Protocols:
 *    - Single-use sterile equipment, bevel-up needle entry, tourniquet release prior to plunging,
 *      and prevention of cotton fever (Pantoea agglomerans endotoxin) from reused filters.
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
// 1. Evidence-Based Wound Care Protocols & Cytotoxic Warnings
// ============================================================================

export const WOUND_CARE_PROTOCOLS = [
  {
    stepId: 'cleanse',
    title: { en: '1. Gentle Cleansing with Clean Water or Saline', es: '1. Limpieza Suave con Agua Limpia o Solución Salina' },
    summary: {
      en: 'Irrigate the wound gently with potable tap water or sterile 0.9% normal saline. Pat the surrounding skin dry with clean gauze. Do not scrub or debride aggressive tissue with rough washcloths.',
      es: 'Irrigue la herida suavemente con agua limpia del grifo o solución salina estéril al 0.9%. Seque la piel circundante con gasa limpia. No frote agresivamente el tejido con toallas ásperas.',
    },
  },
  {
    stepId: 'moist_environment',
    title: { en: '2. Maintain a Moist Healing Environment (Petroleum Jelly or Hydrogel)', es: '2. Mantener un Entorno Húmedo (Vaselina o Hidrogel)' },
    summary: {
      en: 'Apply a generous layer of medical-grade petroleum jelly (Vaseline) or amorphous hydrogel directly to the wound bed. A moist environment accelerates cellular re-epithelialization by up to 50% compared to dry air exposure and prevents cracking and painful dressing adherence.',
      es: 'Aplique una capa generosa de vaselina médica o hidrogel directamente sobre la herida. El ambiente húmedo acelera la cicatrización hasta un 50% en comparación con dejar secar al aire y evita grietas dolorosas.',
    },
  },
  {
    stepId: 'non_adherent_cover',
    title: { en: '3. Non-Adherent Dressing & Protective Wrap', es: '3. Vendaje No Adherente y Envoltura Protectora' },
    summary: {
      en: 'Cover with a sterile non-adherent pad (such as Telfa) so the dressing will not stick to newly forming tissue. Secure in place with rolled gauze or self-adherent wrap (Coban). Avoid applying harsh adhesive tape directly to thin, compromised skin.',
      es: 'Cubra con una almohadilla estéril no adherente (como Telfa) para que no se pegue al tejido nuevo. Fíjela con gasa en rollo o venda autoadherente (Coban). Evite colocar cinta adhesiva sobre piel frágil.',
    },
  },
  {
    stepId: 'avoid_cytotoxics',
    title: { en: '4. NEVER Use Hydrogen Peroxide, Alcohol, or Bleach', es: '4. NUNCA Use Agua Oxigenada, Alcohol o Cloro' },
    summary: {
      en: 'CRITICAL CLINICAL DIRECTIVE: Avoid hydrogen peroxide, rubbing alcohol, concentrated bleach (Dakin’s solution), or harsh iodine. These antiseptics are cytotoxic: they destroy newly forming fibroblasts, kill healthy white blood cells, and damage delicate microvascular capillary beds, severely delaying wound closure and multiplying infection risk.',
      es: 'DIRECTIVA CLÍNICA CRÍTICA: Evite el agua oxigenada, alcohol isopropílico, cloro o yodo fuerte. Son sustancias citotóxicas: destruyen los fibroblastos nuevos, matan glóbulos blancos sanos y dañan los capilares, retrasando la cicatrización y aumentando infecciones.',
    },
  },
];

// ============================================================================
// 2. Severe Infection Escalation Framework & Red Flags
// ============================================================================

export const INFECTION_RED_FLAGS = [
  {
    conditionId: 'necrotizing_fasciitis',
    severity: 'emergency_911',
    name: { en: 'Necrotizing Fasciitis ("Flesh-Eating" Deep Tissue Infection)', es: 'Fascitis Necrosante (Infección Profunda de Tejidos Blandos)' },
    hallmarkSigns: {
      en: [
        'Severe, excruciating pain completely out of proportion to what the wound looks like',
        'Rapidly spreading redness, swelling, and heat advancing by inches over hours',
        'Subcutaneous crepitus: a crackling, popping, or bubble-wrap feeling under the skin caused by bacterial gas production',
        'Skin color changes to purple, bronze, or dark blue with fluid-filled bullae/blisters',
        'Sudden numbness or anesthesia over the center of the wound as cutaneous nerves die',
      ],
      es: [
        'Dolor insoportable y severo desproporcionado con respecto al aspecto externo de la herida',
        'Enrojecimiento, calor e inflamación que se expanden con rapidez en pocas horas',
        'Crepitación subcutánea: sensación de burbujeo o crujido bajo la piel por gas bacteriano',
        'Cambio de color de piel a morado, bronce o azul oscuro con ampollas oscuras',
        'Pérdida de sensibilidad o entumecimiento en el centro al dañarse los nervios cutáneos',
      ],
    },
    actionAdvice: {
      en: 'CALL 911 IMMEDIATELY. This is a life-and-limb-threatening surgical emergency requiring urgent intravenous antibiotics and surgical debridement within hours in an operating room.',
      es: 'LLAME AL 911 DE INMEDIATO. Es una emergencia quirúrgica potencialmente mortal que exige antibióticos intravenosos urgentes y desbridamiento en quirófano.',
    },
  },
  {
    conditionId: 'systemic_sepsis',
    severity: 'emergency_911',
    name: { en: 'Systemic Sepsis / Bloodstream Infection', es: 'Sepsis Sistémica / Infección en el Torrente Sanguíneo' },
    hallmarkSigns: {
      en: [
        'Fever above 100.4°F (38°C) OR hypothermia below 96.8°F (36°C) with uncontrollable shaking rigors',
        'Rapid heart rate greater than 90 beats per minute',
        'Rapid, shallow breathing greater than 20 breaths per minute',
        'Acute confusion, extreme weakness, slurred speech, or profound dizziness upon standing',
      ],
      es: [
        'Fiebre superior a 38 °C (100.4 °F) O hipotermia menor a 36 °C (96.8 °F) con temblores y escalofríos intensos',
        'Frecuencia cardíaca acelerada mayor a 90 latidos por minuto',
        'Respiración rápida y superficial mayor a 20 respiraciones por minuto',
        'Confusión aguda, debilidad extrema, dificultad para hablar o mareo severo al ponerse de pie',
      ],
    },
    actionAdvice: {
      en: 'CALL 911 OR GO TO THE NEAREST EMERGENCY DEPARTMENT. Under federal EMTALA (42 U.S.C. § 1395dd), all hospital emergency departments must evaluate and stabilize severe infections regardless of insurance, identity, or substance use.',
      es: 'LLAME AL 911 O ACUDA A URGENCIAS. Bajo la ley federal EMTALA (42 U.S.C. § 1395dd), todo hospital de urgencias debe evaluar y estabilizar infecciones graves sin importar seguro ni consumo.',
    },
  },
  {
    conditionId: 'infective_endocarditis',
    severity: 'urgent_medical',
    name: { en: 'Infective Endocarditis (Heart Valve Infection in PWID)', es: 'Endocarditis Infecciosa (Infección de Válvulas Cardíacas)' },
    hallmarkSigns: {
      en: [
        'Persistent, unexplained daily fevers and heavy night sweats over several days or weeks',
        'New or worsening heart murmur heard on examination, coupled with severe fatigue',
        'Janeway lesions: painless red spots on palms of hands or soles of feet',
        'Osler nodes: painful, tender raised red nodules on the pads of fingers or toes',
        'Splinter hemorrhages: thin, dark red vertical lines looking like splinters under the fingernails',
        'New shortness of breath, chest discomfort, or sudden back/flank pain (septic pulmonary or renal emboli)',
      ],
      es: [
        'Fiebres inexplicables diarias y sudores nocturnos intensos durante varios días o semanas',
        'Soplo cardíaco nuevo o que empeora, junto con fatiga profunda',
        'Lesiones de Janeway: manchas rojas no dolorosas en palmas de manos o plantas de pies',
        'Nódulos de Osler: protuberancias rojas y dolorosas en las yemas de dedos de manos o pies',
        'Hemorragias en astilla: líneas verticales oscuras parecidas a astillas bajo las uñas',
        'Falta de aire repentina, molestia torácica o dolor lumbar/flancos por émbolos sépticos',
      ],
    },
    actionAdvice: {
      en: 'Seek urgent hospital medical evaluation for blood cultures and echocardiogram. Intravenous antibiotics are curative if initiated before heart valve destruction occurs.',
      es: 'Busque valoración médica hospitalaria urgente para hemocultivos y ecocardiograma. Los antibióticos intravenosos curan la infección si se inician a tiempo.',
    },
  },
];

// ============================================================================
// 3. Viral Hepatitis (HCV/HBV) & Direct-Acting Antiviral Standards
// ============================================================================

export const HEPATITIS_DAA_STANDARDS = {
  universalAccess: {
    en: 'National clinical consensus from the American Association for the Study of Liver Diseases (AASLD) and Infectious Diseases Society of America (IDSA): Active substance use, past injection history, or engagement in MOUD is NEVER an acceptable medical reason to deny, delay, or withhold Direct-Acting Antiviral (DAA) treatment for Hepatitis C.',
    es: 'Consenso de la Asociación Americana para el Estudio de Enfermedades Hepáticas (AASLD) y la IDSA: El consumo activo, antecedentes de inyección o tratamiento con MOUD NUNCA son motivos válidos para negar o demorar el tratamiento antiviral (DAA) para Hepatitis C.',
  },
  cureRate: {
    en: 'Modern DAAs (such as glecaprevir/pibrentasvir or sofosbuvir/velpatasvir) consist of once-daily oral pills for 8 to 12 weeks with cure rates exceeding 95%, minimal side effects, and demonstrated high adherence rates among active people who inject drugs.',
    es: 'Los antivirales modernos (glecaprevir/pibrentasvir o sofosbuvir/velpatasvir) consisten en pastillas orales una vez al día durante 8 a 12 semanas con tasas de curación superiores al 95% y efectos secundarios mínimos.',
  },
  reinfections: {
    en: 'If reinfection occurs through ongoing exposure, individuals are fully eligible for repeat DAA retreatment. Treatment acts as "treatment as prevention" (TasP), reducing viral load in the community needle supply.',
    es: 'En caso de reinfección por exposición continua, la persona es totalmente elegible para un retratamiento con DAA. El tratamiento actúa como prevención comunitaria (TasP).',
  },
};

// ============================================================================
// 4. Safer Injection & Vein Care Protocols
// ============================================================================

export const VEIN_CARE_PRINCIPLES = [
  {
    topic: { en: 'Always Rotate Injection Sites', es: 'Rote Siempre los Puntos de Inyección' },
    detail: {
      en: 'Injecting into the exact same vein puncture site causes chronic scarring, sclerosis, and track mark ulcerations. Rotate veins and allow sites at least 48-72 hours to heal.',
      es: 'Inyectar en el mismo punto genera fibrosis, esclerosis y úlceras. Rote de vena y permita al menos 48 a 72 horas de recuperación.',
    },
  },
  {
    topic: { en: 'Bevel Up at 15 to 45 Degree Angle', es: 'Bisel hacia Arriba en Ángulo de 15 a 45 Grados' },
    detail: {
      en: 'Position the needle with the angled opening (bevel) facing upwards. Insert gently in the direction of blood flow towards the heart. Register a dark red blood flashback to confirm intravenous placement.',
      es: 'Coloque la aguja con la abertura biselada hacia arriba. Inserte en dirección del flujo hacia el corazón. Verifique el retorno venoso rojo oscuro para confirmar que está en vena.',
    },
  },
  {
    topic: { en: 'Release Tourniquet BEFORE Depressing Plunger', es: 'Suelte el Torniquete ANTES de Empujar el Émbolo' },
    detail: {
      en: 'Injecting while the tourniquet is still tight creates high venous back-pressure, blowing out delicate vein walls and causing painful subcutaneous extravasation ("missed shots") that form abscesses.',
      es: 'Inyectar con el torniquete apretado genera contrapresión venosa, rompiendo la pared de la vena y causando fugas subcutáneas que forman abscesos.',
    },
  },
  {
    topic: { en: 'Single-Use Cotton Filters (Prevent Cotton Fever)', es: 'Filtros de Algodón de Un Solo Uso (Evitar Fiebre de Algodón)' },
    detail: {
      en: 'Never reuse old, dried cotton filters ("rinses" / "saves"). Reused moist cottons harbor Pantoea agglomerans bacteria whose endotoxins cause acute "cotton fever" (violent shaking chills, vomiting, high fever within 15-30 minutes of injection).',
      es: 'Nunca reutilice filtros de algodón secos o guardados. Los filtros usados albergan bacterias Pantoea agglomerans cuyas endotoxinas causan fiebre de algodón (escalofríos violentos y fiebre a los 15-30 minutos).',
    },
  },
];

// ============================================================================
// 5. In-RAM Risk Evaluator Engine: evaluateWoundInfectiousRisk(inputs)
// ============================================================================

export function evaluateWoundInfectiousRisk(inputs = {}) {
  const {
    woundPresent = true,
    woundAppearance = 'necrotic_slough',       // 'clean_granulating' | 'necrotic_slough' | 'surrounding_cellulitis' | 'crepitus_severe_pain_bullae'
    systemicSymptoms = [],                     // ['fever_chills', 'tachycardia', 'confusion_delirium', 'night_sweats', 'chest_pain_shortness_breath']
    injectionPractices = [],                   // ['reusing_syringes', 'reusing_cottons', 'sharing_cookers', 'skin_popping_subcutaneous']
    hepatitisCStatus = 'unknown',              // 'unknown' | 'positive_untreated' | 'cured' | 'negative'
  } = inputs;

  let emergencyStatus = 'routine_harm_reduction';
  const emergencyReasons = [];

  // 1. Check for Necrotizing Fasciitis
  if (woundAppearance === 'crepitus_severe_pain_bullae') {
    emergencyStatus = 'emergency_911';
    emergencyReasons.push({
      condition: 'necrotizing_fasciitis',
      title: { en: 'Suspected Necrotizing Soft Tissue Infection (Call 911)', es: 'Sospecha de Infección Necrosante de Tejidos Blandos (Llame al 911)' },
      detail: {
        en: 'Crepitus (crackling air in tissue), severe pain out of proportion, or dark violaceous bullae are hallmark signs of necrotizing fasciitis. This is a critical surgical emergency.',
        es: 'La crepitación (gas bajo la piel), dolor extremo desproporcionado o ampollas violáceas son signos de fascitis necrosante. Es una emergencia quirúrgica crítica.',
      },
    });
  }

  // 2. Check for Systemic Sepsis
  const hasFever = systemicSymptoms.includes('fever_chills');
  const hasConfusion = systemicSymptoms.includes('confusion_delirium');
  const hasTachycardia = systemicSymptoms.includes('tachycardia');

  if ((hasFever && hasConfusion) || (hasFever && hasTachycardia)) {
    emergencyStatus = 'emergency_911';
    emergencyReasons.push({
      condition: 'systemic_sepsis',
      title: { en: 'Suspected Systemic Sepsis / Bloodstream Infection (Call 911)', es: 'Sospecha de Sepsis Sistémica / Infección Sanguínea (Llame al 911)' },
      detail: {
        en: 'Fever with rapid heart rate or acute confusion indicates infection spreading through the bloodstream (sepsis). Requires immediate emergency hospital stabilization under EMTALA.',
        es: 'Fiebre con pulso acelerado o confusión indica infección propagada al torrente sanguíneo (sepsis). Requiere estabilización hospitalaria urgente bajo EMTALA.',
      },
    });
  }

  // 3. Check for Endocarditis Clues
  const hasNightSweats = systemicSymptoms.includes('night_sweats');
  const hasChestPainDyspnea = systemicSymptoms.includes('chest_pain_shortness_breath');

  let endocarditisAlert = null;
  if ((hasFever && hasNightSweats) || (hasFever && hasChestPainDyspnea)) {
    if (emergencyStatus !== 'emergency_911') emergencyStatus = 'urgent_medical';
    endocarditisAlert = {
      title: { en: 'Infective Endocarditis Screening Indicated', es: 'Se Requiere Evaluación de Endocarditis Infecciosa' },
      detail: {
        en: 'Persistent fevers paired with night sweats or shortness of breath in persons with injection history strongly warrants hospital blood cultures and an echocardiogram to check heart valves.',
        es: 'Fiebres persistentes con sudores nocturnos o falta de aire en personas con uso inyectable exigen hemocultivos hospitalarios y ecocardiograma valvular.',
      },
    };
  } else if (woundAppearance === 'surrounding_cellulitis' && emergencyStatus !== 'emergency_911') {
    emergencyStatus = 'urgent_medical';
  }

  // 4. Wound Dressing Plan
  const dressingPlan = [...WOUND_CARE_PROTOCOLS];

  // 5. Hepatitis C Guidance
  let hcvAdvice = null;
  if (hepatitisCStatus === 'positive_untreated' || hepatitisCStatus === 'unknown') {
    hcvAdvice = {
      title: { en: 'Universal Hepatitis C Curative Treatment Access', es: 'Acceso Universal a Tratamiento Curativo de Hepatitis C' },
      detail: {
        en: 'Under AASLD/IDSA guidelines, you are fully eligible for modern all-oral DAA pills (8-12 weeks, >95% cure rate). Substance use is NOT a valid barrier to care. Ask your FQHC or clinic for viral load testing.',
        es: 'Bajo guías AASLD/IDSA, califica para pastillas DAA orales (8-12 semanas, >95% de curación). El consumo de sustancias NO es un impedimento. Solicite carga viral en su clínica FQHC.',
      },
    };
  }

  // 6. Discussion Questions for Medical Team
  const discussionItems = [
    {
      topic: { en: 'Non-Cytotoxic Wound Protocol', es: 'Protocolo de Curación No Citotóxico' },
      question: {
        en: 'Can we establish a moist wound healing plan using petroleum jelly/hydrogel and non-adherent dressings, avoiding hydrogen peroxide or harsh tape?',
        es: '¿Podemos establecer un plan de cicatrización húmeda con vaselina/hidrogel y apósitos no adherentes, evitando agua oxigenada y cinta adhesiva agresiva?',
      },
    },
    {
      topic: { en: 'Blood Cultures & Antibiotics', es: 'Hemocultivos y Antibióticos' },
      question: {
        en: 'Given my fever or soft tissue infection, should we draw blood cultures before initiating targeted oral or intravenous antibiotics?',
        es: 'Dado el cuadro febril o la herida, ¿deberíamos tomar hemocultivos antes de iniciar antibióticos dirigidos orales o intravenosos?',
      },
    },
    {
      topic: { en: 'Hepatitis C Viral Load & DAAs', es: 'Carga Viral de Hepatitis C y DAA' },
      question: {
        en: 'Can we order an HCV RNA viral load and prescribe an 8-to-12 week course of direct-acting antivirals regardless of my current drug use?',
        es: '¿Podemos solicitar una prueba de ARN viral para Hepatitis C y prescribir antivirales DAA de 8 a 12 semanas independientemente de mi consumo actual?',
      },
    },
  ];

  return {
    evaluatedAt: new Date().toISOString(),
    inputs,
    emergencyStatus,
    emergencyReasons,
    endocarditisAlert,
    dressingPlan,
    hcvAdvice,
    discussionItems,
    veinCare: VEIN_CARE_PRINCIPLES,
    infectionFramework: INFECTION_RED_FLAGS,
  };
}

// ============================================================================
// 6. Ephemeral In-RAM State Management
// ============================================================================

let woundState = {
  woundPresent: true,
  woundAppearance: 'necrotic_slough',
  systemicSymptoms: ['fever_chills'],
  injectionPractices: ['reusing_cottons'],
  hepatitisCStatus: 'positive_untreated',
  activeTab: 'decision_aid', // 'decision_aid' | 'wound_protocols' | 'red_flags' | 'vein_care'
  lastEvaluation: null,
};

export function getWoundState() {
  return {
    ...woundState,
    systemicSymptoms: [...woundState.systemicSymptoms],
    injectionPractices: [...woundState.injectionPractices],
  };
}

export function setWoundState(partial) {
  woundState = { ...woundState, ...partial };
  return getWoundState();
}

export function resetWoundState() {
  woundState = {
    woundPresent: true,
    woundAppearance: 'necrotic_slough',
    systemicSymptoms: ['fever_chills'],
    injectionPractices: ['reusing_cottons'],
    hepatitisCStatus: 'positive_untreated',
    activeTab: 'decision_aid',
    lastEvaluation: null,
  };
  return getWoundState();
}

// ============================================================================
// 7. Summary Text Formatter (Bilingual Copy/Print)
// ============================================================================

export function formatWoundSummaryText(plan, lang = 'en') {
  if (!plan) return '';
  const isEs = lang === 'es';
  const divider = '======================================================================';
  const subDivider = '----------------------------------------------------------------------';

  const lines = [
    divider,
    isEs
      ? 'PLAN DE CUIDADO DE HERIDAS E INFECCIONES - HARBORPATH'
      : 'WOUND CARE & INFECTIOUS DISEASE CLINICAL PLAN - HARBORPATH',
    isEs
      ? 'Asistencia epímera en memoria | Cero rastreo | Confidencial'
      : 'In-RAM Ephemeral Decision Support | Zero Tracking | Confidential',
    divider,
    '',
    `${isEs ? 'Nivel de urgencia' : 'Urgency Tier'}: ${plan.emergencyStatus.toUpperCase()}`,
    `${isEs ? 'Aspecto de la herida' : 'Wound Appearance'}: ${plan.inputs.woundAppearance}`,
    `${isEs ? 'Síntomas sistémicos' : 'Systemic Symptoms'}: ${plan.inputs.systemicSymptoms.join(', ') || (isEs ? 'Ninguno' : 'None')}`,
    '',
  ];

  if (plan.emergencyReasons.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'ALERTAS CRÍTICAS DE EMERGENCIA (LLAME AL 911):' : 'CRITICAL EMERGENCY RED FLAGS (CALL 911):');
    lines.push(subDivider);
    plan.emergencyReasons.forEach((em) => {
      lines.push(`[EMERGENCY 911] ${isEs ? em.title.es : em.title.en}`);
      lines.push(`  ${isEs ? em.detail.es : em.detail.en}`);
      lines.push('');
    });
  }

  if (plan.endocarditisAlert) {
    lines.push(subDivider);
    lines.push(isEs ? 'ALERTA DE ENDOCARDITIS INFECCIOSA:' : 'INFECTIVE ENDOCARDITIS EVALUATION ALERT:');
    lines.push(subDivider);
    lines.push(`* ${isEs ? plan.endocarditisAlert.title.es : plan.endocarditisAlert.title.en}`);
    lines.push(`  ${isEs ? plan.endocarditisAlert.detail.es : plan.endocarditisAlert.detail.en}`);
    lines.push('');
  }

  lines.push(subDivider);
  lines.push(isEs ? 'PROTOCOLO DE CICATRIZACIÓN HÚMEDA RECOMENDADO:' : 'RECOMMENDED MOIST WOUND CARE PROTOCOL:');
  lines.push(subDivider);
  plan.dressingPlan.forEach((st) => {
    lines.push(`* ${isEs ? st.title.es : st.title.en}`);
    lines.push(`  ${isEs ? st.summary.es : st.summary.en}`);
  });
  lines.push('');

  if (plan.hcvAdvice) {
    lines.push(subDivider);
    lines.push(isEs ? 'ORIENTACIÓN SOBRE HEPATITIS C (TRATAMIENTO DAA):' : 'HEPATITIS C DAA CURATIVE TREATMENT:');
    lines.push(subDivider);
    lines.push(`* ${isEs ? plan.hcvAdvice.title.es : plan.hcvAdvice.title.en}`);
    lines.push(`  ${isEs ? plan.hcvAdvice.detail.es : plan.hcvAdvice.detail.en}`);
    lines.push('');
  }

  lines.push(subDivider);
  lines.push(isEs ? 'PREGUNTAS SUGERIDAS PARA SU CLÍNICA O MÉDICO:' : 'PROVIDER DISCUSSION CHECKLIST:');
  lines.push(subDivider);
  plan.discussionItems.forEach((it) => {
    lines.push(`- [ ] (${isEs ? it.topic.es : it.topic.en}) ${isEs ? it.question.es : it.question.en}`);
  });

  lines.push('');
  lines.push(divider);

  return lines.join('\n');
}

// ============================================================================
// 8. Accessible DOM View: woundInfectiousView(containerOrOptions, maybeOptions)
// ============================================================================

export function woundInfectiousView(containerOrOptions = {}, maybeOptions = {}) {
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
  const plan = evaluateWoundInfectiousRisk(getWoundState());
  setWoundState({ lastEvaluation: plan });

  const root = h('div', { class: 'wound-infectious-view' });

  // Page Header
  const header = pageHeader(
    isEs ? 'Cuidado de Heridas y Enfermedades Infecciosas' : 'Wound Care & Infectious Disease Harm Reduction Specialist',
    isEs
      ? 'Protocolos de cicatrización húmeda para úlceras por xilazina, detección urgente de fascitis necrosante y endocarditis, acceso universal a antivirales DAA para Hepatitis C y cuidado de venas.'
      : 'Moist wound healing protocols for xylazine-associated necrosis, emergency screening for necrotizing fasciitis and endocarditis, universal DAA access for Hepatitis C, and safer vein care.'
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
        ? 'Todas las opciones se evalúan temporalmente en la memoria del navegador sin persistencia. No se guarda información en el disco ni en servidores externos. Se restablece al activar Salida Rápida.'
        : 'All selections are processed in temporary browser memory only without persistence. No answers are stored on disk or transmitted to external servers. Cleared immediately upon Quick Exit.'
    )
  );
  root.append(privacyAlert);

  // Navigation Tabs
  const tabNav = h('div', { class: 'tab-bar', role: 'tablist', 'aria-label': isEs ? 'Secciones de cuidado de heridas' : 'Wound care sections' });
  const tabs = [
    { id: 'decision_aid', label: isEs ? 'Evaluador y Plan de Curación' : 'Decision Aid & Care Plan' },
    { id: 'wound_protocols', label: isEs ? 'Protocolos de Curación Húmeda' : 'Moist Wound Protocols' },
    { id: 'red_flags', label: isEs ? 'Signos de Alarma (Fascitis/Sepsis)' : 'Emergency Red Flags' },
    { id: 'vein_care', label: isEs ? 'Cuidado de Venas e Inyección' : 'Safer Vein Care' },
  ];

  const currentTab = woundState.activeTab;

  tabs.forEach((tab) => {
    const isSelected = tab.id === currentTab;
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `tab-btn-wi-${tab.id}`,
      'data-tab': tab.id,
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-controls': `tab-panel-wi-${tab.id}`,
      class: isSelected ? 'tab active' : 'tab',
    }, tab.label);

    btn.addEventListener('click', () => {
      setWoundState({ activeTab: tab.id });
      woundInfectiousView(container, options);
    });

    tabNav.append(btn);
  });
  root.append(tabNav);

  // Tab Panel
  const tabPanel = h('div', {
    id: `tab-panel-wi-${currentTab}`,
    role: 'tabpanel',
    'aria-labelledby': `tab-btn-wi-${currentTab}`,
    class: 'tab-content-panel',
  });

  // --------------------------------------------------------------------------
  // TAB 1: Decision Aid
  // --------------------------------------------------------------------------
  if (currentTab === 'decision_aid') {
    const formCard = h('div', { class: 'card assessment-card' });
    formCard.append(h('h3', { class: 'card-title' }, isEs ? 'Evaluación de Síntomas y Estado de la Herida' : 'Wound Appearance & Infection Screener'));

    const formGrid = h('div', { class: 'form-grid' });

    // 1. Wound Appearance
    const appGroup = h('div', { class: 'form-group' });
    appGroup.append(h('label', { for: 'wi-app-select' }, isEs ? 'Aspecto de la Herida o Lesión:' : 'Wound Appearance / Characteristics:'));
    const appSelect = h('select', { id: 'wi-app-select', class: 'input-select' });

    const appOpts = [
      { id: 'necrotic_slough', label: isEs ? 'Úlcera con tejido oscuro/amarillento (típica de xilazina)' : 'Necrotic / yellow slough ulcer (common with xylazine)' },
      { id: 'surrounding_cellulitis', label: isEs ? 'Enrojecimiento circundante, calor y pus (celulitis)' : 'Spreading redness, heat, and pus (cellulitis)' },
      { id: 'crepitus_severe_pain_bullae', label: isEs ? 'Dolor insoportable, crujido bajo piel o ampollas oscuras' : 'Severe pain, crackling crepitus, or dark blisters' },
      { id: 'clean_granulating', label: isEs ? 'Tejido rosado limpio cicatrizando' : 'Clean, pink granulating wound' },
    ];

    appOpts.forEach((ao) => {
      const opt = h('option', { value: ao.id }, ao.label);
      if (ao.id === woundState.woundAppearance) opt.selected = true;
      appSelect.append(opt);
    });

    appSelect.addEventListener('change', (e) => {
      setWoundState({ woundAppearance: e.target.value });
      woundInfectiousView(container, options);
    });
    appGroup.append(appSelect);
    formGrid.append(appGroup);

    // 2. Systemic Symptoms
    const symGroup = h('div', { class: 'form-group' });
    symGroup.append(h('label', { for: 'wi-sym-select' }, isEs ? 'Síntomas Sistémicos Clave:' : 'Key Systemic Symptoms:'));
    const symSelect = h('select', { id: 'wi-sym-select', class: 'input-select' });

    const symOpts = [
      { id: 'fever_chills', label: isEs ? 'Fiebre y escalofríos intensos' : 'Fever & intense shaking chills' },
      { id: 'tachycardia', label: isEs ? 'Pulso cardíaco muy acelerado (>90 lpm)' : 'Rapid heart rate (>90 bpm)' },
      { id: 'confusion_delirium', label: isEs ? 'Confusión aguda o mareo severo' : 'Acute confusion or profound dizziness' },
      { id: 'night_sweats', label: isEs ? 'Sudores nocturnos persistentes' : 'Persistent drenching night sweats' },
      { id: 'none', label: isEs ? 'Ningún síntoma sistémico' : 'No systemic symptoms' },
    ];

    symOpts.forEach((so) => {
      const opt = h('option', { value: so.id }, so.label);
      if (woundState.systemicSymptoms.includes(so.id)) opt.selected = true;
      symSelect.append(opt);
    });

    symSelect.addEventListener('change', (e) => {
      setWoundState({ systemicSymptoms: e.target.value === 'none' ? [] : [e.target.value] });
      woundInfectiousView(container, options);
    });
    symGroup.append(symSelect);
    formGrid.append(symGroup);

    // 3. Hepatitis C Status
    const hcvGroup = h('div', { class: 'form-group' });
    hcvGroup.append(h('label', { for: 'wi-hcv-select' }, isEs ? 'Estado con Respecto a Hepatitis C:' : 'Hepatitis C Status:'));
    const hcvSelect = h('select', { id: 'wi-hcv-select', class: 'input-select' });

    const hcvOpts = [
      { id: 'positive_untreated', label: isEs ? 'Positivo / Nunca tratado (Califica para DAA)' : 'Positive / Untreated (Eligible for DAA cure)' },
      { id: 'unknown', label: isEs ? 'Desconocido / Requiere prueba' : 'Unknown / Needs antibody & RNA test' },
      { id: 'cured', label: isEs ? 'Curado previamente con DAA' : 'Previously cured with DAAs' },
      { id: 'negative', label: isEs ? 'Negativo confirmado' : 'Confirmed negative' },
    ];

    hcvOpts.forEach((ho) => {
      const opt = h('option', { value: ho.id }, ho.label);
      if (ho.id === woundState.hepatitisCStatus) opt.selected = true;
      hcvSelect.append(opt);
    });

    hcvSelect.addEventListener('change', (e) => {
      setWoundState({ hepatitisCStatus: e.target.value });
      woundInfectiousView(container, options);
    });
    hcvGroup.append(hcvSelect);
    formGrid.append(hcvGroup);

    formCard.append(formGrid);
    tabPanel.append(formCard);

    // Results Box
    const resultsCard = h('div', { class: 'card results-card' });

    // Urgency Banner
    const isEmerg = plan.emergencyStatus === 'emergency_911';
    const isUrg = plan.emergencyStatus === 'urgent_medical';
    const statusBox = h('div', { class: `panel alert-panel alert-${isEmerg ? 'critical' : isUrg ? 'warning' : 'info'}` });
    const badgeText = isEmerg
      ? (isEs ? 'EMERGENCIA 911: EVALUACIÓN HOSPITALARIA INMEDIATA' : '911 EMERGENCY: IMMEDIATE SURGICAL/HOSPITAL EVALUATION')
      : isUrg
      ? (isEs ? 'ATENCIÓN MÉDICA URGENTE REQUERIDA (URGENCIAS O FQHC)' : 'URGENT MEDICAL ATTENTION REQUIRED (ED OR CLINIC)')
      : (isEs ? 'CUIDADO AMBULATORIO Y PROTOCOLOS DE REDUCCIÓN DE DAÑOS' : 'OUTPATIENT MOIST WOUND HEALING & HARM REDUCTION');

    statusBox.append(h('strong', {}, badgeText));

    if (plan.emergencyReasons.length > 0) {
      plan.emergencyReasons.forEach((em) => {
        statusBox.append(h('p', {}, isEs ? em.detail.es : em.detail.en));
      });
    }
    resultsCard.append(statusBox);

    // Endocarditis Alert if any
    if (plan.endocarditisAlert) {
      const endoBox = h('div', { class: 'endocarditis-alert-box' });
      endoBox.append(h('h4', { class: 'text-warning' }, isEs ? plan.endocarditisAlert.title.es : plan.endocarditisAlert.title.en));
      endoBox.append(h('p', {}, isEs ? plan.endocarditisAlert.detail.es : plan.endocarditisAlert.detail.en));
      resultsCard.append(endoBox);
    }

    // Moist Wound Care Dressing Plan
    const dressBox = h('div', { class: 'dressing-protocol-box' });
    dressBox.append(h('h4', {}, isEs ? 'Protocolo Recomendado de Cicatrización Húmeda:' : 'Recommended Moist Wound Healing Protocol:'));

    plan.dressingPlan.forEach((st) => {
      const pItem = h('div', { class: 'protocol-item' });
      pItem.append(h('strong', {}, isEs ? st.title.es : st.title.en));
      pItem.append(h('p', {}, isEs ? st.summary.es : st.summary.en));
      dressBox.append(pItem);
    });
    resultsCard.append(dressBox);

    // Action Buttons
    const btnRow = h('div', { class: 'btn-row' });
    const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' },
      icon('copy'),
      isEs ? ' Copiar Plan de Cuidado de Heridas' : ' Copy Wound Care Plan'
    );
    copyBtn.addEventListener('click', async () => {
      const text = formatWoundSummaryText(plan, lang);
      try {
        await navigator.clipboard.writeText(text);
        announce(isEs ? 'Plan copiado al portapapeles' : 'Plan copied to clipboard');
        copyBtn.textContent = isEs ? '✓ ¡Copiado!' : '✓ Copied!';
        setTimeout(() => {
          copyBtn.textContent = isEs ? ' Copiar Plan de Cuidado de Heridas' : ' Copy Wound Care Plan';
        }, 3000);
      } catch {
        announce(isEs ? 'Error al copiar' : 'Clipboard write failed');
      }
    });
    btnRow.append(copyBtn);

    const treatLink = h('a', {
      href: '#/health',
      class: 'btn btn-primary',
    }, icon('map-pin'), isEs ? ' Buscar Centros de Salud FQHC' : ' Find Community Health Centers');
    btnRow.append(treatLink);
    const hepLink = h('a', {
      href: '#/viral-hepatitis',
      class: 'btn btn-secondary',
    }, icon('shield'), isEs ? ' Guía de Curación VHC y PrEP/PEP' : ' Hepatitis C Cure & PrEP/PEP Guide');
    btnRow.append(hepLink);

    resultsCard.append(btnRow);
    tabPanel.append(resultsCard);
  }

  // --------------------------------------------------------------------------
  // TAB 2: Moist Wound Protocols
  // --------------------------------------------------------------------------
  else if (currentTab === 'wound_protocols') {
    const wpCard = h('div', { class: 'card wound-protocols-card' });
    wpCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Principios Clínicos de la Cicatrización Húmeda' : 'Clinical Principles of Moist Wound Healing'
    ));

    WOUND_CARE_PROTOCOLS.forEach((proto) => {
      const pSec = h('div', { class: 'protocol-step-section' });
      pSec.append(h('h4', {}, isEs ? proto.title.es : proto.title.en));
      pSec.append(h('p', {}, isEs ? proto.summary.es : proto.summary.en));
      wpCard.append(pSec);
    });

    tabPanel.append(wpCard);
  }

  // --------------------------------------------------------------------------
  // TAB 3: Emergency Red Flags
  // --------------------------------------------------------------------------
  else if (currentTab === 'red_flags') {
    const rfCard = h('div', { class: 'card red-flags-card' });
    rfCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Signos Críticos de Alarma: Fascitis Necrosante, Sepsis y Endocarditis' : 'Critical Infection Red Flags: Necrotizing Fasciitis, Sepsis & Endocarditis'
    ));

    INFECTION_RED_FLAGS.forEach((rf) => {
      const sec = h('div', { class: `red-flag-detail-section severity-${rf.severity}` });
      sec.append(h('h4', {}, isEs ? rf.name.es : rf.name.en));

      const sList = h('ul', { class: 'signs-list' });
      const signs = isEs ? rf.hallmarkSigns.es : rf.hallmarkSigns.en;
      signs.forEach((s) => sList.append(h('li', {}, s)));
      sec.append(sList);

      sec.append(h('p', { class: 'action-advice-box' },
        h('strong', {}, isEs ? 'Acción Clínica Requerida: ' : 'Required Action: '),
        isEs ? rf.actionAdvice.es : rf.actionAdvice.en
      ));

      rfCard.append(sec);
    });

    tabPanel.append(rfCard);
  }

  // --------------------------------------------------------------------------
  // TAB 4: Vein Care & Safer Injection
  // --------------------------------------------------------------------------
  else if (currentTab === 'vein_care') {
    const vcCard = h('div', { class: 'card vein-care-card' });
    vcCard.append(h('h3', { class: 'card-title' },
      isEs ? 'Cuidado de Venas y Prevención de Complicaciones' : 'Safer Vein Care & Complication Prevention'
    ));

    VEIN_CARE_PRINCIPLES.forEach((vc) => {
      const sec = h('div', { class: 'vein-principle-section' });
      sec.append(h('h4', {}, isEs ? vc.topic.es : vc.topic.en));
      sec.append(h('p', {}, isEs ? vc.detail.es : vc.detail.en));
      vcCard.append(sec);
    });

    const fullVeinNavCard = h('div', { class: 'callout callout-info mt-2' }, [
      h('h4', {}, isEs ? 'Navegador Integral de Salud Vascular y Anatomía de Inyección' : 'Dedicated Vascular Health & Injection Anatomy Navigator'),
      h('p', {}, isEs
        ? 'Para triaje de punción arterial de emergencia, protocolo de trombosis venosa profunda (TVP), pseudoaneurismas, síndrome compartimental y zonas de riesgo anatómico (brazos vs cuello/ingle): '
        : 'For emergency arterial puncture management, deep vein thrombosis (DVT), pseudoaneurysms, compartment syndrome, and anatomical risk zones (arms vs neck/groin): '),
      h('a', { href: '#/vein-care' }, isEs
        ? 'Abrir Navegador Completo de Cuidado de Venas y Salud Vascular →'
        : 'Open Complete Vein Care, Vascular Health & Injection Anatomy Navigator →')
    ]);
    vcCard.append(fullVeinNavCard);

    tabPanel.append(vcCard);
  }

  root.append(tabPanel);

  // Footer Helplines
  const hotlineBar = h('div', { class: 'emergency-hotline-bar' },
    h('div', { class: 'hotline-item' },
      h('strong', {}, isEs ? 'Emergencias Quirúrgicas / Sepsis:' : 'Emergency Surgical / Sepsis:'),
      h('span', {}, ' '),
      tel('911', { class: 'hotline-link text-danger' })
    ),
    h('div', { class: 'hotline-item' },
      h('strong', {}, isEs ? 'Línea Poison Help (24/7):' : 'Poison Help Line (24/7):'),
      h('span', {}, ' '),
      tel('1-800-222-1222', { class: 'hotline-link' })
    )
  );
  const hospCard = h('div', { class: 'card mt-3 no-print' },
    h('h4', {}, isEs ? '¿Hospitalización por Endocarditis, Sepsis o Abscesos Complejos?' : 'Hospital Admission for Endocarditis, Sepsis or Complex Wounds?'),
    h('p', {}, isEs
      ? 'Conozca sus derechos en el hospital (EMTALA), el manejo del dolor y abstinencia en MOUD, y el paquete de reducción de daños con antibióticos orales si debe marcharse de alta voluntaria (AMA): '
      : 'Review your legal rights in the hospital (EMTALA), acute surgical pain on MOUD, and harm reduction bundles with oral step-down antibiotics if leaving against medical advice (AMA): '),
    h('a', { href: '#/hospital-care' }, isEs
      ? 'Abrir Guía de Atención Hospitalaria de Adicciones y Derechos del Paciente →'
      : 'Open Hospital Addiction Care, Pain on MOUD & Patient Rights Navigator →')
  );
  root.append(hospCard);
  const needleCard = h('div', { class: 'info-callout', role: 'note', style: undefined },
    h('strong', {}, isEs ? '¿Pinchazo accidental de aguja o lesión por objeto cortopunzante? ' : 'Accidental needle stick or sharps injury? '),
    h('span', {}, isEs
      ? 'Consulte el protocolo de Profilaxis Post-Exposición (PEP) dentro de las 72 horas, algoritmo de Hepatitis B y derechos laborales OSHA: '
      : 'Consult the 72-hour Post-Exposure Prophylaxis (PEP) protocol, Hepatitis B algorithm, and OSHA worker rights: '),
    h('a', { href: '#/needle-exposure' }, isEs
      ? 'Abrir Protocolo de Pinchazos de Aguja y PEP →'
      : 'Open Needle Stick & PEP Protocol Navigator →')
  );
  root.append(needleCard);
  root.append(hotlineBar);

  if (container) container.append(root);
  return root;
}
