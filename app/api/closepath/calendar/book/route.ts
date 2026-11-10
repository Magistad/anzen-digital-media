import { NextResponse } from "next/server";
import { accountAccess } from "../../../../../lib/closepath-access";
import { closepathCalendarIcs } from "../../../../../lib/closepath-calendar-feed";
import { redirectTo, sessionFromRequest } from "../../../../../lib/closepath-response";
import { icsResponse } from "../../../../../lib/closepath-calendar-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A one-time download of the same dates the private feed serves. */
export async function GET(req: Request) {
  const session = sessionFromRequest(req);
  if (!session) return redirectTo(req, "/closepath/sign-in");
  const access = await accountAccess(session.email);
  if (access.state === "unknown") {
    return NextResponse.json({ error: "Closepath can’t confirm this subscription right now." }, { status: 503 });
  }
  if (access.state !== "open") return redirectTo(req, "/closepath");
  try {
    const ics = await closepathCalendarIcs(session.email);
    if (!ics) return redirectTo(req, "/closepath");
    return icsResponse(ics, "closepath.ics", "attachment");
  } catch (error) {
    console.error("Closepath calendar download failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "The calendar didn’t download." }, { status: 503 });
  }
}
