import assert from "node:assert/strict";
import test from "node:test";
import type Stripe from "stripe";
import { fulfillmentAnchor } from "./fulfillment";
import {
  CLOSEPATH_PRODUCT_ID,
  CLOSEPATH_RETIRED_PRICE_ID,
  closepathPriceId,
  isClosepathMonthlyPrice,
} from "./closepath";
import {
  isPaidClosepathCheckout,
  isPaidClosepathSubscription,
  isRetiredClosepathPayment,
  subscriptionGrantsBook,
} from "./closepath-order";

const MONTHLY_PRICE = "price_monthly_test";

function session(partial: Record<string, unknown>): Stripe.Checkout.Session {
  return partial as unknown as Stripe.Checkout.Session;
}

function monthlySession(overrides: Record<string, unknown> = {}): Stripe.Checkout.Session {
  return session({
    id: "cs_test_monthly",
    mode: "subscription",
    payment_status: "paid",
    currency: "usd",
    amount_subtotal: 999,
    amount_total: 999,
    metadata: { product: "closepath" },
    subscription: "sub_monthlytest",
    customer: "cus_monthlytest",
    payment_intent: null,
    line_items: {
      data: [
        {
          quantity: 1,
          price: {
            id: MONTHLY_PRICE,
            unit_amount: 999,
            currency: "usd",
            product: CLOSEPATH_PRODUCT_ID,
            recurring: { interval: "month", interval_count: 1 },
          },
        },
      ],
    },
    ...overrides,
  });
}

test("subscription statuses that keep the book", () => {
  assert.equal(subscriptionGrantsBook("active"), true);
  assert.equal(subscriptionGrantsBook("trialing"), true);
  assert.equal(subscriptionGrantsBook("past_due"), true);
  for (const status of ["canceled", "unpaid", "incomplete", "incomplete_expired", "paused"]) {
    assert.equal(subscriptionGrantsBook(status), false, status);
  }
});

test("monthly price check is $9.99 usd every month on the Closepath product", () => {
  assert.equal(
    isClosepathMonthlyPrice({
      active: true,
      currency: "usd",
      unit_amount: 999,
      product: CLOSEPATH_PRODUCT_ID,
      recurring: { interval: "month", interval_count: 1 },
    }),
    true,
  );
  assert.equal(
    isClosepathMonthlyPrice({
      active: true,
      currency: "usd",
      unit_amount: 5900,
      product: CLOSEPATH_PRODUCT_ID,
      recurring: null,
    }),
    false,
  );
  assert.equal(
    isClosepathMonthlyPrice({
      active: true,
      currency: "usd",
      unit_amount: 999,
      product: CLOSEPATH_PRODUCT_ID,
      recurring: { interval: "year", interval_count: 1 },
    }),
    false,
  );
});

test("a paid subscription session unlocks only at the env monthly price", () => {
  const previous = process.env.STRIPE_PRICE_ID;
  process.env.STRIPE_PRICE_ID = MONTHLY_PRICE;
  try {
    const paid = monthlySession();
    assert.equal(closepathPriceId(), MONTHLY_PRICE);
    assert.equal(isPaidClosepathSubscription(paid), true);
    assert.equal(isPaidClosepathCheckout(paid), true);
    assert.equal(fulfillmentAnchor(paid), "subscription");
    assert.equal(isPaidClosepathSubscription(monthlySession({ amount_subtotal: 5900 })), false);
    assert.equal(isPaidClosepathSubscription(monthlySession({ mode: "payment" })), false);
    assert.equal(isPaidClosepathSubscription(monthlySession({ payment_status: "unpaid" })), false);
    assert.equal(isPaidClosepathSubscription(monthlySession({ payment_status: "no_payment_required" })), false);
    assert.equal(isPaidClosepathSubscription(monthlySession({ subscription: null })), false);
    delete process.env.STRIPE_PRICE_ID;
    assert.equal(closepathPriceId(), null);
    assert.equal(isPaidClosepathSubscription(paid), false);
  } finally {
    if (previous === undefined) delete process.env.STRIPE_PRICE_ID;
    else process.env.STRIPE_PRICE_ID = previous;
  }
});

test("a retired one-time payment can still be recognized and is not the checkout price", () => {
  const previous = process.env.STRIPE_PRICE_ID;
  delete process.env.STRIPE_PRICE_ID;
  try {
    const retired = session({
      id: "cs_test_retired",
      mode: "payment",
      payment_status: "paid",
      currency: "usd",
      amount_total: 5900,
      metadata: { product: "closepath" },
      payment_intent: "pi_retiredpayment",
      subscription: null,
      line_items: {
        data: [
          {
            quantity: 1,
            price: {
              id: CLOSEPATH_RETIRED_PRICE_ID,
              unit_amount: 5900,
              currency: "usd",
              product: CLOSEPATH_PRODUCT_ID,
              recurring: null,
            },
          },
        ],
      },
    });
    assert.equal(isRetiredClosepathPayment(retired), true);
    assert.equal(isPaidClosepathCheckout(retired), true);
    assert.equal(isPaidClosepathSubscription(retired), false);
    assert.equal(fulfillmentAnchor(retired), "payment_intent");
    assert.notEqual(closepathPriceId(), CLOSEPATH_RETIRED_PRICE_ID);
  } finally {
    if (previous === undefined) delete process.env.STRIPE_PRICE_ID;
    else process.env.STRIPE_PRICE_ID = previous;
  }
});
