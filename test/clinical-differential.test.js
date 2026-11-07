import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  EMERGENCY_TIERS,
  DIFFERENTIAL_CONDITIONS,
  DIFFERENTIAL_SYMPTOMS,
  DIFFERENTIAL_PRESETS,
  SYMPTOM_CATEGORIES,
  checkHunterCriteria,
  evaluateDifferentialSymptoms,
  getDifferentialState,
  setDifferentialSymptoms,
  toggleDifferentialSymptom,
  applyDifferentialPreset,
  subscribeDifferentialState,
  resetDifferentialState,
  clinicalDifferential,
} from '../public/js/components/clinicalDifferential.js';

// Minimal in-memory Mock DOM for Node 20+ test runner
class MockClassList {
  constructor(node) {
    this.node = node;
  }
  _getClasses() {
    return (this.node.className || '').split(/\s+/).filter(Boolean);
  }
  _setClasses(classes) {
    this.node.className = classes.join(' ');
  }
  add(...tokens) {
    const list = this._getClasses();
    for (const t of tokens) {
      if (t && !list.includes(t)) list.push(t);
    }
    this._setClasses(list);
  }
  remove(...tokens) {
    const list = this._getClasses().filter((c) => !tokens.includes(c));
    this._setClasses(list);
  }
  contains(token) {
    return this._getClasses().includes(token);
  }
  toggle(token, force) {
    const exists = this.contains(token);
    const shouldAdd = force !== undefined ? Boolean(force) : !exists;
    if (shouldAdd) this.add(token);
    else this.remove(token);
    return shouldAdd;
  }
}

class MockNode {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.className = '';
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.children = [];
    this.value = '';
    this.id = '';
    this.type = '';
    this.name = '';
    this.checked = false;
    this._textContent = '';
    this.classList = new MockClassList(this);
    this.parent = null;
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(v) {
    this._textContent = String(v ?? '');
    this.children = [];
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  setAttribute(k, v) {
    if (k === 'style') {
      throw new Error('Inline styles are blocked by CSP; use a class');
    }
    const val = String(v);
    this.attributes[k] = val;
    if (k === 'class') this.className = val;
    if (k === 'id') this.id = val;
    if (k === 'type') this.type = val;
    if (k === 'name') this.name = val;
    if (k === 'value') this.value = val;
    if (k === 'checked') this.checked = true;
  }

  getAttribute(k) {
    if (k === 'class') return this.className || this.attributes.class || null;
    if (k === 'id') return this.id || this.attributes.id || null;
    if (k === 'type') return this.type || this.attributes.type || null;
    if (k === 'name') return this.name || this.attributes.name || null;
    if (k === 'value') return this.value || this.attributes.value || null;
    return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null;
  }

  hasAttribute(k) {
    if (k === 'class') return Boolean(this.className || this.attributes.class);
    if (k === 'id') return Boolean(this.id || this.attributes.id);
    return Object.hasOwn(this.attributes, k);
  }

  removeAttribute(k) {
    delete this.attributes[k];
    if (k === 'checked') this.checked = false;
  }

  addEventListener(evt, fn) {
    this.listeners[evt] = fn;
  }

  removeEventListener(evt) {
    delete this.listeners[evt];
  }

  dispatchEvent(evt) {
    const name = typeof evt === 'string' ? evt : evt?.type;
    const fn = this.listeners[name];
    if (typeof fn === 'function') {
      fn({ target: this, currentTarget: this, ...evt });
    }
  }

  click() {
    this.dispatchEvent({ type: 'click' });
  }

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string') {
        const textNode = new MockNode('#text');
        textNode._textContent = item;
        textNode.parent = this;
        this.children.push(textNode);
      } else if (item instanceof MockNode) {
        item.parent = this;
        this.children.push(item);
      }
    }
  }

  appendChild(item) {
    this.append(item);
    return item;
  }

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx >= 0) this.parent.children.splice(idx, 1);
  }

  replaceChildren(...items) {
    this.children = [];
    this._textContent = '';
    this.append(...items);
  }

  findAll(pred, acc = []) {
    if (pred(this)) acc.push(this);
    for (const ch of this.children) {
      if (ch instanceof MockNode) ch.findAll(pred, acc);
    }
    return acc;
  }

  querySelector(selector) {
    const results = this.querySelectorAll(selector);
    return results[0] ?? null;
  }

  querySelectorAll(selector) {
    const list = [];
    const isId = selector.startsWith('#');
    const isClass = selector.startsWith('.');
    const isTag = /^[a-zA-Z0-9_-]+$/.test(selector);

    this.findAll((node) => {
      if (node === this) return false;
      if (isId && node.id === selector.slice(1)) return true;
      if (isClass && node.classList.contains(selector.slice(1))) return true;
      if (isTag && node.tagName === selector.toUpperCase()) return true;
      if (selector.includes('[role=') && selector.includes(']')) {
        const match = selector.match(/\[role=["']?([^"'\]]+)["']?\]/);
        if (match && node.getAttribute('role') === match[1]) return true;
      }
      if (selector.includes('[type=') && selector.includes(']')) {
        const match = selector.match(/\[type=["']?([^"'\]]+)["']?\]/);
        if (match && (node.type === match[1] || node.getAttribute('type') === match[1])) return true;
      }
      return false;
    }, list);

    return list;
  }
}

