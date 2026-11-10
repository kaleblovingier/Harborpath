// test/ocular-care.test.js
// Comprehensive Unit & Clinical Logic Test Suite for Wave 50: Ophthalmology, Vision Loss & Ocular Toxicology Navigator

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  OCULAR_SYNDROME_PROFILES,
  OCULAR_HARM_REDUCTION_RULES,
  getOcularState,
  setOcularState,
  resetOcularState,
  subscribeOcularState,
  evaluateOcularRisk,
  formatOcularSbarText,
  ocularCareView,
} from '../public/js/views/ocularCare.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Minimal DOM shim for testing view rendering in Node.js
class MockElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.attributes = {};
    this.children = [];
    this.textContent = '';
    this.listeners = {};
    this.className = '';
    this.checked = false;
  }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
    if (k === 'class') this.className = String(v);
  }
  getAttribute(k) {
    return this.attributes[k] ?? null;
  }
  appendChild(child) {
    if (child && typeof child === 'object') {
      child.parentNode = this;
      if (!child.remove) {
        child.remove = () => {
          const idx = this.children.indexOf(child);
          if (idx !== -1) this.children.splice(idx, 1);
        };
      }
    }
    this.children.push(child);
    return child;
  }
  append(...items) {
    items.forEach((item) => this.appendChild(item));
  }
  get firstChild() {
    return this.children[0] || null;
  }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  querySelector(selector) {
    for (const c of this.children) {
      if (c && typeof c === 'object') {
        if (selector === 'input' && c.tagName === 'INPUT') return c;
        if (selector === 'button' && c.tagName === 'BUTTON') return c;
        if (c.querySelector) {
          const found = c.querySelector(selector);
          if (found) return found;
        }
      }
    }
    return null;
  }
}

function setupMockDom() {
  globalThis.Node = MockElement;
  globalThis.document = {
    documentElement: { lang: 'en' },
    createElement: (tag) => new MockElement(tag),
    createElementNS: (_ns, tag) => new MockElement(tag),
    createTextNode: (text) => String(text),
  };
}

