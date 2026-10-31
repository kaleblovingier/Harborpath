import { h, clear, ext, icon, announce } from '../dom.js';
import { state } from '../state.js';
import { MENTAL_HEALTH_FILTERS } from '../codes.js';
import { treatmentFinder, healthCenterFinder } from '../components/finder.js';
import { providerFinder } from '../components/providers.js';
import { HOTLINES } from '../content/hotlines.js';
import { t, getLang } from '../i18n.js';
import { pageHeader, section, p, fine, ul, strong, resourceList, hotlineGrid } from './common.js';
import {
  TERRITORY_EQUITY_GUIDES,
  RURAL_FRONTIER_GUIDE,
  getTerritoryEquityGuide,
  buildRuralTerritoryReachCard,
} from './states.js';

export {
  TERRITORY_EQUITY_GUIDES,
  RURAL_FRONTIER_GUIDE,
  getTerritoryEquityGuide,
  buildRuralTerritoryReachCard,
};

const tr = (en, es) => (getLang() === 'es' ? es : en);

const healthState = {
  activeTab: 'clinics',
  activeNetwork: 'va',
  plainLanguage: false,
};

let activeHealthReset = null;

export function getHealthState() {
  return {
    activeTab: healthState.activeTab,
    activeNetwork: healthState.activeNetwork,
    plainLanguage: Boolean(healthState.plainLanguage),
  };
}

export function resetHealthState() {
  healthState.activeTab = 'clinics';
  healthState.activeNetwork = 'va';
  healthState.plainLanguage = false;
  if (typeof activeHealthReset === 'function') {
    activeHealthReset();
  }
}

