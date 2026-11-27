import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { FAQ_PAGE, HUB, SERVICE_INDEX, SERVICE_PAGES } from "./service-copy";
import {
  SERVICE_OFFERS,
  formatUsd,
  isServicePrice,
  offerById,
  serviceCheckoutFields,
  servicePriceId,
} from "./services";

test("each service offer has a distinct price env and a posted amount", () => {
  const envs = SERVICE_OFFERS.map((offer) => offer.env);
  assert.equal(new Set(envs).size, envs.length);
  assert.deepEqual(
    SERVICE_OFFERS.map((offer) => [offer.id, formatUsd(offer.amountCents), offer.mode]),
    [
      ["trademark-name", "$99", "payment"],
      ["trademark-name-logo", "$179", "payment"],
      ["trademark-watch", "$19", "subscription"],
      ["grant-match", "$149", "payment"],
      ["nevada-compliance", "$99", "payment"],
      ["certificate-existence", "$79", "payment"],
    ],
  );
  for (const offer of SERVICE_OFFERS) {
    assert.equal(servicePriceId(offer), null);
    assert.equal(offer.acknowledge.toLowerCase().includes("law firm") || offer.acknowledge.toLowerCase().includes("does not"), true);
  }
});

test("checkout fields follow the paid service and do not pin payment method types", () => {
  const offer = offerById("trademark-watch");
  assert.ok(offer);
  const fields = serviceCheckoutFields(offer, "price_test", "https://anzendigitalmedia.com");
  assert.equal(fields.mode, "subscription");
  assert.equal(fields.success_url?.includes("/services/intake?session_id="), true);
  assert.equal("payment_method_types" in fields, false);
  assert.equal(fields.metadata?.product, "service");
  const once = serviceCheckoutFields(offerById("grant-match")!, "price_test", "https://anzendigitalmedia.com");
  assert.equal(once.mode, "payment");
  assert.equal(once.customer_creation, "always");
  assert.equal("payment_method_types" in once, false);
});

test("a one-time price cannot be a subscription price", () => {
  const offer = offerById("nevada-compliance")!;
  assert.equal(
    isServicePrice(offer, { active: true, currency: "usd", unit_amount: 9900, recurring: null }),
    true,
  );
  assert.equal(
    isServicePrice(offer, {
      active: true,
      currency: "usd",
      unit_amount: 9900,
      recurring: { interval: "month", interval_count: 1 },
    }),
    false,
  );
  const watch = offerById("trademark-watch")!;
  assert.equal(
    isServicePrice(watch, {
      active: true,
      currency: "usd",
      unit_amount: 1900,
      recurring: { interval: "month", interval_count: 1 },
    }),
    true,
  );
});

test("service titles and descriptions fit a search result", () => {
  for (const page of SERVICE_PAGES) {
    const titleTag = `${page.title} | Anzen`;
    assert.ok(titleTag.length < 60, `${titleTag} is ${titleTag.length}`);
    assert.ok(page.description.length > 40 && page.description.length < 155, page.description);
    assert.ok(page.faqs.length >= 3);
  }
  assert.ok(FAQ_PAGE.description.length < 155);
  assert.ok(SERVICE_INDEX.description.length < 155);
  assert.ok(HUB.description.length < 155, HUB.description);
});

test("new customer copy has no em dash and no meeting booking language", () => {
  const roots = [
    path.join(process.cwd(), "content", "business"),
    path.join(process.cwd(), "content", "tech"),
    path.join(process.cwd(), "content", "money"),
    path.join(process.cwd(), "lib", "service-copy.ts"),
    path.join(process.cwd(), "lib", "services.ts"),
    path.join(process.cwd(), "lib", "service-orders.ts"),
  ];
  const files = roots.flatMap((root) => {
    try {
      return readdirSync(root).map((name) => path.join(root, name));
    } catch {
      return [root];
    }
  });
  const banned = [
    "\u2014",
    "\u2013",
    "book a call",
    "calendly",
    "schedule a call",
    "in today's",
    "unlock",
    "elevate",
    "seamless",
    "delve",
    "game-changer",
    "not just",
  ];
  for (const file of files) {
    const text = readFileSync(file, "utf8").toLowerCase();
    for (const token of banned) {
      assert.equal(text.includes(token), false, `${file} contains ${token}`);
    }
  }
  assert.equal(HUB.lead.toLowerCase().includes("javier"), true);
  assert.equal(HUB.latestLead.toLowerCase().includes("gaming"), true);
  assert.equal(SERVICE_PAGES.length, 3);
  assert.equal(FAQ_PAGE.items.some((item) => item.answer.toLowerCase().includes("law firm")), true);
});