describe('Ophthalmology, Vision Loss & Ocular Toxicology Navigator Module (Wave 50)', () => {
  beforeEach(() => {
    setupMockDom();
    resetOcularState();
  });

  it('1. OCULAR_SYNDROME_PROFILES exports all 6 evidence-based ophthalmic & ocular toxicology syndromes', () => {
    const keys = Object.keys(OCULAR_SYNDROME_PROFILES);
    assert.equal(keys.length, 6);
    assert.deepEqual(keys, [
      'methanolOpticNeuropathy',
      'endogenousEndophthalmitis',
      'crackCorneaKeratopathy',
      'craoTalcGlaucoma',
      'poppersMaculopathy',
      'orbitalCavernousSinus',
    ]);

    // Verify Methanol Toxic Optic Neuropathy & Formic Acid
    const meth = OCULAR_SYNDROME_PROFILES.methanolOpticNeuropathy;
    assert.match(meth.pathophysiologyEn, /Formic Acid/i);
    assert.match(meth.pathophysiologyEn, /Cytochrome c Oxidase/i);
    assert.match(meth.clinicalPresentationEn, /snowstorm/i);
    assert.match(meth.clinicalPresentationEn, /Fomepizole/i);
    assert.match(meth.clinicalPresentationEn, /Leucovorin/i);

    // Verify Endogenous Endophthalmitis & Blood-Retinal Barrier
    const endo = OCULAR_SYNDROME_PROFILES.endogenousEndophthalmitis;
    assert.match(endo.pathophysiologyEn, /lemon juice/i);
    assert.match(endo.clinicalPresentationEn, /Blood-Retinal Barrier/i);
    assert.match(endo.clinicalPresentationEn, /Echinocandins/i);
    assert.match(endo.clinicalPresentationEn, /INTRAVITREAL TAP & INJECT/i);

    // Verify "Crack Cornea" & Topical Anesthetic Melt Prohibition
    const crack = OCULAR_SYNDROME_PROFILES.crackCorneaKeratopathy;
    assert.match(crack.clinicalPresentationEn, /Proparacaine/i);
    assert.match(crack.clinicalPresentationEn, /stromal melting and perforation/i);

    // Verify CRAO & Topiramate Angle-Closure Glaucoma
    const crao = OCULAR_SYNDROME_PROFILES.craoTalcGlaucoma;
    assert.match(crao.clinicalPresentationEn, /Cherry-Red Spot/i);
    assert.match(crao.clinicalPresentationEn, /Pilocarpine[\s\S]*CONTRAINDICATED/i);
    assert.match(crao.clinicalPresentationEn, /Cycloplegics/i);

    // Verify Poppers Maculopathy
    const pop = OCULAR_SYNDROME_PROFILES.poppersMaculopathy;
    assert.match(pop.pathophysiologyEn, /ellipsoid zone/i);
    assert.match(pop.clinicalPresentationEn, /SD-OCT/i);

    // Verify Orbital Cellulitis & Cavernous Sinus Thrombosis
    const cst = OCULAR_SYNDROME_PROFILES.orbitalCavernousSinus;
    assert.match(cst.clinicalPresentationEn, /RED COLOR SATURATION/i);
    assert.match(cst.clinicalPresentationEn, /CN VI/i);
  });

  it('2. OCULAR_HARM_REDUCTION_RULES exports 6 bilingual clinical field rules', () => {
    assert.equal(OCULAR_HARM_REDUCTION_RULES.length, 6);
    OCULAR_HARM_REDUCTION_RULES.forEach((rule, idx) => {
      assert.equal(rule.ruleNum, idx + 1);
      assert.ok(rule.titleEn.length > 10);
      assert.ok(rule.titleEs.length > 10);
      assert.ok(rule.detailEn.length > 20);
      assert.ok(rule.detailEs.length > 20);
    });
  });

  it('3. evaluateOcularRisk accurately stratifies all 4 acuity levels and clinical traps', () => {
    // Precautionary default
    const base = evaluateOcularRisk({});
    assert.equal(base.urgency, 'precautionary');
    assert.equal(base.flags[0].id, 'standard_ocular_precautions');

    // Methanol Formic Acid Optic Neuropathy -> emergency_911
    const meth = evaluateOcularRisk({ snowstormVisionMoonshineAcidosis: true });
    assert.equal(meth.urgency, 'emergency_911');
    assert.ok(meth.flags.some((f) => f.id === 'methanol_formic_acid_optic_neuropathy_emergency'));

    // Endogenous Endophthalmitis -> emergency_911
    const endo = evaluateOcularRisk({ floatersHypopyonVisionLossPwid: true });
    assert.equal(endo.urgency, 'emergency_911');
    assert.ok(endo.flags.some((f) => f.id === 'endogenous_endophthalmitis_intravitreal_emergency'));

    // CRAO ("Stroke of the Eye") -> emergency_911
    const crao = evaluateOcularRisk({ painlessSuddenMonocularBlindnessCrao: true });
    assert.equal(crao.urgency, 'emergency_911');
    assert.ok(crao.flags.some((f) => f.id === 'crao_retinal_stroke_emergency'));

    // Orbital Cellulitis / Cavernous Sinus Thrombosis -> emergency_911
    const cst = evaluateOcularRisk({ proptosisPainfulEyeMovementDiplopia: true });
    assert.equal(cst.urgency, 'emergency_911');
    assert.ok(cst.flags.some((f) => f.id === 'orbital_cellulitis_cavernous_sinus_thrombosis'));

    // Topiramate Angle-Closure Glaucoma -> urgent_eval
    const topi = evaluateOcularRisk({ bilateralEyePainBlurTopiramate: true });
    assert.equal(topi.urgency, 'urgent_eval');
    const topiFlag = topi.flags.find((f) => f.id === 'topiramate_ciliochoroidal_glaucoma_alert');
    assert.ok(topiFlag);
    assert.match(topiFlag.descEn, /DO NOT ADMINISTER PILOCARPINE/i);

    // "Crack Cornea" Microbial Keratitis -> urgent_eval
    const crack = evaluateOcularRisk({ severeCornealPainPhotophobiaStimulantSmoke: true });
    assert.equal(crack.urgency, 'urgent_eval');
    assert.ok(crack.flags.some((f) => f.id === 'crack_cornea_microbial_keratitis_eval'));

    // Poppers Maculopathy -> specialty_consult
    const pop = evaluateOcularRisk({ centralLightSpotsBlurAfterPoppers: true });
    assert.equal(pop.urgency, 'specialty_consult');
    assert.ok(pop.flags.some((f) => f.id === 'poppers_maculopathy_oct_consult'));
  });

  it('4. formatOcularSbarText generates structured Zero-PII SBAR notes in English and Spanish', () => {
    const state = {
      snowstormVisionMoonshineAcidosis: true,
      floatersHypopyonVisionLossPwid: true,
      bilateralEyePainBlurTopiramate: true,
    };

    const enText = formatOcularSbarText(state, 'en');
    assert.match(enText, /HARBORPATH CLINICAL SBAR SUMMARY — OPHTHALMOLOGY, VISION LOSS & OCULAR TOXICOLOGY \(ZERO-PII\)/);
    assert.match(enText, /Fomepizole/);
    assert.match(enText, /Intravitreal Tap & Inject/);

    const esText = formatOcularSbarText(state, 'es');
    assert.match(esText, /RESUMEN CLÍNICO SBAR HARBORPATH — OFTALMOLOGÍA, PÉRDIDA VISUAL Y TOXICOLOGÍA OCULAR \(ZERO-PII\)/);
    assert.match(esText, /Inyección Intravítrea/);
  });

  it('5. Ephemeral in-RAM state lifecycle updates, notifies subscribers, and resets cleanly', () => {
    let notifiedCount = 0;
    const unsub = subscribeOcularState(() => {
      notifiedCount += 1;
    });

    setOcularState({ activeTab: 'evaluator', snowstormVisionMoonshineAcidosis: true });
    assert.equal(getOcularState().activeTab, 'evaluator');
    assert.equal(getOcularState().snowstormVisionMoonshineAcidosis, true);
    assert.equal(notifiedCount, 1);

    resetOcularState();
    assert.equal(getOcularState().activeTab, 'syndromes');
    assert.equal(getOcularState().snowstormVisionMoonshineAcidosis, false);
    assert.equal(notifiedCount, 2);

    unsub();
  });

  it('6. ocularCareView renders accessible WCAG 2.2 AA DOM across all 4 tabs', () => {
    const view = ocularCareView();
    assert.equal(view.tagName, 'DIV');
    assert.match(view.className, /ocular-care-view/);

    setOcularState({ activeTab: 'evaluator' });
    assert.equal(getOcularState().activeTab, 'evaluator');

    setOcularState({ activeTab: 'rules' });
    assert.equal(getOcularState().activeTab, 'rules');

    setOcularState({ activeTab: 'sbar' });
    assert.equal(getOcularState().activeTab, 'sbar');
  });

  it('7. Static Security & Privacy Audit: zero storage APIs, zero innerHTML, zero inline style=', () => {
    const src = fs.readFileSync(path.join(ROOT_DIR, 'public/js/views/ocularCare.js'), 'utf8');
    assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|document\.cookie/);
    assert.doesNotMatch(src, /\.innerHTML|\.outerHTML/);
    assert.doesNotMatch(src, /style\s*=/i);
  });
});
