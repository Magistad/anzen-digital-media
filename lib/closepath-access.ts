import type Stripe from "stripe";
import {
  checkoutCustomerId,
  checkoutSubscriptionId,
  isCheckoutSessionId,
  isClosepathSession,
  isFullyDiscountedClosepathCheckout,
  isPaidClosepathCheckout,
  isPaidClosepathSubscription,
  isTrialingClosepathCheckout,
  subscriptionGrantsBook,
  subscriptionIsFullyDiscounted,
} from "./closepath-order";
import { findAccount } from "./closepath-account";
import { getStripe } from "./stripe";

export type ClosepathAccess =
  | { state: "unconfigured" }
  | { state: "invalid" }
  | { state: "unpaid" }
  | {
      state: "paid";
      email: string | null;
      plan: "monthly" | "retired";
      trial: boolean;
      /** A 100% discount covered the price. The success page does not describe this as the 7-day trial. */
      comped: boolean;
      subscriptionId: string | null;
      customerId: string | null;
    };

const ENTITLEMENT_TTL_MS = 60_000;
const entitlementCache = new Map<string, { state: "open" | "ended"; at: number }>();

export function clearEntitlementCache(): void {
  entitlementCache.clear();
}

export async function closepathDownloadAccess(sessionId: string | undefined): Promise<ClosepathAccess> {
  if (!sessionId || !isCheckoutSessionId(sessionId)) return { state: "invalid" };

  const stripe = getStripe();
  if (!stripe) return { state: "unconfigured" };

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
    if (!isClosepathSession(session)) return { state: "invalid" };
    if (!isPaidClosepathCheckout(session)) return { state: "unpaid" };
    const comped = isFullyDiscountedClosepathCheckout(session);
    const trial = isTrialingClosepathCheckout(session);
    const monthly = isPaidClosepathSubscription(session) || trial || comped;
    return {
      state: "paid",
      email: session.customer_details?.email ?? null,
      plan: monthly ? "monthly" : "retired",
      trial,
      comped,
      subscriptionId: monthly ? checkoutSubscriptionId(session) : null,
      customerId: checkoutCustomerId(session),
    };
  } catch {
    return { state: "invalid" };
  }
}

function isMissingSubscription(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const record = error as { statusCode?: number; code?: string };
  return record.statusCode === 404 || record.code === "resource_missing";
}

/** True when a paid invoice on this subscription collected a non-zero amount. The $0 trial invoice does not count. */
export async function collectedNonZeroCharge(stripe: Stripe, subscriptionId: string): Promise<boolean> {
  const invoices = await stripe.invoices.list({
    subscription: subscriptionId,
    status: "paid",
    limit: 20,
  });
  return invoices.data.some((invoice) => invoice.amount_paid > 0);
}

export async function subscriptionKeepsBook(
  stripe: Stripe,
  subscription: {
    id: string;
    status: string;
    cancel_at_period_end?: boolean;
    discounts?: Parameters<typeof subscriptionIsFullyDiscounted>[0]["discounts"];
  },
): Promise<boolean> {
  const fullyDiscounted = subscriptionIsFullyDiscounted(subscription);
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;
  if (subscription.status !== "past_due" || fullyDiscounted) {
    return subscriptionGrantsBook(subscription.status, { cancelAtPeriodEnd, fullyDiscounted });
  }
  const paidNonZeroInvoice = await collectedNonZeroCharge(stripe, subscription.id);
  return subscriptionGrantsBook(subscription.status, { paidNonZeroInvoice, cancelAtPeriodEnd, fullyDiscounted });
}

/** Live Stripe status for a stored subscription. Accounts opened before the monthly price have no subscription id and stay open. */
export async function subscriptionEntitlement(
  subscriptionId: string | null,
  fresh = false,
): Promise<"open" | "ended" | "unknown"> {
  if (!subscriptionId) return "open";
  const now = Date.now();
  if (!fresh) {
    const hit = entitlementCache.get(subscriptionId);
    if (hit && now - hit.at < ENTITLEMENT_TTL_MS) return hit.state;
  }

  const stripe = getStripe();
  if (!stripe) return "unknown";

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const state = (await subscriptionKeepsBook(stripe, subscription)) ? "open" : "ended";
    entitlementCache.set(subscriptionId, { state, at: now });
    return state;
  } catch (error) {
    if (isMissingSubscription(error)) {
      entitlementCache.set(subscriptionId, { state: "ended", at: now });
      return "ended";
    }
    console.error(
      "Closepath subscription check failed",
      error instanceof Error ? error.message : "unknown",
    );
    return "unknown";
  }
}

/** Signed-in owners can open Stripe billing even when the book is closed. */
export function ownerMayManageBilling(input: { signedIn: boolean; customerId: string | null }): boolean {
  return input.signedIn && Boolean(input.customerId);
}

export async function accountAccess(
  email: string,
  fresh = false,
): Promise<
  | { state: "open"; customerId: string | null }
  | { state: "ended"; customerId: string | null }
  | { state: "unknown"; customerId: string | null }
> {
  let account: Awaited<ReturnType<typeof findAccount>>;
  try {
    account = await findAccount(email);
  } catch (error) {
    console.error("Closepath account read failed", error instanceof Error ? error.message : "unknown");
    return { state: "unknown", customerId: null };
  }
  if (!account) return { state: "open", customerId: null };
  const entitlement = await subscriptionEntitlement(account.stripeSubscriptionId, fresh);
  const customerId = account.stripeCustomerId;
  if (entitlement === "open") return { state: "open", customerId };
  if (entitlement === "ended") return { state: "ended", customerId };
  return { state: "unknown", customerId };
}
