import { api } from './api.js';
import { state, subscribe, wipeAll, runQuickExitHandlers, onQuickExit } from './state.js';
import { initI18n, onLanguageChange, isPlainLanguage, setPlainLanguage, t, formatDate } from './i18n.js';
import { announce, h, tel, icon } from './dom.js';
import {
  homeView,
  treatmentView,
  healthView,
  statesView,
  stateDetailView,
  savedView,
  crisisView,
  privacyView,
  notFoundView,
} from './views/core.js';
// The overdose steps load with the app, never on demand: a phone that loses
// signal after the first page must still show them (see viewLoadFailed), with
// or without the opt-in offline copy.
import { overdoseGuide } from './components/overdose.js';
import { pageHeader, emergencyCallout, hotlineGrid } from './views/common.js';
import { HOTLINES } from './content/hotlines.js';
// The header's Emergency button (naloxone and rescue breathing steps) must open
// with no signal too, so its drawer is not downloaded on first press.
import * as emergencyDrawer from './components/emergencyDrawer.js';
import { trackPageView, trackHotlineClick } from './telemetry.js';

const SITE = 'HarborPath';
const EXIT_URL = 'https://www.weather.gov/';

// Core routes are synchronously available at startup for zero-latency first paint.
export const SYNC_VIEWS = {
  '': homeView,
  treatment: treatmentView,
  health: healthView,
  states: statesView,
  saved: savedView,
  crisis: crisisView,
  privacy: privacyView,
};

// Heavy clinical, matching, guided triage, and educational views are dynamically
// imported on demand, cached in memory, and preloaded on link hover/focus (never
// on Save-Data or 2G connections, and never all at once on page load).
export const viewCache = new Map();
const pendingLoads = new Map();
// Register a reset with each loaded new view so Quick Exit can clear its
// in-memory state synchronously, before navigating away.
const routeResets = new Map();

function loadGuidesModule() {
  return import('./views/guides.js').then((m) => {
    viewCache.set('harm-reduction', m.harmReductionView);
    viewCache.set('overdose', m.overdoseView);
    viewCache.set('support', m.supportView);
    viewCache.set('choosing-care', m.choosingCareView);
    return m;
  });
}

