/**
 * Interactive Test Strip Dilution Simulator & Result Visualizer
 *
 * Pharmacologist-vetted clinical drug checking calculator for fentanyl and xylazine
 * immunoassay test strips. Provides:
 * 1. Substance-specific water dilution protocols (stimulants, opioids, pressed pills, empty residue).
 * 2. Interactive procedural timers (15s immersion dip and 2-to-5 minute flat incubation).
 * 3. Visual result interpretation decoder (positive, negative, invalid with critical caveats).
 * 4. 100% ephemeral in-RAM state management (never writes drug checking data to storage or URLs).
 *
 * Clinical sources:
 * - DanceSafe Fentanyl & Xylazine Test Strip Instructions (2024)
 * - SAMHSA Drug Checking Guidelines & Test Strip Guidance
 * - CDC Overdose Prevention & Fentanyl Test Strip Instructions
 * - UNC Street Drug Analysis Lab Dilution & Cross-Reactivity Standards
 */

import { h, clear, icon, announce } from '../dom.js';
import { getLang } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetTestStripState);

const tr = (en, es) => (getLang() === 'es' ? es : en);
const p = (...children) => h('p', null, ...children);

/**
 * Substance-Specific Dilution Protocols
 */
export const DILUTION_PROTOCOLS = {
  stimulants: {
    id: 'stimulants',
    name: 'Methamphetamine / MDMA / Stimulants',
    nameEs: 'Metanfetamina / MDMA / Estimulantes',
    category: 'stimulant',
    crossReactivityRisk: true,
    standardRatioPer10mgMl: 5.0,
    standardWaterMeasure: '1 full teaspoon (5 mL)',
    standardWaterMeasureEs: '1 cucharadita completa (5 mL)',
    fullDoseRatioPer100mgMl: 120.0,
    fullDoseWaterMeasure: '1/2 cup (120 mL)',
    fullDoseWaterMeasureEs: '1/2 taza (120 mL)',
    crossReactivityWarning:
      'High concentration causes false-positive antibody cross-reactivity. Requires at least 1 full teaspoon (5 mL) of water per 10 mg of residue, or 1/2 cup (120 mL) of water if testing a full 100 mg baggie/dose.',
    crossReactivityWarningEs:
      'La alta concentración causa reactividad cruzada de anticuerpos y falsos positivos. Requiere al menos 1 cucharadita completa (5 mL) de agua por cada 10 mg de residuo, o 1/2 taza (120 mL) de agua si se prueba una bolsa o dosis completa de 100 mg.',
    instructions: [
      'Sample scraping: Measure at least 10 mg of residue (about the size of a match head) or prepare testing a full 100 mg dose/baggie.',
      'Dilution volume: Add at least 1 full teaspoon (5 mL) of clean water for 10 mg of residue, or 1/2 cup (120 mL) of water if testing a full 100 mg baggie/dose.',
      'Dissolution: Stir thoroughly until all stimulant crystals are completely dissolved. Under-diluted stimulants trigger false positives.',
    ],
    instructionsEs: [
      'Raspado de muestra: Mida al menos 10 mg de residuo (tamaño cabeza de fósforo) o prepare la prueba de una dosis/bolsa de 100 mg.',
      'Volumen de dilución: Añada al menos 1 cucharadita completa (5 mL) de agua limpia por cada 10 mg de residuo, o 1/2 taza (120 mL) de agua para una bolsa/dosis de 100 mg.',
      'Disolución: Revuelva bien hasta disolver los cristales por completo. La dilución insuficiente produce falsos positivos.',
    ],
  },
  opioids: {
    id: 'opioids',
    name: 'Opioids / Fentanyl / Powders',
    nameEs: 'Opioides / Fentanilo / Polvos',
    category: 'opioid',
    crossReactivityRisk: false,
    standardRatioPer10mgMl: 2.5,
    standardWaterMeasure: '1/2 teaspoon (2.5 mL)',
    standardWaterMeasureEs: '1/2 cucharadita (2.5 mL)',
    fullDoseRatioPer100mgMl: 25.0,
    fullDoseWaterMeasure: '5 teaspoons (25 mL)',
    fullDoseWaterMeasureEs: '5 cucharaditas (25 mL)',
    crossReactivityWarning: null,
    crossReactivityWarningEs: null,
    instructions: [
      'Sample scraping: Place a small 10 mg powder scraping into a clean, dry cup or cooker.',
      'Dilution volume: Add standard dilution of 1/2 teaspoon (2.5 mL) of clean water per 10 mg of powder.',
      'Dissolution: Stir gently to ensure uniform dissolution. Fentanyl dissolves rapidly in water.',
    ],
    instructionsEs: [
      'Raspado de muestra: Coloque una pequeña muestra raspada de 10 mg de polvo en un vaso o recipiente limpio y seco.',
      'Volumen de dilución: Añada una dilución estándar de 1/2 cucharadita (2.5 mL) de agua limpia por cada 10 mg de polvo.',
      'Disolución: Revuelva suavemente para lograr una disolución uniforme.',
    ],
  },
  pills: {
    id: 'pills',
    name: 'Pressed Counterfeit Pills',
    nameEs: 'Pastillas prensadas falsificadas',
    category: 'pill',
    crossReactivityRisk: false,
    standardRatioPer10mgMl: 2.5,
    standardWaterMeasure: '1/2 teaspoon (2.5 mL)',
    standardWaterMeasureEs: '1/2 cucharadita (2.5 mL)',
    fullDoseRatioPer100mgMl: 25.0,
    fullDoseWaterMeasure: '5 teaspoons (25 mL)',
    fullDoseWaterMeasureEs: '5 cucharaditas (25 mL)',
    crossReactivityWarning: null,
    crossReactivityWarningEs: null,
    crushWarning:
      'Crush thoroughly into powder before sampling a 10 mg scraping. Fentanyl hot spots clump unevenly ("chocolate chip cookie effect")!',
    crushWarningEs:
      'Triture completamente hasta obtener polvo fino antes de tomar un raspado de 10 mg. Las zonas de fentanilo se concentran de manera desigual ("efecto galleta con chispas de chocolate").',
    instructions: [
      'Crush thoroughly: Crush the entire pill into a fine, uniform powder. Testing an uncrushed crumb can miss a concentrated fentanyl hotspot.',
      'Sample scraping: Take a 10 mg scraping of the well-mixed powder.',
      'Dilution volume: Dissolve the 10 mg scraping in 1/2 teaspoon (2.5 mL) of clean water.',
    ],
    instructionsEs: [
      'Triture completamente: Pulverice la pastilla entera hasta obtener polvo homogéneo para evitar no detectar un punto concentrado de fentanilo.',
      'Raspado de muestra: Tome un raspado de 10 mg del polvo bien mezclado.',
      'Volumen de dilución: Disuelva el raspado de 10 mg en 1/2 cucharadita (2.5 mL) de agua limpia.',
    ],
  },
  residue: {
    id: 'residue',
    name: 'Empty Baggies / Cookers',
    nameEs: 'Bolsas vacías / Cookers con residuo',
    category: 'residue',
    crossReactivityRisk: false,
    standardRatioPer10mgMl: 2.5,
    standardWaterMeasure: 'A few drops to 1/2 teaspoon water',
    standardWaterMeasureEs: 'Unas pocas gotas a 1/2 cucharadita de agua',
    fullDoseRatioPer100mgMl: 2.5,
    fullDoseWaterMeasure: 'A few drops to 1/2 teaspoon water',
    fullDoseWaterMeasureEs: 'Unas pocas gotas a 1/2 cucharadita de agua',
    crossReactivityWarning: null,
    crossReactivityWarningEs: null,
    instructions: [
      'Add water: Add a few drops to 1/2 teaspoon water directly into the empty baggie, vial, or cooker.',
      'Swirl thoroughly: Swirl the liquid around all inner corners and folds to wash and dissolve residual powder dust.',
      'Dip strip: Dip the wavy absorption end directly into the pooled liquid.',
    ],
    instructionsEs: [
      'Añada agua: Agregue unas pocas gotas a 1/2 cucharadita de agua directamente en la bolsa o recipiente.',
      'Enjuague bien: Mueva el agua por todas las esquinas y pliegues para disolver el polvo residual.',
      'Sumerja la tira: Sumerja la punta absorbente directamente en el líquido acumulado.',
    ],
  },
};

