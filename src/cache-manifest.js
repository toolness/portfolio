let path = require('path');
let walk = require('walk');

const IONICONS_VERSION = '2.0.0';

module.exports = (distDir) => {
  let error = null;
  let lines = [
    'CACHE MANIFEST',
    '# ' + (new Date().toString()),
    'NETWORK:',
    '*',
    'CACHE:'
  ];

  walk.walkSync(distDir, {
    listeners: {
      file: (root, fileStats, next) => {
        try {
          let relPath = path.relative(distDir, root)
            .replace(/\\/g, '/') + '/';
          if (fileStats.name != 'index.html')
            relPath += fileStats.name;
          if (/ionicons\.(eot|svg|ttf|woff)$/.test(fileStats.name))
            relPath += '?v=' + IONICONS_VERSION;
          if (relPath != '/')
            relPath = '/' + relPath;
          lines.push(relPath);
          next();
        } catch (e) {
          console.log(e.stack);
          error = e;
        }
      }
    }
  });

  if (error)
    throw error;

  return lines.join('\n');
};
