import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COUNSELING_MODALITIES,
  GROUNDING_EXERCISES,
  INTAKE_STEPS,
  TRIGGER_SUGGESTIONS,
  COPING_SUGGESTIONS,
  STANLEY_BROWN_STEPS,
  buildIntakeCallScript,
  formatSafetyPlanText,
  getTimerCoaching,
  urgeSurfingTimer,
  getPlanState,
  resetPlanState,
  planView,
} from '../public/js/views/plan.js';
import { runQuickExitResets } from '../public/js/app.js';

test('COUNSELING_MODALITIES exports all 7 evidence-based SUDP counseling approaches with required fields', () => {
  assert.ok(Array.isArray(COUNSELING_MODALITIES));
  assert.equal(COUNSELING_MODALITIES.length, 7);

  const codes = COUNSELING_MODALITIES.map((m) => m.code);
  for (const expectedCode of ['CBT', 'MI', 'CMI', 'TRC', 'FT', 'TWFA', 'RPP']) {
    assert.ok(codes.includes(expectedCode), `Expected COUNSELING_MODALITIES to include ${expectedCode}`);
  }

  for (const modality of COUNSELING_MODALITIES) {
    assert.equal(typeof modality.code, 'string');
    assert.ok(modality.code.length > 0);
    assert.equal(typeof modality.name, 'string');
    assert.ok(modality.name.length > 0);
    assert.equal(typeof modality.bestFor, 'string');
    assert.ok(modality.bestFor.length > 10);
    assert.equal(typeof modality.whatItLooksLike, 'string');
    assert.ok(modality.whatItLooksLike.length > 20);
    assert.equal(typeof modality.samhsaCode, 'string');
    assert.ok(modality.samhsaCode.length > 0);
  }

  const cmi = COUNSELING_MODALITIES.find((m) => m.code === 'CMI');
  assert.match(cmi.bestFor, /stimulant/i);

  const trc = COUNSELING_MODALITIES.find((m) => m.code === 'TRC');
  assert.match(trc.name, /Seeking Safety/i);

  const ft = COUNSELING_MODALITIES.find((m) => m.code === 'FT');
  assert.match(ft.name, /CRAFT/);

  const peer = COUNSELING_MODALITIES.find((m) => m.code === 'TWFA');
  assert.equal(peer.samhsaCode, 'PEER');
  assert.match(peer.whatItLooksLike, /SMART Recovery/);
  assert.match(peer.whatItLooksLike, /Recovery Dharma/);
  assert.match(peer.whatItLooksLike, /MARA/);
});

test('GROUNDING_EXERCISES exports all 4 acute craving & distress regulation skills', () => {
  assert.ok(Array.isArray(GROUNDING_EXERCISES));
  assert.equal(GROUNDING_EXERCISES.length, 4);

  const ids = GROUNDING_EXERCISES.map((g) => g.id);
  for (const expectedId of [
    'urge_surfing',
    'sensory_54321',
    'paced_breathing_478',
    'tipp_temperature_paired_relaxation',
  ]) {
    assert.ok(ids.includes(expectedId), `Expected GROUNDING_EXERCISES to include ${expectedId}`);
  }

  for (const ex of GROUNDING_EXERCISES) {
    assert.equal(typeof ex.title, 'string');
    assert.ok(ex.title.length > 0);
    assert.equal(typeof ex.clinicalBasis, 'string');
    assert.ok(ex.clinicalBasis.length > 0);
    assert.equal(typeof ex.whenToUse, 'string');
    assert.ok(ex.whenToUse.length > 0);
    assert.ok(Array.isArray(ex.steps));
    assert.ok(ex.steps.length >= 3);
  }
});

