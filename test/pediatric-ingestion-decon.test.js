import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ONE_PILL_CAN_KILL_LIST,
  CHARCOAL_CONTRAINDICATIONS,
  evaluatePediatricIngestion,
  getPediatricDeconState,
  setPediatricDeconState,
  resetPediatricDeconState,
  subscribePediatricDeconState,
  pediatricIngestionDeconView,
} from '../public/js/views/pediatricIngestionDecon.js';

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

test('ONE_PILL_CAN_KILL_LIST catalog holds validated high-risk toddler xenobiotics', () => {
  const keys = Object.keys(ONE_PILL_CAN_KILL_LIST);
  assert.ok(keys.includes('methadone'));
  assert.ok(keys.includes('buprenorphine'));
  assert.ok(keys.includes('clonidine'));
  assert.ok(keys.includes('calcium_channel_blockers'));
  assert.ok(keys.includes('sulfonylureas'));
  assert.ok(keys.includes('tca'));
  assert.ok(keys.includes('camphor'));

  const meth = ONE_PILL_CAN_KILL_LIST.methadone;
  assert.equal(meth.minObsHours, 24);
  assert.match(meth.fatalThresholdEn, /5–10 mg/);

  const bupe = ONE_PILL_CAN_KILL_LIST.buprenorphine;
  assert.match(bupe.mechanismEn, /DOES NOT reliably protect/i);
});

test('CHARCOAL_CONTRAINDICATIONS contains mandatory airway and xenobiotic safeguards', () => {
  assert.equal(CHARCOAL_CONTRAINDICATIONS.length, 5);
  assert.ok(CHARCOAL_CONTRAINDICATIONS.some((c) => c.id === 'unprotected_airway'));
  assert.ok(CHARCOAL_CONTRAINDICATIONS.some((c) => c.id === 'hydrocarbons'));
  assert.ok(CHARCOAL_CONTRAINDICATIONS.some((c) => c.id === 'corrosives'));
  assert.ok(CHARCOAL_CONTRAINDICATIONS.some((c) => c.id === 'phails_substances'));
});

test('evaluatePediatricIngestion assesses charcoal eligibility and contraindications', () => {
  // Scenario 1: Alert toddler within 45 min -> Eligible for charcoal
  const eval1 = evaluatePediatricIngestion({
    substanceId: 'methadone',
    weightKg: 12,
    isAlert: true,
    minutesSinceIngestion: 45,
    activeContraindications: [],
  });
  assert.equal(eval1.charcoalEligible, true);
  assert.equal(eval1.charcoalDoseGrams, 12); // 1 g/kg
  assert.match(eval1.charcoalRecommendationEn, /ADMINISTER ACTIVATED CHARCOAL: 12 grams/);

  // Scenario 2: Depressed airway / somnolent -> Charcoal strictly contraindicated
  const eval2 = evaluatePediatricIngestion({
    substanceId: 'methadone',
    weightKg: 12,
    isAlert: false, // Airway not protected
    minutesSinceIngestion: 30,
  });
  assert.equal(eval2.charcoalEligible, false);
  assert.match(eval2.charcoalRecommendationEn, /STRICTLY CONTRAINDICATED/);

  // Scenario 3: Time elapsed > 120 minutes -> Window closed
  const eval3 = evaluatePediatricIngestion({
    substanceId: 'methadone',
    weightKg: 12,
    isAlert: true,
    minutesSinceIngestion: 150,
  });
  assert.equal(eval3.charcoalEligible, false);
  assert.match(eval3.charcoalRecommendationEn, /CHARCOAL WINDOW CLOSED/);
});

test('evaluatePediatricIngestion titrates weight-based pediatric naloxone correctly', () => {
  // Scenario A: Spontaneous hypoventilation -> 0.01 mg/kg
  const evalSpont = evaluatePediatricIngestion({
    weightKg: 14,
    isApneic: false,
    isNeonatalExposure: false,
  });
  assert.equal(evalSpont.naloxoneDoseMg, 0.14); // 14 * 0.01
  assert.match(evalSpont.naloxoneProtocolEn, /TITRATED REVERSAL/);

  // Scenario B: Full respiratory arrest / apnea -> 0.1 mg/kg
  const evalApnea = evaluatePediatricIngestion({
    weightKg: 15,
    isApneic: true,
    isNeonatalExposure: false,
  });
  assert.equal(evalApnea.naloxoneDoseMg, 1.5); // 15 * 0.1
  assert.match(evalApnea.naloxoneProtocolEn, /RESUSCITATION BOLUS/);

  // Scenario C: Neonate with chronic in-utero exposure -> micro-titration
  const evalNeo = evaluatePediatricIngestion({
    weightKg: 4,
    isApneic: false,
    isNeonatalExposure: true,
  });
  assert.equal(evalNeo.naloxoneDoseMg, 0.008); // 4 * 0.002
  assert.match(evalNeo.naloxoneProtocolEn, /NEONATAL MICRO-TITRATION/);
});

test('In-RAM ephemeral state controller updates and triggers subscribers', () => {
  resetPediatricDeconState();
  let fired = false;
  const unsubscribe = subscribePediatricDeconState(() => {
    fired = true;
  });

  setPediatricDeconState({ weightKg: 16, substanceId: 'clonidine' });
  const st = getPediatricDeconState();
  assert.equal(st.weightKg, 16);
  assert.equal(st.substanceId, 'clonidine');
  assert.equal(fired, true);

  unsubscribe();
  fired = false;
  setPediatricDeconState({ weightKg: 10 });
  assert.equal(fired, false);

  resetPediatricDeconState();
  assert.equal(getPediatricDeconState().weightKg, 12);
});

test('pediatricIngestionDeconView mounts accessible DOM tree without innerHTML or style attributes', () => {
  const restoreDom = installMockDom();
  try {
    resetPediatricDeconState();
    const view = pediatricIngestionDeconView();
    assert.ok(view);
    assert.equal(view.tagName, 'DIV');
    assert.ok(view.classList.contains('pediatric-decon-view'));

    const text = view.textContent;
    assert.match(text, /Pediatric & Adolescent Ingestion/i);
    assert.match(text, /One Pill Can Kill/i);
    assert.match(text, /Poison Control Center/i);
    assert.match(text, /Activated Charcoal/i);
    assert.match(text, /Naloxone/i);
    assert.match(text, /SBAR/i);
  } finally {
    restoreDom();
  }
});
