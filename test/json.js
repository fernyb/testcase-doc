import fs from "fs";
import report from "../src/report.js";

import path from "path";
import _ from "lodash";
import assert from "assert";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { getTestCasesFromPattern } from "../src/steps.js";

const JSON_FILE = `${__dirname}/tmp/test.json`;

function rmFile(filepath) {
  return new Promise((resolve) => {
    if (fs.existsSync(filepath)) {
      fs.unlink(filepath, () => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}

function readJSONFile() {
  return JSON.parse(fs.readFileSync(JSON_FILE).toString());
}

describe("Write to JSON", () => {
  beforeEach(async () => {
    await rmFile(JSON_FILE);
  });

  afterEach(async () => {
    await rmFile(JSON_FILE);
  })

  it("write to file", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "featureA", "Monday", "API", "api.ts");
    const testcases = await getTestCasesFromPattern(filePattern);

    const res = await report.writeToJSON({ filename: JSON_FILE, testcases });
    const json = readJSONFile();

    const headers = _.keys(json[0]);
    assert.equal(headers.length, 8);
    headers.forEach(header => {
      const headerIsIncluded = ["id", "file", "steps", "description", "name", "suite", "file", "skipped", "categories"].includes(header);
      assert.equal(headerIsIncluded, true, `Expected header to be one of: file, steps, description, name, suite, file, skipped, categories but was: ${header}`);
    });

    assert.equal(json[1].file, "fixtures/featureA/Monday/API/api.ts");
    assert.equal(json[1].skipped, false);
    assert.equal(json[1].id, "TC999");
    assert.equal(json[1].description, "POST");
    assert.equal(json[1].name, "POST /add");
    assert.equal(json[1].suite, "API inline");
    assert.equal(json[1].steps.length, 3);
    assert.equal(json[1].steps[0], "Add a new item to collection");
    assert.equal(json[1].steps[1], "verify new item has been added");
    assert.equal(json[1].steps[2], "Step name, will match inline with code");
    assert.equal(json[1].categories.length, 2);
    assert.equal(json[1].categories[0], "API");
    assert.equal(json[1].categories[1], "featureA");
  });

  it("write to file - error", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "featureA", "Monday", "API", "api.ts");
    const testcases = await getTestCasesFromPattern(filePattern);

    const writeFile = fs.writeFile;
    fs.writeFile = (filename, content, callback) => {
      assert.equal(filename, JSON_FILE);
      assert.ok(content);
      callback(new Error("fs.writeFile failed"));
    }

    try {
      const res = await report.writeToJSON({ filename: JSON_FILE, testcases });
      assert.fail("Expected fs.writeFile to throw an error");
    } catch (err) {
      assert.equal(err.message, "fs.writeFile failed");
    }
    finally {
      fs.writeFile = writeFile;
    }
  });
});