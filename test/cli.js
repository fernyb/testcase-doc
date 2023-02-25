import report from "../src/report.js";

import path from "path";
import _ from "lodash";
import assert from "assert";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { getTestCasesFromPattern } from "../src/steps.js";

describe("Write to CLI", () => {
  it("write to CLI", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "featureA", "Monday", "API", "api.ts");
    const testcases = await getTestCasesFromPattern(filePattern);


    const _log = console.log;
    const messages = [];
    console.log = (message) => {
      messages.push(message);
    };

    const res = await report.writeToCLI({ testcases });
    console.log = _log;

    const expectedOut = `
[90m┌─────┬──────────────────────────────────────────────────┬──────────────────────────────┬──────────────────────────────┬──────────────────────────────┬──────────┬───────────────┬──────────────────────────────────────────────────┐[39m
[90m│[39m[31m id  [39m[90m│[39m[31m steps                                            [39m[90m│[39m[31m expected                     [39m[90m│[39m[31m description                  [39m[90m│[39m[31m name                         [39m[90m│[39m[31m suite    [39m[90m│[39m[31m categories    [39m[90m│[39m[31m file                                             [39m[90m│[39m
[90m├─────┼──────────────────────────────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────┼───────────────┼──────────────────────────────────────────────────┤[39m
[90m│[39m     [90m│[39m GET collections for endpoint /endpoint1          [90m│[39m 10 items in response         [90m│[39m GET                          [90m│[39m GET /endpoint1               [90m│[39m API v2   [90m│[39m API           [90m│[39m fixtures/featureA/Monday/API/api.ts              [90m│[39m
[90m│[39m     [90m│[39m verify response has the following items          [90m│[39m each item has id, name, and… [90m│[39m                              [90m│[39m                              [90m│[39m          [90m│[39m featureA      [90m│[39m                                                  [90m│[39m
[90m│[39m     [90m│[39m verify 10 items in response                      [90m│[39m                              [90m│[39m                              [90m│[39m                              [90m│[39m          [90m│[39m               [90m│[39m                                                  [90m│[39m
[90m├─────┼──────────────────────────────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────┼───────────────┼──────────────────────────────────────────────────┤[39m
[90m│[39m TC… [90m│[39m Add a new item to collection                     [90m│[39m                              [90m│[39m POST                         [90m│[39m POST /add                    [90m│[39m API inl… [90m│[39m API           [90m│[39m fixtures/featureA/Monday/API/api.ts              [90m│[39m
[90m│[39m     [90m│[39m verify new item has been added                   [90m│[39m                              [90m│[39m                              [90m│[39m                              [90m│[39m          [90m│[39m featureA      [90m│[39m                                                  [90m│[39m
[90m│[39m     [90m│[39m Step name, will match inline with code           [90m│[39m                              [90m│[39m                              [90m│[39m                              [90m│[39m          [90m│[39m               [90m│[39m                                                  [90m│[39m
[90m├─────┼──────────────────────────────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────┼───────────────┼──────────────────────────────────────────────────┤[39m
[90m│[39m TC… [90m│[39m Make request to / and get first element id       [90m│[39m For new vehicle to be added  [90m│[39m POST /add/vehicle?id=100 wi… [90m│[39m POST /add/vehicle            [90m│[39m          [90m│[39m featureA      [90m│[39m fixtures/featureA/Monday/API/api.ts              [90m│[39m
[90m│[39m     [90m│[39m Add new vehicle to element id                    [90m│[39m                              [90m│[39m                              [90m│[39m                              [90m│[39m          [90m│[39m API           [90m│[39m                                                  [90m│[39m
[90m│[39m     [90m│[39m verify new vehicle was added                     [90m│[39m                              [90m│[39m                              [90m│[39m                              [90m│[39m          [90m│[39m               [90m│[39m                                                  [90m│[39m
[90m└─────┴──────────────────────────────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────┴───────────────┴──────────────────────────────────────────────────┘[39m
    `.trim();

    assert.equal(messages[0], expectedOut);
    assert.equal(res.testcases_count, 3);
    assert.equal(res.filename, null);
  });
});
