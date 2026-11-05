import { api } from './api.js';
import { state, subscribe, wipeAll } from './state.js';
import { initI18n, onLanguageChange, t, formatDate } from './i18n.js';
import {
  homeView,
  treatmentView,
  healthView,
  statesView,
  stateDetailView,
  savedView,
  crisisView,
  privacyView,
  notFoundView,
} from './views/core.js';

const SITE = 'HarborPath';
const EXIT_URL = 'https://www.weather.gov/';

// Core routes are synchronously available at startup for zero-latency first paint.
export const SYNC_VIEWS = {
  '': homeView,
  treatment: treatmentView,
  health: healthView,
  states: statesView,
  saved: savedView,
  crisis: crisisView,
  privacy: privacyView,
};

// Heavy clinical, matching, guided triage, and educational views are dynamically
// imported on demand, cached in memory, and preloaded during browser idle time or link hover/focus.
export const viewCache = new Map();
const pendingLoads = new Map();
// Register a reset with each loaded new view so Quick Exit can clear its
// in-memory state synchronously, before navigating away.
const routeResets = new Map();

function loadGuidesModule() {
  return import('./views/guides.js').then((m) => {
    viewCache.set('harm-reduction', m.harmReductionView);
    viewCache.set('overdose', m.overdoseView);
    viewCache.set('support', m.supportView);
    viewCache.set('choosing-care', m.choosingCareView);
    return m;
  });
}

