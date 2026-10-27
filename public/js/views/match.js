// "Find care that fits": a short, skippable needs assessment, ranked results
// that explain themselves, side-by-side comparison, and a next-steps plan.
//
// Privacy: answers live in this module's memory only. They are never written
// to storage, the URL, or sent to the server. The server sees only what every
// other search already sends: a coarsened location, radius, kind, and state.
// Ranking runs here, in the browser, with public/js/match/engine.js.
import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { api } from '../api.js';
import { state, subscribe } from '../state.js';
import { t, formatNumber } from '../i18n.js';
import { locationPicker } from '../components/locationPicker.js';
import { saveButton, formatAddress } from '../components/facilityCard.js';
import { rankMatches, searchPlan, fromFacility, fromVirtualProvider } from '../match/engine.js';
import { pageHeader, p, fine } from './common.js';

const MAX_COMPARE = 3;
let uid = 0;

const blankProfile = () => ({
  helpWith: 'substance', substances: [], settings: [], medications: [], modality: 'either',
  coverage: null, needsFinancialHelp: false, timing: null, ageGroup: null, language: null,
  populations: [], barriers: [], customMiles: null,
});

// One answer set per page load, in memory. Quick exit unloads the page.
let profile = blankProfile();
let stepIndex = 0;
let emergency = false;

// ---------------------------------------------------------------- Labels
// Literal t() calls so the i18n contract test can see every key.
const LABELS = {
  substance: {
    opioid: () => t('match.sub.opioid', 'opioids (including fentanyl or pain pills)'),
    alcohol: () => t('match.sub.alcohol', 'alcohol'),
    stimulant: () => t('match.sub.stimulant', 'stimulants (meth or cocaine)'),
    benzodiazepine: () => t('match.sub.benzo', 'benzodiazepines'),
    cannabis: () => t('match.sub.cannabis', 'cannabis'),
    other: () => t('match.sub.other', 'something else'),
  },
  setting: {
    outpatient: () => t('match.set.outpatient', 'outpatient care'),
    iop: () => t('match.set.iop', 'intensive outpatient (IOP)'),
    php: () => t('match.set.php', 'day treatment (PHP)'),
    residential: () => t('match.set.residential', 'residential treatment'),
    detox: () => t('match.set.detox', 'detox / withdrawal care'),
    inpatient: () => t('match.set.inpatient', 'hospital inpatient care'),
    medication: () => t('match.set.medication', 'medication treatment'),
    counseling: () => t('match.set.counseling', 'counseling'),
    psychiatry: () => t('match.set.psychiatry', 'mental health / psychiatry'),
    'recovery-support': () => t('match.set.recovery', 'peer and recovery support'),
  },
  medication: {
    buprenorphine: () => t('match.med.bup', 'buprenorphine (Suboxone)'),
    methadone: () => t('match.med.methadone', 'methadone'),
    naltrexone: () => t('match.med.naltrexone', 'naltrexone (Vivitrol)'),
    'alcohol-medication': () => t('match.med.aud', 'alcohol use disorder medication'),
  },
  coverage: {
    private: () => t('match.cov.private', 'private insurance'),
    medicaid: () => t('match.cov.medicaid', 'Medicaid'),
    medicare: () => t('match.cov.medicare', 'Medicare'),
    military: () => t('match.cov.military', 'TRICARE'),
    va: () => t('match.cov.va', 'VA benefits'),
    ihs: () => t('match.cov.ihs', 'Indian Health Service / Tribal'),
    uninsured: () => t('match.cov.uninsured', 'no insurance'),
    unsure: () => t('match.cov.unsure', 'not sure'),
  },
  population: {
    veteran: () => t('match.pop.veteran', 'veterans'),
    pregnant: () => t('match.pop.pregnant', 'pregnant or postpartum people'),
    women: () => t('match.pop.women', 'women'),
    men: () => t('match.pop.men', 'men'),
    lgbtq: () => t('match.pop.lgbtq', 'LGBTQ+ people'),
    'co-occurring': () => t('match.pop.cooccurring', 'people with mental health needs too'),
    trauma: () => t('match.pop.trauma', 'trauma survivors'),
    justice: () => t('match.pop.justice', 'people involved with the justice system'),
    hiv: () => t('match.pop.hiv', 'people living with HIV'),
    pain: () => t('match.pop.pain', 'people with chronic pain'),
    'faith-based': () => t('match.pop.faith', 'faith-based care'),
    secular: () => t('match.pop.secular', 'secular (non-religious) care'),
  },
  age: {
    youth: () => t('match.age.youth', 'teens (under 18)'),
    'young-adult': () => t('match.age.youngAdult', 'young adults (18–25)'),
    adult: () => t('match.age.adult', 'adults'),
    senior: () => t('match.age.senior', 'older adults (65+)'),
  },
  language: {
    es: () => t('match.lang.es', 'Spanish'),
    asl: () => t('match.lang.asl', 'American Sign Language'),
    zh: () => t('match.lang.zh', 'Chinese'),
    vi: () => t('match.lang.vi', 'Vietnamese'),
    ko: () => t('match.lang.ko', 'Korean'),
    ru: () => t('match.lang.ru', 'Russian'),
    ar: () => t('match.lang.ar', 'Arabic'),
    tl: () => t('match.lang.tl', 'Tagalog'),
    ht: () => t('match.lang.ht', 'Haitian Creole'),
    native: () => t('match.lang.native', 'an American Indian or Alaska Native language'),
  },
  timing: {
    daytime: () => t('match.time.daytime', 'daytime'),
    evening: () => t('match.time.evening', 'evening'),
    weekend: () => t('match.time.weekend', 'weekend'),
  },
  afford: {
    free: () => t('match.afford.free', 'free care'),
    'sliding-scale': () => t('match.afford.sliding', 'sliding fee scale'),
    'payment-assistance': () => t('match.afford.assist', 'payment assistance'),
    'public-funding': () => t('match.afford.public', 'public (state or federal) funding'),
    'published-self-pay': () => t('match.afford.selfPay', 'published self-pay price'),
  },
};
const label = (group, key) => LABELS[group]?.[key]?.() ?? key;
const list = (group, keys) => (keys ?? []).map((k) => label(group, k)).join(', ');

