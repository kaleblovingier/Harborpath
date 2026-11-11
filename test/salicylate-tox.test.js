// test/salicylate-tox.test.js
// Wave 67 Clinical Engine A: Unit, Clinical Logic, Accessibility & CSP Security Tests
// for Salicylate & NSAID Overdose, Urine Alkalinization & Pre-Intubation Airway Protection Navigator.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  SALICYLATE_PROFILES,
  SALICYLATE_RED_FLAGS,
  CARDINAL_SALICYLATE_RULES,
  calculateAlkalinizationRegimen,
  evaluateSalicylateRisk,
  formatSalicylateSbarText,
  getSalicylateToxState,
  updateSalicylateToxState,
  resetSalicylateToxState,
  subscribeSalicylateToxState,
  salicylateToxView,
  default as defaultView,
} from '../public/js/views/salicylateTox.js';
import { useDictionary } from '../public/js/i18n.js';
import es from '../public/js/locales/es.js';
import { installMockDom } from './fixtures/mockDomHelper.js';

function installEnhancedMockDom() {
  const restore = installMockDom();
  const prevClipboard = Object.getOwnPropertyDescriptor(globalThis.navigator ?? {}, 'clipboard');
  const prevActive = Object.getOwnPropertyDescriptor(globalThis.document ?? {}, 'activeElement');

  let activeEl = null;
  let copiedPayloads = [];

  Object.defineProperty(globalThis.document, 'activeElement', {
    configurable: true,
    get() {
      return activeEl;
    },
    set(v) {
      activeEl = v;
    },
  });

  // Allow focus() on mock elements to update document.activeElement and closest() for tablist keyboard tests
  const origCreateElement = globalThis.document.createElement.bind(globalThis.document);
  globalThis.document.createElement = (tag) => {
    const el = origCreateElement(tag);
    el.focus = () => {
      activeEl = el;
    };
    el.closest = (selector) => {
      let cur = el;
      const m = /^\[([^=\]]+)=["']?([^"'\]]+)["']?\]$/.exec(selector);
      while (cur) {
        if (m && cur.getAttribute?.(m[1]) === m[2]) return cur;
        cur = cur.parentNode;
      }
      return null;
    };
    return el;
  };

  // Support compound getElementById fallback via active test container if registered
  let currentRoot = null;
  globalThis.document.getElementById = (id) => {
    if (!currentRoot) return null;
    return currentRoot.querySelector(`#${id}`);
  };

  try {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: {
        writeText: async (txt) => {
          copiedPayloads.push(String(txt));
        },
      },
    });
  } catch {
    // Ignore if navigator is non-configurable in this runtime
  }

  return {
    setRoot(el) {
      currentRoot = el;
    },
    getCopiedPayloads() {
      return copiedPayloads;
    },
    restore() {
      if (prevActive) Object.defineProperty(globalThis.document, 'activeElement', prevActive);
      if (prevClipboard && globalThis.navigator) {
        try {
          Object.defineProperty(globalThis.navigator, 'clipboard', prevClipboard);
        } catch {
          // ignore
        }
      }
      restore();
    },
  };
}

