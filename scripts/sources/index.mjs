// Registry of datasets built by `npm run data:build`. To add a dataset, create
// a module in this folder that default-exports { id, file, build() } where
// build() resolves to { data, meta }, then add it to this list.
import serviceCodes from './service-codes.mjs';
import zcta from './zcta.mjs';
import places from './places.mjs';
import healthCenters from './health-centers.mjs';

export const SOURCES = [
  serviceCodes,
  zcta,
  places,
  healthCenters,
];
