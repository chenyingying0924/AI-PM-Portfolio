const h = require('../h');
const { Container, SectionHead } = require('../components/ui');

function Capabilities() {
  return h(
    'section',
    { className: 'capabilities', id: 'capabilities' },
    h(
      Container,
      null,
      h(
        'div',
        { className: 'reveal' },
        h(SectionHead, {
          title: 'One product system, four working agents.',
          copy: 'Each agent owns one job in the content pipeline. Together they turn a brief into approved, localized output.',
        })
      ),
      h(
        'div',
        { className: 'bento' },
        h(
          'article',
          { className: 'bento-tile tile-viral reveal' },
          h('div', { className: 'tile-icon' }, h('i', { 'data-lucide': 'flame' })),
          h('h3', null, 'Viral teardown'),
          h('p', null, 'Turns a competitor post into a reusable structure: audience, hook, emotion, selling point, and why it worked.'),
          h(
            'ul',
            { className: 'tile-list' },
            h('li', null, 'Audience and context'),
            h('li', null, 'Content structure'),
            h('li', null, 'Emotion triggers')
          )
        ),
        h(
          'article',
          { className: 'bento-tile tile-brand reveal' },
          h('div', { className: 'tile-icon' }, h('i', { 'data-lucide': 'library-big' })),
          h('h3', null, 'Brand memory'),
          h('p', null, 'Positioning, claims, tone, markets, and taboos live in one knowledge base every generation reads.'),
          h('div', { className: 'tile-tags' }, h('span', null, 'Positioning'), h('span', null, 'Claims'), h('span', null, 'Tone'))
        ),
        h(
          'article',
          { className: 'bento-tile tile-rewrite reveal' },
          h('div', { className: 'tile-icon' }, h('i', { 'data-lucide': 'languages' })),
          h('h3', null, 'Localized rewrite'),
          h('p', null, 'Writes native-feeling variants for each market and platform while keeping the selling point intact.'),
          h('div', { className: 'tile-meta' }, h('span', null, 'US'), h('span', null, 'UK'), h('span', null, 'JP'), h('span', null, 'SG'))
        ),
        h(
          'article',
          { className: 'bento-tile tile-quality reveal' },
          h('div', { className: 'tile-icon' }, h('i', { 'data-lucide': 'gauge' })),
          h('h3', null, 'Quality gate'),
          h('p', null, 'Scores attraction, conversion potential, and platform fit with reasons, not vibes.'),
          h(
            'ul',
            { className: 'tile-list' },
            h('li', null, 'Scored before publishing'),
            h('li', null, 'Reasons on every number')
          )
        )
      )
    )
  );
}

module.exports = Capabilities;
