import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { isClosepathSession, shouldUnlockFulfillment } from "../../../../lib/closepath-order";
import { failClosepathFulfillment, unlockClosepathFulfillment } from "../../../../lib/fulfillment";
import { readEnv } from "../../../../lib/env";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FULFILLMENT_EVENTS = new Set<Stripe.Event.Type>([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
]);

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

  if (!FULFILLMENT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  const received = event.data.object as Stripe.Checkout.Session;
  if (!isClosepathSession(received)) {
    return NextResponse.json({ received: true });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(received.id);

    if (event.type === "checkout.session.async_payment_failed") {
      if (session.payment_status === "paid") {
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
    console.error(
      "Closepath fulfillment failed",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json({ error: "Fulfillment failed." }, { status: 500 });
  }
}
