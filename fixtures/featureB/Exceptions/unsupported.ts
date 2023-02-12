function verifyModalFunc() {
  console.log("verify modal...");
}

describe("Unspported test", () => {
  it("verify modal with func", verifyModalFunc);
  it("verify modal with func smoke", { tags: "@SMOKE" }, verifyModalFunc);
});
