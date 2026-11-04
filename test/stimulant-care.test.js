// test/stimulant-care.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

class MockNode {
  constructor(tagName = 'div') {
    this.tagName = tagName ? tagName.toUpperCase() : '#TEXT';
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this._textContent = '';
    this._eventListeners = {};
    this.parent = null;
    this.checked = false;
    this.value = '';
    this.id = '';
  }
  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map(c => typeof c === 'string' ? c : c.textContent).join('');
  }
  set textContent(val) {
    this._textContent = String(val ?? '');
    this.children = [];
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  removeAttribute(k) { delete this.attributes[k]; }
  appendChild(child) {
    if (child) {
      if (child instanceof MockNode) child.parent = this;
      this.children.push(child);
    }
    return child;
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
  addEventListener(evt, handler) {
    if (!this._eventListeners[evt]) this._eventListeners[evt] = [];
    this._eventListeners[evt].push(handler);
  }
  dispatchEvent(evt, data = {}) {
    const handlers = this._eventListeners[evt] || [];
    handlers.forEach(h => h({ target: this, ...data }));
  }
}

globalThis.Node = MockNode;
globalThis.document = {
  createElement: (tag) => new MockNode(tag),
  createElementNS: (_ns, tag) => new MockNode(tag),
  documentElement: { lang: 'en' },
  querySelectorAll: () => [],
  getElementById: () => null
};
globalThis.window = {
  scrollTo: () => {},
  print: () => {}
};

test('Stimulant Care & Overamping Module (public/js/views/stimulantCare.js)', async (t) => {
  const mod = await import('../public/js/views/stimulantCare.js');

  await t.test('Module Exports & Standards Framework Integrity', () => {
    assert.ok(mod.STIMULANT_CARE_STANDARDS, 'STIMULANT_CARE_STANDARDS must be exported');
    assert.ok(mod.STIMULANT_CARE_STANDARDS.OVERAMPING_TYPES, 'Overamping types must exist');
    assert.ok(mod.STIMULANT_CARE_STANDARDS.DE_ESCALATION_COOLING, 'De-escalation & cooling must exist');
    assert.ok(mod.STIMULANT_CARE_STANDARDS.BEHAVIORAL_INTERVENTIONS, 'Behavioral interventions must exist');
    assert.ok(mod.STIMULANT_CARE_STANDARDS.SAFER_INHALATION_EQUIPMENT, 'Safer inhalation rules must exist');

    assert.equal(typeof mod.evaluateStimulantHarmRisk, 'function');
    assert.equal(typeof mod.formatStimulantSummaryText, 'function');
    assert.equal(typeof mod.stimulantCareView, 'function');
    assert.equal(typeof mod.getStimulantCareState, 'function');
    assert.equal(typeof mod.setStimulantCareState, 'function');
    assert.equal(typeof mod.resetStimulantCareState, 'function');
  });

  await t.test('evaluateStimulantHarmRisk: Hyperthermia & Chest Pain Trigger CRITICAL with Restraint Prohibition', () => {
    const res = mod.evaluateStimulantHarmRisk({
      primaryStimulant: 'methamphetamine',
      hyperthermiaSymptoms: true,
      chestPainSymptoms: true
    });

    assert.equal(res.urgencyLevel, 'CRITICAL');
    const critAlert = res.alerts.find(a => a.priority === 'CRITICAL');
    assert.ok(critAlert, 'Must alert 911 for physical emergency');
    const coolDirective = res.careDirectives.find(d => d.titleEn.includes('Absolute Restraint Prohibition'));
    assert.ok(coolDirective, 'Must forbid physical restraints to prevent rhabdomyolysis');
  });

  await t.test('evaluateStimulantHarmRisk: Prolonged Sleep Deprivation Flags Psychosis Decompression', () => {
    const res = mod.evaluateStimulantHarmRisk({
      sleepDeprivedDays: 3,
      overampingType: 'psychosis_paranoia'
    });

    const sleepAlert = res.alerts.find(a => a.titleEn.includes('Sleep Deprivation'));
    assert.ok(sleepAlert, 'Must address sleep deprivation exhaustion');
  });

  await t.test('evaluateStimulantHarmRisk: Untested Supply Mandates 10:1 Water Dilution FTS Rule', () => {
    const res = mod.evaluateStimulantHarmRisk({
      fentanylTested: false
    });

    const ftsPt = res.harmReductionPoints.find(p => p.titleEn.includes('10:1 Water Dilution'));
    assert.ok(ftsPt, 'Must provide 10:1 dilution rule for stimulants');
    assert.ok(ftsPt.textEn.includes('1 full teaspoon'));
  });

  await t.test('evaluateStimulantHarmRisk: Promotes Contingency Management (CMI) as Gold Standard', () => {
    const res = mod.evaluateStimulantHarmRisk();
    const cmiDir = res.careDirectives.find(d => d.titleEn.includes('Contingency Management'));
    assert.ok(cmiDir, 'Must recommend CMI behavioral therapy');
  });

  await t.test('In-RAM Ephemeral State Management & Deterministic Reset', () => {
    mod.resetStimulantCareState();
    const initial = mod.getStimulantCareState();
    assert.equal(initial.activeTab, 'overview');
    assert.equal(initial.hyperthermiaSymptoms, false);

    mod.setStimulantCareState({ activeTab: 'assessment', hyperthermiaSymptoms: true });
    const updated = mod.getStimulantCareState();
    assert.equal(updated.activeTab, 'assessment');
    assert.equal(updated.hyperthermiaSymptoms, true);

    mod.resetStimulantCareState();
    const reset = mod.getStimulantCareState();
    assert.equal(reset.activeTab, 'overview');
    assert.equal(reset.hyperthermiaSymptoms, false);
  });

  await t.test('formatStimulantSummaryText: Bilingual report formatting', () => {
    const textEn = mod.formatStimulantSummaryText({
      primaryStimulant: 'cocaine_crack',
      hyperthermiaSymptoms: true,
      sleepDeprivedDays: 2,
      fentanylTested: false
    }, 'en');

    assert.ok(textEn.includes('STIMULANT CARE, OVERAMPING'));
    assert.ok(textEn.includes('CRITICAL'));
    assert.ok(textEn.includes('10:1 Water Dilution'));

    const textEs = mod.formatStimulantSummaryText({
      primaryStimulant: 'cocaine_crack',
      hyperthermiaSymptoms: true,
      sleepDeprivedDays: 2,
      fentanylTested: false
    }, 'es');

    assert.ok(textEs.includes('PLAN CLÍNICO DE MANEJO DE ESTIMULANTES'));
    assert.ok(textEs.includes('DIRECTIVAS DE CUIDADO'));
  });

  await t.test('stimulantCareView: Mounts accessible DOM across tabs', () => {
    const container = new MockNode('div');
    mod.stimulantCareView(container);
    assert.ok(container.children.length > 0, 'Container should mount header and tabs');

    mod.setStimulantCareState({ activeTab: 'assessment' });
    mod.stimulantCareView(container);
    assert.ok(container.children.length > 0);

    mod.setStimulantCareState({ activeTab: 'safer-use' });
    mod.stimulantCareView(container);
    assert.ok(container.children.length > 0);
  });

  await t.test('Static Security & Privacy Compliance Audit', () => {
    const code = fs.readFileSync('public/js/views/stimulantCare.js', 'utf8');
    assert.doesNotMatch(code, /localStorage|sessionStorage|document\.cookie/i, 'No device storage writes');
    assert.doesNotMatch(code, /innerHTML|outerHTML/i, 'No innerHTML allowed');
    assert.doesNotMatch(code, /style\s*=/i, 'No inline style attributes allowed');
    assert.doesNotMatch(code, /saved to disk|erases everything|zero-knowledge|does not record search terms|never stored|nothing is logged|100% private/i, 'No absolute overclaims');
  });
});

