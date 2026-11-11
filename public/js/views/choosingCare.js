// Choosing Quality Care View with Interactive Insurance Parity (MHPAEA),
// EKRA (18 U.S.C. § 220) Anti-Patient-Brokering & Verification Script Engine.

import { h, ext, icon } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader, section, p, fine, ul, strong, resourceList, tocNav } from './common.js';
import { INSURANCE_TIERS } from './insuranceHelpers.js';
import { insuranceSelectorWidget } from './insuranceWidget.js';
import { rightsAndSafetyGuide } from './rightsAndSafetyPlan.js';

export const QUESTIONS = [
  'Is the program licensed by the state, and is it accredited (for example, by CARF or The Joint Commission)?',
  'Do you offer, or allow, medications like buprenorphine, methadone, or naltrexone? Can I keep taking medication I already use?',
  'Do you treat mental health conditions at the same time?',
  'What does treatment involve each day, and what therapies do you use?',
  'Who is on staff? Is there a doctor or nurse practitioner who specializes in addiction?',
  'How is my treatment plan made, and how often is it updated?',
  'What will it cost? Do you take my insurance or Medicaid, or offer a sliding scale?',
  'Can my family be involved if I want them to be?',
  'What happens if I return to use during treatment?',
  'What support do you offer after I leave?',
];

export const RED_FLAGS = [
  'Offers free travel, free rent, gift cards, or cash to enter a program, or says your insurance pays for “everything”.',
  'Pressures you to commit or travel today, or will not tell you the facility’s name and address before you agree.',
  'A “helpline” that won’t say who it works for, or routes every caller to the same few facilities.',
  'Promises guaranteed results or a “cure”.',
  'Discourages or refuses FDA-approved medications for opioid or alcohol use disorder.',
  'Asks mostly about your insurance and very little about your health.',
];

