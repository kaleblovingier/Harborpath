import { h, icon, tel } from '../dom.js';
import { state } from '../state.js';
import { t } from '../i18n.js';

let isDrawerOpen = false;
let drawerWrapperEl = null;
let previousActiveEl = null;
const registeredTriggers = new Set();
let drawerKeydownBound = false;

function updateClass(el, className, active) {
  if (!el) return;
  if (el.classList && typeof el.classList.toggle === 'function') {
    el.classList.toggle(className, active);
  } else {
    const raw = (el.className || (typeof el.getAttribute === 'function' ? el.getAttribute('class') : '') || '');
    const classes = raw.split(/\s+/).filter(Boolean);
    const idx = classes.indexOf(className);
    if (active && idx === -1) {
      classes.push(className);
      const val = classes.join(' ');
      el.className = val;
      if (typeof el.setAttribute === 'function') el.setAttribute('class', val);
    } else if (!active && idx !== -1) {
      classes.splice(idx, 1);
      const val = classes.join(' ');
      el.className = val;
      if (typeof el.setAttribute === 'function') el.setAttribute('class', val);
    }
  }
}

/** Card 1: Naloxone & Rescue Breathing Pacing */
export function buildNaloxonePacingCard(options = {}) {
  const heading = h(
    'h3',
    { class: 'card-heading', id: options.headingId || 'naloxone-card-title' },
    icon('activity', 'Activity'),
    h('span', null, t('emergency.naloxoneTitle', 'Naloxone & Rescue Breathing Pacing'))
  );

  const steps = [
    {
      num: '1',
      title: t('emergency.step1Title', 'Check responsiveness'),
      desc: t(
        'emergency.step1Desc',
        'Shout their name loudly and rub their breastbone (sternum) firmly with your knuckles. Check for limpness, unresponsiveness, slow or stopped breathing, or pale/blue/gray lips.'
      ),
    },
    {
      num: '2',
      title: t('emergency.step2Title', 'Spray 4mg naloxone in 1 nostril'),
      desc: t(
        'emergency.step2Desc',
        'Peel open blister pack. Tilt head back. Insert nozzle into 1 nostril until your fingers touch the bottom of their nose. Press plunger firmly with thumb until it clicks.'
      ),
    },
    {
      num: '3',
      title: t('emergency.step3Title', 'Rescue breathing 1 breath every 5 seconds'),
      desc: t(
        'emergency.step3Desc',
        'Tilt head back, lift chin, pinch nose shut. Seal your mouth completely over theirs and give 1 breath every 5 seconds (10–12 breaths per minute). Watch chest rise.'
      ),
    },
    {
      num: '4',
      title: t('emergency.step4Title', 'Repeat in 2-3 min if no response'),
      desc: t(
        'emergency.step4Desc',
        'Naloxone takes 2 to 3 minutes to activate. If there is no response or breathing is still shallow after 2–3 minutes, give a second 4mg dose in the OTHER nostril. Continue rescue breathing until paramedics arrive.'
      ),
    },
  ];

  const listItems = steps.map((s) =>
    h(
      'li',
      { class: 'pacer-step-item' },
      h('span', { class: 'pacer-step-num', 'aria-hidden': 'true' }, s.num),
      h(
        'div',
        { class: 'pacer-step-content' },
        h('div', { class: 'pacer-step-title' }, s.title),
        h('p', { class: 'pacer-step-desc' }, s.desc)
      )
    )
  );

  const stepsList = h('ol', { class: 'pacer-steps-list', 'aria-label': 'Naloxone and rescue breathing steps' }, ...listItems);

  const pacerGuide = h(
    'div',
    {
      class: 'pacer-pulse-guide',
      role: 'timer',
      'aria-live': 'polite',
      'aria-label': 'Rescue breathing 5-second pacing guide',
    },
    t('emergency.pacerGuide', 'Rescue Breathing Rhythm: 1 breath every 5 seconds (Breathe... 2... 3... 4... 5... Breathe)')
  );

  return h(
    'section',
    {
      class: 'emergency-drawer-card naloxone-pacing-card print-handout',
      'aria-labelledby': options.headingId || 'naloxone-card-title',
    },
    heading,
    stepsList,
    pacerGuide
  );
}

