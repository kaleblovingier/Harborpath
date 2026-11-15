import { h, clear, ext, tel, icon, announce } from '../dom.js';
import { stateHref, stateSections } from '../components/stateResources.js';
import { telehealthList } from '../components/reach.js';
import { stateLegalCard, resetStateLegalCardState } from '../components/stateLegalCard.js';
import { regionsApi } from '../regionsApi.js';
import { state, onQuickExit } from '../state.js';
import { t, getLang } from '../i18n.js';
import { buildTerritoryAndRuralFallback } from './territoryEquity.js';
import { setNavigatorHandoffState } from './navigatorHandoff.js';
import { pageHeader, section, p, fine, ul, strong } from './common.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetStatesState);

const tr = (en, es) => (getLang() === 'es' ? es : en);

export const RURAL_FRONTIER_GUIDE = {
  code: 'RURAL',
  name: 'Rural & Frontier Communities (200–250 Mile Reach)',
  nameEs: 'Comunidades rurales y fronterizas (alcance de 200 a 250 millas)',
  agency: 'HRSA Federal Office of Rural Health Policy, CMS Rural Health Clinics & IHS',
  crisisLine: '988',
  crisisLabel: '988 Suicide & Crisis Lifeline (Call or Text 988)',
  helpline: '1-800-662-4357',
  helplineLabel: 'SAMHSA National Helpline (1-800-662-4357)',
  maxRadiusMiles: 250,
  frontierReachMiles: '200–250 miles',
  networks: ['rhc', 'ihs', 'va', 'er', 'clinics', 'telehealth'],
  samhsaCodes: ['TELE', 'BU', 'OTP', 'SS', 'ITU'],
  summary:
    'In rural and frontier counties, the nearest specialty residential program or Opioid Treatment Program (OTP) can be 100 to 250 miles away. HarborPath expands searches up to 200–250 miles and bridges distance gaps with statewide audio/video telehealth (buprenorphine initiation from home), CMS-certified Rural Health Clinics (rhc), Indian Health Service & Tribal 638 clinics (ihs), VA & Vet Centers (va), and HRSA sliding-fee health centers.',
  summaryEs:
    'En zonas rurales y fronterizas, el programa residencial o clínica de metadona (OTP) más cercano puede estar a 100–250 millas. HarborPath amplía la búsqueda hasta 200–250 millas y conecta con telesalud estatal por teléfono o video, Clínicas de Salud Rural de CMS (rhc), clínicas del Servicio de Salud Indígena y Tribales (ihs), centros de VA (va) y centros de salud HRSA con tarifa variable.',
  plainSummary:
    'Live far from a city? You do not always have to drive 200 to 250 miles for help. Many doctors can start buprenorphine (Suboxone) over the phone or video. You can also use local Rural Health Clinics, Tribal clinics, VA clinics, or sliding-scale health centers near you.',
  plainSummaryEs:
    '¿Vive lejos de la ciudad? No siempre tiene que manejar 200 a 250 millas para recibir ayuda. Muchos médicos pueden iniciar buprenorfina por teléfono o video, o puede acudir a clínicas rurales, tribales, de VA o centros de salud de bajo costo.',
  actionLinks: [
    { label: 'Rural Health Clinics (CMS RHC)', network: 'rhc', href: '#/health?tab=federal&network=rhc' },
    { label: 'IHS & Tribal Health (IHS)', network: 'ihs', href: '#/health?tab=federal&network=ihs' },
    { label: 'VA & Vet Centers (VA)', network: 'va', href: '#/health?tab=federal&network=va' },
    { label: '24/7 Emergency Hospitals (ER)', network: 'er', href: '#/health?tab=federal&network=er' },
    { label: 'HRSA Sliding-Fee Health Centers', network: 'clinics', href: '#/health?tab=clinics' },
    { label: 'Telehealth Buprenorphine & Care', network: 'telehealth', href: '#/treatment?codes=TELE,BU' },
  ],
};

