import { h, tel } from '../dom.js';
import { pageHeader, section, p, fine, emergencyCallout } from './common.js';
import { t } from '../i18n.js';
import { sourceContext } from '../components/sourceContext.js';

// Only these task identifiers and boolean checkmarks can enter this workspace.
// No personal details, search answers, or information from other views is read.
export const CARE_WORKSPACE_STAGES = Object.freeze([
  {
    id: 'visit',
    titleKey: 'workspace.visit.title',
    title: '1. During a brief visit',
    descriptionKey: 'workspace.visit.description',
    description: 'Start with the person’s goals and offer choices at their pace.',
    tasks: [
      { id: 'goals', key: 'workspace.task.goals', label: 'Ask what matters to the person and whether they want help connecting to care.' },
      { id: 'safety', key: 'workspace.task.safety', label: 'Review immediate safety needs with qualified staff; use emergency services when needed.' },
      { id: 'options', key: 'workspace.task.options', label: 'Discuss care and medication options together, respecting the person’s treatment choices.' },
    ],
    links: [
      { href: '#/navigator', key: 'workspace.link.navigator', label: 'Care navigator' },
      { href: '#/assessment', key: 'workspace.link.assessment', label: 'Assessment guide' },
      { href: '#/medications', key: 'workspace.link.medications', label: 'Medication information' },
      { href: '#/toxicology-triage', key: 'workspace.link.toxicologyTriage', label: 'Toxicology triage & de-escalation' },
      { href: '#/hospital-care', key: 'workspace.link.hospitalCare', label: 'Hospital addiction & pain on MOUD' },
      { href: '#/needle-exposure', key: 'workspace.link.needleExposure', label: 'Needle stick & PEP protocol' },
      { href: '#/sexual-health', key: 'workspace.link.sexualHealth', label: 'Sexual health, Doxy-PEP & contraception' },
      { href: '#/novel-substances', key: 'workspace.link.novelSubstances', label: 'Novel substances, kratom & tianeptine' },
      { href: '#/gabapentinoid-care', key: 'workspace.link.gabapentinoidCare', label: 'Gabapentinoid safety & deprescribing' },
      { href: '#/psychedelic-care', key: 'workspace.link.psychedelicCare', label: 'Psychedelic care, 5-HT2A de-escalation & HPPD' },
      { href: '#/ghb-care', key: 'workspace.link.ghbCare', label: 'GHB/GBL coma triage & withdrawal' },
      { href: '#/vein-care', key: 'workspace.link.veinCare', label: 'Vein care & injection anatomy' },
      { href: '#/inhalant-care', key: 'workspace.link.inhalantCare', label: 'Inhalants, solvents & nitrous oxide safety' },
      { href: '#/ketamine-care', key: 'workspace.link.ketamineCare', label: 'Ketamine uropathy & harm reduction' },
      { href: '#/weather-care', key: 'workspace.link.weatherCare', label: 'Hypothermia, frostbite & heat stroke' },
    ],
  },
  {
    id: 'handoff',
    titleKey: 'workspace.handoff.title',
    title: '2. Prepare a referral or warm handoff',
    descriptionKey: 'workspace.handoff.description',
    description: 'With the person’s permission, contact the receiving service together when possible.',
    tasks: [
      { id: 'intake', key: 'workspace.task.intake', label: 'Call the receiving service about intake steps, current openings, and who can accept the referral.' },
      { id: 'coverage', key: 'workspace.task.coverage', label: 'Ask the service and insurer about network status, costs, prior authorization, and financial assistance.' },
      { id: 'access', key: 'workspace.task.access', label: 'Check transportation, language, disability access, telehealth access, and scheduling needs.' },
      { id: 'permission', key: 'workspace.task.permission', label: 'Confirm the person’s chosen next step and permission before sharing any information.' },
    ],
    links: [
      { href: '#/match', key: 'workspace.link.match', label: 'Find care that fits' },
      { href: '#/health', key: 'workspace.link.health', label: 'Health and safety-net services' },
      { href: '#/saved', key: 'workspace.link.saved', label: 'Saved resources' },
    ],
  },
  {
    id: 'postvisit',
    titleKey: 'workspace.postvisit.title',
    title: '4. Documentation, safety & harm reduction summary',
    descriptionKey: 'workspace.postvisit.description',
    description: 'Ensure harm reduction materials are provided and record referral status in approved systems.',
    tasks: [
      { id: 'documentation', key: 'workspace.task.documentation', label: 'Document checklist actions in your organization’s approved electronic health record without copying personal notes into HarborPath.' },
      { id: 'harmreduction', key: 'workspace.task.harmreduction', label: 'Confirm take-home naloxone, fentanyl/xylazine test strips, and safer-use instructions were provided or offered.' },
      { id: 'transportation', key: 'workspace.task.transportation', label: 'Verify transportation logistics, transit passes, or Medicaid Non-Emergency Medical Transportation (NEMT) arrangements.' },
      { id: 'crisissupport', key: 'workspace.task.crisissupport', label: 'Provide 24/7 crisis numbers (988, Never Use Alone: 877-696-1996) and local peer support resources to the individual.' },
    ],
    links: [
      { href: '#/chronic-pain', key: 'workspace.link.chronicPain', label: 'Pain & sedative taper guide' },
      { href: '#/harm-reduction', key: 'workspace.link.harmReduction', label: 'Harm reduction resources' },
      { href: '#/plan', key: 'workspace.link.plan', label: 'Safety and next-steps plan' },
    ],
  },
  {
    id: 'followup',
    titleKey: 'workspace.followup.title',
    title: '3. Before leaving and after the handoff',
    descriptionKey: 'workspace.followup.description',
    description: 'Make the next step understandable and agree how the team will follow up.',
    tasks: [
      { id: 'followup', key: 'workspace.task.followup', label: 'Agree who will follow up and when, using a safe contact method outside HarborPath.' },
      { id: 'bridge', key: 'workspace.task.bridge', label: 'Review a safety plan, naloxone access, and a backup option while waiting for care.' },
      { id: 'nextstep', key: 'workspace.task.nextstep', label: 'Explain what to bring, where to go, and how to ask for help if the plan changes.' },
      { id: 'connection', key: 'workspace.task.connection', label: 'Check whether the connection happened; revisit barriers with the person if it did not.' },
    ],
    links: [
      { href: '#/plan', key: 'workspace.link.plan', label: 'Safety and next-steps plan' },
      { href: '#/saved', key: 'workspace.link.saved', label: 'Saved resources' },
    ],
  },
].map((stage) => Object.freeze({
  ...stage,
  tasks: Object.freeze(stage.tasks.map(Object.freeze)),
  links: Object.freeze(stage.links.map(Object.freeze)),
})));

