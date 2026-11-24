import assert from "node:assert/strict";
import test from "node:test";
import { CREATOR, CREATOR_PROFILES, PUBLISHER, creatorByline, isCreatorByline } from "./identity";
import { articleGraph, serializeJsonLd, siteGraph } from "./structured-data";

test("publisher and creator descriptions stay plain", () => {
  for (const text of [PUBLISHER.description, CREATOR.description]) {
    assert.equal(text.includes("\u2014"), false);
    assert.ok(text.length < 200);
  }
  assert.equal(creatorByline(), "LUNCHBRK (Javier Segura)");
  assert.ok(isCreatorByline("Javier Segura"));
  assert.ok(isCreatorByline("lunchbrk"));
  assert.equal(isCreatorByline("Someone Else"), false);
});

test("creator profiles are https and listed in sameAs", () => {
  for (const profile of CREATOR_PROFILES) assert.ok(profile.href.startsWith("https://"));
  assert.deepEqual([...CREATOR.sameAs], CREATOR_PROFILES.map((p) => p.href));
});

test("site graph links publisher and creator both ways", () => {
  const graph = siteGraph()["@graph"] as Array<Record<string, any>>;
  const org = graph.find((n) => n["@type"] === "Organization")!;
  const person = graph.find((n) => n["@type"] === "Person")!;
  assert.equal(org.founder["@id"], person["@id"]);
  assert.equal(person.worksFor["@id"], org["@id"]);
  assert.equal(person.alternateName, "LUNCHBRK");
});

test("article graph uses the creator and the game", () => {
  const data = articleGraph({
    title: "T",
    excerpt: "E",
    href: "/gaming/x",
    date: "2026-11-24",
    updated: null,
    author: "Javier Segura",
    game: "Rob Run",
    steamAppId: "4262460",
  }) as Record<string, any>;
  assert.equal(data.author["@id"], CREATOR.id);
  assert.equal(data.dateModified, "2026-11-24");
  assert.equal(data.about["@type"], "VideoGame");
  assert.equal(data.about.url, "https://store.steampowered.com/app/4262460/");
  assert.equal(serializeJsonLd({ a: "</script>" }).includes("</script>"), false);
});