export const LAZY_LOADERS = {
  'novel-substances': () => import('./views/novelSubstances.js').then((m) => {
    viewCache.set('novel-substances', m.novelSubstancesView);
    routeResets.set('novel-substances', m.resetNovelState);
    return m.novelSubstancesView;
  }),
  'sexual-health': () => import('./views/sexualHealth.js').then((m) => {
    viewCache.set('sexual-health', m.sexualHealthView);
    routeResets.set('sexual-health', m.resetSexualHealthState);
    return m.sexualHealthView;
  }),
  'needle-exposure': () => import('./views/needleExposure.js').then((m) => {
    viewCache.set('needle-exposure', m.needleExposureView);
    routeResets.set('needle-exposure', m.resetExposureState);
    return m.needleExposureView;
  }),
  'hospital-care': () => import('./views/hospitalCare.js').then((m) => {
    viewCache.set('hospital-care', m.hospitalCareView);
    routeResets.set('hospital-care', m.resetHospitalState);
    return m.hospitalCareView;
  }),
  'toxicology-triage': () => import('./views/toxicologyTriage.js').then((m) => {
    viewCache.set('toxicology-triage', m.toxicologyTriageView);
    routeResets.set('toxicology-triage', m.resetToxicologyTriageState);
    return m.toxicologyTriageView;
  }),
  'adhd-care': () => import('./views/adhdCare.js').then((m) => {
    viewCache.set('adhd-care', m.adhdCareView);
    routeResets.set('adhd-care', m.resetAdhdState);
    return m.adhdCareView;
  }),
  'benzodiazepine-care': () => import('./views/benzodiazepineCare.js').then((m) => {
    viewCache.set('benzodiazepine-care', m.benzodiazepineCareView);
    routeResets.set('benzodiazepine-care', m.resetBenzodiazepineState);
    return m.benzodiazepineCareView;
  }),
  'nicotine-care': () => import('./views/nicotineCare.js').then((m) => {
    viewCache.set('nicotine-care', m.nicotineCareView);
    routeResets.set('nicotine-care', m.resetNicotineState);
    return m.nicotineCareView;
  }),
  'viral-hepatitis': () => import('./views/viralHepatitis.js').then((m) => {
    viewCache.set('viral-hepatitis', m.viralHepatitisView);
    routeResets.set('viral-hepatitis', m.resetViralState);
    return m.viralHepatitisView;
  }),
  'cannabis-care': () => import('./views/cannabisCare.js').then((m) => {
    viewCache.set('cannabis-care', m.cannabisCareView);
    routeResets.set('cannabis-care', m.resetCannabisState);
    return m.cannabisCareView;
  }),
  'dental-care': () => import('./views/dentalCare.js').then((m) => {
    viewCache.set('dental-care', m.dentalCareView);
    routeResets.set('dental-care', m.resetDentalState);
    return m.dentalCareView;
  }),
  'sleep-care': () => import('./views/sleepCare.js').then((m) => {
    viewCache.set('sleep-care', m.sleepCareView);
    routeResets.set('sleep-care', m.resetSleepState);
    return m.sleepCareView;
  }),
  'nightlife-care': () => import('./views/nightlifeCare.js').then((m) => {
    viewCache.set('nightlife-care', m.nightlifeCareView);
    routeResets.set('nightlife-care', m.resetNightlifeState);
    return m.nightlifeCareView;
  }),
  'polysubstance-care': () => import('./views/polysubstanceCare.js').then((m) => {
    viewCache.set('polysubstance-care', m.polysubstanceCareView);
    routeResets.set('polysubstance-care', m.resetPolysubstanceState);
    return m.polysubstanceCareView;
  }),
  'dual-diagnosis': () => import('./views/dualDiagnosis.js').then((m) => {
    viewCache.set('dual-diagnosis', m.dualDiagnosisView);
    routeResets.set('dual-diagnosis', m.resetDualDiagnosisState);
    return m.dualDiagnosisView;
  }),
  'methadone-access': () => import('./views/methadoneAccess.js').then((m) => {
    viewCache.set('methadone-access', m.methadoneAccessView);
    routeResets.set('methadone-access', m.resetMethadoneState);
    return m.methadoneAccessView;
  }),
  'adulterant-care': () => import('./views/adulterantCare.js').then((m) => {
    viewCache.set('adulterant-care', m.adulterantCareView);
    routeResets.set('adulterant-care', m.resetAdulterantState);
    return m.adulterantCareView;
  }),
  'family-support': () => import('./views/familySupport.js').then((m) => {
    viewCache.set('family-support', m.familySupportView);
    routeResets.set('family-support', m.resetFamilyState);
    return m.familySupportView;
  }),
  'alcohol-care': () => import('./views/alcoholCare.js').then((m) => {
    viewCache.set('alcohol-care', m.alcoholCareView);
    routeResets.set('alcohol-care', m.resetAlcoholState);
    return m.alcoholCareView;
  }),
  'chronic-pain': () => import('./views/chronicPain.js').then((m) => {
    viewCache.set('chronic-pain', m.chronicPainView);
    routeResets.set('chronic-pain', m.resetPainState);
    return m.chronicPainView;
  }),
  tools: () => import('./views/tools.js').then((m) => {
    viewCache.set('tools', m.careToolsView);
    routeResets.set('tools', m.resetCareToolsState);
    return m.careToolsView;
  }),
  workspace: () => import('./views/workspace.js').then((m) => {
    viewCache.set('workspace', m.careWorkspaceView);
    routeResets.set('workspace', m.resetCareWorkspaceState);
    return m.careWorkspaceView;
  }),
  match: () => import('./views/match.js').then((m) => {
    viewCache.set('match', m.matchView);
    return m.matchView;
  }),
  navigator: () => import('./views/navigator.js').then((m) => {
    viewCache.set('navigator', m.careNavigatorView);
    return m.careNavigatorView;
  }),
  guided: () => import('./views/guidedNavigator.js').then((m) => {
    viewCache.set('guided', m.guidedNavigatorView);
    return m.guidedNavigatorView;
  }),
  medications: () => import('./views/medications.js').then((m) => {
    viewCache.set('medications', m.medicationsView);
    return m.medicationsView;
  }),
  plan: () => import('./views/plan.js').then((m) => {
    viewCache.set('plan', m.planView);
    return m.planView;
  }),
  assessment: () => import('./views/assessment.js').then((m) => {
    viewCache.set('assessment', m.assessmentView);
    return m.assessmentView;
  }),
  readiness: () => import('./views/readiness.js').then((m) => {
    viewCache.set('readiness', m.readinessView);
    return m.readinessView;
  }),
  perinatal: () => import('./views/perinatal.js').then((m) => {
    viewCache.set('perinatal', m.perinatalView);
    return m.perinatalView;
  }),
  veterans: () => import('./views/veterans.js').then((m) => {
    viewCache.set('veterans', m.veteransView);
    return m.veteransView;
  }),
  adolescent: () => import('./views/adolescentCare.js').then((m) => {
    viewCache.set('adolescent', m.adolescentCareView);
    return m.adolescentCareView;
  }),
  reentry: () => import('./views/reentry.js').then((m) => {
    viewCache.set('reentry', m.reentryView);
    return m.reentryView;
  }),
  'older-adults': () => import('./views/olderAdults.js').then((m) => {
    viewCache.set('older-adults', m.olderAdultsView);
    return m.olderAdultsView;
  }),
  'workplace-rights': () => import('./views/workplaceRights.js').then((m) => {
    viewCache.set('workplace-rights', m.workplaceRightsView);
    return m.workplaceRightsView;
  }),
  'tribal-health': () => import('./views/tribalHealth.js').then((m) => {
    viewCache.set('tribal-health', m.tribalHealthView);
    return m.tribalHealthView;
  }),
  'lgbtq-care': () => import('./views/lgbtqCare.js').then((m) => {
    viewCache.set('lgbtq-care', m.lgbtqCareView);
    return m.lgbtqCareView;
  }),
  'wound-care': () => import('./views/woundInfectious.js').then((m) => {
    viewCache.set('wound-care', m.woundInfectiousView);
    return m.woundInfectiousView;
  }),
  'rural-health': () => import('./views/ruralHealth.js').then((m) => {
    viewCache.set('rural-health', m.ruralHealthView);
    return m.ruralHealthView;
  }),
  'disability-care': () => import('./views/disabilityCare.js').then((m) => {
    viewCache.set('disability-care', m.disabilityCareView);
    return m.disabilityCareView;
  }),
  'street-medicine': () => import('./views/streetMedicine.js').then((m) => {
    viewCache.set('street-medicine', m.streetMedicineView);
    return m.streetMedicineView;
  }),
  'immigrant-health': () => import('./views/immigrantHealth.js').then((m) => {
    viewCache.set('immigrant-health', m.immigrantHealthView);
    return m.immigrantHealthView;
  }),
  'post-overdose': () => import('./views/postOverdose.js').then((m) => {
    viewCache.set('post-overdose', m.postOverdoseView);
    return m.postOverdoseView;
  }),
  'stimulant-care': () => import('./views/stimulantCare.js').then((m) => {
    viewCache.set('stimulant-care', m.stimulantCareView);
    return m.stimulantCareView;
  }),
  'harm-reduction': () => loadGuidesModule().then((m) => m.harmReductionView),
  overdose: () => loadGuidesModule().then((m) => m.overdoseView),
  support: () => loadGuidesModule().then((m) => m.supportView),
  'choosing-care': () => loadGuidesModule().then((m) => m.choosingCareView),
};

