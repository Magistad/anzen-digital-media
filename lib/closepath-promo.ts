import type Stripe from "stripe";
import { CLOSEPATH_AMOUNT_CENTS, CLOSEPATH_CURRENCY, CLOSEPATH_PRODUCT_ID } from "./closepath";

/** Shown on the product page. Checkout redirects here instead of returning 500. */
export const CLOSEPATH_PROMO_ERROR =
  "That code isn’t valid. It may be expired or already used. Leave it blank to start the trial.";

const PROMO_CODE = /^[A-Za-z0-9-]{1,64}$/;
const PROMO_ID = /^promo_[A-Za-z0-9]+$/;

export type PromoInput = { kind: "absent" } | { kind: "invalid" } | { kind: "code"; code: string };

export type CouponSnapshot = {
  deleted: boolean;
  valid: boolean;
  percentOff: number | null;
  amountOff: number | null;
  currency: string | null;
  duration: string;
  durationInMonths: number | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  redeemBy: number | null;
  /** Null when the coupon is not limited to a product list. */
  appliesToProducts: string[] | null;
};

export type PromotionSnapshot = {
  id: string;
  active: boolean;
  expiresAt: number | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  customerRestricted: boolean;
  minimumAmount: number | null;
  minimumAmountCurrency: string | null;
  coupon: CouponSnapshot | null;
};

export type PromoDecision =
  | { ok: true; promotionCodeId: string; waiveCard: boolean }
  | { ok: false };

/** Blank is no code. Anything else that Stripe would not accept as a code is invalid. */
export function readPromoInput(raw: string): PromoInput {
  const code = raw.trim();
  if (!code) return { kind: "absent" };
  if (!PROMO_CODE.test(code)) return { kind: "invalid" };
  return { kind: "code", code };
}

function coversLaterInvoices(coupon: CouponSnapshot): boolean {
  if (coupon.duration === "forever") return true;
  return coupon.duration === "repeating" && (coupon.durationInMonths ?? 0) >= 1;
}

/** 100% off, or an amount that covers the $9.99 price, for every invoice the duration includes. */
export function couponWaivesCard(coupon: CouponSnapshot): boolean {
  if (!coversLaterInvoices(coupon)) return false;
  if (coupon.percentOff === 100) return true;
  return (
    coupon.currency === CLOSEPATH_CURRENCY &&
    coupon.amountOff != null &&
    coupon.amountOff >= CLOSEPATH_AMOUNT_CENTS
  );
}

function couponHasDiscount(coupon: CouponSnapshot): boolean {
  if (coupon.percentOff != null && coupon.percentOff > 0 && coupon.percentOff <= 100) return true;
  return coupon.currency === CLOSEPATH_CURRENCY && coupon.amountOff != null && coupon.amountOff > 0;
}

function minimumAllowsPrice(promo: PromotionSnapshot): boolean {
  const currency = promo.minimumAmountCurrency;
  if (promo.minimumAmount == null) return currency == null || currency === CLOSEPATH_CURRENCY;
  if (currency != null && currency !== CLOSEPATH_CURRENCY) return false;
  return promo.minimumAmount <= CLOSEPATH_AMOUNT_CENTS;
}

function couponRedeemable(coupon: CouponSnapshot, nowSec: number): boolean {
  if (coupon.deleted || !coupon.valid) return false;
  if (coupon.redeemBy != null && coupon.redeemBy <= nowSec) return false;
  if (coupon.maxRedemptions != null && coupon.timesRedeemed >= coupon.maxRedemptions) return false;
  if (coupon.appliesToProducts && !coupon.appliesToProducts.includes(CLOSEPATH_PRODUCT_ID)) return false;
  return couponHasDiscount(coupon);
}

function promotionRedeemable(promo: PromotionSnapshot, nowSec: number): boolean {
  if (!promo.active || !PROMO_ID.test(promo.id)) return false;
  if (promo.expiresAt != null && promo.expiresAt <= nowSec) return false;
  if (promo.maxRedemptions != null && promo.timesRedeemed >= promo.maxRedemptions) return false;
  if (promo.customerRestricted || !minimumAllowsPrice(promo)) return false;
  return promo.coupon != null && couponRedeemable(promo.coupon, nowSec);
}

/**
 * Picks one redeemable promotion code.
 * A 100% off forever or repeating coupon waives the card. Any other discount still applies, with a card.
 */