test('Salicylate Tox: Module exports, profiles, red flags & cardinal rules integrity', () => {
  assert.equal(defaultView, salicylateToxView);

  const profileIds = Object.keys(SALICYLATE_PROFILES);
  assert.deepEqual(profileIds, [
    'acute_salicylate_od',
    'chronic_salicylate_toxicity',
    'methyl_salicylate_wintergreen',
    'nsaid_pepto_bismuth_mixed',
  ]);

  assert.match(SALICYLATE_PROFILES.acute_salicylate_od.doseToxicityEn, /> 150 mg\/kg.*> 300 mg\/kg.*> 500 mg\/kg/);
  assert.match(SALICYLATE_PROFILES.acute_salicylate_od.nomogramPitfallEn, /DONE NOMOGRAM UNUSABLE/i);
  assert.match(SALICYLATE_PROFILES.chronic_salicylate_toxicity.doseToxicityEn, /25–60 mg\/dL/);
  assert.match(SALICYLATE_PROFILES.chronic_salicylate_toxicity.nomogramPitfallEn, /sepsis.*dementia/i);
  assert.match(SALICYLATE_PROFILES.methyl_salicylate_wintergreen.doseToxicityEn, /1\.4 g.*5 mL.*7 g.*toddlers/i);
  assert.match(SALICYLATE_PROFILES.nsaid_pepto_bismuth_mixed.summaryEn, /ibuprofen > 400 mg\/kg.*bismuth subsalicylate/i);
  assert.match(SALICYLATE_PROFILES.nsaid_pepto_bismuth_mixed.apapScreeningEn, /Acetaminophen \(APAP\)/i);

  assert.equal(SALICYLATE_RED_FLAGS.length, 7);
  for (const flag of SALICYLATE_RED_FLAGS) {
    assert.ok(flag.id && flag.labelEn && flag.labelEs && flag.detailEn && flag.detailEs);
  }

  assert.ok(CARDINAL_SALICYLATE_RULES.length >= 6);
  for (const rule of CARDINAL_SALICYLATE_RULES) {
    assert.ok(rule.id && rule.titleEn && rule.titleEs && rule.bodyEn && rule.bodyEs);
  }
});

test('Salicylate Tox: calculateAlkalinizationRegimen weight math & Hypokalemia Block Gate', () => {
  // 1. 70 kg patient with hypokalemia K+ 3.4 -> BLOCKED unless 20-40 mEq KCl/L added
  const hypo70 = calculateAlkalinizationRegimen(70, 3.4);
  assert.equal(hypo70.weightKg, 70);
  assert.equal(hypo70.bolusMeqMin, 70);
  assert.equal(hypo70.bolusMeqMax, 140);
  assert.equal(hypo70.bolusMlMin, 70);
  assert.equal(hypo70.bolusMlMax, 140);
  assert.equal(hypo70.infusionRateMlHrMin, 105);
  assert.equal(hypo70.infusionRateMlHrMax, 140);
  assert.equal(hypo70.targetUrinePh, '7.5 - 8.0');
  assert.equal(hypo70.hypokalemiaBlocked, true);
  assert.equal(hypo70.potassiumStatus, 'hypokalemia_alkalinization_block');
  assert.equal(hypo70.kclRangeMeqPerL, '20 - 40');
  assert.match(hypo70.kGateWarningEn, /K\+.*< 4\.0.*paradoxical aciduria/i);

  // 2. Severe hypokalemia (K+ 2.6) requires 40 mEq/L + separate IV KCl
  const severeHypo = calculateAlkalinizationRegimen(70, 2.6);
  assert.equal(severeHypo.hypokalemiaBlocked, true);
  assert.equal(severeHypo.kclAddMeqPerL, 40);
  assert.equal(severeHypo.potassiumStatus, 'severe_hypokalemia_block');

  // 3. Normal K+ (4.3 mEq/L) unlocks effective alkalinization
  const normK = calculateAlkalinizationRegimen(70, 4.3);
  assert.equal(normK.hypokalemiaBlocked, false);
  assert.equal(normK.alkalinizationEffective, true);
  assert.equal(normK.potassiumStatus, 'adequate_maintain');

  // 4. Hyperkalemia (K+ 5.5) holds KCl
  const hyperK = calculateAlkalinizationRegimen(70, 5.5);
  assert.equal(hyperK.hypokalemiaBlocked, false);
  assert.equal(hyperK.kclAddMeqPerL, 0);
  assert.equal(hyperK.potassiumStatus, 'hyperkalemia_hold_kcl');

  // 5. Pediatric 12 kg toddler + AKI/Oliguria holds KCl
  const akiToddler = calculateAlkalinizationRegimen(12, 3.2, { hasAkiOrOliguria: true });
  assert.equal(akiToddler.bolusMeqMin, 12);
  assert.equal(akiToddler.bolusMeqMax, 24);
  assert.equal(akiToddler.infusionRateMlHrMin, 18);
  assert.equal(akiToddler.infusionRateMlHrMax, 24);
  assert.equal(akiToddler.kclAddMeqPerL, 0);
  assert.equal(akiToddler.potassiumStatus, 'aki_hold_kcl_dialysis');
});

