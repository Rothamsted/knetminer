/* Remove jQuery as $ so it can be used by gulp-load-plugins */
/* globals require, -$ */

var gulp  = require('gulp'),
    args = require('yargs').argv,
    del = require('del'),
    runSequence = require('run-sequence'),
    $ = require('gulp-load-plugins')({ lazy: true }),
    config = require('./gulp.config')();

// *** Code analysis ***

gulp.task('vet', function () {
  $.util.log('Running static code analysis.');

  return gulp.src(config.alljs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .pipe($.jscs.reporter())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', { verbose: true }));
});

// *** cleaning tasks ***

gulp.task('clean-styles', function () {
  var files = config.tmpDir + '**/*.css';
  clean(files);
});

gulp.task('clean-dist', function () {
  clean(['./dist/**/*', '!./dist/']);
});

// *** dev compilation ***

gulp.task('styles', ['clean-styles'], function () {
  $.util.log('Compiling Less to CSS.');

  return gulp.src(config.less)
    .pipe($.plumber(function (err) {
      $.util.log(err);
      this.emit('end');
    }))
    .pipe($.less())
    .pipe($.autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
    .pipe(gulp.dest(config.outputCssDir));
});

gulp.task('livereload', function () {
  $.watch([config.outputCss, config.js, config.html, config.outputSvg])
    .pipe($.connect.reload());
});

gulp.task('watch', function () {
  gulp.watch([config.less], ['styles']);
});

// *** HTML injection ***

gulp.task('html', function () {
  $.util.log('injecting JavaScript and CSS into the html files');

  var injectStyles = gulp.src(config.outputCss, { read: false });
  var injectScripts = gulp.src(config.js, { read: false });

  var wiredepOptions = config.getWiredepDefaultOptions();
  var injectOptions = {
    ignorePath: ['src', '.tmp'], addRootSlash: false,
  };

  var wiredep = require('wiredep').stream;

  return gulp.src(config.html)
    .pipe(wiredep(wiredepOptions))
    .pipe($.inject(injectStyles, injectOptions))
    .pipe($.inject(injectScripts, injectOptions))
    .pipe(gulp.dest(config.srcDir));
});

gulp.task('inject', ['styles'], function (done) {
  $.util.log('rebuilding styles and html');

  //Copy js into .tmp folder
  gulp.src(config.alljs)
    .pipe(gulp.dest(config.srcDir));

  // force the html task to wait for the styles
  runSequence('html', function () {
    done();
  });
});

gulp.task('serve-dev', ['inject', 'livereload'], function () {
  return $.connect.server({
    root: ['.tmp', 'assets', 'bower_components', 'test/data', 'test'],
    port: '8080',
    livereload: true,
  });
});

gulp.task('help', $.taskListing);

// create a default task and just log a message
gulp.task('default', ['help']);

gulp.task('copy-assets', ['clean-dist'], function () {
  return gulp.src('./assets/img/*', {'base' :'./assets'})
    .pipe(gulp.dest(config.build));
});

gulp.task('optimise', ['inject', 'copy-assets', 'clean-dist'], function () {
  var assets = $.useref({ searchPath: ['.tmp', './bower_components'] });

  return gulp.src(config.injectedHtml)
    .pipe($.plumber(function (err) {
      $.util.log(err);
      this.emit('end');
    }))
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(gulp.dest(config.build));
});

gulp.task('serve-prod', ['optimise'], function () {
  return $.connect.server({
    root: ['dist', 'test/data'],
    port: '8080',
    livereload: false,
  });
});

////////////
function clean(path) {
  $.util.log('Cleaning: ' + $.util.colors.blue(path));
  return del(path);
}