const TIERS = {
  confirmed: { tone: 'ok', text: () => t('match.tier.confirmed', 'In network: confirmed') },
  'provider-reported': { tone: 'ok', text: () => t('match.tier.reported', 'Listed as accepted (provider-reported)') },
  possible: { tone: 'warn', text: () => t('match.tier.possible', 'May work: needs checking') },
  'not-listed': { tone: 'muted', text: () => t('match.tier.notListed', 'Your coverage is not listed') },
  unknown: { tone: 'muted', text: () => t('match.tier.unknown', 'Coverage unknown') },
};

/** Turn an engine reason ({ code, params }) into a sentence. */
function describe(r) {
  const q = r.params ?? {};
  const miles = (n) => formatNumber(n, { maximumFractionDigits: 1 });
  switch (r.code) {
    case 'clinical.mentalHealth': return t('match.why.mh', 'Lists mental health treatment');
    case 'clinical.substance': return t('match.why.substance', 'Lists services for {what}', { what: label('substance', q.substance) });
    case 'clinical.setting': return t('match.why.setting', 'Offers {what}', { what: label('setting', q.setting) });
    case 'clinical.medication': return t('match.why.medication', 'Lists {what}', { what: label('medication', q.medication) });
    case 'coverage.confirmed': return t('match.why.confirmed', 'In-network status confirmed by {source} ({date})', q);
    case 'coverage.affordable': return t('match.why.affordable', 'Lists lower-cost options: {what}', { what: list('afford', q.options) });
    case 'coverage.selfPayOnly': return t('match.why.selfPayOnly', 'Lists self-pay only; price not published');
    case 'coverage.listedPayments': return t('match.why.listedPayments', 'Lists the payment types it accepts (see below)');
    case 'coverage.reported': return t('match.why.reported', 'Told SAMHSA it accepts {what}', { what: label('coverage', q.coverage) });
    case 'coverage.statePlan': return t('match.why.statePlan', 'Lists a state-financed health plan (ask if yours counts)');
    case 'coverage.alternatives': return t('match.why.alternatives', '{coverage} is not listed, but it lists {what}', { coverage: label('coverage', q.coverage), what: list('afford', q.options) });
    case 'coverage.reportedByProvider': return t('match.why.reportedByProvider', 'Says on its website that it accepts {what}', { what: label('coverage', q.coverage) });
    case 'coverage.selfPayAvailable': return q.price
      ? t('match.why.selfPayPrice', 'Self-pay available: {price}', { price: q.price })
      : t('match.why.selfPay', 'Self-pay available (price not published)');
    case 'access.virtualInState': return t('match.why.virtualInState', 'Online program that lists {state} as a state it serves', { state: q.state ?? '' });
    case 'access.virtual': return t('match.why.virtual', 'Online program');
    case 'access.statewideTelehealth': return t('match.why.statewide', 'Licensed program in {state} that offers telehealth', { state: q.state ?? '' });
    case 'access.telehealth': return t('match.why.telehealth', 'Offers telehealth');
    case 'access.distance': return t('match.why.distance', '{miles} miles away', { miles: miles(q.miles) });
    case 'access.transportation': return t('match.why.transport', 'Lists transportation help');
    case 'access.childcare': return t('match.why.childcare', 'Lists childcare for clients');
    case 'access.housing': return t('match.why.housing', 'Lists housing services');
    case 'pref.language': return t('match.why.language', 'Lists services in {what}', { what: label('language', q.language) });
    case 'pref.ageProgram': return t('match.why.age', 'Has a program for {what}', { what: label('age', q.ageGroup) });
    case 'pref.population': return t('match.why.population', 'Has a program for {what}', { what: label('population', q.population) });
    case 'missing.setting': return t('match.miss.setting', '{what} is not listed', { what: label('setting', q.setting) });
    case 'missing.medication': return t('match.miss.medication', '{what} is not listed', { what: label('medication', q.medication) });
    case 'missing.telehealth': return t('match.miss.telehealth', 'Telehealth is not listed');
    case 'verify.plan': return t('match.verify.plan', 'Whether your exact {what} plan is accepted, and what you will pay', { what: label('coverage', q.coverage) });
    case 'verify.coverageUnsure': return t('match.verify.coverageUnsure', 'What your coverage (if any) pays for here');
    case 'verify.noPaymentInfo': return t('match.verify.noPayment', 'Payment options (none are listed)');
    case 'verify.price': return t('match.verify.price', 'The price (it is not published)');
    case 'verify.hours': return t('match.verify.hours', 'Whether {what} appointments are offered', { what: label('timing', q.timing) });
    case 'verify.intake': return t('match.verify.intake', 'Whether they are taking new clients, and the wait time');
    case 'verify.mentalHealth': return t('match.verify.mh', 'Whether mental health care is offered');
    case 'verify.substance': return t('match.verify.substance', 'Whether they treat {what} use', { what: label('substance', q.substance) });
    case 'verify.stateAvailability': return t('match.verify.state', 'Whether the program serves your state (it does not list states)');
    case 'verify.language': return t('match.verify.language', 'Whether services are offered in {what}', { what: label('language', q.language) });
    case 'verify.age': return t('match.verify.age', 'Whether they serve {what}', { what: label('age', q.ageGroup) });
    case 'verify.population': return t('match.verify.population', 'Whether they offer care for {what} (federal listings do not track this)', { what: label('population', q.population) });
    case 'verify.stale': return q.date
      ? t('match.verify.stale', 'Information may be out of date (last checked {date})', q)
      : t('match.verify.undated', 'Information has no verification date');
    case 'verify.sparse': return t('match.verify.sparse', 'Most details (the listing is short)');
    case 'exclude.doesNotTreat': return t('match.ex.doesNotTreat', 'Says it does not treat {what} use', { what: label('substance', q.substance) });
    case 'exclude.duiOnly': return t('match.ex.duiOnly', 'Serves DUI/DWI clients only');
    case 'exclude.opioidOnly': return t('match.ex.opioidOnly', 'Serves opioid use disorder only');
    case 'exclude.alcoholOnly': return t('match.ex.alcoholOnly', 'Serves alcohol use disorder only');
    case 'exclude.virtualOnly': return t('match.ex.virtualOnly', 'Online only, and you asked for in-person care');
    case 'exclude.notInState': return t('match.ex.notInState', 'Not offered in {state}', q);
    default: return r.code;
  }
}

