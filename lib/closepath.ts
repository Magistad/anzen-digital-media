import { randomBytes } from "crypto";
import type Stripe from "stripe";
import { readEnv } from "./env";

/** Existing Closepath product. The monthly price is STRIPE_PRICE_ID on this product. */
export const CLOSEPATH_PRODUCT_ID = "prod_Va7nrCPUNongqM";

/** Retired one-time price ($59). Checkout does not use it. */
export const CLOSEPATH_RETIRED_PRICE_ID = "price_1UYxYNII1hyfpOcH1NWbxwsw";
export const CLOSEPATH_RETIRED_AMOUNT_CENTS = 5900;

export const CLOSEPATH_PRODUCT = "closepath";
/** $9.99 USD per month. */
export const CLOSEPATH_AMOUNT_CENTS = 999;
export const CLOSEPATH_CURRENCY = "usd";
/** Trial on the existing monthly price. Stripe bills that price when the trial ends. */
export const CLOSEPATH_TRIAL_DAYS = 7;
export const CLOSEPATH_OFFER = "7 days free, then $9.99 a month. Cancel anytime.";
export const CLOSEPATH_TRIAL_BUTTON = "Start free trial";

export type ClosepathPriceCheck = {
  active: boolean;
  currency: string;
  unit_amount: number | null;
  product: string | { id: string } | null;
  recurring: { interval: string; interval_count?: number | null } | null;
};

/** Checkout may only start when STRIPE_PRICE_ID is this monthly price. */
export function isClosepathMonthlyPrice(price: ClosepathPriceCheck): boolean {
  if (!price.active) return false;
  if (price.currency !== CLOSEPATH_CURRENCY) return false;
  if (price.unit_amount !== CLOSEPATH_AMOUNT_CENTS) return false;
  if (price.recurring?.interval !== "month") return false;
  if ((price.recurring.interval_count ?? 1) !== 1) return false;
  const product = typeof price.product === "string" ? price.product : price.product?.id;
  return product === CLOSEPATH_PRODUCT_ID;
}

/** Monthly price id from the environment. Null when it is not set. */
export function closepathPriceId(): string | null {
  return readEnv("STRIPE_PRICE_ID") ?? null;
}

/**
 * A code already checked against Stripe.
 * `waiveCard` is only for a 100% off coupon that lasts forever or for multiple invoices.
 * Checkout cannot see a code typed on its own page when it decides whether to collect a card.
 */
export type ClosepathCheckoutDiscount = {
  promotionCodeId: string;
  waiveCard: boolean;
};

function subscriptionData(waiveCard: boolean): Stripe.Checkout.SessionCreateParams.SubscriptionData {
  if (waiveCard) {
    return {
      description: "Closepath — monthly price covered by a promo code",
      metadata: { product: CLOSEPATH_PRODUCT },
    };
  }
  return {
    description: "Closepath — 7 days free, then $9.99 a month",
    metadata: { product: CLOSEPATH_PRODUCT },
    trial_period_days: CLOSEPATH_TRIAL_DAYS,
    trial_settings: {
      end_behavior: {
        missing_payment_method: "cancel",
      },
    },
  };
}

/**
 * Hosted Checkout for the existing monthly price.
 * With no pre-checked code, a card is collected up front and the 7-day trial stays.
 * Stripe Checkout can still accept other codes on that page.
 * A full discount skips the trial: the trial is set to cancel when it ends without a card,
 * which would close a $0 subscription after 7 days.
 */
export function closepathCheckoutSessionFields(
  priceId: string,
  origin: string,
  discount?: ClosepathCheckoutDiscount,
): Stripe.Checkout.SessionCreateParams {
  const shared: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/products/closepath/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/products/closepath`,
    client_reference_id: CLOSEPATH_PRODUCT,
    metadata: { product: CLOSEPATH_PRODUCT },
    subscription_data: subscriptionData(Boolean(discount?.waiveCard)),
  };
  if (!discount) {
    return {
      ...shared,
      payment_method_collection: "always",
      allow_promotion_codes: true,
    };
  }
  return {
    ...shared,
    payment_method_collection: discount.waiveCard ? "if_required" : "always",
    discounts: [{ promotion_code: discount.promotionCodeId }],
  };
}

export function closepathIntegrationIdentifier(): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const bytes = randomBytes(8);
  let suffix = "";
  for (const byte of bytes) {
    suffix += letters[byte % letters.length];
  }
  return `closepath_hosted_${suffix}`;
}
