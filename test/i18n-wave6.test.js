import test from 'node:test';
import assert from 'node:assert/strict';

import { useDictionary, getLang, t } from '../public/js/i18n.js';
import es from '../public/js/locales/es.js';
import esClinical from '../public/js/locales/es-clinical.js';

import {
  STAGES_OF_CHANGE,
  READINESS_STATEMENTS,
  LIKERT_OPTIONS,
  DECISIONAL_BALANCE_PROMPTS,
  CRAFT_GUIDANCE,
  calculateReadinessStage,
  getReadinessState,
  setReadinessState,
  resetReadinessState,
  formatReadinessSummaryText,
  readinessView,
} from '../public/js/views/readiness.js';

import {
  RESCUE_PACING_STEPS,
  overdosePacer,
  getOverdosePacerState,
  setOverdosePacerStep,
  resetOverdosePacer,
} from '../public/js/components/overdosePacing.js';

// ============================================================================
// Lightweight MockNode for DOM tests in Node test environment
// ============================================================================
class MockClassList {
  constructor(node) {
    this.node = node;
  }
  _classes() {
    return (this.node.className || '').split(/\s+/).filter(Boolean);
  }
  add(...tokens) {
    const list = this._classes();
    for (const token of tokens) {
      if (token && !list.includes(token)) list.push(token);
    }
    this.node.className = list.join(' ');
  }
  remove(...tokens) {
    const list = this._classes().filter((c) => !tokens.includes(c));
    this.node.className = list.join(' ');
  }
  contains(token) {
    return this._classes().includes(token);
  }
  toggle(token, force) {
    const has = this.contains(token);
    const should = force !== undefined ? Boolean(force) : !has;
    if (should) this.add(token);
    else this.remove(token);
    return should;
  }
}

class MockNode {
  constructor(tag) {
    this.tagName = tag ? String(tag).toUpperCase() : 'DIV';
    this.className = '';
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.children = [];
    this.value = '';
    this.checked = false;
    this.hidden = false;
    this._textContent = '';
    this.classList = new MockClassList(this);
    this.parent = null;
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  get textContent() {
    if (this.children.length === 0) return this._textContent;
    return this._textContent + this.children.map((c) => (typeof c === 'string' ? c : c.textContent)).join('');
  }

  set textContent(v) {
    this._textContent = String(v ?? '');
    this.children = [];
  }

  setAttribute(k, v) {
    const val = String(v);
    this.attributes[k] = val;
    if (k === 'class') this.className = val;
  }

  getAttribute(k) {
    if (k === 'class') return this.className || this.attributes.class || null;
    return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null;
  }

  removeAttribute(k) {
    delete this.attributes[k];
  }

  addEventListener(evt, fn) {
    this.listeners[evt] = fn;
  }

  dispatchEvent(evt, data = {}) {
    const name = typeof evt === 'string' ? evt : evt?.type;
    const fn = this.listeners[name];
    if (typeof fn === 'function') {
      fn({ target: this, currentTarget: this, ...data });
    }
  }

  click() {
    this.dispatchEvent({ type: 'click' });
  }

  append(...items) {
    for (const item of items) {
      if (item === null || item === undefined || item === false) continue;
      if (typeof item === 'string' || typeof item === 'number') {
        const textNode = new MockNode('#text');
        textNode._textContent = String(item);
        textNode.parent = this;
        this.children.push(textNode);
      } else if (item instanceof MockNode) {
        item.parent = this;
        this.children.push(item);
      }
    }
  }

  remove() {
    if (!this.parent) return;
    const idx = this.parent.children.indexOf(this);
    if (idx >= 0) this.parent.children.splice(idx, 1);
    this.parent = null;
  }

  findAll(predicate, acc = []) {
    if (predicate(this)) acc.push(this);
    for (const ch of this.children) {
      if (ch instanceof MockNode) ch.findAll(predicate, acc);
    }
    return acc;
  }

  querySelectorAll(sel) {
    const isTag = /^[a-z]+$/i.test(sel);
    const isClass = sel.startsWith('.');
    return this.findAll((n) => {
      if (isTag) return n.tagName === sel.toUpperCase();
      if (isClass) return n.classList.contains(sel.slice(1));
      if (sel.includes('[name=') && sel.includes(']')) {
        const match = sel.match(/\[name=["']?([^"'\]]+)["']?\]/);
        if (match && n.getAttribute('name') === match[1]) return true;
      }
      if (sel.includes('[role=') && sel.includes(']')) {
        const match = sel.match(/\[role=["']?([^"'\]]+)["']?\]/);
        if (match && n.getAttribute('role') === match[1]) return true;
      }
      return false;
    });
  }

  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null;
  }
}

