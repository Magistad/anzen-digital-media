import assert from "node:assert/strict";
import test from "node:test";
import {
  authenticate,
  checkoutAccountAction,
  checkoutMayResetExistingAccount,
  createAccount,
  findAccount,
  loadWorkspace,
  resetAccountPassword,
  saveWorkspace,
} from "./closepath-account";
import { emptyWorkspace, type Workspace } from "./closepath-model";
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

test("a checkout session cannot reset or rebind an existing account", () => {
  const existing = {
    accountEmail: "ada@email.test",
    checkoutEmail: "ada@email.test",
    signedInEmail: null,
    emailVerified: false,
  };
  assert.equal(checkoutMayResetExistingAccount(existing), false);
  assert.equal(checkoutAccountAction({ ...existing, accountExists: true, resetRequested: true }), "refuse");
  assert.equal(
    checkoutAccountAction({ ...existing, accountExists: true, resetRequested: false }),
    "refuse",
  );
  assert.equal(
    checkoutMayResetExistingAccount({ ...existing, signedInEmail: "other@email.test" }),
    false,
  );
  assert.equal(
    checkoutAccountAction({
      ...existing,
      accountExists: true,
      resetRequested: true,
      signedInEmail: "Ada@email.test",
    }),
    "reset",
  );
  assert.equal(
    checkoutAccountAction({
      ...existing,
      accountExists: true,
      resetRequested: true,
      emailVerified: true,
    }),
    "reset",
  );
  assert.equal(
    checkoutMayResetExistingAccount({
      accountEmail: "ada@email.test",
      checkoutEmail: "other@email.test",
      signedInEmail: "ada@email.test",
      emailVerified: true,
    }),
    false,
  );
  assert.equal(
    checkoutAccountAction({
      accountExists: false,
      accountEmail: "new@email.test",
      checkoutEmail: "new@email.test",
      signedInEmail: null,
      resetRequested: true,
    }),
    "create",
  );
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
