describe("API Login", () => {
  it("can login via API on saturdays", () => {
    // tc: make a POST /login request with payload containing username, password
    // tc-category: featureB
    // tc-category: login
    // tc-category: api
    // tc-expected: user receives login header token
  });

  // tc: should not be picked up 1
  // tc: should not be picked up 2
  // tc: should not be picked up 3

  it("can register", () => {
    // tc-description: user can register for site using API
    // tc: make reqeust to POST /register
    // tc: verify user exists by making reqeust to GET /find
    // tc: make request to GET /find?userid=999
    // tc: verify response for GET /find?userid=999
    // tc-category: featureB
    // tc-category: login
    // tc-category: api
  })

  it.skip("send email", () => {
    // tc: make request to POST /send-email
    // tc: verify email account that email was received
    // tc-category: featureB
    // tc-category: login
    // tc-expected: email should be sent
    // tc-expected: email should be received
  });
});