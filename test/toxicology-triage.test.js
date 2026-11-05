// test/toxicology-triage.test.js
// HarborPath - Wave 28 Acute Toxicology Triage, Project BETA & SBAR Decision Support Tests

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

describe('Acute Toxicology Triage & Project BETA De-Escalation Module (Wave 28)', () => {
  let toxModule;

  before(async () => {
    toxModule = await import('../public/js/views/toxicologyTriage.js');
  });

  beforeEach(() => {
    globalThis.document.documentElement.lang = 'en';
    toxModule.resetToxicologyTriageState();
  });

  test('TOXICOLOGY_CONDITIONS exports all 5 core differential emergencies with bilingual taxonomy', () => {
    const { TOXICOLOGY_CONDITIONS } = toxModule;
    assert.ok(TOXICOLOGY_CONDITIONS);
    const keys = Object.keys(TOXICOLOGY_CONDITIONS);
    assert.strictEqual(keys.length, 5);
    assert.deepStrictEqual(keys, [
      'opioid_xylazine',
      'stimulant_overamp',
      'serotonin_syndrome',
      'soft_tissue_sepsis',
      'substance_agitation'
    ]);

    keys.forEach((k) => {
      const cond = TOXICOLOGY_CONDITIONS[k];
      assert.ok(cond.id);
      assert.ok(cond.nameEn && cond.nameEs);
      assert.ok(cond.categoryEn && cond.categoryEs);
      assert.ok(cond.mechanismEn && cond.mechanismEs);
      assert.ok(Array.isArray(cond.keySignsEn) && cond.keySignsEn.length >= 2);
      assert.ok(Array.isArray(cond.keySignsEs) && cond.keySignsEs.length >= 2);
      assert.ok(cond.immediateActionEn && cond.immediateActionEs);
      assert.ok(['EMERGENCY_911', 'URGENT_EVAL', 'DE_ESCALATION'].includes(cond.severityTier));
    });
  });

  test('RASS_SCALE defines all 10 agitation and sedation tiers from +4 to -5', () => {
    const { RASS_SCALE } = toxModule;
    assert.ok(Array.isArray(RASS_SCALE));
    assert.strictEqual(RASS_SCALE.length, 10);

    const scores = RASS_SCALE.map((r) => r.score);
    assert.deepStrictEqual(scores, [4, 3, 2, 1, 0, -1, -2, -3, -4, -5]);

    RASS_SCALE.forEach((r) => {
      assert.ok(typeof r.score === 'number');
      assert.ok(r.termEn && r.termEs);
      assert.ok(r.descEn && r.descEs);
      assert.ok(r.tier);
    });
  });

  test('PROJECT_BETA_DOMAINS exports all 10 consensus verbal de-escalation domains with DO and AVOID scripts', () => {
    const { PROJECT_BETA_DOMAINS } = toxModule;
    assert.ok(Array.isArray(PROJECT_BETA_DOMAINS));
    assert.strictEqual(PROJECT_BETA_DOMAINS.length, 10);

    PROJECT_BETA_DOMAINS.forEach((d, i) => {
      assert.strictEqual(d.domain, i + 1);
      assert.ok(d.titleEn && d.titleEs);
      assert.ok(d.rationaleEn && d.rationaleEs);
      assert.ok(d.doScriptEn && d.doScriptEs);
      assert.ok(d.dontScriptEn && d.dontScriptEs);
    });

    // Check specific domains
    assert.ok(PROJECT_BETA_DOMAINS[0].titleEn.includes('Personal Space'));
    assert.ok(PROJECT_BETA_DOMAINS[1].titleEn.includes('Provocative'));
    assert.ok(PROJECT_BETA_DOMAINS[2].titleEn.includes('Single Speaker'));
    assert.ok(PROJECT_BETA_DOMAINS[8].titleEn.includes('Offer Choices'));
  });

  test('CALMING_PHARMACOTHERAPY_TIERS enforces non-coercive restraint avoidance and provides 3 tiers', () => {
    const { CALMING_PHARMACOTHERAPY_TIERS } = toxModule;
    assert.ok(CALMING_PHARMACOTHERAPY_TIERS);

    // Restraint avoidance mandate
    const mandate = CALMING_PHARMACOTHERAPY_TIERS.restraintMandate;
    assert.ok(mandate.titleEn && mandate.titleEs);
    assert.ok(mandate.guidelineEn.includes('Physical restraints are strictly contraindicated'));
    assert.ok(mandate.guidelineEs.includes('contenciones físicas están estrictamente contraindicadas'));

    // Tier 1: Oral SGAs
    const t1 = CALMING_PHARMACOTHERAPY_TIERS.tier1OralSGA;
    assert.ok(t1.nameEn && t1.nameEs);
    assert.strictEqual(t1.options.length, 3);
    assert.ok(t1.options.some((o) => o.nameEn.includes('Olanzapine')));
    assert.ok(t1.options.some((o) => o.nameEn.includes('Risperidone')));
    assert.ok(t1.options.some((o) => o.nameEn.includes('Quetiapine')));

    // Tier 2: Oral Benzos
    const t2 = CALMING_PHARMACOTHERAPY_TIERS.tier2OralBenzo;
    assert.ok(t2.options.some((o) => o.nameEn.includes('Lorazepam')));

    // Tier 3: Emergency Parenteral (Last resort)
    const t3 = CALMING_PHARMACOTHERAPY_TIERS.tier3EmergencyParenteral;
    assert.ok(t3.options.some((o) => o.nameEn.includes('B52')));
    assert.ok(t3.options.some((o) => o.nameEn.includes('Ketamine')));
  });

  test('TRIAGE_SYMPTOMS provides 30 vetted clinical indicators with category weights and red flags', () => {
    const { TRIAGE_SYMPTOMS } = toxModule;
    assert.ok(Array.isArray(TRIAGE_SYMPTOMS));
    assert.strictEqual(TRIAGE_SYMPTOMS.length, 30);

    const redFlags = TRIAGE_SYMPTOMS.filter((s) => s.redFlag);
    assert.ok(redFlags.length >= 10);

    TRIAGE_SYMPTOMS.forEach((s) => {
      assert.ok(s.id);
      assert.ok(s.category);
      assert.ok(s.labelEn && s.labelEs);
      assert.ok(s.weights);
      assert.ok(typeof s.weights.opioid_xylazine === 'number');
      assert.ok(typeof s.weights.stimulant_overamp === 'number');
      assert.ok(typeof s.weights.serotonin_syndrome === 'number');
      assert.ok(typeof s.weights.soft_tissue_sepsis === 'number');
      assert.ok(typeof s.weights.substance_agitation === 'number');
    });
  });

  test('checkHunterSerotoninCriteria evaluates all 5 diagnostic rules accurately', () => {
    const { checkHunterSerotoninCriteria } = toxModule;

    // Rule 1: Spontaneous clonus alone
    const r1 = checkHunterSerotoninCriteria(['clonus_spontaneous']);
    assert.strictEqual(r1.meetsCriteria, true);
    assert.ok(r1.ruleEn.includes('Spontaneous clonus'));

    // Rule 2: Inducible clonus + agitation
    const r2 = checkHunterSerotoninCriteria(['clonus_inducible', 'psychomotor_agitation']);
    assert.strictEqual(r2.meetsCriteria, true);
    assert.ok(r2.ruleEn.includes('Inducible clonus'));

    // Rule 3: Ocular clonus + diaphoresis
    const r3 = checkHunterSerotoninCriteria(['clonus_ocular', 'drenching_sweat']);
    assert.strictEqual(r3.meetsCriteria, true);
    assert.ok(r3.ruleEn.includes('Ocular clonus'));

    // Rule 4: Tremor + hyperreflexia
    const r4 = checkHunterSerotoninCriteria(['hyperreflexia_tremor']);
    assert.strictEqual(r4.meetsCriteria, true);
    assert.ok(r4.ruleEn.includes('hyperreflexia'));

    // Rule 5: Hyperthermia + inducible clonus
    const r5 = checkHunterSerotoninCriteria(['hyperthermia_high', 'clonus_inducible']);
    assert.strictEqual(r5.meetsCriteria, true);
    assert.ok(r5.ruleEn.includes('Hyperthermia'));

    // Negative case: Isolated panic/hallucinations without clonus
    const rNeg = checkHunterSerotoninCriteria(['severe_paranoia_delusions', 'hallucinations_auditory_visual']);
    assert.strictEqual(rNeg.meetsCriteria, false);
  });

  test('evaluateToxicologyTriage accurately stratifies emergency presets and differentials', () => {
    const { evaluateToxicologyTriage, TOXICOLOGY_PRESETS } = toxModule;

    // Preset 1: Suspected Tranq/Opioid Overdose
    const p1 = TOXICOLOGY_PRESETS.find((p) => p.id === 'tranq_opioid');
    const res1 = evaluateToxicologyTriage({ selectedSymptoms: p1.symptoms, rassScore: p1.rassScore });
    assert.strictEqual(res1.primaryCondition.id, 'opioid_xylazine');
    assert.strictEqual(res1.severityLevel, 'EMERGENCY_911');
    assert.strictEqual(res1.agitationUrgency, 'SEVERE_CNS_DEPRESSION');
    assert.ok(res1.activeRedFlags.length >= 3);

    // Preset 2: Stimulant Malignant Hyperthermia
    const p2 = TOXICOLOGY_PRESETS.find((p) => p.id === 'stimulant_hyperthermia');
    const res2 = evaluateToxicologyTriage({ selectedSymptoms: p2.symptoms, rassScore: p2.rassScore });
    assert.strictEqual(res2.primaryCondition.id, 'stimulant_overamp');
    assert.strictEqual(res2.severityLevel, 'EMERGENCY_911');
    assert.strictEqual(res2.agitationUrgency, 'CRITICAL_DEESCALATION');

    // Preset 3: Serotonin Syndrome
    const p3 = TOXICOLOGY_PRESETS.find((p) => p.id === 'serotonin_storm');
    const res3 = evaluateToxicologyTriage({ selectedSymptoms: p3.symptoms, rassScore: p3.rassScore });
    assert.strictEqual(res3.primaryCondition.id, 'serotonin_syndrome');
    assert.strictEqual(res3.hunterResult.meetsCriteria, true);
    assert.strictEqual(res3.severityLevel, 'EMERGENCY_911');

    // Preset 4: Necrotizing Sepsis
    const p4 = TOXICOLOGY_PRESETS.find((p) => p.id === 'necrotizing_sepsis');
    const res4 = evaluateToxicologyTriage({ selectedSymptoms: p4.symptoms, rassScore: p4.rassScore });
    assert.strictEqual(res4.primaryCondition.id, 'soft_tissue_sepsis');
    assert.ok(res4.activeRedFlags.some((rf) => rf.id === 'pain_disproportion'));

    // Preset 5: Agitated Psychosis
    const p5 = TOXICOLOGY_PRESETS.find((p) => p.id === 'agitated_psychosis');
    const res5 = evaluateToxicologyTriage({ selectedSymptoms: p5.symptoms, rassScore: p5.rassScore });
    assert.strictEqual(res5.primaryCondition.id, 'substance_agitation');
    assert.strictEqual(res5.agitationUrgency, 'CRITICAL_DEESCALATION');
  });

  test('formatSbarClinicalHandoff outputs bilingual clinical notes with Zero PII', () => {
    const { formatSbarClinicalHandoff, TOXICOLOGY_PRESETS } = toxModule;
    const preset = TOXICOLOGY_PRESETS[0];
    const state = { selectedSymptoms: preset.symptoms, rassScore: preset.rassScore };

    // English SBAR
    const sbarEn = formatSbarClinicalHandoff(state, false);
    assert.ok(sbarEn.includes('SBAR CLINICAL HANDOFF NOTE'));
    assert.ok(sbarEn.includes('[S - SITUATION'));
    assert.ok(sbarEn.includes('[B - BACKGROUND'));
    assert.ok(sbarEn.includes('[A - ASSESSMENT'));
    assert.ok(sbarEn.includes('[R - RECOMMENDATIONS'));
    assert.ok(sbarEn.includes('EMTALA (42 U.S.C. § 1395dd)'));
    assert.ok(sbarEn.includes('PHYSICAL RESTRAINTS: STRICTLY CONTRAINDICATED'));

    // Spanish SBAR
    const sbarEs = formatSbarClinicalHandoff(state, true);
    assert.ok(sbarEs.includes('RESUMEN CLÍNICO SBAR'));
    assert.ok(sbarEs.includes('[S - SITUATION / SITUACIÓN CLÍNICA INMEDIATA]'));
    assert.ok(sbarEs.includes('[B - BACKGROUND / ANTECEDENTES Y EXPOSICIÓN]'));
    assert.ok(sbarEs.includes('[A - ASSESSMENT / EVALUACIÓN DEL DIFERENCIAL TOXICOLÓGICO]'));
    assert.ok(sbarEs.includes('[R - RECOMMENDATIONS / RECOMENDACIONES CLÍNICAS Y MANEJO]'));
    assert.ok(sbarEs.includes('EMTALA (42 U.S.C. § 1395dd)'));
    assert.ok(sbarEs.includes('CONTENCIÓN FÍSICA: ESTRICTAMENTE CONTRAINDICADA'));

    // Zero PII audit on output
    [sbarEn, sbarEs].forEach((txt) => {
      assert.strictEqual(txt.includes('name:'), false);
      assert.strictEqual(txt.includes('ssn:'), false);
      assert.strictEqual(txt.includes('dob:'), false);
    });
  });

  test('formatBystander911DispatchScript generates calm, low-conflict 911 dispatch scripts', () => {
    const { formatBystander911DispatchScript, TOXICOLOGY_PRESETS } = toxModule;
    const preset = TOXICOLOGY_PRESETS[1];
    const state = { selectedSymptoms: preset.symptoms, rassScore: preset.rassScore };

    // English
    const scriptEn = formatBystander911DispatchScript(state, false);
    assert.ok(scriptEn.includes('911 DISPATCH SCRIPT FOR BYSTANDERS'));
    assert.ok(scriptEn.includes('Crisis Intervention Team (CIT)'));
    assert.ok(scriptEn.includes('The person is NOT armed and is NOT hurting anyone'));

    // Spanish
    const scriptEs = formatBystander911DispatchScript(state, true);
    assert.ok(scriptEs.includes('GUION PARA LLAMADA AL 911'));
    assert.ok(scriptEs.includes('equipo de respuesta a crisis de salud mental (CIT / Crisis Team)'));
    assert.ok(scriptEs.includes('La persona NO está armada y NO está atacando a nadie'));
  });

  test('In-RAM state management updates and resets deterministically without storage leakage', () => {
    const { getToxicologyTriageState, setToxicologyTriageState, resetToxicologyTriageState } = toxModule;

    const initial = getToxicologyTriageState();
    assert.strictEqual(initial.mode, 'clinician');
    assert.strictEqual(initial.selectedSymptoms.length, 0);

    setToxicologyTriageState({
      mode: 'bystander',
      activeTab: 'deescalation',
      selectedSymptoms: ['resp_slow', 'cyanosis'],
      rassScore: -4
    });

    const updated = getToxicologyTriageState();
    assert.strictEqual(updated.mode, 'bystander');
    assert.strictEqual(updated.activeTab, 'deescalation');
    assert.strictEqual(updated.selectedSymptoms.length, 2);
    assert.strictEqual(updated.rassScore, -4);

    resetToxicologyTriageState();
    const reset = getToxicologyTriageState();
    assert.strictEqual(reset.mode, 'clinician');
    assert.strictEqual(reset.activeTab, 'differential');
    assert.strictEqual(reset.selectedSymptoms.length, 0);
    assert.strictEqual(reset.rassScore, 0);
  });

  test('toxicologyTriageView mounts semantic, accessible DOM across tabs and modes', () => {
    const { toxicologyTriageView, setToxicologyTriageState } = toxModule;

    // Default Clinician View
    const view = toxicologyTriageView();
    assert.ok(view);
    assert.strictEqual(view.tagName, 'DIV');
    assert.ok(view.classList.contains('toxicology-triage-view'));

    const h1 = view.querySelector('h1');
    assert.ok(h1);
    assert.ok(h1.textContent.includes('Toxicology Triage') || h1.textContent.includes('Triage Toxicológico'));

    // Switch to Bystander Mode
    setToxicologyTriageState({ mode: 'bystander' });
    const bystanderLead = view.querySelector('.lead');
    assert.ok(bystanderLead);
    assert.ok(bystanderLead.textContent.includes('friends, family, and bystanders') || bystanderLead.textContent.includes('familiares, amigos y acompañantes'));

    // Switch to Tab 2: Project BETA De-Escalation
    setToxicologyTriageState({ activeTab: 'deescalation' });
    const betaGrid = view.querySelector('.beta-domains-grid');
    assert.ok(betaGrid);
    const domainCards = betaGrid.querySelectorAll('.beta-domain-card');
    assert.strictEqual(domainCards.length, 10);

    // Switch to Tab 3: Pharmacotherapy Matrix
    setToxicologyTriageState({ activeTab: 'pharmacotherapy' });
    const pharmaLists = view.querySelectorAll('.pharma-options-list');
    assert.ok(pharmaLists.length >= 2);

    // Switch to Tab 4: Handoff / Dispatch
    setToxicologyTriageState({ activeTab: 'handoff', mode: 'clinician' });
    const sbarPre = view.querySelector('.sbar-preview-box');
    assert.ok(sbarPre);
    assert.ok(sbarPre.textContent.includes('SBAR'));
  });

  test('Static audit: zero localStorage, sessionStorage, cookie, innerHTML, or style= writes', () => {
    const filePath = path.resolve('public/js/views/toxicologyTriage.js');
    const content = fs.readFileSync(filePath, 'utf8');

    assert.strictEqual(content.includes('localStorage'), false);
    assert.strictEqual(content.includes('sessionStorage'), false);
    assert.strictEqual(content.includes('document.cookie'), false);
    assert.strictEqual(content.includes('innerHTML'), false);
    assert.strictEqual(content.includes('outerHTML'), false);
    assert.strictEqual(content.includes('style='), false);
  });
});