/**
 * Visual Result Interpretation Decoder Definitions
 */
export const TEST_STRIP_INTERPRETATIONS = {
  positive: {
    id: 'positive',
    lines: 1,
    lineCountLabel: '1 Line',
    lineCountLabelEs: '1 Línea',
    lineDescription: 'Control line only (C line present, T line absent)',
    lineDescriptionEs: 'Solo línea de control (línea C presente, línea T ausente)',
    result: 'POSITIVE',
    resultEs: 'POSITIVO',
    title: '1 Line (Control line only): POSITIVE for fentanyl or xylazine',
    titleEs: '1 Línea (Solo línea de control): POSITIVO para fentanilo o xilacina',
    summary: 'POSITIVE for fentanyl or xylazine. High risk of fatal overdose.',
    summaryEs: 'POSITIVO para fentanilo o xilacina. Alto riesgo de sobredosis fatal.',
    hasControlLine: true,
    hasTestLine: false,
    badgeClass: 'chip-emergency',
    alertClass: 'callout-emergency',
    actionSteps: [
      'High risk of fatal overdose: Fentanyl or xylazine was detected in the tested sample.',
      'Warning: Do NOT use alone. Call Never Use Alone (800-484-3731) or ensure a trusted friend is with you.',
      'Carry naloxone (Narcan): Have at least two 4mg doses immediately accessible and in clear sight.',
      'Use a smaller test dose: Try a micro-dose or slow titration first to gauge potency and respiratory effect.',
      'Deliver rescue breaths if breathing slows or stops: 1 breath every 5 seconds; call 911 immediately.',
    ],
    actionStepsEs: [
      'Alto riesgo de sobredosis fatal: Se detectó fentanilo o xilacina en la muestra.',
      'Advertencia: NO consuma a solas. Llame a Never Use Alone (800-484-3731) o esté acompañado.',
      'Lleve naloxona (Narcan): Tenga al menos dos dosis de 4 mg a su alcance inmediato.',
      'Use una dosis de prueba más pequeña: Pruebe una micro-dosis antes de consumir más.',
      'Dé respiraciones de rescate si la respiración se detiene: 1 respiración cada 5 segundos; llame al 911.',
    ],
  },
  negative: {
    id: 'negative',
    lines: 2,
    lineCountLabel: '2 Lines',
    lineCountLabelEs: '2 Líneas',
    lineDescription: 'Control + Test lines, even if faint',
    lineDescriptionEs: 'Líneas de control + prueba, incluso si es tenue',
    result: 'NEGATIVE',
    resultEs: 'NEGATIVO',
    title: '2 Lines (Control + Test lines, even if faint): NEGATIVE',
    titleEs: '2 Líneas (Control + prueba, incluso si es tenue): NEGATIVO',
    summary: 'NEGATIVE (below detection threshold). Critical caveats apply.',
    summaryEs: 'NEGATIVO (por debajo del umbral de detección). Aplican advertencias críticas.',
    hasControlLine: true,
    hasTestLine: true,
    badgeClass: 'chip-ok',
    alertClass: 'callout-info',
    actionSteps: [
      'Negative result: Drug target was below detection threshold. Even a faint second line counts as negative.',
      'Critical caveat ("Chocolate chip cookie effect"): Fentanyl clumps unevenly in pills and powder batches. A negative test on a single scraping does not guarantee the rest of the pill or bag is safe.',
      'Critical caveat (Emerging synthetic analogues): Immunoassay strips do NOT detect all novel compounds, such as ultra-potent nitazenes (protonitazene, isotonitazene) or novel synthetic sedatives.',
      'Protective measures: A negative test does NOT guarantee 100% safety. Always carry naloxone and avoid using alone.',
    ],
    actionStepsEs: [
      'Resultado negativo: El compuesto estuvo por debajo del umbral de detección. Incluso una segunda línea tenue es negativo.',
      'Advertencia crítica ("Efecto galleta con chispas de chocolate"): El fentanilo se agrupa desigualmente en pastillas y polvos; un raspado negativo no garantiza que el resto esté libre de fentanilo.',
      'Advertencia crítica (Análogos sintéticos emergentes): Las tiras reactivas NO detectan todos los compuestos nuevos, como los nitazenos ultra-potentes ni sedantes sintéticos novedosos.',
      'Medidas de protección: Un resultado negativo NO garantiza seguridad absoluta. Lleve siempre naloxona y no consuma a solas.',
    ],
  },
  invalid: {
    id: 'invalid',
    lines: 0,
    lineCountLabel: '0 Lines or Test line only',
    lineCountLabelEs: '0 Líneas o solo línea de prueba',
    lineDescription: 'No lines visible, or Test line visible without Control line',
    lineDescriptionEs: 'Sin líneas visibles, o solo línea de prueba sin control',
    result: 'INVALID',
    resultEs: 'NO VÁLIDO',
    title: '0 Lines or Test line only: INVALID test result',
    titleEs: '0 Líneas o solo línea de prueba: Resultado NO VÁLIDO',
    summary: 'INVALID. Test failed; retest with a fresh strip and clean cup.',
    summaryEs: 'NO VÁLIDO. La prueba falló; repita con una tira nueva y recipiente limpio.',
    hasControlLine: false,
    hasTestLine: false,
    badgeClass: 'chip-warn',
    alertClass: 'callout-warn',
    actionSteps: [
      'Test strip failure: The control line (C) failed to appear. The test is invalid and results cannot be trusted.',
      'Do not assume the sample is safe: An invalid test provides zero drug safety information.',
      'Retest immediately: Discard this strip and retest using a fresh test strip, clean water, and a clean cup.',
      'Procedural check: Immerse the wavy absorption tip for the full 15 seconds without submerging past the MAX line.',
    ],
    actionStepsEs: [
      'Falla de la tira: La línea de control (C) no apareció. La prueba no es válida y no se puede confiar en ella.',
      'No asuma que la muestra es segura: Una prueba inválida no brinda información sobre el contenido.',
      'Repita de inmediato: Deseche la tira y vuelva a probar con una tira nueva, agua limpia y vaso limpio.',
      'Verificación del procedimiento: Sumerja la punta durante 15 segundos completos sin sobrepasar la línea MAX.',
    ],
  },
};