test('buildIntakeCallScript generates tailored scripts across caller, need, and insurance combinations', () => {
  // Default parameters
  const def = buildIntakeCallScript();
  assert.equal(def.caller, 'self');
  assert.equal(def.need, 'moud_bup');
  assert.equal(def.insurance, 'medicaid');
  assert.match(def.opening, /calling for myself/i);
  assert.match(def.opening, /buprenorphine/i);
  assert.match(def.opening, /Medicaid/i);
  assert.ok(Array.isArray(def.keyQuestions) && def.keyQuestions.length >= 4);
  assert.ok(Array.isArray(def.barrierRights) && def.barrierRights.length >= 2);
  assert.match(def.redFlagReminder, /EKRA/);
  assert.match(def.fullText, /HARBORPATH CLINIC INTAKE CALL SCRIPT/);

  // Loved one + pregnant priority + uninsured
  const famPreg = buildIntakeCallScript({
    caller: 'loved_one',
    need: 'pregnant',
    insurance: 'uninsured',
  });
  assert.match(famPreg.opening, /loved one/i);
  assert.match(famPreg.opening, /pregnant or postpartum/i);
  assert.match(famPreg.opening, /without insurance/i);
  assert.ok(famPreg.keyQuestions.some((q) => /priority admission/i.test(q)));
  assert.ok(famPreg.keyQuestions.some((q) => /sliding fee scale/i.test(q)));
  assert.ok(famPreg.barrierRights.some((r) => /CRAFT/i.test(r)));

  // Clinician warm handoff + methadone OTP + medicare_va
  const clinOtp = buildIntakeCallScript({
    caller: 'clinician',
    need: 'methadone_otp',
    insurance: 'medicare_va',
  });
  assert.match(clinOtp.opening, /warm handoff/i);
  assert.match(clinOtp.opening, /Opioid Treatment Program/i);
  assert.ok(clinOtp.keyQuestions.some((q) => /take-home/i.test(q)));
  assert.ok(clinOtp.barrierRights.some((r) => /89 FR 12472/i.test(r)));
  assert.ok(clinOtp.barrierRights.some((r) => /Medicare/i.test(r)));

  // Self + detox + private insurance
  const detoxPriv = buildIntakeCallScript({
    caller: 'self',
    need: 'detox',
    insurance: 'private',
  });
  assert.match(detoxPriv.opening, /withdrawal management/i);
  assert.ok(detoxPriv.keyQuestions.some((q) => /in-network/i.test(q)));
  assert.ok(detoxPriv.barrierRights.some((r) => /Parity/i.test(r)));

  // Outpatient counseling fallback handling for unknown inputs
  const fallback = buildIntakeCallScript({
    caller: 'unknown_caller',
    need: 'outpatient',
    insurance: 'unknown_ins',
  });
  assert.equal(fallback.caller, 'self');
  assert.equal(fallback.need, 'outpatient');
  assert.equal(fallback.insurance, 'medicaid');
  assert.ok(fallback.keyQuestions.some((q) => /Contingency Management/i.test(q)));
});

test('INTAKE_STEPS demystifies the 6 stages of treatment intake, rights, and barrier navigation', () => {
  assert.ok(Array.isArray(INTAKE_STEPS));
  assert.equal(INTAKE_STEPS.length, 6);

  INTAKE_STEPS.forEach((item, idx) => {
    assert.equal(item.step, idx + 1);
    assert.equal(typeof item.id, 'string');
    assert.equal(typeof item.title, 'string');
    assert.ok(item.title.length > 0);
    assert.equal(typeof item.summary, 'string');
    assert.ok(item.summary.length > 0);
    assert.ok(Array.isArray(item.details));
    assert.ok(item.details.length >= 3);
    assert.ok(Array.isArray(item.relatedCodes));
  });

  const allText = JSON.stringify(INTAKE_STEPS);
  assert.match(allText, /biopsychosocial/i);
  assert.match(allText, /ASAM/);
  assert.match(allText, /PharmD/);
  assert.match(allText, /42 CFR Part 2/);
  assert.match(allText, /89 FR 12472/);
  assert.match(allText, /EKRA/);
  assert.match(allText, /\bTA\b/);
  assert.match(allText, /\bBC\b/);
  assert.match(allText, /\bHH\b/);
  assert.match(allText, /\bSS\b/);
});

