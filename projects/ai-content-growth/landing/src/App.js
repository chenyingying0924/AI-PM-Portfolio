const React = require('react');
const h = require('./h');
const initReveals = require('./motion');
const Nav = require('./sections/Nav');
const Hero = require('./sections/Hero');
const Problem = require('./sections/Problem');
const Workflow = require('./sections/Workflow');
const Capabilities = require('./sections/Capabilities');
const Metrics = require('./sections/Metrics');
const Pricing = require('./sections/Pricing');
const CTA = require('./sections/CTA');
const Footer = require('./sections/Footer');
const RegisterModal = require('./components/RegisterModal');

function App() {
  const [registerOpen, setRegisterOpen] = React.useState(false);

  React.useEffect(() => {
    const killReveals = initReveals();
    const onDocumentClick = (event) => {
      const trigger = event.target.closest('[data-register]');
      if (trigger) {
        event.preventDefault();
        setRegisterOpen(true);
      }
    };
    document.addEventListener('click', onDocumentClick);
    if (window.lucide) {
      requestAnimationFrame(() => window.lucide.createIcons());
    }
    return () => {
      document.removeEventListener('click', onDocumentClick);
      killReveals();
    };
  }, []);

  return h(
    'div',
    { className: 'site' },
    h(Nav),
    h(Hero),
    h(Problem),
    h(Workflow),
    h(Capabilities),
    h(Metrics),
    h(Pricing),
    h(CTA),
    h(Footer),
    h(RegisterModal, { open: registerOpen, onClose: () => setRegisterOpen(false) })
  );
}

module.exports = App;