/**
 * Calculates water dilution ratios and measurements based on substance and amount.
 */
export function calculateDilutionRatio({ substance = 'opioids', amountMg = 10 } = {}) {
  const normSubstance = String(substance || '').toLowerCase().trim();
  let protocolKey = 'opioids';
  if (/meth|stim|mdma|speed|amphet|cocaine/.test(normSubstance)) {
    protocolKey = 'stimulants';
  } else if (/pill|press|counterfeit|tablet/.test(normSubstance)) {
    protocolKey = 'pills';
  } else if (/bag|cooker|residue|empty/.test(normSubstance)) {
    protocolKey = 'residue';
  } else if (/opioid|fentanyl|powder|heroin|tranq/.test(normSubstance)) {
    protocolKey = 'opioids';
  }

  const protocol = DILUTION_PROTOCOLS[protocolKey];
  const mg = Number(amountMg) > 0 ? Number(amountMg) : 10;

  let waterMl = 2.5;
  let waterMeasure = '1/2 teaspoon (2.5 mL)';
  let waterMeasureEs = '1/2 cucharadita (2.5 mL)';

  if (protocolKey === 'stimulants') {
    if (mg >= 100) {
      // 1/2 cup (120 mL) for 100 mg full dose/baggie
      waterMl = (mg / 100) * 120.0;
      if (mg === 100) {
        waterMeasure = '1/2 cup (120 mL)';
        waterMeasureEs = '1/2 taza (120 mL)';
      } else {
        const cups = (waterMl / 240).toFixed(2);
        waterMeasure = `${cups} cups (${Math.round(waterMl)} mL)`;
        waterMeasureEs = `${cups} tazas (${Math.round(waterMl)} mL)`;
      }
    } else {
      // At least 1 full teaspoon (5 mL) per 10 mg of residue
      waterMl = (mg / 10) * 5.0;
      if (mg === 10) {
        waterMeasure = '1 full teaspoon (5 mL)';
        waterMeasureEs = '1 cucharadita completa (5 mL)';
      } else {
        const tsp = (waterMl / 5.0).toFixed(1);
        waterMeasure = `${tsp} teaspoons (${waterMl.toFixed(1)} mL)`;
        waterMeasureEs = `${tsp} cucharaditas (${waterMl.toFixed(1)} mL)`;
      }
    }
  } else if (protocolKey === 'residue') {
    waterMl = 2.5;
    waterMeasure = 'A few drops to 1/2 teaspoon water';
    waterMeasureEs = 'Unas pocas gotas a 1/2 cucharadita de agua';
  } else {
    // Opioids or Pressed Pills: standard 1/2 tsp (2.5 mL) per 10 mg
    waterMl = (mg / 10) * 2.5;
    if (mg === 10) {
      waterMeasure = '1/2 teaspoon (2.5 mL)';
      waterMeasureEs = '1/2 cucharadita (2.5 mL)';
    } else {
      const tsp = (waterMl / 5.0).toFixed(1);
      waterMeasure = `${tsp} teaspoons (${waterMl.toFixed(1)} mL)`;
      waterMeasureEs = `${tsp} cucharaditas (${waterMl.toFixed(1)} mL)`;
    }
  }

  return {
    substance: protocolKey,
    protocol,
    amountMg: mg,
    waterMl,
    waterMeasure,
    waterMeasureEs,
    waterTeaspoons: waterMl / 5.0,
    crossReactivityWarning: protocol.crossReactivityRisk,
    warningText: protocol.crossReactivityWarning || protocol.crushWarning || null,
    warningTextEs: protocol.crossReactivityWarningEs || protocol.crushWarningEs || null,
    instructions: protocol.instructions,
    instructionsEs: protocol.instructionsEs,
  };
}

