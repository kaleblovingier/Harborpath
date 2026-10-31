import { h, icon, ext } from '../dom.js';
import { t } from '../i18n.js';

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
      h('p', { class: 'state-legal-notice' }, fallbackMessage)
    );
  }

  const {
    stateCode = '',
    stateName = '',
    goodSamaritan = {},
    naloxoneAccess = {},
    harmReductionEquipment = {},
  } = legalData;

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

  const notice = h(
    'p',
    { class: 'state-legal-notice callout-emergency' },
    t(
      'legal.notice911',
      'Calling 911 during an overdose provides statutory immunity from arrest and prosecution for minor drug possession in this jurisdiction. Citations are for legal reference; paramedics\' priority is medical resuscitation.'
    )
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
      'Arrest immunity: Protected from arrest for personal drug possession',
      'Arrest immunity: Not explicitly shielded from arrest'
    ),
    makeImmunityItem(
      goodSamaritan.prosecutionImmunity,
      'Prosecution immunity: Protected from criminal prosecution in court',
      'Prosecution immunity: Not explicitly shielded from prosecution'
    ),
    makeImmunityItem(
      goodSamaritan.chargeImmunity,
      'Charge immunity: Protected from criminal charging',
      'Charge immunity: Not explicitly shielded from charging'
    ),
    makeImmunityItem(
      goodSamaritan.protectsParaphernalia,
      'Paraphernalia protection: Drug checking & use supplies shielded',
      'Paraphernalia protection: Paraphernalia not explicitly shielded'
    ),
    makeImmunityItem(
      goodSamaritan.protectsParoleProbation,
      'Parole / Probation: Shields against revocation violations',
      'Parole / Probation: Does NOT shield probation or parole violations'
    ),
    makeImmunityItem(
      goodSamaritan.protectsUnderageAlcohol,
      'Underage alcohol: Shields minor consumption/possession',
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
      'Statewide standing order: Available at pharmacies without personal prescription',
      'Standing order: Limited or individual prescription required'
    ),
    makeImmunityItem(
      naloxoneAccess.thirdPartyPrescribing,
      'Third-party prescribing authorized: Family and friends can obtain naloxone',
      'Third-party prescribing: Restricted or not specified'
    ),
    makeImmunityItem(
      naloxoneAccess.layResponderImmunity,
      'Lay responder civil & criminal immunity: Responders protected when administering in good faith',
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
      'Fentanyl test strips: Decriminalized / Legal for personal drug checking',
      'Fentanyl test strips: Regulated under drug paraphernalia statutes'
    ),
    makeImmunityItem(
      harmReductionEquipment.xylazineTestStripsLegal,
      'Xylazine test strips: Decriminalized / Legal for checking supplies',
      'Xylazine test strips: Regulated or unclear under paraphernalia law'
    ),
    makeImmunityItem(
      harmReductionEquipment.sspStatutoryProtection,
      'Syringe services programs (SSP): Explicit statutory authorization/protection',
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
      'State your location clearly and say "Someone is unresponsive and not breathing." You are not required to mention substances.'
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
      'If law enforcement questions you, politely inform them you called 911 in good faith to report an overdose emergency under state Good Samaritan law.'
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
      ext(
        'https://endoverdose.net/toolkit/',
        'Verify 50-State Overdose Legal Toolkit (End Overdose)',
        { class: 'btn btn-secondary btn-small' }
      ),
      ext(
        'https://lawatlas.org/datasets/good-samaritan-overdose-prevention-laws',
        'LawAtlas Good Samaritan Dataset (Temple Univ.)',
        { class: 'btn btn-ghost btn-small' }
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
    gsBlock,
    nxBlock,
    hrBlock,
    h('div', { class: 'actions no-print' }, toggleBtn),
    detailsPanel
  );
}
