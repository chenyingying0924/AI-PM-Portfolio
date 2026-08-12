const React = require('react');
const h = require('../h');
const { Button, LogoMark } = require('../components/ui');

const LINKS = [
  { label: 'Product', href: '#problem' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Pricing', href: '#pricing' },
];

function Nav() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [open]);

  return h(
    'header',
    { className: `nav ${open ? 'nav-open' : ''}` },
    h(
      'div',
      { className: 'container nav-inner' },
      h(
        'a',
        { className: 'nav-brand', href: '#top', onClick: () => setOpen(false) },
        h(LogoMark),
        h('span', { className: 'nav-name' }, 'BrandPilot'),
        h('span', { className: 'nav-ai' }, 'AI')
      ),
      h('nav', { className: 'nav-links' }, LINKS.map((link) => h('a', { key: link.href, href: link.href, onClick: () => setOpen(false) }, link.label))),
      h('div', { className: 'nav-actions' }, h(Button, { href: '#cta', icon: 'arrow-right', className: 'nav-cta', 'data-register': 'true' }, 'Start free')),
      h(
        'button',
        {
          className: 'nav-menu',
          onClick: () => setOpen((v) => !v),
          'aria-label': 'Toggle menu',
        },
        h('i', { 'data-lucide': open ? 'x' : 'menu' })
      )
    ),
    h(
      'div',
      { className: 'nav-sheet' },
      LINKS.map((link) => h('a', { key: link.href, href: link.href, className: 'nav-sheet-link', onClick: () => setOpen(false) }, link.label)),
      h(Button, { href: '#cta', icon: 'arrow-right', className: 'nav-sheet-cta', 'data-register': 'true', onClick: () => setOpen(false) }, 'Start free')
    )
  );
}

module.exports = Nav;
