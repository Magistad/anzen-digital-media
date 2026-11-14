import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const config = require("../lighthouserc.cjs") as {
  ci: {
    collect: { numberOfRuns: number };
    assert: {
      assertions: Record<string, [string, { minScore?: number; aggregationMethod?: string }]>;
    };
  };
};

test("performance budgets use the median of several local runs", () => {
  assert.ok(config.ci.collect.numberOfRuns >= 3);
  const assertions = config.ci.assert.assertions;
  for (const key of [
    "categories:performance",
    "categories:accessibility",
    "largest-contentful-paint",
    "cumulative-layout-shift",
  ]) {
    const assertion = assertions[key];
    assert.equal(assertion[0], "error");
    assert.equal(assertion[1].aggregationMethod, "median");
  }
  assert.equal(assertions["categories:performance"][1].minScore, 0.8);
  assert.equal(assertions["categories:accessibility"][1].minScore, 0.9);
});
