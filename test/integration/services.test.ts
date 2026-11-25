import assert from "node:assert/strict";
import test from "node:test";
import { POST as checkout } from "../../app/api/services/checkout/route";
import { POST as intake } from "../../app/api/services/intake/route";
import { memoryStore } from "../../lib/closepath-store";
import { getServiceOrder } from "../../lib/service-orders";
import { setServiceStore } from "../../lib/service-store";
import { resetStripeClient } from "../../lib/stripe";
import { bindTestStripe } from "../bind-stripe";
import { TEST_EMAIL, TEST_ORIGIN, TEST_PRICE_ID, TEST_SESSION_ID } from "../constants";
import { formRequest } from "./http";

let mock: Awaited<ReturnType<typeof bindTestStripe>>;

test.before(async () => {
  mock = await bindTestStripe();
  setServiceStore(memoryStore());
});

test.after(async () => {
  setServiceStore(null);
  await mock.unbind();
});

function usePrice(name: string) {
  process.env[name] = TEST_PRICE_ID;
  resetStripeClient();
}

function clearPrice(name: string) {
  delete process.env[name];
  resetStripeClient();
}

test("grant checkout redirects to Stripe when the one-time price matches", async () => {
  mock.setPriceAmount(14900);
  mock.setPriceRecurring(false);
  usePrice("STRIPE_PRICE_GRANT_MATCH");
  try {
    const response = await checkout(formRequest("/api/services/checkout", { offer: "grant-match" }));
    assert.equal(response.status, 303);
    const location = response.headers.get("location") ?? "";
    assert.equal(location.startsWith("https://checkout.stripe.com/"), true);
    assert.equal(location.includes(TEST_SESSION_ID), true);
  } finally {
    clearPrice("STRIPE_PRICE_GRANT_MATCH");
    mock.setPriceAmount(999);
    mock.setPriceRecurring(true);
  }
});

test("a recurring price is rejected for a one-time report", async () => {
  mock.setPriceAmount(14900);
  mock.setPriceRecurring(true);
  usePrice("STRIPE_PRICE_GRANT_MATCH");
  try {
    const response = await checkout(formRequest("/api/services/checkout", { offer: "grant-match" }));
    assert.equal(response.status, 303);
    assert.equal(
      response.headers.get("location"),
      `${TEST_ORIGIN}/services/grant-match-report?checkout=unavailable`,
    );
  } finally {
    clearPrice("STRIPE_PRICE_GRANT_MATCH");
    mock.setPriceAmount(999);
  }
});

test("checkout stays closed when the price env is unset", async () => {
  const response = await checkout(formRequest("/api/services/checkout", { offer: "trademark-name" }));
  assert.equal(response.status, 303);
  assert.equal(
    response.headers.get("location"),
    `${TEST_ORIGIN}/services/trademark-search-report?checkout=unavailable`,
  );
});

test("the native shell cannot start a service checkout", async () => {
  const response = await checkout(
    new Request(`${TEST_ORIGIN}/api/services/checkout`, {
      method: "POST",
      headers: {
        host: "127.0.0.1:3210",
        origin: TEST_ORIGIN,
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": "Mozilla/5.0 ClosepathNative/1 (ios)",
      },
      body: "offer=grant-match",
    }),
  );
  assert.equal(response.status, 303);
  assert.equal(new URL(response.headers.get("location") ?? "").pathname, "/closepath/sign-in");
});

test("a paid session can submit intake once", async () => {
  mock.setSessionPatch({
    metadata: { product: "service", offer: "grant-match", service: "grant-match-report" },
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    amount_total: 14900,
    customer_details: { email: TEST_EMAIL, name: null, phone: null },
    success_url: `${TEST_ORIGIN}/services/intake?session_id={CHECKOUT_SESSION_ID}`,
  });
  try {
    const response = await intake(
      formRequest("/api/services/intake", {
        session_id: TEST_SESSION_ID,
        deliveryEmail: TEST_EMAIL,
        business: "Example LLC",
        entity: "Limited-liability company",
        state: "Nevada",
        activity: "Makes signs",
        years: "3",
        employees: "2",
        revenue: "Under $500,000",
        use: "A new printer",
        acknowledge: "yes",
      }),
    );
    assert.equal(response.status, 303);
    assert.equal(
      response.headers.get("location"),
      `${TEST_ORIGIN}/services/received?session_id=${encodeURIComponent(TEST_SESSION_ID)}`,
    );
    const order = await getServiceOrder(TEST_SESSION_ID);
    assert.equal(order?.offerId, "grant-match");
    assert.equal(order?.intake?.answers.business, "Example LLC");
    assert.equal(order?.confirmation, "pending_configuration");
  } finally {
    mock.setSessionPatch(null);
  }
});
