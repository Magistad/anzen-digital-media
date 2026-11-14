import { NextResponse } from "next/server";
import { ownerMayManageBilling } from "../../../../lib/closepath-access";
import { findAccount } from "../../../../lib/closepath-account";
import { nativePlatformFromUserAgent, nativeShellHidesStoreBilling } from "../../../../lib/native-shell";
import { redirectTo, sessionFromRequest } from "../../../../lib/closepath-response";
import { requestOrigin, sameOrigin } from "../../../../lib/request-origin";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (nativeShellHidesStoreBilling(nativePlatformFromUserAgent(req.headers.get("user-agent")))) {
    return redirectTo(req, "/closepath/sign-in");
  }
  if (!sameOrigin(req)) return redirectTo(req, "/");
  const session = sessionFromRequest(req);
  if (!session) return redirectTo(req, "/closepath/sign-in");

  const stripe = getStripe();
  const account = await findAccount(session.email).catch(() => null);
  const customerId = account?.stripeCustomerId ?? null;
  if (!stripe || !customerId || !ownerMayManageBilling({ signedIn: true, customerId })) {
    return redirectTo(req, "/closepath?billing=unavailable");
  }

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${requestOrigin(req)}/closepath`,
    });
    if (!portal.url) return redirectTo(req, "/closepath?billing=unavailable");
    return NextResponse.redirect(portal.url, 303);
  } catch (error) {
    console.error(
      "Closepath billing portal failed",
      error instanceof Error ? error.message : "unknown",
    );
    return redirectTo(req, "/closepath?billing=unavailable");
  }
}
