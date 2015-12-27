import cp from 'child_process';
import colors from 'colors';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import gutil from 'gulp-util';
import * as sutils from 'gulp-tools/lib/utils';
import {Plugin} from 'gulp-tools';
import {UnityOutput} from './unity';

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
    // Null for none
    this.option('method', null, (v) => { return true; });

    // Use the -quit option to exit after we're done
    // Only turn this off for odd modes like test runners
    this.option('quit', true, (v) => { return true; });

    /// Use the -nographics option to speed up runtime
    /// Only turn this on if there's a good reason, eg. lighting calc
    this.option('nographics', true, (v) => { return true; });

    // Pass additional command line arguments?
    this.option('color', true);

    // Additional command line arguments
    this.option('args', []);

    // Do something with debug output lines
    this.option('debug', false, (v) => {
      return (v === false) || (typeof(v) === 'function');
    });
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
    var proc = cp.spawn(UNITY_PATH, args);
    proc.on('exit', () => {

      // Read output and parse it
      var output = fs.readFileSync(temp).toString('utf-8');
      var command = UNITY_PATH + ' ' + args.join(' ');
      var data = new UnityOutput(command, output);
      if (data.success) {

        // Run debug handler, if any
        if (this.options.debug) {
          this.options.debug(data);
        }

        // Return raw output to gulp
        file.contents = new Buffer(JSON.stringify(output));
        callback(null, file);
      }

      // On failure, print errors and raise an error
      else {
        data.errors();
        callback(new gutil.PluginError(this.name, `Failed to invoke batch mode: ${data.command}`, {fileName: file.path}));
      }
    });
  }
}

var rtn = new UnityPlugin().handler();
export default rtn;
