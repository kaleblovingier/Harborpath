// Distance search over the extra provider datasets built by scripts/sources/:
// VA sites and Vet Centers, IHS/Tribal/Urban Indian facilities, hospitals with
// emergency services, and Rural Health Clinics. Each dataset is a compact JSON
// array; rows are expanded once at startup into the shape the UI renders.
import { haversineMiles } from './geo.js';
import { InputError, RADII_MILES } from './findtreatment.js';

const MAX_RESULTS = 30;

const vaDetailsUrl = (r) =>
  `https://www.va.gov/find-locations/facility/${r.k === 'vc' || r.k === 'mvc' ? 'vc' : 'vha'}_${encodeURIComponent(r.i)}`;

// type -> how to read its rows. `filters` are optional named subsets a client
// may request with ?filter=name.
export const PROVIDER_DATASETS = {
  va: {
    dataKey: 'vaFacilities',
    source: 'U.S. Department of Veterans Affairs, Veterans Health Administration',
    sourceUrl: 'https://www.va.gov/find-locations/',
    expand: (r) => ({
      category: r.k,
      building: r.b ?? null,
      detailsUrl: vaDetailsUrl(r),
    }),
    filters: {
      health: (p) => p.category !== 'vc' && p.category !== 'mvc',
      vetcenter: (p) => p.category === 'vc' || p.category === 'mvc',
    },
  },
  ihs: {
    dataKey: 'ihsFacilities',
    source: 'Indian Health Service, Office of Public Health',
    sourceUrl: 'https://www.ihs.gov/findhealthcare/',
    expand: (r) => ({
      category: r.k,
      operator: r.o,
      alias: r.al ?? null,
      serviceType: r.st ?? null,
      phone: r.p ?? null,
      website: r.w ?? null,
      hours: r.h ?? null,
      servicesText: r.sv ?? null,
      flags: r.f ?? [],
    }),
    filters: {
      bh: (p) => p.flags.includes('bh'),
      sud: (p) => p.flags.includes('sud'),
    },
  },
  er: {
    dataKey: 'erHospitals',
    source: 'Centers for Medicare & Medicaid Services (CMS)',
    sourceUrl: 'https://data.cms.gov/provider-data/dataset/xubh-q36u',
    expand: (r) => ({
      category: r.k,
      phone: r.p ?? null,
      detailsUrl: `https://www.medicare.gov/care-compare/details/hospital/${encodeURIComponent(r.i)}`,
    }),
    filters: {},
  },
  rhc: {
    dataKey: 'ruralHealthClinics',
    source: 'Centers for Medicare & Medicaid Services (CMS)',
    sourceUrl: 'https://data.cms.gov/provider-characteristics/hospitals-and-other-facilities/rural-health-clinic-enrollments',
    expand: (r) => ({
      category: 'rhc',
      org: r.o ?? null,
      street2: r.a2 ?? null,
      phone: r.p ?? null,
    }),
    filters: {},
  },
};

export const PROVIDER_TYPES = Object.keys(PROVIDER_DATASETS);

/** One row of any dataset -> the public result shape (minus distance). */
export function expandRow(type, r) {
  return {
    id: `${type}-${r.i}`,
    type,
    name: r.n,
    street: r.a ?? null,
    city: r.c ?? null,
    state: r.s ?? null,
    zip: r.z ?? null,
    lat: r.lat,
    lng: r.lng,
    approx: r.x === 1,
    ...PROVIDER_DATASETS[type].expand(r),
  };
}

function searchList(items, { lat, lng, radiusMiles, filter, limit = MAX_RESULTS }) {
  const dLat = radiusMiles / 69;
  const dLng = radiusMiles / (69 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  const hits = [];
  for (const p of items) {
    if (Math.abs(p.lat - lat) > dLat || Math.abs(p.lng - lng) > dLng) continue;
    if (filter && !filter(p)) continue;
    const miles = haversineMiles(lat, lng, p.lat, p.lng);
    if (miles <= radiusMiles) hits.push({ ...p, miles: Math.round(miles * 10) / 10 });
  }
  hits.sort((a, b) => a.miles - b.miles || a.name.localeCompare(b.name));
  return { total: hits.length, results: hits.slice(0, limit) };
}

/**
 * data: the object from loadData() (needs the four dataset arrays and meta).
 * search(params, { lat, lng }) validates type, radius, and filter from the
 * query string and throws InputError on bad input.
 */
export function createProviderSearch(data) {
  const sets = {};
  for (const [type, def] of Object.entries(PROVIDER_DATASETS)) {
    const rows = data[def.dataKey] ?? [];
    sets[type] = {
      items: rows.map((r) => expandRow(type, r)),
      updated: data.meta?.sources?.[def.dataKey]?.lastModified ?? null,
    };
  }

  const stripCoords = ({ lat: _lat, lng: _lng, ...rest }) => rest;

  return {
    counts: Object.fromEntries(Object.entries(sets).map(([type, s]) => [type, s.items.length])),

    summary({ lat, lng, radiusMiles = 25 }) {
      if (!RADII_MILES.includes(radiusMiles)) throw new InputError(`radius must be one of ${RADII_MILES.join(', ')}`);
      const out = {};
      for (const type of ['va', 'ihs', 'rhc', 'er']) {
        const { total, results } = searchList(sets[type].items, { lat, lng, radiusMiles, limit: 1 });
        out[type] = { count: total, nearest: results[0] ? stripCoords(results[0]) : null };
      }
      return out;
    },

    search(params, { lat, lng }) {
      const type = params.get('type');
      if (!Object.hasOwn(PROVIDER_DATASETS, type ?? '')) throw new InputError(`type must be one of ${PROVIDER_TYPES.join(', ')}`);
      const def = PROVIDER_DATASETS[type];
      const radiusMiles = Number(params.get('radius') ?? 25);
      if (!RADII_MILES.includes(radiusMiles)) throw new InputError(`radius must be one of ${RADII_MILES.join(', ')}`);
      const filterName = params.get('filter') || null;
      if (filterName && !Object.hasOwn(def.filters, filterName)) {
        const allowed = Object.keys(def.filters);
        throw new InputError(allowed.length ? `filter must be one of ${allowed.join(', ')}` : `filter is not supported for ${type}`);
      }
      const { total, results } = searchList(sets[type].items, { lat, lng, radiusMiles, filter: filterName && def.filters[filterName] });
      return {
        type,
        filter: filterName,
        total,
        // The UI shows distance and builds directions from the address, so
        // facility coordinates are left out to keep responses small.
        results: results.map(stripCoords),
        source: def.source,
        sourceUrl: def.sourceUrl,
        updated: sets[type].updated,
      };
    },
  };
}
