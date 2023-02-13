describe("Loops - Parameterized", () => {
  it("single case");

  [true, false].forEach((val) => {
    it(`send request with payload value "${val}"`, () => {
      // tc-id: Param001
      // tc: send http request POST /user/register
      // tc: payload must have new=true or new=false
      // tc: response should be status = 200
      // tc: verify new user is created
    });
  });

const numbers = [1,2,3];
for (var i = 0; i < numbers.length; i++) {
  it(`verify for loop ${i}`, () => {
    // tc-id: for-loop
    // tc: verify it works
    console.log(i);
  });
}
});