import fs from 'fs';
import path from 'path';
import {Parser, BlockType} from './parser';

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

export function test_compile_failed(test) {
  var p = new Parser();
  p.parse(failed_compile_fixture());
  test.ok(p.filter(BlockType.ERROR).length == 1);
  test.ok(p.filter(BlockType.EXIT).length == 1);
  test.done();
}

export function test_something_failed(test) {
  var p = new Parser();
  p.parse(failed_fixture());
  test.ok(p.filter(BlockType.ERROR).length == 0);
  test.ok(p.filter(BlockType.EXIT).length == 1);
  test.done();
}

export function test_parse_success_input(test) {
  var p = new Parser();
  p.parse(success_fixture());
  test.ok(p.filter(BlockType.DEBUG).length > 0);
  test.ok(p.filter(BlockType.ERROR).length == 0);
  test.ok(p.filter(BlockType.EXIT).length == 0);
  test.done();
}