test('Salicylate Tox: Risk Evaluator severity tiers, EXTRIP dialysis, Pre-Intubation & CSF Neuroglycopenia', () => {
  // Tier 1: Baseline
  const baseEval = evaluateSalicylateRisk({
    profile: 'acute_salicylate_od',
    weightKg: '70',
    salicylateLevelMgDl: '12',
    arterialPh: '7.40',
    pco2MmHg: '38',
    serumPotassiumMeq: '4.3',
    urinePh: '6.5',
    checkedFlags: [],
  });
  assert.equal(baseEval.severity, 'baseline');
  assert.equal(baseEval.requiresHemodialysis, false);
  assert.equal(baseEval.intubationGuardrail.active, false);

  // Tier 2: Urgent serial levels (mild elevation 25 mg/dL, normal pH, adequate K+)
  const serialEval = evaluateSalicylateRisk({
    profile: 'acute_salicylate_od',
    weightKg: '70',
    salicylateLevelMgDl: '25',
    arterialPh: '7.44',
    pco2MmHg: '28',
    serumPotassiumMeq: '4.2',
    checkedFlags: [],
  });
  assert.equal(serialEval.severity, 'urgent_serial_levels');
  assert.equal(serialEval.requiresHemodialysis, false);

  // Tier 3: Emergency alkalinization with K+ < 4.0 block
  const alkEval = evaluateSalicylateRisk({
    profile: 'acute_salicylate_od',
    weightKg: '70',
    salicylateLevelMgDl: '55',
    arterialPh: '7.42',
    pco2MmHg: '24',
    serumPotassiumMeq: '3.5',
    checkedFlags: [],
  });
  assert.equal(alkEval.severity, 'emergency_alkalinization');
  assert.equal(alkEval.requiresHemodialysis, false);
  assert.equal(alkEval.alkalinization.hypokalemiaBlocked, true);
  assert.ok(alkEval.alerts.some((a) => a.code === 'hypokalemia_alkalinization_block'));

  // Tier 4a: Chronic toxicity with AMS at low level (42 mg/dL) -> EXTRIP HD + CSF Neuroglycopenia
  const chronicAmsEval = evaluateSalicylateRisk({
    profile: 'chronic_salicylate_toxicity',
    weightKg: '65',
    salicylateLevelMgDl: '42',
    arterialPh: '7.36',
    pco2MmHg: '26',
    serumPotassiumMeq: '3.8',
    checkedFlags: new Set(['ams_neurotoxicity']),
  });
  assert.equal(chronicAmsEval.severity, 'emergency_hemodialysis');
  assert.equal(chronicAmsEval.requiresHemodialysis, true);
  assert.ok(chronicAmsEval.alerts.some((a) => a.code === 'csf_neuroglycopenia'));
  assert.ok(chronicAmsEval.alerts.some((a) => a.code === 'chronic_low_level_hazard'));
  assert.match(chronicAmsEval.neuroglycopeniaAlert.directiveEn, /D50W.*normal fingerstick/i);

  // Tier 4b: Vanishing respiratory compensation (pH 7.28 + pCO2 38) + Pre-intubation warning
  const airwayEval = evaluateSalicylateRisk({
    profile: 'acute_salicylate_od',
    weightKg: '80',
    salicylateLevelMgDl: '105',
    arterialPh: '7.28',
    pco2MmHg: '38',
    serumPotassiumMeq: '4.1',
    checkedFlags: ['pre_intubation_warning', 'pulmonary_edema'],
  });
  assert.equal(airwayEval.severity, 'emergency_hemodialysis');
  assert.equal(airwayEval.vanishingCompensation, true);
  assert.equal(airwayEval.intubationGuardrail.active, true);
  assert.equal(airwayEval.intubationGuardrail.targetMinuteVentilationLMin, '24 - 32 L/min');
  assert.match(airwayEval.intubationGuardrail.blackBoxDetailEn, /blood-brain barrier/i);
  assert.ok(airwayEval.extripDialysisReasonsEn.length >= 2);

  // NSAID / Pepto-Bismol profile evaluation: non-salicylate NSAID warning + APAP co-ingestion screening
  const nsaidEval = evaluateSalicylateRisk({
    profile: 'nsaid_pepto_bismuth_mixed',
    weightKg: '70',
    salicylateLevelMgDl: '15',
    arterialPh: '7.28',
    pco2MmHg: '28',
    serumPotassiumMeq: '4.4',
    checkedFlags: [],
  });
  assert.equal(nsaidEval.alkalinization.alkalinizationEffective, false);
  assert.ok(nsaidEval.actions.some((a) => /ibuprofen.*does NOT clear via urine alkalinization/i.test(a.textEn)));
});

