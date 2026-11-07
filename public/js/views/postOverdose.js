// public/js/views/postOverdose.js
// HarborPath Post-Overdose Response & Community Paramedicine Specialist
// Pure ES module, 0 dependencies. 100% ephemeral in-RAM clinical guidance.
// References:
// - SAMHSA Post-Overdose Response Team (PORT) Implementation Guide (HHS Publication PEP21-06-01-002)
// - CDC Post-Overdose Care Guidelines & Clinical Practice Framework (2022)
// - DEA 72-Hour Emergency Dispensing Rule: 21 C.F.R. § 1306.07(b)
// - American College of Emergency Physicians (ACEP) Post-Arrest & Overdose Care Consensus

import { h, append, icon } from '../dom.js';
import { t } from '../i18n.js';
import { NEVER_USE_ALONE } from '../content/hotlines.js';

/**
 * Clinical post-overdose response and survivorship framework.
 */
export const POST_OVERDOSE_STANDARDS = {
  CRITICAL_WINDOW: {
    titleEn: 'Critical 48-Hour to 30-Day Vulnerability Window',
    titleEs: 'Ventana Crítica de Vulnerabilidad de 48 Horas a 30 Días',
    summaryEn: 'The first 48 hours to 30 days after a non-fatal overdose represent the highest statistical risk period for a subsequent fatal overdose. Disrupted opioid tolerance, psychological distress, and sudden precipitated withdrawal dramatically elevate vulnerability.',
    summaryEs: 'Las primeras 48 horas a 30 días posteriores a una sobredosis no fatal representan el período de mayor riesgo estadístico para una posterior sobredosis fatal. La pérdida de tolerancia a opioides, la angustia psicológica y la abstinencia precipitada repentina elevan drásticamente la vulnerabilidad.',
    recommendationsEn: [
      'Maintain continuous 24-hour companion observation; never use substances alone.',
      'Replenish multiple naloxone kits (nasal spray and/or intramuscular) immediately.',
      'Initiate same-day or next-day low-barrier MOUD (buprenorphine or methadone) bridge.'
    ],
    recommendationsEs: [
      'Mantener observación continua con un acompañante durante 24 horas; nunca consumir sustancias a solas.',
      'Reponer de inmediato múltiples kits de naloxona (aerosol nasal o intramuscular).',
      'Iniciar un puente de MOUD de bajo umbral (buprenorfina o metadona) el mismo día o al día siguiente.'
    ]
  },
  NALOXONE_PHARMACOKINETICS: {
    titleEn: 'Naloxone Duration & Rebound Sedation Dynamics',
    titleEs: 'Duración de la Naloxona y Dinámica de Sedación de Rebote',
    summaryEn: 'Naloxone has a short half-life of 30 to 90 minutes. High-potency synthetic opioids (fentanyl, fentanyl analogues, and methadone) remain bound to opioid receptors or stored in lipophilic tissue for hours. As naloxone metabolizes, respiratory depression can abruptly return.',
    summaryEs: 'La naloxona tiene una vida media corta de 30 a 90 minutos. Los opioides sintéticos de alta potencia (fentanilo, análogos y metadona) permanecen unidos a los receptores o en tejido adiposo durante horas. Al metabolizarse la naloxona, la depresión respiratoria puede reaparecer bruscamente.',
    recommendationsEn: [
      'Keep the survivor under close observation for at least 2 to 4 hours post-reversal.',
      'Have at least 2 additional naloxone doses within immediate reach in case of re-sedation.',
      'If breathing slows below 10 breaths per minute or lips turn blue/gray, administer another dose of naloxone and perform rescue breathing (1 breath every 5 seconds).'
    ],
    recommendationsEs: [
      'Mantener a la persona bajo observación atenta durante al menos 2 a 4 horas después de la reanimación.',
      'Tener al menos 2 dosis adicionales de naloxona al alcance inmediato en caso de resedación.',
      'Si la respiración cae por debajo de 10 respiraciones por minuto o los labios se tornan azules/grises, administre otra dosis de naloxona e inicie respiración de rescate (1 respiración cada 5 segundos).'
    ]
  },
  PRECIPITATED_WITHDRAWAL: {
    titleEn: 'Managing Precipitated Withdrawal Safely',
    titleEs: 'Manejo Seguro de la Abstinencia Precipitada',
    summaryEn: 'When naloxone clears opioids from receptors, survivors can experience acute, intensely painful withdrawal (nausea, vomiting, diarrhea, intense tremors, tachycardia, extreme panic). Critical safety warning: Never attempt to relieve withdrawal by using more street drugs; street fentanyl potency is erratic, and once naloxone wears off, fatal overdose compounding will occur.',
    summaryEs: 'Cuando la naloxona desaloja los opioides de los receptores, los sobrevivientes pueden experimentar abstinencia aguda e intensamente dolorosa (náuseas, vómitos, diarrea, temblores intensos, taquicardia, pánico extremo). Advertencia crítica: Nunca intente aliviar la abstinencia consumiendo más drogas ilegales; la potencia del fentanilo callejero es errática y, al disiparse la naloxona, ocurrirá una sobredosis letal acumulativa.',
    recommendationsEn: [
      'Reassure the individual that the acute physical agony will diminish as naloxone clears over 60–90 minutes.',
      'Offer comfort medications if available: ondansetron for nausea, loperamide for diarrhea, clonidine for autonomic hyperarousal, acetaminophen/ibuprofen for muscle aches.',
      'Warm blankets, hydration, electrolyte fluids, and a quiet, non-judgmental environment accelerate recovery.'
    ],
    recommendationsEs: [
      'Asegure a la persona que el dolor físico agudo disminuirá a medida que la naloxona se disipe en 60 a 90 minutos.',
      'Ofrezca medicamentos de apoyo si están disponibles: ondansetrón para náuseas, loperamida para diarrea, clonidina para hiperactividad autonómica, paracetamol/ibuprofeno para dolores musculares.',
      'Mantas calientes, hidratación con electrolitos y un entorno tranquilo y sin juicios aceleran la recuperación.'
    ]
  },
  XYLAZINE_SEDATIVES: {
    titleEn: 'Non-Opioid Sedatives (Xylazine / Benzodiazepines)',
    titleEs: 'Sedantes No Opioides (Xilazina / Benzodiacepinas)',
    summaryEn: 'Xylazine (tranq) and designer benzodiazepines are not reversed by naloxone. A person may remain heavily sedated or unresponsive even after receiving multiple doses of naloxone. Do not keep administering repeated naloxone if the person is already breathing adequately (at least 10–12 breaths per minute).',
    summaryEs: 'La xilazina (tranq) y las benzodiacepinas sintéticas no son revertidas por la naloxona. Una persona puede permanecer profundamente sedada o inconsciente incluso después de varias dosis de naloxona. No continúe administrando dosis repetidas si la persona ya está respirando adecuadamente (al menos 10 a 12 respiraciones por minuto).',
    recommendationsEn: [
      'Focus primarily on airway and breathing: place the individual in the Recovery Position (on their side) to prevent vomit aspiration.',
      'Check for pulse, skin color, and chest rise. If breathing is shallow or absent, provide rescue breathing (1 breath every 5 seconds).',
      'If signs of circulatory shock or severe bradycardia occur, call 911 immediately under Good Samaritan protections.'
    ],
    recommendationsEs: [
      'Enfóquese principalmente en la vía aérea y respiración: coloque a la persona en Posición de Recuperación (de lado) para prevenir la aspiración de vómito.',
      'Verifique el pulso, color de la piel y elevación del pecho. Si la respiración es superficial o ausente, realice respiración de rescate (1 respiración cada 5 segundos).',
      'Si ocurren signos de choque circulatorio o bradicardia severa, llame al 911 de inmediato bajo la protección del Buen Samaritano.'
    ]
  },
  DEA_72_HOUR_BRIDGE: {
    titleEn: 'DEA 72-Hour Rule & Hospital MOUD Induction',
    titleEs: 'Regla de las 72 Horas de la DEA e Inducción Hospitalaria de MOUD',
    summaryEn: 'Under 21 C.F.R. § 1306.07(b), medical practitioners (including hospital emergency departments and urgent care clinics) can administer buprenorphine or methadone for up to 3 consecutive days to treat acute opioid withdrawal while arranging long-term treatment, even if not registered as an Opioid Treatment Program (OTP).',
    summaryEs: 'Bajo 21 C.F.R. § 1306.07(b), los médicos (incluidas salas de emergencias y urgencias) pueden administrar buprenorfina o metadona hasta por 3 días consecutivos para tratar la abstinencia aguda de opioides mientras coordinan tratamiento a largo plazo, incluso sin ser un Programa de Tratamiento de Opioides (OTP) registrado.',
    recommendationsEn: [
      'Hospital EDs can initiate buprenorphine immediately following overdose reversal.',
      'Ask the treating physician or social worker for a "72-hour emergency MOUD bridge".',
      'Receive warm handoff to outpatient Office-Based Opioid Treatment (OBOT) or OTP.'
    ],
    recommendationsEs: [
      'Las salas de emergencias pueden iniciar buprenorfina inmediatamente tras revertir una sobredosis.',
      'Solicite al médico tratante o trabajador social un "puente de emergencia MOUD de 72 horas".',
      'Reciba una vinculación directa a tratamiento ambulatorio en consultorio (OBOT) o programa OTP.'
    ]
  }
};

