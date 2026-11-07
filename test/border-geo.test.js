import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApp } from '../src/app.js';
import {
  BORDERING_STATES,
  getBorderingStates,
  resolveBorderRegions,
  isBorderZip,
  describeRegion,
} from '../src/regions.js';

describe('Border-State Geo & Adjacency Registry (Unit Tests)', () => {
  test('getBorderingStates returns correct adjacent state codes for boundary states', () => {
    // Washington: Pacific Northwest boundary
    const waBorders = getBorderingStates('WA');
    assert.deepEqual(waBorders, ['ID', 'OR']);

    // Missouri: Gateway arch / 8-state border crossroad
    const moBorders = getBorderingStates('MO');
    assert.equal(moBorders.length, 8);
    for (const expected of ['IA', 'IL', 'KY', 'TN', 'AR', 'OK', 'KS', 'NE']) {
      assert.ok(moBorders.includes(expected), `MO should border ${expected}`);
    }

    // District of Columbia: Capitol region between MD and VA
    const dcBorders = getBorderingStates('DC');
    assert.deepEqual(dcBorders, ['MD', 'VA']);

    // Florida: Southeastern peninsula bordering AL and GA
    const flBorders = getBorderingStates('FL');
    assert.deepEqual(flBorders, ['AL', 'GA']);

    // Maine: Single-state border boundary (NH)
    const meBorders = getBorderingStates('ME');
    assert.deepEqual(meBorders, ['NH']);

    // California: Pacific coast bordering AZ, NV, OR
    const caBorders = getBorderingStates('CA');
    assert.deepEqual(caBorders, ['AZ', 'NV', 'OR']);
  });

  test('getBorderingStates returns empty array for island jurisdictions and non-contiguous states', () => {
    // Hawaii (island state)
    assert.deepEqual(getBorderingStates('HI'), []);

    // Alaska (non-contiguous state, shares borders with Canada only)
    assert.deepEqual(getBorderingStates('AK'), []);

    // Territories
    assert.deepEqual(getBorderingStates('PR'), []);
    assert.deepEqual(getBorderingStates('GU'), []);
    assert.deepEqual(getBorderingStates('VI'), []);
    assert.deepEqual(getBorderingStates('AS'), []);
    assert.deepEqual(getBorderingStates('MP'), []);

    // Freely associated states
    assert.deepEqual(getBorderingStates('FM'), []);
    assert.deepEqual(getBorderingStates('MH'), []);
    assert.deepEqual(getBorderingStates('PW'), []);
  });

  test('getBorderingStates handles case-insensitivity and whitespace gracefully', () => {
    assert.deepEqual(getBorderingStates('wa'), ['ID', 'OR']);
    assert.deepEqual(getBorderingStates('  DC  '), ['MD', 'VA']);
    assert.deepEqual(getBorderingStates('Fl'), ['AL', 'GA']);
    assert.deepEqual(getBorderingStates('\nmo\t'), ['IA', 'IL', 'KY', 'TN', 'AR', 'OK', 'KS', 'NE']);
  });

  test('getBorderingStates error handling: invalid or non-string state codes return empty array safely', () => {
    assert.doesNotThrow(() => getBorderingStates('INVALID'));
    assert.deepEqual(getBorderingStates('INVALID'), []);

    assert.doesNotThrow(() => getBorderingStates('ZZ'));
    assert.deepEqual(getBorderingStates('ZZ'), []);

    assert.doesNotThrow(() => getBorderingStates(''));
    assert.deepEqual(getBorderingStates(''), []);

    assert.doesNotThrow(() => getBorderingStates(null));
    assert.deepEqual(getBorderingStates(null), []);

    assert.doesNotThrow(() => getBorderingStates(undefined));
    assert.deepEqual(getBorderingStates(undefined), []);

    assert.doesNotThrow(() => getBorderingStates(123));
    assert.deepEqual(getBorderingStates(123), []);

    assert.doesNotThrow(() => getBorderingStates({ code: 'WA' }));
    assert.deepEqual(getBorderingStates({ code: 'WA' }), []);

    assert.doesNotThrow(() => getBorderingStates(['WA']));
    assert.deepEqual(getBorderingStates(['WA']), []);
  });

  test('getBorderingStates returns immutable copy preventing state corruption', () => {
    const borders = getBorderingStates('WA');
    borders.push('CA');
    const freshBorders = getBorderingStates('WA');
    assert.deepEqual(freshBorders, ['ID', 'OR']);
  });

  test('adjacency graph symmetry across all 50 states + DC', () => {
    const allCodes = Object.keys(BORDERING_STATES);
    assert.ok(allCodes.length >= 51, 'Registry must cover all 50 states + DC');

    for (const [state, neighbors] of Object.entries(BORDERING_STATES)) {
      for (const neighbor of neighbors) {
        const reciprocal = BORDERING_STATES[neighbor];
        assert.ok(
          reciprocal,
          `Neighbor ${neighbor} of ${state} must exist in registry`
        );
        assert.ok(
          reciprocal.includes(state),
          `Symmetry broken: ${state} lists ${neighbor}, but ${neighbor} does not list ${state}`
        );
      }
    }
  });

  test('resolveBorderRegions resolves enriched health agency and Medicaid portals', () => {
    const waResolved = resolveBorderRegions('WA');
    assert.equal(waResolved.length, 2);

    const idRecord = waResolved.find((s) => s.code === 'ID');
    assert.ok(idRecord, 'Idaho should be resolved for WA');
    assert.equal(idRecord.name, 'Idaho');
    assert.equal(idRecord.agencyName, 'Idaho Department of Health and Welfare');
    assert.ok(idRecord.medicaidPortal, 'Idaho should have a Medicaid portal');
    assert.equal(idRecord.medicaidAgency, 'Idaho Department of Health & Welfare');

    const orRecord = waResolved.find((s) => s.code === 'OR');
    assert.ok(orRecord, 'Oregon should be resolved for WA');
    assert.equal(orRecord.name, 'Oregon');
    assert.equal(orRecord.agencyName, 'Oregon Health Authority');
    assert.ok(orRecord.medicaidPortal, 'Oregon should have a Medicaid portal');
  });

  test('resolveBorderRegions handles ZIP input and invalid cases safely', () => {
    // 98101 is Seattle, WA
    const zipResolved = resolveBorderRegions('98101');
    assert.equal(zipResolved.length, 2);
    assert.ok(zipResolved.some((r) => r.code === 'ID'));
    assert.ok(zipResolved.some((r) => r.code === 'OR'));

    // Island state HI
    assert.deepEqual(resolveBorderRegions('HI'), []);
    assert.deepEqual(resolveBorderRegions('PR'), []);

    // Invalid inputs
    assert.deepEqual(resolveBorderRegions('INVALID'), []);
    assert.deepEqual(resolveBorderRegions(null), []);
    assert.deepEqual(resolveBorderRegions(''), []);
    assert.deepEqual(resolveBorderRegions('00000'), []);
  });

  test('isBorderZip correctly flags ZIP codes that cross state borders', () => {
    // 99362 (Walla Walla, WA / Milton-Freewater, OR border)
    assert.equal(isBorderZip('99362'), true);

    // 51640 (Hamburg, IA near Missouri line)
    assert.equal(isBorderZip('51640'), true);

    // 98101 (Seattle central, wholly within WA)
    assert.equal(isBorderZip('98101'), false);

    // Invalid inputs
    assert.equal(isBorderZip('invalid'), false);
    assert.equal(isBorderZip(''), false);
    assert.equal(isBorderZip(null), false);
    assert.equal(isBorderZip(98101), false);
  });

  test('Fast O(1) memory lookup benchmark operates with zero latency', () => {
    const start = performance.now();
    const testCodes = ['WA', 'MO', 'DC', 'FL', 'HI', 'PR', 'NY', 'CA', 'TX', 'INVALID'];
    for (let i = 0; i < 50_000; i++) {
      const code = testCodes[i % testCodes.length];
      const res = getBorderingStates(code);
      assert.ok(Array.isArray(res));
    }
    const elapsed = performance.now() - start;
    assert.ok(elapsed < 100, `50,000 lookups must take < 100ms, took ${elapsed.toFixed(2)}ms`);
  });
});

