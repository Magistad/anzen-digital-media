import assert from "node:assert/strict";
import test from "node:test";
import { GET as bookGet } from "../app/api/closepath/calendar/book/route";
import { GET as calendarGet, POST as calendarPost } from "../app/api/closepath/calendar/route";
import { GET as feedGet } from "../app/closepath/cal/[token]/route";
import { issueSession } from "./closepath-auth";
import {
  authenticate,
  calendarFeedTokenFor,
  createAccount,
  emailForCalendarToken,
  findAccount,
  loadWorkspace,
  resetAccountPassword,
  saveWorkspace,
} from "./closepath-account";
import { emptyFile, emptyWorkspace, type Workspace } from "./closepath-model";
import { memoryStore, setClosepathStore } from "./closepath-store";

test.before(() => {
  process.env.CLOSEPATH_SESSION_SECRET = "test-secret-that-is-long-enough";
});

test.beforeEach(() => {
  setClosepathStore(memoryStore());
});

test.after(() => {
  setClosepathStore(null);
});

test("a buyer can sign in and keep a file on another read", async () => {
  await createAccount({ email: "ada@email.test", password: "maple-street", stripeSessionId: "cs_test_123" });
  const signed = await authenticate("Ada@email.test", "maple-street");
  assert.deepEqual(signed, { ok: true, email: "ada@email.test" });
  const workspace: Workspace = {
    ...emptyWorkspace(),
    files: [
      {
        ...emptyWorkspace().files[0],
        id: "file-1234",
        address: "123 Test Lane",
        side: "Buyer",
        client: "Ada Lane",
        phone: "",
        email: "",
        source: "",
        status: "Under contract",
        outcome: "Open",
        listPrice: null,
        contractPrice: 200000,
        notes: "",
        propertyOrSearch: "",
        firstContact: null,
        nextFollowUp: null,
        leadStatus: "",
        leadNotes: "",
        contractDate: null,
        inspectionDeadline: "2026-11-09",
        appraisalDeadline: null,
        loanContingency: null,
        closeDate: null,
        dateNotes: "",
        showings: [],
        offers: [],
        salePrice: null,
        ratePercent: null,
        splitPercent: null,
        paidDate: null,
        commissionStatus: "",
        commissionNotes: "",
      },
    ],
  };
  await saveWorkspace("ada@email.test", workspace);
  const loaded = await loadWorkspace("ada@email.test");
  assert.equal(loaded.files[0]?.address, "123 Test Lane");
  assert.equal(loaded.files[0]?.inspectionDeadline, "2026-11-09");
});

test("unknown email cannot sign in", async () => {
  const result = await authenticate("nobody@email.test", "maple-street");
  assert.deepEqual(result, { ok: false, reason: "invalid" });
  assert.equal(await findAccount("nobody@email.test"), null);
});

test("a subscription id stays on the account and a password reset can replace it", async () => {
  await createAccount({
    email: "ada@email.test",
    password: "maple-street",
    stripeSessionId: "cs_test_123",
    stripeSubscriptionId: "sub_oldsubscriber",
    stripeCustomerId: "cus_oldsubscriber",
  });
  const first = await findAccount("ada@email.test");
  assert.equal(first?.stripeSubscriptionId, "sub_oldsubscriber");
  assert.equal(first?.stripeCustomerId, "cus_oldsubscriber");
  await resetAccountPassword("ada@email.test", "cedar-avenue", "cs_test_456");
  const kept = await findAccount("ada@email.test");
  assert.equal(kept?.stripeSubscriptionId, "sub_oldsubscriber");
  await resetAccountPassword("ada@email.test", "oak-street", "cs_test_789", {
    stripeSubscriptionId: "sub_newsubscriber",
    stripeCustomerId: "cus_newsubscriber",
  });
  const next = await findAccount("ada@email.test");
  assert.equal(next?.stripeSubscriptionId, "sub_newsubscriber");
  assert.equal(next?.stripeCustomerId, "cus_newsubscriber");
});

test("a new password keeps the book", async () => {
  await createAccount({ email: "ada@email.test", password: "maple-street", stripeSessionId: "cs_test_123" });
  await saveWorkspace("ada@email.test", {
    ...emptyWorkspace(),
    examplesDismissed: true,
    files: [],
    leads: [],
  });
  const book = await loadWorkspace("ada@email.test");
  book.examplesDismissed = true;
  await saveWorkspace("ada@email.test", book);
  await resetAccountPassword("ada@email.test", "cedar-avenue", "cs_test_456");
  const again = await authenticate("ada@email.test", "maple-street");
  assert.equal(again.ok, false);
  const next = await authenticate("ada@email.test", "cedar-avenue");
  assert.equal(next.ok, true);
  const loaded = await loadWorkspace("ada@email.test");
  assert.equal(loaded.examplesDismissed, true);
});

