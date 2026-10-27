import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { state, subscribe, setPersist, toggleSaved } from '../state.js';
import { TREATMENT_FILTERS, MENTAL_HEALTH_FILTERS } from '../codes.js';
import { treatmentFinder, healthCenterFinder } from '../components/finder.js';
import { providerFinder } from '../components/providers.js';
import { locationPicker } from '../components/locationPicker.js';
import { treatmentCard, healthCenterCard, providerCard, treatmentText, healthCenterText, providerText } from '../components/facilityCard.js';
import { telehealthList } from '../components/reach.js';
import { stateHref, stateSections } from '../components/stateResources.js';
import { regionsApi } from '../regionsApi.js';
import { offlineSupported, isOfflineSaved, saveOffline, wipeOfflineCopy } from '../offline.js';
import { HOTLINES } from '../content/hotlines.js';
import { t } from '../i18n.js';
import { pageHeader, section, p, ul, strong, resourceList, hotlineGrid, pathCard, emergencyCallout } from './common.js';

// ---------------------------------------------------------------- Offline opt-in card
export function offlineControlCard() {
  if (!offlineSupported()) return null;
  const box = h('input', { type: 'checkbox', id: 'offline-toggle' });
  const status = h('small', null,
    t('offline.hint', 'Off by default. Saves overdose steps, support lines, and clinical guides on this device so they open without signal. Quick exit always erases it.'));

  isOfflineSaved().then((saved) => { box.checked = saved; }).catch(() => {});

  box.addEventListener('change', async () => {
    box.disabled = true;
    try {
      if (box.checked) {
        status.textContent = t('offline.saving', 'Saving for offline use…');
        await saveOffline();
        status.textContent = t('offline.saved', 'Saved on this device for offline use. Quick exit erases it.');
        announce(status.textContent);
      } else {
        await wipeOfflineCopy();
        status.textContent = t('offline.removed', 'Offline copy removed from this device.');
        announce(status.textContent);
      }
    } catch {
      box.checked = false;
      status.textContent = t('offline.failed', 'Could not save for offline use in this browser.');
      announce(status.textContent);
    } finally {
      box.disabled = false;
    }
  });

  return h('div', { class: 'card persist' },
    h('label', { class: 'check' }, box,
      h('span', null, t('offline.label', 'Save overdose steps and support lines for offline use'), status)),
  );
}

