/** Types of blocks */
export var BlockType = {
  UNKNOWN: 'UNKNOWN',
  DEBUG: 'DEBUG',
  ERROR: 'ERROR',
  EXIT: 'EXIT'
};

/** Constant patterns for matching with */
export var BlockPatterns = {
  DEBUG: /^UnityEngine.DebugLogHandler:Internal_Log.*$/,
  ERROR: /^-----CompilerOutput:-stdout--exitcode: 1.*/,
  EXIT: /^Aborting batchmode due to failure:.*/,
  FILENAME: /^\(Filename: (.*) Line: (.*)\)/
}

/** Unity output parser */
export class Parser {

  constructor() {
    this.blocks = [];
  }

  /**
   * Parse unity output
   * @return Itself, so you can .parse().filter(...)
   */
  parse(raw) {
    this.parse_blocks(raw);
    this.parse_merge_debug();
    this.parse_tag_blocks();
    return this;
  }

  /** Return a filtered list of blocks by type */
  filter(type) {
    return this.blocks.filter((x) => { return x.type == type; });
  }

  /** Tag blocks based on active patterns */
  parse_tag_blocks() {
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
  parse_merge_debug() {
    var merged = [];
    for (var i = 0; i < this.blocks.length; ++i) {
      if (this.blocks[i].matches(BlockPatterns.DEBUG)) {
        var offset = i + 1;
        if (offset < this.blocks.length) {
          this.blocks[i].merge(this.blocks[offset]);
          this.blocks[i].extract_debug_data();
          this.blocks[i].type = BlockType.DEBUG;  // extract strips this already
        }
        merged.push(this.blocks[i]);
        i += 1; // Skip~
      }
      else {
        merged.push(this.blocks[i]);
      }
    }
    this.blocks = merged;
  }

  /** Split raw lines into blocks */
  parse_blocks(raw) {
    var next = null;
    for (var line of this.lines(raw)) {
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
    if ((next != null) && next.size()) {
      this.blocks.push(next);
    }
  }

  /** Yield lines from the raw source */
  *lines(raw) {
    var lines = raw.split("\n");
    for (var i = 0; i < lines.length; ++i) {
      var line = lines[i].trim();
      yield line;
    }
  }

  /** Debug dump block content */
  debug() {
    var counts = {};
    for (var key in BlockType) {
      counts[key] = 0;
    }
    for (var i = 0; i < this.blocks.length; ++i) {
      console.log(`${this.blocks[i].type}: ${this.blocks[i].lines[0]}`);
    }
    console.log(counts);
  }
}

/** Some block of content */
class Block {
  constructor() {
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
  push(line) {
    if (line.trim() == '') {
      return false;
    }
    this.lines.push(line);
    return true;
  }

  /** Check if the block matches the pattern on any line? */
  matches(pattern) {
    for (var i = 0; i < this.lines.length; ++i) {
      if (this.lines[i].match(pattern)) {
        return true;
      }
    }
    return false;
  }

  /** Add a block to this one */
  merge(block) {
    for (var i = 0; i < block.lines.length; ++i) {
      this.lines.push(block.lines[i]);
    }
  }

  /** The size of this block */
  size() {
    return this.lines.length;
  }

  /** Extract the filename and line number if possible */
  extract_debug_data() {
    var backtrace_mode = false;
    var filtered_lines = [];
    for (var i = 0; i < this.lines.length; ++i) {
      var matches = this.lines[i].match(BlockPatterns.FILENAME);
      if (matches) {
        this.filename = matches[1];
        this.line = matches[2];
      }
      else if (backtrace_mode || (this.lines[i].match(BlockPatterns.DEBUG))) {
        backtrace_mode = true;
        this.backtrace.push(this.lines[i]);
      }
      else {
        filtered_lines.push(this.lines[i]);
      }
    }
    this.lines = filtered_lines;
  }
}
