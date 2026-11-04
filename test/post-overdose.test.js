// test/post-overdose.test.js
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

test('Post-Overdose Response & Survivorship Module (public/js/views/postOverdose.js)', async (t) => {
  const mod = await import('../public/js/views/postOverdose.js');

  await t.test('Module Exports & Standards Framework Integrity', () => {
    assert.ok(mod.POST_OVERDOSE_STANDARDS, 'POST_OVERDOSE_STANDARDS must be exported');
    assert.ok(mod.POST_OVERDOSE_STANDARDS.CRITICAL_WINDOW, 'Critical window must exist');
    assert.ok(mod.POST_OVERDOSE_STANDARDS.NALOXONE_PHARMACOKINETICS, 'Naloxone duration must exist');
    assert.ok(mod.POST_OVERDOSE_STANDARDS.PRECIPITATED_WITHDRAWAL, 'Precipitated withdrawal must exist');
    assert.ok(mod.POST_OVERDOSE_STANDARDS.XYLAZINE_SEDATIVES, 'Xylazine sedatives must exist');
    assert.ok(mod.POST_OVERDOSE_STANDARDS.DEA_72_HOUR_BRIDGE, 'DEA 72-Hour rule must exist');

    assert.equal(typeof mod.evaluatePostOverdoseCare, 'function');
    assert.equal(typeof mod.formatPostOverdoseSummaryText, 'function');
    assert.equal(typeof mod.postOverdoseView, 'function');
    assert.equal(typeof mod.getPostOverdoseState, 'function');
    assert.equal(typeof mod.setPostOverdoseState, 'function');
    assert.equal(typeof mod.resetPostOverdoseState, 'function');
  });

  await t.test('evaluatePostOverdoseCare: Flags Rebound Sedation Vulnerability Window', () => {
    const res = mod.evaluatePostOverdoseCare({
      hoursSinceEvent: 'under_2',
      symptoms: [],
      supportPresent: true,
      hasMoudBridge: true
    });

    assert.equal(res.riskLevel, 'HIGH');
    const reboundAlert = res.urgencyAlerts.find(a => a.titleEn.includes('Rebound Sedation'));
    assert.ok(reboundAlert, 'Must alert on active rebound sedation window');
  });

  await t.test('evaluatePostOverdoseCare: Severe Symptoms Escalate to CRITICAL with 911 Activation', () => {
    const res = mod.evaluatePostOverdoseCare({
      hoursSinceEvent: 'under_6',
      symptoms: ['slow_breathing', 'chest_pain'],
      supportPresent: true
    });

    assert.equal(res.riskLevel, 'CRITICAL');
    const critAlert = res.urgencyAlerts.find(a => a.level === 'CRITICAL');
    assert.ok(critAlert, 'Must generate critical 911 alert for slow breathing and chest pain');
  });

  await t.test('evaluatePostOverdoseCare: Precipitated Withdrawal Warns Against Street Drug Re-Dosing', () => {
    const res = mod.evaluatePostOverdoseCare({
      hoursSinceEvent: 'under_6',
      symptoms: ['precipitated_withdrawal']
    });

    const pwdDir = res.harmReductionDirectives.find(d => d.topic === 'precipitated_withdrawal_safety');
    assert.ok(pwdDir, 'Must include precipitated withdrawal directive');
    assert.ok(pwdDir.titleEn.includes('Do NOT Use Street Drugs'));
  });

  await t.test('evaluatePostOverdoseCare: Solitary Survivor Flags Never Use Alone Hotline', () => {
    const res = mod.evaluatePostOverdoseCare({
      supportPresent: false
    });

    const soloAlert = res.urgencyAlerts.find(a => a.titleEn.includes('Never Be Alone'));
    assert.ok(soloAlert, 'Must warn against being alone and provide hotlines');
    assert.ok(soloAlert.textEn.includes('Never Use Alone'));
  });

  await t.test('evaluatePostOverdoseCare: Missing MOUD Bridge Prompts DEA 72-Hour Rule', () => {
    const res = mod.evaluatePostOverdoseCare({
      hasMoudBridge: false
    });

    const moudStep = res.actionChecklist.find(s => s.stepEn.includes('72-Hour Buprenorphine Bridge'));
    assert.ok(moudStep, 'Must recommend emergency 72-hour buprenorphine bridge');
  });

  await t.test('In-RAM Ephemeral State Management & Deterministic Reset', () => {
    mod.resetPostOverdoseState();
    const initial = mod.getPostOverdoseState();
    assert.equal(initial.activeTab, 'overview');
    assert.equal(initial.hasMoudBridge, false);

    mod.setPostOverdoseState({ activeTab: 'triage', hasMoudBridge: true, symptoms: ['slow_breathing'] });
    const updated = mod.getPostOverdoseState();
    assert.equal(updated.activeTab, 'triage');
    assert.equal(updated.hasMoudBridge, true);
    assert.ok(updated.symptoms.includes('slow_breathing'));

    mod.resetPostOverdoseState();
    const reset = mod.getPostOverdoseState();
    assert.equal(reset.activeTab, 'overview');
    assert.equal(reset.hasMoudBridge, false);
    assert.equal(reset.symptoms.length, 1);
  });

  await t.test('formatPostOverdoseSummaryText: Formats bilingual clinical action plans', () => {
    const textEn = mod.formatPostOverdoseSummaryText({
      hoursSinceEvent: 'under_2',
      symptoms: ['precipitated_withdrawal'],
      supportPresent: false,
      hasMoudBridge: false
    }, 'en');

    assert.ok(textEn.includes('POST-OVERDOSE CLINICAL RESPONSE'));
    assert.ok(textEn.includes('CRITICAL HARM REDUCTION DIRECTIVES'));
    assert.ok(textEn.includes('IMMEDIATE ACTION CHECKLIST'));

    const textEs = mod.formatPostOverdoseSummaryText({
      hoursSinceEvent: 'under_2',
      symptoms: ['precipitated_withdrawal'],
      supportPresent: false,
      hasMoudBridge: false
    }, 'es');

    assert.ok(textEs.includes('PLAN CLÍNICO DE RESPUESTA'));
    assert.ok(textEs.includes('DIRECTIVAS CRÍTICAS'));
  });

  await t.test('postOverdoseView: Mounts accessible DOM across tabs', () => {
    const container = new MockNode('div');
    mod.postOverdoseView(container);
    assert.ok(container.children.length > 0, 'Container should mount header and navigation');

    mod.setPostOverdoseState({ activeTab: 'triage' });
    mod.postOverdoseView(container);
    assert.ok(container.children.length > 0);

    mod.setPostOverdoseState({ activeTab: 'responder-support' });
    mod.postOverdoseView(container);
    assert.ok(container.children.length > 0);
  });

  await t.test('Static Security & Privacy Compliance Audit', () => {
    const code = fs.readFileSync('public/js/views/postOverdose.js', 'utf8');
    assert.doesNotMatch(code, /localStorage|sessionStorage|document\.cookie/i, 'No device storage writes');
    assert.doesNotMatch(code, /innerHTML|outerHTML/i, 'No innerHTML allowed');
    assert.doesNotMatch(code, /style\s*=/i, 'No inline style attributes allowed');
    assert.doesNotMatch(code, /saved to disk|erases everything|zero-knowledge|does not record search terms|never stored|nothing is logged|100% private/i, 'No absolute overclaims');
  });
});

