import Stripe from "stripe";
import { readEnv } from "./env";

let cached: { signature: string; client: Stripe } | null = null;

/**
 * Drop the cached client. Tests call this after pointing Stripe at the local mock.
 * Production never sets STRIPE_API_HOST, so the client stays the normal Stripe host.
 */
export function resetStripeClient(): void {
  cached = null;
}

function clientOptions(): Stripe.StripeConfig | undefined {
  const host = readEnv("STRIPE_API_HOST");
  if (!host) return undefined;
  const port = readEnv("STRIPE_API_PORT");
  return {
    host,
    port: port ?? 80,
    protocol: "http",
    telemetry: false,
    maxNetworkRetries: 0,
  };
}

/** Instance client only. Never assigns a process-wide Stripe.api_key. */
export function getStripe(): Stripe | null {
  const key = readEnv("STRIPE_SECRET_KEY");
  if (!key) return null;
  const host = readEnv("STRIPE_API_HOST") ?? "";
  const port = readEnv("STRIPE_API_PORT") ?? "";
  const signature = `${key}\n${host}\n${port}`;
  if (!cached || cached.signature !== signature) {
    const options = clientOptions();
    cached = { signature, client: options ? new Stripe(key, options) : new Stripe(key) };
  }
  return cached.client;
}