// ---------------------------------------------------------------- Home
export function homeView() {
  const go = (href) => () => location.replace(href);
  return h('div', { class: 'view view-home' },
    h('section', { class: 'hero' },
      h('h1', { id: 'page-title', tabindex: '-1' },
        t('home.hero.fit', 'Find treatment that fits your needs, your insurance, and your life.')),
      h('p', { class: 'lede' },
        t('home.hero.lede', 'Search licensed addiction treatment, clinical care navigation, medication guides, harm reduction tools, and low-cost health care near you. Free and private, with no sign-up, ads, or tracking.')),
      h('div', { class: 'card hero-search' },
        locationPicker(),
        h('div', { class: 'hero-actions' },
          h('button', { type: 'button', class: 'btn btn-primary', onclick: go('#/match') }, icon('search'), t('home.cta.find', 'Find treatment')),
          h('button', { type: 'button', class: 'btn btn-secondary', onclick: go('#/match?start=virtual') }, icon('globe'), t('home.cta.online', 'Explore online treatment')),
          h('button', { type: 'button', class: 'btn btn-secondary', onclick: go('#/match?start=affordable') }, icon('heart'), t('home.cta.affordable', 'Find affordable care')),
          h('button', { type: 'button', class: 'btn btn-emergency', onclick: go('#/crisis') }, icon('phone'), t('home.cta.helpNow', 'Get help now')),
        ),
        h('p', { class: 'hero-more' },
          h('a', { href: '#/treatment' }, t('home.cta.directory', 'Search the full treatment directory')), ' · ',
          h('a', { href: '#/treatment?codes=NOE' }, t('home.cta.naloxone', 'Naloxone near me')), ' · ',
          h('a', { href: '#/health' }, t('home.cta.clinics', 'Low-cost clinics & VA/IHS')),
        ),
      ),
    ),
    emergencyCallout(),
    h('nav', { class: 'path-grid', 'aria-label': t('home.paths.label', 'What do you need?') },
      pathCard({
        href: '#/treatment', iconName: 'compass',
        title: t('home.path.treatment.title', 'Find treatment'),
        desc: t('home.path.treatment.desc', 'Detox, outpatient, residential, and medications like buprenorphine and methadone, from SAMHSA’s national directory.'),
      }),
      pathCard({
        href: '#/navigator', iconName: 'activity',
        title: t('home.path.navigator.title', 'Clinical care navigator'),
        desc: t('home.path.navigator.desc', 'Private 6-dimension ASAM 4th Edition self-check to match your withdrawal, medical, and housing needs to the right level of care.'),
      }),
      pathCard({
        href: '#/medications', iconName: 'pill',
        title: t('home.path.medications.title', 'Medications & interactions'),
        desc: t('home.path.medications.desc', 'Pharmacist guide to buprenorphine (including fentanyl micro-induction), methadone, naltrexone, alcohol medications, and drug interactions.'),
      }),
      pathCard({
        href: '#/harm-reduction', iconName: 'shield',
        title: t('home.path.harm.title', 'Harm reduction'),
        desc: t('home.path.harm.desc', 'Naloxone, test strips, never-use-alone lines, safer use, and wound care. No judgment, no requirement to quit.'),
      }),
      pathCard({
        href: '#/health', iconName: 'heart',
        title: t('home.path.health.title', 'Health, VA, IHS & ER care'),
        desc: t('home.path.health.desc', 'Sliding-fee health centers, mental health care, VA & Vet Centers, Indian Health Service, rural clinics, and emergency hospitals.'),
      }),
      pathCard({
        href: '#/plan', iconName: 'clipboard',
        title: t('home.path.plan.title', 'Safety plan & first visit'),
        desc: t('home.path.plan.desc', 'Build a private, printable safety and recovery plan, explore therapy options, and see what happens at a first intake appointment.'),
      }),
      pathCard({
        href: '#/support', iconName: 'users',
        title: t('home.path.support.title', 'Recovery & family'),
        desc: t('home.path.support.desc', 'Peer support, meetings, recovery housing, and CRAFT-based guidance for people who love someone who uses.'),
      }),
      pathCard({
        href: '#/choosing-care', iconName: 'check-circle',
        title: t('home.path.choosing.title', 'Choosing quality care'),
        desc: t('home.path.choosing.desc', 'Signs of good treatment, questions to ask, and red flags for scams and patient brokering.'),
      }),
      pathCard({
        href: '#/crisis', iconName: 'phone', tone: 'warm',
        title: t('home.path.crisis.title', 'Talk to someone now'),
        desc: t('home.path.crisis.desc', '988, the SAMHSA helpline, overdose prevention lines, and other free, confidential support.'),
      }),
    ),
    h('section', { class: 'promises', 'aria-labelledby': 'promises-title' },
      h('h2', { id: 'promises-title' }, t('home.promises.title', 'How HarborPath works')),
      h('ul', { class: 'promise-grid' },
        h('li', null, icon('database'), h('h3', null, t('home.promise.data.title', 'Official federal & state data')),
          p(t('home.promise.data.body', 'Treatment listings come live from SAMHSA’s FindTreatment.gov. Health centers, VA, IHS, rural clinics, and hospitals come from HRSA, VA, IHS, and CMS.'))),
        h('li', null, icon('ban'), h('h3', null, t('home.promise.nopaid.title', 'No paid placement')),
          p(t('home.promise.nopaid.body', 'No ads, sponsored listings, or referral fees. We never sell leads or route calls to a private call center.'))),
        h('li', null, icon('lock'), h('h3', null, t('home.promise.privacy.title', 'Private by design')),
          p(t('home.promise.privacy.body', 'No accounts, cookies, analytics, or third-party scripts. Your location is rounded to about 1 km before it leaves your device, HarborPath’s code does not store your searches, and answers to the clinical tools stay in your browser’s memory.'))),
        h('li', null, icon('hand'), h('h3', null, t('home.promise.meet.title', 'Meets you where you are')),
          p(t('home.promise.meet.body', 'Whether you want to stop, cut back, start medication, or just stay safer tonight, there is something here for you.'))),
      ),
    ),
  );
}

