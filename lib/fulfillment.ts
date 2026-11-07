import type Stripe from "stripe";
import { CLOSEPATH_PRODUCT } from "./closepath";

function paymentIntentId(session: Stripe.Checkout.Session): string | null {
  if (!session.payment_intent) return null;
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent.id;
}

async function writeFulfillment(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  fulfillment: "unlocked" | "failed",
): Promise<void> {
  const intentId = paymentIntentId(session);
  const metadata = { product: CLOSEPATH_PRODUCT, fulfillment };

  if (intentId) {
    await stripe.paymentIntents.update(intentId, { metadata });
    const email = session.customer_details?.email;
    if (email && fulfillment === "unlocked") {
      try {
        await stripe.paymentIntents.update(intentId, { receipt_email: email });
      } catch {
        // Checkout already collected the email. Updating receipt_email after capture can be rejected.
      }
    }
  }

  try {
    await stripe.checkout.sessions.update(session.id, { metadata });
  } catch {
    // A completed session may reject metadata edits. The PaymentIntent record remains.
  }
}

export async function unlockClosepathFulfillment(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const intentId = paymentIntentId(session);
  if (!intentId) {
    throw new Error("Closepath session has no payment intent to unlock");
  }
  await writeFulfillment(stripe, session, "unlocked");
}

export async function failClosepathFulfillment(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<void> {
  await writeFulfillment(stripe, session, "failed");
}
