import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  ENT_SYNDROME_PROFILES,
  ENT_HARM_REDUCTION_RULES,
  getEntState,
  setEntState,
  resetEntState,
  subscribeEntState,
  evaluateEntRisk,
  formatEntSbarText,
  entCareView
} from '../public/js/views/entCare.js';

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

describe('Wave 52 (Track A): Otolaryngology & Upper Airway Navigator (entCare.js)', () => {
  beforeEach(() => {
    installMockDom();
    resetEntState();
  });

  it('exports 6 comprehensive ENT syndrome profiles and 5 cardinal harm reduction rules', () => {
    const keys = Object.keys(ENT_SYNDROME_PROFILES);
    assert.deepEqual(keys, [
      'ludwig_angina_deep_neck',
      'lemierre_ijv_thrombophlebitis',
      'cimdl_septal_perforation',
      'thermal_supraglottitis_epiglottitis',
      'cryogenic_airway_frostbite',
      'intranasal_harm_reduction'
    ]);
    assert.equal(ENT_HARM_REDUCTION_RULES.length, 5);

    const ludwig = ENT_SYNDROME_PROFILES.ludwig_angina_deep_neck;
    assert.equal(ludwig.urgency, 'EMERGENCY');
    assert.ok(ludwig.diagnosticsEn.some((d) => d.includes('NEVER force a patient with Ludwig angina')));
    assert.ok(ludwig.managementEn.some((m) => m.includes('Awake Fiberoptic')));
  });

  it('manages ephemeral in-RAM state and notifies subscribers cleanly', () => {
    let notified = null;
    const unsub = subscribeEntState((s) => {
      notified = s;
    });

    setEntState({
      selectedSyndrome: 'lemierre_ijv_thrombophlebitis',
      unilateralJugularCordFeverPleuriticChestPain: true,
      clinicalNotes: 'Right IJV cord sign'
    });

    assert.equal(getEntState().selectedSyndrome, 'lemierre_ijv_thrombophlebitis');
    assert.equal(notified.unilateralJugularCordFeverPleuriticChestPain, true);

    unsub();
    resetEntState();
    assert.equal(getEntState().selectedSyndrome, 'ludwig_angina_deep_neck');
    assert.equal(getEntState().unilateralJugularCordFeverPleuriticChestPain, false);
    assert.equal(getEntState().clinicalNotes, '');
  });

  it('evaluates Ludwig angina, Lemierre syndrome, thermal supraglottitis, N2O frostbite, and CIMDL red flags', () => {
    setEntState({
      selectedSyndrome: 'intranasal_harm_reduction',
      woodyFloorOfMouthTongueElevationStridor: true,
      unilateralJugularCordFeverPleuriticChestPain: true,
      thermalPipeBurnMuffledVoiceDrooling: true,
      directN2oTankCryogenicOralWhitePlaques: true,
      nasalRegurgitationLiquidsOrSeptalWhistling: true,
      sharedStrawsOrUnboiledTapWaterRinse: true
    });

    const res = evaluateEntRisk(getEntState(), 'en');
    assert.equal(res.urgency, 'EMERGENCY');
    assert.equal(res.redFlags.length, 6);
    assert.ok(res.redFlags.some((f) => f.includes('AIRWAY EMERGENCY (Ludwig Angina')));
    assert.ok(res.redFlags.some((f) => f.includes('LEMIERRE SYNDROME ALERT')));
    assert.ok(res.redFlags.some((f) => f.includes('THERMAL EPIGLOTTITIS')));
    assert.ok(res.redFlags.some((f) => f.includes('CRYOGENIC AIRWAY FROSTBITE')));
    assert.ok(res.redFlags.some((f) => f.includes('SEPTAL PERFORATION / HARD-PALATE')));
    assert.ok(res.redFlags.some((f) => f.includes('Naegleria fowleri')));
  });

  it('generates structured zero-PII SBAR handoff text in English and Spanish', () => {
    setEntState({
      selectedSyndrome: 'ludwig_angina_deep_neck',
      woodyFloorOfMouthTongueElevationStridor: true,
      clinicalNotes: 'Sitting upright in resuscitation bay'
    });

    const enSbar = formatEntSbarText(getEntState(), 'en');
    assert.ok(enSbar.includes('SBAR CLINICAL HANDOFF: OTOLARYNGOLOGY, UPPER AIRWAY & DEEP NECK INFECTIONS'));
    assert.ok(enSbar.includes('Awake Fiberoptic'));
    assert.ok(enSbar.includes('Sitting upright in resuscitation bay'));

    const esSbar = formatEntSbarText(getEntState(), 'es');
    assert.ok(esSbar.includes('ENTREGA CLÍNICA SBAR: OTORRINOLARINGOLOGÍA, VÍA AÉREA SUPERIOR E INFECCIONES DE CUELLO'));
    assert.ok(esSbar.includes('Fibroóptica Despierto'));
  });

  it('renders entCareView DOM tree and handles syndrome selection, checkboxes, and reset', () => {
    const view = entCareView();
    assert.equal(view.getAttribute('data-view'), 'ent-care');

    const buttons = view.querySelectorAll(
      (n) => n.tagName === 'BUTTON' && n.getAttribute('data-syndrome-id')
    );
    assert.equal(buttons.length, 6);

    const cimdlBtn = buttons.find(
      (b) => b.getAttribute('data-syndrome-id') === 'cimdl_septal_perforation'
    );
    for (const fn of cimdlBtn.listeners.get('click') || []) fn();
    assert.equal(getEntState().selectedSyndrome, 'cimdl_septal_perforation');

    const checkboxes = view.querySelectorAll(
      (n) => n.tagName === 'INPUT' && n.getAttribute('type') === 'checkbox'
    );
    assert.equal(checkboxes.length, 6);
    checkboxes[0].checked = true;
    for (const fn of checkboxes[0].listeners.get('change') || []) fn();
    assert.equal(getEntState().woodyFloorOfMouthTongueElevationStridor, true);

    const resetBtns = view.querySelectorAll(
      (n) => n.tagName === 'BUTTON' && n.className.includes('reset-ent-btn')
    );
    assert.equal(resetBtns.length, 1);
    for (const fn of resetBtns[0].listeners.get('click') || []) fn();
    assert.equal(getEntState().selectedSyndrome, 'ludwig_angina_deep_neck');
    assert.equal(getEntState().woodyFloorOfMouthTongueElevationStridor, false);
  });
});