export function choosingCareView() {
  const insuranceWidget = insuranceSelectorWidget({ defaultOpenScript: true });
  const tierItems = [
    {
      tier: INSURANCE_TIERS.EMTALA_PROTECTED,
      desc: getLang() === 'es'
        ? 'Las salas de emergencia hospitalarias participantes deben evaluar y estabilizar las emergencias según EMTALA. No garantiza atención gratis ni una dosis de metadona; la regla de 72 horas es una autorización clínica separada, no un derecho a recibir medicación.'
        : 'Participating hospital emergency departments must screen and stabilize emergencies under EMTALA. This does not guarantee free care or a methadone dose; the 72-hour rule is a separate clinical permission, not a right to receive medication.',
    },
    {
      tier: INSURANCE_TIERS.CONFIRMED_MATCH,
      desc: t(
        'choosing.tier.confirmedDesc',
        'Facilities reporting acceptance of your selected public coverage (Medicaid, Medicare, TRICARE/VA, IHS/Tribal) or safety-net sliding scale.',
      ),
    },
    {
      tier: INSURANCE_TIERS.VERIFY_NETWORK,
      desc: t(
        'choosing.tier.verifyDesc',
        'Facilities listing Private Insurance (code PI). Always confirm in-network contract status using the facility’s NPI and assert your MHPAEA parity rights.',
      ),
    },
    {
      tier: INSURANCE_TIERS.SAFETY_NET_FALLBACK,
      desc: t(
        'choosing.tier.fallbackDesc',
        'Facilities that do not list your primary plan but offer an income-based sliding fee scale (SS), payment assistance (PA), free care (NP), or HRSA Health Center care.',
      ),
    },
    {
      tier: INSURANCE_TIERS.UNVERIFIED_OR_MISMATCH,
      desc: t(
        'choosing.tier.unverifiedDesc',
        'Coverage is not listed in the directory—call admissions directly to confirm current plans and rates.',
      ),
    },
  ];

  const root = h('div', { class: 'view view-prose' },
    pageHeader(
      t('choosing.title', 'Choosing quality care'),
      t('choosing.lede', 'Good treatment is personal, evidence-based, and honest about cost. Here is how to tell the difference.'),
    ),
    tocNav([
      ['quality', t('choosing.toc.quality', 'Signs of quality')],
      ['questions', t('choosing.toc.questions', 'Questions to ask')],
      ['parity-ekra', t('choosing.toc.parityEkra', 'Insurance parity & EKRA')],
      ['red-flags', t('choosing.toc.redFlags', 'Red flags')],
      ['verify', t('choosing.toc.verify', 'Verify a program')],
    ]),

    section('quality', t('choosing.sec.quality', 'Signs of quality treatment'),
      ul([
        [strong(t('choosing.qual.1.lead', 'Licensed and accredited. ')),
          t('choosing.qual.1.body', 'The program and its clinicians are licensed by the state. Accreditation from groups like CARF or The Joint Commission is a plus.')],
        [strong(t('choosing.qual.2.lead', 'Offers FDA-approved medications ')),
          t('choosing.qual.2.body', 'for opioid and alcohol use disorder, or works closely with someone who does. Compare options in our '),
          h('a', { href: '#/medications' }, t('choosing.qual.2.link', 'Pharmacist Medication & Interaction Hub')), '.'],
        [strong(t('choosing.qual.3.lead', 'Uses proven therapies, ')),
          t('choosing.qual.3.body', 'such as cognitive behavioral therapy (CBT), motivational interviewing, and contingency management. '),
          h('a', { href: '#/plan' }, t('choosing.qual.3.link', 'See how each counseling therapy works')), '.'],
        [strong(t('choosing.qual.4.lead', 'Treats the whole person, ')),
          t('choosing.qual.4.body', 'including mental health, physical health, and needs like housing and work. Not sure what level of care fits? Try the '),
          h('a', { href: '#/navigator' }, t('choosing.qual.4.link', 'ASAM Clinical Care Navigator')), '.'],
        [strong(t('choosing.qual.5.lead', 'Builds a plan with you, ')),
          t('choosing.qual.5.body', 'involves family if you want, and plans for support after you leave.')],
      ]),
      fine(t('choosing.qual.source', 'Adapted from '), ext('https://www.samhsa.gov/find-support/learn-about-treatment/finding-quality-treatment', 'SAMHSA: Finding quality treatment'), '.'),
    ),

    section('questions', t('choosing.sec.questions', 'Questions to ask when you call'),
      h('ol', { class: 'checklist' }, [
        t('choosing.q.1', QUESTIONS[0]),
        t('choosing.q.2', QUESTIONS[1]),
        t('choosing.q.3', QUESTIONS[2]),
        t('choosing.q.4', QUESTIONS[3]),
        t('choosing.q.5', QUESTIONS[4]),
        t('choosing.q.6', QUESTIONS[5]),
        t('choosing.q.7', QUESTIONS[6]),
        t('choosing.q.8', QUESTIONS[7]),
        t('choosing.q.9', QUESTIONS[8]),
        t('choosing.q.10', QUESTIONS[9]),
      ].map((q) => h('li', null, q))),
      p(
        h('button', {
          type: 'button',
          class: 'btn btn-secondary',
          'aria-label': t('choosing.printQuestionsAria', 'Print these questions to ask a treatment program'),
          onclick: () => window.print(),
        }, icon('printer'), t('choosing.printQuestions', 'Print these questions')),
        ' ',
        h('a', { class: 'btn btn-primary', href: '#/plan' }, t('choosing.buildScript', 'Build a custom clinic call script')),
      ),
    ),

    section('parity-ekra', t('choosing.sec.parityEkra', 'Insurance Parity (MHPAEA), EKRA (18 U.S.C. § 220) Anti-Patient-Brokering & Verification Script'),
      p(
        t(
          'choosing.parity.intro',
          'Federal law protects both your insurance coverage for substance use treatment and your safety from predatory referral brokers. Select your coverage type below to customize a printable verification checklist in your browser’s memory:',
        ),
      ),
      insuranceWidget,
      h('div', { class: 'card' },
        h('h3', null, t('choosing.tiers.heading', 'How HarborPath classifies coverage & safety-net compatibility')),
        h('dl', { class: 'glossary' },
          tierItems.flatMap((item) => [
            h('dt', null,
              h('span', { class: `chip chip-${item.tier.tone}` }, item.tier.label),
            ),
            h('dd', null, item.desc),
          ]),
        ),
      ),
    ),

    section('red-flags', t('choosing.sec.redFlags', 'Red flags: scams and patient brokering'),
      p(
        t(
          'choosing.redFlags.intro',
          'Some businesses earn money by steering people into programs, and the care that follows can be poor or unsafe. Paying kickbacks for referrals to recovery homes, treatment facilities, or labs is a federal crime (EKRA, 18 U.S.C. § 220).',
        ),
      ),
      h('ul', { class: 'flag-list' }, [
        t('choosing.flag.1', RED_FLAGS[0]),
        t('choosing.flag.2', RED_FLAGS[1]),
        t('choosing.flag.3', RED_FLAGS[2]),
        t('choosing.flag.4', RED_FLAGS[3]),
        t('choosing.flag.5', RED_FLAGS[4]),
        t('choosing.flag.6', RED_FLAGS[5]),
      ].map((f) => h('li', null, icon('alert'), f))),
      p(
        t('choosing.reportFraud', 'Think you’ve seen fraud? Report it to the '),
        ext('https://oig.hhs.gov/fraud/report-fraud/', 'HHS Office of Inspector General'),
        t('choosing.reportFraudOr', ' or your state attorney general.'),
      ),
    ),

    section('verify', t('choosing.sec.verify', 'Verify a program'),
      resourceList([
        {
          name: 'FindTreatment.gov',
          href: 'https://findtreatment.gov/',
          desc: t('choosing.verify.ft', 'Every listing in HarborPath’s treatment search comes from this federal directory of state-licensed facilities. Open “All listed services” on a listing to see its licenses and accreditations.'),
        },
        {
          name: 'CARF provider search',
          href: 'https://carf.org/find-provider/',
          desc: t('choosing.verify.carf', 'Check whether a program is CARF-accredited.'),
        },
        {
          name: 'LegitScript certification',
          href: 'https://www.legitscript.com/certification/addiction-treatment-certification/',
          desc: t('choosing.verify.legitscript', 'Certification for treatment providers that advertise online.'),
        },
        {
          name: 'Shatterproof Treatment Atlas',
          href: 'https://treatmentatlas.org/',
          desc: t('choosing.verify.atlas', 'Compare facilities on quality measures and patient reviews.'),
        },
      ]),
    ),
    rightsAndSafetyGuide(),
  );
  root._cleanup = () => insuranceWidget._cleanupInsuranceWidget();
  return root;
}