test("eight wrong passwords lock the book for fifteen minutes", async () => {
  await createAccount({ email: "ada@email.test", password: "maple-street", stripeSessionId: "cs_test_123" });
  const now = Date.parse("2026-11-07T15:00:00Z");
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const result = await authenticate("ada@email.test", "nope-nope", now);
    assert.equal(result.ok, false);
  }
  const locked = await authenticate("ada@email.test", "maple-street", now + 1000);
  assert.deepEqual(locked, { ok: false, reason: "locked" });
  const later = await authenticate("ada@email.test", "maple-street", now + 16 * 60 * 1000);
  assert.equal(later.ok, true);
});

function sessionRequest(path: string, token: string | null, body?: string): Request {
  const headers = new Headers({
    origin: "http://localhost:3000",
    host: "localhost:3000",
    "content-type": "application/json",
  });
  if (token) headers.set("cookie", `closepath_session=${token}`);
  return new Request(`http://localhost:3000${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers,
    body,
  });
}

test("a private calendar feed follows the book and dies when the link is replaced", async () => {
  await createAccount({ email: "ada@email.test", password: "maple-street", stripeSessionId: "cs_test_123" });
  const file = emptyFile("file-live1");
  file.address = "10 Main Street";
  file.client = "Ada Lane";
  file.phone = "555-0100";
  file.inspectionDeadline = "2026-11-12";
  file.outcome = "Open";
  const sample = emptyFile("sample-maple");
  sample.example = true;
  sample.address = "1842 Maple Street";
  sample.inspectionDeadline = "2026-11-09";
  await saveWorkspace("ada@email.test", { ...emptyWorkspace(), files: [file, sample] });
  const token = issueSession("ada@email.test");
  assert.ok(token);

  const denied = await calendarPost(sessionRequest("/api/closepath/calendar", null, JSON.stringify({ action: "enable" })));
  assert.equal(denied.status, 401);
  const foreign = sessionRequest("/api/closepath/calendar", token, JSON.stringify({ action: "enable" }));
  foreign.headers.set("origin", "https://evil.example");
  const blocked = await calendarPost(foreign);
  assert.equal(blocked.status, 403);

  const created = await calendarPost(sessionRequest("/api/closepath/calendar", token, JSON.stringify({ action: "enable" })));
  assert.equal(created.status, 200);
  const body = (await created.json()) as { enabled: boolean; url: string };
  assert.equal(body.enabled, true);
  assert.match(body.url, /^http:\/\/localhost:3000\/closepath\/cal\/[A-Za-z0-9_-]{43}\.ics$/);
  const feedToken = body.url.split("/").pop()?.replace(/\.ics$/, "") ?? "";
  assert.equal(await emailForCalendarToken(feedToken), "ada@email.test");

  const feed = await feedGet(new Request(body.url), { params: { token: `${feedToken}.ics` } });
  assert.equal(feed.status, 200);
  assert.match(feed.headers.get("content-type") ?? "", /text\/calendar/);
  const ics = await feed.text();
  assert.match(ics, /DTSTART;VALUE=DATE:20261112/);
  assert.match(ics, /10 Main Street/);
  assert.doesNotMatch(ics, /Maple Street/);
  assert.doesNotMatch(ics, /555-0100/);

  file.inspectionDeadline = "2026-11-18";
  await saveWorkspace("ada@email.test", { ...emptyWorkspace(), files: [file, sample] });
  assert.equal(await calendarFeedTokenFor("ada@email.test"), feedToken);
  const updated = await feedGet(new Request(body.url), { params: { token: feedToken } });
  assert.match(await updated.text(), /DTSTART;VALUE=DATE:20261118/);

  const book = await bookGet(sessionRequest("/api/closepath/calendar/book", token));
  assert.equal(book.status, 200);
  assert.match(book.headers.get("content-disposition") ?? "", /attachment/);
  assert.match(await book.text(), /20261118/);
  const signedOut = await bookGet(sessionRequest("/api/closepath/calendar/book", null));
  assert.equal(signedOut.status, 303);

  const rotated = await calendarPost(sessionRequest("/api/closepath/calendar", token, JSON.stringify({ action: "rotate" })));
  const next = (await rotated.json()) as { url: string };
  const nextToken = next.url.split("/").pop()?.replace(/\.ics$/, "") ?? "";
  assert.notEqual(nextToken, feedToken);
  assert.equal((await feedGet(new Request(body.url), { params: { token: `${feedToken}.ics` } })).status, 404);
  assert.equal((await feedGet(new Request(next.url), { params: { token: `${nextToken}.ics` } })).status, 200);

  const stopped = await calendarPost(sessionRequest("/api/closepath/calendar", token, JSON.stringify({ action: "revoke" })));
  const after = (await stopped.json()) as { enabled: boolean; url: string | null };
  assert.equal(after.enabled, false);
  assert.equal(after.url, null);
  assert.equal((await feedGet(new Request(next.url), { params: { token: `${nextToken}.ics` } })).status, 404);
  assert.equal((await feedGet(new Request("http://localhost:3000/closepath/cal/nope.ics"), { params: { token: "nope.ics" } })).status, 404);

  const status = await calendarGet(sessionRequest("/api/closepath/calendar", token));
  assert.deepEqual(await status.json(), { enabled: false, url: null });
});
