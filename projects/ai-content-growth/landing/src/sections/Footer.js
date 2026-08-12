const h = require('../h');
const { Container, LogoMark } = require('../components/ui');

const COLUMNS = [
  {
    title: 'Product',
    links: ['Agent', 'Workflow', 'Brand library', 'Pricing'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API reference', 'Changelog'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Contact'],
  },
];

function Footer() {
  return h(
    'footer',
    { className: 'footer' },
    h(
      Container,
      null,
      h(
        'div',
        { className: 'footer-grid' },
        h(
          'div',
          { className: 'footer-brand' },
          h('div', { className: 'footer-logo' }, h(LogoMark), h('span', null, 'BrandPilot AI')),
          h('p', null, 'Localized social content, on brand.')
        ),
        COLUMNS.map((column) =>
          h(
            'div',
            { key: column.title, className: 'footer-col' },
            h('h4', null, column.title),
            column.links.map((link) => h('a', { key: link, href: '#' }, link))
          )
        )
      ),
      h('div', { className: 'footer-bottom' }, h('span', null, '© 2026 BrandPilot AI'), h('span', null, 'Privacy · Terms · Security'))
    )
  );
}

module.exports = Footer;
