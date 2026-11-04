// test/medical-respite.test.js
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

test('Medical Respite & Recuperative Care Specialist (public/js/components/medicalRespiteFinder.js)', async (t) => {
  const mod = await import('../public/js/components/medicalRespiteFinder.js');

  await t.test('Module Exports & NHCHC Standards Framework Integrity', () => {
    assert.ok(mod.MEDICAL_RESPITE_STANDARDS, 'MEDICAL_RESPITE_STANDARDS must be exported');
    assert.ok(mod.MEDICAL_RESPITE_STANDARDS.CORE_DEFINITION, 'Core definition must exist');
    assert.ok(mod.MEDICAL_RESPITE_STANDARDS.SAFE_DISCHARGE_RIGHTS, 'Safe discharge rights must exist');

    assert.equal(typeof mod.evaluateMedicalRespiteReferral, 'function');
    assert.equal(typeof mod.medicalRespiteFinderComponent, 'function');
    assert.equal(typeof mod.getRespiteFinderState, 'function');
    assert.equal(typeof mod.setRespiteFinderState, 'function');
    assert.equal(typeof mod.resetRespiteFinderState, 'function');
  });

  await t.test('evaluateMedicalRespiteReferral: Unhoused patient with ADL independence qualifies', () => {
    const res = mod.evaluateMedicalRespiteReferral({
      homelessStatus: 'unhoused_street',
      adlIndependence: 'independent',
      moudPrescribed: true,
      postAcuteNeed: 'wound_care'
    });

    assert.equal(res.eligible, true);
    assert.ok(res.qualifiers.some(q => q.itemEn.includes('NHCHC and HUD')));
    assert.ok(res.qualifiers.some(q => q.itemEn.includes('buprenorphine or methadone')));
  });

  await t.test('evaluateMedicalRespiteReferral: Housed status flags ineligibility for respite bed', () => {
    const res = mod.evaluateMedicalRespiteReferral({
      homelessStatus: 'housed'
    });

    assert.equal(res.eligible, false);
    assert.ok(res.flags.some(f => f.typeEn.includes('Housing Status Ineligible')));
  });

  await t.test('evaluateMedicalRespiteReferral: Total ADL dependence escalates to Skilled Nursing Facility (SNF)', () => {
    const res = mod.evaluateMedicalRespiteReferral({
      homelessStatus: 'unhoused_street',
      adlIndependence: 'total_dependence'
    });

    assert.equal(res.eligible, false);
    assert.ok(res.flags.some(f => f.typeEn.includes('Higher Level of Care Required')));
    assert.ok(res.flags.some(f => f.textEn.includes('Skilled Nursing Facility')));
  });

  await t.test('In-RAM Ephemeral State Management & Deterministic Reset', () => {
    mod.resetRespiteFinderState();
    const initial = mod.getRespiteFinderState();
    assert.equal(initial.homelessStatus, 'unhoused_street');
    assert.equal(initial.adlIndependence, 'independent');

    mod.setRespiteFinderState({ homelessStatus: 'unhoused_shelter', postAcuteNeed: 'iv_antibiotics' });
    const updated = mod.getRespiteFinderState();
    assert.equal(updated.homelessStatus, 'unhoused_shelter');
    assert.equal(updated.postAcuteNeed, 'iv_antibiotics');

    mod.resetRespiteFinderState();
    const reset = mod.getRespiteFinderState();
    assert.equal(reset.homelessStatus, 'unhoused_street');
    assert.equal(reset.postAcuteNeed, 'wound_care');
  });

  await t.test('medicalRespiteFinderComponent: Mounts accessible DOM without errors', () => {
    const container = new MockNode('div');
    mod.medicalRespiteFinderComponent(container);
    assert.ok(container.children.length > 0, 'Container should mount header and form');
  });

  await t.test('Static Security & Privacy Compliance Audit', () => {
    const code = fs.readFileSync('public/js/components/medicalRespiteFinder.js', 'utf8');
    assert.doesNotMatch(code, /localStorage|sessionStorage|document\.cookie/i, 'No device storage writes');
    assert.doesNotMatch(code, /innerHTML|outerHTML/i, 'No innerHTML allowed');
    assert.doesNotMatch(code, /style\s*=/i, 'No inline style attributes allowed');
    assert.doesNotMatch(code, /saved to disk|erases everything|zero-knowledge|does not record search terms|never stored|nothing is logged|100% private/i, 'No absolute overclaims');
  });
});

