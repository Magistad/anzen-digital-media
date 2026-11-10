import { NextResponse } from "next/server";
import { accountAccess } from "../../../../lib/closepath-access";
import {
  calendarFeedTokenFor,
  enableCalendarFeed,
  revokeCalendarFeed,
  rotateCalendarFeed,
} from "../../../../lib/closepath-account";
import { feedPublicUrl } from "../../../../lib/closepath-calendar";
import { sessionFromRequest } from "../../../../lib/closepath-response";
import { requestOrigin, sameOrigin } from "../../../../lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FeedAction = "enable" | "rotate" | "revoke";

function isAction(value: unknown): value is FeedAction {
  return value === "enable" || value === "rotate" || value === "revoke";
}

async function openEmail(req: Request): Promise<{ email: string } | NextResponse> {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const session = sessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const access = await accountAccess(session.email);
  if (access.state === "ended") {
    return NextResponse.json({ error: "This subscription isn’t active." }, { status: 403 });
  }
  if (access.state !== "open") {
    return NextResponse.json({ error: "Closepath can’t confirm this subscription right now." }, { status: 503 });
  }
  return session;
}

function feedStatus(origin: string, token: string | null) {
  return { enabled: Boolean(token), url: token ? feedPublicUrl(origin, token) : null };
}

export async function GET(req: Request) {
  const opened = await openEmail(req);
  if (opened instanceof NextResponse) return opened;
  try {
    const token = await calendarFeedTokenFor(opened.email);
    return NextResponse.json(feedStatus(requestOrigin(req), token));
  } catch (error) {
    console.error("Closepath calendar read failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "The calendar link didn’t load." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const opened = await openEmail(req);
  if (opened instanceof NextResponse) return opened;
  const length = Number(req.headers.get("content-length") ?? "0");
  if (length > 1_000) return NextResponse.json({ error: "Unreadable request." }, { status: 413 });
  const raw = await req.text();
  if (raw.length > 1_000) return NextResponse.json({ error: "Unreadable request." }, { status: 413 });
  let action: FeedAction;
  try {
    const body = JSON.parse(raw) as { action?: unknown };
    if (!isAction(body.action)) return NextResponse.json({ error: "Unreadable request." }, { status: 400 });
    action = body.action;
  } catch {
    return NextResponse.json({ error: "Unreadable request." }, { status: 400 });
  }

  try {
    if (action === "revoke") {
      await revokeCalendarFeed(opened.email);
      return NextResponse.json(feedStatus(requestOrigin(req), null));
    }
    const token =
      action === "rotate" ? await rotateCalendarFeed(opened.email) : await enableCalendarFeed(opened.email);
    return NextResponse.json(feedStatus(requestOrigin(req), token));
  } catch (error) {
    console.error("Closepath calendar update failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "The calendar link didn’t save." }, { status: 503 });
  }
}
