describe("Only Describe", () => {

  it("click submit", () => {
    // tc: click submit button
    // tc: verify new user is created
    // tc-category: featureB
  });

  it.only("click link", () => {
    // tc: verify clicking link opens modal
    // tc-category: featureB
  });
});

describe.only("Describe.only", () => {
  it("describe.only should be picked up", () => {
    // tc: describe.only should be the description by default
    // tc: verify description
    // tc-category: featureB
  });
});