export const LAZY_LOADERS = {
  'inhalant-toxicology': () => import('./views/inhalantToxicology.js').then((m) => {
    viewCache.set('inhalant-toxicology', m.inhalantToxicologyView);
    routeResets.set('inhalant-toxicology', m.resetInhalantState);
    return m.inhalantToxicologyView;
  }),
  'adulterant-heavy-metals': () => import('./views/adulterantHeavyMetals.js').then((m) => {
    viewCache.set('adulterant-heavy-metals', m.adulterantHeavyMetalsView);
    routeResets.set('adulterant-heavy-metals', m.resetAdulterantState);
    return m.adulterantHeavyMetalsView;
  }),
  'peri-overdose-pulmonary': () => import('./views/periOverdosePulmonary.js').then((m) => {
    viewCache.set('peri-overdose-pulmonary', m.periOverdosePulmonaryView);
    routeResets.set('peri-overdose-pulmonary', m.resetPulmonaryState);
    return m.periOverdosePulmonaryView;
  }),
  'disaster-moud-climate': () => import('./views/disasterMoudClimate.js').then((m) => {
    viewCache.set('disaster-moud-climate', m.disasterMoudClimateView);
    routeResets.set('disaster-moud-climate', m.resetDisasterState);
    return m.disasterMoudClimateView;
  }),
  'movement-disorders-eps': () => import('./views/movementDisordersEps.js').then((m) => {
    viewCache.set('movement-disorders-eps', m.movementDisordersEpsView);
    routeResets.set('movement-disorders-eps', m.resetMovementState);
    return m.movementDisordersEpsView;
  }),
  'fungal-opportunistic-care': () => import('./views/fungalOpportunisticCare.js').then((m) => {
    viewCache.set('fungal-opportunistic-care', m.fungalOpportunisticCareView);
    routeResets.set('fungal-opportunistic-care', m.resetFungalState);
    return m.fungalOpportunisticCareView;
  }),
  'nsti-wound-staging': () => import('./views/nstiWoundStaging.js').then((m) => {
    viewCache.set('nsti-wound-staging', m.nstiWoundStagingView);
    routeResets.set('nsti-wound-staging', m.resetNstiState);
    return m.nstiWoundStagingView;
  }),
  'pediatric-ingestion-decon': () => import('./views/pediatricIngestionDecon.js').then((m) => {
    viewCache.set('pediatric-ingestion-decon', m.pediatricIngestionDeconView);
    routeResets.set('pediatric-ingestion-decon', m.resetPediatricDeconState);
    return m.pediatricIngestionDeconView;
  }),
  'carceral-moud-reentry': () => import('./views/carceralMoudReentry.js').then((m) => {
    viewCache.set('carceral-moud-reentry', m.carceralMoudReentryView);
    routeResets.set('carceral-moud-reentry', m.resetCarceralReentryState);
    return m.carceralMoudReentryView;
  }),
  'toxic-alcohol': () => import('./views/toxicAlcohol.js').then((m) => {
    viewCache.set('toxic-alcohol', m.toxicAlcoholView);
    routeResets.set('toxic-alcohol', m.resetToxicAlcoholState);
    return m.toxicAlcoholView;
  }),
  'mass-overdose-mci': () => import('./views/massOverdoseMci.js').then((m) => {
    viewCache.set('mass-overdose-mci', m.massOverdoseMciView);
    routeResets.set('mass-overdose-mci', m.resetMassOverdoseMciState);
    return m.massOverdoseMciView;
  }),
  'moud-directive': () => import('./views/moudDirective.js').then((m) => {
    viewCache.set('moud-directive', m.moudDirectiveView);
    routeResets.set('moud-directive', m.resetMoudDirectiveState);
    return m.moudDirectiveView;
  }),
  'encampment-medicine': () => import('./views/encampmentMedicine.js').then((m) => {
    viewCache.set('encampment-medicine', m.encampmentMedicineView);
    routeResets.set('encampment-medicine', m.resetEncampmentMedicineState);
    return m.encampmentMedicineView;
  }),
  'street-trauma': () => import('./views/streetTrauma.js').then((m) => {
    viewCache.set('street-trauma', m.streetTraumaView);
    routeResets.set('street-trauma', m.resetStreetTraumaState);
    return m.streetTraumaView;
  }),
  'fhir-export': () => import('./views/fhirExport.js').then((m) => {
    viewCache.set('fhir-export', m.fhirExportView);
    routeResets.set('fhir-export', m.resetFhirExportState);
    return m.fhirExportView;
  }),
  'burn-toxicology': () => import('./views/burnToxicology.js').then((m) => {
    viewCache.set('burn-toxicology', m.burnToxicologyView);
    routeResets.set('burn-toxicology', m.resetBurnToxicologyState);
    return m.burnToxicologyView;
  }),
  embed: () => import('./views/embedBuilder.js').then((m) => {
    viewCache.set('embed', m.embedBuilderView);
    routeResets.set('embed', m.resetEmbedBuilderState);
    return m.embedBuilderView;
  }),
  outreach: () => import('./views/outreachMaterials.js').then((m) => {
    viewCache.set('outreach', m.outreachMaterialsView);
    routeResets.set('outreach', m.resetOutreachMaterialsState);
    return m.outreachMaterialsView;
  }),
  admin: () => import('./views/adminMetrics.js').then((m) => {
    viewCache.set('admin', m.adminMetricsView);
    routeResets.set('admin', m.resetAdminMetricsState);
    return m.adminMetricsView;
  }),
  'pediatric-exposures': () => import('./views/pediatricExposures.js').then((m) => {
    viewCache.set('pediatric-exposures', m.pediatricExposuresView);
    routeResets.set('pediatric-exposures', m.resetPediatricState);
    return m.pediatricExposuresView;
  }),
  'geriatric-care': () => import('./views/geriatricCare.js').then((m) => {
    viewCache.set('geriatric-care', m.geriatricCareView);
    routeResets.set('geriatric-care', m.resetGeriatricState);
    return m.geriatricCareView;
  }),
  'icu-perioperative': () => import('./views/icuPerioperative.js').then((m) => {
    viewCache.set('icu-perioperative', m.icuPerioperativeView);
    routeResets.set('icu-perioperative', m.resetIcuState);
    return m.icuPerioperativeView;
  }),
  'obstetric-emergencies': () => import('./views/obstetricEmergencies.js').then((m) => {
    viewCache.set('obstetric-emergencies', m.obstetricEmergenciesView);
    routeResets.set('obstetric-emergencies', m.resetObstetricState);
    return m.obstetricEmergenciesView;
  }),
  'oncology-palliative': () => import('./views/oncologyPalliative.js').then((m) => {
    viewCache.set('oncology-palliative', m.oncologyPalliativeView);
    routeResets.set('oncology-palliative', m.resetOncologyState);
    return m.oncologyPalliativeView;
  }),
  'cardiology-care': () => import('./views/cardiologyCare.js').then((m) => {
    viewCache.set('cardiology-care', m.cardiologyCareView);
    routeResets.set('cardiology-care', m.resetCardiologyState);
    return m.cardiologyCareView;
  }),
  'dermatology-care': () => import('./views/dermatologyCare.js').then((m) => {
    viewCache.set('dermatology-care', m.dermatologyCareView);
    routeResets.set('dermatology-care', m.resetDermatologyState);
    return m.dermatologyCareView;
  }),
  'ent-care': () => import('./views/entCare.js').then((m) => {
    viewCache.set('ent-care', m.entCareView);
    routeResets.set('ent-care', m.resetEntState);
    return m.entCareView;
  }),
  'urology-care': () => import('./views/urologyCare.js').then((m) => {
    viewCache.set('urology-care', m.urologyCareView);
    routeResets.set('urology-care', m.resetUrologyState);
    return m.urologyCareView;
  }),
  'ocular-care': () => import('./views/ocularCare.js').then((m) => {
    viewCache.set('ocular-care', m.ocularCareView);
    routeResets.set('ocular-care', m.resetOcularState);
    return m.ocularCareView;
  }),
  'orthopedic-care': () => import('./views/orthopedicCare.js').then((m) => {
    viewCache.set('orthopedic-care', m.orthopedicCareView);
    routeResets.set('orthopedic-care', m.resetOrthopedicState);
    return m.orthopedicCareView;
  }),
  'hematology-care': () => import('./views/hematologyCare.js').then((m) => {
    viewCache.set('hematology-care', m.hematologyCareView);
    routeResets.set('hematology-care', m.resetHematologyState);
    return m.hematologyCareView;
  }),
  'gi-care': () => import('./views/giCare.js').then((m) => {
    viewCache.set('gi-care', m.giCareView);
    routeResets.set('gi-care', m.resetGiState);
    return m.giCareView;
  }),
  'metabolic-care': () => import('./views/metabolicCare.js').then((m) => {
    viewCache.set('metabolic-care', m.metabolicCareView);
    routeResets.set('metabolic-care', m.resetMetabolicState);
    return m.metabolicCareView;
  }),
  'neurology-care': () => import('./views/neurologyCare.js').then((m) => {
    viewCache.set('neurology-care', m.neurologyCareView);
    routeResets.set('neurology-care', m.resetNeurologyState);
    return m.neurologyCareView;
  }),
  'pulmonary-care': () => import('./views/pulmonaryCare.js').then((m) => {
    viewCache.set('pulmonary-care', m.pulmonaryCareView);
    routeResets.set('pulmonary-care', m.resetPulmonaryState);
    return m.pulmonaryCareView;
  }),
  'renal-care': () => import('./views/renalCare.js').then((m) => {
    viewCache.set('renal-care', m.renalCareView);
    routeResets.set('renal-care', m.resetRenalState);
    return m.renalCareView;
  }),
  'endocarditis-care': () => import('./views/endocarditisCare.js').then((m) => {
    viewCache.set('endocarditis-care', m.endocarditisCareView);
    routeResets.set('endocarditis-care', m.resetEndocarditisState);
    return m.endocarditisCareView;
  }),
  'liver-care': () => import('./views/liverCare.js').then((m) => {
    viewCache.set('liver-care', m.liverCareView);
    routeResets.set('liver-care', m.resetLiverState);
    return m.liverCareView;
  }),
  'weather-care': () => import('./views/weatherCare.js').then((m) => {
    viewCache.set('weather-care', m.weatherCareView);
    routeResets.set('weather-care', m.resetWeatherState);
    return m.weatherCareView;
  }),
  'ketamine-care': () => import('./views/ketamineCare.js').then((m) => {
    viewCache.set('ketamine-care', m.ketamineCareView);
    routeResets.set('ketamine-care', m.resetKetamineState);
    return m.ketamineCareView;
  }),
  'inhalant-care': () => import('./views/inhalantCare.js').then((m) => {
    viewCache.set('inhalant-care', m.inhalantCareView);
    routeResets.set('inhalant-care', m.resetInhalantState);
    return m.inhalantCareView;
  }),
  'vein-care': () => import('./views/veinCare.js').then((m) => {
    viewCache.set('vein-care', m.veinCareView);
    routeResets.set('vein-care', m.resetVeinState);
    return m.veinCareView;
  }),
  'ghb-care': () => import('./views/ghbCare.js').then((m) => {
    viewCache.set('ghb-care', m.ghbCareView);
    routeResets.set('ghb-care', m.resetGhbState);
    return m.ghbCareView;
  }),
  'psychedelic-care': () => import('./views/psychedelicCare.js').then((m) => {
    viewCache.set('psychedelic-care', m.psychedelicCareView);
    routeResets.set('psychedelic-care', m.resetPsychedelicState);
    return m.psychedelicCareView;
  }),
  'gabapentinoid-care': () => import('./views/gabapentinoidCare.js').then((m) => {
    viewCache.set('gabapentinoid-care', m.gabapentinoidCareView);
    routeResets.set('gabapentinoid-care', m.resetGabapentinoidState);
    return m.gabapentinoidCareView;
  }),
  'novel-substances': () => import('./views/novelSubstances.js').then((m) => {
    viewCache.set('novel-substances', m.novelSubstancesView);
    routeResets.set('novel-substances', m.resetNovelState);
    return m.novelSubstancesView;
  }),
  'sexual-health': () => import('./views/sexualHealth.js').then((m) => {
    viewCache.set('sexual-health', m.sexualHealthView);
    routeResets.set('sexual-health', m.resetSexualHealthState);
    return m.sexualHealthView;
  }),
  'needle-exposure': () => import('./views/needleExposure.js').then((m) => {
    viewCache.set('needle-exposure', m.needleExposureView);
    routeResets.set('needle-exposure', m.resetExposureState);
    return m.needleExposureView;
  }),
  'hospital-care': () => import('./views/hospitalCare.js').then((m) => {
    viewCache.set('hospital-care', m.hospitalCareView);
    routeResets.set('hospital-care', m.resetHospitalState);
    return m.hospitalCareView;
  }),
  'toxicology-triage': () => import('./views/toxicologyTriage.js').then((m) => {
    viewCache.set('toxicology-triage', m.toxicologyTriageView);
    routeResets.set('toxicology-triage', m.resetToxicologyTriageState);
    return m.toxicologyTriageView;
  }),
  'adhd-care': () => import('./views/adhdCare.js').then((m) => {
    viewCache.set('adhd-care', m.adhdCareView);
    routeResets.set('adhd-care', m.resetAdhdState);
    return m.adhdCareView;
  }),
  'benzodiazepine-care': () => import('./views/benzodiazepineCare.js').then((m) => {
    viewCache.set('benzodiazepine-care', m.benzodiazepineCareView);
    routeResets.set('benzodiazepine-care', m.resetBenzodiazepineState);
    return m.benzodiazepineCareView;
  }),
  'nicotine-care': () => import('./views/nicotineCare.js').then((m) => {
    viewCache.set('nicotine-care', m.nicotineCareView);
    routeResets.set('nicotine-care', m.resetNicotineState);
    return m.nicotineCareView;
  }),
  'viral-hepatitis': () => import('./views/viralHepatitis.js').then((m) => {
    viewCache.set('viral-hepatitis', m.viralHepatitisView);
    routeResets.set('viral-hepatitis', m.resetViralState);
    return m.viralHepatitisView;
  }),
  'cannabis-care': () => import('./views/cannabisCare.js').then((m) => {
    viewCache.set('cannabis-care', m.cannabisCareView);
    routeResets.set('cannabis-care', m.resetCannabisState);
    return m.cannabisCareView;
  }),
  'dental-care': () => import('./views/dentalCare.js').then((m) => {
    viewCache.set('dental-care', m.dentalCareView);
    routeResets.set('dental-care', m.resetDentalState);
    return m.dentalCareView;
  }),
  'sleep-care': () => import('./views/sleepCare.js').then((m) => {
    viewCache.set('sleep-care', m.sleepCareView);
    routeResets.set('sleep-care', m.resetSleepState);
    return m.sleepCareView;
  }),
  'nightlife-care': () => import('./views/nightlifeCare.js').then((m) => {
    viewCache.set('nightlife-care', m.nightlifeCareView);
    routeResets.set('nightlife-care', m.resetNightlifeState);
    return m.nightlifeCareView;
  }),
  'polysubstance-care': () => import('./views/polysubstanceCare.js').then((m) => {
    viewCache.set('polysubstance-care', m.polysubstanceCareView);
    routeResets.set('polysubstance-care', m.resetPolysubstanceState);
    return m.polysubstanceCareView;
  }),
  'dual-diagnosis': () => import('./views/dualDiagnosis.js').then((m) => {
    viewCache.set('dual-diagnosis', m.dualDiagnosisView);
    routeResets.set('dual-diagnosis', m.resetDualDiagnosisState);
    return m.dualDiagnosisView;
  }),
  'methadone-access': () => import('./views/methadoneAccess.js').then((m) => {
    viewCache.set('methadone-access', m.methadoneAccessView);
    routeResets.set('methadone-access', m.resetMethadoneState);
    return m.methadoneAccessView;
  }),
  'adulterant-care': () => import('./views/adulterantCare.js').then((m) => {
    viewCache.set('adulterant-care', m.adulterantCareView);
    routeResets.set('adulterant-care', m.resetAdulterantState);
    return m.adulterantCareView;
  }),
  'family-support': () => import('./views/familySupport.js').then((m) => {
    viewCache.set('family-support', m.familySupportView);
    routeResets.set('family-support', m.resetFamilyState);
    return m.familySupportView;
  }),
  'alcohol-care': () => import('./views/alcoholCare.js').then((m) => {
    viewCache.set('alcohol-care', m.alcoholCareView);
    routeResets.set('alcohol-care', m.resetAlcoholState);
    return m.alcoholCareView;
  }),
  'chronic-pain': () => import('./views/chronicPain.js').then((m) => {
    viewCache.set('chronic-pain', m.chronicPainView);
    routeResets.set('chronic-pain', m.resetPainState);
    return m.chronicPainView;
  }),
  tools: () => import('./views/tools.js').then((m) => {
    viewCache.set('tools', m.careToolsView);
    routeResets.set('tools', m.resetCareToolsState);
    return m.careToolsView;
  }),
  workspace: () => import('./views/workspace.js').then((m) => {
    viewCache.set('workspace', m.careWorkspaceView);
    routeResets.set('workspace', m.resetCareWorkspaceState);
    return m.careWorkspaceView;
  }),
  match: () => import('./views/match.js').then((m) => {
    viewCache.set('match', m.matchView);
    return m.matchView;
  }),
  navigator: () => import('./views/navigator.js').then((m) => {
    viewCache.set('navigator', m.careNavigatorView);
    return m.careNavigatorView;
  }),
  guided: () => import('./views/guidedNavigator.js').then((m) => {
    viewCache.set('guided', m.guidedNavigatorView);
    return m.guidedNavigatorView;
  }),
  medications: () => import('./views/medications.js').then((m) => {
    viewCache.set('medications', m.medicationsView);
    return m.medicationsView;
  }),
  plan: () => import('./views/plan.js').then((m) => {
    viewCache.set('plan', m.planView);
    return m.planView;
  }),
  assessment: () => import('./views/assessment.js').then((m) => {
    viewCache.set('assessment', m.assessmentView);
    return m.assessmentView;
  }),
  readiness: () => import('./views/readiness.js').then((m) => {
    viewCache.set('readiness', m.readinessView);
    return m.readinessView;
  }),
  perinatal: () => import('./views/perinatal.js').then((m) => {
    viewCache.set('perinatal', m.perinatalView);
    return m.perinatalView;
  }),
  veterans: () => import('./views/veterans.js').then((m) => {
    viewCache.set('veterans', m.veteransView);
    return m.veteransView;
  }),
  adolescent: () => import('./views/adolescentCare.js').then((m) => {
    viewCache.set('adolescent', m.adolescentCareView);
    return m.adolescentCareView;
  }),
  reentry: () => import('./views/reentry.js').then((m) => {
    viewCache.set('reentry', m.reentryView);
    return m.reentryView;
  }),
  'older-adults': () => import('./views/olderAdults.js').then((m) => {
    viewCache.set('older-adults', m.olderAdultsView);
    return m.olderAdultsView;
  }),
  'workplace-rights': () => import('./views/workplaceRights.js').then((m) => {
    viewCache.set('workplace-rights', m.workplaceRightsView);
    return m.workplaceRightsView;
  }),
  'tribal-health': () => import('./views/tribalHealth.js').then((m) => {
    viewCache.set('tribal-health', m.tribalHealthView);
    return m.tribalHealthView;
  }),
  'lgbtq-care': () => import('./views/lgbtqCare.js').then((m) => {
    viewCache.set('lgbtq-care', m.lgbtqCareView);
    return m.lgbtqCareView;
  }),
  'wound-care': () => import('./views/woundInfectious.js').then((m) => {
    viewCache.set('wound-care', m.woundInfectiousView);
    return m.woundInfectiousView;
  }),
  'rural-health': () => import('./views/ruralHealth.js').then((m) => {
    viewCache.set('rural-health', m.ruralHealthView);
    return m.ruralHealthView;
  }),
  'disability-care': () => import('./views/disabilityCare.js').then((m) => {
    viewCache.set('disability-care', m.disabilityCareView);
    return m.disabilityCareView;
  }),
  'street-medicine': () => import('./views/streetMedicine.js').then((m) => {
    viewCache.set('street-medicine', m.streetMedicineView);
    return m.streetMedicineView;
  }),
  'immigrant-health': () => import('./views/immigrantHealth.js').then((m) => {
    viewCache.set('immigrant-health', m.immigrantHealthView);
    return m.immigrantHealthView;
  }),
  'post-overdose': () => import('./views/postOverdose.js').then((m) => {
    viewCache.set('post-overdose', m.postOverdoseView);
    return m.postOverdoseView;
  }),
  'stimulant-care': () => import('./views/stimulantCare.js').then((m) => {
    viewCache.set('stimulant-care', m.stimulantCareView);
    return m.stimulantCareView;
  }),
  'recovery-support': () => import('./views/recoverySupport.js').then((m) => {
    viewCache.set('recovery-support', m.recoverySupportView);
    routeResets.set('recovery-support', m.resetRecoverySupportState);
    return m.recoverySupportView;
  }),
  'overdose-loss': () => import('./views/overdoseLoss.js').then((m) => {
    viewCache.set('overdose-loss', m.overdoseLossView);
    return m.overdoseLossView;
  }),
  'harm-reduction': () => loadGuidesModule().then((m) => m.harmReductionView),
  overdose: () => loadGuidesModule().then((m) => m.overdoseView),
  support: () => loadGuidesModule().then((m) => m.supportView),
  'choosing-care': () => loadGuidesModule().then((m) => m.choosingCareView),
};

