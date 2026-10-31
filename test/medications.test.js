import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MEDICATIONS,
  MEDICATION_CATEGORIES,
  INTERACTIONS,
  INTERACTION_SUBSTANCES,
  REGIMEN_AGENTS,
  SPECIAL_POPULATIONS_PHARM,
  evaluateRegimenSafety,
  filterMedications,
  filterInteractions,
  medicationsView,
} from '../public/js/views/medications.js';

const VALID_CATEGORIES = new Set(['oud', 'aud', 'reversal', 'stimulant_nicotine']);
const VALID_SEVERITIES = new Set(['high', 'moderate', 'info']);
const VALID_SAMHSA_CODES = new Set(['BU', 'MU', 'NU', 'OTP', 'PMAT', 'NOE', 'CMI', 'NRT', 'NSC']);

describe('MEDICATIONS clinical data & schema', () => {
  it('contains all 9+ required evidence-based medication profiles across 4 clinical categories', () => {
    assert.ok(Array.isArray(MEDICATIONS));
    assert.ok(MEDICATIONS.length >= 9, `Expected >= 9 profiles, got ${MEDICATIONS.length}`);

    for (const cat of VALID_CATEGORIES) {
      const inCat = MEDICATIONS.filter((m) => m.category === cat);
      assert.ok(inCat.length >= 1, `Expected at least 1 medication in category "${cat}"`);
    }
  });

  it('validates every medication profile has complete fields, valid SAMHSA codes, and authoritative sources', () => {
    const ids = new Set();
    for (const med of MEDICATIONS) {
      assert.equal(typeof med.id, 'string');
      assert.ok(med.id.length > 0);
      assert.ok(!ids.has(med.id), `Duplicate medication id: ${med.id}`);
      ids.add(med.id);

      assert.ok(VALID_CATEGORIES.has(med.category), `Invalid category "${med.category}" on ${med.id}`);
      assert.equal(typeof med.name, 'string');
      assert.ok(Array.isArray(med.brands) && med.brands.length >= 1, `Missing brands on ${med.id}`);
      assert.equal(typeof med.forms, 'string');
      assert.equal(typeof med.summary, 'string');
      assert.equal(typeof med.mechanism, 'string');
      assert.equal(typeof med.howToStart, 'string');
      assert.equal(typeof med.access, 'string');

      assert.ok(Array.isArray(med.samhsaCodes) && med.samhsaCodes.length >= 1, `Missing samhsaCodes on ${med.id}`);
      for (const code of med.samhsaCodes) {
        assert.ok(VALID_SAMHSA_CODES.has(code), `Unexpected SAMHSA code "${code}" on ${med.id}`);
      }

      assert.ok(med.finderHref.startsWith('#/treatment?codes='), `Invalid finderHref on ${med.id}`);
      assert.equal(typeof med.finderLabel, 'string');
      assert.ok(Array.isArray(med.clinicalPearls) && med.clinicalPearls.length >= 2, `Expected >= 2 clinicalPearls on ${med.id}`);
      assert.ok(Array.isArray(med.sources) && med.sources.length >= 1, `Missing sources on ${med.id}`);
      for (const [label, url] of med.sources) {
        assert.ok(label.length > 0);
        assert.ok(url.startsWith('https://'), `Source URL must be https on ${med.id}: ${url}`);
      }
    }
  });

  it('covers critical PharmD clinical specifics across MOUD, MAUD, Overdose Reversal, and Stimulant/Nicotine care', () => {
    const bup = MEDICATIONS.find((m) => m.id === 'buprenorphine');
    assert.ok(bup);
    assert.ok(bup.brands.some((b) => b.includes('Sublocade')));
    assert.ok(bup.brands.some((b) => b.includes('Brixadi')));
    assert.match(bup.howToStart, /Bernese Method/i);
    assert.match(bup.access, /X-waiver/i);

    const methadone = MEDICATIONS.find((m) => m.id === 'methadone');
    assert.ok(methadone);
    assert.deepEqual(methadone.samhsaCodes, ['OTP', 'MU']);
    assert.match(methadone.access, /42 CFR Part 8/i);
    assert.ok(methadone.clinicalPearls.some((p) => /QTc/i.test(p)));

    const vivitrol = MEDICATIONS.find((m) => m.id === 'xr-naltrexone');
    assert.ok(vivitrol);
    assert.ok(vivitrol.samhsaCodes.includes('NU'));
    assert.ok(vivitrol.clinicalPearls.some((p) => /tolerance/i.test(p)));

    const acamprosate = MEDICATIONS.find((m) => m.id === 'acamprosate');
    assert.ok(acamprosate);
    assert.ok(acamprosate.clinicalPearls.some((p) => /kidney|liver/i.test(p)));

    const reversal = MEDICATIONS.find((m) => m.id === 'naloxone-nalmefene');
    assert.ok(reversal);
    assert.ok(reversal.samhsaCodes.includes('NOE'));
    assert.ok(reversal.clinicalPearls.some((p) => /4 mg/i.test(p) && /nalmefene/i.test(p)));
    assert.ok(reversal.clinicalPearls.some((p) => /xylazine/i.test(p)));

    const stimulant = MEDICATIONS.find((m) => m.id === 'stimulant-care');
    assert.ok(stimulant);
    assert.ok(stimulant.samhsaCodes.includes('CMI'));
    assert.ok(stimulant.clinicalPearls.some((p) => /ADAPT-2/i.test(p)));

    const nicotine = MEDICATIONS.find((m) => m.id === 'nicotine-tobacco');
    assert.ok(nicotine);
    assert.deepEqual(nicotine.samhsaCodes, ['NRT', 'NSC']);
  });
});

