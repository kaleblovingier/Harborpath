import { h, clear, ext, tel, icon } from '../dom.js';
import { t } from '../i18n.js';

// Steps follow SAMHSA's Overdose Prevention and Response Toolkit (2023) and CDC
// guidance: call 911, give naloxone, support breathing, recovery position,
// stay, and re-dose if there is no response after 2–3 minutes.
//
// Text with a { text, plain } fallback has a plain-language version (see
// i18n.js). Plain versions use simpler words only: every step, number, and
// instruction keeps the same clinical meaning as the standard text.
// Steps are built at render time so they follow the active language and mode.
const opioidSteps = () => [
  {
    title: t('od.op.check.title', { text: 'Check for overdose signs', plain: 'Check if it is an overdose' }),
    body: [
      t('od.op.check.1', {
        text: 'Shout their name and rub hard on the middle of their chest with your knuckles.',
        plain: 'Shout their name. Rub hard on the middle of their chest with your knuckles.',
      }),
      t('od.op.check.2', {
        text: 'Look for: no response, slow or stopped breathing, gurgling or snoring sounds, pinpoint pupils, limp body, cold or clammy skin.',
        plain: 'Signs: they do not respond, breathing is slow or has stopped, gurgling or snoring sounds, very small (pinpoint) pupils, a limp body, cold or sweaty skin.',
      }),
      t('od.op.check.3', {
        text: 'Lips and fingertips may turn blue or gray. On darker skin, check the lips, gums, and nail beds for a gray or ashen color.',
        plain: 'Lips and fingertips may turn blue or gray. On darker skin, look at the lips, gums, and nails for a gray or ashy color.',
      }),
    ],
    note: t('od.op.check.note', {
      text: 'If you are not sure, treat it as an overdose. Naloxone will not harm someone who has not taken opioids.',
      plain: 'Not sure? Treat it as an overdose. Naloxone will not hurt someone who has not taken opioids.',
    }),
  },
  {
    title: t('od.op.call.title', 'Call 911'),
    body: [
      t('od.op.call.1', {
        text: 'Say: "Someone is unresponsive and not breathing." Give the exact address.',
        plain: 'Say: "Someone is not responding and not breathing." Give the exact address.',
      }),
      t('od.op.call.2', {
        text: 'You can put the phone on speaker and keep helping.',
        plain: 'Put the phone on speaker so you can keep helping.',
      }),
    ],
    call: true,
    note: t('od.op.call.note', {
      text: 'Every state and DC has some form of Good Samaritan law that offers legal protection to people who call for help during an overdose. Protections vary by state.',
      plain: 'Every state and DC has a Good Samaritan law. It gives some legal protection to people who call for help during an overdose. What it covers is different in each state.',
    }),
  },
  {
    title: t('od.op.naloxone.title', 'Give naloxone'),
    body: [
      t('od.op.naloxone.1', {
        text: 'Nasal spray: lay them on their back, tilt the head back, put the nozzle fully into one nostril, and press the plunger.',
        plain: 'Nose spray: lay them on their back. Tilt their head back. Put the tip all the way into one nostril and press the plunger.',
      }),
      t('od.op.naloxone.2', {
        text: 'Injectable: inject into the outer thigh or upper arm muscle. It can go through clothing.',
        plain: 'Shot: inject into the muscle of the outer thigh or upper arm. You can inject through clothes.',
      }),
      t('od.op.naloxone.3', {
        text: 'Start the timer below as soon as you give the first dose.',
        plain: 'Start the timer below right after you give the first dose.',
      }),
    ],
    timer: true,
  },
  {
    title: t('od.op.breathe.title', { text: 'Support their breathing', plain: 'Help them breathe' }),
    body: [
      t('od.op.breathe.1', 'If you are trained: tilt the head back, lift the chin, pinch the nose, and give 1 breath every 5 seconds.'),
      t('od.op.breathe.2', {
        text: 'If there is no breathing and no pulse, start CPR. The 911 dispatcher can coach you.',
        plain: 'If they are not breathing and have no pulse, start CPR. The 911 operator can tell you what to do.',
      }),
    ],
  },
  {
    title: t('od.op.redose.title', {
      text: 'No response after 2–3 minutes? Give another dose',
      plain: 'Still no response after 2–3 minutes? Give another dose',
    }),
    body: [
      t('od.op.redose.1', {
        text: 'Use a new device in the other nostril. Keep going with breaths between doses.',
        plain: 'Use a new spray in the other nostril. Keep giving breaths between doses.',
      }),
      t('od.op.redose.2', 'Strong opioids like fentanyl sometimes need more than one dose.'),
    ],
  },
  {
    title: t('od.op.recovery.title', {
      text: 'Put them in the recovery position and stay',
      plain: 'Turn them on their side (recovery position) and stay',
    }),
    body: [
      t('od.op.recovery.1', {
        text: 'Once they are breathing, roll them onto their side with the top knee bent and the head tilted back slightly so they won’t choke.',
        plain: 'When they are breathing, roll them onto their side. Bend the top knee. Tilt the head back a little so they do not choke.',
      }),
      t('od.op.recovery.2', {
        text: 'Stay until help arrives. Naloxone wears off in 30–90 minutes, and the overdose can come back.',
        plain: 'Stay until help comes. Naloxone wears off in 30–90 minutes, and the overdose can come back.',
      }),
      t('od.op.recovery.3', {
        text: 'When they wake up they may be in withdrawal, confused, or upset. Stay calm, explain what happened, and discourage them from using again right away.',
        plain: 'When they wake up, they may be in withdrawal (feel very sick), confused, or upset. Stay calm. Tell them what happened. Ask them not to use again right away.',
      }),
    ],
  },
];

