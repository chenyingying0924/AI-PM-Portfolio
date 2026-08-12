const React = require('react');
const h = require('../h');
const { Container, SectionHead } = require('../components/ui');

const STEPS = [
  {
    title: 'Input brief',
    desc: 'Paste competitor copy, a video script, or a content link.',
    status: 'Collecting source',
    image: 'images/agent-01-input.png',
  },
  {
    title: 'Viral structure extraction',
    desc: 'The Agent extracts audience, structure, emotion triggers, and selling points.',
    status: 'Analyzing pattern',
    image: 'images/agent-02-teardown.png',
  },
  {
    title: 'Brand knowledge retrieval',
    desc: 'Positioning, claims, tone, and market rules are pulled into context.',
    status: 'Retrieving brand rules',
    image: 'images/agent-03-brand.png',
  },
  {
    title: 'Localized generation',
    desc: 'New variants are written for each market and platform.',
    status: 'Generating variants',
    image: 'images/agent-04-rewrite.png',
  },
  {
    title: 'Quality gate',
    desc: 'Attraction, conversion potential, and platform fit are scored before approval.',
    status: 'Scoring output',
    image: 'images/agent-05-eval.png',
  },
];

function Workflow() {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (!window.gsap || !window.ScrollTrigger) return undefined;
    window.gsap.registerPlugin(window.ScrollTrigger);
    const triggers = [];
    const ctx = window.gsap.context(() => {
      STEPS.forEach((step, index) => {
        const trigger = window.ScrollTrigger.create({
          trigger: `#wf-step-${index}`,
          start: 'top 55%',
          end: 'bottom 45%',
          onToggle: (self) => {
            if (self.isActive) setActive(index);
          },
        });
        triggers.push(trigger);
      });
    });
    return () => {
      triggers.forEach((trigger) => trigger.kill());
      ctx.revert();
    };
  }, []);

  const progress = Math.round(((active + 1) / STEPS.length) * 100);
  const current = STEPS[active];

  return h(
    'section',
    { className: 'workflow', id: 'workflow' },
    h(
      Container,
      null,
      h(
        'div',
        { className: 'reveal' },
        h(SectionHead, {
          eyebrow: 'Agent workflow',
          title: 'Watch the Agent run the whole job.',
          copy: 'From source content to approved localized variants, every step is visible and every output is traceable.',
        })
      ),
      h(
        'div',
        { className: 'workflow-shell' },
        h(
          'div',
          { className: 'workflow-visual' },
          h(
            'div',
            { className: 'run-card' },
            h(
              'div',
              { className: 'run-head' },
              h('span', { className: 'run-chip' }, h('span', { className: 'run-dot' }), 'Agent run'),
              h('span', { className: 'run-step' }, `Step ${String(active + 1).padStart(2, '0')} / 05`)
            ),
            h('div', { className: 'run-stage' }, current.status),
            h('div', { className: 'run-progress' }, h('span', { style: { width: `${progress}%` } })),
            h(
              'div',
              { className: 'shot-stack' },
              STEPS.map((step, index) =>
                h('img', {
                  key: step.image,
                  className: index === active ? 'active' : '',
                  src: step.image,
                  alt: `${step.title} screen`,
                  loading: index === 0 ? 'eager' : 'lazy',
                })
              )
            )
          )
        ),
        h(
          'div',
          { className: 'workflow-steps' },
          STEPS.map((step, index) =>
            h(
              'button',
              {
                key: step.title,
                id: `wf-step-${index}`,
                className: `workflow-step ${index === active ? 'active' : ''}`,
                onClick: () => {
                  setActive(index);
                  const el = document.getElementById(`wf-step-${index}`);
                  if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                },
                'aria-current': index === active ? 'true' : undefined,
              },
              h('span', { className: 'step-index' }, `0${index + 1}`),
              h(
                'span',
                { className: 'step-body' },
                h('span', { className: 'step-title' }, step.title),
                h('span', { className: 'step-desc' }, step.desc)
              )
            )
          )
        )
      )
    )
  );
}

module.exports = Workflow;
