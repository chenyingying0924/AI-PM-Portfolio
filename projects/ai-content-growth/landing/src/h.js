const React = require('react');

module.exports = function h(type, props, ...children) {
  return React.createElement(type, props, ...children);
};
