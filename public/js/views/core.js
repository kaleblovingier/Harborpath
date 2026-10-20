import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { state, subscribe, setPersist, toggleSaved } from '../state.js';
import { TREATMENT_FILTERS, MENTAL_HEALTH_FILTERS } from '../codes.js';
import { treatmentFinder, healthCenterFinder } from '../components/finder.js';
import { locationPicker } from '../components/locationPicker.js';
import { treatmentCard, healthCenterCard, treatmentText, healthCenterText } from '../components/facilityCard.js';
import { HOTLINES } from '../content/hotlines.js';
import { pageHeader, section, p, ul, strong, resourceList, hotlineGrid, pathCard, emergencyCallout } from './common.js';

// ---------------------------------------------------------------- Home
export function homeView() {
  const go = (href) => () => location.replace(href);
  return h('div', { class: 'view view-home' },
    h('section', { class: 'hero' },
      h('h1', { id: 'page-title', tabindex: '-1' }, 'Find care and stay safer, on your terms.'),
      h('p', { class: 'lede' },
        'Search licensed addiction treatment, get harm reduction tools, and find low-cost health care near you. ',
        'Free and private, with no sign-up, ads, or tracking.'),
      h('div', { class: 'card hero-search' },
        locationPicker(),
        h('div', { class: 'hero-actions' },
          h('button', { type: 'button', class: 'btn btn-primary', onclick: go('#/treatment') }, icon('search'), 'Treatment near me'),
          h('button', { type: 'button', class: 'btn btn-secondary', onclick: go('#/treatment?codes=NOE') }, icon('shield'), 'Naloxone near me'),
          h('button', { type: 'button', class: 'btn btn-secondary', onclick: go('#/health') }, icon('heart'), 'Low-cost clinics near me'),
        ),
      ),
    ),
    emergencyCallout(),
    h('nav', { class: 'path-grid', 'aria-label': 'What do you need?' },
      pathCard({ href: '#/treatment', iconName: 'compass', title: 'Find treatment',
        desc: 'Detox, outpatient, residential, and medications like buprenorphine and methadone, from SAMHSA’s national directory.' }),
      pathCard({ href: '#/harm-reduction', iconName: 'shield', title: 'Harm reduction',
        desc: 'Naloxone, test strips, never-use-alone lines, safer use, and wound care. No judgment, no requirement to quit.' }),
      pathCard({ href: '#/health', iconName: 'heart', title: 'Health services',
        desc: 'Sliding-fee health centers, mental health care, HIV and hepatitis C testing, and help paying for care.' }),
      pathCard({ href: '#/support', iconName: 'users', title: 'Recovery & family',
        desc: 'Peer support, meetings, recovery housing, and guidance for people who love someone who uses.' }),
      pathCard({ href: '#/choosing-care', iconName: 'check-circle', title: 'Choosing quality care',
        desc: 'Signs of good treatment, questions to ask, and red flags for scams and patient brokering.' }),
      pathCard({ href: '#/crisis', iconName: 'phone', title: 'Talk to someone now', tone: 'warm',
        desc: '988, the SAMHSA helpline, overdose prevention lines, and other free, confidential support.' }),
    ),
    h('section', { class: 'promises', 'aria-labelledby': 'promises-title' },
      h('h2', { id: 'promises-title' }, 'How HarborPath works'),
      h('ul', { class: 'promise-grid' },
        h('li', null, icon('database'), h('h3', null, 'Official data'),
          p('Treatment listings come live from SAMHSA’s FindTreatment.gov. Health centers come from HRSA.')),
        h('li', null, icon('ban'), h('h3', null, 'No paid placement'),
          p('No ads, sponsored listings, or referral fees. We never sell leads or route calls to a call center.')),
        h('li', null, icon('lock'), h('h3', null, 'Private by design'),
          p('No accounts, cookies, analytics, or third-party scripts. Your location is rounded and never stored.')),
        h('li', null, icon('hand'), h('h3', null, 'Meets you where you are'),
          p('Whether you want to stop, cut back, or just stay safer, there is something here for you.')),
      ),
    ),
  );
}

// ---------------------------------------------------------------- Treatment
const PRESETS = [
  { codes: [], label: 'Any treatment' },
  { codes: ['BU'], label: 'Buprenorphine' },
  { codes: ['OTP'], label: 'Methadone clinic (OTP)' },
  { codes: ['DT'], label: 'Detox' },
  { codes: ['TELE'], label: 'Telehealth' },
  { codes: ['PW'], label: 'Pregnant or postpartum' },
  { codes: ['ADOL'], label: 'Teens' },
  { codes: ['SS'], label: 'Sliding fee scale' },
];

