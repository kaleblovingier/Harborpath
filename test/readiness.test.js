import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STAGES_OF_CHANGE,
  READINESS_STATEMENTS,
  LIKERT_OPTIONS,
  DECISIONAL_BALANCE_PROMPTS,
  CRAFT_GUIDANCE,
  calculateReadinessStage,
  getReadinessState,
  setReadinessState,
  resetReadinessState,
  formatReadinessSummaryText,
  readinessView,
} from '../public/js/views/readiness.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const readinessFilePath = path.resolve(here, '../public/js/views/readiness.js');

// ============================================================================
// 1. Stages of Change Taxonomy & Schema Integrity Tests
// ============================================================================

test('STAGES_OF_CHANGE exports exactly 6 stages with complete clinical attributes', () => {
  assert.ok(Array.isArray(STAGES_OF_CHANGE), 'STAGES_OF_CHANGE must be an array');
  assert.equal(STAGES_OF_CHANGE.length, 6, 'Must contain 5 TTM stages + recurrence');

  const expectedIds = [
    'precontemplation',
    'contemplation',
    'preparation',
    'action',
    'maintenance',
    'recurrence',
  ];

  const actualIds = STAGES_OF_CHANGE.map((s) => s.id);
  assert.deepEqual(actualIds, expectedIds);

  for (const stage of STAGES_OF_CHANGE) {
    // Both array element and dictionary key should point to the stage object
    assert.equal(STAGES_OF_CHANGE[stage.id], stage);

    assert.equal(typeof stage.id, 'string');
    assert.ok(stage.id.length > 0);
    assert.equal(typeof stage.name, 'string');
    assert.ok(stage.name.length > 0);
    assert.equal(typeof stage.title, 'string');
    assert.ok(stage.title.length > 0);
    assert.equal(typeof stage.plainLanguageTitle, 'string');
    assert.ok(stage.plainLanguageTitle.length > 0);
    assert.equal(typeof stage.tagline, 'string');
    assert.equal(typeof stage.description, 'string');
    assert.ok(stage.description.length > 20);
    assert.equal(typeof stage.clinicalGoal, 'string');
    assert.equal(typeof stage.motivationalCoachingPrompt, 'string');
    assert.ok(stage.motivationalCoachingPrompt.length > 10);
    assert.equal(stage.coachingPrompt, stage.motivationalCoachingPrompt);
    assert.ok(Array.isArray(stage.recommendedNextSteps));
    assert.ok(stage.recommendedNextSteps.length >= 4);

    for (const step of stage.recommendedNextSteps) {
      assert.equal(typeof step, 'string');
      assert.ok(step.length > 10);
    }
  }

  // Verify Recurrence stage highlights lowered tolerance and overdose safety
  const recurrenceStage = STAGES_OF_CHANGE.recurrence;
  assert.ok(recurrenceStage);
  assert.match(recurrenceStage.description, /clinical event/i);
  const stepsJoined = recurrenceStage.recommendedNextSteps.join(' ');
  assert.match(stepsJoined, /tolerance/i);
  assert.match(stepsJoined, /naloxone|narcan/i);
  assert.match(stepsJoined, /never use alone/i);
});

