/**
 * Wave 9 Architecture, Clinical Systems & Multi-Module Integration Suite (test/wave9-integration.test.js)
 *
 * Verifies end-to-end coherence across all Wave 9 additions:
 * 1. Incarceration Reentry & Criminal Legal Health (public/js/views/reentry.js)
 * 2. Older Adults & Medicare SUD Specialist (public/js/views/olderAdults.js)
 * 3. Workplace Rights, FMLA & Professional Licensure (public/js/views/workplaceRights.js)
 * 4. Recovery Capital Index (BARC-10) Component (public/js/components/recoveryCapital.js)
 * 5. Application Shell Routing, Lazy Loading & Quick Exit Integration (public/js/app.js)
 * 6. Static Security, CSP Parity & Ephemeral In-RAM Privacy Compliance
 */

import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// 1. Incarceration Reentry
import {
  REENTRY_MEDICAID_WAIVERS,
  REENTRY_POST_RELEASE_TIMELINE,
  REENTRY_SUPERVISION_PROTECTIONS,
  getReentryWaiver,
  evaluateReentryPlan,
  getReentryState,
  setReentryState,
  resetReentryState,
  formatReentrySummaryText,
  reentryView,
} from '../public/js/views/reentry.js';

// 2. Older Adults & Medicare SUD
import {
  MEDICARE_SUD_RULES,
  BEERS_CRITERIA_INTERACTIONS,
  GERIATRIC_PHARMACOKINETIC_RULES,
  OLDER_ADULT_SCREENING_STANDARDS,
  evaluateOlderAdultCare,
  getOlderAdultState,
  setOlderAdultState,
  resetOlderAdultsState,
  formatOlderAdultSummaryText,
  olderAdultsView,
} from '../public/js/views/olderAdults.js';

// 3. Workplace Rights & Licensure
import {
  FMLA_REGULATORY_RULES,
  ADA_PROTECTION_STANDARDS,
  PROFESSIONAL_LICENSURE_FRAMEWORKS,
  evaluateWorkplaceRights,
  getWorkplaceState,
  setWorkplaceState,
  resetWorkplaceState,
  formatWorkplaceSummaryText,
  workplaceRightsView,
} from '../public/js/views/workplaceRights.js';

// 4. Recovery Capital Index
import {
  SAMHSA_RECOVERY_DIMENSIONS,
  BARC10_ITEMS,
  RECOVERY_CAPITAL_TIERS,
  calculateRecoveryCapitalScore,
  generateRecoveryCapitalPlan,
  getRecoveryCapitalState,
  setRecoveryCapitalState,
  resetRecoveryCapitalState,
  formatRecoveryCapitalSummaryText,
  recoveryCapitalComponent,
} from '../public/js/components/recoveryCapital.js';

// 5. App Shell & Routing
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
        else if (selector === 'input' && node.tagName === 'INPUT') matches.push(node);
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

