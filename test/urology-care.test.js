import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  UROLOGY_SYNDROME_PROFILES,
  UROLOGY_HARM_REDUCTION_RULES,
  getUrologyState,
  setUrologyState,
  resetUrologyState,
  subscribeUrologyState,
  evaluateUrologyRisk,
  formatUrologySbarText,
  urologyCareView
} from '../public/js/views/urologyCare.js';

class MockElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.className = '';
    this.id = '';
    this.textContent = '';
    this.value = '';
    this.checked = false;
    this.attributes = new Map();
    this.children = [];
    this.listeners = new Map();
  }
  setAttribute(k, v) {
    this.attributes.set(k, String(v));
  }
  getAttribute(k) {
    return this.attributes.get(k) ?? null;
  }
  removeAttribute(k) {
    this.attributes.delete(k);
  }
  appendChild(child) {
    if (child) this.children.push(child);
    return child;
  }
  append(...items) {
    for (const item of items) {
      if (typeof item === 'string') {
        const textNode = new MockElement('#text');
        textNode.textContent = item;
        this.children.push(textNode);
      } else if (item) {
        this.children.push(item);
      }
    }
  }
  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
  }
  querySelectorAll(predicate) {
    const out = [];
    const walk = (node) => {
      if (!node || typeof node !== 'object') return;
      if (predicate(node)) out.push(node);
      if (Array.isArray(node.children)) {
        for (const c of node.children) walk(c);
      }
    };
    walk(this);
    return out;
  }
}

function installMockDom() {
  globalThis.Node = MockElement;
  globalThis.document = {
    documentElement: { lang: 'en' },
    createElement: (tag) => new MockElement(tag),
    createTextNode: (txt) => {
      const n = new MockElement('#text');
      n.textContent = String(txt);
      return n;
    }
  };
}

describe('Wave 51: Urologic & Genitourinary Emergencies Navigator (urologyCare.js)', () => {
  beforeEach(() => {
    installMockDom();
    resetUrologyState();
  });

  it('exports 6 comprehensive urologic syndrome profiles and 5 cardinal harm reduction rules', () => {
    const keys = Object.keys(UROLOGY_SYNDROME_PROFILES);
    assert.deepEqual(keys, [
      'ischemic_priapism',
      'fournier_gangrene',
      'acute_urinary_retention',
      'genital_injection_necrosis',
      'ketamine_obstructive_uropathy',
      'paraphimosis_constriction_trauma'
    ]);
    assert.equal(UROLOGY_HARM_REDUCTION_RULES.length, 5);

    const priapism = UROLOGY_SYNDROME_PROFILES.ischemic_priapism;
    assert.equal(priapism.urgency, 'EMERGENCY');
    assert.ok(priapism.managementEn.some((m) => m.includes('Phenylephrine')));
    assert.ok(priapism.managementEn.some((m) => m.includes('WITHOUT Epinephrine')));
  });

  it('manages ephemeral in-RAM state and notifies subscribers cleanly', () => {
    let notified = null;
    const unsub = subscribeUrologyState((s) => {
      notified = s;
    });

    setUrologyState({
      selectedSyndrome: 'fournier_gangrene',
      perinealPainCrepitusDishwaterSepsis: true,
      clinicalNotes: 'Crepitus over scrotal wall'
    });

    assert.equal(getUrologyState().selectedSyndrome, 'fournier_gangrene');
    assert.equal(notified.perinealPainCrepitusDishwaterSepsis, true);

    unsub();
    resetUrologyState();
    assert.equal(getUrologyState().selectedSyndrome, 'ischemic_priapism');
    assert.equal(getUrologyState().perinealPainCrepitusDishwaterSepsis, false);
    assert.equal(getUrologyState().clinicalNotes, '');
  });

  it('evaluates ischemic priapism, Fournier gangrene, urinary retention, and neuro-urologic red flags', () => {
    setUrologyState({
      selectedSyndrome: 'acute_urinary_retention',
      erectionOver4HoursRigidShaftSoftGlans: true,
      perinealPainCrepitusDishwaterSepsis: true,
      suprapubicDistensionOpioidAnticholinergic: true,
      bloodAtMeatusOrSpinalBackPain: true
    });

    const res = evaluateUrologyRisk(getUrologyState());
    assert.equal(res.urgency, 'EMERGENCY');
    assert.equal(res.redFlags.length, 4);
    assert.ok(res.redFlags.some((f) => f.includes('ISCHEMIC PRIAPISM ALERT')));
    assert.ok(res.redFlags.some((f) => f.includes('FOURNIER GANGRENE ALERT')));
    assert.ok(res.redFlags.some((f) => f.includes('ACUTE URINARY RETENTION')));
    assert.ok(res.redFlags.some((f) => f.includes('NEURO-UROLOGIC / URETHRAL TRAUMA ALERT')));
  });

  it('generates structured zero-PII SBAR handoff text in English and Spanish', () => {
    setUrologyState({
      selectedSyndrome: 'ischemic_priapism',
      erectionOver4HoursRigidShaftSoftGlans: true,
      clinicalNotes: '6h erection after trazodone 150 mg'
    });

    const enSbar = formatUrologySbarText(getUrologyState(), 'en');
    assert.ok(enSbar.includes('SBAR CLINICAL HANDOFF: UROLOGIC & GENITOURINARY EMERGENCIES'));
    assert.ok(enSbar.includes('Phenylephrine'));
    assert.ok(enSbar.includes('6h erection after trazodone 150 mg'));

    const esSbar = formatUrologySbarText(getUrologyState(), 'es');
    assert.ok(esSbar.includes('ENTREGA CLÍNICA SBAR: URGENCIAS UROLÓGICAS Y GENITOURINARIAS'));
    assert.ok(esSbar.includes('Fenilefrina'));
  });

  it('renders urologyCareView DOM tree and handles syndrome selection, checkboxes, and reset', () => {
    const view = urologyCareView();
    assert.equal(view.getAttribute('data-view'), 'urology-care');

    const buttons = view.querySelectorAll(
      (n) => n.tagName === 'BUTTON' && n.getAttribute('data-syndrome-id')
    );
    assert.equal(buttons.length, 6);

    const fournierBtn = buttons.find(
      (b) => b.getAttribute('data-syndrome-id') === 'fournier_gangrene'
    );
    const clickHandlers = fournierBtn.listeners.get('click') || [];
    for (const fn of clickHandlers) fn();
    assert.equal(getUrologyState().selectedSyndrome, 'fournier_gangrene');

    const checkboxes = view.querySelectorAll(
      (n) => n.tagName === 'INPUT' && n.getAttribute('type') === 'checkbox'
    );
    assert.equal(checkboxes.length, 7);
    checkboxes[0].checked = true;
    for (const fn of checkboxes[0].listeners.get('change') || []) fn();
    assert.equal(getUrologyState().erectionOver4HoursRigidShaftSoftGlans, true);

    const resetBtns = view.querySelectorAll(
      (n) => n.tagName === 'BUTTON' && n.className.includes('reset-urology-btn')
    );
    assert.equal(resetBtns.length, 1);
    for (const fn of resetBtns[0].listeners.get('click') || []) fn();
    assert.equal(getUrologyState().selectedSyndrome, 'ischemic_priapism');
    assert.equal(getUrologyState().erectionOver4HoursRigidShaftSoftGlans, false);
  });
});
