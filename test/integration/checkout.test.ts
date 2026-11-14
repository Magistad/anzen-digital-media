import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../../app/api/checkout/route";
import { resetStripeClient } from "../../lib/stripe";
import { bindTestStripe } from "../bind-stripe";
import { TEST_ORIGIN, TEST_SESSION_ID } from "../constants";
import { formRequest } from "./http";

let mock: Awaited<ReturnType<typeof bindTestStripe>>;

test.before(async () => {
  mock = await bindTestStripe();
});

test.after(async () => {
  await mock.unbind();
});

test("checkout creates a hosted session for the monthly price", async () => {
  const response = await POST(formRequest("/api/checkout"));
  assert.equal(response.status, 303);
  const location = response.headers.get("location") ?? "";
  assert.equal(location.startsWith("https://checkout.stripe.com/"), true);
  assert.equal(location.includes(TEST_SESSION_ID), true);
  assert.equal(
    mock.calls.some((call) => call.method === "POST" && call.path === "/v1/checkout/sessions"),
    true,
  );
});

test("a foreign origin does not start checkout", async () => {
  const before = mock.calls.length;
  const response = await POST(formRequest("/api/checkout", {}, "https://evil.example"));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), `${TEST_ORIGIN}/products/closepath?checkout=unavailable`);
  assert.equal(mock.calls.length, before);
});

test("checkout refuses a price that is not the monthly Closepath price", async () => {
  mock.setPriceAmount(5900);
  try {
    const response = await POST(formRequest("/api/checkout"));
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), `${TEST_ORIGIN}/products/closepath?checkout=unavailable`);
  } finally {
    mock.setPriceAmount(999);
  }
});

test("checkout is unavailable when Stripe is not configured", async () => {
  const previous = process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_SECRET_KEY;
  resetStripeClient();
  try {
    const response = await POST(formRequest("/api/checkout"));
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), `${TEST_ORIGIN}/products/closepath?checkout=unavailable`);
  } finally {
    if (previous === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previous;
    resetStripeClient();
  }
});