function withMockDom(fn) {
  const prevDoc = globalThis.document;
  const prevNode = globalThis.Node;

  globalThis.Node = MockNode;
  globalThis.document = {
    createElement: (tag) => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: () => null,
  };

  try {
    return fn();
  } finally {
    globalThis.document = prevDoc;
    globalThis.Node = prevNode;
  }
}

// ============================================================================
// 1. Spanish Dictionary Integrity & Wave 6 Translation Keys
// ============================================================================

test('Wave 6: es-clinical.js exports complete readiness and overdose pacing translation keys', () => {
  const expectedPrefixes = ['readiness.', 'pacer.'];
  const readinessKeys = Object.keys(esClinical).filter((k) => k.startsWith('readiness.'));
  const pacerKeys = Object.keys(esClinical).filter((k) => k.startsWith('pacer.'));

  assert.ok(readinessKeys.length >= 70, `Expected >=70 readiness keys, got ${readinessKeys.length}`);
  assert.ok(pacerKeys.length >= 60, `Expected >=60 pacer keys, got ${pacerKeys.length}`);

  // Check all keys in esClinical are non-empty strings
  for (const [key, val] of Object.entries(esClinical)) {
    assert.equal(typeof val, 'string', `Key ${key} must have string translation`);
    assert.ok(val.trim().length > 0, `Key ${key} must not be empty`);
  }

  // Check that es.js spreads esClinical keys
  for (const key of readinessKeys) {
    assert.equal(es[key], esClinical[key], `Missing spread key in es.js: ${key}`);
  }
  for (const key of pacerKeys) {
    assert.equal(es[key], esClinical[key], `Missing spread key in es.js: ${key}`);
  }

  // Emergency numbers preservation: 911, 988, Never Use Alone line
  assert.ok(esClinical['readiness.privacy.body'].includes('RAM'));
  assert.ok(esClinical['readiness.stage.precontemplation.step3'].includes('800-484-3731'));
  assert.ok(esClinical['pacer.step1.ins4'].includes('911'));
  assert.ok(esClinical['pacer.call911'].includes('911'));
});

// ============================================================================
// 2. Readiness View & Stages of Change in Spanish (es-US)
// ============================================================================