// ---------------------------------------------------------------- Form parts
function choices({ legend, hint, options, multiple = false, value, onChange }) {
  const name = `m-${++uid}`;
  const current = multiple ? new Set(value ?? []) : value;
  return h('fieldset', { class: 'choice-group' },
    h('legend', null, legend),
    hint && h('p', { class: 'help' }, hint),
    h('div', { class: 'choice-grid' },
      options.map(([val, text, desc]) => {
        const input = h('input', { type: multiple ? 'checkbox' : 'radio', name, value: val ?? '' });
        input.checked = multiple ? current.has(val) : current === val;
        input.addEventListener('change', () => {
          if (multiple) {
            if (input.checked) current.add(val); else current.delete(val);
            onChange([...current]);
          } else if (input.checked) onChange(val);
        });
        return h('label', { class: 'choice' }, input,
          h('span', { class: 'choice-text' }, h('span', { class: 'choice-label' }, text), desc && h('span', { class: 'choice-desc' }, desc)));
      })));
}

const opts = (group, keys) => keys.map((k) => [k, label(group, k)]);
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function emergencyPanel() {
  return h('section', { class: 'callout callout-emergency', 'aria-labelledby': 'm-emergency' },
    h('h2', { id: 'm-emergency', class: 'callout-title', tabindex: '-1' }, icon('alert'), t('match.em.title', 'Get emergency help now')),
    h('ol', { class: 'list' },
      h('li', null, t('match.em.call', 'Call 911. Say the person is not breathing or will not wake up, and give the address.')),
      h('li', null, t('match.em.naloxone', 'If opioids could be involved and you have naloxone (Narcan), give it now. A second dose can be given after 2–3 minutes if there is no response.')),
      h('li', null, t('match.em.stay', 'Stay with them. If you are trained, give rescue breaths. Put them on their side if they are breathing.')),
    ),
    h('p', { class: 'actions' },
      tel('911', [icon('phone'), t('common.call911', 'Call 911')], { class: 'btn btn-emergency' }),
      h('a', { class: 'btn btn-secondary', href: '#/overdose' }, t('common.emergency.steps', 'Overdose response steps')),
      tel('988', [icon('phone'), t('match.em.988', 'Mental health or suicide crisis: call or text 988')], { class: 'btn btn-secondary' }),
    ),
    h('p', { class: 'fine' }, t('match.em.note', 'HarborPath cannot send help. Matching can wait until everyone is safe.')),
    h('button', { type: 'button', class: 'link-btn', onclick: () => { emergency = false; rerender(); } },
      t('match.em.back', 'Everyone is safe: continue finding care')),
  );
}

