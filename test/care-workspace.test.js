import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CARE_WORKSPACE_STAGES,
  careWorkspaceView,
  getCareWorkspaceState,
  setCareWorkspaceTask,
  resetCareWorkspaceState,
  formatCareWorkspaceSummary,
} from '../public/js/views/workspace.js';
import { useDictionary } from '../public/js/i18n.js';
import esWorkspace from '../public/js/locales/es-workspace.js';

afterEach(() => {
  useDictionary('en', {});
  resetCareWorkspaceState();
});

class Element {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.checked = false;
    this.disabled = false;
    this.dataset = {};
    this.className = '';
    this.text = '';
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'checked') this.checked = true;
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  append(...children) { this.children.push(...children); }
  get textContent() { return this.text + this.children.map((child) => typeof child === 'string' ? child : child.textContent).join(''); }
  set textContent(value) { this.text = String(value); this.children = []; }
  all(predicate) {
    return [this, ...this.children.filter((child) => child instanceof Element).flatMap((child) => child.all(() => true))].filter(predicate);
  }
}

async function withDom(run, { writeText = async () => {} } = {}) {
  const replacements = {
    Node: Element,
    document: { createElement: (tag) => new Element(tag), createElementNS: (_, tag) => new Element(tag) },
    navigator: { clipboard: { writeText } },
    window: { print() { this.printed = true; } },
    fetch: () => { throw new Error('Workspace must not make requests'); },
    localStorage: { getItem() { throw new Error('Workspace must not read device storage'); }, setItem() { throw new Error('Workspace must not write device storage'); } },
    sessionStorage: { getItem() { throw new Error('Workspace must not read session storage'); }, setItem() { throw new Error('Workspace must not write session storage'); } },
  };
  const previous = new Map(Object.keys(replacements).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(replacements)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  try { await run(); }
  finally {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

const find = (root, tag, text) => root.all((node) => node.tagName === tag.toUpperCase() && (!text || node.textContent === text))[0];

test('workspace accepts only known task IDs and literal boolean marks, with independent state snapshots', () => {
  setCareWorkspaceTask('intake', true);
  setCareWorkspaceTask('a-person-name-or-note', true);
  setCareWorkspaceTask('coverage', 'a-person-or-policy-number');
  const snapshot = getCareWorkspaceState();
  assert.deepEqual(snapshot, { checked: ['intake'] });
  snapshot.checked.push('coverage');
  assert.deepEqual(getCareWorkspaceState(), { checked: ['intake'] });
  setCareWorkspaceTask('intake', false);
  assert.deepEqual(getCareWorkspaceState(), { checked: [] });
});

test('safe handoff summary preserves unchecked tasks and never exports arbitrary supplied text', () => {
  const summary = formatCareWorkspaceSummary({ checked: ['intake', 'coverage', 'private-name-555-0100'], notes: 'private-diagnosis' });
  assert.match(summary, /\[x\] Checked: Call the receiving service/);
  assert.match(summary, /\[ \] Not checked — needs review: Check transportation/);
  assert.match(summary, /does not confirm an opening, referral acceptance, insurance coverage, or cost/);
  assert.match(summary, /not a clinical assessment, care order, accepted referral, or discharge clearance/);
  assert.match(summary, /911/);
  assert.match(summary, /988/);
  assert.doesNotMatch(summary, /private-name|555-0100|private-diagnosis/);
  assert.equal((summary.match(/^\[[x ]\]/gm) ?? []).length, CARE_WORKSPACE_STAGES.flatMap((stage) => stage.tasks).length);
});

test('workspace renders native labeled checkboxes, no personal-data fields, local tools, and safe official sources', async () => {
  await withDom(() => {
    const view = careWorkspaceView();
    const inputs = view.all((node) => node.tagName === 'INPUT');
    assert.ok(inputs.length > 0);
    for (const input of inputs) {
      assert.equal(input.getAttribute('type'), 'checkbox');
      assert.ok(view.all((node) => node.tagName === 'LABEL' && node.getAttribute('for') === input.getAttribute('id')).length === 1);
    }
    assert.equal(view.all((node) => ['TEXTAREA', 'SELECT', 'FORM'].includes(node.tagName)).length, 0);
    const anchors = view.all((node) => node.tagName === 'A');
    const links = anchors.map((node) => node.getAttribute('href'));
    for (const route of ['#/navigator', '#/assessment', '#/medications', '#/match', '#/health', '#/plan', '#/saved']) assert.ok(links.includes(route), route);
    const sourceHosts = new Set(['findtreatment.gov', 'data.hrsa.gov', 'www.va.gov', 'www.ihs.gov', 'data.cms.gov', 'www.census.gov', 'www.medicaid.gov']);
    for (const anchor of anchors) {
      const href = anchor.getAttribute('href');
      if (href.startsWith('#/') || href.startsWith('tel:')) continue;
      const url = new URL(href);
      assert.equal(url.protocol, 'https:');
      assert.ok(sourceHosts.has(url.hostname), `Unexpected external source: ${href}`);
      assert.equal(url.username, '');
      assert.equal(url.password, '');
      const rel = new Set((anchor.getAttribute('rel') ?? '').split(/\s+/));
      assert.ok(rel.has('noopener'), href);
      assert.ok(rel.has('noreferrer'), href);
    }
    assert.match(view.textContent, /Reset before the next person/);
    assert.match(view.textContent, /Quick Exit cannot erase clipboard contents/);
  });
});

test('checking a task updates the summary and reset clears both memory and visible controls', async () => {
  await withDom(() => {
    const view = careWorkspaceView();
    const input = view.all((node) => node.getAttribute('id') === 'workspace-task-intake')[0];
    input.checked = true;
    input.listeners.change({ target: input });
    assert.deepEqual(getCareWorkspaceState().checked, ['intake']);
    assert.match(find(view, 'pre').textContent, /\[x\] Checked: Call the receiving service/);
    assert.match(view.all((node) => node.className === 'workspace-progress')[0].textContent, /^1 of /);
    resetCareWorkspaceState();
    assert.equal(input.checked, false);
    assert.doesNotMatch(find(view, 'pre').textContent, /\[x\]/);
    assert.match(view.all((node) => node.className === 'workspace-progress')[0].textContent, /^0 of /);
  });
});

test('copy and print run only after explicit action and copy only fixed checklist text', async () => {
  let copied = null;
  await withDom(async () => {
    const view = careWorkspaceView();
    assert.equal(copied, null);
    assert.equal(window.printed, undefined);
    await find(view, 'button', 'Copy checklist').listeners.click();
    assert.equal(copied, formatCareWorkspaceSummary());
    const status = view.all((node) => node.getAttribute('role') === 'status')[0];
    assert.match(status.textContent, /Checklist copied/);
    find(view, 'button', 'Print checklist').listeners.click();
    assert.equal(window.printed, true);
    find(view, 'button', 'Reset for the next person').listeners.click();
    assert.match(status.textContent, /All tasks are unchecked/);
  }, { writeText: async (text) => { copied = text; } });
});

test('clipboard failure has a readable fallback and a late copy result does not override a reset', async () => {
  await withDom(async () => {
    const view = careWorkspaceView();
    await find(view, 'button', 'Copy checklist').listeners.click();
    assert.match(view.all((node) => node.getAttribute('role') === 'status')[0].textContent, /Select the checklist text/);
  }, { writeText: async () => { throw new Error('Unavailable'); } });
  let completeCopy;
  await withDom(async () => {
    const view = careWorkspaceView();
    const pending = find(view, 'button', 'Copy checklist').listeners.click();
    find(view, 'button', 'Reset for the next person').listeners.click();
    completeCopy();
    await pending;
    assert.match(view.all((node) => node.getAttribute('role') === 'status')[0].textContent, /All tasks are unchecked/);
  }, { writeText: () => new Promise((resolve) => { completeCopy = resolve; }) });
});

test('Spanish renders all workspace content, including dynamic task labels and summary status', async () => {
  useDictionary('es', esWorkspace);
  setCareWorkspaceTask('intake', true);
  const summary = formatCareWorkspaceSummary();
  assert.match(summary, /\[x\] Marcada: Llame al servicio receptor/);
  assert.match(summary, /\[ \] Sin marcar — necesita revisión/);
  assert.doesNotMatch(summary, /Not checked|Checklist actions|Call the receiving/);
  await withDom(() => {
    const view = careWorkspaceView();
    assert.equal(find(view, 'h1').textContent, esWorkspace['workspace.title']);
    assert.ok(find(view, 'button', esWorkspace['workspace.reset']));
    assert.match(find(view, 'pre').textContent, /Lista del equipo de atención/);
  });
});

test('Spanish module covers direct and metadata translation keys with matching placeholders', () => {
  const source = readFileSync(new URL('../public/js/views/workspace.js', import.meta.url), 'utf8');
  const direct = [...source.matchAll(/t\(\s*'([^']+)'\s*,\s*'((?:[^'\\]|\\.)*)'/g)];
  for (const [, key, fallback] of direct) {
    assert.equal(typeof esWorkspace[key], 'string', key);
    assert.deepEqual([...esWorkspace[key].matchAll(/\{\w+\}/g)].map((match) => match[0]).sort(), [...fallback.matchAll(/\{\w+\}/g)].map((match) => match[0]).sort(), key);
  }
  for (const stage of CARE_WORKSPACE_STAGES) {
    for (const key of [stage.titleKey, stage.descriptionKey, ...stage.tasks.map((task) => task.key), ...stage.links.map((link) => link.key)]) assert.ok(esWorkspace[key]?.trim(), key);
  }
});