test('READINESS_STATEMENTS exports exactly 8 validated URICA-inspired statements', () => {
  assert.ok(Array.isArray(READINESS_STATEMENTS));
  assert.equal(READINESS_STATEMENTS.length, 8);

  const expectedIds = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
  assert.deepEqual(READINESS_STATEMENTS.map((s) => s.id), expectedIds);

  for (const stmt of READINESS_STATEMENTS) {
    // Both array and dictionary lookup work
    assert.equal(READINESS_STATEMENTS[stmt.id], stmt);

    assert.equal(typeof stmt.id, 'string');
    assert.equal(typeof stmt.stage, 'string');
    assert.equal(typeof stmt.category, 'string');
    assert.equal(typeof stmt.statement, 'string');
    assert.ok(stmt.statement.length > 15);
    assert.equal(typeof stmt.prompt, 'string');
    assert.ok(Array.isArray(stmt.options));
    assert.equal(stmt.options.length, 5);

    for (let i = 0; i < stmt.options.length; i++) {
      const opt = stmt.options[i];
      assert.equal(opt.score, i + 1);
      assert.equal(typeof opt.label, 'string');
      assert.ok(opt.label.length > 0);
    }
  }

  // Precontemplation statements: s1, s2
  assert.equal(READINESS_STATEMENTS.s1.stage, 'precontemplation');
  assert.equal(READINESS_STATEMENTS.s2.stage, 'precontemplation');

  // Contemplation statements: s3, s4
  assert.equal(READINESS_STATEMENTS.s3.stage, 'contemplation');
  assert.equal(READINESS_STATEMENTS.s4.stage, 'contemplation');

  // Preparation statements: s5, s6
  assert.equal(READINESS_STATEMENTS.s5.stage, 'preparation');
  assert.equal(READINESS_STATEMENTS.s6.stage, 'preparation');

  // Action statement: s7
  assert.equal(READINESS_STATEMENTS.s7.stage, 'action');

  // Maintenance statement: s8
  assert.equal(READINESS_STATEMENTS.s8.stage, 'maintenance');
});

test('DECISIONAL_BALANCE_PROMPTS & CRAFT_GUIDANCE export comprehensive models', () => {
  // Decisional Balance 4 Quadrants
  const quadrants = ['likes', 'concerns', 'positives', 'hurdles'];
  for (const q of quadrants) {
    const quad = DECISIONAL_BALANCE_PROMPTS[q];
    assert.ok(quad, `Missing quadrant: ${q}`);
    assert.equal(quad.id, q);
    assert.equal(typeof quad.title, 'string');
    assert.equal(typeof quad.subtitle, 'string');
    assert.ok(Array.isArray(quad.examples));
    assert.ok(quad.examples.length >= 5);
  }

  // CRAFT Guidance Strategies
  assert.equal(typeof CRAFT_GUIDANCE.title, 'string');
  assert.ok(Array.isArray(CRAFT_GUIDANCE.strategies));
  assert.equal(CRAFT_GUIDANCE.strategies.length, 3);

  const stratIds = CRAFT_GUIDANCE.strategies.map((s) => s.id);
  assert.deepEqual(stratIds, ['positive_communication', 'non_punitive_boundaries', 'self_care_allies']);

  for (const s of CRAFT_GUIDANCE.strategies) {
    assert.equal(typeof s.title, 'string');
    assert.equal(typeof s.summary, 'string');
    assert.ok(Array.isArray(s.practices));
    assert.ok(s.practices.length >= 3);
  }
});

// ============================================================================
// 2. Stage Calculation Engine Tests
// ============================================================================

test('calculateReadinessStage returns default contemplation for empty/null answers', () => {
  const resEmpty = calculateReadinessStage({});
  assert.equal(resEmpty.stage, 'contemplation');
  assert.equal(resEmpty.answeredCount, 0);
  assert.equal(resEmpty.isComplete, false);
  assert.ok(resEmpty.recommendedNextSteps.length > 0);

  const resNull = calculateReadinessStage(null);
  assert.equal(resNull.stage, 'contemplation');
  assert.equal(resNull.answeredCount, 0);

  const resUndef = calculateReadinessStage(undefined);
  assert.equal(resUndef.stage, 'contemplation');
});

test('calculateReadinessStage correctly scores Precontemplation scenario', () => {
  const answers = {
    s1: 5,
    s2: 5,
    s3: 1,
    s4: 1,
    s5: 1,
    s6: 1,
    s7: 1,
    s8: 1,
  };

  const res = calculateReadinessStage(answers);
  assert.equal(res.stage, 'precontemplation');
  assert.equal(res.isComplete, true);
  assert.equal(res.answeredCount, 8);
  assert.equal(res.subscaleScores.precontemplation, 5.0);
  assert.equal(res.subscaleScores.contemplation, 1.0);
  assert.equal(res.subscaleScores.preparation, 1.0);
  assert.equal(res.subscaleScores.action, 1.0);
  assert.equal(res.subscaleScores.maintenance, 1.0);
  assert.match(res.title, /Precontemplation/);
  assert.match(res.plainLanguageTitle, /Not thinking about changing/);
  assert.ok(res.recommendedNextSteps.some((s) => s.includes('naloxone')));
  assert.ok(res.recommendedNextSteps.some((s) => s.includes('Never Use Alone')));
});

