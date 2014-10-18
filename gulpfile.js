var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    header = require('gulp-header'),
    browserify = require('gulp-browserify'),
    mochaPhantomJS = require('gulp-mocha-phantomjs');

// Files
var indexFile = './djax.js';

// Linting
gulp.task('lint', function() {
  // Linting configurations
  var jshintConfig = {
    '-W055': true,
    '-W040': true,
    '-W064': true,
    node: true,
    browser: true
  };

  return gulp.src(indexFile)
    .pipe(jshint(jshintConfig))
    .pipe(jshint.reporter('default'));
});

gulp.task('build', function() {
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n'),
  pkg = require('./package.json');

  return gulp.src(indexFile)
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename('djax.min.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('build-tests', function() {
  return gulp.src('./test/unit.js')
    .pipe(browserify({ debug: true }))
    .pipe(gulp.dest('./test/build'));
});

gulp.task('test', ['build-tests'], function() {
  var stream = mochaPhantomJS();
  stream.write({path: 'http://localhost:8001/browser/unit.html'});
  stream.end();
  return stream;
})

// Macro tasks
gulp.task('default', ['lint', 'build']);
