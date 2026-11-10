import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HARD_SIGNS_NSTI,
  SOFT_SIGNS_NSTI,
  POCUS_DIFFERENTIALS,
  XYLAZINE_ULCER_STAGES,
  calculateLrinecScore,
  evaluateNstiWoundRisk,
  getNstiState,
  setNstiState,
  resetNstiState,
  subscribeNstiState,
  nstiWoundStagingView,
} from '../public/js/views/nstiWoundStaging.js';

function installMockDom() {
  class MockElement {
    constructor(tagName) {
      this.tagName = String(tagName || 'DIV').toUpperCase();
      this.attributes = {};
      this.children = [];
      this.listeners = {};
      this.style = {};
      this.dataset = {};
      this._textContent = '';
      this.className = '';
      this.id = '';
      this.checked = false;
      this.disabled = false;
      this.value = '';
      this.hidden = false;
      this.parentNode = null;
      this.classList = {
        add: (...classes) => {
          const set = new Set(this.className.split(/\s+/).filter(Boolean));
          classes.forEach((c) => set.add(c));
          this.className = Array.from(set).join(' ');
        },
        remove: (...classes) => {
          const set = new Set(this.className.split(/\s+/).filter(Boolean));
          classes.forEach((c) => set.delete(c));
          this.className = Array.from(set).join(' ');
        },
        contains: (c) => this.className.split(/\s+/).filter(Boolean).includes(c),
      };
    }

    get firstChild() {
      return this.children[0] || null;
    }

    remove() {
      if (this.parentNode) {
        const idx = this.parentNode.children.indexOf(this);
        if (idx !== -1) {
          this.parentNode.children.splice(idx, 1);
        }
      }
    }

    setAttribute(k, v) {
      const val = String(v);
      this.attributes[k] = val;
      if (k === 'id') this.id = val;
      if (k === 'class') this.className = val;
    }

    getAttribute(k) {
      if (k === 'id') return this.id || this.attributes.id || null;
      if (k === 'class') return this.className || this.attributes.class || null;
      return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null;
    }

    hasAttribute(k) {
      return Object.hasOwn(this.attributes, k);
    }

    removeAttribute(k) {
      delete this.attributes[k];
    }

    appendChild(child) {
      if (child !== null && child !== undefined) {
        child.parentNode = this;
        this.children.push(child);
      }
      return child;
    }

    append(...items) {
      for (const item of items) {
        if (typeof item === 'string') {
          this.appendChild({ nodeType: 3, textContent: item });
        } else if (item) {
          this.appendChild(item);
        }
      }
    }

    replaceChildren(...items) {
      this.children = [];
      this.append(...items);
    }

    addEventListener(type, fn) {
      if (!this.listeners[type]) this.listeners[type] = [];
      this.listeners[type].push(fn);
    }

    dispatchEvent(evt) {
      const list = this.listeners[evt.type] || [];
      for (const fn of list) fn(evt);
    }

    click() {
      this.dispatchEvent({ type: 'click', target: this, preventDefault() {} });
    }

    get textContent() {
      const childText = this.children.map((c) => c.textContent || '').join('');
      return `${this._textContent}${childText}`;
    }

    set textContent(v) {
      this._textContent = String(v ?? '');
      this.children = [];
    }

    querySelectorAll(selector) {
      const results = [];
      const check = (node) => {
        if (!node || !node.tagName) return;
        let match = false;
        if (selector.startsWith('#')) {
          match = node.id === selector.slice(1);
        } else if (selector.startsWith('.')) {
          const cls = selector.slice(1);
          match = (node.className || '').split(/\s+/).includes(cls);
        } else if (selector.startsWith('[') && selector.endsWith(']')) {
          const inner = selector.slice(1, -1);
          const [attr, rawVal] = inner.split('=');
          if (rawVal !== undefined) {
            const expected = rawVal.replace(/^["']|["']$/g, '');
            match = node.getAttribute(attr) === expected;
          } else {
            match = node.hasAttribute(attr);
          }
        } else {
          match = node.tagName.toLowerCase() === selector.toLowerCase();
        }
        if (match) results.push(node);
        for (const child of node.children || []) check(child);
      };
      for (const child of this.children || []) check(child);
      return results;
    }

    querySelector(selector) {
      return this.querySelectorAll(selector)[0] || null;
    }
  }

  const prevDoc = globalThis.document;
  const prevNode = globalThis.Node;

  globalThis.Node = MockElement;
  globalThis.document = {
    createElement(tag) {
      return new MockElement(tag);
    },
    createElementNS(ns, tag) {
      return new MockElement(tag);
    },
    createTextNode(text) {
      return { nodeType: 3, textContent: String(text) };
    },
    getElementById(id) {
      return null;
    },
  };

  try {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText: async () => {} },
      configurable: true,
      writable: true,
    });
  } catch {}

  return () => {
    globalThis.document = prevDoc;
    globalThis.Node = prevNode;
  };
}

test('Clinical constants: HARD_SIGNS_NSTI and SOFT_SIGNS_NSTI integrity', () => {
  assert.equal(HARD_SIGNS_NSTI.length, 6);
  assert.ok(HARD_SIGNS_NSTI.some((s) => s.id === 'crepitus'));
  assert.ok(HARD_SIGNS_NSTI.some((s) => s.id === 'dishwater_pus'));
  assert.ok(HARD_SIGNS_NSTI.some((s) => s.id === 'bullae'));

  assert.equal(SOFT_SIGNS_NSTI.length, 5);
  assert.ok(SOFT_SIGNS_NSTI.some((s) => s.id === 'pain_out_of_proportion'));
  assert.ok(SOFT_SIGNS_NSTI.some((s) => s.id === 'woody_edema'));
});