test('calculateReadinessStage correctly scores Contemplation (Ambivalence) scenario', () => {
  const answers = {
    s1: 2,
    s2: 1,
    s3: 5,
    s4: 5,
    s5: 2,
    s6: 2,
    s7: 1,
    s8: 1,
  };

  const res = calculateReadinessStage(answers);
  assert.equal(res.stage, 'contemplation');
  assert.equal(res.subscaleScores.precontemplation, 1.5);
  assert.equal(res.subscaleScores.contemplation, 5.0);
  assert.equal(res.subscaleScores.preparation, 2.0);
  assert.equal(res.subscaleScores.action, 1.0);
  assert.equal(res.subscaleScores.maintenance, 1.0);
  assert.match(res.description, /ambivalence|pros and cons|weighing/i);
  assert.ok(res.recommendedNextSteps.some((s) => s.includes('Decisional Balance')));
});

test('calculateReadinessStage correctly scores Preparation scenario', () => {
  const answers = {
    s1: 1,
    s2: 1,
    s3: 4,
    s4: 3,
    s5: 5,
    s6: 5,
    s7: 2,
    s8: 1,
  };

  const res = calculateReadinessStage(answers);
  assert.equal(res.stage, 'preparation');
  assert.equal(res.subscaleScores.preparation, 5.0);
  assert.equal(res.subscaleScores.action, 2.0);
  assert.match(res.title, /Preparation/);
  assert.match(res.plainLanguageTitle, /Ready to take steps soon/);
  assert.ok(res.recommendedNextSteps.some((s) => s.includes('MOUD') || s.includes('medication')));
});

test('calculateReadinessStage correctly scores Action scenario', () => {
  const answers = {
    s1: 1,
    s2: 1,
    s3: 3,
    s4: 2,
    s5: 4,
    s6: 4,
    s7: 5,
    s8: 2,
  };

  const res = calculateReadinessStage(answers);
  assert.equal(res.stage, 'action');
  assert.equal(res.subscaleScores.action, 5.0);
  assert.match(res.title, /Action/);
  assert.match(res.plainLanguageTitle, /Actively making changes right now/);
  assert.ok(res.recommendedNextSteps.some((s) => s.includes('urge surfing')));
  assert.ok(res.recommendedNextSteps.some((s) => s.includes('SMART Recovery')));
});

test('calculateReadinessStage correctly scores Maintenance scenario', () => {
  const answers = {
    s1: 1,
    s2: 1,
    s3: 2,
    s4: 1,
    s5: 2,
    s6: 2,
    s7: 3,
    s8: 5,
  };

  const res = calculateReadinessStage(answers);
  assert.equal(res.stage, 'maintenance');
  assert.equal(res.subscaleScores.maintenance, 5.0);
  assert.match(res.title, /Maintenance/);
  assert.match(res.plainLanguageTitle, /Sustaining changes long-term/);
  assert.ok(res.recommendedNextSteps.some((s) => s.includes('early warning sign')));
});