const TERRITORY_LIST = [
  {
    code: 'PR',
    name: 'Puerto Rico',
    nameEs: 'Puerto Rico',
    agency: 'ASSMCA (Administración de Servicios de Salud Mental y Contra la Adicción)',
    crisisLine: '1-800-981-0023',
    crisisLabel: 'ASSMCA Línea PAS: 1-800-981-0023 (24/7, free & confidential / gratis y confidencial, TDD 1-888-672-7622, or dial 988)',
    url: 'https://www.assmca.pr.gov/',
    medicaidName: 'Plan Vital (Puerto Rico Medicaid)',
    medicaidUrl: 'https://www.planvitalpr.com/',
    maxRadiusMiles: 250,
    frontierReachMiles: '200–250 miles island-wide & Caribbean reach',
    networks: ['clinics', 'va', 'er', 'rhc', 'ihs', 'telehealth'],
    samhsaCodes: ['TELE', 'BU', 'OTP', 'SS', 'MD'],
    summary:
      'ASSMCA operates the 24/7 bilingual Línea PAS (1-800-981-0023), state-funded methadone OTPs, and island-wide outpatient and residential stabilization. HRSA-funded Centros de Salud Primaria (330 Centers) and the VA Caribbean Healthcare System provide sliding-fee primary care, buprenorphine, and HIV/HCV care across main and offshore islands (Vieques and Culebra).',
    summaryEs:
      'ASSMCA opera la Línea PAS 24/7 (1-800-981-0023), programas de tratamiento con metadona (OTP) y centros ambulatorios y residenciales en toda la isla. Los Centros 330 financiados por HRSA y el Sistema de Salud de VA del Caribe ofrecen atención primaria con escala de tarifas, buprenorfina y pruebas de VIH/hepatitis C, incluyendo Vieques y Culebra.',
    plainSummary:
      'In Puerto Rico, call ASSMCA Línea PAS at 1-800-981-0023 anytime (24/7, free) for immediate support in Spanish or English. Plan Vital (Medicaid) and HRSA 330 clinics offer low-cost or free medication and counseling across the island, including telehealth for mountain municipalities, Vieques, and Culebra.',
    plainSummaryEs:
      'En Puerto Rico, llame a la Línea PAS de ASSMCA al 1-800-981-0023 las 24 horas (gratis) para apoyo inmediato. Plan Vital y los Centros 330 ofrecen medicamentos y consejería gratuitos o de bajo costo en toda la isla, incluyendo telesalud para zonas montañosas, Vieques y Culebra.',
    keyResources: [
      'ASSMCA Línea PAS 24/7 Crisis & Treatment Navigation: 1-800-981-0023 (or 988)',
      'HRSA 330 Community Health Centers (Centros 330) across all regions, Vieques & Culebra',
      'VA Caribbean Healthcare System (San Juan VAMC & Ponce/Mayagüez/Arecibo/Ceiba clinics)',
      'Statewide telehealth & mobile harm reduction (Intercambios Puerto Rico / Punto Fijo)',
    ],
  },
  {
    code: 'GU',
    name: 'Guam',
    nameEs: 'Guam',
    agency: 'Guam Behavioral Health and Wellness Center (GBHWC)',
    crisisLine: '671-647-5440',
    crisisLabel: 'GBHWC 24/7 Crisis Hotline: 671-647-5440 / 671-647-8833 (or dial 988)',
    url: 'https://gbhwc.guam.gov/',
    medicaidName: 'Guam Medicaid & MIP (Medically Indigent Program)',
    medicaidUrl: 'https://dphss.guam.gov/',
    maxRadiusMiles: 250,
    frontierReachMiles: '200–250 miles Western Pacific island reach',
    networks: ['clinics', 'va', 'er', 'rhc', 'ihs', 'telehealth'],
    samhsaCodes: ['TELE', 'BU', 'SS', 'MD'],
    summary:
      'Guam Behavioral Health and Wellness Center (GBHWC, 671-647-5440) in Tamuning is the territory’s single state agency for substance use, New Beginnings outpatient/recovery programs, detox, and 24/7 crisis stabilization. HRSA community health centers (Northern & Southern Region Community Health Centers), Guam Memorial Hospital ER, and the Guam VA CBOC & Vet Center provide sliding-fee and veteran care.',
    summaryEs:
      'El Centro de Salud Conductual y Bienestar de Guam (GBHWC, 671-647-5440) en Tamuning ofrece programas ambulatorios de recuperación (New Beginnings), desintoxicación y línea de crisis 24/7. Los centros de salud comunitarios de HRSA, el Hospital Memorial de Guam y la clínica de VA brindan atención de escala móvil y para veteranos.',
    plainSummary:
      'In Guam, call the Guam Behavioral Health and Wellness Center (GBHWC) at 671-647-5440 or 988 for free 24/7 help. GBHWC’s New Beginnings program, Northern and Southern Community Health Centers, and the Guam VA clinic provide low-cost treatment, medications, and telehealth without off-island travel.',
    plainSummaryEs:
      'En Guam, llame a GBHWC al 671-647-5440 o al 988 para recibir ayuda gratuita las 24 horas. El programa New Beginnings, los centros de salud comunitarios del Norte y Sur y la clínica de VA ofrecen tratamiento y telesalud de bajo costo.',
    keyResources: [
      'Guam Behavioral Health & Wellness Center (GBHWC): 671-647-5440 / New Beginnings SUD Program: 671-647-5406',
      'HRSA Northern & Southern Region Community Health Centers (sliding-fee scale regardless of insurance)',
      'Guam VA Community Based Outpatient Clinic (Agana Heights) & Guam Vet Center',
      'Guam Medicaid & Medically Indigent Program (MIP) coverage + telehealth prescribers',
    ],
  },
  {
    code: 'VI',
    name: 'U.S. Virgin Islands',
    nameEs: 'Islas Vírgenes de EE. UU.',
    agency: 'U.S. Virgin Islands Department of Health — Division of Behavioral Health, Alcoholism and Drug Dependency Services',
    crisisLine: '340-774-0930',
    crisisLabel: 'USVI DOH Behavioral Health: 340-774-0930 / 340-773-1311 (or dial 988)',
    url: 'https://doh.vi.gov/',
    medicaidName: 'U.S. Virgin Islands Medical Assistance Program (Medicaid)',
    medicaidUrl: 'https://dhs.vi.gov/',
    maxRadiusMiles: 250,
    frontierReachMiles: '200–250 miles inter-island reach (St. Thomas, St. Croix, St. John, Water Island)',
    networks: ['clinics', 'va', 'er', 'rhc', 'ihs', 'telehealth'],
    samhsaCodes: ['TELE', 'BU', 'SS', 'MD'],
    summary:
      'The USVI Department of Health Division of Behavioral Health coordinates publicly funded substance use and mental health care across St. Croix, St. Thomas, and St. John. HRSA-funded Federally Qualified Health Centers (St. Thomas East End Medical Center Corporation and Frederiksted Health Care on St. Croix), Schneider Regional Medical Center, Juan F. Luis Hospital, and VA clinics provide inter-island telehealth, buprenorphine, and sliding-scale care.',
    summaryEs:
      'La División de Salud Conductual del Departamento de Salud de las Islas Vírgenes coordina el tratamiento público en St. Croix, St. Thomas y St. John. Los centros de salud HRSA (St. Thomas East End Medical Center y Frederiksted Health Care), hospitales de emergencia y clínicas de VA ofrecen telesalud entre islas, buprenorfina y tarifas móviles.',
    plainSummary:
      'In the U.S. Virgin Islands (St. Thomas, St. Croix, St. John), call USVI Behavioral Health at 340-774-0930 or 988. You can get sliding-scale care at St. Thomas East End Medical Center or Frederiksted Health Care on St. Croix, or use phone/video telehealth so you do not have to take an inter-island ferry or flight.',
    plainSummaryEs:
      'En las Islas Vírgenes de EE. UU. (St. Thomas, St. Croix, St. John), llame al 340-774-0930 o al 988. Los centros de salud de St. Thomas East End y Frederiksted Health Care ofrecen atención con tarifa variable y telesalud sin necesidad de viajar en ferry o avión entre islas.',
    keyResources: [
      'USVI DOH Division of Behavioral Health (St. Thomas/St. John: 340-774-0930; St. Croix: 340-773-1311)',
      'HRSA Health Centers: St. Thomas East End Medical Center & Frederiksted Health Care (St. Croix)',
      'St. Thomas & St. Croix VA Clinics (linked to VA Caribbean Healthcare System)',
      'Inter-island telehealth & 200–250 mile search reach across USVI and Puerto Rico',
    ],
  },
  {
    code: 'AS',
    name: 'American Samoa',
    nameEs: 'Samoa Americana',
    agency: 'American Samoa Department of Human and Social Services (DHSS) & LBJ Tropical Medical Center Behavioral Health',
    crisisLine: '684-633-0315',
    crisisLabel: 'American Samoa DHSS Behavioral Health: 684-633-0315 / LBJ Tropical Medical Center: 684-633-1222 (or dial 988)',
    url: 'https://www.americansamoa.gov/',
    medicaidName: 'American Samoa Medicaid State Agency',
    medicaidUrl: 'https://www.medicaid.gov/state-overviews/american-samoa.html',
    maxRadiusMiles: 250,
    frontierReachMiles: '200–250 miles South Pacific & Manuʻa Islands reach',
    networks: ['clinics', 'va', 'er', 'rhc', 'ihs', 'telehealth'],
    samhsaCodes: ['TELE', 'BU', 'SS', 'MD'],
    summary:
      'American Samoa Department of Human and Social Services (DHSS) and LBJ Tropical Medical Center in Pago Pago / Fagaʻalu provide substance use counseling, medical withdrawal stabilization, emergency care, and crisis support. Department of Health HRSA-funded community health centers (Tafuna, Amouli, Leone, and Manuʻa Islands clinics) and the Pago Pago VA Clinic & Vet Center offer sliding-scale primary care and telehealth.',
    summaryEs:
      'El Departamento de Servicios Humanos y Sociales de Samoa Americana (DHSS) y el Centro Médico Tropical LBJ en Pago Pago brindan consejería sobre uso de sustancias, estabilización médica de abstinencia y atención de emergencia. Los centros de salud comunitarios financiados por HRSA y la clínica de VA ofrecen atención primaria con tarifa móvil y telesalud.',
    plainSummary:
      'In American Samoa, call DHSS Behavioral Health at 684-633-0315, LBJ Tropical Medical Center at 684-633-1222, or 988. You can get low-cost care at LBJ Tropical Medical Center, Tafuna and outer-village HRSA community health centers (including the Manuʻa Islands), or the Pago Pago VA clinic.',
    plainSummaryEs:
      'En Samoa Americana, llame a Salud Conductual de DHSS al 684-633-0315, al Centro Médico Tropical LBJ al 684-633-1222 o al 988. Puede recibir atención de bajo costo en LBJ, centros de salud comunitarios de HRSA (incluyendo las islas Manuʻa) y la clínica de VA de Pago Pago.',
    keyResources: [
      'American Samoa DHSS Behavioral Health Services (684-633-0315) & LBJ Tropical Medical Center (684-633-1222)',
      'ASDOH HRSA Community Health Centers (Tafuna Family Health Center, Leone, Amouli, Taʻū & Ofu clinics)',
      'VA American Samoa Community Based Outpatient Clinic & Vet Center (Pago Pago)',
      'Telehealth & off-island medical referral coordination via American Samoa Medicaid',
    ],
  },
  {
    code: 'MP',
    name: 'Northern Mariana Islands',
    nameEs: 'Islas Marianas del Norte',
    agency: 'Commonwealth Healthcare Corporation (CHCC) — Community Guidance Center (CGC)',
    crisisLine: '670-323-6560',
    crisisLabel: 'CHCC Community Guidance Center (Saipan/Tinian/Rota): 670-323-6560 / Crisis: 670-284-0843 (or dial 988)',
    url: 'https://www.chcc.health/',
    medicaidName: 'CNMI Medical Assistance Program (Medicaid)',
    medicaidUrl: 'https://medicaid.cnmi.gov/',
    maxRadiusMiles: 250,
    frontierReachMiles: '200–250 miles Marianas inter-island reach (Saipan, Tinian, Rota)',
    networks: ['clinics', 'va', 'er', 'rhc', 'ihs', 'telehealth'],
    samhsaCodes: ['TELE', 'BU', 'SS', 'MD'],
    summary:
      'The Commonwealth Healthcare Corporation (CHCC) Community Guidance Center (CGC, 670-323-6560) in Saipan oversees substance use treatment, recovery support, crisis stabilization, and prevention across Saipan, Tinian, and Rota. CHCC operates the hospital emergency department, HRSA-funded Kagman Isla Community Health and Tinian/Rota health centers, and inter-island telehealth.',
    summaryEs:
      'El Centro de Orientación Comunitaria (CGC, 670-323-6560) de Commonwealth Healthcare Corporation (CHCC) en Saipán supervisa el tratamiento del uso de sustancias, apoyo de recuperación y estabilización de crisis en Saipán, Tinian y Rota, junto con centros de salud HRSA y telesalud entre islas.',
    plainSummary:
      'In the Northern Mariana Islands (Saipan, Tinian, Rota), call the CHCC Community Guidance Center at 670-323-6560 or 988. CHCC Hospital, Kagman Isla Community Health, and the Tinian and Rota Health Centers offer sliding-scale care, medications, and phone/video telehealth between islands.',
    plainSummaryEs:
      'En las Islas Marianas del Norte (Saipán, Tinian, Rota), llame al Centro de Orientación Comunitaria de CHCC al 670-323-6560 o al 988. El hospital CHCC y los centros de salud de Saipán, Tinian y Rota ofrecen atención con escala móvil y telesalud entre islas.',
    keyResources: [
      'CHCC Community Guidance Center (CGC) Substance Use & Mental Health: 670-323-6560',
      'CHCC Hospital Emergency & Inpatient Stabilization (Saipan) + Tinian & Rota Health Centers',
      'HRSA-funded Kagman Isla Community Health Center (sliding-fee scale)',
      'Saipan VA Outreach Clinic & inter-island telehealth across Saipan, Tinian, and Rota',
    ],
  },
];

