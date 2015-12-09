import {Parser, BlockType} from './parser';
import colors from 'colors';

/** High level unity output handler */
export class UnityOutput {

  /** Create a new instance and parse that output */
  constructor(command, raw) {
    this.command = command;
    this.content = new Parser();
    this.content.parse(raw);
    this.success = this.content.filter(BlockType.EXIT) == 0;
  }

  /** Print errors */
  errors(patterns) {
    var records = this.content.filter(BlockType.ERROR);
    for (var i = 0; i < records.length; ++i) {
      var record = records[i];
      for (var j = 0; j < record.lines.length; ++j) {
        console.log(colors.red(record.lines[j]));
      }
    }
    var records = this.content.filter(BlockType.EXIT);
    for (var i = 0; i < records.length; ++i) {
      var record = records[i];
      for (var j = 0; j < record.lines.length; ++j) {
        console.log(colors.red(record.lines[j]));
      }
    }
  }

  /**
   * Debugging helper
   * For each pattern and color pairs in the form: { pattern: /.../, color: 'green' }
   * If the non-debug info of a debug line matches pattern, log it with color
   * @param patterns An array of {pattern: //, color: ''}
   */
  debug(patterns) {

    // Process debug output
    var records = this.content.filter(BlockType.DEBUG);
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
          }
          else if (patterns[j].context) {
            for (var k = 1; (k < record.lines.length) && (k < (patterns[j].context + 1)); ++k) {
              this.emit(record, record.lines[k], patterns[j].color);
            }
          }
          break;
        }
      }
    }
  }

  /** Print a block in a color, or normally */
  emit(block, value, color) {
    var output = `${color ? value[color] : value}`;
    console.log(output);
  }
}
