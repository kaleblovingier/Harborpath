import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  DERMATOLOGY_SYNDROME_PROFILES,
  DERMATOLOGY_HARM_REDUCTION_RULES,
  getDermatologyState,
  setDermatologyState,
  resetDermatologyState,
  subscribeDermatologyState,
  evaluateDermatologyRisk,
  formatDermatologySbarText,
  dermatologyCareView
} from '../public/js/views/dermatologyCare.js';

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

describe('Wave 52 (Track B): Dermatology, Xylazine Eschar & SCAR Navigator (dermatologyCare.js)', () => {
  beforeEach(() => {
    installMockDom();
    resetDermatologyState();
  });

  it('exports 6 comprehensive dermatology syndrome profiles and 5 cardinal harm reduction rules', () => {
    const keys = Object.keys(DERMATOLOGY_SYNDROME_PROFILES);
    assert.deepEqual(keys, [
      'xylazine_necrotic_ulcers',
      'sjs_ten_epidermal_necrolysis',
      'dress_syndrome',
      'cutaneous_anthrax_botulism_skinpop',
      'nicolau_syndrome',
      'stimulant_formication_excoriation'
    ]);
    assert.equal(DERMATOLOGY_HARM_REDUCTION_RULES.length, 5);

    const xyl = DERMATOLOGY_SYNDROME_PROFILES.xylazine_necrotic_ulcers;
    assert.ok(xyl.managementEn.some((m) => m.includes('Xeroform')));
    const sjs = DERMATOLOGY_SYNDROME_PROFILES.sjs_ten_epidermal_necrolysis;
    assert.equal(sjs.urgency, 'EMERGENCY');
    assert.ok(sjs.diagnosticsEn.some((d) => d.includes('SCORTEN')));
  });

  it('manages ephemeral in-RAM state and notifies subscribers cleanly', () => {
    let notified = null;
    const unsub = subscribeDermatologyState((s) => {
      notified = s;
    });

    setDermatologyState({
      selectedSyndrome: 'dress_syndrome',
      facialEdemaEosinophiliaFeverVancomycin2to8Weeks: true,
      clinicalNotes: 'Week 4 of IV vancomycin'
    });

    assert.equal(getDermatologyState().selectedSyndrome, 'dress_syndrome');
    assert.equal(notified.facialEdemaEosinophiliaFeverVancomycin2to8Weeks, true);

    unsub();
    resetDermatologyState();
    assert.equal(getDermatologyState().selectedSyndrome, 'xylazine_necrotic_ulcers');
    assert.equal(getDermatologyState().facialEdemaEosinophiliaFeverVancomycin2to8Weeks, false);
    assert.equal(getDermatologyState().clinicalNotes, '');
  });

  it('evaluates SJS/TEN, DRESS, Anthrax/Botulism, Nicolau, Xylazine, and Formication red flags', () => {
    setDermatologyState({
      selectedSyndrome: 'stimulant_formication_excoriation',
      blisteringNikolskyMucositisLamotrigineBactrim: true,
      facialEdemaEosinophiliaFeverVancomycin2to8Weeks: true,
      painlessBlackEscharGelatinousEdemaOrDescendingPtosis: true,
      instantBurningBlanchingLivedoidPlaqueAtInjection: true,
      xylazineNecroticEscharWithExposedTendonOrBone: true,
      stimulantFormicationPickingWithHoneyCrusting: true
    });

    const res = evaluateDermatologyRisk(getDermatologyState(), 'en');
    assert.equal(res.urgency, 'EMERGENCY');
    assert.equal(res.redFlags.length, 6);
    assert.ok(res.redFlags.some((f) => f.includes('STEVENS-JOHNSON SYNDROME / TEN ALERT')));
    assert.ok(res.redFlags.some((f) => f.includes('DRESS SYNDROME ALERT')));
    assert.ok(res.redFlags.some((f) => f.includes('CUTANEOUS ANTHRAX OR WOUND BOTULISM')));
    assert.ok(res.redFlags.some((f) => f.includes('NICOLAU SYNDROME ALERT')));
    assert.ok(res.redFlags.some((f) => f.includes('XYLAZINE NECROTIC ULCER')));
    assert.ok(res.redFlags.some((f) => f.includes('STIMULANT FORMICATION')));
  });

  it('generates structured zero-PII SBAR handoff text in English and Spanish', () => {
    setDermatologyState({
      selectedSyndrome: 'sjs_ten_epidermal_necrolysis',
      blisteringNikolskyMucositisLamotrigineBactrim: true,
      clinicalNotes: 'Lamotrigine + valproate co-therapy, 15% BSA detachment'
    });

    const enSbar = formatDermatologySbarText(getDermatologyState(), 'en');
    assert.ok(enSbar.includes('SBAR CLINICAL HANDOFF: DERMATOLOGY, XYLAZINE ESCHAR, SJS/TEN & DRESS'));
    assert.ok(enSbar.includes('SCORTEN'));
    assert.ok(enSbar.includes('15% BSA detachment'));

    const esSbar = formatDermatologySbarText(getDermatologyState(), 'es');
    assert.ok(esSbar.includes('ENTREGA CLÍNICA SBAR: DERMATOLOGÍA, ESCARAS POR XILACINA, SSJ/NET Y DRESS'));
    assert.ok(esSbar.includes('Unidad de Quemados'));
  });

  it('renders dermatologyCareView DOM tree and handles syndrome selection, checkboxes, and reset', () => {
    const view = dermatologyCareView();
    assert.equal(view.getAttribute('data-view'), 'dermatology-care');

    const buttons = view.querySelectorAll(
      (n) => n.tagName === 'BUTTON' && n.getAttribute('data-syndrome-id')
    );
    assert.equal(buttons.length, 6);

    const dressBtn = buttons.find(
      (b) => b.getAttribute('data-syndrome-id') === 'dress_syndrome'
    );
    for (const fn of dressBtn.listeners.get('click') || []) fn();
    assert.equal(getDermatologyState().selectedSyndrome, 'dress_syndrome');

    const checkboxes = view.querySelectorAll(
      (n) => n.tagName === 'INPUT' && n.getAttribute('type') === 'checkbox'
    );
    assert.equal(checkboxes.length, 6);
    checkboxes[0].checked = true;
    for (const fn of checkboxes[0].listeners.get('change') || []) fn();
    assert.equal(getDermatologyState().blisteringNikolskyMucositisLamotrigineBactrim, true);

    const resetBtns = view.querySelectorAll(
      (n) => n.tagName === 'BUTTON' && n.className.includes('reset-dermatology-btn')
    );
    assert.equal(resetBtns.length, 1);
    for (const fn of resetBtns[0].listeners.get('click') || []) fn();
    assert.equal(getDermatologyState().selectedSyndrome, 'xylazine_necrotic_ulcers');
    assert.equal(getDermatologyState().blisteringNikolskyMucositisLamotrigineBactrim, false);
  });
});
