class Sample {
  public bool Foo() {
    return true;
  }
}

class SampleTests : TestSuite {
  public void test_sample() {
    var s = new Sample();
    Assert(s.Foo());
  }
}
