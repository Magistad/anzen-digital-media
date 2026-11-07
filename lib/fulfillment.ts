import type Stripe from "stripe";
import { CLOSEPATH_PRODUCT } from "./closepath";
import { checkoutPaymentIntentId, checkoutSubscriptionId } from "./closepath-order";

export function fulfillmentAnchor(session: Stripe.Checkout.Session): "payment_intent" | "subscription" | null {
  if (checkoutSubscriptionId(session)) return "subscription";
  if (checkoutPaymentIntentId(session)) return "payment_intent";
  return null;
}

async function writeFulfillment(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  fulfillment: "unlocked" | "failed",
): Promise<void> {
  const intentId = checkoutPaymentIntentId(session);
  const subscriptionId = checkoutSubscriptionId(session);
  if (!intentId && !subscriptionId) return;

  const metadata = { product: CLOSEPATH_PRODUCT, fulfillment };

  if (subscriptionId) {
    await stripe.subscriptions.update(subscriptionId, { metadata });
  }

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
    // A completed session may reject metadata edits. The subscription or payment record remains.
  }
}

export async function unlockClosepathFulfillment(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (!fulfillmentAnchor(session)) {
    throw new Error("Closepath session has no subscription or payment to unlock");
  }
  await writeFulfillment(stripe, session, "unlocked");
}

export async function failClosepathFulfillment(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (!fulfillmentAnchor(session)) return;
  await writeFulfillment(stripe, session, "failed");
}
