let React = require('React/addons');

let BasePage = require('./base');
let ProjectPage = require('./project');
let HomePage = require('./home');

exports.renderProjectPage = (file) => {
  return React.renderToStaticMarkup(<ProjectPage file={file}/>);
};

exports.renderIndexPage = (allPages) => {
  return React.renderToStaticMarkup(<HomePage allPages={allPages}/>);
};

exports.reload = () => {
  require('fs').readdirSync(__dirname).forEach(filename => {
    delete require.cache[require('path').join(__dirname, filename)];
  });

  return require('./index.js');
};