// ---------------------------------------------------------------- Steps
const STEPS = [
  {
    title: () => t('match.s1.title', 'What kind of help are you looking for?'),
    render: () => [
      choices({
        legend: t('match.s1.safety', 'First: is anyone in danger right now?'),
        options: [
          ['danger', t('match.s1.danger', 'Yes: a possible overdose, or someone may hurt themselves')],
          ['safe', t('match.s1.safe', 'No, I am looking for care')],
        ],
        value: 'safe',
        onChange: (v) => { if (v === 'danger') { emergency = true; rerender(); } },
      }),
      choices({
        legend: t('match.s1.helpWith', 'Help with'),
        options: [
          ['substance', t('match.s1.substance', 'Alcohol or drug use')],
          ['mental-health', t('match.s1.mh', 'Mental health')],
          ['both', t('match.s1.both', 'Both')],
        ],
        value: profile.helpWith,
        onChange: (v) => { profile.helpWith = v; },
      }),
      choices({
        legend: t('match.s1.substances', 'Which substances? (optional, choose any)'),
        hint: t('match.s1.substancesHint', 'This helps find programs that treat it. It stays on your device.'),
        multiple: true,
        options: opts('substance', ['opioid', 'alcohol', 'stimulant', 'benzodiazepine', 'cannabis', 'other']),
        value: profile.substances,
        onChange: (v) => { profile.substances = v; },
      }),
    ],
  },
  {
    title: () => t('match.s2.title', 'What kind of care?'),
    render: () => [
      choices({
        legend: t('match.s2.settings', 'Types of care (optional, choose any)'),
        hint: t('match.s2.settingsHint', 'Not sure? Skip this. A clinician will recommend a level of care at your first assessment.'),
        multiple: true,
        options: opts('setting', ['outpatient', 'iop', 'php', 'residential', 'detox', 'medication', 'counseling', 'psychiatry', 'recovery-support']),
        value: profile.settings,
        onChange: (v) => { profile.settings = v; },
      }),
      choices({
        legend: t('match.s2.meds', 'Medications you want available (optional)'),
        multiple: true,
        options: opts('medication', ['buprenorphine', 'methadone', 'naltrexone', 'alcohol-medication']),
        value: profile.medications,
        onChange: (v) => { profile.medications = v; },
      }),
      p(h('a', { href: '#/navigator' }, t('match.s2.navigator', 'Unsure what level of care fits? Try the private care navigator.'))),
    ],
  },
  {
    title: () => t('match.s3.title', 'Where, and how?'),
    render: () => [
      h('div', { class: 'card' }, locationPicker()),
      choices({
        legend: t('match.s3.modality', 'In person or online?'),
        options: [
          ['either', t('match.s3.either', 'Either is fine')],
          ['in-person', t('match.s3.inPerson', 'In person')],
          ['virtual', t('match.s3.virtual', 'Online / telehealth, anywhere in my state')],
        ],
        value: profile.modality,
        onChange: (v) => { profile.modality = v; },
      }),
      customMilesField(),
      fine(t('match.s3.privacy', 'A ZIP code or city is enough. Your location is rounded to about 1 km and never stored.')),
    ],
  },
  {
    title: () => t('match.s4.title', 'How will you pay?'),
    render: () => [
      choices({
        legend: t('match.s4.coverage', 'Your coverage'),
        hint: t('match.s4.hint', 'We never ask for your member ID. Programs only list the kinds of insurance they take, so we will show what still needs checking.'),
        options: opts('coverage', ['private', 'medicaid', 'medicare', 'military', 'va', 'ihs', 'uninsured', 'unsure']),
        value: profile.coverage,
        onChange: (v) => { profile.coverage = v; },
      }),
      choices({
        legend: t('match.s4.help', 'Cost'),
        multiple: true,
        options: [['yes', t('match.s4.needHelp', 'I need free, low-cost, or sliding-fee options')]],
        value: profile.needsFinancialHelp ? ['yes'] : [],
        onChange: (v) => { profile.needsFinancialHelp = v.includes('yes'); },
      }),
    ],
  },
  {
    title: () => t('match.s5.title', 'Anything else that matters to you? (all optional)'),
    render: () => [
      p(t('match.s5.lede', 'Answer only what you want. These add matching programs higher on the list; they never remove anyone.')),
      choices({
        legend: t('match.s5.timing', 'Best time for appointments'),
        options: [...opts('timing', ['daytime', 'evening', 'weekend']), [null, t('match.skip', 'Skip')]],
        value: profile.timing,
        onChange: (v) => { profile.timing = v; },
      }),
      choices({
        legend: t('match.s5.age', 'Age group'),
        options: [...opts('age', ['youth', 'young-adult', 'adult', 'senior']), [null, t('match.skip', 'Skip')]],
        value: profile.ageGroup,
        onChange: (v) => { profile.ageGroup = v; },
      }),
      choices({
        legend: t('match.s5.language', 'Language other than English'),
        options: [...opts('language', ['es', 'asl', 'zh', 'vi', 'ko', 'ru', 'ar', 'tl', 'ht', 'native']), [null, t('match.skip', 'Skip')]],
        value: profile.language,
        onChange: (v) => { profile.language = v; },
      }),
      choices({
        legend: t('match.s5.populations', 'Programs designed for (choose any)'),
        multiple: true,
        options: opts('population', ['veteran', 'pregnant', 'women', 'men', 'lgbtq', 'co-occurring', 'trauma', 'justice', 'hiv', 'pain', 'faith-based', 'secular']),
        value: profile.populations,
        onChange: (v) => { profile.populations = v; },
      }),
      choices({
        legend: t('match.s5.barriers', 'Help I may need'),
        multiple: true,
        options: [
          ['transportation', t('match.bar.transport', 'Getting there (transportation)')],
          ['childcare', t('match.bar.childcare', 'Childcare')],
          ['housing', t('match.bar.housing', 'Stable housing')],
        ],
        value: profile.barriers,
        onChange: (v) => { profile.barriers = v; },
      }),
    ],
  },
];

