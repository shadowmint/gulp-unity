'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

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

var _utils = require('gulp-tools/lib/utils');

var sutils = _interopRequireWildcard(_utils);

var _gulpTools = require('gulp-tools');

var _unity = require('./unity');

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UnityPlugin = (function (_Plugin) {
  (0, _inherits3.default)(UnityPlugin, _Plugin);

  function UnityPlugin() {
    (0, _classCallCheck3.default)(this, UnityPlugin);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(UnityPlugin).call(this, 'gulp-unity'));
  }

  (0, _createClass3.default)(UnityPlugin, [{
    key: 'configure',
    value: function configure(options) {
      this.options = options ? options : {};

      // The set of paths to try to find the unity executable
      this.option('paths', ['C:\\Program Files\\Unity\\Editor\\Unity.exe', '/Applications/Unity/Unity.app/Contents/MacOS/Unity']);

      // The method to invoke on the projects.
      // Null for none
      this.option('method', null, function (v) {
        return true;
      });

      // Use the -quit option to exit after we're done
      // Only turn this off for odd modes like test runners
      this.option('quit', true, function (v) {
        return true;
      });

      /// Use the -nographics option to speed up runtime
      /// Only turn this on if there's a good reason, eg. lighting calc
      this.option('nographics', true, function (v) {
        return true;
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
      var _this2 = this;

      // Look for a valid executable
      var UNITY_PATH = null;
      for (var i = 0; i < this.options.paths.length; ++i) {
        if (_fs2.default.existsSync(this.options.paths[i])) {
          UNITY_PATH = this.options.paths[i];
          break;
        }
      }

      // Fail if no valid unity path
      if (!UNITY_PATH) {
        callback(new _gulpUtil2.default.PluginError(this.name, "Unable to find any version of Unity. Is it installed?", { fileName: file.path }));
        return;
      }

      // Generate a temporary output file
      var temp = _tmp2.default.dirSync();
      temp = _path2.default.join(temp.name, 'output.txt');

      // Configure settings
      var root = file.base;
      var args = ['-batchmode', '-logFile', temp, '-projectPath', root];
      if (this.options.quit) {
        args.push('-quit');
      }
      if (this.options.nographics) {
        args.push('-nographics');
      }
      if (this.options.method) {
        args.concat(['-executeMethod', this.options.method]);
      }
      if (this.options.args.length) {
        args = args.concat(this.options.args);
      }

      // Spawn a process to invoke unity
      var proc = _child_process2.default.spawn(UNITY_PATH, args);
      proc.on('exit', function () {

        // Read output and parse it
        var output = _fs2.default.readFileSync(temp).toString('utf-8');
        var command = UNITY_PATH + ' ' + args.join(' ');
        var data = new _unity.UnityOutput(command, output);
        if (data.success) {

          // Run debug handler, if any
          if (_this2.options.debug) {
            _this2.options.debug(data);
          }

          // Return raw output to gulp
          file.contents = new Buffer((0, _stringify2.default)(output));
          callback(null, file);
        }

        // On failure, print errors and raise an error
        else {
            data.errors();
            callback(new _gulpUtil2.default.PluginError(_this2.name, 'Failed to invoke batch mode: ' + data.command, { fileName: file.path }));
          }
      });
    }
  }]);
  return UnityPlugin;
})(_gulpTools.Plugin);

/**
 * Helper function to report output to the command line.
 * Use a real nunit parser; this is just for debugging.
 */

function debug_test_results(target) {
  var parser = new _xml2js2.default.Parser();
  _fs2.default.readFile(target, function (err, data) {
    parser.parseString(data, function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      var suites = result['test-results']['test-suite'];
      for (var skey in suites) {
        var suite = suites[skey];
        for (var rkey in suite['results']) {
          var result = suite['results'][rkey];
          for (var ckey in result['test-case']) {
            var testcase = result['test-case'][ckey];
            if (testcase.$.success == 'True') {
              console.log((testcase['$']['name'] + ' - ' + testcase['$']['result']).green);
            } else {
              console.log((testcase['$']['name'] + ' - ' + testcase['$']['result']).red);
              console.log(testcase.failure[0].message[0]);
              console.log(testcase.failure[0]['stack-trace'][0]);
            }
          }
        }
      }
    });
  });
}

var rtn = new UnityPlugin().handler();
rtn.debug_test_results = debug_test_results;
exports.default = rtn;