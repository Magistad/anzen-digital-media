import assert from "node:assert/strict";
import test from "node:test";
import Stripe from "stripe";
import { POST } from "../../app/api/stripe/webhook/route";
import { TEST_SESSION_ID, TEST_STRIPE_KEY, TEST_SUBSCRIPTION_ID, TEST_WEBHOOK_SECRET } from "../constants";
import { bindTestStripe } from "../bind-stripe";

const signer = new Stripe(TEST_STRIPE_KEY, { telemetry: false, maxNetworkRetries: 0 });
let mock: Awaited<ReturnType<typeof bindTestStripe>>;

test.before(async () => {
  mock = await bindTestStripe();
});

test.after(async () => {
  await mock.unbind();
});

function signedRequest(payload: string, secret = TEST_WEBHOOK_SECRET): Request {
  const signature = signer.webhooks.generateTestHeaderString({ payload, secret });
  return new Request("http://127.0.0.1:3210/api/stripe/webhook", {
    method: "POST",
    headers: {
      host: "127.0.0.1:3210",
      "stripe-signature": signature,
      "content-type": "application/json",
    },
    body: payload,
  });
}

function event(type: string, object: Record<string, unknown>): string {
  return JSON.stringify({
    id: `evt_test_${type.replace(/\W/g, "_")}`,
    object: "event",
    type,
    data: { object },
  });
}

test("a signed trial checkout unlocks the subscription", async () => {
  const payload = event("checkout.session.completed", {
    id: TEST_SESSION_ID,
    object: "checkout.session",
    metadata: { product: "closepath" },
  });
  const response = await POST(signedRequest(payload));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { received: true });
  assert.equal(mock.subscription(TEST_SUBSCRIPTION_ID)?.metadata.fulfillment, "unlocked");
});

test("a canceled subscription closes the book", async () => {
  const payload = event("customer.subscription.deleted", {
    id: "sub_deletedtest",
    object: "subscription",
    status: "canceled",
    metadata: { product: "closepath" },
  });
  const response = await POST(signedRequest(payload));
  assert.equal(response.status, 200);
  assert.equal(mock.subscription("sub_deletedtest")?.metadata.fulfillment, "failed");
});

test("a subscription update keeps a trialing book open", async () => {
  const payload = event("customer.subscription.updated", {
    id: TEST_SUBSCRIPTION_ID,
    object: "subscription",
    status: "trialing",
    metadata: { product: "closepath", fulfillment: "unlocked" },
  });
  const response = await POST(signedRequest(payload));
  assert.equal(response.status, 200);
  assert.equal(mock.subscription(TEST_SUBSCRIPTION_ID)?.metadata.fulfillment, "unlocked");
});

test("another product is ignored", async () => {
  const before = mock.calls.length;
  const payload = event("checkout.session.completed", {
    id: "cs_test_other_product",
    object: "checkout.session",
    metadata: { product: "other" },
  });
  const response = await POST(signedRequest(payload));
  assert.equal(response.status, 200);
  assert.equal(mock.calls.length, before);
});

test("a bad signature is rejected", async () => {
  const payload = event("checkout.session.completed", {
    id: TEST_SESSION_ID,
    object: "checkout.session",
    metadata: { product: "closepath" },
  });
  const response = await POST(signedRequest(payload, "whsec_test_wrong_secret"));
  assert.equal(response.status, 400);
});

test("a missing signature is rejected", async () => {
  const response = await POST(
    new Request("http://127.0.0.1:3210/api/stripe/webhook", {
      method: "POST",
      headers: { host: "127.0.0.1:3210" },
      body: "{}",
    }),
  );
  assert.equal(response.status, 400);
});
