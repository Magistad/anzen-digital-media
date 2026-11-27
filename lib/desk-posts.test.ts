import assert from "node:assert/strict";
import test from "node:test";
import { getDeskPost, listDeskPosts } from "./desk-posts";

test("each new desk publishes two starter articles", () => {
  for (const desk of ["business", "tech", "money"] as const) {
    const posts = listDeskPosts(desk, { includeDrafts: false });
    assert.equal(posts.length, 2, desk);
    for (const post of posts) {
      assert.equal(post.href, `/${desk}/${post.slug}`);
      assert.equal(post.excerpt.length > 40, true);
      const full = getDeskPost(desk, post.slug, { includeDrafts: false });
      assert.ok(full);
      assert.equal(full.content.toLowerCase().includes("legal advice") || desk !== "business", true);
    }
  }
  const trademark = getDeskPost("business", "how-a-trademark-search-works");
  assert.ok(trademark?.content.includes("/services/trademark-search-report"));
  const nevada = getDeskPost("business", "nevada-annual-list-deadlines");
  assert.ok(nevada?.content.toLowerCase().includes("do not file"));
  const grant = getDeskPost("money", "how-to-find-a-real-small-business-grant");
  assert.ok(grant?.content.includes("/services/grant-match-report"));
});