export const ROUTE_TITLES = {
  'inhalant-toxicology': () => t('route.inhalantToxicology', 'Inhalant, volatile solvent & nitrous oxide neuropathy navigator'),
  'adulterant-heavy-metals': () => t('route.adulterantHeavyMetals', 'Illicit drug adulterants, heavy metals & alpha-2 agonist triage'),
  'peri-overdose-pulmonary': () => t('route.periOverdosePulmonary', 'Peri-overdose pulmonary syndromes & non-cardiogenic edema navigator'),
  'disaster-moud-climate': () => t('route.disasterMoudClimate', 'Disaster MOUD continuity, wildfire smoke & climate resilience navigator'),
  'movement-disorders-eps': () => t('route.movementDisordersEps', 'Stimulant movement disorders, choreoathetosis & acute dystonia / EPS decision engine'),
  'fungal-opportunistic-care': () => t('route.fungalOpportunisticCare', 'Opportunistic deep fungal infections, endemic mycoses & MOUD navigator'),
  'nsti-wound-staging': () => t('route.nstiWoundStaging', 'Complex wound, necrotizing fasciitis (LRINEC) & POCUS navigator'),
  'pediatric-ingestion-decon': () => t('route.pediatricIngestionDecon', 'Pediatric ingestion, One Pill Can Kill & decontamination engine'),
  'carceral-moud-reentry': () => t('route.carceralMoudReentry', 'Carceral MOUD continuity & safe reentry directives'),
  'toxic-alcohol': () => t('route.toxicAlcohol', 'Toxic alcohol poisoning, fomepizole & osmolal gap navigator'),
  'mass-overdose-mci': () => t('route.massOverdoseMci', 'Mass overdose cluster, contaminated supply & SALT triage navigator'),
  'moud-directive': () => t('route.moudDirective', 'Offline emergency MOUD directive & verifiable inpatient rights pass'),
  'encampment-medicine': () => t('route.encampmentMedicine', 'Encampment medicine, street zoonoses & vector-borne disease navigator'),
  'street-trauma': () => t('route.streetTrauma', 'Street trauma, tourniquets & life-threatening hemorrhage control navigator'),
  'fhir-export': () => t('route.fhirExport', 'FHIR R4 referral & EHR interoperability syndication generator'),
  'burn-toxicology': () => t('route.burnToxicology', 'Burn resuscitation, toxic chemical exposure & inhalation injury navigator'),
  embed: () => t('route.embed', 'Embeddable public health widgets & partner badges'),
  outreach: () => t('route.outreach', 'Community street outreach materials & printable pocket cards'),
  admin: () => 'Operator Analytics & Platform Telemetry',
  'pediatric-exposures': () => t('route.pediatricExposures', 'Pediatric accidental exposures, child toxicology & safe storage navigator'),
  'geriatric-care': () => t('route.geriatricCare', 'Geriatric addiction medicine, Beers Criteria, anticholinergic cognitive burden & fall risk navigator'),
  'icu-perioperative': () => t('route.icuPerioperative', 'Critical care (ICU), safe RSI intubation, fentanyl/xylazine sedation & perioperative MOUD navigator'),
  'obstetric-emergencies': () => t('route.obstetricEmergencies', 'Obstetric emergencies, 3rd-trimester split MOUD, Cesarean analgesia & Eat-Sleep-Console navigator'),
  'oncology-palliative': () => t('route.oncologyPalliative', 'Oncology, palliative care, sickle cell crisis & complex cancer pain on MOUD navigator'),
  'cardiology-care': () => t('route.cardiologyCare', 'Cardiology, stimulant chest pain, sodium-channel QRS blockade & Torsades (QTc) navigator'),
  'dermatology-care': () => t('route.dermatologyCare', 'Dermatology, xylazine necrotic eschar, Stevens-Johnson (SJS/TEN) & DRESS navigator'),
  'ent-care': () => t('route.entCare', 'Otolaryngology, Ludwig angina, Lemierre syndrome, septal perforation & airway navigator'),
  'urology-care': () => t('route.urologyCare', 'Urologic emergencies, ischemic priapism, Fournier gangrene & urinary retention navigator'),
  'ocular-care': () => t('route.ocularCare', 'Ophthalmology, endogenous endophthalmitis, methanol blindness & ocular toxicology navigator'),
  'orthopedic-care': () => t('route.orthopedicCare', 'Spinal epidural abscess, septic arthritis, pyomyositis & OVIVA bone/joint navigator'),
  'hematology-care': () => t('route.hematologyCare', 'Hematology, coagulopathy, levamisole vasculitis & toxic hemolysis navigator'),
  'gi-care': () => t('route.giCare', 'GI & mesenteric emergencies, acute pancreatitis & opioid constipation'),
  'metabolic-care': () => t('route.metabolicCare', 'Metabolic emergencies, alcoholic ketoacidosis & adrenal crisis'),
  'neurology-care': () => t('route.neurologyCare', 'Neurological health, post-overdose brain injury & neuroprotection'),
  'pulmonary-care': () => t('route.pulmonaryCare', 'Pulmonary health, post-overdose lung injury & inhalation safety'),
  'renal-care': () => t('route.renalCare', 'Renal health, rhabdomyolysis, AKI & dialysis MOUD navigator'),
  'endocarditis-care': () => t('route.endocarditisCare', 'Infective endocarditis, valve destruction & POET protocol navigator'),
  'liver-care': () => t('route.liverCare', 'Liver health, APAP toxicity & cirrhosis safety navigator'),
  'weather-care': () => t('route.weatherCare', 'Hypothermia, frostbite & heat stroke safety navigator'),
  'ketamine-care': () => t('route.ketamineCare', 'Ketamine harm reduction & uropathy navigator'),
  'inhalant-care': () => t('route.inhalantCare', 'Inhalants, solvents & nitrous oxide safety'),
  'vein-care': () => t('route.veinCare', 'Vein care, vascular health & injection anatomy'),
  'ghb-care': () => t('route.ghbCare', 'GHB, GBL & 1,4-BDO harm reduction, coma triage & withdrawal'),
  'psychedelic-care': () => t('route.psychedelicCare', 'Psychedelic harm reduction, 5-HT2A de-escalation & HPPD'),
  'gabapentinoid-care': () => t('route.gabapentinoidCare', 'Gabapentinoids, respiratory synergy & deprescribing'),
  'novel-substances': () => t('route.novelSubstances', 'Novel substances, kratom, tianeptine & OTC misuse'),
  'sexual-health': () => t('route.sexualHealth', 'Doxy-PEP, HIV PrEP & emergency contraception'),
  'needle-exposure': () => t('route.needleExposure', 'Needle stick, sharps injury & bloodborne pathogen PEP protocol'),
  'hospital-care': () => t('route.hospitalCare', 'Hospital addiction care, pain on MOUD & patient rights'),
  'toxicology-triage': () => t('route.toxicologyTriage', 'Acute toxicology triage, Project BETA de-escalation & SBAR handoff'),
  'adhd-care': () => t('route.adhdCare', 'ADHD, neurodiversity & stimulant harm reduction'),
  'benzodiazepine-care': () => t('route.benzodiazepineCare', 'Benzodiazepines, Ashton tapering & BIND care'),
  'nicotine-care': () => t('route.nicotineCare', 'Tobacco, nicotine, vaping & smoking cessation'),
  'viral-hepatitis': () => t('route.viralHepatitis', 'Hepatitis C cure, DAA regimens, FIB-4 & HIV PrEP/PEP'),
  'cannabis-care': () => t('route.cannabisCare', 'Cannabinoid hyperemesis (CHS) & concentrates care'),
  'dental-care': () => t('route.dentalCare', 'Dental, oral health & endocarditis prevention'),
  'sleep-care': () => t('route.sleepCare', 'Sleep restoration & insomnia in recovery'),
  'nightlife-care': () => t('route.nightlifeCare', 'Nightlife, club drugs & festival harm reduction'),
  'polysubstance-care': () => t('route.polysubstanceCare', 'Polysubstance overdose synergy & interactions'),
  'dual-diagnosis': () => t('route.dualDiagnosis', 'Dual diagnosis & integrated mental health'),
  'methadone-access': () => t('route.methadoneAccess', 'Methadone clinic access & 2024 Part 8 rules'),
  'adulterant-care': () => t('route.adulterantCare', 'Emerging adulterants, xylazine & wound care'),
  'family-support': () => t('route.familySupport', 'Family support & CRAFT guide'),
  'alcohol-care': () => t('route.alcoholCare', 'Alcohol care, withdrawal & MAUD'),
  'chronic-pain': () => t('route.chronicPain', 'Chronic pain & sedative deprescribing'),
  'recovery-support': () => t('route.recoverySupport', 'Life after treatment: recovery housing & support'),
  'overdose-loss': () => t('route.overdoseLoss', 'After an overdose death'),
  '': () => t('route.home', 'Find treatment, harm reduction & health services'),
  tools: () => t('route.tools', 'Care tools and guides'),
  workspace: () => t('route.workspace', 'Care team workspace'),
  match: () => t('route.match', 'Find care that fits'),
  treatment: () => t('route.treatment', 'Find treatment'),
  navigator: () => t('route.navigator', 'Clinical care navigator (ASAM)'),
  guided: () => t('route.guided', 'Guided navigator & triage'),
  medications: () => t('route.medications', 'Medications & interactions'),
  'harm-reduction': () => t('route.harm', 'Harm reduction'),
  overdose: () => t('route.overdose', 'Overdose response'),
  health: () => t('route.health', 'Health services'),
  plan: () => t('route.plan', 'Safety plan & first visit'),
  assessment: () => t('route.assessment', 'Withdrawal assessment (COWS & CIWA-Ar)'),
  readiness: () => t('route.readiness', 'Readiness & stages of change'),
  perinatal: () => t('route.perinatal', 'Perinatal care & pregnancy support'),
  veterans: () => t('route.veterans', 'Veterans & military health care'),
  adolescent: () => t('route.adolescent', 'Adolescent care & legal guide'),
  reentry: () => t('route.reentry', 'Reentry & criminal legal health'),
  'older-adults': () => t('route.olderAdults', 'Older adults & Medicare SUD'),
  'workplace-rights': () => t('route.workplaceRights', 'Workplace rights, FMLA & ADA'),
  'tribal-health': () => t('route.tribalHealth', 'Indigenous & tribal health'),
  'lgbtq-care': () => t('route.lgbtqCare', 'LGBTQ+ & gender-affirming SUD care'),
  'wound-care': () => t('route.woundCare', 'Wound care & infection prevention'),
  'rural-health': () => t('route.ruralHealth', 'Rural & frontier health'),
  'disability-care': () => t('route.disabilityCare', 'Disability, neurodiversity & accessible care'),
  'street-medicine': () => t('route.streetMedicine', 'Street medicine & unhoused care'),
  'immigrant-health': () => t('route.immigrantHealth', 'Immigrant health & language rights'),
  'post-overdose': () => t('route.postOverdose', 'Post-overdose care & MOUD bridges'),
  'stimulant-care': () => t('route.stimulantCare', 'Stimulant care & overamping'),
  support: () => t('route.support', 'Recovery & family support'),
  'choosing-care': () => t('route.choosing', 'Choosing quality care'),
  states: () => t('route.states', 'Resources by state and territory'),
  saved: () => t('route.saved', 'Saved places'),
  crisis: () => t('route.crisis', 'Talk to someone now'),
  privacy: () => t('route.privacy', 'Privacy'),
};

