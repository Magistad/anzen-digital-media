import { NextResponse } from "next/server";
import { accountAccess } from "../../../../lib/closepath-access";
import { emailForCalendarToken } from "../../../../lib/closepath-account";
import { closepathCalendarIcs } from "../../../../lib/closepath-calendar-feed";
import { icsResponse } from "../../../../lib/closepath-calendar-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function tokenFromParam(param: string): string | null {
  const token = param.endsWith(".ics") ? param.slice(0, -4) : param;
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

function missing(): NextResponse {
  return new NextResponse("Not found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

/** Private calendar feed. The token is the secret. Calendar apps do not send the sign-in cookie. */
export async function GET(_req: Request, context: { params: { token: string } }) {
  const token = tokenFromParam(context.params.token ?? "");
  if (!token) return missing();
  try {
    const email = await emailForCalendarToken(token);
    if (!email) return missing();
    const access = await accountAccess(email);
    if (access.state === "unknown") {
      return new NextResponse("Calendar is unavailable.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" },
      });
    }
    if (access.state !== "open") return missing();
    const ics = await closepathCalendarIcs(email);
    if (!ics) return missing();
    return icsResponse(ics, "closepath.ics", "inline");
  } catch (error) {
    console.error("Closepath calendar feed failed", error instanceof Error ? error.message : "unknown");
    return new NextResponse("Calendar is unavailable.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" },
    });
  }
}
