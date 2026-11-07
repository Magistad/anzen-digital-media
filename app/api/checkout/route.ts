import { NextResponse } from "next/server";
import {
  CLOSEPATH_PRODUCT,
  closepathIntegrationIdentifier,
  closepathPriceId,
} from "../../../lib/closepath";
import { requestOrigin } from "../../../lib/request-origin";
import { getStripe } from "../../../lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unavailable(origin: string) {
  return NextResponse.redirect(new URL("/products/closepath?checkout=unavailable", origin), 303);
}

export async function POST(req: Request) {
  const origin = requestOrigin(req);
  const stripe = getStripe();
  if (!stripe) return unavailable(origin);

  const claimed = req.headers.get("origin");
  if (claimed) {
    try {
      if (new URL(claimed).origin !== origin) return unavailable(origin);
    } catch {
      return unavailable(origin);
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: closepathPriceId(), quantity: 1 }],
      success_url: `${origin}/products/closepath/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/products/closepath`,
      client_reference_id: "closepath",
      integration_identifier: closepathIntegrationIdentifier(),
      customer_creation: "always",
      metadata: { product: CLOSEPATH_PRODUCT },
      payment_intent_data: {
        description: "Closepath — one purchase",
        metadata: { product: CLOSEPATH_PRODUCT },
      },
    });

    if (!session.url || !session.url.startsWith("https://checkout.stripe.com/")) {
      return unavailable(origin);
    }

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error(
      "Closepath checkout failed",
      error instanceof Error ? error.message : "unknown",
    );
    return unavailable(origin);
  }
}