describe('INTERACTIONS clinical data & filterInteractions()', () => {
  it('validates all 10 required drug-drug and substance-medication interactions', () => {
    assert.equal(INTERACTIONS.length, 10);
    const expectedIds = [
      'opioids-benzos',
      'opioids-xylazine',
      'opioids-gabapentinoids',
      'opioids-alcohol',
      'buprenorphine-full-agonists',
      'methadone-cyp-qtc',
      'naltrexone-opioids',
      'cocaine-alcohol',
      'stimulants-opioids',
      'alcohol-disulfiram',
    ];
    for (const id of expectedIds) {
      const found = INTERACTIONS.find((ix) => ix.id === id);
      assert.ok(found, `Missing required interaction "${id}"`);
      assert.ok(VALID_SEVERITIES.has(found.severity));
      assert.ok(Array.isArray(found.substances) && found.substances.length >= 1);
      assert.equal(typeof found.title, 'string');
      assert.equal(typeof found.summary, 'string');
      assert.equal(typeof found.mechanism, 'string');
      assert.equal(typeof found.action, 'string');
      assert.ok(Array.isArray(found.source) && found.source.length === 2);
      assert.ok(found.source[1].startsWith('https://'));
    }
  });

  it('filters interactions accurately by substance tag and search query', () => {
    assert.equal(filterInteractions().length, INTERACTIONS.length);
    assert.equal(filterInteractions({ substance: 'all', query: '' }).length, INTERACTIONS.length);

    const xylazineMatches = filterInteractions({ substance: 'xylazine' });
    assert.equal(xylazineMatches.length, 1);
    assert.equal(xylazineMatches[0].id, 'opioids-xylazine');

    const methadoneMatches = filterInteractions({ substance: 'methadone' });
    assert.ok(methadoneMatches.some((ix) => ix.id === 'methadone-cyp-qtc'));
    assert.ok(methadoneMatches.some((ix) => ix.id === 'buprenorphine-full-agonists'));

    const cocaethyleneMatches = filterInteractions({ query: 'cocaethylene' });
    assert.equal(cocaethyleneMatches.length, 1);
    assert.equal(cocaethyleneMatches[0].id, 'cocaine-alcohol');

    const combined = filterInteractions({ substance: 'methadone', query: 'QTc' });
    assert.equal(combined.length, 1);
    assert.equal(combined[0].id, 'methadone-cyp-qtc');

    const noMatches = filterInteractions({ substance: 'disulfiram', query: 'xylazine' });
    assert.equal(noMatches.length, 0);
  });

  it('filters medications by category and search query', () => {
    assert.equal(filterMedications({ category: 'all' }).length, MEDICATIONS.length);
    const oud = filterMedications({ category: 'oud' });
    assert.equal(oud.length, 3);
    const aud = filterMedications({ category: 'aud' });
    assert.equal(aud.length, 4);
    const bernese = filterMedications({ query: 'Bernese' });
    assert.ok(bernese.some((m) => m.id === 'buprenorphine'));
  });
});

