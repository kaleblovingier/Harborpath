// public/js/views/stimulantCare.js
// HarborPath Stimulant Care, Overamping Differential & Harm Reduction Specialist
// Pure ES module, 0 dependencies. 100% ephemeral in-RAM clinical guidance.
// References:
// - SAMHSA Treatment of Stimulant Use Disorders (HHS Publication PEP20-06-01-001)
// - National Harm Reduction Coalition: Overamping Prevention & Management Framework
// - ASAM / AAAP Clinical Practice Guideline on the Management of Stimulant Use Disorders (2023)
// - CDC Stimulant Harm Reduction & Safe Inhalation Protocols

import { h, append, icon } from '../dom.js';
import { t } from '../i18n.js';

/**
 * Clinical and harm reduction standards for stimulant use disorders and overamping.
 */
export const STIMULANT_CARE_STANDARDS = {
  OVERAMPING_TYPES: {
    titleEn: 'Physical vs. Psychological Overamping',
    titleEs: 'Sobredosis por Estimulantes: Física vs. Psicológica',
    summaryEn: 'Overamping on stimulants (methamphetamine, cocaine) occurs along two distinct pathways: physical/physiological emergencies requiring urgent cooling and medical stabilization, and psychological distress requiring sensory reduction and supportive de-escalation.',
    summaryEs: 'La sobredosis por estimulantes (metanfetamina, cocaína) se manifiesta por dos vías distintas: emergencias físicas/fisiológicas que requieren enfriamiento y estabilización médica urgente, y angustia psicológica que requiere reducción sensorial y desescalada comprensiva.',
    physicalSignsEn: [
      'Core body hyperthermia (> 103°F / 39.5°C, hot dry or profusely sweating skin)',
      'Severe crushing chest pain, racing or irregular heartbeat (arrhythmia)',
      'Seizures, rigid muscle spasms, or tea-colored/dark urine (rhabdomyolysis)',
      'Difficulty speaking, facial drooping, or sudden one-sided weakness (stroke)'
    ],
    physicalSignsEs: [
      'Hipertermia corporal central (> 103°F / 39.5°C, piel muy caliente o sudoración profusa)',
      'Dolor torácico opresivo severo, palpitaciones rápidas o irregulares (arritmias)',
      'Convulsiones, espasmos musculares rígidos u orina oscura color té (rabdomiólisis)',
      'Dificultad para hablar, caída facial o debilidad repentina en un lado (accidente cerebrovascular)'
    ],
    psychologicalSignsEn: [
      'Extreme paranoia and suspicion of surroundings or peers',
      'Auditory or visual hallucinations (shadow people, persistent hearing voices)',
      'Severe panic, hyperventilation, and fear of imminent death',
      'Acute insomnia psychosis (compounded by 48+ consecutive hours awake)'
    ],
    psychologicalSignsEs: [
      'Paranoia extrema y desconfianza del entorno o compañeros',
      'Alucinaciones auditivas o visuales (sombras, voces persistentes)',
      'Pánico severo, hiperventilación y miedo a morir de inmediato',
      'Psicosis aguda por falta de sueño (agravada por 48+ horas consecutivas despierto)'
    ]
  },
  DE_ESCALATION_COOLING: {
    titleEn: 'Cooling & De-Escalation Protocols (Avoid Physical Restraints)',
    titleEs: 'Protocolos de Enfriamiento y Desescalada (Evitar Sujeciones Físicas)',
    summaryEn: 'Critical clinical imperative: Never physically restrain an agitated individual experiencing stimulant overamping. Physical struggle drastically elevates core body temperature, causes massive creatine kinase spikes, triggers catastrophic rhabdomyolysis and renal failure, and precipitates sudden cardiac arrest.',
    summaryEs: 'Imperativo clínico crítico: Nunca sujete físicamente a una persona agitada por sobredosis de estimulantes. El forcejeo físico eleva drásticamente la temperatura corporal, provoca picos masivos de creatina quinasa, desencadena rabdomiólisis catastrófica e insuficiencia renal, y precipita un paro cardíaco repentino.',
    directivesEn: [
      'Move to a quiet, dimly lit, cool environment with fresh air or fans.',
      'Apply cold, wet towels or ice packs wrapped in cloth to the neck, axillae (armpits), and groin.',
      'Offer small, steady sips of cool water or electrolyte fluids; avoid caffeinated or hot beverages.',
      'Maintain a calm, soothing tone, respect personal space, and validate feelings without arguing with delusions.'
    ],
    directivesEs: [
      'Trasladar a un entorno tranquilo, con poca luz, fresco y con ventilación o ventiladores.',
      'Aplicar toallas frías o compresas de hielo envueltas en tela en el cuello, axilas e ingles.',
      'Ofrecer sorbos pequeños y constantes de agua fresca o bebidas con electrolitos; evitar cafeína o bebidas calientes.',
      'Mantener un tono de voz calmado y respetuoso, mantener distancia física y validar emociones sin discutir con los delirios.'
    ]
  },
  BEHAVIORAL_INTERVENTIONS: {
    titleEn: 'Evidence-Based Interventions: Contingency Management (CMI)',
    titleEs: 'Intervenciones Basadas en Evidencia: Manejo de Contingencias (CMI)',
    summaryEn: 'Unlike opioid use disorder where FDA-approved medications (buprenorphine, methadone) exist, stimulant use disorder has no FDA-approved pharmacotherapy. Contingency Management (CMI) is the single most effective, psychometrically proven behavioral intervention, yielding the highest retention and abstinence rates.',
    summaryEs: 'A diferencia del trastorno por uso de opioides donde existen medicamentos aprobados por la FDA (buprenorfina, metadona), el uso de estimulantes no cuenta con farmacoterapia aprobada. El Manejo de Contingencias (CMI) es la intervención conductual más eficaz y con mayor respaldo empírico, produciendo las tasas más altas de retención y abstinencia.',
    principlesEn: [
      'Provides immediate, tangible positive rewards (vouchers or gift cards) for verified drug-free urine screens.',
      'Matrix Model: Structured, 16-week outpatient behavioral protocol integrating relapse prevention and family education.',
      'Community Reinforcement Approach (CRA): Identifies and builds non-substance rewarding activities, social relationships, and vocational engagement.'
    ],
    principlesEs: [
      'Brinda recompensas positivas tangibles e inmediatas (vales o tarjetas de regalo) por pruebas de orina libres de drogas.',
      'Modelo Matrix: Protocolo conductual ambulatorio estructurado de 16 semanas que integra prevención de recaídas y educación familiar.',
      'Enfoque de Refuerzo Comunitario (CRA): Identifica y fomenta actividades gratificantes sin sustancias, relaciones sociales y empleo.'
    ]
  },
  SAFER_INHALATION_EQUIPMENT: {
    titleEn: 'Safer Inhalation & FTS 10:1 Dilution Rules',
    titleEs: 'Inhalación Más Segura y Regla de Dilución 10:1 para Tiras FTS',
    summaryEn: 'Safer inhalation prevents severe burns, cuts, and bloodborne virus transmission (Hepatitis C and HIV). Special testing dilution ratios are mandatory for stimulants to prevent false-positive fentanyl test strip results.',
    summaryEs: 'La inhalación más segura previene quemaduras graves, cortes y la transmisión de virus sanguíneos (Hepatitis C y VIH). Las tiras reactivas de fentanilo requieren proporciones de dilución especiales para estimulantes con el fin de evitar falsos positivos.',
    rulesEn: [
      'Use Pyrex or borosilicate heat-resistant glass stems; avoid thin novelty glass that easily shatters and cuts lips.',
      'Always attach a heat-resistant silicone or rubber mouthpiece to prevent transmission of bloodborne pathogens through cracked lips.',
      'Use brass screens; never use copper scouring pads (Chore Boy), which release toxic cuprous oxide fumes upon heating.',
      'Fentanyl Test Strip 10:1 Dilution: Stimulants (meth/coke) require 1 full teaspoon (5 mL) of water per 10 mg of powder, or 1/2 measuring cup (120 mL) of water per 100 mg (1 point) to prevent false positives caused by pure stimulant bases.'
    ],
    rulesEs: [
      'Usar tubos de vidrio resistente al calor Pyrex o borosilicato; evitar vidrio delgado de novedad que se rompe y corta los labios.',
      'Colocar siempre una boquilla de silicona o goma resistente al calor para prevenir la transmisión de patógenos sanguíneos por labios partidos.',
      'Usar rejillas de latón; nunca usar estropajos de cobre (Chore Boy), que liberan vapores tóxicos de óxido de cobre al calentarse.',
      'Dilución 10:1 para Tiras de Fentanilo: Los estimulantes (meta/coca) requieren 1 cucharadita (5 mL) de agua por cada 10 mg de polvo, o 1/2 taza medidora (120 mL) de agua por cada 100 mg para evitar falsos positivos producidos por bases estimulantes puras.'
    ]
  }
};

