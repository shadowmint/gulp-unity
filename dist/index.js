'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

var _gulpUtil = require('gulp-util');

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

var _gulpToolsLibUtils = require('gulp-tools/lib/utils');

var sutils = _interopRequireWildcard(_gulpToolsLibUtils);

var _gulpTools = require('gulp-tools');

var _parser = require('./parser');

var UnityPlugin = (function (_Plugin) {
  _inherits(UnityPlugin, _Plugin);

  function UnityPlugin() {
    _classCallCheck(this, UnityPlugin);

    _get(Object.getPrototypeOf(UnityPlugin.prototype), 'constructor', this).call(this, 'gulp-unity');
  }

  _createClass(UnityPlugin, [{
    key: 'configure',
    value: function configure(options) {
      this.options = options ? options : {};

      // The set of paths to try to find the unity executable
      this.option('paths', ['C:\\Program Files\\Unity\\Editor\\Unity.exe', '/Applications/Unity/Unity.app/Contents/MacOS/Unity']);

      // The method to invoke on the projects.
      this.option('method', null, function (v) {
        return v != null;
      });

      // Pass additional command line arguments?
      this.option('color', true);

      // Additional command line arguments
      this.option('args', []);

      // Do something with debug output lines
      this.option('debug', false, function (v) {
        return v === false || typeof v === 'function';
      });
    }
  }, {
    key: 'handle_string',
    value: function handle_string(file, value, callback) {
      var _this = this;

      // Look for a valid executable
      var UNITY_PATH = null;
      for (var i = 0; i < this.options.paths.length; ++i) {
        if (_fs2['default'].existsSync(this.options.paths[i])) {
          UNITY_PATH = this.options.paths[i];
          break;
        }
      }

      // Fail if no valid unity path
      if (!UNITY_PATH) {
        callback(new _gulpUtil2['default'].PluginError(this.name, "Unable to find any version of Unity. Is it installed?", { fileName: file.path }));
        return;
      }

      // Generate a temporary output file
      var temp = _tmp2['default'].dirSync();
      temp = _path2['default'].join(temp.name, 'output.txt');

      // Configure settings
      var root = file.base;
      var args = ['-batchmode', '-nographics', '-quit', '-logFile', temp, '-projectPath', root, '-executeMethod', this.options.method];
      if (this.options.args.length) {
        args = args.concat(this.options.args);
      }

      // Spawn a process to invoke unity
      var proc = _child_process2['default'].spawn(UNITY_PATH, args);
      proc.on('exit', function () {
        var output = _fs2['default'].readFileSync(temp).toString('utf-8');
        var data = new _parser.Parser().parse(output);
        data.command = UNITY_PATH + ' ' + args.join(' ');
        if (data.success) {
          if (_this.options.debug) {
            for (var i = 0; i < data.debug.length; ++i) {
              _this.options.debug(data.debug[i]);
            }
          }
          file.contents = new Buffer(JSON.stringify(data.debug));
          callback(null, file);
        } else {
          for (var i = 0; i < data.stdout.length; ++i) {
            console.log(_this.options.color ? data.stdout[i].yellow : data.stdout[i]);
          }
          for (var i = 0; i < data.stderr.length; ++i) {
            console.log(_this.options.color ? data.stderr[i].red : data.stderr[i]);
          }
          callback(new _gulpUtil2['default'].PluginError(_this.name, 'Failed to invoke batch mode: ' + data.command, { fileName: file.path }));
        }
      });
    }

    /**
     * Debugging helper
     * For each pattern and color pairs in the form: { pattern: /.../, color: 'green' }
     * If the non-debug info of a debug line matches pattern, log it with color
     * @param record A debug record
     * @param patterns An array of {pattern: //, color: ''}
     */
  }], [{
    key: 'debug',
    value: function debug(record, patterns) {
      var end_of_input = /^UnityEngine.Debug.*/;
      for (var i = 0; i < record.length; ++i) {
        if (record[i].match(end_of_input)) {
          break;
        }
        for (var j = 0; j < patterns.length; ++j) {
          if (record[i].match(patterns[j].pattern)) {
            console.log(patterns[j].color ? record[i][patterns[j].color] : record[i]);
            if (patterns[j].context === true) {
              for (var k = i + 1; k < record.length; ++k) {
                console.log(patterns[j].color ? record[k][patterns[j].color] : record[k]);
              }
            }
            if (patterns[j].context) {
              for (var k = i + 1; k < record.length && k < i + patterns[j].context + 1; ++k) {
                console.log(patterns[j].color ? record[k][patterns[j].color] : record[k]);
              }
            }
            break;
          }
        }
      }
    }
  }]);

  return UnityPlugin;
})(_gulpTools.Plugin);

var rtn = new UnityPlugin().handler();
rtn.debug = UnityPlugin.debug;

exports['default'] = rtn;
module.exports = exports['default'];