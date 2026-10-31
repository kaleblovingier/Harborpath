import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COUNSELING_MODALITIES,
  GROUNDING_EXERCISES,
  INTAKE_STEPS,
  TRIGGER_SUGGESTIONS,
  COPING_SUGGESTIONS,
  buildIntakeCallScript,
  formatSafetyPlanText,
  planView,
  getPlanState,
  setPlanState,
  resetPlanState,
} from '../public/js/views/plan.js';

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
  // Clinical & legal accuracy checks
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
});

test('TRIGGER_SUGGESTIONS and COPING_SUGGESTIONS provide evidence-based quick-select options', () => {
  assert.ok(TRIGGER_SUGGESTIONS.length >= 6);
  assert.ok(COPING_SUGGESTIONS.length >= 6);
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


test('getPlanState, setPlanState, and resetPlanState manage ephemeral RAM safety plan with alias synchronization', () => {
  resetPlanState();
  const initial = getPlanState();
  assert.equal(typeof initial, 'object');
  assert.equal(initial.goal, '');
  assert.equal(initial.warningSigns, '');
  assert.equal(initial.copingStrategies, '');
  assert.equal(initial.socialDistractions, '');
  assert.equal(initial.supportNetwork, '');
  assert.equal(initial.professionals, '');
  assert.equal(initial.environmentalSafety, '');
  assert.equal(initial.naloxoneLocation, '');
  assert.equal(initial.notes, '');

  // Update Stanley-Brown fields and verify synchronization to legacy aliases
  setPlanState({
    goal: 'Keep myself safe tonight and attend recovery meeting tomorrow',
    warningSigns: 'Restlessness, hollow feeling in chest, skipping meals',
    copingStrategies: 'Urge surfing for 10 minutes, 4-7-8 breathing, drinking cold water',
    socialDistractions: 'Downtown library, coffee shop, gym, walk in the park',
    supportNetwork: 'Maria (peer coach): 555-0144; Jordan (sponsor): 555-0177',
    professionals: 'Dr. Rivera (MOUD clinic): 555-0120; Mobile Crisis: 988',
    environmentalSafety: 'Medication locked in safe box; never using alone',
    naloxoneLocation: 'Top drawer by front door and front backpack pouch',
    notes: 'I have survived tough days before. A slip does not erase my worth.',
  });

  const updated = getPlanState();
  assert.equal(updated.goal, 'Keep myself safe tonight and attend recovery meeting tomorrow');
  assert.equal(updated.warningSigns, 'Restlessness, hollow feeling in chest, skipping meals');
  assert.equal(updated.triggers, updated.warningSigns);
  assert.equal(updated.copingStrategies, 'Urge surfing for 10 minutes, 4-7-8 breathing, drinking cold water');
  assert.equal(updated.copingSteps, updated.copingStrategies);
  assert.equal(updated.socialDistractions, 'Downtown library, coffee shop, gym, walk in the park');
  assert.equal(updated.supportNetwork, 'Maria (peer coach): 555-0144; Jordan (sponsor): 555-0177');
  assert.equal(updated.trustedContacts, updated.supportNetwork);
  assert.equal(updated.professionals, 'Dr. Rivera (MOUD clinic): 555-0120; Mobile Crisis: 988');
  assert.equal(updated.professionalContacts, updated.professionals);
  assert.equal(updated.environmentalSafety, 'Medication locked in safe box; never using alone');
  assert.equal(updated.saferEnvironment, updated.environmentalSafety);
  assert.equal(updated.naloxoneLocation, 'Top drawer by front door and front backpack pouch');
  assert.equal(updated.notes, 'I have survived tough days before. A slip does not erase my worth.');

  // Formatted plain text includes all Stanley-Brown sections and required crisis numbers
  const formatted = formatSafetyPlanText(updated);
  assert.match(formatted, /1\. MY GOAL RIGHT NOW/);
  assert.match(formatted, /2\. MY TRIGGERS & HIGH-RISK SITUATIONS/);
  assert.match(formatted, /3\. EARLY WARNING SIGNS I AM STRUGGLING/);
  assert.match(formatted, /4\. COPING STEPS THAT WORK FOR ME/);
  assert.match(formatted, /5\. SOCIAL DISTRACTIONS & SAFE PLACES/);
  assert.match(formatted, /6\. TRUSTED PEOPLE & SUPPORTS/);
  assert.match(formatted, /7\. PROFESSIONALS & CRISIS ESCALATION CONTACTS/);
  assert.match(formatted, /8\. WAYS TO MAKE MY ENVIRONMENT SAFER/);
  assert.match(formatted, /9\. WHERE MY NALOXONE/);
  assert.match(formatted, /877-696-1996/);
  assert.match(formatted, /800-972-0590/);
  assert.match(formatted, /988/);
  assert.match(formatted, /911/);

  // resetPlanState wipes back to clean state
  resetPlanState();
  const reset = getPlanState();
  assert.equal(reset.goal, '');
  assert.equal(reset.warningSigns, '');
  assert.equal(reset.copingStrategies, '');
  assert.equal(reset.socialDistractions, '');
  assert.equal(reset.supportNetwork, '');
  assert.equal(reset.professionals, '');
  assert.equal(reset.environmentalSafety, '');
  assert.equal(reset.naloxoneLocation, '');
  assert.equal(reset.notes, '');
});

test('Urge Surfing Timer provides 3-min, 5-min, and 10-min pacing options with accessible visual breathing guide', () => {
  resetPlanState();
  const prevDoc = globalThis.document;
  try {
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

    globalThis.Node = MockNode;
    globalThis.document = {
      createElement: (tag) => new MockNode(tag),
      createElementNS: (_ns, tag) => new MockNode(tag),
      getElementById: () => null,
    };

    const root = planView();

    // Verify 3-min, 5-min, and 10-min buttons exist in the timer
    const start3 = root.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('3-minute'));
    const start5 = root.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('5-minute'));
    const start10 = root.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('10-minute'));
    assert.equal(start3.length, 1);
    assert.equal(start5.length, 1);
    assert.equal(start10.length, 1);

    // Verify visual breathing pacer guide exists with circle and label
    const pacerGuides = root.findAll((n) => n.className.includes('pacer-guide'));
    assert.ok(pacerGuides.length >= 1);
    const pacerCircles = root.findAll((n) => n.className.includes('pacer-circle'));
    assert.ok(pacerCircles.length >= 1);
    const pacerLabels = root.findAll((n) => n.className.includes('pacer-label'));
    assert.ok(pacerLabels.length >= 1);

    // Verify 42 CFR Part 2 printable handout card and actions exist
    const cfrHandouts = root.findAll((n) => n.className.includes('print-handout'));
    assert.ok(cfrHandouts.length >= 1);
    assert.match(cfrHandouts[0].textContent, /42 CFR Part 2/);
    assert.match(cfrHandouts[0].textContent, /89 FR 12472/);
    assert.match(cfrHandouts[0].textContent, /Shield against police/i);
    assert.match(cfrHandouts[0].textContent, /Special protection for counseling notes/i);
    assert.match(cfrHandouts[0].textContent, /Patient control of consent/i);
    assert.match(cfrHandouts[0].textContent, /EKRA/);

    const printHandoutBtns = cfrHandouts[0].findAll(
      (n) => n.tagName === 'BUTTON' && n.textContent.includes('Print confidentiality handout'),
    );
    assert.equal(printHandoutBtns.length, 1);
  } finally {
    globalThis.document = prevDoc;
    resetPlanState();
  }
});