const sedativeNote = () => t('od.sedative.body', {
  text: 'Xylazine (“tranq”) and medetomidine are animal sedatives now found in much of the fentanyl supply. Naloxone does not reverse them, but you should still give it, because fentanyl is almost always present. The goal is breathing, not waking up: someone can breathe on their own and still be very sedated. Call 911, keep supporting breathing, and use the recovery position.',
  plain: 'Xylazine (“tranq”) and medetomidine are animal sedatives. They are now in a lot of fentanyl. Naloxone does not reverse them, but still give it, because fentanyl is almost always there too. The goal is breathing, not waking up: a person can breathe on their own and still be very sleepy. Call 911, keep helping them breathe, and use the recovery position (on their side).',
});

const stimulantSteps = () => [
  {
    title: t('od.st.signs.title', {
      text: 'Know the signs of a stimulant overdose (“overamping”)',
      plain: 'Signs of a stimulant overdose (“overamping”)',
    }),
    body: [
      t('od.st.signs.1', {
        text: 'Overheating or a very high temperature, chest pain, racing or irregular heartbeat, trouble breathing.',
        plain: 'Body too hot or a very high temperature, chest pain, fast or uneven heartbeat, trouble breathing.',
      }),
      t('od.st.signs.2', {
        text: 'Seizures, severe headache, extreme agitation, paranoia, or hallucinations.',
        plain: 'Seizures, very bad headache, being extremely upset or restless, feeling paranoid, or seeing or hearing things that are not there.',
      }),
    ],
  },
  {
    title: t('od.st.call.title', 'Call 911'),
    body: [t('od.st.call.1', 'Chest pain, seizures, a very high temperature, or fainting are emergencies.')],
    call: true,
  },
  {
    title: t('od.st.cool.title', 'Cool them down and keep things calm'),
    body: [
      t('od.st.cool.1', {
        text: 'Move them somewhere cool and quiet. Use cool, wet cloths on the neck, armpits, and groin. Offer sips of water if they are awake.',
        plain: 'Move them to a cool, quiet place. Put cool, wet cloths on the neck, armpits, and groin. If they are awake, give small sips of water.',
      }),
      t('od.st.cool.2', {
        text: 'Speak calmly, reduce noise and people around them, and avoid restraining them.',
        plain: 'Talk calmly. Lower the noise and keep extra people away. Do not hold them down.',
      }),
    ],
  },
  {
    title: t('od.st.seizure.title', 'If they have a seizure'),
    body: [
      t('od.st.seizure.1', 'Clear the space around them and put something soft under their head. Do not hold them down or put anything in their mouth.'),
      t('od.st.seizure.2', 'Once it stops, roll them onto their side.'),
    ],
  },
  {
    title: t('od.st.naloxone.title', 'Give naloxone if they are hard to wake or breathing slowly'),
    body: [
      t('od.st.naloxone.1', {
        text: 'Fentanyl is often mixed into cocaine, methamphetamine, and pressed pills. If breathing slows or they won’t respond, follow the opioid steps.',
        plain: 'Fentanyl is often mixed into cocaine, meth, and pressed pills. If their breathing slows or they do not respond, follow the opioid steps.',
      }),
    ],
  },
];

