// Accessible in-RAM Insurance & Safety-Net Selector Widget and Facility Tier Badge.
// Uses only ../dom.js builders for safe DOM construction.

import { h, clear, ext, icon, announce } from '../dom.js';
import { state, subscribe } from '../state.js';
import { t, getLang } from '../i18n.js';
import { printClinicalHandout } from '../components/printHandout.js';
import {
  COVERAGE_OPTIONS,
  evaluateFacilityCoverage,
  buildVerificationScript,
  getCoverageOption,
  getInsuranceState,
  setInsuranceState,
  subscribeInsuranceState,
  resetInsuranceState,
} from './insuranceHelpers.js';

const TIER_ICONS = {
  EMTALA_PROTECTED: 'alert',
  CONFIRMED_MATCH: 'check-circle',
  VERIFY_NETWORK: 'shield',
  SAFETY_NET_FALLBACK: 'heart',
  UNVERIFIED_OR_MISMATCH: 'info',
};

const TIER_BADGE_CLASSES = {
  EMTALA_PROTECTED: 'chip chip-extra tier tier-warn badge-matched coverage-tier-badge',
  CONFIRMED_MATCH: 'chip chip-pay tier tier-ok badge-matched coverage-tier-badge',
  VERIFY_NETWORK: 'chip chip-care tier tier-warn coverage-tier-badge',
  SAFETY_NET_FALLBACK: 'chip chip-extra tier tier-ok coverage-tier-badge',
  UNVERIFIED_OR_MISMATCH: 'chip chip-neutral tier tier-muted badge-unmatched coverage-tier-badge',
};

/**
 * Renders a high-contrast coverage compatibility tier badge for a facility card.
 */
export function coverageTierBadge(facility, options = {}) {
  const currentState = getInsuranceState();
  const coverageSelection = options.coverageSelection ?? currentState.selectedCoverage ?? 'any';
  const emergency = options.emergency ?? currentState.emergencyFlag ?? false;

  const match = (
    facility?.coverageMatch
    && facility.coverageMatch.coverageSelection === coverageSelection
    && Boolean(facility.coverageMatch.emergency) === Boolean(emergency)
  )
    ? facility.coverageMatch
    : evaluateFacilityCoverage(facility, coverageSelection, { emergency });

  const iconName = TIER_ICONS[match.id] ?? 'info';
  const cls = TIER_BADGE_CLASSES[match.id] ?? TIER_BADGE_CLASSES.UNVERIFIED_OR_MISMATCH;

  const badge = h('span', {
    class: cls,
    dataset: { tier: match.id, rank: String(match.rank) },
    'aria-label': `${match.label}: ${match.explanation}`,
  },
    icon(iconName),
    h('span', { class: 'coverage-tier-label' }, match.label),
  );

  if (options.showExplanation) {
    return h('div', {
      class: 'near-match-banner coverage-tier-callout',
      role: 'region',
      'aria-label': match.label,
    },
      h('p', { class: 'near-match-count' }, badge),
      h('p', { class: 'fine' }, match.explanation),
    );
  }

  return badge;
}

// These template adapters return safe DOM nodes, preserving the app's text-only
// DOM construction rather than parsing markup under the strict CSP.
export function renderFacilityInsuranceBadgeHTML(facility, options = {}) {
  return coverageTierBadge(facility, options);
}

export function renderInsuranceSelectorHTML(options = {}) {
  return insuranceSelectorWidget(options);
}

export function facilityAdmissionsQuestions(facility) {
  // Parity: https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/publications/understanding-your-mental-health-and-substance-use-disorder-benefits
  // EKRA: https://www.justice.gov/webform/usao-cdca/sober-homes-victim-identification
  const script = buildVerificationScript(getInsuranceState().selectedCoverage, facility);
  return h('details', { class: 'facility-details admissions-questions' },
    h('summary', null, t('ins.card.questions', 'Questions to Ask Admissions')),
    h('ol', { class: 'checklist' }, script.admissionsQuestions.map((q) => h('li', null, q))),
    h('h4', null, t('ins.widget.headingParity', 'Your federal MHPAEA insurance parity rights')),
    h('ul', { class: 'list' }, script.parityRights.map((q) => h('li', null, q))),
    h('h4', null, t('ins.widget.headingEkra', 'Anti-patient-brokering red flags (EKRA, 18 U.S.C. § 220)')),
    h('ul', { class: 'flag-list' }, script.ekraRedFlags.map((q) => h('li', null, q))),
  );
}

