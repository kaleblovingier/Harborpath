// public/js/views/familySupport.js
// HarborPath Family Support, CRAFT Framework & Loved One Action Plan Specialist
// Pure ES module, 0 dependencies. 100% ephemeral in-RAM clinical guidance.
// References:
// - Meyers RJ, Smith JE. Get Your Loved One Sober: Alternatives to Nagging, Pleading, and Threatening. Hazelden, 2007.
// - Smith JE, Meyers RJ. Motivating Substance Abusers to Enter Treatment: Working with Family Members. Guilford Press, 2004.
// - Roozen HG et al. A systematic review of the CRAFT approach. Addiction. 2010;105(10):1729-1738.
// - SAMHSA Supporting Family and Friends (PEP21-02-01-001)

import { h, append, icon } from '../dom.js';
import { t } from '../i18n.js';

/**
 * 7 Rules of CRAFT Positive Communication (Meyers & Smith).
 */
export const CRAFT_COMMUNICATION_RULES = Object.freeze([
  { id: 'brief', titleEn: '1. Be Brief', titleEs: '1. Sea Breve', ruleEn: 'Keep conversations short and focused. Avoid lengthy speeches, dredging up the past, or lecturing.', ruleEs: 'Mantenga las conversaciones cortas y enfocadas. Evite discursos largos o recordar el pasado.' },
  { id: 'positive', titleEn: '2. Be Positive', titleEs: '2. Sea Positivo/a', ruleEn: 'Frame requests around what you want rather than what you do not want. Focus on constructive solutions.', ruleEs: 'Enfoque las peticiones en lo que desea en lugar de lo que no desea. Busque soluciones constructivas.' },
  { id: 'specific', titleEn: '3. Be Specific and Clear', titleEs: '3. Sea Específico/a y Claro/a', ruleEn: 'Address one single behavior at a time. Avoid vague complaints like "You need to fix your life."', ruleEs: 'Aborde un comportamiento a la vez. Evite quejas vagas como "Tienes que arreglar tu vida".' },
  { id: 'label_feelings', titleEn: '4. Label Your Feelings', titleEs: '4. Exprese sus Sentimientos', ruleEn: 'Use calm "I" statements ("I felt scared", "I worry") rather than accusatory "You always..." statements.', ruleEs: 'Use declaraciones con "Yo" ("Sentí miedo", "Me preocupo") en lugar de acusar ("Tú siempre...").' },
  { id: 'understanding', titleEn: '5. Offer an Understanding Statement', titleEs: '5. Ofrezca Empatía y Comprensión', ruleEn: 'Acknowledge their perspective or stress before making a request ("I know you have had intense pressure at work...").', ruleEs: 'Reconozca su perspectiva o estrés antes de pedir algo ("Sé que has tenido mucha presión laboral...").' },
  { id: 'partial_responsibility', titleEn: '6. Take Partial Responsibility', titleEs: '6. Asuma Responsabilidad Parcial', ruleEn: 'Acknowledge your own contribution to tension or miscommunication ("I know I have been reactive lately...").', ruleEs: 'Reconozca su propia parte en la tensión ("Sé que últimamente he reaccionado mal...").' },
  { id: 'offer_help', titleEn: '7. Offer to Help / Suggest a Step', titleEs: '7. Ofrezca Ayuda o un Siguiente Paso', ruleEn: 'Propose a specific, collaborative next step without demanding immediate perfection ("Would you be open to talking to a doctor with me?").', ruleEs: 'Proponga un paso colaborativo específico sin exigir perfección ("¿Estarías dispuesto/a a consultar un médico conmigo?").' }
]);

/**
 * Common enabling behaviors vs natural consequences framework.
 */
