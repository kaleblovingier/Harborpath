// Source context uses only metadata already loaded by its parent view. Rendering
// never fetches, saves visitor data, or treats a build date as verification.
import { h, ext } from '../dom.js';
import { t, formatDate } from '../i18n.js';

function snapshotDate(value) {
  if (typeof value !== 'string'
    || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(value)) return null;
  const date = new Date(value);
  // Date parsing normalizes impossible days such as February 30; reject them.
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value.slice(0, 10)
    ? date : null;
}

/**
 * A keyboard-accessible, initially collapsed source and verification disclosure.
 * @param {{meta?: {dataBuiltAt?: string}|null}} [options] Existing /api/meta data.
 * Returns a DOM element; callers re-render it when metadata or language changes.
 */
export function sourceContext({ meta = null } = {}) {
  const date = snapshotDate(meta?.dataBuiltAt);
  return h('details', { class: 'card source-context' },
    h('summary', null, t('evidence.title', 'Sources and verification')),
    h('p', { class: 'small' },
      h('strong', null, t('evidence.snapshotLabel', 'Bundled data snapshot:')),
      ' ',
      date
        ? h('time', { datetime: date.toISOString() }, formatDate(date, {
          year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
        }))
        : t('evidence.snapshotUnavailable', 'Date unavailable on this device.')),
    h('p', { class: 'small muted' }, t('evidence.dateMeaning',
      'This is the file build date, not confirmation that every listing or law is current.')),
    h('dl', null,
      h('dt', null, h('strong', null, t('evidence.liveTitle', 'Live treatment directory'))),
      h('dd', null, t('evidence.liveBody',
        'Treatment searches use SAMHSA’s FindTreatment.gov. During an outage, a temporary cached response may be shown. Confirm availability and cost with the provider.')),
      h('dt', null, h('strong', null, t('evidence.bundledTitle', 'Bundled directories'))),
      h('dd', null, t('evidence.bundledBody',
        'Provider locations, ZIP and city lookups, and state Medicaid links come from bundled public datasets. These files do not update automatically during a search.')),
      h('dt', null, h('strong', null, t('evidence.reviewTitle', 'Verification limits'))),
      h('dd', null, t('evidence.reviewBody',
        'State legal summaries are unverified. Check linked sources or local legal aid for current protections. Online-only program listings awaiting review are excluded from results.'))),
    h('p', { class: 'small' }, t('evidence.connection',
      'Live searches and source websites need an internet connection. Offline guidance depends on what you previously enabled and saved on this device.')),
    h('p', null, h('strong', null, t('evidence.sourcesTitle', 'Check the official sources'))),
    h('ul', { class: 'small' },
      h('li', null, ext('https://findtreatment.gov/',
        t('evidence.sourceTreatment', 'SAMHSA treatment directory'))),
      h('li', null, ext('https://data.hrsa.gov/',
        t('evidence.sourceHealthCenters', 'HRSA health centers'))),
      h('li', null, ext('https://www.va.gov/find-locations/',
        t('evidence.sourceVeterans', 'VA facilities'))),
      h('li', null, ext('https://www.ihs.gov/findhealthcare/',
        t('evidence.sourceTribal', 'IHS and Tribal facilities'))),
      h('li', null, ext('https://data.cms.gov/',
        t('evidence.sourceHospitals', 'CMS hospitals and rural clinics'))),
      h('li', null, ext('https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html',
        t('evidence.sourcePlaces', 'Census location data'))),
      h('li', null, ext('https://www.medicaid.gov/about-us/where-can-people-get-help-medicaid-chip',
        t('evidence.sourceMedicaid', 'State Medicaid contacts')))));
}