/**
 * Ephemeral browser-RAM state for stimulant care.
 */
let stimulantCareState = {
  activeTab: 'overview',
  primaryStimulant: 'methamphetamine',
  overampingType: 'mild_anxiety',
  hyperthermiaSymptoms: false,
  chestPainSymptoms: false,
  sleepDeprivedDays: 1,
  fentanylTested: true
};

export function getStimulantCareState() {
  return { ...stimulantCareState };
}

export function setStimulantCareState(patch) {
  stimulantCareState = { ...stimulantCareState, ...patch };
}

export function resetStimulantCareState() {
  stimulantCareState = {
    activeTab: 'overview',
    primaryStimulant: 'methamphetamine',
    overampingType: 'mild_anxiety',
    hyperthermiaSymptoms: false,
    chestPainSymptoms: false,
    sleepDeprivedDays: 1,
    fentanylTested: true
  };
}

/**
 * Evaluates clinical risk and harm reduction directives for stimulants.
 */
export function evaluateStimulantHarmRisk({
  primaryStimulant = 'methamphetamine',
  overampingType = 'mild_anxiety',
  hyperthermiaSymptoms = false,
  chestPainSymptoms = false,
  sleepDeprivedDays = 1,
  fentanylTested = true
} = {}) {
  const alerts = [];
  const careDirectives = [];
  const harmReductionPoints = [];
  let urgencyLevel = 'MODERATE';

  // Physical emergency triggers
  if (hyperthermiaSymptoms || chestPainSymptoms || overampingType === 'physical_emergency') {
    urgencyLevel = 'CRITICAL';
    alerts.push({
      priority: 'CRITICAL',
      titleEn: 'Emergency Medical Activation Required (Call 911)',
      titleEs: 'Activación Médica de Emergencia Requerida (Llame al 911)',
      textEn: 'Core hyperthermia (>103°F / 39.5°C), chest pain, or seizures are life-threatening physical emergencies (cardiac ischemia, stroke, or severe rhabdomyolysis). Call 911 immediately under EMTALA and Good Samaritan protections.',
      textEs: 'La hipertermia corporal central (>103°F / 39.5°C), dolor de pecho o convulsiones son emergencias físicas que ponen en riesgo la vida (isquemia cardíaca, infarto o rabdomiólisis grave). Llame al 911 de inmediato bajo la protección de EMTALA y leyes del Buen Samaritano.'
    });
    careDirectives.push({
      titleEn: 'Emergency Cooling & Absolute Restraint Prohibition',
      titleEs: 'Enfriamiento de Emergencia y Prohibición Absoluta de Sujeciones',
      textEn: 'Apply ice packs to neck, armpits, and groin. Loosen clothing. NEVER physically restrain the person; physical restraint during stimulant agitation causes cardiac arrest and acute renal failure.',
      textEs: 'Aplique compresas de hielo en cuello, axilas e ingles. Afloje la ropa. NUNCA sujete físicamente a la persona; la sujeción física durante la agitación por estimulantes causa paro cardíaco e insuficiencia renal aguda.'
    });
  }

  // Sleep deprivation psychosis triggers
  if (sleepDeprivedDays >= 3 || overampingType === 'psychosis_paranoia') {
    alerts.push({
      priority: 'HIGH',
      titleEn: 'Acute Sleep Deprivation & Psychosis Support',
      titleEs: 'Apoyo ante Privación Aguda de Sueño y Psicosis',
      textEn: 'Staying awake for 3+ days induces profound neurochemical exhaustion, intense paranoia, and auditory/visual hallucinations. The primary medical antidote is safe, quiet, non-judgmental rest and hydration.',
      textEs: 'Permanecer despierto durante 3 o más días induce agotamiento neuroquímico profundo, paranoia intensa y alucinaciones. El principal antídoto médico es descanso seguro, silencioso, sin juicios e hidratación.'
    });
    careDirectives.push({
      titleEn: 'Sensory Decompression & Grounding',
      titleEs: 'Descompresión Sensorial y Conexión con la Realidad',
      textEn: 'Move away from loud noise, flashing lights, and crowds. Provide continuous calm reassurance, water with electrolytes, and a secure space to sleep safely.',
      textEs: 'Aléjese de ruidos fuertes, luces intensas y multitudes. Brinde tranquilidad constante, agua con electrolitos y un espacio seguro para dormir.'
    });
  }

  // Fentanyl adulteration check
  if (!fentanylTested) {
    harmReductionPoints.push({
      titleEn: 'Critical: Test for Fentanyl with 10:1 Water Dilution',
      titleEs: 'Crítico: Analice Fentanilo con Dilución de Agua 10:1',
      textEn: 'Street stimulants are increasingly contaminated with fentanyl. Always test with a fentanyl test strip using 1 full teaspoon of water per 10 mg (or 1/2 cup of water per 100 mg / 1 point) to prevent false positives.',
      textEs: 'Los estimulantes callejeros están frecuentemente adulterados con fentanilo. Siempre use tiras reactivas de fentanilo con 1 cucharadita de agua por 10 mg (o 1/2 taza de agua por 100 mg) para evitar falsos positivos.'
    });
  }

  // Behavioral Treatment Recommendations
  careDirectives.push({
    titleEn: 'Contingency Management (CMI) & Behavioral Care',
    titleEs: 'Manejo de Contingencias (CMI) y Atención Conductual',
    textEn: 'Contingency Management is the gold-standard, evidence-based behavioral intervention for stimulant use disorders. Search HarborPath directory for clinics offering CMI or Matrix Model programs.',
    textEs: 'El Manejo de Contingencias es la intervención conductual de referencia con respaldo empírico para el trastorno por estimulantes. Busque en HarborPath clínicas que ofrezcan programas CMI o Modelo Matrix.'
  });

  return {
    urgencyLevel,
    alerts,
    careDirectives,
    harmReductionPoints
  };
}