function customMilesField() {
  const id = `m-miles-${++uid}`;
  const input = h('input', {
    id, class: 'input input-short', type: 'number', inputmode: 'numeric', min: '1', max: '250', step: '1',
    value: profile.customMiles ?? '',
  });
  input.addEventListener('change', () => {
    const n = Number(input.value);
    profile.customMiles = Number.isFinite(n) && n >= 1 && n <= 250 ? Math.round(n) : null;
    if (input.value && profile.customMiles === null) input.value = '';
  });
  return h('div', { class: 'field' },
    h('label', { class: 'label', for: id }, t('match.s3.custom', 'Custom distance in miles (optional, 1–250)')),
    input);
}

// ---------------------------------------------------------------- Rendering
let root = null;

function rerender() {
  if (!root) return;
  clear(root);
  if (emergency) {
    root.append(emergencyPanel());
    root.querySelector('#m-emergency')?.focus();
    return;
  }
  if (stepIndex >= STEPS.length) {
    root.append(resultsView());
    return;
  }
  const step = STEPS[stepIndex];
  const headingId = `m-step-${stepIndex}`;
  const canShow = Boolean(state.location);
  const showBtn = h('button', { type: 'button', class: 'btn btn-primary', disabled: !canShow, onclick: () => go(STEPS.length) },
    icon('search'), t('match.showResults', 'See my matches'));
  root.append(
    h('section', { class: 'card wizard', 'aria-labelledby': headingId },
      h('p', { class: 'step-progress' }, t('match.progress', 'Step {n} of {total}', { n: stepIndex + 1, total: STEPS.length })),
      h('h2', { id: headingId, tabindex: '-1' }, step.title()),
      step.render(),
      h('div', { class: 'wizard-nav' },
        stepIndex > 0 && h('button', { type: 'button', class: 'btn btn-ghost', onclick: () => go(stepIndex - 1) }, t('match.back', 'Back')),
        stepIndex < STEPS.length - 1 && h('button', { type: 'button', class: 'btn btn-secondary', onclick: () => go(stepIndex + 1) }, t('match.next', 'Next')),
        showBtn,
      ),
      !canShow && h('p', { class: 'help' }, t('match.needLocation', 'Add a ZIP code or city (step 3) to see matches. Everything else is optional.')),
    ),
  );
  // The location picker updates shared state; enable "See my matches" live.
  const off = subscribe(() => {
    if (!showBtn.isConnected) return off();
    showBtn.disabled = !state.location;
  });
}

function go(i) {
  stepIndex = Math.max(0, Math.min(STEPS.length, i));
  // Back in the questions: answers may change, so results must be rebuilt.
  if (stepIndex < STEPS.length) {
    results.controller?.abort();
    results.loading = false;
    results.ranked = null;
  }
  rerender();
  root?.querySelector('h2')?.focus();
}

// ---------------------------------------------------------------- Results
const results = { controller: null, loading: false, ranked: null, error: null, pending: 0, virtualNote: null, compare: new Set(), onlineOnly: false, coveredOnly: false };

async function loadMatches() {
  results.controller?.abort();
  const controller = new AbortController();
  results.controller = controller;
  results.loading = true;
  const { signal } = controller;
  const loc = state.location;
  const maxMiles = profile.customMiles ?? state.radius;
  const engineProfile = { ...profile, coverage: profile.coverage ?? 'unsure', state: loc?.state ?? null, maxMiles };
  const plan = searchPlan(engineProfile);
  const tasks = [];

  if (plan.local) {
    tasks.push((async () => {
      const first = await api.treatment({ lat: loc.lat, lng: loc.lng, radius: plan.radius, kind: plan.kind, page: 1 }, signal);
      const rows = [...first.results];
      if (plan.localPages > 1 && first.totalPages > 1) {
        const second = await api.treatment({ lat: loc.lat, lng: loc.lng, radius: plan.radius, kind: plan.kind, page: 2 }, signal);
        rows.push(...second.results);
      }
      // A custom distance narrows the nearest-first list from the next radius up.
      return rows.filter((f) => f.miles === null || f.miles <= maxMiles).map((f) => fromFacility(f, { via: 'local' }));
    })());
  }
  if (plan.telehealth) {
    tasks.push(api.telehealth({ state: loc.state, lat: loc.lat, lng: loc.lng, kind: plan.kind }, signal)
      .then((r) => r.results.map((f) => fromFacility(f, { via: 'telehealth', state: loc.state }))));
  }
  if (plan.virtualProviders) {
    tasks.push(api.virtualProviders({ state: loc.state }, signal).then((r) => {
      results.pending = r.pendingReview ?? 0;
      results.virtualNote = r.disclosure;
      return r.results.map(fromVirtualProvider);
    }));
  }

  const settled = await Promise.allSettled(tasks);
  if (signal.aborted) return;
  results.loading = false;
  const candidates = settled.filter((s) => s.status === 'fulfilled').flatMap((s) => s.value);
  const failed = settled.filter((s) => s.status === 'rejected' && s.reason?.name !== 'AbortError');
  results.error = failed.length ? failed[0].reason : null;
  results.ranked = rankMatches(engineProfile, candidates);
  rerender();
  announce(t('match.announce', '{n} options ranked', { n: results.ranked.matches.length }));
}

function visibleMatches() {
  return (results.ranked?.matches ?? []).filter((m) =>
    (!results.onlineOnly || m.candidate.telehealth)
    && (!results.coveredOnly || ['confirmed', 'provider-reported'].includes(m.coverage.tier)));
}