test('STANLEY_BROWN_STEPS exports the 6 evidence-based Safety Planning Intervention pillars', () => {
  assert.ok(Array.isArray(STANLEY_BROWN_STEPS));
  assert.equal(STANLEY_BROWN_STEPS.length, 6);

  const stepIds = STANLEY_BROWN_STEPS.map((s) => s.id);
  assert.deepEqual(stepIds, [
    'warning_signs',
    'internal_coping',
    'social_distraction',
    'trusted_supports',
    'crisis_professionals',
    'environmental_safety',
  ]);

  STANLEY_BROWN_STEPS.forEach((step, idx) => {
    assert.equal(step.step, idx + 1);
    assert.equal(typeof step.label, 'string');
    assert.ok(step.label.length > 0);
    assert.equal(typeof step.field, 'string');
  });
});

test('formatSafetyPlanText formats a complete user plan and includes 24/7 crisis & overdose lines', () => {
  const plan = {
    goal: 'Stay safe this week and take my buprenorphine every morning.',
    triggers: '• Payday or having extra cash\n• Loneliness or isolation',
    warningSigns: 'Skipping dinner and turning off my phone.',
    copingSteps: '• Urge surfing for 15 minutes before deciding\n• Calling my peer recovery coach',
    trustedContacts: 'Alex (peer coach): 555-0199',
    saferEnvironment: 'Keep door unlocked, never mix with benzos, call Never Use Alone if alone.',
    naloxoneLocation: 'Top dresser drawer and front backpack pocket.',
    notes: 'A slip does not erase my progress.',
  };

  const text = formatSafetyPlanText(plan);
  assert.match(text, /HARBORPATH PERSONAL SAFETY & RECOVERY ACTION PLAN/);
  assert.match(text, /Stay safe this week and take my buprenorphine every morning\./);
  assert.match(text, /Payday or having extra cash/);
  assert.match(text, /Skipping dinner and turning off my phone\./);
  assert.match(text, /Urge surfing for 15 minutes before deciding/);
  assert.match(text, /Alex \(peer coach\): 555-0199/);
  assert.match(text, /Keep door unlocked, never mix with benzos/);
  assert.match(text, /Top dresser drawer and front backpack pocket\./);
  assert.match(text, /A slip does not erase my progress\./);

  // Required 24/7 crisis & overdose prevention numbers
  assert.match(text, /988/);
  assert.match(text, /1-800-662-4357/);
  assert.match(text, /1-800-484-3731/);
  assert.match(text, /911/);
});

test('formatSafetyPlanText handles empty input, missing fields, and array fields gracefully', () => {
  const emptyText = formatSafetyPlanText();
  assert.match(emptyText, /\(None listed yet\)/);
  assert.match(emptyText, /988/);
  assert.match(emptyText, /1-800-662-4357/);
  assert.match(emptyText, /1-800-484-3731/);

  const arrayText = formatSafetyPlanText({
    goal: 'Cut back safely',
    triggers: ['Stress', 'Sleeplessness'],
    copingSteps: ['Drink water', 'Call a friend'],
  });
  assert.match(arrayText, /Cut back safely/);
  assert.match(arrayText, /• Stress\n• Sleeplessness/);
  assert.match(arrayText, /• Drink water\n• Call a friend/);

  // Malformed non-object inputs
  const nullText = formatSafetyPlanText(null);
  assert.match(nullText, /HARBORPATH PERSONAL SAFETY & RECOVERY ACTION PLAN/);
  assert.match(nullText, /\(None listed yet\)/);

  const stringText = formatSafetyPlanText('malformed string');
  assert.match(stringText, /HARBORPATH PERSONAL SAFETY & RECOVERY ACTION PLAN/);
});

test('TRIGGER_SUGGESTIONS and COPING_SUGGESTIONS provide evidence-based quick-select options', () => {
  assert.ok(TRIGGER_SUGGESTIONS.length >= 6);
  assert.ok(COPING_SUGGESTIONS.length >= 6);
});

