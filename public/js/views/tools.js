import { h, clear } from '../dom.js';
import { t } from '../i18n.js';
import { pageHeader, emergencyCallout } from './common.js';
import { sourceContext } from '../components/sourceContext.js';

// This catalog contains only public links and copy. Search and audience choices
// stay in memory: never send them to the API, history, or device storage.
const entries = [
  ['match', 'care', 'Find care that fits', 'Compare treatment options, payment information, distance, and questions to ask before an appointment.', ['individual', 'supporter', 'care-team']],
  ['guided', 'care', 'Help me choose a starting point', 'Follow short, skippable questions to find relevant resources. Your answers stay on this device.', ['individual', 'supporter']],
  ['workspace', 'planning', 'Care team workspace', 'Prepare a visit, verify a referral, and organize follow-up with an anonymous handoff checklist.', ['care-team']],
  ['overdose', 'emergency', 'Overdose response', 'Open emergency steps and the optional response timer. Call 911 for a suspected overdose.', ['individual', 'supporter', 'care-team']],
  ['crisis', 'emergency', 'Talk to someone now', 'Find crisis support, confidential helplines, and someone to talk with about next steps.', ['individual', 'supporter', 'care-team']],
  ['harm-reduction', 'planning', 'Stay safer', 'Find naloxone, test-strip instructions, safer-use information, and support without a requirement to quit.', ['individual', 'supporter', 'care-team']],
  ['navigator', 'care', 'Clinical care navigator', 'Explore care needs across withdrawal, physical health, mental health, and daily living. A guide for discussion, not a diagnosis.', ['individual', 'care-team']],
  ['assessment', 'care', 'Withdrawal assessment tools', 'Review structured withdrawal screening tools with a trained healthcare professional.', ['care-team']],
  ['medications', 'care', 'Medications and interactions', 'Explore treatment medications and interaction information to discuss with a pharmacist or prescriber.', ['individual', 'supporter', 'care-team']],
  ['health', 'care', 'Low-cost and community health care', 'Search health centers, mental health care, VA, IHS, rural clinics, and emergency hospitals.', ['individual', 'supporter', 'care-team']],
  ['plan', 'planning', 'Safety plan and first appointment', 'Prepare questions, explore what an intake visit is like, and create a private printable plan.', ['individual', 'supporter', 'care-team']],
  ['support', 'planning', 'Recovery and family support', 'Explore peer groups, recovery housing, and ways to support someone without pressure or judgment.', ['individual', 'supporter', 'care-team']],
  ['choosing-care', 'planning', 'Questions to ask a treatment program', 'Check treatment quality, ask about costs and medications, and recognize referral red flags.', ['individual', 'supporter', 'care-team']],
  ['post-overdose', 'planning', 'Care after an overdose', 'Explore follow-up support, treatment connections, and planning after an overdose.', ['individual', 'supporter', 'care-team']],
  ['readiness', 'planning', 'Explore readiness for change', 'Think through your goals and next steps at your own pace.', ['individual', 'supporter', 'care-team']],
  ['states', 'care', 'State and territory resources', 'Find behavioral health agencies, Medicaid links, and local support by jurisdiction.', ['individual', 'supporter', 'care-team']],
  ['perinatal', 'populations', 'Pregnancy and postpartum support', 'Explore pregnancy, postpartum, treatment, and family support resources.', ['individual', 'supporter', 'care-team']],
  ['adolescent', 'populations', 'Youth and family care', 'Find youth-focused care information, consent considerations, and family support.', ['individual', 'supporter', 'care-team']],
  ['veterans', 'populations', 'Veterans and military families', 'Explore VA care, military health coverage, and veteran-specific support.', ['individual', 'supporter', 'care-team']],
  ['reentry', 'populations', 'Support after incarceration', 'Plan treatment connections, safer transitions, and practical support after release.', ['individual', 'supporter', 'care-team']],
  ['older-adults', 'populations', 'Older adults and Medicare', 'Explore medication, coverage, and care considerations for older adults.', ['individual', 'supporter', 'care-team']],
  ['tribal-health', 'populations', 'Indigenous and tribal health', 'Explore IHS, tribal, and urban Indian health resources.', ['individual', 'supporter', 'care-team']],
  ['lgbtq-care', 'populations', 'LGBTQ+ care', 'Explore affirming care, medication considerations, and support resources.', ['individual', 'supporter', 'care-team']],
  ['wound-care', 'care', 'Wound care and infection warning signs', 'Review wound-care information, when to seek urgent help, and infection testing resources.', ['individual', 'supporter', 'care-team']],
  ['rural-health', 'populations', 'Rural and frontier care', 'Explore transportation, remote care, and low-cost options farther from a city.', ['individual', 'supporter', 'care-team']],
  ['disability-care', 'populations', 'Accessible and disability-informed care', 'Explore communication supports, sensory needs, and accessible care options.', ['individual', 'supporter', 'care-team']],
  ['street-medicine', 'populations', 'Care without stable housing', 'Explore street medicine, shelter-related support, and low-barrier health care.', ['individual', 'supporter', 'care-team']],
  ['immigrant-health', 'populations', 'Immigrant health and language access', 'Explore language assistance, health-care access, and coverage information.', ['individual', 'supporter', 'care-team']],
  ['stimulant-care', 'care', 'Stimulant care and support', 'Explore stimulant-related risks, support options, and treatment information.', ['individual', 'supporter', 'care-team']],
  ['workplace-rights', 'populations', 'Work and professional support', 'Explore workplace accommodation, leave, and professional support considerations.', ['individual', 'supporter', 'care-team']],
  ['chronic-pain', 'care', 'Chronic pain and sedative tapering', 'Review CDC 2022 pain guidance, buprenorphine analgesia split-dosing, and safe Ashton benzodiazepine tapering.', ['individual', 'supporter', 'care-team']],
  ['alcohol-care', 'care', 'Alcohol care and medical withdrawal', 'Evaluate alcohol withdrawal risk (PAWSS), Wernicke-Korsakoff prevention, and FDA-approved medications (MAUD).', ['individual', 'supporter', 'care-team']],
  ['family-support', 'planning', 'Family support and CRAFT guide', 'Use Community Reinforcement and Family Training (CRAFT) to improve communication, set boundaries, and support a loved one.', ['supporter', 'care-team']],
  ['adulterant-care', 'care', 'Emerging adulterants, xylazine and tranq wound care', 'Evidence-based guidance for xylazine (tranq), nitazenes, alpha-2 sedation triage, necrotic wound management, and test strip standards.', ['individual', 'supporter', 'care-team']],
  ['methadone-access', 'care', 'Methadone clinic access and 2024 Part 8 rules', 'Explore 2024 SAMHSA Part 8 rules, calculate take-home bottle eligibility, prevent dangerous rapid tapers, and advocate for patient rights.', ['individual', 'supporter', 'care-team']],
  ['dual-diagnosis', 'care', 'Dual diagnosis and integrated mental health', 'Explore integrated dual disorder treatment (IDDT), psychotropic and MOUD compatibility, false-positive toxicology rights, and crisis safety planning.', ['individual', 'supporter', 'care-team']],
  ['polysubstance-care', 'harm', 'Polysubstance overdose synergy and interactions', 'Evaluate multi-substance interactions, depressant respiratory arrest risks, naloxone limits, airway rescue breathing, and serotonin toxicity.', ['individual', 'supporter', 'care-team']],
  ['nightlife-care', 'harm', 'Nightlife, club drugs and festival harm reduction', 'Evidence-based harm reduction for MDMA, ketamine, GHB/GBL, nitrous oxide, reagent testing, hyponatremia prevention, and bladder health.', ['individual', 'supporter', 'care-team']],
  ['sleep-care', 'health', 'Sleep restoration and insomnia in recovery', 'Evidence-based sleep restoration, CBT-I protocols, non-controlled sleep pharmacotherapy, and post-acute withdrawal sleep architecture.', ['individual', 'supporter', 'care-team']],
  ['dental-care', 'health', 'Dental, oral health and endocarditis prevention', 'FDA 2022 buprenorphine oral safety protocol, meth mouth harm reduction, endocarditis bacteremia prevention, and low-cost dental clinic navigation.', ['individual', 'supporter', 'care-team']],
  ['cannabis-care', 'health', 'Cannabinoid hyperemesis (CHS) and concentrates care', 'Rome IV diagnostic criteria, cyclic vomiting triage, topical capsaicin protocols, why Zofran fails, and 90-day CB1 receptor recovery.', ['individual', 'supporter', 'care-team']],
  ['viral-hepatitis', 'health', 'Hepatitis C cure, DAA regimens, FIB-4 & HIV PrEP/PEP', 'AASLD/IDSA 8-to-12-week DAA cure protocols, non-invasive FIB-4 scoring, HBV screening, HIV 72-hour PEP, and patient rights without sobriety barriers.', ['individual', 'supporter', 'care-team']],
  ['nicotine-care', 'health', 'Tobacco, nicotine, vaping and smoking cessation', 'Fagerström dependence scoring, combination NRT dosing protocols, varenicline guidance, vape salt down-titration, and craving defusal.', ['individual', 'supporter', 'care-team']],
  ['benzodiazepine-care', 'care', 'Benzodiazepines, Ashton tapering and BIND care', 'Diazepam equivalence calculator, Ashton Manual crossover schedules, flumazenil toxicity alerts, protracted withdrawal (BIND) validation, and seizure safety.', ['individual', 'supporter', 'care-team']],
  ['adhd-care', 'care', 'ADHD, neurodiversity and stimulant harm reduction', 'ASRS v1.1 clinical screener, non-stimulant pharmacotherapy in SUD recovery, counterfeit pill FTS dilution, and executive function tools.', ['individual', 'supporter', 'care-team']],
  ['toxicology-triage', 'emergency', 'Acute toxicology triage & Project BETA crisis de-escalation', 'Multi-toxidrome differential engine across 5 conditions, Project BETA 10-domain verbal de-escalation, RASS scoring, restraint-avoidance pharmacotherapy, and SBAR clinical handoffs.', ['individual', 'supporter', 'care-team']],
  ['hospital-care', 'care', 'Hospital addiction care, pain on MOUD & patient rights', 'CA Bridge high-dose ED buprenorphine induction, acute surgical pain on MOUD, precipitated withdrawal rescue, and patient-directed discharge (AMA) harm reduction.', ['individual', 'supporter', 'care-team']],
  ['needle-exposure', 'harm-reduction', 'Needle stick, sharps injury & bloodborne pathogen PEP protocol', 'CDC/USPHS 72-hour golden window PEP regimens (Biktarvy/Truvada), HBV titer algorithms, OSHA 1910.1030 100% employer-paid care, and safe community sharps disposal.', ['individual', 'supporter', 'care-team']],
  ['sexual-health', 'harm-reduction', 'Sexual health, Doxy-PEP, HIV PrEP & emergency contraception', 'CDC 2024 Doxy-PEP bacterial STI protocol (doxycycline 200 mg < 72h), HIV PrEP options (Truvada/Descovy/Apretude), seamless PEP-to-PrEP transition, and emergency contraception weight thresholds.', ['individual', 'supporter', 'care-team']],
  ['novel-substances', 'emergency', 'Novel substances, kratom, tianeptine & OTC misuse', 'ACMT/ASAM/FDA clinical decision support for tianeptine cardiotoxicity (ZaZa), kratom alkaloids (7-OH), phenibut GABA-B withdrawal baclofen tapers, and urine drug screen immunoassay blindspots.', ['individual', 'supporter', 'care-team']],
];