/** Card 2: Opioid vs. Stimulant Overdose Matrix */
export function buildOverdoseMatrixCard(options = {}) {
  const heading = h(
    'h3',
    { class: 'card-heading', id: options.headingId || 'matrix-card-title' },
    icon('alert', 'Alert'),
    h('span', null, t('emergency.matrixTitle', 'Opioid vs. Stimulant Overdose Matrix'))
  );

  const subtitle = h(
    'p',
    { class: 'card-subtitle' },
    t('emergency.matrixSubtitle', 'Identify signs quickly to deliver the right life-saving intervention:')
  );

  const thead = h(
    'thead',
    null,
    h(
      'tr',
      null,
      h('th', { scope: 'col' }, t('emergency.thFeature', 'Sign / Feature')),
      h('th', { scope: 'col', class: 'matrix-opioid-col' }, t('emergency.thOpioid', 'Opioid Overdose (Downer)')),
      h('th', { scope: 'col', class: 'matrix-stimulant-col' }, t('emergency.thStimulant', 'Stimulant Overdose (Upper / Overamping)'))
    )
  );

  const rowsData = [
    {
      feature: t('emergency.featurePupils', 'Pupils'),
      opioid: t('emergency.opioidPupils', 'Pinpoint pupils (tiny, constricted)'),
      stimulant: t('emergency.stimPupils', 'Dilated pupils (large, wide)'),
    },
    {
      feature: t('emergency.featureBreathing', 'Breathing'),
      opioid: t('emergency.opioidBreathing', 'Slow/no breathing, shallow gasps, choking sounds, or snoring death rattle'),
      stimulant: t('emergency.stimBreathing', 'Rapid breathing/tachycardia, hyperventilation, or shortness of breath'),
    },
    {
      feature: t('emergency.featureSkin', 'Skin & Lips'),
      opioid: t('emergency.opioidSkin', 'Pale/blue lips, gray/ashen nailbeds, cold clammy skin'),
      stimulant: t('emergency.stimSkin', 'Hot/sweaty skin, flushed face, profuse sweating, severe hyperthermia'),
    },
    {
      feature: t('emergency.featureBody', 'Body State'),
      opioid: t('emergency.opioidBody', 'Limp body, unresponsive, deep coma'),
      stimulant: t('emergency.stimBody', 'Severe agitation, paranoia, hallucinations, tremors, or seizures'),
    },
    {
      feature: t('emergency.featureAction', 'Immediate Action'),
      opioid: t('emergency.opioidAction', 'Naloxone works for opioids. Give 4mg spray immediately and start rescue breathing.'),
      stimulant: t('emergency.stimAction', 'Supportive cooling/hydration for stimulants. Calm quiet space. Call 911 if chest pain or seizure.'),
    },
  ];

  const tbodyRows = rowsData.map((row) =>
    h(
      'tr',
      null,
      h('th', { scope: 'row' }, row.feature),
      h('td', { class: 'matrix-opioid-col' }, row.opioid),
      h('td', { class: 'matrix-stimulant-col' }, row.stimulant)
    )
  );

  const tbody = h('tbody', null, ...tbodyRows);

  const table = h(
    'table',
    {
      class: 'overdose-matrix-table',
      role: 'table',
      'aria-label': 'Comparison matrix: Opioid overdose signs versus Stimulant overdose signs',
    },
    thead,
    tbody
  );

  const tableWrap = h('div', { class: 'matrix-table-wrap', tabindex: '0', role: 'region', 'aria-label': 'Overdose comparison table' }, table);

  const crossNote = h(
    'p',
    { class: 'good-samaritan-legal-note callout-emergency' },
    h('strong', null, t('emergency.matrixRuleTitle', 'Crucial Rule: ')),
    t(
      'emergency.matrixRuleText',
      'If unsure or if fentanyl contamination is possible, ALWAYS give naloxone. Naloxone works for opioids and will not harm someone experiencing a stimulant overamp.'
    )
  );

  return h(
    'section',
    {
      class: 'emergency-drawer-card overdose-matrix-card print-handout',
      'aria-labelledby': options.headingId || 'matrix-card-title',
    },
    heading,
    subtitle,
    tableWrap,
    crossNote
  );
}

