var unity = require('../index');
var run = require('run-sequence');
var gulp = require('gulp');

gulp.task('default', function(callback) {
  run('good', 'bad', callback);
});

// This task should deliberately generate an error
gulp.task('bad', function(callback) {
  return gulp.src('./project/README.md')
    .pipe(unity({
      method: 'TestRunner.Run.Missing'
    }));
});

// This should work
gulp.task('good', function(callback) {
  return gulp.src('./project/README.md')
    .pipe(unity({
      method: 'TestRunner.Run',
      debug: (v) => {
        unity.debug(v, [
          { pattern: /\*\* Test.*/, color: 'green' },
          { pattern: /\!\! Test.*/, color: 'red' },
          { pattern: /\*.*/ },
          { pattern: /^DEBUG:.*/, color: 'yellow', context: 3 },
          { pattern: /System.Exception/, color: 'red', context: true },
        ])
      }
    }));
});
