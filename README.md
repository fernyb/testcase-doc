# Test Case Document tool

Test cases live in your test code.

Generate test cases written to a html, xlsx or json 


## Install

    npm install testcase-doc -g

## Help Menu

    testcase-doc -h

    Usage: testcase-doc [options]

    Options:
        --version       Show version number                                                                                [boolean]
    -f, --file-pattern  File pattern to match: e.g. tests/{API,Integ,E2E}/**/*.js                                         [required]
        --out           Directory to write the report to                                  [required] [default: "./testcases-report"]
        --json          Generate JSON testcases report
        --html          Generate HTML testcases report
        --xlsx          Generate XLSX testcases report
        --cli           Print testcases report to CLI
    -c, --category      Category to filter testcases by
    -h, --help          Show help                                                                                          [boolean]

    Example: testcase-doc -f "tests/{API,Integ,E2E}/**/*.js" --json --html --xlsx


## Syntax:
Use the following comments inside the it() test block.

    // tc-id: <an identifier for the testcase>
    // tc-suite: <What Suite does it belong to?>
    // tc-category: <Category test case belongs to, can belong to many categories>
    // tc-category: <Category test case belongs to, can belong to many categories>
    // tc-expected: <What do we expect from this test case. Can use multiple expects>
    // tc-expected: <What do we expect from this test case. Can use multiple expects>
    // tc-description: <Provide a more details description of the test case by default it will use the "describe">
    // tc: <This is where you put the step, these can be multiple>
    // tc: <This is where you put the step, these can be multiple>
    // tc: <This is where you put the step, these can be multiple>
    // tc: <This is where you put the step, these can be multiple>

## Example Mocha Test file:
    describe("API Endpoints", { tags: "@SMOKE" }, () => {
    context("GET", () => {
        it("GET /endpoint1", () => {
        // tc-suite: API v2
        // tc: GET collections for endpoint /endpoint1
        // tc: verify response has the following items
        // tc: verify 10 items in response
        // tc-category: API
        // tc-category: featureA
        // tc-expected: 10 items in response
        // tc-expected: each item has id, name, and description
        });
    });

    context("POST", () => {
        it("POST /add", () => {
        // tc-id: TC999
        // tc: Add a new item to collection
        // tc: verify new item has been added
        //tc: Step name
        console.log("Hello World");// tc: Step name, will match inline with code
        console.log("Hello World");//tc: Step name, will not match
        // tc-suite: API inline
        // tc-category: API
        // tc-category: featureA
        });

        it("POST /add/vehicle", () => {
        // tc-id: TC998
        // tc: Make request to / and get first element id
        // tc: Add new vehicle to element id
        // tc: verify new vehicle was added
        // tc-description: POST /add/vehicle?id=100 with payload
        // tc-category: featureA
        // tc-category: API
        // tc-expected: For new vehicle to be added
        });
    });
    });

