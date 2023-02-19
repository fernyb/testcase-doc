describe("Skip API Login", () => {
  it("non skipped", () => {
    // tc: should not be skipped
    // tc-category: featureB
  });

  context.skip("Skip Context API", () => {
    it("skip context login", () => {
      // tc: skip context login step
      // tc-category: featureB
    });

    it("send email", () => {
      // tc: make request to POST /send-email to skip
      // tc: verify email account that email was received to skip
      // tc-category: featureB
    });
  });
});