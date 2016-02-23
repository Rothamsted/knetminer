/* globals require, -$ */

// grab our gulp packages
var gulp  = require('gulp'),
    args = require('yargs').argv,
    $ = require('gulp-load-plugins')({ lazy: true }),
    config = require('./gulp.config')();

gulp.task('vet', function () {
  return gulp.src(config.alljs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .pipe($.jscs.reporter())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', { verbose: true }));
});

// create a default task and just log a message
gulp.task('default', function () {
  return $.gutil.log('Gulp is running!');
});
