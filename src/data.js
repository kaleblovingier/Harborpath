import { readFileSync } from 'node:fs';

// Each read is a literal readFileSync(new URL(..., import.meta.url)) so that
// bundlers which trace file reads (such as Vercel's) ship these files with the
// server. Don't wrap or compute these paths: tracing would stop finding them.
//
// One loader per file lets the server parse a dataset the first time a request
// needs it: a cold start that serves a treatment search never parses the ZIP,
// place, or health center tables.
export const DATA_LOADERS = {
  serviceCodes: () => JSON.parse(readFileSync(new URL('../data/service-codes.json', import.meta.url), 'utf8')),
  zcta: () => JSON.parse(readFileSync(new URL('../data/zcta.json', import.meta.url), 'utf8')),
  places: () => JSON.parse(readFileSync(new URL('../data/places.json', import.meta.url), 'utf8')),
  healthCenters: () => JSON.parse(readFileSync(new URL('../data/health-centers.json', import.meta.url), 'utf8')),
  meta: () => JSON.parse(readFileSync(new URL('../data/meta.json', import.meta.url), 'utf8')),
  zipStates: () => JSON.parse(readFileSync(new URL('../data/zip-states.json', import.meta.url), 'utf8')),
  islandPlaces: () => JSON.parse(readFileSync(new URL('../data/island-places.json', import.meta.url), 'utf8')),
  stateAgencies: () => JSON.parse(readFileSync(new URL('../data/state-agencies.json', import.meta.url), 'utf8')),
  stateMedicaid: () => JSON.parse(readFileSync(new URL('../data/state-medicaid.json', import.meta.url), 'utf8')),
  vaFacilities: () => JSON.parse(readFileSync(new URL('../data/va-facilities.json', import.meta.url), 'utf8')),
  ihsFacilities: () => JSON.parse(readFileSync(new URL('../data/ihs-facilities.json', import.meta.url), 'utf8')),
  erHospitals: () => JSON.parse(readFileSync(new URL('../data/er-hospitals.json', import.meta.url), 'utf8')),
  ruralHealthClinics: () => JSON.parse(readFileSync(new URL('../data/rural-health-clinics.json', import.meta.url), 'utf8')),
};

/** Every dataset, parsed now. */
export function loadData() {
  return Object.fromEntries(Object.entries(DATA_LOADERS).map(([name, load]) => [name, load()]));
}

export const PUBLIC_DIR = new URL('../public/', import.meta.url);