/**
 * Ephemeral browser-RAM state for post-overdose guidance.
 */
let postOverdoseState = {
  activeTab: 'overview',
  hoursSinceEvent: 'under_6',
  symptoms: ['shivering_anxiety'],
  naloxoneDosesAdministered: 1,
  hasMoudBridge: false,
  supportPresent: true
};

export function getPostOverdoseState() {
  return { ...postOverdoseState, symptoms: [...postOverdoseState.symptoms] };
}

export function setPostOverdoseState(patch) {
  postOverdoseState = {
    ...postOverdoseState,
    ...patch,
    symptoms: patch.symptoms ? [...patch.symptoms] : [...postOverdoseState.symptoms]
  };
}

export function resetPostOverdoseState() {
  postOverdoseState = {
    activeTab: 'overview',
    hoursSinceEvent: 'under_6',
    symptoms: ['shivering_anxiety'],
    naloxoneDosesAdministered: 1,
    hasMoudBridge: false,
    supportPresent: true
  };
}

/**
 * Evaluates clinical post-overdose needs and survivorship risks.
 */
export function evaluatePostOverdoseCare({
  hoursSinceEvent = 'under_6',
  symptoms = [],
  naloxoneDosesAdministered = 1,
  hasMoudBridge = false,
  supportPresent = true
} = {}) {
  const urgencyAlerts = [];
  const actionChecklist = [];
  const harmReductionDirectives = [];
  let riskLevel = 'MODERATE';

  // Hours check
  if (hoursSinceEvent === 'under_2' || hoursSinceEvent === 'under_6') {
    urgencyAlerts.push({
      level: 'HIGH',
      titleEn: 'Active Rebound Sedation Vulnerability Window',
      titleEs: 'Ventana Activa de Vulnerabilidad por Sedación de Rebote',
      textEn: 'Naloxone clears from the body in 30–90 minutes, while fentanyl remains bound for hours. Continuous observation is required right now.',
      textEs: 'La naloxona se disipa del cuerpo en 30 a 90 minutos, mientras que el fentanilo permanece activo durante horas. Se requiere observación continua en este momento.'
    });
    riskLevel = 'HIGH';
  }

  // Symptom evaluation
  const hasChestPain = symptoms.includes('chest_pain');
  const hasConfusion = symptoms.includes('confusion_fever');
  const hasSlowBreathing = symptoms.includes('slow_breathing');
  const hasPrecipitatedWithdrawal = symptoms.includes('precipitated_withdrawal');

  if (hasChestPain || hasSlowBreathing) {
    urgencyAlerts.push({
      level: 'CRITICAL',
      titleEn: 'Emergency Evaluation Required (Call 911)',
      titleEs: 'Evaluación de Emergencia Requerida (Llame al 911)',
      textEn: 'Slow breathing (<10 bpm) indicates returning respiratory depression or non-opioid sedation. Chest pain may indicate myocardial strain or pulmonary edema. Call 911 immediately; Good Samaritan laws protect you from arrest.',
      textEs: 'La respiración lenta (<10 rpm) indica retorno de depresión respiratoria o sedación por no opioides. El dolor de pecho puede indicar esfuerzo cardíaco o edema pulmonar. Llame al 911 de inmediato; las leyes del Buen Samaritano lo protegen de arrestos.'
    });
    riskLevel = 'CRITICAL';
  }

  if (hasPrecipitatedWithdrawal) {
    harmReductionDirectives.push({
      topic: 'precipitated_withdrawal_safety',
      titleEn: 'Do NOT Use Street Drugs to Stop Withdrawal',
      titleEs: 'NO consuma drogas ilegales para detener la abstinencia',
      textEn: 'Using street fentanyl while naloxone is active is the leading cause of secondary fatal overdose. The naloxone will wear off within 60–90 minutes. Stay calm, use comfort medications (hydration, ondansetron, clonidine), and seek a 72-hour MOUD bridge.',
      textEs: 'Consumir fentanilo callejero mientras la naloxona está activa es la causa principal de sobredosis letales secundarias. La naloxona se disipará en 60 a 90 minutos. Mantenga la calma, use medicamentos de alivio (hidratación, ondansetrón, clonidina) y busque un puente MOUD de 72 horas.'
    });
  }

  // Support companion check
  if (!supportPresent) {
    urgencyAlerts.push({
      level: 'HIGH',
      titleEn: 'Never Be Alone Post-Overdose',
      titleEs: 'Nunca se quede a solas tras una sobredosis',
      textEn: 'Surviving an overdose leaves individuals at extreme vulnerability. If no companion can stay with you, call the Never Use Alone hotline (' + NEVER_USE_ALONE.label + ') or SafeSpot (800-972-0590).',
      textEs: 'Sobrevivir a una sobredosis deja a la persona en extrema vulnerabilidad. Si no hay un acompañante disponible, llame a la línea Never Use Alone (' + NEVER_USE_ALONE.label + ') o a SafeSpot (800-972-0590).'
    });
  }

  // MOUD Bridge check
  if (!hasMoudBridge) {
    actionChecklist.push({
      stepEn: 'Request an Emergency 72-Hour Buprenorphine Bridge at an Emergency Department or FQHC under 21 C.F.R. § 1306.07(b).',
      stepEs: 'Solicite un puente de buprenorfina de emergencia de 72 horas en una sala de emergencias o centro FQHC bajo 21 C.F.R. § 1306.07(b).'
    });
  }

  actionChecklist.push({
    stepEn: 'Replenish at least 2 to 4 doses of naloxone (Narcan nasal spray or injectable naloxone) via a local harm reduction program or pharmacy.',
    stepEs: 'Reponga al menos 2 a 4 dosis de naloxona (aerosol nasal Narcan o inyectable) mediante un programa de reducción de daños o farmacia.'
  });

  actionChecklist.push({
    stepEn: 'Test all future supplies with Fentanyl and Xylazine test strips; avoid using solitary doses without a spotter.',
    stepEs: 'Analice todos los suministros futuros con tiras reactivas de fentanilo y xilazina; evite dosis en soledad sin un acompañante o monitor.'
  });

  return {
    riskLevel,
    urgencyAlerts,
    actionChecklist,
    harmReductionDirectives
  };
}

