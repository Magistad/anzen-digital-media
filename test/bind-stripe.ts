import { resetStripeClient } from "../lib/stripe";
import {
  TEST_PRICE_ID,
  TEST_SESSION_SECRET,
  TEST_STRIPE_KEY,
  TEST_WEBHOOK_SECRET,
} from "./constants";
import { startStripeMock, type StripeMock } from "./stripe-mock";

const ENV_KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_ID",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_API_HOST",
  "STRIPE_API_PORT",
  "CLOSEPATH_SESSION_SECRET",
] as const;

/** Point this process at the local Stripe mock. Restores the previous env on close. */
export async function bindTestStripe(): Promise<StripeMock & { unbind(): Promise<void> }> {
  const previous = new Map<string, string | undefined>();
  for (const key of ENV_KEYS) previous.set(key, process.env[key]);
  const mock = await startStripeMock(0);
  process.env.STRIPE_SECRET_KEY = TEST_STRIPE_KEY;
  process.env.STRIPE_PRICE_ID = TEST_PRICE_ID;
  process.env.STRIPE_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
  process.env.STRIPE_API_HOST = "127.0.0.1";
  process.env.STRIPE_API_PORT = String(mock.port);
  process.env.CLOSEPATH_SESSION_SECRET = TEST_SESSION_SECRET;
  resetStripeClient();
  return {
    ...mock,
    async unbind() {
      await mock.close();
      for (const key of ENV_KEYS) {
        const value = previous.get(key);
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
      resetStripeClient();
    },
  };
}
