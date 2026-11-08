import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FHIR_SYSTEMS,
  ASAM_LEVEL_DEFINITIONS,
  DEFAULT_REFERRAL_PARAMS,
  generateFhirReferralBundle,
  serializeFhirBundle,
  resetFhirExportState,
  fhirExportView,
} from '../public/js/views/fhirExport.js';

function installMockDom() {
  class MockElement {
    constructor(tagName) {
      this.tagName = String(tagName || 'DIV').toUpperCase();
      this.attributes = {};
      this.children = [];
      this.listeners = {};
      this.style = {};
      this.dataset = {};
      this._textContent = '';
      this.className = '';
      this.id = '';
      this.checked = false;
      this.disabled = false;
      this.value = '';
      this.hidden = false;
      this.classList = {
        add: (...classes) => {
          const set = new Set(this.className.split(/\s+/).filter(Boolean));
          classes.forEach((c) => set.add(c));
          this.className = Array.from(set).join(' ');
        },
        remove: (...classes) => {
          const set = new Set(this.className.split(/\s+/).filter(Boolean));
          classes.forEach((c) => set.delete(c));
          this.className = Array.from(set).join(' ');
        },
        contains: (c) => this.className.split(/\s+/).filter(Boolean).includes(c),
      };
    }

    setAttribute(k, v) {
      const val = String(v);
      this.attributes[k] = val;
      if (k === 'id') this.id = val;
      if (k === 'class') this.className = val;
    }

    getAttribute(k) {
      if (k === 'id') return this.id || this.attributes.id || null;
      if (k === 'class') return this.className || this.attributes.class || null;
      return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null;
    }

    hasAttribute(k) {
      return Object.hasOwn(this.attributes, k);
    }

    removeAttribute(k) {
      delete this.attributes[k];
    }

    appendChild(child) {
      if (child !== null && child !== undefined) {
        this.children.push(child);
      }
      return child;
    }

    append(...items) {
      for (const item of items) {
        if (typeof item === 'string') {
          this.appendChild({ nodeType: 3, textContent: item });
        } else if (item) {
          this.appendChild(item);
        }
      }
    }

    replaceChildren(...items) {
      this.children = [];
      this.append(...items);
    }

    addEventListener(type, fn) {
      if (!this.listeners[type]) this.listeners[type] = [];
      this.listeners[type].push(fn);
    }

    dispatchEvent(evt) {
      const list = this.listeners[evt.type] || [];
      for (const fn of list) fn(evt);
    }

    click() {
      this.dispatchEvent({ type: 'click', target: this, preventDefault() {} });
    }

    get textContent() {
      const childText = this.children.map((c) => c.textContent || '').join('');
      return `${this._textContent}${childText}`;
    }

    set textContent(v) {
      this._textContent = String(v ?? '');
      this.children = [];
    }

    querySelectorAll(selector) {
      const results = [];
      const check = (node) => {
        if (!node || !node.tagName) return;
        let match = false;
        if (selector.startsWith('#')) {
          match = node.id === selector.slice(1);
        } else if (selector.startsWith('.')) {
          const cls = selector.slice(1);
          match = (node.className || '').split(/\s+/).includes(cls);
        } else if (selector.startsWith('[') && selector.endsWith(']')) {
          const inner = selector.slice(1, -1);
          const [attr, rawVal] = inner.split('=');
          if (rawVal !== undefined) {
            const expected = rawVal.replace(/^["']|["']$/g, '');
            match = node.getAttribute(attr) === expected;
          } else {
            match = node.hasAttribute(attr);
          }
        } else {
          match = node.tagName.toLowerCase() === selector.toLowerCase();
        }
        if (match) results.push(node);
        for (const child of node.children || []) check(child);
      };
      for (const child of this.children || []) check(child);
      return results;
    }

    querySelector(selector) {
      return this.querySelectorAll(selector)[0] || null;
    }
  }

  const prevDoc = globalThis.document;

  globalThis.Node = MockElement;
  globalThis.document = {
    createElement(tag) {
      return new MockElement(tag);
    },
    createElementNS(ns, tag) {
      return new MockElement(tag);
    },
    createTextNode(text) {
      return { nodeType: 3, textContent: String(text) };
    },
    getElementById(id) {
      return null;
    },
  };

  try {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText: async () => {} },
      configurable: true,
      writable: true,
    });
  } catch {}

  return () => {
    globalThis.document = prevDoc;
  };
}

