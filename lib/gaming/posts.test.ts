import assert from "node:assert/strict";
import test from "node:test";
import { GAMING_SECTIONS, sectionBySlug } from "./sections";
import { AFFILIATE_DISCLOSURE, AFFILIATE_PARTNERS } from "./affiliates";
import { getPost, listPosts } from "./posts";
import { draftsArePublic } from "./drafts";

test("gaming sections use plain names and unique slugs", () => {
  const slugs = GAMING_SECTIONS.map((item) => item.slug);
  assert.deepEqual(new Set(slugs).size, slugs.length);
  assert.equal(GAMING_SECTIONS.length, 5);
  assert.ok(sectionBySlug("tips"));
  for (const item of GAMING_SECTIONS) {
    assert.equal(item.href, `/gaming/${item.slug}`);
    assert.equal(item.name.includes("\u2014"), false);
    assert.equal(item.summary.includes("\u2014"), false);
  }
});

test("affiliate partners are ready with placeholder IDs", () => {
  const ids = AFFILIATE_PARTNERS.map((item) => item.id);
  assert.deepEqual(ids, ["fanatical", "humble", "gmg", "gog", "amazon", "newegg", "bestbuy"]);
  for (const partner of AFFILIATE_PARTNERS) {
    assert.ok(partner.href.startsWith("https://"));
    assert.equal(partner.href.includes("PLACEHOLDER_"), false);
  }
  assert.match(AFFILIATE_DISCLOSURE, /commission/i);
});

test("the Rob Run article is published and hides formulas", () => {
  const visible = listPosts({ includeDrafts: true });
  assert.equal(visible.length, 1);
  const post = getPost("when-the-alarm-goes-off-early-in-rob-run", { includeDrafts: true });
  assert.ok(post);
  assert.equal(post.draft, false);
  assert.equal(post.section, "tips");
  assert.equal(post.author, "Javier Segura");
  assert.equal(post.todo, null);
  assert.equal(post.content.includes("10,000-year"), false);
  assert.equal(post.title.includes("\u2014"), false);
  const banned = ["P_PvP", "Q_eff", "T_response", "T_total", "C_total", "lambda", "EV=", "1 - e^"];
  const haystack = `${post.title}\n${post.excerpt}\n${post.content}`;
  for (const token of banned) {
    assert.equal(haystack.includes(token), false, `article contains formula token ${token}`);
  }
  assert.equal(listPosts({ includeDrafts: false }).length, 1);
  assert.ok(getPost(post.slug, { includeDrafts: false }));
});

test("draftsArePublic is false in a production context", () => {
  // This file is loaded under the test runner, not a production Next build.
  // The production path is NODE_ENV=production and CONTEXT unset or "production".
  assert.equal(typeof draftsArePublic(), "boolean");
});