export const TOOL_CATALOG = Object.freeze(entries.map(([id, category, title, description, audiences]) => Object.freeze({
  id, path: `#/${id}`, category, titleKey: `tools.item.${id}.title`, title,
  descriptionKey: `tools.item.${id}.description`, description, audiences: Object.freeze(audiences),
})));

const initialState = () => ({ query: '', audience: 'all', category: 'all' });
let filters = initialState();
const resetListeners = new Set();
export const getCareToolsState = () => ({ ...filters });
export function resetCareToolsState() {
  filters = initialState();
  for (const reset of resetListeners) reset();
}

const normalize = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function filterCareTools({ query = '', audience = 'all', category = 'all' } = {}) {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return TOOL_CATALOG.filter((tool) => {
    if (audience !== 'all' && !tool.audiences.includes(audience)) return false;
    if (category !== 'all' && tool.category !== category) return false;
    const searchable = normalize([tool.title, tool.description, t(tool.titleKey, tool.title), t(tool.descriptionKey, tool.description)].join(' '));
    return words.every((word) => searchable.includes(word));
  });
}

export function careToolsView({ meta } = {}) {
  // Only the most recently rendered directory needs a reset callback.
  resetListeners.clear();
  const search = h('input', { id: 'care-tools-search', type: 'search', value: filters.query,
    autocomplete: 'off', spellcheck: 'false', 'aria-describedby': 'care-tools-privacy' });
  const audience = h('select', { id: 'care-tools-audience' },
    h('option', { value: 'all' }, t('tools.audience.all', 'Everyone')),
    h('option', { value: 'individual' }, t('tools.audience.individual', 'For me')),
    h('option', { value: 'supporter' }, t('tools.audience.supporter', 'Supporting someone')),
    h('option', { value: 'care-team' }, t('tools.audience.team', 'Healthcare and community workers')));
  const category = h('select', { id: 'care-tools-category' },
    h('option', { value: 'all' }, t('tools.category.all', 'All topics')),
    h('option', { value: 'emergency' }, t('tools.category.emergency', 'Urgent support')),
    h('option', { value: 'care' }, t('tools.category.care', 'Find and understand care')),
    h('option', { value: 'planning' }, t('tools.category.planning', 'Planning and support')),
    h('option', { value: 'populations' }, t('tools.category.populations', 'Care for your circumstances')));
  audience.value = filters.audience;
  category.value = filters.category;
  const count = h('p', { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true', class: 'tools-count' });
  const list = h('div', { class: 'tools-grid', id: 'care-tools-results' });
  function show() {
    const tools = filterCareTools(filters);
    count.textContent = t('tools.count', '{n} tools and guides', { n: tools.length });
    clear(list);
    if (!tools.length) {
      list.append(h('p', { class: 'card' }, t('tools.empty', 'No tools match these filters. Try a broader word or clear the filters.')));
      return;
    }
    for (const tool of tools) list.append(h('article', { class: 'card tool-card' },
      h('h2', null, h('a', { href: tool.path }, t(tool.titleKey, tool.title))),
      h('p', null, t(tool.descriptionKey, tool.description))));
  }
  const update = () => {
    filters = { query: search.value.slice(0, 200), audience: audience.value, category: category.value };
    show();
  };
  search.maxLength = 200;
  search.addEventListener('input', update);
  audience.addEventListener('change', update);
  category.addEventListener('change', update);
  const reset = () => {
    search.value = ''; audience.value = 'all'; category.value = 'all'; show();
  };
  resetListeners.add(reset);
  show();
  return h('div', { class: 'view care-tools' },
    pageHeader(t('tools.title', 'Find the right tool for your next step'),
      t('tools.lede', 'Practical guides for your own care, supporting someone, or working with patients. Choose what is useful and skip the rest.')),
    emergencyCallout(),
    h('section', { class: 'card tools-filters no-print', 'aria-label': t('tools.filters', 'Filter care tools') },
      h('div', { class: 'field' }, h('label', { for: 'care-tools-search' }, t('tools.search', 'Search tools and guides')), search),
      h('div', { class: 'field' }, h('label', { for: 'care-tools-audience' }, t('tools.audience', 'Who are you helping?')), audience),
      h('div', { class: 'field' }, h('label', { for: 'care-tools-category' }, t('tools.category', 'What would help?')), category),
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { resetCareToolsState(); search.focus(); } }, t('tools.clear', 'Clear filters')),
      h('p', { id: 'care-tools-privacy', class: 'small muted' }, t('tools.privacy', 'Search stays in this browser. It is not sent, saved, or added to the address bar. Quick exit clears it.'))),
    count, list, sourceContext({ meta }));
}
