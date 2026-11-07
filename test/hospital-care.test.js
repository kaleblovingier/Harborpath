// test/hospital-care.test.js
// HarborPath - Wave 29 Inpatient Addiction Medicine, Pain on MOUD & Hospital Care Tests

import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Minimal Mock DOM Node
class MockNode {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.className = '';
    this._textContent = '';
    this.checked = false;
    this.value = '';
    this.parent = null;
    this.classList = {
      contains: (cls) => this.className.split(/\s+/).includes(cls),
      add: (cls) => {
        const set = new Set(this.className.split(/\s+/).filter(Boolean));
        set.add(cls);
        this.className = Array.from(set).join(' ');
      },
      remove: (cls) => {
        const set = new Set(this.className.split(/\s+/).filter(Boolean));
        set.delete(cls);
        this.className = Array.from(set).join(' ');
      }
    };
  }
  get firstChild() {
    return this.children[0] || null;
  }
  remove() {
    if (this.parent) {
      const idx = this.parent.children.indexOf(this);
      if (idx !== -1) this.parent.children.splice(idx, 1);
    }
  }
  get textContent() {
    let txt = this._textContent || '';
    for (const c of this.children) {
      if (typeof c === 'string') txt += c;
      else if (c && c.textContent) txt += c.textContent;
    }
    return txt;
  }
  set textContent(v) {
    this._textContent = String(v ?? '');
  }
  appendChild(child) {
    if (child) {
      if (typeof child === 'object') child.parent = this;
      this.children.push(child);
    }
    return child;
  }
  append(...children) {
    for (const c of children) {
      if (c !== null && c !== undefined && c !== false) {
        if (typeof c === 'object') c.parent = this;
        this.children.push(c);
      }
    }
  }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
    if (k === 'class') this.className = String(v);
  }
  getAttribute(k) {
    return this.attributes[k] || null;
  }
  querySelector(selector) {
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      for (const c of this.children) {
        if (c && c.classList && c.classList.contains(cls)) return c;
        if (c && c.querySelector) {
          const res = c.querySelector(selector);
          if (res) return res;
        }
      }
    }
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      for (const c of this.children) {
        if (c && c.attributes && c.attributes.id === id) return c;
        if (c && c.querySelector) {
          const res = c.querySelector(selector);
          if (res) return res;
        }
      }
    }
    const tag = selector.toUpperCase();
    for (const c of this.children) {
      if (c && c.tagName === tag) return c;
      if (c && c.querySelector) {
        const res = c.querySelector(selector);
        if (res) return res;
      }
    }
    return null;
  }
  querySelectorAll(selector) {
    const results = [];
    const walk = (node) => {
      if (!node || !node.children) return;
      for (const c of node.children) {
        if (!c || typeof c === 'string') continue;
        if (selector.startsWith('.')) {
          if (c.classList && c.classList.contains(selector.slice(1))) results.push(c);
        } else if (c.tagName === selector.toUpperCase()) {
          results.push(c);
        }
        walk(c);
      }
    };
    walk(this);
    return results;
  }
}

// Global DOM setup
before(() => {
  globalThis.document = {
    documentElement: { lang: 'en' },
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    createTextNode: (txt) => {
      const n = new MockNode('#text');
      n.textContent = txt;
      return n;
    },
    getElementById: () => null,
  };
  globalThis.Node = MockNode;
});