/**
 * Formats a plain-text clinical post-overdose summary.
 */
export function formatPostOverdoseSummaryText(state, lang = 'en') {
  const isEs = lang === 'es';
  const result = evaluatePostOverdoseCare(state);
  const divider = '==================================================';

  const lines = [
    divider,
    isEs
      ? 'PLAN CLÍNICO DE RESPUESTA Y SUPERVIVENCIA POST-SOBREDOSIS'
      : 'POST-OVERDOSE CLINICAL RESPONSE & SURVIVORSHIP PLAN',
    isEs
      ? 'Apoyo de Decisión en Memoria RAM - Sin Registro de Datos Personales'
      : 'In-RAM Ephemeral Decision Support - Zero Tracking',
    divider,
    '',
    `${isEs ? 'Nivel de Riesgo Evaluado:' : 'Evaluated Risk Level:'} ${result.riskLevel}`,
    ''
  ];

  if (result.urgencyAlerts.length > 0) {
    lines.push(isEs ? '--- ALERTAS CLÍNICAS DE URGENCIA ---' : '--- URGENT CLINICAL ALERTS ---');
    result.urgencyAlerts.forEach(a => {
      lines.push(`[!${a.level}] ${isEs ? a.titleEs : a.titleEn}`);
      lines.push(isEs ? a.textEs : a.textEn);
      lines.push('');
    });
  }

  if (result.harmReductionDirectives.length > 0) {
    lines.push(isEs ? '--- DIRECTIVAS CRÍTICAS DE REDUCCIÓN DE DAÑOS ---' : '--- CRITICAL HARM REDUCTION DIRECTIVES ---');
    result.harmReductionDirectives.forEach(d => {
      lines.push(`* ${isEs ? d.titleEs : d.titleEn}`);
      lines.push(`  ${isEs ? d.textEs : d.textEn}`);
      lines.push('');
    });
  }

  lines.push(isEs ? '--- LISTA DE ACCIONES INMEDIATAS ---' : '--- IMMEDIATE ACTION CHECKLIST ---');
  result.actionChecklist.forEach((item, idx) => {
    lines.push(`${idx + 1}. ${isEs ? item.stepEs : item.stepEn}`);
  });
  lines.push('');

  lines.push(isEs ? '--- ESTÁNDARES Y DERECHOS CLÍNICOS ---' : '--- CLINICAL STANDARDS & STATUTORY RIGHTS ---');
  lines.push(`- ${isEs ? POST_OVERDOSE_STANDARDS.CRITICAL_WINDOW.titleEs : POST_OVERDOSE_STANDARDS.CRITICAL_WINDOW.titleEn}`);
  lines.push(`- ${isEs ? POST_OVERDOSE_STANDARDS.DEA_72_HOUR_BRIDGE.titleEs : POST_OVERDOSE_STANDARDS.DEA_72_HOUR_BRIDGE.titleEn} (21 C.F.R. § 1306.07(b))`);
  lines.push('');
  lines.push(divider);
  lines.push(isEs
    ? 'Aviso Educativo: Este resumen es para fines de orientación. HarborPath no almacena datos de los usuarios.'
    : 'Educational Disclaimer: This summary is for guidance purposes. HarborPath does not store user data.'
  );

  return lines.join('\n');
}

