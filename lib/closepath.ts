import { randomBytes } from "crypto";
import { readEnv } from "./env";

/** Existing Closepath product on the Anzen Digital Media Stripe account. */
export const CLOSEPATH_PRODUCT_ID = "prod_Va7nrCPUNongqM";

/** Existing one-time $59 USD price. Checkout must use this price, not a new one. */
export const CLOSEPATH_PRICE_ID = "price_1UYxYNII1hyfpOcH1NWbxwsw";

export const CLOSEPATH_PRODUCT = "closepath";
export const CLOSEPATH_AMOUNT_CENTS = 5900;
export const CLOSEPATH_CURRENCY = "usd";

export function closepathPriceId(): string {
  return readEnv("STRIPE_PRICE_ID") ?? CLOSEPATH_PRICE_ID;
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
