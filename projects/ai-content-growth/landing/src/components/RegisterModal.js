const React = require('react');
const h = require('../h');

const MARKETS = [
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'JP', label: 'Japan' },
  { value: 'SG', label: 'Singapore' },
];

function RegisterModal({ open, onClose }) {
  const [email, setEmail] = React.useState('');
  const [brand, setBrand] = React.useState('');
  const [market, setMarket] = React.useState('US');
  const [error, setError] = React.useState('');
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (open && window.lucide) window.lucide.createIcons();
  }, [open, done]);

  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  function reset() {
    setEmail('');
    setBrand('');
    setMarket('US');
    setError('');
    setDone(false);
    onClose();
  }

  function submit(event) {
    event.preventDefault();
    if (!email.includes('@') || email.trim().length < 5) {
      setError('Enter a valid work email.');
      return;
    }
    if (!brand.trim()) {
      setError('Enter your brand name.');
      return;
    }
    setError('');
    setDone(true);
  }

  return h(
    'div',
    {
      className: 'modal-backdrop',
      onClick: (event) => {
        if (event.target === event.currentTarget) reset();
      },
    },
    h(
      'div',
      {
        className: 'register-modal',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': 'Start free',
      },
      h('button', { className: 'modal-close', onClick: reset, 'aria-label': 'Close' }, h('i', { 'data-lucide': 'x' })),
      done
        ? h(
            'div',
            { className: 'modal-success' },
            h('span', { className: 'success-icon' }, h('i', { 'data-lucide': 'check-circle-2' })),
            h('h2', null, 'Workspace ready.'),
            h('p', null, `Demo workspace created for ${brand.trim()} in ${MARKETS.find((m) => m.value === market).label}.`),
            h('a', { className: 'btn primary block', href: '../agent-app/index.html' }, h('span', null, 'Open Agent workspace'), h('i', { 'data-lucide': 'arrow-right' })),
            h('button', { className: 'btn ghost block', onClick: reset }, 'Close')
          )
        : h(
            'div',
            null,
            h(
              'div',
              { className: 'modal-head' },
              h('span', { className: 'pill pill-signal' }, 'Start free'),
              h('h2', null, 'Create your workspace'),
              h('p', null, 'Set up a demo workspace with your brand and first target market.')
            ),
            h(
              'form',
              { className: 'register-form', onSubmit: submit },
              h(
                'label',
                null,
                'Work email',
                h('input', {
                  type: 'email',
                  value: email,
                  onChange: (event) => setEmail(event.target.value),
                  placeholder: 'you@company.com',
                  autoComplete: 'email',
                })
              ),
              h(
                'label',
                null,
                'Brand name',
                h('input', {
                  type: 'text',
                  value: brand,
                  onChange: (event) => setBrand(event.target.value),
                  placeholder: 'BrandPilot',
                  autoComplete: 'organization',
                })
              ),
              h(
                'label',
                null,
                'Target market',
                h(
                  'select',
                  { value: market, onChange: (event) => setMarket(event.target.value) },
                  MARKETS.map((item) => h('option', { key: item.value, value: item.value }, item.label))
                )
              ),
              error ? h('p', { className: 'modal-error' }, error) : null,
              h('button', { className: 'btn primary block', type: 'submit' }, h('span', null, 'Create workspace'))
            )
          )
    )
  );
}

module.exports = RegisterModal;