export const NATURAL_CONSEQUENCES_MATRIX = Object.freeze([
  {
    enablingEn: 'Calling an employer, school, or court to make excuses or lie for them.',
    enablingEs: 'Llamar a un empleador, escuela o tribunal para inventar excusas o mentir por ellos.',
    consequenceEn: 'Allow them to face their own responsibilities. Let them make the call and experience the reality of missed commitments.',
    consequenceEs: 'Permita que enfrenten sus responsabilidades. Deje que hagan la llamada y experimenten la consecuencia de sus ausencias.'
  },
  {
    enablingEn: 'Cleaning up alcohol bottles, drug paraphernalia, or messes while they are sleeping or unconscious.',
    enablingEs: 'Limpiar botellas, parafernalia o desastres mientras duermen o están inconscientes.',
    consequenceEn: 'Leave the environment as it is so they see the direct, sober aftermath of their substance use the following morning.',
    consequenceEs: 'Deje el lugar tal como está para que vean directamente el resultado de su consumo al despertar sobrios.'
  },
  {
    enablingEn: 'Giving cash, paying rent, or covering debts without accountability.',
    enablingEs: 'Dar dinero en efectivo, pagar alquileres o cubrir deudas sin rendición de cuentas.',
    consequenceEn: 'Pay critical bills directly to utility/landlord if necessary for family survival, but never give direct cash or cover elective debts.',
    consequenceEs: 'Pague facturas directamente a los proveedores si es necesario para el hogar, pero nunca entregue dinero en efectivo.'
  },
  {
    enablingEn: 'Arguing, yelling, or lecturing while the loved one is intoxicated or high.',
    enablingEs: 'Discutir, gritar o dar lecciones morales mientras la persona está intoxicada.',
    consequenceEn: 'Disengage calmly when they are using ("We will talk when you are sober"). Save conversations for sober, calm windows.',
    consequenceEs: 'Retírese con calma cuando estén consumiendo ("Hablaremos cuando estés sobrio/a"). Guarde las conversaciones para momentos de calma.'
  }
]);

/**
 * Evaluates family safety and potential domestic violence red flags.
 *
 * @param {Object} params
 * @param {boolean} [params.hasPhysicalViolence=false]
 * @param {boolean} [params.hasThreats=false]
 * @param {boolean} [params.hasWeaponConcern=false]
 * @returns {Object} Safety evaluation with urgency and national crisis directives.
 */
export function evaluateFamilySafety({ hasPhysicalViolence = false, hasThreats = false, hasWeaponConcern = false } = {}) {
  const isDanger = Boolean(hasPhysicalViolence || hasThreats || hasWeaponConcern);

  if (isDanger) {
    return {
      isSafe: false,
      severity: 'emergency_safety_escalation',
      titleEn: 'IMMEDIATE SAFETY PRIORITY: Domestic Violence & Harm Risk',
      titleEs: 'PRIORIDAD INMEDIATA DE SEGURIDAD: Riesgo de Violencia Doméstica',
      textEn: 'When physical violence, threats, intimidation, or weapons are present, all CRAFT coaching and communication attempts MUST pause. Your personal safety and the safety of any children in the home take absolute priority.',
      textEs: 'Cuando hay violencia física, amenazas, intimidación o armas, todo intento de diálogo o CRAFT DEBE pausarse. Su seguridad personal y la de los menores en el hogar es la prioridad absoluta.',
      actionDirectivesEn: [
        'Call 911 immediately if you or family members are in imminent physical danger.',
        'National Domestic Violence Hotline: Call 1-800-799-SAFE (7233) or text "START" to 88788 for free, confidential 24/7 safety planning and shelter support.',
        'Create a personal exit plan: have a secure place to stay, keep emergency cash and car keys ready, and identify trusted allies.'
      ],
      actionDirectivesEs: [
        'Llame al 911 de inmediato si usted o sus familiares están en peligro físico inminente.',
        'Línea Nacional de Violencia Doméstica: Llame al 1-800-799-7233 o envíe "START" al 88788 para apoyo y refugio 24/7 confidencial.',
        'Cree un plan de escape seguro: tenga un lugar a donde ir, llaves del auto y dinero de emergencia preparados.'
      ]
    };
  }

  return {
    isSafe: true,
    severity: 'safe_for_craft',
    titleEn: 'Safety Clear: Appropriate for CRAFT Family Strategies',
    titleEs: 'Seguridad Adecuada: Apropiado para Estrategias CRAFT',
    textEn: 'No acute physical danger reported. You are in an appropriate position to apply positive communication, natural consequences, and supportive treatment invitation strategies.',
    textEs: 'No se reporta peligro físico agudo. Se encuentra en condiciones adecuadas para aplicar comunicación positiva, consecuencias naturales e invitación al tratamiento.',
    actionDirectivesEn: [
      'Focus on timing: hold important discussions only when your loved one is sober, calm, and receptive.',
      'Practice non-judgmental "I" statements using the CRAFT communication generator below.'
    ],
    actionDirectivesEs: [
      'Cuide el momento: converse solo cuando su ser querido esté sobrio, tranquilo y receptivo.',
      'Practique declaraciones con "Yo" no acusatorias usando el generador de diálogo CRAFT.'
    ]
  };
}