test('Salicylate Tox: Zero-PII Bilingual SBAR Handoff Note (EN & ES)', () => {
  const sampleState = {
    profile: 'methyl_salicylate_wintergreen',
    weightKg: '12',
    salicylateLevelMgDl: '72',
    arterialPh: '7.25',
    pco2MmHg: '30',
    serumPotassiumMeq: '3.3',
    urinePh: '5.5',
    hoursSinceIngestion: '1',
    checkedFlags: new Set(['ams_neurotoxicity', 'pre_intubation_warning']),
  };

  const sbarEn = formatSalicylateSbarText(sampleState, 'en');
  assert.match(sbarEn, /SBAR CLINICAL HANDOFF: SALICYLATE \/ NSAID OVERDOSE/);
  assert.match(sbarEn, /Zero PII/);
  assert.match(sbarEn, /\[S\] SITUATION:/);
  assert.match(sbarEn, /\[B\] BACKGROUND/);
  assert.match(sbarEn, /\[A\] ASSESSMENT/);
  assert.match(sbarEn, /\[R\] RECOMMENDATION/);
  assert.match(sbarEn, /1\.4 g/);
  assert.match(sbarEn, /24–32 L\/min/);
  assert.match(sbarEn, /Acetaminophen \(APAP\)/);

  const sbarEs = formatSalicylateSbarText(sampleState, 'es');
  assert.match(sbarEs, /NOTA CLÍNICA SBAR: TOXICOLOGÍA DE SALICILATOS/);
  assert.match(sbarEs, /Cero PII/);
  assert.match(sbarEs, /\[S\] SITUACIÓN:/);
  assert.match(sbarEs, /\[B\] ANTECEDENTES/);
  assert.match(sbarEs, /\[A\] EVALUACIÓN/);
  assert.match(sbarEs, /\[R\] RECOMENDACIONES/);
  assert.match(sbarEs, /Aceite de Gaulteria/);
  assert.match(sbarEs, /24–32 L\/min/);
});

test('Salicylate Tox: Ephemeral In-RAM State Lifecycle (get, update, reset, subscribe)', () => {
  resetSalicylateToxState();
  const initial = getSalicylateToxState();
  assert.equal(initial.profile, 'acute_salicylate_od');
  assert.equal(initial.weightKg, '70');
  assert.equal(initial.checkedFlags.size, 0);

  let notifications = 0;
  const unsub = subscribeSalicylateToxState(() => {
    notifications += 1;
  });

  updateSalicylateToxState({
    profile: 'chronic_salicylate_toxicity',
    salicylateLevelMgDl: '48',
    checkedFlags: ['ams_neurotoxicity'],
  });
  const updated = getSalicylateToxState();
  assert.equal(updated.profile, 'chronic_salicylate_toxicity');
  assert.equal(updated.salicylateLevelMgDl, '48');
  assert.equal(updated.checkedFlags.has('ams_neurotoxicity'), true);
  assert.equal(notifications, 1);

  unsub();
  updateSalicylateToxState({ weightKg: '85' });
  assert.equal(notifications, 1);

  resetSalicylateToxState();
  const reset = getSalicylateToxState();
  assert.equal(reset.profile, 'acute_salicylate_od');
  assert.equal(reset.weightKg, '70');
  assert.equal(reset.checkedFlags.size, 0);
});

