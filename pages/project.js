let React = require('React/addons');

let BasePage = require('./base');

let ProjectPage = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  render() {
    let file = this.props.file;

    return (
      <BasePage title={file.yaml.title}>
        <h1>{file.yaml.problem}</h1>
        <p><strong>{file.yaml.title}</strong> | {file.yaml.year}</p>
        <div dangerouslySetInnerHTML={{__html: file.html}}/>
        <p>
          {file.yaml.cta
           ? <a href={file.yaml.cta.url} className="button button-primary u-full-width">{file.yaml.cta.text}</a>
           : null}
          <a href=".." className="button u-full-width"><i className="ion-arrow-left-c"></i> Go Back</a>
        </p>
      </BasePage>
    );
  }
});

module.exports = ProjectPage;
