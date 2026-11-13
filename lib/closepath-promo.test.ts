import assert from "node:assert/strict";
import test from "node:test";
import type Stripe from "stripe";
import { CLOSEPATH_PRODUCT_ID, closepathCheckoutSessionFields } from "./closepath";
import {
  CLOSEPATH_PROMO_ERROR,
  decideClosepathPromotion,
  promoFailureKind,
  readPromoInput,
  snapshotPromotionCode,
  type CouponSnapshot,
  type PromotionSnapshot,
} from "./closepath-promo";

const NOW = Date.UTC(2026, 10, 13);

function coupon(overrides: Partial<CouponSnapshot> = {}): CouponSnapshot {
  return {
    deleted: false,
    valid: true,
    percentOff: 100,
    amountOff: null,
    currency: null,
    duration: "forever",
    durationInMonths: null,
    maxRedemptions: null,
    timesRedeemed: 0,
    redeemBy: null,
    appliesToProducts: null,
    ...overrides,
  };
}

function promo(overrides: Partial<PromotionSnapshot> = {}, couponOverrides: Partial<CouponSnapshot> = {}): PromotionSnapshot {
  return {
    id: "promo_full",
    active: true,
    expiresAt: null,
    maxRedemptions: 2,
    timesRedeemed: 0,
    customerRestricted: false,
    minimumAmount: null,
    minimumAmountCurrency: null,
    coupon: coupon(couponOverrides),
    ...overrides,
  };
}

test("a blank promo is ignored and a malformed one is a friendly error", () => {
  assert.deepEqual(readPromoInput("  "), { kind: "absent" });
  assert.deepEqual(readPromoInput(""), { kind: "absent" });
  assert.deepEqual(readPromoInput("bad code"), { kind: "invalid" });
  assert.deepEqual(readPromoInput("nope!"), { kind: "invalid" });
  assert.equal(readPromoInput(`${"a".repeat(65)}`).kind, "invalid");
  assert.deepEqual(readPromoInput(" save-100 "), { kind: "code", code: "save-100" });
  assert.match(CLOSEPATH_PROMO_ERROR, /isn’t valid/);
  assert.equal(CLOSEPATH_PROMO_ERROR.includes("500"), false);
});

test("a valid 100% code builds a no-card checkout session with that discount", () => {
  const forever = decideClosepathPromotion([promo()], NOW);
  assert.deepEqual(forever, { ok: true, promotionCodeId: "promo_full", waiveCard: true });
  const fields = closepathCheckoutSessionFields("price_monthly_test", "https://anzendigitalmedia.com", {
    promotionCodeId: forever.ok ? forever.promotionCodeId : "",
    waiveCard: forever.ok ? forever.waiveCard : false,
  });
  assert.equal(fields.payment_method_collection, "if_required");
  assert.deepEqual(fields.discounts, [{ promotion_code: "promo_full" }]);
  assert.equal(fields.subscription_data?.trial_period_days, undefined);

  const repeating = decideClosepathPromotion(
    [promo({ id: "promo_months" }, { duration: "repeating", durationInMonths: 3 })],
    NOW,
  );
  assert.deepEqual(repeating, { ok: true, promotionCodeId: "promo_months", waiveCard: true });

  const amount = decideClosepathPromotion(
    [promo({ id: "promo_amount" }, { percentOff: null, amountOff: 999, currency: "usd" })],
    NOW,
  );
  assert.equal(amount.ok && amount.waiveCard, true);
});

test("a partial percent code stays on the card and trial checkout", () => {
  const decision = decideClosepathPromotion(
    [promo({ id: "promo_partial" }, { percentOff: 40, duration: "once" })],
    NOW,
  );
  assert.deepEqual(decision, { ok: true, promotionCodeId: "promo_partial", waiveCard: false });
  const fields = closepathCheckoutSessionFields("price_monthly_test", "https://anzendigitalmedia.com", {
    promotionCodeId: "promo_partial",
    waiveCard: false,
  });
  assert.equal(fields.payment_method_collection, "always");
  assert.deepEqual(fields.discounts, [{ promotion_code: "promo_partial" }]);
  assert.equal(fields.subscription_data?.trial_period_days, 7);
  assert.equal(fields.allow_promotion_codes, undefined);

  const once = decideClosepathPromotion([promo({ id: "promo_once" }, { duration: "once" })], NOW);
  assert.deepEqual(once, { ok: true, promotionCodeId: "promo_once", waiveCard: false });
});

test("invalid, expired, and max-redeemed codes are declined", () => {
  const nowSec = Math.floor(NOW / 1000);
  const cases: PromotionSnapshot[] = [
    promo({ active: false }),
    promo({ expiresAt: nowSec }),
    promo({ maxRedemptions: 2, timesRedeemed: 2 }),
    promo({ customerRestricted: true }),
    promo({ minimumAmount: 5000, minimumAmountCurrency: "usd" }),
    promo({}, { valid: false }),
    promo({}, { redeemBy: nowSec }),
    promo({}, { maxRedemptions: 1, timesRedeemed: 1 }),
    promo({}, { deleted: true, valid: false }),
    promo({}, { appliesToProducts: ["prod_other"] }),
    promo({}, { percentOff: null, amountOff: 999, currency: "eur" }),
    promo({ coupon: null }),
    promo({ id: "not_a_promo_id" }),
  ];
  for (const entry of cases) {
    assert.deepEqual(decideClosepathPromotion([entry], NOW), { ok: false }, JSON.stringify(entry));
  }
  assert.deepEqual(decideClosepathPromotion([], NOW), { ok: false });

  const alongside = decideClosepathPromotion(
    [promo({ active: false }), promo({ id: "promo_live" })],
    NOW,
  );
  assert.deepEqual(alongside, { ok: true, promotionCodeId: "promo_live", waiveCard: true });
});

test("a Stripe promotion code snapshot keeps the coupon that waives the card", () => {
  const raw = {
    id: "promo_snapshot",
    active: true,
    expires_at: null,
    max_redemptions: 1,
    times_redeemed: 0,
    customer: null,
    customer_account: null,
    restrictions: {
      first_time_transaction: false,
      minimum_amount: null,
      minimum_amount_currency: null,
    },
  } as Stripe.PromotionCode;
  const coupon = {
    id: "coupon_snapshot",
    object: "coupon",
    valid: true,
    percent_off: 100,
    amount_off: null,
    currency: null,
    duration: "forever",
    duration_in_months: null,
    max_redemptions: null,
    times_redeemed: 0,
    redeem_by: null,
    applies_to: { products: [CLOSEPATH_PRODUCT_ID] },
  } as Stripe.Coupon;
  const decision = decideClosepathPromotion([snapshotPromotionCode(raw, coupon)], NOW);
  assert.deepEqual(decision, { ok: true, promotionCodeId: "promo_snapshot", waiveCard: true });
  assert.deepEqual(
    decideClosepathPromotion([snapshotPromotionCode(raw, { id: "coupon_gone", object: "coupon", deleted: true })], NOW),
    { ok: false },
  );
});

test("Stripe rejecting a submitted code is a code error, not an outage", () => {
  assert.equal(promoFailureKind({ type: "StripeInvalidRequestError" }, true), "code");
  assert.equal(promoFailureKind({ type: "StripeAuthenticationError" }, true), "unavailable");
  assert.equal(promoFailureKind({ type: "StripeInvalidRequestError" }, false), "unavailable");
  assert.equal(promoFailureKind(new Error("down"), true), "unavailable");
});