export function treatmentView({ query }) {
  const initialCodes = (query.get('codes') ?? '').split(',').filter(Boolean);
  const current = initialCodes.slice().sort().join(',');
  return h('div', { class: 'view' },
    pageHeader('Find treatment',
      'Search state-licensed substance use treatment near you, including medications for opioid and alcohol use disorder.'),
    h('nav', { class: 'presets', 'aria-label': 'Quick searches' },
      PRESETS.map((pr) => h('a', {
        href: pr.codes.length ? `#/treatment?codes=${pr.codes.join(',')}` : '#/treatment',
        class: 'preset',
        'aria-current': pr.codes.join(',') === current ? 'true' : null,
      }, pr.label))),
    treatmentFinder({ kind: 'sa', filters: TREATMENT_FILTERS, initialCodes, noun: 'treatment locations' }),
    h('div', { class: 'callout callout-warn' },
      h('p', null, strong('Stopping alcohol, benzodiazepines (like Xanax or Klonopin), or other sedatives suddenly can be life-threatening. '),
        'Withdrawal can cause seizures. Talk with a doctor or use the “Detox” filter to find medically supervised withdrawal care.')),
    section('options', 'Understanding your options',
      h('dl', { class: 'glossary' },
        h('dt', null, 'Medications for opioid use disorder'),
        h('dd', null, 'Buprenorphine, methadone, and naltrexone are the most effective treatment for opioid use disorder and lower the risk of overdose death. ',
          'You can take them for as long as they help. Learn about ',
          ext('https://www.samhsa.gov/substance-use/treatment/options/buprenorphine', 'buprenorphine'), ', ',
          ext('https://www.samhsa.gov/substance-use/treatment/options/methadone', 'methadone'), ', and ',
          ext('https://www.samhsa.gov/substance-use/treatment/options/naltrexone', 'naltrexone'), '.'),
        h('dt', null, 'Medications for alcohol use disorder'),
        h('dd', null, 'Naltrexone, acamprosate, and disulfiram are FDA-approved and can be prescribed by many primary care providers. The ',
          ext('https://alcoholtreatment.niaaa.nih.gov/', 'NIAAA Alcohol Treatment Navigator'), ' explains the options.'),
        h('dt', null, 'Opioid treatment program (OTP)'),
        h('dd', null, 'A federally certified clinic, and the only place that can dispense methadone for opioid use disorder. Most also offer buprenorphine and counseling.'),
        h('dt', null, 'Detox / withdrawal management'),
        h('dd', null, 'Medical support to get through withdrawal safely. It works best as a first step, followed by ongoing treatment.'),
        h('dt', null, 'Outpatient and intensive outpatient'),
        h('dd', null, 'Counseling and medical care while you live at home. Intensive outpatient usually means 9 or more hours a week.'),
        h('dt', null, 'Residential'),
        h('dd', null, 'You live on site for a period of time. Ask whether they offer or allow medications like buprenorphine and methadone.'),
        h('dt', null, 'Telehealth'),
        h('dd', null, 'Visits by video or phone. Buprenorphine can often be started and prescribed through telehealth.'),
        h('dt', null, 'Recovery housing'),
        h('dd', null, 'Substance-free shared housing that supports recovery. Look for homes certified to ',
          ext('https://narronline.org/', 'NARR'), ' standards.'),
      ),
      p('Not sure where to start? ', h('a', { href: '#/choosing-care' }, 'See how to choose quality care'),
        ' or call the free SAMHSA National Helpline at ', tel('18006624357', '1-800-662-4357'), '.'),
    ),
  );
}

