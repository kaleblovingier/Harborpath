import { h, ext } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { healthCenterCard, providerCard } from './facilityCard.js';
import { renderFacilityInsuranceBadgeHTML, facilityAdmissionsQuestions } from '../views/insuranceWidget.js';

function safetyNetCard(facility) {
  const card = facility.kind === 'health-center'
    ? healthCenterCard(facility, { headingLevel: 4 }) : providerCard(facility, { headingLevel: 4 });
  card.append(renderFacilityInsuranceBadgeHTML(facility, { showExplanation: true }), facilityAdmissionsQuestions(facility));
  return card;
}

export function equityFallbackPanel({ fallback, safetyNetResults = [], unavailableNetworks = [] } = {}) {
  if (!fallback?.active) return null;
  return h('section', { class: 'equity-fallback', 'aria-label': t('equity.region', 'Federal safety-net options') },
    h('h3', null, t('equity.title', 'More ways to reach care')),
    h('p', { class: 'help' }, t('equity.expanded', 'We expanded this search to 250 miles because local options may be limited. Distance can include travel over water; call about access, eligibility, services, and telehealth before travelling.')),
    // https://www.hrsa.gov/get-health-care/affordable/eligibility
    // https://www.va.gov/health-care/eligibility/ and https://www.ihs.gov/forpatients/
    h('p', { class: 'help' }, t('equity.networks', 'HRSA health centers offer fees based on income. VA and IHS / Tribal programs have eligibility requirements. These are additional care options; confirm substance use services directly.')),
    safetyNetResults.map(safetyNetCard),
    unavailableNetworks.length > 0 && h('p', { class: 'help', role: 'status' }, t('equity.unavailable', 'Some federal directories could not be searched. Use their official finders below.')),
    h('p', { class: 'actions' }, fallback.links.map((link) => {
      const label = getLang() === 'es' ? link.labelEs || link.label : link.label;
      return link.href.startsWith('#/') ? h('a', { href: link.href }, label) : ext(link.href, label);
    })),
  );
}