/**
 * Builds an individualized CRAFT positive communication script.
 *
 * @param {Object} params
 * @param {string} [params.situation] Description of the trigger or situation.
 * @param {string} [params.understandingStatement] Empathetic observation.
 * @param {string} [params.feelingStatement] "I" feeling expression.
 * @param {string} [params.specificRequest] Clear, positive request.
 * @param {string} [params.offerOfSupport] Offer to assist.
 * @returns {string} Formatted script ready for practice.
 */
export function buildCraftScript({
  situation = '',
  understandingStatement = '',
  feelingStatement = '',
  specificRequest = '',
  offerOfSupport = ''
} = {}) {
  const parts = [];

  if (understandingStatement.trim()) {
    parts.push(understandingStatement.trim());
  }

  if (feelingStatement.trim()) {
    parts.push(feelingStatement.trim());
  }

  if (specificRequest.trim()) {
    parts.push(specificRequest.trim());
  }

  if (offerOfSupport.trim()) {
    parts.push(offerOfSupport.trim());
  }

  return parts.join(' ');
}

/**
 * Format complete bilingual plain-text summary of CRAFT family plan.
 *
 * @param {Object} state In-RAM state.
 * @param {string} [lang='en'] 'en' | 'es'.
 * @returns {string}
 */
export function formatCraftSummaryText(state = {}, lang = 'en') {
  const isEs = lang === 'es';
  const safety = evaluateFamilySafety({
    hasPhysicalViolence: state.hasViolence,
    hasThreats: state.hasThreats,
    hasWeaponConcern: state.hasWeapons
  });

  const lines = [
    '================================================================',
    isEs
      ? 'HARBORPATH: PLAN DE APOYO FAMILIAR Y ESTRATEGIA CRAFT'
      : 'HARBORPATH: FAMILY SUPPORT & CRAFT ACTION PLAN',
    '================================================================',
    isEs
      ? 'Privado, confidencial, 100% en memoria RAM. Cero datos almacenados.'
      : 'Private, confidential, 100% in-RAM. Zero data retained.',
    '',
    isEs ? '1. EVALUACIÓN DE SEGURIDAD EN EL HOGAR:' : '1. HOME SAFETY EVALUATION:',
    `   ${isEs ? 'Estado' : 'Status'}: ${isEs ? safety.titleEs : safety.titleEn}`,
    `   ${isEs ? 'Guía' : 'Directive'}: ${isEs ? safety.textEs : safety.textEn}`,
    ''
  ];

  if (!safety.isSafe) {
    lines.push(isEs ? '   DIRECTIVAS DE EMERGENCIA:' : '   EMERGENCY DIRECTIVES:');
    for (const d of (isEs ? safety.actionDirectivesEs : safety.actionDirectivesEn)) {
      lines.push(`   ! ${d}`);
    }
    lines.push('');
  }

  lines.push(isEs ? '2. GUIÓN DE COMUNICACIÓN POSITIVA CRAFT:' : '2. CRAFT POSITIVE COMMUNICATION SCRIPT:');
  const script = buildCraftScript({
    understandingStatement: state.understandingStatement,
    feelingStatement: state.feelingStatement,
    specificRequest: state.specificRequest,
    offerOfSupport: state.offerOfSupport
  });

  if (script) {
    lines.push(`   "${script}"`);
  } else {
    lines.push(isEs ? '   (No se ha redactado ningún guión todavía)' : '   (No script drafted yet)');
  }

  lines.push('');
  lines.push(isEs ? '3. LÍMITES PERSONALES Y CONSECUENCIAS NATURALES:' : '3. PERSONAL BOUNDARIES & NATURAL CONSEQUENCES:');
  for (const item of NATURAL_CONSEQUENCES_MATRIX) {
    lines.push(`   * [${isEs ? 'En lugar de' : 'Instead of'}]: ${isEs ? item.enablingEs : item.enablingEn}`);
    lines.push(`     [${isEs ? 'Consecuencia natural' : 'Natural consequence'}]: ${isEs ? item.consequenceEs : item.consequenceEn}`);
  }

  lines.push('');
  lines.push(isEs ? '4. REDES DE APOYO PARA FAMILIARES Y SERES QUERIDOS:' : '4. RECOVERY SUPPORT FOR FAMILIES & LOVED ONES:');
  lines.push('   - SMART Recovery Family & Friends (smartrecovery.org/family)');
  lines.push('   - Al-Anon Family Groups (al-anon.org)');
  lines.push('   - Nar-Anon Family Groups (nar-anon.org)');
  lines.push('   - Partnership to End Addiction (drugfree.org) / Helpline: 1-855-378-4373');
  lines.push('   - Never Use Alone (neverusealone.com) / 1-877-696-1996');

  lines.push('');
  lines.push('----------------------------------------------------------------');
  lines.push(
    isEs
      ? 'Aviso: Esta herramienta es educativa y no sustituye terapia familiar ni asesoramiento legal.'
      : 'Disclaimer: This tool is educational and does not replace family therapy or legal counsel.'
  );
  lines.push('================================================================');

  return lines.join('\n');
}

