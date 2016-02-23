/* globals require, -$ */

// grab our gulp packages
var gulp  = require('gulp'),
    args = require('yargs').argv,
    del = require('del'),
    $ = require('gulp-load-plugins')({ lazy: true }),
    config = require('./gulp.config')();

gulp.task('vet', function () {
  $.util.log('Running static code analysis.');

  return gulp.src(config.alljs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .pipe($.jscs.reporter())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', { verbose: true }));
});

gulp.task('clean-styles', function () {
  var files = config.temp + '**/*.css';
  clean(files);
});

gulp.task('styles', ['clean-styles'], function () {
  $.util.log('Compiling Less to CSS.');

  return gulp.src(config.less)
    .pipe($.plumber(function (err) {
      $.util.log(err);
      this.emit('end');
    }))
    .pipe($.less())
    .pipe($.autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
    .pipe(gulp.dest(config.temp));
});

// create a default task and just log a message
gulp.task('default', function () {
  return $.util.log('Gulp is running!');
});

gulp.task('less-watcher', function () {
  gulp.watch([config.less], ['styles']);
});

////////////
function clean(path) {
  $.util.log('Cleaning: ' + $.util.colors.blue(path));
  return del(path);
}
