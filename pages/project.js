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

let FeaturedIn = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  render() {
    let props = this.props;

    return (
      <p className="featured-in">As featured in <a href={props.url} alt={props.name}>
        <img src={props.img}/>
      </a></p>
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
      <BasePage title={file.yaml.title} inDevMode={this.props.inDevMode}>
        <h1>{file.yaml.problem}</h1>
        <p><strong>{file.yaml.title}</strong> | {file.yaml.year}</p>
        <div dangerouslySetInnerHTML={{__html: file.html}}/>
        {file.yaml.featured_in
         ? <FeaturedIn {...file.yaml.featured_in[0]}/>
         : null}
        <div>
          {file.yaml.cta ? <Action action={file.yaml.cta} className="button-primary"/> : null}
          {actions.map((action, i) => {
            return (
              <Action key={i} action={action}/>
            );
          })}
        </div>
      </BasePage>
    );
  }
});

module.exports = ProjectPage;
