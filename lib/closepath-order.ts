import type Stripe from "stripe";
import {
  CLOSEPATH_AMOUNT_CENTS,
  CLOSEPATH_CURRENCY,
  CLOSEPATH_PRODUCT,
  CLOSEPATH_PRODUCT_ID,
  closepathPriceId,
} from "./closepath";

const SESSION_ID = /^cs_[A-Za-z0-9_]+$/;

export function isCheckoutSessionId(value: string): boolean {
  return value.length <= 255 && SESSION_ID.test(value);
}

export function isClosepathSession(session: Stripe.Checkout.Session): boolean {
  return session.metadata?.product === CLOSEPATH_PRODUCT;
}

function linePriceId(session: Stripe.Checkout.Session): string | null {
  const item = session.line_items?.data?.[0];
  const price = item?.price;
  if (!price) return null;
  return typeof price === "string" ? price : price.id;
}

function lineProductId(session: Stripe.Checkout.Session): string | null {
  const price = session.line_items?.data?.[0]?.price;
  if (!price || typeof price === "string") return null;
  const product = price.product;
  if (!product) return null;
  return typeof product === "string" ? product : product.id;
}

/** Paid Closepath checkout: the existing $59 price, quantity 1, usd. */
export function isPaidClosepathDownload(session: Stripe.Checkout.Session): boolean {
  if (session.mode !== "payment") return false;
  if (session.payment_status !== "paid") return false;
  if (session.currency !== CLOSEPATH_CURRENCY) return false;
  if (session.amount_total !== CLOSEPATH_AMOUNT_CENTS) return false;
  if (!isClosepathSession(session)) return false;

  const items = session.line_items?.data ?? [];
  if (items.length !== 1 || items[0]?.quantity !== 1) return false;
  if (linePriceId(session) !== closepathPriceId()) return false;

  const productId = lineProductId(session);
  if (productId && productId !== CLOSEPATH_PRODUCT_ID) return false;
  return true;
}

/** Webhook unlock rule: our session, and Stripe does not still call it unpaid. */
export function shouldUnlockFulfillment(session: Stripe.Checkout.Session): boolean {
  return isClosepathSession(session) && session.payment_status !== "unpaid";
}
