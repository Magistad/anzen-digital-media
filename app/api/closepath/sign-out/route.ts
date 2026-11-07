import { redirectTo, withoutSession } from "../../../../lib/closepath-response";
import { sameOrigin } from "../../../../lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const res = redirectTo(req, sameOrigin(req) ? "/closepath/sign-in" : "/");
  return withoutSession(res, req);
}
