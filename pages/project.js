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
        <p><a href=".." className="button"><i className="ion-arrow-left-c"></i> Go Back</a></p>
      </BasePage>
    );
  }
});

module.exports = ProjectPage;
