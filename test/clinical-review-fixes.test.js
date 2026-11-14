// Regression tests for the clinical safety & accuracy review (phone links, quitline,
// TRICARE West, telehealth buprenorphine, reversal products). Each fact here was
// checked against the official source named in the comment.
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

class MockNode {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.attributes = {};
    this.childNodes = [];
    this.className = '';
    this.dataset = {};
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  addEventListener() {}
  append(...children) { this.childNodes.push(...children); }
  get textContent() {
    return this.childNodes.map((c) => (c instanceof MockNode ? c.textContent : String(c))).join('');
  }
}

describe('tel() / sms() phone links never render "[object Object]"', () => {
  let tel;
  let sms;
  before(async () => {
    globalThis.Node = MockNode;
    globalThis.document = { createElement: (tag) => new MockNode(tag), documentElement: { lang: 'en' } };
    ({ tel, sms } = await import('../public/js/dom.js'));
  });

  test("tel('988', { class: 'x' }) treats the object as props and shows the number", () => {
    const a = tel('988', { class: 'x' });
    assert.equal(a.textContent, '988');
    assert.equal(a.className, 'x');
    assert.equal(a.getAttribute('href'), 'tel:988');
    assert.doesNotMatch(a.textContent, /object Object/);
  });

  test('tel() keeps the documented (number, display, props) form working', () => {
    const a = tel('1-800-222-1222', 'Poison Help', { class: 'hotline-link' });
    assert.equal(a.textContent, 'Poison Help');
    assert.equal(a.className, 'hotline-link');
    assert.equal(a.getAttribute('href'), 'tel:18002221222');
    const b = tel('911');
    assert.equal(b.textContent, '911');
    assert.equal(b.className, 'tel');
  });

  test('sms() tolerates a props object in the body or display slot', () => {
    const a = sms('678678', { class: 'hotline-link' });
    assert.equal(a.textContent, '678678');
    assert.equal(a.getAttribute('href'), 'sms:678678');
    assert.equal(a.className, 'hotline-link');
    const b = sms('678678', 'START', 'Text START to 678678', { class: 'hotline-link' });
    assert.equal(b.textContent, 'Text START to 678678');
    assert.equal(b.getAttribute('href'), 'sms:678678?&body=START');
  });

  test('no call site passes an object literal as the display (tel) or body (sms) argument', () => {
    const offenders = [];
    for (const file of walk(path.join(root, 'public', 'js'))) {
      const rel = path.relative(root, file);
      if (rel === path.join('public', 'js', 'dom.js')) continue;
      const src = fs.readFileSync(file, 'utf8');
      for (const m of src.matchAll(/\b(tel|sms)\(\s*[^,()]+,\s*\{/g)) {
        const line = src.slice(0, m.index).split('\n').length;
        offenders.push(`${rel}:${line}`);
      }
    }
    assert.deepEqual(offenders, []);
  });
});

describe('Spanish tobacco quitline (CDC: 1-855-DÉJELO-YA = 1-855-335-3569)', () => {
  test('nicotineCare.js uses the CDC number and spelling', () => {
    const src = read('public/js/views/nicotineCare.js');
    assert.match(src, /1-855-DÉJELO-YA \(855-335-3569\)/);
    assert.match(src, /tel:18553353569/);
    assert.doesNotMatch(src, /DÉJALO|335-2569|3352569/);
  });
});

describe('TRICARE West Region (tricare.mil: TriWest, 888-TRIWEST since Jan 1, 2025)', () => {
  test('veterans.js lists TriWest Healthcare Alliance, not Health Net Federal Services', () => {
    const src = read('public/js/views/veterans.js');
    assert.match(src, /TriWest Healthcare Alliance/);
    assert.match(src, /1-888-874-9378/);
    assert.doesNotMatch(src, /844-866-9378|Health Net Federal \/ TriWest|Health Net \/ TriWest/);
  });
});

describe('Telehealth buprenorphine wording is accurate and date-qualified', () => {
  const files = [
    'public/js/components/safetyNetNavigator.js',
    'public/js/components/reach.js',
    'public/js/views/navigator.js',
    'public/js/views/match.js',
  ];
  for (const rel of files) {
    test(`${rel} names the 2026 flexibilities and the 6-month audio-only limit`, () => {
      const src = read(rel);
      assert.match(src, /Dec\. 31, 2026/);
      assert.match(src, /21 CFR § 1306\.51/);
      assert.match(src, /up to 6 months/);
      assert.match(src, /in-person exam or another permitted form of telemedicine/);
    });
  }

  test('Spanish counterparts carry the same qualifications', () => {
    const es = read('public/js/locales/es.js') + read('public/js/locales/es-match.js');
    for (const key of ['reach.telehealthEduBody', 'nav.note.telehealth']) {
      const line = es.split('\n').find((l) => l.includes(`'${key}'`));
      assert.ok(line, key);
      assert.match(line, /31 de diciembre de 2026/);
      assert.match(line, /hasta 6 meses/);
    }
    const match = es.split('\n').find((l) => l.includes("'match.telehealthGuide.body'"));
    assert.match(match, /31 de diciembre de 2026/);
  });
});

describe('Overdose reversal and naltrexone product facts (FDA labels)', () => {
  let MEDICATIONS;
  let REVERSAL_COMPARISON;
  let WASHOUT;
  before(async () => {
    globalThis.Node ??= MockNode;
    globalThis.document ??= { createElement: (tag) => new MockNode(tag), documentElement: { lang: 'en' } };
    const mod = await import('../public/js/views/medications.js');
    MEDICATIONS = mod.MEDICATIONS;
    REVERSAL_COMPARISON = mod.REVERSAL_COMPARISON;
    WASHOUT = read('public/js/views/medications.js');
  });

  test('Zimhi is a 5 mg prefilled syringe, not an auto-injector; Zurnai is the nalmefene auto-injector', () => {
    const reversal = MEDICATIONS.find((m) => m.id === 'naloxone-nalmefene');
    const zimhi = reversal.brands.find((b) => /Zimhi/.test(b));
    assert.match(zimhi, /5 mg\/0\.5 mL/);
    assert.match(zimhi, /prefilled syringe/);
    assert.doesNotMatch(zimhi, /auto-injector/);
    const zurnai = reversal.brands.find((b) => /Zurnai/.test(b));
    assert.match(zurnai, /1\.5 mg nalmefene/);
    assert.match(zurnai, /auto-injector/);
    assert.ok(REVERSAL_COMPARISON.some((r) => /Zurnai/.test(r.product)));
  });

  test('RiVive is described as a 3 mg naloxone spray, not grouped under 4 mg', () => {
    const row = REVERSAL_COMPARISON.find((r) => /RiVive/.test(r.product));
    assert.match(row.product, /RiVive 3 mg/);
    assert.doesNotMatch(row.product, /^Naloxone 4 mg Nasal Spray \(Narcan, RiVive/);
  });

  test('nalmefene is described as longer acting without implying a period of safety', () => {
    // The Opvee and Zurnai labels report elimination half-life separately from
    // the risk of recurrent respiratory depression, which still needs emergency help.
    for (const brand of ['Opvee', 'Zurnai']) {
      const row = REVERSAL_COMPARISON.find((r) => r.product.includes(brand));
      assert.match(row.duration, /longer-acting than naloxone/i);
      assert.doesNotMatch(row.duration, /\d/);
      assert.match(row.guidance, /Call 911/i);
      assert.match(row.guidance, /stay with the person/i);
    }
  });

  test('the Vivitrol transition guide presents a clinician-led challenge without treating it as clearance', () => {
    assert.match(WASHOUT, /A clinician may consider a naloxone challenge test/);
    assert.match(WASHOUT, /a tolerated challenge cannot confirm that it is safe to start/);
    assert.doesNotMatch(WASHOUT, /naloxone challenge test is mandatory/i);
  });
});
