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

/** Statuses that still include the book. `past_due` is Stripe’s retry window. */
const OPEN_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);

export function isCheckoutSessionId(value: string): boolean {
  return value.length <= 255 && SESSION_ID.test(value);
}

export function isClosepathSession(session: Stripe.Checkout.Session): boolean {
  return session.metadata?.product === CLOSEPATH_PRODUCT;
}

export function subscriptionGrantsBook(status: string): boolean {
  return OPEN_SUBSCRIPTION_STATUSES.has(status);
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

/** Paid monthly Closepath subscription: $9.99, quantity 1, usd, STRIPE_PRICE_ID. */
export function isPaidClosepathSubscription(session: Stripe.Checkout.Session): boolean {
  const priceId = closepathPriceId();
  const price = linePrice(session);
  if (!priceId || !price) return false;
  if (session.mode !== "subscription") return false;
  if (session.payment_status !== "paid") return false;
  if (session.currency !== CLOSEPATH_CURRENCY) return false;
  if (session.amount_subtotal !== CLOSEPATH_AMOUNT_CENTS) return false;
  if (!isClosepathSession(session)) return false;
  if (!checkoutSubscriptionId(session)) return false;
  if (price.id !== priceId) return false;
  if (price.unit_amount !== CLOSEPATH_AMOUNT_CENTS) return false;
  if (price.currency !== CLOSEPATH_CURRENCY) return false;
  if (price.recurring?.interval !== "month") return false;
  if ((price.recurring.interval_count ?? 1) !== 1) return false;
  return lineProductId(session) === CLOSEPATH_PRODUCT_ID;
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
  return isPaidClosepathSubscription(session) || isRetiredClosepathPayment(session);
}

/** Webhook unlock rule: a paid monthly subscription, or an already-paid retired one-time session. */
export function shouldUnlockFulfillment(session: Stripe.Checkout.Session): boolean {
  return isPaidClosepathCheckout(session);
}