export function healthView({ query } = {}) {
  const q = query instanceof URLSearchParams ? query : new URLSearchParams(query || '');
  const tabs = [
    { id: 'clinics', get label() { return t('health.tab.clinics', 'Low-cost health centers'); } },
    { id: 'mental', get label() { return t('health.tab.mental', 'Mental health care'); } },
    { id: 'federal', get label() { return t('health.tab.federal', 'VA, IHS, rural & emergency hospitals'); } },
  ];
  const panel = h('div', { class: 'tab-panel', role: 'tabpanel', id: 'health-panel' });
  const buttons = tabs.map((tab) => h('button', {
    type: 'button', role: 'tab', id: `health-tab-${tab.id}`, class: 'tab', 'aria-controls': 'health-panel',
    dataset: { id: tab.id }, onclick: () => show(tab.id),
    onkeydown: (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const idx = tabs.findIndex((x) => x.id === tab.id);
      const next = tabs[(idx + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      show(next.id);
      buttons.find((b) => b.dataset.id === next.id)?.focus();
    },
  }, tab.label));

  const initialNetwork = q.get('network') || 'va';

  function show(id, networkOverride) {
    healthState.activeTab = id;
    if (networkOverride) healthState.activeNetwork = networkOverride;
    for (const b of buttons) {
      const on = b.dataset.id === id;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    }
    panel.setAttribute('aria-labelledby', `health-tab-${id}`);
    clear(panel);
    if (id === 'clinics') {
      panel.append(healthCenterFinder());
    } else if (id === 'mental') {
      panel.append(treatmentFinder({
        kind: 'mh',
        filters: MENTAL_HEALTH_FILTERS,
        noun: t('health.mentalNoun', 'mental health providers'),
      }));
    } else {
      panel.append(providerFinder({ initialKind: networkOverride || healthState.activeNetwork || initialNetwork }));
    }
  }

  const startTab = ['clinics', 'mental', 'federal'].includes(q.get('tab')) ? q.get('tab') : 'clinics';
  healthState.activeNetwork = initialNetwork;
  show(startTab, initialNetwork);

  const openNetwork = (net) => () => {
    if (net === 'clinics') {
      show('clinics');
    } else {
      show('federal', net);
    }
    document.getElementById('find-care')?.scrollIntoView({ behavior: 'smooth' });
  };

  const plainBox = h('div', { id: 'health-plain-summary-box' });
  const equitySlot = h('div', { id: 'health-equity-slot' });

  const plainToggleBtn = h('button', {
    type: 'button',
    id: 'health-plain-language-toggle',
    class: 'preset',
    'aria-pressed': String(Boolean(healthState.plainLanguage)),
    onclick: () => {
      healthState.plainLanguage = !healthState.plainLanguage;
      plainToggleBtn.setAttribute('aria-pressed', String(healthState.plainLanguage));
      if (healthState.plainLanguage) plainToggleBtn.setAttribute('aria-current', 'true');
      else plainToggleBtn.removeAttribute('aria-current');
      renderPlainAndEquity();
      announce(healthState.plainLanguage
        ? tr('Plain-language summary enabled.', 'Resumen en lenguaje sencillo activado.')
        : tr('Standard clinical detail enabled.', 'Detalle estándar activado.'));
    },
  }, icon('info'), ' ', tr('Plain-language summary (6th-grade reading level)', 'Resumen en lenguaje sencillo'));

  function renderPlainAndEquity() {
    clear(plainBox);
    if (healthState.plainLanguage) {
      plainBox.append(
        h('div', { class: 'callout callout-info plain-language-box', role: 'region', 'aria-label': tr('Plain-language health services summary', 'Resumen en lenguaje sencillo de servicios de salud') },
          h('p', { class: 'callout-title' },
            icon('heart'),
            tr('In plain words: How to get low-cost or free care near you', 'En palabras sencillas: Cómo recibir atención médica gratuita o de bajo costo')),
          ul([
            [
              strong(tr('No insurance or no photo ID? ', '¿No tiene seguro médico ni identificación? ')),
              tr(
                'HRSA Community Health Centers see everyone. They charge based on what you earn (a "sliding fee scale"), and if you have no income, care is often free.',
                'Los Centros de Salud Comunitarios de HRSA atienden a todas las personas y cobran según sus ingresos ("escala móvil").',
              ),
            ],
            [
              strong(tr('Live in a rural town or on a U.S. island territory? ', '¿Vive en una zona rural o territorio insular de EE. UU.? ')),
              tr(
                'You can widen your search up to 200–250 miles, use CMS Rural Health Clinics (RHC) or Indian Health Service / Tribal clinics (IHS), or start buprenorphine (Suboxone) by phone or video telehealth.',
                'Puede ampliar su búsqueda hasta 200–250 millas, usar Clínicas de Salud Rural (RHC), clínicas Tribales (IHS) o iniciar buprenorfina por teléfono o video.',
              ),
            ],
            [
              strong(tr('Need urgent medical withdrawal help or have a bad skin wound? ', '¿Necesita ayuda médica urgente por abstinencia o una herida grave? ')),
              tr(
                'Under federal law (EMTALA), any 24/7 Emergency Hospital must check and stabilize you—even if you cannot pay.',
                'Bajo la ley federal (EMTALA), cualquier hospital de emergencias 24/7 debe evaluarlo y estabilizarlo aunque no pueda pagar.',
              ),
            ],
          ]),
        ),
      );
    }

    clear(equitySlot).append(
      buildRuralTerritoryReachCard({
        stateCode: state.location?.state,
        onSelectNetwork: (net) => openNetwork(net)(),
        plainLanguage: healthState.plainLanguage,
      }),
    );
  }

  activeHealthReset = () => {
    plainToggleBtn.setAttribute('aria-pressed', 'false');
    plainToggleBtn.removeAttribute('aria-current');
    show('clinics', 'va');
    renderPlainAndEquity();
  };

  renderPlainAndEquity();

  return h('div', { class: 'view' },
    pageHeader(
      t('health.title', 'Health services'),
      t('health.lede', 'Primary care, mental health care, VA & Vet Centers, Indian Health Service, rural clinics, emergency hospitals, testing, and help paying for care.'),
    ),
    h('div', { class: 'actions no-print' },
      plainToggleBtn,
      fine(tr('Toggle is kept in your browser’s memory and cleared on Quick exit.', 'Esta opción se mantiene en la memoria de su navegador y se borra con Salida rápida.')),
    ),
    plainBox,
    section('find-care', t('health.find.title', 'Find care near you'),
      h('div', { class: 'tabs', role: 'tablist', 'aria-label': t('health.tabs.label', 'Type of care') }, buttons),
      panel),
    section('rural-territory-equity', tr('Rural, Frontier & U.S. Territory Care Access', 'Acceso a la atención en zonas rurales, fronterizas y territorios de EE. UU.'),
      equitySlot),
    section('testing', t('health.testing.title', 'HIV, hepatitis, and sexual health'),
      ul([
        [strong(t('health.hcv.lead', 'Hepatitis C is curable. ')),
          t('health.hcv.body', 'Treatment is usually pills for 8 to 12 weeks, and it works for people who currently use drugs. Anyone who has ever injected drugs should get tested. '),
          ext('https://www.cdc.gov/hepatitis-c/testing/index.html', 'CDC: Hepatitis C testing')],
        [strong(t('health.hiv.lead', 'HIV testing is free or low-cost in most areas. ')),
          ext('https://gettested.cdc.gov/', 'CDC GetTested'), ' & ',
          ext('https://locator.hiv.gov/', 'HIV.gov locator'),
          t('health.hiv.body', ' list testing sites, including free self-test kits.')],
        [strong(t('health.prep.lead', 'PrEP prevents HIV. ')),
          t('health.prep.body', 'It is a daily pill or a shot every few months (and PEP can prevent HIV if started within 72 hours after a possible exposure). Find a provider with '),
          ext('https://preplocator.org/', 'PrEP Locator'), ' / ',
          ext('https://www.hiv.gov/hiv-basics/hiv-prevention/using-hiv-medication-to-reduce-risk/pre-exposure-prophylaxis', 'HIV.gov'), '.'],
        [strong(t('health.vaccines.lead', 'Hepatitis A and B vaccines ')),
          t('health.vaccines.body', 'are recommended for people who use drugs, and community health centers can provide them alongside wound care.')],
      ]),
      p(
        h('a', { class: 'btn btn-secondary', href: '#/treatment?codes=HIVT' }, t('health.btn.hiv', 'Find treatment programs that offer HIV testing')), ' ',
        h('a', { class: 'btn btn-secondary', href: '#/treatment?codes=HCT' }, t('health.btn.hcv', 'Hepatitis C testing')),
      ),
    ),
    section('paying', t('health.paying.title', 'Paying for care & state directories'),
      p(
        t('health.paying.statePrompt', 'Looking for your state’s Medicaid behavioral health office or state-funded substance use agency? '),
        h('a', { class: 'btn btn-small btn-secondary', href: '#/states' }, icon('map'), t('health.paying.stateBtn', 'Browse all 56+ state & territory directories')),
      ),
      resourceList([
        { name: 'HealthCare.gov', href: 'https://www.healthcare.gov/', desc: t('health.pay.hcgov', 'Check whether you qualify for Medicaid or a low-cost marketplace plan. Plans must cover substance use and mental health treatment.') },
        { name: 'Medicaid', href: 'https://www.medicaid.gov/', desc: t('health.pay.medicaid', 'Covers substance use treatment, including medications for opioid use disorder. Eligibility and details vary by state.') },
        { name: 'HRSA Find a Health Center', href: 'https://findahealthcenter.hrsa.gov/', desc: t('health.pay.hrsa', 'Health centers charge on a sliding scale based on income and see everyone regardless of insurance or ID.') },
        { name: '211', href: 'https://www.211.org/', desc: t('health.pay.211', 'Free local help with housing, food, utilities, and transportation. Dial 2-1-1.') },
        { name: 'findhelp.org', href: 'https://www.findhelp.org/', desc: t('health.pay.findhelp', 'Search free and reduced-cost social services by ZIP code.') },
      ]),
    ),
    section('communities', t('health.communities.title', 'Federal & safety-net networks built into HarborPath'),
      p(t('health.communities.intro', 'Search these official federal datasets right on this page without leaving HarborPath:')),
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'btn btn-secondary btn-small', onclick: openNetwork('va') }, icon('shield'), t('providers.tab.va', 'VA & Vet Centers')),
        h('button', { type: 'button', class: 'btn btn-secondary btn-small', onclick: openNetwork('ihs') }, icon('compass'), t('providers.tab.ihs', 'IHS & Tribal Health')),
        h('button', { type: 'button', class: 'btn btn-secondary btn-small', onclick: openNetwork('rhc') }, icon('building'), t('providers.tab.rhc', 'Rural Health Clinics')),
        h('button', { type: 'button', class: 'btn btn-secondary btn-small', onclick: openNetwork('er') }, icon('hospital'), t('providers.tab.er', 'Emergency Hospitals')),
      ),
      resourceList([
        { name: 'VA health care locations', href: 'https://www.va.gov/find-locations/', desc: t('health.comm.va', 'Substance use, PTSD, and mental health care for veterans, plus confidential Vet Centers.') },
        { name: 'Indian Health Service', href: 'https://www.ihs.gov/findhealthcare/', desc: t('health.comm.ihs', 'Find IHS, Tribal (638), and Urban Indian health programs and Youth Regional Treatment Centers.') },
        { name: 'NIAAA Alcohol Treatment Navigator', href: 'https://alcoholtreatment.niaaa.nih.gov/', desc: t('health.comm.niaaa', 'Find and compare alcohol treatment, including providers who prescribe FDA-approved medication.') },
      ]),
    ),
    section('lines', t('health.lines.title', 'Crisis and support lines'),
      hotlineGrid(HOTLINES.crisis),
      p(h('a', { href: '#/crisis' }, t('health.lines.all', 'See all support lines')))),
  );
}
