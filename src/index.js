import cp from 'child_process';
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
      'C:\\Program Files\\Unity\\Editor\\Unity.exe'
    ]);

    // The method to invoke on the projects.
    this.option('method', null, (v) => {
      return v != null;
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
    var args = ['-batchmode', '-quit', '-logFile', temp, '-projectPath', root, '-executeMethod', this.options.method]

    // Spawn a process to invoke unity
    var proc = cp.spawn(UNITY_PATH, args);
    proc.on('exit', () => {
      var output = fs.readFileSync(temp).toString('utf-8');
      var data = new Parser().parse(output);
      console.log(data);
      if (data.success) {
        file.contents = new Buffer(json.stringify(data.debug));
        callback(null, file);
      }
      else {
        for (var i = 0; i < data.stdout.length; ++i) { console.log(data.stdout[i]); }
        for (var i = 0; i < data.stderr.length; ++i) { console.log(data.stderr[i]); }
        callback(new gutil.PluginError(this.name, "Failed to invoke batch mode", {fileName: file.path}));
      }
    });
  }
}

export default new UnityPlugin().handler();
