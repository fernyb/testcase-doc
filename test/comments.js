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
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Saturday", "*.ts");
    const results = await getTestCasesFromPattern(filePattern);
    const tcs = results.filter((r) => r.file === "fixtures/featureB/Saturday/skipDescribe.ts");

    assert.equal(tcs.length, 2);

    const skippedTCs = tcs.filter((t) => t.skipped);
    assert.equal(skippedTCs.length, 2);
  });

  it("when it.only", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "**", "Saturday", "*.ts");
    const results = await getTestCasesFromPattern(filePattern);
    const tcs = results.filter((r) => r.file === "fixtures/featureB/Saturday/onlyDescribe.ts");

    // when there is an it.only should all other tests be considered skipped?
    // I think the answer is yes, for now I will ignore...

    assert.equal(tcs.length, 2);

    const skippedTCs = tcs.filter((t) => t.skipped);
    assert.equal(skippedTCs.length, 0);
  });
});