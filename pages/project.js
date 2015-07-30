let React = require('React/addons');

let BasePage = require('./base');

let ProjectPage = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  render() {
    let file = this.props.file;
    let actions = file.yaml.actions.concat([{
      text: 'Go Back',
      icon: 'ion-arrow-left-c',
      url: '..'
    }]);

    return (
      <BasePage title={file.yaml.title}>
        <h1>{file.yaml.problem}</h1>
        <p><strong>{file.yaml.title}</strong> | {file.yaml.year}</p>
        <div dangerouslySetInnerHTML={{__html: file.html}}/>
        <p>
          {file.yaml.cta
           ? <a href={file.yaml.cta.url} className="button button-primary u-full-width">{file.yaml.cta.text}</a>
           : null}
          {actions.map((action, i) => {
            return (
              <a key={i} href={action.url} className="button u-full-width">
                {action.icon ? <i className={action.icon}></i> : null}
                {" " + action.text}
              </a>
            );
          })}
        </p>
      </BasePage>
    );
  }
});

module.exports = ProjectPage;
