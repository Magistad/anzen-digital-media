import assert from "node:assert/strict";
import test from "node:test";
import { RELEASES, featuredRelease, releaseBySlug } from "./releases";

test("a release is one catalog entry", () => {
  const slugs = RELEASES.map((item) => item.slug);
  assert.deepEqual(new Set(slugs).size, slugs.length);
  assert.ok(RELEASES.length >= 2);

  const closepath = releaseBySlug("closepath");
  assert.equal(closepath?.href, "/products/closepath");
  assert.equal(closepath?.status, "live");

  const countdown = releaseBySlug("countdown");
  assert.equal(countdown?.href, "/products/countdown");
  assert.equal(countdown?.status, "soon");
  assert.equal(countdown?.statusLabel, "Coming soon");

  assert.equal(featuredRelease()?.slug, "closepath");

  for (const item of RELEASES) {
    assert.equal(item.href, `/products/${item.slug}`);
    assert.equal(item.name.includes("\u2014"), false);
    assert.equal(item.summary.includes("\u2014"), false);
    assert.equal(item.statusLabel.includes("\u2014"), false);
  }
});
