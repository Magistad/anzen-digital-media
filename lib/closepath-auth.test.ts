import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, issueSession, readSession, verifyPassword } from "./closepath-auth";

test("password hash rejects the wrong password", async () => {
  const stored = await hashPassword("maple-street");
  assert.equal(await verifyPassword("maple-street", stored), true);
  assert.equal(await verifyPassword("wrong-street", stored), false);
  assert.equal(await verifyPassword("maple-street", "scrypt$nope"), false);
});

test("session token expires and rejects tampering", () => {
  process.env.CLOSEPATH_SESSION_SECRET = "test-secret-that-is-long-enough";
  const now = Date.parse("2026-11-07T15:00:00Z");
  const token = issueSession("ada@email.test", now, 1000);
  assert.ok(token);
  assert.deepEqual(readSession(token, now + 500), { email: "ada@email.test" });
  assert.equal(readSession(token, now + 1000), null);
  const [body, sig] = token.split(".");
  assert.equal(readSession(`${body}.${sig?.slice(0, -2)}aa`, now + 500), null);
  const forged = Buffer.from(JSON.stringify({ v: 1, email: "other@email.test", exp: now + 10_000 })).toString("base64url");
  assert.equal(readSession(`${forged}.${sig}`, now), null);
});