test('Wave 6: readinessView renders authentic clinical Spanish strings when lang is es', () => {
  useDictionary('es', es);
  assert.equal(getLang(), 'es');

  withMockDom(() => {
    resetReadinessState();
    const root = readinessView();
    const text = root.textContent;

    // Header & Privacy
    assert.match(text, /Preparación y etapas del cambio/);
    assert.match(text, /Garantía de privacidad 100% efímera en memoria RAM/);

    // Settings Card
    assert.match(text, /1\. ¿Qué está explorando hoy\?/);
    assert.match(text, /Alcohol \(Cerveza, vino, licor\)/);
    assert.match(text, /Opioides \(Fentanilo, heroína, oxicodona, pastillas\)/);
    assert.match(text, /Estimulantes \(Metanfetamina, cocaína, crack\)/);
    assert.match(text, /¿Quién está completando esto\?/);
    assert.match(text, /Explorando para mí \(Autorreflexión\)/);

    // Live Summary Card
    assert.match(text, /Resumen en vivo de preparación y etapa del cambio/);
    assert.match(text, /Puntuación de preparación:/);
    assert.match(text, /Perspectiva de motivación y apoyo/);
    assert.match(text, /Próximos pasos recomendados/);
    assert.match(text, /¿Tuvo un desliz o retorno al consumo\?/);
    assert.match(text, /Ver orientación de recurrencia y seguridad ante sobredosis/);

    // URICA 8-item assessment section
    assert.match(text, /2\. Evaluación de preparación \(Inspirada en URICA\)/);
    assert.match(text, /No hay respuestas correctas ni incorrectas/);
    assert.match(text, /Afirmación 1:/);
    assert.match(text, /Totalmente en desacuerdo/);
    assert.match(text, /Totalmente de acuerdo/);

    // Decisional Balance Matrix (Pros and Cons)
    assert.match(text, /3\. Herramienta de balance decisional \(Matriz de pros y contras\)/);
    assert.match(text, /Lo que me gusta de consumir/);
    assert.match(text, /Lo que es difícil o preocupante/);
    assert.match(text, /Lo que mejoraría si las cosas cambiaran/);
    assert.match(text, /Lo que se siente difícil de cambiar/);

    // CRAFT Guidance
    assert.match(text, /4\. Orientación para familias y seres queridos \(Principios CRAFT\)/);
    assert.match(text, /Estrategias de comunicación positiva/);
    assert.match(text, /Límites no punitivos y consecuencias naturales/);
    assert.match(text, /Autocuidado y seguridad para aliados y personas de apoyo/);

    // Action buttons
    assert.match(text, /Copiar resumen de preparación/);
    assert.match(text, /Imprimir folleto/);
    assert.match(text, /Borrar todas las respuestas \(Limpieza de RAM\)/);
    assert.match(text, /Buscar opciones de tratamiento/);
    assert.match(text, /Reducción de daños y suministros/);

    // Interactive Recurrence toggle in Spanish
    const slipBtn = root.findAll((n) => n.tagName === 'BUTTON' && n.textContent.includes('orientación de recurrencia'))[0];
    assert.ok(slipBtn, 'Recurrence toggle button must be rendered with Spanish label');
    slipBtn.dispatchEvent('click');
    assert.equal(getReadinessState().recentSlip, true);
    assert.match(slipBtn.textContent, /Salir del modo de recurrencia/);
  });

  useDictionary('en', {});
});

test('Wave 6: calculateReadinessStage and formatReadinessSummaryText output clinical Spanish when lang is es', () => {
  useDictionary('es', es);
  assert.equal(getLang(), 'es');

  const answers = {
    s1: 1,
    s2: 1,
    s3: 4,
    s4: 4,
    s5: 5,
    s6: 5,
    s7: 3,
    s8: 1,
    substance: 'opioids',
  };

  const stage = calculateReadinessStage(answers);
  assert.equal(stage.stage, 'preparation');
  assert.match(stage.title, /Preparación/i);
  assert.match(stage.plainLanguageTitle, /Listo\/a para tomar medidas pronto/i);
  assert.match(stage.clinicalGoal, /Diseñar conjuntamente un plan de cambio/i);
  assert.ok(stage.recommendedNextSteps.some((step) => step.includes('buprenorfina') || step.includes('metadona')));

  const summary = formatReadinessSummaryText({
    substance: 'opioids',
    customSubstance: 'fentanilo',
    assessorRole: 'individual',
    answers,
    decisionalBalance: {
      likes: ['Alivio de la ansiedad, el estrés o el dolor emocional intenso'],
      concerns: ['Miedo a una sobredosis accidental, intoxicación o cortes peligrosos (fentanilo, xilacina)'],
      positives: ['Mayor energía física, pensamiento más claro y mejor salud en general'],
      hurdles: ['Miedo a los síntomas físicos de abstinencia o a sentirme terriblemente enfermo/a'],
    },
    notes: 'Quiero preguntar sobre buprenorfina en clínica comunitaria.',
  });

  assert.match(summary, /HARBORPATH: RESUMEN DE PREPARACIÓN Y ETAPAS DEL CAMBIO/);
  assert.match(summary, /1\. ETAPA ACTUAL DEL CAMBIO Y PERSPECTIVA DE MOTIVACIÓN/);
  assert.match(summary, /2\. BALANCE DECISIONAL \(MATRIZ DE PROS Y CONTRAS\)/);
  assert.match(summary, /4\. AVISO CLÍNICO Y ÉTICO \(SOLO AUTORREPORTE\)/);
  assert.match(summary, /5\. LÍNEAS DE CRISIS Y APOYO CONFIDENCIAL 24\/7 INMEDIATO/);
  assert.match(summary, /988/);
  assert.match(summary, /Never Use Alone/);

  useDictionary('en', {});
});

