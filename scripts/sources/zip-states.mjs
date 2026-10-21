// Census 2020 ZCTA-to-county relationship file -> data/zip-states.json
//
// src/regions.js maps a ZIP to its state with the USPS 3-digit prefix table.
// This dataset holds only the ZIP areas where Census geography says more:
//   - ZIP areas that lie entirely in another state than their prefix suggests
//     (06390 Fishers Island is in New York; 96950 Saipan is in the Northern
//     Mariana Islands, not Guam), and
//   - ZIP areas that cross a state line. The first state is the mailing state
//     (the prefix state); the rest hold a meaningful share of the ZIP's land.
// Shape: { "06390": ["NY"], "79837": ["TX", "NM"] }
//
// The build also checks the prefix table: for every 3-digit prefix with ZIP
// areas, the state holding most of them must be the table's state.
import { download, parsePipeTable } from '../lib/fetch.mjs';
import { FIPS_TO_CODE, prefixState } from '../../src/regions.js';

const url = 'https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt';

// A part of a ZIP area in another state counts when it is at least this share
// of the ZIP's land and this many square kilometers. Smaller parts are mostly
// slivers where boundary lines disagree.
const MIN_SHARE = 0.02;
const MIN_KM2 = 1;

export default {
  id: 'zipStates',
  file: 'zip-states.json',
  async build() {
    const { buf, lastModified } = await download(url);
    const rows = parsePipeTable(buf.toString('utf8').replace(/^﻿/, ''));

    const land = new Map(); // zcta -> Map(state -> land m2)
    for (const r of rows) {
      const zcta = r.GEOID_ZCTA5_20;
      const state = FIPS_TO_CODE[(r.GEOID_COUNTY_20 || '').slice(0, 2)];
      if (!zcta || !state) continue;
      const parts = land.get(zcta) ?? new Map();
      parts.set(state, (parts.get(state) ?? 0) + Number(r.AREALAND_PART || 0));
      land.set(zcta, parts);
    }

    const out = {};
    const majority = new Map(); // prefix -> Map(state -> count)
    for (const [zcta, parts] of land) {
      const total = [...parts.values()].reduce((a, b) => a + b, 0);
      const ranked = [...parts.entries()].sort((a, b) => b[1] - a[1]);
      const prefix = zcta.slice(0, 3);
      const tally = majority.get(prefix) ?? new Map();
      tally.set(ranked[0][0], (tally.get(ranked[0][0]) ?? 0) + 1);
      majority.set(prefix, tally);

      const meaningful = ranked
        .filter(([, m2], i) => i === 0 || (m2 >= MIN_KM2 * 1e6 && m2 >= total * MIN_SHARE))
        .map(([state]) => state);
      const mailing = prefixState(prefix);
      if (meaningful.length === 1) {
        if (meaningful[0] !== mailing) out[zcta] = meaningful;
        continue;
      }
      // Cross-border ZIP: lead with the mailing state when it holds part of it.
      const primary = meaningful.includes(mailing) ? mailing : meaningful[0];
      out[zcta] = [primary, ...meaningful.filter((s) => s !== primary)];
    }

    const disagreements = [];
    for (const [prefix, tally] of majority) {
      const top = [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0];
      if (top !== prefixState(prefix)) disagreements.push(`${prefix}: table ${prefixState(prefix)}, Census ${top}`);
    }
    if (disagreements.length) {
      throw new Error(`USPS prefix table in src/regions.js disagrees with Census:\n${disagreements.join('\n')}`);
    }

    const data = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
    const crossBorder = Object.values(data).filter((s) => s.length > 1).length;
    return {
      data,
      meta: { url, lastModified, zctas: land.size, exceptions: Object.keys(data).length, crossBorder, prefixesChecked: majority.size },
    };
  },
};
