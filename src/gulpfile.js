let path = require('path');
let gulp = require('gulp');
let yamlFront = require('yaml-front-matter');
let marked = require('marked');
let through2 = require('through2');
let File = require('vinyl');

let paths = {
  projects: 'projects/*.md'
};

function parseYamlFrontMatter() {
  return through2.obj((file, enc, cb) => {
    let contents = file.contents.toString(enc);
    file.yaml = yamlFront.loadFront(contents);
    file.markdown = file.yaml.__content;
    delete file.yaml.__content;
    cb(null, file);
  });
}

function renderMarkdown() {
  return through2.obj((file, enc, cb) => {
    file.html = marked(file.markdown, {
      smartypants: true
    });
    cb(null, file);
  });
}

function renderProjectPage(file) {
  return file.html;
}

function renderIndexPage(allPages) {
  return allPages.map(file => {
    return `<a href="${file.pageURL}">${file.yaml.problem}</a>`;
  }).join('<br>');
}

function buildHtmlPages() {
  let all = [];
  return through2.obj((file, enc, cb) => {
    let relativeDir = file.relative.match(/(.+)\.md$/)[1];
    file.pageURL = relativeDir.replace(/\\/g, '/') + '/';
    file.page = new File({
      cwd: file.cwd,
      base: file.base,
      path: path.join(file.base, relativeDir, 'index.html'),
      contents: new Buffer(renderProjectPage(file))
    });
    all.push(file);
    return cb(null, file.page);
  }, function(cb) {
    this.push(new File({
      cwd: __dirname,
      base: __dirname,
      path: path.join(__dirname, 'index.html'),
      contents: new Buffer(renderIndexPage(all))
    }));
    cb();
  });
}

gulp.task('default', ['build-html-pages']);

gulp.task('build-html-pages', () => {
  return gulp.src(paths.projects)
    .pipe(parseYamlFrontMatter())
    .pipe(renderMarkdown())
    .pipe(buildHtmlPages())
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', ['build-html-pages'], cb => {
  gulp.watch(paths.projects, ['build-html-pages']);
});
