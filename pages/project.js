let React = require('React/addons');

let BasePage = require('./base');

let Action = React.createClass({
  render() {
    let action = this.props.action;

    return (
      <a href={action.url}
         className={"button u-full-width " + this.props.className}>
        {action.icon ? <i className={action.icon}></i> : null}
        {" " + action.text}
      </a>
    );
  }
});

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
          {file.yaml.cta ? <Action action={file.yaml.cta} className="button-primary"/> : null}
          {actions.map((action, i) => {
            return (
              <Action key={i} action={action}/>
            );
          })}
        </p>
      </BasePage>
    );
  }
});

module.exports = ProjectPage;