export const ROUTE_TITLES = {
  'novel-substances': () => t('route.novelSubstances', 'Novel substances, kratom, tianeptine & OTC misuse'),
  'sexual-health': () => t('route.sexualHealth', 'Doxy-PEP, HIV PrEP & emergency contraception'),
  'needle-exposure': () => t('route.needleExposure', 'Needle stick, sharps injury & bloodborne pathogen PEP protocol'),
  'hospital-care': () => t('route.hospitalCare', 'Hospital addiction care, pain on MOUD & patient rights'),
  'toxicology-triage': () => t('route.toxicologyTriage', 'Acute toxicology triage, Project BETA de-escalation & SBAR handoff'),
  'adhd-care': () => t('route.adhdCare', 'ADHD, neurodiversity & stimulant harm reduction'),
  'benzodiazepine-care': () => t('route.benzodiazepineCare', 'Benzodiazepines, Ashton tapering & BIND care'),
  'nicotine-care': () => t('route.nicotineCare', 'Tobacco, nicotine, vaping & smoking cessation'),
  'viral-hepatitis': () => t('route.viralHepatitis', 'Hepatitis C cure, DAA regimens, FIB-4 & HIV PrEP/PEP'),
  'cannabis-care': () => t('route.cannabisCare', 'Cannabinoid hyperemesis (CHS) & concentrates care'),
  'dental-care': () => t('route.dentalCare', 'Dental, oral health & endocarditis prevention'),
  'sleep-care': () => t('route.sleepCare', 'Sleep restoration & insomnia in recovery'),
  'nightlife-care': () => t('route.nightlifeCare', 'Nightlife, club drugs & festival harm reduction'),
  'polysubstance-care': () => t('route.polysubstanceCare', 'Polysubstance overdose synergy & interactions'),
  'dual-diagnosis': () => t('route.dualDiagnosis', 'Dual diagnosis & integrated mental health'),
  'methadone-access': () => t('route.methadoneAccess', 'Methadone clinic access & 2024 Part 8 rules'),
  'adulterant-care': () => t('route.adulterantCare', 'Emerging adulterants, xylazine & wound care'),
  'family-support': () => t('route.familySupport', 'Family support & CRAFT guide'),
  'alcohol-care': () => t('route.alcoholCare', 'Alcohol care, withdrawal & MAUD'),
  'chronic-pain': () => t('route.chronicPain', 'Chronic pain & sedative deprescribing'),
  '': () => t('route.home', 'Find treatment, harm reduction & health services'),
  tools: () => t('route.tools', 'Care tools and guides'),
  workspace: () => t('route.workspace', 'Care team workspace'),
  match: () => t('route.match', 'Find care that fits'),
  treatment: () => t('route.treatment', 'Find treatment'),
  navigator: () => t('route.navigator', 'Clinical care navigator (ASAM)'),
  guided: () => t('route.guided', 'Guided navigator & triage'),
  medications: () => t('route.medications', 'Medications & interactions'),
  'harm-reduction': () => t('route.harm', 'Harm reduction'),
  overdose: () => t('route.overdose', 'Overdose response'),
  health: () => t('route.health', 'Health services'),
  plan: () => t('route.plan', 'Safety plan & first visit'),
  assessment: () => t('route.assessment', 'Withdrawal assessment (COWS & CIWA-Ar)'),
  readiness: () => t('route.readiness', 'Readiness & stages of change'),
  perinatal: () => t('route.perinatal', 'Perinatal care & pregnancy support'),
  veterans: () => t('route.veterans', 'Veterans & military health care'),
  adolescent: () => t('route.adolescent', 'Adolescent care & legal guide'),
  reentry: () => t('route.reentry', 'Reentry & criminal legal health'),
  'older-adults': () => t('route.olderAdults', 'Older adults & Medicare SUD'),
  'workplace-rights': () => t('route.workplaceRights', 'Workplace rights, FMLA & ADA'),
  'tribal-health': () => t('route.tribalHealth', 'Indigenous & tribal health'),
  'lgbtq-care': () => t('route.lgbtqCare', 'LGBTQ+ & gender-affirming SUD care'),
  'wound-care': () => t('route.woundCare', 'Wound care & infection prevention'),
  'rural-health': () => t('route.ruralHealth', 'Rural & frontier health'),
  'disability-care': () => t('route.disabilityCare', 'Disability, neurodiversity & accessible care'),
  'street-medicine': () => t('route.streetMedicine', 'Street medicine & unhoused care'),
  'immigrant-health': () => t('route.immigrantHealth', 'Immigrant health & language rights'),
  'post-overdose': () => t('route.postOverdose', 'Post-overdose care & MOUD bridges'),
  'stimulant-care': () => t('route.stimulantCare', 'Stimulant care & overamping'),
  support: () => t('route.support', 'Recovery & family support'),
  'choosing-care': () => t('route.choosing', 'Choosing quality care'),
  states: () => t('route.states', 'Resources by state and territory'),
  saved: () => t('route.saved', 'Saved places'),
  crisis: () => t('route.crisis', 'Talk to someone now'),
  privacy: () => t('route.privacy', 'Privacy'),
};