for (const item of TERRITORY_LIST) {
  Object.defineProperty(TERRITORY_LIST, item.code, {
    value: item,
    enumerable: false,
    configurable: false,
    writable: false,
  });
}
Object.defineProperty(TERRITORY_LIST, 'RURAL', {
  value: RURAL_FRONTIER_GUIDE,
  enumerable: false,
  configurable: false,
  writable: false,
});

export const TERRITORY_EQUITY_GUIDES = TERRITORY_LIST;

export function getTerritoryEquityGuide(code) {
  const clean = String(code ?? '').trim().toUpperCase();
  if (!clean) return null;
  if (clean === 'RURAL') return RURAL_FRONTIER_GUIDE;
  return TERRITORY_EQUITY_GUIDES.find((g) => g.code === clean) ?? null;
}

const statesViewState = {
  filterQuery: '',
  plainLanguage: false,
  lastStateCode: '',
};

let activeStatesReset = null;

export function getStatesState() {
  return {
    filterQuery: statesViewState.filterQuery,
    plainLanguage: Boolean(statesViewState.plainLanguage),
    lastStateCode: statesViewState.lastStateCode,
  };
}

export function resetStatesState() {
  statesViewState.filterQuery = '';
  statesViewState.plainLanguage = false;
  statesViewState.lastStateCode = '';
  resetStateLegalCardState();
  if (typeof activeStatesReset === 'function') {
    activeStatesReset();
  }
}