// ---------------------------------------------------------------- Treatment
const PRESETS = [
  { codes: [], get label() { return t('treatment.preset.any', 'Any treatment'); } },
  { codes: ['BU'], get label() { return t('treatment.preset.bu', 'Buprenorphine'); } },
  { codes: ['OTP'], get label() { return t('treatment.preset.otp', 'Methadone clinic (OTP)'); } },
  { codes: ['DT'], get label() { return t('treatment.preset.dt', 'Detox'); } },
  { codes: ['TELE'], get label() { return t('treatment.preset.tele', 'Telehealth'); } },
  { codes: ['PW'], get label() { return t('treatment.preset.pw', 'Pregnant or postpartum'); } },
  { codes: ['ADOL'], get label() { return t('treatment.preset.adol', 'Teens'); } },
  { codes: ['SS'], get label() { return t('treatment.preset.ss', 'Sliding fee scale'); } },
];

export function treatmentView({ query }) {
  const initialCodes = (query.get('codes') ?? '').split(',').filter(Boolean);
  const current = initialCodes.slice().sort().join(',');
  return h('div', { class: 'view' },
    pageHeader(
      t('treatment.title', 'Find treatment'),
      t('treatment.lede', 'Search state-licensed substance use treatment near you, including medications for opioid and alcohol use disorder.'),
    ),
    h('div', { class: 'callout callout-info' },
      p(
        strong(t('treatment.helper.lead', 'Not sure which filters or level of care you need? ')),
        h('a', { href: '#/navigator' }, t('treatment.helper.navigator', 'Use the ASAM Clinical Care Navigator')),
        ' · ',
        h('a', { href: '#/medications' }, t('treatment.helper.medications', 'Compare medications & fentanyl micro-induction')),
        ' · ',
        h('a', { href: '#/plan' }, t('treatment.helper.plan', 'See what happens at your first intake visit')),
      ),
    ),
    h('nav', { class: 'presets', 'aria-label': t('treatment.presets.label', 'Quick searches') },
      PRESETS.map((pr) => h('a', {
        href: pr.codes.length ? `#/treatment?codes=${pr.codes.join(',')}` : '#/treatment',
        class: 'preset',
        'aria-current': pr.codes.join(',') === current ? 'true' : null,
      }, pr.label))),
    treatmentFinder({
      kind: 'sa',
      filters: TREATMENT_FILTERS,
      initialCodes,
      noun: t('treatment.noun', 'treatment locations'),
    }),
    h('div', { class: 'callout callout-warn' },
      h('p', null,
        strong(t('treatment.warn.lead', 'Stopping alcohol, benzodiazepines (like Xanax or Klonopin), or other sedatives suddenly can be life-threatening. ')),
        t('treatment.warn.body', 'Withdrawal can cause seizures. Talk with a doctor or use the “Detox” filter to find medically supervised withdrawal care.'))),
    section('options', t('treatment.options.title', 'Understanding your options'),
      h('dl', { class: 'glossary' },
        h('dt', null, t('treatment.opt.moud.dt', 'Medications for opioid use disorder')),
        h('dd', null,
          t('treatment.opt.moud.dd', 'Buprenorphine, methadone, and naltrexone are the most effective treatment for opioid use disorder and lower the risk of overdose death. You can take them for as long as they help. '),
          h('a', { href: '#/medications' }, t('treatment.opt.moud.guideLink', 'Read the full Pharmacist Medication & Micro-Induction Guide')),
          t('treatment.opt.moud.or', ' or learn more from SAMHSA about '),
          ext('https://www.samhsa.gov/substance-use/treatment/options/buprenorphine', 'buprenorphine'), ', ',
          ext('https://www.samhsa.gov/substance-use/treatment/options', 'methadone'), ', and ',
          ext('https://www.samhsa.gov/substance-use/treatment/options/naltrexone', 'naltrexone'), '.'),
        h('dt', null, t('treatment.opt.maud.dt', 'Medications for alcohol use disorder')),
        h('dd', null,
          t('treatment.opt.maud.dd', 'Naltrexone, acamprosate, and disulfiram are FDA-approved and can be prescribed by many primary care providers. The '),
          ext('https://alcoholtreatment.niaaa.nih.gov/', 'NIAAA Alcohol Treatment Navigator'),
          t('treatment.opt.maud.dd2', ' and our '),
          h('a', { href: '#/medications' }, t('treatment.opt.maud.guideLink', 'Medications Guide')),
          t('treatment.opt.maud.dd3', ' explain the options.')),
        h('dt', null, t('treatment.opt.otp.dt', 'Opioid treatment program (OTP)')),
        h('dd', null, t('treatment.opt.otp.dd', 'A federally certified clinic, and the only outpatient clinic setting that dispenses daily or take-home methadone for opioid use disorder. Most also offer buprenorphine and counseling.')),
        h('dt', null, t('treatment.opt.detox.dt', 'Detox / withdrawal management')),
        h('dd', null, t('treatment.opt.detox.dd', 'Medical support to get through withdrawal safely. It works best as a first step, followed immediately by ongoing medication or counseling treatment.')),
        h('dt', null, t('treatment.opt.op.dt', 'Outpatient and intensive outpatient')),
        h('dd', null, t('treatment.opt.op.dd', 'Counseling and medical care while you live at home. Intensive outpatient (IOP) usually means 9 or more hours a week.')),
        h('dt', null, t('treatment.opt.res.dt', 'Residential')),
        h('dd', null, t('treatment.opt.res.dd', 'You live on site for a period of time. Always ask whether they offer and allow FDA-approved medications like buprenorphine and methadone.')),
        h('dt', null, t('treatment.opt.tele.dt', 'Telehealth')),
        h('dd', null, t('treatment.opt.tele.dd', 'Visits by video or phone. Buprenorphine can often be started and prescribed through telehealth without an in-person visit first.')),
        h('dt', null, t('treatment.opt.hh.dt', 'Recovery housing')),
        h('dd', null, t('treatment.opt.hh.dd', 'Substance-free shared housing that supports recovery. Look for homes certified to '),
          ext('https://narronline.org/', 'NARR'), t('treatment.opt.hh.dd2', ' standards.')),
      ),
      p(t('treatment.notSure', 'Not sure where to start? '),
        h('a', { href: '#/navigator' }, t('treatment.useNavigator', 'Take the 2-minute ASAM Care Navigator')), ', ',
        h('a', { href: '#/choosing-care' }, t('treatment.seeChoosing', 'see how to choose quality care')),
        t('treatment.orCall', ', or call the free SAMHSA National Helpline at '),
        tel('18006624357', '1-800-662-4357'), '.'),
    ),
  );
}

