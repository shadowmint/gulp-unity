# gulp-unity

Uses batchmode to execute a unity task.

Notice that this wont work if unity is already open; just use it for automation.

## Install

```
$ npm install --save-dev shadowmint/gulp-unity
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
      method: 'TestRunner.Run'
    }))
    .pipe(gulp.dest('./foo'));
});
```

## License

MIT
