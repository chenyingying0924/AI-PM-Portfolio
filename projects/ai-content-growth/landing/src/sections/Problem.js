const h = require('../h');
const { Container, SectionHead } = require('../components/ui');

const TODAY = [
  'Translate copy, then hope it lands in a new market.',
  'Rewrite hooks and scenes by hand for every platform.',
  'Review by feel, publish, then wait for the data.',
];

const WITH_BRANDPILOT = [
  'Deconstruct what actually worked for competitors.',
  'Retrieve brand rules before the Agent writes anything.',
  'Score quality before anything ships.',
];

function Problem() {
  return h(
    'section',
    { className: 'problem', id: 'problem' },
    h(
      Container,
      null,
      h(
        'div',
        { className: 'reveal' },
        h(SectionHead, {
          title: 'Translation is not localization.',
          copy: 'A translated script is not a local post. Local audiences need native hooks, familiar scenes, and claims your brand can stand behind.',
        })
      ),
      h(
        'div',
        { className: 'compare-grid' },
        h(
          'div',
          { className: 'compare-col compare-today reveal' },
          h('div', { className: 'compare-label' }, 'Today'),
          h(
            'ul',
            null,
            TODAY.map((item) => h('li', { key: item }, item))
          )
        ),
        h(
          'div',
          { className: 'compare-col compare-brandpilot reveal' },
          h('div', { className: 'compare-label' }, 'With BrandPilot'),
          h(
            'ul',
            null,
            WITH_BRANDPILOT.map((item) => h('li', { key: item }, item))
          )
        )
      )
    )
  );
}

module.exports = Problem;
