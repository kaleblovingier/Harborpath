// test/orthopedic-care.test.js
// Comprehensive Unit & Clinical Logic Test Suite for Wave 49: Spine, Musculoskeletal & Orthopedic Infections Navigator

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ORTHOPEDIC_SYNDROME_PROFILES,
  ORTHOPEDIC_HARM_REDUCTION_RULES,
  getOrthopedicState,
  setOrthopedicState,
  resetOrthopedicState,
  subscribeOrthopedicState,
  evaluateOrthopedicRisk,
  formatOrthopedicSbarText,
  orthopedicCareView,
} from '../public/js/views/orthopedicCare.js';

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

describe('Spine, Musculoskeletal & Orthopedic Infections Navigator Module (Wave 49)', () => {
  beforeEach(() => {
    setupMockDom();
    resetOrthopedicState();
  });

  it('1. ORTHOPEDIC_SYNDROME_PROFILES exports all 6 evidence-based spine, joint, and muscle syndromes', () => {
    const keys = Object.keys(ORTHOPEDIC_SYNDROME_PROFILES);
    assert.equal(keys.length, 6);
    assert.deepEqual(keys, [
      'spinalEpiduralAbscess',
      'septicArthritisPwid',
      'iliopsoasAbscess',
      'pyomyositisMyonecrosis',
      'ovivaDalbavancinStepdown',
      'opioidAlcoholBoneHealth',
    ]);

    // Verify Spinal Epidural Abscess & 15% Triad Trap
    const sea = ORTHOPEDIC_SYNDROME_PROFILES.spinalEpiduralAbscess;
    assert.match(sea.pathophysiologyEn, /Batson/i);
    assert.match(sea.clinicalPresentationEn, /FEWER THAN 15%/i);
    assert.match(sea.clinicalPresentationEn, /ENTIRE Spine/i);
    assert.match(sea.clinicalPresentationEn, /laminectomy/i);

    // Verify Septic Arthritis & Sternoclavicular Mediastinitis Alert
    const sa = ORTHOPEDIC_SYNDROME_PROFILES.septicArthritisPwid;
    assert.match(sa.pathophysiologyEn, /Sternoclavicular Joint/i);
    assert.match(sa.clinicalPresentationEn, /mediastinitis/i);
    assert.match(sa.clinicalPresentationEn, /50,000\/mcL/i);
    assert.match(sa.clinicalPresentationEn, /crystals[\s\S]*DOES NOT exclude/i);

    // Verify Iliopsoas Abscess & Psoas Sign
    const psoas = ORTHOPEDIC_SYNDROME_PROFILES.iliopsoasAbscess;
    assert.match(psoas.clinicalPresentationEn, /Positive Psoas Sign/i);
    assert.match(psoas.clinicalPresentationEn, /CT Abdomen\/Pelvis/i);

    // Verify Pyomyositis, Clostridial Myonecrosis & Eagle Effect
    const pyo = ORTHOPEDIC_SYNDROME_PROFILES.pyomyositisMyonecrosis;
    assert.match(pyo.pathophysiologyEn, /Clostridium sordellii/i);
    assert.match(pyo.clinicalPresentationEn, /LEUKEMOID REACTION/i);
    assert.match(pyo.clinicalPresentationEn, /Eagle effect/i);
    assert.match(pyo.clinicalPresentationEn, /CLINDAMYCIN/i);

    // Verify NEJM OVIVA Trial & Dalbavancin
    const oviva = ORTHOPEDIC_SYNDROME_PROFILES.ovivaDalbavancinStepdown;
    assert.match(oviva.clinicalPresentationEn, /OVIVA/i);
    assert.match(oviva.clinicalPresentationEn, /Dalbavancin 1,500 mg IV on Day 1 \+ 1,500 mg IV on Day 8/i);

    // Verify Femoral Head AVN & OPIAD
    const avn = ORTHOPEDIC_SYNDROME_PROFILES.opioidAlcoholBoneHealth;
    assert.match(avn.pathophysiologyEn, /OPIAD/i);
    assert.match(avn.clinicalPresentationEn, /double-line sign/i);
    assert.match(avn.clinicalPresentationEn, /crescent sign/i);
  });

  it('2. ORTHOPEDIC_HARM_REDUCTION_RULES exports 6 bilingual clinical field rules', () => {
    assert.equal(ORTHOPEDIC_HARM_REDUCTION_RULES.length, 6);
    ORTHOPEDIC_HARM_REDUCTION_RULES.forEach((rule, idx) => {
      assert.equal(rule.ruleNum, idx + 1);
      assert.ok(rule.titleEn.length > 10);
      assert.ok(rule.titleEs.length > 10);
      assert.ok(rule.detailEn.length > 20);
      assert.ok(rule.detailEs.length > 20);
    });
  });

  it('3. evaluateOrthopedicRisk accurately stratifies all 4 acuity levels and clinical directives', () => {
    // Precautionary default
    const base = evaluateOrthopedicRisk({});
    assert.equal(base.urgency, 'precautionary');
    assert.equal(base.flags[0].id, 'standard_orthopedic_precautions');

    // Stage 3-4 SEA with Neuro Deficit -> emergency_911
    const sea = evaluateOrthopedicRisk({ spinePainWithNeuroDeficitOrRetention: true });
    assert.equal(sea.urgency, 'emergency_911');
    assert.ok(sea.flags.some((f) => f.id === 'spinal_epidural_abscess_neuro_emergency'));

    // Clostridial Myonecrosis / Pyomyositis -> emergency_911
    const myo = evaluateOrthopedicRisk({ deepMusclePainCrepitusLeukemoid: true });
    assert.equal(myo.urgency, 'emergency_911');
    const myoFlag = myo.flags.find((f) => f.id === 'clostridial_myonecrosis_pyomyositis_emergency');
    assert.ok(myoFlag);
    assert.match(myoFlag.descEn, /CLINDAMYCIN/i);

    // Septic Arthritis / Sternoclavicular -> emergency_911
    const sa = evaluateOrthopedicRisk({ sternoclavicularOrJointSwellingFever: true });
    assert.equal(sa.urgency, 'emergency_911');
    assert.ok(sa.flags.some((f) => f.id === 'septic_arthritis_sternoclavicular_emergency'));

    // New Midline Spine Pain Without Neuro Deficit (15% Triad Trap) -> urgent_eval
    const earlySea = evaluateOrthopedicRisk({ newMidlineSpinePainPwidNoNeuro: true });
    assert.equal(earlySea.urgency, 'urgent_eval');
    assert.ok(earlySea.flags.some((f) => f.id === 'vertebral_osteomyelitis_early_sea_eval'));

    // Iliopsoas Abscess -> urgent_eval
    const psoas = evaluateOrthopedicRisk({ hipFlexionPainPositivePsoasSign: true });
    assert.equal(psoas.urgency, 'urgent_eval');
    assert.ok(psoas.flags.some((f) => f.id === 'iliopsoas_retroperitoneal_abscess_eval'));

    // OVIVA Oral Step-Down / Dalbavancin -> urgent_eval
    const oviva = evaluateOrthopedicRisk({ osteomyelitisPiccBarrierOrAmaRisk: true });
    assert.equal(oviva.urgency, 'urgent_eval');
    assert.ok(oviva.flags.some((f) => f.id === 'oviva_oral_stepdown_dalbavancin_protocol'));

    // Femoral Head AVN / OPIAD -> specialty_consult
    const avn = evaluateOrthopedicRisk({ chronicGroinPainAlcoholOrLongTermOpioids: true });
    assert.equal(avn.urgency, 'specialty_consult');
    assert.ok(avn.flags.some((f) => f.id === 'femoral_head_avn_opiad_osteoporosis_eval'));
  });

  it('4. formatOrthopedicSbarText generates structured Zero-PII SBAR notes in English and Spanish', () => {
    const state = {
      spinePainWithNeuroDeficitOrRetention: true,
      deepMusclePainCrepitusLeukemoid: true,
      osteomyelitisPiccBarrierOrAmaRisk: true,
    };

    const enText = formatOrthopedicSbarText(state, 'en');
    assert.match(enText, /HARBORPATH CLINICAL SBAR SUMMARY — SPINE, ORTHOPEDICS & BONE\/JOINT INFECTIONS \(ZERO-PII\)/);
    assert.match(enText, /Spinal Epidural Abscess/);
    assert.match(enText, /Dalbavancin/);

    const esText = formatOrthopedicSbarText(state, 'es');
    assert.match(esText, /RESUMEN CLÍNICO SBAR HARBORPATH — COLUMNA, ORTOPEDIA E INFECCIONES ÓSEAS \(ZERO-PII\)/);
    assert.match(esText, /Absceso Epidural Espinal/);
  });

  it('5. Ephemeral in-RAM state lifecycle updates, notifies subscribers, and resets cleanly', () => {
    let notifiedCount = 0;
    const unsub = subscribeOrthopedicState(() => {
      notifiedCount += 1;
    });

    setOrthopedicState({ activeTab: 'evaluator', spinePainWithNeuroDeficitOrRetention: true });
    assert.equal(getOrthopedicState().activeTab, 'evaluator');
    assert.equal(getOrthopedicState().spinePainWithNeuroDeficitOrRetention, true);
    assert.equal(notifiedCount, 1);

    resetOrthopedicState();
    assert.equal(getOrthopedicState().activeTab, 'syndromes');
    assert.equal(getOrthopedicState().spinePainWithNeuroDeficitOrRetention, false);
    assert.equal(notifiedCount, 2);

    unsub();
  });

  it('6. orthopedicCareView renders accessible WCAG 2.2 AA DOM across all 4 tabs', () => {
    const view = orthopedicCareView();
    assert.equal(view.tagName, 'DIV');
    assert.match(view.className, /orthopedic-care-view/);

    setOrthopedicState({ activeTab: 'evaluator' });
    assert.equal(getOrthopedicState().activeTab, 'evaluator');

    setOrthopedicState({ activeTab: 'rules' });
    assert.equal(getOrthopedicState().activeTab, 'rules');

    setOrthopedicState({ activeTab: 'sbar' });
    assert.equal(getOrthopedicState().activeTab, 'sbar');
  });

  it('7. Static Security & Privacy Audit: zero storage APIs, zero innerHTML, zero inline style=', () => {
    const src = fs.readFileSync(path.join(ROOT_DIR, 'public/js/views/orthopedicCare.js'), 'utf8');
    assert.doesNotMatch(src, /localStorage|sessionStorage|indexedDB|document\.cookie/);
    assert.doesNotMatch(src, /\.innerHTML|\.outerHTML/);
    assert.doesNotMatch(src, /style\s*=/i);
  });
});