// ---------------------------------------------------------------- Health services
export function healthView({ query }) {
  const tabs = [
    { id: 'clinics', label: 'Low-cost health centers' },
    { id: 'mental', label: 'Mental health care' },
  ];
  const panel = h('div', { class: 'tab-panel', role: 'tabpanel', id: 'health-panel' });
  const buttons = tabs.map((t) => h('button', {
    type: 'button', role: 'tab', id: `health-tab-${t.id}`, class: 'tab', 'aria-controls': 'health-panel',
    dataset: { id: t.id }, onclick: () => show(t.id),
    onkeydown: (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(tabs.findIndex((x) => x.id === t.id) + 1) % tabs.length];
      show(next.id);
      buttons.find((b) => b.dataset.id === next.id).focus();
    },
  }, t.label));

  function show(id) {
    for (const b of buttons) {
      const on = b.dataset.id === id;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    }
    panel.setAttribute('aria-labelledby', `health-tab-${id}`);
    clear(panel).append(id === 'clinics'
      ? healthCenterFinder()
      : treatmentFinder({ kind: 'mh', filters: MENTAL_HEALTH_FILTERS, noun: 'mental health providers' }));
  }
  show(query.get('tab') === 'mental' ? 'mental' : 'clinics');

  return h('div', { class: 'view' },
    pageHeader('Health services',
      'Primary care, mental health care, testing, and help paying for it. Health centers see everyone, insured or not.'),
    section('find-care', 'Find care near you',
      h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Type of care' }, buttons),
      panel),
    section('testing', 'HIV, hepatitis, and sexual health',
      ul([
        [strong('Hepatitis C is curable. '), 'Treatment is usually pills for 8 to 12 weeks, and it works for people who currently use drugs. ',
          'Anyone who has ever injected drugs should get tested. ', ext('https://www.cdc.gov/hepatitis-c/testing/index.html', 'CDC: Hepatitis C testing')],
        [strong('HIV testing is free or low-cost in most areas. '), ext('https://gettested.cdc.gov/', 'CDC GetTested'), ' and the ',
          ext('https://locator.hiv.gov/', 'HIV.gov locator'), ' list testing sites, including free self-test kits.'],
        [strong('PrEP prevents HIV. '), 'It is a daily pill or a shot every few months. Find a provider with ',
          ext('https://preplocator.org/', 'PrEP Locator'), ' or ', ext('https://www.hiv.gov/hiv-basics/hiv-prevention/using-hiv-medication-to-reduce-risk/pre-exposure-prophylaxis', 'learn more at HIV.gov'), '.'],
        [strong('Hepatitis A and B vaccines '), 'are recommended for people who use drugs, and health centers can provide them.'],
      ]),
      p(h('a', { class: 'btn btn-secondary', href: '#/treatment?codes=HIVT' }, 'Find treatment programs that offer HIV testing'), ' ',
        h('a', { class: 'btn btn-secondary', href: '#/treatment?codes=HCT' }, 'Hepatitis C testing')),
    ),
    section('paying', 'Paying for care',
      resourceList([
        { name: 'HealthCare.gov', href: 'https://www.healthcare.gov/', desc: 'Check whether you qualify for Medicaid or a low-cost marketplace plan. Plans must cover substance use and mental health treatment.' },
        { name: 'Medicaid', href: 'https://www.medicaid.gov/', desc: 'Covers substance use treatment, including medications for opioid use disorder. Eligibility and details vary by state.' },
        { name: 'HRSA Find a Health Center', href: 'https://findahealthcenter.hrsa.gov/', desc: 'Health centers charge on a sliding scale based on income.' },
        { name: '211', href: 'https://www.211.org/', desc: 'Free local help with housing, food, utilities, and transportation. Dial 2-1-1.' },
        { name: 'findhelp.org', href: 'https://www.findhelp.org/', desc: 'Search free and reduced-cost social services by ZIP code.' },
      ]),
    ),
    section('communities', 'Care for specific communities',
      resourceList([
        { name: 'VA health care locations', href: 'https://www.va.gov/find-locations/', desc: 'Substance use and mental health care for veterans.' },
        { name: 'Indian Health Service', href: 'https://www.ihs.gov/findhealthcare/', desc: 'Find IHS, Tribal, and Urban Indian health programs.' },
        { name: 'NIAAA Alcohol Treatment Navigator', href: 'https://alcoholtreatment.niaaa.nih.gov/', desc: 'Find and compare alcohol treatment, including providers who prescribe medication.' },
      ]),
    ),
    section('lines', 'Crisis and support lines', hotlineGrid(HOTLINES.crisis), p(h('a', { href: '#/crisis' }, 'See all support lines'))),
  );
}

