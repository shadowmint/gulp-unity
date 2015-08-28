var State = {
  NONE: 'NONE',
  STDOUT: 'STDOUT',
  STDERR: 'STDERR'
};

export class Parser {

  constructor() {

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
    this.debug_end = /\(Filename:.*/

    // Current state
    this.prev_state = null;
    this.state = State.NONE;
  }

  /** Parse unity output and collect stdout and stderr */
  parse(raw) {

    var token = [];
    var token_is_debug = false;
    var debug_has_started = false;
    var in_failure_block = 0;

    var rtn = {
      stdout: [],
      stderr: [],
      debug: [],
      success: true
    };

    for (var line of this.lines(raw)) {
      if (debug_has_started) {
        token.push(line);
      }

      // Next state, if any?
      if (line.match(this.stdout)) {
        this.state = State.STDOUT;
        continue;
      }
      else if (line.match(this.stderr)) {
        this.state = State.STDERR;
        continue;
      }
      else if (line.match(this.end)) {
        this.state = State.NONE;
      }
      else if (line.match(this.debug_start)) {
        this.state_prev = this.state;
        this.state = State.DEBUG;
        token_is_debug = true;
      }
      else if (line.match(this.debug_end)) {
        this.state = this.state_prev;
        this.state_prev = null;
        if (token_is_debug) {
          rtn.debug.push(token);
        }
        token = [];
      }
      else if (line.match(this.debug_output_start)) {
        debug_has_started = true;
        token = [];
      }

      // Check for failure
      if (line.match(this.failure)) {
        rtn.success = false;
        in_failure_block = 3;
      }

      // Add output if required
      if (this.state == State.STDOUT) {
        rtn.stdout.push(line);
      }
      else if ((this.state == State.STDERR) || (in_failure_block > 0)) {
        --in_failure_block;
        rtn.stderr.push(line);
      }
    }
    return rtn;
  }

  /** Yield lines from the raw source */
  *lines(raw) {
    var lines = raw.split("\n");
    for (var i = 0; i < lines.length; ++i) {
      var line = lines[i].trim();
      if (line) {
        yield line;
      }
    }
  }
}