/**
 * Interactive in-RAM coverage selector widget with:
 * - Coverage pill bar (role="group")
 * - Emergency withdrawal toggle (EMTALA 42 U.S.C. § 1395dd & DEA 72-Hour Rule 21 CFR § 1306.07(b))
 * - Expandable MHPAEA Parity & EKRA (18 U.S.C. § 220) Verification Script drawer with Print & Copy
 * - State Medicaid & behavioral health directory link (#/states or #/state/{code})
 */
export function insuranceSelectorWidget({ onChange, defaultOpenScript = false } = {}) {
  if (state.location?.state && !getInsuranceState().stateCode) {
    setInsuranceState({ stateCode: state.location.state });
  }

  const pillBar = h('div', {
    class: 'presets coverage-pill-bar',
    role: 'group',
    'aria-label': t('ins.widget.groupLabel', 'Select insurance or safety-net coverage (kept in browser memory)'),
  });

  const emergencyBox = h('input', {
    type: 'checkbox',
    id: 'ins-emergency-toggle',
    checked: getInsuranceState().emergencyFlag,
    'aria-label': t(
      'ins.widget.emergencyAria',
      'Acute withdrawal or medical emergency: highlight EMTALA and DEA 72-Hour Rule protections',
    ),
  });

  const emergencyBanner = h('div', {
    class: 'callout callout-warn',
    role: 'status',
    hidden: !getInsuranceState().emergencyFlag,
  });

  const guidanceBox = h('div', {
    class: 'near-match-banner',
    role: 'status',
    'aria-live': 'polite',
  });

  const stateLinkWrap = h('p', { class: 'fine' });
  const scriptContent = h('div', { class: 'intake-script-output' });

  const scriptDetails = h('details', {
    class: 'filters verification-drawer',
    open: Boolean(defaultOpenScript),
    'aria-label': t(
      'ins.widget.drawerRegion',
      'MHPAEA Insurance Parity & EKRA Anti-Brokering Verification Script',
    ),
  },
    h('summary', {
      'aria-label': t(
        'ins.widget.drawerSummaryAria',
        'Open MHPAEA Insurance Parity & EKRA Anti-Brokering Verification Script and Checklist',
      ),
    },
      icon('shield'),
      t('ins.widget.drawerSummary', 'MHPAEA Parity & EKRA Anti-Brokering Verification Script'),
    ),
    h('div', { class: 'filters-inner' }, scriptContent),
  );

  function renderPills(current) {
    clear(pillBar);
    for (const opt of COVERAGE_OPTIONS) {
      const isSelected = current.selectedCoverage === opt.id;
      const btn = h('button', {
        type: 'button',
        class: 'preset',
        dataset: { coverage: opt.id },
        'aria-pressed': String(isSelected),
        'aria-label': `${opt.label}${opt.codes.length ? ` (${opt.codes.join(', ')})` : ''}`,
        onclick: () => {
          const updated = setInsuranceState({ selectedCoverage: opt.id });
          announce(
            t('ins.widget.announcedCoverage', 'Coverage filter set to {label}', { label: opt.label }),
          );
          if (typeof onChange === 'function') onChange(updated);
        },
      }, opt.label);
      pillBar.append(btn);
    }
  }

  function renderEmergencyBanner(current) {
    emergencyBox.checked = current.emergencyFlag;
    emergencyBanner.hidden = !current.emergencyFlag;
    clear(emergencyBanner);
    if (current.emergencyFlag) {
      emergencyBanner.append(
        h('p', { class: 'callout-title' },
          icon('alert'),
          t('ins.widget.emtalaTitle', 'Emergency Screening (EMTALA) & DEA 72-Hour Opioid Withdrawal Rule'),
        ),
        h('p', null,
          h('strong', null, t('ins.widget.emtalaLead', 'EMTALA (42 U.S.C. § 1395dd): ')),
          t(
            'ins.widget.emtalaBody',
            'Medicare-participating hospital emergency departments must provide a medical screening exam and stabilizing treatment for emergency medical conditions—including severe alcohol or benzodiazepine withdrawal, overdose, or severe infection—regardless of your insurance status or ability to pay.',
          ),
        ),
        h('p', null,
          h('strong', null, t('ins.widget.deaLead', 'DEA 72-Hour Rule (21 CFR § 1306.07(b)): ')),
          getLang() === 'es'
            ? 'Profesionales elegibles fuera de un OTP pueden dispensar, no recetar, hasta tres días de medicamentos narcóticos mientras coordinan una derivación. No se puede renovar ni extender. Se aplican las leyes estatales y locales, la evaluación clínica y la disponibilidad; no es una garantía de recibir medicación.'
            : 'Eligible non-OTP practitioners may dispense, not prescribe, up to a three-day supply of narcotic medication while arranging referral. It cannot be renewed or extended. State and local laws, clinical assessment and availability apply; this is not a guarantee of medication.',
        ),
      );
    }
  }

  function renderGuidance(current) {
    clear(guidanceBox);
    const opt = getCoverageOption(current.selectedCoverage);
    const hasActiveFilter = current.selectedCoverage !== 'any' || current.emergencyFlag;

    guidanceBox.append(
      h('p', { class: 'near-match-count' },
        icon('check-circle'),
        ' ',
        t('ins.widget.activeLabel', 'Active coverage lens: {label}', { label: opt.label }),
        current.emergencyFlag
          ? ` · ${t('ins.widget.emergencyActiveBadge', 'Emergency / Acute Withdrawal Priority (EMTALA & DEA 72-Hour Rule)')}`
          : '',
      ),
      h('p', { class: 'fine' }, opt.summary),
      hasActiveFilter && h('p', { class: 'actions' },
        h('button', {
          type: 'button',
          class: 'btn btn-small btn-ghost',
          'aria-label': t('ins.widget.resetAria', 'Reset coverage and emergency filters in browser memory'),
          onclick: () => {
            const reset = resetInsuranceState();
            announce(t('ins.widget.resetAnnounce', 'Coverage selection reset to all coverage types'));
            if (typeof onChange === 'function') onChange(reset);
          },
        }, icon('x'), t('ins.widget.resetBtn', 'Reset coverage selection')),
      ),
    );
  }

  function renderStateLink(current) {
    clear(stateLinkWrap);
    const activeCode = current.stateCode || state.location?.state || null;
    const cleanCode = activeCode && /^[A-Za-z]{2}$/.test(activeCode) ? activeCode.toUpperCase() : null;

    if (cleanCode) {
      stateLinkWrap.append(
        icon('map'),
        ' ',
        t('ins.widget.stateKnownPrompt', 'Need your state’s Medicaid behavioral health office or state-funded treatment agency? '),
        h('a', {
          href: `#/state/${cleanCode}`,
          'aria-label': t('ins.widget.stateCodeLinkAria', 'Open state Medicaid and treatment resources for {code}', { code: cleanCode }),
        }, t('ins.widget.stateCodeLink', 'View {code} Medicaid & state agency directory', { code: cleanCode })),
        ' · ',
        h('a', {
          href: '#/states',
          'aria-label': t('ins.widget.allStatesAria', 'Browse all state and territory Medicaid directories'),
        }, t('ins.widget.allStatesLink', 'All states & territories')),
      );
    } else {
      stateLinkWrap.append(
        icon('map'),
        ' ',
        t('ins.widget.stateUnknownPrompt', 'Looking for state Medicaid behavioral health contacts or state-funded care? '),
        h('a', {
          href: '#/states',
          'aria-label': t('ins.widget.allStatesAria', 'Browse all state and territory Medicaid directories'),
        }, t('ins.widget.browseStatesLink', 'Browse state & territory Medicaid directories')),
      );
    }
    stateLinkWrap.append(' · ', h('a', { href: '/data/state-medicaid.json' },
      getLang() === 'es' ? 'Datos públicos de Medicaid por estado (JSON)' : 'Public state Medicaid directory data (JSON)'));
  }

  function renderVerificationDrawer(current) {
    clear(scriptContent);
    const script = buildVerificationScript(current.selectedCoverage);

    const copyBtn = h('button', {
      type: 'button',
      class: 'btn btn-small btn-secondary',
      'aria-label': t('ins.widget.copyScriptAria', 'Copy insurance and parity verification checklist to clipboard'),
      onclick: async (e) => {
        const btn = e.currentTarget;
        try {
          await navigator.clipboard.writeText(script.fullText);
          btn.replaceChildren(icon('check'), t('card.copied', 'Copied'));
          announce(t('ins.widget.copiedAnnounce', 'Insurance verification checklist copied to clipboard'));
          setTimeout(() => {
            btn.replaceChildren(icon('copy'), t('ins.widget.copyBtn', 'Copy verification checklist'));
          }, 2000);
        } catch {
          announce(t('common.copyUnavailable', 'Copy is not available in this browser'));
        }
      },
    }, icon('copy'), t('ins.widget.copyBtn', 'Copy verification checklist'));

    const printBtn = h('button', {
      type: 'button',
      class: 'btn btn-small btn-ghost',
      'aria-label': t('ins.widget.printScriptAria', 'Print insurance and parity verification checklist'),
      onclick: () => {
        printClinicalHandout(scriptContent);
      },
    }, icon('printer'), t('ins.widget.printBtn', 'Print checklist'));

    scriptContent.append(
      h('p', { class: 'fine' },
        t(
          'ins.widget.drawerIntro',
          'Directory payment codes are self-reported by facilities. Use these questions to confirm in-network billing, assert your federal MHPAEA parity rights, and spot illegal patient brokering (EKRA, 18 U.S.C. § 220).',
        ),
      ),
      h('h4', null, t('ins.widget.headingInsurer', 'Questions to ask your insurance plan (member services)')),
      h('ol', { class: 'checklist' },
        script.insurerQuestions.map((q) => h('li', null, q)),
      ),
      h('h4', null, t('ins.widget.headingAdmissions', 'Questions to ask the facility admissions & billing office')),
      h('ol', { class: 'checklist' },
        script.admissionsQuestions.map((q) => h('li', null, q)),
      ),
      h('h4', null, t('ins.widget.headingParity', 'Your federal MHPAEA insurance parity rights')),
      h('ul', { class: 'list' },
        script.parityRights.map((r) => h('li', null, r)),
      ),
      h('h4', null, t('ins.widget.headingEkra', 'Anti-patient-brokering red flags (EKRA, 18 U.S.C. § 220)')),
      h('ul', { class: 'flag-list' },
        script.ekraRedFlags.map((flag) => h('li', null, icon('alert'), flag)),
      ),
      h('p', { class: 'fine' },
        t('ins.widget.reportFraudPrompt', 'Suspect patient brokering or insurance fraud? Report it to the '),
        ext('https://oig.hhs.gov/fraud/report-fraud/', 'HHS Office of Inspector General'),
        '.',
      ),
      h('div', { class: 'actions' },
        copyBtn,
        printBtn,
        h('small', { class: 'help' }, t('privacy.clipboardNote', 'Copied text stays on your clipboard after Quick exit.')),
      ),
    );
  }

  function renderAll(current = getInsuranceState()) {
    renderPills(current);
    renderEmergencyBanner(current);
    renderGuidance(current);
    renderStateLink(current);
    renderVerificationDrawer(current);
  }

  emergencyBox.addEventListener('change', () => {
    const updated = setInsuranceState({ emergencyFlag: emergencyBox.checked });
    announce(
      updated.emergencyFlag
        ? t('ins.widget.emergencyOnAnnounce', 'Emergency withdrawal protections highlighted (EMTALA and DEA 72-Hour Rule)')
        : t('ins.widget.emergencyOffAnnounce', 'Emergency withdrawal highlight turned off'),
    );
    if (typeof onChange === 'function') onChange(updated);
  });

  const root = h('section', {
    class: 'card script-builder insurance-widget',
    role: 'region',
    'aria-label': t('ins.widget.regionLabel', 'Insurance & safety-net compatibility tool'),
  },
    h('div', { class: 'facility-head' },
      h('div', null,
        h('h2', { class: 'facility-name' },
          icon('shield'),
          ' ',
          t('ins.widget.title', 'Insurance, Medicaid & Safety-Net Compatibility'),
        ),
        h('p', { class: 'fine' },
          t(
            'ins.widget.privacyNote',
            'Kept in your browser’s memory and cleared on Quick exit. Your coverage choice is never added to the web address (URL).',
          ),
        ),
      ),
    ),
    pillBar,
    h('label', { class: 'check' },
      emergencyBox,
      h('span', null,
        t('ins.widget.emergencyLabel', 'Need urgent withdrawal relief or emergency stabilization right now?'),
        h('small', null,
          t(
            'ins.widget.emergencyHint',
            'Highlights EMTALA (42 U.S.C. § 1395dd) hospital screening rights and the DEA 72-Hour Rule (21 CFR § 1306.07(b)) for immediate buprenorphine or methadone administration.',
          ),
        ),
      ),
    ),
    emergencyBanner,
    guidanceBox,
    stateLinkWrap,
    scriptDetails,
  );

  const unsubIns = subscribeInsuranceState((next) => {
    if (!root.isConnected && root.parent) {
      unsubIns();
      return;
    }
    renderAll(next);
  });

  const unsubApp = subscribe((appState) => {
    const nextStateCode = appState.location?.state ?? null;
    if (nextStateCode !== getInsuranceState().stateCode) {
      setInsuranceState({ stateCode: nextStateCode });
    } else {
      renderStateLink(getInsuranceState());
    }
  });

  // Clean up subscriptions if needed
  root._cleanupInsuranceWidget = () => {
    unsubIns();
    unsubApp();
  };

  renderAll(getInsuranceState());
  return root;
}
