import unity from '../index';
import run from 'run-sequence';
import gulp from 'gulp';
import path from 'path';

gulp.task('default', function(callback) {
  run('good', 'bad', 'tests', callback);
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
        v.debug([
          { pattern: /\*\* Test.*/, color: 'green' },
          { pattern: /\!\! Test.*/, color: 'red' },
          { pattern: /\*.*/ },
          { pattern: /^DEBUG:.*/, color: 'yellow', context: 3 },
          { pattern: /System.Exception/, color: 'red', context: true },
        ]);
      }
    }));
});

// Run tests, then print debug results
gulp.task('tests', function(callback) {
  run('unity-tests', function() {
    unity.debug_test_results(path.join(__dirname, 'project/EditorTestResults.xml'));
    callback();
  });
});

// Run tests, then print debug results
gulp.task('unity-tests', function(callback) {
  return gulp.src('./project/README.md')
    .pipe(unity({
      args: ['-runEditorTests'],
      debug: (v) => {
        console.log(v);
        v.debug([
          { pattern: /.*/, color: 'yellow' }
        ]);
      }
    }));
});