test('calculateReadinessStage triggers Recurrence mode regardless of Likert score when slip is reported', () => {
  // Even if answers indicate Action or Maintenance, a reported slip triggers recurrence support
  const answersWithSlip = {
    s1: 1,
    s2: 1,
    s3: 2,
    s4: 2,
    s5: 4,
    s6: 4,
    s7: 5,
    s8: 4,
    recentSlip: true,
  };

  const res = calculateReadinessStage(answersWithSlip);
  assert.equal(res.stage, 'recurrence');
  assert.match(res.title, /Recurrence/);
  assert.match(res.plainLanguageTitle, /Had a slip or return to use/);
  assert.ok(res.recommendedNextSteps.some((s) => s.includes('OVERDOSE WARNING') || s.includes('tolerance')));

  // Test other flag aliases: hadSlip, recurrence, or stage: 'recurrence'
  assert.equal(calculateReadinessStage({ hadSlip: true }).stage, 'recurrence');
  assert.equal(calculateReadinessStage({ recurrence: true }).stage, 'recurrence');
  assert.equal(calculateReadinessStage({ stage: 'recurrence' }).stage, 'recurrence');
});

test('calculateReadinessStage handles boundary scores, clamping, string numbers, and array input safely', () => {
  // Array input format
  const arrayAnswers = [1, 1, 4, 4, 5, 5, 2, 1];
  const arrayRes = calculateReadinessStage(arrayAnswers);
  assert.equal(arrayRes.stage, 'preparation');
  assert.equal(arrayRes.answeredCount, 8);

  // Clamping: numbers < 1 clamped to 1, numbers > 5 clamped to 5
  const clampedRes = calculateReadinessStage({
    s1: -10, // clamped to 1
    s2: 0,   // clamped to 1
    s3: 99,  // clamped to 5
    s4: '5', // parsed from string to 5
    s5: '3',
    s6: null, // invalid, ignored
  });
  assert.equal(clampedRes.dimensionScores.s1.score, 1);
  assert.equal(clampedRes.dimensionScores.s3.score, 5);
  assert.equal(clampedRes.dimensionScores.s4.score, 5);

  // Partial answer completion flag
  assert.equal(clampedRes.isComplete, false);
  assert.equal(clampedRes.answeredCount, 5);

  // Explicit stage override
  const overrideRes = calculateReadinessStage({ stage: 'action', s1: 5, s2: 5 });
  assert.equal(overrideRes.stage, 'action');
});

test('calculateReadinessStage resolves tied subscale scores deterministically', () => {
  // Tie between Preparation and Contemplation: Prep >= 3.5 takes clinical priority
  const tiePrepCont = calculateReadinessStage({
    s1: 1, s2: 1,
    s3: 4, s4: 4,
    s5: 4, s6: 4,
    s7: 1, s8: 1,
  });
  assert.equal(tiePrepCont.stage, 'preparation');

  // Tie between Action and Preparation: Action >= 4 takes clinical priority
  const tieActionPrep = calculateReadinessStage({
    s1: 1, s2: 1,
    s3: 2, s4: 2,
    s5: 4, s6: 4,
    s7: 4, s8: 1,
  });
  assert.equal(tieActionPrep.stage, 'action');

  // Tie between Contemplation and Precontemplation: Contemplation >= PC takes priority
  const tieContPC = calculateReadinessStage({
    s1: 3, s2: 3,
    s3: 3, s4: 3,
    s5: 1, s6: 1,
    s7: 1, s8: 1,
  });
  assert.equal(tieContPC.stage, 'contemplation');
});

// ============================================================================
// 3. Ephemeral In-RAM State Management & Reset Tests
// ============================================================================

