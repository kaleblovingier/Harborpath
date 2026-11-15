// Pure in-RAM search policy. No coordinates, ZIPs, or clinical state are stored.
export const ISLAND_TERRITORIES = Object.freeze(['PR', 'GU', 'VI', 'AS', 'MP']);

const TERRITORIAL_AGENCIES = Object.freeze({
  PR: { label: 'Puerto Rico: ASSMCA', href: 'https://www.assmca.pr.gov/' },
  GU: { label: 'Guam: GBHWC', href: 'https://gbhwc.guam.gov/' },
  VI: { label: 'U.S. Virgin Islands: Department of Health', labelEs: 'Islas Vírgenes: Departamento de Salud', href: 'https://doh.vi.gov/' },
  AS: { label: 'American Samoa: DHSS', labelEs: 'Samoa Americana: DHSS', href: 'https://www.dhss.as/' },
  MP: { label: 'Northern Mariana Islands: CHCC', labelEs: 'Islas Marianas del Norte: CHCC', href: 'https://www.chcc.health/' },
});

export function buildTerritoryAndRuralFallback({ location = {}, radius = 25, resultCount } = {}) {
  const stateCode = String(location?.state ?? '').toUpperCase();
  const territory = ISLAND_TERRITORIES.includes(stateCode);
  const sparse = Number.isFinite(resultCount) && resultCount < 3;
  const active = territory || location?.rural === true || sparse;
  return {
    active,
    reason: territory ? 'territory' : active ? 'limited-local-results' : null,
    radius: active ? 250 : radius,
    networks: active ? ['hrsa', 'va', 'ihs', 'rhc', 'er'] : [],
    links: active ? [
      ...(territory ? [TERRITORIAL_AGENCIES[stateCode]] : []),
      { label: 'HRSA health centers', labelEs: 'Centros de salud HRSA', href: 'https://findahealthcenter.hrsa.gov/' },
      { label: 'VA locations (eligibility applies)', labelEs: 'Centros VA (requieren elegibilidad)', href: 'https://www.va.gov/find-locations/' },
      { label: 'IHS / Tribal health (eligibility applies)', labelEs: 'Salud IHS / tribal (requiere elegibilidad)', href: 'https://www.ihs.gov/findhealthcare/' },
      { label: 'Rural Health Clinics and emergency hospitals', labelEs: 'Clínicas rurales y hospitales de emergencia', href: '#/health?tab=federal&network=rhc' },
      { label: 'Statewide telehealth and treatment', labelEs: 'Telesalud estatal y tratamiento', href: '#/treatment' },
    ] : [],
  };
}

/** Run one primary search, expand once if sparse, then surface federal options.
 * Existing API methods round coordinates before transport. Coverage choices
 * and assessment answers never enter this boundary.
 */
export async function searchWithEquityFallback({ location, radius, search, api, signal, primaryNetwork } = {}) {
  let fallback = buildTerritoryAndRuralFallback({ location, radius });
  let data = await search(fallback.radius);
  if (signal?.aborted) throw new DOMException('Search cancelled', 'AbortError');
  const next = buildTerritoryAndRuralFallback({ location, radius, resultCount: data.total ?? data.results?.length ?? 0 });
  if (next.active && next.radius > fallback.radius) data = await search(next.radius);
  if (signal?.aborted) throw new DOMException('Search cancelled', 'AbortError');
  fallback = next;
  if (!fallback.active) return { data, fallback, safetyNetResults: [], unavailableNetworks: [] };

  const networks = fallback.networks.filter((network) => network !== primaryNetwork);
  const settled = await Promise.allSettled(networks.map(async (network) => {
    const args = { lat: location.lat, lng: location.lng, radius: fallback.radius };
    const result = network === 'hrsa'
      ? await api.healthCenters(args, signal)
      : await api.providers({ ...args, type: network }, signal);
    return (result.results ?? []).slice(0, 6).map((facility) => ({
      ...facility,
      kind: network === 'hrsa' ? 'health-center' : 'provider',
      providerType: network,
    }));
  }));
  if (signal?.aborted) throw new DOMException('Search cancelled', 'AbortError');
  return {
    data,
    fallback,
    safetyNetResults: settled.flatMap((result) => result.status === 'fulfilled' ? result.value : []),
    unavailableNetworks: networks.filter((_, i) => settled[i].status === 'rejected'),
  };
}