test('Salicylate Tox: Accessible DOM Mount (container & app options), WAI-ARIA Tabs, Focus Preservation & Copy', async () => {
  const dom = installEnhancedMockDom();
  try {
    resetSalicylateToxState();

    // 1. Mount via { meta } options pattern (app.js style)
    const standalone = salicylateToxView({ meta: { path: 'salicylate-tox' } });
    assert.ok(standalone.className.includes('view-section'));
    assert.ok(standalone.className.includes('salicylate-tox-view'));
    standalone._cleanup?.();

    // 2. Mount into host container Element (DOM mount test pattern)
    const host = document.createElement('div');
    dom.setRoot(host);
    const mounted = salicylateToxView(host);
    assert.equal(mounted, host);

    // Every <button> must have type="button"
    const buttons = host.querySelectorAll('button');
    assert.ok(buttons.length >= 5);
    for (const btn of buttons) {
      assert.equal(btn.getAttribute('type'), 'button', `Button ${btn.textContent} must have type="button"`);
    }

    // Every input/select/textarea must have a matching <label for="..."> or aria-label
    const labels = host.querySelectorAll('label');
    const labelFors = new Set(labels.map((l) => l.getAttribute('for')).filter(Boolean));
    for (const tag of ['input', 'select', 'textarea']) {
      const els = host.querySelectorAll(tag);
      assert.ok(els.length > 0, `Expected ${tag} elements`);
      for (const el of els) {
        const hasFor = el.id && labelFors.has(el.id);
        const hasAria = Boolean(el.getAttribute('aria-label'));
        assert.ok(hasFor || hasAria, `Control ${tag}#${el.id} must have <label for> or aria-label`);
      }
    }

    // Every [role="tab"] aria-controls must match a real rendered [role="tabpanel"] with matching id & aria-labelledby
    const tablist = host.querySelector('[role="tablist"]');
    assert.ok(tablist, 'Tablist exists');
    const tabs = host.querySelectorAll('[role="tab"]');
    const panels = host.querySelectorAll('[role="tabpanel"]');
    assert.equal(tabs.length, 3);
    assert.equal(panels.length, 3);

    for (const tab of tabs) {
      const controlsId = tab.getAttribute('aria-controls');
      assert.ok(controlsId, 'Tab has aria-controls');
      const panel = host.querySelector(`#${controlsId}`);
      assert.ok(panel, `Panel #${controlsId} exists in DOM`);
      assert.equal(panel.getAttribute('role'), 'tabpanel');
      assert.equal(panel.getAttribute('aria-labelledby'), tab.id);
    }

    // Clicking second tab activates its panel and updates aria-selected
    tabs[1].click();
    assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
    assert.equal(tabs[0].getAttribute('aria-selected'), 'false');
    assert.equal(panels[1].hidden, false);
    assert.equal(panels[0].hidden, true);

    // Keyboard ArrowRight / Home navigation via wireTablistKeyboard
    tabs[1].focus();
    host.dispatchEvent({ type: 'keydown', key: 'ArrowRight', target: tabs[1], preventDefault() {} });
    assert.equal(tabs[2].getAttribute('aria-selected'), 'true');
    assert.equal(panels[2].hidden, false);
    host.dispatchEvent({ type: 'keydown', key: 'Home', target: tabs[2], preventDefault() {} });
    assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
    assert.equal(panels[0].hidden, false);

    // Red-flag checkbox toggling updates state & DOM
    const amsChk = host.querySelector('#salicylate-flag-ams_neurotoxicity');
    assert.ok(amsChk);
    amsChk.checked = true;
    amsChk.dispatchEvent({ type: 'change', target: amsChk });
    assert.equal(getSalicylateToxState().checkedFlags.has('ams_neurotoxicity'), true);

    // Focus preservation across state updates while typing
    const levelInput = host.querySelector('#salicylate-level-input');
    levelInput.focus();
    assert.equal(document.activeElement, levelInput);
    levelInput.value = '112';
    levelInput.dispatchEvent({ type: 'input', target: levelInput });

    assert.equal(host.querySelector('#salicylate-level-input'), levelInput, 'Input node is not recreated');
    assert.equal(document.activeElement, levelInput, 'Typing preserves focus on active input');
    const sbar = host.querySelector('#salicylate-sbar-text');
    assert.ok(sbar.value.includes('112 mg/dL'), 'SBAR updates live to 112 mg/dL');
    assert.ok(sbar.value.includes('EMERGENT HEMODIALYSIS INDICATED'), 'SBAR reflects EXTRIP HD trigger');

    // Copy SBAR button triggers navigator.clipboard.writeText via copyText()
    const copyBtn = host.querySelector('#salicylate-copy-sbar-btn');
    copyBtn.click();
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(dom.getCopiedPayloads().length, 1);
    assert.ok(dom.getCopiedPayloads()[0].includes('112 mg/dL'));

    // Reset button restores initial state
    const resetBtn = host.querySelector('#salicylate-reset-btn');
    resetBtn.click();
    assert.equal(getSalicylateToxState().salicylateLevelMgDl, '55');

    // Spanish UI rendering check
    useDictionary('es', es);
    try {
      const esView = salicylateToxView();
      assert.match(esView.textContent, /Navegador de Sobredosis por Salicilatos/);
      assert.match(esView.querySelector('#salicylate-sbar-text').value, /NOTA CLÍNICA SBAR: TOXICOLOGÍA DE SALICILATOS/);
      esView._cleanup?.();
    } finally {
      useDictionary('en', {});
    }

    // Auto-unsubscribe via wasConnected when detached after being connected
    const rootNode = host.querySelector('.salicylate-tox-view');
    rootNode.isConnected = true;
    updateSalicylateToxState({ weightKg: '72' });
    rootNode.isConnected = false;
    updateSalicylateToxState({ weightKg: '74' }); // Should auto-unsubscribe here without throwing

    host._cleanup?.();
  } finally {
    resetSalicylateToxState();
    dom.restore();
  }
});

test('Salicylate Tox: Static CSP, Privacy, Security & No-Textarea-Value-Prop Checks', () => {
  const viewPath = path.resolve('public/js/views/salicylateTox.js');
  const src = fs.readFileSync(viewPath, 'utf8');

  for (const forbidden of [
    'innerHTML',
    'outerHTML',
    'insertAdjacentHTML',
    'localStorage',
    'sessionStorage',
    'document.cookie',
    'eval(',
    'new Function',
  ]) {
    assert.equal(src.includes(forbidden), false, `Must not contain ${forbidden}`);
  }

  assert.doesNotMatch(src, /\sstyle\s*=\s*['"]/i, 'Must not contain inline style= attribute');
  assert.doesNotMatch(src, /\bfetch\s*\(/, 'Must not perform external fetch calls');

  // Ensure textarea creation via h('textarea', { ... }) never passes a `value:` property
  const textareaMatch = src.match(/h\(\s*'textarea'\s*,\s*\{([\s\S]*?)\}/);
  assert.ok(textareaMatch, 'Textarea element found');
  assert.doesNotMatch(textareaMatch[1], /\bvalue\s*:/, 'Must never pass value: inside h("textarea", props)');
});
