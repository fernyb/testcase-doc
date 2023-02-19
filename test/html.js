import fs from "fs";
import report from "../src/report.js";

import path from "path";
import _ from "lodash";
import assert from "assert";
import jsdom from "jsdom";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { getTestCasesFromPattern } from "../src/steps.js";

const HTML_FILE = `${__dirname}/tmp/test.html`;

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

function readHTMLFile() {
  return fs.readFileSync(HTML_FILE).toString();
}

describe("Write to HTML", () => {
  beforeEach(async () => {
    await rmFile(HTML_FILE);
  });

  afterEach(async () => {
    await rmFile(HTML_FILE);
  })

  it("write to file", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "featureA", "Monday", "API", "api.ts");
    const testcases = await getTestCasesFromPattern(filePattern);

    const res = await report.writeToHTML({ filename: HTML_FILE, testcases });
    const html = readHTMLFile();

    const { document } = (new jsdom.JSDOM(html)).window;

    // verify header column names
    const th = document.querySelectorAll("table thead tr:last-child th");
    assert.equal(th.length, 8);
    assert.equal(th[0].textContent, "id");
    assert.equal(th[1].textContent, "steps");
    assert.equal(th[2].textContent, "expected");
    assert.equal(th[3].textContent, "description");
    assert.equal(th[4].textContent, "name");
    assert.equal(th[5].textContent, "suite");
    assert.equal(th[6].textContent, "categories");
    assert.equal(th[7].textContent, "file");

    // verify html test cases
    const trNodes = document.querySelectorAll("table tbody tr");

    // verify expected property
    const expectedProperty = trNodes[0].querySelectorAll("td")[2].textContent;
    assert.equal(expectedProperty, "10 items in response\neach item has id, name, and description");

    const tr = trNodes[1];
    const tds = tr.querySelectorAll("td");

    assert.equal(trNodes.length, 3);
    assert.equal(trNodes.length, res.testcases_count);
    assert.equal(trNodes.length, testcases.length, "Expected to have the same number of testcases");

    assert.equal(tds[0].textContent, "TC999");

    // steps
    const spans = tds[1].querySelectorAll("span");
    assert.equal(spans[0].textContent, "Add a new item to collection");
    assert.equal(spans[1].textContent, "verify new item has been added");
    assert.equal(spans[2].textContent, "Step name, will match inline with code");
    // --

    // expected
    assert.equal(tds[2].innerHTML, "");
    assert.equal(tds[3].textContent, "POST");
    assert.equal(tds[4].textContent, "POST /add");
    assert.equal(tds[5].textContent, "API inline");

    // categories
    const categorySpans = tds[6].querySelectorAll("span");
    assert.equal(categorySpans[0].textContent, "API");
    assert.equal(categorySpans[1].textContent, "featureA");

    // file
    assert.equal(tds[7].textContent, "fixtures/featureA/Monday/API/api.ts");

    assert.equal(tds.length, 8);
  });

  it("write to file - error", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "featureA", "Monday", "API", "api.ts");
    const testcases = await getTestCasesFromPattern(filePattern);

    const fsWriteFile = fs.writeFile;
    fs.writeFile = (filename, html, callback) => {
      assert.equal(filename, HTML_FILE);
      assert.ok(html);
      callback(new Error("fs.writeFile html failed"));
    };

    try {
      await report.writeToHTML({ filename: HTML_FILE, testcases });
      assert.fail("Expected fs.writeFile to throw an error");
    } catch (err) {
      assert.equal(err.message, "fs.writeFile html failed");
    }
    finally {
      fs.writeFile = fsWriteFile;
    }
  });
});