import { NextResponse } from "next/server";
import { nativePlatformFromUserAgent, nativeShellHidesStoreBilling } from "../../../../lib/native-shell";
import { requestOrigin, sameOrigin } from "../../../../lib/request-origin";
import {
  isServicePrice,
  offerById,
  serviceCheckoutFields,
  serviceIntegrationIdentifier,
  servicePriceId,
} from "../../../../lib/services";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function offerField(req: Request): Promise<string> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.includes("application/x-www-form-urlencoded") && !type.includes("multipart/form-data")) return "";
  try {
    const form = await req.formData();
    return String(form.get("offer") ?? "");
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const origin = requestOrigin(req);
  if (nativeShellHidesStoreBilling(nativePlatformFromUserAgent(req.headers.get("user-agent")))) {
    return NextResponse.redirect(new URL("/closepath/sign-in", origin), 303);
  }

  const offer = offerById(await offerField(req));
  const back = (path: string) => NextResponse.redirect(new URL(`${path}?checkout=unavailable`, origin), 303);
  if (!offer) return back("/services");
  if (!sameOrigin(req)) return back(offer.path);

  const stripe = getStripe();
  const priceId = servicePriceId(offer);
  if (!stripe || !priceId) {
    console.error("Service checkout failed", `${offer.env} is not set`);
    return back(offer.path);
  }

  try {
    const price = await stripe.prices.retrieve(priceId);
    if (!isServicePrice(offer, price)) {
      console.error("Service checkout failed", `${offer.env} does not match ${offer.name}`);
      return back(offer.path);
    }
  } catch {
    console.error("Service checkout failed", "price lookup");
    return back(offer.path);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      ...serviceCheckoutFields(offer, priceId, origin),
      integration_identifier: serviceIntegrationIdentifier(),
    });
    if (!session.url || !session.url.startsWith("https://checkout.stripe.com/")) return back(offer.path);
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("Service checkout failed", error instanceof Error ? error.message : "unknown");
    return back(offer.path);
  }
}