const tasks = CARE_WORKSPACE_STAGES.flatMap((stage) => stage.tasks);
const knownTaskIds = new Set(tasks.map((task) => task.id));
const checkedTasks = new Set();
let refreshActiveView = null;
let revision = 0;

export function getCareWorkspaceState() {
  return { checked: tasks.filter((task) => checkedTasks.has(task.id)).map((task) => task.id) };
}

export function setCareWorkspaceTask(taskId, checked) {
  if (!knownTaskIds.has(taskId)) return getCareWorkspaceState();
  if (checked === true) checkedTasks.add(taskId);
  else checkedTasks.delete(taskId);
  revision++;
  refreshActiveView?.();
  return getCareWorkspaceState();
}

/** Called by Quick Exit and the visible reset control; also clears the mounted UI. */
export function resetCareWorkspaceState() {
  checkedTasks.clear();
  revision++;
  refreshActiveView?.();
  return getCareWorkspaceState();
}

function verificationNote() {
  return t('workspace.verification', 'A directory listing or checked task does not confirm an opening, referral acceptance, insurance coverage, or cost. Verify these directly with the receiving service and insurer.');
}

function summaryDisclaimer() {
  return t('workspace.summary.disclaimer', 'Checklist actions only. This is not a clinical assessment, care order, accepted referral, or discharge clearance. It does not replace clinical judgment or your organization’s approved care and consent processes.');
}

/** Exports only fixed task labels and checked/not-checked status, never caller text. */
export function formatCareWorkspaceSummary({ checked } = getCareWorkspaceState()) {
  const selected = new Set(Array.isArray(checked) ? checked.filter((id) => knownTaskIds.has(id)) : []);
  const lines = [
    t('workspace.summary.heading', 'HarborPath — Care team checklist'),
    summaryDisclaimer(),
    verificationNote(),
  ];
  for (const stage of CARE_WORKSPACE_STAGES) {
    lines.push('', t(stage.titleKey, stage.title));
    for (const task of stage.tasks) {
      const status = selected.has(task.id)
        ? t('workspace.summary.checked', 'Checked')
        : t('workspace.summary.unchecked', 'Not checked — needs review');
      lines.push(`${selected.has(task.id) ? '[x]' : '[ ]'} ${status}: ${t(task.key, task.label)}`);
    }
  }
  lines.push('', t('workspace.summary.crisis', 'For immediate danger or a suspected overdose, call 911. For a mental health or suicide crisis, call or text 988.'));
  return lines.join('\n');
}

