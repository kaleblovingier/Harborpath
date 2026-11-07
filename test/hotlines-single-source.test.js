// Never Use Alone must have one source of truth: NEVER_USE_ALONE in
// public/js/content/hotlines.js. neverusealone.com lists two lines
// ("800-484-3731 or 877-696-1996"); 800-484-3731 is the app-wide primary and
// the 877 line is only reachable through NEVER_USE_ALONE.alt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NEVER_USE_ALONE, HOTLINES, hotlinesById } from '../public/js/content/hotlines.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsRoot = path.join(root, 'public', 'js');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

// The backup line (or a typo of it, e.g. the wrong 877-696-1997 that once shipped) in any
// common spelling: 877-696-1996, (877) 696-1996, 8776961996, 877.696.1996.
const ALT_VARIANT = /\(?877\)?[\s.-]?696[\s.-]?\d{4}/;
// Only hotlines.js may spell out the backup line.
const ALLOWLIST = new Set([path.join('public', 'js', 'content', 'hotlines.js')]);

test('NEVER_USE_ALONE exposes the primary and backup lines from neverusealone.com', () => {
  assert.equal(NEVER_USE_ALONE.number, '18004843731');
  assert.equal(NEVER_USE_ALONE.label, '1-800-484-3731');
  assert.equal(NEVER_USE_ALONE.alt.number, '18776961996');
  assert.ok(Object.isFrozen(NEVER_USE_ALONE));
});

test('the hotline directory entry reads its number from NEVER_USE_ALONE', () => {
  const [nua] = hotlinesById('never-use-alone');
  assert.ok(nua);
  assert.equal(nua.call.number, NEVER_USE_ALONE.number);
  assert.equal(nua.call.label, NEVER_USE_ALONE.label);
  assert.ok(HOTLINES.substanceUse.includes(nua));
});

test('no module outside hotlines.js hard-codes the Never Use Alone backup line', () => {
  const offenders = [];
  for (const file of walk(jsRoot)) {
    const rel = path.relative(root, file);
    if (ALLOWLIST.has(rel)) continue;
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (ALT_VARIANT.test(line)) offenders.push(`${rel}:${i + 1}`);
    });
  }
  assert.deepEqual(offenders, [], `Import NEVER_USE_ALONE from content/hotlines.js instead of hard-coding:\n${offenders.join('\n')}`);
});

test('any hard-coded Never Use Alone number elsewhere matches the hotlines.js primary', () => {
  // The first phone number written right after "Never Use Alone" must be the primary line.
  const nuaNumber = /Never Use Alone[^0-9\n]{0,60}?((?:1-)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/gi;
  const offenders = [];
  for (const file of walk(jsRoot)) {
    const rel = path.relative(root, file);
    if (ALLOWLIST.has(rel)) continue;
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const m of line.matchAll(nuaNumber)) {
        if (m[0].includes('NEVER_USE_ALONE')) continue; // number comes from the constant
        const d = m[1].replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
        if (d !== '8004843731') offenders.push(`${rel}:${i + 1} ${m[1]}`);
      }
    });
  }
  assert.deepEqual(offenders, []);
});
