import type Stripe from "stripe";
import {
  CLOSEPATH_AMOUNT_CENTS,
  CLOSEPATH_CURRENCY,
  CLOSEPATH_PRODUCT,
  CLOSEPATH_PRODUCT_ID,
  CLOSEPATH_RETIRED_AMOUNT_CENTS,
  CLOSEPATH_RETIRED_PRICE_ID,
  closepathPriceId,
} from "./closepath";

const SESSION_ID = /^cs_[A-Za-z0-9_]+$/;
const SUBSCRIPTION_ID = /^sub_[A-Za-z0-9]+$/;
const CUSTOMER_ID = /^cus_[A-Za-z0-9]+$/;
const PAYMENT_INTENT_ID = /^pi_[A-Za-z0-9]+$/;

export function isCheckoutSessionId(value: string): boolean {
  return value.length <= 255 && SESSION_ID.test(value);
}

export function isClosepathProduct(metadata: { product?: string | null } | null | undefined): boolean {
  return metadata?.product === CLOSEPATH_PRODUCT;
}

export function isClosepathSession(session: Stripe.Checkout.Session): boolean {
  return isClosepathProduct(session.metadata);
}

/**
 * Statuses that still include the book.
 * `trialing` stays open when the Customer Portal sets cancel-at-period-end.
 * Stripe keeps that status until the trial ends, then cancels without a charge.
 * `past_due` is the retry window after a collected charge. A trial that ends
 * without one does not keep the book.
 * A 100% discount that still applies keeps an active, trialing, or past_due subscription open.
 * Canceled and deleted subscriptions stay closed.
 */
export function subscriptionGrantsBook(
  status: string,
  options?: { paidNonZeroInvoice?: boolean; cancelAtPeriodEnd?: boolean; fullyDiscounted?: boolean },
): boolean {
  // Period-end cancellation does not close the book early.
  void options?.cancelAtPeriodEnd;
  if (
    options?.fullyDiscounted &&
    (status === "active" || status === "trialing" || status === "past_due")
  ) {
    return true;
  }
  if (status === "active" || status === "trialing") return true;
  if (status === "past_due") return options?.paidNonZeroInvoice !== false;
  return false;
}

type CouponFields = {
  valid?: boolean;
  percent_off?: number | null;
  amount_off?: number | null;
  currency?: string | null;
  duration?: string | null;
  duration_in_months?: number | null;
  deleted?: unknown;
};

type DiscountFields = {
  deleted?: unknown;
  source?: { coupon?: string | CouponFields | null } | null;
};

function couponKeepsZeroInvoice(coupon: CouponFields): boolean {
  if (coupon.deleted) return false;
  if (coupon.valid === false) return false;
  const percent = coupon.percent_off === 100;
  const amount = coupon.currency === CLOSEPATH_CURRENCY && (coupon.amount_off ?? 0) >= CLOSEPATH_AMOUNT_CENTS;
  if (!percent && !amount) return false;
  if (coupon.duration === "forever") return true;
  return coupon.duration === "repeating" && (coupon.duration_in_months ?? 0) >= 1;
}

/** True when an expanded discount still covers the monthly price in full. Unexpanded ids do not count. */
export function subscriptionIsFullyDiscounted(subscription: {
  discounts?: Array<string | DiscountFields> | null;
}): boolean {
  for (const discount of subscription.discounts ?? []) {
    if (typeof discount === "string" || discount.deleted) continue;
    const coupon = discount.source?.coupon;
    if (!coupon || typeof coupon === "string") continue;
    if (couponKeepsZeroInvoice(coupon)) return true;
  }
  return false;
}

export function normalizeStoredSubscriptionId(value: unknown): string | null {
  return typeof value === "string" && SUBSCRIPTION_ID.test(value) ? value : null;
}

export function normalizeStoredCustomerId(value: unknown): string | null {
  return typeof value === "string" && CUSTOMER_ID.test(value) ? value : null;
}

export function checkoutSubscriptionId(session: Stripe.Checkout.Session): string | null {
  const value = session.subscription;
  if (!value) return null;
  return normalizeStoredSubscriptionId(typeof value === "string" ? value : value.id);
}

export function checkoutCustomerId(session: Stripe.Checkout.Session): string | null {
  const value = session.customer;
  if (!value) return null;
  return normalizeStoredCustomerId(typeof value === "string" ? value : value.id);
}

export function checkoutPaymentIntentId(session: Stripe.Checkout.Session): string | null {
  const value = session.payment_intent;
  if (!value) return null;
  const id = typeof value === "string" ? value : value.id;
  return PAYMENT_INTENT_ID.test(id) ? id : null;
}

function lineItem(session: Stripe.Checkout.Session): Stripe.LineItem | undefined {
  const items = session.line_items?.data ?? [];
  if (items.length !== 1 || items[0]?.quantity !== 1) return undefined;
  return items[0];
}