/**
 * Mounts the Post-Overdose Response view.
 */
export function postOverdoseView(container) {
  const currentLang = (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) === 'es' ? 'es' : 'en';
  const isEs = currentLang === 'es';

  container.textContent = '';

  const wrapper = h('div', { class: 'post-overdose-view clinical-view-wrapper' });

  // Header
  const header = h('header', { class: 'clinical-header' }, [
    h('div', { class: 'clinical-badge' }, [
      icon('heart', { class: 'badge-icon', 'aria-hidden': 'true' }),
      h('span', { class: 'badge-text' }, isEs ? 'Respuesta Post-Sobredosis' : 'Post-Overdose Response & Support')
    ]),
    h('h1', { class: 'clinical-title' }, isEs ? 'Supervivencia, Cuidados Post-Naloxona y Enlace MOUD' : 'Post-Overdose Care, Naloxone Reversal & MOUD Bridges'),
    h('p', { class: 'clinical-subtitle' }, isEs
      ? 'Orientación clínica durante las primeras 48 horas a 30 días posteriores a una sobredosis. Manejo de abstinencia precipitada, prevención de sedación de rebote y puentes de buprenorfina de 72 horas.'
      : 'Clinical guidance for the critical 48-hour to 30-day window following an overdose reversal. Managing precipitated withdrawal, rebound sedation risks, and emergency MOUD bridges.'
    ),
    h('div', { class: 'privacy-notice' }, [
      icon('lock', { class: 'privacy-icon', 'aria-hidden': 'true' }),
      h('span', {}, isEs
        ? 'Herramienta en memoria RAM. Ninguna respuesta se registra ni se comparte.'
        : 'In-RAM ephemeral tool. Zero data stored or shared.'
      )
    ])
  ]);
  wrapper.appendChild(header);

  // Tab navigation
  const tabNav = h('nav', { class: 'clinical-tabs-nav', role: 'tablist', 'aria-label': isEs ? 'Pestañas de navegación' : 'View tabs' });
  const tabs = [
    { id: 'overview', labelEn: 'Post-Overdose Standards', labelEs: 'Estándares Post-Sobredosis' },
    { id: 'triage', labelEn: 'Triage & Safety Plan', labelEs: 'Triaje y Plan de Seguridad' },
    { id: 'responder-support', labelEn: 'Responder & Bystander Support', labelEs: 'Apoyo a Respondedores' }
  ];

  tabs.forEach(tab => {
    const btn = h('button', {
      type: 'button',
      role: 'tab',
      class: `tab-button ${postOverdoseState.activeTab === tab.id ? 'active' : ''}`,
      'aria-selected': String(postOverdoseState.activeTab === tab.id),
      'aria-controls': `tab-content-${tab.id}`,
      id: `tab-${tab.id}`
    }, isEs ? tab.labelEs : tab.labelEn);

    btn.addEventListener('click', () => {
      postOverdoseState.activeTab = tab.id;
      postOverdoseView(container);
    });
    tabNav.appendChild(btn);
  });
  wrapper.appendChild(tabNav);

  // Content Area
  const contentArea = h('div', {
    class: 'tab-content-area',
    id: `tab-content-${postOverdoseState.activeTab}`,
    role: 'tabpanel',
    'aria-labelledby': `tab-${postOverdoseState.activeTab}`
  });

  if (postOverdoseState.activeTab === 'overview') {
    renderOverviewTab(contentArea, isEs);
  } else if (postOverdoseState.activeTab === 'triage') {
    renderTriageTab(contentArea, isEs, container);
  } else if (postOverdoseState.activeTab === 'responder-support') {
    renderResponderSupportTab(contentArea, isEs);
  }

  wrapper.appendChild(contentArea);
  container.appendChild(wrapper);
}