/**
 * 100% Ephemeral In-RAM State Store
 */
function getInitialTestStripState() {
  return {
    substance: 'stimulants',
    amountMg: 10,
    dilution: calculateDilutionRatio({ substance: 'stimulants', amountMg: 10 }),
    dipTimer: {
      active: false,
      elapsedSeconds: 0,
      remainingSeconds: 15,
      completed: false,
    },
    incubationTimer: {
      active: false,
      elapsedSeconds: 0,
      targetSeconds: 120, // default 2 minutes (120s), option for 5 minutes (300s)
      remainingSeconds: 120,
      resultsReady: false,
      completed: false,
    },
    selectedInterpretation: null, // 'positive' | 'negative' | 'invalid' | null
  };
}

let testStripState = getInitialTestStripState();
let dipIntervalId = null;
let incubationIntervalId = null;
const subscribers = new Set();
let registeredResetCallback = null;

/**
 * Returns an immutable snapshot copy of ephemeral test strip state.
 */
export function getTestStripState() {
  return JSON.parse(JSON.stringify(testStripState));
}

/**
 * Wipes ephemeral in-RAM state completely and stops all active timers.
 */
export function resetTestStripState() {
  if (dipIntervalId) {
    clearInterval(dipIntervalId);
    dipIntervalId = null;
  }
  if (incubationIntervalId) {
    clearInterval(incubationIntervalId);
    incubationIntervalId = null;
  }
  testStripState = getInitialTestStripState();
  notifySubscribers();
  if (typeof registeredResetCallback === 'function') {
    try {
      registeredResetCallback();
    } catch {
      /* callback safety */
    }
  }
  return getTestStripState();
}

/**
 * Subscribes a listener to test strip state updates.
 */
export function subscribeTestStripState(listener) {
  if (typeof listener === 'function') {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  }
  return () => {};
}

function notifySubscribers() {
  const snapshot = getTestStripState();
  for (const listener of subscribers) {
    try {
      listener(snapshot);
    } catch {
      /* subscriber safety */
    }
  }
}

/**
 * Formats total seconds into MM:SS display format.
 */
export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Starts 15-second immersion dip timer.
 */
export function startDipTimer(options = {}) {
  if (dipIntervalId) {
    clearInterval(dipIntervalId);
    dipIntervalId = null;
  }
  testStripState.dipTimer.active = true;
  notifySubscribers();

  dipIntervalId = setInterval(() => {
    tickDipTimerStep(options);
  }, 1000);

  return getTestStripState();
}

/**
 * Deterministically steps the 15-second dip timer (ideal for unit testing).
 */
export function tickDipTimer(seconds = 1, options = {}) {
  const s = Math.max(1, Math.floor(Number(seconds) || 1));
  for (let i = 0; i < s; i++) {
    tickDipTimerStep(options);
  }
  return getTestStripState();
}

function tickDipTimerStep(options = {}) {
  if (testStripState.dipTimer.remainingSeconds > 0) {
    testStripState.dipTimer.elapsedSeconds += 1;
    testStripState.dipTimer.remainingSeconds -= 1;
  }
  if (testStripState.dipTimer.remainingSeconds <= 0) {
    testStripState.dipTimer.remainingSeconds = 0;
    testStripState.dipTimer.completed = true;
    testStripState.dipTimer.active = false;
    if (dipIntervalId) {
      clearInterval(dipIntervalId);
      dipIntervalId = null;
    }
    try {
      announce(tr('15-second immersion complete! Remove strip and lay flat.', '¡Inmersión de 15 segundos completa! Retire la tira y colóquela plana.'));
    } catch {}
    try {
      navigator?.vibrate?.([200, 100, 200]);
    } catch {}
    if (typeof options.onComplete === 'function') options.onComplete(getTestStripState());
  }
  if (typeof options.onTick === 'function') options.onTick(getTestStripState());
  notifySubscribers();
}

/**
 * Stops or pauses the 15-second dip timer.
 */
export function stopDipTimer() {
  if (dipIntervalId) {
    clearInterval(dipIntervalId);
    dipIntervalId = null;
  }
  testStripState.dipTimer.active = false;
  notifySubscribers();
  return getTestStripState();
}

/**
 * Resets the 15-second dip timer to its initial 15-second state.
 */
export function resetDipTimer() {
  if (dipIntervalId) {
    clearInterval(dipIntervalId);
    dipIntervalId = null;
  }
  testStripState.dipTimer.active = false;
  testStripState.dipTimer.elapsedSeconds = 0;
  testStripState.dipTimer.remainingSeconds = 15;
  testStripState.dipTimer.completed = false;
  notifySubscribers();
  return getTestStripState();
}

/**
 * Starts 2-to-5 minute flat incubation timer.
 */
export function startIncubationTimer(options = {}) {
  if (incubationIntervalId) {
    clearInterval(incubationIntervalId);
    incubationIntervalId = null;
  }
  testStripState.incubationTimer.active = true;
  notifySubscribers();

  incubationIntervalId = setInterval(() => {
    tickIncubationTimerStep(options);
  }, 1000);

  return getTestStripState();
}

/**
 * Deterministically steps the incubation timer.
 */
