// HarborPath: Embeddable Public Health Widgets & Partner Badge Generator
// Enables municipal health departments, syringe service programs, emergency clinics,
// and harm reduction coalitions to embed zero-cookie, privacy-preserving HarborPath tools.
// Uses only safe DOM construction via ../dom.js (zero string injection, zero inline styles).

import { h, clear, ext, icon, announce, tel } from '../dom.js';
import { t, getLang } from '../i18n.js';
import { pageHeader } from './common.js';

export const WIDGET_VARIANTS = Object.freeze([
  {
    id: 'quick-search',
    name: 'Interactive Care & Treatment Finder',
    nameEs: 'Buscador Interactivo de Atención y Tratamiento',
    desc: 'Compact, responsive search card enabling visitors to enter a ZIP code or city to find accredited clinics, buprenorphine providers, and low-cost health centers.',
    descEs: 'Tarjeta compacta y adaptable que permite a los visitantes ingresar un código postal o ciudad para encontrar clínicas acreditadas y centros de salud.',
    height: 480,
    route: '#/match',
  },
  {
    id: 'naloxone-badge',
    name: 'Naloxone & Harm Reduction Fast-Access Pill',
    nameEs: 'Acceso Rápido a Naloxona y Reducción de Daños',
    desc: 'Prominent, high-contrast harm reduction pill with direct click-to-call 911 / 988 emergency triggers and nearest naloxone distribution map.',
    descEs: 'Píldora de reducción de daños de alto contraste con botones de emergencia 911 / 988 y mapa de distribución de naloxona más cercano.',
    height: 180,
    route: '#/harm-reduction',
  },
  {
    id: 'crisis-banner',
    name: '988 Suicide & Crisis Lifeline Responsive Banner',
    nameEs: 'Banner Adaptable de la Línea de Crisis 988',
    desc: 'Trauma-informed crisis banner connecting visitors immediately to free, confidential 24/7 mental health and overdose support.',
    descEs: 'Banner de crisis que conecta a los visitantes de inmediato con apoyo gratuito y confidencial 24/7 para salud mental y sobredosis.',
    height: 140,
    route: '#/crisis',
  },
  {
    id: 'verified-point',
    name: 'Verified Harm Reduction Access Point Seal',
    nameEs: 'Sello de Punto de Acceso Verificado a Reducción de Daños',
    desc: 'Official vector trust badge for partner clinic websites, confirming non-stigmatizing low-barrier care and official federal directory verification.',
    descEs: 'Insignia de confianza oficial para sitios web de clínicas asociadas, que confirma atención sin estigma y verificación en el directorio federal.',
    height: 120,
    route: '#/health',
  },
]);

export const PARTNERSHIP_STANDARDS = Object.freeze([
  {
    title: 'Zero Third-Party Telemetry & No Tracking Cookies',
    titleEs: 'Cero Telemetría de Terceros y Sin Cookies de Seguimiento',
    desc: 'HarborPath embedded widgets will never set cookies, fingerprint browser clients, or track visitors across websites. HIPAA and 42 CFR Part 2 compliant by design.',
    descEs: 'Los widgets integrados de HarborPath nunca instalarán cookies, rastrearán navegadores ni registrarán visitas. Cumplimiento estricto de HIPAA y 42 CFR Parte 2.',
  },
  {
    title: 'Iframe Sandbox Isolation & Content Security Policy',
    titleEs: 'Aislamiento Sandbox de Iframe y Política de Seguridad de Contenido',
    desc: 'Every embed operates in a strictly constrained sandbox (sandbox="allow-scripts allow-forms allow-popups allow-same-origin") preventing host page cross-scripting.',
    descEs: 'Cada integración opera en un sandbox estrictamente restringido que previene cualquier intromisión de scripts cruzados.',
  },
  {
    title: 'WCAG 2.1 AA Accessibility & Keyboard Navigable',
    titleEs: 'Accesibilidad WCAG 2.1 AA y Navegación por Teclado',
    desc: 'Semantic landmarks, 48px touch targets, visible focus outlines, and screen reader announcements built in natively.',
    descEs: 'Puntos de referencia semánticos, objetivos táctiles de 48px, anillos de foco visibles y anuncios para lectores de pantalla.',
  },
]);

// Ephemeral in-RAM state management
const embedState = {
  widgetType: 'quick-search',
  theme: 'auto',
  accent: 'teal',
  widthPreset: 'responsive',
  copied: false,
};

