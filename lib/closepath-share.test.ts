import assert from "node:assert/strict";
import test from "node:test";
import { emptyFile } from "./closepath-model";
import { sampleFiles } from "./closepath-samples";
import { dealSummaryText, linkBody, mailtoHref, shareSubject, smsHref } from "./closepath-share";

test("a deal summary is plain text with the facts an agent would forward", () => {
  const file = sampleFiles()[0];
  assert.ok(file);
  const text = dealSummaryText(file);
  assert.match(text, /^1842 Maple Street\nListing · Under contract\nElena Vasquez/);
  assert.match(text, /List price: \$425,000/);
  assert.match(text, /Contract price: \$418,000/);
  assert.match(text, /Inspection deadline: Nov 9, 2026/);
  assert.match(text, /Close date: Nov 30, 2026/);
  assert.match(text, /Showings\nOct 28, 2026 · 2:00 PM · Completed/);
  assert.match(text, /Offers\nOct 30, 2026 · Accepted\nOffer \$418,000 · Earnest \$8,000/);
  assert.match(text, /From Closepath$/);
  assert.doesNotMatch(text, /555-0148/);
  assert.doesNotMatch(text, /elena\.example/);
  assert.doesNotMatch(text, /\$6,270/);
  assert.doesNotMatch(text, /3% listing/);
  assert.equal(shareSubject(file), "1842 Maple Street");
});

test("text and email links carry the summary and stay openable", () => {
  const file = emptyFile("file-live1");
  file.address = "10 Main Street";
  file.side = "Buyer";
  file.status = "Showing";
  const text = dealSummaryText(file);
  assert.match(text, /10 Main Street\nBuyer · Showing/);
  assert.doesNotMatch(text, /Critical dates/);
  assert.doesNotMatch(text, /Showings/);
  const sms = smsHref(text);
  const mail = mailtoHref(shareSubject(file), text);
  assert.match(sms, /^sms:\?&body=10%20Main%20Street/);
  assert.match(mail, /^mailto:\?subject=10%20Main%20Street&body=/);
  assert.match(mail, /From%20Closepath/);
  const long = "a".repeat(2000);
  const shortened = linkBody(long);
  assert.ok(shortened.length <= 1500);
  assert.ok(shortened.endsWith("…"));
  assert.ok(smsHref(long).length < 4500);
});

test("a closed file says so, and an empty file still has a summary", () => {
  const closed = emptyFile("file-shut1");
  closed.address = "1 Closed Lane";
  closed.outcome = "Closed";
  closed.status = "Clear to close";
  assert.match(dealSummaryText(closed), /Clear to close · Closed/);
  const empty = emptyFile("file-empty1");
  assert.equal(dealSummaryText(empty), "No address yet\n\nFrom Closepath");
  assert.equal(shareSubject(empty), "Closepath deal");
});