/**
 * Renders an actionable Rural, Frontier & U.S. Territory Equity Reach Card
 * surfacing statewide telehealth, HRSA sliding-scale clinics, CMS Rural Health
 * Clinics (rhc), IHS/Tribal facilities (ihs), VA/Vet Centers (va), and all 5
 * U.S. island territory behavioral health agencies & crisis lines.
 */
export function buildRuralTerritoryReachCard({ stateCode, onSelectNetwork, plainLanguage = false } = {}) {
  const resolvedCode = String(stateCode || state.location?.state || '').trim().toUpperCase();
  const reach = buildTerritoryAndRuralFallback({ location: { state: resolvedCode, rural: true } });
  const territoryGuide = getTerritoryEquityGuide(resolvedCode);
  const isEs = getLang() === 'es';

  const handleNetworkClick = (net, fallbackHref) => (e) => {
    if (typeof onSelectNetwork === 'function') {
      e.preventDefault();
      onSelectNetwork(net);
    } else if (fallbackHref) {
      location.replace(fallbackHref);
    }
  };

  const territoryHighlight = territoryGuide && territoryGuide.code !== 'RURAL'
    ? h('div', { class: 'callout callout-info', id: `territory-equity-${territoryGuide.code.toLowerCase()}` },
      h('p', { class: 'callout-title' },
        icon('compass'),
        isEs
          ? `Recursos de equidad y acceso en ${territoryGuide.nameEs} (${territoryGuide.code})`
          : `Island Equity & Care Access in ${territoryGuide.name} (${territoryGuide.code})`),
      p(strong(territoryGuide.agency)),
      p(plainLanguage
        ? (isEs ? territoryGuide.plainSummaryEs : territoryGuide.plainSummary)
        : (isEs ? territoryGuide.summaryEs : territoryGuide.summary)),
      ul(territoryGuide.keyResources),
      h('div', { class: 'actions' },
        tel(territoryGuide.crisisLine, [icon('phone'), territoryGuide.crisisLabel], {
          class: 'btn btn-primary btn-small',
          'aria-label': `Call ${territoryGuide.crisisLabel}`,
        }),
        territoryGuide.url && ext(territoryGuide.url, isEs ? 'Sitio oficial de la agencia' : 'Official agency website'),
        territoryGuide.medicaidUrl && ext(territoryGuide.medicaidUrl, territoryGuide.medicaidName),
        h('a', { class: 'btn btn-secondary btn-small', href: stateHref(territoryGuide.code) },
          icon('map'),
          isEs ? `Directorio completo de ${territoryGuide.code}` : `Full ${territoryGuide.code} resource page`),
      ),
    )
    : null;

  const ruralLeadText = plainLanguage
    ? (isEs ? RURAL_FRONTIER_GUIDE.plainSummaryEs : RURAL_FRONTIER_GUIDE.plainSummary)
    : (isEs ? RURAL_FRONTIER_GUIDE.summaryEs : RURAL_FRONTIER_GUIDE.summary);

  return h('section', {
    class: 'card print-handout rural-territory-reach-card',
    id: 'rural-territory-reach',
    'aria-labelledby': 'rural-territory-reach-title',
  },
    h('div', { class: 'facility-head' },
      h('h3', { id: 'rural-territory-reach-title', class: 'facility-name' },
        icon('compass'), ' ',
        tr(
          'Rural, Frontier (200–250 Mile) & U.S. Territory Care Reach',
          'Alcance de atención rural, fronteriza (200–250 millas) y territorios de EE. UU.',
        )),
      h('span', { class: 'chip chip-care' },
        tr(`Up to ${reach.radius} mi + Telehealth & Island Safety-Net`, `Hasta ${reach.radius} mi + Telesalud y red de islas`)),
    ),
    p(ruralLeadText),
    territoryHighlight,
    h('div', { class: 'actions no-print' },
      h('a', {
        class: 'btn btn-primary btn-small',
        href: '#/treatment',
        'data-navigator-handoff': 'true',
        onclick: () => setNavigatorHandoffState({ codes: ['TELE', 'BU'] }),
        'aria-label': tr('Search telehealth buprenorphine and treatment programs', 'Buscar programas de telesalud y buprenorfina'),
      }, icon('phone'), tr('Statewide Telehealth & Buprenorphine (TELE)', 'Telesalud estatal y buprenorfina (TELE)')),
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: '#/health?tab=clinics',
        onclick: typeof onSelectNetwork === 'function' ? handleNetworkClick('clinics', '#/health?tab=clinics') : null,
        'aria-label': tr('Find HRSA sliding-fee health centers', 'Buscar centros de salud HRSA con tarifa móvil'),
      }, icon('heart'), tr('HRSA Sliding-Fee Clinics', 'Clínicas HRSA (escala móvil)')),
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: '#/health?tab=federal&network=rhc',
        onclick: typeof onSelectNetwork === 'function' ? handleNetworkClick('rhc', '#/health?tab=federal&network=rhc') : null,
        'aria-label': tr('Search CMS Rural Health Clinics (RHC)', 'Buscar Clínicas de Salud Rural de CMS (RHC)'),
      }, icon('building'), tr('CMS Rural Health Clinics (RHC)', 'Clínicas de Salud Rural (RHC)')),
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: '#/health?tab=federal&network=ihs',
        onclick: typeof onSelectNetwork === 'function' ? handleNetworkClick('ihs', '#/health?tab=federal&network=ihs') : null,
        'aria-label': tr('Search Indian Health Service and Tribal facilities (IHS)', 'Buscar centros del Servicio de Salud Indígena y Tribales (IHS)'),
      }, icon('compass'), tr('IHS & Tribal Health (IHS)', 'Salud Indígena y Tribal (IHS)')),
      h('a', {
        class: 'btn btn-secondary btn-small',
        href: '#/health?tab=federal&network=va',
        onclick: typeof onSelectNetwork === 'function' ? handleNetworkClick('va', '#/health?tab=federal&network=va') : null,
        'aria-label': tr('Search VA Medical Centers and Vet Centers', 'Buscar centros médicos de VA y Vet Centers'),
      }, icon('shield'), tr('VA & Vet Centers (VA)', 'VA y Vet Centers (VA)')),
    ),
    h('details', { class: 'facility-details' },
      h('summary', {
        'aria-label': tr(
          'U.S. Island Territories Direct Behavioral Health & Crisis Lines (PR, GU, VI, AS, MP)',
          'Líneas directas de salud conductual y crisis en territorios insulares de EE. UU. (PR, GU, VI, AS, MP)',
        ),
      }, tr(
        'U.S. Island Territories Direct Behavioral Health & Crisis Directory (PR, GU, VI, AS, MP)',
        'Directorio directo de territorios insulares de EE. UU. (PR, GU, VI, AS, MP)',
      )),
      h('ul', { class: 'resource-list' },
        TERRITORY_EQUITY_GUIDES.map((tg) => h('li', { class: 'resource', id: `territory-guide-${tg.code.toLowerCase()}` },
          h('p', { class: 'resource-name' },
            h('a', { href: stateHref(tg.code) }, `${tg.name} (${tg.code})`),
            ' — ',
            strong(tg.agency)),
          h('p', { class: 'resource-desc' },
            plainLanguage
              ? (isEs ? tg.plainSummaryEs : tg.plainSummary)
              : (isEs ? tg.summaryEs : tg.summary)),
          h('p', { class: 'actions' },
            tel(tg.crisisLine, [icon('phone'), tg.crisisLabel], {
              class: 'btn btn-small btn-secondary',
              'aria-label': `Call ${tg.name} hotline ${tg.crisisLine}`,
            }),
            h('a', {
              class: 'btn btn-small btn-ghost',
              href: stateHref(tg.code),
              'aria-label': `Open ${tg.name} territory resource page`,
            }, icon('map'), tr(`All ${tg.code} resources`, `Todos los recursos de ${tg.code}`)),
          ),
        )),
      ),
    ),
  );
}