test('getReadinessState, setReadinessState, and resetReadinessState manage ephemeral RAM cleanly', () => {
  // Ensure starting clean
  resetReadinessState();
  const initial = getReadinessState();
  assert.equal(initial.substance, 'general');
  assert.deepEqual(initial.answers, {});
  assert.equal(initial.recentSlip, false);
  assert.deepEqual(initial.decisionalBalance.likes, []);
  assert.deepEqual(initial.decisionalBalance.concerns, []);
  assert.equal(initial.assessorRole, 'individual');

  // Verify getReadinessState returns a clone, not a mutable reference
  initial.substance = 'hacked';
  assert.equal(getReadinessState().substance, 'general');

  // Apply state patch
  const patch = {
    substance: 'opioids',
    customSubstance: 'Fentanyl',
    answers: { s1: 1, s2: 1, s3: 5, s4: 5 },
    decisionalBalance: {
      likes: ['Relief from anxiety, stress, or intense emotional pain'],
      concerns: ['Financial costs draining savings or creating debt'],
      customLikes: 'Helps me forget past trauma',
    },
    notes: 'Meeting with peer counselor on Thursday.',
    craftNotes: 'Planning to set boundary around cash.',
    assessorRole: 'loved_one',
    recentSlip: false,
    timestamp: 1700000000000,
  };

  const updated = setReadinessState(patch);
  assert.equal(updated.substance, 'opioids');
  assert.equal(updated.customSubstance, 'Fentanyl');
  assert.equal(updated.answers.s3, 5);
  assert.equal(updated.decisionalBalance.likes.length, 1);
  assert.equal(updated.decisionalBalance.customLikes, 'Helps me forget past trauma');
  assert.equal(updated.assessorRole, 'loved_one');
  assert.equal(updated.notes, 'Meeting with peer counselor on Thursday.');
  assert.equal(updated.craftNotes, 'Planning to set boundary around cash.');

  // Perform Quick Exit / RAM Wipe
  const wiped = resetReadinessState();
  assert.equal(wiped.substance, 'general');
  assert.equal(wiped.customSubstance, '');
  assert.deepEqual(wiped.answers, {});
  assert.deepEqual(wiped.decisionalBalance.likes, []);
  assert.deepEqual(wiped.decisionalBalance.concerns, []);
  assert.equal(wiped.decisionalBalance.customLikes, '');
  assert.equal(wiped.notes, '');
  assert.equal(wiped.craftNotes, '');
  assert.equal(wiped.recentSlip, false);
});

// ============================================================================
// 4. Plain-Text Summary Report Formatting Tests
// ============================================================================

test('formatReadinessSummaryText generates comprehensive clinical self-report', () => {
  resetReadinessState();

  const customState = {
    substance: 'alcohol',
    customSubstance: 'Craft beer & bourbon',
    assessorRole: 'individual',
    timestamp: 1704067200000,
    answers: {
      s1: 1,
      s2: 1,
      s3: 4,
      s4: 4,
      s5: 5,
      s6: 5,
      s7: 3,
      s8: 1,
    },
    decisionalBalance: {
      likes: ['Relief from anxiety, stress, or intense emotional pain', 'Helps me unwind, relax, or sleep at night'],
      concerns: ['Conflict, tension, or broken trust with partner, children, or family', 'Physical withdrawal sickness, severe hangovers, or feeling trapped'],
      positives: ['Better physical energy, clearer thinking, and overall health', 'Saving money for things that truly matter to me and my family'],
      hurdles: ['Wondering how I will survive intense stress or anxiety without substances'],
      customLikes: 'Helps me tolerate loud family dinners',
      customConcerns: 'Waking up with heart racing at 3 AM',
    },
    notes: 'Want to ask doctor about naltrexone or acamprosate.',
    craftNotes: '',
    recentSlip: false,
  };

  const text = formatReadinessSummaryText(customState);

  // 1. Header & Metadata
  assert.match(text, /HARBORPATH STAGES OF CHANGE & READINESS EXPLORATION SUMMARY/);
  assert.match(text, /Explored Substance: alcohol \(Craft beer & bourbon\)/);
  assert.match(text, /Participant Role: individual/);

  // 2. Stage Assessment
  assert.match(text, /Identified Stage: PREPARATION/);
  assert.match(text, /Plain Language: Ready to take steps soon and planning how/);
  assert.match(text, /Motivational Coaching Prompt:/);
  assert.match(text, /URICA Readiness Composite Score:/);
  assert.match(text, /Preparation \(Planning\):\s+5(\.0+)? \/ 5\.0/);

  // 3. Recommended Next Steps
  assert.match(text, /Recommended Next Steps:/);
  assert.match(text, /Schedule a medical evaluation for FDA-approved medications/);

  // 4. Decisional Balance Matrix
  assert.match(text, /DECISIONAL BALANCE MATRIX/);
  assert.match(text, /What I Like About Using/);
  assert.match(text, /Relief from anxiety/);
  assert.match(text, /Notes: Helps me tolerate loud family dinners/);
  assert.match(text, /What Is Difficult or Worrying/);
  assert.match(text, /Notes: Waking up with heart racing at 3 AM/);
  assert.match(text, /What Would Be Better If Things Changed/);
  assert.match(text, /What Feels Hard About Changing/);

  // 5. Notes & Helplines
  assert.match(text, /Want to ask doctor about naltrexone or acamprosate/);
  assert.match(text, /CLINICAL & ETHICAL NOTICE/);
  assert.match(text, /988 Suicide & Crisis Lifeline: Call or text 988/);
  assert.match(text, /Never Use Alone: 1-800-484-3731/);
  assert.match(text, /SAMHSA National Helpline: 1-800-662-4357/);
});