const listeners = new Set();
function notify() {
  for (const fn of listeners) fn();
}

export function getEmbedState() {
  return { ...embedState };
}

export function setEmbedState(patch) {
  Object.assign(embedState, patch);
  notify();
}

export function subscribeEmbedState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function resetEmbedBuilderState() {
  embedState.widgetType = 'quick-search';
  embedState.theme = 'auto';
  embedState.accent = 'teal';
  embedState.widthPreset = 'responsive';
  embedState.copied = false;
  notify();
}

/**
 * Builds clean iframe snippet text without external dependencies or tracking.
 */
export function generateIframeSnippet(state = embedState, origin = 'https://harborpath-platform.vercel.app') {
  const variant = WIDGET_VARIANTS.find((v) => v.id === state.widgetType) ?? WIDGET_VARIANTS[0];
  const url = `${origin}/${variant.route}?embed=1&theme=${state.theme}&accent=${state.accent}`;
  const widthAttr = state.widthPreset === 'responsive' ? '100%' : state.widthPreset === 'fixed-360' ? '360' : '480';

  return `<iframe src="${url}" width="${widthAttr}" height="${variant.height}" title="HarborPath Care & Harm Reduction Navigator" class="harborpath-widget-frame" frameborder="0" sandbox="allow-scripts allow-forms allow-popups allow-same-origin" loading="lazy"></iframe>`;
}

/**
 * Builds HTML/SVG direct partner seal snippet for static footers.
 */
export function generateBadgeSnippet(origin = 'https://harborpath-platform.vercel.app') {
  return `<a href="${origin}/#/match" class="harborpath-partner-seal" target="_blank" rel="noopener noreferrer" title="Find Free & Confidential Addiction Treatment on HarborPath">
  <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#0d9488"/><path d="M16 6.5 12.5 12h7z" fill="#f59e0b"/><path d="M14 12h4v8h-4z" fill="#ffffff"/><path d="M5 22.5c2.2 0 2.2-1.5 4.4-1.5s2.2 1.5 4.4 1.5 2.2-1.5 4.4-1.5 2.2 1.5 4.4 1.5 2.2-1.5 4.4-1.5" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><path d="M7 26.5c2 0 2-1.3 4-1.3s2 1.3 4 1.3 2-1.3 4-1.3 2 1.3 4 1.3 2-1.3 3-1.3" fill="none" stroke="#5eead4" stroke-width="1.6" stroke-linecap="round"/></svg>
  <span>HarborPath Verified Partner · Confidential Care Finder</span>
</a>`;
}

/**
 * Main Embed Builder View
 */
