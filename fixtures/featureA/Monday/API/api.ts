describe("API Endpoints", { tags: "@SMOKE" }, () => {
  context("GET", () => {
    it("GET /endpoint1", () => {
      // tc-suite: API v2
      // tc: GET collections for endpoint /endpoint1
      // tc: verify response has the following items
      // tc: verify 10 items in response
    });
  });

  context("POST", () => {
    it("POST /add", () => {
      // tc-id: TC999
      // tc: Add a new item to collection
      // tc: verify new item has been added
      //tc: Step name
      console.log("Hello World");// tc: Step name, will match inline with code
      console.log("Hello World");//tc: Step name, will not match
      // tc-suite: API inline
    });

    it("POST /add/vehicle", () => {
      // tc-id: TC998
      // tc: Make request to / and get first element id
      // tc: Add new vehicle to element id
      // tc: verify new vehicle was added
      // tc-description: POST /add/vehicle?id=100 with payload
    });
  });
});