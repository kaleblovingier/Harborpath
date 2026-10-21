// Distance search over HRSA-funded health center sites (data/health-centers.json).
// Health centers must serve everyone regardless of ability to pay and offer a
// sliding fee scale, so they are a key safety-net option for uninsured people.
import { haversineMiles } from './geo.js';
import { decodeTable, isTable } from './columns.js';
import { createGrid } from './grid.js';

// The data file is a column table (see columns.js); an array of site objects
// also works. Sites become objects only when they are returned.
function readSites(sites) {
  if (!isTable(sites)) {
    return {
      count: sites.length,
      lat: Float64Array.from(sites, (s) => s.lat),
      lng: Float64Array.from(sites, (s) => s.lng),
      get: (i) => sites[i],
    };
  }
  const { count, columns } = decodeTable(sites);
  const fields = Object.keys(columns);
  return {
    count,
    lat: columns.lat,
    lng: columns.lng,
    get(i) {
      const site = {};
      for (const f of fields) site[f] = columns[f][i];
      return site;
    },
  };
}

export function createHealthCenterIndex(data) {
  const sites = readSites(data);
  const grid = createGrid(sites.lat, sites.lng, 0.5);

  return {
    count: sites.count,

    search({ lat, lng, radiusMiles, limit = 30 }) {
      const dLat = radiusMiles / 69;
      const dLng = radiusMiles / (69 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
      const hits = [];
      grid.forEachCandidate(lat - dLat, lat + dLat, lng - dLng, lng + dLng, (i) => {
        const sLat = sites.lat[i];
        const sLng = sites.lng[i];
        if (Math.abs(sLat - lat) > dLat || Math.abs(sLng - lng) > dLng) return;
        const miles = haversineMiles(lat, lng, sLat, sLng);
        if (miles <= radiusMiles) hits.push({ i, miles: Math.round(miles * 10) / 10 });
      });
      // Nearest first; equal distances keep file order.
      hits.sort((a, b) => a.miles - b.miles || a.i - b.i);
      return {
        total: hits.length,
        results: hits.slice(0, limit).map(({ i, miles }) => ({ ...sites.get(i), miles })),
      };
    },
  };
}