export function tickIncubationTimer(seconds = 1, options = {}) {
  const s = Math.max(1, Math.floor(Number(seconds) || 1));
  for (let i = 0; i < s; i++) {
    tickIncubationTimerStep(options);
  }
  return getTestStripState();
}

function tickIncubationTimerStep(options = {}) {
  testStripState.incubationTimer.elapsedSeconds += 1;
  const target = testStripState.incubationTimer.targetSeconds;
  testStripState.incubationTimer.remainingSeconds = Math.max(0, target - testStripState.incubationTimer.elapsedSeconds);

  // 2-minute mark: initial valid result threshold reached
  if (testStripState.incubationTimer.elapsedSeconds >= 120 && !testStripState.incubationTimer.resultsReady) {
    testStripState.incubationTimer.resultsReady = true;
    try {
      announce(tr('2 minutes reached: Results are now valid to read!', '¡2 minutos transcurridos: Los resultados ya son válidos para leer!'));
    } catch {}
    try {
      navigator?.vibrate?.([150, 100, 150]);
    } catch {}
    if (typeof options.onResultsReady === 'function') options.onResultsReady(getTestStripState());
  }

  // Target threshold reached
  if (testStripState.incubationTimer.elapsedSeconds >= target && !testStripState.incubationTimer.completed) {
    testStripState.incubationTimer.completed = true;
    testStripState.incubationTimer.active = false;
    if (incubationIntervalId) {
      clearInterval(incubationIntervalId);
      incubationIntervalId = null;
    }
    try {
      announce(tr('Incubation complete. Read strip now; do not evaluate after 10 minutes.', 'Incubación completada. Lea la tira ahora; no evalúe después de 10 minutos.'));
    } catch {}
    if (typeof options.onComplete === 'function') options.onComplete(getTestStripState());
  }

  if (typeof options.onTick === 'function') options.onTick(getTestStripState());
  notifySubscribers();
}

/**
 * Stops or pauses the incubation timer.
 */
export function stopIncubationTimer() {
  if (incubationIntervalId) {
    clearInterval(incubationIntervalId);
    incubationIntervalId = null;
  }
  testStripState.incubationTimer.active = false;
  notifySubscribers();
  return getTestStripState();
}

/**
 * Resets the incubation timer to initial state.
 */
export function resetIncubationTimer() {
  if (incubationIntervalId) {
    clearInterval(incubationIntervalId);
    incubationIntervalId = null;
  }
  testStripState.incubationTimer.active = false;
  testStripState.incubationTimer.elapsedSeconds = 0;
  testStripState.incubationTimer.remainingSeconds = testStripState.incubationTimer.targetSeconds;
  testStripState.incubationTimer.resultsReady = false;
  testStripState.incubationTimer.completed = false;
  notifySubscribers();
  return getTestStripState();
}

/**
 * Sets target incubation seconds (120 to 300).
 */
export function setIncubationTarget(targetSeconds = 120) {
  const t = Math.max(120, Math.min(300, Math.floor(Number(targetSeconds) || 120)));
  testStripState.incubationTimer.targetSeconds = t;
  testStripState.incubationTimer.remainingSeconds = Math.max(0, t - testStripState.incubationTimer.elapsedSeconds);
  if (testStripState.incubationTimer.elapsedSeconds >= t) {
    testStripState.incubationTimer.completed = true;
  }
  notifySubscribers();
  return getTestStripState();
}

/**
 * Updates substance selection and recalculates dilution.
 */
export function setSelectedSubstance(substanceKey) {
  const norm = String(substanceKey || '').toLowerCase();
  let key = 'opioids';
  if (/meth|stim|mdma|speed|amphet|cocaine/.test(norm)) key = 'stimulants';
  else if (/pill|press|counterfeit|tablet/.test(norm)) key = 'pills';
  else if (/bag|cooker|residue|empty/.test(norm)) key = 'residue';
  else if (/opioid|fentanyl|powder|heroin|tranq/.test(norm)) key = 'opioids';

  testStripState.substance = key;
  testStripState.dilution = calculateDilutionRatio({ substance: key, amountMg: testStripState.amountMg });
  notifySubscribers();
  return getTestStripState();
}

/**
 * Updates sample amount (mg) and recalculates dilution.
 */
export function setSampleAmount(amountMg) {
  const mg = Math.max(1, Math.floor(Number(amountMg) || 10));
  testStripState.amountMg = mg;
  testStripState.dilution = calculateDilutionRatio({ substance: testStripState.substance, amountMg: mg });
  notifySubscribers();
  return getTestStripState();
}

/**
 * Sets selected visual test result interpretation.
 */
export function setSelectedInterpretation(interpretationKey) {
  const norm = String(interpretationKey || '').toLowerCase();
  let key = null;
  if (/pos|1|one/.test(norm)) key = 'positive';
  else if (/neg|2|two/.test(norm)) key = 'negative';
  else if (/inv|0|zero|fail/.test(norm)) key = 'invalid';

  testStripState.selectedInterpretation = key;
  notifySubscribers();
  return getTestStripState();
}

/**
 * Interactive Test Strip Dilution Simulator & Result Visualizer Component
 */