function linePrice(session: Stripe.Checkout.Session): Stripe.Price | null {
  const price = lineItem(session)?.price;
  if (!price || typeof price === "string") return null;
  return price;
}

function linePriceId(session: Stripe.Checkout.Session): string | null {
  const price = lineItem(session)?.price;
  if (!price) return null;
  return typeof price === "string" ? price : price.id;
}

function lineProductId(session: Stripe.Checkout.Session): string | null {
  const price = lineItem(session)?.price;
  if (!price || typeof price === "string") return null;
  const product = price.product;
  if (!product) return null;
  return typeof product === "string" ? product : product.id;
}

function productMatches(session: Stripe.Checkout.Session): boolean {
  const productId = lineProductId(session);
  return !productId || productId === CLOSEPATH_PRODUCT_ID;
}

function isClosepathMonthlyLine(session: Stripe.Checkout.Session): boolean {
  const priceId = closepathPriceId();
  const price = linePrice(session);
  if (!priceId || !price) return false;
  if (session.mode !== "subscription") return false;
  if (session.currency !== CLOSEPATH_CURRENCY) return false;
  if (!isClosepathSession(session)) return false;
  if (!checkoutSubscriptionId(session)) return false;
  if (price.id !== priceId) return false;
  if (price.unit_amount !== CLOSEPATH_AMOUNT_CENTS) return false;
  if (price.currency !== CLOSEPATH_CURRENCY) return false;
  if (price.recurring?.interval !== "month") return false;
  if ((price.recurring.interval_count ?? 1) !== 1) return false;
  return lineProductId(session) === CLOSEPATH_PRODUCT_ID;
}

/** Collected monthly charge: $9.99 due, quantity 1, usd, STRIPE_PRICE_ID. A $0 trial is not this. */
export function isPaidClosepathSubscription(session: Stripe.Checkout.Session): boolean {
  if (!isClosepathMonthlyLine(session)) return false;
  if (session.payment_status !== "paid") return false;
  if (session.amount_subtotal !== CLOSEPATH_AMOUNT_CENTS) return false;
  if (session.amount_total === 0) return false;
  return true;
}

function zeroDueCheckout(session: Stripe.Checkout.Session): boolean {
  if (session.status !== "complete") return false;
  if (!isClosepathMonthlyLine(session)) return false;
  if (session.amount_total !== 0) return false;
  return session.payment_status === "no_payment_required" || session.payment_status === "paid";
}

/**
 * Completed Checkout on the monthly price where a discount removed the whole $9.99.
 * This is the no-card promo path. It is not the 7-day trial.
 */
export function isFullyDiscountedClosepathCheckout(session: Stripe.Checkout.Session): boolean {
  if (!zeroDueCheckout(session)) return false;
  const discount = session.total_details?.amount_discount ?? 0;
  if (discount >= CLOSEPATH_AMOUNT_CENTS) return true;
  const subtotal = session.amount_subtotal ?? 0;
  return subtotal >= CLOSEPATH_AMOUNT_CENTS && discount >= subtotal;
}

/**
 * Completed Checkout on the monthly price with nothing due today.
 * A card-on-file trial reports `no_payment_required`. A $0 trial invoice can also be `paid`.
 * A 100% discount is handled separately so the success page does not call it a trial.
 */
export function isTrialingClosepathCheckout(session: Stripe.Checkout.Session): boolean {
  if (isFullyDiscountedClosepathCheckout(session)) return false;
  if (!zeroDueCheckout(session)) return false;
  const subtotal = session.amount_subtotal;
  if (subtotal != null && subtotal !== 0 && subtotal !== CLOSEPATH_AMOUNT_CENTS) return false;
  return true;
}

/**
 * Already-paid session on the retired one-time price.
 * New checkout does not create these.
 */
export function isRetiredClosepathPayment(session: Stripe.Checkout.Session): boolean {
  if (session.mode !== "payment") return false;
  if (session.payment_status !== "paid") return false;
  if (session.currency !== CLOSEPATH_CURRENCY) return false;
  if (session.amount_total !== CLOSEPATH_RETIRED_AMOUNT_CENTS) return false;
  if (!isClosepathSession(session)) return false;
  if (linePriceId(session) !== CLOSEPATH_RETIRED_PRICE_ID) return false;
  return productMatches(session);
}

export function isPaidClosepathCheckout(session: Stripe.Checkout.Session): boolean {
  return (
    isPaidClosepathSubscription(session) ||
    isTrialingClosepathCheckout(session) ||
    isFullyDiscountedClosepathCheckout(session) ||
    isRetiredClosepathPayment(session)
  );
}

/** Webhook unlock rule: a paid, trialing, or fully discounted monthly subscription, or an already-paid retired one-time session. */
export function shouldUnlockFulfillment(session: Stripe.Checkout.Session): boolean {
  return isPaidClosepathCheckout(session);
}
