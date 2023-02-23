# Test Case Document tool

Test cases live in your test code.

Genrate test cases written to a html, xlsx or json 


## Install

    npm install testcase-doc -g

    testcase-doc -h

    Usage: testcase-doc [options]

    Options:
          --version       Show version number                                                                                [boolean]
      -f, --file-pattern  File pattern to match: e.g. tests/{API,Integ,E2E}/**/*.js                                         [required]
          --out           Directory to write the report to                                  [required] [default: "./testcases-report"]
          --json          Generate JSON testcases report
          --html          Generate HTML testcases report
          --xlsx          Generate XLSX testcases report
      -h, --help          Show help                                                                                          [boolean]

    Example: testcase-doc -f tests/{API,Integ,E2E}/**/*.js --json --html --xlsx
