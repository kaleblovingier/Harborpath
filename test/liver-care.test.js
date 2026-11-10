// test/liver-care.test.js
// HarborPath - Hepatic Health, Cirrhosis, APAP Toxicity & MOUD Liver Safety Navigator Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  HEPATIC_MOUD_PROFILES,
  APAP_TOXICITY_STANDARDS,
  CIRRHOSIS_STAGING_TIERS,
  HEPATIC_CLINICAL_DIFFERENTIALS,
  HEPATIC_HARM_REDUCTION_RULES,
  evaluateLiverRisk,
  buildLiverSbarText,
  getLiverState,
  setLiverState,
  resetLiverState,
  subscribeLiverState,
  liverCareView,
} from '../public/js/views/liverCare.js';

describe('Liver Care & Hepatic Safety Navigator Module (Wave 40)', () => {
  it('exports accurate hepatic MOUD pharmacokinetics and liver impairment profiles', () => {
    // 1. Buprenorphine
    const bup = HEPATIC_MOUD_PROFILES.buprenorphine;
    assert.ok(bup, 'Missing buprenorphine profile');
    assert.ok(bup.pharmacokineticsEn.includes('CYP3A4'));
    assert.ok(bup.pharmacokineticsEn.includes('14-fold'));
    assert.ok(bup.pharmacokineticsEn.includes('Child-Pugh Class C'));
    assert.ok(bup.clinicalDirectivesEn.includes('Subutex'));

    // 2. Methadone
    const meth = HEPATIC_MOUD_PROFILES.methadone;
    assert.ok(meth, 'Missing methadone profile');
    assert.ok(meth.pharmacokineticsEn.includes('protein-bound'));
    assert.ok(meth.pharmacokineticsEn.includes('elimination half-life'));
    assert.ok(meth.clinicalDirectivesEn.includes('QTc interval prolongation'));
    assert.ok(meth.clinicalDirectivesEn.includes('serial 12-lead ECG'));
  });

  it('exports verified APAP toxicity standards, Rumack-Matthew nomogram, and NAC protocols', () => {
    assert.strictEqual(APAP_TOXICITY_STANDARDS.nomogramLine4HourUgmL, 150);
    assert.strictEqual(APAP_TOXICITY_STANDARDS.nomogramLine12HourUgmL, 37.5);
    assert.ok(APAP_TOXICITY_STANDARDS.mechanismEn.includes('NAPQI'));
    assert.ok(APAP_TOXICITY_STANDARDS.mechanismEn.includes('Glutathione'));
    assert.ok(APAP_TOXICITY_STANDARDS.nacProtocolIvEn.includes('21-Hour'));
    assert.ok(APAP_TOXICITY_STANDARDS.nacProtocolIvEn.includes('150 mg/kg'));
    assert.ok(APAP_TOXICITY_STANDARDS.kingsCollegeCriteriaEn.includes('Arterial pH < 7.30'));
    assert.ok(APAP_TOXICITY_STANDARDS.kingsCollegeCriteriaEn.includes('INR > 6.5'));
  });

  it('classifies Cirrhosis and hepatic reserve across Child-Pugh Classes A–C', () => {
    assert.strictEqual(CIRRHOSIS_STAGING_TIERS.length, 3);

    // Class A
    const a = CIRRHOSIS_STAGING_TIERS.find((s) => s.tierId === 'child_pugh_a');
    assert.ok(a);
    assert.strictEqual(a.severity, 'mild_caution');
    assert.ok(a.titleEn.includes('Score 5–6'));
    assert.ok(a.clinicalHandlingEn.includes('Standard MOUD dosing'));

    // Class B
    const b = CIRRHOSIS_STAGING_TIERS.find((s) => s.tierId === 'child_pugh_b');
    assert.ok(b);
    assert.strictEqual(b.severity, 'moderate_warning');
    assert.ok(b.titleEn.includes('Score 7–9'));
    assert.ok(b.clinicalHandlingEn.includes('Avoid all NSAIDs'));

    // Class C
    const c = CIRRHOSIS_STAGING_TIERS.find((s) => s.tierId === 'child_pugh_c');
    assert.ok(c);
    assert.strictEqual(c.severity, 'critical_emergency');
    assert.ok(c.titleEn.includes('Score 10–15'));
    assert.ok(c.clinicalHandlingEn.includes('Switch from Suboxone to Subutex'));
  });

  it('provides clinical differentials for APAP Overdose, Encephalopathy, Variceal Hemorrhage, and HCV DAA Cure', () => {
    // APAP Overdose
    const apap = HEPATIC_CLINICAL_DIFFERENTIALS.acuteApapOverdose;
    assert.ok(apap);
    assert.strictEqual(apap.severity, 'emergency_911');
    assert.ok(apap.hallmarksEn.includes('> 150 mg/kg'));
    assert.ok(apap.actionEn.includes('Rumack-Matthew nomogram'));
    assert.ok(apap.actionEn.includes('N-Acetylcysteine'));

    // Hepatic Encephalopathy
    const he = HEPATIC_CLINICAL_DIFFERENTIALS.hepaticEncephalopathy;
    assert.ok(he);
    assert.strictEqual(he.severity, 'emergency_hospital');
    assert.ok(he.hallmarksEn.includes('asterixis'));
    assert.ok(he.actionEn.includes('lactulose'));
    assert.ok(he.actionEn.includes('2–3 soft bowel movements'));
    assert.ok(he.actionEn.includes('Rifaximin 550 mg'));

    // Variceal Bleeding
    const vb = HEPATIC_CLINICAL_DIFFERENTIALS.varicealBleeding;
    assert.ok(vb);
    assert.strictEqual(vb.severity, 'emergency_911');
    assert.ok(vb.hallmarksEn.includes('hematemesis'));
    assert.ok(vb.hallmarksEn.includes('melena'));
    assert.ok(vb.actionEn.includes('octreotide'));
    assert.ok(vb.actionEn.includes('variceal ligation'));

    // HCV DAA Standards
    const hcv = HEPATIC_CLINICAL_DIFFERENTIALS.hcvDirectActingAntivirals;
    assert.ok(hcv);
    assert.strictEqual(hcv.severity, 'standard_care');
    assert.ok(hcv.actionEn.includes('Active substance use or alcohol use is NOT a valid contraindication'));
  });

  it('enumerates 5 evidence-based hepatic harm reduction and liver survival rules', () => {
    assert.strictEqual(HEPATIC_HARM_REDUCTION_RULES.length, 5);

    const r1 = HEPATIC_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 1);
    assert.ok(r1.titleEn.includes('2 g vs 4 g'));

    const r2 = HEPATIC_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 2);
    assert.ok(r2.titleEn.includes('Strict Prohibition on NSAIDs'));

    const r3 = HEPATIC_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 3);
    assert.ok(r3.titleEn.includes('Suboxone vs. Subutex in Child-Pugh C'));

    const r4 = HEPATIC_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 4);
    assert.ok(r4.titleEn.includes('Target 2–3 Soft Stools'));

    const r5 = HEPATIC_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 5);
    assert.ok(r5.titleEn.includes('NOT a Contraindication to Hepatitis C Cure'));
  });

  describe('Clinical Decision Support Evaluation Algorithm (evaluateLiverRisk)', () => {
    it('returns standard guidance when no flags are checked', () => {
      const res = evaluateLiverRisk({});
      assert.strictEqual(res.tier, 'standard_hepatic_guidance');
      assert.strictEqual(res.isEmergency, false);
      assert.ok(res.titleEn.includes('Standard Hepatic Health'));
    });

    it('identifies Acute Variceal Bleeding as top Code Red priority', () => {
      const res = evaluateLiverRisk({
        hasHematemesisOrMelena: true,
        hasApapAboveRumackNomogram: true,
      });
      assert.strictEqual(res.tier, 'emergency_variceal_bleeding');
      assert.strictEqual(res.isEmergency, true);
      assert.ok(res.titleEn.includes('Variceal Hemorrhage'));
      assert.ok(res.actionEn.includes('CALL 911 IMMEDIATELY'));
      assert.ok(res.interventionEn.includes('octreotide'));
    });

    it('identifies Acute Toxic APAP Overdose requiring emergency IV NAC', () => {
      const res = evaluateLiverRisk({
        hasApapAboveRumackNomogram: true,
      });
      assert.strictEqual(res.tier, 'emergency_apap_toxicity');
      assert.strictEqual(res.isEmergency, true);
      assert.ok(res.titleEn.includes('Acetaminophen Overdose'));
      assert.ok(res.actionEn.includes('IV N-Acetylcysteine'));
      assert.ok(res.interventionEn.includes('N-Acetylcysteine'));
    });

    it('identifies Hepatic Encephalopathy and Asterixis requiring lactulose titration', () => {
      const res = evaluateLiverRisk({
        hasAsterixisOrSevereConfusion: true,
      });
      assert.strictEqual(res.tier, 'urgent_hepatic_encephalopathy');
      assert.strictEqual(res.isEmergency, true);
      assert.ok(res.titleEn.includes('Hepatic Encephalopathy'));
      assert.ok(res.actionEn.includes('lactulose'));
      assert.ok(res.interventionEn.includes('rifaximin'));
    });

    it('identifies Decompensated Child-Pugh C Cirrhosis with Subutex recommendation', () => {
      const res = evaluateLiverRisk({
        hasChildPughCDecompensatedCirrhosis: true,
      });
      assert.strictEqual(res.tier, 'severe_decompensated_cirrhosis');
      assert.strictEqual(res.isEmergency, false);
      assert.ok(res.titleEn.includes('Child-Pugh Class C'));
      assert.ok(res.actionEn.includes('Switch patient from Suboxone (buprenorphine/naloxone) to Subutex'));
      assert.ok(res.interventionEn.includes('Subutex'));
    });

    it('identifies Methadone Bioaccumulation Risk in Cirrhosis', () => {
      const res = evaluateLiverRisk({
        isTakingMethadoneWithCirrhosis: true,
      });
      assert.strictEqual(res.tier, 'warning_methadone_cirrhosis');
      assert.strictEqual(res.isEmergency, false);
      assert.ok(res.titleEn.includes('Methadone Bioaccumulation'));
      assert.ok(res.actionEn.includes('extended-release half-life') || res.actionEn.includes('serial 12-lead ECG'));
      assert.ok(res.interventionEn.includes('QTc interval'));
    });

    it('identifies Jaundice or Ascites as urgent symptomatic liver indicators', () => {
      const res = evaluateLiverRisk({
        hasAscitesOrAbdominalDistension: true,
      });
      assert.strictEqual(res.tier, 'urgent_liver_symptomatic');
      assert.strictEqual(res.isEmergency, false);
      assert.ok(res.titleEn.includes('Jaundice, Dark Urine or Abdominal Ascites'));
      assert.ok(res.actionEn.includes('Never take ibuprofen or naproxen'));
    });
  });

  describe('Zero-PII SBAR Clinical Handoff Note Generator', () => {
    it('generates structured English SBAR note containing situation, background, assessment, and directives', () => {
      const state = {
        hasHematemesisOrMelena: false,
        hasApapAboveRumackNomogram: true,
        hasIngestedToxicApapDose: true,
        hasAsterixisOrSevereConfusion: false,
        hasChildPughCDecompensatedCirrhosis: false,
        isTakingMethadoneWithCirrhosis: false,
        hasAscitesOrAbdominalDistension: false,
        hasJaundiceOrDarkBileUrine: true,
      };
      const evalRes = evaluateLiverRisk(state);
      const note = buildLiverSbarText(state, evalRes, 'en');

      assert.ok(note.includes('HEPATIC HEALTH, APAP TOXICOLOGY & MOUD CLINICAL SBAR HANDOFF NOTE'));
      assert.ok(note.includes('S (SITUATION):'));
      assert.ok(note.includes('B (BACKGROUND / HEPATIC & PHARMACOLOGIC RISK FACTORS):'));
      assert.ok(note.includes('A (CLINICAL ASSESSMENT):'));
      assert.ok(note.includes('R (RECOMMENDATIONS & THERAPEUTIC MANAGEMENT):'));
      assert.ok(note.includes('YES (INITIATE IV N-ACETYLCYSTEINE PROTOCOL)'));
      assert.ok(note.includes('Strict prohibition on NSAIDs'));
    });

    it('generates structured Spanish SBAR note with verified localized medical terminology', () => {
      const state = {
        hasHematemesisOrMelena: true,
        hasApapAboveRumackNomogram: false,
        hasIngestedToxicApapDose: false,
        hasAsterixisOrSevereConfusion: false,
        hasChildPughCDecompensatedCirrhosis: true,
        isTakingMethadoneWithCirrhosis: false,
        hasAscitesOrAbdominalDistension: false,
        hasJaundiceOrDarkBileUrine: false,
      };
      const evalRes = evaluateLiverRisk(state);
      const note = buildLiverSbarText(state, evalRes, 'es');

      assert.ok(note.includes('INFORME CLÍNICO SBAR: EVALUACIÓN HEPÁTICA, TOXICOLOGÍA Y MOUD'));
      assert.ok(note.includes('S (SITUACIÓN):'));
      assert.ok(note.includes('B (ANTECEDENTES / FACTORES DE RIESGO HEPÁTICOS Y FARMACOLÓGICOS):'));
      assert.ok(note.includes('A (EVALUACIÓN CLÍNICA):'));
      assert.ok(note.includes('R (RECOMENDACIONES Y GESTIÓN TERAPÉUTICA):'));
      assert.ok(note.includes('SÍ (EMERGENCIA CÓDIGO ROJO - SHOCK HIPOVOLÉMICO)'));
      assert.ok(note.includes('Prohibición absoluta de AINEs'));
    });
  });

  describe('In-RAM Ephemeral State Lifecycle', () => {
    it('manages state changes, subscriptions, and full reset without persistent storage', () => {
      resetLiverState();
      let state = getLiverState();
      assert.strictEqual(state.hasApapAboveRumackNomogram, false);
      assert.strictEqual(state.viewMode, 'community');
      assert.strictEqual(state.activeTab, 'triage');

      let notified = 0;
      const unsub = subscribeLiverState(() => {
        notified++;
      });

      setLiverState({
        hasApapAboveRumackNomogram: true,
        viewMode: 'clinical',
        activeTab: 'apap',
      });

      state = getLiverState();
      assert.strictEqual(state.hasApapAboveRumackNomogram, true);
      assert.strictEqual(state.viewMode, 'clinical');
      assert.strictEqual(state.activeTab, 'apap');
      assert.strictEqual(notified, 1);

      unsub();
      setLiverState({ hasAscitesOrAbdominalDistension: true });
      assert.strictEqual(notified, 1); // unsubscribed

      resetLiverState();
      state = getLiverState();
      assert.strictEqual(state.hasApapAboveRumackNomogram, false);
      assert.strictEqual(state.hasAscitesOrAbdominalDistension, false);
      assert.strictEqual(state.viewMode, 'community');
      assert.strictEqual(state.activeTab, 'triage');
    });
  });

  describe('DOM View Rendering & Interactive Controls', () => {
    it('renders liverCareView tree with WCAG accessibility semantics', () => {
      class MockElement {
        constructor(tag) {
          this.tagName = tag.toUpperCase();
          this.children = [];
          this.attributes = {};
          this.eventListeners = {};
          this.className = '';
        }
        setAttribute(k, v) { this.attributes[k] = v; }
        getAttribute(k) { return this.attributes[k]; }
        hasAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k); }
        appendChild(child) {
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
        click() {
          if (this.onclick) this.onclick({ preventDefault: () => {} });
        }
      }

      globalThis.Node = MockElement;
      globalThis.document = {
        createElement: (tag) => new MockElement(tag),
        createElementNS: (ns, tag) => new MockElement(tag),
        createTextNode: (txt) => ({ nodeType: 3, textContent: txt }),
      };

      resetLiverState();
      const el = liverCareView();
      assert.ok(el, 'Failed to render liverCareView');
      assert.strictEqual(el.tagName, 'DIV');
      assert.strictEqual(el.className, 'liver-care-view');

      // Test tab switches
      setLiverState({ activeTab: 'apap' });
      assert.strictEqual(getLiverState().activeTab, 'apap');

      setLiverState({ activeTab: 'cirrhosis' });
      assert.strictEqual(getLiverState().activeTab, 'cirrhosis');

      setLiverState({ activeTab: 'moud' });
      assert.strictEqual(getLiverState().activeTab, 'moud');

      setLiverState({ activeTab: 'harmReduction' });
      assert.strictEqual(getLiverState().activeTab, 'harmReduction');

      resetLiverState();
    });
  });

  describe('Static Code Privacy & Security Verification', () => {
    it('verifies 0 innerHTML, 0 outerHTML, 0 localStorage, and 0 eval in liverCare.js', () => {
      const code = fs.readFileSync('public/js/views/liverCare.js', 'utf8');

      assert.strictEqual(code.includes('innerHTML'), false, 'Found innerHTML in liverCare.js');
      assert.strictEqual(code.includes('outerHTML'), false, 'Found outerHTML in liverCare.js');
      assert.strictEqual(code.includes('localStorage'), false, 'Found localStorage in liverCare.js');
      assert.strictEqual(code.includes('sessionStorage'), false, 'Found sessionStorage in liverCare.js');
      assert.strictEqual(code.includes('document.cookie'), false, 'Found document.cookie in liverCare.js');
      assert.strictEqual(code.includes('eval('), false, 'Found eval() in liverCare.js');
    });
  });
});
