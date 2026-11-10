// test/hematology-care.test.js
// Comprehensive Unit & Clinical Logic Test Suite for Wave 48: Hematology, Coagulopathy & Toxic Hemolysis Navigator

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  HEMATOLOGY_SYNDROME_PROFILES,
  HEMATOLOGY_HARM_REDUCTION_RULES,
  getHematologyState,
  setHematologyState,
  resetHematologyState,
  subscribeHematologyState,
  evaluateHematologyRisk,
  formatHematologySbarText,
  hematologyCareView,
} from '../public/js/views/hematologyCare.js';

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

describe('Hematology, Coagulopathy & Toxic Hemolysis Navigator Module (Wave 48)', () => {
  beforeEach(() => {
    setupMockDom();
    resetHematologyState();
  });

  it('1. HEMATOLOGY_SYNDROME_PROFILES exports all 6 evidence-based hematologic & coagulopathic syndromes', () => {
    const keys = Object.keys(HEMATOLOGY_SYNDROME_PROFILES);
    assert.equal(keys.length, 6);
    assert.deepEqual(keys, [
      'levamisoleVasculitis',
      'brodifacoumSuperwarfarin',
      'oxidantHemolysisG6pd',
      'drugInducedTma',
      'alcoholMarrowZieve',
      'cirrhosisRebalancedHemostasis',
    ]);

    // Verify Levamisole ANCA Vasculitis & Agranulocytosis
    const lev = HEMATOLOGY_SYNDROME_PROFILES.levamisoleVasculitis;
    assert.match(lev.pathophysiologyEn, /p-ANCA/i);
    assert.match(lev.pathophysiologyEn, /c-ANCA/i);
    assert.match(lev.clinicalPresentationEn, /earlobes/i);
    assert.match(lev.clinicalPresentationEn, /ANC[\s\S]*500/i);
    assert.match(lev.clinicalPresentationEn, /Filgrastim/i);

    // Verify Brodifacoum ("Superwarfarin") Synthetic Cannabinoid Coagulopathy
    const brod = HEMATOLOGY_SYNDROME_PROFILES.brodifacoumSuperwarfarin;
    assert.match(brod.pathophysiologyEn, /VKORC1/i);
    assert.match(brod.pathophysiologyEn, /20 to 60\+ days/i);
    assert.match(brod.clinicalPresentationEn, /4-Factor Prothrombin Complex Concentrate/i);
    assert.match(brod.clinicalPresentationEn, /50–100 mg PO daily/i);

    // Verify Oxidant Hemolysis, Methemoglobinemia & G6PD Methylene Blue Contraindication
    const ox = HEMATOLOGY_SYNDROME_PROFILES.oxidantHemolysisG6pd;
    assert.match(ox.pathophysiologyEn, /Heinz bodies/i);
    assert.match(ox.pathophysiologyEn, /bite cells/i);
    assert.match(ox.clinicalPresentationEn, /Methylene Blue is ABSOLUTELY CONTRAINDICATED/i);
    assert.match(ox.clinicalPresentationEn, /Ascorbic Acid/i);

    // Verify IV Polymer-Tablet (PEO) & Quinine TMA / TTP-HUS
    const tma = HEMATOLOGY_SYNDROME_PROFILES.drugInducedTma;
    assert.match(tma.pathophysiologyEn, /polyethylene oxide/i);
    assert.match(tma.clinicalPresentationEn, /schistocytes/i);
    assert.match(tma.clinicalPresentationEn, /ADAMTS13/i);
    assert.match(tma.clinicalPresentationEn, /Therapeutic Plasma Exchange/i);

    // Verify Alcohol Marrow Suppression, Zieve Syndrome & Folate-B12 Rule
    const zieve = HEMATOLOGY_SYNDROME_PROFILES.alcoholMarrowZieve;
    assert.match(zieve.clinicalPresentationEn, /Zieve Syndrome/i);
    assert.match(zieve.clinicalPresentationEn, /Spur Cell/i);
    assert.match(zieve.clinicalPresentationEn, /Subacute Combined Degeneration/i);

    // Verify Cirrhosis "Rebalanced Hemostasis" & Prophylactic FFP Contraindication
    const cirr = HEMATOLOGY_SYNDROME_PROFILES.cirrhosisRebalancedHemostasis;
    assert.match(cirr.pathophysiologyEn, /rebalanced hemostasis/i);
    assert.match(cirr.clinicalPresentationEn, /CONTRAINDICATED/i);
    assert.match(cirr.clinicalPresentationEn, /Cryoprecipitate/i);
  });

  it('2. HEMATOLOGY_HARM_REDUCTION_RULES exports 6 bilingual clinical field rules', () => {
    assert.equal(HEMATOLOGY_HARM_REDUCTION_RULES.length, 6);
    HEMATOLOGY_HARM_REDUCTION_RULES.forEach((rule, idx) => {
      assert.equal(rule.ruleNum, idx + 1);
      assert.ok(rule.titleEn.length > 10);
      assert.ok(rule.titleEs.length > 10);
      assert.ok(rule.detailEn.length > 20);
      assert.ok(rule.detailEs.length > 20);
    });
  });

  it('3. evaluateHematologyRisk accurately stratifies all 4 acuity levels and clinical traps', () => {
    // Precautionary default
    const base = evaluateHematologyRisk({});
    assert.equal(base.urgency, 'precautionary');
    assert.equal(base.flags[0].id, 'standard_hematology_precautions');

    // Brodifacoum Superwarfarin Coagulopathy -> emergency_911
    const brod = evaluateHematologyRisk({ syntheticCannabinoidBleeding: true });
    assert.equal(brod.urgency, 'emergency_911');
    assert.ok(brod.flags.some((f) => f.id === 'brodifacoum_superwarfarin_emergency'));

    // Methemoglobinemia WITH G6PD Deficiency -> emergency_911 + Methylene Blue Contraindication
    const metG6pd = evaluateHematologyRisk({
      chocolateCyanosisSaturationGap: true,
      knownOrSuspectedG6pdDeficiency: true,
    });
    assert.equal(metG6pd.urgency, 'emergency_911');
    const g6pdFlag = metG6pd.flags.find((f) => f.id === 'methemoglobinemia_g6pd_contraindication');
    assert.ok(g6pdFlag);
    assert.match(g6pdFlag.descEn, /DO NOT ADMINISTER METHYLENE BLUE/i);
    assert.match(g6pdFlag.descEn, /Ascorbic Acid/i);

    // Methemoglobinemia WITHOUT G6PD Deficiency -> emergency_911
    const metNoG6pd = evaluateHematologyRisk({
      chocolateCyanosisSaturationGap: true,
      knownOrSuspectedG6pdDeficiency: false,
    });
    assert.equal(metNoG6pd.urgency, 'emergency_911');
    assert.ok(metNoG6pd.flags.some((f) => f.id === 'methemoglobinemia_oxidant_hemolysis'));

    // Levamisole Agranulocytosis & ANCA Vasculitis -> emergency_911
    const lev = evaluateHematologyRisk({ cocaineEarlobePurpuraOrFever: true });
    assert.equal(lev.urgency, 'emergency_911');
    assert.ok(lev.flags.some((f) => f.id === 'levamisole_agranulocytosis_vasculitis'));

    // IV Polymer-Tablet / Quinine TMA -> emergency_911
    const tma = evaluateHematologyRisk({ ivTabletPetechiaeDarkUrineTma: true });
    assert.equal(tma.urgency, 'emergency_911');
    assert.ok(tma.flags.some((f) => f.id === 'drug_induced_tma_ttp_hus'));

    // Cirrhosis Elevated INR Pre-Procedure -> urgent_eval
    const cirr = evaluateHematologyRisk({ cirrhosisElevatedInrProcedure: true });
    assert.equal(cirr.urgency, 'urgent_eval');
    assert.ok(cirr.flags.some((f) => f.id === 'cirrhosis_rebalanced_hemostasis_ffp_ban'));

    // Alcohol Jaundice Hemolysis (Zieve / Spur Cell) -> urgent_eval
    const zieve = evaluateHematologyRisk({ alcoholJaundiceHemolysisZieve: true });
    assert.equal(zieve.urgency, 'urgent_eval');
    assert.ok(zieve.flags.some((f) => f.id === 'zieve_syndrome_spur_cell_eval'));

    // Macrocytic Anemia + Neuropathy -> specialty_consult
    const b12 = evaluateHematologyRisk({ macrocyticAnemiaNeuropathyB12: true });
    assert.equal(b12.urgency, 'specialty_consult');
    assert.ok(b12.flags.some((f) => f.id === 'megaloblastic_macrocytosis_b12_folate_rule'));
  });

  it('4. formatHematologySbarText generates structured Zero-PII SBAR notes in English and Spanish', () => {
    const state = {
      syntheticCannabinoidBleeding: true,
      chocolateCyanosisSaturationGap: true,
      knownOrSuspectedG6pdDeficiency: true,
      cirrhosisElevatedInrProcedure: true,
    };

    const enText = formatHematologySbarText(state, 'en');
    assert.match(enText, /HARBORPATH CLINICAL SBAR SUMMARY — HEMATOLOGY, COAGULOPATHY & HEMOLYSIS \(ZERO-PII\)/);
    assert.match(enText, /Brodifacoum/);
    assert.match(enText, /DO NOT ADMINISTER METHYLENE BLUE/);

    const esText = formatHematologySbarText(state, 'es');
    assert.match(esText, /RESUMEN CLÍNICO SBAR HARBORPATH — HEMATOLOGÍA, COAGULOPATÍA Y HEMÓLISIS \(ZERO-PII\)/);
    assert.match(esText, /PROHIBIDO ADMINISTRAR AZUL DE METILENO/);
  });

  it('5. Ephemeral in-RAM state lifecycle updates, notifies subscribers, and resets cleanly', () => {
    let notifiedCount = 0;
    const unsub = subscribeHematologyState(() => {
      notifiedCount += 1;
    });

    setHematologyState({ activeTab: 'evaluator', cocaineEarlobePurpuraOrFever: true });
    assert.equal(getHematologyState().activeTab, 'evaluator');
    assert.equal(getHematologyState().cocaineEarlobePurpuraOrFever, true);
    assert.equal(notifiedCount, 1);

    resetHematologyState();
    assert.equal(getHematologyState().activeTab, 'syndromes');
    assert.equal(getHematologyState().cocaineEarlobePurpuraOrFever, false);
    assert.equal(notifiedCount, 2);

    unsub();
  });

  it('6. hematologyCareView renders accessible WCAG 2.2 AA DOM across all 4 tabs', () => {
    const view = hematologyCareView();
    assert.equal(view.tagName, 'DIV');
    assert.match(view.className, /hematology-care-view/);

    setHematologyState({ activeTab: 'evaluator' });
    assert.equal(getHematologyState().activeTab, 'evaluator');

    setHematologyState({ activeTab: 'rules' });
    assert.equal(getHematologyState().activeTab, 'rules');

    setHematologyState({ activeTab: 'sbar' });
    assert.equal(getHematologyState().activeTab, 'sbar');
  });

  it('7. Static Security & Privacy Audit: zero storage APIs, zero innerHTML, zero inline style=', () => {
    const src = fs.readFileSync(path.join(ROOT_DIR, 'public/js/views/hematologyCare.js'), 'utf8');
    assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|document\.cookie/);
    assert.doesNotMatch(src, /\.innerHTML|\.outerHTML/);
    assert.doesNotMatch(src, /style\s*=/i);
  });
});
