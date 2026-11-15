// Link check: one GET for every distinct https:// link in public/js and
// public/index.html. Needs network access, so it is not part of `npm test`:
//   node scripts/check-links.mjs
// Prints dead links (404, 410, or a host that does not resolve) with where they
// are used, and exits 1 when there are any. Sites that refuse automated
// requests (401, 403, 429) are listed separately to check by hand.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return name.endsWith('.js') ? [full] : [];
  });
}

// http:// values are FHIR code-system identifiers and harborpath.org ones are
// this project's own identifiers; neither is a page anyone opens.
const LINK = /https:\/\/(?!harborpath\.org)[^\s'"`)<>\\]+/g;
const links = new Map(); // url -> first place it is used
for (const file of [...walk(path.join(PUBLIC_DIR, 'js')), path.join(PUBLIC_DIR, 'index.html')]) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const [match] of line.matchAll(LINK)) {
      const url = match.replace(/[.,;:]+$/, '');
      if (url.includes('${')) continue; // built at runtime
      if (!links.has(url)) links.set(url, `${path.relative(PUBLIC_DIR, file).split(path.sep).join('/')}:${i + 1}`);
    }
  });
}

const INITIAL_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; link-check)',
  Accept: 'text/html,*/*',
};

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Upgrade-Insecure-Requests': '1',
};

const BOT_BLOCK_STATUSES = new Set([202, 203, 401, 403, 405, 406, 429]);

async function fetchStatus(url, headers) {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(20_000),
    headers,
  });
  await res.body?.cancel();
  return res.status;
}

async function status(url) {
  try {
    const first = await fetchStatus(url, INITIAL_HEADERS);
    if (BOT_BLOCK_STATUSES.has(first)) {
      return await fetchStatus(url, BROWSER_HEADERS);
    }
    return first;
  } catch (err) {
    return String(err?.cause?.code ?? err?.name ?? err);
  }
}

const queue = [...links.keys()];
const results = [];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const url = queue.shift();
    results.push({ url, status: await status(url) });
  }
}));

const dead = results.filter((r) => r.status === 404 || r.status === 410 || r.status === 'ENOTFOUND');
const unsure = results.filter((r) => !dead.includes(r) && r.status !== 200);
const show = (r) => console.log(`  ${r.status}  ${r.url}  (${links.get(r.url)})`);
console.log(`${results.length} links checked: ${dead.length} dead, ${unsure.length} to check by hand`);
if (dead.length) console.log('Dead:');
dead.forEach(show);
if (unsure.length) console.log('Could not confirm (the site refused or timed out):');
unsure.forEach(show);
process.exit(dead.length ? 1 : 0);
