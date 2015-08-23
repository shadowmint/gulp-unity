# gulp-unity

Uses batchmode to execute a unity task.

Notice that this wont work if unity is already open; just use it for automation.

## Install

```
$ npm install --save-dev shadowmint/gulp-unity#0.0.1
```

## Usage

Look at the 'demo' folder.

Pass in a single file from the root folder of the project.

```js
var unity = require('gulp-unity');
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
    }));
})
```

## Required options

You must provide the batchmode function to invoke, eg:

    method: 'TestRunner.Run'

Where:

    class TestRunner {
      public static void Run() {
        ...
      }
    }

## Default options

```js
// The set of paths to try to find the unity executable
this.option('paths', [
  'C:\\Program Files\\Unity\\Editor\\Unity.exe',
  '/Applications/Unity/Unity.app/Contents/MacOS/Unity'
]);

// Use coloured output?
this.option('color', true);

// Do something with debug output lines
this.option('debug', false);

// Provide an array of additional command line arguments
this.option('args', null);
```

## License

MIT
