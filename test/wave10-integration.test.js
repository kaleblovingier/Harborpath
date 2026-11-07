/**
 * Wave 10 Architecture, Clinical Systems & Multi-Module Integration Suite (test/wave10-integration.test.js)
 *
 * Verifies end-to-end coherence across all Wave 10 additions:
 * 1. Indigenous & Tribal Health Specialist (public/js/views/tribalHealth.js)
 * 2. LGBTQ+ & Gender-Affirming SUD Care Specialist (public/js/views/lgbtqCare.js)
 * 3. Wound Care & Infectious Disease Harm Reduction Specialist (public/js/views/woundInfectious.js)
 * 4. Safety-Net Navigator & Telehealth Access Component (public/js/components/safetyNetNavigator.js)
 * 5. Platform Hotlines Enhancement (StrongHearts Native Helpline) (public/js/content/hotlines.js)
 * 6. Application Shell Routing, Lazy Loading & Quick Exit Integration (public/js/app.js)
 * 7. Bilingual Parity (es.js) & Service Worker Elective Precache (sw.js)
 * 8. Static Security, CSP Parity & Ephemeral In-RAM Privacy Compliance
 */

import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// 1. Indigenous & Tribal Health
import {
  TRIBAL_HEALTH_STATUTES,
  IHS_PRC_PRIORITY_LEVELS,
  PRC_NOTIFICATION_TIMELINES,
  CULTURALLY_GROUNDED_PRACTICES,
  evaluateTribalHealthPlan,
  getTribalHealthState,
  setTribalHealthState,
  resetTribalHealthState,
  formatTribalHealthSummaryText,
  tribalHealthView,
} from '../public/js/views/tribalHealth.js';

// 2. LGBTQ+ & Gender-Affirming SUD Care
import {
  LGBTQ_CARE_STANDARDS,
  HRT_MOUD_SAFETY_INTERACTIONS,
  CHEMSEX_HARM_REDUCTION_PROTOCOLS,
  evaluateLgbtqCarePathway,
  getLgbtqState,
  setLgbtqState,
  resetLgbtqState,
  formatLgbtqSummaryText,
  lgbtqCareView,
} from '../public/js/views/lgbtqCare.js';

// 3. Wound Care & Infectious Disease
import {
  WOUND_CARE_PROTOCOLS,
  INFECTION_RED_FLAGS,
  HEPATITIS_DAA_STANDARDS,
  VEIN_CARE_PRINCIPLES,
  evaluateWoundInfectiousRisk,
  getWoundState,
  setWoundState,
  resetWoundState,
  formatWoundSummaryText,
  woundInfectiousView,
} from '../public/js/views/woundInfectious.js';

// 4. Safety-Net Navigator & Telehealth
import {
  FEDERAL_SAFETY_NET_PROGRAMS,
  FPL_2026_GUIDELINES,
  getFplThreshold,
  SLIDING_FEE_TIERS,
  evaluateSafetyNetEligibility,
  getSafetyNetState,
  setSafetyNetState,
  resetSafetyNetState,
  formatSafetyNetSummaryText,
  safetyNetNavigatorComponent,
} from '../public/js/components/safetyNetNavigator.js';

// 5. Hotlines
import { HOTLINES, hotlinesById } from '../public/js/content/hotlines.js';

// 6. App Shell & Routing
import {
  LAZY_LOADERS,
  ROUTE_TITLES,
  preloadAllLazyViews,
  runQuickExitResets,
} from '../public/js/app.js';

import esTranslations from '../public/js/locales/es.js';

class MockNode {
  constructor(tagName) {
    this.tagName = tagName ? tagName.toUpperCase() : '#TEXT';
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.className = '';
    this.dataset = {};
    this._textContent = '';
    this.parent = null;
    this.checked = false;
    this.value = '';
    this.id = '';
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(val) {
    this._textContent = String(val ?? '');
    this.children = [];
  }

  setAttribute(k, v) {
    this.attributes[k] = String(v);
  }

  getAttribute(k) {
    return this.attributes[k] ?? null;
  }

  removeAttribute(k) {
    delete this.attributes[k];
  }

  addEventListener(event, fn) {
    this.listeners[event] = fn;
  }

  dispatchEvent(event, data = {}) {
    const fn = this.listeners[event];
    if (typeof fn === 'function') fn({ target: this, ...data });
  }

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string' || typeof item === 'number') {
        const textNode = new MockNode('#text');
        textNode._textContent = String(item);
        textNode.parent = this;
        this.children.push(textNode);
      } else if (item instanceof MockNode) {
        item.parent = this;
        this.children.push(item);
      }
    }
  }

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx !== -1) this.parent.children.splice(idx, 1);
    this.parent = null;
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const matches = [];
    const walk = (node) => {
      if (node instanceof MockNode) {
        if (selector === 'button' && node.tagName === 'BUTTON') matches.push(node);
        else if (selector === 'a' && node.tagName === 'A') matches.push(node);
        else if (selector === 'select' && node.tagName === 'SELECT') matches.push(node);
        else if (selector.startsWith('#') && node.attributes.id === selector.slice(1)) matches.push(node);
        else if (selector.startsWith('.') && node.className && node.className.split(/\s+/).includes(selector.slice(1))) matches.push(node);
        for (const child of node.children) {
          if (child instanceof MockNode) walk(child);
        }
      }
    };
    walk(this);
    return matches;
  }
}

