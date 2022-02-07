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
function clean(path) {
  $.util.log('Cleaning: ' + $.util.colors.blue(path));
  return del(path);
}

gulp.task('clean-styles', function () {
  var files = config.tmpDir + '**/*.css';
  clean(files);
});

gulp.task('clean-dist', function () {
  clean('./dist/*');
});

// *** CSS Compilation ***

gulp.task('compile-styles', ['clean-styles'], function () {
  $.util.log('Compiling Less to CSS.');

  return gulp.src(config.less)
    .pipe($.plumber(function (err) {
      $.util.log(err);
      this.emit('end');
    }))
    .pipe($.less())
    .pipe($.autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
    .pipe(gulp.dest(config.outputCssDir, {overwrite : true}));
});

// *** JS copying ***
gulp.task('copy-js', function() {
  //Copy js into .tmp folder
  $.util.log('Moving js files into place');
  return gulp.src(config.alljs)
    .pipe(gulp.dest(config.srcDir, {overwrite : true}));
});

// *** HTML injection ***

gulp.task('inject-html', ['compile-styles'],  function () {
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
    .pipe(gulp.dest(config.srcDir), {overwrite: true});
});


// *** All Injection ***
gulp.task('inject', ['compile-styles', 'copy-js', 'inject-html'] );

// *** Watch and live reload ***

gulp.task('watch-css', ['inject-html'], function () {
  return gulp.watch(config.less, ['compile-styles'] );
});

gulp.task('watch-js', ['inject-html', 'copy-js'], function () {
  return gulp.watch(config.js, ['copy-js'] );
});

gulp.task('watch-html', ['inject-html'], function () {
  return gulp.watch(config.html, ['inject-html'] );
});

gulp.task( 'watch', ['watch-css', 'watch-js', 'watch-html']), function (){
  return $.util.log('Watching  styles and js');
};

gulp.task( 'reload', function() {
  gulp.src(config.injectedHtml)
    .pipe($.connect.reload() );

})

gulp.task('livereload', ['watch'],  function () {
  $.util.log('Connecting live reload');
  //return gulp.watch(config.allOutputFiles, $.batch( function(){
  //    gulp.src(config.injectedHtml)
  //      .pipe($.connect.reload() );
  //}));
  return gulp.watch(config.allOutputFiles,  function(){
    gulp.src(config.injectedHtml)
      .pipe($.connect.reload() );
  });
});


//gulp.task('serve-dev', [ 'livereload', 'inject'], function () {
gulp.task('serve-dev', [ 'livereload'], function () {
  $.util.log('Starting serve-dev');
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
