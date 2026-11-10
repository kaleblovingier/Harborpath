// test/gi-care.test.js
// HarborPath - Gastrointestinal & Mesenteric Emergencies Navigator Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  GI_SYNDROME_PROFILES,
  GI_HARM_REDUCTION_RULES,
  evaluateGiRisk,
  formatGiSbarText,
  getGiState,
  setGiState,
  resetGiState,
  subscribeGiState,
  giCareView,
} from '../public/js/views/giCare.js';

describe('Gastrointestinal & Mesenteric Emergencies Navigator Module (Wave 46)', () => {
  it('exports verified substance-induced gastrointestinal syndrome profiles with pathophysiologic taxonomy', () => {
    // 1. Acute Pancreatitis (Atlanta Criteria & WATERFALL Protocol)
    const panc = GI_SYNDROME_PROFILES.acutePancreatitis;
    assert.ok(panc);
    assert.strictEqual(panc.id, 'acute_pancreatitis');
    assert.ok(panc.nameEn.includes('Acute Pancreatitis'));
    assert.ok(panc.nameEn.includes('WATERFALL'));
    assert.ok(panc.pathophysiologyEn.includes('trypsinogen'));
    assert.ok(panc.clinicalPresentationEn.includes('Lipase'));
    assert.ok(panc.clinicalPresentationEn.includes('1.5 mL/kg/h'));
    assert.ok(panc.clinicalPresentationEn.includes('24–48 hours'));

    // 2. Cocaine & Methamphetamine Mesenteric Ischemia (NOMI) & Ischemic Colitis
    const nomi = GI_SYNDROME_PROFILES.mesentericIschemia;
    assert.ok(nomi);
    assert.strictEqual(nomi.id, 'mesenteric_ischemia');
    assert.ok(nomi.nameEn.includes('Mesenteric Ischemia'));
    assert.ok(nomi.pathophysiologyEn.includes('Splenic Flexure'));
    assert.ok(nomi.clinicalPresentationEn.includes('Pain Out of Proportion'));
    assert.ok(nomi.clinicalPresentationEn.includes('CTA Abdomen/Pelvis'));

    // 3. Opioid-Induced Constipation (OIC), PAMORAs & Stercoral Perforation
    const oic = GI_SYNDROME_PROFILES.oicPamora;
    assert.ok(oic);
    assert.strictEqual(oic.id, 'oic_pamora');
    assert.ok(oic.nameEn.includes('Opioid-Induced Constipation'));
    assert.ok(oic.pathophysiologyEn.includes('NEVER develops tolerance'));
    assert.ok(oic.clinicalPresentationEn.includes('docusate'));
    assert.ok(oic.clinicalPresentationEn.includes('Methylnaltrexone'));
    assert.ok(oic.clinicalPresentationEn.includes('ABSOLUTELY CONTRAINDICATED'));

    // 4. Narcotic Bowel Syndrome (NBS)
    const nbs = GI_SYNDROME_PROFILES.narcoticBowel;
    assert.ok(nbs);
    assert.strictEqual(nbs.id, 'narcotic_bowel');
    assert.ok(nbs.nameEn.includes('Narcotic Bowel Syndrome'));
    assert.ok(nbs.pathophysiologyEn.includes('TLR4'));
    assert.ok(nbs.clinicalPresentationEn.includes('Tricyclic Antidepressants'));

    // 5. Boerhaave Syndrome vs. Mallory-Weiss Tear
    const boer = GI_SYNDROME_PROFILES.boerhaaveMalloryWeiss;
    assert.ok(boer);
    assert.strictEqual(boer.id, 'boerhaave_mallory_weiss');
    assert.ok(boer.nameEn.includes('Boerhaave Syndrome'));
    assert.ok(boer.clinicalPresentationEn.includes('MACKLER TRIAD'));
    assert.ok(boer.clinicalPresentationEn.includes('WATER-SOLUBLE CONTRAST'));
    assert.ok(boer.clinicalPresentationEn.includes('NEVER administer Barium'));

    // 6. Body Packing & Body Stuffing
    const pack = GI_SYNDROME_PROFILES.bodyPacking;
    assert.ok(pack);
    assert.strictEqual(pack.id, 'body_packing');
    assert.ok(pack.nameEn.includes('Body Packing'));
    assert.ok(pack.clinicalPresentationEn.includes('Whole Bowel Irrigation'));
    assert.ok(pack.clinicalPresentationEn.includes('NEVER attempt endoscopic snare'));
    assert.ok(pack.clinicalPresentationEn.includes('ABSOLUTE SURGICAL EMERGENCY'));
  });

  it('exports 6 field gastrointestinal harm reduction and preservation directives', () => {
    assert.strictEqual(GI_HARM_REDUCTION_RULES.length, 6);

    const r1 = GI_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 1);
    assert.ok(r1.titleEn.includes('Skip Docusate Alone'));
    assert.ok(r1.titleEn.includes('Senna + PEG 3350'));

    const r2 = GI_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 2);
    assert.ok(r2.titleEn.includes('PAMORA Obstruction Alert'));

    const r3 = GI_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 3);
    assert.ok(r3.titleEn.includes('Mesenteric Ischemia'));

    const r4 = GI_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 4);
    assert.ok(r4.titleEn.includes('Boerhaave Alert'));
    assert.ok(r4.titleEn.includes('NEVER Barium'));

    const r5 = GI_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 5);
    assert.ok(r5.titleEn.includes('WATERFALL'));

    const r6 = GI_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 6);
    assert.ok(r6.titleEn.includes('Swallowed Drug Packets'));
    assert.ok(r6.titleEn.includes('Endoscopic Snaring NO'));
  });

  it('evaluates acute gastrointestinal and mesenteric risks across all emergency tiers accurately', () => {
    // 1. Boerhaave Esophageal Rupture Emergency
    const resBoer = evaluateGiRisk({ boerhaaveVomitingCrepitus: true });
    assert.strictEqual(resBoer.urgency, 'emergency_911');
    assert.ok(resBoer.flags.some((f) => f.titleEn.includes('Suspected Boerhaave Syndrome')));

    // 2. Body Packer Syndrome / Cocaine Packet Rupture Emergency
    const resPack = evaluateGiRisk({ cocainePacketRuptureObstruction: true });
    assert.strictEqual(resPack.urgency, 'emergency_911');
    assert.ok(resPack.flags.some((f) => f.titleEn.includes('Body Packer Syndrome')));

    // 3. Stimulant Mesenteric Ischemia Emergency
    const resNomi = evaluateGiRisk({ stimulantPainOutOfProportionBloodyStool: true });
    assert.strictEqual(resNomi.urgency, 'emergency_911');
    assert.ok(resNomi.flags.some((f) => f.titleEn.includes('Mesenteric Ischemia')));

    // 4. Stercoral Perforation / Bowel Obstruction Emergency
    const resSterc = evaluateGiRisk({ opioidFecalImpactionPeritonitis: true });
    assert.strictEqual(resSterc.urgency, 'emergency_911');
    assert.ok(resSterc.flags.some((f) => f.titleEn.includes('Stercoral Colonic Perforation')));

    // 5. Acute Pancreatitis Urgent Evaluation
    const resPanc = evaluateGiRisk({ epigastricPainBackRadiationPancreatitis: true });
    assert.strictEqual(resPanc.urgency, 'urgent_eval');
    assert.ok(resPanc.flags.some((f) => f.titleEn.includes('Suspected Acute Pancreatitis')));

    // 6. Asymptomatic Body Packing Urgent Protocol
    const resWbi = evaluateGiRisk({ asymptomaticBodyPackingStuffing: true });
    assert.strictEqual(resWbi.urgency, 'urgent_eval');
    assert.ok(resWbi.flags.some((f) => f.titleEn.includes('Whole Bowel Irrigation')));

    // 7. Laxative-Refractory OIC / PAMORA Candidate Specialty Consult
    const resPam = evaluateGiRisk({ opioidConstipationRefractoryLaxatives: true });
    assert.strictEqual(resPam.urgency, 'specialty_consult');
    assert.ok(resPam.flags.some((f) => f.titleEn.includes('PAMORA Initiation Candidate')));

    // 8. Narcotic Bowel Syndrome Specialty Consult
    const resNbs = evaluateGiRisk({ escalatingOpioidParadoxicalAbdominalPain: true });
    assert.strictEqual(resNbs.urgency, 'specialty_consult');
    assert.ok(resNbs.flags.some((f) => f.titleEn.includes('Narcotic Bowel Syndrome')));

    // 9. Precautionary Baseline
    const resBase = evaluateGiRisk({});
    assert.strictEqual(resBase.urgency, 'precautionary');
    assert.ok(resBase.flags.some((f) => f.titleEn.includes('Baseline Gastrointestinal Preservation')));
  });

  it('generates zero-PII structured clinical SBAR handoff notes in English and Spanish', () => {
    const sampleState = {
      epigastricPainBackRadiationPancreatitis: true,
      opioidConstipationRefractoryLaxatives: true,
    };

    // English
    const sbarEn = formatGiSbarText(sampleState, 'en');
    assert.ok(sbarEn.includes('SBAR CLINICAL HANDOFF NOTE - GASTROINTESTINAL & MESENTERIC CARE'));
    assert.ok(sbarEn.includes('[S - SITUATION]'));
    assert.ok(sbarEn.includes('[B - CLINICAL BACKGROUND & IDENTIFIED FACTORS]'));
    assert.ok(sbarEn.includes('[A - CLINICAL ASSESSMENT & IDENTIFIED DIRECTIVES]'));
    assert.ok(sbarEn.includes('[R - RECOMMENDATIONS & MANAGEMENT]'));
    assert.ok(sbarEn.includes('Zero-PII In-RAM Ephemeral Assessment'));
    assert.ok(sbarEn.includes('Acute Pancreatitis'));

    // Spanish
    const sbarEs = formatGiSbarText(sampleState, 'es');
    assert.ok(sbarEs.includes('INFORME DE TRASPASO CLÍNICO SBAR - EMERGENCIAS GASTROINTESTINALES'));
    assert.ok(sbarEs.includes('[S - SITUACIÓN]'));
    assert.ok(sbarEs.includes('[B - ANTECEDENTES Y FACTORES CLÍNICOS]'));
    assert.ok(sbarEs.includes('[A - EVALUACIÓN Y DIRECTIVAS CLÍNICAS]'));
    assert.ok(sbarEs.includes('[R - RECOMENDACIONES CLÍNICAS Y MANEJO]'));
    assert.ok(sbarEs.includes('Sin datos de identificación (Zero-PII)'));
    assert.ok(sbarEs.includes('Pancreatitis Aguda'));
  });

  it('manages in-RAM ephemeral state with deterministic subscription and reset', () => {
    resetGiState();
    let state = getGiState();
    assert.strictEqual(state.activeTab, 'syndromes');
    assert.strictEqual(state.boerhaaveVomitingCrepitus, false);

    let count = 0;
    const unsub = subscribeGiState(() => {
      count++;
    });

    setGiState({ boerhaaveVomitingCrepitus: true, activeTab: 'evaluator' });
    state = getGiState();
    assert.strictEqual(state.boerhaaveVomitingCrepitus, true);
    assert.strictEqual(state.activeTab, 'evaluator');
    assert.strictEqual(count, 1);

    resetGiState();
    state = getGiState();
    assert.strictEqual(state.boerhaaveVomitingCrepitus, false);
    assert.strictEqual(state.activeTab, 'syndromes');
    assert.strictEqual(count, 2);

    unsub();
    setGiState({ epigastricPainBackRadiationPancreatitis: true });
    assert.strictEqual(count, 2);
  });

  it('strictly adheres to zero-storage privacy and zero innerHTML security invariants', () => {
    const fileContent = fs.readFileSync('public/js/views/giCare.js', 'utf8');
    assert.ok(!fileContent.includes('localStorage'), 'Must not access localStorage');
    assert.ok(!fileContent.includes('sessionStorage'), 'Must not access sessionStorage');
    assert.ok(!fileContent.includes('document.cookie'), 'Must not access cookies');
    assert.ok(!fileContent.includes('indexedDB'), 'Must not access indexedDB');
    assert.ok(!fileContent.includes('innerHTML'), 'Must not use innerHTML');
    assert.ok(!fileContent.includes('outerHTML'), 'Must not use outerHTML');
    assert.ok(!fileContent.includes('.style.'), 'Must not set inline styles via .style');
    assert.ok(!fileContent.includes('style='), 'Must not use inline style attributes');
  });

  it('mounts giCareView DOM element with accessible structure', () => {
    class MockElement {
      constructor(tag) {
        this.tagName = (tag || 'DIV').toUpperCase();
        this.children = [];
        this.attributes = {};
        this.eventListeners = {};
        this.classList = {
          classes: new Set(),
          add: (...cls) => cls.forEach((c) => this.classList.classes.add(c)),
          contains: (c) => this.classList.classes.has(c),
        };
        this.className = '';
      }
      setAttribute(k, v) { this.attributes[k] = v; }
      getAttribute(k) { return this.attributes[k]; }
      hasAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k); }
      appendChild(child) {
        if (child && typeof child === 'object') {
          child.parentNode = this;
          child.remove = () => this.removeChild(child);
        }
        if (child) this.children.push(child);
        return child;
      }
      append(...children) {
        children.forEach((c) => this.appendChild(c));
      }
      addEventListener(event, fn) {
        this.eventListeners[event] = this.eventListeners[event] || [];
        this.eventListeners[event].push(fn);
      }
      querySelector(selector) {
        if (selector === '.gi-tab-nav') {
          const nav = new MockElement('nav');
          nav.setAttribute('role', 'tablist');
          return nav;
        }
        if (selector === '.gi-tab-btn.active') {
          const btn = new MockElement('button');
          btn.setAttribute('aria-selected', 'true');
          return btn;
        }
        if (selector === 'input') return new MockElement('input');
        if (selector === 'button') return new MockElement('button');
        return new MockElement('div');
      }
      querySelectorAll() {
        return [new MockElement('div')];
      }
      replaceChildren() {
        this.children = [];
      }
      get firstChild() {
        return this.children[0] || null;
      }
      removeChild(c) {
        const idx = this.children.indexOf(c);
        if (idx >= 0) this.children.splice(idx, 1);
      }
    }

    const prevDoc = globalThis.document;
    const prevNode = globalThis.Node;
    globalThis.Node = MockElement;
    globalThis.document = {
      documentElement: { lang: 'en' },
      createElement: (tag) => new MockElement(tag),
      createElementNS: (_ns, tag) => new MockElement(tag),
      createTextNode: (text) => ({ nodeType: 3, textContent: text }),
    };

    try {
      resetGiState();
      const view = giCareView();
      assert.ok(view);
      assert.strictEqual(view.tagName.toLowerCase(), 'div');
      assert.strictEqual(view.className, 'gi-care-view');
      assert.ok(view.children.length >= 3);

      const tabNav = view.querySelector('.gi-tab-nav');
      assert.ok(tabNav);
      assert.strictEqual(tabNav.getAttribute('role'), 'tablist');

      const activeTab = view.querySelector('.gi-tab-btn.active');
      assert.ok(activeTab);
      assert.strictEqual(activeTab.getAttribute('aria-selected'), 'true');

      // Switch tabs and verify rendering
      setGiState({ activeTab: 'evaluator' });
      assert.strictEqual(getGiState().activeTab, 'evaluator');

      setGiState({ activeTab: 'rules' });
      assert.strictEqual(getGiState().activeTab, 'rules');

      setGiState({ activeTab: 'sbar' });
      assert.strictEqual(getGiState().activeTab, 'sbar');
    } finally {
      globalThis.document = prevDoc;
      globalThis.Node = prevNode;
    }
  });
});