function redoseTimer() {
  const SECONDS = 120;
  let remaining = SECONDS;
  let interval = null;

  const display = h('p', { class: 'timer-display', 'aria-hidden': 'true' }, '2:00');
  const live = h('p', { class: 'timer-live', role: 'status', 'aria-live': 'assertive' });
  const startLabel = () => t('od.timer.start', 'Start 2-minute timer');
  const restartLabel = () => t('od.timer.restart', 'Restart timer');
  const startBtn = h('button', { type: 'button', class: 'btn btn-primary' }, icon('clock'), startLabel());

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  function stop() {
    clearInterval(interval);
    interval = null;
  }

  function tick() {
    remaining -= 1;
    display.textContent = fmt(Math.max(remaining, 0));
    if (remaining === 60) live.textContent = t('od.timer.oneMinute', 'One minute left. Keep supporting their breathing.');
    if (remaining <= 0) {
      stop();
      root.classList.add('timer-done');
      live.textContent = t('od.timer.done', {
        text: 'Two minutes are up. If they are not breathing normally, give another dose of naloxone in the other nostril, then restart the timer.',
        plain: 'Two minutes are up. If they are still not breathing normally, give another dose of naloxone in the other nostril. Then restart the timer.',
      });
      try { navigator.vibrate?.([300, 150, 300]); } catch { /* not supported */ }
      startBtn.replaceChildren(icon('clock'), restartLabel());
    }
  }

  startBtn.addEventListener('click', () => {
    stop();
    remaining = SECONDS;
    root.classList.remove('timer-done');
    display.textContent = fmt(remaining);
    live.textContent = t('od.timer.started', 'Timer started. Keep supporting their breathing.');
    startBtn.replaceChildren(icon('clock'), restartLabel());
    interval = setInterval(() => {
      if (!root.isConnected) return stop();
      tick();
    }, 1000);
  });

  const root = h('div', { class: 'timer' }, display, startBtn, live);
  return root;
}

function stepList(steps) {
  return h('ol', { class: 'steps' }, steps.map((s, i) => h('li', { class: 'step' },
    h('div', { class: 'step-num', 'aria-hidden': 'true' }, String(i + 1)),
    h('div', { class: 'step-body' },
      h('h3', null, h('span', { class: 'visually-hidden' }, t('od.stepLabel', 'Step {n}: ', { n: i + 1 })), s.title),
      h('ul', null, s.body.map((b) => h('li', null, b))),
      s.call && h('p', null, tel('911', [icon('phone'), t('common.call911', 'Call 911')], { class: 'btn btn-emergency' })),
      s.timer && redoseTimer(),
      s.note && h('p', { class: 'step-note' }, icon('info'), s.note),
    ),
  )));
}

export function overdoseGuide() {
  const panel = h('div', { class: 'od-panel' });
  const tabs = [
    { id: 'opioid', label: t('od.tab.opioid', 'Opioids (fentanyl, heroin, pills)') },
    { id: 'stimulant', label: t('od.tab.stimulant', 'Stimulants (meth, cocaine)') },
  ];
  const buttons = [];

  function show(id) {
    for (const b of buttons) {
      const on = b.dataset.id === id;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    }
    clear(panel);
    panel.setAttribute('aria-labelledby', `od-tab-${id}`);
    // A heading for the panel keeps the outline h1 > h2 > h3 for screen readers.
    const heading = h('h2', { class: 'visually-hidden' }, tabs.find((x) => x.id === id).label);
    if (id === 'opioid') {
      panel.append(heading, stepList(opioidSteps()),
        h('div', { class: 'callout callout-info' }, h('p', null,
          h('strong', null, t('od.sedative.lead', 'If xylazine or medetomidine may be involved: ')), sedativeNote())));
    } else {
      panel.append(heading, stepList(stimulantSteps()),
        h('div', { class: 'callout callout-info' }, h('p', null, t('od.st.callout', {
          text: 'Naloxone does not reverse stimulants, but it is safe to give and will help if opioids are also involved.',
          plain: 'Naloxone does not reverse stimulants. But it is safe to give, and it will help if opioids are also involved.',
        }))));
    }
  }

  const tablist = h('div', { class: 'tabs', role: 'tablist', 'aria-label': t('od.tabs.label', 'Type of overdose') },
    tabs.map((tab) => {
      const b = h('button', {
        type: 'button', role: 'tab', id: `od-tab-${tab.id}`, class: 'tab',
        'aria-controls': 'od-panel', dataset: { id: tab.id },
        onclick: () => show(tab.id),
        onkeydown: (e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          const i = tabs.findIndex((x) => x.id === tab.id);
          const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
          show(next.id);
          buttons.find((x) => x.dataset.id === next.id).focus();
        },
      }, tab.label);
      buttons.push(b);
      return b;
    }));
  panel.id = 'od-panel';
  panel.setAttribute('role', 'tabpanel');
  show('opioid');

  return h('div', { class: 'overdose' },
    tablist,
    panel,
    h('p', { class: 'source-note' }, t('od.source.basedOn', 'Based on the '),
      ext('https://library.samhsa.gov/product/overdose-prevention-response-toolkit/pep23-03-00-001', t('od.source.toolkit', 'SAMHSA Overdose Prevention and Response Toolkit')),
      t('od.source.cdc', ', CDC guidance on '),
      ext('https://www.cdc.gov/overdose-prevention/about/what-you-should-know-about-xylazine.html', t('od.source.xylazine', 'xylazine')),
      t('od.source.and', ' and '),
      ext('https://www.cdc.gov/han/php/notices/han00527.html', t('od.source.medetomidine', 'medetomidine')),
      t('od.source.training', '. This is not a substitute for training: many health departments and harm reduction programs offer free naloxone training.')),
  );
}