test('FHIR constants and definitions integrity', () => {
  assert.ok(FHIR_SYSTEMS.ETH_SECURITY);
  assert.ok(FHIR_SYSTEMS.LOINC);
  assert.ok(FHIR_SYSTEMS.SNOMED_CT);
  assert.ok(Array.isArray(ASAM_LEVEL_DEFINITIONS));
  assert.ok(ASAM_LEVEL_DEFINITIONS.some((lvl) => lvl.code === '3.5'));
  assert.ok(DEFAULT_REFERRAL_PARAMS.patientPseudonym);
});

test('generateFhirReferralBundle creates compliant HL7 FHIR R4 Bundle', () => {
  const bundle = generateFhirReferralBundle({
    patientPseudonym: 'TEST-PSEUDO-1234',
    asamLevel: '3.5',
    priority: 'urgent',
    facilityName: 'Bay Area Health Center',
    facilityPhone: '415-555-0100',
    clinicalNotes: 'Initiated buprenorphine, needs withdrawal monitoring.',
  });

  assert.equal(bundle.resourceType, 'Bundle');
  assert.equal(bundle.type, 'collection');
  assert.ok(bundle.timestamp);
  assert.ok(Array.isArray(bundle.entry));
  assert.equal(bundle.entry.length, 4, 'Contains Patient, ServiceRequest, Consent, and HealthcareService');

  // 1. Patient entry (pseudonymous zero-PII)
  const patientEntry = bundle.entry.find((e) => e.resource.resourceType === 'Patient');
  assert.ok(patientEntry);
  assert.equal(patientEntry.resource.identifier[0].value, 'TEST-PSEUDO-1234');
  assert.equal(patientEntry.resource.meta.security[0].code, 'ETH');

  // 2. ServiceRequest entry (US Core)
  const srEntry = bundle.entry.find((e) => e.resource.resourceType === 'ServiceRequest');
  assert.ok(srEntry);
  assert.equal(srEntry.resource.priority, 'urgent');
  assert.equal(srEntry.resource.status, 'active');
  assert.equal(srEntry.resource.intent, 'order');
  assert.equal(srEntry.resource.code.coding[0].code, '56832-9');
  assert.ok(srEntry.resource.reasonCode[0].text.includes('3.5'));
  assert.ok(srEntry.resource.note[0].text.includes('Initiated buprenorphine'));

  // 3. Consent entry (42 CFR Part 2)
  const consentEntry = bundle.entry.find((e) => e.resource.resourceType === 'Consent');
  assert.ok(consentEntry);
  assert.equal(consentEntry.resource.status, 'active');
  assert.ok(consentEntry.resource.policyRule.coding[0].display.includes('Substance Use Disorder'));
  assert.ok(consentEntry.resource.meta.security.some((s) => s.code === 'ETH'));

  // 4. HealthcareService entry
  const serviceEntry = bundle.entry.find((e) => e.resource.resourceType === 'HealthcareService');
  assert.ok(serviceEntry);
  assert.equal(serviceEntry.resource.name, 'Bay Area Health Center');
  assert.ok(serviceEntry.resource.telecom.some((t) => t.value === '415-555-0100'));
});

test('serializeFhirBundle handles formatted JSON and NDJSON', () => {
  const bundle = generateFhirReferralBundle();

  const { jsonString, ndjsonString } = serializeFhirBundle(bundle);
  assert.ok(jsonString.startsWith('{'), 'JSON format starts with brace');
  const parsed = JSON.parse(jsonString);
  assert.equal(parsed.resourceType, 'Bundle');

  const lines = ndjsonString.trim().split('\n');
  assert.equal(lines.length, 4, 'NDJSON produces 4 individual resource lines');
  for (const line of lines) {
    const resource = JSON.parse(line);
    assert.ok(resource.resourceType);
  }
});

test('fhirExportView: DOM rendering and controls', () => {
  const cleanup = installMockDom();
  try {
    resetFhirExportState();
    const container = fhirExportView();
    assert.ok(container, 'container created');
    assert.equal(container.className, 'fhir-export-view');

    const pseudoInput = container.querySelector('#fhir-pseudonym');
    const prioritySelect = container.querySelector('#fhir-priority-select');
    const codeBlock = container.querySelector('.fhir-code-block');

    assert.ok(pseudoInput, 'Pseudonym input present');
    assert.ok(prioritySelect, 'Priority select present');
    assert.ok(codeBlock, 'Code preview block present');
    assert.ok(codeBlock.textContent.includes('Bundle'));

    // Check action buttons exist
    const buttons = container.querySelectorAll('button');
    assert.ok(buttons.length >= 3, 'Action buttons present');

    resetFhirExportState();
  } finally {
    cleanup();
  }
});