function renderOverviewTab(container, isEs) {
  const grid = h('div', { class: 'standards-grid' });

  Object.values(POST_OVERDOSE_STANDARDS).forEach(std => {
    const card = h('article', { class: 'standard-card card' }, [
      h('h2', { class: 'standard-card-title' }, isEs ? std.titleEs : std.titleEn),
      h('p', { class: 'standard-summary' }, isEs ? std.summaryEs : std.summaryEn),
      h('h3', { class: 'standard-rec-heading' }, isEs ? 'Recomendaciones Clínicas:' : 'Clinical Recommendations:'),
      h('ul', { class: 'standard-rec-list' }, (isEs ? std.recommendationsEs : std.recommendationsEn).map(rec => h('li', {}, rec)))
    ]);
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function renderTriageTab(container, isEs, rootContainer) {
  const formCard = h('div', { class: 'triage-card card' });
  formCard.appendChild(h('h2', {}, isEs ? 'Evaluación de Seguridad Post-Sobredosis' : 'Post-Overdose Safety & Survivorship Evaluator'));
  formCard.appendChild(h('p', { class: 'triage-description' }, isEs
    ? 'Identifique el tiempo transcurrido y síntomas presentes para recibir directivas clínicas inmediatas.'
    : 'Identify elapsed time and current symptoms to receive immediate clinical directives.'
  ));

  // Time elapsed select
  const timeGroup = h('div', { class: 'form-group' });
  const timeLabel = h('label', { for: 'time-select' }, isEs ? 'Tiempo transcurrido desde la reversión:' : 'Time since overdose reversal:');
  const timeSelect = h('select', { id: 'time-select', class: 'select-input' });
  const timeOptions = [
    { value: 'under_2', labelEn: 'Under 2 Hours (Critical Naloxone Wearing-Off Window)', labelEs: 'Menos de 2 Horas (Ventana Crítica de Disipación de Naloxona)' },
    { value: 'under_6', labelEn: '2 to 6 Hours Post-Reversal', labelEs: '2 a 6 Horas Post-Reanimación' },
    { value: 'under_24', labelEn: '6 to 24 Hours Post-Reversal', labelEs: '6 a 24 Horas Post-Reanimación' },
    { value: 'under_72', labelEn: '24 to 72 Hours Post-Reversal', labelEs: '24 a 72 Horas Post-Reanimación' },
    { value: 'over_72', labelEn: 'More than 3 Days Ago (Subacute Retention Phase)', labelEs: 'Más de 3 Días (Fase de Retención Subaguda)' }
  ];
  timeOptions.forEach(opt => {
    const optionEl = h('option', { value: opt.value }, isEs ? opt.labelEs : opt.labelEn);
    if (postOverdoseState.hoursSinceEvent === opt.value) optionEl.selected = true;
    timeSelect.appendChild(optionEl);
  });
  timeSelect.addEventListener('change', (e) => {
    postOverdoseState.hoursSinceEvent = e.target.value;
    postOverdoseView(rootContainer);
  });
  timeGroup.appendChild(timeLabel);
  timeGroup.appendChild(timeSelect);
  formCard.appendChild(timeGroup);

  // Symptoms checkboxes
  const symptomGroup = h('div', { class: 'form-group symptom-checkbox-group' });
  symptomGroup.appendChild(h('label', { class: 'group-label' }, isEs ? 'Síntomas actuales (seleccione todos los que apliquen):' : 'Current Symptoms (select all that apply):'));

  const symptomList = [
    { id: 'precipitated_withdrawal', labelEn: 'Severe Precipitated Withdrawal (Nausea, chills, intense tremors, panic)', labelEs: 'Abstinencia Precipitada Severa (Náuseas, escalofríos, temblores, pánico)' },
    { id: 'slow_breathing', labelEn: 'Slow or Shallow Breathing (<10 breaths/min) or Extreme Drowsiness', labelEs: 'Respiración Lenta o Superficial (<10 rpm) o Somnolencia Extrema' },
    { id: 'chest_pain', labelEn: 'Chest Pain, Racing Heart, or Difficulty Catching Breath', labelEs: 'Dolor en el Pecho, Palpitaciones o Dificultad para Respirar' },
    { id: 'confusion_fever', labelEn: 'Confusion, Disorientation, or Elevated Fever', labelEs: 'Confusión, Desorientación o Fiebre Elevada' }
  ];

  symptomList.forEach(item => {
    const label = h('label', { class: 'checkbox-label' });
    const checkbox = h('input', {
      type: 'checkbox',
      value: item.id,
      checked: postOverdoseState.symptoms.includes(item.id)
    });
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        if (!postOverdoseState.symptoms.includes(item.id)) {
          postOverdoseState.symptoms.push(item.id);
        }
      } else {
        postOverdoseState.symptoms = postOverdoseState.symptoms.filter(s => s !== item.id);
      }
      postOverdoseView(rootContainer);
    });
    label.appendChild(checkbox);
    label.appendChild(h('span', { class: 'checkbox-text' }, isEs ? item.labelEs : item.labelEn));
    symptomGroup.appendChild(label);
  });
  formCard.appendChild(symptomGroup);

  // Support present toggle
  const supportGroup = h('div', { class: 'form-group' });
  const supportLabel = h('label', { class: 'checkbox-label' });
  const supportCheckbox = h('input', {
    type: 'checkbox',
    checked: postOverdoseState.supportPresent
  });
  supportCheckbox.addEventListener('change', (e) => {
    postOverdoseState.supportPresent = e.target.checked;
    postOverdoseView(rootContainer);
  });
  supportLabel.appendChild(supportCheckbox);
  supportLabel.appendChild(h('span', { class: 'checkbox-text' }, isEs
    ? '¿Hay una persona de apoyo o acompañante presente con la persona sobreviviente?'
    : 'Is there a support companion currently present with the survivor?'
  ));
  supportGroup.appendChild(supportLabel);
  formCard.appendChild(supportGroup);

  // MOUD bridge toggle
  const moudGroup = h('div', { class: 'form-group' });
  const moudLabel = h('label', { class: 'checkbox-label' });
  const moudCheckbox = h('input', {
    type: 'checkbox',
    checked: postOverdoseState.hasMoudBridge
  });
  moudCheckbox.addEventListener('change', (e) => {
    postOverdoseState.hasMoudBridge = e.target.checked;
    postOverdoseView(rootContainer);
  });
  moudLabel.appendChild(moudCheckbox);
  moudLabel.appendChild(h('span', { class: 'checkbox-text' }, isEs
    ? '¿La persona ya tiene un puente de MOUD (buprenorfina o metadona) activo?'
    : 'Does the survivor already have an active MOUD (buprenorphine or methadone) bridge?'
  ));
  moudGroup.appendChild(moudLabel);
  formCard.appendChild(moudGroup);

  container.appendChild(formCard);

  // Results
  const evaluation = evaluatePostOverdoseCare(postOverdoseState);
  const resultsCard = h('div', { class: `results-card card risk-${evaluation.riskLevel.toLowerCase()}` });

  resultsCard.appendChild(h('h2', {}, isEs ? 'Plan de Supervivencia y Directivas Clínicas' : 'Survivorship Directives & Care Plan'));
  resultsCard.appendChild(h('div', { class: 'risk-indicator' }, [
    h('strong', {}, isEs ? 'Nivel de Riesgo Evaluado: ' : 'Evaluated Risk Level: '),
    h('span', { class: `badge badge-${evaluation.riskLevel.toLowerCase()}` }, evaluation.riskLevel)
  ]));

  if (evaluation.urgencyAlerts.length > 0) {
    evaluation.urgencyAlerts.forEach(alert => {
      const alertBox = h('div', { class: `alert alert-${alert.level.toLowerCase()}` }, [
        h('h3', {}, isEs ? alert.titleEs : alert.titleEn),
        h('p', {}, isEs ? alert.textEs : alert.textEn)
      ]);
      resultsCard.appendChild(alertBox);
    });
  }

  if (evaluation.harmReductionDirectives.length > 0) {
    evaluation.harmReductionDirectives.forEach(directive => {
      const dirBox = h('div', { class: 'directive-box callout' }, [
        h('h3', {}, isEs ? directive.titleEs : directive.titleEn),
        h('p', {}, isEs ? directive.textEs : directive.textEn)
      ]);
      resultsCard.appendChild(dirBox);
    });
  }

  const checklistSection = h('div', { class: 'checklist-section' }, [
    h('h3', {}, isEs ? 'Acciones Inmediatas a Seguir:' : 'Immediate Action Steps:'),
    h('ol', { class: 'action-steps' }, evaluation.actionChecklist.map(item => h('li', {}, isEs ? item.stepEs : item.stepEn)))
  ]);
  resultsCard.appendChild(checklistSection);

  // Print & Copy Actions
  const actionRow = h('div', { class: 'action-row' });
  const copyBtn = h('button', { type: 'button', class: 'button secondary-button' }, isEs ? 'Copiar Plan' : 'Copy Plan');
  copyBtn.addEventListener('click', async () => {
    const text = formatPostOverdoseSummaryText(postOverdoseState, isEs ? 'es' : 'en');
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = isEs ? '¡Copiado!' : 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = isEs ? 'Copiar Plan' : 'Copy Plan';
        }, 2000);
      }
    } catch {
      // Fallback
    }
  });

  const printBtn = h('button', { type: 'button', class: 'button primary-button' }, isEs ? 'Imprimir Plan' : 'Print Plan');
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

