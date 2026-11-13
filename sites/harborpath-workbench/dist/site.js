import { playbooks } from './playbooks.js';
import { toggleStep } from './state.js';

const list = document.querySelector('#guide-list');
const plan = document.querySelector('#plan');
const title = document.querySelector('#plan-title');
const steps = document.querySelector('#steps');
const counter = document.querySelector('#progress');
const reset = document.querySelector('#reset');
const guideIcons = [
  '<circle cx="12" cy="12" r="8"/><path d="m15 9-2 4-4 2 2-4z"/>',
  '<path d="M8 4 5 6c-1 1 0 5 4 9s8 5 9 4l2-3-4-2-2 2c-3-2-4-3-6-6l2-2-2-4Z"/>',
  '<path d="M12 19 5 12a4 4 0 0 1 6-6l1 1 1-1a4 4 0 0 1 6 6l-7 7Z"/>'
];
let progress = Object.create(null);
let active;

function element(tag, content, className) {
  const node = document.createElement(tag);
  node.textContent = content;
  if (className) node.className = className;
  return node;
}

function updateProgress() {
  const done = progress[active.id]?.length ?? 0;
  counter.textContent = `${done} of ${active.steps.length} complete`;
  reset.setAttribute('aria-disabled', String(done === 0));
}

function showGuide(guide) {
  active = guide;
  list.querySelectorAll('button').forEach(button => {
    button.setAttribute('aria-expanded', String(button.dataset.guide === guide.id));
  });
  title.textContent = guide.title;
  document.querySelector('#plan-eyebrow').textContent = guide.eyebrow;
  steps.replaceChildren(...guide.steps.map((text, index) => {
    const row = element('label', '', 'step');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = progress[guide.id]?.includes(index) ?? false;
    checkbox.addEventListener('change', () => {
      progress = toggleStep(progress, guide.id, index);
      updateProgress();
    });
    row.append(checkbox, element('span', text));
    return row;
  }));
  plan.hidden = false;
  updateProgress();
  title.focus({ preventScroll: true });
  plan.scrollIntoView({ block: 'start' });
}

playbooks.forEach((guide, index) => {
  const card = element('article', '', 'card');
  const icon = element('span', '', 'card-icon');
  icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${guideIcons[index] ?? guideIcons[0]}</svg>`;
  const button = element('button', '', 'card-action');
  button.type = 'button';
  button.dataset.guide = guide.id;
  button.setAttribute('aria-label', `Open guide: ${guide.title}`);
  button.setAttribute('aria-controls', 'plan');
  button.setAttribute('aria-expanded', 'false');
  const arrow = element('span', '→');
  arrow.setAttribute('aria-hidden', 'true');
  button.append('Open guide ', arrow);
  button.addEventListener('click', () => showGuide(guide));
  card.append(icon, element('p', guide.eyebrow, 'card-kicker'), element('h3', guide.title),
    element('p', guide.description, 'card-description'), button);
  list.append(card);
});

reset.addEventListener('click', () => {
  if (!active || !progress[active.id]?.length) return;
  delete progress[active.id];
  steps.querySelectorAll('input').forEach(checkbox => { checkbox.checked = false; });
  updateProgress();
});

document.querySelector('#print').addEventListener('click', () => window.print());
