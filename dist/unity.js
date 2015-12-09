'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnityOutput = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _parser = require('./parser');

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** High level unity output handler */

var UnityOutput = exports.UnityOutput = (function () {

  /** Create a new instance and parse that output */

  function UnityOutput(command, raw) {
    (0, _classCallCheck3.default)(this, UnityOutput);

    this.command = command;
    this.content = new _parser.Parser();
    this.content.parse(raw);
    this.success = this.content.filter(_parser.BlockType.EXIT) == 0;
  }

  /** Print errors */

  (0, _createClass3.default)(UnityOutput, [{
    key: 'errors',
    value: function errors(patterns) {
      var records = this.content.filter(_parser.BlockType.ERROR);
      for (var i = 0; i < records.length; ++i) {
        var record = records[i];
        for (var j = 0; j < record.lines.length; ++j) {
          console.log(_colors2.default.red(record.lines[j]));
        }
      }
      var records = this.content.filter(_parser.BlockType.EXIT);
      for (var i = 0; i < records.length; ++i) {
        var record = records[i];
        for (var j = 0; j < record.lines.length; ++j) {
          console.log(_colors2.default.red(record.lines[j]));
        }
      }
    }

    /**
     * Debugging helper
     * For each pattern and color pairs in the form: { pattern: /.../, color: 'green' }
     * If the non-debug info of a debug line matches pattern, log it with color
     * @param patterns An array of {pattern: //, color: ''}
     */

  }, {
    key: 'debug',
    value: function debug(patterns) {

      // Process debug output
      var records = this.content.filter(_parser.BlockType.DEBUG);
      for (var i = 0; i < records.length; ++i) {
        var record = records[i];

        // For each pattern, if it matches print the output
        for (var j = 0; j < patterns.length; ++j) {
          if (record.matches(patterns[j].pattern)) {
            this.emit(record, record.lines[0], patterns[j].color);
            if (patterns[j].context === true) {
              for (var k = 1; k < record.lines.length; ++k) {
                this.emit(record, record.lines[k], patterns[j].color);
              }
            } else if (patterns[j].context) {
              for (var k = 1; k < record.lines.length && k < patterns[j].context + 1; ++k) {
                this.emit(record, record.lines[k], patterns[j].color);
              }
            }
            break;
          }
        }
      }
    }

    /** Print a block in a color, or normally */

  }, {
    key: 'emit',
    value: function emit(block, value, color) {
      var output = '' + (color ? value[color] : value);
      console.log(output);
    }
  }]);
  return UnityOutput;
})();