import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { pageHeader, section, p, fine, ul, strong, tocNav, emergencyCallout } from './common.js';
import { t } from '../i18n.js';

/**
 * Evidence-based behavioral health & SUD counseling modalities with SAMHSA directory codes.
 */
export const COUNSELING_MODALITIES = [
  {
    code: 'CBT',
    name: 'Cognitive Behavioral Therapy (CBT)',
    bestFor: 'Alcohol, opioids, stimulants, cannabis, and co-occurring anxiety or depression.',
    whatItLooksLike:
      'Working practically with your counselor to spot high-risk triggers, cravings, and automatic thought patterns (like “all-or-nothing” thinking after a slip), then rehearsing real-world coping and refusal skills.',
    samhsaCode: 'CBT',
  },
  {
    code: 'MI',
    name: 'Motivational Interviewing (MI)',
    bestFor: 'Exploring mixed feelings about change and setting goals on your own terms (abstinence, cutting back, or safer use).',
    whatItLooksLike:
      'Non-judgmental, collaborative conversations that respect your autonomy and readiness for change—never lecturing, scolding, or forcing a label on you.',
    samhsaCode: 'MI',
  },
  {
    code: 'CMI',
    name: 'Contingency Management (CMI)',
    bestFor: 'Stimulant use disorder (methamphetamine and cocaine)—the most effective evidence-based therapy for stimulants—and supporting medication or visit consistency.',
    whatItLooksLike:
      'Receiving tangible, immediate positive reinforcement (such as retail vouchers, gift cards, or prize draws) for meeting recovery or health goals like attending sessions or negative drug screens.',
    samhsaCode: 'CMI',
  },
  {
    code: 'TRC',
    name: 'Trauma-Informed Counseling (TRC) & Seeking Safety',
    bestFor: 'Healing trauma and PTSD alongside substance use without requiring painful detailed trauma retelling before you feel stable.',
    whatItLooksLike:
      'Present-focused coping models (such as Seeking Safety), grounding skills, and emotional regulation where physical and emotional safety come first and you always control what you share.',
    samhsaCode: 'TRC',
  },
  {
    code: 'FT',
    name: 'Community Reinforcement & Family Training (FT / CRAFT)',
    bestFor: 'Families, partners, and loved ones who want to support recovery positively and improve communication.',
    whatItLooksLike:
      'Teaching loved ones how to communicate constructively, reward healthy steps, set safe boundaries, and care for themselves without confrontational “interventions” or shame.',
    samhsaCode: 'FT',
  },
  {
    code: 'TWFA',
    name: '12-Step Facilitation (TWFA) & Secular/Peer Pathways (PEER)',
    bestFor: 'Building free, long-term community connection alongside or after formal treatment.',
    whatItLooksLike:
      'Connecting with peer-led mutual-aid groups that fit your beliefs—including AA, NA, SMART Recovery, Recovery Dharma, LifeRing Secular Recovery, or Medication-Assisted Recovery Anonymous (MARA).',
    samhsaCode: 'PEER',
  },
  {
    code: 'RPP',
    name: 'Relapse Prevention (RPP) & Harm Reduction Counseling',
    bestFor: 'Practical planning for high-risk situations, cravings, tolerance changes, and staying alive.',
    whatItLooksLike:
      'Mapping out early warning signs, practicing urge-surfing, keeping naloxone and test strips on hand, and treating a return to use as a signal to adjust support rather than a reason to discharge you.',
    samhsaCode: 'RPP',
  },
];

/**
 * Step-by-step demystification of the SUDP treatment intake & assessment process.
 */
