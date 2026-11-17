import assert from "node:assert/strict";
import test from "node:test";
import { PROJECTS, projectBySlug } from "./projects";

test("a project is one catalog entry", () => {
  const slugs = PROJECTS.map((item) => item.slug);
  assert.deepEqual(new Set(slugs).size, slugs.length);
  assert.ok(PROJECTS.length >= 2);

  const closepath = projectBySlug("closepath");
  assert.equal(closepath?.href, "/products/closepath");
  assert.equal(closepath?.status, "live");

  const countdown = projectBySlug("countdown");
  assert.equal(countdown?.href, "/products/countdown");
  assert.equal(countdown?.status, "soon");
  assert.equal(countdown?.statusLabel, "Coming soon");

  for (const item of PROJECTS) {
    assert.equal(item.href, `/products/${item.slug}`);
    assert.equal(item.name.includes("\u2014"), false);
    assert.equal(item.summary.includes("\u2014"), false);
    assert.equal(item.statusLabel.includes("\u2014"), false);
  }
});