describe('Border-State Geo Integration Tests (HTTP Server)', () => {
  let server;
  let baseUrl;
  const loggedErrors = [];

  before(async () => {
    const handler = createApp({
      fetchImpl: async () => new Response(JSON.stringify({ rows: [] }), { status: 200 }),
      logger: {
        error(msg) { loggedErrors.push(msg); },
        warn() {},
        info() {},
      },
    });
    server = createServer(handler);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(() => new Promise((resolve) => server.close(resolve)));

  test('GET /api/region?zip=98101 returns borderingStates including ID and OR', async () => {
    const res = await fetch(`${baseUrl}/api/region?zip=98101`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/json; charset=utf-8');
    assert.equal(res.headers.get('cache-control'), 'no-store');

    const body = await res.json();
    assert.equal(body.region.code, 'WA');
    assert.equal(body.region.name, 'Washington');

    assert.ok(Array.isArray(body.borderingStates), 'borderingStates must be an array');
    assert.equal(body.borderingStates.length, 2);

    const idEntry = body.borderingStates.find((s) => s.code === 'ID');
    assert.ok(idEntry, 'borderingStates must contain ID');
    assert.equal(idEntry.name, 'Idaho');

    const orEntry = body.borderingStates.find((s) => s.code === 'OR');
    assert.ok(orEntry, 'borderingStates must contain OR');
    assert.equal(orEntry.name, 'Oregon');
  });

  test('GET /api/region returns borderingStates for Missouri (MO) and DC', async () => {
    // 64101 is Kansas City, MO
    const moRes = await fetch(`${baseUrl}/api/region?zip=64101`);
    assert.equal(moRes.status, 200);
    const moBody = await moRes.json();
    assert.equal(moBody.region.code, 'MO');
    assert.equal(moBody.borderingStates.length, 8);
    const moCodes = moBody.borderingStates.map((s) => s.code);
    assert.ok(moCodes.includes('KS'));
    assert.ok(moCodes.includes('IL'));
    assert.ok(moCodes.includes('IA'));

    // 20001 is Washington, DC
    const dcRes = await fetch(`${baseUrl}/api/region?zip=20001`);
    assert.equal(dcRes.status, 200);
    const dcBody = await dcRes.json();
    assert.equal(dcBody.region.code, 'DC');
    assert.deepEqual(
      dcBody.borderingStates,
      [
        { code: 'MD', name: 'Maryland' },
        { code: 'VA', name: 'Virginia' },
      ]
    );
  });

  test('GET /api/region returns empty borderingStates for island jurisdictions', async () => {
    // Hawaii (Honolulu 96815)
    const hiRes = await fetch(`${baseUrl}/api/region?zip=96815`);
    assert.equal(hiRes.status, 200);
    const hiBody = await hiRes.json();
    assert.equal(hiBody.region.code, 'HI');
    assert.deepEqual(hiBody.borderingStates, []);

    // Puerto Rico (San Juan 00901)
    const prRes = await fetch(`${baseUrl}/api/region?zip=00901`);
    assert.equal(prRes.status, 200);
    const prBody = await prRes.json();
    assert.equal(prBody.region.code, 'PR');
    assert.deepEqual(prBody.borderingStates, []);

    // Guam (96910)
    const guRes = await fetch(`${baseUrl}/api/region?zip=96910`);
    assert.equal(guRes.status, 200);
    const guBody = await guRes.json();
    assert.equal(guBody.region.code, 'GU');
    assert.deepEqual(guBody.borderingStates, []);
  });

  test('GET /api/region handles invalid ZIP gracefully with empty borderingStates', async () => {
    const res = await fetch(`${baseUrl}/api/region?zip=00000`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.region, null);
    assert.deepEqual(body.nearby, []);
    assert.deepEqual(body.borderingStates, []);
  });

  test('GET /api/region resolves borderingStates by coarsened coordinates', async () => {
    // Vancouver, WA coordinates (lat 45.63, lng -122.67)
    const res = await fetch(`${baseUrl}/api/region?lat=45.63&lng=-122.67`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.region.code, 'WA');
    assert.ok(Array.isArray(body.borderingStates));
    assert.ok(body.borderingStates.some((s) => s.code === 'OR'));
    assert.ok(body.borderingStates.some((s) => s.code === 'ID'));
  });

  test('GET /api/nearby-summary attaches borderingStates alongside networks and agency', async () => {
    const res = await fetch(`${baseUrl}/api/nearby-summary?lat=45.63&lng=-122.67&radius=25`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.region.code, 'WA');
    assert.ok(Array.isArray(body.borderingStates), 'borderingStates must be array');
    assert.ok(body.borderingStates.some((s) => s.code === 'OR'));
    assert.ok(body.borderingStates.some((s) => s.code === 'ID'));
    assert.ok(body.agency?.name, 'State agency included');
    assert.ok(body.medicaid?.agency, 'Medicaid agency included');
  });

  test('Coarsened, Zero-PII contract: query strings with tracking or sensitive parameters are scrubbed', async () => {
    const dirtyUrl = `${baseUrl}/api/region?zip=98101&dob=1990-01-01&phone=2065550199&utm_source=tracker`;
    const res = await fetch(dirtyUrl);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.region.code, 'WA');
    assert.ok(body.borderingStates.length > 0);

    // Verify logged errors never leaked visitor PII
    for (const log of loggedErrors) {
      assert.ok(!log.includes('1990-01-01'), 'Must not log DOB');
      assert.ok(!log.includes('2065550199'), 'Must not log phone');
      assert.ok(!log.includes('utm_source'), 'Must not log tracking params');
    }
  });
});
