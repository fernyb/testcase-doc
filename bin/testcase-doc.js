#!/usr/bin/env node

import yargs from 'yargs';
import { getTestCasesFromPattern } from '../src/steps.js';
import report from '../src/report.js';

const options = yargs(process.argv.slice(2))
  .usage('Usage: $0 [options]')
  .option('file-pattern', {
    alias: 'f',
    describe: 'File pattern to match: e.g. tests/{API,Integ,E2E}/**/*.js',
    demandOption: true
  })
  .option('out', {
    describe: "Directory to write the report to",
    default: './testcases-report',
    demandOption: true
  })
  .option('json', {
    describe: 'Generate JSON testcases report',
  })
  .option('html', {
    describe: 'Generate HTML testcases report',
  })
  .option('xlsx', {
    describe: 'Generate XLSX testcases report',
  })
  .epilog('Example: $0 -f tests/{API,Integ,E2E}/**/*.js --json --html --xlsx')
  .help('h')
  .alias('h', 'help')
  .wrap(130)
  .argv;

function run() {
  console.log('Running...');

  if (options['file-pattern']) {
    let pattern;
    if (Array.isArray(options['file-pattern'])) {
      pattern = options['file-pattern'].map((p) => p.trim());
    } else {
      pattern = options['file-pattern'].trim();
    }

    getTestCasesFromPattern(pattern).then((testcases) => {
      const reports = [];
      if (options.json) {
        reports.push(report.writeToJSON({
          filename: `${options.out}/testcases.json`,
          testcases
        }));
      }

      if (options.html) {
        reports.push(report.writeToHTML({
          filename: `${options.out}/testcases.html`,
          testcases
        }));
      }

      if (options.xlsx) {
        reports.push(report.writeToXLSX({
          filename: `${options.out}/testcases.xlsx`,
          testcases
        }));
      }

      if (reports.length === 0) {
        console.log('No reports generated. Please specify at least one of --json, --html, --xlsx');
        return;
      }

      Promise.all(reports).then((results) => {
        results.forEach((result) => {
          console.log(`Report generated: ${result.filename} (${result.testcases_count} testcases)`);
        });
      });
    });
  }
}

run();