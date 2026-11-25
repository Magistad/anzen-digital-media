import { NextResponse } from "next/server";
import { nativePlatformFromUserAgent, nativeShellHidesStoreBilling } from "../../../../lib/native-shell";
import { requestOrigin, sameOrigin } from "../../../../lib/request-origin";
import { saveServiceIntake } from "../../../../lib/service-orders";
import { offerById, paidServiceSession } from "../../../../lib/services";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function back(origin: string, sessionId: string, error: string) {
  const url = new URL("/services/intake", origin);
  if (sessionId) url.searchParams.set("session_id", sessionId);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

export async function POST(req: Request) {
  const origin = requestOrigin(req);
  if (nativeShellHidesStoreBilling(nativePlatformFromUserAgent(req.headers.get("user-agent")))) {
    return NextResponse.redirect(new URL("/closepath/sign-in", origin), 303);
  }
  if (!sameOrigin(req)) return NextResponse.redirect(new URL("/services?checkout=unavailable", origin), 303);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.redirect(new URL("/services", origin), 303);
  }

  if (String(form.get("bot-field") ?? "").trim()) {
    return NextResponse.redirect(new URL("/services", origin), 303);
  }

  const sessionId = String(form.get("session_id") ?? "").trim();
  const stripe = getStripe();
  if (!stripe || !sessionId) return back(origin, sessionId, "missing");

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!paidServiceSession(session)) return back(origin, sessionId, "missing");
    const offer = offerById(session.metadata?.offer ?? "");
    if (!offer) return back(origin, sessionId, "missing");

    const answers: Record<string, string> = {};
    for (const field of offer.fields) answers[field.name] = String(form.get(field.name) ?? "");
    const result = await saveServiceIntake(
      session,
      answers,
      String(form.get("deliveryEmail") ?? ""),
      form.get("acknowledge") === "yes",
    );
    if (!result.ok) return back(origin, sessionId, result.error);
    return NextResponse.redirect(new URL(`/services/received?session_id=${encodeURIComponent(sessionId)}`, origin), 303);
  } catch (error) {
    console.error("Service intake failed", error instanceof Error ? error.message : "unknown");
    return back(origin, sessionId, "missing");
  }
}
