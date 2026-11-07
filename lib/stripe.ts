import Stripe from "stripe";
import { readEnv } from "./env";

let cached: { key: string; client: Stripe } | null = null;

/** Instance client only. Never assigns a process-wide Stripe.api_key. */
export function getStripe(): Stripe | null {
  const key = readEnv("STRIPE_SECRET_KEY");
  if (!key) return null;
  if (!cached || cached.key !== key) {
    cached = { key, client: new Stripe(key) };
  }
  return cached.client;
}
