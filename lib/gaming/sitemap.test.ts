import assert from "node:assert/strict";
import test from "node:test";
import robots from "../../app/robots";
import sitemap from "../../app/sitemap";

test("robots keeps closepath private and applies the SAG-46 bot rules", () => {
  const file = robots();
  const rules = Array.isArray(file.rules) ? file.rules : [file.rules];
  const star = rules.find((rule) => rule.userAgent === "*");
  assert.ok(star);
  assert.deepEqual(star.disallow, ["/api/", "/closepath", "/services/intake", "/services/received"]);
  assert.ok(star.allow?.includes("/"));
  assert.ok(star.allow?.includes("/closepath/*.png"));

  const agents = rules.map((rule) => rule.userAgent);
  assert.ok(agents.includes("Google-Extended"));
  assert.ok(agents.includes("GPTBot"));
  assert.ok(agents.includes("ClaudeBot"));
  assert.ok(agents.includes("Applebot-Extended"));

  const googleExtended = rules.find((rule) => rule.userAgent === "Google-Extended");
  const allow = googleExtended?.allow;
  assert.ok(allow === "/" || (Array.isArray(allow) && allow.includes("/")));
  for (const agent of ["GPTBot", "ClaudeBot", "Applebot-Extended"]) {
    const rule = rules.find((item) => item.userAgent === agent);
    assert.ok(rule);
    const disallow = rule.disallow;
    assert.ok(disallow === "/" || (Array.isArray(disallow) && disallow.includes("/")));
  }
  assert.equal(file.sitemap, "https://anzendigitalmedia.com/sitemap.xml");
});

test("sitemap lists the gaming desk and omits draft posts", () => {
  const urls = sitemap().map((entry) => entry.url);
  assert.ok(urls.includes("https://anzendigitalmedia.com/gaming"));
  assert.ok(urls.includes("https://anzendigitalmedia.com/gaming/tips"));
  assert.ok(urls.includes("https://anzendigitalmedia.com/gaming/news"));
  assert.ok(urls.includes("https://anzendigitalmedia.com/gaming/hype"));
  assert.ok(urls.includes("https://anzendigitalmedia.com/projects"));
  assert.ok(urls.includes("https://anzendigitalmedia.com/products/closepath"));
  assert.ok(urls.includes("https://anzendigitalmedia.com/business"));
  assert.ok(urls.includes("https://anzendigitalmedia.com/tech"));
  assert.ok(urls.includes("https://anzendigitalmedia.com/money"));
  assert.ok(urls.includes("https://anzendigitalmedia.com/business/how-a-trademark-search-works"));
  assert.ok(urls.includes("https://anzendigitalmedia.com/services/trademark-search-report"));
  assert.ok(urls.includes("https://anzendigitalmedia.com/services/grant-match-report"));
  assert.ok(urls.includes("https://anzendigitalmedia.com/services/nevada-annual-compliance-kit"));
  assert.ok(urls.includes("https://anzendigitalmedia.com/faq"));
  assert.equal(urls.includes("https://anzendigitalmedia.com/services/intake"), false);
  assert.equal(
    urls.some((url) => url.includes("when-the-alarm-goes-off-early-in-rob-run")),
    false,
  );
});