test('getTimerCoaching returns accurate coaching prompts across all 5 temporal phases and reduced-motion states', () => {
  const total = 180;

  // Phase 1: elapsed < 30 seconds (remaining 180..151)
  const p1 = getTimerCoaching(170, total);
  assert.match(p1, /Settle your feet on the floor/i);
  assert.match(p1, /Breathe in gently for 4 seconds/i);

  // Phase 2: 30 <= elapsed < 90 seconds (remaining 150..91) - standard motion
  const p2Standard = getTimerCoaching(120, total, { reducedMotion: false });
  assert.match(p2Standard, /Inhale slowly \(1-2-3-4\)/i);
  assert.match(p2Standard, /wave crests/i);

  // Phase 2: reduced motion branch
  const p2Reduced = getTimerCoaching(120, total, { reducedMotion: true });
  assert.match(p2Reduced, /Keep a steady, slow exhale/i);
  assert.match(p2Reduced, /wave passing beneath you/i);

  // Phase 3: elapsed >= 90 seconds and remaining > 45 seconds (remaining 90..46)
  const p3 = getTimerCoaching(70, total);
  assert.match(p3, /over the halfway mark/i);
  assert.match(p3, /Name 3 things you can see/i);

  // Phase 4: remaining <= 45 seconds and remaining > 0
  const p4 = getTimerCoaching(30, total);
  assert.match(p4, /Final stretch/i);
  assert.match(p4, /Unclench your jaw and hands/i);

  // Done: remaining <= 0 seconds
  const done = getTimerCoaching(0, total);
  assert.match(done, /Wave surfed/i);
  assert.match(done, /drink some water/i);

  const doneNegative = getTimerCoaching(-5, total);
  assert.match(doneNegative, /Wave surfed/i);
});

test('urgeSurfingTimer DOM component handles 3-min, 5-min, and reset actions cleanly', () => {
  class MockNode {
    constructor(tag) {
      this.tagName = tag.toUpperCase();
      this.className = '';
      this.dataset = {};
      this.attributes = {};
      this.listeners = {};
      this.children = [];
      this.value = '';
      this._textContent = '';
      this.isConnected = true;
    }
    get firstChild() {
      return this.children[0] ?? null;
    }
    get firstChild() {
      return this.children[0] ?? null;
    }
    get textContent() {
      if (this.children.length === 0) return this._textContent;
      return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
    }
    set textContent(v) {
      this._textContent = String(v ?? '');
      this.children = [];
    }
    setAttribute(k, v) {
      this.attributes[k] = String(v);
    }
    removeAttribute(k) {
      delete this.attributes[k];
    }
    addEventListener(evt, fn) {
      this.listeners[evt] = fn;
    }
    append(...items) {
      for (const item of items) {
        if (typeof item === 'string') {
          const textNode = new MockNode('#text');
          textNode._textContent = item;
          textNode.parent = this;
          this.children.push(textNode);
        } else if (item) {
          item.parent = this;
          this.children.push(item);
        }
      }
    }
    remove() {
      if (!this.parent) return;
      const idx = this.parent.children.indexOf(this);
      if (idx >= 0) this.parent.children.splice(idx, 1);
    }
    findAll(pred, acc = []) {
      if (pred(this)) acc.push(this);
      for (const ch of this.children) {
        if (ch instanceof MockNode) ch.findAll(pred, acc);
      }
      return acc;
    }
  }

  const prevDoc = globalThis.document;
  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: () => null,
  };

  try {
    const timerRoot = urgeSurfingTimer();
    assert.equal(timerRoot.className, 'timer');
    assert.equal(timerRoot.attributes.role, 'group');

    const display = timerRoot.findAll((n) => n.className === 'timer-display')[0];
    assert.ok(display);
    assert.equal(display.textContent, '3:00');

    const live = timerRoot.findAll((n) => n.className === 'timer-live')[0];
    assert.ok(live);
    assert.match(live.textContent, /Most cravings crest and soften/);

    const start3Btn = timerRoot.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('Start 3-minute'))[0];
    assert.ok(start3Btn);

    const start5Btn = timerRoot.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('Start 5-minute'))[0];
    assert.ok(start5Btn);

    const resetBtn = timerRoot.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('Pause / reset'))[0];
    assert.ok(resetBtn);

    // Click 5-minute timer
    start5Btn.listeners.click();
    assert.equal(display.textContent, '5:00');
    assert.match(live.textContent, /Settle your feet on the floor/);

    // Click pause / reset
    resetBtn.listeners.click();
    assert.equal(display.textContent, '5:00');
    assert.match(live.textContent, /Timer paused and reset/);

    // Click 3-minute timer
    start3Btn.listeners.click();
    assert.equal(display.textContent, '3:00');
    assert.match(live.textContent, /Settle your feet on the floor/);

    // Reset again to clean up interval
    resetBtn.listeners.click();
  } finally {
    globalThis.document = prevDoc;
  }
});

