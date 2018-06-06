/* Remove jQuery as $ so it can be used by gulp-load-plugins */
/* globals require, -$ */

var gulp  = require('gulp'),
    args = require('yargs').argv,
    del = require('del'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    ignore = require('gulp-ignore'),
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

gulp.task('clean-dist', function () {
  clean('./dist/*');
});

// *** CSS Compilation ***

gulp.task('copy-css', ['clean-dist'], function () {
  return gulp.src(config.css)
  	.pipe(concat('knetmaps.css'))
    .pipe(gulp.dest(config.outputCss, {overwrite : true}));
});

// *** JS copying ***
gulp.task('copy-js', function() {
	  return gulp.src(config.js)
	  	.pipe(concat('knetmaps.js'))
	    .pipe(gulp.dest(config.outputJs, {overwrite : true}))
	  	.pipe(rename('knetmaps.min.js'))
	  	.pipe(uglify())
	    .pipe(gulp.dest(config.outputJs, {overwrite : true}));
});

//*** Lib copying ***
gulp.task('copy-libs', function() {
	  return gulp.src(config.libs)
	  	.pipe(concat('knetmaps-lib.js'))
	    .pipe(gulp.dest(config.outputJs, {overwrite : true}))
	  	.pipe(rename('knetmaps-lib.min.js'))
	  	.pipe(uglify())
	    .pipe(gulp.dest(config.outputJs, {overwrite : true}));
});

//*** Lib copying ***
gulp.task('copy-libs-nojquery', function() {
	  return gulp.src(config.libs)
	  	.pipe(ignore.exclude('jquery-1.11.2.min.js'))
	  	.pipe(concat('knetmaps-lib-nojquery.js'))
	    .pipe(gulp.dest(config.outputJs, {overwrite : true}))
	  	.pipe(rename('knetmaps-lib-nojquery.min.js'))
	  	.pipe(uglify())
	    .pipe(gulp.dest(config.outputJs, {overwrite : true}));
});

//*** Image copying ***
gulp.task('copy-images', function() {
	  return gulp.src(config.images)
	    .pipe(gulp.dest(config.outputImages, {overwrite : true}));
});


gulp.task('help', $.taskListing);

// create a default task and just log a message
gulp.task('default', ['help']);

gulp.task('optimise', ['copy-css','copy-js','copy-libs-nojquery','copy-libs','copy-images']);

////////////