// ---------------------------------------------------------------- Saved
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
        p('Nothing saved yet. Tap “Save” on any listing to keep it here while you compare.')));
      return;
    }
    tools.append(
      h('button', { type: 'button', class: 'btn btn-secondary', onclick: () => window.print() }, icon('printer'), 'Print list'),
      h('button', {
        type: 'button', class: 'btn btn-ghost',
        onclick: async () => {
          const text = items.map((i) => (i.kind === 'health-center' ? healthCenterText(i) : treatmentText(i))).join('\n\n');
          try { await navigator.clipboard.writeText(text); announce('Saved list copied'); } catch { announce('Copy is not available in this browser'); }
        },
      }, icon('copy'), 'Copy all'),
      h('button', {
        type: 'button', class: 'btn btn-ghost',
        onclick: () => { for (const i of items) toggleSaved(i); announce('Saved list cleared'); },
      }, icon('x'), 'Clear list'),
    );
    listEl.append(...items.map((i) => (i.kind === 'health-center' ? healthCenterCard(i, { headingLevel: 2 }) : treatmentCard(i, { headingLevel: 2 }))));
  }

  persistBox.addEventListener('change', () => {
    setPersist(persistBox.checked);
    announce(persistBox.checked ? 'Saved list will be kept on this device' : 'Saved list will be forgotten when you close this tab');
  });
  const unsubscribe = subscribe(() => {
    if (!listEl.isConnected) return unsubscribe();
    render();
  });
  render();

  return h('div', { class: 'view' },
    pageHeader('Saved places', 'A short list to compare, print, or share with someone you trust.'),
    h('div', { class: 'card persist' },
      h('label', { class: 'check' }, persistBox,
        h('span', null, 'Keep my saved list on this device',
          h('small', null, 'Off by default. When off, the list disappears when you close this tab. Quick exit always erases it.'))),
    ),
    tools,
    listEl,
  );
}

// ---------------------------------------------------------------- Crisis lines
export function crisisView() {
  return h('div', { class: 'view' },
    pageHeader('Talk to someone now', 'Free, confidential support. You do not have to be in crisis to call.'),
    emergencyCallout(),
    section('crisis-lines', 'Crisis and emotional support', hotlineGrid(HOTLINES.crisis)),
    section('su-lines', 'Substance use and overdose', hotlineGrid(HOTLINES.substanceUse)),
    section('community-lines', 'Support for specific communities', hotlineGrid(HOTLINES.communities)),
  );
}

// ---------------------------------------------------------------- Privacy
export function privacyView() {
  return h('div', { class: 'view view-prose' },
    pageHeader('Privacy', 'Looking for help with substance use is private health information. HarborPath is built so there is very little to protect.'),
    section('collect', 'What we collect',
      ul([
        [strong('No accounts, cookies, analytics, ads, or tracking pixels. '), 'The site loads no third-party scripts, fonts, or maps.'],
        [strong('Location is rounded. '), 'When you search, your area is rounded to about 1 km (0.01°) before it is sent anywhere. ',
          'HarborPath forwards treatment searches to SAMHSA’s FindTreatment.gov with that rounded location. Health center and ZIP lookups are answered on our own server.'],
        [strong('Nothing is logged with your location. '), 'Our server does not record search terms, ZIP codes, or coordinates. Rounded searches may be cached in memory for up to an hour so repeat searches are fast.'],
        [strong('Saved places stay on your device. '), 'They are kept in memory unless you choose to keep them on this device. Nothing is sent to us.'],
      ])),
    section('outbound', 'When you leave HarborPath',
      p('Links to other sites open in a new tab without telling that site you came from HarborPath. Those sites, including map links for directions, have their own privacy practices.')),
    section('safety', 'Staying safe on a shared device',
      ul([
        [strong('Quick exit: '), 'press the Quick exit button or the Escape key twice. HarborPath erases what it stored and replaces this page with a weather site.'],
        'HarborPath keeps a single entry in your browser’s back history, so pressing Back after a quick exit does not return here.',
        'Your browser may still show HarborPath in its history list. For more privacy, use a private or incognito window, or clear your history afterward.',
        'If someone may be monitoring your device, consider using a different phone or computer, such as one at a library.',
      ])),
    section('not-medical', 'Not medical advice',
      p('HarborPath shares general information from public health sources. It is not a substitute for care from a medical professional. In an emergency, call 911.')),
  );
}

export function notFoundView() {
  return h('div', { class: 'view' },
    pageHeader('Page not found', 'That page does not exist, but help is still here.'),
    p(h('a', { class: 'btn btn-primary', href: '#/' }, 'Go to the home page')),
  );
}