export const INTAKE_STEPS = [
  {
    step: 1,
    id: 'screening',
    title: 'Screening & immediate safety check',
    summary: 'A brief, welcoming check (often 10–15 minutes by phone or walk-in) to make sure you are physically safe right now.',
    details: [
      'Checks whether you need urgent medical withdrawal support—especially for alcohol, benzodiazepines (Xanax, Klonopin, Valium), or barbiturates, where stopping suddenly can cause dangerous seizures.',
      'Makes sure you have immediate access to naloxone (Narcan) and crisis stabilization if you are in acute distress.',
      'You do not need to have your whole story figured out to call or walk in.',
    ],
    relatedCodes: ['DT', 'WI', 'NOE'],
  },
  {
    step: 2,
    id: 'biopsychosocial',
    title: 'Biopsychosocial assessment with an SUDP or counselor',
    summary: 'A confidential, judgment-free conversation (typically 45–60 minutes) about your whole life—not an interrogation or a pass/fail test.',
    details: [
      'Uses the ASAM (American Society of Addiction Medicine) dimensions to understand your substance use history, physical health, mental health, living environment, and personal strengths.',
      'You can answer at your own pace and decline to detail traumatic events until you feel safe and ready.',
      'Honesty about what and how much you use helps the team keep you comfortable and recommend the right support—not punish you.',
    ],
    relatedCodes: ['OP', 'IOP', 'MHSU'],
  },
  {
    step: 3,
    id: 'medical-visit',
    title: 'Medical & medication visit (MD, NP, PA, or PharmD)',
    summary: 'A health check and conversation about FDA-approved medications for withdrawal relief, craving control, and health care.',
    details: [
      'Discusses medications for opioid use disorder (buprenorphine, methadone, naltrexone) or alcohol use disorder (naltrexone, acamprosate, disulfiram). You can take medication with or without intensive counseling.',
      'A baseline urine or oral swab drug screen may be used clinically to verify what is in your system (such as unexpected fentanyl or xylazine) so medications like buprenorphine can be started safely without precipitated withdrawal.',
      'Offers optional testing and care for HIV, hepatitis C, wound care, and primary health needs.',
    ],
    relatedCodes: ['BU', 'MU', 'NU', 'OTP', 'PMAT'],
  },
  {
    step: 4,
    id: 'treatment-plan',
    title: 'Collaborative treatment plan & level of care',
    summary: 'You and your counselor co-design a care plan around your goals, schedule, job, and family responsibilities.',
    details: [
      'Matches you to the least restrictive level of care that keeps you safe: Outpatient (OP), Intensive Outpatient (IOP), Telehealth (TELE), Partial Hospitalization, or Residential (RES).',
      'Lets you choose counseling modalities that fit you—such as CBT, Motivational Interviewing, Contingency Management, Trauma-Informed Seeking Safety, or Peer Support.',
      'Your treatment plan is a living document: you can ask to adjust your goals, group schedule, or counselor at any time.',
    ],
    relatedCodes: ['OP', 'IOP', 'TELE', 'RES'],
  },
  {
    step: 5,
    id: 'confidentiality-consent',
    title: 'Confidentiality & 42 CFR Part 2 consent rights',
    summary: 'Reviewing your privacy protections and choosing who—if anyone—may receive updates about your care.',
    details: [
      'Substance use disorder treatment records are protected by federal law 42 CFR Part 2 (updated by the 2024/2026 Final Rule, 89 FR 12472), which is stricter than standard HIPAA.',
      'Your records and SUD counseling notes cannot be shared with police, courts, probation, employers, landlords, or family members without your explicit written consent.',
      'You have the right to refuse to sign a release, limit what is shared, or revoke your consent at any time.',
    ],
    relatedCodes: [],
  },
  {
    step: 6,
    id: 'practical-barriers',
    title: 'Overcoming practical barriers (ID, cost, childcare, housing)',
    summary: 'Connecting with a peer navigator or case manager to solve real-world obstacles so you can actually access care.',
    details: [
      'No photo ID or uninsured? Federally Qualified Health Centers (FQHCs), OTPs, and state-funded programs can help you enroll in Medicaid, use a sliding fee scale (SS), or access payment assistance (PA) while helping replace lost ID.',
      'Need a ride, childcare, or safe housing? Ask about transportation assistance (TA), childcare/beds for children (BC), justice-system coordination (CJ), or NARR-certified recovery housing (HH).',
      'Protection from scams: Under federal law (EKRA, 18 U.S.C. § 220), legitimate programs never offer cash, gift cards, free rent, or paid airfare to broker you into a specific facility.',
    ],
    relatedCodes: ['SS', 'PA', 'TA', 'HH', 'CJ'],
  },
];

export const TRIGGER_SUGGESTIONS = [
  'Stress or feeling overwhelmed',
  'Loneliness or isolation',
  'Physical pain or untreated illness',
  'Payday or having extra cash',
  'Certain people, places, or routes',
  'Sleeplessness or exhaustion',
  'Anniversary or trauma reminders',
];