function answersSummary() {
  const parts = [
    profile.helpWith === 'mental-health' ? t('match.sum.mh', 'Mental health') : profile.helpWith === 'both'
      ? t('match.sum.both', 'Substance use and mental health') : t('match.sum.sa', 'Substance use'),
    profile.substances.length && list('substance', profile.substances),
    profile.settings.length && list('setting', profile.settings),
    profile.medications.length && list('medication', profile.medications),
    profile.modality === 'virtual' ? t('match.s3.virtual', 'Online / telehealth, anywhere in my state')
      : profile.modality === 'in-person' ? t('match.s3.inPerson', 'In person') : null,
    profile.coverage && capitalize(label('coverage', profile.coverage)),
    state.location && t('match.sum.near', 'near {place}, within {miles} miles', { place: state.location.label, miles: profile.customMiles ?? state.radius }),
  ];
  return parts.filter(Boolean).join(' · ');
}

function resultsView() {
  const wrap = h('div', { class: 'match-results' });
  const head = h('section', { class: 'card match-summary', 'aria-labelledby': 'm-results' },
    h('h2', { id: 'm-results', tabindex: '-1' }, t('match.results.title', 'Your matches')),
    p(answersSummary()),
    h('p', { class: 'actions' },
      h('button', { type: 'button', class: 'btn btn-small btn-secondary', onclick: () => go(0) }, t('match.edit', 'Change answers')),
      h('button', { type: 'button', class: 'btn btn-small btn-ghost', onclick: () => window.print() }, icon('printer'), t('match.print', 'Print'))),
    fine(t('match.results.privacy', 'Your answers stay on this device and were not sent anywhere. Results are ranked on your device.')),
  );
  wrap.append(head);

  if (!results.ranked) {
    wrap.append(h('div', { class: 'skeleton', 'aria-hidden': 'true' }, h('div', { class: 'sk sk-title' }), h('div', { class: 'sk sk-line' }), h('div', { class: 'sk sk-line' })),
      h('p', { class: 'results-status', role: 'status' }, t('match.loading', 'Finding and ranking options…')));
    if (!results.loading) loadMatches().catch(() => { results.loading = false; });
    return wrap;
  }

  wrap.append(disclaimer());
  if (results.error) {
    wrap.append(h('div', { class: 'callout callout-warn', role: 'alert' },
      p(t('match.partial', 'Part of the search did not respond, so these results may be incomplete.')),
      p(t('match.partialHelp', 'You can also search FindTreatment.gov or call the free SAMHSA helpline at '), tel('18006624357', '1-800-662-4357'), '.')));
  }

  const filters = h('div', { class: 'match-filters', role: 'group', 'aria-label': t('match.filters', 'Filter matches') },
    toggle(t('match.f.online', 'Telehealth or online only'), results.onlineOnly, (v) => { results.onlineOnly = v; rerender(); }),
    toggle(t('match.f.covered', 'Only programs that list my coverage'), results.coveredOnly, (v) => { results.coveredOnly = v; rerender(); }),
  );
  wrap.append(filters);

  const shown = visibleMatches();
  wrap.append(h('p', { class: 'results-status', role: 'status' }, t('match.count', 'Showing {n} of {total} options, best fit first.', { n: shown.length, total: results.ranked.matches.length })));

  if (results.compare.size) wrap.append(compareSection());

  if (!shown.length) {
    wrap.append(emptyState());
  } else {
    wrap.append(h('ol', { class: 'results-list match-list' }, shown.map((m, i) => h('li', null, matchCard(m, i)))));
  }

  wrap.append(virtualNote(), excludedNote(), actionPlan(shown));
  return wrap;
}

function toggle(text, value, onChange) {
  const input = h('input', { type: 'checkbox' });
  input.checked = value;
  input.addEventListener('change', () => onChange(input.checked));
  return h('label', { class: 'check' }, input, text);
}

function disclaimer() {
  return h('div', { class: 'callout callout-info' },
    h('p', null, t('match.disclaimer', 'Matching is not a medical assessment and is not a referral: no one has been contacted. Rankings use what programs report to federal directories or on their own websites. HarborPath is not paid by any program, and payment never affects ranking.')),
  );
}

function emptyState() {
  return h('div', { class: 'empty card' },
    p(t('match.empty', 'No listed programs match these answers here. We will not invent results.')),
    h('ul', { class: 'list' },
      h('li', null, t('match.empty.widen', 'Try a larger distance, or choose online / telehealth care.')),
      h('li', null, t('match.empty.filters', 'Turn off the filters above, or skip some answers.')),
      h('li', null, t('match.empty.helpline', 'Call the free, confidential SAMHSA National Helpline 24/7: '), tel('18006624357', '1-800-662-4357')),
    ),
    h('p', { class: 'actions' }, h('button', { type: 'button', class: 'btn btn-secondary', onclick: () => go(2) }, t('match.empty.change', 'Change location or distance'))),
  );
}

function kindBadge(c) {
  if (c.kind === 'virtual') return t('match.kind.virtual', 'Online program');
  if (c.via === 'telehealth') return t('match.kind.statewide', 'Telehealth in your state');
  return t('match.kind.local', 'Licensed facility');
}

