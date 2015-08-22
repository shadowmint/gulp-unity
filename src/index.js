import cp from 'child_process';
import fs from 'fs';
import gutil from 'gulp-util';
import * as sutils from 'gulp-tools/lib/utils';
import {Plugin} from 'gulp-tools';

class UnityPlugin extends Plugin {

  constructor() {
    super('gulp-unity');

    // The set of paths to try to find the unity executable
    this.option('paths', [
      'C:\\Program Files\\Unity\\Editor\\Unity.exe'
    ]);

    // The method to invoke on the projects.
    this.option('method', null);
  }

  handle_string(file, value, callback) {

    // Look for a valid executable
    var UNITY_PATH = null;
    for (var i = 0; i < this.options.paths) {
      console.log("trying: " + this.options.paths[i]);
      if (fs.existsSync(this.options.paths[i])) {
        UNITY_PATH = this.options.paths[i];
        break;
      }
    }

    // Fail if no valid unity path
    if (!UNITY_PATH) {
      callback(new gutil.PluginError(self.name, "Unable to find any version of Unity. Is it installed?", {fileName: file.path}));
      return;
    }

    // Configure settings
    var root = "";
    var method = "";
    var args = ['-batchmode', '-quit', '-logFile', '-projectPath', root, '-executeMethod', this.options.method]

    // Spawn a process to invoke unity
    var proc = cp.spawn(UNITY_PATH, args);

    // Read process output and return as an object
    var failed = false;
    var self = this;
    sutils.read_from_stream(proc.stderr, 'utf8', function(value) {
      if (value) {
        failed = true;
        callback(new gutil.PluginError(self.name, value, {fileName: file.path}));
      }
    });
    sutils.read_from_stream(proc.stdout, 'utf8', function(value) {
      if (value && (!failed)) {
        file.path = gutil.replaceExtension(file.path, '.css');
        file.contents = new Buffer(value);
        callback(null, file);
      }
    });
  }
}

export default new UnityPlugin().handler();
