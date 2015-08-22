'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _gulpUtil = require('gulp-util');

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

var _gulpToolsLibUtils = require('gulp-tools/lib/utils');

var sutils = _interopRequireWildcard(_gulpToolsLibUtils);

var _gulpTools = require('gulp-tools');

var Sass = (function (_Plugin) {
  _inherits(Sass, _Plugin);

  function Sass() {
    _classCallCheck(this, Sass);

    _get(Object.getPrototypeOf(Sass.prototype), 'constructor', this).call(this, 'gulp-sass-native');
  }

  _createClass(Sass, [{
    key: 'handle_string',
    value: function handle_string(file, value, callback) {
      var isWin = /^win/.test(process.platform);
      if (isWin) {
        var sass_process = _child_process2['default'].spawn('ruby', ['C:\\Ruby22-x64\\bin\\sass', '-I.', '-s', '--scss'], { cwd: file.base });
      } else {
        var sass_process = _child_process2['default'].spawn('sass', ['-I.', '-s', '--scss'], { cwd: file.base });
      }
      var failed = false;
      var self = this;
      sutils.read_from_stream(sass_process.stderr, 'utf8', function (value) {
        if (value) {
          failed = true;
          callback(new _gulpUtil2['default'].PluginError(self.name, value, { fileName: file.path }));
        }
      });
      sutils.read_from_stream(sass_process.stdout, 'utf8', function (value) {
        if (value && !failed) {
          file.path = _gulpUtil2['default'].replaceExtension(file.path, '.css');
          file.contents = new Buffer(value);
          callback(null, file);
        }
      });
      sass_process.stdin.write(value);
      sass_process.stdin.end();
    }
  }]);

  return Sass;
})(_gulpTools.Plugin);

exports['default'] = new Sass().handler();
module.exports = exports['default'];