// ---------------------------------------------------------------- States & Territories Directory (#/states and #/state/:code)
export function statesView() {
  const body = h('div', { 'aria-live': 'polite' },
    h('p', { class: 'help' }, t('reach.loading', 'Loading…')));

  const equityContainer = h('div', { id: 'states-equity-container' });
  const filterInput = h('input', {
    type: 'search',
    id: 'states-filter-input',
    class: 'input',
    value: statesViewState.filterQuery,
    placeholder: tr('Filter states or territories by name or 2-letter code (e.g., PR, Guam, WA)…', 'Filtrar estados o territorios por nombre o código (ej. PR, Guam, WA)…'),
    'aria-label': tr('Filter states and territories', 'Filtrar estados y territorios'),
  });

  const plainBtn = h('button', {
    type: 'button',
    id: 'states-plain-language-toggle',
    class: 'preset',
    'aria-pressed': String(Boolean(statesViewState.plainLanguage)),
    onclick: () => {
      statesViewState.plainLanguage = !statesViewState.plainLanguage;
      plainBtn.setAttribute('aria-pressed', String(statesViewState.plainLanguage));
      if (statesViewState.plainLanguage) plainBtn.setAttribute('aria-current', 'true');
      else plainBtn.removeAttribute('aria-current');
      renderEquitySection();
      announce(statesViewState.plainLanguage
        ? tr('Plain-language summary enabled.', 'Resumen en lenguaje sencillo activado.')
        : tr('Standard clinical detail enabled.', 'Detalle estándar activado.'));
    },
  }, icon('info'), ' ', tr('Plain-language summary (6th-grade reading level)', 'Resumen en lenguaje sencillo'));

  let loadedStates = null;

  function renderEquitySection() {
    clear(equityContainer).append(
      buildRuralTerritoryReachCard({
        stateCode: state.location?.state,
        plainLanguage: statesViewState.plainLanguage,
      }),
    );
  }

  function renderDirectory(statesList) {
    clear(body);
    const q = String(statesViewState.filterQuery || '').trim().toLowerCase();
    const matches = (s) => !q
      || s.name.toLowerCase().includes(q)
      || s.code.toLowerCase().includes(q);

    const stateItems = statesList.filter((s) => !['AS', 'GU', 'MP', 'PR', 'VI'].includes(s.code) && matches(s));
    const territoryItems = statesList.filter((s) => ['AS', 'GU', 'MP', 'PR', 'VI'].includes(s.code) && matches(s));

    const grid = (list) => h('ul', { class: 'state-grid' },
      list.map((s) => h('li', null,
        h('a', { class: 'card state-link', href: stateHref(s.code) },
          h('span', { class: 'state-name' }, s.name),
          h('span', { class: 'state-code' }, s.code)))));

    body.append(
      stateItems.length
        ? section('us-states', t('regions.statesHeading', 'States & District of Columbia'), grid(stateItems))
        : null,
      territoryItems.length
        ? section('us-territories', t('regions.territoriesHeading', 'U.S. territories'), grid(territoryItems))
        : null,
    );
  }

  filterInput.addEventListener('input', (e) => {
    statesViewState.filterQuery = e.target.value ?? '';
    if (loadedStates) renderDirectory(loadedStates);
  });

  activeStatesReset = () => {
    filterInput.value = '';
    plainBtn.setAttribute('aria-pressed', 'false');
    plainBtn.removeAttribute('aria-current');
    renderEquitySection();
    if (loadedStates) renderDirectory(loadedStates);
  };

  renderEquitySection();

  regionsApi.states()
    .then(({ states }) => {
      loadedStates = states;
      renderDirectory(states);
    })
    .catch((err) => {
      clear(body).append(h('div', { class: 'callout callout-warn', role: 'alert' }, p(err.message)));
    });

  return h('div', { class: 'view' },
    pageHeader(
      t('regions.directoryTitle', 'Resources by state and territory'),
      t('regions.directoryLede', 'Find your state or territory’s substance use and mental health agency, Medicaid behavioral health contacts, statewide telehealth programs, and naloxone access links.'),
    ),
    h('div', { class: 'actions no-print' },
      plainBtn,
      fine(tr('Preferences stay in your browser’s memory and are cleared on Quick exit.', 'Las preferencias permanecen en la memoria de su navegador y se borran con Salida rápida.')),
    ),
    equityContainer,
    h('div', { class: 'finder-search no-print' },
      h('div', { class: 'combo' }, icon('search'), filterInput),
    ),
    body,
  );
}

