// test/wave39-integration.test.js
// HarborPath - Wave 39 Architecture & Weather Care Integration Tests

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { LAZY_LOADERS, ROUTE_TITLES, preloadRoute, preloadAllLazyViews } from '../public/js/app.js';
import { TOOL_CATALOG, filterCareTools } from '../public/js/views/tools.js';
import es from '../public/js/locales/es.js';
import esTools from '../public/js/locales/es-tools.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

describe('Wave 39 Architecture & Weather Care Integration', () => {
  it('registers weather-care in app.js LAZY_LOADERS and ROUTE_TITLES', async () => {
    assert.strictEqual(typeof LAZY_LOADERS['weather-care'], 'function');
    const viewFn = await LAZY_LOADERS['weather-care']();
    assert.strictEqual(typeof viewFn, 'function');

    assert.strictEqual(typeof ROUTE_TITLES['weather-care'], 'function');
    const title = ROUTE_TITLES['weather-care']();
    assert.ok(typeof title === 'string' && title.length > 5);
  });

  it('preloads weather-care via preloadRoute and preloadAllLazyViews without errors', async () => {
    const loaded = await preloadRoute('weather-care');
    assert.strictEqual(typeof loaded, 'function');

    const allViews = await preloadAllLazyViews();
    assert.ok(Array.isArray(allViews));
    assert.ok(allViews.length >= 48);
  });

  it('includes weather-care in TOOL_CATALOG with complete schema and search filtering', () => {
    const entry = TOOL_CATALOG.find((t) => t.id === 'weather-care');
    assert.ok(entry, 'Missing weather-care in TOOL_CATALOG');
    assert.strictEqual(entry.path, '#/weather-care');
    assert.strictEqual(entry.category, 'emergency');
    assert.ok(entry.title.includes('Hypothermia') || entry.title.includes('frostbite'));
    assert.ok(entry.description.includes('hypothermia') || entry.description.includes('Swiss'));
    assert.deepStrictEqual(entry.audiences, ['individual', 'supporter', 'care-team']);

    // Search queries
    const resWea = filterCareTools({ query: 'weather' });
    assert.ok(resWea.some((t) => t.id === 'weather-care'));

    const resHypo = filterCareTools({ query: 'hypothermia' });
    assert.ok(resHypo.some((t) => t.id === 'weather-care'));

    const resFrost = filterCareTools({ query: 'frostbite' });
    assert.ok(resFrost.some((t) => t.id === 'weather-care'));

    const resHeat = filterCareTools({ query: 'heat stroke' });
    assert.ok(resHeat.some((t) => t.id === 'weather-care'));
  });

  it('includes /js/views/weatherCare.js in public/sw.js ELECTIVE_SHELL', () => {
    const swContent = fs.readFileSync('public/sw.js', 'utf8');
    assert.ok(
      swContent.includes("'/js/views/weatherCare.js'"),
      'weatherCare.js must be registered in ELECTIVE_SHELL in sw.js'
    );
  });

  it('provides bilingual Spanish localization keys in es.js, es-tools.js, and es-workspace.js', () => {
    assert.ok(es['route.weatherCare'], 'Missing route.weatherCare in es.js');
    assert.ok(es['route.weatherCare'].includes('hipotermia') || es['route.weatherCare'].includes('congelación'));

    assert.ok(esTools['tools.item.weather-care.title'], 'Missing tool title in es-tools.js');
    assert.ok(esTools['tools.item.weather-care.description'], 'Missing tool description in es-tools.js');
    assert.ok(esTools['tools.item.weather-care.description'].includes('hipotermia') || esTools['tools.item.weather-care.description'].includes('congelación'));

    assert.ok(esWorkspace['workspace.link.weatherCare'], 'Missing workspace.link.weatherCare in es-workspace.js');
  });

  it('integrates cross-module linkages in workspace.js, streetMedicine.js, stimulantCare.js, toxicologyTriage.js, and woundInfectious.js', () => {
    const wsContent = fs.readFileSync('public/js/views/workspace.js', 'utf8');
    assert.ok(wsContent.includes('#/weather-care'), 'Missing linkage in workspace.js');

    const streetContent = fs.readFileSync('public/js/views/streetMedicine.js', 'utf8');
    assert.ok(streetContent.includes('#/weather-care'), 'Missing linkage in streetMedicine.js');

    const stimContent = fs.readFileSync('public/js/views/stimulantCare.js', 'utf8');
    assert.ok(stimContent.includes('#/weather-care'), 'Missing linkage in stimulantCare.js');

    const toxContent = fs.readFileSync('public/js/views/toxicologyTriage.js', 'utf8');
    assert.ok(toxContent.includes('#/weather-care'), 'Missing linkage in toxicologyTriage.js');

    const woundContent = fs.readFileSync('public/js/views/woundInfectious.js', 'utf8');
    assert.ok(woundContent.includes('#/weather-care'), 'Missing linkage in woundInfectious.js');
  });

  it('maintains the 14-link primary navigation invariant in public/index.html', () => {
    const html = fs.readFileSync('public/index.html', 'utf8');
    const navMatch = html.match(/<nav[^>]*id="site-nav"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(navMatch, 'Could not locate #site-nav in public/index.html');
    const links = navMatch[1].match(/<a\s+[^>]*href="[^"]*"[^>]*>/g) || [];
    assert.strictEqual(
      links.length,
      14,
      `Primary site-nav must remain strictly at 14 links, but found ${links.length}`
    );
  });
});
