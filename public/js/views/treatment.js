// Treatment Directory View with Ephemeral in-RAM Insurance & Safety-Net Selector.

import { h, ext, tel } from '../dom.js';
import { TREATMENT_FILTERS } from '../codes.js';
import { treatmentFinder } from '../components/finder.js';
import { t } from '../i18n.js';
import { pageHeader, section, p, strong } from './common.js';
import { renderInsuranceSelectorHTML, renderFacilityInsuranceBadgeHTML, facilityAdmissionsQuestions } from './insuranceWidget.js';
import { getInsuranceState, rankFacilitiesByInsurance } from './insuranceHelpers.js';
import { treatmentCard } from '../components/facilityCard.js';
import { setNavigatorHandoffState } from './navigatorHandoff.js';

export const PRESETS = [
  { codes: [], get label() { return t('treatment.preset.any', 'Any treatment'); } },
  { codes: ['BU'], get label() { return t('treatment.preset.bu', 'Buprenorphine'); } },
  { codes: ['OTP'], get label() { return t('treatment.preset.otp', 'Methadone clinic (OTP)'); } },
  { codes: ['DT'], get label() { return t('treatment.preset.dt', 'Detox'); } },
  { codes: ['TELE'], get label() { return t('treatment.preset.tele', 'Telehealth'); } },
  { codes: ['PW'], get label() { return t('treatment.preset.pw', 'Pregnant or postpartum'); } },
  { codes: ['ADOL'], get label() { return t('treatment.preset.adol', 'Teens'); } },
  { codes: ['SS'], get label() { return t('treatment.preset.ss', 'Sliding fee scale'); } },
];

export function treatmentView({ query = new URLSearchParams(), handoff = null } = {}) {
  const rawCodes = query && typeof query.get === 'function' ? (query.get('codes') ?? '') : '';
  const initialCodes = handoff ? [...handoff.codes] : rawCodes.split(',').filter(Boolean);
  const current = initialCodes.slice().sort().join(',');
  const finder = treatmentFinder({
    kind: 'sa', filters: TREATMENT_FILTERS, initialCodes,
    noun: t('treatment.noun', 'treatment locations'),
    prioritizesCoverage: () => getInsuranceState().selectedCoverage !== 'any' || getInsuranceState().emergencyFlag,
    rankResults: (facilities) => {
      const insurance = getInsuranceState();
      return rankFacilitiesByInsurance(facilities, insurance.selectedCoverage, { emergency: insurance.emergencyFlag });
    },
    renderCard: (facility, options) => {
      const card = treatmentCard(facility, options);
      card.append(renderFacilityInsuranceBadgeHTML(facility, { showExplanation: true }), facilityAdmissionsQuestions(facility));
      return card;
    },
  });

  const selector = renderInsuranceSelectorHTML({ onChange: () => finder.refreshResults() });
  const root = h('div', { class: 'view' },
    pageHeader(
      t('treatment.title', 'Find treatment'),
      t('treatment.lede', {
        text: 'Search state-licensed substance use treatment near you, including medications for opioid and alcohol use disorder.',
        plain: 'Find licensed places near you that treat drug and alcohol use. Many offer medicine for opioid or alcohol use.',
      }),
    ),
    h('div', { class: 'callout callout-info' },
      p(
        strong(t('treatment.helper.lead', {
          text: 'Not sure which filters or level of care you need? ',
          plain: 'Not sure what kind of care you need? ',
        })),
        h('a', { href: '#/navigator' }, t('treatment.helper.navigator', 'Use the ASAM Clinical Care Navigator')),
        ' · ',
        h('a', { href: '#/medications' }, t('treatment.helper.medications', 'Compare medications & fentanyl micro-induction')),
        ' · ',
        h('a', { href: '#/plan' }, t('treatment.helper.plan', 'See what happens at your first intake visit')),
      ),
    ),
    selector,
    h('nav', { class: 'presets', 'aria-label': t('treatment.presets.label', 'Quick searches') },
      PRESETS.map((pr) => h('a', {
        href: '#/treatment',
        onclick: () => setNavigatorHandoffState({ codes: pr.codes }),
        class: 'preset',
        'aria-current': pr.codes.join(',') === current ? 'true' : null,
      }, pr.label))),
    finder,
    h('div', { class: 'callout callout-warn' },
      h('p', null,
        strong(t('treatment.warn.lead', {
          text: 'Stopping alcohol, benzodiazepines (like Xanax or Klonopin), or other sedatives suddenly can be life-threatening. ',
          plain: 'Stopping alcohol, benzos (like Xanax or Klonopin), or other sedatives all at once can be deadly. ',
        })),
        t('treatment.warn.body', {
          text: 'Withdrawal can cause seizures. Talk with a doctor or use the “Detox” filter to find medically supervised withdrawal care.',
          plain: 'Withdrawal can cause seizures. Talk with a doctor, or use the “Detox” filter to find a place where doctors help you stop safely.',
        }))),
    section('options', t('treatment.options.title', 'Understanding your options'),
      h('dl', { class: 'glossary' },
        h('dt', null, t('treatment.opt.moud.dt', 'Medications for opioid use disorder')),
        h('dd', null,
          t('treatment.opt.moud.dd', {
            text: 'Buprenorphine, methadone, and naltrexone are the most effective treatment for opioid use disorder and lower the risk of overdose death. You can take them for as long as they help. ',
            plain: 'Buprenorphine, methadone, and naltrexone work better than any other treatment for opioid addiction. They lower your risk of dying from an overdose. You can take them for as long as they help. ',
          }),
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
        h('dd', null, t('treatment.opt.otp.dd', {
          text: 'A federally certified clinic, and the only outpatient clinic setting that dispenses daily or take-home methadone for opioid use disorder. Most also offer buprenorphine and counseling.',
          plain: 'A clinic approved by the government. It is the only kind of clinic (where you don’t stay overnight) that can give you methadone each day or to take home. Most also offer buprenorphine and counseling.',
        })),
        h('dt', null, t('treatment.opt.detox.dt', 'Detox / withdrawal management')),
        h('dd', null, t('treatment.opt.detox.dd', {
          text: 'Medical support to get through withdrawal safely. It works best as a first step, followed immediately by ongoing medication or counseling treatment.',
          plain: 'Medical help to get through withdrawal safely. It works best as a first step. Start medicine or counseling right after.',
        })),
        h('dt', null, t('treatment.opt.op.dt', 'Outpatient and intensive outpatient')),
        h('dd', null, t('treatment.opt.op.dd', {
          text: 'Counseling and medical care while you live at home. Intensive outpatient (IOP) usually means 9 or more hours a week.',
          plain: 'Counseling and medical care while you live at home. Intensive outpatient (IOP) is usually 9 or more hours a week.',
        })),
        h('dt', null, t('treatment.opt.res.dt', 'Residential')),
        h('dd', null, t('treatment.opt.res.dd', {
          text: 'You live on site for a period of time. Always ask whether they offer and allow FDA-approved medications like buprenorphine and methadone.',
          plain: 'You live there for a while. Always ask if they give and allow approved medicines like buprenorphine and methadone.',
        })),
        h('dt', null, t('treatment.opt.tele.dt', 'Telehealth')),
        h('dd', null, t('treatment.opt.tele.dd', {
          text: 'Visits by video or phone. Buprenorphine can often be started and prescribed through telehealth without an in-person visit first.',
          plain: 'Visits by video or phone. You can often start buprenorphine this way, without going in person first.',
        })),
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
  root._cleanup = () => { finder._cleanupFinder(); selector._cleanupInsuranceWidget(); };
  return root;
}
