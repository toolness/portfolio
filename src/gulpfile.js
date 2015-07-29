let path = require('path');
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
let pages = require('../pages');

const BUILD_TASKS = [
  'build-html-pages',
  'copy-vendor-files'
];

let isWatching = false;
let paths = {
  projects: 'projects/*.md',
  vendor: 'vendor/**/*'
};

function parseYamlFrontMatter() {
  return through2.obj((file, enc, cb) => {
    let contents = file.contents.toString(enc);
    file.yaml = yamlFront.loadFront(contents);
    file.markdown = file.yaml.__content;
    ['title', 'problem'].forEach(name => {
      if (name in file.yaml)
        file.yaml[name] = smartypants(file.yaml[name]);
    });
    file.yaml.importance = parseFloat(file.yaml.importance);
    if (isNaN(file.yaml.importance)) {
      file.yaml.importance = Infinity;
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
      contents = pages.renderProjectPage(file);
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
      contents = pages.renderHomePage(all);
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

gulp.task('default', BUILD_TASKS);

gulp.task('copy-vendor-files', () => {
  return gulp.src(paths.vendor)
    .pipe(gulp.dest('./dist/vendor'));
});

gulp.task('build-html-pages', () => {
  return gulp.src(paths.projects)
    .pipe(parseYamlFrontMatter())
    .pipe(renderMarkdown())
    .pipe(buildHtmlPages())
    .on('error', function(e) {
      if (!isWatching) throw e;
      gutil.log(e.stack);
      if (e.isFlushError) this.push(null);
      this.end();
    })
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', BUILD_TASKS, cb => {
  isWatching = true;

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

  let app = express();

  app.use(express.static(path.join(__dirname, '..', 'dist')));

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