test('resetPlanState() wipes active plan from RAM, resets form controls, and integrates with runQuickExitResets()', () => {
  class MockNode {
    constructor(tag) {
      this.tagName = tag.toUpperCase();
      this.className = '';
      this.dataset = {};
      this.attributes = {};
      this.listeners = {};
      this.children = [];
      this.value = '';
      this._textContent = '';
      this.isConnected = true;
    }
    get firstChild() {
      return this.children[0] ?? null;
    }
    get textContent() {
      if (this.children.length === 0) return this._textContent;
      return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
    }
    set textContent(v) {
      this._textContent = String(v ?? '');
      this.children = [];
    }
    setAttribute(k, v) {
      this.attributes[k] = String(v);
    }
    removeAttribute(k) {
      delete this.attributes[k];
    }
    addEventListener(evt, fn) {
      this.listeners[evt] = fn;
    }
    append(...items) {
      for (const item of items) {
        if (typeof item === 'string') {
          const textNode = new MockNode('#text');
          textNode._textContent = item;
          textNode.parent = this;
          this.children.push(textNode);
        } else if (item) {
          item.parent = this;
          this.children.push(item);
        }
      }
    }
    remove() {
      if (!this.parent) return;
      const idx = this.parent.children.indexOf(this);
      if (idx >= 0) this.parent.children.splice(idx, 1);
    }
    findAll(pred, acc = []) {
      if (pred(this)) acc.push(this);
      for (const ch of this.children) {
        if (ch instanceof MockNode) ch.findAll(pred, acc);
      }
      return acc;
    }
  }

  const prevDoc = globalThis.document;
  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: () => null,
  };

  try {
    // Calling resetPlanState when unmounted does not throw
    assert.doesNotThrow(() => resetPlanState());
    assert.equal(getPlanState(), null);

    // Mount plan view with preloaded query
    const root = planView({ query: new URLSearchParams('goal=Stay+grounded+today') });
    const initialPlan = getPlanState();
    assert.ok(initialPlan);
    assert.equal(initialPlan.goal, 'Stay grounded today');

    const preview = root.findAll((n) => n.className === 'card safety-plan-preview')[0];
    assert.ok(preview);
    assert.match(preview.textContent, /Stay grounded today/);

    // Reset plan state
    resetPlanState();
    assert.equal(getPlanState(), null);
    assert.doesNotMatch(preview.textContent, /Stay grounded today/);

    // Verify runQuickExitResets does not throw and executes plan reset
    assert.doesNotThrow(() => runQuickExitResets());
  } finally {
    globalThis.document = prevDoc;
  }
});

