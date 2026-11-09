import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { clearEntitlementCache, subscriptionKeepsBook } from "../../../../lib/closepath-access";
import { CLOSEPATH_PRODUCT } from "../../../../lib/closepath";
import { isClosepathSession, shouldUnlockFulfillment } from "../../../../lib/closepath-order";
import {
  failClosepathFulfillment,
  setSubscriptionFulfillment,
  unlockClosepathFulfillment,
} from "../../../../lib/fulfillment";
import { readEnv } from "../../../../lib/env";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHECKOUT_EVENTS = new Set<Stripe.Event.Type>([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
]);

const SUBSCRIPTION_EVENTS = new Set<Stripe.Event.Type>([
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

function failureMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown";
}

async function handleSubscription(stripe: Stripe, subscription: Stripe.Subscription) {
  if (subscription.metadata?.product !== CLOSEPATH_PRODUCT) {
    return NextResponse.json({ received: true });
  }

  try {
    const open = await subscriptionKeepsBook(stripe, subscription);
    clearEntitlementCache();
    await setSubscriptionFulfillment(stripe, subscription, open ? "unlocked" : "failed");
    return NextResponse.json({ received: true });
  } catch (error) {
    clearEntitlementCache();
    console.error("Closepath subscription fulfillment failed", failureMessage(error));
    if (subscription.status === "canceled" || subscription.status === "incomplete_expired") {
      return NextResponse.json({ received: true });
    }
    return NextResponse.json({ error: "Fulfillment failed." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = readEnv("STRIPE_WEBHOOK_SECRET");
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (SUBSCRIPTION_EVENTS.has(event.type)) {
    return handleSubscription(stripe, event.data.object as Stripe.Subscription);
  }

  if (!CHECKOUT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  const received = event.data.object as Stripe.Checkout.Session;
  if (!isClosepathSession(received)) {
    return NextResponse.json({ received: true });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(received.id, {
      expand: ["line_items"],
    });

    if (event.type === "checkout.session.async_payment_failed") {
      if (shouldUnlockFulfillment(session)) {
        await unlockClosepathFulfillment(stripe, session);
      } else {
        await failClosepathFulfillment(stripe, session);
      }
      return NextResponse.json({ received: true });
    }

    if (!shouldUnlockFulfillment(session)) {
      return NextResponse.json({ received: true });
    }

    await unlockClosepathFulfillment(stripe, session);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Closepath fulfillment failed", failureMessage(error));
    return NextResponse.json({ error: "Fulfillment failed." }, { status: 500 });
  }
}