/**
 * Formats a plain-text clinical stimulant care summary.
 */
export function formatStimulantSummaryText(state, lang = 'en') {
  const isEs = lang === 'es';
  const result = evaluateStimulantHarmRisk(state);
  const divider = '==================================================';

  const lines = [
    divider,
    isEs
      ? 'PLAN CLÍNICO DE MANEJO DE ESTIMULANTES Y DESESCALADA DE SOBREDOSIS'
      : 'STIMULANT CARE, OVERAMPING & HARM REDUCTION CLINICAL PLAN',
    isEs
      ? 'Apoyo de Decisión en Memoria RAM - Sin Registro de Datos Personales'
      : 'In-RAM Ephemeral Decision Support - Zero Tracking',
    divider,
    '',
    `${isEs ? 'Nivel de Urgencia Evaluado:' : 'Evaluated Urgency Level:'} ${result.urgencyLevel}`,
    `${isEs ? 'Sustancia Principal:' : 'Primary Substance:'} ${state.primaryStimulant}`,
    `${isEs ? 'Días Sin Dormir:' : 'Days Without Sleep:'} ${state.sleepDeprivedDays}`,
    ''
  ];

  if (result.alerts.length > 0) {
    lines.push(isEs ? '--- ALERTAS CLÍNICAS DE URGENCIA ---' : '--- URGENT CLINICAL ALERTS ---');
    result.alerts.forEach(a => {
      lines.push(`[!${a.priority}] ${isEs ? a.titleEs : a.titleEn}`);
      lines.push(isEs ? a.textEs : a.textEn);
      lines.push('');
    });
  }

  lines.push(isEs ? '--- DIRECTIVAS DE CUIDADO Y DESESCALADA ---' : '--- CARE & DE-ESCALATION DIRECTIVES ---');
  result.careDirectives.forEach(d => {
    lines.push(`* ${isEs ? d.titleEs : d.titleEn}`);
    lines.push(`  ${isEs ? d.textEs : d.textEn}`);
    lines.push('');
  });

  if (result.harmReductionPoints.length > 0) {
    lines.push(isEs ? '--- PROTOCOLOS DE REDUCCIÓN DE DAÑOS ---' : '--- HARM REDUCTION PROTOCOLS ---');
    result.harmReductionPoints.forEach(p => {
      lines.push(`- ${isEs ? p.titleEs : p.titleEn}`);
      lines.push(`  ${isEs ? p.textEs : p.textEn}`);
      lines.push('');
    });
  }

  lines.push(divider);
  lines.push(isEs
    ? 'Aviso Educativo: Este resumen es para fines de orientación. HarborPath no almacena datos de los usuarios.'
    : 'Educational Disclaimer: This summary is for guidance purposes. HarborPath does not store user data.'
  );

  return lines.join('\n');
}

