import { NextResponse } from "next/server";
import {
  closepathCheckoutSessionFields,
  closepathIntegrationIdentifier,
  closepathPriceId,
  isClosepathMonthlyPrice,
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

  const priceId = closepathPriceId();
  if (!priceId) {
    console.error("Closepath checkout failed", "STRIPE_PRICE_ID is not set");
    return unavailable(origin);
  }

  try {
    const price = await stripe.prices.retrieve(priceId);
    if (!isClosepathMonthlyPrice(price)) {
      console.error("Closepath checkout failed", "STRIPE_PRICE_ID is not the $9.99 monthly Closepath price");
      return unavailable(origin);
    }

    const session = await stripe.checkout.sessions.create({
      ...closepathCheckoutSessionFields(priceId, origin),
      integration_identifier: closepathIntegrationIdentifier(),
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
