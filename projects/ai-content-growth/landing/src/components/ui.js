const h = require('../h');

function Button({ href, variant = 'primary', icon, children, className = '', onClick, type, ...rest }) {
  const classes = ['btn', `btn-${variant}`, className].filter(Boolean).join(' ');
  const iconNode = icon ? h('i', { 'data-lucide': icon }) : null;
  const content = [iconNode, h('span', { className: 'btn-label' }, children)].filter(Boolean);
  if (href) {
    return h('a', { className: classes, href, onClick, ...rest }, ...content);
  }
  return h('button', { className: classes, onClick, type: type || 'button', ...rest }, ...content);
}

function Pill({ children, tone = 'default', className = '' }) {
  return h('span', { className: `pill pill-${tone} ${className}`.trim() }, children);
}

function Container({ children, className = '', id }) {
  return h('div', { className: `container ${className}`.trim(), id }, children);
}

function GlassPanel({ children, className = '', glow = false }) {
  return h('div', { className: `glass-panel ${glow ? 'glass-glow' : ''} ${className}`.trim() }, children);
}

function SectionHead({ title, copy, eyebrow, align = 'left' }) {
  return h(
    'div',
    { className: `section-head section-head-${align}` },
    eyebrow ? h(Pill, { tone: 'signal', className: 'section-eyebrow' }, eyebrow) : null,
    h('h2', null, title),
    copy ? h('p', { className: 'section-copy' }, copy) : null
  );
}

function LogoMark({ compact = false }) {
  return h(
    'span',
    { className: `logo-mark ${compact ? 'logo-mark-compact' : ''}` },
    h('i', { 'data-lucide': 'sparkles' })
  );
}

function MetricTile({ value, label, sub, tag }) {
  return h(
    'div',
    { className: 'metric-tile' },
    h('div', { className: 'metric-value' }, value),
    h('div', { className: 'metric-label' }, label),
    sub ? h('div', { className: 'metric-sub' }, sub) : null,
    tag ? h('span', { className: 'metric-tag' }, tag) : null
  );
}

module.exports = {
  Button,
  Pill,
  Container,
  GlassPanel,
  SectionHead,
  LogoMark,
  MetricTile,
};