/**
 * Mounts the Stimulant Care view.
 */
export function stimulantCareView(container) {
  const currentLang = (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) === 'es' ? 'es' : 'en';
  const isEs = currentLang === 'es';

  container.textContent = '';

  const wrapper = h('div', { class: 'stimulant-care-view clinical-view-wrapper' });

  // Header
  const header = h('header', { class: 'clinical-header' }, [
    h('div', { class: 'clinical-badge' }, [
      icon('activity', { class: 'badge-icon', 'aria-hidden': 'true' }),
      h('span', { class: 'badge-text' }, isEs ? 'Atención de Estimulantes' : 'Stimulant Care & Overamping')
    ]),
    h('h1', { class: 'clinical-title' }, isEs ? 'Manejo de Sobredosis por Estimulantes, Desescalada y CMI' : 'Stimulant Overamping, De-Escalation & Contingency Management'),
    h('p', { class: 'clinical-subtitle' }, isEs
      ? 'Diferenciación entre sobredosis física y psicológica por estimulantes (metanfetamina, cocaína). Protocolos de enfriamiento activo, prohibición de sujeciones físicas, dilución 10:1 para tiras FTS y tratamiento conductual CMI.'
      : 'Differentiating physical and psychological overamping on stimulants (methamphetamine, cocaine). Active cooling protocols, strict physical restraint avoidance, FTS 10:1 dilution rules, and evidence-based Contingency Management.'
    ),
    h('div', { class: 'privacy-notice' }, [
      icon('lock', { class: 'privacy-icon', 'aria-hidden': 'true' }),
      h('span', {}, isEs
        ? 'Herramienta en memoria RAM. Ninguna respuesta se registra ni se comparte.'
        : 'In-RAM ephemeral tool. Zero tracking or storage.'
      )
    ])
  ]);
  wrapper.appendChild(header);

  // Tab navigation
  const tabNav = h('nav', { class: 'clinical-tabs-nav', role: 'tablist', 'aria-label': isEs ? 'Pestañas de navegación' : 'View tabs' });
  const tabs = [
    { id: 'overview', labelEn: 'Overamping Guide', labelEs: 'Guía de Sobredosis' },
    { id: 'assessment', labelEn: 'Overamping Triage', labelEs: 'Triaje de Sobredosis' },
    { id: 'safer-use', labelEn: 'Safer Inhalation & FTS', labelEs: 'Inhalación Segura y FTS' }
  ];

  tabs.forEach(tab => {
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      class: `tab-button ${stimulantCareState.activeTab === tab.id ? 'active' : ''}`,
      'aria-selected': String(stimulantCareState.activeTab === tab.id),
      'aria-controls': `tab-content-${tab.id}`,
      id: `tab-${tab.id}`
    }, isEs ? tab.labelEs : tab.labelEn);

    btn.addEventListener('click', () => {
      stimulantCareState.activeTab = tab.id;
      stimulantCareView(container);
    });
    tabNav.appendChild(btn);
  });
  wrapper.appendChild(tabNav);

  // Content Area
  const contentArea = h('div', {
    class: 'tab-content-area',
    id: `tab-content-${stimulantCareState.activeTab}`,
    role: 'tabpanel',
    'aria-labelledby': `tab-${stimulantCareState.activeTab}`
  });

  if (stimulantCareState.activeTab === 'overview') {
    renderOverviewTab(contentArea, isEs);
  } else if (stimulantCareState.activeTab === 'assessment') {
    renderAssessmentTab(contentArea, isEs, container);
  } else if (stimulantCareState.activeTab === 'safer-use') {
    renderSaferUseTab(contentArea, isEs);
  }

  wrapper.appendChild(contentArea);
  container.appendChild(wrapper);
}

