// Read every feature from a public ArcGIS feature layer through its documented
// REST query endpoint (no key or token). Used for agency-published layers such
// as the IHS facility layer behind ihs.gov/findhealthcare.

async function getJson(url, fetchImpl) {
  const res = await fetchImpl(url, { headers: { 'User-Agent': 'HarborPath data builder' } });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  const body = await res.json();
  // ArcGIS reports errors with HTTP 200 and an { error } body.
  if (body.error) throw new Error(`GET ${url} -> ArcGIS error ${body.error.code}: ${body.error.message}`);
  return body;
}

/** Layer description: fields, objectIdField, and editingInfo.dataLastEditDate. */
export function layerInfo(layerUrl, { fetchImpl = fetch } = {}) {
  return getJson(`${layerUrl}?f=json`, fetchImpl);
}

/**
 * All features of a layer, paged by resultOffset until the server stops
 * reporting exceededTransferLimit. Geometry comes back as WGS84 lat/lng.
 */
export async function queryAllFeatures(layerUrl, {
  outFields = '*',
  where = '1=1',
  returnGeometry = false,
  orderBy,
  pageSize = 1000,
  fetchImpl = fetch,
} = {}) {
  const features = [];
  for (let offset = 0; ; offset += pageSize) {
    const qs = new URLSearchParams({
      where,
      outFields: Array.isArray(outFields) ? outFields.join(',') : outFields,
      returnGeometry: String(returnGeometry),
      outSR: '4326',
      resultOffset: String(offset),
      resultRecordCount: String(pageSize),
      f: 'json',
    });
    if (orderBy) qs.set('orderByFields', orderBy);
    const page = await getJson(`${layerUrl}/query?${qs}`, fetchImpl);
    features.push(...(page.features ?? []));
    if (!page.exceededTransferLimit || !page.features?.length) break;
  }
  return features;
}

/** ArcGIS dates are epoch milliseconds; return an HTTP-style date like download() does. */
export function editDate(info) {
  const ms = info?.editingInfo?.dataLastEditDate ?? info?.editingInfo?.lastEditDate;
  return Number.isFinite(ms) ? new Date(ms).toUTCString() : null;
}