// ============================================================================
// 3. Overdose Pacing Assistant in Spanish (es-US)
// ============================================================================

test('Wave 6: overdosePacer renders authentic clinical Spanish strings when lang is es', () => {
  useDictionary('es', es);
  assert.equal(getLang(), 'es');

  withMockDom(() => {
    resetOverdosePacer();
    const pacerRoot = overdosePacer();
    const text = pacerRoot.textContent;

    // Header & Main Controls
    assert.match(text, /Asistente de ritmo para el rescate en sobredosis/);
    assert.match(text, /Modo de movimiento reducido/);
    assert.match(text, /Reiniciar asistente/);

    // Stepper Tabs in Spanish
    assert.match(text, /Frote esternal y verificación de respuesta/);
    assert.match(text, /Primera administración de naloxona/);
    assert.match(text, /Metrónomo de respiración de rescate/);
    assert.match(text, /Reloj de evaluación de re-dosificación a 2-3 minutos/);
    assert.match(text, /Posición de recuperación y observación post-reversión/);

    // Step 1: Responsiveness Check
    assert.match(text, /Sin respuesta al gritar ni al frote firme en el esternón/);
    assert.match(text, /Llamar al 911 de inmediato/);
    assert.match(text, /Víctima no responde — Pasar a naloxona \(Paso 2\)/);

    // Advance to Step 2
    setOverdosePacerStep(2);
    const step2Text = pacerRoot.textContent;
    assert.match(step2Text, /Aerosol nasal de 4 mg en 1 fosa nasal, o inyección IM de 0.4 mg/);
    assert.match(step2Text, /Fosa nasal derecha \(Estándar\)/);
    assert.match(step2Text, /Fosa nasal izquierda/);
    assert.match(step2Text, /Administrar 1\.ª dosis e iniciar temporizadores \(Pasar al Paso 3\)/);

    // Advance to Step 3 (Metronome)
    setOverdosePacerStep(3);
    const step3Text = pacerRoot.textContent;
    assert.match(step3Text, /1 respiración cada 5 segundos \(12 respiraciones por minuto\)/);
    assert.match(step3Text, /Respiraciones administradas:/);
    assert.match(step3Text, /Cadencia de ritmo:/);
    assert.match(step3Text, /Iniciar metrónomo/);
    assert.match(step3Text, /ALERTA CRÍTICA: Síndrome de "Tórax de Madera" por Fentanilo/);
    assert.match(step3Text, /Revisar reloj de re-dosificación de 2 a 3 min \(Paso 4\)/);
    assert.match(step3Text, /Víctima reanudó respiración normal -> Paso 5/);

    // Advance to Step 4 (Re-dosing clock & Xylazine caution)
    setOverdosePacerStep(4);
    const step4Text = pacerRoot.textContent;
    assert.match(step4Text, /Cuenta regresiva para la evaluación de re-dosificación:/);
    assert.match(step4Text, /Transcurrido desde la 1\.ª dosis:/);
    assert.match(step4Text, /Administración de la segunda dosis \(Fosa nasal opuesta\)/);
    assert.match(step4Text, /Administrar segunda dosis de 4 mg en la fosa nasal OPUESTA/);
    assert.match(step4Text, /ADVERTENCIA CRÍTICA: NO DESCARGUE DOSIS REPETIDAS DE NALOXONA ANTE LA SEDACIÓN POR XILACINA/);
    assert.match(step4Text, /Respiración normal reanudada -> Pasar a posición de recuperación \(Paso 5\)/);

    // Advance to Step 5 (Recovery Position & Renarconization risk)
    setOverdosePacerStep(5);
    const step5Text = pacerRoot.textContent;
    assert.match(step5Text, /Posición de decúbito lateral izquierdo para mantener la vía aérea despejada/);
    assert.match(step5Text, /Gire a la persona sobre su lado IZQUIERDO/);
    assert.match(step5Text, /ALERTA CRÍTICA: Riesgo de renarconización \(reaparición secundaria de opioides\)/);
    assert.match(step5Text, /Completar protocolo de rescate/);
  });

  useDictionary('en', {});
});