/** Card 3: 911 Good Samaritan Script */
export function buildGoodSamaritanCard(options = {}) {
  const heading = h(
    'h3',
    { class: 'card-heading', id: options.headingId || 'script-card-title' },
    icon('phone', 'Phone'),
    h('span', null, t('emergency.scriptTitle', '911 Good Samaritan Script'))
  );

  const locationText = state.location?.label || '[Location]';
  const scriptContent = `“I am at ${locationText}. A person is unresponsive and not breathing. Medical help is needed immediately.”`;

  const quoteBox = h(
    'blockquote',
    {
      class: 'script-quote-box',
      'aria-label': 'Exact words to speak to 911 dispatcher',
    },
    scriptContent
  );

  const tips = h(
    'ul',
    { class: 'script-tips-list' },
    h('li', null, t('emergency.tip1', 'Put phone on speaker so your hands remain free for naloxone and rescue breathing.')),
    h('li', null, t('emergency.tip2', 'Focus on medical symptoms: unresponsive, not breathing, needs immediate emergency medical help.')),
    h('li', null, t('emergency.tip3', 'Give exact street address, apartment number, or nearest intersection/landmark.'))
  );

  const legalProtection = h(
    'p',
    { class: 'good-samaritan-legal-note' },
    h('strong', null, t('emergency.legalTitle', 'Good Samaritan Legal Protection: ')),
    t(
      'emergency.legalText',
      'All 50 states and DC provide Good Samaritan protections from criminal arrest and drug possession prosecution when calling 911 to save someone experiencing an overdose.'
    )
  );

  const callBtn = tel(
    '911',
    t('emergency.call911Action', 'Call 911 Now'),
    {
      class: 'btn btn-emergency btn-large',
      'aria-label': 'Call 911 immediately',
    }
  );

  const actions = h('div', { class: 'script-card-actions' }, callBtn);

  return h(
    'section',
    {
      class: 'emergency-drawer-card good-samaritan-card print-handout',
      'aria-labelledby': options.headingId || 'script-card-title',
    },
    heading,
    quoteBox,
    tips,
    legalProtection,
    actions
  );
}

export function handleDrawerKeydown(e) {
  if (!isDrawerOpen || !e) return;

  if (e.key === 'Escape') {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
    closeEmergencyDrawer();
    return;
  }

  if (e.key === 'Tab' && drawerWrapperEl) {
    const focusable = drawerWrapperEl.querySelectorAll
      ? Array.from(
          drawerWrapperEl.querySelectorAll(
            'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute?.('disabled') && !el.disabled)
      : [];

    if (focusable.length === 0) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = typeof document !== 'undefined' ? document.activeElement : null;

    if (e.shiftKey) {
      if (active === first || !drawerWrapperEl.contains(active)) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof last.focus === 'function') last.focus();
      }
    } else {
      if (active === last || !drawerWrapperEl.contains(active)) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof first.focus === 'function') first.focus();
      }
    }
  }
}

export function isEmergencyDrawerOpen() {
  return isDrawerOpen;
}

export function openEmergencyDrawer(triggerElement = null) {
  if (isDrawerOpen) return;
  isDrawerOpen = true;
  previousActiveEl = triggerElement || (typeof document !== 'undefined' ? document.activeElement : null);

  if (!drawerWrapperEl && typeof document !== 'undefined') {
    emergencyDrawer();
  }

  if (drawerWrapperEl) {
    if (typeof drawerWrapperEl.removeAttribute === 'function') {
      drawerWrapperEl.removeAttribute('hidden');
    }
    drawerWrapperEl.hidden = false;
    updateClass(drawerWrapperEl, 'open', true);
  }

  for (const trigger of registeredTriggers) {
    if (trigger && typeof trigger.setAttribute === 'function') {
      trigger.setAttribute('aria-expanded', 'true');
    }
  }

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function' && !drawerKeydownBound) {
    window.addEventListener('keydown', handleDrawerKeydown, true);
    drawerKeydownBound = true;
  }

  setTimeout(() => {
    if (drawerWrapperEl) {
      const closeBtn = drawerWrapperEl.querySelector?.('.emergency-drawer-close');
      if (closeBtn && typeof closeBtn.focus === 'function') {
        closeBtn.focus();
      }
    }
  }, 10);
}