export const COPING_SUGGESTIONS = [
  'Urge surfing for 15 minutes before deciding',
  'Calling a trusted peer, friend, or helpline',
  'Changing my physical location right now',
  'Taking my prescribed MOUD/MAUD medication',
  'Eating a meal and drinking a glass of water',
  'Attending a support meeting (online or in-person)',
  'Doing slow 4-7-8 breathing and grounding',
];

function normalizeField(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v ?? '').trim()).filter(Boolean).join('\n• ');
  }
  return String(value ?? '').trim();
}

function formatBlock(title, rawValue) {
  const val = normalizeField(rawValue);
  const body = val ? (Array.isArray(rawValue) ? `• ${val}` : val) : '(None listed yet)';
  return `${title}\n${body}`;
}

/**
 * Pure function that formats a user's safety & recovery action plan into a clean,
 * readable plain-text document for copying to clipboard or printing.
 */
export function formatSafetyPlanText(plan = {}) {
  const safePlan = plan && typeof plan === 'object' ? plan : {};
  const sections = [
    '============================================================',
    'HARBORPATH PERSONAL SAFETY & RECOVERY ACTION PLAN',
    'Private, zero-knowledge plan — kept in your control.',
    '============================================================',
    '',
    formatBlock('1. MY GOAL RIGHT NOW', safePlan.goal),
    '',
    formatBlock('2. MY TRIGGERS & HIGH-RISK SITUATIONS', safePlan.triggers),
    '',
    formatBlock('3. EARLY WARNING SIGNS I AM STRUGGLING', safePlan.warningSigns),
    '',
    formatBlock('4. COPING STEPS THAT WORK FOR ME', safePlan.copingSteps),
    '',
    formatBlock('5. TRUSTED PEOPLE & SUPPORTS I CAN REACH OUT TO', safePlan.trustedContacts),
    '',
    formatBlock('6. WAYS TO MAKE MY ENVIRONMENT SAFER', safePlan.saferEnvironment),
    '',
    formatBlock('7. WHERE MY NALOXONE (NARCAN) & TEST STRIPS ARE KEPT', safePlan.naloxoneLocation),
    '',
    formatBlock('8. NOTES & REMINDERS TO MYSELF', safePlan.notes),
    '',
    '------------------------------------------------------------',
    '24/7 FREE & CONFIDENTIAL CRISIS & OVERDOSE PREVENTION LINES',
    '• 988 Suicide & Crisis Lifeline: Call or text 988 (24/7)',
    '• SAMHSA National Helpline: 1-800-662-4357 (24/7 treatment & support)',
    '• Never Use Alone (overdose prevention line): 1-800-484-3731 (24/7)',
    '• Medical Emergency (if someone won’t wake up): Call 911 & give naloxone',
    '------------------------------------------------------------',
  ];
  return sections.join('\n');
}

function toggleSuggestionInText(currentText, item) {
  const lines = String(currentText ?? '')
    .split('\n')
    .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean);
  const idx = lines.findIndex((l) => l.toLowerCase() === item.toLowerCase());
  if (idx >= 0) {
    lines.splice(idx, 1);
  } else {
    lines.push(item);
  }
  return lines.map((l) => `• ${l}`).join('\n');
}

function hasSuggestionInText(currentText, item) {
  const lines = String(currentText ?? '')
    .split('\n')
    .map((line) => line.replace(/^[•\-*]\s*/, '').trim().toLowerCase())
    .filter(Boolean);
  return lines.includes(item.toLowerCase());
}

/**
 * Interactive SUDP Counseling, Intake Demystification, 42 CFR Part 2 Rights,
 * and Zero-Knowledge Personal Safety & Recovery Action Plan view.
 */
