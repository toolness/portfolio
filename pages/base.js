let React = require('react/addons');

let BasePage = React.createClass({
  render() {
    return (
      <html>
        <head>
          <title>{this.props.title}</title>
        </head>
        <body>
          {this.props.children}
        </body>
      </html>
    );
  }
});

module.exports = BasePage;
