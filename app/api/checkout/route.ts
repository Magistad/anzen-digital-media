import { NextResponse } from "next/server";
import {
  closepathCheckoutSessionFields,
  closepathIntegrationIdentifier,
  closepathPriceId,
  isClosepathMonthlyPrice,
  type ClosepathCheckoutDiscount,
} from "../../../lib/closepath";
import { promoFailureKind, readPromoInput, resolveClosepathPromotion } from "../../../lib/closepath-promo";
import { requestOrigin } from "../../../lib/request-origin";
import { getStripe } from "../../../lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function back(origin: string, checkout: "unavailable" | "code") {
  return NextResponse.redirect(new URL(`/products/closepath?checkout=${checkout}`, origin), 303);
}

async function promoField(req: Request): Promise<string> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.includes("application/x-www-form-urlencoded") && !type.includes("multipart/form-data")) {
    return "";
  }
  try {
    const form = await req.formData();
    return String(form.get("promo") ?? "");
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const origin = requestOrigin(req);
  const stripe = getStripe();
  if (!stripe) return back(origin, "unavailable");

  const claimed = req.headers.get("origin");
  if (claimed) {
    try {
      if (new URL(claimed).origin !== origin) return back(origin, "unavailable");
    } catch {
      return back(origin, "unavailable");
    }
  }

  const promo = readPromoInput(await promoField(req));
  if (promo.kind === "invalid") return back(origin, "code");

  const priceId = closepathPriceId();
  if (!priceId) {
    console.error("Closepath checkout failed", "STRIPE_PRICE_ID is not set");
    return back(origin, "unavailable");
  }

  try {
    const price = await stripe.prices.retrieve(priceId);
    if (!isClosepathMonthlyPrice(price)) {
      console.error("Closepath checkout failed", "STRIPE_PRICE_ID is not the $9.99 monthly Closepath price");
      return back(origin, "unavailable");
    }
  } catch {
    console.error("Closepath checkout failed", "price lookup");
    return back(origin, "unavailable");
  }

  let discount: ClosepathCheckoutDiscount | undefined;
  try {
    if (promo.kind === "code") {
      const decision = await resolveClosepathPromotion(stripe, promo.code);
      if (!decision.ok) return back(origin, "code");
      discount = { promotionCodeId: decision.promotionCodeId, waiveCard: decision.waiveCard };
    }
  } catch {
    console.error("Closepath checkout failed", "promotion code lookup");
    return back(origin, "unavailable");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      ...closepathCheckoutSessionFields(priceId, origin, discount),
      integration_identifier: closepathIntegrationIdentifier(),
    });

    if (!session.url || !session.url.startsWith("https://checkout.stripe.com/")) {
      return back(origin, "unavailable");
    }

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    const kind = promoFailureKind(error, Boolean(discount));
    console.error(
      "Closepath checkout failed",
      discount
        ? kind === "code"
          ? "promotion code rejected"
          : "checkout session"
        : error instanceof Error
          ? error.message
          : "unknown",
    );
    return back(origin, kind);
  }
}