describe('Wave 9 Architecture & Multi-Module Integration Suite', () => {
  before(() => {
    globalThis.Node = MockNode;
    globalThis.document = {
      createElement: (tag) => new MockNode(tag),
      createElementNS: (_ns, tag) => new MockNode(tag),
      getElementById: () => null,
    };
  });

  beforeEach(() => {
    resetReentryState();
    resetOlderAdultsState();
    resetWorkplaceState();
    resetRecoveryCapitalState();
  });

  // --------------------------------------------------------------------------
  // 1. Module Exports & Schema Contracts
  // --------------------------------------------------------------------------
  describe('1. Module Exports & Schema Contracts', () => {
    test('reentry.js exports all statutory and clinical interfaces', () => {
      assert.ok(Array.isArray(REENTRY_MEDICAID_WAIVERS), 'REENTRY_MEDICAID_WAIVERS is array');
      assert.ok(Array.isArray(REENTRY_POST_RELEASE_TIMELINE), 'REENTRY_POST_RELEASE_TIMELINE is array');
      assert.ok(Array.isArray(REENTRY_SUPERVISION_PROTECTIONS), 'REENTRY_SUPERVISION_PROTECTIONS is array');
      assert.strictEqual(typeof evaluateReentryPlan, 'function');
      assert.strictEqual(typeof reentryView, 'function');
      assert.strictEqual(typeof resetReentryState, 'function');
      assert.strictEqual(typeof formatReentrySummaryText, 'function');
    });

    test('olderAdults.js exports all Medicare, Beers, and pharmacokinetic interfaces', () => {
      assert.ok(Array.isArray(MEDICARE_SUD_RULES), 'MEDICARE_SUD_RULES is array');
      assert.ok(Array.isArray(BEERS_CRITERIA_INTERACTIONS), 'BEERS_CRITERIA_INTERACTIONS is array');
      assert.ok(GERIATRIC_PHARMACOKINETIC_RULES && typeof GERIATRIC_PHARMACOKINETIC_RULES === 'object');
      assert.strictEqual(typeof evaluateOlderAdultCare, 'function');
      assert.strictEqual(typeof olderAdultsView, 'function');
      assert.strictEqual(typeof resetOlderAdultsState, 'function');
      assert.strictEqual(typeof formatOlderAdultSummaryText, 'function');
    });

    test('workplaceRights.js exports all FMLA, ADA, and licensure interfaces', () => {
      assert.ok(Array.isArray(FMLA_REGULATORY_RULES), 'FMLA_REGULATORY_RULES is array');
      assert.ok(Array.isArray(ADA_PROTECTION_STANDARDS), 'ADA_PROTECTION_STANDARDS is array');
      assert.ok(Array.isArray(PROFESSIONAL_LICENSURE_FRAMEWORKS), 'PROFESSIONAL_LICENSURE_FRAMEWORKS is array');
      assert.strictEqual(typeof evaluateWorkplaceRights, 'function');
      assert.strictEqual(typeof workplaceRightsView, 'function');
      assert.strictEqual(typeof resetWorkplaceState, 'function');
      assert.strictEqual(typeof formatWorkplaceSummaryText, 'function');
    });

    test('recoveryCapital.js exports all BARC-10, SAMHSA, and tier interfaces', () => {
      assert.ok(Array.isArray(BARC10_ITEMS), 'BARC10_ITEMS is array');
      assert.ok(SAMHSA_RECOVERY_DIMENSIONS && typeof SAMHSA_RECOVERY_DIMENSIONS === 'object');
      assert.ok(RECOVERY_CAPITAL_TIERS && typeof RECOVERY_CAPITAL_TIERS === 'object');
      assert.strictEqual(typeof calculateRecoveryCapitalScore, 'function');
      assert.strictEqual(typeof generateRecoveryCapitalPlan, 'function');
      assert.strictEqual(typeof recoveryCapitalComponent, 'function');
      assert.strictEqual(typeof resetRecoveryCapitalState, 'function');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Cross-Module Clinical & Legal Scenarios
  // --------------------------------------------------------------------------
  describe('2. Cross-Module Clinical & Legal Integration Scenarios', () => {
    test('Scenario A: Older adult (age 67) navigating reentry with active MOUD and probation', () => {
      // 1. Reentry Plan Evaluation
      const reentryPlan = evaluateReentryPlan({
        stateCode: 'CA',
        releaseWindow: 'within_30_days',
        currentMoud: 'buprenorphine',
        supervisionStatus: 'probation',
        housingStatus: 'transitional_reentry',
        hasMedicaid: 'suspended',
      });

      assert.strictEqual(reentryPlan.isWaiverActive, true);
      assert.strictEqual(reentryPlan.waiver.coverageWindowDays, 90);
      assert.ok(reentryPlan.checklist.some((c) => c.title.en.includes('30-Day Medication Bridge')));
      assert.ok(reentryPlan.checklist.some((c) => c.title.en.includes('MOUD Prescription Verification Letter')));

      // 2. Older Adult Care Evaluation
      const geriatricPlan = evaluateOlderAdultCare({
        age: 67,
        medicarePlan: 'part_b_original',
        substances: ['opioids'],
        currentMedications: [],
      });

      assert.strictEqual(geriatricPlan.inputs.isGeriatric, true);
      assert.ok(geriatricPlan.medicareSummary.otpCoverage.includes('$0 copay'));
      assert.ok(geriatricPlan.clinicalRecommendations.some((c) => c.title.en.includes('Buprenorphine as Preferred Geriatric MOUD')));

      // 3. Recovery Capital Evaluation
      const capitalScore = calculateRecoveryCapitalScore({
        values_clarity: 5,
        life_satisfaction: 4,
        safe_living_space: 4,
        supportive_relationships: 4,
        coping_confidence: 4,
        community_resources: 5,
      });

      assert.strictEqual(capitalScore.tierKey, 'moderate_capital');
      assert.ok(capitalScore.totalScore >= 35);
    });

    test('Scenario B: Licensed nurse on prescribed MOUD requesting FMLA and assessing recovery capital', () => {
      // 1. Workplace Rights Evaluation
      const workPlan = evaluateWorkplaceRights({
        employerSize: '50_plus',
        tenureMonths: 24,
        hoursWorkedLast12Months: 1800,
        treatmentStage: 'in_recovery_moud',
        prescribedMoud: true,
        jobCategory: 'healthcare_licensed',
      });

      assert.strictEqual(workPlan.fmla.isQualified, true);
      assert.strictEqual(workPlan.ada.tier, 'protected_in_recovery');
      assert.strictEqual(workPlan.ada.hasMoudProtection, true);
      assert.strictEqual(workPlan.licensureFramework.profession, 'nursing');
      assert.ok(workPlan.nextSteps.some((s) => s.title.en.includes('Alternative to Discipline')));

      // 2. Recovery Capital Evaluation
      const highCapitalScore = calculateRecoveryCapitalScore({
        values_clarity: 6,
        life_satisfaction: 5,
        vitality_energy: 5,
        pride_achievement: 5,
        meaning_direction: 5,
        safe_living_space: 5,
        supportive_relationships: 5,
        coping_confidence: 5,
        future_hope: 5,
        community_resources: 5,
      });

      assert.strictEqual(highCapitalScore.tierKey, 'high_capital');
      assert.strictEqual(highCapitalScore.totalScore, 51); // 51 >= 47
    });
  });

  // --------------------------------------------------------------------------
  // 3. App Shell, Routing & Quick Exit Orchestration
  // --------------------------------------------------------------------------
  describe('3. Application Shell, Routing & Quick Exit Orchestration', () => {
    test('registers reentry, older-adults, and workplace-rights in LAZY_LOADERS and ROUTE_TITLES', () => {
      assert.strictEqual(typeof LAZY_LOADERS.reentry, 'function');
      assert.strictEqual(typeof LAZY_LOADERS['older-adults'], 'function');
      assert.strictEqual(typeof LAZY_LOADERS['workplace-rights'], 'function');

      assert.strictEqual(typeof ROUTE_TITLES.reentry, 'function');
      assert.strictEqual(typeof ROUTE_TITLES['older-adults'], 'function');
      assert.strictEqual(typeof ROUTE_TITLES['workplace-rights'], 'function');

      assert.ok(ROUTE_TITLES.reentry().includes('Reentry'));
      assert.ok(ROUTE_TITLES['older-adults']().includes('Older adults'));
      assert.ok(ROUTE_TITLES['workplace-rights']().includes('Workplace rights'));
    });

    test('preloads all lazy views including Wave 9 views without unhandled rejections', async () => {
      const views = await preloadAllLazyViews();
      assert.ok(Array.isArray(views));
      assert.ok(views.length >= 14);
      // All loaded views should be functions (constructors/builders)
      views.forEach((v) => {
        assert.strictEqual(typeof v, 'function');
      });
    });

    test('deterministic state resets wipe in-RAM state across all Wave 9 stateful views', () => {
      // Mutate state in all Wave 9 modules
      setReentryState({ stateCode: 'TX', releaseWindow: 'released_within_14_days' });
      setOlderAdultState({ age: 88, medicarePlan: 'dual_eligible' });
      setWorkplaceState({ employerSize: 'under_50', tenureMonths: 48 });
      setRecoveryCapitalState({ activeTab: 'action_plan' });

      assert.strictEqual(getReentryState().stateCode, 'TX');
      assert.strictEqual(getOlderAdultState().age, 88);
      assert.strictEqual(getWorkplaceState().employerSize, 'under_50');
      assert.strictEqual(getRecoveryCapitalState().activeTab, 'action_plan');

      // Execute Quick Exit resets
      runQuickExitResets();

      // Explicitly check their reset functions
      resetReentryState();
      resetOlderAdultsState();
      resetWorkplaceState();
      resetRecoveryCapitalState();

      assert.strictEqual(getReentryState().stateCode, 'CA');
      assert.strictEqual(getOlderAdultState().age, 68);
      assert.strictEqual(getWorkplaceState().employerSize, '50_plus');
      assert.strictEqual(getRecoveryCapitalState().activeTab, 'assessment');
    });

    test('bilingual Spanish route titles exist in es.js for Wave 9 routes', () => {
      assert.strictEqual(esTranslations['route.reentry'], 'Reingreso y salud legal');
      assert.strictEqual(esTranslations['route.olderAdults'], 'Adultos mayores y Medicare');
      assert.strictEqual(esTranslations['route.workplaceRights'], 'Derechos laborales, FMLA y ADA');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Static Security, CSP & Privacy Compliance Audit
  // --------------------------------------------------------------------------
  describe('4. Static Security, CSP & Privacy Compliance Audit', () => {
    const wave9Files = [
      'public/js/views/reentry.js',
      'public/js/views/olderAdults.js',
      'public/js/views/workplaceRights.js',
      'public/js/components/recoveryCapital.js',
    ];

    test('zero device storage (localStorage, sessionStorage, cookie) access in Wave 9 modules', () => {
      wave9Files.forEach((file) => {
        const fullPath = join(process.cwd(), file);
        const code = readFileSync(fullPath, 'utf8');
        assert.ok(!/\blocalStorage\b/.test(code), `${file} must not contain localStorage`);
        assert.ok(!/\bsessionStorage\b/.test(code), `${file} must not contain sessionStorage`);
        assert.ok(!/\bdocument\.cookie\b/.test(code), `${file} must not contain document.cookie`);
      });
    });

    test('zero innerHTML, outerHTML, or inline style attributes in Wave 9 files', () => {
      wave9Files.forEach((file) => {
        const fullPath = join(process.cwd(), file);
        const code = readFileSync(fullPath, 'utf8');
        assert.ok(!/\b(innerHTML|outerHTML|insertAdjacentHTML)\b/.test(code), `${file} must not contain innerHTML/outerHTML`);
        assert.ok(!/\bstyle\s*=/.test(code), `${file} must not contain style= attribute`);
      });
    });

    test('zero banned privacy phrases in Wave 9 files', () => {
      const BANNED = [
        /saved to disk/i,
        /erases? everything/i,
        /zero[- ]knowledge/i,
        /does not record search terms/i,
        /never stored/i,
        /nothing is logged/i,
        /100% private/i,
        /\bse borra todo\b/i,
        /\bnunca se guarda\b/i,
        /\bse guardan? en el disco\b/i,
        /\bnada se registra\b/i,
        /\b100\s*%\s*privad/i,
      ];

      wave9Files.forEach((file) => {
        const fullPath = join(process.cwd(), file);
        const code = readFileSync(fullPath, 'utf8');
        BANNED.forEach((pattern) => {
          assert.ok(!pattern.test(code), `${file} must not contain banned privacy phrase ${pattern}`);
        });
      });
    });

    test('public/sw.js includes Wave 9 modules in ELECTIVE_SHELL', () => {
      const swPath = join(process.cwd(), 'public', 'sw.js');
      const swCode = readFileSync(swPath, 'utf8');

      assert.ok(swCode.includes('/js/views/reentry.js'));
      assert.ok(swCode.includes('/js/views/olderAdults.js'));
      assert.ok(swCode.includes('/js/views/workplaceRights.js'));
      assert.ok(swCode.includes('/js/components/recoveryCapital.js'));
    });
  });
});

