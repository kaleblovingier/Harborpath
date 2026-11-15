import { h, tel, icon } from '../dom.js';
import { t } from '../i18n.js';
import { overdoseGuide } from '../components/overdose.js';
import { overdosePacer } from '../components/overdosePacing.js';
export { resetOverdoseTimerState } from '../components/overdosePacing.js';
import { offlineControlCard } from './core.js';
import { pageHeader, section } from './common.js';

// overdosePacer binds the pure overdoseResilience state machine to its template,
// including the 120-second naloxone check and the 5-second breathing cadence.
export function overdoseView() {
  const pacer = overdosePacer();
  const view = h('div', { class: 'view view-overdose' },
    pageHeader(t('od.title', 'Overdose response'), t('od.lede', 'What to do right now, step by step.'),
      h('p', { class: 'actions' }, tel('911', [icon('phone'), t('common.call911', 'Call 911')], { class: 'btn btn-emergency btn-large' }))),
    overdoseGuide(),
    section('rescue-timer', t('od.rescueTimer', 'Interactive rescue timer (optional)'),
      pacer,
    ),
    offlineControlCard(),
  );
  view._cleanup = () => pacer._cleanup?.();
  return view;
}