function paymentSummary(c) {
  if (c.kind !== 'facility') return null;
  const pay = (c.record.services ?? []).filter((s) => s.category === 'PAY' || s.category === 'PYAS').flatMap((s) => s.items);
  if (!pay.length) return null;
  return h('p', { class: 'fine' }, t('match.card.payments', 'Payment it lists: {list}', { list: pay.join(' · ') }));
}

function contactActions(m) {
  const c = m.candidate;
  const r = c.record;
  const phone = r.intake ?? r.phone;
  const site = c.kind === 'virtual' ? (r.enrollUrl ?? r.officialUrl) : r.website;
  return [
    phone && tel(phone, [icon('phone'), t('card.call', 'Call {phone}', { phone })], { class: 'btn btn-small btn-primary' }),
    site && ext(site, icon('globe'), c.kind === 'virtual'
      ? (r.enrollUrl ? t('match.card.enroll', 'Official sign-up page') : t('match.card.official', 'Official website'))
      : t('common.website', 'Website')),
  ];
}

function matchCard(m, index) {
  const c = m.candidate;
  const tier = TIERS[m.coverage.tier];
  const id = `m-card-${index}`;
  const compareBox = h('input', { type: 'checkbox' });
  compareBox.checked = results.compare.has(m.id);
  compareBox.disabled = !compareBox.checked && results.compare.size >= MAX_COMPARE;
  compareBox.addEventListener('change', () => {
    if (compareBox.checked) results.compare.add(m.id); else results.compare.delete(m.id);
    rerender();
    document.getElementById('m-compare')?.focus();
  });
  const address = c.kind === 'facility' && c.via === 'local' ? formatAddress(c.record.address) : null;
  const saveItem = c.kind === 'facility'
    ? { ...c.record, kind: 'treatment' }
    : { id: c.id, kind: 'treatment', name: c.name, website: c.record.officialUrl, phone: c.record.phone, codes: [], services: [] };

  return h('article', { class: 'card facility match-card', 'aria-labelledby': id },
    h('div', { class: 'facility-head' },
      h('div', null,
        h('p', { class: 'match-kind' }, kindBadge(c)),
        h('h3', { id, class: 'facility-name' }, c.name),
        c.subname && h('p', { class: 'subname' }, c.subname),
      ),
      c.miles !== null && h('p', { class: 'distance' }, t('card.distance', '{miles} mi', { miles: formatNumber(c.miles, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) })),
    ),
    address && h('p', { class: 'address' }, icon('pin'), address),
    h('ul', { class: 'chips' },
      h('li', { class: `chip tier tier-${tier.tone}` }, tier.text()),
      c.telehealth && h('li', { class: 'chip chip-care' }, t('match.chip.telehealth', 'Telehealth')),
      m.coverage.affordability.map((a) => h('li', { class: 'chip chip-pay' }, capitalize(label('afford', a)))),
    ),
    m.reasons.length > 0 && h('div', { class: 'why' },
      h('h4', null, t('match.card.why', 'Why it may fit')),
      h('ul', { class: 'list' }, m.reasons.map((r) => h('li', null, describe(r))))),
    m.missing.length > 0 && h('div', { class: 'why why-missing' },
      h('h4', null, t('match.card.missing', 'Not listed')),
      h('ul', { class: 'list' }, m.missing.map((r) => h('li', null, describe(r))))),
    h('details', { class: 'why why-verify' },
      h('summary', null, t('match.card.verify', 'Still needs confirming ({n})', { n: m.verify.length })),
      h('ul', { class: 'list' }, m.verify.map((r) => h('li', null, describe(r))))),
    paymentSummary(c),
    c.kind === 'virtual' && c.record.enrollmentProcess && h('p', { class: 'fine' },
      t('match.card.howToJoin', 'How to join, in the program’s words: {text}', { text: c.record.enrollmentProcess })),
    h('div', { class: 'actions' },
      contactActions(m),
      saveButton(saveItem),
      h('label', { class: 'check compare-check' }, compareBox, t('match.card.compare', 'Compare'))),
    h('p', { class: 'fine source-note' }, c.kind === 'virtual'
      ? t('match.card.sourceVirtual', 'Source: the program’s own website, read {date}. Not verified by HarborPath; no partnership.', { date: c.source.verifiedAt ?? '?' })
      : t('match.card.sourceSamhsa', 'Source: SAMHSA FindTreatment.gov, searched live. Facility-reported.')),
  );
}

