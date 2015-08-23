var unity = require('../index');
var gulp = require('gulp');

gulp.task('default', function(callback) {
  return gulp.src('./project/README.md')
    .pipe(unity({
      method: 'TestRunner.Run',
      debug: (v) => {
        unity.debug(v, [
          { pattern: /\*\* Test.*/, color: 'green' },
          { pattern: /\!\! Test.*/, color: 'red' },
          { pattern: /\*.*/ },
          { pattern: /^DEBUG:.*/, color: 'yellow', context: 3 },
        ])
      }
    }))
    .pipe(gulp.dest('./build'));
});
