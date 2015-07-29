let React = require('React/addons');

let BasePage = require('./base');

exports.renderProjectPage = (file) => {
  return React.renderToStaticMarkup(
    <BasePage title={file.yaml.title}>
      <h1>{file.yaml.problem}</h1>
      <p><strong>{file.yaml.title}</strong> | {file.yaml.year}</p>
      <div dangerouslySetInnerHTML={{__html: file.html}}/>
      <p><a href=".." title="Go back"><i className="ion-arrow-left-c"></i></a></p>
    </BasePage>
  );
};

function uncapitalize(str) {
  return str[0].toLowerCase() + str.slice(1);
}

exports.renderIndexPage = (allPages) => {
  return React.renderToStaticMarkup(
    <BasePage title="Atul’s Portfolio">
      <h1>Hi, I'm Atul.</h1>
      <p>I'm a <strong>design-driven engineer</strong>.</p>
      <p>I <strong>empathize</strong> with users, <strong>perceive</strong> problems, and <strong>build</strong> solutions for them.</p>

        {allPages.map(file => {
          return (
            <div key={file.pageURL}>
              <h5><a href={file.pageURL}>{file.yaml.title}</a></h5>
              <p>Because {uncapitalize(file.yaml.problem || '')}</p>
            </div>
          );
        })}

    </BasePage>
  );
};

exports.reload = () => {
  require('fs').readdirSync(__dirname).forEach(filename => {
    delete require.cache[require('path').join(__dirname, filename)];
  });

  return require('./index.js');
};