describe('Inpatient Addiction Medicine & Hospital Care Module (Wave 29)', () => {
  let hospModule;

  before(async () => {
    hospModule = await import('../public/js/views/hospitalCare.js');
  });

  beforeEach(() => {
    globalThis.document.documentElement.lang = 'en';
    hospModule.resetHospitalState();
  });

  test('CA_BRIDGE_HIGH_DOSE_PROTOCOL exports complete 4-step rapid high-dose induction algorithm', () => {
    const { CA_BRIDGE_HIGH_DOSE_PROTOCOL } = hospModule;
    assert.ok(CA_BRIDGE_HIGH_DOSE_PROTOCOL);
    assert.ok(CA_BRIDGE_HIGH_DOSE_PROTOCOL.titleEn && CA_BRIDGE_HIGH_DOSE_PROTOCOL.titleEs);
    assert.ok(CA_BRIDGE_HIGH_DOSE_PROTOCOL.rationaleEn.includes('CA Bridge'));
    assert.ok(Array.isArray(CA_BRIDGE_HIGH_DOSE_PROTOCOL.steps));
    assert.strictEqual(CA_BRIDGE_HIGH_DOSE_PROTOCOL.steps.length, 4);

    const step1 = CA_BRIDGE_HIGH_DOSE_PROTOCOL.steps[0];
    assert.ok(step1.nameEn.includes('COWS >= 8'));

    const step2 = CA_BRIDGE_HIGH_DOSE_PROTOCOL.steps[1];
    assert.ok(step2.nameEn.includes('8 mg'));

    const step4 = CA_BRIDGE_HIGH_DOSE_PROTOCOL.steps[3];
    assert.ok(step4.nameEn.includes('Consolidation') || step4.nameEn.includes('Discharge'));
  });

  test('PRECIPITATED_WITHDRAWAL_RESCUE provides evidence-based buprenorphine override and comfort meds', () => {
    const { PRECIPITATED_WITHDRAWAL_RESCUE } = hospModule;
    assert.ok(PRECIPITATED_WITHDRAWAL_RESCUE);
    assert.ok(PRECIPITATED_WITHDRAWAL_RESCUE.definitionEn.includes('buprenorphine'));
    assert.ok(PRECIPITATED_WITHDRAWAL_RESCUE.warningEn.includes('DO NOT ABANDON'));
    assert.ok(Array.isArray(PRECIPITATED_WITHDRAWAL_RESCUE.rescueStrategies));
    assert.strictEqual(PRECIPITATED_WITHDRAWAL_RESCUE.rescueStrategies.length, 3);

    const strat1 = PRECIPITATED_WITHDRAWAL_RESCUE.rescueStrategies[0];
    assert.ok(strat1.strategy.includes('High-Dose Buprenorphine Override'));
  });

  test('INPATIENT_PAIN_ON_MOUD enforces continuing baseline MOUD, split-dosing, and avoiding mixed agonists', () => {
    const { INPATIENT_PAIN_ON_MOUD } = hospModule;
    assert.ok(INPATIENT_PAIN_ON_MOUD);
    assert.ok(INPATIENT_PAIN_ON_MOUD.mandateEn.includes('DO NOT STOP BUPRENORPHINE OR METHADONE'));
    assert.strictEqual(INPATIENT_PAIN_ON_MOUD.corePrinciples.length, 4);

    const p1 = INPATIENT_PAIN_ON_MOUD.corePrinciples[0];
    assert.ok(p1.principleEn.includes('Split-Dosing'));

    const p4 = INPATIENT_PAIN_ON_MOUD.corePrinciples[3];
    assert.ok(p4.principleEn.includes('Contraindicated'));
    assert.ok(p4.detailEn.includes('Nalbuphine') || p4.detailEn.includes('Nubain'));
  });

  test('PATIENT_DIRECTED_DISCHARGE_BUNDLE debunks the insurance billing myth and provides 4 harm reduction principles', () => {
    const { PATIENT_DIRECTED_DISCHARGE_BUNDLE } = hospModule;
    assert.ok(PATIENT_DIRECTED_DISCHARGE_BUNDLE);
    assert.ok(PATIENT_DIRECTED_DISCHARGE_BUNDLE.insuranceMythEn.includes('0% of insurance claims are denied'));
    assert.ok(PATIENT_DIRECTED_DISCHARGE_BUNDLE.insuranceMythEs.includes('0% de las reclamaciones son rechazadas'));
    assert.strictEqual(PATIENT_DIRECTED_DISCHARGE_BUNDLE.harmReductionPrinciples.length, 4);

    const abx = PATIENT_DIRECTED_DISCHARGE_BUNDLE.harmReductionPrinciples[0];
    assert.ok(abx.titleEn.includes('Oral Step-Down Antibiotic'));

    const bridge = PATIENT_DIRECTED_DISCHARGE_BUNDLE.harmReductionPrinciples[1];
    assert.ok(bridge.titleEn.includes('Bridge MOUD Prescription'));

    const door = PATIENT_DIRECTED_DISCHARGE_BUNDLE.harmReductionPrinciples[3];
    assert.ok(door.titleEn.includes('Welcome-Back Policy'));
  });

  test('HOSPITAL_PATIENT_RIGHTS outlines EMTALA, HIPAA, pain treatment, and non-penalty departure', () => {
    const { HOSPITAL_PATIENT_RIGHTS } = hospModule;
    assert.ok(HOSPITAL_PATIENT_RIGHTS);
    assert.strictEqual(HOSPITAL_PATIENT_RIGHTS.rights.length, 4);

    const emtala = HOSPITAL_PATIENT_RIGHTS.rights[0];
    assert.ok(emtala.titleEn.includes('EMTALA'));

    const priv = HOSPITAL_PATIENT_RIGHTS.rights[1];
    assert.ok(priv.titleEn.includes('Privacy'));
  });

  test('formatInpatientSbarHandoff outputs bilingual clinical notes with Zero PII', () => {
    const { formatInpatientSbarHandoff } = hospModule;
    const state = {
      patientMoudStatus: 'fentanyl_active',
      inpatientPainSeverity: 'severe',
      suspectedInfectionType: 'endocarditis_sepsis',
      cowsScore: 12,
      wantsDischargeEarly: true
    };

    // English SBAR
    const sbarEn = formatInpatientSbarHandoff(state, false);
    assert.ok(sbarEn.includes('INPATIENT ADDICTION CONSULT SBAR CLINICAL NOTE'));
    assert.ok(sbarEn.includes('[S - SITUATION'));
    assert.ok(sbarEn.includes('[B - BACKGROUND'));
    assert.ok(sbarEn.includes('[A - ASSESSMENT'));
    assert.ok(sbarEn.includes('[R - RECOMMENDATIONS'));
    assert.ok(sbarEn.includes('CA Bridge'));
    assert.ok(sbarEn.toLowerCase().includes('oral step-down antibiotic'));

    // Spanish SBAR
    const sbarEs = formatInpatientSbarHandoff(state, true);
    assert.ok(sbarEs.includes('NOTA SBAR DE INTERCONSULTA DE ADICCIONES'));
    assert.ok(sbarEs.includes('[S - SITUATION / SITUACIÓN CLÍNICA HOSPITALARIA]'));
    assert.ok(sbarEs.includes('[B - BACKGROUND / ANTECEDENTES Y PERFIL FARMACOLÓGICO]'));
    assert.ok(sbarEs.includes('[A - ASSESSMENT / EVALUACIÓN CLÍNICA]'));
    assert.ok(sbarEs.includes('[R - RECOMMENDATIONS / PLAN DE MANEJO HOSPITALARIO Y ALTA]'));
    assert.ok(sbarEs.includes('CA Bridge'));

    // Zero PII audit on output
    [sbarEn, sbarEs].forEach((txt) => {
      assert.strictEqual(txt.includes('name:'), false);
      assert.strictEqual(txt.includes('ssn:'), false);
      assert.strictEqual(txt.includes('dob:'), false);
    });
  });

  test('In-RAM state management updates and resets deterministically without storage leakage', () => {
    const { getHospitalState, setHospitalState, resetHospitalState } = hospModule;

    const initial = getHospitalState();
    assert.strictEqual(initial.mode, 'clinician');
    assert.strictEqual(initial.patientMoudStatus, 'fentanyl_active');

    setHospitalState({
      mode: 'patient',
      activeTab: 'rights',
      patientMoudStatus: 'methadone_otp',
      wantsDischargeEarly: true
    });

    const updated = getHospitalState();
    assert.strictEqual(updated.mode, 'patient');
    assert.strictEqual(updated.activeTab, 'rights');
    assert.strictEqual(updated.patientMoudStatus, 'methadone_otp');
    assert.strictEqual(updated.wantsDischargeEarly, true);

    resetHospitalState();
    const reset = getHospitalState();
    assert.strictEqual(reset.mode, 'clinician');
    assert.strictEqual(reset.activeTab, 'bridge');
    assert.strictEqual(reset.wantsDischargeEarly, false);
  });

  test('hospitalCareView mounts semantic, accessible DOM across tabs and modes', () => {
    const { hospitalCareView, setHospitalState } = hospModule;

    const view = hospitalCareView();
    assert.ok(view);
    assert.strictEqual(view.tagName, 'DIV');
    assert.ok(view.classList.contains('hospital-care-view'));

    const h1 = view.querySelector('h1');
    assert.ok(h1);
    assert.ok(h1.textContent.includes('Hospital') || h1.textContent.includes('Hospitalaria'));

    // Switch to Patient Mode
    setHospitalState({ mode: 'patient' });
    const lead = view.querySelector('.lead');
    assert.ok(lead);
    assert.ok(lead.textContent.includes('Going to the hospital') || lead.textContent.includes('Ir al hospital'));

    // Switch to Tab 2: Pain on MOUD
    setHospitalState({ activeTab: 'pain' });
    const painCards = view.querySelectorAll('.pain-principle-card');
    assert.strictEqual(painCards.length, 4);

    // Switch to Tab 3: Discharge & Insurance Myth
    setHospitalState({ activeTab: 'discharge' });
    const dischargeCards = view.querySelectorAll('.discharge-principle-item');
    assert.strictEqual(dischargeCards.length, 4);

    // Switch to Tab 4: Rights & EMTALA
    setHospitalState({ activeTab: 'rights' });
    const rightsCards = view.querySelectorAll('.rights-item');
    assert.strictEqual(rightsCards.length, 4);

    // Switch to Tab 5: SBAR Handoff
    setHospitalState({ activeTab: 'sbar', mode: 'clinician' });
    const sbarPre = view.querySelector('.sbar-preview-box');
    assert.ok(sbarPre);
    assert.ok(sbarPre.textContent.includes('SBAR'));
  });

  test('Static audit: zero localStorage, sessionStorage, cookie, innerHTML, or style= writes', () => {
    const filePath = path.resolve('public/js/views/hospitalCare.js');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.strictEqual(content.includes('localStorage'), false);
    assert.strictEqual(content.includes('sessionStorage'), false);
    assert.strictEqual(content.includes('document.cookie'), false);
    assert.strictEqual(content.includes('innerHTML'), false);
    assert.strictEqual(content.includes('outerHTML'), false);
    assert.strictEqual(content.includes('style='), false);
  });
});