describe('medicationsView() DOM construction & CSP safety', () => {
  it('contains zero innerHTML or inline style usage in source file', () => {
    const src = readFileSync(new URL('../public/js/views/medications.js', import.meta.url), 'utf8');
    assert.equal(/\.innerHTML\b/.test(src), false, 'medications.js must never use innerHTML');
    assert.equal(/\bstyle\s*:/.test(src), false, 'medications.js must never use inline style attributes');
  });

  it('renders interactive tabs, Bernese guide, interaction explorer, printable checklist, and all 7 SAMHSA links', () => {
    // Minimal DOM shim for testing h() tree construction in Node
    class FakeNode {
      constructor(tag) {
        this.tagName = tag.toUpperCase();
        this.className = '';
        this.id = '';
        this.dataset = {};
        this.attributes = new Map();
        this.children = [];
        this.listeners = new Map();
        this.textContent = '';
        this.value = '';
      }
      setAttribute(k, v) {
        this.attributes.set(k, String(v));
        if (k === 'id') this.id = String(v);
        if (k === 'class') this.className = String(v);
      }
      getAttribute(k) {
        return this.attributes.get(k) ?? null;
      }
      removeAttribute(k) {
        this.attributes.delete(k);
      }
      addEventListener(type, fn) {
        this.listeners.set(type, fn);
      }
      append(...nodes) {
        for (const n of nodes) {
          if (n instanceof FakeNode) {
            n.parentNode = this;
            this.children.push(n);
          } else {
            const tNode = new FakeNode('#text');
            tNode.textContent = String(n);
            tNode.parentNode = this;
            this.children.push(tNode);
          }
        }
      }
      get firstChild() {
        return this.children[0] ?? null;
      }
    }

    FakeNode.prototype.remove = function remove() {
      if (!this.parentNode) return;
      const i = this.parentNode.children.indexOf(this);
      if (i !== -1) this.parentNode.children.splice(i, 1);
    };

    const prevNode = globalThis.Node;
    const prevDoc = globalThis.document;
    globalThis.Node = FakeNode;
    globalThis.document = {
      createElement: (tag) => new FakeNode(tag),
      createElementNS: (_ns, tag) => new FakeNode(tag),
      getElementById: () => null,
    };

    try {
      const root = medicationsView({ query: new URLSearchParams('category=oud&substance=xylazine') });
      assert.equal(root.tagName, 'DIV');

      const allNodes = [];
      const walk = (n) => {
        allNodes.push(n);
        for (const c of n.children || []) walk(c);
      };
      walk(root);

      const hrefs = allNodes
        .filter((n) => n.tagName === 'A')
        .map((n) => n.getAttribute('href'));

      const requiredLinks = [
        '#/treatment?codes=BU',
        '#/treatment?codes=OTP',
        '#/treatment?codes=NU',
        '#/treatment?codes=PMAT',
        '#/treatment?codes=NOE',
        '#/treatment?codes=CMI',
        '#/treatment?codes=NRT',
      ];
      for (const link of requiredLinks) {
        assert.ok(hrefs.includes(link), `Expected direct link to ${link}`);
      }

      // Verify OUD tab selected initially from query param
      const oudTab = allNodes.find((n) => n.id === 'med-tab-oud');
      assert.ok(oudTab);
      assert.equal(oudTab.getAttribute('aria-selected'), 'true');

      // Trigger click on AUD tab and verify panel updates
      const audTab = allNodes.find((n) => n.id === 'med-tab-aud');
      assert.ok(audTab);
      audTab.listeners.get('click')();
      assert.equal(audTab.getAttribute('aria-selected'), 'true');
      assert.equal(oudTab.getAttribute('aria-selected'), 'false');

      // Verify special-populations section and regimen-safety-checker exist
      const specialPopSection = allNodes.find((n) => n.id === 'special-populations');
      assert.ok(specialPopSection, 'Expected #special-populations section in medicationsView');
      const regimenPanel = allNodes.find((n) => n.id === 'regimen-safety-checker');
      assert.ok(regimenPanel, 'Expected #regimen-safety-checker panel in medicationsView');
    } finally {
      globalThis.Node = prevNode;
      globalThis.document = prevDoc;
    }
  });
});

