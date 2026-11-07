/**
 * Wave 11 Architecture, Clinical Systems & Multi-Module Integration Suite (test/wave11-integration.test.js)
 *
 * Verifies end-to-end coherence across all Wave 11 additions:
 * 1. Rural & Frontier Health Care Specialist (public/js/views/ruralHealth.js)
 * 2. Disability, Neurodiversity & Accessible Care Specialist (public/js/views/disabilityCare.js)
 * 3. Homelessness & Street Medicine Harm Reduction Specialist (public/js/views/streetMedicine.js)
 * 4. Syringe Services Program (SSP) & Equipment Tracker Component (public/js/components/sspEquipmentTracker.js)
 * 5. Application Shell Routing, Lazy Loading & Quick Exit Integration (public/js/app.js)
 * 6. Bilingual Parity (es.js) & Service Worker Elective Precache (sw.js)
 * 7. Static Security, CSP Parity & Ephemeral In-RAM Privacy Compliance
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// 1. Rural & Frontier Health
import {
  RURAL_HEALTH_STATUTES,
  NEMT_SCHEDULING_RULES,
  MAIL_HARM_REDUCTION_STANDARDS,
  evaluateRuralCarePlan,
  getRuralHealthState,
  setRuralHealthState,
  resetRuralHealthState,
  formatRuralHealthSummaryText,
  ruralHealthView,
} from '../public/js/views/ruralHealth.js';

// 2. Disability, Neurodiversity & Accessible Care
import {
  DISABILITY_CARE_STATUTES,
  SENSORY_ACCOMMODATION_STANDARDS,
  evaluateDisabilityCarePlan,
  getDisabilityState,
  setDisabilityState,
  resetDisabilityState,
  formatDisabilitySummaryText,
  disabilityCareView,
} from '../public/js/views/disabilityCare.js';

// 3. Homelessness & Street Medicine
import {
  STREET_MEDICINE_STATUTES,
  ENVIRONMENTAL_EXPOSURE_RISKS,
  evaluateStreetMedicinePlan,
  getStreetMedicineState,
  setStreetMedicineState,
  resetStreetMedicineState,
  formatStreetMedicineSummaryText,
  streetMedicineView,
} from '../public/js/views/streetMedicine.js';

// 4. SSP & Equipment Tracker
import {
  SSP_EQUIPMENT_SPECIFICATIONS,
  calculateSspEquipmentNeeds,
  getSspTrackerState,
  setSspTrackerState,
  resetSspTrackerState,
  formatSspEquipmentSummaryText,
  sspEquipmentTrackerComponent,
} from '../public/js/components/sspEquipmentTracker.js';

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

describe('Wave 11 Architecture, Clinical Systems & Multi-Module Integration Suite', () => {
  beforeEach(() => {
    resetRuralHealthState();
    resetDisabilityState();
    resetStreetMedicineState();
    resetSspTrackerState();
  });

  test('1. App Shell Route Registry & Preloader Parity for Wave 11 Modules', async () => {
    // 1. Verify lazy loader registrations
    assert.ok(LAZY_LOADERS['rural-health'], 'rural-health view loader must be registered in LAZY_LOADERS');
    assert.ok(LAZY_LOADERS['disability-care'], 'disability-care view loader must be registered in LAZY_LOADERS');
    assert.ok(LAZY_LOADERS['street-medicine'], 'street-medicine view loader must be registered in LAZY_LOADERS');

    // 2. Verify lazy loading functions resolve valid views
    const loadedRural = await LAZY_LOADERS['rural-health']();
    assert.equal(typeof loadedRural, 'function', 'rural-health loader must resolve a function');

    const loadedDisability = await LAZY_LOADERS['disability-care']();
    assert.equal(typeof loadedDisability, 'function', 'disability-care loader must resolve a function');

    const loadedStreet = await LAZY_LOADERS['street-medicine']();
    assert.equal(typeof loadedStreet, 'function', 'street-medicine loader must resolve a function');

    // 3. Verify route titles in English and Spanish parity
    assert.ok(ROUTE_TITLES['rural-health'], 'ROUTE_TITLES must have rural-health');
    assert.ok(ROUTE_TITLES['disability-care'], 'ROUTE_TITLES must have disability-care');
    assert.ok(ROUTE_TITLES['street-medicine'], 'ROUTE_TITLES must have street-medicine');

    assert.equal(typeof ROUTE_TITLES['rural-health'](), 'string');
    assert.equal(typeof ROUTE_TITLES['disability-care'](), 'string');
    assert.equal(typeof ROUTE_TITLES['street-medicine'](), 'string');

    assert.ok(esTranslations['route.ruralHealth'], 'Spanish route title for ruralHealth must be defined');
    assert.ok(esTranslations['route.disabilityCare'], 'Spanish route title for disabilityCare must be defined');
    assert.ok(esTranslations['route.streetMedicine'], 'Spanish route title for streetMedicine must be defined');

    // 4. Verify preloadAllLazyViews resolves cleanly
    await preloadAllLazyViews();
  });

  test('2. Quick Exit (Esc x2) Deterministic State Wipe Across All 4 Wave 11 Modules', async () => {
    // Mutate state in all 4 modules
    setRuralHealthState({
      countyType: 'frontier',
      distanceToClinicMiles: 80,
      activeTab: 'nemt_transit',
    });
    setDisabilityState({
      disabilityTypes: ['deaf_hard_of_hearing'],
      hasServiceAnimal: true,
      activeTab: 'service_animals',
    });
    setStreetMedicineState({
      livingSituation: 'vehicle_car',
      experiencingExtremeWeather: 'extreme_heat',
      activeTab: 'weather_safety',
    });
    setSspTrackerState({
      dailyUseFrequency: 8,
      suppliesDurationDays: 14,
      activeTab: 'vein_safety',
    });

    // Verify mutations took effect
    assert.equal(getRuralHealthState().countyType, 'frontier');
    assert.equal(getDisabilityState().hasServiceAnimal, true);
    assert.equal(getStreetMedicineState().livingSituation, 'vehicle_car');
    assert.equal(getSspTrackerState().dailyUseFrequency, 8);

    // Execute runQuickExitResets
    runQuickExitResets();

    // Allow dynamic import promises to settle
    await new Promise((r) => setTimeout(r, 60));

    // Verify all 4 states reset to pristine defaults
    const ruralAfter = getRuralHealthState();
    assert.equal(ruralAfter.countyType, 'rural');
    assert.equal(ruralAfter.activeTab, 'decision_aid');

    const disabilityAfter = getDisabilityState();
    assert.ok(disabilityAfter.disabilityTypes.includes('mobility_physical'));
    assert.equal(disabilityAfter.hasServiceAnimal, false);
    assert.equal(disabilityAfter.activeTab, 'decision_aid');

    const streetAfter = getStreetMedicineState();
    assert.equal(streetAfter.livingSituation, 'unsheltered_encampment');
    assert.equal(streetAfter.activeTab, 'decision_aid');

    const sspAfter = getSspTrackerState();
    assert.equal(sspAfter.dailyUseFrequency, 3);
    assert.equal(sspAfter.activeTab, 'calculator');
  });

  test('3. Rural & Frontier Health: Medicaid NEMT & Farmworker Heat Safety Alerts', () => {
    const plan = evaluateRuralCarePlan({
      countyType: 'frontier',
      distanceToClinicMiles: 55,
      hasPersonalVehicle: false,
      medicaidEnrolled: true,
      isAgriculturalWorker: true,
      interestedInTeleMoud: true,
    });

    assert.equal(plan.isFrontier, true);
    assert.equal(plan.transitHurdle, true);
    assert.ok(plan.transportationSolutions.some((s) => s.title.en.includes('Medicaid NEMT')));
    assert.ok(plan.alerts.some((a) => a.type === 'farmworker_safety'));
    assert.match(plan.alerts.find((a) => a.type === 'farmworker_safety').detail.en, /heat stroke/i);

    const text = formatRuralHealthSummaryText(plan, 'es');
    assert.match(text, /PLAN DE SALUD RURAL Y ACCESO A TRANSPORTE/);
    assert.match(text, /Never Use Alone: 1-800-484-3731/);
  });

  test('4. Disability & Accessible Care: Service Dogs, Auxiliary Aids & CDC 2022 Pain Standard', () => {
    const plan = evaluateDisabilityCarePlan({
      disabilityTypes: ['mobility_physical', 'autism_sensory', 'chronic_pain'],
      hasServiceAnimal: true,
      seekingResidential: true,
      currentPainStatus: 'prescribed_opioids',
      needsAuxiliaryCommunication: true,
    });

    assert.ok(plan.rightsAlerts.some((a) => a.title.en.includes('Service Dog')));
    assert.ok(plan.rightsAlerts.some((a) => a.title.en.includes('Auxiliary Aids')));
    assert.ok(plan.chronicPainAdvice.some((c) => c.title.en.includes('Involuntary Rapid Tapering')));
    assert.match(plan.chronicPainAdvice[0].detail.en, /CDC 2022/);

    const summary = formatDisabilitySummaryText(plan, 'en');
    assert.match(summary, /ACCESSIBLE CARE, NEURODIVERSITY & CHRONIC PAIN PLAN/);
    assert.match(summary, /DOJ ADA Information Line: 1-800-514-0301/);
  });

  test('5. Street Medicine: Freezing Weather Hypothermia Mechanisms & Sweep Rights', () => {
    const plan = evaluateStreetMedicinePlan({
      livingSituation: 'unsheltered_encampment',
      hasSecureMedStorage: false,
      experiencingExtremeWeather: 'freezing_winter',
      moudInterest: 'buprenorphine_street',
      facingSweepOrDisplacement: true,
      needsVitalDocs: true,
    });

    assert.ok(plan.alerts.length >= 1);
    assert.match(plan.alerts[0].detail.en, /vasodilation/i);
    assert.ok(plan.rightsGuidance.some((r) => r.title.en.includes('Encampment Sweep')));
    assert.ok(plan.rightsGuidance.some((r) => r.title.en.includes('Shelter MOUD')));

    const text = formatStreetMedicineSummaryText(plan, 'es');
    assert.match(text, /PLAN DE MEDICINA CALLEJERA Y DERECHOS PARA PERSONAS SIN HOGAR/);
    assert.match(text, /Never Use Alone: 1-800-484-3731/);
  });

  test('6. SSP Equipment Tracker: Low Dead-Space Calculations & Alcohol Directive', () => {
    const plan = calculateSspEquipmentNeeds({
      routeOfUse: 'multiple',
      dailyUseFrequency: 4,
      suppliesDurationDays: 7,
      substanceType: 'tar_or_crack',
    });

    assert.equal(plan.totalEvents, 28);
    assert.ok(plan.recommendedSyringes > 28);
    assert.ok(plan.supplyList.some((s) => s.item.en.includes('Ascorbic Acid')));
    assert.ok(plan.supplyList.some((s) => s.item.en.includes('Pyrex Glass')));

    const summary = formatSspEquipmentSummaryText(plan, 'en');
    assert.match(summary, /HARM REDUCTION EQUIPMENT & SYRINGE PROGRAM PLAN/);
    assert.match(summary, /CRITICAL CLINICAL DIRECTIVE ON ALCOHOL SWABS/);
  });

  test('7. Service Worker Elective Precache Parity', () => {
    const swPath = join(process.cwd(), 'public', 'sw.js');
    const swContent = readFileSync(swPath, 'utf8');

    assert.ok(swContent.includes("'/js/views/ruralHealth.js'"), 'sw.js must cache ruralHealth.js');
    assert.ok(swContent.includes("'/js/views/disabilityCare.js'"), 'sw.js must cache disabilityCare.js');
    assert.ok(swContent.includes("'/js/views/streetMedicine.js'"), 'sw.js must cache streetMedicine.js');
    assert.ok(swContent.includes("'/js/components/sspEquipmentTracker.js'"), 'sw.js must cache sspEquipmentTracker.js');
  });

  test('8. Static Security & Zero-Storage Audit Across All Wave 11 Modules', () => {
    const files = [
      join(process.cwd(), 'public', 'js', 'views', 'ruralHealth.js'),
      join(process.cwd(), 'public', 'js', 'views', 'disabilityCare.js'),
      join(process.cwd(), 'public', 'js', 'views', 'streetMedicine.js'),
      join(process.cwd(), 'public', 'js', 'components', 'sspEquipmentTracker.js'),
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

