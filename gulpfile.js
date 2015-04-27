var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    header = require('gulp-header'),
    gjslint = require('gulp-gjslint'),
    browserify = require('gulp-browserify'),
    runSequence = require('run-sequence'),
    mochaPhantomJS = require('gulp-mocha-phantomjs'),
    serverJQuery,
    serverDjax,
    apiJQuery,
    apiDjax;



/**
 * **************
 * GENERIC TASKS:
 * **************
 */
gulp.task('lint', function() {
  // Linting configurations
  var jshintConfig = {
        '-W055': true,
        '-W040': true,
        '-W064': true,
        node: true,
        browser: true
      },
      gjslintConfig = {
        flags: ['--nojsdoc', '--disable 211,212']
      };

  return gulp.src('./djax.js')
    .pipe(jshint(jshintConfig))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .pipe(gjslint(gjslintConfig))
    .pipe(gjslint.reporter('console'), {fail: true});
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

  return gulp.src('./djax.js')
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename('djax.min.js'))
    .pipe(gulp.dest('./'));
});



/**
 * ****************
 * DJAX TEST SUITE:
 * ****************
 */
gulp.task('build-tests-djax', function() {
  return gulp.src('./test/unit.djax.js')
    .pipe(browserify({ debug: true }))
    .pipe(gulp.dest('./test/build'));
});

gulp.task('run-test-djax', ['build-tests-djax'], function() {
  delete require.cache[require.resolve('./test/api-mockup.js')];
  apiDjax = require('./test/api-mockup.js');

  // Launching API server
  serverDjax = apiDjax.listen(8001);

  // Launching mocha tests through phantomjs
  var stream = mochaPhantomJS();
  stream.write({path: 'http://localhost:8001/browser/unit.djax.html'});
  stream.on('error', function() {

    // Tearing down server if an error occurred
    serverDjax.close();
  });
  stream.end();
  return stream;
});

gulp.task('test-djax', ['run-test-djax'], function() {
  // Tests are over, we close the server
  serverDjax.close();
  return gulp;
});



/**
 * ******************
 * JQUERY TEST SUITE:
 * ******************
 */
gulp.task('build-tests-jquery', function() {
  return gulp.src('./test/unit.jquery.js')
    .pipe(browserify({ debug: true }))
    .pipe(gulp.dest('./test/build'));
});

gulp.task('run-test-jquery', ['build-tests-jquery'], function() {
  delete require.cache[require.resolve('./test/api-mockup.js')];
  apiJQuery = require('./test/api-mockup.js');

  // Launching API server
  serverJQuery = apiJQuery.listen(8002);

  // Launching mocha tests through phantomjs
  var stream = mochaPhantomJS();
  stream.write({path: 'http://localhost:8002/browser/unit.jquery.html'});
  stream.on('error', function() {

    // Tearing down server if an error occurred
    serverJQuery.close();
  });
  stream.end();
  return stream;
});

gulp.task('test-jquery', ['run-test-jquery'], function() {
  // Tests are over, we close the server
  serverJQuery.close();
  return gulp;
});



/**
 * ***********
 * META TASKS:
 * ***********
 */
// Macro tasks
gulp.task('test', function() {
  runSequence('test-djax', 'test-jquery');
});
gulp.task('default', ['lint', 'test',  'build']);
