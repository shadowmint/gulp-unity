using System.Collections.Generic;
using System;

/// Basic genric test type
public class TestSuite {

  private List<Test> items = new List<Test>();

  /// Total test count run
  public int total = 0;

  /// Passing tests
  public List<Test> passed = new List<Test>();

  /// Failing tests
  public List<Test> failed = new List<Test>();

  /// Register self with runner
  public TestSuite() {
    foreach (var method in this.GetType().GetMethods())
    {
      var name = method.Name;
      if (name.StartsWith("test_")) {
        this.items.Add(new Test(method.Name, method, this));
      }
    }
  }

  /// Run this test suite
  public bool Run() {
    for (var i = 0; i < this.items.Count; ++i) {
      this.total += 1;
      var t = this.items[i];
      if (t.Run()) {
        this.passed.Add(t);
      }
      else {
        this.failed.Add(t);
      }
    }
    return this.failed.Count == 0;
  }

  /// Assert something is true in a test
  public void Assert(bool value) {
    if (!value) {
      throw new Exception("Test failed");
    }
  }

  /// Assert something is true in a test
  public void Assert(bool value, string msg) {
    if (!value) {
      throw new Exception(string.Format("Test failed: {}", msg));
    }
  }

  /// Assert the current block of code is never reached
  public void Unreachable() {
    throw new Exception("Test failed: Entered unreachable block");
  }

  /// Assert the current block of code is never reached
  public void Unreachable(string msg) {
    throw new Exception(string.Format("Test failed: {}", msg));
  }
}
