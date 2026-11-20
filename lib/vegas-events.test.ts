import assert from "node:assert/strict";
import test from "node:test";
import { applyVegasEvent, emptyEventCounts, parseVegasEvent } from "./vegas-events";

test("event parsing accepts the demand-test events and rejects junk", () => {
  assert.deepEqual(parseVegasEvent({ type: "view", target: "/products/vegas" }), {
    type: "view",
    target: "/products/vegas",
  });
  assert.equal(parseVegasEvent({ type: "outbound", target: "https://www.thesphere.com/" })?.type, "outbound");
  assert.equal(parseVegasEvent({ type: "outbound", target: "javascript:alert(1)" }), null);
  assert.equal(parseVegasEvent({ type: "signup", target: "email@example.com" }), null);
  assert.equal(parseVegasEvent(null), null);
  assert.equal(parseVegasEvent({ type: "waitlist" })?.target, "");
});

test("event counts do not store message text and cap new outbound keys", () => {
  let counts = emptyEventCounts();
  counts = applyVegasEvent(counts, { type: "view", target: "/products/vegas" });
  counts = applyVegasEvent(counts, { type: "waitlist", target: "vegas-waitlist" });
  counts = applyVegasEvent(counts, { type: "ask", target: "vegas-ask-a-local" });
  counts = applyVegasEvent(counts, { type: "tip", target: "vegas-local-tip" });
  counts = applyVegasEvent(counts, { type: "outbound", target: "https://grandcanyonwest.com/" });
  assert.deepEqual(
    { views: counts.views, waitlist: counts.waitlist, ask: counts.ask, tip: counts.tip, outboundTotal: counts.outboundTotal },
    { views: 1, waitlist: 1, ask: 1, tip: 1, outboundTotal: 1 },
  );
  assert.equal(counts.outbound["https://grandcanyonwest.com/"], 1);
  assert.equal(JSON.stringify(counts).includes("@"), false);

  let filled = emptyEventCounts();
  for (let index = 0; index < 40; index += 1) {
    filled = applyVegasEvent(filled, { type: "outbound", target: `https://example.com/${index}` });
  }
  filled = applyVegasEvent(filled, { type: "outbound", target: "https://example.com/overflow" });
  assert.equal(filled.outboundTotal, 41);
  assert.equal(filled.outbound["https://example.com/overflow"], undefined);
  filled = applyVegasEvent(filled, { type: "outbound", target: "https://example.com/0" });
  assert.equal(filled.outbound["https://example.com/0"], 2);
});