export function preloadRoute(path) {
  if (SYNC_VIEWS[path]) return Promise.resolve(SYNC_VIEWS[path]);
  if (viewCache.has(path)) return Promise.resolve(viewCache.get(path));
  const loader = LAZY_LOADERS[path];
  if (!loader) return Promise.resolve(null);
  if (!pendingLoads.has(path)) {
    const p = loader().finally(() => pendingLoads.delete(path));
    pendingLoads.set(path, p);
  }
  return pendingLoads.get(path);
}

// Loads every lazy view. Not called on page load (that downloaded every module
// on every visit); kept for tests and tooling. The opt-in offline copy is
// precached by the service worker's own APP_SHELL and ELECTIVE_SHELL lists.
export function preloadAllLazyViews() {
  return Promise.all([
    preloadRoute('inhalant-toxicology'),
    preloadRoute('adulterant-heavy-metals'),
    preloadRoute('peri-overdose-pulmonary'),
    preloadRoute('disaster-moud-climate'),
    preloadRoute('movement-disorders-eps'),
    preloadRoute('fungal-opportunistic-care'),
    preloadRoute('nsti-wound-staging'),
    preloadRoute('pediatric-ingestion-decon'),
    preloadRoute('carceral-moud-reentry'),
    preloadRoute('toxic-alcohol'),
    preloadRoute('mass-overdose-mci'),
    preloadRoute('moud-directive'),
    preloadRoute('encampment-medicine'),
    preloadRoute('street-trauma'),
    preloadRoute('fhir-export'),
    preloadRoute('burn-toxicology'),
    preloadRoute('embed'),
    preloadRoute('outreach'),
    preloadRoute('admin'),
    preloadRoute('pediatric-exposures'),
    preloadRoute('geriatric-care'),
    preloadRoute('icu-perioperative'),
    preloadRoute('obstetric-emergencies'),
    preloadRoute('oncology-palliative'),
    preloadRoute('cardiology-care'),
    preloadRoute('dermatology-care'),
    preloadRoute('ent-care'),
    preloadRoute('urology-care'),
    preloadRoute('ocular-care'),
    preloadRoute('orthopedic-care'),
    preloadRoute('hematology-care'),
    preloadRoute('gi-care'),
    preloadRoute('metabolic-care'),
    preloadRoute('neurology-care'),
    preloadRoute('pulmonary-care'),
    preloadRoute('renal-care'),
    preloadRoute('endocarditis-care'),
    preloadRoute('liver-care'),
    preloadRoute('weather-care'),
    preloadRoute('ketamine-care'),
    preloadRoute('inhalant-care'),
    preloadRoute('vein-care'),
    preloadRoute('ghb-care'),
    preloadRoute('psychedelic-care'),
    preloadRoute('tools'),
    preloadRoute('workspace'),
    preloadRoute('match'),
    preloadRoute('navigator'),
    preloadRoute('guided'),
    preloadRoute('medications'),
    preloadRoute('plan'),
    preloadRoute('assessment'),
    preloadRoute('readiness'),
    preloadRoute('perinatal'),
    preloadRoute('veterans'),
    preloadRoute('adolescent'),
    preloadRoute('reentry'),
    preloadRoute('older-adults'),
    preloadRoute('workplace-rights'),
    preloadRoute('tribal-health'),
    preloadRoute('lgbtq-care'),
    preloadRoute('wound-care'),
    preloadRoute('rural-health'),
    preloadRoute('disability-care'),
    preloadRoute('street-medicine'),
    preloadRoute('immigrant-health'),
    preloadRoute('post-overdose'),
    preloadRoute('stimulant-care'),
    preloadRoute('chronic-pain'),
    preloadRoute('alcohol-care'),
    preloadRoute('family-support'),
    preloadRoute('adulterant-care'),
    preloadRoute('methadone-access'),
    preloadRoute('dental-care'),
    preloadRoute('cannabis-care'),
    preloadRoute('viral-hepatitis'),
    preloadRoute('nicotine-care'),
    preloadRoute('benzodiazepine-care'),
    preloadRoute('adhd-care'),
    preloadRoute('toxicology-triage'),
    preloadRoute('hospital-care'),
    preloadRoute('needle-exposure'),
    preloadRoute('sexual-health'),
    preloadRoute('novel-substances'),
    preloadRoute('gabapentinoid-care'),
    preloadRoute('sleep-care'),
    preloadRoute('nightlife-care'),
    preloadRoute('polysubstance-care'),
    preloadRoute('dual-diagnosis'),
    preloadRoute('recovery-support'),
    preloadRoute('overdose-loss'),
    preloadRoute('harm-reduction'),
  ]);
}

