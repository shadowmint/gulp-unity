var run = require('run-sequence');
var nodeunit = require('gulp-nodeunit');
var babel = require('gulp-babel');
var gulp = require('gulp');

/// Explicitly run items in order
gulp.task('default', function(callback) {
  run('scripts', 'tests', 'dist', callback);
});

/// Run tests
gulp.task('tests', function() {
  return gulp.src('./build/**/*.tests.js').pipe(nodeunit());
});

// Compile ES6 scripts using bable and combine
gulp.task('scripts', function() {
  return gulp.src('./src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./build'));
});

// Compile ES6 scripts using bable and combine
gulp.task('dist', function() {
  return gulp.src(['./src/**/*.js', '!./src/**/*.tests.js'])
    .pipe(babel())
    .pipe(gulp.dest('./dist'));
});