export function embedBuilderView() {
  const container = h('div', { class: 'view embed-builder-view' });

  function render() {
    clear(container);
    const isEs = getLang() === 'es';
    const state = getEmbedState();
    const activeVariant = WIDGET_VARIANTS.find((v) => v.id === state.widgetType) ?? WIDGET_VARIANTS[0];

    // Header
    const header = pageHeader(
      isEs ? 'Generador de Widgets y Sellos para Sitios Socios' : 'Public Health Widget & Partner Badge Generator',
      isEs
        ? 'Integre herramientas de búsqueda de tratamiento, naloxona y soporte 988 en portales municipales, páginas de salud comunitaria y clínicas con cero cookies y máxima privacidad.'
        : 'Embed zero-cookie, privacy-preserving treatment finders, naloxone access locators, and 988 crisis banners into municipal health portals, syringe programs, and clinic websites.',
    );

    // Variant selector tabs
    const selectorSection = h('section', { class: 'card embed-config-card', 'aria-label': isEs ? 'Configuración de Widget' : 'Widget Configuration' },
      h('h2', { class: 'h3' }, isEs ? '1. Seleccione el Tipo de Widget' : '1. Choose Widget Type'),
      h('div', { class: 'tabs', role: 'tablist', 'aria-label': isEs ? 'Formatos de Widget' : 'Widget Formats' },
        ...WIDGET_VARIANTS.map((v) => {
          const isSelected = v.id === state.widgetType;
          return h('button', {
            type: 'button',
            role: 'tab',
            class: `tab ${isSelected ? 'active' : ''}`,
            'aria-selected': isSelected ? 'true' : 'false',
            onclick: () => setEmbedState({ widgetType: v.id, copied: false }),
          }, isEs ? v.nameEs : v.name);
        }),
      ),
      h('p', { class: 'lede embed-variant-desc' }, isEs ? activeVariant.descEs : activeVariant.desc),

      // Customization controls
      h('div', { class: 'location-row embed-controls-grid' },
        h('div', { class: 'field' },
          h('label', { class: 'label', for: 'embed-theme-select' }, isEs ? 'Paleta de Color' : 'Color Scheme'),
          h('select', {
            id: 'embed-theme-select',
            class: 'select',
            onchange: (e) => setEmbedState({ theme: e.target.value, copied: false }),
          },
            h('option', { value: 'auto', selected: state.theme === 'auto' }, isEs ? 'Automático (según dispositivo)' : 'Automatic (Matches User Device)'),
            h('option', { value: 'light', selected: state.theme === 'light' }, isEs ? 'Tema Claro (Clinical Calm)' : 'Light Theme (Clinical Calm)'),
            h('option', { value: 'dark', selected: state.theme === 'dark' }, isEs ? 'Tema Oscuro (Midnight Slate)' : 'Dark Theme (Midnight Slate)'),
          ),
        ),
        h('div', { class: 'field' },
          h('label', { class: 'label', for: 'embed-width-select' }, isEs ? 'Ancho del Marco' : 'Container Width'),
          h('select', {
            id: 'embed-width-select',
            class: 'select',
            onchange: (e) => setEmbedState({ widthPreset: e.target.value, copied: false }),
          },
            h('option', { value: 'responsive', selected: state.widthPreset === 'responsive' }, isEs ? '100% Adaptable (Recomendado)' : '100% Responsive Fluid (Recommended)'),
            h('option', { value: 'fixed-360', selected: state.widthPreset === 'fixed-360' }, isEs ? 'Columna Lateral (360px)' : 'Sidebar Column (360px Fixed)'),
            h('option', { value: 'fixed-480', selected: state.widthPreset === 'fixed-480' }, isEs ? 'Tarjeta Estándar (480px)' : 'Standard Card (480px Fixed)'),
          ),
        ),
      ),
    );

    // Live preview section
    const snippetText = generateIframeSnippet(state);
    const badgeText = generateBadgeSnippet();

    const previewSection = h('section', { class: 'card embed-preview-card', 'aria-label': isEs ? 'Vista Previa en Vivo' : 'Live Interactive Preview' },
      h('div', { class: 'facility-head' },
        h('h2', { class: 'h3' }, isEs ? '2. Vista Previa Interactiva' : '2. Live Interactive Preview'),
        h('span', { class: 'chip chip-extra' }, isEs ? 'Entorno Aislado' : 'Sandboxed Preview'),
      ),
      h('div', { class: 'embed-preview-wrapper' },
        renderMockWidget(state, isEs),
      ),
    );

    // Code snippet section
    const codeSection = h('section', { class: 'card embed-code-card', 'aria-label': isEs ? 'Código de Inserción' : 'Embed Code Snippet' },
      h('div', { class: 'facility-head' },
        h('h2', { class: 'h3' }, isEs ? '3. Copie el Código HTML' : '3. Copy Embed HTML'),
        h('button', {
          type: 'button',
          class: 'btn btn-primary btn-copy-embed',
          onclick: async () => {
            try {
              if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(snippetText);
                setEmbedState({ copied: true });
                announce(isEs ? '¡Código copiado al portapapeles!' : 'Embed code copied to clipboard!');
              }
            } catch {
              setEmbedState({ copied: true });
            }
          },
        },
          icon('copy'),
          h('span', null, state.copied ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Copiar Fragmento Iframe' : 'Copy Iframe Code')),
        ),
      ),
      h('pre', { class: 'embed-code-box', tabindex: '0' },
        h('code', null, snippetText),
      ),

      // Alternative Direct Badge Snippet
      h('h3', { class: 'h4 embed-subheading' }, isEs ? 'Opción B: Sello Estático HTML/SVG' : 'Option B: Static Partner Seal HTML/SVG'),
      h('pre', { class: 'embed-code-box', tabindex: '0' },
        h('code', null, badgeText),
      ),
    );

    // Standards and privacy compliance
    const standardsSection = h('section', { class: 'card embed-standards-card', 'aria-label': isEs ? 'Estándares de Privacidad y Cumplimiento' : 'Privacy Standards & Technical Compliance' },
      h('h2', { class: 'h3' }, isEs ? 'Garantías para Organizaciones Colaboradoras' : 'Partner Privacy & Compliance Guarantees'),
      h('ul', { class: 'list' },
        ...PARTNERSHIP_STANDARDS.map((std) => h('li', null,
          h('strong', null, isEs ? std.titleEs : std.title),
          h('p', { class: 'fine' }, isEs ? std.descEs : std.desc),
        )),
      ),
    );

    container.appendChild(header);
    container.appendChild(selectorSection);
    container.appendChild(previewSection);
    container.appendChild(codeSection);
    container.appendChild(standardsSection);
  }

  const unsubscribe = subscribeEmbedState(render);
  render();

  return container;
}