export function planView({ query } = {}) {
  // Zero-knowledge state lives purely inside this closure in browser RAM.
  const plan = {
    goal: query?.get('goal') ?? '',
    triggers: '',
    warningSigns: '',
    copingSteps: '',
    trustedContacts: '',
    saferEnvironment: '',
    naloxoneLocation: '',
    notes: '',
  };

  const previewBody = h('div', { class: 'safety-plan-preview-body' });
  const copyStatus = h('p', { class: 'field-status', role: 'status', 'aria-live': 'polite' });

  const inputRefs = {};
  const triggerChipButtons = [];
  const copingChipButtons = [];

  function syncChipStates() {
    for (const { btn, label } of triggerChipButtons) {
      const active = hasSuggestionInText(plan.triggers, label);
      btn.setAttribute('aria-pressed', String(active));
      btn.className = active ? 'preset' : 'btn btn-small btn-ghost';
      if (active) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    }
    for (const { btn, label } of copingChipButtons) {
      const active = hasSuggestionInText(plan.copingSteps, label);
      btn.setAttribute('aria-pressed', String(active));
      btn.className = active ? 'preset' : 'btn btn-small btn-ghost';
      if (active) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    }
  }

  function renderPreview() {
    clear(previewBody);
    const rows = [
      [t('plan.preview.goal', 'My goal right now'), plan.goal],
      [t('plan.preview.triggers', 'Triggers & high-risk situations'), plan.triggers],
      [t('plan.preview.warningSigns', 'Early warning signs'), plan.warningSigns],
      [t('plan.preview.copingSteps', 'Coping steps that work for me'), plan.copingSteps],
      [t('plan.preview.trustedContacts', 'Trusted people & supports'), plan.trustedContacts],
      [t('plan.preview.saferEnvironment', 'Ways to make my space safer'), plan.saferEnvironment],
      [t('plan.preview.naloxoneLocation', 'Where my naloxone & test strips are kept'), plan.naloxoneLocation],
      [t('plan.preview.notes', 'Notes & reminders to myself'), plan.notes],
    ];

    previewBody.append(
      h('dl', { class: 'service-list' },
        rows.map(([label, val]) => [
          h('dt', null, label),
          h('dd', null, String(val ?? '').trim() || t('plan.preview.empty', 'Not filled in yet')),
        ]),
      ),
      h('div', { class: 'callout callout-info' },
        h('p', { class: 'callout-title' }, icon('phone'), t('plan.preview.crisisTitle', '24/7 free & confidential support lines')),
        ul([
          [strong('988 Suicide & Crisis Lifeline: '), 'Call or text ', tel('988', '988'), ' (free, 24/7).'],
          [strong('SAMHSA National Helpline: '), tel('18006624357', '1-800-662-4357'), ' (free 24/7 treatment referral & support).'],
          [strong('Never Use Alone: '), tel('18004843731', '1-800-484-3731'), ' (24/7 overdose prevention operator if using alone).'],
        ]),
      ),
    );
  }

  function createField({ key, id, label, helpText, placeholder, rows = 2, chips = null }) {
    const control = rows > 1
      ? h('textarea', {
          id,
          class: 'input',
          rows: String(rows),
          placeholder,
          oninput: (e) => {
            plan[key] = e.target.value;
            syncChipStates();
            renderPreview();
          },
        }, plan[key])
      : h('input', {
          id,
          type: 'text',
          class: 'input',
          placeholder,
          value: plan[key],
          oninput: (e) => {
            plan[key] = e.target.value;
            renderPreview();
          },
        });

    inputRefs[key] = control;

    return h('div', { class: 'filter-group' },
      h('label', { class: 'label', for: id }, label),
      helpText && h('p', { class: 'help' }, helpText),
      chips,
      control,
    );
  }

  const triggerChipsBar = h('div', { class: 'presets', role: 'group', 'aria-label': t('plan.triggers.chipsLabel', 'Quick-add common triggers') },
    TRIGGER_SUGGESTIONS.map((label) => {
      const btn = h('button', {
        type: 'button',
        class: 'btn btn-small btn-ghost',
        'aria-pressed': 'false',
        onclick: () => {
          plan.triggers = toggleSuggestionInText(plan.triggers, label);
          if (inputRefs.triggers) inputRefs.triggers.value = plan.triggers;
          syncChipStates();
          renderPreview();
          announce(`${hasSuggestionInText(plan.triggers, label) ? 'Added' : 'Removed'} trigger: ${label}`);
        },
      }, '+ ', label);
      triggerChipButtons.push({ btn, label });
      return btn;
    }),
  );

  const copingChipsBar = h('div', { class: 'presets', role: 'group', 'aria-label': t('plan.coping.chipsLabel', 'Quick-add coping strategies') },
    COPING_SUGGESTIONS.map((label) => {
      const btn = h('button', {
        type: 'button',
        class: 'btn btn-small btn-ghost',
        'aria-pressed': 'false',
        onclick: () => {
          plan.copingSteps = toggleSuggestionInText(plan.copingSteps, label);
          if (inputRefs.copingSteps) inputRefs.copingSteps.value = plan.copingSteps;
          syncChipStates();
          renderPreview();
          announce(`${hasSuggestionInText(plan.copingSteps, label) ? 'Added' : 'Removed'} coping step: ${label}`);
        },
      }, '+ ', label);
      copingChipButtons.push({ btn, label });
      return btn;
    }),
  );

  async function handleCopyPlan() {
    const text = formatSafetyPlanText(plan);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        copyStatus.textContent = t('plan.copied', 'Copied your safety plan to the clipboard.');
        announce(t('plan.copied', 'Copied your safety plan to the clipboard.'));
      } else {
        copyStatus.textContent = t('plan.copyUnavailable', 'Clipboard access is unavailable in this browser. Use Print / Save as PDF instead.');
      }
    } catch {
      copyStatus.textContent = t('plan.copyError', 'Could not copy automatically. Use Print / Save as PDF instead.');
    }
  }

  function handleClearPlan() {
    for (const k of Object.keys(plan)) {
      plan[k] = '';
      if (inputRefs[k]) inputRefs[k].value = '';
    }
    copyStatus.textContent = t('plan.cleared', 'Cleared your safety plan from browser memory.');
    syncChipStates();
    renderPreview();
    announce(t('plan.cleared', 'Cleared your safety plan from browser memory.'));
  }

  syncChipStates();
  renderPreview();

  return h('div', { class: 'view view-prose' },
    pageHeader(
      t('plan.title', 'Safety planning, counseling & what to expect'),
      t(
        'plan.lede',
        'Build a private, zero-knowledge personal safety and recovery action plan, explore evidence-based counseling approaches, and see what really happens at a treatment intake.',
      ),
    ),
    emergencyCallout(),
    tocNav([
      ['safety-plan', t('plan.toc.safetyPlan', 'Personal safety & action plan')],
      ['intake-guide', t('plan.toc.intake', 'What to expect at your first appointment')],
      ['counseling-modalities', t('plan.toc.modalities', 'Counseling & therapy approaches')],
      ['confidentiality-rights', t('plan.toc.rights', 'Your confidentiality rights (42 CFR Part 2)')],
    ]),

    // 1. Zero-Knowledge Interactive Personal Safety & Recovery Action Plan Builder
    section('safety-plan', t('plan.section.safetyPlan', 'Personal safety & recovery action plan'),
      h('div', { class: 'callout callout-info' },
        h('p', { class: 'callout-title' }, icon('lock'), t('plan.zeroKnowledge.title', '100% in browser memory — never saved or transmitted')),
        p(t(
          'plan.zeroKnowledge.desc',
          'Everything you type or select below stays strictly in temporary browser RAM. Nothing is sent to a server, stored in cookies, or written to disk unless you choose to copy or print it. Clicking Quick Exit (or pressing Escape twice) wipes it immediately.',
        )),
      ),

      h('form', {
        class: 'card',
        onsubmit: (e) => e.preventDefault(),
        'aria-label': t('plan.form.ariaLabel', 'Personal safety and recovery action plan builder'),
      },
        h('h3', null, t('plan.form.heading', 'Build your plan (fill in only what helps you)')),
        fine(t('plan.form.sub', 'Whether your goal today is staying alive, cutting back, starting medication, or preventing a return to use, small concrete steps help in a hard moment.')),

        createField({
          key: 'goal',
          id: 'plan-goal',
          label: t('plan.field.goal', '1. My goal right now'),
          helpText: t('plan.help.goal', 'Examples: “Not use alone tonight”, “Start buprenorphine this week”, “Make it through the weekend without drinking”.'),
          placeholder: t('plan.placeholder.goal', 'What does staying safer or feeling better look like for you right now?'),
          rows: 1,
        }),

        createField({
          key: 'triggers',
          id: 'plan-triggers',
          label: t('plan.field.triggers', '2. My triggers & high-risk situations'),
          helpText: t('plan.help.triggers', 'Click any common trigger below to add or remove it, or type your own.'),
          placeholder: t('plan.placeholder.triggers', 'People, places, feelings, times of day, or situations that spark cravings...'),
          rows: 3,
          chips: triggerChipsBar,
        }),

        createField({
          key: 'warningSigns',
          id: 'plan-warning-signs',
          label: t('plan.field.warningSigns', '3. Early warning signs I am struggling'),
          helpText: t('plan.help.warningSigns', 'How do you notice a craving or return to use building before it happens?'),
          placeholder: t('plan.placeholder.warningSigns', 'Skipping sleep or meals, isolating, missing medication doses, feeling restless...'),
          rows: 2,
        }),

        createField({
          key: 'copingSteps',
          id: 'plan-coping-steps',
          label: t('plan.field.copingSteps', '4. Coping steps I can try for 15 minutes'),
          helpText: t('plan.help.copingSteps', 'Cravings crest and fade like waves. Click any strategy below to add it, or write your own.'),
          placeholder: t('plan.placeholder.copingSteps', 'Steps to ride out a craving or get through the next hour safely...'),
          rows: 3,
          chips: copingChipsBar,
        }),

        createField({
          key: 'trustedContacts',
          id: 'plan-trusted-contacts',
          label: t('plan.field.trustedContacts', '5. Trusted people & supports I can call or text'),
          helpText: t('plan.help.trustedContacts', 'Who is safe, non-judgmental, and supportive when you need to talk?'),
          placeholder: t('plan.placeholder.trustedContacts', 'Names, phone numbers, peer coach, counselor, or favorite meeting...'),
          rows: 2,
        }),

        createField({
          key: 'saferEnvironment',
          id: 'plan-safer-environment',
          label: t('plan.field.saferEnvironment', '6. Ways to make my environment safer'),
          helpText: t('plan.help.saferEnvironment', 'Practical harm reduction and environmental steps if a slip or return to use happens.'),
          placeholder: t('plan.placeholder.saferEnvironment', 'Start low & go slow after a break, never mix opioids with benzos/alcohol, unlock the door, call Never Use Alone...'),
          rows: 2,
        }),

        createField({
          key: 'naloxoneLocation',
          id: 'plan-naloxone-location',
          label: t('plan.field.naloxoneLocation', '7. Where my naloxone (Narcan) & test strips are kept'),
          helpText: t('plan.help.naloxoneLocation', 'Make sure people around you know where to find your naloxone without searching.'),
          placeholder: t('plan.placeholder.naloxoneLocation', 'Example: Top drawer by the front door and front pocket of my backpack...'),
          rows: 1,
        }),

        createField({
          key: 'notes',
          id: 'plan-notes',
          label: t('plan.field.notes', '8. Notes & reminders to myself'),
          helpText: t('plan.help.notes', 'What helps you remember your worth when things feel heavy?'),
          placeholder: t('plan.placeholder.notes', 'A return to use does not erase my progress. I deserve safe, respectful care...'),
          rows: 2,
        }),
      ),

      h('div', { class: 'card safety-plan-preview', 'aria-labelledby': 'safety-plan-preview-title' },
        h('h3', { id: 'safety-plan-preview-title' }, t('plan.preview.heading', 'Your printable safety & action plan')),
        fine(t('plan.preview.sub', 'Print this card, save it as a PDF on your device, or copy the plain text to keep with you.')),
        previewBody,
        h('div', { class: 'actions' },
          h('button', {
            type: 'button',
            class: 'btn btn-primary',
            onclick: handleCopyPlan,
          }, icon('copy'), t('plan.btn.copy', 'Copy plan to clipboard')),
          h('button', {
            type: 'button',
            class: 'btn btn-secondary',
            onclick: () => window.print(),
          }, icon('printer'), t('plan.btn.print', 'Print / Save as PDF')),
          h('button', {
            type: 'button',
            class: 'btn btn-ghost',
            onclick: handleClearPlan,
          }, icon('x'), t('plan.btn.clear', 'Clear plan')),
        ),
        copyStatus,
      ),
    ),

    // 2. What to Expect at Your First Appointment (SUDP Intake Guide)
    section('intake-guide', t('plan.section.intake', 'What to expect at your first appointment (SUDP intake guide)'),
      p(t(
        'plan.intake.intro',
        'Calling or walking into a treatment program for the first time can feel intimidating—especially if you have had judgmental healthcare experiences in the past. Knowing what happens step by step puts you in the driver’s seat.',
      )),
      h('ol', { class: 'steps' },
        INTAKE_STEPS.map((s) => h('li', { class: 'step', id: `intake-step-${s.step}` },
          h('span', { class: 'step-num', 'aria-hidden': 'true' }, String(s.step)),
          h('div', { class: 'step-body' },
            h('h3', null, s.title),
            p(strong(s.summary)),
            ul(s.details),
            s.relatedCodes.length > 0 && h('p', { class: 'actions' },
              h('a', {
                class: 'btn btn-small btn-secondary',
                href: `#/treatment?codes=${s.relatedCodes.join(',')}`,
              }, icon('search'), `Search facilities (${s.relatedCodes.join(', ')})`),
            ),
          ),
        )),
      ),
    ),

    // 3. Counseling & Therapy Approaches Explained
    section('counseling-modalities', t('plan.section.modalities', 'Counseling & therapy approaches explained'),
      p(t(
        'plan.modalities.intro',
        'Quality substance use counseling is never about breaking you down or lecturing you. Licensed Substance Use Disorder Professionals (SUDPs) and clinical counselors use practical, evidence-based therapies tailored to your goals—and counseling works best when paired with FDA-approved medications if you have opioid or alcohol use disorder.',
      )),
      h('div', { class: 'results-list' },
        COUNSELING_MODALITIES.map((m) => h('article', { class: 'card' },
          h('div', { class: 'facility-head' },
            h('h3', { class: 'facility-name' }, m.name),
            h('span', { class: 'chip chip-care' }, m.code),
          ),
          p(strong('Best for: '), m.bestFor),
          p(strong('What it looks like in real life: '), m.whatItLooksLike),
          h('p', { class: 'actions' },
            h('a', {
              class: 'btn btn-small btn-secondary',
              href: `#/treatment?codes=${m.samhsaCode}`,
            }, icon('compass'), `Find ${m.code} programs near me`),
          ),
        )),
      ),
    ),

    // 4. Your Confidentiality Rights (42 CFR Part 2 — 2024/2026 Final Rule)
    section('confidentiality-rights', t('plan.section.rights', 'Your confidentiality rights (42 CFR Part 2 — 2024/2026 Final Rule)'),
      p(t(
        'plan.rights.intro',
        'Fear that an employer, landlord, police officer, or court will find out you asked for help is one of the biggest barriers to care. Federal law gives substance use disorder (SUD) treatment records special, heightened legal protection beyond regular medical records.',
      )),
      ul([
        [
          strong('42 CFR Part 2 Final Rule (89 FR 12472): '),
          'Issued by HHS and SAMHSA (effective April 2024 with full enforcement compliance in February 2026), federal Part 2 rules strictly prohibit federally assisted SUD programs from disclosing your identity, attendance, diagnosis, or treatment records without your explicit written consent.',
        ],
        [
          strong('Stronger shield against police, prosecutors, and courts: '),
          'Unlike ordinary medical records under HIPAA, your Part 2 SUD records cannot be used to investigate or prosecute you for a crime without your written consent or a special, high-threshold Part 2 court order where you and the program must first be given notice and an opportunity to be heard. A routine subpoena or police request is not enough.',
        ],
        [
          strong('Special protection for SUD counseling notes: '),
          'Under the 2024/2026 Final Rule, an SUDP or therapist’s personal SUD counseling notes receive dedicated protection (parallel to HIPAA psychotherapy notes). Even if you sign a general consent for care coordination, your detailed counseling session notes cannot be shared without a separate, specific written consent from you.',
        ],
        [
          strong('Your control over consent & revocation: '),
          'You may sign a single consent for treatment, payment, and healthcare operations (TPO) so your doctors can coordinate safely—or you can refuse or narrow who sees your records. You can revoke your consent in writing at any time, and you have the right to receive an accounting of who has accessed your records.',
        ],
        [
          strong('Protection against patient brokering (EKRA, 18 U.S.C. § 220): '),
          'The federal Eliminating Kickbacks in Recovery Act makes it a felony for anyone to pay or receive kickbacks for referring you to a treatment program, sober home, or lab. Never trust a marketer offering free airfare, cash, or rent in exchange for your insurance policy details.',
        ],
      ]),
      fine(
        'Learn more from ',
        ext('https://www.hhs.gov/hipaa/for-professionals/regulatory-initiatives/fact-sheet-42-cfr-part-2-final-rule/index.html', 'HHS: 42 CFR Part 2 Final Rule Fact Sheet'),
        ' and ',
        h('a', { href: '#/choosing-care' }, 'Choosing quality care'),
        '.',
      ),
    ),
  );
}
