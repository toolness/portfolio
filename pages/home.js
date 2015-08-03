let React = require('React/addons');

let BasePage = require('./base');

let FeaturedIn = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  render() {
    let props = this.props;

    return <p className="featured-in">As featured in <img src={props.img} alt={props.name}/></p>;
  }
});

let HomePage = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  render() {
    let allPages = sortProjects(this.props.allPages);

    return (
      <BasePage title="Atul’s Portfolio">
        <h1>Hi, I’m Atul.</h1>
        <p>I’m a <strong>design-driven engineer</strong>.</p>
        <p>I <strong>empathize</strong> with users, <strong>perceive</strong> opportunities, and <strong>build</strong> solutions for them.</p>

          {allPages.map(file => {
            return (
              <a className="project" href={file.pageURL} key={file.pageURL}>
                <h5>{file.yaml.title}</h5>
                <p>Because {uncapitalize(file.yaml.problem)}</p>
                {file.yaml.featured_in
                 ? <FeaturedIn {...file.yaml.featured_in[0]}/>
                 : null}
              </a>
            );
          })}

      </BasePage>
    );
  }
});

function sortProjects(projects) {
  projects = projects.slice();

  projects.sort((a, b) => {
    if (a.yaml.importance < b.yaml.importance) {
      return -1;
    }
    if (a.yaml.importance > b.yaml.importance) {
      return 1;
    }
    return 0;
  });

  return projects;
}

function uncapitalize(str) {
  if (typeof(str) !== 'string') return '';
  return str[0].toLowerCase() + str.slice(1);
}

module.exports = HomePage;