let carried = null;

export function splitHref(hash) {
  const raw = String(hash ?? '').replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  return { path: path.replace(/\/$/, ''), query: new URLSearchParams(qs) };
}

// Filters such as `?codes=PW,OTP` or `?tab=mental` can reveal health details,
// so they are kept out of the address bar, back history, and session restore.
// Internal links hand their filters over in memory (see the click handler).
// When a URL with filters is opened directly or set by code, the filters are
// read once and the visible URL is immediately replaced with the bare route.
// `carried` keeps them in memory so a re-render of the same route (for
// example, after a language change) does not lose them.
export function parseHash(hashStr) {
  if (typeof hashStr === 'string') return splitHref(hashStr);
  const currentHash = typeof location !== 'undefined' ? location.hash : '';
  const { path, query } = splitHref(currentHash);
  if ([...query.keys()].length) {
    carried = { path, query };
    if (typeof history !== 'undefined' && typeof history.replaceState === 'function') {
      history.replaceState(history.state, '', `#/${path}`);
    }
    return { path, query };
  }
  if (carried && carried.path === path) return { path, query: carried.query };
  carried = null;
  return { path, query };
}

export function resolveRoute(path, query) {
  if (Object.hasOwn(ROUTE_TITLES, path)) {
    const title = ROUTE_TITLES[path]();
    const syncView = SYNC_VIEWS[path] ?? viewCache.get(path) ?? null;
    if (syncView) {
      return { view: () => syncView({ query, meta: lastMeta }), lazyPath: null, title };
    }
    return { view: null, lazyPath: path, title };
  }
  if (path.startsWith('state/')) {
    const code = path.slice(6);
    if (/^[A-Za-z]{2}$/.test(code)) {
      return {
        view: () => stateDetailView({ code: code.toUpperCase(), query }),
        lazyPath: null,
        title: t('route.stateDetail', 'State resources ({code})', { code: code.toUpperCase() }),
      };
    }
  }
  return {
    view: () => notFoundView({ query }),
    lazyPath: null,
    title: t('route.notFound', 'Page not found'),
  };
}

