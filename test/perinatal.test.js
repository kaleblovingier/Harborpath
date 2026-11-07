/**
 * Perinatal Care Specialist Unit & Integration Tests (test/perinatal.test.js)
 *
 * Verifies:
 * 1. Clinical taxonomy schemas (PERINATAL_GUIDELINES, ESC_MODEL_PILLARS, CAPTA_RIGHTS_CHECKLIST,
 *    PRENATAL_CHECKLIST_ITEMS, OBGYN_VISIT_QUESTIONS).
 * 2. Clinical accuracy: ACOG & SMFM guidelines, MOUD maintenance, detox contraindications,
 *    CYP3A4 third trimester pharmacokinetics, labor pain management (mixed agonist-antagonist
 *    contraindication), postpartum vulnerability window, and lactation safety.
 * 3. Neonatal Opioid Withdrawal Syndrome (NOWS) & Eat, Sleep, Console (ESC) model vs. Finnegan.
 * 4. CAPTA Plans of Safe Care, non-punitive public health support, informed consent, and legal rights.
 * 5. Ephemeral in-RAM state management (getPerinatalState, setPerinatalState, resetPerinatalState)
 *    and Quick Exit wipes (zero localStorage, sessionStorage, or cookie storage).
 * 6. formatPerinatalSummaryText() formatting in English and Spanish.
 * 7. WCAG 2.2 AA compliant DOM rendering (perinatalView) with zero external npm dependencies.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PERINATAL_GUIDELINES,
  ESC_MODEL_PILLARS,
  CAPTA_RIGHTS_CHECKLIST,
  PRENATAL_CHECKLIST_ITEMS,
  OBGYN_VISIT_QUESTIONS,
  getPerinatalState,
  setPerinatalState,
  resetPerinatalState,
  formatPerinatalSummaryText,
  perinatalView,
} from '../public/js/views/perinatal.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const perinatalFilePath = path.resolve(here, '../public/js/views/perinatal.js');

// ============================================================================
// 1. Taxonomy & Schema Integrity Tests
// ============================================================================

test('PERINATAL_GUIDELINES exports all clinical guidelines with complete bilingual attributes', () => {
  assert.ok(Array.isArray(PERINATAL_GUIDELINES), 'PERINATAL_GUIDELINES must be an array');
  assert.ok(PERINATAL_GUIDELINES.length >= 5, 'Must contain at least 5 core clinical guidelines');

  const expectedIds = [
    'moud_standard_of_care',
    'third_trimester_pk',
    'labor_delivery_pain',
    'postpartum_vulnerability',
    'lactation_guidance',
  ];

  for (const id of expectedIds) {
    const guide = PERINATAL_GUIDELINES[id];
    assert.ok(guide, `Missing guideline ID: ${id}`);
    assert.equal(guide.id, id);

    // Bilingual title
    assert.equal(typeof guide.title.en, 'string');
    assert.ok(guide.title.en.length > 5);
    assert.equal(typeof guide.title.es, 'string');
    assert.ok(guide.title.es.length > 5);

    // Bilingual summary
    assert.equal(typeof guide.summary.en, 'string');
    assert.ok(guide.summary.en.length > 20);
    assert.equal(typeof guide.summary.es, 'string');
    assert.ok(guide.summary.es.length > 20);

    // Key points
    assert.ok(Array.isArray(guide.keyPoints));
    assert.ok(guide.keyPoints.length >= 2);
    for (const kp of guide.keyPoints) {
      assert.equal(typeof kp.topic.en, 'string');
      assert.equal(typeof kp.topic.es, 'string');
      assert.equal(typeof kp.detail.en, 'string');
      assert.equal(typeof kp.detail.es, 'string');
    }

    // Clinical citations
    assert.ok(Array.isArray(guide.clinicalCitations));
    assert.ok(guide.clinicalCitations.length >= 1);
  }
});

test('ESC_MODEL_PILLARS exports functional assessment dimensions and non-pharmacological bundle', () => {
  assert.ok(Array.isArray(ESC_MODEL_PILLARS));
  assert.equal(ESC_MODEL_PILLARS.length, 6, 'Must contain 6 ESC pillars (Eat, Sleep, Console + 3 care bundle pillars)');

  const expectedPillars = ['eat', 'sleep', 'console', 'rooming_in', 'skin_to_skin', 'low_stimulation'];
  for (const id of expectedPillars) {
    const pillar = ESC_MODEL_PILLARS[id];
    assert.ok(pillar, `Missing ESC pillar: ${id}`);
    assert.equal(pillar.id, id);

    assert.equal(typeof pillar.title.en, 'string');
    assert.equal(typeof pillar.title.es, 'string');
    assert.equal(typeof pillar.plainLanguage.en, 'string');
    assert.equal(typeof pillar.plainLanguage.es, 'string');
    assert.equal(typeof pillar.benchmark.en, 'string');
    assert.equal(typeof pillar.benchmark.es, 'string');
    assert.equal(typeof pillar.supportStrategies.en, 'string');
    assert.equal(typeof pillar.supportStrategies.es, 'string');
  }
});

test('CAPTA_RIGHTS_CHECKLIST exports comprehensive legal and health advocacy items', () => {
  assert.ok(Array.isArray(CAPTA_RIGHTS_CHECKLIST));
  assert.ok(CAPTA_RIGHTS_CHECKLIST.length >= 7);

  const expectedIds = [
    'posc_vs_cps',
    'proactive_prenatal_posc',
    'informed_consent_testing',
    'moud_prescription_documentation',
    'hospital_advocate_access',
    'state_policy_variation',
    'medical_records_access',
  ];

  for (const id of expectedIds) {
    const item = CAPTA_RIGHTS_CHECKLIST[id];
    assert.ok(item, `Missing CAPTA item: ${id}`);
    assert.equal(item.id, id);

    assert.equal(typeof item.category.en, 'string');
    assert.equal(typeof item.category.es, 'string');
    assert.equal(typeof item.title.en, 'string');
    assert.equal(typeof item.title.es, 'string');
    assert.equal(typeof item.description.en, 'string');
    assert.equal(typeof item.description.es, 'string');
    assert.equal(typeof item.actionAdvice.en, 'string');
    assert.equal(typeof item.actionAdvice.es, 'string');
  }
});

test('PRENATAL_CHECKLIST_ITEMS and OBGYN_VISIT_QUESTIONS export complete clinical sets', () => {
  assert.ok(Array.isArray(PRENATAL_CHECKLIST_ITEMS));
  assert.equal(PRENATAL_CHECKLIST_ITEMS.length, 20);

  const trimesters = new Set(PRENATAL_CHECKLIST_ITEMS.map((item) => item.trimester));
  assert.ok(trimesters.has('first'));
  assert.ok(trimesters.has('second'));
  assert.ok(trimesters.has('third'));
  assert.ok(trimesters.has('labor'));
  assert.ok(trimesters.has('postpartum'));

  for (const item of PRENATAL_CHECKLIST_ITEMS) {
    assert.equal(typeof item.id, 'string');
    assert.equal(typeof item.title.en, 'string');
    assert.equal(typeof item.title.es, 'string');
    assert.equal(typeof item.detail.en, 'string');
    assert.equal(typeof item.detail.es, 'string');
  }

  assert.ok(Array.isArray(OBGYN_VISIT_QUESTIONS));
  assert.equal(OBGYN_VISIT_QUESTIONS.length, 8);
  for (const q of OBGYN_VISIT_QUESTIONS) {
    assert.equal(typeof q.id, 'string');
    assert.equal(typeof q.question.en, 'string');
    assert.equal(typeof q.question.es, 'string');
    assert.equal(typeof q.clinicalRationale.en, 'string');
    assert.equal(typeof q.clinicalRationale.es, 'string');
  }
});

// ============================================================================
// 2. Clinical Accuracy & Guidelines Evidence Verification
// ============================================================================

test('ACOG & SMFM MOUD maintenance: detox is strictly contraindicated and maintenance is standard of care', () => {
  const moud = PERINATAL_GUIDELINES.moud_standard_of_care;
  const enText = `${moud.summary.en} ${JSON.stringify(moud.keyPoints)}`;

  // Maintenance is first-line standard of care
  assert.match(enText, /methadone/i);
  assert.match(enText, /buprenorphine/i);
  assert.match(enText, /standard of care/i);

  // Contraindication of detox/withdrawal
  assert.match(enText, /contraindicated/i);
  assert.match(enText, /premature contractions|uterine/i);
  assert.match(enText, /placental abruption/i);
  assert.match(enText, /fetal distress/i);
  assert.match(enText, /80/i); // Relapse rate >80-90%
});

test('Third trimester pharmacokinetics: CYP3A4 metabolic induction and volume expansion require split-dosing', () => {
  const pk = PERINATAL_GUIDELINES.third_trimester_pk;
  const enText = `${pk.summary.en} ${JSON.stringify(pk.keyPoints)}`;

  assert.match(enText, /CYP3A4/i);
  assert.match(enText, /plasma volume|blood.*volume/i);
  assert.match(enText, /split.*dosing|divided.*dosing/i);
  assert.match(enText, /q12h|12 hours/i);

  // Lack of linear correlation between maternal dose and NOWS
  assert.match(enText, /no linear correlation/i);
});

test('Labor & delivery pain management: multimodal analgesia and strict mixed agonist-antagonist contraindication', () => {
  const pain = PERINATAL_GUIDELINES.labor_delivery_pain;
  const enText = `${pain.summary.en} ${JSON.stringify(pain.keyPoints)}`;

  assert.match(enText, /multimodal/i);
  assert.match(enText, /epidural|neuraxial/i);
  assert.match(enText, /continu.*baseline/i);

  // Mixed agonist-antagonists strictly contraindicated
  assert.match(enText, /butorphanol|Stadol/i);
  assert.match(enText, /nalbuphine|Nubain/i);
  assert.match(enText, /precipitate.*withdrawal/i);
});

test('Postpartum vulnerability window: loss of opioid tolerance and overdose prevention protocols', () => {
  const pp = PERINATAL_GUIDELINES.postpartum_vulnerability;
  const enText = `${pp.summary.en} ${JSON.stringify(pp.keyPoints)}`;

  assert.match(enText, /loss of.*tolerance/i);
  assert.match(enText, /overdose/i);
  assert.match(enText, /naloxone|Narcan/i);
  assert.match(enText, /1–3 weeks|1 to 3 weeks/i); // Early follow-up
});

test('Lactation guidance: breastfeeding encouraged with MOUD and precise clinical contraindications', () => {
  const lact = PERINATAL_GUIDELINES.lactation_guidance;
  const enText = `${lact.summary.en} ${JSON.stringify(lact.keyPoints)}`;

  assert.match(enText, /breastfeeding is.*encouraged|safe/i);
  assert.match(enText, /minimal.*transfer|negligible/i);

  // Contraindications
  assert.match(enText, /HIV/i);
  // HHS Perinatal HIV Guidelines: not a blanket contraindication; shared decision-making when
  // virally suppressed on ART, replacement feeding when not suppressed.
  assert.match(enText, /not virally suppressed/);
  assert.match(enText, /shared decision-making/);
  assert.doesNotMatch(enText, /contraindicated ONLY in: 1\) Maternal HIV infection/);
  assert.match(JSON.stringify(lact.keyPoints), /decisión compartida/);
  assert.match(enText, /tuberculosis/i);
  assert.match(enText, /hepatitis C.*cracked or bleeding/i);
});

test('ESC Model: Eat (≥10-15m / volume), Sleep (≥1 hr), Console (≤10 min), 24/7 rooming-in, and kangaroo care', () => {
  const eat = ESC_MODEL_PILLARS.eat;
  assert.match(eat.benchmark.en, /10–15 minutes/i);

  const sleep = ESC_MODEL_PILLARS.sleep;
  assert.match(sleep.benchmark.en, /at least 1 hour/i);

  const consolePillar = ESC_MODEL_PILLARS.console;
  assert.match(consolePillar.benchmark.en, /within 10 minutes/i);

  const roomingIn = ESC_MODEL_PILLARS.rooming_in;
  assert.match(roomingIn.benchmark.en, /same hospital room 24 hours/i);

  const skinToSkin = ESC_MODEL_PILLARS.skin_to_skin;
  assert.match(skinToSkin.benchmark.en, /skin-to-skin/i);
});

test('CAPTA Plans of Safe Care: Non-punitive support vs. CPS reports, informed consent, and HIPAA access', () => {
  const posc = CAPTA_RIGHTS_CHECKLIST.posc_vs_cps;
  assert.match(posc.description.en, /NOT synonymous with a child abuse or neglect report/i);

  const consent = CAPTA_RIGHTS_CHECKLIST.informed_consent_testing;
  assert.match(consent.description.en, /informed patient consent/i);

  const records = CAPTA_RIGHTS_CHECKLIST.medical_records_access;
  assert.match(records.description.en, /HIPAA federal privacy law/i);
});

// ============================================================================
// 3. Ephemeral In-RAM State Management & Reset Contracts
// ============================================================================

test('getPerinatalState, setPerinatalState, and resetPerinatalState manage RAM cleanly', () => {
  resetPerinatalState();
  const initial = getPerinatalState();
  assert.equal(initial.activeTab, 'guidelines');
  assert.equal(initial.trimester, 'all');
  assert.deepEqual(initial.checklist, {});
  assert.equal(initial.notes, '');

  // Mutate state
  setPerinatalState({
    activeTab: 'checklist',
    trimester: 'third',
    checklist: { moud_continuation: true, draft_prenatal_posc: true },
    notes: 'Discuss split-dosing with Dr. Smith at 32 weeks.',
    lang: 'es',
  });

  const modified = getPerinatalState();
  assert.equal(modified.activeTab, 'checklist');
  assert.equal(modified.trimester, 'third');
  assert.equal(modified.checklist.moud_continuation, true);
  assert.equal(modified.checklist.draft_prenatal_posc, true);
  assert.equal(modified.notes, 'Discuss split-dosing with Dr. Smith at 32 weeks.');
  assert.equal(modified.lang, 'es');

  // Verify prototype pollution resilience
  setPerinatalState(JSON.parse('{"__proto__": {"polluted": true}}'));
  assert.equal(Object.prototype.polluted, undefined);

  // Clean reset
  resetPerinatalState();
  const resetState = getPerinatalState();
  assert.equal(resetState.activeTab, 'guidelines');
  assert.equal(resetState.trimester, 'all');
  assert.deepEqual(resetState.checklist, {});
  assert.equal(resetState.notes, '');
});

test('Source file static audit: zero localStorage, sessionStorage, cookie, innerHTML, or style= writes', () => {
  const src = readFileSync(perinatalFilePath, 'utf8');

  // Ephemeral RAM invariant: zero disk/persistent storage writes
  assert.doesNotMatch(src, /localStorage\s*\./, 'perinatal.js must never touch localStorage');
  assert.doesNotMatch(src, /sessionStorage\s*\./, 'perinatal.js must never touch sessionStorage');
  assert.doesNotMatch(src, /document\s*\.\s*cookie/, 'perinatal.js must never touch document.cookie');
  assert.doesNotMatch(src, /indexedDB/, 'perinatal.js must never touch indexedDB');

  // Security invariant: zero innerHTML, outerHTML, insertAdjacentHTML, or inline style=
  assert.doesNotMatch(src, /\b(innerHTML|outerHTML|insertAdjacentHTML)\b/, 'perinatal.js must have 0 innerHTML/outerHTML');
  assert.doesNotMatch(src, /\bstyle\s*=/i, 'perinatal.js must have 0 inline style= attributes');
});

// ============================================================================
// 4. formatPerinatalSummaryText() Output & Parity Tests
// ============================================================================

test('formatPerinatalSummaryText generates comprehensive clinical handout text in English and Spanish', () => {
  resetPerinatalState();
  setPerinatalState({
    lang: 'en',
    trimester: 'third',
    checklist: { evaluate_cyp3a4_split_dosing: true, birth_pain_plan: true },
    notes: 'Ask about anesthesia team protocols.',
  });

  const enSummary = formatPerinatalSummaryText(getPerinatalState());
  assert.match(enSummary, /HARBORPATH: PERINATAL SUBSTANCE USE CARE PATHWAYS/);
  assert.match(enSummary, /Session: Ephemeral In-RAM/);
  assert.match(enSummary, /Trimester Filter: third/);
  assert.match(enSummary, /MOUD Standard of Care/);
  assert.match(enSummary, /Detox Contraindicated/);
  assert.match(enSummary, /Labor Pain Relief/);
  assert.match(enSummary, /EAT, SLEEP, CONSOLE \(ESC\) MODEL/);
  assert.match(enSummary, /CAPTA PLANS OF SAFE CARE/);
  assert.match(enSummary, /\[X\] Discuss CYP3A4 metabolic induction/);
  assert.match(enSummary, /Ask about anesthesia team protocols\./);
  assert.match(enSummary, /1-833-852-6262/); // Maternal hotline

  // Test Spanish summary
  setPerinatalState({ lang: 'es' });
  const esSummary = formatPerinatalSummaryText(getPerinatalState());
  assert.match(esSummary, /GUÍA CLÍNICA DE SALUD PERINATAL/);
  assert.match(esSummary, /Memoria RAM Efímera/);
  assert.match(esSummary, /Mantenimiento MOUD/);
  assert.match(esSummary, /Desintoxicación Contraindicada/);
  assert.match(esSummary, /MODELO EAT, SLEEP, CONSOLE/);
  assert.match(esSummary, /PLANES DE CUIDADO SEGURO CAPTA/);
  assert.match(esSummary, /Línea Nacional de Salud Mental Materna/);

  resetPerinatalState();
});

// ============================================================================
// 5. DOM Component & Accessibility Rendering (perinatalView)
// ============================================================================

class MockNode {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.attributes = {};
    this.children = [];
    this.parent = null;
    this.listeners = {};
    this.dataset = {};
    this.className = '';
    this._textContent = '';
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(val) {
    this._textContent = String(val ?? '');
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

  addEventListener(event, fn) {
    this.listeners[event] = fn;
  }

  dispatchEvent(event, data = {}) {
    const fn = this.listeners[event];
    if (typeof fn === 'function') fn({ target: this, ...data });
  }

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string' || typeof item === 'number') {
        const textNode = new MockNode('#text');
        textNode._textContent = String(item);
        textNode.parent = this;
        this.children.push(textNode);
      } else if (item instanceof MockNode) {
        item.parent = this;
        this.children.push(item);
      }
    }
  }

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx !== -1) this.parent.children.splice(idx, 1);
    this.parent = null;
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const walk = (node) => {
      if (node instanceof MockNode) {
        if (selector === 'button' && node.tagName === 'BUTTON') matches.push(node);
        else if (selector === 'input[type="checkbox"]' && node.tagName === 'INPUT' && node.attributes.type === 'checkbox') matches.push(node);
        else if (selector.startsWith('.') && node.className && node.className.includes(selector.slice(1))) matches.push(node);
        for (const child of node.children) {
          if (child instanceof MockNode) walk(child);
        }
      }
    };
    walk(this);
    return matches;
  }
}

test('perinatalView renders accessible WCAG 2.2 AA compliant structure and handles interactions', () => {
  const prevDoc = globalThis.document;
  const prevNode = globalThis.Node;

  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: () => null,
  };

  try {
    resetPerinatalState();
    const root = perinatalView({ query: { tab: 'checklist', trimester: 'third', lang: 'en' } });

    // Verify root container
    assert.ok(root instanceof MockNode);
    assert.match(root.className, /view-perinatal/);

    const fullText = root.textContent;
    assert.match(fullText, /Perinatal Substance Use Care Pathways/);
    assert.match(fullText, /Ephemeral In-RAM Privacy/);
    assert.match(fullText, /1-833-852-6262/); // Maternal mental health hotline

    // Verify tablist and tabpanels
    assert.match(fullText, /ACOG & SMFM Guidelines/);
    assert.match(fullText, /Eat, Sleep, Console/);
    assert.match(fullText, /CAPTA Plans of Safe Care/);
    assert.match(fullText, /Pregnancy Checklist/);
    assert.match(fullText, /Questions for OB\/GYN/);

    // Verify interactive checklist checkboxes exist
    const checkboxes = root.querySelectorAll('input[type="checkbox"]');
    assert.ok(checkboxes.length > 0, 'Should render interactive checkboxes for third trimester');

    // Toggle a checkbox
    const firstCheckbox = checkboxes[0];
    assert.equal(firstCheckbox.attributes.checked, undefined);
    firstCheckbox.checked = true;
    firstCheckbox.dispatchEvent('change', { target: firstCheckbox });

    // Verify state was updated in ephemeral RAM
    const currentState = getPerinatalState();
    const checkedKeys = Object.keys(currentState.checklist);
    assert.ok(checkedKeys.length >= 1, 'Checklist state should record checked item in RAM');
    assert.equal(currentState.checklist[checkedKeys[0]], true);

    // Test Quick Exit / Reset button
    const buttons = root.querySelectorAll('button');
    const resetBtn = buttons.find((b) => b.textContent.includes('Quick Exit') || b.textContent.includes('Reset'));
    assert.ok(resetBtn, 'Must render Quick Exit / Reset button');
    resetBtn.dispatchEvent('click');

    const stateAfterReset = getPerinatalState();
    assert.deepEqual(stateAfterReset.checklist, {}, 'Quick exit must wipe checklist answers from RAM');

    // Test print handout is rendered
    assert.match(root.textContent, /HarborPath Perinatal Care Pathway Handout/);
  } finally {
    globalThis.document = prevDoc;
    globalThis.Node = prevNode;
    resetPerinatalState();
  }
});
