# gulp-sass-native

Uses the command line sass compiler instead of libsass.

## Install

```
$ npm install --save-dev shadowmint/gulp-sass-native#0.0.1
```

## Usage

```js
var gulp = require('gulp');
var sass = require('gulp-sass-native');

gulp.task('default', function () {
	return gulp.src('src/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('dist'));
});
```

## License

MIT