export function testStripCalculator(props = {}) {
  const { onReset } = props;
  registeredResetCallback = onReset || null;
  const isEs = getLang() === 'es';

  const root = h('div', {
    class: 'card test-strip-calculator',
    id: 'test-strip-calculator',
    role: 'region',
    'aria-label': tr(
      'Test Strip Dilution Simulator & Result Visualizer',
      'Simulador de dilución y visualizador de tiras reactivas',
    ),
  });

  // Section Slots for reactive rendering
  const dilutionSlot = h('div', { id: 'strip-dilution-slot' });
  const dipTimerSlot = h('div', { id: 'strip-dip-timer-slot' });
  const incubationTimerSlot = h('div', { id: 'strip-incubation-timer-slot' });
  const interpretationSlot = h('div', { id: 'strip-interpretation-slot' });

  // ---------------------------------------------------------------------------
  // 1. Dilution Calculator Section Renderer
  // ---------------------------------------------------------------------------
  function renderDilutionSection() {
    clear(dilutionSlot);
    const d = testStripState.dilution;
    const isStimulant = d.substance === 'stimulants';
    const isPill = d.substance === 'pills';
    const isResidue = d.substance === 'residue';

    const substanceButtons = [
      { id: 'stimulants', label: tr('Meth / MDMA / Stimulants', 'Metanfetamina / MDMA / Estimulantes') },
      { id: 'opioids', label: tr('Opioids / Fentanyl / Powders', 'Opioides / Fentanilo / Polvos') },
      { id: 'pills', label: tr('Pressed Counterfeit Pills', 'Pastillas prensadas') },
      { id: 'residue', label: tr('Empty Baggies / Cookers', 'Bolsas vacías / Cookers') },
    ].map((item) => {
      const active = testStripState.substance === item.id;
      const btn = h('button', {
        type: 'button',
        class: 'preset substance-tab-btn',
        id: `strip-substance-${item.id}`,
        'aria-pressed': String(active),
        onclick: () => {
          setSelectedSubstance(item.id);
        },
      }, item.label);
      if (active) btn.setAttribute('aria-current', 'true');
      return btn;
    });

    const amountButtons = isResidue
      ? []
      : [
          { mg: 10, label: tr('10 mg (Standard Sample Scraping)', '10 mg (Raspado estándar)') },
          { mg: 100, label: tr('100 mg (Full Baggie / Dose)', '100 mg (Bolsa / Dosis completa)') },
        ].map((item) => {
          const active = testStripState.amountMg === item.mg;
          const btn = h('button', {
            type: 'button',
            class: 'preset amount-tab-btn',
            id: `strip-amount-${item.mg}mg`,
            'aria-pressed': String(active),
            onclick: () => {
              setSampleAmount(item.mg);
            },
          }, item.label);
          if (active) btn.setAttribute('aria-current', 'true');
          return btn;
        });

    dilutionSlot.append(
      h('div', { class: 'dilution-controls' },
        h('h4', null, icon('shield'), ' ', tr('1. Select Tested Substance Protocol', '1. Seleccione el protocolo de sustancia')),
        h('nav', {
          class: 'presets substance-presets no-print',
          'aria-label': tr('Select substance for test strip dilution', 'Seleccione la sustancia para dilución'),
        }, substanceButtons),

        amountButtons.length > 0
          ? h('div', { class: 'amount-presets-wrapper' },
              h('span', { class: 'field-label' }, tr('Sample size:', 'Tamaño de muestra:')), ' ',
              h('nav', {
                class: 'presets amount-presets no-print',
                'aria-label': tr('Select sample amount', 'Seleccione cantidad de muestra'),
              }, amountButtons),
            )
          : null,

        // Dilution Ratio Output Card
        h('div', { class: 'callout callout-info dilution-ratio-box' },
          h('p', { class: 'callout-title' },
            icon('info'), ' ',
            tr('Water dilution needed:', 'Agua requerida para dilución:'), ' ',
            h('strong', { class: 'water-measurement-highlight' }, isEs ? d.waterMeasureEs : d.waterMeasure),
          ),
          p(tr(
            `Dissolve ${isResidue ? 'trace residue' : `${d.amountMg} mg of substance`} in ${isEs ? d.waterMeasureEs : d.waterMeasure}.`,
            `Disuelva ${isResidue ? 'el residuo' : `${d.amountMg} mg de sustancia`} en ${isEs ? d.waterMeasureEs : d.waterMeasure}.`,
          )),

          // Clinical Warnings specific to substance
          isStimulant && d.crossReactivityWarning
            ? h('div', { class: 'callout callout-warn stimulant-cross-reactivity-warning' },
                h('p', { class: 'callout-title' }, icon('warn'), ' ', tr('High-Concentration Cross-Reactivity Risk', 'Riesgo de reactividad cruzada por alta concentración')),
                p(isEs ? d.warningTextEs : d.warningText),
              )
            : null,

          isPill
            ? h('div', { class: 'callout callout-warn pill-crush-warning' },
                h('p', { class: 'callout-title' }, icon('warn'), ' ', tr('Mandatory Pill Crushing Protocol', 'Protocolo obligatorio de pulverización')),
                p(isEs ? d.warningTextEs : d.warningText),
              )
            : null,

          h('ol', { class: 'protocol-instructions' },
            (isEs ? d.instructionsEs : d.instructions).map((stepText) => h('li', null, stepText)),
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Procedural Timers Section Renderer
  // ---------------------------------------------------------------------------
  function renderTimersSection() {
    clear(dipTimerSlot);
    clear(incubationTimerSlot);

    // Dip Timer (15 Seconds)
    const dip = testStripState.dipTimer;
    const dipIsDone = dip.completed;
    const dipTimeText = formatTime(dip.remainingSeconds);

    dipTimerSlot.append(
      h('div', { class: 'timer-step-box dip-timer-box' },
        h('h4', null, icon('clock'), ' ', tr('2. Step A: 15-Second Immersion Dip Timer', '2. Paso A: Temporizador de inmersión de 15 segundos')),
        p(tr(
          'Dip the wavy absorption pad of the strip into the prepared solution for exactly 15 seconds. Do NOT immerse past the MAX line.',
          'Sumerja la punta de absorción ondulada en la solución durante 15 segundos exactos. NO sumerja más allá de la línea MAX.',
        )),
        h('div', { class: `timer ${dipIsDone ? 'timer-done' : ''}`, id: 'strip-dip-timer-display' },
          h('p', { class: 'timer-display', 'aria-live': 'polite' }, dipTimeText),
          h('div', { class: 'timer-actions no-print' },
            !dip.active
              ? h('button', {
                  type: 'button',
                  class: 'btn btn-primary btn-small',
                  id: 'btn-start-dip-timer',
                  onclick: () => startDipTimer(),
                }, icon('play'), ' ', dipIsDone ? tr('Re-run 15s Dip', 'Repetir 15s') : tr('Start 15s Dip', 'Iniciar 15s'))
              : h('button', {
                  type: 'button',
                  class: 'btn btn-secondary btn-small',
                  id: 'btn-stop-dip-timer',
                  onclick: () => stopDipTimer(),
                }, icon('pause'), ' ', tr('Pause', 'Pausar')),
            h('button', {
              type: 'button',
              class: 'btn btn-ghost btn-small',
              id: 'btn-reset-dip-timer',
              onclick: () => resetDipTimer(),
            }, icon('refresh'), ' ', tr('Reset Dip', 'Reiniciar')),
          ),
          h('p', { class: 'timer-live' },
            dip.active
              ? tr('Dipping in progress: Keep wavy end submerged without crossing MAX line...', 'Inmersión en curso: Mantenga la punta sumergida sin cruzar la línea MAX...')
              : dipIsDone
                ? tr('Dip complete (15s reached)! Remove strip from solution and lay flat on a dry surface.', '¡Inmersión completa (15s)! Retire la tira y colóquela plana sobre una superficie seca.')
                : tr('Ready: Click Start and dip strip for 15 seconds.', 'Listo: Presione Iniciar y sumerja la tira durante 15 segundos.'),
          ),
        ),
      ),
    );

    // Incubation Timer (2 to 5 Minutes)
    const inc = testStripState.incubationTimer;
    const incIsDone = inc.completed;
    const incTimeText = formatTime(inc.remainingSeconds);

    const targetButtons = [
      { sec: 120, label: tr('2 Minutes (Initial Read)', '2 Minutos (Lectura inicial)') },
      { sec: 300, label: tr('5 Minutes (Full Incubation)', '5 Minutos (Incubación completa)') },
    ].map((item) => {
      const active = inc.targetSeconds === item.sec;
      const btn = h('button', {
        type: 'button',
        class: 'preset inc-target-btn',
        id: `strip-target-${item.sec}s`,
        'aria-pressed': String(active),
        onclick: () => setIncubationTarget(item.sec),
      }, item.label);
      if (active) btn.setAttribute('aria-current', 'true');
      return btn;
    });

    incubationTimerSlot.append(
      h('div', { class: 'timer-step-box incubation-timer-box' },
        h('h4', null, icon('clock'), ' ', tr('3. Step B: 2-to-5 Minute Flat Incubation Countdown', '3. Paso B: Cuenta regresiva de incubación de 2 a 5 minutos')),
        p(tr(
          'Lay the test strip flat on a clean, dry, non-absorbent surface. Wait at least 2 minutes for antibodies to migrate. Valid results develop between 2 and 5 minutes.',
          'Coloque la tira sobre una superficie limpia, seca y plana. Espere al menos 2 minutos para que los reactivos migren. Los resultados válidos aparecen entre 2 y 5 minutos.',
        )),
        h('nav', {
          class: 'presets incubation-target-presets no-print',
          'aria-label': tr('Select incubation countdown target', 'Seleccione tiempo de incubación'),
        }, targetButtons),
        h('div', { class: `timer ${incIsDone ? 'timer-done' : ''}`, id: 'strip-incubation-timer-display' },
          h('p', { class: 'timer-display', 'aria-live': 'polite' }, incTimeText),
          h('div', { class: 'timer-actions no-print' },
            !inc.active
              ? h('button', {
                  type: 'button',
                  class: 'btn btn-primary btn-small',
                  id: 'btn-start-inc-timer',
                  onclick: () => startIncubationTimer(),
                }, icon('play'), ' ', incIsDone ? tr('Re-run Incubation', 'Repetir incubación') : tr('Start Incubation', 'Iniciar incubación'))
              : h('button', {
                  type: 'button',
                  class: 'btn btn-secondary btn-small',
                  id: 'btn-stop-inc-timer',
                  onclick: () => stopIncubationTimer(),
                }, icon('pause'), ' ', tr('Pause', 'Pausar')),
            h('button', {
              type: 'button',
              class: 'btn btn-ghost btn-small',
              id: 'btn-reset-inc-timer',
              onclick: () => resetIncubationTimer(),
            }, icon('refresh'), ' ', tr('Reset Clock', 'Reiniciar reloj')),
          ),
          h('p', { class: 'timer-live' },
            inc.active
              ? (inc.resultsReady
                  ? tr('2 Minutes Reached: Antibodies migrated! Results are now valid to interpret.', '¡2 minutos cumplidos: Los resultados ya son válidos para interpretar!')
                  : tr('Incubating flat: Lines are developing. Do not move or touch strip...', 'Incubando: Las líneas se están desarrollando. No mueva la tira...'))
              : (incIsDone
                  ? tr('Incubation window elapsed. Read result immediately. Do NOT interpret results past 10 minutes (evaporation lines form).', 'Tiempo de incubación cumplido. Lea el resultado de inmediato. NO interprete después de 10 minutos.')
                  : tr('Ready: Lay strip flat and click Start Incubation.', 'Listo: Coloque la tira plana y presione Iniciar incubación.')),
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Visual Result Interpretation Decoder Section Renderer
  // ---------------------------------------------------------------------------
  function renderInterpretationSection() {
    clear(interpretationSlot);
    const selectedKey = testStripState.selectedInterpretation;

    const interpretationButtons = [
      { id: 'positive', label: tr('1 Line (Control Only) → Positive', '1 Línea (Solo Control) → Positivo') },
      { id: 'negative', label: tr('2 Lines (Control + Test) → Negative', '2 Líneas (Control + Prueba) → Negativo') },
      { id: 'invalid', label: tr('0 Lines or Test Only → Invalid', '0 Líneas o Solo Prueba → No válido') },
    ].map((item) => {
      const active = selectedKey === item.id;
      const btn = h('button', {
        type: 'button',
        class: 'preset interp-tab-btn',
        id: `strip-interp-${item.id}`,
        'aria-pressed': String(active),
        onclick: () => setSelectedInterpretation(item.id),
      }, item.label);
      if (active) btn.setAttribute('aria-current', 'true');
      return btn;
    });

    const activeDef = selectedKey ? TEST_STRIP_INTERPRETATIONS[selectedKey] : null;

    interpretationSlot.append(
      h('div', { class: 'interpretation-controls' },
        h('h4', null, icon('shield'), ' ', tr('4. Visual Result Interpretation Decoder', '4. Decodificador visual de interpretación')),
        p(tr(
          'Select the line pattern you see on your strip after 2 to 5 minutes of flat incubation:',
          'Seleccione el patrón de líneas que observa en su tira tras 2 a 5 minutos de incubación:',
        )),
        h('nav', {
          class: 'presets interpretation-presets no-print',
          'aria-label': tr('Select test strip result line pattern', 'Seleccione patrón de líneas de la tira'),
        }, interpretationButtons),

        // Visual Test Strip Diagram
        h('div', {
          class: 'test-strip-diagram-card',
          id: 'test-strip-visual-diagram',
          role: 'img',
          'aria-label': activeDef
            ? tr(`Visual strip showing ${activeDef.title}`, `Tira visual mostrando ${activeDef.titleEs}`)
            : tr('Visual test strip diagram guide', 'Guía de diagrama visual de tiras reactivas'),
        },
          h('div', { class: 'strip-diagram-body' },
            h('span', { class: 'strip-end-label' }, tr('MAX Line End', 'Extremo línea MAX')),
            h('div', { class: 'strip-membrane' },
              // Control Zone
              h('div', { class: `strip-zone strip-zone-c ${activeDef?.hasControlLine ? 'zone-active' : 'zone-empty'}` },
                h('span', { class: 'zone-label' }, 'C (Control)'),
                activeDef?.hasControlLine
                  ? h('span', { class: 'strip-line strip-line-control chip chip-emergency' }, tr('■ RED CONTROL LINE', '■ LÍNEA ROJA DE CONTROL'))
                  : h('span', { class: 'strip-line strip-line-absent' }, tr('[ No Line ]', '[ Sin línea ]')),
              ),
              // Test Zone
              h('div', { class: `strip-zone strip-zone-t ${activeDef?.hasTestLine ? 'zone-active' : 'zone-empty'}` },
                h('span', { class: 'zone-label' }, 'T (Test)'),
                activeDef?.hasTestLine
                  ? h('span', { class: 'strip-line strip-line-test chip chip-ok' }, tr('■ RED TEST LINE (Even faint)', '■ LÍNEA ROJA DE PRUEBA (Incluso tenue)'))
                  : h('span', { class: 'strip-line strip-line-absent' }, tr('[ No Line ]', '[ Sin línea ]')),
              ),
            ),
            h('span', { class: 'strip-end-label' }, tr('Absorption Pad End', 'Extremo absorbente')),
          ),
        ),

        // Result Details Card
        activeDef
          ? h('div', { class: `callout ${activeDef.alertClass} interp-result-card`, id: 'test-strip-result-card' },
              h('div', { class: 'facility-head' },
                h('h4', { class: 'facility-name' },
                  icon('shield'), ' ',
                  isEs ? activeDef.titleEs : activeDef.title,
                ),
                h('span', { class: `chip ${activeDef.badgeClass}` },
                  isEs ? activeDef.resultEs : activeDef.result,
                ),
              ),
              p(h('strong', null, isEs ? activeDef.summaryEs : activeDef.summary)),
              h('ul', { class: 'result-action-steps' },
                (isEs ? activeDef.actionStepsEs : activeDef.actionSteps).map((stepText) =>
                  h('li', null, stepText),
                ),
              ),
            )
          : h('p', { class: 'field-status' }, tr('Click a button above to view clinical guidance and critical caveats for that test strip pattern.', 'Haga clic en un botón arriba para ver la guía clínica y advertencias de ese resultado.')),
      ),
    );
  }

  // Master Render
  function renderAll() {
    renderDilutionSection();
    renderTimersSection();
    renderInterpretationSection();
  }

  // Subscribe to changes
  const unsubscribe = subscribeTestStripState(() => {
    renderAll();
  });

  // Initial render
  renderAll();

  // Reset Button & Disclaimer Footer
  const resetButton = h('button', {
    type: 'button',
    class: 'btn btn-ghost btn-small',
    id: 'btn-reset-test-strip-state',
    onclick: () => {
      resetTestStripState();
    },
  }, icon('refresh'), ' ', tr('Reset Test Strip Simulator', 'Reiniciar simulador'));

  root.append(
    h('div', { class: 'facility-head' },
      h('h3', { class: 'facility-name' },
        icon('shield'), ' ',
        tr('Interactive Test Strip Dilution Simulator & Result Visualizer', 'Simulador de dilución y visualizador de tiras reactivas'),
      ),
      h('span', { class: 'chip chip-extra' }, tr('In-RAM Tool', 'Herramienta en RAM')),
    ),
    p(tr(
      'Follow validated dilution ratios to avoid false-positive cross-reactivity, run precise dip and incubation timers, and safely decode test results.',
      'Siga proporciones de dilución validadas para evitar falsos positivos, use temporizadores precisos de inmersión e incubación, y decodifique resultados con seguridad.',
    )),
    dilutionSlot,
    dipTimerSlot,
    incubationTimerSlot,
    interpretationSlot,
    h('div', { class: 'actions no-print' },
      resetButton,
      h('span', { class: 'fine' },
        tr('Drug checking calculations and timer states are kept 100% ephemeral in memory and cleared on Quick Exit.', 'Los datos de análisis y tiempos se mantienen en memoria volátil y se borran con Salida rápida.'),
      ),
    ),
  );

  return root;
}
