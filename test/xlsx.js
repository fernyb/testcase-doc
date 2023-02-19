import report from "../src/report.js";

import path from "path";
import fs from "fs";
import _ from "lodash";
import assert from "assert";
import Excel from "exceljs";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { getTestCasesFromPattern } from "../src/steps.js";

function readXLSXFile(filename) {
  const workbook = new Excel.Workbook();
  return workbook.xlsx.readFile(filename).then(() => {
    const worksheet = workbook.getWorksheet(1);

    const rows = [];
    worksheet.eachRow((row) => {
      rows.push({
        id: row.values[1],
        steps: row.values[2],
        description: row.values[3],
        name: row.values[4],
        suite: row.values[5],
        categories: row.values[6],
        file: row.values[7],
      });
    });
    rows.shift();
    return rows;
  });
}

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

describe("Write to XLSX", () => {
  beforeEach(async () => {
    await rmFile(`${__dirname}/tmp/test.xlsx`);
  });

  afterEach(async () => {
    await rmFile(`${__dirname}/tmp/test.xlsx`);
  });

  it("write to file", async () => {
    const filePattern = path.posix.join(path.resolve(__dirname), "..", "fixtures", "featureA", "Monday", "API", "api.ts");
    const testcases = await getTestCasesFromPattern(filePattern);

    const res = await report.writeToXLSX({ filename: path.resolve(`${__dirname}/tmp/test.xlsx`), testcases });
    const rows = await readXLSXFile(`${__dirname}/tmp/test.xlsx`);

    assert.equal(res.filename, `${__dirname}/tmp/test.xlsx`);
    assert.equal(res.testcases_count, testcases.length);
    assert.equal(rows.length, testcases.length, "Expected to have same number of testcases");

    const row = rows[1];
    assert.equal(row.id, "TC999");
    assert.equal(row.steps, [
      "Add a new item to collection",
      "verify new item has been added",
      "Step name, will match inline with code"].join("\n"));
    assert.equal(row.description, "POST");
    assert.equal(row.name, "POST /add");
    assert.equal(row.suite, "API inline");
    assert.equal(row.categories, [
      "API",
      "featureA",
    ].join("\n"));
    assert.equal(row.file, "fixtures/featureA/Monday/API/api.ts");
  });
});