// ---------------------------------------------------------------- Health services
export function healthView({ query }) {
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
      buttons.find((b) => b.dataset.id === next.id).focus();
    },
  }, tab.label));

  const initialNetwork = query.get('network') || 'va';

  function show(id, networkOverride) {
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
      panel.append(providerFinder({ initialKind: networkOverride || initialNetwork }));
    }
  }

  const startTab = ['clinics', 'mental', 'federal'].includes(query.get('tab')) ? query.get('tab') : 'clinics';
  show(startTab, initialNetwork);

  const openNetwork = (net) => () => {
    show('federal', net);
    document.getElementById('find-care')?.scrollIntoView({ behavior: 'smooth' });
  };

  return h('div', { class: 'view' },
    pageHeader(
      t('health.title', 'Health services'),
      t('health.lede', 'Primary care, mental health care, VA & Vet Centers, Indian Health Service, rural clinics, emergency hospitals, testing, and help paying for care.'),
    ),
    section('find-care', t('health.find.title', 'Find care near you'),
      h('div', { class: 'tabs', role: 'tablist', 'aria-label': t('health.tabs.label', 'Type of care') }, buttons),
      panel),
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

// ---------------------------------------------------------------- States & Territories Directory (#/states and #/state/:code)
export function statesView() {
  const body = h('div', { 'aria-live': 'polite' },
    p({ class: 'help' }, t('reach.loading', 'Loading…')));

  regionsApi.states()
    .then(({ states }) => {
      clear(body);
      const stateItems = states.filter((s) => !['AS', 'GU', 'MP', 'PR', 'VI'].includes(s.code));
      const territoryItems = states.filter((s) => ['AS', 'GU', 'MP', 'PR', 'VI'].includes(s.code));

      const grid = (list) => h('ul', { class: 'state-grid' },
        list.map((s) => h('li', null,
          h('a', { class: 'card state-link', href: stateHref(s.code) },
            h('span', { class: 'state-name' }, s.name),
            h('span', { class: 'state-code' }, s.code)))));

      body.append(
        section('us-states', t('regions.statesHeading', 'States & District of Columbia'), grid(stateItems)),
        territoryItems.length
          ? section('us-territories', t('regions.territoriesHeading', 'U.S. territories'), grid(territoryItems))
          : null,
      );
    })
    .catch((err) => {
      clear(body).append(h('div', { class: 'callout callout-warn', role: 'alert' }, p(err.message)));
    });

  return h('div', { class: 'view' },
    pageHeader(
      t('regions.directoryTitle', 'Resources by state and territory'),
      t('regions.directoryLede', 'Find your state or territory’s substance use and mental health agency, Medicaid behavioral health contacts, statewide telehealth programs, and naloxone access links.'),
    ),
    body,
  );
}

export function stateDetailView({ code }) {
  const cleanCode = String(code ?? '').toUpperCase();
  const container = h('div', { class: 'view' },
    pageHeader(t('reach.loading', 'Loading…')));

  regionsApi.state(cleanCode)
    .then((data) => {
      document.title = `${data.region.name} · HarborPath`;
      const telehealth = data.telehealth
        ? telehealthList({ region: data.region, kind: 'sa', codes: [], headingLevel: 3 })
        : null;
      clear(container).append(
        pageHeader(
          t('regions.panelTitle', 'Resources in {state}', { state: data.region.name }),
          t('regions.statePageLede', 'State-funded treatment agency, Medicaid coverage, telehealth programs, and harm reduction resources.'),
          p(h('a', { href: '#/states' }, t('regions.backToStates', '← All states and territories'))),
        ),
        ...stateSections(data, { telehealth }),
      );
    })
    .catch(() => {
      clear(container).append(
        pageHeader(t('regions.unknownState', 'State or territory not found')),
        p(h('a', { class: 'btn btn-primary', href: '#/states' }, t('regions.browseLink', 'Browse resources by state or territory'))),
      );
    });

  return container;
}

// ---------------------------------------------------------------- Saved
function formatSavedText(item) {
  if (item.kind === 'health-center') return healthCenterText(item);
  if (item.kind === 'provider') return providerText(item);
  return treatmentText(item);
}

function renderSavedCard(item) {
  if (item.kind === 'health-center') return healthCenterCard(item, { headingLevel: 2 });
  if (item.kind === 'provider') return providerCard(item, { headingLevel: 2 });
  return treatmentCard(item, { headingLevel: 2 });
}

export function savedView() {
  const listEl = h('div', { class: 'results-list' });
  const persistBox = h('input', { type: 'checkbox', id: 'persist-toggle', checked: state.persist });
  const tools = h('div', { class: 'saved-tools' });

  function render() {
    clear(listEl);
    clear(tools);
    const items = [...state.saved.values()].sort((a, b) => b.savedAt - a.savedAt);
    if (!items.length) {
      listEl.append(h('div', { class: 'empty' }, icon('bookmark'),
        p(t('saved.empty', 'Nothing saved yet. Tap “Save” on any listing to keep it here while you compare.'))));
      return;
    }
    tools.append(
      h('button', { type: 'button', class: 'btn btn-secondary', onclick: () => window.print() },
        icon('printer'), t('saved.print', 'Print list')),
      h('button', {
        type: 'button', class: 'btn btn-ghost',
        onclick: async () => {
          const text = items.map(formatSavedText).join('\n\n');
          try {
            await navigator.clipboard.writeText(text);
            announce(t('saved.copied', 'Saved list copied'));
          } catch {
            announce(t('common.copyUnavailable', 'Copy is not available in this browser'));
          }
        },
      }, icon('copy'), t('saved.copyAll', 'Copy all')),
      h('button', {
        type: 'button', class: 'btn btn-ghost',
        onclick: () => {
          for (const i of items) toggleSaved(i);
          announce(t('saved.cleared', 'Saved list cleared'));
        },
      }, icon('x'), t('saved.clear', 'Clear list')),
      h('small', { class: 'help' }, t('privacy.clipboardNote', 'Copied text stays on your clipboard after Quick exit.')),
    );
    listEl.append(...items.map(renderSavedCard));
  }

  persistBox.addEventListener('change', () => {
    setPersist(persistBox.checked);
    announce(persistBox.checked
      ? t('saved.persistOn', 'Saved list will be kept on this device')
      : t('saved.persistOff', 'Saved list will be forgotten when you close this tab'));
  });
  const unsubscribe = subscribe(() => {
    if (!listEl.isConnected) return unsubscribe();
    render();
  });
  render();

  return h('div', { class: 'view' },
    pageHeader(
      t('saved.title', 'Saved places'),
      t('saved.lede', 'A short list to compare, print, or share with someone you trust.'),
    ),
    h('div', { class: 'card persist' },
      h('label', { class: 'check' }, persistBox,
        h('span', null, t('saved.keepLabel', 'Keep my saved list on this device'),
          h('small', null, t('saved.keepHint', 'Off by default. When off, the list disappears when you close this tab. Quick exit always erases it.')))),
    ),
    tools,
    listEl,
  );
}

// ---------------------------------------------------------------- Crisis lines
export function crisisView() {
  return h('div', { class: 'view' },
    pageHeader(
      t('crisis.title', 'Talk to someone now'),
      t('crisis.lede', 'Free, confidential support. You do not have to be in crisis to call.'),
    ),
    emergencyCallout(),
    offlineControlCard(),
    section('crisis-lines', t('crisis.sec.crisis', 'Crisis and emotional support'), hotlineGrid(HOTLINES.crisis)),
    section('su-lines', t('crisis.sec.su', 'Substance use and overdose'), hotlineGrid(HOTLINES.substanceUse)),
    section('community-lines', t('crisis.sec.comm', 'Support for specific communities'), hotlineGrid(HOTLINES.communities)),
  );
}

// ---------------------------------------------------------------- Privacy
// Every statement here must stay exactly true. HarborPath's own code does not
// log searches, but requests travel as URL query strings, so the hosting
// platform's access logs can hold them with the visitor's IP address.
const ISSUES_URL = 'https://github.com/kaleblovingier/Harborpath/issues';

export function privacyView() {
  return h('div', { class: 'view view-prose' },
    pageHeader(
      t('privacy.title', 'Privacy'),
      t('privacy.lede', 'Looking for help with substance use is private health information. HarborPath is built so there is very little to protect.'),
    ),
    section('collect', t('privacy.collect.title', 'What we collect'),
      ul([
        [strong(t('privacy.collect.1.lead', 'No accounts, cookies, analytics, ads, or tracking pixels. ')),
          t('privacy.collect.1.body', 'The site loads no third-party scripts, fonts, or maps.')],
        [strong(t('privacy.collect.2.lead', 'Location is rounded. ')),
          t('privacy.collect.2.body', 'If you use your device’s location, it is rounded to about 1 km (0.01°) on your device before it is sent. A ZIP code or place name you type is sent to our server to look it up. HarborPath forwards treatment searches to SAMHSA’s FindTreatment.gov with a rounded location. Health center, VA, IHS, rural clinic, hospital, and ZIP lookups are answered on our own server.')],
        [strong(t('privacy.collect.3.lead', 'Our code does not log your searches. ')),
          t('privacy.collect.3.body', 'HarborPath’s own server code does not log or store search terms, ZIP codes, coordinates, or service filters. Searches are sent as part of the web address (URL query parameters), so our hosting provider (for example, Vercel) may keep standard access logs that include those addresses and your IP address. Rounded searches may be cached in server memory for up to an hour so repeat searches are fast.')],
        [strong(t('privacy.collect.4.lead', 'Clinical tools & saved places stay on your device. ')),
          t('privacy.collect.4.body', 'Your answers in the ASAM Care Navigator and Personal Safety Plan are kept in your browser’s memory and are not sent to our server. If you then search for treatment, only that search (a rounded location and service filters) is sent. Saved places stay in memory unless you choose to keep them on this device.')],
      ])),
    section('outbound', t('privacy.outbound.title', 'When you leave HarborPath'),
      p(t('privacy.outbound.body', 'Links to other sites open in a new tab without telling that site you came from HarborPath. Those sites, including map links for directions, have their own privacy practices.'))),
    section('safety', t('privacy.safety.title', 'Staying safe on a shared device'),
      ul([
        [strong(t('privacy.safety.1.lead', 'Quick exit: ')),
          t('privacy.safety.1.body', 'press the Quick exit button or the Escape key twice. HarborPath erases what it stored in this browser (its memory, local storage, saved places, language preference, and any offline copy) and replaces this page with a weather site. It cannot erase your browser history, anything you copied to the clipboard, or files you downloaded or printed.')],
        t('privacy.safety.2', 'HarborPath keeps a single entry in your browser’s back history, so pressing Back after a quick exit does not return here.'),
        t('privacy.safety.filters', 'Search filters, such as a type of service, are kept out of the address bar. The name of the page you are on, such as “Find treatment,” can still appear in your history.'),
        t('privacy.safety.3', 'Your browser may still show HarborPath in its history list. For more privacy, use a private or incognito window, or clear your history afterward.'),
        t('privacy.safety.4', 'If someone may be monitoring your device, consider using a different phone or computer, such as one at a library.'),
      ]),
      offlineControlCard()),
    section('health-data', t('privacy.chd.title', 'Consumer health data privacy notice'),
      p(t('privacy.chd.intro', 'Searching for addiction treatment or other health services can reveal health information. This notice describes what actually happens to that information. It is written with Washington’s My Health My Data Act and similar state consumer health data laws in mind. It is not a claim that HarborPath complies with any particular law.')),
      h('h3', null, t('privacy.chd.collect.title', 'What is collected and where it goes')),
      ul([
        [strong(t('privacy.chd.stored.lead', 'Stored by HarborPath: nothing about you. ')),
          t('privacy.chd.stored.body', 'There are no accounts, profiles, or stored records about individuals. Our server code does not write searches to logs, files, or a database.')],
        [strong(t('privacy.chd.server.lead', 'Sent to our server with each search: ')),
          t('privacy.chd.server.body', 'the ZIP code or place name you type, or your location rounded to about 1 km on your device, plus the search distance and any service filters you choose (for example, buprenorphine or pregnancy services). Like every website, our server also receives your IP address and browser type with each request. Searches are held only in server memory: rounded searches in a cache for up to an hour, and IP addresses in a rate limiter, usually for about a minute, to prevent abuse.')],
        [strong(t('privacy.chd.samhsa.lead', 'Shared with SAMHSA’s FindTreatment.gov: ')),
          t('privacy.chd.samhsa.body', 'for treatment searches, our server sends the rounded location and service filters to FindTreatment.gov, the federal directory run by SAMHSA. Your IP address and browser details are not forwarded.')],
        [strong(t('privacy.chd.host.lead', 'Kept by our hosting provider: ')),
          t('privacy.chd.host.body', 'HarborPath runs on a hosting platform (for example, Vercel). Because searches are sent as part of the web address, the host’s standard access logs may record them together with your IP address. HarborPath does not control those logs. They are kept under the host’s own retention policy.')],
        [strong(t('privacy.chd.device.lead', 'Kept on your device: ')),
          t('privacy.chd.device.body', 'your language choice and, only if you turn them on, your saved list and an offline copy of the site. Quick exit erases these.')],
      ]),
      h('h3', null, t('privacy.chd.purpose.title', 'Why it is used')),
      p(t('privacy.chd.purpose.body', 'Only to answer the search you asked for, keep the service running, and protect it from abuse.')),
      h('h3', null, t('privacy.chd.share.title', 'Selling and sharing')),
      ul([
        t('privacy.chd.share.sell', 'HarborPath does not sell consumer health data or any other data.'),
        t('privacy.chd.share.ads', 'HarborPath does not share data with advertisers or data brokers. There are no ads, analytics, tracking pixels, or third-party scripts.'),
        t('privacy.chd.share.only', 'Data goes only to the places listed above, and only to provide the search you asked for.'),
      ]),
      h('h3', null, t('privacy.chd.rights.title', 'Access and deletion requests')),
      p(t('privacy.chd.rights.body', 'You can ask what data HarborPath has about you, or ask for it to be deleted. Because HarborPath keeps no accounts and no stored records about individuals, there is normally nothing linked to you to look up or delete. Searches held in server memory expire within an hour. Hosting provider access logs are kept under the host’s retention policy. To erase what HarborPath stored in this browser, use Quick exit.')),
      h('h3', null, t('privacy.chd.contact.title', 'Contact')),
      p(t('privacy.chd.contact.body', 'To ask a question or make a privacy request, open an issue on the HarborPath project page on GitHub: '),
        ext(ISSUES_URL, 'github.com/kaleblovingier/Harborpath/issues'), '.'),
      h('div', { class: 'callout callout-warn' },
        p(strong(t('privacy.chd.contact.warnLead', 'GitHub issues are public. ')),
          t('privacy.chd.contact.warn', 'Do not post personal or health information there, such as your name, address, contact details, diagnosis, or substance use.')))),
    section('not-medical', t('privacy.medical.title', 'Not medical advice'),
      p(t('privacy.medical.body', 'HarborPath shares general information from public health and clinical sources (SAMHSA, ASAM, HRSA, CMS, VA, IHS, CDC, FDA, NIDA, and NIAAA). It is not a substitute for care from a medical professional. In an emergency, call 911.'))),
  );
}

export function notFoundView() {
  return h('div', { class: 'view' },
    pageHeader(
      t('notfound.title', 'Page not found'),
      t('notfound.lede', 'That page does not exist, but help is still here.'),
    ),
    p(h('a', { class: 'btn btn-primary', href: '#/' }, t('notfound.home', 'Go to the home page'))),
  );
}
