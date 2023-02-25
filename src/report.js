import Excel from "exceljs";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import Table from "cli-table";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLUMNS = ["id", "steps", "expected", "description", "name", "suite", "categories", "file"];

function mkdirp(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    const directories = directoryPath.split(path.sep);

    const currentDirectory = [];
    directories.forEach((directory) => {
      currentDirectory.push(directory);
      if (currentDirectory.length === 1) return;

      const cd = currentDirectory.join(path.sep);
      if (!fs.existsSync(cd)) {
        fs.mkdirSync(cd);
      }
    });
  }
}

function writeToXLSX(opts = {}) {
  mkdirp(path.dirname(opts.filename));

  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("TestCases", {
    views: [
      { state: "frozen", ySplit: 1 }
    ]
  });

  worksheet.properties.defaultRowHeight = 15;
  worksheet.addRow(COLUMNS);

  opts.testcases.forEach((tc) => {
    const steps = tc.steps.join("\n");
    const row = worksheet.addRow([
      tc.id,
      steps,
      tc.expected,
      tc.description,
      tc.name,
      tc.suite,
      tc.categories.join("\n"),
      tc.file
    ]);

    row.height = worksheet.properties.defaultRowHeight * tc.steps.length;
    if (row.height === 0) row.height = worksheet.properties.defaultRowHeight;
  });

  worksheet.columns.forEach((column) => {
    let dataMax = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = (cell.value || "");
      const lines = cellValue.split("\n");
      lines.forEach((line) => {
        const columnLength = (line || "").length;	
        if (columnLength > dataMax) {
          dataMax = columnLength;
        }
      });
    });

    column.width = dataMax < 13 ? 13 : dataMax;
    column.alignment = { vertical: "top" };
  });

  return workbook.xlsx.writeFile(opts.filename).then(() => {
    return {
      filename: opts.filename,
      testcases_count: opts.testcases.length
    };
  });
}

function writeToHTML(opts = {}) {
  mkdirp(path.dirname(opts.filename));

  Handlebars.registerHelper('steps', (steps) => {
    return steps.map((step) => `<span>${step}</span>`).join("<br/>");
  });

  Handlebars.registerHelper('categories', (categories) => {
    return categories.map((category) => `<span>${category}</span>`).join("<br/>");
  });

  const getGeneratedHTML = () => {
    return new Promise((resolve) => {
      fs.readFile(`${__dirname}/templates/basic.html`, 'utf-8', (error, source) => {
        const template = Handlebars.compile(source);
        const html = template({ headers: COLUMNS, testcases: opts.testcases });
        resolve(html);
      });
    });
  };

  return getGeneratedHTML().then((html) => {
    return new Promise((resolve) => {
      fs.writeFile(opts.filename, html, (err) => {
        if (err) throw err;
        resolve({
          filename: opts.filename,
          testcases_count: opts.testcases.length
        });
      });
    });
  });
}

function writeToJSON(opts = {}) {
  mkdirp(path.dirname(opts.filename));

  return new Promise((resolve) => {
    fs.writeFile(opts.filename, JSON.stringify(opts.testcases, null, 2), (err) => {
      if (err) throw err;
      resolve({
        filename: opts.filename,
        testcases_count: opts.testcases.length
      });
    });
  });
}

function writeToCLI(opts = {}) {
  return new Promise((resolve) => {
    const table = new Table(
      {
        head: COLUMNS,
        colWidths: [5, 50, 30, 30, 30, 10, 15, 50],
      }
    );

    opts.testcases.forEach((tc) => {
      table.push([
        tc.id || "",
        tc.steps.join("\n"),
        tc.expected || "",
        tc.description || "",
        tc.name || "",
        tc.suite || "",
        tc.categories.join("\n"),
        tc.file
      ]);
    });

    const result = table.toString();
    console.log(result);
    resolve({
      filename: opts.filename,
      testcases_count: opts.testcases.length
    });
  });
}

export default {
  writeToXLSX,
  writeToHTML,
  writeToJSON,
  writeToCLI,
}