export function stateDetailView({ code } = {}) {
  const cleanCode = String(code ?? '').toUpperCase();
  statesViewState.lastStateCode = cleanCode;
  const container = h('div', { class: 'view' },
    pageHeader(t('reach.loading', 'Loading…')));

  regionsApi.state(cleanCode)
    .then((data) => {
      document.title = `${data.region.name} · HarborPath`;
      const telehealth = data.telehealth
        ? telehealthList({ region: data.region, kind: 'sa', codes: [], headingLevel: 3 })
        : null;
      const equityCard = buildRuralTerritoryReachCard({
        stateCode: cleanCode,
        plainLanguage: statesViewState.plainLanguage,
      });
      const legalCard = stateLegalCard(data.legal, {
        stateCode: cleanCode,
        stateName: data.region?.name,
        plainLanguage: statesViewState.plainLanguage,
      });
      clear(container).append(
        pageHeader(
          t('regions.panelTitle', 'Resources in {state}', { state: data.region.name }),
          t('regions.statePageLede', 'State-funded treatment agency, Medicaid coverage, telehealth programs, and harm reduction resources.'),
          p(h('a', { href: '#/states' }, t('regions.backToStates', '← All states and territories'))),
        ),
        equityCard,
        legalCard,
        ...stateSections(data, { telehealth }),
      );
    })
    .catch(() => {
      clear(container).append(
        pageHeader(t('regions.unknownState', 'State or territory not found')),
        p(h('a', { class: 'btn btn-primary', href: '#/states' }, t('regions.browseLink', 'Browse resources by state or territory'))),
      );
    });

  return container;
}
