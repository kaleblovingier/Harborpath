/**
 * Recovery Capital Index & Strengths Assessment (public/js/components/recoveryCapital.js)
 *
 * Psychometrically validated assessment of internal and external recovery resources
 * based on the Brief Assessment of Recovery Capital (BARC-10; Groshkova, Best, & White, 2013)
 * and SAMHSA's Four Dimensions of Recovery (Health, Home, Purpose, Community):
 *
 * 1. BARC-10 Validated Framework:
 *    - 10 empirical domains scored from 1 (Strongly Disagree) to 6 (Strongly Agree).
 *    - Score range: 10 to 60.
 *    - Validated threshold of 47+ predicts sustained 1-year recovery stability.
 *
 * 2. SAMHSA's 4 Dimensions Mapping:
 *    - Health: Physical, mental, and MOUD stabilization.
 *    - Home: Safe, stable, non-judgmental living environment.
 *    - Purpose: Meaningful daily activities, vocational engagement, personal agency.
 *    - Community: Supportive social networks, peer recovery communities, mutual aid.
 *
 * 3. Strengths-Based Action Planning:
 *    - Identifies top capital strengths to leverage.
 *    - Formulates concrete next steps for lowest-scoring growth areas.
 *    - Bilingual English/Spanish support with high-contrast, accessible DOM construction.
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
// 1. BARC-10 Validated Items & SAMHSA Dimensions
// ============================================================================

export const SAMHSA_RECOVERY_DIMENSIONS = {
  health: {
    id: 'health',
    title: { en: 'Health', es: 'Salud' },
    description: {
      en: 'Overcoming or managing one’s disease(s) and symptoms, making informed, healthy choices that support physical and emotional well-being.',
      es: 'Superar o manejar las enfermedades y síntomas, tomando decisiones informadas que respalden el bienestar físico y emocional.',
    },
  },
  home: {
    id: 'home',
    title: { en: 'Home', es: 'Hogar' },
    description: {
      en: 'Having a stable, safe, and non-judgmental place to live.',
      es: 'Contar con un lugar estable, seguro y sin juicios para vivir.',
    },
  },
  purpose: {
    id: 'purpose',
    title: { en: 'Purpose', es: 'Propósito' },
    description: {
      en: 'Conducting meaningful daily activities (job, school, family care, creative pursuits) and having the independence and resources to participate in society.',
      es: 'Realizar actividades diarias significativas (empleo, estudios, cuidado familiar) y tener autonomía para participar en la sociedad.',
    },
  },
  community: {
    id: 'community',
    title: { en: 'Community', es: 'Comunidad' },
    description: {
      en: 'Having relationships and social networks that provide support, friendship, love, and hope.',
      es: 'Tener relaciones y redes sociales que brinden apoyo, amistad, afecto y esperanza.',
    },
  },
};

export const BARC10_ITEMS = [
  {
    id: 'values_clarity',
    dimension: 'purpose',
    prompt: {
      en: 'There are more important things to me in life than using substances.',
      es: 'Hay cosas más importantes para mí en la vida que el consumo de sustancias.',
    },
    strengthTip: {
      en: 'Your core values and priorities provide a strong anchor during moments of craving or stress.',
      es: 'Sus valores y prioridades fundamentales son un ancla sólida en momentos de antojo o estrés.',
    },
    growthAdvice: {
      en: 'Clarify what brings you genuine purpose (hobbies, loved ones, causes) through values-based counseling or SMART Recovery exercises.',
      es: 'Defina qué le brinda propósito auténtico (aficiones, seres queridos, causas) mediante ejercicios basados en valores.',
    },
  },
  {
    id: 'life_satisfaction',
    dimension: 'health',
    prompt: {
      en: 'In general, I am satisfied with the life I am leading.',
      es: 'En general, me siento satisfecho con la vida que llevo.',
    },
    strengthTip: {
      en: 'General life satisfaction provides emotional resilience against relapse triggers.',
      es: 'La satisfacción general con la vida proporciona resiliencia emocional ante detonantes.',
    },
    growthAdvice: {
      en: 'Explore small, daily routines that enhance your emotional well-being and consider discussing depression or mood symptoms with a doctor.',
      es: 'Explore pequeñas rutinas diarias de bienestar y considere evaluar síntomas del estado de ánimo con un médico.',
    },
  },
  {
    id: 'vitality_energy',
    dimension: 'health',
    prompt: {
      en: 'I have enough physical and mental energy to complete the tasks I need to do each day.',
      es: 'Tengo suficiente energía física y mental para completar las tareas necesarias cada día.',
    },
    strengthTip: {
      en: 'High physical and mental stamina supports steady adherence to recovery routines and work.',
      es: 'La vitalidad física y mental ayuda a sostener rutinas de recuperación y empleo.',
    },
    growthAdvice: {
      en: 'Review sleep hygiene, nutrition, chronic pain management, and consider consulting a primary care provider to evaluate fatigue.',
      es: 'Revise la higiene del sueño, nutrición y manejo de dolor crónico, y consulte con un médico para evaluar la fatiga.',
    },
  },
  {
    id: 'pride_achievement',
    dimension: 'purpose',
    prompt: {
      en: 'I am proud of the things I have achieved and overcame in my life.',
      es: 'Siento orgullo por las cosas que he logrado y superado en mi vida.',
    },
    strengthTip: {
      en: 'Recognizing your past resilience reinforces self-efficacy when facing current obstacles.',
      es: 'Reconocer su resiliencia pasada refuerza la autoeficacia para superar obstáculos actuales.',
    },
    growthAdvice: {
      en: 'Keep a daily journal of small recovery victories and practice self-compassion for past difficulties.',
      es: 'Lleve un registro de pequeñas victorias diarias de recuperación y practique la autocompasión.',
    },
  },
  {
    id: 'meaning_direction',
    dimension: 'purpose',
    prompt: {
      en: 'I regard my life as having clear meaning, purpose, and direction.',
      es: 'Considero que mi vida tiene un significado, propósito y rumbo claros.',
    },
    strengthTip: {
      en: 'A clear sense of life direction provides long-term motivation to protect your health.',
      es: 'Un rumbo de vida claro ofrece motivación a largo plazo para proteger su salud.',
    },
    growthAdvice: {
      en: 'Engage with career counseling, peer mentorship, or volunteer initiatives that align with your talents.',
      es: 'Conéctese con orientación vocacional, mentoría de pares o voluntariado acorde a sus aptitudes.',
    },
  },
  {
    id: 'safe_living_space',
    dimension: 'home',
    prompt: {
      en: 'My living environment is safe, stable, and free from violence or extreme chaos.',
      es: 'El lugar donde vivo es seguro, estable y libre de violencia o caos extremo.',
    },
    strengthTip: {
      en: 'A safe, peaceful home environment is one of the most critical structural foundations for long-term health.',
      es: 'Un entorno hogareño seguro y pacífico es uno de los pilares más cruciales para la salud a largo plazo.',
    },
    growthAdvice: {
      en: 'Explore recovery residences (such as Oxford Houses), tenant assistance, or domestic safety advocacy to stabilize your housing.',
      es: 'Explore residencias de recuperación (como Oxford House), asistencia de alquiler o apoyo de seguridad comunitaria.',
    },
  },
  {
    id: 'supportive_relationships',
    dimension: 'community',
    prompt: {
      en: 'I have friends, family, or mentors who genuinely support my recovery without pressuring me to use.',
      es: 'Tengo amigos, familiares o mentores que respaldan genuinamente mi recuperación sin presionarme a consumir.',
    },
    strengthTip: {
      en: 'Positive social capital significantly buffers against stress and provides immediate accountability.',
      es: 'El capital social positivo amortigua el estrés y ofrece acompañamiento constante.',
    },
    growthAdvice: {
      en: 'Join local or virtual mutual aid recovery groups (SMART Recovery, MARA, 12-Step, LifeRing) to cultivate substance-free friendships.',
      es: 'Participe en grupos de ayuda mutua (SMART Recovery, MARA, 12 Pasos, LifeRing) para cultivar amistades libres de consumo.',
    },
  },
  {
    id: 'coping_confidence',
    dimension: 'health',
    prompt: {
      en: 'I feel confident I can cope with difficult emotions or cravings without using substances.',
      es: 'Confío en mi capacidad para afrontar emociones difíciles o antojos sin consumir sustancias.',
    },
    strengthTip: {
      en: 'Strong refusal self-efficacy is directly correlated with long-term abstinence and harm reduction.',
      es: 'La sólida autoeficacia de afrontamiento se correlaciona con la reducción de daños y estabilidad.',
    },
    growthAdvice: {
      en: 'Work with a counselor on cognitive behavioral urge-surfing, dialectical behavior skills, or consider MOUD stabilization.',
      es: 'Trabaje en técnicas de afrontamiento cognitivo-conductual, habilidades emocionales o considere estabilización con MOUD.',
    },
  },
  {
    id: 'future_hope',
    dimension: 'purpose',
    prompt: {
      en: 'I feel optimistic and hopeful about my future life opportunities.',
      es: 'Me siento optimista y con esperanza respecto a mis oportunidades de vida futuras.',
    },
    strengthTip: {
      en: 'Hope is the catalyst for recovery, fostering proactive problem solving and personal growth.',
      es: 'La esperanza es el catalizador de la recuperación, promoviendo el crecimiento personal.',
    },
    growthAdvice: {
      en: 'Connect with peer recovery specialists who have lived experience and model thriving long-term recovery.',
      es: 'Conéctese con especialistas pares de recuperación con experiencia vivida que modelan vidas plenas.',
    },
  },
  {
    id: 'community_resources',
    dimension: 'community',
    prompt: {
      en: 'I am able to access community resources (healthcare, mental health, legal aid, social services) when I need them.',
      es: 'Tengo acceso a recursos comunitarios (atención médica, salud mental, asistencia legal, servicios sociales) cuando los necesito.',
    },
    strengthTip: {
      en: 'Knowledge and navigation of community safety nets protects against compounding crises.',
      es: 'Conocer y navegar las redes comunitarias de apoyo protege contra crisis acumulativas.',
    },
    growthAdvice: {
      en: 'Use the HarborPath Treatment and State Resource directories to connect with FQHCs, legal aid, and sliding-scale healthcare.',
      es: 'Utilice los directorios de Tratamiento y Recursos Estatales de HarborPath para conectar con clínicas FQHC y ayuda legal.',
    },
  },
];

export const RECOVERY_CAPITAL_TIERS = {
  high_capital: {
    minScore: 47,
    maxScore: 60,
    title: { en: 'High Recovery Capital (Validated Stability Tier)', es: 'Capital de Recuperación Alto (Nivel Validado de Estabilidad)' },
    summary: {
      en: 'A BARC-10 score of 47 or higher is the empirically validated threshold predicting sustained 1-year recovery stability (Groshkova et al., 2013). You have robust internal and external resources to navigate stress.',
      es: 'Una puntuación BARC-10 de 47 o más es el umbral validado que predice estabilidad de recuperación sostenida a 1 año (Groshkova et al., 2013). Cuenta con sólidos recursos internos y externos.',
    },
    focus: {
      en: 'Focus on sustaining healthy routines, mentoring peers in early recovery, and continuing long-term vocational or personal growth.',
      es: 'Enfóquese en sostener rutinas saludables, apoyar a personas que inician recuperación y avanzar en metas personales.',
    },
  },
  moderate_capital: {
    minScore: 35,
    maxScore: 46,
    title: { en: 'Moderate Recovery Capital (Emerging Foundations)', es: 'Capital de Recuperación Moderado (Bases en Construcción)' },
    summary: {
      en: 'You have established key strengths, but several vulnerable domains (such as housing stability, social connection, or emotional coping) require targeted fortification.',
      es: 'Ha establecido fortalezas valiosas, pero varias áreas vulnerables (como vivienda, conexiones sociales o afrontamiento emocional) requieren fortalecimiento.',
    },
    focus: {
      en: 'Focus on strengthening your lowest-scoring domains while leveraging your top personal strengths as daily anchors.',
      es: 'Concéntrese en fortalecer sus áreas de menor puntaje utilizando sus mayores fortalezas personales como anclas diarias.',
    },
  },
  growth_needed: {
    minScore: 10,
    maxScore: 34,
    title: { en: 'Early Stabilization & Foundation Building', es: 'Estabilización Inicial y Construcción de Bases' },
    summary: {
      en: 'You are in an acute stabilization phase where environmental stressors, lack of resources, or cravings may feel overwhelming. This is common in early recovery.',
      es: 'Se encuentra en una fase de estabilización inicial donde el estrés ambiental, la falta de recursos o los antojos pueden ser abrumadores. Esto es común al inicio.',
    },
    focus: {
      en: 'Prioritize basic physiological safety: connect with MOUD clinical care, ensure safe shelter, obtain naloxone, and seek compassionate peer support.',
      es: 'Priorice la seguridad física básica: vincúlese a atención clínica con MOUD, asegure un refugio protegido, obtenga naloxona y busque apoyo de pares.',
    },
  },
};

// ============================================================================
// 2. Scoring & Plan Generation Engine
// ============================================================================

export function calculateRecoveryCapitalScore(responses = {}) {
  let totalScore = 0;
  const itemScores = [];
  const dimensionTotals = {
    health: { total: 0, count: 0 },
    home: { total: 0, count: 0 },
    purpose: { total: 0, count: 0 },
    community: { total: 0, count: 0 },
  };

  BARC10_ITEMS.forEach((item) => {
    const rawVal = responses[item.id];
    const score = typeof rawVal === 'number' && rawVal >= 1 && rawVal <= 6 ? Math.round(rawVal) : 3; // default midpoint
    totalScore += score;
    itemScores.push({ item, score });

    const dim = item.dimension;
    if (dimensionTotals[dim]) {
      dimensionTotals[dim].total += score;
      dimensionTotals[dim].count += 1;
    }
  });

  // Calculate dimension averages (1 to 6)
  const dimensionScores = {};
  for (const [dimKey, val] of Object.entries(dimensionTotals)) {
    dimensionScores[dimKey] = val.count > 0 ? Number((val.total / val.count).toFixed(2)) : 0;
  }

  // Determine Tier
  let tierKey = 'moderate_capital';
  if (totalScore >= 47) {
    tierKey = 'high_capital';
  } else if (totalScore < 35) {
    tierKey = 'growth_needed';
  }
  const tier = RECOVERY_CAPITAL_TIERS[tierKey];

  // Identify top strengths (score >= 5) and growth areas (score <= 3)
  const strengths = itemScores.filter((x) => x.score >= 5).sort((a, b) => b.score - a.score);
  const growthAreas = itemScores.filter((x) => x.score <= 3).sort((a, b) => a.score - b.score);

  return {
    evaluatedAt: new Date().toISOString(),
    totalScore,
    maxPossibleScore: 60,
    tierKey,
    tier,
    dimensionScores,
    strengths,
    growthAreas,
    itemScores,
  };
}

export function generateRecoveryCapitalPlan(scoreResult, lang = 'en') {
  if (!scoreResult) return null;
  const isEs = lang === 'es';

  const actionSteps = [];

  // If health dimension is low (< 3.5), add health action
  if (scoreResult.dimensionScores.health < 3.5) {
    actionSteps.push({
      dimension: 'health',
      priority: 'high',
      title: {
        en: 'Strengthen Health Capital: Clinical Stabilization & Harm Reduction',
        es: 'Fortalecer Capital de Salud: Estabilización Clínica y Reducción de Daños',
      },
      detail: {
        en: 'Connect with a community healthcare provider or FQHC to discuss MOUD (Buprenorphine, Methadone, Naltrexone), obtain free take-home naloxone, and review sleep and emotional well-being.',
        es: 'Conéctese con un proveedor comunitario o FQHC para evaluar MOUD (buprenorfina, metadona, naltrexona), obtener naloxona gratuita y revisar el sueño y bienestar emocional.',
      },
      linkHref: '#/treatment',
    });
  }

  // If home dimension is low (< 3.5)
  if (scoreResult.dimensionScores.home < 3.5) {
    actionSteps.push({
      dimension: 'home',
      priority: 'immediate',
      title: {
        en: 'Strengthen Home Capital: Stable, Substance-Safe Living Environment',
        es: 'Fortalecer Capital del Hogar: Entorno de Vivienda Estable y Seguro',
      },
      detail: {
        en: 'Explore democratic recovery residences such as Oxford House, regional supportive housing, or local community reentry housing organizations.',
        es: 'Explore residencias de recuperación autogestionadas como Oxford House, vivienda de apoyo regional u organizaciones comunitarias de vivienda.',
      },
      linkHref: '#/states',
    });
  }

  // If community dimension is low (< 3.5)
  if (scoreResult.dimensionScores.community < 3.5) {
    actionSteps.push({
      dimension: 'community',
      priority: 'high',
      title: {
        en: 'Strengthen Community Capital: Connect with Mutual Aid & Peers',
        es: 'Fortalecer Capital Comunitario: Conectar con Ayuda Mutua y Pares',
      },
      detail: {
        en: 'Explore mutual aid groups aligned with your beliefs (SMART Recovery for cognitive tools, MARA for medication-assisted recovery, LifeRing, or 12-Step programs).',
        es: 'Explore grupos de ayuda mutua acordes a sus convicciones (SMART Recovery para herramientas cognitivas, MARA para medicación, LifeRing o 12 Pasos).',
      },
      linkHref: '#/guides',
    });
  }

  // If purpose dimension is low (< 3.5)
  if (scoreResult.dimensionScores.purpose < 3.5) {
    actionSteps.push({
      dimension: 'purpose',
      priority: 'moderate',
      title: {
        en: 'Strengthen Purpose Capital: Meaningful Daily Engagement',
        es: 'Fortalecer Capital de Propósito: Actividad Diaria Significativa',
      },
      detail: {
        en: 'Explore state vocational rehabilitation services, peer mentor training, volunteering, or structured creative and athletic activities.',
        es: 'Explore servicios de rehabilitación vocacional estatal, capacitación de mentores pares, voluntariado o actividades creativas y deportivas.',
      },
      linkHref: '#/plan',
    });
  }

  return {
    scoreResult,
    actionSteps,
  };
}

// ============================================================================
// 3. Ephemeral In-RAM State Management
// ============================================================================

let recoveryCapitalState = {
  responses: {
    values_clarity: 4,
    life_satisfaction: 3,
    vitality_energy: 3,
    pride_achievement: 4,
    meaning_direction: 3,
    safe_living_space: 4,
    supportive_relationships: 3,
    coping_confidence: 4,
    future_hope: 4,
    community_resources: 4,
  },
  activeTab: 'assessment', // 'assessment' | 'dimensions' | 'action_plan'
  lastScoreResult: null,
};

export function getRecoveryCapitalState() {
  return { ...recoveryCapitalState, responses: { ...recoveryCapitalState.responses } };
}

export function setRecoveryCapitalState(partial) {
  if (partial.responses) {
    recoveryCapitalState.responses = { ...recoveryCapitalState.responses, ...partial.responses };
    delete partial.responses;
  }
  recoveryCapitalState = { ...recoveryCapitalState, ...partial };
  return getRecoveryCapitalState();
}

export function resetRecoveryCapitalState() {
  recoveryCapitalState = {
    responses: {
      values_clarity: 4,
      life_satisfaction: 3,
      vitality_energy: 3,
      pride_achievement: 4,
      meaning_direction: 3,
      safe_living_space: 4,
      supportive_relationships: 3,
      coping_confidence: 4,
      future_hope: 4,
      community_resources: 4,
    },
    activeTab: 'assessment',
    lastScoreResult: null,
  };
  return getRecoveryCapitalState();
}

// ============================================================================
// 4. Clinical Text Formatter
// ============================================================================

export function formatRecoveryCapitalSummaryText(plan, lang = 'en') {
  if (!plan || !plan.scoreResult) return '';
  const isEs = lang === 'es';
  const sr = plan.scoreResult;
  const divider = '======================================================================';
  const subDivider = '----------------------------------------------------------------------';

  const lines = [
    divider,
    isEs
      ? 'ÍNDICE DE CAPITAL DE RECUPERACIÓN (BARC-10) - HARBORPATH'
      : 'RECOVERY CAPITAL INDEX & STRENGTHS ASSESSMENT (BARC-10) - HARBORPATH',
    isEs
      ? 'Asistencia epímera en memoria | Cero rastreo | Confidencial'
      : 'In-RAM Ephemeral Decision Support | Zero Tracking | Confidential',
    divider,
    '',
    `${isEs ? 'Puntuación Total' : 'Total BARC-10 Score'}: ${sr.totalScore} / ${sr.maxPossibleScore}`,
    `${isEs ? 'Nivel de Capital' : 'Recovery Capital Tier'}: ${isEs ? sr.tier.title.es : sr.tier.title.en}`,
    `${isEs ? 'Umbral Validado (47+)' : 'Validated Benchmark (47+)'}: ${sr.totalScore >= 47 ? (isEs ? 'SUPERADO (Alta Estabilidad)' : 'MET (High Stability Tier)') : (isEs ? 'EN DESARROLLO' : 'BUILDING FOUNDATIONS')}`,
    '',
    subDivider,
    isEs ? 'PUNTUACIONES POR DIMENSIÓN SAMHSA (Escala 1 a 6):' : 'SAMHSA RECOVERY DIMENSIONS (Scale 1 to 6):',
    subDivider,
    `* ${isEs ? 'Salud' : 'Health'}: ${sr.dimensionScores.health} / 6.0`,
    `* ${isEs ? 'Hogar' : 'Home'}: ${sr.dimensionScores.home} / 6.0`,
    `* ${isEs ? 'Propósito' : 'Purpose'}: ${sr.dimensionScores.purpose} / 6.0`,
    `* ${isEs ? 'Comunidad' : 'Community'}: ${sr.dimensionScores.community} / 6.0`,
    '',
  ];

  if (sr.strengths.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'FORTALEZAS IDENTIFICADAS (Recursos a potenciar):' : 'TOP RECOVERY ASSETS & STRENGTHS:');
    lines.push(subDivider);
    sr.strengths.forEach((st) => {
      lines.push(`* [${st.score}/6] ${isEs ? st.item.prompt.es : st.item.prompt.en}`);
      lines.push(`  ${isEs ? st.item.strengthTip.es : st.item.strengthTip.en}`);
    });
    lines.push('');
  }

  if (sr.growthAreas.length > 0) {
    lines.push(subDivider);
    lines.push(isEs ? 'ÁREAS DE CRECIMIENTO PRIORITARIO:' : 'PRIORITY GROWTH OPPORTUNITIES:');
    lines.push(subDivider);
    sr.growthAreas.forEach((ga) => {
      lines.push(`* [${ga.score}/6] ${isEs ? ga.item.prompt.es : ga.item.prompt.en}`);
      lines.push(`  ${isEs ? ga.item.growthAdvice.es : ga.item.growthAdvice.en}`);
    });
    lines.push('');
  }

  lines.push(subDivider);
  lines.push(isEs ? 'PASOS DE ACCIÓN RECOMENDADOS:' : 'RECOMMENDED ACTION STEPS:');
  lines.push(subDivider);
  plan.actionSteps.forEach((step) => {
    lines.push(`[${step.priority.toUpperCase()}] ${isEs ? step.title.es : step.title.en}`);
    lines.push(`  ${isEs ? step.detail.es : step.detail.en}`);
    lines.push('');
  });

  lines.push(divider);
  return lines.join('\n');
}

// ============================================================================
// 5. DOM View Component: recoveryCapitalComponent(containerOrOptions, maybeOptions)
// ============================================================================

export function recoveryCapitalComponent(containerOrOptions = {}, maybeOptions = {}) {
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

  const state = getRecoveryCapitalState();
  const scoreResult = calculateRecoveryCapitalScore(state.responses);
  const plan = generateRecoveryCapitalPlan(scoreResult, lang);
  setRecoveryCapitalState({ lastScoreResult: scoreResult });

  const root = h('div', { class: 'recovery-capital-container' });

  // Component Header
  const titleBox = h('div', { class: 'component-header' });
  titleBox.append(h('h3', { class: 'component-title' },
    icon('star', { class: 'title-icon' }),
    isEs ? ' Índice de Capital de Recuperación (BARC-10)' : ' Recovery Capital Index (BARC-10)'
  ));
  titleBox.append(p(
    isEs
      ? 'Evaluación psicométrica validada de sus recursos internos y comunitarios. Puntuaciones de 47 o más predicen estabilidad sostenida a largo plazo.'
      : 'Empirically validated psychometric assessment of internal and community recovery resources. Scores of 47+ predict sustained 1-year stability.'
  ));
  root.append(titleBox);

  // Tab Navigation
  const tabNav = h('div', { class: 'tab-bar', role: 'tablist', 'aria-label': isEs ? 'Pestañas de capital de recuperación' : 'Recovery capital tabs' });
  const tabs = [
    { id: 'assessment', label: isEs ? 'Cuestionario BARC-10' : 'BARC-10 Screener' },
    { id: 'dimensions', label: isEs ? '4 Dimensiones SAMHSA' : 'SAMHSA Dimensions' },
    { id: 'action_plan', label: isEs ? 'Plan de Fortalecimiento' : 'Strengths Action Plan' },
  ];

  tabs.forEach((tab) => {
    const isSelected = tab.id === state.activeTab;
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      id: `tab-btn-rc-${tab.id}`,
      'aria-selected': isSelected ? 'true' : 'false',
      'aria-controls': `tab-panel-rc-${tab.id}`,
      class: isSelected ? 'tab active' : 'tab',
    }, tab.label);

    btn.addEventListener('click', () => {
      setRecoveryCapitalState({ activeTab: tab.id });
      recoveryCapitalComponent(container, options);
    });

    tabNav.append(btn);
  });
  root.append(tabNav);

  // Tab Panel
  const tabPanel = h('div', {
    id: `tab-panel-rc-${state.activeTab}`,
    role: 'tabpanel',
    'aria-labelledby': `tab-btn-rc-${state.activeTab}`,
    class: 'tab-content-panel',
  });

  // --------------------------------------------------------------------------
  // TAB 1: Assessment Items
  // --------------------------------------------------------------------------
  if (state.activeTab === 'assessment') {
    const formCard = h('div', { class: 'card barc-card' });
    formCard.append(h('h4', {}, isEs ? 'Califique cada afirmación del 1 (En total desacuerdo) al 6 (Totalmente de acuerdo):' : 'Rate each statement from 1 (Strongly Disagree) to 6 (Strongly Agree):'));

    const itemsList = h('div', { class: 'barc-items-list' });

    BARC10_ITEMS.forEach((item, idx) => {
      const row = h('div', { class: 'barc-item-row' });
      const promptLabel = h('label', { for: `barc-select-${item.id}`, class: 'barc-prompt' },
        h('strong', {}, `${idx + 1}. `),
        isEs ? item.prompt.es : item.prompt.en,
        h('span', { class: 'dimension-pill' }, ` [${item.dimension.toUpperCase()}]`)
      );
      row.append(promptLabel);

      const select = h('select', { id: `barc-select-${item.id}`, class: 'input-select barc-select' });
      const scaleLabels = [
        { val: 1, label: isEs ? '1 - Total desacuerdo' : '1 - Strongly Disagree' },
        { val: 2, label: isEs ? '2 - En desacuerdo' : '2 - Disagree' },
        { val: 3, label: isEs ? '3 - Algo en desacuerdo' : '3 - Slightly Disagree' },
        { val: 4, label: isEs ? '4 - Algo de acuerdo' : '4 - Slightly Agree' },
        { val: 5, label: isEs ? '5 - De acuerdo' : '5 - Agree' },
        { val: 6, label: isEs ? '6 - Totalmente de acuerdo' : '6 - Strongly Agree' },
      ];

      scaleLabels.forEach((sc) => {
        const opt = h('option', { value: String(sc.val) }, sc.label);
        if (state.responses[item.id] === sc.val) opt.selected = true;
        select.append(opt);
      });

      select.addEventListener('change', (e) => {
        const val = Number(e.target.value) || 3;
        setRecoveryCapitalState({ responses: { [item.id]: val } });
        recoveryCapitalComponent(container, options);
      });

      row.append(select);
      itemsList.append(row);
    });

    formCard.append(itemsList);
    tabPanel.append(formCard);

    // Score Preview Box
    const scoreCard = h('div', { class: `card score-card tier-${scoreResult.tierKey}` });
    const sHeader = h('div', { class: 'score-header' });
    sHeader.append(h('span', { class: 'score-number' }, `${scoreResult.totalScore} / 60`));
    sHeader.append(h('span', { class: `badge badge-${scoreResult.tierKey === 'high_capital' ? 'approved' : 'neutral'}` },
      isEs ? scoreResult.tier.title.es : scoreResult.tier.title.en
    ));
    scoreCard.append(sHeader);
    scoreCard.append(h('p', { class: 'tier-summary' }, isEs ? scoreResult.tier.summary.es : scoreResult.tier.summary.en));
    tabPanel.append(scoreCard);
  }

  // --------------------------------------------------------------------------
  // TAB 2: SAMHSA Dimensions Breakdown
  // --------------------------------------------------------------------------
  else if (state.activeTab === 'dimensions') {
    const dimCard = h('div', { class: 'card dimensions-card' });
    dimCard.append(h('h4', {}, isEs ? 'Las Cuatro Dimensiones de la Recuperación de SAMHSA' : 'SAMHSA Four Dimensions of Recovery'));

    const dimGrid = h('div', { class: 'dimensions-grid' });

    Object.entries(SAMHSA_RECOVERY_DIMENSIONS).forEach(([dimKey, dimInfo]) => {
      const avg = scoreResult.dimensionScores[dimKey] || 0;
      const box = h('div', { class: 'dimension-box' });
      box.append(h('h5', {}, isEs ? dimInfo.title.es : dimInfo.title.en));
      box.append(h('span', { class: 'dimension-score' }, `${avg} / 6.0`));
      box.append(h('p', { class: 'dimension-desc' }, isEs ? dimInfo.description.es : dimInfo.description.en));
      dimGrid.append(box);
    });

    dimCard.append(dimGrid);
    tabPanel.append(dimCard);
  }

  // --------------------------------------------------------------------------
  // TAB 3: Action Plan & Strengths
  // --------------------------------------------------------------------------
  else if (state.activeTab === 'action_plan') {
    const planCard = h('div', { class: 'card plan-card' });

    // Strengths
    if (scoreResult.strengths.length > 0) {
      const stBox = h('div', { class: 'strengths-box' });
      stBox.append(h('h4', { class: 'text-success' }, isEs ? 'Sus Mayores Fortalezas de Recuperación:' : 'Your Top Recovery Assets:'));
      scoreResult.strengths.forEach((st) => {
        const itemCard = h('div', { class: 'asset-item' });
        itemCard.append(h('strong', {}, isEs ? st.item.prompt.es : st.item.prompt.en));
        itemCard.append(h('p', {}, isEs ? st.item.strengthTip.es : st.item.strengthTip.en));
        stBox.append(itemCard);
      });
      planCard.append(stBox);
    }

    // Recommended Steps
    const actBox = h('div', { class: 'action-steps-container' });
    actBox.append(h('h4', {}, isEs ? 'Pasos Recomendados para Fortalecer su Capital:' : 'Recommended Action Steps to Build Capital:'));

    plan.actionSteps.forEach((step) => {
      const stepRow = h('div', { class: `step-row priority-${step.priority}` });
      stepRow.append(h('strong', {}, isEs ? step.title.es : step.title.en));
      stepRow.append(h('p', {}, isEs ? step.detail.es : step.detail.en));
      if (step.linkHref) {
        stepRow.append(h('a', { href: step.linkHref, class: 'btn btn-sm btn-outline' },
          isEs ? 'Ver Recursos Relacionados' : 'View Related Resources'
        ));
      }
      actBox.append(stepRow);
    });
    planCard.append(actBox);

    // Copy Button
    const copyBtn = h('button', { type: 'button', class: 'btn btn-secondary' },
      icon('copy'),
      isEs ? ' Copiar Evaluación de Capital' : ' Copy Recovery Capital Report'
    );
    copyBtn.addEventListener('click', async () => {
      const text = formatRecoveryCapitalSummaryText(plan, lang);
      try {
        await navigator.clipboard.writeText(text);
        announce(isEs ? 'Informe copiado al portapapeles' : 'Report copied to clipboard');
        copyBtn.textContent = isEs ? '✓ ¡Copiado!' : '✓ Copied!';
        setTimeout(() => {
          copyBtn.textContent = isEs ? ' Copiar Evaluación de Capital' : ' Copy Recovery Capital Report';
        }, 3000);
      } catch {
        announce(isEs ? 'Error al copiar' : 'Clipboard write failed');
      }
    });
    planCard.append(copyBtn);

    tabPanel.append(planCard);
  }

  root.append(tabPanel);

  if (container) container.append(root);
  return root;
}
