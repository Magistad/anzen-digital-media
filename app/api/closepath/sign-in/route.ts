import { accountAccess } from "../../../../lib/closepath-access";
import { authenticate } from "../../../../lib/closepath-account";
import { issueSession, sessionSecret } from "../../../../lib/closepath-auth";
import { redirectTo, withSession } from "../../../../lib/closepath-response";
import { sameOrigin } from "../../../../lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function back(req: Request, error: string) {
  return redirectTo(req, `/closepath/sign-in?error=${error}`);
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return back(req, "invalid");
  if (!sessionSecret()) return back(req, "unconfigured");
  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  if (password.length < 1 || password.length > 200) return back(req, "invalid");

  try {
    const result = await authenticate(email, password);
    if (!result.ok) return back(req, result.reason);
    const access = await accountAccess(result.email, true);
    if (access.state === "unknown") return back(req, "billing");
    const token = issueSession(result.email);
    if (!token) return back(req, "unconfigured");
    return withSession(redirectTo(req, "/closepath"), token, req);
  } catch (error) {
    console.error("Closepath sign-in failed", error instanceof Error ? error.message : "unknown");
    return back(req, "unconfigured");
  }
}
