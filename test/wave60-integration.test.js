import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { LAZY_LOADERS, ROUTE_TITLES } from '../public/js/app.js';
import { TOOL_CATALOG, TOOL_KEYWORDS, filterCareTools } from '../public/js/views/tools.js';
import esDict from '../public/js/locales/es.js';
import esToolsDict from '../public/js/locales/es-tools.js';
import { createApp } from '../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

test('Wave 60: LAZY_LOADERS and ROUTE_TITLES registered in app.js', () => {
  assert.equal(typeof LAZY_LOADERS['burn-toxicology'], 'function');
  assert.equal(typeof LAZY_LOADERS['embed'], 'function');
  assert.equal(typeof LAZY_LOADERS['outreach'], 'function');

  assert.ok(ROUTE_TITLES['burn-toxicology']().length > 0);
  assert.ok(ROUTE_TITLES['embed']().length > 0);
  assert.ok(ROUTE_TITLES['outreach']().length > 0);
});

test('Wave 60: TOOL_CATALOG and TOOL_KEYWORDS entries in tools.js', () => {
  const burnTool = TOOL_CATALOG.find((t) => t.id === 'burn-toxicology');
  const embedTool = TOOL_CATALOG.find((t) => t.id === 'embed');
  const outreachTool = TOOL_CATALOG.find((t) => t.id === 'outreach');

  assert.ok(burnTool, 'burn-toxicology must be present in TOOL_CATALOG');
  assert.ok(embedTool, 'embed must be present in TOOL_CATALOG');
  assert.ok(outreachTool, 'outreach must be present in TOOL_CATALOG');

  assert.equal(burnTool.category, 'emergency');
  assert.equal(embedTool.category, 'planning');
  assert.equal(outreachTool.category, 'harm-reduction');

  assert.ok(TOOL_KEYWORDS['burn-toxicology']?.length > 0);
  assert.ok(TOOL_KEYWORDS['embed']?.length > 0);
  assert.ok(TOOL_KEYWORDS['outreach']?.length > 0);

  // Search filterCareTools integration
  const searchBurn = filterCareTools({ query: 'hydrofluoric' });
  assert.ok(searchBurn.some((t) => t.id === 'burn-toxicology'));

  const searchEmbed = filterCareTools({ query: 'widget' });
  assert.ok(searchEmbed.some((t) => t.id === 'embed'));

  const searchOutreach = filterCareTools({ query: 'pocket card' });
  assert.ok(searchOutreach.some((t) => t.id === 'outreach'));
});

test('Wave 60: Spanish localization dictionaries cover all new routes and tools', () => {
  assert.ok(esDict['route.burnToxicology'], 'Spanish route title for burnToxicology must exist');
  assert.ok(esDict['route.embed'], 'Spanish route title for embed must exist');
  assert.ok(esDict['route.outreach'], 'Spanish route title for outreach must exist');

  assert.ok(esToolsDict['tools.item.burn-toxicology.title']);
  assert.ok(esToolsDict['tools.item.burn-toxicology.description']);
  assert.ok(esToolsDict['tools.item.embed.title']);
  assert.ok(esToolsDict['tools.item.embed.description']);
  assert.ok(esToolsDict['tools.item.outreach.title']);
  assert.ok(esToolsDict['tools.item.outreach.description']);
});

test('Wave 60: Service worker ELECTIVE_SHELL caches new clinical views', () => {
  const swContent = readFileSync(path.join(ROOT_DIR, 'public', 'sw.js'), 'utf8');
  assert.match(swContent, /'\/js\/views\/burnToxicology\.js'/);
  assert.match(swContent, /'\/js\/views\/embedBuilder\.js'/);
  assert.match(swContent, /'\/js\/views\/outreachMaterials\.js'/);
});

test('Wave 60: Backend GET /api/directory/summary returns comprehensive syndication metrics', async () => {
  const app = createApp();

  const req = {
    method: 'GET',
    url: '/api/directory/summary',
    headers: { host: 'localhost' },
    on: () => {},
  };

  let statusCode = null;
  let headers = {};
  let body = '';

  const res = {
    writeHead(code, h) {
      statusCode = code;
      headers = h;
    },
    end(data) {
      if (data) body = typeof data === 'string' ? data : data.toString('utf8');
    },
  };

  await app(req, res);

  assert.equal(statusCode, 200);
  assert.match(headers['Content-Type'], /application\/json/);
  const data = JSON.parse(body);
  assert.equal(data.service, 'HarborPath Care Directory & Clinical Navigation');
  assert.ok(data.coverage.states >= 50);
  assert.ok(data.coverage.federallyQualifiedHealthCenters >= 10000);
  assert.ok(data.coverage.emergencyDepartments >= 4000);
  assert.ok(data.privacy.zeroPiiPosture);
});
