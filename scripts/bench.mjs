#!/usr/bin/env node
// Dev-only performance report. No dependencies; nothing here ships to users.
//
//   node scripts/bench.mjs            everything
//   node scripts/bench.mjs startup    just one section (startup|lookups|http|sizes|modules)
//
// Numbers are medians, so one noisy run does not skew them.
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync, brotliCompressSync, constants as zc } from 'node:zlib';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv[2];
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const gz = (b) => gzipSync(b, { level: 9 }).length;
const br = (b) => brotliCompressSync(b, { params: { [zc.BROTLI_PARAM_QUALITY]: 11 } }).length;

function section(name, fn) {
  if (only && only !== name) return;
  console.log(`\n## ${name}`);
  return fn();
}

// Fresh process per sample: this is what a serverless cold start pays.
section('startup', () => {
  const code = `
    const t0 = performance.now();
    const { createApp } = await import(${JSON.stringify(pathToFileURL(path.join(ROOT, 'src/app.js')).href)});
    const t1 = performance.now();
    const app = createApp({ logger: { error() {} } });
    const t2 = performance.now();
    globalThis.gc?.(); globalThis.gc?.();
    const m1 = process.memoryUsage();
    // Then the first request of each kind, through the real handler.
    const call = (url) => new Promise((resolve) => {
      const req = { method: 'GET', url, headers: {}, socket: { remoteAddress: '127.0.0.1' } };
      const res = { writeHead() {}, end: resolve };
      app(req, res);
    });
    const t3 = performance.now();
    await call('/api/geocode?q=10001');
    const t4 = performance.now();
    await call('/api/health-centers?lat=40.75&lng=-73.99&radius=25');
    const t5 = performance.now();
    globalThis.gc?.(); globalThis.gc?.();
    const m2 = process.memoryUsage();
    globalThis.keep = app;
    console.log(JSON.stringify({
      importMs: t1 - t0, createMs: t2 - t1, totalMs: t2 - t0, rss: m1.rss, heap: m1.heapUsed,
      geocodeMs: t4 - t3, hcMs: t5 - t4, allMs: t5 - t0 - (t3 - t2), rssAll: m2.rss, heapAll: m2.heapUsed,
    }));
  `;
  const runs = [];
  for (let i = 0; i < 9; i++) {
    const r = spawnSync(process.execPath, ['--expose-gc', '--input-type=module', '-e', code], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(r.stderr);
    runs.push(JSON.parse(r.stdout.trim().split('\n').at(-1)));
  }
  const pick = (k) => median(runs.map((r) => r[k]));
  const mb = (k) => `${(pick(k) / 2 ** 20).toFixed(1)} MB`;
  console.log(`import modules                    ${pick('importMs').toFixed(1)} ms`);
  console.log(`createApp()                       ${pick('createMs').toFixed(1)} ms`);
  console.log(`ready to serve (import + create)  ${pick('totalMs').toFixed(1)} ms   RSS ${mb('rss')}, heap ${mb('heap')}`);
  console.log(`first /api/geocode                ${pick('geocodeMs').toFixed(1)} ms`);
  console.log(`first /api/health-centers         ${pick('hcMs').toFixed(1)} ms`);
  console.log(`everything loaded                 ${pick('allMs').toFixed(1)} ms   RSS ${mb('rssAll')}, heap ${mb('heapAll')}`);
});

function timeOp(fn, minMs = 300) {
  for (let i = 0; i < 20; i++) fn(); // warm up
  const samples = [];
  const end = performance.now() + minMs;
  while (performance.now() < end || samples.length < 30) {
    const t = performance.now();
    fn();
    samples.push(performance.now() - t);
  }
  return median(samples) * 1000; // microseconds
}

await section('lookups', async () => {
  const { loadData } = await import(pathToFileURL(path.join(ROOT, 'src/data.js')).href);
  const { createGeocoder } = await import(pathToFileURL(path.join(ROOT, 'src/geo.js')).href);
  const { createHealthCenterIndex } = await import(pathToFileURL(path.join(ROOT, 'src/healthCenters.js')).href);
  const data = loadData();
  const geo = createGeocoder({ zcta: data.zcta, places: data.places });
  const hc = createHealthCenterIndex(data.healthCenters);

  const keystrokes = ['po', 'por', 'port', 'portl', 'portla', 'portlan', 'portland', 'portland,', 'portland, o', 'portland, or'];
  const queries = {
    'ZIP 98225': () => geo.lookup('98225'),
    'ZIP 10001 (Manhattan)': () => geo.lookup('10001'),
    'ZIP 85001 (PO box fallback)': () => geo.lookup('85001'),
    'city "sa" (2 chars)': () => geo.lookup('sa'),
    'city "Portland, OR"': () => geo.lookup('Portland, OR'),
    'city "honolulu" (later word)': () => geo.lookup('honolulu'),
    'typing "portland, or" (10 calls)': () => { for (const k of keystrokes) geo.lookup(k); },
    'health centers NYC 5 mi': () => hc.search({ lat: 40.75, lng: -73.99, radiusMiles: 5 }),
    'health centers NYC 100 mi': () => hc.search({ lat: 40.75, lng: -73.99, radiusMiles: 100 }),
    'health centers rural MT 25 mi': () => hc.search({ lat: 47.05, lng: -109.43, radiusMiles: 25 }),
  };
  for (const [name, fn] of Object.entries(queries)) {
    console.log(`${name.padEnd(36)} ${timeOp(fn).toFixed(1).padStart(8)} µs`);
  }
});

await section('http', async () => {
  const { createApp } = await import(pathToFileURL(path.join(ROOT, 'src/app.js')).href);
  const sample = readFileSync(path.join(ROOT, 'test/fixtures/findtreatment-sample.json'));
  let upstreamCalls = 0;
  const handler = createApp({
    rateLimit: { windowMs: 60_000, max: 1e9 },
    logger: { error() {} },
    fetchImpl: async () => {
      upstreamCalls++;
      await new Promise((r) => setTimeout(r, 50)); // pretend SAMHSA takes 50 ms
      return new Response(sample, { status: 200 });
    },
  });
  const server = createServer(handler);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = { 'Accept-Encoding': 'gzip, br' };

  async function latency(url, n = 200) {
    const xs = [];
    for (let i = 0; i < n; i++) {
      const t = performance.now();
      const res = await fetch(base + url, { headers });
      await res.arrayBuffer();
      xs.push(performance.now() - t);
    }
    return median(xs);
  }
  const rows = {
    'GET /api/geocode?q=port': '/api/geocode?q=port',
    'GET /api/geocode?q=10001': '/api/geocode?q=10001',
    'GET /api/health-centers 25 mi': '/api/health-centers?lat=40.75&lng=-73.99&radius=25',
    'GET /api/treatment (cached)': '/api/treatment?lat=48.75&lng=-122.48&radius=25',
    'GET /js/app.js': '/js/app.js',
  };
  for (const [name, url] of Object.entries(rows)) {
    console.log(`${name.padEnd(36)} ${(await latency(url)).toFixed(2).padStart(8)} ms`);
  }

  // Ten visitors in the same area search at the same moment.
  upstreamCalls = 0;
  const t = performance.now();
  await Promise.all(Array.from({ length: 10 }, () => fetch(`${base}/api/treatment?lat=40.71&lng=-74.01&radius=10`).then((r) => r.arrayBuffer())));
  console.log(`10 identical concurrent searches     ${(performance.now() - t).toFixed(0).padStart(5)} ms, ${upstreamCalls} upstream call(s)`);

  const res = await fetch(`${base}/api/treatment?lat=48.75&lng=-122.48&radius=25`, { headers });
  const raw = await fetch(`${base}/api/treatment?lat=48.75&lng=-122.48&radius=25`, { headers: { 'Accept-Encoding': 'identity' } });
  console.log(`treatment response (2 listings)      ${kb(Number(res.headers.get('content-length')))} ${res.headers.get('content-encoding') ?? 'identity'}, ${kb((await raw.arrayBuffer()).byteLength)} raw`);
  server.close();
});

section('sizes', () => {
  console.log('data file              raw         gzip        brotli');
  let total = 0;
  for (const f of readdirSync(path.join(ROOT, 'data')).sort()) {
    const b = readFileSync(path.join(ROOT, 'data', f));
    total += b.length;
    console.log(`${f.padEnd(22)} ${kb(b.length).padStart(10)}  ${kb(gz(b)).padStart(10)}  ${kb(br(b)).padStart(10)}`);
  }
  console.log(`${'total'.padEnd(22)} ${kb(total).padStart(10)}`);

  const files = [];
  const walk = (d) => {
    for (const n of readdirSync(d)) {
      const full = path.join(d, n);
      if (statSync(full).isDirectory()) walk(full);
      else files.push(full);
    }
  };
  walk(path.join(ROOT, 'public'));
  let raw = 0;
  let g = 0;
  let b = 0;
  for (const f of files) {
    const body = readFileSync(f);
    raw += body.length;
    g += gz(body);
    b += br(body);
  }
  console.log(`public/ (${files.length} files)       ${kb(raw).padStart(10)}  ${kb(g).padStart(10)}  ${kb(b).padStart(10)}`);
});

section('modules', () => {
  const jsRoot = path.join(ROOT, 'public');
  const html = readFileSync(path.join(jsRoot, 'index.html'), 'utf8');
  const entry = html.match(/<script type="module" src="([^"]+)"/)[1];
  const preloaded = new Set([...html.matchAll(/<link rel="modulepreload" href="([^"]+)"/g)].map((m) => m[1]));
  // Breadth-first: a module is requested once its first importer is parsed.
  // `depth` ignores preloads; `effective` counts a preloaded module as
  // requested straight from the HTML.
  const depth = new Map();
  const effectiveDepth = new Map();
  const queue = [[entry, 1, 1]];
  let bytes = 0;
  while (queue.length) {
    const [url, d, e] = queue.shift();
    const eff = preloaded.has(url) ? 1 : e;
    if (depth.has(url)) {
      effectiveDepth.set(url, Math.min(effectiveDepth.get(url), eff));
      continue;
    }
    depth.set(url, d);
    effectiveDepth.set(url, eff);
    const src = readFileSync(path.join(jsRoot, url), 'utf8');
    bytes += Buffer.byteLength(src);
    for (const m of src.matchAll(/^import\s[^'"]*['"]([^'"]+)['"]/gm)) {
      queue.push([new URL(m[1], `http://x${url}`).pathname, d + 1, eff + 1]);
    }
  }
  const maxDepth = Math.max(...depth.values());
  const effective = Math.max(...effectiveDepth.values());
  console.log(`static modules         ${depth.size} (${kb(bytes)} raw)`);
  console.log(`import chain depth     ${maxDepth} round trips after the HTML`);
  console.log(`with modulepreload     ${effective} round trip(s) after the HTML (${preloaded.size} preloaded)`);
});
