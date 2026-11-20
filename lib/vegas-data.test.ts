import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { AFFILIATE_IDS, ATTRACTIONS, attractionHref } from "./vegas-attractions";
import { COMMUNITY_POSTS, hasCommunityPosts } from "./vegas-community";
import { CONVENTION_WEEKS } from "./vegas-conventions";
import { RESORT_FEES, ZERO_RESORT_FEES, taxIncludedCents } from "./vegas-fees";
import { VISITOR_QUESTIONS } from "./vegas-questions";

const COPY_FILES = [
  "lib/vegas-fees.ts",
  "lib/vegas-conventions.ts",
  "lib/vegas-questions.ts",
  "lib/vegas-attractions.ts",
  "lib/vegas-community.ts",
  "lib/vegas-conditions.ts",
  "components/vegas/VegasGuide.tsx",
  "components/vegas/VegasForms.tsx",
  "app/(site)/products/vegas/page.tsx",
  "public/forms.html",
];

function walkStrings(value: unknown, found: string[] = []): string[] {
  if (typeof value === "string") found.push(value);
  else if (Array.isArray(value)) value.forEach((item) => walkStrings(item, found));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => walkStrings(item, found));
  return found;
}

test("visitor questions are the fifteen sourced prompts", () => {
  assert.equal(VISITOR_QUESTIONS.length, 15);
  const ids = VISITOR_QUESTIONS.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const item of VISITOR_QUESTIONS) {
    assert.ok(item.question.trim().length > 0);
    assert.ok(item.answer.trim().length > 0);
    for (const source of item.sources) assert.match(source.href, /^https:\/\//);
  }
});

test("resort fees keep a source, a check date, and verified tax math", () => {
  assert.ok(RESORT_FEES.length >= 8 && RESORT_FEES.length <= 15);
  assert.equal(ZERO_RESORT_FEES.length, 0);
  for (const fee of RESORT_FEES) {
    assert.match(fee.sourceUrl, /^https:\/\//);
    assert.match(fee.checked, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(fee.included.trim().length > 0);
    assert.ok(fee.preTaxCents > 0);
    assert.equal(fee.taxIncludedCents, taxIncludedCents(fee.preTaxCents));
  }
  assert.equal(taxIncludedCents(5500), 6236);
  assert.equal(taxIncludedCents(5000), 5669);
  assert.equal(taxIncludedCents(4500), 5102);
  assert.equal(taxIncludedCents(4995), 5663);
  assert.equal(taxIncludedCents(5495), 6230);
});

test("convention weeks cite a crowd source or leave the crowd blank", () => {
  assert.ok(CONVENTION_WEEKS.length >= 4);
  for (const week of CONVENTION_WEEKS) {
    assert.match(week.weekOf, /^\d{4}-\d{2}-\d{2}$/);
    if (week.crowd) {
      assert.ok(week.crowd.label.trim().length > 0);
      assert.match(week.crowd.sourceUrl, /^https:\/\//);
      assert.match(week.crowd.checked, /^\d{4}-\d{2}-\d{2}$/);
    }
    for (const show of week.shows) {
      assert.match(show.sourceUrl, /^https:\/\//);
      assert.ok(show.when.trim().length > 0);
    }
  }
});

test("affiliate ids stay empty and are not written onto plain links", () => {
  assert.equal(AFFILIATE_IDS.viator, "");
  assert.equal(AFFILIATE_IDS.getyourguide, "");
  const helicopter = ATTRACTIONS.find((item) => item.id === "helicopter");
  assert.ok(helicopter);
  assert.equal(attractionHref(helicopter), helicopter.href);
  assert.equal(attractionHref(helicopter).includes("pid="), false);
  const withId = attractionHref(helicopter, { viator: "test-partner", getyourguide: "" });
  assert.match(withId, /pid=test-partner/);
  for (const item of ATTRACTIONS) assert.match(item.href, /^https:\/\//);
});

test("community answers start empty", () => {
  assert.equal(COMMUNITY_POSTS.length, 0);
  assert.equal(hasCommunityPosts(), false);
  assert.equal(
    hasCommunityPosts([
      {
        id: "sample",
        kind: "tip",
        title: "Reviewed tip",
        body: "Added by hand after review.",
        published: "2026-11-20",
      },
    ]),
    true,
  );
});

test("vegas copy has no em dash and does not invent a live crime feed", () => {
  const bundled = COPY_FILES.map((file) => readFileSync(file, "utf8")).join("\n");
  const data = walkStrings({
    VISITOR_QUESTIONS,
    RESORT_FEES,
    ZERO_RESORT_FEES,
    CONVENTION_WEEKS,
    ATTRACTIONS,
    COMMUNITY_POSTS,
  }).join("\n");
  for (const text of [bundled, data]) {
    assert.equal(text.includes("\u2014"), false);
    assert.equal(text.includes("ARGOS"), false);
    assert.equal(text.includes("WorldMood"), false);
    assert.equal(text.toLowerCase().includes("real-time"), false);
    assert.equal(text.toLowerCase().includes("realtime"), false);
  }
});
