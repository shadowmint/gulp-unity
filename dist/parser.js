'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var State = {
  NONE: 'NONE',
  STDOUT: 'STDOUT',
  STDERR: 'STDERR'
};

var Parser = (function () {
  function Parser() {
    _classCallCheck(this, Parser);

    // Match stdout with this on a line
    this.stdout = /^-----CompilerOutput:-stdout.*/;

    // Match stderr with this on a line
    this.stderr = /^-----CompilerOutput:-stderr.*/;

    // Match end of output with this on a line
    this.end = /^-----EndCompilerOutput---------------$/;

    // Match failure code from this
    this.failure = /^Aborting batchmode due to failure.*/;

    // Marks start of debug output
    this.debug_output_start = /^Total:.*/;

    // Debug message start
    this.debug_start = /^UnityEngine.Debug:Internal_Log.*/;

    // Debug message end
    this.debug_end = /\(Filename:.*/;

    // Current state
    this.prev_state = null;
    this.state = State.NONE;
  }

  /** Parse unity output and collect stdout and stderr */

  _createClass(Parser, [{
    key: 'parse',
    value: function parse(raw) {

      var token = [];
      var token_is_debug = false;
      var debug_has_started = false;

      var rtn = {
        stdout: [],
        stderr: [],
        debug: [],
        success: true
      };

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.lines(raw)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var line = _step.value;

          if (debug_has_started) {
            token.push(line);
          }

          // Next state, if any?
          if (line.match(this.stdout)) {
            this.state = State.STDOUT;
            continue;
          } else if (line.match(this.stderr)) {
            this.state = State.STDERR;
            continue;
          } else if (line.match(this.end)) {
            this.state = State.NONE;
          } else if (line.match(this.debug_start)) {
            this.state_prev = this.state;
            this.state = State.DEBUG;
            token_is_debug = true;
          } else if (line.match(this.debug_end)) {
            this.state = this.state_prev;
            this.state_prev = null;
            if (token_is_debug) {
              rtn.debug.push(token);
            }
            token = [];
          } else if (line.match(this.debug_output_start)) {
            debug_has_started = true;
            token = [];
          }

          // Check for failure
          if (line.match(this.failure)) {
            rtn.success = false;
          }

          // Add output if required
          if (this.state == State.STDOUT) {
            rtn.stdout.push(line);
          } else if (this.state == State.STDERR) {
            rtn.stderr.push(line);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return rtn;
    }

    /** Yield lines from the raw source */
  }, {
    key: 'lines',
    value: regeneratorRuntime.mark(function lines(raw) {
      var lines, i, line;
      return regeneratorRuntime.wrap(function lines$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            lines = raw.split("\n");
            i = 0;

          case 2:
            if (!(i < lines.length)) {
              context$2$0.next = 10;
              break;
            }

            line = lines[i].trim();

            if (!line) {
              context$2$0.next = 7;
              break;
            }

            context$2$0.next = 7;
            return line;

          case 7:
            ++i;
            context$2$0.next = 2;
            break;

          case 10:
          case 'end':
            return context$2$0.stop();
        }
      }, lines, this);
    })
  }]);

  return Parser;
})();

exports.Parser = Parser;