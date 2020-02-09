let React = require('react/addons');

let devModeSnippet = (latestVersion) => {
  return '(' + (latestVersion => {
    let checkVersion = () => {
      let req = new XMLHttpRequest();

      req.open('GET', '/watch?latestVersion=' +
                      encodeURIComponent(latestVersion));
      req.onload = () => {
        checkVersion();
        let newLatestVersion = JSON.parse(req.responseText).latestVersion;
        window.sessionStorage.latestVersion = newLatestVersion;
        if (newLatestVersion != latestVersion) {
          window.location.reload();
        }
      };
      req.onerror = () => {
        checkVersion();
      };
      req.send(null);
    };
    checkVersion();
  }).toString() + ')(window.sessionStorage.latestVersion || ' +
                  JSON.stringify(latestVersion) + ');';
};

let progressivelyEnhanceImagesSnippet = '(' + (() => {
  let images = document.querySelectorAll('img[data-progressive-src]');
  let progressivelyEnhance = function(img) {
    let newSrc = img.getAttribute('data-progressive-src');
    let loader = document.createElement('img');
    loader.onload = function() {
      img.setAttribute('src', newSrc);
    };
    loader.setAttribute('src', newSrc);
  }

  for (let i = 0; i < images.length; i++) {
    progressivelyEnhance(images[i]);
  }
}).toString() + ')()';

let BasePage = React.createClass({
  mixins: [React.addons.PureRenderMixin],
  render() {
    return (
      <html manifest={this.props.inDevMode ? null : "/cache.appcache"} lang="en">
        <head>
          <meta charSet="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <title>{this.props.title}</title>
          <link rel="stylesheet" href="/vendor/skeleton/normalize.css"/>
          <link rel="stylesheet" href="/vendor/skeleton/skeleton.css"/>
          <link rel="stylesheet" href="/vendor/ionicons/css/ionicons.css"/>
          <link rel="stylesheet" href="/css/styles.css"/>
        </head>
        <body>
          <div className="container">
            {this.props.children}
            <footer>
              <ul>
                <li><a href="https://www.toolness.com/">Blog</a></li>
                <li><a href="https://s3.amazonaws.com/toolness-fun/ResumeforAtulVarma.pdf">Résumé</a></li>
                <li><a href="https://toolness.github.io/">GitHub</a></li>
              </ul>
            </footer>
          </div>
          {this.props.inDevMode
           ? <script dangerouslySetInnerHTML={{__html: devModeSnippet(this.props.inDevMode)}}/>
           : null}
          <script dangerouslySetInnerHTML={{__html: progressivelyEnhanceImagesSnippet}}/>
        </body>
      </html>
    );
  }
});

module.exports = BasePage;
