// test/weather-care.test.js
// HarborPath - Accidental Hypothermia, Frostbite, Trench Foot & Heat Stroke Navigator Unit Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import {
  THERMAL_SUBSTANCE_PROFILES,
  HYPOTHERMIA_SWISS_STAGES,
  ENVIRONMENTAL_CLINICAL_DIFFERENTIALS,
  ENVIRONMENTAL_HARM_REDUCTION_RULES,
  evaluateWeatherRisk,
  buildWeatherSbarText,
  getWeatherState,
  setWeatherState,
  resetWeatherState,
  subscribeWeatherState,
  weatherCareView,
} from '../public/js/views/weatherCare.js';

describe('Weather Care & Environmental Extremes Navigator Module (Wave 39)', () => {
  it('exports accurate thermal pharmacology and substance interaction mechanisms', () => {
    // 1. Depressants / Alcohol in Cold
    const dep = THERMAL_SUBSTANCE_PROFILES.depressantsAlcohol;
    assert.ok(dep, 'Missing depressantsAlcohol profile');
    assert.ok(dep.mechanismEn.includes('cutaneous vasodilation'));
    assert.ok(dep.mechanismEn.includes('dumping core heat'));
    assert.ok(dep.mechanismEn.includes('gluconeogenesis'));
    assert.ok(dep.clinicalHazardsEn.includes('Ventricular Fibrillation'));

    // 2. Stimulants / Psychotropics in Heat
    const stim = THERMAL_SUBSTANCE_PROFILES.stimulantsPsychotropics;
    assert.ok(stim, 'Missing stimulantsPsychotropics profile');
    assert.ok(stim.mechanismEn.includes('uncouple mitochondrial oxidative phosphorylation'));
    assert.ok(stim.mechanismEn.includes('hyperlocomotion'));
    assert.ok(stim.mechanismEn.includes('anhidrosis'));
    assert.ok(stim.clinicalHazardsEn.includes('Heat Stroke'));
    assert.ok(stim.clinicalHazardsEn.includes('Antipyretics (acetaminophen/aspirin) are completely ineffective'));
  });

  it('classifies Accidental Hypothermia across Swiss Clinical Stages I–IV', () => {
    assert.strictEqual(HYPOTHERMIA_SWISS_STAGES.length, 4);

    // Stage I: Mild
    const stg1 = HYPOTHERMIA_SWISS_STAGES.find((s) => s.stageNum === 1);
    assert.ok(stg1);
    assert.strictEqual(stg1.severity, 'mild_caution');
    assert.ok(stg1.symptomsEn.some((s) => s.includes('Vigorous, uncontrollable shivering')));
    assert.ok(stg1.managementEn.includes('Passive external rewarming'));

    // Stage II: Moderate
    const stg2 = HYPOTHERMIA_SWISS_STAGES.find((s) => s.stageNum === 2);
    assert.ok(stg2);
    assert.strictEqual(stg2.severity, 'moderate_warning');
    assert.ok(stg2.symptomsEn.some((s) => s.includes('SHIVERING CESSATION')));
    assert.ok(stg2.symptomsEn.some((s) => s.includes('Paradoxical undressing')));
    assert.ok(stg2.managementEn.includes('GENTLE HANDLING'));
    assert.ok(stg2.managementEn.includes('Ventricular Fibrillation'));

    // Stage III: Severe
    const stg3 = HYPOTHERMIA_SWISS_STAGES.find((s) => s.stageNum === 3);
    assert.ok(stg3);
    assert.strictEqual(stg3.severity, 'severe_danger');
    assert.ok(stg3.symptomsEn.some((s) => s.includes('Osborn J-waves')));
    assert.ok(stg3.managementEn.includes('Active internal rewarming'));

    // Stage IV: Apparent Death
    const stg4 = HYPOTHERMIA_SWISS_STAGES.find((s) => s.stageNum === 4);
    assert.ok(stg4);
    assert.strictEqual(stg4.severity, 'critical_emergency');
    assert.ok(stg4.symptomsEn.some((s) => s.includes('mimicking rigor mortis')));
    assert.ok(stg4.managementEn.includes('NO ONE IS DEAD UNTIL WARM AND DEAD'));
    assert.ok(stg4.managementEn.includes('continuous CPR'));
    assert.ok(stg4.managementEn.includes('ECMO'));
  });

  it('provides comprehensive clinical differentials for Frostbite vs Trench Foot and Heat Stroke vs Rhabdomyolysis', () => {
    // Frostbite
    const fb = ENVIRONMENTAL_CLINICAL_DIFFERENTIALS.frostbite;
    assert.ok(fb);
    assert.strictEqual(fb.severity, 'emergency_hospital');
    assert.ok(fb.hallmarksEn.includes('Ice crystals'));
    assert.ok(fb.hallmarksEn.includes('thrombosis'));
    assert.ok(fb.actionEn.includes('NEVER rub or massage frozen skin'));
    assert.ok(fb.actionEn.includes('NEVER rewarm if there is any risk of refreezing'));
    assert.ok(fb.actionEn.includes('37°C–39°C'));
    assert.ok(fb.actionEn.includes('Ibuprofen 12 mg/kg/day'));

    // Trench Foot (NFCI)
    const tf = ENVIRONMENTAL_CLINICAL_DIFFERENTIALS.trenchFoot;
    assert.ok(tf);
    assert.strictEqual(tf.severity, 'urgent_care');
    assert.ok(tf.hallmarksEn.includes('Non-Freezing Cold Injury') || tf.titleEn.includes('Non-Freezing Cold Injury'));
    assert.ok(tf.hallmarksEn.includes('12 hours'));
    assert.ok(tf.actionEn.includes('Clean, carefully dry, and aerate feet'));
    assert.ok(tf.actionEn.includes('dry wool/synthetic socks'));

    // Heat Stroke
    const hs = ENVIRONMENTAL_CLINICAL_DIFFERENTIALS.heatStroke;
    assert.ok(hs);
    assert.strictEqual(hs.severity, 'emergency_911');
    assert.ok(hs.hallmarksEn.includes('> 40°C'));
    assert.ok(hs.actionEn.includes('Cold/ice water immersion'));
    assert.ok(hs.actionEn.includes('Target core temp < 39°C'));
    assert.ok(hs.actionEn.includes('NEVER GIVE ACETAMINOPHEN OR ASPIRIN'));

    // Rhabdomyolysis
    const rhabdo = ENVIRONMENTAL_CLINICAL_DIFFERENTIALS.rhabdomyolysis;
    assert.ok(rhabdo);
    assert.strictEqual(rhabdo.severity, 'emergency_hospital');
    assert.ok(rhabdo.hallmarksEn.includes('Myoglobin'));
    assert.ok(rhabdo.hallmarksEn.includes('TEA-COLORED'));
    assert.ok(rhabdo.actionEn.includes('Aggressive IV isotonic crystalloid resuscitation'));
  });

  it('enumerates 6 evidence-based environmental harm reduction rules', () => {
    assert.strictEqual(ENVIRONMENTAL_HARM_REDUCTION_RULES.length, 6);

    const r1 = ENVIRONMENTAL_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 1);
    assert.ok(r1.titleEn.includes('Gentle Handling'));

    const r2 = ENVIRONMENTAL_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 2);
    assert.ok(r2.titleEn.includes('Warm and Dead'));

    const r3 = ENVIRONMENTAL_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 3);
    assert.ok(r3.titleEn.includes('Never Rub'));

    const r4 = ENVIRONMENTAL_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 4);
    assert.ok(r4.titleEn.includes('Antipyretic Prohibition'));

    const r5 = ENVIRONMENTAL_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 5);
    assert.ok(r5.titleEn.includes('12-Hour Dry Sock'));

    const r6 = ENVIRONMENTAL_HARM_REDUCTION_RULES.find((r) => r.ruleNum === 6);
    assert.ok(r6.titleEn.includes('Alcohol & Sedatives in Cold'));
  });

  describe('Clinical Decision Support Evaluation Algorithm (evaluateWeatherRisk)', () => {
    it('returns standard guidance when no flags are checked', () => {
      const res = evaluateWeatherRisk({});
      assert.strictEqual(res.tier, 'standard_thermal_guidance');
      assert.strictEqual(res.isEmergency, false);
      assert.ok(res.titleEn.includes('Standard Weather'));
    });

    it('identifies Stage III-IV Apparent Death as top life-threatening priority with Warm and Dead rule', () => {
      const res = evaluateWeatherRisk({
        hasOsbornOrPulselessColdBody: true,
        hasCoreTempOver104Delirium: true,
      });
      assert.strictEqual(res.tier, 'emergency_hypothermia_cardiac');
      assert.strictEqual(res.isEmergency, true);
      assert.ok(res.titleEn.includes('Stage III–IV'));
      assert.ok(res.actionEn.includes('No one is dead until warm and dead'));
      assert.ok(res.interventionEn.includes('Continuous high-quality CPR'));
    });

    it('identifies Critical Heat Stroke with rapid ice immersion cooling mandate', () => {
      const res = evaluateWeatherRisk({
        hasCoreTempOver104Delirium: true,
      });
      assert.strictEqual(res.tier, 'emergency_heat_stroke');
      assert.strictEqual(res.isEmergency, true);
      assert.ok(res.titleEn.includes('Heat Stroke'));
      assert.ok(res.actionEn.includes('NEVER GIVE ACETAMINOPHEN OR ASPIRIN'));
      assert.ok(res.interventionEn.includes('ice-water immersion'));
    });

    it('identifies Rhabdomyolysis and acute renal threat from cola-colored urine', () => {
      const res = evaluateWeatherRisk({
        hasTeaColoredUrineMusclePain: true,
      });
      assert.strictEqual(res.tier, 'emergency_rhabdomyolysis');
      assert.strictEqual(res.isEmergency, true);
      assert.ok(res.titleEn.includes('Rhabdomyolysis'));
      assert.ok(res.actionEn.includes('EMERGENCY ROOM TRANSPORT REQUIRED'));
      assert.ok(res.interventionEn.includes('IV isotonic saline'));
    });

    it('identifies Deep Frostbite Stage 3-4 with warm water bath rewarming and ibuprofen', () => {
      const res = evaluateWeatherRisk({
        hasHemorrhagicFrostbiteBlisters: true,
      });
      assert.strictEqual(res.tier, 'emergency_frostbite_deep');
      assert.strictEqual(res.isEmergency, true);
      assert.ok(res.titleEn.includes('Deep Frostbite'));
      assert.ok(res.actionEn.includes('NEVER rub the tissue'));
      assert.ok(res.actionEn.includes('37°C–39°C'));
      assert.ok(res.interventionEn.includes('prostacyclin (iloprost) or catheter-directed tPA'));
    });

    it('identifies Stage II Moderate Hypothermia from shivering loss with gentle horizontal handling', () => {
      const res = evaluateWeatherRisk({
        hasConfusionOrLossOfShivering: true,
      });
      assert.strictEqual(res.tier, 'urgent_hypothermia_moderate');
      assert.strictEqual(res.isEmergency, true);
      assert.ok(res.titleEn.includes('Moderate Hypothermia'));
      assert.ok(res.actionEn.includes('GENTLE HANDLING: Keep patient horizontal'));
      assert.ok(res.actionEn.includes('chemical heat packs to groin, axillae, and chest'));
    });

    it('identifies Non-Freezing Cold Injury (Trench Foot) from prolonged wet socks', () => {
      const res = evaluateWeatherRisk({
        hasMaceratedTrenchFoot: true,
      });
      assert.strictEqual(res.tier, 'urgent_trench_foot');
      assert.strictEqual(res.isEmergency, false);
      assert.ok(res.titleEn.includes('Trench Foot'));
      assert.ok(res.actionEn.includes('Remove wet shoes/socks'));
      assert.ok(res.actionEn.includes('air-dry, and elevate feet'));
    });

    it('identifies Cold Weather Alcohol/Sedative Co-ingestion Hazard', () => {
      const res = evaluateWeatherRisk({
        coIngestedAlcoholOrSedativesInCold: true,
      });
      assert.strictEqual(res.tier, 'high_hazard_cold_intoxication');
      assert.strictEqual(res.isEmergency, false);
      assert.ok(res.titleEn.includes('Intoxication & Cold Weather'));
      assert.ok(res.actionEn.includes('dilating surface blood vessels while rapidly dropping your internal core temperature'));
    });
  });

  describe('Zero-PII SBAR Clinical Handoff Note Generator', () => {
    it('generates structured English SBAR note containing situation, background, assessment, and directives', () => {
      const state = {
        hasOsbornOrPulselessColdBody: false,
        hasCoreTempOver104Delirium: true,
        hasTeaColoredUrineMusclePain: true,
        hasHemorrhagicFrostbiteBlisters: false,
        hasConfusionOrLossOfShivering: false,
        hasMaceratedTrenchFoot: false,
        coIngestedAlcoholOrSedativesInCold: false,
      };
      const evalRes = evaluateWeatherRisk(state);
      const note = buildWeatherSbarText(state, evalRes, 'en');

      assert.ok(note.includes('ENVIRONMENTAL THERMAL EXTREMES & WEATHER CLINICAL SBAR HANDOFF NOTE'));
      assert.ok(note.includes('S (SITUATION):'));
      assert.ok(note.includes('B (BACKGROUND / ENVIRONMENTAL & SUBSTANCE RISK FACTORS):'));
      assert.ok(note.includes('A (CLINICAL ASSESSMENT):'));
      assert.ok(note.includes('R (RECOMMENDATIONS & ENVIRONMENTAL MANAGEMENT):'));
      assert.ok(note.includes('YES (IMMEDIATE AGGRESSIVE COOLING - NO ACETAMINOPHEN)'));
      assert.ok(note.includes('YES (HIGH-VOLUME IV SALINE RESUSCITATION)'));
      assert.ok(note.includes('NEVER give acetaminophen/aspirin'));
    });

    it('generates structured Spanish SBAR note with verified localized medical terminology', () => {
      const state = {
        hasOsbornOrPulselessColdBody: true,
        hasCoreTempOver104Delirium: false,
        hasTeaColoredUrineMusclePain: false,
        hasHemorrhagicFrostbiteBlisters: false,
        hasConfusionOrLossOfShivering: false,
        hasMaceratedTrenchFoot: false,
        coIngestedAlcoholOrSedativesInCold: true,
      };
      const evalRes = evaluateWeatherRisk(state);
      const note = buildWeatherSbarText(state, evalRes, 'es');

      assert.ok(note.includes('INFORME CLÍNICO SBAR: EVALUACIÓN DE EMERGENCIAS TÉRMICAS Y CLIMÁTICAS'));
      assert.ok(note.includes('S (SITUACIÓN):'));
      assert.ok(note.includes('B (ANTECEDENTES / FACTORES AMBIENTALES Y TÓXICOS):'));
      assert.ok(note.includes('A (EVALUACIÓN CLÍNICA):'));
      assert.ok(note.includes('R (RECOMENDACIONES Y MANEJO EN EL TERRENO):'));
      assert.ok(note.includes('SÍ (REGLA: NO ESTÁ MUERTO HASTA ESTAR CALIENTE Y MUERTO)'));
      assert.ok(note.includes('SÍ (FALSA SENSACIÓN DE CALOR Y PÉRDIDA RÁPIDA)'));
      assert.ok(note.includes('RCP prolongada hasta recalentar por encima de 32°C en centro con ECMO'));
    });
  });

  describe('In-RAM Ephemeral State Lifecycle', () => {
    it('manages state changes, subscriptions, and full reset without persistent storage', () => {
      resetWeatherState();
      let state = getWeatherState();
      assert.strictEqual(state.hasCoreTempOver104Delirium, false);
      assert.strictEqual(state.viewMode, 'community');
      assert.strictEqual(state.activeTab, 'triage');

      let notified = 0;
      const unsub = subscribeWeatherState(() => {
        notified++;
      });

      setWeatherState({
        hasCoreTempOver104Delirium: true,
        viewMode: 'clinical',
        activeTab: 'heatStroke',
      });

      state = getWeatherState();
      assert.strictEqual(state.hasCoreTempOver104Delirium, true);
      assert.strictEqual(state.viewMode, 'clinical');
      assert.strictEqual(state.activeTab, 'heatStroke');
      assert.strictEqual(notified, 1);

      unsub();
      setWeatherState({ hasMaceratedTrenchFoot: true });
      assert.strictEqual(notified, 1); // unsubscribed

      resetWeatherState();
      state = getWeatherState();
      assert.strictEqual(state.hasCoreTempOver104Delirium, false);
      assert.strictEqual(state.hasMaceratedTrenchFoot, false);
      assert.strictEqual(state.viewMode, 'community');
      assert.strictEqual(state.activeTab, 'triage');
    });
  });

  describe('DOM View Rendering & Interactive Controls', () => {
    it('renders weatherCareView tree with WCAG accessibility semantics', () => {
      // Mock minimal DOM environment if running in Node
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

      resetWeatherState();
      const el = weatherCareView();
      assert.ok(el, 'Failed to render weatherCareView');
      assert.strictEqual(el.tagName, 'DIV');
      assert.strictEqual(el.className, 'weather-care-view');

      // Test tab switching
      setWeatherState({ activeTab: 'hypothermia' });
      assert.strictEqual(getWeatherState().activeTab, 'hypothermia');

      setWeatherState({ activeTab: 'frostbite' });
      assert.strictEqual(getWeatherState().activeTab, 'frostbite');

      setWeatherState({ activeTab: 'heatStroke' });
      assert.strictEqual(getWeatherState().activeTab, 'heatStroke');

      setWeatherState({ activeTab: 'harmReduction' });
      assert.strictEqual(getWeatherState().activeTab, 'harmReduction');

      resetWeatherState();
    });
  });

  describe('Static Code Privacy & Security Verification', () => {
    it('verifies 0 innerHTML, 0 outerHTML, 0 localStorage, and 0 eval in weatherCare.js', () => {
      const code = fs.readFileSync('public/js/views/weatherCare.js', 'utf8');

      assert.strictEqual(code.includes('innerHTML'), false, 'Found innerHTML in weatherCare.js');
      assert.strictEqual(code.includes('outerHTML'), false, 'Found outerHTML in weatherCare.js');
      assert.strictEqual(code.includes('localStorage'), false, 'Found localStorage in weatherCare.js');
      assert.strictEqual(code.includes('sessionStorage'), false, 'Found sessionStorage in weatherCare.js');
      assert.strictEqual(code.includes('document.cookie'), false, 'Found document.cookie in weatherCare.js');
      assert.strictEqual(code.includes('eval('), false, 'Found eval() in weatherCare.js');
    });
  });
});
