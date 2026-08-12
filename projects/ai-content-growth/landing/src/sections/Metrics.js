const h = require('../h');
const { Container, MetricTile, Pill } = require('../components/ui');

function Metrics() {
  return h(
    'section',
    { className: 'metrics' },
    h(
      Container,
      null,
      h(
        'div',
        { className: 'metrics-head reveal' },
        h(Pill, { tone: 'neutral' }, 'Simulated MVP target'),
        h('h2', null, 'Built to change how fast content ships.')
      ),
      h(
        'div',
        { className: 'metrics-grid' },
        h(MetricTile, {
          value: '60-75%',
          label: 'Less production time',
          sub: 'Per localized content batch',
          tag: 'Simulated target',
        }),
        h(MetricTile, {
          value: '≤2',
          label: 'Review rounds',
          sub: 'Before approval',
          tag: 'Simulated target',
        }),
        h(MetricTile, {
          value: '≥75%',
          label: 'First-pass acceptance',
          sub: 'Content accepted with light edits',
          tag: 'Simulated target',
        })
      )
    )
  );
}

module.exports = Metrics;
