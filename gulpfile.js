var gulp = require('gulp');
var gulpNgConfig = require('gulp-ng-config');
var gutil = require('gulp-util');
var addStream = require('add-stream');
var concat = require('gulp-concat');

var configureSetup  = {
  createModule: true,
};

function makeConfig() {
  return gulp.src('./config.' + process.env.NODE_ENV + '.json')
    .pipe(gulpNgConfig('wiffle.config', configureSetup));
}

gulp.task('js', function() {
  return gulp.src('script.js')
    .pipe(addStream.obj(makeConfig())) // makeConfig is defined a few code blocks up
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./dist/js'));
});