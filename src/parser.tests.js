import fs from 'fs';
import path from 'path';
import {Parser} from './parser';

function failed_fixture() {
  return fs.readFileSync(path.join(__dirname, '..', 'src', 'sample.failed.txt'))
    .toString('utf-8');
}

function success_fixture() {
  return fs.readFileSync(path.join(__dirname, '..', 'src', 'sample.success.txt'))
    .toString('utf-8');
}

export function test_parse_failing_input(test) {
  var p = new Parser();
  var output = p.parse(failed_fixture());
  test.ok(!output.success);
  test.done();
}

export function test_parse_success_input(test) {
  var p = new Parser();
  var output = p.parse(success_fixture());
  test.ok(output.success);
  test.done();
}
