import assert from "node:assert/strict";
import test from "node:test";
import { sampleFiles } from "./closepath-samples";
import { emptyFile, emptyOffer, emptyShowing } from "./closepath-model";
import {
  addIsoDays,
  appleSubscribeUrl,
  buildIcs,
  calendarFilename,
  feedCalendarEvents,
  fileCalendarEvents,
  googleEventUrl,
  googleSubscribeUrl,
  outlookEventUrl,
  outlookSubscribeUrl,
  unfoldIcs,
} from "./closepath-calendar";

const STAMP = new Date("2026-11-10T15:04:00Z");

test("all-day dates step across month ends", () => {
  assert.equal(addIsoDays("2026-11-30", 1), "2026-12-01");
  assert.equal(addIsoDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addIsoDays("2026-02-29", 1), null);
});

test("a file calendar lists critical dates, showings, and offer deadlines", () => {
  const file = sampleFiles()[0];
  assert.ok(file);
  const events = fileCalendarEvents(file);
  const labels = events.map((event) => event.label);
  assert.ok(labels.includes("Inspection deadline"));
  assert.ok(labels.includes("Loan contingency"));
  assert.ok(labels.includes("Close date"));
  assert.ok(labels.includes("Showing"));
  assert.ok(labels.includes("Offer expires"));
  assert.ok(labels.includes("Next follow-up"));
  const inspection = events.find((event) => event.key === "inspectionDeadline");
  assert.equal(inspection?.date, "2026-11-09");
  assert.match(inspection?.summary ?? "", /Inspection deadline/);
  assert.match(inspection?.summary ?? "", /1842 Maple Street/);
  assert.equal(inspection?.location, "1842 Maple Street");
  assert.doesNotMatch(inspection?.description ?? "", /555-0148/);
  assert.doesNotMatch(inspection?.description ?? "", /elena\.example/);
});

test("the subscribed calendar skips samples and files that are not open", () => {
  const [maple, cedar] = sampleFiles();
  assert.ok(maple && cedar);
  const live = emptyFile("file-live1");
  live.address = "10 Main Street, Unit 2";
  live.client = "Ada Lane";
  live.phone = "555-0100";
  live.email = "ada@email.test";
  live.inspectionDeadline = "2026-11-12";
  live.outcome = "Open";
  const closed = emptyFile("file-shut1");
  closed.address = "1 Closed Lane";
  closed.outcome = "Closed";
  closed.closeDate = "2026-11-01";
  const showing = emptyShowing("show-live1");
  showing.date = "2026-11-11";
  showing.time = "2:00 PM";
  live.showings = [showing];
  const offer = emptyOffer("offer-liv1");
  offer.expires = "2026-11-13";
  offer.status = "Submitted";
  live.offers = [offer];
  const events = feedCalendarEvents([maple, cedar, live, closed]);
  assert.equal(events.length, 3);
  assert.deepEqual(
    events.map((event) => event.date),
    ["2026-11-11", "2026-11-12", "2026-11-13"],
  );
  const ics = buildIcs(events, { stamp: STAMP });
  assert.match(ics, /10 Main Street\\, Unit 2/);
  assert.doesNotMatch(ics, /Maple Street/);
  assert.doesNotMatch(ics, /Closed Lane/);
  assert.doesNotMatch(ics, /555-0100/);
  assert.doesNotMatch(ics, /ada@email\.test/);
  assert.match(ics, /DTSTART;VALUE=DATE:20261112/);
  assert.match(ics, /DTEND;VALUE=DATE:20261113/);
  assert.match(ics, /DTSTAMP:20261110T150400Z/);
  for (const line of ics.split("\r\n")) {
    assert.ok(Buffer.byteLength(line, "utf8") <= 75, line);
  }
  const summary = unfoldIcs(ics).find((line) => line.startsWith("SUMMARY:"));
  assert.match(summary ?? "", /10 Main Street\\, Unit 2/);
  const long = emptyFile("file-long01");
  long.address = "A".repeat(120);
  long.inspectionDeadline = "2026-11-12";
  const folded = buildIcs(fileCalendarEvents(long), { stamp: STAMP });
  assert.match(folded, /\r\n /);
  const logical = unfoldIcs(folded).find((line) => line.startsWith("SUMMARY:"));
  assert.equal(logical, `SUMMARY:Inspection deadline · ${"A".repeat(120)}`);
});

test("google and outlook links use the deadline day", () => {
  const file = emptyFile("file-live1");
  file.address = "10 Main Street";
  file.inspectionDeadline = "2026-11-12";
  const event = fileCalendarEvents(file)[0];
  assert.ok(event);
  const google = googleEventUrl(event);
  assert.match(google, /^https:\/\/calendar\.google\.com\/calendar\/render\?/);
  assert.match(google, /dates=20261112%2F20261113/);
  assert.match(google, /action=TEMPLATE/);
  const outlook = outlookEventUrl(event);
  assert.match(outlook, /^https:\/\/outlook\.live\.com\/calendar\/0\/deeplink\/compose\?/);
  assert.match(outlook, /startdt=2026-11-12/);
  assert.match(outlook, /enddt=2026-11-12/);
  assert.match(outlook, /allday=true/);
  assert.equal(calendarFilename("Inspection deadline"), "closepath-inspection-deadline.ics");
});

test("subscribe links point at the private feed", () => {
  const feed = "https://anzendigitalmedia.com/closepath/cal/abc.ics";
  assert.equal(appleSubscribeUrl(feed), "webcal://anzendigitalmedia.com/closepath/cal/abc.ics");
  assert.match(googleSubscribeUrl(feed), /^https:\/\/calendar\.google\.com\/calendar\/render\?cid=webcal%3A%2F%2F/);
  assert.match(outlookSubscribeUrl(feed), /^https:\/\/outlook\.live\.com\/owa\?/);
  assert.match(outlookSubscribeUrl(feed), /rru=addsubscription/);
  assert.match(outlookSubscribeUrl(feed), /name=Closepath/);
});

test("an empty book is still a valid calendar", () => {
  const ics = buildIcs([], { stamp: STAMP });
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /END:VCALENDAR/);
  assert.doesNotMatch(ics, /BEGIN:VEVENT/);
});
