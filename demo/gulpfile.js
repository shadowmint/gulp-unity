var unity = require('../index');
var gulp = require('gulp');

gulp.task('default', function(callback) {
  return gulp.src('./project')
    .pipe(unity({
      method: 'TestRunner.Run'
    }))
    .pipe(gulp.dest('./build'));
});
