let path = require('path');
let fs = require('fs');
let {EventEmitter} = require('events');
let express = require('express');
let gulp = require('gulp');
let gutil = require('gutil');
let gzip = require('gulp-gzip');
let s3 = require('gulp-s3');
let yamlFront = require('yaml-front-matter');
let marked = require('marked');
let through2 = require('through2');
let File = require('vinyl');

let smartypants = require('./smartypants');
let getCacheManifest = require('./cache-manifest');
let pages = require('../pages');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const BUILD_TASKS = [
  'build-cache-manifest',
];

let isWatching = null;
let paths = {
  projects: 'projects/*.md',
  vendor: 'vendor/**/*',
  css: 'css/*.css',
  images: 'img/**'
};

function parseYamlFrontMatter() {
  return through2.obj((file, enc, cb) => {
    let contents = file.contents.toString(enc);
    try {
      file.yaml = yamlFront.loadFront(contents);
    } catch (e) {
      return cb(new Error('Error processing YAML front matter for ' +
                          file.relative + ': ' + e.message));
    }
    file.markdown = file.yaml.__content;
    ['title', 'problem'].forEach(name => {
      if (name in file.yaml)
        file.yaml[name] = smartypants(file.yaml[name]);
    });
    file.yaml.importance = parseFloat(file.yaml.importance);
    if (isNaN(file.yaml.importance)) {
      file.yaml.importance = Infinity;
    }
    file.yaml.actions = file.yaml.actions || [];
    if (typeof(file.yaml.cta) === 'string') {
      file.yaml.cta = {
        text: 'Try It',
        icon: 'ion-erlenmeyer-flask',
        url: file.yaml.cta
      };
    }
    delete file.yaml.__content;
    cb(null, file);
  });
}

function renderMarkdown() {
  return through2.obj((file, enc, cb) => {
    file.html = marked(file.markdown, {
      smartypants: true
    }).replace(/-\n/g, '-');
    cb(null, file);
  });
}

function buildHtmlPages() {
  let all = [];
  return through2.obj((file, enc, cb) => {
    let relativeDir = file.relative.match(/(.+)\.md$/)[1];
    let contents;

    file.pageURL = relativeDir.replace(/\\/g, '/') + '/';

    try {
      contents = pages.renderProjectPage(file, isWatching);
    } catch (e) {
      return cb(e);
    }

    file.page = new File({
      cwd: file.cwd,
      base: file.base,
      path: path.join(file.base, relativeDir, 'index.html'),
      contents: new Buffer(contents)
    });
    all.push(file);
    return cb(null, file.page);
  }, function(cb) {
    let contents;

    try {
      contents = pages.renderHomePage(all, isWatching);
    } catch (e) {
      e.isFlushError = true;
      return cb(e);
    }

    this.push(new File({
      cwd: __dirname,
      base: __dirname,
      path: path.join(__dirname, 'index.html'),
      contents: new Buffer(contents)
    }));
    cb();
  });
}

function rebuildCacheManifest() {
  let filename = path.join(DIST_DIR, 'cache.appcache');

  if (fs.existsSync(filename)) {
    fs.unlinkSync(filename);
  }

  if (isWatching) return;

  fs.writeFileSync(filename, getCacheManifest(DIST_DIR));
}

gulp.task('default', BUILD_TASKS);

gulp.task('build-cache-manifest', [
  'build-html-pages',
  'copy-vendor-files',
  'copy-css',
  'copy-images'
], rebuildCacheManifest);

gulp.task('copy-vendor-files', () => {
  return gulp.src(paths.vendor)
    .pipe(gulp.dest('./dist/vendor'));
});

gulp.task('copy-css', () => {
  return gulp.src(paths.css)
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('copy-images', () => {
  return gulp.src(paths.images)
    .pipe(gulp.dest('./dist/img'));
});

gulp.task('build-html-pages', () => {
  let handleError = function(e) {
    if (!isWatching) throw e;
    if (e.stack)
      gutil.log(e.stack);
    else
      gutil.log(e.message);
    if (e.isFlushError) this.push(null);
    this.end();
  };

  return gulp.src(paths.projects)
    .pipe(parseYamlFrontMatter())
    .on('error', handleError)
    .pipe(renderMarkdown())
    .pipe(buildHtmlPages())
    .on('error', handleError)
    .pipe(gulp.dest('./dist'));
});

if (process.argv[2] == 'watch') {
  isWatching = new Date();
}

gulp.task('watch', BUILD_TASKS, cb => {
  gulp.watch('pages/*.js', () => {
    try {
      pages = pages.reload();
    } catch (e) {
      console.log(e.stack);
      return;
    }
    gulp.start('build-html-pages');
  });

  gulp.watch(paths.projects, ['build-html-pages']);

  gulp.watch(paths.vendor, ['copy-vendor-files']);

  gulp.watch(paths.css, ['copy-css']);

  gulp.watch(paths.images, ['copy-images']);

  let app = express();
  let watchEmitter = new EventEmitter();

  watchEmitter.setMaxListeners(0);

  app.use(express.static(DIST_DIR));

  // These are Orchestrator events, which gulp is a subclass of:
  // https://www.npmjs.com/package/orchestrator
  gulp.on('task_start', () => { isWatching = new Date(); });
  gulp.on('task_stop', () => {
    rebuildCacheManifest();
    watchEmitter.emit('task_stop');
  });

  app.get('/watch', (req, res) => {
    let p = new Promise((resolve, reject) => {
      if (req.query.latestVersion &&
          new Date(req.query.latestVersion) < isWatching)
        return resolve();

      let onTaskStop = () => resolve();

      watchEmitter.once('task_stop', onTaskStop);

      setTimeout(() => {
        watchEmitter.removeListener('task_stop', onTaskStop);
        resolve();
      }, 30000);
    }).then((result) => {
      res.send({latestVersion: isWatching});
    });
  });

  app.listen(8080, function() {
    console.log("Development server is listening on port 8080.");
  });
});

gulp.task('s3', BUILD_TASKS, function() {
  let key = process.env.AWS_ACCESS_KEY;
  let secret = process.env.AWS_SECRET_KEY;

  gutil.log('NODE_ENV is ' + process.env.NODE_ENV + '.');

  if (!key || !secret) {
    throw new Error('Please set AWS_ACCESS_KEY and AWS_SECRET_KEY ' +
    'in your environment.');
  }

  // WARNING: Even if deploying to S3 fails, no errors will be raised.
  // https://github.com/nkostelnik/gulp-s3/issues/47

  return gulp.src('./dist/**')
    .pipe(gzip())
    .pipe(s3({
      key: key,
      secret: secret,
      bucket: process.env.AWS_BUCKET || 'portfolio.toolness.org',
      region: process.env.AWS_REGION || 'us-east-1'
    }, {
      gzippedOnly: true,
      headers: {
        'Cache-Control': 'max-age=600, public'
      }
    }));
});
