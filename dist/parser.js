'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Parser = exports.BlockPatterns = exports.BlockType = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Types of blocks */
var BlockType = exports.BlockType = {
  UNKNOWN: 'UNKNOWN',
  DEBUG: 'DEBUG',
  ERROR: 'ERROR',
  EXIT: 'EXIT'
};

/** Constant patterns for matching with */
var BlockPatterns = exports.BlockPatterns = {
  DEBUG: /^UnityEngine.DebugLogHandler:Internal_Log.*$/,
  ERROR: /^-----CompilerOutput:-stdout--exitcode: 1.*/,
  EXIT: /^Aborting batchmode due to failure:.*/,
  FILENAME: /^\(Filename: (.*) Line: (.*)\)/

  /** Unity output parser */
};
var Parser = exports.Parser = function () {
  function Parser() {
    (0, _classCallCheck3.default)(this, Parser);

    this.blocks = [];
  }

  /**
   * Parse unity output
   * @return Itself, so you can .parse().filter(...)
   */


  (0, _createClass3.default)(Parser, [{
    key: 'parse',
    value: function parse(raw) {
      this.parse_blocks(raw);
      this.parse_merge_debug();
      this.parse_tag_blocks();
      return this;
    }

    /** Return a filtered list of blocks by type */

  }, {
    key: 'filter',
    value: function filter(type) {
      return this.blocks.filter(function (x) {
        return x.type == type;
      });
    }

    /** Tag blocks based on active patterns */

  }, {
    key: 'parse_tag_blocks',
    value: function parse_tag_blocks() {
      for (var i = 0; i < this.blocks.length; ++i) {
        for (var key in BlockPatterns) {
          if (this.blocks[i].matches(BlockPatterns[key])) {
            this.blocks[i].type = key;
          }
        }
      }
    }

    /**
     * Merge debug output
     *
     * A debug block looks like:
     *
     *    blah
     *    ...
     *    UnityEngine.DebugLogHandler:Internal_Log
     *    ...
     *
     *    Filename...
     *
     * So if a block is found, merge it with the following block and mark it's type.
     */

  }, {
    key: 'parse_merge_debug',
    value: function parse_merge_debug() {
      var merged = [];
      for (var i = 0; i < this.blocks.length; ++i) {
        if (this.blocks[i].matches(BlockPatterns.DEBUG)) {
          var offset = i + 1;
          if (offset < this.blocks.length) {
            this.blocks[i].merge(this.blocks[offset]);
            this.blocks[i].extract_debug_data();
            this.blocks[i].type = BlockType.DEBUG; // extract strips this already
          }
          merged.push(this.blocks[i]);
          i += 1; // Skip~
        } else {
          merged.push(this.blocks[i]);
        }
      }
      this.blocks = merged;
    }

    /** Split raw lines into blocks */

  }, {
    key: 'parse_blocks',
    value: function parse_blocks(raw) {
      var next = null;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(this.lines(raw)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var line = _step.value;

          if (next == null) {
            next = new Block();
          }
          if (!next.push(line)) {
            if (next.size()) {
              this.blocks.push(next);
            }
            next = null;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (next != null && next.size()) {
        this.blocks.push(next);
      }
    }

    /** Yield lines from the raw source */

  }, {
    key: 'lines',
    value: /*#__PURE__*/_regenerator2.default.mark(function lines(raw) {
      var lines, i, line;
      return _regenerator2.default.wrap(function lines$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              lines = raw.split("\n");
              i = 0;

            case 2:
              if (!(i < lines.length)) {
                _context.next = 9;
                break;
              }

              line = lines[i].trim();
              _context.next = 6;
              return line;

            case 6:
              ++i;
              _context.next = 2;
              break;

            case 9:
            case 'end':
              return _context.stop();
          }
        }
      }, lines, this);
    })

    /** Debug dump block content */

  }, {
    key: 'debug',
    value: function debug() {
      var counts = {};
      for (var key in BlockType) {
        counts[key] = 0;
      }
      for (var i = 0; i < this.blocks.length; ++i) {
        console.log(this.blocks[i].type + ': ' + this.blocks[i].lines[0]);
      }
      console.log(counts);
    }
  }]);
  return Parser;
}();

/** Some block of content */


var Block = function () {
  function Block() {
    (0, _classCallCheck3.default)(this, Block);

    this.lines = [];
    this.type = BlockType.UNKNOWN;
    this.filename = null;
    this.line = null;
    this.backtrace = [];
  }

  /**
   * Add a line to this block
   * @return false if we have completed a block
   */


  (0, _createClass3.default)(Block, [{
    key: 'push',
    value: function push(line) {
      if (line.trim() == '') {
        return false;
      }
      this.lines.push(line);
      return true;
    }

    /** Check if the block matches the pattern on any line? */

  }, {
    key: 'matches',
    value: function matches(pattern) {
      for (var i = 0; i < this.lines.length; ++i) {
        if (this.lines[i].match(pattern)) {
          return true;
        }
      }
      return false;
    }

    /** Add a block to this one */

  }, {
    key: 'merge',
    value: function merge(block) {
      for (var i = 0; i < block.lines.length; ++i) {
        this.lines.push(block.lines[i]);
      }
    }

    /** The size of this block */

  }, {
    key: 'size',
    value: function size() {
      return this.lines.length;
    }

    /** Extract the filename and line number if possible */

  }, {
    key: 'extract_debug_data',
    value: function extract_debug_data() {
      var backtrace_mode = false;
      var filtered_lines = [];
      for (var i = 0; i < this.lines.length; ++i) {
        var matches = this.lines[i].match(BlockPatterns.FILENAME);
        if (matches) {
          this.filename = matches[1];
          this.line = matches[2];
        } else if (backtrace_mode || this.lines[i].match(BlockPatterns.DEBUG)) {
          backtrace_mode = true;
          this.backtrace.push(this.lines[i]);
        } else {
          filtered_lines.push(this.lines[i]);
        }
      }
      this.lines = filtered_lines;
    }
  }]);
  return Block;
}();