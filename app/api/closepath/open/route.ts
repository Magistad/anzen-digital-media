import { closepathDownloadAccess } from "../../../../lib/closepath-access";
import {
  checkoutAccountAction,
  createAccount,
  findAccount,
  resetAccountPassword,
} from "../../../../lib/closepath-account";
import { issueSession, sessionSecret } from "../../../../lib/closepath-auth";
import { normalizeEmail } from "../../../../lib/closepath-model";
import { redirectTo, sessionFromRequest, withSession } from "../../../../lib/closepath-response";
import { sameOrigin } from "../../../../lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function back(req: Request, sessionId: string, error: string) {
  const params = new URLSearchParams({ session_id: sessionId, error });
  return redirectTo(req, `/products/closepath/success?${params.toString()}`);
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return redirectTo(req, "/products/closepath");
  const form = await req.formData();
  const sessionId = String(form.get("session_id") ?? "");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const reset = form.get("reset") === "1";

  if (!sessionSecret()) return back(req, sessionId, "unconfigured");
  if (password.length < 8 || password.length > 200) return back(req, sessionId, "short");
  if (password !== confirm) return back(req, sessionId, "mismatch");

  const access = await closepathDownloadAccess(sessionId);
  if (access.state !== "paid") return back(req, sessionId, "unpaid");

  const email = normalizeEmail(String(form.get("email") ?? ""));
  const checkoutEmail = access.email ? normalizeEmail(access.email) : null;
  if (!email || (checkoutEmail && checkoutEmail !== email)) return back(req, sessionId, "email");

  try {
    const billing = {
      stripeSubscriptionId: access.subscriptionId,
      stripeCustomerId: access.customerId,
    };
    const existing = await findAccount(email);
    const action = checkoutAccountAction({
      accountExists: Boolean(existing),
      accountEmail: existing?.email ?? email,
      checkoutEmail,
      signedInEmail: sessionFromRequest(req)?.email ?? null,
      emailVerified: false,
      resetRequested: reset,
    });
    if (action === "refuse") return back(req, sessionId, "exists");
    if (action === "reset") {
      await resetAccountPassword(email, password, sessionId, billing);
    } else {
      await createAccount({ email, password, stripeSessionId: sessionId, ...billing });
    }
    const token = issueSession(email);
    if (!token) return back(req, sessionId, "unconfigured");
    return withSession(redirectTo(req, "/closepath"), token, req);
  } catch (error) {
    console.error("Closepath open failed", error instanceof Error ? error.message : "unknown");
    return back(req, sessionId, "failed");
  }
}