export function preloadRoute(path) {
  if (SYNC_VIEWS[path]) return Promise.resolve(SYNC_VIEWS[path]);
  if (viewCache.has(path)) return Promise.resolve(viewCache.get(path));
  const loader = LAZY_LOADERS[path];
  if (!loader) return Promise.resolve(null);
  if (!pendingLoads.has(path)) {
    const p = loader().finally(() => pendingLoads.delete(path));
    pendingLoads.set(path, p);
  }
  return pendingLoads.get(path);
}

export function preloadAllLazyViews() {
  return Promise.all([
    preloadRoute('tools'),
    preloadRoute('workspace'),
    preloadRoute('match'),
    preloadRoute('navigator'),
    preloadRoute('guided'),
    preloadRoute('medications'),
    preloadRoute('plan'),
    preloadRoute('assessment'),
    preloadRoute('readiness'),
    preloadRoute('perinatal'),
    preloadRoute('veterans'),
    preloadRoute('adolescent'),
    preloadRoute('reentry'),
    preloadRoute('older-adults'),
    preloadRoute('workplace-rights'),
    preloadRoute('tribal-health'),
    preloadRoute('lgbtq-care'),
    preloadRoute('wound-care'),
    preloadRoute('rural-health'),
    preloadRoute('disability-care'),
    preloadRoute('street-medicine'),
    preloadRoute('immigrant-health'),
    preloadRoute('post-overdose'),
    preloadRoute('stimulant-care'),
    preloadRoute('chronic-pain'),
    preloadRoute('alcohol-care'),
    preloadRoute('family-support'),
    preloadRoute('adulterant-care'),
    preloadRoute('methadone-access'),
    preloadRoute('dental-care'),
    preloadRoute('cannabis-care'),
    preloadRoute('viral-hepatitis'),
    preloadRoute('nicotine-care'),
    preloadRoute('benzodiazepine-care'),
    preloadRoute('adhd-care'),
    preloadRoute('toxicology-triage'),
    preloadRoute('hospital-care'),
    preloadRoute('needle-exposure'),
    preloadRoute('sexual-health'),
    preloadRoute('novel-substances'),
    preloadRoute('sleep-care'),
    preloadRoute('nightlife-care'),
    preloadRoute('polysubstance-care'),
    preloadRoute('dual-diagnosis'),
    preloadRoute('harm-reduction'),
  ]);
}

