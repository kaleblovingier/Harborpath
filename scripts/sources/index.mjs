// Registry of datasets built by `npm run data:build`. To add a dataset, create
// a module in this folder that default-exports { id, file, build() } where
// build() resolves to { data, meta }, then add it to this list.
import serviceCodes from './service-codes.mjs';
import zcta from './zcta.mjs';
import places from './places.mjs';
import healthCenters from './health-centers.mjs';
import zipStates from './zip-states.mjs';
import islandPlaces from './island-places.mjs';
import stateAgencies from './state-agencies.mjs';
import stateMedicaid from './state-medicaid.mjs';
import vaFacilities from './va-facilities.mjs';
import ihsFacilities from './ihs-facilities.mjs';
import erHospitals from './er-hospitals.mjs';
import ruralHealthClinics from './rural-health-clinics.mjs';

export const SOURCES = [
  serviceCodes,
  zcta,
  places,
  healthCenters,
  zipStates,
  islandPlaces,
  stateAgencies,
  stateMedicaid,
  vaFacilities,
  ihsFacilities,
  erHospitals,
  ruralHealthClinics,
];
