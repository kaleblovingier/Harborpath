import { h, icon, ext } from '../dom.js';
import { t } from '../i18n.js';
import { onQuickExit } from '../state.js';

// Quick Exit clears this module's in-memory state (see runQuickExitResets in app.js).
onQuickExit(resetStateLegalCardState);

let detailsExpanded = false;
const activeCards = new Set();

export function getStateLegalCardState() {
  return {
    expanded: detailsExpanded,
  };
}

export function resetStateLegalCardState() {
  detailsExpanded = false;
  for (const card of activeCards) {
    if (card && typeof card.reset === 'function') {
      try {
        card.reset();
      } catch {
        /* safety */
      }
    }
  }
}

function makeImmunityItem(isProtected, textTrue, textFalse) {
  const isOk = Boolean(isProtected);
  return h(
    'li',
    { class: `legal-immunity-item ${isOk ? 'is-protected' : 'is-unprotected'}` },
    icon(isOk ? 'check' : 'x'),
    h('span', null, isOk ? textTrue : textFalse)
  );
}

export function stateLegalCard(legalData, options = {}) {
  const cardId = options.id || 'state-legal-card';
  const headingId = options.headingId || `${cardId}-title`;
  const headingLevel = options.headingLevel || 3;
  const headingTag = `h${headingLevel}`;

  if (!legalData || typeof legalData !== 'object') {
    const fallbackTitle = t('legal.cardTitle', 'Good Samaritan & Harm Reduction Legal Protections');
    const fallbackMessage = t(
      'legal.noData',
      'Statutory legal protection data is currently available for all 50 U.S. states, Washington D.C., and Puerto Rico. In an overdose emergency, call 911 immediately — healthcare priority is resuscitation.'
    );
    const unverifiedNote = h(
      'div',
      { class: 'callout callout-warn', role: 'note' },
      h('p', { class: 'callout-title' }, icon('alert'), ' Statutory Information Notice'),
      h('p', null, 'Not yet reviewed by a legal expert — confirm with the source below. In an overdose emergency, ALWAYS call 911 first to save a life.')
    );
    return h(
      'section',
      {
        class: options.class ? `card state-legal-card print-handout ${options.class}` : 'card state-legal-card print-handout',
        id: cardId,
        'aria-labelledby': headingId,
        role: 'region',
      },
      h('div', { class: 'facility-head' },
        h(headingTag, { id: headingId, class: 'facility-name' }, icon('shield'), ' ', fallbackTitle)
      ),
      unverifiedNote,
      h('p', { class: 'state-legal-notice callout-emergency' }, fallbackMessage)
    );
  }

  const {
    stateCode = '',
    stateName = '',
    goodSamaritan = {},
    naloxoneAccess = {},
    harmReductionEquipment = {},
    sources = [],
  } = legalData;

  const defaultSources = [
    {
      name: 'LawAtlas Good Samaritan Overdose Prevention Laws',
      url: 'https://lawatlas.org/datasets/good-samaritan-overdose-prevention-laws',
    },
    {
      name: 'End Overdose State Law Toolkit',
      url: 'https://endoverdose.net/toolkit/',
    },
  ];
  const activeSources = Array.isArray(sources) && sources.length > 0 ? sources : defaultSources;

  const titlePrefix = stateName || (stateCode ? stateCode.toUpperCase() : '');
  const titleText = titlePrefix
    ? `${titlePrefix} ${t('legal.cardTitle', 'Good Samaritan & Harm Reduction Legal Protections')}`
    : t('legal.cardTitle', 'Good Samaritan & Harm Reduction Legal Protections');

  const hasGsProtection = Boolean(goodSamaritan.hasProtection);
  const statusChip = h(
    'span',
    { class: hasGsProtection ? 'chip chip-care' : 'chip chip-warning' },
    hasGsProtection ? 'Good Samaritan Law Active' : 'Limited Immunity'
  );

  const header = h(
    'div',
    { class: 'facility-head' },
    h(headingTag, { id: headingId, class: 'facility-name' }, icon('shield'), ' ', titleText),
    statusChip
  );

  // Front and center 911 emergency instruction with softened, hedged statutory phrasing
  const notice = h(
    'p',
    { class: 'state-legal-notice callout-emergency' },
    icon('phone'),
    ' ',
    h('strong', null, 'In an overdose emergency, ALWAYS CALL 911 FIRST to save a life. '),
    t(
      'legal.notice911',
      'State law reported to offer statutory immunity for reporting an overdose, but statutory protections vary — check the source below. Paramedics\' primary priority is medical resuscitation.'
    )
  );

  // Prominent accessible unverified callout (role="note", class="callout callout-warn")
  const sourceLinks = activeSources.map((s, idx) => [
    idx > 0 ? ' • ' : '',
    ext(s.url, s.name, { class: 'legal-source-link' }),
  ]).flat();

  const unverifiedCallout = h(
    'div',
    { class: 'callout callout-warn', role: 'note' },
    h('p', { class: 'callout-title' }, icon('alert'), ' Statutory Information Notice'),
    h('p', null, 'Not yet reviewed by a legal expert — confirm with the source below. State laws change and local enforcement practices vary.'),
    h('p', { class: 'callout-sources' }, h('strong', null, 'Authoritative Sources: '), ...sourceLinks)
  );

  // 1. Good Samaritan Overdose Criminal Immunity
  const gsHeading = h(
    'h4',
    { class: 'legal-section-title' },
    icon('activity'),
    ' ',
    t('legal.gsTitle', 'Good Samaritan Overdose Protection & Criminal Immunity')
  );

  const gsList = h(
    'ul',
    { class: 'legal-immunity-list' },
    makeImmunityItem(
      goodSamaritan.arrestImmunity,
      'Arrest immunity: Protected under state statute for personal drug possession (state law reported to offer protection; check source)',
      'Arrest immunity: Not explicitly shielded from arrest'
    ),
    makeImmunityItem(
      goodSamaritan.prosecutionImmunity,
      'Prosecution immunity: Protected under state statute from criminal prosecution in court (state law reported to offer protection; check source)',
      'Prosecution immunity: Not explicitly shielded from prosecution'
    ),
    makeImmunityItem(
      goodSamaritan.chargeImmunity,
      'Charge immunity: Protected under state statute from criminal charging (state law reported to offer protection; check source)',
      'Charge immunity: Not explicitly shielded from charging'
    ),
    makeImmunityItem(
      goodSamaritan.protectsParaphernalia,
      'Paraphernalia protection: Drug checking & use supplies shielded under statute (state law reported to offer protection; check source)',
      'Paraphernalia protection: Paraphernalia not explicitly shielded'
    ),
    makeImmunityItem(
      goodSamaritan.protectsParoleProbation,
      'Parole / Probation: Shields against revocation violations under statute (state law reported to offer protection; check source)',
      'Parole / Probation: Does NOT shield probation or parole violations'
    ),
    makeImmunityItem(
      goodSamaritan.protectsUnderageAlcohol,
      'Underage alcohol: Shields minor consumption/possession under statute (state law reported to offer protection; check source)',
      'Underage alcohol: Underage alcohol not covered'
    )
  );

  const gsCitation = goodSamaritan.statuteCitation
    ? h(
        'p',
        { class: 'statute-box' },
        h('strong', null, t('legal.statuteCitation', 'Statute Citation:'), ' '),
        h('cite', null, goodSamaritan.statuteCitation)
      )
    : null;

  const gsBlock = h('div', { class: 'legal-block' }, gsHeading, gsList, gsCitation);

  // 2. Naloxone Access Laws & Lay Responder Protection
  const nxHeading = h(
    'h4',
    { class: 'legal-section-title' },
    icon('pill'),
    ' ',
    t('legal.naloxoneTitle', 'Naloxone Access & Lay Responder Immunity')
  );

  const nxList = h(
    'ul',
    { class: 'legal-immunity-list' },
    makeImmunityItem(
      naloxoneAccess.standingOrder,
      'Statewide standing order: Available at pharmacies without personal prescription (check local pharmacy)',
      'Standing order: Limited or individual prescription required'
    ),
    makeImmunityItem(
      naloxoneAccess.thirdPartyPrescribing,
      'Third-party prescribing authorized: Family and friends can obtain naloxone under state policy',
      'Third-party prescribing: Restricted or not specified'
    ),
    makeImmunityItem(
      naloxoneAccess.layResponderImmunity,
      'Lay responder civil & criminal immunity: Responders reported to be shielded when administering in good faith (check source)',
      'Lay responder immunity: Not explicitly codified in statute'
    )
  );

  const nxCitation = naloxoneAccess.statuteCitation
    ? h(
        'p',
        { class: 'statute-box' },
        h('strong', null, t('legal.statuteCitation', 'Statute Citation:'), ' '),
        h('cite', null, naloxoneAccess.statuteCitation)
      )
    : null;

  const nxBlock = h('div', { class: 'legal-block' }, nxHeading, nxList, nxCitation);

  // 3. Harm Reduction Equipment Decriminalization
  const hrHeading = h(
    'h4',
    { class: 'legal-section-title' },
    icon('sliders'),
    ' ',
    t('legal.equipmentTitle', 'Harm Reduction Equipment & Decriminalization')
  );

  const hrList = h(
    'ul',
    { class: 'legal-immunity-list' },
    makeImmunityItem(
      harmReductionEquipment.fentanylTestStripsLegal,
      'Fentanyl test strips: Decriminalized / Legal for personal drug checking (reported; check local statute)',
      'Fentanyl test strips: Regulated under drug paraphernalia statutes'
    ),
    makeImmunityItem(
      harmReductionEquipment.xylazineTestStripsLegal,
      'Xylazine test strips: Decriminalized / Legal for checking supplies (reported; check local statute)',
      'Xylazine test strips: Regulated or unclear under paraphernalia law'
    ),
    makeImmunityItem(
      harmReductionEquipment.sspStatutoryProtection,
      'Syringe services programs (SSP): Explicit statutory authorization/protection (reported; check source)',
      'Syringe services programs: Lacks explicit state statutory protection'
    )
  );

  const hrNotes = harmReductionEquipment.statuteNotes
    ? h(
        'p',
        { class: 'legal-statute-notes' },
        h('strong', null, 'Statutory Notes: '),
        harmReductionEquipment.statuteNotes
      )
    : null;

  const hrBlock = h('div', { class: 'legal-block' }, hrHeading, hrList, hrNotes);

  // 4. Interactive Accordion for Plain-Language 911 Guidance
  const toggleId = `${cardId}-toggle`;
  const panelId = `${cardId}-details`;

  const toggleBtn = h(
    'button',
    {
      type: 'button',
      id: toggleId,
      class: 'btn btn-ghost btn-small legal-details-toggle',
      'aria-expanded': detailsExpanded ? 'true' : 'false',
      'aria-controls': panelId,
      onclick: () => {
        detailsExpanded = !detailsExpanded;
        updateToggleState();
      },
    },
    icon('clipboard'),
    ' ',
    h('span', { class: 'toggle-btn-label' }, t('legal.toggleDetails', 'Statutory Citations & Plain-Language Guidance'))
  );

  const stepsList = h(
    'ol',
    { class: 'script-tips-list' },
    h(
      'li',
      null,
      h('strong', null, '1. Call 911 immediately: '),
      'State your location clearly and say "Someone is unresponsive and not breathing." Medical priority is resuscitation. You are not required to mention substances.'
    ),
    h(
      'li',
      null,
      h('strong', null, '2. Secure extra supplies: '),
      'Place extra drugs and paraphernalia out of plain sight so first responders focus strictly on medical resuscitation.'
    ),
    h(
      'li',
      null,
      h('strong', null, '3. Tell EMS naloxone doses: '),
      'State clearly: "I administered [number] doses of naloxone at [time]." Paramedics are healthcare clinicians, not police.'
    ),
    h(
      'li',
      null,
      h('strong', null, '4. Assert statutory protection: '),
      'If law enforcement questions you, politely inform them you called 911 in good faith to report an overdose emergency under state Good Samaritan law. Consult linked authoritative sources or legal counsel for jurisdiction details.'
    )
  );

  const detailsPanel = h(
    'div',
    {
      id: panelId,
      class: 'legal-statute-details-panel',
      role: 'region',
      'aria-labelledby': toggleId,
      hidden: !detailsExpanded,
    },
    h('h5', { class: 'details-panel-title' }, '911 Medical Emergency Rights & EMS Interaction Script'),
    stepsList,
    h(
      'div',
      { class: 'actions' },
      ...activeSources.map((s, idx) =>
        ext(s.url, `${idx === 0 ? 'Verify ' : ''}${s.name}`, {
          class: idx === 0 ? 'btn btn-secondary btn-small' : 'btn btn-ghost btn-small',
        })
      )
    )
  );

  function updateToggleState() {
    toggleBtn.setAttribute('aria-expanded', detailsExpanded ? 'true' : 'false');
    if (detailsExpanded) {
      if (typeof detailsPanel.removeAttribute === 'function') detailsPanel.removeAttribute('hidden');
      detailsPanel.hidden = false;
    } else {
      if (typeof detailsPanel.setAttribute === 'function') detailsPanel.setAttribute('hidden', '');
      detailsPanel.hidden = true;
    }
  }

  const cardInstance = {
    reset: () => {
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (typeof detailsPanel.setAttribute === 'function') detailsPanel.setAttribute('hidden', '');
      detailsPanel.hidden = true;
    },
  };
  activeCards.add(cardInstance);

  return h(
    'section',
    {
      class: options.class ? `card state-legal-card print-handout ${options.class}` : 'card state-legal-card print-handout',
      id: cardId,
      'aria-labelledby': headingId,
      role: 'region',
    },
    header,
    notice,
    unverifiedCallout,
    gsBlock,
    nxBlock,
    hrBlock,
    h('div', { class: 'actions no-print' }, toggleBtn),
    detailsPanel
  );
}
