import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TRAUMA_HEMORRHAGE_PROTOCOLS,
  BLEEDING_PROFILES,
  FIELD_PROHIBITIONS,
  evaluateStreetTrauma,
  resetStreetTraumaState,
  streetTraumaView,
} from '../public/js/views/streetTrauma.js';

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
      this.parentNode = null;
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

    get firstChild() {
      return this.children[0] || null;
    }

    remove() {
      if (this.parentNode) {
        const idx = this.parentNode.children.indexOf(this);
        if (idx !== -1) {
          this.parentNode.children.splice(idx, 1);
        }
      }
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
        child.parentNode = this;
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

test('TRAUMA_HEMORRHAGE_PROTOCOLS catalog and prohibitions integrity', () => {
  const profileKeys = Object.keys(TRAUMA_HEMORRHAGE_PROTOCOLS);
  assert.ok(profileKeys.includes('arterial_extremity'));
  assert.ok(profileKeys.includes('junctional_wound'));
  assert.ok(profileKeys.includes('venous_oozing'));
  assert.ok(profileKeys.includes('dual_bone_trap'));
  assert.ok(profileKeys.includes('prohibited_actions'));
  assert.equal(BLEEDING_PROFILES, TRAUMA_HEMORRHAGE_PROTOCOLS);

  assert.ok(Array.isArray(FIELD_PROHIBITIONS));
  assert.ok(FIELD_PROHIBITIONS.some((p) => p.includes('Never loosen or remove a tourniquet')));
  assert.ok(FIELD_PROHIBITIONS.some((p) => p.includes('Never blindly clamp')));
});

test('evaluateStreetTrauma: arterial extremity windlass tourniquet directives', () => {
  const res = evaluateStreetTrauma({
    protocolId: 'arterial_extremity',
    isSpurting: true,
    woundLocation: 'leg',
    tourniquetMinutesElapsed: 25,
  });

  assert.equal(res.protocolId, 'arterial_extremity');
  assert.equal(res.isEmergency911, true);
  assert.ok(res.emergencyFlagsEn.some((f) => f.includes('LIFE-THREATENING ARTERIAL HEMORRHAGE')));
  assert.ok(res.protocol.actionEn.includes('commercial windlass tourniquet'));
  assert.ok(res.protocol.fieldRuleEn.includes('NEVER loosen, release, or remove a tourniquet in the field'));
  assert.ok(res.sbarEn.includes('[S] SITUATION:'));
  assert.ok(res.sbarEn.includes('Severe Arterial Extremity Bleed'));
});

test('evaluateStreetTrauma: dual-bone vascular shielding alert', () => {
  const res = evaluateStreetTrauma({
    protocolId: 'dual_bone_trap',
    isSpurting: true,
    woundLocation: 'forearm_calf',
    tourniquetMinutesElapsed: 15,
  });

  assert.equal(res.protocolId, 'dual_bone_trap');
  assert.equal(res.isEmergency911, true);
  assert.ok(res.emergencyFlagsEn.some((f) => f.includes('DUAL-BONE TRAP')));
  assert.ok(res.protocol.actionEn.includes('radius & ulna') && res.protocol.actionEn.includes('tibia & fibula'));
  assert.ok(res.protocol.actionEn.includes('humerus') || res.protocol.actionEn.includes('femur'));
});

test('evaluateStreetTrauma: junctional wound packing with hemostatic gauze', () => {
  const res = evaluateStreetTrauma({
    protocolId: 'junctional_wound',
    woundLocation: 'groin_axilla',
  });

  assert.equal(res.protocolId, 'junctional_wound');
  assert.equal(res.isEmergency911, true);
  assert.ok(res.protocol.actionEn.includes('Kaolin QuikClot') || res.protocol.actionEn.includes('Chitosan Celox'));
  assert.ok(res.protocol.actionEn.includes('AT LEAST 3 CONTINUOUS MINUTES'));
});

test('evaluateStreetTrauma: truncal wound and prolonged tourniquet time', () => {
  const res = evaluateStreetTrauma({
    protocolId: 'arterial_extremity',
    woundLocation: 'chest_abdomen',
    tourniquetMinutesElapsed: 150,
    hasShock: true,
  });

  assert.equal(res.isEmergency911, true);
  assert.ok(res.emergencyFlagsEn.some((f) => f.includes('TRUNCAL WOUND')));
  assert.ok(res.emergencyFlagsEn.some((f) => f.includes('PROLONGED TOURNIQUET TIME')));
  assert.ok(res.emergencyFlagsEn.some((f) => f.includes('HYPOVOLEMIC HEMORRHAGIC SHOCK')));
});

test('streetTraumaView: DOM rendering, interactions and SBAR generation', () => {
  const cleanup = installMockDom();
  try {
    resetStreetTraumaState();
    const container = streetTraumaView();
    assert.ok(container, 'container created');
    assert.equal(container.className, 'street-trauma-view');

    const tabs = container.querySelectorAll('.tab');
    assert.ok(tabs.length >= 5, 'Contains tabs for all 5 trauma protocols');

    // Find tab for Dual-Bone trap
    const dualBoneTab = tabs.find((t) => t.textContent.includes('Dual-Bone'));
    assert.ok(dualBoneTab, 'Dual bone tab present');

    // Switch to dual-bone
    dualBoneTab.click();

    const sbarBlock = container.querySelector('.trauma-sbar-block');
    assert.ok(sbarBlock, 'SBAR pre exists');
    assert.ok(sbarBlock.textContent.includes('Dual-Bone'), 'SBAR updated for Dual-Bone');

    resetStreetTraumaState();
  } finally {
    cleanup();
  }
});
