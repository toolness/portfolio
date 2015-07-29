let React = require('React/addons');

let BasePage = require('./base');

let HomePage = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  render() {
    let allPages = this.props.allPages;

    return (
      <BasePage title="Atul’s Portfolio">
        <h1>Hi, I'm Atul.</h1>
        <p>I'm a <strong>design-driven engineer</strong>.</p>
        <p>I <strong>empathize</strong> with users, <strong>perceive</strong> opportunities, and <strong>build</strong> solutions for them.</p>

          {allPages.map(file => {
            return (
              <div key={file.pageURL}>
                <h5><a href={file.pageURL}>{file.yaml.title}</a></h5>
                <p>Because {uncapitalize(file.yaml.problem)}</p>
              </div>
            );
          })}

      </BasePage>
    );
  }
});

function uncapitalize(str) {
  if (typeof(str) !== 'string') return '';
  return str[0].toLowerCase() + str.slice(1);
}

module.exports = HomePage;
