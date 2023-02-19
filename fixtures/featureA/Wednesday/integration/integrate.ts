function verifyModalFunc() {
  console.log("verify modal...");
}


describe("Integration test", () => {
  it("verify UI table sorting works");
  it("verify clicking row opens modal", () => {
    // tc: click row having name 'Terry'
    // tc: modal should open
    // tc: verify modal has the name 'Terry Kennedy'
    // tc-category: featureA
  });

  it("verify modal UI", function verifyModalUI() {
    // tc-description: verify with named function
    // tc: verify first name
    // tc: verify last name
    // tc: verify status is pending
    // tc: click close button
    // tc: verify modal is no longer visible
    // tc-category: featureA
  });
});