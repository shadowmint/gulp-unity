import fs from 'fs';
import path from 'path';
import {UnityOutput} from './unity';

function failed_fixture() {
  return fs.readFileSync(path.join(__dirname, '..', 'src', 'sample.failed.txt'))
    .toString('utf-8');
}

function failed_compile_fixture() {
  return fs.readFileSync(path.join(__dirname, '..', 'src', 'sample.error.txt'))
    .toString('utf-8');
}

function success_fixture() {
  return fs.readFileSync(path.join(__dirname, '..', 'src', 'sample.success.txt'))
    .toString('utf-8');
}

export function test_success(test) {
  var instance = new UnityOutput('', success_fixture());
  test.ok(instance.success);
  test.done();
}

export function test_errors(test) {
  test.ok(!new UnityOutput('', failed_compile_fixture()).success);
  test.ok(!new UnityOutput('', failed_fixture()).success);
  test.done();
}

export function test_debug(test) {
  var instance = new UnityOutput('', success_fixture());
  instance.debug([
    { pattern: /\*\* Test.*/, color: 'green' },
    { pattern: /\!\! Test.*/, color: 'red' },
    { pattern: /\*.*/ },
    { pattern: /^DEBUG:.*/, color: 'yellow', context: 3 },
    { pattern: /System.Exception/, color: 'red', context: true },
  ]);
  test.ok(true);
  test.done();
}
