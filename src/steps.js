import fs from "fs";
import path from "path";
import _ from "lodash";
import { globby } from "globby";
import { parse } from "@babel/parser";
import BabelTraverse from "@babel/traverse";
import  BabelGenerator from "@babel/generator";

function getFileSource(file) {
  return new Promise((resolve) => {
    fs.readFile(file, (err, data) => {
      if (err) throw err;
      const relativeFile = path.relative(process.cwd(), file);
      resolve({ relativeFile: relativeFile, sourceCode: data.toString() });
    });
  });
}

function getParentName(opts) {
  let describeName = null;
  let parent = opts.path.parentPath;
  while (parent) {
    const describeSkipTest = (
      parent.node.callee &&
      parent.node.callee.type === "MemberExpression" &&
      parent.node.callee.object.type === "Identifier" &&
      (
        parent.node.callee.object.name === "describe" ||
        parent.node.callee.object.name === "context"
      ) &&
      parent.node.callee.property.type === "Identifier" &&
      (
        parent.node.callee.property.name === "skip" || 
        parent.node.callee.property.name === "only"
      )
    );

    const describeTest = (
        parent.node.type === "CallExpression" &&
        parent.node.callee.type === "Identifier" && 
        (parent.node.callee.name === "describe" || parent.node.callee.name === "context")
      );

    if (describeTest || describeSkipTest) {
      describeName = parent.node.arguments[0].value;

      if (opts.itSkipTest === false && parent.node.callee.property) {
        opts.itSkipTest = parent.node.callee.property.type === "Identifier" && parent.node.callee.property.name === "skip";
      }
      break;
    }
    parent = parent.parentPath;
  }

  return describeName;
}

function getCase(opts = {}) {
  // -- get the describe() name for the given it()
  const describeName = getParentName(opts);
  // --

  let testName;
  let testSuiteName;
  let testId;
  let testDescription;
  let testCategories = [];
  let testExpected = [];

  const testSteps = _.compact(
    opts.generatedCode.split("\n").map((line) => {
      const matches = line.trim().match(/\/\/\stc:\s(.*)$/);

      if (!testSuiteName) {
        const suiteMatches = line.trim().match(/\/\/\stc-suite:\s(.*)$/);
        testSuiteName = suiteMatches ? suiteMatches[1] : null;
      }

      if (!testId) {
        const testIdMatches = line.trim().match(/\/\/\stc-id:\s(.*)$/);
        testId = testIdMatches ? testIdMatches[1] : null;
      }
      
      if (!testDescription) {
        const testDescriptionMatches = line.trim().match(/\/\/\stc-description:\s(.*)$/);
        testDescription = testDescriptionMatches ? testDescriptionMatches[1] : null;
      }

      const testCategoriesMatches = line.trim().match(/\/\/\stc-category:\s(.*)$/);
      const testCategory = testCategoriesMatches ? testCategoriesMatches[1] : null;
      if (testCategory) {
        testCategories.push(testCategory);
      }

      const testExpectedMatches = line.trim().match(/\/\/\stc-expected:\s(.*)$/);
      const testExpectedValue = testExpectedMatches ? testExpectedMatches[1] : null;
      if (testExpectedValue) {
        testExpected.push(testExpectedValue);
      }

      return matches ? matches[1] : null;
    })
  );

  // get the test name
  switch (opts.path.node.arguments[0].type) {
    case "StringLiteral" :
      testName = opts.path.node.arguments[0].value;
      break;
    case "TemplateLiteral" :
      testName = BabelGenerator.default(opts.path.node.arguments[0]).code;
      testName = testName.substring(1, testName.length).substring(0, testName.length - 2);
      break;
    default: 
      testName = null;
  }

  return {
    file: opts.relativeFile,
    skipped: opts.itSkipTest,
    id: testId,
    description: testDescription || describeName,
    name: testName,
    suite: testSuiteName,
    steps: testSteps,
    categories: testCategories,
    expected: testExpected.join("\n"),
  };
}

function throwError(opt, path) {
  const hasFuncArgument = path.node.arguments.find((a) => {
    return a.type === "Identifier"
  });
  
  if (hasFuncArgument) {
    const testName = path.node.arguments[0].value;
    throw new SyntaxError(`
    File: ${opt.relativeFile}

    The following is not supported:

      function verifyTestFunc() {
        // tc: step name 1
        // tc: step name 2
      }

      it("${testName}", verifyTestFunc);

    Rewrite in the following way:

      it("${testName}", () => {
        // tc: step name 1
        // tc: step name 2
      });
    `.trim());
  }
}

export function getTestCases(file) {
  return getFileSource(file).then((opt) => {
    const ast = parse(opt.sourceCode, {
      sourceType: "module",
      plugins: ["typescript"],
      comments: true,
    });

    const testCases = [];

    BabelTraverse.default(ast, {
      CallExpression(path) {
        const itSkipTest = (path.node.callee.type === "MemberExpression" &&
          path.node.callee.object.type === "Identifier" &&
          path.node.callee.object.name === "it" &&
          path.node.callee.property.type === "Identifier" &&
          path.node.callee.property.name === "skip");

        const itOnlyTest = (path.node.callee.type === "MemberExpression" &&
          path.node.callee.object.type === "Identifier" &&
          path.node.callee.object.name === "it" &&
          path.node.callee.property.type === "Identifier" &&
          path.node.callee.property.name === "only");

        const itTest = (path.node.callee.type === "Identifier" && path.node.callee.name === "it");

        if (itTest || itSkipTest || itOnlyTest) {
          const funcExp = path.node.arguments.find(
            (node) => node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression"
          );

          if (path.node.arguments.length === 1) {
            const tCase = getCase({
              relativeFile: opt.relativeFile,
              itSkipTest: true,
              path,
              generatedCode: "",
            });
            testCases.push(tCase);
            return;
          }

          if (funcExp) {
            const output = BabelGenerator.default(funcExp).code;
            const tCase = getCase({
              relativeFile: opt.relativeFile,
              itSkipTest,
              path,
              generatedCode: output,
            });
            testCases.push(tCase);
            return;
          }

          if (!funcExp && path.node.arguments.length > 1) {
            throwError(opt, path);
          }
        }
      },
    });

    return testCases;
  });
}

export function getTestCasesFromPattern(filePattern) {
  return globby(filePattern, {
    expandDirectories: true
  }).then((files) => {
    return Promise.all(files.map((file) => getTestCases(file)));
  }).then((fileSteps) => {
    return _.flatten(fileSteps);
  });
}