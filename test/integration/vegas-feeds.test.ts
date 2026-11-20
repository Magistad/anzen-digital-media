import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { withAffiliate } from "../../lib/vegas-affiliates";
import { parseVegasCalendar, loadVegasCalendar } from "../../lib/vegas-calendar-feed";
import { clearVegasCache } from "../../lib/vegas-cache";
import { parseConventionGuide, loadConventions } from "../../lib/vegas-convention-feed";
import { pacificWeek } from "../../lib/vegas-listings";
import { loadTicketmaster, parseTicketmaster } from "../../lib/vegas-ticketmaster";

const NOW = new Date("2026-11-19T20:00:00-08:00");
const WEEK = pacificWeek(NOW);

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`../fixtures/vegas/${name}`, import.meta.url), "utf8"));
}

test("Pacific week starts on the Los Angeles date", () => {
  assert.deepEqual(WEEK, { start: "2026-11-19", end: "2026-11-25" });
  assert.equal(pacificWeek(new Date("2026-11-20T07:30:00Z")).start, "2026-11-19");
});

test("affiliate helper leaves links unchanged until an id is set", () => {
  const url = "https://www.ticketmaster.com/event/sports-1";
  assert.equal(withAffiliate(url, {}), url);
  assert.equal(withAffiliate("https://www.seatgeek.com/event/1", {}), "https://www.seatgeek.com/event/1");
  const tagged = withAffiliate(url, { TICKETMASTER_IMPACT_ID: "pub-1" });
  assert.match(tagged, /irpid=pub-1/);
  assert.match(withAffiliate("https://seatgeek.com/e/2", { SEATGEEK_AID: "aid-9" }), /aid=aid-9/);
});

test("Ticketmaster fixture splits sports, shows, and nightlife and drops next month", () => {
  const body = fixture("ticketmaster-events.json");
  const sports = parseTicketmaster(body, WEEK, "sports");
  const shows = parseTicketmaster(body, WEEK, "shows");
  const nightlife = parseTicketmaster(body, WEEK, "nightlife");
  assert.deepEqual(sports.map((item) => item.title), ["Sample Hockey Game"]);
  assert.equal(sports[0]?.venue, "T-Mobile Arena");
  assert.equal(sports[0]?.timeLabel.includes("PM") || sports[0]?.timeLabel.includes("pm"), true);
  assert.deepEqual(shows.map((item) => item.title), ["Sample Residency"]);
  assert.deepEqual(nightlife.map((item) => item.title), ["Sample Club Night"]);
  assert.equal(parseTicketmaster({ _embedded: { events: [] } }, WEEK, "sports").length, 0);
  assert.equal(parseTicketmaster(null, WEEK, "sports").length, 0);
});

test("Ticketmaster load stays honest without a key and on an error", async () => {
  clearVegasCache();
  let called = 0;
  const pending = await loadTicketmaster("sports", async () => {
    called += 1;
    return new Response("no");
  }, {}, NOW);
  assert.equal(pending.pending, true);
  assert.equal(pending.items.length, 0);
  assert.match(pending.note, /coming soon/i);
  assert.equal(called, 0);

  clearVegasCache();
  const failed = await loadTicketmaster(
    "sports",
    async () => new Response("nope", { status: 401 }),
    { TICKETMASTER_API_KEY: "test-key" },
    NOW,
  );
  assert.equal(failed.ok, false);
  assert.equal(failed.items.length, 0);
});

test("convention fixture keeps this week, skips January, and skips a show with no dates", () => {
  const parsed = parseConventionGuide(fixture("convention-shows.json"), WEEK);
  assert.deepEqual(parsed.items.map((item) => item.title), ["Sample Expo"]);
  assert.equal(parsed.items[0]?.venue, "Las Vegas Convention Center");
  assert.equal(parsed.items[0]?.timeLabel, "Time not listed");
  assert.match(parsed.note, /Confirm dates/);
  assert.equal(parseConventionGuide({}, WEEK).items.length, 0);
});

test("convention load reports a failed feed", async () => {
  clearVegasCache();
  const failed = await loadConventions(async () => new Response("down", { status: 503 }), NOW);
  assert.equal(failed.ok, false);
  assert.match(failed.note, /unavailable/);
});

test("Vegas Calendar fixture keeps the published venue and start", () => {
  const items = parseVegasCalendar(fixture("vegas-calendar.json"), WEEK);
  assert.equal(items.length, 1);
  assert.equal(items[0]?.title, "Ethel M Chocolates Holiday Cactus Garden");
  assert.equal(items[0]?.venue, "Ethel M Chocolates Botanical Cactus Garden");
  assert.equal(items[0]?.start, "2026-11-05T17:00:00-08:00");
  assert.equal(parseVegasCalendar({ data: [] }, WEEK).length, 0);
});

test("Vegas Calendar load reports a failed feed", async () => {
  clearVegasCache();
  const failed = await loadVegasCalendar(async () => {
    throw new Error("offline");
  }, NOW);
  assert.equal(failed.ok, false);
  assert.equal(failed.items.length, 0);
  assert.equal(failed.sourceLabel, "Events from Vegas Calendar");
});
