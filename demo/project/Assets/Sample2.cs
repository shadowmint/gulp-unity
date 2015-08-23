using UnityEngine;

class Sample2 {
  public bool Foo() {
    return true;
  }
}

class Sample2Tests : TestSuite {
  public void test_sample() {
    var s = new Sample();
    Debug.Log("DEBUG: This is a some DEBUG message");
    Assert(s.Foo());
  }
}