let carried = null;

export function splitHref(hash) {
  const raw = String(hash ?? '').replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  return { path: path.replace(/\/$/, ''), query: new URLSearchParams(qs) };
}

// Filters such as `?codes=PW,OTP` or `?tab=mental` can reveal health details,
// so they are kept out of the address bar, back history, and session restore.
// Internal links hand their filters over in memory (see the click handler).
// When a URL with filters is opened directly or set by code, the filters are
// read once and the visible URL is immediately replaced with the bare route.
// `carried` keeps them in memory so a re-render of the same route (for
// example, after a language change) does not lose them.
export function parseHash(hashStr) {
  if (typeof hashStr === 'string') return splitHref(hashStr);
  const currentHash = typeof location !== 'undefined' ? location.hash : '';
  const { path, query } = splitHref(currentHash);
  if ([...query.keys()].length) {
    carried = { path, query };
    if (typeof history !== 'undefined' && typeof history.replaceState === 'function') {
      history.replaceState(history.state, '', `#/${path}`);
    }
    return { path, query };
  }
  if (carried && carried.path === path) return { path, query: carried.query };
  carried = null;
  return { path, query };
}

export function resolveRoute(path, query) {
  if (Object.hasOwn(ROUTE_TITLES, path)) {
    const title = ROUTE_TITLES[path]();
    const syncView = SYNC_VIEWS[path] ?? viewCache.get(path) ?? null;
    if (syncView) {
      return { view: () => syncView({ query, meta: lastMeta }), lazyPath: null, title };
    }
    return { view: null, lazyPath: path, title };
  }
  if (path.startsWith('state/')) {
    const code = path.slice(6);
    if (/^[A-Za-z]{2}$/.test(code)) {
      return {
        view: () => stateDetailView({ code: code.toUpperCase(), query }),
        lazyPath: null,
        title: t('route.stateDetail', 'State resources ({code})', { code: code.toUpperCase() }),
      };
    }
  }
  return {
    view: () => notFoundView({ query }),
    lazyPath: null,
    title: t('route.notFound', 'Page not found'),
  };
}