test('planView renders zero-knowledge builder, urge-surfing toolkit, intake script builder, and 42 CFR Part 2 section', () => {
  class MockNode {
    constructor(tag) {
      this.tagName = tag.toUpperCase();
      this.className = '';
      this.dataset = {};
      this.attributes = {};
      this.listeners = {};
      this.children = [];
      this.value = '';
      this._textContent = '';
      this.isConnected = false;
    }
    get firstChild() {
      return this.children[0] ?? null;
    }
    get firstChild() {
      return this.children[0] ?? null;
    }
    get textContent() {
      if (this.children.length === 0) return this._textContent;
      return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
    }
    set textContent(v) {
      this._textContent = String(v ?? '');
      this.children = [];
    }
    setAttribute(k, v) {
      this.attributes[k] = String(v);
    }
    removeAttribute(k) {
      delete this.attributes[k];
    }
    addEventListener(evt, fn) {
      this.listeners[evt] = fn;
    }
    append(...items) {
      for (const item of items) {
        if (typeof item === 'string') {
          const textNode = new MockNode('#text');
          textNode._textContent = item;
          textNode.parent = this;
          this.children.push(textNode);
        } else if (item) {
          item.parent = this;
          this.children.push(item);
        }
      }
    }
    remove() {
      if (!this.parent) return;
      const idx = this.parent.children.indexOf(this);
      if (idx >= 0) this.parent.children.splice(idx, 1);
    }
    remove() {
      if (!this.parent) return;
      const idx = this.parent.children.indexOf(this);
      if (idx >= 0) this.parent.children.splice(idx, 1);
    }
    findAll(pred, acc = []) {
      if (pred(this)) acc.push(this);
      for (const ch of this.children) {
        if (ch instanceof MockNode) ch.findAll(pred, acc);
      }
      return acc;
    }
  }

  const prevDoc = globalThis.document;
  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: () => null,
  };

  try {
    const root = planView({ query: new URLSearchParams('goal=Stay+safe+tonight') });
    const fullText = root.textContent;

    // Verify all 5 sections render
    assert.match(fullText, /Personal safety & recovery action plan/);
    assert.match(fullText, /Craving & distress toolkit/);
    assert.match(fullText, /5-4-3-2-1 Sensory Grounding/);
    assert.match(fullText, /What to expect at your first appointment/);
    assert.match(fullText, /Interactive “What to Say When You Call a Clinic” Script Builder/);
    assert.match(fullText, /Counseling & therapy approaches explained/);
    assert.match(fullText, /Your confidentiality rights \(42 CFR Part 2/);
    assert.match(fullText, /89 FR 12472/);

    // Verify Copy call script button exists and intake script selectors update output
    const copyScriptBtns = root.findAll(
      (n) => n.tagName === 'BUTTON' && n.textContent.includes('Copy call script'),
    );
    assert.equal(copyScriptBtns.length, 1);

    const needSelect = root.findAll((n) => n.attributes.id === 'script-need')[0];
    assert.ok(needSelect);
    needSelect.listeners.change({ target: { value: 'pregnant' } });
    assert.match(root.textContent, /priority admission/i);

    // Verify print-ready preview card exists with required class
    const previewCards = root.findAll((n) => n.className === 'card safety-plan-preview');
    assert.equal(previewCards.length, 1);
    assert.match(previewCards[0].textContent, /Stay safe tonight/);

    // Verify clicking a trigger chip updates the preview card and toggles off when clicked again
    const chipButtons = root.findAll(
      (n) => n.tagName === 'BUTTON' && n.textContent.includes(TRIGGER_SUGGESTIONS[0]),
    );
    assert.equal(chipButtons.length, 1);
    chipButtons[0].listeners.click();
    assert.match(previewCards[0].textContent, new RegExp(TRIGGER_SUGGESTIONS[0]));
    assert.equal(chipButtons[0].attributes['aria-pressed'], 'true');

    // Verify Clear plan button wipes in-memory plan
    const clearButtons = root.findAll(
      (n) => n.tagName === 'BUTTON' && n.textContent.includes('Clear plan'),
    );
    assert.equal(clearButtons.length, 1);
    clearButtons[0].listeners.click();
    assert.doesNotMatch(previewCards[0].textContent, /Stay safe tonight/);
    assert.equal(chipButtons[0].attributes['aria-pressed'], 'false');

    // Verify links to #/treatment?codes=... for counseling modalities
    const links = root.findAll((n) => n.tagName === 'A' && (n.attributes.href ?? '').startsWith('#/treatment?codes='));
    assert.ok(links.length >= COUNSELING_MODALITIES.length);
  } finally {
    globalThis.document = prevDoc;
  }
});