if (!globalThis.Node) {
  globalThis.Node = MockNode;
}

if (!globalThis.document) {
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: () => null,
    createTextNode: (text) => {
      const node = new MockNode('#text');
      node._textContent = String(text);
      return node;
    },
    createDocumentFragment: () => new MockNode('fragment'),
    body: new MockNode('body'),
  };
}

describe('Wave 10 Architecture, Clinical Systems & Multi-Module Integration Suite', () => {
  beforeEach(() => {
    resetTribalHealthState();
    resetLgbtqState();
    resetWoundState();
    resetSafetyNetState();
  });

  test('1. App Shell Route Registry & Preloader Parity for Wave 10 Modules', async () => {
    // 1. Verify lazy loader registrations
    assert.ok(LAZY_LOADERS['tribal-health'], 'tribal-health view loader must be registered in LAZY_LOADERS');
    assert.ok(LAZY_LOADERS['lgbtq-care'], 'lgbtq-care view loader must be registered in LAZY_LOADERS');
    assert.ok(LAZY_LOADERS['wound-care'], 'wound-care view loader must be registered in LAZY_LOADERS');

    // 2. Verify lazy loading functions resolve valid views
    const loadedTribal = await LAZY_LOADERS['tribal-health']();
    assert.equal(typeof loadedTribal, 'function', 'tribal-health loader must resolve a function');

    const loadedLgbtq = await LAZY_LOADERS['lgbtq-care']();
    assert.equal(typeof loadedLgbtq, 'function', 'lgbtq-care loader must resolve a function');

    const loadedWound = await LAZY_LOADERS['wound-care']();
    assert.equal(typeof loadedWound, 'function', 'wound-care loader must resolve a function');

    // 3. Verify route titles in English and Spanish parity
    assert.ok(ROUTE_TITLES['tribal-health'], 'ROUTE_TITLES must have tribal-health');
    assert.ok(ROUTE_TITLES['lgbtq-care'], 'ROUTE_TITLES must have lgbtq-care');
    assert.ok(ROUTE_TITLES['wound-care'], 'ROUTE_TITLES must have wound-care');

    assert.equal(typeof ROUTE_TITLES['tribal-health'](), 'string');
    assert.equal(typeof ROUTE_TITLES['lgbtq-care'](), 'string');
    assert.equal(typeof ROUTE_TITLES['wound-care'](), 'string');

    assert.ok(esTranslations['route.tribalHealth'], 'Spanish route title for tribalHealth must be defined');
    assert.ok(esTranslations['route.lgbtqCare'], 'Spanish route title for lgbtqCare must be defined');
    assert.ok(esTranslations['route.woundCare'], 'Spanish route title for woundCare must be defined');

    // 4. Verify preloadAllLazyViews resolves cleanly
    await preloadAllLazyViews();
  });

  test('2. Quick Exit (Esc x2) Deterministic State Wipe Across All 4 Wave 10 Modules', async () => {
    // Mutate state in all 4 modules
    setTribalHealthState({
      affiliation: 'urban_indian_off_reservation',
      activeTab: 'prc_rules',
    });
    setLgbtqState({
      genderIdentity: 'cisgender_gay_bi',
      takingHrt: false,
      chemsexSubstances: ['poppers', 'ghb_gbl'],
      activeTab: 'chemsex',
    });
    setWoundState({
      woundAppearance: 'crepitus_severe_pain_bullae',
      systemicSymptoms: ['fever_chills', 'confusion_delirium'],
      activeTab: 'red_flags',
    });
    setSafetyNetState({
      householdSize: 4,
      annualIncome: 35000,
      activeTab: 'checklist',
    });

    // Verify mutations took effect
    assert.equal(getTribalHealthState().affiliation, 'urban_indian_off_reservation');
    assert.equal(getLgbtqState().genderIdentity, 'cisgender_gay_bi');
    assert.equal(getWoundState().woundAppearance, 'crepitus_severe_pain_bullae');
    assert.equal(getSafetyNetState().householdSize, 4);

    // Execute runQuickExitResets
    runQuickExitResets();

    // Allow dynamic import promises to settle
    await new Promise((r) => setTimeout(r, 60));

    // Verify all 4 states reset to pristine defaults
    const tribalAfter = getTribalHealthState();
    assert.equal(tribalAfter.affiliation, 'federally_recognized_tribe');
    assert.equal(tribalAfter.activeTab, 'decision_aid');

    const lgbtqAfter = getLgbtqState();
    assert.equal(lgbtqAfter.genderIdentity, 'transgender_woman');
    assert.equal(lgbtqAfter.activeTab, 'decision_aid');

    const woundAfter = getWoundState();
    assert.equal(woundAfter.woundAppearance, 'necrotic_slough');
    assert.equal(woundAfter.activeTab, 'decision_aid');

    const safetyNetAfter = getSafetyNetState();
    assert.equal(safetyNetAfter.householdSize, 1);
    assert.equal(safetyNetAfter.activeTab, 'calculator');
  });

  test('3. Indigenous & Tribal Health: Medicaid § 1916(j) and PRC Notification Windows', () => {
    const plan = evaluateTribalHealthPlan({
      affiliation: 'urban_indian_off_reservation',
      locationType: 'urban_city',
      facilityAccess: 'urban_indian_health_center',
      medicaidStatus: 'active',
      emergencyVisitPast72h: true,
      isElderOrDisabled: false,
      hasFamilyChildren: true,
    });

    assert.strictEqual(plan.costSharingProtection.isExempt, true);
    assert.match(plan.costSharingProtection.statute, /1916\(j\)/);
    assert.ok(plan.prcAdvice !== null, 'Must calculate PRC guidance');
    assert.match(plan.prcAdvice.title.en, /72 hours/);
    assert.ok(plan.icwaAdvice !== null, 'Must provide ICWA active efforts guidance when minor children are present');
    assert.ok(plan.culturalPractices.length >= 4, 'Must include traditional healing harmony guidance');

    const text = formatTribalHealthSummaryText(plan, 'en');
    assert.match(text, /INDIGENOUS & TRIBAL HEALTH CARE PLAN/);
    assert.match(text, /StrongHearts Native Helpline.*1-844-762-8483/);
  });

  test('4. LGBTQ+ Care: Fatal Popper + PDE5 Inhibitor Warning & HRT Continuity', () => {
    const plan = evaluateLgbtqCarePathway({
      genderIdentity: 'transgender_man',
      takingHrt: true,
      chemsexSubstances: ['poppers', 'methamphetamine'],
      usingPde5Inhibitors: true,
      moudInterest: 'buprenorphine',
      seekingResidential: true,
    });

    // Fatal interaction alert
    const criticalAlert = plan.alerts.find((a) => a.priority === 'critical');
    assert.ok(criticalAlert, 'Must detect critical poppers + PDE5 alert');
    assert.match(criticalAlert.text.en, /irreversible vasodilation/i);

    // HRT continuity advice
    assert.ok(plan.hrtAdvice);
    assert.match(plan.hrtAdvice.detail.en, /WPATH SOC 8/);

    // ACA § 1557 residential facility trans rights
    assert.ok(plan.residentialAdvice);
    assert.match(plan.residentialAdvice.title.en, /ACA § 1557/);

    const summary = formatLgbtqSummaryText(plan, 'es');
    assert.match(summary, /PLAN CLÍNICO Y DE REDUCCIÓN DE DAÑOS LGBTQ\+/);
    assert.match(summary, /The Trevor Project.*1-866-488-7386/);
    assert.match(summary, /Trans Lifeline.*1-877-565-8860/);
  });

  test('5. Wound Care Harm Reduction: Necrotizing Fasciitis, Endocarditis & Non-Cytotoxic Protocols', () => {
    const risk = evaluateWoundInfectiousRisk({
      woundPresent: true,
      woundAppearance: 'crepitus_severe_pain_bullae',
      systemicSymptoms: ['fever_chills', 'night_sweats'],
      injectionPractices: ['reusing_cottons'],
      hepatitisCStatus: 'positive_untreated',
    });

    // Escalation to emergency_911
    assert.equal(risk.emergencyStatus, 'emergency_911');
    assert.ok(risk.emergencyReasons.some((r) => r.condition === 'necrotizing_fasciitis'));

    // Endocarditis screening alert
    assert.ok(risk.endocarditisAlert);
    assert.match(risk.endocarditisAlert.detail.en, /echocardiogram/i);

    // Non-cytotoxic dressing protocol
    assert.ok(risk.dressingPlan.some((d) => d.stepId === 'avoid_cytotoxics'));

    // AASLD universal HCV access
    assert.ok(risk.hcvAdvice);
    assert.match(risk.hcvAdvice.detail.en, />95% cure rate/);

    const text = formatWoundSummaryText(risk, 'en');
    assert.match(text, /WOUND CARE & INFECTIOUS DISEASE CLINICAL PLAN/);
    assert.match(text, /EMERGENCY_911/);
  });

  test('6. Safety-Net Navigator: FQHC § 330 Sliding Fee, Zero-Income Affidavit & EMTALA', () => {
    const plan = evaluateSafetyNetEligibility({
      householdSize: 3,
      annualIncome: 0,
      stateCode: 'US',
      seekingConfidentiality: true,
      interestedInTelehealth: true,
    });

    assert.equal(plan.fplPercentage, 0);
    assert.equal(plan.matchedTier.id, 'nominal_tier');
    assert.ok(plan.documentationChecklist.some((d) => d.item.en.includes('Zero-Income Self-Attestation')));
    assert.ok(plan.statutoryGuidance.some((g) => g.title.en.includes('Title X Confidential Rating')));
    assert.ok(plan.statutoryGuidance.some((g) => g.title.en.includes('Tele-MOUD Access')));

    const text = formatSafetyNetSummaryText(plan, 'es');
    assert.match(text, /PLAN DE ACCESO A RED DE SEGURIDAD Y FQHC/);
    assert.match(text, /SAMHSA: 1-800-662-4357/);
  });

  test('7. Hotlines Directory: StrongHearts Native Helpline Integration', () => {
    const stronghearts = HOTLINES.communities.find((h) => h.id === 'stronghearts');
    assert.ok(stronghearts, 'StrongHearts Helpline must be present in HOTLINES.communities');
    assert.equal(stronghearts.call.number, '18447628483');
    assert.equal(stronghearts.call.label, '1-844-762-8483');
    assert.equal(stronghearts.web, 'https://strongheartshelpline.org/');

    const retrieved = hotlinesById('stronghearts');
    assert.equal(retrieved.length, 1);
    assert.equal(retrieved[0].name, 'StrongHearts Native Helpline');
  });

  test('8. Service Worker Elective Precache Parity', () => {
    const swPath = join(process.cwd(), 'public', 'sw.js');
    const swContent = readFileSync(swPath, 'utf8');

    assert.ok(swContent.includes("'/js/views/tribalHealth.js'"), 'sw.js must cache tribalHealth.js');
    assert.ok(swContent.includes("'/js/views/lgbtqCare.js'"), 'sw.js must cache lgbtqCare.js');
    assert.ok(swContent.includes("'/js/views/woundInfectious.js'"), 'sw.js must cache woundInfectious.js');
    assert.ok(swContent.includes("'/js/components/safetyNetNavigator.js'"), 'sw.js must cache safetyNetNavigator.js');
  });

  test('9. Static Security & Zero-Storage Audit Across All Wave 10 Modules', () => {
    const files = [
      join(process.cwd(), 'public', 'js', 'views', 'tribalHealth.js'),
      join(process.cwd(), 'public', 'js', 'views', 'lgbtqCare.js'),
      join(process.cwd(), 'public', 'js', 'views', 'woundInfectious.js'),
      join(process.cwd(), 'public', 'js', 'components', 'safetyNetNavigator.js'),
    ];

    const BANNED_PATTERNS = [
      /saved to disk/i,
      /erases? everything/i,
      /zero[- ]knowledge/i,
      /does not record search terms/i,
      /never stored/i,
      /nothing is logged/i,
      /100% private/i,
      /\bse borra todo\b/i,
      /nunca se guarda/i,
      /se guardan? en el disco/i,
      /nada se registra/i,
      /100 % privad/i,
    ];

    for (const filePath of files) {
      const source = readFileSync(filePath, 'utf8');
      assert.doesNotMatch(source, /\b(localStorage|sessionStorage|indexedDB)\b/, `${filePath} must not touch storage`);
      assert.doesNotMatch(source, /\bdocument\.cookie\b/, `${filePath} must not touch cookies`);
      assert.doesNotMatch(source, /\bfetch\s*\(/, `${filePath} must run 100% ephemeral in RAM`);
      assert.doesNotMatch(source, /\b(innerHTML|outerHTML|insertAdjacentHTML)\b/, `${filePath} must not use string DOM injection`);
      assert.doesNotMatch(source, /\bstyle\s*=/, `${filePath} must not contain inline style= attributes`);

      for (const pat of BANNED_PATTERNS) {
        assert.doesNotMatch(source, pat, `${filePath} must not contain banned privacy claim: ${pat}`);
      }
    }
  });
});