let firstRender = true;
let lastMeta = null;
let renderSeq = 0;

const hasDom = typeof document !== 'undefined';
const main = hasDom ? document.getElementById('main') : null;
const toggle = hasDom ? document.querySelector('.nav-toggle') : null;
const nav = hasDom ? document.getElementById('site-nav') : null;
const savedCount = hasDom ? document.getElementById('saved-count') : null;

function closeMenu() {
  toggle?.setAttribute('aria-expanded', 'false');
  nav?.classList.remove('open');
  for (const details of nav?.querySelectorAll('.nav-more-menu[open]') ?? []) details.open = false;
}

async function render() {
  if (!main) return;
  const token = ++renderSeq;
  const isInitial = firstRender;
  firstRender = false;

  const { path, query } = parseHash();
  const resolved = resolveRoute(path, query);
  document.title = path ? `${resolved.title} · ${SITE}` : `${SITE}: ${resolved.title}`;

  for (const link of document.querySelectorAll('[data-nav]')) {
    if (link.dataset.nav === path) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  closeMenu();

  let buildView = resolved.view;
  if (!buildView && resolved.lazyPath) {
    const loadedView = await preloadRoute(resolved.lazyPath);
    if (token !== renderSeq) return;
    buildView = loadedView ? () => loadedView({ query, meta: lastMeta }) : () => notFoundView({ query });
  }

  main.replaceChildren(buildView());
  if (!isInitial) {
    window.scrollTo(0, 0);
    document.getElementById('page-title')?.focus({ preventScroll: true });
  }
}

// ---------------------------------------------------------------- Quick exit
export function runQuickExitResets() {
  wipeAll();
  carried = null;
  for (const reset of routeResets.values()) reset();
  import('./views/navigator.js').then((m) => m.resetNavigatorState?.()).catch(() => {});
  import('./views/insuranceHelpers.js').then((m) => m.resetInsuranceState?.()).catch(() => {});
  import('./views/guidedNavigator.js').then((m) => m.resetGuidedNavigatorState?.()).catch(() => {});
  import('./views/medications.js').then((m) => m.resetMedicationsState?.()).catch(() => {});
  import('./views/harmReduction.js').then((m) => m.resetHarmReductionState?.()).catch(() => {});
  import('./views/health.js').then((m) => m.resetHealthState?.()).catch(() => {});
  import('./views/states.js').then((m) => m.resetStatesState?.()).catch(() => {});
  import('./views/plan.js').then((m) => m.resetPlanState?.()).catch(() => {});
  import('./views/assessment.js').then((m) => m.resetAssessmentState?.()).catch(() => {});
  import('./views/readiness.js').then((m) => m.resetReadinessState?.()).catch(() => {});
  import('./components/sensoryMode.js').then((m) => m.resetSensoryMode?.()).catch(() => {});
  import('./components/emergencyDrawer.js').then((m) => m.closeEmergencyDrawer?.()).catch(() => {});
  import('./components/stateLegalCard.js').then((m) => m.resetStateLegalCardState?.()).catch(() => {});
  import('./components/overdosePacing.js').then((m) => m.resetOverdosePacer?.()).catch(() => {});
  import('./views/perinatal.js').then((m) => m.resetPerinatalState?.()).catch(() => {});
  import('./views/veterans.js').then((m) => m.resetVeteransState?.()).catch(() => {});
  import('./views/adolescentCare.js').then((m) => m.resetAdolescentState?.()).catch(() => {});
  import('./components/clinicalDifferential.js').then((m) => m.resetDifferentialState?.()).catch(() => {});
  import('./components/testStripCalculator.js').then((m) => m.resetTestStripState?.()).catch(() => {});
  import('./components/mutualAidFinder.js').then((m) => m.resetMutualAidState?.()).catch(() => {});
  import('./components/sessionBookmarks.js').then((m) => m.resetBookmarksViewState?.()).catch(() => {});
  import('./views/reentry.js').then((m) => m.resetReentryState?.()).catch(() => {});
  import('./views/olderAdults.js').then((m) => m.resetOlderAdultsState?.()).catch(() => {});
  import('./views/workplaceRights.js').then((m) => m.resetWorkplaceState?.()).catch(() => {});
  import('./components/recoveryCapital.js').then((m) => m.resetRecoveryCapitalState?.()).catch(() => {});
  import('./views/tribalHealth.js').then((m) => m.resetTribalHealthState?.()).catch(() => {});
  import('./views/lgbtqCare.js').then((m) => m.resetLgbtqState?.()).catch(() => {});
  import('./views/woundInfectious.js').then((m) => m.resetWoundState?.()).catch(() => {});
  import('./components/safetyNetNavigator.js').then((m) => m.resetSafetyNetState?.()).catch(() => {});
  import('./views/ruralHealth.js').then((m) => m.resetRuralHealthState?.()).catch(() => {});
  import('./views/disabilityCare.js').then((m) => m.resetDisabilityState?.()).catch(() => {});
  import('./views/streetMedicine.js').then((m) => m.resetStreetMedicineState?.()).catch(() => {});
  import('./components/sspEquipmentTracker.js').then((m) => m.resetSspTrackerState?.()).catch(() => {});
  import('./views/immigrantHealth.js').then((m) => m.resetImmigrantState?.()).catch(() => {});
  import('./views/postOverdose.js').then((m) => m.resetPostOverdoseState?.()).catch(() => {});
  import('./views/stimulantCare.js').then((m) => m.resetStimulantCareState?.()).catch(() => {});
  import('./components/medicalRespiteFinder.js').then((m) => m.resetRespiteFinderState?.()).catch(() => {});
  if (typeof document !== 'undefined') {
    document.getElementById('btn-emergency-drawer')?.setAttribute('aria-expanded', 'false');
  }
}

function quickExit() {
  runQuickExitResets();
  if (!hasDom) return;
  document.title = 'Weather';
  document.body.replaceChildren();
  location.replace(EXIT_URL);
}

// ---------------------------------------------------------------- Saved count
function updateSavedCount() {
  if (!savedCount) return;
  const n = state.saved.size;
  savedCount.hidden = n === 0;
  savedCount.textContent = String(n);
  savedCount.setAttribute('aria-label', t('app.savedCount', '{n} saved', { n }));
}

// ---------------------------------------------------------------- Footer data dates
function renderFooterMeta() {
  if (!hasDom) return;
  const el = document.getElementById('data-updated');
  if (!el || !lastMeta?.healthCenters?.updated) return;
  const date = new Date(lastMeta.healthCenters.updated);
  if (!Number.isNaN(date.getTime())) {
    const formatted = formatDate(date, { year: 'numeric', month: 'long', day: 'numeric' });
    el.textContent = t(
      'app.footer.dataUpdated',
      'Health center data updated {date}. Treatment listings are searched live.',
      { date: formatted },
    );
  }
}

if (hasDom) {
  // Internal navigation replaces the current history entry instead of adding
  // one, so HarborPath occupies a single slot in the back history. After a
  // quick exit, pressing Back skips past this site.
  document.addEventListener('click', (e) => {
    if (!e.target?.closest?.('.nav-more-menu')) {
      for (const details of nav?.querySelectorAll('.nav-more-menu[open]') ?? []) details.open = false;
    }
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href^="#/"], a[href="#"]');
    if (!a) return;
    e.preventDefault();
    const { path, query } = splitHref(a.getAttribute('href') === '#' ? '#/' : a.getAttribute('href'));
    carried = [...query.keys()].length ? { path, query } : null;
    const href = `#/${path}`;
    if (href === location.hash || (href === '#/' && !location.hash)) render();
    else location.replace(href);
  });

  // Preload lazy route modules on pointerenter or keyboard focus so navigation is instant.
  const handleLinkPreload = (e) => {
    const a = e.target?.closest?.('a[href^="#/"]');
    if (!a) return;
    const { path } = parseHash(a.getAttribute('href') || '');
    if (LAZY_LOADERS[path]) preloadRoute(path).catch(() => {});
  };
  document.addEventListener('pointerenter', handleLinkPreload, { capture: true, passive: true });
  document.addEventListener('focusin', handleLinkPreload, { passive: true });

  window.addEventListener('hashchange', render);

  document.getElementById('quick-exit')?.addEventListener('click', quickExit);

  let lastEscape = 0;
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const more = nav?.querySelector('.nav-more-menu[open]');
    if (more) {
      more.open = false;
      more.querySelector('summary')?.focus();
    }
    const now = Date.now();
    if (now - lastEscape < 1000) quickExit();
    lastEscape = now;
  });

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });

  const sensoryBtn = document.getElementById('btn-sensory-mode');
  if (sensoryBtn) {
    import('./components/sensoryMode.js').then((m) => {
      const updateSensory = (active) => {
        sensoryBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
        sensoryBtn.classList.toggle('active', active);
      };
      m.subscribeSensoryMode(updateSensory);
      updateSensory(m.getSensoryMode());
      sensoryBtn.addEventListener('click', () => {
        m.toggleSensoryMode();
      });
    }).catch(() => {});
  }

  const emergencyBtn = document.getElementById('btn-emergency-drawer');
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', () => {
      import('./components/emergencyDrawer.js').then((m) => {
        if (m.isEmergencyDrawerOpen()) {
          m.closeEmergencyDrawer();
          emergencyBtn.setAttribute('aria-expanded', 'false');
        } else {
          m.openEmergencyDrawer(emergencyBtn);
          emergencyBtn.setAttribute('aria-expanded', 'true');
        }
      }).catch(() => {});
    });

    if (typeof MutationObserver !== 'undefined') {
      const syncEmergencyAria = () => {
        const wrapper = document.getElementById('emergency-drawer-wrapper');
        const isOpen = Boolean(wrapper && !wrapper.hidden && wrapper.classList.contains('open'));
        emergencyBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      };
      const drawerObserver = new MutationObserver(syncEmergencyAria);
      const drawerWrapper = document.getElementById('emergency-drawer-wrapper');
      if (drawerWrapper) {
        drawerObserver.observe(drawerWrapper, { attributes: true, attributeFilter: ['hidden', 'class'] });
      } else if (document.body) {
        const bodyObserver = new MutationObserver(() => {
          const w = document.getElementById('emergency-drawer-wrapper');
          if (w) {
            bodyObserver.disconnect();
            drawerObserver.observe(w, { attributes: true, attributeFilter: ['hidden', 'class'] });
          }
        });
        bodyObserver.observe(document.body, { childList: true });
      }
    }
  }

  subscribe(updateSavedCount);
  updateSavedCount();

  api.meta().then((meta) => {
    lastMeta = meta;
    renderFooterMeta();
    // Update only the source disclosure if metadata arrives after a new view
    // renders; preserve the visitor's focus, filters, and checklist.
    if (main?.querySelector('.source-context')) {
      import('./components/sourceContext.js').then(({ sourceContext }) => {
        main?.querySelector('.source-context')?.replaceWith(sourceContext({ meta: lastMeta }));
      }).catch(() => {});
    }
  }).catch(() => { /* footer note is optional */ });

  onLanguageChange(() => {
    updateSavedCount();
    renderFooterMeta();
    render();
  });

  const scheduleIdle = typeof requestIdleCallback === 'function'
    ? (cb) => requestIdleCallback(cb, { timeout: 1000 })
    : (cb) => setTimeout(cb, 150);

  initI18n().finally(() => {
    updateSavedCount();
    renderFooterMeta();
    render();
    scheduleIdle(() => {
      preloadAllLazyViews().catch(() => {});
    });
  });
}