// ---------------------------------------------------------------- Compare
function compareSection() {
  const chosen = results.ranked.matches.filter((m) => results.compare.has(m.id));
  const rows = [
    [t('match.cmp.type', 'Type'), (m) => kindBadge(m.candidate)],
    [t('match.cmp.distance', 'Distance'), (m) => (m.candidate.miles === null ? '—' : t('card.distance', '{miles} mi', { miles: formatNumber(m.candidate.miles, { maximumFractionDigits: 1 }) }))],
    [t('match.cmp.telehealth', 'Telehealth'), (m) => (m.candidate.telehealth ? t('match.yes', 'Yes') : t('match.notListed', 'Not listed'))],
    [t('match.cmp.coverage', 'Your coverage'), (m) => TIERS[m.coverage.tier].text()],
    [t('match.cmp.cost', 'Lower-cost options'), (m) => (m.coverage.affordability.length ? capitalize(list('afford', m.coverage.affordability)) : t('match.notListed', 'Not listed'))],
    [t('match.cmp.fit', 'Fits your needs'), (m) => m.reasons.filter((r) => r.code.startsWith('clinical.')).map(describe).join('; ') || '—'],
    [t('match.cmp.missing', 'Not listed'), (m) => m.missing.map(describe).join('; ') || '—'],
    [t('match.cmp.verify', 'To confirm'), (m) => String(m.verify.length)],
    [t('match.cmp.contact', 'Contact'), (m) => contactActions(m)],
  ];
  return h('section', { class: 'compare', 'aria-labelledby': 'm-compare' },
    h('h2', { id: 'm-compare', tabindex: '-1' }, t('match.cmp.title', 'Compare ({n} of {max})', { n: chosen.length, max: MAX_COMPARE })),
    h('div', { class: 'table-wrap', tabindex: '0', role: 'region', 'aria-labelledby': 'm-compare' },
      h('table', null,
        h('thead', null, h('tr', null, h('td', null), chosen.map((m) => h('th', { scope: 'col' }, m.candidate.name)))),
        h('tbody', null, rows.map(([name, cell]) => h('tr', null, h('th', { scope: 'row' }, name), chosen.map((m) => h('td', null, cell(m)))))))),
    h('p', { class: 'actions' }, h('button', { type: 'button', class: 'btn btn-small btn-ghost', onclick: () => { results.compare.clear(); rerender(); } }, t('match.cmp.clear', 'Clear comparison'))),
  );
}

// ---------------------------------------------------------------- Notes & plan
function virtualNote() {
  if (profile.modality === 'in-person' || profile.helpWith === 'mental-health') return null;
  const hasVirtual = results.ranked.matches.some((m) => m.candidate.kind === 'virtual');
  if (hasVirtual || !results.pending) return null;
  return h('div', { class: 'callout callout-info' },
    h('p', { class: 'callout-title' }, t('match.virtual.title', 'About online-only programs')),
    p(t('match.virtual.pending', 'We are checking information about {n} online treatment programs against their official websites before listing them, so we do not show claims we have not confirmed. Telehealth programs from SAMHSA’s directory are included above.', { n: results.pending })));
}

function excludedNote() {
  const ex = results.ranked.excluded;
  if (!ex.length) return null;
  return h('details', { class: 'card excluded' },
    h('summary', null, t('match.ex.title', '{n} listings left out, and why', { n: ex.length })),
    h('ul', { class: 'list' }, ex.map((e) => h('li', null, h('strong', null, e.name), ': ', describe(e.reason)))));
}

function actionPlan(shown) {
  const picked = results.compare.size
    ? results.ranked.matches.filter((m) => results.compare.has(m.id))
    : shown.slice(0, 3);
  if (!picked.length) return null;
  const questions = new Map();
  for (const m of picked) for (const v of m.verify) questions.set(v.code + JSON.stringify(v.params ?? {}), describe(v));
  const cov = profile.coverage;
  return h('section', { class: 'card action-plan', 'aria-labelledby': 'm-plan' },
    h('h2', { id: 'm-plan' }, t('match.plan.title', 'Your next steps')),
    h('ol', { class: 'checklist' },
      h('li', null, t('match.plan.contact', 'Contact your top choices: {names}.', { names: picked.map((m) => m.candidate.name).join('; ') })),
      h('li', null, t('match.plan.ask', 'Ask each one about:'), h('ul', { class: 'list' }, [...questions.values()].map((q) => h('li', null, q)))),
      ['private', 'medicaid', 'medicare', 'military'].includes(cov) && h('li', null,
        t('match.plan.insurer', 'Call the member services number on your insurance card and ask:'),
        h('ul', { class: 'list' },
          h('li', null, t('match.plan.q1', 'Is this program in network for my plan?')),
          h('li', null, t('match.plan.q2', 'Do I need prior authorization or a referral?')),
          h('li', null, t('match.plan.q3', 'What is my deductible, copay, or coinsurance for this kind of care?')))),
      (cov === 'uninsured' || cov === 'unsure' || profile.needsFinancialHelp) && h('li', null,
        t('match.plan.medicaid', 'You may qualify for Medicaid or state-funded treatment. Your state behavioral health agency can help: '),
        h('a', { href: '#/states' }, t('match.plan.states', 'state resources'))),
      h('li', null, t('match.plan.script', 'Want help with what to say? '), h('a', { href: '#/plan' }, t('match.plan.scriptLink', 'Use the intake call script and first-visit guide'))),
      h('li', null, t('match.plan.wait', 'While you wait: keep naloxone on hand, and call the SAMHSA helpline (1-800-662-4357) or 988 any time.')),
    ),
    fine(t('match.plan.note', 'This plan is not saved anywhere. Print it or use Save on the programs you want to keep.')),
  );
}

// ---------------------------------------------------------------- View
export function matchView({ query } = {}) {
  const start = query?.get('start');
  if (start === 'virtual') { profile.modality = 'virtual'; }
  if (start === 'affordable') { profile.needsFinancialHelp = true; }
  root = h('div', { class: 'match-root' });
  rerender();
  return h('div', { class: 'view view-match' },
    pageHeader(t('match.title', 'Find care that fits'),
      t('match.lede', 'A few quick questions, all skippable, then options ranked for your needs, coverage, and location, with an explanation for each.')),
    root,
  );
}

