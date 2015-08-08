let React = require('React/addons');

let BasePage = require('./base');
let ProjectPage = require('./project');
let HomePage = require('./home');

const DOCTYPE = '<!DOCTYPE html>';

exports.renderProjectPage = (file, inDevMode = false) => {
  return DOCTYPE + React.renderToStaticMarkup(
    <ProjectPage file={file} inDevMode={inDevMode}/>
  );
};

exports.renderHomePage = (allPages, inDevMode = false) => {
  return DOCTYPE + React.renderToStaticMarkup(
    <HomePage allPages={allPages} inDevMode={inDevMode}/>
  );
};

exports.reload = () => {
  require('fs').readdirSync(__dirname).forEach(filename => {
    delete require.cache[require('path').join(__dirname, filename)];
  });

  return require('./index.js');
};
