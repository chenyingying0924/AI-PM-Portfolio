const h = require('../h');
const { Button, Container, SectionHead } = require('../components/ui');

const PLANS = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    copy: 'For small marketing teams running their first localized campaigns.',
    features: ['1 brand profile', '2 target markets', '20 Agent runs per month', '3 seats'],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$149',
    period: '/month',
    copy: 'For content teams scaling multiple markets without growing headcount.',
    features: ['3 brand profiles', '6 target markets', 'Unlimited Agent runs', 'Quality gate with reasons', 'JSON export'],
    cta: 'Start free',
    highlighted: true,
  },
  {
    name: 'Scale',
    price: 'Custom',
    period: '',
    copy: 'For brand operations with approval workflows and broader governance needs.',
    features: ['Unlimited brands and markets', 'Approval workflow', 'SSO and audit log', 'Dedicated support'],
    cta: 'Talk to sales',
    highlighted: false,
  },
];

function Pricing() {
  return h(
    'section',
    { className: 'pricing', id: 'pricing' },
    h(
      Container,
      null,
      h(
        'div',
        { className: 'reveal' },
        h(SectionHead, {
          title: 'Simple plans that scale with your markets.',
          copy: 'Start with one brand and two markets. Add brands, regions, and workflow controls when content volume grows.',
        })
      ),
      h(
        'div',
        { className: 'pricing-grid' },
        PLANS.map((plan) =>
          h(
            'article',
            { key: plan.name, className: `pricing-card ${plan.highlighted ? 'pricing-highlight' : ''}` },
            h('h3', null, plan.name),
            h('div', { className: 'price-row' }, h('span', { className: 'price' }, plan.price), h('span', { className: 'period' }, plan.period)),
            h('p', { className: 'plan-copy' }, plan.copy),
            h(
              'ul',
              { className: 'plan-features' },
              plan.features.map((feature) => h('li', { key: feature }, feature))
            ),
            h(Button, {
              href: '#cta',
              variant: plan.highlighted ? 'primary' : 'secondary',
              icon: plan.highlighted ? 'arrow-right' : null,
              'data-register': plan.cta === 'Talk to sales' ? undefined : 'true',
            }, plan.cta)
          )
        )
      )
    )
  );
}

module.exports = Pricing;