// Route links start with "#/" (or are a bare "#" for home). Any other hash,
// such as "#main" from the skip link, points at an element on the current
// page and must never be treated as a route.
export function isRouteHash(hash) {
  const value = String(hash ?? '');
  return value === '' || value === '#' || value.startsWith('#/');
}

const NATIVELY_FOCUSABLE = /^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/;

/** Make an element programmatically focusable without adding it to the tab order. */
export function makeFocusable(el) {
  if (el && !NATIVELY_FOCUSABLE.test(el.tagName ?? '') && !el.hasAttribute?.('tabindex')) {
    el.setAttribute('tabindex', '-1');
  }
  return el;
}

/**
 * Where focus lands after a route change: the page title, then the first h1,
 * then the first h2, then the main region itself. Views that do not use
 * pageHeader() still get a sensible starting point for keyboard and
 * screen-reader users.
 */
export function routeFocusTarget(root) {
  if (!root) return null;
  return makeFocusable(root.querySelector('#page-title') ?? root.querySelector('h1') ?? root.querySelector('h2') ?? root);
}

/** Move focus to an in-page anchor target (for example the skip link's #main). */
export function focusInPageTarget(id, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || !id) return false;
  let target = null;
  try {
    target = doc.getElementById(decodeURIComponent(id));
  } catch {
    target = doc.getElementById(id);
  }
  if (!target) return false;
  makeFocusable(target).focus?.();
  return true;
}