function renderOverviewTab(container, isEs) {
  const grid = h('div', { class: 'standards-grid' });

  // Overamping types card
  const types = STIMULANT_CARE_STANDARDS.OVERAMPING_TYPES;
  const typesCard = h('article', { class: 'card standard-card' }, [
    h('h2', { class: 'standard-card-title' }, isEs ? types.titleEs : types.titleEn),
    h('p', { class: 'standard-summary' }, isEs ? types.summaryEs : types.summaryEn),
    h('h3', {}, isEs ? 'Signos de Emergencia Física (Requiere 911):' : 'Physical Emergency Signs (Call 911):'),
    h('ul', {}, (isEs ? types.physicalSignsEs : types.physicalSignsEn).map(s => h('li', {}, s))),
    h('h3', {}, isEs ? 'Signos de Angustia Psicológica (Desescalada):' : 'Psychological Distress Signs (De-Escalation):'),
    h('ul', {}, (isEs ? types.psychologicalSignsEs : types.psychologicalSignsEn).map(s => h('li', {}, s)))
  ]);
  grid.appendChild(typesCard);

  // De-escalation & Cooling Card
  const deesc = STIMULANT_CARE_STANDARDS.DE_ESCALATION_COOLING;
  const deescCard = h('article', { class: 'card standard-card' }, [
    h('h2', { class: 'standard-card-title' }, isEs ? deesc.titleEs : deesc.titleEn),
    h('p', { class: 'standard-summary' }, isEs ? deesc.summaryEs : deesc.summaryEn),
    h('h3', {}, isEs ? 'Directivas Clínicas de Enfriamiento:' : 'Clinical Cooling Directives:'),
    h('ul', {}, (isEs ? deesc.directivesEs : deesc.directivesEn).map(d => h('li', {}, d)))
  ]);
  grid.appendChild(deescCard);

  // Behavioral Interventions Card
  const cmi = STIMULANT_CARE_STANDARDS.BEHAVIORAL_INTERVENTIONS;
  const cmiCard = h('article', { class: 'card standard-card' }, [
    h('h2', { class: 'standard-card-title' }, isEs ? cmi.titleEs : cmi.titleEn),
    h('p', { class: 'standard-summary' }, isEs ? cmi.summaryEs : cmi.summaryEn),
    h('h3', {}, isEs ? 'Principios de Intervención:' : 'Intervention Principles:'),
    h('ul', {}, (isEs ? cmi.principlesEs : cmi.principlesEn).map(p => h('li', {}, p)))
  ]);
  grid.appendChild(cmiCard);

  container.appendChild(grid);
}

