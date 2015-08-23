import cp from 'child_process';
import colors from 'colors';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import gutil from 'gulp-util';
import * as sutils from 'gulp-tools/lib/utils';
import {Plugin} from 'gulp-tools';
import {Parser} from './parser';

class UnityPlugin extends Plugin {

  constructor() { super('gulp-unity'); }

  configure(options) {
    this.options = options ? options : {};

    // The set of paths to try to find the unity executable
    this.option('paths', [
      'C:\\Program Files\\Unity\\Editor\\Unity.exe',
      '/Applications/Unity/Unity.app/Contents/MacOS/Unity'
    ]);

    // The method to invoke on the projects.
    this.option('method', null, (v) => {
      return v != null;
    });

    // Use coloured output?
    this.option('color', true);

    // Do something with debug output lines
    this.option('debug', false);
  }

  handle_string(file, value, callback) {

    // Look for a valid executable
    var UNITY_PATH = null;
    for (var i = 0; i < this.options.paths.length; ++i) {
      if (fs.existsSync(this.options.paths[i])) {
        UNITY_PATH = this.options.paths[i];
        break;
      }
    }

    // Fail if no valid unity path
    if (!UNITY_PATH) {
      callback(new gutil.PluginError(this.name, "Unable to find any version of Unity. Is it installed?", {fileName: file.path}));
      return;
    }

    // Generate a temporary output file
    var temp = tmp.dirSync();
    temp = path.join(temp.name, 'output.txt');

    // Configure settings
    var root = file.base;
    var args = ['-batchmode', '-quit', '-logFile', temp, '-projectPath', root, '-executeMethod', this.options.method]

    // Spawn a process to invoke unity
    var proc = cp.spawn(UNITY_PATH, args);
    proc.on('exit', () => {
      var output = fs.readFileSync(temp).toString('utf-8');
      var data = new Parser().parse(output);
      if (data.success) {
        if (this.options.debug) {
          for (var i = 0; i < data.debug.length; ++i) {
            this.options.debug(data.debug[i]);
          }
        }
        file.contents = new Buffer(JSON.stringify(data.debug));
        callback(null, file);
      }
      else {
        for (var i = 0; i < data.stdout.length; ++i) {
          console.log(this.options.color ? data.stdout[i].yellow : data.stdout[i]);
        }
        for (var i = 0; i < data.stderr.length; ++i) {
          console.log(this.options.color ? data.stderr[i].red : data.stderr[i]);
        }
        callback(new gutil.PluginError(this.name, "Failed to invoke batch mode", {fileName: file.path}));
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
  static debug(record, patterns) {
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
            for (var k = i + 1; (k < record.length) && (k < (i + patterns[j].context + 1)); ++k) {
              console.log(patterns[j].color ? record[k][patterns[j].color] : record[k]);
            }
          }
          break;
        }
      }
    }
  }
}

var rtn = new UnityPlugin().handler();
rtn.debug = UnityPlugin.debug;

export default rtn;
