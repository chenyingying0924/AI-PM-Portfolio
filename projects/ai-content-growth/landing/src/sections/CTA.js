const h = require('../h');
const { Button, Container } = require('../components/ui');

function CTA() {
  return h(
    'section',
    { className: 'cta', id: 'cta' },
    h(
      Container,
      null,
      h(
        'div',
        { className: 'cta-panel reveal' },
        h('div', { className: 'cta-scan' }),
        h('h2', null, 'Put your brand rules in charge of every market.'),
        h('p', null, 'Start with one brief. Ship localized content that reads native and stays on brand.'),
        h(
          'div',
          { className: 'cta-actions' },
          h(Button, { href: '#pricing', icon: 'arrow-right', 'data-register': 'true' }, 'Start free'),
          h(Button, { href: 'mailto:hello@brandpilot.ai', variant: 'ghost', icon: 'calendar' }, 'Book a demo')
        )
      )
    )
  );
}

module.exports = CTA;