export function closeEmergencyDrawer() {
  if (!isDrawerOpen) return;
  isDrawerOpen = false;

  if (drawerWrapperEl) {
    if (typeof drawerWrapperEl.setAttribute === 'function') {
      drawerWrapperEl.setAttribute('hidden', '');
    }
    drawerWrapperEl.hidden = true;
    updateClass(drawerWrapperEl, 'open', false);
  }

  for (const trigger of registeredTriggers) {
    if (trigger && typeof trigger.setAttribute === 'function') {
      trigger.setAttribute('aria-expanded', 'false');
    }
  }

  if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function' && drawerKeydownBound) {
    window.removeEventListener('keydown', handleDrawerKeydown, true);
    drawerKeydownBound = false;
  }

  if (previousActiveEl && typeof previousActiveEl.focus === 'function') {
    try {
      previousActiveEl.focus();
    } catch {
      /* ignore */
    }
    previousActiveEl = null;
  }
}

export function resetEmergencyDrawer() {
  closeEmergencyDrawer();
}

export function emergencyDrawer(options = {}) {
  if (drawerWrapperEl && options.singleton !== false) {
    return drawerWrapperEl;
  }

  const closeButton = h(
    'button',
    {
      type: 'button',
      class: 'emergency-drawer-close',
      'aria-label': t('common.closeEmergencyDrawer', 'Close emergency reference drawer'),
      onclick: () => closeEmergencyDrawer(),
    },
    icon('x', 'Close')
  );

  const header = h(
    'div',
    { class: 'emergency-drawer-header' },
    h(
      'div',
      { class: 'emergency-drawer-title-group' },
      icon('alert', 'Emergency Alert'),
      h('h2', { id: 'emergency-drawer-title', class: 'emergency-drawer-title' }, t('emergency.drawerTitle', 'Emergency Survival Guide'))
    ),
    closeButton
  );

  const description = h(
    'p',
    { id: 'emergency-drawer-desc', class: 'visually-hidden' },
    'Offline critical emergency survival reference: Naloxone & rescue breathing pacing, Opioid vs. Stimulant overdose matrix, and 911 Good Samaritan call script.'
  );

  const card1 = buildNaloxonePacingCard({ headingId: 'ed-naloxone-title' });
  const card2 = buildOverdoseMatrixCard({ headingId: 'ed-matrix-title' });
  const card3 = buildGoodSamaritanCard({ headingId: 'ed-script-title' });

  const body = h('div', { class: 'emergency-drawer-body' }, description, card1, card2, card3);

  const footerCloseBtn = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-ghost',
      onclick: () => closeEmergencyDrawer(),
    },
    t('common.done', 'Done')
  );

  const footerCallBtn = tel('911', t('emergency.call911Action', 'Call 911 Now'), {
    class: 'btn btn-emergency',
    'aria-label': 'Call 911 immediately',
  });

  const footer = h('div', { class: 'emergency-drawer-footer' }, footerCloseBtn, footerCallBtn);

  const drawerPanel = h(
    'div',
    {
      id: 'emergency-drawer',
      class: 'emergency-drawer',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'emergency-drawer-title',
      'aria-describedby': 'emergency-drawer-desc',
      tabindex: '-1',
    },
    header,
    body,
    footer
  );

  const backdrop = h('div', {
    class: 'emergency-drawer-backdrop',
    'aria-hidden': 'true',
    onclick: () => closeEmergencyDrawer(),
  });

  const wrapper = h(
    'div',
    {
      id: 'emergency-drawer-wrapper',
      class: 'emergency-drawer-wrapper',
      hidden: true,
    },
    backdrop,
    drawerPanel
  );

  drawerWrapperEl = wrapper;

  if (typeof document !== 'undefined' && document.body && !document.getElementById('emergency-drawer-wrapper')) {
    document.body.append(wrapper);
  }

  return wrapper;
}

export function emergencyDrawerButton(options = {}) {
  const id = options.id || 'emergency-drawer-toggle';
  const label = options.label || t('emergency.quickGuide', 'Emergency Survival Guide');

  const btn = h(
    'button',
    {
      type: 'button',
      id,
      class: options.class ? `btn btn-emergency-drawer ${options.class}` : 'btn btn-emergency-drawer',
      'aria-haspopup': 'dialog',
      'aria-expanded': isDrawerOpen ? 'true' : 'false',
      'aria-controls': 'emergency-drawer',
      onclick: () => {
        if (isEmergencyDrawerOpen()) {
          closeEmergencyDrawer();
        } else {
          openEmergencyDrawer(btn);
        }
      },
    },
    icon('alert', 'Alert'),
    h('span', null, label)
  );

  registeredTriggers.add(btn);
  btn._unsubscribeTrigger = () => registeredTriggers.delete(btn);
  return btn;
}