function renderResponderSupportTab(container, isEs) {
  const card = h('article', { class: 'card responder-card' }, [
    h('h2', {}, isEs ? 'Apoyo Emocional y Psicológico para Respondedores y Testigos' : 'Emotional & Psychological Support for Responders'),
    h('p', {}, isEs
      ? 'Reanimar a una persona de una sobredosis es una experiencia intensa y traumática. Experimentar temblores, ansiedad, culpa o insomnio es una respuesta humana normal ante el trauma.'
      : 'Resuscitating someone from an overdose is an intense, distressing experience. Experiencing adrenaline surges, trembling, anxiety, guilt, or sleep disruption is a normal reaction to acute stress.'
    ),
    h('div', { class: 'support-tips' }, [
      h('h3', {}, isEs ? 'Recomendaciones de Recuperación para Respondedores:' : 'Recovery Recommendations for Responders:'),
      h('ul', { class: 'tips-list' }, [
        h('li', {}, isEs
          ? 'Descompresión entre Pares: Hable con un amigo de confianza, compañero o navegador de reducción de daños sobre lo sucedido sin guardarse las emociones.'
          : 'Peer Debriefing: Talk through the experience with a trusted friend, colleague, or harm reduction worker. Avoid carrying the weight in isolation.'
        ),
        h('li', {}, isEs
          ? 'Línea de Apoyo 988: Puede llamar o enviar mensajes de texto al 988 en cualquier momento para recibir apoyo confidencial gratuito ante el estrés post-incidente.'
          : '988 Suicide & Crisis Lifeline: Call or text 988 at any time for confidential, free emotional debriefing and crisis support.'
        ),
        h('li', {}, isEs
          ? 'Reemplazo Inmediato del Kit de Naloxona: Asegúrese de obtener un nuevo kit de naloxona de inmediato antes de necesitarlo nuevamente.'
          : 'Replenish Naloxone Immediately: Secure a new naloxone kit promptly so you are never without emergency rescue medication.'
        )
      ])
    ])
  ]);
  container.appendChild(card);
  const rhabdoCard = h('div', { class: 'info-card mt-3' }, [
    h('strong', {}, isEs ? 'Tiempo Inmóvil en Sobredosis, Rabdomiólisis y Síndrome Compartimental: ' : 'Overdose Down Time, Rhabdomyolysis & Compartment Syndrome: '),
    h('span', {}, isEs
      ? 'Permanecer inmóvil tras una sobredosis causa compresión muscular, orina color té/cola e insuficiencia renal aguda: '
      : 'Prolonged immobilization on hard surfaces causes muscle compression, cola-colored urine, and acute kidney injury: '),
    h('a', { href: '#/renal-care' }, isEs
      ? 'Abrir Navegador de Rabdomiólisis y Salud Renal →'
      : 'Open Rhabdomyolysis, Compartment Syndrome & Renal Care Navigator →')
  ]);
  container.appendChild(rhabdoCard);
  const pulmonaryCard = h('div', { class: 'info-card mt-3' }, [
    h('strong', {}, isEs ? 'Edema Pulmonar Post-Naloxona y Broncoaspiración Química: ' : 'Post-Naloxone Pulmonary Edema (NCPE) & Aspiration Pneumonitis: '),
    h('span', {}, isEs
      ? 'El esputo rosado espumoso tras revertir una sobredosis indica edema pulmonar (requiere CPAP, NO más naloxona). Conozca la regla de 48h de aspiración: '
      : 'Pink frothy sputum post-reversal indicates non-cardiogenic pulmonary edema (requires CPAP/O2, NOT more naloxone). Learn the 48h aspiration rule: '),
    h('a', { href: '#/pulmonary-care' }, isEs
      ? 'Abrir Navegador de Salud Pulmonar Post-Sobredosis →'
      : 'Open Post-Overdose Pulmonary Care & NCPE Navigator →')
  ]);
  container.appendChild(pulmonaryCard);
  const neurologyCard = h('div', { class: 'info-card mt-3' }, [
    h('strong', {}, isEs ? 'Lesión Cerebral Anóxica (EHI) y Recaída Tardía (LPHT): ' : 'Anoxic Brain Injury (HIE) & Delayed Relapse (DPHL): '),
    h('span', {}, isEs
      ? 'La apnea prolongada daña la corteza y los ganglios basales. Alerte a familiares sobre la recaída tardía (LPHT) de 2 a 40 días post-sobredosis: '
      : 'Prolonged hypoxia causes cortical and basal ganglia injury. Alert survivors to delayed post-hypoxic leukoencephalopathy (DPHL) 2 to 40 days post-overdose: '),
    h('a', { href: '#/neurology-care' }, isEs
      ? 'Abrir Navegador de Salud Neurológica y Lesión Cerebral →'
      : 'Open Neurological Health & Brain Injury Navigator →')
  ]);
  container.appendChild(neurologyCard);
  const metabolicCard = h('div', { class: 'info-card mt-3' }, [
    h('strong', {}, isEs ? 'Descarte de Hipoglucemia (< 50 mg/dL) y Crisis Suprarrenal: ' : 'Rule-Out Hypoglycemia (< 50 mg/dL) & Adrenal Crisis: '),
    h('span', {}, isEs
      ? 'La hipoglucemia grave simula coma por sobredosis de opioides. Mida siempre la glucemia capilar y evalúe insuficiencia suprarrenal inducida por opioides (ISIO): '
      : 'Severe hypoglycemia mimics opioid overdose coma. Always check capillary glucose immediately and evaluate for opioid-induced adrenal insufficiency (OIAI): '),
    h('a', { href: '#/metabolic-care' }, isEs
      ? 'Abrir Navegador de Emergencias Metabólicas y Endocrinas →'
      : 'Open Metabolic Emergencies & Adrenal Crisis Navigator →')
  ]);
  container.appendChild(metabolicCard);
}