export function careWorkspaceView({ meta } = {}) {
  const controls = new Map();
  const progress = h('p', { class: 'workspace-progress', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const status = h('p', { class: 'field-status', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const summary = h('pre', { class: 'workspace-summary', id: 'workspace-summary-text', tabindex: '0', 'aria-labelledby': 'workspace-summary-title' });

  refreshActiveView = () => {
    for (const [id, control] of controls) control.checked = checkedTasks.has(id);
    progress.textContent = t('workspace.progress', '{checked} of {total} tasks checked. Unchecked tasks still need review.', { checked: checkedTasks.size, total: tasks.length });
    summary.textContent = formatCareWorkspaceSummary();
    status.textContent = '';
  };

  const stageViews = CARE_WORKSPACE_STAGES.map((stage) => section(
    `workspace-${stage.id}`,
    t(stage.titleKey, stage.title),
    p(t(stage.descriptionKey, stage.description)),
    h('ul', { class: 'list checklist workspace-tasks' }, stage.tasks.map((task) => {
      const id = `workspace-task-${task.id}`;
      const control = h('input', {
        id,
        type: 'checkbox',
        checked: checkedTasks.has(task.id),
        onchange: (event) => setCareWorkspaceTask(task.id, event.target.checked),
      });
      controls.set(task.id, control);
      return h('li', null, h('label', { for: id, class: 'check workspace-task' }, control, h('span', null, t(task.key, task.label))));
    })),
    h('div', { class: 'actions no-print' }, stage.links.map((link) => h('a', { class: 'btn btn-small btn-secondary', href: link.href }, t(link.key, link.label)))),
  ));

  const copyButton = h('button', {
    type: 'button', class: 'btn btn-primary',
    onclick: async () => {
      const startedAtRevision = revision;
      const text = formatCareWorkspaceSummary();
      copyButton.disabled = true;
      try {
        if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(text);
        if (revision === startedAtRevision) status.textContent = t('workspace.copied', 'Checklist copied. Quick Exit cannot erase clipboard contents or printed copies.');
      } catch {
        if (revision === startedAtRevision) status.textContent = t('workspace.copyFailed', 'Copy is unavailable. Select the checklist text below and use your device’s copy command.');
      } finally {
        copyButton.disabled = false;
      }
    },
  }, t('workspace.copy', 'Copy checklist'));

  const root = h('div', { class: 'view view-prose care-workspace' },
    pageHeader(t('workspace.title', 'Care team workspace'), t('workspace.intro', 'A practical checklist for healthcare workers, peer navigators, and community teams supporting a visit, referral, or transition of care.')),
    emergencyCallout(),
    h('div', { class: 'callout' },
      p(t('workspace.privacy', 'Use a fresh checklist for each person. Checkmarks stay only in this tab’s memory while you browse HarborPath. Reset before the next person; reloading, closing the tab, or Quick Exit clears them.')),
      fine(t('workspace.noDetails', 'There are no fields for names, contact details, clinical notes, or other personal information. This workspace does not read answers or saved resources from other tools.')),
    ),
    h('div', { class: 'callout callout-info' }, p(verificationNote()), fine(summaryDisclaimer())),
    progress,
    h('div', { class: 'workspace-stages no-print' }, stageViews),
    section('workspace-export', t('workspace.export.title', 'Review and share the checklist'),
      p(t('workspace.export.body', 'The summary includes every task and clearly marks anything not checked. Review it with the person and use your organization’s approved systems for any personal care information.')),
      fine(t('workspace.export.privacy', 'Copying or printing creates a separate copy. Quick Exit cannot erase clipboard contents, printed pages, or files saved by your print dialog.')),
      h('div', { class: 'actions no-print' },
        copyButton,
        h('button', { type: 'button', class: 'btn btn-secondary', onclick: () => {
          if (typeof window !== 'undefined' && typeof window.print === 'function') window.print();
          else status.textContent = t('workspace.printUnavailable', 'Printing is unavailable here. You can copy the checklist instead.');
        } }, t('workspace.print', 'Print checklist')),
        h('button', { type: 'button', class: 'btn btn-ghost', onclick: () => {
          resetCareWorkspaceState();
          status.textContent = t('workspace.resetDone', 'Checklist reset. All tasks are unchecked.');
        } }, t('workspace.reset', 'Reset for the next person')),
      ),
      status,
      h('div', { class: 'print-handout' }, h('h3', { id: 'workspace-summary-title' }, t('workspace.summary.title', 'Checklist summary')), summary),
      fine(t('workspace.crisisHelp', 'For a mental health or suicide crisis: '), tel('988', '988')),
    ),
  );
  root.append(sourceContext({ meta }));
  refreshActiveView();
  return root;
}
