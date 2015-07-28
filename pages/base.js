let React = require('react/addons');

let BasePage = React.createClass({
  render() {
    return (
      <html>
        <head>
          <title>{this.props.title}</title>
          <link rel="stylesheet" href="/vendor/skeleton/normalize.css"/>
          <link rel="stylesheet" href="/vendor/skeleton/skeleton.css"/>
        </head>
        <body>
          <div className="container">
            {this.props.children}
          </div>
        </body>
      </html>
    );
  }
});

module.exports = BasePage;
