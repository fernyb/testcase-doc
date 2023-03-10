import path from "path";
import _ from "lodash";
import assert from "assert";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { getTestCases, getTestCasesFromPattern } from "../src/steps.js";

describe("TestCase Doc", () => {
  it("get test cases from file", async () => {
    const fixtureFile = path.posix.join(path.resolve(__dirname), "..", "fixtures", "basic.ts");
    const results = await getTestCases(fixtureFile);
    assert.equal(results.length > 0, true);
  });

  it("can extract test cases from multiple files", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "*.ts");
    const excludePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Exceptions", "*.ts");
    const results = await getTestCasesFromPattern([filePattern, `!${excludePattern}`]);
    assert.equal(results.length > 0, true);
  });

  it("can have inline comments within code", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "*.ts");
    const excludePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Exceptions", "*.ts");
    const results = await getTestCasesFromPattern([filePattern, `!${excludePattern}`]);
    const tc = results.find((r) => r.suite === "API inline");

    assert.equal(tc.file, 'fixtures/featureA/Monday/API/api.ts');
    assert.equal(tc.id, 'TC999');
    assert.equal(tc.description, 'POST');
    assert.equal(tc.name, 'POST /add');
    assert.equal(tc.suite, 'API inline');
    assert.equal(tc.steps.length === 3, true);
    assert.equal(tc.steps[0], 'Add a new item to collection');
    assert.equal(tc.steps[1], 'verify new item has been added');
    assert.equal(tc.steps[2], 'Step name, will match inline with code');
  });

  it("can have a description or default to the parent", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "*.ts");
    const excludePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Exceptions", "*.ts");
    const results = await getTestCasesFromPattern([filePattern, `!${excludePattern}`]);
    const tc = results.find((r) => r.id === "TC998");

    assert.equal(tc.file, "fixtures/featureA/Monday/API/api.ts");
    assert.equal(tc.id, "TC998");
    assert.equal(tc.description, "POST /add/vehicle?id=100 with payload");
    assert.equal(tc.name, "POST /add/vehicle");
    assert.equal(tc.suite, null);
    assert.equal(tc.steps.length === 3, true);
    assert.equal(tc.steps[0], 'Make request to / and get first element id');
    assert.equal(tc.steps[1], 'Add new vehicle to element id');
    assert.equal(tc.steps[2], 'verify new vehicle was added');
  });

  it("authentication login", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "*.ts");
    const excludePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Exceptions", "*.ts");
    const results = await getTestCasesFromPattern([filePattern, `!${excludePattern}`]);
    const tc = results.find((r) => r.description === "Login");

    assert.equal(tc.file, "fixtures/featureA/Wednesday/e2e/login.ts");
    assert.equal(tc.id, null);
    assert.equal(tc.description, "Login");
    assert.equal(tc.name, "user can log in");
    assert.equal(tc.suite, null);
    assert.equal(tc.steps.length === 8, true);
    assert.equal(tc.steps[0], 'click username field');
    assert.equal(tc.steps[1], 'enter username');
    assert.equal(tc.steps[2], 'press tab button');
    assert.equal(tc.steps[3], 'click password field');
    assert.equal(tc.steps[4], 'enter user password');
    assert.equal(tc.steps[5], 'click submit button');
    assert.equal(tc.steps[6], 'page should redirect to user profile');
    assert.equal(tc.steps[7], 'verify page is user profile');
  });

  it("does not return test cases outside of it()", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "{Saturday,Sunday}", "*.ts");
    const results = await getTestCasesFromPattern(filePattern);

    assert.equal(results[0].steps.length, 1);
    assert.equal(results[1].steps.length, 4);
    assert.equal(results[2].steps.length, 2);
  });

  it("can pick up it.skip testcases", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "{Saturday,Sunday}", "*.ts");
    const results = await getTestCasesFromPattern(filePattern);
    const tc = results.find((r) => r.skipped === true && r.name === "send email");

    assert.equal(tc.file, 'fixtures/featureB/Saturday/login.ts');
    assert.equal(tc.skipped, true);
    assert.equal(tc.id, null);
    assert.equal(tc.description, 'API Login');
    assert.equal(tc.name, 'send email');
    assert.equal(tc.suite, null);
    assert.equal(tc.steps[0], 'make request to POST /send-email');
    assert.equal(tc.steps[1], 'verify email account that email was received');
    assert.equal(tc.steps.length, 2);
  });

  it("when it() has different funcs", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "integration", "**", "*.ts");
    const excludePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Exceptions", "*.ts");
    const results = await getTestCasesFromPattern([filePattern, `!${excludePattern}`]);
    const tcs = results.filter((r) => r.file === "fixtures/featureA/Wednesday/integration/integrate.ts");

    assert.equal(tcs.length, 3);

    let tc = tcs.find((t) => t.name === "verify UI table sorting works");
    assert.equal(tc.file, "fixtures/featureA/Wednesday/integration/integrate.ts");
    assert.equal(tc.skipped, true);
    assert.equal(tc.id, null);
    assert.equal(tc.description, "Integration test");
    assert.equal(tc.name, "verify UI table sorting works");
    assert.equal(tc.suite, null);
    assert.equal(tc.steps.length, 0);

    tc = tcs.find((t) => t.name === "verify modal UI");
    assert.equal(tc.file, "fixtures/featureA/Wednesday/integration/integrate.ts");
    assert.equal(tc.skipped, false);
    assert.equal(tc.id, null);
    assert.equal(tc.description, "verify with named function");
    assert.equal(tc.name, "verify modal UI");
    assert.equal(tc.suite, null);
    assert.equal(tc.steps.length, 5);
    assert.equal(tc.steps[0], "verify first name");
    assert.equal(tc.steps[1], "verify last name");
    assert.equal(tc.steps[2], "verify status is pending");
    assert.equal(tc.steps[3], "click close button");
    assert.equal(tc.steps[4], "verify modal is no longer visible");
  });

  it("throws a SyntaxError for unsupported test", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Exceptions", "**", "*.ts");

    try {
      await getTestCasesFromPattern(filePattern);
      assert.equal(false, true, "Failed to throw exception");
    } catch(e) {
      assert.equal(e.name, "SyntaxError");
      assert.equal(e.message != "", true);
    }
  });

  it("when describe.skip all testcases become skip", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Saturday", "skipDescribe.ts");
    const results = await getTestCasesFromPattern(filePattern);
    const tcs = results.filter((r) => r.file === "fixtures/featureB/Saturday/skipDescribe.ts");
    assert.equal(tcs.length, 2);

    const actualTCs = tcs.filter((t) => t.description === "Skip API Login");
    assert(actualTCs.length, 2, "Expected to have 2 testcases with name description");

    const skippedTCs = tcs.filter((t) => t.skipped);
    assert.equal(skippedTCs.length, 2, "Expected testcases to be skipped");
  });

  it("when context.skip all testcases become skip", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Saturday", "skipContext.ts");
    const results = await getTestCasesFromPattern(filePattern);
    const tcs = results.filter((r) => r.file === "fixtures/featureB/Saturday/skipContext.ts");

    const nonskippedTCs = tcs.filter((t) => t.skipped === false);
    assert.equal(nonskippedTCs.length, 1, "Expected one testcase to not be skipped");

    const skippedTCs = tcs.filter((t) => t.skipped);
    assert.equal(skippedTCs.length, 2, "Expected testcases to be skipped");
    
    const tc = skippedTCs[1];
    assert.equal(tc.file, 'fixtures/featureB/Saturday/skipContext.ts');
    assert.equal(tc.skipped, true);
    assert.equal(tc.id, null);
    assert.equal(tc.description, 'Skip Context API');
    assert.equal(tc.name, 'send email');
    assert.equal(tc.suite, null);
    assert.equal(tc.steps[0], 'make request to POST /send-email to skip');
    assert.equal(tc.steps[1], 'verify email account that email was received to skip');
    assert.equal(tc.steps.length, 2);
  });

  it("when it.only", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Saturday", "*.ts");
    const results = await getTestCasesFromPattern(filePattern);
    const tcs = results.filter((r) => r.file === "fixtures/featureB/Saturday/onlyDescribe.ts");
    const itTcs = tcs.filter((t) => t.description === "Only Describe");

    // when there is an it.only should all other tests be considered skipped?
    // I think the answer is yes, for now I will ignore...

    assert.equal(itTcs.length, 2);

    const skippedTCs = itTcs.filter((t) => t.skipped);
    assert.equal(skippedTCs.length, 0);
  });

  it("when describe.only", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Saturday", "*.ts");
    const results = await getTestCasesFromPattern(filePattern);
    const tcs = results.filter((r) => r.file === "fixtures/featureB/Saturday/onlyDescribe.ts");
    const itTcs = tcs.filter((t) => t.name === "describe.only should be picked up");

    assert.equal(itTcs.length, 1);

    const tc = itTcs[0];

    assert.equal(tc.file, 'fixtures/featureB/Saturday/onlyDescribe.ts');
    assert.equal(tc.skipped, false);
    assert.equal(tc.id, null);
    assert.equal(tc.description, 'Describe.only');
    assert.equal(tc.name, 'describe.only should be picked up');
    assert.equal(tc.suite, null);
    assert.equal(tc.steps[0], 'describe.only should be the description by default');
    assert.equal(tc.steps[1], 'verify description');
  });

  it("Parameterized", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Repeat", "*.ts");
    const results = await getTestCasesFromPattern(filePattern);
    const tcs = results.filter((r) => r.file === "fixtures/featureB/Repeat/loops.ts");
    
    assert.equal(tcs.length, 3);
    let tc = tcs.find((t) => t.id === "Param001");

    assert.equal(tc.file, "fixtures/featureB/Repeat/loops.ts");
    assert.equal(tc.skipped, false);
    assert.equal(tc.id, "Param001");
    assert.equal(tc.description, "Loops - Parameterized");
    assert.equal(tc.name, "send request with payload value \"${val}\"", "Test name");
    assert.equal(tc.suite, null);
    assert.equal(tc.steps[0], 'send http request POST /user/register');
    assert.equal(tc.steps[1], 'payload must have new=true or new=false');
    assert.equal(tc.steps[2], 'response should be status = 200');
    assert.equal(tc.steps[3], 'verify new user is created');
    assert.equal(tc.steps.length, 4);

    // forloop
    tc = tcs.find((t) => t.id === "for-loop");
    assert.equal(tc.file, "fixtures/featureB/Repeat/loops.ts");
    assert.equal(tc.skipped, false);
    assert.equal(tc.id, "for-loop");
    assert.equal(tc.description, "Loops - Parameterized");
    assert.equal(tc.name, "verify for loop ${i}", "Test name");
    assert.equal(tc.suite, null);
    assert.equal(tc.steps[0], 'verify it works');
    assert.equal(tc.steps.length, 1);
  });

  it("verify test case categories property", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "*.ts");
    const excludePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Exceptions", "*.ts");
    const results = await getTestCasesFromPattern([filePattern, `!${excludePattern}`]);

    results.forEach((r) => {
      assert.equal(Array.isArray(r.categories), true);
    });

    const tcs = results.filter((r) => r.file === "fixtures/featureB/Saturday/login.ts" && r.categories.length === 3);
    assert.equal(tcs.length, 2, "Expected two test case having 3 categories");

    const [tc] = tcs;
    assert.equal(tc.categories[0], "featureB");
    assert.equal(tc.categories[1], "login");
    assert.equal(tc.categories[2], "api");
    assert.equal(tc.categories.length, 3);
  });

  it("verify test case expected property", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "*.ts");
    const excludePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Exceptions", "*.ts");
    const results = await getTestCasesFromPattern([filePattern, `!${excludePattern}`]);

    results.forEach((r) => {
      assert.equal(r.hasOwnProperty("expected"), true, `Expected property "expected" on ${r.file}`);
    });

    let tc = results.find((r) => r.file === "fixtures/featureB/Saturday/login.ts" && r.name === "can login via API on saturdays");
    assert.ok(tc.expected, "Expected not to be empty string"); 
    assert.equal(tc.expected, "user receives login header token");

    tc = results.find((r) => r.file === "fixtures/featureB/Saturday/login.ts" && r.name === "send email");
    assert.ok(tc.expected, "Expected not to be empty string");
    assert.equal(tc.expected, "email should be sent\nemail should be received");

    tc = results.find((r) => r.file === "fixtures/featureB/Saturday/login.ts" && r.name === "can register");
    assert.equal(tc.expected, "", "Expected to be empty string");
  });
});