describe('REGIMEN_AGENTS, evaluateRegimenSafety() & SPECIAL_POPULATIONS_PHARM', () => {
  it('exports all 11 required REGIMEN_AGENTS with valid ids and labels', () => {
    const requiredIds = [
      'opioids_fentanyl',
      'buprenorphine',
      'methadone',
      'naltrexone',
      'alcohol',
      'benzos_sedatives',
      'xylazine_medetomidine',
      'stimulants',
      'gabapentinoids',
      'disulfiram',
      'qtc_meds',
    ];
    assert.equal(REGIMEN_AGENTS.length, 11);
    for (const id of requiredIds) {
      const agent = REGIMEN_AGENTS.find((a) => a.id === id);
      assert.ok(agent, `Missing regimen agent: ${id}`);
      assert.equal(typeof agent.label, 'string');
      assert.ok(agent.label.length > 0);
    }
  });

  it('evaluates multi-substance combinations for triple+ depressants, precipitated withdrawal, and QTc/metabolic risks', () => {
    // Fewer than 2 agents -> none
    const single = evaluateRegimenSafety(['opioids_fentanyl']);
    assert.equal(single.riskLevel, 'none');
    assert.deepEqual(single.alerts, []);
    assert.deepEqual(single.matchedInteractions, []);

    // Triple+ CNS / Respiratory Depressant Synergy -> critical
    const triple = evaluateRegimenSafety(['opioids_fentanyl', 'benzos_sedatives', 'xylazine_medetomidine']);
    assert.equal(triple.riskLevel, 'critical');
    assert.ok(triple.alerts.some((a) => a.id === 'triple-depressant-synergy'));
    assert.ok(triple.matchedInteractions.some((ix) => ix.id === 'opioids-benzos'));
    assert.ok(triple.matchedInteractions.some((ix) => ix.id === 'opioids-xylazine'));
    assert.ok(triple.actionSteps.length >= 2);

    // Precipitated opioid withdrawal risk (fentanyl + buprenorphine) -> high, mentions Bernese Method
    const bupPrecip = evaluateRegimenSafety(['opioids_fentanyl', 'buprenorphine']);
    assert.equal(bupPrecip.riskLevel, 'high');
    assert.ok(bupPrecip.alerts.some((a) => a.id === 'precipitated-withdrawal-buprenorphine'));
    assert.ok(bupPrecip.actionSteps.some((s) => /Bernese Method/i.test(s)));

    // Precipitated withdrawal with Naltrexone + Methadone -> critical
    const naltrexonePrecip = evaluateRegimenSafety(['methadone', 'naltrexone']);
    assert.equal(naltrexonePrecip.riskLevel, 'critical');
    assert.ok(naltrexonePrecip.alerts.some((a) => a.id === 'precipitated-withdrawal-naltrexone'));

    // QTc & CYP3A4 interaction (methadone + qtc_meds) -> high
    const qtc = evaluateRegimenSafety(['methadone', 'qtc_meds']);
    assert.equal(qtc.riskLevel, 'high');
    assert.ok(qtc.alerts.some((a) => a.id === 'methadone-qtc-cyp-synergy'));
    assert.ok(qtc.matchedInteractions.some((ix) => ix.id === 'methadone-cyp-qtc'));

    // Disulfiram + Alcohol -> critical
    const disulf = evaluateRegimenSafety(['disulfiram', 'alcohol']);
    assert.equal(disulf.riskLevel, 'critical');
    assert.ok(disulf.alerts.some((a) => a.id === 'disulfiram-acetaldehyde-reaction'));

    // Naltrexone + Alcohol alone -> info (evidence-based AUD therapy)
    const audTherapeutic = evaluateRegimenSafety(['naltrexone', 'alcohol']);
    assert.equal(audTherapeutic.riskLevel, 'info');
    assert.ok(audTherapeutic.alerts.some((a) => a.id === 'naltrexone-alcohol-therapeutic'));
  });

  it('validates SPECIAL_POPULATIONS_PHARM contains all 4 clinical guides with SAMHSA codes', () => {
    assert.equal(SPECIAL_POPULATIONS_PHARM.length, 4);
    const expectedIds = [
      'pregnancy_lactation',
      'hepatic_hcv',
      'renal_ckd',
      'acute_pain_perioperative',
    ];
    for (const id of expectedIds) {
      const pop = SPECIAL_POPULATIONS_PHARM.find((p) => p.id === id);
      assert.ok(pop, `Missing special population guide: ${id}`);
      assert.equal(typeof pop.title, 'string');
      assert.equal(typeof pop.summary, 'string');
      assert.ok(Array.isArray(pop.keyPoints) && pop.keyPoints.length >= 3);
      assert.ok(Array.isArray(pop.samhsaCodes) && pop.samhsaCodes.length >= 1);
    }
    const preg = SPECIAL_POPULATIONS_PHARM.find((p) => p.id === 'pregnancy_lactation');
    assert.ok(preg.samhsaCodes.includes('PW'));
    const hcv = SPECIAL_POPULATIONS_PHARM.find((p) => p.id === 'hepatic_hcv');
    assert.ok(hcv.samhsaCodes.includes('HCT'));
  });
});

