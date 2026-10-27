// Post-deploy smoke test. Usage: node scripts/smoke.mjs https://harborpath.vercel.app
// Checks that the app shell, core APIs, and privacy headers are live. It sends
// only a public ZIP code and a state; never a visitor's data.
const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const checks = [];
const check = (name, ok, detail = '') => checks.push({ name, ok: Boolean(ok), detail });

async function get(path) {
  const res = await fetch(base + path, { headers: { Accept: '*/*' }, signal: AbortSignal.timeout(20_000) });
  const text = await res.text();
  return { res, text, json: () => JSON.parse(text) };
}

try {
  const home = await get('/');
  check('GET / returns 200', home.res.status === 200, home.res.status);
  const csp = home.res.headers.get('content-security-policy') ?? '';
  check('CSP is default-src self', csp.includes("default-src 'self'"), csp.slice(0, 60));
  check('HSTS header present', home.res.headers.get('strict-transport-security'));
  check('Referrer-Policy no-referrer', home.res.headers.get('referrer-policy') === 'no-referrer');
  check('match view module served', (await get('/js/views/match.js')).res.status === 200);
  check('engine module served', (await get('/js/match/engine.js')).res.status === 200);

  const health = await get('/api/health');
  check('/api/health ok', health.res.status === 200 && health.json().ok === true);
  const geo = await get('/api/geocode?q=98101');
  check('/api/geocode resolves a ZIP', geo.res.status === 200 && geo.json().results.length > 0);
  const vp = await get('/api/virtual-providers?state=WA');
  check('/api/virtual-providers responds', vp.res.status === 200 && Array.isArray(vp.json().results), `pending=${vp.json().pendingReview}`);
  check('API responses are no-store', vp.res.headers.get('cache-control') === 'no-store');
  const tr = await get('/api/treatment?lat=47.61&lng=-122.33&radius=10&kind=sa');
  check('/api/treatment reaches FindTreatment.gov', tr.res.status === 200, tr.res.status === 200 ? `total=${tr.json().total}` : tr.text.slice(0, 80));
} catch (err) {
  check('smoke run completed', false, err.message);
}

for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}${c.detail !== '' ? `  (${c.detail})` : ''}`);
const failed = checks.filter((c) => !c.ok).length;
console.log(failed ? `\n${failed} check(s) failed` : '\nAll smoke checks passed');
process.exit(failed ? 1 : 0);
