import { randomBytes } from "crypto";
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

export function closepathIntegrationIdentifier(): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const bytes = randomBytes(8);
  let suffix = "";
  for (const byte of bytes) {
    suffix += letters[byte % letters.length];
  }
  return `closepath_hosted_${suffix}`;
}