// ============================================================================
// 5. Interactive DOM Tree Generation & Accessibility Tests
// ============================================================================

test('readinessView renders accessible WCAG 2.2 AA compliant DOM structure and handles events', () => {
  // Lightweight MockNode for Node test environment
  class MockNode {
    constructor(tag) {
      this.tagName = tag ? tag.toUpperCase() : 'DIV';
      this.className = '';
      this.dataset = {};
      this.attributes = {};
      this.listeners = {};
      this.children = [];
      this.value = '';
      this.checked = false;
      this.hidden = false;
      this._textContent = '';
      this.classList = {
        _classes: new Set(),
        add: (...cls) => cls.forEach((c) => this.classList._classes.add(c)),
        remove: (...cls) => cls.forEach((c) => this.classList._classes.delete(c)),
        toggle: (c, force) => {
          if (force !== undefined) {
            if (force) this.classList._classes.add(c);
            else this.classList._classes.delete(c);
          } else {
            if (this.classList._classes.has(c)) this.classList._classes.delete(c);
            else this.classList._classes.add(c);
          }
        },
        contains: (c) => this.classList._classes.has(c),
      };
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
    getAttribute(k) {
      return this.attributes[k] ?? null;
    }
    removeAttribute(k) {
      delete this.attributes[k];
    }
    addEventListener(evt, fn) {
      this.listeners[evt] = fn;
    }
    dispatchEvent(evt, data = {}) {
      const fn = this.listeners[evt];
      if (typeof fn === 'function') fn({ target: this, ...data });
    }
    append(...items) {
      for (const item of items) {
        if (typeof item === 'string' || typeof item === 'number') {
          const textNode = new MockNode('#text');
          textNode._textContent = String(item);
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
      this.parent = null;
    }
    findAll(pred, acc = []) {
      if (pred(this)) acc.push(this);
      for (const ch of this.children) {
        if (ch instanceof MockNode) ch.findAll(pred, acc);
      }
      return acc;
    }
    querySelectorAll(sel) {
      const isTag = /^[a-z]+$/i.test(sel);
      const isClass = sel.startsWith('.');
      return this.findAll((n) => {
        if (isTag) return n.tagName === sel.toUpperCase();
        if (isClass) return n.className?.includes(sel.slice(1)) || n.classList?.contains(sel.slice(1));
        return false;
      });
    }
    querySelector(sel) {
      return this.querySelectorAll(sel)[0] || null;
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
    resetReadinessState();
    const root = readinessView();
    const fullText = root.textContent;

    // 1. Verify Core Headings & Clinical Content
    assert.match(fullText, /Readiness & Stages of Change/);
    assert.match(fullText, /100% Ephemeral In-RAM Privacy Guarantee/);
    assert.match(fullText, /Live Readiness & Stage Summary/);
    assert.match(fullText, /Readiness Assessment \(URICA-Inspired\)/);
    assert.match(fullText, /Decisional Balance Tool \(Pros & Cons Matrix\)/);
    assert.match(fullText, /Guidance for Families & Loved Ones \(CRAFT Principles\)/);

    // 2. Verify 8 Question Fieldsets
    const fieldsets = root.findAll((n) => n.tagName === 'FIELDSET' && n.className.includes('dimension-item'));
    assert.equal(fieldsets.length, 8, 'Must render exactly 8 URICA questionnaire fieldsets');

    // 3. Verify Action Buttons exist
    const copyBtns = root.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('Copy Readiness Summary'));
    assert.equal(copyBtns.length, 1);
    const printBtns = root.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('Print Handout'));
    assert.equal(printBtns.length, 1);
    const resetBtns = root.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('Clear All Answers'));
    assert.equal(resetBtns.length, 1);

    // 4. Test Interactive Events: Choosing a Radio Answer
    const s1Radios = root.findAll((n) => n.tagName === 'INPUT' && n.getAttribute('name') === 'urica_s1');
    assert.equal(s1Radios.length, 5);

    // Select "5 - Strongly Agree" on s1 (precontemplation)
    const opt5 = s1Radios.find((r) => r.getAttribute('value') === '5');
    assert.ok(opt5);
    opt5.dispatchEvent('change');
    assert.equal(getReadinessState().answers.s1, 5);

    // 5. Test Interactive Recurrence Mode Toggle
    const slipBtn = root.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('Recurrence'))[0];
    assert.ok(slipBtn);
    slipBtn.dispatchEvent('click');
    assert.equal(getReadinessState().recentSlip, true);
    assert.equal(calculateReadinessStage(getReadinessState()).stage, 'recurrence');

    // Toggle recurrence off
    slipBtn.dispatchEvent('click');
    assert.equal(getReadinessState().recentSlip, false);

    // 6. Test Interactive Decisional Balance Checkbox
    const checkboxes = root.findAll((n) => n.tagName === 'INPUT' && n.getAttribute('type') === 'checkbox');
    assert.ok(checkboxes.length >= 20, 'Should have multiple checkboxes across 4 quadrants');
    const firstCheckbox = checkboxes[0];
    firstCheckbox.checked = true;
    firstCheckbox.dispatchEvent('change');
    assert.ok(getReadinessState().decisionalBalance.likes.length > 0);

    // 7. Test Quick Exit / RAM Wipe via resetReadinessState
    resetReadinessState();
    assert.deepEqual(getReadinessState().answers, {});
    assert.equal(getReadinessState().recentSlip, false);
    assert.deepEqual(getReadinessState().decisionalBalance.likes, []);
  } finally {
    globalThis.document = prevDoc;
  }
});