test('Clinical constants: POCUS_DIFFERENTIALS and XYLAZINE_ULCER_STAGES integrity', () => {
  assert.ok(POCUS_DIFFERENTIALS.cellulitis);
  assert.ok(POCUS_DIFFERENTIALS.abscess);
  assert.ok(POCUS_DIFFERENTIALS.nsti_staff);

  assert.match(POCUS_DIFFERENTIALS.cellulitis.nameEn, /Cobblestoning/i);
  assert.match(POCUS_DIFFERENTIALS.cellulitis.findingsEn, /Anechoic/i);
  assert.match(POCUS_DIFFERENTIALS.nsti_staff.findingsEn, /STAFF Mnemonic/i);

  assert.equal(XYLAZINE_ULCER_STAGES.length, 4);
  const stage4 = XYLAZINE_ULCER_STAGES.find((s) => s.stage === 4);
  assert.match(stage4.protocolEn, /TENDON-SPARING MANDATE/i);
});

test('calculateLrinecScore accurately scores parameters and categorizes risk tiers', () => {
  // Scenario 1: Low risk (Score 0)
  const low = calculateLrinecScore({ crp: 10, wbc: 8, hemoglobin: 14, sodium: 139, creatinine: 0.9, glucose: 100 });
  assert.equal(low.totalScore, 0);
  assert.equal(low.riskTier, 'low');
  assert.match(low.actionEn, /cannot rule out NSTI/i);

  // Scenario 2: Moderate risk (Score 6)
  // CRP >=150 (4), WBC 16 (1), Glucose 200 (1) = 6
  const mod = calculateLrinecScore({ crp: 180, wbc: 16, hemoglobin: 14, sodium: 140, creatinine: 1.0, glucose: 210 });
  assert.equal(mod.totalScore, 6);
  assert.equal(mod.riskTier, 'moderate');
  assert.match(mod.actionEn, /SUSPICIOUS FOR NSTI/i);

  // Scenario 3: High risk (Score 12)
  // CRP 220 (4), WBC 28 (2), Hb 9.5 (2), Na 129 (2), Cr 2.1 (2) = 12
  const high = calculateLrinecScore({ crp: 220, wbc: 28, hemoglobin: 9.5, sodium: 129, creatinine: 2.1, glucose: 150 });
  assert.equal(high.totalScore, 12);
  assert.equal(high.riskTier, 'high');
  assert.match(high.actionEn, /STRONGLY PREDICTIVE OF NECROTIZING FASCIITIS/i);
});

test('evaluateNstiWoundRisk triggers emergent OR debridement for hard signs or STAFF POCUS', () => {
  // Hard sign present -> Emergent OR
  const evalHard = evaluateNstiWoundRisk({
    hardSigns: ['crepitus', 'dishwater_pus'],
    pocusCategory: 'cellulitis',
  });
  assert.equal(evalHard.isEmergentSurge, true);
  assert.equal(evalHard.triageLevel, 'emergent_or');
  assert.match(evalHard.sbarEn, /STAT Emergent Surgical Debridement/i);

  // POCUS STAFF criteria -> Emergent OR
  const evalPocus = evaluateNstiWoundRisk({
    hardSigns: [],
    pocusCategory: 'nsti_staff',
  });
  assert.equal(evalPocus.isEmergentSurge, true);
  assert.equal(evalPocus.triageLevel, 'emergent_or');

  // Stage 4 Xylazine Ulcer -> Tendon Preservation Advisory
  const evalXyl = evaluateNstiWoundRisk({
    isXylazineWound: true,
    xylazineStage: 4,
  });
  assert.ok(evalXyl.tendonAdvisoryEn);
  assert.match(evalXyl.tendonAdvisoryEn, /CRITICAL TENDON PRESERVATION/i);
});

test('In-RAM ephemeral state controller functions deterministically with subscribers', () => {
  resetNstiState();
  let called = false;
  const unsubscribe = subscribeNstiState(() => {
    called = true;
  });

  setNstiState({ crp: 210, pocusCategory: 'abscess' });
  const st = getNstiState();
  assert.equal(st.crp, 210);
  assert.equal(st.pocusCategory, 'abscess');
  assert.equal(called, true);

  unsubscribe();
  called = false;
  setNstiState({ crp: 50 });
  assert.equal(called, false);

  resetNstiState();
  assert.equal(getNstiState().crp, 165);
});

test('nstiWoundStagingView mounts accessible DOM tree without innerHTML or style attributes', () => {
  const restoreDom = installMockDom();
  try {
    resetNstiState();
    const view = nstiWoundStagingView();
    assert.ok(view);
    assert.equal(view.tagName, 'DIV');
    assert.ok(view.classList.contains('nsti-staging-view'));

    const text = view.textContent;
    assert.match(text, /Necrotizing Soft Tissue Infection/i);
    assert.match(text, /Hard Signs/i);
    assert.match(text, /LRINEC/i);
    assert.match(text, /POCUS/i);
    assert.match(text, /Xylazine/i);
    assert.match(text, /SBAR/i);
  } finally {
    restoreDom();
  }
});
