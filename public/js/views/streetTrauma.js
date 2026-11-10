// public/js/views/streetTrauma.js
// HarborPath - Street Trauma & Life-Threatening Hemorrhage Control Navigator
// Clinical Consensus: American College of Surgeons (ACS) Committee on Trauma "Stop the Bleed",
// Hartford Consensus on Improving Survival from Active Shooter and Intentional Mass-Casualty Events,
// Committee on Tactical Combat Casualty Care (CoTCCC) Civilian Hemorrhage Control Guidelines.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII, zero cookies.
// Security Invariant: Safe DOM manipulation via ../dom.js (zero string injection, zero inline styles).

import { h, clear, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

// ============================================================================
// CLINICAL TAXONOMY: HEMORRHAGE CLASSIFICATION & CONTROLS
// ============================================================================

export const TRAUMA_HEMORRHAGE_PROTOCOLS = Object.freeze({
  arterial_extremity: Object.freeze({
    id: 'arterial_extremity',
    nameEn: 'Severe Arterial Extremity Bleed (Arms / Legs)',
    nameEs: 'Hemorragia Arterial Grave en Extremidades (Brazos / Piernas)',
    severity: 'EMERGENCY_911',
    presentationEn: 'Bright red, pulsatile, rhythmic spurting blood or rapid pooling (>1 can/cup in 30 seconds). Extremity clothes rapidly saturated.',
    presentationEs: 'Sangre rojo brillante pulsátil a presión o acumulación rápida (> 1 vaso en 30 segundos). Ropa empapada rápidamente.',
    actionEn: 'Apply a commercial windlass tourniquet (CAT / SOFT-T) immediately. Place 2–3 inches proximal to the bleeding site directly on skin (or high-and-tight if exact wound origin is obscured). NEVER place over a joint. Pull band tight, turn windlass until all spurting stops AND distal pulse disappears. Secure windlass rod in clip. Mark application time on forehead or tourniquet strap (e.g. "TK 04:30").',
    actionEs: 'Aplique de inmediato un torniquete comercial con molinete (CAT / SOFT-T). Colóquelo 5 a 7 cm por encima de la herida directamente sobre la piel (o en la parte más proximal si la ropa oculta la lesión). NUNCA sobre una articulación. Apriete la banda y gire el molinete hasta que cese el sangrado Y desaparezca el pulso distal. Asegure la varilla y anote la hora (ej. «TK 04:30»).',
    fieldRuleEn: 'STRICT INVARIANT: NEVER loosen, release, or remove a tourniquet in the field. Releasing causes immediate hemorrhagic re-bleeding shock, dislodges fragile clots, and flushes lethal acidotic and hyperkalemic toxins into central circulation. Tourniquets are safe for up to 2 hours without limb loss.',
    fieldRuleEs: 'REGLA ESTRICTA: NUNCA afloje, suelte ni retire un torniquete en el lugar. Aflojarlo provoca shock hemorrágico inmediato y libera toxinas y potasio acumulados hacia el corazón. Los torniquetes son seguros hasta por 2 horas sin riesgo de pérdida de extremidad.',
  }),

  junctional_wound: Object.freeze({
    id: 'junctional_wound',
    nameEn: 'Junctional Hemorrhage (Groin, Axilla / Armpit, Neck)',
    nameEs: 'Hemorragia de Zonas de Transición / Unión (Ingle, Axila, Cuello)',
    severity: 'EMERGENCY_911',
    presentationEn: 'Deep penetrating or tearing wound at the junction of limb and torso where a tourniquet CANNOT anatomically fit.',
    presentationEs: 'Herida profunda penetrante o desgarrada en la ingle, axila o base del cuello donde un torniquete NO puede colocarse anatómicamente.',
    actionEn: 'Wound packing with Hemostatic Gauze (Kaolin QuikClot or Chitosan Celox). Direct physical pressure: clear surface pooled blood, identify deepest bleeding vessel/bone, tightly pack gauze deep into the wound cavity until packed completely flush with skin surface. IMMEDIATELY follow with UNBROKEN, HARD MANUAL TWO-HANDED PRESSURE FOR AT LEAST 3 CONTINUOUS MINUTES (5 minutes if plain non-hemostatic gauze is used). Wrap firmly with elastic pressure wrap.',
    actionEs: 'Empaquetamiento con gasa hemostática (QuikClot con caolín o Celox con quitosano). Limpie sangre acumulada, identifique el punto más profundo del sangrado y empaquete la gasa firmemente dentro de la cavidad hasta rellenarla. APLIQUE PRESIÓN MANUAL DIRECTA ENÉRGICA CON AMBAS MANOS DURANTE AL MENOS 3 MINUTOS CONTINUOS SIN SOLTAR (5 minutos con gasa simple). Cubra con vendaje compresivo elástico.',
    fieldRuleEn: 'Do not just cover the top of the wound with folded gauze—the gauze MUST be packed deep into the bleeding cavity directly against the lacerated artery to facilitate hemostasis.',
    fieldRuleEs: 'No se limite a colocar gasa sobre la piel; DEBE introducir la gasa hasta el fondo de la herida directamente contra la arteria desgarrada para detener la hemorragia.',
  }),

  venous_oozing: Object.freeze({
    id: 'venous_oozing',
    nameEn: 'Venous Oozing & Non-Life-Threatening Soft Tissue Bleeds',
    nameEs: 'Sangrado Venoso Continuo y Heridas Menores de Tejidos Blandos',
    severity: 'URGENT_FIRST_AID',
    presentationEn: 'Dark red, steady non-pulsatile oozing without high-pressure jets or pooling.',
    presentationEs: 'Sangre oscura continua sin chorro a presión ni pulsaciones.',
    actionEn: 'Apply continuous firm direct manual pressure using a sterile gauze pad or clean cloth for at least 15 minutes without lifting to check. Elevate the injured extremity above the level of the heart if no bone fracture is suspected. Once bleeding stops, secure with a snug roller bandage.',
    actionEs: 'Aplique presión manual directa firme y continua con gasa estéril o paño limpio durante al menos 15 minutos sin levantar para mirar. Eleve la extremidad por encima del corazón si no hay fractura. Al cesar el sangrado, fije con vendaje elástico.',
    fieldRuleEn: 'Do not peek under the gauze before 15 minutes; peeking tears away the nascent platelet plug and restarts bleeding.',
    fieldRuleEs: 'No levante la gasa antes de 15 minutos; mirar despega el tapón plaquetario incipiente y reinicia el sangrado.',
  }),

  dual_bone_trap: Object.freeze({
    id: 'dual_bone_trap',
    nameEn: 'Dual-Bone Vascular Shielding Alert (Forearm / Lower Leg Trap)',
    nameEs: 'Alerta de Blindaje Óseo Dual (Trampa de Antebrazo y Pantorrilla)',
    severity: 'CLINICAL_PITFALL',
    presentationEn: 'Tourniquet placed on forearm or lower calf fails to stop bright red arterial bleeding despite maximum windlass tightening.',
    presentationEs: 'El torniquete colocado en antebrazo o pantorrilla no detiene el sangrado arterial a pesar de apretar al máximo.',
    actionEn: 'ANATOMICAL PITFALL: The dual bones of the forearm (radius & ulna) and lower leg (tibia & fibula) act as rigid shields that protect deep interosseous arteries from external circumferential compression. If bleeding persists after applying a tourniquet to the forearm or calf, IMMEDIATELY place a second tourniquet PROXIMALLY over a single-bone segment: the upper arm (humerus) or thigh (femur).',
    actionEs: 'TRAMPA ANATÓMICA: Los dos huesos del antebrazo (radio y cúbito) y de la pantorrilla (tibia y peroné) actúan como escudo rígido que protege las arterias profundas de la compresión. Si el sangrado persiste, coloque DE INMEDIATO un segundo torniquete en el segmento de hueso único: brazo superior (húmero) o muslo (fémur).',
    fieldRuleEn: 'Single-bone compression (humerus or femur) provides 100% circumferential vascular occlusion.',
    fieldRuleEs: 'La compresión sobre un solo hueso (húmero o fémur) garantiza la oclusión vascular circunferencial total.',
  }),

  prohibited_actions: Object.freeze({
    id: 'prohibited_actions',
    nameEn: 'Strictly Prohibited Street Trauma Actions',
    nameEs: 'Acciones Estrictamente Prohibidas en Trauma Callejero',
    severity: 'SAFETY_PROHIBITION',
    presentationEn: 'Common dangerous folk practices or improvised interventions that cause permanent paralysis or death.',
    presentationEs: 'Prácticas peligrosas improvisadas que causan parálisis permanente o muerte.',
    actionEn: '1. PROHIBIT BLIND CLAMPING: Never clamp vessels blindly with hemostats or pliers in the field (major peripheral nerves run in the neurovascular bundle with arteries; blind clamping causes permanent motor and sensory paralysis). 2. PROHIBIT WIRE TOURNIQUETS: Never use wires, zip-ties, shoelaces, or guitar strings as improvised tourniquets (they act as wire garrotes, lacerating skin, cutting nerves, and failing to occlude deep arteries; minimum width is 1.5 inches). 3. PROHIBIT PACKING THE CHEST OR ABDOMEN: Never pack gauze into chest or abdominal wounds (causes massive internal compression; use vented chest seals for chest wounds).',
    actionEs: '1. PROHIBIDO EL CLAMPAJE CIEGO: Nunca pince vasos a ciegas con pinzas o alicates en el campo (los nervios motores viajan junto a las arterias; el clampaje ciego provoca parálisis permanente). 2. PROHIBIDOS CABLES O CORDONES: Nunca use alambres, bridas, cordones de zapatos o cuerdas finas como torniquete (cortan la piel y lesionan nervios sin comprimir las arterias; el ancho mínimo es de 3.8 cm). 3. PROHIBIDO EMPAQUETAR TÓRAX O ABDOMEN: Nunca empaquete gasas en cavidad torácica o abdominal (use sellos de tórax valvulados para heridas torácicas).',
    fieldRuleEn: 'Do no further harm: prioritize commercial windlass tourniquets and hemostatic wound packing over improvised gadgets.',
    fieldRuleEs: 'Primero no dañar: priorice torniquetes comerciales y empaquetamiento hemostático sobre inventos peligrosos.',
  }),
});

export const BLEEDING_PROFILES = TRAUMA_HEMORRHAGE_PROTOCOLS;

export const FIELD_PROHIBITIONS = Object.freeze([
  'Never loosen or remove a tourniquet in the field once placed.',
  'Never blindly clamp bleeding vessels with hemostats or pliers in the field.',
  'Never use thin wire, zip-ties, or shoestrings as improvised tourniquets.',
  'Never pack gauze into deep wounds of the chest or abdomen (use vented chest seals).',
]);

// ============================================================================
// EVALUATION ENGINE (PURE FUNCTION)
// ============================================================================

/**
 * Pure evaluation function for street trauma and hemorrhage control.
 * @param {Object} input
 * @param {string} [input.protocolId='arterial_extremity'] - Key in TRAUMA_HEMORRHAGE_PROTOCOLS
 * @param {boolean} [input.isSpurting=true] - Bright red arterial spurting or high pooling
 * @param {string} [input.woundLocation='arm'] - 'arm' | 'leg' | 'forearm_calf' | 'groin_axilla' | 'neck' | 'chest_abdomen'
 * @param {number} [input.tourniquetMinutesElapsed=0] - Minutes since tourniquet placed
 * @param {boolean} [input.hasShock=false] - Altered mental status, pale clammy skin, absent radial pulse
 * @returns {Object} Comprehensive evaluation output
 */
export function evaluateStreetTrauma(input = {}) {
  const protocolId = TRAUMA_HEMORRHAGE_PROTOCOLS[input.protocolId] ? input.protocolId : 'arterial_extremity';
  const protocol = TRAUMA_HEMORRHAGE_PROTOCOLS[protocolId];
  const isSpurting = Boolean(input.isSpurting);
  const woundLocation = input.woundLocation || 'arm';
  const tourniquetMinutes = Math.max(0, Math.min(360, Number(input.tourniquetMinutesElapsed) || 0));
  const hasShock = Boolean(input.hasShock);

  const emergencyFlagsEn = [];
  const emergencyFlagsEs = [];

  if (isSpurting || woundLocation === 'groin_axilla' || woundLocation === 'neck') {
    emergencyFlagsEn.push('LIFE-THREATENING ARTERIAL HEMORRHAGE: Exsanguination can occur in under 3 minutes without immediate mechanical occlusion.');
    emergencyFlagsEs.push('HEMORRAGIA ARTERIAL CON RIESGO VITAL: La muerte por desangrado ocurre en menos de 3 minutos sin oclusión mecánica.');
  }

  if (woundLocation === 'forearm_calf' && isSpurting) {
    emergencyFlagsEn.push('DUAL-BONE TRAP: Radius/ulna or tibia/fibula may shield bleeding vessels. If bleeding persists, place second tourniquet on upper arm or thigh.');
    emergencyFlagsEs.push('TRAMPA DE DOBLE HUESO: El radio/cúbito o tibia/peroné pueden blindar los vasos. Si el sangrado persiste, coloque un segundo torniquete en el brazo o muslo.');
  }

  if (woundLocation === 'chest_abdomen') {
    emergencyFlagsEn.push('TRUNCAL WOUND: DO NOT pack gauze into chest or abdomen. Apply vented chest seal for sucking chest wound; call 911 immediately.');
    emergencyFlagsEs.push('HERIDA TRONCAL: NO empaquete gasas en tórax o abdomen. Aplique parche valvulado en tórax abierto; llame al 911 de inmediato.');
  }

  if (hasShock) {
    emergencyFlagsEn.push('HYPOVOLEMIC HEMORRHAGIC SHOCK: Pale cold skin, confusion, or absent peripheral pulse mandates immediate horizontal positioning, warmth, and 911 EMS resuscitation.');
    emergencyFlagsEs.push('CHOQUE HIPOVOLÉMICO HEMORRÁGICO: Piel fría, confusión o pulso ausente exige posición horizontal, calor y soporte avanzado por el 911.');
  }

  if (tourniquetMinutes >= 120) {
    emergencyFlagsEn.push(`PROLONGED TOURNIQUET TIME (${tourniquetMinutes} min): Exceeds safe 2-hour window. DO NOT remove in field; alert trauma center immediately.`);
    emergencyFlagsEs.push(`TIEMPO DE TORNIQUETE PROLONGADO (${tourniquetMinutes} min): Supera las 2 horas. NO lo retire en el lugar; avise al centro de trauma de inmediato.`);
  }

  const isEmergency911 = emergencyFlagsEn.length > 0;

  // SBAR Clinical Trauma Handoff Generation
  const sbarEn = [
    `[S] SITUATION: Severe street trauma presenting with life-threatening hemorrhage: ${protocol.nameEn}. Wound location: ${woundLocation.toUpperCase()}.`,
    `[B] BACKGROUND: Bleeding status: ${isSpurting ? 'Pulsatile arterial spurting' : 'Venous oozing'}.${tourniquetMinutes > 0 ? ` Tourniquet in place for ${tourniquetMinutes} minutes.` : ''}${hasShock ? ' Signs of hypovolemic shock present.' : ''}`,
    `[A] ASSESSMENT: ${isEmergency911 ? `CRITICAL TRAUMA: ${emergencyFlagsEn.join('; ')}` : 'Hemorrhage stabilized with direct pressure.'}`,
    `  • Primary Action Protocol: ${protocol.actionEn}`,
    `  • Field Safety Rule: ${protocol.fieldRuleEn}`,
    `[R] RECOMMENDATION: ${isEmergency911 ? 'URGENT 911 EMS TRANSPORT TO DESIGNATED LEVEL 1/2 TRAUMA CENTER.' : 'Local wound care and surgical debridement evaluation.'} Ensure exact tourniquet application time is communicated to triage nurse and trauma team.`,
  ].join('\n');

  const sbarEs = [
    `[S] SITUACIÓN: Trauma callejero grave con hemorragia: ${protocol.nameEs}. Ubicación de la herida: ${woundLocation.toUpperCase()}.`,
    `[B] ANTECEDENTES: Estado del sangrado: ${isSpurting ? 'Arterial pulsátil en chorro' : 'Venoso continuo'}.${tourniquetMinutes > 0 ? ` Torniquete colocado hace ${tourniquetMinutes} minutos.` : ''}${hasShock ? ' Signos de choque hipovolémico presentes.' : ''}`,
    `[A] EVALUACIÓN: ${isEmergency911 ? `TRAUMA CRÍTICO: ${emergencyFlagsEs.join('; ')}` : 'Hemorragia estabilizada con presión directa.'}`,
    `  • Protocolo de Acción Principal: ${protocol.actionEs}`,
    `  • Regla de Seguridad de Campo: ${protocol.fieldRuleEs}`,
    `[R] RECOMENDACIÓN: ${isEmergency911 ? 'TRASLADO URGENTE POR SME AL 911 A CENTRO DE TRAUMA NIVEL 1/2.' : 'Cuidado local de la herida y sutura quirúrgica.'} Comunique la hora exacta del torniquete al equipo de urgencias.`,
  ].join('\n');

  return {
    protocolId,
    protocol,
    isSpurting,
    woundLocation,
    tourniquetMinutes,
    hasShock,
    isEmergency911,
    emergencyFlagsEn,
    emergencyFlagsEs,
    sbarEn,
    sbarEs,
  };
}

// ============================================================================
// EPHEMERAL IN-RAM STATE & VIEW CONTROLLER
// ============================================================================

const traumaState = {
  protocolId: 'arterial_extremity',
  isSpurting: true,
  woundLocation: 'arm',
  tourniquetMinutes: 0,
  hasShock: false,
  copied: false,
};

const listeners = new Set();
function notifyState() {
  for (const fn of listeners) fn();
}

export function getStreetTraumaState() {
  return { ...traumaState };
}

export function setStreetTraumaState(patch) {
  Object.assign(traumaState, patch);
  notifyState();
}

export function resetStreetTraumaState() {
  traumaState.protocolId = 'arterial_extremity';
  traumaState.isSpurting = true;
  traumaState.woundLocation = 'arm';
  traumaState.tourniquetMinutes = 0;
  traumaState.hasShock = false;
  traumaState.copied = false;
  notifyState();
}

export function subscribeStreetTraumaState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ============================================================================
// VIEW RENDERING
// ============================================================================

export function streetTraumaView() {
  const container = h('div', { class: 'street-trauma-view', role: 'region', 'aria-label': 'Street Trauma and Hemorrhage Control Navigator' });

  function render() {
    clear(container);
    const isEs = getLang() === 'es';
    const evalResult = evaluateStreetTrauma({
      protocolId: traumaState.protocolId,
      isSpurting: traumaState.isSpurting,
      woundLocation: traumaState.woundLocation,
      tourniquetMinutesElapsed: traumaState.tourniquetMinutes,
      hasShock: traumaState.hasShock,
    });

    // Page Header
    container.appendChild(
      pageHeader(
        isEs ? 'Trauma Callejero, Torniquetes y Control de Hemorragias' : 'Street Trauma, Tourniquets & Life-Threatening Hemorrhage Control',
        isEs
          ? 'Guía clínica Stop the Bleed y CoTCCC: aplicación de torniquetes CAT, empaquetamiento hemostático en ingle/axila y prevención de errores anatómicos.'
          : 'ACS Stop the Bleed & CoTCCC protocols: commercial windlass tourniquet placement, hemostatic junctional packing, and dual-bone entrapment warnings.',
        'clinical'
      )
    );

    // Emergency 911 Callout Banner if critical
    if (evalResult.isEmergency911) {
      container.appendChild(
        h('aside', { class: 'trauma-alert-urgent', role: 'alert' },
          h('div', { class: 'trauma-alert-title' },
            icon('alert-triangle'),
            h('strong', {}, isEs ? 'HEMORRAGIA CON RIESGO VITAL: LLAME AL 911 DE INMEDIATO' : 'LIFE-THREATENING HEMORRHAGE: CALL 911 IMMEDIATELY')
          ),
          h('ul', { class: 'trauma-alert-list' },
            (isEs ? evalResult.emergencyFlagsEs : evalResult.emergencyFlagsEn).map((msg) =>
              h('li', {}, msg)
            )
          )
        )
      );
    }

    // Protocol Selector Tabs
    const tabNav = h('div', { class: 'tabs', role: 'tablist', 'aria-label': isEs ? 'Escenarios de Hemorragia' : 'Hemorrhage Scenarios' },
      Object.values(TRAUMA_HEMORRHAGE_PROTOCOLS).map((p) => {
        const isSelected = p.id === traumaState.protocolId;
        const btn = h('button', {
          type: 'button',
          role: 'tab',
          class: `tab ${isSelected ? 'active' : ''}`,
          'aria-selected': isSelected ? 'true' : 'false',
        }, isEs ? p.nameEs : p.nameEn);
        btn.addEventListener('click', () => {
          traumaState.protocolId = p.id;
          render();
        });
        return btn;
      })
    );
    container.appendChild(tabNav);

    // Two Column Layout
    const grid = h('div', { class: 'trauma-layout-grid' });

    // LEFT COLUMN: Triage Controls & Anatomy
    const leftCol = h('div', { class: 'trauma-col' });

    // Card 1: Clinical Presentation
    const presCard = h('section', { class: 'trauma-card' },
      h('h2', { class: 'trauma-card-title' },
        icon('activity'),
        h('span', {}, isEs ? '1. Características del Sangrado' : '1. Bleeding Characteristics')
      ),
      h('p', { class: 'trauma-card-desc' },
        isEs ? evalResult.protocol.presentationEs : evalResult.protocol.presentationEn
      ),
      // Spurting Toggle
      h('div', { class: 'trauma-field-group' },
        (() => {
          const chk = h('input', {
            type: 'checkbox',
            id: 'chk-spurting',
            class: 'trauma-checkbox',
            checked: traumaState.isSpurting,
          });
          chk.addEventListener('change', (e) => {
            traumaState.isSpurting = e.target.checked;
            render();
          });
          return h('label', { for: 'chk-spurting', class: 'trauma-checkbox-label' },
            chk,
            h('span', {}, isEs ? 'Sangre en chorro pulsátil o acumulación rápida' : 'Pulsatile arterial jet or rapid pooling blood')
          );
        })(),
        (() => {
          const chk = h('input', {
            type: 'checkbox',
            id: 'chk-shock',
            class: 'trauma-checkbox',
            checked: traumaState.hasShock,
          });
          chk.addEventListener('change', (e) => {
            traumaState.hasShock = e.target.checked;
            render();
          });
          return h('label', { for: 'chk-shock', class: 'trauma-checkbox-label' },
            chk,
            h('span', {}, isEs ? 'Signos de shock (piel fría/pálida, pulso ausente, confusión)' : 'Signs of shock (cold/pale skin, absent pulse, confusion)')
          );
        })()
      ),
      // Wound Location Selector
      h('div', { class: 'trauma-field-group' },
        h('label', { for: 'trauma-location', class: 'trauma-label' }, isEs ? 'Ubicación Anatómica de la Herida:' : 'Anatomical Wound Location:'),
        (() => {
          const sel = h('select', { id: 'trauma-location', class: 'trauma-select' },
            h('option', { value: 'arm', selected: traumaState.woundLocation === 'arm' }, isEs ? 'Brazo Superior (Húmero - Oclusión Eficaz)' : 'Upper Arm (Humerus - Single Bone)'),
            h('option', { value: 'leg', selected: traumaState.woundLocation === 'leg' }, isEs ? 'Muslo (Fémur - Oclusión Eficaz)' : 'Upper Leg / Thigh (Femur - Single Bone)'),
            h('option', { value: 'forearm_calf', selected: traumaState.woundLocation === 'forearm_calf' }, isEs ? 'Antebrazo / Pantorrilla (¡Trampa de Doble Hueso!)' : 'Forearm / Calf (Dual-Bone Shielding Trap!)'),
            h('option', { value: 'groin_axilla', selected: traumaState.woundLocation === 'groin_axilla' }, isEs ? 'Ingle / Axila (Zona de Unión - Empaquetar Gasa)' : 'Groin / Axilla (Junctional - Hemostatic Packing)'),
            h('option', { value: 'neck', selected: traumaState.woundLocation === 'neck' }, isEs ? 'Cuello (Empaquetar sin comprimir vía aérea)' : 'Neck (Pack directly; do not wrap circumferentially)'),
            h('option', { value: 'chest_abdomen', selected: traumaState.woundLocation === 'chest_abdomen' }, isEs ? 'Tórax / Abdomen (¡Prohibido Empaquetar! Sello Valvulado)' : 'Chest / Abdomen (DO NOT Pack! Sucking Chest Seal)')
          );
          sel.addEventListener('change', (e) => {
            traumaState.woundLocation = e.target.value;
            render();
          });
          return sel;
        })()
      ),
      // Tourniquet Time Elapsed Input
      h('div', { class: 'trauma-field-group' },
        h('label', { for: 'trauma-time', class: 'trauma-label' }, isEs ? 'Minutos desde la Colocación del Torniquete:' : 'Minutes Since Tourniquet Applied:'),
        (() => {
          const inp = h('input', {
            type: 'number',
            id: 'trauma-time',
            min: '0',
            max: '360',
            value: String(traumaState.tourniquetMinutes),
            class: 'trauma-input-number',
          });
          inp.addEventListener('input', (e) => {
            const val = Number(e.target.value);
            if (val >= 0) {
              traumaState.tourniquetMinutes = val;
              render();
            }
          });
          return inp;
        })()
      )
    );
    leftCol.appendChild(presCard);

    grid.appendChild(leftCol);

    // RIGHT COLUMN: Protocol Directives, Invariants & SBAR Trauma Handoff
    const rightCol = h('div', { class: 'trauma-col' });

    // Card 2: Action Protocol Directives
    const actionCard = h('section', { class: 'trauma-card trauma-action-card' },
      h('h2', { class: 'trauma-card-title' },
        icon('check-circle'),
        h('span', {}, isEs ? '2. Directivas de Intervención Inmediata' : '2. Immediate Intervention Protocol')
      ),
      h('p', { class: 'trauma-action-text' },
        isEs ? evalResult.protocol.actionEs : evalResult.protocol.actionEn
      ),
      h('div', { class: 'trauma-field-rule-box' },
        h('strong', {}, isEs ? 'Regla de Oro de Campo: ' : 'Critical Field Safety Rule: '),
        h('span', {}, isEs ? evalResult.protocol.fieldRuleEs : evalResult.protocol.fieldRuleEn)
      )
    );
    rightCol.appendChild(actionCard);

    // Card 3: SBAR Trauma Transfer Handoff
    const sbarCard = h('section', { class: 'trauma-card' },
      h('h2', { class: 'trauma-card-title' },
        icon('file-text'),
        h('span', {}, isEs ? 'Nota Clínica SBAR de Trauma (Cero PII)' : 'SBAR Trauma Transfer Note (Zero PII)')
      ),
      h('pre', { class: 'trauma-sbar-block', tabindex: '0' },
        isEs ? evalResult.sbarEs : evalResult.sbarEn
      ),
      h('div', { class: 'trauma-actions' },
        (() => {
          const copyBtn = h('button', {
            type: 'button',
            class: 'btn btn-primary',
          },
            icon('copy'),
            h('span', {}, traumaState.copied ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Copiar SBAR' : 'Copy SBAR Note'))
          );
          copyBtn.addEventListener('click', () => {
            const text = isEs ? evalResult.sbarEs : evalResult.sbarEn;
            if (navigator?.clipboard?.writeText) {
              navigator.clipboard.writeText(text).then(() => {
                traumaState.copied = true;
                announce(isEs ? 'Nota SBAR copiada al portapapeles' : 'SBAR note copied to clipboard');
                render();
                setTimeout(() => {
                  traumaState.copied = false;
                  render();
                }, 3000);
              });
            }
          });
          return copyBtn;
        })(),
        (() => {
          const resetBtn = h('button', {
            type: 'button',
            class: 'btn btn-ghost',
          }, isEs ? 'Restablecer' : 'Reset Form');
          resetBtn.addEventListener('click', () => {
            resetStreetTraumaState();
          });
          return resetBtn;
        })()
      )
    );
    rightCol.appendChild(sbarCard);

    grid.appendChild(rightCol);
    container.appendChild(grid);
  }

  listeners.add(render);
  render();
  return container;
}