function withMockDom(fn) {
  const prevDoc = globalThis.document;
  const prevWin = globalThis.window;
  const prevNode = globalThis.Node;

  const body = new MockNode('body');
  const docElement = new MockNode('html');
  const announcer = new MockNode('div');
  announcer.setAttribute('id', 'announcer');
  body.append(announcer);

  const doc = {
    body,
    documentElement: docElement,
    activeElement: body,
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: (id) => (id === 'announcer' ? announcer : body.querySelector(`#${id}`)),
  };

  const win = {
    matchMedia: (query) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  };

  globalThis.Node = MockNode;
  globalThis.document = doc;
  globalThis.window = win;

  const restore = () => {
    globalThis.Node = prevNode;
    globalThis.document = prevDoc;
    globalThis.window = prevWin;
  };

  try {
    return fn({ doc, body, announcer, restore });
  } finally {
    restore();
  }
}

describe('Toxicology & Clinical Differential Assistant (clinicalDifferential.js)', () => {
  describe('1. DIFFERENTIAL_CONDITIONS & Pharmacological Constants', () => {
    it('defines all 4 core clinical conditions with rich pharmacological schemas', () => {
      const keys = Object.keys(DIFFERENTIAL_CONDITIONS);
      assert.ok(keys.includes('opioid_xylazine'), 'Must include opioid_xylazine');
      assert.ok(keys.includes('stimulant_overamp'), 'Must include stimulant_overamp');
      assert.ok(keys.includes('serotonin_syndrome'), 'Must include serotonin_syndrome');
      assert.ok(keys.includes('soft_tissue_sepsis'), 'Must include soft_tissue_sepsis');
      assert.equal(keys.length, 4, 'Exactly 4 core differential conditions');
    });

    it('supports iterable iteration (for...of and Array.from)', () => {
      const conditionList = Array.from(DIFFERENTIAL_CONDITIONS);
      assert.equal(conditionList.length, 4);

      const ids = [];
      for (const cond of DIFFERENTIAL_CONDITIONS) {
        ids.push(cond.id);
        assert.ok(cond.name, 'Condition must have a name');
        assert.ok(Array.isArray(cond.keySigns), 'Condition must have keySigns array');
        assert.ok(cond.mechanism, 'Condition must have mechanism text');
        assert.ok(Array.isArray(cond.protocol), 'Condition must have protocol array');
        assert.ok(cond.clinicalNotes, 'Condition must have clinicalNotes text');
        assert.ok(Array.isArray(cond.symptoms), 'Condition must specify associated symptoms');
      }
      assert.deepEqual(ids, ['opioid_xylazine', 'stimulant_overamp', 'serotonin_syndrome', 'soft_tissue_sepsis']);
    });

    it('contains validated clinical details for Opioid & Xylazine / Medetomidine Toxicity', () => {
      const cond = DIFFERENTIAL_CONDITIONS.opioid_xylazine;
      assert.equal(cond.category, 'opioid_sedative');
      assert.equal(cond.emergencyTier, EMERGENCY_TIERS.EMERGENCY_911);

      // Must explicitly note that Naloxone will NOT reverse alpha-2 adrenergic effects of xylazine/medetomidine
      const protocolText = cond.protocol.join(' ');
      assert.match(protocolText, /naloxone/i);
      assert.match(protocolText, /rescue breathing/i);
      assert.match(protocolText, /alpha-2/i);
      assert.match(cond.clinicalNotes, /xylazine|medetomidine/i);
      assert.match(cond.clinicalNotes, /rescue breathing/i);
    });

    it('contains validated clinical details for Stimulant Overamping (Physical vs Psychological)', () => {
      const cond = DIFFERENTIAL_CONDITIONS.stimulant_overamp;
      assert.equal(cond.category, 'stimulant');
      assert.match(cond.name, /physical vs psychological/i);

      // Key signs must distinguish physical from psychological
      const signs = cond.keySigns.join(' ');
      assert.match(signs, /hyperthermia/i);
      assert.match(signs, /chest pain/i);
      assert.match(signs, /rhabdomyolysis/i);
      assert.match(signs, /paranoia/i);

      // Protocol must detail physical cooling and psychological de-escalation
      const protocolText = cond.protocol.join(' ');
      assert.match(protocolText, /physical cooling/i);
      assert.match(protocolText, /ice packs/i);
      assert.match(protocolText, /avoid physical restraints/i);
      assert.match(protocolText, /box-breathing/i);
      assert.match(protocolText, /low-stimulation/i);
    });

    it('contains validated clinical details for Serotonin Toxicity (Hunter Criteria)', () => {
      const cond = DIFFERENTIAL_CONDITIONS.serotonin_syndrome;
      assert.equal(cond.category, 'serotonergic');
      assert.match(cond.name, /hunter/i);

      // Clonus must be emphasized as the hallmark diagnostic sign
      const signs = cond.keySigns.join(' ');
      assert.match(signs, /clonus/i);
      assert.match(signs, /hallmark/i);
      assert.match(cond.clinicalNotes, /clonus/i);
      assert.match(cond.mechanism, /5-HT|serotonin/i);
      assert.match(cond.mechanism, /SSRI|SNRI|MAOI|MDMA|tramadol/i);
    });

    it('contains validated clinical details for Soft Tissue Sepsis & Necrosis', () => {
      const cond = DIFFERENTIAL_CONDITIONS.soft_tissue_sepsis;
      assert.equal(cond.category, 'infectious_vascular');

      const signs = cond.keySigns.join(' ');
      assert.match(signs, /necrotic|black/i);
      assert.match(signs, /xylazine/i);
      assert.match(signs, /pain out of proportion/i);
      assert.match(signs, /necrotizing fasciitis/i);
      assert.match(signs, /endocarditis|murmur|splinter/i);

      // EMTALA legal rights must be referenced
      const protocolText = cond.protocol.join(' ');
      assert.match(protocolText, /EMTALA/i);
      assert.match(protocolText, /42 U\.S\.C\. § 1395dd/i);
    });

    it('exports complete DIFFERENTIAL_SYMPTOMS with categories and 911 critical flags', () => {
      const symList = Object.values(DIFFERENTIAL_SYMPTOMS);
      assert.ok(symList.length >= 25, 'Expected at least 25 clinically detailed symptoms');

      // Check critical red flags
      const criticals = symList.filter((s) => s.critical911);
      assert.ok(criticals.some((s) => s.id === 'resp_depression'));
      assert.ok(criticals.some((s) => s.id === 'cyanosis'));
      assert.ok(criticals.some((s) => s.id === 'unresponsive'));
      assert.ok(criticals.some((s) => s.id === 'hyperthermia_extreme'));
      assert.ok(criticals.some((s) => s.id === 'chest_pain'));
      assert.ok(criticals.some((s) => s.id === 'clonus_spontaneous'));
      assert.ok(criticals.some((s) => s.id === 'pain_disproportion'));
    });

    it('exports clinical scenario presets', () => {
      assert.ok(Array.isArray(DIFFERENTIAL_PRESETS));
      assert.ok(DIFFERENTIAL_PRESETS.length >= 4);

      const opioidPreset = DIFFERENTIAL_PRESETS.find((p) => p.id === 'preset_opioid_xylazine');
      assert.ok(opioidPreset);
      assert.ok(opioidPreset.symptoms.includes('resp_depression'));
      assert.ok(opioidPreset.symptoms.includes('unresponsive'));
    });
  });

  describe('2. Hunter Serotonin Toxicity Criteria Engine (checkHunterCriteria)', () => {
    it('evaluates Rule 1: Spontaneous clonus alone meets Hunter Criteria', () => {
      const res = checkHunterCriteria(['clonus_spontaneous']);
      assert.equal(res.met, true);
      assert.equal(res.rules.spontaneousClonus, true);
    });

    it('evaluates Rule 2: Inducible clonus + agitation meets Hunter Criteria', () => {
      const res = checkHunterCriteria(['clonus_inducible', 'hypervigilance_agitation']);
      assert.equal(res.met, true);
      assert.equal(res.rules.inducibleClonusWithAgitationOrDiaphoresis, true);
    });

    it('evaluates Rule 2: Inducible clonus + diaphoresis meets Hunter Criteria', () => {
      const res = checkHunterCriteria(['clonus_inducible', 'diaphoresis_shivering']);
      assert.equal(res.met, true);
      assert.equal(res.rules.inducibleClonusWithAgitationOrDiaphoresis, true);
    });

    it('evaluates Rule 3: Ocular clonus + agitation meets Hunter Criteria', () => {
      const res = checkHunterCriteria(['ocular_clonus', 'paranoia_panic']);
      assert.equal(res.met, true);
      assert.equal(res.rules.ocularClonusWithAgitationOrDiaphoresis, true);
    });

    it('evaluates Rule 3: Ocular clonus + diaphoresis meets Hunter Criteria', () => {
      const res = checkHunterCriteria(['ocular_clonus', 'diaphoresis_shivering']);
      assert.equal(res.met, true);
      assert.equal(res.rules.ocularClonusWithAgitationOrDiaphoresis, true);
    });

    it('evaluates Rule 4: Tremor PLUS hyperreflexia meets Hunter Criteria', () => {
      const res = checkHunterCriteria(['tremor_hyperreflexia']);
      assert.equal(res.met, true);
      assert.equal(res.rules.tremorPlusHyperreflexia, true);
    });

    it('evaluates Rule 5: Hyperthermia + ocular clonus meets Hunter Criteria', () => {
      const res = checkHunterCriteria(['fever_moderate', 'ocular_clonus']);
      assert.equal(res.met, true);
      assert.equal(res.rules.hyperthermiaWithClonus, true);
    });

    it('evaluates Rule 5: Hyperthermia + inducible clonus meets Hunter Criteria', () => {
      const res = checkHunterCriteria(['hyperthermia_extreme', 'clonus_inducible']);
      assert.equal(res.met, true);
      assert.equal(res.rules.hyperthermiaWithClonus, true);
    });

    it('evaluates negative when clonus/hyperreflexia rules are absent (e.g. agitation + sweating only)', () => {
      const res = checkHunterCriteria(['hypervigilance_agitation', 'diaphoresis_shivering']);
      assert.equal(res.met, false);
      assert.equal(res.rules.spontaneousClonus, false);
      assert.equal(res.rules.inducibleClonusWithAgitationOrDiaphoresis, false);
      assert.equal(res.rules.ocularClonusWithAgitationOrDiaphoresis, false);
      assert.equal(res.rules.tremorPlusHyperreflexia, false);
      assert.equal(res.rules.hyperthermiaWithClonus, false);
    });

    it('handles null, undefined, and empty array safely', () => {
      assert.equal(checkHunterCriteria(null).met, false);
      assert.equal(checkHunterCriteria(undefined).met, false);
      assert.equal(checkHunterCriteria([]).met, false);
    });
  });

  describe('3. Pure Evaluation Logic (evaluateDifferentialSymptoms)', () => {
    it('returns safe default results for empty symptom inputs', () => {
      const res = evaluateDifferentialSymptoms([]);
      assert.equal(res.symptomCount, 0);
      assert.equal(res.emergencyTier, EMERGENCY_TIERS.NONE);
      assert.equal(res.redFlags.length, 0);
      assert.equal(res.recommendedActions.length, 0);
      assert.equal(res.hunterCriteriaMet, false);
      assert.equal(res.isOpioidSedativeEmergency, false);
      assert.equal(res.isPhysicalOveramping, false);
      assert.equal(res.isPsychologicalOveramping, false);
      assert.equal(res.isSepsisEmergency, false);
      assert.equal(res.isPolySubstanceSuspected, false);
      assert.equal(res.rankedConditions.length, 4);
    });

    it('safely ignores unmapped or invalid symptom strings', () => {
      const res = evaluateDifferentialSymptoms(['invalid_xyz', null, 123, '']);
      assert.equal(res.symptomCount, 0);
      assert.equal(res.emergencyTier, EMERGENCY_TIERS.NONE);
    });

    describe('Opioid & Xylazine / Medetomidine Toxicity Evaluation', () => {
      it('evaluates respiratory depression + cyanosis + unresponsiveness as EMERGENCY_911', () => {
        const symptoms = ['resp_depression', 'cyanosis', 'unresponsive'];
        const res = evaluateDifferentialSymptoms(symptoms);

        assert.equal(res.emergencyTier, EMERGENCY_TIERS.EMERGENCY_911);
        assert.equal(res.isOpioidSedativeEmergency, true);

        // Opioid condition should be at top rank
        assert.equal(res.rankedConditions[0].id, 'opioid_xylazine');
        assert.equal(res.rankedConditions[0].isSuspected, true);
        assert.equal(res.rankedConditions[0].matchScore, 3);

        // Red flags must be recorded
        assert.ok(res.redFlags.some((f) => f.includes('Respiratory Depression')));
        assert.ok(res.redFlags.some((f) => f.includes('Cyanosis')));
        assert.ok(res.redFlags.some((f) => f.includes('Unresponsiveness')));

        // Recommended actions must include Naloxone + Rescue Breathing + 911
        assert.ok(res.recommendedActions.some((a) => a.title.includes('Call 911')));
        const naloxoneAction = res.recommendedActions.find((a) => a.title.includes('Naloxone'));
        assert.ok(naloxoneAction);
        assert.match(naloxoneAction.description, /rescue breathing/i);
        assert.match(naloxoneAction.description, /xylazine|medetomidine/i);
      });

      it('evaluates isolated pinpoint pupils and hypothermia as URGENT_EVAL when not in respiratory arrest', () => {
        const symptoms = ['pinpoint_pupils', 'hypothermia'];
        const res = evaluateDifferentialSymptoms(symptoms);

        assert.equal(res.emergencyTier, EMERGENCY_TIERS.URGENT_EVAL);
        assert.equal(res.isOpioidSedativeEmergency, false);
        const opioid = res.rankedConditions.find((c) => c.id === 'opioid_xylazine');
        assert.ok(opioid.isSuspected);
        assert.equal(opioid.emergencyTier, EMERGENCY_TIERS.URGENT_EVAL);
      });
    });

    describe('Stimulant Overamping: Physical vs Psychological Evaluation', () => {
      it('evaluates physical overamping signs (hyperthermia >104F, chest pain) as EMERGENCY_911', () => {
        const symptoms = ['hyperthermia_extreme', 'chest_pain', 'extreme_tachycardia'];
        const res = evaluateDifferentialSymptoms(symptoms);

        assert.equal(res.emergencyTier, EMERGENCY_TIERS.EMERGENCY_911);
        assert.equal(res.isPhysicalOveramping, true);
        assert.equal(res.isPsychologicalOveramping, false);

        const stim = res.rankedConditions.find((c) => c.id === 'stimulant_overamp');
        assert.ok(stim.isSuspected);
        assert.equal(stim.subType, 'physical');
        assert.equal(stim.emergencyTier, EMERGENCY_TIERS.EMERGENCY_911);

        // Actions must include cooling and avoiding restraints
        const coolAction = res.recommendedActions.find((a) => a.title.includes('Cooling'));
        assert.ok(coolAction);
        assert.match(coolAction.description, /ice packs/i);
        assert.match(coolAction.description, /avoid physical restraints/i);
      });

      it('evaluates purely psychological overamping (paranoia, panic, insomnia) as DE_ESCALATION', () => {
        const symptoms = ['paranoia_panic', 'hypervigilance_agitation', 'insomnia_racing_thoughts'];
        const res = evaluateDifferentialSymptoms(symptoms);

        assert.equal(res.emergencyTier, EMERGENCY_TIERS.DE_ESCALATION);
        assert.equal(res.isPhysicalOveramping, false);
        assert.equal(res.isPsychologicalOveramping, true);

        const stim = res.rankedConditions.find((c) => c.id === 'stimulant_overamp');
        assert.ok(stim.isSuspected);
        assert.equal(stim.subType, 'psychological');
        assert.equal(stim.emergencyTier, EMERGENCY_TIERS.DE_ESCALATION);

        // Recommended actions must include de-escalation protocol
        const deescAction = res.recommendedActions.find((a) => a.priority === 'DE_ESCALATION');
        assert.ok(deescAction);
        assert.match(deescAction.title, /de-escalation/i);
        assert.match(deescAction.description, /low-stimulation/i);
        assert.match(deescAction.description, /box-breathing/i);
      });

      it('escalates immediately from DE_ESCALATION to EMERGENCY_911 if a physical red flag appears', () => {
        // Start with psychological
        const psychSymptoms = ['paranoia_panic', 'insomnia_racing_thoughts'];
        const res1 = evaluateDifferentialSymptoms(psychSymptoms);
        assert.equal(res1.emergencyTier, EMERGENCY_TIERS.DE_ESCALATION);

        // Add physical red flag (chest pain)
        const combined = [...psychSymptoms, 'chest_pain'];
        const res2 = evaluateDifferentialSymptoms(combined);
        assert.equal(res2.emergencyTier, EMERGENCY_TIERS.EMERGENCY_911);
        assert.equal(res2.isPhysicalOveramping, true);
        assert.equal(res2.isPsychologicalOveramping, false);
      });
    });

    describe('Serotonin Toxicity / Syndrome Evaluation', () => {
      it('evaluates spontaneous clonus + serotonergic meds as Hunter-positive EMERGENCY_911', () => {
        const symptoms = ['clonus_spontaneous', 'serotonergic_meds', 'diaphoresis_shivering'];
        const res = evaluateDifferentialSymptoms(symptoms);

        assert.equal(res.emergencyTier, EMERGENCY_TIERS.EMERGENCY_911);
        assert.equal(res.hunterCriteriaMet, true);

        const serotonin = res.rankedConditions.find((c) => c.id === 'serotonin_syndrome');
        assert.ok(serotonin.isSuspected);
        assert.equal(serotonin.subType, 'hunter_criteria_positive');
        assert.equal(serotonin.emergencyTier, EMERGENCY_TIERS.EMERGENCY_911);

        // Red flags must mention Hunter Criteria
        assert.ok(res.redFlags.some((f) => f.includes('Hunter Serotonin Toxicity Criteria Met')));

        // Actions must advise discontinuing serotonergics and avoiding restraints
        const action = res.recommendedActions.find((a) => a.title.includes('Hunter Serotonin Criteria'));
        assert.ok(action);
        assert.match(action.description, /discontinue all serotonergic agents/i);
        assert.match(action.description, /avoid restraints/i);
      });
    });

    describe('Soft Tissue Sepsis & Necrosis Evaluation', () => {
      it('evaluates chronic necrotic ulcer + spreading redness as URGENT_EVAL when hemodynamically stable', () => {
        const symptoms = ['necrotic_ulcers', 'spreading_redness', 'foul_drainage'];
        const res = evaluateDifferentialSymptoms(symptoms);

        assert.equal(res.emergencyTier, EMERGENCY_TIERS.URGENT_EVAL);
        assert.equal(res.isSepsisEmergency, false);

        const sepsis = res.rankedConditions.find((c) => c.id === 'soft_tissue_sepsis');
        assert.ok(sepsis.isSuspected);
        assert.equal(sepsis.emergencyTier, EMERGENCY_TIERS.URGENT_EVAL);
      });

      it('escalates to EMERGENCY_911 if severe pain out of proportion (necrotizing fasciitis alert) is present', () => {
        const symptoms = ['necrotic_ulcers', 'pain_disproportion'];
        const res = evaluateDifferentialSymptoms(symptoms);

        assert.equal(res.emergencyTier, EMERGENCY_TIERS.EMERGENCY_911);
        assert.equal(res.isSepsisEmergency, true);
        assert.ok(res.redFlags.some((f) => f.includes('Necrotizing Fasciitis')));
      });

      it('escalates to EMERGENCY_911 if septic shock (infection + hypotension) is present', () => {
        const symptoms = ['spreading_redness', 'sepsis_hypotension'];
        const res = evaluateDifferentialSymptoms(symptoms);

        assert.equal(res.emergencyTier, EMERGENCY_TIERS.EMERGENCY_911);
        assert.equal(res.isSepsisEmergency, true);
        assert.ok(res.redFlags.some((f) => f.includes('Septic Shock')));
      });
    });

    describe('Poly-Substance Adulteration Scenarios', () => {
      it('identifies poly-substance adulteration when opioid and stimulant symptoms co-occur', () => {
        // Co-ingestion: Fentanyl/xylazine (respiratory arrest) + Methamphetamine (extreme hyperthermia)
        const symptoms = ['resp_depression', 'cyanosis', 'hyperthermia_extreme', 'chest_pain'];
        const res = evaluateDifferentialSymptoms(symptoms);

        assert.equal(res.emergencyTier, EMERGENCY_TIERS.EMERGENCY_911);
        assert.equal(res.isPolySubstanceSuspected, true);
        assert.equal(res.isOpioidSedativeEmergency, true);
        assert.equal(res.isPhysicalOveramping, true);

        // Both opioid and stimulant must be marked suspected
        const opioid = res.rankedConditions.find((c) => c.id === 'opioid_xylazine');
        const stim = res.rankedConditions.find((c) => c.id === 'stimulant_overamp');
        assert.ok(opioid.isSuspected);
        assert.ok(stim.isSuspected);

        // Recommendations must prioritize airway/naloxone and physical cooling
        assert.ok(res.recommendedActions.some((a) => a.title.includes('Naloxone')));
        assert.ok(res.recommendedActions.some((a) => a.title.includes('Cooling')));
      });
    });

    describe('Condition Ranking Logic', () => {
      it('ranks suspected conditions before unsuspected conditions', () => {
        const symptoms = ['resp_depression', 'cyanosis'];
        const res = evaluateDifferentialSymptoms(symptoms);

        const suspected = res.rankedConditions.filter((c) => c.isSuspected);
        const unsuspected = res.rankedConditions.filter((c) => !c.isSuspected);

        assert.ok(suspected.length >= 1);
        assert.ok(unsuspected.length >= 1);
        assert.equal(res.rankedConditions[0].isSuspected, true);
        assert.equal(res.rankedConditions[res.rankedConditions.length - 1].isSuspected, false);
      });

      it('ranks EMERGENCY_911 above URGENT_EVAL and DE_ESCALATION', () => {
        // Combine 911 opioid symptom with non-emergency soft tissue symptom
        const symptoms = ['resp_depression', 'necrotic_ulcers'];
        const res = evaluateDifferentialSymptoms(symptoms);

        assert.equal(res.rankedConditions[0].id, 'opioid_xylazine');
        assert.equal(res.rankedConditions[0].emergencyTier, EMERGENCY_TIERS.EMERGENCY_911);
        assert.equal(res.rankedConditions[1].id, 'soft_tissue_sepsis');
        assert.equal(res.rankedConditions[1].emergencyTier, EMERGENCY_TIERS.URGENT_EVAL);
      });
    });
  });

  describe('4. Ephemeral In-RAM State & Deterministic Wipe (resetDifferentialState)', () => {
    it('manages in-memory state with setDifferentialSymptoms and toggleDifferentialSymptom', () => {
      resetDifferentialState();

      let state = setDifferentialSymptoms(['resp_depression', 'cyanosis']);
      assert.deepEqual(state.selectedSymptoms.sort(), ['cyanosis', 'resp_depression']);

      state = toggleDifferentialSymptom('chest_pain');
      assert.ok(state.selectedSymptoms.includes('chest_pain'));

      state = toggleDifferentialSymptom('cyanosis');
      assert.ok(!state.selectedSymptoms.includes('cyanosis'));
    });

    it('applies presets with applyDifferentialPreset', () => {
      resetDifferentialState();

      const state = applyDifferentialPreset('preset_psych_overamp');
      assert.equal(state.activePreset, 'preset_psych_overamp');
      assert.ok(state.selectedSymptoms.includes('paranoia_panic'));
      assert.ok(state.selectedSymptoms.includes('insomnia_racing_thoughts'));
    });

    it('notifies registered subscribers upon state changes', () => {
      resetDifferentialState();

      const events = [];
      const unsubscribe = subscribeDifferentialState((s) => {
        events.push(s);
      });

      setDifferentialSymptoms(['unresponsive']);
      assert.equal(events.length, 1);
      assert.deepEqual(events[0].selectedSymptoms, ['unresponsive']);

      unsubscribe();
      setDifferentialSymptoms(['chest_pain']);
      assert.equal(events.length, 1, 'Should not receive events after unsubscribe');
    });

    it('deterministically wipes all selected symptoms and active presets with resetDifferentialState', () => {
      setDifferentialSymptoms(['resp_depression', 'hyperthermia_extreme']);
      applyDifferentialPreset('preset_opioid_xylazine');

      const wiped = resetDifferentialState();
      assert.deepEqual(wiped.selectedSymptoms, []);
      assert.equal(wiped.activePreset, null);

      const current = getDifferentialState();
      assert.deepEqual(current.selectedSymptoms, []);
      assert.equal(current.activePreset, null);
    });
  });

  describe('5. DOM Construction, Interactivity & Accessibility (clinicalDifferential)', () => {
    it('constructs accessible DOM component with fieldsets, legends, checkboxes, and presets', () => {
      withMockDom(() => {
        resetDifferentialState();

        const el = clinicalDifferential();
        assert.ok(el instanceof MockNode);
        assert.equal(el.tagName, 'SECTION');
        assert.equal(el.id, 'clinical-differential');

        // Check fieldsets and legends
        const fieldsets = el.querySelectorAll('fieldset');
        assert.equal(fieldsets.length, SYMPTOM_CATEGORIES.length);

        for (const fs of fieldsets) {
          const legend = fs.querySelector('legend');
          assert.ok(legend, 'Each fieldset must have a legend');
          assert.ok(legend.textContent.length > 0);
        }

        // Check checkboxes
        const checkboxes = el.querySelectorAll('input[type="checkbox"]');
        assert.equal(checkboxes.length, Object.keys(DIFFERENTIAL_SYMPTOMS).length);

        // Check live evaluation container
        const resultsEl = el.querySelector('#differential-evaluation-results');
        assert.ok(resultsEl);
        assert.equal(resultsEl.getAttribute('aria-live'), 'polite');

        // Check initial empty prompt
        const prompt = el.querySelector('#diff-empty-prompt');
        assert.ok(prompt, 'Initial empty prompt must be rendered');
      });
    });

    it('has ZERO inline style attributes anywhere in the DOM (CSP compliance)', () => {
      withMockDom(() => {
        resetDifferentialState();

        const el = clinicalDifferential();
        const allNodes = el.findAll(() => true);

        for (const node of allNodes) {
          assert.equal(node.hasAttribute('style'), false, `Node ${node.tagName} must not have inline style attribute`);
        }
      });
    });

    it('interactively responds to checkbox changes and updates live evaluation', () => {
      withMockDom(() => {
        resetDifferentialState();

        const el = clinicalDifferential();

        // Find checkbox for resp_depression
        const cb = el.querySelector('#sym-resp_depression');
        assert.ok(cb);
        assert.equal(cb.checked, false);

        // Simulate user checking resp_depression
        cb.checked = true;
        cb.dispatchEvent('change');

        // Verify live results updated
        const banner = el.querySelector('#differential-alert-banner');
        assert.ok(banner, 'Alert banner should render when symptom is checked');
        assert.match(banner.className, /callout-emergency/);

        const card = el.querySelector('#diff-card-opioid_xylazine');
        assert.ok(card, 'Opioid condition card should render');
        assert.match(card.textContent, /Opioid & Xylazine/);
      });
    });

    it('applies clinical preset from UI button and updates live results', () => {
      withMockDom(() => {
        resetDifferentialState();

        const el = clinicalDifferential();

        // Click physical overamping preset button
        const presetBtn = el.querySelector('#diff-preset-preset_physical_overamp');
        assert.ok(presetBtn);
        presetBtn.click();

        // Verify checkbox states
        const feverCb = el.querySelector('#sym-hyperthermia_extreme');
        assert.equal(feverCb.checked, true);

        // Verify live evaluation shows physical overamping
        const stimCard = el.querySelector('#diff-card-stimulant_overamp');
        assert.ok(stimCard);
        assert.match(stimCard.textContent, /Stimulant Overamping/);

        // Emergency banner should be active
        const banner = el.querySelector('#differential-alert-banner');
        assert.ok(banner);
        assert.equal(banner.getAttribute('role'), 'alert');
      });
    });

    it('clears all checkboxes and results when reset button is clicked', () => {
      withMockDom(() => {
        resetDifferentialState();

        const el = clinicalDifferential();

        // Select symptoms
        const cb = el.querySelector('#sym-cyanosis');
        cb.checked = true;
        cb.dispatchEvent('change');

        assert.ok(el.querySelector('#diff-card-opioid_xylazine'));

        // Click bottom reset button
        const resetBtn = el.querySelector('#btn-reset-differential-bottom');
        assert.ok(resetBtn);
        resetBtn.click();

        // Checkbox must be unchecked
        assert.equal(cb.checked, false);

        // Results should revert to empty prompt
        assert.ok(el.querySelector('#diff-empty-prompt'));
        assert.equal(el.querySelector('#diff-card-opioid_xylazine'), null);
      });
    });

    it('wires onNavigate callback to related tool buttons when provided', () => {
      withMockDom(() => {
        resetDifferentialState();

        const navigated = [];
        const onNavigate = (dest) => navigated.push(dest);

        const el = clinicalDifferential({ onNavigate });

        // Trigger evaluation to show action buttons
        applyDifferentialPreset('preset_opioid_xylazine');

        // Check pacing navigation button
        const pacerBtn = el.querySelector('#btn-nav-pacer');
        assert.ok(pacerBtn);
        pacerBtn.click();
        assert.equal(navigated[0], 'pacing');

        // Check test strip calculator navigation button
        const stripBtn = el.querySelector('#btn-nav-strip-calc');
        assert.ok(stripBtn);
        stripBtn.click();
        assert.equal(navigated[1], 'checking');

        // Check facilities navigation button
        const facBtn = el.querySelector('#btn-nav-facilities');
        assert.ok(facBtn);
        facBtn.click();
        assert.equal(navigated[2], 'treatment');
      });
    });

    it('works cleanly when called with zero arguments clinicalDifferential()', () => {
      withMockDom(() => {
        resetDifferentialState();
        const el = clinicalDifferential();
        assert.ok(el instanceof MockNode);
      });
    });

    it('updates DOM checkboxes and evaluation when resetDifferentialState() is called externally', () => {
      withMockDom(() => {
        resetDifferentialState();
        const el = clinicalDifferential();

        // Check a symptom externally
        setDifferentialSymptoms(['resp_depression', 'cyanosis']);

        // Checkboxes should be updated via subscription
        const respCb = el.querySelector('#sym-resp_depression');
        assert.equal(respCb.checked, true);
        assert.ok(el.querySelector('#diff-card-opioid_xylazine'));

        // Reset externally
        resetDifferentialState();
        assert.equal(respCb.checked, false);
        assert.ok(el.querySelector('#diff-empty-prompt'));
      });
    });

    it('supports all 5 rapid clinical presets in DOM UI', () => {
      withMockDom(() => {
        const el = clinicalDifferential();

        for (const preset of DIFFERENTIAL_PRESETS) {
          resetDifferentialState();
          const btn = el.querySelector(`#diff-preset-${preset.id}`);
          assert.ok(btn, `Preset button #diff-preset-${preset.id} must exist in DOM`);
          btn.click();

          const state = getDifferentialState();
          assert.equal(state.activePreset, preset.id);
          assert.equal(btn.getAttribute('aria-pressed'), 'true');
        }
      });
    });

    it('strictly guarantees Zero PII with zero storage or URL access', () => {
      // Mock storage trackers
      let storageTouched = false;
      let cookieTouched = false;

      const proxyStorage = new Proxy({}, {
        set() { storageTouched = true; return true; },
        get(t, p) { if (p === 'getItem' || p === 'setItem') storageTouched = true; return undefined; },
      });

      withMockDom(() => {
        globalThis.localStorage = proxyStorage;
        globalThis.sessionStorage = proxyStorage;

        // Perform clinical evaluation and state modifications
        resetDifferentialState();
        setDifferentialSymptoms(['resp_depression', 'cyanosis', 'chest_pain']);
        evaluateDifferentialSymptoms(['resp_depression', 'cyanosis', 'chest_pain']);
        applyDifferentialPreset('preset_serotonin_syndrome');
        clinicalDifferential();
        resetDifferentialState();

        assert.equal(storageTouched, false, 'Clinical differential must never touch localStorage or sessionStorage');
        assert.equal(cookieTouched, false, 'Clinical differential must never touch cookies');
      });
    });
  });
});