function renderAssessmentTab(container, isEs, rootContainer) {
  const formCard = h('div', { class: 'assessment-card card' });
  formCard.appendChild(h('h2', {}, isEs ? 'Evaluador de Sobredosis y Riesgo por Estimulantes' : 'Overamping & Stimulant Harm Evaluator'));
  formCard.appendChild(h('p', { class: 'aid-description' }, isEs
    ? 'Identifique los síntomas actuales para diferenciar entre emergencia médica física y desescalada psicológica.'
    : 'Identify current symptoms to distinguish between a medical emergency and psychological de-escalation.'
  ));

  // Substance select
  const subGroup = h('div', { class: 'form-group' });
  const subLabel = h('label', { for: 'stim-substance-select' }, isEs ? 'Sustancia Principal:' : 'Primary Substance:');
  const subSelect = h('select', { id: 'stim-substance-select', class: 'select-input' });
  const subOptions = [
    { value: 'methamphetamine', labelEn: 'Methamphetamine (Crystal, Ice)', labelEs: 'Metanfetamina (Cristal)' },
    { value: 'cocaine_crack', labelEn: 'Cocaine or Crack', labelEs: 'Cocaína o Crack' },
    { value: 'prescription_stimulants', labelEn: 'Prescription Stimulants (Adderall, Vyvanse)', labelEs: 'Estimulantes Recetados (Adderall, Vyvanse)' }
  ];
  subOptions.forEach(opt => {
    const optionEl = h('option', { value: opt.value }, isEs ? opt.labelEs : opt.labelEn);
    if (stimulantCareState.primaryStimulant === opt.value) optionEl.selected = true;
    subSelect.appendChild(optionEl);
  });
  subSelect.addEventListener('change', (e) => {
    stimulantCareState.primaryStimulant = e.target.value;
    stimulantCareView(rootContainer);
  });
  subGroup.appendChild(subLabel);
  subGroup.appendChild(subSelect);
  formCard.appendChild(subGroup);

  // Hyperthermia toggle
  const hyperGroup = h('div', { class: 'form-group' });
  const hyperLabel = h('label', { class: 'checkbox-label' });
  const hyperCheckbox = h('input', {
    type: 'checkbox',
    checked: stimulantCareState.hyperthermiaSymptoms
  });
  hyperCheckbox.addEventListener('change', (e) => {
    stimulantCareState.hyperthermiaSymptoms = e.target.checked;
    stimulantCareView(rootContainer);
  });
  hyperLabel.appendChild(hyperCheckbox);
  hyperLabel.appendChild(h('span', { class: 'checkbox-text' }, isEs
    ? '¿Piel extremadamente caliente, fiebre alta (>103°F / 39.5°C) o sudoración profusa?'
    : 'Extremely hot skin, high fever (>103°F / 39.5°C), or profuse sweating?'
  ));
  hyperGroup.appendChild(hyperLabel);
  formCard.appendChild(hyperGroup);

  // Chest pain toggle
  const chestGroup = h('div', { class: 'form-group' });
  const chestLabel = h('label', { class: 'checkbox-label' });
  const chestCheckbox = h('input', {
    type: 'checkbox',
    checked: stimulantCareState.chestPainSymptoms
  });
  chestCheckbox.addEventListener('change', (e) => {
    stimulantCareState.chestPainSymptoms = e.target.checked;
    stimulantCareView(rootContainer);
  });
  chestLabel.appendChild(chestCheckbox);
  chestLabel.appendChild(h('span', { class: 'checkbox-text' }, isEs
    ? '¿Dolor torácico opresivo, dificultad respiratoria severa o convulsiones?'
    : 'Crushing chest pain, severe shortness of breath, or seizures?'
  ));
  chestGroup.appendChild(chestLabel);
  formCard.appendChild(chestGroup);

  // Sleep deprivation days select
  const sleepGroup = h('div', { class: 'form-group' });
  const sleepLabel = h('label', { for: 'sleep-select' }, isEs ? 'Días consecutivos sin dormir:' : 'Consecutive days without sleep:');
  const sleepSelect = h('select', { id: 'sleep-select', class: 'select-input' });
  const sleepOptions = [
    { value: '1', labelEn: '1 Day (Under 24 Hours)', labelEs: '1 Día (Menos de 24 Horas)' },
    { value: '2', labelEn: '2 Days (24 to 48 Hours)', labelEs: '2 Días (24 a 48 Horas)' },
    { value: '3', labelEn: '3 Days or More (High Risk of Psychosis)', labelEs: '3 Días o Más (Alto Riesgo de Psicosis)' }
  ];
  sleepOptions.forEach(opt => {
    const optionEl = h('option', { value: opt.value }, isEs ? opt.labelEs : opt.labelEn);
    if (String(stimulantCareState.sleepDeprivedDays) === opt.value) optionEl.selected = true;
    sleepSelect.appendChild(optionEl);
  });
  sleepSelect.addEventListener('change', (e) => {
    stimulantCareState.sleepDeprivedDays = parseInt(e.target.value, 10);
    stimulantCareView(rootContainer);
  });
  sleepGroup.appendChild(sleepLabel);
  sleepGroup.appendChild(sleepSelect);
  formCard.appendChild(sleepGroup);

  // Fentanyl tested toggle
  const ftsGroup = h('div', { class: 'form-group' });
  const ftsLabel = h('label', { class: 'checkbox-label' });
  const ftsCheckbox = h('input', {
    type: 'checkbox',
    checked: stimulantCareState.fentanylTested
  });
  ftsCheckbox.addEventListener('change', (e) => {
    stimulantCareState.fentanylTested = e.target.checked;
    stimulantCareView(rootContainer);
  });
  ftsLabel.appendChild(ftsCheckbox);
  ftsLabel.appendChild(h('span', { class: 'checkbox-text' }, isEs
    ? '¿Se analizó la sustancia con tiras reactivas de fentanilo?'
    : 'Was the supply tested with fentanyl test strips?'
  ));
  ftsGroup.appendChild(ftsLabel);
  formCard.appendChild(ftsGroup);

  container.appendChild(formCard);

  // Results
  const evaluation = evaluateStimulantHarmRisk(stimulantCareState);
  const resultsCard = h('div', { class: `results-card card urgency-${evaluation.urgencyLevel.toLowerCase()}` });

  resultsCard.appendChild(h('h2', {}, isEs ? 'Evaluación y Directivas Clínicas' : 'Clinical Directives & Harm Assessment'));
  resultsCard.appendChild(h('div', { class: 'urgency-indicator' }, [
    h('strong', {}, isEs ? 'Nivel de Urgencia: ' : 'Urgency Level: '),
    h('span', { class: `badge badge-${evaluation.urgencyLevel.toLowerCase()}` }, evaluation.urgencyLevel)
  ]));

  if (evaluation.alerts.length > 0) {
    evaluation.alerts.forEach(alert => {
      const alertBox = h('div', { class: `alert alert-${alert.priority.toLowerCase()}` }, [
        h('h3', {}, isEs ? alert.titleEs : alert.titleEn),
        h('p', {}, isEs ? alert.textEs : alert.textEn)
      ]);
      resultsCard.appendChild(alertBox);
    });
  }

  const directivesSection = h('div', { class: 'directives-section' });
  directivesSection.appendChild(h('h3', {}, isEs ? 'Directivas de Cuidado:' : 'Care Directives:'));
  evaluation.careDirectives.forEach(dir => {
    const item = h('div', { class: 'directive-item callout' }, [
      h('h4', {}, isEs ? dir.titleEs : dir.titleEn),
      h('p', {}, isEs ? dir.textEs : dir.textEn)
    ]);
    directivesSection.appendChild(item);
  });
  resultsCard.appendChild(directivesSection);

  if (evaluation.harmReductionPoints.length > 0) {
    const hrSection = h('div', { class: 'hr-section' });
    hrSection.appendChild(h('h3', {}, isEs ? 'Puntos de Reducción de Daños:' : 'Harm Reduction Points:'));
    evaluation.harmReductionPoints.forEach(pt => {
      const ptItem = h('div', { class: 'hr-point' }, [
        h('h4', {}, isEs ? pt.titleEs : pt.titleEn),
        h('p', {}, isEs ? pt.textEs : pt.textEn)
      ]);
      hrSection.appendChild(ptItem);
    });
    resultsCard.appendChild(hrSection);
  }

  // Print & Copy Actions
  const actionRow = h('div', { class: 'action-row' });
  const copyBtn = h('button', { type: 'button', class: 'button secondary-button' }, isEs ? 'Copiar Directivas' : 'Copy Directives');
  copyBtn.addEventListener('click', async () => {
    const text = formatStimulantSummaryText(stimulantCareState, isEs ? 'es' : 'en');
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = isEs ? '¡Copiado!' : 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = isEs ? 'Copiar Directivas' : 'Copy Directives';
        }, 2000);
      }
    } catch {
      // Fallback
    }
  });

  const printBtn = h('button', { type: 'button', class: 'button primary-button' }, isEs ? 'Imprimir Directivas' : 'Print Directives');
  printBtn.addEventListener('click', () => {
    if (typeof window !== 'undefined' && window.print) {
      window.print();
    }
  });

  actionRow.appendChild(copyBtn);
  actionRow.appendChild(printBtn);
  resultsCard.appendChild(actionRow);

  container.appendChild(resultsCard);
}