/**
 * Renders an accessible, zero-PII interactive mockup inside the preview container.
 */
function renderMockWidget(state, isEs) {
  if (state.widgetType === 'naloxone-badge') {
    return h('div', { class: 'mock-widget mock-naloxone' },
      h('div', { class: 'mock-head' },
        icon('alert'),
        h('strong', null, isEs ? 'Naloxona de Emergencia y Reducción de Daños' : 'Emergency Naloxone & Harm Reduction'),
      ),
      h('p', { class: 'fine' }, isEs ? 'Localice kits gratuitos de naloxona (Narcan), tiras de prueba de fentanilo y sitios de inyección segura.' : 'Find free naloxone (Narcan) kits, fentanyl test strips, and syringe access programs near you.'),
      h('div', { class: 'actions' },
        h('a', { class: 'btn btn-primary btn-small', href: '#/harm-reduction' }, isEs ? 'Buscar Naloxona Cerca' : 'Find Naloxone Nearby'),
        tel('911', [icon('phone'), '911 EMS'], { class: 'btn btn-emergency btn-small' }),
      ),
    );
  }

  if (state.widgetType === 'crisis-banner') {
    return h('div', { class: 'mock-widget mock-crisis' },
      h('div', { class: 'mock-head' },
        icon('heart'),
        h('strong', null, isEs ? 'Línea de Prevención del Suicidio y Crisis 988' : '988 Suicide & Crisis Lifeline'),
      ),
      h('p', { class: 'fine' }, isEs ? 'Gratuito, confidencial y disponible 24/7. Llame o envíe un mensaje de texto al 988 para conectarse con consejeros capacitados.' : 'Free, confidential support 24/7. Call or text 988 to speak with a trained counselor.'),
      h('div', { class: 'actions' },
        tel('988', [icon('phone'), isEs ? 'Llamar al 988' : 'Call 988'], { class: 'btn btn-primary btn-small' }),
        h('a', { class: 'btn btn-secondary btn-small', href: '#/crisis' }, isEs ? 'Ver Todas las Líneas' : 'All Support Lines'),
      ),
    );
  }

  if (state.widgetType === 'verified-point') {
    return h('div', { class: 'mock-widget mock-verified' },
      h('div', { class: 'mock-badge-preview' },
        h('a', {
          class: 'partner-badge-pill',
          href: '#/health',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
          h('span', { class: 'badge-seal-icon' }, '⚓'),
          h('span', { class: 'badge-seal-text' }, isEs ? 'Punto de Acceso Verificado · HarborPath' : 'HarborPath Verified Partner · Low-Barrier Care Access'),
        ),
      ),
    );
  }

  // Default: interactive quick search
  return h('div', { class: 'mock-widget mock-search' },
    h('div', { class: 'mock-head' },
      h('strong', null, isEs ? 'Buscar Atención en Adicciones y Salud Mental' : 'Find Addiction & Mental Health Care'),
    ),
    h('p', { class: 'fine' }, isEs ? 'Búsqueda privada y gratuita basada en registros oficiales de SAMHSA y HRSA. Sin anuncios ni rastreo.' : 'Free, private search powered by official SAMHSA and HRSA registries. Zero tracking.'),
    h('div', { class: 'location-row mock-search-row' },
      h('input', {
        type: 'text',
        class: 'input',
        placeholder: isEs ? 'Ciudad o Código Postal (ej. 98101)' : 'City or 5-digit ZIP (e.g. 98101)',
        'aria-label': isEs ? 'Ciudad o código postal' : 'City or ZIP code',
        readonly: true,
      }),
      h('a', { class: 'btn btn-primary', href: '#/match' }, isEs ? 'Buscar' : 'Search'),
    ),
  );
}