// ============================================================================
// 6. Strict Zero-PII, Zero-Dependency & CSP Security Audits
// ============================================================================

test('readiness.js contains zero innerHTML, outerHTML, insertAdjacentHTML, or inline style=', () => {
  const src = readFileSync(readinessFilePath, 'utf8');

  assert.doesNotMatch(
    src,
    /\.innerHTML\s*=/,
    'readiness.js must never assign innerHTML (XSS risk, CSP violation)',
  );
  assert.doesNotMatch(
    src,
    /\.outerHTML\s*=/,
    'readiness.js must never assign outerHTML (XSS risk, CSP violation)',
  );
  assert.doesNotMatch(
    src,
    /\.insertAdjacentHTML\s*\(/,
    'readiness.js must never call insertAdjacentHTML (XSS risk)',
  );
  assert.doesNotMatch(
    src,
    /style\s*:/,
    'readiness.js must never set inline styles via h() (CSP violation)',
  );
});

test('readiness.js never writes to localStorage, sessionStorage, or document.cookie', () => {
  const src = readFileSync(readinessFilePath, 'utf8');

  assert.doesNotMatch(
    src,
    /localStorage\s*\.\s*setItem/,
    'readiness.js must not write to localStorage (100% ephemeral privacy violation)',
  );
  assert.doesNotMatch(
    src,
    /sessionStorage\s*\.\s*setItem/,
    'readiness.js must not write to sessionStorage (100% ephemeral privacy violation)',
  );
  assert.doesNotMatch(
    src,
    /document\s*\.\s*cookie\s*=/,
    'readiness.js must not write to document.cookie (privacy violation)',
  );
});
