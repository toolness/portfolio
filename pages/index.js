let React = require('React/addons');

let BasePage = require('./base');

exports.renderProjectPage = (file) => {
  return React.renderToStaticMarkup(
    <BasePage title={file.yaml.title}>
      <h1>{file.yaml.problem}</h1>
      <p><strong>{file.yaml.title}</strong> | {file.yaml.year}</p>
      <div dangerouslySetInnerHTML={{__html: file.html}}/>
    </BasePage>
  );
};

exports.renderIndexPage = (allPages) => {
  return React.renderToStaticMarkup(
    <BasePage title="Atul's Portfolio">
      <h1>Atul's Portfolio</h1>
      <p>These are the problems I've tried to solve.</p>
      <ul>
        {allPages.map(file => {
          return (
            <li key={file.pageURL}>
              <a href={file.pageURL}>{file.yaml.problem}</a>
            </li>
          );
        })}
      </ul>
    </BasePage>
  );
};

exports.reload = () => {
  require('fs').readdirSync(__dirname).forEach(filename => {
    delete require.cache[require('path').join(__dirname, filename)];
  });

  return require('./index.js');
};
