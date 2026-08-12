const h = require('../h');
const { Button, Container, Pill } = require('../components/ui');

function Hero() {
  return h(
    'section',
    { className: 'hero', id: 'top' },
    h('div', { className: 'hero-bg' }),
    h('div', { className: 'hero-glow' }),
    h('div', { className: 'hero-vignette' }),
    h(
      Container,
      { className: 'hero-inner' },
      h(
        'div',
        { className: 'hero-copy' },
        h(Pill, { tone: 'signal' }, 'For marketing operations teams'),
        h('h1', null, 'Localized content that sounds like your brand.'),
        h(
          'p',
          { className: 'hero-sub' },
          'BrandPilot turns competitor hits into reusable structures, then rewrites them for each market under your brand rules.'
        ),
        h(
          'div',
          { className: 'hero-actions' },
          h(Button, { href: '#cta', icon: 'arrow-right', 'data-register': 'true' }, 'Start free'),
          h(Button, { href: '#workflow', variant: 'ghost', icon: 'play' }, 'See the Agent run')
        ),
        h(
          'div',
          { className: 'hero-proof' },
          h('span', null, 'One brief'),
          h('span', { className: 'proof-arrow' }, '→'),
          h('span', null, 'Three markets'),
          h('span', { className: 'proof-arrow' }, '→'),
          h('span', null, 'Zero translation passes')
        )
      ),
      h(
        'div',
        { className: 'hero-visual' },
        h(
          'figure',
          { className: 'product-shot' },
          h('img', {
            src: 'images/agent-04-rewrite.png',
            alt: 'BrandPilot Agent workspace with localized content variants',
          }),
          h(
            'figcaption',
            null,
            h('span', { className: 'live-dot' }),
            'Agent run complete'
          )
        )
      )
    )
  );
}

module.exports = Hero;