let firstRender = true;
let lastMeta = null;
let renderSeq = 0;
let lastPath = '';

const hasDom = typeof document !== 'undefined';
const main = hasDom ? document.getElementById('main') : null;
const toggle = hasDom ? document.querySelector('.nav-toggle') : null;
const nav = hasDom ? document.getElementById('site-nav') : null;
const savedCount = hasDom ? document.getElementById('saved-count') : null;

function closeMenu() {
  toggle?.setAttribute('aria-expanded', 'false');
  nav?.classList.remove('open');
  for (const details of nav?.querySelectorAll('.nav-more-menu[open]') ?? []) details.open = false;
}

/** Mark `container` busy and show a short status while a view module loads. */
export function showViewLoading(container) {
  const status = document.createElement('p');
  status.className = 'results-status view-loading';
  status.setAttribute('role', 'status');
  status.textContent = t('app.loadingView', 'Loading…');
  container.setAttribute('aria-busy', 'true');
  container.replaceChildren(status);
  return status;
}

/**
 * Whether hovering or focusing a link may download its view ahead of a click.
 * Skipped when the visitor asked to save data or the connection is 2G.
 */
export function shouldPreloadOnIntent(connection = globalThis.navigator?.connection) {
  if (!connection) return true;
  if (connection.saveData) return false;
  return !['slow-2g', '2g'].includes(connection.effectiveType);
}

/**
 * Shown when a page's module could not download (no signal, or a deploy
 * replaced it). Everything here is already in memory: the overdose steps,
 * 911, 988, and the SAMHSA helpline work with no network and no offline copy.
 * On the overdose route the full step-by-step guide is shown, so the
 * emergency callout's "Overdose response steps" link always leads to them.
 * "Try again" retries the download in place rather than reloading, which with
 * no signal would replace this help with the browser's offline page.
 */
export function viewLoadFailed(title, retry, { overdoseSteps = false } = {}) {
  return h('div', { class: 'view view-load-failed' },
    pageHeader(title, t('app.viewLoadFailed', 'This page didn’t load. Check your connection and try again. The help below works without signal.'),
      overdoseSteps && h('p', { class: 'actions' }, tel('911', [icon('phone'), t('common.call911', 'Call 911')], { class: 'btn btn-emergency btn-large' }))),
    overdoseSteps ? overdoseGuide() : emergencyCallout(),
    hotlineGrid([...HOTLINES.crisis.filter((line) => line.id === '988'), ...HOTLINES.substanceUse.filter((line) => line.id === 'samhsa')]),
    h('p', { class: 'actions' },
      h('button', { type: 'button', class: 'btn btn-primary', onclick: retry }, t('reach.retry', 'Try again'))),
  );
}

/**
 * Render the current route. `moveFocus: false` keeps focus and scroll where
 * they are, for re-renders the visitor did not navigate to (language or
 * plain-language changes).
 */
