/* globals require */

// grab our gulp packages
var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    gulpprint = require('gulp-print'),
    gulpif = require('gulp-if'),
    args = require('yargs').argv;

gulp.task('vet', function () {
  return gulp.src(['./src/**/*.js', './*.js'])
    .pipe(gulpif(args.verbose, gulpprint()))
    .pipe(jscs())
    .pipe(jscs.reporter())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish', { verbose: true }));
});

// create a default task and just log a message
gulp.task('default', function () {
  return gutil.log('Gulp is running!');
});
