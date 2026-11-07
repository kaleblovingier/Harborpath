// test/immigrant-health.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

class MockNode {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this._textContent = '';
    this._eventListeners = {};
  }
  get textContent() {
    if (this.children.length > 0) {
      return this.children.map(c => typeof c === 'string' ? c : c.textContent).join('');
    }
    return this._textContent;
  }
  set textContent(val) {
    this.children = [];
    this._textContent = String(val);
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
  replaceChildren(...nodes) {
    this.children = [...nodes];
  }
  addEventListener(evt, handler) {
    if (!this._eventListeners[evt]) this._eventListeners[evt] = [];
    this._eventListeners[evt].push(handler);
  }
  dispatchEvent(evt) {
    const handlers = this._eventListeners[evt.type] || [];
    handlers.forEach(h => h(evt));
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

test('Immigrant & Language Access Health Rights Module (public/js/views/immigrantHealth.js)', async (t) => {
  const mod = await import('../public/js/views/immigrantHealth.js');

  await t.test('Module Exports & Statutory Framework Integrity', () => {
    assert.ok(mod.IMMIGRANT_HEALTH_RIGHTS, 'IMMIGRANT_HEALTH_RIGHTS must be exported');
    assert.ok(mod.IMMIGRANT_HEALTH_RIGHTS.PROTECTED_AREAS, 'Protected areas must exist');
    assert.ok(mod.IMMIGRANT_HEALTH_RIGHTS.EMERGENCY_MEDICAID, 'Emergency medicaid must exist');
    assert.ok(mod.IMMIGRANT_HEALTH_RIGHTS.PUBLIC_CHARGE_EXCLUSION, 'Public charge exclusion must exist');
    assert.ok(mod.IMMIGRANT_HEALTH_RIGHTS.LANGUAGE_ACCESS, 'Language access must exist');
    assert.ok(mod.IMMIGRANT_HEALTH_RIGHTS.FQHC_SAFETY_NET, 'FQHC safety net must exist');

    assert.equal(typeof mod.evaluateImmigrantHealthRights, 'function');
    assert.equal(typeof mod.formatImmigrantSummaryText, 'function');
    assert.equal(typeof mod.immigrantHealthView, 'function');
    assert.equal(typeof mod.getImmigrantState, 'function');
    assert.equal(typeof mod.setImmigrantState, 'function');
    assert.equal(typeof mod.resetImmigrantState, 'function');
  });

  await t.test('evaluateImmigrantHealthRights: Emergency Medical Condition Escapes & EMTALA', () => {
    const res = mod.evaluateImmigrantHealthRights({
      emergencyCondition: true,
      immigrationConcern: 'ice_safety',
      englishProficiency: 'fluent_english'
    });

    assert.ok(res.urgentDirectives.length > 0, 'Must provide urgent directive for emergency');
    assert.equal(res.urgentDirectives[0].priority, 'CRITICAL');
    assert.ok(res.protections.some(p => p.includes('EMTALA')));
    assert.ok(res.protections.some(p => p.includes('Emergency Medicaid')));
    assert.ok(res.citations.includes('42 U.S.C. § 1395dd'));
    assert.ok(res.citations.includes('42 U.S.C. § 1396b(v)'));
  });

  await t.test('evaluateImmigrantHealthRights: Title VI Language Access and Interpreter Mandates', () => {
    const res = mod.evaluateImmigrantHealthRights({
      englishProficiency: 'interpreter_needed',
      immigrationConcern: 'ice_safety'
    });

    const langRec = res.recommendations.find(r => r.topic === 'language_access');
    assert.ok(langRec, 'Must recommend qualified medical interpreter');
    assert.ok(langRec.actionPromptEn.includes('Title VI'), 'Must provide actionable Title VI prompt');
    assert.ok(res.citations.includes('42 U.S.C. § 2000d'));
    assert.ok(res.citations.includes('Executive Order 13166'));
  });

  await t.test('evaluateImmigrantHealthRights: Public Charge Exemption for SUD & Healthcare', () => {
    const res = mod.evaluateImmigrantHealthRights({
      immigrationConcern: 'public_charge'
    });

    const pcRec = res.recommendations.find(r => r.topic === 'public_charge_exemption');
    assert.ok(pcRec, 'Must provide public charge exemption guidance');
    assert.ok(res.citations.includes('8 C.F.R. § 212.21'));
  });

  await t.test('evaluateImmigrantHealthRights: FQHC Sliding-Fee & No-SSN Protections', () => {
    const res = mod.evaluateImmigrantHealthRights({
      immigrationConcern: 'payment_and_fqhc'
    });

    const fqhcRec = res.recommendations.find(r => r.topic === 'fqhc_sliding_fee');
    assert.ok(fqhcRec, 'Must provide FQHC sliding-scale guidance');
    assert.ok(res.citations.includes('42 U.S.C. § 254b'));
  });

  await t.test('In-RAM Ephemeral State Management & Deterministic Reset', () => {
    mod.resetImmigrantState();
    const initial = mod.getImmigrantState();
    assert.equal(initial.activeTab, 'overview');
    assert.equal(initial.emergencyCondition, false);

    mod.setImmigrantState({ activeTab: 'decision-aid', emergencyCondition: true });
    const updated = mod.getImmigrantState();
    assert.equal(updated.activeTab, 'decision-aid');
    assert.equal(updated.emergencyCondition, true);

    mod.resetImmigrantState();
    const reset = mod.getImmigrantState();
    assert.equal(reset.activeTab, 'overview');
    assert.equal(reset.emergencyCondition, false);
  });

  await t.test('formatImmigrantSummaryText: Formats bilingual clinical and legal outputs', () => {
    const textEn = mod.formatImmigrantSummaryText({
      emergencyCondition: true,
      immigrationConcern: 'ice_safety',
      englishProficiency: 'interpreter_needed'
    }, 'en');
    assert.ok(textEn.includes('IMMIGRANT HEALTH RIGHTS'));
    assert.ok(textEn.includes('EMTALA'));
    assert.ok(textEn.includes('Title VI'));

    const textEs = mod.formatImmigrantSummaryText({
      emergencyCondition: true,
      immigrationConcern: 'ice_safety',
      englishProficiency: 'interpreter_needed'
    }, 'es');
    assert.ok(textEs.includes('DERECHOS DE SALUD'));
    assert.ok(textEs.includes('EMTALA'));
  });

  await t.test('immigrantHealthView: Mounts accessible DOM without errors', () => {
    const container = new MockNode('div');
    mod.immigrantHealthView(container);
    assert.ok(container.children.length > 0, 'Container should receive rendered elements');

    mod.setImmigrantState({ activeTab: 'decision-aid' });
    mod.immigrantHealthView(container);
    assert.ok(container.children.length > 0);
  });

  await t.test('Static Security & Privacy Compliance Audit', () => {
    const code = fs.readFileSync('public/js/views/immigrantHealth.js', 'utf8');
    assert.doesNotMatch(code, /localStorage|sessionStorage|document\.cookie/i, 'No device storage writes allowed');
    assert.doesNotMatch(code, /innerHTML|outerHTML/i, 'No innerHTML allowed');
    assert.doesNotMatch(code, /style\s*=/i, 'No inline style attributes allowed');
    assert.doesNotMatch(code, /saved to disk|erases everything|zero-knowledge|does not record search terms|never stored|nothing is logged|100% private/i, 'No absolute overclaims');
  });
});