async function render({ hashChange = false, moveFocus = true } = {}) {
  if (!main) return;
  const routeHash = isRouteHash(location.hash);
  // An in-page anchor (e.g. "#main") changed the hash: the current view stays.
  if (!routeHash && hashChange && !firstRender) {
    focusInPageTarget(location.hash.slice(1));
    return;
  }
  const token = ++renderSeq;
  const isInitial = firstRender;
  firstRender = false;

  // With a non-route hash (a page opened at "#main", or a language change after
  // one), keep showing the last route instead of the not-found page.
  const { path, query } = routeHash
    ? parseHash()
    : { path: lastPath, query: carried?.path === lastPath ? carried.query : new URLSearchParams() };
  lastPath = path;
  const resolved = resolveRoute(path, query);
  document.title = path ? `${resolved.title} · ${SITE}` : `${SITE}: ${resolved.title}`;
  trackPageView(path);

  for (const link of document.querySelectorAll('[data-nav]')) {
    if (link.dataset.nav === path) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  closeMenu();

  main.removeAttribute('aria-busy');
  let buildView = resolved.view;
  if (!buildView && resolved.lazyPath) {
    let failed = false;
    showViewLoading(main);
    const loadedView = await preloadRoute(resolved.lazyPath).catch(() => { failed = true; return null; });
    if (token !== renderSeq) return;
    main.removeAttribute('aria-busy');
    if (loadedView) buildView = () => loadedView({ query, meta: lastMeta });
    else if (failed) buildView = () => viewLoadFailed(resolved.title, () => render(), { overdoseSteps: resolved.lazyPath === 'overdose' });
    else buildView = () => notFoundView({ query });
  }

  main.replaceChildren(buildView());
  if (!routeHash) {
    if (isInitial) focusInPageTarget(location.hash.slice(1));
    return;
  }
  if (!isInitial && moveFocus) {
    window.scrollTo(0, 0);
    routeFocusTarget(main)?.focus({ preventScroll: true });
    announce(resolved.title);
  }
}

// ---------------------------------------------------------------- Quick exit
// Plain-language mode lives in memory only; Quick exit turns it off with the rest.
onQuickExit(() => setPlainLanguage(false, { notify: false }));

export function runQuickExitResets() {
  wipeAll();
  carried = null;
  // Only modules already in memory hold state: lazy views registered a reset
  // when they loaded, and other stateful modules register with onQuickExit().
  // Nothing is imported here, so no module is fetched (or saved again by an
  // offline worker) on the way out.
  for (const reset of routeResets.values()) {
    try { reset(); } catch { /* keep clearing the others */ }
  }
  runQuickExitHandlers();
  if (typeof document !== 'undefined') {
    document.getElementById('btn-emergency-drawer')?.setAttribute('aria-expanded', 'false');
  }
}

function quickExit() {
  runQuickExitResets();
  if (!hasDom) return;
  document.title = 'Weather';
  document.body.replaceChildren();
  location.replace(EXIT_URL);
}

// ---------------------------------------------------------------- Saved count
function updateSavedCount() {
  if (!savedCount) return;
  const n = state.saved.size;
  savedCount.hidden = n === 0;
  savedCount.textContent = String(n);
  savedCount.setAttribute('aria-label', t('app.savedCount', '{n} saved', { n }));
}

// ---------------------------------------------------------------- Footer data dates
function renderFooterMeta() {
  if (!hasDom) return;
  const el = document.getElementById('data-updated');
  if (!el || !lastMeta?.healthCenters?.updated) return;
  const date = new Date(lastMeta.healthCenters.updated);
  if (!Number.isNaN(date.getTime())) {
    const formatted = formatDate(date, { year: 'numeric', month: 'long', day: 'numeric' });
    el.textContent = t(
      'app.footer.dataUpdated',
      'Health center data updated {date}. Treatment listings are searched live.',
      { date: formatted },
    );
  }
}

if (hasDom) {
  function alignNavMoreMenu(details) {
    if (!details || !details.open) return;
    const menu = details.querySelector('.nav-more-links');
    if (!menu) return;
    const rect = details.getBoundingClientRect();
    const menuWidth = menu.offsetWidth || 288;
    const spaceOnRight = window.innerWidth - rect.left;
    if (spaceOnRight < menuWidth && rect.right >= menuWidth) {
      menu.classList.add('align-right');
    } else {
      menu.classList.remove('align-right');
    }
  }

  for (const details of nav?.querySelectorAll('.nav-more-menu') ?? []) {
    details.addEventListener('toggle', () => alignNavMoreMenu(details));
  }
  window.addEventListener('resize', () => {
    for (const details of nav?.querySelectorAll('.nav-more-menu[open]') ?? []) {
      alignNavMoreMenu(details);
    }
  }, { passive: true });

  // Internal navigation replaces the current history entry instead of adding
  // one, so HarborPath occupies a single slot in the back history. After a
  // quick exit, pressing Back skips past this site.
  document.addEventListener('click', (e) => {
    if (!e.target?.closest?.('.nav-more-menu')) {
      for (const details of nav?.querySelectorAll('.nav-more-menu[open]') ?? []) details.open = false;
    }
    const telLink = e.target.closest?.('a[href^="tel:"]');
    if (telLink) {
      const href = telLink.getAttribute('href') || '';
      if (href.includes('988')) trackHotlineClick('988_suicide_crisis');
      else if (href.includes('911')) trackHotlineClick('911_emergency');
      else if (href.includes('484-3731')) trackHotlineClick('never_use_alone');
      else if (href.includes('222-1222')) trackHotlineClick('poison_control');
      else if (href.includes('662-4357')) trackHotlineClick('samhsa_national_helpline');
      else trackHotlineClick('other_helpline');
    }
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    // Same-page anchors (the skip link) move focus without touching the hash,
    // so they neither add a history entry nor trigger a route render.
    const anchor = e.target.closest?.('a[href^="#"]:not([href^="#/"]):not([href="#"])');
    if (anchor) {
      e.preventDefault();
      focusInPageTarget(anchor.getAttribute('href').slice(1));
      return;
    }
    const a = e.target.closest('a[href^="#/"], a[href="#"]');
    if (!a) return;
    e.preventDefault();
    const { path, query } = splitHref(a.getAttribute('href') === '#' ? '#/' : a.getAttribute('href'));
    carried = [...query.keys()].length ? { path, query } : null;
    const href = `#/${path}`;
    if (href === location.hash || (href === '#/' && !location.hash)) render();
    else location.replace(href);
  });

  // Preload lazy route modules on pointerenter or keyboard focus so navigation is instant.
  const handleLinkPreload = (e) => {
    const a = e.target?.closest?.('a[href^="#/"]');
    if (!a) return;
    const { path } = parseHash(a.getAttribute('href') || '');
    if (LAZY_LOADERS[path] && shouldPreloadOnIntent()) preloadRoute(path).catch(() => {});
  };
  document.addEventListener('pointerenter', handleLinkPreload, { capture: true, passive: true });
  document.addEventListener('focusin', handleLinkPreload, { passive: true });

  window.addEventListener('hashchange', () => render({ hashChange: true }));

  document.getElementById('quick-exit')?.addEventListener('click', quickExit);

  let lastEscape = 0;
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const more = nav?.querySelector('.nav-more-menu[open]');
    if (more) {
      // Closing the menu must not count toward the Esc-Esc quick exit.
      more.open = false;
      more.querySelector('summary')?.focus();
      lastEscape = 0;
      return;
    }
    // Escape closes the open mobile menu and returns focus to its button. Like
    // the More menu above, closing it does not count toward the Esc-Esc exit.
    if (toggle?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
      lastEscape = 0;
      return;
    }
    const now = Date.now();
    if (now - lastEscape < 1000) quickExit();
    lastEscape = now;
  });

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });

  const sensoryBtn = document.getElementById('btn-sensory-mode');
  if (sensoryBtn) {
    import('./components/sensoryMode.js').then((m) => {
      const updateSensory = (active) => {
        sensoryBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
        sensoryBtn.classList.toggle('active', active);
      };
      m.subscribeSensoryMode(updateSensory);
      updateSensory(m.getSensoryMode());
      sensoryBtn.addEventListener('click', () => {
        m.toggleSensoryMode();
      });
    }).catch(() => {});
  }

  const emergencyBtn = document.getElementById('btn-emergency-drawer');
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', () => {
      if (emergencyDrawer.isEmergencyDrawerOpen()) {
        emergencyDrawer.closeEmergencyDrawer();
        emergencyBtn.setAttribute('aria-expanded', 'false');
      } else {
        emergencyDrawer.openEmergencyDrawer(emergencyBtn);
        emergencyBtn.setAttribute('aria-expanded', 'true');
      }
    });

    if (typeof MutationObserver !== 'undefined') {
      const syncEmergencyAria = () => {
        const wrapper = document.getElementById('emergency-drawer-wrapper');
        const isOpen = Boolean(wrapper && !wrapper.hidden && wrapper.classList.contains('open'));
        emergencyBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      };
      const drawerObserver = new MutationObserver(syncEmergencyAria);
      const drawerWrapper = document.getElementById('emergency-drawer-wrapper');
      if (drawerWrapper) {
        drawerObserver.observe(drawerWrapper, { attributes: true, attributeFilter: ['hidden', 'class'] });
      } else if (document.body) {
        const bodyObserver = new MutationObserver(() => {
          const w = document.getElementById('emergency-drawer-wrapper');
          if (w) {
            bodyObserver.disconnect();
            drawerObserver.observe(w, { attributes: true, attributeFilter: ['hidden', 'class'] });
          }
        });
        bodyObserver.observe(document.body, { childList: true });
      }
    }
  }

  subscribe(updateSavedCount);
  updateSavedCount();

  api.meta().then((meta) => {
    lastMeta = meta;
    renderFooterMeta();
    // Update only the source disclosure if metadata arrives after a new view
    // renders; preserve the visitor's focus, filters, and checklist.
    if (main?.querySelector('.source-context')) {
      import('./components/sourceContext.js').then(({ sourceContext }) => {
        main?.querySelector('.source-context')?.replaceWith(sourceContext({ meta: lastMeta }));
      }).catch(() => {});
    }
  }).catch(() => { /* footer note is optional */ });

  let lastPlain = isPlainLanguage();
  onLanguageChange(() => {
    updateSavedCount();
    renderFooterMeta();
    // Keep focus on the language or plain-language control the visitor used.
    render({ moveFocus: false });
    if (isPlainLanguage() !== lastPlain) {
      lastPlain = isPlainLanguage();
      announce(lastPlain
        ? t('app.plainToggle.on', 'Plain language is on.')
        : t('app.plainToggle.off', 'Plain language is off.'));
    }
  });

  initI18n().finally(() => {
    updateSavedCount();
    renderFooterMeta();
    render();
  });
}
