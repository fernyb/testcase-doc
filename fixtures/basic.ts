// tc: Hello World

class Person {
  public age: number;

  constructor(opt: { age: number }) {
    this.age = opt.age;
  }

  canGamble(): Boolean {
    return this.age >= 21;
  }
}

describe("First Test", { tags: ["@SMOKE"] }, () => {
  it("numero uno", { tags: ["@SMOKE"] }, () => {
    // tc: step one setup
    // tc: do stuff
    // tc: the end
    //tc: the end
    //tc: the end
    // tc:  the end
    // tc-suite: First Test
  });
});

describe("Person", () => {
  it("1. can verify age", () => {
    const pagination = () => {
      console.log("Pagination Function");
      // tc: Pagination test case...
    };

    // tc: create a new person
    // tc: verify person is age 21
    // tc: verify person name is fern
    // tc: verify person is not hungry
    //tc: verify person is not hungry
    //  tc: verify person is not hungry
    // tc2: verify person is not hungry
    const person = new Person({ age: 21 });

    // tc: verify person can gamble
    person.canGamble()
  });

  it("2. can say hello", () => {
    // tc: test case for hello 2
    console.log("does it work?");
  });

  describe("Nested Describe", () => {
    beforeEach(() => {
      let hello = "hello world";
    });

    it("it test from The Nested Describe", () => {
      console.log("woah!");
    });

    describe("Double Nested", () => {
      it("double nested test name", () => {
        // tc-suite: double nested test suite name
        // tc: begin
        // tc: double nested test case name
        // tc: end
      });

      describe("Tripple Nested", () => {
        it("the thired test", () => {
          // tc-suite: Tripple
          // tc: create new user
          // tc: book a job
          // tc: Hello World
        });
      });
    });
  });
});