// In-RAM Ephemeral State Management (Deterministic Reset for Quick Exit)
const defaultState = () => ({
  hasViolence: false,
  hasThreats: false,
  hasWeapons: false,
  understandingStatement: 'I know you have been under immense pressure at work lately.',
  feelingStatement: 'I felt really scared and worried when you came home late last night.',
  specificRequest: 'I would really appreciate it if we could have a calm conversation on Saturday morning.',
  offerOfSupport: 'I am happy to look up a doctor with you or just listen.',
  activeTab: 'communication'
});

let inMemoryState = defaultState();

export function getFamilyState() {
  return { ...inMemoryState };
}

export function setFamilyState(partial = {}) {
  inMemoryState = { ...inMemoryState, ...partial };
  return getFamilyState();
}

export function resetFamilyState() {
  inMemoryState = defaultState();
  return getFamilyState();
}

/**
 * Renders the accessible WCAG 2.2 AA compliant Family Support View.
 *
 * @returns {HTMLElement}
 */
export function familySupportView() {
  const container = h('div', { class: 'view family-support-view' });

  // Header
  const header = h('header', { class: 'view-header' },
    h('h1', null, t('family.title', 'Family Support & CRAFT Action Guide')),
    h('p', { class: 'lead' }, t('family.lead', 'Evidence-based tools for concerned family members and friends. Use Community Reinforcement and Family Training (CRAFT) to improve communication, set healthy boundaries, and guide a loved one toward care.'))
  );
  container.append(header);

  // Safety Banner Check
  const safetyBanner = h('div', { class: 'safety-check-region', 'aria-live': 'polite' });

  function updateSafetyBanner() {
    const safety = evaluateFamilySafety({
      hasPhysicalViolence: inMemoryState.hasViolence,
      hasThreats: inMemoryState.hasThreats,
      hasWeaponConcern: inMemoryState.hasWeapons
    });

    safetyBanner.replaceChildren();

    if (!safety.isSafe) {
      safetyBanner.append(
        h('div', { class: 'alert-callout danger' },
          h('h3', null, safety.titleEn),
          h('p', null, safety.textEn),
          h('ul', null, ...safety.actionDirectivesEn.map((d) => h('li', null, d)))
        )
      );
    }
  }

  updateSafetyBanner();
  container.append(safetyBanner);

  // Tab Navigation
  const tabList = h('div', { class: 'tab-nav', role: 'tablist', 'aria-label': 'Family CRAFT Sections' });
  const tabCommBtn = h('button', {
    class: `tab-btn ${inMemoryState.activeTab === 'communication' ? 'active' : ''}`,
    role: 'tab',
    id: 'tab-comm-btn',
    'aria-selected': String(inMemoryState.activeTab === 'communication'),
    'aria-controls': 'tab-comm-panel'
  }, t('family.tab.communication', 'Positive Communication Script'));

  const tabBoundariesBtn = h('button', {
    class: `tab-btn ${inMemoryState.activeTab === 'boundaries' ? 'active' : ''}`,
    role: 'tab',
    id: 'tab-boundaries-btn',
    'aria-selected': String(inMemoryState.activeTab === 'boundaries'),
    'aria-controls': 'tab-boundaries-panel'
  }, t('family.tab.boundaries', 'Natural Consequences & Boundaries'));

  const tabSafetyBtn = h('button', {
    class: `tab-btn ${inMemoryState.activeTab === 'safety' ? 'active' : ''}`,
    role: 'tab',
    id: 'tab-safety-btn',
    'aria-selected': String(inMemoryState.activeTab === 'safety'),
    'aria-controls': 'tab-safety-panel'
  }, t('family.tab.safety', 'Safety & Crisis Planning'));

  tabList.append(tabCommBtn, tabBoundariesBtn, tabSafetyBtn);
  container.append(tabList);

  const panelsContainer = h('div', { class: 'tab-panels' });

  // ---------------- Tab 1: Positive Communication Script Builder ----------------
  const panelComm = h('div', {
    class: `tab-panel ${inMemoryState.activeTab === 'communication' ? 'active' : ''}`,
    role: 'tabpanel',
    id: 'tab-comm-panel',
    'aria-labelledby': 'tab-comm-btn',
    hidden: inMemoryState.activeTab !== 'communication'
  });

  const commIntro = h('article', { class: 'card' },
    h('h2', null, 'The 7 CRAFT Rules of Positive Communication'),
    h('p', null, 'Confrontations, interventions, and ultimatums often increase defensiveness and push loved ones further away. CRAFT teaches clear, calm, and loving communication that fosters connection and invites change.'),
    h('div', { class: 'craft-rules-grid' },
      ...CRAFT_COMMUNICATION_RULES.map((rule) =>
        h('div', { class: 'rule-card' },
          h('strong', null, rule.titleEn),
          h('p', null, rule.ruleEn)
        )
      )
    )
  );

  const scriptForm = h('div', { class: 'card interactive-calc' },
    h('h3', null, 'Build Your Conversation Script'),
    h('p', null, 'Draft a brief conversation opener following CRAFT principles. Practice reading it aloud before speaking to your loved one when they are sober and calm.'),
    h('div', { class: 'form-group' },
      h('label', { for: 'script-understanding' }, '1. Understanding Statement (Acknowledge their stress or point of view):'),
      h('input', {
        type: 'text',
        id: 'script-understanding',
        class: 'input',
        value: inMemoryState.understandingStatement
      })
    ),
    h('div', { class: 'form-group' },
      h('label', { for: 'script-feeling' }, '2. "I" Feeling Statement (Express how you feel without blaming):'),
      h('input', {
        type: 'text',
        id: 'script-feeling',
        class: 'input',
        value: inMemoryState.feelingStatement
      })
    ),
    h('div', { class: 'form-group' },
      h('label', { for: 'script-request' }, '3. Specific Positive Request (Ask for one clear, manageable action):'),
      h('input', {
        type: 'text',
        id: 'script-request',
        class: 'input',
        value: inMemoryState.specificRequest
      })
    ),
    h('div', { class: 'form-group' },
      h('label', { for: 'script-support' }, '4. Offer of Support (Offer collaboration or listening):'),
      h('input', {
        type: 'text',
        id: 'script-support',
        class: 'input',
        value: inMemoryState.offerOfSupport
      })
    )
  );

  const scriptPreview = h('div', { class: 'card script-preview-card', 'aria-live': 'polite' });

  function updateScriptPreview() {
    const fullScript = buildCraftScript({
      understandingStatement: inMemoryState.understandingStatement,
      feelingStatement: inMemoryState.feelingStatement,
      specificRequest: inMemoryState.specificRequest,
      offerOfSupport: inMemoryState.offerOfSupport
    });

    scriptPreview.replaceChildren();
    scriptPreview.append(
      h('h3', null, 'Script Preview:'),
      h('blockquote', { class: 'callout script-text' }, `"${fullScript}"`),
      h('p', { class: 'fine' }, 'Tip: Wait for a quiet moment when both of you are calm and free of distractions. If your loved one becomes angry or defensive, calmly disengage and try again another day.')
    );
  }

  updateScriptPreview();
  panelComm.append(commIntro, scriptForm, scriptPreview);

  // ---------------- Tab 2: Natural Consequences & Boundaries ----------------
  const panelBoundaries = h('div', {
    class: `tab-panel ${inMemoryState.activeTab === 'boundaries' ? 'active' : ''}`,
    role: 'tabpanel',
    id: 'tab-boundaries-panel',
    'aria-labelledby': 'tab-boundaries-btn',
    hidden: inMemoryState.activeTab !== 'boundaries'
  });

  const boundariesIntro = h('article', { class: 'card' },
    h('h2', null, 'Stepping Back: Natural Consequences vs. Enabling'),
    h('p', null, 'Loving families often cushion the impact of addiction out of love, fear, or shame. However, protecting a loved one from the natural consequences of their use removes the discomfort that often motivates people to seek recovery.'),
    h('div', { class: 'table-scroll', tabindex: '0', role: 'region', 'aria-label': 'Enabling vs Consequences' },
      h('table', { class: 'data-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, 'Common Protective / Enabling Action'),
            h('th', null, 'CRAFT Alternative (Allowing Natural Consequences)')
          )
        ),
        h('tbody', null,
          ...NATURAL_CONSEQUENCES_MATRIX.map((row) =>
            h('tr', null,
              h('td', null, row.enablingEn),
              h('td', null, row.consequenceEn)
            )
          )
        )
      )
    )
  );
  panelBoundaries.append(boundariesIntro);

  // ---------------- Tab 3: Safety & Crisis Planning ----------------
  const panelSafety = h('div', {
    class: `tab-panel ${inMemoryState.activeTab === 'safety' ? 'active' : ''}`,
    role: 'tabpanel',
    id: 'tab-safety-panel',
    'aria-labelledby': 'tab-safety-btn',
    hidden: inMemoryState.activeTab !== 'safety'
  });

  const safetyForm = h('div', { class: 'card interactive-calc' },
    h('h2', null, 'Home Safety & Violence Screening'),
    h('p', null, 'Answer honestly. Your selections stay entirely in private RAM on your device:'),
    h('div', { class: 'form-group checkbox-group' },
      h('label', null,
        h('input', { type: 'checkbox', id: 'safety-violence-check', checked: inMemoryState.hasViolence }),
        ' Physical violence has occurred or been attempted'
      )
    ),
    h('div', { class: 'form-group checkbox-group' },
      h('label', null,
        h('input', { type: 'checkbox', id: 'safety-threats-check', checked: inMemoryState.hasThreats }),
        ' Threats of violence, severe destruction of property, or extreme intimidation'
      )
    ),
    h('div', { class: 'form-group checkbox-group' },
      h('label', null,
        h('input', { type: 'checkbox', id: 'safety-weapons-check', checked: inMemoryState.hasWeapons }),
        ' Presence of or access to firearms / weapons during intoxication'
      )
    )
  );

  const naloxoneFamilyCard = h('article', { class: 'card' },
    h('h3', null, 'Take-Home Naloxone for Family Members'),
    h('p', null, 'Keeping naloxone (Narcan) in the home saves lives. You do not need a doctor’s prescription to buy it at pharmacies across all 50 states, DC, and Puerto Rico under standing order laws.'),
    h('p', null, 'How to talk about having naloxone at home without conflict: "I keep a first aid kit in the house for unexpected emergencies. I want to have naloxone here too because I love you and want our home to be safe for everyone."'),
    h('p', null,
      h('a', { class: 'btn btn-secondary', href: '#/overdose' }, 'Review Step-by-Step Overdose Response')
    )
  );

  panelSafety.append(safetyForm, naloxoneFamilyCard);

  panelsContainer.append(panelComm, panelBoundaries, panelSafety);
  container.append(panelsContainer);

  // Actions Card
  const actionsCard = h('div', { class: 'card action-bar' },
    h('h3', null, 'Save and Review Your Plan'),
    h('p', null, 'Copy an anonymous, zero-PII plain text summary of your communication script, boundaries, and safety resources.'),
    h('div', { class: 'btn-group' },
      h('button', { type: 'button', class: 'btn btn-primary', id: 'btn-copy-family-summary' }, 'Copy Plain-Text Plan'),
      h('button', { type: 'button', class: 'btn btn-secondary', id: 'btn-reset-family' }, 'Reset In-Memory Data')
    ),
    h('span', { id: 'family-copy-status', class: 'sr-only', role: 'status', 'aria-live': 'polite' })
  );
  container.append(actionsCard);

  // Tab switcher
  function switchTab(newTab) {
    inMemoryState.activeTab = newTab;
    tabCommBtn.classList.toggle('active', newTab === 'communication');
    tabCommBtn.setAttribute('aria-selected', String(newTab === 'communication'));
    panelComm.hidden = newTab !== 'communication';
    panelComm.classList.toggle('active', newTab === 'communication');

    tabBoundariesBtn.classList.toggle('active', newTab === 'boundaries');
    tabBoundariesBtn.setAttribute('aria-selected', String(newTab === 'boundaries'));
    panelBoundaries.hidden = newTab !== 'boundaries';
    panelBoundaries.classList.toggle('active', newTab === 'boundaries');

    tabSafetyBtn.classList.toggle('active', newTab === 'safety');
    tabSafetyBtn.setAttribute('aria-selected', String(newTab === 'safety'));
    panelSafety.hidden = newTab !== 'safety';
    panelSafety.classList.toggle('active', newTab === 'safety');
  }

  tabCommBtn.addEventListener('click', () => switchTab('communication'));
  tabBoundariesBtn.addEventListener('click', () => switchTab('boundaries'));
  tabSafetyBtn.addEventListener('click', () => switchTab('safety'));

  // Script inputs
  panelComm.querySelector('#script-understanding').addEventListener('input', (e) => {
    inMemoryState.understandingStatement = e.target.value;
    updateScriptPreview();
  });
  panelComm.querySelector('#script-feeling').addEventListener('input', (e) => {
    inMemoryState.feelingStatement = e.target.value;
    updateScriptPreview();
  });
  panelComm.querySelector('#script-request').addEventListener('input', (e) => {
    inMemoryState.specificRequest = e.target.value;
    updateScriptPreview();
  });
  panelComm.querySelector('#script-support').addEventListener('input', (e) => {
    inMemoryState.offerOfSupport = e.target.value;
    updateScriptPreview();
  });

  // Safety checkboxes
  panelSafety.querySelector('#safety-violence-check').addEventListener('change', (e) => {
    inMemoryState.hasViolence = e.target.checked;
    updateSafetyBanner();
  });
  panelSafety.querySelector('#safety-threats-check').addEventListener('change', (e) => {
    inMemoryState.hasThreats = e.target.checked;
    updateSafetyBanner();
  });
  panelSafety.querySelector('#safety-weapons-check').addEventListener('change', (e) => {
    inMemoryState.hasWeapons = e.target.checked;
    updateSafetyBanner();
  });

  // Copy and Reset
  const copyBtn = actionsCard.querySelector('#btn-copy-family-summary');
  const copyStatus = actionsCard.querySelector('#family-copy-status');
  copyBtn.addEventListener('click', async () => {
    const text = formatCraftSummaryText(inMemoryState, 'en');
    try {
      await navigator.clipboard.writeText(text);
      copyStatus.textContent = 'Plan copied to clipboard.';
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy Plain-Text Plan'; }, 2000);
    } catch {
      copyStatus.textContent = 'Unable to access clipboard.';
    }
  });

  const resetBtn = actionsCard.querySelector('#btn-reset-family');
  resetBtn.addEventListener('click', () => {
    resetFamilyState();
    panelComm.querySelector('#script-understanding').value = inMemoryState.understandingStatement;
    panelComm.querySelector('#script-feeling').value = inMemoryState.feelingStatement;
    panelComm.querySelector('#script-request').value = inMemoryState.specificRequest;
    panelComm.querySelector('#script-support').value = inMemoryState.offerOfSupport;
    panelSafety.querySelector('#safety-violence-check').checked = false;
    panelSafety.querySelector('#safety-threats-check').checked = false;
    panelSafety.querySelector('#safety-weapons-check').checked = false;
    updateScriptPreview();
    updateSafetyBanner();
  });

  return container;
}