function renderSaferUseTab(container, isEs) {
  const card = h('article', { class: 'card safer-use-card' }, [
    h('h2', {}, isEs ? 'Inhalación Más Segura y Dilución de Tiras FTS' : 'Safer Inhalation & Fentanyl Test Strip Protocols'),
    h('p', {}, isEs
      ? 'La inhalación de estimulantes conlleva riesgos específicos de transmisión de patógenos por cortes en los labios y falsos positivos en tiras reactivas si no se diluyen adecuadamente.'
      : 'Stimulant inhalation carries distinct risks of bloodborne transmission through lip burns, as well as false-positive fentanyl test strip reactions if not properly diluted.'
    ),
    h('div', { class: 'safer-tips-list' }, [
      h('h3', {}, isEs ? 'Pautas Esenciales de Inhalación:' : 'Essential Inhalation Guidelines:'),
      h('ul', { class: 'tips-list' }, (isEs ? STIMULANT_CARE_STANDARDS.SAFER_INHALATION_EQUIPMENT.rulesEs : STIMULANT_CARE_STANDARDS.SAFER_INHALATION_EQUIPMENT.rulesEn).map(rule => h('li', {}, rule)))
    ])
  ]);
  container.appendChild(card);
  const adhdTip = h('div', { class: 'card mt-3' }, [
    h('h3', {}, isEs ? '¿Uso de Estimulantes por Posible TDAH No Diagnosticado?' : 'Using Stimulants to Cope with ADHD or Executive Dysfunction?'),
    h('p', {}, isEs
      ? 'Muchas personas utilizan estimulantes no recetados como automedicación de déficits de dopamina prefrontal. '
      : 'Many individuals use unprescribed stimulants as self-medication for prefrontal dopamine deficits. '),
    h('a', { href: '#/adhd-care' }, isEs
      ? 'Explore el Navegador de TDAH, Cribado ASRS y Farmacoterapia Segura →'
      : 'Explore the ADHD, Neurodiversity & Safe Pharmacotherapy Navigator →')
  ]);
  container.appendChild(adhdTip);
  const triageTip = h('div', { class: 'card mt-3' }, [
    h('h3', {}, isEs ? '¿Sobreestimulación Aguda, Crisis de Paranoia o Agitación?' : 'Acute Overamping, Paranoia, or Crisis Agitation?'),
    h('p', {}, isEs
      ? 'Diferencie el sobreestímulo psicológico del peligro físico de hipertermia (> 104°F) y aplique técnicas de desescalada verbal del Proyecto BETA sin recurrir a contenciones físicas peligrosas. '
      : 'Differentiate psychological panic from life-threatening malignant hyperthermia (> 104°F) and apply Project BETA 10-domain verbal de-escalation without coercive restraints. '),
    h('a', { href: '#/toxicology-triage' }, isEs
      ? 'Abrir Asistente de Triage Toxicológico Agudo y Desescalada BETA →'
      : 'Open Acute Toxicology Triage & Project BETA De-Escalation Assistant →')
  ]);
  container.appendChild(triageTip);

  const weatherTip = h('div', { class: 'card mt-3' }, [
    h('h3', {}, isEs ? '¿Hipertermia Maligna, Golpe de Calor o Sospecha de Rabdomiólisis?' : 'Malignant Hyperthermia, Heat Stroke or Rhabdomyolysis?'),
    h('p', {}, isEs
      ? 'Consulte protocolos de inmersión en agua helada, hidratación para protección renal y diferenciación de rabdomiólisis (orina oscura / té). NUNCA administre paracetamol.'
      : 'Review ice-water immersion protocols, high-rate crystalloid renal protection, and rhabdomyolysis triage (cola-colored urine). NEVER give acetaminophen for environmental or stimulant heat stroke.'),
    h('a', { href: '#/weather-care' }, isEs
      ? 'Abrir Navegador de Seguridad Climática, Golpe de Calor e Hipotermia →'
      : 'Open Weather Care, Heat Stroke & Hypothermia Navigator →')
  ]);
  container.appendChild(weatherTip);
  const renalTip = h('div', { class: 'info-card mt-3' }, [
    h('strong', {}, isEs ? 'Rabdomiólisis y Daño Renal por Estimulantes: ' : 'Stimulant Rhabdomyolysis & Renal Safety: '),
    h('span', {}, isEs
      ? 'La hipertermia y agitación extrema por estimulantes provocan rotura muscular (orina color cola, CK elevada) e insuficiencia renal aguda: '
      : 'Stimulant hyperthermia and extreme motor hyperactivity cause severe muscle breakdown (cola-colored urine, high CK) and acute kidney injury: '),
    h('a', { href: '#/renal-care' }, isEs
      ? 'Abrir Navegador de Salud Renal y Rabdomiólisis →'
      : 'Open Renal Health, Rhabdomyolysis & AKI Navigator →')
  ]);
  container.appendChild(renalTip);
  const pulmonaryTip = h('div', { class: 'info-card mt-3' }, [
    h('strong', {}, isEs ? '"Pulmón de Crack", Hemorragia Alveolar y Daño Inhalatorio: ' : '"Crack Lung", Alveolar Hemorrhage & Inhalation Injury: '),
    h('span', {}, isEs
      ? 'Fumar estimulantes puede causar hemorragia alveolar aguda (tos con sangre, fiebre, dolor torácico) y broncoespasmo severo: '
      : 'Smoking stimulants can trigger acute diffuse alveolar hemorrhage ("Crack Lung", hemoptysis, fever) and severe bronchospasm: '),
    h('a', { href: '#/pulmonary-care' }, isEs
      ? 'Abrir Navegador de Salud Pulmonar e Inhalación Segura →'
      : 'Open Pulmonary Health, Crack Lung & Inhalation Safety Navigator →')
  ]);
  container.appendChild(pulmonaryTip);

}