export function decideClosepathPromotion(promos: PromotionSnapshot[], nowMs: number): PromoDecision {
  const nowSec = Math.floor(nowMs / 1000);
  let partial: PromoDecision | null = null;
  for (const promo of promos) {
    if (!promo.coupon || !promotionRedeemable(promo, nowSec)) continue;
    const decision: PromoDecision = {
      ok: true,
      promotionCodeId: promo.id,
      waiveCard: couponWaivesCard(promo.coupon),
    };
    if (decision.waiveCard) return decision;
    partial ??= decision;
  }
  return partial ?? { ok: false };
}

function usdAmountOff(coupon: Stripe.Coupon): { amountOff: number | null; currency: string | null } {
  if (coupon.currency === CLOSEPATH_CURRENCY && coupon.amount_off != null) {
    return { amountOff: coupon.amount_off, currency: CLOSEPATH_CURRENCY };
  }
  const option = coupon.currency_options?.[CLOSEPATH_CURRENCY]?.amount_off;
  if (typeof option === "number") return { amountOff: option, currency: CLOSEPATH_CURRENCY };
  return { amountOff: null, currency: coupon.currency };
}

export function snapshotCoupon(coupon: Stripe.Coupon | Stripe.DeletedCoupon | null): CouponSnapshot | null {
  if (!coupon) return null;
  if ("deleted" in coupon && coupon.deleted) {
    return {
      deleted: true,
      valid: false,
      percentOff: null,
      amountOff: null,
      currency: null,
      duration: "once",
      durationInMonths: null,
      maxRedemptions: null,
      timesRedeemed: 0,
      redeemBy: null,
      appliesToProducts: null,
    };
  }
  const live = coupon as Stripe.Coupon;
  const amount = usdAmountOff(live);
  return {
    deleted: false,
    valid: live.valid,
    percentOff: live.percent_off,
    amountOff: amount.amountOff,
    currency: amount.currency,
    duration: live.duration,
    durationInMonths: live.duration_in_months,
    maxRedemptions: live.max_redemptions,
    timesRedeemed: live.times_redeemed,
    redeemBy: live.redeem_by,
    appliesToProducts: live.applies_to?.products ?? null,
  };
}

function minimumFrom(promo: Stripe.PromotionCode): { amount: number | null; currency: string | null } {
  const usd = promo.restrictions.currency_options?.[CLOSEPATH_CURRENCY]?.minimum_amount;
  if (typeof usd === "number") return { amount: usd, currency: CLOSEPATH_CURRENCY };
  return {
    amount: promo.restrictions.minimum_amount,
    currency: promo.restrictions.minimum_amount_currency,
  };
}

export function snapshotPromotionCode(
  promo: Stripe.PromotionCode,
  coupon: Stripe.Coupon | Stripe.DeletedCoupon | null,
): PromotionSnapshot {
  const minimum = minimumFrom(promo);
  return {
    id: promo.id,
    active: promo.active,
    expiresAt: promo.expires_at,
    maxRedemptions: promo.max_redemptions,
    timesRedeemed: promo.times_redeemed,
    customerRestricted: Boolean(promo.customer) || Boolean(promo.customer_account),
    minimumAmount: minimum.amount,
    minimumAmountCurrency: minimum.currency,
    coupon: snapshotCoupon(coupon),
  };
}

/** Looks up the customer-facing code. Stripe matches it without regard to case. */
export async function resolveClosepathPromotion(
  stripe: Stripe,
  code: string,
  nowMs = Date.now(),
): Promise<PromoDecision> {
  const listed = await stripe.promotionCodes.list({
    code,
    limit: 10,
    expand: ["data.promotion.coupon"],
  });
  const snapshots: PromotionSnapshot[] = [];
  for (const promo of listed.data) {
    let coupon = promo.promotion?.coupon ?? null;
    if (typeof coupon === "string") {
      try {
        coupon = await stripe.coupons.retrieve(coupon);
      } catch {
        coupon = null;
      }
    }
    snapshots.push(snapshotPromotionCode(promo, coupon));
  }
  return decideClosepathPromotion(snapshots, nowMs);
}

/** A rejected discount is a bad code. Other failures leave checkout unavailable. */
export function promoFailureKind(error: unknown, hadPromo: boolean): "code" | "unavailable" {
  if (!hadPromo || !error || typeof error !== "object") return "unavailable";
  const type = (error as { type?: string }).type;
  return type === "StripeInvalidRequestError" ? "code" : "unavailable";
}
